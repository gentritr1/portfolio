# Round 9: devil's advocate (projector, then-now, two-readers, proof-tiles, personal-studio)

Evidence. Desktop first screens `review/thumbs9/*.png` (1440 x 900). Builder frames `review/loop9/<id>/final/*`. My own live runs on :5240 (2026-10-05), with `seq.mjs` on port 9632, are in `scratchpad/devil9/`: `out1` (page height, positions of the own-projects band, targets under 44 px, image scale, fonts, at 1440 and 375), `out2` (full page text), `out3` (GitHub links, Offday tab-card boxes, CLS on personal-studio phone), `out4/tr-eng.png` (two-readers engineer view). I checked the facts against `CONTENT.md` and `src/content/projects.ts`.

Measured craft, all five pages: no horizontal overflow at 1440 or 375. The "CV" link is now 44 px tall on every page, and no target on projector, then-now or personal-studio is under 44 px. That round-8 defect is fixed. The CLS on the personal-studio phone is 0.

## Objections that apply to all five pages

1. **The Bayyinah TV pricing page is still everywhere.** The owner rule says "no two drafts open on the same screen". Projector still opens on it (`thumbs9/projector.png`). Then-now row 03 shows the same crop with the same ring on "Start 7-Day Free Trial" (`then-now/final/d-03.png`). Proof-tiles shows the same "$11.00 / month" Premium column in its first viewport (`thumbs9/proof-tiles.png`, x 960–1392, y 392–662). Three of five pages show one client's price table, and the leads are not fully separate.
2. **16 → 2 is still in or near the first screen on four pages.** It is in the first viewport of proof-tiles (the orange tile), row 02 of then-now (y 677), row 02 of two-readers, and row 02 of projector (y 725, `thumbs9/projector.png`). The reader still learns one thing in five skins.
3. **Offday has no link anywhere.** `projects.ts` has `links: []` for Offday. On every page, OFFBEAT and FORM get "Code on GitHub" but Offday gets nothing. Four pages call Offday "a working app" or "a product", but no visitor can open it or read its code. A founder asks "where is it?" and gets no answer.
4. **Personal work comes last on three of the four pages that are not about it.** The own-projects band starts at y 3,060 of 5,467 on projector (56% of the page), at y 3,164 of 4,838 on two-readers, and at y 2,179 of 3,485 on then-now. On the phone it starts at y 2,639 (projector), y 4,850 (two-readers) and y 3,867 (proof-tiles). The owner asked for the personal work to be *showcased*. On these pages it is a footer.
5. **"It remembers the page in every book."** Projector and two-readers say this in the present tense about an archived app. On two-readers the caption in the same viewport says "Shipped; the listings are now archived" (line at y 743, caption at y 805). Then-now fixed this ("It kept each child's place"). The screen also shows "Read 36%", which is a percentage and not a page.

---

## 1. Projector (home page, "/")

### First 10 seconds
- **Hiring manager.** "Builds web and mobile apps that people subscribe to, shop in and read with." Then comes a big dark price table. The thing they remember is "$11.00 / month". Why they leave: the first exhibit is someone else's price list. Nothing on it says what *he* did.
- **Founder.** Reads "5+ years" (fixed, good). Reads the result "Members subscribe on the web, iPhone or Android". But the ring is on the "Start 7-Day Free Trial" button (x 1058–1275, y 680–726). A trial button proves neither web, iPhone nor Android. On the phone the ring moves to a different element: "Watch anytime, anywhere—on mobile, tablet or desktop." (`projector/final/m-top.png`). That is the client's marketing copy, ringed as proof. Why they leave: the claim and the proof still do not match. This is the round-8 objection, unchanged.
- **Peer.** Same sticky graphic + numbered log + outline numerals as round 8. The hairline still travels about 826 px: right from the dot (x 330, y 605) to x 500, down to y 703, then about 558 px right *inside* the dark frame, across the empty row under "Workbooks & Quizzes", to the ring. Why they leave: nothing has changed since round 8 above the fold.

### Generic or already seen
- Sticky graphic + steps (pudding.cool / Scrollama), unchanged. The chartreuse "brat" field, unchanged.
- The own projects are rows 09, 10 and 11 of the same log, with the same outline numerals. Personal work becomes three more entries in a client list, not a separate showcase.

