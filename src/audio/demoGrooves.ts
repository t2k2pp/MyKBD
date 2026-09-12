/**
 * Studio Synth Workstation - Professional Demo Grooves Engine
 * Plays real-time multi-part grooves using the internal synthesizer and drum engines.
 */

import { AudioEngine } from './audioEngine';
import { DRUM_KITS, GM_PRESETS } from './soundList';

export interface DemoTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  presetIndex: number; // GM preset index
  drumKitIndex: number; // Drum kit index
}

export const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'synthwave',
    title: 'Neon Horizon',
    genre: 'Synthwave 84',
    bpm: 124,
    presetIndex: 80, // Synth Lead (Square)
    drumKitIndex: 3, // Electronic Kit
  },
  {
    id: 'neosoul',
    title: 'Velvet Midnight',
    genre: 'Neo-Soul Rhodes',
    bpm: 92,
    presetIndex: 4, // Electric Piano 1 (Rhodes)
    drumKitIndex: 5, // Jazz Kit
  },
  {
    id: 'trap',
    title: 'Quantum Drift',
    genre: 'Future Cyber Trap',
    bpm: 140,
    presetIndex: 98, // Crystal Bell Pad
    drumKitIndex: 4, // TR-808 Kit
  },
];

export class DemoPlayer {
  private audioEngine: AudioEngine;
  private isPlaying: boolean = false;
  private currentTrack: DemoTrack | null = null;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private onStepCallback: ((step: number, track: DemoTrack) => void) | null = null;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): DemoTrack | null {
    return this.currentTrack;
  }

  public start(track: DemoTrack, onStep?: (step: number, track: DemoTrack) => void) {
    this.stop();
    this.audioEngine.unlockAudio();
    this.isPlaying = true;
    this.currentTrack = track;
    this.currentStep = 0;
    this.onStepCallback = onStep || null;

    const stepInterval = (60.0 / track.bpm / 4) * 1000; // 16th note in ms

    this.timerId = window.setInterval(() => {
      if (!this.isPlaying || !this.currentTrack) return;
      this.playStep(this.currentStep, this.currentTrack);
      if (this.onStepCallback) {
        this.onStepCallback(this.currentStep, this.currentTrack);
      }
      this.currentStep = (this.currentStep + 1) % 32; // 2-bar loop (32 16th steps)
    }, stepInterval);
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrack = null;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private playStep(step: number, track: DemoTrack) {
    const kit = DRUM_KITS[track.drumKitIndex] || DRUM_KITS[0];
    const preset = GM_PRESETS[track.presetIndex] || GM_PRESETS[0];

    const params = {
      filterCutoff: 105,
      filterResonance: 35,
      reverbAmount: 50,
      chorusAmount: 30,
      attack: 10,
      release: 45,
      eqLow: 70,
      eqHigh: 68,
    };

    if (track.id === 'synthwave') {
      // Kick on 0, 8, 16, 24 (4 on the floor)
      if (step % 8 === 0) {
        this.audioEngine.triggerPad(kit.padsA[0], kit, 120); // Kick
      }
      // Snare on 4, 12, 20, 28
      if (step % 8 === 4) {
        this.audioEngine.triggerPad(kit.padsA[1], kit, 115); // Snare
      }
      // Hi-Hat on all offbeats (2, 6, 10, 14, 18, 22, 26, 30)
      if (step % 4 === 2) {
        this.audioEngine.triggerPad(kit.padsA[2], kit, 95); // Closed HH
      }

      // Melodic Bassline & Lead
      const synthwaveNotes: Record<number, number> = {
        0: 48, 2: 48, 4: 60, 6: 58, 8: 48, 10: 48, 12: 55, 14: 58,
        16: 46, 18: 46, 20: 58, 22: 56, 24: 44, 26: 44, 28: 56, 30: 55,
      };

      if (synthwaveNotes[step] !== undefined) {
        const note = synthwaveNotes[step];
        this.audioEngine.playNote(note, 100, preset, params);
        setTimeout(() => this.audioEngine.stopNote(note), 120);
      }
    } else if (track.id === 'neosoul') {
      // Boom-bap / Neo-soul drums
      if (step === 0 || step === 10 || step === 16 || step === 22) {
        this.audioEngine.triggerPad(kit.padsA[0], kit, 105); // Kick
      }
      if (step === 8 || step === 24) {
        this.audioEngine.triggerPad(kit.padsA[1], kit, 110); // Snare/Rim
      }
      if (step % 2 === 0) {
        this.audioEngine.triggerPad(kit.padsA[2], kit, step % 4 === 0 ? 80 : 65); // HH
      }

      // Lush 7th / 9th chords on bar downbeats
      if (step === 0) {
        // Cmaj9: C3, G3, B3, D4, E4
        [48, 55, 59, 62, 64].forEach((n) => {
          this.audioEngine.playNote(n, 90, preset, params);
          setTimeout(() => this.audioEngine.stopNote(n), 1200);
        });
      } else if (step === 16) {
        // Am9: A2, E3, G3, C4, B4
        [45, 52, 55, 60, 71].forEach((n) => {
          this.audioEngine.playNote(n, 90, preset, params);
          setTimeout(() => this.audioEngine.stopNote(n), 1200);
        });
      }
    } else {
      // Future Cyber Trap
      // 808 Kick
      if (step === 0 || step === 6 || step === 14 || step === 16 || step === 26) {
        this.audioEngine.triggerPad(kit.padsA[0], kit, 127);
      }
      // Clap on 8 and 24
      if (step === 8 || step === 24) {
        this.audioEngine.triggerPad(kit.padsA[3], kit, 115);
      }
      // Trap Roll Hi-Hats
      if (step % 2 === 0 || (step >= 24 && step <= 27)) {
        this.audioEngine.triggerPad(kit.padsA[2], kit, 85);
      }

      // Bell Pluck Arp
      const trapNotes: Record<number, number> = {
        0: 72, 3: 75, 6: 79, 9: 82, 12: 79, 14: 75,
        16: 70, 19: 74, 22: 77, 25: 82, 28: 77, 30: 74,
      };
      if (trapNotes[step] !== undefined) {
        const n = trapNotes[step];
        this.audioEngine.playNote(n, 105, preset, params);
        setTimeout(() => this.audioEngine.stopNote(n), 160);
      }
    }
  }
}
