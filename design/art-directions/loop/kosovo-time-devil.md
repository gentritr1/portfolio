# Devil's advocate: kosovo-time as the live home page

Date: 2026-10-06 (Kosovo about 13:05). Scope: `/` (src/drafts/kosovo-time/), `/work/<slug>` (src/pages/CasePage.tsx, caseShell.tsx) and the 404 (NotFoundPage.tsx). Commit on disk: 50d857b.

## Method and limits

- Tool: a copy of `offday/seq.mjs` (`scratchpad/ktdev/seq2.mjs`). It adds a time zone, CPU throttle, network throttle, a no-cache step, an init script and a touch swipe. PORT 9752. Dev server 5240. I also served the production `dist/` (built 12:48, same commit) on 5241 for the network numbers. I stopped that server at the end.
- Frames are in `scratchpad/ktdev/out/<run>/`. I name each frame where I use it.
- Headless Chrome uses SwiftShader (software GL). SwiftShader makes GL slow. Where a number depends on it, I say so. I did not use a real phone.
- I checked the claims against CONTENT.md, `src/content/*`, `src/drafts/kosovo-time/data.ts`, `src/pages/caseCopy.ts`, and PLAN.md of vianova-dashboard-react.
- I report only what a frame, a probe or a line of code shows.

---

## 1. Four visitors, 10 seconds each

### 1.1 Recruiter in New York, phone, lunch (12:30 New York = 18:30 Kosovo)

Frames: `out/ny/ny-0.png` … `ny-3.png` (375 × 812, zone America/New_York).

What they see in 10 seconds:
- A dark indigo page (ground `#211739`, sky `#161034`). The sun is down, so the default state for this visitor is night. This is the main market's lunch hour.
- "Gentrit Rashiti builds web and mobile apps, from Kosovo." Then "5+ years. Part of two platform rewrites. Working remotely."
- "18:30 in Kosovo / 12:30 where you are." Then a second serif sentence: "The sun is 4.4° below the horizon. Only the screens light this page."
- Five pills (Now, Dawn, Noon, Dusk, Night), an arc and "Drag the sun up".
- One screen: Bayyinah TV. The only readable words on it are "From Jerusalem to Makkah" and "Ramadan LIVE 2026 with Ustadh Nouman".
- The two result lines start at y = 814. The phone fold is 812. **No result is on the first phone screen.**
- The header shows only "Email" and "CV (PDF)". "Work" and "GitHub" are hidden at 375.

What they think: "A developer from Kosovo. Some astronomy widget. A religious video site." They do not see a mobile app, a company name they know, or a number.

Why they leave: The page asks them to play with the sun before it tells them anything a recruiter screens for. The only screen reads as niche religious content. A non-technical reader does not know that "Bayyinah TV" is a client and not his own channel. They have a job title and a city to match, and the page gives them a clock.

### 1.2 Founder in Berlin, laptop, 09:00 (Berlin = Kosovo time)

Frames: `out/be/be-0.png` … `be-4.png`, `out/z/z9.png` (1440 × 900).

What they see in 10 seconds:
- A good first read on the left: the name line in Fraunces at about 72 px, the sub-line, and two result lines in blue: "Mobile apps shipped to both app stores." and "One report asked the database 16 times. Now it asks 2."
- On the right, a second headline in the same serif: "The sun is 24° above the horizon, in the south-east. It lights this page." It has the same weight in the layout as the name line.
- Below: Bayyinah TV (672 px wide) and Offday (473 px wide) on the floor.
- At 09:00 the "Drag the sun" pill covers the "Noon 12:24" label. Probe: pill x 582–735, y 365–395. Label x 709–777, y 358–376. Overlap 26 × 11 px. Only "N…on 12:24" shows (`z9.png`).

What they think: "Clear, senior-ish frontend person. Nice craft." Then: "Which of these is mobile?" Both screens on the first screen are web. The phrase "web and mobile apps" has no picture above the fold.

Why they leave, or why they do not call: the founder hires a senior frontend/mobile engineer. To find a phone app they must scroll to the shelf. On desktop the phone plates start at about y = 2,420 (`be-2.png`), which is 2.7 screens down. What they then find are App Store advertising frames ("Explore a vast library of books for ages K-12", "Discover new books you will love!"), not in-app work. There is also no line that says "available", "open to roles", rate, time-zone overlap or a call link. The contact is a mailto in the header and the footer.

### 1.3 Design-engineer peer who knows the 2025–26 field

Frames: `out/drag/d-mid.png`, `d-end.png`, `dusk-end.png`, `out/hours/*.png`, `out/foot/foot-m.png`.

