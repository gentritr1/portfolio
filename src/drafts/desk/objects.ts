import { projects } from "../../content/projects";

export const objects = [
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
    alt: "Viva Fresh public app store frame",
  },
  {
    slug: "read-to-feed",
    object: "Book",
    src: "/mobile/reading-1.webp",
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
    src: "/personal/shots/offday-app-desktop.webp",
    alt: "Offday calendar screenshot with demonstration workspace data",
  },
].map((item) => ({
  ...item,
  project: projects.find((project) => project.slug === item.slug)!,
}));
