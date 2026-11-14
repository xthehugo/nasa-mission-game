import type { RandomEventType } from '../store';
import type { ExperienceMode, PhysicsMetrics } from '../types/mission';

export type HoloToneKind = 'STEP' | 'ALARM' | 'STAR' | 'FILL';

const TONE_SPEC: Record<HoloToneKind, { freq: number; endFreq: number; dur: number; gain: number }> = {
  STEP: { freq: 620, endFreq: 880, dur: 0.09, gain: 0.035 },
  FILL: { freq: 340, endFreq: 520, dur: 0.12, gain: 0.03 },
  STAR: { freq: 740, endFreq: 1120, dur: 0.16, gain: 0.04 },
  ALARM: { freq: 240, endFreq: 180, dur: 0.19, gain: 0.045 },
};

export function playHoloTone(kind: HoloToneKind, enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const spec = TONE_SPEC[kind];

    osc.type = kind === 'ALARM' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(spec.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(spec.endFreq, ctx.currentTime + spec.dur);

    gainNode.gain.setValueAtTime(spec.gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + spec.dur);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + spec.dur + 0.02);
    window.setTimeout(() => {
      ctx.close().catch((err: unknown) => console.warn('AudioContext close:', err));
    }, 260);
  } catch (err) {
    console.warn('Audio feedback skipped:', err);
  }
}

export function computeTankExtraMassKg(
  metrics: PhysicsMetrics,
  tankFillPercent: number,
  oxidizerFillPercent: number,
): number {
  return (
    ((tankFillPercent + oxidizerFillPercent - 160) / 100) *
    Math.max(2, metrics.propellantMass_kg * 0.25)
  );
}

export interface LevelStarsSummary {
  stars: number;
  marginOk: boolean;
  zeroConflicts: boolean;
  budgetOk: boolean;
  effectiveMassKg: number;
}

export function computeLevelStars(
  metrics: PhysicsMetrics,
  conflictsCount: number,
  mode: ExperienceMode,
  activeEvent: RandomEventType,
  tankExtraMassKg = 0,
): LevelStarsSummary {
  const massFactor = activeEvent === 'MASS_PENALTY' ? 1.08 : 1.0;
  const effectiveMassKg = (metrics.wetMass_kg + tankExtraMassKg) * massFactor;
  const minMargin = mode === 'JPL_ENGINEER' ? 40 : 35;
  const stormPenalty = activeEvent === 'SOLAR_STORM' ? 10 : 0;

  const effectivePowerMargin = metrics.power.marginPercent - stormPenalty;
  const marginOk =
    effectiveMassKg <= metrics.launchCapacity_kg &&
    metrics.dryMass.marginPercent >= minMargin &&
    effectivePowerMargin >= minMargin;

  const zeroConflicts = conflictsCount === 0;
  const budgetFloor =
    activeEvent === 'BUDGET_CUT' ? metrics.cost.budgetCapMillionsUSD * 0.15 : 0;
  const budgetOk = metrics.cost.reserveMillionsUSD >= budgetFloor;

  const stars = Number(marginOk) + Number(zeroConflicts) + Number(budgetOk);
  return { stars, marginOk, zeroConflicts, budgetOk, effectiveMassKg };
}
