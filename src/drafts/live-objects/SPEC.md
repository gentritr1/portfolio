# LIVE OBJECTS: type and colour spec

Written before the build. Values were measured in the built page (Chrome, 1440 x 900 and 375 x 812).

## Faces and files

| Role | Face (local family) | File | Axes used |
| --- | --- | --- | --- |
| Display | Gentrit Display (Hubot Sans subset) | `public/fonts/creative/GentritDisplay-Latin.woff2` (84 kB) | `wdth` 120, `wght` 300 / 400 / 520 / 560 |
| Text | Gentrit Text (Mona Sans subset, `opsz` 14 frozen) | `public/fonts/creative/GentritText-Latin.woff2` (41 kB) | `wght` 400 |

No mono anywhere in the page's own copy. Both files are preloaded, `font-display: optional`. Text waits at most 300 ms (measured: 4-27 ms after mount on a cold load). Sized Arial fallbacks keep the line breaks: Display 300 at 120 % is 10.7 % wider than Arial (size-adjust 110.5 %), Display 520 is 3 % wider than Arial Bold (103 %), Text 400 is 2 % wider (102 %).

## Sizes, optical size, tracking, measure

Hubot Sans has no optical-size axis, so the width axis does the optical job: extended (`wdth` 120) and light at display size, where wide light letters read as one calm line; extended and semibold at 13 px caps, where width keeps small letters open.

| Element | Face | Size / line height | Weight, width | Tracking | Measure |
| --- | --- | --- | --- | --- | --- |
| Identity line (h1) | Display | 51 px at 1440 (`clamp(30px, 3.55vw, 56px)`) / 1.06; 30 px / 1.1 on phone | 300, 120 % | -0.012 em (phone -0.004 em) | one sentence per line from 1024 px |
| Object names (FORM, OFFBEAT) | Display | 13 / 20 px, caps | 560, 120 % | +0.08 em | one line |
| "Concept" tag | Display | 13 / 20 px, caps | 400, 120 % | +0.06 em | one line |
| Results (care, OFFBEAT lede, row names) | Display | 22 px / 1.25 (20 px phone) | 400 (names 520), 110 % | -0.005 em | 30-34 ch |
| Band headings | Display | 32 px / 1.1 (26 px phone) | 300, 120 % | -0.008 em | one line |
| Body, results | Text | 17 / 25.5 px | 400 | 0 | 40 ch |
| Captions, roles, years | Text | 15 / 21-22 px | 400 | 0 | 30-60 ch; years use tabular figures |

## Colour

Three colours and one variable accent; no fourth hue. The accent is the hero material, as in FORM.

| Token | Value | Job |
| --- | --- | --- |
| ground | `#0E0E0E` | page and canvas ground (OFFBEAT's black) |
| bone | `#F2EDE4` | text, the drum hit flash |
| muted | `#A7A29A` (bone toward ground) | captions, years, roles |
| accent, copper | `#C8773A` | default; second identity sentence, object names, links, drum cells, Play, focus ring |
| accent, chrome | `#9EB3C7` | when chrome is picked |
| accent, porcelain | `#A3C9B4` | when porcelain is picked; FORM's own dark-theme porcelain accent (FORM `DESIGN.md`) |

The accent is a registered custom property (`@property --lo-accent`), so the whole page cross-fades in 280 ms on `cubic-bezier(.215,.61,.355,1)`, in step with the 280 ms material blend inside the WebGL shader.

Measured contrast (WCAG):

| Pair | Ratio |
| --- | --- |
| bone on ground | 16.56 |
| muted on ground | 7.61 |
| copper on ground | 5.66 |
| chrome on ground | 8.94 |
| porcelain on ground | 10.64 |
| ground on copper (Play label) | 5.66 |
| ground on chrome | 8.94 |
| ground on porcelain | 10.64 |
| porcelain accent against bone (second headline line) | 1.56, and a green hue (was 1.09 with `#E9E4DC`) |
| drum cell border (bone 36 %) on ground | 3.0 |
| copper cell on empty cell | 4.89 |

The care recreation keeps its own healthcare palette (teal), in its dark state, inside its frame. Its mono labels are set in Gentrit Text with tabular figures (scoped override on `.lo-world .font-mono`), so the page has no mono.

## Departures from the C1 brief, with reasons

- Identity line 51 px, not 56 px: at 56 px the first sentence does not fit one line in 1344 px; one sentence per line is the composition.
- Weights 400-560 appear for names and the care result: a 300 weight at 13 px caps is too thin to read at 4.5:1 on black.

## Polish 10b changes to this spec

- Porcelain accent `#E9E4DC` became `#A3C9B4`, the value FORM itself uses for dark porcelain. The second headline line stays separate from bone in all three metals.
- The identity sub-line is two tones: the level facts in bone, the place in muted.
- No row rules and no foot rule. Rows separate by space only (80 px between client rows at 1440, 56 px on a phone).
- Client screens are real captures shown at or below native size: web 1440 x 900 at 576 x 360, phones 780 x 1689 at 166 x 360 (half width on a phone), Offday 2880 x 1800 at up to 920 px wide.
