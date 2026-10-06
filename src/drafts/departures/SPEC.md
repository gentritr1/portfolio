# DEPARTURES — type and colour spec

Written before the build. Concept C5 in `design/art-directions/loop/DIAGNOSIS.md` §4.4.

Rule: the first screen is one flip-disc board. Every picture on it is discs. The HTML under it is a printed bus timetable of the work.

## 1. Faces and files

| Role | Face | File | Axis values |
| --- | --- | --- | --- |
| Board, small | Drawn 5×7 bitmap, proportional (I, 1-col punctuation, 3-col word space) | `glyphs.ts` | none |
| Board, large | Drawn 7×9 bitmap, two-disc stems, one-disc bars | `glyphs.ts` | none |
| All HTML | Archivo Narrow | `public/fonts/creative/ArchivoNarrow-Latin.woff2` (wght 400–700, preloaded, `font-display: swap`) | `wght` 400 / 600 / 700 only |

No mono. No second HTML face. Archivo Narrow has no optical-size axis, so optical sizing is done with tracking per size (table 2). Features used: `onum` (hanging figures in running text), `onum tnum` (hanging, tabular: the Years column), `lnum tnum` (line-number plates), `case` (caps labels).

Why not the brief's single-face sizes as given: the brief sets 20 px / 15 px. Kept. Added one display size (72 px, 700) for the word "Departures", because a printed timetable has one large title and the condensed face carries it without a second face.

## 2. Sizes, tracking, measure

| Element | Weight | Size / line | Tracking | Figures |
| --- | --- | --- | --- | --- |
| Title "Departures" (desktop / phone) | 700 | 72 / 68 px; 48 / 46 px | −0.025 em | — |
| Identity line (h1, paper) | 400, name 700 | 27 / 32 px (phone 21 / 26) | −0.008 em | — |
| Identity sub-line (5+ years, rewrites, app stores) | 400 | 17 / 24 px (phone 15 / 21) | +0.005 em | onum |
| Column heads (caps) | 600 | 12 / 16 px | +0.10 em | — |
| Line-number plate | 700 | 26 / 26 px | 0 | lnum tnum |
| Destination | 600 | 20 / 24 px | −0.01 em | — |
| Via | 400 | 15 / 20 px | +0.01 em | onum |
| Platform | 400 | 15 / 20 px | +0.01 em | — |
| Years (right-aligned) | 400 | 15 / 20 px | +0.01 em | onum tnum |
| Detail paragraph | 400 | 17 / 26 px, measure 58 ch | +0.005 em | onum |
| Detail caps label | 600 | 12 / 16 px | +0.10 em | — |
| Strip caption (under the board) | 400, line 600 | 16 / 22 px | +0.005 em | onum |
| Controls | 600 | 15 px, 44 px min target | +0.01 em | — |
| Concept tag (timetable row) | 600, caps, 2 px frame | 12 / 14 px | +0.10 em | — |
| Morse meter labels | 600 | 15 / 20 px | +0.01 em | — |

Board rhythm: 1 disc between letters, 3 discs between words, 11–12 disc line pitch for 5×7, 7×9 destination on the plate's optical centre. Desktop board 160 × 60 discs, phone 70 × 100 discs.

## 3. Colour

| Token | Hex | Job |
| --- | --- | --- |
| `--disc` | #F5C400 | Disc front (safety yellow). Lit pixel on the board; numerals in black plates. |
| `--disc-back` | #0E0E0E | Disc back; housing ground. |
| `--board` | #121212 | Board ground between discs. |
| `--paper` | #F3EFE2 | Timetable paper. |
| `--ink` | #15130F | Timetable text and rules. |
| `--ink-2` | #544E42 | Secondary timetable text (via, platform). |
| `--red` | #E3001B | Current line only: the route stripe and the plate of the line the board shows. |
| `--cream-2` | #A8A291 | Secondary text on the housing. |

Measured pairs (WCAG 2.x, `dep/contrast.py`):

- ink #15130F on paper #F3EFE2: 16.13
- ink-2 #544E42 on paper: 7.17
- paper on housing #0E0E0E: 16.78
- cream-2 #A8A291 on housing: 7.58
- disc #F5C400 on housing #0E0E0E: 11.75; ink on disc: 11.29
- red #E3001B on paper: 4.26 (non-text stripe needs 3:1; passes)
- paper on red: 4.26, used only for the 26 px 700 plate numerals (large text, 3:1; passes)

Timetable rows are told apart by a printed tint band (`--paper-2` #E9E3D0 on odd rows), not by 1 px rules. Measured on paper-2: ink 14.46, ink-2 6.43, the red current numeral (26 px 700, large text) 3.82.

Dark is allowed because the material is dark. This is not "cream paper plus one accent": the first screen is black and yellow discs; the paper is a second material (the printed timetable) with black ink and a red route colour, as a real bus timetable is printed.

## 4. Motion and sound

- Disc: one spring per disc (stiffness 210, damping 24), sleeps when settled; one draw call.
- Each line has two pages, 3 s each, as a real bus sign pages through its text: the text page (plate, destination, years, three stops, next line), then the result page (what changed, as one large figure at 2× or 3× disc scale, a label and one short line). Concepts and the Morse line show a drawn shape in place of the figure: a step grid (OFFBEAT), a trefoil with gaps at its under-crossings (FORM), the W and C keys (Morse Trainer). Plate, years and destination stay while the pages turn. A sentence that does not fit whole is left out; the strip under the board carries it.
- No screenshots on the board. Real screens stay crisp and at native size in the timetable rows.
- The identity is two pages too: the name with web, mobile, server side and "Part of 2 platform rewrites", then "5+ years" with "Apps in both app stores". The HTML identity line and sub-line stay on screen at all times.
- After one full round the board rests on the name. Play runs it again.
- The route plate is a one-disc frame with lit numerals. A filled plate with knocked-out numerals was tried first and read worse at disc size.
- Letters write in Farnsworth time: one dit = 60 ms between letters, three dits between words. Stops write at half a dit. Large figures write one glyph each three dits, rows top to bottom.
- First frame: every disc lit (the lamp test), drawn in CSS before the canvas exists, then by the canvas. It clears at 650 ms.
- Morse key: a press under 200 ms is a dot. 700 ms of silence ends a letter. A dot–dash meter in the strip fills while a press is held and turns red past 200 ms. Space keys Morse only when the board has focus; otherwise Space scrolls the page.
- Sound: off by default, never stored. The AudioContext is made only inside the Sound button's click. Every press on the board resumes it inside the gesture and plays one silent sample (iOS). With sound on, `navigator.audioSession.type` is "playback" where it exists; on an iOS without it, one small line says "No sound? Turn off the silent switch." Granular clicks: 20 ms noise through a band-pass, at most 8 new voices a frame and 64 at once, panned by the disc column.
- Reduced motion: no rotation, no auto-advance, no sound; the board shows its final frame at once; every state change stays.
- No WebGL: Canvas 2D draws the same discs (`?webgl=0` forces it for checks).
