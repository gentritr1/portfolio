# LAP handoff

Source stable for root browser review. No router, report generator, budget JSON, shared motion implementation, package dependency, commit or push was changed by this agent.

## What is real

- OGL camera and hover racer follow an arc-length-resampled closed Catmull–Rom circuit. Project text barriers are actual front/back/side glyph meshes, triangulated offline from Big Shoulders Display. The first sector is BAYYINAH TV.
- Wheel impulses and touch movement pass measured input velocity into a 350/35 spring; release coasts toward its target. Steering has a separate bounded lane spring. Driving mode captures wheel/touch only after explicit activation, and Escape restores ordinary page scrolling. The 30 sector links always remain available.
- `getKosovoSun(date, staticNoon)` computes solar azimuth/altitude at Kosovo coordinates from the actual instant. `kosovoClock` formats Europe/Belgrade. Reduced motion uses the calculated solar noon for that date and renders a static scene. Nighttime truthfully has the sun below the horizon, so a bright sunset disc is not guaranteed at every visitor time.
- `createNameMorph(host, names, reduced)` uses the 29.6 kB genuine RGB glyph MSDF atlas. It composes name distance fields, interpolates distances and thresholds them. Interrupted transitions capture the displayed field before retargeting. No blur masquerades as MSDF.
- Cases retain enter/exit presence, share the sector title, restore focus and expose the full factual content. The care case includes a reversible confidential file with a real product screen on invented data, labelled as such. CV has pressed and requested states.
- Scene and name renderer pause their loops offscreen and when the document is hidden. The scene caps DPR at 1.5. `?nogl=1` exercises the CSS/static and text-crossfade path, leaving all sector cases accessible.

## Reuse interfaces for the lab

- `solar.ts`: `getKosovoSun`, `kosovoSolarNoon`, `kosovoClock`, and `solarSkyFragment`. The shader expects `sunDirection`, `heading` and `aspect` uniforms.
- `msdf.ts`: `createNameMorph(host, names, reduced)` returning `set(index, instant?)` and `dispose()`, plus the distance-interpolation fragment source. Supply names whose glyphs are in the built atlas; the 30 exported sector names are the intended set.

## Verification performed

- TypeScript build check and targeted Oxlint passed before browser handoff.
- Glyph face/hole area, index bounds and genuine RGB atlas-channel checks passed.
- Solar vectors have unit length; the calculated solar noon is higher than positions one hour before/after. Example: 4 October 2026 solar noon is 10:26:25 UTC, altitude approximately 43.14°.
- Circuit endpoints coincide and sampled tangents have unit length.
- Impeccable detector findings were scoped font/palette/type-size differences from the shared home DESIGN.md. Those differences follow LAP's explicit Big Shoulders/Martian/dusk direction. The exact overshoot token remains as required by the motion brief.

## Root checks still required

- `/drafts/lap`: desktop 1440×812 and phone 375×812 first view. Confirm the extruded BAYYINAH TV barrier is readable, the racer is visible, the MSDF label reconstructs correctly, and no phone overflow occurs.
- `.lp-drive-toggle`, then focus `.lp-scene`: wheel/Arrow Up accelerates, Left/Right steer, Space brakes, Escape restores page scrolling. Reverse an input during the settle. Pointer controls have the equivalent path.
- Previous/next sector and rapid nonadjacent `.lp-sector-link` selection: inspect the name interpolation and its interruption at `?review=1&speed=0.1`. Confirm the field transition does not become a simple alpha crossfade on the WebGL path.
- `.lp-sector-link`, `.lp-case`, `.lp-care-file`: open/close/reverse, keyboard focus restoration and reduced motion. The visible file shows a real product screen with invented data, labelled as such.
- Change reduced-motion preference while selected on a non-first sector; selection must survive and the scene must become static solar noon.
- `?nogl=1`: inspect static fallback, name crossfade and all 30 cases. Pause the scene, leave the viewport, switch tab visibility; check `.lp-scene[data-paused]` and that updates stop.
- Read-only graph measurement after the combined production build. 60fps on a physical mid-range phone remains unverified; a desktop browser's refresh-rate sample is not a substitute.

## Honest limits

The spline follower is an authored kinematic racer with bounded steering, not a physics engine or a remake of Futurisma. No live weather service is implied. Text meshes have flat extruded side faces rather than a bevel. The static CSS fallback is deliberately distinguishable from WebGL geometry. Neither final visual quality nor device performance has been certified by the source checks.
