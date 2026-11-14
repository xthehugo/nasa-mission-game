import type {
  InteractiveCrisisDilemma,
  LocalizedText,
  MissionGrade,
  MissionSelection,
  PhysicsMetrics,
  RunMissionSimulationFn,
  SimulationEvent,
} from '../types/mission';
import { findDestinationById, findObjectiveById, findSubsystemById } from './catalog';

function buildMissionDilemmas(
  selection: MissionSelection,
  metrics: PhysicsMetrics,
): InteractiveCrisisDilemma[] {
  const destination = findDestinationById(selection.destinationId);
  const isDeepSpace =
    destination.id === 'dest-mars' || destination.id === 'dest-jupiter';
  const hasPassiveThermal = selection.thermalId === 'therm-passive';

  const solarStormDilemma: InteractiveCrisisDilemma = {
    id: 'crisis-solar-cme',
    phase: 'CRUISE_SPACE_WEATHER',
    missionDay: isDeepSpace ? 94 : 18,
    title: {
      en: 'X-Class Coronal Mass Ejection (CME) Inbound',
      es: 'Tormenta Solar Clase X (CME) en Curso de Colisión',
    },
    situation: {
      en: `Space weather sensors detect an intense solar particle surge hitting ${destination.name.en} trajectory in 14 minutes. Unshielded electronics risk latch-ups and solar array degradation.`,
      es: `Sensores de clima espacial detectan una eyección solar severa rumbo a ${destination.name.es} en 14 minutos. La electrónica sin protección corre riesgo de fallo y degradación.`,
    },
    triggeredBySubsystem: 'EPS',
    options: [
      {
        id: 'opt-safe-mode',
        label: {
          en: 'Command Autonomous Safe Mode & Feather Solar Wings',
          es: 'Activar Modo Seguro Autónomo y Girar Alas Solares',
        },
        engineeringJustification: {
          en: 'Powers down non-essential instruments to reduce current spikes and angles solar panels edge-on to minimize radiation impact.',
          es: 'Apaga instrumentos no esenciales para evitar cortocircuitos y orienta los paneles de canto minimizando daño por radiación.',
        },
        powerImpact_W: metrics.power.marginPercent >= 35 ? -10 : -22,
        propellantImpact_pct: -2,
        scienceScoreImpact: 12,
        isOptimal: true,
        outcomeNarrative: {
          en: 'Spacecraft weathered the CME with zero hardware loss; flight computers resumed nominal operations automatically.',
          es: 'La nave superó la tormenta solar sin daños en el hardware y retomó operaciones automáticamente.',
        },
      },
      {
        id: 'opt-push-science',
        label: {
          en: 'Keep Science Payload & Transmitters at 100% Power',
          es: 'Mantener Ciencia y Transmisión al 100% Durante la Tormenta',
        },
        engineeringJustification: {
          en: 'Prioritizes continuous data capture, risking single-event upsets in avionics and power bus brownouts.',
          es: 'Prioriza capturar datos continuos, arriesgando reinicios de computadora y caídas de voltaje en el bus.',
        },
        powerImpact_W: -45,
        propellantImpact_pct: 0,
        scienceScoreImpact: -18,
        isOptimal: false,
        outcomeNarrative: {
          en: 'Radiation induced a memory bit-flip and tripped a power breaker, losing 6 days of science observations.',
          es: 'La radiación provocó un fallo de memoria y disparó una protección eléctrica, perdiendo 6 días de ciencia.',
        },
      },
    ],
  };

  const thermalEclipseDilemma: InteractiveCrisisDilemma = {
    id: 'crisis-eclipse-thermal',
    phase: 'SCIENCE_OPERATIONS',
    missionDay: isDeepSpace ? 215 : 46,
    title: {
      en: hasPassiveThermal
        ? 'Severe Battery & Propellant Cooling During Deep Eclipse'
        : 'Peak Science Thermal & Attitude Control Load',
      es: hasPassiveThermal
        ? 'Caída Térmica Severa de Baterías en Eclipse Prolongado'
        : 'Pico Térmico y Saturación de Ruedas en Ciencia Activa',
    },
    situation: {
      en: hasPassiveThermal
        ? `During a ${Math.round(destination.eclipseFraction * 100)}% orbital shadow pass, passive MLI insulation cannot hold internal temperatures above -12°C.`
        : `Simultaneous science scanning and high-rate Earth downlink have pushed reaction wheels near saturation while battery temperatures drift upward.`,
      es: hasPassiveThermal
        ? `Durante una sombra orbital del ${Math.round(destination.eclipseFraction * 100)}%, el aislante pasivo MLI no logra retener el calor y las baterías caen a -12°C.`
        : `El escaneo científico y la transmisión simultánea saturaron las ruedas de reacción mientras sube la temperatura de la carga útil.`,
    },
    triggeredBySubsystem: hasPassiveThermal ? 'THERMAL' : 'ADCS',
    options: [
      {
        id: 'opt-duty-cycle',
        label: {
          en: 'Stagger Science & Downlink Windows + Dump Momentum',
          es: 'Alternar Ventanas de Ciencia/Descarga y Desaturar Ruedas',
        },
        engineeringJustification: {
          en: 'Uses NASA CONOPS duty cycling: captures science first, then slews to Earth for downlink, preserving thermal and power margins.',
          es: 'Aplica CONOPS oficial NASA: primero toma datos científicos y luego apunta a la Tierra para transmitir, protegiendo energía y temperatura.',
        },
        powerImpact_W: 15,
        propellantImpact_pct: -3,
        scienceScoreImpact: 14,
        isOptimal: true,
        outcomeNarrative: {
          en: 'Thermal balance stabilized within +18°C nominal band and full science data was queued cleanly for downlink.',
          es: 'El balance térmico se estabilizó en banda nominal (+18°C) y toda la ciencia quedó lista para descarga.',
        },
      },
      {
        id: 'opt-overdrive',
        label: {
          en: 'Force Continuous Simultaneous Radar/Optics & Downlink',
          es: 'Forzar Ciencia y Transmisión Simultánea Sin Pausa',
        },
        engineeringJustification: {
          en: 'Drains battery reserves during shadow passes and risks exceeding allowable thermal limits.',
          es: 'Agota las baterías en cada sombra y arriesga sobrecalentamiento de amplificadores.',
        },
        powerImpact_W: -38,
        propellantImpact_pct: -8,
        scienceScoreImpact: -14,
        isOptimal: false,
        outcomeNarrative: {
          en: 'Bus voltage sagged to 21V and triggered an emergency telemetry cutout during peak pass.',
          es: 'El voltaje cayó peligrosamente y provocó un corte de telemetría durante el paso de estación.',
        },
      },
    ],
  };

  const downlinkDilemma: InteractiveCrisisDilemma = {
    id: 'crisis-downlink-rain',
    phase: 'DATA_DOWNLINK',
    missionDay: isDeepSpace ? 340 : 88,
    title: {
      en: 'Ground Station Rain Attenuation & Antenna Handoff',
      es: 'Atenuación por Lluvia en Estación Terrena y Cambio de Enlace',
    },
    situation: {
      en: `Heavy storm clouds over the primary ground antenna reduced signal-to-noise by 3.5 dB during critical science playback (${metrics.telecom.linkMargin_dB} dB baseline margin).`,
      es: `Tormentas sobre la antena terrestre principal degradaron la señal en 3.5 dB durante la descarga crítica (margen base ${metrics.telecom.linkMargin_dB} dB).`,
    },
    triggeredBySubsystem: 'TELECOM',
    options: [
      {
        id: 'opt-adaptive-rate',
        label: {
          en: 'Step Down Bitrate (Adaptive Coding) & Switch to Backup Dish',
          es: 'Reducir Tasa de Bits (Codificación Adaptativa) y Cambiar de Antena',
        },
        engineeringJustification: {
          en: 'Lowering bitrate by 50% gains +3 dB in Eb/N0 link budget, guaranteeing error-free CCSDS science packet delivery.',
          es: 'Reducir a la mitad la tasa de bits gana +3 dB en el Link Budget Eb/N0, asegurando descarga sin pérdida de paquetes.',
        },
        powerImpact_W: 5,
        propellantImpact_pct: 0,
        scienceScoreImpact: 14,
        isOptimal: true,
        outcomeNarrative: {
          en: '100% of science telemetry packets verified intact at Ground Segment via adaptive CCSDS coding.',
          es: 'El 100% de los paquetes científicos llegaron intactos al Segmento Terreno mediante codificación adaptativa.',
        },
      },
      {
        id: 'opt-max-bitrate',
        label: {
          en: 'Hold Maximum Bitrate Despite Storm Noise',
          es: 'Mantener Máxima Velocidad Pese a la Tormenta',
        },
        engineeringJustification: {
          en: 'Maintains high throughput speed at the cost of bit errors if link margin drops below 0 dB.',
          es: 'Mantiene velocidad máxima, pero dispara errores de bits si el margen cae cerca de 0 dB.',
        },
        powerImpact_W: -15,
        propellantImpact_pct: 0,
        scienceScoreImpact: -16,
        isOptimal: false,
        outcomeNarrative: {
          en: 'Packet corruption forced partial data retransmission, reducing delivered science volume.',
          es: 'La corrupción de paquetes obligó a retransmitir datos y redujo el volumen científico recuperado.',
        },
      },
    ],
  };

  return [solarStormDilemma, thermalEclipseDilemma, downlinkDilemma];
}

