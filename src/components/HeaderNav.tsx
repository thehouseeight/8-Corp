import React from 'react';
import { 
  Scan, 
  Layers, 
  Split, 
  Eye, 
  Upload, 
  Volume2, 
  VolumeX, 
  Cpu, 
  FileText, 
  Building2,
  ChevronDown
} from 'lucide-react';
import { SiteProject, ViewMode } from '../types';
import { soundFx } from '../utils/audio';

interface HeaderNavProps {
  currentSite: SiteProject;
  sites: SiteProject[];
  onSelectSite: (site: SiteProject) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  conflictCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentSite,
  sites,
  onSelectSite,
  viewMode,
  onChangeViewMode,
  soundEnabled,
  onToggleSound,
  onOpenUpload,
  onOpenReport,
  conflictCount,
}) => {
  return (
    <header className="border-b border-cyan-950/60 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-900/60 to-slate-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="font-['Cinzel'] font-black text-cyan-400 text-lg tracking-wider">8</span>
            <div className="absolute inset-0 rounded-lg border border-cyan-400/20 animate-pulse pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Cinzel'] font-bold text-base md:text-lg text-slate-100 tracking-wider">
                THE HOUSE EIGHTH
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                8-th Inc
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-400/80 tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              RECONSTRUCTION OF FUTURE • 8D X-RAY STRATA
            </p>
          </div>
        </div>

        {/* Site Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              id="site-selector-dropdown"
              value={currentSite.id}
              onChange={(e) => {
                const target = sites.find(s => s.id === e.target.value);
                if (target) {
                  soundFx.playBlip(720);
                  onSelectSite(target);
                }
              }}
              className="appearance-none bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg px-3 py-1.5 pr-8 text-xs font-mono focus:outline-none focus:border-cyan-500 transition cursor-pointer shadow-inner"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.code} : {site.name} ({site.city})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Conflicts Badge */}
          {conflictCount > 0 ? (
            <div 
              onClick={onOpenReport}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-600/50 text-amber-300 text-[11px] font-mono cursor-pointer hover:bg-amber-900/60 transition"
              title="Click to view structural conflict report"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{conflictCount} CONFLICTS DETECTED</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CLEARANCE NOMINAL</span>
            </div>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            id="view-mode-split"
            onClick={() => {
              soundFx.playBlip(600);
              onChangeViewMode('dual-split');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
              viewMode === 'dual-split'
                ? 'bg-cyan-600/90 text-white font-medium shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Split-Screen Wipe: Drag slider to wipe between Ancient Foundations and Modern Blueprint"
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Wipe</span>
          </button>

          <button
            id="view-mode-overlay"
            onClick={() => {
              soundFx.playBlip(650);
              onChangeViewMode('overlay-blend');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
              viewMode === 'overlay-blend'
                ? 'bg-cyan-600/90 text-white font-medium shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Overlay Blend: Multi-layer transparency overlay"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Blend Overlay</span>
          </button>

          <button
            id="view-mode-xray"
            onClick={() => {
              soundFx.playBlip(700);
              onChangeViewMode('xray-strata');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
              viewMode === 'xray-strata'
                ? 'bg-amber-600/90 text-white font-medium shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="8D X-Ray Strata: Ancient archaeological foundations only"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">X-Ray Strata</span>
          </button>

          <button
            id="view-mode-cad"
            onClick={() => {
              soundFx.playBlip(750);
              onChangeViewMode('blueprint-cad');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
              viewMode === 'blueprint-cad'
                ? 'bg-sky-600/90 text-white font-medium shadow-[0_0_10px_rgba(2,132,199,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Modern Blueprint: CAD structural grid & piling layout only"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Blueprint CAD</span>
          </button>

          <button
            id="view-mode-cross"
            onClick={() => {
              soundFx.playBlip(800);
              onChangeViewMode('cross-section');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
              viewMode === 'cross-section'
                ? 'bg-purple-600/90 text-white font-medium shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Subterranean Z-Elevation Profile Cutaway"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Z-Elevation</span>
          </button>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            id="audio-toggle-btn"
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) soundFx.playBlip(880);
            }}
            className={`p-1.5 rounded-lg border text-xs transition ${
              soundEnabled
                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Sonar Sound FX' : 'Enable Sonar Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Upload Blueprint button */}
          <button
            id="upload-blueprint-btn"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-200 transition"
            title="Import custom architectural blueprint or ancient scan data"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Import Blueprint</span>
          </button>

          {/* Report / AI Dossier button */}
          <button
            id="open-report-btn"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-medium shadow-[0_0_12px_rgba(6,182,212,0.35)] transition"
            title="Open 8D Architectural Restoration Dossier & AI Synthesis"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>8D Dossier</span>
          </button>
        </div>

      </div>
    </header>
  );
};
