# 05 · Critique of `portfolio-page` before builders use it

Reviewer: a design director and design engineer, reading only the skill, the project facts and the built site. Date: 2026-10-07. Captures and reports are in the session scratchpad under `critique/` (home, fable-blind, linja, departures, orbit, fjalekryq, care-platform, three synthetic fixtures). Anchors: live home `/` (KOSOVO TIME II, 43/50), `/drafts/fable-blind` (33/50), `/drafts/departures` (39/50, straight 7), `/drafts/linja` (37/50, straight 6).

## Verdict (10 lines)

1. The skill is well built and mostly right. A builder who follows it will not ship a pill, a gradient headline, a glass card or a stat row. That alone beats most generated portfolios.
2. It will also produce the same page every time: Fraunces at 64 px, Public Sans, tinted paper, "Name builds X, from Y", a proof row, a browser-framed screenshot, "See the work", rows with a bold result line. The home, the case page, FABLE BLIND and my by-the-book fixture all set Fraunces at 60–64 px. The skill then warns about it (T18c).
3. The skill induces three warnings on purpose (Fraunces from the pairing table, a sourced numbers row from the case template, a hover on the enlarge control) and then fails the page for having three warnings (T00). The owner's own case page `/work/care-platform` fails this way today.
4. The checker's first-screen work test accepts any `<canvas>`. On the home it counts the shadow shader (65 %); on departures and linja it counts a board that displays the owner's name. A page with no product screen passes rule 1.
5. The checker cannot see the giant-name skeleton unless the name is the `h1`, cannot see Inter behind a font alias, and misses most of the banned copy in `writing.md`. A page built to fail passed with zero template tells and 6 of 8 "human-made" signals.
6. Hard rules and references disagree on numbers: first-screen words (60 vs 110), hero words (20 vs 16), em dashes (zero vs 1 per 120 words), accent colour (one accent vs committed palettes), fade-up (banned vs warned).
7. The writing guidance is good on bans and weak on construction. Its own examples break the owner's rules in `CONTENT.md` (the "16 → 2" title) and its formula output lacks the one thing it asks for (a clickable noun).
8. The motion reference has the right numbers and no recipe. A builder gets tokens, not a way to make one moment feel finished. Frame timing is measured and never judged.
9. Important research was dropped: the invented-metric check (S50), the triplet check (S37), the "judge before the detector" rule, the dark-scheme pass, the "one accent" correction, and the 25 % work bar (lowered to 15 % without a reason).
10. Fix the T00 tiering, the canvas hole, the name/alias blind spots and the number conflicts before a round. Everything else can follow.

## Edits

Tags: [MUST] before any build round; [SHOULD] before the next review round; [COULD] when time allows.

### A. Sameness, first frame, award level

1. [MUST] `reference/first-screen.md` §Compositions that work: delete the label "Most reliable" on item 1 and the sentence "The sentence is plain; the row carries the weight; the screen proves the craft." Replace the list intro with: "Pick the composition from the direction card's rule, never from this list's order. Two drafts in one round may not share a composition." Evidence: the four pages I checked that follow the skill all use item 1.
2. [MUST] `SKILL.md` hard rule 1: raise the bar and name the target. New text: "**Work in the first screen.** A real product screen, live demo or playable piece fills ≥ 25 % of the first screen at 1440×900 and ≥ 20 % at 390×844 (the floor is 15 % / 12 % only for Read mode). A canvas or a board counts only if it shows the work, not the name, the proof row or decoration." Research 03 rule 15 and signal H04 say 25 %; the skill lowered it to 15 % and the signal still says 25 %.
3. [MUST] `reference/directions.md`: add a worked example end to end, using the live home. Six lines: the fact (the hour in Kosovo), the control (the disc; drag, tap, keys), the delete test (the hour text stays), the reduced-motion still, the budget (150 kB, static fallback), the memory sentence. Builders have a mechanism list and no finished example of one.
4. [SHOULD] `SKILL.md` §The bar: add a fourth line: "**In the first second** one object is the picture: a product screen, a live object or the claim set as type at ≥ 40 % of the viewport. A screen at the floor size beside a paragraph is a landing page." The current rules give a floor, not a target, so builders stop at the floor.
5. [SHOULD] `reference/review.md`: add a six-row table "The bar to beat" with the sites the reviewer is told to compare against (rauno.me craft index, emilkowal.ski live demos, antfu.me proof rows, taniarascia.com dated record, bruno-simon.com, designeer.xyz themed surfaces) and one line each on what they do. Reviewers must "name three sites it beats"; builders are never told which sites.
6. [SHOULD] `reference/directions.md` §Divergence rules: add "Different composition per draft (from `first-screen.md`'s list) and different display face class (serif, grotesk, mono, drawn)." Then the round cannot converge on sentence + row + screen.
7. [COULD] `reference/work-display.md`: add "The first screen's screen is cropped to the part that proves the sentence, at 1:1 pixels, never the whole app shrunk to fit." The live home shows whole screens; on the phone the calendar's event text is about 3 CSS px and the cart's product names about 7 px (see `home/390.png` at 2×), which the skill's own rule (≥ 11 px) forbids and the checker does not measure. Add C08f: for each first-screen `img`, estimate text size as `naturalTextPx × (renderedWidth / naturalWidth)` from a `data-text-px` attribute on the image, warn under 11 px on phone.

