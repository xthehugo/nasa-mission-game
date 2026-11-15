import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Volume2, X } from 'lucide-react';
import { useMissionStore, type RobotSpotlightZone } from '../store';
import { playHoloTone, speakCharacterLine, stopCharacterVoice } from './holoAudio';
import { getPhaseInteractiveTour } from './narrativeConfig';

/**
 * Glowing Cyan Neon Robot Icon matching the ASTRA reference artwork
 */
export function RobotSvgIcon({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={{
        filter:
          'drop-shadow(0 0 10px rgba(95, 243, 255, 0.85)) drop-shadow(0 0 22px rgba(95, 243, 255, 0.35))',
      }}
      aria-hidden="true"
    >
      {/* Antenna stem & glowing tip */}
      <line
        x1="32"
        y1="8"
        x2="32"
        y2="16"
        stroke="#5FF3FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="6.5" r="3" fill="#040B14" stroke="#5FF3FF" strokeWidth="2.6" />

      {/* Left & Right Ear Pads */}
      <rect
        x="6"
        y="24"
        width="6"
        height="13"
        rx="2.5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3"
      />
      <rect
        x="52"
        y="24"
        width="6"
        height="13"
        rx="2.5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3"
      />

      {/* Rounded Robot Head */}
      <rect
        x="13"
        y="16"
        width="38"
        height="28"
        rx="9"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3.2"
      />

      {/* Glowing Solid Cyan Eyes */}
      <circle cx="24.5" cy="28.5" r="4.5" fill="#5FF3FF" />
      <circle cx="39.5" cy="28.5" r="4.5" fill="#5FF3FF" />

      {/* Friendly Curved Smile */}
      <path
        d="M25.5 36.5 Q32 41.5 38.5 36.5"
        stroke="#5FF3FF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Neck & Collar Base */}
      <rect
        x="26"
        y="44"
        width="12"
        height="5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="2.8"
      />
      <rect
        x="19"
        y="49"
        width="26"
        height="7"
        rx="1.5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3"
      />
    </svg>
  );
}

const DIRECT_ZONE_EXPLANATIONS: Record<
  RobotSpotlightZone,
  { title: { en: string; es: string }; body: { en: string; es: string } }
> = {
  RESOURCES: {
    title: { en: 'Vital Resource Bars', es: 'Barras de Recursos Vitales' },
    body: {
      en: 'Your spacecraft’s 5 life bars: Wet Mass (KG), Power (W), Cost ($M), Volume (U), and RF Signal (dB). Keep them in Cyan; if one turns Red, adjust your parts!',
      es: 'Son los 5 signos vitales de tu nave: Masa (KG), Energía (W), Presupuesto ($M), Espacio (U) y Señal de Radio (dB). Si alguna se pone roja, aligera peso o suma energía.',
    },
  },
  CHASSIS: {
    title: { en: 'Step 1 · CubeSat Chassis', es: 'Paso 1 · Chasis CubeSat' },
    body: {
      en: 'The metal skeleton of your ship. 1U = a 10×10 cm cube. Choosing 3U or CUSTOM gives you more room (U) to mount cameras and batteries.',
      es: 'El cuerpo metálico donde van las piezas. 1U es un cubo de 10×10 cm. Elegir 3U o CUSTOM te da más espacio interno para equipar cámaras y baterías.',
    },
  },
  EPS: {
    title: { en: 'Solar Arrays & Power (EPS)', es: 'Paneles Solares y Energía (EPS)' },
    body: {
      en: 'Produces the Watts (+W) that keep your instruments and heaters alive during orbital eclipse shadows.',
      es: 'Produce los vatios (+W) de electricidad que mantienen vivos tus instrumentos y calentadores cuando la nave entra en la sombra del eclipse.',
    },
  },
  MISSION: {
    title: { en: 'Step 2 · Science Mission', es: 'Paso 2 · Misión Científica' },
    body: {
      en: 'Defines your scientific objective, NASA budget ($M), and which payload instrument you need to equip in Level 03.',
      es: 'Define tu objetivo científico, el presupuesto ($M) que te asigna la NASA y qué instrumento ("INSTRUMENTO:") debes equipar en el Nivel 03.',
    },
  },
  HOLOGRAM: {
    title: { en: 'Interactive Center Hologram', es: 'Holograma Central Interactivo' },
    body: {
      en: 'Visualizes your spacecraft, orbit, or propellant tanks in real time. Below it is the button to advance to the next level.',
      es: 'Muestra tu satélite, órbita o tanques en tiempo real según lo que elijas. Debajo tienes el botón para avanzar al siguiente nivel.',
    },
  },
  COMMANDER_HUD: {
    title: { en: 'Mission Control Transmission', es: 'Transmisión del Comandante' },
    body: {
      en: 'Live radio channel from Commander Vega and Director Rostova. Use [VOICE] to hear the audio again or [CUTSCENE] to replay the animation.',
      es: 'Canal de radio en vivo del Comandante Vega y la Directora Rostova. Puedes pulsar [VOZ] para volver a escuchar el audio o [CINEMÁTICA] para ver la escena.',
    },
  },
  LEFT_PANEL: {
    title: { en: 'Left Engineering Controls', es: 'Controles de Ingeniería (Izquierda)' },
    body: {
      en: 'Primary sliders, subsystem tabs (01–07), tank levels, and V&V environmental tests for the current level.',
      es: 'Aquí controlas los ajustes físicos del nivel actual: altitud orbital, pestañas de los 7 subsistemas, llenado de tanques o pruebas ambientales V&V.',
    },
  },
  RIGHT_PANEL: {
    title: { en: 'Right Mission & Hardware Decisions', es: 'Decisiones de Misión y Piezas (Derecha)' },
    body: {
      en: 'Select your target orbit, ground station antennas, hardware cards, database synchronization, or in-flight crisis responses here.',
      es: 'Aquí seleccionas tu destino orbital, antenas en la Tierra, tarjetas de piezas de la NASA, sincronización de base de datos o respuestas a crisis.',
    },
  },
  TOP_BAR: {
    title: { en: 'Top Command & Mode Bar', es: 'Barra Superior de Mando' },
    body: {
      en: 'Shows your Stars (★), Story Act selector (Act I Cadet, Act II JPL, Free Sandbox), NASA presets, SWaP-C charts, and language toggle (ES/EN).',
      es: 'Muestra tus Estrellas (★), el selector de Acto (Acto I Cadete, Acto II JPL, Modo Libre), Presets de la NASA, gráficas SWaP-C e idioma (ES/EN).',
    },
  },
  FOOTER_LEVELS: {
    title: { en: '6-Level Mission Progression', es: 'Barra de los 6 Niveles de Misión' },
    body: {
      en: 'Navigate across the 6 NASA engineering phases: 01 Napkin → 02 Orbit → 03 Trade Space → 04 Point Design → 05 V&V MCR → 06 Launch.',
      es: 'Te permite moverte por las 6 fases reales de la NASA: 01 Servilleta → 02 Órbita → 03 Trade Space → 04 Punto → 05 V&V MCR → 06 Lanzamiento.',
    },
  },
};

