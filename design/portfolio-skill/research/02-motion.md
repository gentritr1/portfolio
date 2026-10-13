# 02 · Motion and smoothness in personal portfolio sites

Research for the `portfolio-page` skill, motion chapter. Date: 2026-10-07. Stack assumed: Vite + React 19 + `motion` 13 + optional OGL.

Method. 45 web fetches and 45 searches. The agent proxy blocked most primary hosts today (emilkowal.ski, rauno.me, interfaces.rauno.me, joshwcomeau.com, m3.material.io, carbondesignsystem.com, developer.chrome.com, web.dev, developer.mozilla.org, w3.org, awwwards.com, tympanus.net, dev.to, motion.dev, playwright.dev, lusion.co, pacomepertant.com, dennissnellenberg.com, robin-noguier.com, aristidebenoist.com, jesperlandberg.dev, paco.me, locomotive.ca, activetheory.net, godly.website, web.archive.org, r.jina.ai). Where a host was blocked I used the same author's GitHub source (raw.githubusercontent.com was open), Apple's JSON doc endpoint, or search-result summaries. Each claim carries a tag:

- **[M]** measured: read from source code, a spec draft, a token file or the author's own repo.
- **[S]** secondary: a search-result summary or a third-party write-up; numbers should be re-checked when the host is reachable.
- **[K]** from direct knowledge of the site, not verified today.
- **[G]** generated locally in this session (script in the scratchpad, reproduced in §5.3).

This file repeats nothing from `ASTRA-MOTION-CRAFT.md` (uselayouts craft rules, the `ease`/`spring`/`dur` tokens), `CREATIVE-CONSULT.md` §1 (mechanisms M1–M11, slop list) or `PORTFOLIO-RESEARCH.md` §3 (motion and hover display rules). It builds on them. The repo already uses the curves named here: a grep of `src/` finds `cubic-bezier(0.23, 1, 0.32, 1)` 56×, `(0.215, 0.61, 0.355, 1)` 81×, `(0.16, 1, 0.3, 1)` 52×, `(0.32, 0.72, 0, 1)` 39×, and 164 files that read `useReducedMotion` or `prefers-reduced-motion` [M].

---

## 1. Summary: the 15 motion rules that matter

Each is testable; the test is in §8.