### B. Contradictions and ambiguity

8. [MUST] One accent vs committed palettes. `SKILL.md` hard rule 14 says "with one interaction accent"; `reference/review.md` craft gate says "one accent"; `reference/visual.md` lists "A committed two- or three-colour identity" as a strategy. Research 03 §2.1 warned that the old loop "banned the last row by accident". The skill re-introduced the accident. New rule 14 text: "**Colour has a source.** The palette comes from the work, the place or the person's material. Either one accent with a named job (≤ 5 % of any viewport) or a committed two- or three-colour identity with a job per colour, written in the draft notes. No default Tailwind slate/zinc + indigo; no dark ground with a lone neon accent." Change the review gate line to "Harmony: one type pairing; every chromatic colour has a named job."
9. [MUST] Fraunces. `reference/visual.md` pairing table row 1 recommends Fraunces (opsz 144) as the Editorial starting point; the reflex list in the same file and `scripts/check.mjs` T18c warn on it; `SKILL.md` rule 13 requires "a written reason". Either remove Fraunces (and Cormorant, Instrument) from the pairing table, or make the rule explicit: "Faces in the starting-points table are pre-approved when the reason in the table applies; record `allow T18c: <reason>` in the page meta so the warning does not count." Today the owner's home, case page and every draft on Fraunces carry an unexplained warning that counts toward T00.
10. [MUST] Numbers row vs stat row. `reference/writing.md` case template: "[2–3 numbers with plain labels, each sourced]". `reference/anti-slop.md` T13 flags any row of 3+ big numbers (△ without "+"). `/drafts/fable-blind` is flagged for "16 → 2 · 4 · 36", all sourced. Add to T13's "Instead" column: "A sourced numbers row with full-sentence labels and no '+' is allowed; mark it `data-numbers` and the checker skips it." (Checker change in finding F3.)
11. [MUST] Word budgets. `reference/first-screen.md` says "about 60 words outside the nav"; `check.mjs` C02 warns at 110 (desktop) / 70 (phone); research 01 R5 says ≤ 60. Pick 60 target / 90 warn / 120 fail and state it in both files. Hero length: `SKILL.md` and `first-screen.md` say ≤ 20 words (15 target); C02b warns at 17. The research's own owner line (example 9) is 17 words and gets a warning on `/drafts/departures`. Set C02b to warn above 20.
12. [MUST] Em dashes. `reference/writing.md`: "none in visible copy". `anti-slop.md` T11: "em-dash density △". `check.mjs`: warn above 1 per 120 words (8.3 per 1,000). Research 03 S38: 5 per 1,000. Pick zero in headings and rows, ≤ 3 per 1,000 in case prose, and make the checker say which.
13. [MUST] Fade-up. `SKILL.md` rule 9: "No fade-up on every section" is a hard rule. The checker only warns (M08 at ≥ 6 blocks). The live home has 12 blocks that start invisible (the work-card steps and marks, which are one authored figure, not sections). Rewrite rule 9's last sentence: "No entrance animation on sections. One authored figure may build once, in view, in ≤ 800 ms, and must be complete without JavaScript and under reduced motion." Then M08 should count top-level containers, not leaf nodes (finding F11).
14. [SHOULD] Hook vs hero. `SKILL.md` rule 8 "One hook per page, and it carries a fact" and `first-screen.md` "a hook may sit in the first screen only if the four answers are readable before, beside or inside it without input" are compatible, but `directions.md` M12 says "the visitor makes the fact appear". Add one sentence to M12: "The fact is also on the page as text before any input (first-screen rule)."
15. [SHOULD] Voice. `SKILL.md` rule 7 bans third person "unless the owner asks". `CONTENT.md` mandates the AI line "Gentrit wrote most of the rules…" and a no-person overview voice. A builder reading both sees a mixed-voice mandate. Add to `writing.md` §Voice: "A sentence with the owner's name as subject counts as the no-person voice. Pronouns (he, his, him) are what the rule bans."
16. [SHOULD] `check.mjs --mode read` only changes the C02 word budget, but `SKILL.md` §Modes promises a different rule set for Read. Either say so ("Read mode relaxes the first-screen word budget only") or make Read mode also lower the work share to 15 % and skip T12b (a centred case title is normal).
17. [SHOULD] Targets. `SKILL.md` rule 11 says "targets ≥ 24px (44px on touch)". `check.mjs` C05 fails any link under 24 px, including plain text links ("See the work", "CV") and nav words, which WCAG 2.5.8 exempts when spaced. State the exemption in the rule and the checker (finding F9).
18. [COULD] `reference/visual.md` type tokens allow caps labels at 11–12 px and mono data at 11–14 px; `check.mjs` C07 warns under 12 px. Set C07 to warn under 11 px, or exempt uppercase/mono labels ≤ 3 words at ≥ 11 px.
19. [COULD] Ids drift. `anti-slop.md` is the only id table; C-, M-, T12b/c, T27b and T00 exist only in the script. Add `reference/checks.md` generated from the script (`node check.mjs --list`), and point the "Checks" sections of the other references at it.

