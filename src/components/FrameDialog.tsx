import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import type { ShowcaseItem } from './Showcase'

interface FrameDialogProps {
  items: ShowcaseItem[]
  /** The open frame, or null when the dialog is closed. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

const control =
  'grid size-11 shrink-0 place-items-center rounded-sm border border-hairline bg-panel-1 text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-panel-2 active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100'

/** One frame large in a native modal dialog, with previous and next. Escape closes it and focus returns to the opener. */
export function FrameDialog({ items, index, onIndexChange }: FrameDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const item = index === null ? null : items[index]

  useEffect(() => {
    const node = dialog.current
    if (item && node && !node.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      node.showModal()
    }
  }, [item])

  function step(delta: number) {
    if (index === null) return
    const nextIndex = index + delta
    if (nextIndex >= 0 && nextIndex < items.length) onIndexChange(nextIndex)
  }

  return (
    <dialog
      ref={dialog}
      aria-label={item ? `${item.caption}, ${(index ?? 0) + 1} of ${items.length}` : undefined}
      onClose={() => {
        onIndexChange(null)
        opener.current?.focus()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close()
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') step(-1)
        if (event.key === 'ArrowRight') step(1)
      }}
      className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 text-ink opacity-100 transition-[opacity,scale] duration-200 ease-out backdrop:bg-[color-mix(in_oklab,var(--panel-0)_92%,transparent)] starting:open:scale-[0.98] starting:open:opacity-0 motion-reduce:transition-none"
    >
      {item && index !== null && (
        <figure className="flex flex-col items-center gap-3">
          <div className="flex w-full items-center justify-between gap-4">
            <figcaption className="label text-ink-2">
              <span className="tabular text-ink-3">
                {index + 1} / {items.length}
              </span>
              <span className="ml-3">{item.caption}</span>
            </figcaption>
            <div className="flex gap-2">
              <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous frame" className={control}>
                <CaretLeftIcon size={18} weight="light" aria-hidden />
              </button>
              <button type="button" onClick={() => step(1)} disabled={index === items.length - 1} aria-label="Next frame" className={control}>
                <CaretRightIcon size={18} weight="light" aria-hidden />
              </button>
              <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close" className={control}>
                <XIcon size={18} weight="light" aria-hidden />
              </button>
            </div>
          </div>
          <img
            src={item.src}
            width={item.width}
            height={item.height}
            alt={item.alt}
            className="block h-[min(82vh,82svh)] w-auto max-w-[90vw] rounded-panel border border-hairline bg-panel-1 object-contain"
          />
        </figure>
      )}
    </dialog>
  )
}
