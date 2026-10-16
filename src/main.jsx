import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import "./privacy.css";
import "./piper.css";
import PrivacyControls from "./PrivacyControls.jsx";
import PolicyPage from "./PolicyPage.jsx";
import { policyPages } from "./policyContent.mjs";
import { seoPages } from "./seoPages.js";
import { initializeAnalytics } from "./analytics.mjs";

initializeAnalytics({
  measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-9WE296206T',
  enabled: import.meta.env.VITE_GA4_ENABLED !== 'false',
  routes: Object.fromEntries([...seoPages, ...policyPages].map(page => [`/${page.slug}/`, page.title])),
});
const policy = policyPages.find(page => window.location.pathname.replace(/\/$/, '') === `/${page.slug}`);
if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('audit') === '1') import('./devAudit.mjs');

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    {policy ? <PolicyPage page={policy} /> : <App />}
    <PrivacyControls />
  </StrictMode>,
);
