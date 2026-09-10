import React, { useState } from 'react';
import { 
  Crosshair, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  Layers, 
  Activity, 
  ExternalLink,
  Loader2,
  FileCheck
} from 'lucide-react';
import { ProbePoint, SiteProject, DimensionLevel, SpectralFilter } from '../types';
import { soundFx } from '../utils/audio';

interface ProbeInspectorPanelProps {
  probe: ProbePoint | null;
  site: SiteProject;
  filter: SpectralFilter;
  activeDimensions: DimensionLevel[];
  onTriggerDeepAnalysis: (probe: ProbePoint) => void;
  isAnalyzing: boolean;
  aiAnalysisResult: string | null;
}

export const ProbeInspectorPanel: React.FC<ProbeInspectorPanelProps> = ({
  probe,
  site,
  filter,
  activeDimensions,
  onTriggerDeepAnalysis,
  isAnalyzing,
  aiAnalysisResult,
}) => {
  if (!probe) {
    return (
      <div className="bg-[#090e1a]/95 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md text-center flex flex-col items-center justify-center min-h-[320px] text-slate-400 font-mono space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
          <Crosshair className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-slate-200 font-bold text-sm">8D TELEMETRY PROBE READY</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Click anywhere on the X-Ray blueprint viewport above to drop an active probe reticle and inspect subterranean structural data.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            • Instant clash detection
          </span>
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            • Ancient stone MPa rating
          </span>
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            • AI structural restoration audit
          </span>
        </div>
      </div>
    );
  }

  const hasConflict = Boolean(probe.activeConflict);

  return (
    <div className="bg-[#090e1a]/95 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            hasConflict 
              ? 'bg-rose-950/60 border-rose-700/60 text-rose-400' 
              : 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
          }`}>
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs font-bold text-slate-100">
                PROBE TELEMETRY: [X:{probe.x}m, Y:{probe.y}m, Z:{probe.z}m]
              </h3>
              {hasConflict ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700">
                  CLASH DETECTED
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  CLEARANCE NOMINAL
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Stratum: {probe.soilLayer?.name || 'Subterranean Bedrock'}
            </p>
          </div>
        </div>

        {/* AI Analysis Trigger */}
        <button
          onClick={() => {
            soundFx.playRadarSweep();
            onTriggerDeepAnalysis(probe);
          }}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold transition disabled:opacity-50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing 8D...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>AI Restoration Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Conflict Warning Box if detected */}
      {probe.activeConflict && (
        <div className="bg-rose-950/40 border border-rose-600/70 rounded-lg p-3 space-y-1.5 animate-pulse">
          <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{probe.activeConflict.title}</span>
          </div>
          <p className="text-[11px] font-mono text-rose-200/90 leading-relaxed">
            {probe.activeConflict.description}
          </p>
          <div className="pt-1 text-[11px] font-mono text-amber-300 bg-black/40 p-2 rounded border border-amber-500/40">
            <strong className="text-amber-400">Restoration Solution:</strong> {probe.activeConflict.reconstructionSolution}
          </div>
        </div>
      )}

      {/* Dual Layer Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Ancient Foundation Stratum Details */}
        <div className="bg-slate-950/70 border border-amber-900/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-amber-950/80 pb-1.5">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-amber-400" />
              ANCIENT FOUNDATION FABRIC
            </span>
            {probe.ancientElement && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {probe.ancientElement.century}
              </span>
            )}
          </div>

          {probe.ancientElement ? (
            <div className="space-y-1 text-xs font-mono">
              <div className="text-slate-200 font-semibold">{probe.ancientElement.name}</div>
              <div className="text-[11px] text-slate-400">Epoch: <span className="text-slate-200">{probe.ancientElement.epoch}</span></div>
              <div className="text-[11px] text-slate-400">Material: <span className="text-slate-200">{probe.ancientElement.material}</span></div>
              <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px]">
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Compressive Str</span>
                  <span className="text-amber-300 font-bold">{probe.ancientElement.compressiveStrengthMPa} MPa</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Integrity Factor</span>
                  <span className="text-emerald-400 font-bold">{probe.ancientElement.preservationIndexPct}%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-900">
                "{probe.ancientElement.notes}"
              </p>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 py-3 text-center">
              No historical masonry at this exact coordinate. Native strata cushion zone.
            </div>
          )}
        </div>

        {/* Modern Structural Blueprint Component */}
        <div className="bg-slate-950/70 border border-cyan-900/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-1.5">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-cyan-400" />
              MODERN STRUCTURAL COMPONENT
            </span>
            {probe.modernElement && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {probe.modernElement.gridRef}
              </span>
            )}
          </div>

          {probe.modernElement ? (
            <div className="space-y-1 text-xs font-mono">
              <div className="text-slate-200 font-semibold">{probe.modernElement.type.toUpperCase()} SPECIFICATION</div>
              <div className="text-[11px] text-slate-400">Spec: <span className="text-slate-200">{probe.modernElement.material}</span></div>
              <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px]">
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Axial Load</span>
                  <span className="text-cyan-300 font-bold">{Math.round(probe.modernElement.axialLoadKN / 1000)}k kN</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Safety Factor</span>
                  <span className="text-sky-300 font-bold">{probe.modernElement.safetyFactor}x Eurocode</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                Depth Span: {probe.modernElement.depthMinM}m to {probe.modernElement.depthMaxM}m
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 py-3 text-center">
              Clear modern structural buffer corridor (&gt;2.5m from nearest pile).
            </div>
          )}
        </div>

      </div>

      {/* AI Analysis Preview if generated */}
      {aiAnalysisResult && (
        <div className="bg-slate-950 border border-cyan-800/80 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>THE HOUSE EIGHTH • 8D RESTORATION DIRECTIVE</span>
          </div>
          <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-1">
            {aiAnalysisResult}
          </div>
        </div>
      )}
    </div>
  );
};
