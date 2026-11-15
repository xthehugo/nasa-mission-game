import { useState } from 'react';
import {
  BarChart2,
  Compass,
  GraduationCap,
  HelpCircle,
  Languages,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { CAMPAIGN_CONTRACTS, getCampaignLevelById, getPlayerRank } from '../engine';
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
    activeCampaignLevelId,
    setLanguage,
    reopenOnboarding,
    setTelemetryOpen,
    setCampaignModalOpen,
    setAIStudioModalOpen,
    setLevel1TutorialStep,
    triggerRandomEvent,
    toggleSound,
  } = useMissionStore();

  const [menuOpen, setMenuOpen] = useState(false);

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

  // Active campaign level from config (fallback to objective match)
  const activeContract =
    CAMPAIGN_CONTRACTS.find((c) => c.objectiveId === selection.objectiveId) ||
    getCampaignLevelById(activeCampaignLevelId);

  return (
    <header
      data-astra-zone="TOP_BAR"
      className="sticky top-0 z-30 border-b border-[#5FF3FF]/15 bg-[#04080F]/95 px-4 py-2.5 backdrop-blur-md sm:px-7"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
        {/* Left: Minimal Level Header (matches reference mockup) */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[11px] tracking-[0.22em] text-[#5FF3FF]/85 uppercase">
              {isEs ? `NIVEL ${meta.num} DE 06 · ${meta.code}` : `LEVEL ${meta.num} OF 06 · ${meta.code}`}
            </div>
            <h1 className="truncate text-2xl font-light tracking-tight text-white sm:text-[28px] sm:leading-tight">
              {meta.title[language]}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setCampaignModalOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="hidden sm:flex items-center gap-2 rounded-sm border border-[#5FF3FF]/25 bg-[#071324]/70 px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-[#5FF3FF]/70 hover:text-white transition cursor-pointer"
            title={isEs ? 'Cambiar campaña / contrato NASA' : 'Switch NASA campaign / contract'}
          >
            <Compass className="h-3.5 w-3.5 text-[#5FF3FF]" />
            <span className="text-[#FFC15E] font-semibold">{activeContract.code}</span>
            <span className="max-w-[160px] truncate text-slate-300">{activeContract.title[language]}</span>
          </button>
        </div>

        {/* Right: Stars (prominent) + Compact Utility Group */}
        <div className="relative flex shrink-0 items-center gap-2.5">
          {activeRandomEvent !== 'NONE' && (
            <button
              type="button"
              onClick={() => {
                triggerRandomEvent();
                playHoloTone('ALARM', soundEnabled);
              }}
              className="flex items-center gap-1 rounded border border-[#FF4D6D] bg-[#FF4D6D]/15 px-2.5 py-1 font-mono text-[11px] text-[#FF4D6D] animate-pulse"
              title={isEs ? 'Evento de simulación activo' : 'Active simulation event'}
            >
              <span>[!] {EVENT_LABELS[activeRandomEvent][language]}</span>
            </button>
          )}

          {/* Stars display matching mockup top-right */}
          <div
            className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-[#FFC15E]"
            title={isEs ? 'Estrellas MCR del nivel' : 'Level MCR Stars'}
          >
            <span className="hidden md:inline text-[11px] text-slate-400">
              {isEs ? 'ESTRELLAS' : 'STARS'}
            </span>
            <span className="text-sm tracking-[0.22em]">
              {'★'.repeat(starInfo.stars)}
              {'☆'.repeat(3 - starInfo.stars)}
            </span>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Telemetry Drawer quick button */}
          <button
            type="button"
            onClick={() => {
              setTelemetryOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="flex h-8 items-center gap-1.5 rounded border border-[#5FF3FF]/30 bg-[#060D1A] px-2.5 font-mono text-[11px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10 transition"
            title={isEs ? 'Abrir Telemetría y Gráficas SWaP-C' : 'Open SWaP-C Telemetry & Charts'}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{isEs ? 'Telemetría' : 'Telemetry'}</span>
          </button>

          {/* Always-visible Help / Replay Tour button */}
          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setLevel1TutorialStep(0);
            }}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#5FF3FF]/30 bg-[#060D1A] text-slate-300 hover:border-[#FFC15E] hover:text-[#FFC15E] transition"
            title={isEs ? 'Ayuda · Repetir guía paso a paso' : 'Help · Replay step-by-step guide'}
            aria-label={isEs ? 'Ayuda y tour' : 'Help and tour'}
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Compact Settings & Account Popover Trigger */}
          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setMenuOpen((o) => !o);
            }}
            className={`flex h-8 items-center gap-1.5 rounded border px-2.5 font-mono text-[11px] transition ${
              menuOpen
                ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-[#5FF3FF]'
                : 'border-[#5FF3FF]/30 bg-[#060D1A] text-slate-200 hover:border-[#5FF3FF]'
            }`}
            title={isEs ? 'Cuenta, Ajustes y Herramientas' : 'Account, Settings & Tools'}
            aria-expanded={menuOpen}
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline truncate max-w-[80px]">{activeCallsign}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 w-72 border border-[#5FF3FF]/45 bg-[#040B14]/98 p-3 shadow-[0_14px_38px_rgba(0,0,0,0.88)] backdrop-blur-md">
              {/* Profile & XP */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  reopenOnboarding();
                  playHoloTone('STEP', soundEnabled);
                }}
                className="flex w-full items-center justify-between gap-2 border-b border-[#5FF3FF]/15 pb-2.5 text-left hover:bg-[#5FF3FF]/5 p-1.5 transition"
              >
                <div className="flex items-center gap-2">
                  {isStudent ? (
                    <GraduationCap className="h-4 w-4 text-[#5FF3FF]" />
                  ) : (
                    <Wrench className="h-4 w-4 text-[#FFC15E]" />
                  )}
                  <div>
                    <div className="font-mono text-[10px] font-bold text-[#FFC15E] uppercase">
                      {isStudent ? (isEs ? 'ESTUDIANTE' : 'STUDENT') : (isEs ? 'ING. JPL' : 'JPL ENG.')} · {activeCallsign}
                    </div>
                    <div className="font-mono text-[11px] text-slate-300">
                      {playerRank.badge} · {playerXP} XP
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#5FF3FF] underline">
                  {isEs ? 'Cambiar' : 'Edit'}
                </span>
              </button>

              <div className="mt-2 space-y-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setCampaignModalOpen(true);
                    playHoloTone('STEP', soundEnabled);
                  }}
                  className="flex w-full items-center justify-between rounded border border-[#5FF3FF]/20 px-2.5 py-1.5 text-slate-200 hover:border-[#5FF3FF] hover:text-[#5FF3FF]"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-3.5 w-3.5 text-[#5FF3FF]" />
                    <span>{isEs ? 'Contratos NASA' : 'NASA Contracts'}</span>
                  </span>
                  <span className="text-[10px] text-[#FFC15E]">{activeContract.code}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setAIStudioModalOpen(true);
                    playHoloTone('STEP', soundEnabled);
                  }}
                  className="flex w-full items-center justify-between rounded border border-[#FFC15E]/35 bg-[#FFC15E]/10 px-2.5 py-1.5 text-[#FFC15E] hover:bg-[#FFC15E]/20"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>GEMINI AI</span>
                  </span>
                  <span className="text-[10px]">{isEs ? 'Auditoría' : 'Audit'}</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const nextEnabled = !soundEnabled;
                      toggleSound();
                      playHoloTone('STEP', nextEnabled);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded border border-[#5FF3FF]/25 bg-[#060D1A] py-1.5 text-[11px] text-slate-200 hover:border-[#5FF3FF]"
                  >
                    {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#5FF3FF]" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
                    <span>{soundEnabled ? (isEs ? 'Voz ON' : 'Voice ON') : (isEs ? 'Voz OFF' : 'Voice OFF')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playHoloTone('STEP', soundEnabled);
                      setLanguage(isEs ? 'en' : 'es');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded border border-[#5FF3FF]/25 bg-[#060D1A] py-1.5 text-[11px] font-bold text-[#5FF3FF] hover:border-[#5FF3FF]"
                  >
                    <Languages className="h-3.5 w-3.5" />
                    <span>{isEs ? 'Idioma: ES' : 'Lang: EN'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
