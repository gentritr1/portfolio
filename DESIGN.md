# DESIGN.md: the control room

REDESIGN.md is the brief. This file records the visual system that is built. PRODUCT.md and CONTENT.md own the facts and the copy.

## Design read

Reading this as: a developer portfolio for hiring managers and senior engineers, with a calm broadcast master-control language (matte panels, hairlines, uppercase mono labels, one on-air signal), leaning toward Tailwind 4 tokens, `light-dark()` colour pairs, the View Transitions API and restrained `motion` inside the recreations only.

The site is a control room that monitors shipped products. Domains are channels (CH01 to CH06). Live recreations are monitors. The project list is the schedule. A case page is a channel tuned in. The interface stays still and quiet; the work on the monitors carries the motion.

## Dials

| Dial | Value | Why |
| --- | --- | --- |
| `DESIGN_VARIANCE` | 6 | A strict 12-column grid with 8/4 and 4/8 splits. Asymmetry comes from the monitor and the label rails, not from broken layouts. |
| `MOTION_INTENSITY` | 4 | Route cross-fade, one shared-element morph, a short tune on channel change. No scroll reveals, no idle loops outside recreations. |
| `VISUAL_DENSITY` | 5 | Denser than a gallery: the schedule is a real index. Sections still breathe at `--spacing-section`. |

## Colour

Strategy: restrained. Graphite panels, one signal colour, six muted channel tints. The signal colour marks only live states, the active channel and focus.

Theme: dark is the default. `<html data-theme="light">` selects daylight. The choice lives in `localStorage.theme` (`light` or `dark`), and the script in `index.html` applies it before first paint. Every token is a `light-dark(daylight, dark)` pair on `:root`, so it resolves against the `color-scheme` of the element that uses it.

### Panels and ink

| Token | Daylight | Dark | Use |
| --- | --- | --- | --- |
| `--panel-0` | `oklch(0.948 0.004 250)` | `oklch(0.15 0.004 250)` | Page ground, masthead |
| `--panel-1` | `oklch(0.985 0.002 250)` | `oklch(0.182 0.005 250)` | Panels, hovered rows |
| `--panel-2` | `oklch(0.908 0.007 250)` | `oklch(0.214 0.006 250)` | Control hover, gallery stage |
| `--panel-3` | `oklch(0.885 0.006 250)` | `oklch(0.252 0.007 250)` | Pressed or strongest fill |
| `--hairline` | `oklch(0.805 0.008 250)` | `oklch(0.27 0.006 250)` | Rules, panel borders |
| `--hairline-strong` | `oklch(0.68 0.012 250)` | `oklch(0.37 0.008 250)` | Control outlines, underlines |
| `--ink` | `oklch(0.2 0.01 250)` | `oklch(0.94 0.004 250)` | Headings, body |
| `--ink-2` | `oklch(0.4 0.012 250)` | `oklch(0.76 0.008 250)` | Secondary text |
| `--ink-3` | `oklch(0.46 0.012 250)` | `oklch(0.64 0.008 250)` | Labels (4.5:1 or more on `--panel-0`) |

Daylight is not an inversion: the panels are pale console grey, the page ground sits one step below the panels, and the monitor hardware stays graphite.

### Signal and hardware

| Token | Daylight | Dark | Use |
| --- | --- | --- | --- |
| `--signal` | `oklch(0.57 0.2 31)` | `oklch(0.69 0.19 33)` | ON AIR lamp, live monitors, active channel, focus ring, selection wash |
| `--on-signal` | `oklch(0.985 0.005 30)` | `oklch(0.16 0.02 30)` | Text on a signal fill |
| `--bezel` | `oklch(0.27 0.008 250)` | `oklch(0.205 0.006 250)` | Monitor bezel |
| `--bezel-ink` | `oklch(0.8 0.008 250)` | same | Bezel label bar text |
| `--bezel-line` | `oklch(0.43 0.008 250)` | `oklch(0.33 0.006 250)` | Bezel ring |

### Channel tints

The v1 world accents, desaturated. A tint marks a channel's number, its rule and its monitor bezel ring. It never fills a large area.

