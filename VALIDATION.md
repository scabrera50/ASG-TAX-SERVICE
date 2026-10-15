# Validation — October 14, 2026

## Immigration translation and clerical assistance

The bilingual immigration section, home-page feature, separate service filter and inquiry topic passed [GitHub Actions run 38658425409](https://github.com/scabrera50/ASG-TAX-SERVICE/actions/runs/38658425409) on application commit `41fd39adcc5372ce3b6ed2b554c51b63ff889508`.

- All 60 responsive page checks and automated accessibility checks passed. The 13-service directory retains the original 12 listings plus the new limited assistance offering.
- English/Spanish immigration filtering, detail links, non-attorney notice, official resource links, topic preselection and language switching passed. No untranslated strings remained after generation.
- All 36 backend security tests passed, including actual HTTP requests and the new topic's agreement with both contact forms and the strict server allowlist.
- The owner clarified that the business is licensed, Maria is not an immigration attorney, and she holds a Massachusetts notary commission. Copy was limited to translation and clerical assistance using current [Massachusetts General Laws, chapter 222, section 17](https://malegislature.gov/Laws/GeneralLaws/PartIII/TitleI/Chapter222/Section17). It excludes form selection, eligibility/status assessment, legal/procedural advice, obtaining records, representation and submission on a client's behalf.

The English notice reproduces the statutory statement and the Spanish page translates it. The operator README explains that the required written notice must also be provided to each client before immigration-related services. Website checks verify content and functionality; they do not certify business practices or legal compliance. The existing standalone backend remains unhosted, and the public contact form continues to prepare email drafts.

## Server validation backend

The new standalone `server/` API is implemented but is not hosted or connected to the live form. The live site continues to prepare email drafts. Backend security tests cover strict input types, raw length bounds, required values, service/language allowlists, email/phone formats, unknown fields, malformed JSON/UTF-8, request byte limits, content types, origins, unsupported methods, generic error responses, and startup configuration. SQLite tests verify persistence, schema constraints, and SQL injection strings remaining literal data in prepared inserts/reads. Both language forms are checked against the server contract.

All **36 security tests passed**, including actual HTTP requests, in [GitHub Actions run 38630562408](https://github.com/scabrera50/ASG-TAX-SERVICE/actions/runs/38630562408) on application commit `a00e4c189c918e043fcd0eeb0cbe9f3e090ff688` using Node.js 24.21.0. The same run passed all **60 responsive bilingual website checks** and existing interaction/accessibility checks. Local Node.js 24.19.0 checks passed 35 tests; the HTTP test ran in GitHub because local loopback networking is restricted in this desktop session. No real visitor data or messages were used.

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

