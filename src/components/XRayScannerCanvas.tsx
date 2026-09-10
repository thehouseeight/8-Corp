import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Maximize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Layers,
  Crosshair
} from 'lucide-react';
import { 
  SiteProject, 
  SpectralFilter, 
  ViewMode, 
  ProbePoint, 
  FoundationElement, 
  ModernStructuralElement, 
  StructuralConflict 
} from '../types';
import { soundFx } from '../utils/audio';

interface XRayScannerCanvasProps {
  site: SiteProject;
  filter: SpectralFilter;
  viewMode: ViewMode;
  depthZ: number;
  opacityBlend: number;
  wipePosition: number;
  onChangeWipePosition: (val: number) => void;
  isScanning: boolean;
  selectedProbe: ProbePoint | null;
  onSelectProbe: (probe: ProbePoint) => void;
}

export const XRayScannerCanvas: React.FC<XRayScannerCanvasProps> = ({
  site,
  filter,
  viewMode,
  depthZ,
  opacityBlend,
  wipePosition,
  onChangeWipePosition,
  isScanning,
  selectedProbe,
  onSelectProbe,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [scanSweepX, setScanSweepX] = useState(0);
  const [isDraggingWipe, setIsDraggingWipe] = useState(false);

  // SVG coordinate bounds
  const viewBoxWidth = 600;
  const viewBoxHeight = 600;
  const gridMeters = site.gridDimensions.widthM; // 60 meters
  const scaleRatio = viewBoxWidth / gridMeters; // 10 pixels per meter

  // Animated scanner sweep
  useEffect(() => {
    if (!isScanning) return;
    let animId: number;
    let startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = (elapsed % 4.0) / 4.0; // 4 second sweep cycle
      setScanSweepX(progress * viewBoxWidth);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isScanning, viewBoxWidth]);

  // Color profiles based on spectral filter
  const spectralTheme = useMemo(() => {
    switch (filter) {
      case 'muon-xray':
        return {
          ancientFill: 'rgba(16, 185, 129, 0.25)',
          ancientStroke: '#10b981',
          ancientGlow: 'rgba(16, 185, 129, 0.5)',
          modernStroke: '#38bdf8',
          bg: '#041014',
          gridLine: '#0d282e',
          laser: '#34d399',
          name: 'Muon Penetrative Tomography',
        };
      case 'gpr-radar':
        return {
          ancientFill: 'rgba(245, 158, 11, 0.25)',
          ancientStroke: '#f59e0b',
          ancientGlow: 'rgba(245, 158, 11, 0.5)',
          modernStroke: '#06b6d4',
          bg: '#120a03',
          gridLine: '#2e1808',
          laser: '#fbbf24',
          name: 'GPR 400MHz Electromagnetic Echo',
        };
      case 'ultrasonic':
        return {
          ancientFill: 'rgba(14, 165, 233, 0.25)',
          ancientStroke: '#0ea5e9',
          ancientGlow: 'rgba(14, 165, 233, 0.5)',
          modernStroke: '#a855f7',
          bg: '#040d18',
          gridLine: '#0c233c',
          laser: '#38bdf8',
          name: 'Ultrasonic Acoustic P-Wave',
        };
      case 'thermal-infrared':
        return {
          ancientFill: 'rgba(239, 68, 68, 0.3)',
          ancientStroke: '#f87171',
          ancientGlow: 'rgba(239, 68, 68, 0.6)',
          modernStroke: '#38bdf8',
          bg: '#180505',
          gridLine: '#3a1010',
          laser: '#f43f5e',
          name: 'Thermal Infrared Moisture Map',
        };
      case 'cad-phosphor':
        return {
          ancientFill: 'rgba(74, 222, 128, 0.15)',
          ancientStroke: '#4ade80',
          ancientGlow: 'rgba(74, 222, 128, 0.3)',
          modernStroke: '#00f0ff',
          bg: '#020b08',
          gridLine: '#0a2e1d',
          laser: '#22c55e',
          name: 'Vector Phosphor CAD',
        };
      case 'composite-8d':
      default:
        return {
          ancientFill: 'rgba(217, 70, 239, 0.22)',
          ancientStroke: '#e879f9',
          ancientGlow: 'rgba(217, 70, 239, 0.5)',
          modernStroke: '#22d3ee',
          bg: '#08081a',
          gridLine: '#1e1438',
          laser: '#c084fc',
          name: '8D Multi-Spectral Fusion',
        };
    }
  }, [filter]);

  // Handle probe point selection from click
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingWipe) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert from screen pixels back to meter coordinate space
    const xMeters = (clientX / (rect.width * zoom)) * gridMeters;
    const yMeters = (clientY / (rect.height * zoom)) * gridMeters;

    const clampedX = Math.max(0, Math.min(gridMeters, Number(xMeters.toFixed(1))));
    const clampedY = Math.max(0, Math.min(gridMeters, Number(yMeters.toFixed(1))));

    // Detect if clicking inside or near an ancient foundation
    const foundAncient = site.historicalFoundations.find(f => {
      return (
        clampedX >= f.x &&
        clampedX <= f.x + f.width &&
        clampedY >= f.y &&
        clampedY <= f.y + f.height
      );
    });

    // Detect if clicking inside or near a modern structural element
    const foundModern = site.modernBlueprints.find(m => {
      if (m.radius) {
        const dist = Math.hypot(clampedX - m.x, clampedY - m.y);
        return dist <= m.radius + 1.5;
      }
      if (m.width && m.height) {
        return (
          clampedX >= m.x &&
          clampedX <= m.x + m.width &&
          clampedY >= m.y &&
          clampedY <= m.y + m.height
        );
      }
      return false;
    });

    // Detect conflicts near this probe
    const conflict = site.conflicts.find(c => {
      const dist = Math.hypot(clampedX - c.x, clampedY - c.y);
      return dist <= 3.0;
    });

    // Find soil layer at depthZ
    const absZ = Math.abs(depthZ);
    const soilLayer = site.strata.find(
      s => absZ >= s.depthRange[0] && absZ <= s.depthRange[1]
    ) || site.strata[0];

    soundFx.playBlip(foundAncient || conflict ? 950 : 640);

    const probe: ProbePoint = {
      x: clampedX,
      y: clampedY,
      z: depthZ,
      surfaceGroundLevelM: 0,
      ancientElement: foundAncient,
      modernElement: foundModern,
      activeConflict: conflict,
      soilLayer: soilLayer,
      moisturePct: soilLayer.moisturePct,
      vibrationHz: 1.25,
      bearingCapacityKPa: soilLayer.shearModulusMPa * 100,
    };

    onSelectProbe(probe);
  };

  // Track hover coordinate
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const xMeters = (clientX / (rect.width * zoom)) * gridMeters;
    const yMeters = (clientY / (rect.height * zoom)) * gridMeters;

    setHoverCoord({
      x: Math.max(0, Math.min(gridMeters, Number(xMeters.toFixed(1)))),
      y: Math.max(0, Math.min(gridMeters, Number(yMeters.toFixed(1)))),
    });
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    soundFx.playBlip(750);
    setZoom(prev => Math.max(0.8, Math.min(3.5, prev + delta)));
  };

  const resetView = () => {
    soundFx.playBlip(600);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wipe split calculations
  const wipeX = (wipePosition / 100) * viewBoxWidth;

  return (
    <div className="relative flex flex-col bg-[#070c16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-300 tracking-wider">8D X-RAY SCANNER VIEWPORT</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="text-slate-400 hidden md:inline">Filter: <span className="text-cyan-400">{spectralTheme.name}</span></span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-400">Target Depth: {depthZ.toFixed(1)}m</span>
        </div>

        {/* Real-time coordinates & Zoom HUD */}
        <div className="flex items-center gap-2">
          {hoverCoord && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>[X:{hoverCoord.x}m, Y:{hoverCoord.y}m, Z:{depthZ.toFixed(1)}m]</span>
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1 py-0.5">
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1 hover:text-cyan-400 text-slate-400 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1 hover:text-cyan-400 text-slate-400 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 hover:text-cyan-400 text-slate-400 transition border-l border-slate-800 ml-0.5"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full h-[520px] md:h-[580px] overflow-hidden cursor-crosshair select-none flex items-center justify-center"
        style={{ backgroundColor: spectralTheme.bg }}
      >
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Blueprint Grid Pattern */}
            <pattern id="grid-pattern-small" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke={spectralTheme.gridLine} strokeWidth="0.5" />
            </pattern>
            <pattern id="grid-pattern-large" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#grid-pattern-small)" />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke={spectralTheme.gridLine} strokeWidth="1.2" />
            </pattern>

            {/* Masonry Stone Texture Pattern for Ancient Walls */}
            <pattern id="ancient-stone-hatch" width="20" height="12" patternUnits="userSpaceOnUse">
              <rect width="20" height="12" fill={spectralTheme.ancientFill} />
              <line x1="0" y1="0" x2="20" y2="0" stroke={spectralTheme.ancientStroke} strokeWidth="0.75" />
              <line x1="0" y1="6" x2="20" y2="6" stroke={spectralTheme.ancientStroke} strokeWidth="0.75" />
              <line x1="10" y1="0" x2="10" y2="6" stroke={spectralTheme.ancientStroke} strokeWidth="0.75" />
              <line x1="0" y1="6" x2="0" y2="12" stroke={spectralTheme.ancientStroke} strokeWidth="0.75" />
              <line x1="20" y1="6" x2="20" y2="12" stroke={spectralTheme.ancientStroke} strokeWidth="0.75" />
            </pattern>

            {/* Modern Reinforced Concrete Hatch Pattern */}
            <pattern id="modern-concrete-hatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke={spectralTheme.modernStroke} strokeWidth="0.7" opacity="0.6" />
            </pattern>

            {/* Split Screen Clip Paths */}
            <clipPath id="wipe-left-ancient">
              <rect x="0" y="0" width={wipeX} height={viewBoxHeight} />
            </clipPath>
            <clipPath id="wipe-right-modern">
              <rect x={wipeX} y="0" width={viewBoxWidth - wipeX} height={viewBoxHeight} />
            </clipPath>

            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Pulsing Warning Marker */}
            <radialGradient id="conflict-gradient">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grid-pattern-large)" />

          {/* Metric Axis Coordinates (Every 10 meters) */}
          <g className="font-mono text-[9px] fill-slate-500 select-none">
            {[0, 10, 20, 30, 40, 50, 60].map((m) => (
              <React.Fragment key={`axis-${m}`}>
                {/* Top X Axis */}
                <text x={m * scaleRatio} y="14" textAnchor="middle">
                  {m}m
                </text>
                <line
                  x1={m * scaleRatio}
                  y1="18"
                  x2={m * scaleRatio}
                  y2="24"
                  stroke="#334155"
                  strokeWidth="1"
                />
                {/* Left Y Axis */}
                <text x="6" y={m * scaleRatio + 4} textAnchor="start">
                  {m}m
                </text>
                <line
                  x1="18"
                  y1={m * scaleRatio}
                  x2="24"
                  y2={m * scaleRatio}
                  stroke="#334155"
                  strokeWidth="1"
                />
              </React.Fragment>
            ))}
          </g>

          {/* ========================================================= */}
          {/* LAYER 1: ANCIENT FOUNDATION STRATA                        */}
          {/* ========================================================= */}
          <g 
            id="ancient-foundations-group"
            clipPath={viewMode === 'dual-split' ? 'url(#wipe-left-ancient)' : undefined}
            opacity={viewMode === 'blueprint-cad' ? 0.05 : 1}
          >
            {site.historicalFoundations.map((elem) => {
              const rx = elem.x * scaleRatio;
              const ry = elem.y * scaleRatio;
              const rw = elem.width * scaleRatio;
              const rh = elem.height * scaleRatio;
              const isSelected = selectedProbe?.ancientElement?.id === elem.id;

              return (
                <g key={elem.id} className="transition-all cursor-pointer">
                  {/* Element geometry */}
                  {elem.type === 'column' ? (
                    <circle
                      cx={rx + rw / 2}
                      cy={ry + rh / 2}
                      r={rw / 2}
                      fill="url(#ancient-stone-hatch)"
                      stroke={isSelected ? '#38bdf8' : spectralTheme.ancientStroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />
                  ) : elem.type === 'arch' ? (
                    <g>
                      <rect
                        x={rx}
                        y={ry}
                        width={rw}
                        height={rh}
                        fill="url(#ancient-stone-hatch)"
                        stroke={spectralTheme.ancientStroke}
                        strokeWidth="1.5"
                      />
                      {/* Internal arch curves */}
                      <path
                        d={`M ${rx} ${ry + rh} Q ${rx + rw / 2} ${ry} ${rx + rw} ${ry + rh}`}
                        fill="none"
                        stroke={spectralTheme.ancientStroke}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                    </g>
                  ) : (
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill="url(#ancient-stone-hatch)"
                      stroke={isSelected ? '#38bdf8' : spectralTheme.ancientStroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />
                  )}

                  {/* Historical Callout Label */}
                  <g className="select-none pointer-events-none">
                    <rect
                      x={rx + 4}
                      y={ry + 4}
                      width={elem.name.length * 5.2 + 8}
                      height="14"
                      fill="#030712"
                      opacity="0.85"
                      rx="2"
                    />
                    <text
                      x={rx + 8}
                      y={ry + 14}
                      fill={spectralTheme.ancientStroke}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {elem.name.slice(0, 24)} [{elem.century}]
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* ========================================================= */}
          {/* LAYER 2: MODERN STRUCTURAL BLUEPRINT (CAD)                */}
          {/* ========================================================= */}
          <g 
            id="modern-blueprint-group"
            clipPath={viewMode === 'dual-split' ? 'url(#wipe-right-modern)' : undefined}
            opacity={
              viewMode === 'xray-strata'
                ? 0.05
                : viewMode === 'overlay-blend'
                ? opacityBlend / 100
                : 1
            }
          >
            {/* Structural CAD Grid Lines (A-E, 1-5) */}
            <g stroke="#0369a1" strokeWidth="0.8" strokeDasharray="6 3" opacity="0.75">
              {[140, 250, 390, 440].map((coord, idx) => (
                <React.Fragment key={`cad-grid-${idx}`}>
                  {/* Vertical grid line */}
                  <line x1={coord} y1="30" x2={coord} y2="570" />
                  <circle cx={coord} cy="26" r="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
                  <text x={coord} y="29" fill="#e0f2fe" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {String.fromCharCode(65 + idx)}
                  </text>

                  {/* Horizontal grid line */}
                  <line x1="30" y1={coord} x2="570" y2={coord} />
                  <circle cx="26" cy={coord} r="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
                  <text x="26" y={coord + 3} fill="#e0f2fe" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {idx + 1}
                  </text>
                </React.Fragment>
              ))}
            </g>

            {/* Modern Blueprints Structural Elements */}
            {site.modernBlueprints.map((item) => {
              const mx = item.x * scaleRatio;
              const my = item.y * scaleRatio;
              const isSelected = selectedProbe?.modernElement?.id === item.id;

              if (item.type === 'pile' && item.radius) {
                const r = item.radius * scaleRatio;
                const isConflict = item.status === 'conflict';

                return (
                  <g key={item.id} className="cursor-pointer">
                    {/* Bored Pile Cap and Crosshair */}
                    <circle
                      cx={mx}
                      cy={my}
                      r={r}
                      fill={isConflict ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)'}
                      stroke={isConflict ? '#ef4444' : isSelected ? '#ffffff' : '#38bdf8'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <circle cx={mx} cy={my} r={r * 0.4} fill="none" stroke="#38bdf8" strokeWidth="0.8" />
                    {/* CAD Crosshairs */}
                    <line x1={mx - r - 4} y1={my} x2={mx + r + 4} y2={my} stroke="#38bdf8" strokeWidth="0.8" />
                    <line x1={mx} y1={my - r - 4} x2={mx} y2={my + r + 4} stroke="#38bdf8" strokeWidth="0.8" />
                    {/* Label */}
                    <text
                      x={mx}
                      y={my + r + 12}
                      textAnchor="middle"
                      fill={isConflict ? '#f87171' : '#7dd3fc'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {item.gridRef} ({Math.round(item.axialLoadKN / 1000)}k kN)
                    </text>
                  </g>
                );
              }

              if (item.type === 'shear-core' && item.width && item.height) {
                const w = item.width * scaleRatio;
                const h = item.height * scaleRatio;

                return (
                  <g key={item.id} className="cursor-pointer">
                    <rect
                      x={mx}
                      y={my}
                      width={w}
                      height={h}
                      fill="url(#modern-concrete-hatch)"
                      stroke={isSelected ? '#ffffff' : '#38bdf8'}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    {/* Diagonal shear core bracing */}
                    <line x1={mx} y1={my} x2={mx + w} y2={my + h} stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={mx + w} y1={my} x2={mx} y2={my + h} stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                    <text
                      x={mx + w / 2}
                      y={my + h / 2 + 3}
                      textAnchor="middle"
                      fill="#e0f2fe"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      SUPERSTRUCTURE SHEAR CORE
                    </text>
                  </g>
                );
              }

              if (item.type === 'grade-beam' && item.width && item.height) {
                const bw = item.width * scaleRatio;
                const bh = item.height * scaleRatio;

                return (
                  <g key={item.id}>
                    <rect
                      x={mx}
                      y={my}
                      width={bw}
                      height={bh}
                      fill="rgba(14, 165, 233, 0.2)"
                      stroke="#0284c7"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                    />
                    <text
                      x={mx + bw / 2}
                      y={my + bh / 2 + 3}
                      textAnchor="middle"
                      fill="#bae6fd"
                      fontSize="7"
                      fontFamily="monospace"
                    >
                      {item.gridRef}
                    </text>
                  </g>
                );
              }

              if (item.type === 'retaining-wall' && item.width && item.height) {
                const rw = item.width * scaleRatio;
                const rh = item.height * scaleRatio;

                return (
                  <rect
                    key={item.id}
                    x={mx}
                    y={my}
                    width={rw}
                    height={rh}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                );
              }

              return null;
            })}
          </g>

          {/* ========================================================= */}
          {/* LAYER 3: CONFLICT & ANOMALY WARNING HOTSPOTS              */}
          {/* ========================================================= */}
          {site.conflicts.map((conf) => {
            const cx = conf.x * scaleRatio;
            const cy = conf.y * scaleRatio;

            return (
              <g 
                key={conf.id} 
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playAlert();
                  const probe: ProbePoint = {
                    x: conf.x,
                    y: conf.y,
                    z: conf.depthZ,
                    surfaceGroundLevelM: 0,
                    activeConflict: conf,
                    ancientElement: site.historicalFoundations.find(f => f.id === conf.ancientId),
                    modernElement: site.modernBlueprints.find(m => m.id === conf.modernId),
                    soilLayer: site.strata[1],
                    moisturePct: 26,
                    vibrationHz: 2.1,
                    bearingCapacityKPa: 2200,
                  };
                  onSelectProbe(probe);
                }}
              >
                {/* Pulsing warning circle */}
                <circle cx={cx} cy={cy} r="24" fill="url(#conflict-gradient)">
                  <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r="10" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />
                <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke="#ffffff" strokeWidth="1.8" />
                <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} stroke="#ffffff" strokeWidth="1.8" />
                {/* Conflict badge */}
                <rect x={cx + 12} y={cy - 10} width="110" height="18" rx="3" fill="#450a0a" stroke="#ef4444" strokeWidth="1" />
                <text x={cx + 16} y={cy + 3} fill="#fca5a5" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  ⚠️ CLASH: {conf.overlapM}m OVERLAP
                </text>
              </g>
            );
          })}

          {/* ========================================================= */}
          {/* LAYER 4: ACTIVE SCANNER SWEEP LASER BEAM                  */}
          {/* ========================================================= */}
          {isScanning && (
            <g className="pointer-events-none">
              <line
                x1={scanSweepX}
                y1="0"
                x2={scanSweepX}
                y2={viewBoxHeight}
                stroke={spectralTheme.laser}
                strokeWidth="2"
                opacity="0.85"
                filter="url(#glow)"
              />
              <rect
                x={Math.max(0, scanSweepX - 60)}
                y="0"
                width="60"
                height={viewBoxHeight}
                fill={`url(#laser-trail-gradient)`}
                opacity="0.25"
              />
              <linearGradient id="laser-trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={spectralTheme.laser} stopOpacity="0" />
                <stop offset="100%" stopColor={spectralTheme.laser} stopOpacity="0.4" />
              </linearGradient>
            </g>
          )}

          {/* ========================================================= */}
          {/* LAYER 5: SELECTED PROBE RETICLE & TARGET HUD              */}
          {/* ========================================================= */}
          {selectedProbe && (
            <g className="pointer-events-none">
              {/* Target coordinate reticle */}
              {(() => {
                const px = selectedProbe.x * scaleRatio;
                const py = selectedProbe.y * scaleRatio;

                return (
                  <g>
                    <circle cx={px} cy={py} r="18" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 2">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${px} ${py}`}
                        to={`360 ${px} ${py}`}
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx={px} cy={py} r="3" fill="#22d3ee" />
                    <line x1={px - 26} y1={py} x2={px - 6} y2={py} stroke="#22d3ee" strokeWidth="1" />
                    <line x1={px + 6} y1={py} x2={px + 26} y2={py} stroke="#22d3ee" strokeWidth="1" />
                    <line x1={px} y1={py - 26} x2={px} y2={py - 6} stroke="#22d3ee" strokeWidth="1" />
                    <line x1={px} y1={py + 6} x2={px} y2={py + 26} stroke="#22d3ee" strokeWidth="1" />
                    
                    {/* Reticle coordinate HUD tag */}
                    <g transform={`translate(${px + 12}, ${py - 30})`}>
                      <rect width="130" height="22" rx="3" fill="#030712" stroke="#22d3ee" strokeWidth="1" opacity="0.9" />
                      <text x="6" y="14" fill="#a5f3fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        PROBE [X:{selectedProbe.x}m Y:{selectedProbe.y}m]
                      </text>
                    </g>
                  </g>
                );
              })()}
            </g>
          )}

          {/* ========================================================= */}
          {/* LAYER 6: SPLIT-SCREEN WIPE DIVIDER LINE & DRAG HANDLE     */}
          {/* ========================================================= */}
          {viewMode === 'dual-split' && (
            <g className="cursor-ew-resize">
              {/* Divider line */}
              <line
                x1={wipeX}
                y1="0"
                x2={wipeX}
                y2={viewBoxHeight}
                stroke="#06b6d4"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
              {/* Draggable center handle pill */}
              <g
                transform={`translate(${wipeX}, ${viewBoxHeight / 2})`}
                onMouseDown={() => setIsDraggingWipe(true)}
              >
                <circle cx="0" cy="0" r="16" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
                <path d="M -6 0 L -2 -4 L -2 4 Z M 6 0 L 2 -4 L 2 4 Z" fill="#38bdf8" />
              </g>
              {/* Wipe side tags */}
              <g className="select-none pointer-events-none text-[9px] font-mono">
                <rect x={wipeX - 110} y="32" width="100" height="18" rx="3" fill="#030712" stroke="#f59e0b" opacity="0.85" />
                <text x={wipeX - 60} y="44" fill="#f59e0b" textAnchor="middle" fontWeight="bold">
                  ◄ ANCIENT STRATA
                </text>

                <rect x={wipeX + 10} y="32" width="100" height="18" rx="3" fill="#030712" stroke="#38bdf8" opacity="0.85" />
                <text x={wipeX + 60} y="44" fill="#38bdf8" textAnchor="middle" fontWeight="bold">
                  MODERN CAD ►
                </text>
              </g>
            </g>
          )}

        </svg>

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-slate-950/85 border border-slate-800 backdrop-blur-md rounded-lg p-2.5 text-[11px] font-mono space-y-1 shadow-lg pointer-events-none hidden sm:block">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-800">
            8-th Metrology Legend
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/60 border border-amber-400" />
            <span>Ancient Foundation Masonry</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-sky-400" />
            <span>Modern Bored Pile (CFA)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-sky-900/60 border border-sky-500" />
            <span>Superstructure Shear Core</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Structural Conflict Intersection</span>
          </div>
        </div>

        {/* Metrology Scale Bar at Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 border border-slate-800 backdrop-blur-md rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-400 pointer-events-none">
          <div className="flex items-center gap-2">
            <span>Scale: {site.scaleRatio}</span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <div className="w-12 h-1 bg-cyan-400" />
              <span>10m</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
