import { findObjectiveById } from '../engine';
import { useMissionStore } from '../store';
import { computeLevelStars, playHoloTone } from './holoAudio';

export function FlightSimulationPanel({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    experienceMode,
    selection,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    resolvedCrises,
    simulationResult,
    soundEnabled,
    resolveCrisis,
    setCertificateOpen,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const objective = findObjectiveById(selection.objectiveId);
  const starInfo = computeLevelStars(
    metrics,
    concurrentConflicts.length,
    experienceMode,
    activeRandomEvent,
  );

  if (!simulationResult) return null;

  if (zone === 'LEFT') {
    return (
      <div className="space-y-3">
        <div className="border border-[#FFC15E]/50 p-3 text-center">
          <div className="font-mono text-[9.5px] tracking-[0.16em] text-[#FFC15E] uppercase">
            {isEs ? 'CALIFICACIÓN FINAL & ESTRELLAS' : 'FINAL GRADE & STARS'}
          </div>
          <div className="mt-1 text-3xl font-light text-white">
            {simulationResult.overallGrade} · {simulationResult.scienceScore}/100
          </div>
          <div className="mt-1 font-mono text-sm tracking-[0.25em] text-[#FFC15E]">
            {'★'.repeat(starInfo.stars)}{'☆'.repeat(3 - starInfo.stars)}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
            {isEs ? 'BITÁCORA DE VUELO (5 FASES)' : '5-PHASE FLIGHT LOG'}
          </div>
          {simulationResult.events.map((evt) => (
            <div
              key={evt.id}
              className={`border p-2 text-[11px] ${
                evt.severity === 'CRITICAL'
                  ? 'border-[#FF4D6D]/50 text-[#FF4D6D]'
                  : evt.severity === 'WARNING'
                    ? 'border-[#FFC15E]/40 text-[#FFC15E]'
                    : 'border-[#5FF3FF]/20 text-slate-200'
              }`}
            >
              <div className="flex justify-between font-mono text-[9px] uppercase">
                <span>T+{evt.timestampMissionDays}D · {evt.title[language]}</span>
                <span>{evt.telemetrySnapshot.propellantRemainingPct}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-[#5FF3FF]/20 p-2.5 font-mono text-[9.5px] text-slate-300">
          <div className="text-[#FFC15E] uppercase">BENCHMARK: {objective.realWorldBenchmark.missionName}</div>
          <div className="mt-1">
            {isEs ? 'MASA' : 'MASS'} {metrics.dryMass.predicted.toFixed(1)} / {objective.realWorldBenchmark.actualMass_kg} KG · ${metrics.cost.totalMillionsUSD.toFixed(1)}M
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase">
        <span className="text-[#FFC15E]">
          {isEs ? 'CRISIS ORBITALES (3)' : 'ORBITAL CRISES (3)'}
        </span>
        <span className="text-slate-400">
          {isCadet ? (isEs ? 'PISTAS ON' : 'HINTS ON') : isEs ? 'SIN PISTAS' : 'BLIND CMD'}
        </span>
      </div>

      <div className="space-y-2.5">
        {simulationResult.dilemmas.map((dilemma) => {
          const chosenId = resolvedCrises[dilemma.id];
          const hasDecided = Boolean(chosenId);
          const chosenOpt = dilemma.options.find((o) => o.id === chosenId) ?? null;

          return (
            <div key={dilemma.id} className="border border-[#5FF3FF]/25 p-2.5">
              <div className="flex items-center justify-between font-mono text-[9.5px]">
                <span className="text-white">T+{dilemma.missionDay}D · {dilemma.title[language]}</span>
                <span className={hasDecided ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
                  {hasDecided ? 'OK' : isEs ? 'ALERTA' : 'ALERT'}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-light text-slate-300">{dilemma.situation[language]}</p>
              <div className="mt-2 space-y-1.5">
                {dilemma.options.map((opt) => {
                  const selected = chosenId === opt.id;
                  const showHint = isCadet || hasDecided;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        resolveCrisis(dilemma.id, opt.id);
                        playHoloTone(opt.isOptimal ? 'STAR' : 'ALARM', soundEnabled);
                      }}
                      className={`w-full border p-2 text-left text-[11px] transition ${
                        selected
                          ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white'
                          : 'border-[#5FF3FF]/20 text-slate-300 hover:border-[#5FF3FF]/50'
                      }`}
                    >
                      <div className="font-mono text-[10px]">{opt.label[language]}</div>
                      {showHint && (
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {opt.engineeringJustification[language]}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {chosenOpt && (
                <div className={`mt-1.5 font-mono text-[9.5px] ${chosenOpt.isOptimal ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}`}>
                  {chosenOpt.outcomeNarrative[language]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          playHoloTone('STAR', soundEnabled);
          setCertificateOpen(true);
        }}
        className="w-full border border-[#FFC15E] bg-[#FFC15E]/15 py-2.5 font-mono text-[10px] tracking-[0.16em] text-[#FFC15E] uppercase hover:bg-[#FFC15E]/25"
      >
        {isEs ? 'VER CERTIFICADO ORBITAL FORGE Y MEDALLAS' : 'OPEN MISSION CERTIFICATE & MEDALS'}
      </button>
    </div>
  );
}
