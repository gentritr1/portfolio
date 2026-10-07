
/** Every miniature draws in a 160 × 48 space; the scheduler scales it to the device pixels of its box. */
export const W = 160;
export const H = 48;
const INK = "#15130f";
const PAPER = "#fff4ea";

type C = CanvasRenderingContext2D;
interface Frame {
  c: C;
  col: string;
  t: number;
}
type Draw = (frame: Frame) => void;

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const out = (p: number) => 1 - (1 - clamp(p)) ** 3;
const io = (p: number) => {
  const v = clamp(p);
  return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
};
const hash = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};
function rect(c: C, x: number, y: number, w: number, h: number, fill: string) {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
}
function round(
  c: C,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string,
  stroke?: string,
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.stroke();
  }
}
function dot(c: C, x: number, y: number, r: number, fill: string) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}
function ring(c: C, x: number, y: number, r: number, stroke: string) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.strokeStyle = stroke;
  c.stroke();
}
function label(
  c: C,
  value: string,
  x: number,
  y: number,
  fill: string,
  size = 10,
  align: CanvasTextAlign = "left",
) {
  c.font = `600 ${size}px "Ledger Mono", ui-monospace, monospace`;
  c.textAlign = align;
  c.fillStyle = fill;
  c.fillText(value, x, y);
}
function chip(
  c: C,
  value: string,
  x: number,
  y: number,
  col: string,
  filled: boolean,
) {
  c.font = '600 10px "Ledger Mono", ui-monospace, monospace';
  const w = Math.ceil(c.measureText(value).width) + 10;
  c.lineWidth = 1;
  if (filled) round(c, x, y, w, 12, 6, col);
  else round(c, x + 0.5, y + 0.5, w - 1, 11, 5.5, undefined, col);
  label(c, value, x + w / 2, y + 9, filled ? INK : col, 10, "center");
  return w;
}
function faded(c: C, alpha: number, paint: () => void) {
  const previous = c.globalAlpha;
  c.globalAlpha = previous * alpha;
  paint();
  c.globalAlpha = previous;
}
function star(c: C, x: number, y: number, r: number, fill: string) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
  }
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}
function heart(c: C, x: number, y: number, s: number, fill: string) {
  c.beginPath();
  c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.4, y, x - s * 0.6, y - s * 0.9, x, y - s * 0.2);
  c.bezierCurveTo(x + s * 0.6, y - s * 0.9, x + s * 1.4, y, x, y + s * 0.9);
  c.fillStyle = fill;
  c.fill();
}
function textLines(
  c: C,
  x: number,
  y: number,
  count: number,
  width: number,
  gap: number,
  fill: string,
  seed = 0,
) {
  for (let i = 0; i < count; i++)
    rect(c, x, y + i * gap, width * (0.62 + 0.38 * hash(seed + i)), 1.5, fill);
}

const queries: Draw = ({ c, col, t }) => {
  const p = (t % 4.8) / 4.8;
  const k = p < 0.9 ? io((p - 0.28) / 0.36) : 1 - io((p - 0.9) / 0.1);
  for (let i = 0; i < 16; i++) {
    const group = i < 8 ? 0 : 1;
    const x = lerp(8 + i * 5, 10 + group * 24, k);
    const h = lerp(16 + hash(i) * 16, 30, k);
    rect(c, x, 40 - h, lerp(2, 18, k), h, col);
  }
  label(c, String(Math.round(lerp(16, 2, k))).padStart(2, "0"), 98, 30, col, 20);
  faded(c, 0.72, () => label(c, "QUERIES", 98, 42, PAPER));
};

const tokens: Draw = ({ c, col, t }) => {
  const active = Math.floor(t / 1.2) % 3;
  const k = out(((t / 1.2) % 1) * 3);
  const swatches = [col, PAPER, "#8a8580"];
  swatches.forEach((fill, i) => {
    rect(c, 8, 6 + i * 13, 14, 10, fill);
    if (i === active) {
      c.lineWidth = 1;
      c.strokeStyle = col;
      c.strokeRect(5.5, 3.5 + i * 13, 19, 15);
    }
  });
  c.setLineDash([3, 3]);
  c.lineDashOffset = -t * 18;
  c.lineWidth = 1.5;
  c.strokeStyle = col;
  c.beginPath();
  c.moveTo(30, 24);
  c.lineTo(68, 24);
  c.stroke();
  c.setLineDash([]);
  c.beginPath();
  c.moveTo(66, 20);
  c.lineTo(71, 24);
  c.lineTo(66, 28);
  c.stroke();
  c.lineWidth = 1;
  faded(c, 0.4, () => round(c, 78.5, 5.5, 74, 37, 3, undefined, PAPER));
  rect(c, 85, 12, 38, 3, PAPER);
  faded(c, 0.5, () => textLines(c, 85, 19, 2, 54, 4, PAPER, 3));
  const fill = swatches[active];
  round(c, 85, 30, 30, 8, 2, swatches[(active + 2) % 3]);
  faded(c, k, () => round(c, 85, 30, 30, 8, 2, fill));
};

const calls: Draw = ({ c, col, t }) => {
  const s = t / 1.6;
  const base = Math.floor(s);
  const k = io((s - base) * 2);
  for (let i = 0; i < 12; i++) {
    const h = lerp(6 + hash(i * 7 + base) * 26, 6 + hash(i * 7 + base + 1) * 26, k);
    rect(c, 8 + i * 12, 42 - h, 7, h, i === Math.floor(t * 1.5) % 12 ? PAPER : col);
  }
  faded(c, 0.35, () => rect(c, 6, 43, 148, 1, PAPER));
  const cursor = Math.floor(t * 1.5) % 12;
  const value = Math.round(
    lerp(6 + hash(cursor * 7 + base) * 26, 6 + hash(cursor * 7 + base + 1) * 26, k) / 2,
  );
  const x = Math.min(124, Math.max(4, 8 + cursor * 12 - 8));
  rect(c, x, 2, 26, 12, PAPER);
  label(c, String(value), x + 13, 11.5, INK, 10, "center");
};

