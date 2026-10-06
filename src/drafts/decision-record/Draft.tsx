import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import { recordById, records, type DecisionRecord, type Evidence } from "./data";
import "./decision-record.css";

const easeInOut = "cubic-bezier(0.77, 0, 0.175, 1)";
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

function useMedia(query: string) {
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

const initialId = () => {
  const fromHash = window.location.hash.slice(1);
  return recordById(fromHash) ? fromHash : records[0].id;
};

const pairOf = (record: DecisionRecord): [string, string] | null => {
  if (record.supersedes) return [record.id, record.supersedes];
  if (record.supersededBy) return [record.id, record.supersededBy];
  return null;
};

function Status({ record }: { record: DecisionRecord }) {
  return record.status === "Accepted" ? (
    <span className="dr-status" data-status="accepted">
      <span className="dr-dot" aria-hidden="true" />
      Accepted
    </span>
  ) : (
    <span className="dr-status" data-status="superseded">
      Superseded<span className="dr-status-by">by {record.supersededBy}</span>
    </span>
  );
}

/** Splits a sentence at `{n}` and prints the measure value there. */
function Measured({ text, value }: { text: string; value: string }) {
  const [before, after] = text.split("{n}");
  if (after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      <span className="dr-n">{value}</span>
      {after}
    </>
  );
}

function Lane({
  value,
  unit,
  numberRef,
  tone,
}: {
  value?: string;
  unit?: string;
  numberRef?: RefObject<HTMLSpanElement | null>;
  tone?: "before" | "after";
}) {
  return (
    <span className="dr-lane" aria-hidden="true" data-tone={tone}>
      {value && (
        <>
          <span ref={numberRef} className="dr-lane-n">
            {value}
          </span>
          <span className="dr-lane-unit">{unit}</span>
        </>
      )}
    </span>
  );
}

function Stage({ evidence }: { evidence: Evidence }) {
  if (evidence.kind === "shot") {
    return <CropShot shot={evidence.shot} className="dr-shot" style={{ maxWidth: evidence.shot.crop.w }} />;
  }
  return (
    <div className="dr-shots" data-kind={evidence.kind} data-count={evidence.images.length}>
      {evidence.images.map((image) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          width={evidence.kind === "phone" ? 780 : 1440}
          height={evidence.kind === "phone" ? 1689 : 900}
        />
      ))}
    </div>
  );
}

