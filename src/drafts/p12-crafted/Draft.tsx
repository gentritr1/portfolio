import { Fragment, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useReducedMotion } from "motion/react";
import { links } from "../../content/links";
import { REAL_SCREENS } from "../../content/careShots";
import { FaceSwitch, LensSwitch, Print, useFace, useTilt, whenIdle, type PrintSpec, type Tilt, type TileSpec } from "./Print";
import "./draft.css";

/* ---------- Screens (file pixels, from design/portfolio-skill/loop-12/ASSETS.md) ---------- */

const WEB: readonly [number, number] = [2880, 1800];
const STORE: readonly [number, number] = [778, 1690];
const LISTING: readonly [number, number] = [780, 1689];

const bayyinahWeb = (s: TileSpec["s"]): TileSpec => ({
  src: "/showcase/bayyinah/web-01.webp",
  nat: WEB,
  s,
  alt: "bayyinahtv.com, the Bayyinah TV landing page: the heading Quran Studies Made Simple, a free-trial button, and the app on a laptop, a monitor, a tablet and a phone.",
});

const storeFrames = [
  ["/showcase/bayyinah/store-01.webp", "Bayyinah TV App Store frame: Quran Studies Made Simple, with the app's home screen on an iPhone."],
  ["/showcase/bayyinah/store-02.webp", "Bayyinah TV App Store frame: Study the Quran Surah by Surah, with the surah list and the video player."],
  ["/showcase/bayyinah/store-03.webp", "Bayyinah TV App Store frame: Study the Quran Subject by Subject, with subject courses in the app."],
  ["/showcase/bayyinah/store-05.webp", "Bayyinah TV App Store frame: Pick Up Anytime, with the My Learning progress screen."],
] as const;

/*
 * The site's own marketing band (learner counts, testimonials) starts at y 1390 of web-01.
 * Every crop of the first screen stops above it, so no product number reads as Gentrit's.
 */
const BAYYINAH: PrintSpec = {
  id: "bayyinah",
  work: "Bayyinah TV",
  wide: {
    aspect: 2880 / 1350,
    faces: [
      { ground: "#1f1518", tiles: [bayyinahWeb([0, 0, 2880, 1350])] },
      {
        ground: "#1f1518",
        // Four frames side by side, as the store shows them; the phones' lower edge is cut.
        tiles: storeFrames.map(([src, alt], k) => ({ src, alt, nat: STORE, s: [0, 0, 778, (778 * 4 * 1350) / 2880], d: [k / 4, 0, 1 / 4, 1] })),
      },
    ],
  },
  narrow: {
    // Both faces cropped to the same words: Quran Studies Made Simple, on the web and in the app.
    aspect: 1.4,
    faces: [
      { ground: "#1f1518", tiles: [bayyinahWeb([40, 380, 1240, 1240 / 1.4])] },
      { ground: "#1f1518", tiles: [{ src: storeFrames[0][0], alt: storeFrames[0][1], nat: STORE, s: [0, 110, 778, 778 / 1.4] }] },
    ],
  },
};

const careOverview = (s: TileSpec["s"]): TileSpec => ({
  src: "/showcase/care-dashboard/overview.webp",
  nat: WEB,
  s,
  alt: "Care team dashboard: 24 patients by program, and engagement by calls and text messages. Invented data.",
});
const careGlucose = (s: TileSpec["s"]): TileSpec => ({
  src: "/showcase/care-dashboard/rpm-overview-cgm.webp",
  nat: WEB,
  s,
  alt: "One patient's glucose: time in range, average, highest and lowest values, and one day's glucose curve. Invented data.",
});

const CARE: PrintSpec = {
  id: "care",
  work: "Care-management platform",
  wide: {
    aspect: 1.6,
    faces: [
      { ground: "#f5f7fb", tiles: [careOverview([480, 120, 2400, 1500])] },
      { ground: "#f5f7fb", tiles: [careGlucose([480, 120, 2400, 1500])] },
    ],
  },
  narrow: {
    aspect: 876 / 530,
    faces: [
      { ground: "#f5f7fb", tiles: [careOverview([524, 430, 876, 530])] },
      { ground: "#f5f7fb", tiles: [careGlucose([524, 150, 876, 530])] },
    ],
  },
};

