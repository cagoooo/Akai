import { trackEvent } from './analytics';

/**
 * 工具使用計數（incrementToolClick）失敗的量測：只送 GA 事件，不送 Sentry、不發告警。
 *
 * 背景：2026-10-10 iPhone Safari 按「立即使用」會先開新分頁，原分頁被切到背景，
 * 送出中的計數請求可能被 iOS 中斷（程式會退回本機計數，伺服器端少計 1 次）。
 * 要先知道「多常發生、是不是因為切到背景」才決定要不要改流程。
 *
 * 讀法（GA4 → 報表 → 事件）：
 *   tool_track_failed_hidden   失敗，且呼叫期間分頁曾被切到背景
 *   tool_track_failed_visible  失敗，但分頁一直在前景（多半是網路或 App Check 問題）
 * 成功次數以 Cloud Logging 的 incrementtoolclick 為準（GA 可能被擋，只會少算）。
 */

export type TrackFailureReason = 'app_check' | 'network' | 'other';

export function classifyTrackFailure(err: unknown): TrackFailureReason {
  if (!(err instanceof Error)) return 'other';
  // firestoreService 在 App Check 沒通過時自己丟的錯
  if (err.message.startsWith('App Check 尚未通過')) return 'app_check';
  // Firebase SDK 把「請求送不出去／被中斷」統一包成小寫 internal（後端回的是大寫 INTERNAL）
  if ((err as { code?: unknown }).code === 'functions/internal' && err.message === 'internal') return 'network';
  return 'other';
}

type VisibilityDoc = Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>;

/** 記錄某段非同步工作進行期間，分頁是否曾被切到背景（開始時已在背景也算） */
export function watchPageHidden(
  doc: VisibilityDoc | undefined = typeof document !== 'undefined' ? document : undefined,
) {
  let wentHidden = doc?.visibilityState === 'hidden';
  const onChange = () => {
    if (doc?.visibilityState === 'hidden') wentHidden = true;
  };
  doc?.addEventListener('visibilitychange', onChange);
  return {
    wentHidden: () => wentHidden,
    stop: () => doc?.removeEventListener('visibilitychange', onChange),
  };
}

export function reportTrackFailure(err: unknown, { wentHidden, device }: { wentHidden: boolean; device: string }) {
  const code = (err as { code?: unknown } | null | undefined)?.code;
  trackEvent(wentHidden ? 'tool_track_failed_hidden' : 'tool_track_failed_visible', {
    reason: classifyTrackFailure(err),
    device,
    error_code: typeof code === 'string' ? code : undefined,
  });
}
