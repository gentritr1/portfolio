"""Split every web font into a small preloaded core file and a lazy extended file.

Run by hand, never in the build, then commit what it writes:

    python3 -m venv .venv-fonts && .venv-fonts/bin/pip install -r scripts/fonts/requirements.txt
    .venv-fonts/bin/python scripts/fonts/subset_fonts.py            # write fonts and @font-face pairs
    .venv-fonts/bin/python scripts/fonts/subset_fonts.py --check    # exit 1 if anything is stale
    .venv-fonts/bin/python scripts/fonts/subset_fonts.py --check --specimen /tmp/fonts.html && node scripts/fonts/check_render.mjs /tmp/fonts.html
                                                                     # exit 1 if any core/ext pair renders differently

Rerun it when:
- copy gains a character no page used before (a new accented name, symbol or script);
- a stylesheet turns on an OpenType feature not listed by `--report` (font-variant-*, font-feature-settings);
- a draft adds an @font-face for one of these files, or a new font is added to scripts/fonts/originals/;
- fontTools or brotli is upgraded (then compare the bytes it prints).
Output is byte-identical between runs on the same inputs. Text made at runtime (Intl output, user input) is not in
the source: a character outside the core still renders, from the extended file or the next font in the stack.
`--check` answers whether a rerun is due.

Inputs are the untouched upstream-derived files in scripts/fonts/originals/<repo path>. Each one is written back to
<repo path> as the core file, so every existing preload and @font-face src stays valid, plus <name>-ext.woff2 beside it.

- Core: ASCII, every non-ASCII character in the site's source (src/ and index.html) in both cases, and the
  characters the browser draws on its own (U+2010 for `hyphens: auto` and U+2026 for `text-overflow: ellipsis`,
  which Chrome takes only from the face that holds the space, plus list bullets, <q> quotes and Intl spaces/minus).
  Chrome shapes each file separately, so a letter split from its neighbours loses its kerning; keeping every
  character the copy uses in the core keeps pages identical and means no current page downloads an extended file.
- Extended: the rest of Latin-1 and Latin Extended-A that the font has. Everything else is dropped.
- Features: fontTools' default layout features (the shaping features browsers apply on their own), plus every
  optional feature a stylesheet turns on.
  frac/numr/dnom, aalt, salt, ss/cv sets, small caps etc. are dropped unless a stylesheet asks for them.
- Hinting is dropped. The 7-byte `prep` that unhinted Google fonts carry (dropout control, a rasterizer setting)
  is kept where the original had it.
- Axes keep their full ranges: no consumer's @font-face narrows them, and a crawl cannot see hover or JS states.
  AXIS_LIMITS below takes measured ranges once they are approved.

Every @font-face that loads a managed file gets `unicode-range` set to the core's characters, followed by a
generated twin for the extended file. A range the author wrote is kept in a comment and intersected.
"""

import argparse
import html
import io
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont, newTable

ROOT = Path(__file__).resolve().parents[2]

# Characters the browser can draw from a page font without them being in the copy, and zero-width controls that
# joining scripts need in the same run as their neighbours.
GENERATED = "\u2010\u2026\u2022\u25e6\u25aa\u2018\u2019\u201c\u201d\u00a0\u2009\u202f\u2212\u200b\u200c\u200d\u200e\u200f\u2060\ufeff"
LATIN = set(range(0xA0, 0x180))  # Latin-1 Supplement + Latin Extended-A
# Chrome draws these with the font's hyphen-minus when the face's unicode-range covers them but the font has no glyph,
# so the core's range lists them for fonts without them; other browsers fall back exactly as they did before.
HYPHENS = {0x2010, 0x2011}
ASCII = set(range(0x20, 0x7F))

# Not applied by browsers unless asked for; fontTools keeps them by default.
NOT_DEFAULT = {"frac", "numr", "dnom"}
CSS_FEATURES = {
    "tabular-nums": ["tnum"], "proportional-nums": ["pnum"], "lining-nums": ["lnum"], "oldstyle-nums": ["onum"],
    "diagonal-fractions": ["frac", "numr", "dnom"], "stacked-fractions": ["afrc"], "ordinal": ["ordn"],
    "slashed-zero": ["zero"], "small-caps": ["smcp"], "all-small-caps": ["smcp", "c2sc"], "petite-caps": ["pcap"],
    "all-petite-caps": ["pcap", "c2pc"], "unicase": ["unic"], "titling-caps": ["titl"], "sub": ["subs"],
    "super": ["sups"], "discretionary-ligatures": ["dlig"], "historical-ligatures": ["hlig"],
}

