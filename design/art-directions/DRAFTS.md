# Live art-direction drafts

Built from ASTRA-DRAFTS-BRIEF.md. The live picker is at **/drafts**. The public home remains the hybrid. Draft routes are lazy-loaded and marked noindex, with no link in the public navigation.

## Review method

Each draft is captured at 1440 px and 375 px, then judged by a non-builder against the brief. Scores are Design 40%, Usability 30%, Creativity 20%, Content 10%. The energy check precedes scoring. The lowest material issue is repaired, up to three rounds. Scores below the requested bar are retained honestly at that limit; they are not approval claims.

Screenshots use the local review frame. Reduced-motion and no-WebGL paths are implemented; browser interactions and bundle sizes are checked separately. No physical-device frame-rate or Android benchmark is claimed.

## Reviewed drafts (4/16)

| Draft | Band | Energy | D | U | C | Content | Weighted | Rounds | Screenshots | Signature motion | Remaining holdback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Index × Preview](/drafts/hybrid) | Professional | pass | 7.9 | 7.9 | 8.0 | 8.2 | 7.95 | 3 | [Desktop](drafts-review/hybrid-desktop.png) · [Mobile](drafts-review/hybrid-mobile.png) | Selecting a project floods the page with its colour as its screenshot reveals inside the name. | Image-filled active names lose contrast where their crop matches the page colour. Retained after the three-round limit. |
| [Studio Shot](/drafts/studio) | Crafted | pass | 8.3 | 8.1 | 8.0 | 8.3 | 8.18 | 1 | [Desktop](drafts-review/studio-desktop.png) · [Mobile](drafts-review/studio-mobile.png) | Three bevelled phones open into a fan, then the camera moves between the collection, reader and progress as the studio changes from cobalt to coral to citron. | The phone-fan composition is familiar, and the enlarged public screenshots look soft. |
| [Gentrit Desktop](/drafts/desktop) | Fun | pass | 8.2 | 7.9 | 8.1 | 8.3 | 8.10 | 2 | [Desktop](drafts-review/desktop-desktop.png) · [Mobile](drafts-review/desktop-mobile.png) | The featured project window springs out of the dock into a full working desktop. | Mobile reading requires navigating both the page and the app window’s scrolling area. |
| [A working canvas](/drafts/canvas) | Experimental | pass | 8.1 | 7.7 | 8.2 | 8.3 | 8.02 | 1 | [Desktop](drafts-review/canvas-desktop.png) · [Mobile](drafts-review/canvas-mobile.png) | The opening camera glides across oversized lettering into a spatial portfolio; clusters become a keyboard-driven presentation. | Mobile canvas controls and the partially visible care artboard make exploration less immediate than the linear reading mode. |

## Hybrid repair history

The main merge is local commit 89c40c4. Section 6 now includes project-colour page floods, screenshot-filled active names, eager populated case-study surfaces with a GPU-ready crossfade, and a colour-sorted work wall with real-name posters for projects without public imagery. Hover reveals resolve from coarse dither to the decoded image.

Hybrid rounds: **7.86 → 8.01 → 7.95** weighted. The final round improved visible image texture but retained a local text-contrast weakness. The three-round limit was observed. The mobile name is larger and heavier; forced-colour and enhanced-contrast preferences receive solid text.

## Maintenance

Draft metadata and jury scores live beside each implementation in src/drafts/<id>/meta.json. Run node scripts/update-drafts-report.mjs after accepting a review. Picker thumbnails are downscaled captures of the corresponding desktop draft, with provenance metadata. All directions reuse the same project facts. Any invented product interface is labelled as a recreation.
