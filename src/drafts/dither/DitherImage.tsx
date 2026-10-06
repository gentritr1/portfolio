import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Px } from '../../content/careShots'

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

interface DitherImageProps {
  src: string
  alt: string
  name: string
  colour: boolean
  /** A part of the image in `size` units. The plate covers its box with this part only. */
  crop?: Px & { size: [number, number] }
}

/** A finite image conversion, not a running render loop. The real image stays underneath. */
export default function DitherImage({ src, alt, name, colour, crop }: DitherImageProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let disposed = false
    const image = new Image()
    image.src = src
    void image.decode().then(() => {
      if (disposed || !canvas.current) return
      setLoaded(true)
      const node = canvas.current
      const context = node.getContext('2d', { willReadFrequently: true })
      if (!context) return
      // A deliberately coarse dot, with a bounded ~150k-pixel maximum conversion.
      const k = crop ? image.width / crop.size[0] : 1
      const part = crop ? { x: crop.x * k, y: crop.y * k, w: crop.w * k, h: crop.h * k } : { x: 0, y: 0, w: image.width, h: image.height }
      const scale = Math.min(1, 430 / part.w, 530 / part.h)
      node.width = Math.round(part.w * scale)
      node.height = Math.round(part.h * scale)
      context.drawImage(image, part.x, part.y, part.w, part.h, 0, 0, node.width, node.height)
      const frame = context.getImageData(0, 0, node.width, node.height)
      for (let y = 0; y < node.height; y++) {
        for (let x = 0; x < node.width; x++) {
          const offset = (y * node.width + x) * 4
          const light = (frame.data[offset] * 0.2126 + frame.data[offset + 1] * 0.7152 + frame.data[offset + 2] * 0.0722) / 255
          const white = light > (bayer[(y % 4) * 4 + x % 4] + 0.5) / 16
          frame.data[offset] = white ? 255 : 20
          frame.data[offset + 1] = white ? 253 : 22
          frame.data[offset + 2] = white ? 236 : 20
          frame.data[offset + 3] = 255
        }
      }
      context.putImageData(frame, 0, 0)
      setReady(true)
    }).catch(() => { /* The factual name poster and native image remain as fallbacks. */ })
    return () => { disposed = true }
  }, [src, crop])
  const place: CSSProperties | undefined = crop && {
    inset: 'auto',
    left: `${(-crop.x / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
    width: `${(crop.size[0] / crop.w) * 100}%`,
    height: `${(crop.size[1] / crop.h) * 100}%`,
    maxWidth: 'none',
  }
  const layers = <>
    <img className="dd-image-base" src={src} alt={alt} decoding="async" style={place} onLoad={() => setLoaded(true)} />
    <canvas ref={canvas} aria-hidden="true" data-ready={ready} />
    {crop
      ? <span className="dd-image-colour dd-image-layer"><img src={src} alt="" aria-hidden="true" decoding="async" style={place} /></span>
      : <img className="dd-image-colour" src={src} alt="" aria-hidden="true" decoding="async" />}
  </>
  return <div className="dd-image" data-colour={colour} data-loaded={loaded}>
    <span className="dd-image-fallback" aria-hidden="true">{name}</span>
    {crop ? <span className="dd-image-crop"><span style={{ '--ratio': crop.w / crop.h } as CSSProperties}>{layers}</span></span> : layers}
  </div>
}
