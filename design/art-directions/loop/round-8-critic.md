# Loop 8 critic: projector (home), sampled-frame (polish); two-readers, proof-tiles, then-now (new); case pages and 404

Critic: fresh. I built none of this work. I judged from the builder PNG files, the source, and my own captures. I did not trust builder claims. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Self-scores are in brackets. Scores are whole numbers.

Abbreviations: `S` = `.../scratchpad/review/`, `C` = `.../scratchpad/crit8/` (my scripts and captures).

## What I measured myself

- **Probe at 5 widths** (`C/probe8.mjs`, output `C/p1`, `C/p4`, `C/p5`, each `probe.json`). Every route at 1440 × 900, 1280 × 800, 1024 × 768, 390 × 844 (mobile) and 375 × 812 (mobile), cache off. For each: layout-shift sum (PerformanceObserver, buffered) over load and over a fast scroll (20 steps down and back at 16 ms), horizontal overflow, nearest text to each screen edge, targets under 44 px, and 14 real Tab presses (focus ring present, focused element covered by a sticky part, focused element off screen).
- **Slow fonts** (`C/fontdelay.mjs`, output `C/fd/`). Every `.woff2` request held for 2.5 s. I logged when the first heading is in the DOM, when it is visible, and the layout-shift sum.
- **Reduced-motion pairs.** `S/r6check/diff.mjs` on 8 builder pairs (projector top and 02, sampled-frame top, two-readers top, proof-tiles reduced top and static, then-now top and 04). All 8 have 0 differing pixels.
- **Spacing values** (`C/sp.json`). Every vertical margin, padding and gap outside the plates at 1440, checked against 0/1/2/4/8/12/16/24/32/48/64/96.
- **Mid-motion frames.** My wall-clock frames of the projector row change (`C/mo/pj-02-060…end`) all show the end state, so they prove nothing about timing. For timing I used the builder's paused-animation frames (`S/loop8/*/final/*-NNNms.png`) and looked at each one.

### Craft results for all routes

