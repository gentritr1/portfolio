# Loop 12 builder brief: test the portfolio-page skill

Purpose: find out whether the `portfolio-page` skill, on its own, produces a portfolio home page that is eye-catching, credible, smooth and free of template tells. You are one of four builders. Each builds one draft in its own folder. A reviewer who has not seen your work will score it with the skill's rubric.

## Read, in this order

1. The skill: `.agents/skills/portfolio-page/SKILL.md`, then every file in `.agents/skills/portfolio-page/reference/`. Follow it. Where this brief and the skill disagree, this brief wins; where the owner's rules (below) and the skill disagree, the owner wins.
2. The facts: `CONTENT.md`, `PRODUCT.md` (read the "Hard constraint" section twice), `src/content/projects.ts`, `src/content/caseNarratives.ts`, `src/content/careShots.ts`, `src/content/phoneScreens.ts`, `src/content/links.ts`.
3. The screens: `design/portfolio-skill/loop-12/ASSETS.md`.
4. The directions that already exist (do not repeat their rule): `design/portfolio-skill/loop-12/EXISTING.md`.

Do **not** read `design/art-directions/` (earlier rounds and reviews), other drafts' code, or the live home's code. This round tests the skill, not the history.

## Owner rules (they override the skill)

- Voice: no person. Never "I", never "he/his/him" for the owner. Use the name or start with the verb ("Built the sign-in screens."). Never "led", "top contributor", or commit counts.
- Plain English at a child's reading level: short sentences, common words (ASD-STE100 style). A recruiter must understand every line on the home page.
- Facts only from the files above. Do not invent numbers. No internal counts on pages (the CONTENT.md "Counts, for reference only" list stays off the page).
- Public products are named and linked. Do not state any relation between an employer and a client product. The employer Vianova is named only on its own platform rows.
- The care platform and the design system are shown only as "Real product screens, invented data." (that caption, on each such screen). No blur, no hand-made recreations.
- When the AI workflow is mentioned, use this exact line: "Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change."
- The care platform's proof "16 → 2" (database requests for one billing report) is a proof line, not a headline.

## Technical rules

- Your folder only: `src/drafts/<your-id>/` with `Draft.tsx` (default export), CSS, `meta.json`, `DIRECTION.md`. Do not edit any other file. Shared imports from `src/content/*` are fine (read only).
- Stack: React 19, TypeScript, `motion` (import from `motion/react`), `ogl` if you need WebGL, plain CSS scoped under one root class prefix unique to your draft. No new dependencies. Lazy chunk ≤ 150 kB gzip.
- Fonts: only the local files in `public/fonts/` and `public/fonts/creative/` (see `SOURCES.md` there for family names and axes). Declare `@font-face` in your CSS.
- Images: paths from `ASSETS.md`, with `width`/`height`, `alt`, eager + `fetchpriority="high"` on the first-screen image, lazy elsewhere.
- Routes: your page lives at `/drafts/<your-id>`. You may add a nested case view at `/drafts/<your-id>/case` (the router passes `/drafts/:id/*` to your component; use `useLocation`/`useParams` or nested `<Routes>` inside your draft). Links to real case pages use `/work/<slug>`.
- Must work at 375/390 and 1440, keyboard, 44px touch targets, reduced motion, contrast 4.5:1. One theme is fine for a draft.

## Process (from the skill, with ports)

1. Write `DIRECTION.md` first: the skill's brief template (short) and the direction card from `reference/directions.md`. Give your draft a title.
2. Build. Run your own dev server: `cd /home/user/portfolio && npx vite --port <your-port> --host 127.0.0.1 --strictPort` (in the background). Typecheck with `npx tsc -p tsconfig.app.json`.
3. Look first (the skill's Verify step 1), then check: `node .agents/skills/portfolio-page/scripts/check.mjs http://127.0.0.1:<your-port>/drafts/<your-id> --name <your-id> --out /tmp/claude-0/-home-user-portfolio/ececf2fc-6b8e-558c-a256-135b77151905/scratchpad/loop12/<your-id> --owner "Gentrit Rashiti" --facts CONTENT.md --frames 150,400,900`. Look at every PNG it writes (`sheet.png`, `1440.png`, `390.png`, `*-full.png`, the `-t` frames). Fix every hard fail. For each warning, fix it or record the reason (an `allow` meta tag with the reason, per `reference/anti-slop.md`). The checker is being improved during this round; if its output format changes between runs, that is expected: re-run and follow `reference/checks.md` when it exists.
4. Look at your own captures as a stranger: write the four first-screen answers (who / what / for whom / proof) for desktop and phone in `DIRECTION.md`. If you cannot, fix the first screen.
5. At most two polish passes. Then stop.
6. Fill `meta.json` (keys from `.agents/skills/portfolio-page/templates/draft-notes.md`):

```json
{
  "id": "<your-id>",
  "title": "<TITLE>",
  "band": "Loop 12",
  "description": "<first screen in two sentences: what is where>",
  "signature": "<type, colour, the one motion moment>",
  "caseSlug": "<lead project slug>",
  "rule": "<the page is a ___ that ___>",
  "designRead": "Reading this as: …",
  "hook": "<the one sentence a visitor would say a week later>",
  "lead": "<lead project and why>",
  "composition": "<from first-screen.md>",
  "fourAnswers": { "desktop": "who / what / for whom / proof", "phone": "…" },
  "mechanisms": ["M1", "…"],
  "check": { "fails": 0, "warnings": 0, "allowed": ["T.. reason"] },
  "loopScores": { "straightToThePoint": 0, "actionsAndSeniority": 0, "original": 0, "hooks": 0, "typeAndColour": 0 },
  "holdback": "<lowest score and why>",
  "skillNotes": "<where the skill helped, where it was unclear, wrong or missing — be specific; this improves the skill>"
}
```

`skillNotes` matters as much as the draft: we are testing the skill.

## Your assignment

| id | Port | Band | What to aim for |
|---|---|---|---|
| `p12-blind` | 5301 | Free | Use the skill's `direct` step to pick the strongest direction you can find. No other steer. |
| `p12-pro` | 5302 | Professional | The fastest-reading page a hiring manager could see this week: the skill's first-screen pattern done at the highest craft, plus a case view for the lead project at `/drafts/p12-pro/case` written with the skill's case template. |
| `p12-crafted` | 5303 | Crafted | One material idea pushed to the end (M1 + M3), with one signature motion moment that carries a fact and feels physically right. Must not use the sun or time-of-day idea. |
| `p12-bold` | 5304 | Bold | A mechanism the visitor drives that reveals facts about the work (M2/M5/M12), with the four answers still readable without input. Must not be a costume (desktop OS, terminal, TV, game cartridge, 3D room). |

Each draft leads with a different project. Suggested leads (change only with a reason): blind: your choice; pro: the care platform rebuild; crafted: Bayyinah TV; bold: Viva Fresh or Read to Feed.
