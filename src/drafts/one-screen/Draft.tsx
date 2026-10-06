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
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { preload } from "react-dom";
import { useNavigate } from "react-router";
import { links } from "../../content/links";
import { client, lines, own, type Line, type Pane, type Screen } from "./screens";
import "./one-screen.css";

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Instrument+Serif:ital@1&display=swap";
const FONT_FILES = [
  "https://fonts.gstatic.com/s/instrumentsans/v4/pxiTypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr0SZe1ZuWi3g.woff2",
  "https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zAjjH7Motmp5g.woff2",
];
/** The page waits this long for its faces. After it, the fallback stays for the visit, so no line moves. */
const FONT_WAIT_MS = 300;

const fontCss: Promise<void> = (() => {
  if (typeof document === "undefined") return Promise.resolve();
  const head = document.head;
  for (const origin of ["https://fonts.googleapis.com", "https://fonts.gstatic.com"]) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    if (origin.includes("gstatic")) link.crossOrigin = "";
    head.append(link);
  }
  for (const href of FONT_FILES) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "";
    link.href = href;
    head.append(link);
  }
  const existing = document.querySelector<HTMLLinkElement>(`link[href="${FONT_CSS}"]`);
  if (existing) return Promise.resolve();
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = FONT_CSS;
  const ready = new Promise<void>((resolve) => {
    sheet.onload = () => resolve();
    sheet.onerror = () => resolve();
  });
  head.append(sheet);
  return ready;
})();

preload(client[0].screens[0].panes[0].src, { as: "image", fetchPriority: "high" });

type FontState = "wait" | "real" | "fallback";

function useFonts(): FontState {
  const [state, setState] = useState<FontState>("wait");
  useEffect(() => {
    let settled = false;
    const timer = window.setTimeout(() => {
      settled = true;
      setState("fallback");
    }, FONT_WAIT_MS);
    fontCss
      .then(() =>
        Promise.all([
          document.fonts.load('400 17px "Instrument Sans"'),
          document.fonts.load('500 17px "Instrument Sans"'),
          document.fonts.load('italic 400 20px "Instrument Serif"'),
        ]),
      )
      .then((faces) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        setState(faces.every((f) => f.length > 0) ? "real" : "fallback");
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        setState("fallback");
      });
    return () => {
      settled = true;
      window.clearTimeout(timer);
    };
  }, []);
  return state;
}

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const decoded = new Map<string, Promise<void>>();
function warm(src: string): Promise<void> {
  let job = decoded.get(src);
  if (!job) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    job = img.decode().catch(() => undefined);
    decoded.set(src, job);
  }
  return job;
}
const warmPanes = (panes: Pane[]) => Promise.all(panes.map((p) => warm(p.src))).then(() => undefined);

interface Pick {
  id: string;
  shot: number;
}
const keyOf = (p: Pick) => `${p.id}:${p.shot}`;
const lineOf = (id: string) => lines.find((l) => l.id === id) ?? lines[0];
const screenOf = (p: Pick) => {
  const line = lineOf(p.id);
  return line.screens[Math.min(p.shot, line.screens.length - 1)];
};

interface Layer extends Pick {
  serial: number;
  /** Fade length in ms. 0: no fade. */
  fade: number;
}

