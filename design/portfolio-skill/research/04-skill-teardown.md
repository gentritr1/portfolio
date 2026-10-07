# 04: Teardown of four design skills, mined for `portfolio-page`

Research date: 2026-10-07. Every file listed below was read; the large data files were read by row and by grep, and portfolio-relevant rows were read in full. Raw copies (shallow git clones) live outside the repo in the session scratchpad at `skills-src/<skill>/`, with a `MANIFEST.txt`. No third-party file was copied into this repository.

| Skill | Source | Commit / date | Licence |
|---|---|---|---|
| impeccable | github.com/pbakaus/impeccable (installed here at `.agents/skills/impeccable`, skill 4.5.0, engine 0.1.11) | upstream `bbcb29d`, 2026-10-06 | Apache-2.0. NOTICE: `ios.md`/`android.md` derive from ehmo/platform-design-skills (MIT) |
| ui-ux-pro-max | github.com/nextlevelbuilder/ui-ux-pro-max-skill (v2.13.0) | `477bcb2`, 2026-10-03 | MIT (c) 2024 Next Level Builder. The bundled claudekit `ui-styling` skill is Apache-2.0 |
| taste-skill (tasteskill.dev) | github.com/Leonxlnx/taste-skill | `b482f7a`, 2026-10-07 | MIT (c) 2026 Leonxlnx |
| emil-design-eng, improve-animations, review-animations | github.com/emilkowalski/skills | `e8a175d`, 2026-10-02 | MIT (c) 2026 Emil Kowalski |

**Emil's skill is real and public.** `emil-design-eng`, `improve-animations` and `review-animations` all exist in `emilkowalski/skills`, alongside eleven siblings (animate, animate-expo, find-animation-opportunities, animation-vocabulary, apple-design, write-swift, pick-ui-library, prototype, mobile-native, break-ui, ask-sonner). His emilkowal.ski articles could not be fetched (the egress proxy blocks the domain), so the skill files are the primary source; they cite and distil "You don't need animations", "7 practical animation tips" and "Agents with taste".

---

## 1. impeccable

**Purpose.** A full design-director workflow for any frontend surface: product truth (PRODUCT.md), visual system (DESIGN.md), new-world exploration, build, critique, audit, polish, plus a bundled deterministic slop detector. It explicitly names portfolios as **Experience** mode: "the artifact leads from the first viewport; the interface recedes."

**Structure.** `SKILL.md` (12 KB router) plus 41 `reference/*.md` files (1 to 57 KB each), `reference/degraded/*` (inline fallbacks for subagents), `agents/*.toml` (finish reviewer, documenter, asset producer, manual-edit applier), and `scripts/`: a shell launcher that downloads a checksummed Rust engine, `command-metadata.json`, a 1.1 MB Google Fonts fingerprint index for font matching, and the live-mode browser overlay (`live-browser*.js`, 547 KB). The detector's rules are not in the local install; they live upstream in `crates/live/assets/antipatterns.json` (60 rules) with tiers in `crates/foundation/src/registry.rs`.

**Invocation and routing.** Setup runs `impeccable context` once (PRODUCT.md, DESIGN.md, surface brief, platform refs). The request is mapped to a mode (Persuade, Operate, Read, Experience) and to one of 24 command references (shape, init, document, critique, audit, polish, bolder, quieter, distill, typeset, layout, animate, colorize, clarify, adapt, optimize, live and others); a bare call shows a menu ranked from `impeccable signals` and a detector pass. `craft-floor.md` is read immediately before any UI edit. New worlds run `new-work.md`: two or three questions, seven grounded candidates, a dice-rolled `concept-seed`, a decision page, a six-block direction contract, a comp-led phased build (comps, spec, plates, hero gate, sections, motion, responsive) or a code-led build, then a fresh-context finish reviewer and a documenter.

**Key rules with numbers.**
- Contrast: body and placeholder 4.5:1, large text 3:1, controls/icons/focus 3:1. Never gray text on colour; tint it from the hue.
- Type: body measure 65-75ch (45-75 in typeset), body floor 16px (14px only for secondary), display max 6rem, tracking floor -0.04em with -0.02 to -0.03em preferred, balanced headings. Product scale ratio 1.125-1.2. Light-on-dark gets more leading, a touch more tracking, one more weight step.
- Motion durations: 100-150ms feedback, 150-300ms state change, 300-500ms layout/overlay, 500-800ms one authored focal entrance. Operate surfaces 150-250ms. Exit faster than entrance. Ease `cubic-bezier(0.16, 1, 0.3, 1)`; ease-out-quart/quint/expo; no bounce or elastic. "Quieter" moves: saturation to 70-85%, weights 900 to 600 and 700 to 500, travel 10-20px instead of 40px.
- Colour strategy before colours: Restrained, Committed (one colour on 30-60% of the surface), Full palette (3-4 roles), Drenched. Light or dark is chosen from a one-sentence physical scene, never by category. OKLCH for new palettes.
- Layout: 4px base spacing scale, more space above a heading than below, squint test, card radii 12-16px, one elevation per element, no nested cards.
- Cognitive load: at most 4 options per decision, at most 5 nav items. "Portfolio and gallery indexes: one decision per screen (which piece to open), not filter, sort, and tag controls all at once."
- Performance: LCP < 2.5s, INP < 200ms, CLS < 0.1, 60fps (simplify below 50), image quality 80-85%, never lazy-load above the fold, touch targets 44px, test 320px to 4K.
- Process: at most two batched screenshot rounds (1440 and 390 wide); hero gate at 72% comp similarity.
- Rubrics: Nielsen's 10 heuristics 0-4, with 7 and 10 allowed `n/a` on portfolios and the total renormalised (90/70/50/30% bands); audit five dimensions out of 20; P0-P3 severities; five personas.

