"""Render public/og-image.png with Pillow: python3 scripts/generate-og.py.

The authored dithered sphere is read directly from public/mark.svg, so the
sharing card follows the site's identity. No screenshots or remote assets.
Archivo and Martian Mono are bundled in scripts/og-fonts with SIL OFL notices.
Copy matches HomePage and CONTENT.md; no inferred seniority or availability.
"""

from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont
from PIL.PngImagePlugin import PngInfo

ROOT = Path(__file__).resolve().parent.parent
SCALE = 3
WIDTH, HEIGHT = 1200, 630
GROUND = '#101112'
INK = '#eceef0'
SECONDARY = '#b9bec5'
image = Image.new('RGB', (WIDTH * SCALE, HEIGHT * SCALE), GROUND)
draw = ImageDraw.Draw(image)


def font(name, size, weight=400, width=100):
    face = ImageFont.truetype(str(ROOT / 'scripts' / 'og-fonts' / f'{name}.ttf'), round(size * SCALE))
    face.set_variation_by_axes([weight, width])
    return face


def text(value, x, y, face, fill=INK, anchor='lt'):
    draw.text((round(x * SCALE), round(y * SCALE)), value, font=face, fill=fill, anchor=anchor)


# Rasterize the actual mark's geometric dots at card resolution. Preserve its
# highlight, cobalt-facing hemisphere and diagonal cut; never approximate it.
mark = ET.parse(ROOT / 'public' / 'mark.svg').getroot()
viewbox = [float(value) for value in mark.attrib['viewBox'].split()]
mark_size = 416
mark_x, mark_y = 730, 96
factor = mark_size / viewbox[2]
for circle in mark.findall('{http://www.w3.org/2000/svg}circle'):
    x = mark_x + (float(circle.attrib['cx']) - viewbox[0]) * factor
    y = mark_y + (float(circle.attrib['cy']) - viewbox[1]) * factor
    radius = float(circle.attrib['r']) * factor
    bounds = tuple(round(value * SCALE) for value in (x - radius, y - radius, x + radius, y + radius))
    draw.ellipse(bounds, fill=circle.attrib['fill'])

# The new index uses Archivo at its natural width, with mono only for metadata.
text('Gentrit', 62, 137, font('Archivo', 106, 570, 100))
text('Rashiti', 62, 242, font('Archivo', 106, 570, 100))
text('Frontend & mobile developer,', 66, 398, font('Archivo', 28, 450, 100), SECONDARY)
text('now full stack.', 66, 440, font('Archivo', 28, 450, 100), SECONDARY)

draw.line((64 * SCALE, 538 * SCALE, 1136 * SCALE, 538 * SCALE), fill='#34373b', width=SCALE)
mono = font('MartianMono', 13, 400, 87.5)
text('REACT · REACT NATIVE · VUE · LARAVEL', 64, 569, mono, SECONDARY)
text('KOSOVO · WORKING REMOTELY', 1136, 569, mono, SECONDARY, anchor='rt')

metadata = PngInfo()
metadata.add_text('Description', (
    'Authored procedural sharing card. Geometry from public/mark.svg; '
    'local SIL OFL Archivo and Martian Mono fonts from scripts/og-fonts; '
    'factual copy from HomePage and CONTENT.md. No generated product screenshots. '
    'Reproduce with: python3 scripts/generate-og.py.'
))
metadata.add_text('impeccable:prompt', (
    'Origin: authored procedural sharing card rendered by scripts/generate-og.py. '
    'Geometry from public/mark.svg; local SIL OFL Archivo and Martian Mono fonts '
    'from scripts/og-fonts; factual copy from HomePage and CONTENT.md. '
    'No generated product screenshots.'
))
image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(
    ROOT / 'public' / 'og-image.png', optimize=True, pnginfo=metadata
)
print('Rendered public/og-image.png (1200 × 630), using public/mark.svg.')
