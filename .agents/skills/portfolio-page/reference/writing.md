# Writing: identity, rows, case studies, microcopy

People read about a fifth of the words on a page. Every line competes for that fifth. Write plain, short and specific; let nouns and numbers do the persuading.

## Voice

- **One voice per site.** First person ("I built …") or no person ("Built the sign-in screens."). Never a mix on one page. A sentence with the owner's name as its subject ("Ana Silva builds …") counts as the no-person voice; pronouns about the owner (he, his, him, she, her) are what breaks it. Test: grep `\bI\b`, `\bhe\b`, `\bhis\b`.
- The no-person voice reads as a record, not a pitch; it fits engineering work. Its cost is warmth; earn that back with one specific detail or a named quote, not adjectives.
- Sentence case, active voice, no exclamation marks.

## Readability numbers

| Rule | Home page | Case page |
|---|---|---|
| Average sentence | 14–20 words | 14–20 words |
| Longest sentence | 25 words | 30 words |
| Grade level (Flesch-Kincaid or similar) | ≤ 8 | ≤ 9 |
| Paragraph | one topic, ≤ 55 words | one topic, ≤ 5 sentences |
| Commas | ≤ 1 per sentence, no semicolons | as needed |

Sources: GOV.UK (split sentences over 25 words), US Federal Plain Language (average 20), ASD-STE100 (≤ 20/25 words). The "14 words = 90% understood" scale is folklore-grade; use it as a direction, not a fact.

**Read-aloud test:** read a line to someone who does not write code. If they ask "what is X?", replace X.

## Words

Verbs that work: built, shipped, moved, cut, rebuilt, released, kept, designed, wrote, fixed, runs, opens, remembers.

Banned everywhere (self-ratings and slop): passionate, enthusiastic, fanatical, dedicated, results-driven, detail-oriented, creative (as a self-label), innovative, expert, ninja, rockstar, world-class, award-winning (as an adjective), meaningful/delightful/digital experiences, user-centric, pixel-perfect, crafting/crafted (about yourself), bringing ideas to life, turning ideas into reality, corner of the internet, welcome to my, hi/hello/hey I'm, dreamer, what sets me apart, journey, seamless, robust, scalable, leverage, cutting-edge, state-of-the-art, next-generation, game-changer, revolutionize, elevate, empower, unlock, supercharge, delve, tapestry, landscape and navigate (as metaphors), realm, pivotal, vibrant, meticulously, testament, synergy, holistic, "in today's fast-paced world", "not just X, but Y", adjectives in threes, "Designer. Developer. Dreamer."

Scope dodges (banned in project text): worked on, helped with, was involved in, contributed to (with no object), part of a team that, responsible for, spearheaded, drove, owned the vision. ("Led" only if the owner allows it.)

Result dodges (banned in result lines): improved, enhanced, optimised, streamlined, boosted, significant, successfully, efficiently, better UX, modern, clean, intuitive — unless followed by an object and a number.

Technical words on the home page: keep them out of titles, problems and results (API, multi-tenant, codebase, route, component, SSR, hydration, pipeline, endpoint, schema, runtime, refactor, migrate, implement). One hiring keyword may sit in a role line. The full stack goes in the case page's engineering section. If a technical word must stay, explain it in four words: "a passkey (no password)".

Translations for the home page:

| Engineer's word | Say instead |
|---|---|
| component | building block |
| route | page, screen |
| query | database request |
| tenant, multi-tenant | client organization; "each organization sees only its own data" |
| design token | colour, size and type rule |
| release | store release, update |
| migrate, refactor | move, rebuild |
| API, backend | the server behind the app |
| parity test | the same test, run on the old and the new app |

Em dashes: none in headings, rows, buttons and captions; at most 3 per 1,000 words in case prose. Use full stops. Ranges use an en dash only inside numbers (2021–2026).

Middots: at most one per line. Long "A · B · C · D" chains read as generated metadata.

## Project rows (home)

```
[Title ≤ 6 words]
[Problem ≤ 12 words, in the user's words — or what had to exist]
[Result ≤ 10 words, starting with a verb or a number]   ← the biggest text in the row
[Role word] · [Year range] · [Live link]
```

Index line (the rest of the work): `Title · Year · Role · one line ≤ 14 words`.

Order rows by strength for the primary reader (largest checkable change first), then live public products, then internal work. Never newest-first by default.

## Result lines without metrics

