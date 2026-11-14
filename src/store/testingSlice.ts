import type { StateCreator } from 'zustand';
import type { LocalizedText, PhysicsMetrics } from '../types/mission';

export interface TestingCampaignState {
  vibrationPassed: boolean;
  tvacPassed: boolean;
  batteryULCertified: boolean;
  ditlPassed: boolean;
  rfInhibitTimerMin: number;
  rbfPinRemoved: boolean;
}

export type PreFlightOutcomeCode =
  | 'LOM_MASS'
  | 'DEMANIFEST_TVAC_BATTERY'
  | 'DISQUALIFIED_INHIBIT_RBF'
  | 'RED_FLAG_MCR'
  | 'LOM_ECLIPSE'
  | 'SUCCESS_TOTAL'
  | 'DEGRADED';

export interface PreFlightVerdict {
  passed: boolean;
  code: PreFlightOutcomeCode;
  headline: LocalizedText;
  explanation: LocalizedText;
}

export interface TestingSlice {
  testing: TestingCampaignState;
  preFlightVerdict: PreFlightVerdict;
  setTestingFlag: (
    field: Exclude<keyof TestingCampaignState, 'rfInhibitTimerMin'>,
    value: boolean,
  ) => void;
  setRfInhibitTimer: (minutes: number) => void;
  runFullVVSuite: () => void;
  resetTesting: () => void;
}

export const DEFAULT_TESTING_STATE: TestingCampaignState = {
  vibrationPassed: true,
  tvacPassed: true,
  batteryULCertified: true,
  ditlPassed: true,
  rfInhibitTimerMin: 35,
  rbfPinRemoved: true,
};

export function evaluatePreFlightVerdict(
  metrics: PhysicsMetrics,
  testing: TestingCampaignState,
  globalScore: number,
): PreFlightVerdict {
  if (metrics.wetMass_kg > metrics.launchCapacity_kg || !metrics.volume.isCompliant) {
    return {
      passed: false,
      code: 'LOM_MASS',
      headline: {
        en: 'CATASTROPHIC FAILURE (LOM): Launch Envelope Exceeded',
        es: 'FALLO CATASTRÓFICO (LOM): Excede Capacidad o Cofia del Lanzador',
      },
      explanation: {
        en: 'Wet mass or spacecraft volume exceeds fairing/throw constraints. Demanifested from pad.',
        es: 'La masa húmeda o el volumen supera la capacidad de inyección o cofia del lanzador.',
      },
    };
  }

  if (!testing.batteryULCertified || !testing.tvacPassed || !testing.vibrationPassed) {
    return {
      passed: false,
      code: 'DEMANIFEST_TVAC_BATTERY',
      headline: {
        en: 'DEMANIFEST: Environmental Qualification (Vibe / TVAC / UL) Incomplete',
        es: 'FALLO EN REVISIÓN (Demanifest): Calificación Ambiental / Batería UL Pendiente',
      },
      explanation: {
        en: 'NASA CSLI 101 requires UL-certified batteries, Vibration, and TVAC survival before flight integration.',
        es: 'La norma NASA CSLI 101 exige baterías con certificación UL, Vibración y Vacío Térmico (TVAC) aprobados.',
      },
    };
  }

  if (!testing.ditlPassed || testing.rfInhibitTimerMin < 30 || !testing.rbfPinRemoved) {
    return {
      passed: false,
      code: 'DISQUALIFIED_INHIBIT_RBF',
      headline: {
        en: 'OPERATIONAL DISQUALIFICATION: RF Inhibit < 30 min or RBF Pin Active',
        es: 'DESCALIFICACIÓN OPERACIONAL: Temporizador RF < 30 min o Pin RBF sin Retirar',
      },
      explanation: {
        en: 'FCC/NASA rules forbid RF transmission before 30 minutes post-deployment and require DITL + RBF verification.',
        es: 'FCC/NASA prohíben transmitir antes de 30 min tras eyección y exigen prueba DITL y retiro de pines RBF.',
      },
    };
  }

  if (metrics.dryMass.marginPercent < 25 || metrics.power.marginPercent < 25) {
    return {
      passed: false,
      code: 'RED_FLAG_MCR',
      headline: {
        en: 'MCR RED FLAG: Mass or Power Margin Below 25%',
        es: 'REVISIÓN REPROBADA (Red Flag): Margen de Masa o Potencia < 25%',
      },
      explanation: {
        en: 'Early-phase MCR margin violates NASA safety thresholds (< 25%). Loop back to Trade Space.',
        es: 'El margen técnico es insuficiente (< 25%). Rediseña en el Trade Space antes del vuelo.',
      },
    };
  }

  if (metrics.power.generatedAtDestination_W - metrics.power.eclipseRequired_W <= 0) {
    return {
      passed: false,
      code: 'LOM_ECLIPSE',
      headline: {
        en: 'MISSION FAILURE (LOM): Battery Drain During Orbital Eclipse',
        es: 'FALLO DE MISIÓN (LOM): Drenaje Total de Batería en Eclipse',
      },
      explanation: {
        en: 'Orbital power generation cannot recharge batteries across shadow passes.',
        es: 'La generación solar/RTG no alcanza a recargar las baterías durante la sombra orbital.',
      },
    };
  }

  if (globalScore >= 80) {
    return {
      passed: true,
      code: 'SUCCESS_TOTAL',
      headline: {
        en: `TOTAL MISSION SUCCESS QUALIFIED (${globalScore.toFixed(1)}/100)`,
        es: `ÉXITO TOTAL DE MISIÓN CALIFICADO (${globalScore.toFixed(1)}/100)`,
      },
      explanation: {
        en: 'All NASA CSLI 101 environmental tests, RF inhibit checks, and ≥35%/25% MCR margins cleared for launch.',
        es: 'Pruebas ambientales CSLI 101, inhibición RF y márgenes MCR aprobados para lanzamiento.',
      },
    };
  }

  return {
    passed: true,
    code: 'DEGRADED',
    headline: {
      en: `CONDITIONAL FLIGHT RELEASE (${globalScore.toFixed(1)}/100)`,
      es: `AUTORIZACIÓN CONDICIONAL (${globalScore.toFixed(1)}/100)`,
    },
    explanation: {
      en: 'Minimum objectives met, though tighter margins or budget usage may degrade peak science return.',
      es: 'Objetivos mínimos cumplidos, aunque márgenes ajustados pueden degradar el retorno científico.',
    },
  };
}

