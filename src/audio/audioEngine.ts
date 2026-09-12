import { DrumKit, DrumPadSound, InstrumentPreset, SynthParams } from '../types';
import { DrumSynthesizer } from './drumSynthesizer';
import { InstrumentSynthesizer } from './instrumentSynthesizer';
import { WavRecorder } from './wavRecorder';
import { MetronomeEngine } from './metronome';
import { DemoPlayer } from './demoGrooves';

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  public ctx: AudioContext;
  public instrumentSynth: InstrumentSynthesizer;
  public drumSynth: DrumSynthesizer;
  public recorder: WavRecorder;
  public metronome: MetronomeEngine;
  public demoPlayer: DemoPlayer;

  // Audio Graph Nodes
  private synthBus: GainNode;
  private drumBus: GainNode;
  private mixBus: GainNode;

  // 4 DSP FX
  private masterFilter: BiquadFilterNode;
  private eqLow: BiquadFilterNode;
  private eqHigh: BiquadFilterNode;

  // Speaker Emulation DSP
  private speakerFilterHp: BiquadFilterNode;
  private speakerFilterPeak: BiquadFilterNode;
  private speakerFilterLp: BiquadFilterNode;
  public speakerEmulationActive: boolean = false;

  // Chorus
  private chorusInput: GainNode;
  private chorusDelayL: DelayNode;
  private chorusDelayR: DelayNode;
  private chorusLfo: OscillatorNode;
  private chorusLfoGainL: GainNode;
  private chorusLfoGainR: GainNode;
  private chorusSend: GainNode;
  private chorusDry: GainNode;
  private chorusOutput: GainNode;

  // Reverb
  private reverbConvolver: ConvolverNode;
  private reverbSend: GainNode;
  private reverbDry: GainNode;
  private reverbReturn: GainNode;

  // Master dynamics limiter & volume
  private masterLimiter: DynamicsCompressorNode;
  private masterGain: GainNode;

  // State
  private pitchBendSemis: number = 0;
  private modVibratoDepth: number = 0;
  private modFilterAmount: number = 0;
  public isUnlocked: boolean = false;

  private constructor() {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({
      latencyHint: 'interactive',
      sampleRate: 44100
    });

    // 1. Inputs
    this.synthBus = this.ctx.createGain();
    this.drumBus = this.ctx.createGain();
    this.mixBus = this.ctx.createGain();

    this.synthBus.gain.value = 0.9;
    this.drumBus.gain.value = 0.95;

    this.instrumentSynth = new InstrumentSynthesizer(this.ctx, this.synthBus);
    this.drumSynth = new DrumSynthesizer(this.ctx, this.drumBus);

    this.synthBus.connect(this.mixBus);
    this.drumBus.connect(this.mixBus);

    // 2. Global Lowpass Filter
    this.masterFilter = this.ctx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.value = 20000;
    this.masterFilter.Q.value = 1.0;

    // 3. EQ Low & High Shelves
    this.eqLow = this.ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 180;
    this.eqLow.gain.value = 0;

    this.eqHigh = this.ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 4500;
    this.eqHigh.gain.value = 0;

    this.mixBus.connect(this.masterFilter);
    this.masterFilter.connect(this.eqLow);
    this.eqLow.connect(this.eqHigh);

    // 4. Stereo Chorus / Modulation
    this.chorusInput = this.ctx.createGain();
    this.chorusDry = this.ctx.createGain();
    this.chorusSend = this.ctx.createGain();
    this.chorusOutput = this.ctx.createGain();

    this.chorusDelayL = this.ctx.createDelay();
    this.chorusDelayR = this.ctx.createDelay();
    this.chorusDelayL.delayTime.value = 0.024;
    this.chorusDelayR.delayTime.value = 0.032;

    this.chorusLfo = this.ctx.createOscillator();
    this.chorusLfo.frequency.value = 0.85; // 0.85 Hz LFO

    this.chorusLfoGainL = this.ctx.createGain();
    this.chorusLfoGainR = this.ctx.createGain();
    this.chorusLfoGainL.gain.value = 0.003;
    this.chorusLfoGainR.gain.value = -0.003;

    this.chorusLfo.connect(this.chorusLfoGainL);
    this.chorusLfo.connect(this.chorusLfoGainR);
    this.chorusLfoGainL.connect(this.chorusDelayL.delayTime);
    this.chorusLfoGainR.connect(this.chorusDelayR.delayTime);
    this.chorusLfo.start();

    this.eqHigh.connect(this.chorusInput);
    this.chorusInput.connect(this.chorusDry);
    this.chorusInput.connect(this.chorusSend);

    this.chorusSend.connect(this.chorusDelayL);
    this.chorusSend.connect(this.chorusDelayR);
    this.chorusDelayL.connect(this.chorusOutput);
    this.chorusDelayR.connect(this.chorusOutput);
    this.chorusDry.connect(this.chorusOutput);

    this.chorusDry.gain.value = 1.0;
    this.chorusSend.gain.value = 0.0; // Controlled by chorusAmount

    // 5. Algorithmic Stereo Reverb (Convolver)
    this.reverbConvolver = this.ctx.createConvolver();
    this.reverbConvolver.buffer = this.buildImpulseResponse(2.2, 1.8);
    this.reverbSend = this.ctx.createGain();
    this.reverbDry = this.ctx.createGain();
    this.reverbReturn = this.ctx.createGain();

    this.reverbDry.gain.value = 1.0;
    this.reverbSend.gain.value = 0.25; // Controlled by reverbAmount

    this.chorusOutput.connect(this.reverbDry);
    this.chorusOutput.connect(this.reverbSend);
    this.reverbSend.connect(this.reverbConvolver);
    this.reverbConvolver.connect(this.reverbReturn);

    // 6. Master Limiter & Master Volume
    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.value = -1.5;
    this.masterLimiter.knee.value = 2.0;
    this.masterLimiter.ratio.value = 18;
    this.masterLimiter.attack.value = 0.002;
    this.masterLimiter.release.value = 0.06;

    // Built-in 2.5" Acoustic Speaker Cone Modeler
    this.speakerFilterHp = this.ctx.createBiquadFilter();
    this.speakerFilterHp.type = 'highpass';
    this.speakerFilterHp.frequency.value = 10;

    this.speakerFilterPeak = this.ctx.createBiquadFilter();
    this.speakerFilterPeak.type = 'peaking';
    this.speakerFilterPeak.frequency.value = 2300;
    this.speakerFilterPeak.Q.value = 1.8;
    this.speakerFilterPeak.gain.value = 0;

    this.speakerFilterLp = this.ctx.createBiquadFilter();
    this.speakerFilterLp.type = 'lowpass';
    this.speakerFilterLp.frequency.value = 22000;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    this.reverbDry.connect(this.masterLimiter);
    this.reverbReturn.connect(this.masterLimiter);

    this.masterLimiter.connect(this.speakerFilterHp);
    this.speakerFilterHp.connect(this.speakerFilterPeak);
    this.speakerFilterPeak.connect(this.speakerFilterLp);
    this.speakerFilterLp.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // 7. Pro Commercial Modules: Master Recorder, Metronome, Demo Player
    this.recorder = new WavRecorder(this.ctx, this.masterGain);
    this.metronome = new MetronomeEngine(this.ctx);
    this.demoPlayer = new DemoPlayer(this);
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Unlock AudioContext on mobile/iOS
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Play short inaudible buffer to unlock WebKit audio pipeline
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);

      this.isUnlocked = this.ctx.state === 'running';
      return this.isUnlocked;
    } catch (e) {
      console.warn('AudioContext unlock failed:', e);
      return false;
    }
  }

  /**
   * Generates a high-density, lush stereo impulse response procedurally.
   * Completely offline, instantaneous, zero-network overhead!
   */
  private buildImpulseResponse(duration: number, decayRate: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const decay = Math.pow(1 - n, decayRate);
      // Stereo decorrelated diffusion
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }

    return impulse;
  }

  // Parameter Updates from Knobs
  public updateSynthParams(params: SynthParams) {
    const now = this.ctx.currentTime;

    // Filter Cutoff (Knob 1 in Mode 1)
    const cutoffHz = 40 + (Math.pow(params.filterCutoff / 127, 2.2) * 19960);
    this.masterFilter.frequency.setTargetAtTime(cutoffHz, now, 0.02);

    // Filter Resonance (Knob 2 in Mode 1)
    const resonanceQ = 0.5 + (params.filterResonance / 127) * 16;
    this.masterFilter.Q.setTargetAtTime(resonanceQ, now, 0.02);

    // Reverb Amount (Knob 3 in Mode 1)
    const revWet = (params.reverbAmount / 127) * 0.85;
    this.reverbSend.gain.setTargetAtTime(revWet, now, 0.03);

    // Chorus Amount (Knob 4 in Mode 1)
    const choWet = (params.chorusAmount / 127) * 0.75;
    this.chorusSend.gain.setTargetAtTime(choWet, now, 0.03);

    // EQ Low (Mode 2 Knob 3): -12dB to +12dB
    const eqLowGain = ((params.eqLow - 64) / 64) * 12;
    this.eqLow.gain.setTargetAtTime(eqLowGain, now, 0.03);

    // EQ High (Mode 2 Knob 4): -12dB to +12dB
    const eqHighGain = ((params.eqHigh - 64) / 64) * 12;
    this.eqHigh.gain.setTargetAtTime(eqHighGain, now, 0.03);

    // Propagate changes to instrument synthesizer
    this.instrumentSynth.updateFilter(params);
  }

  public setMasterVolume(val: number) {
    // val is 0..100
    const gain = Math.max(0, Math.min(1, val / 100));
    this.masterGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.02);
  }

  public setSpeakerEmulation(enabled: boolean) {
    this.speakerEmulationActive = enabled;
    const now = this.ctx.currentTime;
    if (enabled) {
      // Small 2.5" speaker cone acoustics: roll off sub-bass (<160Hz), punchy mid resonance (+4.2dB @ 2.3kHz), high roll-off (>11kHz)
      this.speakerFilterHp.frequency.setTargetAtTime(160, now, 0.02);
      this.speakerFilterPeak.gain.setTargetAtTime(4.2, now, 0.02);
      this.speakerFilterLp.frequency.setTargetAtTime(11000, now, 0.02);
    } else {
      // Flat studio monitor / line-out curve
      this.speakerFilterHp.frequency.setTargetAtTime(10, now, 0.02);
      this.speakerFilterPeak.gain.setTargetAtTime(0, now, 0.02);
      this.speakerFilterLp.frequency.setTargetAtTime(22000, now, 0.02);
    }
  }

  public setJoystick(x: number, y: number) {
    // x: -1 to +1 (pitch bend +/- 2 semitones)
    this.pitchBendSemis = x * 2.0;
    this.instrumentSynth.updatePitchBend(this.pitchBendSemis);

    // y: -1 to +1 (+y = vibrato depth, -y = filter modulation)
    if (y >= 0) {
      this.modVibratoDepth = y;
      this.modFilterAmount = 0;
    } else {
      this.modVibratoDepth = 0;
      this.modFilterAmount = y; // negative filter sweep
    }
  }

  // Keyboard note play
  public playNote(midiNote: number, velocity: number, preset: InstrumentPreset, params: SynthParams) {
    if (this.ctx.state === 'suspended') {
      this.unlockAudio();
    }
    this.instrumentSynth.noteOn(
      midiNote,
      velocity,
      preset,
      params,
      this.pitchBendSemis,
      this.modVibratoDepth,
      this.modFilterAmount
    );
  }

  public stopNote(midiNote: number) {
    this.instrumentSynth.noteOff(midiNote);
  }

  // Drum pad trigger
  public triggerPad(pad: DrumPadSound, kit: DrumKit, velocity: number) {
    if (this.ctx.state === 'suspended') {
      this.unlockAudio();
    }
    this.drumSynth.triggerPad(pad, kit, velocity);
  }

  public allNotesOff() {
    this.instrumentSynth.stopAllVoices();
  }
}
