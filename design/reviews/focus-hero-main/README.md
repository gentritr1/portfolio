# The focus-pull hero on main — 2026-11-03

The owner chose the focus pull over the exploded Offday stack for the home page's first screen, keeping main's role line and audience lines and the headline "Web and mobile products. From the first screen to release."

- `HomeIntro.tsx` keeps main's copy block (role, audience lines, Results and How I work links) and the evidence rows; the stack and its Offday block are replaced by `FocusHero.tsx`.
- The four screens: Care platform, Bayyinah TV, Read to Feed, and Offday as "Own product" (the stack was the home page's only Offday entry, and the audience line no longer names Web3).
- "Real product screens, invented data." stays in the hero, once, under the areas.
- Tabs carry only the area; the shown product's name and years sit under the screen, one line at every width.
- Side by side from 1024 px at 0.9 : 1.1; stacked below. Measured at 375, 414, 768, 889, 1024, 1100, 1180, 1280, 1366, 1440 and 1920: tabs 44 px and one line, all four captions one line, no sideways scroll; from 1024 up the whole hero ends above the fold (1366 × 768 included). 889 × 832 leaves the tabs just under the fold. Sheets: `widths-phone-tablet.png`, `widths-laptop.png`, `widths-desktop.png`.
- `rules-tap.mjs` tested only the stack and is removed; `focus-hero.json` (run with `cap.mjs`) takes its row in `design/quality/refractive/README.md`.

Design review (owner asked for UI/UX Pro Max, Impeccable, Emil and taste-skill v2 before merging), one critique round and one fix batch:
- The headline runs across the whole hero, one sentence per line: two lines at main's 56 px from 1024 px up (it was four lines in the left column). Phones keep main's 36 px step; a size that kept two lines there fell off the census's 1.24 type scale.
- The role line and audience lines start under the headline, level with the screen, one step up on main's scale beside it (28 and 20 px; owner: "too small").
- No resting shadow on the screen (its 1 px edge stays, marked data-ui); the pause control is a filled tone step, not an outlined circle; the tabs' product names are read out by screen readers.
- taste lint 0 FAIL 0 WARN on the hero files (main's two field scrims and the dot mask and seam glow annotated with their reasons). The inspector's other findings are in Selected work and predate this change.

Checks on the production build (vite preview, :4173): census `--assert` PASS; focus-hero.json all runs pass, keyboard trail included.

Before choosing, a blind reviewer scored main's stack hero 37 against the focus pull's 33 on a stale branch page (first screens only); the owner chose the focus pull on taste.
