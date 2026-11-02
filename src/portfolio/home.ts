/**
 * The refractive engine is the site's home (owner, 2026-10-30): `/` is the page and `/<slug>` each case. This file stays
 * small, because the app reads it before the first render to know which paths are the home's. OWN_SLUGS must match the
 * own products in products.ts; the featured cases come from projects.ts.
 */
export const OWN_SLUGS = ['offday', 'leakscan']
