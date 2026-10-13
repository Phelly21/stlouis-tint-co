# StLouisTintCo.com — page-writing spec (READ FULLY before writing)

You are writing content source files for a static local-SEO lead-gen site. A build script
(`build/build.js`) wraps your file in the shared header, page hero (H1 + lead + CTAs), sticky
estimate-form sidebar, FAQ accordion, CTA band, footer and all JSON-LD. **You write ONLY the
source file** `src/pages/<name>.html`. Do not touch any other file. Do not run the build.

## The business (facts you may use — NOTHING else)
- Name: **St. Louis Tint Co.** (exact). Phone **(314) 200-0434**. Website StLouisTintCo.com.
- What they do: **residential and commercial window tinting / window film** — flat glass only.
  **They do NOT tint cars/vehicles. Never mention auto tint except to say "we don't tint vehicles".**
- Service area: St. Louis City and St. Louis County (the 12 area pages below).
- Free on-site estimates (they come to the home/business, measure, show samples, give a written quote).
- Warranty: you MAY say "Ask about our lifetime warranty" and "Our work is guaranteed to last — if
  it isn't, let us know and we'll make it right." Do not expand the warranty terms beyond that.
- Satisfaction guaranteed. Work by appointment. Hours Mon–Fri 8am–5pm, Sat 8am–2pm, Sun closed.
- They are not tied to one film brand. Write about film TYPES generically.

## BANNED (grep will check — any hit fails the page)
- Any vehicle/auto tint offer: "car", "vehicle", "automotive", "auto tint", "windshield" (except
  the single sentence "we don't tint vehicles" if you need it).
- Years in business / "since 19xx" / "decades of experience" / installer experience claims.
- "licensed", "insured", "bonded", "certified", "authorized dealer", awards, "#1", "best in St. Louis",
  "top-rated", review counts, star ratings, "family-owned", crew size.
- Brand names as products WE install (3M, LLumar, Madico, Huper Optik, Solar Gard, Vista, EnerLogic,
  XPEL…). Don't name brands at all.
- Dollar amounts or price ranges, financing, discounts, rebates/tax credits (federal 25C is gone).
- Specific % energy-savings or heat-rejection claims presented as guarantees. Allowed: "up to 99%"
  UV blocking (true for most quality films); otherwise say performance "varies by film — we show
  you the spec sheet (TSER, VLT, glare reduction) before you choose."
- Made-up testimonials, customer names, project stories presented as real jobs.
- Never say anything about a town you didn't verify. If unsure, leave it out.

## File format (exact)
```
<!--meta
{
  "slug": "privacy-window-film",
  "type": "service",
  "title": "Privacy Window Film in St. Louis, MO | St. Louis Tint Co.",
  "description": "140–160 chars, keyword-led, ends with a soft CTA.",
  "h1": "Privacy Window Film in St. Louis",
  "crumbs": [["Services","/services/"]],
  "crumb": "Privacy Window Film",
  "lead": "One or two sentences under the H1 (no HTML).",
  "heroImage": "/images/….webp", "heroW": 900, "heroH": 675,
  "heroAlt": "Descriptive alt text",
  "serviceName": "Privacy Window Film",
  "faqs": [ {"q":"Question as people ask it?","a":"Answer-first plain text, 2–4 sentences."} ]
}
-->
<div class="answer"><p>2–3 sentence direct answer to the page's core question (AEO).</p></div>
<h2>…</h2>
…body…
```
- Valid JSON (double quotes, no trailing commas, escape any `"` inside strings as `\"`). Use
  straight ASCII apostrophes or typographic ones consistently — plain text only in meta and FAQs.
- `type`: `service` | `area` (add `"town": "Kirkwood"`) | `blog` (add `"date": "2026-10-12"`,
  crumbs `[["Blog","/blog/"]]`, no serviceName). Area crumbs: `[["Service Areas","/service-areas/"]]`.
- FAQ answers are PLAIN TEXT (no links/HTML) — the build renders them visibly AND as FAQPage
  schema from the same string. Service pages 6 FAQs, area pages 5, blog posts 4.
- Do NOT write an `<h1>`, a FAQ section, forms, CTA bands, `<html>/<head>/<body>`, inline
  `style=`, or `<script>`. Body starts with the `.answer` box then `<h2>` sections.

## Body components available (use them — they're styled)
- `<div class="answer"><p>…</p></div>` — answer-first summary box (required first element).
- `<div class="table-wrap"><table><thead><tr><th>…</th></tr></thead><tbody>…</tbody></table></div>` —
  comparison tables (film types vs. heat/glare/privacy/look/best for). Great for AEO.
