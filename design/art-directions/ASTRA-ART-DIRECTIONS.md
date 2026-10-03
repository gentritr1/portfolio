# Brief for Astra: take the art direction to the next level

You are the next design agent on Gentrit Rashiti's portfolio. The current site (the "control room", see `../../ASTRA-HANDOFF.md`) works and measures well, but the owner finds it **too pale, not energetic, not creative enough**. We explored 16 art directions on a Claude Design canvas (owner's link, private: https://claude.ai/artifact/GvXE4GHJA7WqmiTgAgqQx5). The sources of every board are in `boards/` and a first-viewport screenshot of each is in `screens/`. Your job: take the strongest directions to Site-of-the-Day level, then help the owner pick one and build it into the real site.

## 1. The two reference sites the owner gave (study them first)

- **https://www.designeer.xyz/**: a curated hub for interface craft. Take from it:
  - the dark, calm ground;
  - a strong **mark** (an iridescent, dithered orb as the avatar);
  - dense, perfectly aligned list rows with small favicons;
  - keyboard-first navigation (⌘K, ⌘E);
  - quiet sponsor/promo cards and a floating card at the bottom.
  - Its "Design Engineers" page (`/designers`, about 132 portfolios) and its galleries (60fps, Landing Love, Hover States, Supahero) are the best reference library for this audience.
- **https://www.designeng.tools/**: it redirects to a random design-engineering site on each visit. Two it gave us define the bar:
  - **https://offgrid.inc/**: work-first. A dense wall of work on pure black with tiny captions, a tiny identity block, and a floating "About / Contact" pill. The energy comes only from the work.
  - **https://www.mek.gallery/**: character. Custom pixel and blackletter type, retro game art, a cream "paper" UI, an unmistakable personal voice.
- Other references that tested well:
  - dennissnellenberg.com: work index with cursor previews, magnetic buttons
  - artemiilebedev.com: project index
  - brittanychiang.com/archive
  - rauno.me: looping craft tiles
  - matvoyce.tv and meesverberne.com: kinetic poster type
  - basement.studio: dither and 3D
  - hontran.dev: boot log, sound toggle
  - henryheffernan.com: OS metaphor
  - Apple product pages: studio product shots
  - Codrops "infinite canvas"

## 2. What we learned (do not repeat these mistakes)

Rounds 1 and 2 (A–K) were judged "artificial, not well composed". The causes:
- one shared skeleton with a theme painted on;
- decoration instead of composition (stickers, stamps, HUDs, badges, process captions);
- screenshots dropped into boxes;
- too many ideas on one page.

Round 3 (L–O) started from **one composition idea per page**, with restraint, and was clearly better. Apply `BRIEF-round3.md` as law.

## 3. Calibrated jury (score every iteration this strictly)

Use the Awwwards weights: Design 40 %, Usability 30 %, Creativity 20 %, Content 10 %, each scored out of 10.

| Score | Meaning |
|---|---|
| 5–6 | a competent template |
| 7 | a good personal site |
| 8 | distinctive and crafted |
| 9+ | Site of the Day |

**Loop:** render the page, take a screenshot, score while you look at it, and write down what holds back the lowest category. Then fix it and repeat. The target is ≥ 8 in every category for the direction we ship.

**Current scores (art director, after re-render):**

| Board | Design | Usability | Creativity | Content |
|---|---|---|---|---|
| L · The Wall | 8 | 8 | 7.5 | 7.5 |
| M · Index × Preview | 8 | 7.5 | 8 | 8 |
| N · Canvas | 8 | 8 | 7.5 | 8 |
| O · Studio Shot | 8 | 8 | 7.5 | 7.5 |

Earlier boards worth mining:
- **G · Blueprint** (8.5 / 8 / 8 / 8.5)
- **F · Acid Zine** (8 / 7.5 / 8.5 / 8)
- **I · Desktop OS** (8 / 8 / 8 / 8)
- **H · The Issue** (8.5 / 7.5 / 8.5 / 7.5 after its voice fix)

## 4. Direction by direction: what to take to the next level

### L · The Wall (offgrid.inc, sorted by colour)
- **Great:** the work fills the first viewport; the colour-sorted wall is art direction; the identity block is tiny and precise.
- **Lacking:** it is too close to offgrid; Snaxx appears twice; the static hover dims too much.
- **Next level:**
  - A WebGL wall: one OGL plane per tile, with a subtle **dither-to-colour reveal** on hover and a lens/ripple following the cursor.
  - Velocity-based skew on scroll, so the columns lean slightly when you fling them.
  - Clicking a tile morphs it into the case page (View Transition).
  - A "sort by: colour / year / platform" toggle that re-flows the wall with FLIP animation.
  - An index overlay on ⌘K, as on designeer.

