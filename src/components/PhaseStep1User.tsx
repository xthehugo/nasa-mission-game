import { useState } from 'react';
import { ArrowLeft, Check, Info } from 'lucide-react';
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
  const epsOptions = getSubsystemsByCategory('EPS');
  const highlightChassis =
    (phase === 'CML_1' && level1TutorialStep === 1) || robotHoverZone === 'CHASSIS';
  const highlightEps =
    (phase === 'CML_1' && level1TutorialStep === 2) || robotHoverZone === 'EPS';
  const highlightMission =
    (phase === 'CML_1' && level1TutorialStep === 3) || robotHoverZone === 'MISSION';

  if (zone === 'LEFT') {
    return (
      <div className="space-y-4">
        <div
          data-astra-zone="CHASSIS"
          className={`transition-all ${
            highlightChassis
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2.5 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
          }`}
        >
          {phase === 'CML_1' && level1TutorialStep === 1 && (
            <div className="mb-2 border border-[#FFC15E] bg-[#FFC15E]/15 px-2 py-1 font-mono text-[9.5px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5 animate-pulse">
              <ArrowLeft className="h-3 w-3 text-[#FFC15E]" />
              <span>
                {isEs
                  ? 'PASO 2/5: HAZ CLIC EN UN CHASIS PARA PROBAR EL PLANO'
                  : 'STEP 2/5: CLICK ANY CHASSIS TO TEST THE BLUEPRINT'}
              </span>
            </div>
          )}
          <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
            <span className="text-slate-400">{isEs ? 'PASO 1 · CHASIS' : 'STEP 1 · CHASSIS'}</span>
            <span className={metrics.volume.isCompliant ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
              {metrics.volume.used_U.toFixed(1)}U / {metrics.volume.maxFairing_U}U
            </span>
          </div>
          <div className="space-y-1.5">
            {CHASSIS_OPTS.map((ch) => {
              const active = cubesatFormFactor === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setCubesatFormFactor(ch.id);
                    if (level1TutorialStep <= 1) {
                      setLevel1TutorialStep(2);
                    }
                    playHoloTone('STEP', soundEnabled);
                  }}
                  className={`w-full flex items-center gap-3 border-l-2 p-2 text-left transition ${
                    active
                      ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 shadow-[0_0_18px_rgba(95,243,255,0.18)] text-white'
                      : 'border-[#5FF3FF]/20 bg-[#04080F]/60 text-slate-300 hover:border-[#5FF3FF]/50 hover:bg-[#5FF3FF]/5'
                  }`}
                >
                  <SubsystemHoloGraphic id={ch.id} size="sm" isSelected={active} className="h-10 w-10 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-tight text-white flex items-center gap-2">
                      <span>{ch.id}</span>
                      {active && (
                        <span className="font-mono text-[8px] bg-[#5FF3FF]/20 text-[#5FF3FF] px-1 py-0.2 rounded border border-[#5FF3FF]/40">
                          {isEs ? 'SELECCIONADO' : 'SELECTED'}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase mt-0.5">
                      {ch.sub[language]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          data-astra-zone="EPS"
          className={`transition-all ${
            highlightEps
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2.5 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
          }`}
        >
          {phase === 'CML_1' && level1TutorialStep === 2 && (
            <div className="mb-2 border border-[#FFC15E] bg-[#FFC15E]/15 px-2 py-1 font-mono text-[9.5px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5 animate-pulse">
              <ArrowLeft className="h-3 w-3 text-[#FFC15E]" />
              <span>
                {isEs
                  ? 'PASO 3/5: HAZ CLIC EN UN SISTEMA DE ENERGÍA SOLAR / EPS'
                  : 'STEP 3/5: CLICK ANY SOLAR / EPS POWER SYSTEM'}
              </span>
            </div>
          )}
          <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
            {isEs ? 'PANELES SOLARES / EPS' : 'SOLAR ARRAYS / EPS'}
          </div>
          <div className="space-y-1.5">
            {epsOptions.map((opt) => {
              const active = selection.epsId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`flex items-stretch border transition ${
                    active
                      ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white shadow-[0_0_12px_rgba(95,243,255,0.15)]'
                      : 'border-[#5FF3FF]/20 bg-[#04080F]/70 text-slate-300 hover:border-[#5FF3FF]/50'
                  }`}
                >
                  {/* Holographic Thumbnail */}
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingEps(opt);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    title={isEs ? 'Ver diseño holográfico y detalles' : 'View holographic design & details'}
                    className="p-1.5 shrink-0 bg-[#02050B]/90 flex items-center justify-center border-r border-[#5FF3FF]/15 hover:bg-[#5FF3FF]/15 transition cursor-pointer"
                  >
                    <SubsystemHoloGraphic id={opt.id} size="sm" isSelected={active} className="h-10 w-10" />
                  </button>

                  {/* Main Equip Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubsystem('EPS', opt.id);
                      if (level1TutorialStep <= 2) {
                        setLevel1TutorialStep(3);
                      }
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="flex-1 p-2 text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-medium text-white">{opt.name[language]}</span>
                        {active && (
                          <span className="font-mono text-[8px] bg-[#5FF3FF]/20 text-[#5FF3FF] px-1 py-0.2 rounded border border-[#5FF3FF]/40">
                            {isEs ? 'ACTIVO' : 'ACTIVE'}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#FFC15E]">+{opt.powerGenerated1AU_W}W</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>{opt.massCBE_kg}kg · ${opt.cost_MillionsUSD}M</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingEps(opt);
                          playHoloTone('STEP', soundEnabled);
                        }}
                        className="text-[#5FF3FF] hover:underline flex items-center gap-0.5"
                      >
                        <Info className="h-2.5 w-2.5" />
                        <span>INFO</span>
                      </button>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
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
      className={`space-y-2.5 transition-all ${
        highlightMission
          ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2.5 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
          : ''
      }`}
    >
      {phase === 'CML_1' && level1TutorialStep === 3 && (
        <div className="border border-[#FFC15E] bg-[#FFC15E]/15 px-2 py-1 font-mono text-[9.5px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5 animate-pulse">
          <ArrowLeft className="h-3 w-3 text-[#FFC15E]" />
          <span>
            {isEs
              ? 'PASO 4/5: HAZ CLIC EN UNA MISIÓN CIENTÍFICA PARA TU NAVE'
              : 'STEP 4/5: CLICK A SCIENCE MISSION FOR YOUR SPACECRAFT'}
          </span>
        </div>
      )}
      <div className="font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
        {isEs ? 'PASO 2 · MISIÓN' : 'STEP 2 · MISSION'}
      </div>

      {/* Editable Napkin Mission Statement */}
      <label className="block border border-[#5FF3FF]/25 bg-[#04080F]/70 p-2.5 focus-within:border-[#5FF3FF]">
        <span className="font-mono text-[9px] tracking-[0.14em] text-[#5FF3FF] uppercase">
          {isEs ? 'ENUNCIADO DE SERVILLETA (CONCEPTO)' : 'NAPKIN MISSION STATEMENT'}
        </span>
        <textarea
          id="napkin-mission-statement"
          name="missionStatement"
          rows={2}
          maxLength={140}
          value={missionStatement}
          onChange={(e) => setMissionStatement(e.target.value)}
          className="mt-1 w-full resize-none bg-transparent text-[11px] leading-snug text-slate-100 outline-none"
        />
      </label>

      <div className="space-y-2">
        {SCIENCE_OBJECTIVES.map((obj) => {
          const active = selection.objectiveId === obj.id;
          const contract = CAMPAIGN_CONTRACTS.find((c) => c.objectiveId === obj.id);
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => {
                setObjective(obj.id);
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
              className={`w-full border p-3 text-left transition ${
                active
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_18px_rgba(95,243,255,0.16)]'
                  : 'border-[#5FF3FF]/20 bg-transparent hover:border-[#5FF3FF]/55'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#5FF3FF]">{DISCIPLINES[obj.discipline][language]}</span>
                  {contract && (
                    <span className="font-mono text-[7.5px] border border-[#5FF3FF]/40 bg-[#5FF3FF]/15 px-1 py-0.2 rounded text-[#5FF3FF]">
                      {contract.code}
                    </span>
                  )}
                  {active && (
                    <span className="font-mono text-[8px] bg-[#10B981]/20 text-[#10B981] px-1 py-0.2 rounded border border-[#10B981]/40 font-bold">
                      {isEs ? '✓ SINCRONIZADA' : '✓ SYNCHRONIZED'}
                    </span>
                  )}
                </div>
                <span className="text-[#FFC15E] font-bold">${obj.baseBudgetMillions}M</span>
              </div>
              <div className="mt-1 text-xs font-light leading-snug text-slate-100">
                {obj.title[language]}
              </div>
              {experienceMode === 'CADET' ? (
                <div className="mt-1.5 space-y-1">
                  <p className="text-[10.5px] leading-snug text-slate-400">
                    {obj.question[language]}
                  </p>
                  {active && obj.cadetChallenge && (
                    <div className="border-l-2 border-[#5FF3FF] bg-[#5FF3FF]/5 pl-2 py-1 text-[10px] leading-snug text-slate-200">
                      <span className="font-mono text-[8.5px] tracking-wider text-[#5FF3FF] uppercase">
                        {isEs ? '◈ RETO FÍSICO CADETE: ' : '◈ CADET CHALLENGE: '}
                      </span>
                      {obj.cadetChallenge[language]}
                    </div>
                  )}
                  {active && (
                    <p className="border-l-2 border-[#5FF3FF]/40 pl-2 text-[10px] leading-snug text-[#5FF3FF]">
                      // {obj.realWorldBenchmark.keyTakeaway[language]}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-1.5 space-y-1">
                  <div className="font-mono text-[9px] text-slate-400">
                    TARGET {obj.targetDestinationId.toUpperCase()} · ≥{obj.minDataRateKbps} KBPS · {obj.targetDurationYears}Y · REF: {obj.realWorldBenchmark.actualMass_kg}kg / {obj.realWorldBenchmark.actualPower_W}W / ${obj.realWorldBenchmark.actualCost_MillionsUSD}M
                  </div>
                  {active && obj.jplConstraints && (
                    <div className="border-l-2 border-[#FFC15E] bg-[#FFC15E]/8 pl-2 py-1 text-[10px] leading-snug text-slate-200">
                      <span className="font-mono text-[8.5px] tracking-wider text-[#FFC15E] uppercase">
                        {isEs ? '◆ RESTRICCIÓN JPL: ' : '◆ JPL CONSTRAINT: '}
                      </span>
                      {obj.jplConstraints[language]}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="space-y-1.5 border-t border-[#5FF3FF]/15 pt-2 font-mono text-[9px] tracking-[0.12em] text-slate-400 uppercase">
        <div>
          BENCHMARK: <span className="text-[#FFC15E]">{activeObj.realWorldBenchmark.missionName}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {reqPayloads.map((rp) => (
            <span
              key={rp.id}
              className={`inline-flex items-center gap-1 border px-1.5 py-0.5 ${
                rp.equipped
                  ? 'border-[#5FF3FF]/45 text-[#5FF3FF]'
                  : 'border-[#FFC15E]/50 text-[#FFC15E]'
              }`}
            >
              <span>{isEs ? 'INSTRUMENTO:' : 'PAYLOAD:'} {rp.name}</span>
              {rp.equipped ? (
                <Check className="h-3 w-3 text-[#5FF3FF]" />
              ) : (
                <span className="text-[8px] opacity-80">{isEs ? '(EN CML 3)' : '(IN CML 3)'}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
