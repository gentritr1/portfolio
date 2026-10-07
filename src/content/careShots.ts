/**
 * Real screens of the care dashboard and of Design System v2, captured on invented data.
 * Sizes and crops are in CSS pixels. Each file has twice these pixels, so a crop stays sharp
 * up to `crop.w` CSS pixels wide.
 */

export interface Px {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ScreenShot {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The part that a plate shows. */
  crop: Px;
  /** A cleaner image for the enlarged view, when the source carries tool chrome. */
  full?: { src: string; width: number; height: number };
  /** The screen's own colour, behind the shot while it loads. */
  ground: string;
}

export const REAL_SCREENS = "Real product screens, invented data.";

const OVERVIEW = "/showcase/care-dashboard/overview.webp";
const CLAIMS = "/showcase/care-dashboard/claims.webp";
const GLUCOSE = "/showcase/care-dashboard/rpm-overview-cgm.webp";
const WEEK = "/showcase/care-dashboard/appointments-week.webp";
const DATE_RANGE = "/showcase/design-system/date-range.webp";
const STATUS_BADGES = "/showcase/design-system/status-badges.webp";

const care = (src: string, alt: string, crop: Px): ScreenShot => ({
  src,
  alt,
  width: 1440,
  height: 900,
  crop,
  ground: "#f5f7fb",
});

const workshop = (src: string, alt: string, crop: Px): ScreenShot => ({
  src,
  alt,
  width: 1440,
  height: 900,
  crop,
  ground: "#ffffff",
  ...(src === DATE_RANGE && { full: { src: "/showcase/design-system/date-range-picker.webp", width: 780, height: 488 } }),
});

export const careShots = {
  /** The dashboard without the app menu. */
  overview: care(
    OVERVIEW,
    "Care team dashboard: patients by program, patient engagement by calls and text messages, and patients for each provider. Invented data.",
    { x: 236, y: 56, w: 1204, h: 786 },
  ),
  /** Both ring cards, for a wide plate. */
  overviewCards: care(
    OVERVIEW,
    "Care team dashboard: 24 patients by program, and patient engagement by calls and text messages. Invented data.",
    { x: 236, y: 148, w: 1204, h: 370 },
  ),
  /** One ring card, for a small tile. */
  patients: care(
    OVERVIEW,
    "Total patients ring: 24 patients, split into RPM, CCM and RTM programs. Invented data.",
    { x: 240, y: 198, w: 590, h: 314 },
  ),
  engagement: care(
    OVERVIEW,
    "Engagement ring: talk time, calls and text messages with patients. Invented data.",
    { x: 843, y: 198, w: 590, h: 314 },
  ),
  claims: care(
    CLAIMS,
    "Claims for one month: counts by status, filters for updated claims and claims that need attention, and each claim with its program, CPT codes and status. Invented data.",
    { x: 246, y: 160, w: 1194, h: 714 },
  ),
  claimsCounts: care(
    CLAIMS,
    "Claim counts by status, and the filters for updated claims and claims that need attention. Invented data.",
    { x: 256, y: 270, w: 776, h: 280 },
  ),
  /** Four claim rows: patient, program, CPT codes, date and status. */
  claimsRows: care(
    CLAIMS,
    "Four claims, each with its patient, program, CPT codes, date of service and status. One needs attention. Invented data.",
    { x: 262, y: 578, w: 940, h: 294 },
  ),
  glucose: care(
    GLUCOSE,
    "Glucose overview for one patient: time in range, average, highest and lowest values, device usage, one day's glucose curve, and the first row of the readings for the last seven days. Invented data.",
    { x: 236, y: 76, w: 1204, h: 810 },
  ),
  /** The values and one day's curve, without the readings table. */
  glucoseChart: care(
    GLUCOSE,
    "Glucose for one patient: time in range, average, highest and lowest values, device usage, and one day's glucose curve. Invented data.",
    { x: 247, y: 68, w: 1183, h: 674 },
  ),
  week: care(
    WEEK,
    "Care team calendar for one week: calls, video calls and office visits for each patient, filters for priority, status, type, assignee and patient, and a line at the current time. Invented data.",
    { x: 240, y: 70, w: 1200, h: 748 },
  ),
  /** Monday to Wednesday, 8 AM to 1 PM. */
  weekDays: care(
    WEEK,
    "Three days of the care team calendar, Monday to Wednesday, from 8 AM to 1 PM, with calls, visits and a line at the current time. Invented data.",
    { x: 248, y: 212, w: 702, h: 500 },
  ),
  /** Tuesday and Wednesday, for a phone. */
  weekTwoDays: care(
    WEEK,
    "Two days of the care team calendar, Tuesday and Wednesday, from 8 AM to 1 PM, with a line at the current time. Invented data.",
    { x: 630, y: 208, w: 321, h: 530 },
  ),
} satisfies Record<string, ScreenShot>;

export const dsShots = {
  /** The date range picker, open, with a range across two months. */
  dateRange: workshop(
    DATE_RANGE,
    "Design System v2 date range picker in its Storybook, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, the start and end dates as text, and Cancel and Apply buttons. Invented data.",
    { x: 4, y: 36, w: 780, h: 432 },
  ),
  /** The trigger, the presets and June, for a phone. */
  dateRangeJune: workshop(
    DATE_RANGE,
    "Design System v2 date range picker, open: the presets and June 2026, with the range that starts on June 22. Invented data.",
    { x: 8, y: 36, w: 476, h: 364 },
  ),
  /** One colour family for each status meaning. */
  statuses: workshop(
    STATUS_BADGES,
    "Design System v2 status badges in its Storybook: one colour family for each meaning, from Active and Approved to Pending approval, Rejected, Scheduled, Draft, Transferred and Prior episode.",
    { x: 8, y: 8, w: 444, h: 300 },
  ),
  /** June and July with the range, for a wide strip. */
  months: workshop(
    DATE_RANGE,
    "Design System v2 date range picker: June and July 2026 side by side, with a range from June 22 to July 9. Invented data.",
    { x: 176, y: 86, w: 594, h: 302 },
  ),
  /** The start and end dates as text, and the Cancel and Apply buttons, for a thin strip. */
  rangeActions: workshop(
    DATE_RANGE,
    "Design System v2 date range picker: the start and end dates as text, and the Cancel and Apply buttons. Invented data.",
    { x: 180, y: 390, w: 590, h: 60 },
  ),
} satisfies Record<string, ScreenShot>;
