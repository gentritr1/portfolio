/**
 * Two drawn bitmap faces for the board. Rows are top to bottom; "#" is a lit disc.
 * A glyph with two more rows than its face height carries marks above the cap line (Ë).
 */
type Face = Record<string, string[]>;

const hex5 = (code: string) =>
  Array.from({ length: 7 }, (_, row) => {
    const value = parseInt(code.slice(row * 2, row * 2 + 2), 16);
    return Array.from({ length: 5 }, (_, col) => ((value >> (4 - col)) & 1 ? "#" : ".")).join("");
  });

const smallCodes: Record<string, string> = {
  A: "0E11111F111111",
  B: "1E11111E11111E",
  C: "0E11101010110E",
  D: "1E11111111111E",
  E: "1F10101E10101F",
  F: "1F10101E101010",
  G: "0E11101713110F",
  H: "1111111F111111",
  I: "0E04040404040E",
  J: "0101010101110E",
  K: "11121418141211",
  L: "1010101010101F",
  M: "111B1515111111",
  N: "11191915131311",
  O: "0E11111111110E",
  P: "1E11111E101010",
  Q: "0E11111115120D",
  R: "1E11111E141211",
  S: "0E11100E01110E",
  T: "1F040404040404",
  U: "1111111111110E",
  V: "11111111110A04",
  W: "11111115151B11",
  X: "11110A040A1111",
  Y: "11110A04040404",
  Z: "1F01020408101F",
  "0": "0E11111111110E",
  "1": "040C040404040E",
  "2": "0E11010204081F",
  "3": "1F02040201110E",
  "4": "02060A121F0202",
  "5": "1F101E0101110E",
  "6": "06081E1111110E",
  "7": "1F010204080808",
  "8": "0E11110E11110E",
  "9": "0E11110F01020C",
  "-": "0000000E000000",
  "+": "0004041F040400",
  ".": "00000000000404",
  ",": "00000000000408",
  ":": "00040400040400",
  "!": "04040404040004",
  "?": "0E110102040004",
  "@": "0E11171517100F",
  "/": "01010204081010",
  "&": "0C12140C15120D",
  "'": "04040000000000",
  "→": "0004021F020400",
  "·": "00000004000000",
};

const small: Face = Object.fromEntries(
  Object.entries(smallCodes).map(([char, code]) => [char, hex5(code)]),
);
small.Ë = ["01010", "00000", ...hex5(smallCodes.E)].map((row) => row.replace(/0/g, ".").replace(/1/g, "#"));

