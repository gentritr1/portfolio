# Round 3 brief: scroll, big cards, one hand

Creative director: round 3. Written 2026-10-05 after round-2-review.md.

Read first: LOOP-BRIEF.md (the 7-point bar), round-2-review.md (scores, defects, round-3 plan, builder rules), CONTENT.md, src/content/projects.ts, src/content/caseNarratives.ts.

## 0. What round 3 is for

The owner's request: scroll motion, big cards, new layouts, catchy colour and type, with Emil's motion rules and the taste skills. The owner's second request: combine the best parts of all ten drafts so that one draft can reach 63 of 70, then polish it in place round after round.

So round 3 has two jobs:

1. Four combinations. Each one names the proven parts it takes, and the defect it fixes in each part. Each one aims at 63+.
2. Two bold new directions. Each one leads with a big card and a scroll relation that carries meaning.

Every direction: light ground, one accent (or one two-colour identity), one identity line, no instruction text, the phone first screen shows work, the slop count is 0.

### Scores to beat

| Draft | Round | Total | Keep |
| --- | --- | --- | --- |
| decision-record | 2 | 52 | the log of ten decisions with a Result in mono; the best first screen so far |
| margin-notes | 2 | 51 | the hairline from a note to the pixel; the note that reads the screen; no hero |
| release-brief | 2 | 50 | the statement with one cite per clause; the one-line strike; the visible hook caption |
| strike-index | 2 | 47 | the edit ends the sentence, its space is reserved, corrected rows stay |
| cited-claims | 2 | 46 | "Two platform rewrites." at 40 px, and the cited words marked in the row |
| tenant-switch | 2 | 46 | the switch as navigation; "found in other workspaces" |

The gap to 63 is in three points: original (best 7), hooks (best 7), and not overwhelming (best 8). Scroll motion and big cards are the tools for hooks and original. Fewer elements on the first screen is the tool for not overwhelming.

## 1. What the reference sites teach (principles, not copies)

Seen in the browser on 2026-10-05.

| Site | What it does | Principle to take | Do not take |
| --- | --- | --- | --- |
| designeer.xyz | Dark ground. One mark (a dithered orb) top-left. Then rows: favicon, name, one line. Dense, aligned, scannable. One sticky bar at the bottom. | A row of mark, name and one line scans faster than a card. One picture only, everything else is text. | The orb, the dark ground (round 1 copied both). |
| offgrid.inc | Black ground. A three-column grid of big tiles. The work fills each tile. Under each tile two small lines: name, then category and year. Identity is one sentence top-left. The nav is two pills, fixed at the bottom. | The work fills more than 80% of the viewport. Captions are two short lines. Identity is one line. | The gallery grid of equal tiles; our work is not thirty posters. |
| mek.gallery | One obsession (pixel art). A newspaper grid with hairline borders. A top strip of recent items with date and category. One large piece full width. Pixel type everywhere, including metadata. | Full commitment to one world; the metadata speaks in the same voice as the work. | The costume. We have no pixel art. |
| uselayouts.com | A hero with a floating live component demo. Large two-column cards. Soft gradient glow. Avatar strip. | The live thing is the hero image. Show the component, not a picture of it. | The glow gradient, the avatar strip, the pill nav (slop markers). |
| designeng.tools | Dark three-column card grid: screenshot, favicon, name, one line. A filter chip row. | A card needs a screenshot and one line. Our line is a result, not a description. | The uniform grid; a dark card wall. |

One more rule from all five: no site explains its own controls. The layout is the instruction.

## 2. Scroll motion canon

Motion on scroll is allowed only when the scroll position means something: which item is current, which claim is being proven, what came first. A reveal because an element entered the viewport is decoration. Fade-up on every section is a slop marker.

### 2.1 Allowed techniques