const stream: Draw = ({ c, col, t }) => {
  faded(c, 0.16, () => rect(c, 6, 6, 74, 36, col));
  const badge = chip(c, "LIVE", 10, 10, col, true);
  faded(c, 0.5 + 0.5 * Math.sin(t * 5), () => dot(c, 16 + badge, 16, 2.5, col));
  faded(c, 0.4, () => rect(c, 10, 36, 66, 2, PAPER));
  rect(c, 10, 36, 66 * ((t * 0.05) % 1), 2, col);
  c.save();
  c.beginPath();
  c.rect(86, 4, 70, 40);
  c.clip();
  const m = t / 1.1;
  const newest = Math.floor(m);
  const lift = (1 - out((m - newest) / 0.3)) * 8;
  for (let j = 0; j < 6; j++) {
    const n = newest - j;
    const y = 39 - j * 7 + lift;
    const w = 22 + hash(n) * 38;
    const rtl = hash(n * 3) > 0.62;
    const x = rtl ? 154 - w : 88;
    rect(c, rtl ? 154 - 4 : 88, y - 1, 4, 4, col);
    faded(c, j === 0 ? 1 : 0.72, () =>
      rect(c, rtl ? x - 6 : x + 6, y, w - 6, 2, j === 0 ? col : PAPER),
    );
  }
  c.restore();
};

const institute: Draw = ({ c, col, t }) => {
  c.lineWidth = 1;
  faded(c, 0.35, () => round(c, 6.5, 3.5, 147, 41, 3, undefined, PAPER));
  c.save();
  c.beginPath();
  c.rect(7, 4, 146, 40);
  c.clip();
  const scroll = (t * 9) % 150;
  for (const offset of [0, 150]) {
    const y0 = 4 - scroll + offset;
    rect(c, 14, y0 + 7, 66, 4, PAPER);
    rect(c, 14, y0 + 14, 46, 4, PAPER);
    round(c, 14, y0 + 23, 32, 8, 4, col);
    faded(c, 0.35, () => rect(c, 98, y0 + 5, 48, 28, col));
    for (let i = 0; i < 3; i++) {
      ring(c, 34 + i * 46, y0 + 50, 6, col);
      faded(c, 0.5, () => rect(c, 24 + i * 46, y0 + 61, 20, 1.5, PAPER));
    }
    for (let i = 0; i < 3; i++)
      faded(c, 0.25 + i * 0.12, () => rect(c, 14 + i * 46, y0 + 72, 40, 22, col));
    for (let i = 0; i < 4; i++) {
      faded(c, 0.5, () => rect(c, 14, y0 + 104 + i * 9, 100, 1.5, PAPER));
      rect(c, 138, y0 + 103 + i * 9, 5, 1.5, col);
      rect(c, 139.75, y0 + 101.25 + i * 9, 1.5, 5, col);
    }
  }
  c.restore();
};

const reader: Draw = ({ c, col, t }) => {
  const period = 2.4;
  const flips = Math.floor(t / period);
  const p = (t % period) / period;
  const a = io((p - 0.25) / 0.5);
  rect(c, 22, 6, 46, 32, PAPER);
  rect(c, 68, 6, 46, 32, PAPER);
  faded(c, 0.65, () => {
    textLines(c, 27, 12, 5, 36, 5, INK, flips);
    textLines(c, 73, 12, 5, 36, 5, INK, flips + 1);
  });
  rect(c, 67.5, 6, 1, 32, "#c9bfb4");
  if (a > 0 && a < 1) {
    const w = 46 * Math.cos(a * Math.PI);
    const x = w >= 0 ? 68 : 68 + w;
    rect(c, x, 6, Math.abs(w), 32, PAPER);
    faded(c, 0.22 + 0.3 * Math.sin(a * Math.PI), () => rect(c, x, 6, Math.abs(w), 32, col));
  }
  faded(c, 0.3, () => rect(c, 22, 42, 92, 2, PAPER));
  rect(c, 22, 42, 92 * (((flips % 10) + a) / 10), 2, col);
  const streak = flips % 9;
  for (let i = 0; i < 8; i++) {
    const x = 126 + (i % 4) * 7.5;
    const y = 16 + Math.floor(i / 4) * 12;
    c.beginPath();
    c.ellipse(x, y, 2.6, 3.6, 0, 0, Math.PI * 2);
    c.lineWidth = 1;
    if (i < streak) {
      c.fillStyle = col;
      c.fill();
    } else {
      c.strokeStyle = col;
      faded(c, 0.55, () => c.stroke());
    }
  }
};

