import { describe, expect, it, vi } from 'vitest';
import { createSecureRandomId } from '../randomId';

describe('事件與會話系統亂數識別碼', () => {
  it('正式HTTPS優先使用randomUUID，不呼叫弱亂數', () => {
    const randomUUID = vi.fn(() => '01234567-89ab-4cde-8012-3456789abcde');
    const weakRandom = vi.spyOn(Math, 'random');
    expect(createSecureRandomId({ randomUUID })).toBe('01234567-89ab-4cde-8012-3456789abcde');
    expect(randomUUID).toHaveBeenCalledOnce();
    expect(weakRandom).not.toHaveBeenCalled();
    weakRandom.mockRestore();
  });

  it('沒有randomUUID的安全環境仍使用getRandomValues產生正確UUIDv4', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => { bytes.fill(0xab); return bytes; });
    expect(createSecureRandomId({ getRandomValues })).toBe('abababab-abab-4bab-abab-abababababab');
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it('randomUUID失敗可用系統亂數備援；所有安全亂數失效則明確回null', () => {
    expect(createSecureRandomId({ randomUUID: () => { throw new Error('unsupported'); },
      getRandomValues: bytes => { bytes.fill(0); return bytes; } })).toBe('00000000-0000-4000-8000-000000000000');
    expect(createSecureRandomId({})).toBeNull();
    expect(createSecureRandomId({ getRandomValues: () => { throw new Error('blocked'); } })).toBeNull();
  });
});
