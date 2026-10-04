# Brief for Astra, round 2: creative, not only loud

Read `CREATIVE-CONSULT.md` in this folder first. It holds the full detail: the creativity checklist (§1), the critique of your 16 drafts (§2), the nine new directions (§3) and the 3D and motion moves (§4). This brief tells you what to do with it.

## 1. Where the gallery stands

The 16 drafts fixed **pale**. Every draft has energy, and the gallery picker works. Keep all 16. Delete nothing.

They did not fix **creative**. Two independent reviews (the owner's art director, and a creative director on Fable 5.1) found the same fault: **12 of 16 drafts sit on one new skeleton.** It has four parts:

- a flood colour;
- a giant "Gentrit Rashiti" in the same grotesk, top left;
- "Frontend & mobile developer, now full stack." under it;
- one screenshot on the right, plus one gimmick.

That is the round-1 fault ("themes on one skeleton") again, but louder. Seven drafts are **costumes**: if you remove the metaphor, a list remains. These are studio, blueprint, orbit, desktop, primetime, desk and canvas.

Your self-scores sit in a 0.24 band (7.95–8.19). The independent Creativity scores spread from 5.5 to 7.5, and none reaches 8. A jury that cannot separate 16 drafts scored the feature list, not the captures.

## 2. New law for every draft (old and new)

1. **One rule for each draft.** Write it on the first line of `meta.json` as a short phrase, for example "the seam", "the grid" or "the discs". Remove every element that does not obey the rule.
2. **The metaphor must be the navigation** (test M2): delete the metaphor, and the site must stop working. If the site still works, the metaphor is a costume.
3. **No giant name.** The name stays below 10 % of the viewport height. It can be a row, a tab, a stamp or a chip rack.
4. **No shared display face.** Each draft has its own type pairing. The shared grotesk is never the display face.
5. **The owner's real material goes in the first viewport**: the live recreations, FJALË, Morse timing, EN/AR, the parity tests, the barcode scanner. Do not hide it on the case page.
6. **The slop count must be 2 or less.** Count the markers from the checklist in `CREATIVE-CONSULT.md` §1.2, and record the count in `DRAFTS.md`.

## 3. Part A: fix the defects in the drafts you have

Do the defects only. Do not run new repair rounds on the costumes: a repaired costume is still a costume.

- **wall:**
  - On first load, the tiles show only names on flat colour for several seconds before the images come. Show the image (or its dithered version) at once.
  - "Dukagjini Bookstore" breaks in the middle of the word ("Dukagji / ni / Bookstore"). Use `hyphens: auto` with `lang`, or shrink the type to fit. Never break a word without a hyphen.
- **hybrid:** the screenshot-filled active name is not legible ("Bayyinah TV" becomes noise). Use solid ink, with the image inside the letters only when contrast is at least 4.5:1, or drop the effect.
- **Every draft:** re-score Creativity from the captures with a fresh reviewer. Use the `CREATIVE-CONSULT.md` §1.1 mechanisms (M1–M11) as the rubric, and record which mechanisms the draft really uses.

## 4. Part B: build the new directions

All specs are in `CREATIVE-CONSULT.md` §3: first viewport, type, colour, signature interaction, signature animation, 5-second recruiter path, risk. Build them as `/drafts/<id>`, in this order:

| Order | Id | Band | The rule | Notes |
|---|---|---|---|---|
| 1 | `diff` | Professional | the migration seam | No WebGL. Scroll-timeline seam with zero JS in the fallback. |
| 2 | `fjalekryq` | Fun / Professional | the crossword is the site map | Hand-rolled verlet letters, about 3 kB. No physics library. |
| 3 | `linja` | Crafted / Experimental | the flip-disc board | OGL instanced discs, Morse key, WebAudio flips. **The Site-of-the-Day candidate: give it the most care.** |
| 4 | `bitrate` | Crafted | the quality menu renders the whole site | The career scrubber covers 2021–2026. |
| 5 | `aisle` | Fun | scan to basket; the receipt is the CV | A real 80 mm print stylesheet. |
| 6 | `facing-pages` | Crafted | the bilingual book | Page-curl shader, live reflow, RTL flip. |
| 7 | `ledger` | Professional | 28 dense rows, each one live | One mono face. 60 fps across 28 cells is the work. |
| 8 | `deal` | Fun | physics cards from Za! | Must not block page scroll on touch. |
| 9 | `lap` | Experimental | the project names are the track | Only after `linja` meets its budget. High risk. |

Build order inside the list: finish 1–5 before you start 6–9.

## 5. Part C: 3D and motion beyond the usual

The owner wants 3D and motion that go further than what portfolios usually do. Use `CREATIVE-CONSULT.md` §4 (17 moves). Two jobs:

1. **Use the moves in the new drafts where the spec names them.** Examples:
   - `linja`: moves 3, 4 and 5;
   - `facing-pages`: move 8;
   - `bitrate`: moves 9 and 15;
   - `fjalekryq`: move 6;
   - `diff`: move 11;
   - `lap`: moves 7 and 14.
2. **Build `/drafts/lab`**: one small live demo of each of the 17 moves, each in its own tile, each with a one-line description and its gzip size. The owner can then pick moves to combine later. Each tile lazy-loads, pauses offscreen, and has a reduced-motion state.

Do not use the 3D moves to dress up a costume draft. Each move must serve the draft's rule.

## 6. The jury, made stricter

- Score from the **captures**, desktop 1440 px and phone 375 px, with a **fresh reviewer** that did not build the draft.
- The scale is unchanged: 7 = a good personal site, 8 = distinctive, 9 = Site of the Day.
- **A spread is required.** If three or more drafts score within 0.2 of each other on Creativity, the reviewer scores again and must state what separates them.
- Gates before any score:
  - the anti-pale check (`ASTRA-DRAFTS-BRIEF.md` §2);
  - the slop count of 2 or less;
  - the M2 test, for any draft with a metaphor.
- Stop after 3 rounds for each draft. Record what holds it back. The gallery matters more than one perfect draft.
- In `DRAFTS.md`, add these columns: rule, mechanisms used (M-numbers), slop count.

## 7. Facts and constraints (unchanged, plus one)

- Facts only from `../../CONTENT.md`. The numbers in the consult were checked against it: 31 ADRs, 16 → 2 queries, 34 routes, Za! 2–8 players, server-authoritative, Morse Trainer with Farnsworth timing, Futurisma's weather, tide and day-night systems.
- **New:** do not name a city. `CONTENT.md` says "Kosovo" only. For sun or time-of-day effects, use Kosovo local time and a Kosovo coordinate. The text on the page says "Kosovo".
- The care platform is shown only as a recreation with invented data, labelled as such. The `diff` draft shows the migration through project rows and parity rows, never through real screens.
- Public screenshots only. Neutral voice. Sound is off by default, and the setting persists. Every interaction has a keyboard path. Each draft has a reduced-motion state and a no-WebGL state.
- Budgets: the main entry does not grow; each draft's lazy chunk is 150 kB gzip or less; 60 fps on a mid-range phone is the target. Prefer OGL or a hand-built renderer; three.js alone is about 150 kB gzip.
- Work on your branch. Commit each draft on its own. **Do not push.**

## 8. Done means

- Part A defects fixed, and all 16 drafts re-scored with the new columns.
- Drafts 1–5 built, scored and in the picker; 6–9 built where the budget allows, each recorded honestly.
- `/drafts/lab` shows the 17 moves.
- The build passes, and `DRAFTS.md` is updated.
