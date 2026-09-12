import { DrumKit, DrumPadSound, InstrumentPreset } from '../types';

export const GM_CATEGORIES = [
  'All',
  'Piano',
  'Chromatic',
  'Organ',
  'Guitar',
  'Bass',
  'Strings',
  'Ensemble',
  'Brass',
  'Reed',
  'Pipe',
  'Synth Lead',
  'Synth Pad',
  'Synth FX',
  'Ethnic',
  'Percussive',
  'SFX'
];

export const GM_PRESETS: InstrumentPreset[] = [
  // 1-8 Piano
  { id: 0, name: 'Acoustic Grand', category: 'Piano', family: 'Piano', waveform: 'pluck', brightness: 0.85, attack: 0.005, decay: 1.6, sustain: 0.25, release: 0.4 },
  { id: 1, name: 'Bright Piano', category: 'Piano', family: 'Piano', waveform: 'sawtooth', brightness: 0.95, attack: 0.003, decay: 1.4, sustain: 0.2, release: 0.35, harmonicDetune: 3 },
  { id: 2, name: 'Electric Grand', category: 'Piano', family: 'Piano', waveform: 'fm_ep', brightness: 0.78, attack: 0.005, decay: 1.8, sustain: 0.35, release: 0.5 },
  { id: 3, name: 'Honky-tonk', category: 'Piano', family: 'Piano', waveform: 'sawtooth', brightness: 0.88, attack: 0.004, decay: 1.2, sustain: 0.2, release: 0.3, harmonicDetune: 8 },
  { id: 4, name: 'Rhodes EP', category: 'Piano', family: 'Piano', waveform: 'fm_ep', brightness: 0.65, attack: 0.008, decay: 2.0, sustain: 0.45, release: 0.6, modulationIndex: 2.2 },
  { id: 5, name: 'FM DX Piano', category: 'Piano', family: 'Piano', waveform: 'fm_ep', brightness: 0.90, attack: 0.004, decay: 2.2, sustain: 0.35, release: 0.65, modulationIndex: 3.8 },
  { id: 6, name: 'Harpsichord', category: 'Piano', family: 'Piano', waveform: 'pluck', brightness: 0.95, attack: 0.002, decay: 0.9, sustain: 0.1, release: 0.2 },
  { id: 7, name: 'Clavinet', category: 'Piano', family: 'Piano', waveform: 'square', brightness: 0.88, attack: 0.005, decay: 0.8, sustain: 0.15, release: 0.2, subOsc: 0.2 },

  // 9-16 Chromatic Percussion
  { id: 8, name: 'Celesta', category: 'Chromatic', family: 'Percussion', waveform: 'fm_bell', brightness: 0.7, attack: 0.005, decay: 1.2, sustain: 0.1, release: 0.5 },
  { id: 9, name: 'Glockenspiel', category: 'Chromatic', family: 'Percussion', waveform: 'fm_bell', brightness: 0.95, attack: 0.003, decay: 1.5, sustain: 0.08, release: 0.6 },
  { id: 10, name: 'Music Box', category: 'Chromatic', family: 'Percussion', waveform: 'fm_bell', brightness: 0.85, attack: 0.004, decay: 1.0, sustain: 0.05, release: 0.4 },
  { id: 11, name: 'Vibraphone', category: 'Chromatic', family: 'Percussion', waveform: 'fm_bell', brightness: 0.75, attack: 0.01, decay: 2.2, sustain: 0.3, release: 0.8 },
  { id: 12, name: 'Marimba', category: 'Chromatic', family: 'Percussion', waveform: 'triangle', brightness: 0.6, attack: 0.005, decay: 0.8, sustain: 0.05, release: 0.2 },
  { id: 13, name: 'Xylophone', category: 'Chromatic', family: 'Percussion', waveform: 'triangle', brightness: 0.85, attack: 0.003, decay: 0.5, sustain: 0.04, release: 0.15 },
  { id: 14, name: 'Tubular Bells', category: 'Chromatic', family: 'Percussion', waveform: 'fm_bell', brightness: 0.9, attack: 0.005, decay: 3.5, sustain: 0.2, release: 1.2 },
  { id: 15, name: 'Dulcimer', category: 'Chromatic', family: 'Percussion', waveform: 'pluck', brightness: 0.8, attack: 0.005, decay: 1.2, sustain: 0.1, release: 0.3 },

  // 17-24 Organ
  { id: 16, name: 'Drawbar Organ', category: 'Organ', family: 'Organ', waveform: 'organ', brightness: 0.8, attack: 0.015, decay: 0.1, sustain: 0.95, release: 0.08 },
  { id: 17, name: 'Percussive Organ', category: 'Organ', family: 'Organ', waveform: 'organ', brightness: 0.85, attack: 0.005, decay: 0.4, sustain: 0.8, release: 0.1 },
  { id: 18, name: 'Rock Organ', category: 'Organ', family: 'Organ', waveform: 'organ', brightness: 0.95, attack: 0.01, decay: 0.1, sustain: 0.98, release: 0.1, harmonicDetune: 4 },
  { id: 19, name: 'Church Organ', category: 'Organ', family: 'Organ', waveform: 'organ', brightness: 0.7, attack: 0.06, decay: 0.2, sustain: 0.9, release: 0.4 },
  { id: 20, name: 'Reed Organ', category: 'Organ', family: 'Organ', waveform: 'square', brightness: 0.65, attack: 0.04, decay: 0.2, sustain: 0.85, release: 0.2 },
  { id: 21, name: 'Accordion', category: 'Organ', family: 'Organ', waveform: 'sawtooth', brightness: 0.7, attack: 0.04, decay: 0.1, sustain: 0.9, release: 0.15, harmonicDetune: 6 },
  { id: 22, name: 'Harmonica', category: 'Organ', family: 'Organ', waveform: 'sawtooth', brightness: 0.78, attack: 0.03, decay: 0.1, sustain: 0.85, release: 0.18 },
  { id: 23, name: 'Tango Accordion', category: 'Organ', family: 'Organ', waveform: 'sawtooth', brightness: 0.75, attack: 0.03, decay: 0.1, sustain: 0.88, release: 0.15, harmonicDetune: 5 },

  // 25-32 Guitar
  { id: 24, name: 'Nylon Guitar', category: 'Guitar', family: 'Guitar', waveform: 'pluck', brightness: 0.7, attack: 0.008, decay: 1.4, sustain: 0.15, release: 0.35 },
  { id: 25, name: 'Steel Guitar', category: 'Guitar', family: 'Guitar', waveform: 'pluck', brightness: 0.9, attack: 0.005, decay: 1.8, sustain: 0.2, release: 0.4 },
  { id: 26, name: 'Jazz Electric', category: 'Guitar', family: 'Guitar', waveform: 'fm_ep', brightness: 0.55, attack: 0.01, decay: 1.5, sustain: 0.35, release: 0.4 },
  { id: 27, name: 'Clean Electric', category: 'Guitar', family: 'Guitar', waveform: 'pluck', brightness: 0.8, attack: 0.006, decay: 1.6, sustain: 0.3, release: 0.45 },
  { id: 28, name: 'Muted Electric', category: 'Guitar', family: 'Guitar', waveform: 'triangle', brightness: 0.5, attack: 0.004, decay: 0.35, sustain: 0.02, release: 0.1 },
  { id: 29, name: 'Overdriven Guitar', category: 'Guitar', family: 'Guitar', waveform: 'sawtooth', brightness: 0.9, attack: 0.008, decay: 0.8, sustain: 0.7, release: 0.3, harmonicDetune: 4 },
  { id: 30, name: 'Distortion Guitar', category: 'Guitar', family: 'Guitar', waveform: 'sawtooth', brightness: 0.98, attack: 0.005, decay: 0.6, sustain: 0.8, release: 0.35, harmonicDetune: 7 },
  { id: 31, name: 'Guitar Harmonics', category: 'Guitar', family: 'Guitar', waveform: 'fm_bell', brightness: 0.85, attack: 0.005, decay: 2.0, sustain: 0.2, release: 0.6 },

  // 33-40 Bass
  { id: 32, name: 'Acoustic Bass', category: 'Bass', family: 'Bass', waveform: 'triangle', brightness: 0.45, attack: 0.01, decay: 1.2, sustain: 0.25, release: 0.3, subOsc: 0.4 },
  { id: 33, name: 'Finger Bass', category: 'Bass', family: 'Bass', waveform: 'triangle', brightness: 0.55, attack: 0.008, decay: 1.1, sustain: 0.35, release: 0.25, subOsc: 0.3 },
  { id: 34, name: 'Picked Bass', category: 'Bass', family: 'Bass', waveform: 'sawtooth', brightness: 0.7, attack: 0.005, decay: 1.0, sustain: 0.3, release: 0.25 },
  { id: 35, name: 'Fretless Bass', category: 'Bass', family: 'Bass', waveform: 'triangle', brightness: 0.6, attack: 0.02, decay: 1.3, sustain: 0.4, release: 0.35, modulationIndex: 1.5 },
  { id: 36, name: 'Slap Bass 1', category: 'Bass', family: 'Bass', waveform: 'sawtooth', brightness: 0.85, attack: 0.003, decay: 0.7, sustain: 0.2, release: 0.2 },
  { id: 37, name: 'Slap Bass 2', category: 'Bass', family: 'Bass', waveform: 'square', brightness: 0.9, attack: 0.003, decay: 0.6, sustain: 0.15, release: 0.2 },
  { id: 38, name: 'Synth Bass 1', category: 'Bass', family: 'Bass', waveform: 'sawtooth', brightness: 0.75, attack: 0.005, decay: 0.8, sustain: 0.4, release: 0.25, subOsc: 0.5 },
  { id: 39, name: 'Synth Bass 2 (Acid)', category: 'Bass', family: 'Bass', waveform: 'square', brightness: 0.85, attack: 0.004, decay: 0.5, sustain: 0.2, release: 0.15, subOsc: 0.6 },

  // 41-48 Strings
  { id: 40, name: 'Violin', category: 'Strings', family: 'Strings', waveform: 'strings', brightness: 0.75, attack: 0.08, decay: 0.3, sustain: 0.85, release: 0.4 },
  { id: 41, name: 'Viola', category: 'Strings', family: 'Strings', waveform: 'strings', brightness: 0.7, attack: 0.1, decay: 0.3, sustain: 0.85, release: 0.45 },
  { id: 42, name: 'Cello', category: 'Strings', family: 'Strings', waveform: 'strings', brightness: 0.65, attack: 0.12, decay: 0.3, sustain: 0.88, release: 0.5 },
  { id: 43, name: 'Contrabass', category: 'Strings', family: 'Strings', waveform: 'strings', brightness: 0.5, attack: 0.15, decay: 0.4, sustain: 0.85, release: 0.5 },
  { id: 44, name: 'Tremolo Strings', category: 'Strings', family: 'Strings', waveform: 'strings', brightness: 0.8, attack: 0.06, decay: 0.2, sustain: 0.9, release: 0.4, harmonicDetune: 8 },
  { id: 45, name: 'Pizzicato Strings', category: 'Strings', family: 'Strings', waveform: 'pluck', brightness: 0.75, attack: 0.003, decay: 0.4, sustain: 0.02, release: 0.15 },
  { id: 46, name: 'Orchestral Harp', category: 'Strings', family: 'Strings', waveform: 'pluck', brightness: 0.8, attack: 0.006, decay: 2.2, sustain: 0.15, release: 0.7 },
  { id: 47, name: 'Timpani', category: 'Strings', family: 'Strings', waveform: 'triangle', brightness: 0.6, attack: 0.01, decay: 1.8, sustain: 0.1, release: 0.6, subOsc: 0.6 },

  // 49-56 Ensemble
  { id: 48, name: 'String Ensemble 1', category: 'Ensemble', family: 'Ensemble', waveform: 'strings', brightness: 0.75, attack: 0.12, decay: 0.4, sustain: 0.92, release: 0.65, harmonicDetune: 5 },
  { id: 49, name: 'String Ensemble 2', category: 'Ensemble', family: 'Ensemble', waveform: 'strings', brightness: 0.65, attack: 0.18, decay: 0.5, sustain: 0.9, release: 0.75 },
  { id: 50, name: 'Synth Strings 1', category: 'Ensemble', family: 'Ensemble', waveform: 'sawtooth', brightness: 0.8, attack: 0.15, decay: 0.4, sustain: 0.88, release: 0.7, harmonicDetune: 6 },
  { id: 51, name: 'Synth Strings 2', category: 'Ensemble', family: 'Ensemble', waveform: 'sawtooth', brightness: 0.7, attack: 0.2, decay: 0.5, sustain: 0.85, release: 0.8 },
  { id: 52, name: 'Choir Aahs', category: 'Ensemble', family: 'Voice', waveform: 'pad', brightness: 0.65, attack: 0.2, decay: 0.5, sustain: 0.9, release: 0.8 },
  { id: 53, name: 'Voice Oohs', category: 'Ensemble', family: 'Voice', waveform: 'sine', brightness: 0.5, attack: 0.22, decay: 0.4, sustain: 0.88, release: 0.7 },
  { id: 54, name: 'Synth Voice', category: 'Ensemble', family: 'Voice', waveform: 'pad', brightness: 0.75, attack: 0.15, decay: 0.4, sustain: 0.85, release: 0.6 },
  { id: 55, name: 'Orchestra Hit', category: 'Ensemble', family: 'Ensemble', waveform: 'brass', brightness: 0.95, attack: 0.005, decay: 0.6, sustain: 0.3, release: 0.4 },

  // 57-64 Brass
  { id: 56, name: 'Trumpet', category: 'Brass', family: 'Brass', waveform: 'brass', brightness: 0.9, attack: 0.02, decay: 0.3, sustain: 0.8, release: 0.2 },
  { id: 57, name: 'Trombone', category: 'Brass', family: 'Brass', waveform: 'brass', brightness: 0.78, attack: 0.04, decay: 0.3, sustain: 0.82, release: 0.25 },
  { id: 58, name: 'Tuba', category: 'Brass', family: 'Brass', waveform: 'brass', brightness: 0.6, attack: 0.06, decay: 0.4, sustain: 0.85, release: 0.3, subOsc: 0.4 },
  { id: 59, name: 'Muted Trumpet', category: 'Brass', family: 'Brass', waveform: 'brass', brightness: 0.65, attack: 0.02, decay: 0.2, sustain: 0.75, release: 0.15 },
  { id: 60, name: 'French Horn', category: 'Brass', family: 'Brass', waveform: 'brass', brightness: 0.72, attack: 0.08, decay: 0.4, sustain: 0.86, release: 0.35 },
  { id: 61, name: 'Brass Section', category: 'Brass', family: 'Brass', waveform: 'brass', brightness: 0.85, attack: 0.04, decay: 0.3, sustain: 0.88, release: 0.3, harmonicDetune: 4 },
  { id: 62, name: 'Synth Brass 1', category: 'Brass', family: 'Brass', waveform: 'sawtooth', brightness: 0.85, attack: 0.03, decay: 0.4, sustain: 0.75, release: 0.3, harmonicDetune: 6 },
  { id: 63, name: 'Synth Brass 2', category: 'Brass', family: 'Brass', waveform: 'sawtooth', brightness: 0.78, attack: 0.05, decay: 0.5, sustain: 0.78, release: 0.35 },

  // 65-72 Reed
  { id: 64, name: 'Soprano Sax', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.82, attack: 0.03, decay: 0.2, sustain: 0.8, release: 0.2 },
  { id: 65, name: 'Alto Sax', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.78, attack: 0.035, decay: 0.25, sustain: 0.82, release: 0.22 },
  { id: 66, name: 'Tenor Sax', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.75, attack: 0.04, decay: 0.3, sustain: 0.84, release: 0.25 },
  { id: 67, name: 'Baritone Sax', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.68, attack: 0.05, decay: 0.35, sustain: 0.85, release: 0.28 },
  { id: 68, name: 'Oboe', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.8, attack: 0.04, decay: 0.2, sustain: 0.85, release: 0.2 },
  { id: 69, name: 'English Horn', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.7, attack: 0.05, decay: 0.25, sustain: 0.85, release: 0.22 },
  { id: 70, name: 'Bassoon', category: 'Reed', family: 'Reed', waveform: 'reed', brightness: 0.65, attack: 0.06, decay: 0.3, sustain: 0.86, release: 0.25 },
  { id: 71, name: 'Clarinet', category: 'Reed', family: 'Reed', waveform: 'square', brightness: 0.72, attack: 0.04, decay: 0.2, sustain: 0.88, release: 0.2 },

  // 73-80 Pipe
  { id: 72, name: 'Piccolo', category: 'Pipe', family: 'Pipe', waveform: 'sine', brightness: 0.95, attack: 0.03, decay: 0.2, sustain: 0.88, release: 0.2 },
  { id: 73, name: 'Flute', category: 'Pipe', family: 'Pipe', waveform: 'sine', brightness: 0.8, attack: 0.05, decay: 0.2, sustain: 0.85, release: 0.25 },
  { id: 74, name: 'Recorder', category: 'Pipe', family: 'Pipe', waveform: 'triangle', brightness: 0.75, attack: 0.03, decay: 0.15, sustain: 0.86, release: 0.18 },
  { id: 75, name: 'Pan Flute', category: 'Pipe', family: 'Pipe', waveform: 'sine', brightness: 0.7, attack: 0.06, decay: 0.2, sustain: 0.85, release: 0.3 },
  { id: 76, name: 'Blown Bottle', category: 'Pipe', family: 'Pipe', waveform: 'sine', brightness: 0.55, attack: 0.08, decay: 0.3, sustain: 0.8, release: 0.4 },
  { id: 77, name: 'Shakuhachi', category: 'Pipe', family: 'Pipe', waveform: 'triangle', brightness: 0.65, attack: 0.08, decay: 0.25, sustain: 0.82, release: 0.35 },
  { id: 78, name: 'Whistle', category: 'Pipe', family: 'Pipe', waveform: 'sine', brightness: 0.9, attack: 0.02, decay: 0.1, sustain: 0.9, release: 0.15 },
  { id: 79, name: 'Ocarina', category: 'Pipe', family: 'Pipe', waveform: 'sine', brightness: 0.65, attack: 0.05, decay: 0.2, sustain: 0.85, release: 0.25 },

  // 81-88 Synth Lead
  { id: 80, name: 'Lead 1 (Square)', category: 'Synth Lead', family: 'Lead', waveform: 'square', brightness: 0.85, attack: 0.005, decay: 0.3, sustain: 0.8, release: 0.2, subOsc: 0.2 },
  { id: 81, name: 'Lead 2 (Sawtooth)', category: 'Synth Lead', family: 'Lead', waveform: 'sawtooth', brightness: 0.92, attack: 0.005, decay: 0.3, sustain: 0.85, release: 0.25, harmonicDetune: 4 },
  { id: 82, name: 'Lead 3 (Calliope)', category: 'Synth Lead', family: 'Lead', waveform: 'triangle', brightness: 0.78, attack: 0.01, decay: 0.3, sustain: 0.75, release: 0.3 },
  { id: 83, name: 'Lead 4 (Chiff)', category: 'Synth Lead', family: 'Lead', waveform: 'fm_ep', brightness: 0.88, attack: 0.008, decay: 0.4, sustain: 0.7, release: 0.3 },
  { id: 84, name: 'Lead 5 (Charang)', category: 'Synth Lead', family: 'Lead', waveform: 'sawtooth', brightness: 0.9, attack: 0.004, decay: 0.3, sustain: 0.8, release: 0.2, harmonicDetune: 7 },
  { id: 85, name: 'Lead 6 (Voice)', category: 'Synth Lead', family: 'Lead', waveform: 'pad', brightness: 0.75, attack: 0.04, decay: 0.4, sustain: 0.85, release: 0.4 },
  { id: 86, name: 'Lead 7 (Fifths)', category: 'Synth Lead', family: 'Lead', waveform: 'sawtooth', brightness: 0.88, attack: 0.006, decay: 0.3, sustain: 0.82, release: 0.25, harmonicDetune: 7 },
  { id: 87, name: 'Lead 8 (Bass+Lead)', category: 'Synth Lead', family: 'Lead', waveform: 'sawtooth', brightness: 0.9, attack: 0.005, decay: 0.3, sustain: 0.85, release: 0.25, subOsc: 0.7 },

  // 89-96 Synth Pad
  { id: 88, name: 'Pad 1 (New Age)', category: 'Synth Pad', family: 'Pad', waveform: 'pad', brightness: 0.7, attack: 0.25, decay: 0.8, sustain: 0.9, release: 1.0, harmonicDetune: 4 },
  { id: 89, name: 'Pad 2 (Warm)', category: 'Synth Pad', family: 'Pad', waveform: 'sawtooth', brightness: 0.55, attack: 0.3, decay: 0.9, sustain: 0.92, release: 1.2, harmonicDetune: 5 },
  { id: 90, name: 'Pad 3 (Polysynth)', category: 'Synth Pad', family: 'Pad', waveform: 'sawtooth', brightness: 0.75, attack: 0.15, decay: 0.7, sustain: 0.88, release: 0.9, harmonicDetune: 6 },
  { id: 91, name: 'Pad 4 (Choir)', category: 'Synth Pad', family: 'Pad', waveform: 'pad', brightness: 0.6, attack: 0.28, decay: 0.8, sustain: 0.9, release: 1.1 },
  { id: 92, name: 'Pad 5 (Bowed)', category: 'Synth Pad', family: 'Pad', waveform: 'strings', brightness: 0.65, attack: 0.2, decay: 0.7, sustain: 0.85, release: 0.8 },
  { id: 93, name: 'Pad 6 (Metallic)', category: 'Synth Pad', family: 'Pad', waveform: 'fm_bell', brightness: 0.8, attack: 0.12, decay: 1.0, sustain: 0.8, release: 0.9 },
  { id: 94, name: 'Pad 7 (Halo)', category: 'Synth Pad', family: 'Pad', waveform: 'sine', brightness: 0.65, attack: 0.35, decay: 1.0, sustain: 0.9, release: 1.3 },
  { id: 95, name: 'Pad 8 (Sweep)', category: 'Synth Pad', family: 'Pad', waveform: 'sawtooth', brightness: 0.8, attack: 0.4, decay: 1.2, sustain: 0.88, release: 1.2, harmonicDetune: 8 },

  // 97-104 Synth Effects
  { id: 96, name: 'FX 1 (Rain)', category: 'Synth FX', family: 'FX', waveform: 'sfx', brightness: 0.7, attack: 0.05, decay: 1.5, sustain: 0.5, release: 0.8 },
  { id: 97, name: 'FX 2 (Soundtrack)', category: 'Synth FX', family: 'FX', waveform: 'pad', brightness: 0.65, attack: 0.25, decay: 1.2, sustain: 0.85, release: 1.2 },
  { id: 98, name: 'FX 3 (Crystal)', category: 'Synth FX', family: 'FX', waveform: 'fm_bell', brightness: 0.9, attack: 0.01, decay: 2.0, sustain: 0.4, release: 0.9 },
  { id: 99, name: 'FX 4 (Atmosphere)', category: 'Synth FX', family: 'FX', waveform: 'pad', brightness: 0.6, attack: 0.3, decay: 1.5, sustain: 0.9, release: 1.5 },
  { id: 100, name: 'FX 5 (Brightness)', category: 'Synth FX', family: 'FX', waveform: 'fm_bell', brightness: 0.95, attack: 0.02, decay: 1.8, sustain: 0.6, release: 1.0 },
  { id: 101, name: 'FX 6 (Goblins)', category: 'Synth FX', family: 'FX', waveform: 'sfx', brightness: 0.75, attack: 0.1, decay: 1.0, sustain: 0.7, release: 0.8 },
  { id: 102, name: 'FX 7 (Echoes)', category: 'Synth FX', family: 'FX', waveform: 'fm_ep', brightness: 0.7, attack: 0.05, decay: 2.5, sustain: 0.5, release: 1.2 },
  { id: 103, name: 'FX 8 (Sci-Fi)', category: 'Synth FX', family: 'FX', waveform: 'sfx', brightness: 0.88, attack: 0.05, decay: 1.2, sustain: 0.7, release: 0.9 },

  // 105-112 Ethnic
  { id: 104, name: 'Sitar', category: 'Ethnic', family: 'Ethnic', waveform: 'pluck', brightness: 0.88, attack: 0.005, decay: 1.5, sustain: 0.2, release: 0.5, harmonicDetune: 9 },
  { id: 105, name: 'Banjo', category: 'Ethnic', family: 'Ethnic', waveform: 'pluck', brightness: 0.92, attack: 0.003, decay: 0.8, sustain: 0.05, release: 0.2 },
  { id: 106, name: 'Shamisen', category: 'Ethnic', family: 'Ethnic', waveform: 'pluck', brightness: 0.85, attack: 0.004, decay: 0.9, sustain: 0.08, release: 0.25 },
  { id: 107, name: 'Koto', category: 'Ethnic', family: 'Ethnic', waveform: 'pluck', brightness: 0.8, attack: 0.005, decay: 1.2, sustain: 0.1, release: 0.35 },
  { id: 108, name: 'Kalimba', category: 'Ethnic', family: 'Ethnic', waveform: 'fm_bell', brightness: 0.75, attack: 0.004, decay: 1.0, sustain: 0.08, release: 0.4 },
  { id: 109, name: 'Bagpipe', category: 'Ethnic', family: 'Ethnic', waveform: 'sawtooth', brightness: 0.85, attack: 0.08, decay: 0.2, sustain: 0.92, release: 0.3, subOsc: 0.5 },
  { id: 110, name: 'Fiddle', category: 'Ethnic', family: 'Ethnic', waveform: 'strings', brightness: 0.8, attack: 0.05, decay: 0.3, sustain: 0.85, release: 0.3 },
  { id: 111, name: 'Shanai', category: 'Ethnic', family: 'Ethnic', waveform: 'reed', brightness: 0.82, attack: 0.04, decay: 0.25, sustain: 0.86, release: 0.25 },

  // 113-120 Percussive
  { id: 112, name: 'Tinkle Bell', category: 'Percussive', family: 'Percussive', waveform: 'fm_bell', brightness: 0.95, attack: 0.002, decay: 1.0, sustain: 0.05, release: 0.5 },
  { id: 113, name: 'Agogo', category: 'Percussive', family: 'Percussive', waveform: 'triangle', brightness: 0.7, attack: 0.004, decay: 0.4, sustain: 0.02, release: 0.15 },
  { id: 114, name: 'Steel Drums', category: 'Percussive', family: 'Percussive', waveform: 'fm_bell', brightness: 0.82, attack: 0.006, decay: 1.4, sustain: 0.25, release: 0.6 },
  { id: 115, name: 'Woodblock', category: 'Percussive', family: 'Percussive', waveform: 'triangle', brightness: 0.65, attack: 0.002, decay: 0.15, sustain: 0.01, release: 0.08 },
  { id: 116, name: 'Taiko Drum', category: 'Percussive', family: 'Percussive', waveform: 'triangle', brightness: 0.55, attack: 0.008, decay: 1.2, sustain: 0.05, release: 0.4, subOsc: 0.6 },
  { id: 117, name: 'Melodic Tom', category: 'Percussive', family: 'Percussive', waveform: 'sine', brightness: 0.6, attack: 0.005, decay: 0.8, sustain: 0.05, release: 0.3, subOsc: 0.4 },
  { id: 118, name: 'Synth Drum', category: 'Percussive', family: 'Percussive', waveform: 'square', brightness: 0.8, attack: 0.003, decay: 0.6, sustain: 0.08, release: 0.2, subOsc: 0.5 },
  { id: 119, name: 'Reverse Cymbal', category: 'Percussive', family: 'Percussive', waveform: 'sfx', brightness: 0.9, attack: 0.8, decay: 0.1, sustain: 0.8, release: 0.2 },

  // 121-128 Sound Effects
  { id: 120, name: 'Fret Noise', category: 'SFX', family: 'SFX', waveform: 'sfx', brightness: 0.6, attack: 0.01, decay: 0.2, sustain: 0.05, release: 0.1 },
  { id: 121, name: 'Breath Noise', category: 'SFX', family: 'SFX', waveform: 'sfx', brightness: 0.5, attack: 0.1, decay: 0.5, sustain: 0.3, release: 0.3 },
  { id: 122, name: 'Seashore', category: 'SFX', family: 'SFX', waveform: 'sfx', brightness: 0.4, attack: 0.5, decay: 1.5, sustain: 0.6, release: 1.5 },
  { id: 123, name: 'Bird Tweet', category: 'SFX', family: 'SFX', waveform: 'sine', brightness: 0.95, attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 },
  { id: 124, name: 'Telephone Ring', category: 'SFX', family: 'SFX', waveform: 'square', brightness: 0.8, attack: 0.02, decay: 0.4, sustain: 0.6, release: 0.2 },
  { id: 125, name: 'Helicopter', category: 'SFX', family: 'SFX', waveform: 'sfx', brightness: 0.7, attack: 0.05, decay: 1.0, sustain: 0.8, release: 0.5 },
  { id: 126, name: 'Applause', category: 'SFX', family: 'SFX', waveform: 'sfx', brightness: 0.75, attack: 0.2, decay: 1.2, sustain: 0.7, release: 1.0 },
  { id: 127, name: 'Gunshot', category: 'SFX', family: 'SFX', waveform: 'sfx', brightness: 0.95, attack: 0.002, decay: 0.8, sustain: 0.05, release: 0.4 }
];

