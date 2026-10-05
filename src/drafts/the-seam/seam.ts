export type Feel = "follow" | "throw" | "key" | "tick" | "intro" | "switch";

const feels: Record<Feel, [number, number]> = {
  follow: [1000, 0.85],
  throw: [260, 0.55],
  key: [420, 0.62],
  tick: [1600, 0.72],
  intro: [110, 0.74],
  switch: [210, 0.8],
};
const cordSpring: [number, number] = [150, 0.4];
const rowSpring: [number, number] = [520, 1];
const maxBow = 64;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

interface Face {
  el: HTMLElement;
  row: number;
}

interface Sample {
  x: number;
  t: number;
}

/** Positions are in percent of the root width. 100 shows the old skin only. */
export class Seam {
  x = 100;
  v = 0;
  target = 100;
  ends = 100;
  endsV = 0;
  rest = 39.2857;
  blocked = -1;
  reduced = false;
  timeScale = 1;
  onStep: (step: number) => void = () => {};

  private k = 420;
  private c = 2 * 0.62 * Math.sqrt(420);
  private m: number[];
  private mv: number[];
  private faces: Face[] = [];
  private frame = 0;
  private last = 0;
  private step = -1;
  private width = 1;
  private left = 0;
  private height = 1;
  private knobY = 0;
  private samples: Sample[] = [];
  private grab = 0;
  private dragging = false;
  private root: HTMLElement;
  private count: number;

  constructor(root: HTMLElement, count: number) {
    this.root = root;
    this.count = count;
    this.m = Array.from({ length: count }, () => 0);
    this.mv = Array.from({ length: count }, () => 0);
    this.measure();
  }

  stepPos(step: number) {
    return 100 - (step / this.count) * (100 - this.rest);
  }

  stepOf(x: number) {
    return clamp(
      Math.floor(((100 - x) / (100 - this.rest)) * this.count + 1e-4),
      0,
      this.count,
    );
  }

  stops() {
    const list = Array.from({ length: this.count + 1 }, (_, step) =>
      this.stepPos(step),
    );
    return this.rest > 0 ? [...list, 0] : list;
  }

  nearest(x: number) {
    const list = this.stops();
    let best = 0;
    list.forEach((value, index) => {
      if (Math.abs(value - x) < Math.abs(list[best] - x)) best = index;
    });
    return { index: best, list };
  }

  current() {
    return this.nearest(this.target).index;
  }

  measure() {
    const box = this.root.getBoundingClientRect();
    this.width = Math.max(1, box.width);
    this.left = box.left;
    this.height = window.innerHeight;
    const runner = parseFloat(
      getComputedStyle(this.root).getPropertyValue("--runner") || "0",
    );
    this.knobY = (this.height - runner) / 2;
  }

  refresh() {
    this.faces = Array.from(
      this.root.querySelectorAll<HTMLElement>("[data-skin='old']"),
    ).map((el) => ({ el, row: Number(el.dataset.row ?? -1) }));
    this.write();
  }

  to(target: number, feel: Feel, velocity?: number) {
    const [k, zeta] = feels[feel];
    this.k = k;
    this.c = 2 * zeta * Math.sqrt(k);
    this.target = target;
    if (velocity !== undefined) this.v = velocity;
    if (this.reduced) {
      this.x = target;
      this.ends = target;
      this.v = 0;
      this.endsV = 0;
      this.settleRows();
      this.write();
      return;
    }
    this.run();
  }

  kick(velocity: number) {
    if (this.reduced) return;
    this.v += velocity;
    this.endsV -= velocity * 0.4;
    this.run();
  }

  setRest(rest: number) {
    this.rest = rest;
  }

  press(clientX: number, time: number) {
    this.measure();
    this.dragging = true;
    this.grab = this.toPercent(clientX) - this.x;
    this.samples = [{ x: this.toPercent(clientX), t: time }];
    const [k, zeta] = feels.follow;
    this.k = k;
    this.c = 2 * zeta * Math.sqrt(k);
  }

  move(clientX: number, time: number) {
    if (!this.dragging) return;
    const pointer = this.toPercent(clientX);
    this.samples.push({ x: pointer, t: time });
    while (this.samples.length > 2 && time - this.samples[0].t > 100)
      this.samples.shift();
    let wanted = pointer - this.grab;
    if (wanted > 100) wanted = 100 + (wanted - 100) * 0.22;
    if (wanted < 0) wanted *= 0.22;
    this.target = wanted;
    if (this.reduced) {
      this.x = wanted;
      this.ends = wanted;
      this.settleRows();
      this.write();
      return;
    }
    this.run();
  }

