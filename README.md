# Gentrit Rashiti - production portfolio

Public address: https://www.gentrit.tech

This app ships Refractive Engine and its ten project case pages. The full drafts app was preserved before extraction in a separate local Git repository at `/Users/gentlegen/Desktop/portfolio/output/portfolio-drafts`. Its `ARCHIVE.md` describes the snapshot. Research captures are preserved there under `design/` and ignored by Git because of their size. GitHub publication of that archive still requires working GitHub authentication; intended visibility is private.

## Development

Run `npm ci`, `npm run dev`, and `npm run build`. Vercel uses the Vite preset and publishes `dist/`. No Functions or server-side image transformations are required.

- `src/portfolio/`: the portfolio, case pages, scene, shared project data and optional product explorer.
- `src/content/`: project facts and links.
- `public/`: prebuilt WebP product images, local fonts, sharing image and downloadable CV.
- `cv/`: editable CV copy and PDF renderer; see its README.

The `/work/:slug` and former Refractive Engine URLs redirect to current cases. Other draft screens are retired. Vercel rewrites only published pages to the app, so a missing asset or old draft URL does not silently receive HTML with a 200 response.

## Delivery and caching

- Hashed `/assets/` JS/CSS: one-year browser caching with `immutable`. New builds generate new URLs.
- Stable screenshot/font paths: one-day browser caching, with a one-week stale-while-revalidate window. Change filenames when an updated image must appear immediately.
- Stable CV path: revalidate on use, so a long browser TTL does not pin an old CV.
- Sharing image: one hour then revalidation.
- HTML: Vercel's static default revalidates in the browser; do not apply immutable asset caching to it.
- `.vercelignore` excludes local research, agent configuration and application-material sources from upload. The prebuilt public PDF is included.

Static WebP files avoid runtime image-optimization usage. Existing lazy galleries, the optional explorer and the lazy Three.js scene keep optional content separate. The scene still has a substantial Three.js chunk; removing other drafts does not make the visual effect free to download.

CDN hits still count as delivery to a visitor. Browser reuse, smaller assets and fewer requests reduce usage; a cache hit does not remove transfer accounting. Monitor actual Vercel Usage after deployment. These rules are prepared locally and are not live until deployed.

Sources: https://vercel.com/docs/caching/cache-control-headers and https://vercel.com/docs/manage-cdn-usage

## Loading and motion budget

The visible hero gets high image priority; other chapters use lazy image loading. Thumbnail strips attach their full-size image sources only within 200px of the viewport or after intent. A direct case visit does not mount the unseen homepage. Hero layer previews load on intent rather than a timer.

Graphics capability detection, Three.js import and warm-up wait for page load and an idle opportunity. Save-Data connections retain the static background. Default renderer pixel density is capped at 1 on phones and 1.5 on wider screens; the optional diagnostics controls can override it. The existing renderer stops requesting frames once settled and pauses while the document is hidden. Scroll updates batch geometry reads before style writes, and closed diagnostics do not cause scroll-driven React state updates.

WebGL submits rendering work from JavaScript on the main thread; GPU drawing does not make that JavaScript free. Verify on a physical slower phone before making broad FPS claims. Temporary performance instrumentation lives outside the repository and is absent from the shipping build.
