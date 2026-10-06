import { clockText, kosovoMidnight, sunAt, sunDay, type Sun, type SunDay } from "./sun";
import { lightAt, type Light } from "./light";

export interface Frame {
  ms: number;
  sun: Sun;
  light: Light;
  live: boolean;
}
type Listener = (frame: Frame) => void;

const STIFFNESS = 350;
const DAMPING = 35;
const INTRO_MS = 1100;
const INTRO_SPAN = 90 * 60000;

/** The case pages and the 404 read this key, so a visitor's chosen hour follows them. Value: "HH:MM", Kosovo time. */
const CHOSEN = "kt-at";
const HOUR = /^(\d{1,2}):(\d{2})$/;
const toMinutes = (text: string | null) => {
  const match = HOUR.exec(text ?? "");
  return match ? Math.min(1439, Number(match[1]) * 60 + Number(match[2])) : null;
};

/** The hour the page opens at: `?at=18:40` first, then the hour chosen earlier in this tab, else null (now). */
export function openingHour(): { minutes: number | null; chosen: boolean } {
  const fromUrl = toMinutes(new URLSearchParams(location.search).get("at"));
  if (fromUrl !== null) return { minutes: fromUrl, chosen: false };
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(CHOSEN);
  } catch {
    stored = null;
  }
  const minutes = toMinutes(stored);
  return { minutes, chosen: minutes !== null };
}

function remember(ms: number | null) {
  try {
    if (ms === null) sessionStorage.removeItem(CHOSEN);
    else sessionStorage.setItem(CHOSEN, clockText(ms));
  } catch {
    // Blocked storage only loses the hour on the next page.
  }
}

/** cubic-bezier(0.65, 0, 0.35, 1), the one long event curve. */
function story(x: number) {
  let lo = 0,
    hi = 1,
    t = x;
  for (let i = 0; i < 24; i++) {
    t = (lo + hi) / 2;
    const bx = 3 * 0.65 * t * (1 - t) ** 2 + 3 * 0.35 * t * t * (1 - t) + t ** 3;
    if (bx < x) lo = t;
    else hi = t;
  }
  return 3 * t * t * (1 - t) + t ** 3;
}

/** The time the page is lit for. It follows the visitor's clock, or the hour a visitor picks; a spring carries the change. */
export class Clock {
  live = true;
  target: number;
  shown: number;
  velocity = 0;
  reduced = false;
  day: SunDay;
  private listeners = new Set<Listener>();
  private frame = 0;
  private last = 0;
  private intro: { from: number; start: number } | null = null;
  private timer = 0;
  current: Frame;

  /** With `intro`, the first frame already shows the hour the intro starts from, so the clock never runs backward. */
  constructor(start: number | null, intro: boolean) {
    const now = Date.now();
    this.day = sunDay(now);
    if (start !== null) {
      this.live = false;
      this.target = this.day.midnight + start * 60000;
    } else this.target = now;
    this.shown = intro ? this.target - INTRO_SPAN : this.target;
    this.current = this.make();
  }

  private make(): Frame {
    const sun = sunAt(this.shown);
    return { ms: this.shown, sun, light: lightAt(sun.altitude, sun.evening), live: this.live };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.current);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.current = this.make();
    for (const listener of this.listeners) listener(this.current);
  }

  private request() {
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (time: number) => {
    this.frame = 0;
    const dt = this.last ? Math.min((time - this.last) / 1000, 1 / 30) : 1 / 60;
    this.last = time;
    if (this.intro) {
      const p = Math.min(1, (time - this.intro.start) / INTRO_MS);
      this.shown = this.intro.from + (this.target - this.intro.from) * story(p);
      if (p >= 1) this.intro = null;
    } else {
      for (let i = 0; i < 2; i++) {
        const force = (this.target - this.shown) * STIFFNESS - this.velocity * DAMPING;
        this.velocity += (force * dt) / 2;
        this.shown += (this.velocity * dt) / 2;
      }
      if (Math.abs(this.target - this.shown) < 2000 && Math.abs(this.velocity) < 20000) {
        this.shown = this.target;
        this.velocity = 0;
      }
    }
    this.emit();
    if (this.intro || this.shown !== this.target) this.request();
    else this.last = 0;
  };

  /** Show today's sun moving from the first frame's hour to now, or go to now at once. */
  start() {
    if (this.reduced || this.shown === this.target) {
      this.shown = this.target;
      return this.emit();
    }
    this.intro = { from: this.shown, start: performance.now() };
    this.request();
  }

  private clamp(ms: number) {
    return Math.min(this.day.midnight + 1439 * 60000, Math.max(this.day.midnight, ms));
  }

  /** A visitor picks a time. `velocity` is in ms of sun time per second. */
  set(ms: number, options: { instant?: boolean; velocity?: number } = {}) {
    this.live = false;
    this.intro = null;
    this.target = this.clamp(ms);
    remember(this.target);
    if (this.reduced || options.instant) {
      this.shown = this.target;
      this.velocity = 0;
      this.emit();
      return;
    }
    if (options.velocity !== undefined) this.velocity = options.velocity;
    this.emit();
    this.request();
  }

  follow() {
    const now = Date.now();
    if (kosovoMidnight(now) !== this.day.midnight) this.day = sunDay(now);
    this.live = true;
    this.intro = null;
    this.target = now;
    remember(null);
    if (this.reduced) {
      this.shown = now;
      this.emit();
    } else {
      this.emit();
      this.request();
    }
  }

  /** The visitor's clock moves the page once every 30 seconds. Reduced motion keeps the hour of page load. */
  run(reduced: boolean) {
    this.reduced = reduced;
    window.clearInterval(this.timer);
    if (this.reduced) return;
    this.timer = window.setInterval(() => {
      if (this.live && !document.hidden) this.follow();
    }, 30000);
  }

  stop() {
    window.clearInterval(this.timer);
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.listeners.clear();
  }
}
