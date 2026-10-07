/**
 * Every screen on this page is shown at actual size.
 * Web screens: the files hold 2× the app's CSS pixels, so the image is drawn at exactly the app's size
 * (a 2880 × 1800 file is drawn 1440 × 900) and a window crops it. Nothing is scaled to fit.
 * Phone screens: the app screen inside each store listing is drawn at phone width, 390 px.
 *
 * `wide` is the crop for screens of 960 px and up, `narrow` below that. Both are the app pixel
 * (x, y) that sits at the window's top-left corner.
 */

export interface WebShot {
  src: string;
  alt: string;
  /** The app's size in CSS pixels: half the file. */
  w: number;
  h: number;
}

export interface Crop {
  x: number;
  y: number;
}

export const REAL_SCREENS = "Real product screens, invented data.";

export const calendar: WebShot = {
  src: "/showcase/care-dashboard/appointments-week.webp",
  alt: "Care team calendar for the week of October 4 to 10, 2026: calls, video calls and office visits for each patient, such as a wound check, a lung function test and a glucose log review, with a red line at the current time. Invented data.",
  w: 1440,
  h: 900,
};

export const claims: WebShot = {
  src: "/showcase/care-dashboard/claims.webp",
  alt: "Claims for September 2026: counts by status, filters, and each claim with its patient, program, CPT codes, date of service and status, such as Finalized, Approved, Needs attention and Transfer failed. Invented data.",
  w: 1440,
  h: 900,
};

export const glucose: WebShot = {
  src: "/showcase/care-dashboard/rpm-overview-cgm.webp",
  alt: "Glucose for one patient: time in range, average, highest and lowest values, device usage, and the glucose curve for Monday, October 5, 2026. Invented data.",
  w: 1440,
  h: 900,
};

export const overview: WebShot = {
  src: "/showcase/care-dashboard/overview.webp",
  alt: "Care team dashboard: 24 patients by program, engagement by calls and text messages, and patients for each provider. Invented data.",
  w: 1440,
  h: 900,
};

export const bayyinah: WebShot = {
  src: "/showcase/bayyinah/web-03.webp",
  alt: "Bayyinah TV library on the web, Arabic tab: New to Arabic, with the courses Learn to Read Quran, Part 1 and Part 2.",
  w: 1440,
  h: 900,
};

export const datePicker: WebShot = {
  src: "/showcase/design-system/date-range-picker.webp",
  alt: "Design System v2 date range picker, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, and the Cancel and Apply buttons. Invented data.",
  w: 780,
  h: 488,
};

/** A phone screen cut out of a public store listing (780 × 1689 files). `box` is the app screen inside, in file pixels. */
export interface PhoneShot {
  src: string;
  alt: string;
  app: string;
  screen: string;
  box: { x: number; y: number; w: number; h: number };
  links: { label: string; href: string }[];
}

export const PHONE_WIDTH = 390;

export const phones: PhoneShot[] = [
  {
    src: "/mobile/grocery-1.webp",
    alt: "Viva Fresh home on iPhone, in Albanian: product categories, filters and the latest products with prices and an add-to-cart button.",
    app: "Viva Fresh",
    screen: "Categories and new products, in Albanian",
    box: { x: 88, y: 371, w: 604, h: 1227 },
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/viva-fresh/id1580739480" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh" },
    ],
  },
  {
    src: "/mobile/bookstore-1.webp",
    alt: "Dukagjini Bookstore home: book search, a banner, top categories and books on sale.",
    app: "Dukagjini Bookstore",
    screen: "Search and top categories",
    box: { x: 108, y: 712, w: 564, h: 977 },
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks" },
    ],
  },
  {
    src: "/mobile/reading-1.webp",
    alt: "Read to Feed, My Books: The Tale of Peter Rabbit and Anne of Green Gables with reading progress.",
    app: "Read to Feed",
    screen: "My Books",
    box: { x: 80, y: 532, w: 620, h: 1157 },
    links: [
      {
        label: "App Store (archived)",
        href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765",
      },
      {
        label: "Google Play (archived)",
        href: "https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf",
      },
    ],
  },
];

/** Image size and offset that put the listing's app screen at phone width. */
export function phoneFit(shot: PhoneShot) {
  const k = PHONE_WIDTH / shot.box.w;
  return {
    width: Math.round(780 * k * 10) / 10,
    height: Math.round(1689 * k * 10) / 10,
    left: -Math.round(shot.box.x * k * 10) / 10,
    top: -Math.round(shot.box.y * k * 10) / 10,
    screenHeight: Math.round(shot.box.h * k),
  };
}

export const links = {
  bayyinah: "https://bayyinahtv.com/",
  bayyinahAppStore: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769",
  bayyinahPlay: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah",
};
