# Loop 3 review: pinned-decisions, statement-of-record, year-stack, workspace-rail, same-behaviour, proven-cv

Reviewer: independent, built none of these. Judged from the PNG captures in `review/loop3/<id>/final/` (desktop, phone, scroll states, mid-animation frames, reduced motion), the thumbnail sheet `review/thumbs3/sheet.png`, and the draft source in `src/drafts/<id>/`. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Builders' self-scores are in brackets.

Two measurements were made for this review and are cited below:

- `scratchpad/chroma.mjs` decodes each desktop first screen and counts chromatic pixels (saturation above 0.25, value above 60), in total and outside the plate rectangles.
- `scratchpad/contrast.mjs` computes WCAG contrast for the round-4 palettes.

## Scores

| Point | pinned-decisions | statement-of-record | year-stack | workspace-rail | same-behaviour | proven-cv |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Straight to the point | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] |
| 2 Not overwhelming | 8 [8] | 8 [8] | 7 [7] | 7 [7] | 8 [8] | 7 [7] |
| 3 UI/UX harmony | 7 [7] | 7 [8] | 8 [7.5] | 7 [7.5] | 7 [7.5] | 7 [7] |
| 4 Meaningful motion | 7 [8] | 8 [8] | 8 [7.5] | 7 [8] | 7 [7] | 7 [8] |
| 5 Actions and seniority | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 7 [7] | 8 [8] |
| 6 Original | 7 [6] | 7 [6] | 7 [6.5] | 6 [6] | 7 [7] | 6 [6] |
| 7 Hooks | 7 [7] | 7 [7] | 8 [7] | 6 [7] | 7 [7] | 6 [6] |
| Total | 52 | 53 | 54 | 49 | 51 | 49 |

Builders scored honestly this round. The spread between self-score and review score is one point or less on every draft. The over-scoring moved from "original" to "meaningful motion": three builders gave 8 to motion that has a pointer or a ride defect in its own evidence frames.

## The three coordinator observations, tested

### (a) Six drafts, one first screen

Confirmed. `thumbs3/sheet.png` and the six `d-top` frames all open on the Patient 4821 blood-pressure plate with the Northwind Clinic switcher. The cause is in ROUND-3-BRIEF.md, not only in the builders: every one of the six direction specs (K1 to N2) names the care recreation as the first plate or the first proof. The round converged on one picture because the brief told it to. Round 4 must assign a different lead plate to each new direction (section "Round 4 plan").

### (b) Five of six read pale

Confirmed and measured (`chroma.mjs`, desktop first screen at 1440 × 900):

| Draft | Chromatic pixels, whole screen | Chromatic pixels outside the plates |
| --- | --- | --- |
| year-stack | 37.3% | 47.4% |
| pinned-decisions | 0.8% | 0.5% |
| same-behaviour | 0.8% | 0.0% |
| statement-of-record | 0.7% | 0.6% |
| workspace-rail | 0.4% | 0.0% |
| proven-cv | 0.4% | 0.1% |

Five drafts put their accent on 11 px ids, 1 px hairlines, a 12 px check or a 20 px marker. That is an accent with no area. The owner asked for catchy colour; only year-stack's butter panel answers, and it is the draft that scores highest on hooks. Round 4 rule: an accent needs an area on the first screen (a panel, a band, a plate ground), and the builder reports the chroma number.

### (c) Scroll motion: familiar patterns or meaningful?

Partly confirmed.

- S1 sticky stack (pinned-decisions, year-stack): familiar, and its meaning is inverted. The canon says "the newer card covers the older one; the stack is the log". Both pages run newest first, so the older card covers the newer one (`pinned-decisions/d-scroll-356.png`: 0009 covers 0010; `year-stack/d-s1-y470.png`: 2025 covers 2026). The scale to 0.96 and the dim are decoration on top of native scroll. What the stack really means on these pages is "you have read this one", which the current-row colour in the log already says.
- S3 statement into header (statement-of-record `d-s3-y240.png`): meaningful. The claim stays while the proofs pass and the cite of the current card lights.
- S6 correction when the card is current (statement-of-record `d-0009-130ms`, `d-0009-400ms`; year-stack `d-rw2025-130ms`, `-330ms`, `-470ms`): meaningful. The problem becomes its result at reading position. The year-stack rewrite is the one scroll-driven moment in the round that explains something a visitor did not know (who he was in that year).
- S4 header swap (workspace-rail `d-08`, `d-09`): meaningful (position is the workspace), but it is the standard sticky-header pattern and a visitor reads it as navigation chrome.
- S2 pinned plate with hairlines (workspace-rail, proven-cv): meaningful only when the line ends inside the proof. In proven-cv every hairline is an 80 px line to the card's border (`d-top.png`, `d-scrollY480.png`); in workspace-rail two of the Vianova lines end at the plate's edge (`d-06-hairline-end.png`). A line to a border explains nothing.

