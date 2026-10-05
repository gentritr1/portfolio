# Loop 6 review: sampled-ground, year-stack, projector (polish); sampled-review (new)

Reviewer: independent, built none of these, did not read this round before the review. Judged from the PNG captures in `review/loop6/<id>/final/` (desktop, phone, scroll states, mid-animation frames, reduced motion, before/after pairs), the sheets `review/thumbs6/sheet.png` and `review/reel6/sheet.png`, the draft source in `src/drafts/<id>/`, and my own captures in `review/r6check/`. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Builders' self-scores are in brackets. Review scores are whole numbers.

Measurements made for this review:

- Chroma. `scratchpad/chroma6r.mjs` (the round-3 decode and threshold, plate rectangles from each meta.json) re-measured every desktop first screen. All four builder numbers match to 0.1%: sampled-ground 37.3 / 40.3 (35.6 outside the 880 px slot), year-stack 36.1 / 45.7, projector 58.9 / 94.5, sampled-review 37.1 / 49.5 (whole screen / outside the plates).
- Static-state proof. `review/r6check/diff.mjs` compares two captures pixel by pixel. Ten pairs taken 5 to 8 seconds apart are identical (0 differing pixels): sampled-ground y 759 normal (`sg-y759-4s`, `sg-y759-12s`) and reduced (`sg-red-y759-4s`, `sg-red-y759-12s`), sampled-ground specimen reduced (`sg-red-y2439-a/b`); projector reduced rows 01, 02, 08 (`pj-red-01-a/b`, `pj-red-02-a/b`, `pj-red-08-a/b`); sampled-review phone reduced (`sr-m-red-4s`, `sr-m-red-12s`), desktop reduced sheets 02 and 03 (`sr-red-y600-a/b`, `sr-red-y1300-a/b`), and desktop normal sheet 02 (`sr-y600-a/b`). The builder pairs `sampled-review/final/d-reduced-top-4s` against `d-reduced-top-12s` and `d-top` against `d-top-4s` are also identical. year-stack has no live plate that plays; its care chart draws once on mount and is still in `d-reduced-top.png`.
- Facts. Every number and claim I read on the four pages is in CONTENT.md, `src/content/projects.ts` or `src/content/caseNarratives.ts`: 34 routes, 270+ components, about 14 releases, RN 0.63 to 0.81, 16 → 2 queries and no more timeouts, 16 security tests (also written "16 isolation tests"; the Offday row names them), 972 → 337 KB, 805 tokens in three tiers, 36 components, 20 releases in about six weeks, Stripe, Apple and Google subscriptions, AWS IVS, HLS, Pusher, passkey, English and French, Sadaqah app for Islamic Relief USA, push deep links, Protected routes and external sign-in, Next.js 15, "Built to WCAG 2.1 AA floors with rendered evidence" (the owner's own sentence in caseNarratives line 119, not a compliance claim), "Many client organizations share one system", Kosovo, UBT. "Three apps in both stores" is a count the owner accepted in round 5 (Viva Fresh, Dukagjini Bookstore, Read to Feed; Bayyinah TV is a fourth).

## NDA check

Every Vianova recreation on every page carries a visible "recreation, invented data" label on or directly under its plate. No page shows a real Vianova screen; the only Vianova plates are the shared `care` and `design-system` recreations.

- sampled-ground: "Recreation with invented data" in the text column of the live room, Incentiv, specimen and care cards (`d-y759.png`, `d-y1319.png`, `d-y2439.png`, `d-y2999.png`; phone `m-y760.png`, `m-y1340.png`), plus the footer sentence (`d-end.png`).
- year-stack: "Recreation with invented data" under the care plate (`d-top.png` y 612; `m-top.png` y 558), plus the footer sentence (`d-end-record.png`).
- projector: "Component specimen. Recreation with invented data." and "Vitals trend card. Recreation with invented data." as frame captions (`d-top.png`, `d-02.png`, `m-top.png`, `m-02.png`); "Reader page. Recreation with public-domain text." (`m-08.png`); footer (`d-end.png`).
- sampled-review: "Recreation, invented data" in the caption line of all three sheets (`d-top.png` y 831, `d-y1300.png` y 232, `d-y1960.png` y 336; phone `m-y560.png`), the specimen's own pill, and the footer "The three screens are recreations with invented data. No screen of client work is shown." (`d-end.png`).

Reduced motion stops every live demo on every draft; see the static-state proof above. The shared live room shows its full static chat (10 messages) under reduced motion on sampled-ground and sampled-review; two captures seconds apart are identical, so that is static, not playing.

## Scores

| Point | sampled-ground | year-stack | projector | sampled-review |
| --- | --- | --- | --- | --- |
| 1 Straight to the point | 8 [8.5] | 8 [8] | 9 [9] | 8 [8.5] |
| 2 Not overwhelming | 8 [8] | 8 [8] | 8 [8] | 7 [8] |
| 3 UI/UX harmony | 8 [8.5] | 8 [8.5] | 8 [8.5] | 8 [8.5] |
| 4 Meaningful motion | 9 [8.5] | 8 [8] | 8 [8] | 8 [8] |
| 5 Actions and seniority | 8 [8.5] | 9 [9] | 8 [8] | 8 [8] |
| 6 Original | 8 [8] | 7 [7] | 7 [7] | 8 [8] |
| 7 Hooks | 8 [8] | 8 [8] | 8 [8] | 8 [8] |
| Total | 57 [58] | 56 [56.5] | 56 [56.5] | 55 [57] |

Self-scores are within 2 points of the review on every draft; the largest gap is sampled-review (57 against 55, calm). One point moved up to 9 this round that was not 9 before: sampled-ground's motion (one means for the colour change, every hairline at arrival, nothing plays, all proven). Projector's first read is 9: the first screen names him, what he builds and his level in four lines, shows a plate that reads at a glance, and holds two results.

## sampled-ground (polish, round 5: 56 → 6: 57)

Score change: +1 (motion 8 → 9). Builder expected 59, self-scored 58.

Defects closed, with frame evidence:

1. Two store tiles. Closed. One iPhone cart screen at native ratio, cropped to whole rows (one product, "Zbritje totale", "VAZHDO ME PAGESEN"), flush with the plate's right edge; the caption says "Store listing, iPhone; the same screen is on Google Play" (`pairs/1-after-d-top-one-iphone-screen-flush-right.png`, `d-top.png`). Slop 0.
2. Unexplained hue scale. Closed. "hue 0°" and "360°" at the ends, "Sampled from the screen under it · Viva Fresh · 23°" under the ring (`pairs/2-after-d-bar-hue-0-360-sampled-label.png`).
3. Two means for one colour change. Closed. At 60 ms the circle covers the bar and the lower page together; the four corners are still pink (`d-ground-y1319-060ms.png`); at 150 ms only the bottom-right corner is pink (`d-ground-y1319-150ms.png`). The bar does not fade ahead.
4. Phone ring differs from desktop. Closed. The Bayyinah phone plate is cropped to the control row and the chat, and rings the pinned message as the desktop does (`m-y760.png` against `d-y759.png`).
5. Decision → result lines. Closed. "Ship one React Native codebase to iPhone and Android. → Live in both stores." (`d-top.png`); the same shape on every card and in the record.
6. Name weight. Closed in weight (650), not in size: the name is still a 15 px footnote under a 64 px claim (`pairs/6-after-d-footnote-name-650.png`).

Open defects:

1. The plate does not fill its slot. The store screen is 718 × 440 inside an 880 px slot, so a 162 px strip of panel stands at its left (`d-top.png` x 120 to 282). The round-4 rule ("a plate fills its slot") is not met; the holdback admits it. The image is also shown at about 1.2× its source pixels and its text is soft (`d-top.png`, "Ajvar i djeges").
2. The first pin proves nothing. The hairline from "Live in both stores" ends at the cart total "25.11 €" (`d-top.png`). A cart total does not prove a store release. The round-3 rule says the line ends inside the proof. The same on Bayyinah TV: "34 routes and 270+ components" is pinned to the pinned chat message (`d-y759.png`), which proves moderated chat, not routes.
3. The exception is shown as a label. Bayyinah TV reads "34° → 23°" in the bar and "hue 34°, ground 23°" in the card (`d-y759.png`). A visitor has no word for two hue numbers on one card. The bar shows one number: the hue the ground uses.
4. The name is a footnote. 15 px under a 64 px claim is the smallest identity in the round after projector moved its name to 40 px (`d-top.png` y 246). Point 1 stays 8 for this reason.
5. Phone plates are scaled pictures, not crops, on Incentiv and bayyinah.org (`m-y1340.png`: the wallet card's "Gas saved · 0.42" is about 7 px). The Bayyinah TV plate was cropped (item 4 above); the others were not.
6. The live room's chat column is empty for its lower 60% when paused at 04 messages (`d-y759.png` y 370 to 560). Not a motion defect; a plate that is half empty.

Motion evidence is real: load pin (`d-load-pin-070ms.png`, `d-load-pin-150ms.png`), spread (`d-ground-y1319-060ms.png`, `d-ground-y1319-150ms.png`), pin on arrival (`d-pin-y1319-090ms.png`), keyboard jump with no travel (`d-key-right-030ms.png`, the ring on the bar moved and the bayyinah.org card is current with its hairline whole), reduced motion (`d-reduced-top.png` identical to `d-top.png`; `d-reduced-y759.png` static chat, proven by my pairs). Chroma 37.3% / 40.3%.

Polish trend: +1 after one pass. The list closed six items and moved one point. The open list above is the second pass.

## year-stack (polish, round 3: 54 → 4: 55 → 5: 56 → 6: 56)

Score change: 0. Builder expected 57, self-scored 56.5.

Defects closed, with frame evidence:

1. 2022 card half empty. Closed as listed: the card holds three decisions (reader, React Native upgrades, chatbot runtime) and the record keeps four rows (`pairs/1-after-d-2022-three-decisions.png`, `pairs/1-after-d-record-four-rows.png`, `d-y2912-2022.png`, `d-end-record.png`).
2. Two statement widths. Closed. The phone statement is at the desktop width (108%) in three lines, 92 px (`pairs/2-after-m-2025-stretch-108-three-lines-92px.png`, `m-y2025.png`).
3. Empty ground under the pile. Closed. The pile's last edge sits at y 880 of 900 (`pairs/3-after-d-top-pile-ends-y880.png`, `d-top.png`).

Why the score did not move: the three fixes are correct and the list is closed, but none of them changed what a visitor sees as the page's weakness. Every desktop card is 620 px tall for about 330 to 460 px of content; the text column ends at y 590 to 610 and the card ends at y 785 to 880, so each card keeps 180 to 270 px of empty butter under its text (`d-y640-2025.png`, `d-y2912-2022.png`, `d-y3700-2021.png`). The 2022 fix moved the card from the worst of the six to the same class as the other five. Harmony stays 8. The holdback admits this, and also that the phone statement had to drop to 15 px to keep its line at 108%.

Open defects:

1. The card height. Cards are sized to the tallest plate, not to their content; five of six keep 180 px or more of empty butter under the text. A card ends at its content or the plate ends with the text.
2. The strike and the write overlap. At 130 ms the strike is already complete on all three lines and the first words of 2025 are writing in (`d-rw2025-y640-130ms.png`); the meta says the strike takes 260 ms and the words write in after it. The frame does not match the description. Not a visible defect, but the mid-frame rule asks for a frame named by its real time.
3. "Mbi 1/2 milion tituj nga bota" inside the Dukagjini plate is the store's own image (`d-y3700-2021.png`); allowed, but the plate is the only one with a marketing banner above its proof.

Motion, keyboard and reduced motion are proven as in round 5 (`d-key-right-120ms.png` jumps to 2025 with the ring on the link and the rewrite whole; `d-reduced-top.png`, `d-reduced-y294.png`). Chroma 36.1% / 45.7%.

Polish trend: +1, +1, 0. ROUND-3-BRIEF §6 parks a draft after a second round under +2; the round-5 review gave it one exception. It parks now.

## projector (polish, round 5: 55 → 6: 56)

Score change: +1 (point 8 → 9). Builder expected 57, self-scored 56.5.

Defects closed, with frame evidence:

1. First plate reads at a glance. Closed. Three token rows and the One source row at 1.47×; the ring on the One source row is readable from the log (`pairs/1-after-d-top-three-rows.png`, `d-top.png`).
2. Two store tiles on rows 07 and 10. Closed as listed, and replaced by a new defect (open item 1): one iPhone screen each (`pairs/2-after-d-07-one-screen.png`, `d-07.png`, `d-10.png`). Slop 0.
3. Row 02's result follows its sentence. Closed in the text: "The frontend moves from Vue to React, route by route. → A route moves after its parity test passes on both apps" (`pairs/3-after-d-02-parity-result.png`). See open item 2 for the pin.
4. Tray at y 680. Closed (`pairs/4-after-d-top-tray-y680.png`, `d-top.png`). The left column ends on row 02's result band.
5. Empty unroll. Closed. The plate fades in (`d-load-plate-030ms.png`, a faded specimen) and the line draws after it (`d-load-line-090ms.png`, the line half drawn). No empty frame.
6. Phone frame unreadable. Closed. Each plate is a phone crop at its own size: the specimen's first lane and source row (`m-top.png`), the care chart and unit switch (`m-02.png`), the reader's page and progress row (`m-08.png`).

Open defects:

1. The store plates are centred on a coloured ground. Viva Fresh is one iPhone screen on a 248 px red field at each side (`d-07.png`); Dukagjini on a 199 px pink field (`d-10.png`). The round-5 rule says a scene plate is cropped to its content, never centred on its own ground inside a wider plate. The two fields are also second and third accents on a chartreuse page. The holdback admits it. Harmony stays 8 for this.
2. Row 02's pin proves nothing. The hairline ends at the mmHg/kPa unit switch (`d-02.png`); a unit switch does not prove parity. The round-5 fix moved the mismatch from the result to the pin. The holdback admits it.
3. 200 px of empty field under the tray at the right of the first screen (`d-top.png` y 700 to 900). Raising the frame moved the tray; it did not fill the slot.
4. Row 09's link reads "All 30 projects" where every other row reads "Open the case" (`d-10.png`), because the chatbot runtime has no case page. One row with a different control.
5. The reduced-motion frame `d-reduced-02-040ms.png` shows row 03 current with the 16 → 2 plate, not row 02. My own capture under reduced motion shows row 02 current with the care plate still, identical at two times (`r6check/pj-red-02-a.png`, `pj-red-02-b.png`). The behaviour is right; the builder's frame is mislabelled. Not a score defect.

Motion evidence is real: cross-fade mid-frame with the chart drawing over the faded specimen (`d-01to02-100ms.png`), keyboard jump with no travel (`d-key-down-030ms.png`, focus ring on "Open the case" of row 02, the chart mid-draw), tray keys (`d-tray-key-left-030ms.png`), reduced motion (`d-reduced-top.png`). Chroma 58.9% / 94.5%.

Original stays 7: a sticky frame beside a scrolling log is the layout a visitor names; the holdback says the same.

Polish trend: +1 after one pass.

## sampled-review (new, N1)

Strongest idea, keep it: the screen is the page, the review is drawn on it, and the frame is the screen's own colour. The first screen is the live room between two maroon margins at the live room's hue, with the claim "Two platform rewrites, three apps in both stores." at 64 px, the name at text size, "Rebuild Bayyinah TV on Nuxt 3 → 34 routes, 270+ components." as the sheet title, and four notes whose hairlines end at the LIVE chip, the Auto button, the Premium switch and the pinned message (`d-top.png`). The live room is mounted paused at 04 messages and stays so (`d-top.png` identical to `d-top-4s.png`). The draw at load has a true mid-frame (`d-load-draw-120ms.png`, lines 1 and 2 drawn, 3 and 4 not). When sheet 02 becomes current, one circle spreads the cobalt margins, ground and bar together from the plate's centre (`d-spread-0006-y600-060ms.png`, the bar split by the circle's edge; `d-spread-0006-y600-150ms.png`, only the top corners still maroon). Hover a note and the other marks fade (`d-hover-note2-end.png`). Enter on a chip jumps with no travel and switches the colour at once (`d-key-enter-chip03-030ms.png`). The record closes on grey with the colour rule stated once in its footnote (`d-end.png`). The phone first screen holds the claim, the name, the title and the plate with four numbered pins; the notes stack under it in a block of the margin colour (`m-top.png`, `m-y560.png`). Reduced motion: every line and ring appears, the live room shows its static state, proven identical at 4 s and 12 s on desktop and phone (`d-reduced-top-4s.png`, `d-reduced-top-12s.png`; `r6check/sr-m-red-4s.png`, `sr-m-red-12s.png`). Chroma 37.1% / 49.5%; the margins are the accent with area.

Defects closed from the sources, with evidence: redline's reduced-motion loop (static pairs above), redline's 20 px identity (the claim at 64 px, the name at text size), redline's three hues (each sheet's margins take its screen's hue: maroon, cobalt, teal in `d-top.png`, `d-y600.png`, `d-y1300.png`), sampled-ground's unexplained scale (four named chips), sampled-ground's two means (the bar spreads with the ground), sampled-ground's phone ring (the same four parts on both devices, `m-top.png` against `d-top.png`).

Original is 8: no stack, no hero band, no sticky frame, no card column. "A screen reviewed inside margins of its own colour" is a new frame for the loop. It is a combination of two round-5 frames, so it is not 9.

Defects:

1. The first screen is not quiet. Above the plate: the chip bar, a 64 px claim, the identity line with two links, the sheet title; around it: four notes, four rings, four hairlines; under it: the caption line and the link (`d-top.png`). It is calmer than redline (no running chat, no header chips), but it is the busiest first screen of the round. Calm 7; the holdback admits it.
2. Five of twelve notes are still features, not decisions with a result: "Live on AWS IVS → Live sessions sit next to on-demand video and courses", "One paywall → Stripe, Apple and Google subscriptions open it", "Chat over Pusher → Realtime chat, moderated in the same column" (`d-top.png`); "Respect the role → Each screen shows what the user's role allows", "Patient-local time → Each reading shows in the patient's own timezone" (`d-y1300.png`). The holdback admits it. Seniority 8, not 9.
3. Two rings are containers, not parts. "Parity before each move" rings the whole chart box (`d-y1300.png` x 264 to 1175, y 645 to 890); "Three tiers" rings the whole first token row (`d-y600.png`). The round-3 rule says the line ends at the pixel.
4. One result does not follow its head: "A token for focus → Built to WCAG 2.1 AA floors, with rendered evidence" (`d-y600.png`). A focus-ring token is not the proof of an accessibility floor. The round-5 rule says a result follows from its sentence.
5. The care sheet's result is a method, not an outcome: "Move the care platform from Vue to React → one route at a time, on Design System v2" (`d-y1300.png`). The holdback admits it.
6. The paused live room leaves the lower third of its chat column empty (`d-top.png` y 690 to 790), as on sampled-ground.
7. The keyboard frame for a note was taken with `element.click()` (holdback). The chip frame (`d-key-enter-chip03-030ms.png`) is a true key event; the note path is not proven by a key.

Carry forward: the frame as a reserve and as a part for round 7's N1 (the notes' decision → result discipline and the sampled margins). It does not take a polish slot this round: its calm ceiling is set by the frame (four notes on the first screen), so a polish pass cannot reach 58.

