import { useState } from 'react'

const readings = [[128, 82], [131, 84], [126, 80], [134, 86], [129, 83], [137, 88], [133, 85]]

export default function CareDemo() {
  const [day, setDay] = useState(6)
  const [unit, setUnit] = useState<'mmHg' | 'kPa'>('mmHg')
  const display = (value: number) => unit === 'mmHg' ? value : (value * 0.133322).toFixed(1)
  const points = (column: number) => readings.map((row, i) => `${28 + i * 70},${200 - (row[column] - 65) * 2}`).join(' ')
  return <div className="dd-care-demo">
    <div className="dd-demo-head"><strong>Northwind Clinic</strong><span>Patient 4821</span></div>
    <div className="dd-demo-value"><div><p>Blood pressure · Day {day + 1}</p><strong>{display(readings[day][0])}<span> / </span>{display(readings[day][1])}</strong></div><button type="button" onClick={() => setUnit(unit === 'mmHg' ? 'kPa' : 'mmHg')} aria-label={`Switch unit from ${unit}`}>{unit}</button></div>
    <svg viewBox="0 0 478 240" role="img" aria-label={`Seven fictional blood pressure readings. Selected day ${day + 1}: ${display(readings[day][0])} over ${display(readings[day][1])} ${unit}.`}>
      {[90, 115, 140].map((n) => <line className="dd-chart-grid" key={n} x1="28" x2="448" y1={200 - (n - 65) * 2} y2={200 - (n - 65) * 2} />)}
      <polyline className="dd-chart-lower" points={points(1)} /><polyline className="dd-chart-upper" points={points(0)} />
      <line className="dd-chart-marker" x1={28 + day * 70} x2={28 + day * 70} y1="20" y2="200" /><circle cx={28 + day * 70} cy={200 - (readings[day][0] - 65) * 2} r="6" />
      <text x="28" y="230">Day 1</text><text x="448" y="230" textAnchor="end">Day 7</text>
    </svg>
    <div className="dd-demo-controls"><button type="button" disabled={day === 0} onClick={() => setDay(day - 1)}>Previous day</button><span aria-live="polite">{day + 1} / 7</span><button type="button" disabled={day === 6} onClick={() => setDay(day + 1)}>Next day</button></div>
    <p className="dd-demo-disclosure">Interactive recreation. Clinic, patient and readings are invented.</p>
  </div>
}
