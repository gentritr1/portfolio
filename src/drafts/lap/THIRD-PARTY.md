# LAP provenance

All UI, track geometry, car geometry, scene shaders, React components and the asset bridge were authored for this portfolio. No uselayouts component source was copied.

- **OGL 1.0.11**, existing production dependency: https://github.com/oframe/ogl. Its existing package license applies.
- **Big Shoulders Display**, self-hosted font under SIL OFL: `public/fonts/creative/BigShouldersDisplay-OFL.txt`. Geometry and the MSDF atlas are generated from its actual outlines. No replacement font is distributed.
- **MSDFgen 1.12**, Viktor Chlumsky, MIT: https://github.com/Chlumsky/msdfgen/tree/v1.12. Used only by the offline asset build; notice at `public/lap/MSDFgen-LICENSE.txt`.
- **Earcut 3.0.2**, Mapbox, ISC: https://github.com/mapbox/earcut/tree/v3.0.2. Used only by the offline triangulation build; notice at `public/lap/Earcut-LICENSE.txt`.
- **SunCalc 1.9.0**, Vladimir Agafonkin, BSD-2-Clause: https://github.com/mourner/suncalc/blob/v1.9.0/suncalc.js. `solar.ts` adapts its solar position and solar-noon formulas only; notice at `public/lap/SunCalc-LICENSE.txt`.

Solar calculations use 42.6° N, 20.9° E. The clock label is formatted with `Europe/Belgrade` and says Kosovo. There is no inferred visitor location or invented live weather feed.