| Route | CLS load (all 5 widths) | CLS fast scroll | CLS with fonts 2.5 s late | Blank time with fonts 2.5 s late | Focus visible (14 Tabs) | Targets under 44 px (outside plates) | Phone edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| projector "/" | 0 | 0 to 0.0002 | 0.0006 | 1.2 s, and the page shows a grey ground with an empty dark box (`C/fd/_-375-d2500-1300.png`) | yes, none covered | CV 22 × 44, Email 42 × 44; at 1024 the plate store links are 75 × 30 | result band starts at 9 px (−7 px hang) |
| sampled-frame | 0 | 0 to 0.0002 | 0.0022 | none | yes; Tab also enters the live wallet plate (4 stops) | CV 23 × 44; live-plate controls down to 51 × 27 at 375 | band 18 px; phone hairline at x 16 |
| two-readers | 0 | 0 | 0.0012 | none (text at 0.4 to 0.6 s) | yes; the switch is one stop | Email 44 × 44 | 24 px |
| proof-tiles | 0 | 0 | 0 | up to 1.5 s (fonts cap) | yes | Email 39 × 44 | 16 px |
| then-now | 0 | 0 | **0.084** (the 1 s cap ends, then the fonts arrive) | 1.0 s | yes | none | band 14 px from the right edge at 375 |
| /work/* | 0 | 0 | 0.0005 | 1.5 s of blank field (lazy route waits for fonts) | yes | CV 22 × 44, Email 42 × 44 | band at 9 px |
| 404 | 0 | 0 | — | 1.5 s (same wait) | yes | CV, Email | 16 px |

No route has horizontal overflow. No focused element is covered by a sticky part. Spacing is on one scale in every draft. The off-scale values are band paddings (3, 6, 7 px) and centring offsets (40, 72, 83, 94 px). proof-tiles has no off-scale value.

---

## Scores

| Point | projector "/" | sampled-frame | two-readers | proof-tiles | then-now | case pages + 404 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 Straight to the point | 9 [9] | 9 [9] | 8 [9] | 9 [9] | 9 [9] | 8 [—] |
| 2 Not overwhelming | 8 [8] | 8 [8] | 8 [8] | 7 [8] | 8 [8] | 8 |
| 3 UI/UX harmony | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 |
| 4 Meaningful motion | 8 [8] | 8 [8.5] | 9 [8] | 7 [8.5] | 9 [8] | 7 |
| 5 Actions and seniority | 9 [9] | 8 [8.5] | 8 [8] | 8 [8] | 9 [8] | 8 |
| 6 Original | 7 [7] | 7 [7.5] | 8 [7] | 6 [7.5] | 7 [7] | 7 |
| 7 Hooks | 8 [8] | 8 [8] | 8 [8] | 7 [8] | 8 [8] | 7 |
| **Total /70** | **57** [57; polish array 58] | **56** [57.5] | **57** [56] | **52** [57] | **58** [56] | **53** [no self-score] |
| Plain copy /10 | 8 | 8 | 9 (hiring-manager view) | 7 | 8 | 8 |
| Slop count | 0 | 0 | 0 | 1 (giant name + subtitle) | 0 | 0 |

Ranking: then-now 58, projector 57, two-readers 57, sampled-frame 56, case pages 53, proof-tiles 52.

Trend for the polished drafts: projector 56 → 57 (+1, the first gain in two rounds). sampled-frame 57 → 56 (−1: its new first rows copy projector, and its first plate lost its labels).

---

## 1. projector (live "/") — 57 [57]

### What round 8 closed (with evidence)

- It opens on a live product. Row 01 is the public Bayyinah TV pricing page. The ring on the Monthly/Annual switch proves the result ("Members pay monthly or yearly") (`S/loop8/projector/final/d-top.png`).
- The strongest result is on the first screen at 1440: row 02, "One billing report asked the database 16 times and gave up. → Now it asks 2 times and finishes". Its plate is a diagram: 16 outlined cells with "Gave up", and 2 filled cells with "Finished" in a ringed "Now" lane (`d-02.png`, `C/mo/pj-02-end.png`). This was the devil's main point. It is closed.
- Team work is stated: "Design system, with the team", "Teammates built the wallet".
- Store screens are at source pixels with a store-link panel (`d-04.png`, `d-08.png`). The 208 px paper strips are gone.
- Every first-screen line is plain. Plain copy went from 5 to 8.

### Why not more

- Point 5 holds at 9 only because of row 02. Row 01's result is the weakest line on the screen: every subscription site lets members pay monthly or yearly. It is a feature, not a result.
- Point 3 stays 8. Row 05's plate still prints `cobalt.600 → action.primary → button.solid.bg` and `tokens.css tokens.ts figma.json` on the home page (`d-05.png`). The copy rules ban token names on the home page.
- Point 2 stays 8. One state still has five "current" marks: the numeral fill, the band, the tray, the line and the plate.
- Point 6 stays 7. It is a sticky frame beside a scrolling log (the builder agrees).

### Craft QA

- **Spacing.** One scale. The phone gutter is 16 px, but the result band hangs −7 px, so its ink starts 9 px from the screen edge at 375 and 390 (`mark` rects `[9, 305]`). That breaks the 16 px edge rule.
- **1024 × 768** (`C/p1/_-1024.png`). The identity line takes 6 lines. Row 01's band breaks into two ragged bands ("Members pay / monthly or yearly"). The role line wraps with a dangling "·" ("FRONTEND, CORE TEAM · / 2023–26"). Row 02 is below the fold.
- **Jitter.** CLS is 0 at all five widths, on load and on a fast scroll. Builder mid-frames `d-01to02-100ms` and `d-load-line-090ms` show a cross-fade and a half-drawn line, with no text movement.
- **Font wait (measured).** With fonts 2.5 s late, `.pj[data-wait]{visibility:hidden}` also hides the chartreuse field. For 1.2 s the visitor sees the body's grey ground and one empty dark rectangle (`C/fd/_-375-d2500-1300.png`). Then the fallback text shows. When the real fonts arrive, CLS is only 0.0006. So the wait prevents almost no shift and costs 1.2 s with no name on screen. Also, `index.html` preloads `Archivo.woff2`, which "/" does not use. It does not preload Public Sans or Big Shoulders.
- **Phone first screen** (`C/p1/_-375.png`). The 4:3 crop of the pricing page shows the switch, then "Price" with an empty dark row, then "100+ Courses". The price is outside the crop, so the plate looks broken. "01 / 08" under the frame and a 64 px "01" 50 px below it show the same index twice.
- **UX.** Focus is visible on every stop. No stop is covered. The CV link is 22 px wide.

### Copy

| Line | Problem | Plain rewrite (same facts) |
| --- | --- | --- |
| "The video-learning platform, rebuilt from an empty page: 34 pages." | "empty page … 34 pages" reads as wordplay. A recruiter cannot tell what "page" means in each place. | "A video-learning platform, built again as a new app: 34 pages." |
| "→ Members pay monthly or yearly" | A feature, not a result | "→ Members subscribe on the web, iPhone or Android" (caseNarratives: Stripe, Apple and Google subscriptions; the same web app inside both apps). Put the ring on "Start 7-Day Free Trial" (subscribe). The caption carries the two apps. |
| Row 05 plate: `cobalt.600`, `action.primary`, `button.solid.bg`, `tokens.css / tokens.ts / figma.json` | Token names on the home page | Use the button-set plate (as sampled-frame and then-now do), or plain labels: "Main blue → main button", "One source → code and Figma". |

Unsupported claims: none. "Live at bayyinahtv.com", "34 pages", "about 14 updates", "client organizations" and "teammates built the wallet" all trace to CONTENT.md and caseNarratives.

### Polish list (ordered by score gain; one pass each)

1. **Seniority (protects the 9), hooks +0 to 1.** Row 01 result → "Members subscribe on the web, iPhone or Android". Move the ring to the trial button. Evidence: `d-top.png`.
2. **Font wait (craft, point 3).** Remove `visibility:hidden` from `.pj`. If a wait stays, hide only the text and keep the field and the plate, with a cap of 300 ms or less. Preload `PublicSans-Latin.woff2` and `BigShouldersDisplay-Latin.woff2` on "/". Drop the Archivo preload from "/". Evidence: `C/fd/_-375-d2500-1300.png`; CLS 0.0006 without the wait.
3. **Harmony +1 candidate.** Row 05: no token names. Show the button set. Evidence: `d-05.png`.
4. **Phone first plate.** Crop rows that hold the switch and "$11.00 / month" together. Do not leave an empty "Price" row. Evidence: `C/p1/_-375.png`.
5. **1024 × 768.** Keep the row 01 band on one line (a shorter result, or a 5-line identity). Do not wrap "· 2023–26" (`white-space: nowrap` on the year). Evidence: `C/p1/_-1024.png`.
6. **Phone edge.** Remove the −7 px band hang at 540 px and below, so the ink starts at 16 px.
7. **Phone index.** Show "01 / 08" under the frame or the big numeral, not both.
8. **Target.** Give CV and Email at least 44 px of width (padding).

---

## 2. sampled-frame (polish) — 56 [57.5]

### What round 8 closed

- No more clipped token names. The first plate is whole at every width.
- The "Sampled from the screen: N°" line is gone.
- The old ring leaves at t = 0 of the circle (`d-spread-01to02-020ms.png`).
- The care chart is drawn before its row shows.
- Neighbouring hues now differ (31, grey, 185, 23, 254, 78, 282) (`C/states-sampled-frame.png`). This is the best colour run the loop has had.
- Copy is plain, and "with the team" is stated.

### Why it went down

- **Point 6, 8 → 7.** The first screen is now projector's first screen. It has the same identity sentence, the same rows 01 and 02, the same copy, the same type, the same log, numerals, tray and caption. The builder says so in the holdback. The wall colour is the only difference above the fold.
- **The first plate lost its meaning.** The 4:5 crop at native pixels holds only the Premium column. So it shows "$11.00 / month" over four checkmarks with no labels (`d-top.png`, `C/p1/_drafts_sampled_frame-1024.png`). On the 375 phone, "/ month" is about 8 to 10 px.
- **The ring and the result do not match.** The ring on "$11.00 / month" proves a price. The result says "Members subscribe on the web, iPhone or Android".

### Craft QA

- CLS is 0 on load and on scroll at all widths. It is 0.0022 with late fonts (no wait, so nothing is blank).
- The phone hairline still runs in the 16 px gutter at x 16 (`C/p1/_drafts_sampled_frame-375.png`).
- Tab enters the live wallet plate at 1440 ("0x7a3F…9c21 Copied", "Receive", "Send Demo only", "Sign in with passkey"). Demo controls get keyboard stops on a home page.
- Live-plate buttons are 27 to 33 px high at 375 and 390.
- Spacing is on one scale. Phone gutters are 24 px.

### Copy

| Line | Plain rewrite |
| --- | --- |
| Caption "One report, before and after. No screen." | "One billing report, before and after. A diagram." |
| Result "Members subscribe on the web, iPhone or Android" with the ring on the price | Keep the line. Ring the trial button, or crop to the switch. |

All other lines are plain and supported.

### Polish list (only if it is kept)

1. **Original +1.** Make the first screen different from projector. For example, open on the colour wall with care (185) or Viva Fresh (23), not Bayyinah TV.
2. **Harmony.** Crop the first plate so the tick rows keep their labels (a wider crop at less than 1.0, or the left column).
3. **Phone.** Remove the hairline in the gutter, as projector did.
4. **UX.** Make plates that are not current `inert`, so Tab does not enter the hidden wallet.

---

## 3. two-readers (new) — 57 [56]

### What works

- **The idea.** A switch, "Read as: Hiring manager · Engineer", rewrites every line. The default is plain. The engineer view names the tools (`d-eng-top.png`). No portfolio in the research does this. It answers the owner's copy problem without deleting facts. Point 6 is 8: the switch is new, but the frame around it is projector's.
- **Motion with a meaning.** The builder frames `d-switch-060/160/260/400/560ms` show a pen strike along each line, a fade, then a clip-path write-in, top to bottom. The motion shows "the same fact, said for the other reader". A key switch swaps at once. Reduced motion: 0 px difference. Point 4 is 9.
- **The best font behaviour of the round.** Text is visible at 0.4 to 0.6 s. CLS is 0.0012 with fonts 2.5 s late. Nothing is hidden.
- **Calm and harmony.** Paper, one vermilion accent, Newsreader and JetBrains Mono. The face change marks the reader. Phone rows each carry their own 4:3 plate (`m-700.png` … `m-4700.png`). This is a designed phone layout, not a squeezed one.

### Why not more

- **Point 1, 8.** The first screen has no product screen, only the 16 → 2 card. A visitor also has to read a control ("Read as") before the work. The first real product (Bayyinah TV home) is at about y 900.
- **Point 7, 8.** The hook is behind a click. A recruiter in the default view may never press "Engineer".
- **Harmony.** Row 07's plate prints token names (`cobalt.600`, `action.primary`, `button.solid.bg`) in the hiring-manager view (`C/states-two-readers.png`, `d-07.png`). The reader plate keeps an empty lower half. The Incentiv crop keeps about 90 px of dark ground (the builder agrees).

### Craft QA

- CLS is 0 on load and on scroll at all five widths. Gutters: 106 / 66 / 48 px on desktop, 24 px on phone.
- The switch is a radio group with one Tab stop. The ring is visible. Every "Read the case study" link has a name.
- The sticky switch bar does not cover a focused element.
- Live-plate controls on phone are 34 × 34 (the reader's A−, A+ and page buttons).

### Copy

| Line | Problem | Rewrite |
| --- | --- | --- |
| Engineer identity: "Rewrites: Bayyinah TV on Nuxt 3, the care platform from Vue to React." | Drops "Part of" and so claims ownership. CONTENT §0 says "Part of two platform rewrites". | "Part of two rewrites: Bayyinah TV on Nuxt 3, the care platform from Vue to React. Kosovo, remote." |
| Row 07 plate token names (hiring-manager view) | Jargon on the default view | Show the button set in the hiring-manager view. Keep the token card for the engineer view only. |

The hiring-manager lines are the plainest in the round. "trips to the database" is the best plain unit in the loop.

### Polish list

1. **Point 1 +1.** Put a real product screen on the first screen: for example, Bayyinah TV as row 01 and the 16 → 2 card as row 02 (projector's order). Or show a real screen beside the card at 1440.
2. **Copy and truth.** Engineer identity: "Part of two rewrites…".
3. **Harmony.** Button set in the hiring-manager view for row 07. Crop the reader plate to its text and progress bar. Crop the Incentiv plate to the sign-in card with 24 px or less of ground.
4. **Hooks.** Make the switch tell the visitor what it does, in under 8 words, next to the control: "Same facts, said for an engineer". The note under the bar already says this, but it is 13 px muted text.
5. **UX.** Make live plates `inert` on phone, or give their controls 44 px.

---

## 4. proof-tiles (new) — 52 [57]

### What works

- **Fastest 5-second read.** The name, one sentence, and six results with their proof crops are all on the first screen (`d-top.png`). The billing tile leads, as the vermilion "16 → 2". The proof underlines rhyme with the rings. This is a good small idea.
- **Cleanest craft.** One 16:10 ratio and one caption shape. Subgrid rows align. Spacing has no off-scale value. Gutters are 48 px (desktop) and 16 px (phone). CLS is 0 everywhere.

### Why it scores lowest

- **Point 6, 6.** A giant name with a smaller subtitle line, over a grid of thumbnails. That is the known template the loop brief bans ("no giant name + grey subtitle"). The builder agrees the grid is the most familiar layout.
- **Point 2, 7.** Six tiles and six project names above the fold. The research display rule says one large piece of work and no more than three readable project names (PORTFOLIO-RESEARCH §3 rules 1 and 2).
- **Point 4, 7.** The only motion is hover or focus feedback: a ground tint and a dimmer that closes on the ring. It is correct but small. On touch, the current tile changes about 0.6 s after the scroll.
- **Point 7, 7.** No one moment to remember.

### Craft QA

- **Invalid nesting (a11y).** Each tile is an `<a>`, and the live recreations inside it hold 40 buttons and links (`C/ptn` eval: 40 interactive elements inside `a.pt-tile-link`). A screen reader names the care tile "Northwind Clinic, Patient 4821 Patient 4821 Care manager…" and the design-system tile "Button Hierarchy, sizes, toast Publish Preview Cancel…". The names should be the captions.
- The "Recreation · invented data" label covers the chart's x-axis label "7" on the care tile (`d-top.png` x 258).
- Fonts: the page is blank up to 1.5 s while the fonts load, then fades in 200 ms. CLS is 0.
- Focus is visible. On phone, a Tab move scrolls smoothly, and the focused "Case" link ends flush at the bottom edge (`C/ptf/pt-m-tab14.png`).

### Copy

| Line | Problem | Rewrite (same facts) |
| --- | --- | --- |
| "Visitors join the mission or get the apps." (bayyinah.org) | "the mission" means nothing to a recruiter. It is a feature. | "The institute's public website, live at bayyinah.org, with links to both app stores." |
| "Readers search the catalogue and buy books on sale." | A feature, not a result | "Search, sales and checkout, live in both app stores." |
| Index: "Upkeep: runs on newer Macs for testing, and shadows fixed." | Unclear | "Maintenance: the app builds again on newer Macs, and its shadows show correctly." |
| Index: "One call-activity screen with demo data, as a design reference." | "call-activity" is internal | "One screen of the care app, made with demo data as a design reference." |
| Role slot "Mobile, about 14 updates shipped" | A result in the role slot | Role "Mobile". Put "About 14 updates to both stores" in the caption. |

### Polish list

1. **Original +1, slop −1.** Set the name inside the identity sentence at text size, as the other drafts do: "Gentrit Rashiti builds web and mobile apps…".
2. **Calm +1.** First screen: one large lead tile (16 → 2) plus two tiles. The other tiles go below the fold.
3. **A11y.** Make the tile media `inert` and name each link with its caption (`aria-labelledby`).
4. **Copy.** Make the two feature captions into results (table above).
5. **Harmony.** Move the recreation label off the chart axis.

---

## 5. then-now (new) — 58 [56]

### What works

- **The clearest first screen of the round.** "THEN One billing report asked the database 16 times and gave up." is struck. "NOW It asks 2 times and finishes." is in a blue band. The frame shows a struck 16 → a ringed 2, with 2 of 16 squares filled (`d-top.png`). A recruiter reads problem → result in one line. A founder reads that the work is change made to a live product.
- **Motion that explains a change.** Builder frames `d-load-strike-100ms`, `d-load-write-320ms`, `d-load-line-80ms-into-draw`, `d-row04-strike-100ms` show: strike, then write, then the line. Only three rows strike, because only three have a measured problem that is gone. The others show an earlier state in grey, or "Shipped". This is the brief's motion rule 4 at its most literal. Point 4 is 9. Reduced motion: 0 px difference.
- **Seniority, point 9.** Rows show size of change (16 → 2, 34 pages, most screens moved, 96.6%, 972 → 337 KB), and they never invent a "before".

### Why not more

- **Harmony stays 8.** The plates are often half empty:
  - Row 01: about 140 px of empty frame under "REQUESTS TO THE DATABASE" (`d-top.png` y 610–750).
  - Row 04: the button card is half empty above and below its two button rows (`d-04.png` y 180–340 and y 540–720).
  - The row 01 hairline goes up past "ONE BILLING REPORT" along the frame top, then down to the 2 (`d-top.png` y 153). It travels across the plate instead of entering at the 2's height.
- **Point 6, 7.** It is projector's frame plus year-stack's strike (the builder agrees).

### Craft QA

- CLS is 0 on load and on scroll at all five widths. Spacing is on one scale. Phone edges are 16 px, but the band reaches 14 px from the right edge at 375 ("Rebuilt from an empty page: 34 …").
- **Late fonts break CLS 0.** The text waits 1 s. With fonts 2.5 s late, the page shows fallback Georgia-like text at 2.2 s ("It asks 2 times / and finishes." on two lines, a thin "16"). When Literata and Anton arrive, the layout moves: CLS 0.084 (`C/fd/_drafts_then_now-375-d2500-2300.png` against `-4000.png`). The page is both blank for 1 s and moves later.
- Phone: no hairline; the ring alone marks the proof. Orphans: "plans." and "app." each on their own line (reel `then-now-2/3.png`).
- Focus is visible. The tray uses a roving tabindex. No stop is covered.

### Copy

| Line | Problem | Rewrite (same facts) |
| --- | --- | --- |
| "One care app for many client organizations, on its 2023 code." | "on its 2023 code" is unclear | "Many client organizations use one care app, first built in 2023." |
| "It downloads 96.6% less." | Less of what? | "It downloads 96.6% less code." |
| "An app that used one button downloaded far more code than needed." | Plain, but long | "An app that used only the button downloaded the whole library." |
| Rows labelled "SHIPPED" also show "NOW" | "NOW" says something changed. Nothing did. | Label the second line "RESULT" on shipped rows. |
| "Rebuilt from an empty page: 34 pages and paid plans." | The same "page / pages" wordplay | "Built again as a new app: 34 pages and paid plans." |

Unsupported claims: none. "Version 1 …" is supported by caseNarratives ("Its second version is a full rebuild"). "Owner, studio website" and "972 KB → 337 KB" are in CONTENT §7.

### Polish list

1. **Harmony +1.** Fill the plates. Scale the 16 → 2 figure to the frame, or shorten the frame to the content. Crop the button card to its two rows. Route the row 01 line at the 2's height.
2. **Craft (CLS 0 with late fonts).** Preload Literata and Anton, and add fallback faces with `size-adjust` / `ascent-override`. Or wait for `document.fonts.ready` with no 1 s cap, but keep the field visible. Evidence: CLS 0.084 above.
3. **Copy.** The five rewrites above (most important: "96.6% less code", and the SHIPPED/RESULT label).
4. **Phone.** Use `text-wrap: balance` on bands and lines, so "plans." and "app." do not stand alone. Keep the band 16 px from both edges.

---

## 6. Case pages (/work/<slug>) and 404 — 53 [no self-score recorded]

### What works

- The case pages now share the home page's type, field, numerals, frame, tray and hairline. The ring proves each part's line.
- The facts row (Role · Years · Platforms · Live) matches research rule 24. The title is the result in plain words (`care-platform-1440-top.png`, `C/p4/_work_bayyinah_tv-1440.png`).
- CLS is 0 at all widths. Focus is visible. "Next case" is reachable.
- 404: "There is no page at this address." plus a list of every case, with one plain line each. That is the useful part.

### Defects

- **Crops cut UI.**
  - The Bayyinah TV library crop cuts the "All" chip in half at the left frame edge, and leaves about 50 px of empty dark band at the top (`C/p4/_work_bayyinah_tv-1440.png` x 519, y 83–133). Research rule 8: never cut a button.
  - Phone crops are 342 source px shown at 343 css px. They are 1.0 in CSS, but they are soft on 2× and 3× screens (`bayyinah-tv-375-scrolled.png`, "Ramadan LIVE 2026").
- **Phone rhythm.** The result band touches the plate under it with 0 px gap ("only." band → Premium plate, `bayyinah-tv-375-scrolled.png`). Bands leave one-word orphans ("only.", "one library.", "patients.").
- **Proof lines that are features, not results.**
  - Viva Fresh result part: "The cart keeps the discount and the total in view."
  - Dukagjini result part: "Favourite lists and book categories in one panel."
  - Incentiv result part: "The sign-in screen is public."
  - Care "What was built" part: the paragraph is about the screen-by-screen move, but its proof is "Each organization sees only its own patients".
- **Team.** Design System v2 role is "Design system". The home page says "with the team". projects.ts says "The team defined …".
- **Wording.** "The second version was rebuilt from an empty page: 34 pages." has the same wordplay as the home page.
- **404 repeats itself four times**: "ERROR 404", "There is no page at this address.", "404 PAGE NOT FOUND", "This address has no page." On the phone, the 404 frame pushes the case list below the fold (`404-375-top.png`).
- **Fonts.** The lazy route waits up to 1.5 s for fonts, so a slow visitor sees a blank chartreuse field for 1.5 s.

### Copy

| Line | Rewrite (same facts) |
| --- | --- |
| Design System role "Design system" | "Design system, with the team" |
| Viva Fresh result proof "The cart keeps the discount and the total in view." | "Live in the App Store and on Google Play." |
| Dukagjini result proof "Favourite lists and book categories in one panel." | "Live in the App Store and on Google Play." |
| Incentiv result proof "The sign-in screen is public." | "Live at portal.incentiv.io, in English and French." |
| Bayyinah TV "The second version was rebuilt from an empty page: 34 pages." | "The second version is a new app, built from nothing: 34 pages." |
| 404 caption "This address has no page." and "PAGE NOT FOUND" | Delete both. Keep "There is no page at this address." |

Supported: "Most screens rebuilt…" (caseNarratives line 17), "fees saved" (caseNarratives "gas saved"), "Parents confirm each account by email" (CONTENT §4).

### Polish list

1. **Harmony.** Crop on whole UI: start the library crop on the chip row's left edge. Remove the empty top band.
2. **Seniority.** Make the three result proofs into results. Write "with the team" on the design system page.
3. **Phone.** Put 16 px between a band and its plate. Use `text-wrap: balance` on bands.
4. **404.** Remove the repeats. On phone, put the case list before the 404 frame.
5. **Fonts.** Same fix as the home page: preload the two faces and do not hold the route for 1.5 s.

---

## Answers to the three questions

**(a) Are projector and sampled-frame too similar to keep both?** Yes. They now share the identity sentence, rows 01 and 02, the copy, the type pairing, the log, the numerals, the tray, the caption and the hairline. The only difference above the fold is the wall colour. sampled-frame's first plate is also weaker (four ticks with no labels, the ring on a price). **Keep projector and park sampled-frame.** Its colour run (31 → grey → 185 → 23 → 254 → 78 → 282) is the one idea worth keeping on file.

**(b) Which draft should be the home page after polish?** **then-now**, after polish items 1–3. It has the clearest 5-second read in the loop (problem struck, result written, 16 → 2 figure). Its motion explains a change, not a "current" state. It shows seniority as change made to live products, without invented numbers. Projector is the safe choice for this week if the owner wants no switch. Projector keeps its place only if its row 01 result becomes a real result (projector item 1). two-readers is the best second page or alternative. Its switch is the most original idea of the round, but its first screen has no product screen.

**(c) Projector's two open decisions:**
- **No hairline on phone: keep.** On phone, the ring plus the band next to it read clearly (`m-03.png`). The line that is left in sampled-frame at x 16 still reads as a stray border (`C/p1/_drafts_sampled_frame-375.png`).
- **Hide text until fonts load (cap 1.2 s): change.** Measured with fonts 2.5 s late, the wait shows a grey ground and an empty dark box for 1.2 s, because `visibility:hidden` on `.pj` also removes the field. After that, the fallback faces cause only CLS 0.0006 when the real fonts arrive. So the wait costs 1.2 s and prevents almost nothing. Fix it in three steps:
  1. Remove the hide, or hide only the text, with a cap of 300 ms or less.
  2. Preload Public Sans and Big Shoulders on "/".
  3. Remove the unused Archivo preload from `index.html` for "/".

  Apply the same fix to the case route's 1.5 s wait.
