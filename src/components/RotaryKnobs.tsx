import React, { useRef, useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';
import { SynthParams } from '../types';

interface KnobProps {
  id: string;
  label: string;
  subLabel: string;
  value: number; // 0 to 127
  defaultValue: number;
  unit?: string;
  onChange: (val: number) => void;
}

const SingleKnob: React.FC<KnobProps> = ({
  id,
  label,
  subLabel,
  value,
  defaultValue,
  unit = '',
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(0);

  // Knob rotation angle: -135deg to +135deg (total 270deg sweep)
  const angle = -135 + (value / 127) * 270;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartValue.current = value;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = dragStartY.current - e.clientY; // Dragging UP increases value
    const sensitivity = e.shiftKey ? 0.3 : 1.0;
    const deltaVal = (deltaY * sensitivity * 127) / 140;
    const nextVal = Math.max(0, Math.min(127, Math.round(dragStartValue.current + deltaVal)));
    onChange(nextVal);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  return (
    <div id={id} className="flex flex-col items-center select-none group">
      {/* Knob Header Labels */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-200 tracking-wider uppercase truncate max-w-[65px]">
          {label}
        </span>
        <span className="text-[8px] text-red-500 font-mono font-bold uppercase tracking-tight">
          {subLabel}
        </span>
      </div>

      {/* Row: Left numeric readout + Rotary dial */}
      <div className="flex items-center gap-1.5 sm:gap-2 my-0.5">
        {/* Numeric value readout on the left */}
        <div className="font-mono text-[10px] sm:text-xs text-[#00f0ff] font-bold px-1.5 py-0.5 rounded bg-black/60 border border-gray-800/80 min-w-[32px] text-center shadow-inner">
          {value}
        </div>

        {/* Dial Body Container */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          title={`${label} (${subLabel}): ${value}${unit}. Drag up/down to adjust, double-click to reset.`}
          className="relative w-11 h-11 sm:w-12 sm:h-12 cursor-ns-resize touch-none flex items-center justify-center"
        >
          {/* Outer Circular Scale Track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
            {/* Background arc */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#21242b"
              strokeWidth="3.5"
              strokeDasharray="94 130"
              strokeLinecap="round"
            />
            {/* Value active arc */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={isDragging ? '#ef233c' : '#00f0ff'}
              strokeWidth="3.5"
              strokeDasharray={`${(value / 127) * 94} 130`}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>

          {/* 3D Knurled Metallic Knob Body */}
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#323640] via-[#20232a] to-[#121417] shadow-[0_3px_5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-[#3e434f] flex items-center justify-center transition-transform duration-75 ${
              isDragging ? 'scale-105 border-red-500/80 shadow-[0_0_8px_rgba(239,35,60,0.5)]' : ''
            }`}
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {/* Top marker indicator line */}
            <div className="w-1 h-3.5 bg-red-500 rounded-full -translate-y-2 shadow-[0_0_4px_#ef233c]" />

            {/* Center metallic insert cap */}
            <div className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-[#16181d] to-[#2a2d36] border border-black/60 shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RotaryKnobs: React.FC = () => {
  const synthParams = useMpkStore((s) => s.synthParams);
  const knobMode = useMpkStore((s) => s.knobMode);
  const updateParam = useMpkStore((s) => s.updateParam);
  const toggleKnobMode = useMpkStore((s) => s.toggleKnobMode);

  const mode1Config: {
    param: keyof SynthParams;
    label: string;
    subLabel: string;
    defaultValue: number;
  }[] = [
    { param: 'filterCutoff', label: 'Cutoff', subLabel: 'Filter', defaultValue: 110 },
    { param: 'filterResonance', label: 'Resonance', subLabel: 'Filter Q', defaultValue: 20 },
    { param: 'reverbAmount', label: 'Reverb', subLabel: 'DSP FX 1', defaultValue: 38 },
    { param: 'chorusAmount', label: 'Chorus', subLabel: 'DSP FX 2', defaultValue: 18 },
  ];

  const mode2Config: {
    param: keyof SynthParams;
    label: string;
    subLabel: string;
    defaultValue: number;
  }[] = [
    { param: 'attack', label: 'Attack', subLabel: 'Env ADSR', defaultValue: 10 },
    { param: 'release', label: 'Release', subLabel: 'Env ADSR', defaultValue: 30 },
    { param: 'eqLow', label: 'EQ Low', subLabel: '180 Hz', defaultValue: 64 },
    { param: 'eqHigh', label: 'EQ High', subLabel: '4.5 kHz', defaultValue: 64 },
  ];

  const activeConfig = knobMode === 1 ? mode1Config : mode2Config;

  return (
    <div id="rotary-knobs-section" className="w-full flex items-center justify-between gap-2 sm:gap-4 bg-[#111317] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#262a33] shadow-inner">
      {/* 4 Encoders */}
      <div className="flex-1 flex items-center justify-around gap-2 sm:gap-4">
        {activeConfig.map((k, index) => (
          <SingleKnob
            key={`${knobMode}-${k.param}`}
            id={`encoder-knob-${index + 1}`}
            label={k.label}
            subLabel={k.subLabel}
            value={synthParams[k.param]}
            defaultValue={k.defaultValue}
            onChange={(val) => updateParam(k.param, val)}
          />
        ))}
      </div>

      {/* Mode Switch Button (Internal Synth vs Env/Mix) */}
      <div className="flex flex-col items-center justify-center pl-2 sm:pl-3 border-l border-gray-800">
        <button
          id="btn-knob-mode-toggle"
          onClick={toggleKnobMode}
          title="Switch Knob Assignment (Mode 1: Filter/DSP vs Mode 2: Env/EQ)"
          className={`flex flex-col items-center justify-center px-2 sm:px-2.5 py-1.5 rounded-md border text-[9px] font-tech font-bold uppercase transition-all cursor-pointer ${
            knobMode === 1
              ? 'bg-[#1e222b] border-[#ef233c] text-white shadow-[0_0_8px_rgba(239,35,60,0.3)]'
              : 'bg-[#1b252d] border-[#00f0ff] text-white shadow-[0_0_8px_rgba(0,240,255,0.3)]'
          }`}
        >
          <span className="text-[9px] sm:text-[10px] text-gray-400">MODE</span>
          <span className={knobMode === 1 ? 'text-[#ef233c]' : 'text-[#00f0ff]'}>
            {knobMode === 1 ? 'SYNTH' : 'ENV/EQ'}
          </span>
          <div className="flex gap-1 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${knobMode === 1 ? 'bg-[#ef233c] shadow-[0_0_4px_#ef233c]' : 'bg-gray-700'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${knobMode === 2 ? 'bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]' : 'bg-gray-700'}`} />
          </div>
        </button>
      </div>
    </div>
  );
};
