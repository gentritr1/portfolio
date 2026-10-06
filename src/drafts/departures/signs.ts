import { Frame, measure } from "./glyphs";
import type { Line, Result } from "./lines";

export interface Layout {
  cols: number;
  rows: number;
  phone: boolean;
  /** The window under the destination that the two pages share. Plate, years and destination stay outside it. */
  region: { x: number; y: number; w: number; h: number };
  /** Where the Morse key writes its marks. */
  trace: { x: number; y: number; w: number };
}

export const layouts: Record<"wide" | "phone", Layout> = {
  wide: {
    cols: 160,
    rows: 60,
    phone: false,
    region: { x: 28, y: 23, w: 130, h: 37 },
    trace: { x: 28, y: 46, w: 74 },
  },
  phone: {
    cols: 70,
    rows: 100,
    phone: true,
    region: { x: 1, y: 47, w: 68, h: 53 },
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

export type Page = "text" | "result";

const morseOf: Record<string, string> = { W: ".--", C: "-.-." };

/** A step sequencer: lit squares play, outlined squares rest. Columns write in time. */
function drums(f: Frame, x: number, y: number, at: number) {
  const pattern = ["10101010", "00100010", "10010010", "00000101"];
  pattern.forEach((row, r) =>
    [...row].forEach((on, c) => {
      const left = x + c * 7,
        top = y + r * 7,
        t = at + c * 110;
      for (let yy = 0; yy < 5; yy++)
        for (let xx = 0; xx < 5; xx++) {
          const edge = xx === 0 || yy === 0 || xx === 4 || yy === 4;
          f.cell(left + xx, top + yy, on === "1" || edge, t);
        }
    }),
  );
  return { w: 54, h: 26 };
}

/** A trefoil knot drawn as a thick strand. The strand that passes under leaves a gap at each crossing. */
function knot(f: Frame, x: number, y: number, size: number, at: number) {
  const samples: [number, number, number, number][] = [];
  for (let i = 0; i < 900; i++) {
    const t = (i / 900) * Math.PI * 2;
    samples.push([Math.sin(t) + 2 * Math.sin(2 * t), Math.cos(t) - 2 * Math.cos(2 * t), -Math.sin(3 * t), t]);
  }
  const xs = samples.map((p) => p[0]),
    ys = samples.map((p) => p[1]),
    minX = Math.min(...xs),
    minY = Math.min(...ys),
    span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY),
    stroke = size / 13,
    halo = stroke + 1.4,
    fit = (size - 2 * stroke - 2) / span;
  for (const p of samples) {
    p[0] = x + stroke + 1 + (p[0] - minX) * fit;
    p[1] = y + stroke + 1 + (p[1] - minY) * fit;
  }
  const apart = (a: number, b: number) => {
    const d = Math.abs(a - b) % (Math.PI * 2);
    return Math.min(d, Math.PI * 2 - d) > 0.9;
  };
  for (let row = y; row < y + size; row++)
    for (let col = x; col < x + size; col++) {
      let near = Infinity,
        depth = 0,
        when = 0;
      for (const [px, py, pz, t] of samples) {
        const d = Math.hypot(px - col - 0.5, py - row - 0.5);
        if (d < near) {
          near = d;
          depth = pz;
          when = t;
        }
      }
      if (near > stroke) continue;
      const under = samples.some(([px, py, pz, t]) => pz > depth && apart(t, when) && Math.hypot(px - col - 0.5, py - row - 0.5) <= halo);
      if (!under) f.cell(col, row, true, at + (when / (Math.PI * 2)) * 1100);
    }
  return { w: size, h: size };
}

/** The two letters the key answers, with their marks: W opens the work, C the email. */
function keyShape(f: Frame, x: number, y: number, at: number) {
  let t = at;
  ["W", "C"].forEach((letter, i) => {
    const top = y + i * 14;
    f.text(letter, x, top, "large", { at: t });
    let cx = x + 11;
    for (const mark of morseOf[letter]) {
      const w = mark === "-" ? 9 : 3;
      f.rect(cx, top + 3, w, 3, true, t);
      t += (mark === "-" ? 3 : 1) * DIT * 2;
      cx += w + 3;
    }
    t += DIT * 4;
  });
  return { w: 44, h: 23 };
}

const shapeSize = (shape: NonNullable<Result["shape"]>, layout: Layout) =>
  shape === "drums" ? { w: 54, h: 26 } : shape === "knot" ? { w: layout.phone ? 30 : layout.region.h, h: layout.phone ? 30 : layout.region.h } : { w: 44, h: 23 };

/**
 * Places a result page. The figure takes the largest scale that leaves the label and the whole line room.
 * A line that does not fit whole is left out; the strip under the board carries it.
 */
export function placeResult(result: Result, layout: Layout) {
  const { x, y, w, h } = layout.region,
    bottom = y + h;
  const options = result.shape ? [0] : [3, 2, 1];
  function attempt(scale: number) {
    const used = result.shape ? shapeSize(result.shape, layout) : { w: measure(result.figure ?? "", "large") * scale, h: 9 * scale },
      left = layout.phone ? x : x + used.w + 8,
      width = layout.phone ? w : x + w - left,
      top = layout.phone ? y + used.h + 5 : y,
      largeLabel = measure(result.label, "large") <= width,
      label = largeLabel ? [result.label] : wrap(result.label, width),
      lineTop = top + (largeLabel ? 13 : label.length * 9),
      line = wrap(result.line, width),
      fits = used.w <= w && used.h <= h && (largeLabel || label.every((part) => measure(part, "small") <= width)) && lineTop - 2 <= bottom,
      lineFits = line.every((part) => measure(part, "small") <= width) && lineTop + line.length * 9 - 2 <= bottom;
    return { scale, used, left, top, largeLabel, label, lineTop, line: lineFits ? line : [], fits, lineFits };
  }
  for (const scale of options.filter((n) => n !== 1)) {
    const next = attempt(scale);
    if (next.fits && next.lineFits) return next;
  }
  for (const scale of options) {
    const next = attempt(scale);
    if (next.fits) return next;
  }
  return attempt(1);
}

/** The result page: a large figure or a drawn shape, then a label and one short line. */
function resultPage(f: Frame, result: Result, layout: Layout, at: number) {
  const { x, y } = layout.region,
    place = placeResult(result, layout);
  if (result.shape === "drums") drums(f, x, y + (layout.phone ? 0 : 2), at);
  else if (result.shape === "knot") knot(f, x, y, place.used.w, at);
  else if (result.shape === "key") keyShape(f, x, y + (layout.phone ? 0 : 2), at);
  else if (result.figure) f.big(result.figure, x, y, place.scale, { at, step: DIT * 3 });
  let top = place.top,
    t = at + 500;
  for (const part of place.label) {
    f.text(part, place.left, top, place.largeLabel ? "large" : "small", { at: t, step: DIT, word: DIT * 3 });
    t += part.length * DIT;
    top += place.largeLabel ? 13 : 9;
  }
  t += 200;
  top = place.lineTop;
  for (const part of place.line) {
    f.text(part, place.left, top, "small", { at: t, step: DIT / 2, word: DIT * 1.5 });
    t += part.length * (DIT / 2) + 120;
    top += 9;
  }
}

export function lineFrame(line: Line, number: number, layout: Layout, page: Page, following: { name: string; number: number }) {
  const f = new Frame(layout.cols, layout.rows);
  head(f, two(number), line.years, layout);
  if (layout.phone) {
    destination(f, line.board, 1, 19, 68, 21, 120);
    f.dotted(1, 68, 43, 0);
  } else {
    destination(f, line.board, 28, 2, 130, 15, 120);
    f.dotted(2, 157, 19, 0);
  }
  if (page === "result") {
    resultPage(f, line.result, layout, 200);
    f.sweep(0, 2);
    return f;
  }
  if (layout.phone) {
    stops(f, line.stops.slice(0, 2), 1, 47, 11, 520);
    f.dotted(1, 68, 67, 300);
    next(f, following.name, following.number, 1, 71, 68, 1100);
  } else {
    stops(f, line.stops, 28, 23, 12, 520);
    divider(f, 104, 300);
    next(f, following.name, following.number, 108, 23, 50, 1200);
  }
  f.sweep();
  return f;
}

export const identityResult: Result = { figure: "5+", label: "YEARS", line: "APPS IN BOTH APP STORES." };

export function identityFrame(layout: Layout, page: Page) {
  const f = new Frame(layout.cols, layout.rows);
  head(f, "→", [2021, 2026], layout);
  if (layout.phone) {
    destination(f, "GENTRIT RASHITI", 1, 19, 68, 21, 120);
    f.dotted(1, 68, 43, 0);
  } else {
    destination(f, "GENTRIT RASHITI", 28, 2, 130, 15, 120);
    f.dotted(2, 157, 19, 0);
  }
  if (page === "result") {
    resultPage(f, identityResult, layout, 200);
    f.sweep(0, 2);
    return f;
  }
  if (layout.phone) {
    stops(f, ["WEB APPS", "MOBILE APPS"], 1, 47, 11, 900);
    f.dotted(1, 68, 67, 300);
    ["PART OF TWO", "PLATFORM", "REWRITES"].forEach((text, i) =>
      f.text(text, 1, 71 + i * 9, "small", { at: 1400 + i * 200, step: DIT / 2 }),
    );
  } else {
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
