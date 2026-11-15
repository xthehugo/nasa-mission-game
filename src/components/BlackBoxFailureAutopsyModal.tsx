import {
  AlertTriangle,
  RotateCcw,
  Wrench,
  Gauge,
  Activity,
  Zap,
  Play,
  Scale,
} from 'lucide-react';
import type { Language, PhysicsMetrics, SubsystemCategory, VolumeMetrics } from '../types/mission';
import type { FailureMode } from '../visuals/SpacecraftBlueprint';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

interface Props {
  failureMode: FailureMode;
  metrics?: PhysicsMetrics;
  volume: VolumeMetrics;
  missionClock: string;
  stressPct: number;
  altKm: number;
  velKmS: number;
  fuelPct: number;
  lang?: Language;
  onQuickFix?: () => void;
  onRewindSlowMo?: () => void;
}

interface Diagnosis {
  title: { en: string; es: string };
  subsystemTarget: SubsystemCategory;
  phaseTarget: 'CML_1' | 'CML_2' | 'CML_3';
  explanation: { en: string; es: string };
  recommendation: { en: string; es: string };
}

const FAILURE_DIAGNOSES: Record<FailureMode, Diagnosis> = {
  FAIRING_COLLISION: {
    title: {
      en: 'FAIRING OVERFLOW: AERODYNAMIC ACOUSTIC SHEAR (<50 mm)',
      es: 'EXCESO DE COFIA: CIZALLAMIENTO ACÚSTICO (<50 mm)',
    },
    subsystemTarget: 'PAYLOAD',
    phaseTarget: 'CML_2',
    explanation: {
      en: 'The solar wings or sensor payload exceeded allowable fairing static envelope during Max-Q buffeting, shearing against launcher inner thermal tile walls.',
      es: 'Las alas solares o carga útil excedieron la envolvente estática de la cofia durante Max-Q, rozando contra las paredes térmicas del cohete.',
    },
    recommendation: {
      en: 'Reduce spacecraft volume (U) in CML 2 or select a larger payload fairing launcher (Falcon 9).',
      es: 'Reduce el volumen (U) en CML 2 o cambia a un cohete con cofia ampliada (Falcon 9).',
    },
  },
  MASS_BUCKLING: {
    title: {
      en: 'PAF/ESPA BASE COLLAPSE: PLASTIC TRUSS BUCKLING (138% > 1.40× ULT)',
      es: 'COLAPSO DE BASE PAF/ESPA: PANDEO PLÁSTICO (138% > 1.40× ULT)',
    },
    subsystemTarget: 'LAUNCH_VEHICLE',
    phaseTarget: 'CML_3',
    explanation: {
      en: 'Spacecraft wet mass exceeded maximum launcher payload adapter capacity. Dynamic acceleration at Max-Q crushed structural load-bearing trusses.',
      es: 'La masa húmeda superó la capacidad del adaptador. La aceleración dinámica en Max-Q aplastó las armaduras estructurales inferiores.',
    },
    recommendation: {
      en: 'Upgrade launcher to Falcon 9 (12,000 kg capacity) or lightweight dry components.',
      es: 'Actualiza el lanzador a Falcon 9 (12,000 kg de empuje) o aligera componentes secos.',
    },
  },
  DELTAV_DEPLETION: {
    title: {
      en: 'PROPULSION EXHAUST: COPV TANK DEPLETION & FLAMEOUT (0%)',
      es: 'PROPULSIÓN AGOTADA: TANQUES COPV VACÍOS & FLAMEOUT (0%)',
    },
    subsystemTarget: 'PROPULSION',
    phaseTarget: 'CML_3',
    explanation: {
      en: 'Available delta-V fell short of orbital insertion requirements. Thruster chamber pressure dropped to zero during the transfer injection burn.',
      es: 'El delta-V disponible fue inferior al requerido. La presión en cámara cayó a cero a mitad de la maniobra de inyección de transferencia.',
    },
    recommendation: {
      en: 'Select High-Isp Bipropellant or Hall Effect thruster with larger propellant capacity.',
      es: 'Elige propulsión Bipropelente o Iónico Hall con mayor impulso específico (Isp).',
    },
  },
  POWER_FREEZE: {
    title: {
      en: 'ECLIPSE CRYOGENIC BROWNOUT: -15°C THERMAL INVERSION',
      es: 'CONGELAMIENTO EN ECLIPSE: INVERSIÓN TÉRMICA (-15°C)',
    },
    subsystemTarget: 'EPS',
    phaseTarget: 'CML_3',
    explanation: {
      en: 'Battery reserve collapsed during umbra eclipse. Electric survival heaters shut down, freezing avionics and bus computers into irreversible brownout.',
      es: 'Las baterías se agotaron en la sombra orbital. Los calentadores de supervivencia se apagaron, congelando la computadora de a bordo.',
    },
    recommendation: {
      en: 'Increase solar array area, add high-capacity Li-Ion batteries, or equip an RTG power source.',
      es: 'Añade paneles GaAs de mayor área, baterías Li-Ion de reserva o un generador RTG.',
    },
  },
  TELECOM_TUMBLE: {
    title: {
      en: 'DSN LOSS OF SIGNAL: UNCONTROLLED TIP-OFF TUMBLE (-18 dB)',
      es: 'PÉRDIDA DE PORTADORA DSN: GIRO DESCONTROLADO (-18 dB)',
    },
    subsystemTarget: 'TELECOM',
    phaseTarget: 'CML_3',
    explanation: {
      en: 'Angular tip-off rates exceeded reaction wheel torque authority (>15 deg/s). High-Gain antenna lost Earth pointing, fading carrier signal below DSN sensitivity.',
      es: 'El giro residual superó el par de las ruedas de reacción (>15°/s). La antena de alta ganancia perdió el enlace con la red DSN en Tierra.',
    },
    recommendation: {
      en: 'Install 3-axis reaction wheels, star tracker attitude determination, and high-gain X/Ka Band telecom.',
      es: 'Instala ruedas de reacción de 3 ejes, rastreador estelar y transpondedor Banda X/Ka.',
    },
  },
  NONE: {
    title: { en: 'NOMINAL FLIGHT PROFILE', es: 'PERFIL DE VUELO NOMINAL' },
    subsystemTarget: 'PAYLOAD',
    phaseTarget: 'CML_1',
    explanation: { en: 'No mechanical failure detected.', es: 'Sin fallos detectados.' },
    recommendation: { en: 'Continue mission flight.', es: 'Continuar vuelo de misión.' },
  },
};

