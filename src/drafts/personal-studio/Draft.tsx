import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
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
  type ClientCard,
  type Crop,
  type Shot,
  type View,
} from "./data";
import "./personal-studio.css";

const fonts = [
  "/fonts/creative/BricolageGrotesque-Latin.woff2",
  "/fonts/creative/LibreFranklin-Latin.woff2",
];
const lead = offday[0].crops[offday[0].crops.length - 1].src;

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

/** The site root scrolls smoothly; on this page a Tab move must not animate the scroll. */
function useInstantScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = before;
    };
  }, []);
}

/* ---------- Plates ---------- */

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

function pickCrop(crops: Crop[], width: number, phone: boolean) {
  const set = crops.filter((crop) => (crop.upTo <= 720) === phone);
  if (set.length === 0) return crops[crops.length - 1];
  return set.find((crop) => width <= crop.upTo) ?? set[set.length - 1];
}

const hasPhoneCrop = (view: View) => view.crops.some((crop) => crop.upTo <= 720);

/**
 * Scale never goes above 1, so a screen is never drawn above its own pixels.
 * A frame wider or taller than the screen centres it on the plate ground.
 */
function place(
  crop: { sw: number; sh: number; cx: number; cy: number; w: number; ring?: Crop["ring"] },
  fw: number,
  fh: number,
) {
  const s = Math.min(1, fw / crop.w);
  const vw = fw / s;
  const vh = fh / s;
  let x = crop.cx - vw / 2;
  let y = crop.cy - vh / 2;
  if (crop.ring) {
    const { ring } = crop;
    x = Math.max(Math.min(x, ring.x), ring.x + ring.w - vw);
    y = Math.max(Math.min(y, ring.y), ring.y + ring.h - vh);
  }
  const fit = (v: number, view: number, size: number) =>
    view >= size ? (size - view) / 2 : Math.max(0, Math.min(v, size - view));
  return { s, x: fit(x, vw, crop.sw), y: fit(y, vh, crop.sh) };
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

function useLoaded(src: string) {
  const [loaded, setLoaded] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(src);
  }, [src]);
  return [ref, loaded === src, () => setLoaded(src)] as const;
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
  const [imgRef, loaded, onLoad] = useLoaded(crop.src);
  return (
    <div className="ps-layer" data-state={state} aria-hidden={state !== "on"}>
      <div
        className="ps-shot"
        style={{
          width: crop.sw,
          height: crop.sh,
          transform: `translate(${Math.round(-x * s)}px, ${Math.round(-y * s)}px) scale(${s})`,
          backgroundImage: view.fill && !loaded ? `url(${view.fill})` : undefined,
        }}
      >
        <img
          ref={imgRef}
          onLoad={onLoad}
          src={crop.src}
          width={crop.sw}
          height={crop.sh}
          alt={state === "on" ? view.alt : ""}
          decoding="async"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          draggable={false}
        />
        {crop.ring && loaded ? (
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

/* ---------- One switch: a screen replaces a screen ---------- */

function useSwitch(views: View[]) {
  const phone = usePhone();
  const shown = phone ? views.filter(hasPhoneCrop) : views;
  const [picked, setPicked] = useState(views[0].id);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const current = shown.some((view) => view.id === picked) ? picked : shown[0].id;
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), 240);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  const choose = (id: string, byKey: boolean) => {
    if (id === current) return;
    setInstant(byKey);
    setLeaving(current);
    setPicked(id);
  };
  return { shown, current, leaving, instant, choose };
}

type Switch = ReturnType<typeof useSwitch>;

function SwitchPlate({
  id,
  sw,
  className,
  eager,
  label,
}: {
  id: string;
  sw: Switch;
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
        ? sw.shown.map((view, i) => (
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

function Tabs({ id, sw, label }: { id: string; sw: Switch; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const views = sw.shown;
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
      className="ps-tabs"
      data-n={views.length}
      style={{ "--n": views.length } as CSSProperties}
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
            <span className="ps-tab-line">{view.line}</span>
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

function Tag({ items, children }: { items: string[]; children?: ReactNode }) {
  return (
    <p className="ps-tag">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
      {children}
    </p>
  );
}

function Room({
  id,
  name,
  lede,
  tag,
  note,
  views,
  className,
  eager,
}: {
  id: string;
  name: string;
  lede: string;
  tag: ReactNode;
  note?: string;
  views: View[];
  className: string;
  eager: boolean;
}) {
  const sw = useSwitch(views);
  const line = sw.shown.find((view) => view.id === sw.current)?.line ?? "";
  return (
    <article className={`ps-room ${className}`} aria-labelledby={`ps-${id}-h`}>
      <div className="ps-room-text">
        <div className="ps-title">
          <h3 id={`ps-${id}-h`}>{name}</h3>
          <div>
            <p className="ps-lede">{lede}</p>
            {tag}
          </div>
        </div>
        <Tabs id={id} sw={sw} label={`${name} screens`} />
        {note ? <p className="ps-note">{note}</p> : null}
      </div>
      <SwitchPlate
        id={id}
        sw={sw}
        className={`ps-plate-${id}`}
        eager={eager}
        label={`${name} screen`}
      />
      <p className="ps-view-line">{line}</p>
    </article>
  );
}

/* ---------- Client work ---------- */

function CardShot({ shot }: { shot: Shot }) {
  const [ref, size] = useFrameSize();
  const [imgRef, , onLoad] = useLoaded(shot.src);
  const placed = size ? place(shot, size.w, size.h) : null;
  return (
    <div ref={ref} className="ps-card-plate" style={{ background: shot.bg }} aria-hidden="true">
      {placed ? (
        <div
          className="ps-shot"
          style={{
            width: shot.sw,
            height: shot.sh,
            transform: `translate(${Math.round(-placed.x * placed.s)}px, ${Math.round(-placed.y * placed.s)}px) scale(${placed.s})`,
          }}
        >
          <img
            ref={imgRef}
            onLoad={onLoad}
            src={shot.src}
            width={shot.sw}
            height={shot.sh}
            alt=""
            decoding="async"
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : null}
    </div>
  );
}

function Card({ card }: { card: ClientCard }) {
  return (
    <li className={card.wide ? "ps-card ps-card-wide" : "ps-card"}>
      <Link
        className="ps-card-link"
        to={`/work/${card.slug}`}
        aria-label={`${card.name}. ${card.result} Read the case.`}
      >
        {card.shot ? <CardShot shot={card.shot} /> : null}
        {card.figure ? (
          <div className="ps-card-plate ps-figure" aria-hidden="true">
            <span className="ps-figure-big">{card.figure.big}</span>
            <span className="ps-figure-unit">{card.figure.unit}</span>
          </div>
        ) : null}
        <span className="ps-card-text">
          <span className="ps-card-name">{card.name}</span>
          <span className="ps-card-what">{card.what}</span>
          <span className={card.figure ? "ps-card-result ps-card-result-figure" : "ps-card-result"}>
            {card.result}
          </span>
          <span className="ps-card-foot">
            <span className="ps-card-role">
              {card.role} · <span className="ps-nowrap">{card.years}</span>
            </span>
            <span className="ps-card-go">
              Case
              <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

function SnaxxPlate() {
  const [ref, size] = useFrameSize();
  const [imgRef, , onLoad] = useLoaded(snaxx.src);
  const placed = size ? place(snaxx, size.w, size.h) : null;
  return (
    <div ref={ref} className="ps-plate ps-plate-snaxx">
      {placed ? (
        <div
          className="ps-shot"
          style={{
            width: snaxx.sw,
            height: snaxx.sh,
            transform: `translate(${Math.round(-placed.x * placed.s)}px, ${Math.round(-placed.y * placed.s)}px) scale(${placed.s})`,
          }}
        >
          <img
            ref={imgRef}
            onLoad={onLoad}
            src={snaxx.src}
            width={snaxx.sw}
            height={snaxx.sh}
            alt="Snaxx Tech studio site on a phone: The Snaxx Almanac, apps, games and useful little things, over an illustrated landscape with the Useful Apps Workshop."
            decoding="async"
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  for (const href of fonts)
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(lead, { as: "image", fetchPriority: "high" });

  const ready = useFontsReady();
  useInstantScroll();

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
          <h1 id="ps-h1">Web and mobile apps for clients, and his own.</h1>
          <p>
            Frontend and mobile engineer. 5+ years. Part of two platform rewrites.
            Client apps shipped to the App Store and Google Play. Based in Kosovo,
            working remotely.
          </p>
        </section>

        <section id="own" className="ps-band" aria-labelledby="ps-own-h">
          <div className="ps-group">
            <h2 id="ps-own-h">Own projects</h2>
            <p>Made outside client work: one app, two concepts and a studio site.</p>
          </div>
          <Room
            id="offday"
            name="Offday"
            lede="Time off for teams: requests, approvals and one shared calendar."
            tag={<Tag items={["Own app", "2026", "Demo workspace"]} />}
            note="Each team has its own space. About 200 automated tests."
            views={offday}
            className="ps-offday"
            eager
          />
        </section>

        <section id="clients" className="ps-band ps-clients" aria-labelledby="ps-clients-h">
          <div className="ps-group">
            <h2 id="ps-clients-h">Client work</h2>
            <p>Seven projects shipped with teams, 2021–26.</p>
          </div>
          <ul className="ps-cards">
            {clients.map((card) => (
              <Card key={card.slug} card={card} />
            ))}
          </ul>
          <p className="ps-cards-note">
            Screens are public store and web screenshots. The care platform and
            the design system are private, so they show numbers only.
          </p>
        </section>

        <section className="ps-band ps-concepts" aria-labelledby="ps-concepts-h">
          <div className="ps-group">
            <h2 id="ps-concepts-h">Two concepts and a studio site</h2>
            <p>Also made outside client work.</p>
          </div>
          <Room
            id="offbeat"
            name="OFFBEAT"
            lede="A made-up speaker brand, built as a concept, with a drum machine that works."
            tag={
              <Tag items={["Concept", "2026"]}>
                <ExternalLink href="https://github.com/gentritr1/offbeat">
                  Code on GitHub
                </ExternalLink>
              </Tag>
            }
            views={offbeat}
            className="ps-offbeat"
            eager={false}
          />
          <Room
            id="form"
            name="FORM"
            lede="A made-up sculpture show, built as a concept. Three sculptures made from math, drawn live in the browser."
            tag={
              <Tag items={["Concept", "2026"]}>
                <ExternalLink href="https://github.com/gentritr1/form">
                  Code on GitHub
                </ExternalLink>
              </Tag>
            }
            views={form}
            className="ps-form"
            eager={false}
          />
          <article className="ps-snaxx" aria-labelledby="ps-snaxx-h">
            <div className="ps-snaxx-text">
              <h3 id="ps-snaxx-h">Snaxx Tech</h3>
              <p className="ps-lede">The website of an indie app studio.</p>
              <Tag items={["Studio site", "2026"]}>
                <ExternalLink href="https://www.snaxxtech.com/">snaxxtech.com</ExternalLink>
              </Tag>
              <dl className="ps-weights">
                <div>
                  <dt>Images</dt>
                  <dd>972 KB → 337 KB</dd>
                </div>
                <div>
                  <dt>All the site's files</dt>
                  <dd>28 MB → 9.5 MB</dd>
                </div>
              </dl>
            </div>
            <SnaxxPlate />
          </article>
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