What they see: the best frame on the site is dusk (`dusk-end.png`): lilac sky, orange ground, long violet shadows. The intro, the spring on the drag, and a 4 × 4 screen sample that lights the floor at night are real work. They will remember it.

What they then find:
- After a mouse drag, a 1,360 × 130 px dark focus box stays around the whole sun path (`d-mid.png`, `d-end.png`). Its bottom edge (y ≈ 452) sits on the Bayyinah title bar (top 451.6). `onDown` calls `focus()` (Draft.tsx line 412). I saw this with CDP mouse events in headless Chrome. Confirm it in a real Chrome. If it shows there, a peer sees a focus ring on a mouse drag.
- At 18:30 on desktop, the sun disc covers "Sun" of "Sunset 18:10" (`d-1830.png`). At 09:00 the pill covers "Noon". Nothing stops the label or the disc from landing on a mark.
- The footer, "The light on this page", lists hex codes and contrast ratios for four lights. At 18:30 the footer marks "Dusk" as the current light, with an orange ground `#FFA667`. The page ground at that moment is `#211739` (dark indigo) (`foot-m.png` against the probe). The legend contradicts the page.
- The phone shelf uses store marketing frames with iPhone bezels, cut at the bottom (`be-3.png`, the phones end at y = 413). The loop's own display rule says no device mockups.
- The Incentiv row says "Sign-in and dashboard screens for a crypto wallet." The plate is the marketing home page: a poodle in VR goggles and "Build. Incentivize. Settle." (`be-4.png`). No sign-in, no dashboard.

What they think: "Strong idea, beautiful at dusk, but the polish stops at the hero. The work section is a template list with screenshots." 13 rows use the same layout (plate left, text right on desktop). The peer compares with rauno.me or emilkowal.ski, where the craft is inside the work. Here the craft is inside the background.

### 1.4 Visitor on a slow mid-range Android phone

Run: production build, 375 × 812, CPU 6× slower, 150 ms latency, about 1.6 Mbit/s, cache off (`out/slow/a-2s.png`, `a-4s.png`, `a-10s.png`).

- **0 to 4.1 s: an empty cream screen** (`a-2s.png`). `index.html` has an empty `<div id="root">`. The home is a lazy chunk after the entry, the vendor chunk and the global CSS. Then `.kt[data-fonts="wait"] { opacity: 0 }` hides the whole page while it waits for the faces.
- **The faces miss their 220 ms wait (`FONT_WAIT_MS`), so the page stays in Georgia and Arial for the whole visit.** At 10 s the page still shows the fallback faces (`a-10s.png`), although Fraunces arrived at about 5.2 s. This is by design (`kosovo-time.css` lines 63–70, Draft.tsx 667–694). The slow-phone visitor never sees the type that the jury scored 8–9.
- **The clock runs backward.** Sampled state: 4,103 ms "13:00", 4,367 ms "11:30", 5,957 ms "13:00". The first paint shows the right hour, then the intro (`clock.ts` `start()`) rewinds 90 minutes and plays forward. The visitor sees the page change colour twice in two seconds.
- LCP: the Bayyinah image at 6.0 s.
- **1.79 MB and 40 requests on first load, on a phone, without one scroll.** Every plate image down to Morse Trainer (y = 6,888) loads. Cause: `sampleScreen()` (scene.ts line 88) creates `new Image()` for every plate source to sample 4 × 4 colours. This defeats `loading="lazy"` on all 13 plates.
- `index.html` preloads `/fonts/Archivo.woff2` (103 KB). It is the first request. The home does not use it.
- The inert care plate pulls the motion library: `react-CsCb1yZn.js` 118 KB raw / 38 KB gzip, plus `AnimatePresence`, `resize` and others. Total gzip JS for the home is about 170 KB.
- Software GL (SwiftShader, so read this as a risk, not a phone number): one long task of 3,209 ms with the WebGL floor, 679 ms with `?gl=0`. The 18-slow-frames fallback (Draft.tsx 103–116) cannot help, because the block is the synchronous setup at mount, before any frame. A recruiter on a VDI, a VM or a locked-down laptop with GPU off gets this path.
- A normal thumb scroll can change the hour. **Test:** at 13:00 on 375 px, a vertical touch swipe from (60, 480) to (60, 250) starts on the sun path. Result: the clock reads 03:04, the page goes to night, and a white focus box shows around the path (`out/swipe/after-swipe.png`). Cause: `onDown` calls `clock.set()` on `pointerdown`, before the browser decides that the gesture is a vertical pan (`touch-action: pan-y`). The path band is 343 × 92 px at y 425–517, which is where a right thumb rests on the first screen.

