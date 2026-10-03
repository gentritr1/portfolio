const storageKey = 'channel-sound'
let context: AudioContext | undefined
let request = 0
let enabled = false

try {
  enabled = localStorage.getItem(storageKey) === 'on'
} catch {
  // Sound starts off when a saved preference cannot be read.
}

export function channelSoundEnabled(): boolean {
  return enabled
}

export function setChannelSoundEnabled(next: boolean) {
  enabled = next
  request += 1
  try {
    localStorage.setItem(storageKey, next ? 'on' : 'off')
  } catch {
    // A blocked store keeps the preference for this page view.
  }
  if (!next) void context?.suspend().catch(() => undefined)
}

/** Called from a user selection only, never from a render or an effect. */
export function playChannelSound(channel: number) {
  if (!channelSoundEnabled() || document.hidden || typeof AudioContext === 'undefined') return
  const current = ++request
  try {
    // Create/resume in the input handler so autoplay policy is respected.
    context ??= new AudioContext()
    const audio = context
    const resumed = audio.state === 'running' ? Promise.resolve() : audio.resume()
    void Promise.all([resumed, import('./synthChannelSound')])
      .then(([, synth]) => {
        if (current === request && channelSoundEnabled() && !document.hidden && audio.state === 'running') {
          synth.play(audio, channel)
        }
      })
      .catch(() => undefined)
  } catch {
    // Audio is optional; unsupported or blocked audio leaves navigation intact.
  }
}
