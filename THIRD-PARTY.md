# Third-party notices

## uselayouts interaction reference

The motion-craft brief references interaction patterns from [uselayouts](https://github.com/iurvish/uselayouts). The drafts implement those behaviors in their own visual systems. No stock component styling is retained. The reference's MIT notice is preserved below.

Source: https://github.com/iurvish/uselayouts/blob/main/LICENSE

MIT License

Copyright (c) 2025 Urvish Mali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Fonts

Self-hosted creative draft fonts, source revisions, modifications, and individual SIL Open Font License notices are recorded in `public/fonts/creative/SOURCES.md` and the license files alongside the fonts.

## LAP geometry, distance fields and solar position

LAP ships generated glyph geometry and an RGB multi-channel distance-field atlas in `public/lap/`. The exact license notices are distributed beside those assets:

| Component | Use | License and distributed notice |
|---|---|---|
| SunCalc 1.9.0 | The adapted solar-position subset in `src/drafts/lap/solar.ts` calculates the Kosovo sun direction and solar noon. | BSD-2-Clause, copyright 2014 Vladimir Agafonkin. [Full SunCalc notice](public/lap/SunCalc-LICENSE.txt). |
| Earcut 3.0.2 | Build-time triangulation of glyph front and back faces, including outline holes. | ISC, copyright 2024 Mapbox. [Full Earcut notice](public/lap/Earcut-LICENSE.txt). |
| MSDFgen 1.12 | Build-time edge colouring and generation of the RGB glyph distance fields in `names-msdf.png`. | MIT, copyright 2014–2024 Viktor Chlumsky. [Full MSDFgen notice](public/lap/MSDFgen-LICENSE.txt). |
| Big Shoulders Display | Font outlines at weight 700 supply the extruded glyphs and distance-field atlas. | SIL Open Font License 1.1, copyright 2019 The Big Shoulders Project Authors. [Full font notice](public/lap/BigShouldersDisplay-OFL.txt). |

Earcut and MSDFgen are offline build inputs; their implementations are not imported into the production application. The generated runtime assets are `glyphs.bin`, `glyphs.json` and `names-msdf.png`. Pinned tool versions and reproduction steps are documented in [the LAP asset build notes](scripts/lap-assets/README.md). The font's pinned upstream source, subset details and original OFL are recorded in [the creative font sources](public/fonts/creative/SOURCES.md).
