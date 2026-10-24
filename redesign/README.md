# LeadTown / Growth District preview

Independent, buildless static website. Runtime files are in `dist/`; the GitHub Pages preview lives in `/redesign/`. No ChatGPT sign-in, Sites runtime, API key, paid renderer or third-party 3D engine is used.

## Run and edit

Serve `dist/` with any static web server. Edit `index.html` (content), `styles.css` (visual system), `app.js` (quote and accessible controls), and `district.js` (original WebGL renderer). No dependency installation or compilation is necessary. `district.svg` is the no-WebGL/no-JavaScript poster.

## Release status

Working preview, not a final release. `noindex,nofollow` is intentional. Do not remove until the approved domain, content, routing, privacy and enquiry delivery are verified. Main website and DNS are unchanged by publishing this preview folder. Original website history and assets are preserved.

## Contact and delivery

The WhatsApp number is inherited from the existing website: +64 22 390 5211. Owner must confirm it before main-site release. The quote builder generates a brief in memory, allows review, and requires consent before enabling the WhatsApp link. It does not create CRM records, send email, schedule meetings or send the WhatsApp message automatically. No test enquiry should be sent.

## Still needed before main release

- Confirm contact number, business details and delivery channel.
- Approve copy, design and service scope (Instagram management included at owner request).
- Supply real client screenshots, logo permissions and testimonials if case studies are to appear; none are fabricated in this preview.
- Configure an actual form endpoint/CRM and confirmed booking calendar if desired. No scheduling URL has been supplied.
- Complete real phone, Safari, Firefox, keyboard and screen-reader QA. Confirm live WebGL rendering on supported hardware, context-loss fallback and reduced motion.
- Confirm social preview image, canonical/domain routing, SEO indexing and accessible performance on production before launch.

## Verification

Run `node --test tests/*.test.mjs` and `node --check dist/app.js` / `dist/district.js`.
Browser checks and their limitations are recorded in ClickUp. Test data must be fictitious, never sent. No analytics, marketing pixels, fabricated results, external model downloads or customer data are included.
