# Loop 12: devil's advocate

Reviewer role: `.agents/skills/portfolio-page/reference/review.md` §Devil's advocate. I argue against each draft as a busy hiring manager (60 seconds, one case), a senior engineer (the follow-up interview question) and a recruiter (first read, often on a phone). I checked every fact against `CONTENT.md`, `PRODUCT.md` and `src/content/projects.ts`.

**Evidence.** All files are in `/tmp/claude-0/-home-user-portfolio/ececf2fc-6b8e-558c-a256-135b77151905/scratchpad/review12/devil/`:

- First screens and full pages at 1440×900 and 390×844 (`p12-*-1440.png`, `-390.png`, `-full.png`, cut into `slices/`).
- Live sessions in `live/`: the pro view transition, its dialog and the phone views; the crafted tilt (load, button, drag, phone tap and swipe); the bold wheel (pointer, keyboard, phone swipe); the blind bars, hover, dialog and phone order.
- Measurements: contrast (no failures in any draft), the gap from H1 to subline, the pro caption width, and the first 800 ms of each load.

**What I read.** The production build at :4173, plus every draft's `Draft.tsx` and content files. I did not open any `meta.json` self-score or `DIRECTION.md`. One grep for `touch-action` printed part of p12-bold's `meta.json` `skillNotes`, which describes its QR code check. No scores were in it, and nothing below depends on it.

---

## p12-pro (and /case)

**Why they close the tab.** The hiring manager gets all four answers in five seconds at both widths. That is this draft's whole strength, and also why nobody will remember it:

- **Generic layout.** A split hero with a big condensed claim, a three-row proof table and a screenshot is the default developer portfolio of 2025–26. The claim is the skill's own example sentence (see Patterns).
- **The lead screen undercuts itself.** The hero crops a care-team calendar "at actual size":
  - At 1440, the window cuts off "+ Add" and "All Patie…" at the screen edge, which reads as a layout bug.
  - At 390, it is a 390×320 slice of coloured appointment blocks, with no date header and nothing that says "calendar".
  - The caption explains the crop in pixels ("825 of 1440 pixels wide") instead of saying what Gentrit built. The calendar is not in CONTENT's list of built features.
- **Recruiter.** "Now: Care platform rebuild, 2023–26" reads as a job that has ended.
- **Senior engineer.** The case ends with "the old app and the new app both run until the move is done". The obvious question is how traffic is split in production. The honest answer is that the new React app is not in production yet.

1. **Fact. The "Now" row has the wrong dates.**
   - Where: Home.tsx hero `dl`, "Care platform rebuild, Vianova, 2023–26".
   - Problem: the React rebuild is 2026 (CONTENT §7b: React rewrite 2026; Vue app 2023–26). "Now" next to a closed range also reads as finished.
   - Fix: "Now · Care platform, moving from Vue to React · Vianova, since 2026".
2. **Fact. The migration is written as if it were live.**
   - Where:
     - The home row result, "Care teams keep using the app while each screen moves over."
     - The case lede, "care teams keep using it the whole time."
     - The case "The result" section, which repeats it.
     - The "For engineers" trade-off, "the old app and the new app both run until the move is done."
   - Problem: CONTENT §6b says the new React dashboard "is not in production yet", and the one cited test is on a route still "building". Interview question: "How many React screens do care teams use today?" Answer: none.
   - Fix: "The Vue app keeps running for care teams while the React app is built and tested screen by screen. The React app is not live yet." Lead "The result" with the server result, which is live (16 → 2), and present the September parity test as a milestone.
3. **Fact. Design System v2 is over-credited.**
   - Where: Home.tsx row 4.
   - Problem:
     - The result headline is "20 releases in about six weeks." under Gentrit's name, while the line beneath says "A teammate wrote most of the building blocks". The headline credits team output.
     - "Gentrit did the research into five leading design systems" overstates the proof. CONTENT §6b says only "Research … came first. Gentrit turned it into written guides", and the authorship proof is that Gentrit committed the research corpus.
   - Fix: use the case text verbatim. Headline: "Research turned into guides for AI agents". Keep "20 releases" as team context.
