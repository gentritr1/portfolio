---
name: Gentrit Rashiti Portfolio
description: A work-first index with product imagery, studio case studies and an optional project canvas.
colors:
  primary: "light-dark(#2447d9, #849bff)"
  on-primary: "light-dark(#ffffff, #101112)"
  neutral-ground: "light-dark(#f0efe9, #101112)"
  panel-1: "light-dark(oklch(0.985 0.002 250), oklch(0.182 0.005 250))"
  panel-2: "light-dark(oklch(0.908 0.007 250), oklch(0.214 0.006 250))"
  panel-3: "light-dark(oklch(0.885 0.006 250), oklch(0.252 0.007 250))"
  ink: "light-dark(oklch(0.2 0.01 250), oklch(0.94 0.004 250))"
  ink-secondary: "light-dark(oklch(0.4 0.012 250), oklch(0.76 0.008 250))"
  ink-muted: "light-dark(oklch(0.46 0.012 250), oklch(0.64 0.008 250))"
  hairline: "light-dark(oklch(0.805 0.008 250), oklch(0.27 0.006 250))"
  hairline-strong: "light-dark(oklch(0.68 0.012 250), oklch(0.37 0.008 250))"
  wall-ground: "#0a0a0a"
  wall-ink: "#f2f2f0"
  overlay-scrim: "#000b"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(48px, 8.3vw, 112px)"
    fontWeight: 570
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  index-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 48px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(36px, 4.7vw, 66px)"
    fontWeight: 520
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  story:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Martian Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.08em"
  intro:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 4.1vw, 64px)"
  intro-phone:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "38px"
  intro-narrow:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
  index-phone:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
  index-narrow:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "31px"
  index-wide:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "52px"
  preview-proof:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(20px, 2.1vw, 30px)"
  preview-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "23px"
  text-art:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "42px"
  section-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "48px"
  section-title-phone:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
  contact-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 7vw, 96px)"
  canvas-cluster:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
  intro-lede:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
  interface-lede:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
  technical-note-phone:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
  wall-caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
  interface:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
  interface-small:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
  metadata:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
  metadata-small:
    fontFamily: "Martian Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "10px"
  metadata-tiny:
    fontFamily: "Martian Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "9px"
  wall-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(20px, 1.75vw, 28px)"
  studio-phone:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(45px, 12.2vw, 86px)"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "10px"
  search-dialog: "12px"
spacing:
  section: "clamp(4.5rem, 10vw, 8rem)"
  portfolio-gutter: "clamp(20px, 4.45vw, 72px)"
  case-gutter: "16px"
  control: "44px"
components:
  work-view-control:
    textColor: "{colors.ink-muted}"
  work-view-control-active:
    textColor: "{colors.ink}"
  index-row:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.index-title}"
  search-input:
    textColor: "{colors.ink}"
    padding: "12px 0"
  navigation:
    textColor: "{colors.ink-secondary}"
  wall-tile:
    backgroundColor: "{colors.wall-ground}"
    textColor: "{colors.wall-ink}"
---

# Design System: Gentrit Rashiti Portfolio

## Overview

**Creative North Star: "Index × Studio"**

The owner approved the recommended hybrid in [ASTRA-ART-DIRECTIONS.md](design/art-directions/ASTRA-ART-DIRECTIONS.md), with [BRIEF-round3.md](design/art-directions/BRIEF-round3.md) as its composition rules. This refresh records the implementation. It supersedes the control-room home direction in REDESIGN.md; PRODUCT.md and CONTENT.md retain authority over audience, facts, names and image provenance.

The work supplies the colour and the character. An orderly index gives a hiring manager a fast scan; large product imagery and material device compositions reward a closer look. Dark graphite, a warm-paper daylight theme, precise type and one cobalt interaction colour hold the surfaces together. Each surface has one dominant composition, rather than a shared page template with a different skin.

The identity mark is the local geometric dithered cut orb in `public/mark.svg`, with a matching favicon and a darkened daylight treatment for legibility. It is the personal mark, not a product logo. Signal Stack is retired from the home page and retained in the 404 and development lab. Channel keys and monitor names still exist in content and recreation code; they no longer define the home-page language.

**Key Characteristics:**

- A dense, readable project index beside a sticky image preview.
- Product images composed at scale; a distinct studio composition for each featured case.
- Flat editorial structure, with depth reserved for depicted objects and temporary windows.
- Two local variable font families and restrained mono metadata.
- Optional wall and canvas views with a complete linear browsing route.

