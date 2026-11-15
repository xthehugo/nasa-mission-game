import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import {
  DEFAULT_MISSION_SELECTION,
  evaluateMissionPhysics,
  runMissionSimulation,
} from '../engine';
import type { SimulationResult } from '../types/mission';
import {
  computeConcurrentConflicts,
  createConcurrencySlice,
  type ConcurrencySlice,
} from './concurrencySlice';
import {
  createDesignSlice,
  INITIAL_METRICS,
  INITIAL_SCORES,
  type DesignSlice,
} from './designSlice';
import { computeMissionScores } from './missionScoring';
import {
  createTestingSlice,
  DEFAULT_TESTING_STATE,
  evaluatePreFlightVerdict,
  type TestingSlice,
} from './testingSlice';
import {
  createInitialDecisionLog,
  createUISlice,
  resolveTransitionCinematic,
  type UISlice,
} from './uiSlice';

export interface SimulationControlSlice {
  resolvedCrises: Record<string, string>;
  simulationResult: SimulationResult | null;
  launchSimulation: () => void;
  resolveCrisis: (crisisId: string, optionId: string) => void;
  resetAllMission: () => void;
}

export type MissionStoreState = UISlice &
  DesignSlice &
  ConcurrencySlice &
  TestingSlice &
  SimulationControlSlice;

const memoryFallback = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return memoryFallback.get(name) ?? null;
    try {
      return window.localStorage.getItem(name);
    } catch (error) {
      console.warn('Unable to read mission state from localStorage:', error);
      return memoryFallback.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      memoryFallback.set(name, value);
      return;
    }
    try {
      window.localStorage.setItem(name, value);
    } catch (error) {
      console.warn('Unable to persist mission state to localStorage:', error);
      memoryFallback.set(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') {
      memoryFallback.delete(name);
      return;
    }
    try {
      window.localStorage.removeItem(name);
    } catch (error) {
      console.warn('Unable to clear mission state in localStorage:', error);
      memoryFallback.delete(name);
    }
  },
};

