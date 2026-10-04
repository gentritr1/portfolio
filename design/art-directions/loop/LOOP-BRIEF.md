# Art-direction loop: brief for every round

The owner wants many directions, kept as live drafts, iterated round after round, then chosen from. Not one pick.

## The owner's bar (this is the scorecard)

1. **Straight to the point.** In 5 seconds a visitor knows who this is, what he builds, and his level. In 30 seconds they have seen real work and at least one problem solved.
2. **Not overwhelming.** One idea per page. Calm hierarchy. Few elements on the first screen. White space is allowed.
3. **UI/UX harmony.** One type pairing, one accent, consistent spacing, every control feels like the same hand made it.
4. **Meaningful motion only.** Motion explains something (where a thing came from, what changed, what is next) or gives feedback. No decorative loops, no scroll-jacking, no motion for its own sake. Follow ~/.claude/skills/emil-design-eng/SKILL.md.
5. **Shows actions and seniority.** Problems solved, decisions made, scope owned. Not a list of technologies. Neutral voice, no "I led".
6. **Original.** A new mixture inspired by the references, not a copy of them and not a known template (no giant name + grey subtitle, no bento of glass cards, no fake terminal, no device fan). See ../CREATIVE-CONSULT.md §1.2 for the slop checklist.
7. **Hooks people.** One moment worth remembering, earned by the content.

## References (study what makes them work, do not copy)

- https://www.designeer.xyz/ — calm dark ground, one strong mark (the dithered orb), dense aligned rows, keyboard first (⌘K), quiet confidence.
- https://www.designeng.tools/ → https://offgrid.inc/ (the work is the energy, identity is a footnote), https://www.mek.gallery/ (a personal voice and one obsession).
- rauno.me, emilkowal.ski, paco.me: craft you feel before you see.

## Content

- Facts only from CONTENT.md and src/content/projects.ts + caseNarratives.ts (30 projects; featured: care platform, Bayyinah TV, Read to Feed, Viva Fresh, Incentiv, Dukagjini Bookstore, Design System v2).
- NDA: Vianova screens are recreations with invented data only (use the existing recreations in src/lib/recreations.tsx, e.g. 'care' and 'design-system'). Never real Vianova screenshots. High level only for internal work.
- Seniority signals that are true: two platform rewrites, a design system (36 components, 805 tokens), multi-tenant platform work, store releases, 5+ years, web + mobile + full stack.

## Skills to apply (read the SKILL.md files)

- Motion: ~/.claude/skills/emil-design-eng, improve-animations, review-animations
- Taste: ~/.claude/skills/design-taste-frontend (tasteskill.dev), ui-ux-pro-max, high-end-visual-design
- Polish: /Users/gentlegen/Desktop/gentrit-portfolio/.claude/skills/impeccable

## Rules for a draft

- Lives at /drafts/<id> in src/drafts/<id>/ (Draft.tsx default export + CSS + meta.json with band "Loop 1"). Only touch your folder.
- Must work at 375 px, keyboard paths, 44 px targets, reduced motion, contrast 4.5:1.
- Lazy chunk ≤ 150 kB gzip, no new dependencies.
- Capture at 1440×900 and 375×812, look at every capture, fix, repeat (max 3 rounds).
- Score yourself honestly against the 7 points above (1–10 each) and write the lowest one and why into meta.json `holdback`.

## Round log

| Round | Directions | Reviewer verdict | Carried forward |
| --- | --- | --- | --- |
| 1 | specimen, brief, orbit-index, changelog | changelog 52, brief 51, orbit-index 46, specimen 46 (of 70). See round-1-review.md | changelog frame, brief strike-and-insert, orbit-index Work column, specimen citation rule |
| 2 | release-brief, strike-index, cited-claims, decision-record, margin-notes, tenant-switch | pending | |

## Rules added after round 1

- Capture at least one mid-animation frame for every claimed motion (pause the animations at a set time with document.getAnimations(), or sample frames). Two end states that look the same are not evidence.
- Light grounds in round 2 (round 1 used dark three times; dark + one accent is a slop marker).
- One accent. A per-item colour only where the colour is the content.
- No strike where there is no real problem. If a sentence has no constraint, write it plain.
- The phone first screen shows work, not only words.
- Builders over-scored "original" by 1.5–2 points in round 1. Score it strictly.

## Loop operation (owner request, 2026-10-05)

The loop runs on its own until the weekly reset (2026-10-05 07:00 UTC). For each round:

1. Build about 6 directions with agents (convergence on the best-scored ideas, plus 2 bold new ones).
2. Builders self-critique with the skills listed above.
3. A fresh Fable 5.1 reviewer scores the round strictly and writes `round-N-review.md`.
4. Commit and push `drafts-polish` and `main` (as gentritr1), publish the drafts gallery, and make a 12 s vertical reel for each new draft (`brag-output-loopN/`).
5. Log the round here and start the next round.

Status: round 2 is published (gallery version 6) and its reels are in `brag-output-loop2/`. Round 2 review: running.
