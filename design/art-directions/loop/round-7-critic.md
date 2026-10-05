# Loop 7 critic: sampled-ground, projector (polish); sampled-frame (new)

Critic: fresh, built none of these. I judged from the PNG files, the source, and my own captures. I did not trust builder claims. The scale is the same as in round 6: 7 = a good personal site, 8 = distinctive, 9 = best in class. Self-scores are in brackets. Scores are whole numbers.

Abbreviations: `S` = `.../scratchpad/review/`, `C` = `.../scratchpad/crit7/` (my sheets and captures).

## What I measured myself

- **Chroma.** I ran the round-6 script again (`C/chroma7.mjs`, the same decode and threshold, with each meta.json plate rectangle) on each `final/d-top.png`. All three builder numbers match to 0.1%: sampled-ground 38.1 / 40.1, projector 51.1 / 93.9, sampled-frame 28.3 / 41.0 (whole screen / outside the plates).
- **Static state.** I ran `S/r6check/diff.mjs` on 11 pairs. All 11 have 0 differing pixels:
  - sampled-frame: `d-reduced-top-4s/12s`, `d-reduced-03-4s/12s`, `m-reduced-top-4s/12s`, `m-reduced-03-4s/12s`.
  - sampled-ground: `d-reduced-bayyinah-tv-4s/10s`, `d-reduced-design-system-a/b`, `m-reduced-bayyinah-tv-4s/10s`, `d-bayyinah-tv-4s/10s` (normal mode, paused room).
  - projector: `d-reduced-02-a/b`, `d-reduced-08-a/b`, `m-reduced-02-a/b`.
- **Other widths.** I made my own captures in `C/cap/` at 1280×800 and 1024×768 (`sf-1280`, `sf-1024`, `pj-1280`, `pj-1024`, `sg-1280`). I also captured "/" at 1440 (`home-1440`), and it shows projector as the live home page.
- **Facts.** Every number and claim on the three pages is in CONTENT.md or `src/content/*`. That includes "Teammates built the wallet and blockchain layer", "from an empty template", "4 languages", "MetaMask, WalletConnect", "about six weeks", and "on-chain wallet". There is one false label: see sampled-ground D3.

## NDA check (every Vianova plate)

The only Vianova plates are the shared `design-system` specimen and the `care` card. The text "Vianova" does not appear on any page. Each plate has a visible label:

| Draft | Specimen | Care card | Footer |
| --- | --- | --- | --- |
| sampled-ground | "Recreation with invented data" in the card meta, plus the plate's own "Recreation · invented data" pill (`d-design-system.png`); phone `m-design-system.png` | "Recreation with invented data" (`d-care-platform.png`, `m-care-platform.png`) | "The live plates are recreations with invented data…" (`d-end.png`) |
| projector | "Component specimen. Recreation with invented data." (`d-top.png`, `m-top.png`) | "Vitals card for one organization. Recreation with invented data." (`d-02.png`, `m-02.png`) | "The specimen, care and reader screens are recreations…" (`m-end.png`) |
| sampled-frame | "Component specimen. Recreation with invented data." (`d-top.png`, `m-top.png`) | "Vitals trend card. Recreation with invented data." (`d-02.png`, `m-02.png`) | "The specimen, care, live room, wallet and reader screens are recreations with invented data…" (`d-end.png`) |

Projector row 03 ("16 → 2 queries") is a care-platform result with no screen. It shows a numeral only, so it needs no label. NDA: pass on all three.

## Scores

| Point | sampled-ground | projector (live "/") | sampled-frame |
| --- | --- | --- | --- |
| 1 Straight to the point | 8 [8.5] | 9 [9] | 9 [9] |
| 2 Not overwhelming | 8 [8] | 8 [8] | 8 [8] |
| 3 UI/UX harmony | 8 [8.5] | 8 [8.5] | 8 [8] |
| 4 Meaningful motion | 9 [9] | 8 [8] | 8 [8.5] |
| 5 Actions and seniority | 8 [8.5] | 8 [8.5] | 8 [8] |
| 6 Original | 8 [8] | 7 [7] | 8 [8] |
| 7 Hooks | 8 [8] | 8 [8] | 8 [8.5] |
| **Total** | **57** [58.5; polish array says 58] | **56** [57] | **57** [58] |
| Plain-copy score (/10) | 6 | 5 | 6 |
| Slop count | 0 | 0 | 0 |

