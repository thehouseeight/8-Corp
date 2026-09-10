import React from 'react';
import { 
  Radio, 
  Waves, 
  Activity, 
  Flame, 
  Compass, 
  Sliders, 
  Radar, 
  Layers,
  ArrowDown
} from 'lucide-react';
import { SpectralFilter, SoilStrataLayer } from '../types';
import { soundFx } from '../utils/audio';

interface SpectralFilterControlsProps {
  currentFilter: SpectralFilter;
  onChangeFilter: (filter: SpectralFilter) => void;
  depthZ: number;
  onChangeDepthZ: (z: number) => void;
  maxDepth: number;
  strata: SoilStrataLayer[];
  opacityBlend: number;
  onChangeOpacityBlend: (val: number) => void;
  wipePosition: number;
  onChangeWipePosition: (val: number) => void;
  viewMode: string;
  isScanning: boolean;
  onToggleScanning: () => void;
}

export const SpectralFilterControls: React.FC<SpectralFilterControlsProps> = ({
  currentFilter,
  onChangeFilter,
  depthZ,
  onChangeDepthZ,
  maxDepth,
  strata,
  opacityBlend,
  onChangeOpacityBlend,
  wipePosition,
  onChangeWipePosition,
  viewMode,
  isScanning,
  onToggleScanning,
}) => {
  // Find current strata layer based on absolute depth
  const absDepth = Math.abs(depthZ);
  const currentStrata = strata.find(
    s => absDepth >= s.depthRange[0] && absDepth <= s.depthRange[1]
  ) || strata[strata.length - 1];

  const filterOptions: { id: SpectralFilter; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'muon-xray',
      label: 'Muon Radiography',
      icon: <Radio className="w-3.5 h-3.5" />,
      color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40',
      desc: 'Penetrates 35m dense stone via cosmic muon scattering'
    },
    {
      id: 'gpr-radar',
      label: 'GPR (400-900MHz)',
      icon: <Radar className="w-3.5 h-3.5" />,
      color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
      desc: 'Ground penetrating electromagnetic radar for void detection'
    },
    {
      id: 'ultrasonic',
      label: 'Ultrasonic P-Wave',
      icon: <Waves className="w-3.5 h-3.5" />,
      color: 'text-sky-400 border-sky-500/50 bg-sky-950/40',
      desc: 'Acoustic wave impedance mapping compressive density'
    },
    {
      id: 'thermal-infrared',
      label: 'Thermal Infrared',
      icon: <Flame className="w-3.5 h-3.5" />,
      color: 'text-amber-400 border-amber-500/50 bg-amber-950/40',
      desc: 'Differential moisture evaporation & thermal heat gradients'
    },
    {
      id: 'cad-phosphor',
      label: 'CAD Phosphor',
      icon: <Compass className="w-3.5 h-3.5" />,
      color: 'text-blue-400 border-blue-500/50 bg-blue-950/40',
      desc: 'High-contrast monochrome vector drafting phosphor'
    },
    {
      id: 'composite-8d',
      label: '8D Multi-Spectral',
      icon: <Activity className="w-3.5 h-3.5" />,
      color: 'text-fuchsia-400 border-fuchsia-500/50 bg-fuchsia-950/40',
      desc: 'Unified fusion of all 8 dimension tomography matrices'
    }
  ];

  return (
    <div className="bg-[#090e1a]/95 border border-slate-800/90 rounded-xl p-3 shadow-xl backdrop-blur-md space-y-3">
      
      {/* Top Filter Selection Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Spectral X-Ray Filter:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                soundFx.playBlip(780);
                onChangeFilter(opt.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                currentFilter === opt.id
                  ? `${opt.color} shadow-sm font-semibold`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={opt.desc}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}

          {/* Laser Scanner Sweep Toggle */}
          <button
            onClick={() => {
              soundFx.playRadarSweep();
              onToggleScanning();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition ml-auto ${
              isScanning
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle active 8D radar scanner beam animation"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Scan: ACTIVE' : 'Scan: PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Sliders: Depth Z and Wipe / Opacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        
        {/* Subterranean Depth Slicer Z */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
              Subterranean Depth Slicer (Z):
            </span>
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              {depthZ.toFixed(1)} m
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">0.0m (Ground)</span>
            <input
              type="range"
              min={-maxDepth}
              max={0}
              step={0.5}
              value={depthZ}
              onChange={(e) => {
                onChangeDepthZ(parseFloat(e.target.value));
              }}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-500">-{maxDepth}m</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
            <span className="text-amber-400/90 font-medium truncate max-w-[280px]">
              Stratum: {currentStrata?.name || 'Bedrock Layer'}
            </span>
            <span className="text-slate-500 text-[10px]">
              {currentStrata?.shearModulusMPa} MPa • {currentStrata?.moisturePct}% H₂O
            </span>
          </div>
        </div>

        {/* Dynamic Second Slider: Split Wipe or Opacity Blend */}
        {viewMode === 'dual-split' ? (
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Split-Screen Wipe Position:
              </span>
              <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {wipePosition}% (Ancient vs CAD)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400">100% Ancient</span>
              <input
                type="range"
                min={0}
                max={100}
                value={wipePosition}
                onChange={(e) => onChangeWipePosition(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-sky-400">100% Modern</span>
            </div>

            <p className="text-[10px] font-mono text-slate-500">
              Drag to wipe between ancient foundation X-ray (Left) and modern structural CAD (Right).
            </p>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Modern Blueprint CAD Opacity:
              </span>
              <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {opacityBlend}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400">0% (Pure Ancient)</span>
              <input
                type="range"
                min={0}
                max={100}
                value={opacityBlend}
                onChange={(e) => onChangeOpacityBlend(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-sky-400">100% (Solid CAD)</span>
            </div>

            <p className="text-[10px] font-mono text-slate-500">
              Overlaying CAD blueprint lines directly on top of subterranean ancient masonry.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
