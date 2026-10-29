# ASG Tax Services

A static website for ASG Tax Services in Lawrence, Massachusetts, with six pages each in English and Spanish. It uses a small local base stylesheet, local Open Sans fonts, bold headings, forest-green text, and contrasting borders. All 14 service listings and seven office-hour entries are retained.

## Run locally

No build or API key is required. From this folder, run a static HTTP server, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000 in your browser. Stop the server with Ctrl+C. Keep this folder’s contents together so styles, scripts, and fonts load.

## GitHub Pages

Publish from the `main` branch and repository root. This release preserves the existing repository’s `CNAME`: `www.asgtaxservice.com`. Canonical URLs, robots.txt, and the sitemap use the same hostname. The `.nojekyll` file is included.

## Visitor features

- A bilingual, 39-item tax preparation checklist at `client-portal.html#tax-checklist`, with checkboxes, progress, reset, and a print/save-PDF layout. Checkmarks stay in the current page only; no personal information or checklist state is collected or saved.
- An IRS Tax News window on both homepages, populated from official IRS newsroom headlines. See the refresh workflow below.
- Mobile navigation with keyboard support and Escape to close.
- On phones, a fixed bottom bar offers one-tap Call and WhatsApp buttons (it replaces the floating WhatsApp button at that width).
- An "Open now / Closed now" line above the hours tables, calculated in Eastern time by `assets/site.js`, with the current season's table marked. **If the hours or holidays change, update both the hours tables and `hoursFor`/`isHoliday` in `assets/site.js`.**
- A "Meet our team" section on both About pages (`#team`) for Maria Lizardo, Founder & Tax Preparer, with a placeholder initials circle until a photo is added.
- A bilingual, branded `404.html` that GitHub Pages serves for missing addresses.
- Service filtering with shareable category links.
- Service-specific links that preselect an inquiry topic.
- Expandable FAQs and an accessible skip link.
- Local fonts and styles; the website makes no external asset requests. The original CMS vendor files and font licenses remain in the repository; the pages load only the smaller base stylesheet and ASG brand layer.
- English/Spanish switches preserve the current page and service/filter query.
- A custom transparent ASG logo is used in the header, home-page feature, and favicon. It features Lawrence’s mill skyline, the central Ayer Mill Clock Tower, Tower Hill High Service Water Tower, and twin Mount Vernon water tanks.
- WhatsApp links reach 978-902-9018 on every page and in the contact details. Clicking opens WhatsApp without automatically sending a message.
- Contact form that validates input and prepares an email draft. Visitors review and send in their email app. The website does not send or store the message.
- Notary Public services have a dedicated English/Spanish service card, category filter and inquiry topic. The Spanish advertising uses “servicios de notarización,” includes a prominent non-attorney disclaimer, and does not imply legal advice, real-estate closings or remote notarization.
- Immigration form translation and clerical assistance has its own section, service filter and inquiry topic in both languages. It describes the limited scope for a Massachusetts non-attorney notary, includes the non-attorney notice, and links to official resources. No immigration legal advice, eligibility assessment, form selection, document procurement, representation or filing on a client's behalf is advertised.

Appointments are arranged by calling 978-902-9018. The client documents page explains how to contact the office; no secure upload, client account system, or online booking backend is connected.

## Notary services scope

