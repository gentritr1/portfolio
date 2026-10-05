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
  type RefObject,
} from "react";
import { preload } from "react-dom";
import { Link } from "react-router";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { index, tiles, type Box, type Shot, type Tile } from "./data";
import "./proof-tiles.css";

const fonts = [
  "/fonts/Archivo.woff2",
  "/fonts/MartianMono.woff2",
  "/fonts/creative/GentritText-Latin.woff2",
  "/fonts/creative/JetBrainsMono-Latin.woff2",
];

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

/**
 * The page faces use font-display optional, so a face that is late is never
 * swapped in. The page waits at most 300 ms for them, then shows the fallback.
 */
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
      document.fonts.load('500 16px "PT Archivo"'),
      document.fonts.load('400 12px "PT Martian"'),
    ]).then(finish, finish);
    return () => window.clearTimeout(timer);
  }, []);
  return ready;
}

function useWidth(ref: RefObject<HTMLElement | null>, fallback: number) {
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(element.getBoundingClientRect().width);
    update();
    const sizes = new ResizeObserver(update);
    sizes.observe(element);
    return () => sizes.disconnect();
  }, [ref]);
  return width;
}

/* ---------- Media ---------- */

const pct = (value: number) => `${value * 100}%`;

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
  };
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
        draggable={false}
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
  scale,
}: {
  which: keyof typeof live;
  mark: string;
  alt: string;
  scale: number;
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
    <span className="pt-live-frame" role="img" aria-label={alt}>
      <div
        ref={ref}
        className={`pt-live pt-live-${which}`}
        data-world={entry.world}
        style={{ "--pt-k": scale } as CSSProperties}
        inert
      >
        <Suspense fallback={null}>
          <Live />
        </Suspense>
      </div>
      {ring && <span className="pt-ring" aria-hidden="true" style={ring} />}
    </span>
  );
}

function Figure() {
  return (
    <div
      className="pt-figure"
      role="img"
      aria-label="Database requests for one billing report: 16 before, 2 after."
    >
      <p className="pt-figure-unit" aria-hidden="true">
        Database requests, one billing report
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

/* ---------- Tiles ---------- */

function Caption({
  id,
  text,
  proof,
}: {
  id: string;
  text: string;
  proof: string;
}) {
  const at = text.indexOf(proof);
  if (at < 0)
    return (
      <span id={id} className="pt-caption">
        {text}
      </span>
    );
  return (
    <span id={id} className="pt-caption">
      {text.slice(0, at)}
      <span className="pt-proof">{proof}</span>
      {text.slice(at + proof.length)}
    </span>
  );
}

function TileView({
  tile,
  eager,
  current,
  onEnter,
  onPress,
  onFocus,
  onKeyDown,
}: {
  tile: Tile;
  eager: boolean;
  current: boolean;
  onEnter: () => void;
  onPress: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => void;
}) {
  const mediaRef = useRef<HTMLSpanElement>(null);
  const width = useWidth(mediaRef, 432);
  const { media } = tile;
  const ids = {
    caption: `pt-${tile.id}-caption`,
    project: `pt-${tile.id}-project`,
    go: `pt-${tile.id}-go`,
  };
  const content = (
    <>
      <Caption id={ids.caption} text={tile.caption} proof={tile.proof} />
      {tile.scope && <span className="pt-scope">{tile.scope}</span>}
      <span className="pt-meta">
        <span className="pt-project">
          <span className="pt-project-line">
            <span id={ids.project} className="pt-project-name">
              {tile.project}
            </span>
            <span className="pt-role"> · {tile.role} · </span>
            <span className="pt-year">{tile.year}</span>
          </span>
          {tile.recreation && (
            <span className="pt-note">Recreation · invented data</span>
          )}
        </span>
        <span id={ids.go} className="pt-go">
          {tile.link.external ? tile.link.label : "Case"}
          {tile.link.external ? (
            <>
              <span className="pt-sr"> (opens in a new tab)</span>
              <ArrowUpRightIcon weight="bold" aria-hidden="true" />
            </>
          ) : (
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          )}
        </span>
      </span>
    </>
  );
  const linkProps = {
    className: "pt-tile-link",
    onFocus,
    onKeyDown,
    "aria-labelledby": `${ids.caption} ${ids.project} ${ids.go}`,
  };

  return (
    <li
      className="pt-tile"
      data-id={tile.id}
      data-kind={media.kind}
      data-lead={tile.scope ? "" : undefined}
      data-dark={tile.dark ? "" : undefined}
      data-current={current ? "" : undefined}
      style={{ "--tile-ground": tile.ground } as CSSProperties}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onEnter();
      }}
      onPointerDown={onPress}
    >
      <span ref={mediaRef} className="pt-media">
        {media.kind === "figure" && <Figure />}
        {media.kind === "live" && (
          <LiveView
            which={media.key}
            mark={media.mark}
            alt={media.alt}
            scale={Math.min(1, width / 432)}
          />
        )}
        {media.kind === "shot" && (
          <ShotView shot={media.shot} width={width} eager={eager} />
        )}
      </span>
      {tile.link.external ? (
        <a
          href={tile.link.href}
          target="_blank"
          rel="noreferrer"
          {...linkProps}
        >
          {content}
        </a>
      ) : (
        <Link to={tile.link.href} {...linkProps}>
          {content}
        </Link>
      )}
    </li>
  );
}

