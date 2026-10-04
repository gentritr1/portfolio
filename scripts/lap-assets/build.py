"""Offline font geometry and genuine MSDF assets. No production font parser.
Usage: python build.py --msdfgen /tmp/lap-build/msdf-atlas --earcut /tmp/lap-build/earcut.mjs
Needs fontTools[woff]; other modules are Python's standard library.
"""
import argparse, json, math, struct, subprocess, zlib
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/lap'
parser = argparse.ArgumentParser()
parser.add_argument('--msdfgen', required=True)
parser.add_argument('--earcut', required=True)
args = parser.parse_args()
OUT.mkdir(exist_ok=True)
names = json.loads((ROOT/'src/drafts/lap/sectors.json').read_text())
font = TTFont(ROOT/'public/fonts/creative/BigShouldersDisplay-Latin.woff2')
if 'fvar' in font: font = instantiateVariableFont(font, {'wght': 700}, inplace=True)
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
units = font['head'].unitsPerEm

class OutlinePen(BasePen):
    def __init__(self):
        super().__init__(glyphs)
        self.contours, self.current = [], []
    def _moveTo(self, p): self.current = [p]
    def _lineTo(self, p): self.current.append(p)
    def _curveToOne(self, a, b, c):
        p = self.current[-1]
        length = sum(math.dist(x,y) for x,y in [(p,a),(a,b),(b,c)])
        count = max(3, min(16, math.ceil(length/55)))
        for i in range(1,count+1):
            t=i/count; s=1-t
            self.current.append(tuple(s**3*p[k]+3*s*s*t*a[k]+3*s*t*t*b[k]+t**3*c[k] for k in range(2)))
    def _qCurveToOne(self, a, b):
        p=self.current[-1]
        count=max(3,min(16,math.ceil((math.dist(p,a)+math.dist(a,b))/55)))
        for i in range(1,count+1):
            t=i/count; s=1-t
            self.current.append(tuple(s*s*p[k]+2*s*t*a[k]+t*t*b[k] for k in range(2)))
    def _closePath(self):
        if len(self.current)>1 and self.current[0]==self.current[-1]: self.current.pop()
        if len(self.current)>2: self.contours.append(self.current)
        self.current=[]
    def _endPath(self): self._closePath()

def inside(point, polygon):
    x,y=point; result=False
    for a,b in zip(polygon, polygon[1:]+polygon[:1]):
        if (a[1]>y)!=(b[1]>y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: result=not result
    return result
def area(poly): return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))/2