## pinned-decisions

Strongest idea, keep it: the first screen. One identity line, the log of ten with a Result in mono under each, and the open 0010 card with its hairline already drawn from "Switch the organization: the data changes, the controls stay." to the organization switcher (`d-top.png`). A visitor reads who, what, level and five results before scrolling. The log reads the scroll (`d-scroll-356.png`: 0010 recedes, 0009 is current in the log). The phone first screen shows the plate with a numbered marker on the switcher and the same caption (`m-top.png`).

Defects:

1. Three of ten cards have no screen (0009, 0004, 0001). Each is a 540 px grey plate with three sentences and empty space (`d-ride-end.png`, `d-end.png`). The brief's big card is "a plate plus one line"; a record without a plate is a big empty card. 0001 closes the page on the emptiest one.
2. The number ride does not leave its source cleanly. At 150 ms the 160 px "16" ghost still sits on the source position over the mono label "queries", whose letters show around the digits (`d-ride-150ms.png`). At the end both 16 and 2 are shown (`d-ride-end.png`), so the number was copied, not moved; the ride then reads as a count-down animation, which is what round 2 asked to fix.
3. The studio KB ride leaves a hole. While "972 KB" rides, the sentence reads "Images [150 px gap] , the deploy 28 MB → 9.5 MB" (`d-line-ride-150ms.png`, `d-line-ride-300ms.png`). The ghost arcs over the arrow glyph and touches it. The sentence must stay intact; a copy rides.
4. S1 order is inverted (see (c)). The covered card recedes to 0.96 and dims, which says "older", but it is the newer decision.
5. Harmony: the chalk ground and cobalt carry 0.5% of the first screen; the beige Snaxx illustration (`d-line-ride-150ms.png`), the pink Offday screen (`d-hair-end.png`) and the dark Bayyinah plates bring four palettes. The page's own colour is not visible beside them.
6. The 0007 hairline routes down the plate's left edge, through the sidebar, to the "Studio" workspace chip (`d-hair-end.png`): it ends at a pixel, which is right, but it runs over the sidebar's icon column on the way.

Motion evidence is real: stack at 356/499/787, ride at 150/300/end, hairline at 30/60/end, keyboard jump (`d-key-arrowdown-060ms.png`: focus ring, no travel), reduced motion (`d-reduced-499.png`: sticky kept, no scale). Chart draws once on mount (`d-load-0200ms.png`).

Carry forward: yes, as the proven first screen and the pin. The stack and the record-only cards do not.

## statement-of-record

Strongest idea, keep it: the page is a document that cites itself and corrects itself as it is read. The three-clause statement in Literata with the cites in the margin, then the first record already corrected on the first screen: "The care platform moves to React ~~and no screen may change its behaviour.~~ one route at a time, each after a parity test on both apps." (`d-top.png`). On scroll the statement becomes a one-line header with the current cite lit and a tally "1 of 6 corrected" (`d-s3-y240.png`). The strike is word by word and the write-in is a clip (`d-load-0010-130ms.png`, `-420ms.png`; `d-0009-130ms.png`, `-400ms.png`). Reduced motion marks the constraint with a dotted underline and switches state (`d-reduced-y400.png`). Mint and forest with the teal care plate is the most cohesive chrome of the six. The phone first screen holds the statement, the corrected sentence and the whole plate (`m-top.png`). The record index of ten with results closes the page (`d-bottom.png`).

Defects:

1. Two cards have no plate and leave a void. 0009 (billing report) is a sentence followed by about 200 px of nothing before 0008 (`d-0009-400ms.png`, y 420 to 600). 0001 is the same. The reserved plate slot is empty.
2. The strike overshoots a line end by about 0.28 em: "and no screen may change its —" runs into the margin (`d-top.png`), "972 KB of images and a 28 MB —" the same (`d-0006.png`). The builder knows; it is still in the final frames.
3. The Viva Fresh plate is three phone frames on red tiles inside a white plate (`d-0002-phones.png`): the device-frame marker and an inner band, both on the round-2 rule list.
4. The phone record index wraps names into two lines ("Bayyinah / TV", "Care / platform") because the mono result takes 60% of the row (`m-bottom.png`).
5. The desktop first screen cuts the care chart at the fold at the 90 line (`d-top.png`): the statement takes four lines at 48 px, so the plate does not end on a whole row inside 900 px.
6. Two underline devices on one sentence: a solid underline for the cited words ("Laravel API") and a dotted one for the constraint (`d-reduced-y400.png`). They read as two kinds of link.
7. The statement names only the care platform; the first mobile card is 0002, near the end. The identity line says less than the record does.

