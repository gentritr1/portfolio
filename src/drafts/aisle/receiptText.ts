import { links } from "../../content/links";
import type { Project } from "../../content/projects";

export interface ReceiptItem {
  project: Project;
  fact: { value: string; label: string };
}

export function receiptText(items: ReceiptItem[], date: Date): string {
  return [
    "GENTRIT RASHITI — SELECTED WORK",
    "Web · Mobile · Full stack",
    "Kosovo · Working remotely",
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Belgrade",
      dateStyle: "long",
    }).format(date),
    "",
    ...items.flatMap((item, index) => [
      String(index + 1).padStart(2, "0") + " / " + item.project.name,
      (item.project.years ?? "Independent work") + " / " + item.project.role,
      item.fact.value + " " + item.fact.label,
      item.project.line,
      "Technology: " + item.project.stack.join(", "),
      ...item.project.links.map((link) => link.label + ": " + link.href),
      "",
    ]),
    "TOTAL: " + items.length + " projects",
    "5+ years, from first screen to release.",
    links.email,
    links.github,
    links.linkedin,
  ].join("\n");
}
