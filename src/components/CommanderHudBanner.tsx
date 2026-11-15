import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, Film, Volume2, Zap } from 'lucide-react';
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
  formatCommanderBeat,
  formatStoryText,
  LEVEL1_INTERACTIVE_TOUR,
} from './narrativeConfig';

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
    level1TutorialStep,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
    soundEnabled,
    openCinematic,
    setLevel1TutorialStep,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const activeCallsign = isCadet ? cadetName : engineerName;
  const beat = COMMANDER_PHASE_BEATS[phase];

  const isLevel1GuidedTour = phase === 'CML_1' && level1TutorialStep < 5;
  const activeTourStep = isLevel1GuidedTour
    ? LEVEL1_INTERACTIVE_TOUR[level1TutorialStep]
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
    vegaText = formatStoryText(
      activeTourStep.instruction[language],
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
    vegaText = isCadet
      ? isEs
        ? `Cadete ${cadetName}: como en el Ícaro-1, la energía cae en el eclipse. Despliega alas solares mayores o usa RTG.`
        : `Cadet ${cadetName}: like Icarus-1, power drops in eclipse. Deploy larger solar wings or RTG.`
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

  const flightAlert = overMass
    ? 'OVERMASS'
    : powerDeficit
      ? 'POWER'
      : rfRed
        ? 'RF'
        : activeRandomEvent !== 'NONE'
          ? activeRandomEvent
          : 'NORMAL';

  const currentSpeechKey = `${phase}|${level1TutorialStep}|${flightAlert}|${language}|${isCadet ? 'CADET' : 'JPL'}`;

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
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-slate-400 uppercase">
            {chapterBadge} · {activeCallsign}
          </div>
          <p className="mt-1 text-[12.5px] leading-snug text-slate-200 line-clamp-3 hover:line-clamp-none">
            {vegaText}
          </p>
        </div>
      </div>

      {/* Level 01 Interactive Guided Tour (Compact + Inactivity Hint) */}
      {activeTourStep && (
        <div className="border-l-2 border-[#FFC15E] bg-[#FFC15E]/8 px-3 py-2">
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase">
            <span>{activeTourStep.badge[language]}</span>
            <button
              type="button"
              onClick={() => setLevel1TutorialStep(5)}
              className="text-[10px] text-slate-400 underline hover:text-white"
            >
              {isEs ? 'Saltar tour' : 'Skip tour'}
            </button>
          </div>
          <p className="mt-0.5 text-[13px] font-medium leading-snug text-white">
            {activeTourStep.title[language]}
          </p>
          {idleHint && (
            <p className="mt-1 font-mono text-[11px] text-[#FFC15E]">
              {isEs
                ? 'Pista: haz clic en una opción iluminada para ver cómo cambia la nave.'
                : 'Hint: click any highlighted option to see the spacecraft update.'}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            {level1TutorialStep === 0 ? (
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setLevel1TutorialStep(1);
                }}
                className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30"
              >
                {isEs
                  ? 'ENTENDIDO · CONTINUAR AL CHASIS →'
                  : 'GOT IT · CONTINUE TO CHASSIS →'}
              </button>
            ) : level1TutorialStep < 4 ? (
              <>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] text-[#5FF3FF] uppercase">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-[#FFC15E]" />
                  <span>
                    {isEs ? 'SENSOR ACTIVO' : 'SENSOR ACTIVE'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setLevel1TutorialStep((level1TutorialStep + 1) as 2 | 3 | 4)}
                  className="shrink-0 border border-[#5FF3FF]/40 px-2.5 py-0.5 font-mono text-[10px] text-slate-200 hover:text-white"
                >
                  {isEs ? 'Siguiente →' : 'Next →'}
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.1em] text-[#5FF3FF] uppercase">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#5FF3FF]" />
                <span>
                  {isEs
                    ? '¡LISTO! PULSA SIGUIENTE NIVEL 02 EN EL CENTRO'
                    : 'DONE! CLICK NEXT LEVEL 02 IN THE CENTER'}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Star Criteria (Clean mockup list) */}
      <div>
        <button
          type="button"
          onClick={() => setStarsOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 py-1 font-mono text-[11px] tracking-[0.14em] uppercase hover:text-white"
        >
          <span className="text-slate-400">
            {isEs ? 'PARA GANAR ESTRELLAS' : 'STAR CRITERIA'}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#5FF3FF] transition-transform duration-150 ${
              starsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {starsOpen && (
          <div className="mt-1 space-y-1 font-mono text-[12px] tracking-[0.1em] uppercase">
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
        )}
      </div>
    </div>
  );
}
