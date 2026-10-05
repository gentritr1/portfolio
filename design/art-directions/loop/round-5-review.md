# Loop 5 review: year-stack, statement-of-record, token-source (polish); sampled-ground, redline, projector (new)

Reviewer: independent, built none of these, did not read this round before the review. Judged from the PNG captures in `review/loop5/<id>/final/` (desktop, phone, scroll states, mid-animation frames, reduced motion), the before/after pairs of the three polish entries, the thumbnail sheet `review/thumbs5/sheet.png`, and the draft source in `src/drafts/<id>/`. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Builders' self-scores are in brackets. Review scores are whole numbers.

Measurements made for this review:

- `scratchpad/chroma5r.mjs` (the round-3 decode and threshold, plate rectangles from each meta.json) re-measured every desktop first screen. All six builder numbers match to 0.1%: year-stack 34.2 / 43.4, statement-of-record 24.5 / 37.9, token-source 26.1 / 38.4, sampled-ground 29.6 / 33.4, redline 26.3 / 34.2, projector 59.0 / 94.5 (whole screen / outside the plates).
- WCAG contrast of the new palettes: projector ink on chartreuse 14.2:1, muted 7.7:1; redline red on paper 5.6:1, ink 17.0:1, muted 7.1:1; sampled-ground Viva Fresh ink on ground 12.0:1, panel on ground 7.6:1. All as reported.
- Twenty facts used on the new pages (AWS IVS, Pusher, HLS, "about six weeks", 96.6%, WCAG, MetaMask, French, timers, UBT, "Teammates built the wallet layer", three major React Native upgrades, 0.63 to 0.81, "empty template", parity, 16 isolation tests, 972 to 337 KB, four languages, passkey) were found in CONTENT.md, `src/content/projects.ts` or `src/content/caseNarratives.ts`.

## NDA check

Every Vianova recreation on every page carries a visible "recreation, invented data" label on or directly under its plate. Evidence:

- year-stack: "Recreation with invented data" under the care plate (`d-top.png` y 612; `m-top.png`).
- statement-of-record: "Recreation with invented data" as the care plate's footer row (`d-top.png` y 866; `m-top.png` is cut at the chart, the footer is below the fold on the phone and is the same component).
- token-source: "Recreation · invented data" at the right under the pinned specimen (`d-label-top.png`, source `Draft.tsx` line 600) and as the care card's footer row (`d-label-care.png`). `d-top.png` was captured before the label was added; the label is in the shipped source.
- sampled-ground: "Recreation with invented data" in the column of the live room, Incentiv, specimen and care cards (`d-y620.png`, `d-y1180.png`, `d-y2300.png`, `d-y2860.png`, `m-y1240.png`).
- redline: "recreation, invented data" in the footer line of all three sheets (`d-top.png` y 673, `d-y745.png` y 621, `d-y1460.png` y 724) plus the specimen's own pill.
- projector: "Component specimen. Recreation with invented data." and "Vitals trend card. Recreation with invented data." as the frame captions (`d-top.png`, `d-02.png`, `m-top.png`, `m-02.png`) plus the specimen's pill.

No real Vianova screen is on any page. The only Vianova plates are the shared `care` and `design-system` recreations.

## Scores

| Point | year-stack | statement-of-record | token-source | sampled-ground | redline | projector |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Straight to the point | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] |
| 2 Not overwhelming | 8 [8.5] | 8 [8] | 8 [8] | 8 [8] | 7 [7.5] | 8 [8] |
| 3 UI/UX harmony | 8 [8.5] | 8 [8] | 8 [8.5] | 8 [8] | 8 [8] | 8 [8] |
| 4 Meaningful motion | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 7 [8] | 8 [8] |
| 5 Actions and seniority | 9 [8.5] | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] |
| 6 Original | 7 [7] | 7 [7] | 7 [7] | 8 [7.5] | 8 [8] | 7 [7.5] |
| 7 Hooks | 8 [8] | 8 [8] | 8 [8.5] | 8 [8] | 8 [8] | 8 [8] |
| Total | 56 [56.5] | 55 [55] | 55 [56] | 56 [55.5] | 54 [55.5] | 55 [55.5] |

Self-scores are within 1.5 points of the review on every draft. Two new layouts reached original 8: sampled-ground and redline. Projector did not; see its section. The "original" line moved for the first time in five rounds, and it moved only on the two pages that dropped the stack and hooked with something other than a sentence.

## year-stack (polish, round 3: 54 → 4: 55 → 5: 56)

Score change: +1 (seniority 8 → 9). Builder expected 58, self-scored 56.5.

Defects closed, with frame evidence:

