/**
 * 整合分析模組 — 一份檔處理 (1) Web Vitals RUM 寫 Firestore (2) gtag 事件上報
 *
 * 為什麼放一起：
 *   - 兩者都是「使用者互動觀測」基礎建設
 *   - 共用 gtag 全域呼叫包裝
 *   - 後續加新 metric / event 只要改這個檔
 *
 * 用法：
 *   - 在 main.tsx import `initWebVitals()` 自動啟動 RUM
 *   - 在元件 import `trackEvent('tool_click', {...})` 上報互動
 *
 * Firestore schema：
 *   analytics/webVitals/{YYYY-MM-DD}/{metricId}
 *     { name, value, rating, path, ua, ts }
 */

import type { Metric } from 'web-vitals';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ── gtag wrapper ─────────────────────────────────────────────
type GtagFn = (command: 'event' | 'config' | 'js' | 'set', ...args: unknown[]) => void;

function getGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof fn === 'function' ? fn : null;
}

/**
 * 上報 GA event。
 * GA ID 在 index.html 由 inject.py 在 CI 注入；本地 dev 環境也安全（gtag undef 自動 noop）。
 *
 * 用例：
 *   trackEvent('tool_click', { tool_id: 81, tool_title: '教學駕駛艙' })
 *   trackEvent('blog_read', { slug: 'cockpit-81-info-tech-class' })
 *   trackEvent('tool_index_search', { query: '水的三態', result_count: 3 })
 */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  try {
    const gtag = getGtag();
    if (gtag) gtag('event', name, params);
    // 開發環境額外印一行，方便確認 event 真的有發
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.debug('[analytics]', name, params);
    }
  } catch {
    /* 不要因為 analytics 失敗影響主流程 */
  }
}

// ── Tool index 搜尋詞紀錄（Firestore，用於 build-time 回灌熱門 query） ────
// 路徑：analytics/toolIndexQueries/{queryHash}
//   { query, count, lastUsedAt, lastResultCount }
// 為什麼用 hash 當 doc id？避免「不能含 / 等特殊字元」的 Firestore key 限制，且天然 deduplication

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

/**
 * 記錄一筆 ToolIndexAI 搜尋詞到 Firestore，用 count 累加。
 * 同 query 只算一次（簡單做法：用 hash 當 doc id，setDoc + merge increment）。
 */
export async function logToolIndexQuery(query: string, resultCount: number) {
  if (!db) return;
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return; // 太短不記
  try {
    const { doc: docRef, getDoc, setDoc: writeDoc, increment } = await import('firebase/firestore');
    const ref = docRef(db, 'analytics', 'toolIndexQueries', 'queries', simpleHash(q));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await writeDoc(ref, {
        count: increment(1),
        lastUsedAt: new Date().toISOString(),
        lastResultCount: resultCount,
      }, { merge: true });
    } else {
      await writeDoc(ref, {
        query: q,
        count: 1,
        firstSeenAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        lastResultCount: resultCount,
      });
    }
  } catch {
    /* 失敗不打擾使用者 */
  }
}

// ── Web Vitals RUM → Firestore ────────────────────────────────

const SAMPLE_RATE = 0.25; // 只取樣 25%（控制 Firestore 寫入量，每月 < 50K 寫入）
const sessionShouldSample = Math.random() < SAMPLE_RATE;

let sentMetrics = new Set<string>(); // 同一頁不重複送同個 metric

async function sendMetricToFirestore(metric: Metric) {
  if (!db) return;
  if (!sessionShouldSample) return;
  if (sentMetrics.has(metric.id)) return;
  sentMetrics.add(metric.id);

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const colRef = collection(db, 'analytics', 'webVitals', today);
    const docRef = doc(colRef, metric.id);
    await setDoc(docRef, {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: Math.round(metric.delta),
      navigationType: metric.navigationType,
      path: window.location.pathname,
      ua: navigator.userAgent.slice(0, 200), // 截斷避免 doc 過大
      ts: serverTimestamp(),
    });
  } catch {
    /* 寫入失敗就放棄，不打擾使用者 */
  }
}

function sendMetricToGtag(metric: Metric) {
  trackEvent('web_vital', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    page_path: window.location.pathname,
  });
}

/**
 * 初始化 Web Vitals 收集。在 main.tsx 開機後呼叫一次。
 * 同時送到 GA（取樣全部）跟 Firestore（取樣 25%）。
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return;
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');
    const handler = (metric: Metric) => {
      sendMetricToGtag(metric);
      // Firestore 寫入用 setTimeout 推遲，不要影響使用者體驗
      setTimeout(() => { void sendMetricToFirestore(metric); }, 0);
    };
    onCLS(handler);
    onINP(handler);
    onLCP(handler);
    onFCP(handler);
    onTTFB(handler);
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[webVitals] 初始化失敗', err);
  }
}