| Id | Technique | What it means | How |
| --- | --- | --- | --- |
| S1 | Sticky card stack | Order. The newer card covers the older one. The stack is the log. | Each card `position: sticky; top: var(--stack-top)`. The card under the new one scales to 0.96 and fades to 0.6 with `animation-timeline: view()`, `animation-range: exit 0% exit 60%`. Transform and opacity only. |
| S2 | Pinned plate, passing notes | The note you read points at the pixel it is about. | The plate is `position: sticky`. Notes scroll past at its side. When a note crosses the pin line (IntersectionObserver, `rootMargin` set to the pin line, once per note), its hairline draws (180 ms) and the previous hairline fades (120 ms). |
| S3 | Statement into header | The claim stays on screen while the proofs pass. | Two elements. The big statement fades and moves up 24 px with `animation-timeline: scroll(root)` over the first 320 px of scroll. The one-line sticky header fades in over the same range. Each cite in the header lights when its card is current (S1 or S2 decides which card is current). Never scale text to make it small; use two elements. |
| S4 | Sticky section header swap | Scroll position is the tenant. | Pure CSS. Each section has its own `position: sticky; top: 0` header row. The next section's header pushes the previous one away. No animation. |
| S5 | One clip reveal | The arrival of the first big card. One authored moment. | `clip-path: inset(0 0 100% 0)` to `inset(0)` on the first card only, 600 ms `cubic-bezier(0.23, 1, 0.32, 1)`, on first paint or on the first intersection. Allowed once per page. Never on every card. |
| S6 | Scroll-triggered correction | A problem sentence becomes its result as the card becomes current. | strike-index's edit (strike 260 ms, clip write-in 340 ms, 220 ms delay), fired once when the card crosses the middle of the viewport (IntersectionObserver, threshold 0.6). The edit ends the sentence, its space is reserved, nothing else moves, the corrected state stays. |

### 2.2 Rules

- Prefer CSS scroll-driven animations (`animation-timeline: view()` and `scroll()`, `animation-range`). Wrap them in `@supports (animation-timeline: view())`. The fallback for a scroll-linked animation is the static end state, not a JS polyfill.
- Scroll-triggered (once) motion uses IntersectionObserver. Use motion's `useScroll` only when a scroll value must change React state (for example which log row is current), read it with `useMotionValueEvent`, and write a `data-current` attribute. Never set React state per frame.
- Animate `transform`, `opacity` and `clip-path` only. No `top`, `height`, `width`, `margin`. No CSS-variable updates on a parent per frame.
- Scroll-linked animations are `linear` on the timeline; put the curve into the keyframes. Timed animations use `cubic-bezier(0.23, 1, 0.32, 1)` for enter and move, `cubic-bezier(0.77, 0, 0.175, 1)` for a thing that moves on screen. Never `ease-in`.
- Durations: feedback 100 to 160 ms, UI state 150 to 300 ms, one explanatory moment up to 600 ms. A hairline draws in 180 ms. A fade-out is faster than its fade-in.
- No scroll-jacking: no smooth-scroll library, no wheel capture, no vertical-to-horizontal conversion, no pinned section longer than one viewport of extra scroll. `scroll-snap-type: y proximity` is allowed on a card stack; `mandatory` is not.
- Keyboard changes state with no travel: a key moves the current card and the page jumps (`scroll-behavior: auto`), nothing animates.
- Hover may start an explanatory animation only when it runs once per element and the state stays. Gate hover behind `@media (hover: hover) and (pointer: fine)`.
- Reduced motion: scroll-linked animations off (`animation: none`, end state shown). Sticky stays, because position is not motion. Hairlines appear with no draw. Corrections switch state with no transition. Cross-fades stay at 120 ms. Nothing moves.
- Phone at 375 px: a card sticks only when its height is 70 vh or less. Otherwise it does not stick. The first screen (812 px minus the header) shows the first big card's plate and its result line.
- Evidence: for every scroll-linked animation capture frames at three set scroll positions (for example scrollY 0, 240, 480) in a GPU browser. For every timed animation pause with `document.getAnimations()` at a set `currentTime` (for example 40%, 60%) and capture. Name the file by its real position or time. Two end states that look the same are not evidence.

## 3. Big card spec

A big card is the unit of work on the page. It shows a product, says what problem it solved, and names the role and year. It is not a bento tile and not a glass card.

### 3.1 Sizes

| Viewport | Card | Plate inside | Text |
| --- | --- | --- | --- |
| 1440 × 900, one column | 1200 × 720 (5:3), centred, 120 px side margin | 1200 × 600, top, ends on a whole row | one row under the plate, 120 px tall |
| 1440 × 900, with a side column | 880 × 560 card, 280 px text column at its side, 40 px gap | 880 × 440 | the column: id, name, problem → result, role, year |
| 375 × 812 | 343 wide (16 px gutters), height 560 or less | 343 × 258 (4:3) for web plates; 343 × 410 (5:6) for a phone screenshot pair | under the plate, 16 px padding |

The first card's plate and its result line fit in the phone first screen.

### 3.2 What a card shows