Ranking: sampled-frame 57 (point 1 = 9 breaks the tie), sampled-ground 57, projector 56.

Trend: sampled-ground 56 → 57 → 57 (0). Projector 55 → 56 → 56 (0). This is the second polish round that closed most of the list but did not move the total. In this round, three closures moved the defect to a new place instead of removing it (sampled-ground D3 and D5, projector D1).

---

## sampled-ground (polish: 57 → 57) [self 58]

### Round-6 defects: closed or not

1. **The plate does not fill its slot.** Closed. The store screen is 604 × 370 at its source pixels and fills its slot. The text column is wider. "Ajvar i djeges" is sharp (`d-top.png`, `pairs/1-after-…`).
2. **The name is a footnote.** Closed. "**Gentrit Rashiti** builds web and mobile apps, from Kosovo." is a 20 px line under the claim (`d-top.png` y 246). After scroll, the name stays in the sticky bar (`d-bayyinah-tv.png` x 88).
3. **Pins do not prove their results.** Mostly closed:
   - Bayyinah TV: "Moderated live chat." is first, and the pin is on the pinned message (`d-bayyinah-tv.png`).
   - Design System: the One source row proves "It generates CSS, TypeScript and a Figma bundle" (`d-design-system.png`).
   - Care: the organization switcher proves "Each sees only its own patients" (`d-care-platform.png`).
   - Viva Fresh: the checkout button proves "One checkout, in Albanian". No pixel proves "in both stores" (`d-top.png`). Not fully closed.
4. **Two hue numbers.** Closed on screen, but it opened a truth defect. The bar and the card show "Bayyinah TV · 23°" and "hue 23°" (`d-bayyinah-tv.png`), but `data.ts:99` measures this screen at 34°. The page says "Sampled from the screen under it" next to a number that was not sampled from it.
5. **Phone plates.** Closed. Each phone plate is a readable crop of the ringed part: the Incentiv sign-in card, the badges row, the One source row, and the chat (`C/sg-m.png`, `m-incentiv.png`, `m-bayyinah-org.png`).
6. **Empty chat column.** Moved, not closed. The chat panel now ends at its fourth message. But the plate still has about 190 px of empty pale ground under the panel, at x 727–990, y 377–568 (`d-bayyinah-tv.png`).

Motion proof is valid:
- Spread mid-frames: `d-ground-incentiv-060ms` shows the circle crossing ground and bar together; `150ms` shows it near the end.
- Load pin: `d-load-pin-070ms`.
- Key jump: `d-key-right-030ms` (bayyinah.org is current and the hairline is whole).
- Reduced motion: the pairs above (0 px).

### Why the total did not move

Point 1 stays 8. On desktop, the first line a visitor reads is the mono scale "hue 0° … 360° / Sampled from the screen under it · Viva Fresh · 23°" (`d-top.png` y 25–49). A hiring manager cannot read that line. The phone has a plain sentence ("The colour of this page is sampled from the screen under it."). The desktop does not.

In the first 30 seconds, no card shows a problem solved. The only problem-solved fact ("16 → 2 queries") is in the record at the end (`d-record.png`). The first piece of work is a 2023 grocery cart, the weakest seniority signal on the page.

### Fix list (ordered by score gain; each fix is one pass)

1. **Point +1.** Put the phone's plain sentence on the desktop first screen, under the name line: "The colour of this page comes from the screen under it." Make the mono scale label secondary (smaller, lower contrast). Evidence: `d-top.png` y 25–49, against `m-top.png` y 224–252.
2. **Seniority, 0 to +1.** Make two cards show decisions with outcomes, not features. Incentiv "Build the UI layer of a smart-wallet dashboard" and bayyinah.org "Build the institute's site as one Next.js page → Live, with links to both app stores" are deliverables. Use facts that exist. Incentiv: "Keep private pages behind sign-in → Passkey or wallet sign-in, in English and French." Bayyinah TV: "Rebuild the video platform from an empty template → Live streams with moderated chat, in English and Arabic, right to left." The right-to-left fact is in caseNarratives line 35 and is not used anywhere on the page.
3. **Truth (0, removes a false label).** Bayyinah TV shows its measured hue, 34°, in the bar and in the card, and the ground uses 34°. Alternatively, the card shows no number. Never show a number labelled "sampled" that the screen did not give. Evidence: `d-bayyinah-tv.png` against `data.ts:99`.
4. **Harmony (0).** A plate ends with its content:
   - Bayyinah TV: put "Evening study circle · Session 12" under the chat column, or shorten the plate to the player height. This removes the 190 px empty area (`d-bayyinah-tv.png` y 377–568).
   - Incentiv: crop the plate to the wallet card and the sign-in card, with 24 px or less of white around them (`d-incentiv.png`: an empty white band of about 130 px at the top right and about 140 px at the bottom right).
