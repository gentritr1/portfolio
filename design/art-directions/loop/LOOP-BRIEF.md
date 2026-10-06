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
- Vianova screens (owner, 2026-10-06, with permission): real product screens captured on invented data only, labelled "Real product screens, invented data." (public/showcase/care-dashboard/, design-system/button-alert.webp). No hand-made recreations. No blur. Phone shots of the dashboard only for overview screens. High level only for internal work.
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
| 2 | release-brief, strike-index, cited-claims, decision-record, margin-notes, tenant-switch | decision-record 52, margin-notes 51, release-brief 50, strike-index 47, cited-claims 46, tenant-switch 46 (of 70). See round-2-review.md | decision-record log and Results, margin-notes hairline, strike-index edit mechanics, release-brief year rewrite |
| 3 | pinned-decisions, statement-of-record, year-stack, workspace-rail, same-behaviour, proven-cv | year-stack 54, statement-of-record 53, pinned-decisions 52, same-behaviour 51, workspace-rail 49, proven-cv 49. See round-3-review.md. All six opened on the care plate; five were pale | polish track: year-stack, statement-of-record |
| 4 | polish: year-stack, statement-of-record; new: rebuilt-twice, token-source, both-stores, added-clauses | year-stack 55 (+1), statement-of-record 54 (+1), token-source 54, both-stores 54, rebuilt-twice 53, added-clauses 52. See round-4-review.md. Six different first screens; chroma 24–65%; original stuck at 7 | polish: year-stack, statement-of-record, token-source |
| 5 | polish: year-stack, statement-of-record, token-source; new (no stack): sampled-ground, redline, projector | year-stack 56, sampled-ground 56, statement-of-record 55, token-source 55, projector 55, redline 54. See round-5-review.md. Original 8 reached by sampled-ground and redline | polish: sampled-ground, year-stack, projector; new: sampled-review |
| 6 | polish: sampled-ground, year-stack, projector; new: sampled-review | sampled-ground 57 (+1), projector 56 (+1), year-stack 56 (0, parked), sampled-review 55. See round-6-review.md. Six polish passes: five +1, one 0 | owner choice: projector (ship this week, 4 fixes) or sampled-ground (one more round, 5 fixes); optional round 7: polish sampled-ground + projector, new sampled-frame |
| 7 | polish: sampled-ground, projector (incl. the four ship fixes); new: sampled-frame | Opus critic: sampled-frame 57, sampled-ground 57, projector 56; plain copy 5–6/10. Devil's advocate: no draft opens on a shipped product with a solved problem. See round-7-critic.md, round-7-devil.md | projector stays home and gets the copy pass; sampled-frame is the challenger; sampled-ground parked |
| 8 | polish: projector (home), sampled-frame; restyle case pages + 404 to the home page; new: two-readers, proof-tiles, then-now (from PORTFOLIO-RESEARCH.md) | Critic: then-now 58, projector 57, two-readers 57, sampled-frame 56, case pages 53, proof-tiles 52. Devil ranks proof-tiles first. Both: one message in five skins; projector and sampled-frame too similar. See round-8-critic.md, round-8-devil.md | polish pass 8b done (self-scores: then-now 59, projector 58, two-readers 56, case pages 56, proof-tiles 54). New sameness: four drafts now open on the same Bayyinah TV pricing page; next round gives each draft its own lead product |
| 9 | projector (home) + personal band; then-now (lead Snaxx Tech), two-readers (lead Read to Feed), proof-tiles (lead Viva Fresh); new: personal-studio | Critic: projector 58, two-readers 57, proof-tiles 55, then-now 55, personal-studio 52. Devil ranks proof-tiles first; both keep projector home if it takes the best ideas of the others. See round-9-critic.md, round-9-devil.md | polish 9b: projector absorbs the best ideas; the other four polish their lists |
| 10 | divergence: live-objects, kosovo-time, four-languages, the-seam, departures, crossword (DIAGNOSIS §4.4) | New rubric /50, calibrated (anchors: linja 37, fjalekryq 37, projector 37, aisle 36, issue 36). crossword 40 (9/9), kosovo-time 40 (9/8), four-languages 40, departures 39 (9/9), the-seam 38 (fails gate, parked), live-objects 37. Devil ranks crossword, four-languages first. See round-10-critic.md, round-10-devil.md | polish 10b done (self: kosovo-time 9/8/9/9/9, four-languages 9/8/8/8/9, crossword 8/7/9/9/8, departures 8/7/9/9/8, live-objects 8/7/8/8/8). Closure (/50): kosovo-time 43 (gate fails only on the 'Drag the sun' label at 375/390), crossword 41, departures 41, four-languages 41, live-objects 39, projector 37 (three 36 px links). Recommendation: replace projector with kosovo-time after the label fix, a real-phone test, and case pages + 404 in its style. See round-10-closure.md |

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

Status: round 2 is published (gallery version 6) and its reels are in `brag-output-loop2/`. Round 2 review: done (round-2-review.md). Round 3: brief in ROUND-3-BRIEF.md, theme set by the owner: scroll motion, big cards, new layouts, catchy colour and type.

