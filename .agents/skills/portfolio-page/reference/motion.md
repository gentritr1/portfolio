# Motion and smoothness

Motion on a portfolio does two jobs: it makes one moment memorable, and it makes every other interaction feel precise. The winners of 2023–2026 (Lusion, Igloo, Bruno Simon, Pacôme Pertant) share one material idea carried through, a transition that preserves the object, and restraint everywhere else. Fade-up sections, preloader counters and cursor blobs never appear among them.

## The quiet layer (most of a premium page)

Before any signature moment, build this layer. It is what visitors feel as "smooth":

- Press: `:active { transform: scale(0.98) }`, 120 ms, ease-out. On touch, the press state replaces hover.
- Hover: 150 ms, colour or opacity, only inside `@media (hover: hover) and (pointer: fine)`.
- Focus: instant, always visible, themed.
- Link underline grows from the left in 150 ms (`background-size` or `scale` on a pseudo-element), never `transition: all`.
- Opening a case: a View Transition, 300–450 ms expo-out, the tile becoming the hero (`snippets/view-transition.css`). Pointer-initiated only: keyboard activation (`event.detail === 0`) and reduced motion navigate instantly, and focus moves to the new h1. Screens must not zoom during the morph (see the no-scale variant in the snippet).
- Nothing else moves.

## The gate: frequency and purpose

Before animating anything, name its purpose (`feedback`, `state`, `continuity`, `reveal`, `story`) and how often a visitor triggers it.

| Frequency | Treatment |
|---|---|
| 100+ times a visit (keyboard, ⌘K, list navigation, tab switching) | **None.** Keyboard-initiated actions never animate. |
| Tens of times (hover, menus, row selection) | ≤ 150 ms, or none |
| Occasional (open a case, a dialog, a drawer, theme) | Full treatment, 200–450 ms |
| Once per visit (the intro, a story beat) | Up to 800 ms, **one per page** |

No purpose, no animation. "Delete the animation" is the first fix to try.

## Tokens

**Durations** (ms)

| Token | Value | Use |
|---|---|---|
| micro | 100–160 | press, toggle, focus |
| small | 150–250 | tooltip, dropdown, hover reveal, row highlight |
| medium | 250–400 | dialog, drawer, tile → case, FLIP layout change |
| large | 400–600 | full-width reveal, route transition |
| story | 600–800 (1,100 hard ceiling) | the one authored moment |
| exit | 0.6–0.75 × the enter | anything leaving |

By distance: ≤ 24px travel 100–160 ms; 24–120px 150–250 ms; 120–600px 250–400 ms; full viewport 400–500 ms.

**Curves** (cubic-bezier)

| Name | Value | Use |
|---|---|---|
| ease-out | `(0.23, 1, 0.32, 1)` | default enter/exit |
| expo-out | `(0.16, 1, 0.3, 1)` | arrivals, the story moment |
| sheet | `(0.32, 0.72, 0, 1)` | drawers and sheets (500 ms, Vaul) |
| in-out | `(0.77, 0, 0.175, 1)` | movement on screen, morphs, clip-path reveals |
| ease | CSS `ease` | hover colour only |
| linear | `linear` | constant motion (a marquee, a progress bar) only |
| never | `ease-in`, CSS `ease-out` keyword (too soft), back/elastic | — |

**Springs** (`motion`) — for anything the pointer touches or can re-trigger:

| Token | Value | Settles | Use |
|---|---|---|---|
| ui | `{ stiffness: 350, damping: 35 }` | ≈ 380 ms | selection, layout, toggles |
| snap | `{ stiffness: 600, damping: 40 }` | ≈ 350 ms | drag release |
| lift | `{ duration: 0.4, bounce: 0.15 }` | 400 ms | a card that lifts |
| play | `{ duration: 0.5, bounce: 0.3 }` | 500 ms | one playful moment per page |
| follow | `{ stiffness: 150, damping: 15, mass: 0.1 }` | fast | cursor-linked elements |

Never ship `motion`'s physics default `{ stiffness: 100, damping: 10 }` (settles ≈ 1.27 s, wobbly). Bounce ≤ 0.2 for UI, ≤ 0.3 once. Apple's model: damping ratio = 1 − bounce.

