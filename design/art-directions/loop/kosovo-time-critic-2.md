# kosovo-time (live home), case pages and 404: critic and craft QA, round 2

Date: 2026-10-06 (Kosovo about 14:30). Reviewer: fresh critic. Repo head c56330e (clean tree). I changed no repo file.
Scope: `/` (src/drafts/kosovo-time/), `/work/<slug>` (CasePage.tsx, caseShell.tsx, caseCopy.ts, caseLight.ts, case.css), the 404 (NotFoundPage.tsx).
Rubric: DIAGNOSIS.md §4.1 (five points /10, total /50, craft gate pass/fail). Copy rules: PORTFOLIO-RESEARCH.md §2–§3. Owner rules: LOOP-BRIEF.md.

## Method

- Driver: `scratchpad/kt2/probe.mjs` (copy of `ktc/probe.mjs`, plus CDP touch events and a touch scroll gesture). Headless Chrome, SwiftShader. Dev server :5240. Production build: `npx vite build --outDir scratchpad/kt2/dist`, served gzip on :5392 (server stopped at the end).
- Frames (all under `scratchpad/kt2/`): `g/` (6 widths x dawn 07:10, noon 12:24, dusk 17:48, 18:05, night 23:00, with a layout probe for each), `f/` (full pages), `r/` (viewport frames down the page at 1440 and 375), `p/` (recruiter path), `t/` (touch), `k/` (keyboard, reduced motion), `c/` (case pages and 404 at 1440 and 375), `s/` (throttled production loads), `z/` (sun-path labels at night), `d/` (2x density, care case).
- Limits:
  - A fresh headless profile spends 5–12 s starting SwiftShader before the first paint. I report throttled numbers from a warmed browser (same profile, cache off). The cold numbers are a harness cost, not a page cost.
  - `captureBeyondViewport` full-page captures paint some lazy plates and the care chart as empty boxes. Viewport frames (`r/`, `d/care-mid.png`) show all of them render. I do not report the empty boxes.
  - No real phone, no Safari, no screen recording (headless). Motion is judged from mid-frames and the per-state probe, not from fps.

## Measured results

| Check | Result | Evidence |
| --- | --- | --- |
| Horizontal overflow, 375/390/540/1024/1280/1440 x 5 lights | 0 px everywhere | `g/*.log` probe |
| Controls under 44 px (visible, not inert) | none on home, 7 case pages, 404 | `g/`, `case-*.log` |
| CLS: load, fast scroll | 0 (390: 0.0002); case pages 0 | `g/`, `f-*.log`, `case-*.log` |
| Path marks under the disc or the hint | 0 of 30 states | `g/` probe (`overDisc`, `overHint` false) |
| Path marks crossed by the sun curve | yes, at evening and night hours, every width (gate item below) | `z/` |
| Results on the 375 x 812 first screen | yes, y 241–336; lead screens start at y 632 | `g/375-*` |
| Mouse drag | no focus ring (`outline-style: none` while `:focus-visible` is true after a pointer) | `p/p-drag-end.png` |
| Keyboard | Tab reaches the slider, 2 px ring, arrows move 10 min, `aria-valuetext` in words | `k/` |
| Reduced motion | no intro; a jump is instant | `k/` |
| Touch, vertical swipe that starts on the path | page scrolls 250 px, hour stays 13:00 | `t/` |
| Touch, sideways drag on the path | hour moves 13:00 → 19:51 | `t/` |
| Throttled phone, production, warm (375, 150 ms, 200 kB/s, cache off) | 4x CPU: FCP = LCP 2.06 s; 6x CPU: 2.38 s; real faces both; `?gl=0` 2.25 s | `s/w4-*`, `s/w6-*` |
| First load on that phone | 550 kB, 28 requests; images: web-02, grocery-1, reading-1, web-05 only; no Archivo preload | `s/net-w6.json` |
| Page height | 6,113 px at 1440, 7,229 px at 375 (was 7,791 / 8,184) | `f-*.log` |
| Recruiter path | drag to 18:09 → Viva Fresh case lit at 18:09 → Next = Dukagjini → Back → Back lands at y 1877 (click point), clock steady at 18:09, no intro | `p/` |
| Case pages | 0 overflow, CLS 0, no small targets, 178–344 words in `main` | `case-*.log` |

## Previous findings: status

Critic round 1 (kosovo-time-critic.md):

