import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileUp, 
  Check, 
  Building2, 
  MapPin, 
  Ruler, 
  Layers,
  Sparkles
} from 'lucide-react';
import { SiteProject } from '../types';
import { soundFx } from '../utils/audio';

interface BlueprintUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSite: (newSite: SiteProject) => void;
}

export const BlueprintUploadModal: React.FC<BlueprintUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSite,
}) => {
  const [siteName, setSiteName] = useState('');
  const [cityName, setCityName] = useState('');
  const [dimensionsM, setDimensionsM] = useState('60');
  const [maxDepthM, setMaxDepthM] = useState('30');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playBlip(750);
      setSelectedFileName(file.name);
      if (!siteName) {
        setSiteName(file.name.replace(/\.[^/.]+$/, '').toUpperCase() + ' ARCHITECTURAL OVERLAY');
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      soundFx.playBlip(750);
      setSelectedFileName(file.name);
      if (!siteName) {
        setSiteName(file.name.replace(/\.[^/.]+$/, '').toUpperCase() + ' OVERLAY');
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playBlip(950);

    const widthNum = parseFloat(dimensionsM) || 60;
    const depthNum = parseFloat(maxDepthM) || 30;

    const newSite: SiteProject = {
      id: `site-custom-${Date.now()}`,
      code: `8TH-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
      name: siteName || 'Custom Architectural Site',
      designation: 'User Calibrated Subterranean Overlay',
      city: cityName || 'Metropolitan Site',
      country: 'Urban Sector',
      coordinatesGeo: 'Custom Georeferenced Coordinates',
      scaleRatio: '1:100 Calibrated',
      gridDimensions: { widthM: widthNum, lengthM: widthNum, maxDepthM: depthNum },
      epochs: ['Historical Foundation Horizon', '2026 Modern Blueprint', '2080 Reconstruction of Future'],
      currentEpochIndex: 1,
      summary: `User imported blueprint (${selectedFileName || 'vector draft'}) calibrated for 8D Dimension X-Ray overlay and foundation conflict detection.`,
      restorationVision: 'Active structural isolation and micro-pile underpinning calibrated to prevent historic displacement.',
      strata: [
        { name: 'Upper Anthropocene Fill', depthRange: [0, 4.0], color: '#334155', densityKgm3: 1700, moisturePct: 18, shearModulusMPa: 45, archaeologicalHorizon: 'Modern Fill' },
        { name: 'Historical Foundation Horizon', depthRange: [4.0, 14.0], color: '#475569', densityKgm3: 2100, moisturePct: 25, shearModulusMPa: 120, archaeologicalHorizon: 'Ancient Subterranean Structures' },
        { name: 'Deep Bedrock Strata', depthRange: [14.0, depthNum], color: '#1e293b', densityKgm3: 2600, moisturePct: 8, shearModulusMPa: 350, archaeologicalHorizon: 'Solid Bedrock Anchorage' }
      ],
      historicalFoundations: [
        {
          id: 'custom-hist-01',
          name: 'Surveyed Ancient Foundation Wall Header',
          epoch: 'Antiquity',
          century: 'Historic Epoch',
          material: 'Dressed Ashlar Masonry',
          depthM: 8.5,
          heightM: 3.5,
          x: widthNum * 0.2,
          y: widthNum * 0.25,
          width: widthNum * 0.6,
          height: 3.5,
          type: 'wall',
          compressiveStrengthMPa: 22.0,
          preservationIndexPct: 92,
          notes: 'Calibrated from survey data overlay.'
        }
      ],
      modernBlueprints: [
        {
          id: 'custom-mod-01',
          gridRef: 'CFA PILE P-01',
          type: 'pile',
          material: 'Continuous Flight Auger Pile Ø1000mm',
          x: widthNum * 0.2,
          y: widthNum * 0.25,
          radius: 2.0,
          depthMinM: 0,
          depthMaxM: depthNum,
          axialLoadKN: 12000,
          safetyFactor: 2.5,
          status: 'conflict'
        },
        {
          id: 'custom-mod-02',
          gridRef: 'CFA PILE P-02',
          type: 'pile',
          material: 'Continuous Flight Auger Pile Ø1000mm',
          x: widthNum * 0.7,
          y: widthNum * 0.7,
          radius: 2.0,
          depthMinM: 0,
          depthMaxM: depthNum,
          axialLoadKN: 12000,
          safetyFactor: 2.5,
          status: 'aligned'
        }
      ],
      conflicts: [
        {
          id: 'custom-conf-01',
          modernId: 'custom-mod-01',
          ancientId: 'custom-hist-01',
          x: widthNum * 0.2,
          y: widthNum * 0.25,
          depthZ: -8.5,
          severity: 'critical',
          overlapM: 0.5,
          stressConcentrationMPa: 7.2,
          title: 'Pile P-01 Intersects Surveyed Masonry Header',
          description: 'Direct conflict detected between modern bored pile and ancient foundation.',
          reconstructionSolution: 'Apply 1.5m offset or integrate pneumatic cantilever transfer cap.'
        }
      ]
    };

    onImportSite(newSite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#070c16] border border-cyan-800/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                IMPORT ARCHITECTURAL BLUEPRINT
              </h3>
              <p className="text-[11px] text-cyan-400">
                8D Dimension X-Ray Calibration & Foundation Registration
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playBlip(500);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/50 hover:bg-slate-900/50 space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg,.json"
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            {selectedFileName ? (
              <div className="text-cyan-300 font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{selectedFileName}</span>
              </div>
            ) : (
              <div>
                <p className="text-slate-200 font-semibold">
                  Click or drag blueprint / archaeological survey here
                </p>
                <p className="text-[10px] text-slate-500">
                  Supports CAD DXF, DWG, PDF, High-Res PNG, or Archaeological JSON
                </p>
              </div>
            )}
          </div>

          {/* Site Metadata Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Project / Site Name:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Imperial Forum North Wing Restoration"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Location / City:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rome, Italy"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Grid Width (Meters):
                </label>
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={dimensionsM}
                  onChange={(e) => setDimensionsM(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Subterranean Bedrock Depth (Meters):
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={maxDepthM}
                onChange={(e) => setMaxDepthM(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register 8D Overlay</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