function RecordBody({
  record,
  travel,
  fade,
  onOpen,
  headingId,
}: {
  record: DecisionRecord;
  travel: boolean;
  fade: boolean;
  onOpen: (id: string, instant: boolean) => void;
  headingId?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const { measure } = record;

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!fade || !box) return;
    const animation = box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: easeOut });
    return () => animation.cancel();
  }, [fade]);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!travel || !measure || !box || !from || !to) return;
    const b = box.getBoundingClientRect();
    const f = from.getBoundingClientRect();
    const t = to.getBoundingClientRect();
    const ghost = document.createElement("span");
    ghost.className = "dr-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = measure.print(measure.from);
    ghost.style.left = `${f.left - b.left}px`;
    ghost.style.top = `${f.top - b.top}px`;
    box.append(ghost);
    to.dataset.waiting = "";
    const animation = ghost.animate(
      [{ transform: "translate(0, 0)" }, { transform: `translate(${t.left - f.left}px, ${t.top - f.top}px)` }],
      { duration: 460, delay: 140, easing: easeInOut, fill: "forwards" },
    );
    let frame = 0;
    const count = () => {
      const progress = animation.effect?.getComputedTiming().progress ?? 0;
      ghost.textContent = measure.print(Math.round(measure.from + (measure.to - measure.from) * progress));
      if (animation.playState !== "finished") frame = requestAnimationFrame(count);
    };
    count();
    let live = true;
    animation.finished
      .then(() => {
        if (!live) return;
        ghost.remove();
        delete to.dataset.waiting;
      })
      .catch(() => {});
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      animation.cancel();
      ghost.remove();
      delete to.dataset.waiting;
    };
  }, [travel, measure]);

  const related = record.supersedes ?? record.supersededBy;

  return (
    <div className="dr-body" ref={boxRef}>
      <p className="dr-rec-meta">
        <span className="dr-mono">{record.id}</span>
        <span className="dr-mono">{record.years}</span>
        <Status record={record} />
      </p>
      <h2 className="dr-rec-title" id={headingId}>
        {record.title}
      </h2>
      <p className="dr-rec-scope">
        <span className="dr-rec-scope-project">{record.project} · </span>
        <span className="dr-rec-scope-label">Role: </span>
        {record.role}
      </p>
      <dl className="dr-cdc" data-measured={measure ? "" : undefined}>
        <div>
          <dt>Context</dt>
          <dd>
            <Measured text={record.context} value={measure ? measure.print(measure.from) : ""} />
          </dd>
          {measure && (
            <Lane value={measure.print(measure.from)} unit={measure.unit} numberRef={fromRef} tone="before" />
          )}
        </div>
        <div>
          <dt>Decision</dt>
          <dd>{record.decision}</dd>
          {measure && <Lane />}
        </div>
        <div>
          <dt>Consequence</dt>
          <dd>
            <Measured text={record.consequence} value={measure ? measure.print(measure.to) : ""} />
          </dd>
          {measure && (
            <Lane
              value={measure.print(measure.to)}
              unit={measure.unit}
              numberRef={toRef}
              tone="after"
            />
          )}
        </div>
      </dl>
      {related && (
        <p className="dr-related">
          {record.supersedes ? "Supersedes" : "Superseded by"}{" "}
          <button
            type="button"
            className="dr-link"
            onClick={(event) => onOpen(related, event.detail === 0)}
          >
            <span className="dr-mono">{related}</span> {recordById(related)?.title}
          </button>
        </p>
      )}
      {record.evidence && (
        <figure className="dr-evidence">
          <Stage evidence={record.evidence} />
          <figcaption>{record.evidence.caption}</figcaption>
        </figure>
      )}
      {(record.caseSlug || record.links?.length) && (
        <p className="dr-outlinks">
          {record.caseSlug && (
            <Link to={`/work/${record.caseSlug}`}>
              Read the case
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          )}
          {record.links?.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRightIcon aria-hidden="true" />
            </a>
          ))}
        </p>
      )}
    </div>
  );
}

