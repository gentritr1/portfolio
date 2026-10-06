# Round 10 critic: the divergence round

Date: 2026-10-06. Critic: fresh agent, no earlier review read. Rubric: DIAGNOSIS.md §4.1 (five scored points, 1–10, plus the craft gate as pass or fail).

Method. I drove every page in headless Chrome (SwiftShader, 1× pixel ratio) with the extended capture tool on dev server 5240. I used drags, held pointers, key presses and frame sequences 60–160 ms apart through each signature moment. I ran a craft probe at 375, 390, 540, 1024, 1280 and 1440 (layout shift on load and after a fast scroll to the bottom, horizontal overflow, controls smaller than 44 px, font arrival time). I compared reduced-motion frames 2.5 s apart. I could not hear sound in headless mode. I only checked that sound needs a press. I did not use the in-app browser pane. The web comparisons come from my own knowledge of those sites. I did not open them again today.

Evidence: `scratchpad/crit10/` (anchors/, lo/, fl/, seam/, cw/, dep/, mo/, kt/, craft/<id>/, misc/, sheets/, texts.txt).

---

## Step 1. Calibration on the anchor set (blind)

| Anchor | Straight | Seniority | Original | Hooks | Type + colour | Total /50 | What sets the score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| linja | 6 | 6 | 9 | 8 | 8 | 37 | A real disc board, his Morse. The board shows "31 ADRs", which is an internal count and old canon. The control bar has 4 controls. |
| aisle | 6 | 6 | 8 | 8 | 8 | 36 | A shelf of boxes and a receipt. "AISLE 7" is above the name. The labels use "PARITY", "routes" and "Laravel 13". |
| issue | 7 | 6 | 7 | 7 | 9 | 36 | "Shipped." in a serif at 300 px on vermilion is a mood-board screenshot. The editorial cover is a known form. It shows the old fact "16 security … tests". |
| fjalekryq | 6 | 6 | 9 | 8 | 8 | 37 | The crossword is the navigation. The clues use stack words and "31 architecture decisions". |
| projector | 9 | 8 | 6 | 7 | 7 | 37 | It is the clearest page. It uses a log beside a frame on brat chartreuse. I cannot write a hook sentence, so hooks is 7 by the rule. |

Web anchors for "original" (3 sites it beats on this point / 1 it loses to):
- linja: beats rauno.me, designeer.xyz, brittanychiang.com / loses to bruno-simon.com.
- aisle: beats brittanychiang.com, paco.me, designeer.xyz / loses to bruno-simon.com.
- issue: beats brittanychiang.com, leerob.com, paco.me / loses to lynnandtonic.com.
- fjalekryq: beats rauno.me, designeer.xyz, offgrid.inc / loses to robbyleonardi.com.
- projector: beats brittanychiang.com, leerob.com, a stock Framer portfolio template / loses to designeer.xyz.

The scale now has anchors at 9 on original (linja, fjalekryq) and at 9 on type and colour (issue). The early set and projector have the same total (36–37) with opposite profiles. The early drafts are strong on original and weak on the first read. Projector is the reverse.

---

## Step 2. The six round-10 drafts

### Craft gate (measured by me)

