/**
 * Studio Synth Workstation - High Precision Metronome Engine
 */

export class MetronomeEngine {
  private ctx: AudioContext;
  private isRunning: boolean = false;
  private bpm: number = 120;
  private currentBeat: number = 0;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private volume: number = 0.6;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  public setBpm(bpm: number) {
    this.bpm = Math.max(30, Math.min(280, bpm));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduleTicks();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  private scheduleTicks = () => {
    if (!this.isRunning) return;

    // Look ahead 100ms and schedule audio nodes
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playTick(this.nextNoteTime, this.currentBeat === 0);
      // Advance by one beat (quarter note = 60 / bpm)
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime += secondsPerBeat;
      this.currentBeat = (this.currentBeat + 1) % 4;
    }

    this.timerId = window.setTimeout(this.scheduleTicks, 25);
  };

  private playTick(time: number, isAccent: boolean) {
    if (this.volume <= 0.001) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isAccent ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 1600 : 880, time);
    // Pitch envelope drop for woody transient snap
    osc.frequency.exponentialRampToValueAtTime(isAccent ? 800 : 440, time + 0.035);

    const gainVal = (isAccent ? 0.8 : 0.45) * this.volume;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (isAccent ? 0.07 : 0.04));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.08);
  }
}
