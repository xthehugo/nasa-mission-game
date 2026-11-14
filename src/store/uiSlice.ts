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

  commanderName: string;
  missionCustomName: string;
  hasCompletedOnboarding: boolean;
  isCertificateOpen: boolean;
  mcrSignedAuthorized: boolean;
  decisionLog: DecisionLogEntry[];

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

export const DEFAULT_MISSION_STATEMENT =
  'Desplegar un satélite científico autónomo para validar biología orbital y telemetría dentro de márgenes NASA.';

export function createInitialDecisionLog(): DecisionLogEntry[] {
  return [
    {
      id: 'log-init',
      phase: 'CML_1',
      timestamp: 'T-00:00',
      label: {
        en: 'Holographic blueprint initialized by CMDR Vega.',
        es: 'Proyección holográfica inicializada con Comandante Vega.',
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
  language: 'es',
  experienceMode: 'CADET',
  phase: 'CML_1',
  maxUnlockedLevel: 1,
  teamMode: 'SOLO',
  activeTeamRole: 'MISSION_LEAD',
  missionStatement: DEFAULT_MISSION_STATEMENT,
  cubesatFormFactor: '2U',
  activeSubsystemTab: 'PAYLOAD',
  rightPanelTab: 'ANALYTICS',
  isPitchModalOpen: false,
  isTelemetryOpen: false,

  commanderName: 'Vega',
  missionCustomName: 'Inti-1',
  hasCompletedOnboarding: true,
  isCertificateOpen: false,
  mcrSignedAuthorized: false,
  decisionLog: createInitialDecisionLog(),

  orbitAltitudeKm: 500,
  orbitInclinationDeg: 51.6,
  tankFillPercent: 80,
  oxidizerFillPercent: 80,
  batteryChargePercent: 90,
  dataBufferPercent: 75,
  laserScanActive: true,
  reducedMotion: false,
  soundEnabled: true,
  activeRandomEvent: 'NONE',

  setLanguage: (language) => set({ language }),
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

  setCommanderName: (commanderName) => set({ commanderName }),
  setMissionCustomName: (missionCustomName) => set({ missionCustomName }),
  completeOnboarding: (mode, rawCommander, rawMission) =>
    set((s) => ({
      experienceMode: mode,
      commanderName: rawCommander.trim() || 'Vega',
      missionCustomName: rawMission.trim() || 'Inti-1',
      hasCompletedOnboarding: true,
      decisionLog: [
        ...s.decisionLog.slice(-24),
        {
          id: `log-onboard-${Date.now()}`,
          phase: s.phase,
          timestamp: formatClock(),
          label: {
            en: `CMDR ${rawCommander.trim() || 'Vega'} commissioned "${rawMission.trim() || 'Inti-1'}" (${mode}).`,
            es: `CMDR ${rawCommander.trim() || 'Vega'} comisionó "${rawMission.trim() || 'Inti-1'}" (${mode}).`,
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
