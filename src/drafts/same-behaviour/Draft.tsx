import { Link } from "react-router";
import { CropShot } from "../../components/CropShot";
import { careShots } from "../../content/careShots";
import { links } from "../../content/links";
import { areas, facts, work } from "./data";
import "./same-behaviour.css";

const screen = careShots.glucoseChart;

export default function Draft() {
  return (
    <div className="sb">
      <title>Gentrit Rashiti — same behaviour</title>
      <section className="sb-stage" aria-labelledby="sb-who">
        <header className="sb-head">
          <h1 id="sb-who" className="sb-who">
            Gentrit Rashiti, web and mobile developer for 5+ years, is moving a
            live care platform from Vue to React, one route at a time.
          </h1>
          <nav className="sb-top" aria-label="Contact">
            <a href={links.cv}>Download CV</a>
            <a href={`mailto:${links.email}`}>Email</a>
          </nav>
        </header>

        <figure className="sb-screen" style={{ maxWidth: screen.crop.w }}>
          <figcaption className="sb-label">
            <span>React · 2026</span>
            <span>Real product screens · invented data</span>
          </figcaption>
          <CropShot shot={screen} className="sb-plate" eager />
        </figure>

        <p className="sb-rule">
          A route moves to React only after its test passes on both apps.
        </p>
      </section>

      <section className="sb-case" aria-labelledby="sb-care">
        <div className="sb-case-text">
          <h2 id="sb-care">Care-management platform</h2>
          <p className="sb-mono">
            Frontend and mobile, full stack since 2026 · 2023–26
          </p>
          <ul className="sb-facts">
            {facts.map((f) => (
              <li key={f.text}>
                {f.text}
                {f.result ? (
                  <>
                    {" "}
                    <span className="sb-arrow">→</span>{" "}
                    <strong>{f.result}</strong>
                  </>
                ) : null}
                .
              </li>
            ))}
          </ul>
          <Link className="sb-link" to="/work/care-platform">
            Open the case <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="sb-areas">
          <p>Built on Vue from 2023, moving to React in 2026</p>
          <ul>
            {areas.map((a) => (
              <li key={a}>
                <span>{a}</span>
                {a === "Labs and vitals" ? (
                  <span className="sb-here">the screen above</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sb-work" aria-labelledby="sb-other">
        <h2 id="sb-other">Other work</h2>
        <ul>
          {work.map((p) => (
            <li key={p.slug}>
              <Link className="sb-row" to={`/work/${p.slug}`}>
                <img
                  src={p.shot.src}
                  alt={p.shot.alt}
                  width={p.shot.w}
                  height={p.shot.h}
                  loading="lazy"
                  decoding="async"
                />
                <span className="sb-row-text">
                  <strong>{p.name}</strong>
                  <span>{p.line}</span>
                </span>
                <span className="sb-row-meta">
                  {p.role} · {p.years}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="sb-foot">
        <p>
          <strong>Gentrit Rashiti</strong> · Kosovo, working remotely ·
          Bachelor's degree, UBT
        </p>
        <nav aria-label="Links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
        <p className="sb-note">
          The care screen is a real product screen with invented data.
        </p>
      </footer>
    </div>
  );
}