4. **Fact (owner rule). The AI line is changed in About.**
   - Where: About, "On the care platform rebuild, Gentrit wrote most of the rules…".
   - Problem: the owner asked for that exact line on every page.
   - Fix: put the context in its own sentence, then the line verbatim.
5. **Clarity. Nothing says what Gentrit built on the hero screen.**
   - Where: hero image (appointments calendar) and its caption.
   - Problem: the calendar is not in CONTENT's built list (patient profile, care plans, labs and vitals, claims, calls). "Which part of this did you build?" has no answer on the page.
   - Fix: lead with claims or glucose and vitals, which are listed. Caption what was built, for example "Claims for one month: built in Vue; moving to React."
6. **Clarity. "Shown at actual size: N of 1440 pixels wide" is page jargon.**
   - Where: six captions and the colophon.
   - Problem: it talks about the page, not the person, and a recruiter cannot read it.
   - Fix: delete the pixel clause. Keep the title and "Real product screens, invented data." Delete the colophon sentence.
7. **Clarity. The nav label "Case" is vague.**
   - Problem: case of what?
   - Fix: "Care case", or drop it, because the hero link already goes there.
8. **Clarity. Links leave the draft for a different design.**
   - Where: "Next case: Bayyinah TV" and the Bayyinah "Read the case" link both go to `/work/bayyinah-tv`, the live site's case in a different design.
   - Fix: label them as the main site, or end the case at "All work".
9. **Phone. The hero screen says nothing at 390, and the owner's caption is cut.**
   - Where: hero crop at 390 (app pixels 620–1010 × 328–648).
   - Problem: the crop shows blocks with no header. "Real product screens, invented data." starts at about 830 px, so the owner's required caption is cut by the fold.
   - Fix: a narrow crop that keeps the date header and filters, and the caption above the image on phones.
10. **Phone. The claims crop lands on the patient column.**
    - Where: claims crop at 390, on home and on the case.
    - Problem: the most legible words are "Desmond Achterberg LVH-10531" and "Fatima Al-Rashidi LVH-10642". The data is invented, but at a glance it reads as leaked patient records.
    - Fix: crop to the status cards and filters.
11. **Phone. The case captions overstate what is visible.**
    - Where: case captions at 390.
    - Problem: they say "407 of 1440 pixels wide" while 390 are visible. The claims and glucose windows run from −17 to 407 px, and `useVisibleWidth` in parts.tsx computes `innerWidth − left` without clamping `left` at 0. The draft's one technical promise is wrong by 17 px.
    - Fix: `min(right, innerWidth) − max(left, 0)`. This is moot if fix 6 lands.
12. **Phone. "See the whole screen" shows a quarter of it.**
    - Problem: the dialog is a 366 px window onto a 1440×900 image. You see the sidebar, and the rest needs sideways panning.
    - Fix: fit to width on phones and allow pinch-zoom.
13. **Craft. The signature transition does not register.**
    - Where: the 420 ms view transition from the hero window to the case window.
    - Problem: in my captures the case page is in place by 120 ms. "The window opens, the screen never zooms" reads as a cut, and it carries no fact.
    - Fix: either call it a fast navigation and stop counting it as the hook, or make it show something (for example, the window widening while a "Vue → React" label changes).
14. **Craft. The hero window bleeds off the right edge at 1440 and cuts real buttons.**
    - Fix: end the window at the gutter, or fade the cut edge.
15. **Craft. Coming back loses your place.**
    - Problem: "Gentrit Rashiti, all work" returns to the top of home (scrollY 0, not the row the visitor left at 1151). Browser Back lands at 690.
    - Fix: restore the scroll position to the source row.

## p12-crafted

**Why they close the tab.**

