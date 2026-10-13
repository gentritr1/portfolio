# p12-bold: IN YOUR STORE

Band: Bold (loop 12, skill test). Dev port 5304. Route `/drafts/p12-bold`. Polished once after the review (see the end).

## Brief (portfolio-page skill template)

Design Read: Reading this as: a frontend and mobile developer for hiring managers and founders who want shipped phone apps, leading with Read to Feed (about 14 releases in four years), in the rule of a launcher: every public app on the page is a working code that opens it in the visitor's own store, or its archived page.

Primary reader: hiring manager or founder, often on a phone. Secondary: a recruiter with 30 seconds.
After the visit they should: open one app from the page (scan the code from a laptop, or tap a store button on a phone), then open a case.
Strongest project and why: Read to Feed, by CONTENT.md and the owner's own case title ("A children's reading app, four years of releases"): about 14 releases to both stores in 2022 to 2025 and three major upgrades. It is the longest checkable record in the files. Bayyinah TV is stronger as a live product, but p12-crafted leads with it (one lead per draft). Viva Fresh, the first build's lead, has no number, so it moved to third.
Weakness stated, not hidden: Read to Feed's store pages are removed. The heading states the record ("About 14 releases in four years"); the archive is second, in the small labels under the codes ("App Store, archived") and the links.
Voice: no person. The name starts sentences, other sentences start with a verb. Never "I", "he", "his", "led", commit counts.
Owner rules applied (PRODUCT.md, CONTENT.md, and the two decisions after the review): public products named and linked; no employer-client relation (Vianova is not named on this page); the care platform screen carries the caption "Real product screens, invented data."; the AI line is used once, word for word; "16 to 2" is a proof line in the care row, not a headline; no internal counts; Design System v2 is "a team effort", with no individual credit (the owner's wording, 2026-10-07); the care rebuild is written as being rebuilt, with "No React screen is live yet."
Proof inventory: Read to Feed 2022-25, archived store pages. Bayyinah TV 2023-26, web and both stores. Viva Fresh 2023, both stores. Dukagjini Bookstore 2021-22, both stores. Care platform 2023-26. Store URLs, years, roles and frames are read from `src/content/projects.ts`.
Cannot show: care platform screens other than as "Real product screens, invented data."; Read to Feed live listings (removed, so the codes open the archived copies and say so).
Constraints: React 19, motion, plain CSS under `.pb-`, local fonts, no new dependencies. Built chunk: 25 kB JS (9.2 kB gzip) and 13 kB CSS (3.5 kB gzip).
Memory sentence (target): "The one where you pick one of his four store apps, the page turns that app's colour, and a code appears that opens it on your phone."

## Direction card

id / title: p12-bold / IN YOUR STORE

Rule: the page is a launcher that turns each shipped app into a code your phone can scan.

Composition (first-screen.md #6, one mechanism the visitor operates): the four answers are text beside it, so nothing needs input.
- 1440x900: nav top right. Left: the claim (56px, the largest text), one line of years and place ("Frontend and mobile developer since 2021, full stack since 2026. Kosovo, remote."), the wheel (four names, a band in the app's colour over the selected one), then the selected app's facts. Middle: two public store frames of the selected app, 300px wide each, 30% of the screen. Right: a fact line ("About 14 releases in four years") and two codes (App Store, Google Play) with the exact URL under each.
- 390x844: nav, claim (3 lines), wheel, store buttons (the visitor's own store first), then one store frame from y=478. The codes are hidden on phones: a code cannot be scanned from the same screen, so the buttons do the job. No duplicate on any single screen: buttons from 900px down, codes from 1200px up.

Hook and the fact it carries: "The one with the wheel of apps and the codes you scan to open the real app in your store." The fact: four apps, three live in the App Store and on Google Play (URLs printed under each code); Read to Feed's codes open the archived pages ("web.archive.org, Nov 2025").

Delete test: remove the wheel and the codes. Every fact is still readable: the Work section lists the same four apps in a table (years, role, result, store links) and the first screen still holds the claim, the lead app and its store frames. The visitor loses the shortcut from a desktop screen to the app on a phone.

How the visitor drives it (mechanism.md spec):
- Pointer: drag the list with a mouse, drag the store frames sideways, click a row. Capture only after 5 px, so clicks work; the click after a drag is suppressed; the band stretches with friction at the ends; release hands its velocity to spring.snap (600/40).
- Touch: the list has `touch-action: pan-y` (a vertical swipe scrolls the page; a tap picks a row); a horizontal swipe on the store frames goes to the next app; a vertical swipe on the frames scrolls.
- Trackpad: a sideways swipe over the frames steps to the next app (the vertical wheel is never touched).
- Keyboard: the list is a radio group; arrow keys change the app instantly (no travel) and the focused row shows a double ring (ink outside, white inside) on the band.
- Interrupt: a second input mid-motion starts from the current position and velocity.
- Reduced motion: the end state of each input, instantly; codes drawn complete.

Type: display Big Shoulders Display 800 (condensed civic signage; the store frames read like shop signs; used for claim, wheel, hook line and headings). Text Public Sans at 17px. Data (years, URLs) JetBrains Mono 14px. First-screen sizes at 1440: 56 / 40 / 28 / 17 / 14. The first paint is held until the faces are in (700 ms at most), with a metric-matched fallback behind it, so the claim never reflows (CLS 0 at 390, 412, 768, 1280, 1440, 1920).

Colour: paper and ink tinted toward red. No accent of its own: the page takes the colour of the app on the wheel, sampled from its own store frame, with the band set so white text passes 4.5:1 (Read to Feed blue 15,114,162 at 5.3:1; Bayyinah maroon 128,20,2 at 10.4:1; Viva Fresh red darkened 8% from 237,29,38 to 217,24,31 at 5.1:1; Dukagjini logo red 222,0,22 at 5.1:1). Job: the selected band and the focus ring. Codes are ink on white, because a scanner needs it.

Motion: one story moment, the codes write themselves at load, from the centre outwards, 700 ms, expo-out (`data-motion="story"`). After that the band follows the pointer with its own text inverted inside it, the store frames slide and cross-fade with its position (scrubbable), and the code rewrites only the squares that differ, 320 ms.

Mechanisms earned: M1, M2, M3 (real QR encoder, checked against the `qrcode` library and decoded from screenshots with ZXing), M5, M9, M12.

## Four first-screen answers (read off `1440.png` and `390.png`)

Desktop:
- Who: Gentrit Rashiti (the first words of the biggest text).
- What: builds phone and web apps; frontend and mobile developer, full stack since 2026.
- For whom: shoppers, readers and care teams.
- Proof: Read to Feed, "About 14 releases in four years", two codes with archived store URLs, two real store frames, four named apps with years 2021 to 2026, "since 2021".

Phone:
- Who, what, for whom: the same sentence in three lines at 32px.
- Proof: the four named apps with years, App Store and Google Play buttons (marked archived for the lead), and one real store frame from y=478.

## Polish pass (after the review, 39/50, gate fail)

Facts: care row heading is now the owner's ("Rebuilding a live care platform, one tested screen at a time.") with "No React screen is live yet."; Design System v2 keeps the owner's line; the hero line adds "full stack since 2026".
Gate: the selected band is set so every year passes 4.5:1 (measured on all four apps); the focused row has a visible double ring.
Clarity: Read to Feed leads and the wheel is ordered by strength; its heading is the record, the archive is a small label; the codes' heading is a fact, and the duplicate caption is gone; drag, swipe and horizontal trackpad work; the table has a Result column.
Phone: the list no longer blocks scrolling; the frame starts at y=478; the care screen is a readable crop (94% of its size instead of 30%).
Craft: the heading and its line no longer collide (a zero-specificity reset); the document background and theme colour match the page; link underlines sit under the words; first-paint hold removes the font-swap shift.
Not done: the stage still shows the stores' own frames, not a crop to the screen inside the device. The Bayyinah frames are tilted renders with no flat screen to crop, so a crop would split the stage into two kinds of picture.
