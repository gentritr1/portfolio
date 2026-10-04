export interface CardPosition {
  id: string;
  x: number;
  y: number;
  angle: number;
}
interface Body extends CardPosition {
  previousX: number;
  previousY: number;
  targetX: number;
  targetY: number;
  targetAngle: number;
  baseAngle: number;
  readyAt: number;
  held: boolean;
  thrown: boolean;
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
}

const step = 1 / 120;
const frameTime = 1 / 60;
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

  function draw(body: Body) {
    const node = options.nodes.get(body.id);
    if (!node) return;
    node.style.transform = `translate3d(${body.x - options.cardWidth / 2}px,${body.y - options.cardHeight / 2}px,0) rotate(${body.angle}deg)`;
    node.dataset.moving = String(body.held || body.resting < 12);
    node.dataset.thrown = String(body.thrown);
  }

  function integrate(now: number) {
    for (const body of bodies.values()) {
      if (body.held || now < body.readyAt) continue;
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
      const velocityX = (body.x - body.previousX) * Math.exp(-35 * step);
      const velocityY = (body.y - body.previousY) * Math.exp(-35 * step);
      const nextX =
        body.x + velocityX + (body.targetX - body.x) * 350 * step * step;
      const nextY =
        body.y + velocityY + (body.targetY - body.y) * 350 * step * step;
      body.previousX = body.x;
      body.previousY = body.y;
      body.x = nextX;
      body.y = nextY;
      body.angle += (body.targetAngle - body.angle) * 0.14;
      const settled =
        Math.hypot(body.targetX - body.x, body.targetY - body.y) < 0.2 &&
        Math.hypot(velocityX, velocityY) < 0.03 &&
        Math.abs(body.targetAngle - body.angle) < 0.1;
      body.resting = settled ? body.resting + 1 : 0;
      if (body.resting > 12) {
        body.x = body.previousX = body.targetX;
        body.y = body.previousY = body.targetY;
        body.angle = body.targetAngle;
      }
    }
    // Circle separation is deliberately smaller than the card: a hand can overlap,
    // while a moved card still transfers an impulse to its immediate neighbour.
    const current = [...bodies.values()];
    for (let i = 0; i < current.length; i++)
      for (let j = i + 1; j < current.length; j++) {
        const a = current[i],
          b = current[j];
        if (
          a.thrown ||
          b.thrown ||
          now < a.readyAt ||
          now < b.readyAt ||
          (!a.held && !b.held && a.resting > 12 && b.resting > 12)
        )
          continue;
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        // Only separate card centres if their resting layout also has room. This
        // keeps the intentionally overlapping phone fan from fighting the solver.
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
      draw(body);
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

  function layout(positions: CardPosition[], animate: boolean) {
    const ids = new Set(positions.map((position) => position.id));
    for (const id of bodies.keys()) if (!ids.has(id)) bodies.delete(id);
    const now = performance.now();
    positions.forEach((position, index) => {
      const existing = bodies.get(position.id);
      const startX =
        animate && !options.reduced
          ? Math.min(90, options.width * 0.2)
          : position.x;
      const startY = animate && !options.reduced ? 100 : position.y;
      const body: Body = existing ?? {
        ...position,
        x: startX,
        y: startY,
        previousX: startX,
        previousY: startY,
        targetX: position.x,
        targetY: position.y,
        targetAngle: position.angle,
        baseAngle: position.angle,
        held: false,
        thrown: false,
        readyAt: now + (animate ? index * 60 : 0),
        resting: 0,
      };
      body.targetX = position.x;
      body.targetY = position.y;
      body.targetAngle = body.baseAngle = position.angle;
      body.thrown = false;
      body.resting = 0;
      if (options.reduced) {
        body.x = body.previousX = position.x;
        body.y = body.previousY = position.y;
        body.angle = position.angle;
        body.resting = 20;
      }
      bodies.set(position.id, body);
      draw(body);
    });
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
    return { x: body.x, y: body.y };
  }

  function move(id: string, x: number, y: number, dragX: number) {
    const body = bodies.get(id);
    if (!body) return;
    body.x = body.previousX = x;
    body.y = body.previousY = y;
    body.angle = options.reduced
      ? body.baseAngle
      : body.baseAngle + clamp(dragX * 0.06, -24, 24);
    draw(body);
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
    body.previousX = body.x - velocityX * step;
    body.previousY = body.y - velocityY * step;
    body.targetX = clamp(
      Math.round(predictedX / 16) * 16,
      options.cardWidth / 2 + 12,
      options.width - options.cardWidth / 2 - 12,
    );
    body.targetY = clamp(
      Math.round(predictedY / 16) * 16,
      options.cardHeight / 2 + 16,
      options.height - options.cardHeight / 2 - 36,
    );
    body.targetAngle = body.baseAngle;
    body.readyAt = 0;
    body.resting = 0;
    if (options.reduced) {
      body.x = body.previousX = body.targetX;
      body.y = body.previousY = body.targetY;
      body.resting = 20;
      draw(body);
    }
    wake();
    return thrown;
  }

  function nudge(id: string, dx: number, dy: number) {
    const body = bodies.get(id);
    if (!body) return;
    grab(id);
    move(id, body.x + dx, body.y + dy, dx);
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
