import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, Info } from 'lucide-react';
import {
  CAMPAIGN_CONTRACTS,
  findObjectiveById,
  findSubsystemById,
  getSubsystemsByCategory,
  SCIENCE_OBJECTIVES,
} from '../engine';
import { useMissionStore, type CubeSatFormFactor } from '../store';
import type { ScienceDiscipline, SubsystemOption } from '../types/mission';
import { playHoloTone } from './holoAudio';
import { SubsystemHoloGraphic } from './SubsystemHoloGraphic';
import { SubsystemInspectionModal } from './SubsystemInspectionModal';

const DISCIPLINES: Record<ScienceDiscipline, { en: string; es: string }> = {
  EARTH_SCIENCE: { en: 'EARTH / BIO', es: 'TIERRA / BIO' },
  HELIOPHYSICS: { en: 'HELIOPHYSICS', es: 'HELIOFÍSICA' },
  PLANETARY_SCIENCE: { en: 'PLANETARY', es: 'PLANETARIA' },
  ASTROPHYSICS: { en: 'ASTROPHYSICS', es: 'ASTROFÍSICA' },
};

const CHASSIS_OPTS: { id: CubeSatFormFactor; sub: { en: string; es: string } }[] = [
  { id: '1.5U', sub: { en: 'RIDESHARE', es: 'RIDESHARE' } },
  { id: '2U', sub: { en: 'BALANCED', es: 'EQUILIBRADO' } },
  { id: '3U', sub: { en: 'MORE PAYLOAD', es: 'MÁS CARGA' } },
  { id: 'CUSTOM', sub: { en: 'DEEP SPACE', es: 'ESPACIO PROFUNDO' } },
];