1. A plate: a live recreation (`care`, `design-system`, `live-room`, `reader`, `wallet`, `doc-chat` from src/lib/recreations.tsx, invented data) or a public screenshot from public/showcase, public/mobile, public/personal/shots at its native ratio. The plate ends on a whole row. No device frame. No inner background band.
2. One line: problem → result, 18 words or fewer, from CONTENT.md or caseNarratives.ts. Example: "One billing report ran 16 queries and timed out → 2 queries." If the project has no real problem, write what shipped, plain, with no arrow.
3. Role and year in mono: "Frontend and mobile · 2023–26".
4. One text link, 44 px tall: "Open the case →" to /work/<slug>. No filled button.

Name and employer are small. The product and the result are large.

### 3.3 Chrome

- Radius 12 px on every card on the page. Controls are pill or 6 px; pick one per draft and keep it.
- Elevation declared once: either a 1 px line in the palette's line colour, or one soft shadow tinted from the ground hue (`0 12px 32px -16px`). Never both.
- Live plates: mount once. One live plate per viewport; the others are screenshots until they enter (the recreations are `preloadable`). A state change must not remount the care chart.
- Images carry `width` and `height`. The first plate is eager; the rest are `loading="lazy"`.

### 3.4 States (Emil)

| State | Behaviour |
| --- | --- |
| Hover (pointer: fine) | The line colour darkens, 160 ms `ease`. The link underline offset moves from 4 px to 2 px. No lift, no scale, no image zoom. A card is seen tens of times; reduce. |
| Press (card is a link) | `transform: scale(0.985)` 120 ms `cubic-bezier(0.23, 1, 0.32, 1)` on `:active`; release returns in 160 ms. |
| Focus-visible | 2 px outline in the accent, 2 px offset, radius 14 px. Never removed. |
| Current (in a stack or a rail) | The id in mono turns to the accent; the log row with the same id turns to the accent. Nothing else. |
| Loading (live plate) | A plain surface in the plate's ground colour at the final size. No spinner. No skeleton of fake rows. |

## 4. Six directions

Ids are new; none exists in src/drafts. Fonts are in public/fonts and public/fonts/creative; declare them with `@font-face` in the draft's CSS with the exact family names from public/fonts/creative/SOURCES.md.

### K1. `pinned-decisions` (combination)

**Hook:** ten decisions, each one a big card whose consequence is pinned to the pixel that proves it.

**Takes and fixes:**

| From | Part | Fix (round-2-review.md) |
| --- | --- | --- |
| decision-record | the log of ten: id, decision in an action verb, Result in mono | Drop the Status column; show "Superseded" only on 0004. Cut the three routine rows (RN upgrades, fork upkeep, route middleware) and replace them with decisions that have a Result: the billing report (16 → 2), the Nuxt 3 rebuild (34 routes, 270+ components), the design system (36 components, 805 tokens, 20 releases), one React Native codebase for both stores, the Vue-to-React route-by-route move, four languages in one interface, English/Arabic right-to-left, the chatbot runtime as a package, the time-off app's 16 security tests, the studio site's 972 KB → 337 KB. Ten. |
| decision-record | the number that travels from Context to Consequence | Hide the source number while the ghost travels; start counting after the ghost has left the source. |
| margin-notes | the hairline from a note to the pixel; the note that reads the screen | Route around other markers; end at a pixel. One pin per card: a number rides, a sentence points, never both. |
| round-3 theme | S1 sticky card stack, big cards | The stack is the log in order; the sticky log at the left reads the scroll. |

**Layout, 1440:**

```
+----------------------------------------------------------------------------+
| Gentrit Rashiti builds web and mobile products. 10 decisions, 2021–2026.   |  identity line, 18 px
+------------------+---------------------------------------------------------+
| 0010 Vue → React |  +---------------------------------------------------+  |
|      route by    |  | 0010  Move one route at a time, parity-tested     |  |  big card 880×560
|      route       |  |  [ care recreation, live ]        o--------------- |  |  hairline from the
| 0009 16 → 2      |  |                                   | Consequence:  |  |  consequence to the
| 0008 36 comps    |  |                                   | a route moves |  |  org switcher
| 0007 one RN code |  |                                   | only after... |  |
| 0006 34 routes   |  +---------------------------------------------------+  |
| ...  (sticky)    |  +--- next card, 24 px below, sticks over the first --+  |
+------------------+---------------------------------------------------------+
```

Left: the log, sticky, 280 px. Right: the stack of ten big cards (S1). The current card's row in the log is in the accent. On load the first card is current and its hairline is already drawn to the organization switcher, with the caption "Switch the organization: the data changes, the controls stay." Scroll: the next card slides up and covers the first (native scroll, S1 scale and fade on the leaving card). When a card becomes current, its pin fires once: a hairline draws (180 ms) to the part, or the number rides from Context to Consequence (460 ms, source hidden).

