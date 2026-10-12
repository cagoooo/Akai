type RandomProvider = {
  randomUUID?: () => string;
  getRandomValues?: (bytes: Uint8Array) => Uint8Array;
};

/** 事件與會話識別碼只用系統亂數；不支援時明確回 null，讓呼叫端安全回退。 */
export function createSecureRandomId(provider: RandomProvider | undefined = globalThis.crypto): string | null {
  try {
    if (typeof provider?.randomUUID === 'function') return provider.randomUUID();
  } catch { /* 部分安全環境不支援 randomUUID，仍可使用 getRandomValues。 */ }
  try {
    if (typeof provider?.getRandomValues !== 'function') return null;
    const bytes = provider.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    return null;
  }
}
