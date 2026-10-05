# Round 8: devil's advocate (projector, sampled-frame, two-readers, proof-tiles, then-now, case pages, 404)

Evidence. Desktop first screens `review/thumbs8/*.png` (1440 x 900). Phone tops `review/loop8/<id>/final/m-top.png` (375 x 812). Builder frames `review/loop8/<id>/final/*`. New captures and DOM measurements in `scratchpad/devil8/` on the live dev server (:5240), 2026-10-05: `devil8/m1` (targets, overflow, CLS on 8 pages at 1440 and 375), `devil8/w/pj-1024.png`, `case-1024.png`, `case-390.png`, `404-390.png`, `pt-1280.png`. Facts checked against `CONTENT.md`, `src/content/projects.ts`, `src/content/caseNarratives.ts`, and (for one claim) `vianova-dashboard-react` `PLAN.md` on `main`.

Measured craft, all pages: no horizontal overflow at 1440 or 375. CLS 0.0000 on every page, except sampled-frame phone 0.0004. Tray slots are 44 x 44. One target fails the owner's 44 px rule on five pages: the top-left **"CV" link is 22 x 44 px** (projector "/", sampled-frame, `/work/*`, 404; 19 x 44 on projector phone). Its label "CV" also does not say that it downloads a PDF.

## Objections that apply to all five drafts

1. **Five drafts, one message.** All five use the same identity sentence word for word: "Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them." Four of five show 16 → 2 in the first viewport, and three lead with it. The candidates differ in skin, not in what a reader learns. The owner does not choose between five pages. The owner chooses between five themes for one page.
2. **The level is missing.** The owner's bar says that in 5 seconds a visitor knows "his level". Only proof-tiles says "5+ years". No draft says "senior". Projector, sampled-frame, two-readers and then-now give no years and no rank on the first screen (`grep "5+ years"`: proof-tiles only).
3. **The lead exhibit is off-role for the buyer.** The round-7 devil asked for 16 → 2 to be shown big, and the builders did it. Now argue the other side. The reader is a founder who hires a *senior frontend/mobile* engineer. Three drafts open on a database fix, drawn as squares and not as a screen. To a peer, "16 queries → 2" is an N+1 fix: good work, but mid-level and backend. The line also has no size: 16 queries do not time out by themselves, so a peer asks how big the data was. A frontend portfolio that opens on its one backend item tells the founder that the frontend has no stronger result.
4. **The motion still says "this row is current" five times.** Round 7 objected. Projector's meta still lists a plate cross-fade, a numeral fill, a result-band wipe, an old-line fade and a new-line draw, and the tray slot fills too. Sampled-frame adds a wall-colour circle, which makes six. Then-now adds a strike and a ring. Not fixed.
5. **Real public screens exist but recreations are used.** Display rule 6 in PORTFOLIO-RESEARCH says to use a recreation only where the real screen is private. Read to Feed has public store screenshots with reading progress (`/mobile/reading-1.webp`, "Peter Rabbit, Read 36%"). Proof-tiles uses it. Projector, sampled-frame and two-readers show an Alice-in-Wonderland recreation, with a blank lower half (`sampled-frame/final/d-06.png`, y 430–670 empty).

---

## 1. Projector (home page, "/")

### First 10 seconds
- **Hiring manager.** Reads the identity line, then sees a large dark pricing table with a yellow ring on "Monthly / Annual (save 15%)". The highlighted result is "Members pay monthly or yearly". Why they leave: a monthly/annual switch is on every subscription site. Nothing says what *he* changed, and nothing on the screen says his level.
- **Founder.** Bayyinah TV first is good: a live product with paying members. Then the result is a pricing toggle. Row 02 is a backend diagram. The first mobile app is row 04 (about y 1,300). Why they leave: "I hire for mobile and frontend. The first screen sells me a toggle and a SQL fix."
- **Design-engineer peer.** Known on sight: sticky media beside numbered steps (the Scrollama "sticky graphic" pattern of pudding.cool), outlined condensed numerals that fill, an 01–08 tray. The hairline from the result to the toggle runs about 820 px (right 100, up 451, right 192, down 76: `thumbs8/projector.png`) to join two things about 300 px apart. Why they leave: competent scrollytelling, already seen, on a 2024 brat-green field.

