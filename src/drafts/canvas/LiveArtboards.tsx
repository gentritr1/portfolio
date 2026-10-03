import { useState } from 'react'

// Fictional readings from the portfolio's existing care recreation, never patient data.
const clinics = [
  { name: 'Northwind Clinic', patient: 'Patient 4821', sys: [128, 131, 126, 134, 129, 137, 133, 130, 142, 135, 131, 147, 138, 134], dia: [82, 84, 80, 86, 83, 88, 85, 83, 91, 87, 84, 94, 89, 86] },
  { name: 'Harbor Health', patient: 'Patient 2093', sys: [122, 125, 143, 129, 124, 127, 121, 126, 130, 128, 145, 133, 127, 124], dia: [78, 80, 92, 82, 79, 81, 77, 80, 83, 81, 95, 85, 82, 79] },
]

export function CareArtboard() {
  const [clinic, setClinic] = useState(0)
  const [unit, setUnit] = useState<'mmHg' | 'kPa'>('mmHg')
  const [day, setDay] = useState(13)
  const current = clinics[clinic]
  const format = (n: number) => unit === 'mmHg' ? String(n) : (n * 0.133322).toFixed(1)
  const x = (i: number) => 28 + i * 36
  const y = (n: number) => 192 - (n - 65) * 1.8
  const points = (values: number[]) => values.map((n, i) => `${x(i)},${y(n)}`).join(' ')
  return (
    <div className="dc-care" data-clinic={clinic}>
      <div className="dc-care-top">
        <select aria-label="Demo clinic" value={clinic} onChange={(e) => setClinic(Number(e.target.value))}>
          {clinics.map((item, i) => <option value={i} key={item.name}>{item.name}</option>)}
        </select>
        <span>Care manager</span>
      </div>
      <div className="dc-care-reading">
        <div><p>{current.patient} · Day {day + 1}</p><strong>{format(current.sys[day])}<span> / </span>{format(current.dia[day])}</strong></div>
        <button type="button" aria-label={`Unit: ${unit}. Switch units`} onClick={() => setUnit(unit === 'mmHg' ? 'kPa' : 'mmHg')}>{unit}</button>
      </div>
      <svg viewBox="0 0 528 220" role="img" aria-label={`Blood pressure across fourteen fictional days. Day ${day + 1}: ${format(current.sys[day])} over ${format(current.dia[day])} ${unit}.`}>
        {[90, 115, 140].map((n) => <line key={n} x1="28" x2="496" y1={y(n)} y2={y(n)} className="dc-chart-grid" />)}
        <line x1="28" x2="496" y1={y(140)} y2={y(140)} className="dc-chart-threshold" />
        <polyline points={points(current.dia)} className="dc-chart-dia" />
        <polyline points={points(current.sys)} className="dc-chart-sys" />
        <line x1={x(day)} x2={x(day)} y1="22" y2="196" className="dc-chart-marker" />
        <circle cx={x(day)} cy={y(current.sys[day])} r="6" className="dc-chart-point" />
        <text x="28" y="217">Day 1</text><text x="496" y="217" textAnchor="end">Day 14</text>
      </svg>
      <div className="dc-care-bottom">
        <button type="button" onClick={() => setDay((n) => Math.max(0, n - 1))} disabled={day === 0}>Previous day</button>
        <span>14 days</span>
        <button type="button" onClick={() => setDay((n) => Math.min(13, n + 1))} disabled={day === 13}>Next day</button>
      </div>
    </div>
  )
}

const passages = [
  'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”',
  'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
]

export function ReadingArtboard() {
  const [page, setPage] = useState(0)
  const [large, setLarge] = useState(false)
  return (
    <div className="dc-reader">
      <div className="dc-reader-top"><span>Lewis Carroll</span><button type="button" aria-pressed={large} onClick={() => setLarge(!large)}>Larger text</button></div>
      <h3>Alice’s Adventures<br />in Wonderland</h3>
      <p className="dc-reader-passage" data-large={large}>{passages[page]}</p>
      <div className="dc-reader-bottom"><span>Passage {page + 1} of 2</span><button type="button" onClick={() => setPage(1 - page)}>{page ? 'Previous passage' : 'Next passage'}</button></div>
    </div>
  )
}
