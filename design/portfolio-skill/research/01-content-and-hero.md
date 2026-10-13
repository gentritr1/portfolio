# Portfolio research 01: content, first viewport, writing

Date: 2026-10-07. Purpose: rules for the `portfolio-page` skill. Scope: what the page says, what the first screen holds, how the work is written. Builds on `design/art-directions/loop/PORTFOLIO-RESEARCH.md` (19 sites, copy rules, display rules) and `design/art-directions/CREATIVE-CONSULT.md` (M1–M11). Nothing from those files is repeated here unless a new source changes it.

## Method and limits

- Reading method. The session's proxy denied every host except GitHub (`raw.githubusercontent.com`). WebFetch failed on all 40 article and portfolio URLs tried (substack, medium, uxdesign.cc, nngroup, gov.uk, awwwards, muz.li, reddit, hacker news, beehiiv, archive.org, every personal domain). So articles were read through the search tool's page summaries, and portfolio heroes were read from their public source code on GitHub where a site is open source. About 100 searches were run before the search budget closed. Claims from summaries are marked [summary] and should be re-read at the source before they become hard rules.
- Evidence marks used below: **[measured]** a lab or log study with a number; **[survey]** a self-report survey with a stated sample; **[practitioner]** one hiring manager or recruiter's own account; **[folklore]** a number repeated across blogs with no traceable study; **[source]** read from the site's code; **[summary]** read from a search summary of the page; **[memory]** not verified this session.
- Portfolios whose code was read: antfu.me, taniarascia.com, nexxel.dev, braydoncoyer.dev, rauchg.com, craftzdog (Takuya Matsuyama), shud.in (layout only). Others come from award listings, curated lists and jury write-ups dated 2025–2026.

## Summary: the 15 rules that matter most

1. The first screen answers four questions in this order: who, what is built, for whom, where is the proof. Test: a reader with no context writes the four answers after 5 seconds.
2. The identity sentence is 20 words or fewer, has one verb, names the thing built and the people it is for, and has no adjective about the author. Test: count words; strike every adjective; the sentence still stands.
3. Proof is a noun, never an adjective: a named place, a year count, a store, a number. Test: every credibility word on the first screen is a place, a date or a count.
4. The claim is the largest text. The name is smaller than the claim. Test: measure font sizes.
5. One piece of real work is visible without scrolling, as a screen, not as a mockup or a card title. Test: capture at 1440 × 900 and 390 × 844; a product screen is in both.
6. Sentences average 14 to 20 words; none is above 25 on the home page or 30 on a case page. Test: a script counts.
7. No sentence on the home page needs a technical word to be understood by a recruiter. Test: the read-aloud test from PORTFOLIO-RESEARCH §2 rule 15.
8. The home page holds 3 to 5 featured items with a result line each, and one index of the rest. Test: count rows above the index.
9. A case study opens with the result, states scope (what the author did, what others did) within the first 80 words, and runs 300 to 600 words before the engineering appendix. Test: word count per section.
10. No metric is invented. A row with no measured result says what shipped and where it is live. Test: each number has a source file or a link.
11. Banned words (list in "Banned/flagged phrases") appear zero times. Test: grep.
12. Every motion or hook gives the visitor a fact, and the page works with it removed. Test: disable JavaScript and reduced motion; the four answers from rule 1 are still readable.
13. Social proof is shown only as a verifiable fact (a logo that links to live work, a quote with a name and role, an award with a date). Test: each item has a link or a name.
14. Nav has 3 to 5 words-as-links, all nouns: Work, About, Writing, CV, Contact. Test: no verbs, no "Home".
15. The page is one voice. Either first person throughout or no person throughout; never third person on the owner's own site, never a mix. Test: grep for "I ", "he ", "his ", "[Name] is".

## §1. How portfolios are actually reviewed

### 1.1 The numbers, and how much to trust them

| Claim | Source | Mark | Note |
| --- | --- | --- | --- |
| Recruiters spend 7.4 s on a first resume screen; 2012 version said 6 s | Ladders eye-tracking study (2018), via HR Dive | [measured] | Resumes, not portfolios. The "6 seconds on your portfolio" line is this study, moved. Fueler.io says this openly: "it was research on resumes, not portfolios". |
| Visual appeal is judged in 50 ms and colours later judgments (halo) | Lindgaard et al. 2006, Behaviour & Information Technology, via Nature News | [measured] | Lab study of web pages. It supports "look credible at a glance"; it says nothing about reading. |
| Users read about 20% of the words on an average page (28% at best) | NN/g, "How little do users read" (analysis of about 50,000 page views) | [measured] | Means every line on the home page competes for a fifth of the attention. |
| 93% of hiring managers would open a portfolio site if given one; 51% say chances are not lower without one | Profy.dev survey of 60+ hiring managers | [survey] | Small sample, developer roles. The site is read when offered; it is not a gate. |
| 54% of hiring managers take 5 to 10 min per portfolio; 35% about 5 min; 11% about 10 min; they phone-screen 5 to 10 people a week | ADPList blog, "What is a hiring manager looking for" | [survey] | Sample size not stated. Order of magnitude agrees with others. |
| 204 UX hiring professionals asked what they want: problem, role, constraints, timeline, iterations, what was left out and why; 3 to 5 case studies | NN/g, "UX design portfolios" | [survey] | Largest stated sample found. |
| 88% of HR professionals more likely to proceed with a candidate who shows experience through a portfolio; 31% of graduates have one | Nominet (UK) survey | [survey] | Older (2016 era), generic roles. |
| One lead screened 800+ portfolios in one quarter (2024) for a senior role; common failure: fuzzy success metrics added at the end | Micka, Substack | [practitioner] | B2B SaaS, remote, high bar on craft. |
| Reviewers "have limited time… minutes or even seconds"; common mistakes: too much text in project highlights, overcomplicated landing-page animation | Korin Harris, Figma recruiter, Figma blog and Dribbble | [practitioner] | |
| "Homepage gets 10 to 15 seconds; the review lasts 2 to 3 minutes; 78% of recruiters use AI screening first" | The Fountain Institute, 2026 | [practitioner] | Source data not found. Treat the seconds as an estimate and the 78% as unverified. |
| "Most portfolios get skipped in 20 seconds" | Eugene Trofimov (ex-Apple design lead), course page | [practitioner] | |
| "Only 30 seconds to reject your portfolio" | ADPList Substack | [practitioner] | Page blocked; title only. |
| "73% of hiring managers consider a portfolio more important than a resume (Stack Overflow 2024)" | Several 2026 listicles | [folklore] | Not in the 2024 Stack Overflow survey. A similar "72%" is credited to TechTimes with no study. Do not cite. |
| "84% of employers want working applications" | Several listicles | [folklore] | No source found. Do not cite. |
| "Filtered out in 60 seconds: 10 s home, 20 s project, 20 s code, 10 s GitHub" | hakia.com and dev.to posts | [folklore] | Plausible sequence, invented numbers. |

What survives: the first screen has single-digit seconds; the whole visit has single-digit minutes; the words are scanned, not read. Everything else is a sequence, not a stopwatch.

### 1.2 Order of attention

Every practitioner account describes the same path, in this order:

