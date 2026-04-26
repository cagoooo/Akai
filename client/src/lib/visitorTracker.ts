/**
 * 全站訪客追蹤（與頁面無關）
 *
 * 設計：把「增加 totalVisits + 寫 analytics/visitorContext」從
 *       BulletinVisitorCounter 元件中抽出來，改在 App 啟動時呼叫一次。
 *
 * 為什麼要抽出來：
 *   原本邏輯綁在 BulletinVisitorCounter，只在首頁渲染時才執行。
 *   訪客直接打開 /admin、/tool/:id、/wish 都不會被計入，
 *   結果儀表板看到的 totalVisits 跟 geo / device / referrer 落差很大。
 *
 * 節流：30 分鐘 + sessionStorage 防重複（與原本一致），確保同一位訪客
 *       的同一次造訪只記一次。
 */

const MIN_VISIT_INTERVAL = 30 * 60 * 1000; // 30 分鐘

let inFlight: Promise<void> | null = null;
let alreadyRanThisLoad = false;

/**
 * 主要追蹤入口（App 啟動時呼叫一次即可）
 * - 確保有 Firebase 身份（自動匿名登入）
 * - 依節流規則決定是否增加 totalVisits
 * - 同步累計 analytics/visitorContext（地理 / 裝置 / 來源）
 */