const listing = (src: string, alt: string, s: TileSpec["s"]): TileSpec => ({ src, alt, nat: LISTING, s });
const phonePrint = (id: string, work: string, a: TileSpec, b: TileSpec, ground: [string, string]): PrintSpec => {
  const layout = { aspect: a.s[2] / a.s[3], faces: [{ ground: ground[0], tiles: [a] }, { ground: ground[1], tiles: [b] }] as PrintSpec["wide"]["faces"] };
  return { id, work, wide: layout, narrow: layout };
};

// Web face: the store page (the listing's own frame, as the web shows it). Phone face: the app screen inside it
// (boxes from src/content/phoneScreens.ts). Both crops share the ratio 0.709.
const READ_TO_FEED = phonePrint(
  "read-to-feed",
  "Read to Feed",
  listing("/mobile/reading-1.webp", "Read to Feed store page frame: Explore a vast library of books for ages K-12, with the app's My Books screen on a phone.", [0, 0, 780, 1100]),
  listing("/mobile/reading-2.webp", "Read to Feed app screen from its store listing: Achievements, with eggs collected and quiz badges.", [80, 586, 620, 874]),
  ["#3fa9e0", "#fefefb"],
);

const VIVA_FRESH = phonePrint(
  "viva-fresh",
  "Viva Fresh",
  listing("/mobile/grocery-1.webp", "Viva Fresh store page frame: the app's home screen on an iPhone, on the store's red ground, in Albanian.", [0, 120, 780, 1100]),
  listing("/mobile/grocery-3.webp", "Viva Fresh app screen from its store listing: the cart with quantities, the total and the checkout button, in Albanian.", [88, 371, 604, 852]),
  ["#e8342c", "#efefef"],
);

/** A phone capture standing in the middle of a wider card, on its own page colour. */
const PHONE_CROP = 780 / 1100;
const centred = (src: string, alt: string, aspect: number): TileSpec => {
  const w = PHONE_CROP / aspect;
  return { src, alt, nat: [780, 1688], s: [0, 0, 780, 1100], d: [(1 - w) / 2, 0, w, 1] };
};

const offdayDesk = (s: TileSpec["s"]): TileSpec => ({
  src: "/personal/shots/offday-light-calendar-desktop.webp",
  nat: WEB,
  s,
  alt: "Offday team calendar for October 2026 on a desktop: who is out today, pending requests, and leave bars on the calendar.",
});
const OFFDAY_PHONE = "Offday team calendar on a phone: the same page, with the request button, the team counts and October 2026.";

const OFFDAY: PrintSpec = {
  id: "offday",
  work: "Offday",
  wide: {
    aspect: 1.6,
    faces: [
      { ground: "#ffffff", tiles: [offdayDesk([510, 190, 1920, 1200])] },
      { ground: "#f4f2f2", tiles: [centred("/personal/shots/offday-light-calendar-phone.webp", OFFDAY_PHONE, 1.6)] },
    ],
  },
  narrow: {
    aspect: 880 / 640,
    faces: [
      { ground: "#ffffff", tiles: [offdayDesk([490, 205, 880, 640])] },
      { ground: "#f4f2f2", tiles: [centred("/personal/shots/offday-light-calendar-phone.webp", OFFDAY_PHONE, 880 / 640)] },
    ],
  },
};

const orgDesk = (s: TileSpec["s"]): TileSpec => ({
  src: "/showcase/bayyinah/org-01.webp",
  nat: WEB,
  s,
  alt: "bayyinah.org on a desktop: the heading Help Us Spread Quranic Knowledge, a Join the Mission button and the store badges.",
});
const ORG_PHONE = "bayyinah.org on a phone: the same page, with the heading, the mission text and the Join the Mission button.";

