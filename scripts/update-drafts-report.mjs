import { readdir, readFile, writeFile } from 'node:fs/promises';

const order = ['diff', 'fjalekryq', 'linja', 'bitrate', 'aisle', 'facing-pages', 'ledger', 'deal', 'lap', 'hybrid', 'studio', 'desktop', 'canvas', 'index', 'blueprint', 'savefile', 'zine', 'issue', 'wall', 'riso', 'dither', 'swiss', 'orbit', 'primetime', 'desk'];
const root = new URL('../', import.meta.url);
const folders = await readdir(new URL('src/drafts/', root), { withFileTypes: true });
const drafts = [];
for (const folder of folders.filter(entry => entry.isDirectory())) {
  try {
    const meta = JSON.parse(await readFile(new URL(`src/drafts/${folder.name}/meta.json`, root), 'utf8'));
    if (meta.scores) drafts.push(meta);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
drafts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
const rows = drafts.map(d => {
  const s = d.scores;
  const total = (s.design * .4 + s.usability * .3 + s.creativity * .2 + s.content * .1).toFixed(2);
  const gates = d.creativeGates ?? 'Awaiting creative review';
  return `| [${d.title}](/drafts/${d.id}) | ${d.band} | ${d.rule ?? '—'} | ${(d.mechanisms ?? []).join(', ') || 'None earned'} | ${d.slopCount ?? '—'} | ${gates} | ${s.design.toFixed(1)} | ${s.usability.toFixed(1)} | ${s.creativity.toFixed(1)} | ${s.content.toFixed(1)} | ${total} | ${d.rounds} | [1440](drafts-review/${d.id}-desktop.png) · [375](drafts-review/${d.id}-mobile.png) | ${d.holdback} |`;
});
let verification = '';
try {
  const budget = JSON.parse(await readFile(new URL('design/art-directions/draft-budgets.json', root), 'utf8'));
  verification = `## Measured loading budget\n\nBaseline ${budget.baselineCommit}: entry **${budget.baseline.entry.toFixed(2)} kB gzip**, initial JS graph **${budget.baseline.initialJS.toFixed(2)} kB**. Current measurement: entry **${budget.final.entry.toFixed(2)} kB**, initial graph **${budget.final.initialJS.toFixed(2)} kB**. Measurement date and coverage are recorded in draft-budgets.json. Public images and self-hosted fonts are separate transfers. Each row includes the lazy picker shell and the draft's recursive graphics imports; already-loaded initial modules are excluded.\n\n| Draft | JS gzip | CSS gzip | Combined |\n| --- | ---: | ---: | ---: |\n${budget.drafts.map(d => `| ${d.id} | ${d.js.toFixed(2)} kB | ${d.css.toFixed(2)} kB | ${d.total.toFixed(2)} kB |`).join('\n')}\n\n`;
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const report = `# Live art-direction drafts

The live picker is **/drafts**. The creative round follows ASTRA-CREATIVE-BRIEF.md and CREATIVE-CONSULT.md. The public home remains the hybrid. Drafts are lazy-loaded and noindex.

## Review method

Fresh non-builders judge actual 1440 px and 375 px captures. Creativity uses M1–M11: 7 is a good personal site, 8 is distinctive, 9 is Site of the Day. Mechanisms are earned by visible evidence, with source used only to confirm a technique. Still images do not prove sound, physical weight, pacing or performance. Those require separate interaction checks.

The 16 previous directions retain their Design, Usability and Content scores for historical comparison; their Creativity scores have been replaced. Failed slop or metaphor gates remain explicit. A numerical score on a failed draft is diagnostic, not an approval. Old costumes receive no new repair rounds. Their proposed rule describes the current implementation, not a claim that the new law is satisfied. Full itemized reviews and the second-pass separation rationale are in creative-review-a.json and creative-review-b.json.

For new drafts, the anti-pale, slop ≤2 and M2 gates precede scoring. The new no-giant-name rule takes precedence over the previous name-size requirement. Maximum three rounds per new draft. Weights remain Design 40%, Usability 30%, Creativity 20%, Content 10%.

## Reviewed directions (${drafts.length})

| Draft | Band | Rule | Mechanisms | Slop | Gates | D | U | C | Content | Weighted | Rounds | Captures | Remaining holdback |
| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
${rows.join('\n')}

## Part A repairs

Merged origin/main locally at 889e02f. Hybrid's active project names now use solid ink; the screenshot-fill effect was removed. Wall's pictured tiles have embedded image previews at first render, independent of full-resolution image loading. Poster names use natural word wrapping and fitted type. These repairs address legibility and loading; they do not turn the old compositions into new concepts.

${verification}## Verification and limits

TypeScript, production builds and the craft detector run before each local draft commit. Browser checks and capture evidence accompany the drafts. A 60 fps mid-range-phone target is not a physical-device result; no such benchmark is claimed. Sound defaults off and persists. Reduced-motion and no-WebGL paths remain available. Care data is labelled as an invented recreation. No city, traffic count or business metric is invented.

## Maintenance

Metadata lives in src/drafts/<id>/meta.json, with rule first. Run node scripts/update-drafts-report.mjs after review. Thumbnails derive from corresponding desktop captures. Every direction uses the same confirmed project facts. No push or deployment is part of this work.
`;
await writeFile(new URL('design/art-directions/DRAFTS.md', root), report);
console.log(`Updated ${drafts.length} reviewed drafts`);
