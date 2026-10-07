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
| 4. Review | A fresh reviewer scores the drafts against anchors, then polish and fold lessons into the skill | `loop-12/REVIEW.md` |

## Results

Filled in after round 4.
