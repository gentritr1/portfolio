# Fresh review: CURRENT (/) vs PROTOTYPE (/switch) — 2026-11-02

| page | Straight | Proof | Original | Hook | Type+colour | total | gate |
|---|---|---|---|---|---|---|---|
| CURRENT `/` (anchor) | 8 | 7 | 7 | 7 | 7 | **36/50** | PASS (check.mjs 0 hard, 9 warnings) |
| PROTOTYPE `/switch` | 7 | 8 | 8 | 8 | 7 | **38/50** | **FAIL** (check.mjs C01: work 20% of first screen at 1440) |

Neither reaches the ship bar (42, with original and hook at 8 or more). PROTOTYPE leads by 2 points on content, but it fails the gate and has three claim problems (see Factual accuracy).
Anchor note: no recorded score exists for this version of CURRENT. The Oct 29 site scored 29/50 and has been rebuilt since, so it cannot calibrate this round. The +7 over that score is my reading, not a calibrated one.

(Summary table is added at the top in step 3; step 1 below was written before any other evidence was opened and is not revised.)

## Step 1 — comprehension from the four first-screen captures only

### CURRENT, 1440 (captures/current-1440.png)
- **Who:** "Gentrit Rashiti" (nav, small) + "Software engineer: frontend, backend and mobile"
- **What:** "I build web and mobile products, from interface to backend."
- **For whom:** "Mostly for healthcare teams, learning platforms and consumer apps."
- **Proof:** "5+ years shipping web and mobile products"; Offday product screenshot with "Own product, a working MVP built with one other developer"; a row of four named projects with one-line tags: "Care platform — Web + backend · care workflows, permissions", "Bayyinah TV — Frontend · streaming, English + Arabic", "Tondo + LeakScan — Backend · realtime servers, scan jobs", "Read to Feed — Mobile · about 14 store releases". No number/outcome tied to Offday itself.
- **Memory:** "A full-stack and mobile engineer in Kosovo; he built a team leave-calendar app called Offday and has healthcare, streaming and mobile projects."

### CURRENT, 390 (captures/current-390.png)
- **Who:** "Gentrit Rashiti" + "Software engineer: frontend, backend and mobile"
- **What:** "I build web and mobile products, from interface to backend."
- **For whom:** "Mostly for healthcare teams, learning platforms and consumer apps."
- **Proof:** "5+ years shipping web and mobile products"; "Offday, a working MVP built with one other developer." + a calendar screenshot (cropped; no logo/name visible in the image). The other four projects are missing from the first screen.
- **Memory:** "Full-stack/mobile engineer in Kosovo who showed me a calendar app."

### PROTOTYPE, 1440 (captures/switch-1440.png)
- **Who:** "Gentrit Rashiti" + "Software engineer: frontend, backend and mobile"
- **What:** "I build web and mobile products, from interface to backend."
- **For whom:** "Mostly for healthcare teams, learning platforms and consumer apps."
- **Proof:** "5+ years…"; "Offday — Own product, a working MVP built with one other developer"; "About 200 Playwright tests — Including security and tenant isolation."; three rows "Interface — Team requests, approvals and a shared calendar." / "Server rules — Roles and organization membership are checked on the server." / "Data — SQLite stores workspaces, requests and balances."; product screenshot. Other projects missing from the first screen.
- **Memory:** "Full-stack engineer who built Offday end to end — UI, server rules, SQLite — with about 200 Playwright tests."

### PROTOTYPE, 390 (captures/switch-390.png)
- **Who:** "Gentrit Rashiti" + "Software engineer: frontend, backend and mobile"
- **What:** "I build web and mobile products, from interface to backend."
- **For whom:** "Mostly for healthcare teams, learning platforms and consumer apps."
- **Proof:** "Offday — Own product, a working MVP built with one other developer"; "About 200 Playwright tests — Including security and tenant isolation."; calendar screenshot (cropped). Layer rows and other projects missing from the first screen.
- **Memory:** "Engineer who built a calendar app called Offday and tested it with ~200 Playwright tests."


_Note added after step 2:_ the step-1 answers still hold. Live checks added two things. At 1024 px the PROTOTYPE's layer rows and case link fall below the fold (observed, `sw-1024`). CURRENT's switch also changes the hero's left-column sentence and swaps the plate to the real permissions view and table schema. That makes its hook stronger live than in the static capture.

## Evidence used (label: OBSERVED = I ran or saw it; INFERRED = read, not run)

