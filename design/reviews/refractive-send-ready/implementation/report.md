# Portfolio check: home

URL: http://localhost:5178/
Run: 2026-10-30T11:41:45.365Z · mode experience · scheme dark · owner "Gentrit Rashiti" · facts CONTENT.md
Server: no dev-server client found (no /@vite/client); C17 counts.

**Verdict:** PASS · 0 hard fail(s), 0 warning(s) · template tells: 0 hard, 0 soft

## 1440x900

- Hero (h1): "I build web and mobile products, from interface to backend." · Archivo 56px · largest text: "I build web and mobile products," 56px
- Work in first screen: 32% (with canvas/video outside data-work: 100%) · words: 50 · sizes: 13, 16, 20, 40, 56
- Work counted: figure.re-intro-art "Interface Server rules Data Real product screens" 32%
- Families: Archivo · page height 12147px
- Display face: Archivo (@font-face, loaded) · rendered · ground (T35, H12): rgb(5 5 8), read behind the hero: div.re-root
- CLS 0 · LCP 244ms IMG · long frames 7 (max 298ms)
- Frames (headless, indicative): intro p95 16.8ms · scroll p95 16.8ms, 2 over 25ms (blank-page control 16.7ms) · reduced-motion rAF 0/s
- Sampled contrast (text over images/gradients): a.re-mark "Gentrit Rashiti" 16.97:1 · a "Work" 11.53:1 · a.re-nav-about "About" 11.53:1 · a "CV" 11.53:1
- Contrast grounds (C06): 4 painted (elementsFromPoint), 0 by ancestor chain, 0 covered and skipped, 40 sampled
- Human-made signals 7/8: ✓ displayFace  ✓ typeDecision  · asymmetry  ✓ workLarge  ✓ themedSurfaces  ✓ nameSmall  ✓ tintedGround  ✓ selfHostedFonts
- Motion: 0 at load (1 in the first screen), 0 during scroll, 42 transition/animation events, 0 scroll-linked, 0 loops · durations 150/160/220/600ms · easings cubic-bezier(0.23, 1, 0.32, 1) ; ease

| | Id | Finding | Fix | Where |
|---|---|---|---|---|
| ○ | C08c | 2 image(s) below 2× density | Allowed: Approved original store images shown at readable phone scale are the highest resolution available | reading-3.webp<br>reading-2.webp |
| ○ | T10b | Template phrases or microcopy in the page (2) | Allowed: Familiar hiring labels keep the requested visible index scannable | Selected work (flag)<br>Skills (flag) |
| ○ | T10f | Technical words on the home page (11) | Allowed: Engineering terms identify the work and tools for the intended reader | token<br>parity<br>tenant<br>API<br>route<br>component<br>HLS / IVS / CSP / ADR / RN / SSR<br>deep link |
| ○ | T30 | Middot chains in 2 line(s) | Allowed: Metadata states ownership release status and technology | p.re-engineering-meta "Own products · Node · WebSocket · PostgreSQL"<br>p.re-engineering-meta "Built alone · Pre-launch · Next.js · Postgres" |

## 390x844 (phone)

- Hero (h1): "I build web and mobile products, from interface to backend." · Archivo 32px · largest text: "I build web and mobile products," 32px
- Work in first screen: 32% (with canvas/video outside data-work: 100%) · words: 45 · sizes: 16, 20, 28, 32
- Work counted: figure.re-intro-art "Interface Server rules Data Real product screens" 32%
- Families: Archivo · page height 17480px
- Display face: Archivo (@font-face, loaded) · rendered · ground (T35, H12): rgb(5 5 8), read behind the hero: div.re-root
- CLS 0 · LCP 212ms IMG · long frames 5 (max 214ms)
- Frames (headless, indicative): intro p95 16.8ms · scroll p95 16.8ms, 1 over 25ms (blank-page control 16.7ms) · reduced-motion rAF 0/s
- Sampled contrast (text over images/gradients): a.re-mark "Gentrit Rashiti" 16.97:1 · a "Work" 11.53:1 · a "CV" 11.53:1 · a "Email" 11.53:1
- Contrast grounds (C06): 4 painted (elementsFromPoint), 0 by ancestor chain, 0 covered and skipped, 40 sampled
- Human-made signals 8/8: ✓ displayFace  ✓ typeDecision  ✓ asymmetry  ✓ workLarge  ✓ themedSurfaces  ✓ nameSmall  ✓ tintedGround  ✓ selfHostedFonts
- Motion: 0 at load (1 in the first screen), 0 during scroll, 6 transition/animation events, 0 scroll-linked, 0 loops · durations 600ms · easings cubic-bezier(0.23, 1, 0.32, 1)

| | Id | Finding | Fix | Where |
|---|---|---|---|---|
| ○ | T10b | Template phrases or microcopy in the page (2) | Allowed: Familiar hiring labels keep the requested visible index scannable | Selected work (flag)<br>Skills (flag) |
| ○ | T10f | Technical words on the home page (11) | Allowed: Engineering terms identify the work and tools for the intended reader | token<br>parity<br>tenant<br>API<br>route<br>component<br>HLS / IVS / CSP / ADR / RN / SSR<br>deep link |
| ○ | T30 | Middot chains in 2 line(s) | Allowed: Metadata states ownership release status and technology | p.re-engineering-meta "Own products · Node · WebSocket · PostgreSQL"<br>p.re-engineering-meta "Built alone · Pre-launch · Next.js · Postgres" |

Screenshots: `<width>.png` (first screen), `<width>-full.png`, `<width>-reduced.png`, `<width>-t<ms>.png` with --frames, `<width>-i<ms>.png` with --interact, and `sheet.png` (first screens; interaction frames as a second row). Ids: `reference/checks.md` (`node scripts/check.mjs --list`).
