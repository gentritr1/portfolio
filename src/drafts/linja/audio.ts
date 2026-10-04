/** Short mechanical impulses, and a 600 Hz Morse key. No context exists until opt-in. */
export function createBoardAudio() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const noise = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * 0.02),
    context.sampleRate,
  );
  const channel = noise.getChannelData(0);
  for (let i = 0; i < channel.length; i++)
    channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length);
  let voices = 0,
    enabled = false;
  let oscillator: OscillatorNode | undefined, tone: GainNode | undefined;
  return {
    enable(value: boolean) {
      enabled = value;
      void context.resume();
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(master.gain.value, context.currentTime);
      master.gain.linearRampToValueAtTime(
        value ? 0.12 : 0,
        context.currentTime + 0.2,
      );
    },
    flips(count: number) {
      if (!enabled || context.state !== "running") return;
      for (let i = 0; i < Math.min(count, 8) && voices < 64; i++) {
        const source = context.createBufferSource(),
          filter = context.createBiquadFilter();
        source.buffer = noise;
        source.playbackRate.value = 0.8 + Math.random() * 0.6;
        filter.type = "bandpass";
        filter.frequency.value = 1600 + Math.random() * 2600;
        filter.Q.value = 0.8;
        source.connect(filter);
        filter.connect(master);
        voices++;
        source.onended = () => {
          voices--;
          source.disconnect();
          filter.disconnect();
        };
        source.start(context.currentTime + Math.random() * 0.015);
      }
    },
    key(down: boolean) {
      if (!enabled) return;
      if (down && !oscillator) {
        oscillator = context.createOscillator();
        tone = context.createGain();
        oscillator.frequency.value = 600;
        tone.gain.value = 0;
        oscillator.connect(tone);
        tone.connect(master);
        tone.gain.linearRampToValueAtTime(0.65, context.currentTime + 0.005);
        oscillator.start();
      } else if (!down && oscillator && tone) {
        const oldTone = tone,
          oldOscillator = oscillator;
        oldTone.gain.cancelScheduledValues(context.currentTime);
        oldTone.gain.setValueAtTime(oldTone.gain.value, context.currentTime);
        oldTone.gain.linearRampToValueAtTime(0, context.currentTime + 0.005);
        oldOscillator.stop(context.currentTime + 0.01);
        oldOscillator.onended = () => {
          oldOscillator.disconnect();
          oldTone.disconnect();
        };
        oscillator = undefined;
        tone = undefined;
      }
    },
    dispose() {
      void context.close();
    },
  };
}
export type BoardAudio = ReturnType<typeof createBoardAudio>;
