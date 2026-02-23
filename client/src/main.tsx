import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";
import { registerServiceWorker } from "./serviceWorkerRegistration"; // Added import

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 延遲 Service Worker 註冊，確保不影響首屏 TBT
window.addEventListener('load', () => {
  registerServiceWorker();
});