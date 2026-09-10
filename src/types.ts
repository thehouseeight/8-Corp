export type DimensionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface DimensionMetadata {
  dimension: DimensionLevel;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  unit: string;
  metricLabel: string;
  currentValue: string | number;
  status: 'nominal' | 'active' | 'calibrating' | 'alert';
}

export type SpectralFilter =
  | 'muon-xray'
  | 'gpr-radar'
  | 'ultrasonic'
  | 'thermal-infrared'
  | 'cad-phosphor'
  | 'composite-8d';

export type ViewMode = 'dual-split' | 'overlay-blend' | 'xray-strata' | 'blueprint-cad' | 'cross-section';

export interface FoundationElement {
  id: string;
  name: string;
  epoch: string;
  century: string;
  material: string;
  depthM: number;
  heightM: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  type: 'wall' | 'arch' | 'column' | 'crypt' | 'cistern' | 'chamber' | 'footing';
  compressiveStrengthMPa: number;
  preservationIndexPct: number;
  notes: string;
}

export interface ModernStructuralElement {
  id: string;
  gridRef: string;
  type: 'pile' | 'shear-core' | 'column' | 'grade-beam' | 'retaining-wall' | 'elevator-shaft';
  material: string;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  depthMinM: number;
  depthMaxM: number;
  axialLoadKN: number;
  safetyFactor: number;
  status: 'aligned' | 'conflict' | 'isolated' | 'cantilevered';
}

export interface StructuralConflict {
  id: string;
  modernId: string;
  ancientId: string;
  x: number;
  y: number;
  depthZ: number;
  severity: 'critical' | 'moderate' | 'nominal';
  overlapM: number;
  stressConcentrationMPa: number;
  title: string;
  description: string;
  reconstructionSolution: string;
}

export interface SoilStrataLayer {
  name: string;
  depthRange: [number, number]; // [min, max] in meters
  color: string;
  densityKgm3: number;
  moisturePct: number;
  shearModulusMPa: number;
  archaeologicalHorizon: string;
}

export interface SiteProject {
  id: string;
  code: string;
  name: string;
  designation: string;
  city: string;
  country: string;
  coordinatesGeo: string;
  scaleRatio: string;
  gridDimensions: { widthM: number; lengthM: number; maxDepthM: number };
  epochs: string[];
  currentEpochIndex: number;
  historicalFoundations: FoundationElement[];
  modernBlueprints: ModernStructuralElement[];
  conflicts: StructuralConflict[];
  strata: SoilStrataLayer[];
  summary: string;
  restorationVision: string;
}

export interface ProbePoint {
  x: number;
  y: number;
  z: number;
  surfaceGroundLevelM: number;
  ancientElement?: FoundationElement;
  modernElement?: ModernStructuralElement;
  soilLayer?: SoilStrataLayer;
  activeConflict?: StructuralConflict;
  moisturePct: number;
  vibrationHz: number;
  bearingCapacityKPa: number;
  aiAudit?: {
    summary: string;
    intervention: string;
    safetyScore: number;
    charterCompliance: string;
  };
}
