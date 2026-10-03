/** Two quiet tuning notes, only after explicit channel selection. */
export function createChannelSound() {
  let context: AudioContext | null = null
  const notes = new Set<OscillatorNode>()

  function stop() {
    for (const note of notes) {
      try { note.stop() } catch { /* A note may already have ended. */ }
    }
    notes.clear()
  }

  function unlock() {
    try {
      context ??= new AudioContext()
      void context.resume().catch(() => undefined)
      return true
    } catch { return false }
  }

  function play() {
    if (!context || context.state !== 'running') return
    stop()
    const start = context.currentTime
    for (const [index, frequency] of [180, 360].entries()) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const at = start + index * .052
      oscillator.type = 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(.0001, at)
      gain.gain.linearRampToValueAtTime(.018, at + .004)
      gain.gain.exponentialRampToValueAtTime(.0001, at + .065)
      oscillator.connect(gain).connect(context.destination)
      notes.add(oscillator)
      oscillator.onended = () => { notes.delete(oscillator); oscillator.disconnect(); gain.disconnect() }
      oscillator.start(at)
      oscillator.stop(at + .07)
    }
  }

  function dispose() { stop(); if (context) void context.close().catch(() => undefined); context = null }
  return { unlock, play, stop, dispose }
}
