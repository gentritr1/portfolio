# Loop 2 review: release-brief, strike-index, cited-claims, decision-record, margin-notes, tenant-switch

Reviewer: independent, built none of these. Judged from the PNG captures (final/ and r*/, including the mid-animation frames) and the draft source. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Builders' self-scores are in brackets.

Evidence read: `review/loop2/<id>/final/` and the r*/ frames, `src/drafts/<id>/` (motion code, meta.json), `src/worlds/healthcare/Recreation.tsx` (the shared care chart), LOOP-BRIEF.md with the round-1 rules, round-1-review.md, CREATIVE-CONSULT §1.2, emil-design-eng SKILL.md.

Round-1 rules, checked: every draft now has a mid-animation frame for its claimed motion. Every draft is on a light ground. Nobody put a strike on a sentence without a constraint. Every phone first screen shows work. Builders scored "original" honestly this time (5 to 6); they still over-score "not overwhelming" by about one point.

## Scores

| Point | release-brief | strike-index | cited-claims | decision-record | margin-notes | tenant-switch |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Straight to the point | 8 [8] | 8 [8] | 7 [8] | 8 [8] | 8 [8] | 7 [8] |
| 2 Not overwhelming | 7 [8] | 7 [7] | 6 [7] | 8 [7] | 8 [7] | 6 [7] |
| 3 UI/UX harmony | 8 [8] | 7 [7] | 7 [7.5] | 8 [7.5] | 6 [7] | 8 [8] |
| 4 Meaningful motion | 7 [8] | 7 [7] | 7 [7] | 7 [7.5] | 8 [8] | 7 [7] |
| 5 Actions and seniority | 7 [7] | 7 [7] | 8 [7.5] | 8 [8] | 7 [7] | 7 [7] |
| 6 Original | 6 [6] | 5 [5] | 5 [5.5] | 7 [6] | 7 [6] | 5 [5] |
| 7 Hooks | 7 [7] | 6 [6] | 6 [6.5] | 6 [6] | 7 [6.5] | 6 [6] |
| Total | 50 | 47 | 46 | 52 | 51 | 46 |

## release-brief

Strongest idea, keep it: the hook is on the first screen. A vermilion handle, a red track and a six-word italic caption ("← drag to an earlier year") sit under the statement. That fixes changelog's problem 1 with no extra element. The statement with one `↳ 5.1` cite per clause is the clearest "every claim cites a plate" device of the six.

Top 3 problems:
1. Words still collide in the mid-frames. r5 d-b-480 (2024-25 to 2023, 480 ms) shows three states on one line: the 2026 strike, the leaving 4.0 clause struck and folding ("from passkey sign-i"), and the 3.0 clause writing in on top of it ("frc"). The fold in `Statement.tsx` shrinks `width` while the clause is still at full opacity until offset 0.85, so the clip cuts a word mid-glyph. The phone frame r5 m-a-600 shows "a multi" cut mid-word 600 ms in. The r3 d-drag-mid frame shows a drag across two stops firing a rewrite per stop ("to the AP|to a portal's app shell."); r4 and r5 captured no drag at all, so the drag path is not proven fixed.
2. The care chart replays its 1.1 s draw on every return to 2026 (r5 d-c-150 shows an empty chart under the finished statement). The plate remounts when the year changes. That is a decorative loop in disguise: the visitor who moves the rail twice watches the chart draw twice.
3. The identity is stated twice on the first screen: "Gentrit Rashiti · Frontend and mobile developer, full stack since 2026" in the top bar, then "Gentrit Rashiti builds…" at 48 px. The release numbers for a person ("5.0 Full stack, and a design system", "5.1 Rebuilt") stay from changelog; they sit next to the "v2.0 captions" marker. For 2023 all three clauses cite the same plate (3.1, 3.1, 3.1), so the cite rule is thin for earlier years.

Carry forward: yes, as a parts bin, not as a frame. The visible-hook caption, the statement with cites and the one-line strike are proven. The year rail and the version numbers stop here.

## strike-index

Strongest idea, keep it: the edit always ends the sentence and its space is reserved, so no other word moves. final/mid-150 (strike drawn, nothing written), mid-330 ("2 queries, no timeo" clipping in) and end prove it. This is the collision-free form of brief's strike. Corrected rows stay blue and a tally counts them, so the index records that it was read.

