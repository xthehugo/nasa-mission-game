import type { Language, PhysicsMetrics, VolumeMetrics } from '../types/mission';
import type { FailureMode } from './SpacecraftBlueprint';

export type StressStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OVERLOAD';

export interface SubsystemStressDetail {
  id: 'STRUCTURE' | 'THERMAL' | 'EPS' | 'PROPULSION' | 'ADCS' | 'PAYLOAD';
  name: { en: string; es: string };
  code: string;
  pct: number;
  status: StressStatus;
  nominalRange: string;
  measured: string;
  color: string;
  note: { en: string; es: string };
}

/**
 * Poly Bridge Color Spectrum for mechanical / subsystem stress:
 * - 0% - 60%: Cyan / Green (Nominal Safe)
 * - 61% - 85%: Amber / Yellow (High Load Warning)
 * - 86% - 99%: Vivid Orange (Critical Limit)
 * - >= 100%: Neon Red (Plastic Overload / Snap Failure)
 */
export function getStressColor(pct: number): string {
  if (pct >= 100) return '#FF4D6D'; // Overload / Failure
  if (pct >= 85) return '#F97316';  // Critical orange
  if (pct >= 60) return '#FFC15E';  // Warning amber
  return '#5FF3FF';                 // Nominal safe cyan
}

export function getStressStatus(pct: number): StressStatus {
  if (pct >= 100) return 'OVERLOAD';
  if (pct >= 85) return 'CRITICAL';
  if (pct >= 60) return 'WARNING';
  return 'NOMINAL';
}

export function getStressStatusLabel(status: StressStatus, lang: Language): string {
  const isEs = lang === 'es';
  switch (status) {
    case 'OVERLOAD':
      return isEs ? 'SOBRECARGA 100%+' : 'OVERLOAD 100%+';
    case 'CRITICAL':
      return isEs ? 'CRÍTICO' : 'CRITICAL';
    case 'WARNING':
      return isEs ? 'ELEVADO' : 'ELEVATED';
    case 'NOMINAL':
    default:
      return isEs ? 'NOMINAL' : 'NOMINAL';
  }
}

/**
 * Computes live, physics-grounded stress for all 6 core spacecraft subsystems.
 * Incorporates time-variant factors:
 * - Max-Q aerodynamic pressure bell curve (T+30s to T+70s)
 * - In-flight propulsion burn propellant draw
 * - Eclipse cooling and thermal shocks
 * - Real NASA MCR metrics (mass ratio, link margin, power balance)
 */
