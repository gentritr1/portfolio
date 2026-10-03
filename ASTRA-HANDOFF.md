# Brief for Astra: take the "control room" portfolio to the next level

You are the next design-engineering agent on Gentrit Rashiti's portfolio. The site is built, reviewed and live in the repo `github.com/gentritr1/portfolio` (branch `main`, local folder `~/Desktop/gentrit-portfolio`). Your job is to polish it and take it further, especially in 3D and motion, without losing what already works. Read this brief fully before you change anything.

## 1. The concept (keep it)

The site is a **broadcast / monitoring control room** that monitors the products Gentrit has shipped.

- **Channels** are domains: CH01 Healthcare · CH02 Streaming · CH03 Mobile apps · CH04 Web3 · CH05 Web apps & AI · CH06 Games & personal.
- **Monitors** are live, interactive recreations of the products (invented data).
- The **schedule** is the full project list, styled as a broadcast rundown.
- A project page is a **channel tuned in**.
- Tone: calm, precise, professional. Matte dark panels, hairlines, uppercase mono labels, ONE warm on-air signal colour (`--signal`), muted channel tints. Dark is the default; "daylight" is a deliberate light theme.
- Not wanted: neon cyberpunk, fake CRT bloat, retro kitsch, AI-purple gradients, glow baths.

## 2. Hard rules (do not break)

- `PRODUCT.md`: public products are named and linked. Screenshots come only from public pages and store listings, never from a running app or behind a login. Internal care-platform screens stay **recreations with invented data**. Never state that a product was a client of the employer.
- `CONTENT.md` is the source of truth for facts and numbers. Do not invent metrics. Write in a neutral voice: no "I led", no "top contributor".
- Accessibility: visible focus in `--signal`; touch targets of 44 px or more; full keyboard support (1–5 and ←/→ switch channels only while the wall is in view; the drawer and dialogs trap focus and Escape closes them); a reduced-motion path for every animation.
- Performance budgets:
  - main chunk ≤ ~110 kB gzip (now 107 kB);
  - each 3D chunk ≤ 25 kB gzip, lazy (now 17 kB);
  - CLS 0;
  - no horizontal scroll at 375, 820 or 1440.
- Never weaken a check to get green. Before you commit, run `npx tsc -b --noEmit`, `npm run build` and `npx -y impeccable detect src/`.

## 3. How it is built

Stack: Vite 8, React 19, TypeScript, Tailwind 4 (`@theme` tokens in `src/styles/globals.css`), react-router 7 (BrowserRouter, a manual View Transitions helper), `motion` (lazy only), Phosphor icons, OGL 1.0 for 3D.

| Area | Files |
|---|---|
| Brief and design system | `REDESIGN.md` (concept and phases), `DESIGN.md` (tokens, type, motion, components, routes), `PRODUCT.md`, `CONTENT.md` |
| Data (single source) | `src/content/projects.ts` (28 projects, `featured` blocks with story/readouts/facts, media galleries, links), `src/content/channels.ts` (channels; periods derived from projects), `src/content/links.ts` |
| Routes | `src/App.tsx`: `/` → `pages/HomePage.tsx`, `/work/:slug` → `pages/CaseStudyPage.tsx` (lazy), anything else → `pages/NoSignalPage.tsx` |
| Shell | `components/{Masthead,Footer,ThemeToggle,TransitionLink,ScrollToTop,Container}.tsx` |
| Control-room primitives | `components/{Monitor,ChannelBadge,SignalDot,MonitorGallery,Showcase,FrameDialog,Thumb}.tsx` |
| Home | `components/home/{Intro,MonitorWall,Schedule,HoverPreview,ProjectDrawer,About}.tsx` |
| Case pages | `components/case/{CaseHeader (lower third),Readouts,StoryBlocks,SpecSheet,NextChannel,useDocumentMeta}` |
| Recreations (live demos) | `src/worlds/{healthcare,streaming,reading,web3,ai}/Recreation.tsx`, registered in `src/lib/recreations.tsx` (lazy, with per-breakpoint aspect) |
| 3D | `components/signal-stack/{SignalStack.tsx (gating + lazy), scene.ts (OGL), shaders.ts, layout.ts (arc geometry), waves.ts (one waveform per channel), SignalStackCss.tsx (CSS fallback)}`, mounted through `components/HeaderVisual.tsx` in `home/Intro.tsx` |
| 3D lab | `lab.html` + `src/lab/main.tsx`: dev-only page with both themes, two sizes, channel buttons, a "force CSS" toggle and an FPS readout |

