# StLouisTintCo.com

Static local-SEO site for St. Louis Tint Co. (residential & commercial window film, St. Louis, MO).

- Content lives in `src/pages/*.html` (JSON front matter + body). Business facts, services, areas and blog slugs live in `build/site.js`.
- Build: `node build/build.js` (writes `<slug>/index.html`, `404.html`, `sitemap.xml`).
- Audit: `node build/verify.js` (banned claims, depth, internal links, FAQ schema vs. visible text, titles/H1s).
- Deploy: push to `main`; the GitHub Actions workflow publishes everything except `src/`, `build/` and `_raw/` to GitHub Pages.
- After CSS changes, bump `css` in `build/site.js` (`style.css?v=N`) and rebuild.
