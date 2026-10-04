# Loop 1 review: specimen, brief, orbit-index, changelog

Reviewer: independent, built none of these. Judged from the PNG captures and the draft source. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Builders' self-scores are in brackets for comparison.

Evidence read: `review/loop1/<id>/final/` (or r3 for brief, which has no final/), the r*/ interaction frames, `src/drafts/<id>/` motion code, LOOP-BRIEF.md, CREATIVE-CONSULT §1.2, emil-design-eng SKILL.md.

## Scores

| Point | specimen | brief | orbit-index | changelog |
| --- | --- | --- | --- | --- |
| 1 Straight to the point | 7 [8] | 8 [8] | 8 [8] | 8 [8] |
| 2 Not overwhelming | 7 [7] | 7 [8] | 7 [7] | 7 [8.5] |
| 3 UI/UX harmony | 8 [8] | 8 [7.5] | 7 [8] | 8 [8.5] |
| 4 Meaningful motion | 6 [7] | 7 [8] | 7 [8] | 8 [8] |
| 5 Actions and seniority | 8 [8] | 8 [7.5] | 8 [7] | 8 [8] |
| 6 Original | 5 [6.5] | 6 [7] | 4 [6] | 6 [7.5] |
| 7 Hooks | 5 [6] | 7 [7.5] | 5 [6] | 7 [7] |
| Total | 46 | 51 | 46 | 52 |

Builders over-scored "original" by 1.5 to 2 points in every draft. Nobody scored below 6 on any point. I did.

## specimen

Strongest idea, keep it: the citation rule. Every value in the table has a `↳ proof` link to the example that proves it. This is the clearest seniority device of the four. It costs no motion.

Top 3 problems:
1. The first screen shows no work. It is a name at 72 px top-left, a one-liner under it, and a table. That is slop marker 1 in a serif. The rule that makes the page special is stated in italics ("Every value in the table cites the example that proves it"). It is not shown. At 375 px the table starts below the fold.
2. The variant switch is at the top. Its main effect (the examples reorder, FLIP at 480 ms) happens below the fold, so a visitor who presses it sees only the table values change. 480 ms is also above the 300 ms UI budget. The two switch frames (r5 i-1 at 110 ms, i-2 at 230 ms) are identical, so the cross-fade is not proven by the captures.
3. `<Gentrit variant="frontend" />` and a props table with `string`, `number`, `Platform[]` types is the "person as a component" trope. It sits next to the fake-terminal marker. The expand frame (r5 i-5 at 160 ms) shows three empty grey tiles while the Viva Fresh images load; the reveal is a skeleton, not the clip reveal the signature claims.

Carry forward: no, not as a direction. Carry the citation rule into round 2.

## brief

Strongest idea, keep it: the strike-and-insert. The problem sentence is struck word by word and the result is written into the gap, with the old words still legible. The sentence that stated the problem now states the result. This is the best motion of the four. It explains a change, it is tied to the content, and it reads correctly with reduced motion (state switch, no travel).

Top 3 problems:
1. Words collide mid-glide. In r1 mo-5 "ship: 34 rc" overlaps "and has to stream". In r2 h-1 "rout b" is clipped and "times" sits over "out on 16". Cause in `Proof.tsx`: `glide()` FLIPs every word 520 ms from its old box to its new box while the sentence reflows across lines, so words cross each other. r3 has no mid-animation capture, so a fix is not proven.
2. The device forces a problem where there is none. Incentiv: "needs" → "is live with". Viva Fresh: "needs to take" → "takes". Those strikes are grammar edits, not solved problems. The builder admits this. Two of seven briefs are feature lists with a strike on top.
3. The first screen is the slowest of the four. A four-line sentence at 64 px, a sub-line, four links, then a rule, and only the top of brief 01 at 900 px. On the phone the first screen shows no work at all; the care recreation is three screens down. The builder also used a second blue clause in the hero in r2 ("now full stack") and dropped it in r3; the frame is a standard case-study layout (left numbered rail, sentence, screenshot right).

Carry forward: yes. The motion and the Problem / Decision / Result unit. Not the frame.

## orbit-index

Strongest idea, keep it: the Work column. Every row carries an outcome in plain verbs ("One billing report from 16 queries to 2", "36 components, 805 tokens, 20 releases"), grouped by employer with counts, keyboard first, with Problem / Result in the preview. The index is the best 30-second read of the four.