Why they leave: 4 seconds of blank cream, then a page that flickers its colours, then a scroll that turns the site to night by accident.

---

## 2. Is the sun a gimmick, or does it carry the message?

The h1 promises three things: "web and mobile apps", "from Kosovo", and (by the sub-line) seniority.

- "from Kosovo": **the sun carries it.** It is the best possible proof of place.
- "web": carried by the Bayyinah TV screen, not by the sun.
- "mobile": **nothing on the first screen shows it.** The only proof is the text "Mobile apps shipped to both app stores." On a phone that line is at y = 814, just below the fold. On desktop the first phone picture is about y = 2,420.
- seniority: carried by "16 times. Now it asks 2." and "Part of two platform rewrites", both text.

So the sun proves place and craft. It does not prove the job. It also takes a lot of the first screen: the right column (440 × 242 px) and the full-width path (1,344 × 116 px), about 20 % of the 1440 × 900 first screen. The sun sentence ("It lights this page.") is a second headline about the page, not about him.

Verdict: it is not only a gimmick, because the dusk state is a real memory hook. But for the buyer it is decoration with a side effect: the US market sees night by default, a phone scroll can change the hour, and the slot that should hold the mobile proof holds a sentence about the solar altitude.

---

## 3. Generic, unclear, too long, filler

| Quote | Problem |
| --- | --- |
| "Gentrit Rashiti builds web and mobile apps, from Kosovo." | Every agency and freelancer can write it. It names no level, no domain and no client. CONTENT.md already has a stronger line: "Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3." |
| "Mobile apps shipped to both app stores." | The weakest result is first. No number, no name, no outcome. |
| "The sun is 24° above the horizon, in the south-east. It lights this page." | A second headline about the page. A recruiter cannot use it. |
| "Members subscribe on the web or in the iPhone and Android apps." (Bayyinah result) | This describes the product, not a result. |
| "One grocery app, built once for iPhone and Android." (Viva Fresh result) | This is a tech choice (React Native), not a result. CONTENT gives better facts: delivery slots, loyalty, address search on a map. |
| "About 14 updates in both app stores." | Effort count with a hedge ("About"). CONTENT's voice rule says to drop numbers that describe effort. |
| "A concept site for a made-up portable speaker." / "…made-up sculpture show." | Two rows of 636 × 398 px plates for hobby concepts with only GitHub links. |
| Footer: "Below are the four lights, with the contrast of the text in each." plus 16 hex codes | Process material. 733 px on desktop, **1,089 px on a phone** (13 % of the phone page). The contact links come after it. |
| "Read the case→" | No space before the arrow. It reads as one glued word. |

Too long:
- Page height: 7,791 px at 1440, 8,184 px at 375.
- Own projects: y 4,382 to 7,058 on desktop, 2,676 px. That is 34 % of the page, nearly as long as client work (3,268 px).
- 13 rows in one repeated layout. After row 3, a visitor learns nothing new about the person.

---

## 4. Claims that can be doubted

1. **"Most screens are already rebuilt in React. A screen moves over only after it passes the same tests in both apps."** (home, care row; also the care case, with a semicolon).
   - CONTENT.md line 166: "the dashboard is not in production yet".
   - vianova-dashboard-react PLAN.md line 49: "32 routes: 27 `building`, 5 `planned`, 0 `verified`".
   - So no screen has "moved over" yet, and none has passed the dual-origin run. "moves over only after" describes a rule, but a reader takes it as something that happens now. An interviewer who asks "how many moved?" gets the answer "none".
2. **Care role differs between home and case.** Home: "Frontend and mobile, full stack since 2026". Case: "Frontend. Full stack since 2026: the web app and its server." and "Platforms: Web app and the server behind it". A reader who opens both asks "where was the mobile part?".
3. **Read to Feed.** The links are "App Store (archived)" and "Google Play (archived)". CONTENT line 108 says the listings are removed. A recruiter who clicks lands on archive.org and reads "this app is gone".
4. **Incentiv.** The text claims sign-in and dashboard screens. The plate shows the marketing home (`incentiv/web-01.webp`). CONTENT says "Frontend, UI layer" for the dashboard. The plate can make a reader think he built the marketing site, or that the claim has no picture.
5. **"rebuilt from an empty page: 34 pages."** CONTENT says "34 routes" and "from an empty template". Small, but a peer can ask "pages or routes?".
6. **The clock.** The footer says the light is computed "at your clock". During the intro, the page shows a time 90 minutes early, and "where you are" shows the visitor's own clock 90 minutes early too. In my dev-server desktop runs the first paint read 07:30 for `?at=09:00` and needed 1.6 s more to reach 09:00 (SwiftShader, so the real delay is shorter, but the first number shown is false by design).
7. **"Mobile apps shipped to both app stores."** True. But see item 3: one of the three apps on the shelf is no longer in either store.

