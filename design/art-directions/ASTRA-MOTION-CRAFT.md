# Addendum for Astra: motion and interaction craft (from uselayouts.com)

Read this together with `ASTRA-CREATIVE-BRIEF.md`. `CREATIVE-CONSULT.md` gives each draft its **idea**. This addendum gives the **feel**: how each interaction should move. Apply it to every draft you build or fix.

## 1. The reference

https://uselayouts.com is a free library of about 66 animated React components (MIT licence, source at github.com/iurvish/uselayouts). It uses `motion/react` and Tailwind, the same stack as ours.

- **Do not copy its landing page.** It is a generic gradient hero.
- **Copy its craft.** Each component is a small physical object that does one job and moves like a real thing.

Measured across its 74 component files:

| What | Count | What it tells us |
|---|---|---|
| `AnimatePresence` | 26 files | Things enter and exit; they do not just appear. |
| `layoutId` / `layout` | 16 / 7 | Shared-element morphs: the same object moves to its new place. |
| `mode="popLayout"` | 11 | The layout reflows while the old item leaves. |
| `filter: blur(...)` in enter/exit | 15 | Blur is part of the motion, not decoration. |
| `perspective` + `preserve-3d` | 15 / 11 | Real 3D in CSS, with front and back faces. No WebGL. |
| `useReducedMotion` | 16 | Reduced motion collapses durations to about 0.01 s. It does not remove the state change. |
| `useVelocity` / velocity on release | 2 + drag files | Momentum carries from the pointer into the animation. |
| `whileTap` / `whileHover` | 10 / 7 | Every press gives feedback. |

## 2. What makes it feel good: 8 rules

1. **Objects with states, not effects.** Each component is a small state machine: *idle → preview (hover) → active (click) → done*. Examples:
   - Confidential Folder: on hover, the paper peeks out of the folder. On click, it slides out, lifts toward the viewer (`translateZ(36px)`, `scale(1.05)`) and flips (`rotateY(180deg)`) to show the back.
   - Paper Shred: *idle → preview → shredding → shredded*.

   Preview is the anticipation step. It tells the visitor what will happen before it happens.
2. **One small motion vocabulary.** The whole library uses about four curves:
   - `[0.215, 0.61, 0.355, 1]` (ease-out cubic): ordinary UI changes, 8 uses.
   - `[0.16, 1, 0.3, 1]` (expo out): things that arrive, 8 uses.
   - `[0.32, 0.72, 0, 1]` (sheet / drawer): 5 uses.
   - `cubic-bezier(0.34, 1.35, 0.64, 1)` (overshoot): a card that pops out of its holder.
   - Springs: `stiffness 350, damping 35` is the most common. With `bounce`, the values are 0–0.2. A higher bounce is for one playful moment only.
3. **Short for UI, long only for events.** Most durations are 0.15–0.3 s. Long durations (0.65–1.15 s, curve `[0.65, 0, 0.35, 1]`) are only for a story moment, such as the shred.
4. **Momentum.**
   - On drag release, pass the pointer velocity into the spring. The deck card keeps the speed of the throw.
   - Coverflow predicts where the throw lands (`x + velocity × 0.2`) and snaps there.
   - The infinite grid skews with velocity, clamped to ±3°, and decays by 0.95 each frame.
5. **A small tilt makes it physical.** A dragged card rotates in proportion to the drag (`rotate = dragX × 0.06`). A pressed rocker switch tilts −7.5° to −8.8°. A lifted object gets a larger shadow at the same time as the transform.
6. **Blur and opacity travel with position.** Things enter from `opacity 0, y 8, blur(4px)` to sharp, and exit the same way. This hides the cut and reads as focus.
7. **Show how to use it.** The deck shows "Drag – Drag to move it" with a guide line, and the pagination dot of the active page grows wider. An interaction the visitor cannot find does not exist.
8. **One component, one job, one signature.** Nothing does two things.

