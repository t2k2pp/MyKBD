import React, { useEffect, useRef, useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';

interface KeyDef {
  midi: number; // base midi note (48 = C3 or C2)
  name: string;
  isBlack: boolean;
  whiteIndex: number; // index among white keys
  pcKey?: string;
}

export const Keyboard: React.FC = () => {
  const playNote = useMpkStore((s) => s.playNote);
  const stopNote = useMpkStore((s) => s.stopNote);
  const activeNotes = useMpkStore((s) => s.activeNotes);
  const activeArpNote = useMpkStore((s) => s.activeArpNote);
  const octaveShift = useMpkStore((s) => s.octaveShift);
  const transpose = useMpkStore((s) => s.transpose);

  const [showPcLabels, setShowPcLabels] = useState(true);

  // Active pointers map for glissando & multi-touch
  // pointerId -> { midiNote, element }
  const activePointers = useRef<Map<number, number>>(new Map());

  // Define 25 keys from C to C (2 octaves + 1 high C)
  // Base MIDI 48 (C3) through 72 (C5)
  const baseStartMidi = 48;
  const keys: KeyDef[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pcKeyMap: Record<number, string> = {
    48: 'A', 49: 'W', 50: 'S', 51: 'E', 52: 'D', 53: 'F', 54: 'T', 55: 'G',
    56: 'Y', 57: 'H', 58: 'U', 59: 'J', 60: 'K', 61: 'O', 62: 'L', 63: 'P',
    64: ';', 65: "'", 66: ']', 67: '\\'
  };

  let whiteCount = 0;
  for (let i = 0; i <= 24; i++) {
    const midi = baseStartMidi + i;
    const noteInOct = midi % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteInOct);
    keys.push({
      midi,
      name: `${noteNames[noteInOct]}`,
      isBlack,
      whiteIndex: isBlack ? -1 : whiteCount++,
      pcKey: pcKeyMap[midi]
    });
  }

  const whiteKeys = keys.filter((k) => !k.isBlack);
  const totalWhiteKeys = whiteKeys.length; // 15 white keys

  // Multi-touch & Glissando Event Handlers
  const handleKeyPointerDown = (
    key: KeyDef,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    // Compute velocity from vertical position
    // Touching the tip (bottom of key) = higher velocity (127)
    // Touching the upper part = lower velocity (50-70)
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const velocity = Math.round(55 + relY * 72);

    activePointers.current.set(e.pointerId, key.midi);
    playNote(key.midi, velocity);
  };

  const handleKeyPointerEnter = (
    key: KeyDef,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    // If this pointer is currently pressed (glissando slide)
    if (e.buttons > 0 || activePointers.current.has(e.pointerId)) {
      const prevMidi = activePointers.current.get(e.pointerId);
      if (prevMidi !== undefined && prevMidi !== key.midi) {
        stopNote(prevMidi);
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      const velocity = Math.round(60 + relY * 67);

      activePointers.current.set(e.pointerId, key.midi);
      playNote(key.midi, velocity);
    }
  };

  const handleKeyPointerLeave = (
    key: KeyDef,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    // Note off if dragging off without release (will transition on pointerEnter of next key)
    if (activePointers.current.get(e.pointerId) === key.midi && e.buttons === 0) {
      stopNote(key.midi);
      activePointers.current.delete(e.pointerId);
    }
  };

  const handleKeyPointerUp = (
    key: KeyDef,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    const currentMidi = activePointers.current.get(e.pointerId) ?? key.midi;
    stopNote(currentMidi);
    activePointers.current.delete(e.pointerId);
  };

  // Keyboard Global Event Listeners for PC typing
  useEffect(() => {
    const pressedKeys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const upperKey = e.key.toUpperCase();
      if (pressedKeys.has(upperKey)) return;

      // Octave shortcuts: Z for Octave -, X for Octave +
      if (upperKey === 'Z') {
        useMpkStore.getState().octaveDown();
        return;
      }
      if (upperKey === 'X') {
        useMpkStore.getState().octaveUp();
        return;
      }
      if (upperKey === 'C') {
        useMpkStore.getState().toggleKnobMode();
        return;
      }
      if (upperKey === 'V') {
        useMpkStore.getState().toggleArp();
        return;
      }

      // Drum pad shortcuts 1-8
      const padNum = parseInt(e.key, 10);
      if (padNum >= 1 && padNum <= 8) {
        useMpkStore.getState().triggerPad(padNum, 115);
        return;
      }

      // Find matching piano key
      const match = keys.find((k) => k.pcKey && k.pcKey.toUpperCase() === upperKey);
      if (match) {
        pressedKeys.add(upperKey);
        playNote(match.midi, 110);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const upperKey = e.key.toUpperCase();
      pressedKeys.delete(upperKey);

      const padNum = parseInt(e.key, 10);
      if (padNum >= 1 && padNum <= 8) {
        useMpkStore.getState().releasePad(padNum);
        return;
      }

      const match = keys.find((k) => k.pcKey && k.pcKey.toUpperCase() === upperKey);
      if (match) {
        stopNote(match.midi);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [keys, playNote, stopNote]);

  // Determine if a key is currently physically active or highlighted by arp
  const isKeyActive = (midi: number) => {
    const transposed = midi + (octaveShift * 12) + transpose;
    return activeNotes.includes(transposed) || activeArpNote === transposed;
  };

  return (
    <div id="keyboard-bed-section" className="w-full flex flex-col items-center select-none">
      {/* Red Felt Acoustic Cushioning Strip */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#ef233c] via-[#d90429] to-[#ef233c] rounded-t-sm shadow-[0_0_8px_rgba(239,35,60,0.7)]" />

      {/* 25-Key Bed Housing */}
      <div className="relative w-full h-36 sm:h-44 md:h-48 bg-[#0e1013] border-x-4 border-b-4 border-[#1f2229] rounded-b-lg shadow-[0_8px_20px_rgba(0,0,0,0.8)] overflow-hidden flex touch-none">
        {/* White Keys Container (Flex row) */}
        <div className="w-full h-full flex">
          {whiteKeys.map((k) => {
            const active = isKeyActive(k.midi);
            return (
              <div
                key={k.midi}
                id={`key-${k.midi}`}
                onPointerDown={(e) => handleKeyPointerDown(k, e)}
                onPointerEnter={(e) => handleKeyPointerEnter(k, e)}
                onPointerLeave={(e) => handleKeyPointerLeave(k, e)}
                onPointerUp={(e) => handleKeyPointerUp(k, e)}
                onPointerCancel={(e) => handleKeyPointerUp(k, e)}
                style={{ width: `${100 / totalWhiteKeys}%` }}
                className={`relative h-full white-key border-r border-gray-400/80 cursor-pointer touch-none flex flex-col justify-end items-center pb-2 transition-transform duration-75 ${
                  active ? 'white-key-pressed !border-red-500 shadow-[inset_0_0_12px_rgba(239,35,60,0.5)]' : ''
                }`}
              >
                {/* Note and PC Shortcut Label at bottom */}
                <div className="flex flex-col items-center pointer-events-none">
                  {showPcLabels && k.pcKey && (
                    <span className="font-mono text-[9px] font-bold text-gray-500 bg-black/10 px-1 rounded -mb-0.5">
                      {k.pcKey}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold ${active ? 'text-[#ef233c]' : 'text-gray-600'}`}>
                    {k.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Black Keys Container (Absolute positioning over white keys) */}
        {keys
          .filter((k) => k.isBlack)
          .map((k) => {
            const active = isKeyActive(k.midi);
            // Black key offsets relative to 15 white keys:
            // C=0, D=1, E=2, F=3, G=4, A=5, B=6, C=7, D=8, E=9, F=10, G=11, A=12, B=13, C=14
            const blackKeyPositions: Record<number, number> = {
              49: 0.65, // C#1
              51: 1.72, // D#1
              54: 3.63, // F#1
              56: 4.70, // G#1
              58: 5.75, // A#1
              61: 7.65, // C#2
              63: 8.72, // D#2
              66: 10.63, // F#2
              68: 11.70, // G#2
              70: 12.75, // A#2
            };

            const leftRatio = (blackKeyPositions[k.midi] / totalWhiteKeys) * 100;

            return (
              <div
                key={k.midi}
                id={`key-${k.midi}`}
                onPointerDown={(e) => handleKeyPointerDown(k, e)}
                onPointerEnter={(e) => handleKeyPointerEnter(k, e)}
                onPointerLeave={(e) => handleKeyPointerLeave(k, e)}
                onPointerUp={(e) => handleKeyPointerUp(k, e)}
                onPointerCancel={(e) => handleKeyPointerUp(k, e)}
                style={{
                  left: `${leftRatio}%`,
                  width: `${(100 / totalWhiteKeys) * 0.65}%`,
                }}
                className={`absolute top-0 h-[62%] black-key z-20 cursor-pointer touch-none flex flex-col justify-end items-center pb-1.5 transition-transform duration-75 ${
                  active ? 'black-key-pressed !border-[#ef233c] shadow-[0_0_12px_#ef233c]' : ''
                }`}
              >
                {showPcLabels && k.pcKey && (
                  <span className="font-mono text-[8px] font-bold text-gray-400 bg-white/10 px-0.5 rounded pointer-events-none">
                    {k.pcKey}
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* Bed Footer Info Bar */}
      <div className="flex items-center justify-between w-full px-2 py-1 text-[10px] text-gray-500 font-tech">
        <div className="flex items-center gap-2">
          <span>EXPRESSIVE 25-KEY SYNTH BED</span>
          <span className="text-gray-600">|</span>
          <span>RANGE: C{2 + octaveShift} - C{4 + octaveShift}</span>
        </div>
        <button
          onClick={() => setShowPcLabels(!showPcLabels)}
          className="text-gray-400 hover:text-white underline cursor-pointer"
        >
          {showPcLabels ? 'Hide Key Hints' : 'Show Key Hints (PC)'}
        </button>
      </div>
    </div>
  );
};
