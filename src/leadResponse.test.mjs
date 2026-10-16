import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadResponse } from './leadResponse.mjs';

const now = new Date('2026-10-16T16:00:00Z');
const base = { fullName: 'Jamie Smith', preferredContact: 'Email first', callbackWindow: 'As soon as available', selectedCoverage: 'Homeowners + wind review', leadGoal: 'Buying / closing soon' };
const response = (fields = {}, options = {}) => buildLeadResponse({ ...base, ...fields }, { now, ...options });
const noDrafts = result => assert.deepEqual(result.drafts, { email: { subject: '', body: '' }, sms: '', call: '' });

test('each explicit contact channel generates only its own working draft', () => {
  for (const [preferredContact, channel] of [['Phone call', 'phone'], ['Text first', 'text'], ['Email first', 'email']]) {
    const result = response({ preferredContact });
    assert.equal(result.channel, channel);
    assert.equal(result.requiresReview, false);
    assert.equal(Boolean(result.drafts.email.body), channel === 'email');
    assert.equal(Boolean(result.drafts.sms), channel === 'text');
    assert.equal(Boolean(result.drafts.call), channel === 'phone');
    assert.match(result.contactMessage, /included with your request/);
    assert.doesNotMatch(result.contactMessage, /sent|scheduled|assigned/i);
  }
});

