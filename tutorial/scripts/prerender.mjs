// Prerenders every page as static HTML with per-page meta tags and structured data,
// and writes sitemap.xml, robots.txt, llms.txt, llms-full.txt and a Markdown version of
// each page. Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mdxToMarkdown } from './mdx-to-md.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://learn.datacontract.com'
const LANGS = ['en', 'de']
const PUBLISHED = '2026-10-04'

const { render, chapters, parts, exerciseNumber, href, t } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href)
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const videos = JSON.parse(readFileSync(join(root, 'public/videos/videos.json'), 'utf8'))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const url = (lang, slug) => SITE + href(lang, slug)
const mdxPath = (lang, slug) => join(root, 'src/content', lang, `${slug}.mdx`)
const stepsWithTitles = (lang, slug) =>
  [...readFileSync(mdxPath(lang, slug), 'utf8').matchAll(/<Step id="([^"]+)" title="([^"]+)">/g)].map((m) => ({ id: m[1], title: m[2] }))
const isoDuration = (seconds) => `PT${Math.floor(seconds / 60)}M${Math.round(seconds % 60)}S`

const publisher = { '@type': 'Organization', name: 'Entropy Data', url: 'https://www.entropy-data.com', logo: `${SITE}/entropy-data-logo.svg` }

function pageTitle(lang, chapter) {
  const ui = t(lang)
  const number = exerciseNumber(chapter.slug)
  if (chapter.slug === 'welcome') return `${ui.title}: ${ui.subtitle}`
  return `${number ? `${ui.exercise} ${number}: ` : ''}${chapter.title[lang]} · ${ui.title}`
}

function structuredData(lang, chapter) {
  const ui = t(lang)
  const part = parts.find((p) => p.id === chapter.part)
  const data = [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ui.title, item: url(lang, 'welcome') },
      ...(chapter.slug === 'welcome' ? [] : [{ '@type': 'ListItem', position: 2, name: chapter.title[lang], item: url(lang, chapter.slug) }]),
    ],
  }]
  if (chapter.slug === 'welcome') {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: ui.title,
      description: ui.subtitle,
      url: url(lang, 'welcome'),
      inLanguage: lang,
      isAccessibleForFree: true,
      educationalLevel: 'Beginner',
      teaches: ['Data contracts', 'Open Data Contract Standard (ODCS)', 'Open Data Product Standard (ODPS)', 'Data Contract CLI', 'Contract-first data products', 'Consumer-driven contracts', 'CI/CD for data contracts', 'Semantics and ontologies'],
      keywords: 'data contract, ODCS, ODPS, data product, data mesh, Data Contract CLI, data quality, CI/CD, GitHub Actions',
      provider: publisher,
      publisher,
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT6H' },
      hasPart: chapters.filter((c) => c.exercise).map((c) => ({ '@type': 'LearningResource', name: c.title[lang], url: url(lang, c.slug) })),
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR', category: 'Free' },
    })
  } else {
    const steps = stepsWithTitles(lang, chapter.slug)
    if (steps.length) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: chapter.title[lang],
        description: chapter.summary[lang],
        inLanguage: lang,
        totalTime: `PT${chapter.minutes}M`,
        isPartOf: { '@type': 'Course', name: ui.title, url: url(lang, 'welcome') },
        about: part?.title[lang],
        publisher,
        step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, url: `${url(lang, chapter.slug)}#step-${s.id}` })),
      })
    }
  }
  if (chapter.video && videos[chapter.slug]) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${chapter.title[lang]} (walkthrough)`,
      description: chapter.summary[lang],
      thumbnailUrl: `${SITE}/videos/${chapter.slug}.webp`,
      contentUrl: `${SITE}/videos/${chapter.slug}.mp4`,
      uploadDate: PUBLISHED,
      duration: isoDuration(videos[chapter.slug].duration),
      inLanguage: 'en',
      publisher,
    })
  }
  return data
}

function head(lang, chapter, canonical) {
  const title = pageTitle(lang, chapter)
  const description = chapter.slug === 'welcome'
    ? (lang === 'de'
      ? 'Kostenloses Hands-on-Tutorial: Datenkontrakte mit ODCS 3.2, Datenprodukte mit ODPS 1.1, Data Contract CLI, KI-Kontext und CI/CD mit GitHub Actions.'
      : 'A free, hands-on tutorial: data contracts with ODCS 3.2, data products with ODPS 1.1, the Data Contract CLI, AI context, and CI/CD with GitHub Actions.')
    : `${chapter.summary[lang]} ${t(lang).title}: ${t(lang).subtitle}.`
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l, chapter.slug)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${url('en', chapter.slug)}" />`,
    `<link rel="alternate" type="text/markdown" href="${SITE}/${lang}/${chapter.slug}.md" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:locale" content="${lang === 'de' ? 'de_DE' : 'en_US'}" />`,
    `<meta property="og:image:alt" content="Data Contracts in Practice: a free, hands-on tutorial at learn.datacontract.com" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    ...structuredData(lang, chapter).map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ')
}

async function page(lang, chapter, file, canonical = url(lang, chapter.slug)) {
  const body = await render({ lang, slug: chapter.slug })
  const html = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace('<!--head-->', head(lang, chapter, canonical))
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const welcome = chapters.find((c) => c.slug === 'welcome')
for (const lang of LANGS) {
  for (const chapter of chapters) {
    const dir = chapter.slug === 'welcome' ? join(dist, lang) : join(dist, lang, chapter.slug)
    await page(lang, chapter, join(dir, 'index.html'))
    writeFileSync(join(dist, lang, `${chapter.slug}.md`),
      `# ${chapter.title[lang]}\n\n${chapter.summary[lang]}\n\nSource: ${url(lang, chapter.slug)}\n\n` + mdxToMarkdown(readFileSync(mdxPath(lang, chapter.slug), 'utf8'), mdxPath(lang, chapter.slug)))
  }
}
// the root page: the English welcome page for crawlers (visitors are redirected to their language)
await page('en', welcome, join(dist, 'index.html'), url('en', 'welcome'))
await page('en', { ...welcome, title: { en: 'Page not found', de: 'Seite nicht gefunden' } }, join(dist, '404.html'), url('en', 'welcome'))

