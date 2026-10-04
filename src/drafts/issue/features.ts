export interface Plate {
  src: string;
  alt: string;
}

export interface Feature {
  slug: string;
  verb: string;
  ground: string;
  line: string;
  title: [string, string];
  deck: string;
  quote: string;
  caption: string;
  aspect: "web" | "phone";
  plates: Plate[];
  href: string;
}

/** Every ground keeps paper text at 4.5:1 or more. */
export const features: Feature[] = [
  {
    slug: "offday",
    verb: "Shipped.",
    ground: "#cf311c",
    line: "Time off, together.",
    title: ["Time off.", "Together."],
    deck: "Employee requests. Manager approvals. One team calendar, with drag-select to pick the dates.",
    quote: "16 security and tenant-isolation tests.",
    caption: "Team calendar · public capture",
    aspect: "web",
    plates: [
      {
        src: "/personal/shots/offday-dark-desktop.webp",
        alt: "Offday team calendar in dark theme, leave bars and approval queue",
      },
    ],
    href: "#iss-story",
  },
  {
    slug: "bayyinah-tv",
    verb: "Streamed.",
    ground: "#c93d17",
    line: "An entire platform.",
    title: ["An entire", "platform."],
    deck: "A video-learning platform, rebuilt on Nuxt 3 with live streams, realtime chat and an English and Arabic interface.",
    quote: "34 routes. More than 270 components.",
    caption: "Landing page · public website",
    aspect: "web",
    plates: [
      {
        src: "/showcase/bayyinah/web-01.webp",
        alt: "Bayyinah TV landing page: “Quran Studies Made Simple” hero with the app on a laptop, a monitor and phones",
      },
    ],
    href: "/work/bayyinah-tv",
  },
  {
    slug: "read-to-feed",
    verb: "Released.",
    ground: "#c42a26",
    line: "Reading, over time.",
    title: ["Reading,", "over time."],
    deck: "A children’s reading app for iOS and Android: books, barcode scanning, quizzes as chats, badges and streaks.",
    quote: "About 14 releases across four years.",
    caption: "Archived store frames",
    aspect: "phone",
    plates: [
      {
        src: "/mobile/reading-1.webp",
        alt: "Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
      },
      {
        src: "/mobile/reading-3.webp",
        alt: "Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot",
      },
    ],
    href: "/work/read-to-feed",
  },
  {
    slug: "dukagjini-bookstore",
    verb: "Published.",
    ground: "#bd2236",
    line: "The bookshop, on a phone.",
    title: ["The bookshop,", "on a phone."],
    deck: "A publisher’s shopping app for iOS and Android: search, categories, books on sale, favourite lists and promo-code checkout.",
    quote: "Push notifications open the right book.",
    caption: "Store frames · App Store",
    aspect: "phone",
    plates: [
      {
        src: "/mobile/bookstore-1.webp",
        alt: "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
      },
      {
        src: "/mobile/bookstore-2.webp",
        alt: "Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites",
      },
    ],
    href: "/work/dukagjini-bookstore",
  },
];

export const folio = (n: number) => String(n).padStart(2, "0");
export const leftFolio = (index: number) => 2 + index * 2;
export const storyFolio = leftFolio(features.length);
export const indexFolio = storyFolio + 2;
export const aboutFolio = indexFolio + 2;