## Colors

### Primary

**Cobalt signal** is `colors.primary`, implemented as `--signal`. It marks focus, selected controls, active index arrows and technical-diagram selection. Its on-colour is `--on-signal`. It replaces the former red-orange broadcast signal. Do not use it as a wash behind every section.

### Neutral

**Graphite and warm paper** are the two values of `colors.neutral-ground` (`--panel-0`). Dark is the default. Daylight is selected with `html[data-theme="light"]`; the theme is applied before paint and remembered in local storage. The lighter theme uses warm paper, dark ink and distinct panel tones rather than inverting product imagery.

`panel-1` through `panel-3` supply small tonal steps for surfaces and states. Primary, secondary and muted ink have distinct semantic roles. Hairlines divide rows and organize information; the stronger hairline outlines controls and dialogs. Frontmatter values preserve the CSS source formats, including `light-dark()` and OKLCH. Mix colours in `oklab`.

### Product imagery and scoped scenes

Index previews and studio backdrops have project-specific colour in `indexArt.ts` and `studioShots.ts`. These are local art-direction values, not alternative site themes. Public brands stay visible. The wall intentionally remains near black, and the canvas keeps its dark workspace palette, in both site themes. Screenshots retain their original colours. The search dialog uses the translucent black `overlay-scrim` colour to separate the temporary modal from the page; it is not an extra page ground.

The authored recreations retain their scoped `data-world` palettes, and legacy channel tints remain available for factual case metadata and the 404/lab. Those palette tokens do not replace the shell's cobalt signal.

## Typography

**Display and body:** Archivo variable, served locally from `/fonts/Archivo.woff2`. **Metadata:** Martian Mono variable, served locally from `/fonts/MartianMono.woff2`. Both use `font-display: swap`. Archivo replaces the former third body face; there is no remote font request.

The type system is a compact sans-led index with larger, more open product headings. Archivo's width axis is purposeful: project names in the index use a condensed width (82%), while the intro uses normal width. Existing generic case headings may inherit the wider heading width. Martian Mono is used for small numbers, dates, technologies and control hints, not long text.

- **Display:** the large project title above a case studio, using the `display` frontmatter role. On phones it scales separately to fit the available width.
- **Index title:** condensed project names with enough room for a row number, category, year and directional arrow. Narrow screens move category and year below the title.
- **Headline:** large technical-story headings; two short lines are preferred to a long compressed line.
- **Body and story:** normal text starts at 16 px; extended case reading uses the `story` role and a measure of about 64 characters.
- **Labels:** mono numbers and metadata can be smaller. Their contrast and surrounding spacing must support scanning; they do not replace body text.

The frontmatter includes the smaller interface/metadata steps and the fluid intro, preview, wall and footer roles as well as the main case roles. These are the observed source sizes, with their purposes in the sidecar; they are not all interchangeable body sizes. Responsive entries name the surface they belong to.

**The Tracking Limit Rule.** No heading is tighter than `-0.04em`. Type may flex in size and width, but long names must remain readable at 375 px without clipping. Avoid ornamental kickers and repeated uppercase labels when a normal sentence is clearer.

## Layout

The home and shared shell use a fluid container capped at 1536 px, with `spacing.portfolio-gutter`. Case-study reading uses the existing 1280 px `Container`; its horizontal gutter steps from 16 px to 24 px at 640 px and 32 px at 1024 px. Section spacing follows `spacing.section` unless a signature composition has an observed local rhythm.

The desktop index is asymmetric: the project list takes roughly three fifths of the width and the right preview the rest. The preview is sticky at 24 px from the viewport top; the masthead is a normal-flow header. At 760 px and below, the preview moves above the index and becomes static. Its phone art height is reserved (260 px, or 240 px at 400 px and below), keeping row interaction from changing the document structure. Metadata stacks, controls remain usable and the mobile preview exposes the selected project name.

The wall has a compact opening: selecting Wall hides the full home introduction so the work enters the first viewport sooner. Its masonry composition has staggered starts, variable image aspect ratios and small captions. Container width selects two, three or five columns; the five-column composition alternates narrower and wider columns. The three sort modes preserve project identity while changing order. Items without imagery are typography-led project records, not fabricated screenshots.

