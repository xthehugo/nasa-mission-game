import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Film,
  Volume2,
  Zap,
} from 'lucide-react';
import { useMissionStore } from '../store';
import {
  computeLevelStars,
  computeTankExtraMassKg,
  playHoloTone,
  speakCharacterLine,
  stopCharacterVoice,
} from './holoAudio';
import {
  COMMANDER_PHASE_BEATS,
  CONTRACT_TO_CINEMATIC,
  formatCommanderBeat,
  formatStoryText,
  getPhaseInteractiveTour,
} from './narrativeConfig';
import { getMissionPhaseContent } from './missionDialogueConfig';
import {
  LEVEL1_TOTAL_STEPS,
  LEVEL1_TUTORIAL_STEPS,
} from './level1TutorialConfig';

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
    activeCampaignLevelId,
    level1TutorialStep,
    phaseTutorialStep,
    isGuideTourActive,
    tutorialFeedback,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    selection,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
    soundEnabled,
    openCinematic,
    setPhase,
    setLevel1TutorialStep,
    setPhaseTutorialStep,
    nextPhaseTutorialStep,
    prevPhaseTutorialStep,
    setRobotHoverZone,
    setTutorialFeedback,
    launchSimulation,
    setCertificateOpen,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const activeCallsign = isCadet ? cadetName : engineerName;
  const beat = COMMANDER_PHASE_BEATS[phase];
  const missionContent = getMissionPhaseContent(activeCampaignLevelId, phase);

  const isLevel1GuidedTour =
    activeCampaignLevelId === 'contract-leo-bionutrients' &&
    level1TutorialStep < LEVEL1_TOTAL_STEPS;
  const activeTourStep = isLevel1GuidedTour
    ? LEVEL1_TUTORIAL_STEPS[level1TutorialStep]
    : null;

  const phaseTourSteps = getPhaseInteractiveTour(phase, activeCampaignLevelId);
  const safePhaseTourIdx = Math.max(0, Math.min(phaseTutorialStep, phaseTourSteps.length - 1));
  const activePhaseTourStep = phaseTourSteps[safePhaseTourIdx];

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
    vegaText = formatStoryText(
      activeTourStep.why[language],
      cadetName,
      engineerName,
      missionCustomName,
    );
  } else if (overMass) {
    vegaText = isCadet
      ? isEs
        ? `Cadete ${cadetName}: masa o cofia rebasada (${starInfo.effectiveMassKg.toFixed(1)} kg). Aligera tanques o escala el cohete.`
        : `Cadet ${cadetName}: mass or fairing exceeded (${starInfo.effectiveMassKg.toFixed(1)} kg). Trim propellant or upgrade rocket.`
      : `ROSTOVA // ALARM MASS: ${starInfo.effectiveMassKg.toFixed(1)}/${metrics.launchCapacity_kg} KG · VOL ${metrics.volume.used_U}/${metrics.volume.maxFairing_U}U.`;
  } else if (powerDeficit) {
    const isJupiter = selection.destinationId === 'dest-jupiter';
    vegaText = isCadet
      ? isEs
        ? isJupiter
          ? `Cadete ${cadetName}: a 5.2 UA la luz solar cae al 3.7%. Necesitas un generador nuclear RTG para operar en Júpiter.`
          : `Cadete ${cadetName}: la energía cae en el eclipse orbital. Despliega alas solares mayores o amplía la batería.`
        : isJupiter
          ? `Cadet ${cadetName}: at 5.2 AU solar power drops to 3.7%. Equip an RTG nuclear generator for Jupiter.`
          : `Cadet ${cadetName}: power drops during orbital eclipse. Deploy larger solar wings or expand battery.`
      : `ROSTOVA // ALARM EPS: ${metrics.power.generatedAtDestination_W.toFixed(0)}W < ${metrics.power.eclipseRequired_W.toFixed(0)}W ECLIPSE.`;
  } else if (rfRed) {
    vegaText = isCadet
      ? isEs
        ? `Cadete ${cadetName}: señal débil hacia Tierra. Cambia a Banda X/Ka o antena DSN.`
        : `Cadet ${cadetName}: weak RF link to Earth. Upgrade to X/Ka dish or DSN ground antenna.`
      : `ROSTOVA // ALARM RF LINK: ${metrics.telecom.linkMargin_dB.toFixed(1)} DB < REQ.`;
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
      missionContent.commanderBrief.cadet[language],
      cadetName,
      missionCustomName,
    );
  } else {
    vegaText = formatCommanderBeat(
      missionContent.commanderBrief.jpl[language],
      engineerName,
      missionCustomName,
    );
  }

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [starsOpen, setStarsOpen] = useState(true);
  const [idleHint, setIdleHint] = useState(false);

  useEffect(() => {
    if (!isLevel1GuidedTour) return;
    const timer = window.setTimeout(() => setIdleHint(true), 8000);
    return () => {
      window.clearTimeout(timer);
      setIdleHint(false);
    };
  }, [isLevel1GuidedTour, level1TutorialStep]);
  const lastSpokenKeyRef = useRef<string>('');

  // Clean previous voice/feedback state when switching active campaign mission
  useEffect(() => {
    stopCharacterVoice();
    lastSpokenKeyRef.current = '';
    const timer = window.setTimeout(() => {
      setIsSpeaking(false);
      setTutorialFeedback(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeCampaignLevelId, setTutorialFeedback]);

  const flightAlert = overMass
    ? 'OVERMASS'
    : powerDeficit
      ? 'POWER'
      : rfRed
        ? 'RF'
        : activeRandomEvent !== 'NONE'
          ? activeRandomEvent
          : 'NORMAL';

  const currentSpeechKey = `${activeCampaignLevelId}|${phase}|${level1TutorialStep}|${flightAlert}|${language}|${isCadet ? 'CADET' : 'JPL'}`;

  // Speak Commander Vega / Director Rostova instruction when cutscene closes or tutorial step advances
  useEffect(() => {
    if (activeCinematicId || !soundEnabled) {
      stopCharacterVoice();
      return;
    }

    if (lastSpokenKeyRef.current === currentSpeechKey) {
      return;
    }
    lastSpokenKeyRef.current = currentSpeechKey;

    const speaker = isCadet ? 'VEGA' : 'ROSTOVA';
    let safetyWatchdog = 0;
    const timer = window.setTimeout(() => {
      setIsSpeaking(true);
      safetyWatchdog = window.setTimeout(() => {
        console.warn('[CommanderHudBanner] Speech state exceeded 8s without completion; auto-releasing.');
        setIsSpeaking(false);
      }, 8000);
      speakCharacterLine(vegaText, language, speaker, soundEnabled, () => {
        window.clearTimeout(safetyWatchdog);
        setIsSpeaking(false);
      });
    }, 140);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safetyWatchdog);
      setIsSpeaking(false);
    };
  }, [activeCinematicId, currentSpeechKey, isCadet, language, soundEnabled, vegaText]);

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
              {isCadet
                ? isEs ? 'CMDR VEGA · EN VIVO' : 'CMDR VEGA · LIVE'
                : isEs ? 'ROSTOVA & VEGA · JPL' : 'ROSTOVA & VEGA · JPL'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsSpeaking(true);
                  speakCharacterLine(
                    vegaText,
                    language,
                    isCadet ? 'VEGA' : 'ROSTOVA',
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
                  const activeCinematic =
                    CONTRACT_TO_CINEMATIC[activeCampaignLevelId] ??
                    (isCadet ? beat.defaultCinematicId.cadet : beat.defaultCinematicId.jpl);
                  openCinematic(activeCinematic);
                }}
                className="inline-flex items-center gap-1 border border-[#FFC15E]/50 bg-[#FFC15E]/10 px-1.5 py-0.5 font-mono text-[8.5px] text-[#FFC15E] hover:bg-[#FFC15E]/20"
              >
                <Film className="h-3 w-3" />
                <span>{isEs ? 'CINEMÁTICA' : 'CUTSCENE'}</span>
              </button>
            </div>
          </div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-slate-400 uppercase">
            {chapterBadge} · {activeCallsign}
          </div>
          <p className="mt-1 text-[12.5px] leading-snug text-slate-200 line-clamp-3 hover:line-clamp-none">
            {vegaText}
          </p>

          {!isLevel1GuidedTour && !isGuideTourActive && (
            <div className="mt-2 border-l-2 border-[#5FF3FF]/70 bg-[#5FF3FF]/5 px-2.5 py-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#5FF3FF]">
                <span className="font-bold text-[#FFC15E]">ASTRA // {isEs ? 'GUÍA DE PASO' : 'STEP GUIDE'}</span>
                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setIsSpeaking(true);
                    speakCharacterLine(
                      missionContent.astraGuide.oneLiner[language],
                      language,
                      'ROSTOVA',
                      true,
                      () => setIsSpeaking(false),
                    );
                  }}
                  title={isEs ? 'Escuchar guía de ASTRA' : 'Listen to ASTRA guide'}
                  className="inline-flex items-center gap-1 border border-[#FFC15E]/40 bg-[#FFC15E]/10 px-1 py-0.5 text-[8.5px] text-[#FFC15E] hover:bg-[#FFC15E]/20"
                >
                  <Bot className="h-3 w-3" />
                  <span>{isEs ? 'VOZ ASTRA' : 'VOICE ASTRA'}</span>
                </button>
              </div>
              <p className="mt-0.5 text-slate-200">{missionContent.astraGuide.oneLiner[language]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Level 01 Interactive 10-Step Flight Academy Tutorial */}
      {isLevel1GuidedTour && activeTourStep && (
        <div
          className={`pointer-events-auto relative z-10 border-l-2 bg-[#061224]/95 px-3 py-2.5 ${
            idleHint
              ? 'border-[#FFC15E] ring-2 ring-[#FFC15E]/60 shadow-[0_0_22px_rgba(255,193,94,0.28)]'
              : 'border-[#5FF3FF] bg-[#FFC15E]/8'
          }`}
        >
          <div className="flex items-center justify-between gap-2 font-mono text-[10.5px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase">
            <span>{activeTourStep.badge[language]}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setIsSpeaking(true);
                  speakCharacterLine(
                    `${activeTourStep.title[language]}. ${activeTourStep.why[language]}`,
                    language,
                    'VEGA',
                    true,
                    () => setIsSpeaking(false),
                  );
                }}
                title={isEs ? 'Escuchar orden del Comandante Vega' : 'Listen to Commander Vega order'}
                className="inline-flex items-center gap-1 border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-1.5 py-0.5 text-[9px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20"
              >
                <Volume2 className="h-3 w-3" />
                <span>{isEs ? 'VOZ VEGA' : 'VOICE VEGA'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setIsSpeaking(true);
                  speakCharacterLine(
                    activeTourStep.inactivityHint[language],
                    language,
                    'ROSTOVA',
                    true,
                    () => setIsSpeaking(false),
                  );
                }}
                title={isEs ? 'Escuchar pista didáctica de ASTRA' : 'Listen to ASTRA teaching hint'}
                className="inline-flex items-center gap-1 border border-[#FFC15E]/40 bg-[#FFC15E]/10 px-1.5 py-0.5 text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20"
              >
                <Bot className="h-3 w-3" />
                <span>{isEs ? 'VOZ ASTRA' : 'VOICE ASTRA'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTutorialFeedback(null);
                  setLevel1TutorialStep(LEVEL1_TOTAL_STEPS);
                }}
                className="text-[10px] text-slate-400 underline hover:text-white"
              >
                {isEs ? 'Saltar' : 'Skip'}
              </button>
            </div>
          </div>

          {/* Tutorial progress bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-slate-800/90">
            <div
              className="h-full bg-[#5FF3FF] transition-all duration-300"
              style={{
                width: `${((level1TutorialStep + 1) / LEVEL1_TOTAL_STEPS) * 100}%`,
              }}
            />
          </div>

          <p className="mt-2 text-[13.5px] font-semibold leading-snug text-white">
            {activeTourStep.title[language]}
          </p>

          {tutorialFeedback && (
            <div
              className={`mt-1.5 border px-2.5 py-1.5 font-mono text-[11px] leading-snug ${
                tutorialFeedback.isError
                  ? 'border-[#FFC15E]/70 bg-[#FFC15E]/15 text-[#FFC15E]'
                  : 'border-[#5FF3FF]/60 bg-[#5FF3FF]/12 text-[#5FF3FF]'
              }`}
            >
              {tutorialFeedback[language]}
            </div>
          )}

          {idleHint && (
            <p className="mt-1.5 border border-[#FFC15E]/50 bg-[#FFC15E]/12 px-2 py-1 font-mono text-[11px] text-[#FFC15E]">
              {activeTourStep.inactivityHint[language]}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            {level1TutorialStep === 0 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setTutorialFeedback({
                    en: 'Great! Now inspect the BioNutrients-2 contract card.',
                    es: '¡Bien! Ahora toca la tarjeta del contrato BioNutrients-2.',
                  });
                  setLevel1TutorialStep(1);
                }}
                className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30"
              >
                {isEs
                  ? 'ENTENDIDO · LEER CONTRATO →'
                  : 'GOT IT · READ CONTRACT →'}
              </button>
            ) : level1TutorialStep === 4 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STAR', soundEnabled);
                  setTutorialFeedback({
                    en: '20% margin rule understood! Next: explore orbit & ground telemetry.',
                    es: '¡Regla del 20% entendida! Ahora ingresa a Órbita y Estaciones Terrenas.',
                  });
                  setLevel1TutorialStep(5);
                  setPhase('CML_2');
                }}
                className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30 cursor-pointer"
              >
                {isEs
                  ? 'CONFIRMAR MÁRGENES (≥20%) E IR A ÓRBITA (NIVEL 02) →'
                  : 'CONFIRM MARGINS (≥20%) & GO TO ORBIT (LEVEL 02) →'}
              </button>
            ) : level1TutorialStep === 5 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setTutorialFeedback({
                    en: 'LEO Orbit & Eclipse verified! Next: configure science payload and trade space.',
                    es: '¡Órbita LEO y cono de eclipse verificados! Ahora equilibra carga útil y subsistemas.',
                  });
                  setLevel1TutorialStep(6);
                  setPhase('CML_3');
                }}
                className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30 cursor-pointer"
              >
                {isEs
                  ? 'CONFIRMAR ÓRBITA E IR A CARGA ÚTIL (NIVEL 03) →'
                  : 'CONFIRM ORBIT & GO TO PAYLOAD (LEVEL 03) →'}
              </button>
            ) : level1TutorialStep === 6 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setTutorialFeedback({
                    en: 'Subsystems balanced! Next: fill propellant tanks and configure eclipse batteries.',
                    es: '¡Subsistemas equilibrados! Ahora carga tanques de propelente y baterías.',
                  });
                  setLevel1TutorialStep(7);
                  setPhase('CML_4');
                }}
                className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30 cursor-pointer"
              >
                {isEs
                  ? 'CONFIRMAR SUBSISTEMAS E IR A TANQUES (NIVEL 04) →'
                  : 'CONFIRM SUBSYSTEMS & GO TO TANKS (LEVEL 04) →'}
              </button>
            ) : level1TutorialStep === 7 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setTutorialFeedback({
                    en: 'Tanks and batteries ready! Next: conduct MCR verification and sign launch gate.',
                    es: '¡Tanques y baterías listos! Ahora realiza la verificación MCR antes del despegue.',
                  });
                  setLevel1TutorialStep(8);
                  setPhase('CML_5');
                }}
                className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30 cursor-pointer"
              >
                {isEs
                  ? 'CONFIRMAR TANQUES E IR A REVISIÓN MCR (NIVEL 05) →'
                  : 'CONFIRM TANKS & GO TO MCR GATE (LEVEL 05) →'}
              </button>
            ) : level1TutorialStep === 8 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STAR', soundEnabled);
                  setTutorialFeedback({
                    en: 'MCR Authorized! Cape Canaveral countdown initiated.',
                    es: '¡MCR Autorizado! Cuenta regresiva en Cabo Cañaveral iniciada.',
                  });
                  setLevel1TutorialStep(9);
                  launchSimulation();
                }}
                className="w-full border border-[#10B981] bg-[#10B981]/25 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#10B981] uppercase hover:bg-[#10B981]/35 shadow-[0_0_16px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                {isEs
                  ? 'AUTORIZAR MCR E INICIAR DESPEGUE (NIVEL 06) →'
                  : 'AUTHORIZE MCR & LAUNCH MISSION (LEVEL 06) →'}
              </button>
            ) : level1TutorialStep === 9 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STAR', soundEnabled);
                  setTutorialFeedback({
                    en: 'Flight stabilized! Proceed to final evaluation and NASA Certificate.',
                    es: '¡Vuelo estabilizado! Procede a la evaluación final y Certificado NASA.',
                  });
                  setLevel1TutorialStep(10);
                }}
                className="w-full border border-[#FFC15E] bg-[#FFC15E]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#FFC15E] uppercase hover:bg-[#FFC15E]/30 cursor-pointer"
              >
                {isEs
                  ? 'AVANZAR A EVALUACIÓN Y CERTIFICADO (PASO FINAL) →'
                  : 'PROCEED TO EVALUATION & CERTIFICATE (FINAL STEP) →'}
              </button>
            ) : activeTourStep.isFinalExam ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STAR', soundEnabled);
                  setCertificateOpen(true);
                }}
                className="w-full border border-[#FFC15E] bg-[#FFC15E]/25 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#FFC15E] uppercase hover:bg-[#FFC15E]/35 shadow-[0_0_18px_rgba(255,193,94,0.3)] cursor-pointer"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#FFC15E]" />
                  <span>
                    {isEs
                      ? '🏆 ABRIR CERTIFICADO OFICIAL NASA Y RECLAMAR ESTRELLAS'
                      : '🏆 OPEN OFFICIAL NASA CERTIFICATE & CLAIM STARS'}
                  </span>
                </span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] text-[#5FF3FF] uppercase">
                <Zap className="h-3.5 w-3.5 shrink-0 text-[#FFC15E]" />
                <span>
                  {isEs
                    ? 'COMPLETA LA ACCIÓN ILUMINADA PARA AVANZAR'
                    : 'COMPLETE THE HIGHLIGHTED ACTION TO ADVANCE'}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interactive Guided Tour across all other modules (CML 02-06 or replay) */}
      {!isLevel1GuidedTour && isGuideTourActive && activePhaseTourStep && (
        <div className="pointer-events-auto relative z-10 border-l-2 border-[#5FF3FF] bg-[#061224]/95 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold tracking-[0.12em] text-[#5FF3FF] uppercase">
            <div className="flex items-center gap-1.5">
              <span className="text-[#FFC15E]">{activePhaseTourStep.badge[language]}</span>
              <span className="text-slate-400">
                ({safePhaseTourIdx + 1}/{phaseTourSteps.length})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setIsSpeaking(true);
                  speakCharacterLine(
                    activePhaseTourStep.instruction[language],
                    language,
                    'VEGA',
                    true,
                    () => setIsSpeaking(false),
                  );
                }}
                title={isEs ? 'Escuchar orden del Comandante Vega' : 'Listen to Commander Vega order'}
                className="inline-flex items-center gap-1 border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-1.5 py-0.5 text-[9px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20"
              >
                <Volume2 className="h-3 w-3" />
                <span>{isEs ? 'VOZ VEGA' : 'VOICE VEGA'}</span>
              </button>

              {activePhaseTourStep.astraTip && (
                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setIsSpeaking(true);
                    speakCharacterLine(
                      activePhaseTourStep.astraTip![language],
                      language,
                      'ROSTOVA',
                      true,
                      () => setIsSpeaking(false),
                    );
                  }}
                  title={isEs ? 'Escuchar consejo pedagógico de ASTRA' : 'Listen to ASTRA teaching tip'}
                  className="inline-flex items-center gap-1 border border-[#FFC15E]/40 bg-[#FFC15E]/10 px-1.5 py-0.5 text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20"
                >
                  <Bot className="h-3 w-3" />
                  <span>{isEs ? 'VOZ ASTRA' : 'VOICE ASTRA'}</span>
                </button>
              )}
            </div>
          </div>

          <p className="mt-1.5 text-[13px] font-semibold leading-snug text-white">
            {activePhaseTourStep.title[language]}
          </p>

          <p className="mt-1 text-[12px] leading-relaxed text-slate-200">
            {formatCommanderBeat(
              activePhaseTourStep.instruction[language],
              activeCallsign,
              missionCustomName,
            )}
          </p>

          {activePhaseTourStep.astraTip && (
            <div className="mt-2 flex items-start gap-1.5 border-l border-[#5FF3FF]/60 bg-[#5FF3FF]/8 px-2 py-1 font-mono text-[10.5px] text-[#5FF3FF]">
              <span className="shrink-0 font-bold">ASTRA:</span>
              <span>{activePhaseTourStep.astraTip[language]}</span>
            </div>
          )}

          {/* Stepper Navigation: Anterior / Siguiente */}
          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2">
            <button
              type="button"
              disabled={safePhaseTourIdx === 0}
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                prevPhaseTutorialStep();
                const prevIdx = Math.max(0, safePhaseTourIdx - 1);
                setRobotHoverZone(phaseTourSteps[prevIdx]?.targetZone ?? null);
              }}
              className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px] uppercase transition ${
                safePhaseTourIdx === 0
                  ? 'cursor-not-allowed border-slate-800 text-slate-600'
                  : 'border-slate-700 bg-[#08111E] text-slate-300 hover:border-[#5FF3FF]/60 hover:text-white'
              }`}
            >
              <ChevronLeft className="h-3 w-3" />
              <span>{isEs ? 'Anterior' : 'Previous'}</span>
            </button>

            {/* Step indicator dots */}
            <div className="flex items-center gap-1">
              {phaseTourSteps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setPhaseTutorialStep(idx);
                    setRobotHoverZone(phaseTourSteps[idx]?.targetZone ?? null);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === safePhaseTourIdx
                      ? 'w-4 bg-[#5FF3FF]'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`${isEs ? 'Paso' : 'Step'} ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                if (safePhaseTourIdx + 1 < phaseTourSteps.length) {
                  nextPhaseTutorialStep(phaseTourSteps.length - 1);
                  const nextIdx = safePhaseTourIdx + 1;
                  setRobotHoverZone(phaseTourSteps[nextIdx]?.targetZone ?? null);
                } else {
                  // Tour completed for this module
                  setRobotHoverZone(null);
                  setPhaseTutorialStep(0);
                }
              }}
              className="inline-flex items-center gap-1 border border-[#5FF3FF] bg-[#5FF3FF]/20 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30"
            >
              <span>
                {safePhaseTourIdx + 1 < phaseTourSteps.length
                  ? isEs
                    ? 'Siguiente'
                    : 'Next'
                  : isEs
                    ? 'Completado ✓'
                    : 'Completed ✓'}
              </span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Star Criteria (Calibrado pedagógicamente para niños y estudiantes) */}
      <div>
        <button
          type="button"
          onClick={() => setStarsOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 py-1 font-mono text-[11px] tracking-[0.14em] uppercase hover:text-white"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[#FFC15E] font-bold">
              {'★'.repeat(starInfo.stars)}{'☆'.repeat(3 - starInfo.stars)}
            </span>
            <span className="text-slate-400">
              {isEs ? 'RETO 3 ESTRELLAS' : '3-STAR CHALLENGE'}
            </span>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#5FF3FF] transition-transform duration-150 ${
              starsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {starsOpen && (
          <div className="mt-1 space-y-1 font-mono text-[10px] tracking-[0.06em] uppercase">
            <div className={`flex items-center justify-between ${starInfo.zeroConflicts ? 'text-[#5FF3FF]' : 'text-slate-400'}`}>
              <span>
                {starInfo.zeroConflicts ? '✓' : '○'} {isEs ? '★ 1: CERO CONFLICTOS & MASA GO' : '★ 1: ZERO CONFLICTS & MASS GO'}
              </span>
              <span className="text-[9px] opacity-80">
                {starInfo.zeroConflicts ? (isEs ? 'LISTO' : 'READY') : (isEs ? 'PENDIENTE' : 'PENDING')}
              </span>
            </div>
            <div className={`flex items-center justify-between ${starInfo.marginOk ? 'text-[#5FF3FF]' : 'text-slate-400'}`}>
              <span>
                {starInfo.marginOk ? '✓' : '○'} {isEs ? `★★ 2: MARGEN SEGURO >${starInfo.minMarginPercent}%` : `★★ 2: SAFETY MARGIN >${starInfo.minMarginPercent}%`}
              </span>
              <span className="text-[9px] opacity-80">
                {metrics.dryMass.marginPercent.toFixed(0)}% M / {metrics.power.marginPercent.toFixed(0)}% P
              </span>
            </div>
            <div className={`flex items-center justify-between ${starInfo.budgetOk ? 'text-[#5FF3FF]' : 'text-slate-400'}`}>
              <span>
                {starInfo.budgetOk ? '✓' : '○'} {isEs ? '★★★ 3: BAJO PRESUPUESTO NASA' : '★★★ 3: UNDER NASA BUDGET'}
              </span>
              <span className="text-[9px] opacity-80">
                ${metrics.cost.totalMillionsUSD.toFixed(1)}M / ${metrics.cost.budgetCapMillionsUSD.toFixed(1)}M
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
