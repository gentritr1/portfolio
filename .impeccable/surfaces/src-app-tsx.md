---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages/HomePage.tsx", "src/pages/CaseStudyPage.tsx", "src/components/portfolio", "src/components/case/StudioHero.tsx", "src/components/case/TechnicalDiagram.tsx", "src/styles/globals.css"]
---

## Scope

A routed developer portfolio for hiring managers and senior engineers: a short phone-first scan, followed by a deeper case study. The owner approved the hybrid recommended in [ASTRA-ART-DIRECTIONS.md](../../design/art-directions/ASTRA-ART-DIRECTIONS.md), with [BRIEF-round3.md](../../design/art-directions/BRIEF-round3.md) controlling composition. DESIGN.md records the implemented system. CONTENT.md and PRODUCT.md govern facts, audience, voice and image provenance. This direction supersedes the former control-room home.

## Direction contract

THESIS: An efficient project index opens into a more expressive view of the work. Product imagery supplies colour and character; the shell stays precise and quiet. Each primary view has one composition: M Index × Preview on home, L Wall for visual browsing, O Studio Shot plus G exploded system layers on case pages. N Canvas and I Desktop remain optional exploration.

OWN-WORLD: Graphite dark and warm-paper daylight, fine rules, local Archivo variable for headings and body, local Martian Mono for metadata. Cobalt `--signal` marks focus and selection. The personal identity is a geometric dithered cut orb, with a darkened daylight treatment. Product-specific image grounds carry larger areas of colour. Device lighting and contact shadows belong to product objects. The shell does not restore signal badges, channel tabs or opening lower thirds.

STORY: Read the name and role, scan selected projects beside a meaningful preview, then enter one of five factual cases. Reveal all 28 projects, use search, or switch to Wall for a visual route. Case pages lead with a studio product image and continue through readouts, a technical system diagram, narrative, milestones, a guided demonstration, public galleries and supporting facts. About, confirmed contact links and the CV remain part of the linear path. “Explore the canvas” is optional; it does not hide required information.

FIRST VIEWPORT: A restrained identity/navigation row, Gentrit's name and concise role/location text, then the project index and a large product-coloured preview. Desktop uses an asymmetric list/preview split with the preview sticky at 24 px. The masthead remains in normal document flow. The name is solid type, not an image mask. Wall hides the full introduction for a compact, work-first opening.

PHONE: At 760 px and below, the preview moves above the index and becomes static. Its project appears once there, replacing its duplicate list row; desktop hover/focus preview switching is not carried into the phone layout. The remaining rows stack category/year below the name. The selected preview includes a clear project label and case action. Native navigation, sort controls and ordinary scrolling remain available. The canvas has its own responsive controls and is never the default phone entry.

FORM: Existing public product pages and store listings are composed at scale; personal projects may use their own assets. The care platform uses an authored invented-data still and recreation. Three-dimensional case devices are actual low-poly OGL enclosures with textured screens, not flat screenshots presented as model geometry. CSS device compositions render first and remain the reduced-motion/no-WebGL path. Each shared studio graphics path targets no more than 25 kB gzip, including its shared graphics imports.

INTERACTION: The index supports up/down, Home/End and Enter. The desktop preview tilts subtly and can play one short muted recreation, with an explicit stop path. Command/Ctrl K opens project search. Wall sorts by colour, year or platform; pointer sorting uses FLIP, keyboard sorting is direct, and the optional OGL hover effect leaves the native tile fully usable. Case diagram buttons expose all text and highlight the corresponding layer. The canvas supports drag, wheel/pinch zoom, fit controls, minimap and presenter keys. Home O opens the canvas; O inside it toggles the draggable, keyboard-movable project desktop. Escape returns to the linear interface and focus is restored.

MOTION: Use movement to show selection, a route change, a small product interaction or the relation between system layers. Studio rendering stops at rest and pauses offscreen/hidden. Canvas inertia and camera travel, wall reflow, preview motion and route morphs respect reduced motion. Optional graphics are lazy; image or context failure retains usable still content. Audio is off by default and requires the user's opt-in.

RETAINED: Signal Stack is retired from home and retained in the 404 and development lab. Existing live recreation components, guided 16-second watch sequences, galleries/lightbox, content data and factual narratives remain. Internal channel/monitor identifiers are implementation continuity, not a reason to reinstate the old navigation metaphor.

FINISH: Review screenshots at 375, 820 and 1440 px, both themes and motion preferences, and judge the lowest category before the next revision. The jury weights are Design 40%, Usability 30%, Creativity 20%, Content 10%, with a target of at least 8 in each. Check keyboard/focus behavior, text contrast, 44 px hit areas, layout stability, the initial 110 kB gzip JS budget including shared preloads, and the compact lazy scene budgets. Keep measured results and jury scores in the root agent's handoff/verification records rather than declaring them passed here. Hosting remains a separate owner decision.