# Measured ranges that would shrink a font further; empty until the owner approves them (see the report).
AXIS_LIMITS: dict[str, dict[str, tuple[float, float]]] = {}

DROPOUT_PREP = b"\xb8\x01\xff\x85\xb0\x04\x8d"  # PUSHW 511 SCANCTRL PUSHB 4 SCANTYPE


def source_text(root):
    """All text the site can render, with escapes decoded. Comments count too: a few spare glyphs beat a regex
    that mistakes a glob like "./*/x" for a comment and drops real copy."""
    out = []
    files = [p for p in (root / "src").rglob("*") if p.suffix in {".ts", ".tsx", ".css", ".json", ".svg", ".html"}]
    for p in files + [root / "index.html"]:
        s = p.read_text(encoding="utf-8")
        s = re.sub(r"\\u\{([0-9a-fA-F]+)\}", lambda m: chr(int(m.group(1), 16)), s)
        s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s)
        if p.suffix == ".css":
            s = re.sub(r"\\([0-9a-fA-F]{2,6}) ?", lambda m: chr(int(m.group(1), 16)), s)
        if p.suffix in {".tsx", ".html", ".svg"}:
            s = html.unescape(s)
        out.append(s)
    return "\n".join(out)


def used_features(text):
    tags = set()
    for m in re.finditer(r"font-variant(?:-[a-z]+)?\s*:\s*([^;}\n]+)|fontVariant[A-Za-z]*\s*:\s*['\"]([^'\"]+)", text):
        for word in (m.group(1) or m.group(2)).split():
            tags.update(CSS_FEATURES.get(word.strip(",;"), []))
    for m in re.finditer(r"(?:font-feature-settings|fontFeatureSettings)\s*:\s*([^;}\n]+)", text):
        for tag, value in re.findall(r"['\"](\w{4})['\"]\s*(on|off|\d+)?", m.group(1)):
            if value not in ("off", "0"):
                tags.add(tag)
    return tags


def unicode_range(cps):
    cps, parts, i = sorted(cps), [], 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        parts.append(f"U+{cps[i]:X}" if i == j else f"U+{cps[i]:X}-{cps[j]:X}")
        i = j + 1
    return ", ".join(parts)


def parse_range(value):
    cps = set()
    for part in value.replace("u+", "U+").split(","):
        part = part.strip().replace("U+", "")
        if not part:
            continue
        if "?" in part:
            lo, hi = int(part.replace("?", "0"), 16), int(part.replace("?", "F"), 16)
        elif "-" in part:
            lo, hi = (int(x, 16) for x in part.split("-"))
        else:
            lo = hi = int(part, 16)
        cps.update(range(lo, hi + 1))
    return cps


def build(src, unicodes, features, limits):
    # recalcBBoxes=False keeps the original head bounding box: Chrome on macOS uses it when it rasterizes small text
    # at 1x, so a recalculated (smaller) box shifts anti-aliasing (measured on Newsreader at 13 px).
    font = TTFont(src, recalcBBoxes=False, recalcTimestamp=False)
    had_prep = "prep" in font and font["prep"].program.getBytecode() == DROPOUT_PREP
    if limits:
        from fontTools.varLib import instancer
        font = instancer.instantiateVariableFont(font, limits)
    o = subset.Options()
    o.layout_features = features
    o.hinting = False
    o.name_IDs, o.name_languages, o.name_legacy = ["*"], ["*"], True
    o.notdef_outline = True
    # Keep the post table's glyph names: format 3 (fontTools' default) renders 13px text differently in Chrome on
    # macOS at 1x (measured on Newsreader; 2x was identical).
    o.glyph_names = True
    o.recalc_timestamp = False
    o.flavor = "woff2"
    s = subset.Subsetter(o)
    s.populate(unicodes=unicodes)
    s.subset(font)
    if had_prep:
        font["prep"] = newTable("prep")
        from fontTools.ttLib.tables import ttProgram
        font["prep"].program = ttProgram.Program()
        font["prep"].program.fromBytecode(DROPOUT_PREP)
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    return buf.getvalue()