**Anti-pattern list (complete).**
- *Craft-floor Refuse list:* same-size icon+heading+text cards as page structure; nested cards; the hero-metric template; a kicker or eyebrow above a heading (an absolute ban, "no brief earns it back"); section numbers 01/02/03 unless the sequence is information; needless modals; gradient text; decorative glass and blur; a coloured `border-left/right` over 1px on cards, list items, callouts or alerts; hard offset shadows outside a real neobrutalist world; sparklines, progress rings and soft rounded rectangles standing in for content; monospace as a "technical" costume; a system display face (Impact, Arial Black, the platform sans) as display voice; emoji or Unicode glyphs as icons; geometric masks faking organic contours; light/dark picked by category; a 1px border under a wide soft shadow ("ghost card"); sketch-style SVG scenes, `doodle` classes, `feTurbulence` grain; striped `repeating-linear-gradient` and grid-overlay backgrounds without a real canvas, map or blueprint; invented claims.
- *Reflex fonts (new-work):* Fraunces, Playfair Display, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk, Space Mono, IBM Plex, Inter as display, DM Sans, DM Serif, Outfit, Plus Jakarta Sans, Instrument Sans. Detector `overused-font` list: Inter, Roboto, Open Sans, Lato, Montserrat, Arial, Helvetica, Fraunces, Instrument Sans, Instrument Serif, Geist, Geist Sans, Geist Mono, Mona Sans, Plus Jakarta Sans, Space Grotesk, Recoleta (brand fonts exempt on their own domains).
- *Calibration looks:* warm cream ground with a high-contrast serif and terracotta or signal-red accent; near-black with one neon accent and glowing edges; broadsheet hairlines with italic display serif and tracked mono labels. Allowed only when the brief asks.
- *Detector, slop rules (31):* side-tab, border-accent-on-rounded, overused-font, flat-type-hierarchy (adjacent roles < 1.25x), gradient-text, ai-color-palette (purple/violet gradients, cyan-on-dark), cream-palette, nested-cards, monotonous-spacing, bounce-easing, pulsing-dot, blinking-cursor, shape-assembled-illustration, dark-glow, radial-halo, radial-spotlight-glow, marquee, icon-tile-stack, italic-serif-display, hero-eyebrow-chip, kicker-above-heading, numbered-section-labels, em-dash-overuse (8+ at about one per 500 characters, advisory), marketing-buzzword, aphoristic-cadence ("Not a feature. A platform."), oversized-h1, extreme-negative-tracking, gpt-thin-border-wide-shadow, repeating-stripes-gradient, codex-grid-background, theater-slop-phrase.
- *Detector, quality rules (29):* organic-clip-path, buried-raster, broken-image, script-error, content-hidden-at-rest, edge-flush-cards, text-occlusion, first-viewport-column-overflow, gray-on-color, low-contrast, layout-transition, line-length (> about 80ch), cramped-padding (< 8px, ideally 12-16), body-text-viewport-edge (< 16px, < 12px at 480px or less, ideally 24-32), tight-leading (< 1.3, want 1.5-1.7), skipped-heading, heading-rhythm, justified-text, tiny-text (< 12px body), undersized-ui-text (< 11px, 10px legal smallprint), all-caps-body (80+ characters), wide-tracking (> 0.05em on body), text-overflow, repeated-container-text, clipped-overflow-container, design-system-font, design-system-color, design-system-radius, design-system-font-size.

**Automatic checks.** A per-edit hook runs the 12 immediate-tier rules (broken-image, text-overflow, body-text-viewport-edge, low-contrast, gray-on-color, tiny-text, gradient-text, dark-glow, four design-system drift rules); a Stop-time pass runs the rest. `impeccable detect --json` uses regex, static-HTML, browser-layout and visual-contrast engines. Also: comp-diff region scoring, font fingerprint ranking, build-phase gates, critique snapshots that `polish` consumes, raster provenance scans, `doctor`. Ignores require a stated reason.

**Portfolio relevance.** High: Experience mode, the first-viewport thesis and memory test, "prove, don't claim", one authored motion moment, the portfolio cognitive-load rule, Read mode for case studies, the craft floor, browser-surface theming, and a detector that can run on this repo today.

**Weaknesses.** Enormous process overhead for one personal site (dice rolls, decision servers, comp gates, four subagents). Depends on a downloaded binary. Several bans are taste calls stated as absolutes (eyebrows, cream, italic serif) that a brief must override. Nothing on case-study writing, project ordering or screenshot practice. The detector judges mechanics only.

---

## 2. ui-ux-pro-max

**Purpose.** A searchable design-intelligence database: 79 searchable styles (50 active), 192 product types with palettes and reasoning rules, 74 font pairings, 1,934 Google Fonts, 119 UX guidelines, 105 icons, 17 GSAP motion presets, 25 chart types, 34 landing patterns and stack guides for 22 stacks.

**Structure.** `.claude/skills/ui-ux-pro-max/SKILL.md` (16 KB), `references/quick-reference.md` (every rule id in 10 categories), `references/pro-rules.md` (native-app polish plus the canonical pre-delivery checklist), `data/*.csv`, and `scripts/` (`search.py`, `core.py` BM25 plus regex search, `design_system.py` generator, `reasoning_contract.py`, `validate_data.py`). The repo also ships unrelated claudekit skills (design, design-system, brand, ui-styling, slides, banner-design) and a separate "website design stack" with `stack/scripts/design-audit.mjs`.

**Invocation and routing.** Model-invoked. A query contract governs use: new page means `--design-system`; a focused concern means one `--domain` (product, style, typography, color, landing, chart, ux, icons, gsap, react, web, google-fonts); implementation means `--stack`. One dominant intent, 2-5 terms, verify the top result, retry once, and never present a zero-result search as data. `--persist` writes `design-system/<slug>/MASTER.md` plus page overrides (never overwritten without `--force`). Optional 1-10 dials `--variance`, `--motion`, `--density` (credited as inspired by taste-skill).

**Key rules with numbers.** Priority: Accessibility, Touch, Performance, Style, Layout, Typography/Colour, Animation, Forms, Navigation, Charts. Contrast 4.5:1 / 3:1 (7:1 AAA); focus rings 2-4px; touch 44pt / 48dp with 8px gaps, web minimum 24 CSS px; tap feedback within 80-150ms; input latency < 100ms; virtualise 50+ items; breakpoints 375/768/1024/1440; body 16px, line-height 1.5-1.75, measure 60-75 (35-60 mobile); type scale 12/14/16/18/24/32; 4/8 spacing; z-index 0/10/20/40/100/1000; 1-2 animated elements per view; exits at 60-70% of the entrance; stagger 30-50ms; press scale 0.95-1.05; never linger below 0.2 opacity. Motion presets: hover 150-200ms, under 2px travel; scroll reveal 300-400ms, 8-16px travel; stagger at most 8 children; pin at most 1-2 sections; parallax `yPercent` 5-15, never on body copy; route-exit about 250ms.

