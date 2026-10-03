/** A quiet relay tap followed by a 90 ms tuning tone. No media is fetched. */
export function play(context: AudioContext, channel: number) {
  const start = context.currentTime
  const relay = context.createOscillator()
  const relayGain = context.createGain()
  relay.type = 'triangle'
  relay.frequency.setValueAtTime(1600, start)
  relay.frequency.exponentialRampToValueAtTime(180, start + 0.018)
  relayGain.gain.setValueAtTime(0, start)
  relayGain.gain.linearRampToValueAtTime(0.055, start + 0.001)
  relayGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.022)
  relay.connect(relayGain).connect(context.destination)
  relay.start(start)
  relay.stop(start + 0.025)
  relay.onended = () => { relay.disconnect(); relayGain.disconnect() }

  const tone = context.createOscillator()
  const toneGain = context.createGain()
  tone.type = 'sine'
  tone.frequency.value = 440 + channel * 35
  toneGain.gain.setValueAtTime(0, start + 0.026)
  toneGain.gain.linearRampToValueAtTime(0.026, start + 0.034)
  toneGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.116)
  tone.connect(toneGain).connect(context.destination)
  tone.start(start + 0.026)
  tone.stop(start + 0.12)
  tone.onended = () => { tone.disconnect(); toneGain.disconnect() }
}