const ORG: PrintSpec = {
  id: "bayyinah-org",
  work: "bayyinah.org",
  wide: {
    aspect: 1.6,
    faces: [
      { ground: "#ffeadb", tiles: [orgDesk([0, 0, 2880, 1800])] },
      { ground: "#ffeadb", tiles: [centred("/showcase/bayyinah/org-phone.webp", ORG_PHONE, 1.6)] },
    ],
  },
  narrow: {
    aspect: 1.25,
    faces: [
      { ground: "#ffeadb", tiles: [orgDesk([560, 200, 1760, 1408])] },
      { ground: "#ffeadb", tiles: [centred("/showcase/bayyinah/org-phone.webp", ORG_PHONE, 1.25)] },
    ],
  },
};

/* ---------- The rest of the work, one line each ---------- */

type Platform = "web" | "phone" | "both";

interface Line {
  name: string;
  years: string;
  role: string;
  line: string;
  /** Where the product runs. The page lens marks the rows that match its face. */
  plat: Platform;
  href?: string;
  external?: boolean;
}

const PLAT_LABEL: Record<Platform, string> = { web: "Web", phone: "Phone", both: "Web, phone" };

interface Group {
  title: string;
  years?: string;
  rows: Line[];
}

// Grouped by employer (CONTENT §7b). Vianova is named only on its own group; public products carry no employer name.
const INDEX: Group[] = [
  {
    title: "Vianova",
    years: "2021–now",
    rows: [
      { name: "Care-management platform", plat: "both", years: "2023–26", role: "Web, mobile, server", line: "Care teams follow patients at home. Being rebuilt one screen at a time.", href: "/work/care-platform" },
      { name: "Design System v2", plat: "web", years: "2026", role: "Design system", line: "A team effort: 36 building blocks, 20 releases in about six weeks. Gentrit laid the foundation.", href: "/work/design-system-react" },
    ],
  },
  {
    title: "Public products",
    rows: [
      { name: "Bayyinah TV", plat: "both", years: "2023–26", role: "Frontend", line: "Video courses and live streams, on the web and in both app stores.", href: "/work/bayyinah-tv" },
      { name: "bayyinah.org", plat: "web", years: "2024–25", role: "Frontend", line: "A one-page website for the institute, built in Next.js.", href: "https://bayyinah.org/", external: true },
      { name: "Read to Feed", plat: "phone", years: "2022–25", role: "Mobile", line: "A children's reading app. About 14 releases to both stores.", href: "/work/read-to-feed" },
      { name: "Viva Fresh", plat: "phone", years: "2023", role: "Mobile", line: "Grocery orders with delivery slots and loyalty, in Albanian.", href: "/work/viva-fresh" },
      { name: "Dukagjini Bookstore", plat: "phone", years: "2021–22", role: "Mobile", line: "A publisher's book shop for iPhone and Android, with promo codes at checkout.", href: "/work/dukagjini-bookstore" },
      { name: "Sadaqah app for Islamic Relief USA", plat: "phone", years: "2021–22", role: "Mobile, team", line: "Built the payment and subscription screens, badges and Android builds." },
    ],
  },
  {
    title: "Incentiv",
    years: "2024",
    rows: [{ name: "Incentiv portal", plat: "web", years: "2024", role: "Frontend", line: "Sign-in, first-run tour and dashboard cards. Teammates built the wallet itself.", href: "/work/incentiv" }],
  },
  {
    title: "AvahiTech",
    years: "Freelance",
    rows: [{ name: "Business dashboard", plat: "web", years: "Freelance", role: "Frontend", line: "AI headshots from photos, and a chat that answers questions about a PDF." }],
  },
  {
    title: "Own products",
    rows: [
      { name: "Offday", plat: "web", years: "2026", role: "Own", line: "Time off for teams: requests, approvals, a shared calendar and shift cover." },
      { name: "FJALË", plat: "web", years: "2026", role: "Own", line: "A daily Albanian word game that also works offline.", href: "https://xn--fjal-opa.com/", external: true },
      { name: "Za!", plat: "web", years: "2026", role: "Own", line: "An online pizza card game for two to eight players, with bots.", href: "https://za-game.onrender.com/", external: true },
      { name: "Morse Trainer", plat: "web", years: "2026", role: "Own", line: "Learn Morse code. Letters you miss come back sooner.", href: "https://morse-code-amber.vercel.app/", external: true },
      { name: "Reader libraries", plat: "phone", years: "2022", role: "Maintainer", line: "Two open-source reader libraries kept working for a reading app.", href: links.github, external: true },
    ],
  },
];