Run it with `source ~/.nvm/nvm.sh && npm run dev`, then open `/` and `/lab.html`. If you install a dependency while the dev server runs and the page shows "Invalid hook call", delete `node_modules/.vite` and restart. That error is a stale dependency cache, not a code bug.

## 4. The 3D today: "Signal Stack"

Six thin 16:10 glass panes, one per channel, stand in a shallow arc in the hero (380×220 slot on large screens; hidden below `md`).

- **Drawing.** The shader draws an SDF rounded rectangle, a 1 px rim in the channel tint, and a slow oscilloscope trace with a different waveform per channel. A faint key gradient and a 3 % scanline add depth.
- **Idle motion.** The stack yaws ±4° over 24 s. Each pane bobs 2 % over 8 s with phase offsets. Traces move at 0.25 cycles/s, and the active trace at 1 cycle/s.
- **Pointer tilt.** The stack tilts toward the pointer (5° yaw, 3° pitch) with damping k = 6/s. There is no tilt on touch.
- **Channel switch.** The active pane slides forward and the arc re-centres (450 ms). A 280 ms "tune" glitch turns the rim and trace to the signal colour, then they settle, an on-air dot appears, and the other panes dim to 40 %.
- **Gating.** The first paint is the CSS stack. WebGL2 loads at idle. Reduced motion, Save-Data, `deviceMemory < 4` or a missing WebGL2 all keep the CSS stack. The DPR is at most 1.5. The loop pauses off-screen and when the tab is hidden. If frames are slow, the scene drops to DPR 1, then falls back to CSS.
- **Cost.** 12 triangles, 6 draws, 60 fps on an M1, 17 kB gzip.
- Known difference: in the CSS fallback the active pane border is `--signal`; in WebGL it settles to the channel tint with an on-air dot. Pick one.

## 5. What to take further (ranked)

### Priority 0: what the two reviews found (2026-10-03). Do these first.

Two independent reviews ran on the production build: a recruiter review that also checked for slop, and a motion review that measured the build.
- Recruiter scores: distinctiveness 8/10, clarity 5/10, credibility 5/10, polish 7/10.
- Motion is measured and mostly excellent (baseline below).

The gap is clarity for recruiters, not craft.

**Recruiter clarity (Astra can do):**
1. **Hero for a recruiter in 5 seconds.**
   - Replace the chips with: role and seniority, one stack line ("React · React Native · Vue/Nuxt · Laravel"), and "Open to remote roles".
   - Put "Email" next to "CV" in the masthead. Show "CV" as a text label on phones, not an icon only.
2. **Plain words first, metaphor second.**
   - Make the domain name the primary label ("Healthcare"), with "CH01" as a small secondary mark.
   - Remove the duplicate index digit in the tabs: "CH03 3" next to "CH03 4" reads as a bug.
   - Rename "Tune in" → "Case study", "Schedule" → "All projects", "Next channel" → "Next project". Keep "ON AIR", the KOS clock and the mono labels as the identity layer.
3. **Lead with proof, not invented data.**
   - The default home monitor is the live room (fake "1,284 watching", invented chat, blurred video), about 700 px of fake data before any real proof.
   - Add a proof row to the monitor caption (store links, platforms, years, role, public install counts once the owner supplies them).
   - Make the default channel one whose first frame is real (store frames or public screenshots). The live demos stay one key away and on the case pages.