// Helper to construct Pad sounds
function createStandardPads(pitchMultiplier = 1.0): { padsA: DrumPadSound[]; padsB: DrumPadSound[] } {
  const padsA: DrumPadSound[] = [
    { padNumber: 1, name: 'Kick', noteNumber: 36, type: 'kick', pitchMultiplier },
    { padNumber: 2, name: 'Snare', noteNumber: 38, type: 'snare', pitchMultiplier },
    { padNumber: 3, name: 'Clap', noteNumber: 39, type: 'clap', pitchMultiplier },
    { padNumber: 4, name: 'Closed HH', noteNumber: 42, type: 'closed_hh', pitchMultiplier },
    { padNumber: 5, name: 'Open HH', noteNumber: 46, type: 'open_hh', pitchMultiplier },
    { padNumber: 6, name: 'Low Tom', noteNumber: 41, type: 'tom_low', pitchMultiplier },
    { padNumber: 7, name: 'Mid Tom', noteNumber: 47, type: 'tom_mid', pitchMultiplier },
    { padNumber: 8, name: 'High Tom', noteNumber: 50, type: 'tom_high', pitchMultiplier },
  ];

  const padsB: DrumPadSound[] = [
    { padNumber: 9, name: 'Crash', noteNumber: 49, type: 'crash', pitchMultiplier },
    { padNumber: 10, name: 'Ride', noteNumber: 51, type: 'ride', pitchMultiplier },
    { padNumber: 11, name: 'Rimshot', noteNumber: 37, type: 'rimshot', pitchMultiplier },
    { padNumber: 12, name: 'Tambourine', noteNumber: 54, type: 'percussion', pitchMultiplier },
    { padNumber: 13, name: 'Cowbell', noteNumber: 56, type: 'percussion', pitchMultiplier },
    { padNumber: 14, name: 'Claves', noteNumber: 75, type: 'percussion', pitchMultiplier },
    { padNumber: 15, name: 'Conga Hi', noteNumber: 62, type: 'tom_high', pitchMultiplier },
    { padNumber: 16, name: 'Conga Low', noteNumber: 64, type: 'tom_low', pitchMultiplier },
  ];

  return { padsA, padsB };
}

