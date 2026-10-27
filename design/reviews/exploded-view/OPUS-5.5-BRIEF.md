# Exploded View — polish brief for Opus 5.5

## Task

Polish the existing `/drafts/exploded-view` portfolio and its case pages. Preserve its calm serif, navy/warm-paper, teal identity and its five-layer exploded-view concept. Make the real products easier to see, the composition more deliberate, and the existing motion quieter and more precise. Implement the changes, then verify them in the browser. This is a refinement of this draft.

Reading this as: Gentrit Rashiti’s engineering portfolio for hiring managers and senior engineers, leading with shipped product evidence in a calm editorial world with one explanatory 3D object.

## Owner decisions (2026-10-27, after a review of this brief against the code)

- **Hero object:** the real screen is a textured plane in a Three.js scene, the front layer of five. The four layers behind it are shallow solid plates, each labelled on a leader. The canvas lives inside the hero figure (not fixed to the window), so scrolling needs no re-render. The first paint is a static HTML composition with the same numbers, read from the same CSS custom properties. The 3D replaces it on its first frame, then settles once into a slight tilt.
- **Case animations:** the rewrite, tokens, tenants and reader explanations move off the homepage into a bounded 3D figure on each of those four case pages, next to "The decision that worked". The homepage keeps 3D only in the hero. Across the stack uses the SVG drawing with a native radio group.
- **Futurisma:** nine circuits. CONTENT.md's "seven" was stale.
- **Captions:** "Real product screens, invented data." applies only to care-platform and Design System v2 images (`/showcase/care*`, `/showcase/design-system/`). It never applies to store screenshots such as Read to Feed.
- **Voice:** project copy for team work follows CONTENT.md's team voice. First person stays in the hero claim, How I work, the Lab lesson and Futurisma, which is the owner's own project.
- **Measures:** "one third of the viewport" means the hero object (screen and plates) is at least 480 px wide at 1440×900, with the whole screen above the fold. "Five seconds" means the name, role, one project name, a real screen and a link to the work all sit inside the first viewport at 1440×900 and at 390×844, checked by DOM rects. 44 px applies to buttons and row links. Inline text links need at least 24 px (WCAG 2.5.8).
- **Tooling:** Playwright is not installed, so the portfolio checker cannot run. Browser checks use a CDP script against system Chrome, because the in-app browser pane pauses rAF. Probe marks are `xv:hero:ready`, `xv:hero:idle`, `xv:case:<state>:play` and `xv:case:idle`. `?xvPlay` on a case page plays its animation at once.

## Read first

- `PRODUCT.md` and `CONTENT.md` control facts, ownership, and image permissions. `DESIGN.md` describes the main portfolio; this draft has an intentional serif/teal variation. Preserve that variation.
- `src/drafts/exploded-view/{Draft.tsx,CasePage.tsx,scene.ts,StackPoster.tsx,exploded-view.css}` contain the implementation. `shots.ts`, `data.ts`, and `cases.ts` contain the image inventory and factual content.
- Open the current route and inspect the hero, selected work, Across the stack, Lab, Contact, and one desktop and one mobile case page before changing code.
- Look at `design/reviews/exploded-view/study-{hero,work,lab}.png`. Their editable source is `design/reviews/exploded-view/section-studies.html`. They illustrate composition and asset choices; they are not finished page templates or architecture diagrams. Keep the actual page’s full contact routes and factual content.

## What needs to change, in priority order

### 1. Let real work lead the first screen

The current hero has good type and clear role information, but the five empty plates represent capability rather than demonstrate it. Keep the claim prominent and pair it with a real product screen. A slightly tilted screen above shallow solid planes can connect the work to the exploded-view concept. Keep the screen nearly frontal so its content remains recognizable. Retain the five labelled capabilities in the explanatory object or its adjacent key; do not turn two decorative planes from the study into a claim about the product’s architecture.

At 1440×900 the work should occupy roughly one third of the opening viewport. On a phone the real artifact should appear before the visitor has to scroll through a long capability illustration. Keep identity, role, location, and availability readable. Add a clear “See the work” anchor while retaining CV, email and professional links. The existing claim can stay; factual copy changes must follow CONTENT.md.

### 2. Give project images enough room

At desktop widths the sticky stage currently reserves about 40% of the page for the stack, and each project has another small stack. This makes the screenshots feel like supporting thumbnails.

Use generous project compositions across the content width. Keep the stack in the hero and Across the stack section; reserve any case-specific 3D explanation for a bounded figure beside the relevant story. Remove the duplicate miniature stacks from featured projects. A compact text layer key can retain the relationship to the concept.

Make each project name visible, followed by its existing problem/question, a short answer, a substantial artifact, one qualified result, and “Read the case.” Keep project names below the section heading rather than introducing extra section labels or badges.

Give the four featured stories different evidence treatments:

| Story | Image treatment | Source |
| --- | --- | --- |
| Care rewrite | Matched before/after overview; a readable matched detail crop in the case | `/showcase/care/old-new/old-compliance-1080.webp`, `/showcase/care/old-new/new-compliance-1080.webp` |
| Design System v2 | Generous, nearly frontal date-range-picker detail; show its actual visual craft | `/showcase/design-system/date-range-picker.webp` |
| Tenant separation | Large dashboard screen plus a small explicitly conceptual separation diagram | `/showcase/care-dashboard/overview-1080.webp` |
| Read to Feed | Two portrait screens with enough height to read; avoid a wide-screen frame | `/mobile/reading-1.webp`, `/mobile/reading-3.webp` |