| Channel | Key | Period | Token | Daylight | Dark |
| --- | --- | --- | --- | --- | --- |
| CH01 Healthcare | `healthcare` | 2023–26 | `--ch-healthcare` | `oklch(0.49 0.075 184)` | `oklch(0.77 0.07 180)` |
| CH02 Streaming | `streaming` | 2023–26 | `--ch-streaming` | `oklch(0.49 0.08 12)` | `oklch(0.75 0.07 10)` |
| CH03 Mobile apps | `reading` | 2021–26 | `--ch-reading` | `oklch(0.49 0.08 70)` | `oklch(0.81 0.075 78)` |
| CH04 Web3 | `web3` | 2024 | `--ch-web3` | `oklch(0.5 0.1 285)` | `oklch(0.75 0.08 285)` |
| CH05 Web apps & AI | `ai` | 2025 | `--ch-ai` | `oklch(0.49 0.08 125)` | `oklch(0.84 0.08 120)` |
| CH06 Games & personal | `personal` | 2022–26 | `--ch-personal` | `oklch(0.48 0.04 245)` | `oklch(0.78 0.035 240)` |

A channel's period is derived in `channels.ts` from the first and last year of its projects; nobody writes it by hand. A row with no years shows a muted `·` in the schedule, never the channel period. CH01 also carries the design systems (React, Vue) and the design dashboard; the care-platform page lists them under "Also on this channel".

The streaming tint is a muted rose (hue 10), so it never reads as the signal red-orange (hue 31 to 33).

### Tint by context

`--tint` is registered with `@property` and set by `[data-channel="<key>"]`. Context sets it: the active channel on the home page, the page's channel on a case page (`<article data-channel>`), each row and badge in the schedule. It cross-fades for `--dur-ui` on `--ease-out`. This replaces the v1 scroll cross-fade of world accents; nothing changes colour on scroll.

Utilities: `bg-panel-0..3`, `border-hairline`, `border-hairline-strong`, `text-ink`, `text-ink-2`, `text-ink-3`, `bg-signal`, `text-tint`, `bg-tint`, `bg-bezel`, `text-bezel-ink`, `bg-ch-<key>`. Opacity modifiers work (`bg-tint/15`).

### Recreation palette

The live recreations keep the v1 world tokens (`--accent`, `--accent-soft`, `--accent-ink`, `--on-accent`, `--world-bg`, `--surface`, `--muted`, `--line`, `--line-strong`). The monitor stage scopes them with `data-world`. `--surface`, `--muted`, `--line` and `--line-strong` alias the panel tokens. The shell never uses these tokens.

Mixing rule: mix colours `in oklab`, never `in oklch`.

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display | Archivo, variable `wdth` 100 to 125, `wght` 500 to 700 | Set at `font-stretch: 112%`, weight 600. A wide grotesk in the tradition of station idents and lower thirds. |
| Text | Atkinson Hyperlegible Next, `wght` 400 to 700 | Body, ledes, story text. Drawn for legibility, with clinical-signage roots. |
| Mono | Martian Mono, `wdth` 75 to 100, `wght` 400 to 500 | Every label, channel number, time code and fact key. Set at `font-stretch: 87.5%`. |

All three load from Google Fonts with `display=swap` and preconnect.

| Token | Value | Utility |
| --- | --- | --- |
| `--text-display` | `clamp(2.625rem, 1.2rem + 5.4vw, 5.5rem)`, lh 0.96, -0.03em | `text-display` (home name) |
| `--text-h1` | `clamp(2.25rem, 1.45rem + 3.4vw, 4.25rem)`, lh 1, -0.028em | `text-h1` (case title, No signal) |
| `--text-h2` | `clamp(1.625rem, 1.2rem + 1.8vw, 2.5rem)`, lh 1.08 | `text-h2` |
| `--text-h3` | `1.25rem`, lh 1.25 | `text-h3` |
| `--text-lede` | `clamp(1.125rem, 1.04rem + 0.38vw, 1.3125rem)`, lh 1.5 | `text-lede` |
| `--text-story` | `1.0625rem`, lh 1.7 | `text-story` (case story, measure 64ch) |
| `--text-meta` | `0.8125rem`, lh 1.45 | `text-meta` |
| `--text-label` / `--text-label-lg` | 11 px / 12 px | `label` / `label-lg`: mono, uppercase, 0.07 to 0.08em tracking, tabular numerals |

Body text is 16 px or larger. Labels sit beside or below what they describe, never as a kicker above a heading.

## Space, radius, depth, layers

| Token | Value | Use |
| --- | --- | --- |
| `--spacing-section` | `clamp(4.5rem, 10vw, 8rem)` | `pt-section` between sections, `mt-section` above the footer |
| `--gutter` | 16 / 24 / 32 px at base / 640 / 1024 | `px-gutter` inside `Container` (max width 1280 px) |
| `--radius-xs` / `sm` / `md` / `lg` | 2 / 4 / 6 / 10 px | `rounded-sm` controls, `rounded-md` frames |
| `--radius-chip` / `panel` / `stage` / `stage-inner` | 4 / 6 / 10 / 4 px | Chips, panels, monitor bezel, monitor stage |
| `--shadow-stage` | soft, offset | The monitor bezel only |
| `--z-overlay` / `--z-masthead` / `--z-skip` | 40 / 50 / 60 | |

