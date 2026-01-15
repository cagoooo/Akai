import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // 程式碼分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心 React 套件
          'vendor-react': ['react', 'react-dom'],
          // UI 元件庫
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-toast',
          ],
          // 動畫庫
          'vendor-animation': ['framer-motion'],
          // Firebase
          'vendor-firebase': ['firebase/app', 'firebase/firestore'],
          // 圖表庫
          'vendor-charts': ['recharts'],
          // 工具函式
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // 設定 chunk 大小警告閾值 (500KB)
    chunkSizeWarningLimit: 500,
  },
});
