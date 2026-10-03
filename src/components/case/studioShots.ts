export interface StudioShot {
  src: string
  alt: string
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
    shots: [{ src: '/signal-posters/healthcare.avif', alt: 'A fictional patient’s blood-pressure trend in the care-platform recreation' }],
  },
  'bayyinah-tv': {
    title: 'Bayyinah TV', colour: '#a84430', device: 'display', platform: 'Web · iOS · Android',
    shots: [
      { src: '/showcase/bayyinah/web-01.webp', alt: 'Bayyinah TV public home page' },
      { src: '/showcase/bayyinah/web-02.webp', alt: 'Bayyinah TV public learning library' },
    ],
  },
  'read-to-feed': {
    title: 'Read to Feed', colour: '#347b85', device: 'phone', platform: 'iOS · Android',
    shots: [
      { src: '/mobile/reading-1.webp', alt: 'Read to Feed’s My Books screen from its public store listing', crop: [0.11, 0.295, 0.78, 0.705] },
      { src: '/mobile/reading-2.webp', alt: 'Read to Feed’s achievements from its public store listing', crop: [0.11, 0.295, 0.78, 0.705] },
      { src: '/mobile/reading-3.webp', alt: 'Read to Feed’s reader from its public store listing', crop: [0.11, 0.295, 0.78, 0.705] },
    ],
  },
  'viva-fresh': {
    title: 'Viva Fresh', colour: '#aa353b', device: 'phone', platform: 'iOS · Android',
    shots: [
      { src: '/mobile/grocery-1.webp', alt: 'Viva Fresh product categories from the public App Store listing' },
      { src: '/mobile/grocery-2.webp', alt: 'Viva Fresh fresh products from the public App Store listing' },
      { src: '/mobile/grocery-3.webp', alt: 'Viva Fresh shopping cart from the public App Store listing' },
    ],
  },
  incentiv: {
    title: 'Incentiv', colour: '#ad6036', device: 'display', platform: 'Web application',
    shots: [
      { src: '/showcase/incentiv/web-03.webp', alt: 'The public Incentiv portal sign-in page, with no wallet connected' },
      { src: '/showcase/incentiv/web-01.webp', alt: 'The public Incentiv website' },
    ],
  },
}
