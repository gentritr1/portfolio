# Round 10 devil's advocate: the divergence round

Date: 2026-10-06. Drafts: live-objects, kosovo-time, four-languages, the-seam, departures, crossword.
Method: each page was driven in headless Chrome (SwiftShader WebGL, Node 24, `seq.mjs`, PORT 9712) at 1440 × 900 and 375 × 812. A DOM probe measured the page height, the y position of each project name, every `<img>`, targets under 44 px and horizontal overflow. Frames are in `scratchpad/devil10/out/<id>/`. Facts were checked against CONTENT.md, `src/content/projects.ts` and `src/content/caseNarratives.ts`. When I could not show a problem, I do not report it.

Caveat. SwiftShader is slower than a real GPU. I do not use it to judge frame rate. Where a timing comes from it, I say so.

---

## 0. The numbers first: where is the client work?

| Draft | Page height 1440 / 375 | First client product (1440) | First client product (375) | Real client screens on the page (`<img>`) | Hero picture |
| --- | --- | --- | --- | --- | --- |
| live-objects | 2,859 / 5,124 | Care recreation y = 1,062. First public product (Bayyinah TV) y = 1,686 | Care y = 1,747. Bayyinah y = 2,731 | **0.** There is no `<img>` on the page. | Two made-up brands (FORM, OFFBEAT) |
| kosovo-time | 5,814 / 9,367 | Results line y ≈ 833 ("16 times. Now it asks 2"). Care plate y = 1,083 | Care y = 1,243 | 6. Each is 320 px wide on desktop. The phone frames are 92 px wide (78 px on a phone). | Offday, an own project |
| four-languages | 4,335 / 5,859 | **Bayyinah TV screen at y = 304, 671 px wide, in the first screen** | Bayyinah screen y = 642 | 3 (Bayyinah web, Bayyinah store, Viva Fresh store) | A public client screen |
| the-seam | 6,456 / 6,638 | Bayyinah row (text) y = 747 | y = 601 (text) | **0** client screens. The images are OFFBEAT, FORM and Offday. | A slogan |
| departures | 2,549 / 3,680 | "CARE PLATFORM" in the discs at about 3 s | The same, on the phone board | **0** in the page. The screens open only from a row. | The disc board |
| crossword | 3,652 / 6,224 | **Seven client results in the clue column, y = 299 to 760, in the first screen** | Bayyinah y = 869 | 0 at load. Store frames open in the side panel after "Open". | The grid |

Only one draft (four-languages) puts a real client screen in the first screen. Only one other draft (crossword) puts more than one client result in the first screen. In four drafts, the hiring manager meets a made-up brand, an own project or a slogan before a shipped client product.

A brief rule is broken in five of six drafts. DIAGNOSIS §4.2 bans "a hairline" in round 10. live-objects, four-languages, the-seam, departures and crossword all separate their rows with 1 px rules. kosovo-time is the only draft without them. A reviewer can read this as the loop's list returning under new skins.

---

## 1. LIVE OBJECTS (`/drafts/live-objects`)

**The three visitors**

- **Hiring manager, 10 s.** They read "Gentrit Rashiti builds web and mobile apps. Everything on this page runs." Then they see a copper knot and a drum grid. Both captions say "CONCEPT" and "A made-up speaker brand" or "A made-up sculpture show". They now know that he makes art toys. They do not know which apps he built. Nothing in the first 900 px names a client. They leave with "a creative coder".
- **Founder hiring a senior frontend or mobile engineer.** They scroll to find shipped products. At y = 1,686 they find a text list: six rows with a year, a name, one line and a role. There is no picture of any app. The page title says that everything runs, but the client work is the only part that does not. The founder thinks: "His best demo is his hobby, and his job is a footnote."
- **Design-engineer peer.** A trefoil knot with a metal material is the default demo geometry of every WebGL tutorial (`TorusKnotGeometry` in three.js). An 8-step drum grid is the most common Web Audio demo. Both are well made: the drag has inertia, and the accent cross-fades through a registered `@property`. But they cannot name the original idea. Each half exists on CodePen. They leave with "nice port, but generic".

**Gimmick or skill?** It is half each. The material swap that changes the page accent is a real decision ("pick chrome and the accent of the whole page changes"). But it proves WebGL and Web Audio. Those are not the skills on the CV (React, React Native, rewrites, design systems). The skill it proves is not the skill on sale.