| # | Status | Evidence |
| --- | --- | --- |
| G1 disc and pill over marks | CLOSED for the disc and the pill. A new collision replaced it (gate item 1 below) | `g/` probe, `z/` |
| G2 lazy images defeated | CLOSED. Colour samples in `data.ts`; 550 kB first phone load; real faces in time | `s/` |
| G3 focus box on mouse drag | CLOSED | `p/p-drag-end.png` |
| S1 no result on phone first screen | CLOSED | `g/375-noon.png` |
| S2 1024 orphan "Now it / asks 2." | CLOSED (two lines each, no orphan) | `g/1024-dawn.png` |
| N1 weak first result | CLOSED: "Rebuilding a live care platform while care teams use it." | `data.ts` results |
| N2 care row result (21 words, React) | CLOSED (11 words, no stack) | `data.ts` |
| N3 "the team" in care case | CLOSED: "Built the frontend of the patient profile … with the team" | `d/care-mid.png` |
| N4 own projects too long | CLOSED: games are one-line text; heights above | `r/r1440-06.png` |
| H1 the hour does not travel | PARTLY. Drag and keys travel. A `?at=` link does not (finding 4) | `p/`, `d/` at.json run |
| H2 footer swatches inert | CLOSED (buttons that light the page) | `r/r1440-07.png` |
| T1 noon is the plainest state | OPEN. Noon is still blue to white over paper | `g/1440-noon.png` |
| T2 three display voices | PARTLY. Time is 40 px now; the 24 px serif sentence still stands beside the h1 | `g/1440-*` |
| T3 mono on case pages | PARTLY. Care: no mono. Design System case prints token names in a mono face ("cobalt.600", "action.primary", "button.solid.bg") | `case-1440.log` mono list |
| T4 small marks | CLOSED (space before →, shelf link rows align at y 725 / 773) | `r/r1440-02.png` |
| I1 phone plates shrunk | PARTLY (finding 5) | probe below |
| I2 store frames with bezels on the shelf | CLOSED (in-app crops, no bezel) | `r/r1440-03.png` |
| I3 Bayyinah phone pricing crop | CLOSED (readable list) | `c/c375-bayyinah-tv.jpg` |
| I4 case pages repeat the number | PARTLY. Care shows 16 → 2 twice (the plate under the title and "The numbers") | `c/c1440-care-platform.jpg` |
| P1 old share card | CLOSED (dusk landscape, alt text updated) | `public/og-image.png` |
| P2 theme-color fixed | CLOSED (index.html script, home per frame, case once: `#b29fd6` at 18:09) | `p/` case eval |
| P3 next order differs | CLOSED (Viva Fresh → Dukagjini → Design System v2) | `p/` |
| P4 Back lands 207 px high | CLOSED (lands at the click point) | `p/` back2 |

Devil round 1 (kosovo-time-devil.md):

| Item | Status | Evidence |
| --- | --- | --- |
| Thumb scroll changes the hour | CLOSED | `t/` |
| Faces never return on a slow phone; blank page | CLOSED (FCP 2.1–2.4 s, real faces) | `s/` |
| Clock runs backward; Back replays the intro | CLOSED (first frame shows the intro start; Back is steady) | `clock.ts` constructor, `p/` back2 |
| All plates load at once; Archivo preload | CLOSED | `s/net-w6.json` |
| Motion library for an inert plate | OPEN, low. `react-*.js` 38 kB gzip + motion pieces load at 3.1–3.4 s for the inert care plate (after FCP, so no paint cost) | `s/net-w6.json` |
| No mobile proof on the first screen | CLOSED (Viva Fresh phone screen beside Bayyinah TV) | `g/*` |
| Footer legend says Dusk at night | CLOSED (`light.ts` names Night below the horizon) | code |
| Header loses Work/GitHub at 375 | CLOSED | `g/375-*` |
| Incentiv plate shows marketing page | CLOSED (sign-in and dashboard) | `r/r1440-04.png` |
| "Most screens … moves over only after" claim | CLOSED. Case says "The new app is not live yet." | `c/c1440-care-platform.jpg` |
| Care role on home and case vs "Platforms: Web app and the server behind it" | OPEN (finding 2c) | `caseCopy.ts:126` |
| Product-description results (Bayyinah, Viva Fresh), effort count (Read to Feed) | OPEN (finding 2a) | `data.ts` |
| Read to Feed links go to archive.org | No change needed. The labels say "(archived)", which is true (CONTENT §4) | — |
| Night is the default for US lunch | No change needed. It is the rule of the page, and the night state passes the gate | `g/*-night` |

## Findings (each reproduced)

### Gate