Carry forward: yes, as a polish-track draft.

## year-stack

Strongest idea, keep it: the scroll is time and the sentence at the top rewrites itself to that year. "Gentrit Rashiti builds / ~~a multi-tenant platform,~~ Next.js web apps, / ~~from the design system~~ from an institute's website / ~~to the API behind it.~~ to a member portal." (`d-rw2025-470ms.png`). The 2026 words stay struck beside each year's words, so the present is always on screen. The rewrite fires once per settled year (160 ms after the scroll stops, `Draft.tsx` SETTLE_MS) and the mid-frames prove the fade-then-write rule (`d-rw2025-130ms.png`: struck, nothing written; `-330ms`: writing; `d-rw2024-write-150ms.png`). The butter panel is the current year and moves down the page with the reader; it is the only committed colour decision in the round (37% chromatic first screen). The 160 px numerals in Gentrit Text 800 and the navy are one hand. Six year links jump with no travel (`d-key-right-120ms.png`). The phone first screen shows the numeral, the plate and the first result with its hairline (`m-top.png`).

Defects:

1. The first screen carries the most elements of the six: a four-line statement, six year links, two more links, a 160 px numeral, four decisions in eight lines, the plate, the hairline, a caption and a link (`d-top.png`). The brief asked for three clauses on one or two lines and two to four decisions; 2026 has four.
2. Two plates do not end on a whole row: the 2025 bayyinah.org plate cuts a row of photo thumbnails (`d-rw2025-470ms.png`, y 600 to 628); the 2023 pricing plate cuts "Frequently Asked Questions" (`d-y1848-2023.png`).
3. The 2021 plate is three store tiles with phone frames (`d-y3080-2021.png`), the device marker again.
4. S1 order is inverted: 2025 covers 2026 and 2026 dims (`d-s1-y470.png`). On a page that runs newest first, the cover-and-dim says the wrong thing.
5. The phone statement drops the struck 2026 words and shows plain year words (`m-y2025.png`), so the phone loses the hook; the desktop and phone are two different devices.
6. The first card's hairline takes three segments over the top of the plate to reach the switcher (`d-top.png`, from y 410 up to y 190 and across); the 2023 line does the same (`d-y1848-2023.png`). A route through the gap between the text column and the plate is shorter and does not cross the plate's top edge.
7. Mid-write frames show a clipped glyph at the clip edge ("Next.js we", `d-s1-y470.png`). This is the clip write-in, which the canon allows, but the clip should sit on a word boundary at the sampled 40% and 70% times.

Carry forward: yes, as the first polish-track draft.

## workspace-rail

Strongest idea, keep it: the section header is the workspace switcher and scroll swaps it (`d-08-header-swap-agency-minus28.png`, `d-09`). The switcher is a real control with periods and counts (`d-19-switcher-open.png`), Cmd+K opens it, and a search that finds nothing in Vianova offers "Found in Agency work · 8, Personal · 2" (`d-22-search-found-elsewhere.png`). After the organization switch the ring follows the switcher without a redraw (`d-24-org-switch-wire-follows.png`). Each section opens with one claim it can prove ("A care platform, rebuilt one route at a time.", "Three apps in both stores.").

Defects:

1. Two hairlines end at nothing. The "4 languages" row draws to the plate's right edge, mid-chart, where no part proves four languages (`d-05-hairline-draw-130ms.png`, `d-06-hairline-end.png`). The Incentiv ring sits in empty space to the right of "WalletConnect" (`d-14-incentiv.png`). On the phone the ring sits above the Dukagjini tile in the grey band (`m-05-ring-duka.png`).
2. One hairline runs up under the sticky header and is cut (`d-11-over-route-draw-126ms.png`, the line leaves the frame at y 65).
3. Rows hold at fixed stations, so the column has uneven gaps: 91 px then 164 px between rows (`d-03-scrollY480.png`), and the end of row 1's caption touches row 2 during a swap (`d-02-scrollY240.png`). It reads as jitter.
4. The frame is the SaaS shell: chip, search field, identity in the header's right corner, a sticky screen and a text column (`d-01-top.png`). The builder's original 6 is right.
5. The Agency plate is three store screenshots, two with phone frames, on a grey inner band (`d-09-header-swap-agency-0.png`).
6. The role line "Frontend and mobile, full stack since 2026 · 2023–26" sits 250 px under the identity line "Gentrit Rashiti builds web and mobile products, 5+ years." on the first screen (`d-01-top.png`, `m-01-top.png`): identity twice.
7. Chroma 0.0% outside the plate: the tints are a 12 px chip and 8 px dots.