## Slop count (CREATIVE-CONSULT §1.2)

- sampled-ground: none. One screen per plate. Count 0.
- year-stack: none. Count 0.
- projector: none. The store plates are one screen each; the coloured ground is a rule defect, not a slop marker. Count 0.
- sampled-review: none. Count 0.

The identity-line rule held: no page uses "Web and mobile for 5+ years, full stack since 2026". Projector's sub-line "Part of two platform rewrites. Based in Kosovo, working remotely." is the allowed form.

## Motion checks against emil-design-eng and the scroll canon

- Durations: sampled-ground settle 160, spread 280, ring slide 280, hairline 180 + ring 120; year-stack strike 260, write 320, hairline 180 + ring 120; projector settle 160, cross-fade 200, numeral fill 160, band wipe 240, hairline 180, load fade 200; sampled-review four lines 180 with 60 stagger, ring 120, spread 280, hover 160. All inside the canon. Projector's decorative unroll is gone.
- One means per change: sampled-ground and sampled-review spread bar and ground with one clip-path circle (frames above).
- Hairlines: every hairline ends inside the plate. Four end at a part that does not prove the result it is tied to (sampled-ground items 2, projector item 2) and two end at a container (sampled-review item 3).
- Mid-frame rule: every claimed motion has a real mid-frame named by its time or offset, except year-stack's 130 ms frame, which shows the strike complete (year-stack item 2), and projector's mislabelled reduced frame (projector item 5).
- Keyboard: all four jump with no travel (`sampled-ground/d-key-right-030ms`, `year-stack/d-key-right-120ms`, `projector/d-key-down-030ms`, `sampled-review/d-key-enter-chip03-030ms`).
- Reduced motion: all four stop every live demo; proven by identical pairs seconds apart on three of them and by a still chart on year-stack.
- Loops: none on any page. Both pages that mount the live room mount it paused at 04 messages.
- Text on text: none.

