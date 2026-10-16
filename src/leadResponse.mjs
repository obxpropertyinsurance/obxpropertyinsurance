// Shared receipt and working-draft copy. All values are plain text, never HTML.
// Call only after the request has been accepted. This module does not send messages.
const DAY = 86_400_000;
const text = (value, limit = 1200) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
const channels = {
  'phone call': ['phone', 'Phone call'],
  'text first': ['text', 'Text first'],
  'email first': ['email', 'Email first'],
};
const topics = {
  'Homeowners + wind review': 'homeowners and wind review',
  'Flood guidance': 'flood insurance review',
  'Rental-use clarity': 'rental-property insurance review',
};
const goals = {
  'Buying / closing soon': 'buying or closing soon',
  'Renewal review': 'a renewal review',
  'Current policy review': 'a review of your current policy',
  'New policy for owned property': 'a new policy for a property you own',
  'Adding another property': 'adding another property',
  'Just researching': 'researching your options',
};

function firstName(value) {
  const name = text(value, 120);
  // Do not guess which part is the given name in a comma-separated name, or
  // greet a visitor using markup, an email address, or arbitrary pasted text.
  if (!name || !/^[\p{L}\p{M}\s.'’\-]+$/u.test(name)) return '';
  const parts = name.split(' ');
  if (/^(?:mr|mrs|ms|miss|mx|dr|prof)\.?$/i.test(parts[0])) parts.shift();
  const first = parts[0] || '';
  return first.length <= 40 && /\p{L}/u.test(first) ? first : '';
}

function todayInNewYork(now) {
  const date = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / DAY;
}

function requestedDate(value, label, today) {
  const raw = text(value, 120);
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { label, raw, valid: false, wording: `${label}: ${raw} (as entered).` };
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(`${raw}T12:00:00Z`);
  if (year < 1000 || !Number.isFinite(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    return { label, raw, valid: false, wording: `${label}: ${raw} (please confirm the date).` };
  }
  const display = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  return { label, raw, valid: true, display, days: today === null ? null : Date.UTC(year, month - 1, day) / DAY - today, wording: `${label}: ${display}.` };
}

function noteRestrictions(notes, channel) {
  const value = notes.toLowerCase().replace(/[’‘]/g, "'");
  const reasons = [];
  const forbidden = {
    phone: /\b(?:no (?:phone )?calls?|(?:do not|don't|never|cannot|can't) (?:phone|call)|(?:do not|don't) (?:want|accept|take) (?:any )?(?:phone )?calls?)\b/,
    text: /\b(?:no (?:texts?|sms|text messages?)|(?:do not|don't|never) (?:text|sms)|(?:do not|don't) (?:want|accept) (?:any )?(?:texts?|sms|text messages?))\b/,
    email: /\b(?:no e-?mails?|(?:do not|don't|never) e-?mail|(?:do not|don't) (?:want|accept) (?:any )?e-?mails?)\b/,
  };
  if (forbidden[channel]?.test(value)) reasons.push('The written instructions restrict the selected contact channel.');
  const requested = {
    phone: /\b(?:(?:phone|call)(?: me)? (?:only|first)|only (?:phone|call)|(?:please|prefer(?:red)?) (?:a )?(?:phone call|call))\b/,
    text: /\b(?:(?:text|sms)(?: me)? (?:only|first)|only (?:text|sms)|(?:please|prefer(?:red)?) (?:a )?(?:text|sms))\b/,
    email: /\b(?:e-?mail(?: me)? (?:only|first)|only e-?mail|(?:please|prefer(?:red)?) (?:an? )?e-?mail)\b/,
  };
  if (Object.entries(requested).some(([requestedChannel, expression]) => requestedChannel !== channel && expression.test(value))) {
    reasons.push('The written instructions request a different contact channel.');
  }
  const contactWords = { phone: '(?:phone|calls?)', text: '(?:text|sms)', email: 'e-?mail' };
  if (Object.entries(contactWords).some(([requestedChannel, words]) => requestedChannel !== channel && new RegExp(`\\b(?:(?:contact|reach)(?: me)? (?:by|via) ${words}|${words}(?: me)? instead|(?:prefer|want|would like) (?:to be contacted |contact )?(?:by |via )?${words})\\b`).test(value))) {
    reasons.push('The written instructions describe a different contact method.');
  }
  if (contactWords[channel] && new RegExp(`\\b(?:not (?:by |via )?${contactWords[channel]}|${contactWords[channel]} (?:is not|isn't) (?:okay|ok|an option))\\b`).test(value)) {
    reasons.push('The written instructions exclude the selected contact method.');
  }
  if (/\b(?:(?:do not|don't|never) contact|no (?:further )?contact|stop (?:contacting|calling|texting|emailing)|unsubscribe)\b/.test(value)) {
    reasons.push('The written instructions include a contact restriction that needs review.');
  }
  if (/\b(?:after|before|until|only (?:on|at)|not (?:on|before))\b/.test(value) && /\b(?:call|phone|text|sms|email|e-mail|contact|reach|documents?)\b/.test(value)) {
    reasons.push('The written instructions include contact timing that needs review.');
  }
  return reasons;
}

function preparationFor(lead) {
  if (lead.leadGoal === 'Buying / closing soon') return 'If your lender gave you insurance requirements, keep them handy for your review.';
  if (lead.leadGoal === 'Renewal review') return 'If you have your renewal notice or current policy handy, it can help with your review.';
  if (lead.leadGoal === 'Current policy review') return 'Keep your current policy handy, especially the coverage or deductible you would like help understanding.';
  if (lead.selectedCoverage === 'Flood guidance') return 'If you already have an elevation certificate, keep it handy. It is okay if you are unsure.';
  if (lead.propertyUse === 'Vacation rental' || lead.selectedCoverage === 'Rental-use clarity') return 'Keep any details about how you rent the home handy for your review.';
  return 'Your questions are included, so the review can start with what matters to you.';
}

export function buildLeadResponse(lead = {}, { now = new Date(), delivery, storage, leadId } = {}) {
  const value = lead && typeof lead === 'object' ? lead : {};
  const name = firstName(value.fullName || value.name);
  const greeting = name ? `Thanks, ${name}.` : 'Thanks for reaching out.';
  const preference = text(value.preferredContact, 80);
  const [channel, channelLabel] = channels[preference.toLowerCase()] || ['review', preference === 'No preference' ? 'No preference selected' : 'Contact preference needs review'];
  const window = text(value.callbackWindow, 120);
  const holdForDocuments = window.toLowerCase() === 'after i send documents';
  const reasons = [];
  if (channel === 'review') reasons.push(preference.toLowerCase() === 'no preference' ? 'No contact channel was selected; a person must confirm the next step.' : 'The contact preference is missing or unrecognized.');
  if (window.toLowerCase() === 'email first' && channel !== 'email') reasons.push('The contact preference and best-time selection request different channels.');
  reasons.push(...noteRestrictions(text(value.notes), channel));
  const knownWindows = ['as soon as available', 'morning', 'afternoon', 'evening', 'after i send documents', 'email first'];
  if (window && !knownWindows.includes(window.toLowerCase())) reasons.push('The requested contact window needs a human check.');

  const today = todayInNewYork(now);
  if (today === null) reasons.push('The current date is unavailable; confirm timing before follow-up.');
  const dates = [requestedDate(value.coverageNeededBy, 'Coverage needed by', today), requestedDate(value.policyExpiration, 'Current policy expiration', today)].filter(Boolean);
  let priority = 'standard';
  for (const date of dates) {
    if (!date.valid) { reasons.push(`${date.label} was entered as “${date.raw}”; confirm the date without guessing.`); continue; }
    if (date.days === null) continue;
    if (date.days < 0) reasons.push(`${date.label} is in the past; confirm the current timing.`);
    if (date.days <= 2) priority = 'urgent';
    else if (date.days <= 7 && priority !== 'urgent') priority = 'soon';
  }
  const requiresReview = reasons.length > 0;
  if (requiresReview && priority === 'standard') priority = 'review';
  const priorityLabel = { urgent: 'Urgent timing', soon: 'Needed within 7 days', standard: 'Standard review', review: 'Needs human review' }[priority];
  const topic = topics[text(value.selectedCoverage, 120)] || 'OBX property insurance request';
  const address = text(value.address, 250);
  const requestSummary = `We received your ${topic}${address ? ` for ${address}` : ''}.`;
  const goal = goals[text(value.leadGoal, 100)];
  const timingMessage = dates.length ? dates.map(date => date.wording).join(' ') : goal ? `Your request includes ${goal}.` : 'Your insurance needs are included with your request.';
  let contactMessage = {
    phone: 'Your preference for a phone call is included with your request.',
    text: 'Your preference for a text first is included with your request.',
    email: 'Your preference for email first is included with your request.',
    review: 'A person needs to confirm how you would like to be contacted before follow-up.',
  }[channel];
  if (requiresReview && channel !== 'review') contactMessage += ' Your contact or timing instructions need a human check before follow-up.';
  const windowMessage = holdForDocuments ? 'You asked us to wait until you send documents. That instruction is included with your request.'
    : window.toLowerCase() === 'as soon as available' ? 'You asked for follow-up as soon as available. A contact time has not been scheduled.'
      : window && window.toLowerCase() !== 'email first' ? `Requested time: ${window}. A contact time has not been scheduled.` : '';
  const preparation = preparationFor(value);
  const reassurance = storage === 'd1' ? 'Your request details are saved, including your questions and preferences. There is no need to start over.' : 'Your questions and preferences are included with your request. There is no need to start over.';
  const referenceValue = text(leadId || value.leadId, 100);
  const reference = /^[a-zA-Z0-9_-]{1,100}$/.test(referenceValue) ? referenceValue : '';
  const nextAction = holdForDocuments ? 'Wait for the visitor to send documents. Keep the timing flag visible and review any conflicting instructions before contact.'
    : requiresReview ? 'Review the original instructions and confirm the contact channel and timing before outreach. Do not choose another channel automatically.'
      : channel === 'phone' ? 'Phone contact was requested. Assign a staffed callback owner before arranging a call in the requested window. Do not substitute an email or text.'
        : channel === 'text' ? 'Text contact was requested. Confirm permission and a monitored two-way texting service before outreach. Do not substitute a call or email.'
          : 'Review the request, then follow up by email through a monitored inbox. Do not substitute a call or text.';

  // Working drafts are intentionally absent for holds or ambiguous requests.
  // They are not a delivery queue, consent record, or evidence of a sent message.
  const drafts = { email: { subject: '', body: '' }, sms: '', call: '' };
  if (!requiresReview && !holdForDocuments) {
    const hello = name ? `Hi ${name},` : 'Hello,';
    const received = `Thanks for sharing what you need. We received your ${topic}.`;
    const dateCopy = dates.filter(date => date.valid).map(date => date.wording).join(' ');
    if (channel === 'email') {
      const goalAcknowledgment = {
        'Buying / closing soon': 'We know there can be a lot to coordinate when buying a home.',
        'Renewal review': 'We noted that you want help with your renewal.',
        'Current policy review': 'We noted that you want a closer look at your current policy.',
        'New policy for owned property': 'We noted that you need a new policy for a property you already own.',
        'Adding another property': 'We noted that you are adding another property to your insurance needs.',
        'Just researching': 'You are welcome to ask questions as you compare your options.',
      }[text(value.leadGoal, 100)] || '';
      drafts.email = {
        subject: 'We received your OBX insurance request',
        body: `${hello}\n\n${received}${goalAcknowledgment ? ` ${goalAcknowledgment}` : ''}${dateCopy ? `\n\n${dateCopy}` : ''}\n\nYou asked for email first, so we are starting here. The details you shared are together with your request, so there is no need to start over.\n\n${preparation}\n\nIf your timing or contact preference changes, just reply and let us know.\n\nThe OBXNCInsurance.com team\n\nThis confirms receipt of your request. It does not confirm insurance coverage.`,
      };
    } else if (channel === 'text') {
      drafts.sms = `OBXNCInsurance.com: ${name ? `Thanks, ${name}.` : 'Thanks for reaching out.'} We received your ${topic}.${dateCopy ? ` ${dateCopy}` : ''} You asked for text first, so we are starting here. If your timing changes, reply to let us know. Reply STOP to stop texts.`;
    } else if (channel === 'phone') {
      drafts.call = `${name ? `Hello, may I speak with ${name}?` : 'Hello.'} I am calling about the insurance request you sent to OBXNCInsurance.com. You asked for a phone call about your ${topic}.${dateCopy ? ` ${dateCopy}` : ''} Is now a good time to go over what you need?`;
    }
  }
  return { heading: 'We have received your request', greeting, channel, channelLabel, contactMessage, windowMessage, requestSummary, timingMessage, preparation, reassurance, reference, priority, priorityLabel, reasons, holdForDocuments, requiresReview, nextAction, drafts };
}
