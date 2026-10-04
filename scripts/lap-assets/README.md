# LAP offline assets

The production app never parses fonts or triangulates outlines. `build.py` creates reusable extruded glyphs and a genuine RGB multi-channel distance-field atlas from the self-hosted Big Shoulders Display font at weight 700.

## Pinned inputs

- Font: `public/fonts/creative/BigShouldersDisplay-Latin.woff2`. Its upstream version and OFL are recorded in `public/fonts/creative/SOURCES.md` and `BigShouldersDisplay-OFL.txt`.
- [MSDFgen 1.12](https://github.com/Chlumsky/msdfgen/tree/v1.12), downloaded from `https://github.com/Chlumsky/msdfgen/archive/refs/tags/v1.12.tar.gz`. The bridge compiles the official core, calls `edgeColoringSimple`, then `generateMSDF`. It does not run a package install script or an upstream executable.
- [Earcut 3.0.2](https://github.com/mapbox/earcut/tree/v3.0.2), build-only module at `https://raw.githubusercontent.com/mapbox/earcut/v3.0.2/src/earcut.js`.
- Python fontTools 4.66.1, including its WOFF2 support. No Python package is shipped.

The source inputs must be downloaded to a temporary build directory. Nothing from that directory is imported by the runtime. With the unpacked MSDFgen source at `/tmp/lap-build/msdfgen-1.12` and Earcut at `/tmp/lap-build/earcut.mjs`:

```sh
clang++ -O2 -std=c++17 -DMSDFGEN_PUBLIC= -DMSDFGEN_USE_CPP11 \
  -I/tmp/lap-build/msdfgen-1.12 scripts/lap-assets/msdf-atlas.cpp \
  /tmp/lap-build/msdfgen-1.12/core/*.cpp -o /tmp/lap-build/msdf-atlas
python scripts/lap-assets/build.py \
  --msdfgen /tmp/lap-build/msdf-atlas \
  --earcut /tmp/lap-build/earcut.mjs
```

Run Python in an environment with fontTools. Current generation used `/tmp/gentrit-art-fonts/bin/python`. The script uses the repository's `sectors.json`, so the glyph set stays tied to the actual names.

## Format and reconstruction

- `glyphs.bin`: 33 reusable glyph meshes. Quantized signed 16-bit positions, signed 8-bit normals, unsigned 16-bit indices. Front/back faces are Earcut triangulations with holes, and every outline edge has a real extruded side wall. Curves are adaptively flattened once during the offline build.
- `glyphs.json`: byte offsets, counts, advances and atlas coordinates. The renderer only expands these numeric buffers and concatenates glyph meshes into words. It does no runtime triangulation.
- `names-msdf.png`: 384×384, 29,598-byte RGB glyph atlas. It contains 17,659 pixels with distinct channel values. The RGB channels are real edge-coloured signed-distance fields from MSDFgen, not offset alpha images. Saturated far-field pixels are normalized only when their median is already outside the useful edge range.
- The name renderer reconstructs each glyph with the median of RGB, combines glyph distance fields with a GPU MAX union into a name target, then interpolates the previous and next name distances. The alpha threshold is applied after interpolation. On interruption, the displayed distance field is captured into the other offscreen target; it never snapshots alpha coverage or substitutes a blur. A plain text crossfade is the explicit fallback if this WebGL path is unavailable.

The mesh binary is 122,740 bytes raw / 39,200 bytes with zlib level 9. The glyph metadata is about 5 kB. These are asset sizes, separate from the lazy JavaScript loading graph that root measures.

## Checks performed

- Every triangulated face's area matches its outline area minus holes; worst relative error was 0 at the printed precision.
- Every glyph index addresses an existing vertex.
- Atlas RGB channels genuinely differ near edges; median thresholding is performed in the runtime shader.
- No development dependency was added to `package.json` or the production loading graph.

License notices are copied into `public/lap/`. Rebuilding the files does not modify those notices.
