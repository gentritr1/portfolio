# THE LOOP (round 12)

One draft to grow step by step. Sources: the round-12 research (RESEARCH.md 4a to 4e, hero H3) and the story bible (STORY.md) in the session scratchpad.

## Page order

1. Hero: the care calendar builds itself. One line under it.
2. How each new screen gets made: four steps light up; the finished screen stays pinned on the right (desktop).
3. The loop on a real day: a ring of five stations, one real day (8 September 2026), real text for each station, the way back from Checks.
4. Design System v2.
5. Apps for iPhone and Android.
6. Incentiv.
7. Own projects.
8. Many fields, three platforms (breadth table, learns fast, AI with control).
9. Footer with contact.

Care case: `/drafts/the-loop/care-platform` (same chunk). It is the case template: full-bleed head with a large real screen, chapters "What it does", "The problem", "What the team built", "What changed", a ring on the proving part of each screen, the 16 → 2 figure, stack pills, "For engineers".

Design System v2 case: `/drafts/the-loop/design-system` (`DsCase.tsx`). Head: the Storybook date picker. Chapters: what a design system is (date range picker, ring on the presets), the problem (copies of each part in the old app; status badges, ring on the colour families), what the team built (five steps from research to merge; the check that must fail), what changed (96.6 % with before and after bars; 41, 868, 22). Linked from the home section "Design System v2".

Bayyinah TV case: `/drafts/the-loop/bayyinah-tv` (`BayyinahCase.tsx`). Head: the public library page. Chapters: what it does (series page, ring on an episode card), the problem (members on web, iPhone and Android, three ways to pay, Arabic; pricing page, ring on the plan card), what the team built (one web app, rebuilt from an empty template; the Arabic library beside two App Store images), what changed (34 pages; 270+, 2 languages, 3 ways to pay; store links). Linked from the Bayyinah TV card in "Apps for iPhone and Android".

Each case ends with "Next case": care → design system → Bayyinah TV → care. Shared case parts are in `CaseParts.tsx`; case styles are in `cases.css`.

## Look

- Ground `#0b0c0f`, cards `#15171c`. Ink `#f2f3f5`, `#b4b8c1`, `#959aa4` (all 6:1 or more on the ground and on cards). One accent: amber `#ffb547`. Green `#7ef0a6` and red `#ff8f8f` only for pass and fail.
- Public Sans (preloaded by index.html). First screen: two sizes, display 46 px and body 16 px. Gentrit Technical Mono 14 px only for real text from the repos, times and labels.
- Case head ground: care `#0f1a2b`, Design System v2 `#191a33`, Bayyinah TV `#47262d`. On the last two, head text is `#e2dfe6` and labels `#c2bcc8` (7:1 or more).

## Motion