5. **Pin (0).** Viva Fresh: change the result to "One checkout, in Albanian." Move "in both stores" into the mono caption, which already says "the same screen is on Google Play". Evidence: `d-top.png`.
6. **Copy (owner rule).** Use the rewrites in the table below.

### Copy: lines a hiring manager or founder would not understand

| Where | Line on the page | Plain rewrite (same fact) |
| --- | --- | --- |
| desktop bar | "hue 0° … 360°", "Sampled from the screen under it · Viva Fresh · 23°" | "The colour of this page comes from the screen under it." Keep "Viva Fresh" small. |
| every card meta | "hue 23°" / "hue 282°" … | Delete, or "Colour from this screen". |
| Viva Fresh | "Ship one React Native codebase to iPhone and Android." | "Ship one app to iPhone and Android from one shared codebase." |
| Bayyinah TV | "Rebuild the video platform on Nuxt 3." | "Rebuild the video-learning platform from an empty template." |
| Bayyinah TV | "Moderated live chat. 34 routes, 270+ components." | "Live streams with moderated chat. 34 pages, 270+ interface parts." |
| Incentiv | "Build the UI layer of a smart-wallet dashboard." | "Build the screens of a digital-wallet dashboard. Teammates built the wallet." |
| bayyinah.org | "Build the institute's site as one Next.js page." | "Build the institute's one-page website." |
| Design System | "Keep 805 tokens in three tiers in one source." | "Keep all 805 shared style values (colours, sizes, spacing) in one place." |
| Design System | "It generates CSS, TypeScript and a Figma bundle." | "The code and the Figma files are built from it." |
| record | "Move the care platform from Vue to React, one route at a time. / parity test per route" | "Move the care platform to a new framework one screen at a time. / each screen checked against the old app" |
| record | "Ship 36 components as one typed, versioned package." | "Ship 36 shared interface parts as one package. / 20 releases" |
| record | "16 → 2 queries" | "16 → 2 database calls, no more timeouts" |
| record | "Test tenant isolation in a time-off app." | "Prove that each company in a time-off app sees only its own data." |
| record | "Build the care platform's features on Vue (Nuxt 2)." | "Build the care platform's features, in four languages." |
| record | "Keep a children's reading app releasing from React Native 0.63 to 0.81." | "Keep a children's reading app releasing through many framework upgrades." |

Plain already: the claim, the name line, "Each sees only its own patients", "Passkey or wallet sign-in, in English and French", "Live in both stores", "972 → 337 KB", and the footer.

---

## projector (polish incl. the four ship fixes: 56 → 56) [self 57] — live at "/"

### Round-6 defects: closed or not

1. **Store plates centred on a coloured ground.** Half closed. The red and pink fields are gone, so the page now has one accent (`d-07.png`, `d-10.png`, `pairs/1-after-…`). But each screen still stands centred on white paper with about 208 px (Viva Fresh) and 157 px (Dukagjini) at each side. The round-6 rule says no strip of panel may be wider than 24 px. The fix met the letter of owner fix (a) but not the rule.
2. **Row 02 pin on a unit switch.** Closed. "Many organizations share one system. → Each sees only its own patients". The pin is on "Northwind Clinic", and the line runs along the card's rule (`d-02.png`, `pairs/2-after-…`).
3. **200 px of empty field under the tray.** Closed. The frame is 880 × 676 and the tray ends at y 817 (`d-top.png`, `pairs/3-after-…`).
4. **Row 09 link label.** Closed. Row 09 has no link (`d-10.png`, `pairs/4-after-d-09-no-link.png`).
5. **Mislabelled reduced frame.** Closed. `d-reduced-row02-shown-040ms.png` shows row 02. My pair `d-reduced-02-a/b` has 0 px of difference.