## Convergence goal (owner, 2026-10-05)

Combine the best parts of all directions into drafts that aim for a near-perfect score (63+ of 70). From round 3, most new drafts are deliberate combinations of proven parts. From round 4, the top two drafts by review score stay and get polished in place each round against the reviewer's defect list; their score is tracked per round. New combinations are still added beside them.

## Resume point (2026-10-05, superseded)

Round 7 was in progress (now done). To continue:

1. Finish `sampled-frame` (src/drafts/sampled-frame/, spec: round-6-review.md "New direction for round 7", shared builder brief in the session scratchpad BUILDER-R7.md). If the folder is partial, a builder continues it from the files.
2. Run a fresh Fable review of round 7 (sampled-ground, projector, sampled-frame), write round-7-review.md, update this log.
3. Commit, push main and drafts-polish, publish the drafts gallery, make the round-7 vertical reels (brag-output-loop7/).
4. Ask the owner which draft, if any, replaces AISLE as the home page (reviewer leaders: projector to ship now, sampled-ground as the memorable page).

## Round process from round 8 (owner, 2026-10-05)

1. Build: Opus agents build the round (new directions + polish of the leaders).
2. Critique: one Opus critic scores each draft against the 7-point bar with frame evidence.
3. Devil's advocate: one Opus agent argues against each draft (why a hiring manager closes the tab, what is generic, what is not true or not clear).
4. Polish: the builders fix what the critic and the devil's advocate proved.
5. Fable 5.1 is an advisor only when needed (a stuck decision, a final pick), not a reviewer every round.
6. Copy is plain and short: a hiring manager, a founder or a recruiter must understand every line. See PORTFOLIO-RESEARCH.md.

Home page: projector (owner, 2026-10-05). Case pages and the 404 still use the AISLE style and must follow the home page.

## Craft bar (owner, 2026-10-05)

Every round checks spacing, motion and UX at desktop (1440, 1280, 1024) and phone (375, 390, 540): one spacing scale, equal gutters, no layout shift (CLS 0), no text reflow or jitter during motion, visible focus and 44 px targets, nothing only on hover, sticky parts never cover content, and a designed phone layout. The critic step includes a craft QA pass. Polish uses the skills and research where needed, to take each draft to the next level.

## Owner decisions (2026-10-05, after round 8)

- Home page stays projector.
- No more videos (.mp4 reels). Rounds end with push + gallery publish only.
- Personal work to showcase: Offday (light theme, more screenshots), OFFBEAT and FORM (visually strong). They appear as personal work on the home page and in the drafts.
- Each draft leads with its own product; no two drafts open on the same screen.

## Resume point (round 9 polish, 2026-10-05)

Polish pass 9b was started on projector, then-now, two-readers, proof-tiles and personal-studio (brief: session scratchpad BUILDER-R9P.md, which is round-9 brief + "Polish pass 9b"; reviews in round-9-critic.md and round-9-devil.md). If the usage limit stopped it, the drafts may hold uncommitted partial edits. To continue: check `git status`, finish each draft's 9b list, run tsc + build, commit, push main and drafts-polish, publish the drafts gallery. No videos. Home stays projector.

## Round 10: divergence round and new rubric (owner, 2026-10-06)

Owner approved DIAGNOSIS.md: score straight to the point, seniority, original, hooks and "type and colour as a designer judges them" (target 9 on original and hooks); calm, harmony and motion become a pass/fail craft gate; hooks and motion are judged live; the jury is calibrated on an anchor set first. Round 10 builds six concepts with no shared layout brief: live-objects (C1), kosovo-time (C2), four-languages (C3), the-seam (C4, from diff), departures (C5, from linja), crossword (C6, from fjalekryq). Home stays projector.

## Home page: kosovo-time (owner, 2026-10-06)

The owner made kosovo-time the home page ("/"). Its client rows link to the case pages (/work/<slug>), which use its light and type. projector is parked as a draft at /drafts/projector. Still to do after the switch: a real-phone test (mid-range Android, iPhone Safari) of the sun intro, the drag and the slow-frame fallback.

## kosovo-time polish (2026-10-06)

Critic 42/50 with three gate fails and devil objections (kosovo-time-critic.md, kosovo-time-devil.md). Polish: label overlap gone in 30 states; images load lazily (colour samples stored in data.ts; phone first load 267 kB, was 939 kB); real fonts on a throttled phone (LCP 3.7 s at 6x CPU, was 10.8 s); a vertical swipe scrolls the page; first screen shows Bayyinah TV web beside a Viva Fresh phone screen; the chosen hour travels to the case pages (sessionStorage "kt-at") and back to "/#work" without the intro; new share image and theme-color; case pages with the same header and readable phone crops. Builder self-score 44/50; gate pass. Still owed: a real-phone test.

## Owner decision (2026-10-06): care platform scope

The care platform is web and mobile (owner). The home row role "Frontend and mobile" stands; the case page platforms read "Web and mobile, and the server behind them".
