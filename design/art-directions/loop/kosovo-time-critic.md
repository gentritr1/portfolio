# kosovo-time (live home), case pages and 404: critic and craft QA

Date: 2026-10-06 (Kosovo about 13:00). Reviewer: fresh critic, no earlier contact with this work.
Scope: `/` (src/drafts/kosovo-time/), `/work/<slug>` (src/pages/CasePage.tsx, case.css, caseCopy.ts, caseLight.ts, caseShell.tsx), the 404 (src/pages/NotFoundPage.tsx). Repo head 50d857b. I changed no repo file.

Rubric: DIAGNOSIS.md §4.1. Five points /10, total /50, and the craft gate (pass or fail). Copy rules: PORTFOLIO-RESEARCH.md §2 and §3. Owner rules: LOOP-BRIEF.md.

## Method

- Driver: an extended copy of `seq.mjs` (`scratchpad/ktc/probe.mjs`: full-page capture, CPU and network throttle, CLS/LCP/FCP observers, keyboard events, a per-frame layout logger). Headless Chrome, SwiftShader, 1x, PORT 9751. Dev server :5240. A production build in `scratchpad/ktc/dist`, served gzip on :5391, for load cost.
- Frames: `scratchpad/ktc/m1` (4 hours x 6 widths), `m2` (full pages), `m3`/`m4` (rows at 1440), `m5`–`m7`, `m18`/`m19` (recruiter path, case pages, 404), `m13` (drag mid-frames), `m14` (tab order), `m15` (no WebGL), `m16` (reduced motion, intro), `m17` (1024 and 1280 full). Contact sheets: `scratchpad/ktc/sheets/`.
- Limits:
  - Headless rAF runs at a low, uneven rate, so I could not judge intro smoothness from frame timing. I proved layout stability from a per-frame logger, not from fps.
  - The first cold load in a new browser profile paints at about 5.2 s (SwiftShader start). Warm loads paint at 0.7–0.8 s. I report the warm numbers and the throttled run.
  - No real phone, no Safari.

## Measured results

| Check | Result | Evidence |
| --- | --- | --- |
| Horizontal overflow, 375–1440, four lights | 0 px everywhere | `m1` probe |
| Controls under 44 px (visible, not inert) | none on home, case pages, 404 | `m1`, `m6` probes |
| CLS on load | 0 warm; 0.001–0.005 on the first cold load of each width | `m1` probe |
| CLS on fast scroll (400 px steps, 50 ms) | 0 at 1440 and 375, dev and production | `m2`, `m12` |
| Layout during sun drag (175 frames) | h1, results, time, sentence, jumps, lead plate: one rect each, no shift | `m13` stability log |
| "Drag the sun" pill inside the screen | yes at every hour and width (closure regression is closed) | `m1` hint bounds |
| Focus | visible 2 px ring on every stop; order: name, nav, Now…Night, slider, case links | `m14` |
| Reduced motion | no intro; a jump is instant (17:48 → 23:00 in one frame) | `m16` |
| No WebGL (`--disable-webgl`) | all grounds fall back to SVG; shadows correct | `m15`, `sheet-nogl.png` |
| Font wait | 220 ms, then fallback for the visit. On 4x CPU + 200 kB/s + 150 ms RTT the faces miss it: the phone visit stays in Georgia/Arial | `m12` vitals-375-slow `fonts:"fallback"` |
| Home JS (gzip, production) | 167 kB total incl. react-vendor 79 kB, Draft 16 kB, recreation + motion chunks ~50 kB. Draft CSS 4 kB | `m12` res |
| Home images on load | 14 screenshots, 939 kB, all fetched at load at every width, without scroll | `m12` res-1440-first, res-375 |
| Home fonts | 188 kB at 1440: Archivo 101 kB (preloaded by index.html, unused on this page), Fraunces 63 kB, Public Sans 25 kB | `m12` |
| Throttled phone (4x CPU, 200 kB/s, 150 ms) | FCP 2.2 s, LCP 10.8 s (an image) | `m12` vitals-375-slow |
| Page height | 7,791 px at 1440, 8,184 px at 375 (closure: 7,743 / 7,848) | `m1` |
| Case pages | 0 overflow, no small targets, CLS 0; 2,600–3,500 px | `m6` |