## Ranking, round 6

Ties at equal total and slop are broken by point 1, the owner's first criterion, then by whether the phone first screen shows work.

1. sampled-ground (57, slop 0). The only page where the look is the content, now with one screen per plate and the hook said where the control is. Held by the half-filled first slot, a first pin that proves nothing and a footnote name.
2. projector (56, slop 0, point 9). The clearest first screen in the loop. Held by two store plates centred on coloured grounds and a pin on a unit switch.
3. year-stack (56, slop 0, point 8). Finished and parked; the card height is the last defect and it is the frame.
4. sampled-review (55, slop 0). The second frame at original 8, held by a busy first screen and five feature notes.

## Combined ranking, rounds 1 to 6 (24 drafts, 32 entries)

| Rank | Draft | Round | Total | Slop | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | sampled-ground | 5, polished 6 | 57 | 0 | polish track, slot 1 |
| 2 | projector | 5, polished 6 | 56 | 0 | polish track, slot 2 (point 9) |
| 3 | year-stack | 3, polished 4, 5, 6 | 56 | 0 | parked (§6: +1, +1, 0) |
| 4 | statement-of-record | 3, polished 4, 5 | 55 | 0 | parked |
| 5 | token-source | 4, polished 5 | 55 | 0 | reserve |
| 6 | sampled-review | 6 | 55 | 0 | reserve; parts into N1 |
| 7 | redline | 5 | 54 | 0 | frame carried into sampled-review |
| 8 | both-stores | 4 | 54 | 1 | stopped |
| 9 | rebuilt-twice | 4 | 53 | 0 | stopped |
| 10 | added-clauses | 4 | 52 | 0 | stopped |
| 11 | pinned-decisions | 3 | 52 | 0 | stopped |
| 12 | decision-record | 2 | 52 | 0 | stopped |
| 13 | changelog | 1 | 52 | 1.5 | stopped |
| 14 | same-behaviour | 3 | 51 | 1 | stopped |
| 15 | margin-notes | 2 | 51 | 1 | stopped |
| 16 | brief | 1 | 51 | 0.5 | stopped |
| 17 | release-brief | 2 | 50 | 1 | stopped |
| 18 | workspace-rail | 3 | 49 | 1 | stopped |
| 19 | proven-cv | 3 | 49 | 1 | stopped |
| 20 | strike-index | 2 | 47 | 0.5 | stopped |
| 21 | cited-claims | 2 | 46 | 0.5 | stopped |
| 22 | tenant-switch | 2 | 46 | 1 | stopped |
| 23 | specimen | 1 | 46 | 1.5 | stopped |
| 24 | orbit-index | 1 | 46 | 2 | stopped |

