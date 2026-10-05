# KOSOVO TIME: type and colour spec

Rule: the sun over Kosovo (42.6° N, 20.9° E) lights the page at the visitor's time. Every screen stands upright on the page and casts the shadow that the real sun gives it. The shadow is computed, never drawn.

## Type

Two faces. No mono.

| Face | File | Axes used | Role |
| --- | --- | --- | --- |
| Fraunces (`KT Fraunces`) | `public/fonts/creative/Fraunces-Latin.woff2` | `opsz` 9–144, `wght` 100–900; `SOFT` 100 and `WONK` 1 are fixed in the file | identity line, time, section and row names |
| Public Sans (`KT Public Sans`) | `public/fonts/creative/PublicSans-Latin.woff2` | `wght` 100–900 | everything else |

| Use | Face | Size / line height | Optical size | Weight | Tracking | Measure |
| --- | --- | --- | --- | --- | --- | --- |
| Identity line | Fraunces | clamp(40px, 5vw, 72px) / 1.02; 36–48px on a phone | 144 (fixed) | 500 | -0.022em | 11.5em, 2 lines at 1024–1440 |
| Time ("17:45") | Fraunces | 40px / 1 (32px phone) | 72 | 500, tabular lining figures | -0.01em | fixed box 2.6em |
| Section name | Fraunces | 44px / 1.05 (34px phone) | 96 | 500 | -0.016em | — |
| Row name | Fraunces | 30px / 1.1 (26px phone) | 36 | 500 | -0.01em | — |
| Result lines (first screen) | Public Sans | 20px / 1.3 | — | 600 | -0.005em | one third of 1040px, balanced |
| Row line and row result | Public Sans | 18px / 1.45 | — | 400 and 600 | 0 | 36em |
| Body, sun sentence | Public Sans | 17px / 1.5; 15px / 1.45 | — | 400 | 0 | 32em |
| Role, notes, caption | Public Sans | 14–15px | — | 400 | 0 | — |
| Sun path marks | Public Sans | 12px, tabular | — | 400 | 0 | — |

Why 72px and not the brief's 64px: the identity line is the only picture made of type, and it sits in a 780px column; at 72px it still breaks in two lines and the wonky Fraunces `n`, `h` and `m` read at a glance. Optical size 144 stays fixed, as the brief asks.

Font wait: both faces are preloaded. The page waits at most 220 ms for them. If they are late, metric-close local fallbacks (Georgia, Arial) stay for the visit, so a late face never moves a line (CLS 0).

## Colour

The page has no fixed colour. The ground is the colour of the page in sunlight, and the shade is the colour of the page in shadow (sky light only). Both come from the sun's altitude, morning or evening, with OKLab steps between keys (`light.ts`). The ground flips from sky light to sunlight when the sun's edge crosses the horizon (altitude -0.833°).

| Light | Ground (sun) | Shade | Text | Small text | Result lines |
| --- | --- | --- | --- | --- | --- |
| Dawn (4°, morning) | #F5C59E | #B8A4C2 | #2A1A12 | #4A3226 | #003B73 |
| Day (40°) | #F7F4EC | #AEB3C3 | #141414 | #3A3A40 | #1F2E7A |
| Dusk (2°, evening) | #FFA667 | #A58CC5 | #1E1233 | #2E1E46 | #002A58 |
| Night (-30°) | #0F0D14 | #0B0A10 | #E8E2D6 | #B9B1C4 | #F2C27E |

Jobs: ground = the page in sun; shade = every shadow and the contact shade at a screen's base; text = all reading text; small text = roles, captions, the sun sentence; result lines = the complementary hue of the ground at a fixed lightness (OKLCH L 0.34 on light grounds), so a result reads as the opposite of the light it sits in.

Measured contrast (WCAG), worst case over every quarter degree of the day, morning and evening:

| Pair | Worst | Where |
| --- | --- | --- |
| Text on ground | 8.4:1 | evening, just above sunset |
| Text in shadow | 5.8:1 | same |
| Small text in shadow | 5.0:1 | same |
| Result line in shadow | 4.7:1 | same |
| Small text on the brightest screen light at night | 5.1:1 (light added is capped at 0.045 luminance) | night |

The shadow can never be darker than the shade colour: the renderer only mixes the ground toward the shade. So text keeps 4.5:1 where a shadow crosses it. A rendered pixel inside the noon shadow reads exactly #AEB3C3.

Departures from the brief, with the evidence:

- Dusk ground #FFA667 (#FF9A55 at sunset), not #FF7A1A: on #FF7A1A the text in shadow measured 2.8:1. A lighter orange keeps the violet shadow visible (1.5:1 between ground and shade) and every text pair above 4.5:1.
- Night result lines amber #F2C27E, not the complementary of the violet-black ground: that complementary is an acid lime (#CADD76), the dated brat green. Amber is the colour of the light the screens give.
- The viewer faces south-west, not south: a screen that faces the viewer is edge-on to the sun when the sun is in that screen's plane. Facing south-west puts that moment at mid-morning and gives the long, wide shadow at dusk, which is the moment the brief names.

## Motion

- Load: the page runs today's sun from 90 minutes ago to now in 1.1 s (`cubic-bezier(0.65, 0, 0.35, 1)`). Under reduced motion it starts at the hour of page load and stays there.
- Scrub: the sun path is a slider. The hour follows the pointer through a spring (stiffness 350, damping 35). A flick coasts at most one hour past the release point. Arrow keys move 10 minutes, Shift or Page keys one hour, at once.
- The visitor's clock moves the page every 30 seconds. Nothing else moves.
