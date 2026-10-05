# THE SEAM: type and colour spec

Concept C4 (design/art-directions/loop/DIAGNOSIS.md §4.4). One page, two skins, one line with mass between them. The 2021 skin is made up for this page. It is not a client app.

## Faces and files

| Role | Face | File | Axes used |
| --- | --- | --- | --- |
| Today: display (H1, results, numerals, tally) | Gentrit Display (Hubot Sans subset) | `public/fonts/creative/GentritDisplay-Latin.woff2` | `wdth` 80 / 86 / 90 / 100, `wght` 650–900 |
| Today: text (body, labels, links) | Gentrit Text (Mona Sans subset) | `public/fonts/creative/GentritText-Latin.woff2` | `wght` 400 / 500 / 600 / 650; `opsz` frozen at 14, `wdth` frozen at 100 |
| 2021: everything | the system UI stack (`system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`) | none (no download) | weight 300 / 400 / 500 / 600 |

No mono. The only key cap (`P`) is set in Gentrit Display.

Both files are preloaded by the page (`react-dom` `preload`). The page waits for them for 300 ms at most, then shows.

## Sizes, optical size and tracking (1440 px)

| Use | Face | Size / line height | Axis | Tracking |
| --- | --- | --- | --- | --- |
| H1 "Change the code. Keep the behaviour." | Display | `clamp(48px, 7.3vw, 112px)` = 105 px / 0.88 | `wdth` 80, `wght` 900 | −0.008 em |
| Lede (the result line) | Display | 26 px / 1.18 | `wdth` 100, `wght` 650 | −0.012 em |
| Row result (largest text in a row) | Display | `clamp(28px, 2.7vw, 40px)` = 39 px / 1.04 | `wdth` 86, `wght` 780 | −0.012 em |
| Section heading | Display | 34 px / 1.0 | `wdth` 90, `wght` 850 | −0.012 em |
| About name | Display | `clamp(48px, 6vw, 88px)` / 0.9 | `wdth` 80, `wght` 900 | −0.008 em |
| Row number, tally | Display | 56 px, 32 px | `wdth` 80, `wght` 900 | 0 |
| Row title (project name) | Text | 15 px, caps | `wght` 650 | +0.06 em |
| Body, problem line | Text | 17 px / 1.5 | `wght` 400 | 0 |
| Role, state, caption | Text | 14–15 px / 1.45 | `wght` 400–600 | 0 |
| 2021 H1 (Bootstrap display style) | system UI | 40 px / 1.2 | `wght` 300 | 0 |
| 2021 body and table | system UI | 15 px and 14 px / 1.5 | 400, 600 for links | 0 |

Optical size: Hubot has no `opsz` axis, so the width axis does the optical work. The face gets narrower as it gets larger (100 at 26 px, 86–90 at 34–40 px, 80 at 105 px), so the large sizes keep a tight colour and the small display sizes stay open. Mona is frozen at `opsz` 14 in this subset, which is right for 14–17 px text; it is never used above 17 px.

Measure: problem lines 52 ch, the facts line 44 ch, results 24 ch (balanced), footer 62 ch.

Note: the Hubot subset draws a dotted zero and has no plain alternative. It shows in "2026", "20 times" and the tally. It is the face's own design, kept on purpose.

## Colour

Today's skin is painted in the colours of a passing check: the ground is the pass colour made dark, and its bright form marks what is equal. Three colours, one job each, and one red used only when a row breaks.

| Token | Hex | Job |
| --- | --- | --- |
| forest | `#10392A` | ground of today's skin |
| deep | `#0A271C` | the runner, the About band, the cord, the knob |
| bone | `#F1ECE1` | all type on today's skin |
| muted | `#B7CBBE` | second-level type |
| mint | `#5BE3A5` | "the same": ticks, the bar, the word "behaviour.", the cord edge, focus ring |
| red | `#FF6B5E` | only after "Break one row" |

The 2021 skin uses Bootstrap 4 values: white, `#212529` text, `#5A6268` muted, `#0062CC` links and button, `#E9ECEF` jumbotron, `#343A40` navbar, `#F2F2F2` stripes, `#DEE2E6` rules. Bootstrap's own `#007BFF` and `#6C757D` fail 4.5:1, so the darker Bootstrap hover values replace them.

### Measured contrast

| Pair | Ratio |
| --- | --- |
| bone on forest | 10.86 |
| muted on forest | 7.50 |
| mint on forest | 7.91 |
| red on forest | 4.58 |
| bone on deep | 13.51 |
| muted on deep | 9.32 |
| deep on mint (button) | 9.83 |
| red on deep | 5.69 |
| `#212529` on white | 15.43 |
| `#212529` on `#E9ECEF` | 13.01 |
| `#5A6268` on white / on stripe | 6.21 / 5.55 |
| `#0062CC` on white / on stripe | 5.80 / 5.18 |
| white on `#0062CC` | 5.80 |
| white on `#343A40` | 11.51 |
| `#FFFFFFCC` on `#343A40` | 7.99 |
| white on `#1E7E34` (OK badge) | 5.14 |
| white on `#C82333` (FAIL badge) | 5.61 |
| `#721C24` on `#F8D7DA` (failed row) | 8.25 |

Departures from the brief, with the reason:

- 2021 skin: Bootstrap 4 grey, blue and white, not grey-green `#DADBD3`. A system font on grey-green reads as a style choice. Bootstrap's jumbotron, striped table and blue button read as "2021" on sight.
- 2021 H1 at weight 300, not 400: that is Bootstrap's display style.
- Today's ground is forest, not bone. Bone with one green accent is "cream paper plus one accent", which this round bans.
- No blur on the 2021 skin: blurred text fails the contrast gate.

## Motion (the seam)

All motion is one spring integrator (`seam.ts`), 240 sub-steps per second, on real elapsed time.

| Move | Stiffness / damping ratio |
| --- | --- |
| knob follows the pointer (mass) | 1000 / 0.85 |
| release, with the pointer's speed handed over, to the predicted row (x + v × 0.2) | 260 / 0.55 (one overshoot) |
| arrow key, one row | 420 / 0.62 |
| check run, one row each 190 ms | 1600 / 0.72 |
| first load: the line comes in from the right edge | 110 / 0.74 |
| phone switch | 210 / 0.8 |
| cord ends follow the knob (the bow, and the ring when it stops) | 150 / 0.4 |
| each row follows the seam once the seam passes its step | 520 / 1.0 |

Drag past either edge meets 0.22 resistance. The knob tilts with speed (±10°) and lifts while held. Reduced motion: every spring jumps to its end; no bow, no tilt, no intro; all states stay.