/* ---------- Small parts ---------- */

function Out({ href, children }: { href: string; children: string }) {
  return (
    <a className="lx-out" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="lx-arrow" aria-hidden="true">↗</span>
    </a>
  );
}

/* ---------- Theme: light and dark, as the site chooses them ---------- */

type Theme = "light" | "dark";
/** The page ground in each theme: the browser's own surfaces and the theme-color take it while the draft is open. */
const GROUND: Record<Theme, string> = { light: "#f7efea", dark: "#120d0a" };

/** html[data-theme] when the site has set it (the visitor chose), else the system setting. */
function readTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => (typeof document === "undefined" ? "light" : readTheme()));
  useEffect(() => {
    const sync = () => setTheme(readTheme());
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    sync();
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);
  // The visitor's choice is the site's choice too (same attribute, same storage key). Nothing eases across a
  // theme change: transitions are off for one frame, and the lens is not touched.
  const choose = (t: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme-switching", "");
    root.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {
      // Storage can be blocked; the choice then lasts for this page view.
    }
    requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute("data-theme-switching")));
  };
  return [theme, choose];
}

/**
 * While the draft is open, the browser's own surfaces (html, body, the theme-color) take the page's ground for
 * the current theme, and in-page jumps are instant: the shell's smooth scroll would glide 5000px past every print
 * (and leaves full-page captures mid-scroll). Everything is restored on leaving.
 */
function useSurfaces(theme: Theme) {
  useEffect(() => {
    const { documentElement: root, body } = document;
    const metas = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')];
    const before = {
      root: root.style.backgroundColor,
      body: body.style.backgroundColor,
      scheme: root.style.colorScheme,
      scroll: root.style.scrollBehavior,
      metas: metas.map((m) => m.content),
    };
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.backgroundColor = before.root;
      body.style.backgroundColor = before.body;
      root.style.colorScheme = before.scheme;
      root.style.scrollBehavior = before.scroll;
      metas.forEach((m, i) => (m.content = before.metas[i]));
    };
  }, []);
  useEffect(() => {
    const { documentElement: root, body } = document;
    root.style.backgroundColor = body.style.backgroundColor = GROUND[theme];
    root.style.colorScheme = theme;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = GROUND[theme]));
  }, [theme]);
}

/** Light ⇄ Dark: the same two-face switch as under each print, for the page's colours. */
function ThemeSwitch({ theme, choose, where }: { theme: Theme; choose: (t: Theme) => void; where: "mast" | "foot" }) {
  const id = useId();
  return (
    <fieldset className={`lx-switch lx-theme lx-theme-${where}`}>
      <legend className="lx-sr">Colour theme</legend>
      {(["light", "dark"] as const).map((t, i) => (
        <Fragment key={t}>
          {i === 1 && (
            <span className="lx-switch-sep" aria-hidden="true">
              ⇄
            </span>
          )}
          <label className="lx-face" data-on={theme === t || undefined}>
            <input type="radio" name={id} checked={theme === t} onChange={() => choose(t)} />
            <span>{t === "light" ? "Light" : "Dark"}</span>
          </label>
        </Fragment>
      ))}
    </fieldset>
  );
}

/** The live line: the current face as a fact. */
function Showing({ lens }: { lens: Tilt }) {
  const face = useFace(lens);
  return (
    <p className="lx-showing" aria-live="polite">
      {face === 0 ? "Showing each product on the web." : "Showing each product on a phone, where it has one."}
    </p>
  );
}

/** The lens bar: in the flow under the claim, then stuck to the top; the rule under it shows only when stuck. */
function LensBar({ lens }: { lens: Tilt }) {
  const bar = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bar.current;
    const m = mark.current;
    if (!el || !m) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-stuck", !e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(m);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <div ref={mark} className="lx-lensmark" aria-hidden="true" />
      <div ref={bar} className="lx-lensbar">
        <div className="lx-lensbar-inner">
          <LensSwitch tilt={lens} />
          <Showing lens={lens} />
        </div>
      </div>
    </>
  );
}

