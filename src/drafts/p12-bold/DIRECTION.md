# p12-bold: IN YOUR STORE

Band: Bold (loop 12, skill test). Dev port 5304. Route `/drafts/p12-bold`.

## Brief (portfolio-page skill template)

Design Read: Reading this as: a frontend and mobile developer for hiring managers and founders who want shipped phone apps, leading with Viva Fresh (live in both stores), in the rule of a launcher: every public app on the page is a working code that opens it in the visitor's own store.

Primary reader: hiring manager or founder, often on a phone. Secondary: a recruiter with 30 seconds.
After the visit they should: open one app from the page (scan the code from a laptop, or tap a store button on a phone), then open a case.
Strongest project: Viva Fresh. It is live in both stores, so the proof opens in two taps. Read to Feed has the deeper maintenance record (about 14 releases, React Native 0.63 to 0.81, three major upgrades), but its listings are removed, so it is the fourth row on the wheel with archived copies.
Voice: no person. The name starts sentences, other sentences start with a verb. Never "I", "he", "his", "led", commit counts.
Owner rules applied (PRODUCT.md, CONTENT.md): public products named and linked; no employer-client relation (Vianova is not named anywhere on this page); the care platform screen carries the caption "Real product screens, invented data."; the AI line is used exactly once, word for word; "16 to 2" is a proof line in the care row, not a headline; no internal counts.
Proof inventory: Viva Fresh 2023, App Store and Google Play, Albanian. Dukagjini Bookstore 2021-22, both stores. Bayyinah TV 2023-26, web and both stores. Read to Feed 2022-25, archived store pages. Care platform 2023-26. Store URLs, years, roles and frames are read from `src/content/projects.ts`.
Cannot show: care platform screens other than as "Real product screens, invented data."; Read to Feed live listings (removed, so the codes open the archived copies and say so).
Constraints: React 19, motion, plain CSS under `.pb-`, local fonts, no new dependencies. Built chunk: 22 kB JS (8.4 kB gzip) and 12 kB CSS (3.4 kB gzip); the QR encoder is about 4 kB of that.
Memory sentence (target): "The one with the wheel of apps and the codes you scan to open the real app in your own store."

## Direction card

id / title: p12-bold / IN YOUR STORE

Rule: the page is a launcher that turns each shipped app into a code your phone can scan.

Lead project and why: Viva Fresh. Public in both stores; its red store frames set the colour of the page; easy to say in plain words (a grocery app with delivery slots).

Composition (first-screen.md #6, one mechanism the visitor operates): the four answers are text beside it, so nothing needs input.
- 1440x900: nav top right. Left: the claim (56px, the largest text), one line of place and years, the wheel (four names, a band in the app's colour over the selected one), then the selected app's facts. Middle: two public store frames of the selected app, 300px wide each (2.6x density), 30% of the screen. Right: two codes (App Store, Google Play) with the exact URL under each, and the line "Live in both stores".
- 390x844: nav, claim, wheel, store buttons (the visitor's own store first), then one store frame at full width cut by the fold. The codes are hidden on phones (a code cannot be scanned from the same screen); the buttons do the job.

Hook (memory sentence) and the fact it carries: "The one with the wheel of apps and the codes that open the real app in your store." The fact: Viva Fresh, Dukagjini Bookstore and Bayyinah TV are live in the App Store and on Google Play (the URLs are printed under each code). Read to Feed is "Removed from both stores" and its codes open the archived pages ("saved 24 Nov 2025", "saved 16 Mar 2026", dates taken from the archive URLs).

Delete test: remove the wheel and the codes. Every fact is still readable: the Work section lists the same four apps in a table (years, role, platforms, store links) and the first screen still holds the claim, Viva Fresh and its store frames. The visitor loses the shortcut from a desktop screen to the app on a phone. Nothing else.

Type: display Big Shoulders Display 800 (condensed civic signage; the Viva Fresh and Dukagjini frames read like shop signs; it is used for claim, wheel, hook line and headings, not as one decorative moment). Text Public Sans 400 to 700 at 17px. Data (years, URLs) JetBrains Mono 14px. First-screen sizes at 1440: 56 / 40 / 28 / 17 / 14. Metric-matched fallbacks (`size-adjust` measured against Arial) keep CLS at 0.

Colour: paper and ink tinted toward red (oklch hue 28 to 60). No accent of its own: the page takes the colour of the app on the wheel, sampled from its own store frame (Viva Fresh red 237,29,38; Dukagjini logo red 222,0,22; Bayyinah maroon 128,20,2; Read to Feed button blue 15,114,162). Job: the selected band and the focus ring only; the frames carry the large colour. Codes are ink on white, because a scanner needs it.

Motion: one story moment, the codes write themselves at load: squares appear from the centre outwards, 700 ms, expo-out (`data-motion="story"`). After that: the band follows the pointer or finger with its own text inverted inside it; on release it snaps with spring.snap (600/40) handing off the release velocity; the store frames slide and cross-fade with the band's position (scrubbable, interruptible); the code rewrites only the squares that differ, 320 ms. Keyboard changes (arrow keys on the radio group) are instant. Reduced motion: no springs, no travel, codes drawn complete.

Mechanisms earned: M1 (every public app on the page is a code), M2 (the wheel is the navigation and the index), M3 (real QR encoder in 4 kB, checked against a reference library and with the ZXing decoder on screenshots), M5 (moving the band changes what the visitor can open), M9 (store URLs, years, languages, archive dates), M12 (the visitor's device picks which store button leads; the visitor makes the code appear).

Risk / what could make it a costume: a phone-shaped wheel or an iOS skin. Avoided: no device frame drawn by the page (only the stores' own frames), no OS chrome. Second risk: the codes are decoration. Checked: a decoder reads every code from a screenshot of the live page, at 1x and 2x, for all four apps.

## Four first-screen answers (read off `1440.png` and `390.png`)

Desktop:
- Who: Gentrit Rashiti (the first words of the biggest text).
- What: builds phone and web apps; frontend and mobile developer.
- For whom: shoppers, readers and care teams.
- Proof: Viva Fresh, "Live in both stores", two codes with the App Store and Google Play URLs, two real store frames, years 2021 to 2026 on the wheel, "since 2021", Kosovo.

Phone:
- Who, what, for whom: the same sentence, four lines at 35px.
- Proof: the wheel with four named apps and years, the App Store and Google Play buttons for Viva Fresh, and one real store frame under them.

Memory sentence: "The one with the wheel of apps and the codes you scan to open the real app in your store."

## Notes from the build

- Checker (final): 0 hard fails, 0 warnings at 1440 and 390, on the dev server and on a production build served at 4x CPU throttle (LCP 764 ms and 644 ms, intro p95 16.7 ms, CLS 0).
- The `--frames 150,400,900` captures count from navigation, so on this SPA the first two land on the host app's "Opening the draft..." state. Mid-animation frames of the codes (circle growing from the centre) were captured with my own script and looked at; the t900 frame shows the code half written.
- One polish pass done after the first checker run (metric-matched fallbacks for CLS, target sizes, underline position, text trimmed to plain words). No second pass needed.