### Score trend of the polish track

| Draft | Round 3 | Round 4 | Round 5 | Round 6 | Gain per pass |
| --- | --- | --- | --- | --- | --- |
| year-stack | 54 | 55 | 56 | 56 | +1, +1, 0 |
| statement-of-record | 53 | 54 | 55 | — | +1, +1 |
| token-source | — | 54 | 55 | — | +1 |
| sampled-ground | — | — | 56 | 57 | +1 |
| projector | — | — | 55 | 56 | +1 |

Six polish passes across five drafts: five gave +1, one gave 0, none gave +2. The pattern is the same every time: the list closes harmony, calm and motion items that were already 8, and the points that are not 8 ("original", and point 1 on the pages with a footnote name) are set by the frame. The best page in the loop is 57; the convergence target is 63. Polish will not close that gap. The floor rose again: every round-6 entry is 55 or more (round 5: 54).

## Recommendation for the owner

Plain words. Two pages are ready to become the home page after one short list each. Pick by what you want the page to do.

1. **projector (56)** is the page to ship if you want a home page this week. It is the easiest page to read in the loop: the first screen says who you are, what you build and your level in four lines, shows one piece of work that reads at a glance, and holds two results. Nothing on it plays, loops or breaks. Before shipping, four finite fixes: (a) crop the Viva Fresh and Dukagjini plates to the screen, with no red or pink field at the sides; (b) make row 02 a tenancy row ("Many organizations share one system. → Each sees only its own patients.") with the pin on the organization switcher, and move the parity fact to the role line or the record, so the pin proves the result; (c) fill the 200 px under the tray at the right of the first screen, or shorten the frame so the first screen ends on the tray; (d) give row 09 the same control label as the other rows or remove its link. Expected after the list: 57. It will be called "a sticky frame with a scrolling list", and that is what it is.

