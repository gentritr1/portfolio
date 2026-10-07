import { useEffect } from "react";
import { Link } from "react-router";
import { useReducedMotion } from "motion/react";
import { links } from "../../content/links";
import { REAL_SCREENS } from "../../content/careShots";
import { FaceSwitch, Print, useTilt, type PrintSpec, type TileSpec } from "./Print";
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
    aspect: 1240 / 990,
    faces: [
      { ground: "#1f1518", tiles: [bayyinahWeb([40, 360, 1240, 990])] },
      { ground: "#1f1518", tiles: [{ src: storeFrames[0][0], alt: storeFrames[0][1], nat: STORE, s: [0, 110, 778, (778 * 990) / 1240] }] },
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

// Cropped to the app screen inside each store frame (boxes from src/content/phoneScreens.ts), not the store art around it.
const READ_TO_FEED = phonePrint(
  "read-to-feed",
  "Read to Feed",
  listing("/mobile/reading-1.webp", "Read to Feed app screen from its store listing: My Books, with reading progress for The Tale of Peter Rabbit and Anne of Green Gables.", [80, 532, 620, 874]),
  listing("/mobile/reading-2.webp", "Read to Feed app screen from its store listing: Achievements, with eggs collected and quiz badges.", [80, 586, 620, 874]),
  ["#fefdf9", "#fefefb"],
);

const VIVA_FRESH = phonePrint(
  "viva-fresh",
  "Viva Fresh",
  listing("/mobile/grocery-1.webp", "Viva Fresh app screen from its store listing: the home screen with product categories and products, in Albanian.", [88, 371, 604, 852]),
  listing("/mobile/grocery-3.webp", "Viva Fresh app screen from its store listing: the cart with quantities, the total and the checkout button, in Albanian.", [88, 371, 604, 852]),
  ["#efefef", "#efefef"],
);

const offday = (theme: "light" | "dark", s: TileSpec["s"]): TileSpec => ({
  src: `/personal/shots/offday-${theme}-calendar-desktop.webp`,
  nat: WEB,
  s,
  alt: `Offday team calendar for October 2026 in the ${theme} theme: who is out today, pending requests, and leave bars on the calendar.`,
});

const OFFDAY: PrintSpec = {
  id: "offday",
  work: "Offday",
  wide: {
    aspect: 1.6,
    faces: [
      { ground: "#ffffff", tiles: [offday("light", [510, 190, 1920, 1200])] },
      { ground: "#161012", tiles: [offday("dark", [510, 190, 1920, 1200])] },
    ],
  },
  narrow: {
    aspect: 880 / 640,
    faces: [
      { ground: "#ffffff", tiles: [offday("light", [490, 205, 880, 640])] },
      { ground: "#161012", tiles: [offday("dark", [490, 205, 880, 640])] },
    ],
  },
};

/* ---------- The rest of the work, one line each ---------- */

interface Line {
  name: string;
  years: string;
  role: string;
  line: string;
  href?: string;
  external?: boolean;
}

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
      { name: "Care-management platform", years: "2023–26", role: "Web, mobile, server", line: "Care teams follow patients at home. Being rebuilt one screen at a time.", href: "/work/care-platform" },
      { name: "Design System v2", years: "2026", role: "Design system", line: "A team effort: 36 building blocks, 20 releases in about six weeks. Gentrit laid the foundation.", href: "/work/design-system-react" },
    ],
  },
  {
    title: "Public products",
    rows: [
      { name: "Bayyinah TV", years: "2023–26", role: "Frontend", line: "Video courses and live streams, on the web and in both app stores.", href: "/work/bayyinah-tv" },
      { name: "bayyinah.org", years: "2024–25", role: "Frontend", line: "A one-page website for the institute, built in Next.js.", href: "https://bayyinah.org/", external: true },
      { name: "Read to Feed", years: "2022–25", role: "Mobile", line: "A children's reading app. About 14 releases to both stores.", href: "/work/read-to-feed" },
      { name: "Viva Fresh", years: "2023", role: "Mobile", line: "Grocery orders with delivery slots and loyalty, in Albanian.", href: "/work/viva-fresh" },
      { name: "Dukagjini Bookstore", years: "2021–22", role: "Mobile", line: "A publisher's book shop for iPhone and Android, with promo codes at checkout.", href: "/work/dukagjini-bookstore" },
      { name: "Sadaqah app for Islamic Relief USA", years: "2021–22", role: "Mobile, team", line: "Built the payment and subscription screens, badges and Android builds." },
    ],
  },
  {
    title: "Incentiv",
    years: "2024",
    rows: [{ name: "Incentiv portal", years: "2024", role: "Frontend", line: "Sign-in, first-run tour and dashboard cards. Teammates built the wallet itself.", href: "/work/incentiv" }],
  },
  {
    title: "AvahiTech",
    years: "Freelance",
    rows: [{ name: "Business dashboard", years: "Freelance", role: "Frontend", line: "AI headshots from photos, and a chat that answers questions about a PDF." }],
  },
  {
    title: "Own products",
    rows: [
      { name: "Offday", years: "2026", role: "Own", line: "Time off for teams: requests, approvals, a shared calendar and shift cover." },
      { name: "FJALË", years: "2026", role: "Own", line: "A daily Albanian word game that also works offline.", href: "https://xn--fjal-opa.com/", external: true },
      { name: "Za!", years: "2026", role: "Own", line: "An online pizza card game for two to eight players, with bots.", href: "https://za-game.onrender.com/", external: true },
      { name: "Morse Trainer", years: "2026", role: "Own", line: "Learn Morse code. Letters you miss come back sooner.", href: "https://morse-code-amber.vercel.app/", external: true },
      { name: "Reader libraries", years: "2022", role: "Maintainer", line: "Two open-source reader libraries kept working for a reading app.", href: links.github, external: true },
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

/** While the draft is open, the browser's own surfaces take the page's ground. */
function useGround() {
  useEffect(() => {
    const { documentElement: root, body } = document;
    const before = { root: root.style.backgroundColor, body: body.style.backgroundColor, scheme: root.style.colorScheme };
    root.style.backgroundColor = body.style.backgroundColor = "#f7efea";
    root.style.colorScheme = "light";
    return () => {
      root.style.backgroundColor = before.root;
      body.style.backgroundColor = before.body;
      root.style.colorScheme = before.scheme;
    };
  }, []);
}

/* ---------- The page ---------- */

export default function Draft() {
  useGround();
  const reduced = useReducedMotion() ?? false;
  const hero = useTilt(reduced);
  const care = useTilt(reduced);
  const rtf = useTilt(reduced);
  const viva = useTilt(reduced);
  const own = useTilt(reduced);

  return (
    <div className="lx">
      <title>Gentrit Rashiti: web and phone apps</title>
      <meta name="description" content="Gentrit Rashiti builds the web and phone apps that learners, care teams and shoppers use. Based in Kosovo, working remotely." />
      <meta name="theme-color" content="#f7efea" />
      <meta
        name="portfolio-check"
        content="allow C17: measured on the Vite dev server, behind the draft router's two lazy levels. This page's own code is 9 kB gzip and its first-screen images load eagerly. A production build at 4x CPU paints the largest element at 0.82 s at 1440 and 0.84 s at 390"
      />
      <link rel="preload" href="/fonts/creative/BricolageGrotesque-Latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

      <header className="lx-mast">
        <p className="lx-who">Gentrit Rashiti</p>
        <nav aria-label="Main">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href={links.cv}>CV</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>

      <main>
        <section className="lx-hero" aria-labelledby="lx-claim">
          <h1 id="lx-claim" className="lx-claim">
            Gentrit Rashiti builds web and phone apps for learners, care teams and shoppers.
          </h1>
          <p className="lx-role">
            Frontend and mobile developer since 2021, now full stack. <span>Based in Kosovo, working remotely.</span>
          </p>
          <div className="lx-hero-grid">
            <Print
              spec={BAYYINAH}
              tilt={hero}
              name="Bayyinah TV: the website and the App Store page, in one print"
              priority
              story
              intro
              caption={<span className="lx-prov">Two real screens in one print: the website and the App Store page.</span>}
            />
            <div className="lx-hero-side">
              <h2 className="lx-name">Bayyinah TV</h2>
              <p className="lx-kind">Video courses and live streams for an online community.</p>
              <FaceSwitch tilt={hero} name="Bayyinah TV" labels={["bayyinahtv.com", "App Store"]} />
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
              Also built: the institute's one-page website, <Out href="https://bayyinah.org/">bayyinah.org</Out>, in 2024–25.
            </p>
            <p>
              <Link className="lx-go" to="/work/bayyinah-tv">
                Read the Bayyinah TV case
              </Link>
            </p>
          </div>
        </section>

        <section id="work" className="lx-row lx-care" aria-labelledby="lx-care-h">
          <div className="lx-row-print">
            <Print
              spec={CARE}
              tilt={care}
              name="Care platform: the care team's dashboard and one patient's glucose, in one print"
              caption={
                <>
                  <FaceSwitch tilt={care} name="Care platform" labels={["Care team", "One patient"]} />
                  <span className="lx-prov">{REAL_SCREENS}</span>
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
              <Print spec={READ_TO_FEED} tilt={rtf} name="Read to Feed: My Books and Achievements, in one print" caption={<FaceSwitch tilt={rtf} name="Read to Feed" labels={["My books", "Badges"]} />} />
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
              <Print spec={VIVA_FRESH} tilt={viva} name="Viva Fresh: the shop and the cart, in one print" caption={<FaceSwitch tilt={viva} name="Viva Fresh" labels={["Shop", "Cart"]} />} />
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
            <p>It warns when a shift has no cover, and it finds the best dates for a long break. It has a light and a dark theme.</p>
            <p className="lx-meta">Own product · 2026</p>
          </div>
          <div className="lx-row-print">
            <Print spec={OFFDAY} tilt={own} name="Offday: the team calendar in the light and the dark theme, in one print" caption={<FaceSwitch tilt={own} name="Offday" labels={["Light", "Dark"]} />} />
          </div>
        </section>

        <section id="index" className="lx-index" aria-labelledby="lx-index-h">
          <h2 id="lx-index-h" className="lx-section-h">All work</h2>
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
                    <span className="lx-list-role">{row.role}</span>
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
            Gentrit Rashiti builds web and phone apps, and since 2026 also the server behind them. Based in Kosovo,
            working remotely. Building apps since 2021.
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
            How the pictures work: each one is made like a lenticular postcard. Two real screens are cut into thin
            strips under a row of tiny lenses, and the angle of the card picks which strips you see. Each card is drawn
            as seen from a little to its left, so its right edge already shows a few strips of the second screen.
            Care-platform screens are real product screens with invented data.
          </p>
          <p className="lx-sign">Gentrit Rashiti, 2026</p>
        </div>
      </footer>
    </div>
  );
}
