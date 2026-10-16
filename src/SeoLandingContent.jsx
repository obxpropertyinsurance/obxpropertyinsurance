import { useState } from 'react';
import { ArrowUpRight, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getBreadcrumbs } from './breadcrumbs.mjs';
import { getGuideImage } from './guidePresentation.mjs';
import { getSeoPageBySlug, seoPages } from './seoPages.js';
import { GuideDirectory } from './HomeContent.jsx';

function QuoteLink({ href, className = 'guide-button' }) {
  return <a className={className} href={href}>Prepare my insurance request <ArrowUpRight size={22} aria-hidden="true" /></a>;
}

function Preparation({ page, onAskPiper }) {
  const [checked, setChecked] = useState([]);
  const toggle = item => setChecked(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]);
  return <section className="guide-preparation guide-wrap" aria-label="Prepare for your property review" data-piper-inline>
    <div className="guide-piper-panel">
      <div className="guide-piper-intro">
        <img src="/brand/piper-mark.png" width="112" height="130" alt="" />
        <div><p className="guide-eyebrow">A little help getting started</p><h2>Ask Piper</h2></div>
      </div>
      <p>Have a question before you begin? Piper, our automated guide, helps you find your next step.</p>
      <button type="button" className="guide-button guide-light" onClick={onAskPiper}>Ask Piper <ArrowUpRight size={22} aria-hidden="true" /></button>
      <p className="guide-trust"><ShieldCheck size={22} aria-hidden="true" /><span>No spam. No lead selling.<br />No pressure parade. Just local guidance.</span></p>
    </div>
    <div className="guide-checklist-panel">
      <div className="guide-checklist-heading"><h2>{page.intent}</h2><span className="guide-progress" aria-live="polite">{checked.length} of {page.checklist.length} checked</span></div>
      <p className="guide-checklist-hint">Check off what you have. You can start with what you know.</p>
      <div className="guide-checklist">{page.checklist.map((item,index) => <label key={item}>
        <input type="checkbox" id={`guide-check-${index}`} checked={checked.includes(item)} onChange={() => toggle(item)} />
        <span>{item}</span>
      </label>)}</div>
    </div>
  </section>;
}

