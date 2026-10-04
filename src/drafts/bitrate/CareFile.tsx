import { useState } from "react";
import { motion } from "motion/react";
import { spring } from "./motion";

export default function CareFile({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  return (
    <button
      className="bit-care-file"
      onClick={() => setOpen((value) => !value)}
      onMouseEnter={() => setPreview(true)}
      onMouseLeave={() => setPreview(false)}
      onFocus={() => setPreview(true)}
      onBlur={() => setPreview(false)}
      aria-pressed={open}
      aria-label={
        open
          ? "Close care case facts. 31 architecture decisions; parity before cutover; billing report 16 to 2 queries."
          : "Open care-platform case facts"
      }
    >
      <span className="bit-file-tab">Care-platform case file</span>
      <motion.span
        className="bit-file-card"
        animate={{
          rotateY: open ? 180 : 0,
          y: reduced ? 0 : open ? -7 : preview ? -4 : 0,
          z: reduced ? 0 : open ? 36 : 0,
          scale: reduced ? 1 : open ? 1.015 : 1,
          boxShadow: open
            ? "0 18px 30px #0003"
            : preview
              ? "0 9px 20px #0002"
              : "0 4px 12px #0002",
        }}
        whileTap={{ scale: reduced ? 1 : 0.985 }}
        transition={reduced ? { duration: 0.01 } : spring.ui}
      >
        <span className="bit-file-front" aria-hidden={open}>
          <img
            src="/signal-posters/healthcare.avif"
            alt="Care-interface recreation with invented data"
            loading="lazy"
          />
          <span>
            <strong>Open the facts.</strong>
            <small>Recreation · invented data</small>
          </span>
        </span>
        <span className="bit-file-back" aria-hidden={!open}>
          <strong>31 architecture decisions.</strong>
          <span>Parity before cutover.</span>
          <span>Billing report: 16 → 2 queries.</span>
          <small>Close file</small>
        </span>
      </motion.span>
    </button>
  );
}
