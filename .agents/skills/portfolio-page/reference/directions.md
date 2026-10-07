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

## A worked example, end to end (a fictional person)

Ana Silva builds offline-first apps that field nurses use where there is no signal.

- **The fact:** the apps keep working with no connection and sync later.
- **The rule:** the page works like the apps: a signal switch in the corner takes the page offline; the page keeps working, actions queue, and the queue syncs when the signal returns.
- **The control:** one switch (click, tap, Space); its label says the state: "Online" / "Offline · 3 changes waiting".
- **The delete test:** remove the switch and the sentence "The apps keep working with no signal and sync later" still says the fact; the screens and the claim still answer the four questions.
- **Reduced motion and budget:** the state changes instantly; no canvas; a few kilobytes.
- **The memory sentence:** "the site you can switch offline, and it keeps working like the apps."

Do not copy it. Use it as the shape every mechanism should have: a true fact, a control that teaches itself, a still that says the same thing, a sentence a visitor would repeat.

**Never put the person's own facts or sentences into a skill or a shared brief as examples.** Builders copy examples; one example becomes the same headline on every draft, and a slightly wrong example sentence spreads a factual error to every page.

## Test the idea before building

A round of drafts costs hours, and a 7 on original or hook cannot be polished into an 8. Judge the idea before the build:

0. **Card review.** The direction card plus one static 1440 mock (plain HTML, no motion) goes to a fresh reviewer, who scores original and hook on the card alone with the hook ladder in `motion.md`. Build only cards that score ≥ 8 on both; send the rest back with the reviewer's note.

Then, for the builder:

1. Write the memory sentence (below).
2. Read it against every line in the list of existing directions and against the bar-to-beat sites in `review.md`. If it could describe one of them, change the rule.
3. Name the **control pattern** (a list that drives a stage, a carousel, a scroll story, a dial, a drag) and check it is not the same control as an existing draft with a new skin.
4. Ask: **what is the rule on a 390px screen?** If the rule disappears on a phone, it is a desktop effect, not a rule.
5. A purely structural rule (an arrangement the visitor does not drive) rarely scores above 7 on the hook. Know that before choosing it, or add one moment the visitor drives.

If a built draft still lands at 7 or less on original or hook, start a **new draft** with a new rule; a re-direct is not a polish pass. (This should be rare once the card review runs.)

**The rule does not stop at the fold.** Below the first screen the section order, the row shape and the index follow the rule (lanes are rows; prints are rows; board lines are rows). If two drafts in a round read Work → More work → About → Contact in the same shape, one of them changes.

## The memory test

Write the one sentence a visitor would say to a friend a week later. "The site where you drag the sun and the screens' shadows move." "The one where the crossword is the menu." If the sentence is a mood ("it felt premium"), the direction is not committed. If the sentence is about an effect with no relation to the person ("the one with the blob"), it is a gimmick.

## Costumes (fail M2 unless they truly navigate)

Retro OS / desktop with windows, 3D desk or room, TV and remote, game cartridge, terminal or boot log, magazine spread that is a carousel, device fan, exploded laptop, liquid orb, Figma-canvas clone. Each is fine only if removing it breaks the way to the work *and* it relates to the person's actual work.

## Divergence rules for a round of drafts

Builders who build in parallel cannot see each other. **The round brief decides the divergence for them** with a round table, filled before anyone builds; no two cells in a column may match:

| Draft | Lead project | Claim shape | Composition | Control pattern | Display-face class | Ground | Accent source |
|---|---|---|---|---|---|---|---|
| a | | verb-first / product-first / place-and-year / before-after / question / proof rows | from `first-screen.md` | list→stage / dial / drag / switch / scroll story / none | serif / grotesk / mono / condensed / drawn | paper / dark / colour | which screen, place or material |

In a round, at least one draft sits on a dark or coloured ground and at least one has a two- or three-colour identity: when every product shares a hue, "colour from the work" converges.

When building several directions to compare:

- **Different rule per draft.** No two drafts share a layout skeleton. If you can swap the content of two drafts and they still work, they are the same draft.
- **Different lead project** per draft, chosen for that draft's rule.
- **Different type pairing and ground** per draft, and a different display-face class (serif, grotesk, mono, drawn/bitmap, condensed poster). Not every draft on the same grotesk; not every draft on dark + one accent; not every draft on cream + serif.
- **Different composition** per draft (from `first-screen.md`'s list). If two drafts both open with sentence + proof row + framed screenshot, one of them changes.
- **Different control pattern** per draft (see the test above).
- Mix bands: some **professional** (fastest to read), some **crafted** (one material idea), some **bold** (one mechanism the visitor drives). At least one draft should be safe enough to ship this week.
- **Professional does not mean generic.** Inside the familiar claim + proof + screen pattern, originality lives in four places: scale (actual-size screens, a type size that fills the frame), crop (cut to the proving part, bleeding off the page), type (one decided face and axis), and one transition (the tile becoming the case). Pick at least two.
- **Crafted means the material reads in a still.** Reviewers judge captures first; if a screenshot of the resting page shows only an ordinary picture, add a resting cue of the material (the ribs of a print, the grain of a real dither, the edge of a fold).
- **Bold means the visitor drives it,** with the spec in `snippets/mechanism.md` filled in before building.
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
