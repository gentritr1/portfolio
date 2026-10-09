# THE LOOP (round 12)

One draft to grow step by step. Sources: the round-12 research (RESEARCH.md 4a to 4e, hero H3) and the story bible (STORY.md) in the session scratchpad.

## Page order

1. Hero: the care calendar builds itself. One line under it.
2. How each new screen gets made: a full-width pinned scene (desktop). One step at a time: one snap point for each step, a camera that moves to the part that matters, a rail of four steps.
3. The loop on a real day: one scene. A dial keeps the time of one real day (8 September 2026); a large stage beside it shows the real picture of each of the five stations; the way back from Checks is a red arc that turns green.
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
| Steps | One full-width scene pins for 4 × 100svh of scroll. Letterbox bars close in when it pins: the top bar names the section and the step ("02 / 04"); the bottom bar is the rail of four steps (44 px targets, each a button that goes to its step). Only the current step's text shows (large number, title, one or two lines); it leaves in the scroll's direction and the next one arrives after it, the number through a mask. The screen is the main actor. 01: the old app's week calendar (`old-appointments.webp`) with the calendar's test file; the camera turns and comes in toward the test card; its four lines rise and tick. 02: the new screen splits into four layers (grid, bars, sidebar, events) that stand apart in Z while the camera turns slowly around them, then close into one flat screen. 03: the camera comes in toward the checks; a scan passes; four checks pass; "Route rules" fails (red row, red edge on the screen, "Failed. The work goes back to the agents.", tag "first run"); a second scan ("second run"); it passes. The step text says: "One real failure from 8 September, shown here as an example." 04: the camera turns and lands flat and centred; the "Approved, and merged by a person" mark lands. A soft band of light crosses the screen when the camera lands; a pool of warm light behind the screen follows the target. | Scroll snap: `html:has(.lc-track)` sets `scroll-snap-type: y proximity` and `scroll-padding-top: 0` (the site's 5rem padding would move every snap point); four 1 px markers 100svh apart have `scroll-snap-align: start` and `scroll-snap-stop: always`. The browser does all the snapping: no wheel listener, no JS settle. The step is the nearest marker (read in a rAF after `scroll`). A rail click scrolls smoothly inside the section and jumps (`instant`) from farther away, so a long smooth scroll never passes other sections. Camera: one rig (`.lc-cam`, the only `preserve-3d` level) under `perspective: 1800px`; the frame, the four layers and the cards are its direct, flat children. Each step is one WAAPI run from the rig's current transform: a fast turn (`cubic-bezier(0.77, 0, 0.175, 1)`), then the camera comes in toward the step's target and lands at `transform: none`, so screen text is never resampled at rest. A new step interrupts from the current pose. The first view fades the frame, not an ancestor of the rig. The layers are drawn only in step 02. Back from a case page (`[data-seen]` on the home root): the scene is hidden for 150 ms while the home restores its place, then shows the settled step with no transitions; later steps move as usual. Under 1024 px, and with reduced motion: no snap, no camera; each step has its own flat picture under its text, with the cards under the screen. A pinned portrait version was tried at 375 × 812: the screen is 343 px wide and the cards cover it, so phones keep the stacked pictures. |
| Day | Desktop (1024 px and wider): one rounded scene in two parts. On the left, a dial: 270° of tick marks, five station ticks with their numbers on the rim, a track that fills with an amber arc as the day goes on, and a head with a halo made of radial gradients (no blur). Its centre shows the step, the time and the station name; under the dial the five stations are a list (number, name, time, "failed" or "passed" on Checks). On the right, the stage shows each station large: the old app's compliance list in the browser frame with the note D-2 in front; the test file header, typed line by line, in front of the dimmed old app; the commit with its 13 files as bars; the checks in a terminal that fail, then pass; at 05 the same test on both apps side by side (frames 1 to 6, in step, 1.2 s a frame, once), then both "passed" rows and the "Approved and merged" seal. At 04 the head goes back to 03 with a red tail, the stage says "A check failed. The work is back with the agents.", a red dashed arc with an arrow stays inside the track, and it turns green when the check passes. A caption under the stage gives the line and its source. Under 1024 px: the step and the time on top, then a horizontal time rail (amber fill, a head, five 48 px stops, the return arc above 03 to 04), then the picture at full width; at 05 the two apps share one frame, the old app on the left half and the new app on the right half. | One WAAPI run of 17.8 s drives the dial arm (`rotate`), the rail head (`translateX` in % of the rail) and the rail fill (`scaleX`); the tails and the red head only change `opacity`. The arc segments fade in when the head arrives. The stage switches when the head leaves a station, so the picture moves while the head moves: the new shot comes in from the side the head goes to (from the right going forward, from the left on the way back) with `translate3d` and `rotateY` under `perspective` 1800 px, 760 ms entry, 240 ms exit; at rest every shot has no transform, so the pictures are sharp. Rows rise with a 60 ms stagger, file bars grow with `scaleX`, the test lines type in with `clip-path` steps. The twin frames load only after the head reaches 04 (12 files, about 360 KB, the 1080 px copies). Plays once when the scene is 50 % on screen. When the home mounts again in the same page load (for example "Back to the loop" from a case), the day shows settled at 05 (arc full, check passed, the twin on frame 6, the seal shown); no run and no transition starts. "Stop" during the run, "Play the day again" after. A tap on a station in the list or on the rail stops the run and shows that station. No left accent bars: the current station has an amber tint and an amber number. |
| Arrivals | Lists and number groups rise 24 px with opacity; screens open with a `clip-path` curtain | IntersectionObserver, once. |
| Case | The ring on each screen settles (scale 1.12 → 1, opacity); a red line strikes the 16, then the 2 shows | Transitions on arrival. |

Reduced motion: the hero shows the settled screen with both stamps at once; the steps show one flat, complete picture under each step; the day shows the dial (or the rail) at 05 with the green return arc, and all five stations as a list, each with its caption and its still picture (the twin shows frame 6 and the seal); nothing rises or opens.

Craft rules for the stages and the day: only `transform`, `opacity` and the existing `clip-path`; no blur of any kind, and no blurred shadow inside a moving 3D stage (it is drawn again on each frame), so the stage's shadow is a still floor under it; an exit takes 180 to 240 ms, an entry 400 ms or more; groups stagger by 60 to 70 ms; on-screen moves use `cubic-bezier(0.77, 0, 0.175, 1)`, entries `cubic-bezier(0.22, 1, 0.36, 1)`; no `ease-in`, no bounce, nothing grows from scale 0.

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

- `Draft.tsx`: the page and the case switch. `CaseParts.tsx`: ring, chapter, top bar, next case and end of a case. `DsCase.tsx`, `BayyinahCase.tsx`, `cases.css`: the two newer cases. `HeroBuild.tsx`: the self-building screen. `Steps.tsx`: the steps and their 3D stage. `Ring.tsx` and `ring.css`: the day. `OldScreen.tsx`: the old app's capture or its empty slot. `stage.css`: the steps. `CareCase.tsx`: the case template. `data.ts`: copy and the measured boxes of the week capture. `hooks.ts`, `icons.tsx`, `the-loop.css`.
- Shared changes: `src/lib/firstView.ts`, `src/main.tsx` and `src/App.tsx` load this draft before the first render when it is opened directly, because React holds a Suspense reveal for 300 ms after a fallback. `src/drafts/DraftApp.tsx` adds the band "Loop 12".

## Open items

- The Bayyinah TV store images have no flat phone screen: each is a marketing image with a tilted or exploded phone. So they show whole, as images, not in `PhoneFrame` (which needs a measured flat screen in `phoneScreens.ts`).
- The status badges capture is mostly empty canvas; at 375 px the badges are small.

- Old-app captures come from `public/showcase/care/old-new/` (see its `manifest.json`): step 01 uses `old-appointments`, station 01 uses `old-compliance`, station 05 uses `old-01..06` and `new-01..06`. A missing file shows an empty slot named "Old app screen", never a drawing. The day uses the 1080 px copies of the frame sequences; they load only after the head reaches station 04 (about 360 KB for all twelve).
- The checks card in step 03 shows the real check names; the red-then-green "Route rules" row is the compliance screen's real failure, shown as an example on the calendar screen.
- The check images are 1x captures shown at their own size.
