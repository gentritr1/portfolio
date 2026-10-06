import { projects } from "../../content/projects";

/** The screen inside a store frame, as fractions of the image. */
export interface Screen {
  x: number;
  y: number;
  w: number;
  h: number;
}

const items: {
  slug: string;
  object: string;
  src: string;
  alt: string;
  screen?: Screen;
}[] = [
  {
    slug: "snaxx-tech",
    object: "Monitor",
    src: "/personal/shots/snaxx-desktop.webp",
    alt: "Snaxx Tech public studio website, the Snaxx Almanac",
  },
  {
    slug: "viva-fresh",
    object: "Phone",
    src: "/mobile/grocery-1.webp",
    screen: { x: 92 / 780, y: 300 / 1689, w: 596 / 780, h: 1300 / 1689 },
    alt: "Viva Fresh public app store frame",
  },
  {
    slug: "read-to-feed",
    object: "Book",
    src: "/mobile/reading-1.webp",
    screen: { x: 80 / 780, y: 540 / 1689, w: 620 / 780, h: 1149 / 1689 },
    alt: "Read to Feed public store frame showing its library",
  },
  {
    slug: "fjale",
    object: "Word card",
    src: "/personal/shots/fjale-desktop.webp",
    alt: "FJALË public Albanian word game",
  },
  {
    slug: "offday",
    object: "Calendar",
    src: "/personal/shots/offday-light-calendar-desktop.webp",
    alt: "Offday calendar screenshot with demonstration workspace data",
  },
];

export const objects = items.map((item) => ({
  ...item,
  project: projects.find((project) => project.slug === item.slug)!,
}));