2. **sampled-ground (57)** is the page to ship if you want the one people mention, and you can wait one more round. The idea is said in one line, it is now said where the control is, and the page proves it on every card with one means. Before shipping, five finite fixes: (a) a store image at native pixels in a slot of the screen's own ratio, so no 162 px strip stands beside it and no text is soft; (b) a first pin that proves its result: pin the store badge on bayyinah.org as the first card, or write the Viva Fresh result as what the cart proves ("Checkout in Albanian, in both stores") and pin the checkout button; (c) one hue number per card, no "34° → 23°"; (d) the name at text size on the first screen, not a 15 px footnote; (e) phone plates as crops of the part the desktop rings, as the Bayyinah card already does. Expected after the list: 58 to 59.

Not recommended as the final page now: year-stack (finished, parked, the same safe page as in round 5; choose it only if you want zero further rounds and accept "original 7"), sampled-review (a strong frame with a busy first screen and feature notes; its best use is as parts for the next direction), statement-of-record and token-source (parked and reserve, as before).

If you want 60 or more, no polish list reaches it. The only path the evidence supports is round 7's N1 below: projector's first screen and fixed frame with sampled-ground's colour rule, built once, judged once.

## Polish track for round 7

Aim: 59. Honest expectation after one pass: sampled-ground 58 to 59, projector 57. Parked by §6: year-stack (+1, +1, 0) and statement-of-record. Reserve: token-source (55, list closed) and sampled-review (55, new this round; its calm ceiling is the frame, so it takes a slot only if a polish entry cannot be built, with fixes 2, 3 and 4 from its list).

