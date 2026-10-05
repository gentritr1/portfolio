import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { ownRows, type OwnRow, type OwnShot } from "./personal";

const FADE_MS = 200;
const DRAW_MS = 180;
const RING_MS = 120;
const LEAVE_MS = 120;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const PAD = 5;

type Point = [number, number];

function rounded(points: Point[], radius = 8) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inLength = Math.hypot(cx - px, cy - py);
    const outLength = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, inLength / 2, outLength / 2);
    if (r < 1) {
      d += ` L${cx},${cy}`;
      continue;
    }
    d += ` L${cx - ((cx - px) / inLength) * r},${cy - ((cy - py) / inLength) * r} Q${cx},${cy} ${cx + ((nx - cx) / outLength) * r},${cy + ((ny - cy) / outLength) * r}`;
  }
  const last = points[points.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

const lengthOf = (points: Point[]) =>
  points.reduce((sum, point, i) => (i === 0 ? 0 : sum + Math.hypot(point[0] - points[i - 1][0], point[1] - points[i - 1][1])), 0);

const percent = (value: number) => `${(value * 100).toFixed(4)}%`;

function Shot({ shot, eager }: { shot: OwnShot; eager: boolean }) {
  const { crop, ring } = shot;
  return (
    <>
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{
          width: percent(shot.width / crop.w),
          left: percent(-crop.x / crop.w),
          top: percent(-crop.y / crop.h),
        }}
      />
      <span
        className="pj-own-target"
        aria-hidden="true"
        style={{
          left: percent((ring.x - crop.x) / crop.w),
          top: percent((ring.y - crop.y) / crop.h),
          width: percent(ring.w / crop.w),
          height: percent(ring.h / crop.h),
        }}
      />
    </>
  );
}