/** A 1 px bracket in the log gutter that joins a record to the one it supersedes. */
function SupersedeLine({
  listRef,
  openId,
  animate,
}: {
  listRef: RefObject<HTMLOListElement | null>;
  openId: string;
  animate: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<{ d: string; height: number } | null>(null);
  const open = recordById(openId);
  const pairKey = open ? (pairOf(open)?.join(" ") ?? "") : "";
  const drawn = geometry !== null;

  useLayoutEffect(() => {
    const list = listRef.current;
    const pair = pairKey ? pairKey.split(" ") : null;
    if (!list || !pair) {
      setGeometry(null);
      return;
    }
    const measure = () => {
      const top = list.getBoundingClientRect().top;
      const anchor = (id: string) => {
        const node = list.querySelector<HTMLElement>(`[data-id="${id}"] .dr-row-id`);
        if (!node) return 0;
        const box = node.getBoundingClientRect();
        return Math.round(box.top - top + box.height / 2);
      };
      const [from, to] = pair.map(anchor);
      setGeometry({ d: `M 14 ${from} H 4 V ${to} H 14`, height: list.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, pairKey]);

  useEffect(() => {
    const path = pathRef.current;
    if (!animate || !path) return;
    const animation = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: 380,
      easing: easeInOut,
      fill: "backwards",
    });
    return () => animation.cancel();
  }, [animate, openId, drawn]);

  if (!geometry) return null;
  return (
    <svg className="dr-gutter-line" width="16" height={geometry.height} aria-hidden="true">
      <path ref={pathRef} d={geometry.d} pathLength={1} />
    </svg>
  );
}

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [openId, setOpenId] = useState(initialId);
  const [motionFor, setMotionFor] = useState<string | null>(reduced ? null : openId);
  const listRef = useRef<HTMLOListElement>(null);
  const anchorRef = useRef<{ id: string; top: number } | null>(null);
  const open = recordById(openId) ?? records[0];

  const openRecord = useCallback(
    (id: string, instant: boolean, keepTop?: { top: number }) => {
      if (!wide && id === openId) {
        setOpenId("");
        return;
      }
      if (keepTop) anchorRef.current = { id, top: keepTop.top };
      setOpenId(id);
      setMotionFor(instant || reduced ? null : id);
      window.history.replaceState(null, "", `#${id}`);
    },
    [wide, openId, reduced],
  );

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (!anchor || wide) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-id="${anchor.id}"] .dr-row`);
    if (row) window.scrollBy(0, row.getBoundingClientRect().top - anchor.top);
  }, [openId, wide]);

  const onRowClick = (id: string) => (event: MouseEvent<HTMLButtonElement>) => {
    openRecord(id, event.detail === 0, { top: event.currentTarget.getBoundingClientRect().top });
  };

  const onListKey = (event: KeyboardEvent<HTMLOListElement>) => {
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(".dr-row"),
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const target =
      event.key === "ArrowDown"
        ? buttons[Math.min(index + 1, buttons.length - 1)]
        : event.key === "ArrowUp"
          ? buttons[Math.max(index - 1, 0)]
          : event.key === "Home"
            ? buttons[0]
            : event.key === "End"
              ? buttons[buttons.length - 1]
              : null;
    if (!target) return;
    event.preventDefault();
    target.focus();
  };

  return (
    <main className="dr">
      <title>Decision record — Gentrit Rashiti</title>
      <header className="dr-head">
        <h1 className="dr-lede">
          Gentrit Rashiti builds web and mobile products: five years, two platform rewrites, a design system and
          apps in both stores. <span className="dr-lede-role">Frontend and mobile, full stack since 2026.</span>
        </h1>
        <nav className="dr-contact" aria-label="Contact">
          <a href={links.cv}>CV</a>
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
      </header>

      <div className="dr-grid">
        <section className="dr-log" aria-labelledby="dr-log-title">
          <div className="dr-log-head">
            <h2 id="dr-log-title">Decision log, newest first</h2>
            <span aria-hidden="true">Result</span>
            <span aria-hidden="true">Status</span>
          </div>
          <div className="dr-rows-wrap">
          <ol className="dr-rows" ref={listRef} onKeyDown={onListKey}>
            {records.map((record) => {
              const isOpen = record.id === openId;
              return (
                <li key={record.id} data-id={record.id} data-open={isOpen || undefined}>
                  <button
                    type="button"
                    className="dr-row"
                    aria-expanded={wide ? undefined : isOpen}
                    aria-current={wide && isOpen ? "true" : undefined}
                    aria-controls={wide ? "dr-record" : `dr-record-${record.id}`}
                    onClick={onRowClick(record.id)}
                  >
                    <span className="dr-row-id dr-mono">{record.id}</span>
                    <span className="dr-row-main">
                      <span className="dr-row-title">{record.title}</span>
                      <span className="dr-row-meta">
                        {record.project} · <span className="dr-mono">{record.years}</span>
                        <span className="dr-row-result-inline"> · {record.result}</span>
                      </span>
                    </span>
                    <span className="dr-row-result dr-mono">{record.result}</span>
                    <Status record={record} />
                  </button>
                  {!wide && isOpen && (
                    <section
                      className="dr-record dr-record-inline"
                      id={`dr-record-${record.id}`}
                      aria-labelledby={`dr-title-${record.id}`}
                    >
                      <RecordBody
                        key={record.id}
                        record={record}
                        travel={motionFor === record.id}
                        fade={false}
                        onOpen={(id, instant) => openRecord(id, instant)}
                        headingId={`dr-title-${record.id}`}
                      />
                    </section>
                  )}
                </li>
              );
            })}
          </ol>
          <SupersedeLine listRef={listRef} openId={openId} animate={motionFor === openId} />
          </div>
        </section>

        {wide && (
          <article className="dr-record" id="dr-record" aria-labelledby="dr-title">
            <RecordBody
              key={open.id}
              record={open}
              travel={motionFor === open.id}
              fade={motionFor === open.id}
              onOpen={(id, instant) => openRecord(id, instant)}
              headingId="dr-title"
            />
          </article>
        )}
      </div>

      <footer className="dr-foot">
        <p>
          The Vianova care and design-system screens on this page are real product screens with invented data. Other
          screens come from public pages and store listings.
        </p>
        <p>
          Bachelor's degree, UBT. Based in Kosovo, working remotely.
        </p>
        <p>
          <a href={`mailto:${links.email}`}>{links.email}</a>
        </p>
        <p>
          <Link to="/">
            All projects
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </p>
      </footer>
    </main>
  );
}
