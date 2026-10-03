# Brief for Astra: a gallery of live art-direction drafts

## 1. The goal

Do not pick one winner. Build **many live drafts** of the portfolio, each a different art direction, so the owner can open them, compare them, and keep any of them.

The drafts must cover the full range of mood:

| Band | What it means |
|---|---|
| **Professional** | A recruiter understands the work in 5 seconds, but the page is bold, not a template. |
| **Crafted** | Awwwards level: precise composition, rich motion, 3D where it earns its place. |
| **Fun** | Play, humour, game feel, a personality you remember. |
| **Experimental** | Breaks the portfolio convention. Risky on purpose. |

The owner's main complaint is that earlier versions were **"too pale, not energetic, not fun, not creative"**. The current hybrid (`362eafd`) is clean but still quiet. That is the floor to beat, not the target.

## 2. The anti-pale rule (every draft, every band)

A draft fails, whatever its jury score, if any of these is true:

- The first viewport is graphite or black, grey text and one small accent, with colour only inside screenshots.
- Nothing moves in the first 2 seconds without user input.
- The display type is smaller than about 10 % of the viewport height.
- It looks like a theme painted on another draft's layout. **Each draft has its own composition**, not only its own colours.

Every draft has at least one of these:

- a saturated colour field over at least 30 % of the first viewport;
- full-bleed work imagery;
- a large typographic or 3D moment.

It also has **one signature motion** that a visitor would describe to a friend.

Still banned (lessons from rounds 1–2):

- stickers, stamps, badges and fake HUDs as decoration;
- process captions such as "built with…" or "v2.0";
- screenshots dropped into plain boxes;
- more than one big idea on one page.

## 3. The draft list

Build them in this order: **one draft for each band first, then the second for each band, and so on.** The owner then sees the full range early.

| Id | Band | Start from | Next-level move |
|---|---|---|---|
| `hybrid` | Professional | current home (`362eafd`) | the five energy fixes in §6 |
| `index` | Professional | M · Index × Preview | name filled with its own screenshot (WebGL liquid shift), tilting preview, brand colour floods the page per project |
| `issue` | Professional | H · The Issue | magazine feature: huge serif, pull quotes from real facts, page-turn transitions |
| `swiss` | Professional | D · Swiss Kinetic | kinetic grid typography that re-sets itself on scroll |
| `studio` | Crafted | O · Studio Shot | real 3D device models, scroll-driven camera, backdrop colour per chapter |
| `blueprint` | Crafted | G · Blueprint | exploded devices with dimension lines that draw themselves |
| `wall` | Crafted | L · The Wall | WebGL wall, dither-to-colour reveal, velocity skew, FLIP re-sort |
| `orbit` | Crafted | E · Liquid Orbit | liquid / metaball 3D with the work orbiting in it |
| `desktop` | Fun | I · Desktop OS | a real OS: draggable windows, a dock, apps that are the projects |
| `savefile` | Fun | C · Save File | game UI: level select per project, a save screen, chiptune off by default |
| `riso` | Fun | K · Riso Poster | riso print layers, misregistration on hover, a printable poster per project |
| `primetime` | Fun | A · Prime Time | TV channel surfing with real transitions and a remote control |
| `canvas` | Experimental | N · Canvas | full pan, zoom and present; live recreations inside artboards |
| `zine` | Experimental | F · Acid Zine | controlled chaos: crossing marquees, collage, cut-out type |
| `dither` | Experimental | J · Dither Lab | 1-bit dithered world that resolves to full colour on the work |
| `desk` | Experimental | B · Studio Desk | a 3D desk scene; the objects open the projects |

After these 16, add **up to 4 new directions** from the references. Each one is its own idea, not a remix of the list above:

- **mek.gallery**: pixel and blackletter type, paper UI, a personal character;
- **basement.studio**: dither and 3D;
- **designeer.xyz**: dense rows, ⌘K, the dithered orb;
- **offgrid.inc**: a wall of work on black, but louder.

Sources:

