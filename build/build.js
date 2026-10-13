// Static site builder for StLouisTintCo.com
// Reads src/pages/*.html (JSON front matter in a leading <!--meta ... --> comment + body HTML)
// and writes <slug>/index.html with shared chrome, schema, FAQ markup and FAQ schema from ONE source.
// Usage: node build/build.js
const fs = require('fs');
const path = require('path');
const S = require('./site');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'pages');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = slug => S.base + (slug ? '/' + slug + '/' : '/');
const rel = slug => (slug ? '/' + slug + '/' : '/');

function readPages() {
  return fs.readdirSync(SRC).filter(f => f.endsWith('.html')).map(f => {
    const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
    const m = raw.match(/^\s*<!--meta\s*([\s\S]*?)-->\s*([\s\S]*)$/);
    if (!m) throw new Error('No meta block in ' + f);
    let meta;
    try { meta = JSON.parse(m[1]); } catch (e) { throw new Error('Bad meta JSON in ' + f + ': ' + e.message); }
    return Object.assign({ file: f, body: m[2].trim() }, meta);
  });
}

// ---------- shared fragments ----------
const business = () => ({
  '@type': 'HomeAndConstructionBusiness',
  '@id': S.base + '/#business',
  name: S.name,
  description: 'Residential and commercial window tinting and window film installation in St. Louis, MO. Homes and businesses only — no automotive tint.',
  url: S.base + '/',
  telephone: S.tel,
  email: S.email,
  image: S.base + '/images/office-lobby-window-film-st-louis.webp',
  logo: S.base + '/images/st-louis-tint-co-logo-horizontal.png',
  address: { '@type': 'PostalAddress', addressLocality: S.city, addressRegion: S.region, addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: S.geo.lat, longitude: S.geo.lng },
  hasMap: S.gbp,
  areaServed: [{ '@type': 'City', name: 'St. Louis, MO' }, { '@type': 'AdministrativeArea', name: 'St. Louis County, MO' }]
    .concat(S.areas.filter(a => a.name !== 'St. Louis City').map(a => ({ '@type': 'City', name: a.name + ', MO' }))),
  openingHoursSpecification: S.hours.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
  sameAs: [S.gbp, S.facebook, S.instagram],
  knowsAbout: S.services.map(s => s.name),
});

