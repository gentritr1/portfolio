import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import { duration, ease } from '../lib/motion'

type Theme = 'light' | 'dark'

const THEME_COLOR: Record<Theme, string> = { light: '#f3f5f8', dark: '#121418' }
const DARK_QUERY = '(prefers-color-scheme: dark)'

function chosenTheme(): Theme | null {
  const value = document.documentElement.dataset.theme
  return value === 'light' || value === 'dark' ? value : null
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', THEME_COLOR[theme]))
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Storage can be blocked; the choice then lasts for this page view only.
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => chosenTheme() ?? systemTheme())

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => {
      if (!chosenTheme()) setTheme(systemTheme())
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const Glyph = theme === 'dark' ? MoonIcon : SunIcon

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-accent-soft active:scale-[0.96]',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={theme}
          className="grid place-items-center"
          initial={{ opacity: 0, transform: 'rotate(-60deg) scale(0.9)' }}
          animate={{ opacity: 1, transform: 'rotate(0deg) scale(1)' }}
          exit={{ opacity: 0, transform: 'rotate(60deg) scale(0.9)' }}
          transition={{ duration: duration.ui, ease: ease.out }}
        >
          <Glyph size={20} weight="light" aria-hidden />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