**Phone, 375:** identity line; the first card (343 × 560: plate 343 × 258 with one numbered marker, then Decision, Consequence, Result); cards stack without sticky when taller than 70 vh; the log is a compact list at the end with "10 decisions ↓" under the identity line.

**Why this motion means something:** the stack puts the decisions in order under the reader's thumb; the pin shows that each consequence is visible on a real screen. Nothing animates that does not explain.

**Palette, chalk and cobalt:** ground #F3F4F0, surface #FFFFFF, ink #111418, muted #4E5662 (6.7:1 on ground), line #D8DBD2, accent cobalt #1D3FE0 (6.7:1 on ground; the hairline, the marker, the outline, the current id). The plates keep their product palette inside their border only.

**Type:** Bricolage Grotesque (BricolageGrotesque-Latin.woff2, `opsz` auto, 600 for decisions at 28 px, 400 for text at 17 px) and JetBrains Mono (JetBrainsMono-Latin.woff2, 500 for ids and Results). Two faces.

**Not slop because:** no hero, no name at 72 px, no cards of icon plus heading. A decision log with a live screen per decision is not a project grid. The stack is the only scroll motion and it is the order of the log.

**Biggest risk:** ten live plates. Rule: the care and design-system recreations are live; the other eight cards use public screenshots. One live plate per viewport.

### K2. `statement-of-record` (combination)

**Hook:** one sentence says who he is; every clause cites a decision; the decisions correct themselves as they are read.

**Takes and fixes:**

| From | Part | Fix |
| --- | --- | --- |
| release-brief | the statement with one cite per clause | No year rail, no version numbers, no rewrite over time. Identity once: the statement is the identity line. Each clause cites a different decision. |
| strike-index | the edit ends the sentence, space reserved, corrected rows stay, a tally counts | Strike only a real constraint. Drop "React Native 0.63 → 0.81" (an upgrade is not a problem). Rewrite "Vue to React" so that the corrected sentence reads as a sentence. Remove the caret glyph; a constraint row has a dotted underline instead. |
| decision-record | the log of ten with Results | Same ten as K1. |
| cited-claims | the cited words marked in the row | Mark the words in the Consequence that prove the clause, once, with the accent underline. |
| round-3 theme | S3 statement into header; S6 scroll-triggered correction; big cards | The statement stays as a sticky header while the cards pass; a card's problem sentence corrects itself once when the card becomes current. |

**Layout, 1440:**

```
 Gentrit Rashiti builds                                   statement, 48 px, three clauses,
   a multi-tenant care platform, ........ 0010             each with a dotted leader and a cite
   from the design system ............... 0008
   to the API behind it. ................ 0009

 [ card 0010: care recreation 1200×600 ]
   One billing report ~~ran 16 queries and timed out~~ runs 2 queries.    <- corrected on load
   Full stack · 2026                                   Open the case →

 [ card 0008: design-system recreation ]
   ...
```

On scroll the big statement fades and moves up (S3) and a one-line header takes its place: "Gentrit Rashiti builds a multi-tenant care platform ↳0010, from the design system ↳0008, to the API behind it ↳0009." The cite of the current card is in the accent. Each big card carries its Context sentence under the plate. When the card becomes current (S6), the constraint is struck and the Consequence writes in after it. The tally in the header counts "3 of 7 corrected". Rows with no constraint are plain. The first card is corrected at load, so the phone first screen shows one correction without a tap.

**Phone, 375:** the statement at 30 px (three lines, cites at line ends); the header appears after 200 px of scroll; cards full width; the correction fires on the same intersection rule.

**Why this motion means something:** the sentence that introduces him stays on screen while the page proves it, clause by clause; the strike is the result replacing the problem.

**Palette, mint and forest (two-colour identity):** ground #E9F2EC, surface #F4F9F5, ink and accent forest #0F2E1F (12.8:1), muted #3F5A4C (6.6:1), line #C6D8CC. The strike, the cites, the underline and the tally are all forest. Only one colour on a tinted ground; the identity is the pair.

**Type:** Literata (Literata-Latin.woff2, `opsz` auto, 500 at 48 px for the statement with `letter-spacing: -0.015em`, 400 at 17 px for text) and Gentrit Technical Mono (GentritTechnicalMono-Latin.woff2, 400 for cites, ids, tally). Two faces.

