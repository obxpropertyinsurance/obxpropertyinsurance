import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { officialSourceLinks, seoPages } from "../src/seoPages.js";

const siteUrl = "https://www.obxncinsurance.com";
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const templatePath = new URL("../dist/index.html", import.meta.url);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const quoteHrefForPage = (page) => `/?review=${encodeURIComponent(page.slug)}#quote`;

const updateMeta = (html, page) => {
  const canonical = `${siteUrl}/${page.slug}/`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        image: page.image.url,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: page.eyebrow,
        citation: page.sources?.map((source) => source.url) || [],
      },
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: page.eyebrow,
        serviceType: "Property insurance shopping and local Outer Banks, NC licensed agent review",
        areaServed: "Outer Banks, North Carolina",
        description: page.description,
        image: page.image.url,
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${canonical}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${canonical}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${escapeHtml(page.image.url)}" />`,
    )
    .replace(
      /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image:alt" content="${escapeHtml(page.image.alt)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${escapeHtml(page.image.url)}" />`,
    )
    .replace(
      "</head>",
      `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`,
    );
};

const renderStaticBody = (page) => `
      <main class="seo-static-fallback">
        <section>
          <p>${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p>${escapeHtml(page.intro)}</p>
          <p>${escapeHtml(page.support)}</p>
          <figure>
            <img src="${escapeHtml(page.image.url)}" alt="${escapeHtml(page.image.alt)}" />
            <figcaption>${escapeHtml(page.image.caption)}</figcaption>
          </figure>
          <a href="${quoteHrefForPage(page)}">Start my OBX check</a>
        </section>
        <section>
          <h2>${escapeHtml(page.intent)}</h2>
          <ul>${page.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        ${page.sections
          .map(
            (section) => `
        <section>
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>`,
          )
          .join("")}
        ${
          page.localInsights.length
            ? `<section>
          <h2>What matters for ${escapeHtml(page.eyebrow)}</h2>
          <p>A local Outer Banks review starts with the practical details that can change follow-up, timing, and available paths for this property.</p>
          <ul>${page.localInsights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <a href="${quoteHrefForPage(page)}">Start this review</a>
        </section>`
            : ""
        }
        <section>
          <h2>Insurance help for this area</h2>
          <p>People often look for ${escapeHtml(page.keywords.join(", "))}. This page helps Outer Banks, North Carolina property owners start with clear details before a local Outer Banks, NC licensed agent reviews available options.</p>
        </section>
        ${
          page.sources?.length
            ? `<section>
          <h2>Official resources to verify while you prepare</h2>
          <p>These official resources support the educational side of this guide. Quotes, advice, binding, and service still come from a licensed North Carolina insurance agent.</p>
          <ul>${page.sources
            .map(
              (source) =>
                `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>: ${escapeHtml(source.text)}</li>`,
            )
            .join("")}</ul>
        </section>`
            : ""
        }
        <section>
          <h2>Questions about ${escapeHtml(page.eyebrow)}</h2>
          ${page.faqs
            .map(
              (faq) => `
          <article>
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          </article>`,
            )
            .join("")}
        </section>
      </main>`;

const template = await readFile(templatePath, "utf8");

const homepageStaticBody = `
      <main class="seo-static-fallback">
        <section>
          <p>Outer Banks property insurance</p>
          <h1>Find Outer Banks property insurance for your coastal home</h1>
          <p>Start a free OBX property insurance check for homeowners, wind and hail, flood, second homes, vacation rentals, condos, landlord properties, and local licensed agent review.</p>
          <a href="/#quote">Request a quick OBX expert call</a>
        </section>
        <section>
          <h2>Free OBX insurance help before the first call</h2>
          <p>OBXNCInsurance.com helps homeowners organize address, timing, roof age, wind, flood, rental use, current carrier, and elevation certificate details before licensed agent follow-up.</p>
        </section>
        <section>
          <h2>Popular OBX insurance searches</h2>
          <ul>${seoPages
            .slice(0, 16)
            .map((page) => `<li><a href="/${escapeHtml(page.slug)}/">${escapeHtml(page.eyebrow)}</a></li>`)
            .join("")}</ul>
        </section>
        <section>
          <h2>Official resources homeowners can verify</h2>
          <ul>${officialSourceLinks
            .map(
              (source) =>
                `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>: ${escapeHtml(source.text)}</li>`,
            )
            .join("")}</ul>
        </section>
      </main>`;

await writeFile(
  templatePath,
  template.replace('<div id="root"></div>', `<div id="root">${homepageStaticBody}</div>`),
);

await Promise.all(
  seoPages.map(async (page) => {
    const html = updateMeta(template, page).replace(
      '<div id="root"></div>',
      `<div id="root">${renderStaticBody(page)}</div>`,
    );
    const pageDir = join(distDir, page.slug);
    await mkdir(pageDir, { recursive: true });
    await writeFile(join(pageDir, "index.html"), html);
  }),
);

const sitemapUrls = [
  { loc: `${siteUrl}/`, priority: "1.0" },
  ...seoPages.map((page) => ({ loc: `${siteUrl}/${page.slug}/`, priority: "0.8" })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(join(distDir, "sitemap.xml"), sitemap);