export function PhaseStep1User({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    experienceMode,
    phase,
    level1TutorialStep,
    robotHoverZone,
    cubesatFormFactor,
    missionStatement,
    selection,
    metrics,
    reducedMotion,
    soundEnabled,
    setCubesatFormFactor,
    setMissionStatement,
    setSubsystem,
    setObjective,
    setLevel1TutorialStep,
    appendDecisionLog,
  } = useMissionStore();

  const isEs = language === 'es';
  const [inspectingEps, setInspectingEps] = useState<SubsystemOption | null>(null);
  const [openLeftSection, setOpenLeftSection] = useState<'CHASSIS' | 'EPS' | null>(
    phase === 'CML_1' && level1TutorialStep === 2 ? 'EPS' : 'CHASSIS',
  );
  const [rightTab, setRightTab] = useState<'CONTRACTS' | 'STATEMENT' | 'BENCHMARK'>('CONTRACTS');
  const [prevTutorialStep, setPrevTutorialStep] = useState(level1TutorialStep);
  const [justPickedId, setJustPickedId] = useState<string | null>(null);
  const chassisSectionRef = useRef<HTMLDivElement | null>(null);
  const epsSectionRef = useRef<HTMLDivElement | null>(null);

  const triggerPickFeedback = (id: string) => {
    setJustPickedId(id);
    window.setTimeout(() => {
      setJustPickedId((curr) => (curr === id ? null : curr));
    }, 320);
  };

  const smoothRevealSection = (el: HTMLDivElement | null) => {
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
  };

  if (level1TutorialStep !== prevTutorialStep) {
    setPrevTutorialStep(level1TutorialStep);
    if (phase === 'CML_1') {
      if (level1TutorialStep === 1) {
        setOpenLeftSection('CHASSIS');
      } else if (level1TutorialStep === 2) {
        setOpenLeftSection('EPS');
      } else if (level1TutorialStep === 3) {
        setRightTab('CONTRACTS');
      }
    }
  }

  useEffect(() => {
    if (zone !== 'LEFT' || !openLeftSection) return;
    const el = openLeftSection === 'CHASSIS' ? chassisSectionRef.current : epsSectionRef.current;
    if (!el) return;
    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [openLeftSection, reducedMotion, zone]);

  const epsOptions = getSubsystemsByCategory('EPS');
  const activeEps = findSubsystemById(selection.epsId) ?? epsOptions[0];
  const activeChassis = CHASSIS_OPTS.find((c) => c.id === cubesatFormFactor) ?? CHASSIS_OPTS[0];
  const highlightChassis =
    (phase === 'CML_1' && level1TutorialStep === 1) || robotHoverZone === 'CHASSIS';
  const highlightEps =
    (phase === 'CML_1' && level1TutorialStep === 2) || robotHoverZone === 'EPS';
  const highlightMission =
    (phase === 'CML_1' && level1TutorialStep === 3) || robotHoverZone === 'MISSION';
  const chassisCompleted = phase === 'CML_1' && level1TutorialStep > 1;
  const epsCompleted = phase === 'CML_1' && level1TutorialStep > 2;
  const epsLockedHint = phase === 'CML_1' && level1TutorialStep < 2;

  if (zone === 'LEFT') {
    const isChassisOpen = openLeftSection === 'CHASSIS';
    const isEpsOpen = openLeftSection === 'EPS';

    return (
      <div className="space-y-4">
        {/* Paso 1 · Chasis (Estilo limpio del mockup) */}
        <div
          ref={chassisSectionRef}
          data-astra-zone="CHASSIS"
          className={`transition-all ${
            highlightChassis
              ? 'border border-[#FFC15E] bg-[#FFC15E]/5 p-2.5 shadow-[0_0_24px_rgba(255,193,94,0.18)]'
              : chassisCompleted && !isChassisOpen
                ? 'border-b border-[#5FF3FF]/15 pb-2.5 opacity-85'
                : 'border-b border-[#5FF3FF]/15 pb-2.5'
          }`}
        >
          {phase === 'CML_1' && level1TutorialStep === 1 && (
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase">
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#FFC15E]" />
              <span>
                {isEs ? 'PASO ACTIVO · ELIGE UN CHASIS' : 'ACTIVE STEP · CHOOSE A CHASSIS'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setOpenLeftSection((prev) => {
                const next = prev === 'CHASSIS' ? null : 'CHASSIS';
                if (next === 'CHASSIS') smoothRevealSection(chassisSectionRef.current);
                return next;
              });
            }}
            className="flex w-full items-center justify-between gap-2 py-1 text-left transition hover:text-white"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 font-mono text-[12px] tracking-[0.14em] uppercase">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  {chassisCompleted && <Check className="h-3.5 w-3.5 text-[#5FF3FF]" />}
                  <span>{isEs ? 'PASO 1 · CHASIS' : 'STEP 1 · CHASSIS'}</span>
                </span>
                <span className={metrics.volume.isCompliant ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
                  {metrics.volume.used_U.toFixed(1)}U / {metrics.volume.maxFairing_U}U
                </span>
              </div>
              {!isChassisOpen && (
                <div className="mt-0.5 truncate font-mono text-[12px] text-[#5FF3FF]">
                  {activeChassis.id} · {activeChassis.sub[language]}
                </div>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#5FF3FF] transition-transform duration-200 ${
                isChassisOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {isChassisOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {CHASSIS_OPTS.map((ch) => {
                    const active = cubesatFormFactor === ch.id;
                    const pulsing = !reducedMotion && justPickedId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setCubesatFormFactor(ch.id);
                          triggerPickFeedback(ch.id);
                          if (level1TutorialStep <= 1) {
                            setLevel1TutorialStep(2);
                          }
                          playHoloTone('STEP', soundEnabled);
                        }}
                        className={`group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-all duration-300 ${
                          active
                            ? 'border border-[#5FF3FF]/70 bg-[#5FF3FF]/10 text-white shadow-[0_0_20px_rgba(95,243,255,0.18)]'
                            : 'border border-transparent border-l-2 border-l-[#5FF3FF]/20 text-slate-300 hover:border-l-[#5FF3FF] hover:bg-[#5FF3FF]/5'
                        } ${pulsing ? 'ring-2 ring-[#FFC15E]' : ''}`}
                      >
                        <div>
                          <div className="text-[15px] font-medium tracking-tight text-white">
                            {ch.id}
                          </div>
                          <div className="font-mono text-[12px] tracking-[0.12em] text-slate-400 uppercase">
                            {ch.sub[language]}
                          </div>
                        </div>
                        {active && <Check className="h-4 w-4 shrink-0 text-[#5FF3FF]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paso 2 Izquierda · Paneles Solares / EPS */}
        <div
          ref={epsSectionRef}
          data-astra-zone="EPS"
          className={`transition-all ${
            highlightEps
              ? 'border border-[#FFC15E] bg-[#FFC15E]/5 p-2.5 shadow-[0_0_24px_rgba(255,193,94,0.18)]'
              : epsLockedHint && !isEpsOpen
                ? 'border-b border-[#5FF3FF]/15 pb-2.5 opacity-65'
                : 'border-b border-[#5FF3FF]/15 pb-2.5'
          }`}
        >
          {phase === 'CML_1' && level1TutorialStep === 2 && (
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase">
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#FFC15E]" />
              <span>
                {isEs ? 'PASO ACTIVO · ELIGE ENERGÍA SOLAR / EPS' : 'ACTIVE STEP · CHOOSE SOLAR / EPS'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setOpenLeftSection((prev) => {
                const next = prev === 'EPS' ? null : 'EPS';
                if (next === 'EPS') smoothRevealSection(epsSectionRef.current);
                return next;
              });
            }}
            className="flex w-full items-center justify-between gap-2 py-1 text-left transition hover:text-white"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 font-mono text-[12px] tracking-[0.14em] uppercase">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  {epsCompleted && <Check className="h-3.5 w-3.5 text-[#5FF3FF]" />}
                  <span>{isEs ? 'PANELES SOLARES / EPS' : 'SOLAR ARRAYS / EPS'}</span>
                </span>
                <span className="text-[#FFC15E]">+{activeEps?.powerGenerated1AU_W ?? 0}W</span>
              </div>
              {!isEpsOpen && activeEps && (
                <div className="mt-0.5 truncate font-mono text-[12px] text-slate-400">
                  {epsLockedHint
                    ? isEs
                      ? 'Se desbloquea tras elegir chasis (clic para ver)'
                      : 'Unlocks after chassis (click to preview)'
                    : `${activeEps.name[language]} · ${activeEps.massCBE_kg}kg`}
                </div>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#5FF3FF] transition-transform duration-200 ${
                isEpsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {isEpsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2">
                  {epsOptions.map((opt) => {
                    const active = selection.epsId === opt.id;
                    const pulsing = !reducedMotion && justPickedId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`group flex items-stretch border transition-all duration-300 ${
                          active
                            ? 'border-[#5FF3FF] bg-[#5FF3FF]/12 text-white shadow-[0_0_16px_rgba(95,243,255,0.16)]'
                            : 'border-[#5FF3FF]/20 bg-[#04080F]/60 text-slate-300 hover:border-[#5FF3FF]/50'
                        } ${pulsing ? 'ring-2 ring-[#FFC15E]' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingEps(opt);
                            playHoloTone('STEP', soundEnabled);
                          }}
                          title={isEs ? 'Ver detalles y holograma' : 'View details & hologram'}
                          className="flex shrink-0 items-center justify-center border-r border-[#5FF3FF]/15 bg-[#02050B]/90 p-1.5 hover:bg-[#5FF3FF]/15 cursor-pointer"
                        >
                          <SubsystemHoloGraphic id={opt.id} size="sm" isSelected={active} className="h-9 w-9" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSubsystem('EPS', opt.id);
                            triggerPickFeedback(opt.id);
                            if (level1TutorialStep <= 2) {
                              setLevel1TutorialStep(3);
                            }
                            playHoloTone('STEP', soundEnabled);
                          }}
                          className="flex-1 px-2.5 py-2 text-left"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[13px] font-medium text-white">
                              {opt.name[language]}
                            </span>
                            <span className="font-mono text-[12px] text-[#FFC15E] shrink-0">
                              +{opt.powerGenerated1AU_W}W
                            </span>
                          </div>
                          <div
                            className={`mt-1 items-center justify-between font-mono text-[12px] text-slate-400 ${
                              active ? 'flex' : 'hidden group-hover:flex group-focus-within:flex'
                            }`}
                          >
                            <span>{opt.massCBE_kg}kg · ${opt.cost_MillionsUSD}M</span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingEps(opt);
                                playHoloTone('STEP', soundEnabled);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setInspectingEps(opt);
                                  playHoloTone('STEP', soundEnabled);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[#5FF3FF] hover:underline"
                            >
                              <Info className="h-3 w-3" />
                              <span>INFO</span>
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subsystem Inspection Modal for EPS in Step 1 */}
        <SubsystemInspectionModal
          isOpen={inspectingEps !== null}
          initialOption={inspectingEps}
          options={epsOptions}
          selection={selection}
          language={language}
          experienceMode={experienceMode}
          soundEnabled={soundEnabled}
          onClose={() => setInspectingEps(null)}
          onEquip={(opt) => {
            setSubsystem('EPS', opt.id);
            if (level1TutorialStep <= 2) {
              setLevel1TutorialStep(3);
            }
          }}
        />
      </div>
    );
  }

  const activeObj = findObjectiveById(selection.objectiveId);
  const reqPayloads = activeObj.requiredPayloadIds.map((id) => ({
    id,
    name: findSubsystemById(id)?.name[language] ?? id,
    equipped: selection.payloadIds.includes(id),
  }));

  return (
    <div
      data-astra-zone="MISSION"
      className={`transition-all ${
        highlightMission
          ? 'border border-[#FFC15E] bg-[#FFC15E]/5 p-2.5 shadow-[0_0_24px_rgba(255,193,94,0.18)]'
          : ''
      }`}
    >
      {phase === 'CML_1' && level1TutorialStep === 3 && (
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#FFC15E]" />
          <span>
            {isEs
              ? 'PASO ACTIVO · ELIGE UNA MISIÓN'
              : 'ACTIVE STEP · CHOOSE A MISSION'}
          </span>
        </div>
      )}

      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[12px] font-semibold tracking-[0.16em] text-slate-300 uppercase">
          {isEs ? 'PASO 2 · MISIÓN' : 'STEP 2 · MISSION'}
        </span>
        <span className="font-mono text-[12px] text-[#FFC15E] font-bold">
          ${activeObj.baseBudgetMillions}M
        </span>
      </div>

      {/* Pestañas limpias de la columna derecha */}
      <div className="mb-2.5 grid grid-cols-3 gap-1.5 border-b border-[#5FF3FF]/15 pb-2 font-mono text-[11px] tracking-[0.08em] uppercase">
        {(
          [
            ['CONTRACTS', isEs ? 'CONTRATOS' : 'CONTRACTS'],
            ['STATEMENT', isEs ? 'MISIÓN' : 'MISSION'],
            ['BENCHMARK', isEs ? 'OBJETIVOS' : 'TARGETS'],
          ] as const
        ).map(([tabKey, label]) => {
          const activeTab = rightTab === tabKey;
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setRightTab(tabKey);
              }}
              className={`border py-1 text-center transition ${
                activeTab
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-[#5FF3FF] font-bold'
                  : 'border-[#5FF3FF]/15 bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {rightTab === 'STATEMENT' && (
        <div className="space-y-2.5">
          <label className="block border border-[#5FF3FF]/25 bg-[#04080F]/70 p-2.5 focus-within:border-[#5FF3FF]">
            <span className="font-mono text-[11px] tracking-[0.12em] text-[#5FF3FF] uppercase">
              {isEs ? 'ENUNCIADO DE SERVILLETA (CONCEPTO)' : 'NAPKIN MISSION STATEMENT'}
            </span>
            <textarea
              id="napkin-mission-statement"
              name="missionStatement"
              rows={3}
              maxLength={140}
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              className="mt-1.5 w-full resize-none bg-transparent text-[13px] leading-snug text-slate-100 outline-none"
            />
          </label>
          <div className="font-mono text-[12px] text-slate-400">
            {isEs ? 'Misión activa:' : 'Active mission:'}{' '}
            <span className="text-[#5FF3FF]">{activeObj.title[language]}</span>
          </div>
        </div>
      )}

      {rightTab === 'CONTRACTS' && (
        <div className="space-y-2.5">
          {SCIENCE_OBJECTIVES.map((obj) => {
            const active = selection.objectiveId === obj.id;
            const pulsing = !reducedMotion && justPickedId === obj.id;
            const contract = CAMPAIGN_CONTRACTS.find((c) => c.objectiveId === obj.id);
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => {
                  setObjective(obj.id);
                  triggerPickFeedback(obj.id);
                  if (level1TutorialStep <= 3) {
                    setLevel1TutorialStep(4);
                  }
                  playHoloTone('STEP', soundEnabled);
                  appendDecisionLog({
                    phase: 'CML_1',
                    label: {
                      en: `Mission set: ${obj.title.en}`,
                      es: `Misión fijada: ${obj.title.es}`,
                    },
                    impact: 'POSITIVE',
                  });
                }}
                className={`w-full border p-3 text-left transition-all duration-300 ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_18px_rgba(95,243,255,0.16)]'
                    : 'border-[#5FF3FF]/20 bg-transparent hover:border-[#5FF3FF]/50'
                } ${pulsing ? 'ring-2 ring-[#FFC15E]' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[12px] tracking-[0.1em] uppercase">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#5FF3FF] truncate">{DISCIPLINES[obj.discipline][language]}</span>
                    {contract && (
                      <span className="shrink-0 rounded border border-[#5FF3FF]/35 bg-[#5FF3FF]/10 px-1.5 text-[10px] text-[#5FF3FF]">
                        {contract.code}
                      </span>
                    )}
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#5FF3FF]" />}
                  </div>
                  <span className="shrink-0 text-[#FFC15E] font-bold">${obj.baseBudgetMillions}M</span>
                </div>
                <div className="mt-1 text-[13.5px] font-light leading-snug text-slate-100">
                  {obj.title[language]}
                </div>
                {active && (
                  <div className="mt-2 space-y-1.5 border-t border-[#5FF3FF]/15 pt-2">
                    {experienceMode === 'CADET' ? (
                      <>
                        <p className="text-[12px] leading-snug text-slate-300">
                          {obj.question[language]}
                        </p>
                        {obj.cadetChallenge && (
                          <div className="border-l-2 border-[#5FF3FF] bg-[#5FF3FF]/5 pl-2.5 py-1 text-[12px] leading-snug text-slate-200">
                            <span className="font-mono text-[11px] tracking-wider text-[#5FF3FF] uppercase">
                              {isEs ? '◈ RETO: ' : '◈ CHALLENGE: '}
                            </span>
                            {obj.cadetChallenge[language]}
                          </div>
                        )}
                        <p className="border-l-2 border-[#5FF3FF]/40 pl-2.5 text-[12px] leading-snug text-[#5FF3FF]">
                          // {obj.realWorldBenchmark.keyTakeaway[language]}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="font-mono text-[11px] text-slate-400">
                          TARGET {obj.targetDestinationId.toUpperCase()} · ≥{obj.minDataRateKbps} KBPS · {obj.targetDurationYears}Y · REF: {obj.realWorldBenchmark.actualMass_kg}kg / {obj.realWorldBenchmark.actualPower_W}W / ${obj.realWorldBenchmark.actualCost_MillionsUSD}M
                        </div>
                        {obj.jplConstraints && (
                          <div className="border-l-2 border-[#FFC15E] bg-[#FFC15E]/8 pl-2.5 py-1 text-[12px] leading-snug text-slate-200">
                            <span className="font-mono text-[11px] tracking-wider text-[#FFC15E] uppercase">
                              {isEs ? '◆ RESTRICCIÓN JPL: ' : '◆ JPL CONSTRAINT: '}
                            </span>
                            {obj.jplConstraints[language]}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {rightTab === 'BENCHMARK' && (
        <div className="space-y-2.5 font-mono text-[12px] tracking-[0.06em] text-slate-300 uppercase">
          <div className="border border-[#5FF3FF]/20 bg-[#04080F]/80 p-2.5">
            <div className="text-[11px] text-slate-400">BENCHMARK</div>
            <div className="mt-0.5 text-[13px] text-[#FFC15E]">
              {activeObj.realWorldBenchmark.missionName}
            </div>
            <div className="mt-1 text-[12px] normal-case text-slate-300">
              {activeObj.realWorldBenchmark.keyTakeaway[language]}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reqPayloads.map((rp) => (
              <span
                key={rp.id}
                className={`inline-flex items-center gap-1 border px-2 py-1 text-[11px] ${
                  rp.equipped
                    ? 'border-[#5FF3FF]/45 text-[#5FF3FF]'
                    : 'border-[#FFC15E]/50 text-[#FFC15E]'
                }`}
              >
                <span>{isEs ? 'INSTRUMENTO:' : 'PAYLOAD:'} {rp.name}</span>
                {rp.equipped ? (
                  <Check className="h-3.5 w-3.5 text-[#5FF3FF]" />
                ) : (
                  <span className="text-[10px] opacity-80">{isEs ? '(EN CML 3)' : '(IN CML 3)'}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
