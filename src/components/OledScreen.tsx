import React, { useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';

export const OledScreen: React.FC = () => {
  const oled = useMpkStore((s) => s.oled);
  const currentPreset = useMpkStore((s) => s.currentPreset);
  const currentDrumKit = useMpkStore((s) => s.currentDrumKit);
  const arpSettings = useMpkStore((s) => s.arpSettings);
  const octaveShift = useMpkStore((s) => s.octaveShift);
  const isAudioUnlocked = useMpkStore((s) => s.isAudioUnlocked);
  const connectedMidiDevices = useMpkStore((s) => s.connectedMidiDevices);

  // OLED color theme: cyan, amber, green
  const [colorTheme, setColorTheme] = useState<'cyan' | 'amber' | 'emerald'>('cyan');

  const themeClasses = {
    cyan: {
      text: 'oled-text-cyan text-[#00f0ff]',
      border: 'border-[#00f0ff]/30',
      bgGlow: 'shadow-[0_0_15px_rgba(0,240,255,0.15)]',
      barFill: 'bg-[#00f0ff]',
      barTrack: 'bg-[#003d47]',
      badge: 'border-[#00f0ff]/40 bg-[#002b33] text-[#00f0ff]'
    },
    amber: {
      text: 'oled-text-amber text-[#ffb703]',
      border: 'border-[#ffb703]/30',
      bgGlow: 'shadow-[0_0_15px_rgba(255,183,3,0.15)]',
      barFill: 'bg-[#ffb703]',
      barTrack: 'bg-[#473300]',
      badge: 'border-[#ffb703]/40 bg-[#332500] text-[#ffb703]'
    },
    emerald: {
      text: 'text-[#39ff14] drop-shadow-[0_0_6px_rgba(57,255,20,0.6)]',
      border: 'border-[#39ff14]/30',
      bgGlow: 'shadow-[0_0_15px_rgba(57,255,20,0.15)]',
      barFill: 'bg-[#39ff14]',
      barTrack: 'bg-[#0b3305]',
      badge: 'border-[#39ff14]/40 bg-[#092b04] text-[#39ff14]'
    }
  }[colorTheme];

  const toggleTheme = () => {
    setColorTheme((prev) => (prev === 'cyan' ? 'amber' : prev === 'amber' ? 'emerald' : 'cyan'));
  };

  return (
    <div
      id="oled-screen-container"
      onClick={toggleTheme}
      title="Click to toggle OLED display color (Cyan / Amber / Green)"
      className={`relative w-48 sm:w-56 h-24 sm:h-26 rounded-lg oled-bezel border border-black/80 p-2 sm:p-2.5 flex flex-col justify-between cursor-pointer select-none overflow-hidden transition-all duration-300 ${themeClasses.bgGlow}`}
    >
      {/* Scanline CRT overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40 z-10" />

      {/* Screen Header Row */}
      <div className="flex items-center justify-between z-20 font-oled text-xs tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${themeClasses.badge}`}>
            {oled.statusBadge || 'READY'}
          </span>
          {connectedMidiDevices.length > 0 && (
            <span className="text-[10px] text-emerald-400 font-tech font-bold uppercase tracking-tight">
              MIDI
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono opacity-90">
          <span>OCT:{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span>
          <span>{arpSettings.bpm}BPM</span>
        </div>
      </div>

      {/* Main OLED Display Content */}
      <div className="flex flex-col justify-center my-0.5 z-20">
        <div className={`font-oled text-base sm:text-lg font-bold truncate leading-tight tracking-wider ${themeClasses.text}`}>
          {oled.line1 || currentPreset.name}
        </div>
        <div className={`font-oled text-[11px] sm:text-xs truncate opacity-85 tracking-wide ${themeClasses.text}`}>
          {oled.line2 || `KIT: ${currentDrumKit.name}`}
        </div>
      </div>

      {/* Parameter Bargraph / Status Footer */}
      <div className="z-20 w-full pt-0.5">
        {oled.paramBar !== undefined ? (
          <div className="w-full flex items-center gap-1.5">
            <div className={`flex-1 h-2 rounded-sm overflow-hidden ${themeClasses.barTrack}`}>
              <div
                className={`h-full transition-all duration-75 ${themeClasses.barFill}`}
                style={{ width: `${Math.max(0, Math.min(100, oled.paramBar))}%` }}
              />
            </div>
            <span className={`font-oled text-xs font-semibold w-8 text-right ${themeClasses.text}`}>
              {oled.paramBar}%
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-oled opacity-75">
            <span>{isAudioUnlocked ? 'DSP 44.1kHz' : 'TAP TO UNMUTE'}</span>
            <span>{arpSettings.enabled ? `ARP ${arpSettings.division}` : 'KEYBED'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
