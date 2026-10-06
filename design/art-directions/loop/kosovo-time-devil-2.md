# Devil's advocate, round 2: kosovo-time as the live home page

Date: 2026-10-06 (Kosovo about 14:30). Commit on disk: c56330e (home polish) on top of 7f6e066 (case pages and 404).
Scope: `/` (src/drafts/kosovo-time/), `/work/<slug>`, the 404.

## Method and limits

- Tool: a copy of `offday/seq.mjs` with time zone, CPU and network throttle, cache off, init script, touch swipe and URL block steps (`scratchpad/kt2dev/seq.mjs`). PORT 9772. Dev server 5240.
- Production `dist/` (built 14:03, one minute before c56330e) served with gzip on 127.0.0.1:5241 for the load numbers. I stopped that server at the end.
- Frames: `scratchpad/kt2dev/out/<run>/`. I name each frame where I use it.
- Headless Chrome uses SwiftShader (software GL). The slow-phone numbers are an emulation (6x CPU, 150 ms, 1.6 Mbit/s), not a real phone. Where a number depends on SwiftShader, I say so.
- Claims checked against CONTENT.md, `src/content/*`, `src/pages/caseCopy.ts`, and PLAN.md + ADR-0017 of vianova-dashboard-react.

---

## 1. Status of the previous devil's objections (kosovo-time-devil.md)

| Previous objection | Status | Evidence |
| --- | --- | --- |
| No result on the first phone screen (results at y 814) | **Fixed** | `ny/ny-0.png`: both results at y 241–337 |
| Header hides Work and GitHub at 375 | **Fixed** | probe `nav`: Work, GitHub, Email, CV at 375 |
| No mobile picture on the first screen | **Fixed** | Viva Fresh phone plate beside Bayyinah (`be/be-0.png`, `ny/ny-0.png`) |
| Pill covers "Noon" at 09:00 | **Fixed** | `be/be-0.png`; overlap sweep (5 widths × 14 hours): 0 text overlaps between pill, marks and disc |
| Disc covers "Sun" of "Sunset" at 18:30 | **Changed, not fixed** | the disc now leaves the label, but the curve line now cuts the label (see §3, V1) |
| Focus box after a mouse drag | **Fixed** | `drag/after-drag.png`; `:focus-visible` true but outline `none` while `data-pointer` is set |
| Vertical thumb scroll changes the hour (P1) | **Fixed** | swipe (60,600)→(64,330): hour 13:00 → 13:00, scrollY 0 → 255. A sideways swipe still moves the sun (13:00 → 17:30) |
| Faces that miss 220 ms never return (P3) | **Fixed** | slow runs: `data-fonts="real"`, h1 in "KT Fraunces" |
| Blank page until faces resolve (P4) | **Partly fixed** | DOM with real faces at 2.9–4.4 s; first contentful paint 4.9–6.7 s in the emulation (§3, P1) |
| Clock runs backward (P5) | **Fixed** | constructor starts at target − 90 min; samples only go forward |
| Back replays the intro (P6) | **Fixed** | `case.json`: Back → `/` at "17:48", scrollY 800 in the first sampled frame, no intro |
| All plate images load at once (P7) | **Fixed** | phone first load: 4 images, 274 kB; 27 requests, 563 kB total (gzip) |
| Archivo preload (P8) | **Fixed** | `index.html` preloads Fraunces and Public Sans only |
| Motion library for the inert care plate (P9) | **Not fixed** | first load, no scroll, phone: `react-DVxEYTmY.js` 38.8 kB gzip + `AnimatePresence`, `resize`, `use-in-view`, `motion` chunks. Cause: the care row is inside the 400 px `rootMargin` of the first screen at 375 and 1440 |
| GL setup long task (P10) | **Partly fixed** | now after the DOM: 1,460 ms and 2,262 ms long tasks at 6x CPU (SwiftShader); longest task with `?gl=0`: 138 ms |
| Old share card (P11) | **Fixed** | new dusk `og-image.png` (see note in §3) |
| Footer says "Dusk" at night (P12) | **Fixed** | probe `current: "Night"` at 18:30 |
| Theme colour stays near-black | **Fixed** | `theme: "#161034"` at 18:30, `#93b9e2` at 09:00 |
| Phone shelf = store adverts with bezels | **Fixed** | flat screen crops (`be/be-2.png`) |
| Incentiv plate shows the marketing site | **Fixed** | portal sign-in beside "Welcome Back" (`be/be-4.png`); the dashboard half is a loading skeleton |
| Shelf links misaligned | **Fixed** | all shelf links at y 573 (`be/be-2.png`) |
| Offday competes in the hero | **Fixed** | removed from the hero |
| Footer 1,089 px on a phone, contact after it | **Partly fixed** | 898 px; contact links now come first. No change needed |
| "Read the case→" glued | **Fixed** | `" →"` with a space |
| Care claim "moves over" vs not in production | **Fixed on the case, broken on home** | case now says "The new app is not live yet." The home row says the opposite (§3, C1) |
| Care role differs home vs case | **Changed** | the Role is now the same text; the Platforms line on the case contradicts it (§3, C2) |
| Case page: two headers, `download` CV | **Fixed** | case and 404 nav: Work, GitHub, Email, CV (PDF), same href, no `download` |
| Case page: hairlines, mono | **Fixed** | no 1 px rules in `cd-0.png`, `nf-d.png`; no mono face found |
| Case hook gone | **Partly fixed** | the chosen hour now travels ("Lit by the sun over Kosovo at 17:48."); no drag on the case |
| 404 right half empty | **Fixed** | two-column list (`case/nf-d.png`) |
| Generic h1, no availability line | **Not changed** | see §3, C4 |
| Weak results (Viva Fresh, Read to Feed, Bayyinah) | **Not changed** | see §3, C3 |
| Empty half-columns on desktop rows | **Not changed** | care row: text ends y ≈ 350, plate ends y ≈ 562 (`rows/row-0720.png`) |
| Night is the default for US visitors | **By design.** No change needed: the night state now reads well (`ny/ny-0.png`, results amber at 10.6:1) |