Carry forward: the header-swap and the found-elsewhere search as behaviours. Not the frame.

## same-behaviour

Strongest idea, keep it: the same screen twice, and one control changes both. The 2023 skin (square chips, uppercase labels, straight lines with point markers, a dashed limit) beside the 2026 skin (pills, a smooth line in a band), one component mounted twice (`Plate.tsx` data-era). "Open alert" is the proof moment: the alert is an inline banner on the left and a popover on the right, and the check says both reached the same state (`d-check-at-200ms-plus-60ms.png`). The cross-fade touches only the changed parts (`d-org-040ms.png`: ghost lines under new lines; `d-unit-120ms.png`). The phone first screen holds both plates and the sticky control row (`m-top.png`), the best phone composition of the round.

Defects:

1. The check cannot fail. Both plates read one state, so "same behaviour ✓" is a demonstration, not a test; a technical visitor discounts it in two seconds. The builder's holdback says the same.
2. Cross-fading labels of different length garbles them: the switcher reads "NHarbor Healthc" while "Northwind Clinic" fades out under "Harbor Health" (`d-reduced-org-060ms.png`). The canon allows the 120 ms cross-fade under reduced motion; the overlap is the defect. Swap text of different length; cross-fade only equal-length text or the whole chip.
3. The headline is the slop-marker sentence with a verb attached: "Gentrit Rashiti, web and mobile developer for 5+ years, is moving a live care platform…" (`d-top.png`). Under the case block the mono line "Frontend and mobile, full stack since 2026 · 2023–26" repeats it (`d-scroll-840.png`).
4. Below the pair the page is a conventional case block and a five-row list with 48 px thumbnails and feature lines ("Full Nuxt 3 rebuild: live streams, subscriptions, English/Arabic, 34 routes") (`d-scroll-840.png`, `d-scroll-1700.png`). Seniority rests on one case.
5. Three outlined buttons where the brief asked for text controls (`d-top.png`); on the phone they become a bottom bar of three outlined buttons (`m-top.png`).
6. Chroma 0.0% outside the plates. The only colour is the plates' own cobalt and the 12 px green check.

Carry forward: the paired plate as a proof device, for a round-4 direction that can fail or that compares two real organizations.

## proven-cv

Strongest idea, keep it: the CV as real text with a numbered marker at the end of each claim line and one proof open at load (`d-top.png`). The CV copy is the most honest of the round ("Teammates built the wallet layer", "in a small team", lines with no marker have no proof). The proof swaps at reading speed as the marker crosses the pin line (`d-scrollY120-hairline-and-crossfade-60ms.png`, `d-scrollY240.png`, `d-scrollY480.png`), the first card arrives once with a clip reveal (`d-reveal-240ms.png`), keyboard activation jumps (`d-keyboard-tab-enter-07.png`), and the phone opens the proof under its own line (`m-top.png`, `m-open04-clip-50ms.png`).

Defects:

1. Every hairline is an 80 px line from the marker to the card's left border, ending in a dot on the border (`d-top.png`, `d-scrollY480.png`, `d-scrollY900.png`). It never reaches the pixel the claim is about. The pointer device of margin-notes is reduced to a connector.
2. The care plate in a 560 px card squeezes the chart to a 60 px band (`d-top.png`): the proof is a thumbnail of a chart, not a screen.
3. Four of the twelve proofs are three phone frames on coloured tiles in a grey band (`d-scrollY480.png` Bayyinah, `d-scrollY900.png` Viva Fresh, `d-keyboard-tab-enter-07.png` Dukagjini): device frames and inner bands.
4. The frame is text left, sticky preview right: the orbit-index and strike-index skeleton. The builder's 6 is right.
5. The Skills block is a technology list ("React, Next.js, Vue, Nuxt, TypeScript, Tailwind…", `d-scrollYend.png`, `m-end.png`). The bar says "not a list of technologies"; a CV has skills, but on the home page it is the list the bar forbids.
6. After the first proof, the phone is text only until the visitor taps (`m-scrollY1500.png`), as the holdback admits.
7. Chroma 0.1% outside the plate. The signal red is 20 px markers; the Viva Fresh and Bayyinah reds in the plates are louder than the page's own red.

Carry forward: the honest CV copy and the "a line with no marker has no proof" rule. Not the frame.

## Slop count (CREATIVE-CONSULT §1.2)

