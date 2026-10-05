import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { flushSync, preload } from "react-dom";
import { links } from "../../content/links";
import { dirOf, langs, names, otherNames, page, rows, type Lang, type Row } from "./copy";
import literata from "./fonts/Literata-Latin-400-600.woff2";
import amiri from "./fonts/Amiri-Regular-Arabic.woff2";
import amiriBold from "./fonts/Amiri-Bold-Arabic.woff2";
import "./four-languages.css";

const faces = [literata, amiri, amiriBold];
const leadShot = "/showcase/bayyinah/web-03.webp";

const vt = (name: string): CSSProperties => ({ viewTransitionName: name });

function readLang(): Lang {
  const value = new URLSearchParams(window.location.search).get("lang");
  return value === "sq" || value === "ar" ? value : "en";
}

function hrefFor(lang: Lang) {
  return lang === "en" ? "?" : `?lang=${lang}`;
}

type Fonts = "wait" | "ready" | "fallback";

/**
 * The page waits at most 300 ms for its faces. If they are late, the page
 * keeps the fallback stack for the whole visit, so a late face never moves text.
 */
function useFonts() {
  const [fonts, setFonts] = useState<Fonts>("wait");
  useEffect(() => {
    const timer = window.setTimeout(() => setFonts((s) => (s === "wait" ? "fallback" : s)), 300);
    Promise.all([
      document.fonts.load('500 64px "FL Serif"', "Ag عرب"),
      document.fonts.load('400 17px "FL Serif"', "Ag عرب"),
    ]).then(
      () => setFonts((s) => (s === "wait" ? "ready" : s)),
      () => setFonts((s) => (s === "wait" ? "fallback" : s)),
    );
    return () => window.clearTimeout(timer);
  }, []);
  return fonts;
}

/** The block the reader is on stays at the same height when the language changes. */
function readingAnchor() {
  const top = document.querySelector(".fl-top")?.getBoundingClientRect().bottom ?? 0;
  return [...document.querySelectorAll<HTMLElement>("[data-anchor]")].find((el) => el.getBoundingClientRect().bottom > top) ?? null;
}

function useLang() {
  const [lang, setLang] = useState<Lang>(readLang);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const before = { lang: root.lang, dir: root.dir, scroll: root.style.scrollBehavior, ground: root.style.backgroundColor };
    root.style.scrollBehavior = "auto";
    root.style.backgroundColor = "#1a2466";
    return () => {
      root.lang = before.lang;
      root.dir = before.dir;
      root.style.scrollBehavior = before.scroll;
      root.style.backgroundColor = before.ground;
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dirOf(lang);
    document.title = page[lang].title;
  }, [lang]);

  const change = (next: Lang) => {
    if (next === lang) return;
    const url = new URL(window.location.href);
    if (next === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", next);
    window.history.replaceState(window.history.state, "", url);
    const anchor = window.scrollY > 0 ? readingAnchor() : null;
    const before = anchor?.getBoundingClientRect().top ?? 0;
    const apply = () => {
      flushSync(() => setLang(next));
      if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || !document.startViewTransition) apply();
    else document.startViewTransition(apply);
  };

  return [lang, change] as const;
}

