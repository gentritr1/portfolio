import { AnimatePresence, motion } from "motion/react";
import { links } from "../../content/links";
import type { ReceiptItem } from "./receiptText";
import { dur, ease, spring } from "./motion";

function Arrow() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 12h15M12 5l7 7-7 7" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m7 9 5-7 5 7M2 9h20l-3 12H5L2 9Zm6 4 1 5m7-5-1 5m-3-5v5" />
    </svg>
  );
}

export function Receipt({
  items,
  date,
  reduced,
  remove,
  inspect,
  id = "as-receipt",
  emptyHint,
}: {
  items: ReceiptItem[];
  date: Date;
  reduced: boolean;
  remove?: (slug: string) => void;
  inspect?: (slug: string) => void;
  id?: string;
  emptyHint?: string;
}) {
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Belgrade",
    dateStyle: "medium",
  }).format(date);
  return (
    <article
      className="as-receipt"
      id={id}
      aria-label="Printable selected-work CV"
    >
      <header>
        <h2>GENTRIT RASHITI</h2>
        <p>
          WEB · MOBILE · FULL STACK
          <br />
          Kosovo · Working remotely
        </p>
        <p className="as-receipt-purpose">SELECTED WORK</p>
        <time dateTime={date.toISOString()}>{dateLabel}</time>
      </header>
      <ol className="as-receipt-items">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.li
              layout
              key={item.project.slug}
              initial={{
                opacity: 0,
                y: 8,
                filter: "blur(4px)",
                clipPath: "inset(0 0 100% 0)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                clipPath: "inset(0 0 0% 0)",
              }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={
                reduced
                  ? { duration: 0.01 }
                  : {
                      duration: dur.ui,
                      ease: ease.out,
                      clipPath: { duration: dur.story, ease: ease.story },
                      layout: spring.ui,
                    }
              }
            >
              <div className="as-feed-content">
                <div className="as-receipt-item-title">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.project.name}</h3>
                  {remove && (
                    <button
                      className="as-screen-only"
                      type="button"
                      aria-label={
                        "Remove " + item.project.name + " from basket"
                      }
                      onClick={() => remove(item.project.slug)}
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path d="m5 5 10 10M5 15 15 5" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="as-receipt-years">
                  {item.project.years ?? "Independent work"} /{" "}
                  {item.project.role}
                </p>
                <p className="as-receipt-fact">
                  {item.fact.value} {item.fact.label}
                </p>
                <p>{item.project.line}</p>
                <p className="as-receipt-stack">
                  {item.project.stack.slice(0, 5).join(" / ")}
                </p>
                {item.project.links[0] && (
                  <a
                    className="as-receipt-url"
                    href={item.project.links[0].href}
                  >
                    {item.project.links[0].href}
                  </a>
                )}
                {inspect && (
                  <button
                    type="button"
                    className="as-receipt-inspect as-screen-only"
                    onClick={() => inspect(item.project.slug)}
                  >
                    Read the label <Arrow />
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {!items.length && (
        <div className="as-receipt-empty">
          <BasketIcon />
          <h3>Nothing scanned. Yet.</h3>
          {emptyHint ? (
            <p>{emptyHint}</p>
          ) : (
            <>
              <p>
                Pick a box from the shelves.
                <br />
                Its work goes on this receipt.
              </p>
              <p>
                Scan a few.
                <br />
                Print your shortlist.
              </p>
            </>
          )}
        </div>
      )}
      <dl className="as-receipt-total">
        <dt>TOTAL</dt>
        <dd>
          {String(items.length).padStart(2, "0")} PROJECT
          {items.length === 1 ? "" : "S"}
        </dd>
      </dl>
      <footer>
        <p>5+ years, from first screen to release.</p>
        <p>
          React · React Native · Vue · Nuxt
          <br />
          Laravel · FastAPI
        </p>
        <a href={"mailto:" + links.email}>{links.email}</a>
        <a href={links.github}>{links.githubLabel}</a>
        <p>THANK YOU FOR LOOKING.</p>
      </footer>
    </article>
  );
}
