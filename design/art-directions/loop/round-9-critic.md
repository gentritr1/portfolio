# Loop 9 critic: projector (home "/"), then-now, two-readers, proof-tiles, personal-studio

Critic: fresh. I built none of this work. I judged from the builder frames, the source text, and my own captures. Scale: 7 = a good personal site, 8 = distinctive, 9 = best in class. Self-scores are in brackets. Whole numbers only.

Abbreviations: `S` = `.../scratchpad/review/`, `L` = `S/loop9/<id>/final/`, `C` = `.../scratchpad/crit9/` (my scripts and captures).

## What I measured myself

- **Probe at 5 widths** (`C/probe9.mjs`, output `C/p1`…`C/p5`, each `probe.json` and one PNG per width). Each route at 1440 × 900, 1280 × 800, 1024 × 768, 390 × 844 (mobile) and 375 × 812 (mobile), cache off. Layout-shift sum (PerformanceObserver, buffered) on load and over a fast scroll (20 steps down and back at 16 ms), horizontal overflow, nearest text to each screen edge, 14 real Tab presses.
- **Reachable small targets** (`C/inert.json`, `C/k.json` with `C/seq9.mjs`, which adds 1024 and 1280 sizes to seq.mjs). Controls inside `[inert]` plates are not counted.
- **Late fonts** (`C/fontdelay9.mjs`, output `C/fd/`, logs `C/fd1.log`…`fd5.log`). Every font held for 2.5 s at 375 and 1440: how long the heading is hidden, and the layout shift when the fonts arrive.
- **Image density** (`C/imgs.js`, `C/lead.js`, at device scale 2). For each visible screenshot: source pixels, CSS box, and device scale (above 1.0 = the browser enlarges it on a 2× screen).
- **Keyboard with time to settle** (`C/ps.json`): 16 Tabs on personal-studio, 700 ms each, because the global `scroll-behavior: smooth` made the 120 ms probe report false "off screen" stops.
- **Reduced motion**: `S/r6check/diff.mjs` on 7 builder pairs. All 7 have 0 differing pixels (projector own band and tab, then-now desktop and phone, two-readers, proof-tiles, personal-studio).
- **Mid-frames**: I looked at the builder paused frames (`C/mid1.png`, `C/mid2.png` sheets). Projector: Offday tab cross-fade at 10× slow, then the line. Then-now: strike at 100 ms, write and bar shrink at 320 ms. Two-readers: the rewrite at 160 and 400 ms. Proof-tiles: the iPhone → Android wipe at 100 ms. Personal-studio: the Offday tab cross-fade at 120 ms. No text moves in any mid-frame.

### Craft results

| Route | CLS load (5 widths) | CLS fast scroll | Late fonts: heading hidden / CLS | Reachable targets < 44 px | Focus (14–16 Tabs) | Phone text edge |
| --- | --- | --- | --- | --- | --- | --- |
| projector "/" | 0.0002 at 1440 (font swap), 0 at the others | 0 | not hidden (visible at 1.8 s) / 0.0006 | 0 at all widths (plate store links are `inert`) | visible, none covered | 16 px |
| then-now | 0 | 0 | 323–335 ms / 0 | 0 | visible, none covered | 16 px |
| two-readers | 0 | 0 | 293 ms at 375, **660 ms at 1440** / 0 | 0 (live-plate controls are `inert`) | visible, none covered | 24 px |
| proof-tiles | 0 | 0 | about 50 ms / 0 | 0 (tile media `inert`) | visible (ring on `::after`); Tab scrolls with smooth scroll | 16 px |
| personal-studio | 0 | 0 | not hidden / 0 | 0 | visible after the smooth scroll settles (about 0.5 s) | 16 px ink; the "Email" hit area ends 4 px from the right edge |

No route has horizontal overflow. All round-8 font defects are closed except two-readers at 1440. All round-8 "CV 22 px" target defects are closed.

**One defect on every page: density on 2× screens.** Each lead plate uses a 1440 px public capture or a 780 px store frame. At device scale 2 the browser enlarges it: projector Bayyinah TV 1.81×, then-now Snaxx 1.52×, two-readers Read to Feed 1.63×, proof-tiles Viva Fresh 1.45× and bayyinah.org 2.00×, personal-studio Snaxx 2.00× (`C/lead-out`, log above). The personal shots (2880 px) are crisp where they show at 1.0 or less. The proof-tiles footer says every picture is "never enlarged". That is true in CSS pixels only.