1. Narrow plates leave empty butter. Half closed. 2021 is fixed: the listing is flush to the card's right edge and the three decisions sit as one row across and two columns under it (`pairs/1-after-d-2021-flush-right-two-columns.png`). 2022 is not: it has two decisions, so the text column ends at y 480 and the card's lower half from y 500 to 740, x 156 to 860, is empty butter (`pairs/1-after-d-2022-flush-right.png`). The holdback admits it.
2. Billing result in the footer. Closed. "Also on the record" holds five rows with mono results between the 2021 card and the footer: 16 → 2 queries, 16 isolation tests, 972 → 337 KB, 4 languages, 1 reusable package (`pairs/2-after-d-record.png`, `m-record.png`).
3. 2023 card has four decisions. Closed. Three decisions; the Vue years moved to the record (`pairs/3-after-d-2023-three-decisions.png`).
4. Rewrite runs one card ahead. Closed. At y 560 the 2026 card's "Open the case" is still visible and the statement is still 2026 (`pairs/4-after-d-y560-link-still-visible-2026.png`); at y 600 the link has gone under the statement and the strike is at 130 ms with the 2025 hairline drawn to the store badges (`pairs/4-after-d-y600-link-gone-rewrite-130ms.png`).
5. Phone header four lines. Closed. Three lines, 92 px: name and struck clause on line one, the year's sentence under it (`pairs/5-after-m-2025-three-lines-92px.png`).
6. Coordinator fix. Closed in the shared recreation: the "Care manager" chip is one line at 343 px (`m-top.png`).

Open defects:

1. The 2022 card (item 1 above). A card whose text column fills half its slot is the same defect class the round-4 list named, one card instead of two.
2. The phone statement is set at 88% width and the desktop statement at 108% (`m-y2025.png` against `d-top.png`): two widths of one face on one page. The holdback admits it.
3. The bottom 100 px of the first screen are empty ground under the pile (`d-top.png` y 800 to 900). White space, not a defect, but the pile's edges could carry the screen to its end.

Seniority is 9 because every card is a decision with a result and a pinned proof, nothing is a technology list, and the five results with no screen are now rows a visitor reads, not a footer sentence. Keyboard (`d-key-right-120ms.png`, `d-key-end-120ms.png`) and reduced motion (`d-reduced-top.png`, `d-reduced-y294.png`) are proven.

Polish trend: +1, +1. ROUND-3-BRIEF §6 parks a draft after a second round under +2. See "Polish track for round 6" for the call.

## statement-of-record (polish, round 3: 53 → 4: 54 → 5: 55)

Score change: +1 (hooks 7 → 8). Builder expected 56, self-scored 55.

Defects closed, with frame evidence:

1. Viva Fresh card half empty. Closed. 0002 is a side-column card: the store home screen at native ratio at the left, "iOS and Android" in Literata at 80 px with "One React Native codebase" in mono in the column (`d-0002-screen.png`).
2. Phone hyphen break. Closed. "multi‑tenant care platform," holds one line; the statement is six whole lines (`m-top.png`).
3. Per-word dotted underline. Closed. "runs 16 queries and times out." is one dotted run across the spaces (`d-s3-y240.png` y 790).
4. Hand-off text overlap. Closed. At y 112 the band is empty; at y 140 the header is fading in alone (`d-s3-y112.png`, `d-s3-y140.png`). No frame holds both texts.
5. 0004, 0003, 0001 plate-less rows. Closed. "The record" holds all ten in two columns; 0004 reads "4 languages, superseded by 0010" (`d-record.png`). Seven big cards remain.
6. Tally only in the header. Closed. "1 of 4 corrected" sits in the band's margin on the first screen and becomes "2 of 4" after 0009 (`d-top.png` y 207, `d-0002-screen.png`).

Open defects:

1. At `d-s3-y112.png` the band is a 115 px forest block with nothing in it. The gap rule (statement out before the header in) is met in time, but on screen it is an empty block taller than the 56 px header for about 30 px of scroll. The band should shrink to the header's height while the statement fades.
2. "iOS and Android" at 80 px is a second big-figure plate beside "16 → 2" (`d-0002-screen.png`, `d-0009-end.png`). Two of seven cards use one device; the holdback admits it.
3. Copy watch, not a score defect: 0010 strikes "and no screen may change its behaviour." and writes "one route at a time, each after a parity test on both apps." The struck words are the constraint that the parity test keeps, not a problem the result removed. The round-1 rule says a strike needs a problem. Rewrite without a strike: "The care platform moves to React one route at a time; a route moves after its parity test passes on both apps."