**Unclear or too clever.** "Everything on this page runs" is a promise. The client list breaks it. Porcelain turns the accent into bone, so "Everything on this page runs." loses its second colour and the identity line becomes one flat block (frame `misc/porcelain.png`).

**Failure on a real machine.** With no WebGL, the flat SVG knot shows a false gap at the right crossing (frame `misc/lo-nogl.png`, x ≈ 590, y ≈ 540). The builder's holdback admits this. The swatches are `<input type=radio>` at 104 × 42, 108 × 42 and 116 × 42 px. That is 2 px under the 44 px gate.

**Claims to doubt.** "Everything on this page runs." This is false for 11 of the 13 project rows. The care block says "Most screens are already rebuilt in React; a screen moves over only after it passes the same tests in both apps." The semicolon breaks copy rule 4 (no semicolons on the home page). The care recreation uses mono on four lines ("Care manager", "14 days", "Last sync 2 min ago", "Timezone: patient local (UTC-5)"). This is the banned "mono for the small print on more than one line".

**Seniority.** The only seniority signal above the fold is the sub-line "5+ years. Part of two platform rewrites." It is 17 px grey. The holdback says so.

**The single change.** Make the third live object a client one. Move the care recreation (it really runs) into the first screen in place of the drum grid. Give each client row one real screen.

**Radical alternative.** Apply "everything runs" to the client work, not to the hobbies. Each client row opens a small live recreation: the Bayyinah paywall toggle, a Viva Fresh cart and the care clinic switch. Then FORM becomes the page's colour picker, a footnote.

---

## 2. KOSOVO TIME (`/drafts/kosovo-time`)

**The three visitors**

- **Hiring manager, 10 s.** I loaded the page at 01:46 Kosovo time. They see a near-black page with an amber accent, a clock that says "The sun is 48° below the horizon", and an Offday screen. That is the "dark plus one accent" look that the round-1 rules call a slop marker. The idea (sunlight) is not visible at night. They read "from Kosovo" and "Part of two platform rewrites" twice (sub-line y ≈ 268, results line y ≈ 833).
- **Founder.** The hero is Offday, "Own project, 2026". The brief asked for "one large public screen (Bayyinah TV or Viva Fresh)". The client plates are 320 px wide on desktop, so you cannot read a word in them. The phone frames are 92 px wide. On a phone, the care plate is cut at the right edge in the middle of a word ("Northwi", "Systol"; frame `kosovo-time/m375-812.png`). Display rule 8 says never to cut a line of text.
- **Peer.** The computed shadow is honest work (a fragment shader that tests the screen rectangle against a ray to the sun). But the plate is drawn flat and front-on. So the shadow reads as a flat grey or violet wedge from the plate's corner, not as depth. At noon, the wedge runs under "Three apps shipped" and "One report asked the database" (frame `kt2/noon.png`). At dusk, a violet band crosses "Part of two platform rewrites" (frame `kt2/dusk.png`).

**The time-zone problem: this concept is invisible to most of its buyers.** Kosovo is UTC+2 in October, and sunset is at 18:10. A recruiter in San Francisco works from 09:00 to 17:00 Pacific, which is 18:00 to 02:00 in Kosovo. So that recruiter sees dusk or night on every visit this season. A New York recruiter sees at most three daylight hours. The hook "lit by the sun in Kosovo right now" is true, but for the main market it is a dark page. Only the scrub buttons show the idea, and on a phone they are below the fold (y ≈ 1,070).

**Gimmick or skill?** The shadow is real maths, but it proves nothing that a founder buys. The claim "Based in Kosovo, working remotely" was already true in text.

**Failure on a real machine.** Once in software rendering, the screenshot call did not return after a jump to Noon. A retry with a 6 s wait passed. This is a weak signal, not proof. A recruiter on a VDI or a VM with software GL is the case to test.

**Claims to doubt.** "Three apps shipped to both app stores." This number is not in CONTENT.md. It counts Read to Feed, Viva Fresh and Dukagjini. But Bayyinah TV is also in both stores (projects.ts lines 130–131). A reader who counts the rows below finds four.

**The single change.** Lead with a public client screen, as the brief said, and stop the floor shadow above the result lines.

**Radical alternative.** Make the sun useful to a remote hire. Show the visitor's working day and his working day on one arc: "Your 09:00 is his 18:00. Overlap: 3 hours." Then the place becomes the answer to the first question a founder asks about a remote engineer.

---

## 3. FOUR LANGUAGES, actually three (`/drafts/four-languages`)

