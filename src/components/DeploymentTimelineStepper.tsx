import { useState } from 'react';
import { AlertOctagon, CheckCircle, ChevronRight, Cog, Radio, Sun, ShieldCheck, Flame, Rocket } from 'lucide-react';
import type { Language } from '../types/mission';
import {
  evaluateDeploymentTimeline,
  getDeploymentStatusLabel,
  type DeploymentStepId,
} from '../visuals/deploymentTimeline';

interface Props {
  tRatio: number;
  isFailed?: boolean;
  failRatio?: number;
  lang?: Language;
  className?: string;
  onSelectStep?: (id: DeploymentStepId) => void;
}

const STEP_ICONS: Record<DeploymentStepId, React.ElementType> = {
  SEPARATION: Rocket,
  RF_SILENCE: Radio,
  SOLAR_DEPLOY: Sun,
  ADCS_DETUMBLE: ShieldCheck,
  HOHMANN_BURN: Flame,
};

export default function DeploymentTimelineStepper({
  tRatio,
  isFailed = false,
  failRatio = 1.0,
  lang = 'es',
  className = '',
  onSelectStep,
}: Props) {
  const isEs = lang === 'es';
  const evaluated = evaluateDeploymentTimeline(tRatio, isFailed, failRatio);
  const activeEval = evaluated.find((e) => e.status === 'ACTIVE') ?? evaluated[evaluated.length - 1];
  const [inspectedStepId, setInspectedStepId] = useState<DeploymentStepId | null>(null);

  const inspected = inspectedStepId
    ? evaluated.find((e) => e.step.id === inspectedStepId) ?? activeEval
    : activeEval;

  return (
    <div
      className={`border border-[#5FF3FF]/30 bg-[#040914]/95 p-3 rounded font-mono text-[11px] shadow-[0_0_20px_rgba(4,9,20,0.8)] ${className}`}
    >
      {/* Header with Title and Current Mechanical Stage */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Cog className="h-4 w-4 text-[#5FF3FF] animate-[spin_8s_linear_infinite]" />
          <span className="font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            {isEs ? 'SECUENCIA DE DESPLIEGUE MECÁNICO (5 FASES)' : 'MECHANICAL DEPLOYMENT TIMELINE (5 STAGES)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9.5px]">
          <span className="text-slate-400">{isEs ? 'FASE ACTIVA:' : 'ACTIVE PHASE:'}</span>
          <span
            className={`font-black px-2 py-0.5 rounded border ${
              activeEval.status === 'FAILED'
                ? 'border-[#FF4D6D] bg-[#FF4D6D]/15 text-[#FF4D6D] animate-pulse'
                : 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-[#5FF3FF]'
            }`}
          >
            {activeEval.step.code} · {activeEval.step.name[lang]}
          </span>
        </div>
      </div>

      {/* Poly Bridge 5-Stage Stepper Track */}
      <div className="relative mt-4 mb-3 px-2">
        {/* Background track line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-800 rounded-full" />

        {/* Dynamic progress track fill */}
        <div
          className={`absolute top-1/2 left-4 h-1 -translate-y-1/2 rounded-full transition-all duration-200 ${
            isFailed
              ? 'bg-gradient-to-r from-[#5FF3FF] via-[#FFC15E] to-[#FF4D6D]'
              : 'bg-gradient-to-r from-[#5FF3FF]/70 to-[#5FF3FF]'
          }`}
          style={{ width: `calc(${(Math.min(1, tRatio) * 100)}% - 2rem)` }}
        />

        {/* 5 Stage Node Buttons */}
        <div className="relative flex justify-between items-center z-10">
          {evaluated.map(({ step, status, progressPct }) => {
            const Icon = STEP_ICONS[step.id];
            const isInspected = inspected.step.id === step.id;
            const isCompleted = status === 'COMPLETED';
            const isActive = status === 'ACTIVE';
            const isErr = status === 'FAILED';

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setInspectedStepId(step.id);
                  if (onSelectStep) onSelectStep(step.id);
                }}
                className={`flex flex-col items-center group cursor-pointer transition-transform ${
                  isInspected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Node circle */}
                <div
                  className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isErr
                      ? 'border-[#FF4D6D] bg-[#FF4D6D]/20 text-[#FF4D6D] shadow-[0_0_12px_rgba(255,77,109,0.5)] animate-pulse'
                      : isActive
                        ? 'border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] shadow-[0_0_12px_rgba(255,193,94,0.4)] ring-2 ring-[#FFC15E]/40'
                        : isCompleted
                          ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF] shadow-[0_0_8px_rgba(95,243,255,0.25)]'
                          : 'border-slate-700 bg-slate-900 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : isErr ? (
                    <AlertOctagon className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Node Time & Code label */}
                <span
                  className={`mt-1.5 text-[9px] font-bold ${
                    isErr
                      ? 'text-[#FF4D6D]'
                      : isActive
                        ? 'text-[#FFC15E]'
                        : isCompleted
                          ? 'text-[#5FF3FF]'
                          : 'text-slate-500'
                  }`}
                >
                  {step.timeTag}
                </span>

                {/* Micro Progress tag */}
                {isActive && (
                  <span className="text-[8px] text-[#FFC15E] font-mono mt-0.5 animate-pulse">
                    {progressPct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspected Stage Details Card */}
      <div className="mt-3 border border-slate-700/60 bg-[#071324] p-2.5 rounded text-[10px] space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-[#5FF3FF]" />
            <span className="font-bold text-white uppercase">
              {inspected.step.code} · {inspected.step.name[lang]}
            </span>
          </div>
          <span
            className={`font-black text-[9px] px-1.5 py-0.5 rounded border ${
              inspected.status === 'COMPLETED'
                ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-[#5FF3FF]'
                : inspected.status === 'FAILED'
                  ? 'border-[#FF4D6D]/60 bg-[#FF4D6D]/15 text-[#FF4D6D]'
                  : inspected.status === 'ACTIVE'
                    ? 'border-[#FFC15E]/60 bg-[#FFC15E]/15 text-[#FFC15E]'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
            }`}
          >
            {getDeploymentStatusLabel(inspected.status, lang)}
          </span>
        </div>

        <p className="text-slate-300 text-[10px] leading-relaxed">
          {inspected.step.description[lang]}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[8.5px] text-slate-400">
          <span>{inspected.step.nasaStandard}</span>
          <span className="text-slate-500">
            {isEs ? 'Subsistema asignado:' : 'Target subsystem:'} {inspected.step.subsystem}
          </span>
        </div>
      </div>
    </div>
  );
}
