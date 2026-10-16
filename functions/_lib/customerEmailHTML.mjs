import { buildLeadResponse } from '../../src/leadResponse.mjs';

// Versioned public assets keep the approved artwork stable in already-sent mail.
// These are exact production copies, not generated variants or tracked URLs.
const ASSETS = 'https://www.obxncinsurance.com/email/';
const FONT = "Fraunces,Georgia,'Times New Roman',serif";
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function renderCustomerAcknowledgmentHTML(lead, { now = new Date() } = {}) {
  // Reuse the same eligibility and copy rules as the plain-text receipt. Address
  // is intentionally excluded even if a future shared summary includes it.
  const plan = buildLeadResponse({ ...lead, address: '' }, { now });
  if (plan.channel !== 'email' || plan.requiresReview || plan.holdForDocuments || !plan.drafts.email.body) return null;

  const firstName = plan.greeting.match(/^Thanks, (.+)\.$/)?.[1];
  const title = firstName
    ? `Your request is in,<br><span style="font-style:italic;font-weight:500;color:#a34424;">${escapeHTML(firstName)}.</span>`
    : 'Your request is in.';
  // Paragraph 2 is the shared category/goal acknowledgment. It never includes
  // raw notes, addresses, arbitrary categories or contact details.
  const introduction = plan.drafts.email.body.split('\n\n')[1];
  const dates = [...plan.timingMessage.matchAll(/(Coverage needed by|Current policy expiration): ([A-Za-z]+ \d{1,2}, \d{4})\./g)];
  const dateCell = dates.length ? `<td class="date" width="50%" valign="top" style="width:50%;padding-left:8px;">
    ${dates.map(([, label, date], index) => `<p style="margin:${index ? '15px' : '0'} 0 5px;font-size:16px;line-height:1.5;color:#4b5d63;">${escapeHTML(label)}</p>
    <p style="margin:0;font-family:${FONT};font-size:23px;font-weight:600;line-height:1.35;">${escapeHTML(date)}</p>`).join('')}
  </td>` : '';
  const windowNote = plan.windowMessage
    ? `<p style="margin:0 0 20px;">${escapeHTML(plan.windowMessage)}</p>` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Your OBX insurance request</title>
  <style>
    @font-face {font-family:Fraunces;src:url('${ASSETS}fraunces-variable-v1.ttf') format('truetype');font-weight:100 900;font-style:normal;font-display:swap;}
    html,body {margin:0!important;padding:0!important;width:100%!important;}
    table {border-collapse:collapse;}
    a {color:#a34424;}
    a:focus-visible {outline:3px solid #a34424;outline-offset:4px;}
    @media only screen and (max-width:620px) {
      .outer {padding:0!important;}
      .email {width:100%!important;}
      .inset {padding-left:26px!important;padding-right:26px!important;}
      .headline {font-size:38px!important;line-height:1.13!important;}
      .masthead {padding-top:24px!important;}
      .brand-name {font-size:23px!important;}
      .brand-bird {width:58px!important;height:58px!important;}
      .art {height:auto!important;}
      .letter {padding-top:26px!important;}
      .preference {display:block!important;width:100%!important;padding:0 ${dates.length ? '0 16px' : '0 0'}!important;}
      .date {display:block!important;width:100%!important;padding:0!important;}
      .button {display:block!important;text-align:center!important;padding:16px 18px!important;}
      .footer {padding-bottom:30px!important;}
    }
  </style>
  <!--[if mso]><style>body,table,td,p,a,h1,h2 {font-family:Georgia,'Times New Roman',serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#eee9df;color:#082d42;font-family:${FONT};-webkit-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;color:#fff9ef;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">We have your request and your preference for email. A human review comes next.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background-color:#eee9df;">
    <tr><td class="outer" align="center" style="padding:36px 16px;">
      <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
      <table role="presentation" class="email" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background-color:#fff9ef;">
        <tr><td class="masthead inset" align="center" style="padding:26px 42px 22px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td width="74" style="width:74px;padding-right:12px;"><img class="brand-bird" src="${ASSETS}piper-v1.png" width="74" height="74" alt="Piper, our bird guide" style="display:block;width:74px;height:74px;border:0;"></td>
              <td class="brand-name" style="font-family:${FONT};font-size:28px;line-height:1.15;font-weight:650;color:#082d42;">OBXNC <span style="font-weight:500;color:#cc6140;">Insurance</span></td>
            </tr>
          </table>
        </td></tr>
        <tr><td class="inset" align="center" style="padding:0 42px 28px;">
          <h1 class="headline" style="margin:0;font-family:${FONT};font-size:46px;font-weight:620;letter-spacing:-1.5px;line-height:1.12;color:#082d42;">${title}</h1>
          <p style="margin:18px 0 0;font-size:18px;line-height:1.6;">One step closer to a clearer picture<br>of your property insurance needs.</p>
        </td></tr>
        <tr><td style="padding:0;line-height:0;">
          <img class="art" src="${ASSETS}coastal-house-v1.jpg" width="600" alt="A painting of an Outer Banks home among sunlit dunes, with the ocean beyond." style="display:block;border:0;width:100%;height:auto;max-width:600px;color:#082d42;font-size:16px;line-height:1.5;">
        </td></tr>
        <tr><td class="inset letter" style="padding:32px 42px 0;font-size:18px;line-height:1.65;">
          <p style="margin:0 0 20px;">${escapeHTML(introduction)}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background-color:#f3e7d3;">
            <tr><td style="padding:22px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;"><tr>
                <td class="preference" ${dates.length ? 'width="50%"' : ''} valign="top" style="${dates.length ? 'width:50%;padding-right:16px;' : ''}">
                  <p style="margin:0 0 5px;font-size:16px;line-height:1.5;color:#4b5d63;">Your contact choice</p>
                  <p style="margin:0;font-family:${FONT};font-size:23px;font-weight:600;line-height:1.35;">Email, as requested</p>
                </td>
                ${dateCell}
              </tr></table>
            </td></tr>
          </table>
          <h2 style="margin:28px 0 10px;font-family:${FONT};font-size:28px;font-weight:600;line-height:1.25;">A real person takes it from here.</h2>
          <p style="margin:0 0 20px;">A human reviewer will look at your information, questions, and timing. You asked for email first, so we’re starting here. The details you shared are together with your request.</p>
          ${windowNote}
          <p style="margin:0 0 24px;">${escapeHTML(plan.preparation)} If your timing or needs change, a reply to this email is all it takes to let us know.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:separate;"><tr>
            <td bgcolor="#a34424" style="border-radius:6px;background-color:#a34424;text-align:center;mso-padding-alt:17px 25px;">
              <a class="button" href="mailto:hello@obxncinsurance.com?subject=An%20update%20to%20my%20insurance%20request" style="display:inline-block;padding:17px 25px;border:1px solid #a34424;border-radius:6px;font-family:${FONT};font-size:20px;font-weight:600;line-height:1.35;color:#fff9ef;text-decoration:none;mso-padding-alt:0;">Reply with an update</a>
            </td>
          </tr></table>
          <p style="margin:12px 0 27px;font-size:16px;line-height:1.6;color:#4b5d63;">Nothing to add? There’s nothing else to send right now.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;"><tr>
            <td width="70" valign="middle" style="width:70px;padding-right:14px;"><img src="${ASSETS}piper-v1.png" width="64" height="64" alt="" style="display:block;width:64px;height:64px;border:0;"></td>
            <td valign="middle" style="font-size:16px;line-height:1.55;">
              <p style="margin:0;font-family:${FONT};font-size:21px;font-weight:600;">A little help from Piper.</p>
              <p style="margin:3px 0 0;color:#4b5d63;">Our bird guide gathers the details.<br>People take care of the review.</p>
            </td>
          </tr></table>
        </td></tr>
        <tr><td class="inset footer" style="padding:30px 42px 38px;font-size:16px;line-height:1.65;color:#4b5d63;">
          <p style="margin:0 0 14px;">This automatic email confirms receipt of your request. It is not a quote, approval, or confirmation of insurance coverage.</p>
          <p style="margin:0;">OBXNCInsurance.com<br><a href="mailto:hello@obxncinsurance.com" style="display:inline-block;padding:8px 0;line-height:28px;color:#082d42;text-underline-offset:3px;">hello@obxncinsurance.com</a><br><a href="https://www.obxncinsurance.com/privacy-policy/" style="display:inline-block;padding:8px 0;line-height:28px;color:#082d42;text-underline-offset:3px;">Privacy policy</a></p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;
}