| Draft | CLS load / fast scroll (6 widths) | Overflow-x | Controls < 44 px | Reduced motion (frames 2.5 s apart) | No-WebGL | Font arrival (cold, dev) | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| live-objects | 0 / 0 | 0 | 0 | identical | `?nogl` flat knot, one false gap at the right crossing | 62–291 ms | PASS |
| kosovo-time | 0 / 0 (1440, 1024, 540, 390, 375) | 0 | 0 | identical | builder frame `1440-dusk-no-webgl` | 181–251 ms | PASS (1280 not re-measured, see the builder) |
| four-languages | 0 / 0 (EN) | 0 | 0 | instant switch | no WebGL | 44–342 ms; the page renders nothing until the fonts arrive | PASS, watch the font wait in a production build |
| the-seam | 0 / 0 | 0 | 16 (2021 skin: "Projects" 56×23, "CV" 20×23, "Contact" 54×23, row links 17 px high) | identical | no WebGL | 62–167 ms | **FAIL**: the 2021-skin links are aria-hidden and tabIndex −1, but a mouse can still click them (no `pointer-events: none`). A knob drag across the 2021 skin selects text (frame `seam/slow-500.png`: "See my work" is highlighted). |
| departures | 0 / 0 | 0 | 0 | identical | builder frames `d1440-nowebgl*` | 56–880 ms (one cold run at 1024 was 880 ms) | PASS. Check the font wait and the time to the first board frame on a real phone (headless was blank for 1.5–3.5 s) |
| crossword | 0 / 0 (≤ 0.0001 at 540 and 1024 for the builder) | 0 | 0 | identical | no WebGL | 58–421 ms with `font-display: swap`, so no text waits | PASS |

Sound: live-objects starts audio only after Play (`aria-pressed` false until the click). Departures loads with "Sound off" (`aria-pressed="false"`). Neither page creates sound on load.

### Scores

| Draft | Straight | Seniority | Original | Hooks | Type + colour | Total /50 | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| crossword | 7 | 7 | 9 | 9 | 8 | 40 | PASS |
| kosovo-time | 8 | 7 | 9 | 8 | 8 | 40 | PASS |
| four-languages | 8 | 7 | 8 | 8 | 9 | 40 | PASS |
| departures | 7 | 6 | 9 | 9 | 8 | 39 | PASS |
| the-seam | 8 | 8 | 7 | 7 | 8 | 38 | FAIL (two small fixes) |
| live-objects | 7 | 6 | 8 | 8 | 8 | 37 | PASS |

The spread rule (three drafts at original 9): crossword > departures > kosovo-time. Crossword's rule is the navigation, and it is Albanian. If you delete the puzzle, the site is gone. Departures is a real renderer with his Morse, but it is drawn from a public object (a bus board), and its picture phase does not read. Kosovo-time has the most personal rule (a place and an hour). But its effect is weakest at the hour when most visitors arrive (the day state, see below).

### crossword (Fjalëkryq)

- Live: I typed V-I-V-A-F-R-E-S-H on the page. The letters fall from the top (`cw/h-160.png`: letters are in the air above the grid). They land in their cells, the word floods blue left to right (`h-660`), and the clue column becomes the Viva Fresh case with three store screens (`h-2260`). "Solve it" rains in the other 20 words. Focus goes to "Solve it" with a visible ring.
- Hook sentence: "His portfolio is an Albanian crossword, and when you type a project name the letters fall into place." **9.**
- Original 9: it beats rauno.me, designeer.xyz and emilkowal.ski. It loses to robbyleonardi.com (a game as the CV, older but deeper).
- Straight 7: the identity line and the seven plain results are in the right column at 1440. The board takes the eye first. You see real work only after a typed word or a click.
- Seniority 7: the results are plain and true. The scope is in one line on the opened case.
- Type and colour 8: mustard, ink, paper and a blue flood. Franklin tiles and Fraunces clues. A designer notices the palette. It is the same palette as the anchor.
- Facts: "client organization" is correct. Concepts say "CONCEPT · A FICTIONAL …". After "Solve it", some answers still read as stack words (CAREAPI, VUESYSTEM, CHATBOTWEB), as the builder says.

### kosovo-time

