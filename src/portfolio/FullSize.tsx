import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'

export type FullSizeHandle = { open(focus?: [x: number, y: number]): void }

/**
 * A screen at the size a visitor saw it: captures 2400 px wide or more are 2× and show at half their pixels, smaller ones
 * at their own size. The view scrolls and pinch-zooms (NN/g: people expect to zoom into informational images); Close, a
 * click on the dimmed page, or Escape closes it, and focus goes back to what opened it. The image loads only when the view
 * opens (lazy inside a closed dialog), so it never decodes during "Read the case". `focus` is a point in the
 * capture's own pixels to open centred on. With `step`, ‹ › and the arrow keys move to the previous or next screen; the
 * arrows are left to the view itself while it has focus, so they still pan a large screen. `refocus` runs on close when
 * what opened the view is gone (a step unmounted it): focus is then still on a hidden control inside the dialog, and the
 * browser would drop it on <body> a moment later.
 */
export function FullSize({ src, w, h, alt, label, step, refocus, ref }: {
  src: string; w: number; h: number; alt: string; label?: string; step?(d: 1 | -1): void; refocus?(): void; ref: Ref<FullSizeHandle>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const k = w >= 2400 ? 0.5 : 1
  useImperativeHandle(ref, () => ({
    open(focus) {
      dialog.current?.showModal()
      const v = view.current
      if (v) v.scrollTo(focus ? { left: focus[0] * k - v.clientWidth / 2, top: focus[1] * k - v.clientHeight / 2 } : { left: 0, top: 0 })
    },
  }), [k])
  // A stepped-to screen starts from its top-left corner.
  useEffect(() => { view.current?.scrollTo({ left: 0, top: 0 }) }, [src])
  return (
    <dialog
      ref={dialog} className="re-sw-sheet" aria-label={`${alt}, at full size`}
      onClose={() => { const a = document.activeElement; if (!a || a === document.body || dialog.current?.contains(a)) refocus?.() }}
      onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close() }}
      onKeyDown={(e) => {
        if (!step || e.target === view.current || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
        e.preventDefault()
        step(e.key === 'ArrowLeft' ? -1 : 1)
      }}
    >
      <div className="re-ch-demo-bar">
        <p>{label && <span className="re-sw-sheet-name">{label}</span>}<span className="re-sw-sheet-hint">At full size · pinch or scroll to look around</span></p>
        {step && (
          <>
            <button type="button" className="re-sw-sheet-step" aria-label="Previous screen" onClick={() => step(-1)}><CaretLeftIcon size={18} weight="regular" aria-hidden="true" /></button>
            <button type="button" className="re-sw-sheet-step" aria-label="Next screen" onClick={() => step(1)}><CaretRightIcon size={18} weight="regular" aria-hidden="true" /></button>
          </>
        )}
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
