/**
 * Studio Synth Workstation - Scale & Chord Engine
 * Provides smart scale quantization and one-touch polyphonic chord generation.
 */

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

// Semitone intervals relative to root (C = 0)
export const SCALE_INTERVALS: Record<MusicalScale, number[]> = {
  CHROMATIC: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  NATURAL_MINOR: [0, 2, 3, 5, 7, 8, 10],
  DORIAN: [0, 2, 3, 5, 7, 9, 10],
  PENTATONIC_MAJOR: [0, 2, 4, 7, 9],
  PENTATONIC_MINOR: [0, 3, 5, 7, 10],
  BLUES: [0, 3, 5, 6, 7, 10],
  HIRAJOSHI: [0, 2, 3, 7, 8],
};

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function isNoteInScale(midiNote: number, rootIndex: number, scale: MusicalScale): boolean {
  if (scale === 'CHROMATIC') return true;
  const pitchClass = (midiNote - rootIndex + 1200) % 12;
  return SCALE_INTERVALS[scale].includes(pitchClass);
}

export function quantizeToScale(midiNote: number, rootIndex: number, scale: MusicalScale): number {
  if (scale === 'CHROMATIC') return midiNote;
  const intervals = SCALE_INTERVALS[scale];
  const octave = Math.floor(midiNote / 12);
  const pitchClass = (midiNote - rootIndex + 1200) % 12;

  if (intervals.includes(pitchClass)) return midiNote;

  // Find closest interval in scale
  let closest = intervals[0];
  let minDiff = 999;
  for (const interval of intervals) {
    const diff = Math.abs(pitchClass - interval);
    if (diff < minDiff) {
      minDiff = diff;
      closest = interval;
    }
  }

  return octave * 12 + rootIndex + closest;
}

export function generateChordNotes(rootMidi: number, chordType: ChordType, rootIndex: number, scale: MusicalScale): number[] {
  if (chordType === 'OFF') {
    return [rootMidi];
  }

  if (chordType === 'OCTAVE') {
    return [rootMidi, rootMidi + 12];
  }

  if (chordType === 'SUS4') {
    return [rootMidi, rootMidi + 5, rootMidi + 7];
  }

  // Diatonic scale chord builder if scale is not chromatic
  if (scale !== 'CHROMATIC') {
    const intervals = SCALE_INTERVALS[scale];
    const pitchClass = (rootMidi - rootIndex + 1200) % 12;
    const scaleDegree = intervals.indexOf(pitchClass);

    if (scaleDegree !== -1) {
      const getDegreeNote = (degreeOffset: number) => {
        const targetDegree = (scaleDegree + degreeOffset) % intervals.length;
        const octavesUp = Math.floor((scaleDegree + degreeOffset) / intervals.length);
        return Math.floor((rootMidi - pitchClass) / 12) * 12 + rootIndex + intervals[targetDegree] + octavesUp * 12;
      };

      if (chordType === 'TRIAD') {
        return [rootMidi, getDegreeNote(2), getDegreeNote(4)];
      }
      if (chordType === 'SEVENTH') {
        return [rootMidi, getDegreeNote(2), getDegreeNote(4), getDegreeNote(6)];
      }
      if (chordType === 'NINTH') {
        return [rootMidi, getDegreeNote(2), getDegreeNote(4), getDegreeNote(6), getDegreeNote(8)];
      }
    }
  }

  // Fallback default chromatic major/minor chord spacing
  switch (chordType) {
    case 'TRIAD':
      return [rootMidi, rootMidi + 4, rootMidi + 7];
    case 'SEVENTH':
      return [rootMidi, rootMidi + 4, rootMidi + 7, rootMidi + 11];
    case 'NINTH':
      return [rootMidi, rootMidi + 4, rootMidi + 7, rootMidi + 11, rootMidi + 14];
    default:
      return [rootMidi];
  }
}