export function computeSubsystemStress(
  metrics?: PhysicsMetrics,
  volume?: VolumeMetrics,
  failureMode: FailureMode = 'NONE',
  tRatio: number = 0,
  failedActive: boolean = false
): SubsystemStressDetail[] {
  const isFairingSnap = failedActive && failureMode === 'FAIRING_COLLISION';
  const isMassBuckle = failedActive && failureMode === 'MASS_BUCKLING';
  const isDeltaVOut = failedActive && failureMode === 'DELTAV_DEPLETION';
  const isPowerFreeze = failedActive && failureMode === 'POWER_FREEZE';
  const isTumble = failedActive && failureMode === 'TELECOM_TUMBLE';

  // 1. Structure / Chassis (PAF / Fairing)
  const isVolumeOverflow = volume ? !volume.isCompliant : false;
  const loadRatio = metrics && metrics.launchCapacity_kg > 0
    ? metrics.wetMass_kg / metrics.launchCapacity_kg
    : 0.65;
  const maxQFactor = Math.exp(-Math.pow((tRatio - 0.28) / 0.12, 2)); // Peak at Max-Q
  let structPct = Math.round(20 + loadRatio * 32 + maxQFactor * 26);
  if (isVolumeOverflow || isFairingSnap) {
    structPct = Math.max(structPct, 118);
  } else if (isMassBuckle) {
    structPct = Math.max(structPct, 138);
  }

  // 2. Thermal Control
  const eclipseFactor = Math.sin(tRatio * Math.PI * 3); // Thermal oscillation in orbit
  let thermalPct = Math.round(28 + Math.abs(eclipseFactor) * 22);
  if (isPowerFreeze) {
    thermalPct = 112; // -15°C Cryogenic brownout
  }

  // 3. Electrical Power System (EPS)
  const powerStatus = metrics?.power.status ?? 'GREEN';
  let epsPct = Math.round(
    powerStatus === 'RED'
      ? 96
      : powerStatus === 'YELLOW'
        ? 68
        : 34 + (1 - Math.min(1, metrics?.power.marginPercent ? metrics.power.marginPercent / 50 : 0.5)) * 30
  );
  if (isPowerFreeze) {
    epsPct = Math.max(epsPct, 115);
  }

  // 4. Propulsion / Tanks (COPV)
  const reqDv = metrics?.deltaV_required_ms ?? 1000;
  const availDv = metrics?.deltaV_available_ms ?? 1200;
  const dvRatio = reqDv / Math.max(1, availDv);
  let propPct = Math.round(Math.min(95, 25 + dvRatio * 45 + tRatio * 18));
  if (isDeltaVOut) {
    propPct = 122; // 0% propellant flameout
  }

  // 5. Telecom & ADCS (Antenna / Reaction Wheels)
  const linkMargin = metrics?.telecom.linkMargin_dB ?? 8;
  let adcsPct = Math.round(
    Math.max(15, 82 - linkMargin * 5 + (metrics?.telecom.status === 'RED' ? 45 : 0))
  );
  if (isTumble) {
    adcsPct = 125; // Carrier loss, tumble > 15 deg/s
  }

  // 6. Science Payload
  const gForceLoad = 1 + maxQFactor * 4.2; // 5.2G at Max-Q
  let payloadPct = Math.round(20 + (gForceLoad / 6) * 35);
  if (isFairingSnap) {
    payloadPct = 114; // Sensor clipped by fairing wall
  }

  const list: SubsystemStressDetail[] = [
    {
      id: 'STRUCTURE',
      name: { en: 'Structure & PAF Truss', es: 'Estructura & Armadura PAF' },
      code: 'STR-01',
      pct: structPct,
      status: getStressStatus(structPct),
      nominalRange: '<85% (<1.40× ULT)',
      measured: `${structPct}% · ${(structPct / 100 * 1.4).toFixed(2)}× ULT`,
      color: getStressColor(structPct),
      note: {
        en: structPct >= 100 ? 'PLASTIC DEFORMATION DETECTED' : 'Aero dynamic load nominal',
        es: structPct >= 100 ? 'DEFORMACIÓN PLÁSTICA DETECTADA' : 'Carga aerodinámica nominal',
      },
    },
    {
      id: 'THERMAL',
      name: { en: 'Thermal Protection System', es: 'Sistema de Control Térmico' },
      code: 'THM-02',
      pct: thermalPct,
      status: getStressStatus(thermalPct),
      nominalRange: '-20°C a +60°C',
      measured: thermalPct >= 100 ? '-35°C (CRYO FREEZE)' : '+22°C (STABLE)',
      color: getStressColor(thermalPct),
      note: {
        en: thermalPct >= 100 ? 'ECLIPSE HEATER FAILURE' : 'Multilayer insulation within specs',
        es: thermalPct >= 100 ? 'FALLO DE CALENTADORES EN ECLIPSE' : 'Aislamiento multicapa en rango',
      },
    },
    {
      id: 'EPS',
      name: { en: 'Electrical Power & Battery', es: 'Potencia EPS & Baterías' },
      code: 'EPS-03',
      pct: epsPct,
      status: getStressStatus(epsPct),
      nominalRange: '>35% reserve margin',
      measured: `${epsPct}% (${metrics?.power.predicted?.toFixed(0) ?? '85'}W / ${metrics?.power.generatedAtDestination_W?.toFixed(0) ?? '150'}W)`,
      color: getStressColor(epsPct),
      note: {
        en: epsPct >= 100 ? 'BATTERY DEEP DISCHARGE / BROWNOUT' : 'Solar array bus voltage nominal',
        es: epsPct >= 100 ? 'DESCARGA PROFUNDA / CAÍDA DE TENSIÓN' : 'Tensión de bus solar nominal',
      },
    },
    {
      id: 'PROPULSION',
      name: { en: 'Propulsion & COPV Tanks', es: 'Propulsión & Tanques COPV' },
      code: 'PRP-04',
      pct: propPct,
      status: getStressStatus(propPct),
      nominalRange: 'MEOP 310 bar',
      measured: `${propPct}% (ΔV: ${availDv.toFixed(0)} / ${reqDv.toFixed(0)} m/s)`,
      color: getStressColor(propPct),
      note: {
        en: propPct >= 100 ? 'CHAMBER PRESSURE LOSS / FLAMEOUT' : 'Manifold pressure nominal',
        es: propPct >= 100 ? 'PÉRDIDA DE PRESIÓN / APAGADO' : 'Presión de alimentación nominal',
      },
    },
    {
      id: 'ADCS',
      name: { en: 'Avionics, ADCS & Telecom', es: 'Aviónica, ADCS & Telecom' },
      code: 'TEL-05',
      pct: adcsPct,
      status: getStressStatus(adcsPct),
      nominalRange: '>3 dB link margin',
      measured: `${adcsPct}% (${linkMargin.toFixed(1)} dB Link)`,
      color: getStressColor(adcsPct),
      note: {
        en: adcsPct >= 100 ? 'DSN CARRIER LOSS & RAPID TUMBLE' : 'Star tracker attitude lock stable',
        es: adcsPct >= 100 ? 'PÉRDIDA DE PORTADORA DSN & GIRO' : 'Bloqueo estelar de actitud estable',
      },
    },
    {
      id: 'PAYLOAD',
      name: { en: 'Science Instrument Deck', es: 'Instrumentos Científicos' },
      code: 'PLD-06',
      pct: payloadPct,
      status: getStressStatus(payloadPct),
      nominalRange: '<6.0 G vibration',
      measured: `${payloadPct}% (${gForceLoad.toFixed(1)} G peak)`,
      color: getStressColor(payloadPct),
      note: {
        en: payloadPct >= 100 ? 'SENSOR HOUSING CRUSHED' : 'Optical alignment within tolerance',
        es: payloadPct >= 100 ? 'SENSOR COLISIONADO CON COFIA' : 'Alineación óptica dentro de tolerancia',
      },
    },
  ];

  return list;
}
