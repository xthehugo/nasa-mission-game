import {
  NASA_PHYSICS_CONSTANTS,
  type FlightDirectorAdvice,
  type MCRChecklistItem,
  type MCRStatus,
  type MissionSelection,
  type PhysicsMetrics,
  type SubsystemOption,
} from '../types/mission';
import {
  findDestinationById,
  findGroundStationById,
  findObjectiveById,
  findSubsystemById,
  SUBSYSTEM_CATALOG,
} from './catalog';

const SPEED_OF_LIGHT_MS = 299_792_458;
const ANNUAL_SOLAR_DEGRADATION = 0.025;
const BUS_PATH_EFFICIENCY = 0.88;
const BATTERY_CHARGE_EFFICIENCY = 0.9;
const BATTERY_DISCHARGE_EFFICIENCY = 0.9;
const REQUIRED_EBN0_DB = 3.0; // CCSDS LDPC/Turbo coded modem baseline
const TX_LINE_LOSS_DB = 1.5;

function statusFromMargin(marginPercent: number): MCRStatus {
  if (marginPercent >= NASA_PHYSICS_CONSTANTS.MCR_GREEN_MARGIN_PCT) {
    return 'GREEN';
  }
  if (marginPercent >= NASA_PHYSICS_CONSTANTS.MCR_YELLOW_MARGIN_PCT) {
    return 'YELLOW';
  }
  return 'RED';
}

function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function resolveSelectedSubsystems(
  selection: MissionSelection,
): SubsystemOption[] {
  const pickedPayloads = selection.payloadIds
    .map((id) => findSubsystemById(id))
    .filter((item): item is SubsystemOption => item !== undefined);

  const payloads =
    pickedPayloads.length > 0
      ? pickedPayloads
      : [SUBSYSTEM_CATALOG.find((s) => s.category === 'PAYLOAD')!];

  const singleIds = [
    selection.propulsionId,
    selection.epsId,
    selection.telecomId,
    selection.thermalId,
    selection.adcsId,
    selection.launchVehicleId,
  ];

  const singles = singleIds
    .map((id) => findSubsystemById(id))
    .filter((item): item is SubsystemOption => item !== undefined);

  return [...payloads, ...singles];
}

function worstStatus(statuses: MCRStatus[]): MCRStatus {
  if (statuses.includes('RED')) return 'RED';
  if (statuses.includes('YELLOW')) return 'YELLOW';
  return 'GREEN';
}