- `<ol class="steps"><li><strong>Step name.</strong> detail</li></ol>` — numbered process.
- `<div class="callout"><h3>…</h3><p>…</p></div>` — tip / local note.
- `<figure><img src="/images/X.webp" width="W" height="H" alt="…" loading="lazy"><figcaption>…</figcaption></figure>`
- Normal `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<strong>`, `<a>`.

## Depth (non-negotiable)
- **Service pages: 1,050–1,400 words of body** (not counting FAQs). Sections: what it is / how it
  works; the problems it solves (signs you need it); film options within the category with a
  comparison table; where it's used (rooms / building types); St. Louis-specific angle (hot humid
  summers with strong west/south sun, cold winters, older housing stock with original single-pane
  glass in the City and inner-ring suburbs, office glass in Clayton / Creve Coeur / Maryland Heights,
  etc.); our installation process (`ol.steps`: estimate & sample on your glass → film choice with
  spec sheet → glass prep & cleaning → precise install & edge trim → cure time & care instructions);
  what affects cost (factors only, NO numbers); care & lifespan; why hire a pro vs DIY.
- **Area pages: 900–1,150 words.** MUST be genuinely local: research the town (WebSearch/WebFetch)
  and use verified specifics — neighborhoods/subdivisions, housing stock & era, major roads,
  landmarks, business districts, school district, sun/tree-cover/exposure issues typical there.
  Tailored per-service copy (which films fit THIS town's homes and businesses and why) — not a bare
  list. Include a short "Common window film projects in <Town>" section and a "Nearby areas we serve" paragraph.
- **Blog posts: 1,000–1,400 words**, genuinely useful, answer-first, homeowner/business voice,
  St. Louis context where natural.

## Internal links (in-body prose, descriptive anchors, root-relative trailing-slash URLs)
Services: /residential-window-tinting/ · /commercial-window-tinting/ · /solar-heat-control-window-film/ ·
/low-e-window-film/ · /privacy-window-film/ · /decorative-frosted-window-film/ ·
/security-safety-window-film/ · /uv-fade-protection-window-film/
Areas: /window-tinting-st-louis-city-mo/ · /window-tinting-clayton-mo/ · /window-tinting-ladue-mo/ ·
/window-tinting-kirkwood-mo/ · /window-tinting-webster-groves-mo/ · /window-tinting-chesterfield-mo/ ·
/window-tinting-town-and-country-mo/ · /window-tinting-creve-coeur-mo/ · /window-tinting-des-peres-mo/ ·
/window-tinting-brentwood-mo/ · /window-tinting-university-city-mo/ · /window-tinting-maryland-heights-mo/
Blog posts (link to these SPECIFIC posts, never just /blog/):
- /blog/how-much-does-home-window-tinting-cost/ — cost factors
- /blog/does-window-film-lower-energy-bills/ — energy savings
- /blog/ceramic-vs-dyed-vs-reflective-window-film/ — film type comparison
- /blog/window-film-vs-replacement-windows/ — film vs new windows
- /blog/will-window-film-void-my-window-warranty/ — window/glass warranty concerns
- /blog/best-window-film-for-daytime-and-nighttime-privacy/ — privacy
Other: /contact/ (estimate), /about/, /services/, /service-areas/.

Required minimums (audited): **service page** ≥2 other service links, ≥4 area links, ≥1 specific
blog post. **Area page** ≥3 service links, ≥2 neighboring area links (use the neighbor list given
to you), ≥1 specific blog post. **Blog post** ≥2 service links, ≥1 area link.

## Images (only these exist; reuse is fine)
| path | size | shows |
|---|---|---|
| /images/office-lobby-window-film-st-louis.webp | 1600×900 | office lobby, wall of windows |
| /images/installer-applying-window-film-st-louis.webp | 900×675 | installer peeling film on a window |
| /images/commercial-building-solar-window-film.webp | 900×675 | building facade glass + sky |
| /images/reflective-commercial-window-film-facade.webp | 900×675 | blue reflective office facade |
| /images/applying-privacy-window-film.webp | 851×315 | hands applying film (wide banner, inline only, not heroImage) |
| /images/window-film-roll-heat-control.webp | 900×675 | film roll held against sky |
| /images/residential-window-tint-installation-st-louis.webp | 900×675 | installer squeegeeing a home window |
| /images/patio-door-window-tint-st-louis-home.webp | 900×675 | home patio sliding doors, tinted |
| /images/tinted-home-windows-view.webp | 389×289 | tinted home windows at dusk (small) |
| /images/kitchen-window-film-uv-protection.webp | 950×534 | bright kitchen with big windows |
Use the heroImage you're assigned. Inline figures are optional (max 1–2), always `loading="lazy"` with width/height.

## Voice
Plain, confident, specific, local. Short paragraphs (2–4 sentences). No fluff ("in today's
fast-paced world", "look no further", "elevate", "nestled", "bespoke"). Answer-first.
Don't overuse the business name; use "we".
