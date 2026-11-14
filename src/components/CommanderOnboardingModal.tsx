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
} from 'lucide-react';
import { useMissionStore } from '../store';
import type { ExperienceMode } from '../types/mission';

function OnboardingContent() {
  const {
    language,
    experienceMode,
    commanderName,
    missionCustomName,
    setLanguage,
    completeOnboarding,
  } = useMissionStore();

  const [draftCommander, setDraftCommander] = useState(commanderName);
  const [draftMission, setDraftMission] = useState(missionCustomName);
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>(experienceMode);
  const isEs = language === 'es';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.94, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-500/35 bg-[#070d1d] p-6 shadow-[0_0_60px_rgba(34,211,238,0.16)] sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-300">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-300">
                ORBITAL FORGE · NASA Space Apps 2026
              </span>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                {isEs ? 'Credencial de Misión & Dificultad' : 'Mission Credential & Difficulty'}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLanguage(isEs ? 'en' : 'es')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-cyan-200 transition hover:border-cyan-400"
          >
            <Languages className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isEs ? 'ES · Español' : 'EN · English'}</span>
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-300">
          {isEs
            ? 'Tú eres el Comandante de Vuelo. Identifica tu nave y elige cómo quieres vivir la ingeniería de sistemas espaciales CML 1–5:'
            : 'You are the Flight Commander. Register your spacecraft callsign and choose your CML 1–5 engineering challenge:'}
        </p>

        {/* 3-Step Mission Roadmap (Goldfish Clarity) */}
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
              className="rounded-xl border border-cyan-500/20 bg-slate-950/70 px-3 py-2"
            >
              <div className="font-mono text-[10px] font-bold text-cyan-300">
                {item.step} · {item.title[language]}
              </div>
              <div className="text-[11px] text-slate-400">{item.desc[language]}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 focus-within:border-cyan-400/70">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-cyan-300">
              <UserCheck className="h-3.5 w-3.5" />
              {isEs ? 'Callsign / Nombre del Comandante' : 'Commander Callsign / Name'}
            </span>
            <input
              type="text"
              maxLength={28}
              value={draftCommander}
              onChange={(e) => setDraftCommander(e.target.value)}
              placeholder={isEs ? 'Ej. Orion' : 'e.g. Orion'}
              className="mt-1.5 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 focus-within:border-amber-400/70">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-amber-300">
              <Compass className="h-3.5 w-3.5" />
              {isEs ? 'Nombre Oficial de tu Misión' : 'Official Mission Name'}
            </span>
            <input
              type="text"
              maxLength={32}
              value={draftMission}
              onChange={(e) => setDraftMission(e.target.value)}
              placeholder={isEs ? 'Ej. Inti-1' : 'e.g. Inti-1'}
              className="mt-1.5 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedMode('CADET')}
            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
              selectedMode === 'CADET'
                ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.18)]'
                : 'border-slate-800 bg-slate-950/75 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-2.5 py-1 font-mono text-[10px] font-bold text-cyan-200">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {isEs ? 'HISTORIA · EXPLORADOR' : 'STORY · EXPLORER'}
                </span>
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <h2 className="mt-3 text-base font-extrabold text-white">
                {isEs ? 'Cadete Estudiante' : 'Cadet Explorer'}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {isEs
                  ? 'Soy Cadete: Quiero aprender diseñando mi primera misión con la Comandante Vega, analogías divertidas, pistas visuales de piezas y crisis guiadas.'
                  : 'I am a Cadet: Learn by building my first mission with Commander Vega, intuitive analogies, part hints, and guided flight crises.'}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] text-cyan-300">
              <span className="rounded bg-slate-900 px-2 py-0.5">{isEs ? 'Analogías CSA' : 'CSA Analogies'}</span>
              <span className="rounded bg-slate-900 px-2 py-0.5">{isEs ? 'Pistas en Vuelo' : 'Flight Hints'}</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedMode('JPL_ENGINEER')}
            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
              selectedMode === 'JPL_ENGINEER'
                ? 'border-indigo-400 bg-indigo-500/18 shadow-[0_0_24px_rgba(129,140,248,0.2)]'
                : 'border-slate-800 bg-slate-950/75 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-2.5 py-1 font-mono text-[10px] font-bold text-indigo-200">
                  <Wrench className="h-3.5 w-3.5" />
                  {isEs ? 'REALISTA · HARDCORE' : 'REALISTIC · HARDCORE'}
                </span>
                <Cpu className="h-4 w-4 text-indigo-300" />
              </div>
              <h2 className="mt-3 text-base font-extrabold text-white">
                {isEs ? 'Ingeniero JPL Team X' : 'JPL Team X Engineer'}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {isEs
                  ? 'Soy Ingeniero JPL: Dame telemetría cruda (TRL, CBE+MGA, ΔV, Eb/N0), márgenes estrictos del 35% NASA y crisis sin pistas previas.'
                  : 'I am a JPL Engineer: Unlock raw telemetry (TRL, CBE+MGA, ΔV, Eb/N0), strict 35% NASA margins, and blind crisis commands.'}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] text-indigo-300">
              <span className="rounded bg-slate-900 px-2 py-0.5">CBE + MGA</span>
              <span className="rounded bg-slate-900 px-2 py-0.5">MCR ≥35%</span>
              <span className="rounded bg-slate-900 px-2 py-0.5">{isEs ? 'Sin Pistas' : 'Zero Hints'}</span>
            </div>
          </motion.button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            {isEs
              ? 'Puedes alternar dificultad y callsign en la barra superior cuando quieras.'
              : 'You can switch difficulty or callsign from the top bar at any time.'}
          </span>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => completeOnboarding(selectedMode, draftCommander, draftMission)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.3)]"
          >
            <Rocket className="h-4 w-4" />
            <span>
              {isEs
                ? `Asumir Mando: Misión ${draftMission.trim() || 'Inti-1'}`
                : `Assume Command: ${draftMission.trim() || 'Inti-1'}`}
            </span>
          </motion.button>
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
