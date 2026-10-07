# THREE LANES (p12-blind)

## Brief

Design Read: Reading this as a phone-and-web developer who moved to full stack, for a hiring manager on a phone, leading with Offday (one product in all three lanes), in a dated record of three lanes.

Primary reader: hiring manager, 2 to 5 minutes. Secondary: recruiter (10 to 30 seconds), senior engineer.
After the visit they should: open one case page (`/work/<slug>`) or the CV.
Strongest project for this draft: Offday, 2026. It is the only product that runs in all three lanes at once (phone, web, server), it is the owner's own, and the other three drafts lead with the care platform, Bayyinah TV and the store apps. The care platform rebuild sits in the row right under it.
Voice: no person (the name or the verb starts the sentence). Owner rules (2026-10-02 to 2026-10-06): no "I", no he/his/him, no "led", no commit counts; child's reading level; facts only from CONTENT.md and src/content; public products named and linked; no employer-client relation; Vianova only on its own rows; care platform and design system screens captioned "Real product screens, invented data."; the AI line verbatim; "16 → 2" is a proof line, not a headline.

Proof inventory (what this page shows):

| Project | What it is | Lane(s) | Years | Screen (file, pixels, provenance) | Link |
|---|---|---|---|---|---|
| Offday | Time off for teams | Web + Phone + Server | 2026 | offday-light-calendar-desktop 2880×1800, offday-light-calendar-phone 780×1688, own | none |
| Care-management platform | Remote patient monitoring, React rewrite | Web (+ Server: the API) | 2023–26 | appointments-week 2880×1800, real screens, invented data | /work/care-platform |
| Design System v2 | 36 components, 805 tokens | Web | 2026 | date-range-picker 1560×976, real screens, invented data | /work/design-system-react |
| Bayyinah TV | Video learning | Web + Phone | 2023–26 | web-02 2880×1800 public page; store-05 778×1690 store listing | bayyinahtv.com, App Store, Google Play |
| Read to Feed | Children's reading app | Phone | 2022–25 | reading-1 780×1689 archived listing | archived App Store / Google Play |
| Incentiv portal | Smart-wallet sign-in | Web | 2024 | web-03 2880×1800 public sign-in | portal.incentiv.io |
| Viva Fresh | Grocery and loyalty | Phone | 2023 | grocery-2 780×1689 store listing | App Store, Google Play |
| Dukagjini Bookstore | Bookstore app | Phone | 2021–22 | bookstore-1 780×1689 store listing | App Store, Google Play |

Cannot show: the care API, Offday's server, the chatbot runtime, Sadaqah, the Vue era of the care platform → text notes in the lane, no screens.
Constraints: React 19, TypeScript, `motion` not needed, plain CSS under `.tl-`; fonts from `public/fonts` only; one light theme; lazy chunk well under 150 kB.
Memory sentence (target): "The site where his work is laid out in three lanes, phone, web and server, and the server lane is empty until 2026."

## Direction card

```
id / title: p12-blind / THREE LANES
Rule: the page is a six-year record in three lanes, phone, web and server; every product sits in the lane it runs in and the year it shipped, so the lanes fill in from phone to web to server.
Lead project and why: Offday (2026). It fills all three lanes in the first row, which is the claim drawn as a picture, and it is the owner's own full-stack product. The other drafts lead with the care platform, Bayyinah TV and the store apps.
Composition: 3 (the claim drawn as a picture: three lanes are the sentence) crossed with 4 (a dated record: years down the page).
First screen, 1440: masthead; the claim in two lines of condensed display type; one line of since-years and place; a row of four links; the sticky lane headers; the red "Today" line; the year 2026; then the first row: Offday on a phone (left lane), Offday's team calendar (wide middle lane), Offday's server (right lane, text). The middle screen fills about a third of the viewport.
First screen, 390: masthead; claim in four lines at 38px; since-years line; links; "Today"; 2026; Offday's calendar cropped to three weekday columns, starting around y=430.
Hook and the fact it carries: "the server lane is empty until 2026" (phone apps since 2021, web since 2023, the server since 2026). Also said in words under the claim.
Delete test: remove the lanes, bars and year rules; a dated list of products with years, roles, screens and links remains, and the second line still says "Phone apps since 2021. Web apps since 2023. The servers behind them since 2026."
Type: Big Shoulders Display (a signage and timetable face, condensed and tall, so years and lane headers read as a printed board; claim 64px/700, years 44px/800, names 28px/700, lane headers 20px/700 caps), Libre Franklin 17px/400 for text, Martian Mono 13px for years, roles and links (tabular).
Colour: paper oklch(97% 0.008 50), ink oklch(21% 0.012 50), secondary 46%, hairline 85%. One accent, "today red" oklch(50% 0.19 25): the Today line, the current-year mark, link hover, focus. Source: the red now-line in the care team's week calendar and the red "today" circle in Offday's calendar, both on this page.
Motion: the year bars draw downward once when the record enters view, 600 ms cubic-bezier(0.16, 1, 0.3, 1), 25 ms stagger, data-motion="story"; reduced motion draws them complete. Everything else is the quiet layer: underline grow 150 ms, press 120 ms, dialog 200 ms.
Mechanisms earned: M1 (one constraint, the lanes, pushed through the whole page), M9 (real years, products, stores), M13 (proof as nouns), M14 (dated record, a line at today).
Risk / what could make it a costume: a Gantt chart reads like a résumé timeline; keep the bars thin and quiet, keep empty cells intended (notes in them), and keep the first screen about the work, not the chart. On phones the lanes collapse to a stream; the lane tag on each entry and the since-years line carry the fact.
```

## Four first-screen answers (written from the captures, step 4)

Desktop (1440.png): who: Gentrit Rashiti (masthead and the claim) / what: phone and web apps, and since 2026 the servers behind them / for whom: care teams, readers and shoppers / proof: Offday's real team calendar and phone screen in the first row, the links to bayyinahtv.com, the App Store and Google Play, GitHub and the CV; the years 2021, 2023, 2026.

Phone (390.png): who: Gentrit Rashiti / what: phone and web apps / for whom: care teams, readers and shoppers / proof: the since-years line, the four links, "Today" and "2026", and Offday's calendar starting high on the screen.

Memory sentence after looking: "the one where the work is three lanes, phone, web, server, down the years, and the server lane is empty until 2026."