const grocery: Draw = ({ c, col, t }) => {
  const slot = Math.floor(t / 1.4) % 5;
  c.lineWidth = 1;
  ["09", "11", "13", "15", "17"].forEach((hour, i) => {
    const x = 6 + i * 22;
    if (i === slot) round(c, x, 3, 20, 13, 3, col);
    else faded(c, 0.45, () => round(c, x + 0.5, 3.5, 19, 12, 3, undefined, PAPER));
    label(c, hour, x + 10, 13, i === slot ? INK : PAPER, 10, "center");
  });
  c.lineWidth = 1.5;
  c.strokeStyle = col;
  c.beginPath();
  c.moveTo(112, 22);
  c.lineTo(118, 22);
  c.lineTo(124, 38);
  c.lineTo(146, 38);
  c.lineTo(151, 26);
  c.lineTo(120, 26);
  c.stroke();
  dot(c, 128, 43, 2.2, col);
  dot(c, 143, 43, 2.2, col);
  const p = (t % 1.4) / 1.4;
  const count = (Math.floor(t / 1.4) % 9) + 1;
  const x = lerp(14, 134, out(p));
  const y = 36 - Math.sin(clamp(p) * Math.PI) * 16;
  if (p < 0.95) {
    dot(c, x, y, 4, count % 2 ? col : PAPER);
    rect(c, x - 0.5, y - 7, 1.5, 3, col);
  }
  dot(c, 152, 20, 6.5, PAPER);
  label(c, String(count), 152, 23.5, INK, 10, "center");
};

const books: Draw = ({ c, col, t }) => {
  const spines = 13;
  const chosen = Math.floor(t / 2.2) % spines;
  const p = (t % 2.2) / 2.2;
  const lift = p < 0.7 ? out(p * 3) : 1 - io((p - 0.7) / 0.3);
  faded(c, 0.5, () => rect(c, 4, 42, 152, 1.5, PAPER));
  let x = 8;
  const placed: Array<[number, number, number]> = [];
  for (let i = 0; i < spines; i++) {
    const w = 6 + Math.round(hash(i) * 4);
    const h = 18 + Math.round(hash(i + 20) * 12);
    placed.push([x, w, h]);
    if (i !== chosen) {
      const tone = i % 3 === 0 ? PAPER : col;
      faded(c, i % 3 === 1 ? 0.55 : 1, () => rect(c, x, 42 - h, w, h, tone));
    }
    x += w + 3;
  }
  const [bx, bw, bh] = placed[chosen];
  const width = lerp(bw, 24, lift);
  const left = bx + bw / 2 - width / 2;
  const top = 42 - bh - lift * 4;
  rect(c, left, top, width, bh, col);
  faded(c, lift, () => {
    rect(c, left + 3, top + 4, width - 6, 2, INK);
    rect(c, left + 3, top + 9, (width - 6) * 0.6, 1.5, INK);
  });
  faded(c, clamp((lift - 0.6) / 0.4), () =>
    heart(c, left + width + 7, top + 4, 3.5 + lift, col),
  );
};

const chat: Draw = ({ c, col, t }) => {
  const p = t % 5;
  if (p < 1.2) {
    round(c, 6, 4, 28, 13, 6, PAPER);
    for (let i = 0; i < 3; i++)
      dot(c, 13 + i * 7, 10.5 - Math.max(0, Math.sin(t * 9 - i * 0.9)) * 2, 1.8, INK);
  } else {
    const w = 30 + 60 * out((p - 1.2) / 0.4);
    round(c, 6, 4, w, 13, 6, PAPER);
    faded(c, 0.7, () => rect(c, 12, 9.5, w - 16, 1.5, INK));
  }
  if (p > 2) {
    c.font = '600 10px "Ledger Mono", ui-monospace, monospace';
    const yes = Math.ceil(c.measureText("YES").width) + 10;
    const show = out((p - 2) / 0.3);
    const move = io((p - 3.6) / 0.4);
    faded(c, p > 3.6 ? 1 - move : show, () => chip(c, "LATER", 62 + yes + 6, 22, col, false));
    faded(c, show, () =>
      chip(c, "YES", lerp(62, 154 - yes, move), lerp(22, 33, move), col, p > 3.2),
    );
  }
};

const queue: Draw = ({ c, col, t }) => {
  round(c, 6, 4, 22, 13, 2, col);
  label(c, "TS", 17, 13.5, INK, 10, "center");
  c.lineWidth = 1;
  faded(c, 0.35, () => rect(c, 6, 37, 108, 1, PAPER));
  round(c, 118.5, 8.5, 36, 32, 3, undefined, col);
  const s = t / 0.8;
  const step = Math.floor(s);
  const shift = io(((s - step) * 0.8) / 0.3) * 18;
  for (let j = 0; j < 7; j++) {
    const n = step - j;
    const x = 4 + (6 - j) * 18 + shift - 18;
    if (x > 116 || x < -14) continue;
    const duplicate = hash(n * 5) > 0.78;
    const drop = duplicate && x > 86 ? (x - 86) * 0.9 : 0;
    faded(c, duplicate ? Math.max(0, 1 - drop / 14) : 1, () => {
      if (duplicate) c.setLineDash([2, 2]);
      round(c, x + 0.5, 22.5 + drop, 14, 12, 2, undefined, duplicate ? PAPER : col);
      c.setLineDash([]);
      const kind = Math.floor(hash(n) * 4);
      const cx = x + 7.5;
      const cy = 28.5 + drop;
      if (kind === 0) rect(c, cx - 3, cy - 0.75, 6, 1.5, col);
      else if (kind === 1) {
        c.beginPath();
        c.moveTo(cx - 2, cy - 3);
        c.lineTo(cx + 3, cy);
        c.lineTo(cx - 2, cy + 3);
        c.fillStyle = col;
        c.fill();
      } else if (kind === 2) star(c, cx, cy, 3.5, col);
      else {
        ring(c, cx, cy, 3, col);
        rect(c, cx - 0.5, cy - 2, 1, 2.5, col);
      }
    });
  }
  const stacked = (step % 4) + 1;
  for (let i = 0; i < stacked; i++) rect(c, 123, 34 - i * 6, 14 + hash(step - i) * 12, 3, col);
};

