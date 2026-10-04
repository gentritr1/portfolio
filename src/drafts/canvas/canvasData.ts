import type { Area } from './geometry'

export interface Artboard extends Area {
  id: string
  title: string
  caption: string
  src?: string
  alt?: string
  live?: 'care' | 'reader'
  background: string
  ink?: string
}
export interface Cluster extends Area {
  id: string
  title: string
  description: string
  frames: Artboard[]
}

/** Coordinates are authored, not randomized. Every image is an existing public capture. */
export function makeClusters(viewWidth: number): Cluster[] {
  const compact = viewWidth < 650
  const liveWidth = compact ? Math.max(272, viewWidth - 48) : 720
  return [
    {
      id: 'care', title: 'Care & systems', description: 'Remote patient monitoring. Vue to React, one route at a time.',
      x: compact ? 96 : 890, y: compact ? 520 : 190, width: compact ? liveWidth : 1480, height: 740,
      frames: [
        { id: 'care-demo', title: 'Care-management platform', caption: 'Live recreation · invented patient data', x: 0, y: 0, width: liveWidth, height: compact ? 400 : 452, live: 'care', background: '#f9faf1' },
        { id: 'care-public', title: 'Public intake', caption: 'Public website · care platform', x: 790, y: 110, width: 630, height: 315, src: '/showcase/care/book-1.webp', alt: 'The public welcome and consent step of a care-platform intake page', background: '#f3f0df' },
      ],
    },
    {
      id: 'streaming', title: 'Streaming', description: 'Bayyinah TV. A video-learning platform on web, iOS and Android.',
      x: 100, y: 1270, width: 1630, height: 1160,
      frames: [
        { id: 'bayyinah-web', title: 'Bayyinah TV', caption: 'Public website · Nuxt 3', x: 0, y: 0, width: 980, height: 610, src: '/showcase/bayyinah/web-01.webp', alt: 'Bayyinah TV public website with its Quran Studies Made Simple heading and product devices', background: '#9e3015', ink: '#fffaf0' },
        { id: 'bayyinah-app', title: 'Bayyinah TV app', caption: 'Public App Store frame', x: 1050, y: 60, width: 360, height: 780, src: '/showcase/bayyinah/store-01.webp', alt: 'Bayyinah TV public App Store frame showing its mobile home screen', background: '#9e3015', ink: '#fffaf0' },
        { id: 'bayyinah-institute', title: 'Bayyinah institute website', caption: 'Public website · Next.js', x: 210, y: 710, width: 640, height: 400, src: '/showcase/bayyinah/org-01.webp', alt: 'Bayyinah Foundation public home page', background: '#315394', ink: '#fffaf0' },
      ],
    },
    {
      id: 'mobile', title: 'Mobile & reading', description: 'Readers, grocery orders and bookstores. React Native on iOS and Android.',
      x: 2000, y: 1250, width: 1520, height: 1160,
      frames: [
        { id: 'reader-demo', title: 'Read to Feed', caption: 'Reader recreation · public-domain text', x: 0, y: 0, width: compact ? liveWidth : 560, height: compact ? 410 : 520, live: 'reader', background: '#fff8e7' },
        { id: 'viva', title: 'Viva Fresh', caption: 'Public App Store frame · 2023', x: 640, y: 10, width: 340, height: 735, src: '/mobile/grocery-1.webp', alt: 'Viva Fresh public store screenshot showing grocery categories', background: '#d93630', ink: '#fffaf0' },
        { id: 'dukagjini', title: 'Dukagjini Bookstore', caption: 'Public App Store frame · 2021–22', x: 1040, y: 180, width: 340, height: 735, src: '/mobile/bookstore-1.webp', alt: 'Dukagjini Bookstore public store screenshot showing books for sale', background: '#e9a6a4' },
        { id: 'reader-store', title: 'Read to Feed', caption: 'Archived public store frame · 2022–25', x: 80, y: 650, width: 230, height: 500, src: '/mobile/reading-1.webp', alt: 'Read to Feed public store screenshot with its book library', background: '#65b5d8' },
      ],
    },
    {
      id: 'independent', title: 'Independent work', description: 'A studio, a time-off product, and games for the web.',
      x: 2660, y: 140, width: 1460, height: 1220,
      frames: [
        { id: 'snaxx', title: 'Snaxx Tech', caption: 'Public studio website · 2026', x: 0, y: 0, width: 840, height: 525, src: '/personal/shots/snaxx-desktop.webp', alt: 'Snaxx Tech website with an illustrated workshop', background: '#ede2be' },
        { id: 'fjale', title: 'FJALË', caption: 'Daily Albanian word game · 2026', x: 910, y: 160, width: 490, height: 305, src: '/personal/shots/fjale-desktop.webp', alt: 'FJALË Albanian word game', background: '#a9e928' },
        { id: 'offday', title: 'Offday', caption: 'Public owner capture · 2026', x: 340, y: 640, width: 850, height: 530, src: '/personal/shots/offday-app-desktop.webp', alt: 'Offday team calendar and time-off approvals', background: '#b797fb' },
      ],
    },
    {
      id: 'concepts', title: 'Concept sites', description: 'Two fictional brands, made as portfolio concepts: a speaker and a sculpture show.',
      x: 3600, y: 1520, width: 760, height: 960,
      frames: [
        { id: 'offbeat', title: 'OFFBEAT', caption: 'Speaker brand concept · 2026', x: 0, y: 0, width: 760, height: 475, src: '/personal/shots/offbeat-home-desktop.webp', alt: 'OFFBEAT home: a hot-orange portable speaker in 3D beside the line Plays your songs. Makes its own.', background: '#121212' },
        { id: 'form', title: 'FORM', caption: 'Sculpture exhibition concept · 2026', x: 120, y: 560, width: 640, height: 400, src: '/personal/shots/form-home-desktop.webp', alt: 'FORM home: a copper trefoil sculpture beside the title Objects of imagination.', background: '#1b1917' },
      ],
    },
  ]
}
