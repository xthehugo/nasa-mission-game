import { useRef, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { useMissionStore } from '../store';
import type { MCRStatus } from '../types/mission';
import { playHoloTone } from './holoAudio';
import { VVTestingCard } from './VVTestingCard';

function statusColor(status: MCRStatus): string {
  if (status === 'GREEN') return 'text-[#5FF3FF] border-[#5FF3FF]/40';
  if (status === 'YELLOW') return 'text-[#FFC15E] border-[#FFC15E]/50';
  return 'text-[#FF4D6D] border-[#FF4D6D]/60';
}

export function MCRReviewGate({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    experienceMode,
    commanderName,
    missionCustomName,
    metrics,
    preFlightVerdict,
    mcrSignedAuthorized,
    laserScanActive,
    soundEnabled,
    toggleLaserScan,
    setSubsystem,
    setMcrSignedAuthorized,
    appendDecisionLog,
    launchSimulation,
  } = useMissionStore();

  const [holdPct, setHoldPct] = useState(0);
  const timerRef = useRef<number | null>(null);
  const isEs = language === 'es';
  const isJpl = experienceMode === 'JPL_ENGINEER';

  if (zone === 'LEFT') {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            toggleLaserScan();
            playHoloTone('STEP', soundEnabled);
          }}
          className={`w-full border px-3 py-2 font-mono text-[10px] tracking-[0.14em] uppercase transition ${
            laserScanActive
              ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-[#5FF3FF]'
              : 'border-[#5FF3FF]/25 text-slate-400'
          }`}
        >
          {isEs
            ? `ESCANEO LÁSER V&V: ${laserScanActive ? 'ACTIVO' : 'PAUSA'}`
            : `LASER V&V SCAN: ${laserScanActive ? 'ON' : 'OFF'}`}
        </button>

        <VVTestingCard />

        {/* GSFC-STD-1000 GOLD Rules & NASA-STD-5001B Quantitative CML 5 Checks */}
        <div className="border border-[#5FF3FF]/30 bg-[#04080F]/80 p-2.5 space-y-2">
          <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.14em] uppercase">
            <span className="text-[#5FF3FF]">
              {isEs ? 'REGLAS GSFC-STD-1000 & NASA-STD-5001B' : 'GSFC-STD-1000 & NASA-STD-5001B RULES'}
            </span>
            <span className="text-[#FFC15E]">CML 5</span>
          </div>

          <div className="space-y-1.5 text-[10px] leading-snug">
            <div className="border border-[#5FF3FF]/20 p-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-white">
                <span>GSFC Rule 1.05 · SPF / FMEA</span>
                <span className="text-[#5FF3FF]">
                  {isEs ? 'REDUNDANCIA OK' : 'REDUNDANCY OK'}
                </span>
              </div>
              <p className="mt-1 text-slate-300">
                {isJpl
                  ? isEs
                    ? 'Cero Fallas de Punto Único (SPF) en bus crítico; FMEA/FMECA completo para aviónica, calentadores y válvulas.'
                    : 'Zero credible Single Point Failures (SPF) in critical bus; FMEA/FMECA closed on avionics, heaters, and valves.'
                  : isEs
                    ? 'Ninguna falla en un solo cable puede apagar la nave: todo sistema vital tiene respaldo gemelo.'
                    : 'No single broken wire can turn off the whole spacecraft: every critical part carries a backup twin.'}
              </p>
            </div>

            <div className="border border-[#5FF3FF]/20 p-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-white">
                <span>GSFC Rule 2.13 · Spare Pins</span>
                <span className="text-[#5FF3FF]">≥ 30% PDR</span>
              </div>
              <p className="mt-1 text-slate-300">
                {isJpl
                  ? isEs
                    ? 'Conectores con ≥30% de pines de reserva en PDR, ≥10% de contactos extra en I&T y cero blind-mating sin llaves mecánicas.'
                    : '≥30% spare connector pins frozen at PDR, ≥10% I&T contact margin, and zero unkeyed blind-mating.'
                  : isEs
                    ? 'Los enchufes internos dejan al menos 30% de clavijas libres y formas únicas anti-error como USB.'
                    : 'Internal harness plugs keep ≥30% extra spare pins plus unique keyed shapes so cables never plug in backwards.'}
              </p>
            </div>

            <div className="border border-[#5FF3FF]/20 p-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-white">
                <span>NASA-STD-5001B Sec. 4.2.1</span>
                <span className="text-[#FFC15E]">1.40× ULT / 1.25× YLD</span>
              </div>
              <p className="mt-1 text-slate-300">
                {isJpl
                  ? isEs
                    ? 'Factores estructurales: FS Último 1.40, FS Fluencia 1.25 y prueba de presión en tanques COPV 1.05×–1.20× MDP.'
                    : 'Structural FoS: Ultimate 1.40, Yield 1.25, and COPV/propellant tank proof pressure 1.05×–1.20× MDP.'
                  : isEs
                    ? 'El chasis y tanque resisten 1.40 veces la vibración máxima del cohete antes de siquiera deformarse.'
                    : 'Spacecraft frame and propellant tanks survive 1.40× the hardest rocket shaking without bending or cracking.'}
              </p>
            </div>
          </div>
        </div>

        {(metrics.dryMass.status !== 'GREEN' || metrics.power.status !== 'GREEN' || metrics.telecom.status !== 'GREEN') && (
          <div className="border border-[#FFC15E]/40 p-2.5 space-y-1.5">
            <div className="font-mono text-[9px] text-[#FFC15E] uppercase">
              {isEs ? 'CORRECCIONES RÁPIDAS' : 'QUICK MARGIN FIXES'}
            </div>
            {metrics.dryMass.status !== 'GREEN' && (
              <button type="button" onClick={() => setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9')} className="w-full border border-[#FFC15E]/30 py-1 font-mono text-[9.5px] text-[#FFC15E] hover:bg-[#FFC15E]/10">
                + {isEs ? 'ESCALAR LANZADOR FALCON 9' : 'UPGRADE TO FALCON 9'}
              </button>
            )}
            {metrics.power.status !== 'GREEN' && (
              <button type="button" onClick={() => setSubsystem('EPS', 'eps-megaflex')} className="w-full border border-[#FFC15E]/30 py-1 font-mono text-[9.5px] text-[#FFC15E] hover:bg-[#FFC15E]/10">
                + {isEs ? 'DESPLEGAR ALAS MEGA-FLEX' : 'DEPLOY MEGA-FLEX SOLAR'}
              </button>
            )}
            {metrics.telecom.status !== 'GREEN' && (
              <button type="button" onClick={() => setSubsystem('TELECOM', 'telecom-xka')} className="w-full border border-[#FFC15E]/30 py-1 font-mono text-[9.5px] text-[#FFC15E] hover:bg-[#FFC15E]/10">
                + {isEs ? 'EQUIPAR ANTENA BANDA X/KA' : 'EQUIP X/KA HIGH-GAIN'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const isStrictJplReady =
    preFlightVerdict.passed &&
    metrics.overallMCRStatus === 'GREEN' &&
    metrics.dryMass.marginPercent >= 35 &&
    metrics.power.marginPercent >= 35;

  const clearHoldTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const completeSignOff = () => {
    clearHoldTimer();
    setHoldPct(100);
    setMcrSignedAuthorized(true);
    playHoloTone('STAR', soundEnabled);
    appendDecisionLog({
      phase: 'CML_5',
      label: {
        en: `MCR Authorized by CMDR ${commanderName}`,
        es: `MCR Autorizado por CMDR ${commanderName}`,
      },
      impact: isStrictJplReady ? 'POSITIVE' : 'WARNING',
    });
    window.setTimeout(() => launchSimulation(), 450);
  };

  const startHold = () => {
    if (timerRef.current !== null) return;
    let p = 0;
    setHoldPct(8);
    timerRef.current = window.setInterval(() => {
      p += 6;
      if (p >= 100) completeSignOff();
      else setHoldPct(p);
    }, 60);
  };

  const cancelHold = () => {
    clearHoldTimer();
    setHoldPct((c) => (c >= 100 ? 100 : 0));
  };

  const r = 11;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (holdPct / 100) * circ;

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
        {isEs ? 'AUDITORÍA DE MÁRGENES MCR' : 'MCR MARGIN AUDIT'}
      </div>

      {isJpl ? (
        <div className="border border-[#FFC15E]/40 bg-[#FFC15E]/8 p-2.5 font-mono text-[9px] leading-relaxed text-[#FFC15E]">
          <div className="font-bold uppercase">
            NASA/SP-2016-6105 · NASA-STD-5001 (1.40× ULT) · GSFC-STD-1000 RULE 1.05
          </div>
          <div className="mt-0.5 text-slate-200">
            Dry MEV {metrics.dryMass.predicted.toFixed(1)}kg / Allow {metrics.dryMass.allowable.toFixed(1)}kg · EPS Pred {metrics.power.predicted.toFixed(0)}W · FSPL {metrics.telecom.freeSpaceLoss_dB.toFixed(1)}dB
          </div>
        </div>
      ) : (
        <div className="border border-[#5FF3FF]/35 bg-[#5FF3FF]/8 p-2.5 text-[11px] leading-snug text-slate-200">
          {isEs
            ? '🎓 Modo Cadete: las tarjetas en cian indican al menos ≥35% de margen seguro para despegar; si ves amarillo o rojo, usa las correcciones rápidas o ajusta en CML 3.'
            : '🎓 Cadet Guide: cyan cards confirm ≥35% safety reserve for launch; yellow or red cards show exactly what to adjust in CML 3 or via Quick Fixes.'}
        </div>
      )}

      <div className="space-y-1.5">
        {metrics.mcrChecklist.map((item) => (
          <div key={item.id} className={`border p-2.5 ${statusColor(item.status)}`}>
            <div className="flex items-center justify-between font-mono text-[9.5px] uppercase">
              <span>{item.label[language]}</span>
              <span>{item.valueSummary}</span>
            </div>
            <p className="mt-1 text-[11px] font-light text-slate-300">{item.feedback[language]}</p>
          </div>
        ))}
      </div>

      {mcrSignedAuthorized && (
        <div className="border border-dashed border-[#5FF3FF] p-2.5 font-mono text-[10px] text-[#5FF3FF] uppercase">
          {isEs
            ? `SELLO CONFIRMADO · CMDR ${commanderName} (${missionCustomName})`
            : `STAMP CONFIRMED · CMDR ${commanderName} (${missionCustomName})`}
        </div>
      )}

      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        className="relative w-full overflow-hidden border border-[#5FF3FF] bg-[#04080F] px-3 py-3 font-mono text-[10px] tracking-[0.12em] text-white uppercase select-none"
      >
        <div className="absolute inset-y-0 left-0 bg-[#5FF3FF]/25 transition-all duration-75" style={{ width: `${holdPct}%` }} />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg className="h-7 w-7 -rotate-90" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r={r} fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <circle
              cx="14"
              cy="14"
              r={r}
              fill="none"
              stroke="#5FF3FF"
              strokeWidth="2.5"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <Fingerprint className="h-4 w-4 text-[#5FF3FF]" />
          <span>
            {holdPct > 0 && holdPct < 100
              ? `${holdPct}%`
              : isJpl && !isStrictJplReady
                ? isEs ? 'MANTENER: FIRMAR OVERRIDE' : 'HOLD: SIGN OVERRIDE'
                : isEs ? 'MANTENER PARA FIRMAR MCR' : 'HOLD TO SIGN MCR'}
          </span>
        </span>
      </button>
    </div>
  );
}
