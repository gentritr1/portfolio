import type { ReactElement } from "react";

/**
 * Desktop captures with a 1080 px copy saved next to them as `<name>-1080.webp`.
 * The frames always show the whole capture, so on a screen up to 640 px wide the copy keeps
 * 1.5 file pixels or more for each CSS pixel of the screen it fills.
 */
const PHONE_COPIES = new Set([
  "/showcase/care-dashboard/appointments-week.webp",
  "/showcase/care-dashboard/claims.webp",
  "/showcase/care-dashboard/overview.webp",
  "/showcase/care-dashboard/rpm-overview-cgm.webp",
  "/showcase/bayyinah/web-01.webp",
  "/showcase/bayyinah/web-02.webp",
  "/showcase/bayyinah/web-03.webp",
  "/showcase/bayyinah/web-04.webp",
  "/showcase/bayyinah/web-05.webp",
  "/showcase/bayyinah/web-06.webp",
  "/showcase/design-system/date-range.webp",
  "/showcase/design-system/storybook-from-to.webp",
  "/showcase/incentiv/web-03.webp",
  "/personal/shots/offday-light-shifts-desktop.webp",
  "/personal/shots/offbeat-studio-desktop.webp",
  "/personal/shots/form-studio-desktop.webp",
  "/personal/shots/za-table-two-seats.webp",
]);

/** The image, with the smaller copy of its file for phone screens. The `img` keeps the original `src`, because the plate hand-off matches pictures by it. */
export function PhonePicture({ src, children }: { src: string; children: ReactElement<"img"> }) {
  if (!PHONE_COPIES.has(src)) return children;
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={src.replace(/\.webp$/, "-1080.webp")} />
      {children}
    </picture>
  );
}