def reserved_names(src):
    """Reserved Font Names from the OFL notices next to the delivered file."""
    names = set()
    for lic in src.parent.glob("*OFL*.txt"):
        names.update(re.findall(r'Reserved Font Names? "([^"]+)"', lic.read_text(encoding="utf-8", errors="ignore")))
    return names


def verify(orig_path, data, cps, features, reserved):
    """Font tools have quirks: reopen the output and compare it with the original glyph by glyph."""
    orig, new = TTFont(orig_path), TTFont(io.BytesIO(data))
    ocmap, ncmap = orig.getBestCmap(), new.getBestCmap()
    assert set(ncmap) == cps, f"cmap differs from request: {sorted(set(ncmap) ^ cps)[:10]}"
    for tag in ("hhea", "OS/2"):
        for attr in ("ascent", "descent", "lineGap", "sTypoAscender", "sTypoDescender", "sTypoLineGap", "usWinAscent", "usWinDescent", "fsSelection"):
            if hasattr(orig[tag], attr):
                assert getattr(orig[tag], attr) == getattr(new[tag], attr), f"{tag}.{attr} changed"
    for attr in ("unitsPerEm", "xMin", "yMin", "xMax", "yMax", "flags", "macStyle"):
        assert getattr(orig["head"], attr) == getattr(new["head"], attr), f"head.{attr} changed"
    assert orig["post"].formatType == new["post"].formatType, "post format changed"
    if "fvar" in orig and not AXIS_LIMITS.get(orig_path.name):
        assert [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in orig["fvar"].axes] == [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in new["fvar"].axes]
    og, ng = orig.getGlyphSet(), new.getGlyphSet()
    from fontTools.pens.recordingPen import DecomposingRecordingPen
    for cp in cps:
        a, b = DecomposingRecordingPen(og), DecomposingRecordingPen(ng)
        og[ocmap[cp]].draw(a)
        ng[ncmap[cp]].draw(b)
        assert a.value == b.value, f"outline of U+{cp:04X} changed"
        assert orig["hmtx"][ocmap[cp]] == new["hmtx"][ncmap[cp]], f"advance of U+{cp:04X} changed"
    if "gvar" in orig and not AXIS_LIMITS.get(orig_path.name):
        for cp in cps:
            ov, nv = orig["gvar"].variations.get(ocmap[cp], []), new["gvar"].variations.get(ncmap[cp], [])
            assert [(v.axes, v.coordinates) for v in ov] == [(v.axes, v.coordinates) for v in nv], f"variations of U+{cp:04X} changed"
    for t in ("fpgm", "cvt ", "hdmx", "VDMX", "LTSH"):
        assert t not in new, f"{t} survived"
    kept = {fr.FeatureTag for t in ("GSUB", "GPOS") if t in new and new[t].table.FeatureList for fr in new[t].table.FeatureList.FeatureRecord}
    assert kept <= set(features), f"unexpected features {kept - set(features)}"
    for rec in new["name"].names:
        if rec.nameID in (1, 3, 4, 6, 16, 17, 21, 22, 25):
            for rn in reserved:
                assert rn not in rec.toUnicode(), f"reserved name {rn!r} in name ID {rec.nameID}"
    # Names below 256 (family, copyright, license...) stay; labels of dropped stylistic sets may go.
    names = lambda f: {(r.nameID, r.platformID, r.langID, r.toUnicode()) for r in f["name"].names}
    a, b = names(orig), names(new)
    assert {r for r in a if r[0] < 256} == {r for r in b if r[0] < 256} and b <= a, "name table changed"


