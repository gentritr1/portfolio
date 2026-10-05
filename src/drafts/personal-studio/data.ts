export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * One way to frame a screen. `sw` and `sh` are the screen size in CSS pixels
 * (every file here is a 2x capture, so it is drawn at this size or smaller).
 * The frame shows the region of width `w` around (`cx`, `cy`); it is used
 * while the frame is at most `upTo` px wide. Crops with `upTo` at most 720
 * are the phone crops.
 */
export interface Crop {
  src: string;
  sw: number;
  sh: number;
  cx: number;
  cy: number;
  w: number;
  upTo: number;
  ring?: Box;
}

export interface View {
  id: string;
  label: string;
  line: string;
  alt: string;
  crops: Crop[];
  /** A tiny preview painted under the first screen until the file decodes. */
  fill?: string;
}

const shot = (name: string) => `/personal/shots/${name}.webp`;
const desk = { sw: 1440, sh: 900 };
const phone = { sw: 390, sh: 844 };

export const offday: View[] = [
  {
    id: "cover",
    label: "Shift cover",
    line: "Flags a shift when the person on it is on leave.",
    alt: "Offday Shifts week grid. Olivia Chen's Monday evening shift is flagged Needs cover because she is on vacation.",
    fill: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAGQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAGQAoAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQkJCQkJEAkJEBYQEBAWHhYWFhYeJh4eHh4eJi4mJiYmJiYuLi4uLi4uLjc3Nzc3N0BAQEBASEhISEhISEhISP/bAEMBCwwMEhESHxERH0szKjNLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//dAAQAA//aAAwDAQACEQMRAD8A9mUYctk59M8ULJP/AHR/31SquGJ96HYiIkEDpzQMmy1BLY5qsZH/AL46D+dKXkAPzDrQTcHkuPNQRorIfvNuwR9Bg5/OrO73qMMD0Oe1LQXc/9D2ZMbzzn2okYiInPcU8daVPuUAVy0gXdzj/wCv9aVjIiknIGf6/Wp1/wBZ+FJH/rD+NUQ0Mklih2mRtu5goz3J6Cpaa33hT6k0P//Z",
    crops: (() => {
      const src = shot("offday-light-shifts-desktop");
      const ring = { x: 489, y: 432, w: 165, h: 57 };
      return [
        { src, ...desk, cx: 461, cy: 461, w: 392, upTo: 420, ring },
        { src, ...desk, cx: 520, cy: 470, w: 508, upTo: 720, ring },
        { src, ...desk, cx: 706, cy: 590, w: 960, upTo: 99999, ring },
      ];
    })(),
  },
  {
    id: "dates",
    label: "Best dates",
    line: "Spend 3 days off, get a 6-day break. It finds the dates.",
    alt: "Offday Find the best dates: spend 3 days in the next 3 months, with breaks of 6 days around Veterans Day, Thanksgiving and Christmas.",
    crops: (() => {
      const src = shot("offday-light-best-dates-desktop");
      const ring = { x: 508, y: 512, w: 424, h: 54 };
      return [
        {
          src: shot("offday-light-best-dates-phone"),
          ...phone,
          cx: 195,
          cy: 655,
          w: 390,
          upTo: 390,
          ring: { x: 44, y: 636, w: 302, h: 56 },
        },
        { src, ...desk, cx: 720, cy: 540, w: 520, upTo: 720, ring },
        { src, ...desk, cx: 720, cy: 600, w: 960, upTo: 99999, ring },
      ];
    })(),
  },
  {
    id: "rest",
    label: "Time to rest",
    line: "Shows who has had no real break this year.",
    alt: "Offday team calendar for November with four days selected by a drag, public holidays, and the Time to rest card listing people with 25 days to use by 31 December.",
    crops: (() => {
      const src = shot("offday-light-drag-select-desktop");
      const ring = { x: 1140, y: 680, w: 268, h: 196 };
      return [
        { src, ...desk, cx: 1270, cy: 750, w: 343, upTo: 420, ring },
        { src, ...desk, cx: 1186, cy: 680, w: 508, upTo: 720, ring },
        { src, ...desk, cx: 960, cy: 590, w: 960, upTo: 99999, ring },
      ];
    })(),
  },
  {
    id: "assistant",
    label: "Assistant",
    line: "An AI assistant answers questions about the team.",
    alt: "Offday assistant beside the team calendar. Asked who is off next week, it answers that Sofia Martinez and Emma Davis are off.",
    crops: (() => {
      const src = shot("offday-light-assistant-desktop");
      const ring = { x: 1049, y: 376, w: 356, h: 106 };
      return [
        { src, ...desk, cx: 1222, cy: 395, w: 372, upTo: 420, ring },
        { src, ...desk, cx: 1186, cy: 440, w: 508, upTo: 720, ring },
        { src, ...desk, cx: 960, cy: 505, w: 960, upTo: 99999, ring },
      ];
    })(),
  },
];

