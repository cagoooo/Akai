import path from "node:path";
import { getCertificate } from "@vitejs/plugin-basic-ssl";

/**
 * 本機開發伺服器的自簽憑證：第一次啟動時自動產生，快取在 node_modules/.vite（30 天後自動換新），
 * 不必手動準備金鑰檔。正式網站是 GitHub Pages 上的靜態檔，不會用到這張憑證。
 */
export async function localTlsOptions() {
  const pem = await getCertificate(path.resolve("node_modules/.vite/basic-ssl"), "akai-local-dev");
  return { key: pem, cert: pem };
}