def specimen(root, managed, path):
    """A page that sets every kept character twice: from the original file, and from the core + extended pair."""
    css, rows = [], []
    for i, (rel, (core, ext, borrowed, missing)) in enumerate(sorted(managed.items())):
        orig = f"/scripts/fonts/originals/{rel}"
        out = "/" + rel
        font = TTFont(root / "scripts" / "fonts" / "originals" / rel)
        axes = {a.axisTag: (a.minValue, a.defaultValue, a.maxValue) for a in font["fvar"].axes} if "fvar" in font else {}
        # Same range on the original: a face without the space character gives the line its strut from the fallback.
        css.append(f"@font-face{{font-family:O{i};src:url({orig});font-weight:1 1000;font-stretch:1% 1000%;unicode-range:{unicode_range(core | ext)}}}")
        # N: the original as the site declared it, without a range, for copy characters the font does not have.
        css.append(f"@font-face{{font-family:N{i};src:url({orig});font-weight:1 1000;font-stretch:1% 1000%}}")
        css.append(f"@font-face{{font-family:S{i};src:url({out});font-weight:1 1000;font-stretch:1% 1000%;unicode-range:{unicode_range(core | borrowed)}}}")
        if ext:
            css.append(f"@font-face{{font-family:S{i};src:url({out[:-6]}-ext.woff2);font-weight:1 1000;font-stretch:1% 1000%;unicode-range:{unicode_range(ext)}}}")
        # Core and extended characters on separate lines: kerning across the two files is lost by design.
        texts = [(part, html.escape("".join(chr(c) for c in sorted(cps)))) for part, cps in (("core", core), ("ext", ext)) if cps]
        if 0x61 in core:
            texts.append(("missing", html.escape(" ".join(f"a{chr(c)}b" for c in sorted(missing | borrowed)))))
        settings = [""] + [f"font-variation-settings:'{tag}' {v:g}" for tag, (lo, dflt, hi) in axes.items() for v in (lo, hi)]
        for size in (11, 13, 16, 24):
            for fvs in settings:
                # Whole-pixel line heights: a fractional baseline offset alone changes anti-aliasing.
                style = f"font-size:{size}px;line-height:{round(size * 1.6)}px;{fvs}"
                for part, text in texts:
                    before = "N" if part == "missing" else "O"
                    rows.append(f'<p data-pair="{rel} {part} {size}px {fvs}"><span style="font-family:{before}{i};{style}">{text}</span><span style="font-family:S{i};{style}">{text}</span></p>')
    path.write_text("<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;color:#111}p{margin:0}"
                    "span{display:block;width:1180px;padding:4px;white-space:pre-wrap;word-break:break-all}"
                    + "".join(css) + "</style>" + "".join(rows), encoding="utf-8")


FACE = re.compile(r"@font-face\s*\{[^{}]*\}")
EXT_MARK = "/* subset-fonts: extended */"
OLD_TWIN = re.compile(r"\n[ \t]*@font-face\s*\{\s*" + re.escape(EXT_MARK) + r"[^{}]*\}")
RANGE_DECL = re.compile(r"\s*unicode-range\s*:[^;}]*;?(?:\s*/\* subset-fonts: core[^*]*\*/)?")


def with_range(block, value):
    """The block with its unicode-range replaced by `value`, written at the end in the block's own style."""
    body = RANGE_DECL.sub("", block)[:-1].rstrip()
    if not body.endswith((";", "{")):
        body += ";"
    if "\n" not in block:
        return f"{body} unicode-range: {value} }}"
    first = re.search(r"\{[^\S\n]*\n([ \t]+)", block)
    indent = first.group(1) if first else "  "
    close = re.search(r"\n([ \t]*)\}$", block)
    return f"{body}\n{indent}unicode-range: {value}\n{close.group(1) if close else ''}}}"


