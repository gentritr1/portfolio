import booksPreview from '../../components/case/studio-previews/reading-books.webp?inline'
import readerPreview from '../../components/case/studio-previews/reading-reader.webp?inline'
import achievementsPreview from '../../components/case/studio-previews/reading-achievements.webp?inline'

/** Each crop keeps the screen inside the store frame's glass, below its rounded corners, as fractions of the image. */
const crop = (x: number, y: number, w: number, h: number) => [x / 780, y / 1689, w / 780, h / 1689] as const

export const shots = [
  { src: '/mobile/reading-1.webp', preview: booksPreview, crop: crop(107, 497, 566, 1192), alt: 'Read to Feed’s My Books screen, from its public store listing' },
  { src: '/mobile/reading-3.webp', preview: readerPreview, crop: crop(99, 464, 582, 1225), alt: 'Read to Feed’s book reader, from its public store listing' },
  { src: '/mobile/reading-2.webp', preview: achievementsPreview, crop: crop(121, 556, 538, 1133), alt: 'Read to Feed’s reading achievements, from its public store listing' },
] as const

export const chapters = [
  { title: 'The collection', colour: '#2543eb', text: '#ffffff' },
  { title: 'The reader', colour: '#f58c72', text: '#211813' },
  { title: 'The progress', colour: '#edee73', text: '#252710' },
] as const