## 3. Where to use this in our drafts

Each mapping serves the draft's own rule (law 1 in the brief). Do not add an object that the rule does not need.

| Our draft | Pattern to take | How |
|---|---|---|
| **Care-platform case (any draft)** | Confidential Folder | The care platform is under NDA, so a "confidential" folder is **true**, not a costume. Hover: the case file peeks out. Click: it lifts and flips to the facts (31 ADRs, parity tests, 16 → 2 queries). The labelled recreation is inside. |
| `aisle` | Scan Document + Paper Shred (reversed) | The scanner runs the state machine *idle → scanning → in basket*. The receipt prints with a `clipPath: inset()` reveal over about 1.1 s on `[0.65, 0, 0.35, 1]`. That is the story moment. |
| `deal` | Editorial Deck + Polaroid Drag + Coverflow | Throw with velocity hand-off, rotation in proportion to the drag, predicted snap. |
| `facing-pages` | 3D Book | A CSS 3D page and spine as the fallback for the WebGL page curl. |
| `fjalekryq` | Day Picker / Discrete Tabs | The active word's highlight is one `layoutId` element that slides between words. |
| `wall`, `ledger` | Infinite Grid, Fluid Expanding Grid, Magnified Bento | Velocity skew clamped to ±3°; hovered cell grows with `layout` while neighbours reflow (`popLayout`). |
| `swiss`, `issue` | Stacked Outline Text, Perspective Text Scroll | Outline copies of the name trail the pointer: velocity drives a spring shadow offset. Scroll-driven perspective type. |
| `linja`, `bitrate` | Tactile Button, Analog Stick | The Morse key and the quality switch feel like hardware: tilt on press, spring return. |
| Every draft: CV download, theme, sound toggle | Tactile Button, Theme Toggle, Save Button | Real press states: *idle → pressed → done*, with a confirmation state. |
| Every draft: case open and close | `layoutId` shared element | The project tile becomes the case hero. No route that cuts to white. |

## 4. The motion spec for every draft

Put these tokens in each draft's own CSS or TS. The values stay the same; the draft's rule decides which ones it uses.

```ts
export const ease = {
  out: [0.215, 0.61, 0.355, 1],       // UI change
  arrive: [0.16, 1, 0.3, 1],          // something enters
  sheet: [0.32, 0.72, 0, 1],          // drawers, panels
  story: [0.65, 0, 0.35, 1],          // one long event moment
  pop: [0.34, 1.35, 0.64, 1],         // object pops out of a holder
} as const
export const spring = {
  ui: { type: 'spring', stiffness: 350, damping: 35 },
  lift: { type: 'spring', duration: 0.4, bounce: 0.15 },
  play: { type: 'spring', duration: 0.5, bounce: 0.3 },   // one playful moment per draft
} as const
export const dur = { tap: 0.15, ui: 0.22, panel: 0.3, story: 1.1 } as const
```

Checks before a draft is scored:

- Every pointer interaction has a hover or preview state, a pressed state and a done state.
- Every drag hands its release velocity to the animation, and snaps to a predicted target.
- Every interruption is smooth: click again while it moves, and the motion reverses from where it is. Springs do this; fixed tweens often jump.
- Enter and exit use opacity, a short offset and blur together.
- Reduced motion keeps every state change, with durations of about 0.01 s.
- Keyboard has the same states as the pointer: focus is the preview, Enter is the press.
- Scrub each signature transition at 10 % speed (DevTools animations panel). Nothing jumps, and nothing overlaps wrongly.

## 5. Use of their code

The library is MIT. You may take a component through its registry (`npx shadcn add @uselayouts/<name>`) or read its source and rebuild the pattern. In both cases:

- keep the MIT notice in a `THIRD-PARTY.md` at the repo root;
- restyle it fully to the draft's rule and type. A stock component left as-is counts as a slop marker (`CREATIVE-CONSULT.md` §1.2);
- check its gzip size against the draft's budget.