**Not slop because:** the page is a document that cites itself; there is no slider, no preview column, no version number. A serif is justified here because the device is a written statement with citations, and Literata is a reading face, not a display costume.

**Biggest risk:** the statement in a serif on a tinted ground reads as "editorial AI". Rule: no italic, no drop cap, no hairline rules between sections, no eyebrow. The cards carry the page.

### K3. `year-stack` (combination)

**Hook:** scroll through six years; one sentence at the top rewrites to what was true in that year.

**Takes and fixes:**

| From | Part | Fix |
| --- | --- | --- |
| release-brief | the year rewrite of the statement; the one-line strike; "struck words are always the 2026 words" | No drag rail: the scroll is the rail. A leaving clause fades to opacity 0 before its width shrinks (no cut glyph). One rewrite per settled year. The care plate mounts once. No version numbers; the year is the label. |
| decision-record | the Result in mono on each row | Each year card lists its two to four decisions with Results. |
| margin-notes | the hairline from a consequence to the pixel | One pin per year card, on the card's plate. |
| round-3 theme | S1 sticky stack, S3 sticky statement, big cards with a committed colour region | Each year is one big card; the current year's card is the butter panel. |

**Layout, 1440:**

```
 Gentrit Rashiti ~~builds a multi-tenant platform~~ builds mobile apps,       sticky, 28 px, one line,
 ~~from the design system~~ from the first screen ~~to the API~~ to the store. rewrites per current year

 +-- 2021 ---------------------------------------------------------------+
 |  2021                                [ Dukagjini Bookstore, 3 phones ] |   big card 1200×720,
 |  One React Native codebase, iOS and Android · Result: both stores     |   year numeral 160 px
 |  Push deep links, animated details, checkout                          |   on the butter panel
 +-----------------------------------------------------------------------+
 +-- 2022 ... (sticks over 2021) ----------------------------------------+
```

Six cards: 2021 (Dukagjini Bookstore, Sadaqah app), 2022 (Read to Feed, EPUB prototype, chatbot runtime), 2023 (care platform on Vue, Viva Fresh, Bayyinah TV rebuild starts), 2024 (Incentiv), 2025 (member portal, chatbot web port), 2026 (React rewrite, Design System v2, Laravel API, Offday, FJALË). Years and facts from projects.ts. The card that is current is the butter panel; the others are white. The statement at the top rewrites once when a card becomes current (S6 timing: strike 260 ms, write-in 340 ms, one line, no word crosses a line). Each card has one pin: a hairline to the plate's part that proves the Result, drawn once.

**Phone, 375:** the statement at 20 px, two lines, sticky under the header; cards full width without sticky; the first screen shows "2026" and the care plate, because the page opens on 2026 at the top and scrolls down to 2021 (newest first, so the first card is the strongest).

**Why this motion means something:** the scroll is time. The sentence at the top tells you who he was at that time, and the card under it proves it.

**Palette, butter and navy (two-colour identity, committed):** ground #FFFFFF, current-card panel butter #F8EC7A, ink and accent navy #101C3D (13.8:1 on butter, 16.7:1 on white), muted #3B4663 (9.4:1 on white), line #E3E4DA. No third colour. The strike is navy.

**Type:** Gentrit Display (GentritDisplay-Latin.woff2, Hubot Sans, `font-stretch: 112%`, 800 for year numerals at 160 px, 600 at 28 px for the statement) and Gentrit Text (GentritText-Latin.woff2, 400 at 17 px for text, 500 for Results). Numbers in Gentrit Text with `font-variant-numeric: tabular-nums`. Two faces, one family.

**Not slop because:** a year is not a version. The rail is gone; the scroll is the control. One saturated panel moving down the page as the reader scrolls is a committed colour strategy, not an accent sprinkled on grey.

**Biggest risk:** release-brief's collision returns. Rule: the statement has exactly three clauses, each clause has at most five words in every year, and the builder captures the rewrite at 40% and 70% for every year transition.

### K4. `workspace-rail` (combination)

**Hook:** the page is one app shell with a workspace switcher, and scrolling is switching.

**Takes and fixes:**

