// First-paint copies of the paired public/recreation assets: 160px wide, WebP quality 45.
// Keep these inline; fetching another placeholder would reintroduce an empty device.
import carePreview from './studio-previews/healthcare.webp?inline'
import bayyinahHomePreview from './studio-previews/bayyinah-home.webp?inline'
import bayyinahLibraryPreview from './studio-previews/bayyinah-library.webp?inline'
import readingBooksPreview from './studio-previews/reading-books.webp?inline'
import readingAchievementsPreview from './studio-previews/reading-achievements.webp?inline'
import readingReaderPreview from './studio-previews/reading-reader.webp?inline'
import groceryCategoriesPreview from './studio-previews/grocery-categories.webp?inline'
import groceryProductsPreview from './studio-previews/grocery-products.webp?inline'
import groceryCartPreview from './studio-previews/grocery-cart.webp?inline'
import incentivPortalPreview from './studio-previews/incentiv-portal.webp?inline'
import incentivHomePreview from './studio-previews/incentiv-home.webp?inline'

export interface StudioShot {
  src: string
  alt: string
  /** A small copy of the same screenshot, inlined so the first device frame needs no image request. */
  preview: string
  /** Public listing crop, in normalized top-left image coordinates. */
  crop?: [number, number, number, number]
}

export interface StudioComposition {
  title: string
  colour: string
  device: 'phone' | 'display'
  platform: string
  shots: StudioShot[]
}

export const studioShots: Record<string, StudioComposition> = {
  'care-platform': {
    title: 'Care platform', colour: '#3c807e', device: 'display', platform: 'Web application · Laravel API',
    shots: [{ src: '/signal-posters/healthcare.avif', preview: carePreview, alt: 'A fictional patient’s blood-pressure trend in the care-platform recreation' }],
  },
  'bayyinah-tv': {
    title: 'Bayyinah TV', colour: '#a84430', device: 'display', platform: 'Web · iOS · Android',
    shots: [
      { src: '/showcase/bayyinah/web-01.webp', preview: bayyinahHomePreview, alt: 'Bayyinah TV public home page' },
      { src: '/showcase/bayyinah/web-02.webp', preview: bayyinahLibraryPreview, alt: 'Bayyinah TV public learning library' },
    ],
  },
  'read-to-feed': {
    title: 'Read to Feed', colour: '#347b85', device: 'phone', platform: 'iOS · Android',
    shots: [
      { src: '/mobile/reading-1.webp', preview: readingBooksPreview, alt: 'Read to Feed’s My Books screen from its public store listing', crop: [0.11, 0.295, 0.78, 0.705] },
      { src: '/mobile/reading-2.webp', preview: readingAchievementsPreview, alt: 'Read to Feed’s achievements from its public store listing', crop: [0.11, 0.295, 0.78, 0.705] },
      { src: '/mobile/reading-3.webp', preview: readingReaderPreview, alt: 'Read to Feed’s reader from its public store listing', crop: [0.11, 0.295, 0.78, 0.705] },
    ],
  },
  'viva-fresh': {
    title: 'Viva Fresh', colour: '#aa353b', device: 'phone', platform: 'iOS · Android',
    shots: [
      { src: '/mobile/grocery-1.webp', preview: groceryCategoriesPreview, alt: 'Viva Fresh product categories from the public App Store listing' },
      { src: '/mobile/grocery-2.webp', preview: groceryProductsPreview, alt: 'Viva Fresh fresh products from the public App Store listing' },
      { src: '/mobile/grocery-3.webp', preview: groceryCartPreview, alt: 'Viva Fresh shopping cart from the public App Store listing' },
    ],
  },
  incentiv: {
    title: 'Incentiv', colour: '#ad6036', device: 'display', platform: 'Web application',
    shots: [
      { src: '/showcase/incentiv/web-03.webp', preview: incentivPortalPreview, alt: 'The public Incentiv portal sign-in page, with no wallet connected' },
      { src: '/showcase/incentiv/web-01.webp', preview: incentivHomePreview, alt: 'The public Incentiv website' },
    ],
  },
}