Count: 22 fixed, 7 partly fixed or changed, 4 not changed, 1 by design.

---

## 2. Four visitors, 10 seconds each

### 2.1 Recruiter in New York, phone, 12:30 (18:30 Kosovo)

Frames: `ny/ny-0.png` … `ny-4.png`.

They see a dark indigo page; "Gentrit Rashiti builds web and mobile apps, from Kosovo."; "5+ years. Part of two platform rewrites. Working remotely."; two amber results, "Rebuilding a live care platform while care teams use it." and the 16 → 2 line; "18:30 in Kosovo / 12:30 where you are"; the sun sentence; five pills; the arc; then the tops of a web plate and a phone plate. Contact (Email, CV) is in the header.

Thinks: "Web and mobile developer in Kosovo, 5+ years, a performance win, a web app and a phone app." This is the job match. **Stays and scrolls once.** What can still lose them: no seniority word and no client name they know; the phone plate is Albanian grocery text ("Produktet e fundit", "Ajvar i embel"), so it proves "phone app" but not "this is good".

### 2.2 Founder in Berlin, laptop, 09:00

Frames: `be/be-0.png` … `be-end.png`.

A clean day sky, the name line at 72 px, the two blue results, Bayyinah TV (766 px) and Viva Fresh (248 px) standing on the floor. "Drag the sun" sits clear of all marks.

Thinks: "Senior-ish, product-minded, craft." **Stays.** Then reads the care row ("Moves to the new app one tested screen at a time."), clicks the case, and reads "The new app is not live yet." A careful founder sees the two statements disagree (§3, C1). There is still no line about what kind of work he wants or how to start (§3, C4).

### 2.3 Design-engineer peer

Frames: `swipe/after-hswipe.png`, `drag/after-drag.png`, `rows/row-1740.png`, `lab/*.png`.

Dusk is still the best frame (`drag/after-drag.png`). The drag is clean: no focus box, no layout shift, a vertical swipe scrolls. **Stays and plays.** What they will see if they look: the curve line strikes through "Sunset 18:10" in the evening on every desktop width (V1); a short lilac block beside each row plate in the morning (V3); the case page draws the same care card in a system face (V4); the "where you are" clock is wrong after a reload (U1).

