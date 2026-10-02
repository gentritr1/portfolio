import { World } from '../../components/World'
import { Recreation } from './Recreation'

const related = [
  {
    title: 'Bookstore app, 2021 - 2022',
    body: 'React Native shopping app for a publisher: push notifications with deep links across all app states, animated book-detail header, swipeable modals, checkout with promo codes. Shipped iOS and Android.',
  },
  {
    title: 'Chatbot runtime library',
    body: 'A reusable React Native package that plays scripted conversations (text, media, choices, ratings, timers): a message-queue engine, stall and duplicate guards, natural typing delays and a keyboard-aware chat list. A web port in TypeScript followed.',
  },
]

export function ReadingWorld() {
  return (
    <World
      world="reading"
      layout="stage-start"
      stageAspect="1 / 1"
      stageAspectTablet="1 / 1"
      stageAspectMobile="9 / 16"
      title="A children's reading app, four years of releases"
      meta={['Mobile', 'iOS + Android', 'Reading']}
      role="Mobile developer on a small team, 2022 – 2025."
      story={[
        'Children read books in the app, scan their own books by ISBN barcode, take quizzes as chatbot conversations, and earn badges and streaks. Parents verify accounts by email.',
        'The app has a reader for PDF and EPUB, with the EPUB library forked to add progress tracking; an EAN-13 barcode scanner built on the camera; gamification with badges, streaks, confetti and coach marks; push notifications with a notification center; a custom video player; and three languages.',
        'About 14 releases went to both stores, and the app moved through three major React Native upgrades (0.63 → 0.66 → 0.74 → 0.81).',
      ]}
      facts={[
        'PDF + EPUB reader (forked epub.js for progress)',
        'ISBN barcode scanning with the camera',
        'Badges, streaks, quizzes, confetti, coach marks',
        'Push notifications, deep links, notification center',
        '~14 store releases, RN 0.63 → 0.81',
        '3 languages',
      ]}
      stack={[
        'React Native, React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next',
      ]}
      recreationName="Reader page"
      recreation={<Recreation />}
    >
      <ul className="grid gap-6">
        {related.map((item) => (
          <li key={item.title} className="border-t border-line pt-5">
            <h3 className="font-display text-[1.1875rem] font-medium tracking-[-0.01em] text-ink">{item.title}</h3>
            <p className="mt-2 max-w-[62ch] text-[0.975rem] leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </World>
  )
}
