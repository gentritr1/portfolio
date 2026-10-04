import { projects } from "../../content/projects";
import names from "./sectors.json";
const colours = [
  "#F5C479",
  "#A9E5DB",
  "#90CEBC",
  "#DCB5FA",
  "#ADC8F2",
  "#F0BDB3",
  "#D4D68B",
];
const highlights: Record<string, string> = {
  "bayyinah-tv": "34 routes. English & Arabic. Live streams.",
  futurisma: "Seven circuits. Weather, tides and day–night systems.",
  "care-platform": "31 architecture decisions. Parity before cutover.",
  "care-api": "One billing report: 16 queries → 2.",
  fjale: "21,000 Albanian words. An archive. Offline play.",
  "morse-trainer": "Spaced repetition and Farnsworth timing.",
};
export const sectors = names.map((item, index) => {
  const project = projects.find((project) => project.slug === item.slug)!;
  return {
    ...item,
    project,
    colour: colours[index % colours.length],
    number: String(index + 1).padStart(2, "0"),
    fact: highlights[item.slug] ?? project.line,
  };
});
export type Sector = (typeof sectors)[number];
