import { useEffect } from 'react';
import BrandLogo from './BrandLogo.jsx';
import SiteFooter from './SiteFooter.jsx';
import { getBreadcrumbs } from './breadcrumbs.mjs';

export default function PolicyPage({ page }) {
  useEffect(() => {
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://www.obxncinsurance.com/${page.slug}/`);
  }, [page]);
  const breadcrumbs = getBreadcrumbs(page);
  return <div className="policy-page">
    <div className="policy-shell">
      <header><BrandLogo /><a href="/#quote">Request insurance help</a></header>
      <main id="main-content" tabIndex={-1}>
        <nav className="guide-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((item, index) => (
              <li key={item.href}>
                {index === breadcrumbs.length - 1
                  ? <span aria-current="page">{item.name}</span>
                  : <a href={item.href}>{item.name}</a>}
              </li>
            ))}
          </ol>
        </nav>
        <h1>{page.heading}</h1>
        <p>Updated October 16, 2026</p>
        {page.sections.map(section => <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map(text => <p key={text}>{text}</p>)}
        </section>)}
        <p><a href="mailto:obxpropertyinsurance@proton.me">Contact us about privacy or accessibility</a></p>
      </main>
    </div>
    <SiteFooter />
  </div>;
}
