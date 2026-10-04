# Detector review: isolated LAP snapshot

Recorded 2026-10-04. This is a scoped interpretation of an existing static detector run, not a clean report or a substitute for visual review. No detector configuration, typography, or main-site source was changed for this review.

## Evidence and scope

Root ran `npx impeccable detect` against the isolated LAP commit snapshot at `/private/tmp/gentrit-lap-commit-check`. Its log is `/tmp/gentrit-lap-detect.log`. The run exited **2** with **143 primary `design-system-font` findings** and **1,133 advisory notes**. No bounce-easing finding appears in that log.

The installed npm package used for this investigation is **impeccable 4.1.0**, whose platform package is **@impeccable/cli-darwin-arm64 0.1.5**. The platform binary directly returned `impeccable-engine 0.1.5`. The separate project-local skill is version **4.5.0**, with launcher engine pin **0.1.11**; these are different distributions, so their versions should not be conflated. The recorded counts belong to the supplied LAP snapshot log. A later scan including the uncommitted LAB may produce different counts.

| Scope | Font primary findings | Color advisories | Font-size advisories | Radius advisories | Advisory total |
|---|---:|---:|---:|---:|---:|
| `src/drafts/**` | 142 | 650 | 334 | 51 | 1,035 |
| Other `src/**` | 1 | 81 | 6 | 11 | 98 |
| Total | 143 | 731 | 340 | 62 | 1,133 |

These counts were parsed from individual finding lines, with each finding attributed to its preceding file header. The one non-draft font finding is the Google Fonts request for **Newsreader** in `src/worlds/reading/Recreation.tsx:23`. It predates this task and remains separate; a draft typography allowance does not resolve it.

## Deliberate draft typography

[ASTRA-CREATIVE-BRIEF.md](ASTRA-CREATIVE-BRIEF.md) §1 requires preserving all 16 existing drafts, and §2.4 requires each draft to have its own type pairing. [CREATIVE-CONSULT.md](CREATIVE-CONSULT.md) §3 pins the nine new directions' faces. Those requirements explain why the main site's Archivo/Martian Mono pair is not an adequate inventory of the independent draft surfaces.

The following are the **19 distinct CSS family names/aliases** responsible for the **142 draft font findings** in this snapshot. Alias spelling is the source spelling; the detector normalizes display capitalization (for example, `FpAmiri` appears as `Fpamiri`). The last column counts finding occurrences, including repeated declarations and `@font-face` declarations; it is not a count of fonts downloaded or visible elements.

| Draft / owning stylesheet | CSS family | Actual local face | Evidence | Findings |
|---|---|---|---|---:|
| `aisle/aisle.css` | `Anton` | Anton | Consult §3.6: shelf talkers and fact tags | 11 |
| `aisle/aisle.css` | `Public Sans` | Public Sans | Consult §3.6: product labels | 3 |
| `aisle/aisle.css` | `Courier Prime` | Courier Prime | Consult §3.6: receipt | 5 |
| `bitrate/bitrate.css` | `bit-bricolage` | Bricolage Grotesque | Consult §3.5: display | 2 |
| `bitrate/bitrate.css` | `bit-plex` | Gentrit Technical Mono, derived from IBM Plex Mono | Consult §3.5: overlay/chat; licensed derivative naming recorded in font sources | 28 |
| `deal/deal.css` | `deal-archivo` | Archivo Narrow | Consult §3.7: card backs and facts | 2 |
| `deal/deal.css` | `deal-fraunces` | Fraunces | Consult §3.7: card faces | 12 |
| `diff/diff.css` | `diff-hubot` | Gentrit Display, derived from Hubot Sans | Consult §3.1: display; licensed derivative naming recorded in font sources | 9 |
| `diff/diff.css` | `diff-mona` | Gentrit Text, derived from Mona Sans | Consult §3.1: body; licensed derivative naming recorded in font sources | 6 |
| `diff/diff.css` | `diff-mono` | JetBrains Mono | Consult §3.1: parity rows | 19 |
| `facing-pages/facing-pages.css` | `FpAmiri` | Amiri, regular and bold | Consult §3.4: Arabic page | 13 |
| `facing-pages/facing-pages.css` | `FpLiterata` | Literata | Consult §3.4: reader body | 5 |
| `fjalekryq/fjalekryq.css` | `FkFranklin` | Libre Franklin | Consult §3.2: crossword tiles | 3 |
| `fjalekryq/fjalekryq.css` | `FkFraunces` | Fraunces | Consult §3.2: clues | 11 |
| `issue/issue.css` | `DraftIssue` | Cormorant Garamond | Existing ISSUE face; brief §1 preserves existing drafts, consult §2 preserves ISSUE's type | 5 |
| `lap/lap.css` | `Lap Display` | Big Shoulders Display | Consult §3.9: track letters | 4 |
| `lap/lap.css` | `Lap Mono` | Martian Mono | Consult §3.9: sector board | 1 |
| `ledger/ledger.css` | `Ledger Mono` | Martian Mono | Consult §3.8: one-face ledger | 1 |
| `savefile/savefile.css` | `Savefile Jersey` | Jersey 10 | Existing SAVEFILE face; consult §2 explicitly identifies Jersey 10, brief §1 preserves existing drafts | 2 |

All stylesheet paths above are relative to `src/drafts/`. Actual `@font-face` URLs were checked against source. The newer assets and derivative names are documented in [public/fonts/creative/SOURCES.md](../../public/fonts/creative/SOURCES.md). ISSUE loads `/fonts/CormorantGaramond.woff2`; SAVEFILE loads `/fonts/Jersey10.woff2`; LAP and LEDGER's mono aliases load `/fonts/MartianMono.woff2`.