CSS springs with `linear()` (not interruptible with velocity; for hover and enter states) are in `snippets/springs.css`.

## Physical rules

- Scale enters from 0.95–0.97 with opacity, never from 0. Press: `scale(0.97)`, 160 ms ease-out.
- `transform-origin` points at the trigger for popovers; dialogs stay centred.
- Exit along the entry path, faster.
- Stagger 30–80 ms per item, total ≤ 400 ms, only when a list enters as a list.
- Everything re-triggerable is interruptible: transitions or springs, not keyframes. A second click mid-flight reverses from the current position with the current velocity.
- Hover motion inside `@media (hover: hover) and (pointer: fine)`. Touch gets `:active` press states.

## Performance rules

- Animate only `transform`, `opacity`, `clip-path`, `filter` (blur ≤ 8px, never on a full-viewport layer). Never `width`, `height`, `top`, `left`, `margin`, `padding`. Never `transition: all`.
- Use full transform strings or motion values for the heaviest moment; do not drive child transforms through a parent CSS variable.
- `will-change` only within ~200 ms of a known animation; remove it after. ≤ 8 promoted layers at rest.
- No scroll event listeners: IntersectionObserver or CSS scroll-driven animations (`animation-timeline: view()`, behind `@supports`, end state as default).
- Multiply per-frame steps by `dt`; a 120 Hz screen otherwise plays at double speed.
- Split text only after `document.fonts.ready`; give the parent an accessible name.
- Images swapped into a running animation: `await img.decode()` first.
- Long pages: `content-visibility: auto` with `contain-intrinsic-size` on offscreen sections.
- Smooth-scroll libraries (Lenis) only when WebGL must follow the scroll; otherwise native scroll.

## Orchestration

- At most two things move at once in the first screen; overlaps ≤ 30% of a duration.
- The eye follows one path (from the claim to the work), and every sequence ends on a still within 1 s.
- The one sanctioned list entrance: `translateY(12px)` + opacity, 300 ms ease-out, stagger ≤ 60 ms, once, only for a list that enters as a list, never more than ~400px below the fold, never re-triggered on scroll up. Sections never fade up.

## Reduced motion

`prefers-reduced-motion: reduce` keeps every state change and removes travel: durations collapse to ~0 or to a 150–200 ms opacity change; parallax, marquees, autoplay loops, cursor followers and scroll scrubbing stop; WebGL shows a designed still frame or is not created. Sound stays opt-in.

Wrong (hides end states that were set by an animation, and kills feedback):