- **The biggest numbers are not Gentrit's.** The first screen is the most handsome of the four, but the hero is bayyinahtv.com's own marketing hero: a laptop, iMac, iPad and phone render, with "500k Learners worldwide", "+20y Teaching experience", "2000h Video content" and two customer testimonials.
  - A recruiter will credit "500k learners" to the developer.
  - The senior engineer asks "how did you scale to 500k?" The answer is "that's the client's marketing page".
- **The one real moment is hidden.** Drag or tap the card and it flips, lens by lens, from the website to the App Store. It is the only moment in this round a visitor would describe to a friend, but nothing says the image is interactive. The caption reads "One print, two real screens.", and the explanation ("a lenticular print… lenses 4 pixels wide") is in the footer.
- **No role on the phone.** The first screen never says the role or the years, and on a phone it does not say the location either: "Kosovo, working remotely" is `display:none` below 720 px.
- **Result.** The hiring manager leaves not knowing whether this is a frontend developer, a designer or a studio.

1. **Fact (borrowed proof). The hero's largest figures are the client's.**
   - Where: hero face A, `web-01` full frame.
   - Problem: Bayyinah's marketing stats and testimonials are the largest figures on the page.
   - Fix: crop face A above the stats band (source y < about 1330), or use `web-02`/`web-03` (the library), which is product UI rather than a device mockup.
2. **Fact. Design System v2 is over-credited.**
   - Where: All work index row, "36 building blocks, 20 releases in about six weeks. Wrote its research and agent guides."
   - Problem: CONTENT §6b says a teammate wrote most components and merged most pull requests. "Wrote its research", next to the role "Design system" and the component count, credits the system to Gentrit.
   - Fix: "Turned research into five design systems into guides for AI agents. Team system: 36 building blocks, 20 releases in about six weeks."
3. **Fact. The Bayyinah line reads as sole authorship, and wastes the available numbers.**
   - Where: "Gentrit built the frontend of the second version in the core team."
   - Problem: it reads as the only frontend author.
   - Fix: "Worked in the core frontend team that rebuilt it from an empty project: 34 routes, 270+ components." This also adds the size proof, which is unused in all four drafts.
4. **Fact. The Offday test claim is broader than the facts.**
   - Where: Offday, "About 200 tests check each flow".
   - Problem: CONTENT says about 200 tests, including security and tenant isolation. "Each flow" cannot be checked.
   - Fix: "About 200 tests, including checks that each team sees only its own data."
5. **Clarity. No role or seniority on the first screen.**
   - Problem: "Frontend and mobile developer, now full stack" and "since 2021" appear only in the footer About.
   - Fix: one line under the H1: "Frontend and mobile developer since 2021, now full stack. Kosovo, working remotely."
6. **Clarity. The interaction is never explained.**
   - Where: "One print, two real screens." and the "⇄" toggles.
   - Fix: caption "Drag or tap: the website, then the App Store app." Delete "lenticular" and "lenses 4 pixels wide" from the footer (jargon, and a number about effort).
7. **Clarity. The flip proves less than it seems.**
   - Problem: the second face is three App Store promo frames ("Quran Studies Made Simple, By Ustadh Nouman Ali Khan"), marketing art again. The flip shows that the same web app runs in the native app only to someone who already knows it.
   - Fix: use the store frame that shows app UI (`store-02`, the player and surah list).
8. **Clarity. Internal index links look like plain text.**
   - Where: Bayyinah TV, Care-management platform, Read to Feed and the other internal links in All work.
   - Problem: no underline and no arrow at rest. The underline appears only on hover, so on touch they never look like links.
   - Fix: underline at rest, or a "→".
9. **Phone. The location is hidden.**
   - Where: `.lx-where { display:none }` under 720 px.
   - Problem: the phone first screen has a name, the claim and a card, but no role, location or years.
   - Fix: as fix 5, visible at every width.
