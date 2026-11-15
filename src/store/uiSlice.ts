import type { StateCreator } from 'zustand';
import type {
  CMLPhase,
  ExperienceMode,
  Language,
  SubsystemCategory,
} from '../types/mission';

export type TeamMode = 'SOLO' | 'TEAM_4';
export type TeamRole =
  | 'MISSION_LEAD'
  | 'PAYLOAD_ENG'
  | 'BUS_ENG'
  | 'OPS_LAUNCH_ENG';
export type RightPanelTab = 'VISUALS' | 'ANALYTICS';
export type CubeSatFormFactor = '1.5U' | '2U' | '3U' | 'CUSTOM';
export type RandomEventType = 'NONE' | 'BUDGET_CUT' | 'SOLAR_STORM' | 'MASS_PENALTY';

export interface DecisionLogEntry {
  id: string;
  phase: CMLPhase;
  timestamp: string;
  label: { en: string; es: string };
  impact: 'POSITIVE' | 'WARNING' | 'CRITICAL';
}

const PHASE_ORDER: Record<CMLPhase, number> = {
  CML_1: 1,
  CML_2: 2,
  CML_3: 3,
  CML_4: 4,
  CML_5: 5,
  SIMULATION: 6,
};

export interface UISlice {
  language: Language;
  experienceMode: ExperienceMode;
  phase: CMLPhase;
  maxUnlockedLevel: number;
  teamMode: TeamMode;
  activeTeamRole: TeamRole;
  missionStatement: string;
  cubesatFormFactor: CubeSatFormFactor;
  activeSubsystemTab: SubsystemCategory;
  rightPanelTab: RightPanelTab;
  isPitchModalOpen: boolean;
  isTelemetryOpen: boolean;
  isCampaignModalOpen: boolean;
  isAIStudioModalOpen: boolean;

  commanderName: string;
  missionCustomName: string;
  hasCompletedOnboarding: boolean;
  isCertificateOpen: boolean;
  mcrSignedAuthorized: boolean;
  decisionLog: DecisionLogEntry[];

  playerXP: number;
  campaignProgress: Record<string, { stars: number; completed: boolean; bestGrade?: string }>;
  hullIntegrity: number;

  orbitAltitudeKm: number;
  orbitInclinationDeg: number;
  tankFillPercent: number;
  oxidizerFillPercent: number;
  batteryChargePercent: number;
  dataBufferPercent: number;
  laserScanActive: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  activeRandomEvent: RandomEventType;

  setLanguage: (language: Language) => void;
  setExperienceMode: (mode: ExperienceMode) => void;
  setPhase: (phase: CMLPhase) => void;
  unlockAllLevels: () => void;
  setTeamMode: (mode: TeamMode) => void;
  setActiveTeamRole: (role: TeamRole) => void;
  setMissionStatement: (statement: string) => void;
  setCubesatFormFactor: (formFactor: CubeSatFormFactor) => void;
  setActiveSubsystemTab: (tab: SubsystemCategory) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setPitchModalOpen: (open: boolean) => void;
  setTelemetryOpen: (open: boolean) => void;
  setCampaignModalOpen: (open: boolean) => void;
  setAIStudioModalOpen: (open: boolean) => void;
  addXP: (amount: number) => void;
  recordContractResult: (contractId: string, stars: number, grade?: string) => void;
  damageHull: (amount: number) => void;
  repairHull: (amount: number) => void;
  resetHull: () => void;

  setCommanderName: (name: string) => void;
  setMissionCustomName: (name: string) => void;
  completeOnboarding: (
    mode: ExperienceMode,
    commanderName: string,
    missionName: string,
  ) => void;
  reopenOnboarding: () => void;
  setCertificateOpen: (open: boolean) => void;
  setMcrSignedAuthorized: (signed: boolean) => void;
  appendDecisionLog: (entry: Omit<DecisionLogEntry, 'id' | 'timestamp'>) => void;