/* OFFBEAT and FORM desktop plates are 800 x 660 at 1.0: each crop ends on whole parts of the screen. */

export const offbeat: View[] = [
  {
    id: "drums",
    label: "Drum machine",
    line: "Eight steps, four sounds, tempo and swing. It plays in the browser.",
    alt: "OFFBEAT sound studio: Find your groove, three presets, an eight-step grid for kick, snare, hi-hat and bass with step 5 playing, tempo, volume and a swing dial.",
    crops: (() => {
      const src = shot("offbeat-studio-desktop");
      const ring = { x: 694, y: 198, w: 652, h: 242 };
      return [
        { src, ...desk, cx: 982, cy: 345, w: 740, upTo: 720, ring },
        { src, ...desk, cx: 1000, cy: 355, w: 800, upTo: 99999, ring },
      ];
    })(),
  },
  {
    id: "speaker",
    label: "The speaker",
    line: "A 3D speaker. Drag it, or use the arrow keys, to turn it.",
    alt: "OFFBEAT home: a hot-orange portable speaker in 3D, a Drag to turn hint, a Look inside button and four finish swatches.",
    crops: [
      {
        src: shot("offbeat-phone"),
        ...phone,
        cx: 195,
        cy: 640,
        w: 390,
        upTo: 420,
        ring: { x: 24, y: 786, w: 112, h: 34 },
      },
      {
        src: shot("offbeat-home-desktop"),
        ...desk,
        cx: 1029,
        cy: 400,
        w: 664,
        upTo: 720,
        ring: { x: 702, y: 590, w: 112, h: 36 },
      },
      {
        src: shot("offbeat-home-desktop"),
        ...desk,
        cx: 1040,
        cy: 450,
        w: 800,
        upTo: 99999,
        ring: { x: 700, y: 590, w: 114, h: 36 },
      },
    ],
  },
  {
    id: "finish",
    label: "Four finishes",
    line: "Pick one of four finishes. The choice is kept in the browser.",
    alt: "OFFBEAT finish picker: Hot orange, Acid yellow (chosen), Chalk and After hours, a Save this finish button, and the speaker card in acid yellow.",
    crops: [
      {
        src: shot("offbeat-finish-desktop"),
        ...desk,
        cx: 440,
        cy: 390,
        w: 800,
        upTo: 99999,
        ring: { x: 60, y: 348, w: 552, h: 120 },
      },
    ],
  },
  {
    id: "inside",
    label: "Inside",
    line: "Pull it apart: the grille, two drivers and the body.",
    alt: "OFFBEAT By design: the speaker pulled apart into its grille, two drivers and the orange body, with a Together and Inside switch.",
    crops: (() => {
      const src = shot("offbeat-design-desktop");
      const ring = { x: 806, y: 374, w: 288, h: 184 };
      return [
        { src, ...desk, cx: 950, cy: 465, w: 540, upTo: 720, ring },
        { src, ...desk, cx: 990, cy: 460, w: 800, upTo: 99999, ring },
      ];
    })(),
  },
];

