# Home type, spacing and repetition: before and after (2026-11-02)

Implements `design-lab/references/research/gentrit-tech-fix-brief.md` with the owner's four decisions (one headline size, a 16 px floor, case links that name their project, the invented-data caption once per section). **Not pushed: waiting for the owner's yes on these captures.**

- `pairs/`: before (live gentrit.tech, b696f6f) beside after (this branch, production build). First screen, Selected work, All projects, at 1440 and 390.
- `before/`, `after/`: the single captures. Re-run with `BASE=<url> node design/quality/refractive/cap.mjs <dir> design/reviews/home-type-spacing/plan.json`; `plan-mid.json` covers 1101, 1280, 1024 and 320.

## Measured (census `--assert`, production build vs live)

| | 1440 before → after | 1024 before → after | 390 before → after |
|---|---|---|---|
| Type sizes outside figures | 12 → 5 (16, 20, 28, 40, 56) | 12 → 4 (16, 20, 28, 36) | 7 → 4 (16, 20, 28, 36) |
| Adjacent steps under 1.25× | 9 → 0 | 10 → 0 | 5 → 0 |
| Negative letter-spacing | 5 → 0 | 5 → 0 | 5 → 0 |
| Text under 16 px | 128 → 0 | 122 → 0 | 128 → 0 |
| Selected-work headline sizes | 5 → 1 (40) | 5 → 1 (28) | 1 → 1 (28) |
| h1 vs largest heading | 56 vs 52 → 56 vs 40 | 32 vs 37 → 36 vs 28 | 32 vs 33.5 → 36 vs 28 |
| Section paddings off the 4-pt scale | 8 → 0 | 8 → 0 | 8 → 0 |
| Most repeated link label | "Read the case" 17 → none repeated 3+ | same | same |
| Most repeated line | invented-data caption 3 → 2 | same | same |
| Page height | 12,414 → 12,016 px | 13,071 → 12,347 | 17,939 → 16,682 |

Section paddings after, top/bottom: 1440 every section 48/48 (96 between any two), intro 128/24, evidence 0/48, contact 48/96; at 1100 px and below 32/32 (64 between), intro 96/24, contact 32/64.

Checker (`design-lab/tools/vendor/portfolio-page/check.mjs`): 0 hard fails before and after; warnings 13 → 7. T30 and T00 are gone; C08c (1440 only), T10b and T10f remain, as on live. CLS 0 at all three widths. No horizontal scroll at 320 (scrollWidth 320).

Keyboard (`design/quality/refractive/tab-pass.mjs`, Tab only, 1440 and 390): PASS. Every stop is on screen with a ring, in page order. All projects names announce where they go ("Read the Bayyinah TV case", "Tondo, Website (opens in a new tab)").

Placed words in the scaled frame (`design/quality/refractive/overlap.mjs`, 1024–1920): PASS. With fixed 16 px words, the Read to Feed and care layer rows collided with the copy above them below 1320 px (up to 118 px; live already overlaps at 1024 and 1101 by 32 and 14 px). Those two rows now hide in the measured ranges (Read to Feed 1024–1279, care 1101–1319), the same treatment the Design System row already had at 1024–1279.

## Judgment calls for the owner

- At 1100 px and below the project heading joins the small heading (28 px) and the h1 is 36 px.
- The Offday credit line is hidden on phones; the status line above the stack says the same thing.
- The about section's "Based in Kosovo · Working remotely · Bachelor's degree, UBT" line was cut: it repeated the contact line.
- In-page links (evidence row, "AI in the workflow") now take → like other internal links; ↗ is only for other sites. Contact buttons are unchanged (non-goal).
- The Offday stack's plate names (13 px, they must fit the 22 px peek) and its drawn schema stay as they are: they are inside the figure, like a product screen.
- The folded panels ("Explore the product layers", "The field behind this page") still have 13 px text. They are closed by default and were not in this pass.