### C. Rules that are wrong, too strict, or too weak

20. [MUST] T00 (three soft tells = hard fail) is too strict. It fails the owner's case page (T06b sky + T18c Fraunces + T23 enlarge hover), orbit (T23 + T30 + T27b) and my by-the-book fixture when one more tell lands. The verdict also changes with the clock: the home shows two soft tells by day (T06b + T18c) and one at night. Tier the tells (finding F1).
21. [MUST] Rule 2 (claim is the largest text) has no test unless the name is the `h1`. `/drafts/departures` sets the claim at 27 px and the owner's name at 72 px in LED dots; `/drafts/orbit` sets "Gentrit Rashiti." at 170 px; both pass rule 2 in the checker. Add C18 (finding F5).
22. [MUST] Rule 1 counts decoration as work. See verdict line 4 and finding F2.
23. [SHOULD] Rule 15 (first readable frame ≤ 1 s on a mid phone) has no test. The checker records LCP and never judges it; `/drafts/departures` is at 984 ms unthrottled at 1440. Add C17 (finding F13) and make `--throttle 4` part of the verify step in `SKILL.md`.
24. [SHOULD] "Stop after two polish passes" is right; but `review.md` §Polish says "Polish only drafts at or above 8 on original and hook" while `SKILL.md` runs `polish` for every plain request. Add to SKILL.md: "If the self-score on original or hook is ≤ 7, go back to `direct`, not to `polish`."
25. [SHOULD] T23 (hover lift) is too broad: it flags the enlarge control that `work-display.md` asks for. Research S28 required the selector to match ≥ 4 elements; the checker dropped that. Restore it (finding F10).
26. [COULD] T12c "two boxed buttons under the hero" is too weak as evidence and too eager: on linja and fjalekryq it flags board rows and crossword clues. Research S11 required one filled and one ghost button in one row. Restore it (finding F8).
27. [COULD] M02 fails only above 1,600 ms; `motion.md` sets the story ceiling at 1,100 ms. Fail above 1,100 unless the animation is tagged `data-motion="story"` and ≤ 1,100.

### D. Writing guidance

