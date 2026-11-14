import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Check,
  Download,
  FlaskConical,
  History,
  Medal,
  Rocket,
  ShieldCheck,
  X,
} from 'lucide-react';
import { findObjectiveById } from '../engine';
import { useMissionStore } from '../store';

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
    isCertificateOpen,
    setCertificateOpen,
  } = useMissionStore();

  const [downloaded, setDownloaded] = useState(false);
  const isEs = language === 'es';
  const show = Boolean(isCertificateOpen && simulationResult);

  const objective = findObjectiveById(selection.objectiveId);
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

  const handleDownloadCertificate = () => {
    if (!simulationResult) return;
    const earnedNames = badges
      .filter((b) => b.earned)
      .map((b) => `- ${b.title[language]} (${b.desc[language]})`)
      .join('\n');
    const summaryText = [
      'ORBITAL FORGE — MISSION ARCHITECT CERTIFICATE (JPL CML 1-5 EDUCATIONAL STANDARD)',
      `Commander: CMDR ${commanderName} | Mission: ${missionCustomName} | Mode: ${experienceMode}`,
      `Final Grade: ${simulationResult.overallGrade} (Science ${simulationResult.scienceScore}/100, Global P ${scores.compositeGlobalScore})`,
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

    try {
      const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ORBITAL-FORGE-${missionCustomName.replace(/\s+/g, '-')}-Certificate.txt`;
      link.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      console.warn('Unable to download mission certificate file:', err);
    }
  };

  return (
    <AnimatePresence>
      {show && simulationResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-amber-400/40 bg-[#070e1f] p-6 shadow-[0_0_60px_rgba(251,191,36,0.16)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  {isEs
                    ? 'Certificado de Arquitecto de Misión ORBITAL FORGE (Estándar JPL CML)'
                    : 'ORBITAL FORGE Mission Architect Certificate (JPL CML Standard)'}
                </span>
                <h2 className="mt-1 text-xl font-black text-white">CMDR {commanderName} · {missionCustomName}</h2>
                <p className="mt-0.5 font-mono text-xs text-cyan-300">
                  {experienceMode === 'CADET'
                    ? isEs ? 'Modo Cadete (Historia)' : 'Cadet Story Mode'
                    : isEs ? 'Modo Ingeniero JPL (Hardcore)' : 'JPL Hardcore Mode'}{' '}
                  · {isEs ? 'Calificación' : 'Grade'}: <strong className="text-amber-300">{simulationResult.overallGrade}</strong> ({simulationResult.scienceScore}/100)
                </p>
              </div>
              <button type="button" onClick={() => setCertificateOpen(false)} className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${b.earned ? 'border-amber-400/50 bg-amber-500/10 text-amber-100' : 'border-slate-800 bg-slate-950/60 text-slate-500 opacity-65'}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${b.earned ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-900 text-slate-600'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold">{b.title[language]}</div>
                      <div className="text-[11px] opacity-85">{b.desc[language]}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-cyan-300">
                <Medal className="h-4 w-4" />
                <span>{isEs ? 'Comparativa NASA Real:' : 'NASA Benchmark:'} {objective.realWorldBenchmark.missionName}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                <div>{isEs ? 'Masa:' : 'Mass:'} {metrics.dryMass.predicted.toFixed(1)} / {objective.realWorldBenchmark.actualMass_kg} kg</div>
                <div>{isEs ? 'Potencia:' : 'Power:'} {metrics.power.generatedAtDestination_W.toFixed(0)} / {objective.realWorldBenchmark.actualPower_W} W</div>
                <div>{isEs ? 'Costo:' : 'Cost:'} ${metrics.cost.totalMillionsUSD.toFixed(1)}M / ${objective.realWorldBenchmark.actualCost_MillionsUSD}M</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-emerald-300">
                <History className="h-4 w-4" />
                <span>{isEs ? 'Bitácora de Decisiones (Tu Legado)' : 'Decision Legacy Timeline'}</span>
              </div>
              <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1 text-xs">
                {decisionLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 rounded-lg bg-slate-900/75 px-2.5 py-1.5">
                    <span className="font-mono text-[10px] text-slate-400">{entry.timestamp}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300">{entry.phase}</span>
                    <span className={entry.impact === 'CRITICAL' ? 'text-rose-200' : entry.impact === 'WARNING' ? 'text-amber-200' : 'text-slate-200'}>{entry.label[language]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
              <span className="max-w-md font-mono text-[10px] leading-relaxed text-slate-400">
                {isEs
                  ? 'Credencial educativa basada en datos abiertos NASA JPL CML, CubeSat 101, CSA y NASA GMAT R2026a (no oficial).'
                  : 'Grounded in NASA JPL CML, CubeSat 101, CSA & GMAT R2026a Open Data — Non-official educational credential.'}
              </span>
              <button type="button" onClick={handleDownloadCertificate} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-cyan-400 px-5 py-2.5 text-xs font-black text-slate-950">
                {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                <span>
                  {downloaded
                    ? isEs
                      ? 'Certificado Descargado'
                      : 'Certificate Downloaded'
                    : isEs
                      ? 'Descargar Certificado ORBITAL FORGE (.txt)'
                      : 'Download ORBITAL FORGE Certificate (.txt)'}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