- Live: Now / Dawn / Noon / Dusk / Night re-light the whole page. The ground, the shade, the text and the result colour change, and the shadow under the Offday screen changes length and direction (`kt/noon.png`, the builder's `1440-dusk.png`, `kt/dusk-400.png` which is night). The slider follows the pointer. The arrow keys step 10 minutes.
- Hook sentence: "The site is lit by the real sun in Kosovo. At dusk it turns orange and the screens cast long violet shadows." **8**, not 9. Most visitors arrive in the day state. Then the page is near-white paper with a grey-blue wedge and navy result lines, which is the look the round banned. The hook there is only the small clock sentence.
- Original 9: I cannot name a site that it copies, and the rule only works for a person who lives there. It beats rauno.me, paco.me and designeer.xyz. It loses to lynnandtonic.com (more surprise for each visit).
- Straight 8: the identity line, one large screen and three result lines on the first screen.
- Seniority 7: the three results are good. The rows below are weak: the phone screens show at about 92 px wide at 1440 (`craft/kosovo-time/tour-2.png`), with a lot of empty dark space.
- Type and colour 8: Fraunces at opsz 144 with SOFT and WONK, at 72 px, is a decision. The dusk palette is a 9. The noon palette is a 7.
- Facts: "About 200 tests" for Offday is correct. "Recreation · invented data" and "Concept" are correct.

### four-languages

- Live: I pressed العربية. `dir` became `rtl` and the URL became `?lang=ar`. The header, the columns, the rows, the external-link arrows (↖) and the digits (Arabic-Indic years) all mirror (`fl/ar-done.png`, `fl/ar-rows.png`). In the builder's paused frames the elements slide to the other side (`mirror-en-ar-120ms.png`). At 120 ms the headline pieces cross over the screenshot. Shqip switches the same way and keeps the scroll anchor.
- Hook sentence: "His site flips into Arabic, and the whole layout mirrors right to left, not only the words." **8.**
- Original 8: it beats brittanychiang.com, paco.me and emilkowal.ski. It loses to joshwcomeau.com (more delight in each interaction). A language switch is a known control. A live mirror of the whole layout is rare, but it is not a new form.
- Straight 8. Seniority 7: it proves one shipped skill very well. The depth of the platform work is in one sub-line.
- Type and colour 9: the Arabic first screen (Amiri Bold at display size, vellum on ultramarine #1A2466, gold language names) is a mood-board screenshot. Literata in Latin and Albanian on the same ground holds up.
- Facts: "client organizations, in four languages" is correct. Concepts are labelled. Risk: no native speaker has checked the Arabic copy yet. The screens show the English interface, and the caption says so.

### departures

- Live: the board cycles through a lamp test, the line text in Morse time (letters write in, `dep/d-1`), then a Bayer picture develops (`d-2`, `d-4`), then the next line. I pressed and held the board (dit and dah). The board switched to "MORSE KEY / SENT …" with a W and C legend (`mo/mo-after.png`). My timing gave "EM" in place of "W", so the key reads real timing and is strict. On the phone the board is readable after the lamp test (`sheets/dep-m.png`).
- Hook sentence: "It's a bus-stop flip-disc board that clicks, and you can tap Morse into it." **9.**
- Original 9: it beats rauno.me, designeer.xyz and offgrid.inc. It loses to bruno-simon.com (a whole world, with sound).
- Straight 7: the board text is large and plain ("CARE PLATFORM / CARE TEAMS / VITALS"). The identity line is 15 px grey in the header.
- Seniority 6: "PART OF 2 PLATFORM REWRITES" appears on the board once in each cycle. The pictures in the discs read as blobs, not as screens.
- Type and colour 8: safety yellow discs on black, then a cream timetable in Archivo Narrow with true columns and dotted leaders. The timetable is now worthy of the board.
- Facts and copy: "Care-management API" is in the timetable ("API" is a blocked home-page word). The label is "In the discs: a recreation with invented data", not the exact "Recreation · invented data". OFFBEAT and FORM say "made-up" but do not say "Concept".

### the-seam (below the line)

- Live: I dragged the knob from 566 to 1150 px. The cord bows and settles with one overshoot in about 0.6 s (`seam/k-rel-140`, `k-rel-2100`). In `?slow=10` the cord is a clear curve (`slow-500`). P runs the check: 10/10 in about 2 s (`p-2100`). "Break one row" stops at row 02 with FAIL in red (`break-5500`).
- Defects (reproduced): (1) The 2021 skin is a 490 px column. When the seam is at the right, 640 px of empty white fills the left (`k-rel-2100`, `break-5500`), and the page looks broken. (2) A knob drag selects text in the 2021 skin (`slow-500`). (3) The 2021-skin links are mouse targets of 20–56 × 17–23 px. (4) Each row shows "Not checked" to a recruiter before P is pressed. (5) The care row says "Frontend, core team · 2023–26". The content says "Frontend and mobile, full stack since 2026"; "core team" is the Bayyinah role.
- Hook sentence: "You drag a green rope across his site and it turns into a 2021 Bootstrap page." It is a real sentence. But the 2021 page is invented (it is not his old site and not the client's legacy app), so the moment is one step removed from the work. **7.**
- Original 7: it beats brittanychiang.com, leerob.com and paco.me. It loses to lynnandtonic.com, which shows a real archive of her own site year by year. Before/after sliders are a common widget. The rope physics is new, but it is a detail.
- Straight 8 and seniority 8: "Change the code. Keep the behaviour." states the senior skill directly, and "Break one row" shows that tests stop a change. Type and colour 8: Hubot at wdth 80 and wght 900, 105 px, bone and mint on forest.

### live-objects

- Live: the knot turns on load. My 400 px drag turned it about 40°, and it coasted and stopped by about 1.0 s after release (`lo/a-rel-000` … `a-rel-1000` differ, and `a-rel-3000` is the same as `a-rel-1000`). Chrome re-tints the knot, the second headline line, the drum cells, Play and the link rules together (`lo/chrome-140`). Play sets `aria-pressed=true`.
- Hook sentence: "You can spin the copper knot, and the whole site changes colour with the metal." **8.** The drum grid on the same screen competes with it.
- Original 8: it beats designeer.xyz, rauno.me and brittanychiang.com. It loses to bruno-simon.com. A 3D metal object on black is a known 2024–26 hero form. The re-tint from the material is his own idea.
- Straight 7 and seniority 6: the first screen shows two concepts. Client work starts below 1,700 px, so a recruiter can read "creative coder". The care recreation (labelled correctly) is the best proof on the page, and it is below the fold.
- Type and colour 8: Hubot at wdth 120 and wght 300, 51 px, extended and light, with the accent driven by the material. Porcelain makes the accent almost bone, so the two-line headline goes flat.
- Facts: correct. Offday is a text row only, so the owner's "show the personal work large" is half met.

---

## Step 3. Rank of all eleven, the line, and the home page

| Rank | Draft | Total | Original / Hooks | Note |
| --- | --- | --- | --- | --- |
| 1 | crossword | 40 | 9 / 9 | best hook driven live |
| 2 | kosovo-time | 40 | 9 / 8 | best balance of first read and identity |
| 3 | four-languages | 40 | 8 / 8 | best type and colour |
| 4 | departures | 39 | 9 / 9 | best renderer. The first read is weak |
| 5 | the-seam | 38 | 7 / 7 | best seniority statement. Fails the gate |
| 6 | linja (anchor) | 37 | 9 / 8 | departures now beats it on every point except seniority (same) |
| 7 | fjalekryq (anchor) | 37 | 9 / 8 | crossword beats it |
| 8 | live-objects | 37 | 8 / 8 | |
| 9 | projector (anchor, home) | 37 | 6 / 7 | |
| 10 | aisle (anchor) | 36 | 8 / 8 | |
| 11 | issue (anchor) | 36 | 7 / 7 | |

**Above the line (original ≥ 8 and hooks ≥ 8):** crossword, kosovo-time, departures, four-languages, live-objects. **Parked:** the-seam (7/7). If the owner wants it, its five defects are each under an hour of work, but polish will not move original.

Polish lists, ordered by gain:

**crossword**
1. Make real work visible without typing. At 1440, open the Bayyinah TV case in the right column on load (no motion needed). At 375, put the first clue and one screen above the fold. Today a recruiter must type or click to see a screen.
2. Phone board: fit the grid, or open the camera on the seven featured words. At 375 the board is cut at both edges ("VIVAF", "READTO").
3. Make the moment easy to find: add one visible chip, "Try VIVAFRESH", that types the word when pressed. The bottom hint is easy to miss.
4. Use plain answer words in place of the stack words after "Solve it" (CAREAPI, VUESYSTEM, CHATBOTWEB).
5. Explain the single Ë tile and the black cell beside BAYYINAH (a caption on focus), or remove them. Now they read as a defect.

**kosovo-time**
1. Carry the hook in the day state. Put the sun sentence ("The sun is 42° above the horizon. It lights this page.") into display type beside the identity line. Make the sun path the hero control, not a corner widget. Keep the shadow honest.
2. Show the row plates at full native size. The phone screens are about 92 px wide at 1440, and the rows look empty.
3. Add one client screen to the first screen beside Offday (Bayyinah TV or Viva Fresh, as the brief says). Seniority is 7 because the hero is an own project.
4. Shorten the phone page (9,336 px at 390). Tighten the row spacing.
5. Measure the shader on a mid-range phone GPU. Fall back to the flat shadow when the frame rate drops.

**departures**
1. Put the identity on the board: the owner's name as the first destination and "Part of two platform rewrites" in the first cycle. Make the HTML identity line larger than 15 px grey.
2. Cut or change the picture phase. The Bayer pictures do not read at 128 × 56. Use only shapes that survive (the trefoil, the drum grid, one large headline), or show text only.
3. Copy: "Care-management API" → "Care platform, server side". Use the exact label "Recreation · invented data" and add "Concept" to OFFBEAT and FORM.
4. Show the lamp test from the first frame. Measure the time to the first board frame and the font wait (880 ms once at 1024) on a real phone.
5. Teach the Morse key once: on the first focus or press, show a dit and dah meter. A first try easily sends "EM" in place of "W".

**four-languages**
1. Get a native-speaker check of every Arabic string before the page is published.
2. Stage the mirror so the eye can follow it: header, then columns, then rows, 320–480 ms in total. Stop the headline from crossing the screenshot at 120 ms.
3. Show the product in Arabic too. If the public Bayyinah TV pages have an Arabic interface, capture them. Now the caption admits the screens are English.
4. Put one level line in the hero at a larger size. The platform depth is one sub-line.
5. Render with the fallback face, not an empty page, if the fonts are late. Confirm ≤ 300 ms in a production build (342 ms on dev once).

**live-objects**
1. Bring client proof onto the first screen. Move the care recreation (already labelled) beside or under the knot at 1440, and put the drum grid in the second band.
2. One hook for each screen: the knot leads, and the grid follows.
3. Show Offday as a large light screenshot in the own-work list.
4. Fix the porcelain state. Pick an accent that still separates the second headline line from bone.
5. Fix the false gap in the no-WebGL knot at the right crossing.

**Is any draft now a better home page than projector?** Not yet. Three drafts beat it on the total (40 against 37). But each draft is lower than projector on straight to the point or on seniority, and those are the two points a recruiter scores in 10 seconds. **kosovo-time** is the nearest replacement. It keeps projector's reading order (identity line, one screen, three results) and adds a rule that belongs only to him. It lacks: (1) a client screen on the first screen, (2) a hook that works at noon, when most visitors arrive, and (3) rows that show the work at a readable size. After polish items 1–3, re-score it against projector on straight and seniority. If it gets 9 and 8, it is the better home page. **crossword** has the strongest moment, but it puts a puzzle in front of the recruiter. Use it as a linked second door ("Play the site"), not as the home page, unless polish item 1 makes real work visible with no typing.