| From | Part | Fix |
| --- | --- | --- |
| tenant-switch | the switch as navigation; the "found in other workspaces" search | No filled button, no card border, no breadcrumb, no explainer sentence. The switcher's own list says what it is: "Vianova 2021–now · 4", "Agency work 2021–26 · 3", "Incentiv 2024 · 1", "AvahiTech · 1", "Personal 2026 · 2". The identity line is one line, not the headline. |
| decision-record | the log with Results | Decisions per workspace (three to five rows each), not projects (twelve). |
| cited-claims | the claim line at 40 px | Each workspace section opens with one claim it can prove: "Two platform rewrites." (Vianova), "Three apps in both stores." (Agency work), "A smart-wallet UI in two languages." (Incentiv). The claim's cited words are marked in the rows. |
| margin-notes | the pinned plate | Each section's big card pins (S2) while its rows scroll past; a row's hairline draws when the row crosses the pin line. |
| round-3 theme | S4 sticky section header swap, big cards | The switcher is the sticky header of each section. Scrolling into the next section swaps it. |

**Layout, 1440:**

```
 [ Vianova 2021–now ▾ ]   Search in Vianova            Gentrit Rashiti · web and mobile   sticky header,
 ----------------------------------------------------------------------------   one row, 56 px
 Two platform rewrites.                                                         claim, 40 px
 +------------------------------------+   0010  Vue → React, route by route, parity-tested
 |  care recreation, 880×560, pinned  |   0009  Billing report 16 → 2 queries
 |                                    |   0008  Design System v2: 36 components, 805 tokens
 +------------------------------------+   0004  Vue app: profiles, care plans, claims, 4 locales
 ... scroll ...
 [ Agency work 2021–26 ▾ ]  Search in Agency work      (header swaps by S4)
 Three apps in both stores.
 +----- Bayyinah TV live room --------+   0007  Nuxt 3 rebuild: 34 routes, 270+ components
```

The switcher is a real control: open it (click, arrow keys, Cmd+K) and pick a workspace; the page jumps to that section with no travel. The tint of the chip and the row dots change per workspace; nothing else is tinted. Search in a workspace that finds nothing offers "Found in Agency work · 3".

**Phone, 375:** the same sticky header at 48 px; the claim at 28 px; the big card 343 × 258, not sticky; rows under it.

**Why this motion means something:** scroll position is the tenant. The header swap is the stable-shell rule from his own work: the data changes, the controls stay.

**Palette, white and tenant tints:** ground #FFFFFF, ink #141414, muted #525252 (7.8:1), line #E5E5E5. Tints only on the chip and the row dots: Vianova teal #0E7C7B, Agency work indigo #4338CA, Incentiv ochre #8A5300, AvahiTech slate #475569, Personal rose #BE185D. Every tint is 4.5:1 or more on white so that the chip text can be the tint. Links and the current id use ink, not tint.

**Type:** Libre Franklin (LibreFranklin-Latin.woff2, 600 at 40 px for claims, 400 at 16 px for rows) and Martian Mono (public/fonts/MartianMono.woff2, 400 for ids, counts, Results). Two faces.

**Not slop because:** the shell is the thing he built. There is no headline about himself, no table header, no card chrome; the page is a header, a claim, a screen and rows.

**Biggest risk:** the SaaS costume (round-2 review). Rule: the header is one row with the switcher, the search and the identity line; no buttons; no second bar; rows are text with a dot.

### N1. `same-behaviour` (bold new)

**Hook:** the same screen twice; press one control and both change. That is parity, shown.

**First screen, 1440:** one identity line; two plates side by side at 46% each (big cards 620 × 440 without side column), labelled in mono "Nuxt 2, 2023" and "React, 2026"; under them one control row with three text controls: "Switch organization", "Toggle unit", "Open alert"; one line under the row: "A route moves to React only after this test passes on both apps." Then the areas named in CONTENT.md as mono rows: patient profile, care plans, labs and vitals, claims, calls, chat.

**The motion:** the paired change. A control updates both plates at the same time (200 ms cross-fade of the changed part only), and a mono check appears between the plates: "same behaviour ✓" (opacity 120 ms). Nothing else moves. Keys change state with no travel. There is no scroll motion in this direction; the decision is deliberate. On the phone the control row is sticky at the bottom (56 px, `env(safe-area-inset-bottom)`), so the pair and the control are on one screen.

**Phone, 375:** the two plates stacked at 343 × 258 each; the first screen shows the top plate and the top of the second; the sticky control row at the bottom.

**Palette, white and one green:** ground #FAFAFA, ink #111111, muted #4B5563 (7.2:1), line #E4E4E7, accent green #15803D (4.8:1 on the ground) for the check and the focus outline only. Both plates share one neutral chrome; the only difference between them is the product's own style.

**Type:** Gentrit Text (GentritText-Latin.woff2, 500 at 22 px for the identity line, 400 at 16 px) and Gentrit Technical Mono (labels, controls, the check). Two faces.

