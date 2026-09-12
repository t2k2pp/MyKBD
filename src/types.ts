export type ArpMode = 'UP' | 'DOWN' | 'EXCL' | 'INCL' | 'ORDER' | 'RAND';

export type TimeDivision = '1/4' | '1/8' | '1/16' | '1/32' | '1/8T' | '1/16T';

export type PadBank = 'A' | 'B';

export type KnobMode = 1 | 2; // Mode 1: Filter/Res/Rev/Cho, Mode 2: Attack/Release/Low/High

export interface InstrumentPreset {
  id: number; // 0 to 127
  name: string;
  category: string;
  family: string;
  waveform: 'sine' | 'triangle' | 'sawtooth' | 'square' | 'organ' | 'fm_ep' | 'fm_bell' | 'brass' | 'reed' | 'strings' | 'pluck' | 'lead' | 'pad' | 'sfx';
  brightness: number; // 0..1 base filter cutoff scaling
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // 0..1
  release: number; // seconds
  harmonicDetune?: number;
  modulationIndex?: number;
  subOsc?: number;
}

export interface DrumPadSound {
  padNumber: number; // 1 to 16
  name: string;
  noteNumber: number; // GM Drum note (e.g. 36 = Kick, 38 = Snare, 42 = CHH, etc.)
  type: 'kick' | 'snare' | 'clap' | 'closed_hh' | 'open_hh' | 'tom_low' | 'tom_mid' | 'tom_high' | 'crash' | 'ride' | 'rimshot' | 'percussion';
  pitchMultiplier?: number;
}

export interface DrumKit {
  id: number;
  name: string;
  style: string;
  pitch: number; // pitch offset in semitones
  snappy: number; // snare/clap noise amount
  sub: number; // kick sub amount
  padsA: DrumPadSound[]; // Pads 1..8
  padsB: DrumPadSound[]; // Pads 9..16
}

export interface SynthParams {
  filterCutoff: number; // 0 - 127
  filterResonance: number; // 0 - 127
  reverbAmount: number; // 0 - 127
  chorusAmount: number; // 0 - 127
  attack: number; // 0 - 127
  release: number; // 0 - 127
  eqLow: number; // 0 - 127 (64 = flat)
  eqHigh: number; // 0 - 127 (64 = flat)
}

export interface ArpSettings {
  enabled: boolean;
  mode: ArpMode;
  octaveRange: number; // 1, 2, 3, 4
  division: TimeDivision;
  swing: number; // 50 to 75
  latch: boolean;
  bpm: number; // 30 to 280
}

export interface NoteRepeatSettings {
  enabled: boolean;
  division: TimeDivision;
  bpm: number;
}

export interface OledDisplayState {
  line1: string;
  line2: string;
  paramName?: string;
  paramValue?: string | number;
  paramBar?: number; // 0 - 100%
  statusBadge?: string;
  flashUntil?: number;
}

export interface ActiveNote {
  noteNumber: number;
  velocity: number;
  source: 'key' | 'pad' | 'arp' | 'repeat' | 'midi' | 'kb';
  startTime: number;
}

export type MusicalScale =
  | 'CHROMATIC'
  | 'MAJOR'
  | 'NATURAL_MINOR'
  | 'DORIAN'
  | 'PENTATONIC_MAJOR'
  | 'PENTATONIC_MINOR'
  | 'BLUES'
  | 'HIRAJOSHI';

export type ChordType =
  | 'OFF'
  | 'OCTAVE'
  | 'TRIAD'
  | 'SEVENTH'
  | 'NINTH'
  | 'SUS4';

export interface UserPreset {
  slot: number; // 1 to 8
  name: string;
  presetId: number;
  params: SynthParams;
}
