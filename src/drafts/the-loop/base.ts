const DRAFT = "/drafts/the-loop";

export function routePath(): string {
  const path = import.meta.env.VITE_ROUTER === "hash" ? window.location.hash.slice(1) || "/" : window.location.pathname;
  return path.replace(/[?#].*$/, "");
}

/** The page serves at the site root and, for the drafts gallery, under its draft path. */
export function loopBase(pathname = routePath()): string {
  return pathname === DRAFT || pathname.startsWith(`${DRAFT}/`) ? DRAFT : "";
}

export function loopHref(slug?: string): string {
  const base = loopBase();
  return slug ? `${base}/${slug}` : base || "/";
}
