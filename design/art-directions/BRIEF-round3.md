# Round 3 brief: composition first, craft over decoration

Read `BRIEF.md` in this folder for the facts, the screenshot URLs and the `.dc.html` format rules. This file REPLACES its design guidance.

## Why round 1 and 2 failed (owner verdict)
"Too artificial, not well composed, not enough creativity, nothing great." Diagnosis:
- Every board used the same skeleton (header → hero → 3 featured cards → index → footer) with a theme painted on. Skins, not designs.
- Decoration instead of composition: stickers, badges, stamps, fake HUDs, achievement chips, meta captions ("this card flips every 8 s"), boxes around everything.
- Screenshots dropped into rectangles instead of art-directed (scale, crop, rhythm, overlap with intent).
- Too many ideas per page, weak hierarchy, inconsistent spacing.

## Rules for round 3
1. **Start from ONE composition idea**, taken from a reference, and let it decide the whole page. The theme follows the layout, never the reverse. If your page could be re-skinned into another direction by changing colours, you failed.
2. **Restraint.** Max 2 typefaces (one may be a mono for small labels). One accent colour at most, or none. No stickers, stamps, badges, fake OS chrome, HUDs, emoji-like glyphs, or any element that only decorates. Every element must carry content or navigation.
3. **The work is the image.** Use the real screenshots large, cropped with intent, at real device proportions, in a rhythm (sizes that relate: 1 : 1.5 : 2). Let them breathe or let them pack tightly, but deliberately.
4. **Typography does the identity.** A precise type scale (e.g. 12 / 14 / 16 / 20 / 28 / 44 / 72 / 120), tight leading on display, real optical sizes, generous tracking only on small caps labels. Body ≥ 16 px.
5. **Grid and spacing.** An 8 px spacing system, a visible 12-column logic, consistent gutters, aligned edges. Whitespace is a feature.
6. **Recruiter clarity in the first viewport**: name, role, `[Seniority]`, 5+ yrs, core stack, "Open to remote roles", Email + CV. Quietly, not as a chip wall.
7. **Motion and 3D only where it says something** (CSS keyframes in helmet, transform/opacity, slow, with holds; reduced-motion override). One signature motion per page, not five.
8. **No process talk** in the copy (no "invented data" except one small caption on the care recreation, no "scan line sweeps…"). Neutral voice for project copy (no "I built"), facts only from BRIEF.md.

## Calibrated jury (score yourself this strictly)
Awwwards weights: Design 40%, Usability 30%, Creativity 20%, Content 10%, each /10.
- 5–6: a competent template with a theme. 7: a good personal site, clear but familiar. 8: distinctive, crafted, a juror would bookmark it. 9+: Site-of-the-Day material.
- Deduct for: any overlap that hides text, any clipped element, any decorative element without content, more than one signature idea, inconsistent gutters, low contrast, generic layout.
You must reach ≥ 7.5 in EVERY category by this calibration. Render, look, score, write what holds back the lowest category, fix, render again. Stop when all ≥ 7.5 or after 3 rounds, and report the honest final scores.

## Render and look
`cd /private/tmp/claude-502/-Users-gentlegen-Desktop-vianova-dashboard-react/1d3f5688-366a-4db4-8ba2-015fa431f712/scratchpad/ad-canvas && ~/.nvm/versions/node/v24.19.0/bin/node render.mjs <File.dc.html>` writes `render/<name>.png` (full page at the file's `$preview` size; set it to your real page height) and `render/<name>-top.png` (1440×900). View both with Read every round.

## Skills to read before designing
- `~/.claude/skills/design-taste-frontend/SKILL.md` (brief inference, dials, anti-default, pre-flight)
- `~/.claude/skills/minimalist-ui/SKILL.md` and `~/.claude/skills/high-end-visual-design/SKILL.md`
- `~/.claude/skills/emil-design-eng/SKILL.md` (motion and detail)
- `/Users/gentlegen/Desktop/gentrit-portfolio/.claude/skills/impeccable/reference/craft-floor.md` (quality floor and bans)
- Fonts/palette: you may run `python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain typography` once for a pairing.
