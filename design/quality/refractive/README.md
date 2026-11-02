# Home page checks

Run them against a production build: `npm run build`, then `npx vite preview --port 4173`.

They need `playwright-core` and use the installed Google Chrome (`CHROMIUM_PATH` overrides the path). The repo does not
depend on Playwright, so install it once per checkout without saving it: `npm i --no-save playwright-core`.

| Check | Command | What it catches |
| --- | --- | --- |
| Census | `node design/quality/refractive/census.mjs http://localhost:4173/ --assert` | The type and spacing rules at 1440, 1024 and 390: at most five text sizes, no text under 16 px outside product screens, one selected-work headline size, sections on the 4-pt scale, repeated links and lines, the h1 as the largest text. |
| Overlap | `node design/quality/refractive/overlap.mjs http://localhost:4173/` | Text boxes of two placed blocks (`.re-sw-at`) in one selected-work chapter running into each other, 1024–1920. |
| Occlusion | `node design/quality/refractive/occlusion.mjs http://localhost:4173/` | Text in a placed block that something else paints over, such as another block's shading, which overlap cannot see. It hides each element in turn and fails when a word's brightness rises by 15 or more. 1024–1200 by 20, 1280, 1440. |
| Rules tap | `node design/quality/refractive/rules-tap.mjs http://localhost:4173/ [capture prefix]` | The Offday stack on a throttled phone (390 × 844, 1.6 Mbps): an empty plate after tapping Server rules, a button slower than 100 ms, an error caption when the screen is only slow (held back 10 s: "Loading…", then the screen), a missing error and retry when its request is aborted, and a cancelled wait that still switches. |

Each prints one line per width or case and exits 1 on a failure.