**Portfolio rows.** Product "Portfolio/Personal": Motion-Driven + Minimalism & Swiss, storytelling pattern, "showcase work, personality shine through"; anti-patterns "corporate templates + generic layouts"; palette #18181B / #FAFAFA with a #2563EB accent. "Creative Agency" must have case studies; its anti-pattern is "hidden portfolio". Landing pattern `portfolio-grid`: hero (name/role) > masonry project grid > about > contact; neutral background so the work shines; hover overlay, lightbox; "visuals first, filter by category, fast loading essential". Running `--design-system "portfolio personal designer case studies"` returned Scroll-Triggered Storytelling, Brutalism, a pink-and-cyan agency palette and Archivo + Space Grotesk.

**Anti-pattern list (complete).** SKILL.md table: removing focus rings, icon-only buttons without labels, hover-only reliance, instant 0ms state changes, layout thrashing, CLS, mixing flat and skeuomorphic, emoji as icons, horizontal scroll, fixed-px containers, disabled zoom, body text under 12px, gray-on-gray, raw hex in components, one duration for every transition, animating width/height, no reduced motion, placeholder-only labels, errors only at the top, overloaded navigation, broken back, no deep links, colour-only meaning. Generator "Additional Forbidden Patterns": emoji icons, missing `cursor: pointer`, layout-shifting hovers, low contrast, instant state changes, invisible focus. Every "Don't" column in `ux-guidelines.csv` (119 rows) and the `Anti_Patterns` column per product in `ui-reasoning.csv`.

**Automatic checks.** The skill itself checks nothing; it prints a checklist. `validate_data.py` validates the CSVs. The bundled stack's `design-audit.mjs` (Playwright, viewports 360/390/768/1024/1440/1920) checks horizontal overflow, images without width/height or alt, tap targets under 44px at 480px or less, visible focus on a sample of 25 focusables, accessible names, h1 count, viewport meta, `lang`, and approximate text contrast, after auto-scrolling to trigger reveals.

**Portfolio relevance.** Medium. The UX guideline set is a solid accessibility, forms and performance floor; the motion presets give sensible numbers; the "hidden work" and "fast loading essential" signals are right. The style and font recommendations are not usable for a distinctive portfolio.

**Weaknesses.** Recommendations converge on exactly the fonts and palettes the other three skills call slop (Inter, Space Grotesk, Playfair, DM Sans, Outfit, pink/cyan). Internal contradictions: the portfolio query yields Brutalism with "no smooth transitions (instant)" next to a checklist demanding 150-300ms transitions; Motion-Driven's 3-5 parallax layers contradict "1-2 key elements per view". Product anti-patterns are thin ("boring design", "hidden work"). BM25 can misroute. Much of the content targets dashboards and native apps. Counts drift between README, skill.json and data.

---

## 3. taste-skill (tasteskill.dev)

**Purpose.** "The anti-slop frontend framework": rules to stop agents producing templated landing pages, portfolios and redesigns. The repo holds 13 skills: `taste-skill` (install name `design-taste-frontend`, v2 experimental, 87 KB), `taste-skill-v1`, `gpt-tasteskill`, `soft-skill` (`high-end-visual-design`), `redesign-skill`, `minimalist-skill`, `brutalist-skill`, `stitch-skill` (DESIGN.md generator for Google Stitch), `output-skill` (anti-truncation), three image-generation skills (`imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit`) and `image-to-code-skill`. A `research/laziness/` folder covers output truncation, not design.

**Structure and invocation.** Each skill is one SKILL.md with no references or scripts (stitch also ships a sample DESIGN.md). Installed via `npx skills add`; model-invoked by description. v2 runs a fixed sequence: section 0 brief inference with a mandatory one-line "Design Read" ("Reading this as: solo designer portfolio for hiring managers, with an editorial / kinetic-type language..."), at most one clarifying question; three dials DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY (baseline 8/6/4; designer portfolio 8/7/3, developer portfolio 6/5/4); a brief-to-design-system map (use official packages, label aesthetic approximations honestly); hard rules; canonical GSAP/Motion skeletons; redesign protocol; block-library contract; out-of-scope list; and a 60-item Pre-Flight checklist where "if a single checkbox cannot be honestly ticked, the page is not done."

**Key rules with numbers (v2).** Body `max-w-[65ch]`; display `text-4xl md:text-6xl`, 6xl-7xl only for 3-5 word headlines; one accent, saturation < 80%, locked across the page; one radius system (0, 12-16px, or pill); hero: headline at most 2 lines, subtext at most 20 words and 3-4 lines, CTAs visible without scroll, top padding at most `pt-24`, at most 4 text elements; nav on one line, at most 80px tall (64-72 default); eyebrows at most ceil(sections/3), counted mechanically; at least 4 layout families per 8 sections; at most 2 consecutive zigzag splits; section copy headline at most 8 words plus body at most 25 words; lists over 5 items need another component; quotes at most 3 lines with name and role; CTA labels at most 3 words on one line; one label per CTA intent; italic display with descenders needs `leading-[1.1]` plus bottom reserve; `min-h-[100dvh]` never `h-screen`; breakpoints 640/768/1024/1280/1536; container 1400px or `max-w-7xl`; reveal skeleton 0.6s, 0.06s stagger, ease `[0.16, 1, 0.3, 1]`, 24px travel; springs `stiffness 100, damping 20`; motion 4-7 means `0.3s cubic-bezier(0.16,1,0.3,1)`; reduced motion mandatory above MOTION 3; LCP < 2.5s, INP < 200ms, CLS < 0.1; both themes designed and tested; no pure #000 or #fff.

