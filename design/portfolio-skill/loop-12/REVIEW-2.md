# Loop 12, review 2: four drafts after one polish pass

Fresh reviewer, 2026-10-07. Method: `reference/review.md` and the hook ladder in `reference/motion.md`. I had not seen the build conversations, `meta.json`, `DIRECTION.md` or `REVIEW.md` before scoring. Captures, drive scripts and mid-frames are in `scratchpad/review12b/<name>/` (first screens, loaded full pages, `widths/` for 375–1440 and focus, `interact/` for the mid-frames). Scores were fixed before the checker reports and `REVIEW.md` were opened; neither moved a score. The reports set the gate, `REVIEW.md` fills the movement column.

## Summary

| Page | Straight | Proof | Original | Hook | Type+colour | Total | Movement (vs REVIEW.md) | Gate | Ship line |
|---|---|---|---|---|---|---|---|---|---|
| /drafts/p12-pro (actual size) | 8 | 9 | 8 | 8 | 8 | **41** | +1 (40) | pass | no, by one point |
| /drafts/p12-pro/case | 8 | 9 | 8 | 8 | 8 | **41** | +2 (39) | pass | no, by one point |
| /drafts/p12-crafted (lenticular) | 9 | 8 | 8 | 8 | 9 | **42** | +2 (40) | pass | **yes** |
| /drafts/p12-bold (wheel and codes) | 9 | 8 | 8 | 8 | 8 | **41** | +2 (39) | pass (1 note) | no, by one point |
| /drafts/p12-blind (three lanes) | 8 | 9 | 8 | 8 | 8 | **41** | +2 (39) | pass | no, by one point |
| Anchor: / (live home) | 9 | 9 | 8 | 8 | 9 | 43 | recorded 43 | — | — |
| Anchor: /drafts/fable-blind | 7 | 8 | 6 | 6 | 7 | 34 | recorded 33 | — | — |
| Anchor: /drafts/departures | 8 | 8 | 8 | 7 | 8 | 39 | recorded 39 | — | — |

Ship line: ≥ 42 with original and hook ≥ 8, gate pass. One draft reaches it: crafted. The other three sit one point under, all with gates passed, which is what a polish pass is expected to do: the movement is all in straight, proof and type; no draft moved on original or hook, and the rubric says polish cannot move those two.

Spread on original: all four at 8. Ranked crafted > pro > bold > blind; what separates them is under "Original, ranked" below.

## Calibration

Scored blind from my own captures before the drafts.

- **Live home, 43 (recorded 43).** Claim in Fraunces over a dark ground; two real screens fill the first screen on desktop; 5 type sizes. Type 9: a setting to screenshot. Hook 8 as I scored it from the captures (I did not drive the sun).
- **fable-blind, 34 (recorded 33).** Text left, mockup right on an orange field, 9 type sizes on the first screen, 18,000 px of page. Original 6, hook 6.
- **departures, 39 (recorded 39).** A flip-dot board with the name and a timetable; 72 px claim. Original 8, hook 7: the board carries the name, not a fact about the work.

Within 2 on all three; the scale is not adjusted.

## Fact check against CONTENT.md

Every number and date I saw on the five pages is in CONTENT.md: 5+ years; phone since 2021, web since 2023, server since 2026; 16 → 2; September 2026 for the compliance list; "no React screen is live yet"; 34 routes and 270+ components; about 14 releases, RN 0.63 → 0.81; 36 components, 805 tokens, 20 releases in about six weeks; about 200 tests; 21k-word dictionary; 2 to 8 players; EN/DE/ES/TR, EN/AR right to left, EN/FR; UBT; Today, 7 October 2026. The AI line is verbatim on all four homes and the case. Design System v2 reads as a team effort on a foundation Gentrit laid on all four. No first person, no he/his/him. Employer names stay on their own rows; public products are grouped as "Public products", "Apps in the stores" or "Agency work", never as clients of the employer. Three small items:

