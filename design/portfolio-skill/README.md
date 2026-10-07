# portfolio-page: how the skill was made, and how to use it

The skill lives in `.agents/skills/portfolio-page/` (linked from `.claude/skills/portfolio-page`). This folder holds the research behind it and the rounds that tested it.

## Use it

- In Claude Code: ask for a portfolio page, a hero, a case study or a review, or type `/portfolio-page`. The skill loads `SKILL.md`, which routes to the references.
- Check any page, local or live:

```sh
node .agents/skills/portfolio-page/scripts/check.mjs http://127.0.0.1:5173/drafts/<id> \
  --owner "Gentrit Rashiti" --facts CONTENT.md --out portfolio-check/<id>
# --mode read for case pages · --frames 150,400,900 for mid-animation captures
# --throttle 4 for a slow phone CPU · --scheme dark · --allow "T18c=reason"
```

It writes `report.md` (verdict, findings with fixes, human-made signals, motion and frame numbers), first-screen and full-page captures at 1440 and 390, reduced-motion captures and `sheet.png`. Exit code 1 means a hard fail. `node … --list` prints every check.

## What is in the skill

| File | What it holds |
|---|---|
| `SKILL.md` | The bar (first second, 5 s, 60 s, a week later), modes, commands, 15 hard rules, the verify loop, the output contract |
| `reference/brief.md` | Readers, proof inventory, owner rules, the Design Read line |
| `reference/first-screen.md` | The four answers, what the first screen holds, the claim formula, compositions that work and that cost credibility |
| `reference/writing.md` | Voice, readability numbers, banned lists, a translation table, rows, results without metrics, the hook line, the case-study template, microcopy |
| `reference/work-display.md` | How many projects, order, screens (source, pixels, crops, frames, captions), index patterns, live demos |
| `reference/visual.md` | Choosing faces, type tokens, colour strategy and OKLCH values, dark mode, layout, human-made signals |
| `reference/motion.md` | The quiet layer, the frequency gate, duration/curve/spring tokens, orchestration, reduced motion, the signature-moment menu and build order, verification |
| `reference/directions.md` | Mechanisms M1–M15, finding the rule, a worked example, costumes, divergence rules for rounds, the direction card |
| `reference/anti-slop.md` | Every template tell with its fix, the allow mechanism, what the reviewer checks by hand |
| `reference/checks.md` | Generated list of checker ids, severities and weights |
| `reference/review.md` | The rubric (/50 + craft gate), the bar to beat, calibration, method (judge before the detector), devil's advocate, polish |
| `snippets/` | View transition tile → case, press/hover/focus/underline, springs and curves, reduced motion |
| `templates/draft-notes.md` | The notes every draft ships with |
| `scripts/check.mjs` | The checker |

## How it was made

| Round | What happened | Output |
|---|---|---|
| 1. Research | Three independent research passes (content and first screen; motion and smoothness; type, colour and template tells) and a teardown of four skills: impeccable, ui-ux-pro-max, taste-skill and Emil Kowalski's design-engineering skills | `research/01–04` |
| 2. Skill v1 | Synthesis into the skill and a Playwright checker, calibrated on a deliberate "template" page (caught 16 tell types), the live home (pass) and older drafts the jury had already called generic (fail) | skill v1.0 |
| 2b. Critique | An adversarial review of v1 by a fresh design director: it would make every page the same, it induced its own warnings, decoration counted as work, most banned copy was not checked | `research/05-critique.md`, skill v1.1, checker rebuild |
| 3. Drafts | Four builders, given only the skill, the facts and the owner rules (no history): a blind free choice, a professional page with a case view, a crafted material idea, a bold mechanism | `src/drafts/p12-*`, `loop-12/` |
| 4. Review | A fresh reviewer and a devil's advocate scored the drafts against anchors; the skill moved to v1.3 (claim shapes, round table, card review, hook ladder; examples made fictional after they leaked into every draft) | `loop-12/REVIEW.md`, `loop-12/DEVIL.md` |
| 5. Polish and re-review | One polish pass per draft, then a second fresh review; the checker gained interaction frames, painted-ground contrast, dialog and round checks | `loop-12/REVIEW-2.md` |

## Results

Scores out of 50 from fresh reviewers who first scored three anchors with known totals (all within two points): the live home 43, the earlier no-skill blind draft 33, departures 39.

| Draft | Band, builder brief | First review | After one polish pass | Ship line (42, original and hook ≥ 8) |
|---|---|---:|---:|---|
| LENTICULAR (`/drafts/p12-crafted`) | Crafted: one material idea | 40 | **42** | Yes |
| ACTUAL SIZE (`/drafts/p12-pro`, `/case`) | Professional, with a case page | 40 (case 39) | 41 (case 41) | One point short |
| IN YOUR STORE (`/drafts/p12-bold`) | Bold: a mechanism the visitor drives | 39, gate fail | 41 | One point short |
| THREE LANES (`/drafts/p12-blind`) | Free choice, no steer (the blind test) | 39, gate fail | 41 | One point short |

What the numbers say:

- **The skill lifts the floor.** Every draft built from the skill alone scored 6–9 points above the no-skill draft (33), with 0 hard fails from the checker against 11.
- **Polish moves craft, not the idea.** The polish pass added 1–2 points to every draft, all in straight-to-the-point, proof and type; originality and hook stayed at 8.
- **The gap to the live home (43) is the hook.** The home's hook is a state the visitor drives across the whole page (the sun). The drafts' hooks change one card, one row or one lane. The skill's hook ladder and the 8-to-9 test now say this before a build.
- **Parallel builders converge.** Without a round table all four drafts shared one claim shape, one section order and a paper ground; the checker's `--round` now flags this (R01 on all six pairs here).

Reviews: `loop-12/REVIEW.md` (first), `loop-12/DEVIL.md` (devil's advocate), `loop-12/REVIEW-2.md` (after polish).

## Next

- Take LENTICULAR toward a 9: one lens angle for the whole page, driven by the pointer or one control, so every print turns together.
- Run the next round with the v1.3 process: a round table, a card review before building, then builds.
- Done (2026-10-07): `PRODUCT.md` now allows real care-platform and Design System v2 screens on invented data, captioned "Real product screens, invented data.", matching the owner's permission of 2026-10-06.
