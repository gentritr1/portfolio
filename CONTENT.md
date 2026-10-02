# CONTENT.md — the copy and facts for every section

All facts below come from git history. Do not invent numbers. Do not add product names. Keep copy in plain English, short sentences, no metaphors, no buzzwords. Every number here is safe to show.

---

## 0. Hero

**Name:** Gentrit Rashiti
**Role line:** Frontend & Mobile Developer → Full Stack
**One-liner:** Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.
**Secondary:** 5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working remotely.
**CTAs:** "See the work" (scroll), "Download CV" (link to `/Gentrit-Rashiti-CV.pdf`, copy it into `public/` from `~/Desktop/Gentrit-CV/Gentrit-Rashiti-CV.pdf`).

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
**Role:** Software developer on the core team: frontend and mobile first, full stack since 2026.

**Story (3 short paragraphs):**
1. The platform helps care teams monitor patients remotely: vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations run on one system, so every screen must keep each organization's data separate and respect each user's role.
2. In 2026 the platform moved from Vue (Nuxt 2) to React, one route at a time. Each screen was inventoried from the old app, rebuilt in React, then proven with automated parity tests that run the same scenario against the old and the new app. The work is recorded in 31 architecture decision records, and CI gates check types, module boundaries, dead code, bundle size and translations on every merge.
3. The backend (Laravel) gained program enrollment drafts, a standardized lab catalog, timezone-correct scheduling and multi-tenant security fixes. One billing report used to time out at 60 seconds; its 16 patient queries became one query plus one aggregate, so it no longer grows with the date range.

**Facts list (chips):**
- Vue → React rewrite, route by route, parity-tested
- 31 architecture decision records
- Patient profile, care plans, labs & vitals, claims, calls
- Multi-tenant: data separation, roles, timezone correctness
- Laravel API: enrollment, lab catalog, 70 test files added
- Report query 16 → 2, no more timeouts
- AI-assisted QA scenarios + CI quality gates
- 34-component React design system, WCAG 2.1 AA
- 4 languages: EN, DE, ES, TR

**Stack:** React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright · Laravel 13, PHP 8.3, MySQL, Redis, Pest · Twilio, Chime, Pusher, ECharts

**Live recreation (invented data, no brand):** "Vitals trend card". A small card for a fictional patient ("Patient 4821"), showing a 14-day blood-pressure sparkline with a threshold band; two readings cross the threshold and show an alert dot; a toggle switches units; a role chip ("Care manager") and an organization switcher ("Northwind Clinic ▾ / Harbor Health") demonstrate multi-tenancy — switching the org swaps the dataset and the accent colour instantly. Keep it to one card plus the switcher.

---

## 3. World: VIDEO STREAMING — Vianova (client project), 2023 – 2026

**Eyebrow:** Streaming · Subscriptions · Web
**Title:** A video-learning platform, rebuilt from scratch with live streams
**Role:** Frontend developer on the core team. Second platform rewrite.

**Story:**
1. A video-on-demand and live-streaming platform for a learning community, with courses, playlists, learning progress, a scripture reader, and a subscription business: web and in-app plans, gifting, promo codes and lifetime plans. Its second version started in September 2023 from an empty Nuxt 3 template: localization, environment configuration and the API layer came first, then the product. The new web app replaced the earlier one and also runs inside the native mobile app.
2. The live page has low-latency live video with a realtime comment stream, pinned comments, moderation (mute, report), RSVP and reminders, and study materials next to the stream. The on-demand player has HLS quality selection, autoplay, episode sync, viewing history and a paywall for premium content.
3. The subscription flows cover dynamic pricing from the API, Stripe checkout, Apple and Google Play subscriptions with cancellation surveys, gift subscriptions in three steps, promo-code activation, and the English/Arabic (RTL) interface.

**Facts list:**
- Full rebuild on Nuxt 3, from an empty template to production
- Live streaming with realtime chat, pinned comments and moderation
- HLS player with quality selector and premium paywall
- Stripe + Apple + Google Play subscriptions, gifting, promo codes
- 34 routes, 270+ components, 25 stores
- English and Arabic, right-to-left layout
- Same web app runs inside the native mobile app

