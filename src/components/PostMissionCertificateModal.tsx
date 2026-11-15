import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Check,
  Copy,
  Download,
  FlaskConical,
  History,
  Medal,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  findObjectiveById,
  getCampaignLevelById,
  getNextCampaignLevel,
} from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';
import { CONTRACT_TO_CINEMATIC } from './narrativeConfig';
import EngineeringHistogramCard from './EngineeringHistogramCard';

export function PostMissionCertificateModal() {
  const {
    language,
    experienceMode,
    commanderName,
    missionCustomName,
    selection,
    metrics,
    scores,
    testing,
    preFlightVerdict,
    resolvedCrises,
    simulationResult,
    decisionLog,
    reducedMotion,
    soundEnabled,
    activeCampaignLevelId,
    campaignProgress,
    playerXP,
    isCertificateOpen,
    setCertificateOpen,
    setActiveCampaignLevelId,
    loadPreset,
    setPhase,
    setCampaignModalOpen,
    openCinematic,
    appendDecisionLog,
  } = useMissionStore();

  const [downloaded, setDownloaded] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const isEs = language === 'es';
  const show = Boolean(isCertificateOpen && simulationResult);
  const activeLevel = getCampaignLevelById(activeCampaignLevelId);
  const nextLevel = getNextCampaignLevel(activeLevel.id);
  const levelProgress = campaignProgress[activeLevel.id];

  const handleGoToNextMission = () => {
    if (!nextLevel) return;
    playHoloTone('STAR', soundEnabled);
    setCertificateOpen(false);
    setActiveCampaignLevelId(nextLevel.id);
    loadPreset(nextLevel.presetKey);
    setPhase('CML_1');
    appendDecisionLog({
      phase: 'CML_1',
      label: {
        en: `Unlocked & started ${nextLevel.code}: ${nextLevel.title.en}`,
        es: `Desbloqueada e iniciada ${nextLevel.code}: ${nextLevel.title.es}`,
      },
      impact: 'POSITIVE',
    });
    const cinematicId = CONTRACT_TO_CINEMATIC[nextLevel.id];
    if (cinematicId) {
      openCinematic(cinematicId);
    } else {
      setCampaignModalOpen(true);
    }
  };

  const objective = findObjectiveById(selection.objectiveId);
  const resolvedCount = simulationResult
    ? simulationResult.dilemmas.filter((d) => Boolean(resolvedCrises[d.id])).length
    : 0;
  const allCrisesOptimal =
    Boolean(simulationResult?.dilemmas.length) &&
    Boolean(
      simulationResult?.dilemmas.every((d) => {
        const chosen = resolvedCrises[d.id];
        return Boolean(d.options.find((o) => o.id === chosen && o.isOptimal));
      }),
    );

  const badges = [
    {
      id: 'swapc',
      earned: metrics.dryMass.marginPercent >= 35 && metrics.power.marginPercent >= 35,
      icon: Award,
      title: { en: 'SWaP-C Balance Master', es: 'Maestro Balance SWaP-C' },
      desc: { en: '≥35% Dry Mass & EPS margin', es: 'Margen ≥35% Masa Seca y EPS' },
    },
    {
      id: 'crisis',
      earned: allCrisesOptimal,
      icon: ShieldCheck,
      title: { en: 'Orbital Crisis Commander', es: 'Comandante Crisis Orbital' },
      desc: { en: 'Solved all 3 flight crises', es: 'Resolvió 3/3 crisis óptimas' },
    },
    {
      id: 'vv',
      earned: preFlightVerdict.passed && testing.rfInhibitTimerMin >= 30,
      icon: FlaskConical,
      title: { en: 'V&V Rigor Specialist', es: 'Rigor Verificación V&V' },
      desc: { en: 'CSLI V&V + RF ≥30 min', es: 'CSLI V&V + RF ≥30 min' },
    },
    {
      id: 'jpl',
      earned:
        experienceMode === 'JPL_ENGINEER' &&
        (simulationResult?.overallGrade === 'S' || simulationResult?.overallGrade === 'A'),
      icon: Rocket,
      title: { en: 'JPL Team X Distinction', es: 'Distinción JPL Team X' },
      desc: { en: 'Grade S/A in Hardcore Mode', es: 'Grado S/A en Modo Hardcore' },
    },
  ];

  const recommendations: { en: string; es: string }[] = [];
  if (metrics.dryMass.marginPercent < 35) {
    recommendations.push({
      en: `Increase Dry Mass margin to ≥35% (currently ${metrics.dryMass.marginPercent.toFixed(1)}%) by scaling the launcher or choosing higher-Isp propulsion.`,
      es: `Eleva el margen de masa seca a ≥35% (actual ${metrics.dryMass.marginPercent.toFixed(1)}%) escalando el lanzador o usando propulsión de mayor Isp.`,
    });
  }
  if (metrics.power.marginPercent < 35) {
    recommendations.push({
      en: `Raise EPS Power margin to ≥35% (currently ${metrics.power.marginPercent.toFixed(1)}%) with deployable arrays or RTG for deep space.`,
      es: `Aumenta el margen eléctrico EPS a ≥35% (actual ${metrics.power.marginPercent.toFixed(1)}%) con alas desplegables o RTG en espacio profundo.`,
    });
  }
  if (!preFlightVerdict.passed || testing.rfInhibitTimerMin < 30) {
    recommendations.push({
      en: 'Complete all 5 environmental V&V checks in CML 5 and keep RF deployment inhibit timer ≥30 min.',
      es: 'Aprueba las 5 pruebas V&V en CML 5 y configura el temporizador de inhibición RF en ≥30 min.',
    });
  }
  if (!allCrisesOptimal) {
    recommendations.push({
      en: 'Review the 3 in-flight crises in Level 06 to select optimal engineering trade-offs.',
      es: 'Revisa las 3 crisis orbitales del Nivel 06 para elegir las respuestas óptimas de ingeniería.',
    });
  }
  if (metrics.cost.reserveMillionsUSD < 0) {
    recommendations.push({
      en: `Eliminate the budget overrun ($${Math.abs(metrics.cost.reserveMillionsUSD).toFixed(1)}M over cap) by trimming lower-priority subsystems.`,
      es: `Elimina el déficit presupuestario ($${Math.abs(metrics.cost.reserveMillionsUSD).toFixed(1)}M sobre tope) optimizando subsistemas.`,
    });
  }

  const buildReportText = () => {
    if (!simulationResult) return '';
    const earnedNames = badges
      .filter((b) => b.earned)
      .map((b) => `- ${b.title[language]} (${b.desc[language]})`)
      .join('\n');
    return [
      'ORBITAL FORGE — MISSION ARCHITECT CERTIFICATE (JPL CML 1-5 EDUCATIONAL STANDARD)',
      `Commander: CMDR ${commanderName} | Mission: ${missionCustomName} | Mode: ${experienceMode}`,
      `Final Grade: ${simulationResult.overallGrade} (Science ${simulationResult.scienceScore}/100, Global P ${scores.compositeGlobalScore} [S:${scores.scienceReturnScore} M:${scores.engineeringMarginScore} B:${scores.budgetEfficiencyScore}])`,
      `Reference Benchmark: ${objective.realWorldBenchmark.missionName}`,
      `Dry Mass: ${metrics.dryMass.predicted.toFixed(1)} kg | Power: ${metrics.power.generatedAtDestination_W.toFixed(1)} W | Cost: $${metrics.cost.totalMillionsUSD.toFixed(1)}M`,
      '',
      'Open-Data Attribution: Grounded in NASA JPL CML, CubeSat 101, NASA GMAT R2026a & CSA open resources (Non-official educational credential).',
      '',
      'Medals Unlocked:',
      earnedNames || '- Mission Participant',
      '',
      'Decision Legacy Log:',
      ...decisionLog.map((entry) => `[${entry.timestamp}] (${entry.phase}) ${entry.label[language]}`),
    ].join('\n');
  };

  const handleCopyReport = () => {
    const text = buildReportText();
    if (!text) return;
    void navigator.clipboard.writeText(text);
    playHoloTone('STEP', soundEnabled);
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1800);
  };

  const handleDownloadCertificate = () => {
    const summaryText = buildReportText();
    if (!summaryText) return;

    try {
      const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ORBITAL-FORGE-${missionCustomName.replace(/\s+/g, '-')}-Certificate.txt`;
      link.click();
      URL.revokeObjectURL(url);
      playHoloTone('STAR', soundEnabled);
      setDownloaded(true);
    } catch (err) {
      console.warn('Unable to download mission certificate file:', err);
    }
  };

  return (
    <AnimatePresence>
      {show && simulationResult && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080F]/90 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={reducedMotion ? false : { scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { scale: 0.97, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#FFC15E]/55 bg-[#04080F] p-6 shadow-[0_0_55px_rgba(255,193,94,0.16)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#5FF3FF]/20 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#FFC15E] uppercase">
                  {isEs
                    ? 'SYS.ARCHIVE // CERTIFICADO DE ARQUITECTO DE MISIÓN (JPL CML)'
                    : 'SYS.ARCHIVE // MISSION ARCHITECT CERTIFICATE (JPL CML)'}
                </div>
                <h2 className="mt-1 text-xl font-light tracking-tight text-white">
                  CMDR {commanderName} · {missionCustomName}
                </h2>
                <p className="mt-1 font-mono text-[11px] tracking-[0.14em] text-[#5FF3FF] uppercase">
                  {experienceMode === 'CADET'
                    ? isEs ? 'Modo Cadete (Historia)' : 'Cadet Story Mode'
                    : isEs ? 'Modo Ingeniero JPL (Hardcore)' : 'JPL Hardcore Mode'}{' '}
                  · {isEs ? 'Calificación' : 'Grade'}:{' '}
                  <strong className="text-[#FFC15E]">{simulationResult.overallGrade}</strong> ({simulationResult.scienceScore}/100)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setCertificateOpen(false);
                }}
                aria-label={isEs ? 'Cerrar certificado' : 'Close certificate'}
                className="border border-[#5FF3FF]/35 bg-[#04080F] p-1.5 text-[#5FF3FF] transition hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Poly Bridge Engineering Histogram & 3-Star Breakdown */}
            <EngineeringHistogramCard
              metrics={metrics}
              benchmark={objective.realWorldBenchmark}
              missionSuccess={simulationResult.missionSuccess}
              scienceScore={simulationResult.scienceScore}
              crisesSolvedCount={resolvedCount}
              totalCrisesCount={simulationResult.dilemmas.length}
              lang={language}
              className="mt-4"
            />

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-3 border p-3 ${
                      b.earned
                        ? 'border-[#FFC15E]/50 bg-[#FFC15E]/10 text-[#FFC15E]'
                        : 'border-[#5FF3FF]/15 bg-[#04080F] text-slate-500 opacity-65'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                        b.earned
                          ? 'border-[#FFC15E]/40 bg-[#FFC15E]/15 text-[#FFC15E]'
                          : 'border-[#5FF3FF]/15 bg-[#04080F] text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase">
                        {b.title[language]}
                      </div>
                      <div className="text-[11px] opacity-85">{b.desc[language]}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border border-[#5FF3FF]/25 bg-[#04080F] p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                <Medal className="h-4 w-4" />
                <span>{isEs ? 'Comparativa NASA Real:' : 'NASA Benchmark:'} {objective.realWorldBenchmark.missionName}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                <div>{isEs ? 'Masa:' : 'Mass:'} {metrics.dryMass.predicted.toFixed(1)} / {objective.realWorldBenchmark.actualMass_kg} kg</div>
                <div>{isEs ? 'Potencia:' : 'Power:'} {metrics.power.generatedAtDestination_W.toFixed(0)} / {objective.realWorldBenchmark.actualPower_W} W</div>
                <div>{isEs ? 'Costo:' : 'Cost:'} ${metrics.cost.totalMillionsUSD.toFixed(1)}M / ${objective.realWorldBenchmark.actualCost_MillionsUSD}M</div>
              </div>
            </div>

            <div className="mt-4 border border-[#FFC15E]/30 bg-[#04080F] p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#FFC15E] uppercase">
                <Sparkles className="h-4 w-4" />
                <span>
                  {isEs
                    ? 'Diagnóstico de Ingeniería · Cómo alcanzar Grado S'
                    : 'Engineering Diagnostic · How to Reach Grade S'}
                </span>
              </div>
              {recommendations.length === 0 ? (
                <p className="mt-2 font-mono text-[11px] text-[#5FF3FF]">
                  {isEs
                    ? '¡Excelencia de Arquitectura alcanzada! Cumpliste márgenes ≥35%, rigor V&V y las 3 decisiones óptimas en vuelo.'
                    : 'Mission Architect Optimization Achieved! All ≥35% margins, V&V checks, and 3 flight crises cleared optimally.'}
                </p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-300">
                  {recommendations.map((rec, idx) => (
                    <li key={idx}>{rec[language]}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 border border-[#5FF3FF]/30 bg-[#04080F] p-3.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                  {isEs ? `Lo que aprendiste · ${activeLevel.code}` : `What You Learned · ${activeLevel.code}`}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-[#FFC15E]">
                    {'★'.repeat(levelProgress?.stars ?? 0)}
                    {'☆'.repeat(Math.max(0, 3 - (levelProgress?.stars ?? 0)))}
                  </span>
                  <span className="text-[#5FF3FF]">{playerXP} XP</span>
                </div>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-200">
                {activeLevel.learnedTakeaways.map((item, idx) => (
                  <li key={idx}>{item[language]}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 border border-[#5FF3FF]/25 bg-[#04080F] p-3.5">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                <History className="h-4 w-4" />
                <span>{isEs ? 'Bitácora de Decisiones (Tu Legado)' : 'Decision Legacy Timeline'}</span>
              </div>
              <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1 text-xs">
                {decisionLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-2 border-l-2 border-[#5FF3FF]/40 bg-[#04080F] px-2.5 py-1.5"
                  >
                    <span className="font-mono text-[10px] text-slate-400">{entry.timestamp}</span>
                    <span className="border border-[#5FF3FF]/30 px-1.5 py-0.5 font-mono text-[9px] text-[#5FF3FF]">
                      {entry.phase}
                    </span>
                    <span
                      className={
                        entry.impact === 'CRITICAL'
                          ? 'text-[#FF4D6D]'
                          : entry.impact === 'WARNING'
                            ? 'text-[#FFC15E]'
                            : 'text-slate-200'
                      }
                    >
                      {entry.label[language]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#5FF3FF]/20 pt-4">
              <span className="max-w-xs font-mono text-[10px] leading-relaxed text-slate-400">
                {isEs
                  ? 'Credencial educativa basada en datos abiertos NASA JPL CML, CubeSat 101, CSA y NASA GMAT R2026a (no oficial).'
                  : 'Grounded in NASA JPL CML, CubeSat 101, CSA & GMAT R2026a Open Data — Non-official educational credential.'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 border border-[#5FF3FF] bg-[#5FF3FF]/10 px-4 py-2 font-mono text-[10px] tracking-[0.14em] text-[#5FF3FF] uppercase transition hover:bg-[#5FF3FF]/20"
                >
                  {copiedSummary ? <Check className="h-4 w-4 text-[#5FF3FF]" /> : <Copy className="h-4 w-4" />}
                  <span>
                    {copiedSummary
                      ? isEs
                        ? 'Resumen Copiado'
                        : 'Summary Copied'
                      : isEs
                        ? 'Copiar Resumen'
                        : 'Copy Shareable Report'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="inline-flex items-center gap-2 border border-[#FFC15E] bg-[#FFC15E]/15 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#FFC15E] uppercase transition hover:bg-[#FFC15E]/25"
                >
                  {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  <span>
                    {downloaded
                      ? isEs
                        ? 'Certificado Descargado'
                        : 'Certificate Downloaded'
                      : isEs
                        ? 'Descargar Certificado (.txt)'
                        : 'Download Certificate (.txt)'}
                  </span>
                </button>
                {nextLevel && (
                  <button
                    type="button"
                    onClick={handleGoToNextMission}
                    className="inline-flex items-center gap-2 border border-[#5FF3FF] bg-[#5FF3FF] px-4 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#02050B] uppercase transition hover:bg-[#7ff6ff]"
                  >
                    <Rocket className="h-4 w-4" />
                    <span>
                      {isEs
                        ? `Siguiente misión: ${nextLevel.code} →`
                        : `Next Mission: ${nextLevel.code} →`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
