import {
  BarChart2,
  Compass,
  GraduationCap,
  Languages,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { CAMPAIGN_CONTRACTS, getPlayerRank } from '../engine';
import { useMissionStore, type RandomEventType } from '../store';
import type { CMLPhase } from '../types/mission';
import { computeLevelStars, computeTankExtraMassKg, playHoloTone } from './holoAudio';

const EVENT_LABELS: Record<RandomEventType, { en: string; es: string }> = {
  NONE: { en: 'NONE', es: 'NINGUNO' },
  BUDGET_CUT: { en: 'BUDGET -15%', es: 'RECORTE -15%' },
  SOLAR_STORM: { en: 'SOLAR -10%', es: 'TORMENTA -10%' },
  MASS_PENALTY: { en: 'MASS +8%', es: 'MASA +8%' },
};

const LEVEL_META: Record<
  CMLPhase,
  { num: string; code: string; title: { en: string; es: string } }
> = {
  CML_1: { num: '01', code: 'CML 1', title: { en: 'Napkin Blueprint', es: 'Plano de Servilleta' } },
  CML_2: { num: '02', code: 'CML 2', title: { en: 'Orbit & Ground', es: 'Órbita y Estaciones' } },
  CML_3: { num: '03', code: 'CML 3', title: { en: 'Trade Space', es: 'Trade Space de Módulos' } },
  CML_4: { num: '04', code: 'CML 4', title: { en: 'Point Design', es: 'Punto de Diseño' } },
  CML_5: { num: '05', code: 'CML 5', title: { en: 'V&V / MCR Gate', es: 'Revisión V&V / MCR' } },
  SIMULATION: { num: '06', code: 'PHASE E', title: { en: 'Flight Simulation', es: 'Simulación de Vuelo' } },
};

export function TopBar() {
  const {
    language,
    experienceMode,
    phase,
    cadetName,
    engineerName,
    selection,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    tankFillPercent,
    oxidizerFillPercent,
    soundEnabled,
    playerXP,
    setLanguage,
    reopenOnboarding,
    setTelemetryOpen,
    setCampaignModalOpen,
    setAIStudioModalOpen,
    triggerRandomEvent,
    toggleSound,
  } = useMissionStore();

  const isEs = language === 'es';
  const meta = LEVEL_META[phase];
  const activeCallsign = experienceMode === 'CADET' ? cadetName : engineerName;
  const isStudent = experienceMode === 'CADET';

  const extraKg =
    phase === 'CML_4'
      ? computeTankExtraMassKg(metrics, tankFillPercent, oxidizerFillPercent)
      : 0;

  const starInfo = computeLevelStars(
    metrics,
    concurrentConflicts.length,
    experienceMode,
    activeRandomEvent,
    extraKg,
  );
  const playerRank = getPlayerRank(playerXP);

  // Active campaign contract matching current selection objective
  const activeContract =
    CAMPAIGN_CONTRACTS.find((c) => c.objectiveId === selection.objectiveId) ||
    CAMPAIGN_CONTRACTS[0];

  return (
    <header
      data-astra-zone="TOP_BAR"
      className="border-b border-[#5FF3FF]/20 bg-[#04080F]/95 px-4 py-2.5 sm:px-6 font-mono sticky top-0 z-40 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
        {/* Left: Project Branding & Active Campaign Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#FFC15E] uppercase">
              ORBITAL FORGE // NASA
            </span>
            <span className="text-xs font-light text-slate-300">
              {meta.code} · {meta.title[language]}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Active Campaign Badge / Switcher Button */}
          <button
            type="button"
            onClick={() => {
              setCampaignModalOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="flex items-center gap-2 rounded border border-[#5FF3FF] bg-[#5FF3FF]/15 px-3 py-1.5 text-xs font-bold text-[#5FF3FF] hover:bg-[#5FF3FF]/30 shadow-[0_0_15px_rgba(95,243,255,0.25)] transition cursor-pointer"
            title={isEs ? 'Abrir Carrusel de Campañas de la NASA' : 'Open NASA Campaign Deck'}
          >
            <Compass className="h-3.5 w-3.5 text-[#5FF3FF] animate-spin-slow" />
            <div className="text-left leading-none">
              <div className="text-[8.5px] uppercase tracking-wider text-[#FFC15E]">
                {activeContract.code}
              </div>
              <div className="text-[11px] font-medium text-white truncate max-w-[160px] sm:max-w-[210px]">
                {activeContract.title[language]}
              </div>
            </div>
            <span className="text-[9px] bg-[#5FF3FF]/25 px-1.5 py-0.5 rounded border border-[#5FF3FF]/40 text-[#5FF3FF] uppercase hidden sm:inline">
              {isEs ? 'CAMBIAR' : 'DECK'}
            </span>
          </button>
        </div>

        {/* Center: Phase Stars & Simulation Random Event Alert */}
        <div className="flex items-center gap-2 text-xs">
          <div className="border border-[#FFC15E]/40 bg-[#FFC15E]/10 px-2.5 py-1 rounded text-[#FFC15E] flex items-center gap-1">
            <span className="text-[10px] text-slate-400 hidden md:inline">
              {isEs ? 'ESTRELLAS MCR:' : 'STARS:'}
            </span>
            <span>{'★'.repeat(starInfo.stars)}{'☆'.repeat(3 - starInfo.stars)}</span>
          </div>

          {activeRandomEvent !== 'NONE' && (
            <button
              type="button"
              onClick={() => {
                triggerRandomEvent();
                playHoloTone('ALARM', soundEnabled);
              }}
              className="border border-[#FF4D6D] bg-[#FF4D6D]/15 px-2.5 py-1 rounded text-[#FF4D6D] text-[10px] animate-pulse flex items-center gap-1"
            >
              <span>[!] {isEs ? 'EVENTO SIM' : 'SIM EVENT'}:</span>
              <span>{EVENT_LABELS[activeRandomEvent][language]}</span>
            </button>
          )}
        </div>

        {/* Right: Enlisted Recruit Profile & Quick Tools */}
        <div className="flex items-center gap-2">
          {/* Enlisted Recruit Profile Badge (Click to Reopen Recruitment) */}
          <button
            type="button"
            onClick={() => {
              reopenOnboarding();
              playHoloTone('STEP', soundEnabled);
            }}
            className="flex items-center gap-2 rounded border border-[#FFC15E]/40 bg-[#071324] px-2.5 py-1 text-xs hover:border-[#FFC15E] hover:bg-[#FFC15E]/10 transition cursor-pointer"
            title={isEs ? 'Ver o cambiar perfil de reclutamiento' : 'View or change enlistment profile'}
          >
            {isStudent ? (
              <GraduationCap className="h-4 w-4 text-[#5FF3FF]" />
            ) : (
              <Wrench className="h-4 w-4 text-[#FFC15E]" />
            )}
            <div className="text-left leading-none">
              <div className="text-[8.5px] uppercase font-bold text-[#FFC15E]">
                {isStudent ? (isEs ? 'ESTUDIANTE' : 'STUDENT') : (isEs ? 'ING. JPL' : 'JPL ENG.')}
              </div>
              <div className="text-[11px] font-medium text-white truncate max-w-[85px] sm:max-w-[120px]">
                {activeCallsign}
              </div>
            </div>
            <span className="text-[9.5px] font-bold text-[#FFC15E] bg-[#FFC15E]/15 px-1.5 py-0.5 rounded border border-[#FFC15E]/30 hidden sm:inline">
              {playerRank.badge} · {playerXP} XP
            </span>
          </button>

          {/* Gemini AI Studio Button */}
          <button
            type="button"
            onClick={() => {
              setAIStudioModalOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="flex items-center gap-1 rounded border border-[#FFC15E] bg-[#FFC15E]/15 px-2.5 py-1.5 text-xs font-bold text-[#FFC15E] hover:bg-[#FFC15E]/30 transition shadow-[0_0_12px_rgba(255,193,94,0.2)]"
            title={isEs ? 'Auditoría con Gemini 2.5 Flash' : 'Gemini 2.5 Flash Telemetry Audit'}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden md:inline">GEMINI AI</span>
          </button>

          {/* SWaP-C Telemetry Charts Drawer Button */}
          <button
            type="button"
            onClick={() => {
              setTelemetryOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#060D1A] px-2 py-1.5 text-xs text-slate-300 hover:border-[#5FF3FF] hover:text-[#5FF3FF] transition"
            title={isEs ? 'Gráficas SWaP-C' : 'SWaP-C Charts'}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{isEs ? 'TELEMETRÍA' : 'CHARTS'}</span>
          </button>

          {/* Audio Squelch SFX Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextEnabled = !soundEnabled;
              toggleSound();
              playHoloTone('STEP', nextEnabled);
            }}
            className="flex items-center justify-center h-8 w-8 rounded border border-[#5FF3FF]/30 bg-[#060D1A] text-slate-300 hover:border-[#5FF3FF] hover:text-[#5FF3FF] transition"
            title={soundEnabled ? 'Silenciar audio' : 'Activar audio'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
          </button>

          {/* Language Toggle (ES/EN) */}
          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setLanguage(isEs ? 'en' : 'es');
            }}
            className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#060D1A] px-2 py-1.5 text-xs font-bold text-[#5FF3FF] hover:border-[#5FF3FF] transition"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{isEs ? 'ES' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
