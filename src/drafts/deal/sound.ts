let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

export function wakeSound() {
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  if (!noise) {
    noise = context.createBuffer(
      1,
      context.sampleRate * 0.03,
      context.sampleRate,
    );
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.18));
  }
}

/** One short filtered noise burst for each card: the sound of a riffle. */
export function riffle(count: number, interval: number) {
  if (!context || !noise) return;
  const start = context.currentTime + 0.02;
  for (let i = 0; i < count; i++) {
    const source = context.createBufferSource();
    source.buffer = noise;
    source.playbackRate.value = 0.8 + Math.random() * 0.5;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400 + Math.random() * 1600;
    filter.Q.value = 0.9;
    const gain = context.createGain();
    gain.gain.value = 0.22 + Math.random() * 0.12;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(start + i * interval + Math.random() * interval * 0.3);
  }
}