---

## 5. Where is the strongest work, and how soon is it seen?

Strongest work in my judgement: the care platform (16 → 2, multi-tenant, the rewrite) and Design System v2 (36 components, 805 tokens, 20 releases in about six weeks).

| Item | Desktop 1440 | Phone 375 | Slow phone |
| --- | --- | --- | --- |
| "16 times. Now it asks 2." (text) | y = 306, first screen | y ≈ 850, **below the fold** | readable at about 4.1 s (fallback face) |
| Care plate (recreation) | y = 1,086, one scroll | y ≈ 1,020 | loads in the first 10 s (via `sampleScreen`) |
| Design System v2 | y = 3,197, 3.5 screens | y = 3,440, 4.2 screens | — |
| "805 design tokens" | **not on the home page** | not on the home page | — |
| First mobile-app picture | y ≈ 2,420 | y ≈ 2,110 | — |

The page spends the first screen on Bayyinah TV, which is a strong public product but shows no mobile work and reads as religious content, and on Offday, an own project. The DS facts that prove seniority best are 3–4 screens down, and the best number (805 tokens) is only on the case page.

---

## 6. What is visually weak

- **Night is the default for the main market.** 18:30 Kosovo = 12:30 New York = 09:30 San Francisco. At those hours the page is dark indigo with amber result lines (`ny-0.png`, `d-1830.png`). The round-1 rule called "dark plus one accent" a slop marker.
- **Label collisions on the arc:** pill over "Noon" at 09:00 desktop (26 × 11 px). Disc over "Sun" of "Sunset" at 18:30 desktop. Disc over "Sunris(e)" after the swipe at 03:04 on phone (`after-swipe.png`).
- **Hero crop wastes space.** The Bayyinah crop has a blank dark band of about 48 px above "Subject" (y 482–530 in `be-0.png`), about 13 % of the plate height.
- **Offday competes with the client screen.** It stands on the same floor at 473 px. Its text is about 5–6 px tall, so it is unreadable. It shows "own project" at the same rank as client work.
- **Phone shelf = store adverts.** Three marketing frames with slogans and iPhone bezels, cut at the bottom (`be-3.png`). On a phone at night, a grey blur under each phone plate reads as a smudge (`ny-2.png`, under Read to Feed).
- **Desktop shelf misalignment.** Viva Fresh's result wraps to two lines, so its links sit at y = 573, while Read to Feed and Dukagjini links sit at y = 548 (`be-2.png`).
- **Empty half-columns.** Desktop rows: the text column ends about 200 px above the plate's bottom (`be-1.png`, care row). The care case: the right column is empty for about 550 px beside the vitals card, then the left column is empty beside "What was built" (`out/case/cd-1.png`).
- **Two serif headlines on the first screen** (name line and sun sentence). Hierarchy has two tops.
- **Browser chrome.** `theme-color` stays `#101112` (near black) at every hour. On Android Chrome the address bar is black above a pale blue noon sky.

---

## 7. Spacing, jitter, UX and performance (with proof)

| # | Problem | Proof |
| --- | --- | --- |
| P1 | A vertical thumb scroll that starts on the sun path changes the hour | `out/swipe/after-swipe.png`: 13:00 → 03:04, page goes night. Draft.tsx `onDown` sets the clock on `pointerdown` |
| P2 | Focus box stays after a mouse drag | `out/drag/d-end.png`: 1,360 × 130 px box, bottom edge on the Bayyinah title bar |
| P3 | Faces that miss 220 ms never come back | `out/slow/a-10s.png`: Georgia/Arial at 10 s; css lines 63–70 |
| P4 | Page is invisible until the faces resolve | `.kt[data-fonts="wait"] { opacity: 0 }`; blank at 2 s and until 4.1 s on the slow run |
| P5 | Clock order 13:00 → 11:30 → 13:00 | sampler on the slow run (4,103 / 4,367 / 5,957 ms) |
| P6 | Back from a case replays the 90-minute intro | `out/back`: after Back, 11:36 → 13:06 in 1.1 s while scroll restores 0 → 831 px over about 420 ms. At dusk this is a day-to-night flash on every Back |
| P7 | All plate images load at once | 1.79 MB, 40 requests in 10 s on a phone; `sampleScreen()` |
| P8 | Unused 103 KB Archivo preload is the first request | `dist/index.html` line `rel="preload" href="/fonts/Archivo.woff2"` |
| P9 | Motion library for an inert plate | `react-CsCb1yZn.js` 38 KB gzip on the home |
| P10 | Synchronous GL setup at mount | long task 3,209 ms with GL vs 679 ms with `?gl=0` (SwiftShader) |
| P11 | Share card is the old site | `index.html`: `og:image` = `/og-image.png`, the cobalt dithered sphere on graphite with "Frontend & mobile developer, now full stack" and a stack line (giant name + grey subtitle, the slop pattern). A link pasted in Slack or LinkedIn shows a different site |
| P12 | Footer legend says "Dusk" when the page shows night | `out/foot/foot-m.png` at 18:30 |
| P13 | Header loses "Work" and "GitHub" at 375 | `ny-0.png` |

