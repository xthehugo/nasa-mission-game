import { findObjectiveById, getSubsystemsByCategory, SCIENCE_OBJECTIVES } from '../engine';
import { useMissionStore, type CubeSatFormFactor } from '../store';
import type { ScienceDiscipline } from '../types/mission';
import { playHoloTone } from './holoAudio';

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
    cubesatFormFactor,
    selection,
    soundEnabled,
    setCubesatFormFactor,
    setSubsystem,
    setObjective,
    appendDecisionLog,
  } = useMissionStore();

  const isEs = language === 'es';
  const epsOptions = getSubsystemsByCategory('EPS');

  if (zone === 'LEFT') {
    return (
      <div className="space-y-4">
        <div>
          <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
            {isEs ? 'PASO 1 · CHASIS' : 'STEP 1 · CHASSIS'}
          </div>
          <div className="space-y-1">
            {CHASSIS_OPTS.map((ch) => {
              const active = cubesatFormFactor === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setCubesatFormFactor(ch.id);
                    playHoloTone('STEP', soundEnabled);
                  }}
                  className={`w-full border-l-2 px-3 py-2 text-left transition ${
                    active
                      ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_18px_rgba(95,243,255,0.14)]'
                      : 'border-[#5FF3FF]/15 hover:border-[#5FF3FF]/50 hover:bg-[#5FF3FF]/5'
                  }`}
                >
                  <div className="text-lg font-light tracking-tight text-white">{ch.id}</div>
                  <div className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase">
                    {ch.sub[language]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
            {isEs ? 'PANELES SOLARES / EPS' : 'SOLAR ARRAYS / EPS'}
          </div>
          <div className="space-y-1.5">
            {epsOptions.map((opt) => {
              const active = selection.epsId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSubsystem('EPS', opt.id);
                    playHoloTone('STEP', soundEnabled);
                  }}
                  className={`flex w-full items-center justify-between border px-3 py-2 text-left transition ${
                    active
                      ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white'
                      : 'border-[#5FF3FF]/20 text-slate-300 hover:border-[#5FF3FF]/50'
                  }`}
                >
                  <span className="text-[11px] font-light">{opt.name[language]}</span>
                  <span className="font-mono text-[10px] text-[#FFC15E]">+{opt.powerGenerated1AU_W}W</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeObj = findObjectiveById(selection.objectiveId);

  return (
    <div className="space-y-2.5">
      <div className="font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
        {isEs ? 'PASO 2 · MISIÓN' : 'STEP 2 · MISSION'}
      </div>
      <div className="space-y-2">
        {SCIENCE_OBJECTIVES.map((obj) => {
          const active = selection.objectiveId === obj.id;
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => {
                setObjective(obj.id);
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
                <span className="text-[#5FF3FF]">{DISCIPLINES[obj.discipline][language]}</span>
                <span className="text-[#FFC15E]">${obj.baseBudgetMillions}M</span>
              </div>
              <div className="mt-1 text-xs font-light leading-snug text-slate-100">
                {obj.title[language]}
              </div>
              {experienceMode === 'JPL_ENGINEER' && (
                <div className="mt-1.5 font-mono text-[9px] text-slate-400">
                  TARGET {obj.targetDestinationId.toUpperCase()} · ≥{obj.minDataRateKbps} KBPS
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="border-t border-[#5FF3FF]/15 pt-2 font-mono text-[9px] tracking-[0.12em] text-slate-400 uppercase">
        BENCHMARK: <span className="text-[#FFC15E]">{activeObj.realWorldBenchmark.missionName}</span>
      </div>
    </div>
  );
}