Case pages have a full product title, a large fixed-height studio stage, compact links and facts, then an exploded system diagram and factual reading. The diagram and its explanatory buttons sit side by side on desktop and stack on phones. The existing milestones, guided demonstrations, public image galleries, related work, specifications and next-project navigation remain accessible below.

The surface-specific story and responsive sequence are recorded in `.impeccable/surfaces/src-app-tsx.md`. This system does not require a sticky masthead, a scroll-snapped chapter sequence or a scrolling stack of monitor cards.

## Elevation & Depth

The page structure is flat. Hairlines, white space and text hierarchy separate information. Shadows describe product objects in previews, actual 3D devices in studio stages, exploded diagram plates, and temporary desktop windows in the optional canvas. They are not the default border treatment for every section.

Studio devices have real low-poly enclosure geometry, metallic bevel lighting and screen textures. A soft CSS floor shadow grounds the composition; the lighting is authored in the shader, not an external HDRI. The static CSS device composition is the first frame and the complete reduced-motion/no-WebGL fallback. Display hardware remains graphite in either theme.

The diagram uses three perspective planes with small extruded edges. Selecting an explanatory row highlights and raises its corresponding plane. The text itself remains in a normal reading layout. Search may blur its modal backdrop; reduced motion removes that blur. Scrolling content does not become frosted glass.

Shadow, easing and duration values belong to `.impeccable/design.json`, not the primitive frontmatter schema.

## Shapes

The editorial surfaces use open edges and straight hairlines. Controls use restrained rectangular corners from the existing radius scale. Search is a rounded dialog; product-device corners describe physical hardware and have their own proportions. These device silhouettes are objects within a composition, not a universal card shape.

The personal mark is a geometric orb made from a field of dots with a diagonal cut. Its silhouette and dither are the identifying feature; do not add a monogram, broadcast badge or decorative status stamp beside it. Small directional icons are SVG, using the existing Phosphor light paths where applicable. Unicode arrows in keyboard instructions are text, not replacements for interface icons.

## Components

### Masthead, navigation and footer

The masthead contains the cut-orb mark and name, Kosovo/Remote metadata, Work/About links, email, CV and utility controls. Active navigation receives a quiet cobalt underline. Every actionable control has at least a 44 px hit area. The phone layout prioritizes identity, email, CV and theme; some desktop utility controls are hidden. The footer uses an open contact invitation, the owner-confirmed links and a simple rule. Actual contacts come from `src/content/links.ts`.

Sound remains off by default and remembers an explicit opt-in. Audio is synthesized only after an intentional supported interaction; decorative scene movement is silent.

### Project index and preview

`HomePage` opens with eight selected projects and can reveal all 28. The row itself is the action: featured projects open a case; other projects open the existing drawer. On desktop, focus or a mouse pointer selects the adjacent preview. Up/down and Home/End move focus through the index; Enter activates the focused row. On phones, the preview above the index represents its project once, replacing that project's duplicate row; focus and hover do not change it. Selection uses colour and an arrow, not a large filled card.

`IndexPreview` composes public page/store frames or an authored still on a product-coloured ground. A fine pointer creates a small local tilt. Eligible featured products can show a brief, muted three-second scripted recreation after deliberate hover or a Play action. Stop, offscreen and hidden-tab paths stop the preview. Reduced motion keeps a static presentation. The whole image is not a screenshot-filled text effect; the project name stays solid ink.

### Work wall

`WorkWall` is a lazy alternative to the index, with Colour, Year and Platform sorting. Pointer-triggered sorting uses a short FLIP reflow (420 ms); keyboard sorting updates directly. Native buttons, images and captions are the complete base experience. The first eligible fine-pointer hover loads a shared OGL layer for a subtle dither/lens response. Reduced motion, Save Data, low memory and missing graphics support retain the still image. Tile-to-case navigation uses the existing named View Transition when available.

### Project search

`ProjectSearch` is a lazy native modal dialog, opened by the search control or Command/Ctrl K. The field searches project name, kind and stack. Up/down changes the selected result and Enter opens it. A clear empty state, Escape dismissal and focus restoration remain part of the contract. Its understated input uses a bottom rule rather than a new form-card system.

### Studio hero and technical diagram

`StudioHero` replaces the control-room monitor as the opening of all five featured cases. Reading and grocery use a fan of phones; care, streaming and wallet work use wide display compositions. `studioShots.ts` records the public image selection, crop and local backdrop. Care uses the existing invented-data poster with one small provenance caption. Product names remain large, solid and separate from the image.