function OwnItem({ row, narrow, reduced }: { row: OwnRow; narrow: boolean; reduced: boolean }) {
  const rowRef = useRef<HTMLLIElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const outRefs = useRef<SVGPathElement[]>([]);
  const inRefs = useRef<SVGPathElement[]>([]);
  const ringRef = useRef<SVGRectElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [on, setOn] = useState(false);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [instant, setInstant] = useState(false);
  const wireView = useRef(0);
  const armed = useRef(false);
  const pending = useRef<"animate" | "instant" | null>(null);

  const draw = useCallback((split: number, ringOnly: boolean) => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;
    if (ringOnly) {
      ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, easing: EASE_OUT, fill: "backwards" });
      return;
    }
    const outMs = Math.round(DRAW_MS * split);
    const inMs = DRAW_MS - outMs;
    outRefs.current.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: outMs, easing: "linear", fill: "backwards" }),
    );
    inRefs.current.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: inMs, delay: outMs, easing: EASE_OUT, fill: "backwards" }),
    );
    dot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 80, easing: EASE_OUT, fill: "backwards" });
    ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, delay: DRAW_MS, easing: EASE_OUT, fill: "backwards" });
  }, []);

  const update = useCallback(() => {
    const element = rowRef.current;
    const plate = plateRef.current;
    const group = groupRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!element || !plate || !group || !ring || !dot) return;
    const view = wireView.current;
    const mark = element.querySelector<HTMLElement>(`[data-view="${view}"] .pj-result-ink mark`);
    const target = plate.querySelector<HTMLElement>(`[data-view="${view}"] .pj-own-target`);
    const image = plate.querySelector<HTMLImageElement>(`[data-view="${view}"] img`);
    const fragments = mark?.getClientRects();
    if (!armed.current || !mark || !target || !image?.complete || !fragments?.length) {
      group.dataset.ready = "false";
      return;
    }
    const origin = element.getBoundingClientRect();
    const local = (rect: DOMRect) => ({
      x: rect.left - origin.left,
      y: rect.top - origin.top,
      w: rect.width,
      h: rect.height,
    });
    const t = local(target.getBoundingClientRect());
    const p = local(plate.getBoundingClientRect());
    const box = { x: t.x - PAD, y: t.y - PAD, w: t.w + PAD * 2, h: t.h + PAD * 2 };
    const shot = narrow ? row.views[view].narrow : row.views[view].wide;
    const last = local(fragments[fragments.length - 1]);
    const start: Point = [Math.round(last.x + last.w + 10), Math.round(last.y + last.h / 2)];
    const edge = Math.round(p.x);
    const gutter = edge - 20;
    const entry = shot.entry === undefined ? t.y + t.h / 2 : p.y + ((shot.entry - shot.crop.y) / shot.crop.h) * p.h;
    const ey = Math.round(entry);
    const outside: Point[] = [start, [gutter, start[1]], [gutter, ey], [edge, ey]];
    const inside: Point[] = [[edge, ey]];
    if (ey >= box.y && ey <= box.y + box.h) inside.push([Math.round(box.x - 1), ey]);
    else {
      const cx = Math.round(box.x + box.w / 2);
      inside.push([cx, ey], [cx, Math.round(ey < box.y ? box.y - 1 : box.y + box.h + 1)]);
    }
    const outLength = lengthOf(outside);
    const inLength = lengthOf(inside);
    group.dataset.ready = "true";
    group.dataset.tone = row.tone;
    group.dataset.narrow = String(narrow);
    outRefs.current.forEach((path) => path.setAttribute("d", rounded(outside)));
    inRefs.current.forEach((path) => path.setAttribute("d", rounded(inside)));
    dot.setAttribute("cx", String(start[0]));
    dot.setAttribute("cy", String(start[1]));
    ring.setAttribute("x", String(Math.round(box.x)));
    ring.setAttribute("y", String(Math.round(box.y)));
    ring.setAttribute("width", String(Math.round(box.w)));
    ring.setAttribute("height", String(Math.round(box.h)));
    if (pending.current) {
      const mode = pending.current;
      pending.current = null;
      if (mode === "animate" && !reduced) draw(outLength / Math.max(1, outLength + inLength), narrow);
    }
  }, [narrow, reduced, row, draw]);

  /* The row becomes current once, when most of its plate is on screen. */
  useEffect(() => {
    const plate = plateRef.current;
    if (!plate || on) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setOn(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(plate);
    return () => observer.disconnect();
  }, [on]);

  /* The band wipes in first; the line draws after it, as in the log. */
  useEffect(() => {
    if (!on || armed.current) return;
    if (reduced) {
      armed.current = true;
      pending.current = "instant";
      update();
      return;
    }
    const timer = window.setTimeout(() => {
      armed.current = true;
      pending.current = "animate";
      update();
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [on, reduced, update]);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;
    let frame = 0;
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
    };
    schedule();
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    const images = Array.from(element.querySelectorAll("img"));
    images.forEach((image) => image.addEventListener("load", schedule));
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      images.forEach((image) => image.removeEventListener("load", schedule));
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [update]);

  /* A new view: the old line fades, the screen cross-fades, then the new line draws. */
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || wireView.current === current) return;
    if (instant || reduced || !armed.current) {
      group.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      wireView.current = current;
      pending.current = "instant";
      update();
      return;
    }
    const fade = group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LEAVE_MS, easing: EASE_OUT, fill: "forwards" });
    const timer = window.setTimeout(() => {
      fade.cancel();
      wireView.current = current;
      pending.current = "animate";
      update();
    }, FADE_MS);
    return () => {
      window.clearTimeout(timer);
      fade.cancel();
    };
  }, [current, instant, reduced, on, update]);

  useEffect(() => {
    if (prev === null) return;
    const timer = window.setTimeout(() => setPrev(null), FADE_MS + 40);
    return () => window.clearTimeout(timer);
  }, [prev, current]);

  useEffect(() => {
    if (!instant) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
    return () => cancelAnimationFrame(frame);
  }, [instant]);

  const choose = (index: number, mode: "animate" | "instant") => {
    if (index === current) return;
    setInstant(mode === "instant" || reduced);
    setPrev(mode === "instant" || reduced ? null : current);
    setCurrent(index);
  };

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = row.views.length;
    const next =
      event.key === "ArrowRight"
        ? (current + 1) % count
        : event.key === "ArrowLeft"
          ? (current - 1 + count) % count
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    choose(next, "instant");
    tabRefs.current[next]?.focus();
  };

  const view = row.views[current];
  const tabs = row.views.length > 1;
  const plateId = `pj-own-${row.id}`;
  const shotOf = (index: number) => (narrow ? row.views[index].narrow : row.views[index].wide);
  const ratio = (shot: OwnShot) => `${shot.crop.w} / ${shot.crop.h}`;

  return (
    <li
      ref={rowRef}
      className="pj-own-row"
      data-on={on || undefined}
      data-instant={instant || undefined}
      data-tone={row.tone}
      data-tabs={tabs || undefined}
      aria-labelledby={`${plateId}-name`}
    >
      <div className="pj-own-text">
        <div className="pj-row-head">
          <span className="pj-num" aria-hidden="true">
            {row.id}
          </span>
          <div className="pj-row-name">
            <h3 id={`${plateId}-name`}>{row.project}</h3>
            <p className="pj-role">
              {row.role}
              <span className="pj-year">
                <span className="pj-dot"> · </span>
                {row.year}
              </span>
            </p>
          </div>
        </div>
        <p className="pj-line">{row.line}</p>
        <p className="pj-result pj-own-result">
          {row.views.map((item, index) => (
            <span key={item.key} className="pj-own-band" data-view={index} data-current={index === current || undefined}>
              <span className="pj-result-base">
                <mark>
                  <ArrowRightIcon className="pj-result-arrow" weight="bold" aria-hidden="true" />
                  {item.result}
                </mark>
              </span>
              <span className="pj-result-ink" aria-hidden="true">
                <mark>
                  <ArrowRightIcon className="pj-result-arrow" weight="bold" />
                  {item.result}
                </mark>
              </span>
            </span>
          ))}
        </p>
        {row.github && (
          <p className="pj-foot">
            <a className="pj-link" href={row.github} target="_blank" rel="noreferrer">
              Code on GitHub
              <span className="pj-sr">: {row.project}</span>
              <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
            </a>
          </p>
        )}
      </div>

      <div
        className="pj-own-frame"
        style={narrow ? { maxWidth: Math.min(568, ...row.views.map((item) => item.narrow.crop.w)) } : undefined}
      >
        <div
          ref={plateRef}
          id={plateId}
          className="pj-own-plate"
          role={tabs ? "tabpanel" : undefined}
          aria-labelledby={tabs ? `${plateId}-tab-${current}` : undefined}
          style={{ aspectRatio: ratio(shotOf(current)) }}
        >
          {row.views.map((item, index) => {
            const state = index === current ? "on" : index === prev ? "prev" : "off";
            return (
              <div key={item.key} className="pj-own-view" data-view={index} data-state={state} aria-hidden={state !== "on"}>
                <Shot shot={shotOf(index)} eager={false} />
              </div>
            );
          })}
        </div>
        <div className="pj-own-under">
          {tabs && (
            <div className="pj-own-tabs" role="tablist" aria-label={`${row.project} screens`} onKeyDown={onTabKey}>
              {row.views.map((item, index) => (
                <button
                  key={item.key}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`${plateId}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={index === current}
                  aria-controls={plateId}
                  tabIndex={index === current ? 0 : -1}
                  onClick={() => choose(index, "animate")}
                >
                  {item.tab}
                </button>
              ))}
            </div>
          )}
          <p className="pj-caption-text pj-own-caption">{view.caption}</p>
        </div>
      </div>

      <svg className="pj-wire pj-own-wire" aria-hidden="true">
        <g ref={groupRef} data-ready="false">
          {[0, 1].map((layer) => (
            <path
              key={`out-${layer}`}
              ref={(element) => {
                if (element) outRefs.current[layer] = element;
              }}
              className={layer === 0 ? "pj-wire-halo pj-wire-out" : "pj-wire-line pj-wire-out"}
              pathLength={1}
            />
          ))}
          {[0, 1].map((layer) => (
            <path
              key={`in-${layer}`}
              ref={(element) => {
                if (element) inRefs.current[layer] = element;
              }}
              className={layer === 0 ? "pj-wire-halo pj-wire-in" : "pj-wire-line pj-wire-in"}
              pathLength={1}
            />
          ))}
          <rect ref={ringRef} className="pj-wire-ring" rx={8} />
          <circle ref={dotRef} className="pj-wire-dot" r={3.5} />
        </g>
      </svg>
    </li>
  );
}

export function Own({ narrow, reduced }: { narrow: boolean; reduced: boolean }) {
  return (
    <section className="pj-own" aria-labelledby="pj-own-title">
      <header className="pj-own-head">
        <h2 id="pj-own-title">Own projects</h2>
        <p className="pj-line">Made outside client work: one working app and two design concepts.</p>
      </header>
      <ol className="pj-own-list" start={9}>
        {ownRows.map((row) => (
          <OwnItem key={row.id} row={row} narrow={narrow} reduced={reduced} />
        ))}
      </ol>
    </section>
  );
}
