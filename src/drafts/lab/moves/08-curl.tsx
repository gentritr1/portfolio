import { useEffect, useRef, useState } from "react";
import { createPageCurl, type PageCurl } from "../../facing-pages/curl";
import type { LabMoveProps } from "../types";
import "./08-curl.css";

const pages = [
  {
    title: "Read to Feed",
    category: "READING",
    lines: [
      "An EPUB reader.",
      "React Native 0.63 → 0.81.",
      "Reading, carried forward.",
    ],
    colour: "#173a33",
  },
  {
    title: "Bayyinah TV",
    category: "STREAMING",
    lines: [
      "34 routes. English and Arabic.",
      "HLS playback and live chat.",
      "One reading direction at a time.",
    ],
    colour: "#a84025",
  },
];

/** Two locally drawn pages; no DOM capture and no external page images. */
function pageTexture(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 432;
  const ctx = canvas.getContext("2d")!;
  const page = pages[index];
  ctx.fillStyle = "#fbf3dc";
  ctx.fillRect(0, 0, 720, 432);
  ctx.fillStyle = page.colour;
  ctx.fillRect(0, 0, 14, 432);
  ctx.font = "16px Arial";
  ctx.fillText(`${page.category} / 0${index + 1}`, 40, 40);
  ctx.font = "bold 51px Georgia";
  ctx.fillText(page.title, 40, 118);
  ctx.fillRect(40, 147, 640, 2);
  ctx.font = "25px Georgia";
  page.lines.forEach((line, row) => ctx.fillText(line, 40, 210 + row * 48));
  ctx.font = "14px Arial";
  ctx.fillText("GENTRIT · PROJECT NOTES", 40, 395);
  return canvas;
}

function PrintedPage({ index }: { index: number }) {
  const page = pages[index];
  return (
    <div className="lm08-print" style={{ color: page.colour }}>
      <small>
        {page.category} / 0{index + 1}
      </small>
      <h3>{page.title}</h3>
      <div>
        {page.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <small>GENTRIT · PROJECT NOTES</small>
    </div>
  );
}

export default function CurlMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const curl = useRef<PageCurl | null>(null);
  const textures = useRef<HTMLCanvasElement[]>([]);
  const animation = useRef<Animation | null>(null);
  const page = useRef(0);
  const destination = useRef(1);
  const moving = useRef(false);
  const forward = useRef(true);
  const [selected, setSelected] = useState(0);
  const [turning, setTurning] = useState(false);
  const [engine, setEngine] = useState("css");
  const [status, setStatus] = useState(
    "Turn the page. Press again to reverse.",
  );
  useEffect(() => {
    if (!active || !host.current) return;
    textures.current = [pageTexture(0), pageTexture(1)];
    curl.current = reduced ? null : createPageCurl(host.current);
    setEngine(curl.current ? "curl" : "css");
    setTurning(false);
    const visibility = () => {
      if (!animation.current) return;
      if (document.hidden) animation.current.pause();
      else animation.current.play();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      moving.current = false;
      animation.current?.cancel();
      animation.current = null;
      curl.current?.dispose();
      curl.current = null;
      textures.current = [];
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, reduced]);
  function finish(completed: boolean) {
    if (completed) {
      page.current = destination.current;
      setSelected(page.current);
    }
    moving.current = false;
    setTurning(false);
    animation.current?.cancel();
    animation.current = null;
    setStatus(
      completed
        ? `${pages[page.current].title} open ✓`
        : "Turn reversed · original page restored.",
    );
  }
  function fallback() {
    if (!leaf.current) {
      finish(true);
      return;
    }
    const value = leaf.current.animate(
      [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }],
      { duration: 500, easing: "cubic-bezier(.32,.72,0,1)", fill: "both" },
    );
    animation.current = value;
    value.onfinish = () => finish(value.playbackRate > 0);
  }
  function turn() {
    if (!active) return;
    if (moving.current) {
      forward.current = !forward.current;
      if (curl.current) curl.current.reverse();
      else animation.current?.reverse();
      setStatus(
        forward.current
          ? "Turning forward…"
          : "Reversing from the current bend…",
      );
      return;
    }
    destination.current = 1 - page.current;
    if (reduced) {
      finish(true);
      return;
    }
    moving.current = true;
    forward.current = true;
    setTurning(true);
    setStatus("Turning… press again to reverse.");
    if (curl.current) {
      try {
        curl.current.start(
          textures.current[page.current],
          textures.current[destination.current],
          1,
          finish,
        );
      } catch {
        curl.current.dispose();
        curl.current = null;
        setEngine("css");
        fallback();
      }
    } else fallback();
  }
  return (
    <div
      className="lm08"
      data-engine={engine}
      data-turning={turning}
      data-reduced={reduced}
    >
      <div
        className="lm08-book"
        aria-label={`${pages[selected].title} project notes`}
      >
        <div className="lm08-under" aria-hidden="true">
          <PrintedPage index={1 - selected} />
        </div>
        <div className="lm08-leaf" ref={leaf}>
          <div className="lm08-front">
            <PrintedPage index={selected} />
          </div>
          <div className="lm08-back" aria-hidden="true">
            <PrintedPage index={1 - selected} />
          </div>
        </div>
        <div ref={host} className="lm08-canvas" aria-hidden="true" />
      </div>
      <button onClick={turn} disabled={!active}>
        {turning ? "Reverse the turn" : "Turn page →"}
      </button>
      <output aria-live="polite">{status}</output>
    </div>
  );
}
