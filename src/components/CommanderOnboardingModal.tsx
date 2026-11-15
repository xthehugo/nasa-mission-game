import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Cpu,
  Film,
  GraduationCap,
  Languages,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useMissionStore } from '../store';
import type { ExperienceMode } from '../types/mission';

function OnboardingContent() {
  const {
    language,
    experienceMode,
    cadetName,
    engineerName,
    missionCustomName,
    act1Completed,
    act2Completed,
    setLanguage,
    completeOnboarding,
    openCinematic,
  } = useMissionStore();

  const [draftCadet, setDraftCadet] = useState(cadetName);
  const [draftEngineer, setDraftEngineer] = useState(engineerName);
  const [draftMission, setDraftMission] = useState(missionCustomName);
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>(experienceMode);
  const isEs = language === 'es';

  const handleStart = (withCinematic: boolean) => {
    const activeCallsign = selectedMode === 'CADET' ? draftCadet : draftEngineer;
    completeOnboarding(
      selectedMode,
      activeCallsign,
      draftMission,
      draftCadet,
      draftEngineer,
    );
    if (withCinematic) {
      openCinematic(selectedMode === 'CADET' ? 'ACT1_PROLOGUE' : 'ACT2_PROLOGUE');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-[#5FF3FF]/45 bg-[#04080F] p-5 shadow-[0_0_60px_rgba(95,243,255,0.18)] sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#5FF3FF]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 text-[#5FF3FF]">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFC15E]">
                ORBITAL FORGE · PROYECTO ÍCARO-26 ("ECOS DE ÍCARO")
              </span>
              <h1 className="text-xl font-light tracking-tight text-white sm:text-2xl">
                {isEs
                  ? 'Modo Historia: Crónica de Dos Capítulos'
                  : 'Story Mode: Two-Chapter Space Chronicle'}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLanguage(isEs ? 'en' : 'es')}
            className="inline-flex items-center gap-1.5 border border-[#5FF3FF]/30 bg-[#060d1a] px-3 py-1.5 font-mono text-xs text-[#5FF3FF] transition hover:border-[#5FF3FF]"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{isEs ? 'ES · Español' : 'EN · English'}</span>
          </button>
        </div>

        {/* Emotional Core Banner */}
        <div className="mt-3 border-l-2 border-[#FFC15E] bg-[#FFC15E]/8 px-3.5 py-2.5 text-xs leading-relaxed text-slate-200">
          <strong className="font-mono text-[10px] uppercase tracking-wider text-[#FFC15E]">
            {isEs ? 'EL NÚCLEO EMOCIONAL (ÍCARO-1): ' : 'THE EMOTIONAL CORE (ICARUS-1): '}
          </strong>
          {isEs
            ? 'Hace 4 años, la misión Ícaro-1 se perdió camino a Júpiter por un fallo de energía en una tormenta solar. El Comandante Frank Vega prometió formar una nueva generación que diseñe naves infalibles "tornillo por tornillo". Primero te graduarás como Cadete (Acto I), luego serás convocado como Ingeniero Jefe JPL (Acto II) y finalmente desbloquearás el Modo Libre (Forja Infinita).'
            : 'Four years ago, mission Icarus-1 was lost en route to Jupiter during a solar storm. Commander Frank Vega vowed to train a new generation "bolt by bolt". Start as Cadet (Act I), rise to JPL Chief Engineer (Act II), and unlock Infinite Forge Sandbox.'}
        </div>

        {/* Persistent LocalStorage Identity Inputs for Cadet & JPL Engineer */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="border border-[#5FF3FF]/35 bg-[#060d1a] p-3 focus-within:border-[#5FF3FF]">
            <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase text-[#5FF3FF]">
              <UserCheck className="h-3.5 w-3.5" />
              {isEs ? '1. Nombre del Cadete (Acto I)' : '1. Cadet Name (Act I)'}
            </span>
            <input
              id="commander-callsign"
              name="cadetName"
              type="text"
              maxLength={28}
              value={draftCadet}
              onChange={(e) => setDraftCadet(e.target.value)}
              placeholder={isEs ? 'Tu nombre de Cadete' : 'Your Cadet Name'}
              className="mt-1.5 w-full bg-transparent font-mono text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
            <span className="mt-1 block font-mono text-[8.5px] text-slate-400">
              {isEs ? 'Guardado en localStorage' : 'Saved in localStorage'}
            </span>
          </label>

          <label className="border border-[#FFC15E]/35 bg-[#060d1a] p-3 focus-within:border-[#FFC15E]">
            <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase text-[#FFC15E]">
              <Wrench className="h-3.5 w-3.5" />
              {isEs ? '2. Nombre Ingeniero JPL (Acto II)' : '2. JPL Engineer Name (Act II)'}
            </span>
            <input
              id="engineer-callsign"
              name="engineerName"
              type="text"
              maxLength={28}
              value={draftEngineer}
              onChange={(e) => setDraftEngineer(e.target.value)}
              placeholder={isEs ? 'Tu nombre de Ingeniero' : 'Your Engineer Name'}
              className="mt-1.5 w-full bg-transparent font-mono text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
            <span className="mt-1 block font-mono text-[8.5px] text-slate-400">
              {isEs ? 'Guardado en localStorage' : 'Saved in localStorage'}
            </span>
          </label>

          <label className="border border-[#5FF3FF]/25 bg-[#060d1a] p-3 focus-within:border-[#5FF3FF]">
            <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase text-slate-300">
              <Compass className="h-3.5 w-3.5 text-[#5FF3FF]" />
              {isEs ? '3. Nombre de tu Nave' : '3. Spacecraft Name'}
            </span>
            <input
              id="mission-name"
              name="missionName"
              type="text"
              maxLength={32}
              value={draftMission}
              onChange={(e) => setDraftMission(e.target.value)}
              placeholder={isEs ? 'Ej. Ícaro-Pionero' : 'e.g. Icarus-Pioneer'}
              className="mt-1.5 w-full bg-transparent font-mono text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
            <span className="mt-1 block font-mono text-[8.5px] text-slate-400">
              {act2Completed
                ? isEs ? '★ Forja Infinita Desbloqueada' : '★ Sandbox Unlocked'
                : act1Completed
                  ? isEs ? '✓ Acto I Completado' : '✓ Act I Completed'
                  : isEs ? 'Empieza en Capítulo I' : 'Starts at Chapter I'}
            </span>
          </label>
        </div>

        {/* Chapter Selection Cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedMode('CADET')}
            className={`flex flex-col justify-between border p-4 text-left transition ${
              selectedMode === 'CADET'
                ? 'border-[#5FF3FF] bg-[#5FF3FF]/12 shadow-[0_0_24px_rgba(95,243,255,0.18)]'
                : 'border-[#5FF3FF]/20 bg-[#060d1a] hover:border-[#5FF3FF]/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 border border-[#5FF3FF]/40 bg-[#5FF3FF]/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-[#5FF3FF]">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {isEs ? 'CAPÍTULO I · RECOMENDADO PARA EMPEZAR' : 'CHAPTER I · RECOMMENDED START'}
                </span>
                <Sparkles className="h-4 w-4 text-[#5FF3FF]" />
              </div>
              <h2 className="mt-2.5 text-base font-bold text-white">
                {isEs
                  ? `Acto I: El Cadete (${draftCadet.trim() || 'Orion'})`
                  : `Act I: The Cadet (${draftCadet.trim() || 'Orion'})`}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {isEs
                  ? 'El Comandante Vega te guía "tornillo por tornillo": te explica qué es cada pieza, para qué sirve y cómo se conecta con el holograma sin saturarte.'
                  : 'Commander Vega guides you "bolt by bolt": explaining what each part is, what it does, and how it connects to the center hologram.'}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[9.5px] text-[#5FF3FF]">
              <span className="border border-[#5FF3FF]/30 px-2 py-0.5">
                {isEs ? 'Guía Tornillo a Tornillo' : 'Bolt-by-Bolt Guide'}
              </span>
              <span className="border border-[#5FF3FF]/30 px-2 py-0.5">
                {isEs ? 'Cinemáticas Acto I' : 'Act I Cutscenes'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('JPL_ENGINEER')}
            className={`flex flex-col justify-between border p-4 text-left transition ${
              selectedMode === 'JPL_ENGINEER'
                ? 'border-[#FFC15E] bg-[#FFC15E]/12 shadow-[0_0_24px_rgba(255,193,94,0.18)]'
                : 'border-[#5FF3FF]/20 bg-[#060d1a] hover:border-[#FFC15E]/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 border border-[#FFC15E]/40 bg-[#FFC15E]/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-[#FFC15E]">
                  <Wrench className="h-3.5 w-3.5" />
                  {isEs ? 'CAPÍTULO II · HARDCORE JPL' : 'CHAPTER II · JPL HARDCORE'}
                </span>
                <Cpu className="h-4 w-4 text-[#FFC15E]" />
              </div>
              <h2 className="mt-2.5 text-base font-bold text-white">
                {isEs
                  ? `Acto II: Ingeniero JPL (${draftEngineer.trim() || 'Vanguard'})`
                  : `Act II: JPL Engineer (${draftEngineer.trim() || 'Vanguard'})`}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {isEs
                  ? 'La Directora Rostova y Vega te encomiendan rescatar la baliza del Ícaro-1 en Europa (Júpiter). Telemetría cruda, RTG obligatorio y 0 margen de error.'
                  : 'Director Rostova and Vega task you with rescuing the Icarus-1 beacon at Europa. Raw telemetry, mandatory RTG, and zero margin for error.'}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[9.5px] text-[#FFC15E]">
              <span className="border border-[#FFC15E]/30 px-2 py-0.5">
                {isEs ? 'Rescate Ícaro-1' : 'Icarus-1 Rescue'}
              </span>
              <span className="border border-[#FFC15E]/30 px-2 py-0.5">
                {isEs ? 'Desbloquea Modo Libre' : 'Unlocks Free Sandbox'}
              </span>
            </div>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#5FF3FF]/20 pt-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#5FF3FF]" />
            {isEs
              ? 'Tus nombres de Cadete e Ingeniero quedan guardados en localStorage.'
              : 'Your Cadet and Engineer names are persisted in localStorage.'}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleStart(false)}
              className="border border-[#5FF3FF]/35 px-3.5 py-2 font-mono text-[10px] tracking-[0.14em] text-slate-300 uppercase hover:border-[#5FF3FF] hover:text-white"
            >
              {isEs ? 'IR DIRECTO A CONSOLA' : 'SKIP TO CONSOLE'}
            </button>

            <button
              type="button"
              onClick={() => handleStart(true)}
              className="inline-flex items-center gap-2 border border-[#5FF3FF] bg-[#5FF3FF]/20 px-4 py-2 font-mono text-[10.5px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase shadow-[0_0_24px_rgba(95,243,255,0.28)] hover:bg-[#5FF3FF]/30"
            >
              <Film className="h-4 w-4" />
              <span>
                {isEs
                  ? 'INICIAR CON CINEMÁTICA PRÓLOGO →'
                  : 'START WITH PROLOGUE CUTSCENE →'}
              </span>
            </button>
          </div>
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
