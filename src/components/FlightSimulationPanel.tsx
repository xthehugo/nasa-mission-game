import { useEffect, useState } from 'react';
import { CAMPAIGN_CONTRACTS, findObjectiveById } from '../engine';
import { useMissionStore } from '../store';
import { computeLevelStars, playHoloTone } from './holoAudio';

export function FlightSimulationPanel({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    experienceMode,
    selection,
    metrics,
    scores,
    concurrentConflicts,
    activeRandomEvent,
    resolvedCrises,
    simulationResult,
    soundEnabled,
    hullIntegrity,
    resolveCrisis,
    appendDecisionLog,
    setCertificateOpen,
    damageHull,
    repairHull,
    addXP,
    recordContractResult,
  } = useMissionStore();

  const [crisisTimer, setCrisisTimer] = useState(15);
  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const objective = findObjectiveById(selection.objectiveId);
  const starInfo = computeLevelStars(
    metrics,
    concurrentConflicts.length,
    experienceMode,
    activeRandomEvent,
  );

  const resolvedCount = simulationResult
    ? simulationResult.dilemmas.filter((d) => Boolean(resolvedCrises[d.id])).length
    : 0;

  // Emergency countdown timer for active unresolved flight crises
  useEffect(() => {
    if (!simulationResult || resolvedCount >= simulationResult.dilemmas.length) return;

    const interval = setInterval(() => {
      setCrisisTimer((prev) => {
        if (prev <= 1) {
          damageHull(25);
          playHoloTone('ALARM', soundEnabled);
          const firstUnresolved = simulationResult.dilemmas.find((d) => !resolvedCrises[d.id]);
          if (firstUnresolved) {
            const fallbackOpt =
              firstUnresolved.options.find((o) => !o.isOptimal) ?? firstUnresolved.options[0];
            resolveCrisis(firstUnresolved.id, fallbackOpt.id);
            appendDecisionLog({
              phase: 'SIMULATION',
              label: {
                en: `Emergency timeout on crisis ${firstUnresolved.title.en}: Hull damaged (-25%).`,
                es: `Tiempo límite de emergencia en crisis ${firstUnresolved.title.es}: Casco dañado (-25%).`,
              },
              impact: 'CRITICAL',
            });
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    resolvedCount,
    simulationResult,
    resolvedCrises,
    soundEnabled,
    damageHull,
    resolveCrisis,
    appendDecisionLog,
  ]);

  if (!simulationResult) return null;

  const handleAutoSolveCrises = () => {
    simulationResult.dilemmas.forEach((dilemma) => {
      if (resolvedCrises[dilemma.id]) return;
      const optimal = dilemma.options.find((opt) => opt.isOptimal) ?? dilemma.options[0];
      if (optimal) {
        resolveCrisis(dilemma.id, optimal.id);
      }
    });
    repairHull(20);
    addXP(100);
    playHoloTone('STAR', soundEnabled);
    appendDecisionLog({
      phase: 'SIMULATION',
      label: {
        en: 'Executed optimal contingency playbook for all flight crises (+100 XP, +20% Hull).',
        es: 'Ejecutado plan óptimo de contingencia para todas las crisis (+100 XP, +20% Casco).',
      },
      impact: 'POSITIVE',
    });
  };

  const handleOpenCertificate = () => {
    const matchingContract =
      CAMPAIGN_CONTRACTS.find(
        (c) => c.objectiveId === selection.objectiveId || c.presetKey === selection.objectiveId,
      ) ?? CAMPAIGN_CONTRACTS[0];

    recordContractResult(matchingContract.id, starInfo.stars, simulationResult.overallGrade);
    addXP(matchingContract.rewardXP);
    playHoloTone('STAR', soundEnabled);
    setCertificateOpen(true);
  };

  if (zone === 'LEFT') {
    return (
      <div className="space-y-3 font-mono">
        {/* Hull Integrity Health Bar */}
        <div className="border border-[#5FF3FF]/40 bg-[#07172C]/90 p-3 rounded space-y-1.5">
          <div className="flex justify-between items-center text-[10px] uppercase">
            <span className="text-slate-300 font-bold">
              {isEs ? '🛡️ INTEGRIDAD DE CASCO' : '🛡️ SPACECRAFT HULL'}
            </span>
            <span
              className={`font-black ${
                hullIntegrity > 50
                  ? 'text-[#5FF3FF]'
                  : hullIntegrity > 25
                    ? 'text-[#FFC15E]'
                    : 'text-[#FF4D6D] animate-pulse'
              }`}
            >
              {hullIntegrity}% {hullIntegrity <= 25 ? '⚠️ BREACH RISK' : ''}
            </span>
          </div>
          <div className="w-full bg-[#04080F] h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                hullIntegrity > 50
                  ? 'bg-gradient-to-r from-[#5FF3FF] to-[#38BDF8]'
                  : hullIntegrity > 25
                    ? 'bg-gradient-to-r from-[#FFC15E] to-amber-500'
                    : 'bg-gradient-to-r from-[#FF4D6D] to-red-600'
              }`}
              style={{ width: `${hullIntegrity}%` }}
            />
          </div>
        </div>

        {/* Final Grade & Stars */}
        <div className="border border-[#FFC15E]/50 p-3 text-center bg-[#0B1528]/80 rounded">
          <div className="text-[9.5px] tracking-[0.16em] text-[#FFC15E] uppercase">
            {isEs ? 'CALIFICACIÓN FINAL & ESTRELLAS' : 'FINAL GRADE & STARS'}
          </div>
          <div className="mt-1 text-3xl font-light text-white">
            {simulationResult.overallGrade} · {simulationResult.scienceScore}/100
          </div>
          <div className="mt-1 text-sm tracking-[0.25em] text-[#FFC15E]">
            {'★'.repeat(starInfo.stars)}
            {'☆'.repeat(3 - starInfo.stars)}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1 border-t border-[#FFC15E]/20 pt-2 text-[9px] text-slate-300">
            <div>S:{scores.scienceReturnScore}</div>
            <div>M:{scores.engineeringMarginScore}</div>
            <div>B:{scores.budgetEfficiencyScore}</div>
            <div className="text-[#5FF3FF]">P:{scores.compositeGlobalScore}</div>
          </div>
          <button
            type="button"
            onClick={handleOpenCertificate}
            className="mt-2.5 w-full border border-[#FFC15E]/70 bg-[#FFC15E]/10 py-1.5 text-[9.5px] tracking-[0.14em] text-[#FFC15E] uppercase transition hover:bg-[#FFC15E]/20 rounded"
          >
            {isEs ? 'CERTIFICADO & RECOMPENSAS XP →' : 'CERTIFICATE & XP REWARDS →'}
          </button>
        </div>

        {/* 5-Phase Flight Log */}
        <div className="space-y-1.5">
          <div className="text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
            {isEs ? 'BITÁCORA DE VUELO (5 FASES)' : '5-PHASE FLIGHT LOG'}
          </div>
          {simulationResult.events.map((evt) => (
            <div
              key={evt.id}
              className={`border p-2 text-[11px] rounded ${
                evt.severity === 'CRITICAL'
                  ? 'border-[#FF4D6D]/50 text-[#FF4D6D] bg-[#FF4D6D]/5'
                  : evt.severity === 'WARNING'
                    ? 'border-[#FFC15E]/40 text-[#FFC15E] bg-[#FFC15E]/5'
                    : 'border-[#5FF3FF]/20 text-slate-200 bg-[#5FF3FF]/5'
              }`}
            >
              <div className="flex justify-between text-[9px] uppercase">
                <span>
                  T+{evt.timestampMissionDays}D · {evt.title[language]}
                </span>
                <span>{evt.telemetrySnapshot.propellantRemainingPct}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-[#5FF3FF]/20 p-2.5 text-[9.5px] text-slate-300 rounded bg-[#04080F]/60">
          <div className="text-[#FFC15E] uppercase">
            BENCHMARK: {objective.realWorldBenchmark.missionName}
          </div>
          <div className="mt-1">
            {isEs ? 'MASA' : 'MASS'} {metrics.dryMass.predicted.toFixed(1)} /{' '}
            {objective.realWorldBenchmark.actualMass_kg} KG · ${metrics.cost.totalMillionsUSD.toFixed(1)}M
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      {/* Orbital Crises Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase">
        <span className="text-[#FFC15E] font-bold">
          {isEs
            ? `⚡ CRISIS ORBITALES (${resolvedCount}/${simulationResult.dilemmas.length})`
            : `⚡ ORBITAL CRISES (${resolvedCount}/${simulationResult.dilemmas.length})`}
        </span>
        <div className="flex items-center gap-2">
          {resolvedCount < simulationResult.dilemmas.length && (
            <button
              type="button"
              onClick={handleAutoSolveCrises}
              className="border border-[#5FF3FF]/60 bg-[#5FF3FF]/10 px-2 py-0.5 text-[9px] tracking-[0.12em] text-[#5FF3FF] uppercase transition hover:bg-[#5FF3FF]/20 rounded"
            >
              {isEs ? 'AUTO-RESOLVER 3/3 (DEMO)' : 'AUTO-SOLVE 3/3 (DEMO)'}
            </button>
          )}
          <span className="text-slate-400">
            {isCadet ? (isEs ? 'PISTAS ON' : 'HINTS ON') : isEs ? 'SIN PISTAS' : 'BLIND CMD'}
          </span>
        </div>
      </div>

      {/* Emergency Countdown Banner */}
      {resolvedCount < simulationResult.dilemmas.length && (
        <div
          className={`p-2.5 rounded border text-xs flex items-center justify-between ${
            crisisTimer <= 5
              ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-[#FF4D6D] animate-pulse'
              : 'bg-[#FFC15E]/10 border-[#FFC15E]/40 text-[#FFC15E]'
          }`}
        >
          <span className="font-bold">
            ⏱️ {isEs ? 'CUENTA REGRESIVA DE CRISIS:' : 'CRISIS EMERGENCY TIMER:'}
          </span>
          <span className="text-sm font-black tracking-widest">{crisisTimer}s</span>
        </div>
      )}

      {/* Dilemma cards */}
      <div className="space-y-2.5">
        {simulationResult.dilemmas.map((dilemma) => {
          const chosenId = resolvedCrises[dilemma.id];
          const hasDecided = Boolean(chosenId);
          const chosenOpt = dilemma.options.find((o) => o.id === chosenId) ?? null;

          return (
            <div
              key={dilemma.id}
              className={`border p-3 rounded transition-all ${
                hasDecided ? 'border-[#5FF3FF]/40 bg-[#07172C]/40' : 'border-[#FFC15E]/50 bg-[#0B1528]/80'
              }`}
            >
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="text-white font-bold">
                  T+{dilemma.missionDay}D · {dilemma.title[language]}
                </span>
                <span className={hasDecided ? 'text-[#5FF3FF]' : 'text-[#FF4D6D] animate-pulse'}>
                  {hasDecided ? '✓ OK' : isEs ? '⚠️ ALERTA EN VIVO' : '⚠️ LIVE ALERT'}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-light text-slate-300">
                {dilemma.situation[language]}
              </p>

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
                        if (opt.isOptimal) {
                          repairHull(10);
                          addXP(50);
                          playHoloTone('STAR', soundEnabled);
                        } else {
                          damageHull(25);
                          playHoloTone('ALARM', soundEnabled);
                        }
                        setCrisisTimer(15);
                      }}
                      className={`w-full border p-2 text-left text-[11px] rounded transition ${
                        selected
                          ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-white shadow-[0_0_12px_rgba(95,243,255,0.2)]'
                          : 'border-[#5FF3FF]/20 text-slate-300 hover:border-[#5FF3FF]/50 bg-[#04080F]/60'
                      }`}
                    >
                      <div className="font-mono text-[10px] font-bold">{opt.label[language]}</div>
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
                <div
                  className={`mt-2 font-mono text-[9.5px] p-2 rounded ${
                    chosenOpt.isOptimal
                      ? 'text-[#5FF3FF] bg-[#5FF3FF]/10 border border-[#5FF3FF]/20'
                      : 'text-[#FF4D6D] bg-[#FF4D6D]/10 border border-[#FF4D6D]/20'
                  }`}
                >
                  {chosenOpt.outcomeNarrative[language]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleOpenCertificate}
        className="w-full border border-[#FFC15E] bg-[#FFC15E]/15 py-2.5 text-[10px] tracking-[0.16em] text-[#FFC15E] uppercase hover:bg-[#FFC15E]/25 rounded transition font-bold"
      >
        {isEs ? 'VER CERTIFICADO ORBITAL FORGE Y MEDALLAS' : 'OPEN MISSION CERTIFICATE & MEDALS'}
      </button>
    </div>
  );
}