### P1. sampled-ground, 57 → expected 58 to 59

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 56 | — | two store tiles; unexplained hue scale; two means; phone ring differs |
| 6 | 8 | 8 | 8 | 9 | 8 | 8 | 8 | 57 | 1 to 6 | slot not filled and soft image; first pin proves nothing; two hue numbers; footnote name; phone plates scaled; empty chat column |
| 7 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). The plate fills its slot. Use the store image at its native pixels (no upscale) and size the slot to the screen's ratio, or widen the text column to meet the screen; no 162 px strip. Evidence: `d-top.png` x 120 to 282, and the soft "Ajvar i djeges" at 1.2×.
2. Point (+1). The name at text size on the first screen. Put "Gentrit Rashiti builds web and mobile apps, from Kosovo." as a 20 px line under the claim, not a 15 px footnote; the footnote mark goes. Evidence: `d-top.png` y 246.
3. Seniority (0, removes a finding). Every pin proves its result. Viva Fresh: pin the checkout button and write the result as what the screen proves, or open with bayyinah.org's store badges. Bayyinah TV: result "moderated live chat" first, "34 routes" second, so the pinned message proves what is pinned. Evidence: `d-top.png`, `d-y759.png`.
4. Calm (0, removes a finding). One hue number per card. The bar shows the ground's hue only; the card's mono line shows the same number. Evidence: `d-y759.png` "34° → 23°".
5. Harmony (0). Phone plates are crops of the ringed part at a readable size (Incentiv: the sign-in card; bayyinah.org: the badges row; specimen: the One source row). Evidence: `m-y1340.png`.
6. Harmony (0). The paused live room's chat column ends with its last message; the plate crops at the fourth message or the chat panel shrinks to its content. Evidence: `d-y759.png` y 370 to 560.

