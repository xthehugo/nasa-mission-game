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
    try {
      return window.localStorage.getItem(name);
    } catch (error) {
      console.warn('Unable to read mission state from localStorage:', error);
      return memoryFallback.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch (error) {
      console.warn('Unable to persist mission state to localStorage:', error);
      memoryFallback.set(name, value);
    }
  },
  removeItem: (name) => {
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
        const { selection, metrics, resolvedCrises, maxUnlockedLevel } = get();
        const result = runMissionSimulation(selection, metrics, resolvedCrises);
        set({
          phase: 'SIMULATION',
          maxUnlockedLevel: Math.max(maxUnlockedLevel, 6),
          simulationResult: result,
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
          maxUnlockedLevel: 1,
          activeRandomEvent: 'NONE',
          orbitAltitudeKm: 500,
          orbitInclinationDeg: 51.6,
          tankFillPercent: 80,
          oxidizerFillPercent: 80,
          batteryChargePercent: 90,
          dataBufferPercent: 75,
          resolvedCrises: {},
          simulationResult: null,
          mcrSignedAuthorized: false,
          isCertificateOpen: false,
          decisionLog: createInitialDecisionLog(),
        });
      },
    }),
    {
      name: 'orbital-forge-mission-store-v2',
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
        missionCustomName: state.missionCustomName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        mcrSignedAuthorized: state.mcrSignedAuthorized,
        decisionLog: state.decisionLog,
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
