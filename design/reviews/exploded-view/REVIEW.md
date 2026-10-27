⚠️ DEGRADED: single-context synthesis (the independent design reviewer returned observations and captures, but was interrupted before its final report).

# Exploded View — review, 27 October 2026

The direction is worth keeping. The serif headings, restrained navy/teal palette, concrete engineering questions and exploded stack form a coherent identity. It feels calm and credible. Its main weakness is the balance between explaining the engineer and displaying the work: diagrams and prose receive more space than the artifacts that demonstrate quality.

## What works

- The headline and supporting role/location information make the person and professional direction clear.
- Problem-led project writing gives the cases a reason to exist. The rewrite and token-system stories have concrete evidence behind them.
- The stack has meaningful states: rewrite checks, token propagation, tenant separation and reader maintenance. It can be a memorable explanatory object.

## Priorities

| Priority | Observation | Proposed change |
| --- | --- | --- |
| High | The opening picture is empty capability plates, with no real product screen. | Let a recognizable real screen lead the object composition. Keep the labelled five-layer explanation nearby. |
| High | A sticky diagram uses about 40% of desktop width; each project also repeats a small stack. Screens lose scale. | Give featured work the content width. Use the stack in bounded explanatory moments and replace duplicates with a text key. |
| High | Lab describes a 3D racing game without showing it. | Lead with a generous real Futurisma still, then compact secondary project images. |
| Medium | The visible project headings are long questions; the project names are visually hidden. | Show names as well as the questions and make More work faster to scan. |
| Medium | Several full-width bright screens and repeated prose blocks create a uniform rhythm. | Vary the evidence composition: rewrite comparison, component detail, dashboard overview, portrait reader screens, then the game capture. |
| Medium | Existing 1.2–1.4s choreography and continuous scene work can make a quiet page feel less precise. | One brief opening settle, input-driven state changes and a still resting frame. |

The first-screen proof remains the principal holdback. Memory sentence today: “The engineer’s work is explained as five separating layers.” Desired memory sentence: “I could see the products, then inspect the layers and decisions behind them.”

## Visual studies

These are proposed compositions, made with the existing real assets. They are not screenshots of implemented changes.

- [Hero study](study-hero.png): recognizable product screen with shallow depth.
- [Work study](study-work.png): named rewrite story with matched before/after evidence.
- [Lab study](study-lab.png): actual game capture and compact secondary projects.
- [Opus implementation brief](OPUS-5.5-BRIEF.md): priorities, asset paths, motion values, constraints and completion criteria.

Two current desktop evidence captures are retained as `current-rewrite.png` and `current-design-system.png`.

## Technical evidence

Independent source review found these concrete issues to verify and repair during implementation:

- `scene.ts` around line 286: renderer size is set every frame, even if dimensions have not changed.
- `exploded-view.css` around lines 209 and 255–259: the three-phone gallery selector outweighs mobile column rules.
- `Draft.tsx` around lines 103–116: stage anchoring/active state is re-evaluated on intersection changes, without an explicit breakpoint-change path.
- `Draft.tsx` around lines 38–39 and 71–90: reduced motion is checked when the scene is created, rather than subscribed to live.
- Current project prose needs reconciliation with CONTENT.md’s team-voice rule, particularly personal authorship claims in work descriptions.

The detector returned 10 findings: one local font-system warning and nine advisories covering colour, radii and one font size. Most reflect the deliberate difference between this draft and the main portfolio’s DESIGN.md. They do not justify removing the serif/teal identity. Use variables for the duplicated colour values; judge radii by purpose.

## Scope and limits

Live browser observations covered the home page at tablet width and desktop captures at 1280×720; the independent reviewer also opened a care case. Mobile gallery concerns came from source inspection. This is not a completed mobile accessibility audit or a measured performance benchmark. No frame-rate, loading-speed or contrast certification is claimed.

Source/detector review and the design observations were separate lanes; the final synthesis is by the primary reviewer after the visual lane was interrupted. No detector overlay was injected. A temporary loopback server rendered the standalone studies and was stopped afterward. The existing draft and unrelated working changes were left intact.

Questions skipped: the request already supplies the direction and asks for a concrete handoff.
