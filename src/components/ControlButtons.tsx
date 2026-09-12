import React, { useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';
import { ArpMode, TimeDivision } from '../types';

export const ControlButtons: React.FC = () => {
  const octaveShift = useMpkStore((s) => s.octaveShift);
  const octaveUp = useMpkStore((s) => s.octaveUp);
  const octaveDown = useMpkStore((s) => s.octaveDown);
  const fullLevel = useMpkStore((s) => s.fullLevel);
  const toggleFullLevel = useMpkStore((s) => s.toggleFullLevel);
  const padBank = useMpkStore((s) => s.padBank);
  const setPadBank = useMpkStore((s) => s.setPadBank);
  const arpSettings = useMpkStore((s) => s.arpSettings);
  const toggleArp = useMpkStore((s) => s.toggleArp);
  const updateArp = useMpkStore((s) => s.updateArp);
  const noteRepeatSettings = useMpkStore((s) => s.noteRepeatSettings);
  const toggleNoteRepeat = useMpkStore((s) => s.toggleNoteRepeat);
  const updateNoteRepeat = useMpkStore((s) => s.updateNoteRepeat);
  const tapTempo = useMpkStore((s) => s.tapTempo);
  const allNotesOff = useMpkStore((s) => s.allNotesOff);

  const [showArpModal, setShowArpModal] = useState(false);

  const arpModes: ArpMode[] = ['UP', 'DOWN', 'EXCL', 'INCL', 'ORDER', 'RAND'];
  const divisions: TimeDivision[] = ['1/4', '1/8', '1/16', '1/32', '1/8T', '1/16T'];

  return (
    <div id="hardware-control-buttons" className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full h-full">
      {/* Row 1: Octave Controls across 2 cols */}
      <div className="col-span-2 flex items-center justify-between bg-[#121418] px-2.5 py-1.5 rounded-lg border border-[#232731]">
        <span className="text-[10px] sm:text-xs font-tech text-gray-300 font-bold uppercase tracking-wider">OCTAVE</span>
        <div className="flex items-center gap-2">
          <button
            id="btn-octave-down"
            onClick={octaveDown}
            disabled={octaveShift <= -4}
            title="Octave Down (PC Shortcut: Z)"
            className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-tech font-bold transition-all ${
              octaveShift < 0
                ? 'bg-[#ef233c] text-white shadow-[0_0_8px_#ef233c]'
                : 'bg-[#1b1e26] text-gray-300 hover:bg-[#252a35]'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            - (Z)
          </button>
          <span className="font-mono text-xs sm:text-sm font-black text-[#00f0ff] min-w-[24px] text-center">
            {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
          </span>
          <button
            id="btn-octave-up"
            onClick={octaveUp}
            disabled={octaveShift >= 4}
            title="Octave Up (PC Shortcut: X)"
            className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-tech font-bold transition-all ${
              octaveShift > 0
                ? 'bg-[#ef233c] text-white shadow-[0_0_8px_#ef233c]'
                : 'bg-[#1b1e26] text-gray-300 hover:bg-[#252a35]'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            + (X)
          </button>
        </div>
      </div>

      {/* Row 2: Full Level & Note Repeat */}
      <button
        id="btn-full-level"
        onClick={toggleFullLevel}
        title="Full Level: Force maximum velocity 127 on all drum pads"
        className={`px-2.5 py-2 sm:py-2.5 rounded-lg border text-[10px] sm:text-xs font-tech font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
          fullLevel
            ? 'bg-[#ef233c] border-[#ff4d6d] text-white shadow-[0_0_10px_rgba(239,35,60,0.6)]'
            : 'bg-[#181b22] border-[#292e3a] text-gray-400 hover:text-white'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${fullLevel ? 'bg-white shadow-[0_0_4px_white]' : 'bg-gray-600'}`} />
        <span>FULL LVL</span>
      </button>

      <button
        id="btn-note-repeat"
        onClick={toggleNoteRepeat}
        title="Note Repeat: Automatically trigger held drum pads at rhythm tempo division"
        className={`px-2.5 py-2 sm:py-2.5 rounded-lg border text-[10px] sm:text-xs font-tech font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
          noteRepeatSettings.enabled
            ? 'bg-[#00f0ff] border-[#66f6ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.6)] font-extrabold'
            : 'bg-[#181b22] border-[#292e3a] text-gray-400 hover:text-white'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${noteRepeatSettings.enabled ? 'bg-black' : 'bg-gray-600'}`} />
        <span>REPEAT</span>
      </button>

      {/* Row 3: Bank Switch & Arpeggiator */}
      <button
        id="btn-bank-toggle"
        onClick={() => setPadBank(padBank === 'A' ? 'B' : 'A')}
        title="Switch Drum Pad Bank (Bank A: Pads 1-8 / Bank B: Pads 9-16)"
        className={`px-2.5 py-2 sm:py-2.5 rounded-lg border text-[10px] sm:text-xs font-tech font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
          padBank === 'B'
            ? 'bg-[#ffb703] border-[#ffd166] text-black shadow-[0_0_10px_rgba(255,183,3,0.6)]'
            : 'bg-[#181b22] border-[#292e3a] text-white'
        }`}
      >
        <span>BANK {padBank}</span>
        <span className="text-[8px] sm:text-[9px] opacity-75 font-mono">
          ({padBank === 'A' ? '1-8' : '9-16'})
        </span>
      </button>

      <div className="relative flex items-stretch">
        <button
          id="btn-arpeggiator"
          onClick={toggleArp}
          title="Toggle Arpeggiator (PC Shortcut: V)"
          className={`flex-1 px-2 py-2 sm:py-2.5 rounded-l-lg border text-[10px] sm:text-xs font-tech font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
            arpSettings.enabled
              ? 'bg-[#ef233c] border-[#ff4d6d] text-white shadow-[0_0_10px_rgba(239,35,60,0.6)]'
              : 'bg-[#181b22] border-[#292e3a] text-gray-400 hover:text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${arpSettings.enabled ? 'bg-white shadow-[0_0_4px_white]' : 'bg-gray-600'}`} />
          <span>ARP</span>
        </button>

        <button
          id="btn-arp-config"
          onClick={() => setShowArpModal(!showArpModal)}
          title="Configure Arpeggiator & Clock settings"
          className="px-2 py-2 sm:py-2.5 rounded-r-lg border-y border-r border-[#292e3a] bg-[#1b1e26] hover:bg-[#252a35] text-gray-300 text-xs font-bold"
        >
          ⚙️
        </button>

        {/* Arpeggiator Popover Panel */}
        {showArpModal && (
          <div className="absolute left-0 top-full mt-2 w-64 bg-[#16181e] border border-gray-700 rounded-lg p-3 shadow-2xl z-50 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="font-tech font-bold text-white uppercase tracking-wider">Arpeggiator</span>
              <button
                onClick={() => setShowArpModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Mode selection */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-tech text-gray-400 uppercase">Pattern Mode</span>
              <div className="grid grid-cols-3 gap-1">
                {arpModes.map((m) => (
                  <button
                    key={m}
                    onClick={() => updateArp({ mode: m })}
                    className={`py-1 rounded text-[9px] font-mono font-bold ${
                      arpSettings.mode === m
                        ? 'bg-[#ef233c] text-white'
                        : 'bg-[#20242e] text-gray-300 hover:bg-[#2c313e]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Division */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-tech text-gray-400 uppercase">Time Division</span>
              <div className="grid grid-cols-3 gap-1">
                {divisions.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      updateArp({ division: d });
                      updateNoteRepeat({ division: d });
                    }}
                    className={`py-1 rounded text-[9px] font-mono font-bold ${
                      arpSettings.division === d
                        ? 'bg-[#00f0ff] text-black font-extrabold'
                        : 'bg-[#20242e] text-gray-300 hover:bg-[#2c313e]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Octave Range */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-tech text-gray-400 uppercase">Octave Span</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((oct) => (
                  <button
                    key={oct}
                    onClick={() => updateArp({ octaveRange: oct })}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                      arpSettings.octaveRange === oct
                        ? 'bg-[#ffb703] text-black font-bold'
                        : 'bg-[#20242e] text-gray-300'
                    }`}
                  >
                    {oct}
                  </button>
                ))}
              </div>
            </div>

            {/* Latch toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-800">
              <span className="text-[9px] font-tech text-gray-400 uppercase">Key Latch</span>
              <button
                onClick={() => updateArp({ latch: !arpSettings.latch })}
                className={`px-2.5 py-1 rounded text-[9px] font-tech font-bold uppercase ${
                  arpSettings.latch ? 'bg-emerald-500 text-black' : 'bg-[#20242e] text-gray-400'
                }`}
              >
                {arpSettings.latch ? 'LATCH ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Tap Tempo & Panic */}
      <button
        id="btn-tap-tempo"
        onClick={tapTempo}
        title="Tap repeatedly to calculate BPM tempo"
        className="px-2.5 py-2 sm:py-2.5 rounded-lg border border-[#292e3a] bg-[#181b22] text-gray-300 hover:bg-[#242934] active:bg-[#ef233c] active:text-white text-[10px] sm:text-xs font-tech font-bold uppercase transition-colors text-center"
      >
        TAP BPM
      </button>

      <button
        id="btn-panic-all-off"
        onClick={allNotesOff}
        title="Panic Button: Cut all hanging sound voices"
        className="px-2.5 py-2 sm:py-2.5 rounded-lg border border-gray-800 bg-black/40 text-gray-400 hover:text-red-400 text-[10px] sm:text-xs font-tech uppercase text-center"
      >
        PANIC
      </button>
    </div>
  );
};