const epub: Draw = ({ c, col, t }) => {
  const download = out((t % 6) / 1.4);
  c.lineWidth = 1.5;
  c.strokeStyle = col;
  c.beginPath();
  c.moveTo(9, 24);
  c.lineTo(9, 30);
  c.lineTo(29, 30);
  c.lineTo(29, 24);
  c.stroke();
  const arrow = 6 + (download < 1 ? ((t * 14) % 10) : 8);
  c.beginPath();
  c.moveTo(19, 6);
  c.lineTo(19, arrow + 8);
  c.moveTo(15, arrow + 4);
  c.lineTo(19, arrow + 8);
  c.lineTo(23, arrow + 4);
  c.stroke();
  faded(c, 0.35, () => rect(c, 8, 38, 22, 2, PAPER));
  rect(c, 8, 38, 22 * download, 2, col);
  rect(c, 38, 4, 82, 40, PAPER);
  const size = 0.5 + 0.5 * Math.sin(t * 1.1);
  const gap = lerp(4.5, 8, size);
  const thick = lerp(1.5, 3, size);
  c.save();
  c.beginPath();
  c.rect(38, 4, 82, 40);
  c.clip();
  faded(c, 0.7, () => {
    for (let i = 0; i * gap < 30; i++)
      rect(c, 44, 9 + i * gap, 70 * (0.55 + 0.45 * hash(i + Math.round(size * 3))), thick, INK);
  });
  c.restore();
  const big = size > 0.5;
  c.lineWidth = 1;
  if (big) round(c, 139.5, 9.5, 16, 30, 2, undefined, col);
  else round(c, 123.5, 9.5, 16, 30, 2, undefined, col);
  label(c, "A", 131.5, 28, big ? PAPER : col, 10, "center");
  label(c, "A", 147.5, 30, big ? col : PAPER, 16, "center");
};

const sadaqah: Draw = ({ c, col, t }) => {
  const count = Math.floor(t / 0.45) % 15;
  const filled = Math.min(12, count);
  c.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const x = 10 + (i % 6) * 15;
    const y = 16 + Math.floor(i / 6) * 16;
    if (i < filled) dot(c, x, y, 4, col);
    else faded(c, 0.45, () => ring(c, x, y, 3.5, PAPER));
  }
  c.lineWidth = 3;
  faded(c, 0.25, () => ring(c, 132, 24, 15, PAPER));
  c.beginPath();
  c.arc(132, 24, 15, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * filled) / 12);
  c.strokeStyle = col;
  c.stroke();
  if (count >= 12) {
    const pop = out(((t % 0.45) + (count - 12) * 0.45) / 0.3);
    star(c, 132, 24.5, 3 + pop * 5, col);
  }
};

const coaching: Draw = ({ c, col, t }) => {
  const s = t / 1.3;
  const day = Math.floor(s) % 7;
  const k = io((s % 1) * 2.5);
  const x = lerp(8 + ((day + 6) % 7) * 21, 8 + day * 21, day === 0 ? 1 : k);
  c.lineWidth = 1;
  for (let i = 0; i < 7; i++)
    faded(c, 0.4, () => round(c, 8.5 + i * 21, 18.5, 16, 24, 4, undefined, PAPER));
  round(c, x, 18, 17, 25, 4, col);
  "MTWTFSS".split("").forEach((letter, i) => {
    const on = Math.abs(8 + i * 21 - x) < 6;
    label(c, letter, 16.5 + i * 21, 34, on ? INK : PAPER, 10, "center");
  });
  const rise = (s % 1 - 0.35) / 0.65;
  if (rise > 0)
    faded(c, 1 - rise, () => heart(c, 8 + day * 21 + 8.5, 12 - rise * 8, 3.4, col));
};

const fuel: Draw = ({ c, col, t }) => {
  const level = 0.5 - 0.5 * Math.cos(t * 0.9);
  c.lineWidth = 3;
  faded(c, 0.3, () => {
    c.beginPath();
    c.arc(30, 40, 20, Math.PI, Math.PI * 2);
    c.strokeStyle = PAPER;
    c.stroke();
  });
  c.beginPath();
  c.arc(30, 40, 20, Math.PI, Math.PI + Math.PI * level);
  c.strokeStyle = col;
  c.stroke();
  c.lineWidth = 1.5;
  const a = Math.PI + Math.PI * level;
  c.beginPath();
  c.moveTo(30, 40);
  c.lineTo(30 + Math.cos(a) * 15, 40 + Math.sin(a) * 15);
  c.strokeStyle = PAPER;
  c.stroke();
  dot(c, 30, 40, 2.5, PAPER);
  const stamps = Math.floor(t / 0.7) % 7;
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const x = 70 + i * 15;
    if (i < stamps) {
      dot(c, x, 24, 5.5, col);
      dot(c, x, 24, 1.8, INK);
    } else faded(c, 0.5, () => ring(c, x, 24, 5, col));
  }
};

/** The portal's public sign-in: three ways in, one picked at a time. */
const signIn: Draw = ({ c, col, t }) => {
  const picked = Math.floor(t / 1.2) % 3;
  c.lineWidth = 1;
  faded(c, 0.85, () => label(c, "Sign in", 30, 14, col, 12));
  ["Passkey", "MetaMask", "Wallet"].forEach((name, i) => {
    const x = 30 + i * 34;
    if (i === picked) round(c, x, 22, 30, 16, 5, col);
    else round(c, x + 0.5, 22.5, 29, 15, 4.5, undefined, col);
    faded(c, i === picked ? 1 : 0.7, () => label(c, name.slice(0, 4), x + 15, 33, i === picked ? INK : col, 8, "center"));
  });
};

