import test from 'node:test';
import assert from 'node:assert/strict';
import { leadRoutingRows, leadNotificationSubject } from './leadNotification.mjs';
import { onRequestPost } from '../functions/api/lead.js';

const fixture = {
  fullName: 'Jamie Example', address: '123 Example Lane', email: 'jamie@example.com', phone: '555-0100',
  preferredContact: 'Email first', callbackWindow: 'As soon as available',
  selectedCoverage: 'Homeowners + wind review', coverageNeededBy: '2026-10-18',
  notes: 'Please check wind coverage.', sourcePath: '/outer-banks-home-insurance/',
};

test('routing prioritizes an imminent need without guessing another contact channel', () => {
  const rows = Object.fromEntries(leadRoutingRows({ ...fixture, preferredContact: 'Phone call' }, { now: new Date('2026-10-16T16:00:00Z') }));
  assert.equal(rows['Requested contact'], 'Phone call');
  assert.equal(rows['Timing priority'], 'Urgent timing');
  assert.match(rows['Next action'], /staffed/i);
  assert.doesNotMatch(leadNotificationSubject, /Jamie|Example Lane|wind coverage/i);
});

test('admin notification retains original lead fields and never emails the customer', async t => {
  const requests = [];
  const statements = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    requests.push({ url, init });
    return Response.json({ success: true });
  });
  const env = { LEADS_DB: { prepare(sql) {
    return { bind(...values) { statements.push({ sql, values }); return { async run() {} }; } };
  } } };
  const response = await onRequestPost({ env, request: new Request('https://www.obxncinsurance.com/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(fixture) }) });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.storage, 'd1');
  assert.ok(result.leadId);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://formsubmit.co/ajax/obxpropertyinsurance@proton.me');
  const fields = requests[0].init.body;
  assert.equal(fields.get('_subject'), leadNotificationSubject);
  assert.equal(fields.get('property_address'), fixture.address);
  assert.equal(fields.get('notes'), fixture.notes);
  assert.equal(fields.get('preferred_contact'), 'Email first');
  assert.equal(fields.get('requested_contact'), 'Email first');
  assert.match(fields.get('follow_up_instructions'), /requested channel/);
  assert.ok(statements.some(row => row.sql.startsWith('INSERT INTO leads')));
  assert.ok(statements.some(row => row.sql.startsWith('UPDATE leads SET email_delivery')));
});

test('invalid input creates neither a record nor a message', async t => {
  let sends = 0;
  t.mock.method(globalThis, 'fetch', async () => { sends++; throw new Error('Unexpected send'); });
  const result = await onRequestPost({ env: {}, request: new Request('https://www.obxncinsurance.com/api/lead', { method: 'POST', body: '{}' }) });
  assert.equal(result.status, 400);
  assert.equal(sends, 0);
});