28. [MUST] `reference/writing.md` §Case study page: replace the example title "One billing report: 16 requests became 2". `CONTENT.md` (owner, 2026-10-06) says the 16 → 2 figure is not the H1. A builder who copies the skill's example breaks the owner's rule in the first hour. New example, from the same facts: "Care teams kept their app while it was rebuilt under them, one tested screen at a time." Add the fallback rule: "If the owner forbids the number, the title states what users kept or gained."
29. [MUST] `reference/first-screen.md` §Formula: the "good" example "Gentrit Rashiti builds web and mobile apps, from Kosovo." omits the formula's own "for [people]". Either change the formula to make "for whom" optional when the proof row names the users, or change the example: "Gentrit Rashiti builds the web and phone apps care teams, readers and shoppers use. From Kosovo." Add the rule: "The proof row holds at least one noun a stranger can open: a store listing, a live site, a repo." The live second line "5+ years. Part of two platform rewrites. Working remotely." has none.
30. [SHOULD] `reference/writing.md` §Result lines: add a pattern for work in progress. The live care row's result line "Being rebuilt screen by screen. Old bugs written down, not copied." is a participle plus an aphorism, and the template makes it the biggest text in the row. New pattern: "`[Users] keep [what] while [what changes].` then one witnessed fact." Example: "Care teams keep using the old app while each screen moves over. The billing report that timed out now finishes: 2 requests, not 16."
31. [SHOULD] `reference/writing.md` §Words: add a translation table for the home page, with the owner's real facts: component → building block; route → page or screen; query → database request; tenant → client organization; design token → colour, size and type rule; release → store release. The live home already does this ("36 building blocks", "34 pages"); the skill bans the words and shows no replacements.
32. [SHOULD] `reference/writing.md`: add a six-line hook-copy rule. The one line that explains the mechanism ("17:04 in Kosovo") is the hardest line on the page and the skill says nothing about it. Rule: "≤ 5 words, a fact the visitor can check, no verb, no instruction ('drag', 'try'). The control teaches itself."
33. [COULD] `reference/writing.md` §Readability numbers: the grade-level and sentence-length rules have no script. Add `scripts/copy.mjs` (or a `--copy` flag) that counts sentence length, grade level, banned lists A–F, scope and result dodges, pronoun voice, and numbers not found in `CONTENT.md`. Research 01 gave every rule a test; none is implemented.

Three rewrites that show the gap:

| Where | Skill-guided line | Why it falls short | Rewrite (facts from `CONTENT.md`) |
|---|---|---|---|
| Hero proof row | "5+ years. Part of two platform rewrites. Working remotely." | "5+" is the plus-count the skill distrusts in T13; "working remotely" is not proof; nothing is clickable | "Since 2021. Two platform rewrites. [App Store] · [Google Play] · [bayyinahtv.com]." |
| Home row result | "Being rebuilt screen by screen. Old bugs written down, not copied." | Not a result; the second sentence is cadence; the template bolds it | "Care teams keep using the old app while each screen moves over. The billing report that timed out now finishes: 2 requests, not 16." |
| Case H1 | "One billing report: 16 requests became 2" (skill example) | Forbidden by the owner; and a number is not the whole case | "Care teams kept their app while it was rebuilt under them, one tested screen at a time." |

### E. Motion guidance

34. [MUST] `reference/motion.md`: add "The quiet layer" before the tokens. Six lines: press `scale(0.98)` 120 ms; hover 150 ms and only on fine pointers; focus instant; link underline grows from the left in 150 ms; case open is a View Transition 300–450 ms expo-out; nothing else moves. Most of a premium page is this layer. The reference gives tokens and leaves the builder to choose where they go.
35. [MUST] `reference/motion.md` §The signature moment: add a build order. "1. Build the end state static and ship it. 2. Add the cause (the control, the scroll position, the route). 3. Add the motion with one token. 4. Make it interruptible and keyed. 5. Add the reduced-motion branch (same end state). 6. Measure at 4× CPU: p95 ≤ 20 ms, no long frame ≥ 50 ms, CLS 0. 7. Capture 5 mid-frames and scrub at 10 %." Without this, builders animate first and backfill the fact.
36. [SHOULD] `reference/motion.md`: add "Orchestration". "At most two things move at once in the first screen. Overlaps ≤ 30 % of a duration. The eye follows one path (top-left to the work). Every sequence ends on a still within 1 s." The home's stand-up (620 ms, 90 ms apart) follows this; the skill never states it.
37. [SHOULD] `reference/motion.md` §Reduced motion: show the two snippets. The wrong one (`* { animation: none !important }` hides end states) and the right one (durations to 0.01 s, loops paused, canvas replaced by a still). The live home uses the right one; a builder will write the wrong one.
38. [SHOULD] Add two copy-paste snippets to a `snippets/` folder and link them: a same-document View Transition for tile → case (`view-transition-name` on tile and hero, 380 ms, `cubic-bezier(0.16,1,0.3,1)`, fade fallback), and a press state with `:active` and `@media (hover: hover)`. Move the two `linear()` spring blobs there too; they are noise in the reference.
39. [SHOULD] `reference/motion.md` §Verification: the checker records frame timing and LCP and judges neither. Add M10–M15 (findings F13–F16) and say which are automatic.
40. [COULD] Restore from research 02 the one sanctioned list entrance: "`translateY(12px)` + opacity, 300 ms ease-out, stagger ≤ 60 ms, once, only for a list that enters as a list, never below 400 px of the fold, never re-triggered." The skill bans fade-ups without giving the one allowed form, so builders either freeze everything or do the cliché.

