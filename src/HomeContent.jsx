import { ArrowRight, Home, Wind, Waves, Umbrella } from 'lucide-react';
import { seoPages, getSeoPageBySlug } from './seoPages.js';
import { homeFaqs } from './homeContent.mjs';

const coverageLinks = [
  ['outer-banks-homeowners-insurance', Home, 'Outer Banks homeowners insurance', 'Review dwelling, belongings, liability and loss of use. Check exclusions and replacement-cost terms before comparing prices.'],
  ['obx-wind-hail-insurance', Wind, 'OBX wind and hail insurance', 'Find out whether wind is included or separate. Compare roof settlement terms, deductibles and when each deductible applies.'],
  ['outer-banks-flood-insurance', Waves, 'Outer Banks flood insurance', 'Understand flood coverage separately from homeowners insurance. Discuss the building, contents, lender requirements and effective date.'],
  ['obx-vacation-rental-insurance', Umbrella, 'OBX vacation rental insurance', 'Explain weekly guests, furnishings, amenities and rental income so the policy reflects how you use the property.'],
];

export function HomeCoverage() {
  return <>
    <section id="coverage" className="search-intent-section" aria-labelledby="coverage-title">
      <div className="search-intent-copy"><h2 id="coverage-title">Understand your Outer Banks home insurance options</h2><p>Compare the coverage your property needs, then prepare the questions you want a licensed agent to answer.</p></div>
      <div id="wind-flood" className="need-grid">{coverageLinks.map(([slug, Icon, title, text]) => <a className="coverage-guide-card" href={`/${slug}/`} key={slug}><Icon size={28} aria-hidden="true"/><h3>{title}</h3><p>{text}</p><span>Read the coverage guide <ArrowRight size={16} aria-hidden="true"/></span></a>)}</div>
      <p className="rate-summary"><a href="/outer-banks-wind-flood-insurance/">Review wind and flood insurance together</a> to organize separate policies, deductibles and closing dates for one coastal home.</p>
    </section>
    <section className="alert-center-section" aria-labelledby="next-step-title">
      <div className="alert-center-copy"><h2 id="next-step-title">Start with what is changing for your home</h2><p>Buying, renewing or renting out a property raises different insurance questions.</p></div>
      <div className="seo-related-links">
        <a href="/outer-banks-home-buyer-insurance-checklist/">Buying or closing soon: your insurance checklist</a>
        <a href="/outer-banks-insurance-renewal-review/">Renewing coverage: compare your current policy</a>
        <a href="/obx-second-home-insurance/">Using a second home: explain occupancy and rentals</a>
        <a href="/outer-banks-insurance-nonrenewal-carrier-change/">Facing nonrenewal: organize your next steps</a>
      </div>
      <p className="rate-summary">Comparing premiums? <a href="/outer-banks-property-insurance-rates/">See the 2026 Outer Banks home insurance rate guide</a> for dated NC DOI figures and the difference between base rates and your individual premium.</p>
    </section>
    <section id="how-it-works" className="trust-section" aria-labelledby="how-title">
      <div className="trust-intro"><h2 id="how-title">Know what happens when you request insurance help</h2><p>OBXNCInsurance.com provides educational guides and collects your property insurance request. The site and Piper do not issue quotes, recommend a policy or bind coverage.</p></div>
      <div className="proof-list">
        <article><div><h3>1. Share the essentials</h3><p>Tell us the address, how you use the property and when you need coverage. Optional details can be added when you have them.</p></div></article>
        <article><div><h3>2. Receive a request confirmation</h3><p>A confirmation means the request was received. It is not an insurance quote, policy approval or a guarantee of coverage.</p></div></article>
        <article><div><h3>3. Review the actual insurance terms</h3><p>A licensed North Carolina insurance professional must provide insurance advice, quotes and binding. Ask for their name, agency and license information before making a decision.</p></div></article>
      </div>
      <p id="local-agents"><a href="/obx-insurance-trust-and-source-standards/">Who operates the site, how sources are reviewed, and licensing boundaries</a>. Contact the site at <a href="mailto:obxpropertyinsurance@proton.me">obxpropertyinsurance@proton.me</a>.</p>
    </section>
  </>;
}

export function GuideDirectory() {
  const groups = [
    ['Insurance by town', seoPages.filter(p => p.category === 'town')],
    ['Coverage and property use', seoPages.filter(p => p.category !== 'town' && !/toolkit|atlas|trust-and|tide-obx/.test(p.slug))],
    ['Tools and site information', seoPages.filter(p => /toolkit|trust-and|tide-obx/.test(p.slug))],
  ];
  return <section className="seo-related-section" aria-labelledby="directory-title"><h2 id="directory-title">Explore the OBX insurance guides</h2>{groups.map(([name,pages]) => <div key={name}><h3>{name}</h3><ul className="guide-directory">{pages.map(p => <li key={p.slug}><a href={`/${p.slug}/`}>{p.eyebrow}</a></li>)}</ul></div>)}</section>;
}

export function HomeResources() {
  const towns = seoPages.filter(p => p.category === 'town');
  const selected = ['north-carolina-vacation-home-insurance','outer-banks-named-storm-deductible-guide','outer-banks-flood-zone-elevation-certificate','obx-roof-age-insurance','outer-banks-condo-insurance','obx-insurance-toolkit'].map(getSeoPageBySlug).filter(Boolean);
  return <>
    <section id="service-area" className="service-area-section" aria-labelledby="service-title"><div><h2 id="service-title">Outer Banks insurance guides by town</h2><p>Explore local home, wind, flood and rental questions, from Currituck County to Dare County and Ocracoke in Hyde County.</p></div><ul>{towns.map(p => <li key={p.slug}><a href={`/${p.slug}/`}>{p.eyebrow}</a></li>)}</ul></section>
    <section className="seo-links-section" aria-labelledby="resources-title"><h2 id="resources-title">Answers for your next insurance conversation</h2><div className="seo-related-links">{selected.map(p => <a href={`/${p.slug}/`} key={p.slug}>{p.eyebrow}</a>)}</div><p><a href="/outer-banks-insurance-atlas/">Browse every town, coverage and property guide in the insurance atlas</a>.</p></section>
    <section className="seo-faq-section" aria-labelledby="home-faq-title"><h2 id="home-faq-title">Outer Banks home insurance questions</h2><div>{homeFaqs.map(f => <article key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></article>)}</div></section>
  </>;
}
