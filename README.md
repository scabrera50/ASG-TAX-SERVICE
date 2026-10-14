# ASG Tax Services

A modern, responsive website for ASG Tax Services in Lawrence, Massachusetts, with six pages each in English and Spanish. Built with the CMS Design System 18.1.0 and a light ASG brand layer: ivory, white, spring green, readable leaf green, and local fonts. All 12 service listings and seven office-hour entries are retained from the supplied release.

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
- English/Spanish switches preserve the current page and service/filter query.
- A custom transparent ASG logo is used in the header, home-page feature, and favicon. It features Lawrence’s mill skyline, the central Ayer Mill Clock Tower, Tower Hill High Service Water Tower, and twin Mount Vernon water tanks.
- WhatsApp links reach 978-902-9018 on every page and in the contact details. Clicking opens WhatsApp without automatically sending a message.
- Contact form that validates input and prepares an email draft. Visitors review and send in their email app. The website does not send or store the message.

Appointments are arranged by calling 978-902-9018. The client documents page explains how to contact the office; no secure upload, client account system, or online booking backend is connected.

## Editing

The root HTML files are the English pages; `es/` contains the Spanish versions. `assets/brand.css` contains ASG’s visual design, `assets/site.js` controls navigation and service filters, and `assets/contact.js` prepares the inquiry draft. The CMS files in `assets/cms/` are unchanged from the supplied release; the upstream license is included there. CMS here means the Centers for Medicare & Medicaid Services Design System, not a content-management backend. The WhatsApp glyph comes from Font Awesome; its attribution and license are included in assets/whatsapp-LICENSE.txt.

## Business details

- Address: 111 Park St, Lawrence, MA 01841
- Phone: 978-902-9018
- Email: asgtaxservices@gmail.com
- Hours: Monday, Tuesday, Friday, Saturday, Sunday 9 AM–8 PM; Wednesday and Thursday 9 AM–7 PM.

## Verification

The GitHub Actions workflow runs Chromium checks across six pages and five screen widths, validates links/assets and interactions, scans accessibility, and saves desktop/mobile screenshots. See `VALIDATION.md` for the actual verification results and any limits.
