import type { CSSProperties } from 'react'

/* An invented three-tier token set. Core values are computed here, so the
   token strip and the painted components read the same source. */

export type Mode = 'light' | 'dark'
export type Family = 'cobalt' | 'stone' | 'fern' | 'amber' | 'ember' | 'lagoon'

export const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type Step = (typeof steps)[number] | 0

const lightness: Record<(typeof steps)[number], number> = {
  50: 0.975, 100: 0.945, 200: 0.9, 300: 0.83, 400: 0.72, 500: 0.62, 600: 0.535, 700: 0.46, 800: 0.37, 900: 0.29, 950: 0.205,
}
const chromaShape: Record<(typeof steps)[number], number> = {
  50: 0.12, 100: 0.22, 200: 0.4, 300: 0.62, 400: 0.85, 500: 1, 600: 1, 700: 0.9, 800: 0.7, 900: 0.4, 950: 0.34,
}
const families: Record<Family, { hue: number; chroma: number }> = {
  cobalt: { hue: 259, chroma: 0.19 },
  stone: { hue: 268, chroma: 0.016 },
  fern: { hue: 154, chroma: 0.15 },
  amber: { hue: 68, chroma: 0.16 },
  ember: { hue: 24, chroma: 0.2 },
  lagoon: { hue: 208, chroma: 0.11 },
}

export const familyOrder: Family[] = ['cobalt', 'stone', 'fern', 'amber', 'ember', 'lagoon']

export function coreValue(family: Family, step: Step): string {
  if (step === 0) return `oklch(0.995 0.002 ${families[family].hue})`
  const { hue, chroma } = families[family]
  return `oklch(${lightness[step]} ${(chroma * chromaShape[step]).toFixed(3)} ${hue})`
}

export interface CoreRef {
  family: Family
  step: Step
}
const ref = (family: Family, step: Step): CoreRef => ({ family, step })
export const coreName = (core: CoreRef) => `${core.family}.${core.step}`
const coreVar = (core: CoreRef) => `var(--core-${core.family}-${core.step})`

export const semantic: Record<string, Record<Mode, CoreRef>> = {
  'surface.page': { light: ref('stone', 50), dark: ref('stone', 950) },
  'surface.raised': { light: ref('stone', 0), dark: ref('stone', 900) },
  'surface.sunken': { light: ref('stone', 100), dark: ref('stone', 800) },
  'surface.overlay': { light: ref('stone', 0), dark: ref('stone', 800) },
  'text.primary': { light: ref('stone', 900), dark: ref('stone', 50) },
  'text.secondary': { light: ref('stone', 600), dark: ref('stone', 300) },
  'border.subtle': { light: ref('stone', 200), dark: ref('stone', 800) },
  'border.control': { light: ref('stone', 500), dark: ref('stone', 500) },
  'action.primary': { light: ref('cobalt', 600), dark: ref('cobalt', 400) },
  'action.primary.hover': { light: ref('cobalt', 700), dark: ref('cobalt', 300) },
  'action.on': { light: ref('stone', 0), dark: ref('stone', 950) },
  'action.soft': { light: ref('cobalt', 50), dark: ref('cobalt', 900) },
  'action.soft.text': { light: ref('cobalt', 700), dark: ref('cobalt', 200) },
  'border.focus': { light: ref('cobalt', 500), dark: ref('cobalt', 300) },
  'status.neutral': { light: ref('stone', 600), dark: ref('stone', 300) },
  'status.neutral.soft': { light: ref('stone', 100), dark: ref('stone', 950) },
  'status.info': { light: ref('lagoon', 600), dark: ref('lagoon', 400) },
  'status.info.soft': { light: ref('lagoon', 50), dark: ref('lagoon', 950) },
  'status.success': { light: ref('fern', 600), dark: ref('fern', 400) },
  'status.success.soft': { light: ref('fern', 50), dark: ref('fern', 950) },
  'status.warning': { light: ref('amber', 700), dark: ref('amber', 400) },
  'status.warning.soft': { light: ref('amber', 50), dark: ref('amber', 950) },
  'status.danger': { light: ref('ember', 600), dark: ref('ember', 400) },
  'status.danger.soft': { light: ref('ember', 50), dark: ref('ember', 950) },
}

export const component: Record<string, keyof typeof semantic> = {
  'button.solid.bg': 'action.primary',
  'button.solid.hover': 'action.primary.hover',
  'button.solid.text': 'action.on',
  'card.surface': 'surface.raised',
  'card.border': 'border.subtle',
  'field.surface': 'surface.raised',
  'field.text': 'text.primary',
  'field.border': 'border.control',
  'field.focus.ring': 'border.focus',
  'alert.success.icon': 'status.success',
  'tab.active.bg': 'action.primary',
  'tab.active.text': 'action.on',
}

const cssName = (token: string) => `--${token.replaceAll('.', '-')}`

const coreVars: Record<string, string> = {}
for (const family of familyOrder) {
  coreVars[`--core-${family}-0`] = coreValue(family, 0)
  for (const step of steps) coreVars[`--core-${family}-${step}`] = coreValue(family, step)
}

const componentVars = Object.fromEntries(Object.entries(component).map(([token, role]) => [cssName(token), `var(${cssName(role)})`]))

export function tokenStyle(mode: Mode): CSSProperties {
  const semanticVars = Object.fromEntries(Object.entries(semantic).map(([token, refs]) => [cssName(token), coreVar(refs[mode])]))
  return { ...coreVars, ...semanticVars, ...componentVars } as CSSProperties
}

/** The lanes the strip draws: one component token, its role, and the core value under each mode. */
export const lanes: { component: string; preview: 'button' | 'card' | 'text' | 'icon' | 'ring' }[] = [
  { component: 'button.solid.bg', preview: 'button' },
  { component: 'card.surface', preview: 'card' },
  { component: 'field.text', preview: 'text' },
  { component: 'alert.success.icon', preview: 'icon' },
  { component: 'field.focus.ring', preview: 'ring' },
]
