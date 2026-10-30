# Mobile platform pass — 2026-10-30

Applied the installed `emil-design-eng` skill and Emil's official [mobile-native skill](https://github.com/emilkowalski/skills/blob/main/skills/mobile-native/SKILL.md), read directly from its source. The latter was not installed locally. Scope: Refractive Engine home, cases, screenshot viewer and reader dialog.

| Before | After | Why |
| --- | --- | --- |
| Viewport omitted safe-area and keyboard hints | `viewport-fit=cover, interactive-widget=resizes-content` | Expose notch/home-indicator insets and request layout resizing when the keyboard opens in supporting browsers. Zoom remains enabled. |
| Fixed masthead and floating overlays ignored safe areas | Header/content offsets, side gutters and bottom spacing use `env(safe-area-inset-*)` | Keep controls and copy outside cutouts and the home indicator, including landscape. |
| Page root used `100vh`; overlays used `svh` | Root and overlay sizes use `dvh`, with safe-area bounds on overlays | Track available viewport height for app-like surfaces. The document's hero remains stable. |
| Controls allowed native text selection/callouts | Buttons, summaries and role buttons opt out; screenshot gesture images disable callouts | Long-press does not select a control label. Ordinary text and contact links remain copyable. |
| Summary controls lacked the existing tap policy; some controls lacked press feedback | `touch-action: manipulation` includes summaries and role buttons; controls get immediate active feedback | Consistent press response without disabling page zoom. |
| One layer-list hover rule was ungated | Mouse hover is capability-gated; focus remains separate | Touch does not inherit a persistent hover treatment. Other handwritten hover rules were already gated. |
| Swipe surfaces used only `pan-y`, blocking pinch zoom | `pan-y pinch-zoom`, including their image-opening overlay buttons | Browser owns vertical scrolling and pinch zoom; screenshots own horizontal swipes. |
| Swipe handlers had no cancellation, pointer ownership or multi-touch guard | Shared `useScreenSwipe` guards those boundaries and suppresses the compatibility click after a swipe | A scroll/cancel/pinch cannot select a screen, and a swipe cannot accidentally open the viewer. Mouse and keyboard stay native. |
| The hero's transparent copy box prevented text selection | Actual headline/paragraph boxes receive pointer events at their content width | Copy can be selected without intercepting the nearby layer buttons. |

Tradeoff: the two existing screen-swipe implementations now share one small hook because their thresholds and cancellation rules describe the same interaction. Pointer capture starts only after a horizontal gesture is chosen; capturing on press would steal ordinary image-button taps.

Already correct: most hover gates; 44px control targets; native scrolling and native horizontal thumbnail strips; viewport zoom allowed; theme color matches the dark portfolio; text-size-adjust is 100%; screenshot viewer has contained native scrolling. Root pull-to-refresh is retained for this scrolling document; it is suppressed while a modal is open.

Input inventory: no text, email, telephone or OTP fields on these surfaces. The only input is the optional field-notes range control. Coarse-pointer controls have a 16px font floor. No `autocomplete="one-time-code"` was added to unrelated fields.

Validation:

- Production build passes.
- Targeted lint has no errors/new warnings; the four existing AreaMap/Draft warnings remain.
- `node --experimental-strip-types --test design/quality/refractive/mobile-native.test.ts`: 8 tests pass (tap; swipe/click guard; vertical scroll; second finger; cancellation/lost capture; unrelated pointer; transfer of capture from the image button; mouse/keyboard).
- Portfolio production checker: PASS at 1440x900 and a touch-enabled 390x844 context; zero CLS; sampled scrolling p95 16.7/16.8ms; reduced-motion rAF 0/s. Headless measurements are indicative.
- Browser checks: layer control updates, selectable headline, no horizontal overflow at 320px, mobile screenshot viewer navigation/close, reader dialog fit, and 844x390 landscape overlay clearance with a 44px control bar. `reader-phone.jpg` shows the implemented reader dialog.

Hardware still required: physical iPhone/Android validation of long-press callouts, real pinch behavior, safe-area values, browser chrome and software-keyboard behavior. Desktop emulation and handler tests do not establish those. The keyboard hint is progressive enhancement, not a guarantee across browser versions.