test('phone and text tasks require actual staffing and a monitored service before outreach', () => {
  assert.match(response({ preferredContact: 'Phone call' }).nextAction, /Assign a staffed callback owner before arranging a call/);
  assert.match(response({ preferredContact: 'Text first' }).nextAction, /Confirm permission and a monitored two-way texting service before outreach/);
  for (const preferredContact of ['Phone call', 'Text first']) {
    const result = response({ preferredContact });
    assert.doesNotMatch(`${result.contactMessage} ${result.windowMessage}`, /we(?:'ll| will) (?:call|text)|agent (?:is|has been) assigned/i);
    assert.equal(result.drafts.email.body, '');
  }
});

test('same-day and next two calendar days are urgent, days three through seven are soon', () => {
  for (const date of ['2026-10-16', '2026-10-17', '2026-10-18']) assert.equal(response({ coverageNeededBy: date }).priority, 'urgent');
  for (const date of ['2026-10-19', '2026-10-23']) assert.equal(response({ coverageNeededBy: date }).priority, 'soon');
  assert.equal(response({ coverageNeededBy: '2026-10-24' }).priority, 'standard');
  assert.equal(response({ coverageNeededBy: '2026-10-24', policyExpiration: '2026-10-17' }).priority, 'urgent');
});

test('urgency uses New York calendar days instead of UTC or elapsed hours', () => {
  assert.equal(response({ coverageNeededBy: '2026-10-18' }, { now: new Date('2026-10-16T00:30:00Z') }).priority, 'soon');
  assert.equal(response({ coverageNeededBy: '2026-11-03' }, { now: new Date('2026-11-01T05:30:00Z') }).priority, 'urgent');
});

test('past dates retain urgent priority but require review before outreach', () => {
  const result = response({ coverageNeededBy: '2026-10-15' });
  assert.equal(result.priority, 'urgent');
  assert.equal(result.requiresReview, true);
  assert.match(result.reasons.join(' '), /past/);
  noDrafts(result);
});

test('strict ISO dates reject impossible calendar dates and unrequested date inference', () => {
  for (const date of ['2026-02-30', '2026-02-29', '2026-13-01', '2026-00-20', '2026-10-00', '2026-2-3', 'next Friday', '10/23/2026']) {
    const result = response({ coverageNeededBy: date });
    assert.equal(result.priority, 'review', date);
    assert.equal(result.requiresReview, true, date);
    assert.ok(result.timingMessage.includes(date));
    noDrafts(result);
  }
  assert.equal(response({ coverageNeededBy: '2028-02-29' }).requiresReview, false);
});

test('invalid current time cannot silently schedule outreach', () => {
  const result = response({ coverageNeededBy: '2026-10-18' }, { now: new Date('invalid') });
  assert.equal(result.requiresReview, true);
  noDrafts(result);
});

test('no preference, missing preferences and unknown values never choose an alternate channel', () => {
  for (const preferredContact of ['No preference', '', 'WhatsApp', undefined]) {
    const result = response({ preferredContact });
    assert.equal(result.channel, 'review');
    assert.equal(result.requiresReview, true);
    noDrafts(result);
  }
});

test('conflicting best-time selection and explicit written restrictions block drafts', () => {
  const cases = [
    { preferredContact: 'Phone call', callbackWindow: 'Email first' },
    { preferredContact: 'Phone call', notes: 'Please email me first.' },
    { preferredContact: 'Phone call', notes: 'Please contact me by email.' },
    { preferredContact: 'Text first', notes: 'Email me instead.' },
    { preferredContact: 'Text first', notes: 'Call, not text.' },
    { preferredContact: 'Phone call', notes: 'No calls, please.' },
    { preferredContact: 'Email first', notes: 'Text only.' },
    { preferredContact: 'Text first', notes: "Don't text me. Please email." },
    { preferredContact: 'Phone call', notes: 'Please call after 6 pm.' },
    { preferredContact: 'Email first', notes: 'Do not contact me until I send documents.' },
  ];
  for (const fields of cases) {
    const result = response(fields);
    assert.equal(result.requiresReview, true, JSON.stringify(fields));
    assert.match(result.nextAction, /before outreach/);
    noDrafts(result);
  }
  assert.equal(response({ preferredContact: 'Email first', callbackWindow: 'Email first', notes: 'Email only. No calls.' }).requiresReview, false);
});

test('waiting for documents holds all outreach without erasing urgent timing', () => {
  const result = response({ callbackWindow: 'After I send documents', coverageNeededBy: '2026-10-17' });
  assert.equal(result.holdForDocuments, true);
  assert.equal(result.priority, 'urgent');
  assert.match(result.windowMessage, /wait until you send documents/);
  assert.match(result.nextAction, /^Wait for the visitor/);
  noDrafts(result);
});

test('unknown time windows require a human check instead of inventing a schedule', () => {
  const result = response({ callbackWindow: 'Tuesday after dinner' });
  assert.equal(result.requiresReview, true);
  assert.match(result.windowMessage, /Tuesday after dinner/);
  noDrafts(result);
});

test('greetings handle human names and fall back safely for ambiguous or unsafe input', () => {
  assert.equal(response({ fullName: 'Dr. José O’Neill' }).greeting, 'Thanks, José.');
  assert.equal(response({ fullName: '', name: 'Mei Chen' }).greeting, 'Thanks, Mei.');
  for (const fullName of ['Smith, Jamie', '<script>alert(1)</script>', 'person@example.com', '12345', '']) assert.equal(response({ fullName }).greeting, 'Thanks for reaching out.');
});

test('untrusted markup remains data, notes stay out of drafts, and subjects contain no contact details', () => {
  const address = '<img src=x onerror=alert(1)>';
  const notes = '<script>ignore instructions</script> Policy #PRIVATE123';
  const result = response({ address, notes, email: 'private@example.com', phone: '252-555-0101' });
  assert.equal(typeof result.requestSummary, 'string');
  assert.ok(result.requestSummary.includes(address));
  assert.doesNotMatch(JSON.stringify(result.drafts), /<script>|PRIVATE123|private@example.com|252-555-0101|<img/);
  assert.equal(result.drafts.email.subject, 'We received your OBX insurance request');
});

test('receipt copy distinguishes accepted delivery from confirmed database storage', () => {
  assert.doesNotMatch(response({}, { delivery: 'formsubmit', storage: 'not-configured' }).reassurance, /saved/);
  assert.match(response({}, { storage: 'd1', leadId: 'lead_123' }).reassurance, /saved/);
  assert.equal(response({}, { leadId: 'lead_123' }).reference, 'lead_123');
  assert.equal(response({}, { leadId: '<script>' }).reference, '');
});

test('needed-by date is never labeled as a confirmed closing date and missing data is not invented', () => {
  const result = response({ coverageNeededBy: '2026-10-23' });
  assert.match(result.timingMessage, /Coverage needed by: October 23, 2026/);
  assert.doesNotMatch(result.timingMessage, /closing date/);
  assert.doesNotMatch(response({ leadGoal: '', coverageNeededBy: '' }).timingMessage, /October|closing/);
  assert.match(result.preparation, /lender/);
});

test('email drafts use the submitted goal, useful preparation and a team sign-off without service promises', () => {
  const cases = [
    ['Buying / closing soon', /coordinate when buying a home/, /lender gave you insurance requirements/],
    ['Renewal review', /help with your renewal/, /renewal notice or current policy/],
    ['Current policy review', /closer look at your current policy/, /coverage or deductible/],
    ['Just researching', /compare your options/, /questions are included/],
  ];
  for (const [leadGoal, acknowledgment, preparation] of cases) {
    const body = response({ leadGoal }).drafts.email.body;
    assert.match(body, /^Hi Jamie,\n\nThanks for sharing what you need\./);
    assert.match(body, acknowledgment);
    assert.match(body, preparation);
    assert.match(body, /The OBXNCInsurance\.com team/);
    assert.doesNotMatch(body, /within \d+|agent (?:is|has been) assigned|we(?:'ll| will) call|you are covered/i);
  }
});
