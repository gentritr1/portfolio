import type { SVGProps } from 'react'

interface ShellIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

/** Only the light weight is used in the initial shell.
 * Paths are unchanged from Phosphor Icons; license: /licenses/phosphor-icons.txt.
 */
function ShellIcon({ size = 16, children, ...props }: ShellIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      {children}
    </svg>
  )
}

export function ArrowLeftIcon(props: ShellIconProps) {
  return <ShellIcon {...props}><path d="M222,128a6,6,0,0,1-6,6H54.49l61.75,61.76a6,6,0,1,1-8.48,8.48l-72-72a6,6,0,0,1,0-8.48l72-72a6,6,0,0,1,8.48,8.48L54.49,122H216A6,6,0,0,1,222,128Z" /></ShellIcon>
}

export function ArrowRightIcon(props: ShellIconProps) {
  return <ShellIcon {...props}><path d="M220.24,132.24l-72,72a6,6,0,0,1-8.48-8.48L201.51,134H40a6,6,0,0,1,0-12H201.51L139.76,60.24a6,6,0,0,1,8.48-8.48l72,72A6,6,0,0,1,220.24,132.24Z" /></ShellIcon>
}

export function ArrowUpRightIcon(props: ShellIconProps) {
  return <ShellIcon {...props}><path d="M198,64V168a6,6,0,0,1-12,0V78.48L68.24,196.24a6,6,0,0,1-8.48-8.48L177.52,70H88a6,6,0,0,1,0-12H192A6,6,0,0,1,198,64Z" /></ShellIcon>
}

export function DownloadSimpleIcon(props: ShellIconProps) {
  return <ShellIcon {...props}><path d="M222,144v64a6,6,0,0,1-6,6H40a6,6,0,0,1-6-6V144a6,6,0,0,1,12,0v58H210V144a6,6,0,0,1,12,0Zm-98.24,4.24a6,6,0,0,0,8.48,0l40-40a6,6,0,0,0-8.48-8.48L134,129.51V32a6,6,0,0,0-12,0v97.51L92.24,99.76a6,6,0,0,0-8.48,8.48Z" /></ShellIcon>
}
