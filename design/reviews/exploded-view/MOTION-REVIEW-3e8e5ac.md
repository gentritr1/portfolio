# Motion review — 3e8e5ac

Reviewed in system Chrome through the browser connector, with an additional in-app-browser check and source inspection. The commit is present locally. No application source was changed, and nothing was pushed.

## Findings

| Before | After | Why |
| --- | --- | --- |
| `useOnceInView` checks only `isIntersecting` (`figures.tsx:13–17`). | Require `isIntersecting && intersectionRatio >= threshold` before firing and disconnecting. | IntersectionObserver can report the first intersection below the configured threshold. The parity player, slider nudge and tenant locks can start while only a sliver of their figure is visible, consuming their one-shot explanation before it can be read. |
| Reduced motion forces `playing` false, but Play remains an enabled control (`figures.tsx:39,63–77`). | Hide Play in reduced motion and retain the six manual step controls, or support explicitly requested playback with suitable static/fade states. | The current button sets `play=true` but can never advance the timer while reduced motion is enabled. “No autoplay” should not leave an ineffective control. This is a source-established defect; the OS preference was not changed during this review. |
| Keyboard activation follows the same `TransitionLink.go()` path as a mouse click (`TransitionLink.tsx:40–48,56–61`). | Preserve preload, state and focus behavior, but bypass travel for keyboard activation. Take care with assistive-technology activation when choosing the event test. | The draft now gains a real transition, but keyboard links also gain its 320ms screen movement. This contradicts the chosen instant-keyboard policy. Keyboard return was exercised; the animation-path conclusion is confirmed by source, rather than a frame-time trace. |

## Verdict by motion

- **Parity player — keep.** This is the strongest addition. Matched screens, named steps and the current-step rule make the parity claim understandable. The 2.4s hold is a reasonable starting point for these dense screenshots. Keyboard Enter on step 5 changed the selected state directly. Playback advanced and rested at step 6. An intentional replay remains useful.
- **Before/after slider — keep.** The matched crops communicate the comparison well. Live dragging moved the divider, and Left then changed 80 to 79 immediately. The first-view swing was sampled at 59%. For the final taste pass, shorten its 1100ms back-and-forth to one restrained hint around 600–700ms; this is a preference, not a functional blocker.
- **Carried screen — keep.** The pointer navigation visibly preserved the selected care screen, with the other home screens staying in the root fade. The destination opened at its top. “All work” restored the list. A captured intermediate frame still shows old/new page text overlapping during the root crossfade; it is transient, not evidence that unrelated screens remain stuck. Keep the morph; if ghosted text is distracting in a full-speed human check, reduce the root overlap while preserving the named screen transition.
- **Hero layers — keep.** The selected Data layer has a clear teal edge and a useful tools line. Keyboard focus selects it without waiting on the spring. The object stays secondary to the claim. The browser API did not expose a dedicated hover action, so this review does not independently certify the reported hover-flicker fix or all rapid pointer retargets.
- **Tenant locks — keep, but fix the trigger.** The final three locked partitions are quiet and legible. In this session the locks were already closed by the time their bodies were fully visible. The shared visibility guard explains how the reveal can be consumed early; the exact stagger was not captured frame by frame.

## Layout follow-up

The previous context-card regression is fixed: metadata spans the case width and reads as four calm columns. The narrower date-picker and phone evidence now sit beside their stories. The care reading section has one primary bounded stack figure. These changes improve the page more than another layer of decorative animation would.

## Performance follow-up

The slider currently updates React state and a parent `--pos` variable per frame, feeding both `clip-path` and the divider’s `left`. This is a small bounded figure, so it is a profiling target rather than a demonstrated jank claim. If profiling shows layout/style cost, update the image’s clip and the divider’s transform directly, keeping the input’s semantic value synchronized.

## Decision

**Block final motion sign-off until the three behavior findings are corrected. Approve the visual direction and keep all five motion concepts.** The remaining aesthetic preference is a shorter, simpler comparison hint.

No real-phone touch pass, Safari pass, reduced-motion runtime pass, hidden-tab recovery test or GPU/frame-time benchmark was performed in this review. Live browser screenshots and state changes support the interaction observations; they do not certify smoothness across devices.
