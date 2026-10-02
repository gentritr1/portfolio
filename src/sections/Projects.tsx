import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { Container } from '../components/Container'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { Thumb } from '../components/Thumb'
import { currentYear, firstYear, projectGroups, projects, type Project } from '../content/projects'
import { cn } from '../lib/cn'
import { stagger } from '../lib/motion'

const maxStaggered = 12

function RowContent({ project }: { project: Project }) {
  return (
    <>
      {project.thumb ? (
        <Thumb
          kind={project.thumb}
          world={!project.world || project.world === 'personal' ? 'base' : project.world}
          className="transition-[translate,border-color] duration-150 ease-out group-hover:border-line-strong group-focus-visible:border-line-strong motion-safe:group-hover:-translate-y-px motion-safe:group-focus-visible:-translate-y-px motion-reduce:transition-none"
        />
      ) : (
        <span
          aria-hidden
          data-world={project.world === 'personal' ? 'base' : project.world}
          className={cn('mt-2.5 h-1 w-2.5 shrink-0 rounded-full', project.world && 'bg-accent')}
        />
      )}
      <span className="grid min-w-0 flex-1 grid-cols-1 gap-y-1.5 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-4 md:gap-y-1 lg:gap-x-6">
        <span className="font-medium leading-6 text-ink md:col-span-4 md:row-start-1">{project.name}</span>
        <span className="flex flex-wrap items-baseline gap-x-2 leading-6 md:contents">
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
        </span>
        <span className="text-pretty text-[0.9375rem] leading-6 text-ink md:col-span-4 md:col-start-9 md:row-span-2 md:row-start-1">
          {project.line}
        </span>
        <span className="font-mono text-meta text-muted md:col-span-4 md:col-start-1 md:row-start-2">
          {project.stack.join(', ')}
        </span>
      </span>
      <span aria-hidden className="mt-1 w-4 shrink-0 text-accent-ink">
        {project.world && (
          <ArrowUpRightIcon
            size={16}
            weight="light"
            className="opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100"
          />
        )}
      </span>
    </>
  )
}

const rowClass = (project: Project) => cn('-mx-3 flex min-h-11 px-3 py-4', project.thumb ? 'gap-4 md:gap-5' : 'gap-3')

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
                    {project.world ? (
                      <a
                        href={`#${project.world}`}
                        className={cn(
                          rowClass(project),
                          'group rounded-chip transition-colors duration-200 ease-out hover:bg-surface focus-visible:bg-surface',
                        )}
                      >
                        <RowContent project={project} />
                      </a>
                    ) : (
                      <div className={rowClass(project)}>
                        <RowContent project={project} />
                      </div>
                    )}
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
