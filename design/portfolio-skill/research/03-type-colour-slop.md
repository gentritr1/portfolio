# 03 · Type, colour, layout, and the slop detector

Research chapter for the `portfolio-page` skill. Date: 2026-10-07. Author: type direction and visual-design research pass. Scope: personal portfolio sites, 2024–2026.

How to read this file. Section 0 is the short list. Sections 1–3 are the visual chapter (type, colour, layout) with numbers. Section 4 is the slop catalogue: every tell has a severity and a heuristic a Playwright script can run against the rendered DOM and `getComputedStyle`. Section 5 turns those heuristics into pseudo-code. Section 6 is the positive checklist. Section 7 is the numbered rule set with pass/fail tests. Section 8 lists the fonts already in this repo with licences. Section 9 is the source list with access dates and a note on which pages were read in full and which only as search snippets, because the sandbox egress proxy blocked most independent blogs and vendor docs (925studios, capitalandcompute, prg.sh, codemyspec, dev.to, Fontshare, Awwwards, Typewolf, Tailwind docs, shadcn docs, Evil Martians, MDN, utopia.fyi, practicaltypography, Linear, Material). GitHub (web and raw) was open, so the detailed reads come from there.

Repo context used: `design/art-directions/CREATIVE-CONSULT.md` §1.2 (the owner's slop checklist), `DESIGN.md` (current system), `design/art-directions/loop/DIAGNOSIS.md` (why the loop converged), the impeccable skill's `craft-floor.md`, `typeset.md`, `colorize.md`, `layout.md`, and the impeccable detector config in `.impeccable/config.json`. The impeccable detector itself is a downloaded binary that is not cached in this sandbox, so its rule list could not be dumped; the rule ids visible in the references are `overused-font`, `bounce-easing`, `side-tab`, `icon-only`, `design-system-font-size`, `copy-paste`, plus the categories named in `hooks.md`: broken images, overflow and clipping, contrast and legibility, gradient text, glow shadows, design-system drift, and the deferred "copy cadence, palette and typography taste, layout rhythm" pass. The upstream README describes "60 deterministic rules" including side-tab borders and purple gradients, line length, padding, touch targets and heading hierarchy. Section 4 marks which of our tells overlap so the skill runs impeccable for source-level checks and our detector for rendered-DOM checks, not both for the same thing.

---

## 0. Summary: the fifteen visual rules that matter most

1. **One deliberate display face, chosen for the page's rule, never Inter, Geist, Roboto, Poppins, DM Sans or the system stack.** The body face may be quiet; the display face is the identity. A page whose largest text is Inter or Geist reads as a template in 2025–2026 (sources: Hallmark `typography.md` banned list; madegooddesigns "Inter signals template"; anti-ai-slop rule 2).
2. **One type scale, one ratio, fluid.** Body 16–18 px, ratio 1.2 at 320 px to 1.25–1.333 at 1440 px, every size a `clamp()` (Utopia method). Display capped at 6 rem unless the type is the picture, in which case it is sized to the viewport on purpose (`20vw`), not by the scale.
3. **Tracking by size.** Display −0.02 to −0.04 em (floor −0.04, DESIGN.md rule), headings −0.01 to −0.02 em, body 0, small text +0.01 to +0.02 em, caps labels +0.06 to +0.12 em. Never track numerals before setting `tabular-nums`.
4. **Leading by size.** Display 0.95–1.05 (all-caps floor 1.0), headings 1.1–1.2, lede 1.35–1.45, body 1.5–1.65, captions 1.3–1.4. Wider measure gets more leading; mobile gets less (Google Fonts Knowledge: 115–150 % band, 90–100 % for 72 px display).
5. **Measure 45–75 ch, target 60–68 ch, set in `ch`.** Captions 35–45 ch. Nothing in a reading role wider than 75 ch at any viewport.
6. **Numerals and features are decisions.** `tabular-nums` on any column of numbers, years, counters; `oldstyle-nums` in serif prose; slashed zero in mono data; `font-optical-sizing: auto` where an `opsz` axis exists; `text-wrap: balance` on headings of four lines or fewer; `text-wrap: pretty` on body.
7. **Tinted neutrals, never Tailwind grey.** Paper 95–98 % L, ink 16–22 % L, both with chroma 0.005–0.02 toward one anchor hue. Tailwind gray/zinc/slate sit at hue 257–286° and carry the "cool default" look; `gray-400` on white is 2.54:1 and fails body text.
8. **One accent with a job, under 5 % of any viewport,** or a committed two- or three-colour identity with reasons (mustard + blue + black is a palette; paper + cobalt is a default). The banned thing is not dark grounds; it is dark + one lone neon + glow.
9. **No hue 255–315° at chroma above 0.15 unless the brief names it.** Tailwind indigo-500 is oklch(58.5 % 0.233 277); the indigo-to-violet gradient is the single most recognised AI signature (Wathan's August 2025 apology for `bg-indigo-500`).
10. **Contrast measured, both ways.** WCAG 2.2: body 4.5:1, large and UI 3:1. APCA: body Lc 75 minimum, Lc 90 preferred, secondary text Lc 60. Secondary text is never a grey from a palette unrelated to the ground.
11. **Dark mode is composed, not inverted.** Ground 12–16 % L tinted, surfaces step up ~3 % L per level, text 92–96 % L not #fff, accent loses 0.02–0.04 chroma and gains 5–10 % L, body weight +25 to +50 or leading +0.05. No glow shadows.
12. **Twelve-column grid used asymmetrically** (5/7, 4/8, 3/9) with one primary axis and one deliberate break. The first viewport contains real work at 25 % or more of the viewport area and the owner's name at 10 % or less of the viewport height.
13. **No hero template.** No pill eyebrow, no centred stack, no primary + ghost button pair, no "Hi, I'm", no typewriter, no scroll cue. One action at most in the first viewport.
14. **Section rhythm varies.** Consecutive sections differ in ground, width, rule or padding. Four sections with identical padding, identical container width and centred headings is a fail.
15. **Copy is specific.** Proper nouns, numbers from CONTENT.md, places. No triplets, em dashes under 5 per 1,000 words, and none of the banned phrases ("crafting digital experiences", "let's build something amazing together", "passionate about", "seamless", "elevate").

---

## 1. Typography

### 1.1 What award-level portfolios actually set in 2024–2026

What the strong sites use, from the Typewolf Site-of-the-Day archive for 2025 (search snippets; the site itself was blocked), Awwwards winners, and the French agency survey Digidop published for 2025:

- Commercial neo-grotesques and their monos dominate: Söhne and Söhne Mono (Klim), ABC Diatype and Diatype Mono (Dinamo), PP Neue Montreal (Pangram Pangram), Aeonik (CoType), FK Grotesk (Florian Karsten), Apfel Grotezk (Collletttivo), Berkeley Mono (Berkeley Graphics). Examples: Kin (Jan 2025) sets Tobias + Söhne + Söhne Mono; Athletics (Jan 2025) sets Feature + Söhne; Gardener (Feb 2025) sets Neue Montreal; Speakeasy (Dec 2025) sets Tobias + Diatype.
- Serif display is back and is often the whole identity: Tobias, Feature, GT Alpina (Grilli), PS Times, Editorial New. The trend write-ups agree: "neo-grotesques have displaced geometric sans-serifs in premium work, and editorial serifs are experiencing their strongest moment in decades" (weandthecolor, 2025).
- Variable fonts are the norm; width and optical-size axes are used as decisions, not left at default.
- The thing that now reads as a template is the "cyber serif" recipe sold as a style kit: a serif display (often Newsreader or Instrument Serif), Inter for body, Space Grotesk mono-style caps labels, #050505 ground, one emerald accent (#10b981), glass cards and spotlight hovers (superdesign.dev "Cyber Serif Style"). Every ingredient of that recipe is a tell in Section 4.

Licence reality, because the skill forbids remote fonts:

- Pangram Pangram trials are personal, non-commercial; a web licence starts around $30 per family. Not usable without purchase.
- Fontshare (ITF Free Font License) allows commercial use but, according to the summaries we could reach, restricts uploading the files to a public server; the EULA contemplates delivery from ITF's own API. Fontshare's own licence page was blocked, so treat Satoshi, Switzer, General Sans, Cabinet Grotesk, Gambetta, Sentient, Tanker and Zodiak as **not self-hostable until the licence is read in full**. This is why the pairing table below is built from OFL faces.
- Klim, Grilli, Dinamo, Displaay, Colophon are paid. They are listed only as the look to aim at; each row names a free face with the same character.

### 1.2 Why "Inter / Geist / system everywhere" reads as default, and when it is fine

Why it reads as default: Inter has been the house face of GitHub, Figma, Linear and Mozilla since 2017 and "the sans-serif that just works on screens"; Geist arrived on Google Fonts in October 2024 and passed 3.5 million downloads. Both are the statistically likely output of any generator trained on 2019–2024 Tailwind code. The anti-slop skills published in 2025–2026 all list them: Hallmark bans Inter, Roboto, Open Sans, Lato, Poppins, Source Sans, Nunito, Montserrat, Raleway, Work Sans, DM Sans and `system-ui` as display faces; anti-ai-slop's rule 2 is "never the system font or Inter/Geist flat". The problem is not the drawing. It is that the display voice is absent, so the page has no author.

When it is fine:

- When the display voice is carried by something else that is unmistakably authored: a drawn or bitmap letterform (LINJA's 5×7 discs), a real object (FORM's trefoil), or type-as-image in another face. Then Inter or Mona at 15–17 px as the quiet body is correct.
- When the whole system is a committed monochrome engineering world with the tracking, hairlines and themed browser surfaces done to the end, the way Vercel does with Geist (very tight negative tracking at display size, shadow-as-border, no decorative weights). That is a rule pushed far (M1), and the test is whether every other decision on the page obeys it.
- Never as the only face, and never as the largest text on the page with nothing else carrying identity.

Test for the skill: cover the display type with your hand. If the page could be anyone's, the face is wrong even if it is beautiful.

### 1.3 Pairing table

All faces are SIL OFL 1.1 unless marked. "Local" means the WOFF2 is already in `public/fonts` or `public/fonts/creative` (Section 8). Sizes are display ranges at 1440 / 390 px. "Looks like" names the commercial face the pairing stands in for.

| # | Personality | Display (foundry) | Body (foundry) | Mono / outlier | Self-host | Display size 1440 / 390 | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Editorial | Fraunces (Undercase) `opsz` 144, `wght` 500–700, `SOFT` 100 | Libre Franklin (Impallari) 400 | JetBrains Mono (JetBrains) | Local, local, local | 72–120 / 40–48 px | Looks like GT Alpina / Tobias. Use roman; the `WONK` axis is the personality, not italics. |
| 2 | Editorial | Newsreader (Production Type) `opsz` 72, `wght` 500 | Gentrit Text = Mona Sans (GitHub) 400 | Gentrit Technical Mono = IBM Plex Mono | Local | 64–104 / 38–44 px | Looks like Feature / Editorial New. Keep italic for body emphasis only. |
| 3 | Editorial | Instrument Serif (Fuenzalida & Egstad) 400 | Instrument Sans (same) 400–500 | Fragment Mono (Wei Huang) | OFL, download from google/fonts | 72–128 / 44–52 px | Caution: the 2025 startup default when used as an italic accent word. Allowed only roman and only as the whole headline. |
| 4 | Editorial, reading | Literata (TypeTogether) `opsz` 7–72, `wght` 500 | Literata 400 for prose, Public Sans 400 for UI | Martian Mono | Local | 56–88 / 36–42 px | Made for e-readers; the FACING PAGES brief. |
| 5 | Editorial, classic | EB Garamond (Duffner) 500 or Cormorant Garamond (Catharsis) 600 | Schibsted Grotesk (Bakken & Bæck) 400 | Fragment Mono | Cormorant local; others google/fonts | 72–120 / 44–52 px | Looks like Caslon-style startup serifs; Cormorant needs ≥ 20 px for body-adjacent roles. |
| 6 | Technical | Gentrit Display = Hubot Sans (GitHub) `wdth` 80–120, `wght` 200–900 | Gentrit Text = Mona Sans 400 | JetBrains Mono | Local | 64–112 / 40–48 px | The width axis is the decision: condensed 900 or extended 200, not regular. |
| 7 | Technical | Host Grotesk (Element Type) 700, uniwidth | Host Grotesk 400 | Fragment Mono | google/fonts | 56–96 / 36–44 px | Uniwidth: weight changes do not reflow. Single-family systems need a second axis of contrast (size, colour). |
| 8 | Technical, one face | Martian Mono (Evil Martians) 400/700 only | Martian Mono 400 | none | Local | 40–64 / 28–32 px | The LEDGER rule: one mono, two weights, everything. Only legal when the density is the identity. |
| 9 | Technical, monochrome | Geist (Vercel) 600, tracking −0.04 em | Geist 400 | Geist Mono | google/fonts | 56–96 / 36–44 px | Flagged. Permitted only in a committed Vercel-style system with hairlines and themed surfaces; the detector warns. |
| 10 | Technical, humane | IBM Plex Sans (IBM) 600 | IBM Plex Sans 400 | IBM Plex Mono (local) | google/fonts; mono local | 56–96 / 36–44 px | Plex's rationalist grotesk reads engineered without reading Vercel. |
| 11 | Warm / humanist | Bricolage Grotesque (Mathieu Triay) `opsz` 12–96, `wght` 700–800 | Public Sans (USWDS) 400 | IBM Plex Mono | Local | 64–112 / 40–48 px | Trending 2025; its display optical size is the point. Do not pair with Inter (the snippet pairing). |
| 12 | Warm / humanist | Literata 600 | Libre Franklin 400 | Courier Prime (receipt roles) | Local | 56–88 / 36–42 px | AISLE-style warmth. |
| 13 | Warm / humanist | Funnel Display (NORD ID, 2024) 600–700 | Funnel Sans (NORD ID) 400 | Fragment Mono | google/fonts | 64–104 / 40–48 px | New enough to not yet be a default; tight and slightly condensed. |
| 14 | Playful | Syne (Bonjour Monde) 800 | Schibsted Grotesk 400 | Fragment Mono | google/fonts | 72–140 / 44–56 px | Wide, extravagant at 800; needs a plain body. |
| 15 | Playful | Unbounded (NaN) 700–900 | Public Sans 400 | JetBrains Mono | google/fonts; body local | 64–120 / 40–52 px | Looks like PP Monument Extended. Keep the headline to five words. |
| 16 | Playful, pixel | Jersey 10 (Sarah Cadigan-Fawcett) 400 | Courier Prime 400 | none | Local | 48–96 / 32–40 px | Only under a pixel rule (SAVEFILE). Bitmap type outside a bitmap world is a costume. |
| 17 | Brutalist / Swiss | Anton (Vernon Adams) 400 | Archivo Narrow (Omnibus-Type) 400 | Martian Mono | Local | 96–200 / 56–72 px | Poster face; set the whole page in it including the small print, or do not use it. |
| 18 | Brutalist / Swiss | Big Shoulders Display (Patric King) 100–900 | Public Sans 400 | Martian Mono | Local | 96–240 / 56–80 px | Looks like Druk. The weight axis across one word is the move. |
| 19 | Swiss, current system | Archivo (Omnibus-Type) `wdth` 82 % names, 100 % intro, `wght` 520–600 | Archivo 400 | Martian Mono | Local | 48–112 / 38–45 px | DESIGN.md as shipped. Correct, and the thing the consult says is one direction across twelve drafts. |
| 20 | Swiss, geometric | Space Grotesk (Florian Karsten) 700 | Space Grotesk 400 or Public Sans | Fragment Mono | google/fonts | 56–96 / 36–44 px | Looks like FK Grotesk. Became the "startup grotesk"; use only with a non-startup palette. |
| 21 | Luxury | Cormorant Garamond 500–600, caps tracked +0.08 em | Public Sans 300–400 or Mona 300 | none | Local | 80–140 / 48–56 px | Looks like Canela / Domaine. Large sizes only; the hairlines disappear below 24 px. |
| 22 | Luxury, soft | Fraunces `opsz` 144 `wght` 300 `SOFT` 100 | Literata 400 | none | Local | 72–128 / 44–52 px | Light display serif with a dark reading serif. No sans at all. |
| 23 | Luxury, modern | DM Serif Display (Colophon) 400 | Schibsted Grotesk 400 | Fragment Mono | google/fonts | 64–112 / 40–48 px | Colophon's free face; do not pair with DM Sans (the default pairing). |

Faces that now read as template and are warned on sight: Inter, Geist (as display), Roboto, Poppins, Montserrat, DM Sans, Work Sans, Nunito, Raleway, Lato, Open Sans, Playfair Display, Merriweather, Lora, Space Grotesk in all-caps mono-style labels, Instrument Serif as an italic accent word.

### 1.4 Type tokens

One ratio for the text steps and a separate, larger jump to display, because a modular scale that reaches 112 px from 16 px needs seven steps at 1.333 and produces sizes nobody uses in between.

Fluid formula (Utopia): for a step with min size `a` at viewport `Wmin` and max size `b` at `Wmax`, slope `s = (b − a) / (Wmax − Wmin)`, intercept `i = a − s × Wmin`, then `clamp(a, i + s×100vw, b)`. With `Wmin = 320`, `Wmax = 1440`.

| Role | Size (px at 320 → 1440) | `clamp()` | Line-height | Tracking | Weight | Features |
|---|---|---|---|---|---|---|
| display | 40 → 96 (cap 96; type-as-image uses `vw` directly) | `clamp(2.5rem, 1.5rem + 5vw, 6rem)` | 0.95–1.02 (caps ≥ 1.0) | −0.03 em (floor −0.04) | per face | `text-wrap: balance`, `opsz` auto |
| h1 | 32 → 56 | `clamp(2rem, 1.57rem + 2.14vw, 3.5rem)` | 1.05–1.1 | −0.02 em | 600–700 | balance |
| h2 | 26 → 36 | `clamp(1.625rem, 1.45rem + 0.9vw, 2.25rem)` | 1.1–1.2 | −0.015 em | 600 | balance |
| h3 | 20 → 24 | `clamp(1.25rem, 1.18rem + 0.36vw, 1.5rem)` | 1.2–1.3 | −0.01 em | 600 | |
| lede | 18 → 22 | `clamp(1.125rem, 1.05rem + 0.36vw, 1.375rem)` | 1.35–1.45 | 0 | 400 | measure ≤ 60 ch |
| body | 16 → 17 | `clamp(1rem, 0.98rem + 0.09vw, 1.0625rem)` | 1.5–1.65 | 0 | 400 | `text-wrap: pretty`, measure 60–68 ch |
| small | 14 | fixed | 1.4 | +0.01 em | 400 | |
| caption | 12–13 | fixed | 1.3–1.4 | +0.015 em | 400–500 | measure 35–45 ch |
| label (caps) | 11–12 | fixed | 1.2 | +0.06 to +0.12 em | 500 | ligatures off when tracked |
| mono data | 11–14 | fixed | 1.2–1.4 | 0 | 400 | `tabular-nums`, `zero` |

Rules that go with the table:

- Dark-mode compensation: body line-height +0.05, weight +25 to +50 (or Hallmark's inverse, weight −50 when the face blooms), tracking +0.005 em. Measure and sizes unchanged.
- `font-synthesis: none` everywhere; declare every weight used in `@font-face`, no faux bold or faux italic.
- Variable axes: `font-optical-sizing: auto` for Fraunces, Bricolage, Literata, Newsreader (browsers map px to `opsz`); `font-stretch` for Archivo and Hubot width; `font-weight` at any integer, not only hundreds. Driving an axis from scroll or pointer is allowed on one element with `contain: layout`.
- Numerals: `font-variant-numeric: tabular-nums` on tables, years, counters, timetables; `oldstyle-nums` in serif prose; `slashed-zero` in mono. Tracking numerals before choosing tabular vs proportional is the classic mistake (Google Fonts Knowledge, "Track carefully or not at all").
- Kerning stays on; ligatures stay on except in tracked caps labels.
- `text-wrap: balance` on headings of six lines or fewer (Chromium's limit); `text-wrap: pretty` on paragraphs. Support: balance in Chrome 114, Firefox 121, Safari 17.4; pretty in Chrome 117, Firefox 128, Safari 17.4 (WebKit's version adjusts whole paragraphs, not only the last lines). Both are progressive enhancement.
- `hanging-punctuation: first last` is Safari-only; for quotes in display sizes use a span with a negative margin equal to the glyph's advance (the Google Fonts Knowledge fallback).
- Measure is set with `max-width` in `ch` on the text element, never inherited from a 1280 px container; `ch` is the width of the face's zero, so the value differs by family (65 ch in Literata is wider than 65 ch in Archivo Narrow).

---

## 2. Colour

### 2.1 Palette strategies seen on strong portfolios

| Strategy | What it is | Who does it | Numbers |
|---|---|---|---|
| Paper and ink, tinted | A near-white and a near-black that share one hue, nothing else chromatic except what the work brings. | mek.gallery (cream), designeer.xyz, most editorial portfolios | Paper 95–98 % L, chroma 0.005–0.02; ink 16–22 % L, chroma 0.005–0.015; same hue ±15°. |
| Near-black, work is the colour | A dark ground so the screenshots are the only colour. | offgrid.inc | Ground 14–18 % L, chroma ≤ 0.01; captions 70–75 % L; no accent at all. |
| One accent with a job | One chromatic colour reserved for focus, links, selection, the current row. | Linear, Vercel, the current DESIGN.md (cobalt) | Accent chroma 0.12–0.27, footprint under 5 % of any viewport. |
| Colour taken from the work | The page ground or margin takes the dominant hue of the current screenshot. | sampled-* loop drafts | Needs a quantiser: snap the sampled hue to one of 6–8 curated hues, clamp chroma ≥ 0.12 and L to 55–72 %. The loop's muddy maroons came from fixed L/C with no snapping (DIAGNOSIS §1c). |
| Per-project colour | Each case page owns one flood colour; the shell stays neutral. | studio case pages, Riso posters | Flood 60–85 % L for light inks, 25–45 % L for light text; the shell never inherits. |
| Monochrome plus image colour | Everything grey-tinted; photography supplies the only chroma. | photography portfolios | Ground and ink chroma ≤ 0.01; images untouched. |
| Committed two- or three-colour identity | Colours with reasons: mustard field + ink + one cobalt; safety yellow on matte black; oxblood + paper + gold. | FJALËKRYQ, LINJA, FACING PAGES, DEAL | Each colour has a named job; the third is used once. |

The loop's "one accent" rule banned the last row by accident; DIAGNOSIS §3 is right that the ban should be "no dark ground with a lone neon accent and nothing else".

### 2.2 OKLCH workflow

1. Choose the anchor hue from the material (the work, the place, the metaphor), never from a category ("tech = blue").
2. Set paper and ink in OKLCH with that hue at chroma 0.005–0.02. Pure #fff / #000 are warned; zero-chroma grey next to a chromatic accent reads lifeless (Hallmark `color.md`; the 0.005–0.01 threshold is shared across the design-token skills we found).
3. Build the neutral ramp by stepping L only: 98, 95, 90, 82, 68, 46, 30, 20 % keeps chroma constant and the hue fixed. Radix's twelve-step semantics are a good role map: 1–2 backgrounds, 3–5 component states, 6–8 borders, 9–10 solid, 11–12 text.
4. Pick the accent at chroma 0.12–0.27 and check gamut (sRGB clips above ~0.27 for most hues; provide a `@supports (color: oklch(0 0 0))` fallback hex).
5. Derive secondary text from the ground hue, not from a grey palette: L 45–50 % on light paper, 70–75 % on dark ground, chroma ≤ 0.03.
6. Dark theme: paper 12–16 % L, ink 92–96 % L, accent −0.02 to −0.04 chroma and +5–10 % L, surfaces +3 % L per elevation level, no shadows for elevation.
7. Measure every text/ground pair (Section 2.3) and record the ratios next to the tokens.
8. Mix in `oklab` (`color-mix(in oklab, …)`) for hover and tint states, never in sRGB.

### 2.3 Contrast: WCAG 2.2 and APCA

- WCAG 2.2 (normative): body text 4.5:1; large text (≥ 24 px, or ≥ 18.66 px bold) 3:1; non-text UI and focus indicators 3:1 (1.4.11).
- APCA (WCAG 3 draft, not normative, useful for small and light-on-dark text): Lc 90 preferred body, Lc 75 minimum body (> 18 px), Lc 60 medium text (> 24 px), Lc 45 large (> 36 px) or sub-fluent text, Lc 30 any spot text, Lc 15 the invisibility point. Lc 45/60/75 roughly correspond to 3:1, 4.5:1, 7:1 but are not interchangeable; for backward compatibility use Lc 58/72/85.
- Rule for the skill: pass both. Body ≥ 4.5:1 and ≥ Lc 75; secondary text ≥ 4.5:1 and ≥ Lc 60; labels ≤ 13 px ≥ Lc 75 regardless of ratio; placeholder text 4.5:1.
- The usual failures, measured: Tailwind `gray-400` #9CA3AF on white is 2.54:1; `zinc-400` on white 2.56:1; `gray-500` #6B7280 on white 4.83:1 (passes, but it is the generic grey); `indigo-500` #6366F1 on white 4.47:1 (fails by a hair, which is why so many indigo buttons have white text that fails).

### 2.4 Dark mode done well versus "dark + one neon accent"

Done well: a tinted near-black (oklch 12–16 % L, chroma 0.005–0.015), elevation by lightness steps of about 3 % per level (Material's overlay idea, 5–12 % white at the top levels), text at 92–96 % L, body weight or leading compensated, borders from the lightness ramp, accent desaturated and lightened so it does not vibrate, and no glow. Vercel's version swaps borders for zero-offset shadows and keeps the only accent for state.

The template: #000 or #0a0a0a ground, one neon accent at L > 75 % and chroma > 0.2 (emerald #10b981, lime, cyan, violet), glass cards with `backdrop-blur` and `border-white/10`, coloured `box-shadow` halos, a spotlight or aurora behind the hero. Search summaries from 2025 describe it plainly: "every AI-built dark site using the same black background, neon accent, and glass blur combo, to the point where it all started looking the same around 2024". Detector rule S39 fires on the combination, not on dark grounds.

### 2.5 Tinted neutrals versus Tailwind's defaults

Tailwind v4 defines its neutrals in OKLCH (read from `packages/tailwindcss/theme.css`):

| Token | Value | Hue family |
|---|---|---|
| `gray-400` / `gray-500` | oklch(70.7 % 0.022 261) / oklch(55.1 % 0.027 264) | blue |
| `slate-400` / `slate-500` | oklch(70.4 % 0.04 257) / oklch(55.4 % 0.046 257) | blue, more chroma |
| `zinc-400` / `zinc-500` | oklch(70.5 % 0.015 286) / oklch(55.2 % 0.016 286) | violet |
| `zinc-800` / `zinc-900` / `zinc-950` | 27.4 % / 21 % / 14.1 % L, chroma 0.005–0.006, hue 286 | violet |
| `neutral-500` | oklch(55.6 % 0 none) | no hue |
| `stone-500` | oklch(55.3 % 0.013 58) | warm |

Three of the five families sit between hue 257° and 286° with chroma 0.015–0.046. That is the "cool default" every generated page shares, and `zinc` is shadcn's default base. The rule is not "no grey"; it is "the neutral hue comes from your anchor". Radix's pairing table says the same in another form: mauve with red/pink/purple/violet, slate with indigo/blue/cyan, sage with teal/green, olive with lime/grass, sand with yellow/amber/orange/brown.

### 2.6 Avoiding the indigo gradient

The band: hue 255–315° at chroma above 0.15. Tailwind `indigo-500` oklch(58.5 % 0.233 277), `indigo-600` (51.1 % 0.262 277), `violet-500` (60.6 % 0.25 293), `purple-500` (62.7 % 0.265 304), `fuchsia-500` (66.7 % 0.295 322). Adam Wathan's August 2025 post apologising for making every Tailwind UI button `bg-indigo-500` five years earlier is the origin story every write-up cites. A gradient whose stops both fall in 200–330° (indigo-to-blue, violet-to-pink, purple-to-cyan) is a hard fail. A solid accent in the band is a warning unless the brief names it (a violet suit ink for DEAL is a decision; indigo-600 on a button is not).

### 2.7 Ten palettes with roles

Values computed with the OKLCH conversion in this pass; contrast is WCAG 2.x against the named ground.

**P1 · Bone and cobalt (professional index).** Ground #F3EFE6 oklch(95.3 % 0.013 87). Ink #141414 oklch(19.1 % 0 0): 16.05:1. Secondary #5B5750 oklch(45.8 % 0.012 82): 6.26:1. Hairline #D8D2C4 oklch(86.5 % 0.02 88). Accent cobalt #1F4BFF oklch(52.2 % 0.267 265): 5.22:1 as text, on-accent #FFFFFF. Roles: ground, ink, secondary, hairline, one accent for focus and the current row.

**P2 · Graphite and copper (dark, material; LIVE OBJECTS).** Ground #0E0E0E oklch(16.4 % 0 0). Surface #171717 oklch(20.5 %). Ink #F2EDE4 oklch(94.8 % 0.013 82): 16.56:1. Muted #A9A39A oklch(71.8 % 0.015 78): 7.71:1. Accent copper #C8773A oklch(64.6 % 0.126 55): 5.66:1. Chrome state #9EB3C7 oklch(75.7 % 0.037 247): 8.94:1. Porcelain state #E9E4DC oklch(92.1 % 0.012 80). Roles: the accent follows the material; nothing else is chromatic.

**P3 · Mustard field (FJALËKRYQ).** Field #F2B705 oklch(81.1 % 0.166 85). Ink #161616: 9.95:1. Filled tile #FFFCF2 oklch(99.1 % 0.014 93). Active word #17308F oklch(36.1 % 0.159 266): 6.22:1 (the brief's #1F4BFF is 3.29:1 on mustard, large text only; use it for fills with white tiles, not for words on the field). Roles: field, ink, tile, one flood.

**P4 · Safety yellow on matte black (LINJA).** Board #121212 oklch(18.2 %). Disc front #F5C400 oklch(84 % 0.172 90): 11.4:1. Timetable cream #F3EFE2 oklch(95.2 % 0.018 93) with ink #15130F oklch(18.8 % 0.009 85). Current line red #E3001B oklch(57.6 % 0.235 27): 3.82:1 on black, so it marks, it does not carry text. Dark is allowed because the material is dark.

**P5 · Oxblood and paper (FACING PAGES).** Paper #FBF6EA oklch(97.4 % 0.017 88). Ink #1B1B1B: 15.97:1. Oxblood #7A1F2B oklch(39.1 % 0.125 18): 9.46:1, links and the active language. Gold rule #B9975B oklch(69.4 % 0.088 81): 2.55:1, decoration and large stamps only; for gold text use #7A5C24 oklch(49.4 % 0.083 80): 5.75:1. Panel #E7DFCF oklch(90.6 % 0.023 85).

**P6 · Kosovo dusk (KOSOVO TIME, four states).** Dawn ground #F6C7A1 oklch(86.2 % 0.074 61) with ink #2A1A12 oklch(23.6 % 0.03 47). Noon #F7F4EC with #141414. Dusk: two solids, orange #FF7A1A oklch(72.4 % 0.187 49) and violet #2B1A4A oklch(26.8 % 0.086 297), with ink #FFF3E6 on the violet half and #2A1A12 on the orange half (6.42:1). Night #0F0D14 oklch(16.5 % 0.015 298) with #E8E2D6 oklch(91.4 % 0.017 85). The dusk pair is two fields with a hard edge, never a linear-gradient, so it does not trip S05.

**P7 · Felt and card (DEAL).** Felt #C8102E oklch(53 % 0.207 22). Card #FFFDF7 oklch(99.4 % 0.008 91): 5.78:1 on felt. Card ink #1A1A1A on card: 15.4:1 (black on felt is 2.96:1; never set text on the felt). Suit inks on the card: cobalt #1F4BFF, forest #1E5E3A oklch(43.1 % 0.088 155), mustard #F2B705 (fills only). Roles: ground, object, six suit inks used only on objects.

**P8 · Newsprint (ISSUE, editorial).** Paper #F4F1EA oklch(95.9 % 0.01 87). Ink #1A1A1A: 15.43:1. Rule #C9C3B5 oklch(81.8 % 0.02 88). Secondary #6B665C oklch(51.2 % 0.017 85): 5.06:1. Red #B42318 oklch(50 % 0.182 30): 5.83:1, used for one word per spread (the #D6301E in the brief is 4.33:1, below body threshold).

**P9 · Parity green (THE SEAM).** v2 bone #F3EFE6, ink #141414. Signal green ticks #16C172 oklch(71.4 % 0.171 155): 2.06:1, icon-only, never text; green text uses #0B7A48 oklch(51.1 % 0.12 156): 4.7:1. Failing red #E5484D oklch(62.6 % 0.193 23): 3.41:1, large and icon. v1 side #DADBD3 oklch(88.8 % 0.011 112) with #2F3B2F oklch(33.7 % 0.026 145): 10.24:1.

**P10 · Slate engineering (current DESIGN.md, light-dark).** Light: ground #F6F7F9 oklch(97.6 % 0.003 265), ink #1A1D23 oklch(23 % 0.012 264): 15.75:1, secondary #5C6370 oklch(49.8 % 0.022 263): 5.64:1, hairline #D9DDE3, accent #2447D9 oklch(47.9 % 0.225 266): 6.58:1. Dark: ground #101112 oklch(17.7 % 0.003 248), accent #849BFF oklch(71.5 % 0.148 272): 2.41:1 on light but 6.7:1-class on the dark ground (the #7C8DFF check gives 6.70:1 on #0A0A0A). Note the hue, 248–272°, is exactly the Tailwind band; this palette passes only because chroma stays at 0.003–0.012 on neutrals and the accent is one blue with a job. It is the palette the consult calls "paper + cobalt is a default", kept here as the baseline to beat.

---

## 3. Layout and composition

### 3.1 Grids

- Twelve columns, used asymmetrically: 5 + 7 for index and preview (the current home is roughly 3/5 : 2/5), 4 + 8 for text beside a plate, 3 + 9 for margin labels beside reading, 8 + 4 for a wide image with a narrow caption column. The 12-column grid earns its keep because it divides by 2, 3, 4 and 6; a symmetric 6 + 6 is the one split to avoid as a default.
- Gutters follow the gutter token: 16 px at 375, 24 at 640, 32 at 1024, up to 72 at 1536 (DESIGN.md `portfolio-gutter`). Containers: 1280 for reading, 1536 for the shell, full-bleed for walls and boards.
- Modular grids for walls and ledgers: a fixed row height (48–64 px for dense rows, 160 px for live cells) and columns that alternate narrow/wide (the five-column wall).
- Offset and broken grids: one element per viewport may cross a column boundary or the container edge. More than one and the grid is gone.

### 3.2 Whitespace and density

Two legal modes, chosen per surface, never mixed within one surface:

- Dense index: 12–16 rows visible at 1440 × 900, row height 48–64 px, hairlines between rows, 14–17 px text, columns aligned to the pixel. Calm comes from alignment, not from grey (designeer.xyz; the LEDGER brief).
- Airy exhibit: one project per viewport, image at ≥ 60 % of viewport area, one line of type, section spacing 10–15 vw.

Spacing scale: 4-point base with named steps 2, 4, 8, 12, 16, 24, 40, 64, 96, 144 px (Hallmark's `--space-3xs` … `--space-4xl`), or fluid pairs from the Utopia space calculator (each step a `clamp()` between the 320 px and 1440 px values). Section spacing is `clamp(4.5rem, 10vw, 8rem)` as a base, then varied by section. Space above a heading is at least 1.5 × the space below it. No arbitrary values (`padding: 17px`).

### 3.3 Hero compositions that are not the template

The template: eyebrow pill, centred headline, grey subtitle, primary + ghost button, optional blurred blob, scroll cue. Compositions that replace it, each with a measurable property the detector can check:

1. **Work first, name as a row.** A full-bleed artefact (screenshot, live object, board) occupying ≥ 60 % of the first viewport; the identity is one line ≤ 10 % of viewport height, left-aligned (offgrid; LINJA; LIVE OBJECTS).
2. **Index beside a sticky preview.** The list is the hero; the preview follows the pointer (current home). Check: ≥ 8 project rows in the first viewport.
3. **Type as image.** One word or one name set at 18–30 vw in the display face, nothing else above the fold except a two-word role line (ISSUE, SWISS). Check: largest text box height ≥ 25 % of viewport height and it is not the owner's name alone with a grey subtitle (S34 excludes the single-word statement when there is no subtitle under it).
4. **Asymmetric 5/7 plate.** Image or live cell in the 7, three lines of text bottom-left in the 5, aligned to a baseline grid; no button, the row itself is the link.
5. **Ledger or table.** Columns with tabular numerals; the first viewport is 14 rows and nothing else.
6. **All-28 grid.** Every project as a tile at once; the hero is the inventory (SAVEFILE).
7. **Magazine cover.** Several entry points at different sizes with a clear first, second and third (editorial layouts measured 4.2 s longer first-screen dwell and 18 % more 75 %-depth scrolls than the centred hero they replaced, per the Webflow write-up we could only see as a snippet).
8. **Seam, board or game.** The mechanic is the first viewport (DIFF, LINJA, DEAL). Check: an interactive region ≥ 50 % of the viewport with a keyboard path.

Rules shared by all eight: name ≤ 10 % of viewport height; at least one real work artefact ≥ 25 % of viewport area; at most one button; no centred stack of three text elements; nothing that only hovers.

### 3.4 Images

- One aspect ratio per surface: 16:10 for web screens, 4:3 or 3:2 for product shots, 9:19.5 for phone frames, 1:1 only for a wall that sorts by colour. Reserve `aspect-ratio` so CLS is 0.
- Sources at ≥ 2 × the rendered size on 2 × screens; never upscale (DIAGNOSIS §1c found store frames rendered at 1.45–2 × their source). Check: `naturalWidth ≥ clientWidth × devicePixelRatio`.
- Screenshots keep their own colours; no tint overlays, no fake chrome around them (Hallmark gate 47).
- A screenshot shown at under 0.6 × of its own 1 × size is a thumbnail and should be a row, not a picture.

### 3.5 Section rhythm

Consecutive sections must differ in at least one of: ground colour, container width, a rule, padding, alignment. The failing pattern is "every section the same height, centred, `max-w-7xl`": four or more consecutive sections with the same `padding-block` (± 8 px), the same `max-width` and centred headings. Vary the three: tight after a rule, generous before a heading, one full-bleed section per page, one narrow reading column per page.

---

## 4. The slop catalogue

Severity: **F** = hard fail (one is enough to fail the draft), **W** = warning (three warnings fail the draft). "imp" marks overlap with the impeccable source detector; our rule still runs because it checks the rendered DOM, but the skill should not report the same finding twice. Heuristics use `getComputedStyle` (cs), `getBoundingClientRect` (rect), the viewport (`vw`, `vh`), and an OKLCH conversion of any CSS colour (`toOKLCH`). "First viewport" means `rect.top < vh` at 1440 × 900 after load.

| ID | Tell | Why it reads as slop | Sev | Detection heuristic | Instead |
|---|---|---|---|---|---|
| S01 | Pill or badge eyebrow above the hero headline ("✨ Available for work", "New", "v2.0") | The cheapest hierarchy signal a model reaches for; craft-floor calls it a ban no brief earns back. | F | Element E preceding the first `h1` in DOM order with `rect.bottom ≤ h1.rect.top + 8` and within 160 px above it; `E.textContent.trim().length` 2–40; cs.fontSize ≤ 14 px; (cs.borderRadius ≥ 9999 px or ≥ rect.height / 2); (background alpha > 0 or borderWidth > 0); rect.width < 0.6 × h1.rect.width. Boost: text matches `/available|open to|hiring|new|✨|👋|v\d/i`. | Delete it. The headline carries the state; availability goes in the contact row. |
| S02 | Uppercase or mono eyebrow label above every section heading | Repeated "stamped-on" chrome; the GitHub issues we read describe it as "the same devices half the portfolio internet uses". | W; F at ≥ 3 | For each `h2`: previous element sibling with text ≤ 40 chars and (cs.textTransform = uppercase or cs.letterSpacing ≥ 0.06 em or cs.fontFamily is mono) and cs.fontSize ≤ 13 px. Count ≥ 3 → F. | At most one per page, only where the label carries a fact (a chapter number that is also navigation). |
| S03 | Mono "01 / About", "02 — Work" section numbers | Numbering that carries no sequence information; editorial-SaaS tell. | W | Any text node matching `/^\(?0?\d{1,2}\)?\s*[\/·—–-]\s*\p{L}/u` with cs.fontFamily mono or cs.textTransform uppercase, outside a real list. | Headings in the text face; numbers only when the sequence is the navigation. |
| S04 | Gradient-clipped headline text | The single most-cited visual tell (every source). | F (imp) | Any element with cs.fontSize ≥ 20 px where (`cs.webkitBackgroundClip` or `cs.backgroundClip`) = `text` and `cs.backgroundImage` contains `gradient`, or cs.color alpha = 0 with a background image. | Solid ink; emphasis by size or weight. |
| S05 | Purple / indigo / violet-to-blue gradient anywhere | Tailwind's `bg-indigo-500` legacy; Wathan's apology. | F | Parse every `cs.backgroundImage` gradient's stops → OKLCH. Fail if any stop has hue 255–315 and chroma > 0.12, or if two stops both have hue in 200–330 and chroma > 0.1. Warn on solid colours in 255–315 at chroma > 0.15 unless in the allow-list. | One anchor hue from the material; two solids with a hard edge if two colours are needed. |
| S06 | Glassmorphism card (backdrop-blur + translucent fill) | Decoration that pretends to be depth; part of the "dark + neon + glass" recipe. | F outside dialogs and nav | `cs.backdropFilter` contains `blur` and background alpha between 0.02 and 0.6; element is not `dialog`, `[role=dialog]`, or a fixed `header`; rect area > 10,000 px². | Opaque surfaces separated by lightness or hairlines. |
| S07 | 1 px low-alpha "AI border" on every card (`border-white/10`, `border-black/5`) | Borders nobody chose: alpha borders are what a model writes when it does not know the ground. | W; F at ≥ 3 siblings | cs.borderWidth = 1 px and border colour alpha ≤ 0.2; count elements sharing a parent with the same rect size (± 4 px) ≥ 3, or combined with S06 or any gradient. | Opaque hairline from the neutral ramp (step 6–7), or no border and lightness steps. |
| S08 | Glow shadow (coloured, zero-offset halo) | craft-floor: "a zero-offset colored halo is decoration". | F (imp) | Parse `cs.boxShadow`: any shadow with offsetX = offsetY = 0, blur ≥ 16 px and colour chroma > 0.05; or any `cs.textShadow` / `filter: drop-shadow` with chroma > 0.05. | Offset shadow with soft blur in the ink hue, or no shadow. |
| S09 | Spinning conic-gradient border (border beam, shine border, moving border) | Magic UI / Aceternity signature (`border-beam`, `shine-border`, `glowing-effect`). | F | Element or its `::before`/`::after` with `cs.backgroundImage` containing `conic-gradient` and `cs.animationName ≠ none`, with mask or padding ≤ 2 px; or class matches `/border-beam|shine-border|moving-border|glowing-effect/`. | A static hairline. |
| S10 | Bento grid | 2023–2025 template; "the lazy container". | W; F if tiles hold no content | Grid container with ≥ 5 children, ≥ 3 column tracks, ≥ 2 children spanning > 1 column or row, all children cs.borderRadius ≥ 16 px and identical background. | A list, a table, or one image. |
| S11 | Centred hero with primary + ghost button pair | The template's spine (hero → features → CTA). | F | First `h1` with cs.textAlign = center and parent align-items center; within 240 px below it, a flex row with 2–3 `a`/`button` children where one has background alpha > 0 and another has transparent background with a border or underline. | At most one action; the row or tile itself is the link. |
| S12 | "Hi, I'm X 👋" / "Hello, I'm" | Template greeting; the emoji is the tell. | F | First heading or paragraph in the first viewport matching `/^(hi|hey|hello|hola)[,!]?\s+(i'?m|i am|my name)/i` or containing U+1F44B. | A sentence that says what was built. |
| S13 | Emoji as bullets or icons | craft-floor and Hallmark gate 30. | F | Any `li`, heading, or button whose text starts with a code point in Emoji ranges (U+1F300–1FAFF, U+2600–27BF, U+2B50, U+2705), or ≥ 3 emoji in first two viewports outside the wordmark. | Drawn icons from one library, or none. |
| S14 | Icon in a tinted rounded square above three feature cards | The universal LLM feature grid. | F | ≥ 3 siblings each whose first descendant is ≤ 56 px square with cs.borderRadius ≥ 8 px, background alpha > 0 with chroma > 0.03, containing an `svg`, followed by a heading and a paragraph. | Facts in rows; no feature cards on a portfolio. |
| S15 | Stat counter row ("5+ years · 50+ projects · 100 % satisfaction") | Hero-metric template; numbers invented to fill a slot (Hallmark gate 46). | F | Row of ≥ 3 siblings each containing a text node matching `/^\d+(\.\d+)?\s?[+%kx×]?$/` at cs.fontSize ≥ 28 px with a label ≤ 24 chars; or elements with `data-count`, class `/count(er|up)/`, or text that changes within 2 s of load. | Specific results from CONTENT.md in sentences; no counters. |
| S16 | Logo marquee | CREATIVE-CONSULT §1.2; a scrolling strip of other people's brands. | F | Container with cs.overflow hidden whose child has `cs.animationName ≠ none` with a translateX keyframe and ≥ 5 `img`/`svg` descendants; or class `/marquee|ticker/`. | Client names as text in a dated row. |
| S17 | Testimonial carousel | Quotes without sources; auto-rotation fails WCAG 2.2.2. | F | ≥ 2 `blockquote`/`q` inside a container with `aria-roledescription=carousel`, or with ≥ 3 small round buttons (≤ 12 px, radius 50 %) as pagination, or whose child transform changes over 6 s. | None on a portfolio; a single attributed quote as static text if real. |
| S18 | `rounded-2xl` / `3xl` on everything | Uniform softness is the shadcn default radius escalated. | W; F if median ≥ 24 px | Collect cs.borderRadius of visible boxes > 10,000 px²; warn if median ≥ 16 px and ≥ 70 % of boxes ≥ 16 px; fail if median ≥ 24 px. | A radius hierarchy: 0–4 px editorial, 6–10 px controls, 12–16 px only for real objects. |
| S19 | Uniform `shadow-lg` | One default shadow string on every card. | W | Count elements sharing the exact string `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` (or `-xl`); ≥ 4 → warn. | Declare elevation once: border or shadow, never both. |
| S20 | Dot or grid background with radial mask | shadcn/Magic UI `dot-pattern`, `grid-pattern`, `retro-grid`. | W | `cs.backgroundImage` with `radial-gradient` and `cs.backgroundSize` ≤ 40 px repeated (dots) or `repeating-linear-gradient` (grid), plus `cs.maskImage` containing `radial-gradient`; or class `/bg-(grid|dot)|grid-pattern|dot-pattern|retro-grid/`. | A plain ground, or a real canvas, map or board underneath. |
| S21 | Blurred colour blobs | "The slop icon of 2024" (CREATIVE-CONSULT). | F | Absolutely or fixed positioned element with `cs.filter` blur ≥ 40 px, cs.borderRadius ≥ 50 %, rect ≥ 200 px, background chroma > 0.1, `pointer-events: none`. | Nothing, or a real light source computed from something (the Kosovo sun). |
| S22 | Noise / grain overlay | A filter standing in for material. | W | Fixed or absolute element covering ≥ 80 % of the viewport with `cs.backgroundImage` containing `feTurbulence` (data URI) or `noise`, `cs.mixBlendMode` overlay/soft-light, opacity ≤ 0.25. | Real material (dither computed on real images, a riso ink layer) or none. |
| S23 | Aceternity / Magic UI effects: spotlight, beams, meteors, sparkles, aurora, animated-gradient-text, text-generate, hyper-text | Library costumes seen on every launch page since 2023. | F | Class or data attributes matching the registry names (`spotlight|background-beams|beams|meteors|sparkles|aurora|shimmer|animated-shiny-text|animated-gradient-text|hyper-text|text-generate|flickering-grid|warp-background|neon-gradient-card|magic-card|orbiting-circles|ripple|particles`); an `svg` with ≥ 3 animated `path`s using gradient strokes; a full-viewport `canvas` with no interaction handler. | One authored motion that reveals information. |
| S24 | Typewriter headline | "I'm a developer \| designer \| …" cycling text. | F | Any heading whose `textContent` differs across two samples 1.5 s apart; or a sibling with `cs.animationName` blink/step and `border-right` ≥ 1 px or text `\|`; class `/typewriter|typed|typing/`. | A static sentence. |
| S25 | Tech-stack icon grid | A wall of logos says "I followed tutorials". | F (W if ≤ 6 and captioned) | Container with ≥ 8 `img`/`svg` ≤ 64 px whose `alt`/`title`/`aria-label` match a tech-name list (react, next, typescript, node, tailwind, docker, aws, figma, …) and no running text. | Stack named inside each project's facts. |
| S26 | Vertical timeline with dots | A résumé drawn as a template. | W | A list with ≥ 3 items, a pseudo-element or child with width 1–2 px and height ≥ 80 % of the container, and circles ≤ 16 px aligned to that line. | A dated table with tabular numerals. |
| S27 | Green pulsing "available" dot | Stock status chip. | F | Element ≤ 12 px with cs.borderRadius 50 %, background hue 120–170° chroma > 0.1, with `cs.animationName ≠ none` or a `::before` ring; sibling text `/available|open to work/i`. | A sentence in the contact row. |
| S28 | `hover:-translate-y-1` / `scale-105` on every card | One hover signal copied to everything (Hallmark gate 11). | W | Scan stylesheets for `:hover` rules with `translateY(-` or `scale(1.0` whose selector matches ≥ 4 elements; or hover four same-class elements with `page.hover()` and compare cs.transform. | One hover signal per element kind; prefer the row flooding with the project colour. |
| S29 | Default Tailwind grey secondary text | Grey from an unrelated palette on a tinted ground. | F | Any text node with cs.fontSize ≤ 16 px whose colour is within ΔE 2 (OKLab) of Tailwind gray/zinc/slate/neutral 400–600 values listed in §2.5; or text chroma < 0.01 while the ground chroma ≥ 0.01; or contrast < 4.5:1. | Secondary ink derived from the ground hue at 45–50 % L. |
| S30 | Inter / Geist / system as the only face | No display voice. | W; F if the largest text is in the default list | Collect first family of cs.fontFamily for all text; if the set has one member, warn; if the element with the largest cs.fontSize uses `{Inter, Geist, system-ui, -apple-system, Segoe UI, Roboto, Arial, Helvetica, Poppins, Montserrat, DM Sans}` → fail. (imp `overused-font` covers source; this checks rendered fallbacks too.) | §1.3 pairings. |
| S31 | Lucide (or any) icon everywhere | Icons next to every heading and list item. | W | Count `svg` with class `/lucide|heroicon|tabler|phosphor/` in the first two viewports > 8, or icons adjacent to ≥ 50 % of headings. | Icons only for actions and status; one library. |
| S32 | Cookie-cutter navbar: sticky, blurred, pill links, CTA button | Hallmark gate 42; the first thing every generated site shares. | F | `header`/`nav` with cs.position sticky/fixed and (`cs.backdropFilter` blur or background alpha < 1) and border-bottom 1 px alpha ≤ 0.2, containing 3–6 links and one filled button; or a centred nav container with cs.borderRadius ≥ 9999 px (floating pill). | A masthead in normal flow; links as text; no CTA in the nav. |
| S33 | "Scroll to explore" mouse icon or bouncing chevron | Tells visitors nothing (the audit issue we read called it "a common AI-portfolio tell"). | F | Element with rect.top ≥ 0.8 × vh in the first viewport whose text matches `/scroll/i`, or an `svg` chevron/arrow-down with a bounce `animationName`, or a 20–30 × 36–48 px rounded outline ("mouse"). | Let the first viewport end on something cut off by the fold. |
| S34 | Giant name + grey one-liner (and the trailing full stop) | CREATIVE-CONSULT §1.2 item 1; the loop's shared skeleton. | F | `h1` in the first viewport whose text equals the owner name (config) with rect.height ≥ 0.10 × vh, followed within 48 px by a `p` with colour L > 45 % and chroma < 0.03; or the name ending with `.`. | The name as a row, a tab, a stamp, a chip rack (≤ 10 % vh). |
| S35 | "Crafting digital experiences" and kin | Interchangeable copy. | F | Regex over visible text: `/crafting (digital|beautiful|seamless) (experiences|products)|passionate about|pixel[- ]perfect|turning ideas into|bring(ing)? ideas to life|digital craftsman|code (with|and) design|building the future|elevat(e|ing)|seamless(ly)?|unlock|supercharge|empower|next[- ]generation|in today's digital/i`. | A sentence with a product, a place and a number. |
| S36 | "Let's build something amazing together" CTA | Stock closing line. | F | `/let'?s (build|create|make) something (amazing|great|awesome|together)|get in touch and let'?s|have a project in mind/i`. | "Email" with the address, or "CV". |
| S37 | Triplet copy ("fast, reliable, and scalable") | The rule-of-three on autopilot; a reliable AI fingerprint in the writing-detection literature. | W; F at ≥ 3 | Regex per sentence ≤ 80 chars: `/\b\w+, \w+,? (and|&) \w+\b/`; count across visible text. | Say one thing. |
| S38 | Em-dash density | GPT-class models emit ~10.6 em dashes per 1,000 words versus ~3.2 for humans (controlled study cited by the AI-writing guides). | W | Count U+2014 ÷ words × 1000 > 5. | Full stops and commas. |
| S39 | Dark ground + one neon accent + glow | The 2024 "AI dark" recipe. | F | body background L < 20 %, exactly one chromatic colour in use with chroma > 0.2 and L > 70 %, and any S06 or S08 finding. | §2.4. |
| S40 | Pure #000 / #fff ground with pure inverse text | Flat, synthetic. | W | body background exactly `rgb(0,0,0)` or `rgb(255,255,255)` and body colour the exact inverse. | Tinted paper and ink. |
| S41 | Fade-up reveal on every section | "Fade-up on every section, Lenis plus reveal" (consult); craft-floor wants one authored moment. | W; F at ≥ 5 | At load, ≥ 4 section-level elements with cs.opacity = 0 or transform translateY > 8 px that change after scrolling into view; or attributes `data-aos`, classes `/fade-?(up|in)|reveal|animate-on-scroll/` on ≥ 4 sections. | One entrance, then static. |
| S42 | Device mockup fan, exploded laptop, fake browser chrome | Costumes (consult §2); Hallmark gate 47. | W | Three circles ≤ 12 px in red/yellow/green hues in a row at the top of a card; or ≥ 3 same-size siblings with cs.transform rotate between 4° and 20° containing screenshots. | Real screenshots in `<figure>`, or the real DOM in 3D (CSS3D), or a real renderer. |
| S43 | Big faded "01" watermark behind a section | Decorative numbering. | W | Text matching `/^0?\d$/` with cs.fontSize ≥ 96 px and (opacity ≤ 0.2 or colour alpha ≤ 0.15). | None. |
| S44 | Every section the same height, centred, `max-w-7xl` | No rhythm; the generated page's skeleton. | W; F at ≥ 5 | ≥ 4 consecutive top-level sections with equal cs.paddingBlock (± 8 px), the same cs.maxWidth (1280 px / 80 rem), and centred headings. | §3.5. |
| S45 | Card inside a card | Containers compensating for weak proximity. | F | Element with border or shadow or distinct background whose descendant also has border/shadow/background, both > 10,000 px², same radius family. | One containment layer. |
| S46 | Thick coloured side-stripe on cards or callouts | 2018 SaaS; craft-floor bans > 1 px. | F (imp `side-tab`) | cs.borderLeftWidth or borderRightWidth ≥ 3 px with chroma > 0.05 while the other sides are ≤ 1 px. | Full hairline or an accent square. |
| S47 | Italic serif accent word inside a sans headline | The "cyber serif" / Instrument Serif tic of 2025. | W | `h1`/`h2` containing `em`/`i`/`span` with cs.fontStyle italic and a different cs.fontFamily than the parent, ≤ 3 words. | Roman display throughout. |
| S48 | Mixed icon libraries or icon + emoji | Hallmark gate 30. | W | ≥ 2 distinct class prefixes among `svg` (`lucide`, `heroicon`, `tabler`, `material`, `phosphor`) or any emoji plus svg icons. | One library. |
| S49 | Fake terminal, boot log, HUD corners, stickers, "v2.0" stamps | Costumes that fail the M2 test. | W | `pre`/`code` in the first viewport with a prompt (`$`, `>`, `~`) and animated text; pseudo-elements drawing corner brackets; rotated "sticker" elements with cs.transform rotate and a border. | Only when the terminal is the navigation. |
| S50 | Invented metrics | Numbers not in CONTENT.md. | F | Every number ≥ 2 digits or with a `+`/`%` suffix in headings and stat rows is checked against a list extracted from the content source; unknown → fail. | Numbers from the record only. |
| S51 | Cursor-following blob or custom cursor dot | Decoration that follows the pointer. | W | A fixed element with cs.borderRadius 50 % whose rect moves with two synthetic `mousemove` events; or `cs.mixBlendMode` difference on a fixed circle. | Default cursor; hover reveals information instead. |
| S52 | Split-flap or scramble text on hover | Consult §1.2. | W | Hover a link; if `textContent` changes ≥ 3 times within 600 ms → warn. | Static text; underline or colour flood. |
| S53 | Text ticker / marquee of words | Same device as S16 with words. | W | Same as S16 with text children. | A sentence. |
| S54 | `transition: all` and bounce easing on UI | Dated motion defaults. | W (imp `bounce-easing`) | cs.transitionProperty = `all` on ≥ 3 interactive elements; `cs.transitionTimingFunction` with a cubic-bezier whose y values exceed 1 on buttons, links, cards. | Named properties; exponential ease-out. |
| S55 | Hero `min-height: 100vh` with one centred sentence and nothing else | Full-viewport emptiness as a default. | W | First section cs.minHeight ≥ 95 vh, text-align center, no image/canvas/list in it, total text < 200 chars. | Let the content set the height; put work in it. |

Fifty-five tells. The impeccable detector overlaps on S04, S08, S30, S46, S54 and on contrast; the skill should let impeccable report the source finding and let this detector report only the rendered consequence (for example the fallback font that actually painted, or the computed shadow after a theme switch).

---

## 5. Detector spec

A Playwright script, `slop-detect.mjs`, runs after the draft builds. Inputs: a URL, the owner name, the list of allowed accent hues (from the draft's `meta.json`), the content source (to extract allowed numbers and names), and an optional allow-list of rule ids for deliberate costumes (a real terminal as navigation). Output: JSON findings and a Markdown summary. Exit code 1 on any F or on three or more W.

### 5.1 Snapshot

```js
// 1440x900 first, then 390x844; both snapshots are scanned.
const PROPS = ['display','position','fontFamily','fontSize','fontWeight','fontStyle','letterSpacing',
  'lineHeight','textTransform','textAlign','color','backgroundColor','backgroundImage','backgroundSize',
  'backgroundClip','webkitBackgroundClip','maskImage','borderRadius','borderTopWidth','borderRightWidth',
  'borderBottomWidth','borderLeftWidth','borderColor','borderLeftColor','borderRightColor','boxShadow',
  'textShadow','filter','backdropFilter','mixBlendMode','opacity','transform','animationName',
  'transitionProperty','transitionTimingFunction','overflow','minHeight','maxWidth','paddingTop',
  'paddingBottom','gridTemplateColumns','gridColumn','gridRow','pointerEvents','fontVariantNumeric'];

const snapshot = await page.evaluate((PROPS) => {
  const out = [];
  const walk = (el, depth) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const rec = { tag: el.tagName.toLowerCase(), id: el.id, cls: el.className?.toString() || '',
      text: el.childNodes.length && [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim(),
      rect: { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }, depth,
      cs: Object.fromEntries(PROPS.map(p => [p, cs[p]])),
      before: getComputedStyle(el, '::before').backgroundImage, after: getComputedStyle(el, '::after').backgroundImage,
      beforeAnim: getComputedStyle(el, '::before').animationName,
      img: el.tagName === 'IMG' ? { nw: el.naturalWidth, cw: el.clientWidth, alt: el.alt } : null,
      attrs: { role: el.getAttribute('role'), ard: el.getAttribute('aria-roledescription'), data: [...el.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name) },
      parentIndex: null };
    out.push(rec);
    for (const c of el.children) walk(c, depth + 1);
  };
  walk(document.body, 0);
  return out;
}, PROPS);
```

Text sampling for dynamic tells: take `textContent` of all headings and links at t = 0 and t = 1.5 s (S24), hover four same-class cards (S28), send two `mousemove` events 400 px apart and diff fixed-element rects (S51), and hover five links for 600 ms while recording text mutations (S52). Rules that compare "before scroll" and "after scroll" (S41) scroll the page to the bottom in 600 px steps and re-sample opacity and transform.

### 5.2 Helpers

```js
// Colour: parse 'rgb(a)', 'oklch(...)', 'color(...)' via a canvas or the culori library → {L, C, H, a}.
const toOKLCH = (css) => {/* culori.oklch(culori.parse(css)) */};
const alpha = (css) => toOKLCH(css)?.alpha ?? 1;
const inBand = (H, lo, hi) => (lo <= hi ? H >= lo && H <= hi : H >= lo || H <= hi);
const isGradient = (bg) => /gradient\(/.test(bg);
const gradientStops = (bg) => [...bg.matchAll(/(rgb|oklch|hsl|color)\([^)]*\)|#[0-9a-f]{3,8}/gi)].map(m => toOKLCH(m[0]));
const px = (v) => parseFloat(v) || 0;
const isMono = (ff) => /mono|courier|menlo|consolas|jetbrains|martian|plex mono|fragment/i.test(ff);
const isDefaultFace = (ff) => /^(inter|geist|system-ui|-apple-system|segoe ui|roboto|arial|helvetica|poppins|montserrat|dm sans)\b/i.test(ff.split(',')[0].replace(/["']/g, ''));
const wcag = (fg, bg) => {/* relative luminance ratio */};
const apca = (fg, bg) => {/* apca-w3 Lc */};
const TAILWIND_GREYS = ['#9CA3AF','#6B7280','#4B5563','#A1A1AA','#71717A','#52525B','#94A3B8','#64748B','#475569','#A3A3A3','#737373','#525252'];
const nearTailwindGrey = (css) => TAILWIND_GREYS.some(h => deltaEok(toOKLCH(css), toOKLCH(h)) < 0.02);
const firstViewport = (rec, vh) => rec.rect.y < vh;
const area = (rec) => rec.rect.w * rec.rect.h;
```

### 5.3 Rules (one function each; the table in §4 is the contract)

```js
const rules = {
  S01_pillEyebrow(snap, ctx) {
    const h1 = snap.find(r => r.tag === 'h1' && firstViewport(r, ctx.vh)); if (!h1) return [];
    return snap.filter(r => r !== h1 && r.rect.y + r.rect.h <= h1.rect.y + 8 && h1.rect.y - (r.rect.y + r.rect.h) <= 160
      && r.text && r.text.length >= 2 && r.text.length <= 40 && px(r.cs.fontSize) <= 14
      && (px(r.cs.borderRadius) >= 9999 || px(r.cs.borderRadius) >= r.rect.h / 2)
      && (alpha(r.cs.backgroundColor) > 0 || px(r.cs.borderTopWidth) > 0)
      && r.rect.w < 0.6 * h1.rect.w)
      .map(r => finding('S01', 'F', r, `pill "${r.text}" above h1`));
  },
  S04_gradientText(snap) {
    return snap.filter(r => px(r.cs.fontSize) >= 20 && /text/.test(r.cs.webkitBackgroundClip || r.cs.backgroundClip) && isGradient(r.cs.backgroundImage))
      .map(r => finding('S04', 'F', r, 'background-clip:text with gradient'));
  },
  S05_indigoGradient(snap, ctx) {
    const out = [];
    for (const r of snap) {
      for (const bg of [r.cs.backgroundImage, r.before, r.after]) {
        if (!isGradient(bg)) continue;
        const stops = gradientStops(bg).filter(Boolean);
        if (stops.some(s => inBand(s.H, 255, 315) && s.C > 0.12)) out.push(finding('S05', 'F', r, 'indigo/violet gradient stop'));
        else if (stops.filter(s => inBand(s.H, 200, 330) && s.C > 0.10).length >= 2) out.push(finding('S05', 'F', r, 'blue-to-purple gradient'));
      }
      const bgc = toOKLCH(r.cs.backgroundColor);
      if (bgc && bgc.alpha > 0.5 && inBand(bgc.H, 255, 315) && bgc.C > 0.15 && !ctx.allowedHues.some(h => Math.abs(h - bgc.H) < 10))
        out.push(finding('S05', 'W', r, 'solid accent in the indigo band'));
    }
    return out;
  },
  S06_glass(snap) {
    return snap.filter(r => /blur/.test(r.cs.backdropFilter) && alpha(r.cs.backgroundColor) > 0.02 && alpha(r.cs.backgroundColor) < 0.6
      && !['dialog'].includes(r.tag) && r.attrs.role !== 'dialog' && !(r.tag === 'header' && r.cs.position === 'fixed') && area(r) > 10000)
      .map(r => finding('S06', 'F', r, 'backdrop-blur card'));
  },
  S07_alphaBorders(snap) {
    const cand = snap.filter(r => px(r.cs.borderTopWidth) === 1 && alpha(r.cs.borderColor) <= 0.2 && area(r) > 10000);
    const groups = groupBy(cand, r => `${r.parentIndex}:${Math.round(r.rect.w / 4)}x${Math.round(r.rect.h / 4)}`);
    return Object.values(groups).filter(g => g.length >= 3).flatMap(g => g.map(r => finding('S07', 'F', r, 'low-alpha 1px border on sibling cards')))
      .concat(cand.filter(r => /blur/.test(r.cs.backdropFilter) || isGradient(r.cs.backgroundImage)).map(r => finding('S07', 'W', r, 'alpha border with glass/gradient')));
  },
  S08_glow(snap) {
    return snap.flatMap(r => parseShadows(r.cs.boxShadow).filter(s => s.x === 0 && s.y === 0 && s.blur >= 16 && (toOKLCH(s.color)?.C ?? 0) > 0.05)
      .map(() => finding('S08', 'F', r, 'zero-offset coloured glow')));
  },
  S11_centredHeroButtons(snap, ctx) {
    const h1 = snap.find(r => r.tag === 'h1' && firstViewport(r, ctx.vh)); if (!h1 || h1.cs.textAlign !== 'center') return [];
    const rows = snap.filter(r => r.rect.y > h1.rect.y + h1.rect.h && r.rect.y < h1.rect.y + h1.rect.h + 240 && /flex|grid/.test(r.cs.display));
    return rows.filter(row => { const kids = childrenOf(snap, row).filter(k => ['a', 'button'].includes(k.tag));
      return kids.length >= 2 && kids.length <= 3 && kids.some(k => alpha(k.cs.backgroundColor) > 0) && kids.some(k => alpha(k.cs.backgroundColor) === 0); })
      .map(r => finding('S11', 'F', r, 'primary + ghost button pair under centred h1'));
  },
  S29_tailwindGrey(snap) {
    const ground = toOKLCH(getComputedStyle(document.body).backgroundColor);
    return snap.filter(r => r.text && px(r.cs.fontSize) <= 16 && (nearTailwindGrey(r.cs.color)
      || ((toOKLCH(r.cs.color)?.C ?? 0) < 0.01 && ground.C >= 0.01) || wcag(r.cs.color, effectiveBg(snap, r)) < 4.5))
      .map(r => finding('S29', 'F', r, `secondary text ${r.cs.color}`));
  },
  S30_defaultFace(snap) {
    const faces = new Set(snap.filter(r => r.text).map(r => r.cs.fontFamily.split(',')[0]));
    const largest = snap.filter(r => r.text).sort((a, b) => px(b.cs.fontSize) - px(a.cs.fontSize))[0];
    const out = [];
    if (faces.size === 1) out.push(finding('S30', 'W', largest, 'single family'));
    if (largest && isDefaultFace(largest.cs.fontFamily)) out.push(finding('S30', 'F', largest, `display in ${largest.cs.fontFamily}`));
    return out;
  },
  S32_navbar(snap) {
    return snap.filter(r => ['header', 'nav'].includes(r.tag) && /sticky|fixed/.test(r.cs.position)
      && (/blur/.test(r.cs.backdropFilter) || alpha(r.cs.backgroundColor) < 1)
      && px(r.cs.borderBottomWidth) === 1 && alpha(r.cs.borderColor) <= 0.2
      && childrenOf(snap, r, true).filter(k => k.tag === 'a').length >= 3
      && childrenOf(snap, r, true).some(k => ['a', 'button'].includes(k.tag) && alpha(k.cs.backgroundColor) > 0 && px(k.cs.borderRadius) >= 6))
      .map(r => finding('S32', 'F', r, 'sticky blurred navbar with CTA'));
  },
  S34_giantName(snap, ctx) {
    return snap.filter(r => r.tag === 'h1' && firstViewport(r, ctx.vh) && norm(r.text) === norm(ctx.ownerName) && (r.rect.h >= 0.10 * ctx.vh || /\.$/.test(r.text)))
      .map(r => finding('S34', 'F', r, 'name as hero'));
  },
  S35_S36_phrases(snap, ctx) {
    const text = snap.map(r => r.text).join(' ');
    return [...BANNED_PHRASES].filter(rx => rx.test(text)).map(rx => finding('S35', 'F', null, String(rx)));
  },
  S37_triplets(snap) {
    const sentences = snap.map(r => r.text).join(' ').split(/(?<=[.!?])\s+/).filter(s => s.length <= 80);
    const hits = sentences.filter(s => /\b\w+, \w+,? (and|&) \w+\b/i.test(s));
    return hits.length ? [finding('S37', hits.length >= 3 ? 'F' : 'W', null, `${hits.length} triplets`)] : [];
  },
  S38_emDashes(snap) {
    const text = snap.map(r => r.text).join(' '); const words = text.split(/\s+/).length;
    const per1000 = (text.match(/—/g) || []).length / words * 1000;
    return per1000 > 5 ? [finding('S38', 'W', null, `${per1000.toFixed(1)} em dashes / 1000 words`)] : [];
  },
  S39_darkNeon(snap, findings) {
    const ground = toOKLCH(bodyBg); if (!ground || ground.L > 0.20) return [];
    const chromatic = uniq(snap.flatMap(r => [r.cs.color, r.cs.backgroundColor]).map(toOKLCH).filter(c => c && c.alpha > 0.5 && c.C > 0.2));
    const neon = chromatic.filter(c => c.L > 0.70);
    return (chromatic.length === 1 && neon.length === 1 && findings.some(f => ['S06', 'S08'].includes(f.id))) ? [finding('S39', 'F', null, 'dark + lone neon + glow/glass')] : [];
  },
  S44_sectionRhythm(snap) {
    const sections = snap.filter(r => r.depth <= 2 && ['section', 'main', 'div'].includes(r.tag) && r.rect.h > 300);
    let run = 1, worst = 1;
    for (let i = 1; i < sections.length; i++) {
      const a = sections[i - 1], b = sections[i];
      const same = Math.abs(px(a.cs.paddingTop) - px(b.cs.paddingTop)) <= 8 && a.cs.maxWidth === b.cs.maxWidth && headingOf(snap, a)?.cs.textAlign === 'center' && headingOf(snap, b)?.cs.textAlign === 'center';
      run = same ? run + 1 : 1; worst = Math.max(worst, run);
    }
    return worst >= 4 ? [finding('S44', worst >= 5 ? 'F' : 'W', null, `${worst} identical consecutive sections`)] : [];
  },
};
```

The remaining rules follow the same shape; their conditions are fully specified in the §4 table. Scoring:

```js
const F = findings.filter(f => f.sev === 'F').length, W = findings.filter(f => f.sev === 'W').length;
const verdict = F > 0 || W >= 3 ? 'FAIL' : W > 0 ? 'PASS WITH WARNINGS' : 'PASS';
```

Allow-list semantics: `meta.json` may list `{ "allow": ["S49"], "reason": "the terminal is the navigation (M2)" }`; an allowed rule still prints, as a note, so the reviewer sees the costume was declared.

Positive checks (Section 6) run in the same pass and print as a second table; they do not change the verdict but a draft with fewer than eight of fifteen positives is sent back with the list.

---

## 6. Human-made signals: the positive checklist

| ID | Signal | Check (automatic where possible) |
|---|---|---|
| H01 | A deliberate display face | The largest text in the first viewport uses a family not in the default list, at ≥ 48 px, and the family is loaded from a same-origin `@font-face`. |
| H02 | A typographic decision is visible | At least one of: `font-stretch ≠ 100 %` or `font-variation-settings` set on a display element; three or more distinct `letter-spacing` values that decrease as `font-size` increases; `font-variant-numeric: tabular-nums` on any aligned numbers; `text-wrap: balance` on headings. |
| H03 | Asymmetry with a primary axis | The first viewport's largest content box has its horizontal centre ≥ 10 % of `vw` from the viewport centre; headings are not centred; the main grid has unequal column tracks (5/7, 4/8, 3/9). |
| H04 | Real work, large, not upscaled | In the first viewport an `img`, `canvas` or `video` covers ≥ 25 % of the viewport area and, for images, `naturalWidth ≥ clientWidth × devicePixelRatio`. |
| H05 | One rule pushed to the end (M1) | System coherence: ≤ 3 font families, ≤ 3 distinct border-radius values, ≤ 2 distinct box-shadow strings, ≤ 6 distinct text colours, ≤ 3 ground colours across the page; plus the reviewer's one-line statement of the rule from `meta.json`, and a removal test ("remove the rule; does the page change?"). |
| H06 | Specific copy (M9) | Ratio of specific tokens (proper nouns, four-digit years, numbers from CONTENT.md, place names) ≥ 1 per 40 words in visible text; zero hits on the banned-phrase list; zero triplets; em dashes ≤ 5 per 1,000 words. |
| H07 | Varied section rhythm | Coefficient of variation of top-level section heights ≥ 0.3; at least two distinct ground colours or at least one full-bleed and one narrow (≤ 75 ch) section. |
| H08 | Unusual but logical grid | `grid-template-columns` of the main layout is neither `repeat(3, 1fr)` nor `1fr 1fr`; the reading column measures 45–75 ch at every width. |
| H09 | Browser surfaces are themed (craft-floor's cheapest tell) | `::selection` background set to a palette colour; `:focus-visible` outline custom and ≥ 3:1; `scrollbar-color` or `accent-color` set; `caret-color` set in inputs. |
| H10 | Work is reachable in five seconds | At least one project row, tile or link is in the first viewport and opens a case in ≤ 2 interactions; keyboard path verified (Tab order reaches it within 8 stops). |
| H11 | The name is small | The owner's name occupies ≤ 10 % of viewport height and is not the `h1` alone. |
| H12 | Tinted neutrals | Ground chroma 0.004–0.03; secondary text hue within ± 30° of the ground hue; no pure #000/#fff. |
| H13 | Numerals handled | Any column of numbers or years has `tabular-nums`; prose in a serif has `oldstyle-nums` or a stated reason not to. |
| H14 | One authored motion, nothing else | At load, at most one element animating in the first viewport; the animation changes what the visitor knows (M5) or is the rule (M7); `prefers-reduced-motion` yields a static final frame with zero differing pixels except that element. |
| H15 | Fonts are self-hosted and few | Every `@font-face src` is same-origin; ≤ 3 families; ≤ 300 kB of fonts on the first route; `font-display: swap` with metric-compatible fallbacks. |

Reviewer-only signals, not automatable, to be written in one sentence each in the review: the hook sentence a visitor would say to a friend (DIAGNOSIS §4.1), the three real sites the draft beats and the one it loses to, and the mechanism it uses from the consult's M1–M11 list.

---

## 7. Rules for the skill

Each rule has a pass/fail test the builder can run before review.

1. **Display face.** The largest text uses a face from §1.3 or a face the brief names; never Inter, Geist, Roboto, Poppins, Montserrat, DM Sans, Work Sans, or the system stack. Test: S30 passes and H01 passes.
2. **Family count.** At most three families: display, body, one outlier (mono) used in at most two roles. Test: computed families ≤ 3.
3. **Scale.** All sizes come from one fluid scale (§1.4). Test: no `font-size` outside the token set except the one type-as-image element, which is sized in `vw`.
4. **Display cap.** Display ≤ 6 rem unless the type is the picture. Test: largest font-size ≤ 96 px or the element is declared `type-as-image` in `meta.json`.
5. **Tracking.** Display −0.02 to −0.04 em, body 0, caps labels +0.06 to +0.12 em; floor −0.04 em. Test: no `letter-spacing` < −0.04 em; any uppercase text ≤ 13 px has ≥ +0.05 em.
6. **Leading.** Display 0.95–1.05 (caps ≥ 1.0), headings 1.1–1.2, body 1.5–1.65. Test: computed `line-height / font-size` within band per role; uppercase display never < 1.0.
7. **Measure.** Reading text 45–75 ch, target 60–68. Test: every `p` with ≥ 120 characters has `max-width` in `ch` and its rendered width / `ch` is within 45–75 at 390, 768, 1024, 1440.
8. **Numerals and features.** `tabular-nums` on numeric columns; `font-optical-sizing: auto` where the face has `opsz`; `font-synthesis: none`; `text-wrap: balance` on headings; `text-wrap: pretty` on body. Test: H02 and H13.
9. **Tinted neutrals.** Paper 95–98 % L and ink 16–22 % L share a hue; chroma 0.005–0.02; no Tailwind grey. Test: S29, S40, H12.
10. **Accent discipline.** One accent with a named job and ≤ 5 % of any viewport, or a committed two- or three-colour identity listed in `meta.json` with a job per colour. Test: count of chromatic colours (C > 0.1) in use equals the declared count; accent pixel coverage ≤ 5 % by sampling a screenshot.
11. **The indigo band.** No hue 255–315° at C > 0.15 unless declared; no gradient between two hues in 200–330°. Test: S05.
12. **Contrast.** Body ≥ 4.5:1 and ≥ Lc 75; secondary ≥ 4.5:1 and ≥ Lc 60; UI and focus ≥ 3:1. Test: every text/ground pair measured in both themes; report the worst three.
13. **Dark mode.** Ground 12–16 % L tinted, text 92–96 % L, elevation by lightness, accent −0.02 to −0.04 C and +5–10 % L, no glow. Test: S39, S08 and the ground values.
14. **Grid.** Twelve columns used asymmetrically; one primary axis; one deliberate break at most. Test: H03, H08.
15. **First viewport.** Name ≤ 10 % vh; work ≥ 25 % of the viewport area; at most one button; no centred three-element stack; no scroll cue. Test: S01, S11, S33, S34, H04, H10, H11.
16. **Rhythm.** Consecutive sections differ in ground, width, rule or padding. Test: S44 and H07.
17. **Spacing.** All spacing on the 4-pt scale or the fluid pairs; space above a heading ≥ 1.5 × space below. Test: computed paddings and margins are members of the token set (± 1 px); heading margins ratio ≥ 1.5.
18. **Radius and elevation.** A radius hierarchy (0–4 editorial, 6–10 controls, 12–16 objects); elevation declared once per element (border or shadow). Test: S18, S19, S45; no element with both a border and a shadow with blur > 8 px.
19. **No glass, blobs, grain, dot grids, beams, conic borders, glow.** Test: S06, S08, S09, S20, S21, S22, S23.
20. **No cards as structure.** No bento, no icon-tile feature cards, no stat rows, no logo marquee, no carousel, no timeline-with-dots, no tech-stack grid. Test: S10, S14–S17, S25, S26.
21. **Copy.** No banned phrases, no greeting, no triplets, em dashes ≤ 5 / 1,000 words, every number from CONTENT.md. Test: S12, S35–S38, S50, H06.
22. **Icons.** One library or none; never emoji; icons only on actions and status. Test: S13, S31, S48.
23. **Motion.** One authored moment; no fade-up on every section; no `transition: all`; no bounce on UI; reduced motion gives a static frame. Test: S41, S54, H14.
24. **Images.** One ratio per surface, reserved dimensions, no upscaling, no fake chrome, no mockup fans. Test: S42, H04, CLS 0.
25. **Browser surfaces.** Selection, focus ring, scrollbar, caret themed from the palette. Test: H09.
26. **Fonts.** Self-hosted, OFL or purchased, ≤ 300 kB on the first route, `font-display: swap`. Test: H15; every `@font-face` URL resolves to `/fonts/`.
27. **Declared costumes.** Any allowed S-rule is listed in `meta.json` with its mechanism (M1–M11); undeclared costumes fail. Test: detector allow-list matches `meta.json`.
28. **Verdict.** One F or three W fails the draft; fewer than eight H-signals returns it with the missing list.

---

## 8. Fonts available in this repo

All files are WOFF2, self-hosted, SIL Open Font License 1.1 (licence texts beside each file; `public/fonts/creative/SOURCES.md` pins upstream revisions and SHA-256). "Reserved names" means the subset had to be renamed under the OFL.

| CSS family | File | Upstream | Axes retained | Notes |
|---|---|---|---|---|
| Archivo | `public/fonts/Archivo.woff2` | Omnibus-Type | `wdth`, `wght` (variable) | Current display and body. OFL (`OFL-Archivo.txt`). |
| Martian Mono | `public/fonts/MartianMono.woff2` | Evil Martians | variable | Current metadata mono. OFL. |
| Cormorant Garamond | `public/fonts/CormorantGaramond.woff2` | Catharsis Fonts | variable | Luxury display. OFL. |
| Jersey 10 | `public/fonts/Jersey10.woff2` | Sarah Cadigan-Fawcett | static | Bitmap display, SAVEFILE only. OFL. |
| Gentrit Display | `creative/GentritDisplay-Latin.woff2` | Hubot Sans (GitHub) | `wdth` 80–120, `wght` 200–900 | Renamed subset (reserved name "Hubot"). Needs `font-stretch: 80% 120%` on the face. |
| Gentrit Text | `creative/GentritText-Latin.woff2` | Mona Sans (GitHub) | `wght` 200–900 (`opsz` frozen 14, `wdth` 100) | Renamed subset (reserved name "Mona"). Body. |
| Gentrit Technical Mono | `creative/GentritTechnicalMono-Latin.woff2` | IBM Plex Mono | static 400 | Renamed subset (reserved name "Plex"). 10 kB; has arrows and ✓. |
| JetBrains Mono | `creative/JetBrainsMono-Latin.woff2` | JetBrains | `wght` 100–800 | Has ↗ and ✓. |
| Libre Franklin | `creative/LibreFranklin-Latin.woff2` | Impallari Type | `wght` 100–900 | No arrows (use SVG). |
| Fraunces | `creative/Fraunces-Latin.woff2` | Undercase Type | `opsz` 9–144, `wght` 100–900 (`SOFT` 100, `WONK` 1 frozen) | Upstream default weight is 900: set `font-weight` explicitly. |
| Bricolage Grotesque | `creative/BricolageGrotesque-Latin.woff2` | Mathieu Triay | `opsz` 12–96, `wght` 200–800 (`wdth` 100) | Upstream default 800: set weight explicitly. |
| Anton | `creative/Anton-Latin.woff2` | Vernon Adams | static 400 | Poster face, 11 kB. |
| Public Sans | `creative/PublicSans-Latin.woff2` | USWDS | `wght` 100–900 | Default weight 100 upstream. |
| Courier Prime | `creative/CourierPrime-Latin.woff2` | Quote-Unquote Apps | static 400 | Receipt and script roles. |
| Literata | `creative/Literata-Latin.woff2` | TypeTogether | `opsz` 7–72, `wght` 200–900 | 161 kB; e-reader serif. |
| Amiri | `creative/Amiri-Regular.woff2`, `Amiri-Bold.woff2` | Khaled Hosny | static 400, 700, complete glyph set | Arabic with full shaping tables; 149 kB + 140 kB. |
| Archivo Narrow | `creative/ArchivoNarrow-Latin.woff2` | Omnibus-Type | `wght` 400–700 | Timetable and card-back roles. |
| Big Shoulders Display | `creative/BigShouldersDisplay-Latin.woff2` | Patric King | `wght` 100–900 | Default weight 100 upstream. |
| Newsreader | `creative/Newsreader-Latin.woff2`, `Newsreader-Italic-Latin.woff2` | Production Type | `wght` 300–650, `opsz` 10–72; italic `wght` 400–600 | No arrow glyph. |

Every Latin subset keeps `Ë ë Ç ç`; the arrow block exists only in JetBrains Mono, Gentrit Technical Mono, Gentrit Display/Text, Bricolage and Anton. Faces recommended in §1.3 but not yet local (Instrument Serif and Sans, Schibsted Grotesk, Fragment Mono, Host Grotesk, Funnel Display and Sans, Syne, Unbounded, Space Grotesk, DM Serif Display, EB Garamond, Geist and Geist Mono, IBM Plex Sans) are all OFL on `github.com/google/fonts/tree/main/ofl/<name>` and can be subset with the fontTools recipe in `SOURCES.md`. Nothing from Fontshare or Pangram Pangram should be added until their licences are read in full (Section 1.1).

---

## 9. Sources

All accessed 2026-10-07. **Read in full** = fetched and read. **Snippet** = the page was blocked by the sandbox egress proxy; only the search engine's summary was available, so quotes from these are second-hand and should be re-verified before being cited outside this repo.

Repo files (read in full): `design/art-directions/CREATIVE-CONSULT.md`; `DESIGN.md`; `design/art-directions/loop/DIAGNOSIS.md`; `.agents/skills/impeccable/SKILL.md`, `reference/craft-floor.md`, `reference/typeset.md`, `reference/colorize.md`, `reference/layout.md`, `reference/hooks.md`; `.impeccable/config.json`; `public/fonts/creative/SOURCES.md`.

AI look, slop tells, anti-slop rule sets:

- Hallmark skill (Nutlope), `skills/hallmark/SKILL.md`, `references/slop-test.md` (58 gates), `references/anti-patterns.md`, `references/typography.md`, `references/color.md`, `references/copy.md`, `references/layout-and-space.md`: https://github.com/Nutlope/hallmark (read in full, raw).
- anti-ai-slop skill (Vinayak Shukla): https://github.com/Vinayak-Shukla-03/anti-ai-slop (read in full).
- impeccable upstream repo (detector description, rule names `overused-font`, `bounce-easing`): https://github.com/pbakaus/impeccable (read in full, README only; rules compiled into the binary).
- "De-template chrome: eyebrows, dot-meta, and mono labels", issue #10, Raghav2012Code/dev-portfolio, 2026-09-25: https://github.com/Raghav2012Code/dev-portfolio/issues/10 (read in full).
- "Spend the eyebrow label once per page, not above every title", issue #1239, enorm-labs/event-junkie, 2026-09-09: https://github.com/enorm-labs/event-junkie/issues/1239 (read in full).
- "UX polish: drop the scroll chevron…", issue #110, alcash55/Portfolio, 2026-09-18: https://github.com/alcash55/Portfolio/issues/110 (read in full).
- Magic UI component registry (names used in S23): https://raw.githubusercontent.com/magicuidesign/magicui/main/registry.json (read in full).
- Aceternity component names (beams, aurora, spotlight, meteors, sparkles): https://ui.aceternity.com/components and https://21st.dev/aceternity (snippet).
- "AI Slop Fonts and Gradients: The Tells That Give Away AI Design", 925 Studios: https://www.925studios.co/blog/ai-slop-design-tells (snippet).
- "How to Fix AI Slop in Web Design, Tell by Tell", Capital & Compute: https://capitalandcompute.net/blog/fix-ai-slop-design/ (snippet).
- "Why Your AI Keeps Building the Same Purple Gradient Website", prg.sh (Wathan `bg-indigo-500` apology, August 2025): https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website (snippet).
- "AI Purple Problem: make your UI unmistakable", dev.to: https://dev.to/jaainil/ai-purple-problem-make-your-ui-unmistakable-3ono (snippet).
- "How We Escaped the Purple Prison of AI Frontends", YouWare: https://www.youware.com/daily/purple-prison-of-ai-frontends (snippet).
- "Why does AI keep making everything blue-purple?", Chai Over Code: https://chaiovercode.substack.com/p/why-does-ai-make-everything-blue (snippet).
- "How to Keep Your Website From Looking Like Every Other Vibe Coded Website", CodeMySpec: https://codemyspec.com/blog/vibe-coded-websites-look-the-same (snippet).
- "Why AI websites look the same", Managed Code: https://managed-code.com/blog-post/why-ai-websites-look-the-same (snippet).
- "A Picture Is Worth a Thousand Tokens", Repaint: https://repaint.com/blog/picture-is-worth-a-thousand-tokens (snippet).
- "AI design tools are making every website look the same", Northeast Times, 2026-07-31: https://northeasttimes.com/2026/07/31/ai-design-tools-are-making-every-website-look-the-same/ (snippet).
- "Fast Doesn't Have to Be Generic: Designing Distinct Websites with shadcn/ui", newline: https://www.newline.co/@eyalcohen/fast-doesnt-have-to-be-generic-designing-distinct-websites-with-shadcnu--fb8a1ab5 (snippet).
- "Cyber Serif Style" and "nexvo.ai Cyber Serif Landing Page" (the dark + emerald + serif + mono template), superdesign.dev: https://superdesign.dev/library/cyber-serif-style (snippet).
- "Top 10 Signs a Website Was Built by AI", Sikora Software: https://sikora.software/blog/ai-website-design (snippet).
- "Handmade Designs: The New Trust Signal", NN/g: https://www.nngroup.com/articles/handmade-designs/ (snippet).
- "Why Handmade Design Is the Conversion Signal You're Missing", grzzly: https://grzz.ly/blog/handmade-design-trust-signal-ux-conversion/ (snippet).
- "Common web developer portfolio mistakes", Scrimba: https://scrimba.com/articles/web-developer-portfolio-mistakes/ (snippet).
- "Signs of AI Writing: 12 Patterns With Reproducible Thresholds", slopdetector.org (em-dash rate 10.62 vs 3.23 per 1,000 words): https://slopdetector.org/blog/signs-of-ai-writing (snippet).
- "The rule of three: why AI loves triplets", refine.so: https://refine.so/blog/rule-of-three-ai-writing (snippet).
- "Bye bye bento", jpthehistorian: https://jpthehistorian.substack.com/p/bye-bye-bento (snippet).

Typography:

- Google Fonts Knowledge (CC-BY-SA) lessons, read in full from https://github.com/google/fonts/tree/main/cc-by-sa/knowledge: "Choosing a suitable line height", "Understanding measure (line length)", "Track carefully or not at all", "Working with hanging punctuation", "Implementing OpenType features on the web", "Styling type on the web with variable fonts", "The complications of typographic size", glossary "Tracking / letter-spacing".
- Google Fonts METADATA.pb (licence, designer, axes), read in full: instrumentserif, spacegrotesk, schibstedgrotesk, funneldisplay, hostgrotesk, geist, syne, fragmentmono, unbounded, dmserifdisplay under https://github.com/google/fonts/tree/main/ofl/.
- Geist licence (OFL 1.1): https://github.com/vercel/geist-font (read in full).
- Utopia core (fluid clamp API, 1.2/1.25 defaults): https://github.com/trys/utopia-core (read in full); Utopia calculators https://utopia.fyi/type/ and https://utopia.fyi/space/ (snippet); "Meet Utopia", Smashing Magazine 2021: https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/ (snippet).
- Type scale ratio guidance (1.2 dense, 1.25–1.333 sites, 1.5+ editorial): https://figr.design/tools/typography-scale, https://cieden.com/book/sub-atomic/typography/establishing-a-type-scale, https://madegooddesigns.com/?p=5170 (snippet).
- Measure, Bringhurst 45–75 / 66: https://webtypography.net/2.1.2, https://en.wikipedia.org/wiki/Line_length (snippet).
- Letter-spacing guidance (caps +0.05 em, display −0.02 em): https://fonts.google.com/knowledge/glossary/tracking_letter_spacing (read via GitHub mirror), https://www.framer.com/dictionary/letter-spacing, https://codeshack.io/references/css/letter-spacing/ (snippet).
- `text-wrap: balance` / `pretty` support (Chrome 114/117, Firefox 121/128, Safari 17.4; Chromium 6-line limit; WebKit paragraph-wide pretty): https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/, https://modern-css.com/reference/properties/text-wrap-style/, https://ppc.land/safaris-text-wrap-pretty-brings-superior-web-typography/ (snippet).
- `hanging-punctuation` Safari-only: https://developer.mozilla.org/en-US/docs/Web/CSS/hanging-punctuation (snippet) and the Google Fonts lesson above (read in full).
- `font-variant-numeric`, `font-optical-sizing` (browsers map px to `opsz`): https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric, https://pixelambacht.nl/2021/optical-size-hidden-superpower/, https://css-tricks.com/?p=322735 (snippet).
- Fonts in use on 2025 award sites: Typewolf Site of the Day archive https://www.typewolf.com/site-of-the-day and https://typewolf.com/portfolio-sites (snippet); Digidop "20 best fonts 2025" https://www.digidop.com/blog/the-20-best-fonts-for-modern-and-impactful-website-in-2025 (snippet); weandthecolor "Most popular typefaces 2025" https://weandthecolor.com/most-popular-typefaces-2025-update-new-fonts-and-design-trends-you-need-to-know/205279 (snippet); madegooddesigns "Popular fonts designers actually use (2026)" https://madegooddesigns.com/popular-fonts/ and "Best new Google Fonts of 2026" https://madegooddesigns.com/best-new-google-fonts-2026/ (snippet); "The serif renaissance in AI branding", Keya Vadgama https://keyavadgama.substack.com/p/the-serif-renaissance-in-ai-branding (snippet).
- Inter and Geist history: "The birth of Inter", Figma https://www.figma.com/blog/the-birth-of-inter/; "Inter is the new Helvetica" https://mrmr.io/inter; "The Birth of Geist", basement.studio https://basement.studio/post/the-birth-of-geist-a-typeface-crafted-for-the-web; Vercel design system notes https://vercel.com/design.md (all snippet).
- Fontshare ITF Free Font License (commercial OK, self-hosting restricted): https://www.fontshare.com/licenses/itf-ffl, https://madegooddesigns.com/fontshare/, https://www.indiantypefoundry.com/news/introducing-fontshare (snippet). Pangram Pangram trial terms: https://pangrampangram.com/pages/about, https://licenseorg.com/guide/fonts/pangram-pangram (snippet).

Colour:

- Tailwind v4 theme values (OKLCH greys, indigo/violet/purple, radii, shadows): https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css (read in full).
- Radix Colors "Composing a palette" (gray pairings): https://raw.githubusercontent.com/radix-ui/website/main/data/colors/docs/palette-composition/composing-a-palette.mdx (read in full); 12-step semantics https://www.radix-ui.com/colors/docs/palette-composition/scales (snippet).
- APCA introduction (Lc 15/30/45/60/75/90; WCAG equivalence): https://github.com/Myndex/apca-introduction (read in full).
- WCAG 2.2 thresholds and the Bath blog on APCA: https://blogs.bath.ac.uk/digital-content-and-development/2024/11/08/the-times-they-are-a-changin-for-how-we-measure-colour-contrast/ (snippet).
- OKLCH rationale: "OKLCH in CSS: why we moved from RGB and HSL", Evil Martians https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl and the ecosystem post https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools (snippet).
- Tinted neutrals (chroma 0.005–0.02, "pure gray is dead"): https://www.skills.sh/basiclines/rampa-studio/tinted-neutrals, https://skills.sh/phrazzld/claude-config/design-tokens, https://design.verdigris.co/foundations/color (snippet).
- Dark mode (#121212, lightness elevation, 87 % text): https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/, https://uxcel.com/blog/mastering-elevation-for-dark-ui-a-comprehensive-guide-342, https://madegooddesigns.com/dark-mode-design/ (snippet). "Dark mode design that doesn't look AI": https://raxxo.shop/blogs/lab/dark-mode-design-that-doesnt-look-ai (snippet).
- Wathan indigo anecdote, also: https://news.aibase.com/zh/news/20365 (snippet).

Layout:

- 12-column asymmetric splits (5+7, 3+9), 4 px base: https://www.stefanimhoff.de/design-system/layout-and-grids/, https://openskillindex.com/skills/intense-visions-harness-engineering-design-grid-systems-6641ad, https://dev.opera.com/articles/grids-for-web-page-layouts/ (snippet).
- Hero alternatives and editorial first screens: https://www.pravinkumar.co/blog/editorial-layouts-replace-hero-sections-webflow-2026, https://www.pravinkumar.co/blog/asymmetric-two-column-hero-b2b-webflow-2026 (snippet); Hallmark macrostructures and hero enrichment tiers (read in full).
- Spacing decisions and fluid space: https://blakecrosley.com/blog/five-spacing-decisions, https://unpkg.com/@maximbelyayev/tailwind-utopia@1.0.0/README.md (snippet).
- Awwwards criteria (Design 40, Usability 30, Creativity 20, Content 10): https://www.utsubo.com/blog/award-winning-website-design-guide, https://www.hontran.dev/blog/awwwards-judging-criteria (snippet).
- Image ratios and 2× sources: https://thumbprint.design/guidelines/aspect-ratio, https://racklify.com/encyclopedia/how-to-choose-image-aspect-ratio-for-social-ads-and-product-pages/ (snippet).

Detection tooling:

- Boxy, a Playwright layout linter that snapshots bounding boxes and computed styles (model for §5.1): https://github.com/luptonm/boxy (read in full).
- Playwright `toHaveCSS` and computed-style assertions: https://qaskills.sh/blog/playwright-assert-css-computed-style (snippet); cssprobe-cli https://mcpservers.org/servers/mack-peng/cssprobe-cli (snippet).
