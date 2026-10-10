import { useEffect, useRef, type CSSProperties } from "react";
import { H, layerShots, W, WEEK } from "./data";
import { decode, ROOM_QUERY, SHEEN_AFTER, sheen } from "./room";

/** Depth between two layers at the middle of the hand-off, in px. */
const GAP = 90;
/** How far the camera pulls back, and how far the screen tilts back onto the floor, at the middle. */
const PULL = 420;
const TILT = 52;
const TURN = -18;
/** How far the screen sinks below its straight path at the middle, in px, so it passes under the hero's role line. */
const SINK = 90;
/** A return from a case page restores the scroll position in the first frames; the hand-off waits for it. */
const RESTORE = 1000;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/**
 * 0 at both ends and flat there, so the swap to a real image shows no step. The peak is at 62 % of the way,
 * after the hero headline has passed over the screen, so the layers stand apart where nothing covers them.
 */
const bump = (p: number) => Math.sin(Math.PI * p ** 1.45) ** 2;

interface Geometry {
  /** The hero screen and chapter 1's slab, in page pixels. */
  from: { cx: number; cy: number; w: number };
  to: { cx: number; cy: number; w: number; h: number };
  /** The hero headline and role line, in page pixels: the screen is dimmed while it passes behind them. */
  text: { top: number; bottom: number };
  /** The scroll position where the screen rests in chapter 1, centred on the screen. */
  end: number;
}

type Where = "hero" | "air" | "slab";

/**
 * The hero screen and chapter 1's screen are one object. While the reader scrolls from the hero to chapter 1,
 * the screen leaves its window, tilts back onto the floor, comes apart into its four layers and lands flat in
 * chapter 1's place. Scroll drives every frame, so it reverses when the reader scrolls up. At both ends the real
 * images show; the flying copy exists only between them.
 */
