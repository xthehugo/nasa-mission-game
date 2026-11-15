import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useMissionStore } from '../store';
import {
  playHoloTone,
  speakCharacterLine,
  stopCharacterVoice,
} from './holoAudio';
import {
  formatStoryText,
  STORY_CINEMATICS,
  type CinematicScenePose,
} from './narrativeConfig';

function AnimatedCharacterBust({
  speaker,
  pose,
}: {
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
  pose: CinematicScenePose;
}) {
  const isRostova = speaker === 'ROSTOVA';
  const stroke = isRostova ? '#FF4D6D' : speaker === 'VEGA' ? '#5FF3FF' : '#FFC15E';
  const isTurnedAway = pose === 'VEGA_WINDOW_COIN';

  return (
    <motion.g
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      stroke={stroke}
      fill="none"
      strokeWidth="1.3"
    >
      {/* Holographic Pedestal */}
      <ellipse cx="135" cy="242" rx="58" ry="11" strokeOpacity="0.45" strokeDasharray="4 3" />
      {/* Shoulders & Flight Suit Collar */}
      <path
        d="M 78,240 L 92,186 L 116,174 L 154,174 L 178,186 L 192,240"
        fill="#061224"
        fillOpacity="0.75"
      />
      <polyline points="112,176 135,208 158,176" stroke="#FFC15E" strokeOpacity="0.8" />
      {/* NASA / JPL Patch on Chest */}
      <circle cx="162" cy="206" r="8" stroke="#FFC15E" strokeWidth="1" />
      {/* Helmet / Head Silhouette */}
      <polygon
        points="135,96 164,112 162,152 135,168 108,152 106,112"
        fill="#04080F"
      />
      {isTurnedAway ? (
        /* Looking out window toward launch pad */
        <g>
          <line x1="118" y1="126" x2="156" y2="124" strokeOpacity="0.45" />
          {/* Hand holding glowing mission coin */}
          <motion.circle
            cx="206"
            cy="188"
            r="11"
            stroke="#FFC15E"
            strokeWidth="1.5"
            animate={{ rotateY: [0, 180, 360], scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.6 }}
          />
          <line x1="178" y1="196" x2="195" y2="190" stroke="#5FF3FF" />
        </g>
      ) : (
        /* Facing player directly with animated eyes & voice waveform */
        <g>
          <polygon
            points="114,122 156,122 152,140 118,140"
            fill={stroke}
            fillOpacity="0.12"
          />
          {/* Eyes looking at player */}
          <motion.circle
            cx="125"
            cy="131"
            r="2.2"
            fill={stroke}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 3.2 }}
          />
          <motion.circle
            cx="145"
            cy="131"
            r="2.2"
            fill={stroke}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 3.2 }}
          />
          {/* Animated Mouth / Voice Modulator */}
          {[126, 131, 135, 139, 144].map((x, i) => (
            <motion.line
              key={x}
              x1={x}
              x2={x}
              y1="149"
              y2="155"
              stroke="#FFC15E"
              strokeWidth="1.4"
              animate={{ y1: [151, 146 - (i % 2) * 3, 151], y2: [153, 158 + (i % 2) * 3, 153] }}
              transition={{ repeat: Infinity, duration: 0.45 + i * 0.07 }}
            />
          ))}
        </g>
      )}

      {/* Hand igniting holographic console in cyan */}
      {pose === 'VEGA_IGNITE_CONSOLE' && (
        <g>
          <motion.line
            x1="178"
            y1="194"
            x2="265"
            y2="215"
            stroke="#5FF3FF"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.circle
            cx="265"
            cy="215"
            r="14"
            stroke="#5FF3FF"
            animate={{ r: [8, 36, 8], opacity: [0.9, 0.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        </g>
      )}
    </motion.g>
  );
}

function FullScreenAnimatedCinema({
  pose,
  speaker,
}: {
  pose: CinematicScenePose;
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
}) {
  const isEmergency =
    pose === 'OMEGA_SIREN_EUROPA' ||
    pose === 'ROSTOVA_TRANSFER_CREDENTIAL' ||
    pose === 'MCR_GLASS_GALLERY' ||
    pose === 'JUPITER_RADIATION_BELT';

  return (
    <svg
      viewBox="0 0 800 300"
      className="h-full max-h-[46vh] w-full border border-[#5FF3FF]/25 bg-[#030710]"
    >
      <defs>
        <filter id="cinemaGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Perspective Floor Grid */}
      <line x1="0" y1="252" x2="800" y2="252" stroke="#5FF3FF" strokeOpacity="0.28" />
      <line x1="80" y1="252" x2="20" y2="300" stroke="#5FF3FF" strokeOpacity="0.18" />
      <line x1="260" y1="252" x2="210" y2="300" stroke="#5FF3FF" strokeOpacity="0.18" />
      <line x1="540" y1="252" x2="590" y2="300" stroke="#5FF3FF" strokeOpacity="0.18" />
      <line x1="720" y1="252" x2="780" y2="300" stroke="#5FF3FF" strokeOpacity="0.18" />

      {/* Emergency Siren Pulses */}
      {isEmergency && (
        <motion.rect
          x="0"
          y="0"
          width="800"
          height="300"
          fill="#FF4D6D"
          animate={{ fillOpacity: [0.02, 0.12, 0.02] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
        />
      )}

      {/* Animated Character Bust on Left */}
      <AnimatedCharacterBust speaker={speaker} pose={pose} />

      {/* Scene-Specific Animated Right Stage */}
      {(pose === 'HANGAR_PHOTO' || pose === 'VEGA_WINDOW_COIN' || pose === 'VEGA_IGNITE_CONSOLE') && (
        <g filter="url(#cinemaGlow)">
          {/* Hangar Window Looking Out at Cape Canaveral Pad */}
          <rect x="255" y="28" width="235" height="145" fill="#051020" stroke="#5FF3FF" strokeOpacity="0.45" />
          {/* Launch Tower in Distance */}
          <line x1="335" y1="173" x2="335" y2="58" stroke="#5FF3FF" strokeOpacity="0.65" strokeWidth="1.5" />
          <line x1="335" y1="74" x2="365" y2="74" stroke="#5FF3FF" strokeOpacity="0.65" />
          <line x1="335" y1="102" x2="365" y2="102" stroke="#5FF3FF" strokeOpacity="0.65" />
          {/* Animated Florida Wind / Rain Lines */}
          {[280, 320, 390, 440].map((x, i) => (
            <motion.line
              key={x}
              x1={x}
              y1="40"
              x2={x - 18}
              y2="75"
              stroke="#5FF3FF"
              strokeOpacity="0.3"
              animate={{ y1: [35, 130], y2: [55, 150], opacity: [0, 0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 + i * 0.3 }}
            />
          ))}

          {/* Framed Dusty Photo of 4 Smiling Icarus-1 Astronauts on Hangar Wall */}
          <g transform="translate(530, 34)">
            <rect x="0" y="0" width="215" height="115" fill="#070e1c" stroke="#FFC15E" strokeWidth="1.4" />
            {[35, 82, 130, 178].map((cx) => (
              <g key={cx} stroke="#FFC15E" fill="none">
                <circle cx={cx} cy="42" r="13" />
                <path d={`M ${cx - 5},44 Q ${cx},50 ${cx + 5},44`} />
                <path d={`M ${cx - 16},92 Q ${cx},64 ${cx + 16},92`} />
              </g>
            ))}
            <text x="107" y="108" textAnchor="middle" className="font-mono text-[9px]" fill="#FFC15E">
              ICARUS-1 CREW · JUPITER MISSION
            </text>
          </g>

          {/* Holographic Table Igniting in Cyan */}
          <ellipse
            cx="470"
            cy="228"
            rx="165"
            ry="22"
            fill="none"
            stroke="#5FF3FF"
            strokeOpacity={pose === 'VEGA_IGNITE_CONSOLE' ? 0.95 : 0.35}
            strokeWidth="1.4"
          />
          {pose === 'VEGA_IGNITE_CONSOLE' && (
            <motion.g
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              stroke="#5FF3FF"
              fill="none"
            >
              <polygon points="470,138 518,162 470,186 422,162" fill="#5FF3FF15" />
              <polygon points="422,162 470,186 470,228 422,204" fill="#5FF3FF10" />
              <polygon points="518,162 470,186 470,228 518,204" fill="#5FF3FF10" />
            </motion.g>
          )}
        </g>
      )}

      {(pose === 'CUBESAT_ORBIT_DANCE' || pose === 'ECLIPSE_SHADOW_FREEZE' || pose === 'JUPITER_GRAVITY_WELL' || pose === 'RTG_PALE_SUN') && (
        <g filter="url(#cinemaGlow)" fill="none">
          {/* Dark Umbra Eclipse Cone */}
          {(pose === 'ECLIPSE_SHADOW_FREEZE' || pose === 'RTG_PALE_SUN') && (
            <polygon
              points="460,82 770,28 770,228 460,174"
              fill="#020409"
              stroke="#FFC15E"
              strokeDasharray="4 4"
              strokeOpacity="0.45"
            />
          )}
          {/* Planet (Earth or Jupiter) */}
          <circle
            cx="460"
            cy="128"
            r="52"
            stroke={pose === 'JUPITER_GRAVITY_WELL' ? '#FFC15E' : '#5FF3FF'}
            strokeWidth="1.5"
          />
          <ellipse cx="460" cy="128" rx="52" ry="18" stroke="#5FF3FF" strokeOpacity="0.4" />
          {/* Orbit Path */}
          <ellipse
            cx="460"
            cy="128"
            rx="185"
            ry="58"
            stroke={pose === 'ECLIPSE_SHADOW_FREEZE' ? '#FFC15E' : '#5FF3FF'}
            strokeWidth="1.4"
            strokeDasharray="6 4"
          />
          {/* Animated Orbiting Spacecraft */}
          <motion.g
            animate={{
              x: [645, 460, 275, 460, 645],
              y: [128, 186, 128, 70, 128],
            }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'linear' }}
          >
            <rect x="-10" y="-10" width="20" height="20" stroke="#FFC15E" fill="#04080F" />
            <line x1="-28" y1="0" x2="-10" y2="0" stroke="#5FF3FF" strokeWidth="2" />
            <line x1="10" y1="0" x2="28" y2="0" stroke="#5FF3FF" strokeWidth="2" />
          </motion.g>
        </g>
      )}

      {(pose === 'TANKS_RUNNER_HEART' || pose === 'COPV_CLEANROOM_LOCK') && (
        <g filter="url(#cinemaGlow)" fill="none">
          {/* Falcon 9 Rocket Silhouette + 4 Animated Propellant Tanks */}
          <path d="M 300,45 Q 320,15 340,45 L 340,220 L 300,220 Z" stroke="#5FF3FF" strokeWidth="1.4" />
          {[410, 485, 560, 635].map((x, i) => (
            <g key={x}>
              <rect x={x} y="55" width="52" height="150" rx="8" stroke="#5FF3FF" strokeWidth="1.3" />
              <motion.rect
                x={x + 4}
                width="44"
                rx="4"
                fill={i < 2 ? '#FFC15E' : '#5FF3FF'}
                fillOpacity="0.32"
                animate={{ y: [130, 82, 105], height: [70, 118, 95] }}
                transition={{ repeat: Infinity, duration: 2.4 + i * 0.3 }}
              />
            </g>
          ))}
        </g>
      )}

      {(pose === 'MCR_GLASS_GALLERY' || pose === 'NASA_BOARD_DEFENSE') && (
        <g filter="url(#cinemaGlow)" fill="none">
          {/* Upper Glass Gallery with Mission Inspectors */}
          <rect x="280" y="22" width="440" height="58" stroke="#FF4D6D" strokeOpacity="0.65" />
          {[340, 420, 500, 580, 650].map((x) => (
            <g key={x} stroke="#FFC15E" strokeOpacity="0.8">
              <circle cx={x} cy="42" r="8" />
              <path d={`M ${x - 14},76 Q ${x},55 ${x + 14},76`} />
            </g>
          ))}
          {/* Spacecraft Under Vertical Laser Verification Scan */}
          <polygon points="500,115 548,140 500,165 452,140" stroke="#5FF3FF" strokeWidth="1.5" />
          <polygon points="452,140 500,165 500,222 452,197" stroke="#5FF3FF" strokeWidth="1.5" />
          <polygon points="548,140 500,165 500,222 548,197" stroke="#5FF3FF" strokeWidth="1.5" />
          <motion.line
            x1="360"
            x2="640"
            stroke="#5FF3FF"
            strokeWidth="2.5"
            animate={{ y1: [105, 230, 105], y2: [105, 230, 105] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
          />
        </g>
      )}

      {pose === 'PAD39A_ENGINES_STEAM' && (
        <g filter="url(#cinemaGlow)" fill="none">
          {/* Launch Pad 39A Tower + Rocket with Steaming Engines */}
          <line x1="420" y1="240" x2="420" y2="35" stroke="#5FF3FF" strokeWidth="2" />
          <line x1="420" y1="65" x2="475" y2="65" stroke="#5FF3FF" strokeWidth="1.5" />
          <path d="M 480,55 Q 500,22 520,55 L 520,215 L 480,215 Z" stroke="#FFFFFF" strokeWidth="1.8" />
          {/* Animated Steam & Ignition Plume */}
          {[460, 485, 505, 525, 545].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy="228"
              r="16"
              stroke="#5FF3FF"
              fill="#5FF3FF"
              fillOpacity="0.18"
              animate={{ cy: [222, 248], r: [10, 28], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.1 + i * 0.18 }}
            />
          ))}
        </g>
      )}

      {(pose === 'OMEGA_SIREN_EUROPA' ||
        pose === 'ROSTOVA_TRANSFER_CREDENTIAL' ||
        pose === 'JPL_PASADENA_CONTROL' ||
        pose === 'VEGA_TRENCH_COMMS' ||
        pose === 'JUPITER_RADIATION_BELT' ||
        pose === 'ICARUS_BEACON_RESPONSE' ||
        pose === 'VEGA_TEARS_VICTORY' ||
        pose === 'ROSTOVA_STANDING_OVATION' ||
        pose === 'SANDBOX_INFINITE_FORGE') && (
        <g filter="url(#cinemaGlow)" fill="none">
          {/* DSN Goldstone 70m Parabolic Antenna */}
          <path d="M 275,215 Q 320,145 365,215" stroke="#5FF3FF" strokeWidth="1.6" />
          <line x1="320" y1="180" x2="348" y2="132" stroke="#5FF3FF" strokeWidth="1.4" />
          {/* Animated Deep-Space Signal Waveform */}
          <motion.polyline
            points="355,130 415,130 432,82 448,176 465,94 482,162 498,130 575,130"
            stroke={pose === 'OMEGA_SIREN_EUROPA' ? '#FF4D6D' : '#FFC15E'}
            strokeWidth="2"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          {/* Jupiter & Europa with Pulsing Icarus-1 Beacon */}
          <circle cx="655" cy="128" r="46" stroke="#FFC15E" strokeWidth="1.5" />
          <ellipse cx="655" cy="128" rx="78" ry="22" stroke="#5FF3FF" strokeDasharray="4 3" />
          <motion.circle
            cx="733"
            cy="128"
            r="6"
            fill="#FF4D6D"
            stroke="#FFC15E"
            animate={{ r: [4, 14, 4], opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
        </g>
      )}
    </svg>
  );
}

export function StoryCinematicModal() {
  const {
    language,
    cadetName,
    engineerName,
    missionCustomName,
    activeCinematicId,
    soundEnabled,
    setLanguage,
    toggleSound,
    closeCinematic,
    advanceToAct2Jpl,
    completeStoryAndUnlockSandbox,
    loadPreset,
  } = useMissionStore();

  const [slideIdx, setSlideIdx] = useState(0);
  const [prevCinematicId, setPrevCinematicId] = useState(activeCinematicId);
  const [typedChars, setTypedChars] = useState(0);

  if (activeCinematicId !== prevCinematicId) {
    setPrevCinematicId(activeCinematicId);
    setSlideIdx(0);
    setTypedChars(0);
  }

  const scene = activeCinematicId ? STORY_CINEMATICS[activeCinematicId] : null;
  const slides = scene ? scene.slides : [];
  const safeIdx = Math.min(slideIdx, Math.max(0, slides.length - 1));
  const currentSlide = slides[safeIdx];

  const fullDialogue = currentSlide
    ? formatStoryText(
        currentSlide.dialogue[language],
        cadetName,
        engineerName,
        missionCustomName,
      )
    : '';

  // Typewriter animation
  useEffect(() => {
    if (!activeCinematicId || !fullDialogue) return;
    const interval = window.setInterval(() => {
      setTypedChars((c) => {
        if (c >= fullDialogue.length) {
          window.clearInterval(interval);
          return fullDialogue.length;
        }
        return c + 3;
      });
    }, 24);
    return () => window.clearInterval(interval);
  }, [activeCinematicId, safeIdx, fullDialogue]);

  // Speak character line in ES or EN automatically when slide changes
  useEffect(() => {
    if (!activeCinematicId || !currentSlide || !fullDialogue) return;
    const timer = window.setTimeout(() => {
      speakCharacterLine(
        fullDialogue,
        language,
        currentSlide.speaker,
        soundEnabled,
      );
    }, 120);
    return () => {
      window.clearTimeout(timer);
      stopCharacterVoice();
    };
  }, [activeCinematicId, safeIdx, language, soundEnabled, currentSlide, fullDialogue]);

  if (!activeCinematicId || !scene || !currentSlide) return null;

  const isEs = language === 'es';
  const isLastSlide = safeIdx >= slides.length - 1;
  const shownText = fullDialogue.slice(0, typedChars);

  const speakerBadgeColor =
    currentSlide.speaker === 'ROSTOVA'
      ? 'border-[#FF4D6D] text-[#FF4D6D] bg-[#FF4D6D]/15'
      : currentSlide.speaker === 'VEGA'
        ? 'border-[#5FF3FF] text-[#5FF3FF] bg-[#5FF3FF]/15'
        : 'border-[#FFC15E] text-[#FFC15E] bg-[#FFC15E]/15';

  const handleNext = () => {
    if (typedChars < fullDialogue.length) {
      setTypedChars(fullDialogue.length);
      return;
    }

    if (!isLastSlide) {
      playHoloTone('STEP', soundEnabled);
      setTypedChars(0);
      setSlideIdx((i) => i + 1);
      return;
    }

    stopCharacterVoice();

    if (scene.requiresCadetNameInput) {
      playHoloTone('STAR', soundEnabled);
      closeCinematic();
      return;
    }

    if (scene.requiresEngineerNameInput) {
      playHoloTone('ALARM', soundEnabled);
      loadPreset('obj-jupiter-clipper');
      advanceToAct2Jpl();
      return;
    }

    if (scene.unlocksSandbox) {
      playHoloTone('STAR', soundEnabled);
      completeStoryAndUnlockSandbox();
      return;
    }

    playHoloTone('STEP', soundEnabled);
    closeCinematic();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex h-screen w-screen flex-col justify-between bg-[#02050B] px-4 py-4 sm:px-10 sm:py-6"
      >
        {/* Top Cinema Bar */}
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-b border-[#5FF3FF]/25 pb-3">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-[#FFC15E] uppercase">
              {scene.actLabel[language]}
            </div>
            <h1 className="mt-0.5 text-xl font-light tracking-tight text-white sm:text-2xl">
              {scene.title[language]}
            </h1>
            <div className="font-mono text-[9.5px] tracking-[0.16em] text-[#5FF3FF] uppercase">
              {scene.location[language]}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setLanguage(isEs ? 'en' : 'es')}
              className="border border-[#5FF3FF]/40 bg-[#06101f] px-3 py-1.5 text-[#5FF3FF] uppercase hover:border-[#5FF3FF]"
            >
              {isEs ? '🌐 IDIOMA: ES' : '🌐 LANG: EN'}
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex items-center gap-1.5 border border-[#5FF3FF]/40 bg-[#06101f] px-3 py-1.5 text-slate-200 uppercase hover:border-[#5FF3FF]"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#5FF3FF]" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
              <span>{soundEnabled ? (isEs ? 'VOZ: ON' : 'VOICE: ON') : isEs ? 'VOZ: OFF' : 'VOICE: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCharacterVoice();
                closeCinematic();
              }}
              className="border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-slate-300 uppercase hover:border-[#5FF3FF] hover:text-white"
            >
              {isEs ? 'SALTAR CINEMÁTICA ✕' : 'SKIP CUTSCENE ✕'}
            </button>
          </div>
        </div>

        {scene.alertBanner && (
          <div className="mx-auto w-full max-w-6xl border border-[#FF4D6D] bg-[#FF4D6D]/15 px-4 py-1.5 text-center font-mono text-[10.5px] font-bold tracking-[0.18em] text-[#FF4D6D] uppercase">
            {scene.alertBanner}
          </div>
        )}

        {/* Full-Screen Animated Scene Stage */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center py-2">
          <FullScreenAnimatedCinema
            pose={currentSlide.pose}
            speaker={currentSlide.speaker}
          />
        </div>

        {/* Bottom Subtitle & Interactive Identity Bar */}
        <div className="mx-auto w-full max-w-6xl space-y-3 border-t border-[#5FF3FF]/25 pt-3">
          {/* Spoken Dialogue Subtitle Box (Zero parenthetical stage directions!) */}
          <div className="border border-[#5FF3FF]/35 bg-[#050c18]/95 p-4 shadow-[0_0_35px_rgba(95,243,255,0.12)]">
            <div className="flex items-center justify-between gap-2">
              <span className={`border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.16em] uppercase ${speakerBadgeColor}`}>
                {currentSlide.speakerTitle[language]}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    speakCharacterLine(fullDialogue, language, currentSlide.speaker, true)
                  }
                  className="font-mono text-[9.5px] text-[#5FF3FF] underline hover:text-white"
                >
                  {isEs ? '🔊 Escuchar voz' : '🔊 Replay voice'}
                </button>
                <span className="font-mono text-[10px] text-slate-400">
                  {safeIdx + 1} / {slides.length}
                </span>
              </div>
            </div>

            <p className="mt-3 min-h-[3.5rem] text-base font-light leading-relaxed text-white sm:text-lg">
              {shownText}
              {typedChars < fullDialogue.length && (
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-[#5FF3FF]" />
              )}
            </p>
          </div>

          {/* Fixed Official Character Credentials Badge (Non-editable) */}
          {isLastSlide && scene.requiresCadetNameInput && (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#5FF3FF]/45 bg-[#5FF3FF]/10 px-3.5 py-2 font-mono text-[10px] tracking-[0.14em] uppercase">
              <span className="text-[#5FF3FF]">
                {isEs ? 'CADETE ASIGNADO:' : 'ASSIGNED CADET:'}{' '}
                <strong className="text-white">{cadetName}</strong>
              </span>
              <span className="text-[#FFC15E]">
                {isEs ? 'PROYECTO:' : 'PROJECT:'}{' '}
                <strong className="text-white">{missionCustomName}</strong>
              </span>
            </div>
          )}

          {isLastSlide && scene.requiresEngineerNameInput && (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#FFC15E]/55 bg-[#FFC15E]/10 px-3.5 py-2 font-mono text-[10px] tracking-[0.14em] uppercase">
              <span className="text-[#FFC15E]">
                {isEs ? 'CREDENCIAL INGENIERO JEFE JPL:' : 'JPL CHIEF ENGINEER CALLSIGN:'}{' '}
                <strong className="text-white">{engineerName}</strong>
              </span>
              <span className="text-[#5FF3FF]">
                {isEs ? 'MISIÓN DE RESCATE:' : 'RESCUE MISSION:'}{' '}
                <strong className="text-white">{missionCustomName}</strong>
              </span>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[9.5px] text-[#5FF3FF]">
              {scene.scienceFact[language]}
            </span>

            <div className="flex items-center gap-2">
              {safeIdx > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTypedChars(0);
                    setSlideIdx((i) => Math.max(0, i - 1));
                  }}
                  className="border border-[#5FF3FF]/35 px-3.5 py-2 font-mono text-[10px] text-slate-300 uppercase hover:border-[#5FF3FF]"
                >
                  ← {isEs ? 'ANTERIOR' : 'BACK'}
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="border border-[#5FF3FF] bg-[#5FF3FF]/20 px-5 py-2 font-mono text-xs font-bold tracking-[0.16em] text-[#5FF3FF] uppercase shadow-[0_0_24px_rgba(95,243,255,0.28)] hover:bg-[#5FF3FF]/30"
              >
                {typedChars < fullDialogue.length
                  ? isEs
                    ? 'MOSTRAR TEXTO COMPLETO ⏭'
                    : 'SHOW FULL TEXT ⏭'
                  : !isLastSlide
                    ? isEs
                      ? 'SIGUIENTE ESCENA →'
                      : 'NEXT SCENE →'
                    : scene.requiresCadetNameInput
                      ? isEs
                        ? `ENCENDER CONSOLA, CADETE ${cadetName} →`
                        : `IGNITE CONSOLE, CADET ${cadetName} →`
                      : scene.requiresEngineerNameInput
                        ? isEs
                          ? `ASUMIR MANDO EN JPL, ING. ${engineerName} →`
                          : `ASSUME JPL COMMAND, ENG. ${engineerName} →`
                        : scene.unlocksSandbox
                          ? isEs
                            ? 'DESBLOQUEAR MODO FORJA INFINITA (SANDBOX) →'
                            : 'UNLOCK INFINITE FORGE SANDBOX →'
                          : isEs
                            ? 'CONTINUAR A LOS CONTROLES →'
                            : 'CONTINUE TO CONTROLS →'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
