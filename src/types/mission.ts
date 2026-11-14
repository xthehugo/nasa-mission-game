/**
 * Shared NASA Space Mission Design Game Contract (`src/types/mission.ts`)
 *
 * Single source of truth connecting:
 * - `src/engine/` (Persona 1: Physics, Catalog & Simulation)
 * - `src/components/` (Persona 2: CML 1-5 Wizard, Zustand Store & Dashboard)
 * - `src/visuals/` (Persona 3: Orbital & Spacecraft Visualizations)
 */

export type Language = 'en' | 'es';

export type ExperienceMode = 'CADET' | 'JPL_ENGINEER';

export interface LocalizedText {
  en: string;
  es: string;
}

export type CMLPhase =
  | 'CML_1'
  | 'CML_2'
  | 'CML_3'
  | 'CML_4'
  | 'CML_5'
  | 'SIMULATION';

export type ScienceDiscipline =
  | 'EARTH_SCIENCE'
  | 'HELIOPHYSICS'
  | 'PLANETARY_SCIENCE'
  | 'ASTROPHYSICS';

export type MissionSegment = 'USER' | 'SPACE' | 'LAUNCH' | 'GROUND';

export type SubsystemCategory =
  | 'PAYLOAD'
  | 'PROPULSION'
  | 'EPS'
  | 'TELECOM'
  | 'THERMAL'
  | 'ADCS'
  | 'LAUNCH_VEHICLE';

export type PropulsionType =
  | 'COLD_GAS'
  | 'MONOPROP'
  | 'BIPROP'
  | 'ELECTRIC_HALL'
  | 'NONE';

export type GroundNetworkType =
  | 'COMMERCIAL_GN'
  | 'NEAR_EARTH_NETWORK'
  | 'DSN_34M'
  | 'DSN_70M';

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type MCRStatus = 'GREEN' | 'YELLOW' | 'RED';

export type SimulationPhaseName =
  | 'LAUNCH_ASCENT'
  | 'ORBIT_INSERTION'
  | 'CRUISE_SPACE_WEATHER'
  | 'SCIENCE_OPERATIONS'
  | 'DATA_DOWNLINK';

export type SimulationSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export type MissionGrade = 'S' | 'A' | 'B' | 'C' | 'FAIL';

export interface RealWorldMissionBenchmark {
  missionName: string;
  launchYear: number;
  actualMass_kg: number;
  actualPower_W: number;
  actualCost_MillionsUSD: number;
  keyTakeaway: LocalizedText;
  nasaReferenceUrl: string;
}

export interface ScienceObjective {
  id: string;
  discipline: ScienceDiscipline;
  title: LocalizedText;
  question: LocalizedText;
  cadetChallenge?: LocalizedText;
  jplConstraints?: LocalizedText;
  targetDestinationId: string;
  requiredPayloadIds: string[];
  minDataRateKbps: number;
  baseBudgetMillions: number;
  targetDurationYears: number;
  realWorldBenchmark: RealWorldMissionBenchmark;
}

export interface OrbitalDestination {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  heliocentricDistanceAU: number;
  requiredDeltaV_ms: number;
  solarIrradiance_Wm2: number;
  eclipseFraction: number;
  oneWayLightTimeSec: number;
  distanceFromEarthKm: number;
  requiredGroundNetwork: GroundNetworkType;
  linkMarginThreshold_dB: number;
  environmentHazard: LocalizedText;
}

export interface SubsystemOption {
  id: string;
  category: SubsystemCategory;
  name: LocalizedText;
  description: LocalizedText;
  tradeOffNote: LocalizedText;
  analogyTooltip: LocalizedText;
  massCBE_kg: number;
  powerDrawNominal_W: number;
  powerDrawPeak_W: number;
  powerGenerated1AU_W: number;
  cost_MillionsUSD: number;
  volume_U: number;
  trl: TRLLevel;
  /**
   * JPL MGA contingency factor derived from TRL:
   * - TRL 8-9: 0.08 (5%-10%)
   * - TRL 6-7: 0.18 (15%-20%)
   * - TRL 4-5: 0.32 (30%-35%)
   * - TRL 1-3: 0.45 (40%-50%)
   */
  mgaContingencyFactor: number;
  isp_s?: number;
  propulsionType?: PropulsionType;
  solarPanelArea_m2?: number;
  isRTG?: boolean;
  freqGHz?: number;
  txPower_W?: number;
  antennaGain_dBi?: number;
  maxDataRate_kbps?: number;
  pointingAccuracy_deg?: number;
  maxPayloadMass_kg?: number;
  fairingVolume_U?: number;
  sourceCitation?: string;
}