10. **Phone. The phone prints show store art, not app screens.**
    - Problem: the Read to Feed print shows "Explore a vast library of books for ages K-12" and the mascot, and Viva Fresh shows a phone mockup on red.
    - Fix: crop to the screen inside the frame, as p12-pro does with its box crops.
11. **Craft. Face B is never shown flat.**
    - Where: `FACE_B_DEG = 14`.
    - Problem: "One patient", "Cart", "Dark" and "App Store" are always seen at a 14° tilt. The glucose chart's small text is skewed and softened.
    - Fix: rest at about 8°, or open a flat view on click.
12. **Craft. The hero card loads as a black slab.**
    - Problem: the card shows near-black until the lens canvas paints (captured 300 ms after the route renders). On a slow phone the first screen is a black rectangle.
    - Fix: make the card ground transparent, and show the plain `<img>` until the canvas is ready.
13. **Craft. Lens seams sit on every screenshot at rest.**
    - Where: `SEAM` 0.06.
    - Problem: on the light care and Offday screens the stripes read as a scan or moiré artefact.
    - Fix: show seams only while the card tilts.
14. **Craft. Mixed spelling.**
    - Problem: "programme" next to "organizations".
    - Fix: pick one spelling throughout.

## p12-bold

**Why they close the tab.**

- **The thinnest project leads.** The first screen is a 2023 Albanian grocery app (jars of ajvar at 1.69 €), with no number, no result and no role beyond "Mobile", next to two QR codes.
- **The QR codes fail the delete test.** The recruiter at a desk will not pick up a phone to scan a code that opens an App Store listing. Remove the codes and the store buttons still open the same pages.
- **The flagship is announced as gone.** Turn the wheel to the four-year flagship and the big heading reads "REMOVED FROM BOTH STORES", with QR codes to web.archive.org.
- **The full-stack move is missing.** The role line is "Frontend and mobile developer since 2021". The care platform and the server work start below the fold.
- **The headline is broken.** The H1 sits on the line under it with no gap.
- **Result.** A hiring manager for a full-stack role reads "mobile developer who made a grocery app" and leaves.

1. **Fact. Design System v2 reads as Gentrit's own system.**
   - Where: More list, "Design System v2 — 36 building blocks for screens, shipped in 20 releases over about six weeks."
   - Problem: no role, no team and no case link. CONTENT §6b says a teammate wrote most components, so do not say Gentrit built it.
   - Fix: "Research and AI-agent guides for the team's design system (36 building blocks, 20 releases in about six weeks)", plus the case link.
2. **Fact. The care heading states the migration as live.**
   - Where: Work row heading, "Care teams keep using the app while each screen moves over."
   - Problem: the React app is not in production.
   - Fix: "The Vue app keeps running while a React version is built and tested screen by screen. The React app is not live yet."
3. **Fact (owner rule). The hero drops the full-stack move.**
   - Where: hero line.
   - Problem: CONTENT §0 sets the role line as "Frontend & Mobile Developer → Full Stack". The draft says only "Frontend and mobile developer since 2021".
   - Fix: "Frontend and mobile developer since 2021, full stack since 2026."
4. **Clarity. The flagship's heading is its removal.**
   - Where: apps.ts, Read to Feed `hook: "Removed from both stores"`, which becomes the column heading.
   - Fix: hook "About 14 releases, 2022–25", and put "listings archived" in the small label under the code.
5. **Clarity. The wheel starts on the weakest app.**
   - Where: the wheel's first entry is Viva Fresh, the weakest store project.
   - Fix: start on Read to Feed (about 14 releases, RN 0.63 → 0.81, four years) or Bayyinah TV, and order the wheel by strength.
6. **Clarity. The QR codes reveal a URL, not a fact.**
   - Problem: on desktop they ask for a second device to reach a page the button already opens. For Read to Feed they encode Wayback URLs.
   - Fix: replace the code column with one fact per app (releases, years, platforms, a number), or show a code only behind a "Scan to open" button.
