import { create } from 'zustand';
import { ArpSettings, ChordType, DrumKit, InstrumentPreset, KnobMode, MusicalScale, NoteRepeatSettings, OledDisplayState, PadBank, SynthParams, UserPreset } from '../types';
import { DRUM_KITS, GM_PRESETS } from '../audio/soundList';
import { AudioEngine } from '../audio/audioEngine';
import { ArpEngine } from '../audio/arpEngine';
import { generateChordNotes, quantizeToScale } from '../audio/scalesAndChords';
import { DEMO_TRACKS, DemoTrack } from '../audio/demoGrooves';

const USER_PRESETS_STORAGE_KEY = 'studio_play_mk3_user_presets';

function loadStoredUserPresets(): Record<number, UserPreset> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_PRESETS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignored
  }
  return {};
}

interface MpkState {
  // Preset & Sound State
  currentPresetId: number;
  currentPreset: InstrumentPreset;
  currentDrumKitId: number;
  currentDrumKit: DrumKit;
  selectedCategory: string;

  // Controls State
  padBank: PadBank;
  octaveShift: number; // -4 to +4
  transpose: number; // -12 to +12
  masterVolume: number; // 0 to 100
  speakerEmulation: boolean;
  fullLevel: boolean;
  knobMode: KnobMode; // 1 or 2

  // DSP & Synth parameters
  synthParams: SynthParams;

  // Performance Engine
  arpSettings: ArpSettings;
  noteRepeatSettings: NoteRepeatSettings;
  joystick: { x: number; y: number };

  // Scale & Chord Mode
  selectedScale: MusicalScale;
  scaleRoot: number; // 0=C, 1=C#, ..., 11=B
  scaleLock: boolean;
  chordType: ChordType;

  // Live Recording & Lossless WAV Export
  isRecording: boolean;
  recordingSeconds: number;
  hasRecording: boolean;
  isLooping: boolean;

  // Metronome & Demo Player
  metronomeEnabled: boolean;
  demoPlaying: boolean;
  currentDemoId: string | null;

  // User Presets
  userPresets: Record<number, UserPreset>;

  // Live note tracking
  activeNotes: number[];
  activePads: number[];
  activeArpNote: number | null;

  // OLED & Hardware feedback
  oled: OledDisplayState;
  connectedMidiDevices: string[];
  isAudioUnlocked: boolean;

  // Tap tempo tracking
  lastTapTime: number;

  // Actions
  unlockAudio: () => Promise<void>;
  setPreset: (id: number) => void;
  nextPreset: () => void;
  prevPreset: () => void;
  setDrumKit: (id: number) => void;
  nextDrumKit: () => void;
  prevDrumKit: () => void;
  setSelectedCategory: (cat: string) => void;
  setPadBank: (bank: PadBank) => void;
  octaveUp: () => void;
  octaveDown: () => void;
  transposeUp: () => void;
  transposeDown: () => void;
  toggleFullLevel: () => void;
  toggleKnobMode: () => void;
  setMasterVolume: (val: number) => void;
  toggleSpeakerEmulation: () => void;
  updateParam: (param: keyof SynthParams, value: number) => void;
  setJoystick: (x: number, y: number) => void;
  toggleArp: () => void;
  updateArp: (settings: Partial<ArpSettings>) => void;
  toggleNoteRepeat: () => void;
  updateNoteRepeat: (settings: Partial<NoteRepeatSettings>) => void;
  tapTempo: () => void;
  setOledMessage: (msg: Partial<OledDisplayState>) => void;
  setMidiDevices: (devices: string[]) => void;

  // Scales & Chords
  setScale: (scale: MusicalScale) => void;
  setScaleRoot: (root: number) => void;
  toggleScaleLock: () => void;
  setChordType: (chord: ChordType) => void;

  // Recording & WAV
  startRecording: () => void;
  stopRecording: () => void;
  toggleLoop: () => void;
  downloadWav: () => void;

  // Metronome & Demo
  toggleMetronome: () => void;
  startDemo: (trackId: string) => void;
  stopDemo: () => void;

  // User Presets Memory
  saveUserPreset: (slot: number, name?: string) => void;
  loadUserPreset: (slot: number) => void;