const portal: Draw = ({ c, col, t }) => {
  const p = t % 4.4;
  const u = p < 1.4 ? 0 : p < 1.9 ? io((p - 1.4) / 0.5) : p < 4 ? 1 : 1 - io((p - 4) / 0.4);
  faded(c, 0.18, () => rect(c, 6, 4, 26, 40, PAPER));
  faded(c, 0.28, () => rect(c, 36, 4, 118, 8, PAPER));
  faded(c, lerp(0.12, 0.85, u), () => {
    rect(c, 40, 16, 50, 26, col);
    rect(c, 94, 16, 56, 11, col);
    rect(c, 94, 31, 56, 11, col);
    for (let i = 0; i < 4; i++) rect(c, 10, 9 + i * 7, 18, 2, PAPER);
  });
  faded(c, 1 - u, () => {
    rect(c, 89, 20, 16, 12, col);
    c.lineWidth = 2;
    c.beginPath();
    c.arc(97, 20 - u * 4, 5, Math.PI, 0);
    c.strokeStyle = col;
    c.stroke();
    dot(c, 97, 25.5, 1.6, INK);
  });
};

const documentChat: Draw = ({ c, col, t }) => {
  rect(c, 6, 4, 40, 40, PAPER);
  rect(c, 6, 4, 26, 12, col);
  label(c, "PDF", 19, 13, INK, 10, "center");
  const line = Math.floor(t * 2) % 6;
  faded(c, 0.5, () => rect(c, 9, 18.5 + line * 4, 34, 3, col));
  faded(c, 0.65, () => textLines(c, 10, 19.5, 6, 30, 4, INK, 4));
  const p = (t % 3.6) / 3.6;
  c.lineWidth = 1;
  round(c, 104.5, 4.5, 50, 12, 6, undefined, col);
  faded(c, 0.7, () => rect(c, 112, 10, 34, 1.5, col));
  if (p > 0.2) {
    const w = lerp(30, 100, out((p - 0.2) / 0.5));
    round(c, 54, 20, w, 24, 6, PAPER);
    faded(c, 0.7, () => {
      rect(c, 61, 27, Math.max(0, w - 18), 1.5, INK);
      rect(c, 61, 32, Math.max(0, (w - 18) * 0.8), 1.5, INK);
      rect(c, 61, 37, Math.max(0, (w - 18) * 0.5), 1.5, INK);
    });
  }
};

const snaxx: Draw = ({ c, col, t }) => {
  c.save();
  c.beginPath();
  c.rect(6, 4, 68, 40);
  c.clip();
  faded(c, 0.3, () => rect(c, 6, 4, 68, 40, col));
  dot(c, 56, 14, 5, PAPER);
  c.beginPath();
  c.moveTo(6, 34);
  c.quadraticCurveTo(24, 16, 44, 30);
  c.quadraticCurveTo(58, 22, 74, 30);
  c.lineTo(74, 44);
  c.lineTo(6, 44);
  c.fillStyle = col;
  c.fill();
  for (let i = 0; i < 3; i++)
    faded(c, 0.7, () => rect(c, 10 + ((t * 12 + i * 22) % 60), 38 + i * 2, 10, 1, INK));
  const scan = 6 + ((t * 30) % 68);
  rect(c, scan, 4, 1.5, 40, PAPER);
  c.restore();
  const k = io(((t % 5) - 0.4) / 2.6);
  label(c, String(Math.round(lerp(972, 337, k))), 84, 24, col, 16);
  faded(c, 0.75, () => label(c, "KB", 126, 24, PAPER));
  faded(c, 0.3, () => rect(c, 84, 33, 70, 2, PAPER));
  rect(c, 84, 33, lerp(70, 24.3, k), 2, col);
};

const offday: Draw = ({ c, col, t }) => {
  const p = (t % 5) / 5;
  for (let r = 0; r < 4; r++) {
    faded(c, 0.5, () => dot(c, 12, 9 + r * 10, 3.5, PAPER));
    for (let d = 0; d < 14; d++) faded(c, 0.12, () => rect(c, 22 + d * 9.5, 6 + r * 10, 8.5, 7, PAPER));
    const start = Math.floor(hash(r + 3) * 8);
    const length = 2 + Math.floor(hash(r + 9) * 4);
    const grow = out((p - r * 0.1) / 0.25);
    const x = 22 + start * 9.5;
    const w = length * 9.5 * grow - 1;
    if (w <= 0) continue;
    if (r === 3 && p < 0.7) {
      c.setLineDash([2, 2]);
      c.lineWidth = 1;
      round(c, x + 0.5, 6.5 + r * 10, w, 6, 1, undefined, col);
      c.setLineDash([]);
    } else round(c, x, 6 + r * 10, w, 7, 1, col);
    if (r === 3 && p >= 0.7) {
      c.lineWidth = 1.5;
      c.strokeStyle = col;
      c.beginPath();
      c.moveTo(x + w + 4, 9 + r * 10);
      c.lineTo(x + w + 6.5, 11.5 + r * 10);
      c.lineTo(x + w + 11, 6 + r * 10);
      c.stroke();
    }
  }
};

