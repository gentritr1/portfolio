// Renders the specimen from `subset_fonts.py --specimen` in Chrome and fails if any original/subset pair differs by a
// pixel, at 1x and 2x. Identical pixels give identical PNG bytes, so no image library is needed.
// usage: node scripts/fonts/check_render.mjs <specimen.html>   (PLAYWRIGHT=<path to playwright> if it is not installed)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const page = fs.readFileSync(process.argv[2]);
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(root, url);
  if (url === "/") return res.end(page);
  if (!file.startsWith(root) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": "font/woff2" }).end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
let failed = 0, pairs = 0;
for (const deviceScaleFactor of [1, 2]) {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor });
  await tab.goto(`http://127.0.0.1:${server.address().port}/`);
  await tab.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); await document.fonts.ready; });
  for (const p of await tab.locator("p").all()) {
    const [a, b] = await p.locator("span").all();
    pairs++;
    if (!(await a.screenshot()).equals(await b.screenshot())) { failed++; console.log(`DIFF ${deviceScaleFactor}x ${await p.getAttribute("data-pair")}`); }
  }
  await tab.close();
}
await browser.close();
server.close();
console.log(`${pairs - failed} of ${pairs} pairs identical`);
process.exit(failed ? 1 : 0);
