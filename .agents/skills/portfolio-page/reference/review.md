# Review: scoring drafts and running rounds

Builders cannot judge their own drafts: in practice they over-score originality by 1.5–2 points and score the feature list instead of the capture. A review is done by a **fresh reviewer** that has not seen the build conversation, from captures and a live session, against a calibrated scale.

## The rubric (/50) and the craft gate

Score five points, 1–10 each. Then pass or fail the craft gate. A failed gate means "not finished", whatever the total.

| Point | 7 means | 8 means | 9 means |
|---|---|---|---|
| **1. Straight to the point** | The four answers are on the first screen but take effort | All four in 5 s on desktop and phone | All four in 5 s, and real work is the first thing the eye lands on |
| **2. Proof and seniority** | Projects are named; scope is vague | Each lead project states scope and a checkable result | Seniority is obvious from nouns alone (size of change, years, kind of decision), with no rank words |
| **3. Original** | A good personal site in a known pattern | A decision a designer would notice; not a copy of a named site | A reviewer who knows the 2025–26 award winners, rauno.me, emilkowal.ski, bruno-simon.com cannot name a site it copies, and the rule could not exist for another person |
| **4. Hook** | Pleasant, nothing to repeat | One moment worth mentioning | The reviewer can write the one sentence a visitor would say to a friend — and it carries a fact about the person |
| **5. Type and colour** | Correct defaults | A decision a designer would notice | A setting someone would screenshot for a mood board |

**Craft gate** (all must pass):
- `check.mjs`: 0 hard fails at 1440 and 390 (warnings reviewed).
- Calm: one idea per screen; ≤ 5 type sizes on the first screen; spacing from one scale; nothing competes with the work.
- Harmony: one type pairing, one accent, controls that look made by one hand.
- Motion: every animation passes the frequency/purpose gate; reduced motion keeps states.
- Responsive: designed at 375/390, 768, 1024, 1280, 1440; no overflow; sticky parts never cover content.
- Access: focus visible, targets ≥ 44px on touch, contrast, alt text.

Target to ship: gate pass and **≥ 42/50 with original and hook ≥ 8**. A draft at 7/7 on original and hook is parked, not polished: polish moves craft, not those two points.

## Calibrate first

Before scoring a round, score 2–3 **anchors** blind on the same scale: an existing shipped page and one or two earlier drafts with known scores. If your anchors come out more than 2 points off their recorded totals, recalibrate before scoring the new drafts. Record the anchors in the review.

Require a spread: if three drafts land within one point on "original", rank them and write what separates them.

## Method

1. Run `check.mjs` on every draft first (reviewer reads the reports, not the code).
2. Look at `1440.png`, `390.png`, both full-page captures and the reduced-motion captures. Read the four first-screen answers off each and write them down.
3. Live session: drive the signature moment with pointer and keyboard; capture 3–5 mid-frames; scrub at 10% if possible; interrupt it once.
4. Score the five points with one line of evidence each (a frame, a measurement, a quote of the copy). Name three real sites the draft beats on originality and one it loses to.
5. Write the memory sentence. If you cannot, the hook is ≤ 7.
6. List defects as a numbered fix list, most severe first, each with where and what to change.

## Devil's advocate

A second reviewer argues against each draft: why a hiring manager closes the tab, what is generic, what is untrue or unclear, which claim a follow-up interview question would expose. One paragraph per draft. The builder answers each point by fixing it or by stating why it stands.

## Reviewer prompt (template)

```
You are a fresh reviewer for a portfolio round. You have not seen how these drafts were built.
Read: <skill-dir>/reference/review.md (this rubric) and <skill-dir>/reference/anti-slop.md.
Facts and owner rules: <paths>. Anchors with recorded scores: <urls + scores>.
For each draft <url>: read its check report <path>, look at its captures <dir>, then drive it live.
Score the five points and the craft gate as defined. Evidence for every score. Write the memory
sentence. Name 3 sites it beats and 1 it loses to on originality. Give a numbered fix list.
Be strict: a 9 needs the evidence the rubric names. Output: <path>/review.md with a table and
per-draft sections.
```

## Polish

- At most **two** polish passes per draft per round. Each pass fixes the reviewer's and the devil's list in order of severity, reruns `check.mjs`, and recaptures.
- Polish only drafts at or above 8 on original and hook. Others are parked or rethought.
- Carry proven ideas across drafts (a better caption pattern, a clearer proof row), but never converge all drafts onto one skeleton.

## Report format (per draft)

```
## <title> — <total>/50, gate <pass|fail>
Straight 8 · Proof 8 · Original 7 · Hook 8 · Type+colour 8
Four answers (desktop): who … / what … / for whom … / proof …
Four answers (phone): …
Memory sentence: "…"
Beats: a, b, c. Loses to: d.
Checker: 0 fails, 3 warnings (…)
Fix list:
1. …
```