function computeCoordsForZone(zone: RobotSpotlightZone | null): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 24, y: 520 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardWidth = Math.min(460, vw - 24);
  const cardHeight = 220;

  if (!zone) {
    return {
      x: Math.max(16, Math.round(vw * 0.5 - cardWidth * 0.5)),
      y: Math.max(80, Math.round(vh - cardHeight - 36)),
    };
  }

  const el = document.querySelector(`[data-astra-zone="${zone}"]`);
  if (!el) {
    return {
      x: Math.max(16, Math.round(vw * 0.5 - cardWidth * 0.5)),
      y: Math.max(80, Math.round(vh - cardHeight - 36)),
    };
  }

  const rect = el.getBoundingClientRect();
  let targetX = rect.right + 16;
  let targetY = rect.top + 8;

  // If element is on the right half or center, place ASTRA to its left or below it
  if (targetX + cardWidth > vw - 16) {
    if (rect.left - cardWidth - 16 > 16) {
      targetX = rect.left - cardWidth - 16;
    } else {
      targetX = Math.max(16, Math.min(vw - cardWidth - 16, rect.left + 12));
      targetY = rect.bottom + 12;
    }
  }

  if (targetY + cardHeight > vh - 16) {
    targetY = Math.max(16, vh - cardHeight - 20);
  }
  if (targetY < 16) {
    targetY = 16;
  }

  return { x: Math.round(targetX), y: Math.round(targetY) };
}

