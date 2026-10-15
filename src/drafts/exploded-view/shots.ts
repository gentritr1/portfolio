/**
 * Real product screens for each case, from the files already in public/ (the same screens other drafts use).
 * Care-platform screens ran on a local mock API with invented data; the store frames are the public listings.
 */
export interface Shot {
  src: string
  alt: string
  width: number
  height: number
  /** A phone screen (portrait store frame) rather than a desktop screen. */
  phone?: boolean
  caption?: string
}

const desk = (src: string, alt: string, caption?: string, width = 1080, height = 675): Shot => ({ src, alt, width, height, caption })
const phone = (src: string, alt: string, caption?: string): Shot => ({ src, alt, width: 780, height: 1689, phone: true, caption })

/** A short name for each case: the case page leads with it, and the question follows. */
export const caseNames: Record<string, string> = {
  'care-platform': 'Care platform rewrite',
  'design-system-react': 'Design System v2',
  'multi-tenant': 'Care platform tenants',
  'read-to-feed': 'Read to Feed',
  'bayyinah-tv': 'Bayyinah TV',
  futurisma: 'Futurisma',
  incentiv: 'Incentiv',
  'viva-fresh': 'Viva Fresh',
  'dukagjini-bookstore': 'Dukagjini Bookstore',
}

export const caseShots: Record<string, Shot[]> = {
  'care-platform': [
    desk('/showcase/care/old-new/old-compliance-1080.webp', 'The compliance list in the old Vue app, whole screen. Invented data.', 'Before: the Vue app'),
    desk('/showcase/care/old-new/new-compliance-1080.webp', 'The same compliance list in the new React app, whole screen. Invented data.', 'After: the React app'),
    desk('/showcase/care/old-new/old-appointments-1080.webp', 'The week calendar for 4 to 10 October 2026 in the old Vue app. Invented data.', 'Before: the week calendar'),
    desk('/showcase/care/old-new/new-appointments-1080.webp', 'The same week calendar in the new React app. Invented data.', 'After: the week calendar'),
  ],
  'design-system-react': [
    desk('/showcase/design-system/date-range-picker.webp', 'Design System v2 date range picker, open: presets, June and July 2026 side by side, and a range from June 22 to July 9. Invented data.', 'Date range picker', 1560, 976),
    desk('/showcase/design-system/storybook-from-to-1080.webp', 'The Datepicker "From and To" story in Storybook, with the June 2026 calendar open.', 'Datepicker in Storybook'),
    desk('/showcase/design-system/button-alert.webp', 'Buttons in four styles and alerts in five tones, from the design system. Placeholder copy.', 'Buttons and alerts', 1440, 1192),
    desk('/showcase/design-system/status-badges-crop.webp', 'Status badges from the design system, such as Active, In progress, Rejected, Scheduled and Draft, each in its tone.', 'Status badges', 888, 600),
  ],
  'multi-tenant': [
    desk('/showcase/care-dashboard/overview-1080.webp', 'Care team dashboard for one organization: patients by program and patient engagement by calls and text messages. Invented data.', 'One organization’s dashboard'),
    desk('/showcase/care-dashboard/claims-1080.webp', 'Claims for one month: counts by status, filters for claims that need attention, and each claim with its program and status. Invented data.', 'Claims'),
    desk('/showcase/care-dashboard/appointments-week-1080.webp', 'Week calendar of appointments for one organization, 4 to 10 October 2026. Invented data.', 'Appointments'),
    desk('/showcase/care-dashboard/rpm-overview-cgm-1080.webp', "Glucose overview for one patient: time in range, average, highest and lowest values, and one day's glucose curve. Invented data.", 'Glucose overview'),
  ],
  'read-to-feed': [
    phone('/mobile/reading-1.webp', 'Read to Feed store screenshot: My Books list with reading progress', 'My Books'),
    phone('/mobile/reading-2.webp', 'Read to Feed store screenshot: achievements screen with eggs collected and quiz badges', 'Achievements'),
    phone('/mobile/reading-3.webp', 'Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot', 'The reader'),
    phone('/mobile/reading-4.webp', 'Read to Feed store screenshot: a New Badge sheet for earning 50,000 eggs by answering quiz questions', 'A new badge'),
  ],
  'bayyinah-tv': [
    desk('/showcase/bayyinah/web-01-1080.webp', 'Bayyinah TV landing page: "Quran Studies Made Simple" with the app on a laptop, a monitor and phones', 'Landing page'),
    desk('/showcase/bayyinah/web-02-1080.webp', 'Bayyinah TV library: search, filters and a row of courses, one marked LIVE', 'Library'),
    desk('/showcase/bayyinah/web-04-1080.webp', 'Bayyinah TV library, Stories tab: a row of story series', 'Stories'),
    desk('/showcase/bayyinah/web-06-1080.webp', 'Bayyinah TV pricing: "Choose Your Plan" with a monthly and annual switch and the Premium plan', 'Pricing'),
  ],
  futurisma: [
    desk('/eh/futurisma.webp', 'Futurisma race in a snowy mountain village: lap 1 of 3 in first place, 211 km/h, a brake warning and the circuit map.', 'A race in progress', 1280, 800),
    desk('/personal/shots/futurisma-frostline-1.webp', 'Futurisma on Frostline, Map 09: the hover craft races a snowy mountain road at midnight, autopilot demo', 'Frostline', 2880, 1800),
    desk('/personal/shots/futurisma-frostline-2.webp', 'Futurisma on Frostline: the road enters the Christmas square under a clock tower and a FROSTLINE / MIDNIGHT RUN arch, autopilot demo', 'Christmas square', 2880, 1800),
    desk('/personal/shots/futurisma-garage.webp', 'Futurisma garage, FLEET tab: the TOTEM craft in the works bay, its ratings head to head, and five more frames to buy with race credits', 'Garage', 2880, 1800),
  ],
  incentiv: [
    desk('/showcase/incentiv/web-03-1080.webp', 'Incentiv portal sign-in, public screen: Passkey, MetaMask and WalletConnect, and links to reconnect or recover a wallet', 'Sign-in'),
    desk('/eh/incentiv.webp', 'Incentiv wallet dashboard after sign-in: a Welcome Back panel with the balance and recent activity', 'Dashboard', 1280, 800),
  ],
  'viva-fresh': [
    phone('/mobile/grocery-1.webp', "Viva Fresh store screenshot: home with product categories and latest products, Albanian interface", 'Home'),
    phone('/mobile/grocery-2.webp', 'Viva Fresh store screenshot: Fresh category with a product grid and the cart total', 'A category'),
    phone('/mobile/grocery-3.webp', 'Viva Fresh store screenshot: cart with quantities, discount and checkout button', 'Cart'),
  ],
  'dukagjini-bookstore': [
    phone('/mobile/bookstore-1.webp', 'Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale', 'Home'),
    phone('/mobile/bookstore-2.webp', 'Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites', 'Foreign books'),
    phone('/mobile/bookstore-3.webp', 'Dukagjini Bookstore store screenshot: sheet with favourite lists and book categories', 'Favourites'),
  ],
}
