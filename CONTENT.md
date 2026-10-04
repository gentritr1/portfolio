# CONTENT.md — the copy and facts for every section

Channel labels (owner, 2026-10-02): CH01 Healthcare, CH02 Streaming, CH03 Mobile apps, CH04 Web3, CH05 Web apps & AI, CH06 Games & personal.

Project facts below come from git history; contact and education details were confirmed by the owner. Do not invent numbers. Do not add product names, except public products, which are named and linked (§4 rule). Keep copy in plain English, short sentences, no metaphors, no buzzwords. Every number here is safe to show.

---

## 0. Hero

**Name:** Gentrit Rashiti
**Role line:** Frontend & Mobile Developer → Full Stack
**One-liner:** Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.
**Secondary:** 5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working remotely.
**CTAs:** "See the work" (scroll), "Download CV" (link to `/Gentrit-Rashiti-CV.pdf`; the editable source is `cv/Gentrit-Rashiti-CV.html`).

## 1. Capabilities (strip, short)

- Rewrites & migrations — move a live app to a new framework step by step, with parity checks.
- Mobile apps — iOS and Android, from build to store release and major upgrades.
- Multi-tenant platforms — separate data, roles and permissions for each client.
- Streaming & media — live streams, realtime chat, video on demand, PDF and EPUB reading.
- Payments — web and in-app subscriptions, gifts, promo codes.
- AI features — document chat, AI image generation, AI-assisted QA automation.
- Full stack — APIs, databases, background jobs, performance.

---

## 2. World: HEALTHCARE — Vianova, 2021 – present

**Eyebrow:** Healthcare · Care management · Web + backend
**Title:** A care-management platform, rebuilt one screen at a time
**Role:** Frontend and mobile, full stack since 2026

**Story (2 paragraphs):**
1. A care-management platform for remote patient monitoring. Care teams use it to follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations share one multi-tenant system, so each screen keeps each organization's data separate and respects each user's role.
2. The frontend moved from Vue (Nuxt 2) to React route by route, with parity tests that run each scenario against both apps, 31 architecture decision records and CI quality gates. The Laravel backend gained enrollment drafts, a lab catalog and multi-tenant security fixes; one billing report went from 16 queries to 2.

**Facts list:**
- Vue → React rewrite, route by route, parity-tested
- 31 architecture decision records, CI quality gates
- Patient profile, care plans, labs and vitals, claims, calls
- Multi-tenant: data separation, roles, timezones
- Laravel API: enrollment drafts, lab catalog, security fixes
- Report query 16 → 2, no more timeouts
- 4 languages: EN, DE, ES, TR

**Stack:** React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright · Laravel 13, PHP 8.3, MySQL, Redis, Pest · Twilio, Chime, Pusher, ECharts

**Live recreation (invented data, no brand):** "Vitals trend card". A small card for a fictional patient ("Patient 4821"), showing a 14-day blood-pressure sparkline with a threshold band; two readings cross the threshold and show an alert dot; a toggle switches units; a role chip ("Care manager") and an organization switcher ("Northwind Clinic ▾ / Harbor Health") demonstrate multi-tenancy — switching the org swaps the dataset and the accent colour instantly. Keep it to one card plus the switcher.

---

## 3. World: VIDEO STREAMING — Vianova (client project), 2023 – 2026

**Eyebrow:** Streaming · Subscriptions · Web
**Title:** A video-learning platform, rebuilt from scratch with live streams
**Role:** Frontend, core team

**Story (2 paragraphs):**
1. A video-learning platform for an online community: courses, playlists, learning progress, a scripture reader, on-demand video and live streams. Members pay through web and in-app subscriptions, gifts and promo codes. The same web app also runs inside the native mobile app.
2. Its second version was a full rebuild on Nuxt 3, from an empty template. It added live streaming with realtime chat and moderation, an HLS player with a paywall for premium content, Stripe, Apple and Google subscriptions, gifting, and an English/Arabic interface with right-to-left layout. The rebuild covers 34 routes and 270+ components.

