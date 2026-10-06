import type { CSSProperties } from 'react'
import type { Px, ScreenShot } from '../content/careShots'

interface CropShotProps {
  shot: ScreenShot
  /** Defaults to the shot's own crop. */
  crop?: Px
  className?: string
  style?: CSSProperties
  eager?: boolean
  /** Empty when a caption or a label next to the shot already names it. */
  alt?: string
  /**
   * Fill the parent box and cover it, instead of taking the crop's own shape.
   * The parent must have a size and `position: relative`.
   */
  fill?: boolean
}

/** One crop of a screenshot. The box keeps the crop's shape before the image loads. */
export function CropShot({ shot, crop = shot.crop, className, style, eager = false, alt = shot.alt, fill = false }: CropShotProps) {
  const ratio = crop.w / crop.h
  const image = (
    <img
      src={shot.src}
      alt={alt}
      width={shot.width}
      height={shot.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{
        position: 'absolute',
        maxWidth: 'none',
        width: `${(shot.width / crop.w) * 100}%`,
        height: `${(shot.height / crop.h) * 100}%`,
        left: `${(-crop.x / crop.w) * 100}%`,
        top: `${(-crop.y / crop.h) * 100}%`,
      }}
    />
  )
  if (!fill)
    return (
      <span
        className={className}
        style={{ display: 'block', position: 'relative', overflow: 'hidden', aspectRatio: `${crop.w} / ${crop.h}`, background: shot.ground, ...style }}
      >
        {image}
      </span>
    )
  return (
    <span
      className={className}
      style={{ display: 'block', position: 'absolute', inset: 0, overflow: 'hidden', containerType: 'size', background: shot.ground, ...style }}
    >
      <span
        style={{
          display: 'block',
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: `max(100cqw, ${ratio} * 100cqh)`,
          height: `max(100cqh, 100cqw / ${ratio})`,
        }}
      >
        {image}
      </span>
    </span>
  )
}