Motion evidence is real: strike mid-frame (`d-0009-130ms.png`, the stroke at "times o|ut."), write-in end (`d-0009-end.png`), load correction (`d-load-0010-130ms.png`, `d-load-0010-420ms.png`), keyboard (`d-key-enter-0002-30ms.png`), reduced motion (`d-reduced-0009.png`, `d-reduced-top.png`).

Polish trend: +1, +1. Second round under +2; the §6 rule parks it.

## token-source (polish, round 4: 54 → 5: 55)

Score change: +1 (calm 7 → 8). Builder expected 57, self-scored 56.

Defects closed, with frame evidence:

1. Notes cut under the plate. Closed. The "805 tokens" note fades as a whole at 40% opacity while it is still fully readable (`d-fade1-y232.png`); nothing is half under the plate at y 640 or on the phone (`after-1-d-y640-no-note-under-plate.png`, `after-1-m-y735-no-note-under-plate.png`).
2. Three card geometries. Closed in geometry, half closed in content. All three cards are an 880 × 440 plate and a 280 px column (`after-2-d-card1-side-column.png`, `d-s1-card2.png`). The reader card's plate is the 512 px reader scene centred on its own cream ground, so about 180 px of empty ground shows at each side (`d-s1-mid-plus250.png`). The holdback admits it.
3. Hook only in a caption. Closed. The claim is "Every colour on this page comes from one token source." at 56 px; the first note starts "Light or Dark: this page follows." (`d-top.png`).
4. Header-row pin. Closed. "805 tokens" ends on the "One source › tokens.css tokens.ts figma.json" row (`d-top.png`); "20 releases" ends on the "Release 1.2 is scheduled" alert after the Alert panel arrives (`d-y690-release.png`); the phone pin rings the cobalt.600 row (`m-top.png`).
5. Dense first screen. Closed. The plate is cropped to the Tokens panel, five rows and the One source row, and ends whole at y 625 (`d-top.png`).
6. Plate overlaps the band. Closed. The band ends at y 244; the plate starts at y 268 (`d-top.png`). Slop 0.

Open defects:

1. The reader plate (item 2). A scene plate is cropped to its content, not centred on its own ground.
2. The hook needs a press. The page proves its claim only when a visitor presses Dark (`d-flip-300ms.png` is a true mid-frame of the circular reveal; `d-flip-end.png` the result). On the first screen the claim is a sentence. The holdback admits it.
3. During the specimen's 560 ms reveal its view-transition layer paints over the current hairline's inner run (holdback). Not captured; the builder reports it.

Polish trend: +1 after one pass. The list is complete; the remaining gain is at most +1 (harmony).

## sampled-ground (new)

Strongest idea, keep it: the page is painted by the product. The ground, ink and panel of every card are computed from the measured hue of the card's own screen at fixed lightness and chroma, and the page says so in its footnote: "The colour of this page is sampled from the screen under it." (`d-top.png`). When Incentiv settles, the indigo ground spreads out of the plate as a circle while the pink corners are still there (`d-ground-y1180-060ms.png`), the bar follows and the ring on the hue scale slides from h 034 to h 282 (`d-ground-y1180-150ms.png`, ring mid-travel at x 785). That is motion that explains where a thing came from. The claim leads with the two strongest facts, "Two platform rewrites, three apps in both stores.", and both are true to CONTENT.md. One hairline per card ends at a part: the Android cart total, the pinned chat message, "Sign in with passkey", the store badges, the One source row, the organization switcher (`d-top.png`, `d-y620.png`, `d-y1180.png`, `d-y2300.png`, `d-y2860.png`). The live room is paused at 04 messages and the specimen's demo is paused, so no plate loops (`d-y620.png`). The record closes on grey, "no screen, no hue" (`d-end.png`). The phone first screen holds the claim, the footnote, one store screen with its pinned total and the result (`m-top.png`). Reduced motion keeps the first screen identical (`d-reduced-top.png`). Chroma 29.6% / 33.4%.

Original is 8: no stack, no hero band, no bento. The layout a visitor names is "the page changes colour with the product, and the colour is measured". A column of side-column cards is under it, which the holdback admits, but the colour rule is a new mixture, not a known template.

Defects:

1. The first plate is two store screens side by side (iPhone and Android carts, cropped inside the frames, `d-top.png` x 120 to 1000). The round-3 rule says a store listing is one image at native ratio. Two tiles are tiles. Slop 0.5.
2. The hue scale on the first screen reads "h 0 … 360" with six dots and a ring (`d-top.png` y 25 to 50). It is the navigation, but a visitor has no word for it in five seconds. The footnote explains the colour; nothing explains the scale.
3. The bar fades to the new colour while the ground spreads: two means for one change (holdback; `d-ground-y1180-060ms.png` shows the bar already indigo while the ground is mid-spread).
4. The Bayyinah phone card rings the LIVE chip (`m-y640.png`) while the desktop rings the pinned message (`d-y620.png`). One part per card on both devices.
5. The plan's S1 cover between cards was not built (holdback: the coordinator ruled out a stack). That is the right call; the page needs no cover.

