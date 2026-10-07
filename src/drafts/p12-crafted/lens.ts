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
/** Eye distance from the card, CSS pixels (about 2 m at 96 dpi). The CSS perspective uses it too. */
export const EYE = 8000;
/** |tan α| below QA shows only A; above QB only B (the lens's focal spot is narrower than a strip). */
const QA = 0.07;
const QB = 0.1;
/**
 * The eye sits a little to the left of each card, so at rest the card's right edge is seen just inside
 * the switch: a still shows a thin band of the second screen's strips there, at most 120px or 12% of
 * the card wide, so the work itself stays clear.
 */
const cueFor = (cssW: number) => QA + Math.min(120, 0.12 * cssW) / EYE;
/** The resting tilt that shows B everywhere on the card (a hero card 980px wide needs about 8°). */
export const FACE_B_DEG = 9;
/** Past this tilt the label follows the second face. */
export const FLIP_DEG = FACE_B_DEG / 2;

/** Lens surface: steepest slope at its edge, degrees. */
const LENS_EDGE = 10 * (Math.PI / 180);
/** Specular exponent of the lens plastic. */
const SHINE = 120;
/** Brightest glint and darkest lens seam, as alpha. */
const GLINT = 0.15;
const SEAM = 0.06;
/** Rows of the sheen grid; it is stretched to the card height. */
const SHEEN_ROWS = 28;

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
  private seam: HTMLCanvasElement | null = null;
  private sheen = document.createElement("canvas");
  private sheenCtx = this.sheen.getContext("2d")!;
  private sheenData: ImageData | null = null;
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private p = PITCH;
  /** The eye's sideways offset from the card's centre, CSS px (negative: to the left). */
  private eyeX = 0;
  /** sin and cos of the lens surface angle at each device column inside a lens. */
  private lensTrig: (readonly [number, number])[] = [];

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  get ready() {
    return !!(this.a && this.b);
  }

  /** Paint both faces at the card's device size. Call again after a resize. The old frame stays until the new one is ready. */
  async setup(faces: [FacePaint, FacePaint], cssW: number, cssH: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    const [a, b] = await Promise.all([paint(faces[0], w, h), paint(faces[1], w, h)]);
    this.release();
    Object.assign(this, { dpr, cssW, cssH, w, h, a, b, p: PITCH * dpr, eyeX: cssW / 2 - cueFor(cssW) * EYE });
    this.canvas.width = w;
    this.canvas.height = h;
    this.sheen.width = w;
    this.sheen.height = SHEEN_ROWS;
    this.sheenData = this.sheenCtx.createImageData(w, SHEEN_ROWS);
    this.seam = this.paintSeams();
    this.lensTrig = Array.from({ length: Math.ceil(this.p) }, (_, x1) => {
      const phi = 2 * ((x1 + 0.5) / this.p - 0.5) * LENS_EDGE;
      return [Math.sin(phi), Math.cos(phi)] as const;
    });
  }

  release() {
    for (const c of [this.a, this.b, this.seam]) if (c) c.width = c.height = 0;
    this.a = this.b = this.seam = null;
  }

  /** The lens seams: each lens is a little darker where its surface turns steep. */
  private paintSeams() {
    const c = document.createElement("canvas");
    c.width = this.w;
    c.height = 1;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(this.w, 1);
    for (let x = 0; x < this.w; x++) {
      const u = ((x + 0.5) % this.p) / this.p - 0.5;
      const k = Math.abs(2 * u);
      img.data[x * 4 + 3] = Math.round(255 * SEAM * k * k * k);
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  /** Draw the card as seen at a tilt of `deg` degrees about its vertical axis. */
  render(deg: number) {
    const { ctx, a, b, w, h, p } = this;
    if (!a || !b) return;
    const th = (deg * Math.PI) / 180;
    const sin = Math.sin(th);
    const cos = Math.cos(th);
    const lenses = Math.ceil(w / p);
    let runFrom = 0;
    let runFace: HTMLCanvasElement | null = null;
    const flush = (to: number) => {
      if (runFace && to > runFrom) ctx.drawImage(runFace, runFrom, 0, to - runFrom, h, runFrom, 0, to - runFrom, h);
    };
    for (let i = 0; i < lenses; i++) {
      const x0 = i * p;
      const width = Math.min(p, w - x0);
      // The lens centre, in CSS px from the card's centre; tan of the angle from the lens to the eye.
      const xc = (x0 + width / 2) / this.dpr - this.cssW / 2;
      const q = (xc + EYE * sin - this.eyeX * cos) / (EYE * cos + this.eyeX * sin);
      const o = strip(q);
      const pure = o <= -0.2499 ? a : o >= 0.2499 ? b : null;
      if (pure) {
        if (pure !== runFace) {
          flush(x0);
          runFrom = x0;
          runFace = pure;
        }
        continue;
      }
      flush(x0);
      runFace = null;
      // A split lens: the end of A's strip, then the start of B's strip.
      const cut = (0.5 - 2 * o) * width;
      if (cut > 0.01) ctx.drawImage(a, x0 + (2 * o + 0.5) * width, 0, cut, h, x0, 0, cut, h);
      if (width - cut > 0.01) ctx.drawImage(b, x0, 0, width - cut, h, x0 + cut, 0, width - cut, h);
    }
    flush(w);
    this.drawSheen(th);
  }

  /** Lamp reflection in each lens: a band of thin glints that slides as the card turns. */
  private drawSheen(th: number) {
    const { ctx, w, h, p, sheenData, seam } = this;
    if (!sheenData || !seam) return;
    // Seams show while the card is turned; flat, the lens sheet reads only as its glints and the edge band.
    const seamAlpha = Math.min(1, Math.abs(th) / (4 * (Math.PI / 180)));
    if (seamAlpha > 0.02) {
      ctx.globalAlpha = seamAlpha;
      ctx.drawImage(seam, 0, 0, w, 1, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }
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
          const [sn, cs] = trig[x1] ?? trig[trig.length - 1];
          const d = sn * hx + cs * hz;
          const k = (r * w + x0 + x1) * 4;
          data[k] = data[k + 1] = data[k + 2] = 255;
          data[k + 3] = d > 0.96 ? Math.round(255 * GLINT * Math.pow(d, SHINE)) : 0;
        }
      }
    }
    this.sheenCtx.putImageData(sheenData, 0, 0);
    ctx.drawImage(this.sheen, 0, 0, w, SHEEN_ROWS, 0, 0, w, h);
  }
}