export function Handoff({ seen }: { seen: boolean }) {
  const view = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = view.current;
    const cam = rig.current;
    const build = document.querySelector<HTMLElement>(".lp-build");
    const frame = build?.querySelector<HTMLElement>(".lp-build-frame");
    const foot = build?.querySelector<HTMLElement>(".lp-build-foot");
    // The loop around the screen (the side cards and the seal) leaves with the hero window.
    const around = build ? [...build.querySelectorAll<HTMLElement>(".hb-side, .hb-seal")] : [];
    const fading = foot ? [foot, ...around] : [];
    const screen = frame?.querySelector<HTMLElement>(".fr-screen");
    const line = document.querySelector<HTMLElement>(".lp-hero .lp-display");
    const role = document.querySelector<HTMLElement>(".lp-hero .lp-role");
    const slab = document.querySelector<HTMLElement>(".xp-view");
    const lamp = document.querySelector<HTMLElement>(".lp-room-light");
    if (!stage || !cam || !build || !frame || !foot || !screen || !line || !role || !slab || !lamp) return;
    const shot = cam.querySelector<HTMLElement>(".ho-shot")!;
    const base = cam.querySelector<HTMLElement>(".ho-base")!;
    const layers = [...cam.querySelectorAll<HTMLElement>(".ho-layer")];
    const moving = [cam, shot, base, frame, ...around, ...layers];
    const room = window.matchMedia(ROOM_QUERY);

    let mode: "off" | "wait" | "on" = "off";
    let where: Where = "hero";
    let g: Geometry | undefined;
    let decoded = false;
    let restored = !seen;
    let lit = false;
    let raf = 0;

    const measure = () => {
      const x = window.scrollX;
      const y = window.scrollY;
      const a = screen.getBoundingClientRect();
      const b = slab.getBoundingClientRect();
      const end = b.top + y + b.height / 2 - window.innerHeight / 2;
      g = {
        from: { cx: a.left + x + a.width / 2, cy: a.top + y + a.height / 2, w: a.width },
        to: { cx: b.left + x + b.width / 2, cy: b.top + y + b.height / 2, w: b.width, h: b.height },
        text: { top: line.getBoundingClientRect().top + y, bottom: role.getBoundingClientRect().bottom + y },
        end,
      };
      cam.style.width = `${b.width}px`;
      cam.style.height = `${b.height}px`;
    };

    const still = () => {
      for (const node of moving) delete node.dataset.moving;
    };

    const land = (end: Where) => {
      if (where === end) return;
      const from = where;
      where = end;
      delete stage.dataset.on;
      delete build.dataset.handoff;
      delete slab.dataset.handoff;
      delete lamp.dataset.dark;
      frame.style.opacity = "";
      for (const node of fading) node.style.opacity = "";
      still();
      if (end === "slab" && from === "air" && !lit) {
        lit = true;
        const band = slab.querySelector<HTMLElement>(".room-sheen");
        if (band) sheen(band, SHEEN_AFTER);
      }
    };

    const fly = (p: number, geo: Geometry) => {
      if (where !== "air") {
        where = "air";
        stage.dataset.on = "";
        build.dataset.handoff = "away";
        slab.dataset.handoff = "away";
      }
      if (cam.dataset.moving === undefined) for (const node of moving) node.dataset.moving = "";

      const t = bump(p);
      const k = lerp(geo.from.w / geo.to.w, 1, p);
      const z = PULL * t;
      const cx = lerp(geo.from.cx, geo.to.cx, p) - window.scrollX;
      const cy = lerp(geo.from.cy, geo.to.cy, p) - window.scrollY + SINK * t;
      // Under 1 degree of tilt the move is drawn as a flat move and scale: one plain plane is cheaper to draw.
      const flat = t < 0.02;
      if (flat !== (stage.dataset.flat !== undefined)) {
        if (flat) stage.dataset.flat = "";
        else delete stage.dataset.flat;
      }
      cam.style.transform = flat
        ? `translate(${cx - geo.to.w / 2}px, ${cy - geo.to.h / 2}px) scale(${k})`
        : `translate3d(${cx - geo.to.w / 2}px, ${cy - geo.to.h / 2}px, ${-z}px) rotateX(${TILT * t}deg) rotateZ(${TURN * t}deg) scale(${k})`;

      // The screen passes behind the headline in the dark part of the room: it dims so the words stay readable.
      const tilt = (TILT * t * Math.PI) / 180;
      const half = ((geo.to.h * k * Math.cos(tilt) + 2 * 3 * GAP * t * Math.sin(tilt)) * (1800 / (1800 + z))) / 2;
      const top = geo.text.top - window.scrollY;
      const bottom = geo.text.bottom - window.scrollY;
      const cover = Math.max(0, Math.min(cy + half, bottom) - Math.max(cy - half, top)) / (bottom - top);
      const light = 1 - 0.72 * smooth(0, 0.5, cover);

      // The whole copy shows until the layers part by a few pixels; only one of the two is drawn outside that short
      // window, because each full-size plane in the stack costs compositor time on every frame.
      const apart = smooth(0.02, 0.05, t);
      const under = apart > 0 ? String(light) : "0";
      shot.style.opacity = String(light * (1 - apart));
      base.style.transform = `translate3d(0, 0, ${(0.5 * GAP * t).toFixed(2)}px)`;
      base.style.opacity = under;
      layers.forEach((layer, i) => {
        layer.style.transform = `translate3d(0, 0, ${(i * GAP * t).toFixed(2)}px)`;
        layer.style.opacity = under;
      });
      // Written on every change, so a jump past the first 10 % (a link, the End key) still hides the hero window.
      const left = String(1 - smooth(0, 0.1, p));
      if (frame.style.opacity !== left) {
        frame.style.opacity = left;
        for (const node of fading) node.style.opacity = left;
      }
      // The room's light pool is a second full-screen layer; with it off, the flying stack fits in a frame.
      const dark = p > 0.06 && p < 0.94;
      if (dark !== (lamp.dataset.dark !== undefined)) {
        if (dark) lamp.dataset.dark = "";
        else delete lamp.dataset.dark;
      }
    };

    const step = () => {
      raf = 0;
      if (mode === "off" || !g) return;
      const p = clamp(window.scrollY / g.end);
      if (mode === "wait") {
        if (p > 0 && p < 1) return;
        mode = "on";
        slab.dataset.owned = "";
      }
      if (p <= 0) land("hero");
      else if (p >= 1) land("slab");
      else fly(p, g);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const off = () => {
      mode = "off";
      land(window.scrollY > 0 ? "slab" : "hero");
      delete slab.dataset.owned;
    };

    const check = () => {
      const ready = room.matches && decoded && restored && build.dataset.phase === "done";
      if (!ready) {
        if (mode !== "off") off();
        return;
      }
      measure();
      if (!g || g.end < 200) {
        if (mode !== "off") off();
        return;
      }
      if (mode === "off") mode = "wait";
      schedule();
    };

    decode([WEEK, ...layerShots.map((l) => l.src)]).then(() => {
      decoded = true;
      check();
    });
    const wait = seen
      ? window.setTimeout(() => {
          restored = true;
          check();
        }, RESTORE)
      : 0;

    // The build's last frame is busy; the hand-off measures the page a moment later.
    let later = 0;
    const phase = new MutationObserver(() => {
      window.clearTimeout(later);
      later = window.setTimeout(check, 300);
    });
    phase.observe(build, { attributes: true, attributeFilter: ["data-phase"] });
    const sizes = new ResizeObserver(check);
    sizes.observe(document.documentElement);
    room.addEventListener("change", check);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      window.clearTimeout(wait);
      window.clearTimeout(later);
      cancelAnimationFrame(raf);
      phase.disconnect();
      sizes.disconnect();
      room.removeEventListener("change", check);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", check);
      off();
    };
  }, [seen]);

  return (
    <div className="ho-view" ref={view} aria-hidden="true">
      <div className="ho-rig" ref={rig}>
        <span className="ho-base" />
        {layerShots.map(({ src, box: [x, y, w, h] }) => (
          <img
            key={src}
            className="ho-layer"
            src={src}
            alt=""
            decoding="async"
            style={{ "--x": x / W, "--y": y / H, "--w": w / W, "--h": h / H } as CSSProperties}
          />
        ))}
        <img className="ho-shot" src={WEEK} alt="" width={1440} height={900} decoding="async" />
      </div>
    </div>
  );
}