1. **Animate a change of state, never a decoration.** Every animation must map to a cause the visitor made (hover, press, scroll position, route) or a fact that changed. (Apple HIG, Emil Kowalski, Vercel guidelines.)
2. **Frequency decides the budget.** Actions done 100+ times a day (keyboard, ⌘K, list navigation): no animation. Tens of times a day (hover, menus): ≤150 ms or none. Occasional (modal, drawer, case open): full treatment, ≤300–500 ms. Once per visit (intro, a story beat): up to 800 ms, one per page. [M] Emil's STANDARDS.md.
3. **UI under 300 ms, feedback under 160 ms.** Button press 100–160 ms, tooltip 125–200 ms, dropdown 150–250 ms, modal/drawer 200–500 ms. A page-level story moment may run 500–800 ms, once. [M]
4. **Ease-out by default; ease-in-out only for on-screen movement; never ease-in on UI.** Named curves: `cubic-bezier(0.23, 1, 0.32, 1)` (Emil's ease-out), `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out, arrivals), `cubic-bezier(0.32, 0.72, 0, 1)` (iOS sheet, Vaul), `cubic-bezier(0.77, 0, 0.175, 1)` (in-out, morphs). [M]
5. **Springs for anything the pointer touches; bounce 0–0.2 for UI, ≤0.3 for one playful moment.** In `motion`: `{ type: 'spring', duration: 0.5, bounce: 0.2 }` or `{ stiffness: 350, damping: 35 }`. Velocity hands over on release. [M]
6. **Only `transform`, `opacity`, `filter`, `clip-path` animate; never `width/height/top/left/margin/padding`; never `transition: all`.** [M] web.dev, Vercel.
7. **Everything is interruptible.** Transitions and springs over keyframes for anything that can be re-triggered; a second click mid-motion reverses from the current position with the current velocity. [M]
8. **Scale enters from 0.9–0.97, never 0; press is `scale(0.97)` over 160 ms; `transform-origin` points at the trigger.** [M]
9. **Stagger 30–80 ms per item, total delay capped (≈ 400 ms), and only when a list appears as a list.** [M]
10. **One intro per visit, under 800 ms, skippable, never a percentage counter.** The first content pixel must be visible by 1 s on a mid phone. (Derived; see §3.)
11. **Smooth scroll (Lenis) is a cost, not a default.** If used: `lerp 0.1`, `respectReducedMotion` on (its default), native anchors, no scroll-snap, pause on hidden. Prefer native scroll + CSS scroll-driven animations with a feature-query fallback. [M] Lenis README.
12. **Reduced motion keeps every state change and removes travel.** Durations collapse to ~0.01 s or opacity-only 150–200 ms; parallax, marquees, autoplay loops and cursor followers stop. Never "no animation at all" that hides a state change. [M] Emil, Apple.
13. **Hover is gated: `@media (hover: hover) and (pointer: fine)`.** Touch gets press states instead. [M]
14. **`will-change` only around a known animation (set ≤200 ms before, removed after); ≤ 8 promoted layers on a page at rest.** [M] web.dev; budget derived.
15. **Measure, don't assume.** On 4× CPU throttle a signature moment keeps p95 frame time ≤ 20 ms at 60 Hz, 0 long animation frames (≥ 50 ms) during the moment, CLS 0 from animation, and no animated non-compositor property. (§7.)

---

## 2. Signature moments menu

Each entry: what the visitor sees → why it works (what it explains) → recipe → cost → reduced-motion → slop risk → examples. Durations in ms; springs in `motion` syntax.

### 2.1 Drive-through world (Bruno Simon)
- **Sees.** A car on a 3D ground; projects are places you drive to. Objects have mass; collisions make sound.
- **Why.** The metaphor is the navigation (M2). Physics gives weight (M8). Sound is the memory hook.
- **Recipe.** Three.js + Rapier physics + Howler audio, WebGL/WebGPU renderers, MIT source on GitHub (`brunosimon/folio-2025`) [S]. Fixed-step physics at 60 Hz; camera follows with a lerp of 0.08–0.12 per frame; audio off until a click.
- **Cost.** Very high: multi-MB assets, a dedicated loader, a sector list as the plain-HTML fallback is mandatory.
- **Reduced motion.** Static top-down map with labelled places, click to open.
- **Slop risk.** Any 3D "room" or "desk" that is only a backdrop fails M2. Clones are everywhere; the car is Bruno's.
- **Examples.** bruno-simon.com (Awwwards Portfolio Honors Dec 2025, Site of the Month Jan 2026) [S].

### 2.2 Zoom into the device, then the OS runs for real (Henry Heffernan)
- **Sees.** A 3D desk and CRT; the camera zooms into the screen, a BIOS boot runs, then a working retro OS whose windows are the portfolio.
- **Why.** The dolly-in is a single continuous move that turns a scene into a UI. The OS is the only way to the work (M2).
- **Recipe.** Camera dolly 1,200–1,600 ms on `cubic-bezier(0.65, 0, 0.35, 1)`, then hand off to a DOM iframe (text stays crisp and selectable). Boot text uses `steps()` at 30–60 ms per line. [K] for the sequence; the site's existence and praise from Brad Frost [S].
- **Cost.** High (three.js scene + iframe app).
- **Reduced motion.** Skip the dolly; open the OS at full size.
- **Slop risk.** The "retro OS" costume is in the slop list unless the OS really is the navigation.
- **Examples.** henryheffernan.com [S][K].

### 2.3 Cursor-reactive fluid or glass (Lusion v3, Active Theory)
- **Sees.** The pointer displaces a fluid or refractive field; balls or shards roll with momentum.
- **Why.** The page answers the hand at frame rate. It is a demonstration of the studio's own craft (M3, M4).
- **Recipe.** Stable-fluids ping-pong at 128–256², velocity injected from pointer delta, decay 0.95–0.98 per frame; render at devicePixelRatio ≤ 1.5; target 120 fps on ProMotion [S]. Pointer input read in `pointermove` and consumed in rAF (never animate in the event).
- **Cost.** High GPU; medium bundle (OGL ≈ 25 kB gzip + 6 kB shaders per CREATIVE-CONSULT §4).
- **Reduced motion.** Freeze the field at a designed frame; keep hover colour change.
- **Slop risk.** A gradient blob that reacts to the cursor but means nothing is 2024 slop. The field must carry a fact (the project's colour, a real material).
- **Examples.** lusion.co v3 (Awwwards Site of the Year 2023; "120 FPS" and "reactive cursor" cited in the Awwwards case study) [S]; activetheory.net [K].

### 2.4 Scroll builds the object (Igloo Inc)
- **Sees.** Scrolling assembles and dissolves a 3D igloo; sections sit on the stages of the build.
- **Why.** Scroll position is the timeline, so reading pace and animation pace are the same thing (M7).
- **Recipe.** Volume data exported from DSCC tooling, custom geometry exporters, shader pre-compilation and staged texture loading to keep first paint fast [S]. Scroll → progress with a per-frame lerp (0.1) and clamped velocity; all heavy uniforms update in one rAF.
- **Cost.** Very high; a studio project (Bureaux) [S].
- **Reduced motion.** The final state per section, cross-faded 200 ms on section change.
- **Slop risk.** "Scrollytelling" with a product that spins is fine for a product; for a developer portfolio it is a costume unless the object is the work.
- **Examples.** igloo.inc (Site of the Year 2024, Developer Award) [S].

### 2.5 Project rows with a floating preview that follows the cursor (Dennis Snellenberg)
- **Sees.** A list of project names; a fixed-size image floats near the cursor and swaps as the pointer crosses rows; the row's text shifts and the background colour changes.
- **Why.** The visitor sees the project without leaving the list (M5). The preview is an answer, not an effect.
- **Recipe.** One absolutely positioned 320×240 container; position with a spring on `x`/`y` (`stiffness 150, damping 15, mass 0.1` for a trailing feel, or `lerp 0.15` per frame); image swap by translating a strip of images `translateY(-index × 100%)` over 400–500 ms on `cubic-bezier(0.76, 0, 0.24, 1)`; container scale 0 → 1 on enter 250 ms expo-out. Row text `translateX(12px)` 300 ms ease-out. [K] (site unreachable today; Awwwards lists it under "hover change color project portfolio" [S]).
- **Cost.** Low (transform/opacity, one layer).
- **Reduced motion.** Show the image inline, static, at the right of the row on hover/focus; no following.
- **Slop risk.** High. This is the most copied effect of 2022–2025 (Framer marketplace sells it as "Marquee Preview" [S]). Use only if the preview carries a crop that proves the row's result (PORTFOLIO-RESEARCH §3 rule 8).
- **Examples.** dennissnellenberg.com [K]; 28 SOTDs with Ilja van Eck [S].

### 2.6 Magnetic button and the "eyes" that follow the pointer
- **Sees.** A circular button leans toward the cursor within ~80 px and springs back on leave; the hero name or a portrait's eyes track the pointer.
- **Why.** It makes a target feel bigger than it is (Fitts) and gives the page a body.
- **Recipe.** On `pointermove` inside a 1.5× hit radius: `x = (pointer.x − centre.x) × 0.35`, `y` likewise; spring back `{ stiffness: 150, damping: 15, mass: 0.1 }`; inner label moves at half the offset. Eyes: angle = atan2 to the pointer, radius capped at 4–6 px, lerp 0.1.
- **Cost.** Low.
- **Reduced motion.** No lean; keep the colour change and focus ring.
- **Slop risk.** High on its own; acceptable on one primary control. Never on text links or more than one element per viewport.
- **Examples.** dennissnellenberg.com [K], cuberto.com [K].

### 2.7 Curved edge that bends with scroll velocity (Snellenberg's footer and page curtain)
- **Sees.** An SVG edge between sections bows as you scroll fast and flattens when you stop; the page transition curtain has a rounded leading edge.
- **Why.** The page reads as a material with inertia (M8) at nearly zero cost.
- **Recipe.** Path `M0 0 L0 h Q w/2 (h + v·k) w h` where `v` is the scroll velocity (px/frame) clamped ±60 and `k` ≈ 1.2; decay `v *= 0.9` per frame; curtain exit 600–750 ms on `cubic-bezier(0.76, 0, 0.24, 1)` with the curve amplitude eased out in the last 30 %.
- **Cost.** Low (one SVG path attribute per frame; keep the SVG `contain: strict`).
- **Reduced motion.** Flat edge; curtain becomes a 200 ms cross-fade.
- **Slop risk.** Medium. The curtain between routes is near-cliché; keep it only if there is no View Transition path.
- **Examples.** dennissnellenberg.com [K].

### 2.8 The tile becomes the case (shared element)
- **Sees.** Click a project; its image grows into the case hero while the rest fades; the title slides to its new place. Back reverses it.
- **Why.** Continuity: the visitor never loses the object they chose (M11).
- **Recipe.** Same-document View Transitions: `view-transition-name` per tile and hero, `::view-transition-group(hero) { animation-duration: 450ms; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1) }`; default is 0.25 s with a plus-lighter cross-fade [M] spec UA sheet. In React 19 + `motion`, `layoutId` on both elements with `{ type: 'spring', stiffness: 350, damping: 35 }` does the same across a route change. Support: Chrome 111+, Safari 18+, Firefox 144 (14 Oct 2025) [S]; cross-document in Chrome 126 and Safari 18.2, not Firefox [S].
- **Cost.** Low to medium; snapshots of large images cost paint time, so keep the hero ≤ viewport and give it `contain: paint`.
- **Reduced motion.** `::view-transition-group(*) { animation: none }`; instant swap.
- **Slop risk.** Low. It is the one transition that explains something.
- **Examples.** robin-noguier.com [K]; Stefan Vitasović 2025 (Next.js pages router chosen for "seamless page transitions") [S].

### 2.9 WebGL images that skew and ripple with scroll velocity (Aristide Benoist, Robin Noguier)
- **Sees.** Thumbnails rendered on a canvas; fast scroll skews or waves them; stop and they settle.
- **Why.** It shows the hand's speed on the image, so scrolling feels like dragging a physical strip.
- **Recipe.** Images as DOM placeholders, textures drawn on a full-screen OGL canvas aligned to the DOM rects (Jesper Landberg's "images referenced from the DOM, rendered via WebGL" pattern [S]); vertex displacement `sin(uv.y × 3 + t) × velocity × 0.02`, skew `clamp(velocity × 0.002, −0.15, 0.15)`, velocity decays 0.92 per frame. Reuse one program; update uniforms once per frame.
- **Cost.** Medium GPU; ≈30 kB with OGL.
- **Reduced motion.** Plain `<img>`, no canvas mounted at all.
- **Slop risk.** Medium-high; "distortion on scroll" is an Awwwards tag with hundreds of entries [S]. Keep the amplitude small (≤ 2 % of height) and tie it to real velocity, not time.
- **Examples.** aristidebenoist.com (Site of the Month June 2021) [S][K]; robin-noguier.com [K].

### 2.10 Infinite draggable canvas of work (Jesper Landberg)
- **Sees.** A grid of images that scrolls and drags in every direction without end; release keeps momentum.
- **Why.** Volume reads as output (offgrid's rule) and the drag gives the visitor control of pace.
- **Recipe.** Positions wrap with modulo on a virtual grid; pointer velocity on release → `x += v × 0.2` predicted snap; friction 0.95 per frame; skew clamped ±3° from velocity (same as the uselayouts infinite grid). Lazy-load tiles by distance from the viewport; only tiles inside 1.5× viewport are drawn.
- **Cost.** Medium (DOM version is fine up to ~80 tiles; WebGL above that).
- **Reduced motion.** A plain paginated grid; drag disabled; arrows and keyboard page through.
- **Slop risk.** Medium. Fine when the work is the content; empty when the tiles are stock.
- **Examples.** jesperlandberg.dev [S][K]; rauno.me/craft (80 tiles, one ratio, no infinite scroll) [K].

### 2.11 Sound gate and the showreel beat (Pacôme Pertant)
- **Sees.** First screen asks "enter with sound / without". A looping showreel text strip runs as a metronome; a toggle switches spiral and list views of the same work.
- **Why.** The choice proves the skill (sound design) before any work is shown, and the loop sets tempo (M7, M8).
- **Recipe.** Gate as a real `<button>` pair; audio context created only on the click; master gain ramps 0 → 1 over 200 ms. Marquee by `translateX` keyframes, linear, speed 40–60 px/s, duplicated track, pauses on `document.hidden` and when offscreen. View toggle via `layoutId` spring `{ stiffness: 300, damping: 30 }`.
- **Cost.** Low.
- **Reduced motion.** Marquee stops (static strip, horizontally scrollable); sound stays opt-in; view toggle swaps instantly.
- **Slop risk.** Marquee of logos is slop; a marquee of the author's own showreel titles that sets tempo is not. The sound gate is only honest if sound is part of the work.
- **Examples.** pacomepertant.com (SOTD 9 Jun 2026, Portfolio Honors May 2026) [S].

### 2.12 Live demo inside the text (emilkowal.ski, rauno.me/craft)
- **Sees.** An article claims a thing; a live component under the sentence lets you try it.
- **Why.** The demo is the proof (M5). Nothing on the page moves until the visitor touches it.
- **Recipe.** Each demo is an isolated component with its own reduced-motion branch, mounted only when in view (`IntersectionObserver`, rootMargin 200px), unmounted when out. Transitions in demos follow the rules of §5.
- **Cost.** Low per demo; budget the count (≤ 6 live demos per page, 28 small cells in LEDGER only with a shared rAF scheduler).
- **Reduced motion.** Demos still work; their internal motion collapses to state swaps.
- **Slop risk.** Low. The risk is a demo that does nothing specific.
- **Examples.** emilkowal.ski (Sonner, Vaul posts) [K], rauno.me/craft [K].

### 2.13 Object state machines: idle → preview → active → done (uselayouts)
- **Sees.** A folder peeks on hover and flips open on click; a switch tilts when pressed and springs back.
- **Why.** Anticipation (preview) before action is Disney's second principle applied to UI.
- **Recipe.** (In `ASTRA-MOTION-CRAFT.md`; not repeated.) Key numbers: hover preview 150–220 ms ease-out; active via `spring { stiffness: 350, damping: 35 }`; lift `translateZ(36px) scale(1.05)` with a larger shadow in the same transition.
- **Cost.** Low.
- **Reduced motion.** All states exist; durations ≈ 0.01 s.
- **Slop risk.** A stock component left unstyled is a slop marker (consult §1.2).
- **Examples.** uselayouts.com [M] (repo measured in the addendum).

### 2.14 Line-mask text reveal on a story beat (Locomotive, Unseen, Vitasović)
- **Sees.** A headline's lines rise out of invisible masks, one after another, once.
- **Why.** It paces reading at the one place where pacing matters: the opening sentence.
- **Recipe.** Split into lines (not characters) with `overflow: hidden` wrappers; each line `translateY(110%) → 0` 700–900 ms on `cubic-bezier(0.16, 1, 0.3, 1)`, stagger 60–80 ms, total ≤ 400 ms of stagger. Split once, after fonts load (`document.fonts.ready`) to avoid reflow; set `aria-label` on the parent and `aria-hidden` on the split spans.
- **Cost.** Low once; medium if re-split on resize (debounce 150 ms).
- **Reduced motion.** Lines fade in together 200 ms, or no animation.
- **Slop risk.** High when applied to every heading; the slop list already names "fade-up on every section". Use on one heading per page, never on body copy, never on hover.
- **Examples.** locomotive.ca [K]; Stefan Vitasović 2025 "typographic animations" [S].

### 2.15 Image reveal by clip-path, not opacity
- **Sees.** A screenshot is uncovered by a moving edge (`inset`) and settles with a slight scale from 1.08 → 1.
- **Why.** Reveal reads as "shown", fade reads as "loaded". The edge direction can point to the source (the row that was hovered).
- **Recipe.** `clip-path: inset(0 100% 0 0)` → `inset(0)` 600–800 ms on `cubic-bezier(0.77, 0, 0.175, 1)`; inner `<img>` `scale(1.08) → 1` on the same timing. Chrome composites `clip-path` animations (shipped after the 2022 "hardware-accelerated animations" update) [S]; Safari/Firefox paint it, so limit to one image at a time.
- **Cost.** Low-medium.
- **Reduced motion.** Image is visible; no clip.
- **Slop risk.** Medium; one per viewport.
- **Examples.** Awwwards "image reveal hover crafted" collection [S]; the AISLE receipt print in CREATIVE-CONSULT §3.6.

### 2.16 ⌘K that does not animate (rauno.me, Paco Coursey's cmdk, designeer.xyz)
- **Sees.** Press ⌘K; a palette is there. Type; results change with no motion. Only the list height eases.
- **Why.** The frequency rule: a palette is used dozens of times, so instant beats pretty. The absence is the craft (M11).
- **Recipe.** cmdk documents the one allowed transition: `[cmdk-list] { height: var(--cmdk-list-height); transition: height 100ms ease }` [M]. Open: 150 ms opacity + `scale(0.98) → 1`; close: 100 ms. Selection: none. Keyboard-initiated actions: never animated [M] Emil.
- **Cost.** None.
- **Reduced motion.** Already there.
- **Slop risk.** None.
- **Examples.** rauno.me [K], paco.me [K], designeer.xyz (consult §1.3).

### 2.17 Theme switch without a transition (Web Interface Guidelines)
- **Sees.** Toggle the theme; the whole page swaps at once; only the toggle itself animates (a 200 ms knob spring).
- **Why.** A cross-fade on 500 elements is 500 repaints and a visible smear; the instant swap feels like a system setting. [M] raunofreiberg/interfaces: "theme switching should bypass transitions on interactive elements".
- **Recipe.** Add `data-theme-switching` on `<html>` for one frame with `* { transition: none !important }`; remove on the next rAF. Optional: a View Transition circle reveal (`clip-path: circle()` on `::view-transition-new(root)`, 400 ms expo-out) from the toggle's position, once; this is the one case where a page-wide transition is cheap because it is a snapshot.
- **Cost.** None / low.
- **Reduced motion.** Instant swap.
- **Slop risk.** Low.

### 2.18 Press, copy, done: the three-state micro-interaction
- **Sees.** Press: `scale(0.97)`. Release: the icon morphs to a check and the label says "Copied" for 1.5 s, then returns.
- **Why.** Feedback within 100 ms, confirmation that persists long enough to read, return that does not need attention.
- **Recipe.** `:active { transform: scale(0.97) }` with `transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1)` [M] Emil; icon swap with `AnimatePresence mode="popLayout"`, enter `{ opacity: 0, y: 4, filter: 'blur(4px)' }` → `{ opacity: 1, y: 0, filter: 'blur(0)' }` 200 ms; `aria-live="polite"` on the label. Return after 1,500 ms.
- **Cost.** None.
- **Reduced motion.** Icon and label swap instantly; the press scale may stay (it is feedback, not travel).
- **Slop risk.** None.

### 2.19 Receipt, boot log, test runner: `steps()` as a beat
- **Sees.** Lines print one at a time at a mechanical rate; a parity row ticks green on a fixed clock.
- **Why.** `steps()` gives time a grain; it reads as a machine doing real work (M7). It is honest only when the thing being timed is real (the AISLE receipt, DIFF parity rows).
- **Recipe.** `animation: print 2.4s steps(24, end)` on `clip-path: inset(0 0 100% 0)` or on `max-height`; per-row tick `transition: background-color 0ms steps(1)` scheduled by `setTimeout` at 60–120 ms intervals; a 2–4 px vertical jitter via `translateY` on each step for paper feed.
- **Cost.** None.
- **Reduced motion.** All lines visible at once.
- **Slop risk.** "Fake terminal / fake boot log" is in the slop list; it passes only when the log reports real data.

### 2.20 Drag with hand-off velocity (cards, coverflow, seam)
- **Sees.** Throw a card; it keeps your speed, slows with friction, snaps to the predicted slot.
- **Why.** Momentum is the most sensed physical cue (Rauno: "do gestures retain momentum?") [S].
- **Recipe.** `motion` `drag` with `dragTransition={{ power: 0.3, timeConstant: 200 }}` or a hand-rolled verlet; predicted target `x + v × 0.2`; snap spring `{ stiffness: 600, damping: 40 }` (ζ ≈ 0.82, settles in ≈ 350 ms [G]); rotate `dragX × 0.06`; pointer capture after 4 px of movement; `touch-action: pan-y` so vertical scroll survives.
- **Cost.** Low.
- **Reduced motion.** Drag still works (it is the visitor's own motion); release snaps without the throw (duration 0.01 s).
- **Slop risk.** Low when the cards are real work.

### 2.21 Pinned, scroll-linked storytelling (for a product, rarely a person)
- **Sees.** A section pins; scrolling plays a sequence (image frames, a diagram building).
- **Why.** It works when a single object needs several beats to explain (a device). A portfolio rarely has one such object; a case page might.
- **Recipe.** CSS first: `animation-timeline: view()` with `animation-range: entry 0% cover 50%` for reveals, `scroll()` on a `position: sticky` parent for the pinned sequence; properties limited to transform/opacity/clip-path so the compositor drives them. Support Chrome 115+, Safari 26 (Sept 2025), Firefox behind a flag (Interop 2026 target) [S]; wrap in `@supports (animation-timeline: view())` and give the end state otherwise. JS fallback with `IntersectionObserver` thresholds, not scroll listeners.
- **Cost.** Low with CSS; medium-high with image sequences (decode 60–120 frames with `img.decode()` ahead of time; `decoding="async"` alone still blocks [S]).
- **Reduced motion.** No pin; frames become a static figure with captions.
- **Slop risk.** High for personal sites. The consult's rule: nothing loops, nothing plays on load but one fade.

### 2.22 Hard cuts as rhythm (BITRATE reel)
- **Sees.** Screenshots cut every 2,000 ms with no cross-fade and a 120 ms colour bleed.
- **Why.** Cuts are cheaper and more confident than fades; the regular beat is the identity (M7).
- **Recipe.** Canvas 2D swap on a `setInterval` aligned to rAF; bleed with `globalCompositeOperation: 'lighter'`; pause when `document.hidden` or offscreen.
- **Cost.** None.
- **Reduced motion.** Hold one frame; arrows step.
- **Slop risk.** Low; it is the opposite of the fade-everything default.

---

## 3. Taxonomy with verdicts

Cost: L/M/H for CPU-GPU and bundle. "Slop in 2026 when" is the cliché trigger. RM = reduced-motion fallback.

| Category | Purpose | Best-practice recipe | Cliché version | Slop in 2026 when | Cost | RM fallback |
|---|---|---|---|---|---|---|
| Page-load intro / preloader | Hide asset load; set tempo once | No preloader unless assets > 1.5 MB. If any: ≤ 800 ms total, real progress (bytes), skippable on any key, first content visible ≤ 1 s, name or mark as a 200 ms fade | 0 → 100 % counter, "Hello / Bonjour / Hola" word cycle, 3 s curtain | Counter that does not measure anything; intro longer than 1 s; plays on every route | L | None; content at once |
| Split-line / word reveals | Pace one opening sentence | §2.14: lines, 700–900 ms expo-out, stagger 60–80 ms, once, after `fonts.ready` | Every heading, char-by-char, on every scroll | Applied to > 1 heading per page, to body text, or to a 100-char line | L | Fade 200 ms or none |
| Image reveals (clip-path / scale) | Say "shown", point to the source | §2.15: `inset()` 600–800 ms in-out, inner scale 1.08 → 1, one at a time | Every thumbnail wipes in on scroll | Repeated per card; used on a 24-tile grid | L–M | Visible |
| Scroll-triggered fades ("fade-up everything") | Should not exist as a system | Only when a section is a list and the list enters as one: `translateY(12px)` + opacity, 300 ms ease-out, stagger ≤ 60 ms, once. Never below 400 px of the fold; never re-trigger | `opacity: 0; transform: translateY(40px)` on every block, re-triggering on scroll up | Any site where > 3 sections use it; any page whose content is hidden if JS fails | L | Visible, no transform |
| Scroll-linked / pinned storytelling | Several beats for one object | §2.21: CSS `animation-timeline`, compositor-only props, `@supports` fallback | GSAP pin of the whole page; 10,000 px of fake scroll | Personal site with no single object to explain | L (CSS) – H (frames) | Static figure |
| Parallax | Depth cue between two layers | Two layers max, offset ≤ 8 % of travel, driven by `animation-timeline: view()` or a transform from scroll position; disabled on touch (`pointer: coarse`) | Multi-layer hero with background moving against text | Any text that moves relative to its background; mobile parallax | L | None |
| Smooth scroll (Lenis) | Keep WebGL in sync with the scroll; a studio feel | Only if WebGL must follow scroll. `lerp 0.1` (default), `duration 1.2` ignored when lerp set; `respectReducedMotion` default true forces lerp to 1 [M]; `anchors: true`; no CSS scroll-snap (use `lenis/snap`) [M]; capped at 60 fps on Safari and 30 fps in Low Power Mode [M] | Lenis + reveal plugin on a text site | Any site without a canvas; any site where keyboard/screen-reader scroll feels delayed | M (≈7 kB + a rAF loop forever) | lerp 1 (Lenis does it) |
| Hover: image-follow-cursor list | See the project from the list | §2.5; preview crop that proves the row | Same effect on every list | Preview is a generic thumbnail | L | Inline static image |
| Hover: magnetic button | Bigger target feel | §2.6, one primary control, radius ≤ 80 px, lean ≤ 35 % | On every link | > 1 per viewport | L | Colour only |
| Custom cursor | Carry a verb ("drag", "play") | A 32–48 px label that appears only over a draggable or a video, spring-follow `{ stiffness: 400, damping: 40 }`, native cursor kept (`cursor: none` never) | Dot + ring following everything | Replaces the native cursor; hides on text; exists on touch | L | Native cursor |
| Page / route transitions | Continuity | §2.8: View Transitions same-document (Chrome 111, Safari 18, Firefox 144) or `layoutId`; 300–450 ms expo-out; cross-document `@view-transition { navigation: auto }` where supported | White curtain + logo for 1 s on every route | Transition longer than 500 ms, or blocking input | L | `animation: none` |
| WebGL distortion / shaders / 3D | Material honesty (M3) | OGL, one program, uniforms once per frame, DPR ≤ 1.5, pause offscreen, static frame under RM; ≤ 150 kB gzip chunk (consult §4) | three.js "liquid" blob, metaballs, particles that mean nothing | Effect is not about the work; > 150 kB; drops below 50 fps on a 2022 mid-range Android | H | Static frame / `<img>` |
| Marquees | Tempo, showreel titles | §2.11: linear 40–60 px/s, pause when hidden or offscreen, `aria-hidden` duplicate, never for logos | Logo wall marquee | Logos; speed > 80 px/s; cannot pause | L | Static, scrollable |
| Text scramble / split-flap | A real display (LINJA), or nothing | Only when the mechanism is the page's rule; `steps()`, ≤ 600 ms, one place | Hover scramble on nav links | On hover anywhere; on headings for flavour | L | Final text |
| Counters | A real number rising | 600–900 ms, `easeOutQuart`, tabular figures, start when in view once, final value in the DOM from the start | "10+ projects" counting from 0 on every scroll | Number is small, vanity, or re-triggers | L | Final value |
| Staggered lists | A list entering as a list | 30–80 ms per item, cap total ≈ 400 ms, `AnimatePresence mode="popLayout"` for removals | 150 ms stagger over 12 items (1.8 s) | Total stagger > 500 ms; applied to sections, not items | L | Together, 150 ms opacity |
| Micro-interactions (button, toggle, copy, theme) | Feedback | §2.17–2.18; press 100–160 ms; toggle knob spring `{ stiffness: 500, damping: 30 }`; theme no transition | Bouncy buttons everywhere | Bounce > 0.3; feedback > 200 ms | L | Keep (feedback), drop travel |
| Sound | Weight; a beat | Off by default; opt-in control persistent; one 20 ms noise burst per event via WebAudio scheduled on `currentTime`; master gain ramp 200 ms; voices ≤ 64 (consult §4) | Autoplay music; click sounds on every link | Autoplay; no mute; sound on routine actions | L | Off (sound is not motion, but `prefers-reduced-motion` users often also want quiet; keep opt-in) |

---

## 4. Why some motion feels premium: the smoothness chapter

### 4.1 Token table

**Durations** (ms). Sources: Emil's STANDARDS [M], Carbon tokens [M], Material 3 tokens [M], `impeccable/animate.md`, the repo's `dur` tokens.

| Token | Value | Use | Reference points |
|---|---|---|---|
| `micro` | 100–160 | press feedback, toggle, focus ring | Emil 100–160; Carbon fast-01 70, fast-02 110; M3 short2–short3 100–150 |
| `small` | 150–250 | tooltip, dropdown, hover reveal, row highlight | Emil 125–250; Carbon moderate-01 150; interfaces "≤ 200 ms to feel immediate" |
| `medium` | 250–400 | modal, drawer, sheet, tile → case, layout shift (FLIP) | Emil 200–500; Vaul 500 on the iOS curve; Carbon moderate-02 240, slow-01 400; M3 medium1–4 250–400; VT default 250 |
| `large` | 400–600 | full-viewport change, route transition, a reveal that spans the width | M3 long1–4 450–600; Carbon slow-02 700 is the ceiling |
| `page` / story | 600–800, max 1,100 | one authored moment per page (print, shred, seam) | impeccable 500–800; the repo's `dur.story` 1,100 is the hard ceiling and only for AISLE/LINJA beats |
| `exit` | 0.6–0.75 × enter | anything leaving | Sonner swipe-out 200 vs enter 400 [M]; Carbon exit curves accelerate |

**Easing curves.** All cubic-bezier. CSS keyword values from the CSS Easing spec draft [M].

| Name | Value | Use | Source |
|---|---|---|---|
| `ease-out` (Emil) | `(0.23, 1, 0.32, 1)` | default for enter/exit | STANDARDS.md [M] |
| `expo-out` / arrive | `(0.16, 1, 0.3, 1)` | things that arrive; confident deceleration | impeccable; uselayouts [M] |
| `cubic-out` | `(0.215, 0.61, 0.355, 1)` | ordinary UI change | uselayouts [M] |
| `sheet` / iOS drawer | `(0.32, 0.72, 0, 1)` | drawers, sheets, anything that mimics iOS | Vaul style.css, 0.5 s [M] |
| `in-out` (Emil) | `(0.77, 0, 0.175, 1)` | on-screen movement, morphs, clip reveals | STANDARDS.md [M] |
| `story` | `(0.65, 0, 0.35, 1)` | one long event | uselayouts [M] |
| `pop` | `(0.34, 1.35, 0.64, 1)` | a card leaving a holder (overshoot) | uselayouts [M] |
| M3 emphasized | `(0.2, 0, 0, 1)` | Material's default for large transitions | material-web tokens [M] |
| M3 emphasized-decelerate | `(0.05, 0.7, 0.1, 1)` | enter | [M] |
| M3 emphasized-accelerate | `(0.3, 0, 0.8, 0.15)` | exit | [M] |
| M3 standard | `(0.2, 0, 0, 1)`; decelerate `(0, 0, 0, 1)`; accelerate `(0.3, 0, 1, 1)` | simple, small | [M] |
| M3 legacy | `(0.4, 0, 0.2, 1)` | the old Material "standard" | [M] |
| Carbon productive standard / entrance / exit | `(0.2, 0, 0.38, 0.9)` / `(0, 0, 0.38, 0.9)` / `(0.2, 0, 1, 0.9)` | tool UI, small distances | carbon motion tokens [M] |
| Carbon expressive standard / entrance / exit | `(0.4, 0.14, 0.3, 1)` / `(0, 0, 0.3, 1)` / `(0.4, 0.14, 1, 1)` | hero moments, large distances | [M] |
| CSS `ease` | `(0.25, 0.1, 0.25, 1)` | hover colour (Emil: "hover/colour → ease") | spec [M] |
| CSS `ease-out` | `(0, 0, 0.58, 1)` | too soft; prefer a custom curve | spec [M] |
| `motion` default for non-transform values | `[0.25, 0.1, 0.35, 1]`, 0.3 s | opacity etc. when no transition given | default-transitions.ts [M] |
| Never on UI | `ease-in` `(0.42, 0, 1, 1)` | — | Emil [M] |

**Springs.** `motion` accepts either physics (`stiffness`, `damping`, `mass`, `velocity`) or duration-based (`duration` in s, `bounce` 0–1, `visualDuration` overrides `duration`) [S]. Defaults when a transform is animated with no transition: `{ type: 'spring', stiffness: 500, damping: 25, restSpeed: 10 }`; `scale` gets a critically damped spring at stiffness 550 [M]. Physics default `{ stiffness: 100, damping: 10, mass: 1 }` (ζ = 0.5, settles ≈ 1.27 s [G]) is too loose for UI; never ship it.

| Token | `motion` value | ζ (damping ratio) | Settle (|error| < 0.1 %) | Use |
|---|---|---|---|---|
| `spring.ui` | `{ stiffness: 350, damping: 35 }` | 0.94 | ≈ 380 ms [G] | selection, layout, toggles |
| `spring.arrive` | `{ stiffness: 500, damping: 25 }` | 0.56 | ≈ 560 ms, 12 % overshoot [G] | the library default for transforms; use for one arriving object, not lists |
| `spring.lift` | `{ duration: 0.4, bounce: 0.15 }` | 0.85 | 400 ms perceptual | hover lift, card pop |
| `spring.play` | `{ duration: 0.5, bounce: 0.3 }` | 0.70 | 500 ms perceptual | one playful moment per page |
| `spring.snap` | `{ stiffness: 600, damping: 40 }` | 0.82 | ≈ 350 ms [G] | drag release, snap to slot |
| `spring.follow` | `{ stiffness: 150, damping: 15, mass: 0.1 }` | 0.61 | fast, trailing | cursor followers, magnetic |
| Emil's Apple-style | `{ duration: 0.5, bounce: 0.2 }` | 0.8 | 500 ms | general [M] |
| Apple presets | `.smooth` (bounce 0), `.snappy` (small bounce), `.bouncy` (higher) | 1 / ≈ 0.85 / ≈ 0.7 | predefined duration (docs do not state it; 0.5 s recalled [K]) | SwiftUI defaults [M] docs text |
| react-spring presets (Josh Comeau's reference) | default `{ tension: 170, friction: 26 }`, gentle `{120, 14}`, wobbly `{180, 12}`, stiff `{210, 20}`, slow `{280, 60}`, molasses `{280, 120}` | — | — | [S] |
| M3 Expressive (via the Flutter port) | spatial: stiffness 1400 (fast) … 300 (slow), damping ratio 0.9 standard / 0.6–0.8 expressive; effects: stiffness 3800 / 1600 / 800, damping 1 | as given | — | [S]; note M3 "damping" is a ratio |

Apple's duration/bounce model (WWDC23 "Animate with springs", transcript [M]; the fetched summary garbled the damping line, corrected here): with mass 1, `stiffness = (2π / duration)²`, `damping = 4π(1 − bounce) / duration` for bounce ≥ 0, `damping = 4π / (duration + 4π·bounce)` for bounce < 0. So ζ = 1 − bounce: bounce 0 is critically damped, 0.15 "small bounce", 0.3 "noticeably bouncy", > 0.4 "caution". The `duration` is a **perceptual** duration (when it looks done), not the settling time; never wait for settling before a UI change [M]. `motion`'s `visualDuration` is the same idea [S].

**Springs in CSS with `linear()`** [G]. Generated this session with a closed-form damped oscillator sampled at 400 points, simplified with Douglas-Peucker (ε = 0.0025), time normalised to the settle time. Use with `transition: transform <settle>ms linear(...)`.

```css
/* spring.ui — stiffness 350, damping 35 — transition-duration: 380ms */
--spring-ui: linear(0, 0.005 1.5%, 0.023 3.3%, 0.091 7%, 0.469 21.5%, 0.635 29%, 0.754 36%, 0.8 39.5%, 0.842 43.3%, 0.884 48%, 0.917 53%, 0.944 58.5%, 0.964 64.5%, 0.979 71%, 0.989 78.8%, 0.999);
/* spring.snap — stiffness 600, damping 40 — transition-duration: 350ms */
--spring-snap: linear(0, 0.005 1.3%, 0.025 2.8%, 0.101 6%, 0.529 18.5%, 0.708 24.8%, 0.776 27.8%, 0.837 31%, 0.886 34.3%, 0.927 37.8%, 0.959 41.5%, 0.982 45.5%, 0.998 50%, 1.008 55.3%, 1.012 65.3%, 1.001);
/* spring.arrive — stiffness 500, damping 25 — transition-duration: 560ms (12% overshoot) */
--spring-arrive: linear(0, 0.008 1%, 0.029 2%, 0.128 4.5%, 0.679 13.5%, 0.893 17.8%, 1.027 21.8%, 1.07 23.8%, 1.101 26%, 1.113 27.5%, 1.119 29%, 1.12 30.8%, 1.116 32.5%, 1.098 35.8%, 1.018 47%, 0.999 51.3%, 0.988 55.8%, 0.986 62.8%, 1.001 83.5%, 1.001);
```

`linear()` syntax and the spec's own bounce example are in the CSS Easing Level 2 draft [M]; Jake Archibald's generator (`linear-easing-generator.netlify.app`) does the same from any JS easing [S]. A CSS `linear()` spring is not interruptible with velocity; it is for hover and enter states only. Anything a pointer can re-trigger mid-flight stays in `motion`.

### 4.2 Duration by distance and size (derived rule)

Perceived speed is distance over time. Keep velocity in a band rather than duration fixed:

- Travel ≤ 24 px (press, nudge, row shift): 100–160 ms.
- Travel 24–120 px (tooltip, dropdown, card lift): 150–250 ms.
- Travel 120–600 px (drawer, tile → case, column reflow): 250–400 ms.
- Full viewport (route, curtain, sheet from bottom): 400–500 ms; Vaul uses 500 ms for a bottom sheet [M].
- Size scales with duration too: a 24 px icon morph at 120 ms; a 600 px hero at 400 ms. Material's `short` (50–200) / `medium` (250–400) / `long` (450–600) / `extra-long` (700–1,000) tiers map to small / medium / large / full-screen [M].

### 4.3 Enter vs exit asymmetry

- Exits are 0.6–0.75× the enter duration (Sonner: enter 400 ms, swipe-out 200 ms [M]).
- Enter decelerates (ease-out/expo-out). An exit that leaves the viewport may accelerate (Carbon exit `(0.2, 0, 1, 0.9)` [M]); an exit in place (a toast fading) uses a short ease-out, not ease-in, because ease-in reads as lag [M] Emil.
- Interaction asymmetry: "slow where the user is deciding, fast where the system responds" (press-and-hold 2 s, release 200 ms) [M] Emil STANDARDS.

### 4.4 Interruptibility, velocity continuity, retargeting

- A spring retargeted mid-flight keeps its current velocity as the initial velocity toward the new target; gestures hand their velocity to the animation [M] WWDC23. `motion` does this for springs by default; CSS transitions retarget position but not velocity (they restart the curve), and CSS keyframes restart from zero. Rule: transitions or springs for anything re-triggerable; keyframes only for one-shot, non-interruptible sequences [M] Emil.
- Test: trigger open, trigger close at 40 % progress, sample the transform every frame; no sample may jump more than the largest step the curve would produce (§7.7).
- Drag dismissal by velocity, not distance: Vaul closes when velocity > ~0.11 px/ms [M] Emil STANDARDS; boundary resistance (friction, not a hard stop); pointer capture after the drag begins; ignore extra touch points [M].

### 4.5 60 Hz, 120 Hz, frame budgets

- 60 Hz = 16.7 ms per frame; 120 Hz = 8.3 ms. Safari on iPhone ProMotion renders web content near 60 fps unless the "Prefer Page Rendering Updates near 60fps" flag is turned off; since iOS 18 `requestAnimationFrame` can run at 120 Hz [S]. Lenis is capped at 60 fps on Safari and 30 fps in Low Power Mode [M].
- Consequence: never step a value by a constant per frame; always multiply by `dt` or use a time-based easing, otherwise a 120 Hz device plays the animation twice as fast.
- A "long animation frame" is ≥ 50 ms of main-thread work before the frame can paint; the LoAF entry exposes `renderStart`, `styleAndLayoutStart`, `blockingDuration`, and the scripts ≥ 5 ms with `invoker`, `sourceURL`, `forcedStyleAndLayoutDuration` (layout thrash) [M] w3c README. Chrome 123+ only [S].
- web.dev's smoothness work measures "percent dropped frames" as an average, a worst 1-second window and a p95 of 1-second windows, not FPS [M].

### 4.6 Compositor-only properties and their caveats

- Compositor-driven in Chrome: `opacity`, `transform` (and the individual `translate`/`scale`/`rotate`), `filter`; `background-color` and `clip-path` were added later (the Chrome "hardware-accelerated animations" update said "soon"; clip-path compositing has shipped with a main-thread fallback when not compositable) [S]. Safari and Firefox: `transform` and `opacity` are safe everywhere; treat `filter: blur()` and `clip-path` as paint-cost on those engines and limit them to one element at a time.
- `filter: blur()` cost scales with radius × area; the interfaces guideline warns that large blur values hurt performance and that scaled/blurred filled rectangles band [M]. Use blur ≤ 4–8 px on enter/exit (uselayouts uses 4 px; Emil's masking uses 2 px [S]) and never on a full-viewport layer.
- `backdrop-filter` re-samples what is behind it every frame; never animate the element behind a live backdrop-filter.
- Animating a CSS custom property on a parent that children use in `transform` triggers style recalculation for all children; set the transform directly on the element [M] Emil.
- `motion`'s `x`/`y`/`scale` shorthands compose on the main thread (`animate={{ x }}` under load drops frames per Emil's standard [M]); for the heaviest moment pass a full `transform` string or use `useMotionValue` + `style` so the compositor path stays open. (This is Emil's claim; measure with §7.4 before trusting either way in `motion` 13.)

### 4.7 `will-change` hygiene

- Add it only when the animation may start within ~200 ms (hover intent, pointer down, route commit), remove it on `transitionend`/`animationend`; leaving it on wastes memory and can slow other operations [M] web.dev.
- `translateZ(0)` is the same hack with worse semantics; the interfaces list allows it "sparingly" and `will-change` toggled during scroll animations "as a last resort" [M].
- Budget: ≤ 8 promoted layers at rest, ≤ 24 during a transition on a 1,440 px page; count with §7.5.

### 4.8 Layout thrash and FLIP

- Batch reads before writes in one frame (`getBoundingClientRect` for all, then `style` for all); a read after a write forces synchronous layout, which the LoAF script entry reports as `forcedStyleAndLayoutDuration` [M].
- FLIP (First, Last, Invert, Play): measure first, apply the end state, measure last, invert with a transform, then transition the transform to identity. The DOM change happens once; the motion is compositor-only. `motion`'s `layout` and `layoutId` are FLIP with springs; `mode="popLayout"` lets the layout reflow while the exiting item leaves (16 uses in uselayouts).
- Keep text out of scaled FLIP boxes (it blurs during the scale); animate the container and counter-scale the content, or use `layout="position"`.

### 4.9 CSS scroll-driven animations

- `animation-timeline: view()` for reveals, `scroll()` for progress bars and pinned sequences; `animation-range: entry 0% cover 40%` to finish early; named timelines with `view-timeline-name` on the subject and `timeline-scope` on an ancestor when the animated element is elsewhere. Compositable properties run off the main thread, so scroll stays smooth even when JS is busy.
- Support Chrome/Edge 115+, Safari 26 (Sept 2025), Firefox behind a flag (Interop 2026) [S]. Ship behind `@supports (animation-timeline: view())`, with the end state as the default so no content is hidden when unsupported or when JS fails.
- Reduced motion: `@media (prefers-reduced-motion: reduce) { * { animation-timeline: none } }` plus the end state.

### 4.10 View Transitions

- Defaults: every `::view-transition-group` animates for 0.25 s with `animation-fill-mode: both`; old and new snapshots cross-fade with `mix-blend-mode: plus-lighter` so a mid-fade does not dip in brightness [M] spec UA stylesheet. Override duration/easing per name; use `view-transition-class` for shared rules [S].
- Give a `view-transition-name` only to elements that move or persist (hero image, title, nav); everything else cross-fades as part of `root`. Snapshots are paint cost: 3–6 named elements, not 30.
- Same-document is Baseline from Firefox 144 (Oct 2025) [S]. Cross-document (`@view-transition { navigation: auto }`) is Chrome 126 / Safari 18.2, not Firefox [S]; same-origin only. Under reduced motion set `::view-transition-group(*) { animation: none }`.
- Interaction: a view transition blocks pointer input to the page while it runs; keep it ≤ 450 ms.

### 4.11 `@starting-style` and `transition-behavior: allow-discrete`

- Entry transitions without JS: declare the pre-open state in `@starting-style`, add `display` and `overlay` to the transition list with `allow-discrete`, and the browser animates from `display: none`; exit holds `display` until the transition ends [S]. Chrome 117, Firefox 129, Safari 17.5; Baseline mid-2025 [S].
- Emil's standard uses it for entries (`@starting-style { opacity: 0; transform: translateY(100%) }`) because transitions, unlike keyframes, are interruptible [M].

### 4.12 `content-visibility`, image decoding, CLS, fonts

- `content-visibility: auto` with `contain-intrinsic-size` skips rendering offscreen sections; the web.dev example dropped initial rendering from 232 ms to 30 ms [M]. Use on long case pages and index lists; give each section an intrinsic size so the scrollbar does not jump; offscreen sections still appear in find-in-page and the accessibility tree [M].
- Images: `decoding="async"` is not enough; call `await img.decode()` before inserting a large image into a running animation (a preview that swaps mid-hover, a frame sequence), otherwise decode blocks the main thread for the frame [S].
- CLS: every image and video has `width`/`height` (or `aspect-ratio`); skeletons mirror the final layout [M] Vercel; the `layout-shift` entry has `value`, `hadRecentInput` (within 500 ms), and up to 5 `sources` [M] WICG. Animation itself must never shift layout: no height/width transitions on content that pushes siblings; use FLIP or `grid-template-rows: 0fr → 1fr`.
- Fonts: a `swap` causes a visible reflow when the web font lands; use `font-display: optional` for the display face when the page's first paint matters, or `swap` with a metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`; Capsize/Fontaine compute them) [S]. Split text only after `document.fonts.ready`.

---

## 5. Rules from the masters

### 5.1 Emil Kowalski (animations.dev; Sonner; Vaul; `emilkowalski/skills` on GitHub [M])
- Frequency: 100+/day → no animation; tens/day → remove or drastically reduce; occasional → standard; rare → delight. Keyboard-initiated actions are never animated.
- Easing: enter/exit ease-out; moving/morphing ease-in-out; hover/colour `ease`; constant motion `linear`; never ease-in. Curves `(0.23, 1, 0.32, 1)`, `(0.77, 0, 0.175, 1)`, drawer `(0.32, 0.72, 0, 1)`.
- Duration: UI < 300 ms; "a 180 ms dropdown feels more responsive than a 400 ms one"; button 100–160, tooltip 125–200, dropdown 150–250, modal/drawer 200–500; drawer 500 ms on the iOS curve (Vaul [M]).
- Scale: enter from 0.9–0.97, never 0; press `scale(0.97)`, 160 ms; `transform-origin` from the trigger for popovers, centre for modals.
- Springs: `{ duration: 0.5, bounce: 0.2 }`; bounce 0.1–0.3; never bounce on non-gesture UI.
- Interruptibility: transitions over keyframes; `@starting-style` for entry.
- Performance: only transform/opacity; no CSS variables on parents driving child transforms; WAAPI/CSS beat rAF under load.
- Accessibility: reduced motion keeps opacity/colour, drops transforms, never "zero animation"; hover gated by `(hover: hover) and (pointer: fine)`.
- Stagger 30–80 ms; tooltip delayed the first time, instant for neighbours.
- Gestures: dismiss on velocity > ~0.11; friction at boundaries; pointer capture.
- Sonner measured: 400 ms transforms/opacity/height, 200 ms swipe-out ease-out, 1.2 s linear spinner, all off under reduced motion; toast lifetime 4,000 ms [M][S].
- "Great animations" (summary [S]): natural, ease-out, < 300 ms, interruptible, cohesive with the rest of the product; "easing is the most important part of any animation".

### 5.2 Rauno Freiberg and the Vercel Web Interface Guidelines (`raunofreiberg/interfaces`, `vercel-labs/web-interface-guidelines` [M])
- Animation ≤ 200 ms for interactions to feel immediate; dialogs fade in from ~0.8 scale, buttons press to ~0.96 (scale proportionally to element size).
- Skip animation for frequent, low-novelty actions (context menus, list edits); theme switching bypasses transitions; looping animations pause when offscreen.
- Honour `prefers-reduced-motion` (MUST); CSS > WAAPI > JS; compositor props only; never layout props; never `transition: all`; animations interruptible and input-driven; autoplay > 5 s needs a pause control; correct `transform-origin`; SVG transforms on a `<g>` with `transform-box: fill-box`.
- Touch: hover states only under `@media (hover: hover)`; `touch-action: manipulation`; hit targets ≥ 24 px (mobile ≥ 44); `overscroll-behavior: contain` in modals; drags need keyboard alternatives; during drag disable selection and set `inert`.
- Performance: profile with CPU and network throttling; test iOS Low Power Mode and macOS Safari; batch layout reads/writes; large blur filters are expensive; `will-change` only during scroll animations as a last resort; pause offscreen video; prefer `<video muted playsinline>` to GIF.
- "Invisible details of interaction design" (2023; summaries [S]): interruptibility and momentum borrowed from physics; Fitts's law and context as input; the prediction cone for nested menus; gestures that retain momentum; "fidgetability"; finger occlusion offsets on touch.

### 5.3 Josh Comeau (springs, whimsy) [S]
- Three knobs: mass, tension (stiffness), friction (damping). Heavier moves slower but carries inertia; tighter springs snap and bounce; friction removes energy. Springs feel natural because they model velocity, so interruptions carry over.
- react-spring presets (his reference set): default 170/26, gentle 120/14, wobbly 180/12, stiff 210/20, slow 280/60, molasses 280/120.
- Whimsy budget on his own site: a sound toggle, a flag, small toys; everything opt-in, nothing on load (PORTFOLIO-RESEARCH §1 row 6).

### 5.4 Paco Coursey [M][K]
- cmdk: only `height` of the list transitions (100 ms ease); selection is instant; everything keyboard-first. His site: text, no motion, a "Now" section; simplicity is the signature (consult M4).

### 5.5 Apple HIG, Motion [M] (JSON endpoint of the HIG page)
- "Add motion purposefully, supporting the experience without overshadowing it. Don't add motion for the sake of adding motion."
- "Make motion optional … avoid using it as the only way to communicate important information." Supplement with haptics and audio.
- "Strive for realistic feedback motion that follows people's gestures and expectations" (a view pulled down is dismissed by pushing up, not sideways).
- "Aim for brevity and precision in feedback animations."
- "Generally avoid adding motion to UI interactions that occur frequently."
- "Let people cancel motion … don't make people wait for an animation to complete before they can do anything."
- Springs (WWDC23 [M]): duration + bounce; ζ = 1 − bounce; perceptual vs settling duration; velocity preserved on gesture hand-off and retargeting; bounce > 0.4 is cautioned.

### 5.6 Material 3 [M] and M3 Expressive [S]
- Duration tokens: short1–4 = 50/100/150/200; medium1–4 = 250/300/350/400; long1–4 = 450/500/550/600; extra-long1–4 = 700/800/900/1,000 ms.
- Easing: emphasized `(0.2, 0, 0, 1)` (default for large transitions), emphasized-decelerate `(0.05, 0.7, 0.1, 1)` enter, emphasized-accelerate `(0.3, 0, 0.8, 0.15)` exit; standard set for small, simple changes.
- M3 Expressive (2025) moves to springs: spatial (position, size) vs effects (opacity, colour) tokens at fast/default/slow; effects springs are critically damped (ratio 1) so colour never overshoots.

### 5.7 IBM Carbon [M]
- Productive motion (tool UI, small, fast, "gets out of the way") vs expressive (hero moments, more exaggerated). Durations fast-01 70, fast-02 110, moderate-01 150 (default), moderate-02 240, slow-01 400, slow-02 700 ms. Curves in §4.1. Rule of thumb from the token descriptions: 70 ms for button/toggle, 110 for small fades, 240 for toasts and expansion, 400 for large expansion, 700 only for background dimming and hero transitions.

### 5.8 Disney's principles, applied [S]
- Squash and stretch = the press state (keep volume: squash wider when shorter). Anticipation = hover preview before the click. Staging = one focal moment per screen. Follow-through and overlapping action = overshoot and settle, children trailing the parent (the magnetic label at half offset). Slow-in/slow-out = ease-out. Secondary action = the shadow that grows with the lift. Timing = frequency rule. Appeal = restraint.

---

## 6. What the awards tell us (2023–2026)

- Awwwards annual results: Site of the Year 2023 Lusion v3; 2024 Igloo Inc (Bureaux; Developer Award); 2025 Lando Norris (users' choice too), Developer Site of the Year Messenger, Independent of the Year Louis Paquet, Agency Immersive Garden, Studio Malvah [S].
- Portfolio Honors 2025–26 (all also SOTD): Form&Fun (Aug 2025), Olha Lazarieva (Sep), Elliott Mangham (Nov; SOTD 2 Dec), Artiom Yakushev (Dec; SOTD 27 Dec; Muzli pick), Bruno Simon (Dec; Site of the Month Jan 2026), Gavin Schneider (Feb 2026), MERSI (Mar), Adcker (Apr), Pacôme Pertant (May; SOTD 9 Jun) [S].
- Codrops portfolio case studies: Ronin161 2024, Rogier de Boevé 2024, Oscar Pico 2024, Stefan Vitasović 2025 (minimal design, typographic animation, WebGL video grid, Next.js pages router kept for seamless page transitions) [S].
- What recurs in the winners: one material idea carried through (fluid, igloo, the car, sound), a transition that preserves the object (shared element), restraint everywhere else (two colours, text lists), and a hard performance claim (Lusion's 120 fps; Igloo's loading strategy). What does not recur: fade-up sections, preloader counters, cursor blobs. The juror article in `PORTFOLIO-RESEARCH.md` §1 says the same: art direction that stands still, motion that paces states, ~60 fps on a mid-range phone, reduced motion respected.
- Not verified today: Max Milkin (no reliable result), Rogier de Boevé / Louis Paquet / Ronin161 details (hosts blocked and search budget exhausted).

---

## 7. Measuring smoothness in a headless browser

All snippets are Playwright (Node) + Chromium. Chromium-only APIs are marked. Put the collector scripts in `addInitScript` so they observe from the first frame.

### 7.1 Harness: throttle, reduced motion, viewport

```js
import { chromium } from 'playwright';

export async function openPage(url, { cpu = 4, reducedMotion = 'no-preference', mobile = false } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion });            // 'reduce' | 'no-preference'  [M] Playwright docs
  const cdp = await context.newCDPSession(page);          // [M] Playwright CDPSession
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); // 1 = none, 4 = 4x, 6 = 6x  [S] CDP
  await page.addInitScript(collectors);                   // §7.2–7.3
  await page.goto(url, { waitUntil: 'networkidle' });
  return { browser, page, cdp };
}
```

### 7.2 Collectors injected before load: LoAF, layout-shift, rAF frame times

```js
const collectors = () => {
  const w = window;
  w.__perf = { loaf: [], shifts: [], frames: [] };
  // Long animation frames (Chromium 123+): any frame >= 50 ms of main-thread work. [M] w3c README
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        w.__perf.loaf.push({
          start: e.startTime, duration: e.duration, blocking: e.blockingDuration,
          renderStart: e.renderStart, styleAndLayoutStart: e.styleAndLayoutStart,
          scripts: e.scripts.map(s => ({
            invoker: s.invoker, type: s.invokerType, src: s.sourceURL, fn: s.sourceFunctionName,
            duration: s.duration, forcedLayout: s.forcedStyleAndLayoutDuration,
          })),
        });
      }
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch {}
  // Layout shifts not caused by input. [M] WICG layout-instability
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) w.__perf.shifts.push({
        t: e.startTime, value: e.value,
        nodes: (e.sources || []).map(s => s.node && (s.node.id || s.node.className || s.node.tagName)),
      });
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  // Frame-time sampler. Start/stop from the test. [folklore-grade: rAF timing has variance, use p95]
  let raf = 0, last = 0;
  w.__startFrames = () => { w.__perf.frames = []; last = performance.now();
    const tick = t => { w.__perf.frames.push(t - last); last = t; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); };
  w.__stopFrames = () => { cancelAnimationFrame(raf); return w.__perf.frames; };
};
```

### 7.3 Scoring a moment (hover, open, scroll)

```js
export function frameStats(deltas, hz = 60) {
  const budget = 1000 / hz, sorted = [...deltas].sort((a, b) => a - b);
  const p = q => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  const dropped = deltas.filter(d => d > budget * 1.5).length;       // a frame that took >= 2 vsyncs
  const windows = []; for (let i = 0, t = 0, n = 0, drop = 0; i < deltas.length; i++) {
    t += deltas[i]; n++; if (deltas[i] > budget * 1.5) drop++;
    if (t >= 1000) { windows.push(drop / n); t = 0; n = 0; drop = 0; } }
  return { frames: deltas.length, p50: p(0.5), p95: p(0.95), max: sorted.at(-1),
           droppedPct: 100 * dropped / deltas.length,
           worstWindowPct: 100 * Math.max(0, ...windows) };                 // web.dev "percent dropped" idea [M]
}

export async function measureMoment(page, act, ms = 1200) {
  await page.evaluate(() => window.__startFrames());
  await act(page);                                   // e.g. page.hover('[data-row="2"]') or page.click(...)
  await page.waitForTimeout(ms);
  const deltas = await page.evaluate(() => window.__stopFrames());
  const perf = await page.evaluate(() => window.__perf);
  const hz = Math.round(1000 / (deltas.slice(0, 30).sort((a, b) => a - b)[15] || 16.7)) >= 100 ? 120 : 60;
  return { ...frameStats(deltas, hz), hz, loaf: perf.loaf, shifts: perf.shifts };
}
// Pass: p95 <= 20 ms at 60 Hz (<= 10 ms at 120 Hz), droppedPct <= 5, loaf.length === 0 during the moment,
// sum(shifts.value) === 0 attributable to the animated nodes.
```

Scrolling: drive it with `page.mouse.wheel(0, 120)` in 20 steps 50 ms apart inside `measureMoment` so Lenis or scroll-driven animations are exercised; keyboard with `page.keyboard.press('PageDown')`.

### 7.4 Which properties animate (compositor audit)

```js
export async function animatedProperties(page) {
  return page.evaluate(() => {
    const compositor = new Set(['transform', 'translate', 'scale', 'rotate', 'opacity', 'filter', 'clip-path',
                                'clipPath', 'offset-distance', 'background-color', 'backgroundColor']);
    const out = [];
    for (const a of document.getAnimations({ subtree: true })) {
      const kf = a.effect?.getKeyframes?.() ?? [];
      const props = new Set(kf.flatMap(k => Object.keys(k).filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p))));
      const el = a.effect?.target; const timing = a.effect?.getComputedTiming?.() ?? {};
      out.push({
        id: a.id || (el && (el.id || el.className || el.tagName)), kind: a.constructor.name,   // CSSTransition | CSSAnimation | Animation
        props: [...props], nonCompositor: [...props].filter(p => !compositor.has(p)),
        duration: timing.duration, iterations: timing.iterations, playState: a.playState,
        transitionAll: a.transitionProperty === 'all',
      });
    }
    // transition: all anywhere in computed styles (cheap scan, up to 3k nodes)
    const all = [...document.querySelectorAll('body *')].slice(0, 3000)
      .filter(el => getComputedStyle(el).transitionProperty === 'all').length;
    // will-change at rest
    const wc = [...document.querySelectorAll('body *')].slice(0, 3000)
      .filter(el => getComputedStyle(el).willChange !== 'auto').length;
    return { animations: out, transitionAllCount: all, willChangeCount: wc };
  });
}
// Pass: every animation's nonCompositor is empty (height/width/top/left/margin/padding are failures);
// transitionAllCount === 0; willChangeCount <= 8 at rest; no CSSAnimation with iterations === Infinity that is offscreen.
```

Note: `document.getAnimations()` sees CSS transitions, CSS animations and WAAPI animations, which covers `motion` only when it uses WAAPI (it does for simple tweens; springs and layout run on rAF). For `motion` springs, read the style on each frame in §7.7 instead.

### 7.5 Layers and paint (Chromium)

```js
// Count composited layers via the LayerTree domain. [S] CDP; folklore-grade across versions
export async function layerCount(cdp) {
  await cdp.send('LayerTree.enable');
  const layers = await new Promise(res => cdp.once('LayerTree.layerTreeDidChange', e => res(e.layers || [])));
  await cdp.send('LayerTree.disable');
  return layers.length;
}
```

If the event does not fire within 1 s, fall back to the `willChangeCount` from §7.4.

### 7.6 Capturing mid-animation frames

Two ways. Cross-browser, pause everything at a time:

```js
export async function captureAt(page, msOffsets, file) {
  await page.evaluate(() => { for (const a of document.getAnimations({ subtree: true })) a.pause(); });
  for (const t of msOffsets) {
    await page.evaluate(t => { for (const a of document.getAnimations({ subtree: true })) a.currentTime = t; }, t);
    await page.screenshot({ path: `${file}-${t}ms.png`, animations: 'allow' });   // 'disabled' would fast-forward [M]
  }
}
```

Chromium-only, slow the clock and sample (works for rAF-driven springs too):

```js
await cdp.send('Animation.enable');
await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.1 });   // the DevTools "10 %" button  [M] Playwright CDP example
await page.click('[data-tile="1"]');
for (let i = 0; i < 8; i++) { await page.waitForTimeout(250); await page.screenshot({ path: `open-${i}.png`, animations: 'allow' }); }
await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
```

Review the frames for: a jump between consecutive frames, text blurring during scale, an element that pops in at the end, a layout change (siblings moving).

### 7.7 Interruptibility test

```js
export async function interruptTest(page, selector, openAct, closeAct, durationMs) {
  await openAct(page);
  await page.waitForTimeout(durationMs * 0.4);
  const samples = await page.evaluate(async ([sel, ms]) => {
    const el = document.querySelector(sel); const out = [];
    const read = () => { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); out.push({ t: performance.now(), x: m.m41, y: m.m42, s: m.a, o: +getComputedStyle(el).opacity }); };
    read(); window.__closeNow = true;
    await new Promise(r => { const end = performance.now() + ms; (function tick() { read(); performance.now() < end ? requestAnimationFrame(tick) : r(); })(); });
    return out;
  }, [selector, durationMs]);
  await closeAct(page);   // closeAct should fire immediately after the first sample; schedule it with page.evaluate in parallel if needed
  let worst = 0; for (let i = 1; i < samples.length; i++) worst = Math.max(worst, Math.abs(samples[i].y - samples[i - 1].y), Math.abs(samples[i].s - samples[i - 1].s) * 100);
  return { samples, worstStep: worst };
}
// Pass: worstStep <= 2x the largest step an uninterrupted run produces (no snap to start or end); opacity never jumps by > 0.3 in one frame.
```

### 7.8 Reduced-motion parity

```js
export async function reducedMotionParity(url) {
  const a = await openPage(url, { reducedMotion: 'reduce' });
  const anims = await animatedProperties(a.page);
  const travel = anims.animations.filter(x => x.props.some(p => /transform|translate|scale|rotate|clip/.test(p)) && (x.duration ?? 0) > 50);
  const loops = anims.animations.filter(x => x.iterations === Infinity);
  const lenis = await a.page.evaluate(() => !!(window.lenis || document.documentElement.classList.contains('lenis')) && !(window.lenis?.prefersReducedMotion));
  const endState = await a.page.screenshot({ fullPage: true, animations: 'disabled' });
  await a.browser.close();
  return { travelAnimations: travel.length, infiniteLoops: loops.length, lenisStillSmoothing: lenis, endState };
}
// Pass: travelAnimations === 0, infiniteLoops === 0, lenisStillSmoothing === false, and endState is pixel-equal
// (threshold 0.1 %) to the no-preference run's end state: reduced motion removes travel, not content.
```

### 7.9 Intro budget

```js
const t0 = Date.now();
await page.goto(url);                                           // with cpu: 4 and a 'Slow 4G' network via cdp 'Network.emulateNetworkConditions'
await page.waitForSelector('main h1, main [data-first-content]', { state: 'visible' });
const firstContent = Date.now() - t0;
const introDone = await page.evaluate(() => new Promise(r => { const t = performance.now();
  (function w() { document.getAnimations().some(a => a.playState === 'running' && a.effect?.target?.closest?.('[data-intro]')) && performance.now() - t < 5000 ? requestAnimationFrame(w) : r(performance.now() - t); })(); }));
// Pass: firstContent <= 1000 ms (mid phone, 4x CPU, Slow 4G); introDone <= 800 ms; pressing any key or scrolling ends the intro (assert by firing page.keyboard.press('Escape') at 200 ms and re-checking).
```

### 7.10 Trace-based frames (optional, Chromium)

For a second opinion, record a trace and use the DevTools frames model: `cowchimp/headless-devtools` computes `fps = 1000 / mean(frame.duration)` from `performanceModel.frames()` [M]. Start with `cdp.send('Tracing.start', { categories: 'disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,devtools.timeline' })`, act, `Tracing.end`, then feed the trace to the model. The event names change between Chrome versions, so treat this as a cross-check, not the gate.

---

## 8. Rules for the skill (numbered, with pass/fail tests)

1. **Every animation names its cause.** Test: for each animated element, a `data-motion` attribute names one of `feedback | state | continuity | reveal | story`; an element without one fails.
2. **Frequency budget.** Test: keyboard shortcuts, ⌘K results, list selection and tab switches produce 0 entries in `document.getAnimations()` with `duration > 50 ms` after the key event.
3. **UI ≤ 300 ms; feedback ≤ 160 ms; story ≤ 800 ms, one per page.** Test: §7.4 durations; at most one animation with `duration > 500 ms` per route, and it carries `data-motion="story"`.
4. **Named curves only.** Test: every `transition-timing-function`/`animation-timing-function` in computed styles is one of the §4.1 curves, `linear`, `ease` (hover colour only) or a `linear()` spring; `ease-in`, `ease-in-out` keyword and `cubic-bezier(0, 0, 0.58, 1)` fail.
5. **Springs for pointer-driven motion; bounce ≤ 0.2 (≤ 0.3 once).** Test: grep for `type: 'spring'` config; any `bounce > 0.3` or `damping < 20` with `stiffness > 200` fails unless tagged `data-motion="story"`.
6. **Compositor properties only; no `transition: all`.** Test: §7.4 `nonCompositor` empty for all animations; `transitionAllCount === 0`.
7. **Interruptible.** Test: §7.7 on the three signature interactions; `worstStep` within tolerance; no `CSSAnimation` on an element that can be re-triggered within its duration.
8. **Scale never from 0; press is 0.95–0.98.** Test: keyframes with `scale(0)` or `scale: 0` fail; `:active` computed transform on buttons within `scale(0.95–0.98)`.
9. **Stagger 30–80 ms, total ≤ 400 ms.** Test: for siblings animating together, `animation-delay`/`transition-delay` deltas within 30–80 ms and the last delay ≤ 400 ms.
10. **Intro ≤ 800 ms, skippable, no counter; first content ≤ 1 s on 4× CPU + Slow 4G.** Test: §7.9; DOM text matching `/^\d{1,3}%$/` that changes over time during load fails.
11. **No fade-up system.** Test: count elements whose initial computed `opacity` is 0 and whose rect is below the first viewport; more than 6 per route fails; any of them still at `opacity 0` with JS disabled fails (content must exist without JS).
12. **Smooth scroll is opt-in and honest.** Test: if `window.lenis` exists: a `<canvas>` is on the page (otherwise fail), `lenis.options.lerp ≤ 0.12`, `prefersReducedMotion` honoured (§7.8), `Tab` focus moves bring the target into view within 1 frame, and PageDown scroll p95 frame time ≤ 20 ms at 4× CPU.
13. **Reduced motion keeps state, drops travel.** Test: §7.8 passes; every state change visible in the no-preference run is visible in the reduce run.
14. **Hover gated.** Test: with `hasTouch: true` and `pointer: coarse` emulation, hovering a tile yields no transform change; press yields a feedback state.
15. **`will-change` hygiene; layer budget.** Test: `willChangeCount ≤ 8` at rest; after a transition ends, the animated element's `will-change` returns to `auto` within 1 s; §7.5 layers ≤ 24 during the moment.
16. **No layout shift from motion.** Test: §7.2 shifts attributable to animated nodes sum to 0 during each moment; every `<img>`/`<video>` has intrinsic size.
17. **Loops pause when hidden.** Test: after `document.hidden` is simulated (emulate `visibilitychange`) or the element is scrolled 2 viewports away, `getAnimations()` shows the loop `paused`, and canvas loops stop calling rAF (count rAF callbacks via a wrapped `requestAnimationFrame`).
18. **WebGL budget.** Test: lazy chunk ≤ 150 kB gzip; DPR cap ≤ 1.5 (read `canvas.width / clientWidth`); 4× CPU p95 ≤ 20 ms during the signature interaction; under reduced motion no WebGL context is created (`HTMLCanvasElement.prototype.getContext` wrapped to count).
19. **Transitions preserve the object.** Test: opening a case from a tile produces either a View Transition (`document.startViewTransition` called, or `::view-transition` pseudo present) or a `layoutId` morph; a full-screen curtain that blanks the page for > 300 ms fails.
20. **Fonts before splits.** Test: text-split DOM (spans per line/word) is created only after `document.fonts.ready`; no `layout-shift` entry from the heading after the split; the heading has an accessible name equal to its visible text.
21. **Sound opt-in.** Test: no `AudioContext` is created before a user gesture (wrap the constructor); a persistent toggle exists and defaults to off.
22. **Marquee and parallax limits.** Test: marquee `translateX` speed ≤ 60 px/s and stoppable; parallax offset ≤ 8 % of travel; neither exists on `pointer: coarse` or under reduced motion.
23. **Theme switch instant.** Test: toggling theme creates 0 transitions on text or background colours (the toggle control itself may animate ≤ 200 ms).
24. **Measured at 60 and 120 Hz.** Test: run §7.3 with the display emulated at both rates (`--force-device-scale-factor` is not enough; run on a 120 Hz machine or assert velocity is `dt`-scaled by comparing travel per 100 ms at playback rate 1 and 0.5 via CDP).
25. **Scrub at 10 %.** Test: §7.6 frames at 10 % playback show no pop, no text blur during scale, no sibling movement; reviewer signs off the 8-frame strip for each signature moment.

---

## 9. Sources (accessed 2026-10-07)

Measured [M]: fetched and read in full or as source code.

- https://raw.githubusercontent.com/emilkowalski/skills/main/skills/review-animations/STANDARDS.md (Emil Kowalski's animation review standards; frequency table, curves, durations, springs, gestures)
- https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md (Emil's "animate" skill; tool order, blocked patterns)
- https://raw.githubusercontent.com/emilkowalski/sonner/main/src/styles.css (Sonner transitions: 400 ms, 200 ms swipe-out, reduced-motion off)
- https://raw.githubusercontent.com/emilkowalski/vaul/main/src/style.css (Vaul: 0.5 s, cubic-bezier(0.32, 0.72, 0, 1), will-change transform)
- https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/AGENTS.md (Vercel Web Interface Guidelines, animation/touch/performance sections)
- https://raw.githubusercontent.com/raunofreiberg/interfaces/main/README.md (Rauno Freiberg's interface details list)
- https://raw.githubusercontent.com/pacocoursey/cmdk/main/README.md (cmdk list-height transition 100 ms)
- https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json (Apple HIG Motion text)
- https://developer.apple.com/videos/play/wwdc2023/10158/ (WWDC23 "Animate with springs" transcript; duration/bounce model, velocity preservation)
- https://developer.apple.com/tutorials/data/documentation/swiftui/animation/{smooth,snappy,bouncy}.json (preset descriptions; numeric defaults not documented)
- https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss (Material 3 duration and easing tokens)
- https://raw.githubusercontent.com/carbon-design-system/carbon/main/packages/motion/src/tokens.ts and .../src/dtcg/motion.json (Carbon curves and durations)
- https://raw.githubusercontent.com/motiondivision/motion/main/packages/motion-dom/src/animation/utils/default-transitions.ts (motion default transitions per value type)
- https://raw.githubusercontent.com/w3c/csswg-drafts/main/css-easing-2/Overview.bs (linear() syntax, keyword curve values, bounce example)
- https://raw.githubusercontent.com/w3c/csswg-drafts/main/css-view-transitions-1/Overview.bs (UA stylesheet: 0.25 s, fill both, plus-lighter)
- https://raw.githubusercontent.com/w3c/long-animation-frames/main/README.md (LoAF ≥ 50 ms, entry and script fields)
- https://raw.githubusercontent.com/WICG/layout-instability/main/README.md (layout-shift entry, hadRecentInput 500 ms, sources ≤ 5)
- https://raw.githubusercontent.com/darkroomengineering/lenis/main/README.md (Lenis defaults, reduced-motion, Safari caps, limitations)
- https://raw.githubusercontent.com/GoogleChrome/web.dev/main/src/site/content/en/blog/animations-and-performance/index.md (compositor props, will-change 200 ms rule)
- https://raw.githubusercontent.com/GoogleChrome/web.dev/main/src/site/content/en/blog/smoothness/index.md (percent-dropped-frames metrics)
- https://raw.githubusercontent.com/GoogleChrome/web.dev/main/src/site/content/en/blog/content-visibility/index.md (232 → 30 ms example, caveats)
- https://raw.githubusercontent.com/microsoft/playwright/main/docs/src/api/class-cdpsession.md and .../class-page.md and .../params.md (CDP session, emulateMedia reducedMotion, screenshot animations option)
- https://raw.githubusercontent.com/cowchimp/headless-devtools/master/README.md (trace-based fps)
- Local: `/home/user/portfolio/design/art-directions/ASTRA-MOTION-CRAFT.md` (uselayouts measurements), `CREATIVE-CONSULT.md`, `loop/PORTFOLIO-RESEARCH.md`, `.agents/skills/impeccable/reference/animate.md`; grep of `src/` for curves and reduced-motion usage.
- Generated [G]: `scratchpad/spring-linear.mjs` (this session) for the linear() strings and settle times.

Secondary [S]: search-result summaries; re-verify numbers when the host is reachable.

- https://emilkowal.ski/ui/great-animations and https://emilkowal.ski/ui/you-dont-need-animations (blocked; summarised via search and https://raw.githubusercontent.com/leadgenjay/claude-skills/main/skills/design-motion-principles/references/emil-kowalski.md)
- https://rauno.me/craft/interaction-design (blocked; summaries via search: every.to republication, uiuxshowcase.com, sebastiangreger.net)
- https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/ (blocked; mass/tension/friction quotes via search) and https://react-spring.dev/common/configs (presets)
- https://motion.dev/docs/react-transitions (blocked; duration 800 ms default, bounce 0.25 default, visualDuration via search)
- https://developer.chrome.com/blog/hardware-accelerated-animations (blocked; opacity/filter/transform accelerated, background-color and clip-path added, via search)
- https://developer.chrome.com/blog/view-transitions-in-2025 and caniuse (Firefox 144 same-document; cross-document Chrome 126 / Safari 18.2)
- https://developer.chrome.com/docs/css-ui/scroll-driven-animations and https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026 (Chrome 115, Safari 26, Firefox flag)
- https://web.dev/blog/baseline-entry-animations and MDN @starting-style (Chrome 117, Firefox 129, Safari 17.5)
- https://bugs.webkit.org/show_bug.cgi?id=294338 and https://www.tomsguide.com/phones/iphones/enable-120hz-safari-on-iphone (Safari 120 Hz flag; iOS 18 rAF 120)
- https://calendar.perfplanet.com/2025/non-blocking-image-canvas/ (decode() vs decoding="async")
- https://debugbear.com/blog/web-font-layout-shift and https://developer.chrome.com/blog/framework-tools-font-fallback (size-adjust, font-display optional)
- https://developer.chrome.com/docs/devtools/rendering/performance (Frame rendering stats) and https://blog.jim-nielsen.com/2023/slow-motion-animations-with-chrome-devtools/ (10 % / 25 % playback)
- https://pub.dev/packages/material_expressive (M3 Expressive spring numbers via the Flutter port)
- https://www.interaction-design.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design and https://blog.marvelapp.com/disneys-motion-principles-in-designing-interface-animations/ (Disney principles for UI)
- Awards: https://www.awwwards.com/websites/winner_category_portfolio/ (Portfolio Honors 2025–26 list via search), https://www.awwwards.com/annual-awards/winners and https://www.awwwards.com/websites/sites_of_the_year/ (2023–2025 winners), https://awwwards.com/igloo-inc-case-study.html (Bureaux, fluid sim, exporters), https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html (120 fps, reactive cursor), https://muz.li/picked/artiom-yakushev-creative-digital-designer/
- Portfolios and write-ups: https://github.com/brunosimon/folio-2025 (Three.js, Rapier, Howler, WebGPU; README path not found today), https://www.landing.love/sites/pacomepertant/ (sound gate, showreel loop, spiral/list), https://tympanus.net/codrops/?p=88357 (Stefan Vitasović 2025) and the Codrops case-study tag (Ronin161, Rogier de Boevé, Oscar Pico 2024), https://www.awwwards.com/inspiration/hover-change-color-project-portfolio (Snellenberg), https://gsap.com/community/forums/topic/43200-infinite-image-grid-with-lazy-load/ (Jesper Landberg's WebGL canvas pattern), https://awwwards.com/aristide-benoist-portfolio-2021-wins-site-of-the-month-june-2021.html, https://bradfrost.com/blog/tag/portfolio (Henry Heffernan praise), https://webdesignerdepot.com/nobody-waits-for-your-fancy-animations-anymore-and-they-never-really-did/ and https://feedbagel.com/post/critique-of-scroll-fade-animations-in-web-design (cliché critiques)

Folklore / direct knowledge [K], not verified today: the specific recipes attributed to dennissnellenberg.com, henryheffernan.com, robin-noguier.com, aristidebenoist.com, jesperlandberg.dev, locomotive.ca, activetheory.net, cuberto.com, rauno.me/craft and paco.me; the recalled 0.5 s duration of Apple's spring presets; the claim that `motion`'s `x`/`y` shorthands drop frames under load (Emil's standard; measure with §7.4 before relying on it).
