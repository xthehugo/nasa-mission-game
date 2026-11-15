import { useState } from 'react';
import { AlertTriangle, Flame, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import type { Language, PhysicsMetrics, VolumeMetrics } from '../types/mission';
import type { FailureMode } from '../visuals/SpacecraftBlueprint';
import {
  computeSubsystemStress,
  getStressStatusLabel,
  type SubsystemStressDetail,
} from '../visuals/subsystemStress';

interface Props {
  metrics?: PhysicsMetrics;
  volume?: VolumeMetrics;
  failureMode?: FailureMode;
  tRatio?: number;
  failedActive?: boolean;
  lang?: Language;
  className?: string;
  compact?: boolean;
}

export default function SubsystemStressHeatmap({
  metrics,
  volume,
  failureMode = 'NONE',
  tRatio = 0,
  failedActive = false,
  lang = 'es',
  className = '',
  compact = false,
}: Props) {
  const isEs = lang === 'es';
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);

  const subsystems: SubsystemStressDetail[] = computeSubsystemStress(
    metrics,
    volume,
    failureMode,
    tRatio,
    failedActive
  );

  const maxStress = Math.max(...subsystems.map((s) => s.pct));
  const isOverload = maxStress >= 100;
  const isCritical = maxStress >= 85 && !isOverload;
  const isWarning = maxStress >= 60 && !isCritical && !isOverload;

  const globalStatusBadge = isOverload
    ? {
        label: isEs ? '¡SOBRECARGA CRÍTICA! DEFORMACIÓN PLÁSTICA' : 'CRITICAL OVERLOAD! PLASTIC DEFORMATION',
        color: 'border-[#FF4D6D] bg-[#FF4D6D]/20 text-[#FF4D6D] animate-pulse',
        icon: ShieldAlert,
      }
    : isCritical
      ? {
          label: isEs ? 'TENSIÓN ESTRUCTURAL ELEVADA' : 'ELEVATED STRUCTURAL LOAD',
          color: 'border-orange-500 bg-orange-500/15 text-orange-400',
          icon: AlertTriangle,
        }
      : isWarning
        ? {
            label: isEs ? 'CARGA DINÁMICA MEDIA (MAX-Q)' : 'MODERATE DYNAMIC LOAD (MAX-Q)',
            color: 'border-[#FFC15E] bg-[#FFC15E]/15 text-[#FFC15E]',
            icon: Zap,
          }
        : {
            label: isEs ? 'TODOS LOS SUBSISTEMAS NOMINALES' : 'ALL SUBSYSTEMS NOMINAL',
            color: 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-[#5FF3FF]',
            icon: Sparkles,
          };

  const IconComponent = globalStatusBadge.icon;

  return (
    <div
      className={`border border-[#5FF3FF]/30 bg-[#071326]/90 p-3 rounded font-mono text-[11px] shadow-[0_0_15px_rgba(7,19,38,0.7)] ${className}`}
    >
      {/* Heatmap Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#5FF3FF] animate-ping" />
          <span className="font-bold uppercase tracking-wider text-white">
            {isEs ? 'MAPA DE CALOR DE ESTRÉS (POLY BRIDGE)' : 'SUBSYSTEM STRESS HEATMAP'}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold border ${globalStatusBadge.color}`}>
          <IconComponent className="h-3 w-3" />
          <span>{globalStatusBadge.label}</span>
        </div>
      </div>

      {/* Poly Bridge Color Spectrum Legend */}
      {!compact && (
        <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#5FF3FF]" /> 0-59% {isEs ? 'Seguro' : 'Safe'}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#FFC15E]" /> 60-84% {isEs ? 'Alerta' : 'Warn'}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#F97316]" /> 85-99% {isEs ? 'Crítico' : 'Crit'}
          </span>
          <span className="flex items-center gap-1 text-[#FF4D6D] font-bold">
            <span className="h-2 w-2 rounded-sm bg-[#FF4D6D] animate-pulse" /> &gt;100% {isEs ? 'SNAP!' : 'SNAP!'}
          </span>
        </div>
      )}

      {/* Subsystem Stress Gauge List */}
      <div className="mt-2.5 space-y-2">
        {subsystems.map((sub) => {
          const isSnap = sub.pct >= 100;
          const isSelected = selectedSubsystem === sub.id;
          const barWidth = Math.min(100, (sub.pct / 125) * 100);

          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubsystem(isSelected ? null : sub.id)}
              className={`border p-2 rounded transition-all cursor-pointer ${
                isSnap
                  ? 'border-[#FF4D6D] bg-[#FF4D6D]/10 shadow-[0_0_12px_rgba(255,77,109,0.3)] animate-pulse'
                  : isSelected
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10'
                    : 'border-slate-800 bg-[#040914]/80 hover:border-slate-700'
              }`}
            >
              {/* Row title and metrics */}
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold text-[9px]">{sub.code}</span>
                  <span className="font-semibold text-slate-200">{sub.name[lang]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] text-slate-400">{sub.measured}</span>
                  <span
                    className="font-black text-[11px] px-1.5 py-0.2 rounded"
                    style={{ color: sub.color, backgroundColor: `${sub.color}22` }}
                  >
                    {sub.pct}% {isSnap ? '· SNAP!' : ''}
                  </span>
                </div>
              </div>

              {/* Stress Gauge Bar with 100% yield tick */}
              <div className="relative mt-1.5 h-2 w-full bg-[#02050B] rounded-full overflow-hidden border border-slate-700">
                {/* 100% yield limit line */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-400/80 z-10"
                  style={{ left: `${(100 / 125) * 100}%` }}
                  title="100% Yield Limit"
                />
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: sub.color,
                    boxShadow: isSnap ? '0 0 10px #FF4D6D' : undefined,
                  }}
                />
              </div>

              {/* Subsystem note or diagnosis */}
              <div className="mt-1 flex items-center justify-between text-[9px]">
                <span className={isSnap ? 'text-[#FF4D6D] font-bold' : 'text-slate-400'}>
                  {sub.note[lang]}
                </span>
                <span className="text-slate-500 text-[8.5px]">
                  {getStressStatusLabel(sub.status, lang)}
                </span>
              </div>

              {/* Expandable advice on click */}
              {isSelected && (
                <div className="mt-2 border-t border-slate-700/60 pt-1.5 text-[9.5px] text-[#5FF3FF] bg-[#5FF3FF]/5 p-1.5 rounded">
                  <div className="font-bold flex items-center gap-1">
                    <Flame className="h-3 w-3 text-[#FFC15E]" />
                    <span>{isEs ? 'GUÍA DE ALIVIO DE TENSIÓN:' : 'STRESS RELIEF GUIDELINES:'}</span>
                  </div>
                  <p className="mt-0.5 text-slate-300 text-[9px]">
                    {sub.id === 'STRUCTURE' &&
                      (isEs
                        ? 'Reduce el volumen (U) o peso de componentes, o selecciona un adaptador PAF/ESPA reforzado y cohete con mayor empuje.'
                        : 'Reduce volume (U) or wet mass, or select a reinforced PAF/ESPA adapter and larger launch vehicle.')}
                    {sub.id === 'THERMAL' &&
                      (isEs
                        ? 'Incorpora calentadores activos para eclipse y mantas térmicas MLI multicapa para estabilizar temperaturas en sombra.'
                        : 'Incorporate active eclipse survival heaters and multilayer insulation (MLI) blankets.')}
                    {sub.id === 'EPS' &&
                      (isEs
                        ? 'Aumenta el área de celdas solares (GaAs/UltraFlex) o la capacidad en vatios-hora de las baterías de ion de litio.'
                        : 'Increase solar array area (GaAs/UltraFlex) or Lithium-Ion battery reserve capacity.')}
                    {sub.id === 'PROPULSION' &&
                      (isEs
                        ? 'Asegura que el impulso específico (Isp) y propelente COPV provean suficiente ΔV para todas las maniobras de transferencia.'
                        : 'Ensure specific impulse (Isp) and COPV propellant volume provide adequate ΔV for all maneuvers.')}
                    {sub.id === 'ADCS' &&
                      (isEs
                        ? 'Instala ruedas de reacción de 3 ejes y antenas de alta ganancia (Banda X/Ka) con mayor apertura y enlace a DSN.'
                        : 'Equip 3-axis reaction wheels and High-Gain Antenna (X/Ka Band) paired with Deep Space Network.')}
                    {sub.id === 'PAYLOAD' &&
                      (isEs
                        ? 'Verifica que la cofia tenga holgura mayor a 50 mm para evitar cizallamiento durante la vibración acústica en Max-Q.'
                        : 'Verify fairing envelope clearance exceeds 50 mm to avoid acoustic vibration shear at Max-Q.')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