Top 3 problems:
1. It is designeer.xyz with the furniture moved. Dark ground, a halftone sphere top-right, dense aligned rows, slash to search. That is the reference's three rules (M1, M3, M11) in the same places. "Dark mode plus one accent" is also on the slop list. The builder scored this 6; it is a 4.
2. The mark is the signature, and it does not land. It is 120 px in the top-right corner, far from the rows. Its turn is a small change in the ring gap and the colour (compare mark-rest.png and mark-duk.png). The turn runs on hover across 30 rows, which Emil's table puts at "tens of times a day: remove or reduce". `mark.ts` does stop at rest (no idle loop), which is correct. The glide frames (r4 d-glide-100 and d-glide-end) are identical, so the preview glide is not proven.
3. The phone view loses the grammar. The year track becomes a "·····●" glyph string under each row that reads as noise, and the mark shrinks to a 60 px corner dot. The "AI business dashboard" row shows "-" for year and an empty track. Per-project accent (green, orange, blue on the mark, the labels and the search frame) breaks "one accent".

Carry forward: ideas only. The dense keyboard index and the Work column. Not the orb, not the dark ground.

## changelog

Strongest idea, keep it: the career as a one-screen release history with typed changes. "Rebuilt / Added / Improved / Shipped / Ported / Maintained" are action verbs; "as a team member" is honest scope; majors sit at their real year on the rail. Keyboard changes state with no movement, reduced motion is handled, the plate opens in place. This is the most finished of the four.

Top 3 problems:
1. The hook is hidden. The memorable moment (drag the rail to 1.0; the statement, the platforms and the notes fold back to 2021) sits behind a 1 px line with a small red tick and a 12 px italic caption. The drag frames (r6 final-d-drag-1 and final-d-settled-1) look the same. A visitor who scrolls sees a calm list with 128 px thumbnails. The builder admits this.
2. The metaphor adds words. "Release 5.0 adds the API behind them" is a joke in the statement. "Plate 5.1", "5 changes", "new in 5.0", and version numbers for a person sit next to the "v2.0 caption" slop marker. The right aside ("Release 5.0, Shipped to, Role") repeats the statement and the rail: three columns say the same thing.
3. The dark ground is a step back. r2 had the uncoated paper (d-light-top.png) and the type sat better on it. The final is dark plus one accent, which is a slop marker, and the dark Specimen plate inside it (blue, rounded, another sans) is a second design language on the same screen. The phone docks the rail at the bottom as a different control from the desktop rail.

Carry forward: yes, as the base frame. Return to the paper ground.

## Slop count (CREATIVE-CONSULT §1.2)

- specimen: giant name top-left with one-liner (1), fake code line (near 1). Count 1.5.
- brief: giant sentence hero (near 1). Count 0.5.
- orbit-index: dark + one accent (1), the orb as the only picture copied from the reference (1). Count 2.
- changelog: dark + one accent (1), version captions (near 1). Count 1.5.

None reaches three. orbit-index is the closest.

## Ranking

1. changelog (52). The best frame and the most complete. Needs the hook brought to the surface and the paper ground back.
2. brief (51). The best motion. Needs the word collision fixed and the weak strikes cut.
3. orbit-index (46). The best 30-second read. Too close to the reference.
4. specimen (46). The best rule. The weakest first screen.

Carry forward to round 2: changelog and brief as live drafts. orbit-index and specimen stop; their ideas move into the evolutions below.

## Round 2 plan: six directions

### Evolutions

**1. `release-brief`** (changelog frame + brief motion + specimen rule)
- Idea: one document. The statement at the top is the only thing that animates, and every clause in it cites a plate.
- First screen: paper ground. One statement in Newsreader: "Gentrit Rashiti builds web and mobile products, from the first screen to the store release." Each clause carries a small `↳ 5.1` plate number. The rail on the left, release 5.0 notes under the statement, the first plate open at 480 px wide. No right aside.
- The one motion: move the rail (drag, scroll past a major, or arrow key with no travel). The statement's clauses are struck and rewritten to that release's truth with brief's strike-and-insert, one line only, so no words cross lines. Nothing else folds. The notes list changes state with a 200 ms cross-fade.
- Type and colour: Newsreader roman and italic, one mono for plate numbers, uncoated paper, vermilion ink.
- Why not generic: the page is a document, not a dashboard. The only thing that moves is the one sentence that tells you who he is, and it changes to tell you who he was.

