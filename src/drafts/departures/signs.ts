import { Frame, measure } from "./glyphs";
import type { Line } from "./lines";

export interface Layout {
  cols: number;
  rows: number;
  phone: boolean;
  /** The window the picture page fills, in discs. Plate and years stay outside it. */
  picture: { x: number; y: number; w: number; h: number };
  /** Where the Morse key writes its marks. */
  trace: { x: number; y: number; w: number };
}

export const layouts: Record<"wide" | "phone", Layout> = {
  wide: {
    cols: 160,
    rows: 60,
    phone: false,
    picture: { x: 30, y: 2, w: 128, h: 56 },
    trace: { x: 28, y: 46, w: 74 },
  },
  phone: {
    cols: 70,
    rows: 100,
    phone: true,
    picture: { x: 1, y: 19, w: 68, h: 80 },
    trace: { x: 1, y: 60, w: 68 },
  },
};

/** One dit of Morse at 20 words a minute. Board letters write in this time. */
export const DIT = 60;

const two = (n: number) => String(n).padStart(2, "0");

function yearsColumn(f: Frame, years: number[], x: number, y: number, pitch: number, at: number) {
  f.text(String(years[0]), x, y, "small", { at, step: 30 });
  if (years[1]) {
    f.rect(x + 9, y + Math.round(pitch / 2) + 3, 5, 1, true, at + 120);
    f.text(String(years[1]), x, y + pitch, "small", { at: at + 180, step: 30 });
  }
}

function yearsRight(f: Frame, years: number[], right: number, y: number, at: number) {
  const first = String(years[0]);
  f.text(first, right - measure(first, "small"), y, "small", { at, step: 30 });
  if (years[1]) {
    const last = String(years[1]);
    f.text(last, right - measure(last, "small"), y + 8, "small", { at: at + 120, step: 30 });
  }
}

function stops(f: Frame, items: string[], x: number, y: number, pitch: number, at: number) {
  items.forEach((stop, i) => {
    const top = y + i * pitch,
      t = at + i * 260;
    f.ring(x, top + 1, t, i === 0);
    if (i < items.length - 1)
      for (let row = top + 6; row < top + pitch + 1; row++) f.cell(x + 2, row, true, t + (row - top) * 12);
    f.text(stop, x + 8, top, "small", { at: t + 60, step: DIT / 2, word: DIT * 1.5 });
  });
}

/** Splits words into lines that fit a width in the small face. */
function wrap(text: string, width: number) {
  const out: string[] = [];
  for (const word of text.split(" ")) {
    const last = out.length - 1;
    if (last >= 0 && measure(`${out[last]} ${word}`, "small") <= width) out[last] += ` ${word}`;
    else out.push(word);
  }
  return out;
}

/** Large destination: one line, two lines if it does not fit, or the small face as the last resort. */
function destination(f: Frame, text: string, x: number, y: number, width: number, zone: number, at: number) {
  if (measure(text, "large") <= width) {
    f.text(text, x, y + Math.round((zone - 9) / 2), "large", { at, step: DIT, word: DIT * 3 });
    return;
  }
  const words = text.split(" ");
  for (let cut = words.length - 1; cut > 0; cut--) {
    const a = words.slice(0, cut).join(" "),
      b = words.slice(cut).join(" ");
    if (measure(a, "large") <= width && measure(b, "large") <= width && zone >= 20) {
      const top = y + Math.round((zone - 20) / 2);
      f.text(a, x, top, "large", { at, step: DIT, word: DIT * 3 });
      f.text(b, x, top + 11, "large", { at: at + a.length * DIT + DIT * 3, step: DIT, word: DIT * 3 });
      return;
    }
  }
  f.text(text, x, y + Math.round((zone - 7) / 2), "small", { at, step: DIT, word: DIT * 3 });
}