### M · Index × Preview (Snellenberg / Lebedev)
- **Great:** the most recruiter-efficient direction; its typography is the identity; the project name is filled with its own product.
- **Lacking:** a known pattern; the screenshot-filled name loses contrast on light screenshots.
- **Next level:**
  - A real cursor-following preview monitor that tilts in 3D toward the pointer.
  - Row hover plays a 3 s muted loop of the product instead of a still.
  - Magnetic links.
  - The type fill uses a WebGL displacement of the screenshot (a gentle liquid shift) with a solid-ink fallback.
  - Keyboard ↑/↓ moves through the index; Enter opens the case page with a shared-element morph.

### N · Canvas (the design-engineer metaphor)
- **Great:** it speaks the audience's native language (artboards, frame labels, connectors, minimap), and the proof notes read naturally.
- **Lacking:** it is static, while the idea begs for interaction; the lower half is still composed in rows.
- **Next level:**
  - Make it a **real pan-and-zoom canvas** (pointer drag, wheel and pinch zoom, inertia, minimap navigation, "fit to cluster" buttons).
  - Artboards render live (the recreations run inside their frames).
  - A presenter mode: arrow keys fly the camera from cluster to cluster.
  - Cursors of "collaborators" that are actually guided tours.
  - A linear, plain-HTML view for recruiters and screen readers is mandatory.

### O · Studio Shot (Apple product pages)
- **Great:** the most premium first viewport; real phones in a studio fan; each product chapter in its own brand colour.
- **Lacking:** a familiar pattern; weak proof for Viva Fresh and Incentiv; very long (7,640 px).
- **Next level:**
  - Replace the CSS devices with **real 3D device models** (low-poly GLB, OGL or three.js lazy chunk), with the screenshots as screen textures, studio HDRI lighting and soft contact shadows.
  - Scroll-driven camera moves between chapters, with the device rotating to face each new product.
  - The backdrop colour cross-fades per chapter.
  - Shorten the chapters to a pinned, scroll-snapped sequence.

### Ideas to borrow from earlier boards
- **G Blueprint:** exploded-device diagrams with dimension lines that draw themselves. Perfect for case-page heroes.
- **F Acid Zine:** one controlled moment of chaos, the crossing marquees, for the footer or 404 only.
- **I Desktop OS:** an "OS mode" easter egg (press `O`) for fun.
- **H The Issue:** case pages as magazine features (big serif, pull quotes from real facts, numbered pages).
- **Z Motion lab:** pick from the 12 tested loops (device orbit, exploded phone, card flip to proof, tune-in morph, page turn).

## 5. Recommended path (art director's pick)

Build a **hybrid**, not a single board:
1. **Home** = M · Index × Preview (structure, recruiter clarity, typographic identity), with the dithered-orb-style personal mark from designeer as the logo.
2. **"All work" view** = L · The Wall (toggle from the index), colour-sorted, with the WebGL hover.
3. **Case-page heroes** = O · Studio Shot devices (one product shot each), plus G-style exploded diagrams for the technical story.
4. **Easter egg** = N · Canvas as "Explore the canvas" (full pan/zoom), with I · Desktop OS as a hidden key.
5. Keep from the current site the 3D Signal Stack idea only if it fits the chosen mark; otherwise retire it.

## 6. Constraints (unchanged, non-negotiable)

- `../../PRODUCT.md`: public products are named and linked; screenshots come only from public pages and store listings; internal care-platform screens stay recreations; neutral voice (no "I led").
- Facts and numbers only from `../../CONTENT.md`. Placeholders `[Seniority]` and `[your.email@example.com]` stay until the owner fills them.
- Accessibility:
  - contrast ≥ 4.5:1 for body text;
  - touch targets ≥ 44 px;
  - every 3D or WebGL layer has a reduced-motion and no-WebGL fallback;
  - keyboard paths for every interaction;
  - sound is off by default.
- Performance:
  - LCP < 1.5 s;
  - CLS 0;
  - main chunk ≤ 110 kB gzip;
  - 3D chunks lazy and ≤ 150 kB gzip each;
  - 60 fps on an M1 and a mid Android.
- Stack: Vite + React 19 + TypeScript + Tailwind 4 + react-router 7 (see `../../DESIGN.md` and `../../ASTRA-HANDOFF.md`).

## 7. Files here

- `boards/*.dc.html`: all 16 boards. They are Claude Design `.dc.html` files: plain HTML inside `<x-dc>`, with data in a small `renderVals()` script. Images point to canvas blob URLs; the same images are in `../../public/` (`showcase/`, `mobile/`, `personal/shots/`).
- `screens/*-top.webp`: the first viewport of each board at 1440 px. `screens/{L,M,N,O}-full.webp`: the full pages of round 3.
- `BRIEF-round1.md`, `BRIEF-round3.md`: the briefs the boards were made from.
- `render.mjs`: the local renderer we used. It needs path edits to run from here.
