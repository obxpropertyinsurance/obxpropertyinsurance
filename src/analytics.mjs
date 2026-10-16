// Only fixed UI identifiers cross this boundary. Never pass form values or user text.
export const CONSENT_KEY = 'obx:analytics-consent:v1';
const consentAge = 180 * 24 * 60 * 60 * 1000;
const enums = {
  funnel: ['quote', 'guide', 'prototype'],
  step_id: ['property', 'contact', 'details', 'needs', 'review', 'complete'],
  placement: ['header', 'footer', 'main', 'guide', 'sticky'],
  cta_id: ['quote_request', 'guide_open', 'saved_questions'],
  topic_id: ['wind', 'water', 'ded', 'rental', 'winds', 'percent', 'rent'],
  action: ['save', 'remove', 'copy', 'edit', 'add', 'open', 'close'],
  reason: ['invalid_input', 'required_fields', 'delivery_error'],
};
const schemas = {
  cta_click: ['cta_id', 'placement'],
  ui_click: ['control_id', 'placement'],
  navigation_click: ['destination', 'placement'],
  funnel_start: ['funnel'],
  funnel_step_view: ['funnel', 'step_id', 'step_index'],
  funnel_step_complete: ['funnel', 'step_id', 'step_index'],
  funnel_validation_error: ['funnel', 'step_id', 'reason'],
  lead_submit_attempt: ['funnel'],
  lead_submit_error: ['funnel', 'reason'],
  generate_lead: ['funnel'],
  funnel_exit: ['funnel', 'step_id', 'step_index'],
  guide_interaction: ['action'],
  house_topic_select: ['topic_id'],
  question_action: ['action'],
};

export function safeEvent(name, params = {}, knownPaths = new Set(['/'])) {
  if (!Object.hasOwn(schemas, name)) return null;
  const safe = {};
  for (const key of schemas[name]) {
    const value = params[key];
    if (enums[key]?.includes(value)) safe[key] = value;
    if (key === 'step_index' && Number.isInteger(value) && value >= 1 && value <= 6) safe[key] = value;
    if (key === 'control_id' && /^(button|link|summary)_[0-9]{1,4}$/.test(value)) safe[key] = value;
    if (key === 'destination' && (knownPaths.has(value) || ['external', 'email', 'phone', 'section', 'other'].includes(value))) safe[key] = value;
  }
  return { name, params: safe };
}

