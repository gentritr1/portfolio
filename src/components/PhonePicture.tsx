import type { ReactElement } from "react";

/**
 * The width of the smaller copy of each 2880 px desktop capture, saved next to it as `<name>-<width>.webp`.
 * Each width keeps 1.5 file pixels or more for each CSS pixel at the largest plate that a 480 px screen shows.
 */
const PHONE_WIDTHS: Record<string, number> = {
  "/showcase/care-dashboard/appointments-week.webp": 2160,
  "/showcase/care-dashboard/claims.webp": 1920,
  "/showcase/care-dashboard/overview.webp": 1920,
  "/showcase/care-dashboard/rpm-overview-cgm.webp": 1440,
  "/showcase/bayyinah/web-02.webp": 2160,
  "/showcase/bayyinah/web-05.webp": 1920,
  "/showcase/design-system/date-range.webp": 2160,
  "/showcase/incentiv/web-03.webp": 1920,
  "/personal/shots/offday-light-shifts-desktop.webp": 2160,
  "/personal/shots/offbeat-studio-desktop.webp": 960,
  "/personal/shots/form-studio-desktop.webp": 960,
};

/** The image, with the smaller copy of its file for phone screens. The `img` keeps the original `src`, because the plate hand-off matches pictures by it. */
export function PhonePicture({ src, children }: { src: string; children: ReactElement<"img"> }) {
  const width = PHONE_WIDTHS[src];
  if (!width) return children;
  return (
    <picture>
      <source media="(max-width: 480px)" srcSet={src.replace(/\.webp$/, `-${width}.webp`)} />
      {children}
    </picture>
  );
}
