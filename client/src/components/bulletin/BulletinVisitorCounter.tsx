/**
 * BulletinVisitorCounter — E2 公佈欄風格訪客計數器
 *
 * 設計：一張橫向便利貼，含：
 * - 左側：眼睛 emoji + 大數字（動畫過渡）
 * - 中央：訪客人次說明
 * - 右側：下一個里程碑進度（細條 + 進度）
 * - 頂部：藍色圖釘 + 右上膠帶裝飾
 *
 * 邏輯：完全重用既有 VisitorCounter 的增量/訂閱邏輯
 *  - 30 分鐘節流 + sessionStorage 防重複
 *  - onSnapshot 即時更新
 *  - 降級到 localStorage
 */

import { useEffect, useRef, useState } from 'react';
import { animate, m as motion, useMotionValue, useTransform } from 'framer-motion';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

interface VisitorStats {
  totalVisits: number;
  dailyVisits?: Record<string, number>;
  lastVisitAt?: string | null;
}

/**
 * 追蹤訪客 context（地理 / 裝置類型 / 來源）：
 *   - localStorage：保留為「這台瀏覽器自己的」歷史紀錄（離線降級用）
 *   - Firestore `analytics/visitorContext`：全站累計，後台儀表板讀這份
 *
 * 全程使用 HTTPS 端點（ipapi.co 免費版無需 token，每天 1000 req 額度足夠）
 */
async function incrementServerStat(category: 'device' | 'referrer' | 'geo', key: string) {
  if (!key) return;
  try {
    const { db, isFirebaseAvailable } = await import('@/lib/firebase');
    if (!isFirebaseAvailable() || !db) return;
    const { doc, setDoc, increment, serverTimestamp } = await import('firebase/firestore');
    const fieldName =
      category === 'device' ? 'deviceStats' : category === 'referrer' ? 'referrerStats' : 'geoStats';
    const ref = doc(db, 'analytics', 'visitorContext');
    // 用 setDoc + merge 處理「文件不存在」情境；nested map 中的 increment() sentinel 會被正確套用
    await setDoc(
      ref,
      {
        [fieldName]: { [key]: increment(1) },
        lastUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    // 寫不到 Firestore 不致命，至少 localStorage 還在
    console.warn(`[trackVisitorContext] Firestore ${category}/${key} 寫入失敗:`, err);
  }
}

async function trackVisitorContext() {
  // 1. 裝置類型
  let deviceKey = 'desktop';
  try {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    deviceKey = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const stats = JSON.parse(localStorage.getItem('visitorDeviceStats') || '{"desktop":0,"mobile":0,"tablet":0}');
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
      const res2 = await fetch('https://ipinfo.io/json', { signal: AbortSignal.timeout(3000) });
      if (res2.ok) {
        const d = await res2.json();
        geoData = { city: d.city, region: d.region, country_name: d.country, country: d.country };
      }
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
      // Firestore 累計（key 是城市中文名）
      await incrementServerStat('geo', location);
      console.log('📍 地理定位成功 (HTTPS):', location);
    }
  } catch (e) {
    console.warn('[BulletinVisitorCounter] 地理定位失敗:', e);
  }
}

// 里程碑
const MILESTONES = [100, 500, 1000, 2000, 5000, 10000, 50000, 100000];

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [motionValue, value]);

  return <motion.span>{display}</motion.span>;
}