Motion proof is valid:
- `d-01to02-100ms`: cross-fade, chart drawing over the faded specimen.
- `d-load-line-090ms`: line half drawn.
- `d-key-down-row02-030ms`: focus ring on "Open the case", line whole.
- `d-tray-key-left-row07-030ms`: tray key.

### Why the total did not move

Harmony stays 8 because the store plates still break the "plate fills its slot" rule.

I also found a defect on the first screen that round 6 did not report. The row 01 result "36 components, 805 tokens, 20 releases in about six weeks" is pinned to the One source row (`d-top.png`). That row shows three file names. It does not show components or releases. The pin proves the line above the result, not the result. Seniority stays 8.

Original stays 7: it is a sticky frame beside a scrolling log.

### Fix list (ordered by score gain; each fix is one pass)

1. **Harmony +1.** Show each store screen at its source pixels and crop it to whole rows at frame height. The two source images are 780 × 1689 (`public/mobile/grocery-1.webp`, `bookstore-1.webp`). A 780 px wide crop in the 880 px frame leaves about 50 px of paper at each side, not 208 or 157 px. Measure `naturalWidth` and do not scale above 1.0. Also check the meta claim "0.78 of its source pixels": the visible screen in `d-07.png` is about 464 px wide, which is about 0.59 of 780.
2. **Seniority (0, removes a first-screen finding).** Make the row 01 result state what the ring proves: "→ 805 tokens reach CSS, TypeScript and Figma", as in sampled-frame. Move "36 components, 20 releases in about six weeks" into the row's line ("36 components and 20 releases in about six weeks, from one source of design values."). Evidence: `d-top.png`.
3. **Point (0, owner copy rule; holds the 9).** Make the first screen plain:
   - "One source of design tokens, in three tiers, for CSS, TypeScript and Figma." Rewrite as in the table below.
   - The row 02 role "VUE TO REACT, PARITY-TESTED" (`d-top.png` y 787). Rewrite as in the table below.
   This is the live home page, so these two lines are the first work text every visitor reads.
4. **Pin (0).** Row 06 "→ Stripe, Apple and Google subscriptions" is pinned to the Monthly/Annual switch (`d-06` in `C/pj-d1.png`). The switch proves plans, not three payment providers. Write "→ Monthly and annual plans" and move "paid by card, Apple or Google" into the line.
5. **Calm (0).** The specimen at 1.47× keeps two dead bands: under the Tokens header (y 180–240) and over the One source row (y 620–670) (`d-top.png`). Spread the three rows evenly, or add the fourth row.
6. **Phone (0).** At the footer, the pinned frame still covers the top 37% of the screen with row 10's plate (`m-end.png`). Unpin the frame after row 10, so the footer has the whole screen.
7. **1024 × 768 (0).** The row 01 result band is cut at the bottom of the first screen (`C/cap/pj-1024.png`). Make the identity line smaller at heights of 768 px or less.

### Copy: lines a hiring manager or founder would not understand

| Where | Line on the page | Plain rewrite (same fact) |
| --- | --- | --- |
| identity | "…from the design system to the API behind them." (borderline) | "…from the design system to the server code behind them." |
| row 01 | "One source of design tokens, in three tiers, for CSS, TypeScript and Figma." | "One source of 805 shared style values for the code and the Figma files." |
| row 01 | "36 components, 805 tokens, 20 releases in about six weeks" | "36 interface parts and 20 releases in about six weeks" |
| row 02 role | "Vue to React, parity-tested" | "Frontend rewrite, each screen checked against the old app" |
| row 03 plate | "One billing report, Laravel API" | "One billing report, server side" |
| row 03 | "One billing report ran 16 queries and timed out. → 2 queries, no timeout" | "One billing report made 16 database calls and timed out. → 2 calls, no more timeouts" |
| row 04 | "The institute's one-page site, built on Next.js." | "The institute's one-page website." |
| row 05 | "Sign people in to an on-chain wallet. Teammates built the wallet layer." | "Sign-in for a digital-wallet dashboard. Teammates built the wallet itself." |
| row 05 | "Passkey, MetaMask or WalletConnect, in English and French" | "Sign in with a passkey or an existing wallet, in English and French" |
| row 05 role | "Frontend, UI layer" | "Frontend, the screens" |
| row 06 | "Rebuild the video platform on Nuxt 3: 34 routes, 270+ components." | "Rebuild the video-learning platform from an empty template: 34 pages, 270+ interface parts." |
| row 07 | "…from one React Native codebase." | "…from one shared codebase." |
| row 08 | "A children's reading app around a PDF and EPUB reader." | "A children's reading app built around an e-book reader." |
| row 09 title | "Chatbot runtime library" | "Scripted chat quizzes" |
| row 09 | "One reusable React Native package, ported to the web" | "One shared module runs every quiz, on phones and on the web" |
| row 10 | "…for iPhone and Android, in React Native." | "…for iPhone and Android." |