Carry forward: the whole frame, on the polish track.

## redline (new)

Strongest idea, keep it: the screen is the page and the review is drawn on it. The live room fills the first screen between two solid redline margins; four notes draw their hairlines across the margin into the screen to the LIVE chip, the quality menu, the Premium switch and the pinned message (`d-top.png`), with a true mid-frame at 120 ms where lines 1 and 2 are drawn and 3 and 4 are not (`d-draw-0004-120ms.png`). Hover a note and the other three marks fade (`d-hover-note2-end.png`); Enter on a note moves focus into the control (`d-key-enter-note2-060ms.png`). The specimen sheet rings a token lane, the One source row, the theme switch and the focus-ring lane (`d-y745.png`); the care sheet rings the role chip, an alert dot, the organization switcher and the timezone line (`d-y1460.png`). The record of ten marks which three have a sheet (`d-y2200.png`). The phone first screen holds the plate with four numbered pins and the first three notes in a red block (`m-top.png`). Chroma 26.3% / 34.2%, the two margins are the accent with area.

Original is 8: no stack, no hero, no card column. "A screen reviewed in red margins" is a new frame for this loop. An annotated screenshot is a known case-study device, which the holdback admits, but as a home page with the screen as the page and solid margins as the only chrome it is distinctive.

Defects:

1. Reduced motion does not stop the live room. `d-reduced-top.png` shows "10 messages"; `d-top.png` shows "08 messages" after the stop; `d-chat-4500ms-running.png` shows "06". The `Plate` component starts `playing` at `true` and stops only when the DOM holds eight messages (`Draft.tsx` lines 470 to 489); nothing reads `prefers-reduced-motion`. Under reduced motion the first screen plays for about eight seconds. The brief says a draft must work with reduced motion. Motion 7.
2. The first screen is busy: a two-line identity in the header with four chips and two links, the sheet id, the title, a player with a running chat of eight messages, four notes, four rings, a footer line (`d-top.png`). Calm 7; the holdback agrees.
3. The notes describe the product, not his decisions. "Each screen respects the role of the user who opens it", "Care teams follow readings from connected devices", "Multi-tenant covers timezones too" (`d-y1460.png`); "On AWS IVS, next to on-demand video and courses" (`d-top.png`). The sheet titles carry the decisions; the twelve notes carry features. The bar's point 5 asks for problems solved and decisions made.
4. The identity is a 20 px header line (`d-top.png` y 18 to 44). It is readable in five seconds, but it is the smallest identity in the round; the holdback admits it.
5. Three hues on the page: redline margins beside the teal care plate and the cobalt specimen (`d-y745.png`, `d-y1460.png`). The plates bring their own colour; the margins do not answer it.

Carry forward: the frame as a part (see N1 in the round-6 plan). Fix item 1 before any reuse.

## projector (new)

Strongest idea, keep it: the eye stays in one place. A 440 px log at the left, one 880 × 560 frame at the right that never moves, and a ten-slot tray under it (`d-top.png`). The row at the reading line is current; its outlined numeral fills, its result gets an ink band, and a hairline runs from the band through the gutter into the frame to the part: the One source row (`d-top.png`), the organization switcher along the care plate's divider (`d-02.png`), the 2 of "16 → 2" (`d-03.png`), the Passkey button (`d-05.png`), the category row (`d-07.png`), the progress row (`d-08.png`), the 1 of "1 package" (`d-09.png`), the search field (`d-10.png`). The plate cross-fade has a true mid-frame with the care plate over the specimen (`d-01to02-100ms.png`). Keyboard moves the row with no travel (`d-key-down-030ms.png`, `d-tray-key-right-030ms.png`); reduced motion switches (`d-reduced-02-040ms.png`). The identity line is four lines at 40 px with "Part of two platform rewrites." under it, and the first row's result band says "36 components, 805 tokens, 20 releases in about six weeks" in the first screen (`d-top.png`). The phone pins the frame at the top and scrolls the log under it, with row 01 and its result in the first screen (`m-top.png`). Chroma 59.0% / 94.5%.

