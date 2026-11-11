# Home page checks

Run them against a production build: `npm run build`, then `npx vite preview --port 4173`.

They need `playwright-core` and use the installed Google Chrome (`CHROMIUM_PATH` overrides the path). The repo does not
depend on Playwright, so install it once per checkout without saving it: `npm i --no-save playwright-core`.

Without installing it (a checkout whose `node_modules` is shared, or a worktree): link a scratch directory to an install
that has it, link the scripts into it, and run them with `--preserve-symlinks-main` so `import 'playwright-core'` resolves
from the scratch directory. `motion.mjs` reads `PLAYWRIGHT_MODULE` instead. Headless Chrome needs the sandbox off.

```bash
PW=/path/to/a/node_modules   # any install with playwright-core in it
mkdir -p /tmp/rq && cd /tmp/rq && ln -sf "$PW" node_modules
for f in census overlap occlusion rhythm swap-crops; do ln -sf "$OLDPWD/design/quality/refractive/$f.mjs" .; done
node --preserve-symlinks-main census.mjs http://localhost:4173/ --assert
node --preserve-symlinks-main rhythm.mjs http://localhost:4173/ --assert        # and again with ?cut=1
node --preserve-symlinks-main swap-crops.mjs http://localhost:4173/
cd - && PLAYWRIGHT_MODULE="$PW/playwright-core" node design/quality/refractive/motion.mjs http://localhost:4173/
```

| Check | Command | What it catches |
| --- | --- | --- |
| Census | `node design/quality/refractive/census.mjs http://localhost:4173/ --assert` | The type and spacing rules at 1440, 1024 and 390: at most five text sizes, no text under 16 px outside product screens, one selected-work headline size, sections on the 4-pt scale, repeated links and lines, the h1 as the largest text. |
| Overlap | `node design/quality/refractive/overlap.mjs http://localhost:4173/` | Text boxes of two placed blocks (`.re-sw-at`) in one selected-work chapter running into each other, 1024–1920. |
| Occlusion | `node design/quality/refractive/occlusion.mjs http://localhost:4173/` | Text in a placed block that something else paints over, such as another block's shading, which overlap cannot see. It hides each element in turn and fails when a word's brightness rises by 15 or more. 1024–1200 by 20, 1280, 1440. |
| Focus hero | `BASE=http://localhost:4173/ node design/quality/refractive/cap.mjs <out> design/quality/refractive/focus-hero.json` (needs the sandbox off for headless Chrome) | The hero's focus pull: on load the pull starts when the image decodes, with no delay, is the one `data-motion="story"` animation (600 ms) and is sharp within 800 ms of decode; it still settles with animations paused; it turns once on its own; a click pulls in 450 ms with no delay, stops the turn and is replaced by a second click; a key press swaps at once with nothing animating; reduced motion neither sweeps nor turns; no WebGL still sharp; `?pull=rest` starts sharp, `?seam=1` shows the leading line only while pulling, `?hero=split` puts the links on the screen's bottom edge. Layout: the screen is 28%+ of 1440 × 900, the left column ends within 16 px of the tab row at 1280, 1440 and 1920, two rows under the screen and the tabs above the fold from 1024 × 768 to 1920 × 1080; each crop's displayed scale and 2× density; the Read to Feed figure: its left and right edges are the figure's ground, the image's own corners are not the store banner blue, the image is flush top and bottom, and from 521 px up it fills the figure edge to edge (the three-screen strip); on a phone the order headline, screen, tabs, words, the screen by y = 400, 44 px targets, the pause on a tab track, each tab's top line nearer its own label than half the gap to the label above, evidence arrows on their last word, no sideways scroll at 390 and 320; and a keyboard Tab trail. |
| Rhythm | `node design/quality/refractive/rhythm.mjs http://localhost:4173/ --assert` (also with `?cut=1`) | Below the hero, at 1440, 1024 and 390: the gaps between selected-work chapters and between sections each one value within 8 px of the spacing scale; the thumbnails' size, 44 px hit area, 3:1 edge and the current one's accent edge, with the caption on one line under the row; the process steps as a 2 × 2 grid at 390. On the whole home, hero included, at 1440: exactly two text-link treatments and one button treatment, accent only on what can be pressed (and the ledger's "after" values), one focus ring (2 px accent, 4 px offset), a 150 ms hover change, press to 0.97, 44 px targets, the hero's tabs as their own kind (one accent top line), and icon-only buttons without a fill except the one named media control (the hero's play/pause, checked with motion on). |
| Swap crops | `node design/quality/refractive/swap-crops.mjs http://localhost:4173/` | In the swapping slabs (Bayyinah TV, Read to Feed), every screen picked by a real click shows the app, not the store listing's banner colour around it (top 8% of the rendered screen, 1440, 770 and 390), and the slab does not move or resize between screens. |
| Motion | `PLAYWRIGHT_MODULE=… node design/quality/refractive/motion.mjs http://localhost:4173/ [--only startup,open,reveal]` (sandbox off) | Phone hitches as long animation frames (50 ms or more). Start-up at 390 × 844, 4x CPU: no long frame from the dot field between the scene's start and 500 ms after it is ready. Case open from the hero and from a chapter, at 390 4x and 1440: no long frame carrying more than 30 ms of script or 10 ms of forced style and layout (4x), none with script at all (1x); frames with no script are printed, not failed; focus lands on the case heading. Reveal, all ten case pages at 1440 and 390: no screen in view (sideways rows included) still in its loading dot field 1.5 s after it came into view, and no heading level skipped. Prints frame and sample counts. |

Each prints one line per width or case and exits 1 on a failure.