7. **Clarity. The largest image on the page is store marketing art.**
   - Where: the stage frames.
   - Problem: mascots, slogans and device renders made by the clients' marketing, not by the developer.
   - Fix: crop to the screen inside the device.
8. **Clarity. The four apps appear twice.**
   - Problem: the "Apps in the stores" table repeats the wheel's four apps one scroll later.
   - Fix: drop the table, and give the space to the care case and Offday.
9. **Phone. Scroll trap on the first screen.**
   - Where: `.pb-wheel-view` has `touch-action: none` over about 374×176 px of the first screen.
   - Problem: a vertical swipe there changes the app instead of scrolling. Tested: swipe up moved Read to Feed to Viva Fresh, and scrollY stayed 0.
   - Fix: `touch-action: pan-y`, and a tap-only or sideways gesture on touch.
10. **Phone. The claims screenshot is unreadable.**
    - Problem: it is scaled to about 350 px wide.
    - Fix: a phone crop of the status cards.
11. **Craft. The H1 and subline collide.**
    - Problem: 0 px between the boxes. The descenders of "use." overlap the next line by 6 px at 1440 and 3 px at 390.
    - Fix: give `.pb-claim` a bottom margin of at least 0.3em.
12. **Craft. Black shows around the page on phones.**
    - Problem: the html and body background are left on the host's dark `rgb(16,17,18)`, and there is no `theme-color`. iOS overscroll and the browser bar show black around a cream page.
    - Fix: set the document background, as the other three drafts do.
13. **Craft. Two small spacing faults.**
    - Problem: the footer "CV" underline runs about 20 px past the word (padding added for the 44 px target), and the "MORE" heading sits on its table rule with no space.
    - Fix: put the underline on the text span, and add space under the heading.

## p12-blind

**Why they close the tab.** Blind is the most complete record of the four (every project, years, roles, a clean index) and the most work to read.

- **A side project leads.** The first work a hiring manager sees is Offday, a personal time-off app. On a phone, the first 2.7 screens after the hero are three Offday entries before any employer work. The first "server" proof is that side project's Next.js and SQLite backend, not the Laravel API at Vianova.
- **The hero line caps the experience.** "Phone apps since 2021. Web apps since 2023. The servers since 2026." A recruiter's filter reads three years of web and under one year of backend, for a candidate selling frontend. CONTENT says "5+ years".
- **Empty lanes and a very long page.** The lanes leave large empty columns: server is empty 2021–25, web is empty 2021–22. The page runs 11,546 px on desktop and 17,809 px (21 screens) on a phone.
- **The idea is not new.** "The scroll is time" is the existing `year-stack` rule, which the brief says not to repeat.
- **The headline is broken.** The H1 sits on its subline with no gap.

1. **Fact. "Web apps since 2023" is not an owner fact.**
   - Problem: it is derived, it caps frontend experience at three years, and it conflicts with "5+ years" in CONTENT §0. An interviewer comparing it with the CV will ask.
   - Fix: use the owner's line, "5+ years. Part of two platform rewrites.", and drop the per-lane start years unless the owner confirms them.
2. **Fact. The Offday sign-in is described wrongly.**
   - Where: Offday server, "Sign-in by email".
   - Problem: CONTENT says "emailed sign-in details", which means sign-in details are sent by email. "Sign-in by email" suggests a magic link.
   - Fix: "Sign-in details sent by email".
3. **Fact. The Bayyinah TV app inflates the phone lane.**
   - Problem: "Bayyinah TV app" sits in the Phone lane, but it is the web app inside the native shell, as the entry itself says.
   - Fix: put it in the web lane with "also inside the iPhone and Android apps".
4. **Fact. "805 colour, size and type rules" mislabels tokens.**
   - Problem: tokens also cover spacing, radius and more, and "rules" is the wrong word.
   - Fix: "805 named design values in three tiers".
