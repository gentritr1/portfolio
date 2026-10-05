# Loop 4 review: year-stack, statement-of-record (polish); rebuilt-twice, token-source, both-stores, added-clauses (new)

Reviewer: independent, built none of these, did not read round 4 before this review. Judged from the PNG captures in `review/loop4/<id>/final/` (desktop, phone, scroll states, mid-animation frames, reduced motion), the before/after pairs of the two polish entries, the thumbnail sheet `review/thumbs4/sheet.png`, the phone reel `review/reel4/sheet.png`, and the draft source in `src/drafts/<id>/`. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Builders' self-scores are in brackets. Half points in self-scores are kept as given; review scores are whole numbers.

Two measurements were made for this review:

- `scratchpad/chroma4.mjs` (the round-3 decode and threshold, plate rectangles from each meta.json) re-measured every desktop first screen. All six builder numbers are correct to 0.1%: year-stack 34.2 / 43.4, statement-of-record 24.5 / 38.0, rebuilt-twice 24.1 / 39.0, token-source 31.1 / 50.6, both-stores 64.7 / 82.8, added-clauses 37.9 / 40.6 (whole screen / outside the plates).
- `scratchpad/contrast5.mjs` computed WCAG contrast and OKLCH-to-hex for the round-5 palettes cited below.

## Scores

| Point | year-stack | statement-of-record | rebuilt-twice | token-source | both-stores | added-clauses |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Straight to the point | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 7 [7] |
| 2 Not overwhelming | 8 [8] | 8 [8] | 8 [8] | 7 [7.5] | 8 [8] | 8 [8] |
| 3 UI/UX harmony | 8 [8.5] | 8 [8] | 7 [7.5] | 8 [8] | 8 [7.5] | 7 [8] |
| 4 Meaningful motion | 8 [8] | 8 [8] | 7 [8] | 8 [8] | 8 [8] | 8 [8] |
| 5 Actions and seniority | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 7 [7.5] | 8 [8] |
| 6 Original | 7 [7.5] | 7 [7] | 7 [7] | 7 [7] | 7 [7] | 7 [7] |
| 7 Hooks | 8 [8] | 7 [7] | 8 [7.5] | 8 [7.5] | 8 [7.5] | 7 [7.5] |
| Total | 55 [56] | 54 [54] | 53 [54] | 54 [54] | 54 [54.5] | 52 [53.5] |

Self-scores are within 1.5 points of the review on every draft. Two patterns: builders gave 8 to motion that strikes a true fact or runs a loop on the first screen (rebuilt-twice), and 8 to harmony where a plate leaves a third of its card empty (added-clauses). The "original" line is 7 on all six for the fourth round in a row. Section "Why original is stuck" explains what the evidence says about that.

## The coordinator observation, tested

**Claim:** in added-clauses the three dotted blank rows under the sentence may read as empty lines rather than a promise.

**Confirmed, with a sharper cause.** `added-clauses/final/d-top.png`: under "Gentrit Rashiti builds mobile apps." sit three rows (y 175, 255, 335) of dotted segments, twelve segments in all, each the width of one future word, with "2023", "2026", "2026" in 12 px mono at the row starts. Two things stop them from reading as a promise:

1. The segments are per word. A visitor sees five dotted runs of different lengths on one row and reads a redaction or a worksheet ("fill in the blanks"), not "a clause is coming". The width of a word that is not yet on the page is information the visitor cannot use.
2. The rows have no verb. A year label beside dots says "2026: ______". Nothing says "earned on the way down". The sticky header (`d-s3-y320.png`) repeats the same dotted runs at 20 px, where they become underscores.

