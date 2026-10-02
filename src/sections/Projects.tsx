import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { Container } from '../components/Container'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { Thumb, ThumbFrame } from '../components/Thumb'
import { currentYear, firstYear, groupPeriods, projects, worldOf, type Project, type ProjectGroupName } from '../content/projects'

const groupOrder: ProjectGroupName[] = ['Vianova', 'Agency work', 'Incentiv', 'AvahiTech', 'Personal']
const projectGroups = groupOrder.map((name) => ({
  name,
  period: groupPeriods[name],
  projects: projects.filter((project) => project.group === name),
}))
import { cn } from '../lib/cn'
import { stagger } from '../lib/motion'

const maxStaggered = 12

const thumbHover = cn(
  'transition-[translate,border-color] duration-150 ease-out motion-reduce:transition-none',
  'group-has-[[data-world-link]:hover]:border-line-strong group-has-[[data-world-link]:focus-visible]:border-line-strong',
  'motion-safe:group-has-[[data-world-link]:hover]:-translate-y-px motion-safe:group-has-[[data-world-link]:focus-visible]:-translate-y-px',
)

function RowThumb({ project }: { project: Project }) {
  if (project.media.shot) {
    return (
      <ThumbFrame className={thumbHover}>
        <img
          src={project.media.shot.src}
          alt={project.media.shot.alt}
          width={256}
          height={160}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover object-top"
        />
      </ThumbFrame>
    )
  }
  if (project.media.thumb) {
    return (
      <Thumb
        kind={project.media.thumb}
        world={worldOf(project)}
        className={thumbHover}
      />
    )
  }
  return <ThumbFrame aria-hidden />
}

function PublicLinks({ project }: { project: Project }) {
  if (!project.links?.length) return null
  return (
    <ul className="order-last flex flex-wrap gap-x-4 md:order-none">
      {project.links.map((link) => (
        <li key={link.href} className="-my-1">
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex min-h-11 items-center gap-1 rounded-chip font-mono text-[0.78rem] text-muted underline decoration-line-strong transition-colors duration-200 ease-out hover:text-ink hover:decoration-current"
          >
            {link.label}
            <ArrowUpRightIcon
              size={12}
              weight="light"
              aria-hidden
              className="text-accent-ink transition-transform duration-200 ease-out group-hover/link:translate-x-px group-hover/link:-translate-y-px motion-reduce:transition-none"
            />
            <span className="sr-only"> of {project.name} (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function Row({ project }: { project: Project }) {
  const href = project.featured ? `/work/${project.slug}` : undefined
  return (
    <div
      className={cn(
        '-mx-3 flex gap-4 px-3 py-4 md:gap-5',
        href &&
          'group rounded-chip transition-colors duration-200 ease-out has-[[data-world-link]:hover]:bg-surface has-[[data-world-link]:focus-visible]:bg-surface',
      )}
    >
      {href ? (
        <a href={href} data-world-link tabIndex={-1} aria-hidden className="shrink-0 rounded-chip">
          <RowThumb project={project} />
        </a>
      ) : (
        <RowThumb project={project} />
      )}
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-y-1.5 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-4 md:gap-y-1 lg:gap-x-6">
        <p className="font-medium leading-6 text-ink md:col-span-4 md:row-start-1">
          {href ? (
            <a
              href={href}
              data-world-link
              className="relative rounded-[2px] decoration-line-strong after:absolute after:-inset-y-3 after:inset-x-0 hover:underline"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 leading-6 md:contents">
          {project.years && (
            <>
              <span className="tabular font-mono text-meta leading-6 text-muted md:col-span-2 md:col-start-5 md:row-span-2 md:row-start-1">
                {project.years}
              </span>
              <span aria-hidden className="font-mono text-meta text-muted md:hidden">
                ·
              </span>
            </>
          )}
          <span className="text-[0.9375rem] leading-6 text-muted md:col-span-2 md:col-start-7 md:row-span-2 md:row-start-1">
            {project.role}
          </span>
        </p>
        <div className="contents md:col-span-4 md:col-start-9 md:row-span-2 md:row-start-1 md:flex md:flex-col md:gap-y-1">
          <p className="text-pretty text-[0.9375rem] leading-6 text-ink">{project.line}</p>
          <PublicLinks project={project} />
        </div>
        <p className="font-mono text-meta text-muted md:col-span-4 md:col-start-1 md:row-start-2">
          {project.stack.join(', ')}
        </p>
      </div>
      <span aria-hidden className="mt-1 w-4 shrink-0 text-accent-ink">
        {href && (
          <ArrowUpRightIcon
            size={16}
            weight="light"
            className={cn(
              'opacity-0 transition-[opacity,transform] duration-200 ease-out pointer-coarse:opacity-100',
              'group-has-[[data-world-link]:hover]:-translate-y-0.5 group-has-[[data-world-link]:hover]:translate-x-0.5 group-has-[[data-world-link]:hover]:opacity-100 group-has-[[data-world-link]:focus-visible]:opacity-100',
            )}
          />
        )}
      </span>
    </div>
  )
}

export function Projects() {
  return (
    <section id="projects" data-world="base" data-world-section aria-labelledby="projects-title" className="pt-section">
      <Container>
        <SectionHeading
          id="projects-title"
          title="All projects"
          lede="Every product so far, in one list. Rows with a world link open the case study above."
        />
        <Reveal as="p" className="tabular mt-6 font-mono text-meta text-muted">
          {projects.length} projects · {currentYear - firstYear} years
        </Reveal>

        <div className="mt-12 flex flex-col gap-12 lg:mt-16 lg:gap-14">
          {projectGroups.map((group) => (
            <div key={group.name}>
              <Reveal as="div">
                <h3 className="flex flex-wrap items-baseline gap-x-2 text-[1.0625rem] font-medium text-ink">
                  {group.name}
                  {group.period && <span className="font-mono text-meta font-normal text-muted">{group.period}</span>}
                </h3>
              </Reveal>
              <RevealGroup as="ul" gap={0} amount={0} className="mt-4 border-b border-line">
                {group.projects.map((project, index) => (
                  <RevealItem
                    as="li"
                    key={project.name}
                    delay={Math.min(index, maxStaggered - 1) * stagger.tight}
                    className="border-t border-line"
                  >
                    <Row project={project} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