1. blind, 2021 entry: "in a small team" for the Sadaqah app. CONTENT says "Mobile, team member"; "small" is not a fact on file. Drop the word.
2. blind, 2025 entry: the institute website's section names ("the mission, reasons to support it, research funding, impact and questions") are not in CONTENT.md. They may come from the public page; either add them to CONTENT §3 or cut to "A one-page site for the institute".
3. All five pages caption the care-platform and design-system screens "Real product screens, invented data." PRODUCT.md's hard constraint still says internal screens of the care platform remain live recreations and that a running app or build is never captured. If the owner approved captured screens with invented data in this round, PRODUCT.md and CONTENT.md must say so; until they do, the four drafts and the rule file disagree. Not scored against any draft because all four do it the same way.

---

## ACTUAL SIZE (p12-pro) — 41/50, gate pass

Straight 8 · Proof 9 · Original 8 · Hook 8 · Type+colour 8

Four answers (desktop): who, "Gentrit Rashiti" opens the 64 px claim / what, "builds web and phone apps" / for whom, "care teams, learners and shoppers", and "Frontend and mobile developer since 2021, now full stack. Works remotely from Kosovo." / proof, three mono-labelled rows (Now: Care platform rebuild at Vianova, since 2026 · Live: Bayyinah TV at bayyinahtv.com · In stores: Viva Fresh on the App Store and Google Play) and the claims screen at 1:1 under a ruler that reads "Actual size: 782 of 1440 pixels across".
Four answers (phone): the same claim in four lines at 36 px, the lead, then the ruler "390 of 1440 pixels across" and the top-left corner of the claims screen (a title cut mid-word, an alert cut mid-sentence, one "DRAFT 7" card), then the three proof rows at the bottom edge. All four are there; the proof image is a fragment.
Memory sentence: "Click the claims screen and it slides down and widens from 782 to all 1440 pixels, and the ruler re-labels itself: the screens on this site are real and shown at their real size."
Beats: brittanychiang.com (claim and list, no work in view), leerob.com (a plain list), paco.me (text only). Loses to: rauno.me (the tile is the explanation at a scale and count this page does not reach).
Checker: 0 fails, 0 warnings, 1 allowed (C08c, bookstore-2.webp at 1.55×). 4 type sizes at 1440, 4 at 390. CLS 0, LCP 548 ms. No overflow at 375/390/768/1024/1280/1440. Focus ring 2 px petrol on the tile. Reduced motion: the first screens are pixel-identical to the normal ones; the open is instant.

Evidence. Straight 8: all four in five seconds on both widths, and on desktop the screen is the first thing the eye lands on; on the phone the eye lands on the claim and the work is a cut corner, so not 9. Proof 9: seniority from nouns alone, with no rank word: "Care teams use the app every day, so it cannot stop for a rewrite", "Each screen must pass the same test on the old and the new app", "2 database requests, not 16", "The team released it 20 times in about six weeks", and About now says "Phone apps since 2021. Web apps since 2023. The server side of the care platform since 2026." Original 8: the rule now reads at rest (the ruler with its tick marks and "782 of 1440" on every screen); no named site shows work at 1:1 with a scale; not 9 because a scale rule could exist for any developer with real screens. Hook 8: one moment worth mentioning that carries a fact (real, at real size). Driven live at 1440 (`interact/d-open-120/250/450.png`): at 120 ms the case text slides in from the left while the screen holds its place; at 250 ms the screen has moved down and widened; settled by 450 ms; on Enter it is the same; under reduced motion it is instant; on the phone it works too. Not 9: it plays once, 420 ms, one tile. Type+colour 8: p12p Display (a condensed heavy grotesk) with a plain text face and mono labels, navy ink on cool grey (245 247 251), one petrol accent, the email set as display in Contact; a decision a designer notices, not a setting to screenshot.

Original, ranked second of four: the rule is visible in a still now, but it is a presentation rule, not a fact about Gentrit.