Original is 7. A sticky media frame beside a scrolling text column is the standard scrollytelling layout, and a visitor names it as that. The projector reading (outlined numerals, the tray, the number plates in the frame, the unroll) is a dressing on the known frame; the holdback says the same. The page is the clearest read of the round, which is point 1 and calm, not originality.

Defects:

1. Two store screens in one frame on rows 07 and 10 (`d-07.png`: Viva Fresh on iPhone and on Android; `d-10.png`: two Dukagjini screens). Tiles. Slop 0.5.
2. The bottom 160 px of the first screen under the tray are empty field (`d-top.png` y 760 to 900); the holdback admits it.
3. The phone frame shows the specimen as a 343 px picture of a 1200 px table; its text is about 8 px (`m-top.png`). The first screen "shows work" only as a thumbnail.
4. Row 02's result does not follow its sentence: "Its frontend moves from Vue to React, route by route. → Each organization sees only its own patients" (`d-02.png`). The sentence is about the move; the result is about tenancy.
5. The frame unrolls empty at load for about 200 ms (`d-unroll-200ms.png`: a blank pale rectangle). The unroll explains nothing; the first plate's arrival is the moment.
6. The specimen in the first frame is a fifteen-row mono table; the ring on the One source row is small at a glance. A plate that reads at once (the care chart) would move point 1 to 9.

Carry forward: the frame, on the polish track, third slot.

## Slop count (CREATIVE-CONSULT §1.2)

- year-stack: none. Count 0.
- statement-of-record: none. Count 0.
- token-source: none; the band overlap is gone. Count 0.
- sampled-ground: two store tiles in the first plate (0.5). Count 0.5.
- redline: none. Count 0. (The reduced-motion loop is a rule defect, not a slop marker.)
- projector: two store tiles on two rows (0.5). Count 0.5.

The identity-line rule held: no page uses "Web and mobile for 5+ years, full stack since 2026". token-source's aside still carries "5+ years." as a fact beside the two rewrites; that is allowed by the rule (one number that proves the level).

## Motion checks against emil-design-eng and the scroll canon

- Durations: year-stack strike 260, write 320 in whole words, settle 160, hairline 180 + ring 120; statement-of-record strike 260, write 340 after 220, header over 112 to 172 px; token-source hairline 180, ring 120, board move 280, flip 200 after the reveal, note fade over 60 px; sampled-ground settle 160, spread 280, bar 280, ring slide 280, hairline 180 + ring 120; redline four lines 180 with 60 stagger, ring 120, hover 160; projector settle 160, cross-fade 200, numeral fill 160, band wipe 240, hairline 180, unroll 600. All inside the canon except that the projector unroll is decorative (defect 5).
- S1 order: token-source's three cards cover oldest first and the covered card scales (`d-s1-mid-plus250.png`). No other round-5 page animates a cover; year-stack keeps the pile.
- Hairlines: every hairline in the round ends at a part. Redline's line 3 runs 6 px above the chat panel's top edge to reach the Premium switch (`d-top.png` y 186), clear of text; tight but inside the rule.
- Mid-frame rule: every claimed motion has a real mid-frame named by its time or offset. The three polish entries captured before/after pairs for each fixed defect.
- Keyboard: all six jump with no travel (`year-stack/d-key-right-120ms`, `statement-of-record/d-key-enter-0002-30ms`, `token-source/d-key-enter-120ms`, `sampled-ground/d-key-right-030ms`, `redline/d-key-enter-note2-060ms`, `projector/d-key-down-030ms`).
- Reduced motion: five of six captured a still end state. redline's live room keeps playing (defect 1).
- Loops: redline's chat and player run for about eight seconds at load, then stop (`d-top-21s-chat-still.png` equals `d-top.png`). sampled-ground mounts the same recreation paused (`d-y620.png`, 04 messages at every offset). The care chart draws once on mount everywhere.
- Text on text: none. statement-of-record's hand-off now leaves an empty band instead (open defect 1).

## Ranking, round 5

1. year-stack (56, slop 0). The most complete page in the loop: calm first screen, a true rewrite, every card a decision with a pinned proof, a record. The 2022 card and the "original" line hold it.
2. sampled-ground (56, slop 0.5). The only page where the look is the content. Two store tiles and an unexplained scale hold it.
3. statement-of-record (55, slop 0). Every listed defect closed; the frame is a well-set report and will not move further.
4. token-source (55, slop 0). The most technical hook, now said on the first screen. The reader plate and the Dark press hold it.
5. projector (55, slop 0.5). The clearest read of the round in a known frame.
6. redline (54, slop 0). The second page at original 8, held by a reduced-motion loop and notes that describe features.

## Combined ranking, rounds 1 to 5 (23 drafts, 28 entries)