export default function Draft() {
  const fonts = useFonts();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 899px)");
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const nameRefs = useRef(new Map<string, HTMLElement>());
  const rowRefs = useRef(new Map<string, HTMLElement>());

  const [current, setCurrent] = useState<Pick>({ id: client[0].id, shot: 0 });
  const [ruleInstant, setRuleInstant] = useState(true);
  const [layers, setLayers] = useState<Layer[]>([]);
  const serial = useRef(0);
  const wanted = useRef("");
  const hoverTimer = useRef(0);

  const show = useCallback(
    (pick: Pick, fade: number) => {
      const key = keyOf(pick);
      wanted.current = key;
      const screen = screenOf(pick);
      const panes = narrow ? [screen.narrow] : screen.panes;
      const place = () => {
        if (wanted.current !== key) return;
        setLayers((prev) => {
          if (prev.length && keyOf(prev[prev.length - 1]) === key) return prev;
          serial.current += 1;
          return [...prev.slice(-1), { ...pick, serial: serial.current, fade: reduced ? 0 : fade }];
        });
      };
      /* A keyboard move is instant: the screen swaps now and paints its own ground until the image arrives. */
      if (fade === 0) {
        void warmPanes(panes);
        place();
        return;
      }
      Promise.race([warmPanes(panes), new Promise((r) => window.setTimeout(r, 600))]).then(place);
    },
    [narrow, reduced],
  );

  const select = useCallback(
    (pick: Pick, instant: boolean) => {
      setRuleInstant(instant || reduced);
      setCurrent(pick);
      show(pick, instant ? 0 : 200);
    },
    [reduced, show],
  );

  const ready = fonts !== "wait";
  const arrived = useRef(false);
  useEffect(() => {
    if (!ready || arrived.current) return;
    arrived.current = true;
    show({ id: client[0].id, shot: 0 }, 300);
  }, [ready, show]);

  const settled = useCallback((n: number) => {
    setLayers((prev) => (prev.length > 1 ? prev.filter((l) => l.serial >= n) : prev));
  }, []);

  /* The rule under the current name: one element, moved by transform. */
  const placeRule = useCallback(() => {
    const rule = ruleRef.current;
    const work = workRef.current;
    const name = nameRefs.current.get(current.id);
    if (!rule || !work || !name) return;
    const box = work.getBoundingClientRect();
    const r = name.getBoundingClientRect();
    rule.style.transform = `translate3d(${r.left - box.left}px, ${r.bottom - box.top + 1}px, 0) scaleX(${r.width / 100})`;
  }, [current.id]);

  useLayoutEffect(() => {
    const rule = ruleRef.current;
    if (!rule) return;
    if (ruleInstant) rule.style.transition = "none";
    placeRule();
    if (ruleInstant) {
      void rule.offsetWidth;
      rule.style.transition = "";
    }
  }, [placeRule, ruleInstant, fonts, narrow]);

  useEffect(() => {
    const work = workRef.current;
    if (!work) return;
    const observer = new ResizeObserver(() => {
      const rule = ruleRef.current;
      if (!rule) return;
      rule.style.transition = "none";
      placeRule();
      void rule.offsetWidth;
      rule.style.transition = "";
    });
    observer.observe(work);
    return () => observer.disconnect();
  }, [placeRule]);

  /* The panel's height keeps the end of the page clear of it. */
  useEffect(() => {
    const panel = panelRef.current;
    const root = rootRef.current;
    if (!panel || !root) return;
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--os-panel", `${panel.offsetHeight}px`);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  /* Paint the canvas behind the page in the page's own colour. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const before = html.style.backgroundColor;
    const paint = () => {
      html.style.backgroundColor = getComputedStyle(root).getPropertyValue("--os-paper").trim();
    };
    paint();
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    dark.addEventListener("change", paint);
    return () => {
      dark.removeEventListener("change", paint);
      html.style.backgroundColor = before;
    };
  }, []);

  /* On a desktop, the first pointer move or key press warms every screen, so a hover does not wait for the network. */
  useEffect(() => {
    if (narrow) return;
    const once = () => {
      for (const l of lines) for (const s of l.screens) void warmPanes(s.panes);
    };
    window.addEventListener("pointermove", once, { once: true, passive: true });
    window.addEventListener("keydown", once, { once: true });
    return () => {
      window.removeEventListener("pointermove", once);
      window.removeEventListener("keydown", once);
    };
  }, [narrow]);

  const leave = useCallback(
    (href: string) => {
      const root = rootRef.current;
      if (reduced || !root) {
        navigate(href);
        return;
      }
      const fade = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: EASE, fill: "forwards" });
      fade.onfinish = () => navigate(href);
    },
    [navigate, reduced],
  );

  const onRowClick = (event: MouseEvent<HTMLElement>, line: Line) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (narrow && current.id !== line.id) {
      event.preventDefault();
      select({ id: line.id, shot: 0 }, false);
      return;
    }
    if (!line.href || line.external) return;
    event.preventDefault();
    leave(line.href);
  };

  const onRowPointerEnter = (event: PointerEvent<HTMLElement>, line: Line) => {
    if (event.pointerType !== "mouse" || narrow) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      if (current.id !== line.id) select({ id: line.id, shot: 0 }, false);
    }, 80);
  };
  const onRowPointerLeave = () => window.clearTimeout(hoverTimer.current);

  const onRowFocus = (event: FocusEvent<HTMLElement>, line: Line) => {
    if (current.id === line.id) return;
    const keyboard = event.currentTarget.matches(":focus-visible");
    if (!keyboard) return;
    select({ id: line.id, shot: 0 }, true);
  };

  const onRowKey = (event: KeyboardEvent<HTMLElement>, line: Line) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const at = lines.findIndex((l) => l.id === line.id);
    const next = lines[at + (event.key === "ArrowDown" ? 1 : -1)];
    if (!next) return;
    event.preventDefault();
    rowRefs.current.get(next.id)?.focus();
  };

  const currentLine = lineOf(current.id);
  const currentScreen = screenOf(current);
  const switcher =
    currentLine.screens.length > 1 ? (
      <span className="os-switch" role="group" aria-label={`${currentLine.name} screens`}>
        {currentLine.screens.map((s, i) => (
          <button
            key={s.tab}
            type="button"
            aria-pressed={current.shot === i}
            onClick={(e) => {
              if (current.shot === i) return;
              select({ id: currentLine.id, shot: i }, e.detail === 0);
            }}
          >
            {s.tab}
          </button>
        ))}
      </span>
    ) : null;

  const row = (line: Line) => {
    const isCurrent = line.id === current.id;
    const body = (
      <>
        <span
          className="os-name"
          ref={(el) => {
            if (el) nameRefs.current.set(line.id, el);
          }}
        >
          {line.name}
          {line.external && <ExternalMark />}
        </span>
        <span className="os-line">{line.line}</span>
      </>
    );
    const common = {
      className: "os-row",
      "aria-current": isCurrent ? ("true" as const) : undefined,
      ref: (el: HTMLElement | null) => {
        if (el) rowRefs.current.set(line.id, el);
      },
      onPointerEnter: (e: PointerEvent<HTMLElement>) => onRowPointerEnter(e, line),
      onPointerLeave: onRowPointerLeave,
      onFocus: (e: FocusEvent<HTMLElement>) => onRowFocus(e, line),
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => onRowKey(e, line),
      onClick: (e: MouseEvent<HTMLElement>) => onRowClick(e, line),
    };
    return (
      <li key={line.id}>
        {line.href ? (
          <a
            {...common}
            href={line.href}
            {...(line.external ? { target: "_blank", rel: "noreferrer", "aria-label": `${line.name}: ${line.line}. Code on GitHub, opens in a new tab` } : {})}
          >
            {body}
          </a>
        ) : (
          <button type="button" {...common}>
            {body}
          </button>
        )}
      </li>
    );
  };

  return (
    <div ref={rootRef} className="os" data-fonts={fonts} style={{ "--os-panel": "0px" } as CSSProperties}>
      <title>Gentrit Rashiti</title>
      <div className="os-main">
        <header className="os-head">
          <h1 className="os-me">Gentrit Rashiti</h1>
          <p className="os-sub">Builds web and mobile apps. Part of two platform rewrites. 5+ years, working remotely from Kosovo.</p>
          <Requests still={reduced || !ready} />
        </header>

        <div className="os-work" ref={workRef}>
          <section aria-labelledby="os-client">
            <h2 className="os-group" id="os-client">
              Client work
            </h2>
            <ul className="os-list">{client.map(row)}</ul>
          </section>
          <section aria-labelledby="os-own">
            <h2 className="os-group" id="os-own">
              Own projects
            </h2>
            <ul className="os-list">{own.map(row)}</ul>
          </section>
          <span className="os-rule" ref={ruleRef} aria-hidden="true" />
        </div>

        <footer className="os-contact">
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={links.cv}>CV</a>
        </footer>
      </div>

      <div className="os-side">
        <figure className="os-shot" ref={panelRef}>
          <div className="os-stage">
            {layers.map((layer) => (
              <ScreenLayer
                key={layer.serial}
                layer={layer}
                screen={screenOf(layer)}
                narrow={narrow}
                onDone={settled}
              />
            ))}
          </div>
          <figcaption className="os-caption">
            {narrow ? (
              <span className="os-cap-text">
                <span className="os-cap-title">{currentLine.note ?? currentScreen.narrowTitle ?? currentScreen.title}</span>
              </span>
            ) : (
              <span className="os-cap-text">
                <span className="os-cap-title">{currentScreen.title}</span>
                <span className="os-cap-meta">
                  {currentLine.meta}
                  {currentLine.note && ` · ${currentLine.note}`}
                </span>
              </span>
            )}
            {!narrow && switcher}
          </figcaption>
          {narrow && (currentLine.href || switcher) && (
            <div className="os-actions">
              {currentLine.href ? (
                <a
                  className="os-open"
                  href={currentLine.href}
                  aria-label={currentLine.external ? `${currentLine.name} code on GitHub, opens in a new tab` : `Read the case: ${currentLine.name}`}
                  {...(currentLine.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  onClick={(e) => {
                    if (currentLine.external || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    leave(currentLine.href!);
                  }}
                >
                  {currentLine.external ? "Code on GitHub" : "Read the case"}
                  <Arrow />
                </a>
              ) : (
                <span className="os-private">Private code</span>
              )}
              {switcher}
            </div>
          )}
        </figure>

        <section className="os-how" aria-labelledby="os-how">
          <h2 className="os-group" id="os-how">
            How Gentrit works
          </h2>
          <p className="os-way">Gentrit writes the rules first. AI agents build inside them.</p>
          <Flow still={reduced || !ready} />
          <p className="os-more">
            <span>See it in</span>
            <a
              href="/work/care-platform"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                leave("/work/care-platform");
              }}
            >
              Care platform
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/work/design-system-react"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                leave("/work/design-system-react");
              }}
            >
              Design System v2
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

