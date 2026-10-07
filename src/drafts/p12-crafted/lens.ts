/**
 * A lenticular print, computed.
 *
 * The print under the lens sheet holds two screens, A and B, cut into strips half a lens wide and
 * interlaced. Each cylindrical lens (vertical, PITCH css px wide) magnifies two times, so a viewer
 * straight in front sees whole strips of one screen at full resolution. The angle from the eye to a
 * lens picks which strip it magnifies. That angle depends on the card's tilt and on how far the lens
 * sits from the card's centre, so when the card turns, the switch sweeps across it from the edge that
 * turns away. The sheen is a lamp's reflection in each lens's curved surface.
 *
 * Cost per frame: only the lenses whose cut moved are drawn again (three plain blits per band). The sheen is
 * printed into the two screens once per size: screen A carries the glints as seen flat, screen B the glints as
 * seen at the second face and the lens seams. A lens that shows B shows its seams; the glints slide less than two
 * pixels over the whole turn, so each screen keeps its own. Nothing else is drawn while the card turns.
 */

/** Lens width in CSS pixels. */
export const PITCH = 4;
/** Eye distance for the card's turn in CSS (the perspective) and for the lamp's glints, CSS pixels. */
export const EYE = 8000;
/** |tan α| below QA shows only A; above QB only B (the lens's focal spot is narrower than a strip). */
const QA = 0.07;
const QB = 0.1;
/** The resting tilt that shows B everywhere on the card. */
export const FACE_B_DEG = 9;
/** Past this tilt the labels follow the second face. */
export const FLIP_DEG = FACE_B_DEG / 2;
/**
 * The angle each lens sees: the page angle plus the lens's place across the card. Every card is seen from a
 * distance in proportion to its width, so every card, large or small, sweeps over the same part of the page
 * angle, from the edge that turns away. At rest the right edge sits just inside the switch (a thin band of
 * the second screen's strips: the material reads in a still); at the second face the left edge is past it.
 */
const SPREAD = QA + 0.35 * (QB - QA);
const REACH = QB + 0.005;

/** Lens surface: steepest slope at its edge, degrees. */
const LENS_EDGE = 10 * (Math.PI / 180);
/** Brightest glint and darkest lens seam, as alpha. The glint's specular exponent, 120, is applied by squaring. */
const GLINT = 0.15;
const SEAM = 0.06;
/** Rows of the sheen grid; it is stretched to the card height. */
const SHEEN_ROWS = 14;
/** RGBA pixels written as one 32-bit word: white with alpha, or black with alpha, in this machine's byte order. */
const LITTLE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const WHITE = LITTLE ? 0x00ffffff : 0xffffff00 | 0;
const ALPHA = LITTLE ? 24 : 0;
/** The card's corner radius in CSS px (matches .lx-shadow in draft.css). The canvases carry their own corners. */
export const RADIUS = 12;

export interface Tile {
  src: string;
  /** Source rectangle in the image's own pixels. */
  s: readonly [number, number, number, number];
  /** Destination as fractions of the card. */
  d: readonly [number, number, number, number];
}

export interface FacePaint {
  ground: string;
  tiles: Tile[];
}

/** Where the lens shows A (−0.25), B (+0.25), or a split strip in between. */
function strip(q: number): number {
  const t = Math.min(1, Math.max(0, (Math.abs(q) - QA) / (QB - QA)));
  return -0.25 + 0.5 * t * t * (3 - 2 * t);
}

const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

/** Decode and resize off the main thread: the file is already in the HTTP cache. */
async function crop(t: Tile, w: number, h: number): Promise<ImageBitmap> {
  const [sx, sy, sw, sh] = t.s.map(Math.round);
  const blob = await (await fetch(t.src)).blob();
  return createImageBitmap(blob, sx, sy, sw, sh, {
    resizeWidth: Math.max(1, Math.round(w)),
    resizeHeight: Math.max(1, Math.round(h)),
    resizeQuality: "high",
  });
}

async function paint(face: FacePaint, w: number, h: number): Promise<HTMLCanvasElement> {
  const bitmaps = await Promise.all(face.tiles.map((t) => crop(t, t.d[2] * w, t.d[3] * h)));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = face.ground;
  ctx.fillRect(0, 0, w, h);
  face.tiles.forEach((t, i) => {
    ctx.drawImage(bitmaps[i], Math.round(t.d[0] * w), Math.round(t.d[1] * h));
    bitmaps[i].close();
  });
  return c;
}

