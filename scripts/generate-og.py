"""Render public/og-image.png with Pillow: python3 scripts/generate-og.py.

Authored geometry, ported from signal-stack/layout.ts and waves.ts; no product
screenshots or remote assets. The bundled Archivo and Martian Mono fonts are
from github.com/google/fonts (ofl/archivo and ofl/martianmono), under the adjacent
SIL Open Font License notices. Output is supersampled for clean pane rims.
"""

from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SCALE = 3
WIDTH, HEIGHT = 1200, 630
image = Image.new('RGB', (WIDTH * SCALE, HEIGHT * SCALE), '#101315')
draw = ImageDraw.Draw(image)


def font(name, size, weight=400, width=100):
    face = ImageFont.truetype(str(ROOT / 'scripts' / 'og-fonts' / f'{name}.ttf'), round(size * SCALE))
    face.set_variation_by_axes([weight, width])
    return face


def text(value, x, y, face, fill):
    draw.text((round(x * SCALE), round(y * SCALE)), value, font=face, fill=fill, anchor='lt')


def line(points, fill, width=1, target=draw):
    target.line([(round(x * SCALE), round(y * SCALE)) for x, y in points], fill=fill, width=round(width * SCALE), joint='curve')


def dot(x, y, radius, fill):
    draw.ellipse(((x - radius) * SCALE, (y - radius) * SCALE, (x + radius) * SCALE, (y + radius) * SCALE), fill=fill)


# The same shallow six-pane arc, scale and camera as the interactive stack.
PANE_W, PANE_H = 1.6 * 1.375, 1 * 1.375
ARC_RADIUS, ARC_STEP, CAMERA_Z, FORWARD = 3.2, math.radians(9), 6, 0.35
PITCH, RECENTRE, ACTIVE = math.radians(-6), 0.62, 1
TINTS = ['#92bcb4', '#c3a0a2', '#ceb38d', '#b8a5cd', '#c4cca1', '#aabac7']


def pose(index):
    angle = (index - ACTIVE) * ARC_STEP
    middle = (2.5 - ACTIVE) * ARC_STEP
    return (ARC_RADIUS * math.sin(angle) - ARC_RADIUS * math.sin(middle) * RECENTRE,
            -ARC_RADIUS * (1 - math.cos(angle)) + (FORWARD if index == ACTIVE else 0), angle)


def project(index, x, y):
    px, pz, yaw = pose(index)
    xx = px + x * math.cos(yaw)
    zz = pz - x * math.sin(yaw)
    yy = y * math.cos(PITCH) - zz * math.sin(PITCH)
    zz = y * math.sin(PITCH) + zz * math.cos(PITCH)
    depth = CAMERA_Z / (CAMERA_Z - zz)
    return (xx * depth, -yy * depth)


corners = [project(i, x, y) for i in range(6) for x in [-PANE_W / 2, PANE_W / 2] for y in [-PANE_H / 2, PANE_H / 2]]
left, right = min(x for x, y in corners), max(x for x, y in corners)
top, bottom = min(y for x, y in corners), max(y for x, y in corners)
factor = min(610 / (right - left), 332 / (bottom - top))
origin_x = 565 - left * factor
origin_y = 295 - (top + bottom) / 2 * factor


def point(index, x, y):
    px, py = project(index, x, y)
    return (origin_x + px * factor, origin_y + py * factor)


def edge(index):
    radius = 0.065
    values = []
    for cx, cy, angle in [(PANE_W / 2 - radius, PANE_H / 2 - radius, 0),
                           (-PANE_W / 2 + radius, PANE_H / 2 - radius, 90),
                           (-PANE_W / 2 + radius, -PANE_H / 2 + radius, 180),
                           (PANE_W / 2 - radius, -PANE_H / 2 + radius, 270)]:
        for step in range(9):
            a = math.radians(angle + step * 90 / 8)
            values.append(point(index, cx + radius * math.cos(a), cy + radius * math.sin(a)))
    return values + [values[0]]


