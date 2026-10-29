/** The product screens the production chapters and the case pages share, and the CSS crop variables that place them. */

export type Crop = [x: number, y: number, w: number, h: number]
export type Shot = { src: string; w: number; h: number; alt: string }

export const pct = (v: number) => `${+v.toFixed(3)}%`
export const cropVars = ({ w, h }: Shot, c: Crop | undefined, p = '') =>
  c
    ? { [`--${p}sw`]: pct((w / c[2]) * 100), [`--${p}sl`]: pct((-c[0] / c[2]) * 100), [`--${p}st`]: pct((-c[1] / c[3]) * 100), [`--${p}ar`]: `${c[2]} / ${c[3]}` }
    : { [`--${p}sw`]: '100%', [`--${p}sl`]: '0%', [`--${p}st`]: '0%', [`--${p}ar`]: `${w} / ${h}` }

export const shots = {
  landing: { src: '/showcase/bayyinah/web-01.webp', w: 2880, h: 1800, alt: 'Bayyinah TV landing page: Quran Studies Made Simple, with the app on a laptop, a monitor, a tablet and a phone' },
  courses: { src: '/showcase/bayyinah/web-02.webp', w: 2880, h: 1800, alt: 'Bayyinah TV course row with the live Ramadan 2026 course' },
  reader: { src: '/mobile/reading-3.webp', w: 780, h: 1689, alt: 'Read to Feed reader page, with its keep-reading prompt' },
  achievements: { src: '/mobile/reading-2.webp', w: 780, h: 1689, alt: 'Read to Feed achievements: eggs collected, badges and quizzes' },
  calendar: { src: '/showcase/care-dashboard/appointments-week.webp', w: 2880, h: 1800, alt: 'Care-team week calendar with appointments and filters' },
  matrix: { src: '/showcase/design-system/boards/xv/board-03.webp', w: 3200, h: 1740, alt: 'Real button variants and states, with the measured contrast of each label' },
  picker: { src: '/showcase/design-system/date-range-picker.webp', w: 1560, h: 976, alt: 'Date-range picker from the design system' },
  catalog: { src: '/mobile/grocery-2.webp', w: 780, h: 1689, alt: 'Viva Fresh catalog with product prices and cart controls' },
  cart: { src: '/mobile/grocery-3.webp', w: 780, h: 1689, alt: 'Viva Fresh cart with quantities and the checkout button' },
} satisfies Record<string, Shot>

/**
 * The screen each case opens on: the chapter's own main screen and crops, so "Read the case" lands on the picture it grew
 * from. The three products without a chapter use the chamber's sharp originals.
 */
export const LEADS: Record<string, { shot: Shot; crop?: Crop; phoneCrop?: Crop }> = {
  'bayyinah-tv': { shot: shots.landing, crop: [0, 0, 2880, 1420], phoneCrop: [40, 400, 1400, 1000] },
  'read-to-feed': { shot: shots.reader, crop: [82, 462, 616, 1227], phoneCrop: [82, 462, 616, 566] },
  'care-platform': { shot: shots.calendar, phoneCrop: [440, 380, 1100, 960] },
  'design-system-react': { shot: shots.matrix, crop: [1280, 145, 1780, 1430] },
  'viva-fresh': { shot: shots.catalog, crop: [88, 298, 604, 1308] },
  incentiv: { shot: { src: '/showcase/incentiv/web-03.webp', w: 2880, h: 1800, alt: 'Incentiv wallet dashboard' } },
  futurisma: { shot: { src: '/personal/shots/futurisma-frostline-1.webp', w: 2880, h: 1800, alt: 'Futurisma Frostline screen' } },
  'dukagjini-bookstore': { shot: { src: '/eh/dukagjini-bookstore.webp', w: 570, h: 1013, alt: 'Dukagjini Bookstore app screen' } },
  // The own products: cut above Offday's floating help buttons and after LeakScan's "Start here". Phones get four weeks of
  // the calendar and the score with its first fixes, near square, so the screen fills the first view and not the text.
  offday: { shot: { src: '/showcase/offday/offday-desktop-calendar.webp', w: 2880, h: 1800, alt: 'Offday team calendar for October 2026 with leave bars and the approvals queue' }, crop: [0, 0, 2880, 1520], phoneCrop: [534, 40, 1300, 1300] },
  leakscan: { shot: { src: '/showcase/leakscan/leakscan-desktop-report.webp', w: 2880, h: 1800, alt: 'LeakScan Full Scan report: health score 48 and the three critical fixes to start with' }, crop: [0, 0, 2880, 1520], phoneCrop: [640, 340, 1420, 1180] },
}
