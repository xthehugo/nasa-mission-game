import { motion } from 'framer-motion';
import { useMissionStore } from '../store';
import { computeLevelStars } from './holoAudio';

export function CommanderHudBanner() {
  const {
    language,
    experienceMode,
    phase,
    commanderName,
    missionCustomName,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
  } = useMissionStore();

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const extraKg =
    phase === 'CML_4'
      ? ((tankFillPercent + oxidizerFillPercent - 160) / 100) *
        Math.max(2, metrics.propellantMass_kg * 0.25)
      : 0;
  const starInfo = computeLevelStars(
    metrics,
    concurrentConflicts.length,
    experienceMode,
    activeRandomEvent,
    extraKg,
  );

  const overMass = starInfo.effectiveMassKg > metrics.launchCapacity_kg || !metrics.volume.isCompliant;
  const powerDeficit = metrics.power.generatedAtDestination_W < metrics.power.eclipseRequired_W;
  const rfRed = metrics.telecom.status === 'RED';

  let vegaText = '';
  if (overMass) {
    vegaText = isCadet
      ? isEs
        ? `${commanderName}: masa o cofia rebasada (${starInfo.effectiveMassKg.toFixed(1)} kg). Aligera tanques o escala el lanzador.`
        : `${commanderName}: mass or fairing exceeded (${starInfo.effectiveMassKg.toFixed(1)} kg). Trim propellant or upgrade rocket.`
      : `ALARM MASS: ${starInfo.effectiveMassKg.toFixed(1)}/${metrics.launchCapacity_kg} KG · VOL ${metrics.volume.used_U}/${metrics.volume.maxFairing_U}U.`;
  } else if (powerDeficit) {
    vegaText = isCadet
      ? isEs
        ? `${commanderName}: la energía cae en eclipse. Despliega alas solares mayores o usa RTG.`
        : `${commanderName}: eclipse power deficit detected. Deploy larger solar wings or RTG.`
      : `ALARM EPS: ${metrics.power.generatedAtDestination_W.toFixed(0)}W < ${metrics.power.eclipseRequired_W.toFixed(0)}W ECLIPSE.`;
  } else if (rfRed) {
    vegaText = isCadet
      ? isEs
        ? `${commanderName}: señal débil hacia Tierra. Cambia a Banda X/Ka o antena DSN.`
        : `${commanderName}: weak RF link to Earth. Upgrade to X/Ka dish or DSN ground antenna.`
      : `ALARM RF LINK: ${metrics.telecom.linkMargin_dB.toFixed(1)} DB < REQ.`;
  } else if (activeRandomEvent !== 'NONE') {
    vegaText =
      activeRandomEvent === 'BUDGET_CUT'
        ? isEs
          ? `EVENTO: Recorte presupuestal activo. Mantén al menos 15% de reserva en ${missionCustomName}.`
          : `EVENT: Budget cut active. Keep at least 15% reserve on ${missionCustomName}.`
        : activeRandomEvent === 'SOLAR_STORM'
          ? isEs
            ? `EVENTO: Tormenta Solar (-10% margen EPS). Aumenta generación eléctrica.`
            : `EVENT: Solar storm (-10% EPS margin). Boost power generation.`
          : isEs
            ? `EVENTO: Penalización térmica (+8% masa). Vigila el límite del lanzador.`
            : `EVENT: Thermal mass penalty (+8% mass). Watch launch cap.`;
  } else if (isCadet) {
    const byPhase = {
      CML_1: isEs
        ? `Comandante ${commanderName}, ajusta el chasis en alambre y define la misión de ${missionCustomName}.`
        : `Commander ${commanderName}, size the wireframe chassis and define ${missionCustomName}.`,
      CML_2: isEs
        ? `Arrastra altitud e inclinación para ver cómo cambia el periodo orbital en vivo.`
        : `Drag altitude and inclination sliders to watch orbital period respond live.`,
      CML_3: isEs
        ? `Compara los 3 hologramas superiores y optimiza los 7 subsistemas sin perder estrellas.`
        : `Compare the 3 top holograms and balance all 7 subsystems cleanly.`,
      CML_4: isEs
        ? `Llena los tanques de combustible y oxidante vigilando no pasar el límite del cohete.`
        : `Fill propellant and oxidizer tanks without exceeding launcher mass.`,
      CML_5: isEs
        ? `El escáner láser audita cada pieza. Mantén márgenes ≥35% y firma la autorización MCR.`
        : `Laser V&V audits every subsystem. Reach ≥35% margins and hold to sign MCR.`,
      SIMULATION: isEs
        ? `Inicia el lanzamiento y resuelve las 3 crisis orbitales para ganar las 3 estrellas.`
        : `Launch sequence ready. Resolve all 3 flight crises to claim 3 stars.`,
    };
    vegaText = byPhase[phase];
  } else {
    vegaText = `CMDR ${commanderName} // MASS ${metrics.dryMass.marginPercent.toFixed(1)}% · EPS ${metrics.power.marginPercent.toFixed(1)}% · RF ${metrics.telecom.linkMargin_dB.toFixed(1)}dB · ${concurrentConflicts.length} CONFLICTS.`;
  }

  return (
    <div className="border-b border-[#5FF3FF]/20 pb-3.5">
      <div className="flex items-start gap-3">
        {/* Wireframe Geometric Portrait of Commander Vega */}
        <div className="shrink-0 border border-[#5FF3FF]/35 bg-[#04080F] p-1.5">
          <svg viewBox="0 0 48 48" className="h-11 w-11">
            <polygon points="24,4 38,14 38,32 24,42 10,32 10,14" fill="none" stroke="#5FF3FF" strokeWidth="1" />
            <polygon points="15,17 33,17 31,26 17,26" fill="none" stroke="#5FF3FF" strokeWidth="1" />
            <line x1="18" y1="32" x2="30" y2="32" stroke="#FFC15E" strokeWidth="1" />
            {!reducedMotion &&
              [20, 24, 28].map((x, idx) => (
                <motion.line
                  key={x}
                  x1={x}
                  x2={x}
                  y1="36"
                  stroke="#5FF3FF"
                  strokeWidth="1"
                  animate={{ y2: [38, 41 - idx, 38] }}
                  transition={{ repeat: Infinity, duration: 0.9 + idx * 0.15 }}
                />
              ))}
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
            <span className="text-[#5FF3FF]">
              {isEs ? 'COMANDANTE VEGA · CANAL EN VIVO' : 'COMMANDER VEGA · LIVE LINK'}
            </span>
            <span className={overMass || powerDeficit || rfRed ? 'text-[#FF4D6D]' : 'text-slate-400'}>
              {isCadet ? 'CADETE' : 'JPL HARDCORE'}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-200">{vegaText}</p>
        </div>
      </div>

      {/* Star Criteria */}
      <div className="mt-3 space-y-1 font-mono text-[10px] tracking-[0.14em] uppercase">
        <div className="text-slate-400">{isEs ? 'PARA GANAR ESTRELLAS' : 'STAR CRITERIA'}</div>
        <div className={starInfo.marginOk ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
          ▸ {isEs ? `MARGEN MAYOR A ${isCadet ? 35 : 40}%` : `MARGIN OVER ${isCadet ? 35 : 40}%`}
        </div>
        <div className={starInfo.zeroConflicts ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
          ▸ {isEs ? 'CERO CONFLICTOS' : 'ZERO CONFLICTS'}
        </div>
        <div className={starInfo.budgetOk ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
          ▸ {isEs ? 'BAJO PRESUPUESTO' : 'UNDER BUDGET'}
        </div>
      </div>
    </div>
  );
}
