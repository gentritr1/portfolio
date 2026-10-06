import reading from '../../components/case/studio-previews/reading-books.webp?inline'
import bayyinah from '../../components/case/studio-previews/bayyinah-home.webp?inline'
import grocery from '../../components/case/studio-previews/grocery-categories.webp?inline'
import incentiv from '../../components/case/studio-previews/incentiv-portal.webp?inline'

export const orbitProjects = [
  { slug: 'read-to-feed', name: 'Read to Feed', src: '/mobile/reading-1.webp', preview: reading, alt: 'Read to Feed’s My Books screen from its public store listing', crop: [91 / 780, 540 / 1689, 598 / 780, 1149 / 1689], background: '#d9f64a', ink: '#1b2813', material: [.18, .28, .86] },
  { slug: 'bayyinah-tv', name: 'Bayyinah TV', src: '/showcase/bayyinah/web-01.webp', preview: bayyinah, alt: 'Bayyinah TV’s public website', crop: [0, 0, 1, 1], background: '#f58270', ink: '#321712', material: [.62, .11, .17] },
  { slug: 'viva-fresh', name: 'Viva Fresh', src: '/mobile/grocery-1.webp', preview: grocery, alt: 'Viva Fresh home screen from its public App Store listing', crop: [100 / 780, 360 / 1689, 580 / 780, 1180 / 1689], background: '#b3eae7', ink: '#123537', material: [.08, .44, .39] },
  { slug: 'incentiv', name: 'Incentiv', src: '/showcase/incentiv/web-03.webp', preview: incentiv, alt: 'Incentiv’s public portal sign-in: Passkey, MetaMask and WalletConnect', crop: [.104, .186, .4375, .629], background: '#2945ca', ink: '#fff4de', material: [.60, .35, .92] },
] as const

export type OrbitProject = typeof orbitProjects[number]