`studioScene.ts` is lazy and targets at most 25 kB gzip **including its required shared graphics modules**. Its screen images are separate assets. The device renderer runs a frame when needed, then settles; it has no idle rotation. It pauses offscreen or in a hidden tab and disposes resources on unmount, failed images or context loss. Reduced motion, Save Data and low-memory devices retain the static composition.

`TechnicalDiagram` presents three project-specific system layers grounded in CONTENT.md. Selecting a native explanatory button highlights the matching exploded plane; all descriptions remain visible without interacting. The selection uses the cobalt signal. It does not imply unsupported architecture, invented dimensions or unverified ownership.

### Case reading, demonstrations and galleries

`Readouts`, `CaseFacts`, `StoryBlocks`, `BuildTimeline` and `SpecSheet` preserve the factual reading path. `WatchItWork` offers the existing approximately 16-second scripted demonstrations with still posters, play/pause/replay, manual steps for reduced motion and offscreen pause. Public galleries remain full image collections and use the native `FrameDialog` with previous/next controls, arrow keys, Escape and focus restoration. Related work and Next project use plain project language; the old opening lower third is no longer rendered.

### Canvas and desktop easter egg

`ExploreCanvas` is a lazy, full-screen native dialog. Its four artboard clusters support drag panning, wheel/pinch zoom, bounded inertia, a minimap, fit controls and a presenter mode. Arrow keys pan the focused canvas; plus/minus zoom; F fits the view. Presenter arrows move between clusters. Optional live previews mount only when enabled and visible. Reduced motion removes inertial and animated camera travel.

The home O shortcut opens the canvas. Inside it, O switches between canvas and the optional desktop, where project windows can be dragged or moved through their keyboard-accessible title bars. Escape and Back to index close the exploration and restore focus. The regular home index is the linear alternative; this mode is never required to reach work or contact information.

### Routes, transitions and retained Signal Stack

`/` owns index, wall and optional canvas state. `/work/:slug` lazily loads a featured case; `/?p=<slug>` opens a non-featured project's drawer. `TransitionLink` preloads the destination, then uses the browser View Transitions API where supported. The root fade is 160 ms and the named image morph is 480 ms. The internal name `monitor-<slug>` is shared by the preview, wall asset and case stage. Reduced motion navigates directly.

Unknown routes retain the small “No signal” treatment. Its Signal Stack loses its colour and trace, with an immediate still fallback when motion is reduced or WebGL is unavailable. The larger Signal Stack, optional refraction and context-loss controls remain in the development lab for maintenance; they are not home-page features. Existing broadcast-styled recreation containers remain local to demonstrations, not the primary shell.

## Do's and Don'ts

### Do:

- **Do** start with the approved hybrid and one dominant composition per surface. The pinned brief is visual authority; the surface record explains its current expression.
- **Do** use the existing public page/store assets and clearly identified invented-data care recreation. Keep brands visible and use CONTENT.md for every factual claim.
- **Do** preserve a complete keyboard, phone and reduced-motion path. Body text needs at least 4.5:1 contrast and touch targets at least 44 px.
- **Do** reserve image and stage dimensions. Treat CLS 0, LCP below 1.5 seconds, initial JS at most 110 kB gzip including shared preloads, and smooth 60 fps interaction as targets to verify, not claims inferred from a build.
- **Do** lazy-load optional canvas, wall effects and 3D code. Retain the stricter 25 kB studio scene budget rather than using the brief's larger allowance as a reason to add dependencies.
- **Do** record screenshot jury scores and measured outcomes in the handoff/verification records. A design document is not evidence that every target passed.

### Don't:

- **Don't** restore Signal Stack, channel tabs, the schedule metaphor or a lower third as the home or case opening.
- **Don't** paint one repeated page skeleton with multiple themes. The index, wall, studio and optional canvas have distinct composition jobs.
- **Don't** add invented client relationships, private screenshots, fake product data presented as real, unverified dates or inflated ownership claims.
- **Don't** introduce a third typeface, remote font dependency, gradient-filled headings, decorative status badges, HUD clutter, glowing panels or scroll reveals on every section.
- **Don't** make ambient motion, audio, WebGL, a hover state or the canvas necessary to understand the work.
- **Don't** turn studio objects into a generic system of rounded cards, or substitute decoration for stronger image composition.
