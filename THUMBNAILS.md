# THUMBNAILS.md — stylized mini-screens for the projects index

Owner decision (2026-10-02): the index gets a small stylized "screen" for each main project. Each thumbnail is drawn in CSS/SVG with invented, abstract content. No client pixels, no product names, no logos, no readable text that identifies a product. It is an impression of the screen type, in the project's accent, not a screenshot.

## Shape and placement

- Size: 96 × 64 px on `md` and up, 80 × 54 px on phones. Radius `rounded-chip` (8 px) outer, 1 px `border-line`, a 1 px inner highlight. Background `bg-surface`, drawings use the world accent (`--accent` family via `data-world` on the thumbnail or a `color-mix` of the accent) plus `--muted` and `--line` for neutral shapes. Light and dark both.
- Placement: at the start of the index row; the row text block follows. Rows without a thumbnail show the empty frame (same size, border and surface, no drawing), so every row's text starts on the same column.
- Motion: none by default. On row hover, a 150 ms lift of 1 px and a slightly stronger border; nothing under reduced motion.
- Implementation: one `Thumb` component with a `kind` prop (enum below), each kind a tiny deterministic drawing (inline SVG preferred; CSS boxes allowed). ≤ 40 lines per kind. Keep stroke widths ≥ 1.5 px so they survive scaling. `aria-hidden="true"`; the row text carries the meaning.

## Kinds (project → drawing)

| Row name | kind | Drawing (abstract, 2–4 shapes) |
|---|---|---|
| Care-management platform, React rewrite | `dashboard-vitals` | Left sidebar bar, a header line, one card with a sparkline and two alert dots (teal) |
| Care-management platform, Vue app | `care-plan` | A checklist: three rows with a check circle and a text bar, one row ticked |
| Care-management API | `api-terminal` | Dark panel with three mono lines (bars), one bracket pair, a green dot |
| Design system, React | `component-sheet` | A 3×2 grid of tiny components: a button pill, a toggle, an input, a chip, a checkbox, a swatch |
| Design system, Vue | `tokens` | Four colour swatches in a row over three thin type-scale bars |
| Video-learning platform, web | `player-chat` | A 16:9 dark player with a play triangle and a red LIVE pill, a narrow chat column with three bubbles |
| Children's reading app | `reader-page` | A phone silhouette with a paper page of text bars, a progress bar, a small badge star |
| Bookstore app | `shop-grid` | A 2×2 grid of book covers (rectangles) with a cart dot |
| Chatbot runtime library | `chat-choices` | Two bot bubbles left, one user bubble right, two choice chips |
| Grocery shopping and loyalty app | `grocery-slots` | A 3×2 product grid with a time-slot strip (four small boxes, one filled) |
| Donation and good-deeds app | `donation-ring` | A progress ring at 70 % with a small badge, a "donate" pill |
| Coaching app | `calendar-strip` | A 7-day strip with one day highlighted, a prompt card with text bars and three reaction dots |
| Member portal, web | `portal-shell` | Sidebar, top bar with avatar dot, two content cards |
| Smart-wallet dashboard | `wallet-card` | A dark card with a balance bar, a QR square (3×3 modules), a chip row (violet) |
| Smart business dashboard with AI | `doc-chat` | A page with text bars and one highlighted bar, next to two chat bubbles |
| Studio website | real capture `shots/thumbs/snaxx.webp` |
| Time-off app | real capture `shots/thumbs/offday-app.webp` | |
| Geo Guesser World 3D | `map-pin` | A map with two road lines and a pin |
| FJALË | real capture `shots/thumbs/fjale.webp` | |
| Za! | real capture `shots/thumbs/za.webp` | |
| Morse Trainer | real capture `shots/thumbs/morse.webp` | |
| Futurisma | `track` | A curved track line with a hover vehicle wedge |
| Secret Dictator | `town` | Three low house shapes and a moon |
| Open-source forks | `fork` | A branch symbol: one line splitting into two with dots |

Rows marked real capture use the owner's own screenshots (`shot` in `projects.ts`, object-cover, top-aligned). Rows not listed (Design dashboard prototype, Chatbot web port, EPUB prototype, Fuel-station app) show the empty frame.

## Quality floor

- Every thumbnail reads at a glance as its screen type, even at 80 px.
- Consistent stroke, radius and spacing across kinds; same two-tone logic.
- Contrast of the accent shapes on `bg-surface` ≥ 3:1 in both themes (they are decorative, but they must not look muddy).
- No emoji, no icon fonts; Phosphor icons may be used inside a drawing at 12–14 px (play, pin, star, speaker).
