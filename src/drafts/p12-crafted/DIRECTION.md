# LENTICULAR (p12-crafted)

## Brief

Design Read: Reading this as: a frontend and mobile developer for hiring managers and recruiters, leading with Bayyinah TV (one web app that runs on the website and inside both store apps), in a world of lenticular prints where every picture holds two real screens of one product.

Primary reader: hiring manager or recruiter, on a phone first. Secondary: senior engineer.
After the visit they should: open the Bayyinah TV or care-platform case, or take the CV.
Strongest project for this draft: Bayyinah TV, because it is public and checkable (bayyinahtv.com, App Store, Google Play), and its one engineering fact (the same web app runs on the site and inside the iPhone and Android apps) is exactly what a two-image print can show.
Voice: no person. Owner rules (2026-10-02 to 2026-10-06): no "I", no he/his; no "led", no commit counts; plain English; facts only from CONTENT.md and src/content; no internal counts; public products named and linked; Vianova only on its own rows; no employer/client relation; care and design-system screens captioned "Real product screens, invented data."; the AI line verbatim; "16 → 2" is a proof line, not a headline.
Proof inventory used: Bayyinah TV (web-01 + store-01/02/05, 2023–26, Frontend core team, three public links); care platform (overview + glucose, invented data, 2023–26, 16 → 2, 4 languages); Read to Feed (reading-1 + reading-3, about 14 releases, archived listings); Viva Fresh (grocery-1 + grocery-3, live in both stores); Offday (light + dark calendar, about 200 tests); index lines from projects.ts.
Cannot show: care platform and design system behind login → real product screens on invented data, captioned. Sadaqah app → text only.
Constraints: React 19, motion, 2D canvas (no new dependency, no WebGL needed), local fonts only, one light theme, 375–1440.
Memory sentence (target): "The site that is one lenticular sheet: flip Web to Phone (or drag any screenshot) and every product on the page turns from its website to its phone app."

## Direction card

- **id / title:** p12-crafted / LENTICULAR
- **Rule:** The page is one lenticular sheet: every picture holds two real screens of one product, and one lens angle for the whole page, set by the visitor, picks which screen every picture shows (web or phone).
- **Lead project and why:** Bayyinah TV. Public, live in three places, and its key fact (same web app on the site and in both store apps) is a two-face fact.
- **Composition (first-screen.md):** 3, the claim drawn as a picture. The sentence "web and phone apps" sits over one object that holds the web page and the app listing in the same surface. Claim full width on top, the print large below it on the left (8 of 12 columns), the project's facts and the face control in a narrow column on the right. No screen-right/text-left split.
- **First screen:** 1440: masthead (name, place, 4 nav nouns); claim at 64–68px in three lines; print 860×540 holding bayyinahtv.com (A) and the App Store frames (B); right column: Bayyinah TV, one line, the two face labels (bayyinahtv.com / App Store), the fact sentence, role and years, three public links. 390: masthead; claim at 34px in four lines; print 358×300 cropped so both faces show the same headline "Quran Studies Made Simple" at readable size; labels; fact; links.
- **Hook and the fact it carries:** the visitor drives one value, the page lens angle, from the Web/Phone switch under the masthead or by dragging any print. Every print sweeps from its web face to its phone face together, the claim's marked word moves from "web" to "phone", and the index re-reads by platform. Fact: Gentrit builds the same products for the web and for phones (Bayyinah TV: the same web app runs on the website and inside the iPhone and Android apps).
- **Delete test:** remove the lens and each print shows its first screen; the second screen's fact is still in the face labels, the captions and the sentence beside each print. Nothing about the person is lost; only the second picture.
- **Type:** display Bricolage Grotesque (opsz auto, 640 weight, 66px at 1440, 34px at 390, tracking −0.032em): a grotesque drawn for print, with ink traps, for a page made of printed cards; its optical-size axis carries the 68px claim and the 22px row results in one family. Text Public Sans 400/600. Outlier: Gentrit Technical Mono (Plex Mono 400) for years, the 16 → 2 line and the lens note.
- **Colour:** ground bone #f7efea (warm, tinted toward Bayyinah's red-brown), ink #1f1518 (sampled from bayyinahtv.com's own ground), accent #b41d02 (sampled from the site's "Start Learning" red), job: which face is showing (the active label), focus ring and link underline, ≤ 5% of any viewport. The prints carry all other colour. The last section uses the ink as its ground.
- **Motion:** one driven state, the page lens angle (0 → 9°). A tap on the switch or on any face label springs the whole page (visualDuration 0.5 s, bounce 0.12); dragging the thumb or any print follows the hand 1:1 and the release hands the hand's velocity to spring.snap; every print sweeps from the edge that turns away and its sheen moves. No peek on load (dropped once the lens became page-wide: nothing plays by itself). Keyboard: arrow keys and Enter jump, no travel. Reduced motion: the same jumps, no travel. Everything else ≤ 150 ms (press, label colour, underline).
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

1. **Lens bar** (under the masthead): the switch thumb follows the angle; the live line reads "Showing each product on the web." or "Showing each product on a phone, where it has one." (`aria-live="polite"`).
2. **Claim:** the red underline moves from "web" to "phone" in "builds web and phone apps".
3. **Hero, Bayyinah TV:** bayyinahtv.com ⇄ the App Store page (four store frames); labels bayyinahtv.com / App Store.
4. **Rebuilt section, bayyinah.org:** desktop ⇄ phone; labels Desktop / Phone.
5. **Care platform:** the care team's overview ⇄ one patient's glucose screen; labels Care team / One patient. The platform has no phone face, and the caption says so: "Web only, so its second face is one patient."
6. **Phone apps, Read to Feed and Viva Fresh:** the store page ⇄ the app screen; labels Store page / App.
7. **Offday:** the website ⇄ the same web app on a phone; labels Website / Phone.
8. **All work index:** every row carries a plain platform tag (Web, Phone, or Web, phone); the tags that match the current face are marked, so the index re-reads as "what runs on the web" or "what runs on a phone". It is a tag in the role cell, not a column or a lane.
9. **About:** the underline in its lede moves from "web" to "phone".

