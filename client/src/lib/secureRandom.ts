/** 特效位置、抽樣與排序權重統一用系統亂數；回傳 0（含）到 1（不含）之間的小數。 */
export function secureRandom(): number {
  const value = globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  return value / 2 ** 32;
}