Panels are matte: one hairline, no shadow. Only the monitor carries depth. Pills are gone; controls are 4 px rectangles with a 44 px hit area.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` / `ease.out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Hovers, presses, fades |
| `--ease-in-out` / `ease.inOut` | `cubic-bezier(0.77, 0, 0.175, 1)` | On-screen movement |
| `--ease-drawer` / `ease.drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Shared elements, drawer, dialog |
| `--dur-press` | 140 ms | Press feedback |
| `--dur-micro` | 200 ms | Hover, toggles |
| `--dur-ui` | 240 ms | Tint change |
| `--dur-root` | 160 ms | Route cross-fade of the page (`::view-transition-old/new(root)`), short so the two pages never ghost |
| `--dur-tune` | 260 ms | Channel switch tune (scan line, slight blur-in), 280 ms ceiling |
| `--dur-route` | 480 ms | Shared-element morph between routes |
| `--dur-preview` | 150 ms | Schedule preview entry/exit opacity; row changes tune for 260 ms |

`src/lib/motion.ts` mirrors these in seconds for `motion`.

Route transitions: `TransitionLink` preloads the destination (route chunk and monitor recreation), then calls `document.startViewTransition` and commits the route with `flushSync`. `::view-transition-old/new(root)` fade for 160 ms; every named group morphs for 480 ms on the drawer curve. The masthead has `view-transition-name: masthead`, so it holds still. A case-page monitor is named `monitor-<slug>`; the home monitor wall gives its active monitor the same name, so the monitor morphs into the case page.

Reduced motion: `TransitionLink` navigates without a view transition, all `::view-transition-*` animations are off, CSS animations collapse to their end state, and smooth scroll is off.

## Components

| Component | Props | Contract |
| --- | --- | --- |
| `Masthead` | none | Sticky top bar: GR monogram and name (home link), "Schedule" back link on `/work/*`, ON AIR lamp (OFF AIR with an unlit lamp on No signal), KOS local time (Europe/Belgrade, HH:MM, updated on the minute), sound toggle (off by default), theme toggle, CV download. Every control is 44 × 44 px or larger. |
| `Footer` | none | Sources line, GitHub, CV, email and LinkedIn when set in `links.ts`, © line. |
| `ChannelBadge` | `channel`, `showLabel = true`, `size = 'sm' \| 'md'`, `className` | CH number in its tint, a 1 px tint rule, the channel name. Sets `data-channel`. |
| `SignalDot` | `tone = 'signal' \| 'tint' \| 'off'`, `className` | A steady lamp. It never pulses. |
| `Monitor` | `channel`, `label`, `timecode`, `live`, `aspect: {base, sm, lg}`, `world`, `viewTransitionName`, `maxWidth`, `caption`, `actions`, `lowerThird`, `fit`, `children` | Graphite bezel, a label bar (lamp, CH number in tint, label, time code, optional `actions`), a stage that is a size container scoped with `data-world`, and an optional `lowerThird` band under the stage. Width is capped so the stage stays at 70 svh or less, and at `maxWidth`. With `fit` (the home wall) the stage has a fixed height at every breakpoint (`min(70svh, 560px)` on phones, `min(62svh, 560px)`, `min(58svh, 620px)` from 1024 px) and the content keeps its own aspect, centred on bezel graphite, so a channel switch never moves the page. |
| `LowerThird` | `project` | Case title on the monitor bezel: channel badge, kind, the page `h1` behind a 1 px tint rule, time code. |
| `CaseFacts` | `project`, `featured` | Role, platforms and public pages, in a column right of the story (below it on phones). |
| `MonitorTuning` | none | Stage fallback while a recreation loads; same box, no layout shift. |
| `MonitorGallery` | `items` | Store frames side by side on a stage; the row scrolls when narrow. |
| `Showcase` | `title`, `links`, `items`, `aspect = 'web' \| 'phone'` | Public screenshots with store and site links; a frame opens `FrameDialog`. |
| `FrameDialog` | `items`, `index`, `onIndexChange` | The one lightbox: a native modal dialog with the frame large, a counter, previous and next (buttons and arrow keys), Escape to close, focus back to the opener. Used by `Showcase` and `MonitorGallery`. |
| `TransitionLink` | React Router `Link` props, `to: string`, `preload?: () => Promise` | View-transition navigation with preload on hover, focus and click. |
| `ScrollToTop` | none | Scrolls to the hash target or to the top on every route change. |
| `ThemeToggle` | `className` | 44 px button; dark and daylight; writes `data-theme`, `theme-color` and `localStorage.theme`. |
| `Thumb`, `ThumbFrame` | `kind`, `world` | Stylized mini-screens for schedule rows without a real screenshot. |

Icons: `@phosphor-icons/react`, `weight="light"` outside recreations. No emoji, no Unicode glyphs as icons.

## Routes

| Path | Page | Loading |
| --- | --- | --- |
| `/` | `HomePage`: masthead; one hero band (name, role line, claim, status strip, and the `HeaderVisual` slot at 380 × 220 from 1024 px); the channel strip; the wall monitor with "Tune in" in its label bar (at 1440 × 900 the monitor top and "Tune in" sit above the fold); the lede (70ch); `#schedule`; about and contact; footer. Number keys and ←/→ switch channels only while the wall is in view. | In the main chunk |
| `#schedule` | A rundown. Group headers are slates: a short bar of the group's channel tints, the group name, a two-digit count, the period. The row of the project on the wall carries a 1 px signal rule at its left edge and a mono "Now" tag under its time code. Public links sit under the line, 44 px tall. | In the main chunk |
| `/work/:slug` | `CaseStudyPage` for the five featured slugs: the monitor first, sized to its content, with the title in a `LowerThird` on its bezel (the only visible title, and the page `h1`); readouts; the line and the story (The product / What was built / Result) with `CaseFacts` on the right; galleries; "Also on this channel" where `featured.related` lists rows (they open the home drawer through `/?p=<slug>`); spec sheet; next channel | Lazy chunk; each recreation is its own lazy chunk |
| `*` and non-featured slugs | `NoSignalPage`: a Signal Stack that loses its trace and colour, the path, a link back to the schedule. The route element checks the slug against `featuredProjects` before the lazy boundary, so an unknown slug never paints the lazy fallback first. | In the main chunk |

`BrowserRouter` runs with `useTransitions={false}` so `flushSync` can commit a route inside a view transition. Static hosting needs a rewrite of every path to `/index.html` (`vercel.json`).

## Content model

`src/content/projects.ts` is the single source: every project with `slug`, `name`, `kind`, `channel`, `group`, `years` (time code), `role`, `stack`, `line`, `summary`, `links`, `media` (`thumb`, `shot`, `recreation`, `galleries`) and, for the five featured projects, `featured` (`order`, `monitor`, `readouts`, `related`); case-only stories and facts are in `src/content/caseNarratives.ts`. `src/content/channels.ts` holds the channel number, label, tint token and period. `src/lib/recreations.tsx` maps a recreation key to its lazy component, name, palette and monitor aspect.

## Refused on purpose

Kicker labels above headings, scroll-triggered reveals on every section, preloaders, scroll-jacking, glow halos, pulsing status dots, gradient text, glass on scrolling content, pill buttons, cards as page structure, `in oklch` colour mixing, Inter, Roboto, Arial. Em dashes stay out of copy; the en dash appears only inside time codes such as `2023–26`.

## Signal Stack: tune-in camera

A visible WebGL hero stack dollies into its active pane for 450 ms with cubic ease-out before the route transition. The stack temporarily owns `monitor-<slug>` and hands it to the case monitor; the wall releases that name so snapshots remain unique. Imports finish before the camera starts. Repeated activation is guarded and unmount cancels pending navigation. Reduced motion, CSS fallback, hidden stacks and phones navigate through the existing path without a camera delay.

Channel switching interpolates the incoming pane's trace from the previous channel waveform to its own over 280 ms, using smoothstep and a shared phase so peaks do not jump. In the static CSS/reduced-motion path the final waveform appears directly. Active rims settle to the channel tint in both renderers; only the on-air dot remains signal coloured.

Active WebGL panes display a 512 × 320 AVIF still of their authored recreation. The images are 3–9 kB each, fetched on channel selection and uploaded once per scene, then reused. Failed images leave the waveform intact; all textures are released on disposal. Dark recreation stills remain dark hardware content in daylight. The CSS/reduced-motion path makes no image request. Provenance and capture instructions live in `public/signal-posters/README.md`; the dev-only lab exposes poster views.

Project lower thirds carry a single channel-tinted pane behind their right edge at 25% opacity, reusing the same lazy scene and CSS fallback. It has no bob, yaw loop, waveform travel or poster; only a local hover tilts it by up to 2° horizontally and 1° vertically. The title and time code remain foreground content. The lab's Single pane control exercises this layout.

## Phone wall

Below 640 px, the monitor is edge-to-edge with a constant `min(70svh, 560px)` stage. Each recreation fits its authored aspect inside this stable frame. The time code moves to a separate rail with a swipe hint and 44 px previous/next buttons. A horizontal touch gesture of at least 56 px selects the adjacent project, excluding interactive controls and vertical scrolling. A completed swipe suppresses its synthetic click; pointer cancellation clears the gesture. Caption and stack rows reserve space so switching does not move the schedule. Channel tabs, arrow keys and number keys remain available, with announcements for swipe and button changes.

The live-room chat starts at the top of its scroll area. Bottom justification shifted existing messages whenever an automatic message arrived before the list filled; removing it keeps the scene within the zero-layout-shift budget. `/lab.html?review=1` provides exact-width home/project frames, theme and reduced-motion controls, plus development-only layout-shift measurements. These preference overrides are removed from production builds.

## No signal and optional glass

The 404 stack flattens its waveform and desaturates over 1.2 seconds, with no on-air lamp, texture or idle motion. Reduced motion and the CSS fallback show the settled state immediately. A failed WebGL shader leaves the CSS stack visible.

Strong, identifiable GPUs may load a separate compact OGL refraction module after 90 measured frames following warmup average at most 16.7 ms. Eligibility requires at least eight CPU threads, eight GB device memory when exposed, sufficient texture capacity, and an allowlisted Apple M, NVIDIA or AMD adapter. Unknown adapters, still/single panes, reduced motion and low-data devices keep the base path. Each pane samples a framebuffer copy of panes drawn behind it, with shallow edge refraction. Sustained frame time above 16.7 ms removes glass; the existing DPR/CSS degradation remains. The lab's Test glass tier bypasses hardware identity only in development; the measured frame gate still applies.

## Sound and schedule preview

The 44 px masthead Channel sound control is off by default and remembers its setting. Only an intentional wall channel change creates/resumes WebAudio and lazy-loads a 22 ms relay tap plus 90 ms quiet sine tone. Loads and preference changes are silent. Muting cancels pending audio and suspends the context. Kosovo time yields below 400 px to preserve the controls' space.

Fine-pointer visitors without reduced motion see an inert miniature live monitor on schedule hover. Code loads on the first eligible row entry; live recreations mount only while visible. Public frames/authored illustrations cover other rows. Changes tune over 260 ms with a scan and 2 px clarity transition; entry/exit fade for 150 ms. Provenance labels distinguish recreations, public frames and illustrations. Escape, Tab, focus changes and pointer leave dismiss the preview; only a fresh pointer entry restores it.

## Case milestones and guided playback

Every featured page has a short How it was built list sourced from CONTENT.md, without inferred milestone dates. Watch it work starts with a poster and plays a 16-second, four-step sequence after activation. It reuses the authored recreations with explicit demo state; Viva Fresh tours public store frames. Play/Pause, Replay and four 44 px step controls sit outside the inert scene. Playback pauses below 20% visibility or in a hidden tab, preserving position. Reduced motion uses manual steps. The original interactive monitor remains available.

## Responsive typography and daylight

Archivo stays at 112% stretch, with Atkinson body text and Martian labels. Meter values use the width of their whole strip (`clamp(2rem, 4.5cqw, 3.75rem)`) and align at the top in three columns from 768 px; phones keep separate rows. Story/spec label rails are 8.5 rem with 24 px gaps. Daylight combines brighter panel surfaces, stronger rules/tints and graphite hardware. `--monitor-shadow` provides a shorter contact/cast shadow in daylight; dark colours are unchanged.

## Contact, CV and sharing

Owner-confirmed email and LinkedIn live in `links.ts`; education is Bachelor's degree · UBT, with no inferred subject or dates. The CV is `public/Gentrit-Rashiti-CV.pdf`, with editable source `cv/Gentrit-Rashiti-CV.html`.

The sharing card is `public/og-image.png`, 1200 × 630. Regenerate with `python3 scripts/generate-og.py` and Pillow; bundled OFL fonts and their provenance live beside the generator. The card uses the same geometric panes, waveform and typography as the site. Open Graph/Twitter image URLs use VITE_SITE_URL when supplied, otherwise Vercel's production-host variable. Local builds use a relative path until a real host exists. Hosting and domain selection remain pending; no deployment was made.
