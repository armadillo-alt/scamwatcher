import "@fontsource-variable/bitter";
import "@fontsource-variable/public-sans";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// BASE_URL is "/" in dev and "/<repo>/" on GitHub Pages; Router wants it without
// the trailing slash (except root).
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      basename={basename}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Installability on Android: register the (non-caching) service worker in production.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {
      // Install prompt simply won't appear; the site still works.
    });
  });
}
