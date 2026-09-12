import React from 'react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#101318] border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171b22] border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef233c] shadow-[0_0_8px_#ef233c]" />
            <h2 className="font-tech font-bold text-white text-base sm:text-lg tracking-wider">
              STUDIO SYNTH WORKSTATION • 操作マニュアル & ガイド
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/manual.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-[#1e232d] hover:bg-[#282f3c] text-[#00f0ff] border border-[#2d3648] text-xs font-tech font-bold uppercase transition-colors"
            >
              別タブで開く ↗
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-mono text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded Manual */}
        <div className="flex-1 w-full bg-[#0b0d11] overflow-hidden">
          <iframe
            src="/manual.html"
            title="User Manual and Tutorial"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
