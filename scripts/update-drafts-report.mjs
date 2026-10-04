import { readdir, readFile, writeFile } from "node:fs/promises";

const order = [
  "diff",
  "fjalekryq",
  "linja",
  "bitrate",
  "aisle",
  "facing-pages",
  "ledger",
  "deal",
  "lap",
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
const oldDirections = new Set(order.slice(9));
const labMoves = [
  [
    "01-light",
    "Screen light",
    "A public screenshot supplies an 8 × 8 colour field for the surrounding surfaces.",
  ],
  [
    "02-css3d",
    "Live HTML in 3D",
    "The camera projects real, clickable HTML into the rendered environment.",
  ],
  [
    "03-board",
    "Flip discs",
    "6,912 two-sided discs form the selected bitmap through instanced drawing.",
  ],
  [
    "04-sound",
    "Mechanical sound",
    "Opt-in 20 ms noise grains use a band-pass filter and a 64-voice ceiling.",
  ],
  [
    "05-morse",
    "Morse clock",
    "A 60 ms dit, 180 ms dah and 420 ms letter gap drive a visual and optional audible key.",
  ],
  [
    "06-letters",
    "Falling letters",
    "Two Verlet substeps settle letters into fixed crossword cells.",
  ],
  [
    "07-msdf",
    "Distance-field names",
    "A generated RGB MSDF atlas reconstructs and interpolates project-name distance fields.",
  ],
  [
    "08-curl",
    "Page curl",
    "A 64-segment leaf bends around a cylinder with two local page textures.",
  ],
  [
    "09-quality",
    "Quality ladder",
    "Real image samples, colour steps and type size change with the quality setting.",
  ],
  [
    "10-transition",
    "Tile to case",
    "A native View Transition carries the project title between tile and case layouts.",
  ],
  [
    "11-seam",
    "CSS scroll seam",
    "A local CSS scroll timeline moves a migration seam without a JavaScript scroll listener.",
  ],
  [
    "12-width",
    "Variable width",
    "Pointer velocity drives the supplied font width axis through a spring.",
  ],
  [
    "13-fluid",
    "Colour between rows",
    "A 128² fluid field with 20 pressure iterations carries project colour inside row masks.",
  ],
  [
    "14-solar",
    "Kosovo daylight",
    "The visitor’s clock determines solar position at 42.6° N, 20.9° E; reduced motion uses calculated noon.",
  ],
  [
    "15-reel",
    "Hard-cut reel",
    "A frame changes every 2 seconds with a 120 ms additive colour bleed.",
  ],
  [
    "16-receipt",
    "Print the receipt",
    "Selected project facts form a semantic receipt with an 80 mm print layout and text download.",
  ],
  [
    "17-cursors",
    "Simulated collaborators",
    "Labelled local bots sample targets at 10 Hz and interpolate their displayed cursors.",
  ],
];
const motionCoverage = {
  diff: "Velocity-driven seam; case title/presence; reversible care file.",
  fjalekryq:
    "Letter falls, constrained pan/zoom, active-word highlight and case presence.",
  linja:
    "Disc springs, opt-in sound, timed Morse key, case title/presence and care file.",
  bitrate:
    "Quality buffer, sampled reel, predicted timeline settle and case title/presence.",
  aisle:
    "Scanner states, selected-work receipt, print/download feedback and care file.",
  "facing-pages":
    "Measured page reflow, reversible page curl, reading direction and accessible contents.",
  ledger:
    "One miniature scheduler, expanded-cell reflow, inline case presence and care file.",
  deal: "Velocity handoff and predicted card landing, reversible flip and case focus.",
  lap: "Spline racer and retargetable settle, extruded names, genuine MSDF, real solar position and cases.",
  hybrid:
    "Scoped press/CV feedback, theme state and preloaded case navigation.",
  studio:
    "Reversible work disclosures; retained scene playback and chapter controls.",
  desktop:
    "Window enter/exit and predicted drag settle; minimize remains a hidden state.",
  canvas:
    "Predicted camera settle, reading-mode transition and reversible disclosures.",
  index: "Named project-preview transition; retained liquid type and tilt.",
  blueprint:
    "Predicted 5% slider snap, disclosure entry/exit and playback feedback.",
  savefile:
    "Named local project/case transitions and existing save/sound states.",
  zine: "Disclosure entry/exit, motion pause state and offscreen handling.",
  issue:
    "Velocity-driven outline spring, scroll perspective and named feature changes.",
  wall: "Tile expansion and neighbour reflow, shared image, retained dialog exit and bounded velocity skew.",
  riso: "Named poster changes, ink registration and print confirmation.",
  dither:
    "Named selected-project changes, disclosures and existing reveal controls.",
  swiss:
    "Velocity-driven outline spring and scroll perspective around the existing type formation.",
  orbit: "Named selected-project changes, disclosures and scene pause state.",
  primetime: "Named channel-picture changes and existing channel/sound states.",
  desk: "Named case changes, disclosures and retained scene/CSS fallback.",
};
const root = new URL("../", import.meta.url);
const cell = (value) =>
  String(value ?? "—")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, " ");