5. **Fact (softer). The care line implies screens have already moved.**
   - Where: care kind line, "rebuilt one screen at a time".
   - Fix: add "The React app is not live yet." (same issue as p12-pro and p12-bold).
6. **Clarity. Offday leads the record.**
   - Where: the 2026 row.
   - Fix: order 2026 as care platform and care server first, then Design System v2, then Bayyinah TV, then Offday.
7. **Clarity. The hero links have no subject.**
   - Where: "bayyinahtv.com · App Store · Google Play · github.com/gentritr1 · CV".
   - Problem: App Store and Google Play of which app?
   - Fix: "Bayyinah TV: web · App Store · Google Play".
8. **Clarity. The Sadaqah entry is passive and reads as evasive.**
   - Where: "Work on the team covered the payment…".
   - Fix: "Built the payment and subscription screens, the badges, in-app web views and the Android builds, in a small team." CONTENT allows this.
9. **Clarity. Entry links look like labels.**
   - Where: "Read the case", "App Store", "bayyinah.org" and the other entry links.
   - Problem: they are mono text with no underline at rest (`.tl-plain` background-size 0%). On touch they never show one.
   - Fix: underline at rest.
10. **Clarity. Some index lines are unreadable for a recruiter.**
    - Where: "arm64 simulator support, legacy architecture, shadow fixes", "Farnsworth timing", "dev, staging and release builds".
    - Fix: plain lines, for example "Kept a loyalty app building on new Macs".
11. **Phone. The page is 21 screens long.**
    - Problem: the care platform starts at 2,294 px, the index at 11,668 px and About at 16,940 px.
    - Fix: cap the record at six entries, and put the index behind "All projects".
12. **Phone. A lane note floats loose.**
    - Problem: the lanes collapse on a phone, so "The server lane starts in 2026." appears as a stray heading inside 2025.
    - Fix: hide line notes on phones.
13. **Craft. The H1 and subline collide.**
    - Problem: 0 px between the boxes, with a 6 px descender overlap at 1440 and 4 px at 390.
    - Fix: add a bottom margin.
14. **Craft. Much of the desktop record is empty.**
    - Problem: cells fill 59% of the record grid. From 2023 down, the desktop scroll is mostly empty columns.
    - Fix: collapse empty lanes per year, or use one column with lane tags, as on the phone.
15. **Craft. The signature motion is barely visible.**
    - Problem: the year bars are 4 px lines that draw down once, and hover lights a 4 px bar.
    - Fix: drop it, or make the "Today" line and the lane starts the moment.
16. **Original. The direction repeats an existing rule.**
    - Problem: "the scroll is time, in lanes" is `year-stack` from EXISTING.md, plus columns.
    - Fix: the rule needs a decision `year-stack` did not make. The three-lane career split is the candidate, if its dates are confirmed.

---

## Rankings

**Ship this week**

1. **p12-pro.** All four answers in five seconds at both widths, plus a written case. Its defects are copy (the "Now" row, Design System credit, migration state, captions) and three crops.
2. **p12-crafted.** A strong first screen and a real moment. It needs a hero re-crop (the borrowed 500k), a role line and a caption that says "drag or tap".
3. **p12-blind.** The most careful on facts (Design System text used verbatim) and the most complete. It must be re-ordered, shortened on phones and de-collided before anyone reads past Offday.
4. **p12-bold.** The lead, the "Removed from both stores" heading, the QR column and the phone scroll trap are the core of the draft, not polish.

**Remembered a week later**

1. **p12-crafted.** "The screenshots are cards you tilt from the website to the App Store." Physical, specific, and it carries a fact: the same web app runs in the store app.
2. **p12-bold.** The giant red app wheel and the QR codes stick, but the memory is "the grocery-app developer with QR codes", which hurts.
3. **p12-blind.** "Phone since 2021, web since 2023, server since 2026" is a sentence a visitor would repeat, but the timeline look is a CV pattern.
4. **p12-pro.** The cleanest and the least memorable. "Actual size" is invisible unless someone explains it.

