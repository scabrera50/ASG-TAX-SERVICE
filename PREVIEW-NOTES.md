# Local design preview — October 27, 2026

Status: development changes on `codex/visual-improvement`, prepared for the user's requested commit. No push, production deployment, DNS change, or hosting change has been made.

## Included

- Bold, locally hosted Open Sans headings, heavier ASG wordmark, single-line “More peace of mind.”, darker text and borders, and stronger button/section contrast.
- A consolidated spacing system with matching page gutters, equal desktop columns, aligned cards, and earlier stacking on smaller screens. Removed forced section-heading line breaks and shortened the process heading to “Tax preparation, step by step.” / “Tus impuestos, paso a paso.”
- Matching styling across the original six pages in English and Spanish.
- A 39-item bilingual checklist on the existing client-documents page, with local checkmarks, progress/reset, expandable categories, and print/save-PDF support. Footer, home, service and appointment links expose it.
- Corrections to the supplied draft: removed TurboTax promotion; added ITIN/IP PIN, investment/digital-asset records, dependent support/residency, MA health insurance and rent details; replaced blanket alimony, donation-appraisal and tips/overtime deduction claims with document requests for review. Official reference links appear under the checklist.
- An IRS news window on both homepages with official English headlines, publication dates, source links, and an Eastern-time source-check timestamp. A prepared hourly GitHub Actions refresh preserves static GitHub Pages hosting. The schedule is inactive until this workflow is approved and merged to the default branch.

## Verified locally

- All 12 pages at 320, 390, 640, 671, 768, 960, 1024, and 1440 pixels: 96 checks, no horizontal overflow, matching left/right gutters and no forced H2 line breaks; both home-page emphasis lines fit their columns.
- All 450 local links, referenced assets/srcset candidates and fragments resolve; no duplicate HTML IDs.
- Mobile navigation, service filtering, language/query preservation, and Spanish service-topic preselection.
- English and Spanish checklist checkboxes, progress and reset.
- Live IRS HTML download and parsing: six official, dated news items rendered in the preview.
- Five automated news-parser tests: ordering/entities/deduplication, month rollover, empty-source failure, unsafe-link rejection, and archive-teaser exclusion.
- JavaScript syntax and Git whitespace checks.

The GitHub workflow and its Pages rebuild have been authored but not run remotely. The full existing Playwright/axe CI suite and a physical print/PDF dialog were not run in this local preview; the print layout and expand/restore handlers are implemented for browser printing. The disconnected `server/` API is unchanged.

## Follow-up performance work

The supplied production mobile report scored 87 and showed CLS 0.23. The preview now loads a 1,643-byte base stylesheet instead of 179,672 bytes of vendor CSS, avoids Bitter/italic font downloads, preloads the regular/bold fonts, and uses optional font loading to prevent late swaps. Smaller AVIF header and hero variants and versioned asset URLs are included. Responsive checks were repeated after replacing the stylesheets and after the spacing cleanup; the keyboard skip link was also verified. Actual PageSpeed/CLS scores have not been remeasured. Cloudflare cache TTL changes remain pending and are detailed in `CLOUDFLARE-CACHE-NOTES.md`.