export interface GroundStationOption {
  id: string;
  type: GroundNetworkType;
  name: LocalizedText;
  figureOfMerit_G_T_dBK: number;
  costPerMonth_MillionsUSD: number;
  compatibleBands: string[];
}

export interface MissionSelection {
  objectiveId: string;
  destinationId: string;
  payloadIds: string[];
  propulsionId: string;
  epsId: string;
  telecomId: string;
  thermalId: string;
  adcsId: string;
  launchVehicleId: string;
  groundStationId: string;
}

export interface ResourceBreakdown {
  cbe: number;
  mga: number;
  predicted: number;
  allowable: number;
  marginPercent: number;
  status: MCRStatus;
}

export interface MCRChecklistItem {
  id: string;
  segment: MissionSegment;
  label: LocalizedText;
  valueSummary: string;
  targetSummary: string;
  status: MCRStatus;
  feedback: LocalizedText;
}

export interface PowerBreakdown extends ResourceBreakdown {
  generatedAtDestination_W: number;
  eclipseRequired_W: number;
}

export interface TelecomMetrics {
  eirp_dBW: number;
  freeSpaceLoss_dB: number;
  receivedEbN0_dB: number;
  linkMargin_dB: number;
  requiredMargin_dB: number;
  dataRate_kbps: number;
  status: MCRStatus;
}

export interface CostMetrics {
  totalMillionsUSD: number;
  budgetCapMillionsUSD: number;
  reserveMillionsUSD: number;
  status: MCRStatus;
}

export interface VolumeMetrics {
  used_U: number;
  maxFairing_U: number;
  isCompliant: boolean;
}

export interface FlightDirectorAdvice {
  status: MCRStatus;
  headline: LocalizedText;
  humanExplanation: LocalizedText;
}

export interface PhysicsMetrics {
  dryMass: ResourceBreakdown;
  propellantMass_kg: number;
  wetMass_kg: number;
  launchCapacity_kg: number;
  deltaV_available_ms: number;
  deltaV_required_ms: number;
  power: PowerBreakdown;
  telecom: TelecomMetrics;
  cost: CostMetrics;
  volume: VolumeMetrics;
  overallMCRStatus: MCRStatus;
  flightDirectorAdvice: FlightDirectorAdvice;
  mcrChecklist: MCRChecklistItem[];
}

export interface TelemetrySnapshot {
  powerBalance_W: number;
  propellantRemainingPct: number;
  dataTransmitted_GB: number;
  thermalStatusC: number;
}

export interface SimulationEvent {
  id: string;
  phase: SimulationPhaseName;
  timestampMissionDays: number;
  title: LocalizedText;
  description: LocalizedText;
  severity: SimulationSeverity;
  subsystemAffected?: SubsystemCategory;
  telemetrySnapshot: TelemetrySnapshot;
}

export interface CrisisOption {
  id: string;
  label: LocalizedText;
  engineeringJustification: LocalizedText;
  powerImpact_W: number;
  propellantImpact_pct: number;
  scienceScoreImpact: number;
  isOptimal: boolean;
  outcomeNarrative: LocalizedText;
}

export interface InteractiveCrisisDilemma {
  id: string;
  phase: SimulationPhaseName;
  missionDay: number;
  title: LocalizedText;
  situation: LocalizedText;
  triggeredBySubsystem?: SubsystemCategory;
  options: CrisisOption[];
}

export interface SimulationResult {
  missionSuccess: boolean;
  scienceScore: number;
  overallGrade: MissionGrade;
  events: SimulationEvent[];
  dilemmas: InteractiveCrisisDilemma[];
  lessonsLearned: LocalizedText[];
  finalMetrics: PhysicsMetrics;
}

export type RunMissionSimulationFn = (
  selection: MissionSelection,
  metrics: PhysicsMetrics,
  resolvedChoices?: Record<string, string>,
) => SimulationResult;

export const NASA_PHYSICS_CONSTANTS = {
  STANDARD_GRAVITY_MS2: 9.80665,
  SOLAR_CONSTANT_1AU_WM2: 1361,
  BOLTZMANN_DBW_K_HZ: -228.6,
  MCR_GREEN_MARGIN_PCT: 35,
  MCR_YELLOW_MARGIN_PCT: 25,
  LEO_LINK_MARGIN_DB: 6,
  DEEP_SPACE_LINK_MARGIN_DB: 3,
} as const;

export function getMGAContingencyByTRL(trl: TRLLevel): number {
  if (trl >= 8) return 0.08;
  if (trl >= 6) return 0.18;
  if (trl >= 4) return 0.32;
  return 0.45;
}
