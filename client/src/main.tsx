import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import App from './App';
import "./index.css";
import { registerServiceWorker } from "./serviceWorkerRegistration"; // Added import

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
);

registerServiceWorker(); // Added service worker registration