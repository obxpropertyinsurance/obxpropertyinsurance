import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, safeEvent, CONSENT_KEY } from './analytics.mjs';

function environment({ stored, gpc = false, hostname = 'www.obxncinsurance.com' } = {}) {
  const storage = new Map(stored ? [[CONSENT_KEY, JSON.stringify(stored)]] : []);
  const scripts = [], events = {};
  const win = { location: { hostname, pathname: '/', search: '?email=private@example.com', hash: '#private-address' }, navigator: { globalPrivacyControl: gpc }, localStorage: { getItem: key => storage.get(key), setItem: (key, val) => storage.set(key, val) }, addEventListener: (key, fn) => events[key] = fn, removeEventListener: key => delete events[key] };
  const doc = { cookie: '', referrer: 'https://www.google.com/search?q=private-address', createElement: () => ({}), head: { appendChild: script => scripts.push(script) } };
  const tracker = createAnalytics({ measurementId: 'G-TEST123', enabled: true, win, doc });
  return { tracker, win, scripts, events, doc };
}

test('no Google load or queued events before consent, after decline, or on localhost', () => {
  for (const options of [{}, { hostname: 'localhost' }]) {
    const { tracker, scripts, win } = environment(options);
    tracker.track('cta_click', { cta_id: 'quote_request', placement: 'header' });
    assert.equal(scripts.length, 0); assert.equal(win.dataLayer, undefined);
    tracker.setConsent('denied');
    assert.equal(scripts.length, 0); assert.equal(win.dataLayer, undefined);
  }
});

test('PII and unknown event parameters are rejected, destinations are allowlisted', () => {
  const result = safeEvent('funnel_step_view', { funnel: 'quote', step_id: 'contact', step_index: 1, email: 'private@example.com', address: '123 Private St', question: 'Private question', user_id: 'private' });
  assert.deepEqual(result.params, { funnel: 'quote', step_id: 'contact', step_index: 1 });
  assert.equal(safeEvent('private@example.com', {}), null);
  assert.deepEqual(safeEvent('navigation_click', { destination: '/private@example.com/' }).params, {});
  assert.deepEqual(safeEvent('ui_click', { control_id: 'private@example.com' }).params, {});
});

test('grant loads exactly once with sanitized URLs and no automatic page view', () => {
  const { tracker, scripts, win } = environment();
  tracker.setConsent('granted'); tracker.setConsent('granted');
  tracker.track('cta_click', { cta_id: 'quote_request', placement: 'header', email: 'private@example.com' });
  assert.equal(scripts.length, 1);
  assert.equal(win.dataLayer.find(row => row[0] === 'config')[2].send_page_view, false);
  const payload = JSON.stringify(win.dataLayer);
  assert.equal(payload.includes('private'), false);
  assert.ok(payload.includes('https://www.google.com/'));
  assert.equal(win.dataLayer.filter(row => row[1] === 'page_view').length, 1);
});

test('GPC overrides a prior grant and prevents a new grant', () => {
  const { tracker, scripts } = environment({ stored: { choice: 'granted', at: Date.now() }, gpc: true });
  tracker.setConsent('granted');
  assert.equal(tracker.snapshot().consent, 'denied'); assert.equal(scripts.length, 0);
});

test('withdrawal stops event delivery and disables the GA property', () => {
  const { tracker, win } = environment();
  tracker.setConsent('granted'); tracker.setConsent('denied');
  const count = win.dataLayer.length;
  assert.equal(tracker.track('generate_lead', { funnel: 'quote' }), false);
  assert.equal(win.dataLayer.length, count); assert.equal(win['ga-disable-G-TEST123'], true);
});

test('expired consent requires a fresh choice', () => {
  const { tracker, scripts } = environment({ stored: { choice: 'granted', at: Date.now() - 181 * 86400000 } });
  assert.equal(tracker.snapshot().consent, null); assert.equal(scripts.length, 0);
});

test('funnel steps deduplicate and only accepted success produces a conversion', () => {
  const { tracker, win, events } = environment();
  tracker.setConsent('granted'); tracker.step('quote', 'contact', 1); tracker.step('quote', 'contact', 1);
  tracker.step('quote', 'details', 2); events.pagehide();
  assert.equal(win.dataLayer.filter(row => row[1] === 'funnel_step_view').length, 2);
  assert.equal(win.dataLayer.filter(row => row[1] === 'funnel_exit').length, 1);
  assert.equal(win.dataLayer.filter(row => row[1] === 'generate_lead').length, 0);
  tracker.complete('quote'); events.pagehide();
  assert.equal(win.dataLayer.filter(row => row[1] === 'generate_lead').length, 1);
  assert.equal(win.dataLayer.filter(row => row[1] === 'funnel_exit').length, 1);
});
