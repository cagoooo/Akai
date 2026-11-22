/**
 * 這個瀏覽器能不能用本機儲存（localStorage＋IndexedDB）。
 *
 * Safari 開了「阻擋所有 Cookie」、部分管理過的學校 iPad、某些 App 內建瀏覽器，碰到 localStorage 就丟
 * SecurityError「The operation is insecure.」。Firestore 的多分頁離線快取一啟動就會碰它，整個 Firestore
 * 初始化失敗（之後每個查詢都是 INTERNAL ASSERTION FAILED b815），收藏、計數器全部不能用
 * （2026-11-22 JAVASCRIPT-REACT-31／32／33／34：彰化 iPad Safari 17，一分鐘內 4 則）。
 * 啟動前先探一次，不能用就改用「只放記憶體」的模式。結果在同一頁內記住，不重複探測。
 */
let cached: boolean | null = null;

export function isBrowserStorageAvailable(): boolean {
  if (cached !== null) return cached;
  // index.html 開頭的備援已偵測到儲存被擋、把 localStorage 換成記憶體替身：替身試寫會成功，要看旗標
  if ((window as { __akaiStorageBlocked?: boolean }).__akaiStorageBlocked) {
    cached = false;
    return cached;
  }
  try {
    const storage = window.localStorage;
    const key = '__akai_storage_probe__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    cached = typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    cached = false;
  }
  return cached;
}

/** 測試用：清掉記住的結果 */
export function resetBrowserStorageProbeForTests(): void {
  cached = null;
}
