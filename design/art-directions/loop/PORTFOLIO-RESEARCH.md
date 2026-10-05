# Portfolio research: copy and display rules

Date: 2026-10-05. Scope: the home page (`src/drafts/projector/`, route `/`) and the case pages (`src/pages/AisleCasePage.tsx`). Facts come only from `CONTENT.md`, `src/content/projects.ts` and `src/content/caseNarratives.ts`. This file changes no code.

Method. Each site was read with a page-text fetch on 2026-10-05. A text fetch shows the words and the structure, not the pixels. Where a visual fact comes from a public write-up (Awwwards, a case study) and not from the page, the table says so. Headlines are paraphrased, not copied.

## 1. Portfolios studied

| # | Site | First-screen message (paraphrase) | How work is shown | Blurb length | What it does best |
| --- | --- | --- | --- | --- | --- |
| 1 | rauno.me | Name, "interaction designer", two places he works. A short "make it …" manifesto. | Craft page: about 80 landscape tiles, all one ratio, caption = name + month and year. | 2 to 4 words | One ratio for every tile, so 80 items read as one calm set. |
| 2 | emilkowal.ski | The team he works on, then one sentence on what he cares about (how the UI looks, feels, behaves). | Text list. Title + one line. Articles hold live demos you can touch. | 5 to 10 words ("A drawer component for React") | The demo is inside the text. You try the claim, you do not read it. |
| 3 | paco.me | Two verbs: crafting interfaces, building software. | Text list, linked title + one line. A "Now" section. | 5 to 8 words ("Plain text editor with a focus on performance") | Each line names the thing and its one quality. Nothing else. |
| 4 | brittanychiang.com | Job title, then one sentence: what she builds and for whom. | Image (about 640 px wide) + title + 1 to 2 sentences + tag row. Jobs: title · company · years. | 25 to 40 words | Seniority comes from the job list (title, company, years). No adjectives. |
| 5 | leerob.com | "Engineer and writer", the current job, what the job does. | Text only, dated list. | Title only | Years of practice and named places carry all the trust. |
| 6 | joshwcomeau.com (about) | When he started and that he never stopped. | Small toys on the page (sound button, flag); packages with monthly download counts. | 1 to 2 sentences | One real number a non-engineer understands ("about 600,000 downloads a month"). |
| 7 | brianlovin.com | Role, city, current product area. | Text list, name: one line. | 4 to 7 words | Each side project is named by what it does for the user. |
| 8 | jakub.kr | "Founding design engineer" at one company, one sentence on what it builds. | Cards: logo, title, one line. | 5 to 15 words ("A guide to OKLCH colors") | One role word ("founding") states seniority. No list of titles. |
| 9 | maggieappleton.com | What she makes, about what, in one line; three role words. | Thumbnails about 300 × 200, title, one sentence. | One sentence | Each blurb states a benefit to a person ("a trail of where they have been"). |
| 10 | raphaelsalaja.com | "Design engineer based in Ireland". | A grid of colour-coded squares; a "19+" count. | Very short | Colour as the index. Close to sampled-ground. |
| 11 | marcel.io | "Designer and developer for digital products", plus what he draws. | Posts with screenshots; daily comics as a thumbnail grid with one-line captions. | 2 to 4 sentences | A visible daily practice (259 dailies) proves craft without a claim. |
| 12 | tonyward.dev | What he loves to build (design systems) and why (teams ship faster). | Dated text list. | One sentence ("generate CSS variables from Figma variables") | The first line says the specialism and the benefit together. |
| 13 | offgrid.inc (designeng.tools reference) | A studio that makes brands "impossible to ignore". | Dense grid; caption = client / discipline, year. | 3 to 5 words | Same caption shape on every item. Volume reads as output. |
| 14 | mek.gallery (designeng.tools reference) | Name, alias, birth year, four disciplines. | Category tabs (PIXEL, DESIGN, DEV), dated rows with a subtitle. | One line | An archive look: date, category, title. Technical but consistent. |
| 15 | uselayouts.com (owner reference) | Components that "feel as good as they look". | Poster images of components in a looping carousel; counts ("12+ layouts"). | 2 to 4 words per card | Each card is a still of one interaction, one ratio, one ground. |
| 16 | designeng.tools / designeer.xyz (directories) | "Everything a design engineer needs" / a curated collection. | Preview image (about 800 px) + logo + title + one line. | 10 to 25 words | The uniform card (image first, one line under) is the norm visitors know. |
| 17 | bruno-simon.com (Awwwards Portfolio Honors, Jan 2026; from public write-ups) | One instruction: drive around to learn about him. | A 3D world you drive a car through; projects are places. | Signs, very short | One hook a visitor tells a friend about. Not for a hiring manager in a hurry. |
| 18 | elliott.mangham.dev (Awwwards SOTD, Dec 2025) | Role ("creative web developer") + proof (awards, clients). | Thumbnail grid, scroll reveals, video modals; two colours only (#121212, white). | 1 sentence | Proof as numbers a client understands (awards, client revenue). |
| 19 | pacomepertant.com (Awwwards SOTD, Jun 2026) | Discipline + city. A choice: enter with sound or without. | A showreel first; projects behind it. | Role + city | The entry choice is the hook and proves the skill (sound). |

Common to the strongest sites (rows 1 to 12):

- The first screen holds one or two sentences: a role, a place or a company, and what they build. No skill list.
- A project shows as a title plus one line of 2 to 15 words. Long text lives one click away.
- The words are plain verbs and nouns ("build", "editor", "toast", "guide"). None uses "passionate", "innovative", "cutting-edge", "seamless", "robust", "leverage" or "pixel-perfect" in a blurb (Brittany Chiang uses "pixel-perfect" once, in her headline).
- Seniority comes from named places, years and one role word ("founding", "senior", "core"). Nobody writes "I led".
- One set uses one image ratio and one caption shape.
- The memorable part is one specific thing: a live demo, a daily practice, one real number, one entry choice.

### Articles on case studies and blurbs

| Source | Rules taken |
| --- | --- |
| NN/g, "5 Steps to Creating a UX-Design Portfolio" (nngroup.com/articles/ux-design-portfolios) | 3 to 5 full case studies. One template for all. Problem, role and team, decisions, rejected options, impact, lessons. Make it scannable. |
| UX University, "A hiring manager will spend 6 seconds on your portfolio" | First 3 seconds: the case title and the first image. Put the result in the title. Replace "improved" with a number. Case study: 500 to 600 words at most. |
| UX Playbook, "Minto pyramid" case-study guide | Result first, then 2 to 3 decisions that caused it, then evidence. About 60 seconds per case study. Outcomes, not tools. |
| UX Design Institute, "What hiring managers look for" | A 2 to 3 sentence intro. 2 to 3 best case studies. State level and team size. Plain words so non-designers understand. |
| DEV, "How to write developer project case studies recruiters can actually understand" (B. Young) | Say what the product does before the stack. Say your scope; never "worked on". Explain what made it hard. Do not invent numbers; a qualitative result is acceptable. 300 to 600 words. |
| hontran.dev, "10 best award-winning websites of 2026" (a juror) | Art direction that stands without motion. Motion that paces the story between states. About 60 fps on a mid-range phone. Respect reduced motion. |

## 2. Copy rules

Write for three readers in this order: a recruiter (10 seconds), a founder or hiring manager (60 seconds), an engineer (the case page). The first two must understand every word on the home page.

1. **Result first.** The result line is the largest text in a row. It has 10 words or fewer. Keep the shape "problem → result" in every row.
2. **Problem line: 12 words or fewer.** It says what was wrong or what had to exist, in the user's words. If no problem exists, it says what shipped.
3. **Start a result with a verb or a number.** "Members subscribe on the web or in the apps." "2 database requests, not 16." Not "A solution that enables…".
4. **One idea in each line.** One comma at most. No semicolons on the home page.
5. **Name the people before the technology.** "Care teams", "members", "children", "shoppers", "readers". The product kind comes next ("a video-learning platform"). The stack comes last.
6. **Technology names stay out of the title, the problem and the result.** One hiring keyword (React, React Native, Vue, Next.js, Laravel) can stand in the role line. The full stack goes in one line on the case page.
7. **Use numbers a non-engineer can count.** Good: pages, languages, app stores, updates, weeks, years, "16 → 2". Keep internal counts (tokens, components, Pinia stores, routes) off the first read. Show them on the case page with a plain label ("805 shared style values").
8. **Do not use these words on the home page:** tokens, tiers, parity, parity-tested, multi-tenant, tenant, API, codebase, route, component (in a result), store (meaning app state), HLS, IVS, CSP, deep link, middleware, on-chain, gas, RN, consumer, floors, adapter layer, gate, ADR, schema, runtime, package, port. Never use: seamless, robust, scalable, leverage, cutting-edge, passionate, innovative, pixel-perfect, world-class, "helped with", "worked on".
9. **If a technical word must stay, explain it in four words or fewer.** "A passkey (no password)". "The server behind the app".
10. **State scope, not rank.** Write what was built and what others built: "Built the sign-in and dashboard screens. Teammates built the wallet." Seniority comes from three facts: the size of the change (a full rebuild, 34 pages), the time (four years of releases) and the kind of decision (moved a live app one screen at a time). The owner rule stays: no first person, no "led", no commit counts.
11. **Use one role word from this short list:** Frontend, Mobile, Full stack, Design system, Core team. Add one plain clause when it helps: "Frontend, core team".
12. **"Live" is a result.** "Live in the App Store and on Google Play" and "live at bayyinah.org" are results every reader understands. Link them.
13. **Captions: 8 words or fewer.** Say what the picture is and if it is a recreation: "Pricing page, public." "Recreation with invented data."
14. **Lengths.** Home row: title + problem (≤ 12 words) + result (≤ 10 words) + role · year. Index line: 14 words or fewer (owner rule). Case summary: 60 words or fewer. Story paragraph: 55 words or fewer (owner rule). Whole case page: 600 words or fewer above the stack line.
15. **The read-aloud test.** Read the row to a person who does not write code. If they ask "what is X?", replace X.

### Replace this → with this

Each line keeps the fact of its source. No number is new.

| # | Current phrase (source) | Plain replacement |
| --- | --- | --- |
| 1 | "One source of design tokens, in three tiers, for CSS, TypeScript and Figma." (projector 01) | "Colours, sizes and type are set once, for code and for Figma." |
| 2 | "36 components, 805 tokens, 20 releases in about six weeks" (projector 01) | "36 ready-made building blocks, released 20 times in about six weeks." |
| 3 | "805 design tokens in three tiers (core, semantic, component)" (CONTENT §6b) | "805 shared style values, in three levels." (case page only) |
| 4 | "cobalt.600", "action.primary", "button.solid.bg" (token-source draft) | Say the colour and its job: "the main blue", "the colour of the main button". Do not print token names. |
| 5 | "Vue to React, parity-tested" (projector 02 role) | "Frontend. Rebuilt screen by screen, each screen checked against the old app." |
| 6 | "Many client organizations share one multi-tenant system" (CONTENT §2) | "Many care organizations use the same system." |
| 7 | "Laravel API" (projector 03 plate note) | "The server behind the app." |
| 8 | "One billing report ran 16 queries and timed out." (projector 03) | "One billing report asked the database 16 times and gave up." |
| 9 | "2 queries, no timeout" (projector 03) | "Now it asks 2 times and finishes." |
| 10 | "Laravel API for enrollment drafts" (CONTENT §7b) | "Care teams can save a half-done patient sign-up and finish it later." |
| 11 | "a lab catalog" (CONTENT §2) | "A list of lab tests for the lab screens." |
| 12 | "multi-tenant security fixes" (CONTENT §2) | "Fixes that keep each organization's records away from the others." |
| 13 | "Decision records, automated quality gates" (CONTENT §2) | "Each decision is written down. Automatic checks stop a change that breaks a rule." |
| 14 | "The institute's one-page site, built on Next.js." (projector 04) | "The institute's public website, on one page." |
| 15 | "Sign people in to an on-chain wallet." (projector 05) | "Sign-in and dashboard screens for a crypto wallet." |
| 16 | "Passkey, MetaMask or WalletConnect" (projector 05) | "Sign in with a passkey (no password) or an existing wallet." |
| 17 | "Frontend, UI layer" (projector 05 role) | "Frontend. Built the screens; teammates built the wallet." |
| 18 | "Rebuild the video platform on Nuxt 3: 34 routes, 270+ components." (projector 06) | "The video-learning platform, rebuilt from an empty page: 34 pages." |
| 19 | "Stripe, Apple and Google subscriptions" (projector 06) | "Members subscribe on the web or in the iPhone and Android apps." |
| 20 | "HLS player with quality selector and premium paywall" (CONTENT §3) | "A video player with a quality menu. Premium videos open for members only." |
| 21 | "Live streaming on AWS IVS with realtime chat and moderation" (caseNarratives) | "Live classes with a live chat that moderators control." |
| 22 | "English and Arabic, right-to-left layout" (CONTENT §3) | "The whole site also works in Arabic, read from right to left." |
| 23 | "A grocery app for iPhone and Android, from one React Native codebase." (projector 07) | "One grocery app, built once for iPhone and Android." |
| 24 | "A children's reading app around a PDF and EPUB reader." (projector 08) | "A reading app for children. Books open inside the app." |
| 25 | "Progress on every book" (projector 08) | "It remembers the page in every book." |
| 26 | "About 14 releases, RN 0.63 → 0.81" (CONTENT §4) | "About 14 updates in both app stores. Kept current through three major upgrades." |
| 27 | "Quizzes as chat conversations, with text, media, choices and timers." (projector 09) | "Quizzes that run like a chat: messages, pictures, answer buttons and timers." |
| 28 | "One reusable React Native package, ported to the web" (projector 09) | "Built once, then used again on phones and on the web." |
| 29 | "Push notifications with deep links" (CONTENT §4) | "A notification opens the right book." |
| 30 | "Per-component builds cut a Button-only consumer's JavaScript by 96.6%." (caseNarratives) | "An app that uses only the button downloads 96.6% less code." |
| 31 | "Built to WCAG 2.1 AA floors with automated, rendered evidence" (CONTENT §6b) | "Built to the WCAG 2.1 AA accessibility level, with automatic checks on screen." (Never write "compliant".) |
| 32 | "Full stack since 2026" (CONTENT §0) | "Also builds the server side since 2026." |
| 33 | "Strict CSP on Vercel. Images 972 KB → 337 KB" (CONTENT §7) | "Strict rules on what the site may load. Images cut from 972 KB to 337 KB." |
| 34 | "Server-authoritative with bots" (Za!, CONTENT §7b) | "The server keeps every game fair. Computer players can join." |
| 35 | "16 security and tenant-isolation tests" (Offday) | "16 tests prove one team never sees another team's data." |

## 3. Display rules

### First screen

1. The first screen holds four things: the name, one sentence (what he builds, for whom), one large piece of work, and one or two results. Nothing else competes.
2. Show one project large. Show the names of two or three more, as text. Do not show more than three readable project names above the fold.
3. The name is at text size or larger (round-6 rule). A recruiter reads it in five seconds.
4. The identity sentence has 20 words or fewer and no technology names. Proposed: "Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them." The sub-line stays: "Part of two platform rewrites. Based in Kosovo, working remotely."
5. One clear action: "See the work" or a scroll cue, plus "Download CV". No more than two.

### Images

6. **Real public screens first.** Use the store and website captures from `public/showcase/` and `public/mobile/`. Use a recreation only where the real screen is private (care platform, Design System v2, the reader). Label each recreation in its caption.
7. **Never upscale.** Show an image at its native pixels or smaller. Soft text is a defect.
8. **Crop to the part that proves the result,** and crop on whole UI rows. Never cut a line of text or a button in half.
9. **One ratio for each set.** Web screens 16:10. Phone screens at their own ratio in a slot of the same ratio. If the slot and the screen differ, change the slot, not the screen. Never centre a screen on a field of colour (round-6 rule).
10. **No device mockups.** No bezel, no notch, no hand, no tilted phone, no fan of devices. A 1 px line and the screen's own corner radius are enough. (CONTENT §4 already says "not an iPhone mockup".)
11. **No shadows under screens.** The ground carries the depth. Use a tint taken from the screen (sampled-ground) or plain paper.
12. **Phone layout:** crop the proving part at a readable size (text in the image at 11 px or more). Never shrink the desktop crop.
13. Every image has a width and height, an AVIF or WebP file at 2× density, and alt text that names the screen.

### Motion and hover

14. Motion shows a change of state only: a row becomes current, a screen replaces a screen, a result appears. Nothing loops. Nothing plays on load except one fade of the first screen.
15. Durations: 120 to 300 ms, ease-out. Cross-fade 200 ms. A line draws in 180 ms (the loop canon, and Emil Kowalski's rule of under 300 ms).
16. Keyboard moves have no animation (Emil Kowalski's rule for actions done many times).
17. Hover: change opacity, a 1 px ring, or the page tint. No scale above 1.02, no tilt, no parallax, no cursor that follows the mouse.
18. Video: muted, poster frame first, plays only on hover or focus, stops off-screen. Under reduced motion, show the poster.
19. Hold about 60 fps on a mid-range phone.

### How many projects

20. Home page: 6 to 10 projects. Full case pages: 3 to 5 (NN/g). The other projects go into one index of one-line rows (title · year · role · one line).
21. Order by what the reader needs, not by date: the strongest result first (Design System v2 or the care platform), then the live public products (Bayyinah TV, Viva Fresh, Dukagjini Bookstore, Incentiv), then the rest.

### Case page structure (`AisleCasePage.tsx`)

22. Title line = the result in plain words. The project name is the small line above it. Example: name "Care-management API", title "One billing report: 16 requests became 2".
23. Under the title: one sentence (≤ 25 words) on what the product is and who uses it.
24. A facts row of four cells: Role · Years · Platforms · Live link. The stack is not in this row.
25. One hero image or live recreation, full column width, cropped to the proving part.
26. Three short sections with plain headings: "The product", "What was built", "The result". Each 55 words or fewer. "What was built" names two or three decisions and what each one caused.
27. Two or three numbers in a readout row, each with a plain label ("2 database requests, not 16").
28. The stack line and the engineering detail come last, under a heading such as "For engineers". An engineer finds it. A recruiter can stop before it.
29. End with "Next case" and the CV link. 600 words or fewer above the stack line.

## 4. New directions

Each direction keeps three things that scored well in the loop: projector's first screen (name, one sentence, one frame, two results), sampled-ground's colour taken from the screen, and year-stack's strike-and-write rewrite. Each also applies the copy rules in §2. No id below is used in `src/drafts/`.

### D1. `two-readers`

- **Hook:** a switch at the top: "Read as: Hiring manager · Engineer". The default is "Hiring manager". Turn it, and every row rewrites itself with year-stack's strike-and-write: the plain line is struck and the technical line writes in. The same facts, two audiences. The page proves the skill a design engineer sells: say one thing two ways, correctly.
- **First screen:** the name and the identity sentence (§3 rule 4) at the top left; the switch under it; projector's log with rows 01 and 02 in plain words; projector's frame at the right with the Design System v2 plate. One result band.
- **How projects are shown:** projector's log and fixed frame. In "Engineer" mode the hairline goes to the technical part of the plate (the source row, the 16 → 2), and the stack line appears under each row. In "Hiring manager" mode the stack line is hidden.
- **Motion:** strike 160 ms, write 240 ms, rows rewrite top to bottom with a 30 ms stagger. Reduced motion: the text swaps at once.
- **Palette:** paper `#F3EFE6`, ink `#1B1A17`, muted `#5E5A52`. The result band takes the current screen's hue (`oklch(0.42 0.13 h)`). Engineer mode keeps the same palette; only the type changes.
- **Fonts:** Newsreader (`public/fonts/creative/Newsreader-Latin.woff2`) for the plain mode; JetBrains Mono (`public/fonts/creative/JetBrainsMono-Latin.woff2`) for the engineer mode. The face change is the signal that the reader changed.
- **Why it is not generic:** no other portfolio in §1 rewrites its own copy for a second reader. The switch is the reason to remember the page, and it solves the owner's copy problem without deleting the engineering facts.

### D2. `true-colour`

- **Hook:** one real screen fills each viewport at its native pixels, and the whole page takes that screen's colour. The visitor sees the product before any words.
- **First screen:** a slim numbered rail at the left (projector's log as 10 numerals and short names, 200 px wide). In the middle, the Bayyinah TV pricing page at native size on a ground of its own hue. Above the screen, the result in display type: "Members subscribe on the web, iPhone or Android." The name and identity sentence at the top of the rail.
- **How projects are shown:** one project for each viewport, scroll snap off (native scroll). The ground, the rail and the result band change colour with one circular spread from the screen's centre, 280 ms (sampled-ground's mechanism). The rail marks the current numeral. The problem line sits under the screen at text size.
- **Palette:** computed per screen: ground `oklch(0.95 0.035 h)`, ink `oklch(0.30 0.11 h)`, band `oklch(0.42 0.13 h)`. The index and the footer are grey with no hue.
- **Fonts:** Gentrit Display at width 110, weight 760 for results; Gentrit Text for everything else (`GentritDisplay-Latin.woff2`, `GentritText-Latin.woff2`).
- **Why it is not generic:** a full-bleed project stack picks its colours by hand. Here nobody picks a colour, and the screen is never on a mockup. It differs from `sampled-frame`: no sticky frame, the screen is the page.

### D3. `proof-tiles`

- **Hook:** the familiar grid of designeng.tools and rauno.me's craft page, with one rule they do not have: every tile is a crop of the part that proves its caption, and its caption is a result.
- **First screen:** the name and identity sentence across the top (one line each). Under it, six tiles in a 3 × 2 grid, all 16:10: the specimen's source row, the care card's organization switcher, the 16 → 2 number plate, the Bayyinah TV pricing switch, the Viva Fresh category row, the Incentiv passkey button. Each tile has one caption line (≤ 10 words, the result) and a small line (name · year).
- **How projects are shown:** a tile on focus or hover tints the page ground with its sampled hue (sampled-ground), and a 1 px ring marks the proving part in the crop. Click opens the case page. Rows 07 to 10 follow in a second grid, then the index of 30.
- **Motion:** ground tint 200 ms; ring 120 ms; no lift, no scale. Reduced motion: the ring appears, the tint changes at once.
- **Palette:** neutral ground `#ECECE8`, ink `#111111`, tile grounds sampled from each screen.
- **Fonts:** Archivo (`public/fonts/Archivo.woff2`) for captions and the name; Martian Mono (`public/fonts/MartianMono.woff2`) for years and numbers.
- **Why it is not generic:** a normal grid shows whole thumbnails with project names. These tiles are evidence: each crop is the pixel that proves the words under it. It is also the most familiar layout for a recruiter, so it has the lowest reading cost of the four.

### D4. `then-now`

- **Hook:** every row is a change with a before and an after. The before is struck, the after writes in (year-stack's rewrite). Seniority shows as change made to live products.
- **First screen:** the name and identity sentence; then row 01 at display size: "A billing report asked the database 16 times and gave up" struck, "Now it asks 2 times and finishes" written. Projector's frame at the right shows the 16 → 2 plate.
- **How projects are shown:** projector's log and frame. Rows that have a true before and after lead: care API (16 → 2), care platform (old framework → rebuilt screen by screen), Read to Feed (three major upgrades, about 14 updates), Bayyinah TV (first version → rebuilt from an empty page), Design System v2 (a Button-only app downloads 96.6% less code), Snaxx Tech (images 972 KB → 337 KB). Rows with no before (Viva Fresh, Dukagjini Bookstore, Incentiv) show "Shipped" and their store result.
- **Motion:** strike 200 ms, write 260 ms, then the hairline 180 ms into the frame. Reduced motion: both states show, the before in muted grey.
- **Palette:** paper `#F6F5F0`, ink `#121212`, struck text `#8A877E`, the "now" band `#2348D8`. One accent only.
- **Fonts:** Anton (`public/fonts/creative/Anton-Latin.woff2`) for the before and after numbers; Literata (`public/fonts/creative/Literata-Latin.woff2`) for the sentences.
- **Why it is not generic:** most portfolios show finished products. This page shows the change, which is what a founder pays for. It must never invent a before: a row with no measured before says "Shipped".

## 5. Projector copy pass

Exact text for `src/drafts/projector/data.ts`. Fields: `project` (title), `line` (problem), `result`, `role`. `year` and `link` stay as they are. The last column names the source of each fact.

| Row | Title | Problem (`line`) | Result | Role | Fact source |
| --- | --- | --- | --- | --- | --- |
| 01 | Design System v2 | The new care dashboard needed one set of buttons, menus and forms. | 36 building blocks, released 20 times in about six weeks. | Design system | caseNarratives `design-system-react` (shared base of controls for the new React dashboard; Button, Combobox, Datepicker, Toast); CONTENT §6b (36, 20 releases, about six weeks) |
| 02 | Care-management platform | Many care organizations use the same system. | Each one sees only its own patients. | Frontend, rebuilt screen by screen | CONTENT §2 (many client organizations share one system; data kept separate; route-by-route move) |
| 03 | Care platform, server side | One billing report asked the database 16 times and gave up. | Now it asks 2 times and finishes. | Full stack | CONTENT §2 facts ("Report query 16 → 2, no more timeouts"); projects.ts `care-api` ("no longer times out") |
| 04 | Bayyinah institute website | The institute's public website, on one page. | Live at bayyinah.org, with links to both app stores. | Frontend | projects.ts `bayyinah-institute` (one-page site; links to the mobile apps in both stores); CONTENT §3 (owner: built bayyinah.org) |
| 05 | Incentiv | Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet. | Passkey (no password) or wallet sign-in, in English and French. | Frontend, the screens | caseNarratives `incentiv` (passkey or external wallet; EN/FR; teammates built the wallet and blockchain layer) |
| 06 | Bayyinah TV | The video-learning platform, rebuilt from an empty page: 34 pages. | Members subscribe on the web, iPhone or Android. | Frontend, core team | caseNarratives `bayyinah-tv` (rebuild from an empty template; 34 routes; Stripe, Apple and Google subscriptions; same web app inside the iOS and Android apps) |
| 07 | Viva Fresh | One grocery app, built once for iPhone and Android. | Shopping in Albanian, live in both app stores. | Mobile | caseNarratives `viva-fresh` (one React Native codebase; Albanian; live in the App Store and on Google Play) |
| 08 | Read to Feed | A reading app for children. Books open inside the app. | It remembers the page. About 14 updates in both stores. | Mobile | CONTENT §4 (PDF and EPUB reader with progress tracking; about 14 releases to both stores) |
| 09 | Chat quiz engine | Quizzes that run like a chat: messages, pictures, answer buttons and timers. | Built once, used again on phones and the web. | Mobile | CONTENT §4 and §7b (reusable React Native package; text, media, choices, timers; TypeScript web port) |
| 10 | Dukagjini Bookstore | A publisher's bookshop app for iPhone and Android. | Search, sales and checkout, live in both app stores. | Mobile | caseNarratives `dukagjini-bookstore` (search, sales, promo-code checkout; live in the App Store and on Google Play) |

Notes for the builder:

- Row 03 plate note: change "One billing report, Laravel API" to "One billing report, before and after". Plate unit: "queries" → "database requests".
- Row 09 plate note: change "Text, media, choices and timers, in React Native and on the web" to "Messages, pictures, choices and timers, on phones and the web". The title "Chat quiz engine" replaces "Chatbot runtime library" on the home page only; the index keeps the original name.
- Row 06 says "34 pages" for 34 routes. A route here is one page address, so the count stays true. "270+ components" moves to the case page.
- Row 08: "remembers the page" is the plain form of "progress tracking on every book". It makes no claim about a user count.
- Identity line (`Draft.tsx` h1): "Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them." It replaces "from the design system to the API behind them".
- Row 02 role: the round-6 review asked to move the parity fact to the role line. "Frontend, rebuilt screen by screen" keeps it in plain words. The case page states the check: "each screen is checked against the old app before it moves".

## Sources

- Portfolios: rauno.me, rauno.me/craft, emilkowal.ski, paco.me, brittanychiang.com, leerob.com, joshwcomeau.com/about-josh, brianlovin.com, jakub.kr, maggieappleton.com, raphaelsalaja.com, marcel.io, tonyward.dev, offgrid.inc, mek.gallery, uselayouts.com, designeng.tools, designeer.xyz, desengs.com, elliott.mangham.dev, pacomepertant.com.
- Award lists: awwwards.com/websites/winner_category_portfolio; awwwards.com/sites/elliott-mangham; creativebloq.com/news/3d-car-portfolio (Bruno Simon); muz.li top-100 portfolio list.
- Articles: nngroup.com/articles/ux-design-portfolios; newsletter.uxuniversity.io/p/a-hiring-manager-will-spend-6-seconds; uxplaybook.org/articles/ux-case-study-minto-pyramid-structure-guide; uxdesigninstitute.com/blog/hiring-managers-ux-portfolio; dev.to/brianyoung/how-to-write-developer-project-case-studies-recruiters-can-actually-understand-4oe4; hontran.dev/blog/best-award-winning-websites-2026; emilkowal.ski/ui/great-animations.
- Not reachable on 2026-10-05: dennissnellenberg.com (HTTP 403), floguo.com (no DNS), uxtools.co (no DNS).
