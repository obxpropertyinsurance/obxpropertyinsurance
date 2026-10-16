import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import "./privacy.css";
import "./piper.css";
import "./guide-design.css";
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

const content = <StrictMode>
  <a className="skip-link" href="#main-content">Skip to main content</a>
  {policy ? <PolicyPage page={policy} /> : <App />}
</StrictMode>;
const root = document.getElementById("root");
// Preserve the static content while attaching handlers; development starts empty.
if (root.hasChildNodes()) hydrateRoot(root, content);
else createRoot(root).render(content);
// Consent depends on browser preferences, so it has a separate client-only root.
const privacyRoot = document.createElement('div');
privacyRoot.id = 'privacy-root';
document.body.appendChild(privacyRoot);
createRoot(privacyRoot).render(<StrictMode><PrivacyControls /></StrictMode>);
