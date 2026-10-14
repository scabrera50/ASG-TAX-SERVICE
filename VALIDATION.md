# Validation — October 14, 2026

## Server validation backend

The new standalone `server/` API is implemented but is not hosted or connected to the live form. The live site continues to prepare email drafts. Backend security tests cover strict input types, raw length bounds, required values, service/language allowlists, email/phone formats, unknown fields, malformed JSON/UTF-8, request byte limits, content types, origins, unsupported methods, generic error responses, and startup configuration. SQLite tests verify persistence, schema constraints, and SQL injection strings remaining literal data in prepared inserts/reads. Both language forms are checked against the server contract.

Local Node.js 24.19.0 checks passed; the actual HTTP integration test is run in GitHub Actions because local loopback networking is restricted in this desktop session. No real visitor data or messages were used.

## Published static website

The final light, bilingual Lawrence-logo implementation passed GitHub Actions run 38610448772 on application commit 26a96b92fc516669b89dd446788f21770d4a6de5.

- Chromium rendered all 12 pages (six English and six Spanish) at 320, 390, 768, 1024, and 1440 pixels: 60 checks with no horizontal overflow.
- Header logo loaded, WhatsApp links consistently target https://wa.me/19789029018, and all internal page links and referenced assets resolved. No JavaScript page errors or HTTP failures were detected.
- English/Spanish switches preserved page, category, and selected service. Spanish service labels, filter counts, contact labels, and draft messages were checked.
- Mobile menu, Escape behavior, service filtering, unknown-category fallback, service-specific inquiries, FAQ expansion, keyboard skip-link focus, and no-JavaScript fallbacks passed.
- Required fields and invalid email addresses were rejected. English and Spanish draft subjects/body encoding passed using a mocked navigation target, so no external email handler opened.
- Automated axe-core 4.10.3 scans of all 12 desktop pages found zero violations under the WCAG 2 A/AA and WCAG 2.1 AA rule sets. Automated checks do not replace manual assistive-technology testing.
- Desktop home/services/contact screenshots, a mobile home screenshot, and result JSON were saved as the website-preview-and-qa artifact on that run.

All 12 service listings, all seven office hours, and supplied contact information are retained. CMS vendor assets and licensing match the supplied release. Canonicals, CNAME, sitemap, and robots.txt consistently use www.asgtaxservice.com; the sitemap includes both languages.

The ASG skyline logo is a transparent PNG created with ImageGen using the supplied landmark photographs as references. Those reference photographs and municipal seals are not published as website assets. The WhatsApp glyph’s attribution/license is included.

Local browser preview was unavailable because of session networking/browser restrictions; browser QA ran in GitHub’s hosted runner. Contact uses an email draft, not backend delivery. Appointments and document delivery require contacting the office. No actual email or WhatsApp message was sent during QA. No DNS, domain setting, or business credentials were changed.
