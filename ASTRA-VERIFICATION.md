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

## Follow-up: the rest of the handoff

Items 5–7 and 9–13 are implemented. The owner selected compact OGL refraction within the size budget, supplied email/LinkedIn/UBT education, and chose to keep the tooling tracked. Hosting remains pending; nothing has been pushed or deployed.

- The 404 stack flattens/desaturates over 1.2 seconds; reduced motion is immediately still.
- Compact framebuffer refraction loads only after conservative GPU qualification and a measured frame-time gate. Camera-space pane sorting and explicit active texture binding make transmission consistent across drivers. Losing WebGL or failing a shader restores CSS; early unmount releases the context.
- Channel sound is remembered, off by default, silent on load, and synthesised only on intentional channel selection.
- Schedule previews run live recreations while hovered, tune between rows, dismiss on Escape/focus, and first load only after an eligible hover. Touch/reduced motion suppress them.
- Five factual milestone lists and 16-second guided sequences use existing recreations; Viva Fresh tours public store frames. No dates or metrics were invented.
- Readout sizing follows strip width; daylight materials, labels and story rails are refined.
- The sharing card is 1200×630. Local, explicit-origin, Vercel fallback and precedence metadata checks pass.
- Site and CV include the supplied email/LinkedIn and Bachelor's degree · UBT. The PDF was rendered and visually checked as one A4 page, with working link annotations and no placeholders. Its editable HTML is retained in `cv/`.
- The stale Impeccable surface brief now matches the implemented six-channel system.

### Final integration checks

All seven routes (home, five featured cases, no-signal) were measured at exact 375/820/1440 CSS px, dark/daylight, full/reduced motion: 84 combinations. Document scroll width equalled viewport width, measured readouts fit, and recorded CLS was 0 in every sampled state. These are local development-fixture measurements, not a claim covering every network, font, hardware or assistive-technology condition.

The 820 px daylight Read to Feed meters were visually inspected: ≈14, 0.63 → 0.81, and 3 align on one strip. Manual reduced-motion step 4 showed the ISBN result and Next step returned to step 1. The care demo switched to Harbor Health, the wallet demo showed its receive address/QR, the streaming demo showed the premium paywall, and Viva Fresh's fourth step loaded the Android cart image. A wallet sequence was sampled at four 4.1-second intervals and advanced 1 → 2 → 3 → 0 while running; Pause and Replay worked, and scrolling to the spec sheet paused playback.

Audio lifecycle checks covered silent default/enable, intentional playback, rapid switches, muting, hidden tabs, blocked storage and reuse of one AudioContext. Graphics math checks compared camera-space depths against OGL transforms; a lifecycle harness exercised early unmount, queued imports, context loss, observer/listener cleanup and idempotent disposal.

TypeScript, production build and the required npx Impeccable check pass. The actual repository detector returned `[]` for the final source directories. Case narrative extraction was structurally compared: all 28 reconstructed project records were unchanged. Eight reduced-weight shell icon paths match the original Phosphor light paths byte for byte, with their license preserved.

Final Vite-reported gzip sizes: entry 104.30 kB; synchronous entry graph including shared preloads 109.85 kB; lazy scene 19.73 kB; optional glass 0.80 kB. Case-only narratives load with the case route, and the preview no longer downloads before first hover. The glass lab sampled 120 fps with a 10.4 ms worst frame. After the lifecycle correction, the lab again reached active glass and its Lose WebGL context control restored CSS with no remaining canvas; hardware/frame gates remain conservative and automatically fall back.

### Remaining owner action

Only publishing/hosting and choosing a custom domain remain. No education subject or dates have been inferred. Tooling stays tracked by the owner's decision.