// sitemap with language alternates
const urls = LANGS.flatMap((lang) => chapters.map((c) => ({ lang, slug: c.slug })))
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(({ lang, slug }) => `  <url>
    <loc>${url(lang, slug)}</loc>
    <lastmod>${PUBLISHED}</lastmod>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, slug)}" />`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en', slug)}" />
  </url>`).join('\n')}
</urlset>
`)

// search engines and AI crawlers are welcome
writeFileSync(join(dist, 'robots.txt'), `User-agent: *
Allow: /

# AI crawlers and assistants are explicitly welcome
${['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Meta-ExternalAgent'].map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE}/sitemap.xml
`)

// llms.txt: an index for AI systems, llms-full.txt: the whole English tutorial as Markdown
const en = t('en')
const llms = [`# ${en.title}`, '',
  `> A free, hands-on tutorial on data contracts: put a PostgreSQL dataset under contract with the Open Data Contract Standard (ODCS 3.2), describe data products with the Open Data Product Standard (ODPS 1.1), design contract-first, use consumer-driven contracts, automate everything with GitHub Actions, and publish to a data product platform. Uses the open-source Data Contract CLI and Data Product CLI. Available in English and German. Maintained by Entropy Data.`, '',
  ...parts.flatMap((p) => [`## ${p.title.en}`, '', ...chapters.filter((c) => c.part === p.id).map((c) => `- [${c.title.en}](${SITE}/en/${c.slug}.md): ${c.summary.en}`), '']),
  '## German version', '', ...chapters.map((c) => `- [${c.title.de}](${SITE}/de/${c.slug}.md): ${c.summary.de}`), '',
  '## Optional', '', `- [Full tutorial in one file](${SITE}/llms-full.txt)`, `- [Repository with exercises and reference solutions](https://github.com/datacontract/learn.datacontract.com)`,
  '- [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/)', '- [Open Data Product Standard](https://bitol-io.github.io/open-data-product-standard/)', '- [Data Contract CLI](https://cli.datacontract.com)', '']
writeFileSync(join(dist, 'llms.txt'), llms.join('\n'))
writeFileSync(join(dist, 'llms-full.txt'), [`# ${en.title}`, '', ...chapters.map((c) => readFileSync(join(dist, 'en', `${c.slug}.md`), 'utf8'))].join('\n\n---\n\n'))

console.log(`prerendered ${urls.length} pages, sitemap.xml, robots.txt, llms.txt, llms-full.txt`)