Plain already: "Part of two platform rewrites. Based in Kosovo, working remotely.", rows 02 and 03 lines (after the role fix), "Progress on every book, about 14 releases to both stores", "Search, sales and checkout, live in both stores", all captions, and the footer.

---

## sampled-frame (new) [self 58]

### Spec check (round-6 N1): met or not, with frames

- **Projector's identity at 40 px, name first, "Part of two platform rewrites."** Met (`d-top.png`).
- **Palette by construction from one hue.** Met. Field, ink and wall change together (`d-top` 253, `d-02` 185, `d-03` 34…).
- **One hue number next to the caption.** Met: "Sampled from the screen: 253°" (`d-top.png` y 827).
- **The plate and its colour arrive in one circle from the frame centre.** Met:
  - `d-spread-01to02-020ms`: the circle shows the care card inside it and the specimen outside it; the wall turns green from the centre.
  - `d-spread-01to02-040ms`: the circle has reached the field.
  - `d-spread-07-to-record-060ms`: grey spreads into the record.
- **Every plate fills the 576 × 720 frame.** Met. Viva Fresh is a native-pixel crop (`d-07.png`). bayyinah.org fills the frame at 0.74× (`d-04` in `C/sf-d1.png`).
- **Every pin proves its result.** Met on six of seven rows:
  - One source row → "805 tokens reach CSS, TypeScript and Figma".
  - Switcher → "own patients".
  - Pinned message → "moderated live chat".
  - Passkey button, store badges, progress row.
  - Viva Fresh: the checkout button proves "Checkout in Albanian", but not "live in both stores".
- **Keyboard jump with no travel.** Met: `d-key-down-030ms` and `d-tray-key-down-to-03-030ms`.
- **Reduced motion: no circle, nothing plays.** Met: four pairs at 0 px.
- **Grey record with no hue.** Met (`d-record.png`).
- **Other widths.** At 1280 × 800 and 1024 × 768 (my captures) the line still reaches the ring.

Why it scores 8 and not 9 on the new frame: the colour hook works on the first scroll (blue to green at row 02), and sampled-ground cannot do this. But four of seven hues are warm (24, 34, 61, 78), so rows 03 → 04 and 06 → 07 change very little (`C/sf-d1.png`).

### Fix list (ordered by score gain; each fix is one pass)

1. **Harmony +1, and calm toward 9.** The first plate cuts its own labels: "action.prima…", "button.so…", "surface.rais…", "status.succe…", "alert.succe…", "field.focus…" (`d-top.png` x 1013–1276). The plate also holds two cards, Tokens and Alert, so it shows two ideas. Show only the Tokens card, with three or four rows and full labels, so it fills the 4:5 frame. This also fixes small text at laptop size: at 1280 × 800 the frame shrinks to about 413 × 516 and the specimen text reads at about 8 px (`C/cap/sf-1280.png`).
2. **Motion +1.**
   - Remove the old line and ring at t = 0 of the circle. At 20 ms the old One source ring still floats over the new care plate as an empty box (`d-spread-01to02-020ms.png` x 758–1100, y 360–393), and the old hairline still points at it.
   - The care chart draws for 1.1 s the first time row 02 is current (holdback; `d-key-down-030ms.png` shows the chart half drawn). Draw it in 300 ms or less, or mount it drawn.
