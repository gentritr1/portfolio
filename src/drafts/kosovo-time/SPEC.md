# KOSOVO TIME: type and colour spec

Rule: the sun over Kosovo (42.6° N, 20.9° E) lights the page at the visitor's time. Every screen stands upright on the page and casts the shadow that the real sun gives it. The shadow is computed, never drawn.

Layout rule (pass 10b): text lives in the sky or beside the ground, never on it. The first screen is a landscape: the sky (identity, results, the time, and the sun path as the hero control) above a real horizon, and the ground below it, where two public client screens stand and cast their shadows: the Bayyinah TV web library and the Viva Fresh phone app (flat crops of the screen, no device frame). Each screen carries its own title bar, so its label is part of the screen. Rows confine the floor to the plate column with a soft side fade; phone apps and the two concepts share one ground with their text above it.

## Type

Two faces. No mono.

| Face | File | Axes used | Role |
| --- | --- | --- | --- |
| Fraunces (`KT Fraunces`) | `public/fonts/creative/Fraunces-Latin.woff2` | `opsz` 9–144, `wght` 100–900; `SOFT` 100 and `WONK` 1 are fixed in the file | identity line, time, section and row names |
| Public Sans (`KT Public Sans`) | `public/fonts/creative/PublicSans-Latin.woff2` | `wght` 100–900 | everything else |

| Use | Face | Size / line height | Optical size | Weight | Tracking | Measure |
| --- | --- | --- | --- | --- | --- | --- |
| Identity line | Fraunces | clamp(40px, 5vw, 72px) / 1.02; 36–48px on a phone | 144 (fixed) | 500 | -0.022em | 11.5em, 2 lines at 1024–1440 |
| Time ("17:45") | Fraunces | 40px / 1 (32px phone) | 72 | 500, tabular lining figures | -0.01em | fixed box 2.55em |
| Sun sentence (display) | Fraunces | 24px / 1.22 (19px phone) | 36 | 400 | -0.005em | 440px column, 3 lines reserved |
| Section name | Fraunces | 44px / 1.05 (34px phone) | 96 | 500 | -0.016em | — |
| Row name | Fraunces | 32px / 1.1 (25px phone) | 36 | 500 | -0.01em | — |
| Result lines (first screen, in the sky) | Public Sans | 19px / 1.35 | — | 600 | -0.005em | left column |
| Drag hint, plate title bar | Public Sans | 14px, 13px | — | 600 / 700 | 0 | one line |
| Row line and row result | Public Sans | 18px / 1.45 | — | 400 and 600 | 0 | 36em |
| Body | Public Sans | 17px / 1.5; 15px / 1.45 | — | 400 | 0 | 32em |
| Role, notes, caption | Public Sans | 14–15px | — | 400 | 0 | — |
| Sun path marks | Public Sans | 13px (12px phone), tabular | — | 400 | 0 | — |

Why 72px and not the brief's 64px: the identity line is the only picture made of type, and it sits in a 780px column; at 72px it still breaks in two lines and the wonky Fraunces `n`, `h` and `m` read at a glance. Optical size 144 stays fixed, as the brief asks.

Font wait: `index.html` preloads both faces, so they load beside the first script. The page waits at most 220 ms for them. If they are late, metric-close local fallbacks (Georgia, Arial) stay for the visit, so a late face never moves a line (CLS 0).

## Colour

The page has no fixed colour. The ground is the colour of the page in sunlight, and the shade is the colour of the page in shadow (sky light only). Both come from the sun's altitude, morning or evening, with OKLab steps between keys (`light.ts`). The ground flips from sky light to sunlight when the sun's edge crosses the horizon (altitude -0.833°).

