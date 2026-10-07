import { useEffect, useRef, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { links as shared } from "../../content/links";
import { openWindow, takeFocus } from "./openWindow";
import { Arrow, Caption, Out, Phone, Shot } from "./parts";
import { bayyinah, calendar, claims, datePicker, links, phones } from "./shots";

export const HOME = "/drafts/p12-pro";
export const CASE = "/drafts/p12-pro/case";

interface IndexRow {
  name: string;
  years: string;
  role: string;
  line: string;
  link?: { label: string; href: string };
}

const otherWork: IndexRow[] = [
  {
    name: "Incentiv portal",
    years: "2024",
    role: "Frontend",
    line: "Sign-in with a passkey, a first-run tour and dashboard cards, in English and French.",
    link: { label: "portal.incentiv.io", href: "https://portal.incentiv.io/" },
  },
  {
    name: "Bayyinah institute website",
    years: "2024–25",
    role: "Frontend",
    line: "A one-page website for the institute, with links to both app stores.",
    link: { label: "bayyinah.org", href: "https://bayyinah.org/" },
  },
  {
    name: "Sadaqah app, Islamic Relief USA",
    years: "2021–22",
    role: "Mobile, team member",
    line: "Donations and subscriptions. Built the payment screens and the badges.",
  },
  {
    name: "Chatbot runtime library",
    years: "2022–25",
    role: "Mobile",
    line: "Plays scripted chat conversations inside phone apps, with natural typing delays.",
  },
  {
    name: "Business dashboard with AI, AvahiTech",
    years: "Freelance",
    role: "Frontend",
    line: "Makes headshots from photos and answers questions about uploaded PDF files.",
  },
];

const ownWork: IndexRow[] = [
  {
    name: "FJALË",
    years: "2026",
    role: "Owner",
    line: "A daily Albanian word game. It also plays offline.",
    link: { label: "fjalë.com", href: "https://xn--fjal-opa.com/" },
  },
  {
    name: "Za!",
    years: "2026",
    role: "Owner",
    line: "A pizza card game for 2 to 8 players, with bots.",
    link: { label: "Play", href: "https://za-game.onrender.com/" },
  },
  {
    name: "Morse Trainer",
    years: "2026",
    role: "Owner",
    line: "A game for learning Morse code, with spaced repetition.",
    link: { label: "Play", href: "https://morse-code-amber.vercel.app/" },
  },
  {
    name: "Offday",
    years: "2026",
    role: "Owner",
    line: "Time off for teams: requests, approvals and a shared calendar.",
  },
  {
    name: "Geo Guesser World 3D",
    years: "2026",
    role: "Mobile, co-built",
    line: "A street-view guessing game for phones.",
    link: { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.snaxxtech.geoguesser" },
  },
  {
    name: "Open-source forks",
    years: "2022",
    role: "Maintainer",
    line: "PDF and EPUB readers for React Native, used in a reading app.",
    link: { label: "GitHub", href: shared.github },
  },
];

function Index({ title, rows }: { title: string; rows: IndexRow[] }) {
  return (
    <div className="p12p-index-group">
      <h3>{title}</h3>
      <ul className="p12p-index">
        {rows.map((r) => (
          <li key={r.name}>
            <span className="p12p-index-name">{r.name}</span>
            <span className="p12p-index-years">{r.years}</span>
            <span className="p12p-index-role">{r.role}</span>
            <span className="p12p-index-line">{r.line}</span>
            <span className="p12p-index-link">
              {r.link && (
                <a href={r.link.href} className="p12p-link" target="_blank" rel="noreferrer">
                  {r.link.label}
                  <Out />
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className="p12p-link" target="_blank" rel="noreferrer">
      {children}
      <Out />
    </a>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => takeFocus(heading.current), []);
  const toCase = (event: MouseEvent<HTMLAnchorElement>) =>
    openWindow(event, CASE, navigate, ".p12p-hero-win", ".p12p-case-win");

  return (
    <div className="p12p-home">
      <section className="p12p-hero" aria-labelledby="p12p-claim">
        <header className="p12p-mast">
          <span className="p12p-name">Gentrit Rashiti</span>
          <nav aria-label="Main">
            <a href="#work">Work</a>
            <a href={CASE} onClick={toCase}>
              Case
            </a>
            <a href={shared.cv}>CV</a>
            <a href={`mailto:${shared.email}`}>Email</a>
          </nav>
        </header>

        <h1 id="p12p-claim" className="p12p-claim" ref={heading} tabIndex={-1}>
          Gentrit Rashiti builds web and phone apps for care teams, learners and shoppers.
        </h1>
        <p className="p12p-role">Frontend and mobile developer, now full stack. Works remotely from Kosovo.</p>

        <dl className="p12p-proof">
          <div>
            <dt>
              <span className="p12p-now" aria-hidden="true" />
              Now
            </dt>
            <dd>Care platform rebuild, Vianova, 2023–26</dd>
          </div>
          <div>
            <dt>Live</dt>
            <dd>
              Bayyinah TV at <ExternalLink href={links.bayyinah}>bayyinahtv.com</ExternalLink>
            </dd>
          </div>
          <div>
            <dt>In stores</dt>
            <dd>
              Viva Fresh on the <ExternalLink href={phones[0].links[0].href}>App Store</ExternalLink> and{" "}
              <ExternalLink href={phones[0].links[1].href}>Google Play</ExternalLink>
            </dd>
          </div>
        </dl>

        <Shot
          shot={calendar}
          wide={{ x: 250, y: 0 }}
          narrow={{ x: 620, y: 328 }}
          work="Care platform"
          className="p12p-hero-win"
          id="p12p-shot-hero"
          eager
          story
          href={CASE}
          label="Care team calendar at actual size. Read the care platform case."
          onClick={toCase}
        />
        <Caption title="Care team calendar, one week." real measure="#p12p-shot-hero" total={1440} />

        <a className="p12p-action" href={CASE} onClick={toCase}>
          Read the care platform case <Arrow />
        </a>

      </section>

      <section id="work" className="p12p-work" aria-labelledby="p12p-work-h">
        <h2 id="p12p-work-h" className="p12p-sec">
          Work
        </h2>

        <article className="p12p-row" aria-labelledby="p12p-r1">
          <div className="p12p-row-text">
            <h3 id="p12p-r1">Care platform rebuild</h3>
            <p className="p12p-meta">Vianova, 2023–26. Web, phone and server.</p>
            <p className="p12p-problem">A live care app had to move to React without stopping.</p>
            <p className="p12p-result">Care teams keep using the app while each screen moves over.</p>
            <p className="p12p-proofline">
              One billing report used to time out. Now it needs <span className="p12p-num">2</span> database requests, not{" "}
              <span className="p12p-num">16</span>.
            </p>
            <p className="p12p-scope">
              Built screens for web and phone, and since 2026 the server too. Gentrit wrote most of the rules and the
              checks. AI agents build inside them. A person approves each change.
            </p>
            <a className="p12p-action" href={CASE} onClick={toCase}>
              Read the case <Arrow />
            </a>
          </div>
          <figure className="p12p-row-fig">
            <Shot shot={claims} wide={{ x: 248, y: 150 }} narrow={{ x: 250, y: 576 }} work="Care platform" className="p12p-row-win" id="p12p-shot-claims" />
            <Caption title="Claims for one month." real measure="#p12p-shot-claims" total={1440} />
          </figure>
        </article>

        <article className="p12p-row p12p-row-dark" aria-labelledby="p12p-r2">
          <div className="p12p-row-text">
            <h3 id="p12p-r2">Bayyinah TV</h3>
            <p className="p12p-meta">2023–26. Frontend, in the core team.</p>
            <p className="p12p-problem">A video-learning platform, rebuilt from an empty project.</p>
            <p className="p12p-result">Live on the web and in both app stores.</p>
            <p className="p12p-scope">
              The rebuild added live streams with chat, a video player with a paywall, and subscriptions. The same web app
              runs inside the iPhone and Android apps, in English and in Arabic, right to left.
            </p>
            <p className="p12p-links">
              <ExternalLink href={links.bayyinah}>bayyinahtv.com</ExternalLink>
              <ExternalLink href={links.bayyinahAppStore}>App Store</ExternalLink>
              <ExternalLink href={links.bayyinahPlay}>Google Play</ExternalLink>
              <a href="/work/bayyinah-tv" className="p12p-link">
                Read the case
              </a>
            </p>
          </div>
          <figure className="p12p-row-fig">
            <Shot
              shot={bayyinah}
              wide={{ x: 150, y: 112 }}
              narrow={{ x: 300, y: 330 }}
              narrowHeight={230}
              work="Bayyinah TV"
              className="p12p-row-win"
              id="p12p-shot-bayyinah"
              ground="#1f1818"
            />
            <Caption title="Library, Arabic tab. Public page." measure="#p12p-shot-bayyinah" total={1440} />
          </figure>
        </article>

        <article className="p12p-row p12p-row-phones" aria-labelledby="p12p-r3">
          <div className="p12p-row-text">
            <h3 id="p12p-r3">Phone apps for shoppers and readers</h3>
            <p className="p12p-meta">2021–25. Mobile, iOS and Android.</p>
            <p className="p12p-problem">A grocery app, a bookstore app and a children's reading app.</p>
            <p className="p12p-result">Released to the App Store and Google Play.</p>
            <p className="p12p-scope">
              Built in React Native for iPhone and Android. Read to Feed alone had about 14 releases to both stores.
            </p>
          </div>
          <div className="p12p-phones">
            {phones.map((p) => (
              <Phone key={p.src} shot={p} height={600} />
            ))}
          </div>
          <p className="p12p-caption p12p-phones-caption">
            <span className="p12p-scale">Shown at phone size.</span> Screens from the public store listings. Read to Feed
            links go to archived copies.
          </p>
        </article>

        <article className="p12p-row" aria-labelledby="p12p-r4">
          <div className="p12p-row-text">
            <h3 id="p12p-r4">Design System v2</h3>
            <p className="p12p-meta">Vianova, 2026. Research and guides.</p>
            <p className="p12p-problem">The new care dashboard needed one shared set of building blocks.</p>
            <p className="p12p-result">20 releases in about six weeks.</p>
            <p className="p12p-scope">
              Gentrit did the research into five leading design systems and wrote the guides that came from it. A teammate
              wrote most of the building blocks.
            </p>
            <a className="p12p-action" href="/work/design-system-react">
              Read the case <Arrow />
            </a>
          </div>
          <figure className="p12p-row-fig p12p-row-fig-whole">
            <Shot shot={datePicker} wide={{ x: 0, y: 0 }} narrow={{ x: 176, y: 50 }} narrowHeight={384} work="Design System v2" className="p12p-ds-win" id="p12p-shot-ds" ground="#ffffff" />
            <Caption title="Date range picker." real measure="#p12p-shot-ds" total={780} />
          </figure>
        </article>
      </section>

      <section className="p12p-more" aria-labelledby="p12p-more-h">
        <h2 id="p12p-more-h" className="p12p-sec">
          More work
        </h2>
        <Index title="Other work" rows={otherWork} />
        <Index title="Own projects" rows={ownWork} />
      </section>

      <section className="p12p-about" aria-labelledby="p12p-about-h">
        <h2 id="p12p-about-h" className="p12p-sec">
          About
        </h2>
        <div className="p12p-about-text">
          <p>
            Gentrit Rashiti builds frontends and phone apps, and since 2026 also the server behind them. The work so far
            includes a care platform, a video-learning platform and apps in both stores. Gentrit works remotely from
            Kosovo and has a bachelor's degree from UBT.
          </p>
          <p>
            On the care platform rebuild, Gentrit wrote most of the rules and the checks. AI agents build inside them. A
            person approves each change.
          </p>
        </div>
      </section>

      <footer className="p12p-contact" aria-labelledby="p12p-contact-h">
        <h2 id="p12p-contact-h" className="p12p-sec">
          Contact
        </h2>
        <a className="p12p-email" href={`mailto:${shared.email}`}>
          {shared.email}
        </a>
        <p className="p12p-links">
          <a href={shared.cv} className="p12p-link">
            CV (PDF)
          </a>
          <ExternalLink href={shared.github}>GitHub</ExternalLink>
          <ExternalLink href={shared.linkedin}>LinkedIn</ExternalLink>
        </p>
        <p className="p12p-colophon">
          Gentrit Rashiti, 2026. Every web screen on this page is shown at actual size, and every phone screen at phone
          size.
        </p>
      </footer>
    </div>
  );
}