**Stack:** Nuxt 3, Vue 3, TypeScript, Pinia, video.js + HLS, AWS IVS, Pusher, Stripe, Firebase, Tailwind

**Live recreation:** "Live room". A 16:9 player frame with a looping subtle gradient "signal" (no real video), a LIVE badge with a viewer count that ticks, a quality menu (Auto / 1080p / 720p / 480p) that opens on click, and a chat column where invented messages arrive every ~2 s, one pinned message at the top, and a mute action on hover. A "Premium" lock state can be toggled to show the paywall overlay with a plan card ("Monthly $12 · Yearly $99"). Must pause when off-screen and respect reduced motion.

---

## 4. World: E-READING & MOBILE — Vianova (client projects), 2021 – 2025

**Eyebrow:** Mobile · iOS + Android · Reading
**Title:** A children's reading app, four years of releases
**Role:** Mobile developer on a small team, 2022 – 2025.

**Story:**
1. Children read books in the app, scan their own books by ISBN barcode, take quizzes as chatbot conversations, and earn badges and streaks. Parents verify accounts by email.
2. The app has a reader for PDF and EPUB, with the EPUB library forked to add progress tracking; an EAN-13 barcode scanner built on the camera; gamification with badges, streaks, confetti and coach marks; push notifications with a notification center; a custom video player; and three languages.
3. About 14 releases went to both stores, and the app moved through three major React Native upgrades (0.63 → 0.66 → 0.74 → 0.81).

**Also in this world (two short cards):**
- **Bookstore app (2021–22):** React Native shopping app for a publisher: push notifications with deep links across all app states, animated book-detail header, swipeable modals, checkout with promo codes. Shipped iOS and Android.
- **Chatbot runtime library:** a reusable React Native package that plays scripted conversations (text, media, choices, ratings, timers). A message-queue engine, stall and duplicate guards, natural typing delays and a keyboard-aware chat list. A web port in TypeScript followed.

**Facts list:**
- PDF + EPUB reader (forked epub.js for progress)
- ISBN barcode scanning with the camera
- Badges, streaks, quizzes, confetti, coach marks
- Push notifications, deep links, notification center
- ~14 store releases, RN 0.63 → 0.81
- 3 languages

**Stack:** React Native, React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next