---

## Scores

| Point | projector "/" | then-now | two-readers | proof-tiles | personal-studio |
| --- | --- | --- | --- | --- | --- |
| 1 Straight to the point | 9 [9] | 8 [9] | 9 [9] | 9 [9] | 7 [8] |
| 2 Not overwhelming | 8 [8] | 8 [8] | 7 [8] | 7 [8] | 8 [8] |
| 3 UI/UX harmony | 9 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] |
| 4 Meaningful motion | 8 [8] | 9 [9] | 9 [8] | 8 [8] | 8 [8] |
| 5 Actions and seniority | 9 [9] | 7 [8] | 8 [8] | 8 [8] | 6 [7] |
| 6 Original | 7 [7] | 7 [7] | 8 [7] | 7 [7] | 7 [7] |
| 7 Hooks | 8 [8] | 8 [8] | 8 [8] | 8 [8] | 8 [8] |
| **Total /70** | **58** [57] | **55** [57] | **57** [56] | **55** [56] | **52** [54] |
| Plain copy /10 | 8 | 8 | 9 | 7 | 8 |
| Personal-work showcase /10 | 7 | 8 | 5 | 8 | 9 |

Trend: projector 57 → 58. then-now 58 → 55 (new lead). two-readers 57 → 57. proof-tiles 52 → 55. personal-studio is new.

---

## 1. projector (live "/") — 58 [57]

### What round 9 closed (with evidence)

- Row 01 result is now "Members subscribe on the web, iPhone or Android". The ring is on "Start 7-Day Free Trial" (`C/p1/_-1024.png`, `_-1280.png`).
- The font wait is gone. With fonts 2.5 s late the heading shows at 1.8 s in fallback type, CLS 0.0006 (`C/fd1.log`).
- Phone first plate is a new crop: "Choose Your Plan" with the ring on "Watch anytime, anywhere—on mobile, tablet or desktop" (`C/p1/_-375.png`). It proves the row result. No empty "Price" row.
- 1024: the role line breaks as "FRONTEND, CORE TEAM / 2023–26" with no hanging "·" (`C/p1/_-1024.png`).
- Phone: one index only, band ink at 16 px, CV and Email are 44 px targets.
- **Own projects band** (rows 09–11). Header "Own projects / Made outside client work: one working app and two design concepts." Offday has four tabs (Shifts, Best dates, Time to rest, Assistant). Each tab changes the plate and the result band, and the ring moves to the proof ("It flags a shift that has no cover" → the "Needs cover" cell, `L/d-offday-shifts.png`; "It finds the longest breaks around holidays" → the two suggestions, `L/d-own-head.png`). This is the best use of the log mechanism on the page.

### Why not more

- Point 6 stays 7: sticky frame beside a numbered log.
- Point 2 stays 8: 11 rows and four tabs inside row 09.
- At 1440 the row 02 result "Now it asks 2 times and finishes" is cut by the fold (y 895, `C/p1/_-1440.png`). The 95 px empty band above the H1 could carry it.

### Craft QA

- Spacing on one scale. 40 px gutters at 1440/1280/1024, 16 px at 375/390. CLS above.
- Mid-frames (`L/d-tab-best-crossfade-slow10x.png`, `d-tab-best-line-slow10x.png`): the plate cross-fades, then the line draws. No text movement.
- Offday "Best dates" crop: the modal backdrop shows blurred, cut text at the left ("r team, in syn", `L/d-own-head.png` x 520–700). The third suggestion row ends at the plate edge.
- OFFBEAT and FORM: the whole home page at 880 css px from a 2880 px source, 0.61 scale (`C/s-d-.log`). The hero is strong, but the nav and controls are about 8 px. On phone, OFFBEAT is cropped to the speaker only, so the ring cannot prove "pick a finish" (`L/m-offbeat.png`: no swatches in the crop).
- Phone Offday crop is 1.21× on a 2× screen (`C/s-m-.log`); slightly soft.

### Copy

