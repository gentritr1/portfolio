export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * One way to frame a screen. `sw` and `sh` are the screen size in CSS pixels
 * (the file is drawn at this size or smaller, never larger). The frame shows
 * the region of width `w` around (`cx`, `cy`); it is used while the frame is
 * at most `upTo` px wide.
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
}

const shot = (name: string) => `/personal/shots/${name}.webp`;
const offdayDesk = { sw: 1440, sh: 900 };
const offdayPhone = { sw: 390, sh: 844 };
const flat = { sw: 1440, sh: 900 };
const phone375 = { sw: 375, sh: 812 };

export const offday: View[] = [
  {
    id: "cover",
    label: "Shift cover",
    line: "Flags a shift when the person on it is on leave.",
    alt: "Offday Shifts week grid. Olivia Chen's Monday evening shift is flagged Needs cover because she is on vacation.",
    crops: (() => {
      const src = shot("offday-light-shifts-desktop");
      const ring = { x: 489, y: 432, w: 165, h: 57 };
      return [
        { src, ...offdayDesk, cx: 461, cy: 461, w: 392, upTo: 420, ring },
        { src, ...offdayDesk, cx: 520, cy: 470, w: 508, upTo: 720, ring },
        { src, ...offdayDesk, cx: 706, cy: 590, w: 960, upTo: 99999, ring },
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
          ...offdayPhone,
          cx: 195,
          cy: 655,
          w: 390,
          upTo: 390,
          ring: { x: 44, y: 636, w: 302, h: 56 },
        },
        { src, ...offdayDesk, cx: 720, cy: 540, w: 520, upTo: 720, ring },
        { src, ...offdayDesk, cx: 720, cy: 600, w: 960, upTo: 99999, ring },
      ];
    })(),
  },
  {
    id: "rest",
    label: "Time to rest",
    line: "Shows who has had no real break.",
    alt: "Offday team calendar for November with four days selected by a drag, public holidays, and the Time to rest card listing people with 25 days to use by 31 December.",
    crops: (() => {
      const src = shot("offday-light-drag-select-desktop");
      const ring = { x: 1140, y: 680, w: 268, h: 196 };
      return [
        { src, ...offdayDesk, cx: 1270, cy: 750, w: 343, upTo: 420, ring },
        { src, ...offdayDesk, cx: 1186, cy: 680, w: 508, upTo: 720, ring },
        { src, ...offdayDesk, cx: 960, cy: 590, w: 960, upTo: 99999, ring },
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
        { src, ...offdayDesk, cx: 1222, cy: 395, w: 372, upTo: 420, ring },
        { src, ...offdayDesk, cx: 1186, cy: 440, w: 508, upTo: 720, ring },
        { src, ...offdayDesk, cx: 960, cy: 505, w: 960, upTo: 99999, ring },
      ];
    })(),
  },
];

export const offbeat: View[] = [
  {
    id: "drums",
    label: "Drum machine",
    line: "Eight steps, four sounds, tempo and swing. It plays in the browser.",
    alt: "OFFBEAT sound studio: an eight-step drum machine with kick, snare, hi-hat and bass rows, tempo, volume and a swing dial.",
    crops: (() => {
      const src = shot("offbeat-studio-desktop");
      return [
        { src, ...flat, cx: 821, cy: 546, w: 402, upTo: 420, ring: { x: 694, y: 486, w: 326, h: 218 } },
        { src, ...flat, cx: 848, cy: 540, w: 508, upTo: 720, ring: { x: 694, y: 486, w: 405, h: 218 } },
        { src, ...flat, cx: 1015, cy: 497, w: 850, upTo: 886, ring: { x: 694, y: 486, w: 650, h: 218 } },
        { src, ...flat, cx: 915, cy: 497, w: 1050, upTo: 1055, ring: { x: 694, y: 486, w: 650, h: 218 } },
        { src, ...flat, cx: 720, cy: 530, w: 1326, upTo: 99999, ring: { x: 694, y: 486, w: 650, h: 218 } },
      ];
    })(),
  },
  {
    id: "speaker",
    label: "The speaker",
    line: "A 3D speaker that turns by drag or arrow keys, in four finishes.",
    alt: "OFFBEAT home: a hot-orange portable speaker in 3D with four finish swatches and the line Plays your songs. Makes its own.",
    crops: (() => {
      const src = shot("offbeat-home-desktop");
      const ring = { x: 1068, y: 672, w: 200, h: 52 };
      return [
        { src: shot("offbeat-phone"), ...phone375, cx: 187, cy: 610, w: 375, upTo: 375 },
        { src, ...flat, cx: 1040, cy: 500, w: 508, upTo: 720, ring },
        { src, ...flat, cx: 720, cy: 466, w: 1296, upTo: 1055, ring },
        { src, ...flat, cx: 720, cy: 490, w: 1368, upTo: 99999, ring },
      ];
    })(),
  },
  {
    id: "inside",
    label: "Inside",
    line: "Pull it apart: two drivers, a dial and three keys.",
    alt: "OFFBEAT By design: the speaker pulled apart into its grille, two drivers and the body.",
    crops: (() => {
      const src = shot("offbeat-design-desktop");
      const ring = { x: 812, y: 376, w: 276, h: 180 };
      return [
        { src, ...flat, cx: 950, cy: 470, w: 400, upTo: 420, ring },
        { src, ...flat, cx: 950, cy: 470, w: 508, upTo: 720, ring },
        { src, ...flat, cx: 720, cy: 466, w: 1296, upTo: 1055, ring },
        { src, ...flat, cx: 720, cy: 505, w: 1326, upTo: 99999, ring },
      ];
    })(),
  },
];