function schemaFor(p) {
  const out = [business()];
  if (p.slug) {
    const items = [{ name: 'Home', item: S.base + '/' }].concat((p.crumbs || []).map(c => ({ name: c[0], item: S.base + c[1] })), [{ name: p.crumb || p.h1, item: url(p.slug) }]);
    out.push({ '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.item })) });
  }
  if (p.type === 'service') {
    out.push({ '@type': 'Service', name: p.serviceName, serviceType: p.serviceName, url: url(p.slug), provider: { '@id': S.base + '/#business' },
      areaServed: [{ '@type': 'City', name: 'St. Louis, MO' }, { '@type': 'AdministrativeArea', name: 'St. Louis County, MO' }], description: p.description });
  }
  if (p.type === 'area') {
    out.push({ '@type': 'Service', name: 'Window Tinting in ' + p.town + ', MO', serviceType: 'Window Tinting', url: url(p.slug), provider: { '@id': S.base + '/#business' },
      areaServed: { '@type': 'City', name: p.town + ', MO' }, description: p.description });
  }
  if (p.type === 'blog') {
    out.push({ '@type': 'BlogPosting', headline: p.h1, description: p.description, datePublished: p.date, dateModified: p.date, url: url(p.slug),
      mainEntityOfPage: url(p.slug), image: S.base + p.heroImage, author: { '@type': 'Organization', name: S.name, url: S.base + '/' }, publisher: { '@id': S.base + '/#business' } });
  }
  if (p.faqs && p.faqs.length) {
    out.push({ '@type': 'FAQPage', mainEntity: p.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }
  return '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': out }) + '</script>';
}

function head(p) {
  const img = S.base + (p.heroImage || '/images/office-lobby-window-film-st-louis.webp');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url(p.slug)}">`}
<meta property="og:type" content="${p.type === 'blog' ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(S.name)}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url(p.slug)}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${S.css}">
${p.heroImage ? `<link rel="preload" as="image" href="${p.heroImage}">\n` : ''}${schemaFor(p)}
</head>
<body class="t-${p.type}">
<a class="skip" href="#main">Skip to content</a>`;
}

function header() {
  const sv = S.services.map(s => `<li><a href="${rel(s.slug)}">${s.name}</a></li>`).join('');
  const ar = S.areas.map(a => `<li><a href="${rel(a.slug)}">${a.name}</a></li>`).join('');
  return `
<header class="site-header">
  <div class="wrap hdr">
    <a class="brand" href="/"><img src="/images/st-louis-tint-co-logo-horizontal.png" width="164" height="56" alt="St. Louis Tint Co. — residential &amp; commercial window tinting"></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="bars" aria-hidden="true"></span><span class="sr">Menu</span></button>
    <nav id="site-nav" class="nav" aria-label="Main">
      <ul class="nav-list">
        <li class="has-sub"><a href="/services/">Services</a><ul class="sub">${sv}</ul></li>
        <li class="has-sub"><a href="/service-areas/">Service Areas</a><ul class="sub sub-2col">${ar}</ul></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
      <a class="btn btn-call hdr-call" href="tel:${S.tel}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>${S.phone}</a>
    </nav>
  </div>
</header>`;
}

function form(id) {
  const opts = S.services.slice(2).map(s => `<option>${s.name}</option>`).join('');
  return `<form class="qform" action="${S.form}" method="POST">
  <input type="hidden" name="_subject" value="New window tint estimate request — StLouisTintCo.com">
  <input type="hidden" name="page" value="__PAGEURL__">
  <div class="f-row"><label for="${id}-name">Name*</label><input id="${id}-name" name="name" type="text" autocomplete="name" required></div>
  <div class="f-row"><label for="${id}-phone">Phone*</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" required></div>
  <div class="f-row"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" autocomplete="email"></div>
  <div class="f-row"><label for="${id}-type">Property</label><select id="${id}-type" name="property"><option>Home</option><option>Business / commercial</option><option>Other</option></select></div>
  <div class="f-row"><label for="${id}-film">Interested in</label><select id="${id}-film" name="film"><option>Not sure yet — help me choose</option>${opts}</select></div>
  <div class="f-row"><label for="${id}-msg">Project details</label><textarea id="${id}-msg" name="message" rows="3" placeholder="Rooms or windows, city, the problem you want to fix…"></textarea></div>
  <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn btn-accent btn-block" type="submit">Get My Free Estimate</button>
  <p class="f-note">Homes &amp; businesses only — we don't tint vehicles.</p>
</form>`;
}

function sidebar(p) {
  return `<aside class="side" id="estimate">
  <div class="side-card form-card">
    <p class="side-kicker">Free on-site estimate</p>
    <h2 class="side-title">Tell us about your windows</h2>
    ${form('s')}
  </div>
  <div class="side-card call-card">
    <p>Rather talk it through?</p>
    <a class="btn btn-call btn-block" href="tel:${S.tel}">Call ${S.phone}</a>
    <p class="hours">Mon–Fri 8am–5pm · Sat 8am–2pm</p>
  </div>
</aside>`;
}

function faqHtml(p) {
  if (!p.faqs || !p.faqs.length) return '';
  return `<section class="faq" aria-labelledby="faq-h">
<h2 id="faq-h">${esc(p.faqTitle || 'Frequently Asked Questions')}</h2>
${p.faqs.map(f => `<details><summary>${esc(f.q)}</summary><div class="ans"><p>${esc(f.a)}</p></div></details>`).join('\n')}
</section>`;
}

function crumbsHtml(p) {
  const items = [['Home', '/']].concat(p.crumbs || []);
  return `<nav class="crumbs" aria-label="Breadcrumb">${items.map(c => `<a href="${c[1]}">${esc(c[0])}</a>`).join('<span>/</span>')}<span>/</span><span aria-current="page">${esc(p.crumb || p.h1)}</span></nav>`;
}

function pageHero(p) {
  const meta = p.type === 'blog' ? `<p class="post-meta">By ${S.name} · ${new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>` : '';
  return `<section class="page-hero">
  <div class="wrap ph-grid">
    <div class="ph-copy">
      ${crumbsHtml(p)}
      <h1>${esc(p.h1)}</h1>
      ${p.lead ? `<p class="lead">${esc(p.lead)}</p>` : ''}
      ${meta}
      <div class="ph-ctas"><a class="btn btn-accent" href="#estimate">Free Estimate</a><a class="btn btn-ghost" href="tel:${S.tel}">Call ${S.phone}</a></div>
      <ul class="ticks"><li>Free on-site estimates</li><li>Ask about our lifetime warranty</li><li>Homes &amp; businesses — no auto tint</li></ul>
    </div>
    ${p.heroImage ? `<figure class="ph-img"><img src="${p.heroImage}" width="${p.heroW || 900}" height="${p.heroH || 675}" alt="${esc(p.heroAlt || p.h1)}" fetchpriority="high"></figure>` : ''}
  </div>
</section>`;
}

function ctaBand() {
  return `<section class="cta-band">
  <div class="wrap cta-inner">
    <div><h2>Ready for cooler, brighter, more private rooms?</h2><p>Get a free on-site estimate anywhere in St. Louis City or County. We measure, show you film samples on your own glass, and give you a clear written quote.</p></div>
    <div class="cta-btns"><a class="btn btn-accent" href="/contact/#estimate">Request an Estimate</a><a class="btn btn-light" href="tel:${S.tel}">${S.phone}</a></div>
  </div>
</section>`;
}

function footer() {
  const sv = S.services.map(s => `<li><a href="${rel(s.slug)}">${s.name}</a></li>`).join('');
  const ar = S.areas.map(a => `<li><a href="${rel(a.slug)}">${a.name}</a></li>`).join('');
  return `
<section class="map-strip" aria-label="Map">
  <iframe src="${S.mapEmbed}" title="${esc(S.name)} on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</section>
<footer class="site-footer">
  <div class="wrap f-grid">
    <div class="f-brand">
      <p class="f-name">${S.name}</p>
      <p>Residential &amp; commercial window tinting serving St. Louis City and St. Louis County.</p>
      <p><a href="tel:${S.tel}">${S.phone}</a><br><a href="mailto:${S.email}">${S.email}</a><br>St. Louis, MO</p>
      <p class="f-hours">Mon–Fri 8am–5pm<br>Sat 8am–2pm · Sun closed</p>
    </div>
    <div><p class="f-h">Services</p><ul>${sv}</ul></div>
    <div><p class="f-h">Service Areas</p><ul class="f-2col">${ar}</ul></div>
    <div><p class="f-h">Company</p><ul><li><a href="/about/">About Us</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact/">Contact &amp; Estimates</a></li><li><a href="${S.gbp}" rel="noopener" target="_blank">Find us on Google</a></li><li><a href="${S.facebook}" rel="noopener" target="_blank">Facebook</a></li><li><a href="${S.instagram}" rel="noopener" target="_blank">Instagram</a></li></ul></div>
  </div>
  <div class="wrap f-bottom"><p>© ${new Date().getFullYear()} ${S.name} · Window film for homes &amp; businesses in St. Louis, MO. We do not tint vehicles.</p></div>
</footer>
<div class="mbar"><a class="mbar-call" href="tel:${S.tel}">Call Now</a><a class="mbar-est" href="/contact/#estimate">Free Estimate</a></div>
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

// ---------- hub widgets ----------
function serviceCards() {
  return `<div class="svc-list">${S.services.map((s, i) => `<div class="svc-row"><span class="svc-num">${String(i + 1).padStart(2, '0')}</span><div><h3><a class="stretched" href="${rel(s.slug)}">${s.name}</a></h3><p>${s.short}</p></div><span class="svc-go" aria-hidden="true">→</span></div>`).join('')}</div>`;
}
function areaList() {
  return `<div class="area-grid">${S.areas.map(a => `<div class="area-item"><h3><a class="stretched" href="${rel(a.slug)}">${a.name}</a></h3><p>${a.short}</p></div>`).join('')}</div>`;
}
function blogList(pages) {
  const posts = pages.filter(p => p.type === 'blog').sort((a, b) => (a.date < b.date ? 1 : -1));
  return `<div class="post-grid">${posts.map(p => `<div class="post-card"><img src="${p.heroImage}" width="${p.heroW || 900}" height="${p.heroH || 675}" alt="${esc(p.heroAlt || p.h1)}" loading="lazy"><div class="pc-body"><h3><a class="stretched" href="${rel(p.slug)}">${esc(p.h1)}</a></h3><p>${esc(p.description)}</p><span class="more">Read the guide →</span></div></div>`).join('')}</div>`;
}

// ---------- assemble ----------
function render(p, pages) {
  let body = p.body
    .replace('<!--SERVICE_CARDS-->', serviceCards())
    .replace('<!--AREA_LIST-->', areaList())
    .replace('<!--BLOG_LIST-->', blogList(pages))
    .replace('<!--FORM-->', form('h'));
  const faq = faqHtml(p);
  body = body.includes('<!--FAQ-->') ? body.replace('<!--FAQ-->', faq) : body + '\n' + faq;
  let html;
  if (p.type === 'home' || p.layout === 'full') {
    html = head(p) + header() + `\n<main id="main">\n${p.type === 'home' ? '' : pageHero(p)}\n${body}\n</main>\n` + ctaBand() + footer();
  } else {
    html = head(p) + header() + `\n<main id="main">\n${pageHero(p)}\n<div class="wrap body-grid">\n<article class="prose">\n${body}\n</article>\n${sidebar(p)}\n</div>\n</main>\n` + ctaBand() + footer();
  }
  return html.split('__PAGEURL__').join(url(p.slug));
}

const pages = readPages();
const seen = {};
for (const p of pages) {
  if (seen[p.slug]) throw new Error('Duplicate slug ' + p.slug);
  seen[p.slug] = 1;
  if (p.slug === '404') { fs.writeFileSync(path.join(ROOT, '404.html'), render(p, pages)); continue; }
  const outDir = p.slug ? path.join(ROOT, p.slug) : ROOT;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), render(p, pages));
}
// sitemap
const lastmod = new Date().toISOString().slice(0, 10);
const sm = pages.filter(p => p.slug !== '404').map(p => `  <url><loc>${url(p.slug)}</loc><lastmod>${p.date || lastmod}</lastmod></url>`).join('\n');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
console.log('Built', pages.length, 'pages');
// The old WordPress site registered /sitemap_index.xml in Search Console; keep that URL alive as an index pointing at the real sitemap.
fs.writeFileSync(path.join(ROOT, 'sitemap_index.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${S.base}/sitemap.xml</loc><lastmod>${lastmod}</lastmod></sitemap>\n</sitemapindex>\n`);
