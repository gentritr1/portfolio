# ACTUAL SIZE (p12-pro)

## Brief

Design Read: Reading this as: a frontend and mobile developer, now full stack, for a hiring manager with two minutes, leading with the care platform rebuild, in a page where every product screen is shown at its real size.

Primary reader: hiring manager or design lead (2–5 min, often on a phone first). Secondary: recruiter (10–30 s, needs role words, place, CV, a live link).
After the visit they should: open the care platform case, then the CV or the email.
Strongest project: the care platform rebuild (Vianova, 2023–26). It is the largest checkable change (a live app moved to React screen by screen while care teams keep using it; one billing report from 16 database requests to 2), it matches the reader, and its real screens exist at 2× (2880 × 1800 files for a 1440 × 900 app).
Voice: no person (sentences start with the name or the verb). Owner rules (CONTENT.md, PRODUCT.md, BRIEF.md, 2026-10-02 to 2026-10-06): never "I", "he", "his", "led", "top contributor" or commit counts; plain English; facts only from the files; no internal counts; public products named and linked; no relation stated between an employer and a client product, Vianova named only on its own platform rows; care and design-system screens carry "Real product screens, invented data."; the AI line used exactly; "16 → 2" is a proof line, never a headline.

Proof inventory (used on this page):

| Project | What it is | Scope | Years | Live link | Screens | Numbers |
|---|---|---|---|---|---|---|
| Care platform | Remote patient care for care teams | Web and mobile; since 2026 also the server; wrote most of the rebuild's rules and checks | 2023–26 | private | care-dashboard/* (real, invented data) | 16 → 2 requests (CONTENT §2), 4 languages |
| Bayyinah TV | Video-learning platform, web + inside both store apps | Frontend, core team | 2023–26 | bayyinahtv.com, App Store, Google Play | bayyinah/web-03 (public page) | — |
| Viva Fresh, Dukagjini Bookstore, Read to Feed | Grocery, bookstore and children's reading apps | Mobile | 2021–25 | store listings (Read to Feed archived) | mobile/* (public listings) | about 14 releases (Read to Feed) |
| Design System v2 | Shared building blocks for the new care dashboard | Research and agent guides; a teammate wrote most components | 2026 | private | design-system/date-range-picker (real, invented data) | 20 releases in about six weeks |

Cannot show: the care platform's old app beside the new one, internal counts → substitute: text only, in the case.
Constraints: React 19, motion, local fonts, own folder, 375/390 and 1440, keyboard, reduced motion, one light theme.
Memory sentence (target): "The one where the care app is shown at its real size, cut off by the page, and opening the case opens the window to the whole screen."

## Direction card

