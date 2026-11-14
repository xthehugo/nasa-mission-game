import { motion } from 'framer-motion';
import { findGroundStationById, findObjectiveById } from '../engine';
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
  subText,
  pct,
  status,
  amberDefault = false,
  reducedMotion,
}: {
  label: string;
  valueText: string;
  subText?: string;
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
      {subText && (
        <div className="mt-1 font-mono text-[9px] leading-snug text-slate-400">
          {subText}
        </div>
      )}
    </div>
  );
}

export function HudResourceBars() {
  const {
    language,
    experienceMode,
    phase,
    selection,
    metrics,
    scores,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const objective = findObjectiveById(selection.objectiveId);
  const groundStation = findGroundStationById(selection.groundStationId);
  const groundOps =
    groundStation.costPerMonth_MillionsUSD * objective.targetDurationYears * 12;
  const hwCost = Math.max(0, metrics.cost.totalMillionsUSD - groundOps);

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
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
        <span className="text-[#5FF3FF]">
          {isEs ? 'TELEMETRÍA EN VIVO' : 'LIVE TELEMETRY'}
        </span>
        <span
          className={`border px-1.5 py-0.5 text-[8.5px] ${
            isCadet
              ? 'border-[#5FF3FF]/40 text-[#5FF3FF]'
              : 'border-[#FFC15E]/50 text-[#FFC15E]'
          }`}
        >
          {isCadet
            ? isEs
              ? '🎓 GUÍA ESTUDIANTE'
              : '🎓 STUDENT GUIDE'
            : '🛰️ JPL MEV/MGA'}
        </span>
      </div>
      <FineMeter
        label={isEs ? 'MASA HÚMEDA' : 'WET MASS'}
        valueText={`${liveMass.toFixed(1)} / ${metrics.launchCapacity_kg} KG`}
        subText={
          isCadet
            ? massStatus === 'RED'
              ? isEs
                ? '¡Sobrecarga! Sube Isp o cambia a un cohete mayor'
                : 'Overloaded! Needs higher Isp or larger rocket'
              : isEs
                ? `Cabe en el cohete (+${metrics.dryMass.marginPercent.toFixed(0)}% margen)`
                : `Fits inside rocket capacity (+${metrics.dryMass.marginPercent.toFixed(0)}% buffer)`
            : `CBE ${metrics.dryMass.cbe.toFixed(1)} + MGA ${metrics.dryMass.mga.toFixed(1)} + Prop ${metrics.propellantMass_kg.toFixed(1)} kg · ${metrics.dryMass.marginPercent.toFixed(1)}%`
        }
        pct={massPct}
        status={massStatus}
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'ENERGÍA EPS' : 'EPS POWER'}
        valueText={`${powerNet >= 0 ? '+' : ''}${powerNet.toFixed(0)} W`}
        subText={
          isCadet
            ? metrics.power.status === 'RED'
              ? isEs
                ? '¡Déficit eléctrico en sombra/eclipse!'
                : 'Power deficit in eclipse shadow!'
              : isEs
                ? 'Paneles/RTG cubren instrumentos y eclipse'
                : 'Solar/RTG covers instruments + eclipse shadow'
            : `Gen ${metrics.power.generatedAtDestination_W.toFixed(0)}W vs EclReq ${metrics.power.eclipseRequired_W.toFixed(0)}W · ${metrics.power.marginPercent.toFixed(1)}%`
        }
        pct={powerPct}
        status={metrics.power.status}
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'PRESUPUESTO' : 'BUDGET'}
        valueText={`$${metrics.cost.totalMillionsUSD.toFixed(1)}M / $${metrics.cost.budgetCapMillionsUSD}M`}
        subText={
          isCadet
            ? isEs
              ? `Reserva disponible: $${metrics.cost.reserveMillionsUSD.toFixed(1)}M`
              : `Remaining reserve: $${metrics.cost.reserveMillionsUSD.toFixed(1)}M`
            : `HW $${hwCost.toFixed(1)}M + Ops $${groundOps.toFixed(1)}M (Cap $${metrics.cost.budgetCapMillionsUSD}M)`
        }
        pct={budgetUsedPct}
        status={metrics.cost.status}
        amberDefault
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'COFIA & DATOS' : 'FAIRING & DATA'}
        valueText={`${metrics.volume.used_U}/${metrics.volume.maxFairing_U}U · ${scores.dataDownlinkedGBDay}GB`}
        subText={
          isCadet
            ? metrics.volume.isCompliant
              ? isEs
                ? 'Cabe en la cofia del cohete'
                : 'Fits inside rocket nosecone'
              : isEs
                ? '¡Exceso de volumen en cofia!'
                : 'Fairing overflow! Too bulky'
            : `Fairing ${((metrics.volume.used_U / Math.max(1, metrics.volume.maxFairing_U)) * 100).toFixed(0)}% · Downlink ${scores.dataDownlinkedGBDay} GB/day`
        }
        pct={volPct}
        status={metrics.volume.isCompliant ? 'GREEN' : 'RED'}
        reducedMotion={reducedMotion}
      />
      <FineMeter
        label={isEs ? 'ENLACE RF' : 'RF LINK'}
        valueText={`${metrics.telecom.linkMargin_dB.toFixed(1)} DB`}
        subText={
          isCadet
            ? metrics.telecom.status === 'GREEN'
              ? isEs
                ? 'Señal clara hacia antena terrestre'
                : 'Clear signal to Earth ground dish'
              : isEs
                ? 'Señal débil: mejora antena o puntería ADCS'
                : 'Weak signal! Upgrade antenna or ADCS aim'
            : `EIRP ${metrics.telecom.eirp_dBW.toFixed(1)} dBW · Eb/N0 ${metrics.telecom.receivedEbN0_dB.toFixed(1)} dB (Req ≥${metrics.telecom.requiredMargin_dB} dB)`
        }
        pct={rfPct}
        status={metrics.telecom.status}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
