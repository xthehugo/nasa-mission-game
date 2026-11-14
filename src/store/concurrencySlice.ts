import type { StateCreator } from 'zustand';
import { findSubsystemById } from '../engine';
import type {
  LocalizedText,
  MissionSelection,
  PhysicsMetrics,
  SubsystemCategory,
} from '../types/mission';
import type { TeamRole } from './uiSlice';

export interface ConcurrentConflict {
  id: string;
  severity: 'WARNING' | 'CRITICAL';
  affectedSubsystems: SubsystemCategory[];
  message: LocalizedText;
}

export interface ConcurrencySlice {
  concurrencyRevision: number;
  lastValidatedAt: string | null;
  lastValidatedByRole: TeamRole | null;
  concurrentConflicts: ConcurrentConflict[];
  commitAndValidate: (role: TeamRole) => void;
}

export function computeConcurrentConflicts(
  selection: MissionSelection,
  metrics: PhysicsMetrics,
): ConcurrentConflict[] {
  const conflicts: ConcurrentConflict[] = [];
  const adcs = findSubsystemById(selection.adcsId);
  const telecom = findSubsystemById(selection.telecomId);
  const thermal = findSubsystemById(selection.thermalId);

  if (metrics.power.marginPercent < 25) {
    conflicts.push({
      id: 'conflict-eps-deficit',
      severity: metrics.power.marginPercent < 0 ? 'CRITICAL' : 'WARNING',
      affectedSubsystems: ['EPS', 'PAYLOAD', 'TELECOM'],
      message: {
        en: `Bus power draw (${metrics.power.eclipseRequired_W.toFixed(0)} W req) conflicts with EPS supply (${metrics.power.generatedAtDestination_W.toFixed(0)} W gen).`,
        es: `El consumo del bus (${metrics.power.eclipseRequired_W.toFixed(0)} W req) entra en conflicto con EPS (${metrics.power.generatedAtDestination_W.toFixed(0)} W gen).`,
      },
    });
  }

  if (
    telecom &&
    adcs &&
    (telecom.id === 'telecom-laser' || telecom.id === 'telecom-xka') &&
    (adcs.pointingAccuracy_deg ?? 5) > 0.5
  ) {
    conflicts.push({
      id: 'conflict-adcs-telecom',
      severity: 'CRITICAL',
      affectedSubsystems: ['ADCS', 'TELECOM'],
      message: {
        en: `${telecom.name.en} beam requires fine pointing (≤0.5°), incompatible with ${adcs.name.en} (±${adcs.pointingAccuracy_deg}°).`,
        es: `${telecom.name.es} exige puntería fina (≤0.5°), incompatible con ${adcs.name.es} (±${adcs.pointingAccuracy_deg}°).`,
      },
    });
  }

  if (
    thermal?.id === 'therm-passive' &&
    (selection.destinationId === 'dest-mars' ||
      selection.destinationId === 'dest-jupiter' ||
      selection.payloadIds.includes('pay-ir-spectrometer'))
  ) {
    conflicts.push({
      id: 'conflict-thermal-cryo',
      severity: 'WARNING',
      affectedSubsystems: ['THERMAL', 'PAYLOAD'],
      message: {
        en: 'Passive MLI alone risks thermal soak failure for IR optics or deep-space propellant lines.',
        es: 'El MLI pasivo solo arriesga congelación en óptica IR o líneas de propelente en espacio profundo.',
      },
    });
  }

  if (!metrics.volume.isCompliant || metrics.wetMass_kg > metrics.launchCapacity_kg) {
    conflicts.push({
      id: 'conflict-launch-envelope',
      severity: 'CRITICAL',
      affectedSubsystems: ['LAUNCH_VEHICLE', 'PAYLOAD'],
      message: {
        en: `Spacecraft (${metrics.wetMass_kg.toFixed(1)} kg, ${metrics.volume.used_U}U) exceeds launcher limit (${metrics.launchCapacity_kg} kg, ${metrics.volume.maxFairing_U}U).`,
        es: `La nave (${metrics.wetMass_kg.toFixed(1)} kg, ${metrics.volume.used_U}U) supera el límite del cohete (${metrics.launchCapacity_kg} kg, ${metrics.volume.maxFairing_U}U).`,
      },
    });
  }

  if (metrics.telecom.linkMargin_dB < metrics.telecom.requiredMargin_dB) {
    conflicts.push({
      id: 'conflict-link-margin',
      severity: 'CRITICAL',
      affectedSubsystems: ['TELECOM', 'ADCS'],
      message: {
        en: `RF/Optical link margin (${metrics.telecom.linkMargin_dB.toFixed(1)} dB) falls below required ${metrics.telecom.requiredMargin_dB} dB.`,
        es: `El margen de enlace (${metrics.telecom.linkMargin_dB.toFixed(1)} dB) cae bajo el mínimo de ${metrics.telecom.requiredMargin_dB} dB.`,
      },
    });
  }

  return conflicts;
}

export const createConcurrencySlice: StateCreator<
  ConcurrencySlice & { selection: MissionSelection; metrics: PhysicsMetrics },
  [],
  [],
  ConcurrencySlice
> = (set, get) => ({
  concurrencyRevision: 1,
  lastValidatedAt: null,
  lastValidatedByRole: null,
  concurrentConflicts: [],

  commitAndValidate: (role) => {
    const { selection, metrics, concurrencyRevision } = get();
    set({
      concurrencyRevision: concurrencyRevision + 1,
      lastValidatedAt: new Date().toLocaleTimeString(),
      lastValidatedByRole: role,
      concurrentConflicts: computeConcurrentConflicts(selection, metrics),
    });
  },
});
