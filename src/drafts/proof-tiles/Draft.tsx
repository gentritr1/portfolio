import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import {
  index,
  tiles,
  type Box,
  type Media,
  type Shot,
  type Tile,
} from "./data";
import "./proof-tiles.css";

function useMedia(query: string, fallback: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** Text is laid out once, in its own faces, so nothing reflows after the first paint. */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const timer = window.setTimeout(finish, 1500);
    Promise.all([
      document.fonts.load('800 56px "Archivo"'),
      document.fonts.load('500 20px "Archivo"'),
      document.fonts.load('400 12px "Martian Mono"'),
    ]).then(finish, finish);
    return () => window.clearTimeout(timer);
  }, []);
  return ready;
}

/* ---------- Media ---------- */

const pct = (value: number) => `${value * 100}%`;

/**
 * How far the ring's dimmer must grow so its hole covers the whole tile.
 * Arguments are fractions of the tile: the ring's start and size on one axis.
 */
const reach = (start: number, size: number) => {
  const centre = start + size / 2;
  return ((2 * Math.max(centre, 1 - centre)) / size) * 1.15;
};

function ringStyle(
  left: number,
  top: number,
  width: number,
  height: number,
): CSSProperties {
  return {
    left: pct(left),
    top: pct(top),
    width: pct(width),
    height: pct(height),
    "--pt-sx": reach(left, width),
    "--pt-sy": reach(top, height),
  } as CSSProperties;
}

/** The narrowest crop that is at least as wide as the tile, so the image is never drawn above its source pixels. */
function pickCrop(shot: Shot, width: number): Box {
  const sorted = [...shot.crops].sort((a, b) => a.w - b.w);
  return (
    sorted.find((crop) => crop.w >= width - 0.5) ?? sorted[sorted.length - 1]
  );
}

