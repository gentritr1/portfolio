# Hybrid implementation and jury record

Date: 2026-10-03. Scope: local implementation of the owner's recommended hybrid; no publication or external award submission.

## Direction

- **M Index × Preview:** eight selected projects, all-28 expansion, keyboard selection, real public imagery, three-second opt-in previews and project search.
- **L Work Wall:** 28 varied tiles, colour/year/platform sorting, one shared lazy OGL hover scene. Editorial tiles use project facts when no public image exists.
- **O Studio + G technical story:** five featured cases, public product screens on compact 3D devices, static fallbacks, selectable exploded system diagrams and factual case narratives. Care-platform content remains an explicitly labelled recreation with invented data.
- **N Canvas + I desktop:** optional clustered canvas with pan, zoom, fit, minimap and presentation controls; the O shortcut exposes the desktop mode inside it.
- Two self-hosted typefaces, graphite or warm-paper ground, cobalt interaction colour and an authored dithered sphere identity. The sharing card uses the same identity.

The owner pinned this hybrid. No new concept tournament was needed. `[Seniority]` and “Open to remote roles” from the exploratory brief were not treated as facts; the implementation uses the confirmed role and remote-working description instead.

## Independent jury loop

A fresh reviewer without the builder's conversation history assessed desktop and phone captures of the index, Wall, cases, technical diagram and Canvas against the briefs and craft floor. The first disposition was **fix**.

| Category | First review | Final verdict |
|---|---:|---:|
| Design (40%) | 7.8 | 8.1 |
| Usability (30%) | 8.1 | 8.1 |
| Creativity (20%) | 8.0 | 8.0 |
| Content (10%) | 8.2 | 8.2 |
| Weighted total | 7.97 | **8.09** |

| Material finding | Correction | Reviewer result |
|---|---|---|
| Wall imagery began too far down the opening viewport; captions were missing from that view. | Compact Wall opening, with identity retained in the masthead and project imagery beginning around the upper third. | Resolved: four captions visible and the varied column rhythm carries the composition. |
| Phone preview named Bayyinah immediately before a duplicate Bayyinah row. | One featured name/action under the preview; hide its duplicate row on phones. Keep mobile selection fixed and exclude hidden rows from keyboard traversal. | Resolved: proof and opening action retained, and the next project enters the first viewport. |

Final disposition: **ship against the brief's ≥8 visual target**. The verdict pass scored these two fixes; the other category scores remained unchanged. This is an internal review, not a Site of the Day award or a 9+ rating.

Final verdict evidence: [Wall desktop](review/wall-desktop-final.png), [phone index](review/index-mobile-final.png). Additional final captures: [desktop index](review/index-desktop-final.png), [daylight phone](review/index-mobile-daylight-final.png), [studio case](review/case-desktop.png), [phone case](review/case-mobile.png), [technical story](review/technical-desktop.png), [Canvas](review/canvas-desktop.png), [phone Canvas](review/canvas-mobile.png).

## Verification

- **Responsive matrix:** 84 combinations: Home, five featured cases and 404 × 375/820/1440 CSS pixels × dark/light × full/reduced motion. Entry observations show equal document and viewport widths, CLS 0, loaded fonts and no failed completed images. Machine-readable results: [responsive-matrix.json](review/responsive-matrix.json).
- **Interaction:** search filters, arrow selection, Enter navigation, Escape and focus restoration; 28-project expansion and retained state after drawer dismissal; index arrows; stable phone focus with the featured row hidden; three-second preview start and completion; Wall sort; Canvas fit/presentation/cluster navigation; hidden desktop mode and exit.
- **Fallbacks:** full-motion WebGL and reduced-motion static studio presentations were inspected. Scene geometry, image paths, disposal, hidden/offscreen pausing, context-loss and failed-image recovery were checked during implementation. This is not a physical low-end-device GPU certification.
- **Accessibility:** visible focus, native modal focus handling, meaningful heading hierarchy in both home views, 44px navigation controls, optional sound off by default, explicit public-image/recreation provenance and reduced-motion alternatives.
- **Build:** TypeScript and production build pass. Required published Impeccable command completes successfully. The bundled detector reported advisory documentation gaps in the type ramp and search scrim; documentation was reconciled to the implemented values without changing detector rules. Repository lint completes with existing warnings in the retained tooling and earlier lab/preload code.
- **Budgets:** Vite's gzip report gives 88.51 kB for the entry file and about **107.73 kB** including its four synchronous imports, within the roughly 110 kB budget. Studio scene + shared OGL/Camera is about **18.30 kB**; Wall hover + shared OGL is **16.16 kB**, each below 25 kB. Canvas is approximately 6.94 kB and loads on request.
- **Sharing:** 1200×630 PNG, actual local mark geometry, licensed local fonts, factual role copy and embedded provenance. Site/CV identity details remain those supplied by the owner.

## Measurement limits

The responsive fixture used the local development server and the in-app browser. Recorded LCP values are local entry observations, not throttled field measurements or a production Android claim. Screenshot capture affected browser zoom and produced artificial layout-shift entries in earlier observations; the saved matrix was measured on fresh fixture loads without taking screenshots during measurement. Real-device frame time and production network performance remain unmeasured. No deployment, push, custom domain or external jury submission was performed.
