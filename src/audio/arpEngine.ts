import { ArpMode, ArpSettings, DrumKit, DrumPadSound, InstrumentPreset, NoteRepeatSettings, SynthParams, TimeDivision } from '../types';
import { AudioEngine } from './audioEngine';

export class ArpEngine {
  private audioEngine: AudioEngine;
  private heldNotes: number[] = [];
  private orderNotes: number[] = [];
  private latchedNotes: number[] = [];
  private currentStepIndex: number = 0;
  private timerId: number | null = null;
  private nextNoteTime: number = 0;
  private isRunning: boolean = false;

  // Active repeating pads
  private heldPads: Map<number, { pad: DrumPadSound; kit: DrumKit; velocity: number }> = new Map();

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  public divisionToSeconds(div: TimeDivision, bpm: number): number {
    const beatSeconds = 60 / bpm; // quarter note
    switch (div) {
      case '1/4': return beatSeconds;
      case '1/8': return beatSeconds / 2;
      case '1/16': return beatSeconds / 4;
      case '1/32': return beatSeconds / 8;
      case '1/8T': return (beatSeconds / 2) * (2 / 3);
      case '1/16T': return (beatSeconds / 4) * (2 / 3);
      default: return beatSeconds / 4;
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.nextNoteTime = this.audioEngine.ctx.currentTime + 0.05;
    this.scheduler();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentStepIndex = 0;
  }

  public noteDown(note: number) {
    if (!this.heldNotes.includes(note)) {
      this.heldNotes.push(note);
      this.orderNotes.push(note);
    }
    this.latchedNotes = [...this.heldNotes];
  }

  public noteUp(note: number) {
    this.heldNotes = this.heldNotes.filter(n => n !== note);
    this.orderNotes = this.orderNotes.filter(n => n !== note);
  }

  public padDown(pad: DrumPadSound, kit: DrumKit, velocity: number) {
    this.heldPads.set(pad.padNumber, { pad, kit, velocity });
  }

  public padUp(padNumber: number) {
    this.heldPads.delete(padNumber);
  }

  public clearAll() {
    this.heldNotes = [];
    this.orderNotes = [];
    this.latchedNotes = [];
    this.heldPads.clear();
  }

  public tick(
    arpSettings: ArpSettings,
    noteRepeatSettings: NoteRepeatSettings,
    currentPreset: InstrumentPreset,
    params: SynthParams,
    onActiveArpNote?: (note: number | null) => void
  ) {
    if (!arpSettings.enabled && !noteRepeatSettings.enabled) {
      return;
    }

    const now = this.audioEngine.ctx.currentTime;
    const scheduleAheadTime = 0.1; // schedule 100ms ahead

    while (this.nextNoteTime < now + scheduleAheadTime) {
      // 1. Process Arpeggiator
      if (arpSettings.enabled) {
        const activeNotes = arpSettings.latch && this.heldNotes.length === 0
          ? this.latchedNotes
          : this.heldNotes;

        if (activeNotes.length > 0) {
          const sequence = this.buildSequence(activeNotes, arpSettings.mode, arpSettings.octaveRange);
          if (sequence.length > 0) {
            const noteToPlay = sequence[this.currentStepIndex % sequence.length];
            const stepDuration = this.divisionToSeconds(arpSettings.division, arpSettings.bpm);
            const gateTime = stepDuration * 0.75;

            // Schedule voice play at exact audio time
            const playTime = Math.max(now, this.nextNoteTime);
            this.playScheduledNote(noteToPlay, 100, currentPreset, params, playTime, gateTime);

            if (onActiveArpNote) {
              const delayMs = Math.max(0, (playTime - now) * 1000);
              setTimeout(() => onActiveArpNote(noteToPlay), delayMs);
              setTimeout(() => onActiveArpNote(null), delayMs + gateTime * 1000);
            }

            this.currentStepIndex++;
          }
        } else {
          if (onActiveArpNote) onActiveArpNote(null);
        }
      }

      // 2. Process Note Repeat for Held Drum Pads
      if (noteRepeatSettings.enabled && this.heldPads.size > 0) {
        this.heldPads.forEach(({ pad, kit, velocity }) => {
          this.audioEngine.triggerPad(pad, kit, velocity);
        });
      }

      // Advance time clock (using Arp tempo if Arp is on, else NoteRepeat tempo)
      const division = arpSettings.enabled ? arpSettings.division : noteRepeatSettings.division;
      const bpm = arpSettings.enabled ? arpSettings.bpm : noteRepeatSettings.bpm;
      const stepSec = this.divisionToSeconds(division, bpm);

      // Swing calculation on off-beats
      let swingOffset = 0;
      if (arpSettings.enabled && arpSettings.swing > 50 && (this.currentStepIndex % 2 === 1)) {
        const swingRatio = (arpSettings.swing - 50) / 50; // 0..0.5
        swingOffset = stepSec * swingRatio * 0.5;
      }

      this.nextNoteTime += stepSec + swingOffset;
    }
  }

  private scheduler() {
    // Self-scheduling loop with 25ms interval
    this.timerId = window.setTimeout(() => {
      if (this.isRunning) {
        this.scheduler();
      }
    }, 25);
  }

  private buildSequence(notes: number[], mode: ArpMode, octaveRange: number): number[] {
    const sorted = [...notes].sort((a, b) => a - b);
    const multiOctaveNotes: number[] = [];

    for (let oct = 0; oct < octaveRange; oct++) {
      const shift = oct * 12;
      sorted.forEach(n => {
        multiOctaveNotes.push(n + shift);
      });
    }

    switch (mode) {
      case 'UP':
        return multiOctaveNotes;
      case 'DOWN':
        return [...multiOctaveNotes].reverse();
      case 'EXCL': {
        if (multiOctaveNotes.length <= 2) return multiOctaveNotes;
        const up = [...multiOctaveNotes];
        const down = [...multiOctaveNotes].slice(1, -1).reverse();
        return [...up, ...down];
      }
      case 'INCL': {
        const up = [...multiOctaveNotes];
        const down = [...multiOctaveNotes].reverse();
        return [...up, ...down];
      }
      case 'ORDER': {
        const orderOctaves: number[] = [];
        for (let oct = 0; oct < octaveRange; oct++) {
          this.orderNotes.forEach(n => orderOctaves.push(n + oct * 12));
        }
        return orderOctaves;
      }
      case 'RAND': {
        const randArr = [...multiOctaveNotes];
        for (let i = randArr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [randArr[i], randArr[j]] = [randArr[j], randArr[i]];
        }
        return randArr;
      }
      default:
        return multiOctaveNotes;
    }
  }

  private playScheduledNote(
    note: number,
    velocity: number,
    preset: InstrumentPreset,
    params: SynthParams,
    time: number,
    duration: number
  ) {
    this.audioEngine.playNote(note, velocity, preset, params);
    setTimeout(() => {
      this.audioEngine.stopNote(note);
    }, duration * 1000);
  }
}