export async function trackPageVisit(): Promise<void> {
  if (alreadyRanThisLoad) return; // 同一個 SPA load 內不重複
  alreadyRanThisLoad = true;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      // 1. 計算是否需要 increment（30min throttle + 跨日重計）
      const sessionVisited = sessionStorage.getItem('sessionVisited');
      const lastVisitTime = parseInt(localStorage.getItem('lastVisitTimestamp') || '0');
      const today = new Date().toISOString().split('T')[0];
      const lastVisitDate = localStorage.getItem('lastVisitDate') || '';
      const currentTime = Date.now();

      const shouldIncrement =
        !sessionVisited ||
        currentTime - lastVisitTime > MIN_VISIT_INTERVAL ||
        lastVisitDate !== today;

      sessionStorage.setItem('sessionVisited', 'true');
      if (!shouldIncrement) return;

      localStorage.setItem('lastVisitTimestamp', currentTime.toString());
      localStorage.setItem('lastVisitDate', today);

      // 2. 確保有身份（未登入自動匿名）
      try {
        const { ensureSignedIn } = await import('@/lib/authService');
        await ensureSignedIn();
      } catch (err) {
        console.warn('[trackPageVisit] ensureSignedIn 失敗:', err);
      }

      // 3. 增加 totalVisits（Firestore visitorStats/global）
      try {
        const { incrementVisitorCount } = await import('@/lib/firestoreService');
        await incrementVisitorCount();
      } catch (err) {
        console.warn('[trackPageVisit] incrementVisitorCount 失敗:', err);
      }

      // 4. 累計 context（地理 / 裝置 / 來源）
      try {
        await trackVisitorContext();
      } catch (err) {
        console.warn('[trackPageVisit] trackVisitorContext 失敗:', err);
      }
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

// ────────────────────────────────────────────────────────────
// trackVisitorContext：與原 BulletinVisitorCounter 中的邏輯一致
// 三類同時寫 localStorage（離線 fallback）+ Firestore（全站累計）
// ────────────────────────────────────────────────────────────
async function incrementServerStat(category: 'device' | 'referrer' | 'geo', key: string) {
  if (!key) return;
  try {
    const { db, isFirebaseAvailable } = await import('@/lib/firebase');
    if (!isFirebaseAvailable() || !db) return;
    const { doc, setDoc, increment, serverTimestamp } = await import('firebase/firestore');
    const fieldName =
      category === 'device' ? 'deviceStats' : category === 'referrer' ? 'referrerStats' : 'geoStats';
    const ref = doc(db, 'analytics', 'visitorContext');
    await setDoc(
      ref,
      {
        [fieldName]: { [key]: increment(1) },
        lastUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`[trackPageVisit] Firestore ${category}/${key} 寫入失敗:`, err);
  }
}

async function trackVisitorContext(): Promise<void> {
  // 1. 裝置類型
  let deviceKey = 'desktop';
  try {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    deviceKey = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const stats = JSON.parse(
      localStorage.getItem('visitorDeviceStats') || '{"desktop":0,"mobile":0,"tablet":0}'
    );
    stats[deviceKey] = (stats[deviceKey] || 0) + 1;
    localStorage.setItem('visitorDeviceStats', JSON.stringify(stats));
  } catch { /* ignore */ }
  await incrementServerStat('device', deviceKey);

  // 2. 來源 Referrer
  let referrerKey = 'direct';
  try {
    const referrer = document.referrer;
    if (referrer) {
      const hostname = new URL(referrer).hostname.toLowerCase();
      if (['google', 'bing', 'yahoo', 'baidu', 'duckduckgo'].some((s) => hostname.includes(s)))
        referrerKey = 'search';
      else if (['facebook', 'twitter', 'instagram', 'line.me', 't.co'].some((s) => hostname.includes(s)))
        referrerKey = 'social';
      else if (['mail.', 'gmail.'].some((s) => hostname.includes(s))) referrerKey = 'email';
      else if (hostname === window.location.hostname) referrerKey = 'direct';
      else referrerKey = 'external';
    }
    const stats = JSON.parse(
      localStorage.getItem('visitorReferrerStats') ||
        '{"direct":0,"search":0,"social":0,"email":0,"external":0}'
    );
    stats[referrerKey] = (stats[referrerKey] || 0) + 1;
    localStorage.setItem('visitorReferrerStats', JSON.stringify(stats));
  } catch { /* ignore */ }
  await incrementServerStat('referrer', referrerKey);

  // 3. 地理定位（HTTPS）
  // 主：ipapi.co (1k/天免費，無需 token)
  // 備：ipinfo.io (50k/月免費，無需 token)
  try {
    let geoData: { city?: string; region?: string; country_name?: string; country?: string } | null = null;
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (res.ok) geoData = await res.json();
    } catch { /* fallback below */ }

    if (!geoData) {
      try {
        const res2 = await fetch('https://ipinfo.io/json', { signal: AbortSignal.timeout(3000) });
        if (res2.ok) {
          const d = await res2.json();
          geoData = { city: d.city, region: d.region, country_name: d.country, country: d.country };
        }
      } catch { /* both failed */ }
    }

    if (geoData) {
      const taiwanCityMap: Record<string, string> = {
        Taipei: '台北市',
        'New Taipei': '新北市',
        Taichung: '台中市',
        Kaohsiung: '高雄市',
        Taoyuan: '桃園市',
        Tainan: '台南市',
        Hsinchu: '新竹',
        Keelung: '基隆市',
        Chiayi: '嘉義',
        Yilan: '宜蘭',
        Hualien: '花蓮',
        Taitung: '台東',
        TW: '台灣',
        Taiwan: '台灣',
      };
      let location = geoData.city || geoData.region || geoData.country_name || geoData.country || '其他';
      if (taiwanCityMap[location]) location = taiwanCityMap[location];

      const stats = JSON.parse(localStorage.getItem('visitorGeoStats') || '{}');
      stats[location] = (stats[location] || 0) + 1;
      localStorage.setItem('visitorGeoStats', JSON.stringify(stats));
      await incrementServerStat('geo', location);
      console.log('📍 地理定位成功 (HTTPS):', location);
    } else {
      // 即使 geo API 失敗，也用 'unknown' 記一筆，避免 server geoStats 永遠空著
      await incrementServerStat('geo', 'unknown');
    }
  } catch (e) {
    console.warn('[trackPageVisit] 地理定位失敗:', e);
    await incrementServerStat('geo', 'unknown');
  }
}