**Anti-pattern list (complete, v2 sections 0.D, 4, 5.D and 9).** AI-purple gradients, centred hero over dark mesh, three equal feature cards, glassmorphism everywhere, infinite micro-loops, Inter + slate-900; serif as the "creative" default (Fraunces and Instrument Serif banned as defaults); mixed-family emphasis words; the premium-consumer beige/brass/oxblood/espresso palette (hexes listed); colour or radius drift between sections; centred hero when variance > 4; white-on-white CTAs; wrapped CTAs; duplicate CTA intents; placeholder-as-label; hero taglines, trust strips, pricing teasers and avatar rows inside the hero; two-line nav; split-header (big headline left, small paragraph right); bento with empty cells or all white-on-white cells; div-built fake screenshots; text-only "minimalism"; hand-rolled decorative SVGs and icons; Lucide by default; plain-text logo walls and labels under logos; 20-row tables and spec sheets with a rule under every row; AI-cute copy; fake-precise numbers; mixed copy registers; mid-page theme flips; `window.addEventListener('scroll')`, scroll maths in React state, rAF loops touching state; more than one marquee; unmotivated motion; neon glows; pure black; oversaturated accents; gradient text; custom cursors; screaming H1s; "John Doe", "Acme", "Nexus"; `99.99%`; "Elevate / Seamless / Unleash / Next-Gen / Revolutionize"; broken Unsplash links; default shadcn; version labels and "Brand · No. 01" in the hero; section-number eyebrows; `01 / 4` pagination on tiles; numbered scroll cues; "Index of Work, 2018 - 2026" labels; middot chains (at most one per line); decorative status dots; any em dash or en-dash separator; `<br>`-split italic headlines; vertical rotated text; decorative crosshairs and hairlines; fake version footers; "Quietly in use at"; "Field notes" style labels; mock-humble references; weather and locale strips; micro-meta sentences under eyebrows; "Stage 1 / Step 1" labels; pills on images; fake photo credits; live-stock counters; decoration strips ("BRAND. MOTION. SPATIAL."); floating top-right sub-text; filled-track score bars; scroll cues of any kind.

**Siblings worth noting.** `redesign-skill`: orphans via `text-wrap`, tabular numbers, optical alignment, dead `#` links, favicon, OG meta, 404, skip link, and a fix order (font, palette, states, layout, components). `imagegen-frontend-web`: hero alternatives (bottom-left over image, image-as-canvas, mini minimalist); "left-text / right-image is the most overused AI pattern". `image-to-code`: anti-nested-box, fixed media frames, small-laptop first view. `soft`, `minimalist`, `brutalist` and `gpt-taste` are aesthetic recipes.

**Automatic checks.** None. Everything is self-run by the model; v2 describes the eyebrow count as "mechanical" (grep `uppercase tracking`) but ships no script.

**Portfolio relevance.** High for copy and composition discipline: the design read, hero budget, CTA intent, eyebrow and em-dash rules, real images, page theme lock, and the long list of agency-portfolio clichés (locale strips, rotated text, "Index of Work").

**Weaknesses.** One 87 KB file with no progressive disclosure. The siblings contradict v2: `stitch-skill` recommends Fraunces and Instrument Serif; `soft-skill` mandates eyebrow pills, allows Plus Jakarta Sans and cream grounds, and wants every element to fade up over 800ms with blur; `gpt-taste` calls a centred hero "highly preferred"; `brutalist-skill` encourages fake strings like `REV 2.6`. It is React/Next/Tailwind-specific. Advice to use picsum placeholders and "organic, messy" numbers like `47.2%` invites fabricated content, which is disqualifying on a portfolio. "Motion claimed, motion shown" pushes motion onto pages that may not need it.

---

## 4. Emil Kowalski: emil-design-eng, improve-animations, review-animations

**Purpose.** Encode Emil's design-engineering bar (Vercel, Linear, Sonner, Vaul, animations.dev): mostly animation decisions, plus component craft. `emil-design-eng` is the main skill (27 KB); `improve-animations` audits a codebase and writes self-contained fix plans; `review-animations` reviews a diff and returns Block or Approve. Siblings relevant here: `animate` (build sequence plus `RECIPES.md`), `find-animation-opportunities`, `apple-design`, `mobile-native`, `break-ui` (plus `CATALOG.md`), `pick-ui-library`, `prototype`.

**Structure and invocation.** Each skill opens with an "Initial Response" gate (reply with one line, then wait), states that it "does ONE thing", and names which sibling owns adjacent work. Reference files load on demand: `AUDIT.md` (8 categories with exact values), `PLAN-TEMPLATE.md`, `STANDARDS.md`, `RECIPES.md`, `CATALOG.md`. `review-animations`, `pick-ui-library` and `prototype` set `disable-model-invocation: true`, so they run only when called. `improve-animations` is read-only: recon, parallel audit by subagents, vetting at file:line, a leverage-ordered table, then plans in `plans/NNN-slug.md` stamped with the commit, "written for the weakest executor".