### F. Skill design

41. [SHOULD] `SKILL.md` §Commands: add a fast path. "Hero or one page only: `hero` + `write` + `check`. A round of drafts: the full pipeline." The ten-step pipeline runs for a "redo the hero" request today.
42. [SHOULD] `SKILL.md` §Output contract: make it a file (`templates/draft-notes.md`) with the keys the repo already uses in `meta.json` (`rule`, `signature`, `holdback`, `loopScores`, `pageLength`) plus `designRead`, `hook`, `lead`, `allow`. The contract's keys and the repo's keys differ today.
43. [SHOULD] `reference/review.md` §Method step 1 runs the checker first. Research 04 §6 lesson 7: "judgment runs before the detector to avoid anchoring." Swap steps 1 and 2: look at captures and drive the page first, score, then read `report.md` and adjust only the craft gate.
44. [SHOULD] Dark scheme. `visual.md` has a dark-mode section; nothing checks it. Add `--scheme dark` to the checker (a context with `colorScheme: "dark"`), run contrast and T34 there, and add "both schemes" to the verify step when the project has one.
45. [COULD] Cut from `reference/brief.md` the paragraph "Measured facts worth knowing…" (folklore about seconds; it leads nowhere). Cut from `anti-slop.md` §Why each family reads as generated (true, but the builder does not act on it). Cut the `polish` command row (it is review §Polish).
46. [COULD] `SKILL.md` description is one 90-word sentence. Keep the trigger words; move the list of tells out of the description into the body.

## Checker findings

Format: id, kind (FP false positive, FN false negative, fragile), evidence, fix.

**F1 · T00 aggregation — FP.** Three weak warnings (T18c on a table-recommended face, T23 on one enlarge control, T06b on a sky computed from the sun) fail `/work/care-platform`. Same on orbit (T23 + T30 + T27b). Fix: weight tells. In `check.mjs` after `softTells`:

```js
const weight = { T03:1, T04:1, T05:1, T06b:1, T07:1, T13:1, T15:1, T16:1, T17:1, T19:1, T22:1, T26:1, T28:1, T29:1, T36:1, T42:1,
                 T11:0.5, T12b:0.5, T12c:0.5, T18b:0.5, T18c:0.5, T20:0.5, T21:0.5, T23:0.5, T30:0.5, T31:0.5, T33:0.5, T35:0.5, T37:0.5, T39:0.5, T40:0.5, T41:0.5, T27b:0.5 };
const score = softTells.reduce((s, id) => s + (weight[id] ?? 1), 0);
if (score >= 3) vp.findings.push({ id: "T00", severity: "fail", … });
else if (score >= 2) vp.findings.push({ id: "T00", severity: "warn", … });
```

Also skip tells whose `severity` is `allowed`, and do not count a tell whose `where` has one element when the weight is 0.5.

**F2 · C01 counts any canvas — FN.** Home: `canvas.k2-floor` 65 % (shadow shader) → "Work fills 105 %". Departures: `canvas` 56 % showing "GENTRIT RASHITI". Linja: `canvas` 50 %. Fixture `evasion-clean`: a decorative gradient canvas → 114 %, C01 passes, signal `workLarge` ✓. Fix: count `canvas`/`video`/`[data-work]` only when marked; cap the sum at 100 %; require an `img`/`picture`/`iframe` or `[data-work]` with `alt`/`aria-label` naming a product.

