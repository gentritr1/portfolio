# Brief: what to know before designing

A portfolio fails most often from missing truth, not missing taste: no real screen to show, no stated scope, a number nobody can source. Collect these first. If a project already has `PRODUCT.md` / `CONTENT.md`, read them and fill only the gaps. Ask the owner at most three questions; infer the rest and say what you inferred.

## 1. Reader

Name the primary reader and what they must do after the visit.

| Reader | Time | Needs on the first screen | Closes the tab when |
|---|---|---|---|
| Recruiter | 10–30 s | Role words that match the job, location or time zone, a live link, the CV | A clever title with no role; a loader; a game before the work |
| Hiring manager / design lead | 2–5 min | The best case first; problem, role, decisions, result; honest scope | Walls of text; "looks like 40 other candidates"; metrics with no source |
| Senior engineer | 5 min, then code | What was hard, which trade-off, what it cost; a live demo or repo | A stack list without decisions; team work claimed as one's own |
| Founder / client | 60 s | One shipped thing with a user-visible result; can this person ship alone | Process diagrams; nothing live |

Reviewers increasingly read on phones; the phone first screen is the first screen. (Most "seconds on a portfolio" figures are folklore; the measured ones are in the research notes.)

## 2. Proof inventory

List every piece of evidence with its source. This is the raw material; the design only arranges it.

```
| Project | What it is (≤ 12 words, for a stranger) | Who uses it | Person's scope | Others' scope | Years | Platforms | Live link | Screens (file, pixels, public/invented/recreation) | Numbers (value, plain label, source) |
```

Rules:
- A screen is usable only if its provenance is known: public page, store listing, real product on invented data, or a recreation. Label the last two in captions.
- A number is usable only with a source line. Prefer numbers a non-engineer can count (pages, languages, stores, releases, years, "16 → 2"). Internal counts (components, tokens, tests) go to the engineering part of a case, or nowhere if the owner says so.
- Mark the **strongest** project: the largest checkable change, live or verifiable, that matches the primary reader. It leads, not the newest.
- Mark what cannot be shown (NDA, login-only screens) and decide the honest substitute (description only, recreation, invented data).

## 3. Owner rules

Record every rule the owner has set, verbatim, with its date. Typical ones: voice (first person / no person / never "he"), words never to use, employers and clients that must not be linked, numbers not to show, what may be screenshotted, languages. They override this skill.

## 4. Constraints

Stack and dependencies allowed, fonts available locally and their licences, hosting (static? SPA fallback?), budgets (JS per route, image weight), themes required (light/dark), languages, the devices the reader will use.

## 5. The Design Read

One line, written before any layout:

`Reading this as: <role> for <primary reader>, leading with <strongest project>, in <rule or world>.`

Then answer the memory test in advance: *what is the one sentence a visitor will say about this site a week later?* If the answer is a mood ("clean", "bold"), the direction is not committed yet. Go to `directions.md`.

## Brief template

```markdown
# Brief: <name>
Design Read: Reading this as …
Primary reader: …   Secondary: …
After the visit they should: … (open a case / download the CV / email)
Strongest project: … because …
Voice: first person | no person      Owner rules: (list, dated)
Proof inventory: (table above)
Cannot show: …  →  substitute: …
Constraints: stack …, fonts …, budgets …, themes …
Memory sentence (target): "…"
```