- pinned-decisions: none. Count 0.
- statement-of-record: three phone frames on tiles (0.5). Count 0.5.
- year-stack: store phone tiles (0.5). Count 0.5.
- workspace-rail: chip plus search bar as the first element, the SaaS costume (0.5); store phone tiles (0.5). Count 1.
- same-behaviour: the "web and mobile developer for 5+ years" sentence as the headline (0.5); the same fact as a mono role line (0.5). Count 1.
- proven-cv: phone frames in four proofs (0.5); a technology list (0.5). Count 1.

None reaches three. New this round: the "Frontend and mobile, full stack since 2026" fact survives as the per-card role line on five of six pages. The card spec asked for "role and year in mono", and the builders used this sentence as the role. It is a role only when it is short ("Frontend · 2026").

## Motion checks against emil-design-eng

- Durations: pinned-decisions hairline 180 ms, ride 460 ms (explanatory), stack scroll-linked; statement-of-record strike 260 ms, write-in 340 ms after 220 ms, header over 160 to 320 px of scroll; year-stack strike 260, write 320, leaving fade 120, settle 160 ms; workspace-rail hairline 180 ms in three segments, ring 120 ms, previous line out in 120 ms; same-behaviour cross-fade 200 ms, check out 80 ms and in 120 ms; proven-cv reveal 600 ms once, hairline 180, swap 120, phone clip 200. All inside the canon. The year-stack settle delay (160 ms) is the right choice: no rewrite fires for a card that is only passed.
- Keyboard: every draft changes state with no travel, proven by a frame (`pinned-decisions/d-key-arrowdown-060ms`, `year-stack/d-key-right-120ms`, `workspace-rail/d-21-keyboard-jump-incentiv`, `same-behaviour/d-keyboard-focus`, `proven-cv/d-keyboard-tab-enter-07`, `statement-of-record/d-key-enter-0009-30ms`).
- Reduced motion: all six captured an end state. same-behaviour keeps the 120 ms cross-fade, which the canon allows; its label overlap is a defect in both modes.
- Loops: none. The shared care chart draws 1.1 s once on mount in every draft (`pinned-decisions/d-load-0200ms`, `statement-of-record/d-load-0010-130ms`, `proven-cv/d-reveal-240ms`); no draft remounts it on a state change (same-behaviour and workspace-rail switch the organization in place).
- Hover: no draft starts an explanatory animation on hover this round. Correct.
- Mid-frame rule: every claimed motion has a real mid-frame this round. No file named by a time equals its end state.

## Ranking, round 3

1. year-stack (54). The only committed colour; the one scroll motion that explains; the best hook. Needs a calmer first screen, whole-row plates, the same device on the phone.
2. statement-of-record (53). The most cohesive chrome and the cleanest correction evidence. Needs the two empty cards filled, the strike clipped, the phone frames out.
3. pinned-decisions (52). The best first screen of the round, equal to decision-record. Three empty cards and two ride defects hold it at its parent's score.
4. same-behaviour (51). The best phone first screen and a real new device. The check cannot fail; the page under it is a template.
5. workspace-rail (49). The best behaviours (swap, found elsewhere). The frame is a SaaS shell and two pointers point at nothing.
6. proven-cv (49). The best copy. The pointer is a connector to a border.

## Combined ranking, rounds 1 to 3 (16 drafts)

Ties are broken by slop count, then by whether the phone first screen shows work. A round-3 combination that contains a parent's parts ranks above the parent at the same score.

| Rank | Draft | Round | Total | Slop | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | year-stack | 3 | 54 | 0.5 | polish track |
| 2 | statement-of-record | 3 | 53 | 0.5 | polish track |
| 3 | pinned-decisions | 3 | 52 | 0 | parts live in round 4 (first screen, pin) |
| 4 | decision-record | 2 | 52 | 0 | superseded by pinned-decisions and statement-of-record; stop |
| 5 | changelog | 1 | 52 | 1.5 | stopped in round 2 |
| 6 | same-behaviour | 3 | 51 | 1 | device only |
| 7 | margin-notes | 2 | 51 | 1 | superseded by the pin in round 3; stop |
| 8 | brief | 1 | 51 | 0.5 | stopped in round 2 |
| 9 | release-brief | 2 | 50 | 1 | parts only |
| 10 | workspace-rail | 3 | 49 | 1 | behaviours only |
| 11 | proven-cv | 3 | 49 | 1 | copy only |
| 12 | strike-index | 2 | 47 | 0.5 | rule only |
| 13 | cited-claims | 2 | 46 | 0.5 | device only |
| 14 | tenant-switch | 2 | 46 | 1 | behaviour only |
| 15 | specimen | 1 | 46 | 1.5 | stop |
| 16 | orbit-index | 1 | 46 | 2 | stop |

Live drafts after round 3: year-stack and statement-of-record. decision-record and margin-notes stop; their parts are inside the three round-3 combinations.

