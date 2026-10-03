# Brief for art-direction artboards

You design ONE or TWO full-page art-direction comps for Gentrit Rashiti's developer portfolio, as `.dc.html` artboards on a Claude Design canvas. Write ONLY your own files into `/private/tmp/claude-502/-Users-gentlegen-Desktop-vianova-dashboard-react/1d3f5688-366a-4db4-8ba2-015fa431f712/scratchpad/ad-canvas/project/`. Do NOT publish, do NOT edit `canvas.json` or other boards. Do not open a browser or render: the owner looks at the canvas.

## Who and what (facts only; never invent numbers)
- Gentrit Rashiti — frontend & mobile developer, now full stack. 5+ years. Kosovo, remote. Placeholders you MUST use as-is: `[Seniority]`, `[your.email@example.com]`. Links shown as text: LinkedIn, GitHub, Download CV, Email.
- Stack line: React · React Native · Vue/Nuxt · Next.js · TypeScript · Laravel.
- Featured projects (real, public):
  - **Bayyinah TV** (streaming, 2023–26): video-learning platform rebuilt on Nuxt 3; live streams with realtime chat, HLS player, Stripe/Apple/Google subscriptions, English/Arabic RTL; 34 routes; **100K+ downloads on Google Play**. Also built the institute site bayyinah.org (Next.js, 2024–25).
  - **Care-management platform** (healthcare, 2023–26, Vianova): remote patient monitoring for many clinics; Vue → React route by route with parity tests; **31 architecture decision records**; Laravel API; a billing report **16 queries → 2**; 4 languages. Internal screens may ONLY appear as invented recreations (e.g. "Patient 4821", a blood-pressure line with 2 alert dots).
  - **Read to Feed** (mobile, 2022–25): children's reading app, PDF/EPUB reader, ISBN barcode scanning, badges/streaks, **about 14 store releases**, **React Native 0.63 → 0.81**, 3 languages.
  - **Viva Fresh** (mobile, 2023): grocery & loyalty app, delivery slots, wishlist, purchase history, map address search, iOS + Android.
  - **Incentiv** (Web3, 2024): smart-wallet dashboard on Next.js 14, passkey sign-in, balances, QR receive (wallet value shown as invented "12,480.00 INC").
  - Others for an index: Dukagjini Bookstore (mobile, 2021–22), AI business dashboard (AvahiTech, freelance), Geo Guesser World 3D (Google Play, 2026), FJALË word game (live), Za! card game, Morse Trainer, Snaxx Tech studio site, Offday time-off app. Total: 28 projects across 6 channels (Healthcare, Streaming, Mobile apps, Web3, Web apps & AI, Games & personal).

## Real screenshots (uploaded; use these URLs VERBATIM in `<img src>`)
- Bayyinah TV store frames (phone, tall): `/_blob/e4db1c62e8865c5bf469ad292fa3ad36`, `/_blob/efd3efb4559b375e93df948c6424122c`
- Bayyinah TV website (16:10): `/_blob/b5de8b603eb9fc1eb6243512da056cfb`
- Viva Fresh store frames (phone): `/_blob/47ba7ca5a8b75d1adb0707716e2e02c7`, `/_blob/0aa911fe9541dfae5df4cfaeb1cd6503`
- Read to Feed store frames (phone): `/_blob/461e33a21e9453a672979083bb704ea9`, `/_blob/5a5111f71e28ccea7450e215ad9e5751`
- Dukagjini Bookstore store frame (phone): `/_blob/a5a912f0767e7c0ff1c578911e914398`
- FJALË desktop (16:10): `/_blob/e72b0dde4d866b2d7a3bf592d48f25a8`
- Snaxx studio site desktop (16:10): `/_blob/a883265a486c88d8b055ec37ce097d36`
Every `<img>` needs a real `alt`.

## What each comp must show (a home page at 1440 wide, ~2200 tall)
1. Header with name/monogram, nav, **Email** and **Download CV** visible.
2. Hero: name, role, a 5-second recruiter line ([Seniority] · 5+ yrs · stack · "Open to remote roles"), and the direction's signature visual.
3. Featured work: at least 3 of the 5 featured projects with real screenshots or an invented recreation (care platform), each with 1–2 proof numbers above.
4. A compact "all projects" index (5–7 rows, data via `<sc-for>`), filter chips.
5. A footer CTA with the email placeholder, LinkedIn, GitHub.
6. **Motion and 3D shown LIVE with CSS**: put `@keyframes` in the `<helmet><style>` and apply them with `animation:` in inline styles or small classes in helmet. Show the direction's signature motion (e.g. a 3D CSS `perspective` + `rotateY` orbit, a marquee, a slow float, a type cylinder, a flip, a tilt). Always add `@media (prefers-reduced-motion: reduce){ *{animation:none!important} }`. Animate transform/opacity only. Keep loops slow and calm (8–30 s) except short accents.

Energy matters: the owner says the current site is "too pale, not energetic, not fun and creative". Each direction must have a clear colour system, a strong type voice and a signature idea — but stay readable for recruiters (body ≥ 16 px, contrast ≥ 4.5:1, no lorem, no invented stats).

## The .dc.html format (follow exactly; failures are silent)
Skeleton:
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>D · Name</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=...&amp;display=swap" rel="stylesheet">
<style>
body{margin:0;background:#...}
a{color:#...}a:hover{color:#...}
@keyframes spin{to{transform:rotateY(360deg)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
</helmet>
<div style="...root, fluid: max-width containers, no fixed px width on root...">
  ...
  <sc-for list="{{rows}}" as="r" hint-placeholder-count="5"><div>{{r.name}}</div></sc-for>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":2200}}'>
class Component extends DCLogic {
  renderVals() { return { rows: [ { name: 'Bayyinah TV' } ] }; }
}
</script>
</body>
</html>
```
Rules: keep the `support.js` head line exactly; close every non-void element and quote every attribute; `&` in URLs inside attributes as `&amp;`; `{{hole}}` is a dotted lookup only (no expressions); only Google Fonts `css2` links as network (no Fontshare); no `<iframe>`, no `innerHTML`, no emoji icons (inline SVG or text glyphs like ▶ ✦ ★ → are fine), no global keydown handlers; real `<a href="#">` / `<button>` elements; lay out with flex/grid + gap; the root is fluid (use `max-width: 1440px; margin: 0 auto` containers; flex-wrap so it does not break narrower). Avoid AI tropes: no Inter/Roboto/Arial, no purple-gradient washes, no left-border accent cards. A gradient is fine only as an object (an orb, a sticker), not as a page wash.

## Already on the canvas (do NOT repeat)
A · Prime Time (broadcast colour blocks, ticker, condensed Archivo), B · Studio Desk (paper, taped polaroids, stickers, Instrument Serif italic, receipt index), C · Save File (pixel arcade, world map, achievements, Pixelify Sans).

## References to draw from (inspiration, not copies)
offgrid.inc (work-first dense image wall on black), mek.gallery (pixel/blackletter, retro game art, cream UI), designeer.xyz (dark, iridescent dithered orb, ⌘K, dense favicon rows), brittanychiang.com (clear index), dennissnellenberg.com (cursor-following previews, magnetic buttons), rauno.me (looping craft tiles), bruno-simon.com (3D world, achievements), henryheffernan.com (OS desktop metaphor), lynnandtonic.com (playful resize), Swiss International Style posters, Apple liquid glass, technical blueprints, print magazines/zines, neo-brutalism.