  setOrbitParams: (altitudeKm: number, inclinationDeg: number) => void;
  setTankLevels: (
    partial: Partial<{
      tankFillPercent: number;
      oxidizerFillPercent: number;
      batteryChargePercent: number;
      dataBufferPercent: number;
    }>,
  ) => void;
  fillAllTanks: () => void;
  toggleLaserScan: () => void;
  toggleReducedMotion: () => void;
  toggleSound: () => void;
  triggerRandomEvent: () => void;
}

export const DEFAULT_MISSION_STATEMENT_EN =
  'Design a 3U CubeSat with ≥ 35% margin to detect environmental changes from LEO.';
export const DEFAULT_MISSION_STATEMENT_ES =
  'Diseñar un CubeSat 3U con margen ≥ 35% para detectar cambios ambientales desde LEO.';
export const DEFAULT_MISSION_STATEMENT = DEFAULT_MISSION_STATEMENT_EN;

export function createInitialDecisionLog(): DecisionLogEntry[] {
  return [
    {
      id: 'log-init',
      phase: 'CML_1',
      timestamp: 'T-00:00',
      label: {
        en: 'Holographic blueprint initialized by CMDR Orion.',
        es: 'Proyección holográfica inicializada por CMDR Orion.',
      },
      impact: 'POSITIVE',
    },
  ];
}