| Line | Problem | Rewrite (same facts) |
| --- | --- | --- |
| Row 03 role "FRONTEND, AND THE 2026 REBUILD · 2023–26" | A recruiter cannot tell what "the 2026 rebuild" is. | "FRONTEND, CORE TEAM · 2023–26" and put the rebuild in the row: "Most screens are already rebuilt in React." |
| Footer "Bachelor's degree, UBT." | "UBT" is unknown outside Kosovo. | Spell out the school name from the CV. |
| Row 10 phone "Turn the 3D speaker and pick a finish" | The phone crop has no finish swatches. | Keep the line and add the swatch row to the phone crop. |

Unsupported claims: none. Offday, OFFBEAT and FORM lines trace to projects.ts lines 622–723. "one working app and two design concepts" is exact.

### Personal work (7/10)

Offday: all light, four real screens, each one proves its line. OFFBEAT and FORM: labelled "CONCEPT" and "The brand is fictional", with GitHub links. They are shown small (0.61) and as whole pages, so they look like thumbnails of someone else's site, not the striking detail. Offday has no link (the builder found the repo is private).

### Polish list (ordered by score gain; one pass each)

1. **Hooks +1.** Replace the OFFBEAT and FORM home-page plates with one crop each at 0.9 to 1.0 scale: the whole 8-step drum-machine grid (`offbeat-studio-desktop.webp`), and the trefoil with its material swatches. Ring the grid and the swatches. Evidence: `L/d-offbeat.png`, `L/d-form.png`, scale 0.61.
2. **First screen.** Move row 02's result above the fold at 1440: cut the top band from 95 px to 48 px. Evidence: `C/p1/_-1440.png` y 895.
3. **Harmony.** Crop the Offday "Best dates" plate to the modal, with no blurred backdrop strip, and end on a whole suggestion row. Evidence: `L/d-own-head.png`.
4. **Copy.** Row 03 role line and "UBT" (table above).
5. **Phone.** Add the swatch row to the OFFBEAT phone crop. Evidence: `L/m-offbeat.png`.
6. **Density.** Where a 2× capture of the Bayyinah TV pricing page exists, use it. Today the lead is 1.81× on a 2× screen.

---

## 2. then-now (lead: Snaxx Tech) — 55 [57]

### What works

- **The clearest motion in the round.** On load, "972 KB" and "28 MB" are struck, the new numbers write in, and the two bars shrink to their measured length (`L/d-load-strike-100ms.png`, `d-load-write-and-shrink-320ms.png`). The bars are to scale: 337/972 = 0.35, 9.5/28 = 0.34, "About a third of the weight" is correct. Point 4 is 9.
- **The blue half.** Words on paper at the left, products on blue at the right. One accent. It is the most confident first screen of the round (`C/p2/_drafts_then_now-1440.png`).
- Round-8 copy fixes landed: "RESULT" on shipped rows, "96.6% less JavaScript for a page that uses only a button", "It kept each child's place in every book" (past tense).
- Plates are filled now. The row 01 line enters at the right height.

### Why it went down

- **Point 5, 9 → 7.** The first exhibit is the owner's own studio site, and its result is smaller pictures. The identity line says "rebuilds and fixes the ones people already use", then the proof is his own marketing site. A founder reads "he compressed images". The 16 → 2 billing fix is second, and the shipped client products start at row 03 (about y 880). The builder agrees (holdback).
- **Point 1, 9 → 8.** In 5 seconds a reader learns the name and two file sizes. They do not see a client product.

### Craft QA

- CLS 0 on load and on fast scroll at all 5 widths. Spacing on one scale. Phone edges 16 px.
- Late fonts: heading hidden 323–335 ms, then CLS 0. The round-8 0.084 shift is gone. The hide is just over the 300 ms rule.
- Phone: the blue plate band is sticky at the top (about 200 px of 812, `L/m-03.png`). It does not cover a focused element.
- Keyboard: roving tabindex in the tray, focus visible (`L/d-key-tab3-row01-link.png`).

### Copy and fact check

