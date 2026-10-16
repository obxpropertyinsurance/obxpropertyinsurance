import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionIdentity } from './submissionIdentity.mjs';

test('identical retries keep their ID even when submission time or key order changes', () => {
  let count = 0;
  const identity = createSubmissionIdentity({ makeId: () => `id-${++count}` });
  assert.equal(identity.get({ email: 'fixture@example.com', notes: 'Wind question', submittedAt: 'first' }), 'id-1');
  assert.equal(identity.get({ submittedAt: 'retry', notes: 'Wind question', email: 'fixture@example.com' }), 'id-1');
  assert.equal(count, 1);
});

test('edited inquiries and an explicit new inquiry get new IDs; separate forms never share IDs', () => {
  let count = 0;
  const makeId = () => `id-${++count}`;
  const quote = createSubmissionIdentity({ makeId }), guide = createSubmissionIdentity({ makeId });
  assert.equal(quote.get({ email: 'fixture@example.com' }), 'id-1');
  assert.equal(quote.get({ email: 'edited@example.com' }), 'id-2');
  quote.reset(); // Also resets when an edit is later reverted to its original value.
  assert.equal(quote.get({ email: 'edited@example.com' }), 'id-3');
  assert.equal(guide.get({ email: 'edited@example.com' }), 'id-4');
});

test('a browser without UUID support can still submit the original lead flow', () => {
  const identity = createSubmissionIdentity({ makeId: () => { throw Error('unavailable'); } });
  assert.equal(identity.get({ email: 'fixture@example.com' }), undefined);
  identity.reset();
  assert.equal(identity.get({ email: 'fixture@example.com' }), undefined);
});