def rewrite_css(path, managed, root):
    """Pairs every @font-face that loads a managed file with its extended twin. Idempotent."""
    text = OLD_TWIN.sub("", path.read_text(encoding="utf-8"))
    out, last = [], 0
    for m in FACE.finditer(text):
        block = m.group(0)
        u = re.search(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", block)
        if not u:
            continue
        url = u.group(2)
        target = root / "public" / url.lstrip("/") if url.startswith("/") else path.parent / url
        try:
            key = target.resolve().relative_to(root).as_posix()
        except ValueError:
            continue
        if key not in managed:
            continue
        core, ext, borrowed, _ = managed[key]
        core = core | borrowed
        # A range the author wrote limits both files; it is kept in the marker so reruns still see it.
        marker = re.search(r"/\* subset-fonts: core(?: of ([^*]*?))? \*/", block)
        authored = re.search(r"unicode-range\s*:\s*([^;}]*)", block)
        authored = (marker.group(1) if marker else authored and authored.group(1).strip()) or None
        if authored:
            allowed = parse_range(authored)
            core, ext = core & allowed, ext & allowed
        note = f"/* subset-fonts: core of {authored} */" if authored else "/* subset-fonts: core */"
        block2 = with_range(block, f"{unicode_range(core)}; {note}")
        out += [text[last:m.start()], block2]
        if ext:
            twin = with_range(block2, unicode_range(ext) + ";").replace(url, url[: -len(".woff2")] + "-ext.woff2", 1)
            twin = re.sub(r"@font-face\s*\{", "@font-face { " + EXT_MARK, twin, count=1)
            indent = re.match(r"[ \t]*", text[text.rfind("\n", 0, m.start()) + 1:]).group(0)
            out.append("\n" + indent + twin)
        last = m.end()
    out.append(text[last:])
    return "".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="exit 1 if a font or stylesheet is out of date")
    ap.add_argument("--report", action="store_true", help="print sizes and the features kept")
    ap.add_argument("--skip", action="append", default=[], help="stylesheet to leave alone (its faces load only the core)")
    ap.add_argument("--root", type=Path, default=ROOT)
    ap.add_argument("--specimen", type=Path, help="also write the before/after specimen page for check_render.mjs")
    args = ap.parse_args()
    root = args.root.resolve()
    originals = root / "scripts" / "fonts" / "originals"
    text = source_text(root)
    # Both cases of every letter: text-transform can show the case the copy does not spell.
    chars = {c for c in text if ord(c) > 0x7E} | set(GENERATED)
    chars |= {v for c in chars for v in (c.upper(), c.lower()) if len(v) == 1}
    content = {ord(c) for c in chars if ord(c) > 0x7E}
    features = sorted((set(subset.Options().layout_features) - NOT_DEFAULT) | used_features(text))
    stale, managed, rows = [], {}, []
    for src in sorted(originals.rglob("*.woff2")):
        rel = src.relative_to(originals).as_posix()
        out_core = root / rel
        out_ext = out_core.with_name(out_core.stem + "-ext.woff2")
        cmap = set(TTFont(src).getBestCmap())
        core = (ASCII | content) & cmap
        ext = (LATIN & cmap) - core
        limits = AXIS_LIMITS.get(src.name, {})
        reserved = reserved_names(out_core)
        files = [(out_core, core), (out_ext, ext)]
        for path, cps in files:
            if not cps:
                if path.exists() and path == out_ext:
                    stale.append(path)
                    if not args.check:
                        path.unlink()
                continue
            data = build(src, cps, features, limits)
            verify(src, data, cps, features, reserved)
            if not path.exists() or path.read_bytes() != data:
                stale.append(path)
                if not args.check:
                    path.write_bytes(data)
            rows.append((rel if path == out_core else out_ext.relative_to(root).as_posix(), src.stat().st_size if path == out_core else 0, len(data), len(cps)))
        borrowed = (HYPHENS - cmap) if 0x2D in cmap else set()
        managed[rel] = (core, ext, borrowed, (content - cmap) - borrowed)
    css = [p for p in (root / "src").rglob("*.css")]
    skips = {(root / s).resolve() for s in args.skip}
    for p in css:
        if p.resolve() in skips:
            continue
        before = p.read_text(encoding="utf-8")
        after = rewrite_css(p, managed, root)
        if after != before:
            stale.append(p)
            if not args.check:
                p.write_text(after, encoding="utf-8")
    if args.specimen:
        specimen(root, managed, args.specimen)
    if args.report or not args.check:
        print(f"features kept where present: {' '.join(features)}")
        for rel, orig, size, n in rows:
            print(f"{rel:62s} {orig:>8} -> {size:>7} bytes, {n:4d} characters")
    if args.check and stale:
        print("stale:", *[p.relative_to(root) for p in stale], sep="\n  ")
        sys.exit(1)


if __name__ == "__main__":
    main()
