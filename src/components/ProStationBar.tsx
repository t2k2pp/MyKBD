import React, { useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';
import { DEMO_TRACKS } from '../audio/demoGrooves';
import { ChordType, MusicalScale } from '../types';
import { ROOT_NOTES } from '../audio/scalesAndChords';

export const ProStationBar: React.FC = () => {
  const isRecording = useMpkStore((s) => s.isRecording);
  const recordingSeconds = useMpkStore((s) => s.recordingSeconds);
  const hasRecording = useMpkStore((s) => s.hasRecording);
  const isLooping = useMpkStore((s) => s.isLooping);
  const startRecording = useMpkStore((s) => s.startRecording);
  const stopRecording = useMpkStore((s) => s.stopRecording);
  const toggleLoop = useMpkStore((s) => s.toggleLoop);
  const downloadWav = useMpkStore((s) => s.downloadWav);

  const metronomeEnabled = useMpkStore((s) => s.metronomeEnabled);
  const toggleMetronome = useMpkStore((s) => s.toggleMetronome);

  const demoPlaying = useMpkStore((s) => s.demoPlaying);
  const currentDemoId = useMpkStore((s) => s.currentDemoId);
  const startDemo = useMpkStore((s) => s.startDemo);
  const stopDemo = useMpkStore((s) => s.stopDemo);

  const selectedScale = useMpkStore((s) => s.selectedScale);
  const scaleRoot = useMpkStore((s) => s.scaleRoot);
  const scaleLock = useMpkStore((s) => s.scaleLock);
  const chordType = useMpkStore((s) => s.chordType);
  const setScale = useMpkStore((s) => s.setScale);
  const setScaleRoot = useMpkStore((s) => s.setScaleRoot);
  const toggleScaleLock = useMpkStore((s) => s.toggleScaleLock);
  const setChordType = useMpkStore((s) => s.setChordType);

  const userPresets = useMpkStore((s) => s.userPresets);
  const saveUserPreset = useMpkStore((s) => s.saveUserPreset);
  const loadUserPreset = useMpkStore((s) => s.loadUserPreset);

  const [showScaleModal, setShowScaleModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showUserPresetsModal, setShowUserPresetsModal] = useState(false);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
  };

  const scalesList: { id: MusicalScale; label: string }[] = [
    { id: 'CHROMATIC', label: 'Chromatic (All Keys)' },
    { id: 'MAJOR', label: 'Major (Ionian)' },
    { id: 'NATURAL_MINOR', label: 'Natural Minor (Aeolian)' },
    { id: 'DORIAN', label: 'Dorian (Jazz / Soul)' },
    { id: 'PENTATONIC_MAJOR', label: 'Pentatonic Major' },
    { id: 'PENTATONIC_MINOR', label: 'Pentatonic Minor' },
    { id: 'BLUES', label: 'Blues Scale' },
    { id: 'HIRAJOSHI', label: 'Hirajoshi (Japanese)' },
  ];

  const chordsList: { id: ChordType; label: string }[] = [
    { id: 'OFF', label: 'Single Note (Off)' },
    { id: 'TRIAD', label: 'Diatonic Triad' },
    { id: 'SEVENTH', label: 'Diatonic 7th Chord' },
    { id: 'NINTH', label: 'Diatonic 9th Chord' },
    { id: 'SUS4', label: 'Suspended 4th' },
    { id: 'OCTAVE', label: 'Octave Doubler' },
  ];

  return (
    <div
      id="pro-station-bar"
      className="w-full flex flex-wrap items-center justify-between gap-2.5 bg-[#0d0f13] px-3 py-1.5 rounded-lg border border-[#232731] text-xs select-none"
    >
      {/* Left Segment: Live Master Lossless WAV Recorder */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="text-[10px] sm:text-xs font-tech font-bold text-gray-300 uppercase tracking-widest hidden sm:inline">
          RECORDER
        </span>

        {/* Record Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop Recording' : 'Record Master Audio (lossless WAV)'}
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
            isRecording
              ? 'bg-[#ef233c] text-white animate-pulse shadow-[0_0_12px_#ef233c]'
              : 'bg-[#1a1d24] text-gray-200 hover:text-white border border-[#2e3340] hover:bg-[#252a35]'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500 shadow-[0_0_6px_#ef233c]'}`} />
          <span>{isRecording ? formatSeconds(recordingSeconds) : 'REC'}</span>
        </button>

        {/* Loop Playback */}
        <button
          onClick={toggleLoop}
          disabled={!hasRecording && !isLooping}
          title="Loop recorded master track"
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
            isLooping
              ? 'bg-emerald-500 text-black shadow-[0_0_10px_#10b981]'
              : hasRecording
              ? 'bg-[#1a1d24] text-emerald-400 border border-emerald-800 hover:bg-emerald-950/40'
              : 'bg-[#14161c] text-gray-600 border border-gray-800 cursor-not-allowed opacity-40'
          }`}
        >
          <span>{isLooping ? '⏹ STOP LOOP' : '▶ LOOP'}</span>
        </button>

        {/* Download WAV File */}
        {hasRecording && (
          <button
            onClick={downloadWav}
            title="Download losslessly encoded 16-bit 44.1kHz Stereo WAV file"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#00f0ff] hover:bg-[#66f6ff] text-black text-xs font-tech font-bold uppercase shadow-[0_0_8px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <span>⬇ EXPORT WAV</span>
          </button>
        )}

        {/* Metronome Click Track */}
        <button
          onClick={toggleMetronome}
          title="Metronome / Click track toggle"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-tech font-bold uppercase border transition-all cursor-pointer ${
            metronomeEnabled
              ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_8px_#fbbf24]'
              : 'bg-[#1a1d24] text-gray-300 border-[#2e3340] hover:text-white hover:bg-[#252a35]'
          }`}
        >
          <span>♩ CLICK</span>
        </button>
      </div>

      {/* Center Segment: Scales & Chords Mode Engine */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowScaleModal(true)}
          title="Configure Smart Scales & One-Finger Chords"
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
            scaleLock || chordType !== 'OFF'
              ? 'bg-[#9d4edd]/20 border-[#9d4edd] text-[#e0aaff] shadow-[0_0_8px_rgba(157,78,221,0.3)]'
              : 'bg-[#1a1d24] border-[#2e3340] text-gray-300 hover:text-white hover:bg-[#252a35]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#9d4edd] shadow-[0_0_4px_#9d4edd]" />
          <span>
            {scaleLock ? `${ROOT_NOTES[scaleRoot]} ${selectedScale.replace('_', ' ')}` : 'SCALE: OFF'}
            {chordType !== 'OFF' && ` • [${chordType}]`}
          </span>
          <span className="text-[10px] opacity-60">⚙</span>
        </button>
      </div>

      {/* Right Segment: Demo Song Player & User Presets */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Demo Songs Audition */}
        <button
          onClick={() => setShowDemoModal(true)}
          title="Audition professional demo grooves showing off GM sounds & drum engine"
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
            demoPlaying
              ? 'bg-[#ff006e] border-[#ff4d94] text-white animate-pulse shadow-[0_0_10px_#ff006e]'
              : 'bg-[#1a1d24] border-[#2e3340] text-gray-300 hover:text-white hover:bg-[#252a35]'
          }`}
        >
          <span>{demoPlaying ? '⏹ DEMO PLAYING' : '♬ DEMO GROOVES'}</span>
        </button>

        {/* User Sound Memory (Slots 1..8) */}
        <button
          onClick={() => setShowUserPresetsModal(true)}
          title="Save or Recall your customized sound settings (USER 1 to 8)"
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#1a1d24] border border-[#2e3340] text-gray-300 hover:text-white hover:bg-[#252a35] text-xs font-tech font-bold uppercase cursor-pointer"
        >
          <span>💾 USER PRESETS</span>
        </button>
      </div>

      {/* Modal 1: Smart Scale & Chord Engine Configuration */}
      {showScaleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#14161d] border border-gray-700 rounded-xl p-5 max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div className="flex flex-col">
                <span className="font-tech font-bold text-white text-base">SCALE & CHORD ENGINE</span>
                <span className="text-[10px] text-gray-400 font-mono">Harmonic Quantization & Diatonic Harmony</span>
              </div>
              <button
                onClick={() => setShowScaleModal(false)}
                className="text-gray-400 hover:text-white text-base font-mono px-2"
              >
                ✕
              </button>
            </div>

            {/* Root Note Picker */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-tech font-bold text-gray-300 uppercase">Scale Root Key</span>
              <div className="grid grid-cols-6 gap-1.5">
                {ROOT_NOTES.map((note, idx) => (
                  <button
                    key={note}
                    onClick={() => setScaleRoot(idx)}
                    className={`py-1 rounded font-tech font-bold text-xs ${
                      scaleRoot === idx
                        ? 'bg-[#ef233c] text-white shadow-[0_0_8px_#ef233c]'
                        : 'bg-[#1c1f28] text-gray-300 hover:bg-[#282d3a]'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Type Picker */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-tech font-bold text-gray-300 uppercase">Scale Mode</span>
                <button
                  onClick={toggleScaleLock}
                  className={`px-2 py-0.5 rounded text-[9px] font-tech font-bold uppercase border ${
                    scaleLock
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {scaleLock ? 'SCALE LOCK ACTIVE' : 'SCALE LOCK OFF'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {scalesList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setScale(s.id);
                      if (s.id !== 'CHROMATIC' && !scaleLock) {
                        toggleScaleLock();
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-tech text-left border ${
                      selectedScale === s.id
                        ? 'bg-[#9d4edd] text-white border-[#c77dff] shadow-[0_0_8px_#9d4edd]'
                        : 'bg-[#1c1f28] text-gray-300 border-transparent hover:bg-[#282d3a]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Generator Picker */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-tech font-bold text-gray-300 uppercase">
                One-Touch Chord Generator
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {chordsList.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setChordType(c.id)}
                    className={`px-2 py-1 rounded text-[10px] font-tech text-center border ${
                      chordType === c.id
                        ? 'bg-[#00f0ff] text-black font-bold border-[#66f6ff] shadow-[0_0_8px_#00f0ff]'
                        : 'bg-[#1c1f28] text-gray-300 border-transparent hover:bg-[#282d3a]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowScaleModal(false)}
              className="mt-1 py-2 rounded bg-[#ef233c] hover:bg-[#ff334b] text-white font-tech font-bold text-xs uppercase"
            >
              APPLY SETTINGS
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Professional Demo Grooves */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#14161d] border border-gray-700 rounded-xl p-5 max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div className="flex flex-col">
                <span className="font-tech font-bold text-white text-base">PRO DEMO GROOVES</span>
                <span className="text-[10px] text-gray-400 font-mono">Real-time Multi-Part Hardware Audition</span>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-white text-base font-mono px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Listen to the internal synthesizer and dynamic drum engines playing live in real time. You can play along with keys and pads, or tweak knobs while the demo runs!
            </p>

            <div className="flex flex-col gap-2">
              {DEMO_TRACKS.map((track) => {
                const isThisPlaying = demoPlaying && currentDemoId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      isThisPlaying
                        ? 'bg-[#ff006e]/20 border-[#ff006e] text-white shadow-[0_0_12px_rgba(255,0,110,0.3)]'
                        : 'bg-[#1a1d24] border-gray-800 text-gray-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-tech font-bold text-sm">{track.title}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {track.genre} • {track.bpm} BPM
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (isThisPlaying) {
                          stopDemo();
                        } else {
                          startDemo(track.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded font-tech font-bold text-xs uppercase ${
                        isThisPlaying
                          ? 'bg-[#ff006e] text-white shadow-[0_0_8px_#ff006e]'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      }`}
                    >
                      {isThisPlaying ? '⏹ STOP' : '▶ AUDITION'}
                    </button>
                  </div>
                );
              })}
            </div>

            {demoPlaying && (
              <button
                onClick={stopDemo}
                className="py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-tech font-bold text-xs uppercase"
              >
                STOP ALL DEMO PLAYBACK
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: User Sound Presets Memory (1..8) */}
      {showUserPresetsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#14161d] border border-gray-700 rounded-xl p-5 max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div className="flex flex-col">
                <span className="font-tech font-bold text-white text-base">USER PRESET MEMORY (1–8)</span>
                <span className="text-[10px] text-gray-400 font-mono">Save Your Custom Sound Tweaks</span>
              </div>
              <button
                onClick={() => setShowUserPresetsModal(false)}
                className="text-gray-400 hover:text-white text-base font-mono px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Save your current knob settings (Cutoff, Resonance, Reverb, Chorus, Attack, Release, EQ) to one of 8 persistent hardware memory slots.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => {
                const stored = userPresets[slot];
                return (
                  <div
                    key={slot}
                    className="bg-[#1a1d24] border border-gray-800 rounded-lg p-2.5 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#00f0ff]">SLOT {slot}</span>
                      {stored && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          SAVED
                        </span>
                      )}
                    </div>
                    <span className="font-tech font-bold text-xs text-white truncate">
                      {stored ? stored.name : '— EMPTY —'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => {
                          loadUserPreset(slot);
                          setShowUserPresetsModal(false);
                        }}
                        disabled={!stored}
                        className="flex-1 py-1 rounded bg-[#202531] hover:bg-[#2a3040] disabled:opacity-30 disabled:cursor-not-allowed font-tech font-bold text-[9px] text-gray-200"
                      >
                        RECALL
                      </button>
                      <button
                        onClick={() => {
                          const presetName = prompt(`Enter name for User Preset ${slot}:`, stored ? stored.name : `MY SOUND ${slot}`);
                          if (presetName !== null) {
                            saveUserPreset(slot, presetName.trim() || `USER ${slot}`);
                          }
                        }}
                        className="flex-1 py-1 rounded bg-[#ef233c] hover:bg-[#ff334b] font-tech font-bold text-[9px] text-white"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
