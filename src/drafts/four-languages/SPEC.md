# four-languages: type and colour spec

Concept C3 (DIAGNOSIS §4.4). The page is in English, Shqip and العربية. A switch re-sets the whole page, and the Arabic switch mirrors the layout right to left.

## Type

One family name, `FL Serif`, holds two scripts. `unicode-range` sends Latin to Literata and Arabic to Amiri, so a mixed line needs no markup. Chrome joins faces into one range group only when their weight ranges are equal, so each weight band (400–499 and 500–600) declares both scripts.

| Face | File (this folder) | Source | Axes or weight | Size |
| --- | --- | --- | --- | --- |
| Literata | `fonts/Literata-Latin-400-600.woff2` | `public/fonts/creative/Literata-Latin.woff2`, `wght` limited to 400–600, Basic Latin + Latin-1 + quotes, dashes, arrows | `opsz` 7–72 (auto), `wght` 400–600 | 75 kB |
| Amiri Regular | `fonts/Amiri-Regular-Arabic.woff2` | `public/fonts/creative/Amiri-Regular.woff2`, Arabic letters, marks, Arabic-Indic digits, Arabic punctuation, all shaping features | static 400 | 41 kB |
| Amiri Bold | `fonts/Amiri-Bold-Arabic.woff2` | `public/fonts/creative/Amiri-Bold.woff2`, same range | static 700, used for 500–600 | 41 kB |

Made with fontTools 4.x: `fonttools varLib.instancer Literata-Latin.woff2 wght=400:600`, then `pyftsubset --layout-features='*'` with the ranges above. Both licences are OFL without a reserved name; the OFL texts are in `fonts/`.

Amiri has `size-adjust: 122%` so an Arabic word sits at the same visual size as a Latin word on the same line. Its ascent and descent are overridden (78 % / 42 %); Literata covers U+0020, so Literata sets the line box in every language.

| Role | Latin (Literata) | Arabic (Amiri, ×1.22) | Tracking | Measure |
| --- | --- | --- | --- | --- |
| Identity line (h1) | 64 px / 1.06, `wght` 500, `opsz` 64 | 56 px / 1.5, Bold | −0.025 em Latin, 0 Arabic | full row in every language (one line at 1440), so the box keeps one width in the switch |
| Level line (under the h1) | 24 px / 1.35, 400, vellum | 24 px / 1.7 | −0.005 em Latin | 960 px |
| Same line in the other languages | 20 px / 1.35, 400, `opsz` 20 | 20 px / 1.7 | 0 | 4 of 12 columns |
| Section title (h2) | 32 px / 1.15, 500 | 32 px / 1.6, Bold | −0.015 em | — |
| Row result (largest text in a row) | 24 px / 1.25, 500, lining figures | 24 px / 1.6, Bold | −0.01 em | 4 of 12 columns |
| Body, row line | 17 px / 1.55, 400 | 17 px / 1.85 | 0 | 30 em |
| Small (labels, role, years, captions) | 14 px / 1.45, 400–500, years lining and tabular | 14 px / 1.8 | +0.01 em on the one label | — |
| Language names in rows | 15 px / 1.4, 500, gold | same | 0 | — |
| Phone (< 720 px) | h1 36 px / 1.1, −0.02 em; level line 19 px; row result 21 px; h2 26 px | h1 32 px / 1.55 | | 16 px gutters |

Rules: Arabic is never tracked (`letter-spacing: 0` on every `:lang(ar)` node), because tracking breaks the joins. No mono. No uppercase, because Arabic has no case and the three languages share one style. Years in Arabic use Arabic-Indic digits.

Why not the brief's 48 px: the identity line is the picture of the page, and at 64 px Literata uses its display optical size; 48 px read as a heading, not as type to look at. Why not cream paper: cream plus one accent is banned in this round (see palette).

Font wait: the page renders nothing for at most 300 ms. If the faces are not ready, it renders with the fallback stack (`FL Fallback` = Georgia sized to Literata, then Geeza Pro or Noto Naskh Arabic) for the whole visit, so a late face never moves text. All three files are preloaded. Production build, cold profile, local server: the faces are requested at 69–76 ms and arrive at 73–80 ms (3 runs), so the empty wait is about 10 ms; the 300 ms cap is for slow networks.

## Colour

The brief asked for paper #FBF6EA + ink + oxblood. That is "cream paper plus one accent", which this round bans. The palette here comes from manuscripts in both the Arabic and the Latin tradition: ultramarine (lapis) ground, vellum text, gold for the voice that is active. Ultramarine and gold are also the colours of the Kosovo flag. The two dark captures (Bayyinah TV, FJALË) sit on it as dark objects, and the red Viva Fresh frame reads against it.

| Token | Hex | Job | Measured contrast (WCAG) |
| --- | --- | --- | --- |
| `--lapis` | #1A2466 | Ground of the whole page, header, html background | — |
| `--vellum` | #F2EADB | Text, links | 11.81 : 1 on lapis |
| `--gold` | #E0B252 | Active language, language names, link underlines, focus ring, selection | 7.16 : 1 on lapis; lapis on gold 7.16 : 1 |
| `--muted` | #C3C6E0 | Secondary lines, captions, inactive languages | 8.38 : 1 on lapis |

No rules: rows and the header separate by space only (56 px between rows). No fourth colour. The page does not change colour per language; only the direction changes.

## Motion

One motion: the switch. `document.startViewTransition` with named parts (each nav item, the headline, the level line, each hero slot, each row cell, each capture and caption). It runs in three stages so the eye can follow it: the header and the headline row start at 0 ms, the columns at 80 ms, the rows and the footer at 160 ms. Each part moves for 320 ms on `cubic-bezier(0.32, 0.72, 0, 1)`, so a switch ends at 480 ms. Text in the columns and rows fades out in 100 ms and fades in only near its new box (200 ms after its stage starts), so no text is visible while it crosses a capture. The headline keeps one box width in every language, so its text never scales; it cross-fades in place (out 0–120 ms, in 100–220 ms). Captures and the language names move as objects and never cross-fade. The root does not fade. The reader's block keeps its height on the screen (scroll anchor). Reduced motion: the switch is instant. No live object, no sound.

## Pictures

Hero: the Bayyinah TV library (public page, `web-03.webp`, 1440 × 900) beside a flat phone-width capture of the same public page (`shots/bayyinah-phone-arabic-tab.webp`, 390 × 645 CSS px at 2×, taken from bayyinahtv.com/library/arabic, cut on whole rows). No device frame. At phone width only the phone capture shows, at 280 px, so its text stays at 11 px or more. Viva Fresh: a flat crop of the store screenshot's screen (`shots/viva-fresh-home.webp`, 596 × 862 px from `public/mobile/grocery-1.webp`), with no phone body. The public Bayyinah TV site shows no Arabic interface without a login, so the page shows no Arabic product screen and makes no claim that needs one.