const large: Face = {
  A: ["..###..", ".##.##.", "##...##", "##...##", "##...##", "#######", "##...##", "##...##", "##...##"],
  B: ["######.", "##...##", "##...##", "##...##", "######.", "##...##", "##...##", "##...##", "######."],
  C: [".#####.", "##...##", "##.....", "##.....", "##.....", "##.....", "##.....", "##...##", ".#####."],
  D: ["#####..", "##..##.", "##...##", "##...##", "##...##", "##...##", "##...##", "##..##.", "#####.."],
  E: ["#######", "##.....", "##.....", "##.....", "######.", "##.....", "##.....", "##.....", "#######"],
  F: ["#######", "##.....", "##.....", "##.....", "######.", "##.....", "##.....", "##.....", "##....."],
  G: [".#####.", "##...##", "##.....", "##.....", "##.####", "##...##", "##...##", "##...##", ".######"],
  H: ["##...##", "##...##", "##...##", "##...##", "#######", "##...##", "##...##", "##...##", "##...##"],
  I: ["####", ".##.", ".##.", ".##.", ".##.", ".##.", ".##.", ".##.", "####"],
  J: [".....##", ".....##", ".....##", ".....##", ".....##", ".....##", "##...##", "##...##", ".#####."],
  K: ["##...##", "##..##.", "##.##..", "####...", "###....", "####...", "##.##..", "##..##.", "##...##"],
  L: ["##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "#######"],
  M: ["##...##", "###.###", "#######", "##.#.##", "##...##", "##...##", "##...##", "##...##", "##...##"],
  N: ["##...##", "###..##", "###..##", "####.##", "##.####", "##..###", "##..###", "##...##", "##...##"],
  O: [".#####.", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", ".#####."],
  P: ["######.", "##...##", "##...##", "##...##", "######.", "##.....", "##.....", "##.....", "##....."],
  Q: [".#####.", "##...##", "##...##", "##...##", "##...##", "##...##", "##.#.##", "##..##.", ".###.##"],
  R: ["######.", "##...##", "##...##", "##...##", "######.", "##.##..", "##..##.", "##...##", "##...##"],
  S: [".#####.", "##...##", "##.....", "##.....", ".#####.", ".....##", ".....##", "##...##", ".#####."],
  T: ["######", "..##..", "..##..", "..##..", "..##..", "..##..", "..##..", "..##..", "..##.."],
  U: ["##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", ".#####."],
  V: ["##...##", "##...##", "##...##", "##...##", "##...##", ".##.##.", ".##.##.", "..###..", "...#..."],
  W: ["##...##", "##...##", "##...##", "##...##", "##.#.##", "##.#.##", "#######", "###.###", "##...##"],
  X: ["##...##", ".##.##.", ".##.##.", "..###..", "..###..", "..###..", ".##.##.", ".##.##.", "##...##"],
  Y: ["##..##", "##..##", "##..##", ".####.", "..##..", "..##..", "..##..", "..##..", "..##.."],
  Z: ["#######", ".....##", "....##.", "...##..", "..##...", ".##....", "##.....", "##.....", "#######"],
  "0": [".####.", "##..##", "##..##", "##..##", "##..##", "##..##", "##..##", "##..##", ".####."],
  "1": ["..##..", ".###..", "####..", "..##..", "..##..", "..##..", "..##..", "..##..", "######"],
  "2": [".####.", "##..##", "....##", "....##", "...##.", "..##..", ".##...", "##....", "######"],
  "3": [".####.", "##..##", "....##", "....##", "..###.", "....##", "....##", "##..##", ".####."],
  "4": ["...##.", "..###.", ".####.", "##.##.", "##.##.", "######", "...##.", "...##.", "...##."],
  "5": ["######", "##....", "##....", "#####.", "....##", "....##", "....##", "##..##", ".####."],
  "6": [".####.", "##..##", "##....", "##....", "#####.", "##..##", "##..##", "##..##", ".####."],
  "7": ["######", "....##", "....##", "...##.", "...##.", "..##..", "..##..", "..##..", "..##.."],
  "8": [".####.", "##..##", "##..##", "##..##", ".####.", "##..##", "##..##", "##..##", ".####."],
  "9": [".####.", "##..##", "##..##", "##..##", ".#####", "....##", "....##", "##..##", ".####."],
  "!": ["##", "##", "##", "##", "##", "##", "..", "##", "##"],
  "-": ["....", "....", "....", "....", "####", "....", "....", "....", "...."],
  "+": ["......", "......", "..##..", "..##..", "######", "..##..", "..##..", "......", "......"],
  "→": [".......", "...##..", "....##.", "#######", "#######", "....##.", "...##..", ".......", "......."],
  ".": ["..", "..", "..", "..", "..", "..", "..", "##", "##"],
};
large.Ë = [".##.##.", ".......", ...large.E];

const faces = { small, large } as const;
export type FaceName = keyof typeof faces;
export const faceHeight: Record<FaceName, number> = { small: 7, large: 9 };
const space: Record<FaceName, number> = { small: 3, large: 3 };

/** Digits in the small face keep their full width so years align in columns. */
function glyph(face: FaceName, char: string) {
  const rows = faces[face][char] ?? faces[face]["?"] ?? faces.small["?"];
  if (face === "small" && !/[0-9]/.test(char)) {
    const body = rows.length > 7 ? rows.slice(rows.length - 7) : rows;
    let left = 5,
      right = -1;
    for (const row of body)
      for (let col = 0; col < row.length; col++)
        if (row[col] === "#") {
          left = Math.min(left, col);
          right = Math.max(right, col);
        }
    if (right >= left) return rows.map((row) => row.slice(left, right + 1));
  }
  return rows;
}

function normalise(text: string) {
  return text.toUpperCase().replace(/[–—]/g, "-");
}

export function measure(text: string, face: FaceName) {
  let width = 0,
    previous = false;
  for (const char of normalise(text)) {
    if (char === " ") {
      width += space[face];
      previous = false;
      continue;
    }
    width += (previous ? 1 : 0) + glyph(face, char)[0].length;
    previous = true;
  }
  return width;
}

/** A board frame: the lit discs and, for each disc, when it may start to turn (ms). */
export class Frame {
  readonly bits: Uint8Array;
  readonly delay: Float32Array;
  readonly owned: Uint8Array;
  readonly cols: number;
  readonly rows: number;
  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.bits = new Uint8Array(cols * rows);
    this.delay = new Float32Array(cols * rows);
    this.owned = new Uint8Array(cols * rows);
  }
  in(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }
  cell(x: number, y: number, on: boolean, at?: number) {
    if (!this.in(x, y)) return;
    const i = y * this.cols + x;
    this.bits[i] = on ? 1 : 0;
    if (at !== undefined) {
      this.delay[i] = at;
      this.owned[i] = 1;
    }
  }
  /** Gives every disc in a box one start time, lit or not, so old marks clear with the new ones. */
  claim(x: number, y: number, w: number, h: number, at: number) {
    for (let row = y; row < y + h; row++)
      for (let col = x; col < x + w; col++)
        if (this.in(col, row)) {
          const i = row * this.cols + col;
          this.delay[i] = at;
          this.owned[i] = 1;
        }
  }
  rect(x: number, y: number, w: number, h: number, on: boolean, at: number) {
    for (let row = y; row < y + h; row++)
      for (let col = x; col < x + w; col++) this.cell(col, row, on, at + (col - x) * 3);
  }
  /** Draws text from its left edge (x) and cap top (y). Returns the right edge. */
  text(
    value: string,
    x: number,
    y: number,
    face: FaceName,
    { at = 0, step = 60, word = 180, invert = false }: { at?: number; step?: number; word?: number; invert?: boolean } = {},
  ) {
    const height = faceHeight[face];
    let t = at,
      previous = false;
    for (const char of normalise(value)) {
      if (char === " ") {
        x += space[face];
        t += word - step;
        previous = false;
        continue;
      }
      if (previous) {
        this.claim(x, y, 1, height, t);
        x += 1;
      }
      const rows = glyph(face, char),
        top = y - (rows.length - height);
      this.claim(x, top, rows[0].length, rows.length, t);
      rows.forEach((row, r) =>
        [...row].forEach((mark, c) => {
          const lit = mark === "#";
          if (lit || invert) this.cell(x + c, top + r, invert ? !lit : lit, t);
        }),
      );
      x += rows[0].length;
      t += step;
      previous = true;
    }
    return x;
  }
  /** A dotted rule, every second disc, written left to right. */
  dotted(x0: number, x1: number, y: number, at: number) {
    for (let x = x0; x <= x1; x++) this.cell(x, y, (x - x0) % 2 === 0, at + (x - x0) * 4);
  }
  ring(x: number, y: number, at: number, filled = false) {
    const shape = filled
      ? [".###.", "#####", "#####", "#####", ".###."]
      : [".###.", "#...#", "#...#", "#...#", ".###."];
    shape.forEach((row, r) => [...row].forEach((mark, c) => this.cell(x + c, y + r, mark === "#", at)));
  }
  /** A route plate: a one-disc frame with rounded corners and the label lit inside it. */
  plate(x: number, y: number, w: number, h: number, label: string, at: number) {
    for (let row = 0; row < h; row++)
      for (let col = 0; col < w; col++) {
        const edge = row === 0 || row === h - 1 || col === 0 || col === w - 1,
          corner = (row === 0 || row === h - 1) && (col === 0 || col === w - 1);
        this.cell(x + col, y + row, edge && !corner, at + (col + row) * 3);
      }
    const width = measure(label, "large");
    this.text(label, x + Math.round((w - width) / 2), y + Math.round((h - 9) / 2), "large", { at: at + 60, step: 60 });
  }
  /** Draws the large face with each disc of a glyph as a scale × scale block. Rows write top to bottom. */
  big(value: string, x: number, y: number, scale: number, { at = 0, step = 60 }: { at?: number; step?: number } = {}) {
    let t = at,
      previous = false;
    for (const char of normalise(value)) {
      if (char === " ") {
        x += space.large * scale;
        t += step;
        previous = false;
        continue;
      }
      if (previous) {
        this.claim(x, y, scale, faceHeight.large * scale, t);
        x += scale;
      }
      const rows = glyph("large", char),
        top = y - (rows.length - faceHeight.large) * scale;
      this.claim(x, top, rows[0].length * scale, rows.length * scale, t);
      rows.forEach((row, r) =>
        [...row].forEach((mark, c) => {
          if (mark !== "#") return;
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++) this.cell(x + c * scale + dx, top + r * scale + dy, true, t + (r * scale + dy) * 14);
        }),
      );
      x += rows[0].length * scale;
      t += step;
      previous = true;
    }
    return x;
  }
  /** Discs no element owns turn in a left-to-right sweep, as a sign's driver writes column by column. */
  sweep(at = 0, step = 3) {
    for (let i = 0; i < this.bits.length; i++) if (!this.owned[i]) this.delay[i] = at + (i % this.cols) * step;
  }
}
