export type Action = "org" | "unit" | "alert";
export type Unit = "mmHg" | "kPa";

export interface ScreenState {
  org: 0 | 1;
  unit: 0 | 1;
  alert: boolean;
}

export interface Org {
  name: string;
  short: string;
  patient: string;
  utc: string;
  sys: number[];
  dia: number[];
}

/* Invented data. The same organizations and readings as the site's vitals recreation. */
export const orgs: [Org, Org] = [
  {
    name: "Northwind Clinic",
    short: "Northwind",
    patient: "Patient 4821",
    utc: "UTC−5",
    sys: [128, 131, 126, 134, 129, 137, 133, 130, 142, 135, 131, 147, 138, 134],
    dia: [82, 84, 80, 86, 83, 88, 85, 83, 91, 87, 84, 94, 89, 86],
  },
  {
    name: "Harbor Health",
    short: "Harbor",
    patient: "Patient 2093",
    utc: "UTC−8",
    sys: [122, 125, 143, 129, 124, 127, 121, 126, 130, 128, 145, 133, 127, 124],
    dia: [78, 80, 92, 82, 79, 81, 77, 80, 83, 81, 95, 85, 82, 79],
  },
];

export const units: [Unit, Unit] = ["mmHg", "kPa"];
export const limit = { low: 90, high: 140 };

export function format(mmHg: number, unit: Unit) {
  return unit === "mmHg" ? String(mmHg) : (mmHg * 0.133322).toFixed(1);
}

export function alertsOf(org: Org) {
  return org.sys.flatMap((v, i) => (v > limit.high ? [i] : []));
}

export function latestAlert(org: Org) {
  const all = alertsOf(org);
  return all[all.length - 1];
}

export const scenarioOf = (action: Action, state: ScreenState) =>
  action === "org"
    ? "switch organization"
    : action === "unit"
      ? "toggle unit"
      : state.alert
        ? "close alert"
        : "open alert";

export const areas = [
  "Patient profile",
  "Care plans",
  "Labs and vitals",
  "Claims",
  "Calls",
  "Chat",
];

export const facts = [
  {
    text: "One billing report ran 16 queries and timed out",
    result: "2 queries",
  },
  {
    text: "Design System v2 under the React app: 36 components, 805 design tokens, 20 releases in about six weeks",
  },
  {
    text: "Many organizations share one system; each screen keeps their data apart and follows each user's role and timezone",
  },
  {
    text: "Four languages in one interface: English, German, Spanish and Turkish",
  },
];

export interface Work {
  slug: string;
  name: string;
  line: string;
  role: string;
  years: string;
  shot: { src: string; alt: string; w: number; h: number };
}

export const work: Work[] = [
  {
    slug: "bayyinah-tv",
    name: "Bayyinah TV",
    line: "Full Nuxt 3 rebuild: live streams, subscriptions, English/Arabic, 34 routes",
    role: "Frontend, core team",
    years: "2023–26",
    shot: {
      src: "/showcase/bayyinah/web-01.webp",
      alt: "Bayyinah TV landing page with the app on a laptop, a monitor and phones",
      w: 1440,
      h: 900,
    },
  },
  {
    slug: "read-to-feed",
    name: "Read to Feed",
    line: "About 14 releases to both stores; React Native 0.63 → 0.81",
    role: "Mobile, iOS and Android",
    years: "2022–25",
    shot: {
      src: "/mobile/thumbs/reading.webp",
      alt: "Read to Feed store screenshot: My Books list with reading progress",
      w: 256,
      h: 160,
    },
  },
  {
    slug: "incentiv",
    name: "Incentiv",
    line: "Smart-wallet dashboard: passkey sign-in, balance and QR, English and French",
    role: "Frontend, UI layer",
    years: "2024",
    shot: {
      src: "/showcase/incentiv/web-03.webp",
      alt: "Incentiv portal sign-in: Passkey, MetaMask and WalletConnect options",
      w: 1440,
      h: 900,
    },
  },
  {
    slug: "dukagjini-bookstore",
    name: "Dukagjini Bookstore",
    line: "Book shopping on iOS and Android: push deep links, animated details, checkout",
    role: "Mobile",
    years: "2021–22",
    shot: {
      src: "/mobile/thumbs/bookstore.webp",
      alt: "Dukagjini Bookstore store screenshot: foreign books list with ratings and prices",
      w: 256,
      h: 160,
    },
  },
  {
    slug: "offday",
    name: "Offday",
    line: "Multi-tenant time off with approvals and a team calendar; about 200 tests",
    role: "Owner",
    years: "2026",
    shot: {
      src: "/personal/shots/thumbs/offday-app.webp",
      alt: "Offday team calendar with October leave bars and approval queue",
      w: 256,
      h: 160,
    },
  },
];
