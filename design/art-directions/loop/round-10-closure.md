# Round 10 closure review

Date: 2026-10-06 (Kosovo 11:38, day state). Reviewer: fresh closure agent. Scope: kosovo-time, crossword, four-languages, departures, live-objects (all polished in pass 10b) and projector (the live home page, "/", not changed since round 9).

Rubric: DIAGNOSIS.md §4.1. Five scored points (straight to the point, seniority, original, hooks, type and colour), each /10, total /50, plus the craft gate (pass or fail). This is a closure review. It checks the round-10 critic and devil findings. It does not start a new audit.

## Method

- Tool: `seq.mjs` with headless Chrome (SwiftShader, 1× pixel ratio), PORT 9731, dev server 5240. Frames are in `scratchpad/close10/<run>/`. Contact sheets are `*/s.png`, `d.png`, `m.png`, `dsheet.png`, `msheet.png`.
- For each draft, I drove the signature moment, took frame sequences, and ran a probe at 1440 and 375: page height, horizontal overflow, and every control under 44 px that is visible, takes pointer events and is not aria-hidden.
- Limits:
  - I could not hear sound.
  - CDP key events do not scroll a page. My negative control: Space on projector also left `scrollY` at 0. So I proved the departures Space fix from the code, not from a frame.
  - I proved the visitor-time line in kosovo-time from the code (`Draft.tsx:72`) and from the builder frame. The headless clock is in the Kosovo zone.
  - I did not use the in-app browser pane.

## Calibration (before scoring)

| Anchor | Straight | Seniority | Original | Hooks | Type + colour | Total | Frame |
| --- | --- | --- | --- | --- | --- | --- | --- |
| linja | 6 | 6 | 9 | 8 | 8 | 37 | `cal/linja-d.png`: board with name and four controls, then "Chatbot runtime library" rows |
| projector | 9 | 8 | 6 | 7 | 7 | 37 | `cal/proj-d.png`: clear first read, log beside a frame on chartreuse, tilted store phone |

My scale is the same as the round-10 critic's scale. I take both anchors at 37.

---

## 1. kosovo-time

### Findings

| # | Round-10 finding | Status | Evidence |
| --- | --- | --- | --- |
| C1 | No hook in the day state. Paper and one accent at noon | CLOSED | `kt/now.png`, `kt/d.png`: a computed sky over a horizon. The sun path runs across the full width with a "Drag the sun" pill. The sun sentence is display type beside the name |
| C2 | Row plates about 92 px wide | CLOSED | `kt/noon-rows2.png`: the three store frames are 320 px wide. Wide plates are about 680 px |
| C3 | No client screen on the first screen | CLOSED | `kt/now.png`: Bayyinah TV library, 670 px, labelled "Client work, 2023–26". Phone: y ≈ 525 (`kt/m.png`) |
| C4 | Phone page 9,336 px | CLOSED | 7,848 px at 375. 7,743 px at 1440 |
| C5 | Shader on a mid-range phone GPU | PARTLY | The code falls back to the flat shadow after 18 slow frames (`Draft.tsx:103–116`). Nobody has measured it on a real phone |
| D1 | Recruiters in the US see night only | CLOSED | Night is now an indigo sky lit by the screens (`kt/d.png` 23:00). The visitor's own time shows when the zone differs (code line 72, builder `after-390-noon.png` "03:30 where you are") |
| D2 | Shadow wedge runs under the result lines | CLOSED | The results are in the sky. The floors span only the plate column (`kt/d.png` noon, dusk) |
| D3 | Phone care plate cut in the middle of a word | CLOSED | `kt/m.png` 1624: the care plate fits the column |
| D4 | "Three apps shipped" can be disputed | CLOSED | Now "Mobile apps shipped to both app stores." |
| D5 | Hero is an own project | CLOSED | Bayyinah TV leads. Offday is second |

### Live session

- I dragged the sun from midday to 22:20.
- The disc follows the pointer with a short spring. The clock reads 22:04 while I hold, and the sun settles at 22:20 (`kt4/s.png`).
- The ground goes dark and only the screens light it.
- A focus ring shows on the slider.
- With reduced motion, frames 2.5 s apart are the same.
- On load, the sun runs from 90 minutes ago to now in 1.1 s (`clock.ts` `start()`). This motion explains something.

### Regression (from the 10b polish)