- **id / title:** p12-pro / ACTUAL SIZE
- **Rule:** the page is a window onto the real apps at actual size: every screen is cut to the part that proves its line, never shrunk, and opening a case only opens the window wider.
- **Lead project and why:** the care platform rebuild; the biggest checkable change for a hiring manager, and its screens are dense enough that real size matters (claims, CPT codes, a week of visits stay readable).
- **Composition:** first-screen.md #1, sentence + proof row + one screen, decided by the rule: the screen is 1:1, so it cannot fit; it takes the right side and runs off the top and right edges of the viewport. The words get a narrow left column, which is why the display face is condensed.
- **First screen:** 1440: left column (64–576 px): name and nav, the claim in four lines, the role line, a three-row proof table, one action, and the figure caption at the foot of the column; right (616 px to the edge): the care team calendar at 1:1, from the app's top bar down, cut by the fold. 390: name and nav, the claim in four lines, the role line, the proof table, then the calendar at 1:1 full bleed (Tuesday to Thursday, 9 AM to noon, with the red now line), the caption, the action.
- **Hook and the fact it carries:** "the care app at real size, cut off by the page; opening the case opens the window to the whole screen". Fact: these are the real screens, readable as a care team reads them. On the page as text in every caption: "Shown at actual size."
- **Delete test:** scale every screen to fit and remove the transition: the claim, the proof table, every result line and every caption still say who, what, for whom and the proof. Nothing is lost but the look, so it is a rule, not navigation.
- **Type:** display = Hubot Sans (local subset "Gentrit Display") at width 80, weight 740: the screens take the width at real size, so the claim takes the height; the narrowest width sets 13 words in four lines at 64 px inside five columns. Text = Mona Sans ("Gentrit Text", Hubot's sibling) 400/600. Outlier = IBM Plex Mono ("Gentrit Technical Mono") for years, numbers and scale marks, tabular. First-screen sizes: 64 / 19 / 15 / 13.
- **Colour:** ground #f5f7fb, the care app's own ground, so a 1:1 screen sits in the page with no frame; ink oklch(0.25 0.04 235), the app's dark teal taken toward black; one accent #01698f, the app's own primary button, for links, the action and focus (under 5% of a viewport); one red mark (#c81e25, from the app's current-time line) means "now", once per screen at most.
- **Motion:** quiet layer only: press 120 ms, underline 150 ms, focus instant, hover inside fine pointers. The one moment: home tile to case hero, a View Transition of 420 ms, expo-out (0.16, 1, 0.3, 1). The window grows from the home crop to the full app width while the pixels inside never scale (each product pixel stays on the same app pixel; only the window and its position move). Keyboard activation and reduced motion navigate with no animation.
- **Mechanisms earned:** M1 (actual size everywhere, phone screens at phone width), M3 (the transition is real 1:1 pixels, no scale), M9, M11, M13, M14.
- **Risk:** it can read as a clean, ordinary portfolio with big screenshots. The bleed, the phone screens at phone size and the caption "Shown at actual size" must make the rule visible; the transition must be exact or it is just a zoom.

## Four answers (read off my own captures, 1440.png and 390.png)

- **Desktop (1440 × 900):** who: Gentrit Rashiti, the first words of the 64 px claim. What: web and phone apps; the role line adds "frontend and mobile developer, now full stack", remote from Kosovo. For whom: care teams, learners and shoppers. Proof: the real care team calendar at actual size fills the right 57 % (caption: real product screens, invented data, 825 of 1440 pixels wide); the proof table names the care platform rebuild at Vianova, 2023–26, and links bayyinahtv.com and Viva Fresh in the App Store and on Google Play.
- **Phone (390 × 844):** who, what, for whom: the same claim in four lines at 36 px, role line under it. Proof: the three-row proof table with the live and store links, then the calendar at actual size from about y 480 (Tuesday to Thursday, 9 AM to noon, the red now line), caption at the fold. The action sits just under the fold; the screen itself is a link to the case.
- **Memory sentence (as a stranger):** "The one where the care app's real screens are shown at actual size, cut off by the page, and opening the case widens the window to the whole app without zooming."

## Build notes

- Crops are app pixels, not percentages (`shots.ts`); each window places a 1:1 image with `left/top` and clips it. Captions measure the window and print how many of the app's pixels it shows.
- The tile-to-case transition (`openWindow.ts`): the hero window and the case window share one `view-transition-name`; the snapshots are drawn at their own size (`inline-size/block-size` in px) inside a clipping image pair, and both slide by the difference of their crop offsets, so each app pixel stays on the same app pixel while the window grows. End state checked pixel-identical to a direct load at 1440. Keyboard activation, reduced motion and a source that is off screen do not animate the window; focus moves to the new view's h1.
- Fonts: the first frame waits up to 700 ms for the two local faces so the condensed claim never reflows (CLS 0).
- Checker: home PASS, 0 fails, 0 warnings, allowed C08c and T45 (see meta.json). Case (`--mode read`) PASS, 0 fails, 0 warnings.
- Polish passes: 1) reset specificity (`:where`), headings out of the host's Archivo, 44 px targets, crops that cut no text, 320 px masthead and claim; 2) measured captions, "Services" and "runtime" removed, focus handoff, proof-link hit areas.

## Polish pass (after the fresh review and the devil's advocate, 2026-10-07)

- Facts first: the care rebuild is written as in progress everywhere ("Being rebuilt in React, one tested screen at a time. None is live yet; care teams use the Vue app."); the Now row is "since 2026"; the AI line is verbatim and said once per page; the Design System row keeps the owner's team-effort wording; no product marketing number appears in a screenshot (Dukagjini now shows its Foreign Books list).
- The hero screen is now the claims screen (claims are in the built list), and the case hero and the transition use it too.
- The rule reads at rest: every screen sits under a dimension line measured live ("Actual size: 782 of 1440 pixels across"); windows end at the gutter with a hairline frame instead of bleeding.
- Four answers now: desktop, the claim, the role line with "since 2021", the claims screen at actual size under its dimension line, and the proof table; phone, the claim, the role line, the dimension line and the claims screen from y ≈ 340 with the owner's caption under it, then the proof table.
- Transition: 520 ms in-out; the dimension line is a second shared element that grows with the window to "all 1440 pixels across". Coming back restores the row the visitor left.
