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
Memory sentence (target): "The site where every screenshot is a lenticular card: tilt the Bayyinah one and the website turns into the App Store app."

## Direction card

- **id / title:** p12-crafted / LENTICULAR
- **Rule:** The page is a stack of lenticular prints: each picture holds two real screens of one product, and the angle of the card picks which one you see.
- **Lead project and why:** Bayyinah TV. Public, live in three places, and its key fact (same web app on the site and in both store apps) is a two-face fact.
- **Composition (first-screen.md):** 3, the claim drawn as a picture. The sentence "web and phone apps" sits over one object that holds the web page and the app listing in the same surface. Claim full width on top, the print large below it on the left (8 of 12 columns), the project's facts and the face control in a narrow column on the right. No screen-right/text-left split.
- **First screen:** 1440: masthead (name, place, 4 nav nouns); claim at 64–68px in three lines; print 860×540 holding bayyinahtv.com (A) and the App Store frames (B); right column: Bayyinah TV, one line, the two face labels (bayyinahtv.com / App Store), the fact sentence, role and years, three public links. 390: masthead; claim at 34px in four lines; print 358×300 cropped so both faces show the same headline "Quran Studies Made Simple" at readable size; labels; fact; links.
- **Hook and the fact it carries:** tilting the hero print turns bayyinahtv.com into the Bayyinah TV App Store listing, with the same headline on both. Fact: the same web app runs on the website and inside the iPhone and Android apps.
- **Delete test:** remove the lens and each print shows its first screen; the second screen's fact is still in the face labels, the captions and the sentence beside each print. Nothing about the person is lost; only the second picture.
- **Type:** display Bricolage Grotesque (opsz auto, 640 weight, 66px at 1440, 34px at 390, tracking −0.032em): a grotesque drawn for print, with ink traps, for a page made of printed cards; its optical-size axis carries the 68px claim and the 22px row results in one family. Text Public Sans 400/600. Outlier: Gentrit Technical Mono (Plex Mono 400) for years, the 16 → 2 line and the lens note.
- **Colour:** ground bone #f7efea (warm, tinted toward Bayyinah's red-brown), ink #1f1518 (sampled from bayyinahtv.com's own ground), accent #b41d02 (sampled from the site's "Start Learning" red), job: which face is showing (the active label), focus ring and link underline, ≤ 5% of any viewport. The prints carry all other colour. The last section uses the ink as its ground.
- **Motion:** the one story moment is the tilt: a pointer click on a face label (or a tap or drag on the print) turns the card on its vertical axis to 14° with a spring (visualDuration 0.5 s, bounce 0.12, settles by about 0.8 s); the flip sweeps across the lens columns from the edge that turns away, and the sheen moves. On load the hero print arrives on its App Store face and settles flat to the website once (the one authored figure; skipped under reduced motion, if the lens is late, or if the visitor touched it). Drag release uses spring.snap with the hand's velocity. Keyboard: instant, no travel. Reduced motion: instant state, no travel. Everything else ≤ 150 ms (press, hover colour, underline).
- **Mechanisms earned:** M1 (every picture is a lenticular print), M3 (the optics are computed: interlaced strips under cylindrical lenses, angle per lens), M5 (tilting shows the second screen), M9 (real screens, real links, real place), M11 (interruptible spring, keyboard and reduced-motion branches), M13 (proof as nouns), M15 (canvas 2D, no library, draws only when the angle changes).
- **Risk / what could make it a costume:** a lenticular postcard is a novelty object. It stays honest only because every pair is a real fact about the product (web ⇄ app, team ⇄ one patient, list ⇄ reader, light ⇄ dark), the optics are computed, and the page reads fully without tilting. A sheen that is too strong would read as a scanline filter; keep it faint.

## Engineering of the material (one sentence)

Each print is two real screens cut into interlaced strips under a sheet of 4-pixel cylindrical lenses: for each lens the canvas computes the angle from the eye to that lens (card tilt plus the lens's distance from the card's centre), and that angle picks which strip the lens magnifies, so the switch sweeps across the card; the sheen is the specular reflection of a lamp in each lens's curved surface.

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
