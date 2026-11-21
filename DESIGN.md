# ASG Tax Services design direction

The reference for anyone changing how asgtaxservice.com looks or reads. It records what the site is and why each main choice was made, so new pages stay consistent. `_config.yml` keeps this file off the public website.

Dial: ENERGY 1 / RHYTHM 1 / MOTION 1

## What the site is

A bilingual (English and Spanish) site for a small tax office at 111 Park St, Lawrence, MA, run by Maria Lizardo (Founder & Tax Preparer; IRS AFSP Record of Completion; Massachusetts Notary Public). Visitors are families and small-business owners, many of them Spanish speakers, often on a phone. They come to find out whether the office can help, when it is open, and how to call. Calm and trustworthy beats flashy.

## Identity

- **Logo and motif:** the custom Lawrence mill-skyline logo (Ayer Mill clock tower, Tower Hill water tower, Mount Vernon tanks). It is the one decorative image and appears in the header, footer and home hero. Do not add stock illustrations.
- **Palette:** forest green ink `#173c26` for text and solid buttons, because dark green reads as steady and local, not corporate blue. Sage `#e8efdf` and pale greens for section backgrounds. One accent, lime `#d9edb0`, used only on the dark closing band and the "Current" hours tag. Muted text `#445347`. All text pairs pass WCAG AA (body text 7.9:1).
- **Type:** Open Sans, self-hosted, because it reads clearly in both English and Spanish at small sizes and has full accent coverage. Headings are bold with slightly tight letter-spacing. No monospace, no uppercase tracked labels.
- **Shape:** 8px radius on buttons and panels, 1.5px green borders instead of shadows. Filter chips are the only pill shapes, because they are toggles.

## Layout rules

- One focal point per screen: the H1 on each page, then the main call action.
- Sections exist only when the content needs them. Do not add "how it works" step blocks, logo bars, statistics or testimonials unless there is real content behind them.
- Office hours appear in full on Home, Appointments and Contact (the pages where people plan a visit). Other pages link to Contact instead of repeating them.
- The dark closing band ("Let's take taxes off your mind") appears on Home and Services only.
- Service cards share one layout on purpose: the Services page is a filterable catalogue, and equal cards let people compare. They are not numbered, because the services have no order.
- Icons are simple line icons drawn for their meaning: map pin for the address, phone for calling, document for individual returns, briefcase for business, calendar for planning, shield for IRS support. If no icon fits, use none.

## Copy rules

- Plain, warm, specific. Name the real thing: the address, the service, the hours, the credential.
- No fragment-pair slogans ("Local roots. Personal support."). Write one complete sentence instead.
- Sentence case for headings, labels and buttons. Small labels above headings only when they add information the heading does not.
- Button labels say what happens ("See all 14 services", "Call about a service"), never "Explore", "Learn more" or "Get started".
- The ↗ arrow means "opens another website" and appears only on links to other sites (IRS.gov, Google Maps, WhatsApp, USCIS).
- No em dashes in any text, including screen-reader labels.
- No statistics, reviews or claims without a real source. Credentials stated only as verified (AFSP renews each year).
- Spanish pages: never mention notary services without the Massachusetts non-attorney notice required by M.G.L. c. 222, section 21. The notice is on the Spanish Services page.

## Interaction

- Every link and button is at least 44px tall on touch screens.
- Hover darkens or underlines; pressing shifts the button 1px or thickens the underline, so the press registers without relying on color.
- Focus shows a 3px green outline. Motion is limited to short hover transitions and stops for people who turn on reduced motion.
