# Control-room follow-up verification

Completed 2026-10-03. Local changes only; no push or deployment.

## Implemented in separate commits

1. 450 ms camera dolly from the visible active hero pane into the shared case-monitor transition. Preload, repeated-click guard, unmount guard, hidden-tab timeout and reduced-motion/CSS fallback paths are included.
2. 280 ms waveform interpolation with shared phase. CSS and WebGL active borders both settle to the channel tint.
3. Five authored-recreation AVIF stills, 512 × 320, requested on channel selection and cached as textures per scene. Image failure preserves the waveform; disposal releases textures. Provenance is in `public/signal-posters/README.md`.
4. A single quiet pane behind every case lower third, using the existing scene. No idle drift or trace movement; local pointer tilt only.
5. An edge-to-edge phone wall with constant stage height, separate time-code rail, previous/next controls and horizontal touch gestures. Hidden phone hero stacks do not import the scene. The live chat no longer bottom-aligns incoming messages or changes counter width.

## Checks

- TypeScript, production build and `npx -y impeccable detect src/` run before each commit. The repository's own Impeccable detector also returned no findings for changed UI.
- Home checked at exact 375, 820 and 1440 CSS px in dark/daylight, with full/reduced motion: all 12 combinations had document scroll width equal to viewport width.
- Bayyinah case checked at the same three widths, themes and motion settings: no horizontal overflow. The single-pane component is shared by all five case pages.
- All five home channels checked at 375 px: stage remained 560 px tall in the 812 px review viewport, with no horizontal overflow.
- Synthetic touch pointer events changed Bayyinah → Read to Feed and blocked the subsequent click. Keyboard ArrowRight changed Read to Feed → Viva Fresh. A physical touchscreen was not available for testing.
- Lab inspected in dark and daylight, stack and single-pane layouts. Sampled frame counter: 120 fps; worst frame 9.4 ms. This is a local browser sample, not a guarantee on all GPUs.
- Camera test exercised in the lab; Tune in opened the matching case route. CSS fallback and reduced-motion scenes retain the direct navigation path.
- The exact-width development fixture lives at `/lab.html?review=1`. It includes width/theme/motion/page controls, a synthetic swipe test and layout-shift readings on `html[data-review-cls]`. Preference overrides and measurement code are development-only and are eliminated by the production build.

- Final production sizes: main 107.63 kB gzip; lazy 3D scene 19.06 kB gzip (budgets approximately 110 and 25 kB).
- After correcting chat alignment and the one-to-two-digit counter boundary, the 1440 px case review recorded CLS 0 through 15 automatic messages. The 375 px case review also recorded CLS 0. These are bounded local measurements, not a claim that every network/font condition was tested.

## Remaining backlog

The 404 stack, optional refraction and audio, schedule preview, case timelines/video loops, OG image, deployment and owner-supplied contact/education details were outside this five-item pass.