- OBSERVED, checker: `node .claude/skills/portfolio-page/scripts/check.mjs <url> --owner "Gentrit Rashiti" --facts CONTENT.md --scheme dark`, with `CHROMIUM_PATH` set to system Chrome (Playwright's own headless shell is not installed, and Chrome needed the sandbox off).
  - CURRENT: PASS, 0 hard fails. Warnings: T00 = 2 (T10b "Selected work"/"Skills", T10f 11 technical words, T30 middot chains), C08c 2 images below 2× density. Work in first screen: 34% at 1440, 40% at 390. Four type sizes (16/20/40/56). One long frame of 1,018 ms at 1440 (headless, indicative only).
  - PROTOTYPE: FAIL. ✗ C01: work fills 20% of the first screen at 1440 (25% at 390). △ C02: 94 words in the first screen at 1440. T10b and T10f as above. Human-made signals 6/8 (no asymmetry, no large work).
- OBSERVED, live Playwright with system Chrome, production build on :4173, at 1440×900 and 390×844 (touch):
  - Keyboard: the hero switch takes 9 Tabs to reach on CURRENT and 6 on PROTOTYPE. Focus ring is a visible 2 px solid cyan on both. Tab moves between options and Enter selects; ArrowRight does nothing on either. The buttons use `aria-pressed`, so that is acceptable.
  - Screen-reader announcements: CURRENT has an `aria-live="polite"` caption that announces the layer sentence. PROTOTYPE has none, which is acceptable because the sentence is inside the pressed button.
  - Rapid toggling (9 alternating clicks or taps) ended in a consistent state on both pages.
  - Overflow: no horizontal page scroll at 375, 768, 1024, 1280 or 1440 on either page.
  - Case pages: from both homes, `/offday` and `/care-platform` open with their h1 within 74–367 ms, and Back restores the exact scrollY (e.g. 3129 → 3129, 2204 → 2204). No console errors.
  - One blank black frame was captured on `/switch` → `/offday` in the first run, screenshot taken right after networkidle. It did not reproduce: the rerun found the h1 in 354 ms. It is not counted as a defect, but `/offday` opens about 3× slower from `/switch` (354–367 ms) than from `/` (99–108 ms).
  - CURRENT draws a full-viewport `<canvas>` dot field. It is absent in the very first frame and appears after interaction or scroll (`current-1440-layer1.png`, `cu-dots-after-click`). A disclosure at the foot of the page is titled "The field behind this page". PROTOTYPE has no canvas.
  - Tap targets: hero switch 121×44 on CURRENT. PROTOTYPE rows are 537×48–72 at 1440 and 375×74–98 at 390, so both pass 44 px.
- OBSERVED, captures: `captures/*-layer1/2.png`, `side-by-side-*`, and my own section shots (Selected work, Bayyinah, Design System, Tondo, Before-and-after, 1024 and 768).
- INFERRED: authorship and scope facts come from CONTENT.md only. I did not open any project repository.

## Scores with evidence

### CURRENT — 36/50, gate pass
- **Straight 8**
  - Desktop: all four answers sit above the fold. "I build web and mobile products, from interface to backend." / "Software engineer: frontend, backend and mobile" / "Mostly for healthcare teams…".
  - The Offday screen fills the right half (work 34%). A four-project strip with scope sits at the fold.
  - Phone: the same three lines plus the Offday screen (40%), but the project strip is below the fold.
- **Proof 7**
  - The hero strip gives scope only: "Web + backend · care workflows, permissions", "Backend · realtime servers, scan jobs".
  - The lead project, Offday, has no checkable result on the first screen ("Own product, a working MVP…").
  - Results exist lower down, with sources: "16 → 2", "186,949 bytes → 6,386 bytes", "100K+ Google Play downloads", "About 14 store releases".
- **Original 7**
  - The Interface / Server rules / Data switch on one real product is a person-specific idea. It flips the real calendar to the real permissions view ("Teammates see the dates on the calendar, not the note.") and then to the real table schema.
  - The rest is the loop skeleton (claim top-left, screenshot right) plus a decorative dot-field canvas.
- **Hook 7**
  - The memory sentence carries a fact ("built a team leave-calendar app called Offday"), but it says nothing about the backend claim.
  - On phone the memory is only "showed me a calendar app".
  - The switch is the one moment worth mentioning, and it sits under the screenshot.
- **Type+colour 7**
  - Archivo only, a near-black tinted ground (rgb 5 5 8), one cyan accent. Correct and calm.
  - The dot field adds texture rather than a decision.

### PROTOTYPE — 38/50, gate FAIL
- **Straight 7**
  - The same three hero lines.
  - The first screen is text-heavy (94 words). The Offday image starts at y≈413 and covers 20% of the first screen (C01 hard fail).
  - At 1024 the layer rows and "Read the Offday case" are below the fold (`sw-1024`).
  - The eye lands on text rows, not on work.
- **Proof 8**
  - Hero proof is checkable: "About 200 Playwright tests / Including security and tenant isolation."
  - Every selected project carries a role line, one result and a three-row layer split, with "Not my layer" where it applies (Bayyinah, Read to Feed, Viva Fresh).
  - Kept from 9 by the accuracy problems below, which an interviewer would probe.
- **Original 8**
  - A rule a designer and a recruiter would both notice: "Each project shows only the layers I built. The others are named, not claimed."
  - It holds across seven projects, with real plates (Laravel API rows, Tondo's PostgreSQL tables, LeakScan's flow).
  - Kept from 9 by seven blocks with an identical text-left/image-right/three-row rhythm.
- **Hook 8**
  - Memory sentence: "Full-stack engineer who built Offday end to end — UI, server rules, SQLite — with about 200 Playwright tests, and who marks the layers he didn't build."
  - It carries facts about the person.
- **Type+colour 7**
  - Same system minus the canvas: calmer, plainer, nothing to put on a mood board.

## Factual accuracy (against CONTENT.md and the pages' own content)

### PROTOTYPE
1. **Design System v2 overclaims.**
   - The section intro says "Each project shows only the layers I built", and the Interface row then reads "Tokens and components: 868 design values generate CSS, TypeScript and Figma."
   - CONTENT §6b: "A teammate wrote most components and decision records… do not say Gentrit built the system", and "Do not write what Gentrit did on this project".
   - Read together, the page claims he built the tokens and components.
2. **Care platform role quote breaks the voice rule.**
   - The quote is "…then the move to React and the rules and merge gates it runs inside; the Laravel API since 2026."
   - CONTENT §2 keeps the authorship record "for reference only and never displayed", and says the first harness commit is a teammate's. The voice rule (2026-10-07) says "never 'Gentrit wrote/built/laid…'" and requires team voice.
3. **Care platform "Data: Not my layer" contradicts the same page.**
   - The section's own result is "16 queries → 2" ("Database queries in one report" on CURRENT).
   - The About says "my work also includes Laravel APIs, database reports and permissions".
   - CONTENT's index calls the Care-management API role "Full stack".
   - Either the report belongs in Data, or the Data row must say what the report work was.
4. **Care platform role omits mobile.** The section says "Web + backend" and the role quote says frontend only. CONTENT's role is "Web and mobile; since 2026 also the server", which the same page's All-projects row repeats.
5. **Bayyinah TV Interface row**
   - "The Nuxt 3 rebuild: 34 routes, 270+ components…" sits under "layers I built". That credits the team rebuild ("Frontend, core team") to him alone.
   - It also leads with framework and component counts. CONTENT (owner, 2026-10-27) says to put the transition, live streaming and on-demand video ahead of those counts. CURRENT follows that rule.
6. **Tondo & Za! conflation.** "A round card table for 2–4 players" and "Saved crews in PostgreSQL" describe Tondo only. Za! is 2–8 players and has no stated database (CONTENT §7b).
7. **Offday's layers are not split.** The hero lists all three layers under the "only the layers I built" logic. Offday was "built with one other developer", and the page does not say which layers the other developer built. Mild.
8. **First-person project copy needs an owner decision.** "layers I built" and "Not my layer" conflict with CONTENT's 2026-10-02 voice rule ("Neutral voice: no first person"). This is not a defect if the newer layer rule supersedes it, but the owner should confirm.
9. **Unverified details.** The Tondo table names (`crews`, `members`, `pies`, `pie_players`), "Leaving a crew clears the name, its only copy" and "Requests limited per real client address" are not in CONTENT. They are not contradicted, but I could not check them.

### CURRENT
1. **"Eight products, from interface to infrastructure"** (the "Explore the product layers" disclosure, y≈7530). CONTENT (owner, 2026-11-02): "Do not add … infrastructure ownership … as experience". The approved frame is "from interface to backend".

### Both pages
- **"Real product screens, invented data."** captions the Data plate too, which is a drawn table, not a screen.
- **Unapproved hero lines.** The role line and the audience line are marked "awaiting approval from captures" in CONTENT.

## Which page a recruiter should see
- **Full-stack screening:** the PROTOTYPE is the better pitch, because every project answers "which layers did you build" in rows a recruiter can scan, and "About 200 Playwright tests" is checkable proof on the first screen. Until prototype fixes 1–3 land (Design System, the care role quote, care Data), send CURRENT: an interviewer would expose those claims, and that costs more than the pitch gains.
- **Frontend screening:** send CURRENT. It shows more work visually (the Bayyinah carousel, "Try the reader", the Before-and-after bars with sources) and passes the gate.

## Devil's advocate

**CURRENT — why a hiring manager closes the tab.**
- The page says "from interface to backend", yet the first screen proves only an interface: a calendar screenshot with "a working MVP built with one other developer".
- The backend proof sits behind a three-way switch that most people will not press, and below a strip of scope tags with no results.
- Scrolling brings a dot-field canvas that does nothing for the argument, and a disclosure about "The field behind this page".
- A disclosure claims "interface to infrastructure", which the CV does not back. One question about his AWS work ends that claim.
- At 12,129 px it is long. Two scrolls in, it is "another dark portfolio with screenshots".

**PROTOTYPE — why a hiring manager closes the tab.**
- The first screen is a wall of text (94 words) with the work pushed into the lower right. At 1024 the one interesting control is below the fold.
- The pitch rests on "only the layers I built", so any overclaim is fatal, and the page has some:
  - Design System v2 credits him with tokens and components a teammate mostly built.
  - The care role quote takes personal credit for the team's rules and gates.
  - "Data: Not my layer" sits next to a database-query result.
- An interviewer who asks "which of the 41 components did you write?" or "who set up the merge gates?" gets an answer that contradicts the page.
- Seven identical blocks read like a template by the fourth.

## Fix lists (most severe first)

### CURRENT
1. Replace "from interface to infrastructure" (Explore the product layers disclosure) with backend or database wording. CONTENT forbids the infrastructure claim.
2. Put one checkable Offday result on the first screen, beside the "Offday" heading on desktop and above the screenshot on phone. "About 200 Playwright tests, including security and tenant isolation" is approved in CONTENT §7.
3. Phone first screen: "Offday" appears only inside a sentence, and the screenshot is cropped past the logo. Name the product as a heading, and keep the switch fully above the fold. Its bottom sits at about 842 of 844 px.
4. Hero left column: when the layer changes, the swapped sentence runs into "Own product…" with no gap (Server rules state), and it wraps at about 210 px ("Roles and organization / membership are checked on / the server."). Fix the spacing and widen the measure.
5. Remove the dot-field canvas and "The field behind this page", or tie them to something real. They are texture, not work.
6. Caption the Data plate as what it is ("Table names from lib/store.ts"), not "Real product screens".
7. Clear the T30 middot chains ("Own products · Node · WebSocket · PostgreSQL") and the T10b flags. Re-run check.mjs.
8. Profile the 1,018 ms long frame at 1440 load (headless, indicative) on a real browser.

### PROTOTYPE
1. Design System v2: drop "Interface: Tokens and components…" as a personal layer, or change the section rule to separate "my part" from "team". CONTENT §6b forbids crediting him with the system.
2. Care platform role quote: remove "the rules and merge gates it runs inside" (team voice, authorship never displayed). Restore "Web and mobile; since 2026 also the server".
3. Care platform Data row: resolve "Not my layer" against "16 queries → 2" and the About's "database reports". Either show the report work as Data, or explain that the work was query code in the API layer.
4. Gate: lift work from 20% to 25% or more of the 1440 first screen (move the Offday plate up beside the hero, or cut copy from 94 words toward 60). Keep the layer rows above the fold at 1024.
5. Bayyinah TV: lead the Interface row with the rebuild-for-a-live-audience, live and on-demand story (owner emphasis), and in team voice for the counts.
6. Tondo & Za!: say which rows are Tondo only (2–4 players, PostgreSQL crews), or split them.
7. Offday hero: say which layers the co-developer built, or that both built all three.
8. Break the seven-block rhythm: vary width, ground or plate size. Bring back the Before-and-after bars with sources and the "Try the reader" demo that CURRENT has.
9. Get the owner's decision on first-person project copy against CONTENT's 2026-10-02 neutral-voice rule.
10. Data plate caption, as for CURRENT fix 6.
