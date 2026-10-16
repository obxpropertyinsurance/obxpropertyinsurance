// No arbitrary URLs, query values, referrer paths or visitor identifiers are retained.
const sources = new Map([
  ['chatgpt.com', 'chatgpt'], ['chatgpt', 'chatgpt'], ['openai', 'chatgpt'],
  ['google', 'google'], ['google.com', 'google'], ['bing', 'bing'], ['bing.com', 'bing'],
  ['perplexity', 'perplexity'], ['perplexity.ai', 'perplexity'],
  ['claude', 'claude'], ['claude.ai', 'claude'], ['facebook', 'facebook'],
]);
const allowedSources = new Set([...sources.values(), 'direct', 'referral']);
export const ACQUISITION_KEY = 'obx:acquisition:v1';

export function classifyAcquisition(search = '', referrer = '') {
  const candidate = new URLSearchParams(search).get('utm_source')?.toLowerCase();
  if (sources.has(candidate)) return sources.get(candidate);
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (host === 'obxncinsurance.com') return 'direct';
    return sources.get(host) || (/^(?:[a-z]+\.)?google\.[a-z.]+$/.test(host) ? 'google' : 'referral');
  } catch { return 'direct'; }
}

export function normalizeAcquisition(value, paths) {
  return {
    acquisitionSource: allowedSources.has(value?.acquisitionSource) ? value.acquisitionSource : '',
    originalLandingPath: paths.has(value?.originalLandingPath) ? value.originalLandingPath : '',
    requestPath: paths.has(value?.requestPath) ? value.requestPath : '/',
  };
}

export function createAcquisition({ win, doc, paths, consent }) {
  const path = () => paths.has(win.location.pathname) ? win.location.pathname : '/';
  const first = { acquisitionSource: classifyAcquisition(win.location.search, doc.referrer), originalLandingPath: path() };
  let current = first;
  function context() {
    if (consent() !== 'granted' || win.navigator.globalPrivacyControl === true) {
      try { win.sessionStorage?.removeItem(ACQUISITION_KEY); } catch { /* Optional storage. */ }
      return { requestPath: path() };
    }
    try {
      const saved = JSON.parse(win.sessionStorage?.getItem(ACQUISITION_KEY) || 'null');
      const clean = normalizeAcquisition(saved, paths);
      if (clean.acquisitionSource && clean.originalLandingPath) current = clean;
      win.sessionStorage?.setItem(ACQUISITION_KEY, JSON.stringify({ acquisitionSource: current.acquisitionSource, originalLandingPath: current.originalLandingPath }));
    } catch { /* Session-only in-memory context when storage is blocked. */ }
    return normalizeAcquisition({ ...current, requestPath: path() }, paths);
  }
  return { context };
}

let active;
export const setAcquisitionTracker = tracker => { active = tracker; };
export const getAcquisitionContext = () => active?.context() || {};
