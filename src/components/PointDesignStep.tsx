import { Info } from 'lucide-react';
import {
  findGroundStationById,
  findObjectiveById,
  findSubsystemById,
} from '../engine';
import { useMissionStore, type TeamRole } from '../store';
import { computeTankExtraMassKg, playHoloTone } from './holoAudio';

const TEAM_CHAIRS: {
  role: TeamRole;
  code: string;
  label: { en: string; es: string };
}[] = [
  { role: 'MISSION_LEAD', code: 'SYS / USER', label: { en: 'Mission Lead', es: 'Líder Misión' } },
  { role: 'PAYLOAD_ENG', code: 'PAYLOAD', label: { en: 'Payload Chair', es: 'Carga Útil' } },
  { role: 'BUS_ENG', code: 'SPACE BUS', label: { en: 'Space Bus Chair', es: 'Ing. Bus SWaP' } },
  { role: 'OPS_LAUNCH_ENG', code: 'LAUNCH / GND', label: { en: 'Launch & Ground', es: 'Lanzamiento & DSN' } },
];

export function PointDesignStep({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    activeTeamRole,
    lastValidatedByRole,
    selection,
    scores,
    metrics,
    tankFillPercent,
    oxidizerFillPercent,
    batteryChargePercent,
    dataBufferPercent,
    concurrencyRevision,
    lastValidatedAt,
    concurrentConflicts,
    soundEnabled,
    phaseTutorialStep,
    level1TutorialStep,
    activeCampaignLevelId,
    setActiveTeamRole,
    setTankLevels,
    fillAllTanks,
    commitAndValidate,
    setPhaseTutorialStep,
    setTutorialFeedback,
    appendDecisionLog,
    openSubmoduleGuide,
  } = useMissionStore();

  const isEs = language === 'es';
  const isL1Tut = activeCampaignLevelId === 'contract-leo-bionutrients' && level1TutorialStep === 7;

  const objective = findObjectiveById(selection.objectiveId);
  const groundStation = findGroundStationById(selection.groundStationId);
  const thermalOpt = findSubsystemById(selection.thermalId);
  const payloads = selection.payloadIds
    .map((id) => findSubsystemById(id))
    .filter(Boolean);
  const hasRequiredPayloads = objective.requiredPayloadIds.every((id) =>
    selection.payloadIds.includes(id),
  );
  const payloadPower = payloads.reduce(
    (sum, p) => sum + (p?.powerDrawNominal_W ?? 0),
    0,
  );
  const totalExtraKg = computeTankExtraMassKg(
    metrics,
    tankFillPercent,
    oxidizerFillPercent,
  );
  const totalWetWithTanks = metrics.wetMass_kg + totalExtraKg;
  const isOverMass = totalWetWithTanks > metrics.launchCapacity_kg;

  const checkTankSound = (nextFuel: number, nextOx: number) => {
    const extraKg = computeTankExtraMassKg(metrics, nextFuel, nextOx);
    const over = metrics.wetMass_kg + extraKg > metrics.launchCapacity_kg;
    playHoloTone(over ? 'ALARM' : 'FILL', soundEnabled);
  };

  if (zone === 'LEFT') {
    const sliders: {
      key: 'tankFillPercent' | 'oxidizerFillPercent' | 'batteryChargePercent' | 'dataBufferPercent';
      label: string;
      val: number;
    }[] = [
      { key: 'tankFillPercent', label: isEs ? 'COMBUSTIBLE' : 'FUEL TANK', val: tankFillPercent },
      { key: 'oxidizerFillPercent', label: isEs ? 'OXIDANTE' : 'OXIDIZER', val: oxidizerFillPercent },
      { key: 'batteryChargePercent', label: isEs ? 'BATERÍAS EPS' : 'BATTERIES', val: batteryChargePercent },
      { key: 'dataBufferPercent', label: isEs ? 'BUFFER DATOS' : 'DATA BUFFER', val: dataBufferPercent },
    ];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#5FF3FF] uppercase">
              {isEs ? 'CARGA DE TANQUES Y SWaP' : 'TANK LOADING & SWaP'}
            </span>
            <button
              type="button"
              onClick={() => openSubmoduleGuide('TANKS')}
              className="flex items-center gap-1 rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-2 py-0.5 font-mono text-[9px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
              title={isEs ? 'Abrir física de tanques y ecuación Tsiolkovsky' : 'Open tanks physics and Tsiolkovsky equation'}
            >
              <Info className="h-3 w-3" />
              <span>{isEs ? 'INFO FÍSICA' : 'PHYSICS INFO'}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              fillAllTanks();
              checkTankSound(100, 100);
              if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
              if (isL1Tut) {
                setTutorialFeedback({
                  en: 'Tanks & batteries filled! Propellant secures orbit correction and battery sustains the 35 min eclipse. Click "Confirm Tanks & Go to MCR Gate".',
                  es: '¡Tanques y baterías cargados! El propelente asegura el control orbital y la batería sostiene el eclipse de 35 min. Pulsa "Confirmar Tanques e Ir a Revisión MCR".',
                });
              }
            }}
            className="border border-[#5FF3FF] bg-[#5FF3FF]/10 px-2.5 py-1 font-mono text-[10px] text-[#5FF3FF] uppercase transition hover:bg-[#5FF3FF]/20 cursor-pointer"
          >
            {isEs ? 'LLENAR TANQUES' : 'FILL TANKS'}
          </button>
        </div>

        {/* Live tank loading telemetry card */}
        <div className={`border p-2.5 font-mono text-[10px] transition ${
          isOverMass ? 'border-[#FF4D6D] bg-[#FF4D6D]/10' : 'border-[#5FF3FF]/30 bg-[#04080F]/90'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isEs ? 'MASA TOTAL HÚMEDA:' : 'TOTAL WET MASS:'}</span>
            <span className={isOverMass ? 'text-[#FF4D6D] font-bold' : 'text-[#5FF3FF] font-bold'}>
              {totalWetWithTanks.toFixed(1)} / {metrics.launchCapacity_kg} KG
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[9px] text-slate-300">
            <span>{isEs ? 'Propelente extra tanques:' : 'Extra tank propellant:'}</span>
            <span className="text-[#FFC15E]">+{totalExtraKg.toFixed(1)} kg</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {sliders.map((s) => (
            <div key={s.key} className="border border-[#5FF3FF]/20 p-2.5 bg-[#04080F]/80">
              <div className="flex justify-between font-mono text-[10px] uppercase">
                <span className="text-slate-400">{s.label}</span>
                <span className={s.val >= 95 ? 'text-[#FFC15E]' : 'text-[#5FF3FF]'}>{s.val}%</span>
              </div>
              <input
                id={`tank-${s.key}`}
                name={s.key}
                type="range"
                min={10}
                max={120}
                step={5}
                value={s.val}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTankLevels({ [s.key]: v });
                  if (s.key === 'tankFillPercent') checkTankSound(v, oxidizerFillPercent);
                  if (s.key === 'oxidizerFillPercent') checkTankSound(tankFillPercent, v);
                  if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                  if (isL1Tut) {
                    setTutorialFeedback({
                      en: `${s.label} set to ${v}%. Notice wet mass & battery reserves reacting!`,
                      es: `${s.label} ajustado al ${v}%. ¡Observa la masa húmeda y reservas de batería reaccionando!`,
                    });
                  }
                }}
                className="mt-1.5 w-full accent-[#5FF3FF]"
              />
            </div>
          ))}
        </div>

        {/* Tarjeta Compacta: Por Qué Tanques y Baterías */}
        <div className="border border-[#5FF3FF]/30 bg-[#040812]/80 p-2 font-mono text-[9.5px] leading-relaxed rounded flex items-center justify-between gap-2">
          <div className="truncate text-slate-300">
            <span className="text-[#5FF3FF] font-bold mr-1">⛽ {isEs ? 'FÍSICA:' : 'PHYSICS:'}</span>
            {isEs
              ? 'ΔV para corrección orbital y batería EPS durante los 35 min de eclipse en umbra.'
              : 'ΔV for orbit station keeping and EPS battery during 35 min shadow eclipse.'}
          </div>
          <button
            type="button"
            onClick={() => openSubmoduleGuide('TANKS')}
            className="shrink-0 flex items-center gap-1 rounded border border-[#FFC15E]/40 bg-[#FFC15E]/10 px-1.5 py-0.5 text-[8.5px] text-[#FFC15E] hover:bg-[#FFC15E]/20 transition"
          >
            <Info className="h-2.5 w-2.5" />
            <span>{isEs ? 'VER DETALLES' : 'VIEW DETAILS'}</span>
          </button>
        </div>
      </div>
    );
  }

  const activeChair = TEAM_CHAIRS.find((c) => c.role === activeTeamRole) ?? TEAM_CHAIRS[0];
  const lastChair = TEAM_CHAIRS.find((c) => c.role === lastValidatedByRole) ?? null;

  return (
    <div className="space-y-3">
      {/* Sillas Concurrentes de JPL Team X */}
      <div className="border border-[#5FF3FF]/25 bg-[#04080F] p-2.5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] tracking-[0.14em] uppercase">
          <div className="flex items-center gap-2">
            <span className="text-[#5FF3FF]">
              {isEs ? 'SILLAS CONCURRENTES · JPL TEAM X' : 'JPL TEAM X CONCURRENT CHAIRS'}
            </span>
            <button
              type="button"
              onClick={() => openSubmoduleGuide('CONCURRENT_TEAM')}
              className="flex items-center gap-1 rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-1.5 py-0.5 font-mono text-[8.5px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
              title={isEs ? 'Ver metodología de ingeniería concurrente JPL' : 'View JPL concurrent engineering methodology'}
            >
              <Info className="h-2.5 w-2.5" />
              <span>{isEs ? 'MÉTODO TEAM X' : 'TEAM X METHOD'}</span>
            </button>
          </div>
          {lastChair && (
            <span className="text-[#FFC15E] font-bold">
              {isEs ? 'FIRMADO:' : 'SIGNED:'} {lastChair.code}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {TEAM_CHAIRS.map((chair) => {
            const active = activeTeamRole === chair.role;
            return (
              <button
                key={chair.role}
                type="button"
                onClick={() => {
                  setActiveTeamRole(chair.role);
                  if (phaseTutorialStep <= 0) setPhaseTutorialStep(1);
                  playHoloTone('STEP', soundEnabled);
                }}
                className={`border px-2.5 py-1.5 text-left transition cursor-pointer ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF] shadow-[0_0_12px_rgba(95,243,255,0.25)]'
                    : 'border-[#5FF3FF]/20 text-slate-400 hover:border-[#5FF3FF]/45 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[9.5px] font-bold tracking-[0.12em] uppercase">
                  {chair.code}
                </div>
                <div className="text-[10px] opacity-90">{chair.label[language]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chair Specialized Technical Panel */}
      <div className="border border-[#5FF3FF]/35 bg-[#04080F]/90 p-2.5 space-y-2">
        <div className="flex items-center justify-between border-b border-[#5FF3FF]/20 pb-1.5">
          <div>
            <div className="font-mono text-[10px] font-bold text-[#5FF3FF] uppercase">
              {activeChair.code} · {activeChair.label[language]}
            </div>
            <div className="text-[9.5px] text-slate-400">
              {activeTeamRole === 'MISSION_LEAD'
                ? isEs
                  ? 'Supervisión integral de arquitectura, ciencia y coste'
                  : 'Holistic system oversight, science balance & budget'
                : activeTeamRole === 'PAYLOAD_ENG'
                  ? isEs
                    ? 'Sensores científicos, tasa de datos y potencia de carga'
                    : 'Science instruments, data downlink & payload power'
                  : activeTeamRole === 'BUS_ENG'
                    ? isEs
                      ? 'Balance de energía solar/RTG, masa seca y térmico'
                      : 'Power generation, dry mass margins & thermal bus'
                    : isEs
                      ? 'Delta-V de maniobra, cohete lanzador y enlace DSN'
                      : 'Orbital Delta-V, rocket capacity & DSN network'}
            </div>
          </div>
          <span className="font-mono text-[8px] border border-[#5FF3FF]/40 bg-[#5FF3FF]/15 px-1.5 py-0.5 rounded text-[#5FF3FF]">
            {isEs ? 'SILLA ACTIVA' : 'ACTIVE CHAIR'}
          </span>
        </div>

        {/* Dynamic 4-card telemetry customized to active chair */}
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[9.5px]">
          {activeTeamRole === 'MISSION_LEAD' && (
            <>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'PUNTUACIÓN GLOBAL' : 'GLOBAL SCORE'}</span>
                <span className="text-[#5FF3FF] text-[11px] font-bold">{scores.compositeGlobalScore}/100</span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'COSTE VS TOPE' : 'COST VS CAP'}</span>
                <span className="text-[#FFC15E] text-[11px] font-bold">
                  ${metrics.cost.totalMillionsUSD.toFixed(1)}M / ${objective.baseBudgetMillions}M
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'ESTADO MCR' : 'MCR VERDICT'}</span>
                <span className={`text-[11px] font-bold ${
                  metrics.overallMCRStatus === 'GREEN' ? 'text-[#10B981]' : metrics.overallMCRStatus === 'YELLOW' ? 'text-[#FFC15E]' : 'text-[#FF4D6D]'
                }`}>
                  {metrics.overallMCRStatus}
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'CONFLICTOS' : 'CONFLICTS'}</span>
                <span className={`text-[11px] font-bold ${
                  concurrentConflicts.length === 0 ? 'text-[#10B981]' : 'text-[#FF4D6D]'
                }`}>
                  {concurrentConflicts.length} {isEs ? 'detectados' : 'detected'}
                </span>
              </div>
            </>
          )}

          {activeTeamRole === 'PAYLOAD_ENG' && (
            <>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'INSTRUMENTOS' : 'PAYLOADS'}</span>
                <span className={`text-[11px] font-bold ${hasRequiredPayloads ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                  {selection.payloadIds.length} ({hasRequiredPayloads ? '✓ REQ OK' : '⚠️ FALTA'})
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'TASA DATOS' : 'DATA RATE'}</span>
                <span className="text-[#5FF3FF] text-[11px] font-bold">
                  {metrics.telecom.dataRate_kbps.toFixed(0)} kbps (≥{objective.minDataRateKbps})
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'POTENCIA CARGA' : 'PAYLOAD POWER'}</span>
                <span className="text-[#FFC15E] text-[11px] font-bold">-{payloadPower} W</span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'RESOLUCIÓN ESPECTRAL' : 'SPECTRAL'}</span>
                <span className="text-slate-200 text-[11px] font-bold">140 BANDS / NIR</span>
              </div>
            </>
          )}

          {activeTeamRole === 'BUS_ENG' && (
            <>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'GEN. ENERGÍA' : 'POWER GEN'}</span>
                <span className="text-[#5FF3FF] text-[11px] font-bold">
                  +{metrics.power.generatedAtDestination_W.toFixed(0)} W
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'CARGA ECLIPSE' : 'ECLIPSE LOAD'}</span>
                <span className="text-[#FFC15E] text-[11px] font-bold">
                  {metrics.power.eclipseRequired_W.toFixed(0)} W
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'MARGEN MASA SECA' : 'DRY MARGIN'}</span>
                <span className={`text-[11px] font-bold ${metrics.dryMass.marginPercent >= 35 ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                  {metrics.dryMass.marginPercent.toFixed(1)}% (≥35%)
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'BUS TÉRMICO' : 'THERMAL BUS'}</span>
                <span className="text-[#5FF3FF] text-[10px] font-bold truncate block">
                  {thermalOpt?.name[language] ?? 'OK'}
                </span>
              </div>
            </>
          )}

          {activeTeamRole === 'OPS_LAUNCH_ENG' && (
            <>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'ΔV DISPONIBLE' : 'ΔV AVAILABLE'}</span>
                <span className={`text-[11px] font-bold ${metrics.deltaV_available_ms >= metrics.deltaV_required_ms ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                  {metrics.deltaV_available_ms.toFixed(0)} / {metrics.deltaV_required_ms} M/S
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'MASA / COHETE' : 'MASS / ROCKET'}</span>
                <span className={`text-[11px] font-bold ${!isOverMass ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                  {totalWetWithTanks.toFixed(1)} / {metrics.launchCapacity_kg} KG
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'ENLACE RF' : 'LINK MARGIN'}</span>
                <span className={`text-[11px] font-bold ${metrics.telecom.linkMargin_dB >= 3 ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                  {metrics.telecom.linkMargin_dB.toFixed(1)} dB (Eb/N0 {metrics.telecom.receivedEbN0_dB.toFixed(1)})
                </span>
              </div>
              <div className="border border-[#5FF3FF]/20 bg-[#071322] p-1.5 rounded">
                <span className="text-slate-400 block">{isEs ? 'RED TERRENA' : 'GROUND NETWORK'}</span>
                <span className="text-[#5FF3FF] text-[10px] font-bold truncate block">
                  {groundStation.name[language]}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Concurrency Database Synchronizer */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
          REV #{concurrencyRevision} {lastValidatedAt ? `· ${lastValidatedAt}` : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            commitAndValidate(activeTeamRole);
            if (phaseTutorialStep <= 2) setPhaseTutorialStep(3);
            playHoloTone(concurrentConflicts.length === 0 ? 'STAR' : 'ALARM', soundEnabled);
            appendDecisionLog({
              phase: 'CML_4',
              label: {
                en: `[${activeChair.code}] Committed Concurrent DB Rev #${concurrencyRevision + 1}`,
                es: `[${activeChair.code}] BD Concurrente Sincronizada Rev #${concurrencyRevision + 1}`,
              },
              impact: concurrentConflicts.length === 0 ? 'POSITIVE' : 'WARNING',
            });
          }}
          className="border border-[#5FF3FF] bg-[#5FF3FF]/15 px-3 py-1.5 font-mono text-[10px] text-[#5FF3FF] font-bold uppercase hover:bg-[#5FF3FF]/25 shadow-[0_0_12px_rgba(95,243,255,0.2)] transition cursor-pointer"
        >
          {isEs ? 'SINCRONIZAR BD' : 'COMMIT & VALIDATE'}
        </button>
      </div>

      {concurrentConflicts.length === 0 ? (
        <div className="border border-[#10B981]/40 bg-[#10B981]/10 p-2.5 font-mono text-[10px] text-[#10B981]">
          {isEs
            ? '✓ BASE DE DATOS LIMPIA · CERO CONFLICTOS INTER-SUBSISTEMAS.'
            : '✓ MISSION DATABASE CLEAN · ZERO CROSS-SUBSYSTEM CONFLICTS.'}
        </div>
      ) : (
        <div className="space-y-2">
          {concurrentConflicts.map((c) => (
            <div key={c.id} className="border border-[#FF4D6D]/60 bg-[#FF4D6D]/10 p-2.5 text-[11px] text-[#FF4D6D]">
              <div className="font-mono text-[9px] font-bold">{c.affectedSubsystems.join(' / ')}</div>
              <p className="mt-0.5 text-slate-200">{c.message[language]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