**The three visitors**

- **Hiring manager, 10 s.** They read the name at 64 px, the same fact in Albanian and Arabic, and they see a real product screen. This is the only first screen in the round that passes the 5-second test with a shipped product. But the readable words in the lead picture are "Learn to Read Quran", "Study Quranic Arabic Step by Step" and "Dream: Our Flagship Arabic Program". With the ultramarine and gold palette and the Amiri face, a hurried reader can take the page for a niche religious-education studio, not a general product engineer.
- **Founder.** The rows are the best-written in the round. Each row has a result in large type, the languages it shipped in, the role and the years, and live links ("App Store ↗", "Google Play ↗"). Seniority is still one grey sub-line. The holdback says so.
- **Peer.** `dir=rtl` with logical properties and a View Transition is correct, modern work. But a language switch is a common feature on many sites. The idea fires only if the visitor presses العربية. If they do not, the page is a calm serif page on a coloured ground, close to an editorial template. In my run, the frame at 120 ms after the click is the same as the final frame. I cannot prove the 320 ms mirror headless, and the builder says that the hidden pane skipped it too. The hook is unproven by any reviewer so far.

**Gimmick or skill?** It is a real skill. RTL shipped on Bayyinah TV (CONTENT §3: "English and Arabic, right-to-left layout"). This is the only concept where the mechanism is the shipped skill.

**What hides the proof.** The brief's proof was "the Bayyinah TV Arabic page next to its English page, the same route, the two screens mirrored". It is not there. The caption under the hero says "These captures show the English one." So the page claims RTL and shows an English screen.

**Claims to doubt.** "Gentrit Rashiti builds web and mobile apps in the user's own language." This makes localisation his identity. CONTENT supports languages as a feature of three products, not as his trade. Every Albanian and Arabic string is listed in `meta.translationsToCheck`, so no native reader has checked them yet. An Arabic-reading founder (the Bayyinah audience) will judge the Arabic first. The route is `four-languages`, but the title is "THREE LANGUAGES, ONE PAGE".

**Rule clash.** The right hero image is an App Store marketing frame with a tilted iPhone (`bayyinah/store-04.webp`). The Viva Fresh frame is an iPhone mockup on red. Display rule 10 says "No device mockups … no tilted phone".

**Craft.** CLS is 0. There are no targets under 44 px and no overflow at 1440 or 375 (probe). This is the cleanest build in the round. In Arabic, the Latin name moves to the top-right corner, and the hero shows only the Arabic transliteration. A non-Arabic reader who lands on `?lang=ar` from a shared link does not see "Gentrit Rashiti" in the hero.

**The single change.** Capture the public Arabic Bayyinah TV page and set it beside the English one in the hero. Until that capture exists, change the identity line to a claim the picture proves.

**Radical alternative.** Put the switch on the product, not on the chrome. The live care recreation re-sets in English, Deutsch, Español and Türkçe (its four real languages, caseNarratives line 23), and Bayyinah flips to Arabic. The portfolio stays in English.

---

## 4. THE SEAM (`/drafts/the-seam`)

**The three visitors**

- **Hiring manager, 10 s.** The first word next to "BAYYINAH TV" on the right side is "Not checked" (y = 754). Every client row starts "Not checked". The counter reads "θθ/1θ" because the Hubot subset draws a slashed zero that looks like a theta, and "20 times" reads "2θ times" (frame `the-seam/d1440-900.png`). They leave thinking his projects failed a check.
- **Founder.** They drag the cord to the right. The "2021 site" is a 490 px column on the left. From x = 538 to x = 1,262 the page is blank white (frame `seam2/drag-end.png`). Then they press "Break one row". The page puts a red **FAIL** badge on "Care management platform — Most screens are already rebuilt in React" (frame `seam2/break.png`). His flagship product is the one marked as broken.
- **Peer.** It is a before/after comparison slider with spring physics. That is a known component pattern. The rope bow is nice, but the slider is the idea.

**The check is false-green by construction.** "10/10 rows the same in both skins" compares the same strings, rendered twice, with themselves. It can fail only when the visitor presses the button that makes it fail. In the owner's own review language, this is a tautological test: it asserts what it programs. A design engineer who reads "parity" in the case page will notice this.

**Brief gaps.** The brief said: "Put the care recreation behind the seam as the one live exhibit, legacy skin at the left, React skin at the right, the same component mounted twice." `the-seam/Draft.tsx` has no recreation. The seam passes over text only. The "2021 site" is invented. It is not his 2021 work or a real legacy screen, but the line "Left of it, this page as a 2021 site would draw it" lets a reader think it is.