1. Who is this and what do they do. Fueler: "Who are you? What do you do? Is your work relevant? Is there enough evidence to keep looking?" Name plus a plain role beats a clever line: "Content Writer and SEO Specialist is clearer than Creative Storyteller."
2. The first project. NN/g, Figma, Fueler, ADPList: lead with the strongest work, not the newest. "A single, well-crafted case study can be more impactful than a dozen half-finished projects" (ADPList). Dribbble recruiter: "I'd rather see one project explained really well than five explained quickly."
3. Scope and result inside that project. Hiring managers want "the scale of the project, what you personally did, and what changed because of your work" (NTC, summarising first-round screening).
4. Evidence of level: titles, places, years, team size (UX Design Institute: "state level and team size").
5. Only then: process, craft details, about page.

### 1.3 Reader types

| Reader | Time | What they need in the first screen | What closes the tab |
| --- | --- | --- | --- |
| Recruiter | 10 to 30 s | Role words that match the req, location or time zone, a live link, a CV | Clever title with no role; a loader; a game to reach the work (VCU: "don't make me shoot something with my cursor to open a campaign") |
| Hiring manager / design lead | 2 to 5 min | The best case first; problem, role, decisions, result; honest scope | Walls of text (Figma); "looks identical to 40 other candidates" (hiring-manager feedback quoted in a 2026 guide); metrics with no source |
| Senior engineer | 5 min, then the code | What was hard, which trade-off was taken, what it cost; a live demo; a repo | Stack lists without decisions; "worked on"; claims the team's work as one's own (exposed by one follow-up question) |
| Founder | 60 s | One shipped thing with a user-visible result, and that the person can ship alone | Process diagrams; no product live anywhere |
| Design lead | 3 min | Craft visible in the site itself, plus one case that shows judgment over method ("advocate for what's best for the product instead of applying methods by the book", Micka) | Template portfolio; motion that hides the work |

Figma's recruiter names the real audience: "design managers, creative directors, or heads of design". Write for the manager; the recruiter is served by the same first screen if the role words are plain.

### 1.4 What changed in 2025–2026

