import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { cn } from '../lib/cn'

type Theme = 'light' | 'dark'

/** Matches --panel-0 in each theme. */
const THEME_COLOR: Record<Theme, string> = { light: '#ebedf0', dark: '#0e1012' }

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
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

/** Dark is the default; daylight is stored as "light" under the `theme` key. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = next === 'light' ? 'Switch to daylight theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={label}
      title={label}
      className={cn(
        'relative grid size-11 shrink-0 place-items-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-200 ease-out hover:bg-panel-2 hover:text-ink active:scale-[0.96]',
        className,
      )}
    >
      <MoonIcon
        size={19}
        weight="light"
        aria-hidden
        className={cn(
          'col-start-1 row-start-1 transition-[opacity,rotate] duration-200 ease-out motion-reduce:transition-none',
          theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0',
        )}
      />
      <SunIcon
        size={19}
        weight="light"
        aria-hidden
        className={cn(
          'col-start-1 row-start-1 transition-[opacity,rotate] duration-200 ease-out motion-reduce:transition-none',
          theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-45 opacity-0',
        )}
      />
    </button>
  )
}