**G1b. At evening and night hours, the sun curve runs through the Sunrise or Sunset label.** When the disc stands just outside a horizon point, `place()` (Draft.tsx 394–413) moves the label to the inner side of its anchor (`-w - 12` for "set", `+12` for "rise"). The inner side is where the curve climbs from the horizon. The function tests the disc and the viewport, never the curve.
- 375 at 23:00: "Sunset 18:10" at x 194–263, `translateX(-82px)`, the curve crosses "Sunset" (`z/z-375-2300.png`).
- 390 at 21:00 and 540 at 23:00: the same (`z/` eval, `g/540-night.png`).
- 1440 at 20:00: "Sunset 18:10" at x 978–1053, the curve strikes through "18:10" (`z/z-1440-2000.png`).
- 1024 at 05:00: "Sunrise 06:38" moved right (`+12px`), the curve crosses "Sunrise" (`z/z-1024-0500.png`).
- Range: from sunset until the disc is about one label width clear (to midnight on a phone), and the mirror before sunrise. For a visitor in New York at lunch (18:30 Kosovo) this is the default first screen.

All other gate checks pass (table above).

### Straight to the point

No change needed. At 375 x 812 the first screen holds the name, the level line, both results and the tops of a web screen and a phone screen. At 1440 the same reads in one look.

### Seniority

- **2a. Three row results describe the product or the effort, not a result.** Rule 1 (≤10 words, result), rule 3.
  - Bayyinah TV: "Members subscribe on the web or in the iPhone and Android apps." (12 words). Its case title says it in 8: "Members subscribe on the web, iPhone or Android."
  - Viva Fresh: "One grocery app, built once for iPhone and Android." (a build choice). Case title: "Shopping in Albanian, live in both app stores." (rule 12: "live" is a result).
  - Read to Feed: "About 14 updates in both app stores." (an effort count; CONTENT voice rule). Case title: "The app remembers the page in every book."
  The better lines already exist on the case pages and the 404 list.
- **2b. Care row result is 11 words** ("Moves to the new app one tested screen at a time."). One word over rule 1. Low.
- **2c. Care role says mobile; care platforms say no mobile.** Home and case role: "Frontend and mobile, full stack since 2026". Case facts: "Platforms: Web app and the server behind it" (`caseCopy.ts:126`). CONTENT §2 has the same role line and names no mobile part. Owner question: name the mobile part, or drop "and mobile" from this one role.

### Original

No change needed. I cannot name a site that copies this rule. It beats designeer.xyz, paco.me and brittanychiang.com on this point; it loses to bruno-simon.com on spectacle, not on fit to the person.

### Hooks

- **4. A `?at=` link loses its hour at the first click.** Open `/?at=17:48`, click "Read the case" on Bayyinah TV: the case is lit at 14:27 (real time). "Work" then opens `/#work` at 14:27. Cause: `openingHour()` (clock.ts) reads `?at` but never calls `remember()`, and the Clock writes `kt-at` only in `set()`. The share card shows dusk, so a shared dusk link is the likely entry.
- The hook sentence holds and now survives the click: "The site is lit by the real sun over Kosovo; drag it to dusk, the screens throw long violet shadows, and the case you open stays at dusk."

### Type and colour

- **T1 (open). Noon is still blue to white over paper** (`g/1440-noon.png`). Dusk and night are mood-board frames; noon, the hour most European visitors see, is a default.
- **T5. "in Kosovo" floats above the time for visitors in Kosovo's time zone.** `.kt-now` centres a two-line column; `.kt-yours` keeps `min-height: 1.3em` when it is empty, so "in Kosovo" sits on the cap line of "12:24", not on its baseline (every `g/1440-*`, `g/375-*` frame; headless zone = Kosovo time). This is the Berlin, Paris and Kosovo visitor.
- Design System case: token names in a mono face (T3 above). Low.

### Images

- **5a. On a phone, the three app screens and the care card are thumbnails.** At 375: Read to Feed, Viva Fresh and Dukagjini plates are 116 px wide, drawn at 0.20 of a 2x source (about 6 px screen text); the care card is drawn at 0.44 (legend about 5 px). Rule 12: 11 px or more (`r/r375-01..03.png`, probe `d/` ph.json). The wide plates are better now (0.61–0.68, about 8 px).
- **5b. The Bayyinah TV phone crop cuts words.** `narrowCrop {x:90,y:180,w:520,h:360}` ends mid-word: "Moses 2: Advent", "Against A" (`r/r375-02.png`). Rule 8.
- **5c. On a 2x screen the hero web screen is upscaled 1.68x.** `web-02.webp` is 1440 px wide; at 1440 CSS px and devicePixelRatio 2 it is drawn at 1213 CSS px (probe `d/` dpr.json). The same holds for every `public/showcase/*` web capture on the case pages (1.7–2.0x). Rule 7 and rule 13 (2x files). This needs new captures, not code.

