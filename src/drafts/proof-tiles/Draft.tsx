import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
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
import {
  index,
  lead,
  own,
  work,
  type Box,
  type Crop,
  type Shot,
  type Tile,
} from "./data";
import "./proof-tiles.css";

const fonts = [
  "/fonts/Archivo.woff2",
  "/fonts/MartianMono.woff2",
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

/**
 * A phone layout takes the phone crop when the shot has one. Otherwise the
 * tile takes the narrowest crop that is about as wide as the tile. A 1x
 * capture is never drawn larger than its source pixels; a 2x capture may be
 * drawn up to 15% larger than its CSS size.
 */
function pickCrop(shot: Shot, width: number, phone: boolean): Crop {
  if (phone) {
    const crop = shot.crops.find((item) => item.phone);
    if (crop) return crop;
  }
  const density = shot.density ?? 1;
  const floor = density > 1 ? width * 0.85 : width - 0.5;
  const sorted = shot.crops
    .filter((crop) => !crop.phone)
    .sort((a, b) => a.w - b.w);
  return (
    sorted.find((crop) => crop.w / density >= floor) ??
    sorted[sorted.length - 1]
  );
}

const inset = (outer: Box, inner: Box) =>
  `inset(${pct((inner.y - outer.y) / outer.h)} ${pct(
    (outer.x + outer.w - inner.x - inner.w) / outer.w,
  )} ${pct((outer.y + outer.h - inner.y - inner.h) / outer.h)} ${pct(
    (inner.x - outer.x) / outer.w,
  )})`;

function ShotView({
  shot,
  crop,
  eager,
}: {
  shot: Shot;
  crop: Crop;
  eager: boolean;
}) {
  const mark = crop.mark ?? shot.mark;
  const image = crop.image ?? shot;
  const [loaded, setLoaded] = useState(false);
  const whole = { x: 0, y: 0, w: image.width, h: image.height };
  return (
    <>
      <img
        ref={(element) => {
          if (element?.complete && element.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        className="pt-img"
        src={image.src}
        alt={crop.image?.alt ?? shot.alt}
        width={image.width}
        height={image.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        draggable={false}
        style={{
          width: pct(image.width / crop.w),
          left: pct(-crop.x / crop.w),
          top: pct(-crop.y / crop.h),
          clipPath: crop.clip ? inset(whole, crop.clip) : undefined,
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

interface TileEvents {
  onEnter: () => void;
  onPress: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => void;
}

function TileView({
  tile,
  eager,
  current,
  phone,
  events,
}: {
  tile: Tile;
  eager: boolean;
  current: boolean;
  phone: boolean;
  events: TileEvents;
}) {
  const mediaRef = useRef<HTMLSpanElement>(null);
  const width = useWidth(mediaRef, 432);
  const { media, link } = tile;
  const crop =
    media.kind === "shot" ? pickCrop(media.shot, width, phone) : undefined;
  const ids = {
    caption: `pt-${tile.id}-caption`,
    project: `pt-${tile.id}-project`,
    go: `pt-${tile.id}-go`,
  };
  const content = (
    <>
      <Caption
        id={ids.caption}
        text={tile.caption}
        proof={crop?.proof ?? tile.proof}
      />
      <span className="pt-meta">
        <span className="pt-project">
          <span className="pt-project-line">
            <span id={ids.project} className="pt-project-name">
              {tile.project}
            </span>
            <span className="pt-role">
              {" "}
              · {tile.role} · <span className="pt-year">{tile.year}</span>
            </span>
          </span>
          {tile.real && (
            <span className="pt-note">Real product screens · invented data</span>
          )}
        </span>
        {link && (
          <span id={ids.go} className="pt-go">
            {link.external ? link.label : "Case"}
            {link.external ? (
              <>
                <span className="pt-sr"> (opens in a new tab)</span>
                <ArrowUpRightIcon weight="bold" aria-hidden="true" />
              </>
            ) : (
              <ArrowRightIcon weight="bold" aria-hidden="true" />
            )}
          </span>
        )}
      </span>
    </>
  );
  const linkProps = {
    className: "pt-tile-body pt-tile-link",
    onFocus: events.onFocus,
    onKeyDown: events.onKeyDown,
    "aria-labelledby": `${ids.caption} ${ids.project} ${ids.go}`,
  };

  return (
    <li
      className="pt-tile"
      data-id={tile.id}
      data-kind={media.kind}
      data-dark={tile.dark ? "" : undefined}
      data-current={current ? "" : undefined}
      style={{ "--tile-ground": tile.ground } as CSSProperties}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") events.onEnter();
      }}
      onPointerDown={events.onPress}
    >
      <span
        ref={mediaRef}
        className="pt-media"
        style={crop ? { aspectRatio: `${crop.w} / ${crop.h}` } : undefined}
      >
        {media.kind === "figure" && <Figure />}
        {media.kind === "shot" && crop && (
          <ShotView shot={media.shot} crop={crop} eager={eager} />
        )}
      </span>
      {!link ? (
        <span className="pt-tile-body">{content}</span>
      ) : link.external ? (
        <a href={link.href} target="_blank" rel="noreferrer" {...linkProps}>
          {content}
        </a>
      ) : (
        <Link to={link.href} {...linkProps}>
          {content}
        </Link>
      )}
    </li>
  );
}

/* ---------- The lead: one app, two stores ---------- */

const wipe: KeyframeAnimationOptions = {
  duration: 300,
  easing: "cubic-bezier(0.77, 0, 0.175, 1)",
  fill: "both",
};

/**
 * The same Viva Fresh screen from each store listing. The two crops share one
 * ratio and line up row for row, so a switch shows what changes (the store)
 * and what stays (the app).
 */
function Lead({ reduced }: { reduced: boolean }) {
  const [shown, setShown] = useState(0);
  // The layer on top, and the layer under it while a wipe runs.
  const [layers, setLayers] = useState<{ top: number; under: number | null }>({
    top: 0,
    under: null,
  });
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLSpanElement>(null);
  const running = useRef<Animation[]>([]);
  const { platforms } = lead;
  const current = platforms[shown];

  // The wipe holds its end state until React has moved the layers, then lets go.
  const settle = (top: number) => {
    const done = running.current;
    running.current = [];
    setLayers({ top, under: null });
    requestAnimationFrame(() =>
      done.forEach((animation) => animation.cancel()),
    );
  };

  const choose = (next: number) => {
    if (next === shown) return;
    setShown(next);
    const [reveal, edge] = running.current;
    // A second press during a wipe plays the same wipe back from where it is.
    if (reveal && reveal.playState === "running") {
      reveal.reverse();
      edge?.reverse();
      reveal.onfinish = () => settle(next);
      return;
    }
    const layer = layerRefs.current[next];
    const box = boxRef.current;
    const line = lineRef.current;
    if (reduced || !layer || !box || !line) {
      setLayers({ top: next, under: null });
      return;
    }
    setLayers({ top: next, under: shown });
    const width = box.getBoundingClientRect().width;
    const fromRight = next > shown;
    const wipeIn = layer.animate(
      {
        clipPath: fromRight
          ? ["inset(0 0 0 100%)", "inset(0 0 0 0)"]
          : ["inset(0 100% 0 0)", "inset(0 0 0 0)"],
      },
      wipe,
    );
    const lineMove = line.animate(
      {
        transform: fromRight
          ? [`translateX(${width}px)`, "translateX(0)"]
          : ["translateX(0)", `translateX(${width}px)`],
        opacity: [1, 1],
      },
      { ...wipe, fill: "none" },
    );
    running.current = [wipeIn, lineMove];
    wipeIn.onfinish = () => settle(next);
  };

  return (
    <>
      <div className="pt-lead-text">
        <p className="pt-lead-project">
          <span className="pt-project-name">{lead.project}</span>
          <span className="pt-role">
            {" "}
            · {lead.role} · <span className="pt-year">{lead.year}</span>
          </span>
        </p>
        <h2 className="pt-lead-caption">
          One grocery app, built once for{" "}
          {platforms.length < 2 ? (
            "iPhone and Android."
          ) : (
            <span className="pt-switch-pair">
              {platforms.map((platform, i) => (
                <span key={platform.id}>
                  {i > 0 && " and "}
                  <button
                    type="button"
                    className="pt-switch"
                    aria-pressed={i === shown}
                    aria-controls="pt-lead-screen"
                    onClick={() => choose(i)}
                  >
                    {platform.label}
                  </button>
                </span>
              ))}
              .
            </span>
          )}
        </h2>
      </div>
      <div className="pt-lead-more">
        <p className="pt-lead-scope">{lead.scope} Live in both app stores.</p>
        <p className="pt-lead-links">
          {lead.stores.map((platform) => (
            <a
              key={platform.store}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
            >
              {platform.store}
              <span className="pt-sr"> (opens in a new tab)</span>
              <ArrowUpRightIcon weight="bold" aria-hidden="true" />
            </a>
          ))}
          <Link to={lead.case} aria-label="Viva Fresh: open the case">
            Case <ArrowRightIcon weight="bold" aria-hidden="true" />
          </Link>
        </p>
      </div>
      <figure className="pt-lead-screen" id="pt-lead-screen">
        <div ref={boxRef} className="pt-screen-box">
          {platforms.map((platform, i) => (
            <div
              key={platform.id}
              ref={(element) => {
                layerRefs.current[i] = element;
              }}
              className="pt-screen-layer"
              data-on={i === layers.top ? "" : undefined}
              data-leaving={i === layers.under ? "" : undefined}
              aria-hidden={i === shown ? undefined : true}
            >
              <img
                src={platform.src}
                alt={platform.alt}
                width={platform.width}
                height={platform.height}
                loading="eager"
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                draggable={false}
                style={{
                  width: pct(platform.width / platform.crop.w),
                  left: pct(-platform.crop.x / platform.crop.w),
                  top: pct(-platform.crop.y / platform.crop.h),
                }}
              />
            </div>
          ))}
          <span ref={lineRef} className="pt-screen-edge" aria-hidden="true" />
        </div>
        <figcaption className="pt-lead-label" aria-live="polite">
          {current.store} screenshot · {current.label}
        </figcaption>
      </figure>
    </>
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

const side = ["billing", "incentiv"];
const allTiles = [...work, ...own];

export default function Draft() {
  for (const href of fonts)
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  const ready = useFontsReady();
  const hover = useMedia("(hover: hover) and (pointer: fine)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const phone = useMedia("(max-width: 759px)", false);
  const [current, setCurrent] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const pointerRef = useRef(false);

  const tint = allTiles.find((tile) => tile.id === current)?.hue;

  // On a touch screen, after the first scroll, the tile at the middle of the screen is current.
  useEffect(() => {
    const main = mainRef.current;
    if (!main || hover) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      const hit = [...main.querySelectorAll<HTMLElement>(".pt-tile")].find(
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
    const main = mainRef.current;
    if (!main) return;
    const items = [
      ...main.querySelectorAll<HTMLAnchorElement>(".pt-tile .pt-tile-link"),
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

  const eventsFor = (tile: Tile): TileEvents => ({
    onEnter: () => choose(tile.id, false),
    onPress: () => {
      pointerRef.current = true;
    },
    onFocus: () => {
      if (pointerRef.current) {
        pointerRef.current = false;
        return;
      }
      choose(tile.id, true);
    },
    onKeyDown: moveFocus,
  });

  const listProps = {
    onPointerLeave: () => {
      if (hover) choose(null, false);
    },
    onBlur: (event: FocusEvent<HTMLOListElement>) => {
      const next = event.relatedTarget as Node | null;
      if (hover && !mainRef.current?.contains(next)) choose(null, true);
    },
  };

  const renderTiles = (list: Tile[], eagerCount: number) =>
    list.map((tile, i) => (
      <TileView
        key={tile.id}
        tile={tile}
        eager={i < eagerCount}
        current={current === tile.id}
        phone={phone}
        events={eventsFor(tile)}
      />
    ));

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
          <main ref={mainRef}>
            <section className="pt-top" aria-labelledby="pt-name">
              <div className="pt-lead">
                <div className="pt-intro">
                  <h1 id="pt-name" className="pt-name">
                    <strong>Gentrit Rashiti</strong> builds web and mobile apps.{" "}
                    <span className="pt-name-2">
                      Each result here is shown with its proof.
                    </span>
                  </h1>
                  <p className="pt-level">
                    5+ years. Part of two platform rewrites. Based in Kosovo,
                    working remotely.
                  </p>
                  <p className="pt-actions">
                    <a className="pt-button" href={links.cv} download>
                      Download CV{" "}
                      <ArrowDownIcon weight="bold" aria-hidden="true" />
                    </a>
                    <a className="pt-text-link" href={`mailto:${links.email}`}>
                      Email
                    </a>
                  </p>
                </div>
                <Lead reduced={reduced} />
              </div>
              <ol className="pt-grid pt-side" {...listProps}>
                {renderTiles(
                  side.map((id) => work.find((tile) => tile.id === id)!),
                  2,
                )}
              </ol>
            </section>

            <section className="pt-more" aria-labelledby="pt-more-title">
              <div className="pt-section-head">
                <h2 id="pt-more-title">More client work</h2>
                <p>
                  A care platform shared by many client organizations, its
                  design system and a bookshop app. The two care-platform cards
                  are real product screens with invented data.
                </p>
              </div>
              <ol className="pt-grid" {...listProps}>
                {renderTiles(
                  work.filter((tile) => !side.includes(tile.id)),
                  0,
                )}
              </ol>
            </section>

            <section className="pt-own" aria-labelledby="pt-own-title">
              <div className="pt-section-head">
                <h2 id="pt-own-title">Own projects</h2>
                <p>
                  Made outside client work. Offday is a working time-off app for
                  teams, covered by about 200 automated tests; its code is
                  private. OFFBEAT and FORM are concepts: the brands are made
                  up, the code is on GitHub.
                </p>
              </div>
              <ol className="pt-grid pt-grid-own" {...listProps}>
                {renderTiles(own, 0)}
              </ol>
            </section>

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
              The care card and the button card are real product screens with
              invented data. Every other picture is a crop of a public web page, a store
              listing or a screenshot of an own project.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