At 375 and 390 the new "Drag the sun" pill is off-screen. At 11:38 it starts at x = 351 (375 viewport) and at x = 374 (390 viewport). It is 144 px wide, so only "←" shows at the edge (`kt3/s.png`). The builder's own frame `after-390-noon.png` shows the same cut. The hero control loses its instruction on a phone. It is correct at 540, 1024, 1280 and 1440. At 540 the sun disc touches the bottom edge of the Noon pill. It does not overlap the text.

### Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 9 | 8 | 9 | 9 | 8 | **43** | PASS at 540–1440. **FAIL at 375/390** on one item (the cut pill). It is a small CSS fix |

- **Straight 9.** The name, the place, the level and two results are on the first screen with a public client screen.
- **Seniority 8.** "16 times. Now it asks 2" and "both app stores" are above the fold.
- **Original 9.** No change from round 10.
- **Hooks 9.** The idea now shows at every hour, not only at dusk.
- **Type and colour 8.** The dusk palette is a 9. The noon sky is good but not a mood-board image.

Hook sentence: "The site is lit by the real sun over Kosovo. Drag the sun to dusk and the whole page goes orange and violet, and the screens cast long shadows."

---

## 2. crossword

### Findings

| # | Round-10 finding | Status | Evidence |
| --- | --- | --- | --- |
| C1 | No real work without typing | CLOSED | `cw/try-2260.png`: the right column opens on Bayyinah TV with its result, scope, a 466 px screen and store links. All seven client results are on the first screen at 1440 |
| C2 | Phone board cut at both edges | CLOSED | `cw/msheet.png`: the work comes first and the board second. The board is 351 px in a 375 px viewport and fully visible. Its cells are small (about 11 px) |
| C3 | Moment hard to find | CLOSED | "Try VIVAFRESH" chip. `cw2/s.png`: the letters fall (400–800 ms), the word floods blue, and the Viva Fresh case opens with three store screens at about 2.4 s ("Viva Fresh is open." in the live region) |
| C4 | Stack words after "Solve it" | PARTLY | CAREAPI → SERVERSIDE and VUESYSTEM → DESIGNKIT. The `chatbot-runtime` answer is still CHATBOT (`crossword.ts:176`), but its label is "Scripted chat engine". EPUBREADER stays (holdback) |
| C5 | The single Ë and the black cell | CLOSED | The black cell is gone. The Ë is a paper tile, and its clue says it is given |
| D1 | `touch-action: none` scroll trap | CLOSED | `.fk-board-viewport` touch-action is `auto` |
| D2 | Two counts ("10 of 30" and "seven") | CLOSED | "10 of 30 filled" and "20 answers hidden" |
| D3 | Answers printed, so it is not a puzzle | CLOSED | The 20 other answers hide their names. "Play the site" focuses the input with "8 letters" and a "Show the answer" control (`cw/play.png`) |
| D4 | 1 px rules | CLOSED | Space and 2 px boxes only |
| D5 | Seniority one grey line | OPEN | The level line is still one line. No case narrative on the first screen (holdback) |

### Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 8 | 7 | 9 | 9 | 8 | **41** | PASS (0 controls under 44 px, 0 overflow. The only small item is an `h2 tabindex=-1` focus target, not a control) |

Hook sentence: "His portfolio is an Albanian crossword. Press 'Try VIVAFRESH' and the letters fall into the grid and open the app."

Regression: none.

---

## 3. four-languages

### Findings

| # | Round-10 finding | Status | Evidence |
| --- | --- | --- | --- |
| C1/D3 | Native-speaker check of the Arabic | OPEN (owner) | 115 strings are listed in `meta.translationsToCheck`. Nobody has checked them yet |
| C2 | Mirror not staged. Headline crosses the capture | CLOSED | `fl/mir.png` at 0.05 playback: header first, then headline, then columns and rows. The headline does not cross a capture. One mid-frame shows the old Albanian sub-line beside the phone capture for about 30 ms of real time. This is not a defect at real speed |
| C3/D1 | No Arabic product screen | PARTLY | No public Arabic Bayyinah page exists (builder search). The hero now shows the Arabic courses tab, and the caption claims nothing more. A right-to-left product screen is still missing |
| C4 | Level line too small | CLOSED | 24 px under the name (`fl/rest.png`) |
| C5 | Empty page while fonts load | CLOSED | Builder measured 4–10 ms in a production build, with a 300 ms cap and a fallback face. I did not measure it again |
| D2 | Identity overclaims "in the user's own language" | CLOSED | `h1`: "Gentrit Rashiti builds web and mobile apps." |
| D4 | Tilted phone mockup and iPhone frame | CLOSED | Flat phone capture and flat Viva Fresh crop |
| D5 | Latin name missing on `?lang=ar` | CLOSED | "Gentrit Rashiti" is in the header in Arabic at 1440 and at 375 (`fl/m.png`) |
| D6 | Hero reads as a religious-education studio | OPEN | The hero still reads "New to Arabic?", "Learn to Read Quran" |

### Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 9 | 7 | 8 | 8 | 9 | **41** | PASS (0 small controls, 0 overflow at 1440 and 375) |

Seniority stays at 7. The first screen proves one skill, but it has no solved problem and no "16 → 2"-style result.

Hook sentence: "Press العربية and the whole site mirrors right to left, piece by piece, not only the words."

Regression: none.

---

## 4. departures

### Findings

| # | Round-10 finding | Status | Evidence |
| --- | --- | --- | --- |
| C1 | No identity on the board. 15 px grey HTML line | CLOSED | `dep/dsheet.png` 3 s: "GENTRIT RASHITI", then "5+ YEARS / APPS IN BOTH APP STORES". The HTML line is about 24 px paper with a persistent level sub-line |
| C2 | Bayer pictures unreadable | CLOSED | The second page of each line is a result: "34 PAGES REBUILT FROM AN EMPTY PAGE.", "16→2 DATABASE ASKS" (`depm/s1.png`). The dither code is removed |
| C3 | Blocked words and exact labels | CLOSED | Timetable: "Care platform, server side" and "Scripted chat engine". `lines.ts:65` "Recreation · invented data". OFFBEAT and FORM carry a CONCEPT tag (`dep/tsheet.png`) |
| C4 | Lamp test from the first frame. Font and first-frame time on a phone | PARTLY | Lit at 300 ms (`dep/d-0300.png`). Nobody has measured it on a real phone |
| C5 | Teach the Morse key | CLOSED | A dot–dash meter shows while you hold (`depk/s.png`). A clean W (·−−) on the second try opened the work (`scrollY` 0 → 650). One first try gave "M", because the first press of a session was lost or read as a dash. This is minor |
| D1 | Space taken | CLOSED (by code) | `Draft.tsx:379–383`: Space is used only when the board has focus. The builder proved it in the pane. I could not prove it headless (negative control, see Method) |
| D2 | Concepts before shipped apps | CLOSED | Board and timetable order: care, Bayyinah, Viva Fresh, Dukagjini, Read to Feed, Incentiv, DS v2, then Offday, OFFBEAT, FORM |
| D3 | iOS silent switch | CLOSED (by code) | `audio.ts:35` sets `audioSession` |
| D4 | Board loops forever | CLOSED (by code) | Rests on the name after one round (`Draft.tsx:181, 477`) |
| D5 | No client screen in the first screen | OPEN | The screens open from the timetable (holdback) |

Phone: the board is readable at rest. Mid-flip frames show partial words for under 1 s. This is the flip, not a cut (`depm/s1.png`, `s2.png`).

### Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 8 | 7 | 9 | 9 | 8 | **41** | PASS (0 small controls, 0 overflow) |

Hook sentence: "It's a bus-stop flip-disc board with his name on it. It clicks, and you can key Morse into it."

Regression: none. The board "G" draws correctly. In the 1× thumbnail it looks like a "C".

---

## 5. live-objects

### Findings

| # | Round-10 finding | Status | Evidence |
| --- | --- | --- | --- |
| C1/D1 | No client proof on the first screen. 0 images | CLOSED | `lo/d.png`: the care recreation (labelled "Recreation · invented data") is beside the knot at 1440. Client rows show real screens (`lo/r.png`) |
| C2 | Two hooks on one screen | CLOSED | The drum grid is now in the own-work band |
| C3 | Offday only as text | CLOSED | Large light Offday capture (`lo/r.png`) |
| C4 | Porcelain flattens the headline | CLOSED | The accent is mint #A3C9B4. The second line separates from bone (`lo/d.png` last frame) |
| C5 | False gap in the no-WebGL knot | CLOSED | `lo/nogl.png`: the crossings are drawn over and under. One tuck is tight (holdback) |
| D2 | "Everything on this page runs" is false | CLOSED | "Some of them run on this page." |
| D3 | Swatches 42 px | CLOSED | Probe: 0 controls under 44 px |
| D4 | Semicolon, mono lines | CLOSED | Removed |
| D5 | Trefoil is stock demo geometry | OPEN | This is the concept itself. Polish cannot change it |

