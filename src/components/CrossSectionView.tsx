import React from 'react';
import { SiteProject, SoilStrataLayer, ProbePoint } from '../types';
import { ArrowDown, AlertTriangle, Layers, Droplets } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CrossSectionViewProps {
  site: SiteProject;
  depthZ: number;
  onSelectDepthZ: (z: number) => void;
  selectedProbe: ProbePoint | null;
}

export const CrossSectionView: React.FC<CrossSectionViewProps> = ({
  site,
  depthZ,
  onSelectDepthZ,
  selectedProbe,
}) => {
  const maxDepthM = site.gridDimensions.maxDepthM; // e.g. 32m
  const svgHeight = 540;
  const svgWidth = 800;

  // Ground is at Y = 140px. Depths from 0 to -32m map to Y = 140 to 500px.
  const groundY = 140;
  const strataHeightPx = svgHeight - groundY - 40; // 360px
  const pxPerMeter = strataHeightPx / maxDepthM;

  return (
    <div className="bg-[#070c16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="font-mono text-sm font-bold text-slate-100 tracking-wider">
            SUBTERRANEAN Z-AXIS ELEVATION CUTAWAY & STRATIGRAPHY
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Total Profile: +120m Superstructure / -{maxDepthM}m Bedrock</span>
          <span className="text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 font-bold">
            Cursor Z: {depthZ.toFixed(1)}m
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          className="w-full min-w-[720px] h-[480px] select-none"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clientY = e.clientY - rect.top;
            const meterFromGround = (clientY - groundY) / pxPerMeter;
            if (meterFromGround >= 0 && meterFromGround <= maxDepthM) {
              soundFx.playBlip(720);
              onSelectDepthZ(-Number(meterFromGround.toFixed(1)));
            }
          }}
        >
          <defs>
            <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a1526" />
              <stop offset="100%" stopColor="#040711" />
            </linearGradient>

            <pattern id="soil-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 8 L 8 0 M 0 0 L 8 8" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>

            <pattern id="bedrock-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#0f172a" />
              <path d="M 0 16 L 16 0" stroke="#334155" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Above Ground Sky Area */}
          <rect x="0" y="0" width={svgWidth} height={groundY} fill="url(#sky-gradient)" />

          {/* Modern Superstructure Elevation Silhouette */}
          <g id="superstructure-silhouette" opacity="0.85">
            {/* 48-Story Palimpsest Mass-Timber Exoskeleton */}
            <path
              d="M 280 140 L 295 20 L 505 20 L 520 140 Z"
              fill="#0f172a"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
            {/* Diagrid structural bracing */}
            <line x1="280" y1="140" x2="505" y2="20" stroke="#0369a1" strokeWidth="0.8" strokeDasharray="4 2" />
            <line x1="520" y1="140" x2="295" y2="20" stroke="#0369a1" strokeWidth="0.8" strokeDasharray="4 2" />
            <line x1="340" y1="140" x2="460" y2="20" stroke="#0369a1" strokeWidth="0.8" strokeDasharray="4 2" />
            <line x1="460" y1="140" x2="340" y2="20" stroke="#0369a1" strokeWidth="0.8" strokeDasharray="4 2" />
            {/* Spire */}
            <line x1="400" y1="20" x2="400" y2="5" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="400" cy="5" r="2" fill="#38bdf8" />
            <text x="400" y="45" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
              THE HOUSE EIGHTH SUPERSTRUCTURE (+120m)
            </text>
          </g>

          {/* Ground Surface Line 0.0m */}
          <line x1="0" y1={groundY} x2={svgWidth} y2={groundY} stroke="#38bdf8" strokeWidth="2" />
          <text x="15" y={groundY - 8} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            GROUND SURFACE EL. ±0.00m
          </text>

          {/* Geological Soil Strata Bands */}
          {site.strata.map((stratum, idx) => {
            const y1 = groundY + stratum.depthRange[0] * pxPerMeter;
            const y2 = groundY + stratum.depthRange[1] * pxPerMeter;
            const height = y2 - y1;

            return (
              <g key={stratum.name}>
                <rect
                  x="70"
                  y={y1}
                  width={svgWidth - 90}
                  height={height}
                  fill={stratum.color}
                  opacity="0.55"
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
                {/* Stratum Label & Depth Band */}
                <text
                  x="80"
                  y={y1 + 16}
                  fill="#e2e8f0"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {stratum.name} (-{stratum.depthRange[0]}m to -{stratum.depthRange[1]}m)
                </text>
                <text
                  x="80"
                  y={y1 + 28}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {stratum.archaeologicalHorizon} • {stratum.densityKgm3} kg/m³ • {stratum.shearModulusMPa} MPa
                </text>
              </g>
            );
          })}

          {/* Subterranean Water Table Aquifer Line */}
          <g stroke="#06b6d4" strokeWidth="1" strokeDasharray="5 3" opacity="0.8">
            <line x1="70" y1={groundY + 8 * pxPerMeter} x2={svgWidth - 20} y2={groundY + 8 * pxPerMeter} />
            <text x="svgWidth - 160" y={groundY + 8 * pxPerMeter - 5} fill="#67e8f9" fontSize="8" fontFamily="monospace">
              Water Table Aquifer (-8.0m)
            </text>
          </g>

          {/* Ancient Foundation Elements (In Elevation) */}
          {site.historicalFoundations.map((elem) => {
            // Map depth and height into Z profile
            const ey = groundY + elem.depthM * pxPerMeter;
            const eh = Math.max(14, elem.heightM * pxPerMeter);
            const ex = 180 + (elem.x / 60) * 440;
            const ew = Math.max(30, (elem.width / 60) * 440);

            return (
              <g key={`cross-${elem.id}`}>
                <rect
                  x={ex}
                  y={ey}
                  width={ew}
                  height={eh}
                  fill="rgba(245, 158, 11, 0.4)"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                />
                {/* Arch curve if arch/crypt */}
                {(elem.type === 'arch' || elem.type === 'crypt') && (
                  <path
                    d={`M ${ex} ${ey + eh} Q ${ex + ew / 2} ${ey} ${ex + ew} ${ey + eh}`}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                )}
                <text
                  x={ex + 6}
                  y={ey + eh / 2 + 3}
                  fill="#fef08a"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {elem.name.slice(0, 20)} (-{elem.depthM}m)
                </text>
              </g>
            );
          })}

          {/* Modern Bored Piles & Shear Wall descending into Bedrock */}
          {site.modernBlueprints.map((item) => {
            const py = groundY + item.depthMinM * pxPerMeter;
            const ph = (item.depthMaxM - item.depthMinM) * pxPerMeter;
            const px = 180 + (item.x / 60) * 440;

            if (item.type === 'shear-core') {
              return (
                <g key={`cross-${item.id}`}>
                  <rect
                    x={px - 20}
                    y={py}
                    width={40}
                    height={ph}
                    fill="rgba(56, 189, 248, 0.3)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <text
                    x={px}
                    y={py + ph - 10}
                    textAnchor="middle"
                    fill="#e0f2fe"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    CORE EMBEDMENT
                  </text>
                </g>
              );
            }

            if (item.type === 'pile') {
              const isConflict = item.status === 'conflict';
              return (
                <g key={`cross-${item.id}`}>
                  <rect
                    x={px - 8}
                    y={py}
                    width={16}
                    height={ph}
                    fill={isConflict ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.25)'}
                    stroke={isConflict ? '#ef4444' : '#38bdf8'}
                    strokeWidth={isConflict ? 2 : 1.2}
                  />
                  {/* Bedrock socket toe */}
                  <polygon
                    points={`${px - 8},${py + ph} ${px + 8},${py + ph} ${px},${py + ph + 12}`}
                    fill={isConflict ? '#ef4444' : '#0284c7'}
                  />
                  <text
                    x={px}
                    y={py + ph + 22}
                    textAnchor="middle"
                    fill={isConflict ? '#fca5a5' : '#7dd3fc'}
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {item.gridRef}
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* Depth Scale on Left Y-Axis */}
          <g className="font-mono text-[9px] fill-slate-400">
            {[0, 5, 10, 15, 20, 25, 30].map((m) => {
              const y = groundY + m * pxPerMeter;
              return (
                <g key={`depth-mark-${m}`}>
                  <line x1="50" y1={y} x2="68" y2={y} stroke="#475569" strokeWidth="1" />
                  <text x="45" y={y + 3} textAnchor="end">
                    -{m}m
                  </text>
                </g>
              );
            })}
          </g>

          {/* Active Depth Z Cursor Line */}
          {(() => {
            const activeY = groundY + Math.abs(depthZ) * pxPerMeter;
            return (
              <g className="pointer-events-none">
                <line
                  x1="55"
                  y1={activeY}
                  x2={svgWidth - 20}
                  y2={activeY}
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                <rect x="svgWidth - 110" y={activeY - 10} width="90" height="20" rx="3" fill="#0c4a6e" stroke="#22d3ee" />
                <text x="svgWidth - 65" y={activeY + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Z = {depthZ.toFixed(1)}m
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/60">
        <p className="text-slate-400">
          Click anywhere in the elevation strata to reposition the active X-Ray depth scanner slice.
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2 bg-amber-500 rounded-xs" /> Historic Masonry
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-2 bg-sky-500 rounded-xs" /> CFA Bored Pile
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2 bg-rose-500 rounded-xs" /> Pier Collision Point
          </span>
        </div>
      </div>
    </div>
  );
};
