import { useRef, type CSSProperties } from "react";
import { CaseEnd, CaseTop, Chapter, NextCase } from "./CaseParts";
import { Flap } from "./Flap";
import { useReveal } from "./hooks";
import { Out } from "./icons";
import { loopHref } from "./base";

const STORE = "/showcase/civiclee/";

const listings = [
  { src: `${STORE}store-start.webp`, alt: "CivicLee App Store image: Start your journey with ease, with the start screen and a Let's do it button." },
  { src: `${STORE}store-home.webp`, alt: "CivicLee App Store image: Your coaching hub at a glance, with the home screen and one card for each week, three of them marked Completed." },
  { src: `${STORE}store-week-1.webp`, alt: "CivicLee App Store image: Track and complete your goals effortlessly, with the Week 1 screen: a worksheet, two videos, the week's action steps and office hours." },
  { src: `${STORE}store-week-2.webp`, alt: "CivicLee App Store image: Meet deadlines with ease, with the Week 2 screen and a deadline note under the week's action steps." },
  { src: `${STORE}store-chat.webp`, alt: "CivicLee App Store image: Connect and grow together, with a cohort group chat." },
];

const links = [
  { label: "App Store", href: "https://apps.apple.com/us/app/civiclee/id1496597338" },
  { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.educationalequity.rosie" },
];

const facts = [
  { value: "2", label: "stores: the App Store and Google Play" },
  { value: "1", label: "React Native app for iPhone and Android" },
  { value: "2022", label: "the year the app started, from an empty template" },
];

const stack = ["React Native", "Redux Toolkit", "React Navigation", "Reanimated", "Expo AV", "Firebase Messaging"];

const engineers = [
  "Started on 5 September 2022 from an empty React Native template: sign-in, sign-up with a confirmation code, and onboarding in steps.",
  "Tasks come in weekly sequences, in order. A parent task groups smaller tasks, and a feedback task sends work to the coach.",
  "Worksheets have their own navigation stack. Articles open in a reader, and podcasts play on Expo AV with a forked library for one missing callback.",
  "Push notifications through Firebase Cloud Messaging. The device token is refreshed at each sign-in.",
  "Teammates added the chat, cohorts, town halls and the inbox.",
];

export function CivicleeCase() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <article className="lp-case" ref={root}>
      <title>CivicLee: a coaching app for iPhone and Android</title>
      <header className="lp-case-head" data-ground="" style={{ "--head": "#1d2a4a" } as CSSProperties}>
        <CaseTop />
        <div className="lp-wrap lp-case-hero">
          <p className="lp-case-label">CivicLee, 2022 to 2024</p>
          <h1 className="lp-case-title">A coaching app that takes members through their program, week by week.</h1>
          <div className="lp-case-side">
            <p className="lp-case-sentence">Members of a leadership program use this app to do each week's tasks and to talk to their coach.</p>
            <dl className="lp-facts">
              <div>
                <dt>Role</dt>
                <dd>Mobile. Started the app and built most of its screens.</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>On the App Store and Google Play, open to program members.</dd>
              </div>
            </dl>
          </div>
        </div>
        <figure className="lp-wrap lp-case-shot">
          <div className="lp-store-row" data-reveal="">
            {listings.map((l, i) => (
              <img key={l.src} src={l.src} alt={l.alt} width={1242} height={2208} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
            ))}
          </div>
          <figcaption className="lp-caption">The five images of the App Store listing.</figcaption>
        </figure>
      </header>

      <Chapter name="What it does" title="One week at a time, with a coach.">
        <p>
          The program is split into weeks. Each week has its own tasks: worksheets, short videos, tips, action steps and office hours. A deadline
          shows on the task it belongs to, and members send their work to their coach for feedback.
        </p>
      </Chapter>

      <Chapter name="What the team built" title="A new app, from an empty template.">
        <p>
          The app started in September 2022 from an empty React Native template. The first screens were sign-in, sign-up with a confirmation code
          and onboarding in steps. Then came the weekly tasks, worksheets, an article reader, a podcast player, video and push notifications.
        </p>
        <p>Teammates later added the chat, cohorts, town halls and an inbox.</p>
      </Chapter>

      <Chapter
        name="What changed"
        title="One app on both stores."
        figure={
          <div className="lp-changed lp-changed-top">
            <figure className="lp-big" data-reveal="">
              <p className="lp-big-num">
                <span className="lp-big-to">
                  <Flap value="26" />
                </span>
              </p>
              <figcaption>Screens in the app, from sign-up to the coach chat.</figcaption>
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
        <p>Version 2 of the app came to the App Store in March 2024. Only members who registered for the program can sign in.</p>
      </Chapter>

      <CaseEnd
        stack={stack}
        engineers={engineers}
        next={<NextCase to={loopHref("care-platform")} name="Care platform" line="Rebuilding a care platform that teams use every day, one tested screen at a time." />}
      />
    </article>
  );
}