chars = sorted(set(''.join(n['name'] for n in names)))
outlines, advances, shapes = {}, {}, []
for char in chars:
    name=cmap.get(ord(char))
    if not name: raise ValueError(f'Font lacks {char!r}')
    pen=OutlinePen(); glyphs[name].draw(pen)
    outlines[char]=pen.contours
    advances[char]=glyphs[name].width
    contours=pen.contours
    depths=[sum(inside(p[0],other) for j,other in enumerate(contours) if j!=i) for i,p in enumerate(contours)]
    for i,outer in enumerate(contours):
        if depths[i]%2: continue
        holes=[p for j,p in enumerate(contours) if depths[j]==depths[i]+1 and inside(p[0],outer)]
        vertices=[v for p in outer for v in p]; starts=[]
        for hole in holes:
            starts.append(len(vertices)//2); vertices.extend(v for p in hole for v in p)
        shapes.append({'char':char,'vertices':vertices,'holes':starts})

work=Path(args.msdfgen).parent
(work/'triangles-input.json').write_text(json.dumps(shapes))
subprocess.run(['node',str(ROOT/'scripts/lap-assets/triangulate.mjs'),str(Path(args.earcut).resolve()),str(work/'triangles-input.json'),str(work/'triangles.json')],check=True)
shapes=json.loads((work/'triangles.json').read_text())
binary=bytearray(); metadata={}
for char in chars:
    positions=[]; normals=[]; indices=[]
    def add(p,n):
        positions.extend(p); normals.extend(n); return len(positions)//3-1
    for shape in [s for s in shapes if s['char']==char]:
        points=list(zip(shape['vertices'][::2],shape['vertices'][1::2]))
        front=len(positions)//3
        for x,y in points: add((x,y,110),(0,0,127))
        back=len(positions)//3
        for x,y in points: add((x,y,-110),(0,0,-127))
        for a,b,c in zip(shape['indices'][::3],shape['indices'][1::3],shape['indices'][2::3]):
            indices.extend((front+a,front+b,front+c,back+c,back+b,back+a))
    for contour in outlines[char]:
        orientation=1 if area(contour)>0 else -1
        for a,b in zip(contour,contour[1:]+contour[:1]):
            dx,dy=b[0]-a[0],b[1]-a[1]; length=math.hypot(dx,dy)
            if length<.01: continue
            normal=(round(dy/length*127*orientation),round(-dx/length*127*orientation),0)
            base=len(positions)//3
            for x,y,z in [(a[0],a[1],110),(b[0],b[1],110),(b[0],b[1],-110),(a[0],a[1],-110)]: add((x,y,z),normal)
            indices.extend((base,base+1,base+2,base,base+2,base+3))
    while len(binary)%4: binary.append(0)
    start=len(binary)
    for value in positions: binary.extend(struct.pack('<h',round(value)))
    normal_start=len(binary)
    for value in normals: binary.extend(struct.pack('b',value))
    if len(binary)%2: binary.append(0)
    index_start=len(binary)
    for value in indices: binary.extend(struct.pack('<H',value))
    metadata[char]={'position':start,'normal':normal_start,'index':index_start,'vertices':len(positions)//3,'indices':len(indices),'advance':advances[char]}
(OUT/'glyphs.bin').write_bytes(binary)
(OUT/'glyphs.json').write_text(json.dumps({'units':units,'glyphs':metadata},separators=(',',':')))

# One genuine MSDF per glyph. Runtime composes names from these fields, never DOM text.
visible=[c for c in chars if outlines[c]]
all_y=[p[1] for c in visible for contour in outlines[c] for p in contour]
low,high=min(all_y),max(all_y)
scale=44/(high-low)
columns=6; rows=math.ceil(len(visible)/columns); cell=64
lines=[f'{len(visible)} {cell} {cell}']; items={}
for index,char in enumerate(visible):
    points=[p for contour in outlines[char] for p in contour]
    minx,maxx=min(p[0] for p in points),max(p[0] for p in points)
    x=(cell-(maxx-minx)*scale)/2-minx*scale
    y=(cell-(high-low)*scale)/2-low*scale
    items[char]={'x':index%columns*cell,'y':index//columns*cell,'origin':[round(-x/scale,5),round(-y/scale,5)]}
    lines.append(str(len(outlines[char])))
    for contour in outlines[char]:
        lines.append(str(len(contour)))
        lines.extend(f'{px*scale+x:.5f} {py*scale+y:.5f}' for px,py in contour)
(work/'names.shape').write_text('\n'.join(lines))
subprocess.run([args.msdfgen,str(work/'names.shape'),str(work/'names.rgb')],check=True)
source=(work/'names.rgb').read_bytes()
w,h=columns*cell,rows*cell
raw=bytearray(w*h*3)
for index in range(len(visible)):
    for y in range(cell):
        start=((index//columns*cell+y)*w+index%columns*cell)*3
        offset=(index*cell*cell+y*cell)*3
        raw[start:start+cell*3]=source[offset:offset+cell*3]
# Median-equivalent saturation removes unused far-field colour wedges.
for i in range(0,len(raw),3):
    middle=sorted(raw[i:i+3])[1]
    if middle<8: raw[i:i+3]=b'\0\0\0'
    elif middle>247: raw[i:i+3]=b'\xff\xff\xff'
def chunk(kind,data): return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
scan=bytearray()
for y in range(h):
    row=raw[y*w*3:(y+1)*w*3]
    scan.append(1)
    scan.extend((v-(row[x-3] if x>=3 else 0))%256 for x,v in enumerate(row))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(scan,9))+chunk(b'IEND',b'')
(OUT/'names-msdf.png').write_bytes(png)
(OUT/'glyphs.json').write_text(json.dumps({'units':units,'glyphs':metadata,'atlas':{'width':w,'height':h,'cell':cell,'scale':scale,'low':low,'high':high,'items':items}},separators=(',',':')))
different=sum(1 for i in range(0,len(raw),3) if raw[i]!=raw[i+1] or raw[i+1]!=raw[i+2])
assert different>1000, 'Atlas must contain actual distinct RGB edge-distance channels'
print(f'{len(chars)} glyphs, {len(binary)} bytes mesh / {len(zlib.compress(binary,9))} compressed; atlas {len(png)} bytes, {different} multi-channel pixels')