const offbeat: Draw = ({ c, col, t }) => {
  const beat = t * 3.7;
  const step = Math.floor(beat) % 8;
  const pattern = ["10001000", "00100010", "10111011", "10010100"];
  pattern.forEach((row, r) => {
    for (let s = 0; s < 8; s++) {
      const x = 8 + s * 13;
      const y = 6 + r * 10;
      if (row[s] === "1") round(c, x, y, 11, 7, 1.5, s === step ? PAPER : col);
      else faded(c, 0.14, () => round(c, x, y, 11, 7, 1.5, PAPER));
    }
  });
  rect(c, 8 + step * 13, 45, 11, 1.5, PAPER);
  const hit = pattern[0][step] === "1" ? 1 - (beat % 1) : 0;
  c.lineWidth = 1;
  faded(c, 0.25 + hit * 0.5, () => ring(c, 138, 24, 15 + hit * 3, col));
  dot(c, 138, 24, 9 + hit * 2.5, col);
  dot(c, 138, 24, 3, INK);
};

const form: Draw = ({ c, col, t }) => {
  const a = t * 0.7;
  const point = (u: number) => {
    const x = Math.sin(u) + 2 * Math.sin(2 * u);
    const y = Math.cos(u) - 2 * Math.cos(2 * u);
    const z = -Math.sin(3 * u);
    return [40 + (x * Math.cos(a) + z * Math.sin(a)) * 5.5, 24 + y * 5.5] as const;
  };
  c.lineJoin = "round";
  for (const [width, fill, alpha] of [[4, col, 1], [1, PAPER, 0.55]] as const) {
    faded(c, alpha, () => {
      c.beginPath();
      for (let i = 0; i <= 120; i++) {
        const [x, y] = point((i / 120) * Math.PI * 2);
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.lineWidth = width;
      c.strokeStyle = fill;
      c.stroke();
    });
  }
  label(c, "3", 84, 25, col, 16);
  faded(c, 0.75, () => label(c, "SCULPTURES", 98, 25, PAPER));
  const active = Math.floor(t / 3) % 3;
  c.lineWidth = 1;
  for (let i = 0; i < 3; i++)
    if (i === active) dot(c, 88 + i * 10, 36, 3, col);
    else faded(c, 0.5, () => ring(c, 88 + i * 10, 36, 2.5, PAPER));
};

const geo: Draw = ({ c, col, t }) => {
  c.lineWidth = 1;
  faded(c, 0.2, () => {
    c.strokeStyle = PAPER;
    c.beginPath();
    c.moveTo(0, 40);
    c.lineTo(160, 8);
    c.moveTo(30, 0);
    c.lineTo(70, 48);
    c.moveTo(0, 18);
    c.quadraticCurveTo(80, 36, 160, 26);
    c.moveTo(110, 0);
    c.lineTo(126, 48);
    c.stroke();
  });
  const p = (t % 3.4) / 3.4;
  const drop = out(p / 0.15);
  const draw = io((p - 0.2) / 0.45);
  const [gx, gy, ax, ay] = [44, 32, 120, 16];
  c.setLineDash([3, 3]);
  c.lineWidth = 1.5;
  c.strokeStyle = col;
  c.beginPath();
  c.moveTo(gx, gy);
  c.lineTo(lerp(gx, ax, draw), lerp(gy, ay, draw));
  c.stroke();
  c.setLineDash([]);
  const pin = (x: number, y: number, fill: string) => {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 3.5, y - 6);
    c.lineTo(x + 3.5, y - 6);
    c.fillStyle = fill;
    c.fill();
    dot(c, x, y - 7, 3.8, fill);
  };
  pin(gx, gy - (1 - drop) * 10, col);
  if (draw > 0.98) pin(ax, ay, PAPER);
};

const fjale: Draw = ({ c, col, t }) => {
  const p = t % 4.2;
  const letters = "FJALË";
  const state = [2, 1, 2, 0, 2];
  for (let i = 0; i < 5; i++) {
    const x = 9 + i * 29;
    const flipAt = 1 + i * 0.3;
    const typed = p > 0.15 + i * 0.12;
    const f = clamp((p - flipAt) / 0.24);
    const shown = f > 0.5;
    const sy = f > 0 && f < 1 ? Math.abs(Math.cos(f * Math.PI)) : 1;
    const fade = p > 3.8 ? 1 - io((p - 3.8) / 0.4) : 1;
    faded(c, fade, () => {
      c.save();
      c.translate(0, 24);
      c.scale(1, Math.max(0.05, sy));
      c.translate(0, -24);
      if (shown) {
        const fill = state[i] === 2 ? col : state[i] === 1 ? PAPER : "#5a5550";
        rect(c, x, 8, 25, 32, fill);
      } else {
        c.lineWidth = 1;
        faded(c, typed ? 0.8 : 0.35, () => {
          c.strokeStyle = PAPER;
          c.strokeRect(x + 0.5, 8.5, 24, 31);
        });
      }
      if (typed)
        label(c, letters[i], x + 12.5, 30, shown && state[i] !== 0 ? INK : PAPER, 16, "center");
      c.restore();
    });
  }
};

const za: Draw = ({ c, col, t }) => {
  const players = 2 + (Math.floor(t / 3) % 7);
  c.lineWidth = 1;
  faded(c, 0.45, () => {
    c.beginPath();
    c.ellipse(80, 24, 52, 19, 0, 0, Math.PI * 2);
    c.strokeStyle = col;
    c.stroke();
  });
  dot(c, 80, 24, 9, col);
  c.strokeStyle = INK;
  c.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    c.moveTo(80 - Math.cos(a) * 9, 24 - Math.sin(a) * 9);
    c.lineTo(80 + Math.cos(a) * 9, 24 + Math.sin(a) * 9);
  }
  c.stroke();
  const seat = (i: number) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 8;
    return [80 + Math.cos(a) * 64, 24 + Math.sin(a) * 19.5] as const;
  };
  for (let i = 0; i < 8; i++) {
    const [x, y] = seat(i);
    if (i < players) dot(c, x, y, 3.5, PAPER);
    else faded(c, 0.35, () => ring(c, x, y, 3, PAPER));
  }
  const deal = t * 4;
  const target = Math.floor(deal) % players;
  const k = out(deal % 1);
  const [sx, sy] = seat(target);
  c.save();
  c.translate(lerp(80, sx, k), lerp(24, sy, k));
  c.rotate(k * 2.4);
  rect(c, -3, -4.5, 6, 9, PAPER);
  c.restore();
};

