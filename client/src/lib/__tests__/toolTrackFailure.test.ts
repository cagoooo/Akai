import { afterEach, describe, expect, it, vi } from 'vitest';

const trackEvent = vi.fn();
vi.mock('../analytics', () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

import { classifyTrackFailure, reportTrackFailure, watchPageHidden } from '../toolTrackFailure';

const firebaseError = (code: string, message: string) => Object.assign(new Error(message), { name: 'FirebaseError', code });
afterEach(() => trackEvent.mockClear());

describe('計數失敗原因分類', () => {
  it('App Check 沒通過、請求送不出去（小寫 internal）、其他', () => {
    expect(classifyTrackFailure(new Error('App Check 尚未通過，使用本機工具計數'))).toBe('app_check');
    expect(classifyTrackFailure(firebaseError('functions/internal', 'internal'))).toBe('network');
    // 後端自己回的錯誤是大寫 INTERNAL，不是客戶端網路問題
    expect(classifyTrackFailure(firebaseError('functions/internal', 'INTERNAL'))).toBe('other');
    expect(classifyTrackFailure(firebaseError('functions/resource-exhausted', 'rate limit'))).toBe('other');
    expect(classifyTrackFailure('boom')).toBe('other');
    expect(classifyTrackFailure(undefined)).toBe('other');
  });
});

describe('呼叫期間分頁是否曾被切到背景', () => {
  function fakeDocument(state: 'visible' | 'hidden') {
    const target = new EventTarget();
    const doc = {
      visibilityState: state as DocumentVisibilityState,
      addEventListener: target.addEventListener.bind(target),
      removeEventListener: target.removeEventListener.bind(target),
    };
    const set = (next: DocumentVisibilityState) => {
      doc.visibilityState = next;
      target.dispatchEvent(new Event('visibilitychange'));
    };
    return { doc, set };
  }

  it('一直在前景就不算', () => {
    const { doc } = fakeDocument('visible');
    const watch = watchPageHidden(doc);
    expect(watch.wentHidden()).toBe(false);
    watch.stop();
  });

  it('中途切到背景、再回到前景，仍記為曾被切到背景', () => {
    const { doc, set } = fakeDocument('visible');
    const watch = watchPageHidden(doc);
    set('hidden');
    set('visible');
    expect(watch.wentHidden()).toBe(true);
    watch.stop();
  });

  it('開始時就在背景也算；停止監聽後不再更新', () => {
    const hiddenAtStart = fakeDocument('hidden');
    expect(watchPageHidden(hiddenAtStart.doc).wentHidden()).toBe(true);

    const { doc, set } = fakeDocument('visible');
    const watch = watchPageHidden(doc);
    watch.stop();
    set('hidden');
    expect(watch.wentHidden()).toBe(false);
  });
});

describe('回報事件', () => {
  it('曾被切到背景與一直在前景用不同的事件名稱，免設自訂維度就能分開統計', () => {
    reportTrackFailure(firebaseError('functions/internal', 'internal'), { wentHidden: true, device: 'mobile' });
    expect(trackEvent).toHaveBeenLastCalledWith('tool_track_failed_hidden', {
      reason: 'network', device: 'mobile', error_code: 'functions/internal',
    });
    reportTrackFailure(new Error('App Check 尚未通過，使用本機工具計數'), { wentHidden: false, device: 'desktop' });
    expect(trackEvent).toHaveBeenLastCalledWith('tool_track_failed_visible', {
      reason: 'app_check', device: 'desktop', error_code: undefined,
    });
  });
});
