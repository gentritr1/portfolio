import { useState } from 'react'
import { cn } from '../lib/cn'

type Theme = 'light' | 'dark'

/** Matches --panel-0 in each theme. */
const THEME_COLOR: Record<Theme, string> = { light: '#f0efe9', dark: '#101112' }

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
/* Exact Phosphor light paths; unused weights are omitted. License: /licenses/phosphor-icons.txt. */
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
      <svg
        width={19}
        height={19}
        viewBox="0 0 256 256"
        fill="currentColor"
        aria-hidden
        className={cn(
          'col-start-1 row-start-1 transition-[opacity,rotate] duration-200 ease-out motion-reduce:transition-none',
          theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0',
        )}
      >
        <path d="M232.13,143.64a6,6,0,0,0-6-1.49A90.07,90.07,0,0,1,113.86,29.85a6,6,0,0,0-7.49-7.48A102.88,102.88,0,0,0,54.48,58.68,102,102,0,0,0,197.32,201.52a102.88,102.88,0,0,0,36.31-51.89A6,6,0,0,0,232.13,143.64Zm-42,48.29a90,90,0,0,1-126-126A90.9,90.9,0,0,1,99.65,37.66,102.06,102.06,0,0,0,218.34,156.35,90.9,90.9,0,0,1,190.1,191.93Z" />
      </svg>
      <svg
        width={19}
        height={19}
        viewBox="0 0 256 256"
        fill="currentColor"
        aria-hidden
        className={cn(
          'col-start-1 row-start-1 transition-[opacity,rotate] duration-200 ease-out motion-reduce:transition-none',
          theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-45 opacity-0',
        )}
      >
        <path d="M122,40V16a6,6,0,0,1,12,0V40a6,6,0,0,1-12,0Zm68,88a62,62,0,1,1-62-62A62.07,62.07,0,0,1,190,128Zm-12,0a50,50,0,1,0-50,50A50.06,50.06,0,0,0,178,128ZM59.76,68.24a6,6,0,1,0,8.48-8.48l-16-16a6,6,0,0,0-8.48,8.48Zm0,119.52-16,16a6,6,0,1,0,8.48,8.48l16-16a6,6,0,1,0-8.48-8.48ZM192,70a6,6,0,0,0,4.24-1.76l16-16a6,6,0,0,0-8.48-8.48l-16,16A6,6,0,0,0,192,70Zm4.24,117.76a6,6,0,0,0-8.48,8.48l16,16a6,6,0,0,0,8.48-8.48ZM46,128a6,6,0,0,0-6-6H16a6,6,0,0,0,0,12H40A6,6,0,0,0,46,128Zm82,82a6,6,0,0,0-6,6v24a6,6,0,0,0,12,0V216A6,6,0,0,0,128,210Zm112-88H216a6,6,0,0,0,0,12h24a6,6,0,0,0,0-12Z" />
      </svg>
    </button>
  )
}
