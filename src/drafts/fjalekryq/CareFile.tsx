import { useState } from 'react'
import { motion } from 'motion/react'
import { spring } from './motion'

export function CareFile({ reduced }: { reduced: boolean }) {
  const [preview, setPreview] = useState(false)
  const [open, setOpen] = useState(false)
  return <figure className="fk-care-file">
    <motion.button type="button" className="fk-care-folder" aria-expanded={open} aria-label={open ? 'Close the private care case file' : 'Open the private care case file'} onHoverStart={() => setPreview(true)} onHoverEnd={() => setPreview(false)} onFocus={() => setPreview(true)} onBlur={() => setPreview(false)} onClick={() => setOpen(value => !value)} whileTap={reduced ? undefined : { scale: .98 }} transition={reduced ? { duration: .01 } : spring.ui}>
      <span className="fk-care-tab">PRIVATE / CARE PLATFORM</span>
      <motion.span className="fk-care-paper" animate={{ y: open ? -18 : preview ? -9 : 0, z: open ? 36 : 0, scale: open ? 1.05 : 1, rotateY: open ? 180 : 0 }} transition={reduced ? { duration: .01 } : spring.lift}>
        <span className="fk-care-front" aria-hidden={open}><img src="/signal-posters/healthcare.avif" alt="Care interface recreation with invented data" /><span>Recreation · invented data</span></span>
        <span className="fk-care-back" aria-hidden={!open}><strong>31 ADRs</strong><span>Architecture decisions, written down.</span><strong>Parity tests</strong><span>Vue to React, route by route.</span><strong>16 → 2 queries</strong><span>One billing report in the related care API.</span></span>
      </motion.span>
      <span className="fk-care-pocket">{open ? 'Case file open · tap to close' : 'Private work · open the case file'}</span>
    </motion.button>
    <figcaption>Client work under NDA. Public facts; interface recreation uses invented data.</figcaption>
  </figure>
}