Top 3 problems:
1. It is a list page with a sticky preview. Statement top-left, dense index, proof right: the orbit-index skeleton on paper. The builder scored this 5 and that is right.
2. Five of twelve rows are plain and two strikes are weak: "React Native ~~0.63~~ 0.81" is an upgrade, not a problem solved; "Vue to React: ~~no behaviour may change~~ parity tests on both apps" reads as a broken sentence after the edit. The caret glyph "^" that marks a row with a constraint is unexplained.
3. The proof panel is a second design language: the care recreation sits in its dark variant on a paper page, and the "16 2" stat tile is a third device. The phone frame m-drop-60 shows an empty beige block of about 200 px before the tile paints (a layout jump). Hover triggers the strike (`onPointerEnter`); the stay-solved rule keeps it to once per row, which is the right mitigation, keep it.

Carry forward: no, not as a direction. Carry the "edit ends the sentence, space reserved, corrected rows stay" rule.

## cited-claims

Strongest idea, keep it: "Two platform rewrites." at 40 px is the most direct seniority line of the six, and the row marks the words that prove it ("now rebuilt in React with parity tests"). The highlighter wipe (r3 d-claim1-mid060, mid130) and the fold (10 of 30, then 3 of 30) are proven.

Top 3 problems:
1. The mechanism needs two sentences of instruction on the first screen: "Three claims about the work. Select one to keep only the projects that prove it." and "Keys 1 to 3 select a claim. Esc shows all 30." A page that explains its own control is not straight to the point. The preview adds "Proves: Two platform rewrites." under the plate, which repeats the claim.
2. The counts are too small to need proving. 2, 3 and 3 projects. The fold removes 27 rows to show 2 or 3; the motion empties the page. "Three mobile apps shipped to both stores" is proven by "Listed on the App Store and Google Play" twice, which is a store fact, not an action.
3. The frame is orbit-index on paper. 30 rows with group headers, mono years, a sticky preview; the "AI business dashboard" row shows "-" for its year, the same defect round 1 found. The highlighter yellow plus the dark care card plus the store screenshots is more than one accent in practice.

Carry forward: no. Carry the claim-with-cited-words device into a convergence (see round 3, C2).

## decision-record

Strongest idea, keep it: the portfolio indexed by decisions. Ten rows, each a decision in an action verb with a Result in mono ("16 → 2 queries", "36 components", "34 routes") and a scope. A visitor reads who, what, level and five problems solved in 30 seconds with no instruction text. The two-line statement at 26 px is not a giant name. White paper, Public Sans, one green, the care plate in the open record. This is the best first screen of the ten drafts across both rounds, on desktop and on the phone.

Top 3 problems:
1. The number travel has a visible defect. final/d-count-300 shows "16" and "14" drawn on top of each other at the Context position. In `Draft.tsx` the ghost's translate starts after a 140 ms delay and eases in, but `count()` runs from frame 0, so the ghost counts down while it still covers the source 16. Hide the source while the ghost travels, or start counting after the ghost has left. r4 d-key-enter also shows the care chart collapsed to a 1 px line (the 140 and 90 labels overlap); final frames do not repeat it, but it is not explained.
2. The hook is quiet. 0010 opens at load and has no number; the travel plays only when a visitor opens 0009 or 0003. The "Supersedes 0004" bracket is a 1 px line in the gutter that is easy to miss; the Result cell of 0010 says "Supersedes 0004", which is a link, not a result.
3. A Status column that reads "Accepted" in 9 of 10 rows is noise; only "Superseded" carries information. Three of the ten decisions are routine tasks dressed as decisions ("Keep upgrading React Native while the releases continue", "Maintain forks of the two reader libraries", "Keep private routes behind sign-in with route middleware").

Carry forward: yes, as the base frame for round 3.

## margin-notes

Strongest idea, keep it: no hero. The first screen is the live care recreation at 940 px with three mono notes pinned level with their targets, and a hairline that draws from the note to the pixel (final/hairline-040ms, 100ms, 200ms, end: proven, 180 ms, routed through the gutter). Note 1 reads the screen: switch the organization and it rewrites to "Now: Harbor Health → Patient 2093, UTC-8". The honest "Not on this screen" list keeps the pointer rule strict.

