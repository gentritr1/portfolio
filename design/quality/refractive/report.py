"""Second half of the quality loop: idle pixel change, and a before/after strip against the previous run.

Usage: python3 design/quality/refractive/report.py design/quality/refractive/runs/<stamp>
Writes strip.png into the run: each row is one screen, previous run on the left, this run on the right.
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

run = Path(sys.argv[1])
runs = sorted(p for p in run.parent.iterdir() if p.is_dir())
prev = runs[runs.index(run) - 1] if runs.index(run) > 0 else None


def changed(a: Path, b: Path) -> float:
    d = list(ImageChops.difference(Image.open(a).convert('L'), Image.open(b).convert('L')).getdata())
    return 100 * sum(1 for x in d if x > 8) / len(d)


idle = changed(run / 'idle-a.png', run / 'idle-b.png')
print(f"{'PASS' if idle <= 0.5 else 'FAIL'}  field still at rest (≤ 0.5% of pixels per second)  — {idle:.2f}%")

names = sorted(p.name for p in run.glob('[dp]-*.png'))
rows = []
for n in names:
    cur = Image.open(run / n).convert('RGB')
    old = Image.open(prev / n).convert('RGB') if prev and (prev / n).exists() else Image.new('RGB', cur.size, (40, 0, 0))
    w = 640 if cur.width > cur.height else 260
    h = round(w * cur.height / cur.width)
    rows.append((old.resize((w, h)), cur.resize((w, h)), n))
if rows:
    W = max(a.width for a, _, _ in rows) * 2 + 30
    strip = Image.new('RGB', (W, sum(a.height + 10 for a, _, _ in rows)), 'white')
    y = 0
    for a, b, n in rows:
        strip.paste(a, (0, y))
        strip.paste(b, (a.width + 20, y))
        if prev and (prev / n).exists():
            print(f"      {n}: {changed(prev / n, run / n):.1f}% of pixels differ from the previous run")
        y += a.height + 10
    strip.save(run / 'strip.png')
    print(f"strip: {run / 'strip.png'} (previous left, this run right{'' if prev else '; no previous run'})")
