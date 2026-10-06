# ONE SCREEN: spec

Rule: the whole portfolio fits on one screen at 1440 x 900. Every project line lights a real screen beside it. Nothing else moves unless the visitor moves.

## Words (first screen, 1440)

- Gentrit Rashiti
- Builds web and mobile apps. Part of two platform rewrites. 5+ years, working remotely from Kosovo.
- One report made 16 database requests. Now it makes 2.
- Client work: Care platform, Bayyinah TV, Design System v2, Viva Fresh, Read to Feed, Dukagjini Bookstore, Incentiv. Own projects: Offday, OFFBEAT, FORM. Each line: name, then 4 to 9 plain words.
- How Gentrit works: "Gentrit writes the rules first. AI agents build inside them." Diagram: Rules, AI agents build, Checks, A person approves. "A check fails? The work goes back to the agents." Links: Care platform, Design System v2.
- Email, GitHub, LinkedIn, CV.

Facts come from CONTENT.md and projects.ts. No first person, no "he", no internal counts.

## Type and colour

| Use | Face | Size / line height | Weight |
| --- | --- | --- | --- |
| Name, lines, groups, sub-line | Instrument Sans | 17 / 1.5 | 500 for names, 400 for the rest |
| Captions, diagram, switch, "See it in" | Instrument Sans | 14 / 1.45 | 400 (500 for "A person approves") |
| The one line about the work | Instrument Serif italic | 22 / 1.3 (21 on a phone) | 400 |

Colours: paper #F4F1EA, ink #191816, muted #6B675F (5.0:1 on paper), rule = ink. Dark scheme: #141311, #ECE8DF, #969186. The screens bring their own colours.

Fonts load from Google Fonts with preconnect and preload of the two Latin files. The page waits up to 300 ms. If the faces are late, the system sans stays for the visit, so no line moves (CLS 0).

## Layout

- 900 px and wider: two columns, 600 px list and the screen column. The screen column is sticky. Rows are a grid: name (11.5em), then the line.
- Under 900 px: one column. The list is the page. The current screen stays in a panel at the bottom (4:3, at most 26 % of the height) with one caption line, "Read the case" and the screen switch. The page ends with space for the panel, so the panel never covers content for good.
- Under 900 px and under 560 px high (a phone on its side): the panel stands under the name, not fixed.

## Motion

| What | Trigger | Timing | Properties |
| --- | --- | --- | --- |
| Rule under the current name | pointer rests 80 ms on a line, tap, focus | 180 ms cubic-bezier(0.2, 0, 0, 1) | transform (translate + scaleX) |
| Screen change | same, after the image decodes | 200 ms, same curve | opacity, new layer over old |
| First screen | first load, after decode | 300 ms | opacity |
| 16 to 2 marks | enters view, once | 380 ms each, 18 ms stagger, 120 ms delay | transform scaleY + opacity |
| Work diagram | enters view, once | steps 220 ms, arrows 130 ms, loop 280 ms; about 0.9 s total | opacity, transform, stroke-dashoffset |
| To a case page | press | 160 ms | opacity of the page |

Keyboard moves (Tab, arrow keys, the switch by keyboard) have no motion. Reduced motion: no fades, no draws; every element is in its final state.

## Screens

Lead: care calendar week (appointments-week.webp). Every screen is a real capture at its own crop, no device frame. Vianova screens say "Real product screens, invented data." The Design System line shows the Storybook capture and the care dashboard that uses it; no recreation is used.
