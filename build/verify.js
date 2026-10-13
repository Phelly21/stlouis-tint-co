// Ship-checklist audit for built pages. Usage: node build/verify.js
const fs = require('fs'), path = require('path');
const S = require('./site');
const ROOT = path.join(__dirname, '..');
const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (/^(node_modules|_raw|src|build|\.git|images|css|js)$/.test(f)) continue;
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') pages.push(p);
  }
})(ROOT);

const dec = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const strip = s => dec(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const BANNED = [/\bcars?\b/i, /\bvehicles?\b(?![^<]{0,40}(we don.t|don.t tint|no auto))/i, /\bautomotive\b/i, /\bwindshield/i, /\blicensed\b/i, /\binsured\b/i, /\bbonded\b/i, /\bcertified\b/i, /years of experience/i, /since 19\d\d/i, /\$\s?\d/, /\b3M\b/, /llumar|madico|huper|solar gard|xpel|enerlogic/i, /family[- ]owned/i, /top[- ]rated/i, /tax credit/i, /\bbest in st\.? louis/i];
const svc = S.services.map(s => '/' + s.slug + '/'), area = S.areas.map(a => '/' + a.slug + '/'), blog = S.blog.map(b => '/blog/' + b + '/');
const titles = {}, h1s = {};
let fails = 0;
const rows = [];
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = '/' + path.relative(ROOT, path.dirname(file)).split(path.sep).join('/') + '/';
  const slug = rel === '//' ? '/' : rel;
  const errs = [];
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const h1 = html.match(/<h1[\s>][\s\S]*?<\/h1>/g) || [];
  if (h1.length !== 1) errs.push('h1 count ' + h1.length);
  (titles[title] = titles[title] || []).push(slug);
  if (h1[0]) (h1s[strip(h1[0])] = h1s[strip(h1[0])] || []).push(slug);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) errs.push('meta description');
  if (!/<link rel="canonical"/.test(html)) errs.push('canonical');
  (html.match(/<img[^>]*>/g) || []).forEach(t => { if (!/alt="[^"]{4,}"/.test(t)) errs.push('img alt: ' + t.slice(0, 60)); if (!/width="\d+"/.test(t)) errs.push('img dims'); });
  // body = between </header> and <footer
  const body = html.slice(html.indexOf('</header>'), html.indexOf('<footer'));
  const article = (body.match(/<article class="prose">([\s\S]*?)<\/article>/) || [, body])[1];
  const text = strip(article.replace(/<section class="faq"[\s\S]*?<\/section>/, ''));
  const words = text.split(' ').filter(w => /[a-z]/i.test(w)).length;
  // the only allowed vehicle mentions are "we don't tint vehicles"-type disclaimers: drop those sentences first
  const visible = strip(body).split(/(?<=[.!?])\s+/).filter(s => !/(do you|don.t|do not|never) tint|no auto tint|not (do )?(car|auto)/i.test(s)).join(' ');
  BANNED.forEach(re => { const m = visible.match(re); if (m) { const i = visible.search(re); errs.push('BANNED "' + m[0] + '": …' + visible.slice(Math.max(0, i - 50), i + 40) + '…'); } });
  const links = (article.match(/href="([^"#]+)"/g) || []).map(h => h.slice(6, -1));
  const nSvc = new Set(links.filter(l => svc.includes(l) && l !== slug)).size;
  const nArea = new Set(links.filter(l => area.includes(l) && l !== slug)).size;
  const nBlog = new Set(links.filter(l => blog.includes(l) && l !== slug)).size;
  const isSvc = svc.includes(slug), isArea = area.includes(slug), isBlog = blog.includes(slug);
  if (isSvc && (nSvc < 2 || nArea < 4 || nBlog < 1 || words < 1000)) errs.push(`svc mins: svc${nSvc} area${nArea} blog${nBlog} words${words}`);
  if (isArea && (nSvc < 3 || nArea < 2 || nBlog < 1 || words < 850)) errs.push(`area mins: svc${nSvc} area${nArea} blog${nBlog} words${words}`);
  if (isBlog && (nSvc < 2 || nArea < 1 || words < 950)) errs.push(`blog mins: svc${nSvc} area${nArea} words${words}`);
  // internal links resolve
  (body.match(/href="(\/[^"#?]*)"/g) || []).map(h => h.slice(6, -1)).forEach(l => {
    if (/\.(png|webp|css|js|xml)$/.test(l)) return;
    const target = path.join(ROOT, l, l.endsWith('/') ? 'index.html' : '');
    if (!fs.existsSync(target)) errs.push('broken link ' + l);
  });
  // FAQ schema == visible
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const faqLd = ld.flatMap(j => j['@graph'] || [j]).find(n => n['@type'] === 'FAQPage');
  const vis = [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><div class="ans">([\s\S]*?)<\/div><\/details>/g)].map(m => [strip(m[1]), strip(m[2])]);
  if (vis.length || faqLd) {
    const sch = faqLd ? faqLd.mainEntity.map(q => [q.name.replace(/\s+/g, ' ').trim(), q.acceptedAnswer.text.replace(/\s+/g, ' ').trim()]) : [];
    if (sch.length !== vis.length || sch.some((q, i) => q[0] !== vis[i][0] || q[1] !== vis[i][1])) errs.push('FAQ schema mismatch');
  }
  if ((isSvc || isArea) && vis.length < 5) errs.push('faqs ' + vis.length);
  rows.push([slug, words, nSvc, nArea, nBlog, vis.length]);
  if (errs.length) { fails++; console.log('FAIL', slug, '\n   ' + errs.join('\n   ')); }
}
for (const [t, s] of Object.entries(titles)) if (s.length > 1) { fails++; console.log('DUP TITLE', t, s); }
for (const [t, s] of Object.entries(h1s)) if (s.length > 1) { fails++; console.log('DUP H1', t, s); }
console.log('\npage | words | svc | area | blog | faqs');
rows.sort().forEach(r => console.log(r.join(' | ')));
console.log(`\n${pages.length} pages, ${fails} with problems`);
