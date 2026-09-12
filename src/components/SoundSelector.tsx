import React, { useState } from 'react';
import { useMpkStore } from '../store/useMpkStore';
import { DRUM_KITS, GM_CATEGORIES, GM_PRESETS } from '../audio/soundList';

export const SoundSelector: React.FC = () => {
  const currentPresetId = useMpkStore((s) => s.currentPresetId);
  const currentPreset = useMpkStore((s) => s.currentPreset);
  const currentDrumKitId = useMpkStore((s) => s.currentDrumKitId);
  const currentDrumKit = useMpkStore((s) => s.currentDrumKit);
  const selectedCategory = useMpkStore((s) => s.selectedCategory);
  const setPreset = useMpkStore((s) => s.setPreset);
  const nextPreset = useMpkStore((s) => s.nextPreset);
  const prevPreset = useMpkStore((s) => s.prevPreset);
  const setDrumKit = useMpkStore((s) => s.setDrumKit);
  const nextDrumKit = useMpkStore((s) => s.nextDrumKit);
  const prevDrumKit = useMpkStore((s) => s.prevDrumKit);
  const setSelectedCategory = useMpkStore((s) => s.setSelectedCategory);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'instruments' | 'drums'>('instruments');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = GM_PRESETS.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="sound-selector-module" className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full bg-[#111317] px-2.5 py-1.5 rounded-lg border border-[#232731]">
      {/* Melodic Instrument Quick Switcher (50% width on sm+) */}
      <div className="flex items-center gap-1.5 w-full min-w-0">
        <span className="text-[9px] font-tech font-bold text-red-500 uppercase flex-shrink-0">PROG</span>
        <button
          onClick={prevPreset}
          title="Previous Sound Preset"
          className="w-6 h-7 rounded bg-[#1d2027] border border-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
        >
          ‹
        </button>

        {/* Clickable Preset Display Banner to open full 128 GM browser */}
        <div
          onClick={() => {
            setActiveTab('instruments');
            setIsOpenModal(true);
          }}
          className="flex-1 min-w-0 cursor-pointer bg-[#181a20] hover:bg-[#20232c] border border-gray-800 rounded px-2 py-0.5 sm:py-1 flex items-center justify-between transition-colors"
          title="Click to open Full 128 Sound Browser"
        >
          <div className="flex flex-col truncate min-w-0">
            <span className="text-xs font-bold text-white truncate font-tech">
              {String(currentPreset.id + 1).padStart(3, '0')}: {currentPreset.name}
            </span>
            <span className="text-[9px] text-gray-400 font-mono -mt-0.5 truncate">
              {currentPreset.category} • {currentPreset.waveform.toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] text-red-400 font-bold ml-1 flex-shrink-0">▼</span>
        </div>

        <button
          onClick={nextPreset}
          title="Next Sound Preset"
          className="w-6 h-7 rounded bg-[#1d2027] border border-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
        >
          ›
        </button>
      </div>

      {/* Drum Kit Quick Switcher (50% width on sm+) */}
      <div className="flex items-center gap-1.5 w-full min-w-0">
        <span className="text-[9px] font-tech font-bold text-[#00f0ff] uppercase flex-shrink-0">KIT</span>
        <button
          onClick={prevDrumKit}
          title="Previous Drum Kit"
          className="w-6 h-7 rounded bg-[#1d2027] border border-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
        >
          ‹
        </button>

        <div
          onClick={() => {
            setActiveTab('drums');
            setIsOpenModal(true);
          }}
          className="flex-1 min-w-0 cursor-pointer bg-[#181a20] hover:bg-[#20232c] border border-gray-800 rounded px-2 py-0.5 sm:py-1 flex items-center justify-between transition-colors"
          title="Click to choose Drum Kit"
        >
          <div className="flex flex-col truncate min-w-0">
            <span className="text-xs font-bold text-white truncate font-tech">
              {currentDrumKit.name}
            </span>
            <span className="text-[9px] text-[#00f0ff]/80 font-mono -mt-0.5 truncate">
              {currentDrumKit.style}
            </span>
          </div>
          <span className="text-[10px] text-[#00f0ff] font-bold ml-1 flex-shrink-0">▼</span>
        </div>

        <button
          onClick={nextDrumKit}
          title="Next Drum Kit"
          className="w-6 h-7 rounded bg-[#1d2027] border border-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
        >
          ›
        </button>
      </div>

      {/* Full Sound Browser Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#14171d] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#191d24]">
              <div className="flex items-center gap-3">
                <span className="font-tech font-bold text-white text-base tracking-wider">SOUND LIBRARY</span>
                <div className="flex rounded-md bg-[#101217] p-0.5 border border-gray-700">
                  <button
                    onClick={() => setActiveTab('instruments')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      activeTab === 'instruments'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    128 Instruments
                  </button>
                  <button
                    onClick={() => setActiveTab('drums')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      activeTab === 'drums'
                        ? 'bg-[#00f0ff] text-black font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    10 Drum Kits
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsOpenModal(false)}
                className="text-gray-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {activeTab === 'instruments' ? (
              <div className="flex flex-col flex-1 overflow-hidden p-3 gap-2.5">
                {/* Search & Category Pills */}
                <input
                  type="text"
                  placeholder="Search 128 GM instruments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0e1014] border border-gray-700 rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />

                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {GM_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap border ${
                        selectedCategory === cat
                          ? 'bg-red-600 border-red-500 text-white font-bold'
                          : 'bg-[#1a1d24] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Preset List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto flex-1 pr-1 max-h-96">
                  {filteredPresets.map((preset) => {
                    const isSelected = preset.id === currentPresetId;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setPreset(preset.id);
                          setIsOpenModal(false);
                        }}
                        className={`p-2 rounded-md cursor-pointer border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-red-950/50 border-red-500 text-white shadow-[0_0_8px_rgba(239,35,60,0.3)]'
                            : 'bg-[#181b22] border-gray-800/80 text-gray-300 hover:bg-[#222631] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-red-400 font-semibold w-8">
                            #{String(preset.id + 1).padStart(3, '0')}
                          </span>
                          <span className="font-tech text-xs font-bold">{preset.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {preset.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 overflow-y-auto max-h-96">
                {DRUM_KITS.map((kit) => {
                  const isSelected = kit.id === currentDrumKitId;
                  return (
                    <div
                      key={kit.id}
                      onClick={() => {
                        setDrumKit(kit.id);
                        setIsOpenModal(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer border flex flex-col gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#002b33] border-[#00f0ff] text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                          : 'bg-[#181b22] border-gray-800 text-gray-300 hover:bg-[#222631] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-tech font-bold text-sm text-white">
                          {kit.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#00f0ff]">
                          KIT {kit.id + 1}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {kit.style}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-800">
                        <span>Sub: {Math.round(kit.sub * 100)}%</span>
                        <span>Snappy: {Math.round(kit.snappy * 100)}%</span>
                        <span>Pitch: {kit.pitch > 0 ? `+${kit.pitch}` : kit.pitch}st</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