The before/after overview establishes continuity. It is not a substitute for readable detail: do not shrink both full screens into illegibility, especially on phones. Offer full-size viewing or stack them vertically. Preserve screen proportions and image sharpness.

Use the exact caption “Real product screens, invented data.” for the permitted care and design-system images. Existing UI names within those images are invented data. Never manufacture product screens or results with image generation.

### 3. Give Lab one memorable image

Lead Lab with a real Futurisma capture: `/personal/shots/futurisma-frostline-1.webp` (2880×1800). Use a wide, generous image with a short project description and the existing case/GitHub routes. Let the snowy game scene supply visual variety. Keep process explanation and the “what failed” detail available in the case or a native disclosure so the image and result lead the home section.

Use compact secondary previews for Offday (`/personal/shots/offday-light-calendar-desktop.webp`) and FJALË (`/personal/shots/fjale-desktop-1080.webp`). Retain Za! with its existing link; an optional thumbnail is `/personal/shots/za-table-two-seats-1080.webp`. Preserve credits and teammate attribution. Avoid expanding every side project into the same large feature treatment.

A short muted gameplay clip is optional only if an existing real recording is available. Use a deliberate Play control, poster and pause behavior. The still is already sufficient for this pass.

### 4. Finish the quieter sections

More work: show the product name visibly, with a shorter secondary problem line. Give each row a clear link target and consistent baseline/arrow placement.

Across the stack: retain the layer-to-tool relationship, but let a selected layer explain a real capability in text. If selecting a layer changes state, use a native control with visible selection and keyboard support. Keep all facts available without hovering.

How I work: retain the four owner-authored sentences as a calm reading section. Images and animation are unnecessary here.

Contact: tighten the closing spacing and keep the email action unmistakable. Preserve the copied confirmation, mail fallback, CV and social links. Avoid a long empty tail caused by the old sticky-stage layout.

## Motion direction

The page already has Three.js, seven scene states, a 3° pointer tilt, static SVG fallbacks, section observation and cleanup. Improve those assets before adding another engine.

| Trigger | Treatment |
| --- | --- |
| First view | Show a complete static composition immediately. One optional stack settle, 600–800ms, with no delayed text reveal. |
| Fine-pointer movement over hero object | Local tilt up to 2°–3°, interruptible and returning to rest. Text and page layout stay fixed. |
| Select a layer | 180–260ms lift/tint in the diagram; update the adjacent explanation. Keyboard selection updates immediately. |
| Enter a case | 250–350ms continuity transition if the same artifact can be preserved. Otherwise use a short crossfade. |
| Hover a project link | 120–160ms underline/colour or a 2–3px arrow movement. |

Use `cubic-bezier(.16,1,.3,1)` for authored settling; a critically damped spring can drive retriggerable pointer interaction. Keep the camera and lettering stable. Let one action explain one state. Retain the rewrite, token, tenant and reader explanations where they help, but shorten their current 1200–1400ms choreography and place them near the relevant case content rather than replaying an object throughout the whole home page.

Rest on a still frame. Remove perpetual float and stop rendering once settled; resume only for input, a state change, resize, or visibility change. Reduced motion must show the complete static image and all explanatory text. Honour a preference change while the page remains open. Pause offscreen/hidden-tab work, dispose GPU resources, and preserve the no-WebGL fallback. Keep native scrolling.

## Specific technical fixes

- In `scene.ts`, `layout()` (there is no `updateAnchor`) currently calls `renderer.setSize` on every frame (line 286). Cache dimensions or resize on a viewport/observer change; still update the anchor when needed.
- In `exploded-view.css`, the three-phone gallery selector has greater specificity than the narrow-screen rules. Fix the cascade so Viva Fresh and Dukagjini have a deliberate readable mobile layout.
- In `Draft.tsx`, explicitly re-evaluate stage visibility, anchor and active state when crossing the desktop breakpoint. Verify desktop → phone → desktop while midway down the page.
- Replace the one-time reduced-motion eligibility check with a live media-query subscription and release the scene when reduced motion becomes enabled.
- Review the existing case-page `xv-settle` animations: sections should be readable immediately; repeated section entrances should be removed.
- Reconcile existing first-person work claims with CONTENT.md’s team-voice rule. Keep the owner’s role in role metadata. Keep “dashboard not in production yet” and the qualified Button-only bundle-size result wherever relevant.

## Completion criteria

1. The home page shows identifiable real work in its first viewport on desktop and phone. A visitor can identify Gentrit, the role, a project and the route to its proof in five seconds.
2. Project names scan quickly. Screens have readable detail or a clear full-size route. Lab shows the real racer. The five-layer idea still connects the page.
3. Inspect 1440×900, 390×844 and 320px, both themes, reduced motion, keyboard focus, no-WebGL fallback and the two case-gallery shapes. Check no horizontal overflow, 44px controls, readable contrast and no layout jumps.
4. Capture the motion mid-flight, interrupt it, then verify it settles and stops work. Check resize and hidden-tab recovery. Profile on a production build with CPU throttling; do not claim measured smoothness from visual inspection alone.
5. Run the repository’s build and lint checks. Run the portfolio checker using the actual fact sources, manually reviewing content-specific false positives. Fix hard failures or record deliberate exceptions.
6. Deliver before/after desktop and phone captures, an account of what changed and any remaining limitations. Stop after one review/fix pass and one confirming pass.

The tradeoff: a smaller role for the persistent 3D stage gives the real products more space and improves mobile continuity. The object remains a memorable explanation of the work, while image composition and precise interactions provide most of the polish.