```js
const media = [
  ...visibleEls.filter((el) => el.matches("img,picture,iframe,[role=img]") || …),
  ...[...document.querySelectorAll("[data-work]")].filter(shown),   // canvas/video count only inside data-work
];
const mediaShare = Math.min(1, firstMedia.reduce(…));
const named = firstMedia.some((m) => /\S/.test(m.el.getAttribute("alt") || m.el.getAttribute("aria-label") || m.el.getAttribute("data-work") || ""));
if (!named) add("C01b", "fail", "First-screen work has no name", "Give the screen alt text or data-work=\"<product>\".");
```

Report the share with and without canvas so the reviewer sees what was counted.

**F3 · T13 on sourced numbers — FP.** `/drafts/fable-blind` `div.fb-readouts "16 → 2 Queries in one billing report · 4 Languages · 36 Components"`. Research S15 required ≥ 28 px numerals and labels ≤ 24 chars. Fix: `fail` only with `+`, `%`, a counting animation or a vanity label (`/years?|projects?|clients?|customers?|countries|awards|happy/i`); `warn` only when a label is ≤ 24 chars; skip `[data-numbers]`.

**F4 · T18 defaults anchored — FN.** `defaults` is `^(inter|…)$`; `reflex` is a substring match. Fixture `evasion`: `@font-face { font-family: "Display Sans"; src: local("Inter") }` → no T18, signal `displayFace` ✓. Fix: make `defaults` a substring match like `reflex`, and also scan `@font-face` rules: `src` containing `/inter|geist|roboto|poppins|montserrat|dm-?sans|open-?sans|lato|nunito|raleway|work-?sans/i` maps that alias to a default. Keep a `--fonts-ok "KT Fraunces=Fraunces"` flag for honest aliases.

**F5 · Rule 2 has no test — FN.** Departures: `h1` 27 px, board text 72 px. Orbit: `h1#orbit-title "Gentrit Rashiti."` 170 px (caught only as T27b warn, because work is beside it). Fixture `evasion-clean`: 150 px `div.name` → nothing, signal `nameSmall` ✓. Fix: add C18.

```js
const biggest = firstText.filter((el) => !el.closest("[data-work]")).sort((a, b) => px(style(b).fontSize) - px(style(a).fontSize))[0];
const ownerName = (document.querySelector('meta[name="author"]')?.content || "").trim();
if (hero && biggest && biggest !== hero && !hero.contains(biggest) && px(style(biggest).fontSize) > px(style(hero).fontSize) * 1.15)
  add("C18", ownerName && ownText(biggest).includes(ownerName) ? "fail" : "warn", "The claim is not the largest text", …, [label(biggest)]);
```

Read the owner's name from `<meta name="author">` or `--owner`, and use it in T27 instead of the capitalised-words regex.

**F6 · T27 name regex — FP.** `nameOnly` matches "Fjalëkryq." (`/drafts/fjalekryq`, hard fail), and in a probe also "Departures", "Bayyinah TV", "Care Platform Rebuild". Fix: compare against the owner's name (F5); fall back to the regex only when the same string also appears in `nav`/`footer`/`title`.

**F7 · Hero misdetection when the `h1` is hidden — FP chain.** Linja's `h1` is 15 px sr-only; the fallback picks "Bayyinah TV" (22 px), then T12c flags the board rows as a button pair and C02b/T01/T12 all test the wrong element. Fix: when no visible `h1`, report `C09` as `fail` in experience mode and set `hero = null` for the T-checks; never guess from the largest text.

**F8 · T12c on any two boxed buttons — FP.** Linja (board rows), fjalekryq (clue buttons). Research S11: one filled + one transparent-with-border, 2–3 children, same flex row. Restore: `pair` must be siblings, `≤ 3` children, each `≤ 4` words, one with `bg[3] > 0.5` and one with `bg[3] < 0.1 && borderWidth > 0`.

**F9 · C05 on plain text links — FP.** `good-blocked`: `a "CV"`, `a.see "See the work"` (17 px text, inline box ≈ 20 px tall). Fable-blind: four nav words. Fix: apply WCAG 2.5.8's spacing exception. Fail only when the target is < 24 px **and** another target's rect is within a 24 px circle; otherwise warn. Compute with the element's padded box plus `pointer-events` of the parent `li`/`nav` row.