function Arrow({ out }: { out?: boolean }) {
  return (
    <svg className="fl-arrow" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
      {out ? (
        <path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" stroke="currentColor" strokeWidth="1.4" />
      ) : (
        <path d="M1.5 7h11M8 2.5 12.5 7 8 11.5" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  );
}

function Shipped({ row, lang, index }: { row: Row; lang: Lang; index: number }) {
  return (
    <ul className="fl-row-langs" aria-label={page[lang].langsLabel} style={vt(`fl-r${index}-langs`)}>
      {row.shipped ? (
        row.shipped.map((code) => (
          <li key={code}>
            <bdi lang={code}>{names[code as Lang] ?? otherNames[code]}</bdi>
          </li>
        ))
      ) : (
        <li>{row.count?.[lang]}</li>
      )}
    </ul>
  );
}

export default function Draft() {
  for (const href of faces) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(leadShot, { as: "image", fetchPriority: "high" });

  const fonts = useFonts();
  const [lang, change] = useLang();
  const t = page[lang];
  const others = langs.filter((l) => l !== lang);

  if (fonts === "wait") return <div className="fl" lang={lang} dir={dirOf(lang)} />;

  return (
    <div className="fl" lang={lang} dir={dirOf(lang)} data-fonts={fonts}>
      <header className="fl-top" style={vt("fl-top")}>
        <a className="fl-mark" href="#fl-main" aria-label={t.top} lang="en" dir="ltr" style={vt("fl-mark")}>
          Gentrit Rashiti
        </a>
        <nav className="fl-langs" aria-label={t.navLabel}>
          {langs.map((l) => (
            <a
              key={l}
              href={hrefFor(l)}
              hrefLang={l}
              lang={l}
              dir={dirOf(l)}
              aria-current={l === lang ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                change(l);
              }}
              style={vt(`fl-nav-${l}`)}
            >
              {names[l]}
              {l === lang && <span className="fl-langs-mark" aria-hidden="true" style={vt("fl-nav-mark")} />}
            </a>
          ))}
        </nav>
        <div className="fl-out">
          <a href={links.cv} download style={vt("fl-cv")}>
            {t.cv}
          </a>
          <a href={`mailto:${links.email}`} style={vt("fl-email")}>
            {t.email}
          </a>
        </div>
      </header>

      <main id="fl-main">
        <section className="fl-hero" aria-labelledby="fl-line" data-anchor>
          <h1 id="fl-line" className="fl-line" style={vt(`fl-line-${lang}`)}>
            {t.line}
          </h1>
          <div className="fl-side">
            <p className="fl-readin" id="fl-readin" style={vt("fl-readin")}>
              {t.readIn}
            </p>
            <ul className="fl-alts" aria-labelledby="fl-readin">
              {others.map((l) => (
                <li key={l}>
                  <button type="button" lang={l} dir={dirOf(l)} onClick={() => change(l)}>
                    <span className="fl-alt-name" style={vt(`fl-name-${l}`)}>
                      {names[l]}
                    </span>
                    <span className="fl-alt-line" style={vt(`fl-line-${l}`)}>
                      {page[l].line}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="fl-sub" style={vt("fl-sub")}>
              {t.sub}
            </p>
          </div>
          <figure className="fl-shots">
            <div className="fl-pair">
              <img
                className="fl-web"
                src={leadShot}
                width={1440}
                height={900}
                alt={t.altWeb}
                fetchPriority="high"
                decoding="async"
                style={vt("fl-shot-web")}
              />
              <img
                className="fl-phone"
                src="/showcase/bayyinah/store-04.webp"
                width={778}
                height={1690}
                alt={t.altPhone}
                decoding="async"
                style={vt("fl-shot-phone")}
              />
            </div>
            <figcaption style={vt("fl-cap-hero")}>
              <span>{t.heroCaption}</span> <span className="fl-note">{t.heroNote}</span>
            </figcaption>
          </figure>
        </section>

        <section className="fl-rows" aria-labelledby="fl-rows-h">
          <h2 id="fl-rows-h" data-anchor style={vt("fl-rows-h")}>
            {t.rowsTitle}
          </h2>
          <ol>
            {rows.map((row, i) => (
              <li className="fl-row" key={row.id} data-anchor>
                <div className="fl-row-what" style={vt(`fl-r${i}-what`)}>
                  <h3 lang={row.name.en === row.name[lang] ? "en" : undefined}>{row.name[lang]}</h3>
                  <p>{row.kind[lang]}</p>
                </div>
                <p className="fl-row-result" style={vt(`fl-r${i}-result`)}>
                  {row.result[lang]}
                </p>
                <Shipped row={row} lang={lang} index={i} />
                <div className="fl-row-meta" style={vt(`fl-r${i}-meta`)}>
                  <p>{row.role[lang]}</p>
                  <p className="fl-years">{row.years[lang]}</p>
                  {row.links.length ? (
                    <p className="fl-links">
                      {row.links.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                          <bdi lang="en">{link.label}</bdi>
                          {link.archived && <> ({t.archived})</>}
                          <Arrow out />
                        </a>
                      ))}
                    </p>
                  ) : (
                    <p className="fl-nolink">{t.noLink}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="fl-alb" aria-labelledby="fl-alb-h" data-anchor>
          <div className="fl-alb-text" style={vt("fl-alb-text")}>
            <h2 id="fl-alb-h">{t.albTitle}</h2>
            <p>{t.albLine}</p>
          </div>
          <div className="fl-alb-pair">
            <figure className="fl-fig-web">
              <img
                src="/personal/shots/fjale-desktop.webp"
                width={1440}
                height={900}
                alt={t.fjaleAlt}
                loading="lazy"
                decoding="async"
                style={vt("fl-fjale")}
              />
              <figcaption style={vt("fl-fjale-cap")}>
                {t.fjaleCaption}{" "}
                <a href="https://xn--fjal-opa.com/" target="_blank" rel="noreferrer">
                  <bdi lang="sq">fjalë.com</bdi>
                  <Arrow out />
                </a>
              </figcaption>
            </figure>
            <figure className="fl-fig-phone">
              <img
                src="/mobile/grocery-1.webp"
                width={780}
                height={1689}
                alt={t.vivaAlt}
                loading="lazy"
                decoding="async"
                style={vt("fl-viva")}
              />
              <figcaption style={vt("fl-viva-cap")}>{t.vivaCaption}</figcaption>
            </figure>
          </div>
        </section>
        <section className="fl-own" aria-labelledby="fl-own-h" data-anchor>
          <div className="fl-own-text" style={vt("fl-own-text")}>
            <h2 id="fl-own-h">{t.ownTitle}</h2>
            <p>{t.ownLine}</p>
          </div>
          <figure className="fl-own-offday">
            <img
              src="/personal/shots/offday-light-calendar-desktop.webp"
              width={2880}
              height={1800}
              alt={t.offdayAlt}
              loading="lazy"
              decoding="async"
              style={vt("fl-offday")}
            />
            <figcaption style={vt("fl-offday-cap")}>
              <h3 lang="en">Offday</h3>
              <p>{t.offdayKind}</p>
              <p className="fl-own-result">{t.offdayResult}</p>
              <p className="fl-own-note">{t.offdayNote}</p>
            </figcaption>
          </figure>
          <figure className="fl-own-concept">
            <div className="fl-crop" style={vt("fl-offbeat")}>
              <img
                src="/personal/shots/offbeat-studio-desktop.webp"
                width={2880}
                height={1800}
                alt={t.offbeatAlt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption style={vt("fl-offbeat-cap")}>
              <h3 lang="en">OFFBEAT</h3>
              <p className="fl-own-note">{t.concept}</p>
              <p>{t.offbeatKind}</p>
              <a href="https://github.com/gentritr1/offbeat" target="_blank" rel="noreferrer">
                <bdi lang="en">GitHub</bdi>
                <Arrow out />
              </a>
            </figcaption>
          </figure>
          <figure className="fl-own-concept">
            <img
              src="/personal/shots/form-home-desktop.webp"
              width={2880}
              height={1800}
              alt={t.formAlt}
              loading="lazy"
              decoding="async"
              style={vt("fl-form")}
            />
            <figcaption style={vt("fl-form-cap")}>
              <h3 lang="en">FORM</h3>
              <p className="fl-own-note">{t.concept}</p>
              <p>{t.formKind}</p>
              <a href="https://github.com/gentritr1/form" target="_blank" rel="noreferrer">
                <bdi lang="en">GitHub</bdi>
                <Arrow out />
              </a>
            </figcaption>
          </figure>
        </section>
      </main>

      <footer className="fl-foot" data-anchor>
        <h2 style={vt("fl-foot-h")}>{t.contact}</h2>
        <ul style={vt("fl-foot-links")}>
          <li>
            <a href={`mailto:${links.email}`}>
              <bdi lang="en">{links.email}</bdi>
            </a>
          </li>
          <li>
            <a href={links.github} target="_blank" rel="noreferrer">
              <bdi lang="en">GitHub</bdi>
              <Arrow out />
            </a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              <bdi lang="en">LinkedIn</bdi>
              <Arrow out />
            </a>
          </li>
          <li>
            <a href={links.cv} download>
              {t.cv}
              <Arrow />
            </a>
          </li>
        </ul>
        <p style={vt("fl-foot-line")}>{t.footLine}</p>
      </footer>
    </div>
  );
}