const kb = (value) =>
  Number.isFinite(value) ? `${value.toFixed(2)} kB` : "Not measured";
async function optionalJson(path) {
  try {
    return JSON.parse(await readFile(new URL(path, root), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
function failedGate(meta) {
  return (
    /\bfail(?:ed)?\b/i.test(String(meta.creativeGates ?? "")) ||
    /^fail(?:ed)?\b/i.test(String(meta.m2 ?? "")) ||
    /^fail(?:ed)?\b/i.test(String(meta.antiPale ?? "")) ||
    meta.slopCount > 2
  );
}
const folders = await readdir(new URL("src/drafts/", root), {
  withFileTypes: true,
});
const metadata = [];
for (const folder of folders.filter((entry) => entry.isDirectory())) {
  const meta = await optionalJson(`src/drafts/${folder.name}/meta.json`);
  if (meta) metadata.push(meta);
}
const drafts = metadata.filter((meta) => meta.scores);
drafts.sort(
  (a, b) =>
    (order.indexOf(a.id) < 0 ? Infinity : order.indexOf(a.id)) -
    (order.indexOf(b.id) < 0 ? Infinity : order.indexOf(b.id)),
);
const rows = drafts.map((d) => {
  const s = d.scores;
  const total = (
    s.design * 0.4 +
    s.usability * 0.3 +
    s.creativity * 0.2 +
    s.content * 0.1
  ).toFixed(2);
  return `| [${cell(d.title)}](/drafts/${d.id}) | ${cell(d.band)} | ${cell(d.rule)} | ${cell((d.mechanisms ?? []).join(", ") || "None earned")} | ${d.slopCount ?? "—"} | ${cell(d.creativeGates ?? "Awaiting creative review")} | ${s.design.toFixed(1)} | ${s.usability.toFixed(1)} | ${s.creativity.toFixed(1)} | ${s.content.toFixed(1)} | ${total}${failedGate(d) ? " diagnostic" : ""} | ${d.rounds ?? "—"} | [1440](drafts-review/${d.id}-desktop.png) · [375](drafts-review/${d.id}-mobile.png) | ${cell(d.holdback)} |`;
});
const [budget, oldRuntime, newRuntime] = await Promise.all([
  optionalJson("design/art-directions/draft-budgets.json"),
  optionalJson("design/art-directions/motion-old-drafts-runtime.json"),
  optionalJson("design/art-directions/motion-new-drafts-checks.json"),
]);
let verification = "";
if (budget) {
  verification = `## Measured loading budget\n\nBaseline ${cell(budget.baselineCommit)}: entry **${kb(budget.baseline.entry)} gzip**, initial JS graph **${kb(budget.baseline.initialJS)}**. Current measurement: entry **${kb(budget.final.entry)}**, initial graph **${kb(budget.final.initialJS)}**. Measured **${cell(budget.measuredAt)}**; see [the complete budget record](draft-budgets.json). Each draft row includes the lazy picker shell and recursive graphics imports, excluding already-loaded initial modules. Public images, self-hosted fonts, binary geometry, MSDF atlases and other public assets are separate transfers; these JS/CSS numbers are not a full network payload.\n\n| Draft | JS gzip | CSS gzip | Combined gzip |\n| --- | ---: | ---: | ---: |\n${budget.drafts.map((d) => `| ${cell(d.id)} | ${kb(d.js)} | ${kb(d.css)} | ${kb(d.total)} |`).join("\n")}\n\n`;
}
const measuredMoves = new Map(
  (budget?.labMoves ?? []).map((move) => [move.id, move]),
);
const labRows = labMoves.map(([id, title, description]) => {
  const size = measuredMoves.get(id);
  return `| [${title}](/drafts/lab#move-${id.slice(0, 2)}) | [${id}.tsx](../../src/drafts/lab/moves/${id}.tsx) | ${description} | ${kb(size?.js)} | ${kb(size?.css)} | ${kb(size?.total)} |`;
});
const union = budget?.labUnion;
const labSection = `## Motion lab — 17 working studies\n\nOpen [the motion lab](/drafts/lab) or [the local development lab](http://127.0.0.1:5173/drafts/lab). Each tile is loaded when visible and released when offscreen, paused or hidden. The shell exposes reduced motion without removing the controls. See [all 17 source and runtime checks](motion-lab-source-checks.md).\n\nCosts below come only from \`labMoves\` in [the measured budget](draft-budgets.json). They count production JavaScript and CSS after the initial graph, picker and lab shell have loaded. A dependency shared by several tiles is included once in each tile’s individual graph. The deduplicated union across all measured tiles is **${kb(union?.js)} JS + ${kb(union?.css)} CSS = ${kb(union?.total)} gzip**. Do not add the individual rows to estimate that union. Missing measurements remain labelled; no planning allowances are substituted.\n\nFonts, screenshots, images, MSDF PNGs, binary meshes and other public assets remain separate transfers. The font and asset provenance is recorded in [font sources](../../public/fonts/creative/SOURCES.md) and [LAP asset notes](../../src/drafts/lap/THIRD-PARTY.md).\n\n| Study | Source filename | Implementation | JS gzip | CSS gzip | Combined gzip |\n| --- | --- | --- | ---: | ---: | ---: |\n${labRows.join("\n")}\n\n`;
const coverageRows = order.map((id) => {
  const old = oldDirections.has(id);
  const recorded = old
    ? oldRuntime?.checks?.some((check) => check.id === id)
    : Boolean(newRuntime?.[id]);
  const log = old
    ? "motion-old-drafts-runtime.json"
    : "motion-new-drafts-checks.json";
  const label = metadata.find((meta) => meta.id === id)?.title ?? id;
  return `| [${cell(label)}](/drafts/${id}) | [Source](../../src/drafts/${id}/Draft.tsx): ${motionCoverage[id]} | [${recorded ? "Recorded checks; see their stated scope" : "Runtime entry pending"}](${log}) |`;
});
const motionSection = `## Motion coverage — all 25 directions\n\nThe [motion brief](ASTRA-MOTION-CRAFT.md), [old-draft source audit](motion-old-drafts-audit.md), [old-draft runtime record](motion-old-drafts-runtime.json) and [new-draft motion record](motion-new-drafts-checks.json) separate implemented behavior from observed checks. A recorded check covers only its named state and viewport. It does not establish every interruption, fallback or device.\n\n| Direction | Source coverage | Runtime record |\n| --- | --- | --- |\n${coverageRows.join("\n")}\n\nOld text-only project links use the native route crossfade after preload. An actual shared-image View Transition requires a visible source image and a corresponding case hero; not every old row has a shared image or a Motion layout identity. Desktop minimize/restore keeps the window through its native hidden state; close/open has presence motion, but minimizing does not have an exit animation.\n\nThe development-only review mode at \`?review=1&speed=0.1\` provides equivalent 10% playback for timers, requestAnimationFrame and native animations. The in-app browser does not expose the DevTools Animations panel: this is slow playback and interruption inspection, not literal DevTools timeline scrubbing. No physical mid-range-phone 60 fps result is claimed.\n\n`;
const lap = metadata.find((meta) => meta.id === "lap");
const ledger = metadata.find((meta) => meta.id === "ledger");
let gateNotes = "";
if (lap && failedGate(lap)) {
  gateNotes += `**Optional LAP remains a gate failure.** ${cell(lap.creativeGates ?? lap.m2)}. Its numbers, if present, are diagnostic and do not approve the concept. ${cell(lap.holdback)}\n\n`;
}
if (
  ledger &&
  /density/i.test(
    `${ledger.antiPale ?? ""} ${ledger.creativeGates ?? ""} ${ledger.holdback ?? ""}`,
  )
) {
  gateNotes += `**LEDGER uses the later density exception.** Its metadata records “${cell(ledger.antiPale ?? ledger.creativeGates)}”. This does not turn the older literal colour-area and large-type tests into passes.\n\n`;
}
const report = `# Live art-direction drafts

The live picker is **/drafts**. The creative round follows [ASTRA-CREATIVE-BRIEF.md](ASTRA-CREATIVE-BRIEF.md) and [CREATIVE-CONSULT.md](CREATIVE-CONSULT.md). The public home remains the hybrid. Drafts are lazy-loaded and noindex.

## Review method

Fresh non-builders judge actual 1440 px and 375 px captures. Creativity uses M1–M11: 7 is a good personal site, 8 is distinctive, 9 is Site of the Day. Mechanisms are earned by visible evidence, with source used only to confirm a technique. Still images do not prove sound, physical weight, pacing or performance. Those require separate interaction checks.

The 16 previous directions retain their Design, Usability and Content scores for historical comparison; their Creativity scores have been replaced. Failed slop or metaphor gates remain explicit. A numerical score on a failed draft is diagnostic, not an approval. Old costumes receive no new repair rounds. Their proposed rule describes the current implementation, not a claim that the new law is satisfied. Full itemized reviews and the second-pass separation rationale are in [review A](creative-review-a.json), [review B](creative-review-b.json) and [the first-five calibration](creative-first-five-calibration.json).

For new drafts, the anti-pale, slop ≤2 and M2 gates precede scoring. The new no-giant-name rule takes precedence over the previous name-size requirement. Maximum three rounds per new draft. Weights remain Design 40%, Usability 30%, Creativity 20%, Content 10%.

${gateNotes}## Reviewed directions (${drafts.length})

| Draft | Band | Rule | Mechanisms | Slop | Gates | D | U | C | Content | Weighted | Rounds | Captures | Remaining holdback |
| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
${rows.join("\n")}

## Part A repairs

The initial creative repair baseline was merged locally at 889e02f. Hybrid's active project names use solid ink; the screenshot-fill effect was removed. Wall's pictured tiles have embedded image previews at first render, independent of full-resolution image loading. Poster names use natural word wrapping and fitted type. These repairs address legibility and loading; they do not turn the old compositions into new concepts.

${verification}${labSection}${motionSection}## Verification and limits

Compiler, production-build, source-test and browser evidence are recorded with their scope. The lab source record distinguishes numerical matrix checks and mocked rendering-pipeline checks from actual browser observations. Neither kind of source check proves rendered GPU output, print output, sound quality or physical-device speed. Saved sound preferences do not authorize constructing a lab AudioContext before a new human opt-in. Reduced-motion and graphics fallbacks preserve the meaningful states. Care data is labelled as an invented recreation; local cursor bots are labelled as simulated.

The [final detector review](detector-final-review.md) records **155 primary findings and 1,303 advisories**, with exit 2; this is not a clean detector result. The final run reported no overshoot warning. Earlier runs flagged the exact \`cubic-bezier(.34,1.35,.64,1)\` value required by [the motion brief](ASTRA-MOTION-CRAFT.md). The home page's strict font system also differs from the separately requested draft typefaces in [the creative consult](CREATIVE-CONSULT.md). The review explains these brief requirements and the remaining findings without suppressing them. Static warnings do not establish visual or interaction quality.

## Maintenance

Metadata lives in src/drafts/<id>/meta.json, with rule first. Run node scripts/update-drafts-report.mjs after review and the production budget measurement. The generator reads measured values; it neither changes budgets nor invents missing measurements. Thumbnails derive from corresponding desktop captures. Every direction uses the same confirmed project facts. No push or deployment is part of this work.
`;
await writeFile(new URL("design/art-directions/DRAFTS.md", root), report);
console.log(
  `Updated ${drafts.length} reviewed drafts; ${measuredMoves.size}/17 lab measurements`,
);