Top 3 remaining fixes:
1. Phone first screen (and the glucose crop at `crops/pro-m2.png`): a 1440 px screen cut to 390 px shows a corner with sentences cut mid-word; the glucose crop is a bare line with no axis. On phones, pick a region that reads as a composition (the three count cards, the chart body with its axis) or show a phone-sized screen (the store frames already work at 1:1), and let the ruler say the crop.
2. Back from the case lands the home at scrollY 33–38 (`interact/d-back-250.png`: the masthead is clipped) and focus is on `body`, not the tile. Restore scroll to 0 and return focus to `#p12p-shot-hero`.
3. Phone open (`interact/m-open-250.png`): the lead paragraph is drawn across the incoming screen at 250 ms. Clip the text group during the transition or fade it before the screen moves.

Ship line: no, 41. One point short; the gate passes.

---

## p12-pro/case — 41/50, gate pass

Straight 8 · Proof 9 · Original 8 · Hook 8 · Type+colour 8

Four answers (desktop): who, "← Gentrit Rashiti, all work" / what, "Rebuilding a live care platform, one tested screen at a time." / for whom, "Care teams use this web app to look after patients at home" / proof, a four-cell facts row (Role, Years, Platforms, Live: "The Vue app, behind sign-in. The React app is not live yet.") and the claims screen at all 1440 px from y≈570.
Four answers (phone): the same; the screen is a 390 px corner from y≈500.
Memory sentence: "Press 'See the whole screen' and the claims screen opens in a dialog with a Fit / Actual size switch; the case is the arrival of the home's moment, with the ruler now reading 'all 1440 pixels across'."
Beats: brittanychiang.com's project pages, leerob.com's writing pages, dennissnellenberg.com's case pages. Loses to: emilkowal.ski (live demos inside the text).
Checker: 0 fails, 0 warnings (read mode). 5 sizes at 1440, 4 at 390. Dialog: native `<dialog>`, Escape closes, focus returns to the button (`interact/d-whole-*.png`).

Evidence. Proof 9: "What is being built" is three numbered decisions (constraint, choice, consequence), the diagram is one line of five words with one return arrow, "The result so far" is two dated readouts (16 → 2; Sept 2026), "For engineers" ends with a trade-off, and every claim is in CONTENT. Straight 8: 88 words before the screen at 1440; the screen is a corner on the phone. Original 8: the actual-size rule continues on every screen and in the dialog's Fit / Actual size switch. Hook 8: the page is the destination of the tile transition and the dialog is a second small moment; judged as a cold URL it would be 7. Type 8: as the home.

Top 3 remaining fixes:
1. Phone: same corner-crop problem as the home; the glucose screen at 390 px is a line with no labels.
2. Scope line: "From 2023, Gentrit and the team built its screens in Vue" is the only line that names who built what before the AI line; put the AI line's three sentences once (they appear under "What is being built" and again in "The result so far" via "a team effort").
3. "Next case, on the main site: Bayyinah TV" leaves the draft; say so in the link text or keep the visitor inside the draft's own index.

Ship line: no, 41.

---

## LENTICULAR (p12-crafted) — 42/50, gate pass

Straight 9 · Proof 8 · Original 8 · Hook 8 · Type+colour 9

