import { useEffect, useRef, useState } from 'react'

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

interface DitherImageProps {
  src: string
  alt: string
  name: string
  colour: boolean
}

/** A finite image conversion, not a running render loop. The real image stays underneath. */
export default function DitherImage({ src, alt, name, colour }: DitherImageProps) {
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
      const scale = Math.min(1, 430 / image.width, 530 / image.height)
      node.width = Math.round(image.width * scale)
      node.height = Math.round(image.height * scale)
      context.drawImage(image, 0, 0, node.width, node.height)
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
  }, [src])
  return <div className="dd-image" data-colour={colour} data-loaded={loaded}>
    <span className="dd-image-fallback" aria-hidden="true">{name}</span>
    <img className="dd-image-base" src={src} alt={alt} decoding="async" onLoad={() => setLoaded(true)} />
    <canvas ref={canvas} aria-hidden="true" data-ready={ready} />
    <img className="dd-image-colour" src={src} alt="" aria-hidden="true" decoding="async" />
  </div>
}
