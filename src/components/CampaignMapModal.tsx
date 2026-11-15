import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Lock,
  Rocket,
  ShieldAlert,
  Sparkles,
  Unlock,
  Volume2,
  X,
} from 'lucide-react';
import {
  CAMPAIGN_CONTRACTS,
  getCampaignLevelById,
  getPlayerRank,
  isCampaignLevelUnlocked,
} from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone, unlockAudioContext } from './holoAudio';
import { CONTRACT_TO_CINEMATIC } from './narrativeConfig';

export const CampaignMapModal: React.FC = () => {
  const {
    language,
    soundEnabled,
    playerXP,
    activeCampaignLevelId,
    campaignProgress,
    isCampaignModalOpen,
    setCampaignModalOpen,
    setActiveCampaignLevelId,
    loadPreset,
    setPhase,
    setLevel1TutorialStep,
    appendDecisionLog,
    openCinematic,
  } = useMissionStore();

  const [activeIdx, setActiveIdx] = useState(() => {
    const idx = CAMPAIGN_CONTRACTS.findIndex((c) => c.id === activeCampaignLevelId);
    return idx >= 0 ? idx : 0;
  });
  const [prevModalOpen, setPrevModalOpen] = useState(isCampaignModalOpen);

  if (isCampaignModalOpen && !prevModalOpen) {
    setPrevModalOpen(true);
    const idx = CAMPAIGN_CONTRACTS.findIndex((c) => c.id === activeCampaignLevelId);
    if (idx >= 0) setActiveIdx(idx);
  } else if (!isCampaignModalOpen && prevModalOpen) {
    setPrevModalOpen(false);
  }

  const isEs = language === 'es';
  const currentRank = getPlayerRank(playerXP);
  const totalStarsEarned = Object.values(campaignProgress).reduce(
    (acc, c) => acc + (c.stars || 0),
    0,
  );

  const contract = CAMPAIGN_CONTRACTS[activeIdx] || CAMPAIGN_CONTRACTS[0];
  const isUnlocked = isCampaignLevelUnlocked(contract, campaignProgress, playerXP);
  const unlockPrevLevel = contract.unlockRequiresContractId
    ? getCampaignLevelById(contract.unlockRequiresContractId)
    : null;
  const progress = campaignProgress[contract.id] || { stars: 0, completed: false };
  const isCompleted = progress.completed;
  const isFirstIntroCampaign = contract.id === 'contract-leo-bionutrients';

  const handlePrev = useCallback(() => {
    setActiveIdx((idx) => (idx - 1 + CAMPAIGN_CONTRACTS.length) % CAMPAIGN_CONTRACTS.length);
    playHoloTone('STEP', soundEnabled);
  }, [soundEnabled]);

  const handleNext = useCallback(() => {
    setActiveIdx((idx) => (idx + 1) % CAMPAIGN_CONTRACTS.length);
    playHoloTone('STEP', soundEnabled);
  }, [soundEnabled]);

  const handleLaunchCurrent = useCallback(() => {
    if (!isUnlocked) return;
    unlockAudioContext();
    playHoloTone('STAR', soundEnabled);
    setActiveCampaignLevelId(contract.id);
    loadPreset(contract.presetKey);
    setPhase('CML_1');

    if (isFirstIntroCampaign) {
      // Step 1 of 10-step interactive tutorial
      setLevel1TutorialStep(0);
    } else {
      setLevel1TutorialStep(10);
    }

    appendDecisionLog({
      phase: 'CML_1',
      label: {
        en: `Campaign Contract deployed: ${contract.title.en} (+${contract.rewardXP} XP max).`,
        es: `Contrato de Campaña desplegado: ${contract.title.es} (+${contract.rewardXP} XP máx).`,
      },
      impact: 'POSITIVE',
    });

    setCampaignModalOpen(false);

    // Launch personalized mission cinematic with Commander Vega
    const cinematicId = CONTRACT_TO_CINEMATIC[contract.id];
    if (cinematicId) {
      openCinematic(cinematicId);
    }
  }, [
    isUnlocked,
    soundEnabled,
    contract,
    isFirstIntroCampaign,
    setActiveCampaignLevelId,
    loadPreset,
    setPhase,
    setLevel1TutorialStep,
    appendDecisionLog,
    setCampaignModalOpen,
    openCinematic,
  ]);

  // Keyboard navigation for campaign slides
  useEffect(() => {
    if (!isCampaignModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCampaignModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' && isUnlocked) {
        e.preventDefault();
        handleLaunchCurrent();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCampaignModalOpen, handlePrev, handleNext, handleLaunchCurrent, isUnlocked, setCampaignModalOpen]);

  if (!isCampaignModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#02050B]/90 backdrop-blur-md font-mono"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#040915] border-2 border-[#5FF3FF]/50 rounded-2xl shadow-[0_0_60px_rgba(95,243,255,0.25)] overflow-hidden text-slate-100">
        
        {/* Top Scanning Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#5FF3FF]/25 bg-[#071324]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/15 text-[#5FF3FF]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="campaign-modal-title"
                className="text-sm sm:text-base font-bold tracking-widest text-[#5FF3FF] uppercase"
              >
                {isEs
                  ? '◈ CARRUSEL DE CAMPAÑAS Y MISIONES DE LA NASA'
                  : '◈ NASA SOLAR SYSTEM CAMPAIGN DECK'}
              </h2>
              <p className="text-[10px] text-slate-400 tracking-wider">
                {isEs
                  ? '6 ASIGNACIONES DE VUELO PROGRESIVAS · APRENDIZAJE Y RETOS JPL'
                  : '6 TIERED FLIGHT CONTRACTS · TUTORIAL & ADVANCED JPL CHALLENGES'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              {activeIdx + 1} / {CAMPAIGN_CONTRACTS.length}
            </span>
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setCampaignModalOpen(false);
              }}
              aria-label="Cerrar modal"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#5FF3FF]/30 rounded hover:border-[#FF4D6D] hover:bg-[#FF4D6D]/15 hover:text-[#FF4D6D] text-slate-300 transition"
            >
              <X className="h-3.5 w-3.5" />
              <span>ESC</span>
            </button>
          </div>
        </div>

        {/* Commander Rank & Global Progress Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 py-2.5 bg-[#02050B] border-b border-[#5FF3FF]/15 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {isEs ? 'RANGO DEL RECLUTA:' : 'RECRUIT RANK:'}
            </span>
            <span className="font-bold text-[#FFC15E] bg-[#FFC15E]/10 px-2 py-0.5 rounded border border-[#FFC15E]/30 text-[11px]">
              {currentRank.badge} · {currentRank.title[language]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">XP:</span>
            <span className="font-bold text-[#5FF3FF] text-[11px]">{playerXP} XP</span>
            <span className="text-[9px] text-slate-500">
              ({currentRank.maxXP < 99999 ? `${currentRank.maxXP - playerXP} XP para ascenso` : 'RANGO MÁXIMO'})
            </span>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {isEs ? 'ESTRELLAS NASA:' : 'NASA STARS:'}
            </span>
            <span className="font-bold text-[#FFC15E] text-xs">
              ★ {totalStarsEarned} / 18
            </span>
          </div>
        </div>

        {/* Carousel Navigation Ribbon (Thumbnails of all 6 Campaigns) */}
        <div className="flex items-center justify-between border-b border-[#5FF3FF]/15 bg-[#050D1A] px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#071324] px-2.5 py-1 text-[11px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
            title={isEs ? 'Campaña anterior (Flecha Izquierda)' : 'Previous campaign (Left arrow)'}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{isEs ? 'ANTERIOR' : 'PREV'}</span>
          </button>

          {/* Mini Campaign Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
            {CAMPAIGN_CONTRACTS.map((c, idx) => {
              const isSelected = idx === activeIdx;
              const isUnlockedItem = isCampaignLevelUnlocked(c, campaignProgress, playerXP);
              const cProg = campaignProgress[c.id] || { stars: 0, completed: false };

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveIdx(idx);
                    playHoloTone('STEP', soundEnabled);
                  }}
                  className={`relative flex items-center gap-2 rounded border px-2.5 py-1 text-left transition ${
                    isSelected
                      ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-white shadow-[0_0_15px_rgba(95,243,255,0.25)] ring-1 ring-[#5FF3FF]'
                      : isUnlockedItem
                        ? 'border-slate-700 bg-[#07111F] text-slate-300 hover:border-slate-500'
                        : 'border-slate-800 bg-[#03060E] text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isUnlockedItem ? (
                      cProg.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                      ) : (
                        <Unlock className="h-3 w-3 text-[#5FF3FF]" />
                      )
                    ) : (
                      <Lock className="h-3 w-3 text-[#FF4D6D]" />
                    )}
                    <span className="text-[10px] font-bold">0{idx + 1}</span>
                  </div>

                  <div className="hidden md:block max-w-[120px] truncate text-[9.5px]">
                    {idx === 0 ? (isEs ? 'ACADEMIA (TUTORIAL)' : 'ACADEMY (TUTORIAL)') : c.code.split('·')[1]?.trim() || c.code}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#071324] px-2.5 py-1 text-[11px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
            title={isEs ? 'Siguiente campaña (Flecha Derecha)' : 'Next campaign (Right arrow)'}
          >
            <span className="hidden sm:inline">{isEs ? 'SIGUIENTE' : 'NEXT'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Active Campaign Slide Viewport */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Hologram CAD Stage of Destination */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#5FF3FF]/30 bg-[#02050B] p-5 text-center relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span>{contract.code}</span>
                <span className={isCompleted ? 'text-[#10B981]' : isUnlocked ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
                  {isCompleted
                    ? (isEs ? '✓ COMPLETADA' : '✓ COMPLETED')
                    : isUnlocked
                      ? (isEs ? 'ACCESO AUTORIZADO' : 'CLEARANCE GRANTED')
                      : (isEs ? 'ACCESO RESTRINGIDO' : 'RESTRICTED')}
                </span>
              </div>

              {/* Large Destination Visual SVG Graphic */}
              <div className="relative my-auto flex flex-col items-center justify-center py-6">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  {/* Orbit Ring Animation */}
                  <div className="absolute inset-0 rounded-full border border-[#5FF3FF]/30 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-3 rounded-full border border-[#5FF3FF]/20" />
                  
                  {/* Central Planetary Glyph */}
                  <div className="relative flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl">
                      {activeIdx === 0 ? '🌍' : activeIdx === 1 ? '☀️' : activeIdx === 2 ? '📡' : activeIdx === 3 ? '🌙' : activeIdx === 4 ? '🔭' : '🪐'}
                    </span>
                    <span className="mt-2 text-xs font-bold text-[#5FF3FF] tracking-wider uppercase">
                      {contract.destinationId.replace('dest-', '').toUpperCase()}
                    </span>
                  </div>

                  {/* Lock Overlay if Locked */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 rounded-full bg-[#02050B]/85 flex flex-col items-center justify-center border-2 border-[#FF4D6D]/60 shadow-[0_0_30px_rgba(255,77,109,0.3)]">
                      <Lock className="h-8 w-8 text-[#FF4D6D] animate-pulse" />
                      <span className="mt-1 text-[9px] font-bold text-[#FF4D6D] tracking-widest uppercase">
                        {contract.requiredXPToUnlock} XP REQ.
                      </span>
                    </div>
                  )}
                </div>

                {/* Stars earned for this contract */}
                <div className="mt-4 flex items-center gap-1.5 text-base">
                  {[1, 2, 3].map((starIdx) => (
                    <span
                      key={starIdx}
                      className={
                        starIdx <= progress.stars
                          ? 'text-[#FFC15E] drop-shadow-[0_0_8px_#FFC15E]'
                          : 'text-slate-700'
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-[10px] text-slate-400">
                    ({progress.stars} / 3 {isEs ? 'Estrellas' : 'Stars'})
                  </span>
                </div>
              </div>

              {/* Reward Chips */}
              <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-800 pt-3">
                <div className="rounded border border-slate-800 bg-[#071324] p-2 text-left">
                  <span className="text-slate-400">{isEs ? 'RECOMPENSA XP' : 'XP REWARD'}</span>
                  <div className="text-sm font-bold text-[#5FF3FF]">+{contract.rewardXP} XP</div>
                </div>
                <div className="rounded border border-slate-800 bg-[#071324] p-2 text-left">
                  <span className="text-slate-400">{isEs ? 'TIER DE MISIÓN' : 'MISSION TIER'}</span>
                  <div className="text-sm font-bold text-[#FFC15E]">TIER {contract.tier}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Mission Briefing, Tutorial Details & Launch Button */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Title & Badge */}
                <div>
                  {isFirstIntroCampaign && (
                    <div className="inline-flex items-center gap-1.5 rounded border border-[#5FF3FF] bg-[#5FF3FF]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#5FF3FF] uppercase mb-2 animate-pulse">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{isEs ? 'CAMPAÑA 01 · ACADEMIA DE VUELO (TUTORIAL INTRODUCTORIO)' : 'CAMPAIGN 01 · FLIGHT ACADEMY (INTRO TUTORIAL)'}</span>
                    </div>
                  )}

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {contract.title[language]}
                  </h3>
                  <div className="text-xs text-[#FFC15E] font-medium mt-0.5">
                    {isFirstIntroCampaign
                      ? isEs
                        ? 'Aprende paso a paso todas las fases del simulador espacial (CML 1 a CML 6).'
                        : 'Learn all space simulator phases step by step (CML 1 to CML 6).'
                      : contract.code}
                  </div>
                </div>

                {/* Tutorial Curriculum (If Campaign 1) */}
                {isFirstIntroCampaign && (
                  <div className="rounded-lg border border-[#5FF3FF]/40 bg-[#07172C]/90 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#5FF3FF]">
                      <Sparkles className="h-4 w-4" />
                      <span>{isEs ? 'PLAN DE ENTRENAMIENTO GUIADO (ASTRA TUTOR)' : 'GUIDED FLIGHT ACADEMY CURRICULUM'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#5FF3FF]">01.</span>
                        <span>{isEs ? 'Enunciado & Chasis CubeSat (1.5U - 3U)' : 'Concept & CubeSat Chassis (1.5U - 3U)'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#5FF3FF]">02.</span>
                        <span>{isEs ? 'Órbita LEO 400 km y Estación Terrena' : 'LEO 400 km Orbit & Ground Station'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#5FF3FF]">03.</span>
                        <span>{isEs ? 'Trade Space de Componentes' : 'Trade Space: Solar & Telecom'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#5FF3FF]">04.</span>
                        <span>{isEs ? 'Balance de Masa & Punto de Diseño' : 'Mass Balance & Point Design'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#5FF3FF]">05.</span>
                        <span>{isEs ? 'Revisión MCR (Green Flag)' : 'MCR Review Gate Approval'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#5FF3FF]">06.</span>
                        <span>{isEs ? 'Simulación Orbital & Crisis FTL' : 'Orbital Simulation & Crisis Handling'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mission Briefing Box */}
                <div className="rounded-lg border border-slate-800 bg-[#060D1A] p-4 space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    {isEs ? 'BRIEFING OPERACIONAL DE LA NASA:' : 'NASA OPERATIONAL BRIEFING:'}
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200 font-sans">
                    {contract.briefing[language]}
                  </p>
                </div>

                {/* Threat / Boss Hazard */}
                <div className="rounded-lg border border-[#FF4D6D]/30 bg-[#16080C]/80 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D6D]">
                    <ShieldAlert className="h-4 w-4" />
                    <span>{isEs ? 'AMENAZA ORBITAL PRINCIPAL:' : 'PRIMARY ORBITAL HAZARD:'}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    {contract.bossThreat[language]}
                  </p>
                </div>

                {/* Lock Requisite Notice if Locked */}
                {!isUnlocked && (
                  <div className="rounded-lg border border-[#FFC15E]/40 bg-[#140E04] p-3 text-xs text-[#FFC15E] flex items-center gap-2">
                    <Lock className="h-4 w-4 shrink-0" />
                    <div>
                      <div className="font-bold">
                        {isEs ? 'MISIÓN RESTRINGIDA POR FALTA DE RANGO' : 'MISSION RESTRICTED · INSUFFICIENT RANK'}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {isEs
                          ? `${unlockPrevLevel ? `Completa "${unlockPrevLevel.code}" o acumula ` : 'Acumula '}${contract.requiredXPToUnlock} XP (Tienes ${playerXP} XP).`
                          : `${unlockPrevLevel ? `Complete "${unlockPrevLevel.code}" or reach ` : 'Reach '}${contract.requiredXPToUnlock} XP (Currently ${playerXP} XP).`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Launch Action Button */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] text-slate-500 hidden lg:block">
                  {isEs ? 'Usa las flechas ← → para explorar todas las campañas' : 'Use arrow keys ← → to browse all campaigns'}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Dedicated Commander Briefing Button */}
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      unlockAudioContext();
                      const cinematicId = CONTRACT_TO_CINEMATIC[contract.id];
                      if (cinematicId) {
                        playHoloTone('STAR', soundEnabled);
                        openCinematic(cinematicId);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded border border-[#5FF3FF]/40 bg-[#071324] px-4 py-3 text-xs font-bold text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/15 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={isEs ? 'Escuchar transmisión personalizada del Comandante Vega' : 'Listen to Commander Vega transmission'}
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>
                      {isEs ? 'BRIEFING COMANDANTE' : 'COMMANDER BRIEFING'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={handleLaunchCurrent}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded px-7 py-3 text-xs font-bold tracking-wider uppercase transition shadow-lg ${
                      !isUnlocked
                        ? 'border border-slate-800 bg-slate-900/60 text-slate-600 cursor-not-allowed'
                        : isFirstIntroCampaign
                          ? 'border border-[#5FF3FF] bg-[#5FF3FF] text-[#02050B] hover:bg-[#7ff6ff] shadow-[0_0_25px_rgba(95,243,255,0.4)] cursor-pointer'
                          : 'border border-[#FFC15E] bg-[#FFC15E] text-[#02050B] hover:bg-[#ffd182] shadow-[0_0_25px_rgba(255,193,94,0.35)] cursor-pointer'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Rocket className="h-4 w-4" />
                        <span>
                          {isCompleted
                            ? isEs
                              ? 'REJUGAR PARA MEJORAR ESTRELLAS →'
                              : 'REPLAY FOR MORE STARS →'
                            : isFirstIntroCampaign
                              ? isEs
                                ? 'DESPLEGAR MISIÓN TUTORIAL →'
                                : 'DEPLOY INTRO TUTORIAL →'
                              : isEs
                                ? 'ACEPTAR CONTRATO DE MISIÓN →'
                                : 'ACCEPT FLIGHT CONTRACT →'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>
                          {isEs
                            ? `BLOQUEADO (${contract.requiredXPToUnlock} XP REQ)`
                            : `LOCKED (${contract.requiredXPToUnlock} XP REQ)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
