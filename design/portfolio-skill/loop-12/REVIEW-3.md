# REVIEW-3 — p12-crafted (LENTICULAR), hook rebuilt to aim for a 9

Fresh reviewer, 2026-10-07. Production build at http://127.0.0.1:4173. Judged blind from captures and a live Playwright session before reading the checker report. Facts checked against CONTENT.md and PRODUCT.md. Captures, scripts and logs: `scratchpad/review9/` (anchors/, crafted/, crafted/drive/, crafted/bugs/, crafted/final/).

## Calibration

Scored blind before the draft, from first screens and full pages at 1440×900 and 390×844.

| Anchor | Straight | Proof | Original | Hook | Type+colour | Mine | Recorded |
|---|---|---|---|---|---|---|---|
| `/` (live home) | 8 | 8 | 9 | 8 | 9 | **42** | 43 |
| `/drafts/p12-pro` (ACTUAL SIZE) | 8 | 8 | 8 | 7 | 8 | **39** | 41 |

Both within 2, so no recalibration. I run about one point under the recorded scale (hook on the home: the sun at the visitor's clock is a state the visitor watches, not one they drive; the ACTUAL SIZE ruler is one decision, nothing to repeat). Read the draft's total below as "about one point higher on the recorded scale".

## p12-crafted (LENTICULAR) — 42/50, gate **fail** (one item)

**Straight 8 · Proof 8 · Original 8 · Hook 9 · Type+colour 9**

### Four first-screen answers

**Desktop (1440×900):** who — "Gentrit Rashiti" (masthead, h1 at y 132, 66 px) · what — "builds web and phone apps" (h1; "web" carries the lens underline) · for whom — "for learners, care teams and shoppers" (h1 line 2) · proof — a real Bayyinah TV screen 978×489 at y 360 with the caption "Two real screens in one print: the website and the App Store page", and beside it "Frontend, core team · 2023–26" with Website / App Store / Google Play links. All four inside 900 px, read in order.

**Phone (390×844):** who/what/for whom — the same h1 at 33.65 px, y 120–260 · proof — the print at y 332–588, then "Bayyinah TV … The same web app runs on the website and inside the iPhone and Android apps … Frontend, core team · 2023–26" ending at y 790. All four inside 844 px. No horizontal overflow at 390, 768, 1024, 1280 or 1440.

### Memory sentence

"Drag the Web/Phone switch and every screenshot on the page turns into the phone version of the same product: Gentrit builds both halves."

### Scores with evidence

1. **Straight to the point — 8.** All four answers land in 5 s on both widths, but the eye lands on the 66 px h1 first and the work second, and the lens bar ("Web ● Phone — Showing each product on the web.") is the first line under the masthead, before the claim. That is the 8, not the 9 ("real work is the first thing the eye lands on").
2. **Proof and seniority — 8.** Every lead project states a checkable result: "16 → 2 database requests for one billing report. It no longer times out.", "About 14 releases to both stores.", "About 200 tests, including checks that each team sees only its own data.", "Rebuilt from an empty project, then shipped to the web and both stores." Seniority nouns are thin: "since 2026 also the server", "wrote most of the rules and the checks", "core team". The sizes of change in CONTENT.md (34 routes, 270+ components, 36 components, 805 tokens) appear only once, in the Design System v2 index row.
3. **Original — 8.** I cannot name a site it copies. "The page is one lenticular sheet … one angle for the whole page picks which strips you see" and "each card is drawn as seen from a little to its left, so its right edge already shows a few strips of the second screen" are decisions a designer would notice, and the h1 word that carries the underline moves with the lens. Underneath it is a page-wide two-face compare, which is a known shape (the rubric's own "seam between the old and the new app"), and the rule bends once: the care platform is web-only, so its second face is "one patient" and the lens text has to say "where it has one". A rule that any web-and-phone developer could run is an 8, not "could not exist for another person".
4. **Hook — 9.** One value, driven and visible everywhere. Live evidence: the thumb follows the pointer 1:1 (16 px of pointer → `translateX(16px)`, the card at 6.5° of 9°, every face half-flipped, `C-thumb-half-hold.png`); a hold at 80 % sits at 22.7 px with resistance past the end and snaps to 22 on release; a drag back to 30 % snaps to Web. Any print drags the same value (240 px → 16.5°, release springs to 9° in ~450 ms with 0.05° overshoot; a 60 px flick flips within 100 ms), two prints in view turn together, the six per-print switches drive the same angle, ArrowLeft/Right cut instantly (keyboard never animates). One click changes the h1 underline (web → phone), the lens line, all six prints, six switch labels, the "Web / Phone" tags in the index (10 → 7 highlighted) and the underlined word in About. 60 fps throughout (p95 16.7 ms, no frame ≥ 50 ms); the strips flip in ~170 ms after a ~100 ms onset and the card tilt settles by ~560 ms (`curves.mjs`). Reduced motion cuts in one frame and keeps every state. The 8-to-9 test passes: the value is the viewing angle, it changes every section, and the fact it carries is the one in the h1.
5. **Type and colour — 9.** Bricolage Grotesque 66/26 for display, Public Sans 17/15 for text, one mono at 13 for meta; cream ground rgb(247 239 234); one red, rgb(180 29 2), taken from the lead product and used for the thumb, the moving underline, the links and the 2 px focus ring; a dark plum About. The 1440 first screen (cream, the dark-red print, the red-underlined "web") is a setting I would screenshot. First-screen sizes: 13, 15, 17, 26, 66 (the 12 px arrows are glyphs).

### Beats / loses to

Beats on originality: antfu.me, taniarascia.com, designeer.xyz. Loses to: bruno-simon.com (there the metaphor is the whole navigation; here it is the pictures).

### Is it smooth, does it hurt reading, costume or navigation?

- Smooth to the eye: yes. The mid-frame is an honest lenticular ghost (strips of both screens, `C-thumb-half-hold.png`), gone in ~170 ms on a click and under the pointer's control on a drag. 4× CPU: p95 33 ms, no long frame (headless, indicative).
- Reading: the prints carry a faint vertical ribbing at rest and a few strips of the second face at the right edge; it reads as a print, not as a broken screenshot. Cost to the first five seconds: one control line before the claim.
- Navigation of a fact, not a costume: five of six prints pair a web face with a phone face of the same product (the store page is the web face of a phone app); each pair is labelled with what the face is; the care platform's exception is declared in its caption.

### Facts

Every claim checked against CONTENT.md: the AI line is verbatim; "a team effort … Gentrit laid the foundation" is the owner's wording; "none is live yet" states the rebuild correctly; care screens carry "Real product screens, invented data"; store, archive and site links match; years match the index table. No first person, no he/his/him. One mislabel: "All work" lists 16 of the ~33 projects in CONTENT.md §7b.

### Craft gate

- `check.mjs` (read after scoring): **PASS**, 0 hard fails, 0 warnings at 1440 and 390; template tells 0/0; CLS 0.008/0.004; 0 loops, 0 scroll-linked; durations 180 ms, easing (0.23, 1, 0.32, 1). Noted for the fix list: 10–11 long frames at load (max 953 ms) from six eager 2880×1800 prints; intro p95 33 ms.
- Calm, harmony, responsive, access: pass. Sticky lens bar never covers content; 0 targets under 44 px at 390; no first-screen text under 4.5:1; focus ring 2 px red on every link and both radios via Tab; alt text on every print layer; canvases `aria-hidden`; legends and `role=group` labels present.
- Motion / driven state: **fail.** The release rule on a print snaps the lens from the drag's distance, not from the current angle. In the Phone state a plain click on a print, a 2 px jiggle, a 40 px vertical mouse drag, and every touch scroll that starts on a print all throw the page back to Web (`crafted/bugs/log.txt`, d- and 3- lines; the browser takes the pan, the handler gets the cancel and snaps to 0). On a phone the prints fill most of the viewport width, so the hook undoes itself on nearly every scroll. The checker cannot see this; it only clicks the label.

Gate verdict: not finished until the release rule is fixed. Everything else on the gate passes.

### Total and movement

**42/50** (straight 8, proof 8, original 8, hook 9, type+colour 9), gate fail. Against REVIEW-2's 42 (9/8/8/8/9): hook +1, straight −1, total unchanged on my scale, about 43 on the recorded scale given my calibration offset.

### Does it reach a 9 on hook?

Yes, on the idea and on desktop evidence. The rebuild did what the ladder asks: the angle is one value the visitor drives (thumb, any print, keys, per-print switches), it is visible across the whole page, every section re-reads under it (h1, lens line, six prints, six switches, index tags, About), and it carries the one fact in the h1. The 9 stands on the rubric's own terms. What keeps the page from shipping on it is a gesture defect, not the hook: on the audience's first device the state is lost on scroll. Fix #1 and the 9 is clean; leave it and a phone visitor meets an 8 at best.

### Top 3 remaining fixes

1. **Release rule on prints (gate).** On pointerup snap to the nearest face from the current angle, never from the drag delta; on pointercancel (the browser took a vertical pan) restore the angle at pointerdown; ignore releases under a small movement threshold so a click on a print is a click. Verify on a real phone: set Phone, scroll by thumb over each print, the lens must stay on Phone.
2. **Make the care platform honest to the lens.** Its "phone face" is a different web screen. The owner rule allows phone-width shots of the dashboard for overview screens: use one as the phone face, then drop "Web only, so its second face is one patient" and the lens line's "where it has one". Six of six prints then carry the fact, and original moves toward the 9.
3. **Entry and load frames.** A print entering the viewport by a jump shows a blank beige card for 1–7 frames before its canvas draws (`final/2-reentry-0000.png`, Viva Fresh); paint the current face's image stack under the canvas or draw ahead with a one-viewport rootMargin. At load the six eager 2880×1800 prints cost 10 long frames (max 953 ms): lazy-load and `decode()` the prints below the fold.

Further, in order: (4) move the lens bar below the h1 or into the masthead row so the claim is the first line; (5) rename "All work" to "Selected work" or add the missing rows; (6) no dark scheme (PRODUCT.md asks for light and dark; `H-dark-first.png` is identical to light); (7) check the switch on a mid phone, since 4× CPU gives p95 33 ms against the 20 ms target.

### Should it replace the live home?

Not yet. The hook is now stronger than the home's (a state the visitor drives against a sun the visitor watches), the facts are clean and the type and colour are its equal, but three things would have to be true first. The release rule must be fixed and shown to hold on a real phone, because the audience opens on a phone first and today the signature state does not survive a scroll there. The draft must carry the proof the home carries and it drops: Design System v2 and Incentiv appear only as index rows here while the home gives them a case block each with the 36 / 20 readouts and the public sign-in screen, and the care platform needs a true phone face. And the load and entry frames must be clean on a mid phone (no frame ≥ 50 ms at load, no blank card on entry), with a dark scheme or an owner decision that the page is light-only. With those done, re-score: a gate pass at 42–43 with hook 9 beats the home's 43 on the point that matters, and it should take over then, not before.
