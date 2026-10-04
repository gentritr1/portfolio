import { applyReviewPreferences } from "./preferences";

// Run before App's motion modules read the media-query preference.
// Vite removes this branch and its imports from production.
if (import.meta.env.DEV) applyReviewPreferences();