  release(time: number) {
    if (!this.dragging) return;
    this.dragging = false;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const span = (last?.t ?? 0) - (first?.t ?? 0);
    const fresh = last && time - last.t < 80;
    const velocity =
      fresh && span > 0 ? ((last.x - first.x) / span) * 1000 : 0;
    const predicted = this.x + velocity * 0.2;
    const { index, list } = this.nearest(clamp(predicted, 0, 100));
    this.to(list[index], "throw", this.reduced ? 0 : velocity);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private toPercent(clientX: number) {
    return ((clientX - this.left) / this.width) * 100;
  }

  private rowTarget(row: number, step: number) {
    return row < step && row !== this.blocked ? 1 : 0;
  }

  private settleRows() {
    const step = this.stepOf(this.x);
    this.m = this.m.map((_, row) => this.rowTarget(row, step));
    this.mv = this.mv.map(() => 0);
  }

  private run() {
    if (this.frame) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const elapsed =
      Math.min(0.25, Math.max(0.001, (now - this.last) / 1000)) * this.timeScale;
    this.last = now;
    const steps = Math.ceil(elapsed * 240);
    const h = elapsed / steps;
    const [ke, ze] = cordSpring;
    const ce = 2 * ze * Math.sqrt(ke);
    const [kr, zr] = rowSpring;
    const cr = 2 * zr * Math.sqrt(kr);
    let step = this.stepOf(this.x);
    for (let i = 0; i < steps; i++) {
      const a = this.k * (this.target - this.x) - this.c * this.v;
      this.v += a * h;
      this.x += this.v * h;
      const ae = ke * (this.x - this.ends) - ce * this.endsV;
      this.endsV += ae * h;
      this.ends += this.endsV * h;
      step = this.stepOf(this.x);
      for (let row = 0; row < this.count; row++) {
        const goal = this.rowTarget(row, step);
        const ar = kr * (goal - this.m[row]) - cr * this.mv[row];
        this.mv[row] += ar * h;
        this.m[row] += this.mv[row] * h;
      }
    }
    let rowsMoving = false;
    for (let row = 0; row < this.count; row++) {
      const goal = this.rowTarget(row, step);
      if (Math.abs(goal - this.m[row]) > 0.001 || Math.abs(this.mv[row]) > 0.01)
        rowsMoving = true;
      else {
        this.m[row] = goal;
        this.mv[row] = 0;
      }
    }
    const still =
      !this.dragging &&
      Math.abs(this.target - this.x) < 0.005 &&
      Math.abs(this.v) < 0.03 &&
      Math.abs(this.ends - this.x) < 0.01 &&
      Math.abs(this.endsV) < 0.05 &&
      !rowsMoving;
    if (still) {
      this.x = this.target;
      this.v = 0;
      this.ends = this.x;
      this.endsV = 0;
      this.frame = 0;
      this.write();
      return;
    }
    this.write();
    this.frame = requestAnimationFrame(this.tick);
  };

  private write() {
    const width = this.width;
    const xPx = (clamp(this.x, -2, 102) / 100) * width;
    const bow = this.reduced
      ? 0
      : clamp(((this.ends - this.x) / 100) * width, -maxBow, maxBow);
    const knobY = this.knobY;
    const height = this.height;
    const reach = (y: number) => {
      const d = (y - knobY) / (y < knobY ? knobY : height - knobY);
      const t = clamp(d, -1, 1);
      return xPx + bow * t * t;
    };

    const style = this.root.style;
    style.setProperty("--seam-x", `${xPx.toFixed(2)}px`);
    const tilt = this.reduced ? 0 : clamp((this.v / 100) * width * 0.006, -10, 10);
    style.setProperty("--seam-tilt", `${tilt.toFixed(2)}deg`);

    const cord = this.root.querySelector<SVGSVGElement>(".seam-cord");
    if (cord) cord.style.opacity = this.x <= 0.3 || this.x >= 99.7 ? "0" : "1";
    const path = this.root.querySelector<SVGPathElement>(".seam-cord-path");
    const edge = this.root.querySelector<SVGPathElement>(".seam-cord-edge");
    if (path && edge) {
      let d = "";
      const parts = 24;
      for (let i = 0; i <= parts; i++) {
        const y = (i / parts) * height;
        d += `${i ? "L" : "M"}${reach(y).toFixed(1)} ${y.toFixed(1)}`;
      }
      path.setAttribute("d", d);
      edge.setAttribute("d", d);
    }

    const bent = Math.abs(bow) > 0.5;
    for (const face of this.faces) {
      const share = face.row >= 0 ? clamp(this.m[face.row] ?? 1, 0, 1) : 1;
      if (!bent) {
        const edgeX = width - share * (width - xPx);
        const right = clamp(width - edgeX, 0, width);
        face.el.style.clipPath = `inset(-1px ${right.toFixed(1)}px -1px 0)`;
        continue;
      }
      const box = face.el.getBoundingClientRect();
      const local = this.left - box.left;
      const parts = clamp(Math.ceil(box.height / 56), 1, 18);
      let polygon = "0 -1px";
      for (let i = 0; i <= parts; i++) {
        const y = box.top + (i / parts) * box.height;
        const edgeX = width - share * (width - reach(y)) + local;
        const at =
          i === 0 ? "-1px" : i === parts ? "calc(100% + 1px)" : `${((i / parts) * 100).toFixed(2)}%`;
        polygon += `, ${clamp(edgeX, 0, width).toFixed(1)}px ${at}`;
      }
      polygon += ", 0 calc(100% + 1px)";
      face.el.style.clipPath = `polygon(${polygon})`;
    }

    const step = this.stepOf(this.x);
    if (step !== this.step) {
      this.step = step;
      this.onStep(step);
    }
  }

  get stepNow() {
    return this.stepOf(this.x);
  }
}
