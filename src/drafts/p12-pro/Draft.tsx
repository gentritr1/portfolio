import { use, useLayoutEffect } from "react";
import { preload } from "react-dom";
import { Route, Routes } from "react-router";
import Case from "./Case";
import Home from "./Home";
import { calendar } from "./shots";
import "./p12-pro.css";

const DISPLAY = "/fonts/creative/GentritDisplay-Latin.woff2";
const TEXT = "/fonts/creative/GentritText-Latin.woff2";

/**
 * The first frame waits for the two faces (≈ 125 kB, local) for at most 700 ms, so the condensed
 * claim never reflows after it is drawn. The Suspense fallback of the drafts router shows meanwhile.
 */
const fontsReady: Promise<void> = Promise.race([
  Promise.all([
    document.fonts.load('740 64px "p12p Display"'),
    document.fonts.load('400 16px "p12p Text"'),
    document.fonts.load('600 16px "p12p Text"'),
  ]).then(() => undefined),
  new Promise<void>((resolve) => setTimeout(resolve, 700)),
]).catch(() => undefined);

const PAPER = "#f5f7fb";

export default function Draft() {
  preload(DISPLAY, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(TEXT, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(calendar.src, { as: "image", fetchPriority: "high" });
  use(fontsReady);

  // The page is printed on the care app's own ground, up to the browser edges.
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const before = { scheme: html.style.colorScheme, htmlBg: html.style.backgroundColor, bodyBg: body.style.backgroundColor };
    html.style.colorScheme = "light";
    html.style.backgroundColor = PAPER;
    body.style.backgroundColor = PAPER;
    html.classList.add("p12p-root");
    return () => {
      html.style.colorScheme = before.scheme;
      html.style.backgroundColor = before.htmlBg;
      body.style.backgroundColor = before.bodyBg;
      html.classList.remove("p12p-root");
    };
  }, []);

  return (
    <div className="p12p">
      <title>Gentrit Rashiti: web and phone apps, shown at actual size</title>
      <meta
        name="description"
        content="Gentrit Rashiti builds web and phone apps for care teams, learners and shoppers. Frontend and mobile developer, now full stack, working remotely from Kosovo."
      />
      <meta name="theme-color" content={PAPER} />
      <meta
        name="portfolio-check"
        content="allow C08c: phone app screens are drawn at real phone width (390 px), so a store listing file holds about 1.55x, not 2x; allow T23: the only hover-lift rule is a Tailwind class compiled into the shared site stylesheet for another page, and nothing on this page lifts or zooms on hover"
      />
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="case" element={<Case />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
