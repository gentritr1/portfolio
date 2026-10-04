import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router'
import { links } from '../../content/links'
import { preloadCase } from '../../lib/routes'

/** Old drafts share native controls, not a visual system. Styles stay in each draft. */
export function OldDraftMotion() {
  const marker = useRef<HTMLSpanElement>(null)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const root = marker.current?.parentElement
    if (!root) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const timers = new Map<HTMLElement, number>()
    const disclosures = new Map<HTMLDetailsElement, { animation: Animation; opening: boolean; content: Animation[] }>()
    let mounted = true
    let navigating = false
    let noticeTimer = 0

    function control(target: EventTarget | null) {
      return target instanceof Element ? target.closest<HTMLElement>('button,a,summary') : null
    }
    function acknowledge(target: HTMLElement) {
      window.clearTimeout(timers.get(target))
      target.dataset.motionDone = 'true'
      timers.set(target, window.setTimeout(() => { delete target.dataset.motionDone; timers.delete(target) }, 1100))
    }
    function toggle(details: HTMLDetailsElement, summary: HTMLElement) {
      const previous = disclosures.get(details)
      const opening = previous ? !previous.opening : !details.open
      const from = details.getBoundingClientRect().height
      const children = Array.from(details.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child !== summary)
      const snapshots = children.map(child => {
        const style = getComputedStyle(child)
        return { opacity: style.opacity, transform: style.transform, filter: style.filter }
      })
      previous?.animation.cancel()
      previous?.content.forEach(animation => animation.cancel())
      details.style.height = `${from}px`
      details.style.overflow = 'hidden'
      details.open = true
      details.style.height = 'auto'
      const box = getComputedStyle(details)
      const to = opening ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + parseFloat(box.borderTopWidth) + parseFloat(box.borderBottomWidth)
      details.style.height = `${from}px`
      const duration = reduced.matches ? 10 : 220
      const animation = details.animate({ height: [`${from}px`, `${to}px`] }, { duration, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' })
      const content = children.map((child, index) => {
        const current = snapshots[index]
        return child.animate([
          { opacity: previous ? current.opacity : opening ? 0 : 1, transform: previous ? current.transform : opening && !reduced.matches ? 'translateY(8px)' : 'none', filter: previous ? current.filter : opening && !reduced.matches ? 'blur(4px)' : 'blur(0)' },
          { opacity: opening ? 1 : 0, transform: !opening && !reduced.matches ? 'translateY(8px)' : 'none', filter: !opening && !reduced.matches ? 'blur(4px)' : 'blur(0)' },
        ], { duration, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'both' })
      })
      disclosures.set(details, { animation, opening, content })
      animation.onfinish = () => {
        if (disclosures.get(details)?.animation !== animation) return
        details.open = opening
        details.style.removeProperty('height')
        details.style.removeProperty('overflow')
        animation.cancel()
        content.forEach(item => item.cancel())
        disclosures.delete(details)
      }
    }
    async function openCase(anchor: HTMLAnchorElement, path: string) {
      if (navigating) return
      navigating = true
      anchor.setAttribute('aria-busy', 'true')
      try {
        const slug = path.split('/').at(-1)!
        await preloadCase(slug)
        if (!mounted) return
        const existing = root!.querySelector<HTMLElement>(`[style*="monitor-${slug}"]`)
        const image = existing ?? anchor.querySelector<HTMLElement>('img') ?? anchor.closest('article,li,details,section')?.querySelector<HTMLElement>('img')
        const visible = image && image.getBoundingClientRect().bottom > 0 && image.getBoundingClientRect().top < innerHeight
        const priorName = image?.style.viewTransitionName
        if (visible) image.style.viewTransitionName = `monitor-${slug}`
        if (!reduced.matches && document.startViewTransition) {
          const transition = document.startViewTransition(() => flushSync(() => navigate(path)))
          await transition.finished.catch(() => undefined)
        } else navigate(path)
        if (image) image.style.viewTransitionName = priorName ?? ''
      } catch {
        // The native link remains a working fallback if a preload fails.
        if (mounted) window.location.assign(path)
      } finally { navigating = false; anchor.removeAttribute('aria-busy') }
    }
    function click(event: MouseEvent) {
      const target = control(event.target)
      if (!target || target.matches(':disabled,[aria-disabled="true"]')) return
      acknowledge(target)
      if (target instanceof HTMLAnchorElement && target.getAttribute('href') === links.cv) {
        setNotice(target.hasAttribute('download') ? 'CV download started.' : 'Opening the CV.')
        window.clearTimeout(noticeTimer)
        noticeTimer = window.setTimeout(() => setNotice(''), 3000)
      }
      if (target.tagName === 'SUMMARY' && target.parentElement instanceof HTMLDetailsElement && !event.defaultPrevented) {
        event.preventDefault()
        toggle(target.parentElement, target)
      }
      if (target instanceof HTMLAnchorElement && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !target.target) {
        const url = new URL(target.href)
        if (url.origin === location.origin && url.pathname.startsWith('/work/')) {
          event.preventDefault()
          void openCase(target, url.pathname)
        }
      }
    }
    function press(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const target = control(event.target)
      if (target) target.dataset.motionPressed = 'true'
    }
    function release(event: Event) {
      const target = control(event.target)
      if (target) delete target.dataset.motionPressed
    }
    function motionChange() {
      if (reduced.matches) disclosures.forEach(({ animation, content }) => { content.forEach(item => item.finish()); animation.finish() })
    }
    root.addEventListener('click', click, true)
    root.addEventListener('keydown', press, true)
    root.addEventListener('keyup', release, true)
    root.addEventListener('focusout', release, true)
    reduced.addEventListener('change', motionChange)
    return () => {
      mounted = false
      timers.forEach(timer => window.clearTimeout(timer))
      window.clearTimeout(noticeTimer)
      disclosures.forEach(({ animation, content }, details) => { animation.cancel(); content.forEach(item => item.cancel()); details.style.removeProperty('height'); details.style.removeProperty('overflow') })
      root.removeEventListener('click', click, true)
      root.removeEventListener('keydown', press, true)
      root.removeEventListener('keyup', release, true)
      root.removeEventListener('focusout', release, true)
      reduced.removeEventListener('change', motionChange)
    }
  }, [navigate])

  return <span ref={marker} className="old-draft-feedback" role="status" aria-live="polite" data-visible={Boolean(notice)}>{notice}</span>
}

