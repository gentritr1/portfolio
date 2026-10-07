# p12-bold: IN YOUR STORE

Band: Bold (loop 12, skill test). Port 5304. Route `/drafts/p12-bold`.

## Brief

Design Read: Reading this as: a frontend and mobile developer for hiring managers and founders who want shipped phone apps, leading with Viva Fresh (live in both stores), in the rule of a launcher: every public app on the page is a working code that opens it in the visitor's own store.

Primary reader: hiring manager or founder, often on a phone. Secondary: recruiter with 30 seconds.
After the visit they should: open one app from the page (scan the code, or tap a store button), then open a case.
Strongest project: Viva Fresh. It is live in both stores, so the proof can be opened on the visitor's phone in two taps. Read to Feed has the deeper maintenance record (about 14 releases, React Native 0.63 to 0.81) but its listings are removed, so it is the fourth row on the wheel, with archived copies.
Voice: no person. The name starts sentences; other sentences start with a verb. Never "I", "he", "his", "led", counts of commits.
Owner rules (read in PRODUCT.md and CONTENT.md): public products named and linked; no employer-client relation; Vianova only on its own platform rows (not used on this page); care platform screens only with the caption "Real product screens, invented data."; the AI line exact; "16 to 2" is a proof line.
Proof inventory (all from CONTENT.md and src/content): Viva Fresh 2023, App Store + Google Play, Albanian, delivery slots, loyalty, wishlist, map address search. Dukagjini Bookstore 2021-22, both stores, push deep links. Bayyinah TV 2023-26, web + both stores, English and Arabic. Read to Feed 2022-25, about 14 releases, RN 0.63 to 0.81, three languages, listings removed (archived copies). Care platform 2023-26 (16 to 2). Incentiv 2024, portal link.
Cannot show: care platform and design system except as "Real product screens, invented data."; Read to Feed live listings (removed).
Constraints: React 19, motion, plain CSS, local fonts, no new dependencies, lazy chunk under 150 kB gzip (the QR encoder is about 4 kB, written for this page).
Memory sentence (target): "The portfolio where you spin a wheel of apps and a code appears that opens the real one in your phone's store."

## Direction card

id / title: p12-bold / IN YOUR STORE

Rule: the page is a launcher that turns each shipped app into a code your phone can scan.

Lead project and why: Viva Fresh. Public in both stores, red store frames that carry the page colour, easy to name in plain words (a grocery app with delivery slots).

Composition (first-screen.md): 6, one mechanism the visitor operates. The four answers sit beside it as text, so nothing needs input. Desktop: claim and wheel at left, two real store frames in the middle, the two codes at right. Phone: claim, store buttons, wheel, then one frame.

First screen:
- 1440x900: nav (Work, About, CV, Email) top right. Left: the claim set as the biggest text ("Gentrit Rashiti builds the phone and web apps that shoppers, readers and care teams use."), a second line (place, since 2021), the wheel of four apps (Viva Fresh selected), the selected app's facts. Middle: two public store frames of the selected app at about 300px wide each (2.6x density). Right: two codes (App Store, Google Play) with the exact URL under each and the line "Live in both stores."
- 390x844: nav, claim (4 to 5 lines), the two store buttons of the selected app, the wheel (3 rows), then one store frame at 358px wide, cut by the fold.

Hook (memory sentence) and the fact it carries: "The one with the wheel of apps and a code that opens the real app in your store." The fact: Viva Fresh, Dukagjini Bookstore and Bayyinah TV are live in the App Store and on Google Play (store URLs printed under each code); Read to Feed's listings are removed, so its row shows archived copies and no code.

Delete test: remove the wheel and the codes: every fact is still readable (the Work section lists the same four apps with years, role, platforms and store links as text). The visitor loses the shortcut from a desktop screen to the app on a phone. If nothing were lost, it was a costume.

Type: display Big Shoulders Display, wght 800 (condensed civic signage: the Viva Fresh and Dukagjini frames read like shop signs; the face is used for claim, wheel and headings, not as one decorative moment). Text Public Sans 400-600 at 17px. Data (years, URLs) JetBrains Mono 13px. First-screen sizes: 62 / 40 / 17 / 13 (four).

Colour: ground is warm paper, ink is warm near-black, both tinted toward red (hue 28). No accent of its own: the colour of the page is the colour of the app on the wheel, taken from its own store frame (Viva Fresh red 237,29,38; Dukagjini pink 249,163,162; Read to Feed blue 80,175,220; Bayyinah maroon 78,12,0). Job: marks the selected row and the focus ring only; the frames carry the big colour.

Motion: one story moment: the codes write themselves at load, squares appearing from the centre outwards, 700 ms, expo-out (`data-motion="story"`). Afterwards the wheel snaps with spring.snap (stiffness 600, damping 40), the frames slide with the wheel, and the code rewrites only the squares that differ, 320 ms. Keyboard changes are instant. Reduced motion: no travel, codes drawn complete, wheel jumps.

Mechanisms earned: M1 (every public app is a code), M2 (the wheel is the navigation), M3 (the code is real: encoded in the browser, no image; explainable in one sentence), M5 (turning the wheel changes what the visitor can open), M9 (store URLs, years, languages), M12 (the visitor's device decides which store button leads; the visitor makes the code appear).

Risk / what could make it a costume: a phone-shaped wheel or an iOS skin. Avoided: no device frame drawn by the page (only the stores' own frames), no OS chrome. A second risk is that the codes are decoration: they are checked with a decoder (OpenCV) from a screenshot.

## Four first-screen answers (read off the captures; filled after the build)

Desktop: pending.
Phone: pending.
