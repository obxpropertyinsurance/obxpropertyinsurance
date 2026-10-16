// Website notice based on the audited code and observed inquiry handling.
// Operational questions and deployment limits are recorded in docs/piper-rollout-audit.md.
export const policyPages = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy | OBXNCInsurance.com',
    description: 'How OBXNCInsurance.com handles inquiries, browser storage, and optional website analytics.',
    heading: 'Your information and your choices',
    sections: [
      {
        heading: 'Privacy policy · Effective 2026-10-15',
        paragraphs: [
          'This policy describes information handled through OBXNCInsurance.com, including requests for an Outer Banks property insurance review. It does not replace a separate privacy notice provided by an insurance agency or insurer when you apply for or obtain insurance.',
        ],
      },
      {
        heading: 'Information you provide',
        paragraphs: [
          'When you send a review request, we receive the contact and property details you enter. These may include your name, email address, phone number, preferred contact method, property address and use, insurance timing, current carrier, policy expiration, roof and building details, coverage interests, and notes. Required fields are identified on the form.',
          'Please do not include Social Security numbers, payment information, medical information, passwords, or documents containing sensitive information in the notes field. Tide’s current preparation guidance uses prepared website content; it does not send your conversation to an external generative AI service.',
        ],
      },
      {
        heading: 'How requests are used and delivered',
        paragraphs: [
          'We use the information you submit to receive and respond to your requested review, organize the details you provide, and operate and protect the service. Submitting a request does not bind insurance coverage.',
          'The website uses Cloudflare for hosting and request processing. FormSubmit delivers inquiries to our Proton Mail inbox and may receive a request directly from your browser as a delivery fallback. The submission system also supports storage in a Cloudflare D1 request database when that connection is enabled, and Resend email delivery when configured. A request can be saved even if an email notification fails.',
          'Email notifications can include your contact and property information, notes, the source page, and your IP address. Request storage also includes submission times and browser information. These service providers process information as part of delivering the service. We do not sell your inquiry to lead marketplaces or use it to add you to unrelated marketing lists.',
          'We also keep inquiries in a private lead-management database so we can track replies and follow-up. Those records can include your submitted details, correspondence, inquiry status, assigned reviewer, follow-up dates, and internal service notes. This database is separate from the public website and is not published with website files.',
          'Information needed to handle an insurance request may be provided to the licensed insurance professional handling that request. An agency or insurer may provide a separate notice describing its own information practices. We may also disclose information where required by law or reasonably necessary to protect the service or address fraud.',
        ],
      },
      {
        heading: 'Browser storage and optional analytics',
        paragraphs: [
          'The website uses browser storage to remember your analytics choice and whether you have opened or dismissed Tide. Information entered into the current guide or form stays in the page until you submit it or leave or reload the page. You can remove browser-stored preferences through your browser’s site-data controls.',
          'Earlier versions may have saved submitted form details in your browser. The updated website no longer creates those copies. You can remove older copies using Clear older saved form details in Analytics choices. This does not delete requests already received by the website or email services.',
          'Optional Google Analytics is off unless it has been enabled for the website and you choose Allow analytics. Declining is available alongside accepting and does not prevent you from using the website or sending a request. Google Analytics does not load before you accept. The property is configured to retain event and user data for 14 months without extending user retention on each return visit; aggregate reports may remain available longer. You can revisit your choice through Analytics choices. A browser Global Privacy Control signal keeps optional analytics off.',
          'If you accept enabled analytics, Google receives technical usage information and cookies may distinguish visits. We measure fixed website actions such as opening the guide, viewing a form step, clicking a link, and completing a request. Our analytics events exclude names, email addresses, phone numbers, property addresses, notes, conversation text, and other freeform answers. Analytics page information excludes URL query strings and fragments. Advertising storage and personalization are not enabled by this website’s analytics configuration.',
          'Changing your choice stops future analytics collection through this implementation; it does not undo information already received by Google. Analytics is separate from the technical information needed to receive a request and run the website.',
        ],
      },
      {
        heading: 'Retention, access, and requests',
        paragraphs: [
          'Submitted information can exist in our private lead-management database, website request storage where enabled, delivery services, and email records. The lead-management database does not automatically delete records after a fixed period. Retention and removal depend on the record’s purpose, provider settings, and any applicable insurance or other recordkeeping obligations. A provider deleting its own copy does not delete our email or database copies.',
          'To ask about your information, correct a request, request deletion, or raise a privacy concern, email obxpropertyinsurance@proton.me. We may need to verify the request and explain any records that must be kept. Any rights and exceptions depend on the law that applies to your situation. Avoid sending sensitive documents in an initial email.',
        ],
      },
      {
        heading: 'Protecting information',
        paragraphs: [
          'The public website uses HTTPS. The private lead dashboard currently runs on the operator’s computer and is not available as a public website. Access to email and provider systems depends on the access controls for those accounts. No website, email service, or storage system can guarantee absolute security. Please contact us promptly if you believe information connected with your inquiry has been exposed or misused.',
          'The service is intended for adults researching property insurance. Please do not submit information about children or sensitive documents through the inquiry form. Information may be processed in locations where our service providers operate.',
        ],
      },
      {
        heading: 'Changes and other services',
        paragraphs: [
          'Links to other websites take you to services with their own privacy practices. We may update this policy when the website or its practices change and will update the effective date. Questions about this policy can be sent to obxpropertyinsurance@proton.me.',
        ],
      },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility | OBXNCInsurance.com',
    description: 'Our accessibility goal, ongoing review, and how to report a barrier on OBXNCInsurance.com.',
    heading: 'Making the website easier to use',
    sections: [
      {
        heading: 'Accessibility statement · Effective 2026-10-15',
        paragraphs: [
          'Our target is the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. Accessibility work is ongoing. This statement is a statement of intent and current review status, not a certification or a claim that every page and interaction conforms.',
        ],
      },
      {
        heading: 'What we are working on',
        paragraphs: [
          'Our review focuses on readable text, sufficient contrast, clear field labels and errors, keyboard operation, visible focus, useful text alternatives, and layouts that remain usable when enlarged or viewed on a small screen. Interactive artwork should have ordinary labeled controls so that using the picture is not the only way to access its information.',
          'Automated checks cover only part of accessibility. Manual keyboard and screen-reader checks across the complete inquiry and review-notes journeys remain part of the work needed before we can make a broader conformance claim.',
        ],
      },
      {
        heading: 'Report a barrier or request help',
        paragraphs: [
          'If something prevents you from using the website, email obxpropertyinsurance@proton.me. Please describe the page, the action you were trying to take, and what went wrong. Your browser and assistive technology can help us reproduce the issue, but you do not need to disclose a disability or medical information.',
          'You can also use that address to request help with information or a review request when a website feature is inaccessible. External websites linked from this site have their own accessibility practices.',
        ],
      },
    ],
  },
];
