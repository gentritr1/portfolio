/*
 * The Send mode of the owner's Morse Trainer (morse-code-amber.vercel.app, src/features/send.js,
 * src/platform/morse-audio.js, src/config.js): the same letter table, the Koch teaching order,
 * the "Gentle" speed (characters at 18 wpm), the dash rule (a press of two units or more) and
 * the 600 Hz sine tone. The AudioContext is created only inside the press that turns sound on.
 */

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
};

export const KOCH_ORDER = ["K", "M", "R", "S", "A", "T", "O", "I", "N", "E"] as const;

/** Gentle preset: 1.2 s / 18 wpm. */
export const UNIT_MS = 1200 / 18;
export const MAX_MARKS = 12;

export const symbolFor = (pressMs: number) => (pressMs >= UNIT_MS * 2 ? "-" : ".");

export const letterFor = (pattern: string) =>
  Object.keys(MORSE).find((letter) => MORSE[letter] === pattern) ?? null;

export const spoken = (pattern: string) =>
  pattern
    .split("")
    .map((s) => (s === "." ? "dot" : "dash"))
    .join(" ");

const TONE_HZ = 600;

export class Tone {
  private ctx: AudioContext;
  private live: { osc: OscillatorNode; gain: GainNode } | null = null;

  constructor() {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
    this.ctx = new AudioContext();
  }

  start() {
    this.stop();
    if (this.ctx.state === "suspended") void this.ctx.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = TONE_HZ;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.008);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    this.live = { osc, gain };
  }

  stop() {
    if (!this.live) return;
    const { osc, gain } = this.live;
    this.live = null;
    const now = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.008);
    osc.stop(now + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  async dispose() {
    this.stop();
    if (this.ctx.state !== "closed") await this.ctx.close();
  }
}