export const useMissionStore = create<MissionStoreState>()(
  persist(
    (set, get, api) => ({
      ...createUISlice(set, get, api),
      ...createDesignSlice(set, get, api),
      ...createConcurrencySlice(set, get, api),
      ...createTestingSlice(set, get, api),

      concurrentConflicts: computeConcurrentConflicts(
        DEFAULT_MISSION_SELECTION,
        INITIAL_METRICS,
      ),
      preFlightVerdict: evaluatePreFlightVerdict(
        INITIAL_METRICS,
        DEFAULT_TESTING_STATE,
        INITIAL_SCORES.compositeGlobalScore,
      ),

      resolvedCrises: {},
      simulationResult: null,

      launchSimulation: () => {
        const {
          phase,
          experienceMode,
          storyChapter,
          seenCinematics,
          activeCinematicId,
          selection,
          metrics,
          resolvedCrises,
          maxUnlockedLevel,
        } = get();
        const result = runMissionSimulation(selection, metrics, resolvedCrises);
        const transId = resolveTransitionCinematic(phase, 'SIMULATION', experienceMode);
        const shouldPlay =
          transId !== null &&
          storyChapter !== 'FREE_SANDBOX' &&
          !seenCinematics[transId];
        set({
          phase: 'SIMULATION',
          tutorialStepIndex: 0,
          maxUnlockedLevel: Math.max(maxUnlockedLevel, 6),
          simulationResult: result,
          activeCinematicId: shouldPlay ? transId : activeCinematicId,
          seenCinematics:
            shouldPlay && transId
              ? { ...seenCinematics, [transId]: true }
              : seenCinematics,
        });
      },

      resolveCrisis: (crisisId, optionId) => {
        const { selection, metrics, resolvedCrises, simulationResult, appendDecisionLog } =
          get();
        const nextCrises = { ...resolvedCrises, [crisisId]: optionId };
        const nextSim = runMissionSimulation(selection, metrics, nextCrises);
        const dilemma = (simulationResult ?? nextSim).dilemmas.find(
          (d) => d.id === crisisId,
        );
        const opt = dilemma?.options.find((o) => o.id === optionId);

        set({
          resolvedCrises: nextCrises,
          simulationResult: nextSim,
        });

        if (dilemma && opt) {
          appendDecisionLog({
            phase: 'SIMULATION',
            label: {
              en: `Crisis (${dilemma.title.en}): ${opt.label.en}`,
              es: `Crisis (${dilemma.title.es}): ${opt.label.es}`,
            },
            impact: opt.isOptimal ? 'POSITIVE' : 'CRITICAL',
          });
        }
      },

      resetAllMission: () => {
        get().resetDesign();
        get().resetTesting();
        set({
          phase: 'CML_1',
          tutorialStepIndex: 0,
          level1TutorialStep: 0,
          maxUnlockedLevel: 1,
          activeRandomEvent: 'NONE',
          orbitAltitudeKm: 550,
          orbitInclinationDeg: 97.6,
          tankFillPercent: 80,
          oxidizerFillPercent: 80,
          batteryChargePercent: 90,
          dataBufferPercent: 75,
          resolvedCrises: {},
          simulationResult: null,
          mcrSignedAuthorized: false,
          isCertificateOpen: false,
          hullIntegrity: 100,
          activeCinematicId: 'ACT1_PROLOGUE',
          seenCinematics: {},
          decisionLog: createInitialDecisionLog(),
        });
      },
    }),
    {
      name: 'orbital-forge-mission-store-v5',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        language: state.language,
        experienceMode: state.experienceMode,
        phase: state.phase,
        maxUnlockedLevel: state.maxUnlockedLevel,
        teamMode: state.teamMode,
        activeTeamRole: state.activeTeamRole,
        missionStatement: state.missionStatement,
        cubesatFormFactor: state.cubesatFormFactor,
        commanderName: state.commanderName,
        cadetName: state.cadetName,
        engineerName: state.engineerName,
        storyChapter: state.storyChapter,
        act1Completed: state.act1Completed,
        act2Completed: state.act2Completed,
        seenCinematics: state.seenCinematics,
        level1TutorialStep: state.level1TutorialStep,
        missionCustomName: state.missionCustomName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        mcrSignedAuthorized: state.mcrSignedAuthorized,
        decisionLog: state.decisionLog,
        playerXP: state.playerXP,
        campaignProgress: state.campaignProgress,
        hullIntegrity: state.hullIntegrity,
        orbitAltitudeKm: state.orbitAltitudeKm,
        orbitInclinationDeg: state.orbitInclinationDeg,
        tankFillPercent: state.tankFillPercent,
        oxidizerFillPercent: state.oxidizerFillPercent,
        batteryChargePercent: state.batteryChargePercent,
        dataBufferPercent: state.dataBufferPercent,
        reducedMotion: state.reducedMotion,
        soundEnabled: state.soundEnabled,
        activeRandomEvent: state.activeRandomEvent,
        selection: state.selection,
        testing: state.testing,
        resolvedCrises: state.resolvedCrises,
        concurrencyRevision: state.concurrencyRevision,
        lastValidatedAt: state.lastValidatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.cadetName = state.cadetName || 'Orion';
        state.engineerName = state.engineerName || 'Vanguard';
        state.commanderName = state.commanderName || (state.experienceMode === 'CADET' ? state.cadetName : state.engineerName);
        state.missionCustomName = state.missionCustomName || 'Ícaro-Pionero';
        if (!state.seenCinematics?.ACT1_PROLOGUE && state.storyChapter === 'ACT_1_CADET') {
          state.activeCinematicId = 'ACT1_PROLOGUE';
        }
        const nextMetrics = evaluateMissionPhysics(state.selection);
        const nextScores = computeMissionScores(state.selection, nextMetrics);
        state.metrics = nextMetrics;
        state.scores = nextScores;
        state.concurrentConflicts = computeConcurrentConflicts(
          state.selection,
          nextMetrics,
        );
        state.preFlightVerdict = evaluatePreFlightVerdict(
          nextMetrics,
          state.testing,
          nextScores.compositeGlobalScore,
        );
        if (state.phase === 'SIMULATION') {
          state.simulationResult = runMissionSimulation(
            state.selection,
            nextMetrics,
            state.resolvedCrises,
          );
        }
      },
    },
  ),
);
