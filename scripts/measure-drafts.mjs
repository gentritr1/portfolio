import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

// Count complete loading graphs, not just a route's top-level file.
function inspect(directory) {
  const manifest = JSON.parse(readFileSync(resolve(directory, '.vite/manifest.json'), 'utf8'));
  function graph(key, dynamic = false, excluded = new Set(), seen = new Set()) {
    if (seen.has(key) || excluded.has(key) || !manifest[key]) return seen;
    seen.add(key);
    const module = manifest[key];
    for (const dependency of [...(module.imports ?? []), ...(dynamic ? module.dynamicImports ?? [] : [])]) graph(dependency, dynamic, excluded, seen);
    return seen;
  }
  function size(keys, kind = 'js') {
    const files = new Set();
    for (const key of keys) {
      const module = manifest[key];
      if (kind === 'js' && module.file.endsWith('.js')) files.add(module.file);
      if (kind === 'css') for (const file of module.css ?? []) files.add(file);
    }
    return [...files].reduce((sum, file) => sum + gzipSync(readFileSync(resolve(directory, file))).length, 0) / 1000;
  }
  const initial = graph('index.html');
  const picker = graph('src/drafts/DraftApp.tsx', false, initial);
  const drafts = Object.keys(manifest).filter(key => /^src\/drafts\/[^/]+\/Draft\.tsx$/.test(key)).map(key => {
    const keys = new Set([...picker, ...graph(key, true, initial)]);
    const js = size(keys), css = size(keys, 'css');
    return { id: key.split('/')[2], js, css, total: js + css };
  });
  return { entry: size(new Set(['index.html'])), initialJS: size(initial), drafts };
}
const current = inspect('dist');
const baselineDirectory = process.argv[2] ?? '/tmp/gentrit-creative-baseline/dist';
const path = 'design/art-directions/draft-budgets.json';
const previous = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
const baseline = existsSync(resolve(baselineDirectory, '.vite/manifest.json')) ? inspect(baselineDirectory) : previous?.baseline;
if (!baseline) throw new Error('Build the merged baseline with --manifest first.');
const result = { measuredAt: new Date().toISOString(), baselineCommit: '889e02f', baseline: {entry:baseline.entry, initialJS:baseline.initialJS}, final: {entry:current.entry,initialJS:current.initialJS}, drafts: current.drafts, labMoves: [] };
writeFileSync(path, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({baseline:result.baseline, current:result.final, largest:Math.max(...current.drafts.map(d=>d.total)), drafts:current.drafts.length}));
if(current.drafts.some(d=>d.total>150)) process.exitCode=1;
