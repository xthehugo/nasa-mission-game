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
export type StoryChapter = 'ACT_1_CADET' | 'ACT_2_JPL' | 'FREE_SANDBOX';
export type RobotSpotlightZone =
  | 'RESOURCES'
  | 'CHASSIS'
  | 'EPS'
  | 'MISSION'
  | 'HOLOGRAM'
  | 'COMMANDER_HUD'
  | 'LEFT_PANEL'
  | 'RIGHT_PANEL'
  | 'TOP_BAR'
  | 'FOOTER_LEVELS';
export type StoryCinematicId =
  | 'ACT1_PROLOGUE'
  | 'ACT1_T_1_2'
  | 'ACT1_T_2_3'
  | 'ACT1_T_3_4'
  | 'ACT1_T_4_5'
  | 'ACT1_T_5_6'
  | 'ACT1_CLIMAX_JPL_TWIST'
  | 'ACT2_PROLOGUE'
  | 'ACT2_T_1_2'
  | 'ACT2_T_2_3'
  | 'ACT2_T_3_4'
  | 'ACT2_T_4_5'
  | 'ACT2_T_5_6'
  | 'ACT2_FINALE_SANDBOX';

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
  cadetName: string;
  engineerName: string;
  storyChapter: StoryChapter;
  act1Completed: boolean;
  act2Completed: boolean;
  activeCinematicId: StoryCinematicId | null;
  seenCinematics: Record<string, boolean>;
  tutorialStepIndex: number;
  level1TutorialStep: number;
  robotHoverZone: RobotSpotlightZone | null;
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
  setCadetName: (name: string) => void;
  setEngineerName: (name: string) => void;
  setMissionCustomName: (name: string) => void;
  setStoryChapter: (chapter: StoryChapter) => void;
  openCinematic: (id: StoryCinematicId) => void;
  closeCinematic: () => void;
  setTutorialStepIndex: (idx: number) => void;
  setLevel1TutorialStep: (step: number) => void;
  setRobotHoverZone: (zone: RobotSpotlightZone | null) => void;
  advanceToAct2Jpl: (engineerName?: string, missionName?: string) => void;
  completeStoryAndUnlockSandbox: () => void;
  completeOnboarding: (
    mode: ExperienceMode,
    commanderName: string,
    missionName: string,
    cadetNameOverride?: string,
    engineerNameOverride?: string,
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

export function resolveTransitionCinematic(
  fromPhase: CMLPhase,
  toPhase: CMLPhase,
  mode: ExperienceMode,
): StoryCinematicId | null {
  const isJpl = mode === 'JPL_ENGINEER';
  if (fromPhase === 'CML_1' && toPhase === 'CML_2') return isJpl ? 'ACT2_T_1_2' : 'ACT1_T_1_2';
  if (fromPhase === 'CML_2' && toPhase === 'CML_3') return isJpl ? 'ACT2_T_2_3' : 'ACT1_T_2_3';
  if (fromPhase === 'CML_3' && toPhase === 'CML_4') return isJpl ? 'ACT2_T_3_4' : 'ACT1_T_3_4';
  if (fromPhase === 'CML_4' && toPhase === 'CML_5') return isJpl ? 'ACT2_T_4_5' : 'ACT1_T_4_5';
  if (fromPhase === 'CML_5' && toPhase === 'SIMULATION') return isJpl ? 'ACT2_T_5_6' : 'ACT1_T_5_6';
  return null;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  language: 'es',
  experienceMode: 'CADET',
  phase: 'CML_1',
  maxUnlockedLevel: 1,
  teamMode: 'SOLO',
  activeTeamRole: 'MISSION_LEAD',
  missionStatement: DEFAULT_MISSION_STATEMENT_ES,
  cubesatFormFactor: '3U',
  activeSubsystemTab: 'PAYLOAD',
  rightPanelTab: 'ANALYTICS',
  isPitchModalOpen: false,
  isTelemetryOpen: false,

  commanderName: 'Orion',
  cadetName: 'Orion',
  engineerName: 'Vanguard',
  storyChapter: 'ACT_1_CADET',
  act1Completed: false,
  act2Completed: false,
  activeCinematicId: 'ACT1_PROLOGUE',
  seenCinematics: {},
  tutorialStepIndex: 0,
  level1TutorialStep: 0,
  robotHoverZone: null,
  missionCustomName: 'Ícaro-Pionero',
  hasCompletedOnboarding: true,
  isCertificateOpen: false,
  mcrSignedAuthorized: false,
  decisionLog: createInitialDecisionLog(),

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
  setExperienceMode: (experienceMode) =>
    set((s) => ({
      experienceMode,
      commanderName: experienceMode === 'CADET' ? s.cadetName : s.engineerName,
      storyChapter:
        s.storyChapter === 'FREE_SANDBOX'
          ? 'FREE_SANDBOX'
          : experienceMode === 'CADET'
            ? 'ACT_1_CADET'
            : 'ACT_2_JPL',
    })),
  setPhase: (phase) =>
    set((s) => {
      const transId = resolveTransitionCinematic(s.phase, phase, s.experienceMode);
      const shouldPlay =
        transId !== null &&
        s.storyChapter !== 'FREE_SANDBOX' &&
        !s.seenCinematics[transId];
      return {
        phase,
        tutorialStepIndex: 0,
        level1TutorialStep: phase === 'CML_1' ? s.level1TutorialStep : 5,
        maxUnlockedLevel: Math.max(s.maxUnlockedLevel, PHASE_ORDER[phase]),
        activeCinematicId: shouldPlay ? transId : s.activeCinematicId,
        seenCinematics:
          shouldPlay && transId
            ? { ...s.seenCinematics, [transId]: true }
            : s.seenCinematics,
      };
    }),
  unlockAllLevels: () => set({ maxUnlockedLevel: 6 }),
  setTeamMode: (teamMode) => set({ teamMode }),
  setActiveTeamRole: (activeTeamRole) => set({ activeTeamRole }),
  setMissionStatement: (missionStatement) => set({ missionStatement }),
  setCubesatFormFactor: (cubesatFormFactor) =>
    set((s) => ({
      cubesatFormFactor,
      tutorialStepIndex: s.phase === 'CML_1' ? 1 : s.tutorialStepIndex,
      level1TutorialStep:
        s.phase === 'CML_1' && s.level1TutorialStep <= 1 ? 2 : s.level1TutorialStep,
    })),
  setActiveSubsystemTab: (activeSubsystemTab) => set({ activeSubsystemTab }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setPitchModalOpen: (isPitchModalOpen) => set({ isPitchModalOpen }),
  setTelemetryOpen: (isTelemetryOpen) => set({ isTelemetryOpen }),

  setCommanderName: () =>
    set((s) => ({
      commanderName: s.experienceMode === 'CADET' ? 'Orion' : 'Vanguard',
      cadetName: 'Orion',
      engineerName: 'Vanguard',
    })),
  setCadetName: () =>
    set((s) => ({
      cadetName: 'Orion',
      commanderName: s.experienceMode === 'CADET' ? 'Orion' : s.commanderName,
    })),
  setEngineerName: () =>
    set((s) => ({
      engineerName: 'Vanguard',
      commanderName: s.experienceMode === 'JPL_ENGINEER' ? 'Vanguard' : s.commanderName,
    })),
  setMissionCustomName: () => set({ missionCustomName: 'Ícaro-Pionero' }),
  setStoryChapter: (storyChapter) =>
    set((s) => ({
      storyChapter,
      experienceMode:
        storyChapter === 'ACT_1_CADET'
          ? 'CADET'
          : storyChapter === 'ACT_2_JPL'
            ? 'JPL_ENGINEER'
            : s.experienceMode,
      commanderName:
        storyChapter === 'ACT_1_CADET'
          ? 'Orion'
          : storyChapter === 'ACT_2_JPL'
            ? 'Vanguard'
            : s.commanderName,
    })),
  openCinematic: (activeCinematicId) => set({ activeCinematicId }),
  closeCinematic: () =>
    set((s) => ({
      activeCinematicId: null,
      seenCinematics: s.activeCinematicId
        ? { ...s.seenCinematics, [s.activeCinematicId]: true }
        : s.seenCinematics,
    })),
  setTutorialStepIndex: (tutorialStepIndex) => set({ tutorialStepIndex }),
  setLevel1TutorialStep: (level1TutorialStep) => set({ level1TutorialStep }),
  setRobotHoverZone: (robotHoverZone) => set({ robotHoverZone }),
  advanceToAct2Jpl: () =>
    set((s) => {
      const cleanEng = 'Vanguard';
      const cleanMission = 'Ícaro-Pionero';
      return {
        act1Completed: true,
        storyChapter: 'ACT_2_JPL',
        experienceMode: 'JPL_ENGINEER',
        engineerName: cleanEng,
        commanderName: cleanEng,
        missionCustomName: cleanMission,
        phase: 'CML_1',
        maxUnlockedLevel: 1,
        tutorialStepIndex: 0,
        mcrSignedAuthorized: false,
        isCertificateOpen: false,
        activeCinematicId: 'ACT2_PROLOGUE',
        seenCinematics: { ...s.seenCinematics, ACT2_PROLOGUE: true },
        decisionLog: [
          ...s.decisionLog.slice(-24),
          {
            id: `log-act2-${Date.now()}`,
            phase: 'CML_1',
            timestamp: formatClock(),
            label: {
              en: `Promoted to JPL Chief Engineer ${cleanEng} for Europa beacon rescue "${cleanMission}".`,
              es: `Ascendido a Ingeniero Jefe JPL ${cleanEng} para rescate de baliza Europa "${cleanMission}".`,
            },
            impact: 'POSITIVE',
          },
        ],
      };
    }),
  completeStoryAndUnlockSandbox: () =>
    set((s) => ({
      act1Completed: true,
      act2Completed: true,
      storyChapter: 'FREE_SANDBOX',
      maxUnlockedLevel: 6,
      activeCinematicId: null,
      decisionLog: [
        ...s.decisionLog.slice(-24),
        {
          id: `log-sandbox-${Date.now()}`,
          phase: s.phase,
          timestamp: formatClock(),
          label: {
            en: `Icarus-1 beacon recovered! Infinite Forge Sandbox unlocked for ${s.engineerName}.`,
            es: `¡Baliza del Ícaro-1 recuperada! Modo Forja Infinita (Sandbox) desbloqueado para ${s.engineerName}.`,
          },
          impact: 'POSITIVE',
        },
      ],
    })),
  completeOnboarding: (mode) =>
    set((s) => {
      const nextCadet = 'Orion';
      const nextEng = 'Vanguard';
      const activeCommander = mode === 'CADET' ? nextCadet : nextEng;
      const nextChapter: StoryChapter =
        s.storyChapter === 'FREE_SANDBOX'
          ? 'FREE_SANDBOX'
          : mode === 'CADET'
            ? 'ACT_1_CADET'
            : 'ACT_2_JPL';
      return {
        experienceMode: mode,
        storyChapter: nextChapter,
        cadetName: nextCadet,
        engineerName: nextEng,
        commanderName: activeCommander,
        missionCustomName: 'Ícaro-Pionero',
        hasCompletedOnboarding: true,
        tutorialStepIndex: 0,
        decisionLog: [
          ...s.decisionLog.slice(-24),
          {
            id: `log-onboard-${Date.now()}`,
            phase: s.phase,
            timestamp: formatClock(),
            label: {
              en: `${mode === 'CADET' ? 'Cadet' : 'Chief Eng.'} ${activeCommander} commissioned "Ícaro-Pionero" (${mode}).`,
              es: `${mode === 'CADET' ? 'Cadete' : 'Ing. Jefe'} ${activeCommander} comisionó "Ícaro-Pionero" (${mode}).`,
            },
            impact: 'POSITIVE',
          },
        ],
      };
    }),
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
