import React from 'react';
import { useMpkStore } from '../store/useMpkStore';
import { DrumPadSound } from '../types';

export const DrumPads: React.FC = () => {
  const currentDrumKit = useMpkStore((s) => s.currentDrumKit);
  const padBank = useMpkStore((s) => s.padBank);
  const activePads = useMpkStore((s) => s.activePads);
  const fullLevel = useMpkStore((s) => s.fullLevel);
  const triggerPad = useMpkStore((s) => s.triggerPad);
  const releasePad = useMpkStore((s) => s.releasePad);

  const padsList: DrumPadSound[] = padBank === 'A' ? currentDrumKit.padsA : currentDrumKit.padsB;

  // Distinct glowing color palettes per pad role
  const getPadColorStyle = (type: DrumPadSound['type'], isPressed: boolean) => {
    switch (type) {
      case 'kick':
        return isPressed
          ? 'bg-[#ef233c] text-white shadow-[0_0_20px_#ef233c,inset_0_0_10px_#ff8fa3]'
          : 'border-[#ef233c]/60 text-gray-200 hover:border-[#ef233c]';
      case 'snare':
      case 'rimshot':
        return isPressed
          ? 'bg-[#00f0ff] text-black shadow-[0_0_20px_#00f0ff,inset_0_0_10px_#b3faff]'
          : 'border-[#00f0ff]/60 text-gray-200 hover:border-[#00f0ff]';
      case 'clap':
        return isPressed
          ? 'bg-[#ffb703] text-black shadow-[0_0_20px_#ffb703,inset_0_0_10px_#ffe49e]'
          : 'border-[#ffb703]/60 text-gray-200 hover:border-[#ffb703]';
      case 'closed_hh':
      case 'open_hh':
        return isPressed
          ? 'bg-[#70e000] text-black shadow-[0_0_20px_#70e000,inset_0_0_10px_#ccff99]'
          : 'border-[#70e000]/60 text-gray-200 hover:border-[#70e000]';
      case 'crash':
      case 'ride':
        return isPressed
          ? 'bg-[#9d4edd] text-white shadow-[0_0_20px_#9d4edd,inset_0_0_10px_#d8bbff]'
          : 'border-[#9d4edd]/60 text-gray-200 hover:border-[#9d4edd]';
      default:
        // Toms & percussion
        return isPressed
          ? 'bg-[#ff006e] text-white shadow-[0_0_20px_#ff006e,inset_0_0_10px_#ff85b8]'
          : 'border-[#ff006e]/60 text-gray-200 hover:border-[#ff006e]';
    }
  };

  const handlePointerDown = (pad: DrumPadSound, e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    // Compute velocity from touch vertical position or fullLevel
    const rect = e.currentTarget.getBoundingClientRect();
    const touchRelY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    // Touching lower down = harder velocity (70 - 127)
    const velocity = fullLevel ? 127 : Math.round(70 + touchRelY * 57);

    triggerPad(pad.padNumber, velocity);
  };

  const handlePointerUp = (pad: DrumPadSound, e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    releasePad(pad.padNumber);
  };

  return (
    <div id="drum-pads-matrix" className="w-full h-full flex flex-col justify-center">
      {/* 2 Rows of 4 Velocity-Sensitive Performance Pads */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 w-full h-full">
        {padsList.map((pad, index) => {
          const isPressed = activePads.includes(pad.padNumber);
          const colorClasses = getPadColorStyle(pad.type, isPressed);

          return (
            <div
              key={pad.padNumber}
              id={`drum-pad-${pad.padNumber}`}
              onPointerDown={(e) => handlePointerDown(pad, e)}
              onPointerUp={(e) => handlePointerUp(pad, e)}
              onPointerCancel={(e) => handlePointerUp(pad, e)}
              className={`relative min-h-[62px] sm:min-h-[70px] md:min-h-[74px] h-full rounded-xl cursor-pointer touch-none select-none flex flex-col justify-between p-1.5 sm:p-2 border-2 transition-all duration-75 ${
                isPressed ? 'drum-pad-pressed scale-[0.98]' : 'drum-pad-base hover:brightness-110'
              } ${colorClasses}`}
            >
              {/* Corner Pad Number */}
              <div className="flex justify-between items-center w-full pointer-events-none">
                <span className="font-mono text-[9px] sm:text-[10px] font-bold opacity-75">
                  PAD {pad.padNumber}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] opacity-60">
                  #{pad.noteNumber}
                </span>
              </div>

              {/* Pad Name Center */}
              <div className="text-center font-tech font-black text-xs sm:text-sm md:text-base truncate tracking-wide pointer-events-none my-auto drop-shadow-sm">
                {pad.name}
              </div>

              {/* Pad Bottom Subtext (Instrument Type & PC Key shortcut e.g. 1..8) */}
              <div className="flex justify-between items-center w-full pointer-events-none">
                <span className="text-[8px] sm:text-[9px] font-tech uppercase font-bold opacity-70">
                  {pad.type.replace('_', ' ')}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-gray-300 bg-black/50 px-1.5 py-0.5 rounded border border-white/10 font-bold">
                  {padBank === 'A' ? `${index + 1}` : `Alt+${index + 1}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