| Light | Sky (top → horizon) | Ground (sun) | Shade | Text | Small text | Result lines |
| --- | --- | --- | --- | --- | --- | --- |
| Dawn (4°, morning) | #B5B7DE → #F8CBAC | #F5C59E | #B8A4C2 | #2A1A12 | #4A3226 | #003B73 |
| Day (40°) | #68A6DC → #F3E6D2 | #F7F3EA | #A8A0CC | #141414 | #2A2A31 | #17236C |
| Dusk (2°, evening) | #B2A3D8 → #FFB581 | #FFA667 | #A58CC5 | #1E1233 | #2E1E46 | #002A58 |
| Night (-30°) | #07060F → #1A1636 | #0F0D14 | #0B0A10 | #E8E2D6 | #B9B1C4 | #F2C27E |

Jobs: sky = the band behind the identity, the time and the sun path, and a soft strip at the top of each section; ground = the page in sun; shade = every shadow and the contact shade at a screen's base; text = all reading text and the plate title bars (inverted); small text = roles, marks, the visitor's time; result lines = the complementary hue of the ground at a fixed lightness (OKLCH L 0.34 on light grounds). The sun disc is its own colour: #FF7A2E low, #FFF2C2 high.

Measured contrast (WCAG), worst case over every quarter degree from -30° to 45°, morning and evening (`light.ts`, measured with a script):

| Pair | Worst | Where |
| --- | --- | --- |
| Text on sky | 7.1:1 | day, 32° and higher |
| Small text on sky | 4.9:1 | morning, -1° |
| Result line on sky | 5.1:1 | evening, -1° |
| Text on ground | 8.4:1 | evening, just above sunset |
| Small text on ground | 7.2:1 | morning, sunrise |
| Result line on ground | 6.8:1 | morning, sunrise |
| Plate title bar (ground on text colour) | 8.4:1 | evening, sunset |

No text stands on the floor, so shadows and screen light never lower a text pair. The screens' light on the floor at night is capped at 0.14 luminance (glare only).

Departures from the brief, with the evidence:

- Dusk ground #FFA667 (#FF9A55 at sunset), not #FF7A1A: on #FF7A1A the text in shadow measured 2.8:1. A lighter orange keeps the violet shadow visible (1.5:1 between ground and shade) and every text pair above 4.5:1.
- Night result lines amber #F2C27E, not the complementary of the violet-black ground: that complementary is an acid lime (#CADD76), the dated brat green. Amber is the colour of the light the screens give.
- The viewer faces south-west, not south: a screen that faces the viewer is edge-on to the sun when the sun is in that screen's plane. Facing south-west puts that moment at mid-morning and gives the long, wide shadow at dusk, which is the moment the brief names.

## Motion

- Load: the first visit in a tab runs today's sun from 90 minutes ago to now in 1.1 s (`cubic-bezier(0.65, 0, 0.35, 1)`); the first frame already shows the earlier hour. A return to the page, a link with a hash, or an hour chosen earlier (sessionStorage `kt-at`, "HH:MM" Kosovo time) opens at once. Under reduced motion it starts at the hour of page load and stays there.
- Scrub: the sun path spans the page width under the identity. The sun disc (38 px) carries "Drag the sun" (at night "Drag the sun up") until the first drag or key press. It moves by transform only (CLS 0).
- Scrub mechanics: the sun path is a slider. A mouse press moves the sun at once. A touch moves it only after 8 px of mostly sideways travel, or on a tap on the path or the disc; a vertical swipe scrolls the page. The focus ring shows only for keyboard focus. The marks move aside or fade while the disc or the hint stands on them. The hour follows the pointer through a spring (stiffness 350, damping 35). A flick coasts at most one hour past the release point. Arrow keys move 10 minutes, Shift or Page keys one hour, at once.
- The visitor's clock moves the page every 30 seconds. Nothing else moves.
- The per-pixel floor gives way to the flat SVG shadow after 18 frames in a row slower than 50 ms (software GL, a weak phone GPU).
- Under the time, the same instant on the visitor's clock ("08:52 where you are"), shown only when the zones differ.