**Key rules with numbers.**
- Gate: 100+ uses a day (keyboard shortcuts, command palette) gets no animation, ever; tens a day gets near-imperceptible or none; occasional (modals, drawers, toasts) gets standard; rare or first-time gets delight. Valid purposes: spatial consistency, state indication, explanation, feedback, preventing a jarring change.
- Easing: enter/exit ease-out; on-screen movement ease-in-out; hover/colour `ease`; constant motion linear; never ease-in. Tokens `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
- Durations: press 100-160ms, tooltips 125-200ms, dropdowns 150-250ms, modals/drawers 200-500ms, marketing can be longer; UI under 300ms.
- Physicality: press `scale(0.97)` (0.95-0.98) at 160ms ease-out; enter from `scale(0.9-0.97)` plus opacity, never `scale(0)`; popovers from their trigger's `transform-origin`, modals centred; exit along the entry path; asymmetric timing (hold 2s linear, release 200ms ease-out).
- Springs: `{ duration: 0.5, bounce: 0.2 }`, bounce 0.1-0.3 and only for momentum. `apple-design`: critically damped (damping 1.0, response 0.3-0.4) by default, about 0.8 after a flick; momentum projection with d = 0.998; about 10px gesture hysteresis.
- Stagger 30-80ms, never blocking input. Crossfade masked with `blur(2px)`; blur under 20px. Scroll reveal on marketing only: `clip-path: inset(0 0 100% 0)` to `inset(0)` over 600ms ease-in-out, once, `margin: -100px`. Flick dismissal at velocity > 0.11 px/ms.
- Performance: transform and opacity only (clip-path sanctioned; height only for accordions); no `transition: all`; Motion `x`/`y` shorthands are not hardware-accelerated, use full transform strings; never drive child transforms through a parent CSS variable; CSS and WAAPI beat rAF under load.
- Accessibility: reduced motion means gentler, not zero; gate hover with `@media (hover: hover) and (pointer: fine)`.
- `mobile-native`: transparent tap highlight plus own `:active`, `touch-action: manipulation`, 16px inputs, heroes `100svh`, shells `100dvh`, safe-area insets, `theme-color` per scheme. `apple-design`: size-specific tracking (display about -0.02em), leading inverse to size.

**Anti-pattern list (complete, "Never ship" and "Escalation triggers").** `transition: all`; `scale(0)` or pure-fade entrances; ease-in on UI; weak built-in easing on deliberate motion; animation on keyboard or 100+/day actions; UI duration over 300ms without reason; centre origin on trigger-anchored popovers; keyframes on toasts, toggles or rapid UI; layout-property animation; Motion shorthands under load; parent CSS-variable transform storms; missing reduced motion; ungated hover; symmetric timing on press/hold; everything entering at once. From `mobile-native`: disabled zoom, `100vh` shells, `100dvh` heroes, click-only press feedback, `touchmove` preventDefault, `user-select: none` on body, `touch-action: none` on scroll paths, `env()` without `viewport-fit=cover`, one `theme-color`, UA sniffing, declaring fixes from emulation.

**Automatic checks.** None scripted. Grep sweeps are listed (`transition`, `ease-in`, `scale(0)`, `prefers-reduced-motion`, `transform-origin`). Outputs are structured: a Before/After/Why table, impact tiers, an explicit Block or Approve. `break-ui` builds a dev-only "Demo data / Worst case / Empty / One / 1,000 rows" toggle and reports Broken, Ugly, Fragile.

**Portfolio relevance.** High for motion and interaction (the strictest, most numeric source) and for `break-ui` (long project names, missing thumbnails, plural counts). `find-animation-opportunities`' required "Rejected candidates" section is a model for restraint.

**Weaknesses.** Product-UI bias: sub-300ms budgets and "marketing can be longer" leave editorial and portfolio motion under-specified. Little on layout, type, colour or copy. React/Base UI/Motion assumptions. The main SKILL.md is monolithic (Tessl's review notes no progressive disclosure), although the siblings use reference files well.

---

## 5. Comparison

### 5a. Where they agree (strong signal)

| Rule | IMP | UUPM | TASTE | EMIL |
|---|---|---|---|---|
| Text contrast 4.5:1, large 3:1 | yes | yes | yes | (a11y) |
| Body about 16px, line-height about 1.5+, measure 65-75ch | yes | yes | yes | yes (type) |
| Animate transform/opacity only; no layout-property animation | yes | yes | yes | yes |
| Reduced motion honoured | gentler, not zero | yes | collapse to static | gentler, not zero |
| Motion needs a purpose; few animated things per view | one authored moment | 1-2 per view | "motion must be motivated" | gate by frequency and purpose |
| No bounce/elastic easing by default | yes | partial | springs, no linear | bounce only for momentum |
| No emoji or glyph icons; one icon family and stroke | yes | yes | yes | n/a |
| No purple/blue AI gradients, glows, gradient text | yes | yes (some rows) | yes | n/a |
| No equal 3-card feature rows or nested cards | yes | n/a | yes | n/a |
| Real imagery over fake UI built from divs | yes | yes | yes | n/a |
| Touch targets 44px; hover never required | yes | yes | yes | yes |
| LCP < 2.5s, INP < 200ms, CLS < 0.1; reserve image space | yes | yes | yes | perf rules |
| No generic copy ("elevate", "seamless") or placeholder names | yes | partial | yes | `break-ui` |
| Test real widths and real devices | yes | yes | yes | yes |

### 5b. Where they conflict, and what a portfolio should prefer

| Topic | Positions | Prefer for `portfolio-page` | Why |
|---|---|---|---|
| Display fonts | UUPM recommends Space Grotesk, Playfair, Inter, Syne, Outfit; TASTE recommends Geist, Outfit, Satoshi, Cabinet; IMP bans most of these | IMP union with TASTE's serif ban: any listed face needs a stated reason | Hiring reviewers see these faces daily; a portfolio is judged on taste |
| Eyebrow labels | IMP absolute ban; TASTE at most 1 per 3 sections; soft-skill mandates pills | IMP ban; metadata rows (role, year) are not eyebrows | Most-reported generated-page tell |
| Motion duration | EMIL UI < 300ms; IMP focal entrance 500-800ms; soft-skill 800ms+ blur fade-ups on everything; UUPM Motion-Driven 300-400ms plus parallax | EMIL budgets for UI; one IMP focal moment; no global fade-ups | 60-second scanners punish waiting |
| Scroll reveals and parallax | UUPM 3-5 parallax layers; TASTE/gpt reveal everything; EMIL marketing only, once; IMP not identical on every section | EMIL: once, small, clip-path or opacity; parallax only on imagery at yPercent 5-15 | Keeps content readable and visible by default |
| Easing curve | EMIL (0.23,1,0.32,1); IMP and TASTE (0.16,1,0.3,1); UUPM GSAP back.out/elastic.out | EMIL tokens for UI, IMP expo-out for the focal entrance; never back/elastic | Both are strong ease-outs; overshoot reads as sloppy |
| Filters on the index | UUPM "filter by category"; IMP one decision per screen | IMP on home; filters only on a full archive | The home index exists to get one click |
| Centred hero | TASTE anti-centre when variance > 4; gpt prefers centred; imagegen bans left-text/right-image by default; IMP calls both split and centred-over-cards templates | Derive from the work (IMP); neither default | The work, not the layout, should identify the person |
| Custom cursor | TASTE bans; UUPM recommends "Interactive Cursor Design" for portfolios; EMIL allows spring-smoothed decorative tracking | No system-cursor replacement; optional decorative hover gated to fine pointers | Accessibility and touch parity |
| Grain, mesh, radial light | redesign/soft/gpt add them; minimalist allows 0.03 radial spots; IMP detector bans halos, spotlights and feTurbulence grain | IMP, unless the world is genuinely physical paper or film | Common decoration with no meaning |
| Dark mode | TASTE both modes mandatory; IMP pick from the use scene; UUPM design both | Both, designed separately, if the owner requires it (this repo does) | Phones in the evening; but never an inverted afterthought |
| Pure black | UUPM Photography palette uses #000000; TASTE bans | Off-black | Depth and halation on OLED |
| Card radius | IMP 12-16px; soft 2rem; UUPM bento 24px; minimalist 8-12px | One system, 12-16px default | Consistency matters more than the value |
| Numbers on the page | TASTE "organic messy numbers" vs its own fake-precision ban; IMP claims from supplied truth | IMP: only real figures, sourced | Fabrication ends a candidacy |
| Em dashes | TASTE zero; IMP flags saturation only | TASTE zero in visible copy | Cheap to enforce, high-signal |
| Marquees and auto-rotation | gpt marquee component; TASTE at most one; IMP detector flags; UUPM needs pause controls | None by default; if used, pause control and reduced-motion stop | Demands attention it has not earned |
| Transitions on every state change | UUPM "always 150-300ms, never instant"; EMIL none on keyboard/high-frequency actions | EMIL | Frequency decides, not a blanket rule |

### 5c. Gaps none of them covers well for portfolios

| Gap | Partial coverage |
| --- | --- |
| Case-study structure and writing (problem, role, constraints, decisions, outcome, reflection) | IMP Read mode frames the page, not the story; UUPM says agencies "must have case studies" |
| Hero proof: which artifact proves craft in 10 seconds | IMP "prove, don't claim", TASTE "hero needs a real visual" |
| Project ordering (audience fit, range, recency, strongest first) | none |
| Screenshot practice: crops to the feature, consistent device scale, device frames, light/dark captures, public-only sources, NDA handling | TASTE real images, `image-to-code` fixed media frames |
| Role and team attribution, employer vs client wording | none |
| Contact path (email copy, CV link, availability) and the single page-level CTA | TASTE CTA intent rule |
| Per-case SEO and OG images, shareable deep links | `redesign-skill` OG meta, UUPM deep linking |
| Dating and freshness (years, "current"), archive vs selected | none |
| Thumbnail system consistency across very different products | `imagegen` continuity rule |
| Testimonials from colleagues: consent and verification | UUPM "verified, dated" social proof |
| A 60-second scan path for hiring managers on a phone | taste audience signal, IMP persona Casey |

---

## 6. Skill-design lessons and a layout for `portfolio-page`

**What makes these effective as skills.**
1. **Short router, progressive disclosure.** impeccable's SKILL.md is a 12 KB routing table; Emil's siblings load `STANDARDS.md` or `RECIPES.md` only when a value is needed. taste's 87 KB monolith is the counter-example (its changelog admits v1 "was easy for agents to skim past").
2. **Modes that change the rules.** A portfolio needs two: Experience (home, index) and Read (case studies).
3. **Exact values, copied.** Emil: "Never approximate a value that appears here." Tables beat adjectives.
4. **Gates before generation.** Emil's frequency/purpose gate, taste's one-line Design Read, impeccable's two or three questions.
5. **Mechanical checks.** impeccable's two-tier detector with reasoned ignores; UUPM's Playwright audit. Anything greppable should be a script.
6. **Fixed verdict vocabularies.** Nielsen 0-4 with n/a, P0-P3, Block/Approve, Broken/Ugly/Fragile, ship/fix/rebuild/recapture stop softened reporting.
7. **Fresh-context review.** impeccable's reviewer gets no transcript ("a reviewer that inherits your transcript inherits your optimism"); judgment runs before the detector to avoid anchoring.
8. **Restraint built in.** "Delete the animation" is Emil's first remedy; rejected candidates are a required section; impeccable caps verification at two rounds.
9. **Handoffs, not overlap**, and **repository content treated as data**.
10. **Failure lessons:** contradictory siblings (taste), databases recommending what other rules ban (UUPM), process heavier than the task (impeccable on one site).

**Recommended layout.**

```
.agents/skills/portfolio-page/
  SKILL.md                 # <= 250 lines: purpose, modes (Experience, Read), command table,
                           # routing, the 15 hard rules, output contract, handoffs
  reference/
    brief.md               # intake: audience, 10 s / 60 s goals, proof inventory, constraints
    hero.md                # identity and first viewport, proof selection, memory test
    work-index.md          # ordering, tile anatomy, index vs wall, archive filters
    case-study.md          # structure, summary block, evidence, wayfinding, attribution
    media.md               # screenshots, crops, frames, aspect ratios, alt text, formats
    copy.md                # voice, banned words, CTA intents, em-dash rule
    type-colour.md         # font reasoning, scale, tracking, colour strategy, both themes
    layout.md              # spacing scale, rhythm, breakpoints, mobile collapse
    motion.md              # gate, tokens, durations, one focal moment, reduced motion
    a11y-perf.md           # floors and budgets
    anti-slop.md           # complete banned list; each item has the id the checker uses
    review.md              # rubric, severity, verdict words, report format
    worst-case.md          # break-ui style fixtures for projects
  data/rules.json          # id, group, severity, tier (edit | stop | review), source skill
  data/fonts-reflex.json, data/phrases-banned.json
  scripts/check.mjs        # static checks over HTML/CSS/TSX
  scripts/capture.mjs      # 375/768/1440, light/dark, reduced motion, motion settled
  agents/reviewer.md       # fresh-context finish reviewer, no transcript
  templates/case-study.md, templates/review-report.md
