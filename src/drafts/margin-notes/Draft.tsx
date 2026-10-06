import { useSyncExternalStore } from "react";
import { links } from "../../content/links";
import { contact, identity, plates } from "./plates";
import { PlateView } from "./Plate";
import "./margin-notes.css";

const WIDE = "(min-width: 1024px)";

function useWide() {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(WIDE);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

export default function Draft() {
  const wide = useWide();
  return (
    <div className="mn">
      <title>Gentrit Rashiti — work with margin notes</title>
      <header className="mn-mast">
        <div className="mn-who">
          <p>
            <strong>{identity.name}</strong> {identity.line}
          </p>
          <p className="mn-level">
            {identity.level.map((item, index) => (
              <span key={item}>
                {index > 0 && <span aria-hidden="true"> · </span>}
                {item}
              </span>
            ))}
          </p>
        </div>
        <nav aria-label="Contact" className="mn-contact">
          {contact.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {plates.map((plate, index) => (
          <PlateView key={plate.id} plate={plate} index={index} wide={wide} />
        ))}
      </main>

      <footer className="mn-foot">
        <p>
          <strong>{identity.name}</strong>. Frontend and mobile developer, full
          stack since 2026. Bachelor's degree, UBT. Based in Kosovo, working
          remotely.
        </p>
        <p className="mn-foot-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            {links.githubLabel}
          </a>
        </p>
        <p className="mn-foot-note">
          The Vianova care and design-system screens are real product screens
          with invented data. Bayyinah TV and Read to Feed are recreations with
          invented data; the others come from public store and web pages.
        </p>
      </footer>
    </div>
  );
}
