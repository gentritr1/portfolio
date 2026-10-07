---
name: portfolio-page
description: Use when designing, writing, building, critiquing or checking a personal portfolio site or one of its pages (home, work index, case study, about, 404) for a developer, design engineer or designer. Covers the first screen, hero copy, project rows, case-study writing, screenshots, type, colour, layout, signature motion and smoothness, removing AI-template tells, a scripted checker, and a calibrated review rubric for iterating many drafts. Not for product landing pages or app UI.
metadata:
  version: 1.3.0
---

# portfolio-page

A portfolio is read by a stranger who decides in seconds whether to keep reading, then judges one project in a few minutes. This skill turns that into rules you can test. It merges four design skills (impeccable, ui-ux-pro-max, taste-skill, Emil Kowalski's design-engineering skills) with research on hiring reviews, award-level portfolios and motion. Where those sources conflict, this skill has already picked a side.

## The bar

A visitor, on a phone, with no context:

- **in the first second** sees one object that is the picture: a product screen, a live object, or the claim set as type at ≥ 40% of the viewport. A small screen beside a paragraph is a landing page, not a portfolio;
- **in 5 seconds** can answer four questions: who is this, what do they build, for whom, where is the proof;
- **in 60 seconds** has seen real work and one problem the person solved, with their scope stated;
- **a week later** can describe one specific moment of the site in one sentence.

A page that is beautiful and fails the 5-second line has failed.

## Modes

- **Experience** (home, work index): the work leads from the first viewport; the interface recedes. One idea per screen.
- **Read** (case study, about): a calm column, 60–75 characters wide, with the work at full size beside or between the text. The checker's `--mode read` lowers the first-screen work floor (15% / 12%) and raises the word budget; every other rule is the same.

## Setup (every time)

1. Read the project's own truth first: `PRODUCT.md`, `CONTENT.md` (facts, numbers, owner rules), `DESIGN.md`, and any brief the user names. **Owner rules beat this skill** (voice, banned words, what may be shown). Facts come only from those files; never invent a number, a client, a quote or a screen.
2. Write the **Design Read** in one line before any design work: `Reading this as: <who> for <which reader>, leading with <which work>, in <which rule/world>.`
3. Load the reference for the task (table below). Load `reference/anti-slop.md` before writing UI code.

## Commands

| Command | Use it to | Reference |
|---|---|---|
| `brief` | Collect audience, proof inventory, owner rules, constraints | [reference/brief.md](reference/brief.md) |
| `direct` | Choose a direction (one rule, one hook, composition, type, colour, the motion moment), or several distinct directions for a round | [reference/directions.md](reference/directions.md) |
| `hero` | Design and write the first screen | [reference/first-screen.md](reference/first-screen.md) |
| `write` | Identity, rows, case studies, captions, microcopy | [reference/writing.md](reference/writing.md) |
| `work` | Order projects, pick and crop screens, index and case layout | [reference/work-display.md](reference/work-display.md) |
| `visual` | Type, colour, layout, spacing | [reference/visual.md](reference/visual.md) |
| `motion` | The quiet layer, the one signature moment, smoothness | [reference/motion.md](reference/motion.md), [snippets/](snippets/) |
| `check` | Run the scripted checker; fix every hard fail | [scripts/check.mjs](scripts/check.mjs), [reference/checks.md](reference/checks.md), [reference/anti-slop.md](reference/anti-slop.md) |
| `review` | Score drafts with a fresh reviewer; polish in bounded passes | [reference/review.md](reference/review.md) |

Paths:
- **One page or the hero only:** `hero` + `write` → build → `check`.
- **A new site:** `brief` → `direct` (direction card + card review) → `hero` + `write` → `work` + `visual` → build → `motion` → `check` → `review` → at most two polish passes.
- **A round of drafts:** the round brief fills the **round table** first (lead, claim shape, composition, control, display-face class, ground, accent source: no repeats), each card passes a **card review** (original and hook ≥ 8 on the card), then the builds run in parallel, then one fresh review, then one polish pass each.
- Polish moves craft, not originality or hook. A built draft at 7 on either goes back to `direct` as a new draft.

## Hard rules

Gates. A draft that breaks one is not finished, whatever it scores.

1. **Work in the first screen.** A real product screen, live demo or playable piece fills ≥ 25% of the first screen at 1440×900 and ≥ 20% at 390×844 (Read mode: 15% / 12%). A canvas or board counts only if it shows the work (mark it `data-work="<product>"`), not the name, the proof row or decoration.
2. **The claim, not the name, is the largest text.** The identity sentence (≤ 20 words, one concrete verb, names the thing built, no adjective about the author) is the biggest type, or the name sits inside it. Never a giant name over a grey subtitle.
3. **Proof is a noun.** Credibility on the first screen is a place, a year range, a count, a store, a named product, and at least one is a link a stranger can open (a store listing, a live site, a repo). Zero self-ratings.
4. **No template tells.** Zero hard fails from `scripts/check.mjs` (pill above the hero title, gradient text, faint rounded card borders, glass, purple gradients, blobs, "+" stat rows, icon tiles, logo marquee, pulsing dot, template phrases, scope dodges). Ids and severities: `reference/checks.md`; fixes: `reference/anti-slop.md`.
5. **Facts only.** Every number, name and screen traces to a source file or a public URL (`--facts` checks numbers). Recreations and invented data are labelled in the caption.
6. **Scope stated.** Each project says what the person built and what others built. Never "worked on", "helped with", "involved in".
7. **One voice** across the site: first person, or no person (sentences start with the name or the verb). Never a mix; no he/his/him about the owner unless the owner asks for it.
8. **One hook per page**, and it carries a fact that is also on the page as text. Delete it: every fact must still be readable. If the site stops working, it was the navigation (fine); if nothing is lost, it was a costume.
9. **Motion is caused.** Every animation answers a visitor action, shows where something came from or went, or paces one story beat. UI ≤ 300 ms; one authored story moment ≤ 800 ms (1,100 hard ceiling); a state the visitor drives (drag, scrub, dial) has no duration cap but must follow the pointer and be interruptible. Keyboard and repeated actions do not animate. No entrance animation on sections; one authored figure may build once, in view, in ≤ 800 ms, and is complete without JavaScript and under reduced motion.
10. **Reduced motion keeps every state and drops travel.** Loops and canvases stop; nothing is hidden.
11. **Readable everywhere.** Body ≥ 16px, contrast 4.5:1 (3:1 at ≥ 24px), measure 45–75ch, touch targets ≥ 44px (text links in a sentence or a spaced nav may be smaller, per WCAG 2.5.8), no sideways scroll at 320px, visible focus, CLS < 0.02.
12. **Sharp work.** Screenshots never shown larger than their pixels; 2× density above 160px wide; text inside a screen ≥ 11px on phones (crop instead of shrinking); width/height and alt text that names the screen.
13. **Typeface chosen, not defaulted.** Default faces as the display voice fail (Inter, Geist, system, Roboto, Poppins…). Reflex faces (Fraunces, Space Grotesk, Instrument Serif…) are allowed with the reason recorded as `allow T18c: <reason>`; the starting-points table in `reference/visual.md` gives reasons that count.
14. **Colour has a source.** The palette comes from the work, the place or the person's material: either one accent with a named job (≤ 5% of any viewport) or a committed two- or three-colour identity with a job per colour, written in the draft notes. No default Tailwind slate/zinc + indigo; no dark ground with a lone neon accent and glow.
15. **Budget.** First readable frame ≤ 1 s on a mid phone (`--throttle 4`); any WebGL or heavy hook is lazy, ≤ 150 kB gzip, pauses offscreen and has a static fallback.

## Verify (always, before saying a draft is done)

1. **Look first.** Open the page at 1440 and 390 and write the four first-screen answers and the memory sentence before reading any report (the detector anchors judgment).
2. **Run the checker:** `node <skill-dir>/scripts/check.mjs <url> --out <dir> --owner "<Name>" --facts CONTENT.md` (Playwright + Chromium; finds `/opt/pw-browsers/chromium` or set `CHROMIUM_PATH`). It writes `report.md`, first-screen and full-page captures at 1440 and 390, reduced-motion captures and `sheet.png`; exit code 1 means a hard fail. Options: `--mode read` (case/about), `--frames 150,400,900` (mid-animation captures), `--throttle 4` (slow CPU), `--scheme dark`, `--allow "T06=reason;…"` or `<meta name="portfolio-check" content="allow T06: reason">` for deliberate exceptions. Mark live demos with `data-work`, sourced number rows with `data-numbers`, the story animation with `data-motion="story"`.
3. **Fix every ✗.** For each △, fix it or allow it with a reason.
4. **Capture the signature moment mid-flight** (`--frames`), scrub it at 10%, interrupt it once.
5. For a round of drafts, a **fresh reviewer** with no build history scores them (`reference/review.md`). Builders over-score originality by 1.5–2 points.

Stop after two polish passes.

## Output contract

Every draft ships with its notes in the shape of [templates/draft-notes.md](templates/draft-notes.md): Design Read, rule, hook, lead, composition, type, colour (with jobs), the motion moment, checker result with allows, self-score and holdback, and what in this skill helped or got in the way.

## Handoffs

Product landing pages, dashboards and app UI: impeccable. Deep component motion (drawers, toasts, gestures): Emil Kowalski's skills if installed; `reference/motion.md` holds the numbers either way. Charts in a case study: a dataviz skill.
