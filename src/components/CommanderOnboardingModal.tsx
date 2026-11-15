import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Languages,
  Rocket,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
  Check,
  X,
} from 'lucide-react';
import { useMissionStore } from '../store';
import type { ExperienceMode } from '../types/mission';
import {
  playHoloTone,
  speakCharacterLine,
  stopCharacterVoice,
  unlockAudioContext,
} from './holoAudio';

function CommanderVegaBust({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* CAD Holographic Frame */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#5FF3FF]/50 bg-[#030914] shadow-[0_0_24px_rgba(95,243,255,0.25)]">
        <svg viewBox="0 0 100 100" className="h-24 w-24 select-none">
          {/* Coordinate grid */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#5FF3FF" strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#5FF3FF" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 3" />
          
          {/* Commander Frank Vega Bust Silhouette */}
          <g stroke="#5FF3FF" fill="rgba(95,243,255,0.08)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            {/* Shoulders & Flight Suit Collar */}
            <path d="M 20,86 L 30,70 L 42,66 L 58,66 L 70,70 L 80,86 Z" />
            <line x1="50" y1="66" x2="50" y2="86" strokeWidth="1" strokeDasharray="2 2" />
            {/* NASA Patch on Left Chest */}
            <circle cx="34" cy="76" r="3.5" fill="#5FF3FF" fillOpacity="0.3" strokeWidth="0.8" />
            {/* Head & Jawline */}
            <path d="M 38,58 L 38,42 Q 38,24 50,24 Q 62,24 62,42 L 62,58 Q 50,65 38,58 Z" />
            {/* Commander Cap / Short Flight Hair */}
            <path d="M 36,36 Q 50,20 64,36" fill="#5FF3FF" fillOpacity="0.4" strokeWidth="1.5" />
            {/* Comms Headset Boom */}
            <path d="M 64,46 L 68,48 L 68,54 L 56,58" fill="none" stroke="#FFC15E" strokeWidth="1.2" />
            <circle cx="55" cy="58" r="1.5" fill="#FFC15E" />
            {/* Visor / Eye Brow Vector */}
            <line x1="42" y1="42" x2="47" y2="42" strokeWidth="1.2" />
            <line x1="53" y1="42" x2="58" y2="42" strokeWidth="1.2" />
          </g>
        </svg>

        {/* Outer Pulsing Ping Ring */}
        {isSpeaking && (
          <span className="absolute -inset-1 rounded-full border border-[#5FF3FF] animate-ping opacity-40 pointer-events-none" />
        )}
      </div>

      {/* Voice Waveform Bars */}
      <div className="mt-2 flex items-center justify-center gap-1 h-3">
        {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((val, i) => (
          <motion.span
            key={i}
            animate={
              isSpeaking
                ? { height: [4, val * 12, 4] }
                : { height: 3 }
            }
            transition={{
              repeat: Infinity,
              duration: 0.45 + i * 0.08,
              ease: 'easeInOut',
            }}
            className="w-0.5 rounded-full bg-[#5FF3FF]"
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingContent() {
  const {
    language,
    experienceMode,
    cadetName,
    engineerName,
    missionCustomName,
    reducedMotion,
    soundEnabled,
    setLanguage,
    completeOnboarding,
  } = useMissionStore();

  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ENGINEER'>(
    experienceMode === 'JPL_ENGINEER' ? 'ENGINEER' : 'STUDENT'
  );
  const [draftCallsign, setDraftCallsign] = useState(
    experienceMode === 'JPL_ENGINEER' ? engineerName : cadetName
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isEs = language === 'es';

  const vegaSpeech = isEs
    ? '¡Atención recluta! La NASA te da la bienvenida al Proyecto Ícaro. En la escuela te enseñan que el espacio es silencioso y hermoso, pero allá arriba es una bestia helada: un error de cálculo y se acaba la misión. No enviamos astronautas con esperanzas; los enviamos con máquinas infalibles forjadas tornillo a tornillo. Elige tu alistamiento y preséntate para tu primera asignación en la Academia.'
    : 'Attention recruit! NASA welcomes you to Project Icarus. Space forgives zero miscalculations: we forge every spacecraft bolt by bolt. Choose your enlistment and prepare for your first Academy mission.';

  const handlePlayVoice = () => {
    if (isSpeaking) {
      stopCharacterVoice();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakCharacterLine(
      vegaSpeech,
      language,
      'VEGA',
      soundEnabled,
      () => setIsSpeaking(false)
    );
  };

  useEffect(() => {
    return () => {
      stopCharacterVoice();
    };
  }, []);

  const handleClose = useCallback(() => {
    stopCharacterVoice();
    playHoloTone('STEP', soundEnabled);
    const mode: ExperienceMode = selectedRole === 'STUDENT' ? 'CADET' : 'JPL_ENGINEER';
    const cleanCallsign = draftCallsign.trim() || (selectedRole === 'STUDENT' ? 'Orion' : 'Vanguard');
    completeOnboarding(
      mode,
      cleanCallsign,
      missionCustomName || 'Ícaro-Pionero',
      cleanCallsign,
      cleanCallsign
    );
  }, [completeOnboarding, draftCallsign, missionCustomName, selectedRole, soundEnabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const handleEnlist = () => {
    unlockAudioContext();
    playHoloTone('STAR', soundEnabled);
    stopCharacterVoice();
    const mode: ExperienceMode = selectedRole === 'STUDENT' ? 'CADET' : 'JPL_ENGINEER';
    const cleanCallsign = draftCallsign.trim() || (selectedRole === 'STUDENT' ? 'Orion' : 'Vanguard');
    
    // Complete onboarding: sets profile, persists identity and opens the Prologue Cinematic
    completeOnboarding(
      mode,
      cleanCallsign,
      missionCustomName || 'Ícaro-Pionero',
      cleanCallsign,
      cleanCallsign
    );
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#02050B]/90 p-4 backdrop-blur-md font-mono"
    >
      <motion.div
        initial={reducedMotion ? false : { scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-xl border-2 border-[#5FF3FF]/50 bg-[#04080F] p-5 shadow-[0_0_70px_rgba(95,243,255,0.22)] sm:p-7 text-slate-100"
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#5FF3FF]/25 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded border border-[#5FF3FF]/50 bg-[#5FF3FF]/15 text-[#5FF3FF]">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFC15E]">
                NASA ORBITAL FORGE · ESTACIÓN DE RECLUTAMIENTO
              </span>
              <h1 className="text-xl font-light tracking-wide text-white sm:text-2xl">
                {isEs ? 'Alistamiento de Misión Aeroespacial' : 'Aerospace Mission Enlistment'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setLanguage(isEs ? 'en' : 'es');
              }}
              className="inline-flex items-center gap-1.5 rounded border border-[#5FF3FF]/40 bg-[#060d1a] px-3 py-1.5 text-xs text-[#5FF3FF] transition hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10 cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{isEs ? 'ES · Español' : 'EN · English'}</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label={isEs ? 'Cerrar alistamiento (ESC)' : 'Close enlistment (ESC)'}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded border border-[#FF4D6D]/60 bg-[#FF4D6D]/15 text-[#FF4D6D] hover:bg-[#FF4D6D]/30 transition cursor-pointer font-mono text-xs font-bold"
              title={isEs ? 'Cerrar ventana (ESC)' : 'Close modal (ESC)'}
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">{isEs ? 'CERRAR' : 'CLOSE'}</span>
            </button>
          </div>
        </div>

        {/* Commander Frank Vega Holographic Briefing */}
        <div className="mt-4 rounded-lg border border-[#5FF3FF]/30 bg-[#071324]/80 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <CommanderVegaBust isSpeaking={isSpeaking} />

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                <div>
                  <div className="text-[10px] tracking-widest text-[#FFC15E] uppercase font-bold">
                    {isEs ? 'COMANDANTE FRANK VEGA · CONTROL DE MISIÓN NASA' : 'COMMANDER FRANK VEGA · NASA FLIGHT CONTROLLER'}
                  </div>
                  <div className="text-sm font-medium text-white mt-0.5">
                    {isEs ? 'Directiva de Alistamiento: "Tornillo a Tornillo"' : 'Enlistment Directive: "Bolt by Bolt"'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlayVoice}
                  className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-bold transition ${
                    isSpeaking
                      ? 'border-[#FF4D6D] bg-[#FF4D6D]/20 text-[#FF4D6D] animate-pulse'
                      : 'border-[#5FF3FF]/40 bg-[#5FF3FF]/10 text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/20'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  <span>{isSpeaking ? (isEs ? 'SILENCIAR' : 'MUTE') : (isEs ? 'ESCUCHAR AL COMANDANTE' : 'LISTEN TO COMMANDER')}</span>
                </button>
              </div>

              <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-200 font-sans border-l-2 border-[#5FF3FF] pl-3">
                {vegaSpeech}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Your Role (Student vs Engineer) */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5FF3FF] mb-2 flex items-center gap-1.5">
            <span>PASO 1: SELECCIONA TU PERFIL DE ALISTAMIENTO</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Role 1: Student / Cadet */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('STUDENT');
                playHoloTone('STEP', soundEnabled);
              }}
              className={`relative flex flex-col justify-between rounded-lg border p-4 text-left transition ${
                selectedRole === 'STUDENT'
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 shadow-[0_0_24px_rgba(95,243,255,0.22)] ring-1 ring-[#5FF3FF]'
                  : 'border-[#5FF3FF]/20 bg-[#060d1a] hover:border-[#5FF3FF]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/15 px-2 py-0.5 text-[10px] font-bold text-[#5FF3FF]">
                    <GraduationCap className="h-4 w-4" />
                    {isEs ? 'ESTUDIANTE / CADETE' : 'STUDENT / CADET'}
                  </span>
                  {selectedRole === 'STUDENT' && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5FF3FF] text-[#02050B]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h2 className="mt-2.5 text-base font-bold text-white">
                  {isEs ? 'Academia de Vuelo Espacial' : 'Space Flight Academy'}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 font-sans">
                  {isEs
                    ? 'Aprende astronáutica desde cero. El asistente robot ASTRA te guiará con flechas y metas en cada fase (CML 1 a 6) usando analogías simples y alertas didácticas.'
                    : 'Learn astronautics from scratch. Assistant ASTRA guides you with arrows and step-by-step goals using intuitive analogies and guided alerts.'}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[9.5px] text-[#5FF3FF]">
                <span className="border border-[#5FF3FF]/30 px-2 py-0.5 rounded bg-[#5FF3FF]/5">
                  {isEs ? '◈ Modo Tutorial Asistido' : '◈ Guided Tutorial Mode'}
                </span>
                <span className="border border-[#5FF3FF]/30 px-2 py-0.5 rounded bg-[#5FF3FF]/5">
                  {isEs ? 'Rango: Cadet Navigator' : 'Rank: Cadet Navigator'}
                </span>
              </div>
            </button>

            {/* Role 2: Engineer / JPL Specialist */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ENGINEER');
                playHoloTone('STEP', soundEnabled);
              }}
              className={`relative flex flex-col justify-between rounded-lg border p-4 text-left transition ${
                selectedRole === 'ENGINEER'
                  ? 'border-[#FFC15E] bg-[#FFC15E]/15 shadow-[0_0_24px_rgba(255,193,94,0.22)] ring-1 ring-[#FFC15E]'
                  : 'border-[#5FF3FF]/20 bg-[#060d1a] hover:border-[#FFC15E]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded border border-[#FFC15E]/40 bg-[#FFC15E]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFC15E]">
                    <Wrench className="h-4 w-4" />
                    {isEs ? 'INGENIERO / ESPECIALISTA JPL' : 'ENGINEER / JPL SPECIALIST'}
                  </span>
                  {selectedRole === 'ENGINEER' && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC15E] text-[#02050B]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h2 className="mt-2.5 text-base font-bold text-white">
                  {isEs ? 'JPL Team X · Arquitectura Espacial' : 'JPL Team X · Space Architecture'}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 font-sans">
                  {isEs
                    ? 'Para estudiantes de ingeniería y desafíos avanzados. Simulación física completa con márgenes MGA de TRL, ecuaciones de Tsiolkovsky y estándares NASA-STD-5001B.'
                    : 'For engineering students and hardcore aerospace challenges. Rigorous physics with TRL contingency margins, Tsiolkovsky equation, and NASA standards.'}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[9.5px] text-[#FFC15E]">
                <span className="border border-[#FFC15E]/30 px-2 py-0.5 rounded bg-[#FFC15E]/5">
                  {isEs ? '◆ Telemetría Técnica Cruda' : '◆ Raw Technical Telemetry'}
                </span>
                <span className="border border-[#FFC15E]/30 px-2 py-0.5 rounded bg-[#FFC15E]/5">
                  {isEs ? 'Rango: Systems Specialist' : 'Rank: Systems Specialist'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Callsign / Player Identity */}
        <div className="mt-5 rounded-lg border border-[#5FF3FF]/25 bg-[#060d1a] p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5FF3FF] mb-2">
            {isEs ? 'PASO 2: IDENTIFICADOR DE VUELO (CALLSIGN / NOMBRE)' : 'STEP 2: FLIGHT CALLSIGN / IDENTIFIER'}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                id="callsign-input"
                type="text"
                value={draftCallsign}
                onChange={(e) => setDraftCallsign(e.target.value)}
                placeholder={selectedRole === 'STUDENT' ? (isEs ? 'Ej: Alex, Orion, Maya...' : 'e.g., Alex, Orion, Maya...') : (isEs ? 'Ej: Vanguard, Dr. Hayes...' : 'e.g., Vanguard, Dr. Hayes...')}
                maxLength={24}
                className="w-full rounded border border-[#5FF3FF]/40 bg-[#02050B] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#5FF3FF] focus:outline-none"
              />
            </div>

            <div className="text-xs text-slate-400">
              <span className="text-[#FFC15E]">// RANGO ASIGNADO: </span>
              {selectedRole === 'STUDENT' ? 'Cadet Navigator (+0 XP)' : 'Systems Specialist (+0 XP)'}
            </div>
          </div>
        </div>

        {/* Bottom Enlistment Action Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#5FF3FF]/25 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#5FF3FF]" />
            <span>
              {isEs
                ? 'El alistamiento inicia la transmisión del Comandante Vega y desbloquea el carrusel de misiones.'
                : 'Enlistment starts Commander Vega transmission and grants clearance to the mission deck.'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleEnlist}
            className="flex items-center gap-2 rounded border border-[#5FF3FF] bg-[#5FF3FF] px-6 py-2.5 text-xs font-bold tracking-wider text-[#02050B] uppercase shadow-[0_0_28px_rgba(95,243,255,0.35)] hover:bg-[#7ff6ff] transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-[#02050B]" />
            <span>
              {isEs
                ? 'FIRMAR ALISTAMIENTO E INICIAR TRANSMISIÓN →'
                : 'SIGN ENLISTMENT & START TRANSMISSION →'}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CommanderOnboardingModal() {
  const hasCompletedOnboarding = useMissionStore((s) => s.hasCompletedOnboarding);
  return (
    <AnimatePresence>
      {!hasCompletedOnboarding && <OnboardingContent />}
    </AnimatePresence>
  );
}