The convergence target was 63. The best combination reached 54. The gap is unchanged in its shape: original (best 7), hooks (best 8 once), not overwhelming (best 8). Combinations of proven parts raised the floor (every round-3 draft is 49 or more; round 2's floor was 46) but not the ceiling, because every combination kept the same lead plate, the same pale ground and the same master-detail or stack frame. The ceiling moves only with a bolder lead and a colour with area.

## Polish track

### year-stack, 54 → expected 57 after one pass

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 8 | 7 | 8 | 8 | 8 | 7 | 8 | 54 | — | first-screen load; plates cut mid-row; store phone tiles; S1 inverted; phone statement plain; hairline over the plate |
| 4 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Calm (+1). Cut the first screen to: the statement on three lines (one clause per line, "Gentrit Rashiti builds" as the first), the numeral, three decisions on the 2026 card (merge "Rework a billing report" into the API clause or move it to the record), the plate, one hairline. Move the six year links into the sticky statement row at 14 px mono, right-aligned, and drop "Email · CV" from the first screen to the footer. Evidence to beat: `d-top.png` has eleven element groups.
2. Harmony and the round-2 rules (+1 total with item 3). Plates end on a whole row: crop the 2025 bayyinah.org plate above the thumbnail row (`d-rw2025-470ms.png`) and the 2023 pricing plate above "Frequently Asked Questions" (`d-y1848-2023.png`).
3. Replace the 2021 three-tile store plate with one listing image at its native ratio, no phone frame (`d-y3080-2021.png`).
4. Hooks on the phone (+1 on the phone read, 0 to +1 on the score). Give the phone statement the same device as the desktop: two lines at 20 px, 2026 words struck, year words written in (`m-y2025.png` shows plain text today). If two lines cannot hold both, strike only the first clause on the phone and write the other two plain.
5. Motion (0, removes a finding). Make the S1 cover honest on a newest-first page: keep sticky, keep the butter move, drop the 0.96 scale and the 0.6 dim on the covered card (`d-s1-y470.png`). The butter panel already says which year is current.
6. Route each first-result hairline through the gap between the text column and the plate, into the plate from its left edge, and end at the control (`d-top.png`, `d-y1848-2023.png`). Three segments over the plate's top edge is the long way.
7. Sample the write-in clip at a word boundary at 40% and 70% (`d-s1-y470.png` "Next.js we") or shorten the stagger so the sampled frames land between words.

### statement-of-record, 53 → expected 56 after one pass

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 8 | 8 | 7 | 8 | 8 | 7 | 7 | 53 | — | 0009 and 0001 voids; strike overshoot; Viva Fresh phone frames; phone index wraps; chart cut at the fold; two underline styles; statement names only the care platform |
| 4 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). Fill the two plate-less cards or remove their plate slot. 0009: a number plate at the surface colour with "16 → 2" in Literata at 160 px and "queries" in mono, the same height as the other plates. 0001: the doc-chat recreation if it fits the chatbot runtime, else no slot and the next card follows at the normal gap (`d-0009-400ms.png`, y 420 to 600).
2. Replace the Viva Fresh three-phone plate with one store image at native ratio, no frame (`d-0002-phones.png`).
3. Point and calm (+1 together with item 4). Set the statement on three lines, 44 px: "Gentrit Rashiti builds a multi-tenant care platform, / from the design system / to the API behind it." so the first plate ends on a whole row inside 900 px (`d-top.png` cuts the chart at the 90 line).
4. Rewrite clause three or add a fourth cite so the statement reaches mobile work: "…to the API behind it, and to the apps in both stores. ↳0002". Then the identity line covers web and mobile and 0002 is cited from the first screen.
5. Motion (0, removes a finding). Clip the strike to the word box; no stroke past the last glyph on a line (`d-top.png` "its —", `d-0006.png` "28 MB —").
6. Keep one underline device: the dotted underline marks the constraint; the cited words get the accent colour, not a second underline (`d-reduced-y400.png`).
7. Phone record index: stack the mono result under the name at 375 px (`m-bottom.png` "Bayyinah / TV").

## Round 4 plan

Six entries: two polish entries and four new combinations. Every new combination answers (a) and (b): none opens on the care plate, and each has an accent with area, with the first-screen chroma number reported in the builder's meta.json. Fonts are from public/fonts and public/fonts/creative with the family names in SOURCES.md. Contrast is measured (`scratchpad/contrast.mjs`).

### P1. `year-stack` (polish, list above)

### P2. `statement-of-record` (polish, list above)

### C5. `rebuilt-twice` (combination)

