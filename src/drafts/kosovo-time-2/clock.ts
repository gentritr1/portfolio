import { clockText, kosovoMidnight, sunAt, sunDay, type Sun, type SunDay } from "./sun";
import { DARKEST, lightAt, type Light } from "./light";

export interface Frame {
  ms: number;
  sun: Sun;
  light: Light;
  live: boolean;
  /** True while "Play the day" runs. */
  playing: boolean;
}
type Listener = (frame: Frame) => void;

const STIFFNESS = 350;
const DAMPING = 35;
const INTRO_MS = 1100;
const INTRO_SPAN = 90 * 60000;
/** A frame gap longer than this ends the intro at the real hour, so a busy phone never shows a frozen, wrong time. */
const SLOW_GAP_MS = 120;
/** A hidden tab pauses frames. A gap this long ends "Play the day" at the hour it returns to. */
const PLAY_GAP_MS = 400;
const DAY_MIN = 1440;
/** "Play the day" runs from this long before sunrise to this long after sunset. */
const PLAY_EDGE_MIN = 30;
const PLAY_DAY_MS = 5200;

/** The case pages and the 404 read this key, so a visitor's chosen hour follows them. Value: "HH:MM", Kosovo time. */
const CHOSEN = "kt-at";
const HOUR = /^(\d{1,2}):(\d{2})$/;
const toMinutes = (text: string | null) => {
  const match = HOUR.exec(text ?? "");
  return match ? Math.min(1439, Number(match[1]) * 60 + Number(match[2])) : null;
};

function store(text: string | null) {
  try {
    if (text === null) sessionStorage.removeItem(CHOSEN);
    else sessionStorage.setItem(CHOSEN, text);
  } catch {
    // Blocked storage only loses the hour on the next page.
  }
}

let saving = 0;
/** A drag sets the hour on every move. Storage keeps only the hour where the drag rests. */
const remember = (ms: number | null) => {
  window.clearTimeout(saving);
  saving = window.setTimeout(() => store(ms === null ? null : clockText(ms)), 160);
};

/** The hour the page opens at. `?at=18:40` wins and stays for the visit. A fresh visit opens at the real hour;
 * the hour chosen earlier in this tab comes back only when the visitor returns from another page of the site. */
export function openingHour(returning: boolean): { minutes: number | null; chosen: boolean } {
  const fromUrl = toMinutes(new URLSearchParams(location.search).get("at"));
  if (fromUrl !== null) {
    store(`${String(Math.floor(fromUrl / 60)).padStart(2, "0")}:${String(fromUrl % 60).padStart(2, "0")}`);
    return { minutes: fromUrl, chosen: false };
  }
  if (!returning) {
    store(null);
    return { minutes: null, chosen: false };
  }
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(CHOSEN);
  } catch {
    stored = null;
  }
  const minutes = toMinutes(stored);
  return { minutes, chosen: minutes !== null };
}

