import { Suspense, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { recreations } from '../../lib/recreations'
import type { Proof, Row } from './data'

const posters: Partial<Record<string, string>> = {
  care: '/signal-posters/healthcare.avif',
  'doc-chat': '/signal-posters/ai.avif',
}

function Stage({ proof }: { proof: Proof }) {
  if (proof.kind === 'none') return null
  if (proof.kind === 'recreation') {
    const entry = recreations[proof.key]
    const Recreation = entry.Component
    const poster = posters[proof.key]
    return (
      <div className="ts-stage ts-stage-live" data-world={entry.world}>
        <Suspense fallback={poster ? <img className="ts-stage-poster" src={poster} alt="" /> : null}>
          <Recreation />
        </Suspense>
      </div>
    )
  }
  if (proof.kind === 'readout') {
    return (
      <div className="ts-stage ts-stage-readout">
        <p>
          <span className="ts-readout-from">{proof.from}</span>
          <ArrowRightIcon size={28} weight="light" aria-hidden="true" />
          <span className="ts-readout-to">{proof.to}</span>
        </p>
        <span className="ts-readout-label">{proof.label}</span>
      </div>
    )
  }
  if (proof.kind === 'phones') {
    return (
      <div className="ts-stage ts-stage-phones" role="img" aria-label={proof.alt}>
        {proof.srcs.map((src) => (
          <img key={src} src={src} alt="" loading="lazy" decoding="async" width={780} height={1689} />
        ))}
      </div>
    )
  }
  return (
    <div className={`ts-stage ts-stage-${proof.kind}`}>
      <img src={proof.src} alt={proof.alt} loading="lazy" decoding="async" width={proof.kind === 'small' ? 256 : 1440} height={proof.kind === 'small' ? 160 : 900} />
    </div>
  )
}

function sourceNote(row: Row) {
  const { proof } = row
  if (proof.kind === 'recreation') return `Recreation with invented data. ${proof.hint}`
  if (proof.kind === 'phones' || proof.kind === 'small') return 'Screens from the public store listing.'
  if (proof.kind === 'web') return 'Screen from the public website.'
  return null
}

export function ProofBody({ row, style }: { row: Row; style?: CSSProperties }) {
  const note = sourceNote(row)
  return (
    <div className="ts-proof-body" style={style}>
      <Stage proof={row.proof} />
      {note && <p className="ts-proof-note">{note}</p>}
      <dl className="ts-facts">
        <div>
          <dt>Problem</dt>
          <dd>{row.problem}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{row.result}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{row.role}</dd>
        </div>
      </dl>
      {(row.hasCase || row.links.length > 0) && (
        <div className="ts-proof-links">
          {row.hasCase && (
            <Link className="ts-button ts-button-primary" to={`/work/${row.slug}`}>
              Open the case
              <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
            </Link>
          )}
          {row.links.map((link) => (
            <a key={link.href} className="ts-extlink" href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