/* ---------- The page ---------- */

export default function Draft() {
  const [theme, chooseTheme] = useTheme();
  useSurfaces(theme);
  const reduced = useReducedMotion() ?? false;
  // The page lens: one angle for the whole page. Every print, label, word mark and index tag reads it.
  const lens = useTilt(reduced);
  // The claim's word, the index tags and About mark the current face. Set outside React, on those few
  // elements only: a flip restyles two dozen spans, not the whole page.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const all = [...(root.current?.querySelectorAll<HTMLElement>("[data-w], [data-plat]") ?? [])];
    // The claim's two words change with the flip; the index tags and About, far down the page, when idle.
    const near = all.filter((el) => el.closest(".lx-intro"));
    const far = all.filter((el) => !near.includes(el));
    const mark = (els: HTMLElement[]) => {
      const want = lens.getFace() === 0 ? "web" : "phone";
      for (const el of els) el.toggleAttribute("data-on", (el.dataset.w ?? el.dataset.plat) === want || el.dataset.plat === "both");
    };
    const markFar = () => mark(far);
    mark(all);
    return lens.subscribe(() => {
      mark(near);
      whenIdle(markFar);
    });
  }, [lens]);

  return (
    <div className="lx" ref={root}>
      <title>Gentrit Rashiti: web and phone apps</title>
      <meta name="description" content="Gentrit Rashiti builds web and phone apps for learners, care teams and shoppers. Based in Kosovo, working remotely." />
      <meta
        name="portfolio-check"
        content="allow C17: the hero is one 211 kB WebP, loaded eagerly at high priority, and this page's own code is under 11 kB gzip. On a production build at 4x CPU the largest paint measured 0.72 to 1.14 s across runs on a machine shared with other checkers; the rest of that time is the shared draft router's two lazy levels. A srcset with the 1080 copy was tried and dropped: it trips C08c at 1x"
      />
      <link rel="preload" href="/fonts/creative/BricolageGrotesque-Latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

      <header className="lx-top">
        <div className="lx-mast">
          <p className="lx-who">Gentrit Rashiti</p>
          <nav aria-label="Main">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href={links.cv}>CV</a>
            <a href={`mailto:${links.email}`}>Email</a>
          </nav>
          <ThemeSwitch theme={theme} choose={chooseTheme} where="mast" />
        </div>
        <div className="lx-intro">
          <h1 id="lx-claim" className="lx-claim">
            Gentrit Rashiti builds <span className="lx-w" data-w="web" data-on="">web</span> and{" "}
            <span className="lx-w" data-w="phone">phone</span> apps for learners, care teams and shoppers.
          </h1>
          <p className="lx-role">
            Frontend and mobile developer since 2021, now full stack. <span>Based in Kosovo, working remotely.</span>
          </p>
        </div>
      </header>

      {/* Read in order: the claim, then the switch, then the work. The bar sticks to the top once it is reached. */}
      <LensBar lens={lens} />

      <main>
        <section className="lx-hero" aria-labelledby="lx-hero-h">
          <div className="lx-hero-grid">
            <Print
              spec={BAYYINAH}
              tilt={lens}
              name="Bayyinah TV, website and App Store faces"
              priority
              story
              caption={<span className="lx-prov">Two real screens in one print: the website and the App Store page.</span>}
            />
            <div className="lx-hero-side">
              <h2 id="lx-hero-h" className="lx-name">Bayyinah TV</h2>
              <p className="lx-kind">Video courses and live streams.</p>
              <FaceSwitch tilt={lens} name="Bayyinah TV" labels={["bayyinahtv.com", "App Store"]} />
              <p className="lx-fact">The same web app runs on the website and inside the iPhone and Android apps.</p>
              <p className="lx-meta">Frontend, core team · 2023–26</p>
              <p className="lx-live">
                <Out href="https://bayyinahtv.com/">Website</Out>
                <Out href="https://apps.apple.com/us/app/bayyinah-tv/id1530635769">App Store</Out>
                <Out href="https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah">Google Play</Out>
              </p>
            </div>
          </div>
        </section>

        <section className="lx-built" aria-labelledby="lx-built-h">
          <h2 id="lx-built-h" className="lx-result">Rebuilt from an empty project, then shipped to the web and both stores.</h2>
          <div className="lx-built-text">
            <p>
              A core frontend team, Gentrit among them, rebuilt the second version from an empty project. It has live
              streams with chat and moderation, and a video player that locks premium videos. Members pay with Stripe, Apple or Google, and
              can give gifts and use promo codes. The app runs in English, and in Arabic from right to left.
            </p>
            <p>
              <Link className="lx-go" to="/work/bayyinah-tv">
                Read the Bayyinah TV case
              </Link>
            </p>
          </div>
          <div className="lx-built-print">
            <Print
              spec={ORG}
              tilt={lens}
              name="bayyinah.org, desktop and phone faces"
              caption={
                <>
                  <FaceSwitch tilt={lens} name="bayyinah.org" labels={["Desktop", "Phone"]} />
                  <span className="lx-prov">
                    Also built: <Out href="https://bayyinah.org/">bayyinah.org</Out>, one page, 2024–25.
                  </span>
                </>
              }
            />
          </div>
        </section>

        <section id="work" className="lx-row lx-care" aria-labelledby="lx-care-h">
          <div className="lx-row-print">
            <Print
              spec={CARE}
              tilt={lens}
              name="Care platform, care team and one patient faces"
              caption={
                <>
                  <FaceSwitch tilt={lens} name="Care platform" labels={["Care team", "One patient"]} />
                  <span className="lx-prov">Web only, so its second face is one patient. {REAL_SCREENS}</span>
                </>
              }
            />
          </div>
          <div className="lx-row-text">
            <h2 id="lx-care-h" className="lx-name">Care-management platform, Vianova</h2>
            <p className="lx-kind">Care teams follow patients at home: vitals from devices, care plans, lab results, claims and calls.</p>
            <p className="lx-result">Care teams keep using the app while it is rebuilt, one screen at a time.</p>
            <p>
              Each screen gets one test that runs on the old app and on the new one. A screen moves over only when it
              passes on both, and none is live yet. Many client organizations share the system, and each one sees only
              its own data. It runs in English, German, Spanish and Turkish.
            </p>
            <p className="lx-proof">
              <span className="lx-num">16 → 2</span> database requests for one billing report. It no longer times out.
            </p>
            <p className="lx-ai">Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.</p>
            <p className="lx-meta">Web and mobile, since 2026 also the server · 2023–26</p>
            <p>
              <Link className="lx-go" to="/work/care-platform">
                Read the care platform case
              </Link>
            </p>
          </div>
        </section>

        <section className="lx-phones" aria-labelledby="lx-phones-h">
          <h2 id="lx-phones-h" className="lx-section-h">Phone apps, iPhone and Android</h2>
          <div className="lx-phone-grid">
            <article className="lx-phone">
              <Print spec={READ_TO_FEED} tilt={lens} name="Read to Feed, store page and app faces" caption={<FaceSwitch tilt={lens} name="Read to Feed" labels={["Store page", "App"]} />} />
              <div className="lx-phone-text">
                <h3 className="lx-name">Read to Feed</h3>
                <p className="lx-kind">A children's reading app. Children read, scan their own books by barcode and earn badges.</p>
                <p className="lx-result">About 14 releases to both stores.</p>
                <p>The app went through three major upgrades of its framework. The store pages are now removed; the links open saved copies.</p>
                <p className="lx-meta">Mobile, iOS and Android · 2022–25</p>
                <p className="lx-live">
                  <Out href="https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765">App Store (archived)</Out>
                  <Out href="https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf">Google Play (archived)</Out>
                </p>
              </div>
            </article>
            <article className="lx-phone">
              <Print spec={VIVA_FRESH} tilt={lens} name="Viva Fresh, store page and app faces" caption={<FaceSwitch tilt={lens} name="Viva Fresh" labels={["Store page", "App"]} />} />
              <div className="lx-phone-text">
                <h3 className="lx-name">Viva Fresh</h3>
                <p className="lx-kind">A grocery app in Albanian, with delivery slots, a loyalty program and a wishlist.</p>
                <p className="lx-result">Live in the App Store and on Google Play.</p>
                <p>The same code builds the iPhone app and the Android app. A search on a map finds the delivery address.</p>
                <p className="lx-meta">Mobile · 2023</p>
                <p className="lx-live">
                  <Out href="https://apps.apple.com/us/app/viva-fresh/id1580739480">App Store</Out>
                  <Out href="https://play.google.com/store/apps/details?id=com.zs.vivafresh">Google Play</Out>
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="lx-row lx-own" aria-labelledby="lx-own-h">
          <div className="lx-row-text">
            <h2 id="lx-own-h" className="lx-name">Offday, Gentrit's own product</h2>
            <p className="lx-kind">Time off for teams. People ask for days off, managers approve them, and one calendar shows who is away.</p>
            <p className="lx-result">About 200 tests, including checks that each team sees only its own data.</p>
            <p>It warns when a shift has no cover, and it finds the best dates for a long break. The same web app fits a phone.</p>
            <p className="lx-meta">Own product · 2026</p>
          </div>
          <div className="lx-row-print">
            <Print spec={OFFDAY} tilt={lens} name="Offday, website and phone faces" caption={<FaceSwitch tilt={lens} name="Offday" labels={["Website", "Phone"]} />} />
          </div>
        </section>

        <section id="index" className="lx-index" aria-labelledby="lx-index-h">
          <h2 id="lx-index-h" className="lx-section-h">More work</h2>
          {INDEX.map((group) => (
            <section key={group.title} className="lx-group" aria-label={group.title}>
              <h3 className="lx-group-h">
                {group.title}
                {group.years && <span className="lx-list-years">{group.years}</span>}
              </h3>
              <ol className="lx-list">
                {group.rows.map((row) => (
                  <li key={row.name}>
                    <span className="lx-list-name">
                      {row.href ? (
                        row.external ? (
                          <Out href={row.href}>{row.name}</Out>
                        ) : (
                          <Link to={row.href}>
                            {row.name}
                            <span className="lx-arrow" aria-hidden="true">→</span>
                          </Link>
                        )
                      ) : (
                        row.name
                      )}
                    </span>
                    <span className="lx-list-years">{row.years}</span>
                    <span className="lx-list-role">
                      {row.role} <span className="lx-plat" data-plat={row.plat} data-on={row.plat !== "phone" ? "" : undefined}>{PLAT_LABEL[row.plat]}</span>
                    </span>
                    <span className="lx-list-line">{row.line}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </section>
      </main>

      <footer id="about" className="lx-about">
        <div className="lx-about-inner">
          <h2 className="lx-section-h">About</h2>
          <p className="lx-about-lede">
            Gentrit Rashiti builds <span className="lx-w" data-w="web" data-on="">web</span> and{" "}
            <span className="lx-w" data-w="phone">phone</span> apps, and since 2026 also the server behind them. Based
            in Kosovo, working remotely. Building apps since 2021.
          </p>
          <p>Works in React, React Native, Vue, TypeScript and Laravel. Bachelor's degree from UBT.</p>
          <ul className="lx-contact">
            <li>
              <a href={`mailto:${links.email}`}>{links.email}</a>
            </li>
            <li>
              <a href={links.cv}>CV (PDF)</a>
            </li>
            <li>
              <Out href={links.github}>GitHub</Out>
            </li>
            <li>
              <Out href={links.linkedin}>LinkedIn</Out>
            </li>
          </ul>
          <p className="lx-note">
            How the pictures work: the page is one lenticular sheet. Each picture holds two real screens cut into thin
            strips under a row of tiny lenses, and one angle for the whole page picks which strips you see, so every
            picture turns together. Each card is drawn as seen from a little to its left, so its right edge already
            shows a few strips of the second screen. Care-platform screens are real product screens with invented data.
          </p>
          <ThemeSwitch theme={theme} choose={chooseTheme} where="foot" />
          <p className="lx-sign">Gentrit Rashiti, 2026</p>
        </div>
      </footer>
    </div>
  );
}