/** Plate and years: the part of a line that stays while its two pages change. */
function head(f: Frame, plate: string, years: number[], layout: Layout) {
  if (layout.phone) {
    f.plate(1, 1, 22, 15, plate, 0);
    yearsRight(f, years, 68, 1, 200);
  } else {
    f.plate(2, 2, 22, 15, plate, 0);
    yearsColumn(f, years, 2, 23, 12, 260);
  }
}

function next(f: Frame, name: string, number: number, x: number, y: number, width: number, at: number) {
  f.text("NEXT", x, y, "small", { at, step: 30 });
  f.text(two(number), x + width - measure(two(number), "small"), y, "small", { at, step: 30 });
  wrap(name, width)
    .slice(0, 2)
    .forEach((text, i) => f.text(text, x, y + 11 + i * 9, "small", { at: at + 200 + i * 200, step: DIT / 2 }));
}

function divider(f: Frame, x: number, at: number) {
  for (let y = 22; y <= 57; y += 2) f.cell(x, y, true, at + y * 6);
}

export type Page = "text" | "picture";

export function lineFrame(
  line: Line,
  number: number,
  layout: Layout,
  page: Page,
  picture: Uint8Array | null | "parts",
  following: { name: string; number: number },
) {
  const f = new Frame(layout.cols, layout.rows),
    { x: px, y: py, w: pw, h: ph } = layout.picture;
  head(f, two(number), line.years, layout);
  if (page === "picture") {
    if (picture === "parts") partsSheet(f, px, py, pw, ph, 0);
    else if (picture) f.picture(picture, px, py, pw, ph, 0);
    f.sweep(0, 2);
    return f;
  }
  if (layout.phone) {
    destination(f, line.board, 1, 19, 68, 21, 120);
    f.dotted(1, 68, 43, 0);
    stops(f, line.stops.slice(0, 2), 1, 47, 11, 520);
    f.dotted(1, 68, 67, 300);
    next(f, following.name, following.number, 1, 71, 68, 1100);
  } else {
    destination(f, line.board, 28, 2, 130, 15, 120);
    f.dotted(2, 157, 19, 0);
    stops(f, line.stops, 28, 23, 12, 520);
    divider(f, 104, 300);
    next(f, following.name, following.number, 108, 23, 50, 1200);
  }
  f.sweep();
  return f;
}

/** A drawn sheet of interface parts, for the line that has no public screen. */
function partsSheet(f: Frame, x: number, y: number, w: number, h: number, at: number) {
  const cell = 9,
    cols = Math.floor((w + 3) / cell),
    rows = Math.floor((h + 3) / cell),
    ox = x + Math.floor((w - (cols * cell - 3)) / 2),
    oy = y + Math.floor((h - (rows * cell - 3)) / 2);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const left = ox + c * cell,
        top = oy + r * cell,
        kind = (r * 5 + c * 3) % 5,
        t = at + (r + c) * 40;
      for (let yy = 0; yy < 6; yy++)
        for (let xx = 0; xx < 6; xx++) {
          const edge = xx === 0 || yy === 0 || xx === 5 || yy === 5,
            corner = (xx === 0 || xx === 5) && (yy === 0 || yy === 5);
          const lit =
            kind === 0
              ? edge && !corner
              : kind === 1
                ? !corner
                : kind === 2
                  ? yy === 2 || yy === 3
                  : kind === 3
                    ? (edge && !corner) || (xx >= 2 && xx <= 3 && yy >= 2 && yy <= 3)
                    : yy === 0 || (yy === 3 && xx < 4);
          f.cell(left + xx, top + yy, lit, t);
        }
    }
}

