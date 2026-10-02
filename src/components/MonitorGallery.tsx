import { useState } from 'react'
import { FrameDialog } from './case/FrameDialog'
import type { ShowcaseItem } from './Showcase'

/** Store frames side by side on a monitor stage. The rail scrolls when the frames are wider than the stage; a frame opens large in a dialog. */
export function MonitorGallery({ items }: { items: ShowcaseItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <ul className="absolute inset-0 flex snap-x snap-mandatory scroll-px-[6%] items-center gap-3 overflow-x-auto bg-panel-2 px-[6%] sm:gap-4">
        {items.map((item, index) => (
          <li key={item.src} className="h-[80%] shrink-0 snap-center lg:h-[78%]">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setOpen(index)}
              className="group block h-full cursor-zoom-in overflow-hidden rounded-md border border-hairline bg-panel-1 transition-[border-color,transform] duration-150 ease-out hover:border-hairline-strong active:scale-[0.99]"
            >
              <img
                src={item.src}
                width={item.width}
                height={item.height}
                alt={item.alt}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
                className="block h-full w-auto"
              />
            </button>
          </li>
        ))}
      </ul>
      <FrameDialog items={items} index={open} onIndexChange={setOpen} />
    </>
  )
}