Ties are broken by slop count, then by whether the phone first screen shows work.

| Rank | Draft | Round | Total | Slop | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | year-stack | 3, polished 4, 5 | 56 | 0 | polish track, slot 2 |
| 2 | sampled-ground | 5 | 56 | 0.5 | polish track, slot 1 |
| 3 | statement-of-record | 3, polished 4, 5 | 55 | 0 | parked (§6) |
| 4 | token-source | 4, polished 5 | 55 | 0 | reserve |
| 5 | projector | 5 | 55 | 0.5 | polish track, slot 3 |
| 6 | redline | 5 | 54 | 0 | frame carried into N1 |
| 7 | both-stores | 4 | 54 | 1 | stopped |
| 8 | rebuilt-twice | 4 | 53 | 0 | stopped |
| 9 | added-clauses | 4 | 52 | 0 | stopped |
| 10 | pinned-decisions | 3 | 52 | 0 | stopped |
| 11 | decision-record | 2 | 52 | 0 | stopped |
| 12 | changelog | 1 | 52 | 1.5 | stopped |
| 13 | same-behaviour | 3 | 51 | 1 | stopped |
| 14 | margin-notes | 2 | 51 | 1 | stopped |
| 15 | brief | 1 | 51 | 0.5 | stopped |
| 16 | release-brief | 2 | 50 | 1 | stopped |
| 17 | workspace-rail | 3 | 49 | 1 | stopped |
| 18 | proven-cv | 3 | 49 | 1 | stopped |
| 19 | strike-index | 2 | 47 | 0.5 | stopped |
| 20 | cited-claims | 2 | 46 | 0.5 | stopped |
| 21 | tenant-switch | 2 | 46 | 1 | stopped |
| 22 | specimen | 1 | 46 | 1.5 | stopped |
| 23 | orbit-index | 1 | 46 | 2 | stopped |

### Score trend of the polish track

| Draft | Round 3 | Round 4 | Round 5 | Gain per pass |
| --- | --- | --- | --- | --- |
| year-stack | 54 | 55 | 56 | +1, +1 |
| statement-of-record | 53 | 54 | 55 | +1, +1 |
| token-source | — | 54 | 55 | +1 |

A polish pass yields +1, never the +2 the §6 rule wants. The reason is the same on all three: the list closes defects in harmony, calm and motion, and those points were already 8. The points that are not 8 on these pages are "original" (7, the frame) and, before this round, hooks. Polish cannot move the frame. The best polish entry is 56; the convergence target is 63. The floor rose again: every round-5 entry is 54 or more (round 4: 52).

## Recommendation for the owner

Plain words. Three candidates, in order:

1. **year-stack (56)** is the safest home page today. It is finished: nothing on it is broken, every claim is pinned to a pixel, the phone works, and the record closes it. Its only weakness is that it looks like the kind of page this loop makes (a card pile with a sentence that rewrites), so a design-literate visitor will not call it original. Choose it if you want to ship this week.
2. **sampled-ground (56)** is the page people would mention. The idea is easy to say in one sentence ("the page takes its colour from the screen it shows") and the page proves it on every card. It needs one polish pass: one store screen instead of two on the first card, a word on the hue scale, and one means for the colour change. Choose it if you want the page to be remembered and can wait one round.
3. **projector (55)** is the easiest page to read: the eye never moves, the log tells ten stories in ten rows, and the first screen says who, what and level with one proof. It will be called "a sticky frame with a scrolling list", which it is. Choose it if clarity matters more than novelty.

Not recommended as the final page: statement-of-record (finished but the same frame as year-stack with a weaker hook), token-source (a page about the design system, not about him), redline (the frame is strong but it needs its notes rewritten and its reduced-motion defect fixed before it is a candidate).

## Polish track for round 6

Aim: 60 or more. Honest expectation after one pass: sampled-ground 58 to 59, year-stack 57, projector 57. Parked by ROUND-3-BRIEF §6 (second round under +2): statement-of-record. Reserve: token-source (one pass, +1; its list is closed; it takes a slot only if a polish entry cannot be built, with fixes 1 and 2 from its open list). The §6 rule also applies to year-stack (+1, +1), but it is rank 1 with an open defect that has a known fix, so it stays one more round; if round 6 gives it under +2 again it parks with no further exception.