### Unclear or filler
- "...that people subscribe to, shop in and read with." The phrase "read with" is awkward. People read *in* an app (two-readers says it correctly).
- "FRONTEND, AND THE 2026 REBUILD · 2023–26" (row 03): the role slot now holds a sentence.

### Claims a reader could doubt
- "It remembers the page in every book" (row 07): see the shared objection 5.
- "Made outside client work: one working app and two design concepts." This is honest. But the working app has no link (shared objection 3).

### Personal work: does it look great?
- **Offday: yes, mostly.** `d-own-head.png` crops the "Make room for a break" dialog at native pixels (r = 0.50 on a 2x capture), light theme, and rings "Fri 6 – Wed 11 Nov · 6 days off for 3". It is a real and readable screen.
- **OFFBEAT and FORM: no. They are pasted, shrunk screenshots.** The 882 px frame shows the whole 1440 px OFFBEAT home page (logo to "Make it yours"), so the scale is about 0.61. The nav labels and "Portable speaker. Pocket drum machine." are about 8 px tall (`d-offbeat.png`, y 104 and y 217). This breaks the builder rule "plates fill their slot at native pixels". The hairline on OFFBEAT runs about 730 px straight across the hero at y 477, under "Drag to turn". On the phone (`m-offbeat.png`) the ring is on the speaker body only. The finish swatches are not in the crop, so "pick a finish" has no proof there.
- Proof-tiles shows the same two projects at native pixels (drum grid, trefoil formula), and they look far better (see §4).

### Spacing, jitter, UX
- The phone pinned frame takes y 237–495 of 812 (`m-top.png` at 2x, 474–990), so 32% of the screen stays fixed. This is better than 39% in round 8.
- Mid-frame `d-tab-best-crossfade-slow10x.png`: the hairline is cut at x 500, y 368 while the dialog fades in. It is mid-draw, not a jump. No jitter is proven.

### Round-8 objections: status
Fixed: "5+ years" in the sub-line, the "CV" target, the 2023–26 year on the rebuild (the row now says "2026 rebuild"), the phone "Price" row with no price. Not fixed: the lead result is a client feature and its ring does not prove it; the ~820 px hairline; four current-row signals.

### The single change
Replace the row-01 exhibit. Show a Bayyinah TV screen that proves the line (the Arabic right-to-left page or the live-class player, from `public/showcase/bayyinah/`). Then move "Own projects" up to directly after row 03, with OFFBEAT and FORM cropped at native pixels (the drum grid, the trefoil and its formula) as proof-tiles does.

### Radical alternative
Make the home page two halves of equal weight. Left: three client exhibits. Right: three own projects. Both are visible by the second viewport. The log, numerals and tray go away.

---

## 2. Then-now (lead: Snaxx Tech)

### First 10 seconds
- **Hiring manager.** "Gentrit Rashiti builds web and mobile apps, and rebuilds and fixes the ones people already use." Then the first exhibit is a parchment banner, "THE SNAXX ALMANAC", and two image-weight figures. Why they leave: the H1 promises apps that people use, and row 01 is the owner's own studio marketing site, with image compression as the result.
- **Founder.** "972 KB → 337 KB of pictures" is what a peer calls a five-minute squoosh pass. The round-8 devil said this about the same fact when it was row 05 ("a five-minute task to a peer"). The builder made it the *lead*. Why they leave: the first "fix" is the smallest item on the page.
- **Peer.** Strike → highlight → hairline → ring → blue panel → 01–10 tray. Why they leave: four signals for "this row is current", and a strike trope.

### Generic or already seen
- The crossed-out-number hero is a common SaaS landing-page trope (Linear/Vercel "before → after" pricing strips).
- The full-height saturated blue right panel with a white card is the Stripe Press / Readymag "split" layout.

### Unclear or filler
- "Snaxx Tech · OWNER, STUDIO WEBSITE" is row 01 of the client log, but Snaxx is an own project (`projects.ts`: `channel: 'personal'`). A separate "OWN PROJECTS" band starts later at y 2,179. The grouping contradicts itself.
- "About a third of the weight. Live at snaxxtech.com." This repeats the numbers above it in a third form.
- On the phone (`m-top.png`), the first exhibit is the parchment sky. The crop (y 236–380) has no app UI, only the "SNAXX ALMANAC" title and a paper plane.