| Part | What moves | How |
| --- | --- | --- |
| Hero | Sidebar, top bar, toolbar, day row, grid columns (Monday to Friday use Sunday's empty pixels), 23 events, the time line, then "Checks passed" and "Approved" | CSS keyframes. Structural pieces are full-screen layers that show their part through `clip-path` (one shared box, so no seams). Events are small boxes that drop 45 % of their height with opacity. 3.25 s, plays once. Then the real `<img>` shows and the pieces unmount. "Replay" runs it again. |
| Steps | One 3D stage, pinned beside the steps. 01: the old app's week calendar (`old-appointments.webp`, the same screen that steps 02 to 04 show in the new app) with the calendar's test file in front; its four lines rise and tick. 02: the new screen splits into four layers (grid, bars, sidebar, events) that tilt and float apart in Z, then close into one flat screen. 03: a scan line passes twice; a list of five checks fills in; "Route rules" goes red ("Failed. The work goes back to the agents."), then green after the second pass. 04: the stage leans and turns to face front; the "Approved, and merged by a person" mark lands. A four-part bar and one caption under the stage show the step. | An IntersectionObserver on a line at the middle of the viewport picks the step. Each step starts one WAAPI run (`transform`, `opacity`); every run ends on the flat rest state that CSS draws, and a new step starts from the stage's current pose, so a fast scroll never jumps. The layers reuse the hero's pieces and file. `perspective` 1700 px, `preserve-3d`. No scroll hijack. Under 1024 px, and with reduced motion, each step has its own flat picture under its text; the cards sit under the screen. |
| Ring | The five stations stand as small cards on a ring that lies on a tilted plane (rotateX 58°, real perspective). A dot travels the ring with a soft amber trail; at 04 the card says "failed", the dot goes back to 03 with a red trail and the dashed arc, then 04 says "passed" and the dot reaches 05. The panel beside it shows each station: the old app's screen with row D-2, the test file header line by line, the 13 changed files as growing bars, the checks failing then passing, the same test on both apps (frames 1 to 6 of the old app and the new app side by side, in step, 1.2 s a frame, once, then the last frame) and the merge seal. | One WAAPI run on a zero-size arm (`rotate`), two trail elements (conic gradient in a ring mask) that only fade. Cards are placed in 2D where their point on the tilted ring lands, so their text stays sharp. The panel enters with `clip-path`; its rows rise with a 60 ms stagger. Plays once when the ring is 60 % on screen. "Stop" during the run, "Play the day again" after. A tap on a card stops the run and shows that station. |
| Arrivals | Headings and lists rise 24 px with opacity; screens open with a `clip-path` curtain | IntersectionObserver, once. |
| Case | The ring on each screen settles (scale 1.12 → 1, opacity); a red line strikes the 16, then the 2 shows | Transitions on arrival. |

Reduced motion: the hero shows the settled screen with both stamps at once; the steps show one flat, complete picture under each step; the ring shows station 05, the arc and its label, and all five panels as a list; nothing rises or opens.

Craft rules for the stage and the ring: only `transform`, `opacity` and the existing `clip-path`; no blurred shadow inside a moving 3D stage (it is drawn again on each frame), so the stage's shadow is a still floor under it; an exit takes 180 ms, an entry 400 ms or more; groups stagger by 60 to 70 ms; on-screen moves use `cubic-bezier(0.77, 0, 0.175, 1)`, entries `cubic-bezier(0.22, 1, 0.36, 1)`; no `ease-in`, no bounce, nothing grows from scale 0.

## Facts and sources

| Line | Source |
| --- | --- |
| One screen from first note to merged in one working day | React repo `origin/main`: 9f5b5237 11:37, 03cc46ff 12:01, e96b9afc 12:55, 98b611fe 15:11, 1cc728cc 15:25, 769bf99f 15:40 (2026-09-08). Owner approved the line. |
| Station texts | `migration/inventories/compliance-tracker.md` row D-2; `tests/parity/compliance-tracker.spec.ts` header; commit e96b9afc stat and trailer; `migration/reviews/compliance-tracker/build.md` Round 1 (the `FEATURE_SOURCE_BEFORE_BUILDING` failure and the re-run) and the local two-app run. No tenant name, person name, PR number or count is shown. |
| The same test passed on both apps | build.md "Local dual-origin run". The route is `building`; the page never says "verified" or "live". |
| 16 → 2, the report no longer times out | Backend commit 4745ee71a. |
| 41 components, 868 design values, 22 releases in about 8.5 weeks | design-system-v2 `origin/main` f7e78ed: `docs/lifecycle.json` (41), `tokens/source/*.tokens.json` (130 + 205 + 533), tags v0.1.0 (2026-07-29) to v1.1.6 (2026-09-27). |
| 96.6 % less JavaScript | design-system-v2 CHANGELOG 0.6.0 and ADR-0021. |
| The check that must fail | design-system-v2 `test/evidence/visual-snapshot.spec.js` "negative control: a pixel change is caught"; the three images are crops of its expected, actual and diff output (`public/showcase/design-system/check-*.webp`). |
| Design System v2 case: three levels of design values build CSS, typed modules and the Figma bundle | design-system-v2 `origin/main` f7e78ed: `docs/adr/0001-tokens-as-code.md`. |
| Design System v2 case: 186,949 bytes before, 6,386 bytes after | design-system-v2 CHANGELOG 0.6.0 (line 6511) and `docs/adr/0021-a-consumer-pays-for-what-it-uses.md` lines 17, 47, 104. |
| Design System v2 case: five systems studied; the old app had copies of parts and colours typed by hand | `docs/research/benchmark-leading-design-systems.md`; `docs/research/frontend-antipattern-audit.md` (no count is shown). |
| Design System v2 case: the order of authority, the negative controls, WCAG 2.1 AA bar | `docs/SKILLS-MAP.md` "Precedence"; `test/evidence/visual-snapshot.spec.js` line 349; `tools/tokens/tamper.mjs`; `docs/accessibility-standard.md` §1. Stack from `package.json` (React 19.2, Storybook 10, Style Dictionary, Playwright, axe-core, Changesets). |
| Design System v2 case: Role line | STORY.md 1b "Authorship": the owner is the only author of `docs/research/`, `tools/skills/contract.json` and `docs/SKILLS-MAP.md`; a teammate made most commits. |
| Bayyinah TV case: 34 pages, 270+ parts, 25 stores, English and Arabic right to left, web, Apple and Google payments, gifts, promo codes, live chat with moderation, paywall, the apps run the same web app, role "Frontend, core team" | `src/content/projects.ts` row `bayyinah-tv`; CONTENT.md §3; STORY.md Pillar 2. The page does not claim work on the native shells. |
| Bayyinah TV case: screens | Public pages of bayyinahtv.com (`public/showcase/bayyinah/web-02, 03, 05, 06`) and App Store listing images (`store-02`, `store-05`), shown whole. |
| Phone apps, Incentiv, own projects | `src/content/projects.ts`, CONTENT.md, STORY.md. Za! uses the GitHub homepage za-game.vercel.app, which redirects to the running server. |

## Files

- `Draft.tsx`: the page and the case switch. `CaseParts.tsx`: ring, chapter, top bar, next case and end of a case. `DsCase.tsx`, `BayyinahCase.tsx`, `cases.css`: the two newer cases. `HeroBuild.tsx`: the self-building screen. `Steps.tsx`: the steps and their 3D stage. `Ring.tsx`: the day. `OldScreen.tsx`: the old app's capture or its empty slot. `stage.css`: the steps and the ring. `CareCase.tsx`: the case template. `data.ts`: copy and the measured boxes of the week capture. `hooks.ts`, `icons.tsx`, `the-loop.css`.
- Shared changes: `src/lib/firstView.ts`, `src/main.tsx` and `src/App.tsx` load this draft before the first render when it is opened directly, because React holds a Suspense reveal for 300 ms after a fallback. `src/drafts/DraftApp.tsx` adds the band "Loop 12".

## Open items

- The Bayyinah TV store images have no flat phone screen: each is a marketing image with a tilted or exploded phone. So they show whole, as images, not in `PhoneFrame` (which needs a measured flat screen in `phoneScreens.ts`).
- The status badges capture is mostly empty canvas; at 375 px the badges are small.

- Old-app captures come from `public/showcase/care/old-new/` (see its `manifest.json`): step 01 uses `old-appointments`, station 01 uses `old-compliance`, station 05 uses `old-01..06` and `new-01..06`. A missing file shows an empty slot named "Old app screen", never a drawing. The frame sequences have no 1080 px copies; they load only after station 05 is first shown (about 1.3 MB for all twelve). 1080 px copies would make phones lighter.
- The checks card in step 03 shows the real check names; the red-then-green "Route rules" row is the compliance screen's real failure, shown as an example on the calendar screen.
- The check images are 1x captures shown at their own size.