4. **Schedule.**
   - Inside each group, put shipped products first (store-listed, live) and prototypes after.
   - Fold minor rows behind "Show all".
   - Fix the AvahiTech row: it shows "·"; show "Freelance".
   - Fix the "REACT NAV…" truncation in the Coaching row and the stacked link wrap at 390 px.
5. **Result blocks.** They state outcomes, so they need outcome numbers from the owner (see Open owner items). Until those arrive, keep them short; do not pad them with code-size numbers such as route or component counts.

**Motion (Astra can do).** Measured on the production build, M1 Pro, real GPU:
1. **Route morph double image.** Old and new monitor snapshots have different aspect ratios and cross-fade for 480 ms, so text appears twice at 80–200 ms. Also, the recreation remounts and resets (the viewer count, chat and clock jump).
   - Fix: `view-transition-class: monitor`, a short fade on `::view-transition-old(*.monitor)`, and either keep the recreation state across the route or freeze it into a still for the morph.
2. **Back navigation has no view transition.** Forward morphs; back is instant. Add a reverse morph.
3. **Abrupt state changes.**
   - FrameDialog has no exit animation, and frames swap with no transition. Add a 150 ms fade/scale on exit and a short crossfade between frames.
   - The theme toggle switches the whole palette in one frame. Crossfade it with a root view transition, about 200 ms, and skip it under reduced motion.
   - The filter count and list height jump.
   - A second drawer open during the 260 ms close is ignored.
4. **Showcase hover zoom is 500 ms** (`Showcase.tsx:108`). Hover motion should stay at or under 300 ms.
5. **CSS fallback costs more than WebGL** on exactly the weak devices it serves: an endless `stroke-dashoffset` sweep, 26 % main thread versus 17 % for WebGL at 4× CPU. Make it static, or slow it and pause it off-screen.
6. **CLS is not exactly 0.**
   - The live chat inserts a message every 2 s (+0.0013 each). Reserve a fixed list height.
   - The font swap shifts the masthead at about 500 ms. Add `size-adjust` fallback metrics.

**Already fixed** (commit 7b6057e, verified on the production build):
- A layer-less `[data-channel]{transition:--tint}` rule cancelled every Tailwind transition on the same elements (drawer slide, hover preview, row and chip hovers). It is now in `@layer base`.
- The hover preview appeared at (0,0). It is now seeded from the last pointer position, and its follow speed no longer depends on the refresh rate.
- Phones loaded and ran the hidden 3D scene. It is now gated by `(min-width: 768px)`; phone blocking time went from 241–257 ms to 144–161 ms.

**Measured baseline (keep it).**

| Metric | Value |
|---|---|
| LCP | 0.33–0.40 s on `/`; 0.63–0.69 s on case pages |
| JS on `/` | 188 kB gzip (main 107, motion 41, scene 17) |
| Idle and scroll, desktop | p95 16.7 ms with the 3D and the live room together |
| 4× CPU at 390 px | p95 16.8 ms |
| Channel switch | 24–48 ms |
| Drawer, filter, dialog, theme | 16–32 ms |
| Route morph | first frame 40–73 ms after the click |
| Reduced motion | full pass |