Top 3 problems:
1. Harmony. Each plate keeps its product palette (teal, cobalt, red on black, amber, red) beside the magenta ink; the page reads as five products with notes, not one hand. Plate 2 clips the specimen mid-card at 775 px. Plate 4 has an inner background band (x 218 to 806) that is a different cream from the plate, which reads as a layout defect, and a single phone frame that is next to the device-mockup marker.
2. Hairline routing. On plate 5 the line from note 1 runs straight through markers 2 and 3. On plate 2 markers 2 and 3 float in empty space at the edge of the tokens panel, so it is not clear what they point to.
3. No index. Five plates, five projects, no list of the other 25 and no count. "Live streams on AWS IVS", "An ISBN barcode scanner on the camera" are feature lines. The two decisions that show seniority (parity-tested rewrite, 16 to 2) sit under "Not on this screen". The d-org-switch-120ms frame is identical to the end state: the organization switch has no transition, which is fine, but the file name claims a mid-frame.

Carry forward: yes. The pinned note, the hairline, the reverse hover and the note that reads the screen move into the convergences.

## tenant-switch

Strongest idea, keep it: a product behaviour as navigation. The switcher lists five workspaces with periods and counts; the switch re-tints the shell and replaces the rows while the controls stay (final/d-switch-mid40, mid110, end: proven, 220 ms with an 18 ms stagger). "No project in Vianova matches 'react native'. Found in other workspaces: Agency work 8, Personal 2" (r4 d-filter-elsewhere) is a real tenant-scoped search and the best small idea of the six.

Top 3 problems:
1. The headline is slop marker 2 as the whole story: "Gentrit Rashiti, frontend and mobile developer, full stack since 2026. 5+ years, two platform rewrites." Under it a sentence explains the metaphor ("like each organization in the care platform he builds. Press ⌘K to switch."). The page tells what the switcher shows.
2. The first screen has the most elements of the six: top bar, headline, explainer, workspace title, role pill, description, filter, count, table header, rows, a card with Problem, Result, Role and a filled "Open the case" button, a filled "Email" button. It is a well-made SaaS admin page.
3. Original is 5, as the builder says. The surface is a template a visitor has used a hundred times. The per-tenant accent is allowed by the rule, but five tints across one page still read as five colours.

Carry forward: no, not as a direction. Carry the switcher as a scope control and the "found in other workspaces" behaviour into C3.

## Slop count (CREATIVE-CONSULT §1.2)

- release-brief: identity twice, top-bar subtitle is the "frontend and mobile, full stack" line (0.5); version captions for a person (0.5). Count 1.
- strike-index: the same subtitle under the statement (0.5). Count 0.5.
- cited-claims: the same sentence in the top bar (0.5). Count 0.5.
- decision-record: none. Count 0.
- margin-notes: the mono sub-line (0.5); one phone frame (0.5). Count 1.
- tenant-switch: the sentence is the headline (1). Count 1.

None reaches three. The "Frontend and mobile developer, full stack since 2026" line appears on five of six first screens. It is a fact, not a story. Round 3 writes it once, small, or inside a sentence that says what was built.

## Motion checks against emil-design-eng

- Durations: cited-claims fold 240 ms, margin-notes hairline 180 ms, tenant-switch switch 220 ms and keyboard 120 ms, strike-index strike 260 + 340 ms with a 220 ms delay, release-brief per change about 300 to 700 ms with a 70 ms line stagger, decision-record travel 140 + 460 ms. The last three are over the 300 ms UI budget; all three are explanatory, so they may be longer, but release-brief's fold must not show clipped glyphs on the way.
- Keyboard: every draft changes state with no travel on keys, except cited-claims, whose fold also runs on keys 1 to 3 (Emil: never animate keyboard-initiated actions) and decision-record, whose travel runs on Enter.
- Reduced motion: all six switch state with no transition. Proven by frames in release-brief (r3 d-reduced-30), cited-claims (d-reduced-stores), decision-record (m-reduced-rn), strike-index (m-reduced), tenant-switch (d-reduced-switch).
- Loops: none at rest. The shared care chart draws for 1.1 s on mount (`Recreation.tsx`, `pathLength` 1.1 s). It plays once in decision-record, margin-notes and tenant-switch; release-brief remounts it on every year change.
- Hover: strike-index strikes on hover, once per row. tenant-switch and margin-notes use hover for a 160 ms colour change only.

