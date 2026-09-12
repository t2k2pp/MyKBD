import { DrumKit, DrumPadSound } from '../types';

export class DrumSynthesizer {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private noiseBuffer: AudioBuffer | null = null;

  constructor(ctx: AudioContext, outputNode: GainNode) {
    this.ctx = ctx;
    this.outputNode = outputNode;
    this.createNoiseBuffer();
  }

  private createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public triggerPad(pad: DrumPadSound, kit: DrumKit, velocity: number = 100) {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const vel = Math.max(0.05, Math.min(1.0, velocity / 127));
    const now = this.ctx.currentTime;
    const pitchFactor = Math.pow(2, (kit.pitch + (pad.pitchMultiplier ? (pad.pitchMultiplier - 1) * 12 : 0)) / 12);

    switch (pad.type) {
      case 'kick':
        this.playKick(now, vel, pitchFactor, kit.sub);
        break;
      case 'snare':
        this.playSnare(now, vel, pitchFactor, kit.snappy);
        break;
      case 'clap':
        this.playClap(now, vel, pitchFactor, kit.snappy);
        break;
      case 'closed_hh':
        this.playHiHat(now, vel, false, pitchFactor);
        break;
      case 'open_hh':
        this.playHiHat(now, vel, true, pitchFactor);
        break;
      case 'tom_low':
        this.playTom(now, vel, 80 * pitchFactor);
        break;
      case 'tom_mid':
        this.playTom(now, vel, 120 * pitchFactor);
        break;
      case 'tom_high':
        this.playTom(now, vel, 180 * pitchFactor);
        break;
      case 'crash':
        this.playCymbal(now, vel, true, pitchFactor);
        break;
      case 'ride':
        this.playCymbal(now, vel, false, pitchFactor);
        break;
      case 'rimshot':
        this.playRimshot(now, vel, pitchFactor);
        break;
      case 'percussion':
        this.playPercussion(now, vel, pitchFactor, pad.noteNumber);
        break;
      default:
        this.playTom(now, vel, 130);
    }
  }

  private playKick(now: number, vel: number, pitchFactor: number, subAmount: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 160 * pitchFactor;
    const endFreq = 42 * pitchFactor;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    // Punch transient click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(500, now);
    clickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.015);
    clickGain.gain.setValueAtTime(vel * 0.7, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    const kickGain = vel * (0.8 + subAmount * 0.3);
    gain.gain.setValueAtTime(kickGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    clickOsc.connect(clickGain);

    gain.connect(this.outputNode);
    clickGain.connect(this.outputNode);

    osc.start(now);
    clickOsc.start(now);
    osc.stop(now + 0.4);
    clickOsc.stop(now + 0.02);
  }

  private playSnare(now: number, vel: number, pitchFactor: number, snappy: number) {
    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(130 * pitchFactor, now + 0.06);

    oscGain.gain.setValueAtTime(vel * 0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.outputNode);
    osc.start(now);
    osc.stop(now + 0.15);

    // Noise wire
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000 * pitchFactor, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(vel * 0.75 * snappy, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.outputNode);

      noise.start(now);
      noise.stop(now + 0.25);
    }
  }

  private playClap(now: number, vel: number, pitchFactor: number, snappy: number) {
    if (!this.noiseBuffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 * pitchFactor, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.connect(this.outputNode);
    filter.connect(gain);

    // Multiple rapid noise bursts for handclap
    const delays = [0, 0.012, 0.024];
    delays.forEach(d => {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(vel * 0.6 * snappy, now + d);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + d + 0.02);
      noise.connect(filter);
      noise.start(now + d);
      noise.stop(now + d + 0.025);
    });

    // Main tail
    const tail = this.ctx.createBufferSource();
    tail.buffer = this.noiseBuffer;
    const tailGain = this.ctx.createGain();
    tailGain.gain.setValueAtTime(vel * 0.7 * snappy, now + 0.036);
    tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    tail.connect(filter);
    filter.connect(tailGain);
    tailGain.connect(this.outputNode);
    tail.start(now + 0.036);
    tail.stop(now + 0.3);
  }

  private playHiHat(now: number, vel: number, isOpen: boolean, pitchFactor: number) {
    if (!this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500 * pitchFactor, now);

    const gain = this.ctx.createGain();
    const duration = isOpen ? 0.35 : 0.055;
    gain.gain.setValueAtTime(vel * 0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.outputNode);

    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  private playTom(now: number, vel: number, startFreq: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.7, now + 0.2);

    gain.gain.setValueAtTime(vel * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.outputNode);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  private playCymbal(now: number, vel: number, isCrash: boolean, pitchFactor: number) {
    if (!this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isCrash ? 'highpass' : 'bandpass';
    filter.frequency.setValueAtTime((isCrash ? 5000 : 7000) * pitchFactor, now);
    if (!isCrash) filter.Q.setValueAtTime(3.0, now);

    const duration = isCrash ? 1.4 : 0.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vel * (isCrash ? 0.75 : 0.5), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.outputNode);

    noise.start(now);
    noise.stop(now + duration + 0.05);
  }

  private playRimshot(now: number, vel: number, pitchFactor: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(300 * pitchFactor, now + 0.03);

    gain.gain.setValueAtTime(vel * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.outputNode);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playPercussion(now: number, vel: number, pitchFactor: number, noteNumber: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Cowbell or Claves or Tambourine
    if (noteNumber === 56) {
      // Cowbell
      osc.type = 'square';
      osc.frequency.setValueAtTime(580 * pitchFactor, now);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 * pitchFactor, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(vel * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.outputNode);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Claves / Wood / Percussion
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 * pitchFactor, now);
      gain.gain.setValueAtTime(vel * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.outputNode);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  }
}