function formatClock(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const EVENT_CYCLE: RandomEventType[] = ['NONE', 'BUDGET_CUT', 'SOLAR_STORM', 'MASS_PENALTY'];

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  language: 'en',
  experienceMode: 'CADET',
  phase: 'CML_1',
  maxUnlockedLevel: 1,
  teamMode: 'SOLO',
  activeTeamRole: 'MISSION_LEAD',
  missionStatement: DEFAULT_MISSION_STATEMENT_EN,
  cubesatFormFactor: '3U',
  activeSubsystemTab: 'PAYLOAD',
  rightPanelTab: 'ANALYTICS',
  isPitchModalOpen: false,
  isTelemetryOpen: false,
  isCampaignModalOpen: false,
  isAIStudioModalOpen: false,

  commanderName: 'Orion',
  missionCustomName: 'Inti-1',
  hasCompletedOnboarding: false,
  isCertificateOpen: false,
  mcrSignedAuthorized: false,
  decisionLog: createInitialDecisionLog(),

  playerXP: 0,
  campaignProgress: { 'contract-leo-bionutrients': { stars: 0, completed: false } },
  hullIntegrity: 100,

  orbitAltitudeKm: 550,
  orbitInclinationDeg: 97.6,
  tankFillPercent: 80,
  oxidizerFillPercent: 80,
  batteryChargePercent: 90,
  dataBufferPercent: 75,
  laserScanActive: true,
  reducedMotion: false,
  soundEnabled: true,
  activeRandomEvent: 'NONE',

  setLanguage: (language) =>
    set((s) => {
      const isDefaultStatement =
        s.missionStatement === DEFAULT_MISSION_STATEMENT_EN ||
        s.missionStatement === DEFAULT_MISSION_STATEMENT_ES;
      return {
        language,
        missionStatement: isDefaultStatement
          ? language === 'es'
            ? DEFAULT_MISSION_STATEMENT_ES
            : DEFAULT_MISSION_STATEMENT_EN
          : s.missionStatement,
      };
    }),
  setExperienceMode: (experienceMode) => set({ experienceMode }),
  setPhase: (phase) =>
    set((s) => ({
      phase,
      maxUnlockedLevel: Math.max(s.maxUnlockedLevel, PHASE_ORDER[phase]),
    })),
  unlockAllLevels: () => set({ maxUnlockedLevel: 6 }),
  setTeamMode: (teamMode) => set({ teamMode }),
  setActiveTeamRole: (activeTeamRole) => set({ activeTeamRole }),
  setMissionStatement: (missionStatement) => set({ missionStatement }),
  setCubesatFormFactor: (cubesatFormFactor) => set({ cubesatFormFactor }),
  setActiveSubsystemTab: (activeSubsystemTab) => set({ activeSubsystemTab }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setPitchModalOpen: (isPitchModalOpen) => set({ isPitchModalOpen }),
  setTelemetryOpen: (isTelemetryOpen) => set({ isTelemetryOpen }),
  setCampaignModalOpen: (isCampaignModalOpen) => set({ isCampaignModalOpen }),
  setAIStudioModalOpen: (isAIStudioModalOpen) => set({ isAIStudioModalOpen }),
  addXP: (amount) => set((s) => ({ playerXP: Math.max(0, s.playerXP + amount) })),
  recordContractResult: (contractId, stars, grade) =>
    set((s) => {
      const prev = s.campaignProgress[contractId] || { stars: 0, completed: false };
      return {
        campaignProgress: {
          ...s.campaignProgress,
          [contractId]: {
            stars: Math.max(prev.stars, stars),
            completed: true,
            bestGrade: grade ?? prev.bestGrade,
          },
        },
      };
    }),
  damageHull: (amount) =>
    set((s) => ({ hullIntegrity: Math.max(0, Math.min(100, s.hullIntegrity - amount)) })),
  repairHull: (amount) =>
    set((s) => ({ hullIntegrity: Math.max(0, Math.min(100, s.hullIntegrity + amount)) })),
  resetHull: () => set({ hullIntegrity: 100 }),

  setCommanderName: (commanderName) => set({ commanderName }),
  setMissionCustomName: (missionCustomName) => set({ missionCustomName }),
  completeOnboarding: (mode, rawCommander, rawMission) =>
    set((s) => ({
      experienceMode: mode,
      commanderName: rawCommander.trim() || 'Orion',
      missionCustomName: rawMission.trim() || 'Inti-1',
      hasCompletedOnboarding: true,
      decisionLog: [
        ...s.decisionLog.slice(-24),
        {
          id: `log-onboard-${Date.now()}`,
          phase: s.phase,
          timestamp: formatClock(),
          label: {
            en: `CMDR ${rawCommander.trim() || 'Orion'} commissioned "${rawMission.trim() || 'Inti-1'}" (${mode}).`,
            es: `CMDR ${rawCommander.trim() || 'Orion'} comisionó "${rawMission.trim() || 'Inti-1'}" (${mode}).`,
          },
          impact: 'POSITIVE',
        },
      ],
    })),
  reopenOnboarding: () => set({ hasCompletedOnboarding: false }),
  setCertificateOpen: (isCertificateOpen) => set({ isCertificateOpen }),
  setMcrSignedAuthorized: (mcrSignedAuthorized) => set({ mcrSignedAuthorized }),
  appendDecisionLog: (entry) =>
    set((s) => ({
      decisionLog: [
        ...s.decisionLog.slice(-24),
        { ...entry, id: `log-${Date.now()}-${s.decisionLog.length}`, timestamp: formatClock() },
      ],
    })),

  setOrbitParams: (orbitAltitudeKm, orbitInclinationDeg) =>
    set({ orbitAltitudeKm, orbitInclinationDeg }),
  setTankLevels: (partial) => set((s) => ({ ...s, ...partial })),
  fillAllTanks: () =>
    set({
      tankFillPercent: 100,
      oxidizerFillPercent: 100,
      batteryChargePercent: 100,
      dataBufferPercent: 100,
    }),
  toggleLaserScan: () => set((s) => ({ laserScanActive: !s.laserScanActive })),
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  triggerRandomEvent: () =>
    set((s) => {
      const idx = EVENT_CYCLE.indexOf(s.activeRandomEvent);
      return { activeRandomEvent: EVENT_CYCLE[(idx + 1) % EVENT_CYCLE.length] };
    }),
});
