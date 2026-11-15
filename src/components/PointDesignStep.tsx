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
    experienceMode,
    activeTeamRole,
    lastValidatedByRole,
    metrics,
    tankFillPercent,
    oxidizerFillPercent,
    batteryChargePercent,
    dataBufferPercent,
    concurrencyRevision,
    lastValidatedAt,
    concurrentConflicts,
    soundEnabled,
    setActiveTeamRole,
    setTankLevels,
    fillAllTanks,
    commitAndValidate,
    appendDecisionLog,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';

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
          <span className="font-mono text-[10px] tracking-[0.18em] text-[#5FF3FF] uppercase">
            {isEs ? 'CARGA DE TANQUES' : 'TANK LOADING'}
          </span>
          <button
            type="button"
            onClick={() => {
              fillAllTanks();
              checkTankSound(100, 100);
            }}
            className="border border-[#5FF3FF] bg-[#5FF3FF]/10 px-2.5 py-1 font-mono text-[10px] text-[#5FF3FF] uppercase transition hover:bg-[#5FF3FF]/20"
          >
            {isEs ? 'LLENAR TANQUES' : 'FILL TANKS'}
          </button>
        </div>

        <div className="space-y-2.5">
          {sliders.map((s) => (
            <div key={s.key} className="border border-[#5FF3FF]/20 p-2.5">
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
                }}
                className="mt-1.5 w-full accent-[#5FF3FF]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeChair = TEAM_CHAIRS.find((c) => c.role === activeTeamRole) ?? TEAM_CHAIRS[0];
  const lastChair = TEAM_CHAIRS.find((c) => c.role === lastValidatedByRole) ?? null;

  return (
    <div className="space-y-3">
      <div className="border border-[#5FF3FF]/25 bg-[#04080F] p-2.5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] tracking-[0.14em] uppercase">
          <span className="text-[#5FF3FF]">
            {isEs ? 'SILLAS CONCURRENTES · JPL TEAM X' : 'JPL TEAM X CONCURRENT CHAIRS'}
          </span>
          {lastChair && (
            <span className="text-[#FFC15E]">
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
                  playHoloTone('STEP', soundEnabled);
                }}
                className={`border px-2 py-1.5 text-left transition ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-[#5FF3FF]'
                    : 'border-[#5FF3FF]/20 text-slate-400 hover:border-[#5FF3FF]/45 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[9px] font-bold tracking-[0.12em] uppercase">
                  {chair.code}
                </div>
                <div className="text-[10px] opacity-90">{chair.label[language]}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
          REV #{concurrencyRevision} {lastValidatedAt ? `· ${lastValidatedAt}` : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            commitAndValidate(activeTeamRole);
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
          className="border border-[#5FF3FF] bg-[#5FF3FF]/10 px-3 py-1.5 font-mono text-[10px] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/20"
        >
          {isEs ? 'SINCRONIZAR BD' : 'COMMIT & VALIDATE'}
        </button>
      </div>

      {concurrentConflicts.length === 0 ? (
        <div className="border border-[#5FF3FF]/30 p-3 font-mono text-[10px] text-[#5FF3FF]">
          {isEs
            ? 'BASE DE DATOS LIMPIA · CERO CONFLICTOS INTER-SUBSISTEMAS.'
            : 'MISSION DATABASE CLEAN · ZERO CROSS-SUBSYSTEM CONFLICTS.'}
        </div>
      ) : (
        <div className="space-y-2">
          {concurrentConflicts.map((c) => (
            <div key={c.id} className="border border-[#FF4D6D]/60 p-2.5 text-[11px] text-[#FF4D6D]">
              <div className="font-mono text-[9px] font-bold">{c.affectedSubsystems.join(' / ')}</div>
              <p className="mt-0.5 text-slate-200">{c.message[language]}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border border-[#5FF3FF]/20 p-3 font-mono text-[10px] text-slate-300">
        {isCadet ? (
          <p className="font-sans text-xs leading-relaxed">
            {isEs
              ? `Masa base CBE: ${metrics.dryMass.cbe.toFixed(1)} kg + Reserva MGA (+${metrics.dryMass.mga.toFixed(1)} kg).`
              : `Base CBE mass: ${metrics.dryMass.cbe.toFixed(1)} kg + MGA buffer (+${metrics.dryMass.mga.toFixed(1)} kg).`}
          </p>
        ) : (
          <div className="space-y-1">
            <div>ΔV: {metrics.deltaV_available_ms.toFixed(0)} / {metrics.deltaV_required_ms} M/S</div>
            <div>EIRP: {metrics.telecom.eirp_dBW.toFixed(1)} DBW · EB/N0: {metrics.telecom.receivedEbN0_dB.toFixed(1)} DB</div>
          </div>
        )}
      </div>
    </div>
  );
}