/**
 * Left and right follow reading order. Up and down go to the nearest tile in
 * the next row, so the keys follow the layout at every width.
 */
function nextTile(boxes: DOMRect[], at: number, key: string) {
  if (key === "ArrowRight") return at + 1;
  if (key === "ArrowLeft") return at - 1;
  if (key === "Home") return 0;
  if (key === "End") return boxes.length - 1;
  if (key !== "ArrowDown" && key !== "ArrowUp") return undefined;
  const from = boxes[at];
  const centre = from.left + from.width / 2;
  let best = at;
  let score = Infinity;
  boxes.forEach((box, i) => {
    const gap =
      key === "ArrowDown" ? box.top - from.bottom : from.top - box.bottom;
    if (i === at || gap < -1) return;
    const value = gap * 4 + Math.abs(box.left + box.width / 2 - centre);
    if (value < score) {
      score = value;
      best = i;
    }
  });
  return best;
}

/* ---------- Page ---------- */

export default function Draft() {
  for (const href of fonts)
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  const ready = useFontsReady();
  const hover = useMedia("(hover: hover) and (pointer: fine)", true);
  const [current, setCurrent] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const gridRef = useRef<HTMLOListElement>(null);
  const pointerRef = useRef(false);

  const tint = tiles.find((tile) => tile.id === current)?.hue;

  // On a touch screen, after the first scroll, the tile at the middle of the screen is current.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || hover) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      const hit = [...grid.querySelectorAll<HTMLElement>(".pt-tile")].find(
        (element) => {
          const box = element.getBoundingClientRect();
          return box.top <= middle && box.bottom >= middle;
        },
      );
      setInstant(false);
      setCurrent(hit?.dataset.id ?? null);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
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
    const cells = items.map(
      (item) => item.closest<HTMLElement>(".pt-tile") ?? item,
    );
    const target = nextTile(
      cells.map((cell) => cell.getBoundingClientRect()),
      items.indexOf(event.currentTarget),
      event.key,
    );
    if (target === undefined) return;
    event.preventDefault();
    const at = Math.min(items.length - 1, Math.max(0, target));
    items[at].focus({ preventScroll: true });
    cells[at].scrollIntoView({ block: "nearest" });
  }, []);

  const style = { "--pt-h": tint ?? 0 } as CSSProperties;

  return (
    <div
      className="pt"
      style={style}
      data-tinted={tint === undefined ? undefined : ""}
      data-instant={instant ? "" : undefined}
    >
      <title>Gentrit Rashiti — web and mobile apps</title>
      {ready && (
        <>
          <header className="pt-head">
            <div className="pt-intro">
              <h1 className="pt-name">
                <strong>Gentrit Rashiti</strong> builds web and mobile apps.{" "}
                <span className="pt-name-2">
                  Each result below is shown on the screen that proves it.
                </span>
              </h1>
              <p className="pt-level">
                5+ years. Part of two platform rewrites. Based in Kosovo,
                working remotely.
              </p>
            </div>
            <div className="pt-actions">
              <a className="pt-button" href={links.cv} download>
                Download CV <ArrowDownIcon weight="bold" aria-hidden="true" />
              </a>
              <a className="pt-text-link" href={`mailto:${links.email}`}>
                Email
              </a>
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
                if (hover && !event.currentTarget.contains(next))
                  choose(null, true);
              }}
            >
              {tiles.map((tile, i) => (
                <TileView
                  key={tile.id}
                  tile={tile}
                  eager={i < 6}
                  current={current === tile.id}
                  onEnter={() => choose(tile.id, false)}
                  onPress={() => {
                    pointerRef.current = true;
                  }}
                  onFocus={() => {
                    if (pointerRef.current) {
                      pointerRef.current = false;
                      return;
                    }
                    choose(tile.id, true);
                  }}
                  onKeyDown={moveFocus}
                />
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