Four answers (desktop): who, in the 66 px claim / what, "builds web and phone apps" / for whom, "learners, care teams and shoppers", and "Frontend and mobile developer since 2021, now full stack. Based in Kosovo, working remotely." / proof, the Bayyinah TV print at 38% of the screen with "bayyinahtv.com ⇄ App Store", "The same web app runs on the website and inside the iPhone and Android apps.", "Frontend, core team · 2023–26", three links.
Four answers (phone): the claim in four lines at 34 px, the lead, the print from y≈285, name, toggle, the same sentence and links by y≈830. The eye lands on the dark print.
Memory sentence: "Drag the Bayyinah card and the website turns into the App Store page through the lens strips, because it is the same app on both."
Beats: cassie.codes (a character, not the work), joshwcomeau.com (illustrated, known pattern), dennissnellenberg.com (award motion with no fact). Loses to: emilkowal.ski (the motion is the thing he does and you try it inside the text).
Checker: 0 fails, 0 warnings. 5 sizes at 1440 and 390. CLS 0, LCP 548 ms. No overflow at any of the six widths; 0 small targets at 375/390. Live (`interact/`): click turns the card (strips interlace at 40 ms, settled by 120 ms); a slow drag follows the hand and the card tilts to 18° while held (`drag-hold.png`), then snaps to the store face; a flick of 100 px turns it back; two clicks 180 ms apart end at rest; the radio pair takes arrow keys and shows a red focus ring on the face label (`tab-focus-face.png`); a tap and a swipe work on the phone; under reduced motion the face swaps at 60 ms with no travel and the first screen is identical to the normal capture. No animation runs by itself.

Evidence. Straight 9: all four in five seconds on both widths and the print is the first thing the eye lands on; the phone claim is four lines now and the product's marketing band is cropped out. Proof 8: each lead row states scope and a checkable result ("Rebuilt from an empty project, then shipped to the web and both stores", "16 → 2", "none is live yet", "About 14 releases to both stores", "About 200 tests, including checks that each team sees only its own data"); the All work index is grouped by employer with hairlines and the DS line has its scope. Not 9: the first screen's proof is one product's links, and "A core frontend team, Gentrit among them" is the right voice but not a decision. Original 8: a computed lens (two real screens in strips; the angle picks the strip; each card drawn from a little to the left so its right edge already shows the second face) is a technique no named site uses and the About paragraph explains it in engineering terms; it carries the fact "one app on web and phone". Not 9: the rule could exist for any web-and-phone developer, and four of five cards turn between two screens of one face. Hook 8: driven, interruptible, keyboard and touch, with a sentence that has a verb and a fact; not 9 because it is one card at a time and nothing page-wide changes. Type+colour 9: Bricolage Grotesque at 66 px over Public Sans with a technical mono, cream and blush bands, one dark red (180 29 2) taken from the Bayyinah button and used for the active face, links and focus; the first screen (a dark red print with faint ribs on cream, the ⇄ toggle under it) is a setting someone would screenshot.

Original, ranked first of four: the only rule that is both a technique and a fact.

Top 3 remaining fixes:
1. Make the moment page-wide to reach the ladder's 9: one lens angle for the whole page, set by the pointer's x or by one control in the masthead, so every print turns together and the fact reads on all five at once (care team ⇄ one patient, my books ⇄ badges, shop ⇄ cart, light ⇄ dark).
2. The hero card is still a bare `div` (no role, no name, `tabindex -1`); the radios carry the keyboard path under the fieldset legend "Bayyinah TV: which screen the print shows". Give the card `role="group"` with that name so the buttons have a subject.
3. "All work" link rows are 28 px tall at 768–1440 (fine on touch widths, where they are 44). Pad them to 32–36 px so the pointer target matches the rest of the page's controls.

Ship line: **yes.** 42 with original 8 and hook 8, gate pass.

---

## WHEEL AND CODES (p12-bold) — 41/50, gate pass (one note)

Straight 9 · Proof 8 · Original 8 · Hook 8 · Type+colour 8