Maria holds a Massachusetts notary commission. The website describes notarization inquiries only, without promising specific notarial acts, fees, mobile visits, or remote notarization. Confirm availability and identification requirements with the office. The Spanish notice reflects [M.G.L. c. 222, § 21](https://malegislature.gov/Laws/GeneralLaws/PartIII/TitleI/Chapter222/Section21), and avoids the prohibited advertising terms in [§ 16(i)](https://malegislature.gov/Laws/GeneralLaws/PartIII/TitleI/Chapter222/Section16). The no-legal-advice boundary follows [§ 17](https://malegislature.gov/Laws/GeneralLaws/PartIII/TitleI/Chapter222/Section17).

## Immigration assistance scope

The owner confirmed that the business is licensed and Maria is a Massachusetts notary, but is not an immigration attorney. The website does not portray a business license or notary commission as authorization to practice immigration law. Its immigration service wording follows the narrow scope in [Massachusetts General Laws, chapter 222, section 17](https://malegislature.gov/Laws/GeneralLaws/PartIII/TitleI/Chapter222/Section17): translation of form questions and completion at a client's explicit direction when translation of their answers is necessary. Clients or their qualified legal professionals select forms; clients review, sign and submit their own applications. Making copies refers only to material the client provides, without obtaining records or assessing what evidence is needed.

**Before providing any immigration-related assistance, provide the client with the written statement required by section 17(b)(iii).** The English notice in the website section reproduces that statement; the Spanish section provides a translation. Posting a notice online does not replace giving the individual client the required written statement. Do not expand the service in practice to legal/procedural advice or filing on a client's behalf. A disclaimer does not authorize restricted services.

Official USCIS links are external reference resources; the site does not recommend particular applications or interpret their instructions. The inquiry form accepts general questions only and reminds visitors to omit immigration case numbers and identity documents.

## Server validation backend status

The `server/` folder contains a standalone Node API that rejects invalid contact submissions before writing them to SQLite and uses parameterized database queries. It includes automated security tests. **It is not hosted or connected to the live GitHub Pages form.** The public form still prepares an email draft, so no visitor data is currently sent to this API or stored by the website. See [server/README.md](server/README.md) for its input contract, setup, and the remaining hosting/integration step.

## Editing the static website

The root HTML files are the English pages; `es/` contains the Spanish versions. `assets/base.css` contains the font declarations and base primitives, `assets/brand.css` contains ASG’s visual design, `assets/site.js` controls navigation and service filters, and `assets/contact.js` prepares the inquiry draft. The retained CMS files in `assets/cms/` are unchanged from the supplied release; their upstream font license is included there. The WhatsApp glyph comes from Font Awesome; its attribution and license are included in assets/whatsapp-LICENSE.txt. Run `python .github/version-assets.py` after changing CSS, JavaScript, fonts or display images. See `CLOUDFLARE-CACHE-NOTES.md` for the separate production cache settings.

## Business details

- Address: 111 Park St, Lawrence, MA 01841
- Phone: 978-902-9018
- Email: info@asgtaxservice.com
- Hours: Monday–Friday 9 AM–6 PM; Saturday 10 AM–5 PM; Sunday closed (April 16–December 31).
- Tax season hours (January 1–April 15): Monday–Friday 9 AM–8 PM; Saturday and Sunday 10 AM–7 PM.
- Closed Thanksgiving, Christmas Day and New Year’s Day. The structured data on both home pages lists the 2027 tax season and the 2026–27 holiday dates; update those dates each year.
- Credentials: IRS Annual Filing Season Program (AFSP) Record of Completion; Massachusetts Notary Public. AFSP is renewed each year; if it lapses, remove the AFSP wording from the About pages and the IRS audit service.

## Verification

The GitHub Actions workflow runs server security tests and Chromium checks across 12 pages and five screen widths, validates links/assets and interactions, scans accessibility, and saves desktop/mobile screenshots. See `VALIDATION.md` for the actual verification results and any limits.

## Official IRS news refresh

`.github/update-irs-news.py` reads the public [IRS current-month news releases](https://www.irs.gov/newsroom/news-releases-for-current-month) using Python's standard library, validates official IRS links and publication dates, and writes six recent headlines to `assets/irs-news.json`. It retains previous items across month changes and preserves the last successful file if fetching or parsing fails. Article text is not republished; headlines link to the original announcements. Spanish pages identify the headlines as English originals.

Once approved and merged to the default branch, `.github/workflows/irs-news.yml` checks hourly at minute 17, or on manual dispatch. It commits only the news JSON and explicitly requests a build from the existing GitHub Pages source branch, because a push using `GITHUB_TOKEN` does not itself trigger a Pages build. This uses the workflow's repository contents/write and Pages/write permissions, with no extra API key or runtime backend. Scheduled runs can be delayed by GitHub; a failed run remains visible in Actions. Branch rules must allow the bot's data-only updates.

The browser requests the JSON on load, every ten minutes while visible, and when a stale tab becomes visible again. Requests bypass normal browser caching. It displays the actual successful source-check time in Eastern time, flags snapshots older than six hours, and links directly to the newsroom if it cannot refresh. The panel covers IRS news releases, including announcements about tax rules; it is not a comprehensive or instant Federal Register monitor.

Run the collector tests with `python .github/test-irs-news.py` and refresh data with `python .github/update-irs-news.py`. No workflow has been activated or published as part of the local design preview.