### Generic or already seen
- Sticky graphic + steps: pudding.cool / Scrollama.
- Pale chartreuse #D9F26B with black ink: the 2024 "brat" palette. The meta gives chroma 94.7% outside the plates. The field is louder than the work it frames.

### Unclear or filler (exact lines)
- "Members pay monthly or yearly": a feature of the client's pricing page, not a result of the work.
- "Frontend, rebuilt screen by screen · 2023–26" (row 03): the React rebuild is 2026 (CONTENT.md §7b: "Care-management platform, React rewrite | 2026"). 2023–26 is the Vue app. Round 7 found this year error. The jargon is fixed, but the error is still there.
- "Colours and sizes are set once, for code and Figma" (row 05): the reader cannot tell why this matters.

### Claims a reader could doubt
- "Part of two platform rewrites": supported, but the page never says which two.
- Row 05 now says "The team built 36 building blocks" and "with the team". This fixes the round-7 objection.
- Row 07 Read to Feed: "About 14 updates shipped to both stores" is correct and in the past tense.

### Visually weak
- **Phone first exhibit proves nothing** (`projector/final/m-top.png`): the crop shows "Monthly / Annual", then "Price" with **no price**, then "100+ Courses" with no tick. The one screen on the phone's first view is a header strip of a table.
- **Viva Fresh frame** (`d-04.png`): the left 284 px of the 880 px frame (32%) is a white panel with "LIVE IN BOTH APP STORES" and two links. The right part shows a @3x store screenshot at 1:1 CSS px. The UI is about 2.3 times its real phone size (the bell icon is 58 px), so it looks zoomed in, not crafted.
- **16 → 2 diagram** (`d-02.png`): inside the "Now" box, the two bars use about 70 px of an 810 px wide box. About 540 x 220 px of the box is empty.
- **At 1024** (`devil8/w/pj-1024.png`): the H1 wraps to 6 lines in a 300 px column. The role line breaks as "FRONTEND, CORE TEAM ·" / "2023–26", so the separator hangs at the end of a line.

### Spacing and UX
- The "CV" link is 22 x 44 px (19 x 44 on phone).
- Phone: the index shows two times. "01 / 08" is beside the pinned frame and a 64 px "01" is under it (`m-top.png`, `m-04.png`). Round 7 found this. Not fixed.
- Phone: the pinned frame takes y 0–315 of 812, so 39% of the screen is permanent. On a 667 px phone it is 47%.

### Round-7 objections: status
Fixed: the page opens on a token table (now Bayyinah TV); team or solo on the design system; "parity-tested"; the filler rows 04 and 09. Not fixed: five current-row signals; the double index on phone; the 2023–26 year on the rebuild; "lead with a solved problem" (the lead row has a feature, not a problem).

### The single change
Give row 01 a result that is a change made by the work, and ring the part that proves it: "Rebuilt from an empty page: live classes, Arabic right to left, subscriptions on web, iPhone and Android", with the ring on a live or Arabic screen from `public/showcase/bayyinah/`. Put "5+ years" in the sub-line.

### Radical alternative
Drop the log. Show three exhibits only, each a full-width real screen with one line: Bayyinah TV (web), Viva Fresh (mobile), the care recreation (platform). Then one line "Also: the billing report, 16 → 2". This is one idea, no tray, and no hairline.

---

## 2. Sampled-frame

### First 10 seconds
- **Hiring manager.** Pink page, maroon wall, black screenshot: three heavy masses. The plate is a Premium column with four ticks and **no row labels** (`thumbs8/sampled-frame.png`, x 862–1298). Ticks for what? The ring is on "$11.00 / month". Why they leave: "the price of someone else's product is the first exhibit."
- **Founder.** The result is "Members subscribe on the web, iPhone or Android", but the ring is on a price. Nothing on the plate proves web, iPhone or Android. Why they leave: the claim and the proof do not match.
- **Peer.** It is projector plus a colour taken from the artwork, the Apple Music and Spotify now-playing background. Why they leave: two known ideas joined, and the builder says so ("the wall colour and the 4:5 frame are the only differences on the first screen").

