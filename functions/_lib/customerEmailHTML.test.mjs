import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCustomerAcknowledgmentHTML } from './customerEmailHTML.mjs';

const now = new Date('2026-10-16T14:00:00Z');
const lead = {
  fullName: 'Jamie Example', email: 'private-fixture@example.com',
  preferredContact: 'Email first', callbackWindow: 'As soon as available',
  selectedCoverage: 'Homeowners + wind review', leadGoal: 'Buying / closing soon',
  coverageNeededBy: '2026-10-21', address: 'Private fixture address', notes: 'Private fixture notes',
};
const render = overrides => renderCustomerAcknowledgmentHTML({ ...lead, ...overrides }, { now });

test('approved coastal design has a Piper brand masthead, correct receipt details and one primary reply action', () => {
  const html = render();
  assert.match(html, /OBXNC <span[^>]+>Insurance<\/span>/);
  assert.match(html, /Your request is in,<br><span[^>]+>Jamie\./);
  assert.match(html, /October 21, 2026/);
  assert.match(html, /Coverage needed by/);
  assert.match(html, /Email, as requested/);
  assert.match(html, /We know there can be a lot to coordinate when buying a home/);
  assert.match(html, /If your lender gave you insurance requirements/);
  assert.match(html, /A human reviewer will look at your information/);
  assert.match(html, /Our bird guide gathers the details/);
  assert.match(html, /It is not a quote, approval, or confirmation of insurance coverage/);
  assert.equal((html.match(/class="button"/g) || []).length, 1);
  assert.match(html, /href="mailto:hello@obxncinsurance\.com\?subject=An%20update/);
  assert.doesNotMatch(html, /Private fixture|private-fixture@example\.com|Jamie Example/);
  assert.doesNotMatch(html, /Allen|Tide|assigned|licensed|within \d|scheduled for/i);
});

test('renewals use actual expiration and preparation without inventing a closing or coverage date', () => {
  const html = render({ leadGoal: 'Renewal review', coverageNeededBy: '', policyExpiration: '2026-11-01' });
  assert.match(html, /We noted that you want help with your renewal/);
  assert.match(html, /Current policy expiration/);
  assert.match(html, /November 1, 2026/);
  assert.match(html, /renewal notice or current policy handy/);
  assert.doesNotMatch(html, /Coverage needed by|buying a home|closing|lender|October 21/);
});

test('undated research and flood inquiries omit date labels and choose relevant preparation', () => {
  const research = render({ leadGoal: 'Just researching', coverageNeededBy: '', selectedCoverage: 'Flood guidance' });
  assert.match(research, /ask questions as you compare your options/);
  assert.match(research, /flood insurance review/);
  assert.match(research, /If you already have an elevation certificate/);
  assert.doesNotMatch(research, /Coverage needed by|Current policy expiration|class="date"|lender|buying a home/);
  const unknown = render({ leadGoal: 'Untrusted future goal', coverageNeededBy: '', selectedCoverage: '<svg onload=alert(1)>' });
  assert.match(unknown, /OBX property insurance request/);
  assert.doesNotMatch(unknown, /Untrusted future goal|<svg|lender|buying a home|October/);
});

test('both validated dates and the requested contact window remain visible', () => {
  const html = render({ policyExpiration: '2026-10-30', callbackWindow: 'Morning' });
  assert.match(html, /October 21, 2026/);
  assert.match(html, /October 30, 2026/);
  assert.match(html, /Requested time: Morning\. A contact time has not been scheduled/);
});

test('names are escaped and arbitrary notes, address, contact information and markup never enter HTML', () => {
  const html = render({ fullName: "Ava'Jane Example", notes: '<img src=x onerror=alert(1)> & private-note',
    address: '<script>alert(2)</script>', phone: 'private-phone', email: 'unshared@example.com' });
  assert.match(html, /Ava&#39;Jane\./);
  assert.doesNotMatch(html, /Ava'Jane|private-note|private-phone|unshared@example|onerror|<script|alert\(/);
  const malformed = render({ fullName: '<img src=x onerror=alert(1)>' });
  assert.match(malformed, />Your request is in\.<\/h1>/);
  assert.doesNotMatch(malformed, /onerror|alert\(/);
});

test('HTML renderer refuses the same contact holds, conflicts and invalid timing as the shared plan', () => {
  for (const change of [{ preferredContact: 'Phone call' }, { preferredContact: 'Text first' },
    { preferredContact: 'No preference' }, { notes: 'Do not email me' },
    { callbackWindow: 'After I send documents' }, { coverageNeededBy: '2026-02-30' },
    { coverageNeededBy: '2026-10-01' }, { callbackWindow: 'arbitrary<script>' }]) {
    assert.equal(render(change), null);
  }
});

test('all visual assets are stable first-party URLs; message has no tracking or executable content', () => {
  const html = render();
  const imageURLs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual([...new Set(imageURLs)], [
    'https://www.obxncinsurance.com/email/piper-v1.png',
    'https://www.obxncinsurance.com/email/coastal-house-v1.jpg',
  ]);
  assert.match(html, /https:\/\/www\.obxncinsurance\.com\/email\/fraunces-variable-v1\.ttf/);
  assert.match(html, /https:\/\/www\.obxncinsurance\.com\/privacy-policy\//);
  assert.match(html, /Fraunces,Georgia/);
  assert.doesNotMatch(html, /<script|<form|<iframe|javascript:|data:|utm_|tracking|width="1"|height="1"/i);
});