LINJA intentionally uses bitmap matrix glyphs for its board and Archivo for small HTML text (consult §3.3); it contributes no undeclared family in this log. Shared Martian Mono used by FJALËKRYQ and FACING PAGES is already declared in the main design system. The other retained drafts mostly use already-declared Archivo/Martian Mono. Their absence from the font findings does **not** establish compliance with the brief's independent-pairing requirement. This inventory records actual faces; it does not invent distinct pairings for those surfaces.

The in-progress LAB also declares `Lab07 Display`, `lm12-archivo`, and `lm16-courier` for its explicit Big Shoulders, Archivo width-axis, and Courier Prime receipt demonstrations. Those source observations are outside this snapshot's 19-family count. Root's later all-LAB detector pass owns their resulting findings.

## Documentation boundary

The current [DESIGN.md](../../DESIGN.md) describes the main portfolio identity. Its documented machine-readable schema is a flat `typography.<role>` object with fields such as `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFeature`, and `fontVariation`. A role can document a real family without inventing a size. The local skill's `extensions.typographyMeta.<role>` sidecar fields carry display names and purposes; they do not define new primitive font values.

No route-scoped typography schema was established by this read-only investigation. Adding all draft families to the root token collection would broaden the declared font set; a prose scope statement alone is not a demonstrated detector enforcement boundary. An invented nested `typography.drafts.<id>` structure or a mega-stack of unrelated families is not justified by the documented schema.

This report therefore documents the deliberate, brief-backed draft choices **without changing root tokens or suppressing findings**. `.impeccable/config.json` remains unchanged: it contains the two existing, draft-scoped exact pop-curve exceptions and no font exception. No file, rule, color, font-size, or radius finding is waived here. The 98 non-draft advisory findings and Newsreader primary finding remain visible for separate triage; the 1,035 draft advisories still require interpretation against each surface's brief and actual usability.

The local Impeccable skill explicitly says that pinned brief fonts take precedence over taste warnings. That supports preserving these faces; it does not convert static warnings into evidence of visual quality, legibility, accessibility, or a clean detector result. The review retains **exit 2**, the complete count distinction, and the unresolved main-site finding.

## Final whole-LAB run

Root subsequently ran the detector against the complete working tree, including LAB, and supplied `/tmp/gentrit-final-detect.log`. This final run used **Impeccable 4.1.0 / engine 0.1.5** and exited **2**. It reported **155 primary findings**: **152 undeclared-font findings**, **2 overused-font findings for Arial**, and **1 thick accent border on a rounded element**. It also reported **1,303 advisory notes**. The earlier isolated-snapshot counts above remain historical evidence; they are not the final whole-tree result.

The same file-header and individual-finding-line parsing gives this precise split:

| Scope | Undeclared-font primary | Other primary | Primary total | Color advisories | Font-size advisories | Radius advisories | Advisory total |
|---|---:|---:|---:|---:|---:|---:|---:|
| Drafts excluding LAB | 142 | 0 | 142 | 650 | 334 | 51 | 1,035 |
| LAB | 9 | 3 | 12 | 162 | 7 | 1 | 170 |
| Other `src/**` | 1 | 0 | 1 | 81 | 6 | 11 | 98 |
| Total | 152 | 3 | 155 | 893 | 347 | 63 | 1,303 |

The nine additional undeclared-font findings are Arial in `lab.css` and `02-css3d.css` (two occurrences); Georgia in `02-css3d.css`, `06-letters.css`, and `08-curl.css` (three); `Lab07 Display` in `07-msdf.css` (one); `lm12-archivo` in `12-width.css` (two); and `lm16-courier` in `16-receipt.css` (one). Move stylesheet paths are under `src/drafts/lab/moves/`. These are five additional family names/aliases, not nine new faces. The earlier 19-family inventory and the separate non-draft Newsreader finding are unchanged.

The three other primary findings remain for **manual review**:

- `src/drafts/lab/lab.css:9` and `src/drafts/lab/moves/02-css3d.css:70`: `overused-font` reports Arial. In source, these serve the neutral study interface and the reader's numeric control output. That contextual purpose explains the choice but does not constitute a pinned-font brief exception or prove the warning false. The shell also inherits Arial for headings; this review does not claim its use is limited to small utility text.
- `src/drafts/lab/moves/05-morse.css:46`: `border-accent-on-rounded` reports the key's `border-bottom: 6px solid`, alongside a 5 px radius. The source represents a pressable Morse hardware key with a lower edge, shadow, and depressed state. That literal control context should inform manual review, but this report does not suppress or automatically dismiss the finding.

No bounce-easing finding appears in the final log. Neither the specified pop-curve exceptions nor these contextual explanations imply a clean detector run. No detector config or UI source was changed for this documentation update; all 155 primary findings and 1,303 advisories remain recorded.

Root separately reported full TypeScript, scoped lint, and diff checks passing, and the final measured gzip values of **19.724 kB main entry**, **101.435 kB initial JavaScript**, **131.316 kB complete LAB route budget**, and **112.510 kB LAB union (98.969 kB JavaScript + 13.541 kB CSS)**. Those build/source checks and bundle measurements do not resolve the detector findings or establish physical-phone frame rate.

The final reader-visibility repair changed only the CSS face-culling setting. The required detector was refreshed afterward and again exited 2 with the same primary/advisory counts. The production measurements above include that repair.