export const form: View[] = [
  {
    id: "copper",
    label: "Copper",
    line: "Drag a sculpture to turn it, and pick its material.",
    alt: "FORM home: a copper trefoil knot, three material swatches with copper chosen, and Reset view.",
    crops: [
      { src: shot("form-phone"), ...phone, cx: 195, cy: 668, w: 390, upTo: 420 },
      { src: shot("form-home-desktop"), ...desk, cx: 1040, cy: 470, w: 640, upTo: 720 },
      {
        src: shot("form-home-desktop"),
        ...desk,
        cx: 1020,
        cy: 500,
        w: 800,
        upTo: 99999,
        ring: { x: 1010, y: 772, w: 222, h: 58 },
      },
    ],
  },
  {
    id: "chrome",
    label: "Chrome",
    line: "Each one comes in copper, chrome or porcelain.",
    alt: "FORM home in chrome: the Orbit ring in chrome, with the chrome swatch chosen.",
    crops: (() => {
      const src = shot("form-chrome-desktop");
      return [
        { src, ...desk, cx: 1030, cy: 458, w: 570, upTo: 720 },
        { src, ...desk, cx: 1020, cy: 500, w: 800, upTo: 99999, ring: { x: 1010, y: 772, w: 222, h: 58 } },
      ];
    })(),
  },
  {
    id: "cast",
    label: "Cast a word",
    line: "Type a word and it becomes its own sculpture.",
    alt: "FORM word cast: the word velvet cast as a chrome Bloom sculpture with eight lobes, and its code number.",
    crops: (() => {
      const src = shot("form-cast-desktop");
      const ring = { x: 46, y: 50, w: 910, h: 60 };
      return [
        { src, ...desk, cx: 728, cy: 455, w: 470, upTo: 720 },
        { src, ...desk, cx: 510, cy: 398, w: 940, upTo: 99999, ring },
      ];
    })(),
  },
];

export const snaxx = {
  src: shot("snaxx-phone"),
  sw: 390,
  sh: 844,
  cx: 195,
  cy: 400,
  w: 390,
  upTo: 99999,
};

export interface Shot {
  src: string;
  sw: number;
  sh: number;
  cx: number;
  cy: number;
  w: number;
  bg: string;
}

export interface Figure {
  big: string;
  unit: string;
}

export interface ClientCard {
  name: string;
  what: string;
  result: string;
  role: string;
  years: string;
  slug: string;
  shot?: Shot;
  figure?: Figure;
  wide?: boolean;
}

const store = { sw: 389, sh: 845 };
const mobile = { sw: 390, sh: 844 };

export const clients: ClientCard[] = [
  {
    name: "Bayyinah TV",
    what: "A video-learning platform, rebuilt as a new app.",
    result: "34 pages. The same app runs on the web and in the iPhone and Android apps.",
    role: "Frontend, core team",
    years: "2023–26",
    slug: "bayyinah-tv",
    shot: { src: "/showcase/bayyinah/store-05.webp", ...store, cx: 194, cy: 610, w: 362, bg: "#5e1710" },
  },
  {
    name: "Care-management platform",
    what: "Remote patient care for many client organizations. Most screens are already rebuilt in React; a screen moves over only after it passes the same tests in both apps.",
    result: "One billing report went from 16 database requests to 2, and it no longer times out.",
    role: "Frontend, server side since 2026",
    years: "2023–26",
    slug: "care-platform",
    figure: { big: "16 → 2", unit: "database requests in one billing report. It no longer times out." },
    wide: true,
  },
  {
    name: "Viva Fresh",
    what: "A grocery app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores.",
    role: "Mobile",
    years: "2023",
    slug: "viva-fresh",
    shot: { src: "/mobile/grocery-1.webp", ...mobile, cx: 195, cy: 408, w: 340, bg: "#ee3a37" },
  },
  {
    name: "Read to Feed",
    what: "A reading app for children: books, quizzes and badges.",
    result: "About 14 updates shipped to both app stores.",
    role: "Mobile",
    years: "2022–25",
    slug: "read-to-feed",
    shot: { src: "/mobile/reading-3.webp", ...mobile, cx: 195, cy: 632, w: 340, bg: "#f7c948" },
  },
  {
    name: "Dukagjini Bookstore",
    what: "A publisher's bookshop app for iPhone and Android.",
    result: "Search, sales and checkout, live in both app stores.",
    role: "Mobile",
    years: "2021–22",
    slug: "dukagjini-bookstore",
    shot: { src: "/mobile/bookstore-1.webp", ...mobile, cx: 195, cy: 542, w: 340, bg: "#f7a5a2" },
  },
  {
    name: "Incentiv",
    what: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.",
    result: "Sign in with a passkey (no password) or a wallet.",
    role: "Frontend, the screens",
    years: "2024",
    slug: "incentiv",
    shot: { src: "/showcase/incentiv/web-03.webp", ...desk, cx: 437, cy: 452, w: 470, bg: "#121212" },
  },
  {
    name: "Design System v2",
    what: "Shared buttons, menus and forms for a new care dashboard.",
    result: "36 building blocks, released 20 times in about six weeks.",
    role: "Design system, with the team",
    years: "2026",
    slug: "design-system-react",
    figure: { big: "36", unit: "building blocks, 20 releases in about six weeks" },
  },
];
