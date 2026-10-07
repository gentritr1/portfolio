---
name: portfolio-page
description: Use when designing, writing, building, critiquing or checking a personal portfolio site or any of its pages (home, work index, case study, about, 404) for a developer, design engineer or designer. Covers the first screen (who, what, proof, work), hero copy, project rows and case-study writing, screenshots, type and colour choices, layout, signature motion and smoothness, the AI-template tells to remove (pill above the hero title, gradient text, faint card borders, glass, glow, stat rows, fade-up everything), a scripted checker, and a calibrated review rubric for iterating many drafts. Not for product landing pages or app UI; use impeccable for those.
metadata:
  version: 1.0.0
---

# portfolio-page

A portfolio is read by a stranger who decides in seconds whether to keep reading, and then judges one project in a few minutes. This skill turns that into rules you can test. It merges four design skills (impeccable, ui-ux-pro-max, taste-skill, Emil Kowalski's design-engineering skills) with research on hiring reviews, award-level portfolios and motion. Where those sources conflict, this skill has already picked a side; follow it.

## The bar

A visitor, on a phone, with no context:

- **in 5 seconds** can answer four questions: who is this, what do they build, for whom, where is the proof;
- **in 60 seconds** has seen real work and one problem the person solved, with their scope stated;
- **a week later** can describe one specific moment of the site in one sentence.

Everything below serves those three lines. A page that is beautiful and fails the first line has failed.

## Modes

- **Experience** (home, work index): the work leads from the first viewport; the interface recedes. One idea per screen.
- **Read** (case study, about): a calm column for reading, 60–75 characters wide, with the work at full size beside or between the text.

## Setup (every time)

1. Read the project's own truth first, if it exists: `PRODUCT.md`, `CONTENT.md` (facts, numbers, owner rules), `DESIGN.md`, and any brief or loop file the user names. **Owner rules beat this skill** (voice, banned words, what may be shown). Facts come only from those files; never invent a number, a client, a quote or a screen.
2. Write the **Design Read** in one line before any design work: `Reading this as: <who> for <which reader>, leading with <which work>, in <which rule/world>.` Example: `Reading this as: a web and mobile developer for hiring managers, leading with a live grocery app, in a world where every screen is a real store listing.`
3. Load the reference for the task (table below). Load `reference/anti-slop.md` before writing any UI code.

## Commands

| Command | Use it to | Reference |
|---|---|---|
| `brief` | Collect audience, proof inventory, owner rules, constraints | [reference/brief.md](reference/brief.md) |
| `direct` | Choose a direction: one rule, one hook, type, colour, the motion moment; or generate several distinct directions for a round | [reference/directions.md](reference/directions.md) |
| `hero` | Design and write the first screen | [reference/first-screen.md](reference/first-screen.md) |
| `write` | Write identity, rows, case studies, captions, microcopy | [reference/writing.md](reference/writing.md) |
| `work` | Order projects, pick and crop screens, build the index and case layout | [reference/work-display.md](reference/work-display.md) |
| `visual` | Type, colour, layout, spacing | [reference/visual.md](reference/visual.md) |
| `motion` | Pick and build the one signature moment; tune smoothness | [reference/motion.md](reference/motion.md) |
| `check` | Run the scripted checker and fix every hard fail | [scripts/check.mjs](scripts/check.mjs), [reference/anti-slop.md](reference/anti-slop.md) |
| `review` | Score a draft (or a round of drafts) with a fresh reviewer | [reference/review.md](reference/review.md) |
| `polish` | Fix the review's defect list in bounded passes | [reference/review.md](reference/review.md) §Polish |

A plain request ("make me a portfolio", "redo the home page") runs: `brief` → `direct` → `hero` + `write` → `work` + `visual` → build → `motion` → `check` → `review` → `polish` (at most two passes).

## Hard rules

These are gates. A draft that breaks one is not finished, whatever it scores.

1. **Work in the first screen.** At 1440×900 and 390×844 a real piece of work (a product screen, a live demo, a playable piece) fills at least 15% (desktop) / 12% (phone) of the first screen. Words alone never prove craft.
2. **The claim, not the name, is the largest text.** The identity sentence (≤ 20 words, one concrete verb, names the thing built and the people it is for, no adjective about the author) is the biggest type, or the name sits inside it. Never a giant name over a grey subtitle.
3. **Proof is a noun.** Credibility on the first screen is a place, a year range, a count, a store, a named product. Zero self-ratings (passionate, pixel-perfect, crafting).
4. **No template tells.** Zero hard fails from `scripts/check.mjs` (pill eyebrow above the hero title, gradient text, faint rounded 1px card borders on 3+ boxes, glass panels, purple/indigo gradients, blurred blobs, stat-counter rows with "+", icon tiles, logo marquee, pulsing status dot, template phrases). The full list with fixes is in `reference/anti-slop.md`.
5. **Facts only.** Every number, name and screen traces to a source file or a public URL. Recreations and invented data are labelled in the caption.
6. **Scope stated.** Each project says what the person built and what others built. Never "worked on", "helped with", "involved in".
7. **One voice** across the site (first person, or no person). Never a mix; never third person about yourself unless the owner asks for it.
8. **One hook per page**, and it carries a fact. Delete it: every fact must still be on the page. If the site stops working, it was the navigation (fine); if nothing is lost, it was a costume (remove or make it carry a fact).
9. **Motion is caused.** Every animation answers a visitor action, shows where something came from or went, or paces one story beat. UI motion ≤ 300 ms, one story moment ≤ 800 ms. Keyboard and repeated actions do not animate. No fade-up on every section; content is visible without the animation.
10. **Reduced motion keeps every state and drops travel.** Loops stop. Nothing is hidden.
11. **Readable everywhere.** Body ≥ 16px, contrast 4.5:1 (3:1 for ≥ 24px), measure 45–75ch, targets ≥ 24px (44px on touch), no sideways scroll at 320px, visible focus, CLS < 0.02.
12. **Sharp work.** Screenshots are never shown larger than their pixels; 2× density for anything wider than 160px; every image has width/height and alt text that names the screen.
13. **Typeface chosen, not defaulted.** Inter, Geist, system-ui, Roboto, Poppins, Space Grotesk, DM Sans, Plus Jakarta, Fraunces, Playfair and the rest of the reflex list in `reference/visual.md` may be used only with a written reason tied to the person or the work.
14. **Colour has a source.** The palette comes from the work, the place or the person's material, with one interaction accent. No default Tailwind slate/zinc + indigo.
15. **Budget.** First readable frame ≤ 1 s on a mid phone; any WebGL or heavy hook is lazy, ≤ 150 kB gzip, pauses offscreen and has a static fallback.

## How to verify (always, before saying a draft is done)

1. Build and serve the page. Run `node <skill-dir>/scripts/check.mjs <url> --out <dir>` (Playwright + Chromium; it finds `/opt/pw-browsers/chromium` or set `CHROMIUM_PATH`). It writes `report.md`, first-screen captures at 1440 and 390, reduced-motion captures, full-page captures and `sheet.png`. Exit code 1 means a hard fail. Options: `--mode read` for case and about pages (higher word budget), `--frames 120,320,700` for mid-animation captures, `--throttle 4` for a 4× slower CPU, `--allow "T06=reason"` for a deliberate exception (or a `<meta name="portfolio-check" content="allow T06: reason">` on the page). Mark live demos with `data-work` so they count as work.
2. Fix every `✗`. For each `△`, fix it or write one line on why it stays (in the draft's notes).
3. **Look at the captures yourself.** The checker cannot judge taste, hierarchy, crop quality or whether the hook works. Read `sheet.png` and both full-page captures. Then answer the bar's three lines in writing.
4. For the signature moment, capture mid-animation frames (`--frames 120,320,700` or pause `document.getAnimations()`), not just end states.
5. For a round of drafts, a **fresh reviewer** with no build history scores them (`reference/review.md`). Builders over-score originality by 1.5–2 points.

Stop after two polish passes. More passes polish the costume, not the idea.

## Output contract for a draft

Every draft (or page) ships with a short record, in its meta or notes:

- `designRead` (the one line), `rule` (the one rule the page obeys), `hook` (the moment, as the one sentence a visitor would say), `lead` (which project leads, and why it is the strongest).
- Type (faces, sizes on the first screen) and colour (ground, ink, accent, source of colour).
- `check`: hard fails 0, warnings with reasons.
- Self-score on the review rubric and the lowest point with the reason (`holdback`).

## Handoffs

- Product landing pages, dashboards, app UI: impeccable.
- Deep motion work on a component (drawers, toasts, gestures): Emil Kowalski's `emil-design-eng` / `review-animations` if installed; this skill's `reference/motion.md` holds the numbers either way.
- Charts and data figures inside a case study: a dataviz skill if available.
