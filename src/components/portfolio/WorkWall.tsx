import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { currentYear, firstYear, projects, type Project } from '../../content/projects'
import { ArrowUpRightIcon } from '../ShellIcons'
import { wallAssets, wallColour, wallPlatform, wallPosters, wallYear, type WallAsset } from './wallAssets'
import type { WallHoverScene } from './wallHoverScene'
import './WorkWall.css'

type Sort = 'colour' | 'year' | 'platform'
interface PositionedProject { project: Project; x: number; y: number; width: number; height: number; mediaHeight: number }

function arrange(ordered: Project[], width: number) {
  const weights = width >= 1100 ? [2, 3, 2, 3, 2] : width >= 650 ? [1, 1, 1] : [1, 1]
  const gap = width >= 650 ? 16 : 12
  const available = Math.max(0, width - gap * (weights.length - 1))
  const sum = weights.reduce((total, n) => total + n, 0)
  const widths = weights.map((weight) => available * weight / sum)
  const heights = weights.length === 5 ? [88, 0, 48, 0, 72] : weights.length === 3 ? [0, 40, 16] : [0, 40]
  const positions: PositionedProject[] = ordered.map((project, index) => {
    const column = index < weights.length ? index : heights.indexOf(Math.min(...heights))
    const tileWidth = widths[column]
    const asset = wallAssets[project.slug]
    const mediaHeight = asset ? tileWidth / asset.aspect : Math.max(tileWidth < 190 ? 336 : 288, tileWidth * 1.04)
    const item = {
      project,
      x: widths.slice(0, column).reduce((total, n) => total + n + gap, 0),
      y: heights[column], width: tileWidth, height: mediaHeight + 80, mediaHeight,
    }
    heights[column] += item.height + 24
    return item
  })
  return { positions, height: Math.max(...heights) }
}

function canAnimate() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A named colour poster remains visible until the browser has decoded the real image. */
function WallImage({ project, asset, height, eager }: { project: Project; asset: WallAsset; height: number; eager: boolean }) {
  const image = useRef<HTMLImageElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const node = image.current
    if (!node) return
    let current = true
    setReady(false)
    const loaded = async () => {
      if (!node.complete || !node.naturalWidth) return
      try {
        await node.decode()
        if (current) setReady(true)
      } catch {
        if (current) setReady(false)
      }
    }
    const failed = () => { if (current) setReady(false) }
    node.addEventListener('load', loaded)
    node.addEventListener('error', failed)
    void loaded()
    return () => {
      current = false
      node.removeEventListener('load', loaded)
      node.removeEventListener('error', failed)
    }
  }, [asset.src])

  return (
    <span className="work-wall-image" data-wall-image style={{ height, '--poster-ground': asset.fallback.background, '--poster-ink': asset.fallback.ink, viewTransitionName: project.featured ? `monitor-${project.slug}` : undefined } as CSSProperties}>
      <span className="work-wall-image-poster" aria-hidden="true"><strong>{project.name}</strong></span>
      <img
        ref={image} src={asset.src} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" data-ready={ready}
        style={{ objectPosition: `${(asset.position?.[0] ?? 0.5) * 100}% ${(asset.position?.[1] ?? 0.5) * 100}%`, transform: `scale(${asset.zoom ?? 1})`, transformOrigin: `${(asset.position?.[0] ?? 0.5) * 100}% ${(asset.position?.[1] ?? 0.5) * 100}%` } as CSSProperties}
      />
      {asset.recreation && <span className="work-wall-provenance">Recreation · invented data</span>}
    </span>
  )
}

