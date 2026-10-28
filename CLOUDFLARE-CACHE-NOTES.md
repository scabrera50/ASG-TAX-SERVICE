# Cache settings to apply after approval

The supplied mobile PageSpeed report tests the production site: performance 87, accessibility/best practices/SEO 100, FCP 1.5 s, LCP 2.3 s, TBT 0 ms, and CLS 0.23. The local preview has not been published, so that score does not measure these changes.

## Prepared in source

- Replaced the two large, unused CMS stylesheets with `assets/base.css`, containing only the local font declarations and primitives used on the site. Upstream files and font licenses remain intact.
- Removed Bitter and italic font requests. Preloaded the main regular/bold Open Sans fonts. `font-display: optional` avoids a late font swap; on a slow first visit the browser may keep its sans-serif fallback for that page view.
- Added smaller AVIF header candidates and responsive hero assets, with explicit dimensions and more accurate `sizes`.
- Added content-version query strings to CSS, JavaScript, fonts, and display images. Run `python .github/version-assets.py` after asset edits to refresh the versions. No build framework is needed.

## Cloudflare dashboard changes still pending

GitHub Pages serves the static source. Adding a Cloudflare Pages `_headers` file would not configure this hosting setup. Use Cloudflare Cache Rules for the existing proxied hostname instead.

1. For `www.asgtaxservice.com`, match versioned files under `/assets/` (query contains `v=`). Set cache eligibility to eligible, an Edge TTL of one month, and a Browser TTL of one year. Preserve the standard cache key including query strings, so changed content versions fetch new bytes. Do not select “Ignore Query String.”
2. Add a higher-priority bypass rule for `/assets/irs-news.json`, including every query string, so the hourly data refresh stays current. Keep HTML out of the long asset-cache rule. The news client already uses `cache: no-store` and a time-varying request query.
3. Check response headers on a versioned stylesheet and logo and verify the news JSON bypass before rerunning PageSpeed on both languages and device modes.

No Cloudflare settings, DNS, SSL or security features have been changed. Cloudflare's injected analytics beacon and email-protection script appear in the report but are controlled outside this repository; they have not been disabled. The forced-reflow section in the supplied desktop screenshot does not identify a source, so no particular application function has been blamed or removed.

References: [Cloudflare Edge and Browser Cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/), [cache keys and caching levels](https://developers.cloudflare.com/cache/how-to/set-caching-levels/), [default cache behavior](https://developers.cloudflare.com/cache/get-started/).
