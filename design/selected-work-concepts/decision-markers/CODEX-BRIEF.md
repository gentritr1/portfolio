# Codex brief: decisions on the screen (case-page markers)

Paste everything below the line into Codex in one message. Codex reads the repo; no attachments are needed.

---

**Context.** On `/drafts/refractive-engine`, each case page (`src/drafts/refractive-engine/CasePage.tsx`) shows the product's real screenshots as one guided stage: a large glass slab with the screens listed by name beside it. Run `npm run dev` and open `/drafts/refractive-engine/bayyinah-tv`.

Today a 2× magnifier follows the pointer over the stage. The owner finds it too basic and has chosen to replace it with **decision markers**: small mint points sitting on the exact places in a real screenshot where an engineering decision lives. Each marker carries an existing line from the case. Hover, focus or tap shows the line.

Example: on Bayyinah TV's course row, a marker on the LIVE course, showing "Live streams on AWS IVS with realtime chat and moderation, and an HLS player with a paywall for premium content."

The goal is to tie the pictures to the engineering, which is what hiring managers look for ([NN/g on UX portfolios](https://www.nngroup.com/articles/ux-design-portfolios/)).

**Fixed rules:**
- Only existing strings, from `src/drafts/exploded-view/cases.ts` (`decision`, `constraints`, `didntWork`, `diagram[].note`), `src/drafts/refractive-engine/data.ts` (`systems[].layers`) and `CONTENT.md`. No new claims, numbers, dates, versions or paraphrase. A shortened line must be an exact substring.
- A marker sits only where the screenshot visibly shows the thing its line is about. If a screen has no such place, it gets no marker.
- At most 3 markers per screenshot.
- Archivo; #050508, #EDEDF0, mint #3EE6A4. Screenshot pixels unchanged.

**Part 1: data (required). Write `design/selected-work-concepts/decision-markers/markers.json`:**

```
{ "<gallery image src>": [ { "x": px, "y": px, "source": "cases.ts › bayyinah-tv › decision[1]", "text": "<exact string or exact substring>", "why": "what in the pixels shows it" } ] }
```

- Coordinates are in the image's own pixels (origin top-left).
- Cover every gallery image of `bayyinah-tv`, `read-to-feed` and `care-platform`, as listed by `systems[].gallery` in `src/drafts/event-horizon/data.ts`.
- Write a check script, `verify.mjs`, that proves:
  - every `text` is an exact substring of its `source`;
  - every point lies inside the image;
  - no screenshot has more than 3 markers.

  Print its output in the README.
- Also run `design/selected-work-concepts/motion-3d-study/xycut.py` on each of those gallery images and save the boxes as `xycut/<name>.json`. A marker should sit on or inside one of those boxes; report which box for each marker.

**Part 2: concept frames.** Use image generation, then composite with the real screenshots restored pixel for pixel, as `design/selected-work-concepts/material-refinement/preserve.mjs` does. Make frames at 1440×900 and 390×844 for Bayyinah TV and Read to Feed:

1. The stage at rest, with markers visible but quiet: a 10 px mint ring with a 4 px core, at 0.7 opacity.
2. One marker active on hover or focus: its line in a small glass label anchored to the point, never covering the marked element. On phones a tap does the same, with the label in the flow under the stage.
3. A marker paired with the matching line in the case's "The decision that worked" list, showing how the two connect.

For each frame, name the marked element and the source string.

**Motion.** Markers fade in once, 200 ms after a screen arrives in the stage (opacity only, 160 ms, ease-out). The label opens in 150 ms, ease-out, from scale 0.96, and closes in 100 ms. Nothing moves at rest. Under reduced motion everything appears without movement.

**Acceptance:**
- `verify.mjs` passes.
- 0 changed protected pixels.
- Every marker is a ≥ 44×44 tap target on phones, though it draws smaller.
- Label text is ≥ 14 px with contrast ≥ 4.5:1 over the screenshot behind it; measure and report the lowest.
- No label covers the element it marks.

**Deliver** in `design/selected-work-concepts/decision-markers/`: `markers.json`, `verify.mjs`, `xycut/`, `frames/`, `contact-sheet.png` and a `README.md` with the verification output and a ranked recommendation. Change nothing in `src/`.
