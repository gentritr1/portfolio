import { useRef, type CSSProperties } from "react";
import { BrowserFrame } from "../../components/BrowserFrame";
import { HEAD, HEAD_MS } from "./arrive";
import { CaseEnd, CaseTop, Chapter, NextCase, Ring } from "./CaseParts";
import { Slab } from "./Slab";
import { useReveal } from "./hooks";
import { Out } from "./icons";

const SITE = "bayyinahtv.com";

const listings = [
  { src: "/showcase/bayyinah/store-05.webp", alt: "Bayyinah TV App Store image: Pick Up Anytime, with the My Learning screen: hours watched, series watched, series in progress and each series with its progress bar." },
  { src: "/showcase/bayyinah/store-02.webp", alt: "Bayyinah TV App Store image: Study the Quran Surah by Surah, with the video player, the episode list and the list of surahs." },
];

const links = [
  { label: "Website", href: "https://bayyinahtv.com/" },
  { label: "App Store", href: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769" },
  { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" },
];

const facts = [
  { value: "270+", label: "reusable screen parts" },
  { value: "2", label: "languages: English, and Arabic read from right to left" },
  { value: "3", label: "ways to pay: on the web, through Apple, through Google" },
];

const stack = ["Nuxt 3", "Vue 3", "TypeScript", "Pinia", "video.js", "HLS", "AWS IVS", "Pusher", "Stripe", "Firebase", "Tailwind"];

const engineers = [
  "A full rebuild on Nuxt 3 from an empty template: 34 routes, 270+ components, 25 Pinia stores.",
  "video.js with HLS, a quality selector and a paywall for premium lessons.",
  "Live streams on AWS IVS, with a realtime chat over Pusher and moderation.",
  "Stripe on the web, and Apple and Google subscriptions in the apps. Gifts and promo codes.",
  "English and Arabic, with a right-to-left layout.",
  "The iPhone and Android apps run the same web app.",
];

export function BayyinahCase() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <article className="lp-case" ref={root}>
      <title>Bayyinah TV: one web app for web, iPhone and Android</title>
      <header className="lp-case-head" data-ground="" style={{ "--head": "#47262d" } as CSSProperties}>
        <CaseTop />
        <div className="lp-wrap lp-case-hero">
          <p className="lp-case-label">Bayyinah TV, 2023 to 2026</p>
          <h1 className="lp-case-title">One web app for the web, iPhone and Android.</h1>
          <div className="lp-case-side">
            <p className="lp-case-sentence">This platform has video lessons, live classes and subscriptions. Members study on a computer or on a phone.</p>
            <dl className="lp-facts">
              <div>
                <dt>Role</dt>
                <dd>Frontend, core team</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Live on the web, in the App Store and on Google Play.</dd>
              </div>
            </dl>
          </div>
        </div>
        <figure className="lp-wrap lp-case-shot">
          <Slab from={HEAD} ms={HEAD_MS}>
            <BrowserFrame
              src="/showcase/bayyinah/web-02.webp"
              alt="Bayyinah TV library, Subject tab: library tabs, search, filters and a row of course cards, one marked LIVE."
              label={SITE}
              site
              tone="dark"
              eager
            >
              <span className="room-sheen" aria-hidden="true" />
            </BrowserFrame>
          </Slab>
          <figcaption className="lp-caption">The library, a public page of bayyinahtv.com.</figcaption>
        </figure>
      </header>

      <Chapter
        name="What it does"
        title="Members study with video lessons and live classes."
        figure={
          <figure className="lp-figure">
            <BrowserFrame
              src="/showcase/bayyinah/web-05.webp"
              alt="Bayyinah TV series page: the list of series at the side, and three episode cards of Moses 2, each with its title, length and date."
              label={SITE}
              site
              tone="dark"
            >
              <Ring box={{ x: 356, y: 560, w: 314, h: 262 }} label="Each episode, with its length and date" side="left" above />
            </BrowserFrame>
            <figcaption className="lp-caption">A series page, public.</figcaption>
          </figure>
        }
      >
        <p>
          The platform has courses, video series, live classes and a scripture reader. Members keep their place in each course and pick up where
          they left off.
        </p>
      </Chapter>

      <Chapter
        name="The problem"
        title="Members are on the web, on iPhone and on Android."
        figure={
          <figure className="lp-figure">
            <BrowserFrame
              src="/showcase/bayyinah/web-06.webp"
              alt="Bayyinah TV pricing: Choose Your Plan, with a monthly and annual switch and the Premium plan with a 7-day free trial."
              label={SITE}
              site
              tone="dark"
            >
              <Ring box={{ x: 964, y: 104, w: 436, h: 616 }} label="Paid monthly or yearly" />
            </BrowserFrame>
            <figcaption className="lp-caption">The pricing page, public.</figcaption>
          </figure>
        }
      >
        <p>
          Members watch on a computer or on a phone. They pay on the web, or through Apple or Google in the apps. The whole site must also work in
          Arabic, which reads from right to left.
        </p>
      </Chapter>

      <Chapter
        name="What the team built"
        title="One web app, rebuilt from an empty template."
        figure={
          <figure className="lp-one">
            <div className="lp-one-web" data-reveal="">
              <BrowserFrame
                src="/showcase/bayyinah/web-03.webp"
                alt="Bayyinah TV library, Arabic tab: New to Arabic, two Learn to Read Quran courses, and the flagship Arabic program."
                label={SITE}
                site
                tone="dark"
              >
                <Ring box={{ x: 724, y: 160, w: 131, h: 40 }} label="Arabic courses" />
              </BrowserFrame>
              <p className="lp-one-tag">On the web</p>
            </div>
            <div className="lp-one-phones" data-reveal="">
              {listings.map((l) => (
                <img key={l.src} src={l.src} alt={l.alt} width={778} height={1690} loading="lazy" decoding="async" />
              ))}
              <p className="lp-one-tag">The same app on iPhone and Android</p>
            </div>
            <figcaption className="lp-caption">Left: a public page of the web app. Right: images from the App Store listing.</figcaption>
          </figure>
        }
      >
        <p>
          The core team rebuilt the web app on Nuxt 3, from an empty template. It added live classes with a live chat that moderators control, a
          video player that locks premium lessons, and gifts and promo codes.
        </p>
        <p>The iPhone and Android apps run the same web app. One web app serves all three places.</p>
      </Chapter>

      <Chapter
        name="What changed"
        title="A new web app, live in three places."
        figure={
          <div className="lp-changed lp-changed-top">
            <figure className="lp-big" data-reveal="">
              <p className="lp-big-num">
                <span className="lp-big-to">34</span>
              </p>
              <figcaption>Pages in the new web app, built from an empty template.</figcaption>
            </figure>
            <figure className="lp-counts" data-reveal="">
              <dl>
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="lp-links">
                {links.map((l) => (
                  <li key={l.href}>
                    <a className="lp-pill-link" href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                      <Out />
                    </a>
                  </li>
                ))}
              </ul>
            </figure>
          </div>
        }
      >
        <p>Bayyinah TV is live at bayyinahtv.com, in the App Store and on Google Play. Members pay by subscription, gift or promo code.</p>
      </Chapter>

      <CaseEnd
        stack={stack}
        engineers={engineers}
        next={<NextCase to="/drafts/the-loop/care-platform" name="Care platform" line="Rebuilding a live care platform, one tested screen at a time." />}
      />
    </article>
  );
}