export function identityFrame(layout: Layout) {
  const f = new Frame(layout.cols, layout.rows);
  head(f, "→", [2021, 2026], layout);
  if (layout.phone) {
    destination(f, "GENTRIT RASHITI", 1, 19, 68, 21, 120);
    f.dotted(1, 68, 43, 0);
    stops(f, ["WEB APPS", "MOBILE APPS"], 1, 47, 11, 900);
    f.dotted(1, 68, 67, 300);
    ["PART OF TWO", "PLATFORM", "REWRITES"].forEach((text, i) =>
      f.text(text, 1, 71 + i * 9, "small", { at: 1400 + i * 200, step: DIT / 2 }),
    );
  } else {
    destination(f, "GENTRIT RASHITI", 28, 2, 130, 15, 120);
    f.dotted(2, 157, 19, 0);
    stops(f, ["WEB APPS", "MOBILE APPS", "SERVER SIDE"], 28, 23, 12, 1000);
    divider(f, 104, 300);
    (
      [
        ["PART OF 2", 23],
        ["PLATFORM", 33],
        ["REWRITES", 43],
      ] as const
    ).forEach(([text, y], i) => f.text(text, 108, y, "small", { at: 1500 + i * 200, step: DIT / 2 }));
  }
  f.sweep();
  return f;
}

const codes: [string, string][] = [
  ["W", ".--"],
  ["C", "-.-."],
];

function legend(f: Frame, x: number, y: number, stacked: boolean, at: number) {
  codes.forEach(([letter, pattern], i) => {
    const top = y + i * (stacked ? 18 : 10);
    f.text(letter, x, top, "small", { at });
    let cx = x + 9;
    for (const mark of pattern) {
      const w = mark === "-" ? 5 : 2;
      f.rect(cx, top + 2, w, 3, true, at);
      cx += w + 1;
    }
    const label = letter === "W" ? "WORK" : "EMAIL";
    if (stacked) f.text(label, x + 9, top + 9, "small", { at });
    else f.text(label, x + 30, top, "small", { at });
  });
}

export function keyFrame(layout: Layout, sent: string) {
  const f = new Frame(layout.cols, layout.rows);
  const word = sent.slice(-(layout.phone ? 7 : 9));
  if (layout.phone) {
    f.plate(1, 1, 22, 15, "→", 0);
    destination(f, "MORSE KEY", 1, 19, 68, 21, 0);
    f.dotted(1, 68, 43, 0);
    f.text(word || "HOLD", 1, 47, "large", { at: 0, step: DIT });
    f.dotted(1, 68, 67, 0);
    legend(f, 1, 71, false, 0);
  } else {
    f.plate(2, 2, 22, 15, "→", 0);
    destination(f, "MORSE KEY", 28, 2, 130, 15, 0);
    f.dotted(2, 157, 19, 0);
    f.text("SENT", 2, 23, "small", { at: 0, step: 30 });
    f.text(word || "HOLD", 28, 27, "large", { at: 0, step: DIT });
    divider(f, 104, 0);
    legend(f, 108, 23, true, 0);
  }
  f.sweep(0, 1);
  return f;
}

export function contactFrame(layout: Layout) {
  const f = new Frame(layout.cols, layout.rows);
  if (layout.phone) {
    f.plate(1, 1, 22, 15, "→", 0);
    destination(f, "CONTACT", 1, 19, 68, 21, 120);
    f.dotted(1, 68, 43, 0);
    stops(f, ["EMAIL", "LINKEDIN"], 1, 47, 11, 500);
    f.dotted(1, 68, 67, 300);
    ["GENTRIT.", "RASHITI2", "@GMAIL.COM"].forEach((text, i) =>
      f.text(text, 1, 71 + i * 9, "small", { at: 900 + i * 240, step: DIT / 2 }),
    );
  } else {
    f.plate(2, 2, 22, 15, "→", 0);
    destination(f, "CONTACT", 28, 2, 130, 15, 120);
    f.dotted(2, 157, 19, 0);
    stops(f, ["EMAIL", "LINKEDIN", "CV"], 28, 23, 12, 500);
    divider(f, 104, 300);
    ["GENTRIT.", "RASHITI2", "@GMAIL", ".COM"].forEach((text, i) =>
      f.text(text, 108, 23 + i * 9, "small", { at: 900 + i * 240, step: DIT / 2 }),
    );
  }
  f.sweep();
  return f;
}
