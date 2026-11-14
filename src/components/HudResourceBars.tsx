import { motion } from 'framer-motion';
import { useMissionStore } from '../store';
import type { MCRStatus } from '../types/mission';
import { computeTankExtraMassKg } from './holoAudio';

function lineColor(status: MCRStatus, amberDefault = false): string {
  if (status === 'RED') return 'bg-[#FF4D6D] shadow-[0_0_8px_#FF4D6D]';
  if (status === 'YELLOW' || amberDefault) return 'bg-[#FFC15E] shadow-[0_0_8px_#FFC15E]';
  return 'bg-[#5FF3FF] shadow-[0_0_8px_#5FF3FF]';
}

function FineMeter({
  label,
  valueText,
  pct,
  status,
  amberDefault = false,
  reducedMotion,
}: {
  label: string;
  valueText: string;
  pct: number;
  status: MCRStatus;
  amberDefault?: boolean;
  reducedMotion: boolean;
}) {
  const clamped = Math.max(4, Math.min(100, pct));
  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] tracking-[0.12em] uppercase">
        <span className="text-slate-400">{label}</span>
        <span className={status === 'RED' ? 'text-[#FF4D6D]' : amberDefault ? 'text-[#FFC15E]' : 'text-slate-100'}>
          {valueText}
        </span>
      </div>
      <div className="mt-1 h-[2px] w-full bg-[#5FF3FF]/15">
        <motion.div
          className={`h-full ${lineColor(status, amberDefault)}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.45 }}
        />
      </div>
    </div>
  );
}

export function HudResourceBars() {
  const {
    language,
    phase,
    metrics,
    scores,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
  } = useMissionStore();

  const isEs = language === 'es';
  const extraKg =
    phase === 'CML_4'
      ? computeTankExtraMassKg(metrics, tankFillPercent, oxidizerFillPercent)
      : 0;
  const liveMass = Math.max(1, metrics.wetMass_kg + extraKg);
  const massPct = (liveMass / Math.max(1, metrics.launchCapacity_kg)) * 100;
  const massStatus: MCRStatus = massPct > 100 ? 'RED' : metrics.dryMass.status;

  const powerNet = metrics.power.generatedAtDestination_W - metrics.power.eclipseRequired_W;
  const powerPct =
    (metrics.power.generatedAtDestination_W / Math.max(1, metrics.power.eclipseRequired_W * 1.35)) *
    100;
  const budgetUsedPct =
    (metrics.cost.totalMillionsUSD / Math.max(1, metrics.cost.budgetCapMillionsUSD)) * 100;
  const volPct = (metrics.volume.used_U / Math.max(1, metrics.volume.maxFairing_U)) * 100;
  const rfPct = ((metrics.telecom.linkMargin_dB + 4) / 14) * 100;

  return (
    <div className="space-y-1 border-b border-[#5FF3FF]/20 pb-3">
      <div className="font-mono text-[10px] tracking-[0.18em] text-[#5FF3FF] uppercase">
        {isEs ? 'TELEMETRÍA EN VIVO' : 'LIVE TELEMETRY'}
      </div>
      <FineMeter
        label={isEs ? 'MASA HÚMEDA' : 'WET MASS'}
        valueText={`${liveMass.toFixed(1)} / ${metrics.launchCapacity_kg} KG`}
        pct={massPct}
        status={massStatus}
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'ENERGÍA EPS' : 'EPS POWER'}
        valueText={`${powerNet >= 0 ? '+' : ''}${powerNet.toFixed(0)} W`}
        pct={powerPct}
        status={metrics.power.status}
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'PRESUPUESTO' : 'BUDGET'}
        valueText={`$${metrics.cost.totalMillionsUSD.toFixed(1)}M / $${metrics.cost.budgetCapMillionsUSD}M`}
        pct={budgetUsedPct}
        status={metrics.cost.status}
        amberDefault
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'COFIA & DATOS' : 'FAIRING & DATA'}
        valueText={`${metrics.volume.used_U}/${metrics.volume.maxFairing_U}U · ${scores.dataDownlinkedGBDay}GB`}
        pct={volPct}
        status={metrics.volume.isCompliant ? 'GREEN' : 'RED'}
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'ENLACE RF' : 'RF LINK'}
        valueText={`${metrics.telecom.linkMargin_dB.toFixed(1)} DB`}
        pct={rfPct}
        status={metrics.telecom.status}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