### Claims a reader could doubt
- "the whole site 28 MB → 9.5 MB": the source says "deploy went from 28 MB to 9.5 MB" (`projects.ts`). A deploy bundle is not "the whole site" a visitor downloads. A peer will ask how a marketing site weighed 28 MB.
- Row 03 "Version 1 of a video-learning platform" → "Built again". This is supported.

### Personal work
- OFFBEAT and FORM are rows 09 and 10 with "Source on GitHub" (`d-end.png`). The FORM frame is a large native-pixel trefoil with the material ring on the swatches. That looks good. Offday (row 08) has no link.
- At the end the blue panel stops at y 659, but the page rule under it runs from x 48 to x 1392 and the blue runs to x 1440. The panel and the rule do not share an edge (`d-end.png`).

### Round-8 objections: status
Fixed: the whole problem is no longer struck (row 02 now strikes only "16 times and gave up"); the Read to Feed tense; the 96.6% wording ("for a page that uses only a button"); a real product pixel is now in the first viewport. New problem: the lead is the weakest fact on the page.

### The single change
Lead with the care-platform row or the Bayyinah TV row ("Version 1 → built again"), not Snaxx. Put Snaxx with the own projects, where its group says it belongs.

### Radical alternative
A then-now page with only two rows, each a real before/after pair at full width: Bayyinah TV v1 against v2 (if an archive capture exists), and the care report 16 → 2. Everything else goes on the index.

---

## 3. Two-readers (lead: Read to Feed)

### First 10 seconds
- **Hiring manager.** A calm serif H1 with "5+ years" in it (good), then a 560 x 220 px vermilion box at y 333–553: "Every line on this page is written twice: in plain words, or with the tools named." This is the loudest block on the left, and it explains the page's mechanism, not the work. Why they leave: they came for work and got instructions.
- **Founder.** Sees a real Read to Feed store screen with the ring on "Read 36%" (good, a public screen and not a recreation). Then reads "It remembers the page in every book", with "the listings are now archived" 62 px below it. Why they leave: the lead product is not available, and the page says so.
- **Peer.** The engineer view now keeps "Part of two rewrites" (`out4`, fixed). It still opens with "has shipped TypeScript for 5+ years: Vue and React on the web, React Native…": a stack list as the H1.

### Generic or already seen
- A whole-page reader switch is a docs pattern (Stripe Docs language switch).
- The left log + sticky right frame is projector's layout in a serif.

### Unclear or filler
- The legend box (quoted above). On the phone it fills y 318–542 (28% of the screen), and the first product pixel is at y 633 (`m-top.png`).
- "Part of two platform rewrites. The server side too, since 2026." The second sentence has no verb.

### Claims a reader could doubt
- "It remembers the page in every book": present tense for an archived app, and the screen shows a percentage.
- Rows 02 and 03 both link "Read the case study: the care platform" to one page. Two results lead to one case that headlines neither (round-8 case-page objection, still open).

### Visually weak
- The lead plate: under the ringed card, two cards say only "The Tale of Peter the Rabbit 2" and "…3" (y 305–577). That is about 270 px of what looks like placeholder data in the store screenshot.
- **OFFBEAT and FORM are pasted thumbnails.** Each 604 px card shows the full 1440 px home page, so the scale is about 0.42. "Portable speaker. Pocket drum machine." and "Three sculptures, made from mathematics." are about 6 px tall (`d-own-2.png`, y 213 and y 302). That is not readable, so the cards show only "a dark website with an orange box" and "a copper knot".
- The Offday frame (`d-own-1.png`) shows the full app at about 0.85 scale. The crop ends through the sidebar text "goes a long way." at the bottom edge.

### Spacing and UX
- "OFFBEAT on GitHub" is at y 4,513 and "FORM on GitHub" is at y 4,505 (`out3`). Two cards side by side, links 8 px apart. The gap above the link is about 35 px in one card and about 55 px in the other.
- The ↗ touches the word ("GitHub↗"), and the underline runs under the arrow. Projector and then-now put a space there.
- Phone live-plate controls are still under 44 px: "Northwind Clinic 125x31", "mmHg 44x31", "Small 41x24", "Add a task 30x30" (`out1`). Round 8 found this. Not fixed.

