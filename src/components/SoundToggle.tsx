import { useState } from 'react'
import { channelSoundEnabled, setChannelSoundEnabled } from '../lib/channelSound'

/* Exact Phosphor light paths; unused weights are omitted. License: /licenses/phosphor-icons.txt. */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(channelSoundEnabled)

  return (
    <button
      type="button"
      aria-label="Channel sound"
      aria-pressed={enabled}
      title={enabled ? 'Turn channel sound off' : 'Turn channel sound on'}
      onClick={() => {
        setChannelSoundEnabled(!enabled)
        setEnabled(!enabled)
      }}
      className="grid size-11 shrink-0 place-items-center rounded-sm text-ink-2 transition-colors duration-200 ease-out hover:bg-panel-2 hover:text-ink aria-pressed:text-signal"
    >
      <svg width={19} height={19} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
        <path d={enabled
          ? "M162.64,26.61a6,6,0,0,0-6.32.65L85.94,82H40A14,14,0,0,0,26,96v64a14,14,0,0,0,14,14H85.94l70.38,54.74A6,6,0,0,0,166,224V32A6,6,0,0,0,162.64,26.61ZM154,211.73,91.68,163.26A6,6,0,0,0,88,162H40a2,2,0,0,1-2-2V96a2,2,0,0,1,2-2H88a6,6,0,0,0,3.68-1.26L154,44.27ZM206,104v48a6,6,0,0,1-12,0V104a6,6,0,0,1,12,0Zm32-16v80a6,6,0,0,1-12,0V88a6,6,0,0,1,12,0Z"
          : "M194,152V104a6,6,0,0,1,12,0v48a6,6,0,0,1-12,0Zm38-70a6,6,0,0,0-6,6v80a6,6,0,0,0,12,0V88A6,6,0,0,0,232,82ZM220.44,212a6,6,0,0,1-8.88,8.08L166,169.92V224a6,6,0,0,1-9.68,4.74L85.94,174H40a14,14,0,0,1-14-14V96A14,14,0,0,1,40,82H86.07L51.56,44A6,6,0,0,1,60.44,36ZM154,156.72,97,94H40a2,2,0,0,0-2,2v64a2,2,0,0,0,2,2H88a6,6,0,0,1,3.68,1.26L154,211.73Zm-30.17-89L154,44.27v62.56a6,6,0,0,0,12,0V32a6,6,0,0,0-9.68-4.74l-39.85,31a6,6,0,1,0,7.36,9.47Z"
        } />
      </svg>
    </button>
  )
}
