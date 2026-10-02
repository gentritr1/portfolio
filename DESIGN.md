# DESIGN.md: the committed visual world

## Design read

Reading this as: a developer portfolio for hiring managers and senior engineers, with a calm, calibrated broadcast "test card" language, leaning toward Tailwind 4 utilities, CSS custom properties, `light-dark()` tokens, and restrained `motion` choreography.

The page is one calibrated system that tunes to four worlds. The hero shows four colour bars, one per world. Each world section below sets its own accent, and the page accent and ground cross-fade into that world as the visitor scrolls. The accent belongs to the active world only. Everything else stays neutral, so the work leads and the interface recedes.

## Dials

| Dial | Value | Why |
| --- | --- | --- |
| `DESIGN_VARIANCE` | 6 | Asymmetric 7/5 splits and a gapless 7/5, 4/4/4, 5/7 grid. No chaos: the reader must find one case study in 60 seconds. |
| `MOTION_INTENSITY` | 5 | One authored entrance (the bars draw in), once-only reveals, a 520 ms world cross-fade. No idle loops outside recreations. |
| `VISUAL_DENSITY` | 3 | Gallery rhythm. Sections breathe at `clamp(5rem, 12vw, 10rem)`. |

## Colour

Strategy: restrained neutrals plus one accent at a time. All colour tokens are `light-dark()` pairs, so each token resolves against the `color-scheme` of the element that uses it.

Theme: `<html data-theme="light|dark">` when the visitor picked one (stored in `localStorage.theme`); without it, the system preference applies. `index.html` sets the attribute before first paint.

### Neutrals (global, on `:root`)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--canvas` | `oklch(0.972 0.004 258)` | `oklch(0.165 0.008 258)` | Base page ground |
| `--surface` | `oklch(0.995 0.002 258)` | `oklch(0.205 0.01 258)` | Raised panels, stage core |
| `--ink` | `oklch(0.21 0.014 258)` | `oklch(0.95 0.006 258)` | Headings, primary text |
| `--muted` | `oklch(0.46 0.014 258)` | `oklch(0.74 0.012 258)` | Secondary text (AA on every ground) |
| `--line` | `oklch(0.895 0.007 258)` | `oklch(0.29 0.012 258)` | Hairlines |
| `--line-strong` | `oklch(0.8 0.01 258)` | `oklch(0.4 0.012 258)` | Outlines, scrollbar thumb |

### World accents (scoped by `data-world`)

Five registered properties change per world: `--accent` (fills, bars, marks), `--accent-soft` (washes), `--accent-ink` (accent-family text, AA on the ground), `--on-accent` (text on an `--accent` fill), `--world-bg` (page ground tint).

| World | `--accent` light / dark | `--accent-ink` light / dark | `--world-bg` light / dark |
| --- | --- | --- | --- |
| `base` | `oklch(0.24 0.02 258)` / `oklch(0.93 0.008 258)` | same as accent | `--canvas` |
| `healthcare` (clinical teal) | `oklch(0.53 0.095 182)` / `oklch(0.78 0.115 178)` | `oklch(0.45 0.085 184)` / `oklch(0.82 0.1 178)` | `oklch(0.972 0.008 182)` / `oklch(0.165 0.012 190)` |
| `streaming` (signal red-orange) | `oklch(0.56 0.19 33)` / `oklch(0.7 0.18 36)` | `oklch(0.5 0.17 33)` / `oklch(0.76 0.15 38)` | `oklch(0.972 0.006 40)` / `oklch(0.135 0.008 30)` |
| `reading` (paper, ink, amber) | `oklch(0.7 0.14 72)` / `oklch(0.8 0.13 75)` | `oklch(0.48 0.1 60)` / `oklch(0.82 0.12 78)` | `oklch(0.968 0.016 88)` / `oklch(0.17 0.012 70)` |
| `web3` (electric violet on slate) | `oklch(0.52 0.21 282)` / `oklch(0.72 0.16 285)` | `oklch(0.48 0.2 282)` / `oklch(0.79 0.13 285)` | `oklch(0.97 0.008 280)` / `oklch(0.155 0.022 272)` |
| `ai` (citron highlighter) | `oklch(0.72 0.16 122)` / `oklch(0.86 0.17 118)` | `oklch(0.46 0.11 128)` / `oklch(0.85 0.16 118)` | `oklch(0.972 0.008 115)` / `oklch(0.16 0.01 120)` |