**Not slop because:** no portfolio shows its proof as a live A/B of the same screen. The pair is the navigation; the obsession is one (parity). No frames, no tilt, no shadow: not a device fan.

**Biggest risk:** the Vue-era plate. src/worlds/healthcare/Recreation.tsx has one skin. Build the pair from the same component mounted twice, with the draft's own CSS scoping a `data-era="nuxt"` wrapper (chrome colours, radius, type) and no change to the shared file. If the skin cannot be made with CSS alone, the pair becomes two organizations side by side (Northwind Clinic, Harbor Health) and the line changes to "Each organization sees only its own data"; that is still a true behaviour. Second risk: two live plates on the first screen. Measure paint; if the chunk or the frame time fails, the second plate mounts on first intersection.

### N2. `proven-cv` (bold new)

**Hook:** the CV everyone asks for, as real text, with a proof pinned to every claim.

**First screen, 1440:**

```
 Gentrit Rashiti                                     +--------------------------------+
 Web and mobile, full stack since 2026 · Kosovo      |  care recreation, 560×350      |  sticky proof card,
                                                     |  pinned to the current claim   |  560 wide, S2
 Experience                                          +--------------------------------+
 2023–26  Vianova, care-management platform          |  0010 · Vue → React, parity-tested
   Moved the frontend from Vue to React, one route    |  Result: a route moves only after
   at a time, parity-tested. o-------------------------  its test passes on both apps.
   One billing report, 16 queries → 2.
   Design System v2: 36 components, 805 tokens.
 2023–26  Bayyinah TV
   Full Nuxt 3 rebuild: live streams, HLS, subscriptions, English/Arabic.
 2022–25  Read to Feed
   About 14 releases to both stores, RN 0.63 → 0.81.
```

Left: the CV at 16 px in a 62ch measure: name small, one role line, Experience with four entries and at most four claim lines each, Personal with three lines, Skills compact, Education one line (UBT). Every claim line ends with a mono marker (a number, not a sticker). Right: one sticky proof card (S2), a big card of 560 × 350 plus a text foot. As the reader scrolls, the claim line that crosses the pin line becomes current: its hairline draws (180 ms) from the marker to the proof card, and the card's plate swaps (120 ms cross-fade) to that claim's proof: a live recreation, a store screenshot, or a number with its source line. "Download CV" at the top and the bottom gives the same document as a PDF.

**Phone, 375:** the CV text; the proof for the first claim open under its claim at load (343 × 258); other proofs open inline on tap (clip, 200 ms), one open at a time, the tapped line holds its position.

**Why this motion means something:** a CV line is a claim; the hairline and the swap show which proof belongs to which claim while the reader scrolls at reading speed. A line with no marker is a line with no proof, which is honest.

**Palette, cold grey and signal red:** ground #EEF0F2, surface #FFFFFF, ink #141A22, muted #4A5361 (6.8:1), line #D3D7DD, accent red #C8102E (5.1:1 on ground) for markers, hairlines and the current marker only. No warm tint anywhere.

**Type:** Archivo Narrow (ArchivoNarrow-Latin.woff2, 400 at 16 px for the CV with `line-height: 1.5`, 600 for entry names) and Gentrit Technical Mono (dates, markers, the proof foot). Two faces. A condensed grotesk and a plain mono read as a record, not an editorial page.

**Not slop because:** nobody pins proof to a CV line. There is no hero, no statement, no grid. Work is on the first screen because the proof card is already open at load.

**Biggest risk:** a wall of words. Rule: at most four claim lines per entry; at most six markers on the first screen; one proof open at load; the proof card and the first entry fit in 900 px.

## 5. Builder checklist

Rules from LOOP-BRIEF.md and round-1:

- [ ] Lives at src/drafts/<id>/ (Draft.tsx default export, CSS, meta.json). Only touch your folder. Band "Loop 3".
- [ ] Works at 375 × 812 and 1440 × 900. No horizontal scroll at 375.
- [ ] Every control is reachable by keyboard; keys change state with no travel.
- [ ] Every target is 44 × 44 px or more.
- [ ] Reduced motion: scroll-linked animations off, hairlines appear with no draw, corrections switch state, nothing moves.
- [ ] Text contrast 4.5:1 (body) and 3:1 (large text, outlines, hairlines). Measure the computed pairs; do not guess.
- [ ] Lazy chunk 150 kB gzip or less. No new dependencies. Check with `npm run build` and read the chunk size.
- [ ] Mid-animation capture for every claimed motion: three scroll positions for scroll-linked motion, two paused times for timed motion, in a GPU browser. Name files by the real position or time.
- [ ] Light ground. One accent, or one two-colour identity. Per-item colour only where the colour is the content (K4 tints).
- [ ] No strike where there is no real problem.
- [ ] The phone first screen shows work, not only words.
- [ ] Score "original" strictly. Write the lowest point and why into meta.json `holdback`.
- [ ] Slop count 0 against CREATIVE-CONSULT §1.2.

