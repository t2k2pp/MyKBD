import React, { useEffect, useRef, useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';

export const Joystick: React.FC = () => {
  const setJoystick = useMpkStore((s) => s.setJoystick);
  const joystickState = useMpkStore((s) => s.joystick);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // normalized -1 to +1

  // Spring back to center animation on release
  const springAnimationRef = useRef<number | null>(null);

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = (rect.width / 2) * 0.75;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.hypot(deltaX, deltaY);
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    const normX = deltaX / maxRadius; // -1 to +1
    const normY = -(deltaY / maxRadius); // Inverted so UP is positive

    setPos({ x: normX, y: normY });
    setJoystick(normX, normY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (springAnimationRef.current) {
      cancelAnimationFrame(springAnimationRef.current);
      springAnimationRef.current = null;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    setIsDragging(false);

    // Spring return animation
    const startX = pos.x;
    const startY = pos.y;
    const startTime = performance.now();
    const duration = 180; // 180ms spring return

    const animateSpring = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Damped harmonic ease
      const ease = 1 - Math.cos((progress * Math.PI) / 2);

      const currentX = startX * (1 - ease);
      const currentY = startY * (1 - ease);

      setPos({ x: currentX, y: currentY });
      setJoystick(currentX, currentY);

      if (progress < 1) {
        springAnimationRef.current = requestAnimationFrame(animateSpring);
      } else {
        setPos({ x: 0, y: 0 });
        setJoystick(0, 0);
        springAnimationRef.current = null;
      }
    };

    springAnimationRef.current = requestAnimationFrame(animateSpring);
  };

  // Synchronize if reset externally
  useEffect(() => {
    if (!isDragging && (joystickState.x === 0 && joystickState.y === 0)) {
      setPos({ x: 0, y: 0 });
    }
  }, [joystickState, isDragging]);

  const maxOffsetPx = 25;
  const thumbTranslateX = pos.x * maxOffsetPx;
  const thumbTranslateY = -pos.y * maxOffsetPx;

  return (
    <div id="joystick-control" className="flex flex-col items-center justify-center select-none flex-shrink-0">
      <div className="flex items-center justify-center w-full mb-1">
        <span className="text-[9px] sm:text-[10px] font-tech font-bold text-gray-300 tracking-wider">
          PITCH / MOD
        </span>
      </div>

      {/* Outer Well Collar - Enlarged for touch and presence */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        title="4-Way Expressive Joystick: X = Pitch Bend (±2 semitones), Y Up = Vibrato Mod, Y Down = Filter Mod"
        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-gradient-to-b from-[#0b0c0e] to-[#1e222a] border-2 border-[#2b2f38] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_2px_6px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        {/* Direction Guidelines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-full h-[1px] bg-red-500" />
          <div className="absolute h-full w-[1px] bg-cyan-400" />
        </div>

        {/* Axis Labels */}
        <span className="absolute top-1 text-[8px] sm:text-[9px] font-mono font-bold text-cyan-400/80 pointer-events-none">
          VIB
        </span>
        <span className="absolute bottom-1 text-[8px] sm:text-[9px] font-mono font-bold text-amber-400/80 pointer-events-none">
          FLT
        </span>
        <span className="absolute left-1.5 text-[8px] sm:text-[9px] font-mono font-bold text-red-500/80 pointer-events-none">
          -P
        </span>
        <span className="absolute right-1.5 text-[8px] sm:text-[9px] font-mono font-bold text-red-500/80 pointer-events-none">
          +P
        </span>

        {/* Signature Red Thumbstick Cap - Enlarged with tactile grip */}
        <div
          className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#ff334b] via-[#ef233c] to-[#a30018] shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.4)] border-2 border-[#ff5e72] flex items-center justify-center transition-transform ${
            isDragging ? 'scale-105 shadow-[0_0_14px_rgba(239,35,60,0.9)]' : ''
          }`}
          style={{
            transform: `translate(${thumbTranslateX}px, ${thumbTranslateY}px)`,
          }}
        >
          {/* Concentric grip rings on thumbstick */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-tr from-[#990014] to-[#ff475e] shadow-inner" />
          </div>
        </div>
      </div>

      {/* Coordinate readout */}
      <div className="flex gap-2 font-mono text-[8px] sm:text-[9px] text-gray-400 mt-1">
        <span>X:{pos.x >= 0 ? `+${pos.x.toFixed(1)}` : pos.x.toFixed(1)}</span>
        <span>Y:{pos.y >= 0 ? `+${pos.y.toFixed(1)}` : pos.y.toFixed(1)}</span>
      </div>
    </div>
  );
};
