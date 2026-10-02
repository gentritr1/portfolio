import type { Icon } from '@phosphor-icons/react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

interface CommonProps {
  variant?: 'primary' | 'quiet'
  icon?: Icon
  children: ReactNode
  className?: string
}

type AnchorProps = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { href: string }
type NativeButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { href?: undefined }

export type ButtonProps = AnchorProps | NativeButtonProps

const base =
  'group inline-flex min-h-12 shrink-0 select-none items-center whitespace-nowrap rounded-full text-[0.95rem] font-medium transition-[transform,background-color,box-shadow,color] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary: 'gap-3 bg-accent py-1.5 pl-5 pr-1.5 sm:pl-6 text-on-accent shadow-float hover:bg-[color-mix(in_oklab,var(--accent)_86%,var(--ink))]',
  quiet: 'gap-2.5 px-4 text-ink sm:px-5 ring-1 ring-line-strong ring-inset hover:bg-accent-soft hover:ring-transparent',
}

function Content({ variant, icon: IconGlyph, children }: CommonProps) {
  if (variant === 'primary') {
    return (
      <>
        <span>{children}</span>
        {IconGlyph && (
          <span className="grid size-9 place-items-center rounded-full bg-[color-mix(in_oklab,var(--on-accent)_14%,transparent)] transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
            <IconGlyph weight="light" size={18} aria-hidden />
          </span>
        )}
      </>
    )
  }
  return (
    <>
      {IconGlyph && <IconGlyph weight="light" size={18} aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-y-px" />}
      <span>{children}</span>
    </>
  )
}

/**
 * Primary is the accent pill with the trailing icon in its own circle.
 * Quiet is the outlined secondary. An href renders an anchor.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', icon, children, className } = props
  const classes = cn(base, variants[variant], className)

  if (props.href !== undefined) {
    const { variant: _v, icon: _i, children: _c, className: _cl, ...anchorProps } = props
    return (
      <a {...anchorProps} className={classes}>
        <Content variant={variant} icon={icon}>
          {children}
        </Content>
      </a>
    )
  }

  const { variant: _v, icon: _i, children: _c, className: _cl, type = 'button', ...buttonProps } = props
  return (
    <button {...buttonProps} type={type} className={classes}>
      <Content variant={variant} icon={icon}>
        {children}
      </Content>
    </button>
  )
}
