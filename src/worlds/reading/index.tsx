import { World } from '../../components/World'
import { Recreation } from './Recreation'

const related = [
  {
    title: 'Bookstore app, 2021 - 2022',
    body: 'React Native shopping app for a publisher: push notifications with deep links across all app states, animated book-detail header, swipeable modals, checkout with promo codes. Shipped iOS and Android.',
  },
  {
    title: 'Chatbot runtime library',
    body: 'A reusable React Native package that plays scripted conversations (text, media, choices, ratings, timers). I wrote the message-queue engine, the stall and duplicate guards, natural typing delays and the keyboard-aware chat list. Later started the web port in TypeScript.',
  },
]

export function ReadingWorld() {
  return (
    <World
      world="reading"
      layout="stage-start"
      stageAspect="1 / 1"
      stageAspectMobile="9 / 16"
      title="A children's reading app, four years of releases"
      meta={['Mobile', 'iOS + Android', 'Reading']}
      role="Lead mobile developer (79% of commits)."
      story={[
        'Children read books in the app, scan their own books by ISBN barcode, take quizzes as chatbot conversations, and earn badges and streaks. Parents verify accounts by email.',
        'I built the reader for PDF and EPUB, forking the EPUB library to add progress tracking; the barcode scanner (EAN-13) with a camera hook; the gamification (badges, streaks, confetti, coach marks); push notifications with a notification center; the custom video player; and three languages.',
        'I shipped about 14 releases to both stores and carried the app through three major React Native upgrades (0.63 → 0.66 → 0.74 → 0.81).',
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