**Facts list:**
- Full rebuild on Nuxt 3
- Live streaming with realtime chat and moderation
- HLS player with quality selector and premium paywall
- Stripe, Apple and Google subscriptions, gifting, promo codes
- 34 routes, 270+ components, 25 stores
- English and Arabic, right-to-left layout
- Same web app runs inside the native mobile app

**Stack:** Nuxt 3, Vue 3, TypeScript, Pinia, video.js + HLS, AWS IVS, Pusher, Stripe, Firebase, Tailwind

**Live recreation:** "Live room". A 16:9 player frame with a looping subtle gradient "signal" (no real video), a LIVE badge with a viewer count that ticks, a quality menu (Auto / 1080p / 720p / 480p) that opens on click, and a chat column where invented messages arrive every ~2 s, one pinned message at the top, and a mute action on hover. A "Premium" lock state can be toggled to show the paywall overlay with a plan card ("Monthly $12 · Yearly $99"). Must pause when off-screen and respect reduced motion.

Owner confirmed (2026-10-02): built bayyinah.org, Next.js, 2024–25; repo access lost.

**Showcases:** three `Showcase` blocks after the facts and stack, files in `public/showcase/bayyinah/`: Website (6 pages of https://bayyinahtv.com/), Mobile app (6 App Store frames; links https://apps.apple.com/us/app/bayyinah-tv/id1530635769 and https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah), Institute website (5 sections and 1 phone view of https://bayyinah.org/, a one-page Next.js site). Rule: public products are named and linked; screenshots come only from public pages (websites without login, store listings), never from a running app, behind a login or with user data; brands stay visible; the product is described, not called a client of the employer.

---

## 4. World: E-READING & MOBILE — Vianova (client projects), 2021 – 2025

**Eyebrow:** Mobile · iOS + Android · Reading
**Title:** A children's reading app, four years of releases
**Role:** Mobile, iOS and Android

**Story (2 paragraphs):**
1. A children's reading app for iOS and Android. Children read books, scan their own books by barcode, take quizzes as chat conversations, and earn badges and streaks. Parents verify accounts by email.
2. The app has a PDF and EPUB reader with progress tracking, an ISBN barcode scanner, gamification with badges, streaks and coach marks, push notifications with a notification center, and three languages. About 14 releases went to both stores, and the app moved from React Native 0.63 to 0.81 through three major upgrades.

**Also in this world (two short cards):**
- **Bookstore app, 2021 - 2022:** A React Native shopping app for a publisher, on iOS and Android. It has push notifications with deep links, an animated book-detail header, swipeable modals and checkout with promo codes.
- **Chatbot runtime library:** A reusable React Native package that plays scripted conversations with text, media, choices, ratings and timers. It has a message queue, stall and duplicate guards, natural typing delays and a web port in TypeScript.

**Facts list:**
- PDF and EPUB reader with progress tracking
- ISBN barcode scanning with the camera
- Badges, streaks, quizzes, coach marks
- Push notifications, deep links, notification center
- About 14 store releases, RN 0.63 → 0.81
- 3 languages

**Stack:** React Native, React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next

**Published apps strip:** after the narrative and the stage, full width. Title "Published apps", then one group for each app with the name the store shows: Read to Feed (4 frames), Dukagjini Bookstore (3 frames), Viva Fresh (6 frames: 3 iPhone, 3 Android). Each group has a scroll-snap row (6 columns from 1024 px) and pill links to its store pages; Read to Feed links to the Wayback captures ("App Store (archived)", "Google Play (archived)") because its listings are removed. A click on a frame opens it large in a native dialog. Files: `public/mobile/<app>-<n>.webp`, index thumbs in `public/mobile/thumbs/`.
- Rule (owner, 2026-10-02): public products are named and linked. Screenshots come only from public store pages or public web pages, never from a running app.

**Live recreation:** "Reader page". A phone-shaped frame (not an iPhone mockup, just a rounded device silhouette) showing an EPUB-style page of public-domain text (use a short passage from Alice's Adventures in Wonderland), with a font-size stepper (A- / A+) that reflows the text, a page-progress bar, a tap-to-flip page curl (simple 3D transform), and a badge toast that slides in ("Streak: 7 days") after the second flip. Beside it, a tiny barcode-scan moment: a card with a barcode SVG and a scanning line; on click it "reads" ISBN 978-0-14-143976-1 and shows a book card. Reduced motion: no scan line, no curl.

---

## 5. World: WEB3 — Incentiv, 2024

**Eyebrow:** Web3 · Smart wallet · Web
**Title:** The frontend of a smart-wallet dashboard
**Role:** Frontend, UI layer

**Story (2 paragraphs):**
1. A smart-wallet dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet, then see balances, assets, gas saved and transactions.
2. The frontend is built on Next.js 14 with the App Router and RTK Query. It covers the passkey and wallet sign-in UI, animated onboarding, dashboard cards, an asset list, a balance popup with a QR address, route middleware and English/French translations. Teammates built the wallet and blockchain layer.

**Facts list:**
- Next.js 14 App Router, TypeScript, RTK Query
- Passkey and wallet sign-in UI
- Dashboard cards, asset list, balance popup with QR
- Animated onboarding
- Public and private route middleware
- English and French

**Stack:** Next.js 14, React 18, TypeScript, Redux Toolkit + RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts

**Showcase:** one `Showcase` block "Incentiv" after the facts and stack, files in `public/showcase/incentiv/`: home and vision of https://incentiv.io/ and the public sign-in screen of https://portal.incentiv.io/; links Website, Portal, Docs (https://docs.incentiv.io/). Same rule as §3: public pages only, brand visible, no wallet connected.

**Live recreation:** "Wallet card". A dark glass card with a balance ("12,480.00 INC" fictional token, "≈ $3,210"), a chip row (Gas saved · 42 tx), a "Receive" action that flips the card to a QR code (generate an SVG QR of the text `gentrit.portfolio`), and a "Sign in with passkey" button that plays a 3-step micro-sequence (fingerprint icon pulse → check → "Welcome, Gentrit"). No real chain calls.

---

## 6. AI DASHBOARDS — AvahiTech, freelance

**Eyebrow:** AI · Dashboards · Freelance
**Title:** A smart business dashboard with AI features
**Role:** Frontend, freelance

**Story (2 paragraphs):**
1. A smart business dashboard for a digital-transformation client. Its AI features help staff with daily work: a headshot generator for professional profile photos, and a workplace assistant that answers questions about uploaded PDF documents.
2. The React frontend covers the dashboard and both AI flows: photo upload to generated headshots, and PDF upload to a chat about the document. Some backend features were added in Python with FastAPI.

**Facts list:**
- Headshot generation from uploaded photos
- PDF upload to document chat
- AI workplace assistant
- React dashboard frontend
- Python (FastAPI) backend features

**Live recreation (small):** "Document chat". A compact two-pane widget: left, a PDF-like page thumbnail with a highlighted paragraph; right, a chat where a question is typed by a typewriter effect and the answer streams in word by word, citing "page 3". One canned exchange, replayable with a button.

---

## 7. PERSONAL PROJECTS

- **Snaxx Tech studio site** — marketing site for an indie app studio: a three.js hero, a seamless cinemagraph video loop, Almanac visual theme, strict CSP on Vercel. Images 972 KB → 337 KB, deploy 28 MB → 9.5 MB.
- **Offday** — multi-tenant time-off app: employee requests, manager approvals, team calendar with drag-select, invite links, streaming AI assistant, dark theme. Next.js 16, SQLite, Zod, Playwright (16 security and tenant-isolation tests).
- **Open source** — maintained forks of `epubjs-react-native` and `react-native-pdf`, used in a production reading app. GitHub: github.com/gentritr1
- **Real screenshots** — the owner's own sites (Snaxx Tech, Offday, FJALË, Za!, Morse Trainer) show real captures from `public/personal/shots/` (alt text and sizes in `src/content/projects.ts`); the Offday card swaps to the dark capture in dark theme, and the index rows use 256 × 160 crops from `shots/thumbs/`.
- **Geo Guesser World 3D** — the index row uses a 256 × 160 crop of a Google Play frame (`public/mobile/thumbs/geoguesser.webp`). The Games mosaic stays 2 × 2: a fifth tile would break the grid.

---

## 7b. All projects (index section, after Personal, before Skills)

**Title:** All projects
**Lede:** Every product so far, in one list. Rows with a world link open the case study above.

Render as a compact, scannable index (not cards): grouped by employer, each row = name · years · role · stack · one line. Mono for years and stack, sans for the rest. Rows that map to a world carry a small accent swatch and link to the section id.

### Vianova (2021 – present)
| Project (generic name) | Years | Role | Stack | One line | World link |
|---|---|---|---|---|---|
| Care-management platform, React rewrite | 2026 | Frontend | React 19, TypeScript, TanStack, Zod, Vitest, Playwright | Route-by-route move from Nuxt 2 to React with parity tests, 31 ADRs, CI gates | #healthcare |
| Care-management platform, Vue app | 2023 – 2026 | Frontend | Nuxt 2, Vue 2, Vuex, ECharts, Twilio, Chime | Remote patient care: profiles, care plans, claims, vitals and labs, calls, 4 locales | #healthcare |
| Care-management API | 2026 | Full stack | Laravel 13, PHP 8.3, MySQL, Redis, Pest | Laravel API for enrollment drafts, a lab catalog, multi-tenant security and fast reports | #healthcare |
| Design system, React | 2026 | Design system | React 19, CSS Modules, Storybook, Changesets | 34 accessible components (WCAG 2.1 AA) in a typed package on GitHub Packages | — |
| Design system, Vue | 2026 | Design system | Vue 2, Style Dictionary, Histoire, Playwright | Design tokens from Figma, codemods, visual regression tests and a health dashboard | — |
| Design dashboard (prototype) | 2026 | Frontend | React 19, Vite, Tailwind 4 | Call-activity screen on the design system with demo data, as a design reference | — |
| Video-learning platform, web | 2023 – 2026 | Frontend | Nuxt 3, Vue 3, Pinia, video.js, AWS IVS, Pusher, Stripe | Full Nuxt 3 rebuild: live streams, HLS player, subscriptions, gifting, English/Arabic | #streaming |
| Children's reading app | 2022 – 2025 | Mobile | React Native, Redux Toolkit, Firebase, Vision Camera, epub.js | PDF/EPUB reader, barcode scanning, gamification, about 14 releases, RN 0.63 → 0.81 | #reading |
| Dukagjini Bookstore (featured case, owner 2026-10-04) | 2021 – 2022 | Mobile | React Native, Redux, Firebase Messaging | Book shopping with push deep links, animated details and checkout; iOS and Android | #reading |
| Chatbot runtime library | 2022 – 2025 | Mobile | React Native, Redux Toolkit | Plays scripted chat conversations: message queue, typing delays, media, duplicate guards | #reading |
| Chatbot runtime, web port | 2025 | Frontend | React 19, TypeScript, Vite, Zustand | TypeScript web version of the chatbot runtime, with an example app | — |
| EPUB reader prototype | 2022 | Mobile | React Native, epub.js | Downloads, renders and resizes an EPUB; the start of the reading app's reader | — |
| Sadaqah app for Islamic Relief USA (named, owner 2026-10-04) | 2021 – 2022 | Mobile, team member | React Native, Redux Toolkit, Stripe, Firebase | Donations and subscriptions with Stripe, badges, guided tasks and video. Owner's part (git, 60 of 184 commits): payment and subscription screens incl. cancel, badges, in-app web views, Android builds. No longer in the stores and no archived listing, so no screenshots; abstract thumbnail only | — |
| Coaching app | 2022 – 2023 | Mobile | React Native, Redux Toolkit, React Navigation | Organization sign-in, a daily calendar strip, reactions, and dev, staging and release builds | — |
| Member portal, web | 2025 | Frontend | Next.js 15, TypeScript, RTK Query, next-intl, Pusher | Member portal foundation: protected routes, external sign-in, app shell and layout | — |
| Grocery shopping and loyalty app | 2023 | Mobile | React Native, Redux Toolkit, Maps, Firebase | Online grocery orders with delivery slots, loyalty, wishlist and address search on a map | #reading |
| Fuel-station loyalty app | 2026 | Mobile | React Native 0.78 | Loyalty app upkeep: arm64 simulator support, legacy architecture, shadow fixes | — |

### Incentiv (2024)
| Smart-wallet dashboard | 2024 | Frontend | Next.js 14, RTK Query, next-intl, Framer Motion | Wallet dashboard with passkey sign-in, balance and QR, onboarding, EN/FR | #web3 |

### AvahiTech (freelance)
| Smart business dashboard with AI | — | Frontend · FastAPI | React, Python/FastAPI | Business dashboard with AI headshot generation and a PDF-to-chat assistant | #ai |

### Personal
| OFFBEAT, speaker brand concept (added by owner 2026-10-04) | 2026 | Owner | Next.js 16, React 19, TypeScript, Three.js, Web Audio | Fictional portable-speaker concept: 3D model, exploded view, working drum-machine studio; repo github.com/gentritr1/offbeat, not hosted | — |
| FORM, sculpture exhibition concept (added by owner 2026-10-04) | 2026 | Owner | WebGL, vanilla JS | Fictional sculpture exhibition: three mathematical forms, live materials, word-cast sculptures; repo github.com/gentritr1/form, not hosted | — |
| Studio website | 2026 | Owner | React 19, Vite, three.js, Tailwind | 3D hero, cinemagraph loop and strict CSP; images 972 KB → 337 KB | #personal |
| Time-off app | 2026 | Owner | Next.js 16, SQLite, Zod, Playwright | Multi-tenant time off with approvals, team calendar, AI assistant, 16 security tests | #personal |
| Open-source forks | 2022 | Maintainer | React Native | Forks of epubjs-react-native and react-native-pdf, used in a production reading app | #personal |
| Geo Guesser World 3D | 2026 | Mobile · co-built | Expo, React Native, MapLibre, Mapillary | Street-view guessing game, published on Google Play | — |
| FJALË | 2026 | Owner | Vanilla JS, PWA | Daily Albanian word game, 21k-word dictionary, archive, offline play; live on the web | — |
| Za! | 2026 | Owner | Node, WebSocket | Multiplayer pizza card game for 2–8 players, server-authoritative with bots; live | — |
| Morse Trainer | 2026 | Owner | JavaScript | Morse-code learning game with spaced repetition and Farnsworth timing; live | — |
| Futurisma | 2026 | Owner | Three.js, TypeScript, Blender | Hover racer with seven circuits and weather, tide and day-night systems | — |
| Secret Dictator | 2026 | Owner | Three.js, TypeScript | Single-player social-deduction game against AI opponents in a 3D town | — |

Voice rule (owner, 2026-10-02): every project text is an overview: what the product is, what the team built, and the skills it involved. Neutral voice: no first person, no "led", no "top contributor", no commit counts or shares of work. Keep numbers that describe the product or the result; drop numbers that describe effort. World stories have 2 paragraphs of 55 words or fewer; index lines have 14 words or fewer. Role words stay neutral.

## 8. Skills (compact)

Frontend: React, Next.js, Vue, Nuxt, TypeScript, Tailwind
Mobile: React Native, iOS, Android
Backend: Laravel / PHP, Python / FastAPI, MySQL, Redis
Quality: Playwright, Vitest, Pest, CI/CD
Services: Stripe, Firebase, AWS IVS, Twilio, Pusher
Localization: multi-language, Arabic RTL

## 9. Contact / footer

- Email: gentrit.rashiti2@gmail.com (owner, 2026-10-03)
- GitHub: github.com/gentritr1
- LinkedIn: https://www.linkedin.com/in/gentrit-rashiti-885662199 (owner, 2026-10-03)
- "Download CV" again.
- Footer line: "Built with React, Tailwind and motion. No screenshots of client work: every demo above is a recreation with invented data."

## 10. Education

Bachelor's degree, UBT (owner, 2026-10-03). No field of study, dates or further qualifications supplied; do not add them.
