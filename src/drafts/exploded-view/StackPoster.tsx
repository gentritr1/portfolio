import { layers, type LayerId } from './data'

/**
 * The exploded stack as a technical drawing: five thin layers in isometric view, hairline edges,
 * dashed alignment lines between corners, and labels on leader lines. It is the motion-off and
 * no-WebGL version of the 3D scene, and the small mark on each case card (`compact`).
 */
export function StackPoster({ lit = [], compact = false, title }: { lit?: LayerId[]; compact?: boolean; title?: string }) {
  const w = compact ? 46 : 150
  const h = w * 0.5
  const gap = compact ? 15 : 56
  const cx = compact ? 56 : 190
  const top = compact ? 30 : 100
  const width = compact ? 112 : 520
  const height = top + gap * (layers.length - 1) + h + (compact ? 8 : 40)
  const at = (i: number) => top + i * gap
  const corner = (i: number) => ({ l: [cx - w, at(i)], r: [cx + w, at(i)], b: [cx, at(i) + h], t: [cx, at(i) - h] })
  const last = layers.length - 1
  return (
    <svg className={compact ? 'xv-stack xv-stack-compact' : 'xv-stack'} viewBox={`0 0 ${width} ${height}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {/* Alignment lines: the dashed verticals an exploded-view drawing uses to show how parts line up. */}
      {(['l', 'r', 'b'] as const).map((k) => (
        <line key={k} className="xv-align" x1={corner(0)[k][0]} y1={corner(0)[k][1]} x2={corner(last)[k][0]} y2={corner(last)[k][1]} />
      ))}
      {[...layers].reverse().map((layer) => {
        const i = layers.indexOf(layer)
        const c = corner(i)
        const on = lit.includes(layer.id)
        return (
          <g key={layer.id} className="xv-layer" data-on={on || undefined}>
            <polygon points={`${c.t.join(',')} ${c.r.join(',')} ${c.b.join(',')} ${c.l.join(',')}`} />
            {!compact && (
              <>
                <line className="xv-leader" x1={c.r[0]} y1={c.r[1]} x2={c.r[0] + 64} y2={c.r[1]} />
                <text x={c.r[0] + 72} y={c.r[1]} dominantBaseline="middle">
                  <tspan className="xv-layer-no">{String(i + 1).padStart(2, '0')}</tspan> {layer.name}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** A case's own architecture as an exploded drawing: one plate per layer, each annotated with its title, stack and role. */
export function CaseDiagram({ items, title }: { items: { title: string; stack: string; note: string }[]; title: string }) {
  const w = 120, h = w * 0.5, gap = 74, cx = 140, top = 80
  const width = 560
  const height = top + gap * (items.length - 1) + h + 24
  const at = (i: number) => top + i * gap
  const last = items.length - 1
  const c = (i: number) => ({ l: [cx - w, at(i)], r: [cx + w, at(i)], b: [cx, at(i) + h], t: [cx, at(i) - h] })
  return (
    <svg className="xv-stack xv-case-diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      {(['l', 'r', 'b'] as const).map((k) => (
        <line key={k} className="xv-align" x1={c(0)[k][0]} y1={c(0)[k][1]} x2={c(last)[k][0]} y2={c(last)[k][1]} />
      ))}
      {[...items].reverse().map((item) => {
        const i = items.indexOf(item)
        const p = c(i)
        return (
          <g key={item.title} className="xv-layer" data-on="">
            <polygon points={`${p.t.join(',')} ${p.r.join(',')} ${p.b.join(',')} ${p.l.join(',')}`} />
            <line className="xv-leader" x1={p.r[0]} y1={p.r[1]} x2={p.r[0] + 34} y2={p.r[1]} />
            <text x={p.r[0] + 42} y={p.r[1] - 10}>
              <tspan className="xv-layer-no">{String(i + 1).padStart(2, '0')}</tspan> {item.title}
            </text>
            <text className="xv-diagram-stack" x={p.r[0] + 42} y={p.r[1] + 8}>{item.stack}</text>
            <text className="xv-diagram-note" x={p.r[0] + 42} y={p.r[1] + 25}>{item.note}</text>
          </g>
        )
      })}
    </svg>
  )
}