## Ranking, round 2

1. decision-record (52). Best first screen, best seniority, no slop. The number travel needs the source hidden; the hook needs to reach the first screen.
2. margin-notes (51). Best motion and the only draft with no hero at all. Needs one hand across the plates and an index.
3. release-brief (50). Best hook caption and cite device. The fold still clips words; the chart replays; the version numbers remain.
4. strike-index (47). Best strike mechanics. A known frame.
5. cited-claims (46). Best claim line. Needs instruction text, counts are too small.
6. tenant-switch (46). Best product behaviour. A SaaS page.

## Combined ranking, rounds 1 and 2 (10 drafts)

Ties are broken by slop count, then by whether the phone first screen shows work.

| Rank | Draft | Round | Total | Slop | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | decision-record | 2 | 52 | 0 | base frame for round 3 |
| 2 | changelog | 1 | 52 | 1.5 | superseded by release-brief; stop |
| 3 | margin-notes | 2 | 51 | 1 | evidence device for round 3 |
| 4 | brief | 1 | 51 | 0.5 | superseded by strike-index mechanics; stop |
| 5 | release-brief | 2 | 50 | 1 | parts only |
| 6 | strike-index | 2 | 47 | 0.5 | rule only |
| 7 | cited-claims | 2 | 46 | 0.5 | device only |
| 8 | tenant-switch | 2 | 46 | 1 | behaviour only |
| 9 | specimen | 1 | 46 | 1.5 | stop |
| 10 | orbit-index | 1 | 46 | 2 | stop |

Live drafts after round 2: decision-record and margin-notes. changelog and brief stop: their proven parts now live in release-brief and strike-index, and both of those are harvested below.

## Round 3 plan: six directions

Convergence first. Each convergence combines at most two proven ideas plus one proven device, so that the page keeps one idea. Every direction: light ground, one accent, one identity line, no instruction text, the phone first screen shows work.

### Convergence

**C1. `pinned-decisions`** (decision-record frame + margin-notes evidence)
- Idea: the decision log is the index; the open record's evidence is the live screen; the Consequence sentence is pinned to the pixel that proves it.
- First screen, desktop: the one-line statement (26 px), the log of ten at left (id, decision, Result in mono; no Status column; "Superseded" shown only on 0004 with the gutter bracket), the open 0010 at right: Context, Decision, Consequence, then the care recreation. A hairline is already drawn from the Consequence ("A route moves over only after its parity tests…") to the organization switcher, with the caption "Switch the organization: the data changes, the controls stay." Phone: the statement, 0010 open, the plate with one numbered marker, the log below.
- The one motion: open a record and a hairline draws (180 ms) from the Consequence to the part of the screen that proves it. When the Consequence is a number, the number rides the hairline and counts (16 to 2); the source number is hidden while the ghost travels. Keys change state with no travel.
- Type and colour: Public Sans, JetBrains Mono for ids and numbers, white paper, one green used for the hairline, the marker and the outline; no other green. The plates keep their product palette inside their border only.
- Why not generic: a decision log is not a project list, and every consequence points at a pixel. The hook (switch the organization) is on the first screen, pinned.
- Biggest risk: two devices on one record (hairline and number travel) feel like two motions. Rule: a record has one pin. A number rides; a sentence points. Never both.

