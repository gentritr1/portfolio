/** One short scanner tone, created only after an explicit user action. */
export function createScannerSound() {
  let context: AudioContext | null = null
  let voice: OscillatorNode | null = null

  async function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return
    try {
      context ??= new AudioContext()
      await context.resume()
      if (context.state !== 'running') return
      if (voice) { try { voice.stop() } catch { /* The prior scan may have ended. */ } }
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(1250, start)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(.055, start + .004)
      gain.gain.setValueAtTime(.055, start + .055)
      gain.gain.linearRampToValueAtTime(0, start + .08)
      oscillator.connect(gain).connect(context.destination)
      voice = oscillator
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); if (voice === oscillator) voice = null }
      oscillator.start(start)
      oscillator.stop(start + .085)
    } catch { /* Scanning and the receipt always work without audio. */ }
  }

  function stop() { if (voice) { try { voice.stop() } catch { /* Already ended. */ } voice = null } }
  function dispose() { stop(); if (context) void context.close().catch(() => undefined); context = null }
  return { play, stop, dispose }
}
