import { useState } from "react";
import { motion } from "motion/react";
import { spring } from "./motion";

export function CareFile({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  return (
    <figure className="dl-care-file">
      <motion.button
        className="dl-care-folder"
        type="button"
        aria-expanded={open}
        aria-label={
          open ? "Close the care-platform file" : "Open the care-platform file"
        }
        onClick={() => setOpen((value) => !value)}
        onHoverStart={() => setPreview(true)}
        onHoverEnd={() => setPreview(false)}
        onFocus={() => setPreview(true)}
        onBlur={() => setPreview(false)}
        whileTap={reduced ? undefined : { scale: 0.98 }}
      >
        <span className="dl-care-tab">Care platform / private work</span>
        <motion.span
          className="dl-care-paper"
          animate={{
            y: open ? -18 : preview ? -8 : 0,
            z: open ? 36 : 0,
            scale: open ? 1.05 : 1,
            rotateY: open ? 180 : 0,
            boxShadow: open ? "0 20px 36px #321a143d" : "0 4px 9px #321a1426",
          }}
          transition={reduced ? { duration: 0.01 } : spring.ui}
        >
          <span className="dl-care-front" aria-hidden={open}>
            <img
              src="/signal-posters/healthcare.avif"
              alt="Care interface recreation with invented data"
              loading="lazy"
            />
            <span>Recreation · invented data</span>
          </span>
          <span className="dl-care-back" aria-hidden={!open}>
            <strong>31 ADRs</strong>
            <span>Architecture decisions recorded.</span>
            <strong>Parity tests</strong>
            <span>Vue to React, route by route.</span>
            <strong>16 → 2 queries</strong>
            <span>One billing report in the care API.</span>
          </span>
        </motion.span>
        <span className="dl-care-pocket">
          {open ? "File open · close facts" : "Open the factual case file"}
        </span>
      </motion.button>
      <figcaption>
        Private client work. Public facts, with a labelled recreation using
        invented data.
      </figcaption>
    </figure>
  );
}