On the phone it is worse (`m-top.png`): the blanks take four rows and 110 px of the first screen, and the header grows to three lines (`m-y260.png`). The sentence device is good; the blanks are the wrong drawing of it. The polish rule in "Rules for round 5 builders" says what to draw instead (one short blank per clause, with the clause's year inside it, and the blank fills from the left).

Note that `d-back-top.png` proves the payoff works: on return to the top the full line stands at 80 px over four lines, "Gentrit Rashiti builds mobile apps and web platforms, from the design system to the API behind them." That frame is the first screen this direction should have had; see the round-5 plan.

## year-stack (polish, round 3: 54 → round 4: 55)

Score change: +1 (calm 7 → 8). Builder expected 57, self-scored 56.

Defects closed, with frame evidence:

1. First-screen load. Closed. `before/1-d-top.png` had the four-line statement, six year links plus "Email · CV" in the corner, four decisions and the hairline over the plate's top. `final/d-top.png` has three statement lines, the year links on the statement's last line, three decisions, the plate and one hairline that runs through the gap and along the plate's own divider to the switcher. Eight groups, down from eleven. The bottom 100 px of the first screen are empty ground under the pile, which the holdback admits; that is white space, not a defect.
2. Plates cut mid-row. Closed. `d-y588-2025.png` ends the bayyinah.org plate on the store badges row; `d-y1764-2023.png` ends the pricing plate on "Start 7-Day Free Trial".
3. Store phone tiles. Closed. `d-y2940-2021.png` and `d-y2352-2022.png` show one listing image each, no frame. The fix opened a new defect (item 1 below).
4. S1 inverted. Closed. The stack is a pile of six from the first frame (`d-top.png` y 745 to 800, four edges under the 2026 card), the newer card lifts off with native scroll, nothing scales or dims (`d-peel-y294.png`, `d-reduced-y294.png` identical in layout). The only `scale()` in the CSS is the link's `:active` press (year-stack.css line 351), which the canon allows.
5. Phone statement plain. Closed. `m-y2025.png`: "Gentrit Rashiti builds / ~~a multi-tenant platform,~~ / Next.js web apps, from an institute's website to a member portal." The phone keeps the device.
6. Hairline over the plate. Closed. `d-top.png`: result dot → gap → plate's left edge along the divider → switcher. `d-y1764-2023.png`: into the dark plate as a butter line, ending in a ring on the Monthly/Annual toggle. `d-y2352-2022.png`: ring on the "Read 36%" progress row. `d-y2940-2021.png`: ring on the search field.
7. Clipped glyph. Closed. `d-rw2025-130ms.png`: struck, nothing written. `d-rw2025-330ms.png`: "Next.js web apps," with "apps," at half opacity, "from an", "to a": whole words, no cut glyph. `d-pin2023-120ms.png`: the leaving 2024 words fade as a whole ("to the asset list." ghost).

Open defects (new or remaining):

1. The 2021 and 2022 cards leave about 300 px of empty butter at the right of their 400 × 420 store crops (`d-y2352-2022.png` x 1005 to 1320; `d-y2940-2021.png` x 1061 to 1320). The plate column is 678 px on the other four cards. A big card whose plate fills a third of its slot is the round-3 "empty card" defect in a new form.
2. The 16 → 2 billing result left the first card and became a footer sentence, "Also in 2026, on the care-management API: a billing report that timed out went from 16 queries to 2." (`d-end.png`, `m-end.png`). A footer sentence is where a result goes to be missed. The round-3 list said "or move it to the record"; this page has no record.
3. The 2023 card holds four decisions and is the densest card on the page (`d-y1764-2023.png`, text to y 690). The fourth, "Build the care platform's features on Vue (Nuxt 2) · Four languages", is a 2023 care fact that the 2026 card supersedes.
4. At `d-peel-y294.png` the sentence has rewritten to 2025 while the 2026 card still holds the top 300 px of the screen with its "Open the case" link. The settle logic (`Draft.tsx` SETTLE_MS 160, current card by the middle of the viewport) is right; the reading position is the statement's bottom edge, not the viewport middle, so the rewrite runs one card ahead for about 150 px of scroll.
5. Phone: the sticky statement takes four lines, 105 px (`m-y2025.png`), and the "Care manager" chip in the care plate wraps to two lines at 343 px (`m-top.png`). The chip is the shared recreation; coordinator fix, not a draft fix.

Keyboard jump (`d-key-right-120ms.png`: focus ring on 2025, page already there) and reduced motion (`d-reduced-y294.png`, `d-reduced-y1176.png`) are proven.

Stays on the polish track: yes, first slot.

## statement-of-record (polish, round 3: 53 → round 4: 54)

Score change: +1 (harmony 7 → 8). Builder expected 56, self-scored 54.

Defects closed, with frame evidence:

1. 0009 and 0001 voids. Half closed. 0009 is now a number plate, "16 → 2" in Literata at 160 px with "queries" in mono, at the other plates' height (`d-0009-end.png`, `pairs/1-after-d-0009-end.png`). 0001 still has no plate: its sentence sits alone 150 px above "The record" (`d-0001-record.png` y 320 to 540). 0004 and 0003 also became plate-less text rows between big cards (`d-0004-0003.png`); the gap was cut to 72 px, so the voids are gone but the card rhythm now breaks for 400 px.
2. Strike overshoot. Closed. `d-top.png`: the strike ends at "its"; `d-0006.png`: at "28 MB" and "deploy." on the next line, no stroke past a glyph.
3. Viva Fresh phone frames. Closed. `d-0002-screen.png`: one App Store image at native ratio, no frame. The fix opened item 1 below.
4. Phone index wraps. Closed. `m-bottom.png`: name on one line, mono result under it.
5. Chart cut at the fold. Closed. `d-top.png`: the plate ends at y 889 on its "Recreation with invented data" footer, inside 900 px.
6. Two underline devices. Closed. `d-s3-y240.png`: the cited words are green with no underline; the constraint has the dotted underline. See item 3 below for what the dotted underline now looks like.
7. Statement names only the care platform. Closed. The statement is "Gentrit Rashiti builds a multi-tenant care platform, / from the design system to the API behind it, / and mobile apps in both stores." with a fourth cite, 0002 (`d-top.png`), and the header carries all four (`d-s3-y240.png`).

Open defects:

1. The Viva Fresh card is a 400 px image beside 500 px of empty mint (`d-0002-screen.png` x 780 to 1304). Same defect class as year-stack item 1.
2. The phone statement breaks "multi-/tenant" across two lines in the identity line (`m-top.png` lines 2 and 3). The browser breaks at the real hyphen; it needs a non-breaking hyphen (U+2011) or `white-space: nowrap` on the word.
3. The constraint's dotted underline is one run per word, with gaps at the spaces: "runs 16 queries and times out." shows five separate dotted runs (`d-s3-y240.png` y 800). It reads as a spell-check mark.
4. The S3 hand-off shows text under text for about 60 px of scroll: at `d-s3-y140.png` the statement's third line, "and mobile apps in both stores.", is still visible behind the one-line header. The builder's own numbers (statement out over 0 to 150 px, header in over 112 to 172 px) overlap by 38 px.
5. 0004, 0003 and 0001 are text rows in the big-card column (`d-0004-0003.png`, `d-0001-record.png`). The round-4 rule says a decision with no screen becomes a number plate or a row in the record. 0003's edit, "~~and Arabic reads right to left.~~ with a full right-to-left layout.", corrects nothing; the struck words are a fact.

Motion evidence is real: strike mid-frame (`d-0009-130ms.png`, the stroke at "times o|ut."), write-in end (`d-0009-end.png`), load correction (`d-load-0010-130ms.png`, `-420ms.png`), keyboard (`d-key-enter-0002-30ms.png`), reduced motion (`d-reduced-0009.png`, `d-reduced-top.png`), phone hand-off (`m-s3-y100.png`, `m-s3-y170.png`).

Stays on the polish track: yes, second slot by the tie-break (54, slop 0). Parking watch: a second round under +2 parks it (ROUND-3-BRIEF §6).

## rebuilt-twice (new)

Strongest idea, keep it: the first screen. "Two platform rewrites." at 72 px in Fraunces, the identity as a footnote, two cites at the right, and the live room on an oxblood panel with the hairline from "Live streams with realtime chat and moderation." already drawn to the LIVE chip (`d-top.png`). A visitor reads the one claim, sees the first proof and knows the level in five seconds. The page runs 2023 then 2026, so the S1 cover is true for the first time in the loop: the care card covers the Bayyinah card, which scales and dims (`d-s1-y700.png`), and in reduced motion it does not (`d-reduced-y560.png`). The 0010 correction is real: "The care platform moves from Vue to React ~~and no screen may change its behaviour.~~ one route at a time, parity-tested on both apps." with whole-word write-in (`d-s6-0010-250ms.png`). Both hairlines end at the pixel: the LIVE chip (`d-hair-0003-720ms.png`) and the organization switcher (`d-hair-0010-690ms.png`). The record of ten with results and the two rewrites in oxblood closes the page (`d-record.png`). The phone first screen holds the claim, the footnote, the live room and most of the result line (`m-top.png`).

Defects:

1. The 0003 strike has no problem in it. "Bayyinah TV is rebuilt on Nuxt 3 ~~from an empty template.~~ to 34 routes and 270+ components." strikes a fact that stays true (CONTENT.md line 63: "a full rebuild on Nuxt 3, from an empty template"; `data.ts` line 38 `was: "from an empty template."`). The round-1 rule says no strike where there is no real problem. The correction device fires on the first screen on a sentence that needs no correction, so the hook's first use is a false one (`d-top.png`, `d-s6-0003-250ms.png`). The round-3 plan wrote this sentence; the plan was wrong and the builder did not catch it.
2. The first screen runs a loop. The live-room recreation adds chat messages over time (`d-top.png` "08 messages", `d-s1-y300.png` "09", `d-s6-0003-250ms.png` "06", `d-s1-y700.png` "11") and drifts its video background. It is the shared recreation's behaviour, but on this page it is the hero plate, so the first screen is never still. The brief says no decorative loops; a chat that fills itself is the proof of "realtime chat" only once.
3. The hero's right side is untidy: "CV · Email" floats at x 1028, y 130, between the footnote and the second cite, aligned to nothing (`d-top.png`).
4. Two plate palettes beside the oxblood: the dark live room and the teal care plate (`d-s1-y700.png`), which the holdback admits.
5. Phone: the "Care manager" chip wraps at 343 px (`m-y760.png`); the 0010 hairline is not visible in the phone frame, only the ring on the switcher.

Chroma 24.1% / 39.0% outside the plate: an accent with area, as asked.

Carry forward: the first screen (claim at 72 px, footnote identity, cites) and the true-order two-card stack. The 0003 sentence must be rewritten before any reuse: "Rebuild Bayyinah TV on Nuxt 3: 34 routes, 270+ components, live streams." with no strike.

## token-source (new)

Strongest idea, keep it: the page is painted by the design system it shows. Flip the specimen's Light/Dark control and the page's cards follow 200 ms later while the band and the controls stay (`d-flip-300ms.png` mid circular reveal, `d-flip-end.png`); the care plate two screens down turns dark through `light-dark()` and its card names the token it read, "card.surface → stone.900" (`d-dark-care-scrollY2720.png`). The notes name the token the page uses: "field.focus.ring → border.focus → cobalt.500 → this page's focus outline" (`d-scrollY620.png`). S2 is real: the plate pins, each note's hairline draws from the note up the margin and into the plate at the row it names, with a true mid-frame (`d-wire2-130ms.png`) and an end on the cobalt.600 row (`d-scrollY330-wire2-end.png`), the cobalt.500 row (`d-scrollY620.png`) and the "One source › tokens.css tokens.ts figma.json" row (`d-scrollY900.png`). Reduced motion switches the flip with no reveal (`d-reduced-flip-060ms.png`). The ten-result record is the cleanest closing table of the round (`d-end.png`). Chroma 31.1% / 50.6%.

Defects:

1. Notes pass under the pinned plate and lose their heading first. `d-scrollY900.png`: "WCAG 2.1 AA" is half under the plate's bottom shadow while its body text is still readable; `m-scrollY560.png`: "36 components" is cut at the plate's edge. A note that is half hidden reads as a layout error, not as "passing".
2. Three big cards, three geometries. Read to Feed is a 280 px portrait store crop beside a 900 px text column (`d-scrollY1250-unpinned.png`); Bayyinah and care are 780 px plates beside 420 px columns (`d-s1-scrollY1920.png`, `d-s1-scrollY2160.png`). The big-card spec has one side-column geometry.
3. The "805 tokens" hairline ends on the token table's header row, a ring around "Core value · Semantic role · Component part" (`d-top.png`). A header row is a label, not a token; the proof of 805 tokens is the "One source" row, which the "20 releases" note already takes. On the phone the same pin rings the word "Tokens" (`m-top.png`).
4. The first screen is dense: claim, aside, caption, a plate with five token rows × three columns plus five alerts, then a note (`d-top.png`). The holdback says 7.5 for calm; 7 is right.
5. The claim, "Web and mobile products, from the token to the release.", is one word away from the slop sentence; the aside carries the level ("5+ years. Part of two platform rewrites."). The page's real claim, that it is painted by its own hero, is only in a 13 px caption, "Light or Dark: this page follows ↓".
6. Hero layout: claim on a colour band with a product plate overlapping the band's lower edge is the launch-page pattern (slop 0.5, builder agrees).

Carry forward: yes, as a polish-track candidate (third slot). The flip and the token notes are the most technical hook in the loop so far, and the only one a design-literate visitor would mention to someone else.

## both-stores (new)

Strongest idea, keep it: the claim is counted back. "Three apps shipped to both stores." at 96 px in Archivo at 125% width on a mustard field, one card (`d-top.png`); on scroll the claim fades, a count bar arrives with no overlap (`d-s3-y200.png` empty, `d-s3-y300.png` "One app shipped to both stores."), and the count says "Two apps" (`d-count-word-y1140-40ms.png`) then "Three apps shipped to both stores." (`d-s1-y1950.png`), the hero's own words. Every pin ends at a pixel: the "Educated: A Memoir" row (`d-s1-y788.png`), the "Read 36%" progress row (`d-count-pin-y1140-120ms.png`), the "49.74 €" cart total (`d-s1-y2196.png`). S1 is in true order and the covered card dims (`d-s1-y1950.png`). The honesty is right: "App Store (archived) · Google Play (archived)" on the Read to Feed card (`d-s1-y1492.png`). The phone first screen holds the claim, the reader plate and the result line (`m-top.png`); the phone hairlines run up the plate's outer edge and enter level with the ring (`m-y900.png`). Chroma 64.7% / 82.8%, the most committed colour of the loop.

Defects:

1. Seniority is in the wrong order. The page's strongest facts, "Two platform rewrites, on the web." and the design system, are a five-row table after the third card (`d-record.png`); the hero is three mobile apps. The second claim at 80 px at the end competes with the first and its title does not match its rows (Design System v2, the billing report and Incentiv are not rewrites).
2. The identity line is the retired sentence: "Web and mobile for 5+ years, full stack since 2026. Based in Kosovo, working remotely." (`d-top.png` y 604; `Draft.tsx` line 459). The round-3 review counted this sentence as slop on same-behaviour's headline; here it is the sub-line.
3. The reader recreation draws its own rounded grey bezel around the page (`d-top.png` x 795 to 1073) and the scan card sits beside it on a cream inner band: the device frame and the inner band, both on the round-2 list, in the hero. The bezel is the shared recreation's; the inner band is the draft's.
4. Read to Feed is on the page twice: the live reader in the hero and its store card in the stack (`d-s1-y1492.png`).
5. The count counts three cards. It is honest (the holdback explains why releases could not be counted), but a visitor sees a progress indicator, not a live tally.

Carry forward: the count-that-ends-on-the-claim as a device, and the mustard field as proof that a whole-page colour works at 10:1. Not the frame as the owner's home page: it is a page about three apps.

## added-clauses (new)

Strongest idea, keep it: the identity line is earned. Each card that settles writes its clause into the sentence (`d-c2023-120ms.png` "platforms." at half opacity, `d-c2023-420ms.png` written; `d-c2026-110ms.png` "from the" writing) and the header carries the growing line (`d-s3-y320.png`, `d-s1-y1840.png` full). On return to the top the full line stands at 80 px (`d-back-top.png`). The pins are exact: the search field (`d-top.png`), the Monthly/Annual toggle (`d-s1-y760.png`), the organization switcher along the plate's own divider (`d-s1-y1840.png`). S1 is in true order with the newest card on top; the apricot and plum pair with Newsreader and JetBrains Mono is the most pleasing type-and-colour combination of the round. The phone first screen shows the Dukagjini plate with its pinned result (`m-top.png`). Chroma 37.9% / 40.6%.

Defects:

1. The dotted blanks (coordinator observation, confirmed above). Twelve per-word dotted segments over three rows with bare years (`d-top.png`), four rows on the phone (`m-top.png`), underscores in the header (`d-s3-y320.png`).
2. The first screen says "builds mobile apps." The design decision is honest, and the holdback owns it, but the bar's first point is who, what and level in five seconds; this page gives "mobile apps" and asks for a scroll. 7 is right.
3. The first card's 283 × 384 portrait listing leaves about 400 px of empty plum between the text column and the plate (`d-top.png` x 580 to 996). Same class as year-stack item 1.
4. The 2023 hairline runs across the plate's nav row at y 160, inside the dark plate, to reach the toggle (`d-s1-y760.png`). It is clear of text, so it passes the rule, but it is the long way; the toggle is 60 px from the plate's top edge and the line could enter at the toggle's own row.
5. The sticky header on the phone is three lines, about 88 px (`m-y260.png`).

Carry forward: the growing sentence and its header, with the blanks redrawn. The direction stops as a frame (the round-3 plan said it would if the first screen was too weak); its sentence moves into the round-5 plan as a part.

## Slop count (CREATIVE-CONSULT §1.2)

- year-stack: none. Count 0.
- statement-of-record: none. Count 0.
- rebuilt-twice: none. Count 0. (The strike of a true fact is a rule defect, not a slop marker.)
- token-source: claim on a band with an overlapping product plate (0.5). Count 0.5.
- both-stores: the "5+ years, full stack since 2026" identity line (0.5); the reader bezel on a cream inner band in the hero (0.5). Count 1.
- added-clauses: none. Count 0.

The round-3 "role line" rule held: every card's role is short ("Frontend · 2026", "Mobile · 2021–22"). The store listings are one image each on every page. No three-tile plate anywhere in round 4.

## Motion checks against emil-design-eng and the scroll canon

- Durations: year-stack strike 260, write 320 in whole words, settle 160, hairline 180 + ring 120; statement-of-record strike 260, write 340 after 220, header 112 to 172 px; rebuilt-twice strike 260, result from 220, hairline 180 after 600; token-source hairline 180, ring 120, flip 200 after the specimen's reveal, surface tween 200; both-stores claim out over 200 px, bar in 200 to 320 px, count swap 120, hairline 180 + ring 160; added-clauses word 120 with 50 stagger, clause 320, hairline 180 + ring 120. All inside the canon.
- S1 order: true on every page that animates the cover (rebuilt-twice, token-source, both-stores, added-clauses). year-stack keeps sticky and animates nothing on a newest-first page, which is the round-3 rule.
- Hairlines: every hairline in the round ends inside the proof at a part (switcher, LIVE chip, toggle, progress row, search field, cart total, token row). The round-3 defect is closed across the board. The one weak end is token-source's header row.
- Mid-frame rule: every claimed motion has a real mid-frame named by its time or offset. year-stack and statement-of-record also captured before/after pairs for each fixed defect.
- Keyboard: `year-stack/d-key-right-120ms`, `statement-of-record/d-key-enter-0002-30ms`, `rebuilt-twice/d-key-enter-0010-060ms`, `token-source/d-key-enter-120ms` and `d-key-work-focus`, `both-stores/d-key-enter-viva-30ms`, `added-clauses/d-key-enter-030ms`: all jump with no travel.
- Reduced motion: all six captured an end state with the stack unscaled and the corrections switched.
- Loops: one. rebuilt-twice's hero live room never rests (chat counter, background drift). No other page loops. The care chart draws once on mount everywhere; token-source's flip does not remount it (the chart keeps its state in `d-dark-care-scrollY2720.png`).
- Text on text: statement-of-record `d-s3-y140.png` (38 px overlap in the hand-off). both-stores avoided it with a 50 px gap (`d-s3-y200.png`).
- Cross-fades: none on text of different length. Count words swap (both-stores), clause words fade in at reserved width (added-clauses).

## Why original is stuck at 7

Four rounds, twenty-two drafts, and no draft above 7 on "original". The evidence in round 4 says why:

- Five of six frames are a sticky card stack with a sentence that reacts to the current card. The stack is the loop's house style now, and a house style is not original by definition.
- Every hook is a text device (a rewrite, a correction, a count, a growing sentence) on the same card. The references the owner named hook with one picture or one obsession, not with a sentence.
- Colour arrived in round 4 and did its job (both-stores, year-stack, added-clauses are the three frames a visitor would remember from the thumbnail sheet), but a colour field on a stack is still a stack.

To move the line, a round-5 direction has to change the layout, not the sentence. The three new directions below each drop the stack.

## Ranking, round 4

1. year-stack (55). The calmest first screen of the four it has had, the whole-word rewrite on both devices, and an honest pile. Two narrow plates and a footer result hold it.
2. statement-of-record (54, slop 0). The cleanest correction evidence and a fourth cite that makes the statement true. A half-empty card, a hyphenated phone statement and three plate-less rows hold it.
3. token-source (54, slop 0.5). The most technical hook of the loop and the best record table. Notes under the plate and three card geometries hold it.
4. both-stores (54, slop 1). The boldest colour and the cleanest count. The page is about the wrong work.
5. rebuilt-twice (53). The best first-screen claim of the round. A false strike and a looping hero hold it.
6. added-clauses (52). The best type-and-colour pair and a device worth keeping. The blanks and the half sentence on the first screen hold it.

## Combined ranking, rounds 1 to 4 (22 drafts)

Ties are broken by slop count, then by whether the phone first screen shows work. A combination that contains a parent's parts ranks above the parent at the same score.

| Rank | Draft | Round | Total | Slop | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | year-stack | 3, polished 4 | 55 | 0 | polish track, slot 1 |
| 2 | statement-of-record | 3, polished 4 | 54 | 0 | polish track, slot 2 (parking watch) |
| 3 | token-source | 4 | 54 | 0.5 | polish track, slot 3 |
| 4 | both-stores | 4 | 54 | 1 | device and field carried forward; frame stops |
| 5 | rebuilt-twice | 4 | 53 | 0 | first screen carried forward; frame stops |
| 6 | added-clauses | 4 | 52 | 0 | sentence carried forward; frame stops |
| 7 | pinned-decisions | 3 | 52 | 0 | parts live in round 4; stopped |
| 8 | decision-record | 2 | 52 | 0 | stopped |
| 9 | changelog | 1 | 52 | 1.5 | stopped |
| 10 | same-behaviour | 3 | 51 | 1 | device only |
| 11 | margin-notes | 2 | 51 | 1 | stopped |
| 12 | brief | 1 | 51 | 0.5 | stopped |
| 13 | release-brief | 2 | 50 | 1 | parts only |
| 14 | workspace-rail | 3 | 49 | 1 | behaviours only |
| 15 | proven-cv | 3 | 49 | 1 | copy only |
| 16 | strike-index | 2 | 47 | 0.5 | rule only |
| 17 | cited-claims | 2 | 46 | 0.5 | device only |
| 18 | tenant-switch | 2 | 46 | 1 | behaviour only |
| 19 | specimen | 1 | 46 | 1.5 | stopped |
| 20 | orbit-index | 1 | 46 | 2 | stopped |

The convergence target is 63. The best draft is 55, one point up on round 3. The floor rose again (every round-4 draft is 52 or more; round 3's floor was 49). The polish track moved its two drafts by +1 each, under the +2 the §6 rule wants; both are on parking watch for round 5. The ceiling is still the "original" line.

## Polish track for round 5

Aim: 60 or more. Honest expectation after one pass: 57 to 58 for year-stack, 56 for statement-of-record, 57 for token-source. The gap to 60 is the "original" point on all three, which polish cannot move; the round-5 new directions carry that.

### P1. year-stack, 55 → expected 58

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 8 | 7 | 8 | 8 | 8 | 7 | 8 | 54 | — | first-screen load; plates cut mid-row; store phone tiles; S1 inverted; phone statement plain; hairline over the plate; clipped glyph |
| 4 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 55 | 1, 2, 3, 4, 5, 6, 7 | narrow plates leave empty butter; billing result in the footer; 2023 card has four decisions; rewrite runs one card ahead; phone header four lines |
| 5 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). Fill the 2021 and 2022 cards. Keep the 400 px store crop at native ratio, but move it flush to the card's right edge (x 1283 as on the other plates) and widen the decision column to 760 px so the two decisions sit in two columns of 360 px under the numeral; the hairline then runs the same gap it runs today. Evidence to beat: `d-y2352-2022.png` and `d-y2940-2021.png`, empty butter from x 1005 to 1320.
2. Seniority and point (+1). Replace the footer sentence with a short record between the 2021 card and the footer, "Also on the record", four rows with mono results: 2026 Care API "16 → 2 queries", 2026 Offday "16 isolation tests", 2026 Snaxx Tech "972 → 337 KB", 2022 Chatbot runtime "1 package". Rows, not cards; no plates. Evidence: `d-end.png` "Also in 2026…" as one footer sentence.
3. Calm (+1 with item 1). Move "Build the care platform's features on Vue (Nuxt 2) · Four languages" from the 2023 card to the record above, so 2023 holds three decisions like 2026 (`d-y1764-2023.png`).
4. Motion (0, removes a finding). Make the current card the one whose top edge is above the statement's bottom edge and whose bottom edge is below the viewport middle, so the rewrite fires when the visitor can no longer see the previous card's link (`d-peel-y294.png`: 2025 sentence over a 2026 card).
5. Phone (0 to +1 on the phone read). Set the phone statement at 18 px so the struck first clause plus the year's sentence hold three lines, not four (`m-y2025.png`, 105 px header).
6. Coordinator, not builder: the "Care manager" chip wraps at 343 px in the shared care recreation (`m-top.png`). Fix once in `src/worlds/healthcare/Recreation.tsx` (nowrap on the chip under 400 px).

### P2. statement-of-record, 54 → expected 56

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 8 | 8 | 7 | 8 | 8 | 7 | 7 | 53 | — | 0009 and 0001 voids; strike overshoot; Viva Fresh phone frames; phone index wraps; chart cut at the fold; two underline styles; statement names only the care platform |
| 4 | 8 | 8 | 8 | 8 | 8 | 7 | 7 | 54 | 1 (0009 only), 2, 3, 4, 5, 6, 7 | Viva Fresh card half empty; phone hyphen break; per-word dotted underline; hand-off text overlap; 0004, 0003, 0001 plate-less rows |
| 5 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Harmony (+1). Make 0002 a side-column card: the sentence stays full width; the 400 px store image sits left; at its right a 280 px column holds the mono result "One React Native codebase · iOS and Android", the role "Mobile · 2023" and "Open the case →". No inner band. Evidence: `d-0002-screen.png` x 780 to 1304 empty.
2. Point and calm on the phone (+1 across 2, 3 and 4). Put a non-breaking hyphen in "multi‑tenant" (U+2011) and set the phone statement at 26 px so the identity line holds six whole lines (`m-top.png` "multi-/tenant").
3. Harmony. One dotted run per constraint: wrap the whole constraint in one span and underline the span, so the dots cross the spaces (`d-s3-y240.png`, five runs).
4. Motion (0, removes a finding). End the statement's fade at 112 px, where the header's fade starts: statement out over 0 to 112, header in over 112 to 172. No frame holds both (`d-s3-y140.png`).
5. Calm. Move 0004, 0003 and 0001 into "The record" and keep seven big cards (0010, 0009, 0008, 0007, 0006, 0005, 0002). 0003's strike goes with it; it corrects nothing (`d-0004-0003.png`, `d-0001-record.png`).
6. Hooks (0 to +1). Let the header's tally count only what the visitor has seen corrected, and light the cite of the current card in the band's margin on the first screen too, so the device starts before the scroll (`d-top.png`: the 0010 pill is lit; the tally is not shown until the header).

### P3. token-source, 54 → expected 57

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 8 | 7 | 8 | 8 | 8 | 7 | 8 | 54 | — | notes cut under the plate; three card geometries; header-row pin; dense first screen; claim near the slop sentence; hook only in a caption |
| 5 | | | | | | | | | | |

Fix list, ordered by expected gain:

1. Calm (+1). No note is ever half under the plate. Fade each note as a whole (opacity 1 → 0 over its last 60 px before the plate's bottom edge, `animation-timeline: view()`, `@supports` guarded; reduced motion: no fade, the plate is not sticky). A note is readable or gone, never cut (`d-scrollY900.png`, `m-scrollY560.png`).
2. Harmony (+1). One card geometry: the spec's side-column card, 880 × 440 plate and 280 px column, for all three. For Read to Feed use the `reader` recreation at 880 × 440 (the specimen is unpinned by then, so one live plate per viewport holds) instead of the 280 px portrait store crop (`d-scrollY1250-unpinned.png`).
3. Hooks (+1). Say the hook on the first screen. Replace the claim with the thing the page proves: "Every colour on this page comes from one token source." at 56 px, and keep the aside ("5+ years. Part of two platform rewrites. Based in Kosovo."). Move "Light or Dark: this page follows" from a caption to the note's first sentence. Evidence: `d-top.png`, the claim is the generic one and the hook is a 13 px caption.
4. Motion (0, removes a finding). Point "805 tokens" at the "One source › tokens.css · tokens.ts · figma.json" row and "20 releases" at the "Release 1.2 is scheduled" alert; on the phone point "805 tokens" at the cobalt.600 row, not the "Tokens" label (`d-top.png`, `m-top.png`).
5. Calm (with item 1). Crop the hero plate to the Tokens panel (five rows, the Light/Dark control inside it), 1200 × 340, and let the Alert panel arrive with the "20 releases" note. The plate must still end on a whole row (`d-top.png`).
6. Original (0; the frame is the frame). Lift the plate off the band's edge: the band ends at a line, the plate starts 24 px under it. The launch-page overlap is the slop marker (holdback, 0.5).

## Round 5 plan

Six entries: three polish entries and three new directions. The new directions each drop the sticky card stack, lead with a plate no round-4 draft led with, keep an accent with area (chroma reported), measure contrast with `scratchpad/contrast5.mjs`, and use fonts from `public/fonts` and `public/fonts/creative` by the family names in `public/fonts/creative/SOURCES.md`.

### P1. `year-stack` (polish, list above)

### P2. `statement-of-record` (polish, list above)

### P3. `token-source` (polish, list above)

### N1. `sampled-ground` (new layout: colour from the screen)

- Hook: the page takes its colour from the screen it shows. Each big card's ground and ink are computed from the dominant hue of its plate at one fixed lightness and chroma, so the colour is the content and harmony is by construction. When the next card covers the current one, the page changes colour because the product changed. Nobody picks a colour.
- Combines: year-stack's panel as the current card's ground and its sticky identity line; pinned-decisions' one pin per card; rebuilt-twice's claim-plus-footnote hero; decision-record's closing record.
- First screen: the identity line on two lines at 64 px, the footnote, and the 2023 Viva Fresh store listing (public/mobile) in a side-column card (880 × 440 plate, 280 px column: problem → result, "Mobile · 2023", "Open the case →"). Order oldest first from 2023: Viva Fresh, Bayyinah TV (live room), Incentiv (wallet recreation), bayyinah.org, Design System (specimen), care platform. 2021 and 2022 go in the record. True S1 order; the covered card scales 0.96 and dims.
- Palette, computed, not chosen: ground `oklch(0.95 0.035 h)`, ink `oklch(0.30 0.11 h)`, current-card panel `oklch(0.42 0.13 h)` with ground-colour type, where h is the plate's dominant hue measured by the builder (report each h in meta.json). Measured examples: Viva Fresh h 20 → ground #FFE6E5, ink #590915 (12.0:1), panel #86262E (7.6:1 with #FFE6E5 type); Bayyinah h 25 → #FFE6E3 / #590A0E (12.0:1); Incentiv h 55 → #FFE9D9 / #541700 (11.9:1); care h 185 → #D6F7F1 / #003D35 (10.7:1); reader h 250 → #DDF1FF / #002D62 (11.7:1). Every pair is above 10:1 by construction.
- Type: Bricolage Grotesque (`BricolageGrotesque-Latin.woff2`, `font-optical-sizing: auto`, 700 at 64 px for the identity line, 500 at 18 px for text) and Gentrit Technical Mono (`GentritTechnicalMono-Latin.woff2`, ids, results, hues). Two faces.
- Motion: S1 oldest first (newer covers older, scale and dim on a view timeline); when a card becomes current the page ground and the sticky line's ink tween to the card's pair in 200 ms (a UI state change, not scroll-linked; reduced motion switches). One hairline per card, 180 ms, to the pixel. No correction, no count.
- Phone: the first card's plate at 343 × 258 and its result in the first screen; the ground changes with the current card the same way.
- Risk: six grounds on one page. Rule: L and C are fixed in the CSS and only h comes from the plate; the builder reports chroma on the first screen and the six hues. If any card's measured hue is within 15° of its neighbour, the two cards share one ground.

### N2. `redline` (new layout: the screen is the page)

- Hook: the screen is reviewed in front of the visitor. One plate fills the first screen at 1200 px; four numbered markers sit on its pixels and four callouts in the margins say the decision each marker proves. The visitor does not read a card about the work; they read the work with notes on it.
- Combines: margin-notes' pointer that reads the screen; pinned-decisions' hairlines drawn at load; proven-cv's rule that a line with no marker has no proof; statement-of-record's margin ids; decision-record's record.
- First screen: the `live-room` recreation at 1200 × 540 with markers on the LIVE chip (live streams), the chat column (realtime chat), the pinned message (moderation) and the Premium toggle (paywall); the callouts in two 120 px margin columns, two left, two right, each "problem → result" in 15 px with its id. The identity line is a sticky review header at the top: "Reviewed: ten decisions, 2021–2026 · Gentrit Rashiti, frontend and mobile, full stack since 2026." Then two more reviewed screens, each full width with its own markers (care platform: switcher, alert marker, unit toggle; Design System specimen: token row, focus ring, alert), and the record of ten.
- Palette, paper and redline: paper #FFF8F0, ink #1A1714 (17.0:1), redline #C2270F (5.6:1 on paper; paper type on red 5.6:1), muted #5C534C (7.1:1). Area: the two margin columns are solid redline with paper type, so the first screen is about 25% chromatic outside the plate; the markers and hairlines are redline on the plate.
- Type: Libre Franklin (`LibreFranklin-Latin.woff2`, 700 at 20 px for callout titles and the header, 400 at 15 px) and Courier Prime (`CourierPrime-Latin.woff2`, the reviewer's typewriter voice for the callout bodies and ids). An unusual pair on purpose; Courier Prime at 15 px on #C2270F is 5.6:1.
- Motion: at load the four hairlines draw 180 ms each with a 60 ms stagger (one authored moment, 540 ms in all), each from its callout, across the margin, into the plate, to its marker; S1 between the three screens in true order (2023, 2026, 2026), the next screen covering the previous one with its callouts drawn once it is current; no correction. Keyboard: Tab moves through callouts, Enter jumps to the marker's screen with no travel. Reduced motion: hairlines appear.
- Phone: the plate at 343 × 258 with the four markers; the callouts stack under it in marker order; the first screen holds the plate and callout 1.
- Risk: callouts over pixels. Rule: only a 16 px ring sits on the plate; callouts live in the margins, never over the screen. The live room's chat loop is a decorative loop on this page too; mount the recreation with its chat paused after the first eight messages (a prop if it has one; otherwise a static snapshot of the chat column).

### N3. `projector` (new layout: one frame, ten screens)

- Hook: one frame, ten screens. The frame never moves. The log scrolls beside it and the frame shows the screen of the current row. The visitor's eye stays in one place while the work changes.
- Combines: workspace-rail's pin line that decides which row is current; same-behaviour's rule that one control changes the view; cited-claims' results per row; year-stack's settle delay so a passed row never fires.
- First screen: a 440 px log column at the left with the identity line at its top and row 01 current; an 880 × 560 sticky frame at the right showing row 01's plate. Order newest first (a log; no cover, so the S1 order rule does not apply): 01 Design System 2026 (specimen), 02 care platform 2026 (care recreation), 03 care API 2026 (number plate "16 → 2"), 04 bayyinah.org 2025, 05 Incentiv 2024 (wallet), 06 Bayyinah TV 2023 (pricing page), 07 Viva Fresh 2023, 08 Read to Feed 2022 (reader), 09 Dukagjini 2021, 10 chatbot runtime 2022 (number plate "1 package"). The log row is: numeral, project, one line "problem → result", role and year in mono.
- Palette, chartreuse and ink: field #D9F26B with ink #141B06 (14.2:1) and muted #3E4A14 (7.7:1); the frame is white with a 1 px ink line; number plates are ink on chartreuse. The field is the whole page, so the first screen is above 60% chromatic. One accent, which is the field.
- Type: Big Shoulders Display (`BigShouldersDisplay-Latin.woff2`, 800 at 96 px for the row numerals and the two number plates) and Public Sans (`PublicSans-Latin.woff2`, 600 at 24 px for the row line, 400 at 16 px for text; results in 600 with tabular figures). Two faces. Arrows from the project's vector icons (Public Sans has no arrow glyph, SOURCES.md).
- Motion: when a row crosses the pin line and settles (160 ms), the frame's plate cross-fades to the row's plate in 200 ms (equal size, so the equal-length rule holds), the frame's caption swaps (different length: swap, never cross-fade), the row's result writes in once and its hairline draws 180 ms from the row into the frame to the pixel. Live plates (specimen, care, reader) mount once and switch with opacity; the others are screenshots. Arrow keys move the current row with no travel. Reduced motion: the frame switches with no fade. No scroll-jacking: the log scrolls natively and the frame is `position: sticky`.
- Phone: the frame pins at the top at 343 × 258 (under 70 vh), the log scrolls under it; the first screen holds the frame, row 01 and its result.
- Risk: ten assets in one frame. Rule: the three live plates mount once; screenshots carry width and height and load lazily; the frame shows a plain surface in the plate's ground colour while a screenshot loads.

## Rules for round 5 builders (new, from this round's evidence)

- Do not strike a true fact. A strike needs a constraint that the result removes. "Rebuilt ~~from an empty template~~" struck a fact that is still true (`rebuilt-twice/d-top.png`, CONTENT.md line 63). If the sentence has no constraint, write it plain, as the round-1 rule says.
- A plate fills its slot. A narrow store crop goes in a side-column card, or the text column widens to meet it. Never 300 px of empty panel beside a 400 px image (`year-stack/d-y2352-2022.png`, `statement-of-record/d-0002-screen.png`, `added-clauses/d-top.png`).
- A note is readable or gone. Nothing sits half under a pinned plate (`token-source/d-scrollY900.png`, `m-scrollY560.png`).
- A blank is one per clause, not one per word. A sentence that grows shows one short blank per clause, with the clause's year inside it; the blank fills from the left. Per-word dotted runs read as a worksheet (`added-clauses/d-top.png`, `m-top.png`).
- The identity line is not "Web and mobile for 5+ years, full stack since 2026" in any position, headline or sub-line (`both-stores/d-top.png`). Say what he builds and one number that proves the level.
- One live loop per page at most, and only when the loop is the proof. The live room's chat and drift never rest on rebuilt-twice's first screen (`d-top.png` "08 messages" to `d-s1-y700.png` "11 messages").
- No break inside a hyphenated word in the identity line on the phone (`statement-of-record/m-top.png` "multi-/tenant"). Use U+2011.
- The S3 hand-off never shows two texts at one spot. The statement's fade ends before the header's fade begins (`statement-of-record/d-s3-y140.png`; both-stores' 50 px gap in `d-s3-y200.png` is the model).
- A dotted underline is one run per constraint, crossing the spaces (`statement-of-record/d-s3-y240.png`).
- One card geometry per page (`token-source/d-scrollY1250-unpinned.png` against `d-s1-scrollY1920.png`).
- A hairline ends at a part, never at a header row or a label (`token-source/d-top.png`, `m-top.png`). Round 4 met the rule everywhere else; keep it.
- A result never lives in a footer sentence. It is a row in a record or a line on a card (`year-stack/d-end.png`).
- The chroma report stays. All six round-4 numbers matched the reviewer's re-measurement; the rule works.
- Keep the mid-frame rule, the keyboard-jump frame, the reduced-motion frame and the before/after pairs for polish entries. All six met them this round.
- Round-5 new directions do not use a sticky card stack as their frame. The stack is allowed inside a direction (N1 uses it between cards) but not as the layout a visitor names. Five of six round-4 drafts are a stack; the "original" line has been 7 for four rounds.
- Coordinator fix, not a builder fix: the shared care recreation's "Care manager" chip wraps at 343 px in every phone frame of the round (`year-stack/m-top.png`, `rebuilt-twice/m-y760.png`).