3. **Hooks +1.** Order the rows so that neighbours are far apart on the colour wheel. Example: alternate warm and cool, with the grey record after the last warm row: DS 253 → Bayyinah TV 34 → care 185 → bayyinah.org 61 → Incentiv 282 → Viva Fresh 24 → Read to Feed 78. Today 34 → 61 and 78 → 24 change too little (`C/sf-d1.png`, `d-04` against `d-06`). If newest-first order is a rule, keep it and accept this hook at 8.
4. **Seniority (0).** "→ Moderated live chat, in 34 routes and 270+ components" reads as if the chat is spread across 34 routes. Write "→ Live streams with moderated chat, in English and Arabic" (the pin proves the chat). Move "34 routes, 270+ components" into the line.
5. **Harmony (0).** In the reduced-motion live room, the first message lies half under the pinned message (`d-reduced-03to04-040ms.png` y 715–725). This is text on text. Mount the reduced chat at 04 messages, as in normal mode.
6. **Harmony (0).** The care line enters along the frame's top edge, 12 px inside it (`d-02.png` y 72). Run it along the card's own header rule (y 166), as projector does.
7. **Calm (0).** At 1440 the 40 px identity takes five lines in the 520 px log column (`d-top.png` y 50–265). Widen the log column to 560 px, or set the identity at 36 px, so it takes four lines.
8. **Copy (owner rule).** Use the rewrites in the table below.

### Copy: lines a hiring manager or founder would not understand

| Where | Line on the page | Plain rewrite (same fact) |
| --- | --- | --- |
| identity | "…to the API behind them." (borderline) | "…to the server code behind them." |
| row 01 | "Generate every design token from one source, in three tiers." | "Keep every shared style value (colour, size, spacing) in one source." |
| row 01 | "805 tokens reach CSS, TypeScript and Figma" | "The same 805 style values reach the code and the Figma files" |
| row 02 role | "Frontend, multi-tenant" | "Frontend, many client organizations" |
| row 03 | "Rebuild the video platform on Nuxt 3, from an empty template." | "Rebuild the video-learning platform from an empty template." |
| row 03 | "Moderated live chat, in 34 routes and 270+ components" | "Live streams with moderated chat; 34 pages, 270+ interface parts" |
| row 04 | "Build the institute's site as one Next.js page." | "Build the institute's one-page website." |
| row 05 | "Build the sign-in of a smart-wallet dashboard. Teammates built the wallet layer." | "Build the sign-in of a digital-wallet dashboard. Teammates built the wallet itself." |
| row 06 | "…around a PDF and EPUB reader." | "…around an e-book reader." |
| row 07 | "Ship one React Native codebase to iPhone and Android." | "Ship one shared codebase to iPhone and Android." |
| caption | "Sampled from the screen: 253°" | "Page colour taken from this screen (253°)" |
| record | "Parity-tested on both apps" | "Each screen checked against the old app" |
| record | "Play scripted chat conversations from one React Native package. / 1 package" | "One shared module plays every scripted chat quiz, on phones and on the web." |
| record | "16 → 2 queries" | "16 → 2 database calls, no more timeouts" |
| record | "Test tenant isolation in a time-off app." | "Prove that each company in a time-off app sees only its own data." |
| record | "Keep a children's reading app releasing from React Native 0.63 to 0.81." | "Keep a children's reading app releasing through many framework upgrades." |

Plain already: "Many client organizations share one system.", "Each organization sees only its own patients", "Passkey or wallet sign-in, in English and French", "Progress is kept on every book", "Checkout in Albanian, live in both stores", all captions except the hue line, and the footer.

---

## Recommendation

- **Projector stays the live home page this week.** Its fix 1 (crop the store screens at 1.0) and fix 2 (row 01 result that its ring proves) are each one short pass. Apply fix 3 (plain first-screen copy) before anyone outside sees the page.
- **sampled-frame is the candidate to replace projector.** It keeps projector's first screen (point 9). It also adds the only colour hook that works on the first scroll, and every plate fills its frame. Its fixes 1–3 are finite. If they close with frame evidence, expect 59 to 60. That would be the first draft above 58 in the loop.
- **sampled-ground has had two polish passes with no gain.** Park it after one more pass only if fix 1 moves point 1. Its colour idea now lives in sampled-frame.