def waveform(kind, phase):
    tau = 2 * math.pi
    if kind == 0:
        u = (phase * 0.5) % 1
        gaussian = lambda center, width: math.exp(-((u - center) / width) ** 2)
        return 0.95 * gaussian(0.46, 0.018) - 0.42 * gaussian(0.51, 0.02) - 0.18 * gaussian(0.41, 0.025) + 0.2 * gaussian(0.7, 0.05)
    if kind == 1:
        return math.sin(tau * phase) * 0.8
    if kind == 2:
        return math.floor(math.sin(tau * phase * 0.75) * 1.5) / 2.2
    if kind == 3:
        return min(1, max(-1, math.sin(tau * phase * 0.75) * 7)) * 0.7
    if kind == 4:
        return 0.5 * math.sin(tau * phase) + 0.38 * math.sin(tau * phase * 2.7 + 1.3) * math.cos(tau * phase * 0.35)
    return (1 - 4 * abs((phase * 0.8 + 0.25) % 1 - 0.5)) * 0.75


shadow = Image.new('RGBA', image.size)
shadow_draw = ImageDraw.Draw(shadow)
for index in range(6):
    shadow_draw.polygon([(x * SCALE, (y + 16) * SCALE) for x, y in edge(index)], fill=(0, 0, 0, 65))
image.paste(shadow.filter(ImageFilter.GaussianBlur(18 * SCALE)), (0, 0), shadow.filter(ImageFilter.GaussianBlur(18 * SCALE)))
draw = ImageDraw.Draw(image)

for index in sorted(range(6), key=lambda i: pose(i)[1]):
    active = index == ACTIVE
    outline = edge(index)
    draw.polygon([(x * SCALE, y * SCALE) for x, y in outline], fill='#22292c' if active else '#1b2024')
    tint = TINTS[index]
    line(outline, tint if active else '#495155', 1.4 if active else 1)
    line([point(index, -PANE_W * .425, PANE_H * .355), point(index, -PANE_W * .325, PANE_H * .355)], tint, 4)
    line([point(index, -PANE_W * .425, PANE_H * .19), point(index, -PANE_W * .04, PANE_H * .19)], '#657174' if active else '#3c4549', 1)
    line([point(index, -PANE_W * .425, PANE_H * .11), point(index, -PANE_W * .19, PANE_H * .11)], '#505c61' if active else '#323b40', 1)
    line([point(index, -PANE_W * .425, -PANE_H * .17), point(index, PANE_W * .425, -PANE_H * .17)], '#465053' if active else '#30393d', 0.7)
    trace = []
    for step in range(241):
        t = step / 240
        envelope = min(1, t / .1) * min(1, (1 - t) / .1)
        value = waveform(index, t * 2.4 - index * .37)
        trace.append(point(index, (t - .5) * PANE_W * .85, -PANE_H * .17 + value * PANE_H * .12 * envelope))
    line(trace, tint if active else '#697776', 1.6 if active else 1.1)
    if active:
        x, y = point(index, PANE_W * .4, PANE_H * .35)
        dot(x, y, 4.1, '#ef896d')

# Calm typography, the portfolio's actual display width, and one warm signal.
text('Gentrit', 62, 137, font('Archivo', 94, 600, 112), '#eef0ef')
text('Rashiti', 62, 232, font('Archivo', 94, 600, 112), '#eef0ef')
text('Frontend & mobile developer', 66, 367, font('Archivo', 25, 500, 100), '#b9c2c5')
text('Web. Mobile. Full stack.', 66, 410, font('Archivo', 21, 500, 100), '#88969b')
dot(1074, 66, 4, '#ef896d')
text('ON AIR', 1091, 58, font('MartianMono', 12, 400, 87.5), '#c4cdcf')

line([(64, 515), (1136, 515)], '#394247')
labels = [('CH01', 'Healthcare'), ('CH02', 'Streaming'), ('CH03', 'Mobile apps'),
          ('CH04', 'Web3'), ('CH05', 'Web apps & AI'), ('CH06', 'Games & personal')]
for index, (number, label) in enumerate(labels):
    x = 64 + index * 183
    text(number, x, 541, font('MartianMono', 12, 400, 87.5), TINTS[index])
    text(label, x, 565, font('Archivo', 16, 500, 100), '#b9c2c5')

image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(ROOT / 'public' / 'og-image.png', optimize=True)
print('Rendered public/og-image.png (1200 × 630).')
