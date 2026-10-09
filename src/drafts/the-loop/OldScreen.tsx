import { useState } from "react";
import type { Shot } from "./data";

/** An old app's real capture, or an empty slot of the same size while the file does not exist. */
export function OldScreen({ shot, className }: { shot: Shot; className?: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <span className={className ? `lp-old-slot ${className}` : "lp-old-slot"} role="img" aria-label="The old app's screen. The capture is not ready yet.">
        <span>Old app screen</span>
      </span>
    );
  }
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={shot.small} />
      <img
        className={className}
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
        onError={() => setMissing(true)}
      />
    </picture>
  );
}
