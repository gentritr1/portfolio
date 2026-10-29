import { useImperativeHandle, useRef, type Ref } from 'react'
import { XIcon } from '@phosphor-icons/react'

export type FullSizeHandle = { open(focus?: [x: number, y: number]): void }

/**
 * A screen at the size a visitor saw it: captures 2400 px wide or more are 2× and show at half their pixels, smaller ones
 * at their own size. The view scrolls and pinch-zooms (NN/g: people expect to zoom into informational images); Close, a
 * click on the dimmed page, or Escape closes it, and focus goes back to what opened it. The image loads only when the view
 * opens (lazy inside a closed dialog), so it never decodes during "Read the case". `focus` is a point in the
 * capture's own pixels to open centred on.
 */
export function FullSize({ src, w, h, alt, ref }: { src: string; w: number; h: number; alt: string; ref: Ref<FullSizeHandle> }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const k = w >= 2400 ? 0.5 : 1
  useImperativeHandle(ref, () => ({
    open(focus) {
      dialog.current?.showModal()
      const v = view.current
      if (v && focus) v.scrollTo({ left: focus[0] * k - v.clientWidth / 2, top: focus[1] * k - v.clientHeight / 2 })
    },
  }), [k])
  return (
    <dialog ref={dialog} className="re-sw-sheet" aria-label={`${alt}, at full size`} data-lenis-prevent onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close() }}>
      <div className="re-ch-demo-bar">
        <p>At full size · pinch or scroll to look around</p>
        <button type="button" onClick={() => dialog.current?.close()}>
          Close
          <XIcon size={16} weight="regular" aria-hidden="true" />
        </button>
      </div>
      <div ref={view} className="re-sw-sheet-view" tabIndex={0} aria-label={`${alt}, scrollable`}>
        <img src={src} width={w * k} height={h * k} alt={alt} loading="lazy" decoding="async" />
      </div>
    </dialog>
  )
}