### P1. sampled-ground, 56 → expected 59

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 56 | — | two store tiles; unexplained hue scale; two means for one colour change; phone ring differs from desktop |
| 6 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). One screen per plate. The Viva Fresh plate shows one store screen at native ratio, cropped to whole rows (products, "Zbritje totale", "VAZHDO ME PAGESEN"), flush to the plate's right edge, and the caption says "Store listing, iPhone; the same screen is on Google Play". Never two tiles. Evidence: `d-top.png` x 120 to 1000. Slop goes to 0.
2. Point (+1). Give the hue scale its words. Replace "h 0" and "360" with "hue 0°" and "360°" and put the footnote's second sentence under the ring as the scale's label ("Sampled from the screen under it · Viva Fresh · 23°"), so the first screen says the hook once, where the control is. Evidence: `d-top.png` y 25 to 50.
3. Motion (0, removes a finding). One means: the clip-path spread covers the bar too, so the bar's colour arrives with the ground and nothing fades. Evidence: `d-ground-y1180-060ms.png`.
4. Harmony (0, removes a finding). One part per card on both devices: the Bayyinah phone card rings the pinned message, as the desktop does (`m-y640.png` against `d-y620.png`).
5. Seniority (0 to +1). Write each card's line as decision → result, like the record rows: "Ship one React Native codebase to both stores → live in both stores" instead of "One grocery app for iPhone and Android, from one React Native codebase. Live in both stores." (`d-top.png`). Short, and the result in bold as year-stack does.
6. Calm (0). The identity footnote is 15 px under a 64 px claim (`d-top.png` y 246). Keep it; set the name in the text weight, not the footnote weight, so the name is read in the first five seconds.

### P2. year-stack, 56 → expected 57

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 8 | 7 | 8 | 8 | 8 | 7 | 8 | 54 | — | first-screen load; plates cut mid-row; store phone tiles; S1 inverted; phone statement plain; hairline over the plate; clipped glyph |
| 4 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 55 | 1 to 7 | narrow plates leave empty butter; billing result in the footer; 2023 card has four decisions; rewrite runs one card ahead; phone header four lines |
| 5 | 8 | 8 | 8 | 8 | 9 | 7 | 8 | 56 | 2, 3, 4, 5, 6; 1 half | 2022 card half empty; two statement widths; empty ground under the pile |
| 6 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). Fill the 2022 card. Move the chatbot runtime row (2022, "1 reusable package") from the record into the 2022 card as its third decision, so the text column holds three rows like 2021 and the card's lower half is not empty. The record keeps four rows. Evidence: `pairs/1-after-d-2022-flush-right.png` y 500 to 740.
2. Harmony (0, removes a finding). One statement width on both devices. Set the phone statement at the desktop width and let the name take line one alone with the struck clause starting line two if it must; three lines, 92 px, stays the target (`m-y2025.png`).
3. Calm (0). End the first screen on the pile: raise the plate 40 px or step the pile edges at 20 px so the last edge sits at y 880 (`d-top.png` y 800 to 900).

Nothing on this list moves "original" or "hooks". 58 needs a frame change, which polish does not make.

### P3. projector, 55 → expected 57

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 55 | — | two store tiles on 07 and 10; empty field under the tray; phone frame unreadable; row 02 result mismatch; empty unroll; dense first plate |
| 6 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Point (+1). A first plate that reads at a glance. Keep the specimen but crop it to three token rows and the One source row at a larger scale, so the ring on the One source row is readable from the log; or make row 01 the care platform (2026, same year as the design system) and let its chart be the first plate. Evidence: `d-top.png`, fifteen rows of 13 px mono in the first frame.
2. Harmony (+1 with item 3). One screen per plate on rows 07 and 10, cropped to whole rows; the caption names the other store. Evidence: `d-07.png`, `d-10.png`. Slop goes to 0.
3. Seniority (0, removes a finding). Row 02's result follows its sentence: "Its frontend moves from Vue to React, route by route. → A route moves after its parity test passes on both apps." The tenancy line goes to the row's role line or to the record. Evidence: `d-02.png`.
4. Calm (0). Raise the frame so the tray sits at about y 680 and the first screen ends on row 02's result band, not on 160 px of empty field (`d-top.png` y 760 to 900).
5. Motion (0, removes a finding). Drop the 600 ms unroll; the first plate fades in (200 ms) and then its hairline draws. Evidence: `d-unroll-200ms.png`, an empty frame.
6. Phone (0 to +1 on the phone read). The frame shows a phone crop of each plate (the specimen's first lane, the care chart, the reader's page) as token-source's phone does, not a scaled picture of the desktop plate (`m-top.png`).

### Parked and reserve

