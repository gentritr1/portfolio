import { ArrowRightIcon } from '@phosphor-icons/react'
import { ChannelBadge } from '../components/ChannelBadge'
import { Container } from '../components/Container'
import { TransitionLink } from '../components/TransitionLink'
import { channelOrder, channels } from '../content/channels'
import { caseHref, featuredProjects, projects } from '../content/projects'
import { preloadCase } from '../lib/routes'

/**
 * Phase 1 home: the intro, the five channel tabs and a plain schedule.
 * Phase 2 replaces the first viewport with the monitor wall and the
 * schedule with filters, previews and the drawer.
 */
export function HomePage() {
  const schedule = channelOrder.flatMap((key) => projects.filter((project) => project.channel === key))

  return (
    <>
      <title>Gentrit Rashiti, frontend and mobile developer</title>
      <section aria-labelledby="intro-title" className="pt-12 sm:pt-20">
        <Container>
          <h1 id="intro-title" className="text-display text-ink">
            Gentrit Rashiti
          </h1>
          <p className="mt-4 font-display text-h3 font-medium text-ink-2 [font-stretch:112%] sm:text-[1.5rem]">
            Frontend & mobile developer, now full stack
          </p>
          <p className="mt-8 max-w-[54ch] text-lede text-ink">
            Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.
          </p>
          <p className="mt-4 max-w-[62ch] text-meta text-ink-2">
            5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working
            remotely.
          </p>
        </Container>
      </section>

      <nav aria-label="Featured channels" className="mt-14 sm:mt-20">
        <Container>
          <ul className="grid border-y border-hairline sm:grid-cols-2 lg:grid-cols-5">
            {featuredProjects.map((project) => (
              <li
                key={project.slug}
                data-channel={project.channel}
                className="border-hairline not-last:border-b sm:odd:border-r lg:not-last:border-b-0 lg:not-last:border-r lg:last:border-r-0"
              >
                <TransitionLink
                  to={caseHref(project)}
                  preload={() => preloadCase(project.slug)}
                  className="group relative flex h-full min-h-36 flex-col gap-3 px-4 py-5 transition-colors duration-200 ease-out hover:bg-panel-1"
                >
                  <ChannelBadge channel={project.channel} />
                  <span className="font-display text-h3 text-ink [font-stretch:112%]">{project.name}</span>
                  <span className="text-meta text-ink-2">{project.kind}</span>
                  <span className="mt-auto flex items-center justify-between gap-3 label">
                    <span className="flex items-center gap-1.5 text-ink-2 transition-colors duration-200 group-hover:text-ink">
                    Tune in
                    <ArrowRightIcon
                      size={13}
                      weight="light"
                      aria-hidden
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                    </span>
                    <span className="text-ink-3 tabular">{project.years}</span>
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-tint transition-transform duration-200 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </TransitionLink>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <section id="schedule" aria-labelledby="schedule-title" className="pt-section">
        <Container>
          <h2 id="schedule-title" className="text-h2 text-ink">
            Schedule
          </h2>
          <p className="mt-3 text-meta text-ink-2">
            {projects.length} projects on {channelOrder.length} channels.
          </p>
          <ol className="mt-8 border-t border-hairline">
            {schedule.map((project) => (
              <li
                key={project.slug}
                data-channel={project.channel}
                className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-1 border-b border-hairline py-3 sm:grid-cols-[5.5rem_1fr_13rem] lg:grid-cols-[5.5rem_minmax(0,1.4fr)_13rem_minmax(0,0.8fr)]"
              >
                <span className="label pt-1 text-ink-3 tabular">{project.years ?? channels[project.channel].period}</span>
                <span className="min-w-0">
                  {project.featured ? (
                    <TransitionLink
                      to={caseHref(project)}
                      preload={() => preloadCase(project.slug)}
                      className="text-ink underline decoration-hairline-strong underline-offset-4 hover:decoration-current"
                    >
                      {project.name}
                    </TransitionLink>
                  ) : (
                    <span className="text-ink">{project.name}</span>
                  )}
                  <span className="block text-meta text-ink-2">{project.line}</span>
                </span>
                <ChannelBadge channel={project.channel} className="col-start-2 pt-1 sm:col-start-auto" />
                <span className="hidden pt-0.5 text-meta text-ink-2 lg:block">{project.role}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  )
}
