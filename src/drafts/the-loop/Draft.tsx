import { useEffect } from "react";
import { useLocation } from "react-router";
import { BayyinahCase } from "./BayyinahCase";
import { CareCase } from "./CareCase";
import { DsCase } from "./DsCase";
import { Home } from "./Home";
import { Workflow } from "./Workflow";
import "./the-loop.css";
import "./home.css";

const pages = {
  "care-platform": CareCase,
  "design-system": DsCase,
  "bayyinah-tv": BayyinahCase,
  workflow: Workflow,
};

export default function Draft() {
  const { pathname } = useLocation();
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.backgroundColor;
    html.style.backgroundColor = "#0b0c0f";
    return () => {
      html.style.backgroundColor = before;
    };
  }, []);
  const slug = /\/(care-platform|design-system|bayyinah-tv|workflow)\/?$/.exec(pathname)?.[1];
  const Page = slug ? pages[slug as keyof typeof pages] : undefined;
  return (
    <div className="lp" data-view={Page ? "case" : "home"}>
      <meta name="theme-color" content="#0b0c0f" />
      {Page ? <Page key={slug} /> : <Home key="home" />}
    </div>
  );
}