function buildFlightDirectorAdvice(
  overallStatus: MCRStatus,
  checklist: MCRChecklistItem[],
  dryMassStatus: MCRStatus,
  powerStatus: MCRStatus,
  telecomStatus: MCRStatus,
  costStatus: MCRStatus,
  volumeCompliant: boolean,
): FlightDirectorAdvice {
  const failing = checklist.filter((item) => item.status === 'RED');
  const warnings = checklist.filter((item) => item.status === 'YELLOW');

  if (overallStatus === 'GREEN') {
    return {
      status: 'GREEN',
      headline: {
        en: 'MCR Cleared — All NASA JPL Margins >= 35%',
        es: 'MCR Aprobado — Márgenes NASA JPL >= 35% Cumplidos',
      },
      humanExplanation: {
        en: 'Outstanding systems engineering! Dry mass, solar/RTG power, telecom link dB, fairing envelope, and cost reserves all pass NASA Mission Concept Review.',
        es: '¡Excelente ingeniería concurrente! Masa seca, energía, enlace dB, volumen de cofia y presupuesto cumplen la revisión MCR de la NASA.',
      },
    };
  }

  if (overallStatus === 'YELLOW') {
    const firstWarn = warnings[0];
    return {
      status: 'YELLOW',
      headline: {
        en: 'MCR Watch Alert (Margin 25%–34%) — Tight Reserves',
        es: 'Alerta MCR (Margen 25%–34%) — Reservas Ajustadas',
      },
      humanExplanation: firstWarn
        ? firstWarn.feedback
        : {
            en: 'Margins are between 25% and 34%. You can fly with caution, or return to CML 3 Trade Space to add safety buffer.',
            es: 'Tus márgenes están entre 25% y 34%. Puedes simular con riesgo o volver a CML 3 para ganar holgura.',
          },
    };
  }

  // RED status prioritized diagnosis
  if (!volumeCompliant) {
    return {
      status: 'RED',
      headline: {
        en: 'MCR Failed — Fairing Volume Exceeded',
        es: 'MCR Reprobado — Exceso de Volumen en Cofia',
      },
      humanExplanation: {
        en: 'Your assembled instruments and subsystems do not fit inside the selected rocket fairing. Upgrade the launch vehicle or trim payload volume in CML 3.',
        es: 'Tus instrumentos no caben dentro de la cofia del cohete elegido. Cambia a un lanzador mayor o reduce volumen en CML 3.',
      },
    };
  }

  if (dryMassStatus === 'RED') {
    return {
      status: 'RED',
      headline: {
        en: 'MCR Failed — Launch Mass or Propellant Overload',
        es: 'MCR Reprobado — Sobrecarga de Masa o Propelente',
      },
      humanExplanation: {
        en: 'Tsiolkovsky propellant + dry mass exceeds safe rocket capacity (<25% margin). Pick higher-Isp propulsion (Biprop/Hall) or a larger launcher.',
        es: 'La masa seca más el propelente (Tsiolkovsky) supera el límite seguro del cohete (<25%). Usa propulsión de mayor Isp o un lanzador más grande.',
      },
    };
  }

  if (powerStatus === 'RED') {
    return {
      status: 'RED',
      headline: {
        en: 'MCR Failed — Negative Power / Eclipse Deficit',
        es: 'MCR Reprobado — Déficit Eléctrico en Órbita/Eclipse',
      },
      humanExplanation: {
        en: 'Power generation at your destination distance is too low to sustain active science and eclipse recharge. Upgrade solar arrays or switch to RTG.',
        es: 'La generación eléctrica a esa distancia del Sol no alcanza para los instrumentos ni recarga en eclipse. Mejora los paneles o usa RTG.',
      },
    };
  }

  if (telecomStatus === 'RED') {
    return {
      status: 'RED',
      headline: {
        en: 'MCR Failed — Telecom Link Margin Below Threshold',
        es: 'MCR Reprobado — Margen de Señal dB Insuficiente',
      },
      humanExplanation: {
        en: 'Signal cannot reach Earth reliably. Upgrade to X/Ka-Band or Laser, ensure 3-Axis ADCS pointing accuracy, and select NASA DSN ground antennas.',
        es: 'La señal no cierra el enlace con la Tierra. Usa Banda X/Ka o Láser, ADCS de 3 ejes para puntería fina y antenas NASA DSN.',
      },
    };
  }

  if (costStatus === 'RED') {
    return {
      status: 'RED',
      headline: {
        en: 'MCR Failed — Program Budget Exceeded',
        es: 'MCR Reprobado — Presupuesto de Misión Excedido',
      },
      humanExplanation: {
        en: 'Total mission cost exceeds the program cap. Descope high-cost instruments or select a more economical rideshare/small launcher.',
        es: 'El costo total supera el presupuesto del programa. Optimiza la carga útil o selecciona un lanzador más económico.',
      },
    };
  }

  const firstFail = failing[0];
  return {
    status: 'RED',
    headline: {
      en: 'MCR Failed — Critical Engineering Gap',
      es: 'MCR Reprobado — Falla Crítica de Ingeniería',
    },
    humanExplanation: firstFail
      ? firstFail.feedback
      : {
          en: 'Review the MCR checklist below and adjust subsystems in CML 3 Trade Space.',
          es: 'Revisa el checklist MCR inferior y ajusta los subsistemas en CML 3 Trade Space.',
        },
  };
}