### P2. projector, 56 → expected 57

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 55 | — | two store tiles; empty field under the tray; phone frame unreadable; row 02 mismatch; empty unroll; dense first plate |
| 6 | 9 | 8 | 8 | 8 | 8 | 7 | 8 | 56 | 1 to 6 | store plates centred on a coloured ground; row 02 pin on a unit switch; 200 px field under the tray; row 09 label; mislabelled reduced frame |
| 7 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). Crop the store plates to the screen. The frame shows the iPhone screen at its native ratio, cropped to whole rows, with the frame's own white ground and the ink line; no red or pink field. If the frame's 880 × 560 ratio does not fit a phone screen, show a landscape crop of the screen's top (header, banner, search) at frame width. Evidence: `d-07.png` x 520 to 768, `d-10.png` x 520 to 719.
2. Seniority (0, removes a finding). Row 02 is a tenancy row with the pin on the organization switcher: "Many organizations share one system. → Each sees only its own patients." The parity fact moves to the role line ("Frontend, route by route, parity-tested") or to the record. Evidence: `d-02.png`.
3. Calm (0). The first screen ends on the tray. Shorten the frame to 880 × 500 or let the tray sit at y 800 with the caption under it; no 200 px of empty field at the right. Evidence: `d-top.png` y 700 to 900.
4. Harmony (0). Row 09's control reads like the others, or the row has no link. Evidence: `d-10.png` row 09.
5. Evidence (0). Name the reduced-motion frame by what it shows. Evidence: `d-reduced-02-040ms.png` shows row 03.

Nothing on this list moves "original"; 58 needs a frame change, which polish does not make.

### Parked and reserve

- year-stack (56): parked by §6 after +1, +1, 0. Its list is closed. The card height is the frame.
- statement-of-record (55): parked, as in round 5.
- token-source (55): reserve, with its two round-5 fixes.
- sampled-review (55): reserve. If it runs, three fixes: rewrite the five feature notes as decision → result; ring parts, not containers (the chart box, the first token row); make the focus-token result follow its head.

## New direction for round 7

Only one is proposed, and only because it can beat the leader on the evidence of this round. The best first screen is projector's (point 9); the only pages at original 8 are the two whose look is computed from the screen. Projector's "original" is held at 7 by its known frame; sampled-ground's point 1 is held at 8 by a footnote name and a card column. Each has what the other lacks.

### N1. `sampled-frame` (projector's frame with sampled-ground's colour rule)

