# Cut the hero's art-directed crops from the 2x source captures. Rects are in the source capture's CSS px (2 image px each).
# A wide entry may instead be a strip: {"size": [w, h], "gap": g, "parts": [[src, rect], ...]}, the parts side by side at equal
# height, centred, with equal gaps between them and at the sides, on the figure's ground #0b0b10.
# python3 crops.py <repo>/public <preview dir>
import sys, os, json
from PIL import Image
pub, prev = sys.argv[1], sys.argv[2]
CROPS = json.load(open(os.path.join(os.path.dirname(__file__), 'crops.json')))
os.makedirs(os.path.join(pub, 'hero'), exist_ok=True); os.makedirs(prev, exist_ok=True)
cut = lambda src, r: Image.open(os.path.join(pub, src.lstrip('/'))).convert('RGB').crop((r[0] * 2, r[1] * 2, (r[0] + r[2]) * 2, (r[1] + r[3]) * 2))
for slug, c in CROPS.items():
    for kind in ('wide', 'narrow'):
        spec = c[kind]
        if isinstance(spec, dict):
            (w, h), g = spec['size'], spec['gap']
            parts = [cut(s, r) for s, r in spec['parts']]
            assert len({p.size[1] for p in parts}) == 1 and sum(p.size[0] for p in parts) + g * 2 * (len(parts) + 1) == w * 2, 'strip does not add up'
            im = Image.new('RGB', (w * 2, h * 2), (11, 11, 16)); x = g * 2
            for p in parts: im.paste(p, (x, (h * 2 - p.size[1]) // 2)); x += p.size[0] + g * 2
        else:
            im = cut(c['src'], spec)
        out = os.path.join(pub, 'hero', f'{slug}-{kind}.webp')
        im.save(out, 'WEBP', quality=82, method=6)
        im.save(os.path.join(prev, f'{slug}-{kind}.jpg'), quality=70)
        print(out, im.size, os.path.getsize(out) // 1024, 'kB')