| Line | Finding | Rewrite |
| --- | --- | --- |
| "the whole site 28 MB" / "9.5 MB for the whole site" | Supported: CONTENT.md line 178 and projects.ts line 695 say "deploy 28 MB → 9.5 MB". But "whole site" can read as what a visitor downloads. The deploy holds the video loop and every file. | "All the site's files: 28 MB → 9.5 MB." |
| "972 KB → 337 KB" pictures | Supported (same lines). | Keep. |
| "Version 1 … NOW Built again: members subscribe on the web, iPhone or Android." | Supported: caseNarratives line 35 says version 2 "added … Stripe, Apple and Google subscriptions". | Keep. |
| Identity "rebuilds and fixes the ones people already use" with an own site as row 01 | The sentence and the first proof do not match. | Keep the sentence and lead with a client row (row 02, 16 → 2). The facts give no plain rewrite that makes an own site fit "the ones people already use". |

### Personal work (8/10)

Offday light (shifts), OFFBEAT sound studio and FORM in the sticky frame at good size, each with "CONCEPT … the brands do not exist" and a GitHub link (`L/d-09.png`). Each has one plain line and one detail line. Crisp. Not larger than the client plates, so they do not stand out.

### Polish list

1. **Seniority +2, straight +1.** Put Snaxx Tech after the client rows (or into the own-projects group, where it belongs as an own site), and lead with row 02 (16 → 2) or Bayyinah TV. Keep the bar-shrink motion for whichever row leads.
2. **Copy.** "All the site's files: 28 MB → 9.5 MB."
3. **Fonts.** Cap the heading hide at 250 ms (measured 323–335 ms).
4. **Density.** Snaxx plate is 1.52× on a 2× screen; use the 2× capture if one exists.

---

## 3. two-readers (lead: Read to Feed) — 57 [56]

### What works

- **Point 1 now 9.** A real product screen is on the first screen: the Read to Feed "My Books" store screenshot with the ring on "Read 36%", and the line "It remembers the page in every book." "5+ years" is in the H1 (`C/p3/_drafts_two_readers-1440.png`).
- **The switch explains itself before a click.** The card shows one fact in both voices ("built once for iPhone and Android" / `one React Native codebase`). A recruiter now sees the idea without pressing anything. This was round 8's hook problem. Point 6 is 8: still the only new idea in the round.
- **Motion with meaning**, no strike now: the line rewrites in place (`L/d-switch-160ms.png`, `d-switch-400ms.png`). Point 4 is 9.
- Engineer view keeps "Part of two rewrites" (`L/d-switch-400ms.png`).

### Why not more

- **Point 2, 8 → 7.** The vermilion card is the loudest block on the first screen. It is louder than the product. At 1024 it pushes the row 01 result below the fold (`C/p3/_drafts_two_readers-1024.png`; the builder agrees).
- The lead screenshot keeps the store frame's blue side strips at both edges (`C/p3/...-1440.png` x 762–795 and x 1300–1334). It is 1.63× on a 2× screen.

### Craft QA

- CLS 0 at all widths. Gutters 106 / 66 / 48 px desktop, 24 px phone. Live-plate controls are now `inert`: 0 reachable small targets.
- **Late fonts at 1440: heading hidden 660 ms** (`C/fd3.log`). Over the 300 ms rule.
- Phone first screen: identity, the card, then row 01 with its own plate (`C/p3/_drafts_two_readers-375.png`). Designed, not squeezed.

### Copy

| Line | Problem | Rewrite |
| --- | --- | --- |
| "→ It remembers the page in every book." with "Shipped; the listings are now archived." | Present tense for an archived app. | "→ It kept each child's page in every book." |
| Own projects "A time-off app for teams. It finds the dates that give the longest break." | Clear. | Keep. |

The hiring-manager lines stay the plainest of the round. No unsupported claim.

### Personal work (5/10)

Offday: one light screen (the whole app home, 0.85). OFFBEAT and FORM: two whole home pages side by side at 602 css px from 2880 px sources, 0.42 scale (`C/s-d-drafts_two-readers.log`). Their UI text is about 6 px. They read as thumbnails. Labels are correct ("Concept · 2026", "made-up").

### Polish list

