import type { CMLPhase } from '../types/mission';

export interface NarrativePhaseBeat {
  phase: CMLPhase;
  beatCode: string;
  speaker: string;
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
    cadetScript: {
      en: 'Commander {commander}, size the wireframe chassis and define {mission}.',
      es: 'Comandante {commander}, ajusta el chasis en alambre y define la misión de {mission}.',
    },
  },
  CML_2: {
    phase: 'CML_2',
    beatCode: 'ACT-02',
    speaker: 'CMDR VEGA',
    cadetScript: {
      en: 'Drag altitude and inclination sliders to watch orbital period respond live.',
      es: 'Arrastra altitud e inclinación para ver cómo cambia el periodo orbital en vivo.',
    },
  },
  CML_3: {
    phase: 'CML_3',
    beatCode: 'ACT-03',
    speaker: 'CMDR VEGA',
    cadetScript: {
      en: 'Compare the 3 top holograms and balance all 7 subsystems cleanly.',
      es: 'Compara los 3 hologramas superiores y optimiza los 7 subsistemas sin perder estrellas.',
    },
  },
  CML_4: {
    phase: 'CML_4',
    beatCode: 'ACT-04',
    speaker: 'CMDR VEGA',
    cadetScript: {
      en: 'Fill propellant and oxidizer tanks without exceeding launcher mass.',
      es: 'Llena los tanques de combustible y oxidante vigilando no pasar el límite del cohete.',
    },
  },
  CML_5: {
    phase: 'CML_5',
    beatCode: 'ACT-05',
    speaker: 'CMDR VEGA',
    cadetScript: {
      en: 'Laser V&V audits every subsystem. Reach ≥35% margins and hold to sign MCR.',
      es: 'El escáner láser audita cada pieza. Mantén márgenes ≥35% y firma la autorización MCR.',
    },
  },
  SIMULATION: {
    phase: 'SIMULATION',
    beatCode: 'ACT-06',
    speaker: 'CMDR VEGA',
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
