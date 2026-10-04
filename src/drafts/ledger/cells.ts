import type { CellKind } from "./data";
import { encodeQr } from "./qr";

const qr = encodeQr("INCENTIV");
const ink = "#15130F";
const paper = "#F6F1E7";
function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
) {
  ctx.fillStyle = ink;
  ctx.fillText(value, x, y);
}
function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill = paper,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function lines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
  width = 50,
) {
  for (let i = 0; i < count; i++)
    box(ctx, x, y + i * 6, width - (i % 3) * 7, 1, ink);
}

/** Small, labelled reconstructions. Values are illustrative; facts stay in the row. */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  kind: CellKind,
  colour: string,
  milliseconds: number,
) {
  const t = milliseconds / 1000;
  const phase = (t % 4) / 4;
  const step = Math.floor(t / 1.2);
  ctx.clearRect(0, 0, 160, 64);
  box(ctx, 0, 0, 160, 64, colour);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.font = '13px "Ledger Mono", monospace';
  if (kind === "vitals") {
    box(ctx, 8, 10, 144, 15, "#ffffff50");
    ctx.beginPath();
    for (let i = 0; i < 28; i++) {
      const x = 8 + i * 5.3,
        y = 32 + Math.sin(i * 0.72 + t * 0.45) * 12 + Math.cos(i * 1.3) * 7;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    text(ctx, "DEMO VITALS", 8, 59);
  } else if (kind === "queries" || kind === "images") {
    const ratio = kind === "queries" ? 2 / 16 : 337 / 972;
    box(ctx, 10, 13, 110, 10, ink);
    box(ctx, 10, 32, 110 * (1 - (1 - ratio) * phase), 10, paper);
    text(ctx, kind === "queries" ? "16 → 2" : "972 → 337 KB", 10, 58);
  } else if (kind === "components" || kind === "tokens") {
    for (let i = 0; i < 12; i++) {
      const x = 9 + (i % 6) * 24,
        y = 10 + Math.floor(i / 6) * 23;
      box(ctx, x, y, 18, 16, (step + i) % 6 === 0 ? ink : paper);
      if (kind === "tokens") box(ctx, x + 4, y + 4, 10, 8, colour);
    }
    text(ctx, kind === "components" ? "34 COMPONENTS" : "TOKEN → UI", 9, 59);
  } else if (kind === "calls") {
    for (let i = 0; i < 9; i++)
      box(
        ctx,
        10 + i * 16,
        42 - (8 + Math.sin(i + t) * 5 + (i % 3) * 7),
        8,
        8 + Math.sin(i + t) * 5 + (i % 3) * 7,
        ink,
      );
    text(ctx, "DEMO ACTIVITY", 9, 59);
  } else if (kind === "stream" || kind === "support") {
    box(ctx, 9, 8, 80, 44, ink);
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(42, 21);
    ctx.lineTo(42, 40);
    ctx.lineTo(57, 30);
    ctx.fill();
    if (kind === "stream") {
      lines(ctx, 98, 13, 4, 45);
      text(ctx, ["EN / AR", "HLS", "CHAT"][step % 3], 95, 58);
    } else {
      box(ctx, 98, 13, 49, 13);
      text(ctx, "HELP", 101, 24);
      lines(ctx, 98, 37, 3, 44);
    }
  } else if (kind === "reader" || kind === "epub" || kind === "books") {
    box(ctx, 16, 6, 58, 52);
    box(ctx, 78, 6, 58, 52);
    lines(ctx, 23, 15, 6, 43);
    lines(ctx, 85, 15, 6, 43);
    const turn = Math.sin(phase * Math.PI);
    box(ctx, 78, 6, Math.max(1, 58 * turn), 52, "#15130F20");
    text(
      ctx,
      kind === "reader" ? "EPUB" : kind === "epub" ? "A− / A+" : "BOOKS",
      106,
      60,
    );
  } else if (kind === "basket" || kind === "loyalty" || kind === "donate") {
    const bars = [2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2];
    let x = 9;
    for (const width of bars) {
      box(ctx, x, 12, width, 32, ink);
      x += width + 2;
    }
    box(ctx, 9, 12 + phase * 31, 68, 2, "#AD1E30");
    text(
      ctx,
      kind === "basket" ? "LOYALTY" : kind === "loyalty" ? "ARM64" : "STRIPE",
      82,
      30,
    );
    text(ctx, "DEMO", 82, 48);
  } else if (kind === "chat" || kind === "queue" || kind === "document") {
    const messages =
      kind === "document"
        ? ["PDF", "QUESTION", "PAGE 3"]
        : kind === "queue"
          ? ["ENQUEUE", "PLAY", "DONE"]
          : ["TEXT", "CHOICE", "NEXT"];
    for (let i = 0; i < 3; i++) {
      box(
        ctx,
        i % 2 ? 50 : 8,
        6 + i * 18,
        100,
        15,
        i <= step % 3 ? paper : "#ffffff35",
      );
      text(ctx, messages[i], i % 2 ? 54 : 12, 18 + i * 18);
    }
  } else if (kind === "calendar" || kind === "leave") {
    for (let i = 0; i < 21; i++)
      box(
        ctx,
        8 + (i % 7) * 21,
        8 + Math.floor(i / 7) * 17,
        17,
        13,
        i === step % 21 ? ink : paper,
      );
    if (kind === "leave") {
      box(ctx, 50, 25, 59, 13, ink);
      text(ctx, "LEAVE", 50, 60);
    }
  } else if (kind === "wallet") {
    const flip = Math.cos(phase * Math.PI * 2);
    ctx.save();
    ctx.translate(80, 32);
    ctx.scale(Math.max(0.08, Math.abs(flip)), 1);
    ctx.translate(-80, -32);
    box(ctx, 46, 3, 67, 58);
    ctx.fillStyle = ink;
    for (let y = 0; y < 21; y++)
      for (let x = 0; x < 21; x++)
        if (qr[y][x]) ctx.fillRect(53 + x * 2, 6 + y * 2, 2, 2);
    text(ctx, "INCENTIV", 48, 59);
    ctx.restore();
  } else if (kind === "signin") {
    ctx.beginPath();
    ctx.arc(31, 30, 18, 0, Math.PI * 2);
    ctx.stroke();
    text(
      ctx,
      step % 3 === 2 ? "SIGNED IN" : step % 3 === 1 ? "VERIFY" : "PASSKEY",
      62,
      35,
    );
  } else if (kind === "letters") {
    for (let i = 0; i < 5; i++) {
      box(ctx, 8 + i * 30, 17, 25, 29, i <= step % 5 ? "#225788" : paper);
      ctx.fillStyle = i <= step % 5 ? paper : ink;
      ctx.fillText("FJALË"[i], 15 + i * 30, 37);
    }
  } else if (kind === "cards") {
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(34 + i * 24, 34);
      ctx.rotate((i - 2) * 0.12 + Math.sin(t + i) * 0.02);
      box(ctx, -17, -24, 30, 48, paper);
      text(ctx, ["Z", "a", "!", "2", "8"][i], -9, 3);
      ctx.restore();
    }
  } else if (kind === "morse") {
    // W = .-- at a 60 ms dit, with a long Farnsworth letter gap.
    const clock = milliseconds % 1800;
    const on =
      clock < 60 ||
      (clock >= 120 && clock < 300) ||
      (clock >= 360 && clock < 540);
    ctx.fillStyle = on ? ink : "#ffffff70";
    ctx.beginPath();
    ctx.arc(27, 30, 13, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ". − −", 54, 30);
    text(ctx, "W · 60 MS DIT", 9, 57);
  } else if (kind === "map") {
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(160, 17);
    ctx.moveTo(48, 0);
    ctx.lineTo(103, 64);
    ctx.moveTo(0, 14);
    ctx.lineTo(160, 47);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(78 + Math.sin(t * 0.4) * 12, 32, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, "GUESS", 108, 59);
  } else if (kind === "race") {
    box(ctx, 0, 36, 160, 28, ink);
    for (let i = 0; i < 5; i++)
      box(ctx, ((i * 40 + phase * 40) % 180) - 20, 49, 18, 2, paper);
    box(ctx, 59, 38, 35, 9, paper);
    text(ctx, "7 CIRCUITS", 9, 22);
  } else if (kind === "town") {
    for (let i = 0; i < 5; i++) {
      const h = 14 + (i % 3) * 7;
      box(ctx, 11 + i * 30, 42 - h, 22, h, ink);
      box(ctx, 15 + i * 30, 36 - h, 5, 6);
    }
    box(ctx, 12 + phase * 135, 49, 5, 8, ink);
    text(ctx, "AI", 125, 15);
  } else {
    ctx.beginPath();
    ctx.moveTo(18, 49);
    ctx.lineTo(18, 11);
    ctx.moveTo(18, 37);
    ctx.bezierCurveTo(70, 37, 55, 17, 117, 17);
    ctx.stroke();
    for (const [x, y] of [
      [18, 11],
      [18, 49],
      [117, 17],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, step % 2 ? "PDF" : "EPUB", 108, 52);
  }
}

interface LiveCell {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  kind: CellKind;
  colour: string;
  visible: boolean;
}

/** One clock and one observer for all rows. React never renders on animation frames. */
export function createScheduler() {
  const cells = new Map<HTMLCanvasElement, LiveCell>();
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let alive = true;
  let frame = 0,
    frames = 0,
    lastSample = 0;
  const draw = (cell: LiveCell, time: number) =>
    drawCell(cell.context, cell.kind, cell.colour, time);
  const loop = (time: number) => {
    frame = 0;
    if (document.hidden || preference.matches) return;
    const visible = [...cells.values()].filter((cell) => cell.visible);
    if (!visible.length) return;
    for (const cell of visible) draw(cell, time);
    frames++;
    if (time - lastSample >= 1000) {
      document
        .querySelector<HTMLElement>(".draft-ledger")
        ?.setAttribute("data-active-cells", String(visible.length));
      document
        .querySelector<HTMLElement>(".draft-ledger")
        ?.setAttribute(
          "data-sample-fps",
          String(Math.round((frames * 1000) / (time - lastSample))),
        );
      lastSample = time;
      frames = 0;
    }
    frame = requestAnimationFrame(loop);
  };
  const wake = () => {
    if (document.hidden || preference.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (preference.matches)
        for (const cell of cells.values()) draw(cell, 1200);
    } else if (!frame) {
      lastSample = performance.now();
      frames = 0;
      frame = requestAnimationFrame(loop);
    }
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const cell = cells.get(entry.target as HTMLCanvasElement);
      if (cell) cell.visible = entry.isIntersecting;
    }
    wake();
  });
  document.fonts.ready.then(() => {
    if (alive) {
      for (const cell of cells.values()) draw(cell, 1200);
      wake();
    }
  });
  document.addEventListener("visibilitychange", wake);
  preference.addEventListener("change", wake);
  return {
    register(canvas: HTMLCanvasElement, kind: CellKind, colour: string) {
      const context = canvas.getContext("2d");
      if (!context) return () => {};
      const cell = { canvas, context, kind, colour, visible: false };
      cells.set(canvas, cell);
      draw(cell, 1200);
      observer.observe(canvas);
      return () => {
        observer.unobserve(canvas);
        cells.delete(canvas);
      };
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      cells.clear();
      document.removeEventListener("visibilitychange", wake);
      preference.removeEventListener("change", wake);
    },
  };
}