export function AstraFloatingCompanion() {
  const {
    language,
    phase,
    cadetName,
    engineerName,
    missionCustomName,
    experienceMode,
    activeCinematicId,
    soundEnabled,
    phaseTutorialStep,
    nextPhaseTutorialStep,
    prevPhaseTutorialStep,
    setPhaseTutorialStep,
    setRobotHoverZone,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const activeCallsign = isCadet ? cadetName : engineerName;

  // Primary unified interactive tour across all modules
  const tourSteps = getPhaseInteractiveTour(phase);
  const safeTourIdx = Math.min(phaseTutorialStep, tourSteps.length - 1);
  const activeTourStep = tourSteps[safeTourIdx];

  const [isOpen, setIsOpen] = useState(true);
  const [customZoneOverride, setCustomZoneOverride] = useState<RobotSpotlightZone | null>(null);
  const [viewportTick, setViewportTick] = useState(0);
  const [speakingCharacter, setSpeakingCharacter] = useState<'NONE' | 'ASTRA' | 'VEGA'>('NONE');

  const effectiveZone = customZoneOverride ?? activeTourStep?.targetZone ?? null;
  const coords = viewportTick >= 0 ? computeCoordsForZone(effectiveZone) : { x: 24, y: 24 };

  useEffect(() => {
    if (activeCinematicId) return;
    setRobotHoverZone(isOpen ? effectiveZone : null);
  }, [activeCinematicId, effectiveZone, isOpen, setRobotHoverZone]);

  // Listen for Right-Click (Anticlick) anywhere on the screen to summon ASTRA to that panel
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (activeCinematicId) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const zoneEl = target.closest('[data-astra-zone]') as HTMLElement | null;
      if (!zoneEl) return;

      const zoneAttr = zoneEl.getAttribute('data-astra-zone') as RobotSpotlightZone | null;
      if (!zoneAttr || !DIRECT_ZONE_EXPLANATIONS[zoneAttr]) return;

      e.preventDefault();
      setIsOpen(true);

      // Check if this zone is part of the current phase's tour steps
      const matchingIdx = tourSteps.findIndex((s) => s.targetZone === zoneAttr);
      if (matchingIdx >= 0) {
        setCustomZoneOverride(null);
        setPhaseTutorialStep(matchingIdx);
      } else {
        setCustomZoneOverride(zoneAttr);
      }
      setRobotHoverZone(zoneAttr);
      setViewportTick((t) => t + 1);
    };

    const handleResize = () => {
      if (isOpen) {
        setViewportTick((t) => t + 1);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeCinematicId, isOpen, setPhaseTutorialStep, setRobotHoverZone, tourSteps]);

  if (activeCinematicId) return null;

  const displayBadge = customZoneOverride
    ? isEs
      ? 'ASTRA · INSPECCIÓN ANTICLIC'
      : 'ASTRA · RIGHT-CLICK INSPECTION'
    : activeTourStep?.badge[language] ?? `ASTRA · ${safeTourIdx + 1}/${tourSteps.length}`;

  const displayTitle = customZoneOverride
    ? DIRECT_ZONE_EXPLANATIONS[customZoneOverride].title[language]
    : activeTourStep?.title[language] ?? '';

  const rawBody = customZoneOverride
    ? DIRECT_ZONE_EXPLANATIONS[customZoneOverride].body[language]
    : activeTourStep?.instruction[language] ?? '';

  const displayBody = rawBody
    .replace(/{cadet}/g, cadetName)
    .replace(/{engineer}/g, engineerName)
    .replace(/{callsign}/g, activeCallsign)
    .replace(/{mission}/g, missionCustomName);

  // When resting quietly in the bottom-left corner
  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => {
            playHoloTone('STEP', soundEnabled);
            setIsOpen(true);
            setRobotHoverZone(effectiveZone);
            setViewportTick((t) => t + 1);
          }}
          title={
            isEs
              ? 'Haz clic para abrir a ASTRA (o haz clic derecho en cualquier panel)'
              : 'Click to open ASTRA (or right-click any panel)'
          }
          className="group flex items-center gap-2.5 rounded-sm border border-[#5FF3FF]/70 bg-[#040B14]/95 px-3 py-2 shadow-[0_0_24px_rgba(95,243,255,0.28)] transition hover:border-[#5FF3FF] hover:bg-[#071628]"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            <RobotSvgIcon className="h-11 w-11" />
          </motion.div>
          <div className="text-left">
            <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase">
              ASTRA · {isEs ? 'GUÍA VINCULADA' : 'LINKED GUIDE'}
            </div>
            <div className="text-[10px] text-slate-300">
              {isEs
                ? `Paso ${safeTourIdx + 1}/${tourSteps.length} · Clic para abrir`
                : `Step ${safeTourIdx + 1}/${tourSteps.length} · Click to open`}
            </div>
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        left: coords.x,
        top: coords.y,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      style={{ position: 'fixed' }}
      className="z-40 flex max-w-[calc(100vw-24px)] items-start gap-3 sm:gap-4 pointer-events-none"
    >
      {/* Glowing Neon Robot Mascot ASTRA */}
      <motion.button
        type="button"
        onClick={() => {
          setIsOpen(false);
          setRobotHoverZone(null);
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        title={isEs ? 'Minimizar a la esquina' : 'Minimize to corner'}
        className="mt-2 shrink-0 cursor-pointer focus:outline-none pointer-events-auto"
      >
        <RobotSvgIcon className="h-16 w-16 sm:h-20 sm:w-20" />
      </motion.button>

      {/* ASTRA Cyan-Bordered Dialog Box */}
      <div className="relative w-[320px] border border-[#5FF3FF]/85 bg-[#040B14]/96 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.88),0_0_28px_rgba(95,243,255,0.22)] sm:w-[380px] sm:p-5 pointer-events-auto">
        {/* Top-right subtle close/minimize button + step indicator */}
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] tracking-[0.16em] text-[#5FF3FF] uppercase font-bold">
            {displayBadge}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#FFC15E]">
              {isEs
                ? `${safeTourIdx + 1} DE ${tourSteps.length}`
                : `${safeTourIdx + 1} OF ${tourSteps.length}`}
            </span>
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setIsOpen(false);
                setRobotHoverZone(null);
              }}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 transition hover:text-[#5FF3FF]"
              title={isEs ? 'Enviar a la esquina' : 'Minimize to corner'}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-normal tracking-tight text-white sm:text-xl">
          {displayTitle}
        </h3>

        {/* Body Text */}
        <p className="mt-2 text-xs leading-relaxed text-slate-200 sm:text-[13.5px]">
          {displayBody}
        </p>

        {/* Audio buttons row: Commander Vega (Primary voice) & Astra (The Girl) */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#5FF3FF]/20 pt-2.5">
          <div className="flex items-center gap-1.5">
            {/* Commander Vega Voice (Primary for everything) */}
            <button
              type="button"
              onClick={() => {
                if (speakingCharacter === 'VEGA') {
                  stopCharacterVoice();
                  setSpeakingCharacter('NONE');
                  return;
                }
                setSpeakingCharacter('VEGA');
                speakCharacterLine(displayBody, language, 'VEGA', true, () => {
                  setSpeakingCharacter('NONE');
                });
              }}
              className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[9px] uppercase transition ${
                speakingCharacter === 'VEGA'
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/25 text-white'
                  : 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-[#5FF3FF] hover:bg-[#5FF3FF]/20'
              }`}
              title={isEs ? 'Escuchar voz del Comandante Vega' : 'Listen to Commander Vega'}
            >
              <Volume2 className="h-3 w-3" />
              <span>{isEs ? 'COMANDANTE' : 'COMMANDER'}</span>
            </button>

            {/* ASTRA Voice ("la chica" -> Rostova) */}
            <button
              type="button"
              onClick={() => {
                if (speakingCharacter === 'ASTRA') {
                  stopCharacterVoice();
                  setSpeakingCharacter('NONE');
                  return;
                }
                setSpeakingCharacter('ASTRA');
                speakCharacterLine(displayBody, language, 'ROSTOVA', true, () => {
                  setSpeakingCharacter('NONE');
                });
              }}
              className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[9px] uppercase transition ${
                speakingCharacter === 'ASTRA'
                  ? 'border-[#FFC15E] bg-[#FFC15E]/25 text-white'
                  : 'border-[#FFC15E]/50 bg-[#FFC15E]/10 text-[#FFC15E] hover:bg-[#FFC15E]/20'
              }`}
              title={isEs ? 'Escuchar voz de la Mascota ASTRA (la chica)' : 'Listen to ASTRA (companion girl)'}
            >
              <Volume2 className="h-3 w-3" />
              <span>ASTRA</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Buttons: Anterior / Siguiente (Linked to Store) */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={!customZoneOverride && safeTourIdx === 0}
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              if (customZoneOverride) {
                setCustomZoneOverride(null);
                return;
              }
              prevPhaseTutorialStep();
            }}
            className={`flex items-center justify-center gap-1 border py-1.5 text-center font-mono text-xs uppercase transition ${
              !customZoneOverride && safeTourIdx === 0
                ? 'cursor-not-allowed border-slate-800 bg-[#070E18]/60 text-slate-600'
                : 'border-slate-700 bg-[#08111E] text-slate-300 hover:border-[#5FF3FF]/60 hover:text-white'
            }`}
          >
            <ChevronLeft className="h-3 w-3" />
            <span>{isEs ? 'Anterior' : 'Previous'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const isLast = !customZoneOverride && safeTourIdx === tourSteps.length - 1;
              playHoloTone(isLast ? 'STAR' : 'STEP', soundEnabled);
              if (customZoneOverride) {
                setCustomZoneOverride(null);
                nextPhaseTutorialStep(tourSteps.length);
                return;
              }
              if (!isLast) {
                nextPhaseTutorialStep(tourSteps.length);
              } else {
                setIsOpen(false);
                setRobotHoverZone(null);
              }
            }}
            className="flex items-center justify-center gap-1 border border-[#5FF3FF] bg-[#061826] py-1.5 text-center font-mono text-xs font-bold text-[#5FF3FF] uppercase shadow-[0_0_16px_rgba(95,243,255,0.2)] transition hover:bg-[#5FF3FF]/20"
          >
            {!customZoneOverride && safeTourIdx === tourSteps.length - 1 ? (
              <span className="inline-flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>{isEs ? 'Listo' : 'Done'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1">
                <span>{isEs ? 'Siguiente' : 'Next'}</span>
                <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