function gradeFromScore(score: number, success: boolean): MissionGrade {
  if (!success) return 'FAIL';
  if (score >= 90) return 'S';
  if (score >= 78) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'FAIL';
}

export const runMissionSimulation: RunMissionSimulationFn = (
  selection: MissionSelection,
  metrics: PhysicsMetrics,
  resolvedChoices: Record<string, string> = {},
) => {
  const objective = findObjectiveById(selection.objectiveId);
  const destination = findDestinationById(selection.destinationId);
  const propulsion = findSubsystemById(selection.propulsionId);
  const telecom = findSubsystemById(selection.telecomId);

  const dilemmas = buildMissionDilemmas(selection, metrics);

  let runningPowerW = metrics.power.generatedAtDestination_W - metrics.power.cbe;
  let runningFuelPct = 100;
  let totalDataGB = 0;
  let thermalC = 20;

  // Base engineering score grounded in NASA MCR compliance
  let score = 60;
  if (metrics.overallMCRStatus === 'GREEN') score += 15;
  else if (metrics.overallMCRStatus === 'YELLOW') score += 5;
  else score -= 25;

  const events: SimulationEvent[] = [];

  // Phase 1: Launch & Ascent
  const launchBlocked =
    !metrics.volume.isCompliant ||
    metrics.wetMass_kg > metrics.launchCapacity_kg;
  events.push({
    id: 'evt-launch',
    phase: 'LAUNCH_ASCENT',
    timestampMissionDays: 0,
    title: {
      en: launchBlocked
        ? 'Launch Abort — Fairing / Mass Limit Exceeded'
        : 'Nominal Liftoff & Fairing Separation',
      es: launchBlocked
        ? 'Lanzamiento Abortado — Exceso de Cofia o Masa'
        : 'Despegue Nominal y Separación de Cofia',
    },
    description: launchBlocked
      ? {
          en: `Launch segment rejected payload: ${metrics.wetMass_kg} kg wet mass vs ${metrics.launchCapacity_kg} kg rocket limit (${metrics.volume.used_U}U / ${metrics.volume.maxFairing_U}U).`,
          es: `El segmento de lanzamiento rechazó la carga: ${metrics.wetMass_kg} kg frente a límite de ${metrics.launchCapacity_kg} kg (${metrics.volume.used_U}U / ${metrics.volume.maxFairing_U}U).`,
        }
      : {
          en: `Payload (${metrics.wetMass_kg} kg wet, ${metrics.volume.used_U}U) injected cleanly into initial parking orbit.`,
          es: `Carga (${metrics.wetMass_kg} kg húmedos, ${metrics.volume.used_U}U) inyectada con éxito en órbita inicial.`,
        },
    severity: launchBlocked ? 'CRITICAL' : 'SUCCESS',
    subsystemAffected: 'LAUNCH_VEHICLE',
    telemetrySnapshot: {
      powerBalance_W: Math.round(runningPowerW),
      propellantRemainingPct: 100,
      dataTransmitted_GB: 0,
      thermalStatusC: 24,
    },
  });

  // Phase 2: Orbit Insertion
  const canReachDeltaV =
    !launchBlocked && metrics.deltaV_available_ms >= metrics.deltaV_required_ms;
  const fuelBurnFraction =
    metrics.wetMass_kg > 0
      ? Math.min(92, (metrics.propellantMass_kg / metrics.wetMass_kg) * 100)
      : 0;
  runningFuelPct = canReachDeltaV
    ? Math.max(8, Math.round(100 - fuelBurnFraction * 0.85))
    : 0;

  events.push({
    id: 'evt-insertion',
    phase: 'ORBIT_INSERTION',
    timestampMissionDays: destination.id === 'dest-leo' ? 1 : 45,
    title: {
      en: canReachDeltaV
        ? `${destination.name.en} Insertion Burn Complete`
        : 'Orbit Insertion Failure — Insufficient Delta-V',
      es: canReachDeltaV
        ? `Inserción en ${destination.name.es} Completada`
        : 'Fallo de Inserción Orbital — Delta-V Insuficiente',
    },
    description: canReachDeltaV
      ? {
          en: `${propulsion?.name.en ?? 'Propulsion'} (Isp ${propulsion?.isp_s ?? 68} s) delivered ${metrics.deltaV_required_ms} m/s Delta-V successfully.`,
          es: `${propulsion?.name.es ?? 'Propulsión'} (Isp ${propulsion?.isp_s ?? 68} s) completó los ${metrics.deltaV_required_ms} m/s de Delta-V requeridos.`,
        }
      : {
          en: `Available Delta-V (${metrics.deltaV_available_ms} m/s) fell short of ${metrics.deltaV_required_ms} m/s needed to capture orbit.`,
          es: `El Delta-V disponible (${metrics.deltaV_available_ms} m/s) no alcanzó los ${metrics.deltaV_required_ms} m/s necesarios.`,
        },
    severity: canReachDeltaV ? 'SUCCESS' : 'CRITICAL',
    subsystemAffected: 'PROPULSION',
    telemetrySnapshot: {
      powerBalance_W: Math.round(runningPowerW),
      propellantRemainingPct: runningFuelPct,
      dataTransmitted_GB: 0.2,
      thermalStatusC: 19,
    },
  });

  // Apply crisis decisions across Phases 3, 4, 5
  const [cmeDilemma, thermalDilemma, downlinkDilemma] = dilemmas;

  const resolveOption = (dilemma: typeof cmeDilemma) => {
    const choiceId = resolvedChoices[dilemma.id];
    return (
      dilemma.options.find((o) => o.id === choiceId) ?? dilemma.options[0]
    );
  };

  // Phase 3: Cruise & Space Weather
  const cmeChoice = resolveOption(cmeDilemma);
  runningPowerW += cmeChoice.powerImpact_W;
  runningFuelPct = Math.max(0, runningFuelPct + cmeChoice.propellantImpact_pct);
  score += resolvedChoices[cmeDilemma.id] ? cmeChoice.scienceScoreImpact : 0;

  events.push({
    id: 'evt-cruise-cme',
    phase: 'CRUISE_SPACE_WEATHER',
    timestampMissionDays: cmeDilemma.missionDay,
    title: cmeDilemma.title,
    description: cmeChoice.outcomeNarrative,
    severity: cmeChoice.isOptimal ? 'INFO' : 'WARNING',
    subsystemAffected: 'EPS',
    telemetrySnapshot: {
      powerBalance_W: Math.round(runningPowerW),
      propellantRemainingPct: runningFuelPct,
      dataTransmitted_GB: 1.4,
      thermalStatusC: 15,
    },
  });

  // Phase 4: Science Operations
  const thermalChoice = resolveOption(thermalDilemma);
  runningPowerW += thermalChoice.powerImpact_W;
  runningFuelPct = Math.max(
    0,
    runningFuelPct + thermalChoice.propellantImpact_pct,
  );
  thermalC = thermalChoice.isOptimal ? 18 : -9;
  score += resolvedChoices[thermalDilemma.id]
    ? thermalChoice.scienceScoreImpact
    : 0;

  const powerCollapse = runningPowerW < -20 || metrics.power.marginPercent < 0;
  totalDataGB += powerCollapse
    ? 0.5
    : ((telecom?.maxDataRate_kbps ?? 64) * 0.08);

  events.push({
    id: 'evt-science-ops',
    phase: 'SCIENCE_OPERATIONS',
    timestampMissionDays: thermalDilemma.missionDay,
    title: powerCollapse
      ? {
          en: 'Low-Voltage Brownout During Science Pass',
          es: 'Caída Crítica de Voltaje en Pase Científico',
        }
      : {
          en: `Primary Science Collection: ${objective.title.en}`,
          es: `Recolección Científica Primaria: ${objective.title.es}`,
        },
    description: powerCollapse
      ? {
          en: 'Negative EPS margin forced premature payload shutdown during eclipse.',
          es: 'El margen eléctrico negativo forzó el apagado de instrumentos durante el eclipse.',
        }
      : thermalChoice.outcomeNarrative,
    severity: powerCollapse
      ? 'CRITICAL'
      : thermalChoice.isOptimal
        ? 'SUCCESS'
        : 'WARNING',
    subsystemAffected: 'THERMAL',
    telemetrySnapshot: {
      powerBalance_W: Math.round(runningPowerW),
      propellantRemainingPct: runningFuelPct,
      dataTransmitted_GB: Math.round(totalDataGB * 10) / 10,
      thermalStatusC: thermalC,
    },
  });

  // Phase 5: Data Downlink
  const downlinkChoice = resolveOption(downlinkDilemma);
  score += resolvedChoices[downlinkDilemma.id]
    ? downlinkChoice.scienceScoreImpact
    : 0;
  const linkBroken =
    metrics.telecom.linkMargin_dB + (downlinkChoice.isOptimal ? 3 : -3.5) < 0;
  if (linkBroken) score -= 20;
  totalDataGB += linkBroken ? 0.2 : (telecom?.maxDataRate_kbps ?? 64) * 0.14;

  events.push({
    id: 'evt-downlink',
    phase: 'DATA_DOWNLINK',
    timestampMissionDays: downlinkDilemma.missionDay,
    title: linkBroken
      ? {
          en: 'Telemetry Blackout — Link Margin Below 0 dB',
          es: 'Pérdida de Señal — Margen de Enlace Bajo 0 dB',
        }
      : {
          en: 'Science Data Products Delivered to User Segment',
          es: 'Datos Científicos Entregados al Segmento de Usuario',
        },
    description: linkBroken
      ? {
          en: 'Signal faded beneath atmospheric noise floor. Select DSN 34m/70m or higher-gain X/Ka/Laser.',
          es: 'La señal quedó bajo el piso de ruido. Selecciona antenas DSN 34m/70m o Banda X/Ka/Láser.',
        }
      : downlinkChoice.outcomeNarrative,
    severity: linkBroken
      ? 'CRITICAL'
      : downlinkChoice.isOptimal
        ? 'SUCCESS'
        : 'WARNING',
    subsystemAffected: 'TELECOM',
    telemetrySnapshot: {
      powerBalance_W: Math.round(runningPowerW),
      propellantRemainingPct: runningFuelPct,
      dataTransmitted_GB: Math.round(totalDataGB * 10) / 10,
      thermalStatusC: thermalC,
    },
  });

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const missionSuccess =
    !launchBlocked &&
    canReachDeltaV &&
    !powerCollapse &&
    !linkBroken &&
    clampedScore >= 50;

  const lessonsLearned: LocalizedText[] = [
    {
      en: `SWaP-C Trade-off: At ${destination.heliocentricDistanceAU} AU, solar flux drops to ${destination.solarIrradiance_Wm2} W/m² (1/R² law), directly shaping EPS sizing.`,
      es: `Compromiso SWaP-C: A ${destination.heliocentricDistanceAU} AU la irradiancia solar cae a ${destination.solarIrradiance_Wm2} W/m² (ley 1/R²), condicionando todo el sistema eléctrico.`,
    },
    {
      en: `JPL Margins: Building >= 35% mass & power reserves (CBE + MGA by TRL) absorbs unexpected in-flight storms and eclipse loads.`,
      es: `Márgenes JPL: Diseñar con >= 35% de reserva en masa y potencia (CBE + MGA según TRL) protege la misión ante tormentas solares y eclipses.`,
    },
    {
      en: `Benchmark Comparison: Real-world ${objective.realWorldBenchmark.missionName} solved similar orbital constraints with ${objective.realWorldBenchmark.actualMass_kg} kg and ${objective.realWorldBenchmark.actualPower_W} W.`,
      es: `Referencia Real: La misión ${objective.realWorldBenchmark.missionName} resolvió retos equivalentes con ${objective.realWorldBenchmark.actualMass_kg} kg y ${objective.realWorldBenchmark.actualPower_W} W.`,
    },
  ];

  return {
    missionSuccess,
    scienceScore: clampedScore,
    overallGrade: gradeFromScore(clampedScore, missionSuccess),
    events,
    dilemmas,
    lessonsLearned,
    finalMetrics: metrics,
  };
};