**Live recreation:** "Reader page". A phone-shaped frame (not an iPhone mockup, just a rounded device silhouette) showing an EPUB-style page of public-domain text (use a short passage from Alice's Adventures in Wonderland), with a font-size stepper (A- / A+) that reflows the text, a page-progress bar, a tap-to-flip page curl (simple 3D transform), and a badge toast that slides in ("Streak: 7 days") after the second flip. Beside it, a tiny barcode-scan moment: a card with a barcode SVG and a scanning line; on click it "reads" ISBN 978-0-14-143976-1 and shows a book card. Reduced motion: no scan line, no curl.

---

## 5. World: WEB3 — Incentiv, 2024

**Eyebrow:** Web3 · Smart wallet · Web
**Title:** The frontend of a smart-wallet dashboard
**Role:** Frontend developer, UI and app layer. The wallet and blockchain layer was built by teammates.

**Story:**
1. A dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet; the dashboard shows balances, assets, gas saved and transactions.
2. The UI layer covers the dashboard cards (gas saved, transactions, popular tokens), the asset list with grid/table switch, the balance popup with QR address view, the animated onboarding (nickname step), the sign-in overlay, public/private route middleware, the 404 state, the shared components (table, collapse, tooltip, inputs) and the English/French translations.

**Facts list:**
- Next.js 14 App Router, TypeScript, RTK Query
- Dashboard cards, asset list, balance popup with QR
- Passkey / wallet sign-in UI and onboarding animation
- Public/private routing middleware
- EN / FR

**Stack:** Next.js 14, React 18, TypeScript, Redux Toolkit + RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts

**Live recreation:** "Wallet card". A dark glass card with a balance ("12,480.00 INC" fictional token, "≈ $3,210"), a chip row (Gas saved · 42 tx), a "Receive" action that flips the card to a QR code (generate an SVG QR of the text `gentrit.portfolio`), and a "Sign in with passkey" button that plays a 3-step micro-sequence (fingerprint icon pulse → check → "Welcome, Gentrit"). No real chain calls.

---

## 6. AI DASHBOARDS — AvahiTech, freelance

**Eyebrow:** AI · Dashboards · Freelance
**Title:** A smart business dashboard with AI features
**Story (short):** A smart dashboard for a digital-transformation client, with AI features: professional headshot generation from uploaded photos, and an AI workplace assistant that goes from PDF upload to a chat about the document. Some backend features were added in Python (FastAPI).

**Live recreation (small):** "Document chat". A compact two-pane widget: left, a PDF-like page thumbnail with a highlighted paragraph; right, a chat where a question is typed by a typewriter effect and the answer streams in word by word, citing "page 3". One canned exchange, replayable with a button.

---

## 7. PERSONAL PROJECTS

- **Snaxx Tech studio site** — marketing site for an indie app studio: a three.js hero, a seamless cinemagraph video loop, Almanac visual theme, strict CSP on Vercel. Images 972 KB → 337 KB, deploy 28 MB → 9.5 MB. Assets: `public/personal/snaxx-hero.mp4`, `public/personal/hero-almanac-poster.jpg`, `app-*.webp`.
- **Offday** — multi-tenant time-off app: employee requests, manager approvals, team calendar with drag-select, invite links, streaming AI assistant, dark theme. Next.js 16, SQLite, Zod, Playwright (16 security and tenant-isolation tests).
- **Open source** — maintained forks of `epubjs-react-native` and `react-native-pdf`, used in a production reading app. GitHub: github.com/gentritr1

---

## 7b. All projects (index section, after Personal, before Skills)

**Title:** All projects
**Lede:** Every product I have worked on, in one list. Rows with a world link open the case study above.

Render as a compact, scannable index (not cards): grouped by employer, each row = name · years · role · stack · one line. Mono for years and stack, sans for the rest. Rows that map to a world carry a small accent swatch and link to the section id.

### Vianova (2021 – present)
| Project (generic name) | Years | Role | Stack | One line | World link |
|---|---|---|---|---|---|
| Care-management platform, React rewrite | 2026 | Frontend | React 19, TypeScript, TanStack, Zod, Vitest, Playwright | Route-by-route migration from Nuxt 2 with parity tests, 31 ADRs, CI gates | #healthcare |
| Care-management platform, Vue app | 2023 – 2026 | Frontend | Nuxt 2, Vue 2, Vuex, ECharts, Twilio, Chime | Patient profile, care plans, claims, vitals and labs, calls, timezone fixes, 4 locales | #healthcare |
| Care-management API | 2026 | Full stack | Laravel 13, PHP 8.3, MySQL, Redis, Pest | Enrollment drafts, lab catalog, multi-tenant fixes, report performance, 70 test files | #healthcare |
| Design system, React | 2026 | Design system | React 19, CSS Modules, Storybook, Changesets | 34 components, WCAG 2.1 AA contrast matrix, typed package, GitHub Packages releases | — |
| Design system, Vue | 2026 | Design system | Vue 2, Style Dictionary, Histoire, Playwright | Tokens from Figma, codemods, visual regression, health dashboard | — |
| Design dashboard (prototype) | 2026 | Frontend | React 19, Vite, Tailwind 4 | Call-activity screen on the design system with demo data; the design oracle for the rewrite | — |
| Video-learning platform, web | 2023 – 2026 | Frontend | Nuxt 3, Vue 3, Pinia, video.js, AWS IVS, Pusher, Stripe | Full rebuild on Nuxt 3; live streams, player, subscriptions, gifting, EN/AR | #streaming |
| Children's reading app | 2022 – 2025 | Mobile | React Native, Redux Toolkit, Firebase, Vision Camera, epub.js | PDF/EPUB reader, barcode scanning, gamification, ~14 releases, RN 0.63 → 0.81 | #reading |
| Bookstore app | 2021 – 2022 | Mobile | React Native, Redux, Firebase Messaging | Push notifications with deep links, animated details, checkout; iOS + Android | #reading |
| Chatbot runtime library | 2022 – 2025 | Mobile | React Native, Redux Toolkit | Message queue, stall and duplicate guards, typing delays, media items | #reading |
| Chatbot runtime, web port | 2025 | Frontend | React 19, TypeScript, Vite, Zustand | Library plus example app, moved to TypeScript | — |
| EPUB reader prototype | 2022 | Mobile | React Native, epub.js | Download, render and resize an EPUB; the seed of the reading app's reader | — |
| Donation and good-deeds app | 2021 – 2022 | Mobile | React Native, Redux Toolkit, Stripe, Firebase | Sign-up and account flows, Stripe donations and subscriptions, badges, video tasks; iOS + Android | — |
| Coaching app | 2022 – 2023 | Mobile | React Native, Redux Toolkit, React Navigation | Project setup, login flow with an organization step, daily calendar strip, reactions, dev/staging/release builds | — |
| Member portal, web | 2025 | Frontend | Next.js 15, TypeScript, RTK Query, next-intl, Pusher | Project foundation, route-protection middleware, external auth flow, app shell and layout | — |
| Fuel-station loyalty app | 2026 | Mobile | React Native 0.78 | arm64 simulator support, legacy architecture, shadow fixes | — |

### Incentiv (2024)
| Smart-wallet dashboard | 2024 | Frontend | Next.js 14, RTK Query, next-intl, Framer Motion | Dashboard cards, balance popup with QR, onboarding, routing middleware, EN/FR | #web3 |

### AvahiTech (freelance)
| Smart business dashboard with AI | — | Frontend · FastAPI | React, Python/FastAPI | Headshot generation, PDF-to-chat assistant | #ai |

### Personal
| Studio website | 2026 | Owner | React 19, Vite, three.js, Tailwind | 3D hero, cinemagraph loop, strict CSP; images 972 KB → 337 KB | #personal |
| Time-off app | 2026 | Owner | Next.js 16, SQLite, Zod, Playwright | Multi-tenant PTO with approvals, calendar, streaming assistant, 16 security tests | #personal |
| Open-source forks | 2022 | Maintainer | React Native | epubjs-react-native, react-native-pdf, used in production | #personal |
| Geo Guesser World 3D | 2026 | Mobile · co-built | Expo, React Native, MapLibre, Mapillary | Street-view guessing game, published on Google Play | — |
| FJALË | 2026 | Owner | Vanilla JS, PWA | Daily Albanian word game, 21k-word dictionary, offline play; live | — |
| Za! | 2026 | Owner | Node, WebSocket | Multiplayer pizza card game for 2–8 players, server-authoritative with bots; live | — |
| Morse Trainer | 2026 | Owner | JavaScript | Morse-code learning game with spaced repetition; live | — |
| Futurisma | 2026 | Owner | Three.js, TypeScript, Blender | Hover racer with seven circuits and weather, tide and day-night systems | — |
| Secret Dictator | 2026 | Owner | Three.js, TypeScript | Single-player social-deduction game against AI opponents in a 3D town | — |

Voice rule (owner, 2026-10-02): every project text is a general overview of what was built by the team, neutral voice, no "I led", no "top contributor", few "I"s. Role column uses neutral role words only.

## 8. Skills (compact)

Frontend: React, Next.js, Vue, Nuxt, TypeScript, Tailwind
Mobile: React Native, iOS, Android
Backend: Laravel / PHP, Python / FastAPI, MySQL, Redis
Quality: Playwright, Vitest, Pest, CI/CD
Services: Stripe, Firebase, AWS IVS, Twilio, Pusher
Localization: multi-language, Arabic RTL

## 9. Contact / footer

- Email: `[your.email@example.com]` (placeholder, Gentrit fills it)
- GitHub: github.com/gentritr1
- LinkedIn: `[linkedin.com/in/handle]` (placeholder)
- "Download CV" again.
- Footer line: "Built with React, Tailwind and motion. No screenshots of client work: every demo above is a recreation with invented data."