**Phone.** At 375, the drag is replaced by a "2021 / Today" toggle. The hook sentence ("you drag a green cord … it bends like a real rope") does not exist on a phone.

**Targets.** In the 2021 skin, the links are 17 to 23 px high (16 elements under 44 px). They are hidden from assistive technology and are not in the tab order, so this is not an accessibility fail. But they take mouse clicks.

**The single change.** Remove "Not checked" and FAIL from client rows. If a mismatch demo stays, run it on a made-up row, never on his own product.

**Radical alternative.** Use real history. Wayback has public captures of bayyinahtv.com before the Nuxt 3 rebuild. Put the real v1 page behind the seam and the real v2 page in front, at the same route. Then the drag shows a migration he did, not a CSS reskin.

---

## 5. DEPARTURES (`/drafts/departures`)

**The three visitors**

- **Hiring manager, 10 s.** The name and identity sentence are a 15 px grey line in the nav. The board takes 1,392 × 522 px. At about 3 s the board says "01 CARE PLATFORM · CARE TEAMS · VITALS · 4 LANGUAGES · NEXT 02 BAYYINAH TV" (frame `dep2/t3000.png`). That is a strong, readable first screen. At about 9 s, line 02 shows "the public home page" of Bayyinah as a Bayer-dithered field of yellow dots, and no word in it can be read (frame `dep2/t9000.png`). The "5+ years. Part of two platform rewrites." strip is shown only during the boot. After that, the line captions replace it. A visitor who arrives after 3 s does not see a seniority line at all.
- **Founder.** The board rotates every 6 s. Line 03 is OFFBEAT and line 04 is FORM, which are both made-up brands. Read to Feed is line 05, Viva Fresh is 06, and Dukagjini Bookstore is line 09 (about 50 s in). The timetable has the same order (frame `departures/d1440-900.png`). Concepts outrank three shipped store apps. "Every line is a product. Open one to see its real screen." To see any real screen, they must open a row.
- **Peer.** This is the draft a peer will share. The renderer is real (instanced discs, one draw call), the sound is opt-in, and the Morse key is his own app. They will say: "It's a bus-stop flip board, it clicks, and you can key Morse into it." This is the only hook sentence in the round that I could write without the builder's help.

**Gimmick or skill?** It proves WebGL craft, timing and audio. Like live-objects, the proven skill is not the skill the CV sells. The dithered screenshots hide the actual work. "No upscaled screenshots" is kept, but a 128 × 56 quantised screen is worse than an upscaled one for a recruiter.

**Failure on a real machine.**
- Space is taken. At load, with the board fully visible and nothing focused, I pressed Space. `scrollY` stayed 0 (run `misc`). Keyboard users press Space to page down. On this page their first Space writes Morse.
- Sound on iPhone. Web Audio follows the iOS ring/silent switch unless the page sets `navigator.audioSession.type = "playback"`. No draft sets it (grep: 0 hits). On an iPhone in silent mode, "Sound on" can play nothing.
- The board loops forever. Display rule 14 says "Nothing loops." The board stops when it is off-screen (board.ts uses IntersectionObserver), which is good, but it never rests while someone reads the caption beside it.

**The single change.** When a line shows a client product, show the real screen at native pixels beside the board, or show its result in discs, not its screenshot. Move OFFBEAT and FORM after the shipped apps.

**Radical alternative.** Remove the pictures from the board. The destinations are results: "16 → 2", "34 PAGES", "14 UPDATES", "2 STORES". The board says what changed, and the timetable carries the screens.

---

## 6. FJALËKRYQ (`/drafts/crossword`)

**The three visitors**

- **Hiring manager, 10 s.** The clue column on the right (x ≥ 940) is the best recruiter path in the round. It has seven plain results with the product names in caps, at a readable size, all above y = 760 at 1440. "Members subscribe on the web, iPhone or Android. — BAYYINAH TV — Open →". They can stop reading after 10 s and know what he shipped.
- **Founder.** They press "Open" and get the case in the side panel with store frames (frame `final/hook-5-case.png`). Seniority is still one grey line. There is no case narrative on the first screen. The holdback says so.
- **Peer.** They see that the answers are printed beside the clues. A crossword whose answers are printed is not a puzzle. It is a search box with falling letters. They will also see that the grid is English product names (CAREPLATFORM, READTOFEED, INCENTIV). Only the title and one lone Ë square are Albanian. The hook "His portfolio is an Albanian crossword" overstates this.

