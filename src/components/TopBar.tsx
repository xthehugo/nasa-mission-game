import {
  BarChart2,
  Compass,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { CAMPAIGN_CONTRACTS, getCampaignLevelById } from '../engine';
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
    activeCampaignLevelId,
    campaignProgress,
    setTelemetryOpen,
    setCampaignModalOpen,
    setSettingsModalOpen,
    setLevel1TutorialStep,
    triggerRandomEvent,
  } = useMissionStore();

  const isEs = language === 'es';
  const meta = LEVEL_META[phase];
  const activeCallsign = experienceMode === 'CADET' ? cadetName : engineerName;

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
  const totalStarsEarned = Object.values(campaignProgress).reduce(
    (acc, c) => acc + (c.stars || 0),
    0,
  );

  // Active campaign level from config (fallback to objective match)
  const activeContract =
    CAMPAIGN_CONTRACTS.find((c) => c.objectiveId === selection.objectiveId) ||
    getCampaignLevelById(activeCampaignLevelId);

  return (
    <header
      data-astra-zone="TOP_BAR"
      className="sticky top-0 z-50 border-b border-[#5FF3FF]/15 bg-[#04080F]/95 px-4 py-2.5 backdrop-blur-md sm:px-7"
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
            title={
              isEs
                ? `${activeContract.code}: ${activeContract.title.es} (LEO = Órbita Baja Terrestre · Clic para cambiar campaña)`
                : `${activeContract.code}: ${activeContract.title.en} (LEO = Low Earth Orbit · Click to switch campaign)`
            }
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

          {/* Stars display: clarifies current design projection vs campaign stars */}
          <div
            className="flex items-center gap-2.5 font-mono text-xs"
            title={
              isEs
                ? `Proyección de diseño actual: ${starInfo.stars} de 3 estrellas (se certifican al volar en Fase 06). Total campaña ganadas: ${totalStarsEarned}/18.`
                : `Current design projection: ${starInfo.stars} of 3 stars (certified upon launch in Phase 06). Campaign stars earned: ${totalStarsEarned}/18.`
            }
          >
            <div className="flex flex-col items-end leading-tight">
              <span className="hidden md:inline text-[9px] text-slate-400 uppercase tracking-wider">
                {isEs ? 'PROYECCIÓN DISEÑO' : 'DESIGN PROJECTION'}
              </span>
              <span className="text-sm tracking-[0.2em] text-[#FFC15E] font-bold">
                {'★'.repeat(starInfo.stars)}
                {'☆'.repeat(3 - starInfo.stars)}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <button
              type="button"
              onClick={() => {
                setCampaignModalOpen(true);
                playHoloTone('STEP', soundEnabled);
              }}
              className="hidden sm:flex flex-col items-start leading-tight hover:text-[#5FF3FF] transition cursor-pointer"
              title={isEs ? 'Abrir carrusel de campañas (0 a 18 estrellas)' : 'Open campaign deck (0 of 18 stars)'}
            >
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                {isEs ? 'CAMPAÑA' : 'CAMPAIGN'}
              </span>
              <span className="text-xs font-bold text-[#5FF3FF] tracking-wider">
                ★ {totalStarsEarned}/18
              </span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Telemetry Drawer quick button */}
          <button
            type="button"
            onClick={() => {
              setTelemetryOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="flex h-8 items-center gap-1.5 rounded border border-[#5FF3FF]/30 bg-[#060D1A] px-2.5 font-mono text-[11px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10 transition cursor-pointer"
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
            className="flex h-8 w-8 items-center justify-center rounded border border-[#5FF3FF]/30 bg-[#060D1A] text-slate-300 hover:border-[#FFC15E] hover:text-[#FFC15E] transition cursor-pointer"
            title={isEs ? 'Ayuda · Repetir guía paso a paso' : 'Help · Replay step-by-step guide'}
            aria-label={isEs ? 'Ayuda y tour' : 'Help and tour'}
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* System Settings Modal Trigger Button */}
          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setSettingsModalOpen(true);
            }}
            className="flex h-8 items-center gap-1.5 rounded border border-[#5FF3FF]/40 bg-[#060D1A] px-2.5 font-mono text-[11px] text-slate-200 hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/15 transition cursor-pointer shadow-[0_0_12px_rgba(95,243,255,0.12)]"
            title={isEs ? 'Abrir Ajustes de Audio, Perfil y Sistema' : 'Open Audio, Profile & System Settings'}
          >
            <Settings className="h-3.5 w-3.5 text-[#5FF3FF]" />
            <span className="hidden sm:inline truncate max-w-[85px]">{activeCallsign}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