1. **Calm +1.** Make the card quiet: ink outline on paper, no vermilion fill. Keep the two sample lines. The product becomes the strongest element. Evidence: `C/p3/...-1440.png`.
2. **Personal work.** One row each, full column width, crop to the part: the drum-machine grid, the trefoil with its material swatches, at 0.9 to 1.0.
3. **Fonts.** Cap the 1440 heading hide at 300 ms (measured 660 ms).
4. **Harmony.** Crop the Read to Feed screen inside its blue side strips.
5. **Copy.** Past tense for Read to Feed.

---

## 4. proof-tiles (lead: Viva Fresh) — 55 [56]

### What works

- **The slop marker is gone.** The name sits in the sentence at text size: "**Gentrit Rashiti** builds web and mobile apps. Each result here is shown with its proof."
- **The best new device of the round.** The lead sentence "One grocery app, built once for [iPhone] and [Android]." holds two pills. Press one and the store screenshot wipes from the App Store frame to the Google Play frame (`L/d-wipe-to-android-100ms.png`). The motion is the claim: the same screen on two platforms. Point 7 is 8.
- Fewer tiles above the fold: three projects, not six.
- Tile media are `inert`; tile links have a visible `::after` ring.

### Why not more

- **Point 2 stays 7.** Three columns at 1440 (screen | words | two tiles), two calls to action, and three more tiles peeking at y 790 (`C/p4/_drafts_proof_tiles-1440.png`).
- **Point 3 stays 8.**
  - The Bayyinah TV tile is cropped to "Premium $11.00 / month" with **one tick and no row label** under it (`C/p4/...-1440.png` y 635). Round 8 called this exact crop a defect in sampled-frame.
  - The pills raise the line height of the sentence they sit in (`C/p4/...-1024.png`: 52 px between the two lines, against 36 px in the H1).
- **Phone drum-machine tile cuts the grid at step 4 of 8** (`L/m-own-2.png`), under the line "Its drum machine really plays".

### Craft QA

- CLS 0 everywhere. Spacing on one scale. Gutters 48 px desktop, 16 px phone.
- Late fonts: about 50 ms hidden, CLS 0. Best result of the round.
- Tab moves scroll with the global `scroll-behavior: smooth` (projector, then-now and two-readers set `auto`; this page does not). Keyboard moves should not animate.
- Phone first screen: identity, the Viva Fresh sentence with the pills, then the screen (`C/p4/...-375.png`). Designed.

### Copy and fact check

| Line | Finding | Rewrite (same facts) |
| --- | --- | --- |
| "Members subscribe for **$11 a month**, on the web or in the apps." (underlined as proof) | **Not in CONTENT.md or caseNarratives.** It traces only to the alt text of the public screenshot (projects.ts line 145). It is the client's price, not a result of the work. It is half the offer (an annual plan shows beside it). It goes stale when the client changes the price. | "Members subscribe on the web, iPhone or Android." Ring "Start 7-Day Free Trial", as projector does. |
| Footer "…a crop of a public web page, a store listing or a screenshot of an own project, never enlarged." | True in CSS pixels only. On a 2× screen the Viva Fresh frame is 1.45× and bayyinah.org 2.00× (`C/lead-out` log). The builder holdback also says the Viva Fresh crops "come from store frames at about 1.6x". | Delete "never enlarged". |
| "A billing report that timed out now finishes." | Plain and supported. | Keep. |

### Personal work (8/10)

Four Offday tiles, all light, each with its proof ring (approve, flagged, longest breaks, drag). OFFBEAT drum machine and FORM trefoil with its formula line ("Each sculpture is drawn live from its formula"), both labelled "concept" (`L/d-own.png`, `d-own-2.png`). Crisp at desktop. The FORM formula is the single most striking detail in any draft. Phone crops cut the drum grid.

### Polish list

1. **Truth and seniority.** Replace the "$11 a month" caption and move the ring to the trial button.
2. **Harmony.** Crop the Bayyinah tile to the price box plus the trial button; no lone tick.
3. **Calm +1.** Push the second tile row below the fold at 1440 (it peeks at y 790).
4. **Phone.** Crop the drum-machine tile to the whole 8-step grid.
5. **Copy.** Delete "never enlarged".
6. **Keyboard.** `scroll-behavior: auto` on the page root.

---

## 5. personal-studio (new) — 52 [54]

### What works