Four answers (desktop): who, in the 56 px condensed claim / what, "builds the phone and web apps" / for whom, "shoppers, readers and care teams", and "Frontend and mobile developer since 2021, full stack since 2026. Kosovo, remote." / proof, four named store apps with years, two store frames of the chosen app at 30%, "ABOUT 14 RELEASES IN FOUR YEARS" over two working codes with the store URLs in mono.
Four answers (phone): the claim in three lines at 32 px, the lead, the four-app list, two store buttons, then a frame from y≈480 (40% of the screen). The codes are gone on the phone, rightly.
Memory sentence: "Spin the wheel to Dukagjini Bookstore and the frames, the colour and the two codes swap; scan one and the real app opens on your phone."
Beats: brittanychiang.com, henryheffernan.com (a 3D desk, not the work), dennissnellenberg.com. Loses to: bruno-simon.com (a driven mechanism that is the whole site, not one row).
Checker: 0 fails, 0 warnings. 5 sizes at 1440, 4 at 390. CLS 0, LCP 524 ms. Live: click and arrow keys move the band and swap the frames, the text and the codes; a horizontal drag on the deck now follows the hand (frames at 533 px mid-drag against 560 at rest, `interact/hdrag-mid.png`) and snaps to the next app; a vertical drag on the list changes the app; a horizontal swipe on the phone frame goes to the next app; two clicks 150 ms apart end on the last one; reduced motion keeps every state with no travel. Gate items the checker does not cover, measured from pixels: white on the chosen band is 5.32:1 (blue), 10.4:1 (dark red), 5.12:1 and 5.10:1 (reds), so the earlier 4.37:1 is fixed; with the keyboard the focused row draws a dark double ring that moves with the arrows (`interact/tab-focus-row*.png`). One note: at 375/390 and at 1024 the document's scrollWidth is 467/482/1100 because the off-stage deck frames extend past the viewport; `overflow-x: clip` on body keeps the page from scrolling sideways (scrollX stays 0), so nothing is visible to a visitor, but any tool that captures full pages gets a 482 px image. Clip the deck itself.

Evidence. Straight 9: four answers in five seconds on both widths; on desktop the frames are what the eye lands on, on the phone the frame is 40% of the first screen under a three-line claim. Proof 8: every row has a year, a role and a checkable result ("About 14 releases in four years", "Live on the web and in both stores", the care rebuild with "2 database requests, not 16", "A team effort on Gentrit's foundation: 36 building blocks, 20 releases in about six weeks"); not 9 because the "More" rows are one-liners and the strongest decision (the care rebuild) is below the fold. Original 8: a decision a designer notices (one colour per app floods the band and the frame ground; working codes as the proof of "live"; the archived codes say "web.archive.org, Nov 2025"); not 9 because a list that drives a stage with phones and a code is the app-landing composition. Hook 8: one moment worth mentioning that carries a fact; now driven by hand, keys and swipe; not 9 because the mid-frames are rough: at 40 ms the moving band slices the row text in two colours (`interact/click-40.png`), and mid-drag the two decks are a double exposure (`hdrag-mid.png`). Type+colour 8: PB Display 800 caps, mono years, warm paper, the band in the app's colour; the closest to a mood-board shot after crafted, held back by the generic store-landing composition on the right.

Original, ranked third of four: the output is new (frames, colour, codes), the control is a list.