export default function BlackBoxFailureAutopsyModal({
  failureMode,
  metrics,
  volume,
  missionClock,
  stressPct,
  altKm,
  velKmS,
  fuelPct,
  lang = 'es',
  onQuickFix,
  onRewindSlowMo,
}: Props) {
  const isEs = lang === 'es';
  const { setPhase, setActiveSubsystemTab, soundEnabled } = useMissionStore();

  if (failureMode === 'NONE') return null;

  const diag = FAILURE_DIAGNOSES[failureMode];

  const handleReturnToBlueprint = () => {
    playHoloTone('STEP', soundEnabled);
    setPhase(diag.phaseTarget);
    setActiveSubsystemTab(diag.subsystemTarget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl border-2 border-[#FF4D6D] bg-[#070c1a] p-4 sm:p-6 rounded-lg shadow-[0_0_40px_rgba(255,77,109,0.4)] text-slate-200">
        {/* Holographic Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(rgba(255,77,109,0.04)_50%,transparent_50%)] bg-[length:100%_4px]" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FF4D6D]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#FF4D6D] animate-ping" />
            <span className="text-xs font-black tracking-widest text-[#FF4D6D] uppercase">
              {isEs ? 'CAJA NEGRA TELEMÉTRICA // AUTOPSIA DE VUELO' : 'TELEMETRIC BLACK BOX // FLIGHT AUTOPSY'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-400">{isEs ? 'IMPACTO EN:' : 'IMPACT AT:'}</span>
            <span className="font-bold text-white bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
              {missionClock}
            </span>
          </div>
        </div>

        {/* Failure Banner */}
        <div className="mt-3.5 border border-[#FF4D6D]/60 bg-[#FF4D6D]/10 p-3 rounded space-y-1">
          <div className="flex items-center gap-2 text-[#FF4D6D] text-xs sm:text-sm font-black uppercase">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{diag.title[lang]}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            {diag.explanation[lang]}
          </p>
        </div>

        {/* Telemetry At Impact Grid */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="border border-slate-800 bg-[#040813] p-2 rounded">
            <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase">
              <Activity className="h-3 w-3 text-[#FF4D6D]" />
              <span>{isEs ? 'Tensión Unión' : 'Joint Stress'}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-[#FF4D6D]">
              {Math.round(stressPct)}% SNAP!
            </div>
          </div>

          <div className="border border-slate-800 bg-[#040813] p-2 rounded">
            <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase">
              <Gauge className="h-3 w-3 text-[#5FF3FF]" />
              <span>{isEs ? 'Altitud / Vel' : 'Alt / Velocity'}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-white">
              {Math.round(altKm)} km · {velKmS.toFixed(1)} km/s
            </div>
          </div>

          <div className="border border-slate-800 bg-[#040813] p-2 rounded">
            <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase">
              <Zap className="h-3 w-3 text-[#FFC15E]" />
              <span>{isEs ? 'Combustible COPV' : 'Propellant'}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-[#FFC15E]">
              {Math.round(fuelPct)}%
            </div>
          </div>

          <div className="border border-slate-800 bg-[#040813] p-2 rounded">
            <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase">
              <Scale className="h-3 w-3 text-[#38BDF8]" />
              <span>{isEs ? 'Masa / Cohete' : 'Mass / Capacity'}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-white">
              {metrics ? `${metrics.wetMass_kg} / ${metrics.launchCapacity_kg} kg` : `${volume.used_U.toFixed(1)}U`}
            </div>
          </div>
        </div>

        {/* Recommended Engineering Fix */}
        <div className="mt-3 border border-[#5FF3FF]/30 bg-[#07172e] p-2.5 rounded text-[10.5px]">
          <div className="font-bold text-[#5FF3FF] flex items-center gap-1.5 uppercase text-[9.5px]">
            <Wrench className="h-3.5 w-3.5 text-[#FFC15E]" />
            <span>{isEs ? 'ACCIÓN CORRECTIVA RECOMENDADA (JPL / NASA):' : 'RECOMMENDED ENGINEERING FIX:'}</span>
          </div>
          <p className="mt-1 text-slate-200 text-[10px] leading-relaxed">
            {diag.recommendation[lang]}
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
          {/* Button 1: Reajustar en el plano */}
          <button
            type="button"
            onClick={handleReturnToBlueprint}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 border-2 border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-2 text-xs font-bold text-[#5FF3FF] uppercase tracking-wider rounded transition hover:bg-[#5FF3FF]/30 shadow-[0_0_15px_rgba(95,243,255,0.3)] cursor-pointer"
          >
            <Wrench className="h-4 w-4" />
            <span>
              {isEs
                ? `[🛠️ REAJUSTAR EN EL PLANO: ${diag.subsystemTarget}]`
                : `[🛠️ EDIT IN BLUEPRINT: ${diag.subsystemTarget}]`}
            </span>
          </button>

          {/* Button 2: Auto-fix & relaunch */}
          {onQuickFix && (
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                onQuickFix();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 border border-[#FFC15E] bg-[#FFC15E]/15 px-3 py-2 text-xs font-bold text-[#FFC15E] uppercase tracking-wider rounded transition hover:bg-[#FFC15E]/25 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isEs ? 'AUTO-CORREGIR Y RELANZAR' : 'AUTO-FIX & RELAUNCH'}</span>
            </button>
          )}

          {/* Button 3: Slow-Mo Replay */}
          {onRewindSlowMo && (
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                onRewindSlowMo();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider rounded transition hover:text-white hover:border-slate-500 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 text-[#5FF3FF]" />
              <span>{isEs ? 'REPETICIÓN 0.5×' : 'SLOW-MO 0.5×'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