/** Print the lens sheet's sheen over a screen (SHEEN_ROWS rows stretched down it) and round its corners. */
function finish(c: HTMLCanvasElement, sheen: HTMLCanvasElement, r: number) {
  const { width: w, height: h } = c;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(sheen, 0, 0, w, SHEEN_ROWS, 0, 0, w, h);
  // The corners are cut into the picture itself, so the card needs no clip while it turns. Only the four
  // corner squares are touched.
  if (!("roundRect" in ctx)) return;
  const k = Math.ceil(r);
  ctx.save();
  ctx.beginPath();
  for (const [x, y] of [[0, 0], [w - k, 0], [0, h - k], [w - k, h - k]]) ctx.rect(x, y, k, k);
  ctx.clip();
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.fill();
  ctx.restore();
}

export class LensPrint {
  private ctx: CanvasRenderingContext2D;
  private a: HTMLCanvasElement | null = null;
  private b: HTMLCanvasElement | null = null;
  private w = 0;
  private h = 0;
  private p = PITCH;
  /** Number of lenses across the card. */
  private n = 0;
  /** Per lens: how many device px of A it shows (0 = all B, its width = all A), as last drawn. NaN: not drawn. */
  private drawn = new Float32Array(0);
  private next = new Float32Array(0);
  /** One row: per device column, how much of A its lens shows (alpha). Stretched down the card as a mask. */
  private mask = document.createElement("canvas");
  private maskCtx = this.mask.getContext("2d")!;
  private maskData: ImageData | null = null;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  get ready() {
    return !!(this.a && this.b);
  }

  /** Paint both faces and the sheen at the card's device size. Call again after a resize. The old frame stays until the new one is ready. */
  async setup(faces: [FacePaint, FacePaint], cssW: number, cssH: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    const p = Math.max(2, Math.round(PITCH * dpr));
    // A carries the glints as seen flat; B the glints as seen at the second face, and the lens seams.
    // Each step gets its own frame, so painting a print never holds the page for long.
    const a = await paint(faces[0], w, h);
    await nextFrame();
    finish(a, sheen(w, p, dpr, cssW, cssH, 0, 0), RADIUS * dpr);
    await nextFrame();
    const b = await paint(faces[1], w, h);
    await nextFrame();
    finish(b, sheen(w, p, dpr, cssW, cssH, FACE_B_DEG, 1), RADIUS * dpr);
    await nextFrame();
    this.release();
    // Whole device pixels per lens (p above), so every strip edge but the moving cut falls on a pixel edge.
    const n = Math.ceil(w / p);
    Object.assign(this, { w, h, a, b, p, n });
    this.drawn = new Float32Array(n).fill(NaN);
    this.next = new Float32Array(n);
    this.mask.width = w;
    this.mask.height = 1;
    this.maskData = this.maskCtx.createImageData(w, 1);
    this.canvas.width = w;
    this.canvas.height = h;
  }

  release() {
    for (const c of [this.a, this.b]) if (c) c.width = c.height = 0;
    this.a = this.b = null;
  }

  /**
   * Draw the card as seen at a tilt of `deg` degrees about its vertical axis.
   * Each lens shows the end of A's strip, then the start of B's. Only lenses whose cut moved since the last
   * frame are drawn again: at any angle the sweep is a band across part of the card, and every lens outside it
   * already shows the right screen. A band is three plain blits: B, then a one-row mask stretched down the band
   * cuts out the columns that show A (the cut's own column partly), then A fills in behind. No clip path: a
   * clip of a hundred thin rectangles costs more than the pictures.
   */
  render(deg: number) {
    const { a, b, w, p, n, drawn, next } = this;
    if (!a || !b || !n) return;
    const turn = deg / FACE_B_DEG;
    for (let i = 0; i < n; i++) {
      const x0 = i * p;
      const width = Math.min(p, w - x0);
      const u = (x0 + width / 2) / w;
      const o = strip(REACH * turn + SPREAD * u);
      // Device px of A at the lens's left; an eighth of a pixel is finer than the eye can see move.
      next[i] = Math.round((0.5 - 2 * o) * width * 8) / 8;
    }
    // Bands of lenses that changed; gaps of a lens or two are drawn too, so a band is one set of blits.
    let i = 0;
    while (i < n) {
      if (next[i] === drawn[i]) {
        i++;
        continue;
      }
      let end = i + 1;
      for (let j = i + 1; j < n && j <= end + 2; j++) if (next[j] !== drawn[j]) end = j + 1;
      this.band(a, b, i, end);
      for (let j = i; j < end; j++) drawn[j] = next[j];
      i = end;
    }
  }