## Findings

Each finding is reproduced. Evidence is a frame, a probe output, or a code line.

### Gate defects

- **G1. The sun hides its own labels.** The disc and the "Drag the sun" pill cover the path marks at the two hours the brief names. Dusk: "Sunset 18:10" is under the disc and pill at 375, 390, 540, 1280 and 1440 (`m1/*-dusk.png`, `m2/1440-dusk1748.png`, `sheets/sheet-nogl.png`). Noon: "Noon 12:24" is under the disc at 1024 and 1440 (`m1/1024-noon.png`, `1440-noon.png`). Dawn: "Sunrise" under the disc at 375 (`m1/375-dawn.png`). Cause: the marks are placed beside the horizon points with no check against the disc (`Draft.tsx` SunPath marks, `kosovo-time.css` `.kt-path-mark`).
- **G2. `loading="lazy"` does nothing on the home page.** `Ground` calls `sampleScreen(src)` on mount for every plate (`Draft.tsx` Ground effect; `scene.ts:88–110`), and `sampleScreen` creates `new Image()` for each one. Result: 939 kB of screenshots load at first paint on a phone. On the throttled run they compete with the faces, the faces miss the 220 ms wait, and the LCP image paints at 10.8 s.
- **G3. A mouse drag draws a hard focus box around the whole sun path.** `onDown` calls `focus()`, and `.kt-path:focus-visible` paints a 2 px ink rectangle around the 1344 × 116 px track during every mouse drag (`sheets/sheet-drag.png`, all four frames). It reads as a debug outline over the hero.

### Straight to the point

- **S1. Phone first screen has no result.** At 375×812 the results start at y = 814, below the fold; at 390 the first line is cut at the bottom edge (`m1/390-noon.png`). The first phone screen spends about 200 px on the time, the sun sentence and five jump chips, which are the hook, but the two facts a recruiter scores are gone.
- **S2. 1024 × 768: the second result breaks "Now it / asks 2."** (`sheets/sheet-mid.png`). The h1 takes three lines and the right column is half empty.

### Seniority

- **N1. The first result is the weakest line on the page.** "Mobile apps shipped to both app stores." has no scope, no product, no count. The strongest true facts are a live platform rebuilt screen by screen and 16 → 2. The rewrite fact appears only in the care row.
- **N2. Care row result breaks two copy rules.** "Most screens are already rebuilt in React. A screen moves over only after it passes the same tests in both apps." is 21 words (rule 1: 10 or fewer) and names React in a result (rule 6).
- **N3. Care case page says "the team" for scope.** "From 2023 the team built the features…" (`caseCopy.ts`, care-platform, "What was built"). Rule 10 asks for his scope, not the team's.
- **N4. Own projects outweigh client work in length.** Client work runs 1,002 → 4,318 px; own projects run 4,318 → 7,095 px at 1440. 13 projects show on the home page (rule 20: 6 to 10). Four own projects (Offday, FJALË, Za!, Morse) take a full 680 px plate each with identical rows (`m4/za.png`).

### Original and hooks

- **H1. The hour does not travel.** Drag to dusk (or open `/?at=17:48`), click "Read the case": the case page is lit at the real hour ("Lit by the sun over Kosovo at 13:14", `m19`). "All work" returns to `/` at y = 0 without the hour, and the intro runs again. The idea breaks at the first click a recruiter makes.
- **H2. The footer swatches look like controls and do nothing.** Dawn, Day, Dusk and Night (`m4/foot.png`) are the most "mood-board" part of the page, but a click does not light the page.
- The hook sentence holds: "The site is lit by the real sun over Kosovo. Drag it to dusk and the screens throw long violet shadows." The dusk state at 1440 (`m2/1440-dusk1748.png`) is the best frame of the page.

### Type and colour

