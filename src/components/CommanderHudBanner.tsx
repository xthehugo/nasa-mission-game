import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Volume2,
} from 'lucide-react';
import { useMissionStore, type RobotSpotlightZone } from '../store';
import {
  computeLevelStars,
  computeTankExtraMassKg,
  playHoloTone,
  speakCharacterLine,
  stopCharacterVoice,
} from './holoAudio';
import {
  COMMANDER_PHASE_BEATS,
  formatCommanderBeat,
  formatStoryText,
  getPhaseInteractiveTour,
} from './narrativeConfig';
import { RobotSvgIcon } from './RobotAssistantGuide';

export function CommanderHudBanner() {
  const {
    language,
    experienceMode,
    storyChapter,
    phase,
    cadetName,
    engineerName,
    missionCustomName,
    activeCinematicId,
    phaseTutorialStep,
    isGuideTourActive,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
    soundEnabled,
    openCinematic,
    nextPhaseTutorialStep,
    prevPhaseTutorialStep,
    setPhaseTutorialStep,
    setGuideTourActive,
    setRobotHoverZone,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const activeCallsign = isCadet ? cadetName : engineerName;
  const beat = COMMANDER_PHASE_BEATS[phase];

  const tourSteps = getPhaseInteractiveTour(phase);
  const safeTourIdx = Math.min(phaseTutorialStep, tourSteps.length - 1);
  const activeTourStep = isGuideTourActive && safeTourIdx < tourSteps.length
    ? tourSteps[safeTourIdx]
    : null;

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

  const overMass =
    starInfo.effectiveMassKg > metrics.launchCapacity_kg || !metrics.volume.isCompliant;
  const powerDeficit = metrics.power.generatedAtDestination_W < metrics.power.eclipseRequired_W;
  const rfRed = metrics.telecom.status === 'RED';

  let vegaText = '';
  if (activeTourStep) {
    if (activeTourStep.step === 0 && beat) {
      vegaText = formatCommanderBeat(
        isCadet ? beat.cadetScript[language] : beat.jplScript[language],
        activeCallsign,
        missionCustomName,
      );
    } else {
      vegaText = formatStoryText(
        activeTourStep.instruction[language],
        cadetName,
        engineerName,
        missionCustomName,
      );
    }
  } else if (overMass) {
    vegaText = isCadet
      ? isEs
        ? `Cadete ${cadetName}: masa o cofia rebasada (${starInfo.effectiveMassKg.toFixed(1)} kg). Aligera tanques o escala el cohete.`
        : `Cadet ${cadetName}: mass or fairing exceeded (${starInfo.effectiveMassKg.toFixed(1)} kg). Trim propellant or upgrade rocket.`
      : `VEGA // ALARMA MASA: ${starInfo.effectiveMassKg.toFixed(1)}/${metrics.launchCapacity_kg} KG · VOL ${metrics.volume.used_U}/${metrics.volume.maxFairing_U}U.`;
  } else if (powerDeficit) {
    vegaText = isCadet
      ? isEs
        ? `Cadete ${cadetName}: como en el Ícaro-1, la energía cae en el eclipse. Despliega alas solares mayores o usa RTG.`
        : `Cadet ${cadetName}: like Icarus-1, power drops in eclipse. Deploy larger solar wings or RTG.`
      : `VEGA // ALARMA EPS: ${metrics.power.generatedAtDestination_W.toFixed(0)}W < ${metrics.power.eclipseRequired_W.toFixed(0)}W ECLIPSE.`;
  } else if (rfRed) {
    vegaText = isCadet
      ? isEs
        ? `Cadete ${cadetName}: señal débil hacia Tierra. Cambia a Banda X/Ka o antena DSN.`
        : `Cadet ${cadetName}: weak RF link to Earth. Upgrade to X/Ka dish or DSN ground antenna.`
      : `VEGA // ALARMA ENLACE RF: ${metrics.telecom.linkMargin_dB.toFixed(1)} DB < REQ.`;
  } else if (activeRandomEvent !== 'NONE') {
    vegaText =
      activeRandomEvent === 'BUDGET_CUT'
        ? isEs
          ? `EVENTO: Recorte presupuestal activo. Mantén al menos 15% de reserva en ${missionCustomName}.`
          : `EVENT: Budget cut active. Keep at least 15% reserve on ${missionCustomName}.`
        : activeRandomEvent === 'SOLAR_STORM'
          ? isEs
            ? `EVENTO: Tormenta Solar (-10% margen EPS). Aumenta generación eléctrica.`
            : `EVENT: Solar storm (-10% EPS margin). Boost power generation.`
          : isEs
            ? `EVENTO: Penalización térmica (+8% masa). Vigila el límite del lanzador.`
            : `EVENT: Thermal mass penalty (+8% mass). Watch launch cap.`;
  } else if (isCadet) {
    vegaText = formatCommanderBeat(
      beat.cadetScript[language],
      cadetName,
      missionCustomName,
    );
  } else {
    vegaText = formatCommanderBeat(
      beat.jplScript[language],
      engineerName,
      missionCustomName,
    );
  }

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'NONE' | 'VEGA' | 'ASTRA'>('NONE');
  const lastSpokenKeyRef = useRef<string>('');

  // Sync robot spotlight highlight to the active tour step
  useEffect(() => {
    if (activeCinematicId || !isGuideTourActive || !activeTourStep) {
      setRobotHoverZone(null);
      return;
    }
    setRobotHoverZone(activeTourStep.targetZone);
  }, [activeCinematicId, activeTourStep, isGuideTourActive, setRobotHoverZone]);

  // Right-Click (Anticlic) anywhere on a panel with [data-astra-zone] jumps to that guidance step
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (activeCinematicId) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const zoneEl = target.closest('[data-astra-zone]') as HTMLElement | null;
      if (!zoneEl) return;

      const zoneAttr = zoneEl.getAttribute('data-astra-zone') as RobotSpotlightZone | null;
      if (!zoneAttr) return;

      e.preventDefault();
      setGuideTourActive(true);

      const matchingIdx = tourSteps.findIndex((s) => s.targetZone === zoneAttr);
      if (matchingIdx >= 0) {
        setPhaseTutorialStep(matchingIdx);
      }
      setRobotHoverZone(zoneAttr);
      playHoloTone('STEP', soundEnabled);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [activeCinematicId, setGuideTourActive, setPhaseTutorialStep, setRobotHoverZone, soundEnabled, tourSteps]);

  const flightAlert = overMass
    ? 'OVERMASS'
    : powerDeficit
      ? 'POWER'
      : rfRed
        ? 'RF'
        : activeRandomEvent !== 'NONE'
          ? activeRandomEvent
          : 'NORMAL';

  // Primary Commander Vega Voice used for ALL instructions
  const currentSpeechKey = `${phase}|${phaseTutorialStep}|${flightAlert}|${language}|VEGA_PRIMARY`;

  // Speak Commander Vega instruction when step changes or cutscene closes
  useEffect(() => {
    if (activeCinematicId || !soundEnabled) {
      stopCharacterVoice();
      return;
    }

    if (lastSpokenKeyRef.current === currentSpeechKey) {
      return;
    }
    lastSpokenKeyRef.current = currentSpeechKey;

    let safetyWatchdog = 0;
    const timer = window.setTimeout(() => {
      setIsSpeaking(true);
      safetyWatchdog = window.setTimeout(() => {
        setIsSpeaking(false);
      }, 8000);
      speakCharacterLine(vegaText, language, 'VEGA', soundEnabled, () => {
        window.clearTimeout(safetyWatchdog);
        setIsSpeaking(false);
      });
    }, 140);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safetyWatchdog);
      setIsSpeaking(false);
    };
  }, [activeCinematicId, currentSpeechKey, language, soundEnabled, vegaText]);

  const chapterBadge =
    storyChapter === 'FREE_SANDBOX'
      ? isEs ? '★ FORJA INFINITA' : '★ SANDBOX'
      : isCadet
        ? isEs ? `ACTO I · CADETE ${cadetName}` : `ACT I · CADET ${cadetName}`
        : isEs ? `ACTO II · ING. ${engineerName}` : `ACT II · ENG. ${engineerName}`;

  return (
    <div
      data-astra-zone="COMMANDER_HUD"
      className="space-y-3 border-b border-[#5FF3FF]/20 pb-3.5"
    >
      <div className="flex items-start gap-3">
        {/* Wireframe Geometric Portrait of Commander Vega / Director Rostova */}
        <div className="shrink-0 border border-[#5FF3FF]/35 bg-[#04080F] p-1.5">
          <svg viewBox="0 0 48 48" className="h-11 w-11">
            <polygon
              points="24,4 38,14 38,32 24,42 10,32 10,14"
              fill="none"
              stroke={isCadet ? '#5FF3FF' : '#FFC15E'}
              strokeWidth="1"
            />
            <polygon
              points="15,17 33,17 31,26 17,26"
              fill="none"
              stroke="#5FF3FF"
              strokeWidth="1"
            />
            <line x1="18" y1="32" x2="30" y2="32" stroke="#FFC15E" strokeWidth="1" />
            {isSpeaking && !reducedMotion &&
              [20, 24, 28].map((x, idx) => (
                <motion.line
                  key={x}
                  x1={x}
                  x2={x}
                  y1="36"
                  stroke="#5FF3FF"
                  strokeWidth="1.5"
                  animate={{ y2: [37, 42 - idx * 2, 37] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.35 + idx * 0.1,
                  }}
                />
              ))}
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase">
            <span className="text-[#5FF3FF]">
              {isEs ? 'CMDR FRANK VEGA · EN VIVO' : 'CMDR FRANK VEGA · LIVE'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsSpeaking(true);
                  speakCharacterLine(
                    vegaText,
                    language,
                    'VEGA',
                    true,
                    () => setIsSpeaking(false),
                  );
                }}
                className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[8.5px] transition ${
                  isSpeaking
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/25 text-white shadow-[0_0_10px_rgba(95,243,255,0.4)]'
                    : 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-[#5FF3FF] hover:bg-[#5FF3FF]/20'
                }`}
              >
                <Volume2 className={`h-3 w-3 ${isSpeaking ? 'animate-pulse text-white' : ''}`} />
                <span>{isSpeaking ? (isEs ? 'TRANSMITIENDO...' : 'TRANSMITTING...') : (isEs ? 'VOZ' : 'VOICE')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  openCinematic(
                    isCadet ? beat.defaultCinematicId.cadet : beat.defaultCinematicId.jpl,
                  );
                }}
                className="inline-flex items-center gap-1 border border-[#FFC15E]/50 bg-[#FFC15E]/10 px-1.5 py-0.5 font-mono text-[8.5px] text-[#FFC15E] hover:bg-[#FFC15E]/20"
              >
                <Film className="h-3 w-3" />
                <span>{isEs ? 'CINEMÁTICA' : 'CUTSCENE'}</span>
              </button>
            </div>
          </div>
          <div className="mt-0.5 font-mono text-[8.5px] tracking-[0.14em] text-slate-400 uppercase">
            {chapterBadge} · {activeCallsign}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-200">{vegaText}</p>
        </div>
      </div>

      {/* Interactive Guided Tour Card across ALL Modules */}
      {activeTourStep && (
        <div className="border border-[#5FF3FF]/60 bg-[#040B14]/92 p-3 shadow-[0_0_24px_rgba(95,243,255,0.18)]">
          <div className="flex items-center justify-between gap-2 font-mono text-[9.5px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase">
            <span className="flex items-center gap-1.5">
              <RobotSvgIcon className="h-4 w-4 text-[#5FF3FF]" />
              <span>{activeTourStep.badge[language]}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] text-[#FFC15E]">
                {isEs
                  ? `PASO ${safeTourIdx + 1} DE ${tourSteps.length}`
                  : `STEP ${safeTourIdx + 1} OF ${tourSteps.length}`}
              </span>
              <button
                type="button"
                onClick={() => setGuideTourActive(!isGuideTourActive)}
                className="text-[8.5px] text-slate-400 underline hover:text-white cursor-pointer"
              >
                {isEs ? 'Ocultar guía' : 'Hide guide'}
              </button>
            </div>
          </div>

          <p className="mt-1 text-[11.5px] font-semibold leading-snug text-white">
            {activeTourStep.title[language]}
          </p>

          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">
            {activeTourStep.instruction[language]
              .replace('{cadet}', cadetName)
              .replace('{callsign}', activeCallsign)}
          </p>

          {/* ASTRA Pedagogical Tip */}
          {activeTourStep.astraTip && (
            <div className="mt-2.5 flex items-start gap-2 rounded border border-[#5FF3FF]/35 bg-[#5FF3FF]/10 p-2 text-left">
              <RobotSvgIcon className="h-5 w-5 shrink-0 text-[#5FF3FF] mt-0.5" />
              <div className="leading-snug">
                <span className="font-mono text-[8px] font-bold tracking-wider text-[#FFC15E] uppercase">
                  {isEs ? '◈ PISTA DIDÁCTICA ASTRA: ' : '◈ ASTRA TUTOR TIP: '}
                </span>
                <span className="text-[10.5px] text-slate-200">
                  {activeTourStep.astraTip[language]}
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#5FF3FF]/20">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeTourIdx === 0}
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  prevPhaseTutorialStep();
                }}
                className={`inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-[9px] uppercase transition cursor-pointer ${
                  safeTourIdx === 0
                    ? 'cursor-not-allowed border-slate-800 bg-[#04080F]/40 text-slate-600'
                    : 'border-slate-700 bg-[#08111E] text-slate-300 hover:border-[#5FF3FF]/60 hover:text-white'
                }`}
              >
                <ChevronLeft className="h-3 w-3" />
                <span>{isEs ? 'Anterior' : 'Previous'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const isLast = safeTourIdx === tourSteps.length - 1;
                  playHoloTone(isLast ? 'STAR' : 'STEP', soundEnabled);
                  if (!isLast) {
                    nextPhaseTutorialStep(tourSteps.length);
                  } else {
                    setGuideTourActive(false);
                  }
                }}
                className="inline-flex items-center gap-1 border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1 font-mono text-[9px] font-bold text-[#5FF3FF] uppercase shadow-[0_0_12px_rgba(95,243,255,0.25)] hover:bg-[#5FF3FF]/30 transition cursor-pointer"
              >
                <span>
                  {safeTourIdx === tourSteps.length - 1
                    ? isEs ? '✓ Listo' : '✓ Done'
                    : isEs ? 'Siguiente →' : 'Next →'}
                </span>
                {safeTourIdx < tourSteps.length - 1 && <ChevronRight className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveSpeaker('VEGA');
                  setIsSpeaking(true);
                  speakCharacterLine(vegaText, language, 'VEGA', true, () => {
                    setActiveSpeaker('NONE');
                    setIsSpeaking(false);
                  });
                }}
                title={isEs ? 'Escuchar voz de mando del Comandante Vega' : 'Listen to Commander Vega'}
                className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[8.5px] transition cursor-pointer ${
                  activeSpeaker === 'VEGA'
                    ? 'border-[#FFC15E] bg-[#FFC15E]/25 text-white shadow-[0_0_10px_rgba(255,193,94,0.4)]'
                    : 'border-[#FFC15E]/50 bg-[#FFC15E]/10 text-[#FFC15E] hover:bg-[#FFC15E]/20'
                }`}
              >
                <Volume2 className="h-3 w-3" />
                <span>{isEs ? 'VOZ VEGA' : 'VOICE VEGA'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const astraText = activeTourStep.astraTip?.[language] || activeTourStep.instruction[language];
                  setActiveSpeaker('ASTRA');
                  speakCharacterLine(astraText, language, 'ROSTOVA', true, () => {
                    setActiveSpeaker('NONE');
                  });
                }}
                title={isEs ? 'Escuchar consejo didáctico de ASTRA (la chica)' : 'Listen to ASTRA assistant tip'}
                className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[8.5px] transition cursor-pointer ${
                  activeSpeaker === 'ASTRA'
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/25 text-white shadow-[0_0_10px_rgba(95,243,255,0.4)]'
                    : 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-[#5FF3FF] hover:bg-[#5FF3FF]/20'
                }`}
              >
                <RobotSvgIcon className="h-3.5 w-3.5" />
                <span>{isEs ? 'VOZ ASTRA' : 'VOICE ASTRA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Star Criteria */}
      <div className="space-y-1 font-mono text-[10px] tracking-[0.14em] uppercase">
        <div className="text-slate-400">{isEs ? 'PARA GANAR ESTRELLAS' : 'STAR CRITERIA'}</div>
        <div className={starInfo.marginOk ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
          ▸ {isEs ? `MARGEN MAYOR A ${isCadet ? 35 : 40}%` : `MARGIN OVER ${isCadet ? 35 : 40}%`}
        </div>
        <div className={starInfo.zeroConflicts ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
          ▸ {isEs ? 'CERO CONFLICTOS' : 'ZERO CONFLICTS'}
        </div>
        <div className={starInfo.budgetOk ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
          ▸ {isEs ? 'BAJO PRESUPUESTO' : 'UNDER BUDGET'}
        </div>
      </div>
    </div>
  );
}