- **The best showcase of the personal work in the loop.** Each project gets a room in its own colour: Offday (maroon) with four tabs over light screens at 1.0 scale; OFFBEAT (orange) with "Drum machine / The speaker / Inside" tabs and the step sequencer at 0.98; FORM and Snaxx Tech as a large pair (`L/d-offbeat-drums.png`, `L/d-pair.png`, `C/ps-out/ps-d-1000.png`). Every OFFBEAT and FORM line says "made-up … built as a concept". Offday is all light.
- Calm: one room per screen, one sentence per room.
- The client index at the end is clean: name, what it is, result, role · years, "Case" (`L/d-clients.png`).

### Why it scores lowest

- **Point 5, 6.** The page opens on an own product. Client work is a text table at about y 2,400 on desktop, with no screen. A founder looking for shipped client apps scrolls three rooms first. The builder agrees.
- **Point 1, 7.** In 5 seconds the reader learns "Web and mobile apps for clients, and products of his own" and sees a time-off calendar. They do not see a client product.

### Craft QA

- CLS 0 on load and fast scroll at all widths. Spacing on one scale. 48 px gutters desktop, 16 px phone.
- Late fonts: nothing hidden, CLS 0.
- **First load.** In my cold run (cache off, first route on the probe) the Offday panel was an empty white box at 3.5 s (`C/p5/_drafts_personal_studio-1440.png`). A warm load fills it by 1 s (`C/ps-out/ps-d-1000.png`). The panel has no placeholder while the 152 kB image decodes. (Part of the cold delay is the dev server.)
- Keyboard: every stop has a 2 px outline. Global smooth scroll animates each Tab move for about 0.5 s.
- Phone: the drum-machine grid is cut at step 4 (`L/m-offbeat-drums.png`). Snaxx is a 1440 px source at 1.0 css: 2.00× on a 2× screen.

### Copy

| Line | Problem | Rewrite |
| --- | --- | --- |
| "Four products made outside client work." | OFFBEAT and FORM are concepts, and Snaxx Tech is a studio site. "Products" claims more. | "Four things made outside client work: one app, two concepts and a studio site." |
| "Each team has its own space. About 200 automated tests." | Supported (projects.ts line 723: "About 200 Playwright tests"). | Keep. |
| "Seven projects shipped with teams, 2021–26." | Supported for the list as written. | Keep. |

### Polish list

1. **Seniority +2, straight +1.** Put one client screen on the first screen: a "Client work" room first (Viva Fresh or Bayyinah TV, with a store screen), then the own-product rooms. Or put the client table second with one screen per row.
2. **Copy.** "Four things … one app, two concepts and a studio site."
3. **Load.** Give the Offday panel a placeholder (the screen's own background colour or a small blurred preview) so it is never an empty white box.
4. **Phone.** Whole 8-step grid in the OFFBEAT crop.
5. **Keyboard.** `scroll-behavior: auto` on the page root.

---

## Answers

**Ranking for the home page:**

1. projector 58
2. two-readers 57
3. proof-tiles 55
4. then-now 55
5. personal-studio 52

proof-tiles is above then-now on the tie because its first screen shows a client product and its level in 5 seconds; then-now leads with an own site.

**Should projector stay home? Yes.** It closed every round-8 defect I could measure (row 01 result and ring, font wait, phone first plate, 1024 role line, phone edge, double index, CV target). It is the only page with a client product, a seniority line and the 16 → 2 problem on the first screen at every width. Its own-projects band uses the page's own mechanism, so it does not look added on.

**The single best idea in each draft to move into projector:**

- **then-now:** the measured bars that shrink from "before" to "after" on entry. Use it on row 02: the 16 cells collapse to 2 when the row becomes current, so the result is shown, not only written.
- **two-readers:** the visible two-voice sample ("Hiring manager reads … / Engineer reads …"). Use it once, small, as the stack line on each case link, not as a page-wide switch.
- **proof-tiles:** the iPhone / Android pills in the Viva Fresh sentence that wipe between the App Store and Google Play screenshots. Put it on projector row 04, where the result is "built once for iPhone and Android".
- **personal-studio:** the OFFBEAT sound-studio crop (the whole 8-step grid at 1.0) with "The drum machine really plays." Use it in place of projector's OFFBEAT home-page plate at 0.61.
