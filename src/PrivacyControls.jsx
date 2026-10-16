import { useEffect, useRef, useState } from 'react';
import { getAnalytics } from './analytics.mjs';

export function PrivacyLinks() {
  return <span className="privacy-links" data-privacy-controls>
    <a href="/privacy-policy/">Privacy policy</a>
    <a href="/accessibility/">Accessibility</a>
    <button type="button" onClick={() => window.dispatchEvent(new Event('obx:privacy-settings'))}>Analytics choices</button>
  </span>;
}

export default function PrivacyControls() {
  const [state, setState] = useState(() => getAnalytics().snapshot());
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState('');
  const panel = useRef(null);
  const trigger = useRef(null);
  useEffect(() => getAnalytics().subscribe(setState), []);
  useEffect(() => {
    const open = () => { trigger.current = document.activeElement; setOpened(true); };
    window.addEventListener('obx:privacy-settings', open);
    return () => window.removeEventListener('obx:privacy-settings', open);
  }, []);
  useEffect(() => { if (opened) panel.current?.focus(); }, [opened]);
  const close = () => { setOpened(false); trigger.current?.focus(); };
  const choose = choice => { getAnalytics().setConsent(choice); close(); };
  const clearSavedData = () => {
    try {
      localStorage.removeItem('obxncinsurance:lastLead');
      localStorage.removeItem('obxncinsurance:lastTideLead');
      setStatus('Older saved form details have been removed from this browser. This does not delete a request you already sent.');
    } catch { setStatus('This browser blocked access to its saved data. You can clear this site’s storage in your browser settings.'); }
  };
  if (!opened && (!state.configured || state.consent !== null)) return null;
  return <aside className="privacy-panel" data-privacy-controls role="region" aria-labelledby="privacy-choice-heading" ref={panel} tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape' && opened) close(); }}>
    <h2 id="privacy-choice-heading">Your privacy, your choice</h2>
    <p>{state.configured ? 'May we use Google Analytics to understand how visitors use this site? It helps us improve the insurance request process. Your form answers and contact details are not sent to Analytics.' : 'Optional analytics is not active in this preview. You can still manage your preference and older saved form details.'}</p>
    <p>You can request insurance help with or without analytics. <a href="/privacy-policy/">Read our privacy policy</a>.</p>
    {state.gpc && <p>Your browser’s Global Privacy Control signal is on. Optional analytics is off.</p>}
    <div className="privacy-actions">
      <button type="button" onClick={() => choose('denied')}>No thanks</button>
      <button type="button" disabled={state.gpc} onClick={() => choose('granted')}>Allow analytics</button>
      {opened && <button type="button" onClick={close}>Close</button>}
    </div>
    {opened && <button className="privacy-clear" type="button" onClick={clearSavedData}>Clear older saved form details</button>}
    <p role="status">{status}</p>
  </aside>;
}
