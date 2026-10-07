/**
 * A lenticular print, computed.
 *
 * The print under the lens sheet holds two screens, A and B, cut into strips half a lens wide and
 * interlaced. Each cylindrical lens (vertical, PITCH css px wide) magnifies two times, so a viewer
 * straight in front sees whole strips of one screen at full resolution. The angle from the eye to a
 * lens picks which strip it magnifies. That angle depends on the card's tilt and on how far the lens
 * sits from the card's centre, so when the card turns, the switch sweeps across it from the edge that
 * turns away. The sheen is a lamp's reflection in each lens's curved surface.
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
/** Specular exponent of the lens plastic. */
const SHINE = 120;
/** Brightest glint and darkest lens seam, as alpha. */
const GLINT = 0.15;
const SEAM = 0.06;
/** Rows of the sheen grid; it is stretched to the card height. */
const SHEEN_ROWS = 14;

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

export class LensPrint {
  private ctx: CanvasRenderingContext2D;
  private a: HTMLCanvasElement | null = null;
  private b: HTMLCanvasElement | null = null;
  /** The lens sheet's sheen lives on its own small canvas (w × SHEEN_ROWS), stretched by CSS over the card. */
  private sheen: HTMLCanvasElement;
  private sheenCtx: CanvasRenderingContext2D;
  private sheenData: ImageData | null = null;
  private sheenTh = NaN;
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private p = PITCH;
  /** Number of lenses across the card. */
  private n = 0;
  /** Per lens: how many device px of A it shows (0 = all B, its width = all A), as last drawn. NaN: not drawn. */
  private drawn = new Float32Array(0);
  private next = new Float32Array(0);
  /** The eye's sideways offset from the card's centre for the glints, CSS px (negative: to the left). */
  private eyeX = 0;
  /** sin and cos of the lens surface angle at each device column inside a lens. */
  private lensTrig: (readonly [number, number])[] = [];
  /** Per device column, how dark the lens seam is (only drawn while the card is turned). */
  private seamCol = new Float32Array(0);

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, sheen: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.sheen = sheen;
    this.sheenCtx = sheen.getContext("2d")!;
  }

  get ready() {
    return !!(this.a && this.b);
  }

  /** Paint both faces at the card's device size. Call again after a resize. The old frame stays until the new one is ready. */
  async setup(faces: [FacePaint, FacePaint], cssW: number, cssH: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    // One face per frame, so painting a print never holds the page for long.
    const a = await paint(faces[0], w, h);
    await nextFrame();
    const b = await paint(faces[1], w, h);
    await nextFrame();
    this.release();
    // Whole device pixels per lens, so every strip edge but the moving cut falls on a pixel edge.
    const p = Math.max(2, Math.round(PITCH * dpr));
    const n = Math.ceil(w / p);
    Object.assign(this, { dpr, cssW, cssH, w, h, a, b, p, n, eyeX: -0.2 * cssW });
    this.drawn = new Float32Array(n).fill(NaN);
    this.next = new Float32Array(n);
    this.canvas.width = w;
    this.canvas.height = h;
    this.sheen.width = w;
    this.sheen.height = SHEEN_ROWS;
    this.sheenData = this.sheenCtx.createImageData(w, SHEEN_ROWS);
    this.sheenTh = NaN;
    this.seamCol = Float32Array.from({ length: w }, (_, x) => {
      const k = Math.abs(2 * (((x + 0.5) % p) / p - 0.5));
      return SEAM * k * k * k;
    });
    this.lensTrig = Array.from({ length: p }, (_, x1) => {
      const phi = 2 * ((x1 + 0.5) / p - 0.5) * LENS_EDGE;
      return [Math.sin(phi), Math.cos(phi)] as const;
    });
  }

  release() {
    for (const c of [this.a, this.b]) if (c) c.width = c.height = 0;
    this.a = this.b = null;
  }

  /**
   * Draw the card as seen at a tilt of `deg` degrees about its vertical axis.
   * Each lens shows the end of A's strip, then the start of B's. Only lenses whose cut moved since the last
   * frame are drawn again: at any angle the sweep is a band across part of the card, and every lens outside it
   * already shows the right screen. Each band costs two blits: A over the band, then B through a clip of the
   * columns its lenses show (the cut's own column antialiased by the clip).
   */
  render(deg: number) {
    const { a, b, w, p, n, drawn, next } = this;
    if (!a || !b || !n || (globalThis as any).__lxNORENDER) return;
    const turn = deg / FACE_B_DEG;
    for (let i = 0; i < n; i++) {
      const x0 = i * p;
      const width = Math.min(p, w - x0);
      const u = (x0 + width / 2) / w;
      const o = strip(REACH * turn + SPREAD * u);
      // Device px of A at the lens's left; an eighth of a pixel is finer than the eye can see move.
      next[i] = (globalThis as any).__lxNOAA ? Math.round((0.5 - 2 * o) * width) : Math.round((0.5 - 2 * o) * width * 8) / 8;
    }
    // Bands of lenses that changed; gaps of a lens or two are drawn too, so a band is one pair of blits.
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
    const th = (deg * Math.PI) / 180;
    if (th !== this.sheenTh && !(globalThis as any).__lxNOSHEEN) this.drawSheen(th);
  }

  /** Draw lenses [from, to) at their `next` cut. */
  private band(a: HTMLCanvasElement, b: HTMLCanvasElement, from: number, to: number) {
    const { ctx, w, h, p, next } = this;
    const xa = from * p;
    const xb = Math.min(w, to * p);
    let allA = true;
    let allB = true;
    for (let i = from; i < to; i++) {
      const width = Math.min(p, w - i * p);
      if (next[i] < width) allA = false;
      if (next[i] > 0) allB = false;
    }
    if (allB) {
      ctx.drawImage(b, xa, 0, xb - xa, h, xa, 0, xb - xa, h);
      return;
    }
    ctx.drawImage(a, xa, 0, xb - xa, h, xa, 0, xb - xa, h);
    if (allA || (globalThis as any).__lxNOB) return;
    ctx.save();
    ctx.beginPath();
    for (let i = from; i < to; i++) {
      const x0 = i * p;
      const width = Math.min(p, w - x0);
      const c = next[i];
      if (c < width) ctx.rect(x0 + c, 0, width - c, h);
    }
    ctx.clip();
    ctx.drawImage(b, xa, 0, xb - xa, h, xa, 0, xb - xa, h);
    ctx.restore();
  }

  /** Lamp reflection in each lens: a band of thin glints that slides as the card turns. */
  private drawSheen(th: number) {
    const { w, p, sheenData } = this;
    if (!sheenData) return;
    this.sheenTh = th;
    // Seams show while the card is turned; flat, the lens sheet reads only as its glints and the edge band.
    // Glints (white) and seams (dark) share one overlay, so the lens costs one more blit, not two.
    const seamAlpha = Math.min(1, Math.abs(th) / (4 * (Math.PI / 180)));
    const seamCol = this.seamCol;
    const sin = Math.sin(th);
    const cos = Math.cos(th);
    const W = this.cssW;
    const H = this.cssH;
    // Lamp above and to the left of the viewer, in world space around the card's centre.
    const Lx = -0.12 * W;
    const Ly = -0.7 * H;
    const Lz = 1.2 * W;
    // World to card space (inverse of the card's rotation about y).
    const lx = Lx * cos - Lz * sin;
    const lz = Lx * sin + Lz * cos;
    const ex = this.eyeX * cos - EYE * sin;
    const ez = this.eyeX * sin + EYE * cos;
    const data = sheenData.data;
    const lenses = Math.ceil(w / p);
    for (let r = 0; r < SHEEN_ROWS; r++) {
      const y = ((r + 0.5) / SHEEN_ROWS - 0.5) * H;
      for (let i = 0; i < lenses; i++) {
        const x0 = i * p;
        const width = Math.min(p, w - x0);
        const x = (x0 + width / 2) / this.dpr - W / 2;
        // Unit vectors to the eye and to the lamp, and their half vector.
        let vx = ex - x, vy = -y, vz = ez;
        let n = Math.hypot(vx, vy, vz);
        vx /= n; vy /= n; vz /= n;
        let mx = lx - x, my = Ly - y, mz = lz;
        n = Math.hypot(mx, my, mz);
        mx /= n; my /= n; mz /= n;
        let hx = vx + mx, hy = vy + my, hz = vz + mz;
        n = Math.hypot(hx, hy, hz);
        hx /= n; hy /= n; hz /= n;
        const trig = this.lensTrig;
        for (let x1 = 0; x1 < width; x1++) {
          const [sn, cs] = trig[x1];
          const d = sn * hx + cs * hz;
          const k = (r * w + x0 + x1) * 4;
          const glint = d > 0.96 ? GLINT * Math.pow(d, SHINE) : 0;
          const shade = seamAlpha * seamCol[x0 + x1];
          if (glint >= shade) {
            data[k] = data[k + 1] = data[k + 2] = 255;
            data[k + 3] = Math.round(255 * glint);
          } else {
            data[k] = data[k + 1] = data[k + 2] = 0;
            data[k + 3] = Math.round(255 * shade);
          }
        }
      }
    }
    // The compositor stretches the 14 rows over the card: no full-size blit on the main thread.
    this.sheenCtx.putImageData(sheenData, 0, 0);
  }
}
