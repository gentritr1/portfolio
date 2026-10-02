import { ArrowDownIcon, ArrowRightIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { links } from '../content/links'
import { duration, ease, usePrefersReducedMotion } from '../lib/motion'
import { primaryWorlds, worlds } from '../lib/worlds'

/** Bars rise on wide screens and sweep in from the left on narrow ones. */
function useBarEntrance() {
  const reduce = usePrefersReducedMotion()
  const [wide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  if (reduce) return { hidden: { opacity: 0 }, shown: { opacity: 1 } }
  return {
    hidden: { clipPath: wide ? 'inset(100% 0% 0% 0% round 16px)' : 'inset(0% 100% 0% 0% round 12px)' },
    shown: { clipPath: 'inset(0% 0% 0% 0% round 16px)', transitionEnd: { clipPath: 'none' } },
  }
}

function TestCard() {
  const variants = useBarEntrance()
  return (
    <div className="lg:col-span-5">
      <ul aria-label="The four worlds" className="grid grid-cols-1 gap-1.5 lg:h-[min(60vh,34rem)] lg:grid-cols-4 lg:gap-2">
        {primaryWorlds.map((id, index) => {
          const info = worlds[id]
          return (
            <motion.li
              key={id}
              variants={variants}
              initial="hidden"
              animate="shown"
              transition={{ duration: duration.enter + 0.2, ease: ease.out, delay: 0.25 + index * 0.07 }}
            >
              <a
                href={`#${id}`}
                data-world={id}
                className="group flex h-12 items-center justify-between gap-3 rounded-[12px] bg-accent px-4 text-on-accent transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98] lg:h-full lg:flex-col lg:items-start lg:justify-end lg:rounded-panel lg:p-3.5"
              >
                <ArrowDownIcon
                  size={18}
                  weight="light"
                  aria-hidden
                  className="hidden opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 lg:mb-auto lg:block"
                />
                <span className="font-display text-[1.0625rem] font-medium leading-tight tracking-[-0.01em]">{info.label}</span>
                <span className="tabular whitespace-nowrap font-mono text-[0.72rem] opacity-80">{info.short}</span>
              </a>
            </motion.li>
          )
        })}
      </ul>
      <Reveal
        immediate
        delay={0.6}
        className="mt-4 grid grid-cols-1 gap-1 border-t sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.6fr)_minmax(0,1.1fr)] sm:gap-4 border-line pt-4 font-mono text-meta text-muted"
      >
        <p className="tabular">5+ years</p>
        <p>React, React Native, Vue, TypeScript, Laravel</p>
        <p>Based in Kosovo, working remotely</p>
      </Reveal>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" data-world="base" data-world-section aria-labelledby="hero-title">
      <Container className="grid min-h-[100dvh] grid-cols-1 content-center gap-12 pb-10 pt-24 lg:grid-cols-12 lg:items-center lg:gap-x-12 lg:pb-14 lg:pt-28">
        <RevealGroup immediate gap={0.06} delay={0.05} className="lg:col-span-7">
          <RevealItem>
            <h1 id="hero-title" className="text-display text-ink">
              Gentrit Rashiti
            </h1>
          </RevealItem>
          <RevealItem
            as="p"
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-h3 font-normal text-ink"
          >
            <span>Frontend & Mobile Developer</span>
            <ArrowRightIcon size="0.9em" weight="light" aria-label="moving to" className="text-muted" />
            <span>Full Stack</span>
          </RevealItem>
          <RevealItem as="p" className="mt-6 max-w-[36ch] text-lede text-muted">
            I build web and mobile products from the first screen to release, in healthcare, video streaming, e‑reading
            and Web3.
          </RevealItem>
          <RevealItem className="mt-9 flex flex-wrap gap-3">
            <Button href="#work" icon={ArrowDownIcon}>
              See the work
            </Button>
            <Button href={links.cv} download variant="quiet" icon={DownloadSimpleIcon}>
              Download CV
            </Button>
          </RevealItem>
        </RevealGroup>
        <TestCard />
      </Container>
    </section>
  )
}