- **T1. Noon is the default for most European recruiters and it is the plainest state.** A blue-to-white sky over paper (`m1/1440-noon.png`). Dusk is a 9; noon is a 7.
- **T2. Three display sizes compete in the first screen.** h1 64 px, time 52 px, sun sentence 24 px serif, side by side. The time and the h1 fight for first read at 1024–1440.
- **T3. The care recreation brings a mono face onto the case page** ("Care manager", "mmHg", "Alert", "Last sync", `m7/care-chart-375.png`). The home page overrides `.font-mono`; `case.css` does not. SPEC: "No mono."
- **T4. Small marks:** "Read the case→" shows no space before the arrow (`m4/shelf.png`). In the three-phone shelf the link rows do not align when one result wraps (Viva Fresh). `text-wrap: balance` is absent on result lines.

### Images and copy rules

- **I1. Phone wide plates are desktop screens shrunk to about 340 px** (Bayyinah series, Design System, Incentiv, OFFBEAT, FORM, Offday, FJALË, Za!, Morse; `sheets/sl-375-noon.png`). Screen text is 3–4 px. Rule 12: crop the proving part on a phone; never shrink the desktop crop. The lead plate already does this (`leadClient.narrowCrop`).
- **I2. Store frames with phone mockups on the home shelf.** Viva Fresh and Dukagjini show a device bezel and marketing headlines ("Discover new books you will love!") (`m4/shelf.png`). Rule 10: no device mockups. The case pages already crop these to the screen.
- **I3. Bayyinah case, phone: the pricing crop shows four ticks with no labels** (`sheets/sl-bay.png`, first column). The crop `{x:964…}` cuts off the feature names.
- **I4. Case pages repeat their number.** Care states 16 → 2 five times (title, plate, text, proof, "The numbers"). Design System on a phone shows 96.6% and 20 three times each (plate, proof, numbers) (`sheets/sl-ds.png`).

### Shell and sharing

- **P1. The share card is another site.** `index.html` og:image is the old graphite card with a dithered sphere and Archivo (`public/og-image.png`). A link pasted into LinkedIn or Slack shows a different identity before the visitor sees the sun.
- **P2. `theme-color` is #101112 for every hour.** Mobile browser chrome stays near-black over the noon paper page. Nothing in kosovo-time updates it.
- **P3. Next-case order differs from the home order.** Home: Viva Fresh → Dukagjini. Case "Next project" from Viva Fresh: Incentiv (`m18`).
- **P4. Back restores the home page 207 px above where the visitor left** (1500 → 1293, `m5` back-back).

### What is good (no change needed)

- CLS 0 on load, scroll and drag. 44 px targets everywhere. Visible focus. Reduced motion and no-WebGL both work.
- The sun-path slider is a real control: arrow keys, Page keys, Home/End, `aria-valuetext` in words.
- Text never stands on the floor; every light passes the stated contrast table, and the footer prints it.
- Case pages are calm, plain and follow the home type and light. The 404 is clear and lists every case.
- The facts I checked against CONTENT.md hold (5+ years, two rewrites, about 200 Offday tests, 21,000 words, 2 to 8 players, about 14 updates).

## Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 8 | 8 | 9 | 9 | 8 | **42** | **FAIL** (G1 labels hidden at dusk and noon at every width; G2 lazy images defeated; G3 drag focus box). All three are one-pass fixes |

- **Straight 8.** At 1440 it is a 9: name, place, level, two results and a public client screen. On a 375 phone the results fall below the fold (S1). A recruiter on a phone sees the hook before the proof.
- **Seniority 8.** True, scoped role lines. But the first result is generic (N1), the care result breaks the copy rules (N2), and the own projects outweigh the client work (N4).
- **Original 9.** I cannot name a site this copies. The rule could not exist for another developer.
- **Hooks 9.** Hook sentence written above. It loses force at the first click (H1); fix H1 to keep the 9 safe.
- **Type and colour 8.** Dusk and night are mood-board frames. Noon, the most common hour, is not (T1), and the first screen has three display voices (T2).

Change from closure (43): Straight −1, measured on the phone first screen, which the closure scored at desktop.

## Polish list (one pass each, ordered by score gain)

Gate items first, because a fail blocks the switch. Then score items, largest gain first.