export default function SeoLandingContent({ page, quoteHref, onAskPiper }) {
  const image = getGuideImage(page);
  const breadcrumbs = getBreadcrumbs(page);
  const relatedPages = page.relatedSlugs?.length
    ? page.relatedSlugs.map(getSeoPageBySlug).filter(Boolean).filter(related => related.slug !== page.slug)
    : seoPages.filter(related => related.slug !== page.slug).slice(0,6);
  return <main className="seo-page guide-page" id="main-content" tabIndex={-1}>
    <nav className="guide-breadcrumbs guide-wrap" aria-label="Breadcrumb"><ol>{breadcrumbs.map((crumb,index) => <li key={crumb.href} aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>
      {index === breadcrumbs.length - 1 ? <span>{crumb.name}</span> : <a href={crumb.href}>{crumb.name}</a>}
    </li>)}</ol></nav>
    <section className="guide-hero guide-wrap" aria-labelledby="seo-title">
      <div className="guide-hero-heading"><p className="guide-eyebrow">{page.eyebrow}</p><h1 id="seo-title">{page.h1}</h1></div>
      <div className="guide-hero-actions"><QuoteLink href={quoteHref} /><a className="guide-text-link" href="/outer-banks-insurance-atlas/">View insurance atlas <ArrowUpRight size={19} aria-hidden="true" /></a></div>
      <figure className="guide-hero-photo">
        <img src={image.url} alt={image.alt} loading="eager" decoding="async" width="1280" height="854" fetchPriority="high" />
        <figcaption><span>{image.caption}</span><a href={image.creditUrl} target="_blank" rel="noreferrer">Photo: {image.credit}{image.license ? ` · ${image.license}` : ''}</a></figcaption>
      </figure>
      <div className="guide-hero-copy"><p>{page.intro}</p></div>
    </section>
    <Preparation key={page.slug} page={page} onAskPiper={onAskPiper} />
    <p className="guide-scope-note guide-wrap">{page.support}</p>
    <section className="guide-guide-grid guide-wrap" aria-label={`${page.eyebrow} guide`}>
      {page.sections.map((section,index) => <article key={section.heading}>
        <span className="guide-chapter" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span>
        <div><h2>{section.heading}</h2><p>{section.body}</p>
          {section.links?.length > 0 && <div className="guide-article-links">{section.links.map(link => <a key={link.slug || link.href} href={link.href || `/${link.slug}/`}>{link.label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}</div>}
        </div>
      </article>)}
    </section>
    {page.dataTable && <section className="guide-data-section guide-wrap" aria-labelledby="seo-data-title">
      <div className="guide-data-copy"><p className="guide-eyebrow">{page.dataTable.eyebrow}</p><h2 id="seo-data-title">{page.dataTable.title}</h2><p>{page.dataTable.intro}</p></div>
      <div className="guide-data-table-wrap" role="region" aria-label="Scrollable rate comparison table" tabIndex={0}>
        <table><thead><tr>{page.dataTable.columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
          <tbody>{page.dataTable.rows.map(row => <tr key={row.territory || JSON.stringify(row)}>{page.dataTable.columns.map(column => <td key={column.key}>{row[column.key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {page.dataTable.note && <p className="guide-data-note">{page.dataTable.note}</p>}
    </section>}
    {page.localInsights.length > 0 && <section className="guide-local-band" aria-labelledby="seo-local-details-title"><div className="guide-local-inner guide-wrap">
      <div className="guide-local-heading"><p className="guide-eyebrow">Property details to discuss</p><h2 id="seo-local-details-title">What matters for {page.eyebrow}</h2><p>A local Outer Banks review starts with the practical details that can change follow-up, timing, and available paths for this property.</p><QuoteLink href={quoteHref} /></div>
      <div className="guide-local-list">{page.localInsights.map(insight => <article key={insight}><span className="guide-check-circle" aria-hidden="true"><Check size={17} /></span><p>{insight}</p></article>)}</div>
    </div></section>}
    <section className="guide-topic guide-wrap" aria-labelledby="seo-topic-title"><h2 id="seo-topic-title">Insurance help for this area</h2><p>{page.topicHelpText || `Use this guide when you are trying to understand ${page.eyebrow}. Start with the property facts that can shape the review: address, occupancy, rental use, roof age, wind exposure, flood questions, current coverage, and timing.`}</p></section>
    {page.sources?.length > 0 && <section className="guide-sources guide-wrap" aria-labelledby="seo-source-title">
      <div className="guide-sources-heading"><p className="guide-eyebrow">Official-source context</p><h2 id="seo-source-title">Resources to verify while you prepare</h2><p>These official resources support the educational side of the guide. Your property-specific quotes, advice, binding, and servicing still come from a licensed North Carolina insurance agent.</p>{page.lastReviewed && <p className="guide-reviewed">Last reviewed: {page.lastReviewed}</p>}</div>
      <div className="guide-resource-list">{page.sources.map(source => <a href={source.url} key={source.name} target="_blank" rel="noreferrer"><span><strong>{source.name}</strong><small>{source.text}</small></span><ExternalLink size={18} aria-hidden="true" /></a>)}</div>
    </section>}
    <section className="guide-faq-section guide-wrap" aria-labelledby="seo-faq-title"><div><p className="guide-eyebrow">A few helpful answers</p><h2 id="seo-faq-title">Questions about {page.eyebrow}</h2></div><div className="guide-faq-list">{page.faqs.map((faq,index) => <details key={faq.question} open={index === 0}><summary><h3>{faq.question}</h3><span className="guide-expand" aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>
    {page.slug === 'outer-banks-insurance-atlas' && <GuideDirectory />}
    <section className="guide-related guide-wrap" aria-labelledby="related-title"><h2 id="related-title">Related OBX insurance pages</h2><div>{relatedPages.slice(0,6).map(related => <a href={`/${related.slug}/`} key={related.slug}>{related.eyebrow}<ArrowUpRight size={18} aria-hidden="true" /></a>)}</div></section>
  </main>;
}
