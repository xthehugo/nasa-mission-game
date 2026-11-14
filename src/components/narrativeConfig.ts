import type { CMLPhase } from '../types/mission';

export interface NarrativePhaseBeat {
  phase: CMLPhase;
  beatCode: string;
  speaker: string;
  cadetGoal: { en: string; es: string };
  jplSpec: { en: string; es: string };
  cadetScript: { en: string; es: string };
}

export const HOLO_ANIMATION_PRESETS = {
  stageFadeSec: 0.35,
  springModal: { type: 'spring' as const, stiffness: 260, damping: 24 },
  voicePulseDurationSec: 0.9,
};

/**
 * Decoupled narrative configuration for Story Mode & future mission cinematics.
 * Edit or extend entries here without modifying Zustand store or engine logic.
 */
export const COMMANDER_PHASE_BEATS: Record<CMLPhase, NarrativePhaseBeat> = {
  CML_1: {
    phase: 'CML_1',
    beatCode: 'ACT-01',
    speaker: 'CMDR VEGA',
    cadetGoal: {
      en: 'GOAL: Pick spacecraft size, solar power & science goal.',
      es: 'META: Elige tamaño de nave, paneles solares y meta científica.',
    },
    jplSpec: {
      en: 'CML 1 STM: Trace science objective -> min data rate (kbps) & required instrument.',
      es: 'CML 1 STM: Trazabilidad ciencia -> tasa mínima (kbps) e instrumento obligatorio.',
    },
    cadetScript: {
      en: 'Commander {commander}, size the wireframe chassis and define {mission}.',
      es: 'Comandante {commander}, ajusta el chasis en alambre y define la misión de {mission}.',
    },
  },
  CML_2: {
    phase: 'CML_2',
    beatCode: 'ACT-02',
    speaker: 'CMDR VEGA',
    cadetGoal: {
      en: 'GOAL: Pick target planet/orbit & ground antenna.',
      es: 'META: Elige destino orbital y antena en Tierra sin perder señal.',
    },
    jplSpec: {
      en: 'CML 2 ASTRODYNAMICS: v = √(μ/a), T = 2π√(a³/μ) · FSPL ∝ (4πdf/c)².',
      es: 'CML 2 ASTRODINÁMICA: v = √(μ/a), T = 2π√(a³/μ) · FSPL ∝ (4πdf/c)².',
    },
    cadetScript: {
      en: 'Drag altitude and inclination sliders to watch orbital period respond live.',
      es: 'Arrastra altitud e inclinación para ver cómo cambia el periodo orbital en vivo.',
    },
  },
  CML_3: {
    phase: 'CML_3',
    beatCode: 'ACT-03',
    speaker: 'CMDR VEGA',
    cadetGoal: {
      en: 'GOAL: Balance all 7 modules with green bars & 0 conflicts.',
      es: 'META: Equilibra los 7 módulos en verde y logra 0 conflictos.',
    },
    jplSpec: {
      en: 'CML 3 SWaP-C: m_wet = (m_CBE + m_MGA) · e^(ΔV / (Isp·g₀)) · P_gen(1/R²).',
      es: 'CML 3 SWaP-C: m_wet = (m_CBE + m_MGA) · e^(ΔV / (Isp·g₀)) · P_gen(1/R²).',
    },
    cadetScript: {
      en: 'Compare the 3 top holograms and balance all 7 subsystems cleanly.',
      es: 'Compara los 3 hologramas superiores y optimiza los 7 subsistemas sin perder estrellas.',
    },
  },
  CML_4: {
    phase: 'CML_4',
    beatCode: 'ACT-04',
    speaker: 'CMDR VEGA',
    cadetGoal: {
      en: 'GOAL: Load fuel & battery tanks without overweighting the rocket.',
      es: 'META: Carga combustible y baterías sin pasar el límite del cohete.',
    },
    jplSpec: {
      en: 'CML 4 CONCURRENCY: Resolve cross-subsystem conflicts & lock CBE + MGA baseline.',
      es: 'CML 4 CONCURRENCIA: Resuelve conflictos inter-subsistemas y fija CBE + MGA.',
    },
    cadetScript: {
      en: 'Fill propellant and oxidizer tanks without exceeding launcher mass.',
      es: 'Llena los tanques de combustible y oxidante vigilando no pasar el límite del cohete.',
    },
  },
  CML_5: {
    phase: 'CML_5',
    beatCode: 'ACT-05',
    speaker: 'CMDR VEGA',
    cadetGoal: {
      en: 'GOAL: Pass 5 V&V tests, check ≥35% margins & sign MCR to launch!',
      es: 'META: Aprueba 5 pruebas V&V, revisa margen ≥35% y firma MCR para despegar.',
    },
    jplSpec: {
      en: 'CML 5 MCR GATE: Margin ≥ 35% (Dry Mass & EPS) + CSLI V&V + RF Inhibit ≥ 30 min.',
      es: 'CML 5 MCR GATE: Margen ≥ 35% (Masa Seca y EPS) + CSLI V&V + Inhibición RF ≥ 30 min.',
    },
    cadetScript: {
      en: 'Laser V&V audits every subsystem. Reach ≥35% margins and hold to sign MCR.',
      es: 'El escáner láser audita cada pieza. Mantén márgenes ≥35% y firma la autorización MCR.',
    },
  },
  SIMULATION: {
    phase: 'SIMULATION',
    beatCode: 'ACT-06',
    speaker: 'CMDR VEGA',
    cadetGoal: {
      en: 'GOAL: Watch ascent, solve the 3 crises on the right & claim your certificate!',
      es: 'META: Vigila el ascenso, resuelve las 3 crisis a la derecha y reclama tu certificado.',
    },
    jplSpec: {
      en: 'PHASE E OPS: Global P = 0.50·S + 0.30·M + 0.20·B · Real-time anomaly triage.',
      es: 'FASE E OPS: Score P = 0.50·S + 0.30·M + 0.20·B · Gestión de anomalías en vuelo.',
    },
    cadetScript: {
      en: 'Launch sequence ready. Resolve all 3 flight crises to claim 3 stars.',
      es: 'Inicia el lanzamiento y resuelve las 3 crisis orbitales para ganar las 3 estrellas.',
    },
  },
};

export function formatCommanderBeat(
  template: string,
  commanderName: string,
  missionCustomName: string,
): string {
  return template
    .replaceAll('{commander}', commanderName)
    .replaceAll('{mission}', missionCustomName);
}
