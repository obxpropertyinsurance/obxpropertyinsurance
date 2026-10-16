import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyAcquisition, normalizeAcquisition, createAcquisition } from './acquisition.mjs';
import { validateContact } from './intakeValidation.mjs';

test('acquisition only accepts fixed source labels and known paths', () => {
  assert.equal(classifyAcquisition('?utm_source=chatgpt.com&email=private@example.com'), 'chatgpt');
  assert.equal(classifyAcquisition('?utm_source=private@example.com'), 'direct');
  assert.equal(classifyAcquisition('', 'https://www.google.com/search?q=private'), 'google');
  assert.deepEqual(normalizeAcquisition({ acquisitionSource:'private', originalLandingPath:'/private?email=x',requestPath:'/unknown' },new Set(['/'])), { acquisitionSource:'',originalLandingPath:'',requestPath:'/' });
});
test('acquisition persistence requires consent and honors GPC', () => {
  let choice = null; const data = new Map();
  const win = { location:{pathname:'/',search:'?utm_source=chatgpt.com'},navigator:{},sessionStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)} };
  const tracker = createAcquisition({win,doc:{referrer:''},paths:new Set(['/','/duck/']),consent:()=>choice});
  assert.deepEqual(tracker.context(), {requestPath:'/'}); assert.equal(data.size,0);
  choice='granted'; assert.equal(tracker.context().acquisitionSource,'chatgpt');
  win.location.pathname='/duck/'; assert.equal(tracker.context().originalLandingPath,'/');
  win.navigator.globalPrivacyControl=true; assert.deepEqual(tracker.context(),{requestPath:'/duck/'}); assert.equal(data.size,0);
});
test('email requests accept no phone; requested phone/text requires one', () => {
  const lead={address:'Example property',fullName:'Test',email:'test@example.com',phone:'',preferredContact:'Email first'};
  assert.deepEqual(validateContact(lead), []);
  assert.deepEqual(validateContact({...lead,preferredContact:'Phone call'}), ['phone number']);
  assert.deepEqual(validateContact({...lead,preferredContact:'Text first'}), ['phone number']);
  assert.deepEqual(validateContact({...lead,preferredContact:''}), ['contact preference']);
});