export const DRUM_KITS: DrumKit[] = [
  {
    id: 0,
    name: '01: Standard Kit',
    style: 'Acoustic / GM Standard',
    pitch: 0,
    snappy: 0.8,
    sub: 0.7,
    ...createStandardPads(1.0)
  },
  {
    id: 1,
    name: '02: Room Kit',
    style: 'Dynamic Studio Reverb',
    pitch: -1,
    snappy: 0.9,
    sub: 0.85,
    ...createStandardPads(0.95)
  },
  {
    id: 2,
    name: '03: Power Rock',
    style: 'Punchy Heavy Rock',
    pitch: -2,
    snappy: 1.1,
    sub: 1.0,
    ...createStandardPads(0.9)
  },
  {
    id: 3,
    name: '04: Electronic 808',
    style: 'Deep Sub Trap / Hip-Hop',
    pitch: -3,
    snappy: 0.7,
    sub: 1.4,
    ...createStandardPads(0.85)
  },
  {
    id: 4,
    name: '05: Classic 909',
    style: 'House / Techno Punch',
    pitch: 1,
    snappy: 1.2,
    sub: 0.9,
    ...createStandardPads(1.05)
  },
  {
    id: 5,
    name: '06: Synth Beatbox',
    style: 'Electro / Synthwave',
    pitch: 2,
    snappy: 1.0,
    sub: 1.1,
    ...createStandardPads(1.1)
  },
  {
    id: 6,
    name: '07: Jazz Club',
    style: 'Warm Vintage Acoustic',
    pitch: 2,
    snappy: 0.6,
    sub: 0.6,
    ...createStandardPads(1.15)
  },
  {
    id: 7,
    name: '08: Brush Kit',
    style: 'Soft Swirl / Ballad',
    pitch: 3,
    snappy: 0.5,
    sub: 0.5,
    ...createStandardPads(1.2)
  },
  {
    id: 8,
    name: '09: Orchestral',
    style: 'Concert Bass & Cymbals',
    pitch: -4,
    snappy: 0.7,
    sub: 1.2,
    ...createStandardPads(0.8)
  },
  {
    id: 9,
    name: '10: SFX Cyber Kit',
    style: 'Industrial Glitch',
    pitch: 4,
    snappy: 1.3,
    sub: 1.2,
    ...createStandardPads(1.3)
  }
];