function ShotView({
  shot,
  width,
  eager,
}: {
  shot: Shot;
  width: number;
  eager: boolean;
}) {
  const crop = pickCrop(shot, width);
  const { mark } = shot;
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <img
        ref={(image) => {
          if (image?.complete && image.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        className="pt-img"
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        style={{
          width: pct(shot.width / crop.w),
          left: pct(-crop.x / crop.w),
          top: pct(-crop.y / crop.h),
        }}
      />
      <span
        className="pt-ring"
        aria-hidden="true"
        hidden={!loaded}
        style={ringStyle(
          (mark.x - crop.x) / crop.w,
          (mark.y - crop.y) / crop.h,
          mark.w / crop.w,
          mark.h / crop.h,
        )}
      />
    </>
  );
}

const live = {
  care: recreations.care,
  "design-system": recreations["design-system"],
};

function LiveView({
  which,
  mark,
  alt,
}: {
  which: keyof typeof live;
  mark: string;
  alt: string;
}) {
  const entry = live[which];
  const Live = entry.Component;
  const ref = useRef<HTMLDivElement>(null);
  const [ring, setRing] = useState<CSSProperties | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let frame = 0;
    // The specimen plays a demo loop until its own pause button is pressed. The tile shows it still.
    const pause = () => {
      const button = host.querySelector<HTMLButtonElement>(
        '.dsr-demo[aria-pressed="true"]',
      );
      if (button) button.click();
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        pause();
        const part = host.querySelector<HTMLElement>(mark);
        if (!part) return;
        const a = host.getBoundingClientRect();
        const b = part.getBoundingClientRect();
        if (a.width === 0 || b.width === 0) return;
        setRing(
          ringStyle(
            (b.left - a.left) / a.width,
            (b.top - a.top) / a.height,
            b.width / a.width,
            b.height / a.height,
          ),
        );
      });
    };
    const mutations = new MutationObserver(measure);
    mutations.observe(host, { childList: true, subtree: true });
    const sizes = new ResizeObserver(measure);
    sizes.observe(host);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      sizes.disconnect();
    };
  }, [mark]);

  return (
    <>
      <div
        ref={ref}
        className={`pt-live pt-live-${which}`}
        data-world={entry.world}
        inert
        role="img"
        aria-label={alt}
        onClick={(event) => {
          // The pause click must not reach the tile's link.
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <Suspense fallback={null}>
          <Live />
        </Suspense>
      </div>
      {ring && <span className="pt-ring" aria-hidden="true" style={ring} />}
    </>
  );
}

function Figure() {
  return (
    <div
      className="pt-figure"
      role="img"
      aria-label="One billing report: 16 database requests before, 2 after. Before, it timed out. Now it finishes."
    >
      <p className="pt-figure-unit" aria-hidden="true">
        <span>Before, it timed out. Now it finishes.</span>
        <span>Database requests, one billing report</span>
      </p>
      <p className="pt-figure-row" aria-hidden="true">
        <span className="pt-figure-was">16</span>
        <ArrowRightIcon className="pt-figure-arrow" weight="bold" />
        <span className="pt-figure-now">
          2
          <span className="pt-ring pt-ring-ink" />
        </span>
      </p>
    </div>
  );
}

function MediaView({
  media,
  width,
  eager,
}: {
  media: Media;
  width: number;
  eager: boolean;
}) {
  if (media.kind === "figure") return <Figure />;
  if (media.kind === "live")
    return <LiveView which={media.key} mark={media.mark} alt={media.alt} />;
  return <ShotView shot={media.shot} width={width} eager={eager} />;
}

/* ---------- Tiles ---------- */

function Caption({ text, proof }: { text: string; proof: string }) {
  const at = text.indexOf(proof);
  if (at < 0) return <span className="pt-caption">{text}</span>;
  return (
    <span className="pt-caption">
      {text.slice(0, at)}
      <span className="pt-proof">{proof}</span>
      {text.slice(at + proof.length)}
    </span>
  );
}

function TileLink({
  tile,
  children,
  onFocus,
  onKeyDown,
}: {
  tile: Tile;
  children: ReactNode;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => void;
}) {
  const props = {
    className: "pt-tile-link",
    onFocus,
    onKeyDown,
    "data-tile": tile.id,
  };
  if (tile.link.external)
    return (
      <a href={tile.link.href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  return (
    <Link to={tile.link.href} {...props}>
      {children}
    </Link>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const ready = useFontsReady();
  const hover = useMedia("(hover: hover) and (pointer: fine)", true);
  const [current, setCurrent] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const [tileWidth, setTileWidth] = useState(432);
  const gridRef = useRef<HTMLOListElement>(null);
  const pointerRef = useRef(false);

  const tint = tiles.find((tile) => tile.id === current)?.hue;

  // Every tile has the same width, so one measure picks every crop.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const first = grid.querySelector<HTMLElement>(".pt-media");
    if (!first) return;
    const update = () => setTileWidth(first.getBoundingClientRect().width);
    update();
    const sizes = new ResizeObserver(update);
    sizes.observe(first);
    return () => sizes.disconnect();
  }, [ready]);

  // On a touch screen, the tile at the middle of the screen is current.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || hover) return;
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.id ?? "";
          if (entry.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        }
        const order = tiles
          .map((tile) => tile.id)
          .filter((id) => inBand.has(id));
        setInstant(false);
        setCurrent(order[0] ?? null);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    grid
      .querySelectorAll<HTMLElement>(".pt-tile")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [hover, ready]);

  const choose = useCallback((id: string | null, byKey: boolean) => {
    setInstant(byKey);
    setCurrent(id);
  }, []);

  const moveFocus = useCallback((event: KeyboardEvent<HTMLAnchorElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    const items = [
      ...grid.querySelectorAll<HTMLAnchorElement>(".pt-tile-link"),
    ];
    const at = items.indexOf(event.currentTarget);
    const top = items[0].getBoundingClientRect().top;
    const columns = Math.max(
      1,
      items.filter(
        (item) => Math.abs(item.getBoundingClientRect().top - top) < 2,
      ).length,
    );
    const next: Record<string, number> = {
      ArrowRight: at + 1,
      ArrowLeft: at - 1,
      ArrowDown: at + columns,
      ArrowUp: at - columns,
      Home: 0,
      End: items.length - 1,
    };
    const target = next[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const item = items[Math.min(items.length - 1, Math.max(0, target))];
    item.focus();
    item.scrollIntoView({ block: "nearest" });
  }, []);

  const style = { "--pt-h": tint ?? 0 } as CSSProperties;

  return (
    <div
      className="pt"
      style={style}
      data-tinted={tint === undefined ? undefined : ""}
      data-instant={instant ? "" : undefined}
      data-ready={ready ? "" : undefined}
    >
      <title>Gentrit Rashiti — web and mobile apps</title>
      {ready && (
        <>
          <header className="pt-head">
            <h1 className="pt-name">
              <span className="pt-name-line">Gentrit Rashiti</span>{" "}
              <span className="pt-claim">
                builds web and mobile apps, from the screens people use to the
                server behind them.
              </span>
            </h1>
            <div className="pt-aside">
              <p>
                5+ years. Part of two platform rewrites. Based in Kosovo,
                working remotely.
              </p>
              <div className="pt-actions">
                <a className="pt-button" href={links.cv} download>
                  Download CV <ArrowDownIcon weight="bold" aria-hidden="true" />
                </a>
                <a className="pt-text-link" href={`mailto:${links.email}`}>
                  Email
                </a>
              </div>
            </div>
          </header>

          <main>
            <h2 className="pt-sr">
              Work, with the part of each screen that proves it
            </h2>
            <ol
              ref={gridRef}
              className="pt-grid"
              onPointerLeave={() => {
                if (hover) choose(null, false);
              }}
              onBlur={(event) => {
                const next = event.relatedTarget as Node | null;
                if (hover && !event.currentTarget.contains(next)) choose(null, true);
              }}
            >
              {tiles.map((tile, i) => (
                <li
                  key={tile.id}
                  className="pt-tile"
                  data-id={tile.id}
                  data-kind={tile.media.kind}
                  data-dark={tile.dark ? "" : undefined}
                  data-current={current === tile.id ? "" : undefined}
                  style={{ "--tile-ground": tile.ground } as CSSProperties}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    pointerRef.current = true;
                    choose(tile.id, false);
                  }}
                >
                  <TileLink
                    tile={tile}
                    onFocus={() => {
                      if (pointerRef.current) {
                        pointerRef.current = false;
                        return;
                      }
                      choose(tile.id, true);
                    }}
                    onKeyDown={moveFocus}
                  >
                    <span
                      className="pt-media"
                      style={
                        {
                          "--pt-k": Math.min(1, tileWidth / 432),
                        } as CSSProperties
                      }
                    >
                      <MediaView
                        media={tile.media}
                        width={tileWidth}
                        eager={i < 6}
                      />
                      {tile.recreation && (
                        <span className="pt-label">
                          Recreation · invented data
                        </span>
                      )}
                    </span>
                    <Caption text={tile.caption} proof={tile.proof} />
                    <span className="pt-meta">
                      <span className="pt-project">
                        <span className="pt-project-name">{tile.project}</span>
                        <span className="pt-role"> · {tile.role} · </span>
                        <span className="pt-year">{tile.year}</span>
                      </span>
                      <span className="pt-go">
                        {tile.link.external ? tile.link.label : "Case"}
                        {tile.link.external ? (
                          <ArrowUpRightIcon weight="bold" aria-hidden="true" />
                        ) : (
                          <ArrowRightIcon weight="bold" aria-hidden="true" />
                        )}
                      </span>
                    </span>
                  </TileLink>
                </li>
              ))}
            </ol>

            <section className="pt-index" aria-labelledby="pt-index-title">
              <h2 id="pt-index-title">All 30 projects</h2>
              {index.map((group) => (
                <div key={group.title} className="pt-group">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.rows.map((row) => (
                      <li key={row.name} className="pt-row">
                        <span className="pt-row-name">{row.name}</span>
                        <span className="pt-row-line">{row.line}</span>
                        <span className="pt-row-end">
                          <span className="pt-row-role">{row.role}</span>
                          <span className="pt-row-year">{row.year}</span>
                          <span className="pt-row-go">
                            {row.link &&
                              (row.link.external ? (
                                <a
                                  href={row.link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`${row.name}: ${row.link.label}, opens in a new tab`}
                                >
                                  {row.link.label}
                                  <ArrowUpRightIcon
                                    weight="bold"
                                    aria-hidden="true"
                                  />
                                </a>
                              ) : (
                                <Link
                                  to={row.link.href}
                                  aria-label={`${row.name}: open the case`}
                                >
                                  {row.link.label}
                                  <ArrowRightIcon
                                    weight="bold"
                                    aria-hidden="true"
                                  />
                                </Link>
                              ))}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </main>

          <footer className="pt-foot">
            <p className="pt-foot-lead">
              Gentrit Rashiti, web and mobile developer. Kosovo, working
              remotely.
            </p>
            <ul className="pt-foot-links">
              <li>
                <a href={`mailto:${links.email}`}>{links.email}</a>
              </li>
              <li>
                <a href={links.github} target="_blank" rel="noreferrer">
                  GitHub <ArrowUpRightIcon weight="bold" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={links.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn <ArrowUpRightIcon weight="bold" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={links.cv} download>
                  Download CV <ArrowDownIcon weight="bold" aria-hidden="true" />
                </a>
              </li>
            </ul>
            <p className="pt-foot-note">
              The care card and the button card are recreations with invented
              data. Every other picture is a crop of a public web page or store
              listing, never enlarged.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
