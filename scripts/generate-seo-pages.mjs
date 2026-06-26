import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { seoPages } from "../src/seoPages.js";

const siteUrl = "https://www.obxncinsurance.com";
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const templatePath = new URL("../dist/index.html", import.meta.url);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: page.eyebrow,
      },
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: page.eyebrow,
        serviceType: "Property insurance intake and licensed agency review",
        areaServed: "Outer Banks, North Carolina",
        description: page.description,
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
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
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
          <a href="/#quote">Start my OBX check</a>
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