- Shipped, traceable work over case studies; "show your trade-offs, not your process"; "cut anything that isn't real" (Fountain Institute's seven shifts). Reviewers suspect AI-polished case studies and ask what the candidate did versus the tool.
- Commit history and live URLs are read as proof because they are hard to fake (several 2026 developer guides; [practitioner]).
- Reviewers read on phones (ADPList: "many are accessing content on the go"). The phone first screen is the first screen.

## §2. The first viewport

### 2.1 Sites studied (not in PORTFOLIO-RESEARCH.md)

| # | Site | Mark | First screen holds | How work appears | Memorable thing |
| --- | --- | --- | --- | --- | --- |
| 1 | antfu.me (Anthony Fu) | [source] | "Hey! I'm Anthony Fu, a fanatical open sourceror and design engineer." Then four proof rows: Working at / Creator of / Core team of / Maintaining, each a row of named projects. | Link to a full project list; posts and talks. | The four rows. The sentence has "fanatical", "passion", "enthusiastic"; the rows carry the weight. |
| 2 | taniarascia.com | [source] | "Hey, I'm Tania! Principal software engineer, writer, all-around nerd." Then a dated timeline: 1998–2006, 2007–2014 (professional chef, "line cook to chef-manager by 22"), 2014–2020 (career change), 2021–now (principal, design systems; "40+ publications", "20,000+ stars on GitHub"). | Latest posts list. | A life in four dated lines with two numbers. |
| 3 | nexxel.dev (Shoubhit Dash) | [source] | Title line "Developer, cardist and maker of things." Sections "work" and "projects". | Rows: title · role ("creator and maintainer") · one line with numbers ("24k+ stars, 200+ contributors") · link. | Numbers inside the row, not in the hero. |
| 4 | rauchg.com (Guillermo Rauch) | [source] | No hero. Logo, "About", "Follow me". The identity lives in the meta description: "CEO and founder of Vercel… creator of Next.js, Mongoose, Socket.io". | A dated list of posts with live view counts. | The absence of a hero; the list is the person. |
| 5 | braydoncoyer.dev | [source] | "Hey, I'm Braydon! Welcome to my corner of the internet!" "I'm a front-end developer with a love for design and a knack for tinkering. This site is intentionally over-engineered…" Then "Here's what sets me apart and makes me unique". | Featured blog cards. | Warm, but every line is about the author, none about a built thing. The register thousands copy. |
| 6 | craftzdog-homepage (Takuya Matsuyama) | [source] | Pill: "Hello, I'm an indie app developer based in Japan!" Name. "Digital Craftsman (Artist / Developer / Designer)". Round photo. | Sections below. | This repo is a tutorial template. The pill + round photo + triplet is now a template marker on thousands of sites. |
| 7 | shud.in (Shu Ding) | [source, layout only] | Title "Shu Ding". Inter + Lora Italic + Iosevka, light only. | Not read. | Type as the whole identity. |
| 8 | Artiom Yakushev | [summary] | Awwwards SOTD 27 Dec 2025, Portfolio Honors Dec 2025; Muzli pick "creative digital designer". | Not read. | Award proof in listings, not on page. |
| 9 | Olha Lazarieva | [summary] | SOTD 2 Oct 2025, Developer Award, Portfolio Honors Sep 2025. | Not read. | Same. |
| 10 | Mariano Pascual | [summary] | A gamified retro-desktop site "you can literally play with" (ADPList, verified live Jul 2026). | Windows. | A costume by CREATIVE-CONSULT's M2 test unless the desktop is the only way to the work. |
| 11 | Jina Kim | [summary] | Minimal grid, typography and white space. | Grid of thumbnails. | Calm; the grid is the hero. |
| 12 | Sue Park | [summary, Case Study Club 2026] | Newest project first: "an interface for cooks working alongside a kitchen robot", documented while still shipping (2026, ongoing). Says the mindset is an engineer's. Footer: "Built with millions of tokens of love." | Dated cases, newest live first. | Current work as identity; a dated footer joke that is also a fact about method. |
| 13 | Tim Gesemann (design engineer, Adobe) | [summary, Colorlib 2026] | Clean, minimal; a prominent project section, then a timeline of work experience. | Project section first. | Projects above the bio. |
| 14 | Adham Dannaway | [summary] | Split screen: left half design, right half development, one face across both. | Below. | The split is the claim ("both") made as a picture. |
| 15 | Ilya Kulbachny | [summary, Design Shack 2025] | Typography and animation effects on the name. | Below. | Type effect; eye-catching, proof deferred. |
| 16 | David Eperozzi | [summary] | "Huge text to draw users in." | Below. | Same pattern as 15. |
| 17 | Allison Bratnick | [summary] | Masonry grid, clean imagery. | Grid. | Work first. |
| 18 | lynnandtonic.com (Lynn Fisher) | [summary] | Annual redesign; the responsive behaviour is the surprise; 10+ versions archived. | Archive of versions. | A yearly practice; the site is the proof. |
| 19 | haydenbleasel.com | [summary of his public profiles] | "Australian product designer and software engineer"; CPO at Corellium; side projects named. | List. | Title + company + named side projects. |
| 20 | fonsmans.com | [summary] | "Visual designer based in Rotterdam"; "featured by The New York Times, Figma, Product Hunt". | Visual experiments. | Proof as named publications. |
| 21 | jhey.dev | [summary of speaker bio] | "A web developer that thrives on bringing ideas to life with code"; hundreds of CodePen demos. | Demos. | A line that would be template on anyone else's site; the demo count earns it. |
| 22 | chloeyan.me | [summary, 2026 formats list] | "A garden you explore." | Explore. | Metaphor as navigation (M2). |
| 23 | Wora | [summary] | "A game you play." | Play. | M2 again; risky for recruiters. |
| 24 | Soon | [summary] | "A portfolio app store." | Store tiles. | The tile is the unit of work. |
| 25 | Fiona Fang | [summary] | "An immersive visual experience." | Scroll. | Eye-catching; the format list itself warns it suits only "builder" roles at "AI and innovative companies". |
| 26 | Mr Panda | [summary] | "A full illustrative story." | Scroll story. | Same. |
| 27 | ped.ro (Pedro Duarte) | [summary] | New site Feb 2024, written up by Sebastian De Deyne. | Not read. | Noted for process, not content. |

Reached for bios only, site not read: karrisaarinen.com, benji.org, uiw.tf, jsngr.com, ryo.lu, wattenberger.com, thesephist.com, cassie.codes, nerdy.dev, rsms.me, sarasoueidan.com, p5aholic.me, rog.ie, zenorocha.com, evilrabb.it, lochieaxon.com, delba.dev, samselikoff.com (all proxy-blocked).

### 2.2 Patterns that are eye-catching and credible in 5 seconds

1. **Proof rows under a short sentence** (antfu, nexxel, Tania, Hayden). The sentence can be plain or even warm; the rows do the convincing because they are nouns: places, projects, counts. Rule: at least one proof row in the first screen.
2. **Work before bio** (Gesemann, Bratnick, Jina Kim, Sue Park). The eye lands on a product screen; the words sit beside it. Rule: a real screen in the first viewport.
3. **A dated line** (Tania's timeline, Sue Park's "2026, ongoing", Lynn Fisher's yearly archive, rauchg's dated list). Dates are proof a reader can check against a CV. Rule: one date or year count in the first screen.
4. **The claim as a picture** (Dannaway's split). A visual that is the sentence, not decoration beside it. Passes M6.
5. **No hero at all** (rauchg). Works only when the list below is already famous work. Not for an unknown name.
6. **One typeface decision as identity** (shud.in). Credible because craft is visible in the page itself.

### 2.3 Patterns that are eye-catching but cost credibility

| Pattern | Why it catches | Why it costs | Evidence |
| --- | --- | --- | --- |
| Playable site (jeep, retro desktop, game) | Novel; shared | Recruiters "are usually not coders, they want info about you as quickly as possible" (three.js forum on Bruno-style sites); "don't make me shoot something to open a campaign" (VCU Brand Center) | [practitioner] |
| Giant name or type effect first | Fills the screen | Delays the four answers; the name is the least informative word | Design Shack 2025 lists; CREATIVE-CONSULT §1.2 |
| Warm welcome paragraph | Friendly | All lines about the author, none about a built thing; reads as the template it comes from | braydoncoyer, craftzdog sources |
| Scroll hijack / long intro animation | Cinematic | "A big no-no" for employer-facing portfolios (freeCodeCamp forum); Figma recruiter: "overcomplicating animations on their landing page" | [practitioner] |
| Hero video of many MB | Motion | "Recruiters on slow office Wi-Fi will close the tab" (summarised 2026 guide) | [practitioner] |
| Adjective stack ("fanatical", "passionate") | Energy | Unverifiable; only safe when a proof row sits directly beneath it (antfu) | [source] |
| Immersive story formats | Memorable | Their own advocates limit them to "builder" roles at a few companies | [summary] |

Rule from this: a hook may sit in the first screen only if the four answers are readable before, beside or inside it, without input.

## §3. Hero copy formulas

### 3.1 What works

Ten good identity lines (paraphrased, real-world style):

1. "Anthony Fu, open-source maintainer and design engineer. Working at NuxtLabs. Creator of Vitest and Slidev. Core team of Vue, Vite, Nuxt." (sentence + rows)
2. "Tania Rascia. Principal software engineer and writer. 2021–now: design systems and technical direction; 40+ publications; 20,000+ GitHub stars." (title + dated proof)
3. "Shoubhit Dash. Developer, cardist, maker of things." then "create-t3-app, creator and maintainer. 24k+ stars, 200+ contributors." (two words of identity; numbers in the row)
4. "Sue Park designs the interface for cooks working beside a kitchen robot. Shipping now (2026)." (the current product is the identity)
5. "Fons Mans, visual designer in Rotterdam. Work featured by The New York Times and Figma." (place + named proof)
6. "Hayden Bleasel, product designer and software engineer. Chief Product Officer at Corellium." (title + company)
7. "Tony Ward builds design systems so teams ship faster." (what, for whom, benefit; from PORTFOLIO-RESEARCH)
8. "Jakub Krehel, founding design engineer at X, which does Y." (one role word carries seniority)
9. "Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them. Part of two platform rewrites." (owner line, PORTFOLIO-RESEARCH §3.4, with the proof clause)
10. "Brittany Chiang, front-end engineer. Builds accessible interfaces for the web. Senior Frontend Engineer, Klaviyo, 2024–present." (job line as proof)

Ten lines that read as template:

1. "Hi, I'm X 👋 — a passionate full-stack developer crafting seamless digital experiences."
2. "Hello, I'm an indie app developer based in Japan! Digital Craftsman (Artist / Developer / Designer)." (a tutorial template, cloned thousands of times)
3. "Welcome to my corner of the internet! I'm a front-end developer with a love for design and a knack for tinkering."
4. "I craft meaningful experiences." (van Schneider: used by "90% of other designers")
5. "I push perfect pixels." / "I massage my hand-crafted, beautiful pixels." (Creative Bloq)
6. "Creative Storyteller." (Fueler's counter-example)
7. "Turning ideas into reality, one pixel at a time."
8. "Designer. Developer. Dreamer." (the triplet)
9. "Here's what sets me apart and makes me unique." (self-assessment as a heading)
10. "Building the future of the web." / "Bringing ideas to life with code." (earned only by someone with hundreds of public demos; template on anyone else)

Why the good lines work: each has a noun a stranger can verify (NuxtLabs, Klaviyo, Rotterdam, 2026, 24k stars). Why the bad lines fail: each is a self-rating ("passionate", "meaningful", "perfect") or a metaphor ("corner of the internet", "bringing to life"). Resume Worded's rule applies: "self-descriptions that any candidate can claim and no recruiter can verify" are deletion candidates.

### 3.2 Formula

```
[Name] [builds | designs | makes] [thing, 2–5 words] for [people, 1–4 words][, proof clause].
```

- Whole line: 20 words or fewer. Fueler's one-liner guidance: name the function and the context "in 15 words or less"; 20 is the hard limit, 15 the target.
- Verb: one, present tense, concrete (builds, designs, ships, writes). Not "is passionate about", not "crafts", not "helps … achieve".
- Thing: a product kind ("web and mobile apps", "design systems", "data tools"). No stack names in the sentence; one hiring keyword may sit in the role line under it (PORTFOLIO-RESEARCH §2 rule 6).
- People: "care teams", "shoppers", "engineering teams". If the thing is not for a group, name the company instead.
- Proof clause: a place, a count or a year range. "at Vercel", "since 2019", "two platform rewrites", "live in both app stores". Adjectives are not proof.
- Second line (optional, 12 words or fewer): location and availability, or the current place. "Based in Kosovo, working remotely." "Currently at X."

Name versus claim: the claim line is the largest text on the screen. The name is one size step smaller, or the same size only when the name is alone on its line and the claim follows at once. Never a giant name with a grey one-liner (CREATIVE-CONSULT §1.2). Tested by font size, not by taste.

Where proof goes: directly under the claim, as a row of nouns, before any image caption or nav. If the proof is a product, the product screen is the proof and the row can be shorter.

## §4. Writing the work

### 4.1 Structures compared

| Structure | Order | Best for | Cost |
| --- | --- | --- | --- |
| Answer-first (Minto) | Result → the 2–3 decisions that caused it → evidence | Every home row and the top of every case | Needs a true result; cannot be faked |
| Problem → constraint → decision → result | What was wrong → what limited the fix → what was chosen and why → what changed | Engineers' cases; shows judgment (Fountain: "trade-offs, not process") | Four short sections, not one essay |
| STAR | Situation, task, action, result | Interview answers; a 60-word summary block | Reads as HR copy if used as headings |
| Process narrative (research → ideate → test → ship) | Chronological | Junior designers proving method | 2026 reviewers skip it; "polished case studies… AI now handles" (Fountain) |
| Decision log | Dated list of decisions with reason and consequence | Long projects, platform rewrites, design systems | Must stay short: one line per decision |

Rule: home row and case opening use answer-first. The case body uses problem → constraint → decision → result. A decision log is an optional appendix.

### 4.2 Lengths

| Part | Words | Source |
| --- | --- | --- |
| Case title (the result) | ≤ 10 | UX University (prior); fueler "strongest project first" |
| Summary under title | ≤ 60 | PORTFOLIO-RESEARCH §2 rule 14; Leslie Yang's "short sections" |
| Facts row | 4 cells: role · years · platforms · live link | PORTFOLIO-RESEARCH §3 rule 24 |
| Scope line | ≤ 25, within the first 80 words | NTC and Blind threads on inflated scope |
| Each section (product / built / result) | ≤ 55 (owner) to 120 | Figma: "far too much text in project highlights" |
| Decisions | 2 to 3, ≤ 40 words each | UX Playbook Minto guide (prior) |
| Whole case above the engineering appendix | 300 to 600 | DEV (Brian Young, prior); UX University 500–600 |
| Engineering appendix | unlimited but headed "For engineers" | PORTFOLIO-RESEARCH §3 rule 28 |
| Reading time | ≤ 2 min per case; whole site ≤ 5 min | ADPList: "reviewable in 5 minutes"; case studies that "take about 20 minutes to read" are the named failure |

### 4.3 Engineers versus designers

- Designers are asked for the problem, the research that changed a decision, iterations, and what was left out and why (NN/g 204-person survey). The 2026 shift: fewer method diagrams, more trade-offs and shipped proof.
- Engineers are asked what the product does before the stack, what was hard, which option was rejected and what it cost, and a live link or repo. The write-up should read like a short design doc: context, constraints, options, decision, result. Avoid the "tutorial clone" smell: a to-do app with no users is not a case.
- Both: name the people the thing is for before the technology (PORTFOLIO-RESEARCH §2 rule 5).

### 4.4 Seniority without "I led"

Seniority is shown by three facts, not by a verb:

1. Size of the change: a rebuild, a platform, a design system with a count (36 components), a route-by-route migration.
2. Time: years on one product, number of releases, "kept current through three major upgrades".
3. Kind of decision: a decision only a senior person is allowed to make ("moved a live app one screen at a time", "chose two database requests over sixteen").

Micka's test from 800 portfolios: does the case show the candidate "advocating for what's best for the product" against the method? One sentence of the form "The brief asked for X; the case shipped Y because Z" shows seniority with no rank word.

### 4.5 Honest scope

Hiring managers screen on "the scale of the project, what you personally did, and what changed because of your work", and a follow-up question exposes team work claimed as one's own. So:

- Scope line pattern: "Built A and B. Teammates built C." Never "worked on", "helped with", "was involved in".
- If the author was one of N: "One of three frontend engineers; owned the dashboard and sign-in."
- If the work was internal and cannot be shown: say so in the caption ("Real product screens, invented data") and keep the claims high-level (LOOP-BRIEF content rule).

### 4.6 Results with no metrics

When no number was measured (most client work), the result is still a fact:

- "Live" is a result: a store link, a public URL, a launch date.
- A count the author controls: pages, languages, app stores, releases, screens migrated.
- A before/after the author witnessed: "the report that timed out now finishes" (no percentage).
- A named consequence: "members subscribe on the web and in both apps".
- A quote from the client or team, with a name and role.

Never: "improved", "enhanced", "optimised" without an object; invented percentages; "significant".

### 4.7 Titles that are results

Pattern: `[Thing] [verb in past or present] [the measurable or visible change]`. Ten words or fewer. The project name is the small line above the title.

- "One billing report: 16 requests became 2."
- "A grocery app, built once, live in both stores."
- "36 building blocks, released 20 times in six weeks."
- Not: "Redesigning the checkout experience", "A journey into design systems", "Case study: Acme".

### 4.8 Public case studies that work, and why

| Case | Why it works | Mark |
| --- | --- | --- |
| Simon Pan, Uber Magic 2.0 and Amazon Prime Music | Opens with a user and business problem in one sentence ("pickups were frustrating and inefficient for both users and drivers"); each section shows a decision, not a screen; closes on measured outcomes. Case Study Club calls it "the golden standard" hiring managers mean. | [summary] |
| Sue Park, kitchen-robot interface (2026) | Written while shipping; dated; the method is stated as a mindset; earlier cases (internal robot tools, 2023 bill-payment nudges) each name a user group and a behaviour change. The footer line proves method with a joke. | [summary] |
| Anthony Fu, project rows | Each row: name, one line of what it does, who maintains it, a number. The case is the row; depth is one click away. | [source] |
| Shoubhit Dash, create-t3-app row | "creator and maintainer" + "24k+ stars, 200+ contributors": role and result in 12 words. | [source] |
| Tania Rascia, timeline | Four dated lines turn a career into evidence; the two numbers are verifiable links. | [source] |
| Emil Kowalski, component articles | The demo is inside the text; the reader tries the claim (PORTFOLIO-RESEARCH row 2). | [prior] |
| Alex Couch, "9 micro case studies" | One screen, one problem, one decision, one result each; reads in 20 seconds; stacked, they show range. | [summary] |

Common to all: the problem is in the first sentence, the decision is named, the result is checkable, and the whole thing is short.

## §5. Text effectiveness

### 5.1 Readability standards, with their actual numbers

| Standard | Rule | Mark |
| --- | --- | --- |
| GOV.UK | Split any sentence over 25 words. Write for a reading age of 9, meaning the 5,000 common words adults recognise fastest; 1 in 7 UK adults read at Entry Level 3. Most people read about 25% of a page. | [practitioner standard]; the 25% is NN/g's 20–28% |
| Comprehension by sentence length | 14-word average: >90% understood; 43 words: <10%. 11 words "easy", 21 "fairly difficult", 25 "difficult", 29+ "very difficult". | [folklore-grade]: credited to American Press Institute studies of 410 newspapers; the primary paper is not online; GOV.UK and PR trainers repeat it. Use as a scale, not a fact. |
| US Federal Plain Language (plainlanguage.gov) | One idea per sentence. Average 20 words, none over 40. Paragraphs of one topic, five sentences or fewer. Active voice. | [standard] |
| ASD-STE100 (Simplified Technical English) | ≤ 20 words in procedures, ≤ 25 in description; one instruction per sentence; about 900 approved words; 53 rules; a word has one meaning and one part of speech. | [standard] |
| Hemingway | Default target grade 9; US adult average about grade 8; grade 6–8 for the widest reach. | [tool default] |
| NN/g | Users read about 20% of words; write concise, scannable, objective; highlighted keywords, one idea per paragraph, inverted pyramid. | [measured] |

Rules for the skill from these: average sentence 14 to 20 words, maximum 25 on the home page and 30 in a case; grade ≤ 8 on the home page, ≤ 9 on a case; one idea per sentence; one topic per paragraph of ≤ 55 words (owner) or ≤ 5 sentences.

### 5.2 Voice

- Van Schneider's rule: if the owner publishes the page, first person; third person on one's own site "reads as distant and slightly odd", "removes the human warmth", "robotic". Third person's only real use is copy-paste bios for conferences.
- The owner's current rule: no first person, never he/his. This is a third option: the no-person voice. "Gentrit Rashiti builds…" then "Built the sign-in screens. Teammates built the wallet." Trade-offs:
  - Gains: no "I led"; reads as a record, not a pitch; every sentence starts with a verb or a noun; it is the voice of a changelog, which fits the engineering material.
  - Costs: harder to show taste or a reason ("chose two requests because the report ran at month-end"); an about page with no person can read as cold; some sentences bend to avoid a pronoun.
  - Mitigation: allow one first-person paragraph on the about page only, labelled as such, or keep the no-person voice everywhere and add one quoted line from a client or colleague for warmth. Never mix voices within one page.
- Test: grep the home page and cases for `\bI\b`, `\bhe\b`, `\bhis\b`, `[Name] is`. Zero hits under the no-person rule.

### 5.3 Specificity, numbers, verbs

- A number a non-engineer can count beats a technical count (PORTFOLIO-RESEARCH §2 rule 7).
- Every number has a source line in content files. Micka's named failure is "fuzzy success metrics added at the end".
- Verbs: built, shipped, moved, cut, rebuilt, released, kept. Not: crafted, leveraged, spearheaded, delivered (without an object), enabled, empowered, drove.
- Nouns before adjectives: "a video-learning platform" not "a robust streaming solution".

### 5.4 Microcopy

| Place | Rule | Example |
| --- | --- | --- |
| Nav | 3 to 5 nouns. No "Home" (the logo is home). No verbs. | Work · Writing · About · CV |
| Primary action | One. A noun phrase or a two-word verb phrase that names the destination. | "See the work" · "Download CV" |
| Contact | The email address itself, as text, plus one line on reply time. No form on a personal site. | "hi@domain.com · replies within two days" |
| About | 80 to 150 words. Current place, years, where based, what the author wants next, one personal fact. | |
| Footer | Name, year, email, one line on what the site is built with only if it is a claim the site proves. | "Built with Astro. 0 kB of JavaScript on this page." |
| 404 | One sentence, one link to Work. Same voice as the site. | "No page here. The work is this way." |
| Captions | ≤ 8 words; say what the picture is and if it is a recreation. | "Pricing page, public." |
| Case facts row | Role · Years · Platforms · Live | |

Text per screen: the home first screen has ≤ 60 words outside the nav. Each further screen ≤ 120 words. A case page screen ≤ 150 words. A reader on a phone sees one idea per screen.

## §6. Information architecture

### 6.1 Pages

| Page | Keep | Cut |
| --- | --- | --- |
| Home | Identity sentence, proof row, 3–5 featured rows with results, index of the rest, contact | Skills grid, testimonial carousel, "services", stats counters |
| Case page (3–5 of them) | Result title, summary, facts row, one hero screen, three short sections, numbers, engineering appendix, next case | Process diagrams, sticky-note photos, persona cards |
| Index | One line per project: title · year · role · one line (≤ 14 words) | Thumbnails for everything |
| About | 80–150 words, a photo if the owner wants one, CV link | Life story over 300 words, skill bars |
| CV | A PDF and an HTML page with the same facts | |
| Writing | Only if there are 3+ posts | An empty blog |
| 404 | One line | A game |

### 6.2 Counts and order

- Case studies with full pages: 3 to 5 (NN/g), 3 to 4 (Leslie Yang), "max 3 great" (ADPList). Pick 3 to 5 and make them different in kind.
- Featured on home: 3 to 5 rows with results; PORTFOLIO-RESEARCH allowed 6 to 10 rows plus an index. New rule from the time budgets in §1: 3 to 5 featured, then the index. A reviewer who scrolls fast ("if there were many pages, they scrolled quickly and often didn't go through every page") sees all five.
- Order: strongest result first, never newest first (Fueler, ADPList). Then live public products. Then internal work. Then the index.
- Index versus featured: the index is for the second visit and for keyword search; it is never above a featured row.

### 6.3 Social proof

| Kind | Helps when | Reads as template when |
| --- | --- | --- |
| Client or employer logos | Each logo links to the live work or the case; 3 to 6 logos; names a recruiter knows | A marquee; logos with no link; "trusted by" |
| Testimonials | One or two, with full name, role, company, and a sentence that names a specific thing the author did | Three cards in a row with first names and stars; any quote with "pleasure to work with" |
| Awards | Dated, named, linked (Awwwards SOTD 2 Oct 2025) | Badges in the hero; "award-winning" as an adjective |
| Numbers | A count the reader can check (downloads, stars, releases, stores) | Counters that animate from 0; "100+ happy clients" |
| Press | A named publication with a link | "As seen in" strip |

The marketing claim that "testimonials can double conversion rates" comes from portfolio-platform blogs and was not measured on hiring outcomes; treat as [folklore] for portfolios. The 2026 hiring-manager feedback worth keeping is "looks identical to 40 other candidates": anything that looks like a SaaS landing section lowers trust on a personal site.

## §7. Hooks that are earned

### 7.1 What memory research says

| Effect | Finding | Use |
| --- | --- | --- |
| Von Restorff (isolation) effect, 1933 | Among similar items, the one that differs is remembered | One distinct element per page, not many. The hook must be the only odd thing on the screen. |
| Generation effect (Slamecka & Graf 1978; meta-analysis of 86 studies, d ≈ 0.40) | What a person produces is remembered better than what they read | The visitor should produce a fact: drag a seam and watch rows migrate, pick a quality and see the page change, type a word into a grid (CREATIVE-CONSULT 3.1, 3.2, 3.5). Reading a fact is weaker than making it appear. |
| 50 ms appeal judgment + halo (Lindgaard 2006) | First appeal colours later credibility | The first frame must already look finished; no loader, no empty state. |
| Primacy and recency | First and last screens are remembered most | The first screen and the footer or last case carry the hook and the contact. |
| 20% of words read (NN/g) | Text is scanned | The hook cannot depend on a paragraph being read. |

### 7.2 Earned versus gimmick

| Earned (remembered a week later) | Gimmick (remembered as "that site with the…") |
| --- | --- |
| A live demo of the actual product inside the page (Emil's drawer, the FJALË tiles) | A 3D blob with the screenshot refracted in it |
| One specific number with a plain label ("16 requests became 2") | An animated counter |
| A mechanism the visitor operates that reveals a fact (the seam, the quality menu) | A cursor-following orb |
| A dated practice (259 dailies, 10 yearly redesigns, "2026, ongoing") | "v2.0" captions |
| The claim drawn as a picture (Dannaway's split) | Split-flap text |
| A real place and time (Kosovo sun by the visitor's clock) | A fake boot log |
| A footer that proves a method ("Built with millions of tokens of love", next to a true AI-workflow story) | "Made with ❤️" |

### 7.3 Additions to CREATIVE-CONSULT M1–M11

- **M12 Generation.** The visitor makes the fact appear. Test: without the visitor's input, is the same fact still visible somewhere? It must be (rule 12), but the memorable path is the one they operate.
- **M13 Proof row.** Seniority as a row of nouns under the claim, the antfu pattern. Test: delete every adjective on the first screen; does the row still convince?
- **M14 Dated record.** The site is a record with dates: releases, redesigns, "ongoing". Test: is there a date on the first screen and on every case?
- **M15 Budget.** The hook costs ≤ 150 kB, ≤ 1 s before the four answers are readable, and nothing under reduced motion. Test: Lighthouse on a mid phone; reduced-motion capture shows the four answers.

## Rules for the skill

Each rule has a pass/fail test. R = rule.

**First screen**

- R1. The first screen holds exactly: name, identity sentence, one proof row, one real product screen, one primary action. Test: list every element in the 1440 × 900 and 390 × 844 captures; nothing else is present.
- R2. Identity sentence ≤ 20 words (target 15), one concrete verb, names the thing built and the people or company, no adjective about the author, no stack name. Test: word count; adjective strike; grep stack list.
- R3. Proof row: 2 to 5 nouns (place, year range, count, store), each a link where a link exists. Test: every item is a noun phrase; no adjective; links resolve.
- R4. Claim line font size > name font size, unless the name is alone on its line and the claim is the next line. Test: computed font sizes.
- R5. ≤ 60 words on the first screen outside nav. Test: count.
- R6. The product screen is a native-pixel crop, no mockup, captioned ≤ 8 words. Test: PORTFOLIO-RESEARCH §3 rules 6–12.
- R7. Primary action is one noun phrase or two-word verb phrase naming the destination; a second action may be "Download CV". Test: ≤ 2 actions; no "Let's talk", no "Hire me".
- R8. With JavaScript off and reduced motion on, the four answers (who, what, for whom, proof) are readable in the first screen. Test: capture both states.
- R9. No loader, intro animation, sound prompt or cursor effect before the first screen is readable. Test: first contentful frame contains the identity sentence.

**Copy**

- R10. Sentences: average 14–20 words; max 25 on home, 30 on cases. Test: script over page text.
- R11. Grade level ≤ 8 on home, ≤ 9 on cases (Flesch-Kincaid or equivalent). Test: readability script.
- R12. One idea per sentence; ≤ 1 comma on the home page; no semicolons on home. Test: regex.
- R13. Paragraphs ≤ 55 words (owner) and one topic. Test: count.
- R14. Zero hits from list A (self-ratings), list B (AI/marketing slop), list C (technical words on home) below. Test: grep, case-insensitive.
- R15. One voice. Under the no-person rule: zero `\bI\b`, `\bhe\b`, `\bhis\b`, `\bhim\b`, "[Name] is". Test: grep.
- R16. Every number has a source entry in the content file; no number appears that is not in CONTENT.md or the project data. Test: diff numbers in built HTML against content sources.
- R17. Technology names appear only in the role line (one) on home and in the "For engineers" section on cases. Test: grep stack list per section.
- R18. Verbs from the approved list (built, shipped, moved, cut, rebuilt, released, kept, designed, wrote, fixed, runs, opens, remembers, subscribes). Test: result lines start with a verb from the list or a number.

**Work rows and cases**

- R19. Home: 3 to 5 featured rows, each title ≤ 6 words, problem ≤ 12 words, result ≤ 10 words, role · year. Then one index. Test: count and measure.
- R20. Order: strongest result first; newest-first is a fail. Test: row 1 is the row with the largest checkable change.
- R21. Case title is the result, ≤ 10 words; project name is the small line above. Test: title contains a verb or a number.
- R22. Scope line within the first 80 words: "Built A and B. Teammates built C." Zero occurrences of "worked on", "helped with", "involved in", "contributed to" without an object. Test: position and grep.
- R23. Case body 300–600 words above "For engineers"; sections: The product / What was built / The result; 2–3 decisions with cause and consequence; 2–3 numbers with plain labels. Test: word count per section; decision count.
- R24. Each case has a facts row (Role · Years · Platforms · Live link) and ends with "Next case" and the CV link. Test: presence.
- R25. A case with no measured result states what shipped and where it is live; no "improved", "enhanced", "optimised" without an object and a number. Test: grep.
- R26. Each case has at least one date and one real screen (labelled if recreation or invented data). Test: presence.

**Structure and proof**

- R27. Nav: 3–5 noun links, no "Home". Test: count and part of speech.
- R28. Social proof only as verifiable items: logos that link, quotes with name + role + company, awards with date. No marquee, no star ratings, no animated counters. Test: each item has a link or a full attribution.
- R29. About page 80–150 words; CV in PDF and HTML with identical facts. Test: count; diff.
- R30. 404 is one sentence and one link. Test: count.
- R31. Whole site reads in ≤ 5 minutes at 200 wpm (home ≤ 250 words outside the index; each case ≤ 600 above the appendix). Test: total word count.

**Hooks and motion**

- R32. One hook per page; it gives the visitor a fact (M5/M12) and is removable without losing any fact (R8). Test: list hooks; count = 1; run the M2 "delete it" test.
- R33. Hook budget ≤ 150 kB gzip, ≤ 1 s to readable first screen on a mid phone, still frame under reduced motion. Test: Lighthouse mobile; reduced-motion capture.
- R34. No scroll hijack, no autoplay sound, no cursor follower, no hero video over 1 MB. Test: grep for scroll-snap on body, audio autoplay; file sizes.
- R35. At least one date on the first screen and on every case (M14). Test: regex for a year.

## Banned/flagged phrases

**List A: self-ratings and clichés (banned everywhere).** passionate, passion, enthusiastic, fanatical, dedicated, motivated, results-driven, results-oriented, detail-oriented, team player, hard worker, self-starter, go-getter, strategic thinker, think outside the box, creative (as a self-label), innovative, expert, guru, ninja, rockstar, wizard, unicorn, specialized, world-class, award-winning (as an adjective), meaningful experiences, delightful experiences, digital experiences, user-centric, human-centered (as a slogan), pixel-perfect, perfect pixels, push pixels, craft/crafting/crafted (as a self-description), bringing ideas to life, turning ideas into reality, corner of the internet, welcome to my, hi I'm, hello I'm, hey I'm, 👋, dreamer, maker of things (unless followed by named things), what sets me apart, unique, journey, story (as "my story"), love for, knack for.

**List B: marketing and AI-sounding words (banned everywhere).** seamless, robust, scalable, leverage, cutting-edge, state-of-the-art, best-in-class, next-generation, game-changer, revolutionize, elevate, empower, enable, unlock, delve, tapestry, landscape (metaphorical), navigate (metaphorical), realm, crucial, pivotal, vibrant, intricate, meticulously, unparalleled, testament, underscore, synergy, holistic, end-to-end (as a slogan), solutions (without an object), "in today's fast-paced world", "it's important to note", "not just X, it's Y", "Moreover", adjectives in threes, "Designer. Developer. Dreamer." triplets.

**List C: technical words banned on the home page (allowed in "For engineers").** From PORTFOLIO-RESEARCH §2 rule 8: tokens, tiers, parity, multi-tenant, tenant, API, codebase, route, component (in a result), store (app state), HLS, IVS, CSP, deep link, middleware, on-chain, gas, RN, consumer, floors, adapter layer, gate, ADR, schema, runtime, package, port. Added: SSR, SSG, hydration, monorepo, CI/CD, pipeline, microservice, endpoint, latency (use "slower/faster"), throughput, refactor (use "rebuilt"), migrate (use "moved"), implement (use "built"), utilize.

**List D: scope dodges (banned in cases).** worked on, helped with, was involved in, contributed to (without a named object), part of a team that, assisted, supported, collaborated on (without naming the split), responsible for, led (owner rule), spearheaded, drove, owned the vision.

**List E: result dodges (banned in results).** improved, enhanced, optimised, streamlined, boosted, increased engagement, significant, substantial, considerably, successfully, effectively, efficiently, better UX, modern, clean, intuitive.

**List F: microcopy templates (flagged; replace).** "Let's talk", "Let's work together", "Hire me", "Get in touch" (use the address), "Made with ❤️", "Built with Next.js" (unless the line proves something), "Selected work" (use "Work"), "Featured projects", "Home", "Services", "Testimonials", "What clients say", "Trusted by", "As seen in", "Skills" (as a grid), "100+ happy clients", "v2.0".

## Templates

### Hero copy template

```
[Name]                                   ← one size below the claim
[Name] builds [thing] for [people]
[, proof clause].                        ← ≤ 20 words total, 15 target, largest text
[Place] · [Years or current place]       ← ≤ 12 words
[Proof row: Place · Count · Store · Year range]   ← 2–5 nouns, linked
[One real product screen, native pixels, caption ≤ 8 words]
[See the work]  [Download CV]            ← 1–2 actions
```

Worked example (owner facts only):

```
Gentrit Rashiti
Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them.
Based in Kosovo, working remotely. Part of two platform rewrites.
App Store · Google Play · bayyinah.org · 2021–2026
[Bayyinah TV pricing page, public.]
See the work · Download CV
```

### Project row template (home)

```
[NN]  [Title ≤ 6 words]
      [Problem ≤ 12 words, in the user's words.]
      [Result ≤ 10 words, starts with a verb or a number.]   ← largest text in the row
      [Role word] · [Year]  · [Live link if any]
```

Index line: `[Title] · [Year] · [Role] · [one line ≤ 14 words]`.

### Case page template

```
[Project name]                               small line
[Result as title, ≤ 10 words]                h1
[Summary ≤ 60 words: what the product is, who uses it, what changed.]
Role · Years · Platforms · Live              facts row
[Hero screen, full width, cropped to the proving part; caption ≤ 8 words]

The product        ≤ 55–120 words. Who uses it, for what. Scope line here:
                   "Built A and B. Teammates built C." (≤ 25 words, within first 80 words of body)
What was built     ≤ 55–120 words. 2–3 decisions: constraint → choice → consequence.
The result         ≤ 55–120 words. What shipped, where it is live, one witnessed before/after.
[Numbers row: 2–3 numbers with plain labels, each sourced]
In short           3 facts, one line each (blind-test idea kept from LOOP-BRIEF round 11)

For engineers      stack line, architecture, trade-offs, decision log, repo link. Unlimited.
Next case · Download CV
```

Word budget: 300–600 above "For engineers". Reading time ≤ 2 minutes.

### Scope sentence patterns

- "Built the sign-in and dashboard screens. Teammates built the wallet."
- "One of three frontend engineers. Owned the player and the paywall."
- "Wrote most of the rules and the checks. AI agents build inside them. A person approves each change."

### Result sentence patterns

- "[Number] [unit], not [number]." — "2 database requests, not 16."
- "Live [where] since [when]."
- "[Users] can [verb] [what] [where]." — "Members subscribe on the web or in both apps."
- "[Thing], built once, [used where]."

## Sources

Access date for all: 2026-10-07. Reading method in brackets. Mark: M = measured, S = survey, P = practitioner, F = folklore-grade, SRC = source code read.

**Review behaviour**
- hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582 [summary] M (Ladders 2018; resumes).
- nature.com/news/2006/060109/full/news060109-13.html and blog.mastermaq.ca/2006/01/17/judging-websites-in-a-flash [summary] M (Lindgaard 50 ms).
- nngroup.com/articles/how-little-do-users-read [summary] M (20% of words).
- nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web [summary] M.
- nngroup.com/articles/ux-design-portfolios [summary] S (204 hiring professionals).
- profy.dev/article/portfolio-websites-survey [summary] S (60+ hiring managers; 93% / 51%).
- adplist.org/blog/what-is-a-hiring-manager-looking-for-in-a-design-portfolio [summary] S (5–10 min; 54/35/11%).
- nominet.uk/news/online-portfolios-impress-hiring-decision-makers [summary] S (88%, 31%).
- micka.substack.com/p/what-really-matters-when-hiring-product [summary] P (800+ portfolios, 2024).
- leslieyang.substack.com/p/what-a-hiring-manager-looks-for-in [summary] P.
- figma.com/blog/product-design-portfolio-tips-from-a-figma-recruiter [summary] P (Korin Harris).
- dribbble.com/resources/career/design-recruiter-portfolio-tips [summary] P.
- fueler.io/blog/your-portfolio-has-7-seconds-what-recruiters-look-at-first [summary] P (states the 7 s is from resumes).
- thefountaininstitute.com/blog/senior-product-designers-hired [summary] P (2026; 10–15 s and 78% unverified).
- joshcusick.substack.com/p/what-i-look-for-in-design-portfolios [summary] P (Michael Yap, Acorns, ex-Etsy).
- uxdesigninstitute.com/blog/hiring-managers-ux-portfolio [summary] P.
- indeed.design/article/ux-design-portfolio-advice-from-hiring-managers [summary] P.
- ntc.it.com/blog/hiring-managers-portfolio and teamblind.com threads on embellished scope [summary] P.
- maven.com/p/817a96 (Eugene Trofimov, "skipped in 20 seconds") [summary] P.
- adplist.substack.com/p/only-30-seconds-to-reject-your-portfolio [title only; blocked] P.
- news.ycombinator.com/item?id=23694414 "Ask HN: What makes a great personal website?" [summary] P.
- forum.freecodecamp.org/t/have-i-overdone-it-with-my-portfolio-updated/25383 and discourse.threejs.org/t/new-3d-portfolio-launch-400-hours-garrett-larson/76899 [summary] P (scroll hijack, 3D sites and recruiters).
- brandcenter.vcu.edu/job-career-resources/portfolio-sites-what-not-to-do [summary] P.
- hakia.com/skills/building-portfolio and dev.to/_d7eb1c1703182e3ce1782/best-developer-portfolio-examples-2026-2d8m [summary] F (73%, 84%, 60 s sequence: unsourced).
- survey.stackoverflow.co/2024 [summary] confirms the 73% is not in the survey.

**Portfolios (first viewport)**
- raw.githubusercontent.com/antfu/antfu.me/main/pages/index.md [SRC].
- raw.githubusercontent.com/taniarascia/taniarascia.com/master/src/pages/index.js [SRC].
- raw.githubusercontent.com/nexxeln/nexxel.dev/main/src/app/page.tsx and src/app/layout.tsx [SRC].
- raw.githubusercontent.com/rauchg/blog/main/app/layout.tsx, app/header.tsx, app/posts.tsx [SRC].
- raw.githubusercontent.com/braydoncoyer/braydoncoyer.dev/master/app/page.tsx [SRC].
- raw.githubusercontent.com/craftzdog/craftzdog-homepage/master/pages/index.js [SRC].
- raw.githubusercontent.com/shuding/shud.in/main/app/layout.tsx [SRC, layout only].
- awwwards.com/websites/winner_category_portfolio [summary; host blocked] (Yakushev SOTD 2025-12-27; Lazarieva SOTD 2025-10-02; Mangham; Bruno Simon).
- muz.li/picked/artiom-yakushev-creative-digital-designer [summary].
- adplist.org/blog/top-11-design-portfolio-examples-for-inspiration [summary] (Mariano Pascual; Jina Kim; verified live Jul 2026).
- casestudy.club/case-studies and casestudy.club/journal [summary] (Sue Park, 2026).
- colorlib.com/wp/developer-portfolios [summary] (Tim Gesemann, Anthony Fu).
- designshack.net/articles/inspiration/personal-portfolio-websites [summary] (Kulbachny, Eperozzi, Bratnick).
- edgeone.ai/blog/details/personal-website-examples and elementor.com/blog/best-personal-website-examples [summary] (Adham Dannaway, Brittany Chiang, Bruno Simon).
- beyourowndesignteam.beehiiv.com/p/6-trendy-ux-design-portfolio-formats-in-2026 [summary; blocked for fetch] (Chloe Yan, Wora, Mr Panda, Soon, Fiona Fang).
- web.dev/community-highlight-lynn-fisher and xd.adobe.com interview [summary] (Lynn Fisher).
- read.cv/haydenbleasel and spaces.is/loversmagazine/interviews/hayden-bleasel [summary].
- contra.com/fonsmans/about [summary].
- smashingconf.com/sf-2022/speakers/jhey-tompkins [summary].
- sebastiandedeyne.com/a-peek-behind-the-create-process-of-pedro-duartes-new-personal-site [summary].
- raw.githubusercontent.com/emmabostian/developer-portfolios/master/README.md [SRC; list only].

**Hero copy and voice**
- vanschneider.com/avoid-these-5-things-when-building-your-design-portfolio [summary] P ("I craft meaningful experiences"; "I'm Jessica Jones, a brand designer…").
- vanschneider.com/blog/portfolio-tips/portfolios-third-person [summary] P.
- vanschneider.com/blog/portfolio-tips/a-study-in-writing-a-compelling-portfolio-bio [summary] P.
- creativebloq.com/designer-creates-worst-portfolio-ever-7133792 [summary] P.
- laurakalbag.com/bio [summary] P (who publishes decides the person).
- resumeworded.com/resume-buzzwords-and-cliches-key-advice, roberthalf.com "10 tech buzzwords recruiters hate", livecareer.com/resources/resumes/resume-buzzwords [summary] P.
- LinkedIn overused buzzwords 2014 and 2017 lists via fortune.com and asicentral.com [summary] S (profile corpus).

**Case studies**
- designerup.co/blog/10-exceptional-product-design-portfolios-with-case-study-breakdowns [summary] (Simon Pan).
- lovable.dev/guides/11-ux-portfolio-examples and onething.design/post/ux-designer-portfolio [summary] (Simon Pan's Uber problem statement).
- smart-interface-design-patterns.com/articles/design-case-study [summary] P (Vitaly Friedman).
- blog.uxfol.io/product-designer-case-studies [summary] P.
- medium.com/alex-couch-s-portfolio/9-micro-case-studies-9a9e8584af3d [summary].
- uxplanet.org/4-tips-for-structuring-case-studies-in-your-design-portfolio-f7436fd460ec [summary].
- developing.dev/p/6-software-engineering-templates [summary] (design-doc shape).
- gradcoach.com/write-findings-chapter and asja.org on qualitative results [summary] (results without metrics).

**Readability and plain language**
- raw.githubusercontent.com/GSA/plainlanguage.gov/main/_pages/guidelines/concise/write-short-sentences.md [SRC].
- plainlanguage.gov Federal Plain Language Guidelines via revenue.ky.gov PDF [summary] (20-word average, 40 max).
- insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit [summary; blocked] and gov.uk/guidance/content-design/writing-for-gov-uk [summary].
- wyliecomm.com/2022/07/how-long-should-a-sentence-be and prsay.prsa.org 2009 [summary] F (American Press Institute figures; primary not located).
- en.wikipedia.org/wiki/Simplified_Technical_English and clickhelp.com STE article [summary] (ASD-STE100: 20/25 words, ~900 words, 53 rules).
- hemingwayapp.com/help/docs/readability [summary] (grade 9 default).
- stormid.com/blog/content-accessibility-part-1-speak-plainly and surreycc.gov.uk reading levels [summary] (reading age 9; 1 in 7 adults).
- embryo.com/blog/list-words-ai-overuses, gregbeazley.beehiiv.com top-50 AI words, ruben.substack.com/p/delve [summary] (AI word list).

**Memory and hooks**
- pubmed.ncbi.nlm.nih.gov/17645161 (Bertsch et al. 2007, generation effect meta-analysis) [summary] M.
- blog.logrocket.com/ux-design/von-restorff-effect-in-ux and sketchplanations.com/the-isolation-effect [summary] M (1933).
- marketingprofs.com/tutorials/memorableweb.asp [summary] (primacy, recency, attention).
- artfolio.com and pixpa.com testimonial articles [summary] F ("double conversion": platform marketing).