`--accent-soft` and `--on-accent` values live beside these in `src/styles/globals.css`. Reading and AI use dark `--on-accent` because their fills are light.

Tailwind utilities: `bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `ring-line-strong`, `bg-accent`, `bg-accent-soft`, `text-accent-ink`, `text-on-accent`. Opacity modifiers work (`bg-surface/70`).

Mixing rule: mix colours `in oklab`, never `in oklch`. An oklch mix between a warm accent and the cool neutral rotates through green.

### Cross-fade

`src/lib/useActiveWorld.ts` watches every `[data-world-section]` with an IntersectionObserver on the viewport's middle line and writes the active world to `<html data-world>`. The five accent properties are registered with `@property` and transition on every `[data-world]` element for `--dur-world` (520 ms) on `--ease-world` (`cubic-bezier(0.32, 0.72, 0, 1)`). The body paints `--world-bg`, so the whole ground fades. Sections never paint their own background.

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display | Bricolage Grotesque (variable `opsz`, `wdth`, `wght`) | Weight 600 for headings, 500 for h3, tracking -0.035em to -0.01em |
| Body | Geist | 1rem / 1.6, story text 1.0625rem / 1.7, measure 58-62ch |
| Data | Geist Mono | Chips, metadata lines, periods, stack lines, numbers (`.tabular`) |

Loaded from Google Fonts with `display=swap` and preconnect.

| Token | Value | Utility |
| --- | --- | --- |
| `--text-display` | `clamp(3rem, 1.6rem + 6vw, 6rem)`, lh 0.94 | `text-display` (H1, Contact) |
| `--text-h2` | `clamp(2rem, 1.35rem + 2.8vw, 3.5rem)`, lh 1.02 | `text-h2` |
| `--text-h3` | `clamp(1.375rem, 1.15rem + 0.9vw, 1.75rem)`, lh 1.15 | `text-h3` |
| `--text-lede` | `clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem)`, lh 1.5 | `text-lede` |
| `--text-meta` | `0.8125rem`, lh 1.4 | `text-meta` |

H1 "Gentrit Rashiti" holds on one or two lines from 375 px up.

## Space, radius, depth, layers

| Token | Value | Utility / use |
| --- | --- | --- |
| `--spacing-section` | `clamp(5rem, 12vw, 10rem)` | `pt-section` on every section (top only, so adjacent sections do not double up) |
| `--gutter` | 16 / 24 / 32 px at base / 640 / 1024 | `px-gutter` (inside `Container`, max width 1200 px) |
| `--radius-chip` | 8 px | `rounded-chip`: chips |
| `--radius-panel` | 16 px | `rounded-panel`: panels, hero bars, capability grid, media |
| `--radius-stage` / `--radius-stage-inner` | 20 / 14 px | Stage double bezel (outer shell, `p-1.5`, concentric core) |
| Controls | full pill | Buttons, nav, tag links |
| `--shadow-float` | soft, offset, ink-tinted | Nav pill, primary button |
| `--shadow-stage` | larger soft, offset | Recreation stage |
| `--z-overlay` / `--z-nav` / `--z-skip` | 40 / 50 / 60 | `z-(--z-nav)` etc. The menu overlay sits under the nav so the close control stays on top. |

Elevation is declared once: a ring or a shadow, never a 1 px border under a wide shadow.

## Motion

| Token | Value |
| --- | --- |
| `ease.out` / `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)`: entrances, hovers, presses |
| `ease.inOut` / `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)`: on-screen movement |
| `ease.drawer` / `--ease-drawer` / `--ease-world` | `cubic-bezier(0.32, 0.72, 0, 1)`: world cross-fade, drawers |
| `duration` (s) | press 0.14, hover 0.2, ui 0.24, world 0.52, reveal 0.6, enter 0.7 |
| `stagger` (s) | tight 0.04, base 0.05, loose 0.06 |
| `travel` | 12 px |

`src/lib/motion.ts` exports these plus `useRevealVariants()` (variant names `hidden` / `shown`), `staggerVariants(gap, delay)`, `viewportOnce`, and `usePrefersReducedMotion()`.

Rules:

- Reveals run once, 12 px rise plus fade, 0.6 s, staggered 40-60 ms. Use `Reveal`, `RevealGroup`, `RevealItem`.
- Animate `transform`, `opacity`, `clip-path`, `filter` only. In `motion`, pass a full `transform` string, not `x` / `y`.
- Hover and press: 150-250 ms, `active:scale-[0.98]` on pressables. Tailwind 4 already gates `hover:` to hover-capable pointers.
- Reduced motion: reveals become a 0.2 s fade with no travel, the hero bars fade instead of drawing, the Snaxx video does not autoplay, smooth scroll is off, and CSS animations collapse to their end state.
- No infinite loops outside recreations. Inside a recreation, a loop pauses off-screen and stops under reduced motion.

## Components

| Component | Contract |
| --- | --- |
| `Container` | `max-w-[1200px] px-gutter mx-auto` |
| `Reveal`, `RevealGroup`, `RevealItem` | Once-only in-view reveal. `as` picks the tag. `immediate` animates on mount. Items accept `data-*` attributes. |
| `Eyebrow` | Metadata line: accent swatch, then items split by hairlines, mono, sentence case. It sits below a heading, never above it (the craft floor bans kickers). |
| `SectionHeading` | `title` (h2), optional `eyebrow` (rendered under the title), optional `lede`. |
| `Chip` | `tone="neutral"` (ringed surface) or `"accent"` (accent-soft wash). Mono 0.78rem, radius 8 px. |
| `Button` | `variant="primary"`: accent pill, trailing icon in its own circle that nudges on hover. `variant="quiet"`: outlined pill. `href` renders an anchor. Min height 48 px, never wraps. |
| `ThemeToggle` | 44 px icon button. Writes `data-theme` and `localStorage.theme` in try/catch, updates `theme-color`. |
| `Nav` | Floating detached pill. Desktop: monogram, active-world indicator (xl+), Work / Capabilities / Personal / Contact, CV, theme. Phone: monogram, CV, theme, morphing two-line menu that opens a full overlay with staggered links; Escape closes and returns focus. |
| `World` | The section shell for every world. See the world contract. |
| `StagePlaceholder` | Temporary stage content: accent-soft panel with a one-word label. |
| `Footer` | Four accent rules, the NDA line, GitHub, CV, back to top. |

Icons: `@phosphor-icons/react` only, `weight="light"`, imported with the `*Icon` names. No emoji, no Unicode glyphs as icons.

## The world contract

Each world lives in `src/worlds/<name>/index.tsx` (exports `<Name>World`) and `src/worlds/<name>/Recreation.tsx` (exports `Recreation`). See `src/worlds/README.md` for the builder checklist.

`World` props:

| Prop | Type | Notes |
| --- | --- | --- |
| `world` | `'healthcare' \| 'streaming' \| 'reading' \| 'web3' \| 'ai'` | Scopes tokens, sets `id`, marks the section for the cross-fade |
| `title` | `string` | h2 |
| `meta` | `string[]` | Eyebrow parts from CONTENT.md, shown under the title |
| `role` | `string` | Employer and period come from `src/lib/worlds.ts` |
| `story` | `string[]` | Paragraphs |
| `facts` | `string[]` | Chip list |
| `stack` | `string[]?` | One line per group |
| `recreation` | `ReactNode` | Fills the stage core |
| `recreationName` | `string` | Caption: "Live recreation: <name>. Invented data, no client screens." |
| `stageAspect` / `stageAspectMobile` | CSS aspect-ratio | Default `4 / 3`; mobile defaults to the desktop value |
| `layout` | `'stage-end' \| 'stage-start' \| 'stage-wide'` | Split with stage right, split with stage left, or full-width stage over a two-column narrative |
| `children` | `ReactNode?` | Extra narrative after the story |

Stage core: `position: relative`, `overflow: hidden`, `rounded-stage-inner`, `bg-surface`, and a size container (`@container`), so recreations use `@sm:` style variants and `cqi` units against the stage. Below 1024 px the stage renders first. On wide split layouts the stage is sticky at `top: 6rem`.

Current layouts: healthcare `stage-end`, streaming `stage-wide`, reading `stage-start`, web3 `stage-wide`, ai `stage-end`. No three consecutive sections share one split direction.

## Page order

Nav, Hero, Capabilities, Healthcare, Streaming, Reading, Web3, AI dashboards, Personal, Skills, Contact, Footer. `#work` wraps the five worlds.

## Refused on purpose

Kicker labels above headings, section numbers, em dashes, gradient text, glass on scrolling content, decorative dots, three equal cards, centred hero over mesh, `in oklch` colour mixing, Inter / Roboto / Arial.
