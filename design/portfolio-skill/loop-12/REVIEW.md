# Loop 12 review: four drafts built from the skill alone

Fresh reviewer, 2026-10-07. Method: `reference/review.md`. Captures, drive scripts and mid-frames are in `scratchpad/review12/reviewer/<name>/`. Scores were written in `reviewer/prescores.md` before any `report.md` or `meta.json` was opened. The checker reports and the builders' notes were read afterwards and moved no score; they set the gate and inform the fix lists.

## Summary

| Page | Straight | Proof | Original | Hook | Type+colour | Total | Gate | Disposition |
|---|---|---|---|---|---|---|---|---|
| /drafts/p12-pro (ACTUAL SIZE) | 9 | 8 | 7 | 8 | 8 | **40** | pass | rethink (keep the rule; make it read at rest). Ship candidate for this week as it stands. |
| /drafts/p12-pro/case | 8 | 9 | 7 | 7 | 8 | **39** | pass | polish with p12-pro |
| /drafts/p12-crafted (LENTICULAR) | 8 | 8 | 8 | 8 | 8 | **40** | pass | polish |
| /drafts/p12-bold (IN YOUR STORE) | 8 | 7 | 8 | 8 | 8 | **39** | fail (contrast, focus) | polish, after the gate fixes |
| /drafts/p12-blind (THREE LANES) | 7 | 9 | 8 | 7 | 8 | **39** | fail (6 sizes, dialog) | rethink (add one moment the visitor drives) |
| Anchor: / (live home) | 9 | 8 | 8 | 9 | 9 | 43 | pass (1 warning) | recorded 43 |
| Anchor: /drafts/fable-blind | 7 | 7 | 6 | 7 | 6 | 33 | fail (11 hard) | recorded 33 |
| Anchor: /drafts/departures | 7 | 8 | 8 | 8 | 8 | 39 | fail (C01, M10) | recorded 39 |

No draft reaches the ship line (≥ 42 with original and hook ≥ 8). The spread on "original" is narrow: three drafts at 8, ranked crafted > bold > blind, and pro at 7. What separates them is written under each draft.

## Calibration

Anchors were scored blind first, from my own captures, before the drafts.

- **Live home, 43 (recorded 43).** The claim in Fraunces over a dark ground whose light comes from the sun over Kosovo; a clock "18:29 in Kosovo"; the care calendar and the Viva cart fill 41% of the first screen. Memory sentence: "the site lit by the real time of day where he lives." Hook 9 because the sentence carries a fact (where he works from). Type and colour 9: a setting someone would screenshot.
- **fable-blind, 33 (recorded 33).** Text left, mockup right on an orange field, a filled and a ghost button, an italic accent word in the claim, a "Seven kinds of work" numbered list, stat rows, 18,000 px of page. The four answers are there but the work is 7% of the first screen. Original 6: the most common generated layout. Type 6: the Fraunces-italic reflex kit.
- **departures, 39 (recorded 39).** A yellow flip-dot board that spells the name and reads Morse on press-and-hold; a 14-line timetable below. Straight 7: the board shows the name, not the work; the h1 is a 27 px line above it. Original and hook 8: a decision, one moment worth repeating ("the departure board that reads Morse"), but the board carries the name, not a fact about the work.

All three landed on their recorded totals, so the scale below is not adjusted.

---

## ACTUAL SIZE (p12-pro) — 40/50, gate pass

Straight 9 · Proof 8 · Original 7 · Hook 8 · Type+colour 8

Four answers (desktop): who, "Gentrit Rashiti" inside the claim / what, "builds web and phone apps" / for whom, "care teams, learners and shoppers" / proof, the care calendar at 1:1 filling 57% of the screen, a three-line proof row (Now: care platform 2023–26; Live: bayyinahtv.com; In stores: App Store, Google Play), the caption "825 of 1440 pixels wide. Real product screens, invented data."
Four answers (phone): the same claim in four lines at 36 px, the proof row with its links, then the calendar crop from y≈470 (38% of the screen). All four read in under five seconds.
Memory sentence: "The care app's calendar sits on the page at its real size, cut off by the edge, and when you click it the page opens up and you see the whole app around it."
Beats: brittanychiang.com (claim and list, no work in view), leerob.com (a plain list), paco.me (text only). Loses to: rauno.me (the tile is the explanation; one ratio, one caption shape, at a scale this draft does not reach).
Checker: 0 fails, 0 warnings, 2 allowed (C08c phone density 1.55×; T45 the live "825 of 1440" readout). 4 type sizes on the first screen. LCP 532 ms. Live: the tile-to-case transition runs on click (420 ms, no pixel scales, frames `reviewer/p12-pro/sheet-scrub.png`), on Enter (instant, as the skill asks), on tap, and under reduced motion (instant). Back returns to the home with the tile in place. The case page's "See the whole screen" opens a native dialog; Escape closes it and focus returns to the button.

