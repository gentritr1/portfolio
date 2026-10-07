# LENTICULAR (p12-crafted)

## Brief

Design Read: Reading this as: a frontend and mobile developer for hiring managers and recruiters, leading with Bayyinah TV (one web app that runs on the website and inside both store apps), in a world of lenticular prints where every picture holds two real screens of one product.

Primary reader: hiring manager or recruiter, on a phone first. Secondary: senior engineer.
After the visit they should: open the Bayyinah TV or care-platform case, or take the CV.
Strongest project for this draft: Bayyinah TV, because it is public and checkable (bayyinahtv.com, App Store, Google Play), and its one engineering fact (the same web app runs on the site and inside the iPhone and Android apps) is exactly what a two-image print can show.
Voice: no person. Owner rules (2026-10-02 to 2026-10-06): no "I", no he/his; no "led", no commit counts; plain English; facts only from CONTENT.md and src/content; no internal counts; public products named and linked; Vianova only on its own rows; no employer/client relation; care and design-system screens captioned "Real product screens, invented data."; the AI line verbatim; "16 → 2" is a proof line, not a headline.
Proof inventory used: Bayyinah TV (web-01 + store-01/02/05, 2023–26, Frontend core team, three public links); care platform (overview + glucose, invented data, 2023–26, 16 → 2, 4 languages); Read to Feed (reading-1 + reading-3, about 14 releases, archived listings); Viva Fresh (grocery-1 + grocery-3, live in both stores); Offday (light + dark calendar, about 200 tests); index lines from projects.ts.
Cannot show: care platform and design system behind login → real product screens on invented data, captioned. Sadaqah app → text only.
Constraints: React 19, motion, 2D canvas (no new dependency, no WebGL needed), local fonts only, light and dark themes (owner decision, fix pass 3), 375–1440.
Memory sentence (target): "The site that is one lenticular sheet: flip Web to Phone (or drag any screenshot) and every product on the page turns from its website to its phone app."

## Direction card

- **id / title:** p12-crafted / LENTICULAR
- **Rule:** The page is one lenticular sheet: every picture holds two real screens of one product, and one lens angle for the whole page, set by the visitor, picks which screen every picture shows (web or phone).
- **Lead project and why:** Bayyinah TV. Public, live in three places, and its key fact (same web app on the site and in both store apps) is a two-face fact.
- **Composition (first-screen.md):** 3, the claim drawn as a picture. The sentence "web and phone apps" sits over one object that holds the web page and the app listing in the same surface. Claim full width on top, the print large below it on the left (8 of 12 columns), the project's facts and the face control in a narrow column on the right. No screen-right/text-left split.
- **First screen:** 1440: masthead (name, place, 4 nav nouns); claim at 64–68px in three lines; print 860×540 holding bayyinahtv.com (A) and the App Store frames (B); right column: Bayyinah TV, one line, the two face labels (bayyinahtv.com / App Store), the fact sentence, role and years, three public links. 390: masthead; claim at 34px in four lines; print 358×300 cropped so both faces show the same headline "Quran Studies Made Simple" at readable size; labels; fact; links.
- **Hook and the fact it carries:** the visitor drives one value, the page lens angle, from the Web/Phone switch under the claim or by dragging any print. Every print sweeps from its web face to its phone face together, the claim's marked word moves from "web" to "phone", and the index re-reads by platform. Fact: Gentrit builds the same products for the web and for phones (Bayyinah TV: the same web app runs on the website and inside the iPhone and Android apps).
- **Delete test:** remove the lens and each print shows its first screen; the second screen's fact is still in the face labels, the captions and the sentence beside each print. Nothing about the person is lost; only the second picture.
- **Type:** display Bricolage Grotesque (opsz auto, 640 weight, 66px at 1440, 34px at 390, tracking −0.032em): a grotesque drawn for print, with ink traps, for a page made of printed cards; its optical-size axis carries the 68px claim and the 22px row results in one family. Text Public Sans 400/600. Outlier: Gentrit Technical Mono (Plex Mono 400) for years, the 16 → 2 line and the lens note.
- **Colour:** ground bone #f7efea (warm, tinted toward Bayyinah's red-brown), ink #1f1518 (sampled from bayyinahtv.com's own ground), accent #b41d02 (sampled from the site's "Start Learning" red), job: which face is showing (the active label), focus ring and link underline, ≤ 5% of any viewport. The prints carry all other colour. The last section uses the ink as its ground.
- **Motion:** one driven state, the page lens angle (0 → 9°). A tap on the switch or on any face label springs the whole page (visualDuration 0.5 s, bounce 0.12); dragging the thumb or any print follows the hand 1:1 and the release hands the hand's velocity to spring.snap; every print sweeps from the edge that turns away, and each lens brings its own sheen (the glints as seen flat on the first screen; the glints at 9° and the lens seams on the second). No peek on load (dropped once the lens became page-wide: nothing plays by itself). Keyboard: arrow keys and Enter jump, no travel. Reduced motion: the same jumps, no travel. The face labels under each print change at once (they follow a hand turning the page); the lens switch's labels and the claim's underline ease over 150 ms; presses 120 ms.
- **Mechanisms earned:** M1 (every picture is a lenticular print), M3 (the optics are computed: interlaced strips under cylindrical lenses, angle per lens), M5 (tilting shows the second screen), M9 (real screens, real links, real place), M11 (interruptible spring, keyboard and reduced-motion branches), M13 (proof as nouns), M15 (canvas 2D, no library, draws only when the angle changes).
- **Risk / what could make it a costume:** a lenticular postcard is a novelty object. It stays honest only because every pair is a real fact about the product (web ⇄ app, team ⇄ one patient, list ⇄ reader, light ⇄ dark), the optics are computed, and the page reads fully without tilting. A sheen that is too strong would read as a scanline filter; keep it faint.

