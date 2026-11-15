import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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
  expanded,
  onToggle,
}: {
  label: string;
  valueText: string;
  subText?: string;
  pct: number;
  status: MCRStatus;
  amberDefault?: boolean;
  reducedMotion: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const clamped = Math.max(4, Math.min(100, pct));
  return (
    <button
      type="button"
      onClick={onToggle}
      title={subText}
      className="group w-full py-1 text-left transition hover:bg-[#5FF3FF]/5"
    >
      <div className="flex items-baseline justify-between gap-2 font-mono text-[13px] tracking-[0.06em] uppercase">
        <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white">
          <span>{label}</span>
          {subText && (
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-150 ${
                expanded ? 'rotate-180 text-[#5FF3FF]' : ''
              }`}
            />
          )}
        </span>
        <span
          className={`font-semibold transition-colors ${
            status === 'RED'
              ? 'text-[#FF4D6D]'
              : amberDefault || status === 'YELLOW'
                ? 'text-[#FFC15E]'
                : 'text-slate-100'
          }`}
        >
          {valueText}
        </span>
      </div>
      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[#5FF3FF]/15">
        <motion.div
          className={`h-full ${lineColor(status, amberDefault)} ${
            !reducedMotion && (status === 'RED' || status === 'YELLOW') ? 'animate-pulse' : ''
          }`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.45 }}
        />
      </div>
      {subText && expanded && (
        <div className="mt-1.5 font-mono text-[12px] leading-snug text-slate-300">
          {subText}
        </div>
      )}
    </button>
  );
}

export function HudResourceBars() {
  const {
    language,
    experienceMode,
    phase,
    level1TutorialStep,
    selection,
    metrics,
    scores,
    activeRandomEvent,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
  } = useMissionStore();

  const isEs = language === 'es';
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [telemetryExpanded, setTelemetryExpanded] = useState(
    !(phase === 'CML_1' && level1TutorialStep > 0),
  );
  const [prevStep, setPrevStep] = useState(level1TutorialStep);
  if (level1TutorialStep !== prevStep) {
    setPrevStep(level1TutorialStep);
    if (phase === 'CML_1') {
      setTelemetryExpanded(level1TutorialStep === 0);
    }
  }
  const toggleMetric = (key: string) =>
    setExpandedMetric((prev) => (prev === key ? null : key));
  const isCadet = experienceMode === 'CADET';
  const objective = findObjectiveById(selection.objectiveId);
  const groundStation = findGroundStationById(selection.groundStationId);
  const groundOps =
    groundStation.costPerMonth_MillionsUSD * objective.targetDurationYears * 12;
  const hwCost = Math.max(0, metrics.cost.totalMillionsUSD - groundOps);

  const eventMassFactor = activeRandomEvent === 'MASS_PENALTY' ? 1.08 : 1;
  const eventPowerFactor = activeRandomEvent === 'SOLAR_STORM' ? 0.9 : 1;
  const eventBudgetFactor = activeRandomEvent === 'BUDGET_CUT' ? 0.85 : 1;

  const extraKg =
    phase === 'CML_4'
      ? computeTankExtraMassKg(metrics, tankFillPercent, oxidizerFillPercent)
      : 0;
  const liveMass = Math.max(1, (metrics.wetMass_kg + extraKg) * eventMassFactor);
  const massPct = (liveMass / Math.max(1, metrics.launchCapacity_kg)) * 100;
  const massStatus: MCRStatus = massPct > 100 ? 'RED' : metrics.dryMass.status;

  const effectiveGenW = metrics.power.generatedAtDestination_W * eventPowerFactor;
  const powerNet = effectiveGenW - metrics.power.eclipseRequired_W;
  const powerPct =
    (effectiveGenW / Math.max(1, metrics.power.eclipseRequired_W * 1.35)) * 100;
  const effectivePowerMargin =
    metrics.power.marginPercent - (activeRandomEvent === 'SOLAR_STORM' ? 10 : 0);
  const powerStatus: MCRStatus =
    powerNet < 0 || effectivePowerMargin < 0
      ? 'RED'
      : activeRandomEvent === 'SOLAR_STORM' && effectivePowerMargin < (isCadet ? 35 : 40)
        ? 'YELLOW'
        : metrics.power.status;

  const effectiveBudgetCap = Math.round(metrics.cost.budgetCapMillionsUSD * eventBudgetFactor * 10) / 10;
  const budgetUsedPct =
    (metrics.cost.totalMillionsUSD / Math.max(1, effectiveBudgetCap)) * 100;
  const effectiveReserve = effectiveBudgetCap - metrics.cost.totalMillionsUSD;
  const budgetStatus: MCRStatus =
    effectiveReserve < 0
      ? 'RED'
      : activeRandomEvent === 'BUDGET_CUT' && effectiveReserve < effectiveBudgetCap * 0.1
        ? 'YELLOW'
        : metrics.cost.status;

  const volPct = (metrics.volume.used_U / Math.max(1, metrics.volume.maxFairing_U)) * 100;
  const rfPct = ((metrics.telecom.linkMargin_dB + 4) / 14) * 100;

  const eventBadgeText =
    activeRandomEvent === 'MASS_PENALTY'
      ? isEs
        ? '+8% MASA'
        : '+8% MASS'
      : activeRandomEvent === 'SOLAR_STORM'
        ? isEs
          ? '-10% EPS'
          : '-10% PWR'
        : activeRandomEvent === 'BUDGET_CUT'
          ? isEs
            ? '-15% CAP'
            : '-15% CAP'
          : null;

  return (
    <div className="space-y-1.5 border-b border-[#5FF3FF]/15 pb-3">
      <button
        type="button"
        onClick={() => setTelemetryExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-1.5 font-mono text-[12px] tracking-[0.12em] uppercase hover:text-white"
      >
        <span className="flex items-center gap-1.5 text-[#5FF3FF]">
          <span>{isEs ? 'TELEMETRÍA EN VIVO' : 'LIVE TELEMETRY'}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              telemetryExpanded ? 'rotate-180' : ''
            }`}
          />
        </span>
        <div className="flex items-center gap-1.5">
          {eventBadgeText && (
            <span className="border border-[#FFC15E] bg-[#FFC15E]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#FFC15E]">
              {eventBadgeText}
            </span>
          )}
          <span
            className={`border px-1.5 py-0.5 text-[10px] ${
              isCadet
                ? 'border-[#5FF3FF]/40 text-[#5FF3FF]'
                : 'border-[#FFC15E]/50 text-[#FFC15E]'
            }`}
          >
            {isCadet
              ? isEs
                ? '◈ GUÍA ESTUDIANTE'
                : '◈ STUDENT GUIDE'
              : '◆ JPL MEV/MGA'}
          </span>
        </div>
      </button>

      {!telemetryExpanded && (
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[12px] text-slate-300">
          <span className={massStatus === 'RED' ? 'text-[#FF4D6D]' : 'text-[#5FF3FF]'}>
            {isEs ? 'MASA' : 'MASS'} {massStatus === 'RED' ? '!' : '✓'}
          </span>
          <span className="text-slate-600">·</span>
          <span className={powerStatus === 'RED' ? 'text-[#FF4D6D]' : 'text-[#5FF3FF]'}>
            EPS {powerStatus === 'RED' ? '!' : '✓'}
          </span>
          <span className="text-slate-600">·</span>
          <span className={budgetStatus === 'RED' ? 'text-[#FF4D6D]' : 'text-[#FFC15E]'}>
            ${metrics.cost.totalMillionsUSD.toFixed(0)}M
          </span>
          <span className="text-slate-600">·</span>
          <span className={metrics.volume.isCompliant ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
            {metrics.volume.used_U.toFixed(1)}U
          </span>
        </div>
      )}

      {telemetryExpanded && (
        <div className="space-y-1.5 pt-1">
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
        expanded={expandedMetric === 'MASS'}
        onToggle={() => toggleMetric('MASS')}
      />
      <FineMeter
        label={isEs ? 'ENERGÍA EPS' : 'EPS POWER'}
        valueText={`${powerNet >= 0 ? '+' : ''}${powerNet.toFixed(0)} W`}
        subText={
          isCadet
            ? powerStatus === 'RED'
              ? isEs
                ? '¡Déficit eléctrico en sombra/eclipse!'
                : 'Power deficit in eclipse shadow!'
              : isEs
                ? 'Paneles/RTG cubren instrumentos y eclipse'
                : 'Solar/RTG covers instruments + eclipse shadow'
            : `Gen ${effectiveGenW.toFixed(0)}W vs EclReq ${metrics.power.eclipseRequired_W.toFixed(0)}W · ${effectivePowerMargin.toFixed(1)}%`
        }
        pct={powerPct}
        status={powerStatus}
        reducedMotion={reducedMotion}
        expanded={expandedMetric === 'EPS'}
        onToggle={() => toggleMetric('EPS')}
      />
      <FineMeter
        label={isEs ? 'PRESUPUESTO' : 'BUDGET'}
        valueText={`$${metrics.cost.totalMillionsUSD.toFixed(1)}M / $${effectiveBudgetCap}M`}
        subText={
          isCadet
            ? isEs
              ? `Reserva disponible: $${effectiveReserve.toFixed(1)}M`
              : `Remaining reserve: $${effectiveReserve.toFixed(1)}M`
            : `HW $${hwCost.toFixed(1)}M + Ops $${groundOps.toFixed(1)}M (Cap $${effectiveBudgetCap}M)`
        }
        pct={budgetUsedPct}
        status={budgetStatus}
        amberDefault
        reducedMotion={reducedMotion}
        expanded={expandedMetric === 'BUDGET'}
        onToggle={() => toggleMetric('BUDGET')}
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
        expanded={expandedMetric === 'FAIRING'}
        onToggle={() => toggleMetric('FAIRING')}
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
        expanded={expandedMetric === 'RF'}
        onToggle={() => toggleMetric('RF')}
      />
        </div>
      )}
    </div>
  );
}