Evidence per score. Straight 9: the eye lands on the calendar before the words; the proof row is three nouns with two links. Proof 8: every lead row has scope and a checkable result ("2 database requests, not 16", "Live on the web and in both app stores", "About 14 releases", "A teammate wrote most of the building blocks"); it is not 9 because the home still needs the role phrase "Frontend and mobile developer, now full stack" to say what he is. Original 7: at rest it is the known pattern (claim left, screenshot right) and the brief asked for it; the decision lives in the 1:1 crop, the bleed and the transition, which only the live session shows. Hook 8: one moment worth mentioning, and it carries a fact (the app is real, at its real size); not 9 because the moment is 420 ms and quiet. Type 8: Hubot Sans at width 80 is a visible decision; the colours come from the care app (its teal, its red "now" line reused as the proof row's "Now" mark). A mood board would not take it.

What separates it from the 8s: crafted, bold and blind each have a rule you can see in a still capture. Pro's rule is only visible by comparing the capture to the real app.

Fix list:
1. First screen, desktop: make the rule read at rest. The caption "825 of 1440 pixels wide" is the whole idea, set at 12.5 px mono in the bottom-left corner. Give it the proof row's weight, or draw the window's edge (a hairline at the crop, a ruler mark at 1440) so a still says "actual size" without reading.
2. Home, "Phone apps for shoppers and readers" row: three store frames at phone width look like three equal cards. Vary them (one large, two small, or one row of the three screens cropped to one UI row each) so the section does not read as the 3-card pattern.
3. Case page, "The numbers" row: "36 building blocks" is the design system's number, not this project's; "4 languages" is a product fact. Keep "16 → 2" and one dated fact ("Same test passed on both apps, September 2026") and drop the rest, so the row proves the title.
4. Case page, first screen on phone: the hero screen starts at y≈610, after 88 words. Cut the summary to two sentences on phones, or move the facts `<dl>` below the screen.
5. Home, "About": "Gentrit works remotely from Kosovo and has a bachelor's degree from UBT" repeats the first screen. Replace with one dated line per place (phone since 2021, web since 2023, server since 2026) so About adds a fact.
6. The "Case" link in the masthead and "Read the care platform case" under the proof row go to the same place. Keep one.

---

## p12-pro/case — 39/50, gate pass

Straight 8 · Proof 9 · Original 7 · Hook 7 · Type+colour 8

Four answers (desktop): who, "Gentrit Rashiti, all work" in the back link / what, "Rebuilding a live care platform, one tested screen at a time" / for whom, "Care teams use this web app to look after patients at home" / proof, a facts `<dl>` (Role, Years, Platforms, Live: private, behind sign-in) and the calendar screen from y≈505.
Four answers (phone): the same, with the screen from y≈610.
Memory sentence: "The case where the app's screens are shown at their real size and the page tells you how much of the screen you are seeing." (A case page; a quieter sentence is expected.)
Beats: brittanychiang.com's project pages, leerob.com's writing pages, dennissnellenberg.com's case pages (motion without decisions). Loses to: emilkowal.ski (live demos inside the text).
Checker: 0 fails, 0 warnings (read mode). 5 type sizes.

Evidence. Proof 9: seniority from nouns alone. "The app could not stop. So it moves one screen at a time." "A new screen must do what the old one did." "Old bugs should not move over." Each decision is constraint, choice, consequence in under 40 words. Scope line in the first 80 words ("Gentrit wrote most of the rules and the checks. Teammates wrote the rest."). A trade-off sentence closes the engineering list. One dated witnessed result (September 2026). Straight 8: the title is the result, but the first screen holds 88 words before the screen. Original 7: the skill's case template, well executed. Hook 7: nothing to repeat beyond the actual-size dialog. Type 8: as the home.

Fix list:
1. "The numbers" row (see pro item 3).
2. The diagram "Old app → Test first → Agents build → Checks → Person approves" is five bordered boxes; on phone they stack into five pills. Draw it as one line with five words and one return arrow, no boxes.
3. "What was built" repeats the AI line that already closes "The product". Say it once.
4. The glucose chart screen is shown at 825 of 1440 px with its y-axis labels at about 10 px. Crop to the chart body or show it at 1:1 in the dialog only.

---

## LENTICULAR (p12-crafted) — 40/50, gate pass

Straight 8 · Proof 8 · Original 8 · Hook 8 · Type+colour 8

Four answers (desktop): who, in the claim / what, "builds the web and phone apps" / for whom, "learners, care teams and shoppers" / proof, the Bayyinah TV print (38% of the screen), "bayyinahtv.com ⇄ App Store", "Frontend, core team · 2023–26", Website, App Store, Google Play links.
Four answers (phone): the claim in five lines at 34 px, then the print from y≈430 with the face toggle under it. Readable; the five-line claim slows it.
Memory sentence: "The site where every screenshot is a lenticular card: turn it and the website becomes the phone app, because it is the same app on both."
Beats: cassie.codes (an animated character, not the work), dennissnellenberg.com (award-style motion with no fact), joshwcomeau.com (illustrated, known pattern). Loses to: emilkowal.ski (the motion is the thing he does, and you try it inside the text).
Checker: 0 fails, 0 warnings, 1 allowed (C17 dev-server LCP; production 0.82 s). 5 type sizes. Live: a slow pointer drag turns the card and the face follows the hand (`reviewer/p12-crafted/sheet-drag2.png`); a fast flick does not register. Click and the two 44 px buttons turn it; Space on a button turns it; a tap turns it on the phone. The sweep runs from the far edge to the near edge in about 500 ms (canvas sampled every 40 ms: columns at 90%, 70%, 50%, 30%, 10% flip at 125, 230, 300, 230, 525 ms). Interrupting mid-turn reverses from where it is. Reduced motion shows the website face, still. Idle: no card turns by itself after the load settle.

Evidence. Original 8: a computed lens (strips, a lens per 4 px, the angle picks the strip) is a technique no named site uses, and the fact it carries (one app on web and phone) is this person's. Not 9: the rule could exist for any web-and-phone developer, and at rest the still shows a screenshot with faint ribs. Hook 8: one moment, physically plausible, and the sentence carries a fact; not 9 because the first card is also the only one most visitors will turn; the care, reading and Viva cards sit far below. Straight 8: all four in five seconds on desktop; on the phone the claim is five lines and the first screen also shows the product's own "500k learners / +20y / 2000h" marketing band inside the print, which a stranger may read as his numbers. Proof 8: rows state scope and results ("Live in the App Store and on Google Play", "About 200 tests check each flow", "2 database requests, not 16"); not 9 because the design system row is an index line with no screen and no scope sentence. Type 8: Bricolage 640 at 66 px, bone ground, ink and accent sampled from bayyinahtv.com, About on the ink. A decision; not a mood-board shot.

What separates it from bold and blind: the technique is real and explains itself in one sentence of engineering, and the moment changes what you see of the same product. Bold's moment swaps data; blind has no moment.

Fix list:
1. First-screen print (1440 and 390): crop the bottom band of bayyinahtv.com ("500k Learners worldwide · +20y · 2000h"). The skill's own rule: a product's marketing must not read as the person's results in the first screen.
2. Phone claim: five lines at 34 px. Drop "the" and "that … use" on phones ("Gentrit Rashiti builds web and phone apps for learners, care teams and shoppers", four lines), or set the display width axis narrower.
3. The drag: a quick flick does nothing because the hand must hold for about 60 ms before moving. Start the drag on the first move past 5 px and give the release the hand's velocity, so a flick turns it.
4. The hero card is a `div` with `cursor: grab` and no name; keyboard users reach it only through the two buttons. Add `role="group"` with an accessible name ("Bayyinah TV, website and App Store faces") so the buttons have a subject.
5. Rows: "Care team ⇄ One patient", "My books ⇄ Reader", "Shop ⇄ Cart", "Light ⇄ Dark". Four of five cards turn between two screens of one face; only the first turns between web and phone, which is the fact the rule carries. Give at least the care card a web-and-phone pair, or say in one line what each turn proves.
6. Design System v2 is one index line with no screen; the care row's "Real product screens, invented data." caption is present (good), but the DS has none because it is not shown. If it stays an index line, add its scope ("Research and guides; a teammate wrote most of the building blocks").
7. "All work" index: 17 rows at 15 px on the bone ground; the years column is mono but the rows have no rule between groups. Group by employer with one hairline per group, as CONTENT §7b asks.

---

## IN YOUR STORE (p12-bold) — 39/50, gate fail

Straight 8 · Proof 7 · Original 8 · Hook 8 · Type+colour 8

Four answers (desktop): who, in the claim / what, "builds the phone and web apps" / for whom, "shoppers, readers and care teams" / proof, four named store apps with years, two Viva Fresh store frames (30%), "Live in both stores" with two working codes and the store URLs in mono.
Four answers (phone): claim in five lines at 35 px, then the four-app list, then App Store and Google Play buttons, then one store frame from y≈520. The codes are gone on the phone (right call: a code is for getting an app onto a phone, and on a phone the button does that). Readable; the list and buttons push the work low.
Memory sentence: "The one where you pick one of his four store apps, the page turns that app's colour, and a code appears that installs it on your phone."
Beats: brittanychiang.com, henryheffernan.com (a 3D desk costume), dennissnellenberg.com. Loses to: bruno-simon.com (a driven mechanism that is the whole site, not one row).
Checker: 0 fails, 0 warnings, 0 allowed. 5 type sizes. Live: click and arrow keys move the band and swap the frames, the text and the codes (`reviewer/p12-bold/sheet-click.png`, `sheet-scrub.png`); two quick clicks settle on the last one. The codes write themselves from the centre outward at load (frames 400–600 ms after commit, `sheet-load.png`). Drag on the list, drag on the frames, wheel over the list and a swipe on the phone do nothing; the "wheel" is a radio group driven by click and keys. Nothing moves by itself after load (8 s idle, same state). Reduced motion keeps every state.

Gate: fail. (a) Contrast: the 14 px mono year ("2023") in white on the selected band (rgb 237,29,38) measures 4.37:1; body-size text needs 4.5:1. The checker's contrast sample only covers text over images, so it missed a solid band. (b) Focus: with the keyboard on a radio, the focused label has `outline: none`; the only indicator is a box around the whole list. The selected band shows state, but not focus, and they differ while arrowing. Both are small fixes.

Evidence. Original 8: a decision a designer notices (one colour per app floods the band and the frame ground; working codes as the proof of "live"); not 9 because a list that drives a stage is a known control and phones-plus-QR is the app-landing composition. Hook 8: one moment worth mentioning and it carries a fact (both stores, today); not 9 because the visitor cannot drive it with the hand, the write-on plays once at load, and the hook leaves on phones. Proof 7: the lead rows describe what users do ("Shoppers fill a cart, pick a delivery slot") and say "Mobile. iOS and Android. React Native." but not what was built or decided; the care platform's scope and the 16 → 2 live below the fold. Straight 8: 85 words on the desktop first screen and a five-line phone claim. Type 8: Big Shoulders 800 caps, red band, phones on store red; the closest of the four to a mood-board shot, held back by the borrowed red and the 14 px white years.

What separates it from crafted: the control is a list, the output is new. From blind: it has a moment.

Fix list:
1. Gate, first screen: the year in the selected band. Set it in the ink on a lighter band, or at 15 px bold (4.37:1 passes only for large text), or move the year out of the band.
2. Gate, keyboard: draw the focus ring on the focused row (2 px ink outline inset) and keep the colour band for the selected row.
3. The list is called a wheel but does not turn: add pointer drag on the list with the skill's snap spring and velocity hand-off, and a horizontal swipe on the phone frame to go to the next app, so the mechanism is driven, not clicked. Keep the radio group as the keyboard path.
4. Proof: give each app row one built thing and one checkable result ("Built the cart, the delivery slots and the map search. In both stores since 2023."), not a user story. Put the care platform's "2 database requests, not 16" in the first screen's text, since it is the strongest number on the site and the lead is a store app.
5. First screen words: 85 on desktop. Cut the two-sentence description under the list to one line; the frames and the code already say "live".
6. Phone: the work starts at y≈520 after the list and two buttons. Put one frame directly under the claim, the list under it.
7. "LIVE IN BOTH STORES" is a caps kicker over the codes. Make it the codes' caption instead ("Scan to install. App Store · Google Play.").
8. The Dukagjini and Read to Feed codes point to store pages; Read to Feed's listing is removed and its code points at an archive URL. Say so next to the code ("archived listing"), as the links below do.

---

## THREE LANES (p12-blind) — 39/50, gate fail

Straight 7 · Proof 9 · Original 8 · Hook 7 · Type+colour 8

Four answers (desktop): who, in the claim / what, "builds the phone and web apps" / for whom, "care teams, readers and shoppers" / proof, "Phone apps since 2021. Web apps since 2023. The servers behind them since 2026", links (bayyinahtv.com, App Store, Google Play, github), then the three lane headers, "Today, 7 October 2026", "2026" and the Offday calendar at 27%. The answers are all there; the eye works for them: 84 words, six sizes, and the first work shown is the owner's own time-off app, which does not prove "care teams".
Four answers (phone): claim in four lines at 38 px, the proof sentence, the link row, then the Offday screen from y≈560. The lanes become a stacked list with a sticky lane header.
Memory sentence: "His work is laid out in three lanes, phone, web and server, down six years, and the server lane only starts in 2026."
Beats: taniarascia.com (dated lines, no lanes or screens), leerob.com, antfu.me (rows of nouns, no record). Loses to: lynnandtonic.com (a dated record where each year is a different idea you can open).
Checker: 0 fails, 0 warnings, 2 allowed (C17 dev-server LCP; T23 a shared Tailwind utility). Live: the lane headers are sticky and sit over the record as you scroll; the year bars are already drawn at load (the `tl-drawn` class is set on arrival, `transition: all` on the record), so no draw-in was observable; hover lights a bar. Enlarge opens a native modal dialog with Escape and focus return, but the page scrolls behind the open dialog (scrollY 47 → 847 after one wheel), so closing lands the visitor elsewhere.

Gate: fail. (a) Calm: six type sizes on the desktop first screen (13, 16, 20, 28, 44, 66); the gate is five. (b) The dialog does not lock the page; the sticky lane header and the dialog compete on phones. (c) `transition: all` on the record element (the skill's performance rule). All small.

Evidence. Proof 9: every entry carries a scope line in mono (employer, role, years), every product a date, the result lines are nouns ("2 database requests, not 16", "About 200 tests", "Gentrit built the portal frontend … Teammates built the wallet", "A teammate wrote most of the building blocks"), and the lanes themselves make the seniority argument (phone → web → server) with no rank word. Original 8: the lanes come from this person's facts and no named site has them; not 9 because a swimlane record is a known shape and the visitor drives nothing. Hook 7: the sentence is a fact about the layout, not a moment; nothing to try. Straight 7: four answers on screen but behind 84 words, a sentence, a link row, three headers and a date line, and the first screen's work is Offday. Type 8: Big Shoulders at 66 px with mono labels and one red "today" line on warm paper; a decision; shares its display face with p12-bold.

What separates it from crafted and bold: it has the best proof on the page and no moment. The rule is an arrangement.

Fix list:
1. Gate: merge 20 and 28 (lane headers and h3) and 44 and 66 (years and claim) into one each, so the first screen holds five sizes.
2. Gate: lock scroll while the dialog is open (`overscroll-behavior: contain` on the dialog, `overflow: hidden` on the root while open) and return the scroll position on close.
3. `transition: all` on `.tl-record`: name the properties (opacity, transform).
4. Lead: the first screen shows Offday, a personal product, because 2026 is the newest year. Reorder the 2026 band so the care platform's server and web entries come first and Offday after, or lead the record with the strongest checkable change regardless of year (the skill's order rule). The lanes still read.
5. Hook: add one moment the visitor drives that uses the lanes. Candidates: the lane header is a filter (press "SERVER" and the other lanes fade, the record shortens to the server entries); or the "Today" line scrubs (drag it up the record and the three lane counters at the top change: "phone 7 · web 5 · server 2"). Either keeps the four answers readable without input and turns the layout fact into a sentence with a verb.
6. First-screen words: 84. Drop the duplicated link row (bayyinahtv.com, App Store, Google Play, github, CV) from under the claim; the record carries every link.
7. Phone: the sticky lane header ("PHONE since 2021 …") stays on screen over 17,800 px of record and covers the first line of each entry when the page settles after a scroll. Let it unstick after the first lane change, or make it 32 px.
8. Page length: 11,500 px on desktop, 17,800 on phone. The record repeats every entry's two paragraphs. Cut each entry to one paragraph in the record and keep the second in the index or the case.

---

## What this says about the skill

Four builders, one skill, no sight of each other's work. Against the no-skill anchor (33) the skill lifted every draft by 6–7 points and against the live home (43) every draft sits 3–4 points short. The gain and the gap come from different places.

### What the skill reliably produced

- **A craft floor.** 0 hard fails on all five pages against 11 on the no-skill draft. Work in the first screen (27–57%), a claim as the largest text, facts only, scope sentences, no first person, no he/his, no internal counts, the owner's AI line verbatim, "Real product screens, invented data." where required, alt text on every image, 44 px targets, visible focus, zero template tells, one story moment per page under 800 ms, reduced motion that keeps state. The no-skill draft had none of this.
- **Straight to the point.** Four claims under 20 words, proof as nouns with links, 4–6 type sizes, 58–85 words. The 5-second test passes on every desktop first screen.
- **Proof.** Two drafts at 8 and one at 9 on proof; the no-skill draft at 7. Writing.md's row template and translation table worked.
- **Honest self-scores.** Builders scored themselves 37–40 and I scored them 39–40. The over-scoring the rubric warns about did not happen; if anything the builders under-scored original by one.

### The sameness across all four

1. **One claim sentence.** All four H1s are "Gentrit Rashiti builds the [web and phone] apps that [care teams, readers and shoppers] use." (word order varies). Three second lines are "Frontend and mobile developer since 2021, based in Kosovo, working remotely." The formula in `first-screen.md` and its example ("Ana Silva builds offline-first apps that field nurses use") did exactly what `directions.md` warns an example does: one headline on every draft.
2. **One masthead.** Work · About · CV · Email, from `writing.md`'s microcopy table, on three of four.
3. **One below-the-fold skeleton.** Work rows (title, mono meta, bold result line, paragraph, links) → an index of everything → About → Contact with the email as the biggest text. All four, and the live home too. The rule stops at the fold.
4. **One palette.** Paper or bone ground, dark ink, one red (Viva red, Bayyinah button red, the calendar's today red, the care app's now line). "Colour from the work" converges when the work shares a red. No draft on a dark ground; no draft with a two-colour identity.
5. **One source for type.** Every draft took a row of `visual.md`'s starting-points table whole: Hubot + Mona (Technical), Bricolage + Public Sans (Humanist), Big Shoulders + Public Sans (Poster) twice. Two of four drafts share a display face, which the divergence rule forbids and the builders could not know.
6. **Quiet hooks.** 420 ms, 500 ms, a radio click, a static arrangement. Every hook is one row deep and plays once. None reaches the page-wide, visitor-driven kind the live home has (the sun over Kosovo setting the light and the clock). The brief banned that idea; the skill offered nothing in its place that scores above 8.
7. **The same missing recipes.** All four builders re-derived the no-scale view transition, the size-adjusted font fallback, the crop-to-region density numbers, a radio-group mechanism, and a way to capture an interaction mid-flight. The time went to craft, not to the hook.

### Blind spots

- The skill judges after the build ("original or hook ≤ 7 → back to direct") and gives nothing to judge before it. All four builders said so.
- The skill's hook ceiling is set by its motion rules (≤ 800 ms, keyboard never animates, one moment) and its anti-slop list. Those rules cut slop; they also cut ambition. A driven state (a seam, a dial, a sun) has no duration, and the skill does not say so.
- The checker measured text over images and missed white on a solid red band (4.37:1). It warns on six sizes where the rubric fails.
- Nothing in the skill coordinates a round. Builders who cannot see each other's drafts need the divergence decided for them.

### Changes to the skill

1. **`reference/first-screen.md`, "Formula" and "Good".** Replace the single formula and the "Ana Silva builds … that field nurses use" example with five claim shapes, each with a fictional example in a different shape: verb-first ("Builds …"), product-first ("Three apps in both stores, one care platform, …"), place-and-year first ("Since 2021, from Kosovo: …"), a before/after ("Old app on the left, new app on the right."), a question of fact. Add: "In a round, no two drafts share a claim shape. The claim shape is part of the direction card." Add to the phone section: "If the claim runs to five lines, drop the 'for whom' list on phones and move it into the proof row."
2. **`reference/directions.md`, "Divergence rules".** Add a **round table** the round brief must fill before building: one row per draft with lead project, claim shape, composition, control pattern, display-face class (serif / grotesk / mono / condensed / drawn), ground (paper / dark / colour), accent source. No two cells equal in a column. Add a reviewer check: `scripts/check.mjs --round <dir>` diffs H1 shape, nav string, display family, ground L, section order across the drafts and warns on any match. Builders cannot see each other; the brief must.
3. **`reference/directions.md`, "Test the idea before building".** Make it a step with a reader: the direction card plus one static 1440 mock (even HTML with no motion) goes to a fresh reviewer who scores original and hook on the card alone. Build only cards at ≥ 8. Move "original or hook ≤ 7 → back to direct" here and delete it from the post-build path, where all four builders found it unusable.
4. **`reference/motion.md`, "The signature moment".** Add a hook ladder with evidence: 7 = plays once (a settle, a write-on); 8 = a moment the visitor triggers that changes what they see of one thing; 9 = a state the visitor drives continuously, visible across the whole page, carrying a fact about the person (light from a real sun, a seam between old and new, a lane filter). State that duration tokens apply to authored playback, not to driven state: a drag, a scrub or a dial has no cap, only interruptibility and a 10% scrub test. Add: "the memory sentence must contain a verb the visitor does (drag, scan, switch, press)."
5. **`reference/writing.md`, "Project rows" and "Microcopy".** Add: "The rule does not stop at the fold. Below the first screen the section order, the row shape and the index follow the rule (lanes are rows, prints are rows, lines are rows). If two drafts in a round read Work / More work / About / Contact in that order, one changes." Offer two more mastheads and two more contact shapes beside "the address as the biggest text" so the table is a set of options, not one answer.
6. **`reference/visual.md`, "Starting points by personality" and "Colour".** Say: "Take the display from one row and the text from another; never a row whole; never the same display face as another draft in the round (see the round table)." Grow the table to 15–20 rows. In "Colour", add: "In a round, at least one draft on a dark or coloured ground, and at least one with a two-colour identity. When every product shares a hue (red here), colour from the work converges; pick the source per draft in the round table."
7. **`snippets/`.** Add the four recipes every builder rebuilt: `view-transition-noscale.css` (px sizes on old/new, overflow hidden, offset translate, decode first, cross-fade when the tile is off screen, focus to the new h1); `font-fallback.md` (measure `size-adjust` on the claim string itself, ascent and descent overrides, swap + preload); `crop.md` with the density numbers (crop ≥ 1.74× the box for a translated image, 1.55× for phone frames at 390); `mechanism.md` (radio group with hidden inputs, pointer capture after 5 px, click suppression after a drag, velocity hand-off, touch-action, interrupt, reduced motion, delete test).
8. **`scripts/check.mjs`.** Measure contrast of text over solid coloured ancestors, not only over images (bold's 4.37:1 passed). Make C03 fail at six sizes, as the rubric does. Add a dialog test (open, wheel, check scrollY). Add `--interact "click:<sel>" --frames-after 60,150,300,600` so a visitor-triggered moment can be captured; three builders asked for it. Report the host loader's time separately from the draft's own LCP on a dev server.
9. **`reference/work-display.md`, "Other people's claims".** Add a checker hook: any first-screen image whose alt or caption names a public product must carry the caption "the product's own page" or be cropped above its marketing band; crafted's first screen shows "500k learners" uncaptioned.
10. **`reference/review.md`.** Record in the anchors section that builders in this round under-scored, not over-scored, and keep the fresh-reviewer step: the calibration held within 0 points on three anchors.
