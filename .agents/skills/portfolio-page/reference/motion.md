# Motion and smoothness

Motion on a portfolio does two jobs: it makes one moment memorable, and it makes every other interaction feel precise. The winners of 2023–2026 (Lusion, Igloo, Bruno Simon, Pacôme Pertant) share one material idea carried through, a transition that preserves the object, and restraint everywhere else. Fade-up sections, preloader counters and cursor blobs never appear among them.

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

CSS springs with `linear()` (not interruptible with velocity; for hover and enter states):

```css
--spring-ui: linear(0, 0.005 1.5%, 0.023 3.3%, 0.091 7%, 0.469 21.5%, 0.635 29%, 0.754 36%, 0.8 39.5%, 0.842 43.3%, 0.884 48%, 0.917 53%, 0.944 58.5%, 0.964 64.5%, 0.979 71%, 0.989 78.8%, 0.999); /* 380ms */
--spring-snap: linear(0, 0.005 1.3%, 0.025 2.8%, 0.101 6%, 0.529 18.5%, 0.708 24.8%, 0.776 27.8%, 0.837 31%, 0.886 34.3%, 0.927 37.8%, 0.959 41.5%, 0.982 45.5%, 0.998 50%, 1.008 55.3%, 1.012 65.3%, 1.001); /* 350ms */
```

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

## Reduced motion

`prefers-reduced-motion: reduce` keeps every state change and removes travel: durations collapse to ~0 or to a 150–200 ms opacity change; parallax, marquees, autoplay loops, cursor followers and scroll scrubbing stop; WebGL shows a designed still frame or is not created. Never "no animation at all" that hides a state change. Sound stays opt-in.

## The signature moment

Pick **one** per page. It must carry a fact (the visitor learns something by doing it) and survive the delete test (every fact is still on the page without it).

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

`check.mjs` covers: loops (M01), long animations (M02), layout properties (M03, M03b), linear and ease-in movement (M04, M04b), `scale(0)` (M04c), smooth-scroll libraries (M05), scroll resistance (M06), content never revealed (M07), fade-up systems (M08), reduced motion (M09, M09b), frame timing (indicative headless numbers).

By hand:
- Capture mid-animation frames (`--frames 120,320,700`, or `document.getAnimations().forEach(a => { a.pause(); a.currentTime = t })`). Two identical end states prove nothing.
- Scrub the signature moment at 10% speed (CDP `Animation.setPlaybackRate` 0.1): no pop, no text blur during scale, siblings do not move.
- Interrupt it: trigger, reverse at 40%, check it reverses from where it is.
- Throttle CPU 4× (`--throttle 4`): p95 frame ≤ 20 ms during the moment, no long animation frames ≥ 50 ms, CLS 0.
- Reduced-motion capture shows the same states and the four first-screen answers.
- A real mid-range phone before calling it shipped.
