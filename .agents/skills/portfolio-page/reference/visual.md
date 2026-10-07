# Visual: type, colour, layout

The visual system has one job: make the work look like the most considered thing on the page, and make the page look like one person chose every value. Cover the display type with your hand: if the page could be anyone's, the type is wrong, however good it is.

## Typography

### Choosing faces

- **One display face chosen for the page's rule; one quiet text face; at most one outlier (a mono for numbers and dates).** Three families maximum.
- The display face is the identity. Pick it from the person's world (the products, the place, the era, the material), and write the reason in one sentence.
- **Default faces as the display voice are a hard fail:** Inter, Geist, system-ui / -apple-system / Segoe UI, Roboto, Arial, Helvetica, Poppins, Montserrat, DM Sans, Work Sans, Open Sans, Lato, Nunito, Raleway. They are fine for small UI text under a chosen display face.
- **Reflex faces need a written reason:** Space Grotesk, Plus Jakarta Sans, Manrope, Outfit, Syne, Playfair Display, Merriweather, Lora, Instrument Serif/Sans, Fraunces, Newsreader, Cormorant, DM Serif, Recoleta, IBM Plex Sans, Space Mono. Generated sites reach for these; use one only when its character is the point (Fraunces' optical sizes for one large sentence; Plex for an engineering world).
- Avoid the 2025 "cyber serif" kit: a serif display (Newsreader/Instrument Serif) + Inter body + Space Grotesk caps labels + near-black + one emerald accent + glass cards.
- Self-host every font (WOFF2, subset, `font-display: swap` with a metric-matched fallback, or `optional` for the display face), preload only the first-screen face, ≤ 300 kB of fonts on the first route. Check licences: OFL faces are safe; Fontshare and Pangram faces are not self-hostable without reading or buying the licence.

Starting points by personality (all OFL; pick one and push it). A reflex face taken from this table is allowed when the table's reason applies to your page; record it as `allow T18c: <reason>` so the warning does not count against the page:

| Personality | Display | Text | Outlier |
|---|---|---|---|
| Editorial | Fraunces (opsz 144, wght 500–700, roman) | Libre Franklin | JetBrains Mono |
| Editorial, reading | Literata (opsz) | Literata / Public Sans for UI | Martian Mono |
| Technical | Hubot Sans (width axis as the decision: condensed 900 or extended 200) | Mona Sans | JetBrains Mono |
| Technical, one face | Martian Mono (400/700 only) when density is the identity | same | — |
| Humanist, warm | Bricolage Grotesque (opsz 96, 700–800) | Public Sans | IBM Plex Mono |
| Playful, loud | Unbounded 700–900 (≤ 5-word headlines) | Public Sans | JetBrains Mono |
| Poster / Swiss | Anton or Big Shoulders Display (use across the whole page, small print included) | Archivo Narrow | Martian Mono |
| Swiss, systematic | Archivo (wdth 82% for names, 100% for prose) | Archivo | Martian Mono |
| Luxury | Cormorant Garamond 500–600, caps tracked +0.08em, ≥ 24px only | Public Sans 300–400 | — |
| New-ish, not yet default | Funnel Display / Funnel Sans; Host Grotesk | same family | Fragment Mono |

### Type tokens

One fluid scale for text, a separate jump to display. Fluid formula (Utopia): for min `a` at 320px and max `b` at 1440px, `slope = (b − a) / 1120`, `clamp(a, a − slope×320 + slope×100vw, b)`.

| Role | 320 → 1440 px | Line-height | Tracking |
|---|---|---|---|
| display | 40 → 96 (cap 6rem; type-as-image may use `vw` on purpose) | 0.95–1.05 (caps ≥ 1.0) | −0.02 to −0.04em (floor −0.04) |
| h1 | 32 → 56 | 1.05–1.1 | −0.02em |
| h2 | 26 → 36 | 1.1–1.2 | −0.015em |
| lede | 18 → 22 | 1.35–1.45 | 0 |
| body | 16 → 17 | 1.5–1.65 | 0 |
| small | 14 | 1.4 | +0.01em |
| caption | 12–13 | 1.3–1.4 | +0.015em |
| caps label | 11–12 | 1.2 | +0.06 to +0.12em |
| mono data | 11–14 | 1.2–1.4 | 0, `tabular-nums` |

Rules:
- 3–5 distinct sizes on the first screen; adjacent roles differ by ≥ 1.25×.
- Measure 45–75ch (target 60–68), set with `max-width` in `ch` on the text itself. Captions 35–45ch.
- `text-wrap: balance` on headings, `pretty` on paragraphs; `font-variant-numeric: tabular-nums` on years, tables, counters; `font-optical-sizing: auto` where an `opsz` axis exists; `font-synthesis: none`.
- Variable axes are decisions, not defaults: set `wdth`/`wght`/`opsz` deliberately on the display element.
- Dark theme: body line-height +0.05 and weight +25–50, or a lighter weight if the face blooms.
- Monospace only for code, data, dates and measurements; never as a "technical" costume for prose.

## Colour

### Strategy first

Choose one, write it down, then pick values:

| Strategy | When |
|---|---|
| **Paper and ink, tinted** + the work's own colour | The default for most portfolios; screenshots carry the colour |
| **Near-black, work is the colour** (no accent) | Visual work in volume |
| **One accent with a job** (focus, links, current row; ≤ 5% of any viewport) | Professional index |
| **Colour taken from the work** (ground sampled from the current screen, snapped to 6–8 curated hues, C ≥ 0.12, L 55–72%) | Per-project pages, index hover |
| **A committed two- or three-colour identity**, each colour with a named job | When the rule needs it (mustard field + ink + cobalt; yellow discs on matte black) |
| **Colour from a real source** (the sun's position, a place, a material) | A mechanism that computes the palette |

### Values (OKLCH)

1. Anchor hue from the material, never from a category ("tech = blue").
2. Paper 95–98% L and ink 16–22% L, both chroma 0.005–0.02 toward the anchor hue. No pure #000/#fff.
3. Neutral ramp by stepping L only (98, 95, 90, 82, 68, 46, 30, 20). Secondary text from the ground hue at 45–50% L (light) or 70–75% (dark), chroma ≤ 0.03 — never a grey from an unrelated palette.
4. Accent at chroma 0.12–0.27, inside sRGB, with a hex fallback.
5. Mix in OKLab (`color-mix(in oklab, …)`) for hover and tints.
6. Measure every text/ground pair in both themes: body ≥ 4.5:1 (APCA Lc ≥ 75), secondary ≥ 4.5:1 (Lc ≥ 60), large ≥ 3:1, focus and UI ≥ 3:1.

### Avoid

- **The indigo band:** any colour at hue 255–315° with chroma > 0.15, and any gradient between two hues in 200–330°, unless the brief names it. (Tailwind indigo-500 is oklch(58.5% 0.233 277).)
- **Tailwind's default greys** (gray/slate/zinc 400–600 sit at hue 257–286°). `gray-400` on white is 2.54:1 and fails body text.
- **Dark + one neon + glow:** a near-black ground, one accent at L > 70% and C > 0.2, glass cards and coloured halos. A dark ground is fine; that combination is not.
- Decorative gradients, mesh, aurora, blobs, grain overlays, dot or grid backgrounds — unless the colour is computed from something real and the page says so.

### Dark mode

Check it: `check.mjs --scheme dark`. Composed, not inverted: ground 12–16% L tinted; surfaces +3% L per level (no shadows for elevation); text 92–96% L; accent −0.02 to −0.04 chroma and +5–10% L; no glow. Switch themes with transitions disabled for one frame. Set `theme-color` per scheme and theme `::selection`, focus ring, `accent-color`, `caret-color`, scrollbars.

## Layout

- **Grid:** 12 columns used asymmetrically (5/7, 4/8, 3/9, 8/4); one primary axis; at most one deliberate break per viewport. Avoid 6/6 and `repeat(3, 1fr)` as defaults.
- **Gutters:** 16px at 375, 24 at 640, 32 at 1024, up to 72 at 1536. Content max-width 1200–1440; reading column 60–68ch.
- **Spacing:** one 4-pt scale (2, 4, 8, 12, 16, 24, 40, 64, 96, 144) or fluid pairs; no arbitrary values. Space above a heading ≥ 1.5× the space below.
- **Density:** choose per surface — a dense index (12–16 aligned rows visible, hairlines, 14–17px) or an airy exhibit (one project per viewport, image ≥ 60% of the area). Do not mix within one surface.
- **Rhythm:** consecutive sections differ in ground, width, rule or padding. Four sections with the same padding, the same container and centred headings is the generated skeleton. Use one full-bleed section and one narrow reading section per page.
- **Containers:** no cards as page structure, no card inside a card, border or shadow but never both, a radius hierarchy (0–4px editorial, 6–10px controls, 12–16px real objects) rather than one big radius on everything.
- **Heroes:** `min-height: 100svh` only if the content needs it; never a full screen of emptiness around one centred sentence.
- **Phone:** design each section's collapse below 768px; no sideways scroll at 320px; sticky elements never cover content; side gutters ≥ 16px.

## Human-made signals (aim for most)

The checker reports these: a deliberate display face at ≥ 48px; a visible type decision (axis, tabular numerals, balance); asymmetry (the largest block ≥ 10% off centre); work ≥ 25% of the first screen; themed browser surfaces (`::selection`, focus, accent/caret/scrollbar colour); the name small (≤ 10% of the viewport height); a tinted ground; self-hosted fonts. A reviewer adds: one rule pushed to the end, specific copy (a proper noun, year or number every ~40 words), varied section rhythm.