const MORSE: Record<string, string> = { M: "--", O: "---", R: ".-.", S: "...", E: "." };
const tape = (() => {
  const marks: Array<[number, number, string]> = [];
  let u = 0;
  for (const letter of "MORSE") {
    MORSE[letter].split("").forEach((symbol, i) => {
      const length = symbol === "." ? 1 : 3;
      marks.push([u, length, i === 0 ? letter : ""]);
      u += length + 1;
    });
    u += 6;
  }
  return { marks, length: u + 4 };
})();
const morse: Draw = ({ c, col, t }) => {
  const unit = 6;
  const head = 46;
  const offset = (t * 7) % tape.length;
  let on = false;
  c.save();
  c.beginPath();
  c.rect(38, 0, 122, 48);
  c.clip();
  for (const shift of [0, tape.length]) {
    for (const [start, length, letter] of tape.marks) {
      const x = head + (start + shift - offset) * unit;
      const w = length * unit;
      if (x <= head && x + w > head) on = true;
      if (x > 160 || x + w < 38) continue;
      rect(c, x, 21, w, 5, x <= head ? PAPER : col);
      if (letter) faded(c, 0.7, () => label(c, letter, x, 41, PAPER));
    }
  }
  c.restore();
  rect(c, head - 0.5, 12, 1, 22, PAPER);
  if (on) {
    faded(c, 0.25, () => dot(c, 20, 24, 15, col));
    dot(c, 20, 24, 10, col);
  } else {
    c.lineWidth = 1.5;
    faded(c, 0.45, () => ring(c, 20, 24, 9.5, col));
  }
};