### 2.4 Slow mid-range Android (emulated)

Runs: `slow2` (?at=13:00), `slow3` (live), `slow5` (?gl=0); production build, gzip, 375 × 812, 6x CPU, 150 ms, 1.6 Mbit/s.

DOM with real faces at 2.9–4.4 s. First contentful paint 4.9–6.7 s. 563 kB. Real Fraunces and Public Sans, not Georgia. **Probably stays**: the first paint is the real page. But the intro does not play: the clock sits at its start value and then jumps (P1).

---

## 3. Reproduced problems

### Claims

**C1. The home care result contradicts the care case and the source repo.** (Severity: high, because an interviewer can break it.)
- Home (`data.ts`): "Moves to the new app one tested screen at a time."
- Care case, same click path (`case/cd-0.png`): "The new app is not live yet."
- vianova-dashboard-react PLAN.md line 49: "32 routes: 27 `building`, 5 `planned`, 0 `verified`". ADR-0017: "The two applications never share production traffic. The React application replaces the legacy application in one cutover per tenant cohort."
- So no screen has moved, and when the move comes it is not screen by screen. "Moves" in the present tense says it happens now. The build is screen by screen; the move is not.

**C2. Role says mobile, Platforms says web only, on the same case screen.**
- `cd-0.png`: Role "Frontend and mobile, full stack since 2026"; Platforms "Web app and the server behind it". CONTENT.md §1 lists no mobile app for the care platform. A reader asks "where is the mobile part?".

**C3. Three result lines describe the product or a tech choice, not a result.** (Unchanged from round 1.)
- Bayyinah TV: "Members subscribe on the web or in the iPhone and Android apps." (12 words; `data.ts` states "The result: 10 words or fewer.")
- Viva Fresh: "One grocery app, built once for iPhone and Android."
- Read to Feed: "About 14 updates in both app stores." (an effort count with a hedge). CONTENT.md has stronger facts unused on home: ISBN barcode scanning with the camera, a PDF and EPUB reader with progress, badges and streaks.
- Four more results pass the 10-word rule in `data.ts`: the 16 → 2 line (11), Design System v2 (11), Incentiv (11), Offday (11).

**C4. No line says what he is looking for or how to start.** The page names no role level, no kind of engagement, and no time-zone overlap. Contact is a `mailto:` in the header and the footer. (Owner may hold this back on purpose; I found no rule in CONTENT.md, PRODUCT.md or PORTFOLIO-RESEARCH.md that asks for it.)

**C5. A seniority fact is missing from home.** CONTENT.md line 180: maintained forks of `epubjs-react-native` and `react-native-pdf`, used in a production reading app, public on GitHub. A peer reads this as real mobile depth. It is not on the home page.

**C6. Small copy mismatch.** `index.html` description: "frontend and mobile developer moving to full stack". Home and case role: "full stack since 2026".

### Visual

**V1. The sun curve cuts through "Sunset 18:10" and "Sunrise 06:38" on desktop.**
- Frames: `lab/z-sunset.png` (1440, 18:30), `lab/t-1900.png` (1024, 19:00), `lab/z-d2000.png` (1440, 20:00), `lab/z-d0600.png` (1440, 06:00: the curve crosses "rise").
- Sweep (`cv2.js`, visible curve points inside the label box): 1024, 1280 and 1440 at 18:25–20:00 and 05:45–06:15. At 375/390 the curve touches the last "0" at 19:00–20:00.
- Cause: `place()` in Draft.tsx moves a mark away from the disc and the hint, but never tests the curve. 18:25–20:00 Kosovo is 12:25–14:00 in New York: the main market's lunch hour on a laptop.

**V2. On a phone, the mobile apps are the smallest pictures on the page.**
- Probe at 375: the three phone plates are 116 × 142 px; wide plates are 319 px wide. The app text inside is about 7 css px (`ny/z-rtf.png`). The h1's second noun gets the least space.

**V3. Row shadows read as a stub in the morning.** At 07:20 and 09:00 a 40 px lilac block with a hard top edge stands to the right of each desktop plate (`be/z-stub.png`). The `sides={40}` mask cuts the cast shadow. At dusk the same shadow is good (`rows/row-1740.png`).