export function createAnalytics({ measurementId = '', enabled = false, routes = {}, siteUrl = 'https://www.obxncinsurance.com', win, doc }) {
  const paths = new Set(['/', ...Object.keys(routes)]);
  const configured = enabled && /^G-[A-Z0-9]+$/.test(measurementId) && ['www.obxncinsurance.com', 'obxncinsurance.com'].includes(win.location.hostname);
  const listeners = new Set();
  let consent = null, loaded = false, activeFunnel = null, viewed = new Set();
  const gpc = () => win.navigator.globalPrivacyControl === true;
  try {
    const saved = JSON.parse(win.localStorage.getItem(CONSENT_KEY));
    if (['granted', 'denied'].includes(saved?.choice) && Date.now() - saved.at < consentAge && saved.at <= Date.now()) consent = saved.choice;
  } catch { /* Storage may be unavailable. */ }
  if (gpc()) consent = 'denied';

  const referral = () => { try { const url = new URL(doc.referrer); return ['http:', 'https:'].includes(url.protocol) ? url.origin + '/' : ''; } catch { return ''; } };
  const page = () => {
    const path = paths.has(win.location.pathname) ? win.location.pathname : '/other/';
    return { page_location: siteUrl + path, page_title: routes[path] || (path === '/' ? 'OBXNCInsurance.com | Outer Banks Insurance Review' : 'OBXNCInsurance.com'), page_referrer: referral() };
  };
  const allowed = () => configured && consent === 'granted' && !gpc();
  function command() { win.dataLayer.push(arguments); }
  const snapshot = () => ({ configured, consent, gpc: gpc() });

  function load() {
    if (!allowed() || loaded) return;
    win.dataLayer = win.dataLayer || [];
    win[`ga-disable-${measurementId}`] = false;
    command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    command('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    command('set', { ...page(), allow_google_signals: false, allow_ad_personalization_signals: false, ads_data_redaction: true });
    command('js', new Date());
    command('config', measurementId, { ...page(), send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 60 * 60 * 24 * 180, cookie_update: false });
    const script = doc.createElement('script');
    script.async = true;
    script.id = 'obx-google-analytics';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    doc.head.appendChild(script);
    loaded = true;
    command('event', 'page_view', page());
    // Consent can be granted after a visitor has entered the funnel.
    if (activeFunnel) {
      command('event', 'funnel_start', { funnel: activeFunnel.funnel, ...page() });
      command('event', 'funnel_step_view', { ...activeFunnel, ...page() });
      viewed.add(JSON.stringify(activeFunnel));
    }
  }

  function setConsent(choice) {
    consent = choice === 'granted' && !gpc() ? 'granted' : 'denied';
    try { win.localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: consent, at: Date.now() })); } catch { /* Session-only choice. */ }
    if (consent === 'denied' && configured) {
      win[`ga-disable-${measurementId}`] = true;
      if (loaded) command('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      // Clear this property's first-party GA cookies, including parent-domain cookies.
      for (const entry of (doc.cookie || '').split(';')) {
        const name = entry.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', win.location.hostname, '.obxncinsurance.com']) doc.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ''} SameSite=Lax; Secure`;
      }
    } else if (loaded && allowed()) {
      win[`ga-disable-${measurementId}`] = false;
      command('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    } else load();
    listeners.forEach(fn => fn(snapshot()));
  }

  function track(name, params) {
    const safe = safeEvent(name, params, paths);
    if (!safe || !allowed()) return false;
    load();
    command('event', safe.name, { ...safe.params, ...page() });
    return true;
  }

  function step(funnel, step_id, step_index) {
    const safe = safeEvent('funnel_step_view', { funnel, step_id, step_index }, paths).params;
    if (Object.keys(safe).length !== 3) return;
    if (!activeFunnel || activeFunnel.funnel !== funnel) {
      viewed = new Set();
      track('funnel_start', { funnel });
    }
    activeFunnel = safe;
    const key = JSON.stringify(safe);
    if (!viewed.has(key) && track('funnel_step_view', safe)) viewed.add(key);
  }
  function complete(funnel) {
    track('generate_lead', { funnel });
    activeFunnel = null;
    viewed.clear();
  }
  const onExit = () => { if (activeFunnel) track('funnel_exit', activeFunnel); };
  win.addEventListener('pagehide', onExit);
  load();
  return { track, step, complete, setConsent, snapshot, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }, destroy() { win.removeEventListener('pagehide', onExit); listeners.clear(); } };
}

let tracker;
export const trackEvent = (name, params) => tracker?.track(name, params);
export const trackStep = (funnel, step, index) => tracker?.step(funnel, step, index);
export const trackLead = funnel => tracker?.complete(funnel);
export const getAnalytics = () => tracker;

export function initializeAnalytics(options) {
  if (tracker) return tracker;
  tracker = createAnalytics({ ...options, win: window, doc: document });
  document.addEventListener('click', event => {
    const control = event.target.closest('a,button,summary');
    if (!control || control.closest('[data-privacy-controls]')) return;
    const placement = control.closest('header') ? 'header' : control.closest('footer') ? 'footer' : control.closest('.tide-panel') ? 'guide' : control.closest('.quick-call-sticky,.mobile-foot-cta') ? 'sticky' : 'main';
    const tag = control.tagName.toLowerCase();
    const prefix = tag === 'a' ? 'link' : tag;
    const index = [...document.querySelectorAll(tag)].indexOf(control);
    tracker.track('ui_click', { control_id: `${prefix}_${index}`, placement });
    const href = control.getAttribute('href');
    if (control.dataset.view === 'review' || href?.includes('#quote') || control.classList.contains('header-cta')) tracker.track('cta_click', { cta_id: 'quote_request', placement });
    if (!href) return;
    let destination = 'other';
    try {
      const url = new URL(href, window.location.href);
      destination = href.startsWith('mailto:') ? 'email' : href.startsWith('tel:') ? 'phone' : url.origin !== window.location.origin ? 'external' : url.hash && url.pathname === window.location.pathname ? 'section' : url.pathname;
    } catch { /* Ignore malformed destinations. */ }
    tracker.track('navigation_click', { destination, placement });
  });
  return tracker;
}
