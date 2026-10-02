import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router'

/** On a route change, scrolls to the hash target when there is one, otherwise to the top. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
