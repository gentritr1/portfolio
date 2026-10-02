import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { useActiveWorld } from './lib/useActiveWorld'
import { Capabilities } from './sections/Capabilities'
import { Contact } from './sections/Contact'
import { Hero } from './sections/Hero'
import { Personal } from './sections/Personal'
import { Skills } from './sections/Skills'
import { AiDashboardsWorld } from './worlds/ai'
import { HealthcareWorld } from './worlds/healthcare'
import { ReadingWorld } from './worlds/reading'
import { StreamingWorld } from './worlds/streaming'
import { Web3World } from './worlds/web3'

export default function App() {
  const world = useActiveWorld()

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-(--z-skip) -translate-y-24 rounded-full bg-accent px-5 py-3 text-on-accent transition-transform duration-200 ease-out focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <Nav world={world} />
      <main id="main">
        <Hero />
        <Capabilities />
        <div id="work">
          <HealthcareWorld />
          <StreamingWorld />
          <ReadingWorld />
          <Web3World />
          <AiDashboardsWorld />
        </div>
        <Personal />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