**2. `strike-index`** (orbit-index density + brief motion)
- Idea: a dense keyboard index where every row is a problem sentence, and the focused row rewrites itself into the result.
- First screen: a two-line statement, then 12 rows. Each row: year, one-line problem sentence in grey ("A billing report times out on 16 queries"), scope. The focused row strikes the constraint and inserts the result ("needs 2 queries") in ink blue. The proof thumbnail sits in a fixed right column, no leader line, no glide.
- The one motion: the strike-and-insert, once per focus, about 600 ms total, keyboard moves the focus with no travel. Rows are one line each, so the collision defect cannot occur. Only rows with a real problem have a strike; rows without one are plain.
- Type and colour: one grotesk, mono numbers, warm paper, one ink blue. No orb.
- Why not generic: the list is the work, and the list talks back. There is no hero and no mark.

**3. `cited-claims`** (specimen rule + orbit-index index)
- Idea: the hero is three claims. Each claim is a query on the index.
- First screen: three claims at 40 px: "Two platform rewrites." "A design system: 36 components, 805 tokens." "About 14 store releases." Under them the index, 30 rows, Work column with outcomes. Selecting a claim keeps only the rows that prove it, and the preview opens on the first.
- The one motion: rows that do not prove the claim fold away (layout, 240 ms, ease-out); proof rows hold their position. The claim's number is live: "14 releases" is counted from the rows that remain.
- Type and colour: one sans, mono years, light ground, one accent.
- Why not generic: the hero is not a bio. It is three statements the page can prove in one click, and a visitor can check the count.

### New directions

**4. `decision-record`**
- Idea: the portfolio is indexed by decisions, not by projects. Each record is Context / Decision / Consequence with a date and a status, the way an ADR is written.
- First screen: a numbered list of ten decisions, newest first. "0010 Move one route at a time, with a parity test on both apps. 2026. Care platform." "0007 One React Native codebase for both stores. 2023. Viva Fresh." The name is one line in the footer.
- The one motion: open a record and the Consequence number counts from the Context number (16 → 2, 0.63 → 0.81), 300 ms, ease-out. A "superseded by" link draws a 1 px line between two records. Nothing else moves.
- Type and colour: one humanist sans, mono ids and dates, white paper, one green for "Accepted".
- Why not generic: it answers bar 5 directly. A list of decisions shows seniority in five seconds without one technology name. Nobody indexes a portfolio this way.

**5. `margin-notes`** (offgrid's rule: the work is the energy, identity is a footnote)
- Idea: the first screen is the care recreation itself, full width and live. The facts are margin notes pinned to parts of the screen.
- First screen: the Patient 4821 recreation at 70% of the viewport. In the right margin, five notes in mono: "This switcher: data, roles and timezones kept apart per organization." "This chart: one report from 16 queries to 2." "Four languages." The name and role are one line at the bottom. Scrolling brings the next project's screen with its own notes.
- The one motion: focus a note (hover, tab, or tap) and a hairline draws from the note to the UI part it describes, 180 ms, and that part gets a 1 px accent outline. The recreation is interactive: switch the organization and the data changes, which is the real behaviour.
- Type and colour: the product's own type inside the plate, one mono for notes, light ground, one accent for the hairline.
- Why not generic: there is no hero at all. Every fact is pinned to a pixel that proves it. NDA holds: the recreation already exists with invented data.

**6. `tenant-switch`**
- Idea: the site is one app shell with an organization switcher, like the one he built. Switching the organization switches the employer or client. The shell never changes.
- First screen: a top bar with "Vianova ▾", a role line ("Frontend and mobile, full stack since 2026"), and five rows of work with results. Open the switcher: Agency work (12), Incentiv (1), Personal (11). The accent and the rows change; the controls do not.
- The one motion: the switch. Rows cross-fade (200 ms, ease-out), the accent re-tints, the count updates. Focus stays on the switcher. This is the stable-shell rule from his own work made visible.
- Type and colour: one sans, mono counts, light ground, accent per tenant (the only place a second colour is allowed, because it is the tenant's).
- Why not generic: the navigation is the thing he built. A visitor learns what multi-tenant means by using it, in the first ten seconds. It passes the costume test: the switcher is the navigation, not a decoration.

## Rules for round 2 builders

- Capture one mid-animation frame for every claimed motion in a GPU browser. End-state pairs that look the same are not evidence (specimen r5 i-1/i-2, orbit r4 glide-100/end, changelog r6 drag/settled all failed this).
- No dark ground in round 2. Three of four drafts used it and it is a slop marker.
- One accent. A per-project colour is allowed only where the colour is the content (tenant-switch).
- No strike where there is no problem. If the sentence has no constraint, write it plain.
- Phone first screen must show work, not only words.
