import { projects, type Project } from "../../content/projects";

// A local migration model of this portfolio. These are not care-platform routes.
export interface LegacyProject {
  project_id: string;
  project_title: string;
  description: string;
  project_role: string;
  technologies: string[];
  public_links: [string, string][];
}

export type ParityField =
  "title" | "description" | "role" | "technologies" | "links";
export interface ParityResult {
  slug: string;
  passed: boolean;
  fields: { name: ParityField; passed: boolean }[];
}

export const legacyProjects: LegacyProject[] = projects.map((project) => ({
  project_id: project.slug,
  project_title: project.name,
  description: project.summary,
  project_role: project.role,
  technologies: [...project.stack],
  public_links: project.links.map((link) => [link.label, link.href]),
}));

export const driftedTitle = (title: string) => title.replace("-", " ");

export function checkParity(
  legacy: LegacyProject,
  current: Project,
  mismatch = false,
): ParityResult {
  const fields: ParityResult["fields"] = [
    {
      name: "title",
      passed:
        (mismatch
          ? driftedTitle(legacy.project_title)
          : legacy.project_title) === current.name,
    },
    { name: "description", passed: legacy.description === current.summary },
    { name: "role", passed: legacy.project_role === current.role },
    {
      name: "technologies",
      passed:
        JSON.stringify(legacy.technologies) === JSON.stringify(current.stack),
    },
    {
      name: "links",
      passed:
        JSON.stringify(legacy.public_links) ===
        JSON.stringify(current.links.map((link) => [link.label, link.href])),
    },
  ];
  return {
    slug: current.slug,
    passed: fields.every((field) => field.passed),
    fields,
  };
}