**C2. `statement-of-record`** (release-brief statement and cites + strike-index mechanics + decision-record log)
- Idea: a three-clause statement in a serif, each clause cites a decision; the log under it reads each decision as its Context, and selecting it writes the Consequence in after the constraint. No year rail, no rewrite over time.
- First screen, desktop: "Gentrit Rashiti builds / a multi-tenant care platform, ↳ 0010 / from the design system ↳ 0008 / to the API behind it. ↳ 0009" in Newsreader at 48 px with dotted leaders; under it the ten decisions as one-line Context sentences ("One billing report runs 16 queries and times out", id, year, scope); the first row is already corrected at load ("~~16 queries and times out~~ 2 queries, no timeout") and its plate is open at right. Phone: the statement, the corrected first row, the plate.
- The one motion: strike-index's correction. Select a row: the constraint is struck (260 ms), the Consequence writes in after it (clip, 340 ms), the edit ends the sentence, space is reserved, nothing else moves, corrected rows stay, the tally counts "3 of 7 corrected". Rows with no constraint are plain. Hover corrects once per row.
- Type and colour: Newsreader roman and italic, JetBrains Mono, uncoated paper, vermilion ink for the strike and the cites.
- Why not generic: the statement is a document that cites its own decisions, and the decisions correct themselves as they are read. There is no slider, no version number, no preview column; the plate opens under the row.
- Biggest risk: the strike reads as the only idea, and a visitor who scrolls on a phone sees one correction. Mitigation: the first row corrected at load, and the tally visible on the first screen.

**C3. `workspace-log`** (tenant-switch switcher + decision-record log)
- Idea: the switcher scopes the decision log by employer or client; the shell stays. Decisions, not projects, so a workspace has three to five rows, not twelve.
- First screen, desktop: a top bar with "Vianova 4 ▾" and the search; one identity line (not the headline); the Vianova decisions (0010, 0009, 0008, 0004) with Results; the open record at right with the care plate. Phone: the top bar, the identity line, 0010 open with the plate, the other three rows.
- The one motion: the switch. Rows cross-fade (200 ms, no stagger), the accent re-tints (260 ms) on the switcher chip and the row dots only, the count rolls, focus stays. Search in a workspace that finds nothing offers "Found in Agency work 3". Keys switch with no travel.
- Type and colour: Public Sans, JetBrains Mono, white paper, neutral shell; the tenant tint only on the chip and the dots, never on buttons or links.
- Why not generic: the navigation is the thing he built, and what it navigates is decisions. The explainer sentence is cut; the switcher's own list ("Vianova 2021–now 4 · Agency work 2021–26 3 · Personal 2") says it.
- Biggest risk: the SaaS costume. If the filled buttons, the breadcrumb and the card chrome return, the page is tenant-switch again. Rule: no filled button, no card border, no breadcrumb; the top bar is one row with the switcher and four text links.

**C4. `evidence-first`** (margin-notes screen-first + decision-record notes)
- Idea: the inverse of C1. The live screen comes first and full width; the margin notes are the decisions (id, one Context line, one Consequence line); a compact log of all ten closes the page.
- First screen, desktop: one identity line; the care recreation at 70% width; three notes at right, each written as a decision ("0010 · Vue to React, one route at a time. Consequence: a route moves only after its parity test passes on both apps."), the first hairline drawn on load. Phone: the identity line, the plate with markers, the three decision notes. Four plates, not five: care, design system, Bayyinah TV, Read to Feed; the public screenshots move into the closing log.
- The one motion: the hairline (180 ms) on focus, hover, tab or tap; the reverse hover from the screen to the note; the note that reads the screen ("Now: Harbor Health → Patient 2093, UTC-8").
- Type and colour: Public Sans, JetBrains Mono for the notes, warm paper, one ink (magenta or green, pick one across all round-3 drafts) for markers, hairline and outline. Plates end on a whole row; no inner background bands; no phone frame (the reader plate is drawn as a screen, not a device).
- Why not generic: there is no hero and no list on the first screen; the first thing a visitor sees is the product, and the notes are decisions, not features.
- Biggest risk: the phone. Four tall plates with notes under each is a long scroll before the log; a visitor who wants the overview must reach the end. Mitigation: a one-row "10 decisions ↓" link under the identity line that jumps to the log.

### New

