# World builder contract

Each world is one folder. Builders work in parallel, so stay inside your folder.

```
src/worlds/
  _template/      reference usage, not rendered
  healthcare/     HealthcareWorld   + Recreation ("Vitals trend card")
  streaming/      StreamingWorld    + Recreation ("Live room")
  reading/        ReadingWorld      + Recreation ("Reader page")
  web3/           Web3World         + Recreation ("Wallet card")
  ai/             AiDashboardsWorld + Recreation ("Document chat")
```

## What you own

- `Recreation.tsx`: replace the `StagePlaceholder` with the live recreation from CONTENT.md. Export stays `Recreation`, no props.
- `index.tsx`: you may tune `layout`, `stageAspect`, `stageAspectMobile`. Copy stays as CONTENT.md gives it.
- Extra files in your folder (data, sub-components) are fine.

## What you do not touch

`src/components/`, `src/lib/`, `src/styles/globals.css`, `src/App.tsx`, other worlds. If the foundation lacks something, ask; do not fork it.

## Imports you use

```tsx
import { World, StagePlaceholder } from '../../components/World'
import { Chip } from '../../components/Chip'
import { Reveal, RevealGroup, RevealItem } from '../../components/Reveal'
import { ease, duration, stagger, travel, usePrefersReducedMotion } from '../../lib/motion'
import { motion, AnimatePresence } from 'motion/react'
import { SomethingIcon } from '@phosphor-icons/react' // weight="light" or "thin"
```

## The stage

The recreation renders inside the stage core:

- `position: relative`, `overflow: hidden`, radius 14 px, `bg-surface`. Fill it with `absolute inset-0` or `h-full w-full`.
- It is a size container. Use `@sm:`, `@md:` variants and `cqi` units so the recreation fits the stage, not the page.
- The section scopes your world's tokens. Use `bg-accent`, `bg-accent-soft`, `text-accent-ink`, `text-on-accent`, `bg-surface`, `text-ink`, `text-muted`, `border-line`. You may add local CSS variables for one-off shades, but derive them from the tokens with `color-mix(in oklab, ...)`. Never mix `in oklch`.
- It must work in light and dark. Check both.
- It must fit at 375 px (stage width about 335 px) and at 1440 px.

## Rules

- Invented data only. No product names, no client, tenant, patient or colleague names, no real URLs or hosts (PRODUCT.md, NDA).
- Every control is a real `<button>` or input with a visible focus ring (the global `:focus-visible` style applies) and a 44 px hit area.
- Motion: tokens from `src/lib/motion.ts`, `transform` / `opacity` / `clip-path` only, full `transform` strings in `motion`.
- Loops (chat messages, tickers, scan lines) run only while the stage is on screen (IntersectionObserver or `useInView` from `motion/react`) and stop under reduced motion. Timers clear on unmount.
- Reduced motion keeps the recreation usable: state changes still happen, without travel.
- No emoji. Icons from `@phosphor-icons/react` only.
- No em dashes in visible copy.

## Done means

`source ~/.nvm/nvm.sh && npx tsc -b --noEmit && npm run build` is clean, there are no console errors, and the recreation reads at 375 px and 1440 px in both themes.