- Hook: "Two platform rewrites." The one claim a visitor remembers, and the two screens that prove it, in the order they happened.
- Combines: cited-claims' claim line (now 72 px, the identity is a footnote under it); year-stack's committed panel; statement-of-record's S6 correction under each card; pinned-decisions' one pin per card; the record of ten from decision-record as the closing index.
- First screen leads with: the `live-room` recreation (Bayyinah TV, the 2023 rebuild) as a 1200 × 600 plate on the oxblood panel. The care card is second. The page runs oldest to newest, so the S1 cover (newer over older) is true for once.
- Palette, cream and oxblood: ground #FBF3E6, ink #1C1412 (16.5:1 on cream), panel oxblood #8C1D18 with cream type (8.3:1), oxblood as the only accent on cream (8.3:1). The panel is the current card's ground, as year-stack's butter is, so the first screen is more than 40% chromatic.
- Type: Fraunces (Fraunces-Latin.woff2, `opsz` auto, 600 at 72 px for the claim, 400 at 17 px for text) and Martian Mono (public/fonts/MartianMono.woff2, ids and results). Two faces.
- Motion: S1 with two cards; S3 claim into a one-line header with two cites; S6 correction when the card is current ("Rebuild the video platform ~~from an empty template~~: 34 routes, 270+ components"; "The care platform moves to React ~~and no screen may change~~ one route at a time, parity-tested"). One hairline per card. Nothing else.
- Phone: the live-room plate at 343 × 258 and its corrected sentence in the first screen.
- Risk: two cards is a short page. The closing record of ten carries the rest; no third big card.

### C6. `token-source` (combination)

- Hook: one token source builds this page too. The design-system plate is the hero, and the page's own chrome is drawn from the tokens the plate shows; flip the plate's Light/Dark control and the page's cards follow while the controls stay.
- Combines: margin-notes' note that reads the screen ("border.focus → cobalt.500 → this outline" names the token the page uses, and updates on the flip); workspace-rail's S2 pinned plate with passing rows; decision-record's results; pinned-decisions' first-screen hairline already drawn at load.
- First screen leads with: the `design-system` recreation (Specimen, invented kit) at 1200 × 600 on a full-bleed cobalt band. Then three big cards (care, Bayyinah, the store apps) as S1, each a screenshot or recreation.
- Palette, cobalt field: ground #FFFFFF, ink #10131A (18.6:1), band cobalt #1B3FD6 with white type (7.7:1), cobalt as the only accent on white (7.7:1), tint #E4E9FF for the note surface with ink (15.4:1). The band is the first screen's top 60%.
- Type: Gentrit Display (GentritDisplay-Latin.woff2, `font-stretch: 112%`, 700 at 56 px for the claim) and JetBrains Mono (ids, token names, results). Two faces.
- Motion: S2: the plate pins while four design-system decisions pass (36 components, 805 tokens, 20 releases, contrast checked in both themes), each hairline to the token row it names, 180 ms, ending inside the plate. The theme flip is a 200 ms cross-fade of surfaces only; text does not cross-fade. Then S1 for the three cards. Reduced motion: the flip switches state.
- Phone: the specimen plate first, 343 × 258, with the Light/Dark control inside it reachable at 44 px; the note under it.
- Risk: the flip must not remount the plate or the care chart below it. Mount once; theme by a data attribute on the draft root.

### C7. `both-stores` (combination)

- Hook: three apps in both stores, and the count is live. The claim "about 14 releases" is counted from the cards as they pass.
- Combines: workspace-rail's claim per section; cited-claims' live count; strike-index's rule that an upgrade is not a strike (the React Native 0.63 → 0.81 line stays plain); pinned-decisions' pin (the push notification line points at the book row it opens); year-stack's panel.
- First screen leads with: the `reader` recreation (Read to Feed) as a 560 × 672 (5:6) card beside the claim at 96 px, on a mustard field. No care plate on the page; the care platform is one row in the closing record.
- Palette, mustard and ink: field #F2B705 with ink #161616 (10.0:1) and muted #3A2E06 (7.3:1); cards #FFFFFF with ink; no second hue, the store listings bring their own inside their borders. The field is the whole first screen, so chroma is above 60%.
- Type: Archivo (public/fonts/Archivo.woff2, variable: `font-weight: 100 900`, `font-stretch: 62% 125%`, as declared in src/drafts/lab/moves/12-width.css; width 125% and 800 for the claim and the count, width 100% and 400 at 17 px for text) and Martian Mono. Two faces.
- Motion: S1 with three app cards in year order (Dukagjini 2021, Read to Feed 2022, Viva Fresh 2023), so the newer covers the older; the count in the sticky claim increments when a card becomes current (120 ms, no travel); one pin per card; no correction. Reduced motion: the count switches.
- Phone: the reader plate at 343 × 410 in the first screen with the claim above it at 40 px.
- Risk: store screenshots with phone frames. Rule: one listing image per card at native ratio, cropped to the screen, never three tiles.

