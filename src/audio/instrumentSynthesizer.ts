import { InstrumentPreset, SynthParams } from '../types';

export interface ActiveVoice {
  noteNumber: number;
  oscillators: (OscillatorNode | AudioBufferSourceNode)[];
  gains: GainNode[];
  filterNode: BiquadFilterNode;
  envGain: GainNode;
  startTime: number;
  preset: InstrumentPreset;
  stopVoice: (time?: number) => void;
}

export class InstrumentSynthesizer {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private activeVoices: Map<number, ActiveVoice[]> = new Map();

  constructor(ctx: AudioContext, outputNode: GainNode) {
    this.ctx = ctx;
    this.outputNode = outputNode;
  }

  public noteToFreq(midiNote: number, pitchBendSemis: number = 0): number {
    return 440 * Math.pow(2, (midiNote + pitchBendSemis - 69) / 12);
  }

  public noteOn(
    midiNote: number,
    velocity: number,
    preset: InstrumentPreset,
    params: SynthParams,
    pitchBendSemis: number = 0,
    modVibratoDepth: number = 0,
    modFilterAmount: number = 0
  ) {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const vel = Math.max(0.05, Math.min(1.0, velocity / 127));
    const now = this.ctx.currentTime;
    const baseFreq = this.noteToFreq(midiNote, pitchBendSemis);

    // Voice Master Gain & Filter
    const envGain = this.ctx.createGain();
    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'lowpass';

    // Calculate cutoff based on knob (0..127) and preset brightness
    const cutoffBase = 40 + (Math.pow(params.filterCutoff / 127, 2.2) * 18000 * preset.brightness);
    const filterMod = modFilterAmount * 3000;
    const effectiveCutoff = Math.max(50, Math.min(20000, cutoffBase + filterMod));
    voiceFilter.frequency.setValueAtTime(effectiveCutoff, now);

    const resonanceQ = 0.5 + (params.filterResonance / 127) * 18;
    voiceFilter.Q.setValueAtTime(resonanceQ, now);

    // ADSR calculation (scaled with params)
    const attackTime = Math.max(0.002, preset.attack * (0.4 + (params.attack / 127) * 2.5));
    const decayTime = Math.max(0.02, preset.decay);
    const sustainLevel = Math.max(0.05, preset.sustain * vel);
    const releaseTime = Math.max(0.04, preset.release * (0.3 + (params.release / 127) * 2.5));

    // ADSR Envelope start
    envGain.gain.setValueAtTime(0.0001, now);
    envGain.gain.linearRampToValueAtTime(vel, now + attackTime);
    envGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustainLevel), now + attackTime + decayTime);

    // Vibrato LFO if modulation is active
    let vibratoLfo: OscillatorNode | null = null;
    let vibratoGain: GainNode | null = null;
    if (modVibratoDepth > 0.01) {
      vibratoLfo = this.ctx.createOscillator();
      vibratoGain = this.ctx.createGain();
      vibratoLfo.frequency.setValueAtTime(5.8, now); // 5.8 Hz vibrato
      vibratoGain.gain.setValueAtTime(baseFreq * 0.035 * modVibratoDepth, now);
      vibratoLfo.connect(vibratoGain);
      vibratoLfo.start(now);
    }

    const oscNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
    const subGains: GainNode[] = [];

    // Sound generation based on preset waveform type
    switch (preset.waveform) {
      case 'fm_ep': {
        // 2-Operator FM synthesis for lush electric pianos
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(baseFreq, now);

        modulator.type = 'sine';
        const modRatio = preset.id === 4 ? 1.0 : 2.0; // Rhodes vs DX
        modulator.frequency.setValueAtTime(baseFreq * modRatio, now);

        const modIndex = (preset.modulationIndex || 2.5) * baseFreq * vel;
        modGain.gain.setValueAtTime(modIndex, now);
        modGain.gain.exponentialRampToValueAtTime(Math.max(1, modIndex * 0.15), now + decayTime * 1.5);

        if (vibratoGain) {
          vibratoGain.connect(carrier.frequency);
        }

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(voiceFilter);

        carrier.start(now);
        modulator.start(now);
        oscNodes.push(carrier, modulator);
        break;
      }

      case 'fm_bell': {
        // Inharmonic bell FM synthesis
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(baseFreq, now);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(baseFreq * 2.756, now); // Inharmonic ratio

        const modIndex = baseFreq * 2.8 * vel;
        modGain.gain.setValueAtTime(modIndex, now);
        modGain.gain.exponentialRampToValueAtTime(0.01, now + decayTime);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(voiceFilter);

        carrier.start(now);
        modulator.start(now);
        oscNodes.push(carrier, modulator);
        break;
      }

      case 'organ': {
        // Hammond 4-drawbar harmonic additive synthesis (16', 8', 4', 2')
        const harmonics = [0.5, 1, 2, 3];
        const levels = [0.35, 0.7, 0.45, 0.25];

        harmonics.forEach((h, idx) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * h, now);
          if (vibratoGain) vibratoGain.connect(osc.frequency);

          g.gain.setValueAtTime(levels[idx] * vel, now);
          osc.connect(g);
          g.connect(voiceFilter);
          osc.start(now);
          oscNodes.push(osc);
          subGains.push(g);
        });
        break;
      }

      case 'strings':
      case 'pad': {
        // Detuned dual/triple sawtooth & pad layers
        const detunes = [-7, 0, 7];
        detunes.forEach((d) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.detune.setValueAtTime(d + (preset.harmonicDetune || 0), now);
          if (vibratoGain) vibratoGain.connect(osc.frequency);

          g.gain.setValueAtTime((0.35 / detunes.length) * vel, now);
          osc.connect(g);
          g.connect(voiceFilter);
          osc.start(now);
          oscNodes.push(osc);
          subGains.push(g);
        });
        break;
      }

      case 'brass': {
        // Brass filter swell
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc2.frequency.setValueAtTime(baseFreq, now);
        osc2.detune.setValueAtTime(5, now);

        if (vibratoGain) {
          vibratoGain.connect(osc1.frequency);
          vibratoGain.connect(osc2.frequency);
        }

        // Brass envelope sweep on filter
        voiceFilter.frequency.setValueAtTime(Math.min(18000, effectiveCutoff * 0.4), now);
        voiceFilter.frequency.exponentialRampToValueAtTime(effectiveCutoff, now + attackTime);
        voiceFilter.frequency.exponentialRampToValueAtTime(Math.max(300, effectiveCutoff * 0.7), now + attackTime + decayTime);

        osc1.connect(voiceFilter);
        osc2.connect(voiceFilter);
        osc1.start(now);
        osc2.start(now);
        oscNodes.push(osc1, osc2);
        break;
      }

      case 'pluck': {
        // Crisp plucked acoustic guitar/piano/harp/clav
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc2.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc2.frequency.setValueAtTime(baseFreq * 2, now);

        const g1 = this.ctx.createGain();
        const g2 = this.ctx.createGain();
        g1.gain.setValueAtTime(0.7 * vel, now);
        g2.gain.setValueAtTime(0.3 * vel, now);
        g2.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Fast overtone drop

        osc.connect(g1);
        osc2.connect(g2);
        g1.connect(voiceFilter);
        g2.connect(voiceFilter);

        osc.start(now);
        osc2.start(now);
        oscNodes.push(osc, osc2);
        subGains.push(g1, g2);
        break;
      }

      default: {
        // Standard oscillator with optional sub-oscillator
        const osc = this.ctx.createOscillator();
        osc.type = (preset.waveform as OscillatorType) || 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq, now);
        if (vibratoGain) vibratoGain.connect(osc.frequency);
        osc.connect(voiceFilter);
        osc.start(now);
        oscNodes.push(osc);

        if (preset.subOsc) {
          const sub = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          sub.type = 'sine';
          sub.frequency.setValueAtTime(baseFreq * 0.5, now);
          subGain.gain.setValueAtTime(preset.subOsc * vel, now);
          sub.connect(subGain);
          subGain.connect(voiceFilter);
          sub.start(now);
          oscNodes.push(sub);
          subGains.push(subGain);
        }
      }
    }

    // Connect filter -> envGain -> engine output
    voiceFilter.connect(envGain);
    envGain.connect(this.outputNode);

    const voice: ActiveVoice = {
      noteNumber: midiNote,
      oscillators: oscNodes,
      gains: subGains,
      filterNode: voiceFilter,
      envGain,
      startTime: now,
      preset,
      stopVoice: (stopAtTime?: number) => {
        const t = stopAtTime ?? this.ctx.currentTime;
        envGain.gain.cancelScheduledValues(t);
        envGain.gain.setValueAtTime(envGain.gain.value, t);
        envGain.gain.exponentialRampToValueAtTime(0.0001, t + releaseTime);

        setTimeout(() => {
          try {
            oscNodes.forEach(o => {
              if ('stop' in o) o.stop();
              o.disconnect();
            });
            if (vibratoLfo) {
              vibratoLfo.stop();
              vibratoLfo.disconnect();
            }
            voiceFilter.disconnect();
            envGain.disconnect();
          } catch {
            // Already disconnected
          }
        }, (releaseTime + 0.05) * 1000);
      }
    };

    const currentList = this.activeVoices.get(midiNote) || [];
    currentList.push(voice);
    this.activeVoices.set(midiNote, currentList);

    return voice;
  }

  public noteOff(midiNote: number) {
    const voices = this.activeVoices.get(midiNote);
    if (!voices || voices.length === 0) return;

    // Release all active voices for this note
    voices.forEach(v => v.stopVoice());
    this.activeVoices.delete(midiNote);
  }

  public updatePitchBend(pitchBendSemis: number) {
    // Update live voices frequency
    this.activeVoices.forEach((voices, midiNote) => {
      const newFreq = this.noteToFreq(midiNote, pitchBendSemis);
      voices.forEach(v => {
        v.oscillators.forEach(osc => {
          if ('frequency' in osc && osc.frequency) {
            osc.frequency.cancelScheduledValues(this.ctx.currentTime);
            osc.frequency.setValueAtTime(newFreq, this.ctx.currentTime);
          }
        });
      });
    });
  }

  public updateFilter(params: SynthParams) {
    const now = this.ctx.currentTime;
    this.activeVoices.forEach(voices => {
      voices.forEach(v => {
        const cutoffBase = 40 + (Math.pow(params.filterCutoff / 127, 2.2) * 18000 * v.preset.brightness);
        v.filterNode.frequency.setValueAtTime(cutoffBase, now);
        const resonanceQ = 0.5 + (params.filterResonance / 127) * 18;
        v.filterNode.Q.setValueAtTime(resonanceQ, now);
      });
    });
  }

  public stopAllVoices() {
    this.activeVoices.forEach(voices => {
      voices.forEach(v => v.stopVoice());
    });
    this.activeVoices.clear();
  }
}
