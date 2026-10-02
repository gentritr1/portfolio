import { World } from '../../components/World'
import { PublishedApps } from './PublishedApps'
import { Recreation } from './Recreation'

const related = [
  {
    title: 'Bookstore app, 2021 - 2022',
    body: 'A React Native shopping app for a publisher, on iOS and Android. It has push notifications with deep links, an animated book-detail header, swipeable modals and checkout with promo codes.',
  },
  {
    title: 'Chatbot runtime library',
    body: 'A reusable React Native package that plays scripted conversations with text, media, choices, ratings and timers. It has a message queue, stall and duplicate guards, natural typing delays and a web port in TypeScript.',
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
      role="Mobile, iOS and Android"
      story={[
        "A children's reading app for iOS and Android. Children read books, scan their own books by barcode, take quizzes as chat conversations, and earn badges and streaks. Parents verify accounts by email.",
        'The app has a PDF and EPUB reader with progress tracking, an ISBN barcode scanner, gamification with badges, streaks and coach marks, push notifications with a notification center, and three languages. About 14 releases went to both stores, and the app moved from React Native 0.63 to 0.81 through three major upgrades.',
      ]}
      facts={[
        'PDF and EPUB reader with progress tracking',
        'ISBN barcode scanning with the camera',
        'Badges, streaks, quizzes, coach marks',
        'Push notifications, deep links, notification center',
        'About 14 store releases, RN 0.63 → 0.81',
        '3 languages',
      ]}
      stack={[
        'React Native, React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next',
      ]}
      recreationName="Reader page"
      recreation={<Recreation />}
      after={<PublishedApps />}
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
