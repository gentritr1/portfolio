import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import { cn } from '../lib/cn'
import { FrameDialog } from './FrameDialog'

export interface ShowcaseLink {
  label: string
  href: string
}

export interface ShowcaseItem {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

interface ShowcaseProps {
  title: string
  links: ShowcaseLink[]
  items: ShowcaseItem[]
  aspect: 'web' | 'phone'
}

const layouts = {
  web: {
    list: 'lg:grid-cols-3',
    item: 'w-[82%] sm:w-[46%]',
    frame: 'aspect-[16/10]',
  },
  phone: {
    list: 'lg:grid-cols-6',
    item: 'w-[44%] sm:w-[28%]',
    frame: 'aspect-[9/19.5]',
  },
}

/**
 * Screenshots of public pages and store listings, with links to the live
 * product. A frame opens in the shared frame dialog, with previous and next.
 */
export function Showcase({ title, links, items, aspect }: ShowcaseProps) {
  const headingId = useId()
  const [open, setOpen] = useState<number | null>(null)
  const layout = layouts[aspect]

  return (
    <section aria-labelledby={headingId} className="border-t border-hairline pt-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h3 id={headingId} className="text-h3 text-ink">
          {title}
        </h3>
        {links.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-hairline-strong px-3 label text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-transparent hover:bg-panel-2"
                >
                  {link.label}
                  <ArrowUpRightIcon
                    size={14}
                    weight="light"
                    aria-hidden
                    className="text-tint transition-transform duration-200 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul
        className={cn(
          '-mx-gutter mt-5 flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:grid lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0',
          layout.list,
        )}
      >
        {items.map((item, index) => {
          const portrait = aspect === 'web' && item.height > item.width
          return (
            <li key={item.src} className={cn('shrink-0 snap-start lg:w-auto', layout.item)}>
              <figure>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setOpen(index)}
                  className={cn(
                    'group block w-full cursor-zoom-in overflow-hidden rounded-panel border border-hairline transition-[border-color,transform] duration-150 ease-out hover:border-hairline-strong active:scale-[0.99]',
                    layout.frame,
                    portrait ? 'bg-panel-2 p-3' : 'bg-panel-1',
                  )}
                >
                  <img
                    src={item.src}
                    width={item.width}
                    height={item.height}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      'block transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                      portrait ? 'mx-auto h-full w-auto rounded-sm' : 'size-full object-cover object-top',
                    )}
                  />
                </button>
                <figcaption className="mt-2 px-0.5 label text-ink-3">{item.caption}</figcaption>
              </figure>
            </li>
          )
        })}
      </ul>

      <FrameDialog items={items} index={open} onIndexChange={setOpen} />
    </section>
  )
}