const race: Draw = ({ c, col, t }) => {
  const day = 0.5 + 0.5 * Math.sin(t * 0.45);
  faded(c, 0.06 + day * 0.16, () => rect(c, 0, 0, W, H, col));
  const sky = t * 0.45;
  dot(c, 80 + Math.cos(sky + Math.PI / 2) * 68, 30 - Math.abs(Math.sin(sky + Math.PI / 2)) * 26, 3, day > 0.5 ? col : PAPER);
  c.lineWidth = 4;
  faded(c, 0.4, () => round(c, 18, 9, 124, 30, 15, undefined, PAPER));
  const point = (s: number) => {
    const straight = 94;
    const arc = Math.PI * 15;
    const total = straight * 2 + arc * 2;
    let d = (((s % 1) + 1) % 1) * total;
    if (d < straight) return [33 + d, 9] as const;
    d -= straight;
    if (d < arc) {
      const a = -Math.PI / 2 + d / 15;
      return [127 + Math.cos(a) * 15, 24 + Math.sin(a) * 15] as const;
    }
    d -= arc;
    if (d < straight) return [127 - d, 39] as const;
    d -= straight;
    const a = Math.PI / 2 + d / 15;
    return [33 + Math.cos(a) * 15, 24 + Math.sin(a) * 15] as const;
  };
  const s = t * 0.32;
  for (let i = 6; i >= 0; i--) {
    const [x, y] = point(s - i * 0.012);
    faded(c, i ? 0.5 - i * 0.07 : 1, () => dot(c, x, y, i ? 2 : 3, col));
  }
  c.lineWidth = 1;
  c.strokeStyle = col;
  faded(c, 0.6, () => {
    c.beginPath();
    for (let x = 52; x <= 108; x += 2) {
      const y = 24 + Math.sin(x * 0.2 + t * 2) * 1.6 + Math.sin(t * 0.6) * 2;
      if (x === 52) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  });
};

const town: Draw = ({ c, col, t }) => {
  for (let i = 0; i < 5; i++) {
    const x = 8 + i * 30;
    const h = 12 + (i % 3) * 5;
    faded(c, 0.3, () => rect(c, x, 34 - h, 16, h, col));
    faded(c, 0.55, () => {
      c.beginPath();
      c.moveTo(x + 16, 34 - h);
      c.lineTo(x + 22, 31 - h);
      c.lineTo(x + 22, 31);
      c.lineTo(x + 16, 34);
      c.fillStyle = col;
      c.fill();
    });
    c.beginPath();
    c.moveTo(x - 1, 34 - h);
    c.lineTo(x + 8, 26 - h);
    c.lineTo(x + 17, 34 - h);
    c.fillStyle = col;
    c.fill();
  }
  faded(c, 0.4, () => rect(c, 2, 44.5, 156, 1, PAPER));
  const reveal = Math.floor(t / 3) % 5;
  const p = (t % 3) / 3;
  for (let i = 0; i < 5; i++) {
    const x = 20 + i * 30 + Math.sin(t * 1.3 + i * 2) * 5;
    const accused = i === reveal && p > 0.6;
    const tone = accused ? col : PAPER;
    dot(c, x, 37, 2.4, tone);
    rect(c, x - 2.5, 40, 5, 4.5, tone);
    if (i === reveal && p <= 0.6 && Math.floor(t * 3) % 2)
      label(c, "?", x, 32, col, 10, "center");
  }
};

const forks: Draw = ({ c, col, t }) => {
  c.lineWidth = 1.5;
  faded(c, 0.6, () => rect(c, 0, 11, W, 1.5, PAPER));
  c.strokeStyle = col;
  c.beginPath();
  c.moveTo(34, 12);
  c.bezierCurveTo(50, 12, 46, 30, 64, 30);
  c.lineTo(160, 30);
  c.stroke();
  faded(c, 0.75, () => {
    c.beginPath();
    c.moveTo(56, 12);
    c.bezierCurveTo(72, 12, 68, 42, 86, 42);
    c.lineTo(160, 42);
    c.stroke();
  });
  const shift = (t * 14) % 16;
  for (let x = -16; x < W; x += 16) {
    const px = x + 16 - shift;
    if (px > 2) dot(c, px, 11.75, 2.2, PAPER);
  }
  for (let x = 64; x < W + 20; x += 20) {
    const px = x + ((t * 9) % 20);
    if (px > 66 && px < 156) dot(c, px, 30, 2.6, col);
  }
  for (let x = 86; x < W + 26; x += 26) {
    const px = x + ((t * 6) % 26);
    if (px > 88 && px < 156) faded(c, 0.75, () => dot(c, px, 42, 2.6, col));
  }
  label(c, "EPUB", 152, 25, col, 10, "right");
  faded(c, 0.75, () => label(c, "PDF", 152, 38, col, 10, "right"));
};

const draws: Record<string, Draw> = {
  "care-api": queries,
  "design-system-vue": tokens,
  "design-dashboard": calls,
  "bayyinah-tv": stream,
  "bayyinah-institute": institute,
  "read-to-feed": reader,
  "viva-fresh": grocery,
  "dukagjini-bookstore": books,
  "chatbot-runtime": chat,
  "chatbot-runtime-web": queue,
  "epub-reader-prototype": epub,
  "donation-app": sadaqah,
  "coaching-app": coaching,
  "fuel-loyalty-app": fuel,
  incentiv: signIn,
  "member-portal": portal,
  "ai-dashboard": documentChat,
  offbeat,
  form,
  "snaxx-tech": snaxx,
  offday,
  "geo-guesser": geo,
  fjale,
  za,
  "morse-trainer": morse,
  futurisma: race,
  "secret-dictator": town,
  "open-source-forks": forks,
};

interface LiveCell {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  draw: Draw;
  colour: string;
  seed: number;
  start: number;
  scale: number;
  visible: boolean;
}

const cells = new Map<HTMLCanvasElement, LiveCell>();
let frame = 0;
let intersection: IntersectionObserver | null = null;
let resize: ResizeObserver | null = null;
let preference: MediaQueryList | null = null;

function still() {
  return document.hidden || Boolean(preference?.matches);
}

function paint(cell: LiveCell, now: number) {
  const { context: c, scale } = cell;
  const t = still()
    ? 2.6 + cell.seed * 0.37
    : Math.max(0, now - cell.start) / 1000 + cell.seed * 0.37;
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.globalAlpha = 1;
  c.fillStyle = INK;
  c.fillRect(0, 0, W, H);
  c.save();
  cell.draw({ c, col: cell.colour, t });
  c.restore();
}

function loop(now: number) {
  frame = 0;
  if (still()) return;
  let any = false;
  for (const cell of cells.values()) {
    if (!cell.visible) continue;
    any = true;
    paint(cell, now);
  }
  if (any) frame = requestAnimationFrame(loop);
}

function wake() {
  if (still()) {
    cancelAnimationFrame(frame);
    frame = 0;
    const now = performance.now();
    for (const cell of cells.values()) paint(cell, now);
  } else if (!frame) frame = requestAnimationFrame(loop);
}

function fit(cell: LiveCell, width: number) {
  if (!width) return;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const pixels = Math.round(width * dpr);
  if (cell.canvas.width !== pixels) {
    cell.canvas.width = pixels;
    cell.canvas.height = Math.round((pixels * H) / W);
  }
  cell.scale = cell.canvas.width / W;
  paint(cell, performance.now());
}

function setup() {
  if (intersection) return;
  preference = matchMedia("(prefers-reduced-motion: reduce)");
  intersection = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const cell = cells.get(entry.target as HTMLCanvasElement);
        if (cell) cell.visible = entry.isIntersecting;
      }
      wake();
    },
    { rootMargin: "64px 0px" },
  );
  resize = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cell = cells.get(entry.target as HTMLCanvasElement);
      if (cell) fit(cell, entry.contentRect.width);
    }
  });
  document.addEventListener("visibilitychange", wake);
  preference.addEventListener("change", wake);
  document.fonts?.ready.then(() => {
    const now = performance.now();
    for (const cell of cells.values()) paint(cell, now);
  });
}

function teardown() {
  cancelAnimationFrame(frame);
  frame = 0;
  intersection?.disconnect();
  resize?.disconnect();
  intersection = null;
  resize = null;
  document.removeEventListener("visibilitychange", wake);
  preference?.removeEventListener("change", wake);
}

/** One clock, one intersection observer and one resize observer for every miniature on the page. */
export function registerCell(
  canvas: HTMLCanvasElement,
  slug: string,
  colour: string,
  seed: number,
  delay: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  setup();
  const cell: LiveCell = {
    canvas,
    context,
    draw: draws[slug],
    colour,
    seed,
    start: performance.now() + delay,
    scale: 1,
    visible: false,
  };
  cells.set(canvas, cell);
  fit(cell, canvas.getBoundingClientRect().width || W);
  intersection!.observe(canvas);
  resize!.observe(canvas);
  return () => {
    intersection?.unobserve(canvas);
    resize?.unobserve(canvas);
    cells.delete(canvas);
    if (!cells.size) teardown();
  };
}