## Engineering of the material (one sentence)

Each print is two real screens cut into interlaced strips under a sheet of 4-pixel cylindrical lenses: for each lens the canvas computes the viewing angle from the one page angle plus that lens's position across the card (seen from a little to the card's left), and that angle picks which strip the lens magnifies, so every card's switch sweeps across it from the edge that turns away, all cards in step; the sheen is the specular reflection of a lamp in each lens's curved surface.

## Four first-screen answers (read off the captures, as a stranger)

- **Desktop 1440 (`1440.png`):** who: Gentrit Rashiti (the claim's first words, and the masthead). What: web and phone apps. For whom: learners, care teams and shoppers. Proof: bayyinahtv.com as a real screen at 38% of the screen, "Frontend, core team · 2023–26", links to the website, the App Store and Google Play, and "Kosovo, working remotely".
- **Phone 390 (`390.png`):** the same four, in this order: claim (5 lines at 34px), the print (y ≈ 250–550, the same "Quran Studies Made Simple" headline on both faces), Bayyinah TV, the two face labels, the fact sentence, role and years, and the three public links at the bottom edge of 844.
- **Memory sentence:** "The site where every screenshot is a lenticular card: turn the Bayyinah TV one and bayyinahtv.com becomes the App Store page, with the same headline."

## Result

- Checker (dev server, `--frames 150,400,900 --throttle 4`): PASS, 0 hard fails, 0 warnings, 1 allowed (C17: dev-server LCP behind the draft router's two lazy levels; a production build at 4× CPU paints the largest element at 0.82 s at 1440 and 0.84 s at 390).
- Verified by hand: keyboard Enter on a face label jumps to 14° with no travel; reduced motion jumps; a second click at 40% reverses from where the card is, with its velocity; 320 px has no sideways scroll; scrubbed frames at 0–14° for every print (`scrub-*.png`).
- Draft chunk: 9.0 kB gzip JS + 3.0 kB gzip CSS; no WebGL, no new dependency.

## Polish pass (after the fresh review, 40/50, and the devil's advocate)

Order: facts, gate, clarity, phone, craft. The full list is in `meta.json` under `polish`. In short:

- **Facts.** The hero's bayyinahtv.com face is cropped above the site's own marketing band (owner rule 3), so no product number or testimonial is in the first screen. The Design System v2 line is the owner's. The care row says no new screen is live yet. Bayyinah authorship is "a core frontend team, Gentrit among them". The Offday test line matches CONTENT.
- **Clarity and phone.** A role and location line sits under the claim at every width. The claim is shorter (four lines on a phone). Index links are underlined at rest, and the index is grouped by employer. The phone prints show the app screens, not the store art.
- **Caption decision.** No "drag or tap" instruction, per the hook-line rule. The control teaches itself: a labelled radio pair, the grab cursor, the peek after load, and the resting edge band.
- **Mechanism.** A native radio group (keyboard instant, pointer spring); capture after 5px; flicks hand their velocity to the spring; rubber band at both ends; the print is a named group.
- **Still capture.** Each card is drawn as seen from a little to its left, so its right edge shows a thin band of the second screen's strips at rest. Seams appear only while it turns. The second face rests at 9° instead of 14°. The hero peeks once (website → App Store → website) instead of starting on the App Store face.
- **Checker.** Dev with frames, throttle and `--interact`: PASS, 0 warnings, C17 allowed. Production at 4×: PASS, 0 warnings, CLS 0, LCP 0.68–0.82 s.

## To a 9: one page-wide lens (owner request)

### The driven value

**The page lens angle**, one number for the whole page: 0 = every print's first face (the web), 1 = every print's second face (the phone, where the product has one). In code it is one spring value θ = angle × 9° (`useTilt` in `Print.tsx`, created once in `Draft.tsx`); every print's renderer reads the same θ, and a face store outside React (`useSyncExternalStore`) tells labels, the claim and the index which face is past halfway, so a flip never re-renders the page. Three things write it: the Web/Phone switch, a drag or flick on any print, and any print's own face labels.

### Every section it changes

1. **Lens bar** (under the claim, then stuck to the top): the switch thumb follows the angle; the live line reads "Showing each product on the web." or "Showing each product on a phone, where it has one." (`aria-live="polite"`).
2. **Claim:** the red underline moves from "web" to "phone" in "builds web and phone apps".
3. **Hero, Bayyinah TV:** bayyinahtv.com ⇄ the App Store page (four store frames); labels bayyinahtv.com / App Store.
4. **Rebuilt section, bayyinah.org:** desktop ⇄ phone; labels Desktop / Phone.
5. **Care platform:** the care team's overview ⇄ one patient's glucose screen; labels Care team / One patient. The platform has no phone face, and the caption says so: "Web only, so its second face is one patient."
6. **Phone apps, Read to Feed and Viva Fresh:** the store page ⇄ the app screen; labels Store page / App.
7. **Offday:** the website ⇄ the same web app on a phone; labels Website / Phone.
8. **More work index:** every row carries a plain platform tag (Web, Phone, or Web, phone); the tags that match the current face are marked, so the index re-reads as "what runs on the web" or "what runs on a phone". It is a tag in the role cell, not a column or a lane.
9. **About:** the underline in its lede moves from "web" to "phone".

Every print is the same sheet: at any instant all prints sit at the same angle and sweep from the same side. A still taken mid-turn shows several prints half-way through (`pagescrub` captures of the phones row and of bayyinah.org + care at 390).

### The control and why

- **One switch: Web [thumb] Phone**, a native radio group with a draggable track between the two labels. Tap either label or the track to flip (spring); drag the thumb and the whole page follows the finger (22 px of travel = 9°, rubber band past both ends, release hands the velocity to the spring); arrow keys and Enter step instantly; one Tab stop with a visible ring. The labels are plain words, so it teaches itself: a switch between "Web" and "Phone" next to a claim that says "web and phone apps". No instruction line.
- **Where: under the claim, then sticky, at every width** (fix pass 3; first it sat above the claim, and the reviewer docked straight-to-the-point for it). The eye reads claim → switch → work; once the visitor scrolls past it, the 48 px bar stays at the top on a solid ground, with a hairline only while it is stuck (no blur, no shadow, no call to action). Top, not bottom: the bottom of a phone screen belongs to the browser's toolbar and the thumb's scroll, and a bottom bar would sit over the links under each print. The bar is in the flow on the first screen (nothing under it at load), and while scrolling it covers only the top 48 px; the shell's `scroll-padding-top` keeps anchor targets clear of it. On a phone the bar holds the switch alone; the live line is still read to screen readers and the face shows in the switch, the claim and every label.
- **Prints drive it too.** Dragging any print sideways turns the whole page (120 px = 9°). The sweep always starts at the edge that turns away. A tap on a print does nothing (fix pass 3, below): the switch and the labels are the click targets.
- **Peek dropped.** A page-wide peek would move every print at load (M11 counted 5 elements). The switch is visible from the first frame, so the peek is not needed to teach.
- **Reduced motion:** no peek and no spring: a tap on the switch, a label or a key jumps the page to the other face; a drag still follows the hand (it is the visitor's own motion) and jumps to the nearest face on release.
- **In-page jumps are instant.** The shell's smooth scroll is switched off while the draft is open: it glided 5000 px past every print, and full-page captures were taken mid-glide with the lens bar halfway down the hero.

### Performance (after the bounded performance pass)

Target: dragging at 4× CPU on the production build, with the hero alone and with a second print in view: p95 frame ≤ 20 ms, no long animation frame ≥ 50 ms, the same look at rest and mid-turn. Measured headless (software raster and compositing), dragging a print 130 px right and back twice (about 4.5 s, 300+ frames), several runs each, the build before the pass (71c0cc7) against the build after it, in the same time window:

| Scene | Before: p50 / p95 / max, frames > 20 ms, long frames ≥ 50 ms | After |
|---|---|---|
| 1440, hero | 16.7 / 33–50 / 67–83 ms, 24%, 0–1 per run | 16.7 / 16.8 / 33–50 ms, 1%, none |
| 1440, hero + bayyinah.org | 17–33 / 67 / 83–100 ms, 50%, 3–5 per run | 16.7 / 16.7–16.8 / 33–67 ms, 2–3%, one 51 ms frame in 1 of 3 runs |
| 390, hero | 16.7 / 17–33 / 67 ms, 4–6%, 2 per run | 16.7 / 16.7–16.8 / 33 ms, under 1%, none |
| 390, bayyinah.org + care | 16.7 / 33–50 / 67–83 ms, 25%, 0–2 per run | 16.7 / 16.8 / 33 ms, 1–2%, none in the final 3 runs (one 139 ms outlier in 1 of 10 runs across the last two builds) |
| 1440, two prints, spring from a tap | p95 50 ms, 23% over 20 ms | p95 16.7–16.8 ms, 2–5% |
| 1440, two prints, dragging the switch | (not measured before) | p95 16.8 ms, max 33 ms, none |

What changed, in the order measured:

1. **Only lenses that changed are drawn.** Each print keeps the cut each lens last showed (to 1/8 px); a frame draws only the band of lenses whose cut moved. A band is three bounded blits: face B, then a one-row mask stretched down the band with `destination-out`, then face A behind with `destination-over`. The old clip of a hundred thin rectangles cost 10–15 ms per canvas at 4×; the mask costs about 4.5 ms; a plain blit about 2 ms.
2. **The sheen is printed into the two screens once.** A carries the glints as seen flat; B the glints as seen at 9° and the lens seams. Nothing but lens bands changes during a turn. Measured and rejected on the way: a separate 14-row sheen canvas updated each frame (any canvas update stretched over the card cost a frame in three at 4×), and three static sheen layers cross-faded by opacity (each stretched overlay is a full perspective quad for the software compositor: p50 33 ms).
3. **The turning card no longer clips.** After the lens has faded in, the card drops `overflow: hidden` and its radius: the corners are cut into the screens' pixels, and the plain pictures under the lens are clipped away with `clip-path: inset(50%)` (still in the accessibility tree). A clipped card, or a CSS radius on the canvas, forces an offscreen pass every frame.
4. **One draw per frame,** in motion's render step, at the angle the frame ends on; never from `pointermove`.
5. **Only cards in view turn.** Each print has its own turn value that follows the page angle while the card is in view; a card within a quarter screen of the view catches up before it shows.
6. **The flip frame is short.** The face marks are set on the two dozen elements that show them, not on the page root; marks out of view (index tags, About) and the fallback's stacking wait for an idle moment; the twelve face labels under the prints change at once instead of easing (28 main-thread transitions restyled every frame for 150 ms after each crossing); the switch's thumb has its own layer; the lens bar is not selectable, so a drag on the thumb does no selection work.
7. **Setup in smaller steps:** paint screen A, then its sheen and corners (only the four corner squares are touched), then B, each in its own frame.

Idea 2 (pre-decoded bitmaps at backing size) was already in place; idea 3 (lower resolution while moving) was not needed and would have softened mid-turn stills. Idea 5 (WebGL) was measured first in a bench: in this headless Chrome, WebGL runs on SwiftShader with a readback per frame, and two lens canvases already ran at p50 33 ms, so it was dropped.

The same look: against the build before the pass, rest frames differ by 0.01–0.06 of 255 on average (pixels off by 16 levels or more: under 0.1%: the edge band's B strips now carry B's faint seams, and the corners are antialiased by the canvas, not the compositor). Mid-turn frames differ by 0.2–1.0 of 255 on average, under 0.15% of pixels by 16 levels or more: the seams now show only on lenses that show B, instead of fading in over the whole card, and the glints no longer slide (they moved under 2 px over the whole turn).

Other numbers: load long frames at 4× unchanged from before the pass (the largest are the shell's React mount and router, 130–230 ms); CLS 0.008 at 1440 (font swap), 0–0.004 at 390; draft chunk 11.5 kB gzip JS + 3.9 kB CSS. The checker's own long-frame maximum (about 0.9–1.1 s) is still its in-page DETECT analysis.

Static fallback: each print's first face is a real `<img>` under the canvas; the canvas stays hidden until its first frame is drawn, then fades in over 180 ms. The canvas's rest frame adds the glint and the thin edge band, so the swap is close but not pixel-identical; the fade hides the difference.

### Reviewer fixes

- The hero card is `role="group"` with the name "Bayyinah TV, website and App Store faces" (every print has its own name).
- More work row links are 34 px targets on desktop (pointer: fine), with 4 px row padding; touch keeps 44 px targets.

### Checker (production preview, 4× CPU)

- `node .agents/skills/portfolio-page/scripts/check.mjs http://127.0.0.1:5313/drafts/p12-crafted --name p12-crafted --out <scratch>/perf-click --owner "Gentrit Rashiti" --facts CONTENT.md --throttle 4 --interact "click:.lx-lensctl label:last-of-type" --interact-frames 60,150,300,600` → PASS, 0 hard fails, 0 warnings. 1440: work 38%, 71 words, 5 sizes, CLS 0.008, LCP 0.82 s. 390: work 28%, 65 words, CLS 0, LCP 0.78 s. Frames +60 and +150 ms catch the hero mid-sweep; +300 ms shows the claim's mark on "phone". (After the performance pass; before it: the same verdict, LCP 0.81 / 0.97 s.)
- Same with `--out <scratch>/perf-drag --interact "drag-right:.lx-hero .lx-card"` → PASS, 0 hard fails, 0 warnings (CLS 0.008 / 0.004, LCP 0.76 / 0.76 s). Frames +60 and +150 ms show the hand-driven sweep; +300 and +600 ms the page on its phone face.
- C17 allowed (LCP on a shared machine ranged 0.72–1.14 s across runs; the page's own code is under 11 kB gzip).
- Full-page captures (`*-full.png`) show the lens bar in its place at both widths since in-page jumps are instant; before that fix, 5 of 6 full captures caught the shell's smooth scroll mid-glide.

## Fix pass 3 (after REVIEW-3: 42/50, hook 9, craft gate failed on one bug)

### 1. The release rule (the gate)

The bug: in the Phone state a plain click on a print, a 2 px jiggle, a vertical mouse drag and every touch scroll that started on a print threw the page back to Web. A tap on a print toggled the page, and on `pointercancel` (the browser taking a vertical pan) the handler read the cancel event's `clientX` (0) as the hand's last position, saw a long fast drag to the left, and snapped to Web.

The fix, one gesture hook (`useLensGesture` in `Print.tsx`) for the prints and the switch track, following `snippets/mechanism.md`:
- A press is undecided until it has moved 6 px (3 px on the 22 px switch track). It becomes a lens drag only if it is mostly sideways (|dx| > 1.5·|dy|); if it moved vertically first it is a page scroll and is ignored to its end. The pointer is captured only once it is a drag; `touch-action: pan-y` stays, so the browser keeps every vertical pan.
- Release: the nearest face from the current angle plus the projected velocity (angle + v·0.2). The velocity is measured up to the release itself, so a hand that stopped and let go hands over nothing.
- `pointercancel`: back to the face the drag started from; a cancel before a drag changes nothing.
- Tap: a print does nothing on a tap (decision: a tap on a picture is a click or the end of a scroll on a phone, never "turn the whole page"); the switch track still flips on a tap (it is a switch), and each label picks its own face (clicking "Web" twice stays on Web).

Gesture test (`scratchpad/loop12/gestures/log.txt`, production build): 20 of 20 pass. In the Phone state at 1440 (mouse): click on the hero print, 2 px jiggle, 160 px vertical drag with a 3 px wobble, and a wheel scroll over the print (the page scrolls 400 px) all stay on Phone; a 60 px flick left goes to Web; drags held still before release land on the nearest face (50 px from Phone → Phone; 80 px → Web; 50 px from Web → Web; 90 px → Phone); a `pointercancel` mid-drag returns to Phone. At 390 (CDP touch): vertical and diagonal touch scrolls starting on the hero and bayyinah.org prints and on the switch track scroll the page and stay on Phone; a tap on a print stays; a 90 px horizontal flick goes to Web. `Input.synthesizeScrollGesture` does not scroll this headless page at all (not even over plain text), so for that case only the state is checked (it stays on Phone).

### 2. Load and entry frames

- Only the hero's pictures are eager (as before); the others are lazy and decoded before the lens draws.
- No blank card: every card carries a tiny copy of both faces (24 px wide WebP, about 250 bytes each, rendered from the print's own pictures by a script, `placeholders.ts`) as its background, the current face's copy showing until its pictures are decoded and the lens is up. A jump to a print far down shows a soft version of the right face, never the empty ground.
- The checker's load long frames (about 1 s) remain its own in-page analysis; the page's own load frames at 4× are the shell's React mount and router (90–170 ms), unchanged.

### 3. First screen: claim → switch → work

The switch moved below the claim and the role line, directly above the hero print; it becomes sticky when reached. The claim is now the first line under the masthead at both widths; the first screen still holds all four answers and the three public links (390: links at y ≈ 820).

### 4. "All work" → "More work"

It lists 15 projects, not all of them. ("Selected work" is on the checker's microcopy list.)

### 5. Dark theme (owner decision)

- Chooses like the site: `html[data-theme]` when set (the site's toggle, stored under `theme`), else `prefers-color-scheme`. Tokens only: the light set on `.lx`, the dark set under `@media (prefers-color-scheme: dark) :root:not([data-theme="light"]) .lx` and `:root[data-theme="dark"] .lx`, each with `color-scheme`.
- Palette, composed in oklch: ground #120d0a (16.5% L, 0.010 C, the bone's own 54° hue); care band #191310 and About #211a16 (+3% L each); ink #efe8e3 (93.5% L); secondary ink #b4a49b (73% L, ground hue); the Bayyinah red lifted 9.5% L with less chroma, #cc4e38, for the underline, thumb, face marks and focus ring (4.3:1 on the ground), and #e57157 for red text on hover (6.3:1); About's links and focus #eb8f72 (7.1:1). Text pairs: ink 15.9:1, secondary ink 8.0:1 on the ground, 7.1:1 on About. Print shadows become a 1 px lightness step and a soft dark drop; the screenshots keep their own colours, and the pre-printed sheen sits on the screenshots, not on the page ground, so it reads the same in both themes (no haze).
- Control: Light ⇄ Dark, the same two-face switch as under each print, in the masthead from 720 px and at the foot of About on a phone (the masthead row is full at 390). It sets the site's attribute and storage key, turns transitions off for the frame it lands in (`html[data-theme-switching]`), and never touches the lens.
- While the draft is open, html, body and every `theme-color` meta take the current ground (#f7efea light, #120d0a dark); all are restored on leaving.

### Checker (production preview, 4× CPU, `--owner "Gentrit Rashiti" --facts CONTENT.md`)

- Light, `--interact "click:.lx-lensctl label:last-of-type" --interact-frames 60,150,300,600`: PASS, 0 fails, 0 warnings (1440: work 37%, CLS 0.008, LCP 0.77 s; 390: work 28%, CLS 0, LCP 0.83 s).
- Light, `--interact "drag-right:.lx-hero .lx-card" --interact-frames 60,150,300,600`: PASS, 0, 0 (CLS 0.008 / 0).
- Dark (`--scheme dark`), click: PASS, 0, 0 (CLS 0.008 / 0.004; C06 sampled 120 / 118 text grounds, none under 4.5:1).
- Dark, drag: PASS, 0, 0 (CLS 0.008 / 0).
- Drag at 4× after the pass: 1440 two prints p95 16.8 ms, 390 two prints p95 16.8 ms, no long frames.