function ScreenLayer({
  layer,
  screen,
  narrow,
  onDone,
}: {
  layer: Layer;
  screen: Screen;
  narrow: boolean;
  onDone: (serial: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!layer.fade) {
      onDone(layer.serial);
      return;
    }
    const fade = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: layer.fade, easing: EASE, fill: "backwards" });
    fade.onfinish = () => onDone(layer.serial);
    return () => fade.cancel();
  }, [layer.fade, layer.serial, onDone]);

  const panes = narrow ? [screen.narrow] : screen.panes;
  const alt = narrow ? (screen.narrowAlt ?? screen.alt) : screen.alt;
  return (
    <div ref={ref} className="os-layer" data-count={panes.length} style={{ "--os-ground": screen.ground } as CSSProperties}>
      {panes.map((pane, i) => (
        <PaneView key={pane.src + i} pane={pane} alt={i === 0 ? alt : ""} phone={pane.width < pane.height} />
      ))}
    </div>
  );
}

function PaneView({ pane, alt, phone }: { pane: Pane; alt: string; phone: boolean }) {
  const { crop, width, height } = pane;
  const style = {
    aspectRatio: `${crop.w} / ${crop.h}`,
  } as CSSProperties;
  const img = {
    left: `${(-crop.x / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
    width: `${(width / crop.w) * 100}%`,
    height: `${(height / crop.h) * 100}%`,
  } as CSSProperties;
  return (
    <div className="os-pane" data-phone={phone ? "" : undefined} style={style}>
      <img src={pane.src} alt={alt} width={width} height={height} decoding="async" draggable={false} style={img} />
    </div>
  );
}

/** Plays once, when the element first enters the view. */
function useOnce(ref: RefObject<Element | null>, play: () => void, skip: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || skip) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);
}

/** One report, 16 requests to the database, then 2: fourteen of the sixteen marks fall away, right to left. */
function Requests({ still }: { still: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  useOnce(
    ref,
    () => {
      if (played.current) return;
      played.current = true;
      const marks = ref.current?.querySelectorAll<HTMLElement>(".os-mark");
      if (!marks) return;
      marks.forEach((mark, i) => {
        if (i < 2) return;
        mark.animate(
          [
            { transform: "scaleY(1)", opacity: 1 },
            { transform: "scaleY(0.43)", opacity: 0.22 },
          ],
          { duration: 380, delay: 120 + (15 - i) * 18, easing: EASE, fill: "backwards" },
        );
      });
    },
    still,
  );
  return (
    <p className="os-result">
      <span>One report made 16 database requests. Now it makes 2.</span>
      <span className="os-marks" ref={ref} aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="os-mark" data-gone={i >= 2 ? "" : undefined} />
        ))}
      </span>
    </p>
  );
}

const STEPS = ["Rules", "AI agents build", "Checks", "A person approves"];

/** How a change gets in: four steps, and the way back when a check fails. Drawn once, in reading order. */
function Flow({ still }: { still: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loop, setLoop] = useState<{ d: string; head: string; w: number; h: number; side?: { left: number; top: number } } | null>(null);

  /* The way back runs from "Checks" to "AI agents build": under the row, or beside the column on a phone. */
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const measure = () => {
      const box = root.getBoundingClientRect();
      const words = [...root.querySelectorAll<HTMLElement>(".os-step > span")].map((el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top };
      });
      const steps = root.querySelector<HTMLElement>(".os-steps");
      if (words.length < 3 || !steps) return;
      const column = getComputedStyle(steps).getPropertyValue("--os-flow").trim() === "column";
      const a = words[1];
      const c = words[2];
      const r = (n: number) => Math.round(n * 10) / 10;
      if (column) {
        const ya = r((a.t + a.b) / 2);
        const yc = r((c.t + c.b) / 2);
        const xr = r(Math.max(a.r, c.r) + 30);
        const d = `M${r(c.r + 8)} ${yc}H${xr - 9}q9 0 9-9V${ya + 9}q0-9-9-9H${r(a.r + 8)}`;
        const head = `M${r(a.r + 11.5)} ${ya - 3.5}L${r(a.r + 8)} ${ya}l3.5 3.5`;
        setLoop({ d, head, w: box.width, h: box.height, side: { left: xr + 14, top: ya - 10 } });
      } else {
        const y0 = r(Math.max(a.b, c.b) + 5);
        const xa = r((a.l + a.r) / 2);
        const xc = r((c.l + c.r) / 2);
        const d = `M${xc} ${y0}v8q0 9-9 9H${xa + 9}q-9 0-9-9V${y0}`;
        const head = `M${xa - 3.5} ${y0 + 3.5}L${xa} ${y0}l3.5 3.5`;
        setLoop({ d, head, w: box.width, h: box.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useOnce(
    ref,
    () => {
      const root = ref.current;
      if (!root) return;
      const base = 240;
      const step = 110;
      root.querySelectorAll<HTMLElement>(".os-step > span").forEach((word, i) => {
        word.animate(
          [
            { opacity: 0, transform: "translate3d(0, 4px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          { duration: 220, delay: base + i * step, easing: EASE, fill: "backwards" },
        );
      });
      root.querySelectorAll<SVGPathElement>(".os-arrow path").forEach((path, i) => {
        path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: 130,
          delay: base + 50 + i * step,
          easing: EASE,
          fill: "backwards",
        });
      });
      root.querySelector<SVGPathElement>(".os-back path:not(.os-head)")?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 280,
        delay: base + 3 * step + 60,
        easing: EASE,
        fill: "backwards",
      });
      root.querySelector<SVGPathElement>(".os-back .os-head")?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 80,
        delay: base + 3 * step + 320,
        easing: EASE,
        fill: "backwards",
      });
      root.querySelector<HTMLElement>(".os-back-label")?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        delay: base + 3 * step + 220,
        easing: EASE,
        fill: "backwards",
      });
    },
    still,
  );

  return (
    <div className="os-flow" ref={ref} data-side={loop?.side ? "" : undefined}>
      <ol className="os-steps">
        {STEPS.map((step, i) => (
          <li key={step} className="os-step" data-person={i === 3 ? "" : undefined}>
            {i > 0 && (
              <svg className="os-arrow" viewBox="0 0 24 10" aria-hidden="true">
                <path d="M1 5h21M17.5 1.5 22 5l-4.5 3.5" pathLength={1} />
              </svg>
            )}
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {loop && (
        <svg className="os-back" width={loop.w} height={loop.h} viewBox={`0 0 ${loop.w} ${loop.h}`} aria-hidden="true">
          <path d={loop.d} pathLength={1} />
          <path className="os-head" d={loop.head} pathLength={1} />
        </svg>
      )}
      <p className="os-back-label" style={loop?.side ? { left: loop.side.left, top: loop.side.top } : undefined}>
        A check fails? The work goes back to the agents.
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <svg className="os-arrow-r" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ExternalMark() {
  return (
    <svg className="os-ext" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
