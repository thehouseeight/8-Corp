import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Building2,
  FileText,
  Loader2
} from 'lucide-react';
import { SiteProject, ProbePoint, DimensionLevel } from '../types';
import { soundFx } from '../utils/audio';

interface DeepAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteProject;
  probe: ProbePoint | null;
  aiReport: string | null;
  onRunAudit: () => void;
  isAnalyzing: boolean;
}

export const DeepAnalysisModal: React.FC<DeepAnalysisModalProps> = ({
  isOpen,
  onClose,
  site,
  probe,
  aiReport,
  onRunAudit,
  isAnalyzing,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playBlip(720);
    window.print();
  };

  const handleDownload = () => {
    soundFx.playBlip(800);
    const content = `THE HOUSE EIGHTH (8-th Inc) - RECONSTRUCTION OF FUTURE
8D DIMENSION X-RAY STRATIGRAPHY & RESTORATION DOSSIER
======================================================
PROJECT: ${site.name} (${site.code})
DESIGNATION: ${site.designation}
LOCATION: ${site.city}, ${site.country} [${site.coordinatesGeo}]
DATE: ${new Date().toLocaleDateString()}
METROLOGY CALIBRATION: ${site.scaleRatio}

SUMMARY:
${site.summary}

RESTORATION VISION:
${site.restorationVision}

ACTIVE CONFLICTS DETECTED: ${site.conflicts.length}
${site.conflicts.map((c, i) => `[CONFLICT ${i+1}] ${c.title}\nSeverity: ${c.severity.toUpperCase()}\nOverlap: ${c.overlapM}m\nSolution: ${c.reconstructionSolution}\n`).join('\n')}

AI STRATIGRAPHIC & STRUCTURAL AUDIT:
${aiReport || 'Nominal clearance verified across primary structural axis.'}

ICOMOS CHARTER COMPLIANCE: Certified Reversible Underpinning
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${site.code}-8D-Restoration-Dossier.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#070c16] border border-cyan-800/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-['Cinzel'] font-bold text-base">
              8
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel'] font-bold text-lg text-slate-100 tracking-wider">
                  THE HOUSE EIGHTH
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  8-th Inc
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-400">
                8D Dimension X-Ray Architectural Restoration Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition"
              title="Download technical dossier text"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition"
              title="Print architectural report"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => {
                soundFx.playBlip(500);
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
          
          {/* Site & Calibration Metadata Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Project Classification: {site.code}
                </span>
                <h3 className="text-base font-bold text-slate-100 font-['Cinzel']">
                  {site.name}
                </h3>
              </div>
              <div className="text-right text-slate-400 text-[11px]">
                <div>{site.city}, {site.country}</div>
                <div className="text-cyan-400">{site.coordinatesGeo}</div>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {site.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Grid Span</span>
                <span className="text-slate-200 font-bold">{site.gridDimensions.widthM}m × {site.gridDimensions.lengthM}m</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Max Strata Depth</span>
                <span className="text-cyan-300 font-bold">-{site.gridDimensions.maxDepthM}m Bedrock</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Ancient Elements</span>
                <span className="text-amber-400 font-bold">{site.historicalFoundations.length} Detected</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Active Clashes</span>
                <span className={site.conflicts.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {site.conflicts.length} Conflicts
                </span>
              </div>
            </div>
          </div>

          {/* Structural Conflict & Resolution Audit */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              FOUNDATION-BLUEPRINT INTERSECTION CONFLICT AUDIT
            </h4>

            {site.conflicts.length > 0 ? (
              <div className="space-y-2.5">
                {site.conflicts.map((c, i) => (
                  <div key={c.id} className="bg-slate-950 border border-rose-900/70 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        CLASH #{i+1}: {c.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        SEVERITY: {c.severity.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-400 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="bg-slate-900/90 border border-amber-600/50 rounded-lg p-2.5 text-amber-200 leading-relaxed">
                      <strong className="text-amber-400">Recommended 8-th Restorative Intervention: </strong>
                      {c.reconstructionSolution}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-4 flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Zero structural clashes detected. All modern bored piles maintain required safety clearance buffer (&gt;1.5m) from ancient masonry.</span>
              </div>
            )}
          </div>

          {/* AI-Generated Stratigraphic Synthesis (Gemini 3.8 Flash) */}
          <div className="bg-slate-950 border border-cyan-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>8D DIMENSION DEEP RECONSTRUCTION SYNTHESIS</span>
              </div>
              <button
                onClick={onRunAudit}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-mono font-semibold transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Re-Run Gemini 3.8 Audit</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/80 p-4 rounded-lg border border-slate-800/80 max-h-96 overflow-y-auto">
              {aiReport || `Generating 8D architectural analysis... Click "Re-Run Gemini 3.8 Audit" to synthesize instant structural restoration directives.`}
            </div>
          </div>

          {/* Compliance & Charter Assurance */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-slate-400">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-slate-200 font-bold block">
                ICOMOS Charter & UNESCO Subterranean Heritage Standard
              </span>
              <p className="leading-relaxed text-[11px]">
                All structural proposals formulated by The House Eighth (8-th Inc) satisfy the International Principles for the Preservation and Restoration of Historic Foundations. All interventions are strictly reversible, vibration-isolated, and ensure non-destructive moisture equilibrium across ancient masonry strata.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-slate-500 text-[11px] font-mono">
          <span>THE HOUSE EIGHTH • RECONSTRUCTION OF FUTURE • 8-TH INC</span>
          <button
            onClick={() => {
              soundFx.playBlip(500);
              onClose();
            }}
            className="px-4 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
