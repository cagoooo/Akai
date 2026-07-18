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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { invokePublicAnalytics } from '@/lib/publicAnalyticsService';

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

const HOME_ENGAGEMENT_KEY = 'akai_home_engagement_session_v1';
const ENGAGEMENT_DEDUP_PREFIX = 'akai_engagement_notified_v2:';

type EngagementEvent =
  | {
      type: 'tool_click';
      toolId: number;
      toolTitle: string;
      toolCategory?: string;
      targetUrl?: string;
      source?: string;
      requireHomeEntry?: boolean;
    }
  | {
      type: 'blog_read';
      slug: string;
      title: string;
      readingMinutes?: number;
      relatedTools?: string;
      source?: string;
      requireHomeEntry?: boolean;
    };

export function markHomeEntryForEngagementNotifications() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(HOME_ENGAGEMENT_KEY, '1');
  } catch {
    /* ignore */
  }
}

function hasHomeEntryForEngagementNotifications(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(HOME_ENGAGEMENT_KEY) === '1';
  } catch {
    return false;
  }
}

function hasNotifiedEngagement(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const storageKey = `${ENGAGEMENT_DEDUP_PREFIX}${key}`;
  try {
    return sessionStorage.getItem(storageKey) === '1';
  } catch {
    return false;
  }
}

function markEngagementNotified(key: string) {
  if (typeof window === 'undefined') return;
  const storageKey = `${ENGAGEMENT_DEDUP_PREFIX}${key}`;
  try {
    sessionStorage.setItem(storageKey, '1');
  } catch {
    /* ignore */
  }
}

export async function notifyEngagementAfterHomeEntry(event: EngagementEvent) {
  console.log('[engagement notify] 觸發事件:', event);
  
  if (!db) {
    console.warn('[engagement notify] db 不存在');
    return;
  }
  const requiresHomeEntry = event.requireHomeEntry ?? false;
  if (requiresHomeEntry && !hasHomeEntryForEngagementNotifications()) {
    console.warn('[engagement notify] 略過：沒有 HOME_ENGAGEMENT_KEY 標記');
    return;
  }

  const dedupKey =
    event.type === 'tool_click'
      ? `tool:${event.toolId}:${event.source || 'home'}`
      : `blog:${event.slug}`;
  const bypassDedup =
    (event.type === 'tool_click' && event.source === 'tool_detail_use') ||
    (event.type === 'blog_read' && event.source === 'tool_detail_intro');
  const shouldMarkDedup =
    !bypassDedup || (event.type === 'blog_read' && event.source === 'tool_detail_intro');

  if (!bypassDedup && hasNotifiedEngagement(dedupKey)) {
    console.warn('[engagement notify] 略過：此事件在同 session 內已被去重:', dedupKey);
    return;
  }

  try {
    console.log('[engagement notify] 確保登入並寫入 Firestore...');
    const { ensureSignedIn } = await import('@/lib/authService');
    await ensureSignedIn();

    const eventPayload = { ...event };
    delete eventPayload.requireHomeEntry;
    const docRef = await addDoc(collection(db, 'engagementEvents'), {
      ...eventPayload,
      path: window.location.pathname,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent.slice(0, 220),
      createdAt: serverTimestamp(),
    });
    if (shouldMarkDedup) markEngagementNotified(dedupKey);
    console.log('[engagement notify] 寫入 Firestore 成功，ID:', docRef.id);
  } catch (err) {
    console.error('[engagement notify] 寫入失敗:', err);
    if (import.meta.env.DEV) console.warn('[engagement notify]', err);
  }
}

// ── 推薦精靈成效聚合（P1-6：分眾推薦 dashboard 的資料來源） ──────────────
// 為什麼用「單一聚合 doc + nested increment」而非寫 raw event：
//   - 精靈完成頻率低，單 doc 綽綽有餘（segments ~22、tools ~116、都在 1MB 內）
//   - dashboard 只要 getDoc 一次就能算 CTR，不必掃幾千筆 raw event 再前端 aggregate
//   - client 不直接寫 Firestore；recordPublicAnalytics 驗證事件後由 Admin SDK 原子遞增
// 結構：analytics/recoStats
//   { totalImpressions, totalClicks, updatedAt,
//     tools: { [toolId]: { imp, clk } },
//     segments: { [segment]: { imp, clk } },
//     slotClicks: { [slot]: n }, painClicks,
//     daily: { [YYYY-MM-DD]: { imp, clk, painClk } } }  ← P0-D 時間維度（事件層級每日總量）
export type RecommendationSurface = 'wizard' | 'strip';
export type RecommendationBatch = 'initial' | 'reshuffled';
export type AudienceSelectionDimension = 'audience' | 'schoolLevels' | 'teacherRoles' | 'departments';
export type AudienceFunnelEvent = 'opened' | 'audienceSelected' | 'schoolLevelSelected' | 'teacherRoleSelected' | 'departmentSelected' | 'painPointsConfirmed' | 'resultsShown' | 'dismissed' | 'reshuffled';

async function writeRecoEvent(payload: Record<string, unknown>) {
  try {
    await invokePublicAnalytics({ kind: 'recommendation', ...payload });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[reco stats] 寫入失敗:', err);
  }
}

/** 僅寫入匿名加總，以找出精靈流程的流失點；不保存個人設定或帳號資料。 */
export function recordAudienceFunnelEvent(event: AudienceFunnelEvent, step?: string) {
  return writeRecoEvent({ action: 'funnel', event, ...(step ? { step } : {}) });
}

export function recordAudienceSelection(dimension: AudienceSelectionDimension, value: string) {
  if (!value) return Promise.resolve();
  return writeRecoEvent({ action: 'selection', dimension, value });
}

export function recordAudiencePainPointSelection(painPoints: string[]) {
  return writeRecoEvent({ action: 'painSelection', painPoints });
}

/** 推薦結果曝光：每個被展示的工具 +1 imp，該 segment +1 imp，總曝光 +1，今日 bucket +1 imp */
export async function recordRecoImpression(params: { segment: string; toolIds: number[]; surface?: RecommendationSurface; batch?: RecommendationBatch }) {
  if (!params.segment || params.toolIds.length === 0) return;
  try {
    await invokePublicAnalytics({ kind: 'recommendation', action: 'impression', ...params });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[reco stats] impression 寫入失敗:', err);
  }
}

/** 推薦點擊：該工具 +1 clk，該 segment +1 clk，該 slot +1，總點擊 +1，今日 bucket +1 clk */
export async function recordRecoClick(params: { segment: string; toolId: number; slot: string; matchedPains: number; painPoints?: string[]; surface?: RecommendationSurface; batch?: RecommendationBatch }) {
  if (!params.segment) return;
  try {
    await invokePublicAnalytics({ kind: 'recommendation', action: 'click', ...params });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[reco stats] click 寫入失敗:', err);
  }
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
    await invokePublicAnalytics({ kind: 'toolIndexQuery', query: q, resultCount });
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
    const keepsDecimal = metric.name === 'CLS';
    await invokePublicAnalytics({
      kind: 'webVital',
      metricId: metric.id,
      name: metric.name,
      value: keepsDecimal ? metric.value : Math.round(metric.value),
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: keepsDecimal ? metric.delta : Math.round(metric.delta),
      navigationType: metric.navigationType,
      path: window.location.pathname,
      ua: navigator.userAgent.slice(0, 200), // 截斷避免 doc 過大
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
