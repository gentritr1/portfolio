import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { careShots, REAL_SCREENS } from '../../content/careShots'
import { CropShot } from '../CropShot'
import './old-care-file.css'

/** The private platform's public facts, with one real screen on invented data. */
export function OldCareFile({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const factsId = useId()
  if (slug !== 'care-platform') return null
  return <button type="button" className="old-care-file" data-open={open} data-reduced={Boolean(reduced)} aria-expanded={open} aria-describedby={open ? factsId : undefined} aria-label={open ? 'Close care-platform case facts' : 'Open confidential care-platform case facts'} onClick={() => setOpen(value => !value)}>
    <motion.span className="old-care-file-card" initial={false} animate={{ z: reduced ? 0 : open ? 36 : 0, scale: reduced ? 1 : open ? 1.05 : 1, rotateY: reduced ? 0 : open ? 180 : 0, boxShadow: open ? '0 18px 30px #0004' : '0 4px 12px #0002' }} transition={reduced ? { duration: .01 } : { type: 'spring', stiffness: 350, damping: 35 }}>
      <span className="old-care-file-front" aria-hidden={open}>
        <span className="old-care-file-paper" aria-hidden="true">Architecture · migration · evidence</span>
        <span className="old-care-file-tab">Confidential platform</span>
        <strong>Open the public case facts <span aria-hidden="true">↗</span></strong>
        <span>Private product. Public engineering account.</span>
      </span>
      <span className="old-care-file-back" aria-hidden={!open}>
        <span className="old-care-file-facts" id={factsId}><strong>Architecture decisions, written down.</strong><span>Parity tests before each route moves from Vue to React.</span><span>API billing report: 16 queries → 2.</span><span className="old-care-file-hint">Press again to close the file.</span></span>
        <span className="old-care-file-screen"><CropShot shot={careShots.patients} /><span>{REAL_SCREENS}</span></span>
      </span>
    </motion.span>
  </button>
}