**F10 · T23 on a single enlarge control — FP.** `/work/care-platform` `.cs-enlarge:hover`; `good-blocked` `.enlarge:hover` (2 px lift on a `button[aria-label^=Enlarge]`). Restore research S28: count only when `document.querySelectorAll(selectorWithoutHover).length >= 4`, and skip selectors on `button`/`[aria-label]`.

**F11 · M08 counts leaf nodes — FP.** Home: "12 blocks start invisible" are the `li` steps of one work-card figure. Fix: collapse to outermost hidden ancestors (already done as `hiddenOuter`) **and** then to distinct top-level sections: count `new Set(hiddenOuter.map(el => el.closest("section,article,main > div")))`. Warn at ≥ 4 sections, fail at ≥ 6 (research S41), warn separately when one figure holds > 12 hidden children.

**F12 · T21 numbered labels — FP.** Regex `^\d{2}\s*([/—–.·:|-]|\s)\s*[A-Za-z]` matches "36 components, 805 design tokens", "14 releases went to both stores", "34 routes" (probe). Fable-blind flagged `span.fb-line "36 components…"` and `"12 PROJECTS"`; fjalekryq flagged clue numbers that are the navigation. Fix: require a separator character, not whitespace: `/^\(?\d{2}\)?\s*[\/—–·|]\s*\p{L}/u`, text ≤ 24 chars, and `≥ 3` siblings with the pattern.

**F13 · LCP and frame timing recorded, not judged — FN.** Home at 1440: scroll p95 50 ms, 35 frames over 25 ms; departures LCP 984 ms. No finding. Fix: add M10 (`scrollFrames.p95 > 33` warn, `> 50` fail; at `--throttle 4` use 20 / 33), C17 (`lcp.t > 1000` warn, `> 2500` fail at throttle 4), M11 (`motionAtLoad` in the first screen > 2 elements → warn, research H14).

**F14 · T16 misses pseudo-element loops — FN.** Fixture `dot`: `.dot::before { animation: ping … infinite }` on a green 10 px dot; T16 silent. Only the reduced-motion pass caught it (M09), which a page with a correct reduced-motion rule would avoid. Fix: `el.getAnimations({ subtree: true })` in T16, T17 and T33.

**F15 · Scroll-triggered transitions are never sampled — FN.** Fixture `dot`: eight sections with `transition: all 900ms ease-in`; no M02, no M04b, no C16d beyond the stylesheet grep, because `MOTION()` is sampled at two instants. Fix: in `INIT`, log `transitionstart`/`animationstart` events with computed `transitionDuration`, `transitionTimingFunction` and `transitionProperty` into `w.__pc.events`, and run the M02/M03/M04 verdicts over that log.

**F16 · Reduced motion sees only WAAPI — FN.** A rAF loop (shader, blob) under `prefers-reduced-motion` is invisible. Fix: wrap `requestAnimationFrame` in `INIT` to count callbacks; in the reduced context, > 5 callbacks/s after 2 s of idle → M09c fail unless the page is marked `data-motion="story"` on a visible control.

**F17 · T10 phrase list is a third of `writing.md`'s — FN.** Fixture `evasion`: "corner of the internet", "detail-oriented", "results-driven", "love for", "Let's talk", "Hire me", "Get in touch", "Made with love", "Designer. Developer. Dreamer.", "Selected work", "Featured projects", "Services", "Testimonials"; scope dodges ("worked on", "helped with", "was involved in", "contributed to", "responsible for"); result dodges ("improved", "enhanced", "significantly", "modern, clean, intuitive"); voice mix ("Gentrit is… He builds… His work… I also write") — none flagged. Fix: move the lists to `data/phrases.json` (lists A–F from research 01), load them in `DETECT`, add T10c (scope dodges, fail at 1 in project text), T10d (result dodges), T10e (voice mix: `\bI\b` together with `\bhe\b|\bhis\b|<owner> is`), and the triplet regex from research S37.

