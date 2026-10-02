import { ArrowUpRightIcon, XIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Reveal, RevealGroup, RevealItem } from '../../components/Reveal'

interface Frame {
  src: string
  width: number
  height: number
  alt: string
}

interface App {
  id: string
  name: string
  kind: string
  frames: Frame[]
  links: { label: string; href: string }[]
}

const iphone = { width: 780, height: 1689 }
const android = { width: 780, height: 1387 }

const apps: App[] = [
  {
    id: 'read-to-feed',
    name: 'Read to Feed',
    kind: "Children's reading app",
    frames: [
      { src: '/mobile/reading-1.webp', ...iphone, alt: 'Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables' },
      { src: '/mobile/reading-2.webp', ...iphone, alt: 'Read to Feed store screenshot: achievements screen with eggs collected and quiz badges' },
      { src: '/mobile/reading-3.webp', ...iphone, alt: 'Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot' },
      { src: '/mobile/reading-4.webp', ...iphone, alt: 'Read to Feed store screenshot: New Badge pop-up for 50,000 eggs' },
    ],
    links: [
      { label: 'App Store (archived)', href: 'https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765' },
      { label: 'Google Play (archived)', href: 'https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf' },
    ],
  },
  {
    id: 'dukagjini-bookstore',
    name: 'Dukagjini Bookstore',
    kind: 'Bookstore app',
    frames: [
      { src: '/mobile/bookstore-1.webp', ...iphone, alt: 'Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale' },
      { src: '/mobile/bookstore-2.webp', ...iphone, alt: 'Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites' },
      { src: '/mobile/bookstore-3.webp', ...iphone, alt: 'Dukagjini Bookstore store screenshot: sheet with favourite lists and book categories' },
    ],
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks' },
    ],
  },
  {
    id: 'viva-fresh',
    name: 'Viva Fresh',
    kind: 'Grocery shopping and loyalty app',
    frames: [
      { src: '/mobile/grocery-1.webp', ...iphone, alt: 'Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface' },
      { src: '/mobile/grocery-2.webp', ...iphone, alt: 'Viva Fresh store screenshot on iPhone: Fresh category with a product grid and the cart total' },
      { src: '/mobile/grocery-3.webp', ...iphone, alt: 'Viva Fresh store screenshot on iPhone: cart with quantities, discount and checkout button' },
      { src: '/mobile/grocery-4.webp', ...android, alt: 'Viva Fresh store screenshot on Android: home with product categories and latest products' },
      { src: '/mobile/grocery-5.webp', ...android, alt: 'Viva Fresh store screenshot on Android: cart with quantities and checkout button' },
      { src: '/mobile/grocery-6.webp', ...android, alt: 'Viva Fresh store screenshot on Android: Fresh category with a product grid' },
    ],
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/viva-fresh/id1580739480' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zs.vivafresh' },
    ],
  },
]

export function PublishedApps() {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState<Frame | null>(null)

  const show = (frame: Frame, button: HTMLButtonElement) => {
    trigger.current = button
    setOpen(frame)
    dialog.current?.showModal()
  }

  return (
    <div className="border-t border-line pt-8">
      <Reveal as="div">
        <h3 className="text-h3 font-medium text-ink">Published apps</h3>
        <p className="mt-2 font-mono text-meta text-muted">Screenshots from the public store pages. Select one to enlarge it.</p>
      </Reveal>

      <div className="mt-10 flex flex-col gap-12">
        {apps.map((app) => (
          <section key={app.id} aria-labelledby={`${app.id}-name`}>
            <Reveal as="div" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 id={`${app.id}-name`} className="font-display text-[1.1875rem] font-medium tracking-[-0.01em] text-ink">
                {app.name}
              </h4>
              <p className="font-mono text-meta text-muted">{app.kind}</p>
            </Reveal>
            <RevealGroup
              as="ul"
              gap={0.04}
              className="-mx-gutter mt-4 flex snap-x snap-mandatory scroll-px-gutter items-start gap-3 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {app.frames.map((frame) => (
                <RevealItem as="li" key={frame.src} className="w-[40%] shrink-0 snap-start sm:w-[26%] md:w-[21%] lg:w-auto">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`Enlarge: ${frame.alt}`}
                    onClick={(event) => show(frame, event.currentTarget)}
                    className="block w-full cursor-zoom-in overflow-hidden rounded-[12px] border border-line bg-surface transition-[border-color,translate] duration-200 ease-out hover:border-line-strong motion-safe:hover:-translate-y-0.5"
                  >
                    <img
                      src={frame.src}
                      width={frame.width}
                      height={frame.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-full"
                    />
                  </button>
                </RevealItem>
              ))}
            </RevealGroup>
            <ul className="mt-4 flex flex-wrap gap-2">
              {app.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[0.9375rem] text-ink ring-1 ring-line-strong ring-inset transition-[background-color,box-shadow] duration-200 ease-out hover:bg-accent-soft hover:ring-transparent"
                  >
                    {link.label}
                    <ArrowUpRightIcon
                      size={15}
                      weight="light"
                      aria-hidden
                      className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-label={open?.alt}
        onClose={() => {
          setOpen(null)
          trigger.current?.focus()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
        className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-[oklch(0.14_0.01_258/0.82)]"
      >
        {open && (
          <div className="relative">
            <img
              src={open.src}
              width={open.width}
              height={open.height}
              alt={open.alt}
              className="block h-auto max-h-[88svh] w-auto max-w-[calc(100vw-2rem)] rounded-[14px] bg-surface"
            />
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              aria-label="Close the screenshot"
              className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] text-ink shadow-float ring-1 ring-line transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
            >
              <XIcon size={18} weight="light" aria-hidden />
            </button>
          </div>
        )}
      </dialog>
    </div>
  )
}
