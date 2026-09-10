import React, { useState, useEffect } from 'react';
import { 
  SiteProject, 
  ViewMode, 
  SpectralFilter, 
  DimensionLevel, 
  ProbePoint 
} from './types';
import { INITIAL_SITES } from './data/mockSites';
import { HeaderNav } from './components/HeaderNav';
import { SpectralFilterControls } from './components/SpectralFilterControls';
import { XRayScannerCanvas } from './components/XRayScannerCanvas';
import { CrossSectionView } from './components/CrossSectionView';
import { Dimension8DMatrix } from './components/Dimension8DMatrix';
import { ProbeInspectorPanel } from './components/ProbeInspectorPanel';
import { DeepAnalysisModal } from './components/DeepAnalysisModal';
import { BlueprintUploadModal } from './components/BlueprintUploadModal';
import { soundFx } from './utils/audio';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Droplet, 
  ShieldCheck, 
  Compass, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [sites, setSites] = useState<SiteProject[]>(INITIAL_SITES);
  const [currentSite, setCurrentSite] = useState<SiteProject>(INITIAL_SITES[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('dual-split');
  const [filter, setFilter] = useState<SpectralFilter>('composite-8d');
  const [depthZ, setDepthZ] = useState<number>(-12.4);
  const [opacityBlend, setOpacityBlend] = useState<number>(75);
  const [wipePosition, setWipePosition] = useState<number>(50);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeDimensions, setActiveDimensions] = useState<DimensionLevel[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [currentEpochIndex, setCurrentEpochIndex] = useState<number>(3);
  const [selectedProbe, setSelectedProbe] = useState<ProbePoint | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Initialize first probe on first load
  useEffect(() => {
    if (!selectedProbe && currentSite.conflicts.length > 0) {
      const initialConflict = currentSite.conflicts[0];
      setSelectedProbe({
        x: initialConflict.x,
        y: initialConflict.y,
        z: initialConflict.depthZ,
        surfaceGroundLevelM: 0,
        activeConflict: initialConflict,
        ancientElement: currentSite.historicalFoundations.find(f => f.id === initialConflict.ancientId),
        modernElement: currentSite.modernBlueprints.find(m => m.id === initialConflict.modernId),
        soilLayer: currentSite.strata[2],
        moisturePct: 31,
        vibrationHz: 1.24,
        bearingCapacityKPa: 2200,
      });
    }
  }, [currentSite]);

  // Audio mute sync
  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Toggle active dimension
  const toggleDimension = (dim: DimensionLevel) => {
    if (activeDimensions.includes(dim)) {
      if (activeDimensions.length > 1) {
        setActiveDimensions(prev => prev.filter(d => d !== dim));
      }
    } else {
      setActiveDimensions(prev => [...prev, dim].sort());
    }
  };

  // Switch site
  const handleSelectSite = (site: SiteProject) => {
    setCurrentSite(site);
    setCurrentEpochIndex(site.currentEpochIndex);
    setSelectedProbe(null);
    setAiAnalysisResult(null);
  };

  // Import custom blueprint
  const handleImportSite = (newSite: SiteProject) => {
    setSites(prev => [newSite, ...prev]);
    setCurrentSite(newSite);
    setCurrentEpochIndex(newSite.currentEpochIndex);
    setSelectedProbe(null);
  };

  // Trigger server-side AI Analysis
  const runDeepAnalysis = async (probeTarget?: ProbePoint) => {
    const probe = probeTarget || selectedProbe;
    setIsAnalyzing(true);
    soundFx.playRadarSweep();

    try {
      const payload = {
        siteName: currentSite.name,
        location: `${currentSite.city}, ${currentSite.country}`,
        coordinates: { x: probe?.x ?? 25, y: probe?.y ?? 25, z: depthZ },
        historicalLayer: probe?.ancientElement || currentSite.historicalFoundations[0],
        modernFoundation: probe?.modernElement || currentSite.modernBlueprints[0],
        spectralFilter: filter,
        activeDimensions: activeDimensions.map(d => `${d}D`),
        conflictDetected: Boolean(probe?.activeConflict),
        shearStressMPa: probe?.ancientElement?.compressiveStrengthMPa ?? 24.5,
        moistureSaturationPct: probe?.soilLayer?.moisturePct ?? 28,
        soilStrata: probe?.soilLayer?.name ?? currentSite.strata[1].name,
      };

      const response = await fetch('/api/analyze-strata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setAiAnalysisResult(data.analysis);
      soundFx.playBlip(980);
    } catch (err: any) {
      console.warn('Fallback analysis active:', err);
      // Deterministic engineering fallback
      setAiAnalysisResult(
        `[THE HOUSE EIGHTH • HEURISTIC RESTORATION AUDIT]\n\n` +
        `1. STRATIGRAPHIC SYNTHESIS:\n` +
        `Target coordinate [X:${probe?.x ?? 25}m, Y:${probe?.y ?? 25}m, Depth ${depthZ}m] reveals direct structural juxtaposition between the ${currentSite.historicalFoundations[0]?.name} and modern structural piling.\n\n` +
        `2. STRUCTURAL CONFLICT & LOAD COUPLING:\n` +
        `${probe?.activeConflict ? `CRITICAL INTERFERENCE: ${probe.activeConflict.description} Axial eccentric load threatens historic arch integrity.` : 'Clearance buffer nominal. Zero vibration-induced micro-fractures detected.'}\n\n` +
        `3. REVERSIBLE RESTORATION DIRECTIVE:\n` +
        `• Implement non-invasive jet-grouting perimeter envelope.\n` +
        `• Deploy post-tensioned bridge grade beam with elastomeric neoprene dampening pads.\n` +
        `• Retain 100% of ancient masonry in situ with reversible lime-pozzolana injection.\n\n` +
        `4. 8-TH RECONSTRUCTION OF FUTURE PERSPECTIVE:\n` +
        `Achieves seamless aesthetic and structural coexistence between ancient heritage and modern urban skyscrapers.`
      );
      soundFx.playBlip(880);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation Bar */}
      <HeaderNav
        currentSite={currentSite}
        sites={sites}
        onSelectSite={handleSelectSite}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        conflictCount={currentSite.conflicts.length}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        
        {/* Spectral Filter & Depth Slicer Controls */}
        <SpectralFilterControls
          currentFilter={filter}
          onChangeFilter={setFilter}
          depthZ={depthZ}
          onChangeDepthZ={setDepthZ}
          maxDepth={currentSite.gridDimensions.maxDepthM}
          strata={currentSite.strata}
          opacityBlend={opacityBlend}
          onChangeOpacityBlend={setOpacityBlend}
          wipePosition={wipePosition}
          onChangeWipePosition={setWipePosition}
          viewMode={viewMode}
          isScanning={isScanning}
          onToggleScanning={() => setIsScanning(!isScanning)}
        />

        {/* Primary Viewport Area */}
        <div className="grid grid-cols-1 gap-4">
          {viewMode === 'cross-section' ? (
            <CrossSectionView
              site={currentSite}
              depthZ={depthZ}
              onSelectDepthZ={setDepthZ}
              selectedProbe={selectedProbe}
            />
          ) : (
            <XRayScannerCanvas
              site={currentSite}
              filter={filter}
              viewMode={viewMode}
              depthZ={depthZ}
              opacityBlend={opacityBlend}
              wipePosition={wipePosition}
              onChangeWipePosition={setWipePosition}
              isScanning={isScanning}
              selectedProbe={selectedProbe}
              onSelectProbe={(probe) => {
                setSelectedProbe(probe);
                // Clear previous analysis to prompt re-evaluation
                setAiAnalysisResult(null);
              }}
            />
          )}
        </div>

        {/* Real-time Subterranean Telemetry Bar */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Compass className="w-4 h-4" />
              <span>Grid: {currentSite.gridDimensions.widthM}m × {currentSite.gridDimensions.lengthM}m</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Layers className="w-4 h-4" />
              <span>Epoch: {currentSite.epochs[currentEpochIndex]}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <Droplet className="w-4 h-4" />
              <span>Aquifer Depth: -8.0m</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Seismic Resonance: <strong className="text-white">1.24 Hz</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">ICOMOS Charter Compliant</span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout: 8D Matrix & Probe Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: 8D Dimension Matrix & Epoch Scrubber */}
          <div className="lg:col-span-7 space-y-4">
            <Dimension8DMatrix
              activeDimensions={activeDimensions}
              onToggleDimension={toggleDimension}
              currentEpoch={currentSite.epochs[currentEpochIndex]}
              epochs={currentSite.epochs}
              currentEpochIndex={currentEpochIndex}
              onSelectEpochIndex={setCurrentEpochIndex}
            />
          </div>

          {/* Right Column: Probe Inspector & Conflict Remediation */}
          <div className="lg:col-span-5 space-y-4">
            <ProbeInspectorPanel
              probe={selectedProbe}
              site={currentSite}
              filter={filter}
              activeDimensions={activeDimensions}
              onTriggerDeepAnalysis={runDeepAnalysis}
              isAnalyzing={isAnalyzing}
              aiAnalysisResult={aiAnalysisResult}
            />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a12] py-4 px-4 text-center text-xs font-mono text-slate-500 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel'] font-bold text-slate-400">THE HOUSE EIGHTH</span>
            <span>• 8-th Inc</span>
            <span>• Reconstruction of Future</span>
          </div>
          <p className="text-[11px] text-slate-600">
            8D Dimension X-Ray Scanning Imaging Technology • Metrology Calibrated Foundation Overlays
          </p>
        </div>
      </footer>

      {/* Modals */}
      <DeepAnalysisModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        site={currentSite}
        probe={selectedProbe}
        aiReport={aiAnalysisResult}
        onRunAudit={() => runDeepAnalysis()}
        isAnalyzing={isAnalyzing}
      />

      <BlueprintUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportSite={handleImportSite}
      />

    </div>
  );
}
