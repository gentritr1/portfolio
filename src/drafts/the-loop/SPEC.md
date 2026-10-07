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

## Look

- Ground `#0b0c0f`, cards `#15171c`. Ink `#f2f3f5`, `#b4b8c1`, `#959aa4` (all 6:1 or more on the ground and on cards). One accent: amber `#ffb547`. Green `#7ef0a6` and red `#ff8f8f` only for pass and fail.
- Public Sans (preloaded by index.html). First screen: two sizes, display 46 px and body 16 px. Gentrit Technical Mono 14 px only for real text from the repos, times and labels.
- Case head ground: `#0f1a2b`.

## Motion

| Part | What moves | How |
| --- | --- | --- |
| Hero | Sidebar, top bar, toolbar, day row, grid columns (Monday to Friday use Sunday's empty pixels), 23 events, the time line, then "Checks passed" and "Approved" | CSS keyframes. Structural pieces are full-screen layers that show their part through `clip-path` (one shared box, so no seams). Events are small boxes that drop 45 % of their height with opacity. 3.25 s, plays once. Then the real `<img>` shows and the pieces unmount. "Replay" runs it again. |
| Steps | The step number and name light up; four stamps under the pinned screen fill in | IntersectionObserver on a band at the middle of the viewport; colour transitions only. The screen is `position: sticky`. No scroll hijack. |
| Ring | A dot goes 01 → 05; at 04 a check fails, the dot goes back to 03 (red dashed arc, "A check fails? Back to the agents."), then 04 passes and 05 | One WAAPI rotation on a zero-size arm (`transform` only). The panel for each station enters with `clip-path`. Plays once when the ring is 60 % on screen. "Stop" during the run, "Play the day again" after. A tap on a station stops the run and shows that station. |
| Arrivals | Headings and lists rise 24 px with opacity; screens open with a `clip-path` curtain | IntersectionObserver, once. |
| Case | The ring on each screen settles (scale 1.12 → 1, opacity); a red line strikes the 16, then the 2 shows | Transitions on arrival. |

Reduced motion: the hero shows the settled screen with both stamps at once; the ring shows station 05, the arc and its label, and all five panels as a list; nothing rises or opens.

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
| Phone apps, Incentiv, own projects | `src/content/projects.ts`, CONTENT.md, STORY.md. Za! uses the GitHub homepage za-game.vercel.app, which redirects to the running server. |

## Files

- `Draft.tsx`: the page and the case switch. `HeroBuild.tsx`: the self-building screen. `Ring.tsx`: the day. `CareCase.tsx`: the case template. `data.ts`: copy and the measured boxes of the week capture. `hooks.ts`, `icons.tsx`, `the-loop.css`.
- Shared changes: `src/lib/firstView.ts`, `src/main.tsx` and `src/App.tsx` load this draft before the first render when it is opened directly, because React holds a Suspense reveal for 300 ms after a fallback. `src/drafts/DraftApp.tsx` adds the band "Loop 12".

## Open items

- The ring shows real text, not a real old-app screen. A screen recording of the old app and the new app with the same test needs the owner's permission (STORY "Visuals missing" 2).
- The check images are 1x captures shown at their own size.
- The pinned steps reuse the hero screen; a later round can give each step its own state of the screen.
