import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { projects } from "../../../content/projects";
import { Receipt } from "../../aisle/Receipt";
import { receiptText, type ReceiptItem } from "../../aisle/receiptText";
import type { LabMoveProps } from "../types";
import "./16-receipt.css";

const choices: ReceiptItem[] = [
  {
    project: projects.find((item) => item.slug === "bayyinah-tv")!,
    fact: { value: "34", label: "routes · English / Arabic" },
  },
  {
    project: projects.find((item) => item.slug === "read-to-feed")!,
    fact: { value: "0.63 → 0.81", label: "React Native" },
  },
  {
    project: projects.find((item) => item.slug === "fjale")!,
    fact: { value: "21k", label: "Albanian words" },
  },
];

export default function ReceiptMove({ active, reduced }: LabMoveProps) {
  const [selected, setSelected] = useState(["bayyinah-tv", "read-to-feed"]);
  const [date] = useState(() => new Date());
  const [printing, setPrinting] = useState(false);
  const [status, setStatus] = useState(
    "Choose the work to put on your receipt.",
  );
  const cleanupPrint = useRef<(() => void) | null>(null);
  const mounted = useRef(true);
  const downloads = useRef(new Map<string, number>());
  const printFrame = useRef(0);
  const items = choices.filter((item) => selected.includes(item.project.slug));
  useEffect(() => {
    mounted.current = true;
    const pendingDownloads = downloads.current;
    return () => {
      mounted.current = false;
      cancelAnimationFrame(printFrame.current);
      cleanupPrint.current?.();
      pendingDownloads.forEach((timer, url) => {
        window.clearTimeout(timer);
        URL.revokeObjectURL(url);
      });
      pendingDownloads.clear();
    };
  }, []);

  function toggle(slug: string) {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug],
    );
    setStatus("Receipt updated with your selected work.");
  }

  async function print() {
    if (!items.length || printing) return;
    setPrinting(true);
    setStatus("Preparing the 80 mm receipt…");
    await document.fonts.ready;
    if (!mounted.current) return;
    const previous = document.body.dataset.lm16Print;
    const finish = () => {
      window.removeEventListener("afterprint", finish);
      if (previous === undefined) delete document.body.dataset.lm16Print;
      else document.body.dataset.lm16Print = previous;
      cleanupPrint.current = null;
      if (mounted.current) {
        setPrinting(false);
        setStatus("Print dialog closed. Your selection is kept.");
      }
    };
    cleanupPrint.current = finish;
    window.addEventListener("afterprint", finish);
    document.body.dataset.lm16Print = "true";
    flushSync(() => setPrinting(true));
    printFrame.current = requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        finish();
        setStatus(
          "Print dialog unavailable. Download the text receipt instead.",
        );
      }
    });
  }

  function download() {
    if (!items.length) return;
    const url = URL.createObjectURL(
      new Blob([receiptText(items, date)], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Gentrit-Rashiti-selected-work.txt";
    anchor.click();
    downloads.current.set(
      url,
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        downloads.current.delete(url);
      }, 1000),
    );
    setStatus("Text receipt download requested.");
  }

  return (
    <div className="lm16" data-reduced={reduced || !active}>
      <fieldset disabled={printing}>
        <legend>Your selected-work receipt</legend>
        {choices.map((item) => (
          <label key={item.project.slug}>
            <input
              type="checkbox"
              checked={selected.includes(item.project.slug)}
              onChange={() => toggle(item.project.slug)}
            />
            {item.project.name}
          </label>
        ))}
      </fieldset>
      <div className="lm16-paper">
        <Receipt
          id="lm16-receipt"
          items={items}
          date={date}
          reduced={reduced || !active}
          remove={toggle}
          emptyHint="Choose a project above. Its facts, links and technology will go on your receipt."
        />
      </div>
      <div className="lm16-actions">
        <button
          type="button"
          disabled={!items.length || printing}
          onClick={() => void print()}
        >
          {printing ? "Print dialog open" : "Print / save PDF"}
        </button>
        <button type="button" disabled={!items.length} onClick={download}>
          Download text
        </button>
      </div>
      <p className="lm16-status" role="status">
        {status}
      </p>
      <p className="lm16-note">
        80 mm paper width. Long receipts can use multiple pages.
      </p>
      {printing &&
        createPortal(
          <div className="lm16-print-host">
            <Receipt
              id="lm16-print-receipt"
              items={items}
              date={date}
              reduced
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
