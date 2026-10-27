# Exploded View — review after polish

27 October 2026. Reviewed the live home and care-platform case at 1280×720, the current source, and the saved light-theme desktop/mobile captures. This is a visual follow-up, not a measured performance audit. No application source was changed.

## Verdict

The home page is substantially better. Real work leads the hero; project names scan; evidence has room; Futurisma creates a welcome change of colour and subject. The remaining work is composition and one clear case-layout regression. Further effects would have a lower return than fixing those.

## Fix first: case context layout

At desktop width, the care case shows Product, Users, My role and Time as four narrow cards occupying only the left half of the page. The role paragraph becomes a tall column of short lines while the right half stays empty. This also delays the first product image.

Cause: `exploded-view.css:177` gives `.xv-case-head` two columns for the home project summaries. The same class is used by `CasePage.tsx`. Its later declaration at CSS line 297 changes the gap but retains those columns. `.xv-context` at line 301 is then a four-column grid inside a single half-width parent cell.

Give the case header its own deliberate layout. If keeping the title and question side by side, make the context span `grid-column: 1 / -1`. Prefer distinct home/case header selectors so future changes remain local. Verify every case, including a short title and a long one, at desktop and phone widths.

Evidence: [live case-header capture](review-case-header.png).

## Next: three composition refinements

1. **Read to Feed leaves half the desktop image area empty.** The two portrait assets are capped at 280px and remain left aligned under a full-width project header (`.xv-ev-phones`, CSS lines 203–204). Give them a deliberate centered composition, or put the project explanation beside the phones in a self-contained two-column feature. Keep the portrait images readable; do not enlarge them simply to fill the entire width.
2. **The date picker is oversized relative to its content.** The shared `.xv-ev-wide` cap is 980px at CSS line 196. That size suits a dashboard better than a single calendar control. Give the design-system artifact its own roughly 640–720px desktop width and intentional alignment with the project text. Preserve generous whitespace while shortening the long repeated text-then-image rhythm.
3. **The care story now has two competing stack diagrams.** The bounded five-layer animation sits next to the pre-existing sticky four-layer architecture drawing. Both use the same teal plates but express different breakdowns. Make one the primary figure; move the other into Engineering details or give it a clearly different visual form and purpose. The reader should understand why each figure exists without comparing two similar stacks.

## Small final adjustment

The hero now proves the work, which is the main improvement. The four rear planes still read like offset sheets, particularly in the light-theme capture. Modest tonal separation, consistent edge treatment and one soft offset contact shadow would give them more material depth. Keep the real screen nearly frontal and the current restraint. Additional floating, glow or page-wide parallax would weaken the calm identity.

The Lab composition is the strongest improvement: a generous actual game capture, concise adjacent text and optional process detail. Keep it. The native layer radio interaction also updates the selected layer and accessible description correctly in the inspected state.

## Verification limits

Live inspection used the dark theme at desktop width. Light desktop and 390px mobile appearance were assessed from the implementation's saved captures, corroborated against current source; those captures are not a substitute for a fresh interactive phone pass. The in-app pane is unsuitable for certifying requestAnimationFrame timing, so no smoothness, idle-render or performance pass is claimed here.

Questions skipped: the next actions are concrete and do not require another design direction.
