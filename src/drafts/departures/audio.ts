type Session = { audioSession?: { type: string } };

/** Mechanical clicks and a 600 Hz key. Made only inside a click on the Sound control. */
export function createBoardAudio() {
  const context = new AudioContext();
  const silence = context.createBuffer(1, 1, context.sampleRate);
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.022), context.sampleRate);
  const channel = noise.getChannelData(0);
  for (let i = 0; i < channel.length; i++) {
    const fall = 1 - i / channel.length;
    channel[i] = (Math.random() * 2 - 1) * fall * fall;
  }
  let voices = 0,
    enabled = false;
  let oscillator: OscillatorNode | undefined, tone: GainNode | undefined;
  /**
   * iOS starts and resumes an AudioContext only inside a user gesture, and it suspends the context
   * when the page goes to the background. Call this synchronously from every press.
   */
  function wake() {
    if (!enabled) return;
    if (context.state !== "running") void context.resume();
    const source = context.createBufferSource();
    source.buffer = silence;
    source.connect(context.destination);
    source.start();
  }
  return {
    wake,
    enable(value: boolean) {
      enabled = value;
      const session = (navigator as Navigator & Session).audioSession;
      if (session) session.type = value ? "playback" : "auto";
      if (value) wake();
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(master.gain.value, context.currentTime);
      master.gain.linearRampToValueAtTime(value ? 0.14 : 0, context.currentTime + 0.2);
    },
    /** At most 8 new voices for each frame and 64 at once. */
    flips(count: number, pan: number) {
      if (!enabled || context.state !== "running") return;
      for (let i = 0; i < Math.min(count, 8) && voices < 64; i++) {
        const source = context.createBufferSource(),
          filter = context.createBiquadFilter(),
          stereo = context.createStereoPanner();
        source.buffer = noise;
        source.playbackRate.value = 0.75 + Math.random() * 0.6;
        filter.type = "bandpass";
        filter.frequency.value = 1500 + Math.random() * 2800;
        filter.Q.value = 0.9;
        stereo.pan.value = Math.max(-1, Math.min(1, pan * 0.8 + (Math.random() - 0.5) * 0.2));
        source.connect(filter);
        filter.connect(stereo);
        stereo.connect(master);
        voices++;
        source.onended = () => {
          voices--;
          source.disconnect();
          filter.disconnect();
          stereo.disconnect();
        };
        source.start(context.currentTime + Math.random() * 0.012);
      }
    },
    key(down: boolean) {
      if (down && enabled && !oscillator) {
        oscillator = context.createOscillator();
        tone = context.createGain();
        oscillator.frequency.value = 600;
        tone.gain.value = 0;
        oscillator.connect(tone);
        tone.connect(master);
        tone.gain.linearRampToValueAtTime(0.6, context.currentTime + 0.005);
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