### C8. `added-clauses` (bold new, from year-stack's rewrite)

- Hook: the identity sentence is earned on the way down. The page opens on "Gentrit Rashiti builds mobile apps." at 96 px and each year adds a clause: ", and web platforms" (2023), ", with a design system" (2026), ", and the API behind them." (2026). No strike; the edit ends the sentence and its space is reserved (strike-index's rule). The sentence a visitor reads at the end is the identity line, and they watched it grow.
- Combines: year-stack's statement rewrite and S1 (now in true order, oldest first); release-brief's one-line rule; decision-record's results on each card; pinned-decisions' one pin per card.
- First screen leads with: the sentence alone on the upper half, the 2021 Dukagjini card's plate (one listing image, no frame) on the lower half, on a plum panel. The care plate arrives on the 2026 card, last.
- Palette, apricot and plum: ground #F6DCC3, ink plum #35183F (11.8:1), panel plum with apricot type (11.8:1), muted #5E3C6B (6.8:1). The panel is the current card's ground.
- Type: Newsreader (Newsreader-Latin.woff2, 500 at 96 px for the sentence with `letter-spacing: -0.02em`; no italic) and JetBrains Mono. Two faces.
- Motion: S3 the sentence into a sticky one-line header after 320 px; the clause addition fires once per settled year (160 ms settle, write-in 320 ms clip ending on a word); S1 with the newer card covering the older; one hairline per card. Reduced motion: the clause appears.
- Phone: the sentence at 32 px and the 2021 plate at 343 × 258 in the first screen.
- Risk: the strongest work is last. Mitigation: the header's year rail shows 2026 is five cards down and the record of ten under the last card closes the page. If the round-4 review finds the first screen too weak, the direction stops and the additive sentence moves into year-stack.

## Rules for round 4 builders (new, from this round's evidence)

- The first plate is not the care recreation unless the direction's hook is the care platform. Six of six opened on Patient 4821 (`thumbs3/sheet.png`).
- An accent needs an area. Report the first-screen chroma number in meta.json (`chroma.mjs` or an equivalent count). Five of six drafts were under 1% (`d-top` frames); the brief for round 4 asks for 25% or more outside the plates.
- A big card has a plate. A decision with no screen becomes a number plate at the same height, or a row in the record. Never a 540 px card with three sentences (`pinned-decisions/d-end.png`, `statement-of-record/d-0009-400ms.png`).
- S1 order must be true. The card that covers is the newer one. On a newest-first page, sticky stays and the cover is not animated (`pinned-decisions/d-scroll-356.png`, `year-stack/d-s1-y470.png`).
- A hairline ends inside the proof, at the pixel, never at a card border or a plate edge (`proven-cv/d-top.png`, `workspace-rail/d-06-hairline-end.png`, `m-05-ring-duka.png`).
- A number that rides keeps the sentence intact. The source label hides with the source digits; a copy rides; the sentence never shows a hole (`pinned-decisions/d-ride-150ms.png`, `d-line-ride-150ms.png`).
- Cross-fade only text of equal length. Text of different length swaps (`same-behaviour/d-reduced-org-060ms.png` "NHarbor Healthc").
- A plate ends on a whole row. Crop above the cut row (`year-stack/d-rw2025-470ms.png`, `d-y1848-2023.png`).
- A store listing is one image at native ratio, cropped to the screen. Never three tiles with phone frames (`year-stack/d-y3080-2021.png`, `statement-of-record/d-0002-phones.png`, `workspace-rail/d-09-header-swap-agency-0.png`, `proven-cv/d-scrollY480.png`).
- The role line is short: "Frontend · 2026". "Frontend and mobile, full stack since 2026" is the identity line, and it appears once per page (`workspace-rail/d-01-top.png`, `same-behaviour/d-scroll-840.png`).
- Rows scroll; the pin line decides which one is current. No fixed stations (`workspace-rail/d-03-scrollY480.png`).
- The shared care recreation wraps its footer at 343 px ("Timezone: patient local (UTC-5)" over three or four lines; the "Care manager" chip over two) in every phone frame of the round (`pinned-decisions/m-top.png`, `year-stack/m-top.png`, `statement-of-record/m-top.png`). This is a coordinator fix in `src/worlds/healthcare/Recreation.tsx` or a draft-level rule to hide the footer under 400 px, not a per-draft patch.
- Keep the mid-frame rule and the keyboard-jump frame. This round met both; keep it that way.