### Case pages and 404

- Care: 16 → 2 shows twice (plate under the title, then "The numbers"). Low.
- No change needed for the 404: clear title, the bad path in bold, every case with its result line, 44 px rows (`c/c375-no-such-page.jpg`).

### Small marks

- At 1440 night the "Drag the sun up" pill runs to x 1423, outside the 48 px gutter (`g/1440-night.png`). Low.
- Incentiv note "Built the screens; teammates built the wallet." breaks §2 rule 4 (no semicolons on home), but §2 replacement #17 prescribes this exact text. The rules conflict; no change needed until the owner picks one.

## Scores and gate

| Straight | Seniority | Original | Hooks | Type + colour | Total | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| 9 | 8 | 9 | 9 | 8 | **43** | **FAIL** on one item (G1b, the curve through the Sunrise/Sunset label at evening and night hours). Every other gate check passes |

- **Straight 9** (+1): proof on the phone first screen, at every width.
- **Seniority 8** (0): the h1 block is now strong, but 3 of 7 client rows state the product or the effort as the result (2a), and the care role conflicts with its facts (2c).
- **Original 9** (0).
- **Hooks 9** (0, now safe): the hour travels through drag, keys, Back and "Work". Only `?at` links break (4).
- **Type and colour 8** (0): noon is unchanged (T1); a small alignment mark in the clock (T5).

Builder self-score was 44 with a gate pass. I measure 43 and a gate fail on one regression that the label fix introduced.

## Polish list (ordered by score gain; each item is reproduced above)

1. **(Gate) Keep the curve off the horizon labels.** In `place()`, allow only the outer side for "rise" (left of the anchor) and for "set" (right of the anchor). When the outer side is blocked by the disc or the screen edge, hide the label (`data-hidden`) as the code already does for the disc. Capture 375/390/540 at 19:00, 21:00, 23:00, 1024 and 1440 at 05:00, 19:00, 20:00.
2. **(Seniority +1) Use the case titles as the row results.** Bayyinah TV: "Members subscribe on the web, iPhone or Android." Viva Fresh: "Shopping in Albanian, live in both app stores." (move "built once for iPhone and Android" into the line). Read to Feed: "The app remembers the page in every book." (keep "about 14 updates" on the case). Care: "Moves to the new app one tested screen at a time" → 10 words or fewer, for example "Moving to a new app, one tested screen at a time." Ask the owner about the care mobile part (2c) and make the role and the platforms agree.
3. **(Type and colour +1) Make noon a decision, and set "in Kosovo" on the baseline.** Noon key: a deeper sky and a warmer haze, shade with more violet; re-run the contrast script and the footer table. Clock: when `.kt-yours` is empty, remove its reserved line (or `align-items: baseline` on `.kt-now`) so "in Kosovo" sits on the time's baseline; keep the box height so nothing moves when the second line appears.
4. **(Hooks, keeps 9) Remember a `?at=` hour.** In `openingHour()`, store the URL hour in `kt-at` when it is valid. Check: `/?at=17:48` → case → Work stays 17:48.
5. **(Images, protects Straight and Seniority) Phone crops that read.** Below 1024, give each phone app a `narrowCrop` of its proving row at the full row width (319 px at 375), so screen text is 11 px or more: Read to Feed the progress card, Viva Fresh the category row, Dukagjini the search card. Give the care card a phone layout or a crop of the alert points at 0.8 scale or more. Move the Bayyinah `narrowCrop` to whole words (end before the description column, or crop to the episode list only).
6. **(Images, asset task) 2x web captures.** Recapture the `public/showcase/bayyinah/*` and `incentiv/*` screens at 2880 px wide, so the hero and the case screens stay at 1x or less on a 2x screen.
7. **(Small, one pass)** Care case: drop the 16 → 2 plate under the title or the one in "The numbers". Design System case: show colour names, not token names, in the recreation, or set them in the sans. Keep the night pill inside the 48 px gutter. Load the care recreation's motion code only when the care row nears the screen on a phone too (rootMargin is 400 px; the row starts at y ≈ 1000 at 375, so it loads at once).

Expected after 1–4: Straight 9, Seniority 9, Original 9, Hooks 9, Type and colour 9 = 45, gate pass. The real-phone test (LOOP-BRIEF) is still owed.