/** A work-first wall. Native buttons and images are the complete experience before WebGL loads. */
export default function WorkWall({ onProject }: { onProject: (slug: string) => void }) {
  const grid = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(() => Math.max(280, window.innerWidth - 32))
  const [sort, setSort] = useState<Sort>('colour')
  const [announcement, setAnnouncement] = useState('')
  const before = useRef<Map<string, DOMRect> | null>(null)
  const animations = useRef<Animation[]>([])
  const scene = useRef<WallHoverScene | null>(null)
  const sceneLoad = useRef<Promise<WallHoverScene | null> | null>(null)
  const hovered = useRef<HTMLElement | null>(null)
  const disposed = useRef(false)

  const ordered = useMemo(() => [...projects].sort((a, b) => {
    if (sort === 'year') return wallYear(b) - wallYear(a) || a.name.localeCompare(b.name)
    if (sort === 'platform') return wallPlatform(a).localeCompare(wallPlatform(b)) || wallYear(b) - wallYear(a) || a.name.localeCompare(b.name)
    return wallColour(a) - wallColour(b) || a.name.localeCompare(b.name)
  }), [sort])
  const layout = useMemo(() => arrange(ordered, width), [ordered, width])

  useLayoutEffect(() => {
    const node = grid.current
    if (!node) return
    const update = () => setWidth(node.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const previous = before.current
    before.current = null
    if (!previous || !grid.current) return
    grid.current.querySelectorAll<HTMLElement>('[data-work-tile]').forEach((node) => {
      const old = previous.get(node.dataset.workTile!)
      const next = node.getBoundingClientRect()
      if (!old || (old.top > window.innerHeight + 300 && next.top > window.innerHeight + 300)) return
      const from = `translate(${old.left - next.left}px, ${old.top - next.top}px) ${node.style.transform} scale(${old.width / next.width}, ${old.height / next.height})`
      animations.current.push(node.animate(
        [{ transform: from }, { transform: node.style.transform }],
        { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' },
      ))
    })
  }, [layout])

  useEffect(() => {
    disposed.current = false
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => {
      if (!motion.matches) return
      scene.current?.hide()
      animations.current.forEach((animation) => animation.cancel())
    }
    motion.addEventListener('change', change)
    return () => {
      disposed.current = true
      hovered.current = null
      scene.current?.dispose()
      scene.current = null
      animations.current.forEach((animation) => animation.cancel())
      motion.removeEventListener('change', change)
    }
  }, [])

  function changeSort(next: Sort, pointer: boolean) {
    if (sort === next) return
    scene.current?.hide()
    hovered.current = null
    before.current = pointer && canAnimate() ? new Map(
      [...(grid.current?.querySelectorAll<HTMLElement>('[data-work-tile]') ?? [])].map((node) => [node.dataset.workTile!, node.getBoundingClientRect()]),
    ) : null
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
    setSort(next)
    setAnnouncement(`${projects.length} projects sorted by ${next === 'year' ? 'year, newest first' : next}.`)
  }

  async function enter(event: PointerEvent<HTMLButtonElement>, asset: WallAsset | undefined) {
    if (!asset || event.pointerType !== 'mouse' || !canAnimate() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const connection = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    if (connection.connection?.saveData || (connection.deviceMemory !== undefined && connection.deviceMemory < 4)) return
    const host = event.currentTarget.querySelector<HTMLElement>('[data-wall-image]')
    const image = host?.querySelector('img')
    if (!host || !image || image.dataset.ready !== 'true' || !image.complete || !image.naturalWidth) return
    hovered.current = host
    const point = { x: event.clientX, y: event.clientY }
    if (!sceneLoad.current) {
      sceneLoad.current = import('./wallHoverScene').then(({ createWallHover }) => {
        if (disposed.current) return null
        try { scene.current = createWallHover(); return scene.current } catch { return null }
      }).catch(() => null)
    }
    const ready = await sceneLoad.current
    if (!disposed.current && hovered.current === host && canAnimate()) ready?.show(host, image, asset, point.x, point.y)
  }

  function leave() {
    hovered.current = null
    scene.current?.hide()
  }

  return (
    <section className="work-wall" aria-label="All work">
      <div className="work-wall-toolbar">
        <p>{projects.length} projects <span>· {firstYear}–{currentYear}</span></p>
        <div className="work-wall-sort" role="group" aria-label="Sort work">
          <span>Sort by</span>
          {(['colour', 'year', 'platform'] as const).map((option) => (
            <button key={option} type="button" aria-pressed={sort === option} onClick={(event) => changeSort(option, event.detail > 0)}>
              {option === 'colour' ? 'Colour' : option === 'year' ? 'Year' : 'Platform'}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="sr-only">{announcement}</p>
      <div ref={grid} className="work-wall-grid" role="list" style={{ height: layout.height }}>
        {layout.positions.map(({ project, x, y, width: tileWidth, height, mediaHeight }, index) => {
          const asset = wallAssets[project.slug]
          const poster = wallPosters[project.slug]
          return (
            <div key={project.slug} role="listitem" data-work-tile={project.slug} className="work-wall-tile" style={{ width: tileWidth, height, transform: `translate3d(${x}px, ${y}px, 0)` }}>
              <button
                type="button"
                className="work-wall-project"
                aria-label={`Open ${project.name}, ${project.kind}`}
                onClick={() => { leave(); onProject(project.slug) }}
                onPointerEnter={(event) => void enter(event, asset)}
                onPointerMove={(event) => { if (event.pointerType === 'mouse') scene.current?.move(event.clientX, event.clientY) }}
                onPointerLeave={leave}
                onFocus={leave}
              >
                {asset ? (
                  <WallImage project={project} asset={asset} height={mediaHeight} eager={index < 5} />
                ) : (
                  <span className="work-wall-editorial" style={{ height: mediaHeight, '--poster-ground': poster?.background, '--poster-ink': poster?.ink } as CSSProperties}>
                    <strong aria-hidden="true">{(poster?.lines ?? [project.name]).map((line) => <span key={line}>{line}</span>)}</strong>
                    <span className="work-wall-poster-copy">{project.line}</span>
                  </span>
                )}
                <span className="work-wall-caption">
                  <span className="work-wall-caption-title">{asset ? project.name : project.kind}<ArrowUpRightIcon size={15} aria-hidden /></span>
                  <span>{wallPlatform(project)}{project.years ? ` · ${project.years}` : ''}</span>
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