Top 3 remaining fixes:
1. Mid-frames: cross-fade the row text with the band (or clip the band behind the text) so the 40 ms frame does not cut glyphs; during a drag translate one deck out as the other comes in instead of blending both at full opacity.
2. Clip the deck (`overflow: clip` on `.pb-deck`/the frames' parent) so the document width equals the viewport at 375, 390 and 1024.
3. First screen on desktop says nothing about the care platform; put one line under the lead ("Now: a care platform being rebuilt in React, one tested screen at a time") so "care teams" in the claim has its proof above the fold.

Ship line: no, 41.

---

## THREE LANES (p12-blind) — 41/50, gate pass

Straight 8 · Proof 9 · Original 8 · Hook 8 · Type+colour 8

Four answers (desktop): who, in the 66 px condensed claim / what, "builds the phone and web apps" / for whom, "care teams, readers and shoppers" / proof, "5+ years. Part of two platform rewrites: a care platform and bayyinahtv.com. Based in Kosovo, working remotely.", then the three lane headers (PHONE since 2021 · WEB since 2023 · SERVER since 2026 · All), "Today, 7 October 2026", "2026" and three screens from y≈515 (the Bayyinah app, the care calendar, the server entry). All four read; the eye starts at the claim and the lanes, not the work (28%).
Four answers (phone): the claim in four lines at 38 px, the lead, the headers in a row, Today, 2026, "WEB" and a two-day crop of the care calendar from y≈470. The work is a cropped calendar.
Memory sentence: "Press WEB and the whole record folds to the web lane, eight entries since 2023, and the opening sentence rewrites itself."
Beats: taniarascia.com (dated lines, no lanes or screens), leerob.com, antfu.me (rows of nouns, no record). Loses to: lynnandtonic.com (a dated record where each year is a different idea you can open).
Checker: 0 fails, 0 warnings. 5 sizes at 1440 and 390 (the gate's earlier six is fixed). CLS 0.013 at 1440. Live: the headers are a radio fieldset; click, tap and arrow keys choose a lane; the chosen lane widens (254fr → 711 px for WEB) and the others dim at 0.3 s; the lead paragraph re-reads per lane ("Phone apps since 2021, six entries. Three are live in both stores today…"); on the phone the page shortens from 10,790 to 5,504 px when PHONE is chosen; two clicks 150 ms apart end on the last; focus ring 2 px red on the header; the Enlarge dialog locks scroll (scrollY unchanged after a wheel) and returns focus to its button; reduced motion is identical. The headers are sticky with a solid ground.

Evidence. Proof 9: the lanes themselves make the seniority argument (phone → web → server, with a "since" date each), every entry carries employer, role and years in mono, every result is a noun ("2 database requests, not 16", "About 200 tests", "Gentrit built the portal frontend … Teammates built the wallet itself"), and the index lists every product with 2026 dates; no rank word anywhere. Straight 8: four answers in five seconds, but behind 73 words, six headers and a date line, and the phone's work is a cropped calendar. Original 8: lanes from this person's facts, an honest empty server lane ("The server lane starts in 2026"), and a header that is a filter; not 9 because a swimlane record is a known shape. Hook 8: one moment, with a verb and a fact, visible across the whole page; not 9 because it is discrete and the layout jumps: the lane widths change in the first frame (`interact/click-web-40.png` equals `-800.png` in layout) and only the opacity travels, so it feels like a tab switch, not a fold. Type+colour 8: Big Shoulders at 66 px with Libre Franklin and a mono, thin double rules between lanes, one red for Today; a decision; the lead sits tight under the claim's descenders at both widths.

Original, ranked fourth of four: the rule is an arrangement, now with a switch.

Top 3 remaining fixes:
1. Make the fold travel: animate the lane grid (`grid-template-columns` is not animatable; use a transform on the three lane wrappers or a FLIP on the cells, 300–450 ms expo-out) so the visitor sees the lanes close, and keep the instant branch for reduced motion. Or turn the Today line into a scrub (drag it down the record; the lane counts in the headers change), which reaches the ladder's 9.
2. Phone first screen: a two-day calendar crop is the first work shown; put the Bayyinah app frame (phone-sized, reads whole) first in the 2026 band on phones, or crop the calendar to one day with its times.
3. Page length: 11,042 px on desktop. Keep one paragraph per entry in the record and move the second into the index row or the case; the server lane's empty years could collapse to one line each.

Ship line: no, 41.

---

## Original, ranked

All four sit at 8. In order: **crafted** (a technique no named site uses, applied to all five pictures, carrying the fact "one app, two faces"; a still shows it as faint ribs on a real screen), **pro** (actual size with a ruler on every screen; honest about scale, visible at rest now; a presentation rule rather than a fact about Gentrit), **bold** (one colour per app and working store codes carry "in both stores"; the composition is a known app-landing shape), **blind** (three lanes from his facts with an honest empty lane; a swimlane record is a known shape). None reaches the rubric's 9 because each rule could exist for another developer with the same kind of work; the live home's sun over Kosovo is still the only rule on the site tied to the person rather than to the work.

## Which to take forward

**(a) Ship this week:** 1. crafted — it reaches the line (42, 8/8, gate pass) and its fixes are small (card name, link padding; the page-wide lens is a next step, not a blocker). 2. pro with its case — 41 with a working case page, the only draft that is a complete site in itself; two small bugs (scroll and focus on return, the phone crop) and it is shippable. 3. bold — 41, gate pass, the rough mid-frames and the deck clip are an afternoon. 4. blind — 41, gate pass, but 11,000 px and an instant layout jump need more than a polish pass.

**(b) Strongest concept for the next home page:** 1. crafted's lenticular — the only rule that is both a technique and a fact, and it has a clear route to the ladder's 9 (one lens angle for the whole page, driven by the pointer or one control, so every product turns at once and the fact reads everywhere); the type and colour are already at 9. 2. blind's lanes — the best proof on any page (phone, web, server with their since-dates and 30 index rows), and the Today line as a scrub would give it a page-wide driven state; but it needs cutting to half its length first. 3. pro's actual size — the best craft and the most honest device, but its ceiling on original is 8 because the rule is about presentation, and on phones a 1:1 screen is a corner. 4. bold — keep its best part (the colour-per-app band and the store codes with their archive dates) as a section in whichever page ships; as a whole page it is the app-landing composition.

Reasoning: the rubric parks a draft at 7/7 and polishes an 8/8; this round shows the other half of that rule. Polish moved every draft by one or two points, all in straight, proof and type, and none on original or hook, exactly as `review.md` predicts. So the next point for any of these comes from the hook ladder, not from craft: a page-wide driven state that carries a fact. Crafted has the shortest path there (the lens angle is already a continuous, pointer-driven value on one card; make it one value for the page) and is the only draft already over the line, so it should ship now and be developed next. Blind is the strongest second because its proof is the best on the site and its mechanism (lanes) is the kind the ladder's 9 names ("a filter that re-reads the whole record"), but it has to be a scrub, not a tab, and the page has to be half as long.

## Last notes for the skill

1. **Say where the next point comes from.** `review.md` should state the arithmetic of the ship line: a draft at 8/8 on original and hook needs 26 from the other three (9/9/8), and a polish pass reliably yields +1 to +2 there and 0 on original and hook (this round: +1, +2, +2, +2, +2, all craft). Builders then know that a 41 with 8/8 is a hook problem, not a polish problem.
2. **`check.mjs`: report clipped overflow.** Bold's document scrollWidth is 482 at 390 and 1100 at 1024 with `overflow-x: clip` on body; nothing scrolls, so the checker passed it, but every full-page capture (its own included) is 482 px wide. Report scrollWidth > clientWidth with the clip noted as a warning, and capture full pages at the viewport width.
3. **`work-display.md`: actual size on a phone needs a rule.** A 1440 px screen cut to 390 px shows a corner with sentences cut mid-word (pro's home and case on the phone; the glucose crop is a bare line). On phones, show a region that reads as a composition (a card row, a chart body with its axis) or a phone-sized screen, and let the ruler say the scale; never a corner.
4. **`snippets/view-transition-noscale.css`: add the way back.** Pro returns from the case at scrollY 33–38 with the masthead clipped and focus on `body`; on the phone the outgoing lead is drawn across the incoming screen at 250 ms. The recipe should set scroll restoration and return focus to the tile, and clip or fade the text group during the transition.
5. **The hook ladder works; add the 8-to-9 test.** All four memory sentences now have a verb and a fact and all four moments sit at 8; the ladder separated them cleanly (driven and continuous vs triggered; page-wide vs one row). Add one line under the ladder: "8 becomes 9 when one value the visitor drives changes every section at once; name that value in the direction card (the lens angle, the Today line, the sun)." And record in `PRODUCT.md` whether captured product screens with invented data are allowed, since all four drafts use them against the rule as written.
