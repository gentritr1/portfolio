import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import {
  clients,
  form,
  offbeat,
  offday,
  snaxx,
  type Crop,
  type View,
} from "./data";
import "./personal-studio.css";

const fonts = [
  "/fonts/creative/BricolageGrotesque-Latin.woff2",
  "/fonts/creative/LibreFranklin-Latin.woff2",
];

for (const href of fonts)
  preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

/** Text waits at most 300 ms for the page faces, then shows the sized fallback. */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    const timer = window.setTimeout(finish, 300);
    Promise.all([
      document.fonts.load('800 40px "PS Display"'),
      document.fonts.load('400 16px "PS Text"'),
    ]).then(finish, finish);
    return () => window.clearTimeout(timer);
  }, []);
  return ready;
}

/* ---------- Plates ---------- */

/** Phone crops have `upTo` at most 720; the page picks them only in the phone layout. */
function pickCrop(crops: Crop[], width: number, phone: boolean) {
  const set = crops.filter((crop) => (crop.upTo <= 720) === phone);
  return set.find((crop) => width <= crop.upTo) ?? set[set.length - 1];
}

function usePhone() {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia("(max-width: 720px)");
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia("(max-width: 720px)").matches,
    () => false,
  );
}

/** Scale never goes above 1, so a screen is never drawn above its own pixels. */
function place(crop: Crop, fw: number, fh: number) {
  const s = Math.min(1, fw / crop.w);
  const vw = fw / s;
  const vh = fh / s;
  const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));
  let x = crop.cx - vw / 2;
  let y = crop.cy - vh / 2;
  if (crop.ring) {
    const { ring } = crop;
    x = Math.min(x, ring.x);
    x = Math.max(x, ring.x + ring.w - vw);
    y = Math.min(y, ring.y);
    y = Math.max(y, ring.y + ring.h - vh);
  }
  return {
    s,
    x: clamp(x, crop.sw - vw),
    y: clamp(y, crop.sh - vh),
  };
}

function useFrameSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const box = element.getBoundingClientRect();
      setSize((old) =>
        old && old.w === box.width && old.h === box.height
          ? old
          : { w: box.width, h: box.height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

function Screen({
  view,
  state,
  size,
  eager,
}: {
  view: View;
  state: "on" | "off" | "idle";
  size: { w: number; h: number };
  eager: boolean;
}) {
  const phone = usePhone();
  const crop = pickCrop(view.crops, size.w, phone);
  const { s, x, y } = place(crop, size.w, size.h);
  const [loaded, setLoaded] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) setLoaded(crop.src);
  }, [crop.src]);
  return (
    <div className="ps-layer" data-state={state} aria-hidden={state !== "on"}>
      <div
        className="ps-shot"
        style={{
          width: crop.sw,
          height: crop.sh,
          transform: `translate(${Math.round(-x * s)}px, ${Math.round(-y * s)}px) scale(${s})`,
        }}
      >
        <img
          ref={imgRef}
          onLoad={() => setLoaded(crop.src)}
          src={crop.src}
          width={crop.sw}
          height={crop.sh}
          alt={state === "on" ? view.alt : ""}
          decoding="async"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          draggable={false}
        />
        {crop.ring && loaded === crop.src ? (
          <span
            className="ps-ring"
            style={{
              left: crop.ring.x,
              top: crop.ring.y,
              width: crop.ring.w,
              height: crop.ring.h,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function StillPlate({ view, className }: { view: View; className: string }) {
  const [ref, size] = useFrameSize();
  return (
    <div ref={ref} className={`ps-plate ${className}`}>
      {size ? <Screen view={view} state="on" size={size} eager={false} /> : null}
    </div>
  );
}

/* ---------- One switch: a screen replaces a screen ---------- */

function useSwitch(views: View[]) {
  const [current, setCurrent] = useState(views[0].id);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), 240);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  const choose = (id: string, byKey: boolean) => {
    if (id === current) return;
    setInstant(byKey);
    setLeaving(current);
    setCurrent(id);
  };
  return { current, leaving, instant, choose };
}

function SwitchPlate({
  id,
  views,
  sw,
  className,
  eager,
  label,
}: {
  id: string;
  views: View[];
  sw: ReturnType<typeof useSwitch>;
  className: string;
  eager: boolean;
  label: string;
}) {
  const [ref, size] = useFrameSize();
  return (
    <div
      ref={ref}
      id={`${id}-panel`}
      role="tabpanel"
      aria-label={label}
      className={`ps-plate ${className}`}
      data-instant={sw.instant ? "" : undefined}
    >
      {size
        ? views.map((view, i) => (
            <Screen
              key={view.id}
              view={view}
              size={size}
              eager={eager && i === 0}
              state={
                view.id === sw.current
                  ? "on"
                  : view.id === sw.leaving
                    ? "off"
                    : "idle"
              }
            />
          ))
        : null}
    </div>
  );
}

function Tabs({
  id,
  views,
  sw,
  label,
  withLines,
}: {
  id: string;
  views: View[];
  sw: ReturnType<typeof useSwitch>;
  label: string;
  withLines: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, at: number) => {
    const last = views.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? at === last
          ? 0
          : at + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? at === 0
            ? last
            : at - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    sw.choose(views[next].id, true);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={withLines ? "vertical" : "horizontal"}
      className={withLines ? "ps-tabs ps-tabs-list" : "ps-tabs ps-tabs-row"}
    >
      {views.map((view, i) => {
        const on = view.id === sw.current;
        return (
          <button
            key={view.id}
            ref={(element) => {
              refs.current[i] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${view.id}`}
            aria-selected={on}
            aria-controls={`${id}-panel`}
            tabIndex={on ? 0 : -1}
            className="ps-tab"
            onClick={() => sw.choose(view.id, false)}
            onKeyDown={(event) => onKey(event, i)}
          >
            <span className="ps-tab-label">{view.label}</span>
            {withLines ? <span className="ps-tab-line">{view.line}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="ps-ext" href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
      <span className="ps-sr"> (opens in a new tab)</span>
    </a>
  );
}

function Tag({ items, children }: { items: string[]; children: ReactNode }) {
  return (
    <p className="ps-tag ps-tag-row">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
      {children}
    </p>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  for (const href of fonts)
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  const ready = useFontsReady();
  const offdaySwitch = useSwitch(offday);
  const offbeatSwitch = useSwitch(offbeat);
  const offdayLine =
    offday.find((view) => view.id === offdaySwitch.current)?.line ?? "";
  const offbeatLine =
    offbeat.find((view) => view.id === offbeatSwitch.current)?.line ?? "";

  useEffect(() => {
    document.title = "Gentrit Rashiti, web and mobile apps";
  }, []);

  return (
    <div className="ps" data-wait={ready ? undefined : ""}>
      <header className="ps-top">
        <a className="ps-mark" href="#top" aria-label="Gentrit Rashiti, back to the top">
          Gentrit Rashiti
        </a>
        <nav aria-label="Page" className="ps-nav">
          <a className="ps-nav-wide" href="#own">
            Own projects
          </a>
          <a className="ps-nav-wide" href="#clients">
            Client work
          </a>
          <a href={links.cv} download>
            CV (PDF)
          </a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>

      <main id="top">
        <section className="ps-intro" aria-labelledby="ps-h1">
          <h1 id="ps-h1">Web and mobile apps for clients, and products of his own.</h1>
          <p>
            Frontend and mobile engineer. 5+ years. Part of two platform rewrites.
            Client apps live in both app stores. Based in Kosovo, working remotely.
          </p>
        </section>

        <section id="own" className="ps-own" aria-labelledby="ps-own-h">
          <div className="ps-group">
            <h2 id="ps-own-h">Own projects</h2>
            <p>Four products made outside client work.</p>
          </div>

          <article className="ps-room ps-offday" aria-labelledby="ps-offday-h">
            <div className="ps-room-text">
              <div className="ps-title">
                <h3 id="ps-offday-h">Offday</h3>
                <div>
                  <p className="ps-lede">
                    Time off for teams: requests, approvals and one shared
                    calendar.
                  </p>
                  <p className="ps-tag">Own product · 2026</p>
                </div>
              </div>
              <Tabs
                id="offday"
                views={offday}
                sw={offdaySwitch}
                label="Offday features"
                withLines
              />
              <p className="ps-note">
                Each team has its own space. About 200 automated tests. Screens
                from its demo workspace.
              </p>
            </div>
            <SwitchPlate
              id="offday"
              views={offday}
              sw={offdaySwitch}
              className="ps-plate-offday"
              eager
              label="Offday screen"
            />
            <p className="ps-view-line ps-offday-line">{offdayLine}</p>
          </article>

          <article className="ps-room ps-offbeat" aria-labelledby="ps-offbeat-h">
            <div className="ps-room-head">
              <h3 id="ps-offbeat-h">OFFBEAT</h3>
              <div className="ps-room-copy">
                <p className="ps-lede">
                  A made-up speaker brand, built as a concept. The drum machine
                  really plays.
                </p>
                <Tag items={["Concept", "2026"]}>
                  <ExternalLink href="https://github.com/gentritr1/offbeat">
                    Code on GitHub
                  </ExternalLink>
                </Tag>
              </div>
            </div>
            <div className="ps-offbeat-bar">
              <Tabs
                id="offbeat"
                views={offbeat}
                sw={offbeatSwitch}
                label="OFFBEAT screens"
                withLines={false}
              />
              <p className="ps-view-line">{offbeatLine}</p>
            </div>
            <SwitchPlate
              id="offbeat"
              views={offbeat}
              sw={offbeatSwitch}
              className="ps-plate-offbeat"
              eager={false}
              label="OFFBEAT screen"
            />
          </article>

          <div className="ps-pair">
            <article className="ps-card" aria-labelledby="ps-form-h">
              <StillPlate view={form} className="ps-plate-still" />
              <h3 id="ps-form-h">FORM</h3>
              <p className="ps-lede">
                A made-up sculpture show, built as a concept. Three sculptures
                made from math, drawn live in the browser.
              </p>
              <Tag items={["Concept", "2026"]}>
                <ExternalLink href="https://github.com/gentritr1/form">
                  Code on GitHub
                </ExternalLink>
              </Tag>
            </article>
            <article className="ps-card" aria-labelledby="ps-snaxx-h">
              <StillPlate view={snaxx} className="ps-plate-still" />
              <h3 id="ps-snaxx-h">Snaxx Tech</h3>
              <p className="ps-lede">
                The website of an indie app studio. Its images went from 972 KB
                to 337 KB.
              </p>
              <Tag items={["Studio site", "2026"]}>
                <ExternalLink href="https://www.snaxxtech.com/">
                  snaxxtech.com
                </ExternalLink>
              </Tag>
            </article>
          </div>
        </section>

        <section id="clients" className="ps-clients" aria-labelledby="ps-clients-h">
          <div className="ps-group">
            <h2 id="ps-clients-h">Client work</h2>
            <p>Seven projects shipped with teams, 2021–26.</p>
          </div>
          <ol className="ps-index">
            {clients.map((row) => (
              <li key={row.slug}>
                <Link
                  className="ps-row"
                  to={`/work/${row.slug}`}
                  aria-label={`${row.name}: ${row.result} Read the case.`}
                >
                  <span className="ps-row-name">{row.name}</span>
                  <span className="ps-row-what">{row.what}</span>
                  <span className="ps-row-result">{row.result}</span>
                  <span className="ps-row-role">
                    {row.role}
                    <span className="ps-row-years"> · {row.years}</span>
                  </span>
                  <span className="ps-row-go">
                    Case
                    <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="ps-foot">
        <p className="ps-foot-line">Gentrit Rashiti · Based in Kosovo, working remotely.</p>
        <ul className="ps-foot-links">
          <li>
            <a href={`mailto:${links.email}`}>{links.email}</a>
          </li>
          <li>
            <ExternalLink href={links.linkedin}>LinkedIn</ExternalLink>
          </li>
          <li>
            <ExternalLink href={links.github}>GitHub</ExternalLink>
          </li>
          <li>
            <a href={links.cv} download>
              CV (PDF)
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
