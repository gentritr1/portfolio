import { findProject } from "../../content/projects";

export interface Crop {
  src: string;
  alt: string;
  /** Source size in pixels. */
  width: number;
  height: number;
  /** The shown part, in source pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Link {
  label: string;
  href: string;
}

export interface Row {
  slug: string;
  title: string;
  /** The problem, or what shipped. 12 words or fewer. */
  line: string;
  /** The result. 10 words or fewer. The largest text in the row. */
  result: string;
  role: string;
  year: string;
  links: Link[];
  /** A made-up product, built as a portfolio piece. */
  concept?: boolean;
  plate?: { wide: Crop; phone: Crop; caption: string };
}

const publicLinks = (slug: string): Link[] =>
  (findProject(slug)?.links ?? []).map(({ label, href }) => ({
    label,
    href,
  }));

const caseLink = (slug: string): Link => ({
  label: "Read the case",
  href: `/work/${slug}`,
});

export const rows: Row[] = [
  {
    slug: "bayyinah-tv",
    title: "Bayyinah TV",
    line: "A video-learning platform, rebuilt from an empty page.",
    result: "Members subscribe on the web, iPhone or Android.",
    role: "Frontend, core team",
    year: "2023–26",
    links: [caseLink("bayyinah-tv"), ...publicLinks("bayyinah-tv")],
  },
  {
    slug: "care-platform",
    title: "Care-management platform",
    line: "A screen moves over only after it passes the same tests in both apps.",
    result: "Most screens are already rebuilt in React.",
    role: "Frontend, core team",
    year: "2023–26",
    links: [caseLink("care-platform")],
  },
  {
    slug: "care-api",
    title: "Care platform, server side",
    line: "One billing report asked the database 16 times and gave up.",
    result: "Now it asks 2 times and finishes.",
    role: "Full stack",
    year: "2026",
    links: [caseLink("care-platform")],
  },
  {
    slug: "design-system-react",
    title: "Design System v2",
    line: "Colours, sizes and type are set once, for code and Figma.",
    result: "36 building blocks, released 20 times in about six weeks.",
    role: "Design system",
    year: "2026",
    links: [caseLink("design-system-react")],
  },
  {
    slug: "read-to-feed",
    title: "Read to Feed",
    line: "A reading app for children. Books open inside the app.",
    result: "About 14 updates shipped to both app stores.",
    role: "Mobile, iOS and Android",
    year: "2022–25",
    links: [caseLink("read-to-feed"), ...publicLinks("read-to-feed")],
  },
  {
    slug: "viva-fresh",
    title: "Viva Fresh",
    line: "A grocery app with delivery slots, loyalty and a map.",
    result: "Built once for iPhone and Android.",
    role: "Mobile",
    year: "2023",
    links: [caseLink("viva-fresh"), ...publicLinks("viva-fresh")],
  },
  {
    slug: "incentiv",
    title: "Incentiv",
    line: "Sign-in and dashboard screens for a crypto wallet.",
    result: "Sign in with a passkey (no password) or a wallet.",
    role: "Frontend. Teammates built the wallet.",
    year: "2024",
    links: [caseLink("incentiv"), ...publicLinks("incentiv")],
  },
  {
    slug: "offbeat",
    title: "OFFBEAT",
    line: "A speaker brand that does not exist, made to try 3D and sound.",
    result: "An eight-step drum machine that plays and saves a loop.",
    role: "Own project",
    year: "2026",
    concept: true,
    links: publicLinks("offbeat"),
    plate: {
      caption: "OFFBEAT sound studio while it plays.",
      wide: {
        src: "/personal/shots/offbeat-studio-desktop.webp",
        alt: "OFFBEAT sound studio: an eight-step drum machine with kick, snare, hi-hat and bass rows, step 5 playing in red, tempo, volume and a swing dial",
        width: 2880,
        height: 1800,
        x: 1200,
        y: 96,
        w: 1536,
        h: 1416,
      },
      phone: {
        src: "/personal/shots/offbeat-phone.webp",
        alt: "OFFBEAT home on a phone: Plays your songs. Makes its own. above the orange speaker in 3D",
        width: 780,
        height: 1688,
        x: 0,
        y: 0,
        w: 780,
        h: 1520,
      },
    },
  },
  {
    slug: "form",
    title: "FORM",
    line: "A sculpture show that does not exist, drawn live in the browser.",
    result: "Three sculptures you turn, in copper, chrome or porcelain.",
    role: "Own project",
    year: "2026",
    concept: true,
    links: publicLinks("form"),
    plate: {
      caption: "FORM: the copper trefoil and its three materials.",
      wide: {
        src: "/personal/shots/form-home-desktop.webp",
        alt: "FORM: a copper trefoil knot sculpture, with copper, chrome and porcelain swatches and the note Drag to turn. Arrow keys work, too.",
        width: 2880,
        height: 1800,
        x: 1464,
        y: 288,
        w: 1360,
        h: 1440,
      },
      phone: {
        src: "/personal/shots/form-phone.webp",
        alt: "FORM home on a phone: Objects of imagination. above the copper trefoil",
        width: 780,
        height: 1688,
        x: 0,
        y: 120,
        w: 780,
        h: 1520,
      },
    },
  },
  {
    slug: "offday",
    title: "Offday",
    line: "Time off for teams: requests, approvals and one shared calendar.",
    result: "The whole team's time off on one calendar.",
    role: "Own project",
    year: "2026",
    links: [],
    plate: {
      caption: "Offday team calendar, light theme, demo data.",
      wide: {
        src: "/personal/shots/offday-light-calendar-desktop.webp",
        alt: "Offday team calendar for October 2026: Your team, in sync, with one person out today, three pending requests and leave bars on the month grid",
        width: 2880,
        height: 1800,
        x: 492,
        y: 204,
        w: 1764,
        h: 1596,
      },
      phone: {
        src: "/personal/shots/offday-light-calendar-phone.webp",
        alt: "Offday team calendar on a phone, with the request button, team counts and October leave bars",
        width: 780,
        height: 1688,
        x: 0,
        y: 0,
        w: 780,
        h: 1520,
      },
    },
  },
];

/** The same rows as a 2021 data model, with its own field names. */
export interface OldRow {
  project_title: string;
  description: string;
  outcome: string;
  position: string;
  period: string;
}

export const oldRows: OldRow[] = rows.map((row) => ({
  project_title: row.title,
  description: row.line,
  outcome: row.result,
  position: row.role,
  period: row.year,
}));

export const breakIndex = 1;
export const brokenTitle = (title: string) => title.replace("-", " ");

/** Compares one row of the 2021 model with the row of today. */
export function check(index: number, broken: boolean) {
  const old = oldRows[index];
  const now = rows[index];
  const title = broken && index === breakIndex ? brokenTitle(old.project_title) : old.project_title;
  return (
    title === now.title &&
    old.description === now.line &&
    old.outcome === now.result &&
    old.position === now.role &&
    old.period === now.year
  );
}
