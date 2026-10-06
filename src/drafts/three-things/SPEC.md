# THREE THINGS THAT RUN (round 11, concept C-C)

## Rule

Three things on the page run. They are the owner's own projects, built from their real code and behaviour. Everything else is text and real screens. Nothing moves until a visitor touches it, with one exception: the 16 → 2 figure plays once when it comes into view.

## First screen (1440 and 390)

> Gentrit Rashiti builds web and mobile apps.
> Three things on this page run: a drum machine, a sculpture and a Morse key. Try them.
> 5+ years · part of two platform rewrites · Kosovo, works remotely

Under it: the real care team calendar (`appointments-week.webp`, a still, Tuesday and Wednesday only on a phone), with "Real product screens, invented data." The three nouns in the second line jump to the three objects.

## Order of the page

1. Words, then the care calendar still and its caption (links to `/work/care-platform`).
2. Two explaining figures: "How a change gets into the new app" (a stepper, with the AI-workflow sentence and links to `/work/care-platform` and `/work/design-system-react`) and "One billing report" (16 → 2).
3. Client work: six real screens, each tile links to its case page.
4. Own projects: OFFBEAT drum row, FORM trefoil, Morse Trainer key. Then Offday (still) and FJALË, Za! (text and links).
5. Contact.

## The three objects, and where their behaviour comes from

| Object | Source | What is the same |
| --- | --- | --- |
| OFFBEAT drum row | `drums.ts`, from the OFFBEAT repository `lib/offbeat/audio.ts` | 4 sounds (kick, snare, hi-hat, bass), 8 steps, the "Kitchen disco" preset, 112 BPM, swing 54 %, look-ahead scheduler. Acid cells, hot playing column, as in the OFFBEAT studio. |
| FORM trefoil | `trefoil.ts`, from the FORM repository `dist/app.js` | Same knot curve, mesh, shaders, copper, chrome and porcelain values, the 280 ms material blend, the accent that follows the metal. |
| Morse key | `morse.ts`, from morse-code-amber.vercel.app `send.js`, `morse-audio.js`, `config.js` | Send mode: tap for a dot, hold for a dash, Check then Next. Koch order K M R S A T O I N E. Gentle speed (18 wpm characters): a press of 2 units (133 ms) or more is a dash. 600 Hz sine tone. |

Changes made for this page: the trefoil coasts with `e^-6t` (stops in about 1.2 s), arrow keys turn it 15° with no motion, there is no load spin. The Morse key judges the free-keyed letter on Check; it has no spaced-repetition memory.

## Type

| Element | Face | Size | Axes |
| --- | --- | --- | --- |
| Identity line | Gentrit Display (Hubot Sans) | clamp(36, 5.4vw, 72) / 1.02 | wdth 112, wght 700, −0.025 em |
| Lede | Gentrit Display | clamp(22, 2.2vw, 28) / 1.25 | wdth 100, wght 400 |
| Section names | Gentrit Display | 28 (24 phone), caps | wdth 80, wght 800 |
| Object names | Gentrit Display | 28 | wdth 120, wght 700 |
| Big glyphs (Morse letter, 16 / 2) | Gentrit Display | 96 (72 phone) | wdth 120, wght 700 |
| Names in rows and figures | Gentrit Display | 17 / 15 | wdth 100, wght 600–650 |
| Body, captions | Public Sans | 17 / 14 | wght 400 |

The width axis is set once for each element. It never animates. Fonts: `font-display: optional`, preloaded, text waits at most 300 ms.

## Colour (OFFBEAT's own palette)

| Token | Value | Job | Contrast on ink |
| --- | --- | --- | --- |
| ink | #0E0E0E | ground | — |
| bone | #F2EDE4 | text | 16.56 |
| muted | #A7A29A | captions | 7.61 (7.08 on the #171715 panels) |
| hot | #FF5A36 | the thing you touch now: Play, lede links, playing column, key down, failed check, focus ring | 6.22 |
| acid | #D9F26B | drum cells that are on (never text) | 15.50 |
| metal | copper #C8773A / chrome #9EB3C7 / porcelain #A3C9B4 | the FORM band name and swatch ring | 5.66 / 8.94 / 10.64 |

Client screens keep their own colours.

## Motion (all of it)

| Motion | Trigger | Timing | Properties |
| --- | --- | --- | --- |
| Flow dot walks to the next stop | Next step / Back (pointer) | 450 ms `cubic-bezier(0.77,0,0.175,1)` | transform |
| "Fails? It goes back." line draws | step 5 of 7 | 500 ms `cubic-bezier(0.23,1,0.32,1)` | stroke-dashoffset |
| 16 marks → 2 | once on entering view (60 %, after 400 ms), or a tap | 14 marks fade 300 ms, 30 ms stagger; 2 marks close up 500 ms after 400 ms; number cross-fades 300 ms | opacity, transform |
| Drum playing column | Play | instant, one step = 268 ms | box-shadow colour, no transition |
| Trefoil | drag | follows the pointer, coasts ≤ 1.2 s | WebGL |
| Material | radio | 280 ms blend in the shader; page colour instant | WebGL |
| Play press | pointer | 120 ms scale 0.97 | transform |

A keyboard press on the stepper or the 16 → 2 buttons changes state with no motion (`event.detail === 0`). Reduced motion: no transitions, the 16 → 2 figure starts in its final state, no drum step light, no trefoil coast; every state is still shown.

## Sound

Off until a press. The drum AudioContext is made inside the Play press. The Morse tone is off by default; "Sound off / Sound on" makes its AudioContext inside that press. Escape, a hidden tab or scrolling the drum row out of view stops the drums.

## Phone

Same page in one column. The care still shows two days. Tiles use readable crops (`narrow`). The drum grid turns: 8 steps down, 4 sounds across, every cell ≥ 44 px. The flow stepper turns into 5 rows with the way back on the right. The trefoil canvas uses `touch-action: pan-y`, so a vertical swipe scrolls.
