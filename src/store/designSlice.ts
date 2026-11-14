import type { StateCreator } from 'zustand';
import {
  DEFAULT_MISSION_SELECTION,
  evaluateMissionPhysics,
  findDestinationById,
  findObjectiveById,
  PRESET_MISSION_SELECTIONS,
} from '../engine';
import type {
  MissionSelection,
  PhysicsMetrics,
  SimulationResult,
  SubsystemCategory,
} from '../types/mission';
import {
  computeConcurrentConflicts,
  type ConcurrentConflict,
} from './concurrencySlice';
import { computeMissionScores, type MissionScores } from './missionScoring';
import {
  evaluatePreFlightVerdict,
  type PreFlightVerdict,
  type TestingCampaignState,
} from './testingSlice';
import type { CubeSatFormFactor } from './uiSlice';

export interface DesignSlice {
  selection: MissionSelection;
  metrics: PhysicsMetrics;
  scores: MissionScores;

  setObjective: (objectiveId: string) => void;
  setDestination: (destinationId: string) => void;
  setGroundStation: (groundStationId: string) => void;
  togglePayload: (payloadId: string) => void;
  setSubsystem: (
    category: Exclude<SubsystemCategory, 'PAYLOAD'>,
    optionId: string,
  ) => void;
  loadPreset: (presetKey: string) => void;
  resetDesign: () => void;
}

export const EXTRA_SCENARIO_PRESETS: Record<string, MissionSelection> = {
  'preset-gmat-geo': {
    ...PRESET_MISSION_SELECTIONS['obj-helio-lunar-trailblazer'],
    destinationId: 'dest-geo',
  },
  'preset-fairing-overflow': {
    ...PRESET_MISSION_SELECTIONS['obj-earth-bionutrients'],
    payloadIds: ['pay-sar-radar', 'pay-multispectral'],
    launchVehicleId: 'lv-rideshare',
  },
};

export function equippedIdForCategory(
  selection: MissionSelection,
  cat: SubsystemCategory,
): string | null {
  if (cat === 'PROPULSION') return selection.propulsionId;
  if (cat === 'EPS') return selection.epsId;
  if (cat === 'TELECOM') return selection.telecomId;
  if (cat === 'THERMAL') return selection.thermalId;
  if (cat === 'ADCS') return selection.adcsId;
  if (cat === 'LAUNCH_VEHICLE') return selection.launchVehicleId;
  return null;
}

export function resolvePresetSelection(presetKey: string): MissionSelection {
  return (
    PRESET_MISSION_SELECTIONS[presetKey] ??
    EXTRA_SCENARIO_PRESETS[presetKey] ??
    DEFAULT_MISSION_SELECTION
  );
}

export function deriveOrbitalDefaults(
  destinationId: string,
  volumeUsed_U: number,
): { altitudeKm: number; inclinationDeg: number; formFactor: CubeSatFormFactor } {
  const orbitMap: Record<string, { altitudeKm: number; inclinationDeg: number }> = {
    'dest-leo': { altitudeKm: 550, inclinationDeg: 97.6 },
    'dest-geo': { altitudeKm: 35786, inclinationDeg: 0.0 },
    'dest-moon': { altitudeKm: 100, inclinationDeg: 90.0 },
    'dest-mars': { altitudeKm: 400, inclinationDeg: 93.0 },
    'dest-jupiter': { altitudeKm: 1800, inclinationDeg: 45.0 },
  };
  const orbit = orbitMap[destinationId] ?? orbitMap['dest-leo'];
  const formFactor: CubeSatFormFactor =
    volumeUsed_U <= 1.5
      ? '1.5U'
      : volumeUsed_U <= 2.5
        ? '2U'
        : volumeUsed_U <= 4.5
          ? '3U'
          : 'CUSTOM';

  return {
    altitudeKm: orbit.altitudeKm,
    inclinationDeg: orbit.inclinationDeg,
    formFactor,
  };
}

type FullDesignDeps = DesignSlice & {
  testing: TestingCampaignState;
  preFlightVerdict: PreFlightVerdict;
  concurrentConflicts: ConcurrentConflict[];
  simulationResult: SimulationResult | null;
  orbitAltitudeKm: number;
  orbitInclinationDeg: number;
  cubesatFormFactor: CubeSatFormFactor;
};

