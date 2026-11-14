import { findObjectiveById } from '../engine';
import type { MissionSelection, PhysicsMetrics } from '../types/mission';

export interface MissionScores {
  scienceReturnScore: number;
  engineeringMarginScore: number;
  budgetEfficiencyScore: number;
  budgetOverrun: boolean;
  compositeGlobalScore: number;
  orbitEfficiency: number;
  dataGeneratedGBDay: number;
  dataDownlinkedGBDay: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeMissionScores(
  selection: MissionSelection,
  metrics: PhysicsMetrics,
): MissionScores {
  const objective = findObjectiveById(selection.objectiveId);
  const reqCount = Math.max(1, objective.requiredPayloadIds.length);
  const matchedCount = objective.requiredPayloadIds.filter((id) =>
    selection.payloadIds.includes(id),
  ).length;
  const payloadMatchRatio = matchedCount / reqCount;

  const orbitEfficiency =
    selection.destinationId === objective.targetDestinationId
      ? 1.0
      : selection.destinationId === 'dest-geo' &&
          objective.targetDestinationId === 'dest-leo'
        ? 0.85
        : 0.65;

  const dataGeneratedGBDay = Number(
    (Math.max(1, selection.payloadIds.length) * (objective.minDataRateKbps * 0.0108)).toFixed(2),
  );
  const linkClosed =
    metrics.telecom.linkMargin_dB >= metrics.telecom.requiredMargin_dB;
  const rawDownlinkCapacity = linkClosed
    ? metrics.telecom.dataRate_kbps * 0.0108
    : 0;
  const dataDownlinkedGBDay = Number(
    Math.min(dataGeneratedGBDay, rawDownlinkCapacity).toFixed(2),
  );
  const downlinkRatio =
    dataGeneratedGBDay > 0 ? dataDownlinkedGBDay / dataGeneratedGBDay : 0;

  const scienceReturnScore = Number(
    clamp(100 * (0.45 + 0.55 * payloadMatchRatio) * orbitEfficiency * downlinkRatio, 0, 100).toFixed(1),
  );

  const massNorm = clamp(metrics.dryMass.marginPercent / 35, 0, 1.15) * 100;
  const powerNorm = clamp(metrics.power.marginPercent / 35, 0, 1.15) * 100;
  const engineeringMarginScore = Number(
    clamp(0.5 * massNorm + 0.5 * powerNorm, 0, 100).toFixed(1),
  );

  const cap = Math.max(1, metrics.cost.budgetCapMillionsUSD);
  const budgetOverrun = metrics.cost.totalMillionsUSD > cap;
  const rawBScore = ((cap - metrics.cost.totalMillionsUSD) / cap) * 100;
  const budgetEfficiencyScore = budgetOverrun
    ? 0
    : Number(clamp(rawBScore + 30, 0, 100).toFixed(1));

  const compositeGlobalScore = budgetOverrun
    ? Number(clamp(0.35 * scienceReturnScore, 0, 45).toFixed(1))
    : Number(
        clamp(
          0.5 * scienceReturnScore +
            0.3 * engineeringMarginScore +
            0.2 * budgetEfficiencyScore,
          0,
          100,
        ).toFixed(1),
      );

  return {
    scienceReturnScore,
    engineeringMarginScore,
    budgetEfficiencyScore,
    budgetOverrun,
    compositeGlobalScore,
    orbitEfficiency,
    dataGeneratedGBDay,
    dataDownlinkedGBDay,
  };
}