**Gimmick or skill?** The letter physics is his own (verlet, 3 kB). The puzzle as navigation is clever. But the input asks for knowledge that the visitor does not have: "Type a project name. Its letters fall into place." A visitor does not know his project names until they read the clue list, and then the typing adds nothing.

**Unclear.** 20 of 30 answers are blank white cells. That is most of the board's area, and it reads as unfinished. The header says "10 of 30 filled", but the column says "seven answers, filled in". These are two counts for one grid.

**Failure on a real machine (phone).** At 375, the board viewport is 375 × 422 px at y = 268 (52 % of the first screen). It has `touch-action: none` and pans on pointer drag (`crossword.css` line 46, `Draft.tsx` line 546). A thumb that swipes up on the board moves the board, not the page. This is a scroll trap on more than half of the first phone screen. The board is also cropped on both sides ("VIVAF", "READTO") and at the top (row 1, CAREPLATFORM, is not visible) in frame `crossword/m375-0.png`. The probe shows `.fk-board` 610 px wide inside a 375 px viewport (it is clipped, so there is no page scroll).

**Claims.** I found no fact that conflicts with CONTENT. "Shopping in Albanian, live in both app stores." is supported (Viva Fresh store links, Albanian interface in the store frames).

**The single change.** On a phone, put the clue list first and the board second. Give the board `touch-action: pan-y` and pan it only with two fingers or from buttons.

**Radical alternative.** Remove the 20 blank answers. A calm, complete grid of the ten real answers is the site map, with no "Solve it". The falling letters play when a clue is opened, not when a name is typed.

---

## 7. Ranking

| Rank | Draft | Why |
| --- | --- | --- |
| 1 | **crossword** | Seven client results with names in the first screen at 1440. A palette (mustard, ink, one blue) that a designer would screenshot. A hook that is his own code. The phone trap and the "not really a puzzle" point can be fixed. The concept survives the fixes. |
| 2 | **four-languages** | The only first screen with a real client screen. The mechanism is the shipped skill. It is the cleanest build (0 small targets, 0 overflow, CLS 0). Its weakness is that the hero proof is an English screen and the identity line overclaims. |
| 3 | departures | It is the most original page and has the strongest hook. But it hides the work: the client screens become dot noise, concepts come before shipped apps, Space is taken, and the seniority line disappears after the boot. It is better as the lab page or the 404 than as the home page. |
| 4 | kosovo-time | It has honest maths. But its buyers see it at night, the hero is an own project, the shadows run under the results, and the phone plate is cut mid-word. |
| 5 | live-objects | The first screen is two made-up brands and the most common WebGL demo geometry. The page has 0 client images, and the line "Everything on this page runs" is false for the client list. |
| 6 | the-seam | "Not checked" on every client row, a red FAIL on his flagship, "θθ/1θ" digits, a 720 px white void in the 2021 skin, no drag on a phone, a self-confirming check, and the care exhibit from the brief is missing. |

## 8. The two candidates to replace projector, and what each fixes first

**crossword. Fix first, in this order:**
1. Phone. Put the clue list above the board, and change `touch-action: none` to `pan-y` on `.fk-board-viewport`. Show the whole grid at 375, or show only the ten filled answers.
2. Use one count. "10 of 30 filled" and "seven answers" must agree. Better: remove the 20 blank answers.
3. Add one seniority line inside the clue column, at the result size, from the true signals (two platform rewrites, 34 pages rebuilt from an empty page, about 14 store updates).
4. Use 1 px clue separators or none, but decide this against the round-10 ban.

**four-languages. Fix first, in this order:**
1. The proof. Capture the public Arabic Bayyinah TV page and show it beside the English one in the hero. Without it, the hero argues against itself ("These captures show the English one").
2. The claim. Replace "in the user's own language" with a line the picture proves, for example "…builds web and mobile apps. One of them reads right to left."
3. The check. A native reader checks every Arabic string, and the owner checks every Albanian one, before the page is public.
4. The mockups. Replace the tilted-phone store frame in the hero with a flat phone screen (display rule 10).

Projector stays home until one of these two passes the same live review. The hook of each one (falling letters, the RTL mirror) must be scrubbed live at 10 %, because no reviewer has seen either one move in a visible browser yet.
