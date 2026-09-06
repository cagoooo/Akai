import { defineConfig, devices } from '@playwright/test';

/**
 * CI 專用的 Playwright 設定（與本機開發用的 playwright.config.ts 分開）。
 *
 * 為什麼不沿用 playwright.config.ts：
 *   它的 webServer 是 `npm run dev`，會啟動 Express + better-sqlite3。
 *   那條路徑在 CI 既不需要也不穩定（原生模組要對 Node ABI，本機實測就直接
 *   以「無法初始化任何數據庫連接」啟動失敗）。
 *   而且站台實際上線的形態是 GitHub Pages 上的靜態檔，
 *   拿 `vite preview` 服務 build 產物來測，測到的才是使用者真正拿到的那份 bundle。
 *
 * base path：vite.config.ts 用 `process.env.GITHUB_ACTIONS === 'true'` 決定
 *   base 是 '/Akai/' 還是 '/'，這裡沿用同一個判斷，讓本機與 CI 都指得到。
 */
const base = process.env.GITHUB_ACTIONS === 'true' ? '/Akai/' : '/';
const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}${base}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // CI 每次 push 都要跑，只留 chromium 保持快速；跨瀏覽器矩陣留給本機 playwright.config.ts
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