export const createTestingSlice: StateCreator<
  TestingSlice & { metrics: PhysicsMetrics; scores: { compositeGlobalScore: number } },
  [],
  [],
  TestingSlice
> = (set, get) => ({
  testing: DEFAULT_TESTING_STATE,
  preFlightVerdict: {
    passed: true,
    code: 'SUCCESS_TOTAL',
    headline: { en: 'Ready for V&V', es: 'Listo para V&V' },
    explanation: { en: 'Verify environmental suite.', es: 'Ejecuta la consola ambiental.' },
  },

  setTestingFlag: (field, value) => {
    const nextTesting: TestingCampaignState = {
      ...get().testing,
      [field]: value,
    };
    const { metrics, scores } = get();
    set({
      testing: nextTesting,
      preFlightVerdict: evaluatePreFlightVerdict(metrics, nextTesting, scores.compositeGlobalScore),
    });
  },

  setRfInhibitTimer: (minutes) => {
    const clamped = Math.max(0, Math.min(60, minutes));
    const nextTesting: TestingCampaignState = {
      ...get().testing,
      rfInhibitTimerMin: clamped,
    };
    const { metrics, scores } = get();
    set({
      testing: nextTesting,
      preFlightVerdict: evaluatePreFlightVerdict(metrics, nextTesting, scores.compositeGlobalScore),
    });
  },

  runFullVVSuite: () => {
    const nextTesting: TestingCampaignState = {
      vibrationPassed: true,
      tvacPassed: true,
      batteryULCertified: true,
      ditlPassed: true,
      rfInhibitTimerMin: Math.max(35, get().testing.rfInhibitTimerMin),
      rbfPinRemoved: true,
    };
    const { metrics, scores } = get();
    set({
      testing: nextTesting,
      preFlightVerdict: evaluatePreFlightVerdict(metrics, nextTesting, scores.compositeGlobalScore),
    });
  },

  resetTesting: () => {
    const { metrics, scores } = get();
    set({
      testing: DEFAULT_TESTING_STATE,
      preFlightVerdict: evaluatePreFlightVerdict(
        metrics,
        DEFAULT_TESTING_STATE,
        scores.compositeGlobalScore,
      ),
    });
  },
});