**V4. The same care card uses two faces.** On the case page the recreation asks for Archivo, which is no longer loaded; it falls back to `ui-sans-serif` ("Patient 4821", "Care manager", "Blood pressure", "mmHg"). On home it renders in Public Sans. Probe: `document.fonts` loaded = Case Fraunces, Case Public Sans only.

**V5. The care case repeats its one number.** "16 → 2" is the hero figure (`cd-0.png`) and again the first item of "The numbers" (`cd-2.png`), 1.5 screens later. The case is 2,466 px tall.

**V6. Empty column beside each desktop row.** Care row: text ends at y ≈ 350, plate ends at y ≈ 562, so about 210 px of empty right column (`rows/row-0720.png`). Same shape in the Bayyinah, Design System and Incentiv rows. Low.

### UX

**U1. "Where you are" states a false time after a reload.** New York zone, real time 08:30. Press Dusk, reload. The page opens at "17:48 in Kosovo / 11:48 where you are" (`reload/reload.png`). The visitor's clock reads 08:30. The chosen hour lives in `sessionStorage` "kt-at", so it outlives a reload. The only sign is that "Now" is not filled. "Where you are" is a statement about the visitor's own clock, and it is wrong by 3 h 18 min.

**U2. A 404 or a case header never leads to the hook.** The name link and "Work" on case pages and the 404 go to `/#work`. The hash suppresses the intro and lands below the sun path. A visitor who arrives on a shared case link or a broken link must scroll up to find the sun. Low.

### Performance (emulation; a real-phone test is still owed per LOOP-BRIEF)

**P1. On a slow phone the intro is not seen; the first paint shows a wrong time.**
- `slow2` (?at=13:00): clock "11:30" at 3,541 ms, "11:36" at 3,639 ms, then no frame until 6,277 ms, then "13:00" at 6,308 ms. First contentful paint 5,488 ms, while the clock read 11:36.
- `slow3` (live, real time 14:18): "12:48" → "13:13" by 4,497 ms, then frozen; "13:16" → "14:18" at 7,766 ms. First contentful paint 6,720 ms, while the clock read 13:13–13:16.
- `slow5` (?gl=0): the same freeze (3,070 → 4,921 ms) without a long task, so GL is not the only cause; the GL setup adds a 1,460–2,262 ms long task in the GL runs.
- Effect: the slow visitor's first view says the wrong time in Kosovo and the wrong time "where you are", then the page jumps. The intro, meant as motion, is a false still frame.

**P2. Motion library on first load** (see §1, P9). 38.8 kB gzip plus five small chunks on every first visit, phone and desktop, for a plate marked `inert`.

### Not counted (I could not reproduce the effect)

- `og:image` and `twitter:image` are relative ("/og-image.png"). Some link scrapers want an absolute URL. I did not test a scraper.

---

## 4. Areas that hold up (no change needed)

- First screen on phone and desktop: who, what, level and a web + phone proof are all above the fold.
- The drag: no focus box, no layout shift, vertical swipe scrolls, keyboard slider with a value text.
- Load weight: 563 kB and 4 images on a phone first load.
- Back and the travelling hour: Back lands at the scroll position with the chosen light and no intro.
- Header and footer contact on every page; one header on home, case and 404.
- The 404: plain title, the bad path in bold, all cases in two columns.
- Night state colours and contrast; the share image.

---

## 5. The single change that would most improve the page

**Replace the care row result with a true one, and make the case agree.**

Now: "Moves to the new app one tested screen at a time."
Change to a line that states the method without a move that has not happened, for example: "Rebuilt screen by screen; each must pass the old app's tests first." Keep the case's "The new app is not live yet."

Why this one: every other open item is polish that a visitor forgives. This is the only line a founder or an interviewer can disprove from the page itself (home vs case) and from the source repo (0 `verified`, one cohort cutover). It is a one-line copy change.

Next in order, if there is time: V1 (test the curve in `place()`), U1 (show "chosen" or drop "where you are" when the hour is not live), P1 (skip the intro when the first frame comes late), V2 (bigger phone plates on a phone).
