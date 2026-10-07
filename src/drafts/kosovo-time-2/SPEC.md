# KOSOVO TIME II: spec

Concept C-B of the round-11 study ("KOSOVO TIME, evolved"). The real sun over Kosovo (42.6° N, 20.9° E) lights the page at the visitor's clock. Every screen stands on the ground and casts the shadow that the sun gives it. Nothing on the page explains the mechanism. The time beside the sun says it.

Sun, light and floor code are copies of `src/drafts/kosovo-time/` (`sun.ts`, `light.ts`, `clock.ts`, `scene.ts`), with the changes listed under "Frame budget".

## First screen

Words (22): "Gentrit Rashiti builds web and mobile apps, from Kosovo." / "5+ years. Part of two platform rewrites. Working remotely." / "17:45 in Kosovo".

- Sky: the sentence, the sub-line, and one line across the page: today's sun path at 1 px, a 24 px disc on it, and the time beside the disc. The disc is the only control for the hour (drag, tap on the line, arrow keys, Home, End). No pills, no Play, no hint, no sun sentence, no path labels, no "Back to now".
- Ground: the care team calendar (web, real screen, invented data; the crop ends above the 12 PM line, so no row is cut) and the Viva Fresh cart (phone). Each plate has its own title bar and is a link to its case.
- Desktop 1440 × 900: the ground starts at y = 312; both plates end at y = 832. Phone 390 × 844: the calendar plate (Monday to Wednesday) ends at y = 651. The cart plate comes next.

## Type

Two faces, four sizes on the first screen: Fraunces 64 px (opsz 144) for the sentence; Public Sans 20 px (time), 17 px (sub-line), 14 px (title bars). Rows: name Fraunces 28 px, body 17 px, role 15 px. Section names Fraunces 40 px. No 13 px text (the phone title bars are 14 px).

## Home

When the page is mounted at `/`, the title is "Gentrit Rashiti — web, mobile & full stack". A return from a case restores the scroll of that history entry and keeps the chosen hour (`kt-at` in sessionStorage); `?at=` wins; a fresh visit opens at the real hour; `/#work` opens at the work.

## Colour

The light keys are unchanged from KOSOVO TIME (`light.ts`, contrast ≥ 4.5:1 on every pair). One new token:

- Band = `color-mix(in oklab, shade 30 %, ground)`, computed where it is used: the second surface, behind the section names (120 px band, 88 px on a phone) and the footer.
- The work card is a white card with its own fixed ink (#17171a, #55555e, #3d3d45, accent #1f45b5), as a screen keeps its own colours.

## Rows

Client work: Care-management platform (claims screen + work card + 16 → 2 marks as a small proof in the row), Bayyinah TV (library), Design System v2 (date range picker + work card), Viva Fresh, Read to Feed (reader page), Dukagjini Bookstore (foreign books list), Incentiv (sign-in card, small plate). Own projects: Offday, OFFBEAT and FORM (studio screens, one ground), then three games, one line each.

- Desktop: plate left, text right. Card rows: the words in two columns, then the screen (at most 760 px) and the 340 px card beside it on one ground. The three phone apps stand side by side on one ground, each with its words under it. At ≤ 1023 px the plate is above the text; phone screens stand in a 220 px (128 px on a phone) column beside the text.
- Phone: the work card is the second plate of the care row. The Design System card shows its sentence and "Read how" only, because the care card above it already drew the loop. OFFBEAT and FORM stand in the 128 px column with a tall crop.
- The case link and the outside links share one line of links.
- Each plate is a link. It is out of the tab order, because "Read the case" in the same row goes to the same page. The lead plates and the work cards are in the tab order.
- Page length: 5,783 px at 1440 × 900, 6,194 px at 390 × 844.

## Explaining figures

1. Work card (care and Design System rows): the AI line from `CONTENT.md` as the card text, the loop (Old app / Research, Test first / Guides, Agents build, Checks, Person approves) and the way back from "Checks" to "Agents build" ("A check fails? Back to the agents."), as a white card that stands on the ground like a screen and casts its shadow. It links to the case that draws the full diagram.
2. Marks (care row): 16 marks, of which 14 fall to stubs, beside "16 → 2 database requests for one billing report, before and after". It is a small proof inside the row, never a headline.

## Motion

All motion is transform or opacity. Keyboard moves are instant.

| Motion | Trigger | Timing | Reduced motion |
| --- | --- | --- | --- |
| Sun run | first load of the page | 90 min → now in 1.1 s, `cubic-bezier(0.65, 0, 0.35, 1)`; skipped when the load takes more than 2 s | static hour |
| Stand-up | lead plates after the sun run; rows when 30 % in view | rotateX 14° → 0 in 620 ms, 90 ms apart, `--k2-out`; the shadow grows from 20 % of its reach; at night the screens switch on in 420 ms | complete, still |
| Sun drag | pointer, tap on the line, keys | spring 350 / 35, flick coasts at most one hour | instant |
| Work card | 60 % of the list in view, once | steps fade up 6 px, 300 ms, 80 ms apart, from 200 ms; lines grow 200 ms; a white cover over the way back shrinks upward in 280 ms at 560 ms, so the line draws from the bottom up; label at 640 ms; done by 0.84 s | complete, still |
| Marks | 60 % in view, once | 14 marks fall to 30 % height, 360 ms, 28 ms apart from the right, from 150 ms; done by 0.87 s | complete, still |
| Press | any plate, card or lead | scale 0.98, 120 ms, `cubic-bezier(0.2, 0, 0, 1)` | none |
| Hover (fine pointers only) | plate, card, lead | ring 18 % → 55 % ink, 150 ms; row name underline | same |
| Hand-off | plain click on a plate, a card or "Read the case" | View Transition. When a case screen on view after the route change shows the same picture file, the pressed plate walks into it (420 ms). Otherwise the old page fades out in 180 ms; a picture never turns into another one. The case code starts to load when a pointer or the focus reaches the link | plain navigation |

## Frame budget

- While the sun moves, only the parts on or near the screen (header, first screen, bands, rows, footer, watched by an IntersectionObserver) take the nine light variables; the page ground takes the light as a plain background on `<html>` and `.k2`. The whole page takes the light 60 ms after the last moving frame, in a frame of its own. A drag restyles about 30 elements, not 690.
- The figure parts get their layers (`will-change`) while they wait, so the first frame of a play builds none.
- The sun line changes words outside React, once a minute at most; a drag renders no component and reads no layout.
- The clock emits once per frame (no second emit inside `set`); the chosen hour is written to storage 160 ms after the drag rests.
- The floor shader compiles with `KHR_parallel_shader_compile` after the stand-up; the draw reuses its arrays. A floor releases its GL context when the page is idle, never inside the route change.
- The hour still travels to the case pages in sessionStorage `kt-at`.
