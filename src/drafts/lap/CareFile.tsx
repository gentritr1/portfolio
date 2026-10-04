import { useId, useState } from "react";
import { motion } from "motion/react";
import { spring } from "./motion";
export default function CareFile({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false),
    [preview, setPreview] = useState(false),
    id = useId();
  return (
    <button
      className="lp-care-file"
      data-open={open}
      aria-pressed={open}
      aria-describedby={id}
      onClick={() => setOpen((value) => !value)}
      onPointerEnter={() => setPreview(true)}
      onPointerLeave={() => setPreview(false)}
      onFocus={() => setPreview(true)}
      onBlur={() => setPreview(false)}
    >
      <span className="lp-file-tab">Confidential platform · public facts</span>
      <motion.span
        className="lp-file-card"
        animate={{
          rotateY: reduced ? 0 : open ? 180 : 0,
          y: reduced ? 0 : open ? -8 : preview ? -4 : 0,
          z: reduced ? 0 : open ? 36 : 0,
          scale: reduced ? 1 : open ? 1.03 : 1,
        }}
        transition={reduced ? { duration: 0.01 } : spring.ui}
      >
        <span
          className="lp-file-front"
          aria-hidden={open}
          style={
            reduced ? { visibility: open ? "hidden" : "visible" } : undefined
          }
        >
          <img
            src="/signal-posters/healthcare.avif"
            alt="Care-interface recreation with invented data"
            loading="lazy"
          />
          <strong>Open the engineering facts.</strong>
          <span>Recreation · invented data</span>
        </span>
        <span
          className="lp-file-back"
          aria-hidden={!open}
          style={
            reduced
              ? { transform: "none", visibility: open ? "visible" : "hidden" }
              : undefined
          }
        >
          <strong>31 architecture decisions.</strong>
          <span>Parity before cutover.</span>
          <span>Billing report: 16 → 2 queries.</span>
          <span>Close the file</span>
        </span>
      </motion.span>
      <span id={id} className="lp-sr">
        {open
          ? "Facts exposed. Press to close."
          : "Press to lift and open the public engineering facts."}
      </span>
    </button>
  );
}
