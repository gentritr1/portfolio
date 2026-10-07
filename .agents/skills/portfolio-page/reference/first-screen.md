# The first screen

The first screen is judged in about 50 ms for appeal and read in a few seconds for meaning. It must be eye-catching **and** credible. Eye-catching comes from the work and one decided visual idea; credible comes from nouns a stranger can check.

## The four answers

In this order, readable without input, with JavaScript off and with reduced motion on:

1. **Who** — the name.
2. **What** — what they build (a product kind, not a stack).
3. **For whom** — the people or the companies.
4. **Proof** — one or more checkable nouns, and one real piece of work.

Test: give a capture to someone with no context for 5 seconds; they write the four answers. If they cannot, the screen fails, whatever it looks like.

## What it holds (and nothing else)

| Element | Rule |
|---|---|
| Name | One size below the claim, or inside the claim sentence ("Ana Silva builds …"). |
| Identity sentence (the claim) | ≤ 20 words (15 target), one present-tense concrete verb (builds, designs, ships, writes), names the thing and the people, a proof clause, no adjective about the author, no stack names. The largest text on the screen. |
| Second line (optional) | ≤ 12 words: place and way of working, or the current company. "Based in Kosovo, working remotely." |
| Proof row | 2–5 nouns: a place, a year range, a count, a store, a named product. Linked where a link exists. |
| One real piece of work | A product screen at native pixels, a live demo, or the playable hook. ≥ 15% of the desktop first screen, ≥ 12% of the phone first screen. Captioned ≤ 8 words. |
| One action | A noun or a two-word verb naming the destination: "See the work", "Read the case". A second may be "CV". No "Let's talk", no "Hire me". |
| Navigation | 3–5 nouns, one line: Work · About · CV · Email. No "Home". |

Word budget: about 60 words outside the nav. Sizes on the first screen: 3–5 distinct font sizes.

### Formula

```
[Name] [builds|designs|makes|ships] [thing, 2–5 words] for [people, 1–4 words][, proof clause].
```

Good (paraphrased real patterns): "Tony Ward builds design systems so teams ship faster." · "Gentrit Rashiti builds web and mobile apps, from Kosovo." + "5+ years. Part of two platform rewrites." · name + four proof rows (Working at / Creator of / Core team of / Maintaining), as on antfu.me · a dated four-line career, as on taniarascia.com.

Template (rewrite): "Hi, I'm X 👋 — a passionate full-stack developer crafting seamless digital experiences." · "Welcome to my corner of the internet!" · "Designer. Developer. Dreamer." · "Turning ideas into reality, one pixel at a time." · a pill reading "Available for work" above a giant name.

Why: each good line has a noun a stranger can verify (a company, a year, a store, a count). Each bad line is a self-rating or a metaphor.

## Compositions that work

Derive the composition from the work, not from a landing-page habit. Patterns that are both eye-catching and credible:

1. **Sentence + proof row + one screen.** The sentence is plain; the row carries the weight; the screen proves the craft. Most reliable.
2. **Work before bio.** The eye lands on a product screen; words sit beside it in a narrow column.
3. **The claim drawn as a picture.** A split, a pair, a before/after that *is* the sentence (design | code; web | phone; old app | new app).
4. **A dated record.** Years down the side; the first screen is the top of a record a reader can check against a CV.
5. **The index is the hero.** A dense, well-set list of real projects with one live preview — works when the list is strong and the type is excellent.
6. **One mechanism the visitor operates** (see `directions.md`), provided the four answers are readable before, beside or inside it without input.

## Compositions that cost credibility

| Pattern | Why it catches | Why it costs |
|---|---|---|
| Giant name, grey subtitle | Fills the screen | The name is the least informative word; delays the four answers |
| Centred headline + primary/ghost button pair | Familiar | It is the SaaS landing template; nothing about this person |
| Text left, mockup right, badge row | Familiar | The most overused generated layout |
| Playable world before the work | Shared on social | Recruiters do not play; the four answers are hidden |
| Loader, intro counter, sound gate | Cinematic | Delays the first readable frame past 1 s |
| Welcome paragraph about the author | Warm | Every line is about the person, none about a built thing |
| Adjective stack ("fanatical, passionate") | Energy | Unverifiable; tolerable only directly above a proof row |
| Hero video of many MB | Motion | Slow office Wi-Fi closes the tab |

Rule: a hook may sit in the first screen only if the four answers are readable before, beside or inside it without input.

## Phone first screen

Design it, do not shrink the desktop. At 390×844:
- The claim sets in 2–4 lines at 32–40px.
- Work starts above 500px (y) and is readable: text inside a screenshot ≥ 11px after scaling, or crop to the part that proves the caption.
- One action reachable with a thumb; nav on one line or a single menu button with a 44px target.
- No horizontal scroll; no hover-only reveal.

## Checks

- `check.mjs`: C01 (work share), C02 (word count), C03 (sizes), T01 (pill above the hero title), T10 (template phrases), T12 (centred hero + button pair), T27 (giant name with no work).
- By eye: read the four answers off `1440.png` and `390.png`. Write them in the draft notes.
