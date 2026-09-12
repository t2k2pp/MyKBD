/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { OledScreen } from './components/OledScreen';
import { RotaryKnobs } from './components/RotaryKnobs';
import { Joystick } from './components/Joystick';
import { DrumPads } from './components/DrumPads';
import { Keyboard } from './components/Keyboard';
import { ControlButtons } from './components/ControlButtons';
import { SoundSelector } from './components/SoundSelector';
import { ProStationBar } from './components/ProStationBar';
import { useMpkStore } from './store/useMpkStore';

export default function App() {
  const unlockAudio = useMpkStore((s) => s.unlockAudio);
  const isAudioUnlocked = useMpkStore((s) => s.isAudioUnlocked);

  // Auto-unlock audio on first user interaction anywhere in the window
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      if (!isAudioUnlocked) {
        unlockAudio();
      }
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [isAudioUnlocked, unlockAudio]);

  return (
    <div
      id="studio-play-app-root"
      className="min-h-screen bg-[#08090b] text-gray-200 flex flex-col items-center justify-between p-1 sm:p-2 md:py-2.5 md:px-4 overflow-x-hidden font-sans select-none"
    >
      {/* Hardware Chassis Shell */}
      <div
        id="hardware-chassis"
        className="w-full max-w-5xl rounded-xl border-2 border-[#2b2f38] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(239,35,60,0.15)] flex flex-col overflow-hidden"
      >
        {/* Top Metallic Trim & Status Bar */}
        <TopBar />

        {/* Upper Control Deck (Sound Selector, Pro Bar, Controls, OLED, Pads, Knobs) */}
        <div className="px-2 sm:px-3.5 py-1.5 sm:py-2 flex flex-col gap-1.5 sm:gap-2 bg-gradient-to-b from-[#14161b] via-[#101217] to-[#0c0d11]">
          {/* Sound Library & Preset Navigation Bar */}
          <SoundSelector />

          {/* Pro Hardware Station Bar (Recorder, Metronome, Chords, Scales, Demos, User Presets) */}
          <ProStationBar />

          {/* Section 1: Display & Sound Shaping Engine (OLED Screen + 4 Rotary Encoders) */}
          <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-2.5 w-full">
            <div className="w-full md:w-auto flex justify-center flex-shrink-0">
              <OledScreen />
            </div>
            <div className="w-full md:flex-1 min-w-0">
              <RotaryKnobs />
            </div>
          </div>

          {/* Section 2: Expressive Performance & Rhythm Deck (Balanced 50/50 Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5 w-full items-stretch">
            {/* Left: Expanded Performance Controllers (Joystick + 2-Column Touch Controls) */}
            <div className="flex items-center justify-between gap-3 bg-[#0e1013] p-2 sm:p-2.5 rounded-lg border border-[#20232b]">
              <div className="flex items-center justify-center flex-shrink-0">
                <Joystick />
              </div>
              <div className="flex-1 min-w-0 h-full flex items-center">
                <ControlButtons />
              </div>
            </div>

            {/* Right: 8 Velocity-Sensitive Backlit Performance Drum Pads (50% Width) */}
            <div className="flex items-center bg-[#0e1013] p-2 sm:p-2.5 rounded-lg border border-[#20232b] min-w-0">
              <DrumPads />
            </div>
          </div>
        </div>

        {/* Lower Deck: 25-Key Dynamic Expressive Keybed (Size strictly preserved) */}
        <div className="px-2 sm:px-3 pb-1.5 sm:pb-2 bg-[#0c0d11]">
          <Keyboard />
        </div>
      </div>

      {/* Hardware Chassis Specs & Performance Footer */}
      <footer className="w-full max-w-5xl mt-1.5 flex flex-wrap items-center justify-between gap-2 px-2 text-[10px] sm:text-xs text-gray-500 font-tech">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-bold">STUDIO SYNTH WORKSTATION</span>
          <span>•</span>
          <span className="text-emerald-400">LATENCY: &lt; 12ms (BUFFER 128)</span>
          <span>•</span>
          <span>GM 128 VOICES + 10 PCM KITS + WAV RECORDER</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px]">
          <span>PC KEYS: [A..L/W..O] KEYS • [1..8] PADS • [Z/X] OCT • [V] ARP</span>
        </div>
      </footer>
    </div>
  );
}

