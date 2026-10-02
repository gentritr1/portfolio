# CONTENT.md — the copy and facts for every section

All facts below come from git history. Do not invent numbers. Do not add product names. Keep copy in plain English, short sentences, no metaphors, no buzzwords. Every number here is safe to show.

---

## 0. Hero

**Name:** Gentrit Rashiti
**Role line:** Frontend & Mobile Developer → Full Stack
**One-liner:** I build web and mobile products from the first screen to release, in healthcare, video streaming, e-reading and Web3.
**Secondary:** 5+ years. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working remotely.
**CTAs:** "See the work" (scroll), "Download CV" (link to `/Gentrit-Rashiti-CV.pdf`, copy it into `public/` from `~/Desktop/Gentrit-CV/Gentrit-Rashiti-CV.pdf`).

## 1. What I do (capabilities strip, short)

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
**Role:** Software Developer, frontend and mobile first, full stack since 2026.

**Story (3 short paragraphs):**
1. The platform helps care teams monitor patients remotely: vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations run on one system, so every screen must keep each organization's data separate and respect each user's role.
2. In 2026 I led its rewrite from Vue (Nuxt 2) to React. Each screen was inventoried from the old app, rebuilt in React, then proven with automated parity tests that run the same scenario against the old and the new app. I wrote 31 architecture decision records and built the CI gates that check types, module boundaries, dead code, bundle size and translations on every merge.
3. On the backend (Laravel) I built program enrollment drafts, a standardized lab catalog, timezone-correct scheduling and multi-tenant security fixes. One billing report timed out at 60 seconds; I changed 16 patient queries into one query plus one aggregate, so it no longer grows with the date range.

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
**Title:** A subscription video-learning platform with live streams
**Role:** Lead frontend developer (top contributor).

**Story:**
1. A video-on-demand and live-streaming platform for a learning community, with courses, playlists, learning progress, a scripture reader, and a subscription business: web and in-app plans, gifting, promo codes and lifetime plans.
2. I built the live page: low-latency live video with a realtime comment stream, pinned comments, moderation (mute, report), RSVP and reminders, and study materials next to the stream. For on-demand video I built the player with HLS quality selection, autoplay, episode sync, viewing history and a paywall for premium content.
3. I owned the subscription flows: dynamic pricing from the API, Stripe checkout, Apple and Google Play subscriptions with cancellation surveys, gift subscriptions in three steps, promo-code activation, and the English/Arabic (RTL) interface.

**Facts list:**
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
**Role:** Lead mobile developer (79% of commits).

**Story:**
1. Children read books in the app, scan their own books by ISBN barcode, take quizzes as chatbot conversations, and earn badges and streaks. Parents verify accounts by email.
2. I built the reader for PDF and EPUB, forking the EPUB library to add progress tracking; the barcode scanner (EAN-13) with a camera hook; the gamification (badges, streaks, confetti, coach marks); push notifications with a notification center; the custom video player; and three languages.
3. I shipped about 14 releases to both stores and carried the app through three major React Native upgrades (0.63 → 0.66 → 0.74 → 0.81).

**Also in this world (two short cards):**
- **Bookstore app (2021–22):** React Native shopping app for a publisher: push notifications with deep links across all app states, animated book-detail header, swipeable modals, checkout with promo codes. Shipped iOS and Android.
- **Chatbot runtime library:** a reusable React Native package that plays scripted conversations (text, media, choices, ratings, timers). I wrote the message-queue engine, the stall and duplicate guards, natural typing delays and the keyboard-aware chat list. Later started the web port in TypeScript.

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
**Role:** Frontend Developer (UI and app layer; the wallet/blockchain layer was built by teammates).

**Story:**
1. A dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet; the dashboard shows balances, assets, gas saved and transactions.
2. I built the UI layer: the dashboard cards (gas saved, transactions, popular tokens), the asset list with grid/table switch, the balance popup with QR address view, the animated onboarding (nickname step), the sign-in overlay, public/private route middleware, the 404 state, the shared components (table, collapse, tooltip, inputs) and the English/French translations.

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
**Story (short):** For a digital-transformation client I built the frontend of a smart dashboard with AI features: professional headshot generation from uploaded photos, and an AI workplace assistant that goes from PDF upload to a chat about the document. I also helped on backend features in Python (FastAPI).

**Live recreation (small):** "Document chat". A compact two-pane widget: left, a PDF-like page thumbnail with a highlighted paragraph; right, a chat where a question is typed by a typewriter effect and the answer streams in word by word, citing "page 3". One canned exchange, replayable with a button.

---

## 7. PERSONAL PROJECTS

- **Snaxx Tech studio site** — marketing site for an indie app studio: a three.js hero, a seamless cinemagraph video loop, Almanac visual theme, strict CSP on Vercel. Images 972 KB → 337 KB, deploy 28 MB → 9.5 MB. Assets: `public/personal/snaxx-hero.mp4`, `public/personal/hero-almanac-poster.jpg`, `app-*.webp`.
- **Offday** — multi-tenant time-off app: employee requests, manager approvals, team calendar with drag-select, invite links, streaming AI assistant, dark theme. Next.js 16, SQLite, Zod, Playwright (16 security and tenant-isolation tests).
- **Open source** — maintained forks of `epubjs-react-native` and `react-native-pdf`, used in a production reading app. GitHub: github.com/gentritr1

---

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