## The three most serious defects

1. **The care migration is written as live** in p12-pro (home result, case lede, case result, and "both run until the move is done") and in p12-bold (row heading). p12-blind repeats it more softly. CONTENT says the React dashboard is not in production, so the first interview question ("How many React screens do care teams use today?") exposes it. The wording comes from the skill's own example (see Patterns, item 2).
2. **Design System v2 is over-credited** in p12-pro ("20 releases" as the headline, "Gentrit did the research"), p12-crafted ("Wrote its research") and p12-bold (no role at all). The owner rule says a teammate wrote most of it, so do not say Gentrit built the system.
3. **p12-crafted's hero shows Bayyinah's marketing numbers** (500k learners, +20y, 2000h) and testimonials as the largest figures on the first screen, beside the owner's name. That is borrowed proof that a screenshot of the page will spread.

## Patterns across all four (sameness the skill is causing)

1. **One H1 for four drafts.** `reference/first-screen.md` line 38 gives "Gentrit Rashiti builds the web and phone apps that care teams, readers and shoppers use." as a *Good* example, and line 36 gives the audience list. All four drafts set that sentence with the order shuffled.
   - Fix: remove owner-specific examples from the skill. Give the pattern, not the sentence, and have each draft build its claim from a different fact (the 14 releases, the two rewrites, the full-stack move).
2. **The same care copy, and the overstatement comes from the skill.** `reference/writing.md` lines 79 and 81 ("2 database requests, not 16."; "Care teams keep using the app while each screen moves over…") and line 110 appear in all four drafts, verbatim in p12-pro and p12-bold.
   - Fix: correct the example, and add a rule: "a work-in-progress line says what is not live yet."
3. **One skeleton.** Every draft runs hero → 3–5 rows of text and screen → one-line index (name · years · role · line, years in mono) → About → email. This follows `work-display.md` "3–5 featured projects … then one index". The `directions.md` divergence rule does not reach section order.
4. **One kit.** All four use tinted paper and near-black ink (`visual.md` calls it "the default for most portfolios"): three warm, one cool, light only. Three set the claim in a tall condensed display face. All four put meta in a small mono line ("Frontend, core team · 2023–26"). Each has one accent.
5. **One shot list.**
   - Read to Feed "My Books" (`reading-1`) and Viva Fresh appear in all four drafts.
   - Dukagjini `bookstore-1` appears in three.
   - A care calendar or claims screen appears in all four.
   - The date-range picker and the Offday calendar each appear in two.
   - Three drafts show store marketing art (mascots, slogans, device renders) as if it were product UI. The skill should tell builders to crop store frames to the in-device screen.
6. **One quota-sized motion moment.** Each draft has exactly one small animation: the pro view transition, the crafted settle, the bold QR write-on, the blind bar draw. In three of four it is easy to miss. The `motion.md` "one story moment" rule produces a quota, not a hook.
7. **Seniority is under-stated in all four.**
   - None says "5+ years" or "Part of two platform rewrites" (the CONTENT §0 secondary line).
   - Two of four drop "full stack" from the first screen.
   - None uses the Bayyinah size facts (34 routes, 270+ components).
   - The "no internal counts" rule seems to make builders avoid allowed numbers too. The skill should list which numbers are allowed.
8. **The same placement.** The AI line sits directly after 16 → 2 in the care row, and "Real product screens, invented data." is a small mono caption, in all four. Both are required, but the identical placement adds to the sameness.
9. **The same type fault.** Two drafts have a 0 px gap between the claim and its subline with condensed faces.
   - Fix: add a checker rule that the H1 box must end at least 0.25em above the next box.
10. **Harness, not drafts.** Every load shows about 300 ms of the host's dark shell (`rgb(16,17,18)`) before the light page. The checker's 150 ms and 400 ms frames capture this loader, not the draft.
