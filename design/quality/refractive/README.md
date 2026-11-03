# Home page checks

Run them against a production build: `npm run build`, then `npx vite preview --port 4173`.

They need `playwright-core` and use the installed Google Chrome (`CHROMIUM_PATH` overrides the path). The repo does not
depend on Playwright, so install it once per checkout without saving it: `npm i --no-save playwright-core`.

| Check | Command | What it catches |
| --- | --- | --- |
| Census | `node design/quality/refractive/census.mjs http://localhost:4173/ --assert` | The type and spacing rules at 1440, 1024 and 390: at most five text sizes, no text under 16 px outside product screens, one selected-work headline size, sections on the 4-pt scale, repeated links and lines, the h1 as the largest text. |
| Overlap | `node design/quality/refractive/overlap.mjs http://localhost:4173/` | Text boxes of two placed blocks (`.re-sw-at`) in one selected-work chapter running into each other, 1024–1920. |
| Occlusion | `node design/quality/refractive/occlusion.mjs http://localhost:4173/` | Text in a placed block that something else paints over, such as another block's shading, which overlap cannot see. It hides each element in turn and fails when a word's brightness rises by 15 or more. 1024–1200 by 20, 1280, 1440. |
| Focus hero | `BASE=http://localhost:4173/ node design/quality/refractive/cap.mjs <out> design/quality/refractive/focus-hero.json` (needs the sandbox off for headless Chrome) | The hero's focus pull: the first screen settles sharp without the sweep finishing, it turns once on its own, a click sweeps in 700 ms with no delay and stops the turn, a key press swaps at once with nothing animating, reduced motion neither sweeps nor turns, no WebGL still sharp, no sideways scroll and 44 px targets on a phone, the evidence rows and the hero's lines in place, and a keyboard Tab trail. |

Each prints one line per width or case and exits 1 on a failure.
