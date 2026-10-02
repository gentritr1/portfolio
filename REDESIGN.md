# REDESIGN.md — "Control room" v2

Owner decision (2026-10-02): rebuild the portfolio from one long scroll into a short home plus project pages, under one identity: a broadcast / monitoring **control room**. This brief wins over DESIGN.md where they conflict; DESIGN.md is rewritten in phase 1 to match it. PRODUCT.md (public products named and linked, screenshots only from public pages, internal care-platform screens stay recreations) and CONTENT.md (facts, copy, links) stay the source of truth for content.

## Why

The v1 site is ~20,000 px of scroll, five worlds share one template, the same facts appear four times, and the identity is thin. Strong portfolios (Chiang, Snellenberg, Rauno, Yakushev, Mangham) separate a fast scan from deep stories, have one recognisable identity, and let the work carry the motion.

## Identity: the control room

- **Metaphor.** The site is a control room that monitors the products Gentrit has shipped. Domains are **channels**: CH01 Healthcare · CH02 Streaming · CH03 Mobile apps · CH04 Web3 · CH05 Web apps & AI · CH06 Games & personal (labels renamed 2026-10-02). The live demos are **monitors**. The project list is the **schedule**. A project page is a channel **tuned in**.
- **Tone.** Calm, precise, professional. Not retro kitsch, not neon cyberpunk, no fake CRT bloat. Think broadcast master-control and modern clinical monitoring: dark matte panels, hairline rules, small mono labels, one signal colour.
- **Colour.** Dark-first. Near-black panel greys (3–4 steps), hairlines, one **on-air signal** colour (warm signal red-orange or amber; pick one and use it only for "live" states, the active channel and focus). Each channel keeps a muted **channel tint** (reuse the v1 world accents, desaturated) used for its number, its rule and its monitor bezel. A light "daylight" theme stays available via the existing toggle and must look intentional, not inverted.
- **Type.** A characterful grotesk for display (tight, large, confident), a clean text face for body, and a mono for every label, number, time code and metadata. Not Inter, not Roboto. Labels are uppercase mono at 11–12 px with tracking; body is ≥ 16 px.
- **Signature details.** A masthead with "● ON AIR", the city and live local time (Europe/Belgrade time zone, label "KOS"); channel numbers; time codes (year ranges as `2023–26`); a thin signal line under the active channel; a subtle "tune-in" transition. Use them with restraint: each appears where it carries meaning, not everywhere.

## Information architecture

Routes (add `react-router` v7, declarative `BrowserRouter`, `Link` with `viewTransition`):

- `/` Home, 3–4 viewports:
  1. **Masthead + monitor wall** (first viewport): name, role line, one-line claim, ON AIR · KOS · local time, availability line, and the **channel switcher**: a strip of 5 featured channels; the active one shows its live recreation in a large **monitor** with a one-line caption and "Tune in →" to its page. Switch with click, number keys 1–5, and ←/→. Auto-advance is NOT used.
  2. **Schedule** (the index): every project as one row: time code · name · channel · role · stack (short) · links. Filter chips by channel (All + 6) with counts. On pointer devices, hovering a row shows a floating preview (screenshot or mini-screen) that follows the cursor (0.5–0.6 s ease-out in, scale 0.96→1, opacity). Clicking a row (or Enter) opens a **drawer** (right side on desktop, bottom sheet on phones) with the project summary (60–120 words), its screenshots (reuse the Showcase frames + dialog), stack, links, and "Full case study →" for featured ones. Featured rows go straight to their page.
  3. **About + contact** (one compact section): 3–4 sentences, the capability list as one dense line or a small grid, CV download, GitHub, email/LinkedIn when set.
  4. Footer: the sources line, © line.
- `/work/:slug` — 5 featured case studies: `care-platform`, `bayyinah-tv`, `read-to-feed`, `viva-fresh`, `incentiv`. Each page: channel header (CH number, title, time code, role, links) → the live recreation in a large monitor (where one exists; Viva Fresh uses a phone-frame gallery as its monitor) → story in three short blocks: **The product** / **What was built** / **Result** (60–90 words each, from CONTENT.md, neutral voice) → showcase galleries (existing Showcase component) → facts as a compact spec table (stack, platforms, years, scale numbers) → "Next channel →" to the next featured project. Unknown slug → a styled "No signal" 404 with a link home.
- The AI dashboard and the other 23 projects live in the schedule + drawer only.
- Remove from the home: the five long world sections, Capabilities, Skills, Personal as separate sections. Their content moves into the schedule, drawers, case pages and About. Keep the recreation components and Showcase; delete dead code at the end.

## Data

One source: `src/content/projects.ts` becomes the single model. Each project: `slug`, `name`, `channel`, `featured?: { order, monitor: 'recreation-key' | 'gallery', story: {product, built, result}, facts }`, `years`, `role`, `stack`, `line` (≤ 14 words), `summary` (60–120 words, for the drawer), `links`, `media` (thumb + gallery items), `world` accent key. Case-study copy comes from CONTENT.md, condensed. Keep the neutral voice rule.

## Motion (impeccable craft floor + Emil rules)

- Motion confirms intent; the page itself is still. No scroll-triggered text reveals on every section, no preloader, no scroll-jacking.
- Durations: micro 150–250 ms; previews 500–600 ms ease-out; route transitions 400–600 ms via the View Transitions API (shared element: the monitor / row thumbnail morphs into the case-page monitor; `view-transition-name` per slug). Channel switch: the monitor content crossfades with a 1–2 frame "tune" (a brief horizontal scan line / slight blur-in, ≤ 280 ms). Springs only for release moments (drawer, dialog).
- Everything has a reduced-motion path (instant or opacity-only). Off-screen recreations pause (they already do).

## Quality floor

- Lighthouse-level hygiene: no layout shift (intrinsic sizes), lazy media, route-level code splitting (`React.lazy` for case pages and recreations) to drop the main chunk well under 500 kB, fonts with swap + preconnect.
- Keyboard: every control reachable, visible focus, channel keys don't fire inside inputs, drawer and dialog trap focus and restore it, Escape closes.
- 375 / 820 / 1440 widths, dark + daylight, no horizontal scroll, touch targets ≥ 44 px.
- No emoji. Phosphor icons (light outside recreations). No raw hex in TSX.

## Phases

1. **Foundation**: router, data model migration, DESIGN.md rewrite (tokens, type, channel tints, signal colour, motion), shell (masthead/nav, footer, theme toggle, route transitions, 404), code splitting.
2. **Home**: monitor wall + channel switcher, schedule with filters + hover preview + drawer, about/contact.
3. **Case pages**: the five featured pages from one `CaseStudy` template with per-project content.
4. **Review**: fresh critique (impeccable critique/audit, design-taste pre-flight), one fix round.
5. **3D header (last)**: a subtle, performant 3D element in the masthead that expresses "exceptional products, smooth, with identity" (options researched first: e.g. a slowly orbiting cluster of device/screen panes showing the channel tints, a signal-wave surface, or a glass "monitor" object reacting to the pointer). Must lazy-load, cap DPR, pause off-screen, respect reduced motion (static poster), and stay under ~150 kB gzip including the 3D library. Built as a self-contained component so it can be reused elsewhere.
6. **Handoff**: `ASTRA-HANDOFF.md`, a prompt for the next design agent (Astra) with the concept, file map, tokens, components, what is done, and the next-level ideas, so iteration can continue there.