export const form: View = {
  id: "form",
  label: "FORM",
  line: "",
  alt: "FORM home: a copper trefoil knot sculpture beside the title Objects of imagination.",
  crops: [
    { src: shot("form-phone"), ...phone375, cx: 187, cy: 650, w: 375, upTo: 375 },
    { src: shot("form-home-desktop"), ...flat, cx: 1060, cy: 455, w: 700, upTo: 720 },
    { src: shot("form-home-desktop"), ...flat, cx: 1060, cy: 452, w: 648, upTo: 99999 },
  ],
};

export const snaxx: View = {
  id: "snaxx",
  label: "Snaxx Tech",
  line: "",
  alt: "Snaxx Tech studio site hero: The Snaxx Almanac, an illustrated landscape with the Useful Apps Workshop and the Game Portal.",
  crops: [
    { src: shot("snaxx-desktop"), ...flat, cx: 770, cy: 580, w: 343, upTo: 420 },
    { src: shot("snaxx-desktop"), ...flat, cx: 700, cy: 430, w: 700, upTo: 720 },
    { src: shot("snaxx-desktop"), ...flat, cx: 760, cy: 410, w: 648, upTo: 99999 },
  ],
};

export interface ClientRow {
  name: string;
  what: string;
  result: string;
  role: string;
  years: string;
  slug: string;
}

export const clients: ClientRow[] = [
  {
    name: "Bayyinah TV",
    what: "A video-learning platform, built again as a new app: 34 pages.",
    result: "Members subscribe on the web, iPhone or Android.",
    role: "Frontend, core team",
    years: "2023–26",
    slug: "bayyinah-tv",
  },
  {
    name: "Care-management platform",
    what: "Remote patient care for many client organizations. Most screens are already rebuilt in React.",
    result: "A billing report that timed out: 16 database requests, now 2.",
    role: "Frontend, server side since 2026",
    years: "2023–26",
    slug: "care-platform",
  },
  {
    name: "Read to Feed",
    what: "A reading app for children. Books open inside the app.",
    result: "About 14 updates shipped to both app stores.",
    role: "Mobile",
    years: "2022–25",
    slug: "read-to-feed",
  },
  {
    name: "Viva Fresh",
    what: "A grocery app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores.",
    role: "Mobile",
    years: "2023",
    slug: "viva-fresh",
  },
  {
    name: "Incentiv",
    what: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.",
    result: "Sign in with a passkey (no password) or a wallet.",
    role: "Frontend, the screens",
    years: "2024",
    slug: "incentiv",
  },
  {
    name: "Dukagjini Bookstore",
    what: "A publisher's bookshop app for iPhone and Android.",
    result: "Search, sales and checkout, live in both app stores.",
    role: "Mobile",
    years: "2021–22",
    slug: "dukagjini-bookstore",
  },
  {
    name: "Design System v2",
    what: "Shared buttons, menus and forms for a new care dashboard.",
    result: "36 building blocks, released 20 times in about six weeks.",
    role: "Design system, with the team",
    years: "2026",
    slug: "design-system-react",
  },
];