- the boards are in `boards/` and their screenshots in `screens/`;
- the next-level notes are in `ASTRA-ART-DIRECTIONS.md` §4;
- the motion loops are in `boards/Z-MotionLab.dc.html`.

Use the boards as a starting point, not as a limit.

## 4. How the drafts live in the site

- `/drafts` is a picker page: one card for each draft, showing a live thumbnail or screenshot, its band, its scores, and an "Open" link. Filter by band.
- `/drafts/<id>` is the draft. Each draft is a lazy route in its own folder `src/drafts/<id>/` with its own scoped CSS and tokens. It may use its own self-hosted fonts.
- Each draft shows enough to judge it:
  - a first viewport;
  - the work index (all 28 projects, or a selection with "all");
  - one featured case view (rotate which case between drafts);
  - About and contact.

  It does not need all five case pages.
- All drafts read the same data: `src/content/projects.ts`, `CONTENT.md` facts, and the images in `public/`.
- The home page stays as it is (the hybrid) until the owner picks. Drafts are not in the main navigation and carry `noindex`.
- Budgets:
  - the main entry chunk does not grow;
  - each draft is a lazy chunk of 150 kB gzip or less, including its 3D;
  - each draft has a reduced-motion and a no-WebGL fallback;
  - each draft works at 375 px (it does not have to be perfect there).
- Never delete a draft. A weak draft stays, with its score and a note.

## 5. The loop for each draft

1. Build it.
2. Render it at 1440 px and at 375 px, and take screenshots.
3. Score it while you look at the screenshots, as strictly as a real jury: Design 40 %, Usability 30 %, Creativity 20 %, Content 10 %, each out of 10.
   - The **anti-pale rule** (§2) is a pass/fail line before the scores.
   - Use a fresh reviewer that did not build the draft.
4. Write down what holds back the lowest category. Fix it. Repeat.
5. Targets:
   - Design, Creativity and Content: 8 or more.
   - Usability: 8 or more for Professional and Crafted, 7.5 or more for Fun and Experimental.
6. Stop after 3 rounds on one draft even if it is below target. Record what holds it back and move on. The gallery is more important than one perfect draft.
7. Commit each draft on its own: `Add the <id> art-direction draft`.

Record every draft in `DRAFTS.md` in this folder, with one row for each draft:

- id, band, the anti-pale result, the four scores and the weighted total;
- the screenshot paths (`drafts-review/<id>-desktop.png`, `<id>-mobile.png`);
- one line on its signature motion;
- one line on what holds it back.

## 6. First task: the energy fixes to the hybrid

Before the new drafts, fix the hybrid. Do not change its layout.

1. When a project is selected on the index, its brand colour floods the page background with a soft cross-fade.
2. Bring back M's signature: the active project name is filled with its own screenshot, with a solid-ink fallback for contrast.
3. Wall: every text-only tile gets a full brand-colour or typographic poster treatment, so colour runs over the whole wall. The dither-to-colour hover must be clearly visible.
4. Case hero: render the static screenshot immediately, then fade in the 3D device when its texture is ready. There must never be a blank screen. Today `/work/bayyinah-tv` shows an empty device for 3–5 s.
5. Re-score with fresh eyes. Creativity must reach 8 on the screenshots, not on the feature list.

## 7. Setup and constraints

- Work on your branch `codex/control-room-handoff`. **First merge `origin/main`**: your branch started at `9a1a89b` and does not have the board files (`52619be`) or this brief.
- Do not push. The owner pushes, as `gentritr1` only.
- The constraints in `ASTRA-ART-DIRECTIONS.md` §6 still apply:
  - facts only from `CONTENT.md`;
  - public screenshots only;
  - the care platform stays a labelled recreation with invented data;
  - neutral voice;
  - contrast, 44 px targets, keyboard paths, sound off by default.
- Done means:
  - `/drafts` shows every draft;
  - every draft has its screenshots and a row in `DRAFTS.md`;
  - the hybrid has the §6 fixes;
  - the build passes.