```

Commands: `brief`, `hero`, `index`, `case <slug>`, `copy`, `motion`, `media`, `check`, `review`, `break`, `polish`. `check.mjs` can enforce, mechanically: em and en dashes in visible text, eyebrow pattern counts, reflex fonts, gradient text, `transition: all`, `ease-in`, `scale(0)`, layout-property transitions, missing `prefers-reduced-motion`, ungated `:hover` transforms, images without width/height/alt, `100vh` heroes, `user-scalable=no`, banned phrases, duplicate CTA intents, pure #000/#fff fields, lazy-loaded first image. impeccable's `detect --json` already covers many of these and can run as a second engine.

---

## 7. Merged rules worth keeping for portfolios (113)

Tags: **IMP** impeccable, **UUPM** ui-ux-pro-max, **TASTE** taste-skill family, **EMIL** Emil's skills, **NEW** a gap rule that no skill states.

### Identity and hero
1. The first viewport shows the work itself (product shots, a live demo or the project index) at real scale, not a headline over decoration. [IMP, TASTE, UUPM]
2. Within 10 seconds a visitor knows the name, what is built, and where the work is; opening work is possible without scrolling at 1280x720 and 375x667. [IMP, TASTE]
3. Hero headline at most 2 lines on desktop, supporting line at most 20 words, at most 4 text elements in total. [TASTE]
4. Memory test: name the one thing a visitor would repeat an hour later; if it is a mood, the concept has not committed. [IMP]
5. Neither the split template (copy left, image right, badge row) nor a centred headline over a row of cards; derive the composition from the work. [IMP, TASTE]
6. Hero top padding at most 6rem; size type and image together; display type at most about 6rem. [TASTE, IMP]
7. Demonstrate, do not describe: no self-adjectives ("passionate", "pixel-perfect") the page cannot prove. [IMP, NEW]
8. Navigation on one line, 64-80px tall, at most 5 items, current location marked. [TASTE, IMP, UUPM]

### Copy
9. Zero em dashes and en-dash separators in visible text; ranges use a hyphen. [TASTE, IMP]
10. Banned words: elevate, seamless, unleash, next-gen, revolutionize, game-changer, delve, tapestry, streamline, empower, supercharge, world-class, cutting-edge, "theater". [TASTE, IMP]
11. No aphoristic rebuttal cadence ("Not X. Y.") more than once; no micro-meta sentences under headings. [IMP, TASTE]
12. One CTA label per intent across nav, hero and footer; labels at most 3 words on one line. [TASTE]
13. Sentence case, active voice, no exclamation marks. [TASTE, IMP]
14. Plain section labels or none; never "Field notes", "On the bench", "Index of Work 2018-2026". [TASTE]
15. Home sections: heading at most 8 words, body at most 25 words; long reading moves to case studies. [TASTE]
16. Re-read every visible string, including alt text and footer, before shipping; replace clever-but-wrong lines with plain ones. [TASTE]
17. Facts only: no invented metrics, clients, quotes or "organic" numbers; illustrative data is labelled. [IMP, TASTE, UUPM]

### Work display
18. The home index asks one question: which project to open. Filters, sorts and tags live only on a full archive. [IMP]
19. A neutral shell lets product imagery carry the colour. [UUPM, IMP]
20. Every project entry shows name, one-line description, the author's role, year and platform. [NEW]
21. Order projects by fit to the target reader, then strength, then recency; the strongest piece is first. [NEW]
22. No pills or labels overlaid on images; captions sit below. [TASTE]
23. Fixed aspect-ratio media frames per tier with one radius; every image reserves its space. [TASTE, UUPM, IMP]
24. No equal three-card rows; at least 4 layout families across 8 sections; at most 2 consecutive zigzags. [IMP, TASTE]
25. Grids have exactly as many cells as items. [TASTE]
26. Lists over 5 items use a better component: an index with preview, grouped columns, or "view all". [TASTE, IMP]
27. Never fake a screenshot with divs; use real captures or a working live recreation. [TASTE, IMP]
28. Logos from official assets with clear space; a logo wall holds logos only and sits below the hero. [UUPM, TASTE]

### Case study
29. Case pages are Read mode: a calm column (65-75ch, 16-18px body); the visual world owns the frame, not the column. [IMP]
30. Open with a summary answering problem, role, team, timeframe, platform and outcome, readable in 60 seconds. [NEW]
31. Narrative: context, constraint, decisions with evidence, result, what would change. [NEW]
32. Every impact claim has a source or is stated qualitatively. [IMP, TASTE]
33. Show the hardest artifact (flow, diagram, code, before/after) at readable size, enlargeable. [IMP, UUPM]
34. Wayfinding: where am I, next and previous project, back to the index with scroll restored, deep-linkable sections. [IMP, UUPM, EMIL]
35. Quotes at most 3 lines with name and role, published only with consent. [TASTE, NEW]
36. Separate what the author did from what the team did; state no relationship the facts do not support. [NEW]

### Typography
37. Faces come from the subject's world; the reflex list (Inter as display, Roboto, Open Sans, Lato, Montserrat, Helvetica, Fraunces, Playfair, Cormorant, Lora, Newsreader, Syne, Space Grotesk/Mono, IBM Plex, DM Sans/Serif, Outfit, Plus Jakarta, Instrument Sans/Serif, Geist, Mona Sans, Recoleta) needs a reason no other face satisfies. [IMP, TASTE]
38. Self-host fonts with `font-display` swap or optional, subset, preload only the critical face. [TASTE, IMP, UUPM]
39. Body at least 16px, line-height 1.5-1.7 (never below 1.3), measure 65-75ch (35-60 on phones). [IMP, UUPM, TASTE]
40. Display tracking -0.02 to -0.03em, floor -0.04em; body near 0; never above 0.05em on body. [IMP, EMIL]
41. At least one size step of 1.25x or more between heading and body; build hierarchy from size, weight and leading together. [IMP, EMIL, UUPM]
42. Italic display words with descenders get leading of at least 1.1 and a bottom reserve. [TASTE]
43. Emphasis inside a headline uses the same family's italic or weight, never an injected second face. [TASTE]
44. `text-wrap: balance` on headings, `pretty` on body; tabular numerals for years and figures. [IMP, TASTE, UUPM]
45. Monospace only for code, data and measurements. [IMP]

### Colour
46. Choose a strategy before colours; for a portfolio, imagery carries colour and the shell holds one accent. [IMP, UUPM, TASTE]
47. One accent, saturation below 80%, identical on every section. [TASTE]
48. Contrast 4.5:1 body, 3:1 large text, controls, icons and focus; secondary text on colour is tinted from the hue. [IMP, UUPM, TASTE]
49. No AI palettes: purple/violet gradients, neon on near-black, reflex cream grounds, brass/oxblood accents, espresso text. [IMP, TASTE]
50. No pure #000 or #fff fields. [TASTE]
51. If both themes ship, design and test each; never invert mechanically; set `theme-color` per scheme. [IMP, TASTE, EMIL]
52. One theme per page; no inverted section mid-scroll unless it is a single deliberate move. [TASTE]
53. OKLCH ramps behind semantic tokens; reduce chroma near white and black. [IMP, UUPM]

### Layout and spacing
54. One spacing scale on a 4px base; tight groups, generous separations, more space above a heading than below. [IMP, UUPM]
55. Content max width about 1200-1440px; side gutters at least 16px on phones, 24-32px preferred. [IMP, TASTE]
56. Pass the squint test: primary, secondary and groups legible with detail blurred. [IMP]
57. Cards only where elevation means hierarchy; no nested cards; border or shadow, never both; one radius system (12-16px default). [IMP, TASTE]
58. Pace the scroll: a dense passage earns a quiet one; the page ends on a real close (contact). [IMP, TASTE]
59. Declare the under-768px collapse per section; no horizontal scroll at 320px. [TASTE, UUPM, IMP]
60. Heroes use `min-height: 100svh`; app-like shells `100dvh`; never `100vh`. [EMIL, TASTE]
61. Verify at 375, 768, 1024 and 1280-1600, at 200% zoom, and at the user's own viewport. [IMP, UUPM, EMIL]
62. No decorative grids, stripes, crosshairs or hairlines that organise nothing. [IMP, TASTE]

### Motion
63. Gate every animation by frequency (100+ a day: none; tens: near-imperceptible; occasional: standard; rare: delight) and by a named purpose. [EMIL]
64. One authored focal moment per page; never the same entrance on every section. [IMP, UUPM]
65. Content is visible by default; motion enhances it and never gates its existence. [IMP, UUPM]
66. Easing: ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for enter and exit, `cubic-bezier(0.77, 0, 0.175, 1)` for on-screen movement, `ease` for hover and colour, linear for constant motion; never ease-in; no back or elastic. [EMIL, IMP]
67. Durations: press 100-160ms, tooltip 125-200ms, menus 150-250ms, overlays 200-500ms, UI under 300ms; the single focal entrance may run 500-800ms. [EMIL, IMP]
68. Exits run at about 60-70% of the entrance. [UUPM, IMP, EMIL]
69. Stagger 30-80ms per item, at most about 8 items, never blocking input. [EMIL, UUPM]
70. Entrances start at `scale(0.95-0.97)` with opacity and travel 8-24px; never `scale(0)`. [EMIL, UUPM, TASTE]
71. Scroll reveals fire once, via opacity or `clip-path: inset()`; parallax only on imagery (yPercent 5-15), never on text. [EMIL, UUPM]
72. Transform, opacity and clip-path only; no `transition: all`; full transform strings in Motion; blur under 20px. [EMIL, IMP, TASTE, UUPM]
73. Repeatable UI uses transitions, not keyframes; gestures use springs (critically damped default, bounce at most 0.2 after a flick). [EMIL]
74. Reduced motion is gentler, not zero: keep opacity and colour, drop movement, parallax, scrub and autoplay. [EMIL, IMP, UUPM]
75. Route transitions exit in about 250ms or less and never block navigation; View Transitions with a fallback. [UUPM, IMP]
76. No marquee or auto-rotation by default; if used, one, with pause, and stopped offscreen and under reduced motion. [IMP, TASTE, UUPM]

### Interaction
77. Every pressable has `:active` feedback: `scale(0.97)`, 100-160ms ease-out. [EMIL, TASTE, UUPM]
78. Hover motion sits inside `@media (hover: hover) and (pointer: fine)`; nothing essential is hover-only. [EMIL, UUPM, IMP]
79. Popovers grow from their trigger; modals and lightboxes stay centred. [EMIL]
80. Image enlargement: Escape closes, focus returns, buttons as well as swipe. [UUPM, IMP, NEW]
81. No dead `#` links; external product and store links are labelled as external. [TASTE, NEW]
82. Never replace the system cursor; any pointer-follow effect is decorative, spring-smoothed and optional. [TASTE, EMIL]
83. Touch: transparent tap highlight with own `:active`, `touch-action: manipulation`, inputs at 16px, zoom never disabled. [EMIL]
84. Keyboard-initiated actions do not animate; focus is always visible. [EMIL, UUPM]
85. Theme the browser surfaces: selection, caret, scrollbars, focus ring, link underline offset. [IMP]

