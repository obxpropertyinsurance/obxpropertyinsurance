import { buildLeadResponse } from './leadResponse.mjs';

// This is an internal notification, not a message sent to the visitor.
// Keep private request details out of subjects and notification previews.
export const leadNotificationSubject = 'New OBX insurance lead';
export const leadNotificationFooter = 'Read the visitor’s full instructions before contact. Use only their requested channel and time; do not substitute email for a requested call or text. Phone and text follow-up require a staffed team before activation. Quotes, advice, binding, and servicing require a licensed insurance professional. Do not add the visitor to unrelated marketing.';

export function leadRoutingRows(lead, options = {}) {
  const response = buildLeadResponse(lead, options);
  return [
    ['Requested contact', response.channelLabel],
    ['Requested contact time', lead.callbackWindow || 'Not specified'],
    ['Timing priority', response.priorityLabel],
    ['Next action', response.nextAction],
    ['Wait for documents', response.holdForDocuments ? 'Yes — hold outreach' : 'No'],
    ['Review before contact', response.reasons.join(' ')],
  ];
}
