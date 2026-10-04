export interface CardPosition {
  id: string;
  x: number;
  y: number;
  angle: number;
  z: number;
  fade?: number;
}
interface Body extends CardPosition {
  previousX: number;
  previousY: number;
  previousAngle: number;
  targetX: number;
  targetY: number;
  targetAngle: number;
  baseAngle: number;
  tilt: number;
  readyAt: number;
  held: boolean;
  thrown: boolean;
  free: boolean;
  landed: boolean;
  resting: number;
}
interface TableOptions {
  element: HTMLElement;
  nodes: Map<string, HTMLElement>;
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  reduced: boolean;
  onReturn: (id: string) => void;
  onLand: (id: string) => void;
}
export interface LayoutOptions {
  /** New cards leave this point one by one. Existing cards travel from where they are. */
  from?: { x: number; y: number; angle: number };
  stagger?: number;
  /** A placed card keeps its place until a deal or a spread gathers it. */
  gather?: boolean;
}

const step = 1 / 120;
const frameTime = 1 / 60;
const stiffness = 350 * step * step;
const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

/** Two fixed Verlet substeps per 60Hz frame. The loop sleeps once every card settles. */
export function createCardTable(options: TableOptions) {
  const bodies = new Map<string, Body>();
  let frame = 0;
  let lastTime = 0;
  let accumulator = 0;
  let visible = true;
  let disposed = false;
  const radius = Math.min(options.cardWidth * 0.29, 56);
  const damping = Math.exp(-30 * step);

  function draw(body: Body, now: number) {
    const node = options.nodes.get(body.id);
    if (!node) return;
    node.style.transform = `translate3d(${body.x - options.cardWidth / 2}px,${body.y - options.cardHeight / 2}px,0) rotate(${body.angle}deg)`;
    node.style.zIndex = String(body.held ? 300 : body.z);
    const waiting = now < body.readyAt;
    const fade = body.fade ?? 1;
    node.style.opacity = waiting ? "0" : String(fade);
    node.style.visibility = waiting || fade < 0.02 ? "hidden" : "visible";
    node.dataset.moving = String(body.held || body.resting < 12);
    node.dataset.held = String(body.held);
  }

  function land(body: Body) {
    if (body.landed) return;
    body.landed = true;
    const node = options.nodes.get(body.id);
    if (node) node.dataset.landed = "true";
    options.onLand(body.id);
  }

  function integrate(now: number) {
    for (const body of bodies.values()) {
      if (body.held) {
        body.angle += (body.baseAngle + body.tilt - body.angle) * 0.2;
        body.previousAngle = body.angle;
        body.tilt *= 0.93;
        continue;
      }
      if (now < body.readyAt) continue;
      if (body.thrown) {
        const velocityX = (body.x - body.previousX) * 0.985;
        const velocityY = (body.y - body.previousY) * 0.985;
        body.previousX = body.x;
        body.previousY = body.y;
        body.x += velocityX;
        body.y += velocityY;
        body.angle += clamp(velocityX * 0.12, -3, 3);
        if (
          body.x < -options.cardWidth ||
          body.x > options.width + options.cardWidth ||
          body.y < -options.cardHeight ||
          body.y > options.height + options.cardHeight ||
          Math.hypot(velocityX, velocityY) < 0.2
        ) {
          bodies.delete(body.id);
          options.onReturn(body.id);
        }
        continue;
      }
      const velocityX = (body.x - body.previousX) * damping;
      const velocityY = (body.y - body.previousY) * damping;
      const velocityAngle = (body.angle - body.previousAngle) * damping;
      body.previousX = body.x;
      body.previousY = body.y;
      body.previousAngle = body.angle;
      body.x += velocityX + (body.targetX - body.x) * stiffness;
      body.y += velocityY + (body.targetY - body.y) * stiffness;
      body.angle += velocityAngle + (body.targetAngle - body.angle) * stiffness;
      const distance = Math.hypot(body.targetX - body.x, body.targetY - body.y);
      if (!body.landed && distance < 6) land(body);
      const settled =
        distance < 0.2 &&
        Math.hypot(velocityX, velocityY) < 0.03 &&
        Math.abs(body.targetAngle - body.angle) < 0.1;
      body.resting = settled ? body.resting + 1 : 0;
      if (body.resting > 12) {
        body.x = body.previousX = body.targetX;
        body.y = body.previousY = body.targetY;
        body.angle = body.previousAngle = body.targetAngle;
      }
    }
    // Only a held card pushes. The circle is smaller than the card, so a hand
    // can overlap while a dragged card still shoulders its neighbour aside.
    const current = [...bodies.values()];
    for (let i = 0; i < current.length; i++)
      for (let j = i + 1; j < current.length; j++) {
        const a = current[i],
          b = current[j];
        if (
          (!a.held && !b.held) ||
          a.thrown ||
          b.thrown ||
          !a.landed ||
          !b.landed
        )
          continue;
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        // Separate only where the resting layout also has room, so an
        // overlapping fan does not fight the solver.
        if (
          distance >= radius * 2 ||
          Math.hypot(b.targetX - a.targetX, b.targetY - a.targetY) < radius * 2
        )
          continue;
        const amount = (radius * 2 - distance) * 0.5;
        const nx = distance > 0.001 ? dx / distance : 1,
          ny = distance > 0.001 ? dy / distance : 0;
        if (!a.held) {
          a.x -= nx * amount;
          a.y -= ny * amount;
          a.resting = 0;
        }
        if (!b.held) {
          b.x += nx * amount;
          b.y += ny * amount;
          b.resting = 0;
        }
      }
  }

  function tick(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) {
      lastTime = 0;
      return;
    }
    accumulator += lastTime
      ? Math.min((time - lastTime) / 1000, 0.05)
      : frameTime;
    lastTime = time;
    while (accumulator >= frameTime) {
      integrate(time);
      integrate(time);
      accumulator -= frameTime;
    }
    let active = false;
    for (const body of bodies.values()) {
      draw(body, time);
      active ||=
        body.thrown || body.held || body.readyAt > time || body.resting <= 12;
    }
    if (active) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function wake() {
    if (!frame && visible && !document.hidden && !disposed && !options.reduced)
      frame = requestAnimationFrame(tick);
  }

  function layout(
    positions: CardPosition[],
    layoutOptions: LayoutOptions = {},
  ) {
    const { from, stagger = 0.06, gather = false } = layoutOptions;
    const ids = new Set(positions.map((position) => position.id));
    for (const id of bodies.keys()) if (!ids.has(id)) bodies.delete(id);
    const now = performance.now();
    let order = 0;
    for (const position of positions) {
      const existing = bodies.get(position.id);
      if (existing) {
        existing.z = position.z;
        existing.fade = position.fade;
        if (gather) existing.free = false;
        if (existing.held || existing.thrown || existing.free) {
          draw(existing, now);
          continue;
        }
        existing.targetX = position.x;
        existing.targetY = position.y;
        existing.targetAngle = existing.baseAngle = position.angle;
        existing.resting = 0;
        if (options.reduced) {
          existing.x = existing.previousX = position.x;
          existing.y = existing.previousY = position.y;
          existing.angle = existing.previousAngle = position.angle;
          existing.resting = 20;
        }
        draw(existing, now);
        continue;
      }
      const flying = Boolean(from) && !options.reduced;
      const start = flying && from ? from : position;
      const body: Body = {
        ...position,
        x: start.x,
        y: start.y,
        angle: start.angle,
        previousX: start.x,
        previousY: start.y,
        // A dealt card leaves the deck already turning.
        previousAngle: start.angle + (flying ? 1.4 : 0),
        targetX: position.x,
        targetY: position.y,
        targetAngle: position.angle,
        baseAngle: position.angle,
        tilt: 0,
        held: false,
        thrown: false,
        free: false,
        landed: !flying,
        readyAt: flying ? now + order * stagger * 1000 : 0,
        resting: flying ? 0 : 20,
      };
      if (flying) order += 1;
      bodies.set(position.id, body);
      const node = options.nodes.get(position.id);
      if (node) node.dataset.landed = flying ? "false" : "still";
      if (!flying) options.onLand(position.id);
      draw(body, now);
    }
    wake();
  }

  function grab(id: string) {
    const body = bodies.get(id);
    if (!body) return null;
    body.held = true;
    body.thrown = false;
    body.previousX = body.x;
    body.previousY = body.y;
    body.resting = 0;
    body.tilt = 0;
    draw(body, performance.now());
    wake();
    return { x: body.x, y: body.y };
  }

  /** The tilt follows pointer speed, not distance, and rights itself when the pointer stops. */
  function move(id: string, x: number, y: number, velocityX: number) {
    const body = bodies.get(id);
    if (!body) return;
    body.x = body.previousX = x;
    body.y = body.previousY = y;
    if (!options.reduced)
      body.tilt = body.tilt * 0.5 + clamp(velocityX * 0.009, -16, 16) * 0.5;
    draw(body, performance.now());
    wake();
  }

  function release(id: string, velocityX: number, velocityY: number) {
    const body = bodies.get(id);
    if (!body) return false;
    body.held = false;
    const predictedX = body.x + velocityX * 0.2;
    const predictedY = body.y + velocityY * 0.2;
    const thrown =
      !options.reduced &&
      (predictedX < -30 ||
        predictedX > options.width + 30 ||
        predictedY < -30 ||
        predictedY > options.height + 30);
    body.thrown = thrown;
    body.free = !thrown;
    body.previousX = body.x - velocityX * step;
    body.previousY = body.y - velocityY * step;
    body.targetX = clamp(
      Math.round(predictedX / 8) * 8,
      options.cardWidth / 2 + 12,
      options.width - options.cardWidth / 2 - 12,
    );
    body.targetY = clamp(
      Math.round(predictedY / 8) * 8,
      options.cardHeight / 2 + 16,
      options.height - options.cardHeight / 2 - 16,
    );
    body.targetAngle = body.baseAngle;
    body.tilt = 0;
    body.readyAt = 0;
    body.resting = 0;
    if (options.reduced) {
      body.x = body.previousX = body.targetX;
      body.y = body.previousY = body.targetY;
      body.angle = body.previousAngle = body.targetAngle;
      body.resting = 20;
    }
    draw(body, performance.now());
    wake();
    return thrown;
  }

  function nudge(id: string, dx: number, dy: number) {
    const body = bodies.get(id);
    if (!body) return;
    grab(id);
    move(id, body.x + dx, body.y + dy, 0);
    release(id, 0, 0);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    },
    { rootMargin: "80px" },
  );
  observer.observe(options.element);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else wake();
  };
  document.addEventListener("visibilitychange", visibility);
  return {
    layout,
    grab,
    move,
    release,
    nudge,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}

export type CardTable = ReturnType<typeof createCardTable>;