  /** Draw lenses [from, to) at their `next` cut. */
  private band(a: HTMLCanvasElement, b: HTMLCanvasElement, from: number, to: number) {
    const { ctx, w, h, p, next, mask, maskCtx, maskData } = this;
    if (!maskData) return;
    const xa = from * p;
    const xb = Math.min(w, to * p);
    const bw = xb - xa;
    let allA = true;
    let allB = true;
    for (let i = from; i < to; i++) {
      const width = Math.min(p, w - i * p);
      if (next[i] < width) allA = false;
      if (next[i] > 0) allB = false;
    }
    if (allA || allB) {
      ctx.drawImage(allA ? a : b, xa, 0, bw, h, xa, 0, bw, h);
      return;
    }
    const m = maskData.data;
    for (let i = from; i < to; i++) {
      const x0 = i * p;
      const width = Math.min(p, w - x0);
      const c = next[i];
      // A covers the columns left of the cut; the cut's own column is shared.
      for (let q = 0; q < width; q++) m[(x0 + q) * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, c - q)));
    }
    maskCtx.putImageData(maskData, 0, 0, xa, 0, bw, 1);
    ctx.drawImage(b, xa, 0, bw, h, xa, 0, bw, h);
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mask, xa, 0, bw, 1, xa, 0, bw, h);
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(a, xa, 0, bw, h, xa, 0, bw, h);
    ctx.globalCompositeOperation = "source-over";
  }
}

/**
 * The lens sheet's sheen for a card turned `deg` degrees: the lamp's reflection in each lens (thin white glints)
 * and, by `seams` (0 to 1), the dark seams between lenses. SHEEN_ROWS rows, to be stretched down the screen.
 */
function sheen(w: number, p: number, dpr: number, W: number, H: number, deg: number, seams: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = SHEEN_ROWS;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, SHEEN_ROWS);
  const px = new Uint32Array(img.data.buffer);
  const seamCol = Float32Array.from({ length: w }, (_, x) => {
    const k = Math.abs(2 * (((x + 0.5) % p) / p - 0.5));
    return seams * SEAM * k * k * k;
  });
  const th = (deg * Math.PI) / 180;
  const sin = Math.sin(th);
  const cos = Math.cos(th);
  // Lamp above and to the left of the viewer, in world space around the card's centre; the eye a little to
  // the left of the card's centre.
  const Lx = -0.12 * W;
  const Ly = -0.7 * H;
  const Lz = 1.2 * W;
  const eyeX = -0.2 * W;
  // World to card space (inverse of the card's rotation about y).
  const lx = Lx * cos - Lz * sin;
  const lz = Lx * sin + Lz * cos;
  const ex = eyeX * cos - EYE * sin;
  const ez = eyeX * sin + EYE * cos;
  const sn = Float32Array.from({ length: p }, (_, x1) => Math.sin(2 * ((x1 + 0.5) / p - 0.5) * LENS_EDGE));
  const cs = Float32Array.from({ length: p }, (_, x1) => Math.cos(2 * ((x1 + 0.5) / p - 0.5) * LENS_EDGE));
  for (let r = 0; r < SHEEN_ROWS; r++) {
    const y = ((r + 0.5) / SHEEN_ROWS - 0.5) * H;
    for (let x0 = 0; x0 < w; x0 += p) {
      const width = Math.min(p, w - x0);
      const x = (x0 + width / 2) / dpr - W / 2;
      // Unit vectors to the eye and to the lamp, and their half vector.
      let vx = ex - x, vy = -y, vz = ez;
      let n = 1 / Math.sqrt(vx * vx + vy * vy + vz * vz);
      vx *= n; vy *= n; vz *= n;
      let mx = lx - x, my = Ly - y, mz = lz;
      n = 1 / Math.sqrt(mx * mx + my * my + mz * mz);
      mx *= n; my *= n; mz *= n;
      let hx = vx + mx;
      const hy = vy + my;
      let hz = vz + mz;
      n = 1 / Math.sqrt(hx * hx + hy * hy + hz * hz);
      hx *= n; hz *= n;
      for (let x1 = 0; x1 < width; x1++) {
        const d = sn[x1] * hx + cs[x1] * hz;
        let glint = 0;
        if (d > 0.96) {
          // d^120 by squaring: d^64 · d^32 · d^16 · d^8.
          const d8 = (d * d * (d * d)) ** 2;
          const d16 = d8 * d8;
          const d32 = d16 * d16;
          glint = GLINT * d32 * d32 * d32 * d16 * d8;
        }
        const shade = seamCol[x0 + x1];
        px[r * w + x0 + x1] = glint >= shade ? WHITE | (((255 * glint + 0.5) | 0) << ALPHA) : ((255 * shade + 0.5) | 0) << ALPHA;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