No layout shift during drag: the h1, sentence, pills, lead plates and `#work` kept the same y in every sample of the drag (`out/drag`). Horizontal overflow is 0 at 375 and 1440. Back restores the scroll position (831 px). These parts are good.

---

## 8. Case pages and 404 after a click from home

Frames: `out/case/cd-0.png` … `cd-end.png`, `cm-0.png`, `cd-404.png`, `cm-404.png`.

Good:
- The palette and Fraunces carry over. The care case opens with "One billing report now finishes: 2 database requests, not 16." and a large 16 → 2 figure. This is the best first screen on the whole site for a founder.
- "Next project" works. Back keeps the scroll.

Weak:
- **The hook is gone.** The case shows a sky band and an 11 px ring: "Lit by the sun over Kosovo at 13:04." No drag. A visitor who arrives from a shared case link never meets the idea. If the visitor dragged to dusk on home, the case opens at real time, so the light jumps.
- **Two different headers.** Home: Work, GitHub, Email, CV (PDF) (opens the PDF). Case and 404: All work, CV (PDF) (`download` attribute, so it saves a file), Email. No GitHub. Same label, different behaviour.
- **1 px rules return.** The facts table (Role / Years / Platforms / Live) and the 404 list use hairlines. The home has none, and round 10 banned them.
- **Mono returns.** The live care card shows "Care manager", "14 days", "Last sync 2 min ago", "Timezone: patient local (UTC-5)" in mono (`cd-1.png`). On home the same plate uses the sans.
- **Role conflict** with the home row (see §4 item 2).
- **Empty space:** right column empty for about 550 px beside the card; the 404 list stops at x = 1,008, so 430 px on the right is empty (`cd-404.png`).
- **Semicolon and claim** in "The result": "most screens are already rebuilt in React; a screen moves over only after it passes the same tests in both apps." (see §4 item 1).
- 404: clear title ("There is no page at this address."), the path in bold, the list of cases. It works. It is plain, and it does not use the site's one memorable idea (the departures board or the sun would make a better 404).

---

## 9. The single change and one radical alternative

### Single change: make the first screen prove both nouns of the h1

Replace Offday in the hero with one real in-app phone screen of a shipped client app (the Bayyinah TV iPhone app or Viva Fresh, a real screen, not a store advert), standing on the same floor beside the Bayyinah web screen. Put the two result lines above the sun path on the phone. Then "web and mobile apps" is seen, not read, in the first five seconds, at every hour, on every device. The sun then lights the proof instead of competing with it.

Fix list that rides with it (each is small and proven above): set the hour on `pointerup` or after a horizontal move of 8 px, not on `pointerdown` (P1); do not call `focus()` on pointer use (P2); let late faces swap in (P3, P4); skip the intro on Back and when the first paint has already shown the time (P5, P6); sample a plate only when it comes near the viewport (P7); remove the Archivo preload and replace the OG image and `theme-color` (P8, P11); fix the arc label collisions.

### Radical alternative: the sundial index

Make the sun path the work index. Put the seven client products on today's arc as hour marks. The sun at the visitor's clock lights the product of that hour. That product's screen stands in the hero and casts the shadow. Dragging the sun is browsing the work: drag to 16:00 and Viva Fresh stands up in the low light with its real screen and its one result; drag to noon and the care 16 → 2 figure stands at full height. The hook and the portfolio become one control, so a visitor cannot play with the sun without seeing a shipped app. A US recruiter at night sees the night product (the care platform, lit by its own screen), not an empty dark landscape.