### Generic or already seen
- A background colour taken from the artwork: Apple Music and Spotify now-playing screens.
- Rows 01 and 02 are now the same as projector's rows 01 and 02.

### Unclear or filler
- "One report, before and after. No screen." (caption on the 16 → 2 wall): the reader does not need to know that it has "No screen".
- "36 building blocks, 20 releases in about six weeks" (row 05): the result does not say who used them. The dashboard is not in production (CONTENT.md §6b).

### Claims a reader could doubt
- "Frontend, rebuilt screen by screen · 2023–26": the same year error as projector.

### Visually weak
- **Brown is still there.** The reader wall (hue 78) is brown (`d-06.png`, wall about #6F3F00), and the builder admits it. Round 7 found it. Not fixed. The 16 → 2 row adds a dead grey wall (#4F4F4F, `d-02.png`) beside a grey page.
- Plate at 1440: about 100 px of the page's own dark ground at the left of the Premium card (x 762–862).
- Phone (`m-top.png`): a 56 px dark strip at the left of the crop. "01 / 07" and a 64 px "01" show the index two times.
- Phone (`m-04.png`): the hairline runs in the 16 px gutter at x ≈ 16 from y 184 to y 480, along the screen edge.

### Spacing and UX
- The "CV" link is 23 x 44 px. Three indexes of seven items remain: the tray, the 96 px numerals, and "01 / 07" on phone.

### Round-7 objections: status
Fixed: the ellipsized token names, the clipped phone plate, the printed hue number. Not fixed: brown walls, three indexes, "two ideas from two drafts".

### The single change
Delete it as a separate candidate (see the ranking). If the wall idea is kept, move it into projector as one fixed wall colour.

### Radical alternative
Keep the colour rule but delete the log: one real screen per viewport, full-bleed ground from the screen, one plain line under it. That is "true-colour" (D2 in PORTFOLIO-RESEARCH), which no one has built.

---

## 3. Two-readers

### First 10 seconds
- **Hiring manager.** Calm serif page, then a switch "Read as: Hiring manager · Engineer" with the line "Same facts. The engineer view names the tools." The page explains its own trick before it shows work. The first exhibit is a vermilion card of tick marks, not a product. At 1440 and at 375, **no real product pixel is in the first viewport** (`thumbs8/two-readers.png`, `m-top.png`). Why they leave: they never touch the switch, so they get a well-set text page about a database fix.
- **Founder.** Turns the switch, because a technical founder is both readers. The H1 becomes "builds React, React Native and Vue apps in TypeScript, and the Laravel APIs behind them" (`d-eng-top.png`). That is a list of technologies, which the brief forbids. Why they leave: "the expert view is a skills list."
- **Peer.** Likes the idea. Then sees every line struck in red when the reader changes (`d-switch-260ms.png`). A strike means "wrong" or "removed". Here the plain words are not wrong, so the device sends a false signal. Why they leave: clever toggle, wrong mark.

### Generic or already seen
- A page-wide reader switch is a known docs pattern: Stripe Docs switches the code language for the whole page.
- The log and the sticky frame are projector's (the builder says so).

### Unclear or filler
- "Same facts. The engineer view names the tools." This is a legend for the mechanism.
- "Rewrites: Bayyinah TV on Nuxt 3, the care platform from Vue to React. Kosovo, remote." (engineer sub-line). See the next section.

### Claims a reader could doubt
- **The engineer view drops "Part of".** The plain view says "Part of two platform rewrites". The engineer view says "Rewrites: Bayyinah TV …, the care platform …", which claims both as his own. CONTENT.md §0 says "Part of two platform rewrites". Round 7 found the same overclaim in sampled-ground.
- "Progress per book, React Native 0.63 to 0.81": supported.

### Visually weak
- The first plate is a diagram on both widths. Two of eight plates are recreations where a real screen exists (the reader).
- During the switch at 260 ms, a faint pen line stays on the sub-line from x 380 to x 590 after its words are gone (`d-switch-260ms.png`, y 215).

### Spacing and UX
- Phone live plates have small controls: "Northwind Clinic" 125 x 31, "mmHg" 44 x 31, "A−/A+" 34 x 34, "Light/Dark" 56 x 22 (`devil8/m1`, 375 px).
- On phone, the rule under the sticky switch bar runs full-bleed, but the content is inset 24 px (`m-top.png`, y 372).

### The single change
Do not use a strike for the switch. Cross-fade the words (no strike), keep "Part of" in both views, and put a real screen in the first viewport (row 02 Bayyinah TV first, 16 → 2 second).

### Radical alternative
Make the switch the whole page: the hiring-manager view is three cases with screens, and the engineer view is a dense, dated changelog of all 30 projects with stacks. That is two layouts, not one layout with two fonts.

---

## 4. Proof-tiles

### First 10 seconds
- **Hiring manager.** Name, sentence, "5+ years", six pictures, six one-line results. This is the only draft that passes the 5-second test for level. Why they could still leave: six results compete. Nothing says which one matters, and the brief asks for "one idea per page".
- **Founder.** Sees web, mobile and a backend result in one glance. That is the best spread of the five drafts. Why they leave: it looks like every Framer portfolio grid. On hover, the tile goes **grey**. The hover dimmer makes the Bayyinah tile look disabled (`d-hover-bayyinah-end.png`: the tile drops to about #5A5A5A, and only the price box stays dark).
- **Peer.** Reads it as the designeng.tools / rauno.me/craft grid with red rings. The header is a 64 px weight-800 name over a 24 px sentence, with a black pill "Download CV". Why they leave: "template header, then a grid".

### Generic or already seen
- **Giant name + subtitle**: the brief's slop list (rule 6) bans it by name. brittanychiang.com made this header famous.
- A 3-column 16:10 tile grid with "Case →": designeng.tools, rauno.me/craft.

### Unclear or filler
- The lead tile says one fact four times: "Before, it timed out. Now it finishes." + "Database requests, one billing report" + "16 → 2" + the caption "One billing report: 2 database requests, not 16." (`thumbs8/proof-tiles.png`, x 48–480).
- "Visitors join the mission or get the apps." This is the client's marketing button ("Join the Mission"), not a result of the work.
- "Readers search the catalogue and buy books on sale." This is a feature list.
- "Mobile, about 14 updates shipped" (role field): a fact put in the role slot.

### Claims a reader could doubt
- "36 building blocks, released 20 times in about six weeks": supported, team stated. The ring is on one button row and proves neither number (the builder admits it).

### Visually weak
- **The "Recreation · invented data" chip covers the chart's x-axis** labels 1–7 in the care tile. A "7" shows beside the chip (`thumbs8/proof-tiles.png`, x 56–262, y 790–812).
- **Crops cut UI in half**, against display rule 8: Dukagjini "FAN F…" and the "ON SALE 35% OFF" chip are cut at the right edge. The Read to Feed crop ends on the empty top of the next card (`d-y760.png`). Incentiv "WalletConnect" ends 3 px from the tile edge.
- Vermilion underlines under proof words look like links, but they are not links. A visitor clicks "subscribe" and expects something to happen.
- 35 `<button>` elements are nested inside `<a>` tiles (they are inert, but this is invalid HTML).
- Chroma on the first screen is 12.1% (the builder's figure). The page is pale outside the lead tile.

### Spacing and UX
- Phone page height is 8,030 px (9 tiles + 30 index rows).
- Phone: on load the ground is already pink, because the tile in the middle of the screen is current (`m-top.png`). The colour change has no visible cause.

### The single change
Remove the dimmer and the grey hover. On hover, use only the 1 px ring and the ground tint. Then cut the first screen to three tiles (16 → 2, Bayyinah TV, Viva Fresh) at a larger size, so that one row is the idea.

### Radical alternative
No header block. The first tile is a full-width Bayyinah TV screen, with the name and one line set in its caption. The grid starts under it. The work is the hero and the identity is a footnote, which is the offgrid.inc reference in LOOP-BRIEF.

---

## 5. Then-now

### First 10 seconds
- **Hiring manager.** A beige page with **chroma 2.8%** (the builder's figure). The first sentence they must read is struck through: "~~One billing report asked the database 16 times and gave up.~~" A strike makes the problem, which is the context, the hardest line to read. Then a blue band: "It asks 2 times and finishes." "It" points back to the struck line. A legend explains the device: "Each row is one change to a product. A struck line is a problem that is now gone." Why they leave: a document with crossed-out words, and no product pixel in the first viewport (`thumbs8/then-now.png`).
- **Founder.** The concept is right: show change made to live products. But only three rows are struck, and two of them are weak. Row 05 is image compression on the owner's own studio site (972 KB → 337 KB), a five-minute task to a peer. Row 04 frames a measurement as a fixed problem (see below). Why they leave: the "changes" are small.
- **Peer.** The "crossed-out word → new word" hero is a common SaaS landing-page trope. The loop's own year-stack and brief drafts used it before. The sticky frame is projector's. Why they leave: the builder admits "original 7".

### Unclear or filler
- "Each row is one change to a product. A struck line is a problem that is now gone." It is a legend, and it applies to 3 of 8 rows.
- Read to Feed row: "SHIPPED … updated about 14 times in both stores" then "**NOW** It keeps each child's place in every book." (`d-05.png`). "NOW" in the present tense is wrong for an app whose store listings are removed (`projects.ts`: "App Store (archived)").

### Claims a reader could doubt
- **Row 04: "An app that used one button downloaded far more code than needed." → "It downloads 96.6% less."** The source is a measurement of a Button-only consumer (CONTENT.md §6b). It is not a fixed defect in a shipped app, and the dashboard that uses the system "is not in production yet". The strike says that a real problem in a real app is gone. A reader who opens the case page finds that no app is live.
- **Row 03: "Most screens rebuilt, each checked against the old app."** See the case page section: the dashboard repository's own record does not support "each checked".
- Row 05 Snaxx Tech: supported, but it is a personal site among client work.

### Visually weak
- The button-card plate (`d-04.png`): the buttons fill about 180 px of a 590 px tall card. About 160 px is empty above them and about 170 px below. The plate does not show 96.6% (the builder admits it).
- Phone first screen (`m-top.png`): the 16 → 2 figure, the struck line and the NOW band repeat one fact three times in 450 px.

### Spacing and UX
- No target failure on this page (`devil8/m1`). This is the only home candidate with a clean target pass.

### The single change
Do not strike the problem. Set it in plain muted ink and put the result beside it. Keep the strike only on the old number (16, 972 KB). Delete row 04's framing ("Each component builds alone, so a Button-only app downloads 96.6% less code") or move it to the case page.

### Radical alternative
Make every row a real before/after the visitor can flip in the frame: the old Bayyinah TV against the rebuilt one, if a public archived capture exists. If no honest "before" pixel exists for a row, that row is not in this draft.

---

## 6. Case page (`/work/<slug>`), read after a click from the home page

- **The click does not land where it promised.** Projector row 02 (16 → 2) says "Open the case" and goes to `/work/care-platform`. The H1 there is "Most screens rebuilt, each one checked against the old app." The 16 → 2 result is in part 03, about 1,700 px down. Row 03 links to the same page. Two different home results lead to one page that headlines neither.
- **The H1 claims more than the record shows.** `caseNarratives.ts` says "a route moves over only after its parity tests show the same behaviour in both apps." The owner's own `vianova-dashboard-react/PLAN.md` on `main` says "65 routes: 61 `building`, 4 `planned`, 0 `verified`" and "no route can reach `verified` today". No screen has moved over, and the parity run against both apps is a verify-stage step. "Each one checked against the old app" is the claim that a technical interviewer can break with one question. Do not publish the route counts. Rewrite: "Being rebuilt screen by screen. Each screen gets a test that runs the same steps on the old and the new app."
- **The hero does not prove the title.** The care hero is a vitals chart recreation. It proves neither "rebuilt" nor "checked". The Bayyinah TV case H1 is "Members subscribe on the web, iPhone or Android", but the hero is the library page (`case/final/bayyinah-tv-1440-top.png`). In that crop, the "All" chip is cut by the left frame edge (x 519), and the card meta ("9 Lessons 01h 53m") is about 7–8 px tall at 0.73 scale. It cannot be read.
- **Facts row contradiction.** Care case: Role "Frontend and mobile. Also builds the server side since 2026." Platforms "Web app and the server behind it". No mobile platform is listed, so the reader asks "mobile where?"
- **Phone first screen has no work.** At 390 x 844 (`devil8/w/case-390.png`), the full first screen is text: title, sentence, the facts table, then "01 THE PRODUCT". The LOOP-BRIEF rule says "the phone first screen shows work, not only words".
- **Orphan in a highlight.** "→ Each organization sees only its own / patients." The second band holds one word (`case/final/care-platform-1440-scrolled.png`, y 710). The same thing happens on phone (`case-390.png`, y 831).
- **The hairline lies on the card's own rule.** In part 02 the line runs along the card's top rule for about 790 px (x 500 → 1287, y 187) before it turns up to the switcher. It looks like a thick border, not a pointer.
- **Tray and 96 px numerals for three paragraphs.** "01 THE PRODUCT / 02 WHAT WAS BUILT / 03 THE RESULT" with an 01–03 tray is home-page machinery on a page that has three short sections. In parts 01 and 02 the frame does not change, so tray "02" shows the same chart as "01".
- **What a hiring manager takes away:** a chart of invented blood pressure, a claim they cannot check, and "Private app. Shown as a recreation." They do not learn what Gentrit decided.

**Single change:** make the title the clicked result, and make the hero prove it. For care-platform, either split it (one case for the server-side report, one for the rebuild) or open on 16 → 2 with the H1 "One billing report: 16 database requests became 2". Then write a true rebuild line.

## 7. 404

- It says the same fact four times: "ERROR 404", "There is no page at this address.", "404 PAGE NOT FOUND" in the frame, and the caption "This address has no page." (`thumbs8/404.png`).
- An 880 x 676 frame holds only the number. On phone the frame pushes the useful list below y 620 (`devil8/w/404-390.png`).
- The list repeats the doubtful care H1 ("Most screens rebuilt, each one checked against the old app").
- **Single change:** delete the frame and the caption. Keep the H1 and the list, and put the list first on phone.

---

## Ranking for the owner (plain words)

1. **Proof-tiles.** It is the easiest page for a busy reader. In 5 seconds it gives the name, "5+ years", and six real pieces of work. It is also the most familiar layout, and its header is the banned "giant name". Fix the grey hover, the cut crops and the header, and it is the safest page to ship.
2. **Projector.** It is calm, finished and already live. It opens on a real product. But the first result is a pricing toggle, the phone opener shows a "Price" row with no price, and the page does not say his level.
3. **Then-now.** It has the right idea for a senior engineer: show what changed. But it is very pale, it strikes the sentence that the reader must read, and two of its three "changes" are weak or framed as more than the source says.
4. **Two-readers.** It is the cleverest page, and the hiring manager will never use the switch. The engineer view becomes a skills list and drops "Part of".
5. **Sampled-frame.** It is projector with a coloured wall. Its rows 01 and 02 are the same as projector's. The walls are still brown or grey.

**Too similar to keep both: projector and sampled-frame.** They have the same rows 01 and 02, the same log, the same 4:5-type frame with a hairline, the same fonts (Public Sans and Big Shoulders), and the same tray. Only the wall colour differs, and the builder says so. Keep projector. If the owner likes the wall, make it projector's one option and retire sampled-frame.
