import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Cpu,
  GraduationCap,
  Languages,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import { useMissionStore } from '../store';
import type { ExperienceMode } from '../types/mission';
import { playHoloTone } from './holoAudio';

function OnboardingContent() {
  const {
    language,
    experienceMode,
    commanderName,
    missionCustomName,
    reducedMotion,
    soundEnabled,
    setLanguage,
    completeOnboarding,
  } = useMissionStore();

  const [draftCommander, setDraftCommander] = useState(commanderName);
  const [draftMission, setDraftMission] = useState(missionCustomName);
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>(experienceMode);
  const isEs = language === 'es';

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080F]/90 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={reducedMotion ? false : { scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.22 }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-[#5FF3FF]/50 bg-[#04080F] p-6 shadow-[0_0_55px_rgba(95,243,255,0.16)] sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#5FF3FF]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#5FF3FF]/45 bg-[#5FF3FF]/10 text-[#5FF3FF]">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#5FF3FF] uppercase">
                SYS.CREDENTIAL // ORBITAL FORGE · NASA SPACE APPS 2026
              </div>
              <h1 className="mt-0.5 text-xl font-light tracking-tight text-white sm:text-2xl">
                {isEs ? 'Credencial de Misión & Dificultad' : 'Mission Credential & Difficulty'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setLanguage(isEs ? 'en' : 'es');
              }}
              className="inline-flex items-center gap-1.5 border border-[#5FF3FF]/30 bg-[#04080F] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-[#5FF3FF] uppercase transition hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{isEs ? 'ES · Español' : 'EN · English'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                completeOnboarding(selectedMode, draftCommander, draftMission);
              }}
              aria-label={isEs ? 'Cerrar credencial' : 'Close credential'}
              className="border border-[#5FF3FF]/30 bg-[#04080F] p-1.5 text-[#5FF3FF] transition hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-300">
          {isEs
            ? 'Tú eres el Comandante de Vuelo. Identifica tu nave y elige cómo quieres vivir la ingeniería de sistemas espaciales CML 1–5:'
            : 'You are the Flight Commander. Register your spacecraft callsign and choose your CML 1–5 engineering challenge:'}
        </p>

        {/* 3-Step Mission Roadmap */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: { en: 'Design (CML 1–4)', es: 'Diseñar (CML 1–4)' },
              desc: { en: 'Orbit, 7 subsystems & tanks', es: 'Órbita, 7 subsistemas y tanques' },
            },
            {
              step: '02',
              title: { en: 'Qualify (CML 5 MCR)', es: 'Calificar (CML 5 MCR)' },
              desc: { en: 'Environmental V&V & ≥35% margin', es: 'Pruebas V&V y margen ≥35%' },
            },
            {
              step: '03',
              title: { en: 'Launch & Crises (06)', es: 'Lanzamiento y Crisis (06)' },
              desc: { en: 'Resolve 3 orbital anomalies', es: 'Resuelve 3 crisis en órbita' },
            },
          ].map((item) => (
            <div
              key={item.step}
              className="border border-[#5FF3FF]/25 bg-[#04080F] px-3 py-2.5"
            >
              <div className="font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                {item.step} · {item.title[language]}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">{item.desc[language]}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="border border-[#5FF3FF]/30 bg-[#04080F] p-3.5 transition focus-within:border-[#5FF3FF]">
            <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
              <UserCheck className="h-3.5 w-3.5" />
              {isEs ? 'Callsign / Nombre del Comandante' : 'Commander Callsign / Name'}
            </span>
            <input
              id="commander-callsign"
              name="commanderCallsign"
              type="text"
              maxLength={28}
              value={draftCommander}
              onChange={(e) => setDraftCommander(e.target.value)}
              placeholder={isEs ? 'Ej. Orion' : 'e.g. Orion'}
              className="mt-1.5 w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="border border-[#FFC15E]/35 bg-[#04080F] p-3.5 transition focus-within:border-[#FFC15E]">
            <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#FFC15E] uppercase">
              <Compass className="h-3.5 w-3.5" />
              {isEs ? 'Nombre Oficial de tu Misión' : 'Official Mission Name'}
            </span>
            <input
              id="mission-name"
              name="missionName"
              type="text"
              maxLength={32}
              value={draftMission}
              onChange={(e) => setDraftMission(e.target.value)}
              placeholder={isEs ? 'Ej. Inti-1' : 'e.g. Inti-1'}
              className="mt-1.5 w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-600"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setSelectedMode('CADET');
            }}
            className={`flex flex-col justify-between border p-4 text-left transition ${
              selectedMode === 'CADET'
                ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_24px_rgba(95,243,255,0.16)]'
                : 'border-[#5FF3FF]/20 bg-[#04080F] hover:border-[#5FF3FF]/45'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 border border-[#5FF3FF]/35 bg-[#5FF3FF]/10 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.14em] text-[#5FF3FF] uppercase">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {isEs ? 'HISTORIA · EXPLORADOR' : 'STORY · EXPLORER'}
                </span>
                <Sparkles className="h-4 w-4 text-[#5FF3FF]" />
              </div>
              <h2 className="mt-3 text-base font-medium tracking-tight text-white">
                {isEs ? 'Cadete Estudiante' : 'Cadet Explorer'}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {isEs
                  ? 'Soy Cadete: Quiero aprender diseñando mi primera misión con la Comandante Vega, analogías divertidas, pistas visuales de piezas y crisis guiadas.'
                  : 'I am a Cadet: Learn by building my first mission with Commander Vega, intuitive analogies, part hints, and guided flight crises.'}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[9.5px] tracking-[0.12em] text-[#5FF3FF] uppercase">
              <span className="border border-[#5FF3FF]/30 bg-[#04080F] px-2 py-0.5">
                {isEs ? 'Analogías CSA' : 'CSA Analogies'}
              </span>
              <span className="border border-[#5FF3FF]/30 bg-[#04080F] px-2 py-0.5">
                {isEs ? 'Pistas en Vuelo' : 'Flight Hints'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setSelectedMode('JPL_ENGINEER');
            }}
            className={`flex flex-col justify-between border p-4 text-left transition ${
              selectedMode === 'JPL_ENGINEER'
                ? 'border-[#FFC15E] bg-[#FFC15E]/12 shadow-[0_0_24px_rgba(255,193,94,0.16)]'
                : 'border-[#5FF3FF]/20 bg-[#04080F] hover:border-[#FFC15E]/45'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 border border-[#FFC15E]/40 bg-[#FFC15E]/10 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.14em] text-[#FFC15E] uppercase">
                  <Wrench className="h-3.5 w-3.5" />
                  {isEs ? 'REALISTA · HARDCORE' : 'REALISTIC · HARDCORE'}
                </span>
                <Cpu className="h-4 w-4 text-[#FFC15E]" />
              </div>
              <h2 className="mt-3 text-base font-medium tracking-tight text-white">
                {isEs ? 'Ingeniero JPL Team X' : 'JPL Team X Engineer'}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {isEs
                  ? 'Soy Ingeniero JPL: Dame telemetría cruda (TRL, CBE+MGA, ΔV, Eb/N0), márgenes estrictos del 35% NASA y crisis sin pistas previas.'
                  : 'I am a JPL Engineer: Unlock raw telemetry (TRL, CBE+MGA, ΔV, Eb/N0), strict 35% NASA margins, and blind crisis commands.'}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[9.5px] tracking-[0.12em] text-[#FFC15E] uppercase">
              <span className="border border-[#FFC15E]/35 bg-[#04080F] px-2 py-0.5">CBE + MGA</span>
              <span className="border border-[#FFC15E]/35 bg-[#04080F] px-2 py-0.5">MCR ≥35%</span>
              <span className="border border-[#FFC15E]/35 bg-[#04080F] px-2 py-0.5">
                {isEs ? 'Sin Pistas' : 'Zero Hints'}
              </span>
            </div>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#5FF3FF]/20 pt-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#5FF3FF]" />
            {isEs
              ? 'Puedes alternar dificultad y callsign en la barra superior cuando quieras.'
              : 'You can switch difficulty or callsign from the top bar at any time.'}
          </span>

          <button
            type="button"
            onClick={() => {
              playHoloTone('STAR', soundEnabled);
              completeOnboarding(selectedMode, draftCommander, draftMission);
            }}
            className="inline-flex items-center gap-2 border border-[#5FF3FF] bg-[#5FF3FF]/15 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] text-[#5FF3FF] uppercase shadow-[0_0_24px_rgba(95,243,255,0.2)] transition hover:bg-[#5FF3FF]/25"
          >
            <Rocket className="h-4 w-4" />
            <span>
              {isEs
                ? `Asumir Mando: ${draftMission.trim() || 'Inti-1'}`
                : `Assume Command: ${draftMission.trim() || 'Inti-1'}`}
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