### 3D and motion
1. **"Tune in" camera dolly.** When the visitor clicks "Tune in", move the camera into the active pane over about 450 ms, then hand off to the View Transition so the pane becomes the case-page monitor. This is the signature moment. Keep a reduced-motion path. Est. +1 kB.
2. **Waveform morph.** When the channel changes, morph the active trace from the old channel's waveform into the new one over 280 ms, instead of a hard swap. Est. +0.5 kB.
3. **Live texture on the active pane.** Show a 512 px AVIF still of that channel's recreation, lazy-loaded with one texture upload. This makes the 3D show the actual work. Est. +20 kB per channel, loaded on demand.
4. **3D on case pages.** Show a single pane behind the lower third, tinted by the channel. It stays still while the page is read and tilts slightly on hover. Reuse `scene.ts` with a one-pane layout.
5. **3D on the 404.** On the No-signal page, make the stack "lose signal": traces flatten and panes desaturate. This is a fun detail.
6. **Glass on strong GPUs only.** Add a real refraction upgrade (three.js `MeshPhysicalMaterial` transmission) in a separate chunk, gated by GPU tier and measured frame time. It costs about 120 kB, so it must never load on mid or low devices.
7. **Sound, off by default.** Synthesise a relay click and a short tone with WebAudio on a channel switch (no audio files). Add a toggle in the masthead and remember the choice.

### Structure and polish
8. **Phone wall.** At 375 px the wall still changes height between channels, and the label bar cuts "LIVE RO…". Design a mobile-specific wall: a full-bleed monitor with a swipe between channels, and the time code moved out of the bar.
9. **Schedule hover preview.** Upgrade it to a small live monitor that "tunes" between rows (a scan line on change) instead of a plain fade. Keep it off on touch devices and under reduced motion.
10. **Case pages.** Add a short "how it was built" timeline per featured project (milestones from CONTENT.md only) and a "Watch it work" moment: a 10–20 s loop of the recreation's key interaction, with a still poster.
11. **Typography pass.** Display Archivo 112 % stretch, text Atkinson Hyperlegible Next, mono Martian Mono. Check the rhythm on the case pages and the readouts at 820 px.
12. **Daylight theme.** Make it feel like a daylight control room rather than an inverted dark theme (bezel, shadows, tint contrast).
13. **Open-graph image.** Generate a 1200×630 card from the Signal Stack plus the name, and set `og:image`.
14. **Hosting.** Deploy to Vercel (`vercel.json` already rewrites to `index.html`). Add a custom domain when the owner chooses one.

### Open owner items (do not invent)
- **The CV download is still a template.** `public/Gentrit-Rashiti-CV.pdf` shows "[your.email@example.com]", "[+000 00 000 000] · [City, Country]" and "linkedin.com/in/[handle]". This is the first thing to fix before anyone sees the site. The source is `~/Desktop/Gentrit-CV/Gentrit-Rashiti-CV.html`; re-print it to PDF and copy it into `public/`.
- Contact email and LinkedIn are empty in `src/content/links.ts`. Education is missing on the site and on the CV.
- **Outcome numbers, public or approved only.** Store installs and ratings: earlier research saw Bayyinah TV at 100K+ downloads and 4.7★ on Google Play, and Viva Fresh at about 490K downloads on a third-party tracker. Re-check both on the live store pages before use. Also needed: the number of releases, and the number of tenants or clinics as a range if allowed.
- Seniority title, a dated work history line, and one line on what role he wants.
- The care-platform "Public intake pages" gallery names a tenant (GoodCannaNow). The owner asked for it; both reviewers flagged it against `PRODUCT.md`. Keep it only as an explicit owner decision.
- The repo also tracks the tooling folders `.agents`, `.claude`, `.impeccable` and `skills-lock.json`. Remove them from git if the owner wants a clean public repo.

## 6. How to work

1. Read `REDESIGN.md`, `DESIGN.md`, `PRODUCT.md` and `CONTENT.md`. Run the site, and open `/lab.html` for the 3D.
2. Pick from the list above. Build one item at a time, smallest first, and check it in the lab before you mount it on the page.
3. For each item, test at 375, 820 and 1440, in dark and daylight, with reduced motion on and off. Check frame time in the lab (target 16.7 ms). Check the chunk size against the budget.
4. Commit each item separately as `gentritr1` (repo-local identity `gentrit.rashiti2@gmail.com`). The push remote is `git@github-gentritr1:gentritr1/portfolio.git`.
5. Keep `DESIGN.md` current when you add tokens, components or motion.