```css
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

Right (states still change; travel and loops stop): see `snippets/reduced-motion.css`, and in React read `useReducedMotion()` from `motion/react` and render the end state directly.

## The hook ladder

How reviewers score the hook (and what to aim for):

| Score | What the visitor does | Example shape |
|---|---|---|
| 7 | Watches something play once | a settle on load, a write-on, a counter-free reveal |
| 8 | Triggers a moment that changes what they see of one thing | turning one card, opening one case, choosing one item |
| 9 | Drives a state continuously, visible across the whole page, and it carries a fact about the person | light from a real sun, a seam between the old and the new app, a filter that re-reads the whole record |

The memory sentence names a verb the visitor does ("drag", "scan", "switch", "turn", "press"). Duration tokens apply to **authored playback**. A state the visitor drives (a drag, a scrub, a dial) has no duration cap; it must follow the pointer, be interruptible and pass the 10% scrub test. The "one story moment" rule limits playback, not driven state.

## The signature moment

Pick **one** per page. It must carry a fact (the visitor learns something by doing it) and survive the delete test (every fact is still on the page without it). Mark it `data-motion="story"`.

A settle-on-load of the hero (the picture is complete and readable in its first frame, then moves once into place in ≤ 800 ms) counts as the page's one story moment, not as an intro. An intro is anything that delays the first readable frame.

Build order (do not animate first and backfill the fact):

1. Build the end state, static, and make it good enough to ship.
2. Add the cause: the control, the scroll position or the route that triggers it.
3. Add the motion with one token from the tables above.
4. Make it interruptible (spring or transition, never keyframes for re-triggerable motion) and keyboard-driven.
5. Add the reduced-motion branch: same end state, no travel.
6. Measure at 4× CPU (`--throttle 4`) on a production build, not the dev server (`npx vite build --outDir /tmp/<id>-dist && npx vite preview --outDir /tmp/<id>-dist --port <n>`): p95 frame ≤ 20 ms, no long frame ≥ 50 ms, CLS 0. A canvas's static fallback must match its resting frame pixel for pixel, so the swap does not pop.
7. Capture five mid-frames and scrub at 10%: no pop, no text blur during scale, siblings do not move.

| Moment | What it explains | Recipe | Slop risk |
|---|---|---|---|
| Tile becomes the case (shared element) | Continuity: you never lose the thing you chose | View Transitions with `view-transition-name` on tile + hero, 300–450 ms expo-out; or `layoutId` + spring.ui | Low — the one transition that explains |
| Live demo inside the text | The claim is tried, not read | Real component mounted in view; its own reduced-motion branch | Low, if the demo is specific |
| A mechanism the visitor drives that reveals facts (a seam between old and new, a quality dial, a time-of-day sun, a switch between two readers) | The person's actual skill as an interaction | Spring-driven, pointer + keyboard, state visible in text too | Medium: must change what the visitor knows |
| Line-mask reveal of the one opening sentence | Paces the first read | Lines `translateY(110%) → 0`, 700–900 ms expo-out, 60–80 ms stagger, once, after fonts load | High if used on more than one heading |
| Image reveal by `clip-path` | "Shown", pointing to its source | `inset(0 100% 0 0) → inset(0)`, 600–800 ms in-out, inner scale 1.08 → 1 | Medium; one at a time |
| Drag with handed-off velocity | Weight and control | `drag` + snap spring, predicted target `x + v × 0.2` | Low with real work |
| `steps()` beat (receipt, test runner, departure board) | A machine doing real work | `steps(n)` on clip-path; only with real data | High if fake ("boot log") |
| Hard cuts on a beat | Confidence, rhythm | Swap every ~2 s, no fade, pause offscreen | Low |
| ⌘K that does not animate | Craft by absence | Open 150 ms; results change instantly | None |
| Theme switch without transitions | Feels like a system setting | Disable transitions for one frame; optional circle reveal via View Transition | Low |

Treat these as clichés unless they carry a fact: preloader counters, "Hello/Bonjour" word cycles, fade-up on every section, char-by-char scramble on hover, magnetic buttons everywhere, a dot-and-ring cursor, image-follows-cursor lists with generic thumbnails, WebGL blobs and metaballs, multi-layer hero parallax, curtain wipes on every route, logo marquees, counting-up numbers.

## Verification

`check.mjs` covers (see `reference/checks.md`): loops (M01), long animations (M02; > 1,100 ms fails unless `data-motion="story"`), layout properties (M03), linear and ease-in movement (M04), `scale(0)` (M04c), smooth-scroll libraries (M05), scroll resistance (M06), content never revealed (M07), section fade-ups (M08), reduced motion including canvas loops (M09), scroll frame timing (M10), too much moving at load (M11). Headless frame numbers are indicative; trust a real mid phone over them.

By hand:
- Capture mid-animation frames: `--frames-after <selector>` for load moments, `--interact "click:<selector>" --interact-frames 60,150,300,600` for a moment the visitor triggers, or pause `document.getAnimations()` at a set `currentTime`. Two identical end states prove nothing.
- Scrub the signature moment at 10% speed (CDP `Animation.setPlaybackRate` 0.1): no pop, no text blur during scale, siblings do not move.
- Interrupt it: trigger, reverse at 40%, check it reverses from where it is.
- Throttle CPU 4× (`--throttle 4`): p95 frame ≤ 20 ms during the moment, no long animation frames ≥ 50 ms, CLS 0.
- Reduced-motion capture shows the same states and the four first-screen answers.
- A real mid-range phone before calling it shipped.
