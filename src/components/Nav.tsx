import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type Ref } from 'react'
import { links } from '../content/links'
import { cn } from '../lib/cn'
import { duration, ease, stagger, usePrefersReducedMotion } from '../lib/motion'
import { worlds, type PageWorld } from '../lib/worlds'
import { ThemeToggle } from './ThemeToggle'

const items = [
  { href: '#work', label: 'Work' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#personal', label: 'Personal' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

function Monogram() {
  return (
    <a
      href="#top"
      aria-label="Gentrit Rashiti, back to top"
      className="grid size-11 shrink-0 place-items-center rounded-full bg-ink font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--world-bg)] transition-transform duration-200 ease-out active:scale-[0.96]"
    >
      GR
    </a>
  )
}

function WorldIndicator({ world }: { world: PageWorld }) {
  const label = world === 'base' ? null : worlds[world].label
  return (
    <span className="hidden w-[8.5rem] items-center gap-2 pl-1 font-mono text-meta text-muted xl:flex">
      <span aria-hidden className="h-2 w-5 shrink-0 rounded-[2px] bg-accent" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label ?? 'top'}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: duration.ui, ease: ease.out }}
          className="truncate"
        >
          {label ?? 'Top'}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function CvLink({ className }: { className?: string }) {
  return (
    <a
      href={links.cv}
      download
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-[0.875rem] font-medium text-on-accent transition-[transform,background-color] duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--accent)_86%,var(--ink))] active:scale-[0.97]',
        className,
      )}
    >
      <DownloadSimpleIcon size={17} weight="light" aria-hidden />
      CV
    </a>
  )
}

function MenuButton({
  open,
  onClick,
  controls,
  buttonRef,
}: {
  open: boolean
  onClick: () => void
  controls: string
  buttonRef: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? 'Close menu' : 'Open menu'}
      className="relative grid size-11 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-accent-soft"
    >
      <span
        aria-hidden
        className={cn(
          'absolute h-px w-5 bg-current transition-transform duration-[240ms] ease-out',
          open ? 'translate-y-0 rotate-45' : '-translate-y-[4px]',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute h-px w-5 bg-current transition-transform duration-[240ms] ease-out',
          open ? 'translate-y-0 -rotate-45' : 'translate-y-[4px]',
        )}
      />
    </button>
  )
}

function MobileOverlay({ id, onClose }: { id: string; onClose: () => void }) {
  const reduce = usePrefersReducedMotion()
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    firstLink.current?.focus()
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [])

  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24px)' },
    shown: reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' },
  }

  return (
    <motion.div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-(--z-overlay) flex flex-col bg-[color-mix(in_oklab,var(--world-bg)_88%,transparent)] px-gutter pb-10 pt-28 backdrop-blur-2xl md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration.ui, ease: ease.out }}
    >
      <motion.ul
        className="flex flex-col gap-1"
        initial="hidden"
        animate="shown"
        variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger.loose, delayChildren: 0.06 } } }}
      >
        {items.map((link, index) => (
          <motion.li key={link.href} variants={item} transition={{ duration: duration.reveal, ease: ease.out }}>
            <a
              ref={index === 0 ? firstLink : undefined}
              href={link.href}
              onClick={onClose}
              className="flex min-h-14 items-center font-display text-[2.5rem] font-medium leading-none tracking-[-0.03em] text-ink"
            >
              {link.label}
            </a>
          </motion.li>
        ))}
      </motion.ul>
      <motion.div
        className="mt-auto flex items-center justify-between border-t border-line pt-6"
        initial={item.hidden}
        animate={item.shown}
        transition={{ duration: duration.reveal, ease: ease.out, delay: 0.3 }}
      >
        <a href={links.github} className="font-mono text-meta text-muted underline-offset-4 hover:text-ink hover:underline">
          {links.githubLabel}
        </a>
        <CvLink />
      </motion.div>
    </motion.div>
  )
}

export function Nav({ world }: { world: PageWorld }) {
  const [open, setOpen] = useState(false)
  const overlayId = useId()
  const menuButton = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const outside = [...(header.current?.parentElement?.children ?? [])].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== header.current && el.id !== overlayId,
    )
    for (const el of outside) el.inert = true
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      menuButton.current?.focus()
    }
    const media = window.matchMedia('(min-width: 768px)')
    const onResize = () => {
      if (media.matches) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    media.addEventListener('change', onResize)
    return () => {
      for (const el of outside) el.inert = false
      window.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onResize)
    }
  }, [open, overlayId])

  return (
    <>
      <header ref={header} className="pointer-events-none fixed inset-x-0 top-3 z-(--z-nav) px-gutter md:top-4">
        <nav
          aria-label="Primary"
          className="pointer-events-auto mx-auto flex w-full max-w-[1200px] items-center justify-between gap-2 rounded-full bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] p-1.5 shadow-float ring-1 ring-line backdrop-blur-xl md:w-max md:justify-start"
        >
          <div className="flex items-center gap-2">
            <Monogram />
            <WorldIndicator world={world} />
          </div>

          <ul className="hidden items-center md:flex">
            {items.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.9rem] text-muted transition-colors duration-200 ease-out hover:bg-accent-soft hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <CvLink className="hidden md:inline-flex" />
            <ThemeToggle />
            <div className="md:hidden">
              <MenuButton
                open={open}
                onClick={() => setOpen((value) => !value)}
                controls={overlayId}
                buttonRef={menuButton}
              />
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>{open && <MobileOverlay id={overlayId} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  )
}
