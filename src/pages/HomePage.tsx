import { useState } from 'react'
import { About } from '../components/home/About'
import { Intro } from '../components/home/Intro'
import { MonitorWall } from '../components/home/MonitorWall'
import { Schedule } from '../components/home/Schedule'
import { featuredProjects, findProject } from '../content/projects'

const defaultSlug = 'bayyinah-tv'

export function HomePage() {
  const [activeSlug, setActiveSlug] = useState(defaultSlug)
  const active = findProject(activeSlug) ?? featuredProjects[0]

  return (
    <>
      <title>Gentrit Rashiti, frontend and mobile developer</title>
      <Intro active={active.channel} />
      <MonitorWall activeSlug={active.slug} onSelect={setActiveSlug} />
      <Schedule />
      <About />
    </>
  )
}