export function BulletinVisitorCounter() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [justUpdated, setJustUpdated] = useState(false);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        const { doc, onSnapshot } = await import('firebase/firestore');

        // 1. 防重複增量（與原 VisitorCounter 一致）
        if (!hasIncrementedRef.current) {
          hasIncrementedRef.current = true;
          const sessionVisited = sessionStorage.getItem('sessionVisited');
          const lastVisitTime = parseInt(localStorage.getItem('lastVisitTimestamp') || '0');
          const today = new Date().toISOString().split('T')[0];
          const lastVisitDate = localStorage.getItem('lastVisitDate') || '';
          const currentTime = Date.now();
          const MIN_VISIT_INTERVAL = 30 * 60 * 1000;

          const shouldIncrement =
            !sessionVisited ||
            currentTime - lastVisitTime > MIN_VISIT_INTERVAL ||
            lastVisitDate !== today;

          sessionStorage.setItem('sessionVisited', 'true');

          if (shouldIncrement) {
            localStorage.setItem('lastVisitTimestamp', currentTime.toString());
            localStorage.setItem('lastVisitDate', today);
            // 確保有身份（未登入訪客自動匿名登入）才能寫 Firestore
            try {
              const { ensureSignedIn } = await import('@/lib/authService');
              await ensureSignedIn();
            } catch (err) {
              console.warn('[BulletinVisitorCounter] ensureSignedIn 失敗:', err);
            }
            const { incrementVisitorCount } = await import('@/lib/firestoreService');
            await incrementVisitorCount().catch((err) =>
              console.warn('[BulletinVisitorCounter] 增量失敗:', err)
            );
            // 🌍 異步追蹤地理 / 裝置 / 來源（不影響主流程）
            trackVisitorContext().catch((err) =>
              console.warn('[BulletinVisitorCounter] context 追蹤失敗:', err)
            );
          }
        }

        // 2. 即時監聽
        if (isFirebaseAvailable() && db) {
          unsubscribe = onSnapshot(
            doc(db, 'visitorStats', 'global'),
            (snapshot) => {
              if (cancelled) return;
              if (snapshot.exists()) {
                const data = snapshot.data() as VisitorStats;
                setTotalVisits((prev) => {
                  if (prev !== 0 && prev !== data.totalVisits) {
                    setJustUpdated(true);
                    setTimeout(() => setJustUpdated(false), 1800);
                  }
                  return data.totalVisits;
                });
                setLoading(false);
                // 本地快取供離線使用
                try {
                  localStorage.setItem('totalVisits', String(data.totalVisits));
                } catch { /* ignore */ }
              }
            },
            (err) => {
              console.warn('[BulletinVisitorCounter] onSnapshot 失敗:', err);
              loadFromCache();
            }
          );
        } else {
          loadFromCache();
        }
      } catch (err) {
        console.warn('[BulletinVisitorCounter] 初始化失敗:', err);
        loadFromCache();
      }
    })();

    function loadFromCache() {
      setTotalVisits(parseInt(localStorage.getItem('totalVisits') || '0', 10));
      setLoading(false);
    }

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 計算下一個里程碑 + 進度百分比
  const nextMilestone = MILESTONES.find((m) => m > totalVisits) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestone =
    [...MILESTONES].reverse().find((m) => m <= totalVisits) ?? 0;
  const progress =
    nextMilestone > prevMilestone
      ? Math.min(
          100,
          Math.max(0, ((totalVisits - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
        )
      : 0;

  return (
    <div
      className="bulletin-visitor-counter sticker-card"
      data-tour="visitor-counter"
      style={{
        position: 'relative',
        background: tokens.note.yellow,
        border: '2.5px solid #1a1a1a',
        borderRadius: 10,
        padding: '14px 18px',
        boxShadow: '4px 4px 0 rgba(0,0,0,.22)',
        transform: 'rotate(-0.8deg)',
        maxWidth: 520,
        fontFamily: tokens.font.tc,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
      role="status"
      aria-live="polite"
    >
      <Pin
        color={tokens.pin[1]}
        size={16}
        style={{ top: -8, left: '50%', marginLeft: -8, zIndex: 10 }}
      />

      {/* 左：眼睛 + 數字 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          transition: 'transform .3s ease',
          transform: justUpdated ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <div
          style={{
            fontSize: 32,
            lineHeight: 1,
            filter: justUpdated ? 'drop-shadow(0 0 6px rgba(255,200,0,.8))' : 'none',
          }}
        >
          👀
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: tokens.muted2,
              letterSpacing: '0.2em',
              fontFamily: tokens.font.en,
              fontWeight: 700,
              marginBottom: 2,
              lineHeight: 1,
            }}
          >
            VISITORS
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: tokens.ink,
              fontFamily: tokens.font.en,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {loading ? '—' : <AnimatedNumber value={totalVisits} />}
          </div>
        </div>
      </div>

      {/* 右：里程碑進度 */}
      <div style={{ flex: 1, minWidth: 0 }} className="bulletin-visitor-progress">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: 10.5,
            color: tokens.muted2,
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          <span>下個里程碑</span>
          <span style={{ fontFamily: tokens.font.en, fontWeight: 900, color: tokens.accent }}>
            🏆 {nextMilestone.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            height: 8,
            background: 'rgba(0,0,0,.12)',
            borderRadius: 999,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,.18)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.red})`,
              borderRadius: 999,
              transition: 'width .8s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: '1px 0 0 rgba(0,0,0,.15)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 9.5,
            color: tokens.muted,
            marginTop: 3,
            fontFamily: tokens.font.en,
            fontWeight: 600,
          }}
        >
          <span>{prevMilestone.toLocaleString()}</span>
          <span>{Math.floor(progress)}%</span>
          <span>{nextMilestone.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
