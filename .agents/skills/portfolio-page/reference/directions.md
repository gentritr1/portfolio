# Directions: making a portfolio that is not a template

Creativity in a portfolio comes from **a rule the whole site obeys**, not from a theme painted on a familiar skeleton. Sixteen "directions" on one skeleton (giant name top-left, screenshot right, one gimmick) are one direction in sixteen colours.

## Mechanisms (how distinctive sites earn it)

| # | Mechanism | Test |
|---|---|---|
| M1 | One constraint, pushed to the end | Remove the rule. If nothing changes, it was not a rule. |
| M2 | A metaphor that is also the navigation | Delete the metaphor. If the site still works the same, it was a costume. |
| M3 | Material honesty: the technique is real (a real dither, real light, real physics) | Can you explain the effect in one sentence of engineering? |
| M4 | One personal obsession | Would another developer's site have this section? |
| M5 | Interaction reveals information | Does the motion change what the visitor knows? |
| M6 | Type as the image | Remove every image; does the page still hold? |
| M7 | Pacing and time (a beat, a clock, a schedule) | Is there a beat a visitor can feel? |
| M8 | Physics and sound, off by default, right when on | Can you hear or feel weight? |
| M9 | Specificity: real data, place, language, numbers | Could this sentence be on a stranger's site? |
| M10 | Voice in the copy | Read it aloud: a person or a template? |
| M11 | Invisible craft (easing, interrupts, focus, ⌘K, 60 fps, no shift) | Scrub a transition at 10% speed. Still right? |
| M12 | Generation: the visitor makes the fact appear | The fact is also on the page as text before any input (first-screen rule). |
| M13 | Proof row: seniority as a row of nouns | Delete every adjective on the first screen. Still convincing? |
| M14 | Dated record | Is there a date on the first screen and on every case? |
| M15 | Budget: the hook costs ≤ 150 kB and ≤ 1 s before the four answers | Mid-phone capture; reduced-motion capture shows the four answers |

A strong direction earns at least three, including M1 or M2, plus M9.

## Finding the rule

Start from the person, not from a style:

1. **What is true only of them?** Place, languages, the kind of products, a practice (daily sketches, releases), a tool they built, a constraint they work under. List ten facts from the brief.
2. **What does their work look like?** Colours of the shipped screens, platforms (web + phone), density, motion in the product itself.
3. **What do they do that a reader can try?** An interaction, a demo, a game, a component.
4. Combine one fact from (1) with one thing from (3) into a sentence of the form **"the page is a ___ that ___"**: "the page is lit by the real sun over the owner's city at the visitor's time"; "the page is a departure board where each project is a line"; "the page has a seam: old app on the left, rebuilt app on the right, drag it".
5. Run the delete test and the stranger test (M2, M9). If it fails, try the next combination.

## A worked example, end to end

The live home of the repository this skill was built in shows what a finished mechanism looks like:

- **The fact:** the owner works from Kosovo; visitors are in other time zones.
- **The rule:** the real sun over Kosovo lights the page at the visitor's time; product screens stand on the ground and cast its shadows.
- **The control:** the sun disc on one line across the page; drag it, tap it, or use the arrow keys to move the hour.
- **The delete test:** remove the sun and the text "17:04 in Kosovo" still says the fact; the screens and the sentence still answer the four questions.
- **Reduced motion and budget:** a still at the current hour; the shadow shader is lazy, under 150 kB, with a flat fallback after slow frames.
- **The memory sentence:** "the site where you drag the sun over Kosovo and the screens' shadows move."

Do not copy it. Use it as the shape every mechanism should have: a true fact, a control that teaches itself, a still that says the same thing, a sentence a visitor would repeat.

## The memory test

Write the one sentence a visitor would say to a friend a week later. "The site where you drag the sun and the screens' shadows move." "The one where the crossword is the menu." If the sentence is a mood ("it felt premium"), the direction is not committed. If the sentence is about an effect with no relation to the person ("the one with the blob"), it is a gimmick.

## Costumes (fail M2 unless they truly navigate)

Retro OS / desktop with windows, 3D desk or room, TV and remote, game cartridge, terminal or boot log, magazine spread that is a carousel, device fan, exploded laptop, liquid orb, Figma-canvas clone. Each is fine only if removing it breaks the way to the work *and* it relates to the person's actual work.

## Divergence rules for a round of drafts

When building several directions to compare:

- **Different rule per draft.** No two drafts share a layout skeleton. If you can swap the content of two drafts and they still work, they are the same draft.
- **Different lead project** per draft, chosen for that draft's rule.
- **Different type pairing and ground** per draft, and a different display-face class (serif, grotesk, mono, drawn/bitmap, condensed poster). Not every draft on the same grotesk; not every draft on dark + one accent; not every draft on cream + serif.
- **Different composition** per draft (from `first-screen.md`'s list). If two drafts both open with sentence + proof row + framed screenshot, one of them changes.
- Mix bands: some **professional** (fastest to read), some **crafted** (one material idea), some **bold** (one mechanism the visitor drives). At least one draft should be safe enough to ship this week.
- Keep what earlier rounds proved (plain copy, real screens, facts only); do not re-try what failed (the giant-name skeleton, costumes).
- Builders write the rule, the hook sentence and the holdback before building, and the checker runs before review.

## Direction card (write before building)

```
id / title:
Rule (one sentence; the page is a ___ that ___):
Lead project and why:
Composition (from first-screen.md):
First screen (what is where, at 1440 and 390):
Hook (the memory sentence) and the fact it carries:
Delete test: what remains when the hook is removed:
Type: display face (why this face), text face, sizes on the first screen:
Colour: ground, ink, accent, where colour comes from:
Motion: the one story moment (duration, curve), everything else ≤ 300 ms:
Mechanisms earned: M__:
Risk / what could make it a costume:
```