/** A CSS cubic-bezier timing function as a function of progress. */
export function cubic(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0,
      hi = 1,
      t = x;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (at(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return at(t, y1, y2);
  };
}

/** The one long event curve. */
const story = cubic(0.65, 0, 0.35, 1);
/** The day itself: slower at its ends than in the middle, but never stopped. */
const daylong = cubic(0.4, 0, 0.6, 1);

/** One move of "Play the day", in minutes of the day. It takes the short way round the clock, through midnight if that is shorter. */
interface Leg {
  from: number;
  span: number;
  ms: number;
  ease: (x: number) => number;
}
function leg(from: number, to: number, ease: (x: number) => number, ms?: number): Leg {
  let span = (((to - from) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  if (span > DAY_MIN / 2) span -= DAY_MIN;
  return { from, span, ms: ms ?? 260 + (Math.abs(span) / (DAY_MIN / 2)) * 640, ease };
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
  private intro: { from: number; start: number; last: number } | null = null;
  private play: { legs: Leg[]; start: number; last: number; back: { target: number; live: boolean } } | null = null;
  private timer = 0;
  private done: () => void = () => undefined;
  /** Resolves when the intro has ended or did not play. Heavy work waits for it, so it never stalls the intro. */
  readonly ready = new Promise<void>((resolve) => {
    this.done = resolve;
  });
  current: Frame;

  /** With `intro`, the first frame already shows the hour the intro starts from, so the clock never runs backward. */
  constructor(start: number | null, intro: boolean) {
    const now = Date.now();
    this.day = sunDay(now);
    if (start !== null) {
      this.live = false;
      this.target = this.day.midnight + start * 60000;
    } else this.target = now;
    // With the sun at the darkest key at both ends, the intro changes no colour, shadow or glow, so it does not run.
    const dark = (ms: number) => sunAt(ms).altitude <= DARKEST;
    if (intro && dark(this.target) && dark(this.target - INTRO_SPAN)) intro = false;
    this.shown = intro ? this.target - INTRO_SPAN : this.target;
    this.current = this.make();
  }

  private make(): Frame {
    const sun = sunAt(this.shown);
    return { ms: this.shown, sun, light: lightAt(sun.altitude, sun.evening), live: this.live, playing: this.play !== null };
  }

  /** The light at the hour the clock is going to, after the intro or a spring. */
  settledLight(): Light {
    const sun = sunAt(this.target);
    return lightAt(sun.altitude, sun.evening);
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
    if (this.play) {
      const play = this.play;
      if (!play.last) play.start = time;
      const gap = play.last ? time - play.last : 0;
      play.last = time;
      let t = time - play.start;
      let i = 0;
      while (i < play.legs.length - 1 && t >= play.legs[i].ms) t -= play.legs[i++].ms;
      const now = play.legs[i];
      const p = Math.min(1, t / now.ms);
      if (gap > PLAY_GAP_MS || (i === play.legs.length - 1 && p >= 1)) this.endPlay();
      else {
        const minute = (((now.from + now.span * now.ease(p)) % DAY_MIN) + DAY_MIN) % DAY_MIN;
        this.shown = this.day.midnight + minute * 60000;
      }
    } else if (this.intro) {
      // The intro starts on its first frame; a long gap after that ends it.
      if (!this.intro.last) this.intro.start = time;
      const gap = this.intro.last ? time - this.intro.last : 0;
      this.intro.last = time;
      const p = gap > SLOW_GAP_MS ? 1 : Math.min(1, (time - this.intro.start) / INTRO_MS);
      this.shown = this.intro.from + (this.target - this.intro.from) * story(p);
      if (p >= 1) this.endIntro();
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
    if (this.play || this.intro || this.shown !== this.target) this.request();
    else this.last = 0;
  };

  private minuteOf(ms: number) {
    return (ms - this.day.midnight) / 60000;
  }

  /** Runs today's sun from before sunrise to after sunset, then goes back to the hour the page showed before.
   * It never writes the chosen hour, so the next page still opens at that hour. */
  playDay() {
    if (this.reduced || this.play || this.day.rise === null || this.day.set === null) return;
    if (this.intro) this.endIntro();
    const back = { target: this.target, live: this.live };
    const rise = this.minuteOf(this.day.rise) - PLAY_EDGE_MIN;
    const set = this.minuteOf(this.day.set) + PLAY_EDGE_MIN;
    const home = this.minuteOf(back.live ? Date.now() : back.target);
    this.velocity = 0;
    this.play = {
      legs: [leg(this.minuteOf(this.shown), rise, story), { ...leg(rise, set, daylong, PLAY_DAY_MS), span: set - rise }, leg(set, home, story)],
      start: 0,
      last: 0,
      back,
    };
    this.emit();
    this.request();
  }

  /** Ends "Play the day". With `instant`, the page is at its hour on the next frame; otherwise the sun goes back there. */
  stopPlay(instant = false) {
    const play = this.play;
    if (!play) return;
    if (instant) {
      this.endPlay();
      this.emit();
      return;
    }
    const home = this.minuteOf(play.back.live ? Date.now() : play.back.target);
    play.legs = [leg(this.minuteOf(this.shown), home, story)];
    play.start = 0;
    play.last = 0;
    this.request();
  }

  private endPlay() {
    const play = this.play;
    if (!play) return;
    this.play = null;
    this.live = play.back.live;
    this.target = play.back.live ? Date.now() : play.back.target;
    this.shown = this.target;
    this.velocity = 0;
  }

  private endIntro() {
    this.intro = null;
    this.done();
  }

  /** Show today's sun moving from the first frame's hour to now, or, with `skip`, go to now before the next paint. */
  start(skip = false) {
    if (skip || this.reduced || this.shown === this.target) {
      this.shown = this.target;
      this.emit();
      this.done();
      return;
    }
    this.intro = { from: this.shown, start: performance.now(), last: 0 };
    this.request();
  }

  private clamp(ms: number) {
    return Math.min(this.day.midnight + 1439 * 60000, Math.max(this.day.midnight, ms));
  }

  /** A visitor picks a time. `velocity` is in ms of sun time per second. */
  set(ms: number, options: { instant?: boolean; velocity?: number } = {}) {
    this.live = false;
    this.play = null;
    if (this.intro) this.endIntro();
    this.target = this.clamp(ms);
    remember(this.target);
    if (this.reduced || options.instant) {
      this.shown = this.target;
      this.velocity = 0;
      this.emit();
      return;
    }
    if (options.velocity !== undefined) this.velocity = options.velocity;
    // The next frame emits the new hour; an emit here would run every listener twice in one frame.
    this.request();
  }

  follow() {
    const now = Date.now();
    if (kosovoMidnight(now) !== this.day.midnight) this.day = sunDay(now);
    this.live = true;
    this.play = null;
    if (this.intro) this.endIntro();
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
      if (this.live && !this.play && !document.hidden) this.follow();
    }, 30000);
  }

  stop() {
    window.clearInterval(this.timer);
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.listeners.clear();
  }
}