Every print is the same sheet: at any instant all prints sit at the same angle and sweep from the same side. A still taken mid-turn shows several prints half-way through (`pagescrub` captures of the phones row and of bayyinah.org + care at 390).

### The control and why

- **One switch: Web [thumb] Phone**, a native radio group with a draggable track between the two labels. Tap either label or the track to flip (spring); drag the thumb and the whole page follows the finger (22 px of travel = 9°, rubber band past both ends, release hands the velocity to the spring); arrow keys and Enter step instantly; one Tab stop with a visible ring. The labels are plain words, so it teaches itself: a switch between "Web" and "Phone" next to a claim that says "web and phone apps". No instruction line.
- **Where: a sticky lens bar under the masthead, at every width.** The masthead scrolls away; the 48 px bar stays at the top on a solid ground with one hairline (no blur, no shadow, no call to action). Top, not bottom: the bottom of a phone screen belongs to the browser's toolbar and the thumb's scroll, and a bottom bar would sit over the links under each print. The bar is in the flow on the first screen (nothing under it at load), and while scrolling it covers only the top 48 px; the shell's `scroll-padding-top` keeps anchor targets clear of it. On a phone the bar holds the switch alone; the live line is still read to screen readers and the face shows in the switch, the claim and every label.
- **Prints drive it too.** Dragging any print turns the whole page (capture after 5 px, 120 px = 9°); a tap on a print toggles. The sweep always starts at the edge that turns away.
- **Peek dropped.** A page-wide peek would move every print at load (M11 counted 5 elements). The switch is visible from the first frame, so the peek is not needed to teach.
- **Reduced motion:** no peek and no spring: a tap, a label or a key jumps the page to the other face; a drag still follows the hand (it is the visitor's own motion) and jumps to the nearest face on release.
- **In-page jumps are instant.** The shell's smooth scroll is switched off while the draft is open: it glided 5000 px past every print, and full-page captures were taken mid-glide with the lens bar halfway down the hero.

### Performance

- Only prints in view render on a frame (IntersectionObserver); a print off screen is marked dirty and draws once, at the current angle, when it enters. Prints build their bitmaps when within 60% of a screen of the view.
- Each frame per print: one mask row → clip runs, two blits (face A, then face B through the clip), one 14-row overlay for glints and seams stretched over the card. Shadows are static CSS. The setup paints across separate frames.
- Measured at 4× CPU on the production build, headless (software raster, machine shared with other checkers), dragging the switch with the hero and one more print in view: p50 16.7 ms; p95 33–50 ms with one print, 50–67 ms with two; a few frames 51–65 ms. **Not a clean 60 fps at 4× in headless**; unthrottled it holds 16.7 ms.
- Long frames: on load at 4×, 50–255 ms (React mount, the router, image decode, lens setup); 53–132 ms when the window is resized (every visible print rebuilds); none during my scroll walk. The checker's own maximum (1.0–1.3 s) is its DETECT analysis running in the page: an instrumented copy of the checker put the long frame at 3.7–4.0 s, exactly inside DETECT (3.7–5.0 s).
- CLS 0 at 390 (0.004 in one run); 0.008 at 1440 from the display font's swap (a size-adjusted fallback measured on the claim keeps the lines; the last 0.008 is the underline's text box).
- Static fallback: each print's first face is a real `<img>` under the canvas; the canvas stays hidden until its first frame is drawn, then fades in over 180 ms. The canvas's rest frame adds the glint and the thin edge band, so the swap is close but not pixel-identical; the fade hides the difference.

### Reviewer fixes

- The hero card is `role="group"` with the name "Bayyinah TV, website and App Store faces" (every print has its own name).
- All work row links are 34 px targets on desktop (pointer: fine), with 4 px row padding; touch keeps 44 px targets.

### Checker (production preview, 4× CPU)

- `node .agents/skills/portfolio-page/scripts/check.mjs http://127.0.0.1:5313/drafts/p12-crafted --name p12-crafted --out <scratch>/crafted9-final --owner "Gentrit Rashiti" --facts CONTENT.md --throttle 4 --interact "click:.lx-lensctl label:last-of-type" --interact-frames 60,150,300,600` → PASS, 0 hard fails, 0 warnings. 1440: work 38%, 71 words, 5 sizes, CLS 0.008, LCP 0.81 s. 390: work 28%, 65 words, CLS 0, LCP 0.97 s. Frames +60 and +150 ms catch the hero mid-sweep; +300 ms shows the claim's mark on "phone".
- Same with `--out <scratch>/crafted9-final-drag --interact "drag-right:.lx-hero .lx-card"` → PASS, 0 hard fails, 0 warnings (CLS 0.008 / 0.004, LCP 0.85 / 0.87 s). Frames +60 and +150 ms show the hand-driven sweep; +300 and +600 ms the page on its phone face.
- C17 allowed (LCP on a shared machine ranged 0.72–1.14 s across runs; the page's own code is under 11 kB gzip).
- Full-page captures (`*-full.png`) show the lens bar in its place under the masthead at both widths since in-page jumps are instant; before that fix, 5 of 6 full captures caught the shell's smooth scroll mid-glide.
