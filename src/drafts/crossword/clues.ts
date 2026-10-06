import { projects, type Project } from '../../content/projects'

export interface Clue {
  /** The result, first, in about ten plain words. */
  result: string
  /** The name a non-engineer reads; the content name stays on the case page link. */
  name?: string
  /** One plain line about scope, shown on the open case. */
  scope?: string
  /** Only for fictional concepts. */
  concept?: string
}

export const clues: Record<string, Clue> = {
  'bayyinah-tv': { result: 'Members subscribe on the web, iPhone or Android.', scope: 'Frontend, core team. The whole platform built again from an empty page: 34 pages, in English and Arabic.' },
  'care-platform': { result: 'Each client organization sees only its own patients.', scope: 'Frontend. A screen moves to React only after it passes the same tests in both apps.' },
  'design-system-react': { result: '36 building blocks, released 20 times in about six weeks.', scope: 'Design system. Colours, sizes and type are set once, for code and for Figma. An app that uses only the button downloads 96.6% less code.' },
  'viva-fresh': { result: 'Shopping in Albanian, live in both app stores.', scope: 'Mobile. One grocery app, built once for iPhone and Android.' },
  'read-to-feed': { result: 'A reading app for children, updated about 14 times.', scope: 'Mobile, 2022–25. It remembers the page in every book. Kept current through three major upgrades.' },
  'dukagjini-bookstore': { result: 'Search, sales and checkout, live in both app stores.', scope: 'Mobile. A notification opens the right book.' },
  incentiv: { result: 'Sign in with a passkey (no password) or a wallet.', scope: 'Frontend. Built the screens; teammates built the wallet. English and French.' },

  offday: { result: 'Teams plan time off together. Shifts warn when nobody covers.', scope: 'Requests, approvals, a shared calendar and a planner for the best dates.' },
  offbeat: { result: 'A speaker with a drum machine that really plays.', concept: 'Concept · a fictional speaker brand', scope: 'Turn the 3D speaker, pick a finish, play eight steps with swing, save the loop.' },
  form: { result: 'Three sculptures made from mathematics, turned live in the browser.', concept: 'Concept · a fictional exhibition', scope: 'Copper, chrome and porcelain. Type a word and it becomes a sculpture.' },

  'care-api': { result: 'One billing report asked the database 16 times. Now 2.', name: 'Care platform, server side' },
  'design-system-vue': { result: 'Styles come straight from the design files. Checks catch changes.', name: 'Design system, first app' },
  'design-dashboard': { result: 'One care screen, built again with demo data for designers.' },
  'bayyinah-institute': { result: 'Live at bayyinah.org, with links to both app stores.' },
  'chatbot-runtime': { result: 'Quizzes that run like a chat, with pictures and timers.', name: 'Scripted chat engine' },
  'chatbot-runtime-web': { result: 'The same chat quizzes, built again for the web.', name: 'Scripted chat engine, web' },
  'epub-reader-prototype': { result: "The first test of the reading app's book reader.", name: 'Book reader prototype' },
  'donation-app': { result: 'Give once or every month. Badges mark each good deed.', name: 'Sadaqah app' },
  'coaching-app': { result: 'Sign in through your organization. See your day at a glance.' },
  'fuel-loyalty-app': { result: 'A loyalty app for fuel stations, kept up to date.' },
  'member-portal': { result: "The base of a members' website: sign-in, pages, layout.", name: 'Member portal' },
  'ai-dashboard': { result: 'Ask questions about a PDF. Turn photos into headshots.', name: 'Business dashboard with AI' },
  'snaxx-tech': { result: 'A studio website. Images cut from 972 KB to 337 KB.' },
  'geo-guesser': { result: 'Guess the place from the street. Live on Google Play.' },
  fjale: { result: 'One Albanian word a day, from 21,000 words. Works offline.' },
  za: { result: 'A pizza card game for 2 to 8 players, live.' },
  'morse-trainer': { result: 'Learn Morse code. The letters you miss come back sooner.' },
  futurisma: { result: 'A hover racer on seven circuits, with weather and night.' },
  'secret-dictator': { result: 'Read the computer players and decide whom to trust.' },
  'open-source-forks': { result: 'Two book-reader libraries, kept working for a reading app.' },
}

/** The recruiter path, in reading order. */
export const featuredOrder = ['bayyinah-tv', 'care-platform', 'design-system-react', 'viva-fresh', 'read-to-feed', 'dukagjini-bookstore', 'incentiv']
export const ownOrder = ['offday', 'offbeat', 'form']
export const filledAtStart = [...featuredOrder, ...ownOrder]

const bySlug = new Map(projects.map(project => [project.slug, project]))
export const projectOf = (slug: string): Project => bySlug.get(slug)!
export const nameOf = (slug: string) => clues[slug].name ?? projectOf(slug).name