### Accessibility
86. Text over images meets contrast through a measured scrim. [UUPM, IMP]
87. Landmarks, exactly one h1, no skipped heading levels, a skip link. [UUPM, IMP, TASTE]
88. Screenshot alt text says what the screen shows and why it matters; decorative images use empty alt. [IMP, UUPM]
89. Targets at least 44px (24px web minimum). [UUPM, IMP]
90. Sticky headers never hide keyboard focus (`scroll-padding-top`). [UUPM]
91. Video gets captions, a visible pause, a poster, and no autoplay under reduced motion. [UUPM]
92. Colour is never the only signal. [IMP, UUPM]
93. `lang` set; viewport meta without `user-scalable=no` or `maximum-scale`. [UUPM, EMIL]

### Performance
94. LCP under 2.5s with the first image preloaded, not lazy; INP under 200ms; CLS under 0.1. [IMP, TASTE, UUPM]
95. AVIF or WebP with `srcset`/`sizes`, quality 80-85, lazy only below the fold. [IMP, UUPM]
96. Every image and video declares dimensions or `aspect-ratio`. [IMP, UUPM, TASTE]
97. Grain and backdrop blur only on fixed, `pointer-events: none` layers. [TASTE]
98. Heavy canvas or WebGL initialises near the viewport, pauses offscreen, and degrades to a good static state. [IMP, UUPM]
99. No scroll event listeners; IntersectionObserver or scroll-driven CSS. [TASTE]
100. Test on a real mid-range phone before calling it done. [IMP, EMIL, UUPM]

### Anti-slop
101. No kicker or eyebrow label above headings. [IMP, TASTE]
102. No section numbers, step labels or "SECTION 01". [IMP, TASTE]
103. No gradient text. [IMP, TASTE]
104. No glow halos, radial spotlights, aurora or mesh blobs. [IMP, TASTE]
105. No decorative glassmorphism. [IMP, TASTE]
106. No side-stripe borders over 1px; no hairline-border plus wide-shadow cards; no hard offset shadows outside a neobrutalist world. [IMP]
107. No icon tiles above headings; no emoji icons; one icon library at one stroke weight. [IMP, TASTE, UUPM]
108. No hero-metric template or fake stat rows. [IMP, TASTE]
109. No decorative status dots, pulsing dots, blinking cursors or typewriter heroes. [IMP, TASTE]
110. No locale, time or weather strips, scroll cues, version labels, decoration strips ("DESIGN · BUILD · SHIP") or rotated vertical text. [TASTE]
111. No sketch-style SVG scenes, shape-assembled illustrations or organic `clip-path` blobs. [IMP, TASTE]
112. No placeholder content: lorem ipsum, picsum, "Jane Doe", "Acme", broken images. [TASTE, UUPM, IMP]
113. No middot chains; at most one `·` per line. [TASTE]
