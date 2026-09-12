import React, { useEffect, useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';
import { MidiManager } from '../audio/midiManager';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { ManualModal } from './ManualModal';

export const TopBar: React.FC = () => {
  const masterVolume = useMpkStore((s) => s.masterVolume);
  const setMasterVolume = useMpkStore((s) => s.setMasterVolume);
  const speakerEmulation = useMpkStore((s) => s.speakerEmulation);
  const toggleSpeakerEmulation = useMpkStore((s) => s.toggleSpeakerEmulation);
  const isAudioUnlocked = useMpkStore((s) => s.isAudioUnlocked);
  const unlockAudio = useMpkStore((s) => s.unlockAudio);
  const connectedMidiDevices = useMpkStore((s) => s.connectedMidiDevices);
  const setMidiDevices = useMpkStore((s) => s.setMidiDevices);
  const playNote = useMpkStore((s) => s.playNote);
  const stopNote = useMpkStore((s) => s.stopNote);
  const setJoystick = useMpkStore((s) => s.setJoystick);
  const updateParam = useMpkStore((s) => s.updateParam);
  const setPreset = useMpkStore((s) => s.setPreset);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Initialize Web MIDI on component mount
  useEffect(() => {
    let sustainPedalDown = false;
    const sustainedNotes = new Set<number>();

    const midi = new MidiManager({
      onNoteOn: (note, velocity, channel) => {
        // Channel 10 is usually standard MIDI percussion
        if (channel === 9) {
          const padNumber = ((note - 36) % 16) + 1;
          useMpkStore.getState().triggerPad(padNumber, velocity);
        } else {
          sustainedNotes.add(note);
          playNote(note, velocity);
        }
      },
      onNoteOff: (note, channel) => {
        if (channel === 9) {
          const padNumber = ((note - 36) % 16) + 1;
          useMpkStore.getState().releasePad(padNumber);
        } else {
          if (!sustainPedalDown) {
            sustainedNotes.delete(note);
            stopNote(note);
          }
        }
      },
      onPitchBend: (val) => {
        setJoystick(val, useMpkStore.getState().joystick.y);
      },
      onProgramChange: (prog) => {
        setPreset(prog % 128);
      },
      onControlChange: (cc, val) => {
        // CC1 = Mod Wheel
        if (cc === 1) {
          setJoystick(useMpkStore.getState().joystick.x, val / 127);
        } else if (cc === 64) {
          // Sustain Pedal
          sustainPedalDown = val >= 64;
          if (!sustainPedalDown) {
            // Release any notes that were sustained
            sustainedNotes.forEach((n) => stopNote(n));
            sustainedNotes.clear();
          }
        } else if (cc === 7) {
          // Volume
          setMasterVolume(Math.round((val / 127) * 100));
        } else if (cc === 74) {
          // Cutoff
          updateParam('filterCutoff', val);
        } else if (cc === 71) {
          // Resonance
          updateParam('filterResonance', val);
        } else if (cc === 91) {
          // Reverb
          updateParam('reverbAmount', val);
        }
      },
      onDevicesChanged: (devices) => {
        setMidiDevices(devices);
      },
    });

    midi.init();
  }, [playNote, stopNote, setJoystick, updateParam, setMasterVolume, setMidiDevices, setPreset]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div id="hardware-top-bar" className="w-full flex flex-col md:flex-row items-center justify-between gap-2 px-3 py-1.5 bg-[#0d0f12] border-b border-[#232731]">
      {/* Brand & Model Signature typography */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="font-tech font-black text-lg sm:text-xl text-[#ef233c] tracking-widest leading-none drop-shadow-[0_0_8px_rgba(239,35,60,0.5)]">
              STUDIO
            </span>
            <span className="text-[7px] tracking-[0.25em] text-gray-400 font-bold uppercase -mt-0.5">
              ACOUSTICS & SYNTHESIS
            </span>
          </div>

          <div className="h-6 w-[1px] bg-gray-700 hidden sm:block" />

          <div className="flex flex-col">
            <span className="font-tech font-bold text-xs sm:text-sm text-gray-200 tracking-wider">
              SYNTH WORKSTATION
            </span>
            <span className="text-[8px] font-mono text-[#00f0ff] font-semibold tracking-widest">
              POLYPHONIC SOUND ENGINE
            </span>
          </div>
        </div>

        {/* Built-in Stereo Speaker Acoustic Grill & Emulation Toggle */}
        <button
          id="btn-speaker-toggle"
          onClick={toggleSpeakerEmulation}
          title={
            speakerEmulation
              ? 'Speaker Emulation: 2.5" Acoustic Cone (ACTIVE). Click to switch to Line Out (Flat).'
              : 'Output: Line Out / Studio Monitors (FLAT). Click to enable 2.5" Acoustic Speaker Emulation.'
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all cursor-pointer ${
            speakerEmulation
              ? 'bg-[#ef233c]/20 border-[#ef233c] shadow-[0_0_8px_rgba(239,35,60,0.4)]'
              : 'bg-black/40 border-gray-800 hover:border-gray-600'
          }`}
        >
          <div className="w-12 h-3.5 speaker-grill rounded border border-black/80 shadow-inner" />
          <div className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                speakerEmulation ? 'bg-[#ef233c] shadow-[0_0_4px_#ef233c]' : 'bg-gray-600'
              }`}
            />
            <span className="text-[8px] font-tech font-bold uppercase tracking-wider text-gray-300">
              {speakerEmulation ? 'SPK' : 'LINE'}
            </span>
          </div>
        </button>
      </div>

      {/* Right Controls: Audio Unlock Banner, Volume, MIDI, PWA, Fullscreen */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-end">
        {/* Audio Engine Unlock Banner (When audio is not yet active) */}
        {!isAudioUnlocked && (
          <button
            id="btn-unlock-audio"
            onClick={unlockAudio}
            className="px-2.5 py-1 rounded bg-[#ef233c] hover:bg-[#ff334b] text-white font-tech font-bold text-[11px] uppercase tracking-wider animate-pulse shadow-[0_0_12px_#ef233c]"
          >
            🔊 ENABLE AUDIO
          </button>
        )}
        {/* Hardware Master Volume Dial */}
        <div className="flex items-center gap-1.5 bg-[#14171d] px-2 py-1 rounded border border-[#252933]">
          <span className="text-[9px] font-tech text-gray-400 font-bold uppercase">VOL</span>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
            className="w-16 sm:w-20 accent-[#ef233c] cursor-pointer"
            title={`Master Volume: ${masterVolume}%`}
          />
          <span className="font-mono text-[9px] text-gray-300 w-6 text-right">
            {masterVolume}
          </span>
        </div>

        {/* Web MIDI Status Badge */}
        <div
          title={
            connectedMidiDevices.length > 0
              ? `Connected MIDI hardware: ${connectedMidiDevices.join(', ')}`
              : 'Web MIDI API active. Plug in any USB/Bluetooth MIDI keyboard or pad controller.'
          }
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#14171d] border border-[#252933]"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              connectedMidiDevices.length > 0
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                : 'bg-gray-600'
            }`}
          />
          <span className="text-[9px] font-tech text-gray-300 font-bold uppercase hidden sm:inline">
            {connectedMidiDevices.length > 0 ? 'MIDI ON' : 'MIDI'}
          </span>
        </div>

        {/* Online / Offline status */}
        {!isOnline && (
          <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[9px] font-mono">
            OFFLINE READY
          </span>
        )}

        {/* PWA Install Button */}
        {isInstallable && !isInstalled && (
          <button
            onClick={() => install()}
            className="px-2.5 py-1 rounded bg-[#00f0ff] hover:bg-[#66f6ff] text-black text-[10px] font-tech font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(0,240,255,0.4)]"
          >
            INSTALL APP
          </button>
        )}

        {isIOS && !isInstalled && (
          <button
            onClick={() => setShowIOSModal(true)}
            className="px-2 py-1 rounded bg-[#1e222b] hover:bg-[#282d39] text-gray-300 text-[10px] font-tech font-bold uppercase border border-gray-700"
          >
            IOS INSTALL
          </button>
        )}

        {/* Manual / Guide Modal Button */}
        <button
          onClick={() => setShowManualModal(true)}
          title="Open User Manual & Tutorial (操作マニュアル / ガイド)"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e2430] hover:bg-[#2a3344] text-[#00f0ff] hover:text-white border border-[#343e52] text-[10px] font-tech font-bold uppercase transition-all cursor-pointer shadow-sm"
        >
          <span>📖 MANUAL</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen Mode"
          className="p-1 rounded bg-[#14171d] hover:bg-[#21252f] text-gray-400 hover:text-white border border-[#252933] text-xs"
        >
          {isFullscreen ? '↙' : '⛶'}
        </button>
      </div>

      {/* Manual / Tutorial Modal */}
      <ManualModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181b22] border border-gray-700 rounded-xl p-5 max-w-sm flex flex-col gap-3 shadow-2xl">
            <h3 className="font-tech font-bold text-white text-base">Install on iOS / iPad</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              To install this commercial-grade synthesizer to your Home Screen with zero latency and full-screen touch:
            </p>
            <ol className="text-xs text-gray-300 list-decimal list-inside space-y-1.5 font-mono">
              <li>Tap the <span className="text-cyan-400 font-bold">Share</span> button in Safari.</li>
              <li>Scroll down and tap <span className="text-cyan-400 font-bold">Add to Home Screen</span>.</li>
              <li>Launch from your Home Screen for low-latency standalone performance!</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-2 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-tech font-bold text-xs uppercase"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
