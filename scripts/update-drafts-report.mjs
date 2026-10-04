import { readdir, readFile, writeFile } from "node:fs/promises";

const order = [
  "hybrid",
  "studio",
  "desktop",
  "canvas",
  "index",
  "blueprint",
  "savefile",
  "zine",
  "issue",
  "wall",
  "riso",
  "dither",
  "swiss",
  "orbit",
  "primetime",
  "desk",
];
const folders = await readdir(new URL("../src/drafts/", import.meta.url), {
  withFileTypes: true,
});
const drafts = [];
for (const folder of folders.filter((entry) => entry.isDirectory())) {
  let source;
  try {
    source = await readFile(
      new URL(`../src/drafts/${folder.name}/meta.json`, import.meta.url),
      "utf8",
    );
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  const meta = JSON.parse(source);
  if (meta.scores) drafts.push(meta);
}
drafts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
const rows = drafts.map((d) => {
  const s = d.scores;
  const total = (
    s.design * 0.4 +
    s.usability * 0.3 +
    s.creativity * 0.2 +
    s.content * 0.1
  ).toFixed(2);
  return `| ${d.id} · [${d.title}](/drafts/${d.id}) | ${d.band} | ${d.antiPale} | ${s.design.toFixed(1)} | ${s.usability.toFixed(1)} | ${s.creativity.toFixed(1)} | ${s.content.toFixed(1)} | ${total} | ${d.rounds} | [Desktop](drafts-review/${d.id}-desktop.png) · [Mobile](drafts-review/${d.id}-mobile.png) | ${d.signature} | ${d.holdback} |`;
});
let verification = "";
try {
  const budget = JSON.parse(
    await readFile(
      new URL("../design/art-directions/draft-budgets.json", import.meta.url),
      "utf8",
    ),
  );
  verification = `## Loading and verification\n\nThe merged baseline (${budget.baselineCommit}) had an entry of **${budget.baseline.entry.toFixed(2)} kB gzip** and an initial JavaScript graph of **${budget.baseline.initialJS.toFixed(2)} kB gzip**. The completed gallery has an entry of **${budget.final.entry.toFixed(2)} kB** and an initial graph of **${budget.final.initialJS.toFixed(2)} kB**. An explicit group keeps already-eager React/router modules stable; no draft module enters the home loading path.\n\nEach row below includes the picker shell, the draft and all its lazy graphics dependencies, excluding only assets already in the initial graph. Public images and fonts are separate from this JavaScript chunk budget. Every direction is below 150 kB even with its scoped CSS included.\n\n| Draft | JavaScript gzip | CSS gzip | Combined |\n| --- | ---: | ---: | ---: |\n${budget.drafts.map((d) => `| ${d.id} | ${d.js.toFixed(2)} kB | ${d.css.toFixed(2)} kB | ${d.total.toFixed(2)} kB |`).join("\n")}\n\nBrowser checks cover the project indexes, selected-case navigation, keyboard paths, mobile focus/reveal behavior and the signature controls. WebGL and reduced-motion fallback captures accompany Studio, Blueprint, Index, Wall, Orbit and Desk. Desk was verified with an actual raycast click on its 3D phone and a tap on its image fallback. Riso invokes browser printing after decoding images and fonts; the native print layout was not captured or exported during this check.\n\nTypeScript, the production build and the craft detector pass. Gallery filters, all 16 routes, preview assets and noindex behavior are verified separately in the production preview. No deployment or push was performed.\n\n`;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const report = `# Live art-direction drafts

Built from ASTRA-DRAFTS-BRIEF.md. The live picker is at **/drafts**. The public home remains the hybrid. Draft routes are lazy-loaded and marked noindex, with no link in the public navigation.

## Review method

Each draft is captured at 1440 px and 375 px, then judged by a non-builder against the brief. Scores are Design 40%, Usability 30%, Creativity 20%, Content 10%. The energy check precedes scoring. The lowest material issue is repaired, up to three rounds. Scores below the requested bar are retained honestly at that limit; they are not approval claims.

Screenshots use the local review frame. Reduced-motion and no-WebGL paths are implemented; browser interactions and bundle sizes are checked separately. No physical-device frame-rate or Android benchmark is claimed.

## Reviewed drafts (${drafts.length}/16)

| Draft | Band | Energy | D | U | C | Content | Weighted | Rounds | Screenshots | Signature motion | Remaining holdback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## Hybrid repair history

The main merge is local commit 89c40c4. Section 6 now includes project-colour page floods, screenshot-filled active names, eager populated case-study surfaces with a GPU-ready crossfade, and a colour-sorted work wall with real-name posters for projects without public imagery. Hover reveals resolve from coarse dither to the decoded image.

Hybrid rounds: **7.86 → 8.01 → 7.95** weighted. The final round improved visible image texture but retained a local text-contrast weakness. The three-round limit was observed. The mobile name is larger and heavier; forced-colour and enhanced-contrast preferences receive solid text.

${verification}## Maintenance

Draft metadata and jury scores live beside each implementation in src/drafts/<id>/meta.json. Run node scripts/update-drafts-report.mjs after accepting a review. Picker thumbnails are downscaled captures of the corresponding desktop draft, with provenance metadata. All directions reuse the same project facts. Any invented product interface is labelled as a recreation.
`;
await writeFile(
  new URL("../design/art-directions/DRAFTS.md", import.meta.url),
  report,
);
console.log(`Updated ${drafts.length} reviewed drafts`);