**B1. `same-behaviour`** (one obsession: the route moves only when both apps behave the same)
- Idea: the first screen shows the same care screen twice, the Vue-era recreation left and the React recreation right, with one control row under both. The visitor presses one control and both screens change together. That is parity, shown, not stated.
- First screen, desktop: one identity line; two plates side by side at 46% each, labelled "Nuxt 2, 2023" and "React, 2026" in mono; under them one row: "Switch organization", "Toggle unit", "Open alert"; a one-line note: "A route moves to React only after this test passes on both apps. 28 routes so far." Phone: the two plates stacked, the control row sticky at the bottom.
- The one motion: the paired change. Press a control and both plates update at the same time (200 ms cross-fade of the changed part only); a small mono check appears between them ("same behaviour ✓"). Nothing else moves. Keys change state with no travel.
- Type and colour: Public Sans, JetBrains Mono, white paper, one green for the check; the two plates share one neutral chrome so that the only difference is the product's own style, which is the point.
- Why not generic: no portfolio shows its proof as a live A/B of the same screen. It passes M2 (the pair is the navigation) and M4 (one obsession). It carries the two-platform-rewrite fact in one glance.
- Biggest risk: content. A Vue-look recreation does not exist in `src/lib/recreations.tsx`; it is new work with invented data under the NDA rule, and two live plates on the first screen cost bundle and paint. If the Vue plate cannot be built in budget, the pair becomes "React vs React" and the idea dies. Second risk: the two-screen hero can look like a device fan. Rule: no frames, no shadows, no tilt.

**B2. `proven-cv`** (the document everyone asks for, with every line proven)
- Idea: the home page is the CV as real text, not a PDF, and every line that makes a claim carries a marker; focus the marker and the proof opens in the margin: a live plate, a store link, a number with its source.
- First screen, desktop: a two-column page like a printed CV. Left, the CV text in one serif at 16 px: name small, one role line, then "Experience" with four entries, each line a claim ("Moved a multi-tenant care platform from Vue to React, one route at a time, parity-tested"). Right margin: the proof for the first claim already open, the care plate with one hairline to the claim line. Phone: the CV text; the first proof plate open under its claim at load; other proofs open inline on tap.
- The one motion: the hairline from the claim line to the proof (180 ms), and the proof plate opening in place (clip, 200 ms). Nothing else moves. "Download CV" gives the same document as a PDF.
- Type and colour: Newsreader for the CV text, JetBrains Mono for dates and markers, uncoated paper, vermilion for the markers and hairlines only.
- Why not generic: a CV page is the most direct answer to bar 1, and nobody pins proof to a CV line. The markers make the document honest: a line with no marker is a line with no proof.
- Biggest risk: a wall of words. If more than six lines carry markers on the first screen, the page is a resume with stickers. Rule: at most four claims per entry, one proof open at load, work visible above the fold on the phone.

## Rules for round 3 builders (new, from this round's evidence)

- A number that travels leaves its source. Hide or dim the source while the ghost moves; start counting only after the ghost has left (decision-record final/d-count-300 shows 16 and 14 on top of each other).
- A fold does not cut a glyph. Fade a leaving clause to opacity 0 before its width shrinks, or hold its width until it is invisible (release-brief r5 d-b-480 "sign-ifrc", m-a-600 "a multi").
- Mount the shared care recreation once. Its chart draws for 1.1 s on mount; a state change must not remount it (release-brief r5 d-c-150).
- Capture the drag path, not only the clicks. A drag across several stops must apply one change at the settled stop (release-brief r3 d-drag-mid).
- No instruction text. If the page needs "Select one to keep only…", "Press ⌘K to switch", "Keys 1 to 3 select a claim", the control is not clear. One short caption at the control is allowed (release-brief's "← drag to an earlier year" worked).
- One identity line on the first screen. Not a top-bar subtitle plus a statement, and not "Frontend and mobile developer, full stack since 2026" as the story.
- A hairline routes around other markers and ends at a pixel, not in empty space (margin-notes plate 5 and plate 2).
- A live plate ends on a whole row. No clipped cards, no inner background bands, no device frame (margin-notes plates 2 and 4).
- A column that reads the same in 9 of 10 rows is noise. Show only the exception (decision-record Status).
- Do not repeat the claim under its proof ("Proves: Two platform rewrites.").
- Hover may trigger an explanatory animation only when it runs once per element and the state stays (strike-index). Keep that rule.
- Keep the mid-frame rule. Name a frame by its real time; a file named `-120ms` that equals the end state is not evidence (margin-notes d-org-switch-120ms).
