import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, type LinkProps } from 'react-router'

interface TransitionLinkProps extends Omit<LinkProps, 'viewTransition' | 'to'> {
  to: string
  /** Starts the destination's imports on hover and focus, and finishes them before the transition starts. */
  preload?: () => Promise<unknown>
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Link that wraps the navigation in a view transition. React Router's own
 * `viewTransition` prop needs a data router; this app uses the declarative
 * BrowserRouter with synchronous updates, so flushSync commits the new route
 * inside the transition callback.
 */
export function TransitionLink({ to, preload, onClick, onPointerEnter, onFocus, target, ...rest }: TransitionLinkProps) {
  const navigate = useNavigate()

  async function go() {
    try {
      await preload?.()
    } catch {
      // A failed import surfaces again when the route renders.
    }
    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      navigate(to)
      return
    }
    document.startViewTransition(() => {
      flushSync(() => navigate(to))
    })
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return
    if (target && target !== '_self') return
    event.preventDefault()
    void go()
  }

  return (
    <Link
      to={to}
      target={target}
      onClick={handleClick}
      onPointerEnter={(event) => {
        void preload?.().catch(() => undefined)
        onPointerEnter?.(event)
      }}
      onFocus={(event) => {
        void preload?.().catch(() => undefined)
        onFocus?.(event)
      }}
      {...rest}
    />
  )
}
