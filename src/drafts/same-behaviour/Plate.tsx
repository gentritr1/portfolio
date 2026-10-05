import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  alertsOf,
  format,
  latestAlert,
  limit,
  orgs,
  units,
  type Action,
  type ScreenState,
} from "./data";

export type Era = "nuxt" | "react";

const pad = { l: 38, r: 14, t: 14, b: 24 };
const domain = { min: 48, max: 156 };
const grid = [80, 100, 120, 140];
const days = 14;

export function Swap({ items, index }: { items: ReactNode[]; index: number }) {
  return (
    <span className="sb-swap">
      {items.map((item, i) => (
        <span
          key={i}
          data-on={i === index}
          aria-hidden={i !== index || undefined}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

function useBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > pad.l + pad.r && height > pad.t + pad.b)
        setSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

function smooth(points: Array<[number, number]>) {
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${r(points[0][0])},${r(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C${r(p1[0] + (p2[0] - p0[0]) / 6)},${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(
      p2[0] - (p3[0] - p1[0]) / 6,
    )},${r(p2[1] - (p3[1] - p1[1]) / 6)} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

const straight = (points: Array<[number, number]>) =>
  points
    .map(
      ([x, y], i) =>
        `${i ? "L" : "M"}${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`,
    )
    .join(" ");

function Chart({
  state,
  onAct,
}: {
  state: ScreenState;
  onAct: (a: Action) => void;
}) {
  const [ref, size] = useBox();
  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const step = (w - pad.l - pad.r) / (days - 1);
  const x = (i: number) => pad.l + i * step;
  const y = (v: number) =>
    pad.t +
    ((domain.max - v) * (h - pad.t - pad.b)) / (domain.max - domain.min);
  const every = w >= 420 ? 1 : 2;
  const popHalf = w >= 420 ? 40 : 34;

  return (
    <div ref={ref} className="vp-chart">
      {size && (
        <svg width={w} height={h} aria-hidden="true">
          <rect
            className="vp-band"
            x={pad.l}
            y={y(limit.high)}
            width={w - pad.l - pad.r}
            height={y(limit.low) - y(limit.high)}
          />
          {grid.map((v) => (
            <line
              key={v}
              className="vp-grid"
              x1={pad.l}
              x2={w - pad.r}
              y1={y(v)}
              y2={y(v)}
            />
          ))}
          <line
            className="vp-axis"
            x1={pad.l}
            x2={w - pad.r}
            y1={h - pad.b}
            y2={h - pad.b}
          />
          {[limit.high, limit.low].map((v) => (
            <line
              key={v}
              className={
                v === limit.high ? "vp-limit vp-limit-high" : "vp-limit"
              }
              x1={pad.l}
              x2={w - pad.r}
              y1={y(v)}
              y2={y(v)}
            />
          ))}
          {units.map((unit, u) =>
            grid.map((v) => (
              <text
                key={`n${unit}${v}`}
                className="vp-fade vp-y vp-y-nuxt"
                data-on={state.unit === u}
                x={pad.l - 7}
                y={y(v)}
              >
                {format(v, unit)}
              </text>
            )),
          )}
          {units.map((unit, u) =>
            [limit.high, limit.low].map((v) => (
              <text
                key={`r${unit}${v}`}
                className="vp-fade vp-y vp-y-react"
                data-on={state.unit === u}
                x={pad.l - 7}
                y={y(v)}
              >
                {format(v, unit)}
              </text>
            )),
          )}
          {Array.from({ length: days }, (_, i) =>
            i % every === 0 || i === days - 1 ? (
              <text key={i} className="vp-x" x={x(i)} y={h - 7}>
                {i + 1}
              </text>
            ) : null,
          )}
          {orgs.map((org, o) => {
            const sys = org.sys.map((v, i): [number, number] => [x(i), y(v)]);
            const dia = org.dia.map((v, i): [number, number] => [x(i), y(v)]);
            const open = latestAlert(org);
            return (
              <g
                key={org.name}
                className="vp-fade vp-series"
                data-on={state.org === o}
              >
                <path className="vp-line vp-dia vp-smooth" d={smooth(dia)} />
                <path className="vp-line vp-sys vp-smooth" d={smooth(sys)} />
                <path
                  className="vp-line vp-dia vp-straight"
                  d={straight(dia)}
                />
                <path
                  className="vp-line vp-sys vp-straight"
                  d={straight(sys)}
                />
                {sys.map(([cx, cy], i) => (
                  <circle
                    key={`s${i}`}
                    className="vp-mark vp-mark-sys"
                    cx={cx}
                    cy={cy}
                    r={2.75}
                  />
                ))}
                {dia.map(([cx, cy], i) => (
                  <circle
                    key={`d${i}`}
                    className="vp-mark vp-mark-dia"
                    cx={cx}
                    cy={cy}
                    r={2.5}
                  />
                ))}
                {alertsOf(org).map((i) => (
                  <g key={i}>
                    <circle
                      className="vp-ring vp-fade"
                      data-on={state.alert && i === open}
                      cx={x(i)}
                      cy={y(org.sys[i])}
                      r={9}
                    />
                    <circle
                      className="vp-dot"
                      cx={x(i)}
                      cy={y(org.sys[i])}
                      r={4.5}
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      )}
      {size &&
        orgs.map((org, o) => {
          const i = latestAlert(org);
          const left = x(i) - 14;
          const top = Math.max(
            popHalf + 4,
            Math.min(h - pad.b - popHalf, y(org.sys[i])),
          );
          return (
            <div
              key={org.name}
              className="vp-anchor"
              style={{ transform: `translate(${left}px, ${top}px)` }}
            >
              <div className="vp-pop" data-on={state.alert && state.org === o}>
                <svg
                  className="vp-pop-icon"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 1.5 15 14H1z" />
                  <path className="vp-pop-bang" d="M8 6v3.5M8 11.2v.6" />
                </svg>
                <p className="vp-pop-title">Above threshold</p>
                <p className="vp-pop-value">
                  Day {i + 1} ·{" "}
                  <Swap
                    index={state.unit}
                    items={units.map(
                      (u) =>
                        `${format(org.sys[i], u)} / ${format(org.dia[i], u)} ${u}`,
                    )}
                  />
                </p>
                <button
                  type="button"
                  tabIndex={-1}
                  className="vp-pop-ack"
                  onClick={() => onAct("alert")}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export function Plate({
  era,
  state,
  onAct,
}: {
  era: Era;
  state: ScreenState;
  onAct: (action: Action) => void;
}) {
  return (
    <div className="vp" data-era={era} aria-hidden="true">
      <header className="vp-head">
        <div className="vp-who">
          <p className="vp-patient">
            <Swap index={state.org} items={orgs.map((o) => o.patient)} />
          </p>
          <span className="vp-role">Care manager</span>
        </div>
        <button
          type="button"
          tabIndex={-1}
          className="vp-org"
          onClick={() => onAct("org")}
        >
          <svg className="vp-org-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 14V3.5l6-1.5v12M8.5 6h5v8M1 14h14M4.5 6h2M4.5 9h2M10.5 9h1M10.5 11.5h1" />
          </svg>
          <Swap index={state.org} items={orgs.map((o) => o.name)} />
          <svg className="vp-caret" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 4.5 6 7.5l3-3" />
          </svg>
        </button>
      </header>

      <div className="vp-sub">
        <p className="vp-title">
          Blood pressure<span> · 14 days</span>
        </p>
        <ul className="vp-legend">
          <li>
            <i className="vp-key vp-key-sys" />
            Systolic
          </li>
          <li>
            <i className="vp-key vp-key-dia" />
            Diastolic
          </li>
        </ul>
      </div>

      <Chart state={state} onAct={onAct} />

      <footer className="vp-foot">
        <span className="vp-unit">
          {units.map((u, i) => (
            <button
              key={u}
              type="button"
              tabIndex={-1}
              className="vp-unit-opt"
              data-on={state.unit === i}
              onClick={() => state.unit !== i && onAct("unit")}
            >
              {u}
            </button>
          ))}
        </span>
        <p className="vp-meta">
          <span>Last sync 2 min ago</span>
          <span>
            Timezone: patient local (
            <Swap index={state.org} items={orgs.map((o) => o.utc)} />)
          </span>
        </p>
      </footer>
    </div>
  );
}
