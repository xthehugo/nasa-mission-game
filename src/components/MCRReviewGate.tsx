import { useRef, useState } from 'react';
import { CheckCircle2, Fingerprint, Info, Sparkles, Wrench } from 'lucide-react';
import { findObjectiveById } from '../engine';
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
    selection,
    metrics,
    preFlightVerdict,
    mcrSignedAuthorized,
    laserScanActive,
    soundEnabled,
    phaseTutorialStep,
    level1TutorialStep,
    setLevel1TutorialStep,
    toggleLaserScan,
    setSubsystem,
    setGroundStation,
    togglePayload,
    runFullVVSuite,
    setMcrSignedAuthorized,
    setPhaseTutorialStep,
    appendDecisionLog,
    launchSimulation,
    openSubmoduleGuide,
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
            if (phaseTutorialStep <= 0) setPhaseTutorialStep(1);
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
              {isEs ? 'ESTÁNDARES NASA V&V' : 'NASA V&V STANDARDS'}
            </span>
            <button
              type="button"
              onClick={() => openSubmoduleGuide('MCR_GATE')}
              className="flex items-center gap-1 rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-1.5 py-0.5 font-mono text-[8.5px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
              title={isEs ? 'Abrir manual completo de criterios MCR y estándares' : 'Open complete MCR criteria and standards manual'}
            >
              <Info className="h-2.5 w-2.5" />
              <span>{isEs ? 'CRITERIOS MCR' : 'MCR CRITERIA'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5 text-[9.5px]">
            <div className="flex items-center justify-between border border-[#5FF3FF]/20 bg-[#071322] px-2 py-1.5">
              <span className="text-slate-300">GSFC 1.05 · FMEA (Cero SPF)</span>
              <span className="text-[#5FF3FF] font-mono text-[9px]">✓ REDUNDANCIA</span>
            </div>
            <div className="flex items-center justify-between border border-[#5FF3FF]/20 bg-[#071322] px-2 py-1.5">
              <span className="text-slate-300">GSFC 2.13 · Spare Pins</span>
              <span className="text-[#5FF3FF] font-mono text-[9px]">≥30% PDR</span>
            </div>
            <div className="flex items-center justify-between border border-[#5FF3FF]/20 bg-[#071322] px-2 py-1.5">
              <span className="text-slate-300">NASA-STD-5001B · Resistencia</span>
              <span className="text-[#FFC15E] font-mono text-[9px]">1.40× ULT</span>
            </div>
          </div>
        </div>

        {(() => {
          const destId = selection.destinationId;
          const isJupiter = destId === 'dest-jupiter';
          const isDeepSpace =
            destId === 'dest-jupiter' || destId === 'dest-mars' || destId === 'dest-l2';
          const activeObj = findObjectiveById(selection.objectiveId);
          const missingPayloads = activeObj.requiredPayloadIds.filter(
            (id) => !selection.payloadIds.includes(id),
          );
          const deltaVLow = metrics.deltaV_available_ms < metrics.deltaV_required_ms;
          const massOrFairingFail =
            metrics.dryMass.status !== 'GREEN' ||
            !metrics.volume.isCompliant ||
            metrics.wetMass_kg > metrics.launchCapacity_kg;
          const powerFail = metrics.power.status !== 'GREEN';
          const telecomFail = metrics.telecom.status !== 'GREEN';
          const testingFail = !preFlightVerdict.passed;
          const hasAnyDiscrepancy =
            massOrFairingFail ||
            powerFail ||
            telecomFail ||
            deltaVLow ||
            missingPayloads.length > 0 ||
            testingFail;

          const handleFixAll = () => {
            if (massOrFairingFail) {
              setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
            }
            if (powerFail) {
              setSubsystem('EPS', isJupiter ? 'eps-rtg' : 'eps-megaflex');
              setSubsystem('THERMAL', 'therm-active');
            }
            if (telecomFail) {
              setSubsystem(
                'TELECOM',
                destId === 'dest-l2' ? 'telecom-cubelct-laser' : 'telecom-xka',
              );
              setGroundStation(
                isJupiter
                  ? 'gs-dsn-70m'
                  : isDeepSpace
                    ? 'gs-dsn-34m'
                    : 'gs-near-earth',
              );
            }
            if (deltaVLow) {
              setSubsystem('PROPULSION', 'prop-biprop');
              if (destId !== 'dest-leo') setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
            }
            for (const pid of missingPayloads) {
              togglePayload(pid);
            }
            runFullVVSuite();
            if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
            playHoloTone('STAR', soundEnabled);
            appendDecisionLog({
              phase: 'CML_5',
              label: {
                en: 'Applied All MCR Margin & V&V Fixes',
                es: 'Aplicadas Todas las Correcciones MCR y V&V',
              },
              impact: 'POSITIVE',
            });
          };

          if (!hasAnyDiscrepancy) {
            return (
              <div className="border border-[#10B981]/50 bg-[#10B981]/15 p-2.5 font-mono text-[10px] text-[#10B981] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>
                  {isEs
                    ? 'MÁRGENES MCR Y V&V ÓPTIMOS · AUTORIZADO PARA FIRMAR DESPEGUE'
                    : 'MCR & V&V MARGINS OPTIMAL · AUTHORIZED TO SIGN FOR LAUNCH'}
                </span>
              </div>
            );
          }

          return (
            <div className="border border-[#FFC15E]/50 bg-[#04080F]/90 p-2.5 space-y-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-[#FFC15E] uppercase font-bold">
                <span className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  <span>{isEs ? 'CORRECCIONES TÉCNICAS MCR' : 'MCR TECHNICAL CORRECTIONS'}</span>
                </span>
                <span className="text-slate-400">DISCREPANCIAS DETECTADAS</span>
              </div>

              {/* Master Fix-All Button */}
              <button
                type="button"
                onClick={handleFixAll}
                className="w-full border-2 border-[#10B981] bg-[#10B981]/25 px-3 py-2 font-mono text-[10px] font-bold text-[#10B981] uppercase hover:bg-[#10B981]/35 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
                <span>
                  {isEs
                    ? '⚡ AUTO-RESOLVER TODAS LAS DISCREPANCIAS MCR'
                    : '⚡ AUTO-RESOLVE ALL MCR DISCREPANCIES'}
                </span>
              </button>

              <div className="space-y-1">
                {massOrFairingFail && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
                      if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="w-full border border-[#FFC15E]/40 bg-[#FFC15E]/10 py-1 px-2 font-mono text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20 text-left cursor-pointer"
                  >
                    + {isEs ? 'ESCALAR LANZADOR A FALCON 9 (COFIA 24U)' : 'UPGRADE LAUNCHER TO FALCON 9 (24U FAIRING)'}
                  </button>
                )}

                {powerFail && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubsystem('EPS', isJupiter ? 'eps-rtg' : 'eps-megaflex');
                      setSubsystem('THERMAL', 'therm-active');
                      if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="w-full border border-[#FFC15E]/40 bg-[#FFC15E]/10 py-1 px-2 font-mono text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20 text-left cursor-pointer"
                  >
                    + {isJupiter
                      ? isEs
                        ? 'EQUIPAR GENERADOR RTG 5.2 AU + TÉRMICO ACTIVO'
                        : 'EQUIP 5.2 AU RTG POWER + ACTIVE THERMAL'
                      : isEs
                        ? 'DESPLEGAR ALAS SOLARES MEGA-FLEX (350W)'
                        : 'DEPLOY MEGA-FLEX SOLAR WINGS (350W)'}
                  </button>
                )}

                {telecomFail && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubsystem('TELECOM', destId === 'dest-l2' ? 'telecom-cubelct-laser' : 'telecom-xka');
                      setGroundStation(isJupiter ? 'gs-dsn-70m' : isDeepSpace ? 'gs-dsn-34m' : 'gs-near-earth');
                      if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="w-full border border-[#FFC15E]/40 bg-[#FFC15E]/10 py-1 px-2 font-mono text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20 text-left cursor-pointer"
                  >
                    + {isEs
                      ? `EQUIPAR BANDA X/KA + ESTACIÓN ${isJupiter ? 'DSN 70M' : isDeepSpace ? 'DSN 34M' : 'NEN'}`
                      : `EQUIP X/KA DISH + ${isJupiter ? 'DSN 70M' : isDeepSpace ? 'DSN 34M' : 'NEN'} STATION`}
                  </button>
                )}

                {deltaVLow && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubsystem('PROPULSION', 'prop-biprop');
                      if (destId !== 'dest-leo') setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
                      if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="w-full border border-[#FFC15E]/40 bg-[#FFC15E]/10 py-1 px-2 font-mono text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20 text-left cursor-pointer"
                  >
                    + {isEs ? 'PROPULSIÓN BIPROPELENTE (3,673 M/S ΔV)' : 'BIPROPELLANT SYSTEM (3,673 M/S ΔV)'}
                  </button>
                )}

                {missingPayloads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      for (const pid of missingPayloads) togglePayload(pid);
                      if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="w-full border border-[#FFC15E]/40 bg-[#FFC15E]/10 py-1 px-2 font-mono text-[9px] text-[#FFC15E] hover:bg-[#FFC15E]/20 text-left cursor-pointer"
                  >
                    + {isEs ? 'EQUIPAR INSTRUMENTO CIENTÍFICO OBLIGATORIO' : 'EQUIP REQUIRED SCIENCE PAYLOAD'}
                  </button>
                )}

                {testingFail && (
                  <button
                    type="button"
                    onClick={() => {
                      runFullVVSuite();
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="w-full border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 py-1 px-2 font-mono text-[9px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20 text-left cursor-pointer"
                  >
                    + {isEs ? 'APROBAR SUITE AMBIENTAL CSLI & INHIBICIÓN 35 MIN' : 'PASS CSLI ENVIRONMENTAL SUITE & 35 MIN INHIBIT'}
                  </button>
                )}
              </div>
            </div>
          );
        })()}
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
    if (level1TutorialStep === 8) {
      setLevel1TutorialStep(9);
    }
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
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
          {isEs ? 'AUDITORÍA DE MÁRGENES MCR' : 'MCR MARGIN AUDIT'}
        </div>
        <button
          type="button"
          onClick={() => openSubmoduleGuide('MCR_GATE')}
          className="flex items-center gap-1 rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-2 py-0.5 font-mono text-[9px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
          title={isEs ? 'Ver criterios MCR y estándares cuantitativos' : 'View MCR criteria and quantitative standards'}
        >
          <Info className="h-3 w-3" />
          <span>{isEs ? 'INFO MCR' : 'MCR INFO'}</span>
        </button>
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
            ? '[CADET] Modo Cadete: las tarjetas en cian indican al menos ≥35% de margen seguro para despegar; si ves amarillo o rojo, usa las correcciones rápidas o ajusta en CML 3.'
            : '[CADET] Cadet Guide: cyan cards confirm ≥35% safety reserve for launch; yellow or red cards show exactly what to adjust in CML 3 or via Quick Fixes.'}
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