### Live session

- My 400 px drag turned the knot. It coasted and stopped (`lo/d.png` frames 1–3).
- Chrome re-tints the knot, the headline second line and the swatch ring in under 1 s.

### Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 8 | 7 | 8 | 8 | 8 | **39** | PASS |

Hook sentence: "You spin a copper knot he coded himself, pick chrome, and the site changes colour with the metal."

Regression: none. The phone first screen is the knot. The care card is one scroll down, as the builder states.

---

## 6. projector (home, not changed in round 10)

| # | Finding | Status | Evidence |
| --- | --- | --- | --- |
| Anchor | No hook sentence (hooks 7) | OPEN | No change since round 9 |
| Anchor | A log beside a frame on chartreuse (original 6) | OPEN | `cal/proj-d.png` |
| New, measured | Three links under 44 px at 375 | OPEN | The probe shows "bayyinahtv.com", "App Store" and "Google Play" at 36 px high with no larger hit area (`pj2`). This is a pre-existing gate defect, not a regression |
| New, seen | Tilted store phone in the hero frame | OPEN | `cal/proj-d.png`, right panel. Same class as four-languages D4 |

### Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 9 | 8 | 6 | 7 | 7 | **37** | FAIL on the 44 px rule (three links at 375). It is a small fix |

Hook sentence: I cannot write one. So hooks is 7 by the rule.

---

## Rank

| Rank | Draft | Total | Straight / Seniority | Original / Hooks | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | kosovo-time | 43 | 9 / 8 | 9 / 9 | Fail at 375/390 on one label (small fix) |
| 2 | crossword | 41 | 8 / 7 | 9 / 9 | Pass |
| 3 | departures | 41 | 8 / 7 | 9 / 9 | Pass |
| 4 | four-languages | 41 | 9 / 7 | 8 / 8 | Pass |
| 5 | live-objects | 39 | 8 / 7 | 8 / 8 | Pass |
| 6 | projector (home) | 37 | 9 / 8 | 6 / 7 | Fail on 44 px (three links at 375) |

What separates the three at 41:

- **crossword** shows seven client results and a client screen on the first screen, and it has the strongest moment.
- **departures** has the same original and hooks, but it shows no client screen above the fold.
- **four-languages** has the best first read and the best type, but its idea fires only on a press, and the press is a known control.

## Home-page recommendation (plain words)

**Replace projector with kosovo-time.**

- It is as clear as projector: the name, the level, two results and a public client screen in the first five seconds.
- It is as senior as projector: 9 and 8, the same two points a recruiter scores.
- It is much more his own. The page is lit by the real sun over Kosovo at the visitor's hour, and you can drag the sun.
- Projector has no moment anyone would retell.

Do these things before the switch. It is a short, finite list:

1. **Fix the phone label.** At 375 and 390, keep the "Drag the sun" pill inside the screen at every hour. Put it on the side away from the near edge. Then capture dawn, noon, dusk and night at 375, 390 and 540.
2. **Check on a real phone and in Safari.** Use one mid-range Android phone and one iPhone. Confirm the sun intro, the drag and the fallback to the flat shadow when frames are slow. The code exists, but nobody has measured it on a device.
3. **Make the case pages and the 404 follow the new home.** They follow projector's style now (LOOP-BRIEF: "must follow the home page"). Give them kosovo-time's type and palette, or at least its header and colours, so a click from the home page does not land in another site.

Optional, not blocking: replace the tilted App Store frames in the kosovo-time rows (Viva Fresh, Dukagjini) with flat screens, as four-languages did.

## Keep, alternative or park

- **Keep as alternatives, live at /drafts:**
  - crossword: the best "second door". Link it from the home page as "Play the site".
  - departures: the best lab page, or a strong 404.
  - four-languages: do not publish its Arabic and Albanian until a native reader checks the 115 strings.
- **Park:**
  - live-objects (39). Its best part, the FORM knot, already lives in projector's and kosovo-time's own-work bands.
  - the-seam (round 10, failed the gate, original 7).
  - projector, once kosovo-time ships. Keep projector live until steps 1–3 are done. If the owner keeps it longer, fix its three 36 px links first.
