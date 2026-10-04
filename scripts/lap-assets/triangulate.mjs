// Build-time only; the production app receives indexed glyph meshes.
import fs from "node:fs";
const { default: earcut } = await import(process.argv[2]);
const shapes = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
for (const shape of shapes)
  shape.indices = earcut(shape.vertices, shape.holes, 2);
fs.writeFileSync(process.argv[4], JSON.stringify(shapes));
