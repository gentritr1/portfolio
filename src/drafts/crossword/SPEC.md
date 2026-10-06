# crossword: type and colour spec

Rule: the site map is an Albanian crossword. Each answer is one piece of work. The clue is the result in plain words. A typed name falls into its cells.

## Faces and files

| Role | Face | File | Axes used |
| --- | --- | --- | --- |
| Tiles, names, labels, buttons | Libre Franklin | `public/fonts/creative/LibreFranklin-Latin.woff2` (28.7 kB, `wght` 100–900) | `wght` 700 in tiles, 800 in the puzzle title, 600 in buttons, 700 caps for names |
| Clues, identity line, case lede | Fraunces | `public/fonts/creative/Fraunces-Latin.woff2` (64.2 kB, `opsz` 9–144, `wght` 100–900, `SOFT`, `WONK`) | `opsz` set by hand per size (below), `SOFT` 100, `WONK` 0 |
| Clue numbers only | Martian Mono | `public/fonts/MartianMono.woff2` (global face) | `wght` 500, `wdth` 100 |

Both creative faces are preloaded by the draft module. Text renders in the fallback at once (`font-display: swap`); no text waits for a face.

The mono appears on one kind of glyph only: the clue number (in the cell corner, in the clue list, in the case head). It never sets a line of small print.

## Sizes, optical size, tracking, measure

| Element | Face | Size / line | `opsz` | Tracking | Measure |
| --- | --- | --- | --- | --- | --- |
| Tile letter (board, scale 1) | Franklin 700 caps | 26 px in a 44 px cell; shown at camera scale (0.58–1) | – | +0.04 em | 1 letter |
| Name tiles (header, own band) | Franklin 700 caps | 14 px in 25 px tiles; 30 px in 48 px tiles | – | +0.04 em | – |
| Identity line (h1) | Fraunces 400 | 40/1.06 desktop (one line over the board), 34 at ≤ 1100, 30/1.1 phone | 96 | −0.02 em | one line at 1440 |
| Identity sub-line | Fraunces 400 | 19/1.35 (17 at ≤ 1100) | 20 | 0 | 66 ch |
| Lead result (open answer) | Fraunces 400 | 28/1.14 desktop, 24 at ≤ 1100 and phone | 36 | −0.015 em | 24 ch |
| Lead scope | Franklin 500 | 15/1.45 | – | 0 | 52 ch |
| Clue result (recruiter path) | Fraunces 400 | 18/1.26 | 20 | 0 | 44 ch |
| Clue result (index of other answers) | Fraunces 400 | 16/1.38 | 16 | 0 | 38 ch |
| Own-band result | Fraunces 400 | 30/1.15 desktop, 23/1.2 phone | 48 | −0.015 em | 22 ch |
| Name over a clue | Franklin 700 caps | 12/1.3 | – | +0.06 em | – |
| Puzzle title "Fjalëkryq" | Franklin 800 | 30/1 | – | −0.03 em | – |
| Buttons, body labels | Franklin 600 | 15/1.3 | – | 0 | – |
| Clue number | Martian Mono 500 | 11 px | – | 0 | – |

The opsz values follow the size: small clue text uses a low optical size (open counters, sturdier serifs) and the identity line uses a display cut. This is the brief's "Fraunces opsz 20 for the clues", extended to the display sizes.

Pass 10b: no 1 px rules. Rows separate by space; links and controls are 2 px ink boxes or 2 px underlines.

## Colour

Three colours and one job each. No fourth colour outside the screenshots.

| Token | Hex | Job |
| --- | --- | --- |
| Field | `#F2B705` | The page. The puzzle sits on mustard paper. |
| Ink | `#161616` | Text, rules, tile borders, filled-tile letters. |
| Paper | `#FFFCF2` | The tiles; the button and plate grounds. |
| Signal | `#1F4BFF` | The active word, the "Open" control, the focus ring. Fill only, never text on mustard. |

Measured contrast (WCAG 2.x):

| Pair | Ratio | Use |
| --- | --- | --- |
| Ink on field | 9.95:1 | All text on the page |
| Ink on paper | 17.63:1 | Tile letters, plate captions |
| Paper on signal | 5.83:1 | Letters in the active word, the Open button |
| Signal on field | 3.29:1 | Focus ring and the active-word outline only (non-text, ≥ 3:1) |
| Signal on paper | 5.83:1 | Focus ring on paper |

No muted grey: hierarchy comes from face, size and weight, so every line keeps 9.95:1 or better.

Why this differs from nothing in the brief: the brief's colours are kept. The one addition is the rule that the signal blue never sets text on the mustard field (3.29:1 fails 4.5:1).