### The single change
Delete the legend box. Put the switch as a small two-option control in the top bar, and let the first viewport be the Read to Feed screen and its result. Change the result to the past tense.

### Radical alternative
Two pages, not one page with two fonts: "/": three cases with screens for the hiring manager; "/log": a dated, dense changelog of all 30 projects with stacks for the engineer.

---

## 4. Proof-tiles (lead: Viva Fresh)

### First 10 seconds
- **Hiring manager.** A short sentence (the giant name is gone: fixed), "5+ years", a real Viva Fresh store screen at native size, an "iPhone / Android" switch. Why they could still leave: the first viewport has three exhibits that compete (Viva Fresh, 16 → 2, Bayyinah $11.00).
- **Founder.** The best spread: a shipped mobile app first, then backend, then web. Why they leave: "Members subscribe for **$11 a month**" is the client's price, underlined in red as if it were a result.
- **Peer.** The own-projects band is the best personal-work showcase of the round. Why they leave: the page is 10,735 px tall on a phone (8,030 in round 8), and it ends in a 30-row index.

### Generic or already seen
- A 3-column tile grid with "Case →" (designeng.tools, rauno.me/craft), unchanged.

### Unclear or filler
- "Press iPhone or Android to switch the store screenshot." This is a legend for a control.
- "Its drum machine **really** plays, in the browser." The word "really" is filler.
- The red underlines under "now finishes", "$11 a month", "approve", "flagged" and "longest breaks" still look like links and are not links (round-8 objection, not fixed).

### Claims a reader could doubt
- **"Offday — Time-off app. 16 tests prove one team never sees another team's data."** (index row; `proof-tiles/data.ts:473`). No source says 16. `CONTENT.md` and `projects.ts` say "about 200 tests, including security and tenant isolation". "Prove … never" is also an overclaim. The same page says "about 200 automated tests" in the own-projects intro.

### Personal work: does it look great?
- **OFFBEAT and FORM: yes.** The drum grid with its 8 x 4 steps and the ringed pattern, and the trefoil with its ringed formula `p(t) = ((2 + cos 3t) cos 2t, …)` (`d-own-2.png`) are at native pixels and read as craft, not screenshots. This is what every other page should copy.
- **Offday: four tiles, uneven.** Offday gets four tiles. Every client product gets one. The "Needs your attention" tile starts the calendar at "Fri" (Mon–Thu are cut off). The shifts tile ends at "THU" (Friday is cut off). The drag-select tile is mostly empty calendar cells with "Veterans Day" (`d-own.png`, x 732–1392, y 680–900). Two of the four crops cut UI, which is against display rule 8.

### Spacing and UX
- Phone live-plate targets under 44 px: "Northwind Clinic 134x35", "Add a task 32x32", "Small 44x25" (`out1`). Desktop: "Publish 75x40", "Add a task 40x40".
- The ground changes to mint in the own-projects band (`d-own.png`) and back to grey (`d-own-2.png`) with no visible cause.

### Round-8 objections: status
Fixed: the giant name; the grey hover dimmer (not seen in `d-hover-offday-120ms.png`); the recreation chip over the axis. Not fixed: underlines that look like links; small phone targets; page length (worse).

### The single change
Remove the Bayyinah pricing tile from the first viewport. Replace it with the Read to Feed store screen, then cut Offday to two tiles (shift cover, best dates).

### Radical alternative
Make the first screen one row of three equal tiles: one client mobile app, one client web app, one own project (the drum machine). The name and line go in a 1-line top bar. Everything else is below.

---

## 5. Personal-studio (new; lead: Offday)