export function evaluateMissionPhysics(
  selection: MissionSelection,
): PhysicsMetrics {
  const objective = findObjectiveById(selection.objectiveId);
  const destination = findDestinationById(selection.destinationId);
  const groundStation = findGroundStationById(selection.groundStationId);
  const subsystems = resolveSelectedSubsystems(selection);

  const propulsion = findSubsystemById(selection.propulsionId);
  const eps = findSubsystemById(selection.epsId);
  const telecom = findSubsystemById(selection.telecomId);
  const thermal = findSubsystemById(selection.thermalId);
  const adcs = findSubsystemById(selection.adcsId);
  const launchVehicle = findSubsystemById(selection.launchVehicleId);

  // 1. Dry Mass CBE + MGA + Predicted (kg)
  const dryMassCBE = subsystems.reduce((sum, s) => sum + s.massCBE_kg, 0);
  const dryMassMGA = subsystems.reduce(
    (sum, s) => sum + s.massCBE_kg * s.mgaContingencyFactor,
    0,
  );
  const dryMassPredicted = dryMassCBE + dryMassMGA;

  // 2. Tsiolkovsky Rocket Equation: wet mass & propellant mass
  const isp = Math.max(propulsion?.isp_s ?? 68, 1);
  const deltaVReq = destination.requiredDeltaV_ms;
  const massRatio = Math.exp(
    deltaVReq / (isp * NASA_PHYSICS_CONSTANTS.STANDARD_GRAVITY_MS2),
  );
  const safeMassRatio = Number.isFinite(massRatio)
    ? Math.min(massRatio, 1000)
    : 1000;
  const wetMass = dryMassPredicted * safeMassRatio;
  const propellantMass = Math.max(0, wetMass - dryMassPredicted);

  const launchCapacity = launchVehicle?.maxPayloadMass_kg ?? 45;
  const allowableDryMass = launchCapacity / safeMassRatio;
  const dryMassMarginPct =
    dryMassPredicted > 0
      ? ((allowableDryMass - dryMassPredicted) / dryMassPredicted) * 100
      : -100;

  const deltaVAvailable =
    launchCapacity > dryMassPredicted && dryMassPredicted > 0
      ? isp *
        NASA_PHYSICS_CONSTANTS.STANDARD_GRAVITY_MS2 *
        Math.log(launchCapacity / dryMassPredicted)
      : 0;

  const dryMassStatus: MCRStatus =
    wetMass > launchCapacity
      ? 'RED'
      : statusFromMargin(dryMassMarginPct);

  // 3. Solar / RTG Power Balance & EPS Margin
  const sunDistanceAU = Math.max(destination.heliocentricDistanceAU, 0.3);
  const degradationFactor = Math.pow(
    1 - ANNUAL_SOLAR_DEGRADATION,
    objective.targetDurationYears,
  );
  const isRTG = Boolean(eps?.isRTG);
  const rawBasePower1AU = eps?.powerGenerated1AU_W ?? 28;
  const generatedAtDestination = isRTG
    ? rawBasePower1AU * Math.pow(0.992, objective.targetDurationYears)
    : (rawBasePower1AU / (sunDistanceAU * sunDistanceAU)) *
      BUS_PATH_EFFICIENCY *
      degradationFactor;

  const activeNonPropNominal = subsystems.reduce(
    (sum, s) =>
      s.category === 'PROPULSION' || s.category === 'PAYLOAD'
        ? sum
        : sum + s.powerDrawNominal_W,
    0,
  );
  const payloadNominal = subsystems
    .filter((s) => s.category === 'PAYLOAD')
    .reduce((sum, s) => sum + s.powerDrawNominal_W, 0);
  const payloadPeak = subsystems
    .filter((s) => s.category === 'PAYLOAD')
    .reduce((sum, s) => sum + s.powerDrawPeak_W, 0);
  const propulsionCruiseDraw =
    propulsion?.propulsionType === 'ELECTRIC_HALL'
      ? propulsion.powerDrawPeak_W
      : (propulsion?.powerDrawNominal_W ?? 0);

  // Operational power CBE (Worst-case active science / transmission / electric cruise)
  const telecomPeakExtra = Math.max(
    0,
    (telecom?.powerDrawPeak_W ?? 0) - (telecom?.powerDrawNominal_W ?? 0),
  );
  const payloadPeakExtra = Math.max(0, payloadPeak - payloadNominal);

  // For pulsed high-power SAR radar or telecom bursts, batteries buffer 35% of peak spike while sun/RTG carries continuous load
  const continuousBaseLoad =
    activeNonPropNominal + payloadNominal + propulsionCruiseDraw;
  const worstCaseActiveLoad =
    continuousBaseLoad + 0.65 * payloadPeakExtra + 0.65 * telecomPeakExtra;

  // Eclipse recharge demand
  const fEcl = Math.min(Math.max(destination.eclipseFraction, 0), 0.75);
  const fSun = 1 - fEcl;
  const thermalEclipseExtra = Math.max(
    0,
    (thermal?.powerDrawPeak_W ?? 0) - (thermal?.powerDrawNominal_W ?? 0),
  );
  const eclipseLoad =
    activeNonPropNominal + payloadNominal * 0.5 + thermalEclipseExtra;

  const eclipseRequiredGen = isRTG
    ? Math.max(worstCaseActiveLoad, eclipseLoad)
    : (worstCaseActiveLoad * fSun +
        (eclipseLoad * fEcl) / BATTERY_DISCHARGE_EFFICIENCY) /
      (BATTERY_CHARGE_EFFICIENCY * fSun);

  // Average TRL MGA factor on EPS load prediction
  const powerMGA = subsystems.reduce(
    (sum, s) => sum + s.powerDrawNominal_W * s.mgaContingencyFactor,
    0,
  );
  const powerPredicted = eclipseRequiredGen + powerMGA * 0.35;
  const powerMarginPct =
    generatedAtDestination > 0
      ? ((generatedAtDestination - powerPredicted) / generatedAtDestination) *
        100
      : -100;
  const powerStatus =
    generatedAtDestination <= powerPredicted
      ? 'RED'
      : statusFromMargin(powerMarginPct);

  // 4. Telecom Link Budget (dB)
  const txPowerW = Math.max(telecom?.txPower_W ?? 2, 0.1);
  const txPowerDBW = 10 * Math.log10(txPowerW);
  const txGainDBi = telecom?.antennaGain_dBi ?? 3;
  const eirpDBW = txPowerDBW - TX_LINE_LOSS_DB + txGainDBi;

  const freqHz = Math.max((telecom?.freqGHz ?? 0.437) * 1e9, 1e6);
  const distanceMeters = Math.max(destination.distanceFromEarthKm * 1000, 1000);
  const wavelength = SPEED_OF_LIGHT_MS / freqHz;
  const freeSpaceLossDB =
    20 * Math.log10(wavelength / (4 * Math.PI * distanceMeters));

  const atmLossDB =
    (telecom?.freqGHz ?? 0.4) > 20
      ? -2.5
      : (telecom?.freqGHz ?? 0.4) > 2
        ? -1.2
        : -0.5;

  // Pointing loss penalty if ADCS is too coarse for narrow-beam Telecom
  const adcsDeg = adcs?.pointingAccuracy_deg ?? 5;
  const requiredDeg = telecom?.pointingAccuracy_deg ?? 15;
  const pointingLossDB = adcsDeg > requiredDeg ? -18.0 : -0.3;

  // Scale achievable data rate to objective minimum or telecom max capability
  const effectiveDataRateKbps = Math.min(
    telecom?.maxDataRate_kbps ?? 64,
    Math.max(objective.minDataRateKbps, 32),
  );
  const dataRateBps = Math.max(effectiveDataRateKbps * 1000, 1000);

  const receivedEbN0DB =
    eirpDBW +
    freeSpaceLossDB +
    atmLossDB +
    pointingLossDB +
    groundStation.figureOfMerit_G_T_dBK -
    NASA_PHYSICS_CONSTANTS.BOLTZMANN_DBW_K_HZ -
    10 * Math.log10(dataRateBps);

  const linkMarginDB = receivedEbN0DB - REQUIRED_EBN0_DB;
  const requiredLinkMarginDB = destination.linkMarginThreshold_dB;
  const meetsMinDataRate =
    (telecom?.maxDataRate_kbps ?? 0) >= objective.minDataRateKbps;

  let telecomStatus: MCRStatus = 'GREEN';
  if (!meetsMinDataRate || linkMarginDB < requiredLinkMarginDB) {
    telecomStatus = 'RED';
  } else if (linkMarginDB < requiredLinkMarginDB + 2.5) {
    telecomStatus = 'YELLOW';
  }

  // 5. Volume & Fairing Check
  const usedVolumeU = subsystems.reduce((sum, s) => sum + s.volume_U, 0);
  const maxFairingU = launchVehicle?.fairingVolume_U ?? 24;
  const volumeCompliant = usedVolumeU <= maxFairingU;

  // 6. Cost & Budget Check ($M USD)
  const durationMonths = objective.targetDurationYears * 12;
  const groundOpsCost = groundStation.costPerMonth_MillionsUSD * durationMonths;
  const hardwareCost = subsystems.reduce(
    (sum, s) => sum + s.cost_MillionsUSD,
    0,
  );
  const totalCostMillions = hardwareCost + groundOpsCost;
  const budgetCap = objective.baseBudgetMillions;
  const budgetReserve = budgetCap - totalCostMillions;
  const costMarginPct =
    budgetCap > 0 ? (budgetReserve / budgetCap) * 100 : -100;

  let costStatus: MCRStatus = 'GREEN';
  if (totalCostMillions > budgetCap) {
    costStatus = 'RED';
  } else if (costMarginPct < 10) {
    costStatus = 'YELLOW';
  }

  // 7. Science & Thermal Compatibility Checks
  const hasRequiredPayloads = objective.requiredPayloadIds.every((reqId) =>
    selection.payloadIds.includes(reqId),
  );
  const scienceSegmentStatus: MCRStatus = hasRequiredPayloads ? 'GREEN' : 'RED';

  const needsActiveThermal =
    destination.id !== 'dest-leo' ||
    selection.payloadIds.includes('pay-sar-radar') ||
    selection.payloadIds.includes('pay-ir-spectrometer');
  const isPassiveThermalOnly = thermal?.id === 'therm-passive';
  const thermalStatus: MCRStatus =
    needsActiveThermal && isPassiveThermalOnly
      ? destination.id === 'dest-jupiter' ||
        selection.payloadIds.includes('pay-sar-radar')
        ? 'RED'
        : 'YELLOW'
      : 'GREEN';

  // 8. Build 4-Segment NASA MCR Checklist
  const mcrChecklist: MCRChecklistItem[] = [
    {
      id: 'chk-user-science',
      segment: 'USER',
      label: {
        en: 'Required Science Payload & Data Rate',
        es: 'Instrumento Científico Requerido y Tasa de Datos',
      },
      valueSummary: hasRequiredPayloads
        ? `${roundTo(effectiveDataRateKbps, 0)} kbps`
        : 'Missing Payload',
      targetSummary: `>= ${objective.minDataRateKbps} kbps`,
      status: worstStatus([
        scienceSegmentStatus,
        meetsMinDataRate ? 'GREEN' : 'RED',
      ]),
      feedback: hasRequiredPayloads
        ? {
            en: 'Science Traceability Matrix satisfied: required instruments are onboard.',
            es: 'Matriz de Trazabilidad Científica cumplida: instrumentos requeridos a bordo.',
          }
        : {
            en: 'Select the mission-required science payload(s) to answer the primary science question.',
            es: 'Debes equipar el instrumento científico requerido para cumplir el objetivo de la misión.',
          },
    },
    {
      id: 'chk-space-mass',
      segment: 'SPACE',
      label: {
        en: 'Dry Mass Margin (JPL >= 35%)',
        es: 'Margen de Masa Seca (JPL >= 35%)',
      },
      valueSummary: `${roundTo(dryMassMarginPct, 1)}% (${roundTo(wetMass, 1)} kg wet)`,
      targetSummary: `>= 35% (<= ${launchCapacity} kg)`,
      status: dryMassStatus,
      feedback:
        dryMassStatus === 'GREEN'
          ? {
              en: `Dry mass predicted ${roundTo(dryMassPredicted, 1)} kg fits safely within ${launchCapacity} kg launcher capacity.`,
              es: `Masa seca predicha ${roundTo(dryMassPredicted, 1)} kg dentro de los ${launchCapacity} kg del lanzador.`,
            }
          : {
              en: `Wet mass (${roundTo(wetMass, 1)} kg incl. ${roundTo(propellantMass, 1)} kg fuel) leaves insufficient margin on ${launchCapacity} kg launcher.`,
              es: `Masa húmeda (${roundTo(wetMass, 1)} kg incl. ${roundTo(propellantMass, 1)} kg de combustible) reduce el margen del lanzador.`,
            },
    },
    {
      id: 'chk-space-power',
      segment: 'SPACE',
      label: {
        en: 'EPS Power & Eclipse Margin (JPL >= 35%)',
        es: 'Margen de Potencia EPS y Eclipse (JPL >= 35%)',
      },
      valueSummary: `${roundTo(powerMarginPct, 1)}% (${roundTo(generatedAtDestination, 0)} W vs ${roundTo(powerPredicted, 0)} W)`,
      targetSummary: '>= 35%',
      status: powerStatus,
      feedback:
        powerStatus === 'GREEN'
          ? {
              en: `Generates ${roundTo(generatedAtDestination, 0)} W at ${destination.heliocentricDistanceAU} AU covering active loads and eclipses.`,
              es: `Genera ${roundTo(generatedAtDestination, 0)} W a ${destination.heliocentricDistanceAU} AU cubriendo eclipses y picos.`,
            }
          : {
              en: `Only ${roundTo(generatedAtDestination, 0)} W generated at ${destination.heliocentricDistanceAU} AU vs ${roundTo(powerPredicted, 0)} W needed. Upgrade solar arrays or use RTG.`,
              es: `Solo genera ${roundTo(generatedAtDestination, 0)} W a ${destination.heliocentricDistanceAU} AU frente a ${roundTo(powerPredicted, 0)} W necesarios.`,
            },
    },
    {
      id: 'chk-space-thermal',
      segment: 'SPACE',
      label: {
        en: 'Thermal Survival & ADCS Pointing',
        es: 'Supervivencia Térmica y Apuntamiento ADCS',
      },
      valueSummary: `${adcsDeg}° · ${thermal?.id === 'therm-passive' ? 'Passive' : 'Active'}`,
      targetSummary: `<= ${requiredDeg}°`,
      status: worstStatus([
        thermalStatus,
        adcsDeg > requiredDeg ? 'RED' : 'GREEN',
      ]),
      feedback:
        adcsDeg > requiredDeg
          ? {
              en: `ADCS accuracy (${adcsDeg}°) is too coarse for your Telecom antenna (${requiredDeg}° required), causing -18 dB pointing loss.`,
              es: `La precisión ADCS (${adcsDeg}°) no alcanza para la antena elegida (requiere ${requiredDeg}°), causando -18 dB de pérdida.`,
            }
          : thermalStatus !== 'GREEN'
            ? {
                en: 'Passive MLI alone risks freezing electronics or overheating high-power radar; consider active thermal control.',
                es: 'El control pasivo MLI arriesga congelación en sombra o sobrecalentamiento; considera control térmico activo.',
              }
            : {
                en: 'Thermal loop and ADCS precision match mission environment and payload needs.',
                es: 'Control térmico y precisión ADCS alineados con el entorno y la carga útil.',
              },
    },
    {
      id: 'chk-launch-fairing',
      segment: 'LAUNCH',
      label: {
        en: 'Launch Fairing Envelope & Budget Cap',
        es: 'Volumen en Cofia y Presupuesto del Programa',
      },
      valueSummary: `${roundTo(usedVolumeU, 1)}U · $${roundTo(totalCostMillions, 1)}M`,
      targetSummary: `<= ${maxFairingU}U · <= $${budgetCap}M`,
      status: worstStatus([volumeCompliant ? 'GREEN' : 'RED', costStatus]),
      feedback: !volumeCompliant
        ? {
            en: `Spacecraft volume (${roundTo(usedVolumeU, 1)}U) exceeds ${maxFairingU}U rocket fairing.`,
            es: `El volumen (${roundTo(usedVolumeU, 1)}U) excede la cofia de ${maxFairingU}U del cohete.`,
          }
        : costStatus === 'RED'
          ? {
              en: `Estimated cost ($${roundTo(totalCostMillions, 1)}M) exceeds $${budgetCap}M cap.`,
              es: `El costo estimado ($${roundTo(totalCostMillions, 1)}M) supera el tope de $${budgetCap}M.`,
            }
          : {
              en: `Fits inside ${maxFairingU}U fairing with $${roundTo(budgetReserve, 1)}M reserve remaining.`,
              es: `Cabe en la cofia de ${maxFairingU}U con $${roundTo(budgetReserve, 1)}M de reserva.`,
            },
    },
    {
      id: 'chk-ground-link',
      segment: 'GROUND',
      label: {
        en: `Ground Telecom Link Margin (>= ${requiredLinkMarginDB} dB)`,
        es: `Margen de Enlace Terrestre (>= ${requiredLinkMarginDB} dB)`,
      },
      valueSummary: `${roundTo(linkMarginDB, 1)} dB`,
      targetSummary: `>= ${requiredLinkMarginDB} dB`,
      status: telecomStatus,
      feedback:
        telecomStatus === 'GREEN'
          ? {
              en: `Closed link at ${roundTo(linkMarginDB, 1)} dB via ${groundStation.name.en}.`,
              es: `Enlace cerrado con ${roundTo(linkMarginDB, 1)} dB usando ${groundStation.name.es}.`,
            }
          : {
              en: `Link margin is ${roundTo(linkMarginDB, 1)} dB (needs >= ${requiredLinkMarginDB} dB). Use DSN 34m/70m or higher-gain X/Ka/Laser telecom.`,
              es: `El margen es ${roundTo(linkMarginDB, 1)} dB (exige >= ${requiredLinkMarginDB} dB). Usa antena DSN 34m/70m o Banda X/Ka/Láser.`,
            },
    },
  ];

  const overallMCRStatus = worstStatus(mcrChecklist.map((c) => c.status));
  const flightDirectorAdvice = buildFlightDirectorAdvice(
    overallMCRStatus,
    mcrChecklist,
    dryMassStatus,
    powerStatus,
    telecomStatus,
    costStatus,
    volumeCompliant,
  );

  return {
    dryMass: {
      cbe: roundTo(dryMassCBE, 2),
      mga: roundTo(dryMassMGA, 2),
      predicted: roundTo(dryMassPredicted, 2),
      allowable: roundTo(allowableDryMass, 2),
      marginPercent: roundTo(dryMassMarginPct, 1),
      status: dryMassStatus,
    },
    propellantMass_kg: roundTo(propellantMass, 2),
    wetMass_kg: roundTo(wetMass, 2),
    launchCapacity_kg: launchCapacity,
    deltaV_available_ms: roundTo(deltaVAvailable, 0),
    deltaV_required_ms: deltaVReq,
    power: {
      cbe: roundTo(worstCaseActiveLoad, 1),
      mga: roundTo(powerMGA * 0.35, 1),
      predicted: roundTo(powerPredicted, 1),
      allowable: roundTo(generatedAtDestination, 1),
      marginPercent: roundTo(powerMarginPct, 1),
      status: powerStatus,
      generatedAtDestination_W: roundTo(generatedAtDestination, 1),
      eclipseRequired_W: roundTo(eclipseRequiredGen, 1),
    },
    telecom: {
      eirp_dBW: roundTo(eirpDBW, 2),
      freeSpaceLoss_dB: roundTo(freeSpaceLossDB, 2),
      receivedEbN0_dB: roundTo(receivedEbN0DB, 2),
      linkMargin_dB: roundTo(linkMarginDB, 2),
      requiredMargin_dB: requiredLinkMarginDB,
      dataRate_kbps: roundTo(effectiveDataRateKbps, 1),
      status: telecomStatus,
    },
    cost: {
      totalMillionsUSD: roundTo(totalCostMillions, 2),
      budgetCapMillionsUSD: budgetCap,
      reserveMillionsUSD: roundTo(budgetReserve, 2),
      status: costStatus,
    },
    volume: {
      used_U: roundTo(usedVolumeU, 1),
      maxFairing_U: maxFairingU,
      isCompliant: volumeCompliant,
    },
    overallMCRStatus,
    flightDirectorAdvice,
    mcrChecklist,
  };
}
