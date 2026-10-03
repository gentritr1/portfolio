import booksPreview from '../../components/case/studio-previews/reading-books.webp?inline'
import readerPreview from '../../components/case/studio-previews/reading-reader.webp?inline'
import achievementsPreview from '../../components/case/studio-previews/reading-achievements.webp?inline'

/** Crops remove the promotional heading from the public store frames. */
export const screenCrop = [0.11, 0.295, 0.78, 0.705] as const

export const shots = [
  { src: '/mobile/reading-1.webp', preview: booksPreview, alt: 'Read to Feed’s My Books screen, from its public store listing' },
  { src: '/mobile/reading-3.webp', preview: readerPreview, alt: 'Read to Feed’s book reader, from its public store listing' },
  { src: '/mobile/reading-2.webp', preview: achievementsPreview, alt: 'Read to Feed’s reading achievements, from its public store listing' },
] as const

export const chapters = [
  { title: 'The collection', colour: '#2543eb', text: '#ffffff' },
  { title: 'The reader', colour: '#f58c72', text: '#211813' },
  { title: 'The progress', colour: '#edee73', text: '#252710' },
] as const