### First 10 seconds
- **Hiring manager.** "Web and mobile apps for clients, and products of his own." Then a whole screen of an Offday shift calendar on a maroon block. Why they leave: "This is a side project. Where is the work he was paid for?" Client work starts below the own projects, as a text table with **zero images** (`d-clients.png`, seven rows, no screen).
- **Founder.** Sees real product sense: shift cover, best dates, time to rest, an assistant. Why they leave: there is no link to try Offday, and the client list proves nothing visually.
- **Peer.** The OFFBEAT drum machine at native pixels on an orange ground is the strongest single frame in the round (`d-offbeat-drums.png`). Why they leave: the H1 is the slop-list pattern (big bold line + grey sub-line + a top nav of four links). It is a Framer studio template.

### Generic or already seen
- A top bar with "Own projects / Client work / CV / Email", then a 48 px headline, then full-width brand-colour cards for each project: the standard Framer/Read.cv "studio" template.
- One brand colour for each project (maroon, orange, black, parchment). There are four accents on one page. The brief allows a per-item colour only where the colour is the content. This is defensible for brands, but the page has no single accent of its own.

### Unclear or filler
- **"Four products made outside client work."** Two of the four are concepts ("A made-up speaker brand", "A made-up sculpture show"), and one is a studio website. The page contradicts itself four lines later.
- "Client apps live in both app stores." Read to Feed's listings are archived, and Bayyinah TV and the care platform are web apps.
- "Own product · 2026" for Offday: "product" suggests something people can use, and there is no link.
- "Read to Feed — A reading app for children. Books open inside the app." This is the weakest line in the client table.

### Personal work: does it look great?
- **OFFBEAT: yes.** Native pixels, the tabs "Drum machine / The speaker / Inside", the speaker beside the grid.
- **Offday: good screen, weak frame.** The light screens are native (r = 0.50). But the maroon block takes 1,344 x 648 px for one product. The Offday wordmark is a third typeface on the page.
- **FORM and Snaxx** are half-width cards under OFFBEAT (`d-offbeat-drums.png`, y 834). They get less space than Offday's feature list.

### Spacing and UX
- The four Offday tab cards have **4 px gaps** (539→543, 625→629, 691→695) and heights of **82 / 82 / 62 / 82 px** (`out3`). The caption "Each team has its own space…" starts at y 777, the same pixel row where the last card ends (0 px box gap). Everywhere else the page uses 24–48 px gaps. On the phone the tabs become a 2 x 2 grid of 44 px buttons (good).
- The footer rule runs full-bleed (x 0–1440), while every other rule runs from x 48 to x 1392 (`d-foot.png`, y 783).

### The single change
Do not use this as the home page. Use it as the "/own" page that the home page links to. If it must be a home candidate, put one row of three client screens *above* the own projects, and change "Four products" to "One app, one studio site and two concepts".

### Radical alternative
An exhibition page: each own project gets one full viewport with one live control (the drum grid plays; the trefoil turns), and the client work is a one-line strip at the top: "Client work: 7 apps, 2021–26 →".

---

## Ranking for the home page (plain words)

1. **Proof-tiles.** It shows the most real work in the first screen, it says "5+ years", and its own-projects crops are the best in the round. Fix: remove the Bayyinah price tile from the top, remove the unsourced "16 tests", cut Offday to two tiles.
2. **Projector.** It is calm and finished, and the "CV" target and the year are fixed. But its first exhibit has not changed since round 8 (a client's price table, ringed on a trial button), and its OFFBEAT and FORM frames are shrunk screenshots at about 0.61 scale.
3. **Two-readers.** It has a real screen first now. But the legend box is the loudest thing on the page, and its lead product is archived and described in the present tense.
4. **Personal-studio.** It has the best single frame (the drum machine), but client work is a text table with no images. As a home page it tells a hiring manager "hobbyist first". It is right as an "/own" page.
5. **Then-now.** The idea is right, but the lead is image compression on the owner's own marketing site, under an H1 about fixing apps people use.

**Should projector stay?** Yes, as the frame, because the owner chose it and it is the most finished. But not as it is. Its first screen is the round-8 first screen with a different ring, and its personal work is the weakest of the five pages except two-readers. Keep projector only if this polish pass does two things: (1) replace the row-01 exhibit with a Bayyinah screen that proves "web, iPhone or Android", and (2) take proof-tiles' native-pixel OFFBEAT and FORM crops and move the own-projects band up from 56% of the page. If those two do not land, proof-tiles is the stronger home page.