Rules for round 3 builders, copied from round-2-review.md:

- [ ] A number that travels leaves its source. Hide or dim the source while the ghost moves; start counting only after the ghost has left.
- [ ] A fold does not cut a glyph. Fade a leaving clause to opacity 0 before its width shrinks, or hold its width until it is invisible.
- [ ] Mount the shared care recreation once. Its chart draws for 1.1 s on mount; a state change must not remount it.
- [ ] Capture the drag path, not only the clicks. A drag across several stops must apply one change at the settled stop.
- [ ] No instruction text. If the page needs "Select one to keep only…", "Press ⌘K to switch", "Keys 1 to 3 select a claim", the control is not clear. One short caption at the control is allowed.
- [ ] One identity line on the first screen. Not a top-bar subtitle plus a statement, and not "Frontend and mobile developer, full stack since 2026" as the story.
- [ ] A hairline routes around other markers and ends at a pixel, not in empty space.
- [ ] A live plate ends on a whole row. No clipped cards, no inner background bands, no device frame.
- [ ] A column that reads the same in 9 of 10 rows is noise. Show only the exception.
- [ ] Do not repeat the claim under its proof.
- [ ] Hover may trigger an explanatory animation only when it runs once per element and the state stays.
- [ ] Keep the mid-frame rule. Name a frame by its real time; a file named `-120ms` that equals the end state is not evidence.

Rules new in round 3:

- [ ] Scroll motion only from the canon (S1 to S6). Fade-up on sections, parallax, smooth-scroll libraries and horizontal conversion are rejected.
- [ ] One live plate per viewport; the others are screenshots until they enter.
- [ ] A big card follows §3: sizes, one result line of 18 words or fewer, role and year in mono, one text link, radius 12, elevation declared once.
- [ ] No eyebrow labels, no section numbers unless the number is the content (decision ids are content), no gradient text, no glass.
- [ ] Two faces per draft: one text family and one mono. A third face only when the brief names it.
- [ ] Facts only from CONTENT.md, projects.ts, caseNarratives.ts. Vianova work only as the existing recreations with invented data.

## 6. Polish track (from round 4 on)

Owner's rule, 2026-10-05: the loop no longer replaces its best work each round. From round 4 on, the top two drafts by review score are kept and polished in place against the reviewer's defect list. Two to four new combinations are still added each round. The target is 63 of 70 or more.

How a polish round runs:

1. The reviewer's "Top 3 problems" for the draft become the polish list. The builder fixes those and nothing else; a new idea goes into a new draft, not into a polished one.
2. The builder keeps the draft's id, folder and meta.json; `rounds` increments; `holdback` is rewritten; a `polishLog` array in meta.json records each round: `{ "round": 4, "fixed": ["..."], "score": 55 }`.
3. The reviewer re-scores the polished draft on the same seven points with the same strictness and writes a new row in the table below. A polished draft that loses points is noted, and the loss is a finding.
4. A draft leaves the polish track when it reaches 63 or when two polish rounds in a row gain fewer than 2 points. In the second case it is parked, and the next-ranked draft takes its slot.

Scoring table template (one table per tracked draft, in round-N-review.md):

| Round | 1 Point | 2 Calm | 3 Harmony | 4 Motion | 5 Seniority | 6 Original | 7 Hooks | Total | Fixed this round | Open defects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 8 | 8 | 8 | 7 | 8 | 7 | 6 | 52 | — | number travel source visible; hook off the first screen; Status column |
| 3 | | | | | | | | | | |
| 4 | | | | | | | | | | |

Round-3 seeding: the two slots are decided by the round-3 review. decision-record and margin-notes are the current holders (52 and 51). If a round-3 combination beats them, it takes the slot and the older draft stops, because its parts live inside the combination.

## 7. Round-3 log line

To add to LOOP-BRIEF.md's round log when the round is built: `| 3 | pinned-decisions, statement-of-record, year-stack, workspace-rail, same-behaviour, proven-cv | pending | |`. The DraftMeta `band` union, `bands` array and `sequence` in src/drafts/DraftApp.tsx need the "Loop 3" entries once, added by the coordinator, not by builders.