export const INITIAL_METRICS = evaluateMissionPhysics(DEFAULT_MISSION_SELECTION);
export const INITIAL_SCORES = computeMissionScores(
  DEFAULT_MISSION_SELECTION,
  INITIAL_METRICS,
);

export const createDesignSlice: StateCreator<FullDesignDeps, [], [], DesignSlice> = (
  set,
  get,
) => {
  const applySelection = (
    nextSelection: MissionSelection,
    syncOptions?: { syncOrbit?: boolean; syncFormFactor?: boolean },
  ) => {
    const nextMetrics = evaluateMissionPhysics(nextSelection);
    const nextScores = computeMissionScores(nextSelection, nextMetrics);
    const nextConflicts = computeConcurrentConflicts(nextSelection, nextMetrics);
    const nextVerdict = evaluatePreFlightVerdict(
      nextMetrics,
      get().testing,
      nextScores.compositeGlobalScore,
    );
    const derived = deriveOrbitalDefaults(
      nextSelection.destinationId,
      nextMetrics.volume.used_U,
    );

    set({
      selection: nextSelection,
      metrics: nextMetrics,
      scores: nextScores,
      concurrentConflicts: nextConflicts,
      preFlightVerdict: nextVerdict,
      simulationResult: null,
      ...(syncOptions?.syncOrbit
        ? {
            orbitAltitudeKm: derived.altitudeKm,
            orbitInclinationDeg: derived.inclinationDeg,
          }
        : {}),
      ...(syncOptions?.syncFormFactor ? { cubesatFormFactor: derived.formFactor } : {}),
    });
  };

  return {
    selection: DEFAULT_MISSION_SELECTION,
    metrics: INITIAL_METRICS,
    scores: INITIAL_SCORES,

    setObjective: (objectiveId) => {
      const objective = findObjectiveById(objectiveId);
      const dest = findDestinationById(objective.targetDestinationId);
      const gsId =
        dest.requiredGroundNetwork === 'DSN_70M'
          ? 'gs-dsn-70m'
          : dest.requiredGroundNetwork === 'DSN_34M'
            ? 'gs-dsn-34m'
            : dest.requiredGroundNetwork === 'NEAR_EARTH_NETWORK'
              ? 'gs-near-earth'
              : 'gs-commercial';

      applySelection(
        {
          ...get().selection,
          objectiveId,
          destinationId: dest.id,
          groundStationId: gsId,
        },
        { syncOrbit: true, syncFormFactor: true },
      );
    },

    setDestination: (destinationId) => {
      applySelection({ ...get().selection, destinationId }, { syncOrbit: true });
    },

    setGroundStation: (groundStationId) => {
      applySelection({ ...get().selection, groundStationId });
    },

    togglePayload: (payloadId) => {
      const current = get().selection;
      const exists = current.payloadIds.includes(payloadId);
      const nextPayloads = exists
        ? current.payloadIds.length > 1
          ? current.payloadIds.filter((id) => id !== payloadId)
          : current.payloadIds
        : [...current.payloadIds, payloadId];
      applySelection({ ...current, payloadIds: nextPayloads });
    },

    setSubsystem: (category, optionId) => {
      const nextSelection: MissionSelection = { ...get().selection };
      switch (category) {
        case 'PROPULSION':
          nextSelection.propulsionId = optionId;
          break;
        case 'EPS':
          nextSelection.epsId = optionId;
          break;
        case 'TELECOM':
          nextSelection.telecomId = optionId;
          break;
        case 'THERMAL':
          nextSelection.thermalId = optionId;
          break;
        case 'ADCS':
          nextSelection.adcsId = optionId;
          break;
        case 'LAUNCH_VEHICLE':
          nextSelection.launchVehicleId = optionId;
          break;
      }
      applySelection(nextSelection);
    },

    loadPreset: (presetKey) => {
      applySelection(resolvePresetSelection(presetKey), {
        syncOrbit: true,
        syncFormFactor: true,
      });
    },

    resetDesign: () => {
      applySelection(DEFAULT_MISSION_SELECTION, {
        syncOrbit: true,
        syncFormFactor: true,
      });
    },
  };
};