**F18 · T31 cadence — FP.** Matches the skill's own 404 copy "No page here. The work is this way." (`writing.md` §Microcopy). Fix: require the first fragment to start with "Not", both fragments ≤ 4 words, and the second to contain no verb (`is|are|was|opens|works|runs|goes`). Threshold 2 stays.

**F19 · C06 skips text over gradients and images — FN.** `effectiveBg` returns `null` when any ancestor has a `background-image`, so the hero text of the home (on `.k2-sky`) is never measured. Fix: for those elements, sample the screenshot behind the text box (`page.screenshot({ clip })`, average colour via a 1×1 canvas) and compute the ratio; report it as "sampled".

**F20 · T06b is time-dependent — fragile.** Home at 17:04 → T06b (lavender → peach); at 19:10 and 23:00 → none. One extra soft tell by day fails the page; by night it passes. Fix: on a gradient whose stops come from custom properties (`style.backgroundImage` contains `var(`), downgrade to `info` and print the hint "declare `allow T06b: <source>` if the colour is computed". Also add `allow T06b: sky from the sun's position` to the home's `<meta name="portfolio-check">` so the reference page follows the skill's own contract.

**F21 · T18b counts nav chrome — FP (minor).** Fjalekryq: "4 families", the fourth is Archivo with 35 chars (the shared nav). Fix: ignore families under 1 % of page characters.

**F22 · M06 on short pages in mobile emulation — FP.** `good-blocked` at 390: "Wheel moved 759 px of 1332 px" on a 2,176 px page with no scroll handling. Fix: scale the expectation by `maxScroll`, and skip M06 when `maxScroll < 3 × height`.

**F23 · C07 under 12 px — FP against the skill's tokens.** Linja and fable-blind: 31 and 54 elements, all 11 px caps labels and mono years that `visual.md` allows. Fix: threshold 11 px; exempt `text-transform: uppercase` or monospace text ≤ 3 words at ≥ 11 px with `letter-spacing ≥ 0.04em`.

**F24 · Research checks dropped.** Not in the checker: invented metrics against `CONTENT.md` (S50; the most important credibility test, feasible with `--facts CONTENT.md` and a number diff), triplets (S37), sticky-blurred-nav-with-CTA (S32; fable-blind's nav has a filled "Download CV" button), name ending with a full stop as a tell (S34; orbit "Rashiti.", fjalekryq), coarse-pointer hover gating (02 rule 14), stagger totals (02 rule 9), `will-change` layer budget (02 rule 15), loops pausing when hidden (02 rule 17), WebGL context under reduced motion (02 rule 18), `data-motion` purpose attribute (02 rule 1), the dark-scheme pass (04 §5b), H05/H06/H07/H10 signals (coherence counts, specificity ratio, rhythm variance, keyboard path to the work). Add S50, S37, S32, the hover-gating and rAF checks first; list the rest in `checks.md` as "by hand" so the omission is deliberate.

## Verdict match: checker vs designer, page by page

| Page | Checker | Designer | Match |
|---|---|---|---|
| `/` home (43) | PASS, 3 △ | Pass; the three △ are the hook, the table face and one figure | Yes, for the wrong reasons (canvas counted as work; T06b by day only) |
| `/drafts/fable-blind` (33) | FAIL, 10 ✗ | Fail: landing-page skeleton, nine kickers, faint boxes, nav CTA | Yes; two of the ✗ are FP (T21, T13 on sourced rows), the rest hold |
| `/drafts/linja` (37, straight 6) | PASS, 0 soft | Weak first read: 11 px identity, no product screen, board is the hero | No. Canvas counted as work, hero misdetected |
| `/drafts/departures` (39, straight 7) | PASS, 1 △ | Weak first read: the name at 72 px, claim at 27 px, no screen | No. Rule 2 untested, canvas counted as work |
| `/work/care-platform` | FAIL (T00) | Pass with notes | No. Three induced warnings |
| `/drafts/orbit` | FAIL (T00) | Fail: giant-name skeleton with a blob | Right verdict, wrong reasons (T30/T23 instead of the name and the blob) |
| `/drafts/fjalekryq` | FAIL, 8 ✗ | A strong rule (the puzzle is the navigation); the index is work | No. C01 0 % because the puzzle is not `data-work`; T27, T07, T12c, T21 are FP |
| fixture `evasion-clean` | PASS (one C05) | Fail on every axis | No. The biggest hole |