- Hook: one fixed frame, and the whole page is the colour of the screen inside it. The log scrolls beside the frame as in projector; when a row becomes current, the plate cross-fades and its measured hue spreads out of the frame over field, bar and tray as one circle (sampled-ground's mechanism). The layout a visitor names: "a fixed frame whose page changes colour with the screen in it". That is not a stack, a hero band, a plain sticky-frame scrollytelling, a bento, a terminal, a device fan or a stats wall.
- Combines: projector's identity line (name first, 40 px, "Part of two platform rewrites."), log, fixed frame, tray and keyboard path; sampled-ground's palette by construction (ground `oklch(0.95 0.035 h)`, ink `oklch(0.30 0.11 h)`, band `oklch(0.42 0.13 h)`), spread, and grey record with no hue; sampled-review's decision → result line for every row; the three rules below on pins and plates.
- First screen: projector's first screen as built, on the specimen's hue (253) instead of chartreuse; the result band in the ink colour; the tray's current slot in the band colour. One hue number next to the caption ("Sampled from the screen: 253°"); nothing else explains the colour above the record.
- Plates: one screen per row, cropped to the screen at native pixels, never centred on a coloured ground; every pin on a part that proves the row's result, or the row has no line.
- Phone: the pinned frame at the top as projector does, with phone crops; the page colour follows the frame.
- Motion: cross-fade 200, spread 280 from the frame's centre, hairline 180 + ring 120; reduced motion switches the colour and shows the line whole. Nothing plays; the live plates mount paused.
- Risk: the chartreuse field was projector's identity; without it the page could read as sampled-ground in a different layout. Rule: the frame never moves and the log is the reading line; the colour is the harmony, not a second hook; the page says "sampled" once, next to the caption.
- Expected: 58 to 59 (point 9, calm 8, harmony 8, motion 9, seniority 8, original 8, hooks 8) if it inherits no defect from either source. Build it only if the builder can show those three plate and pin rules on the first capture.

## Rules for round 7 builders (new, from this round's evidence)

- A fix for one rule may not break a neighbour rule. "One screen per plate" was met by centring the screen on a coloured field 199 to 248 px wide at each side (`projector/d-07.png`, `d-10.png`); the plate crops to the screen, and the slot takes the screen's ratio or the text column widens.
- A pin proves the result it is tied to, at the pixel. A cart total does not prove "Live in both stores" (`sampled-ground/d-top.png`); a unit switch does not prove parity (`projector/d-02.png`). If no pixel proves the result, pin the decision's part and write a result the screen proves, or the row has no line.
- A ring is a part, not a container. Never the whole chart box or a whole token row (`sampled-review/d-y1300.png`, `d-y600.png`).
- A rule's exception is not a label. "34° → 23°" and "hue 34°, ground 23°" put the builder's exception on the page (`sampled-ground/d-y759.png`). The bar shows one number.
- The name is read in five seconds. A 15 px footnote under a 64 px claim is not (`sampled-ground/d-top.png` y 246). The name sits at text size or above on the first screen.
- A store image is shown at native pixels or smaller, never upscaled (`sampled-ground/d-top.png`, 1.2×, soft text).
- A plate fills its slot (round-4 rule, restated with the measure): no strip of panel wider than 24 px beside a plate (`sampled-ground/d-top.png` x 120 to 282).
- A phone plate is a crop of the part the desktop rings, at a readable size, never a scaled picture of the desktop plate (`sampled-ground/m-y1340.png`; `projector/m-02.png` is the model).
- A paused live plate ends with its content. The live room paused at 04 messages shows a chat column that is 60% empty (`sampled-ground/d-y759.png`, `sampled-review/d-top.png`); crop at the last message or shrink the panel.
- Static-state proof is two captures seconds apart with a pixel diff of 0, reported by file name, not two frames that look the same (`r6check/diff.mjs`). The reduced-motion frame for a live plate is this pair.
- A frame is named by what it shows. `projector/d-reduced-02-040ms.png` shows row 03; `year-stack/d-rw2025-y640-130ms.png` shows a complete strike at a time the meta calls mid-strike.
- A card ends at its content. Cards sized to the tallest plate leave 180 to 270 px of empty butter under the text on five of six cards (`year-stack/d-y640-2025.png`, `d-y3700-2021.png`).
- A result follows from its head, and a note is a decision with an outcome, not a method and not a feature (`sampled-review/d-y600.png` "A token for focus → Built to WCAG 2.1 AA floors"; `d-y1300.png` "→ one route at a time").
- A first screen under a sticky frame ends on the frame's tray, not on 200 px of field (`projector/d-top.png` y 700 to 900).
- A keyboard frame is a key event, never `element.click()` (`sampled-review` holdback).
- The chroma report stays: all four round-6 numbers matched the re-measurement.
- Keep the mid-frame rule, the keyboard-jump frame, the reduced-motion pair and the before/after pairs for polish entries. All four met the first two; the three polish entries met the fourth.
