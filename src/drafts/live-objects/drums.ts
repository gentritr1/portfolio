/*
 * The OFFBEAT drum machine, reimplemented from the owner's OFFBEAT repository
 * (lib/offbeat/audio.ts): the same four voices, preset, swing and look-ahead scheduler.
 * The AudioContext is created inside the Play press, never before.
 */

export const tracks = ["Kick", "Snare", "Hi-hat", "Bass"] as const;
export const TEMPO = 112;
const SWING = 54;
export const preset: boolean[][] = [
  [1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 1, 0, 0],
].map((row) => row.map(Boolean));

const stepLength = 30 / TEMPO;
const swingDelay = (step: number) => (step % 2 ? ((SWING - 50) / 50) * stepLength : 0);
const bass = [65.41, 65.41, 82.41, 98, 65.41, 87.31, 82.41, 98];

function voice(ctx: AudioContext, out: GainNode, noise: AudioBuffer, track: number, time: number, step: number) {
  const gain = ctx.createGain();
  gain.connect(out);
  const nodes: AudioNode[] = [gain];
  let source: AudioScheduledSourceNode;
  if (track === 0) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(43, time + 0.15);
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc.connect(gain);
    source = osc;
    osc.start(time);
    osc.stop(time + 0.3);
  } else if (track === 1 || track === 2) {
    const buffer = ctx.createBufferSource();
    buffer.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = track === 1 ? "highpass" : "bandpass";
    filter.frequency.value = track === 1 ? 1300 : 7500;
    filter.Q.value = track === 1 ? 0.7 : 1.2;
    buffer.connect(filter);
    filter.connect(gain);
    nodes.push(filter);
    gain.gain.setValueAtTime(track === 1 ? 0.5 : 0.21, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (track === 1 ? 0.15 : 0.055));
    source = buffer;
    buffer.start(time);
    buffer.stop(time + 0.19);
  } else {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = bass[step % 8];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    osc.connect(filter);
    filter.connect(gain);
    nodes.push(filter);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.42, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.23);
    source = osc;
    osc.start(time);
    osc.stop(time + 0.26);
  }
  source.onended = () => {
    source.disconnect();
    nodes.forEach((n) => n.disconnect());
  };
  return source;
}

export class Drums {
  private ctx: AudioContext;
  private out: GainNode;
  private noise: AudioBuffer;
  private timer = 0;
  private next = 0;
  private step = 0;
  private live = new Set<AudioScheduledSourceNode>();
  private callbacks: number[] = [];
  pattern = preset.map((row) => [...row]);
  onStep: (step: number) => void = () => {};

  constructor() {
    this.ctx = new AudioContext();
    this.out = this.ctx.createGain();
    this.out.gain.value = 0.38;
    this.out.connect(this.ctx.destination);
    this.noise = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * 0.5), this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  async start() {
    if (this.timer) return;
    await this.ctx.resume();
    this.step = 0;
    this.next = this.ctx.currentTime + 0.06;
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  private schedule() {
    while (this.next < this.ctx.currentTime + 0.1) {
      const s = this.step;
      const time = this.next + swingDelay(s);
      this.pattern.forEach((row, t) => {
        if (!row[s]) return;
        const source = voice(this.ctx, this.out, this.noise, t, time, s);
        this.live.add(source);
        source.addEventListener("ended", () => this.live.delete(source));
      });
      this.callbacks.push(window.setTimeout(() => this.onStep(s), Math.max(0, (time - this.ctx.currentTime) * 1000)));
      if (this.callbacks.length > 64) this.callbacks.splice(0, 32);
      this.next += stepLength;
      this.step = (s + 1) % 8;
    }
  }

  async stop() {
    window.clearInterval(this.timer);
    this.timer = 0;
    this.callbacks.forEach((c) => window.clearTimeout(c));
    this.callbacks = [];
    this.live.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    });
    this.live.clear();
    if (this.ctx.state === "running") await this.ctx.suspend();
  }

  async dispose() {
    this.onStep = () => {};
    await this.stop();
    if (this.ctx.state !== "closed") await this.ctx.close();
  }
}