Most work has no measured metric. A result is still a fact:
- **Live** is a result: "Live in both app stores since 2022." Link it.
- A count you control: pages, languages, stores, releases, screens moved.
- A before/after you witnessed: "The report that timed out now finishes."
- A named consequence: "Members subscribe on the web and in both apps."
- A quote with name and role.

Never invent a percentage. Never write "improved" without what and by how much.

Result patterns: `[n] [unit], not [n].` ("2 database requests, not 16.") · `Live [where] since [when].` · `[Users] can [verb] [what] [where].` · `[Thing], built once, [used where].`

Work in progress: `[Users] keep [what] while [what changes].` then one witnessed fact. "Care teams keep using the app while each screen moves over. The billing report that timed out now finishes: 2 requests, not 16." Never a participle plus an aphorism ("Being rebuilt. Old bugs written down, not copied.") as the biggest text in a row.

## The hook line

The one line that names the mechanism (a clock, a dial, a switch label) is the hardest line on the page. ≤ 5 words, a fact the visitor can check, no instruction ("drag", "try", "click"). The control teaches itself through its affordance and focus state. "17:04 in Kosovo" works; "Drag the sun to change the time" does not.

## Case study page

Answer first, then the reasoning. 300–600 words above the engineering section; ≤ 2 minutes to read.

```
[Project name]                                    small line above the title
[Title = the result, ≤ 10 words]                  h1
[Summary ≤ 60 words: what it is, who uses it, what changed]
Role · Years · Platforms · Live                   facts row
[Hero screen, cropped to the part that proves the title; caption ≤ 8 words]

The product      ≤ 120 words. Who uses it, for what. Scope line inside the first 80 words:
                 "Built A and B. Teammates built C."
What was built   ≤ 120 words. 2–3 decisions: constraint → choice → consequence.
The result       ≤ 120 words. What shipped, where it is live, one witnessed before/after.
[2–3 numbers with plain labels, each sourced; mark the row data-numbers]
In short         3 one-line facts (for the skimmer)

For engineers    stack line, architecture, trade-offs, decision log, repo link. Unlimited.
Next case · CV
```

Rules:
- The title is the result, not the activity. "Care teams kept their app while it was rebuilt under them, one tested screen at a time." Not "Redesigning the reporting experience". If the owner keeps a number out of titles, the title states what users kept or gained; the number goes in the numbers row.
- Seniority shows through the size of the change, the time, and the kind of decision — not through rank words. One sentence of the form "The brief asked for X; the team shipped Y because Z" shows judgment.
- Each decision is ≤ 40 words: what limited the choice, what was chosen, what it caused.
- At least one date and one real screen per case.
- If the work is internal: say so in the caption ("Real product screens, invented data") and keep claims high level.

Structures: answer-first (Minto) for the top of every case and every row; problem → constraint → decision → result for the body; a dated decision log as an optional appendix. Process narratives (research → ideate → test) are skipped by reviewers in 2026; show trade-offs, not process.

## Microcopy

| Place | Rule | Example |
|---|---|---|
| Nav | 3–5 nouns, no "Home" | Work · About · CV · Email |
| Primary action | names the destination | See the work · Read the case |
| Contact | the address itself as text, plus reply time | hi@domain.com · replies within two days |
| About | 80–150 words: current place, years, base, what next, one personal fact | |
| Footer | name, year, email; a "built with" line only if it proves something | |
| 404 | one sentence, one link to the work, same voice | "No page here. The work is this way." |
| Captions | ≤ 8 words; say what it is and whether it is a recreation | "Pricing page, public." |
| Alt text | what the screen shows and why it matters | "Grocery cart with two items and the total" |

Flagged templates (replace): "Let's talk", "Let's work together", "Hire me", "Get in touch" (use the address), "Made with ❤️", "Selected work" (use "Work"), "Featured projects", "Services", "Testimonials", "What clients say", "Trusted by", "As seen in", a "Skills" grid, "100+ happy clients", "v2.0".

## Social proof

Only as verifiable items: logos that link to live work (3–6, below the first screen), one or two quotes with full name, role and company that name a specific thing, awards with a date and a link, counts the reader can check (stars, releases, stores). Never a marquee, star ratings, or counters that animate from 0.

## Checks

- `check.mjs`: T10–T10e (template phrases, scope dodges, result dodges, voice mix), T11 (em dashes), T30 (middot chains), T31 (cadence), T44 (triplets), T45 (numbers not in `--facts`).
- By hand: grep the voice; count words per row and per case section; trace every number to a source line.
