import React from 'react';
import { 
  FileCheck2, 
  LayoutGrid, 
  Box, 
  History, 
  Hammer, 
  Droplet, 
  Activity, 
  Sparkles,
  Check,
  Play
} from 'lucide-react';
import { DimensionLevel } from '../types';
import { DIMENSIONS_DATA } from '../data/mockSites';
import { soundFx } from '../utils/audio';

interface Dimension8DMatrixProps {
  activeDimensions: DimensionLevel[];
  onToggleDimension: (dim: DimensionLevel) => void;
  currentEpoch: string;
  epochs: string[];
  currentEpochIndex: number;
  onSelectEpochIndex: (idx: number) => void;
}

export const Dimension8DMatrix: React.FC<Dimension8DMatrixProps> = ({
  activeDimensions,
  onToggleDimension,
  currentEpoch,
  epochs,
  currentEpochIndex,
  onSelectEpochIndex,
}) => {
  const getIcon = (dim: DimensionLevel) => {
    switch (dim) {
      case 1: return <FileCheck2 className="w-4 h-4 text-emerald-400" />;
      case 2: return <LayoutGrid className="w-4 h-4 text-cyan-400" />;
      case 3: return <Box className="w-4 h-4 text-sky-400" />;
      case 4: return <History className="w-4 h-4 text-amber-400" />;
      case 5: return <Hammer className="w-4 h-4 text-orange-400" />;
      case 6: return <Droplet className="w-4 h-4 text-blue-400" />;
      case 7: return <Activity className="w-4 h-4 text-rose-400" />;
      case 8: return <Sparkles className="w-4 h-4 text-fuchsia-400" />;
    }
  };

  return (
    <div className="bg-[#090e1a]/95 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel'] font-bold text-base text-cyan-300 tracking-wider">
              8D DIMENSION TOMOGRAPHY SUITE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              8-th Inc Proprietary
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Multi-axial structural integration: Archival (1D) through Predictive AI Longevity (8D)
          </p>
        </div>

        {/* Quick activate all / reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playBlip(900);
              // Toggle all 8
              if (activeDimensions.length === 8) {
                // keep at least 2
                onToggleDimension(1);
              } else {
                [1, 2, 3, 4, 5, 6, 7, 8].forEach((d) => {
                  if (!activeDimensions.includes(d as DimensionLevel)) {
                    onToggleDimension(d as DimensionLevel);
                  }
                });
              }
            }}
            className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 transition"
          >
            {activeDimensions.length === 8 ? 'Active: All 8D Dimensions' : 'Synchronize All 8D Dimensions'}
          </button>
        </div>
      </div>

      {/* 4D Temporal Epoch Timeline Scrubber */}
      <div className="bg-slate-950/70 border border-slate-800/70 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-amber-400" />
            4D Temporal Strata Scrubber:
          </span>
          <span className="text-slate-200 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 font-bold">
            {epochs[currentEpochIndex]}
          </span>
        </div>

        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={epochs.length - 1}
            step={1}
            value={currentEpochIndex}
            onChange={(e) => {
              soundFx.playBlip(750);
              onSelectEpochIndex(parseInt(e.target.value));
            }}
            className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
            {epochs.map((epoch, idx) => (
              <span
                key={epoch}
                onClick={() => {
                  soundFx.playBlip(800);
                  onSelectEpochIndex(idx);
                }}
                className={`cursor-pointer transition ${
                  idx === currentEpochIndex ? 'text-amber-300 font-bold underline' : 'hover:text-slate-300'
                }`}
              >
                {epoch.split(' ')[0]} {epoch.split(' ')[1] || ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The 8 Dimensions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DIMENSIONS_DATA.map((item) => {
          const isActive = activeDimensions.includes(item.dimension as DimensionLevel);

          return (
            <div
              key={item.code}
              onClick={() => {
                soundFx.playBlip(isActive ? 500 : 700);
                onToggleDimension(item.dimension as DimensionLevel);
              }}
              className={`relative p-3 rounded-lg border text-left transition cursor-pointer select-none ${
                isActive
                  ? 'bg-slate-900/90 border-cyan-700/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/50 border-slate-850 opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    {getIcon(item.dimension as DimensionLevel)}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-cyan-400 tracking-wider">
                      {item.code}
                    </span>
                    <h4 className="font-mono text-xs font-semibold text-slate-200 leading-tight">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] transition ${
                    isActive
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                      : 'border-slate-700 text-transparent'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[11px] font-mono text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {item.subtitle}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">{item.metricLabel}</span>
                <span className="text-cyan-300 font-bold">{item.currentValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