  // Note actions
  playNote: (midiNote: number, velocity?: number) => void;
  stopNote: (midiNote: number) => void;
  triggerPad: (padNumber: number, velocity?: number) => void;
  releasePad: (padNumber: number) => void;
  allNotesOff: () => void;
}

let arpIntervalTicker: number | null = null;
let recordInterval: number | null = null;
const activeKeyToChordsMap = new Map<number, number[]>();

export const useMpkStore = create<MpkState>((set, get) => {
  const audioEngine = AudioEngine.getInstance();
  const arpEngine = new ArpEngine(audioEngine);

  // Background ticker loop connecting ArpEngine to state
  if (typeof window !== 'undefined' && !arpIntervalTicker) {
    arpEngine.start();
    arpIntervalTicker = window.setInterval(() => {
      const state = get();
      arpEngine.tick(
        state.arpSettings,
        state.noteRepeatSettings,
        state.currentPreset,
        state.synthParams,
        (note) => {
          set({ activeArpNote: note });
        }
      );
    }, 20);
  }

  const initialPreset = GM_PRESETS[0]; // Acoustic Grand Piano
  const initialKit = DRUM_KITS[0]; // Standard Kit

  return {
    currentPresetId: 0,
    currentPreset: initialPreset,
    currentDrumKitId: 0,
    currentDrumKit: initialKit,
    selectedCategory: 'All',

    padBank: 'A',
    octaveShift: 0,
    transpose: 0,
    masterVolume: 85,
    speakerEmulation: false,
    fullLevel: false,
    knobMode: 1,

    synthParams: {
      filterCutoff: 110,
      filterResonance: 20,
      reverbAmount: 38,
      chorusAmount: 18,
      attack: 10,
      release: 30,
      eqLow: 64,
      eqHigh: 64,
    },

    arpSettings: {
      enabled: false,
      mode: 'UP',
      octaveRange: 1,
      division: '1/16',
      swing: 50,
      latch: false,
      bpm: 120,
    },

    noteRepeatSettings: {
      enabled: false,
      division: '1/16',
      bpm: 120,
    },

    joystick: { x: 0, y: 0 },
    activeNotes: [],
    activePads: [],
    activeArpNote: null,

    // Scales & Chords
    selectedScale: 'CHROMATIC',
    scaleRoot: 0,
    scaleLock: false,
    chordType: 'OFF',

    // Lossless Master Audio Recorder
    isRecording: false,
    recordingSeconds: 0,
    hasRecording: false,
    isLooping: false,

    // Metronome & Demo Player
    metronomeEnabled: false,
    demoPlaying: false,
    currentDemoId: null,

    // User Saved Presets
    userPresets: loadStoredUserPresets(),

    oled: {
      line1: '001:AcousticGrand',
      line2: 'OCT:0   BPM:120',
      statusBadge: 'READY',
    },

    connectedMidiDevices: [],
    isAudioUnlocked: false,
    lastTapTime: 0,

    unlockAudio: async () => {
      const ok = await audioEngine.unlockAudio();
      set({ isAudioUnlocked: ok });
      if (ok) {
        get().setOledMessage({
          line1: get().currentPreset.name,
          line2: `OCT:${get().octaveShift}   BPM:${get().arpSettings.bpm}`,
          statusBadge: 'ONLINE'
        });
      }
    },

    setPreset: (id: number) => {
      const preset = GM_PRESETS[id] || GM_PRESETS[0];
      set({
        currentPresetId: preset.id,
        currentPreset: preset,
        oled: {
          line1: `${String(preset.id + 1).padStart(3, '0')}:${preset.name}`,
          line2: `[${preset.category.toUpperCase()}] OCT:${get().octaveShift}`,
          statusBadge: 'PROG',
        }
      });
    },

    nextPreset: () => {
      const nextId = (get().currentPresetId + 1) % GM_PRESETS.length;
      get().setPreset(nextId);
    },

    prevPreset: () => {
      const prevId = (get().currentPresetId - 1 + GM_PRESETS.length) % GM_PRESETS.length;
      get().setPreset(prevId);
    },

    setDrumKit: (id: number) => {
      const kit = DRUM_KITS[id] || DRUM_KITS[0];
      set({
        currentDrumKitId: kit.id,
        currentDrumKit: kit,
        oled: {
          line1: `KIT ${String(kit.id + 1).padStart(2, '0')}:${kit.name.replace(/^\d+:\s*/, '')}`,
          line2: `${kit.style.slice(0, 16)}`,
          statusBadge: 'DRUM',
        }
      });
    },

    nextDrumKit: () => {
      const nextId = (get().currentDrumKitId + 1) % DRUM_KITS.length;
      get().setDrumKit(nextId);
    },

    prevDrumKit: () => {
      const prevId = (get().currentDrumKitId - 1 + DRUM_KITS.length) % DRUM_KITS.length;
      get().setDrumKit(prevId);
    },

    setSelectedCategory: (cat: string) => {
      set({ selectedCategory: cat });
      if (cat !== 'All') {
        const found = GM_PRESETS.find(p => p.category === cat);
        if (found) {
          get().setPreset(found.id);
        }
      }
    },

    setPadBank: (bank: PadBank) => {
      set({
        padBank: bank,
        oled: {
          line1: `PAD BANK: ${bank}`,
          line2: bank === 'A' ? 'PADS 1 - 8' : 'PADS 9 - 16',
          statusBadge: `BANK ${bank}`
        }
      });
    },

    octaveUp: () => {
      const current = get().octaveShift;
      if (current < 4) {
        const next = current + 1;
        set({
          octaveShift: next,
          oled: {
            line1: 'OCTAVE SHIFT',
            line2: `OCTAVE: ${next > 0 ? '+' : ''}${next}`,
            statusBadge: `OCT ${next >= 0 ? '+' : ''}${next}`
          }
        });
      }
    },

    octaveDown: () => {
      const current = get().octaveShift;
      if (current > -4) {
        const next = current - 1;
        set({
          octaveShift: next,
          oled: {
            line1: 'OCTAVE SHIFT',
            line2: `OCTAVE: ${next > 0 ? '+' : ''}${next}`,
            statusBadge: `OCT ${next >= 0 ? '+' : ''}${next}`
          }
        });
      }
    },

    transposeUp: () => {
      const current = get().transpose;
      if (current < 12) {
        set({ transpose: current + 1 });
      }
    },

    transposeDown: () => {
      const current = get().transpose;
      if (current > -12) {
        set({ transpose: current - 1 });
      }
    },

    toggleFullLevel: () => {
      const next = !get().fullLevel;
      set({
        fullLevel: next,
        oled: {
          line1: 'PAD VELOCITY',
          line2: next ? 'FULL LEVEL: ON (127)' : 'FULL LEVEL: OFF (DYN)',
          statusBadge: next ? 'FULL' : 'DYN'
        }
      });
    },

    toggleKnobMode: () => {
      const next = get().knobMode === 1 ? 2 : 1;
      set({
        knobMode: next,
        oled: {
          line1: next === 1 ? 'KNOB MODE 1' : 'KNOB MODE 2',
          line2: next === 1 ? 'FLT / RES / REV / CHO' : 'ATK / REL / LOW / HI',
          statusBadge: `KNOB ${next}`
        }
      });
    },

    setMasterVolume: (val: number) => {
      const clamped = Math.max(0, Math.min(100, val));
      set({ masterVolume: clamped });
      audioEngine.setMasterVolume(clamped);
      get().setOledMessage({
        line1: 'MASTER VOLUME',
        line2: `LEVEL: ${clamped}%`,
        paramName: 'VOLUME',
        paramValue: `${clamped}%`,
        paramBar: clamped,
        statusBadge: 'VOL'
      });
    },

    toggleSpeakerEmulation: () => {
      const next = !get().speakerEmulation;
      audioEngine.setSpeakerEmulation(next);
      set({ speakerEmulation: next });
      get().setOledMessage({
        line1: next ? 'SPEAKER: BUILT-IN' : 'OUTPUT: LINE OUT',
        line2: next ? '2.5" ACOUSTIC CONE' : 'DIRECT STEREO FLAT',
        statusBadge: next ? 'SPK' : 'LINE',
      });
    },

    updateParam: (param: keyof SynthParams, value: number) => {
      const clamped = Math.max(0, Math.min(127, Math.round(value)));
      const newParams = { ...get().synthParams, [param]: clamped };
      set({ synthParams: newParams });
      audioEngine.updateSynthParams(newParams);

      const paramNamesMap: Record<keyof SynthParams, string> = {
        filterCutoff: 'CUTOFF',
        filterResonance: 'RESONANCE',
        reverbAmount: 'REVERB',
        chorusAmount: 'CHORUS',
        attack: 'ATTACK',
        release: 'RELEASE',
        eqLow: 'EQ LOW',
        eqHigh: 'EQ HIGH'
      };

      const displayName = paramNamesMap[param] || String(param).toUpperCase();
      const pct = Math.round((clamped / 127) * 100);

      get().setOledMessage({
        line1: `${displayName}: ${clamped}`,
        line2: `[${'#'.repeat(Math.floor(pct / 10)).padEnd(10, '-')}] ${pct}%`,
        paramName: displayName,
        paramValue: clamped,
        paramBar: pct,
        statusBadge: 'EDIT'
      });
    },

    setJoystick: (x: number, y: number) => {
      set({ joystick: { x, y } });
      audioEngine.setJoystick(x, y);

      if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
        const bendSt = (x * 2).toFixed(1);
        const modPct = Math.round(Math.abs(y) * 100);
        get().setOledMessage({
          line1: `BEND: ${bendSt > '0' ? '+' : ''}${bendSt}st`,
          line2: y >= 0 ? `VIBRATO: ${modPct}%` : `FLT MOD: ${modPct}%`,
          statusBadge: 'JOY'
        });
      }
    },

    toggleArp: () => {
      const next = !get().arpSettings.enabled;
      const updated = { ...get().arpSettings, enabled: next };
      set({
        arpSettings: updated,
        oled: {
          line1: next ? 'ARPEGGIATOR: ON' : 'ARPEGGIATOR: OFF',
          line2: `${updated.mode} ${updated.division} ${updated.bpm}BPM`,
          statusBadge: next ? 'ARP ON' : 'ARP OFF'
        }
      });
    },

    updateArp: (settings: Partial<ArpSettings>) => {
      const updated = { ...get().arpSettings, ...settings };
      set({
        arpSettings: updated,
        oled: {
          line1: `ARP: ${updated.mode} ${updated.division}`,
          line2: `OCT:${updated.octaveRange} BPM:${updated.bpm} ${updated.latch ? 'LATCH' : ''}`,
          statusBadge: 'ARP'
        }
      });
    },

    toggleNoteRepeat: () => {
      const next = !get().noteRepeatSettings.enabled;
      const updated = { ...get().noteRepeatSettings, enabled: next };
      set({
        noteRepeatSettings: updated,
        oled: {
          line1: next ? 'NOTE REPEAT: ON' : 'NOTE REPEAT: OFF',
          line2: `DIV: ${updated.division}  ${updated.bpm} BPM`,
          statusBadge: next ? 'RPT ON' : 'RPT OFF'
        }
      });
    },

    updateNoteRepeat: (settings: Partial<NoteRepeatSettings>) => {
      const updated = { ...get().noteRepeatSettings, ...settings };
      set({
        noteRepeatSettings: updated,
        oled: {
          line1: `NOTE REPEAT: ${updated.division}`,
          line2: `${updated.bpm} BPM`,
          statusBadge: 'REPEAT'
        }
      });
    },

    tapTempo: () => {
      const now = performance.now();
      const last = get().lastTapTime;
      if (last > 0) {
        const delta = (now - last) / 1000;
        if (delta > 0.2 && delta < 2.0) {
          const calculatedBpm = Math.max(30, Math.min(280, Math.round(60 / delta)));
          get().updateArp({ bpm: calculatedBpm });
          get().updateNoteRepeat({ bpm: calculatedBpm });
          get().setOledMessage({
            line1: 'TAP TEMPO',
            line2: `BPM: ${calculatedBpm}`,
            paramName: 'BPM',
            paramValue: calculatedBpm,
            statusBadge: 'TAP'
          });
        }
      }
      set({ lastTapTime: now });
    },

    setOledMessage: (msg: Partial<OledDisplayState>) => {
      set(state => ({
        oled: { ...state.oled, ...msg }
      }));
    },

    setMidiDevices: (devices: string[]) => {
      set({
        connectedMidiDevices: devices,
        oled: {
          line1: devices.length > 0 ? `MIDI: ${devices[0].slice(0, 14)}` : 'NO MIDI DEVICE',
          line2: devices.length > 0 ? `${devices.length} DEVICE CONNECTED` : 'READY TO PLAY',
          statusBadge: devices.length > 0 ? 'MIDI OK' : 'LOCAL'
        }
      });
    },

    // Scale & Chord Modes
    setScale: (scale: MusicalScale) => {
      set({ selectedScale: scale });
      get().setOledMessage({
        line1: 'SCALE SELECT',
        line2: scale.replace('_', ' '),
        statusBadge: 'SCALE',
      });
    },

    setScaleRoot: (root: number) => {
      set({ scaleRoot: root });
    },

    toggleScaleLock: () => {
      const next = !get().scaleLock;
      set({ scaleLock: next });
      get().setOledMessage({
        line1: 'SCALE LOCK',
        line2: next ? `${get().selectedScale} ON` : 'CHROMATIC (OFF)',
        statusBadge: next ? 'SCALE' : 'NORM',
      });
    },

    setChordType: (chord: ChordType) => {
      set({ chordType: chord });
      get().setOledMessage({
        line1: 'CHORD ENGINE',
        line2: chord === 'OFF' ? 'SINGLE NOTES' : `CHORD: ${chord}`,
        statusBadge: chord === 'OFF' ? 'NORM' : 'CHORD',
      });
    },

    // Master Audio Recorder & Lossless WAV Export
    startRecording: () => {
      audioEngine.recorder.startRecording();
      set({ isRecording: true, recordingSeconds: 0, isLooping: false });
      if (recordInterval) clearInterval(recordInterval);
      recordInterval = window.setInterval(() => {
        const secs = Math.round(audioEngine.recorder.getElapsedTime() * 10) / 10;
        set({ recordingSeconds: secs });
      }, 100);

      get().setOledMessage({
        line1: '[REC] MASTER OUT',
        line2: 'RECORDING AUDIO...',
        statusBadge: 'REC',
      });
    },

    stopRecording: () => {
      if (recordInterval) {
        clearInterval(recordInterval);
        recordInterval = null;
      }
      const blob = audioEngine.recorder.stopRecording();
      set({ isRecording: false, hasRecording: blob !== null });
      get().setOledMessage({
        line1: 'RECORDING SAVED',
        line2: 'READY TO EXPORT/LOOP',
        statusBadge: 'SAVED',
      });
    },

    toggleLoop: () => {
      const looping = audioEngine.recorder.toggleLoop(() => set({ isLooping: false }));
      set({ isLooping: looping });
      get().setOledMessage({
        line1: 'LOOP PLAYBACK',
        line2: looping ? 'PLAYING LOOP...' : 'LOOP STOPPED',
        statusBadge: looping ? 'LOOP' : 'STOP',
      });
    },

    downloadWav: () => {
      audioEngine.recorder.downloadWav(`studio-play-${Date.now()}.wav`);
      get().setOledMessage({
        line1: 'EXPORT LOSSLESS WAV',
        line2: '16-BIT 44.1KHZ STEREO',
        statusBadge: 'EXPORT',
      });
    },

    // Metronome & Demo Player
    toggleMetronome: () => {
      audioEngine.metronome.setBpm(get().arpSettings.bpm);
      const active = audioEngine.metronome.toggle();
      set({ metronomeEnabled: active });
      get().setOledMessage({
        line1: 'METRONOME CLICK',
        line2: active ? `${get().arpSettings.bpm} BPM [ACTIVE]` : 'CLICK MUTED',
        statusBadge: active ? 'CLICK' : 'OFF',
      });
    },

    startDemo: (trackId: string) => {
      const track = DEMO_TRACKS.find((t) => t.id === trackId) || DEMO_TRACKS[0];
      set({ currentDemoId: trackId, demoPlaying: true });
      audioEngine.demoPlayer.start(track, (step, t) => {
        set({
          oled: {
            line1: `DEMO: ${t.title.toUpperCase()}`,
            line2: `BAR:${Math.floor(step / 16) + 1} BEAT:${Math.floor((step % 16) / 4) + 1} [${t.bpm} BPM]`,
            statusBadge: 'DEMO',
          },
        });
      });
    },

    stopDemo: () => {
      audioEngine.demoPlayer.stop();
      set({ demoPlaying: false, currentDemoId: null });
      get().setOledMessage({
        line1: get().currentPreset.name,
        line2: `OCT:${get().octaveShift}   BPM:${get().arpSettings.bpm}`,
        statusBadge: 'READY',
      });
    },

    // User Presets
    saveUserPreset: (slot: number, name?: string) => {
      const state = get();
      const newPreset: UserPreset = {
        slot,
        name: name || `USER PRESET ${slot}`,
        presetId: state.currentPresetId,
        params: { ...state.synthParams },
      };
      const updated = { ...state.userPresets, [slot]: newPreset };
      set({ userPresets: updated });
      try {
        localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignored
      }
      get().setOledMessage({
        line1: `SAVED TO USER ${slot}`,
        line2: newPreset.name.toUpperCase(),
        statusBadge: `USER ${slot}`,
      });
    },

    loadUserPreset: (slot: number) => {
      const state = get();
      const p = state.userPresets[slot];
      if (p) {
        state.setPreset(p.presetId);
        set({ synthParams: p.params });
        audioEngine.updateSynthParams(p.params);
        get().setOledMessage({
          line1: `LOADED USER ${slot}`,
          line2: p.name.toUpperCase(),
          statusBadge: `USER ${slot}`,
        });
      }
    },

    playNote: (midiNote: number, velocity: number = 100) => {
      const {
        octaveShift,
        transpose,
        arpSettings,
        currentPreset,
        synthParams,
        activeNotes,
        scaleLock,
        scaleRoot,
        selectedScale,
        chordType,
      } = get();

      let transposedNote = midiNote + octaveShift * 12 + transpose;

      if (scaleLock) {
        transposedNote = quantizeToScale(transposedNote, scaleRoot, selectedScale);
      }

      const chordNotes = generateChordNotes(transposedNote, chordType, scaleRoot, selectedScale);
      activeKeyToChordsMap.set(midiNote, chordNotes);

      const newActive = Array.from(new Set([...activeNotes, ...chordNotes]));
      set({ activeNotes: newActive });

      chordNotes.forEach((note) => {
        if (arpSettings.enabled) {
          arpEngine.noteDown(note);
        } else {
          audioEngine.playNote(note, velocity, currentPreset, synthParams);
        }
      });
    },

    stopNote: (midiNote: number) => {
      const { octaveShift, transpose, arpSettings, activeNotes } = get();
      const defaultNote = midiNote + octaveShift * 12 + transpose;
      const notesToStop = activeKeyToChordsMap.get(midiNote) || [defaultNote];
      activeKeyToChordsMap.delete(midiNote);

      set({ activeNotes: activeNotes.filter((n) => !notesToStop.includes(n)) });

      notesToStop.forEach((note) => {
        if (arpSettings.enabled) {
          arpEngine.noteUp(note);
        } else {
          audioEngine.stopNote(note);
        }
      });
    },

    triggerPad: (padNumber: number, velocity: number = 100) => {
      const { fullLevel, currentDrumKit, padBank, noteRepeatSettings, activePads } = get();
      const actualVel = fullLevel ? 127 : velocity;
      const padsList = padBank === 'A' ? currentDrumKit.padsA : currentDrumKit.padsB;
      const pad = padsList.find(p => p.padNumber === padNumber) || padsList[0];

      if (!activePads.includes(padNumber)) {
        set({ activePads: [...activePads, padNumber] });
      }

      if (noteRepeatSettings.enabled) {
        arpEngine.padDown(pad, currentDrumKit, actualVel);
      }

      // Always trigger immediate strike on initial hit
      audioEngine.triggerPad(pad, currentDrumKit, actualVel);

      get().setOledMessage({
        line1: `PAD ${padNumber}: ${pad.name.toUpperCase()}`,
        line2: `VEL: ${actualVel}  [${currentDrumKit.name.slice(0, 12)}]`,
        statusBadge: `PAD ${padNumber}`
      });
    },

    releasePad: (padNumber: number) => {
      const { activePads } = get();
      set({ activePads: activePads.filter(p => p !== padNumber) });
      arpEngine.padUp(padNumber);
    },

    allNotesOff: () => {
      arpEngine.clearAll();
      audioEngine.allNotesOff();
      set({ activeNotes: [], activePads: [], activeArpNote: null });
    }
  };
});
