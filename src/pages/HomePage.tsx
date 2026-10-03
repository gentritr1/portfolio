import { flushSync } from 'react-dom'
import type { SignalStackHandle } from '../components/signal-stack/SignalStack'
import { useRef, useState } from 'react'
import { About } from '../components/home/About'
import { Intro } from '../components/home/Intro'
import { MonitorWall } from '../components/home/MonitorWall'
import { Schedule } from '../components/home/Schedule'
import { featuredProjects, findProject } from '../content/projects'
import { channelOrder } from '../content/channels'
import { playChannelSound } from '../lib/channelSound'

const defaultSlug = 'bayyinah-tv'

export function HomePage() {
  const [activeSlug, setActiveSlug] = useState(defaultSlug)
  const stack = useRef<SignalStackHandle>(null)
  const [tuning, setTuning] = useState(false)
  const active = findProject(activeSlug) ?? featuredProjects[0]

  function selectChannel(slug: string) {
    if (slug === activeSlug) return
    const project = findProject(slug)
    if (!project) return
    playChannelSound(channelOrder.indexOf(project.channel))
    setActiveSlug(slug)
  }

  async function tuneIn() {
    if (!stack.current?.canTune()) return
    const visual = stack.current
    flushSync(() => setTuning(true))
    await visual.tuneIn()
    return () => { visual.reset(); setTuning(false) }
  }

  return (
    <>
      <title>Gentrit Rashiti, frontend and mobile developer</title>
      <Intro active={active.channel} stackRef={stack} transitionName={tuning ? `monitor-${active.slug}` : undefined} />
      <MonitorWall activeSlug={active.slug} onSelect={selectChannel} beforeTransition={tuneIn} tuningCamera={tuning} />
      <Schedule nowSlug={active.slug} />
      <About />
    </>
  )
}