- statement-of-record (55): parked by §6 after +1, +1. Its list is closed. The open items (empty band at y 112, second big-figure plate, the 0010 strike wording) are small and do not move a point.
- token-source (55): reserve. If it runs, two fixes: crop the reader plate to its content (`d-s1-mid-plus250.png`) and let the page open in the visitor's own `prefers-color-scheme` so the claim is proven at load for dark-mode visitors without a press.
- redline (54): not polished as a frame; its frame moves into N1. Before any reuse: stop the live room under `prefers-reduced-motion` and rewrite the twelve notes as decision → result.

## New directions for round 6

Only one is proposed. The evidence says what beats original 8: no stack, a first plate no other draft led with, and a hook that is not a sentence (a measured colour, a review drawn on the screen). The sticky frame did not reach 8 because a visitor names it as a known layout. A second direction is proposed only if a builder can write, in one line, the layout a visitor would name, and that line is not a stack, a hero band, a sticky-frame scrollytelling, a bento, a terminal, a device fan or a stats wall.

### N1. `sampled-review` (combination of the two drafts at original 8)

- Hook: the screen is the page, the review is drawn on it, and the margins take the screen's own colour. Redline's frame with sampled-ground's palette rule: for each sheet the margins are `oklch(0.42 0.13 h)` with ground-colour type and the sheet's ground is `oklch(0.95 0.035 h)`, where h is the sheet's measured hue (live room 34, specimen 253, care 186). The red margin becomes "this screen's colour", so the three-hue defect of redline closes by construction and the colour rule needs no card column.
- Combines: redline's margins, notes, hairlines at arrival and two-way hover; sampled-ground's measured hue and the spread when a sheet becomes current; year-stack's decision → result line for every note; decision-record's record.
- First screen: a 64 px claim at the top of sheet 1, "Two platform rewrites, three apps in both stores.", the identity as a one-line footnote under it, then the live room at 1200 × 540 between its margins with four notes. The live room mounts paused (sampled-ground's method). The sticky header is the three sheet chips and the record chip only.
- Notes: each is a decision and a result, not a feature. "Live streams on AWS IVS → one player for web and the mobile app" is the shape. Twelve notes, twelve results.
- Motion: four hairlines at arrival (180 ms, 60 ms stagger), the margins and ground spread to the new hue when a sheet becomes current (280 ms, clip-path from the plate), hover fades the other marks. Reduced motion: everything appears; nothing plays.
- Phone: the plate at 343 × 258 with four pins; the notes stack under it in a block of the sheet's panel colour.
- Risk: two ideas on one page. Rule: the colour is a harmony mechanism, not a second hook; the page never says "the colour is sampled" above the record; one line in the record's footer explains it.

## Rules for round 6 builders (new, from this round's evidence)

- Reduced motion stops a live plate's demo. A recreation that plays at load plays only when `prefers-reduced-motion` is not set (`redline/d-reduced-top.png` "10 messages" against `d-top.png` "08").
- Two store screens in one plate are tiles. One screen per plate at native ratio, cropped to whole rows; the caption names the other store (`sampled-ground/d-top.png`, `projector/d-07.png`, `d-10.png`).
- A plate fills its slot, and so does the text column. A card with two decisions leaves half its panel empty; it takes a third decision from the record or shrinks to the plate's height (`year-stack/pairs/1-after-d-2022-flush-right.png`).
- A scene plate is cropped to its content, never centred on its own ground inside a wider plate (`token-source/d-s1-mid-plus250.png`).
- A control on the first screen has a word a visitor reads in five seconds (`sampled-ground/d-top.png`, "h 0 … 360").
- A note is a decision and a result, not a feature of the product (`redline/d-y1460.png`, "Each screen respects the role of the user who opens it").
- A result follows from its sentence (`projector/d-02.png`, a move-to-React sentence with a tenancy result).
- The S3 hand-off never shows an empty band taller than the header. The band shrinks while the statement fades (`statement-of-record/d-s3-y112.png`).
- One part per card on both devices. The phone rings what the desktop rings (`sampled-ground/m-y640.png` against `d-y620.png`).
- An entrance that explains nothing is cut. A frame that unrolls empty is decoration (`projector/d-unroll-200ms.png`).
- A strike needs a problem the result removes, not a constraint the result keeps (`statement-of-record/d-top.png`, "and no screen may change its behaviour").
- One statement width per page across devices (`year-stack/m-y2025.png` at 88% against `d-top.png` at 108%).
- The chroma report stays: all six round-5 numbers matched the re-measurement.
- Keep the mid-frame rule, the keyboard-jump frame, the reduced-motion frame and the before/after pairs for polish entries. All six met the first three this round; the three polish entries met the fourth.
- The label capture: the frame used for chroma is the frame with every label on it. `token-source/d-top.png` lacks the recreation label that `d-label-top.png` has; one final `d-top.png` per draft, captured last.
