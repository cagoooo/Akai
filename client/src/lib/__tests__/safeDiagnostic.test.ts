import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeDiagnostic, sanitizedDiagnosticError } from '../safeDiagnostic';

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('瀏覽器診斷資訊邊界', () => {
  it('清洗真正秘密，但保留操作識別、型別、代碼與原始堆疊位置', () => {
    const logger = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // 假帳密於執行時組字，原始碼不出現「帳號:密碼@主機」等樣式，避免掃描器誤認為寫死密碼。
    const marker = 'private';
    const leakedUrl = ['https://name', `${marker}@example.test/asset.js?token=${marker}`].join(':');
    const failure = new TypeError(`要求 ${leakedUrl} 失敗 ${['password', marker].join('=')} Authorization: Bearer ${marker}+/==`) as TypeError & { code: string };
    failure.code = 'functions/internal';
    failure.stack = `TypeError: ${failure.message}\n    at refresh (https://example.test/assets/app-123.js:10:20?token=private)`;
    safeDiagnostic('[PWA] 更新檢查失敗', failure);
    const [label, clean] = logger.mock.calls[0] as [string, Error & { code: string }];
    expect(label).toBe('[PWA] 更新檢查失敗');
    expect(clean).toBeInstanceOf(Error);
    expect(clean.name).toBe('TypeError');
    expect(clean.code).toBe('functions/internal');
    expect(clean.stack).toContain('at refresh (https://example.test/assets/app-123.js:10:20');
    expect(clean.message + clean.stack).not.toContain('private');
  });

  it('一般錯誤保留原診斷物件，不取消事件', () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('供開發診斷');
    safeDiagnostic('[測試] 操作失敗', failure, 'error');
    expect(logger).toHaveBeenCalledWith('[測試] 操作失敗', failure);
  });

  it('無敏感內容維持原物件與 functions/internal 網路雜訊辨識', () => {
    const failure = new Error('internal') as Error & { code: string };
    failure.code = 'functions/internal';
    expect(sanitizedDiagnosticError(failure)).toBe(failure);
    expect((sanitizedDiagnosticError(failure) as Error).message).toBe('internal');
  });

  it('不把 Axios 或 Firebase 額外認證物件交給公開 console', () => {
    const failure = new Error('permission-denied') as Error & { customData: unknown; code: string };
    failure.code = 'permission-denied';
    failure.customData = { authorization: '不應輸出' };
    const clean = sanitizedDiagnosticError(failure) as Error & { code: string; customData?: unknown };
    expect(clean.code).toBe('permission-denied');
    expect(clean.customData).toBeUndefined();
    expect(clean.stack).toContain('safeDiagnostic.test');
  });
});