1. **(Gate G1) Keep the path marks clear of the disc.** In `SunPath`, hide a mark (opacity 0, no layout change) while the disc's box overlaps it, or move the mark to the other side of its tick. Place the pill on the side away from the nearest mark. Capture 375/390/540/1024/1280/1440 at noon, 17:48 and 18:05.
2. **(Gate G2) Do not fetch screenshots to sample them.** Precompute the 16 sample cells for each plate at build time and store them in `data.ts` (48 numbers each), or call `sampleScreen` only when the ground first intersects. Also remove the `Archivo.woff2` preload from `index.html` for `/` (101 kB, unused). Re-measure on 4x CPU + 200 kB/s: target LCP under 4 s and the real faces in time.
3. **(Gate G3) No focus box on a mouse drag.** Call `focus({ preventScroll: true, focusVisible: false })` in `onDown`, or style the ring only for keyboard focus (`:focus-visible` after a key event). Keep the ring for keys.
4. **(Straight +1) Put the proof on the phone first screen.** Below 640 px, move the two result lines into the sky under the subline (where they are on desktop), and shrink the jump chips to one row of 36 px text with 44 px hit areas, or move them under the sun path. Check at 375×812 and 390×844 that both results and the top of the Bayyinah plate show.
5. **(Seniority +1) Rewrite three lines.**
   - First result: "Rebuilt a live care platform, one screen at a time." (CONTENT §2: route-by-route move.) Keep "One report asked the database 16 times. Now it asks 2." as the second.
   - Care row result (≤10 words, no stack): "Moves to the new app one tested screen at a time." Put "React" in the role line.
   - Care case "What was built": state his part first ("Built the patient profile, care plans, labs and vitals, claims, calls and chat screens with the team."), then the rule about organizations.
6. **(Seniority, supports +1) Compress the own projects.** Keep OFFBEAT and FORM as the pair. Show Offday, FJALË, Za! and Morse as a 2×2 grid of smaller plates (about 320 px wide) with title + one line + link. Target page height under 6,500 px at 1440 and under 7,000 px at 375. Home then shows 9 large items, inside rule 20.
7. **(Type and colour +1) Make noon a decision.** Give the noon key a deeper, warmer sky (for example a cerulean top and a warm haze, not blue to white), and let the noon shade carry more violet so the shadow is the colour of the page at midday, as it is at dusk. Re-run the contrast script for every quarter degree and update the footer table. Then reduce the first-screen voices: set the time at the sun sentence size scale (for example 40 px) so the h1 is the only display line.
8. **(Hooks, keeps 9) Carry the hour.** Put the visitor's chosen hour in the case links (`/work/<slug>?at=HH:MM` when not live) or in `sessionStorage`; read it in `litInstant()`. "All work" goes to `/#<row-id>` with the same hour, and the home page skips the intro when it returns with an hour. Make the footer swatches buttons that light the page for that hour (same handler as the jump chips).
9. **(Copy and image rules, protects Straight and Seniority) Phone crops for wide plates.** Give each wide plate a `narrowCrop` of the proving part at no less than 11 px text, as `leadClient` has. Replace the Viva Fresh and Dukagjini store frames on the home shelf with the screen crops the case pages already use (no bezels, no marketing headline).
10. **(Case pages) Cut the repeats.** Care: drop the 16 → 2 plate from "The result" (the title says it) and lead with the live vitals card; keep 16 → 2 once in "The numbers". Design System: on a phone, show the number plates only in "The numbers". Bayyinah phone pricing crop: include the feature names or crop to the Premium price and the trial button only. Override `.font-mono` in `case.css` the way the home page does.
11. **(Shell) One identity before the click.** Render a 1200×630 dusk frame of the home page as `og-image.png` and update the alt text. Set `<meta name="theme-color">` from `--kt-sky` on each light change (home) and once on open (case pages, 404).
12. **(Small marks, one pass)** Non-breaking space before "→" in "Read the case". Align the shelf link rows to the bottom of the text block (subgrid or a fixed text height). `text-wrap: balance` on `.kt-results li` and `.kt-row-result`. Make "Next project" follow the home order. Restore the scroll position after the lazy home chunk mounts (or return to `#<row-id>`).
13. **(404, optional)** Keep it. Move the lit line under the sentence so it does not float in the right column, and link "Gentrit Rashiti" to `/`.

Expected after 1–8: Straight 9, Seniority 9, Original 9, Hooks 9, Type and colour 9 = 45, gate pass, if the real-phone test (closure step 2) also passes.
