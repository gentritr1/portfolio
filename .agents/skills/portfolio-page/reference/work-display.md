# Showing the work

The work is the energy of a portfolio. The shell around it should be quiet enough that a product screen is the most colourful, most detailed thing on the page.

## How many, in what order

- **Home:** 3–5 featured projects with a result each, then one index of the rest (one line each). A fast scroller sees all featured rows.
- **Full case pages:** 3–5, different in kind (a rebuild, a mobile app, a design system, a personal piece), not five of the same.
- **Order:** strongest checkable change for the primary reader first; then live public products; then internal work; then the index. Newest-first only for an archive.
- **Each draft or page leads with its own best project.** In a round of drafts, no two drafts open on the same screen.
- The home index asks one question: which project to open. Filters, sorts and tags belong on a full archive page, not the home.

## Every project entry shows

Name · one line of what it is (for a stranger) · the person's role · year(s) · platform(s) · live link if there is one · one real screen.

## Screens

**Source.** Real screens only: public pages, store listings, or real product screens on invented data (labelled). A working live recreation is allowed when the real screen cannot be shown; label it. Never a fake screenshot assembled from divs, never stock images, never a picsum placeholder.

**Pixels.**
- Never shown larger than the file's pixels. Export at 2× the largest displayed width (a 640px slot needs a 1280px file).
- Text inside a screenshot must be readable at its displayed size: ≥ 11px on phones. If it is not, crop to the part that proves the caption instead of shrinking the whole screen.
- AVIF or WebP, quality 80–85, `srcset`/`sizes` for widths, `width`/`height` attributes or `aspect-ratio` always. The first-screen image loads eagerly with `fetchpriority="high"`; the rest lazy.

**Crop.**
- Crop to the part that proves the words next to it. Crop on whole UI rows; never cut a line of text or a button in half.
- One ratio per set: web 16:10, phone at its own ratio (about 9:19.5). If the slot and the screen differ, change the slot, not the screen.

**Frames.**
- The default is no device mockup: the screen with its own corner radius and, at most, a 1px line of a colour sampled from the ground. No bezel, no notch, no hand, no tilted phone, no fan of devices, no exploded laptop.
- A minimal browser or phone frame is allowed when it explains context (web vs phone, two platforms side by side). Draw it simply and consistently; it is a label, not a prop.
- No pills or labels laid over images. Captions sit below or beside.
- Shadows: none, or one neutral shadow if the screen is a physical object in the page's world (standing on a ground, lit by a light). Never a coloured glow.

**Grounds.** Put screens on a ground that belongs to them: the page ground, or a tint sampled from the screen itself (`oklch(0.95 0.03 h)` style). Never centre a small screen on a big field of unrelated colour.

**Captions.** ≤ 8 words. What it is, and its provenance when not public: "Cart, Viva Fresh app, public store page." · "Real product screen, invented data."

**Enlarge.** Case screens open large on click: native `<dialog>`, Escape closes, focus returns, image at native size.

## Index patterns

| Pattern | When it works | Watch |
|---|---|---|
| Text index + one live preview | Many projects, strong type | The preview must show the row's proof, not a generic thumbnail |
| One ratio grid (rauno.me/craft style) | Many small pieces of craft | Captions in one shape; one ratio; no masonry chaos |
| Featured rows, image + result | 3–5 strong projects | Rows must not become equal 3-card SaaS rows |
| Dated record | Long careers, many releases | Dates must be real and visible |
| Wall/canvas | Visual work in volume | A plain linear route must exist for keyboard, phone and recruiters |

Avoid: three equal cards in a row with icon + heading + text; bento grids whose cell sizes do not come from the content; nested cards; carousels for primary work (people do not click "next").

## Live demos

A live demo of the real thing (a component, a game, an interaction) is the strongest proof a developer can show: the visitor tries the claim instead of reading it. Mount demos when in view, unmount when far, keep their own reduced-motion branch, and budget them (≤ 6 per page).

## Personal work

Personal projects can be shown large and with real assets; they show taste and initiative. Keep them separate from client or employer work so no relationship is implied.

## Checks

- `check.mjs`: C01 (work share), C08–C08e (alt, upscaled, below 2×, no size, broken), C16c (lazy first image), T17 (logo marquee), T15 (bento).
- By eye: every caption says what the screen is; no screen is soft; no text in a screen is cut mid-line; each draft in a round leads with a different project.
