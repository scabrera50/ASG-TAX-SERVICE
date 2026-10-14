# ASG Tax Services

A modern, responsive six-page website for ASG Tax Services in Lawrence, Massachusetts. Built with the CMS Design System 18.1.0 and an ASG brand layer: warm ivory, deep green, editorial typography, and local fonts. All 12 service listings and seven office-hour entries are retained from the supplied release.

## Run locally

No build or API key is required. From this folder, run a static HTTP server, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000 in your browser. Stop the server with Ctrl+C. Keep this folder’s contents together so styles, scripts, and fonts load.

## GitHub Pages

Publish from the `main` branch and repository root. This release preserves the existing repository’s `CNAME`: `www.asgtaxservice.com`. Canonical URLs, robots.txt, and the sitemap use the same hostname. The `.nojekyll` file is included.

## Visitor features

- Mobile navigation with keyboard support and Escape to close.
- Service filtering with shareable category links.
- Service-specific links that preselect an inquiry topic.
- Expandable FAQs and an accessible skip link.
- Local fonts and CMS styles; the website makes no external asset requests.
- Contact form that validates input and prepares an email draft. Visitors review and send in their email app. The website does not send or store the message.

Appointments are arranged by calling 978-902-9018. The client documents page explains how to contact the office; no secure upload, client account system, or online booking backend is connected.

## Editing

The six HTML files are the pages. `assets/brand.css` contains ASG’s visual design, `assets/site.js` controls navigation and service filters, and `assets/contact.js` prepares the inquiry draft. The CMS files in `assets/cms/` are unchanged from the supplied release; the upstream license is included there. CMS here means the Centers for Medicare & Medicaid Services Design System, not a content-management backend. Do not add government branding or imply government affiliation.

## Business details

- Address: 111 Park St, Lawrence, MA 01841
- Phone: 978-902-9018
- Email: asgtaxservices@gmail.com
- Hours: Monday, Tuesday, Friday, Saturday, Sunday 9 AM–8 PM; Wednesday and Thursday 9 AM–7 PM.

## Verification

The GitHub Actions workflow runs Chromium checks across six pages and five screen widths, validates links/assets and interactions, scans accessibility, and saves desktop/mobile screenshots. See `VALIDATION.md` for the actual verification results and any limits.
