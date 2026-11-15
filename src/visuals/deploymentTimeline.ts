import type { Language } from '../types/mission';

export type DeploymentStepId =
  | 'SEPARATION'
  | 'RF_SILENCE'
  | 'SOLAR_DEPLOY'
  | 'ADCS_DETUMBLE'
  | 'HOHMANN_BURN';

export type DeploymentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface DeploymentStep {
  id: DeploymentStepId;
  code: string;
  name: { en: string; es: string };
  timeTag: string;
  tRatioStart: number;
  tRatioEnd: number;
  subsystem: 'STRUCTURE' | 'EPS' | 'ADCS' | 'PROPULSION';
  nasaStandard: string;
  description: { en: string; es: string };
}

export const DEPLOYMENT_STEPS: DeploymentStep[] = [
  {
    id: 'SEPARATION',
    code: 'STAGE 1',
    name: {
      en: 'P-POD / ESPA Separation & RBF Eject',
      es: 'Separación P-POD / ESPA & Expulsión RBF',
    },
    timeTag: 'T+00:00',
    tRatioStart: 0.0,
    tRatioEnd: 0.18,
    subsystem: 'STRUCTURE',
    nasaStandard: 'NASA-STD-5017 (SmallSat Ejection Dynamics)',
    description: {
      en: 'Microswitch triggers upon exiting spring dispenser; bus power rail activates.',
      es: 'Microinterruptor conmuta al salir del dispensador de resortes; riel de potencia activo.',
    },
  },
  {
    id: 'RF_SILENCE',
    code: 'STAGE 2',
    name: {
      en: 'NASA 30-Min RF Silence Safety Timer',
      es: 'Temporizador de Silencio RF 30-Min NASA',
    },
    timeTag: 'T+00:30',
    tRatioStart: 0.18,
    tRatioEnd: 0.38,
    subsystem: 'ADCS',
    nasaStandard: 'LSP-REQ-317.01 (Primary Payload RF Protection)',
    description: {
      en: 'Strict mandatory silence: zero RF emissions to protect launcher upper stage avionics.',
      es: 'Silencio obligatorio: cero emisiones RF para proteger la aviónica del lanzador primario.',
    },
  },
  {
    id: 'SOLAR_DEPLOY',
    code: 'STAGE 3',
    name: {
      en: 'Spring-Loaded Solar Array Deployment',
      es: 'Despliegue de Paneles Solares por Resorte',
    },
    timeTag: 'T+00:31',
    tRatioStart: 0.38,
    tRatioEnd: 0.58,
    subsystem: 'EPS',
    nasaStandard: 'AIAA S-111A (Solar Array Mechanism Clearance)',
    description: {
      en: 'Burn-wire circuit cuts Dyneema restraint; spring hinges snap wings to sun-facing angle.',
      es: 'Circuito térmico corta filamento Dyneema; resortes encajan alas solares hacia el Sol.',
    },
  },
  {
    id: 'ADCS_DETUMBLE',
    code: 'STAGE 4',
    name: {
      en: 'ADCS B-Dot Detumble & DSN Carrier Lock',
      es: 'Desamortiguamiento ADCS B-Dot & Enlace DSN',
    },
    timeTag: 'T+00:35',
    tRatioStart: 0.58,
    tRatioEnd: 0.80,
    subsystem: 'ADCS',
    nasaStandard: 'DSN 810-005 (Deep Space Ground Link Specs)',
    description: {
      en: 'Magnetic torque rods cancel tip-off spin (<1°/s); star tracker locks; DSN acquires beacon.',
      es: 'Torquímetros magnéticos anulan giro residual (<1°/s); rastreador fija estrellas; DSN enlaza.',
    },
  },
  {
    id: 'HOHMANN_BURN',
    code: 'STAGE 5',
    name: {
      en: 'Hohmann Delta-V Transfer Injection Burn',
      es: 'Encendido de Inyección Hohmann ΔV',
    },
    timeTag: 'T+01:00',
    tRatioStart: 0.80,
    tRatioEnd: 1.0,
    subsystem: 'PROPULSION',
    nasaStandard: 'AIAA S-080 (Spacecraft Propulsion Pressurization)',
    description: {
      en: 'Main engine pyro valves open; high-efficiency thruster fires to achieve target orbit.',
      es: 'Válvulas pirotécnicas se abren; propulsor principal enciende para inserción orbital final.',
    },
  },
];

export interface StepEvaluation {
  step: DeploymentStep;
  status: DeploymentStatus;
  progressPct: number;
}

export function evaluateDeploymentTimeline(
  tRatio: number,
  isFailed: boolean = false,
  failRatio: number = 1.0
): StepEvaluation[] {
  return DEPLOYMENT_STEPS.map((step) => {
    let status: DeploymentStatus = 'PENDING';
    let progressPct = 0;

    if (tRatio >= step.tRatioEnd) {
      if (isFailed && failRatio <= step.tRatioEnd && failRatio >= step.tRatioStart) {
        status = 'FAILED';
        progressPct = Math.round(
          ((failRatio - step.tRatioStart) / (step.tRatioEnd - step.tRatioStart)) * 100
        );
      } else if (isFailed && failRatio < step.tRatioStart) {
        status = 'PENDING';
        progressPct = 0;
      } else {
        status = 'COMPLETED';
        progressPct = 100;
      }
    } else if (tRatio >= step.tRatioStart && tRatio < step.tRatioEnd) {
      if (isFailed && tRatio >= failRatio) {
        status = 'FAILED';
      } else {
        status = 'ACTIVE';
      }
      progressPct = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((tRatio - step.tRatioStart) / (step.tRatioEnd - step.tRatioStart)) * 100
          )
        )
      );
    } else {
      status = 'PENDING';
      progressPct = 0;
    }

    return { step, status, progressPct };
  });
}

export function getDeploymentStatusLabel(status: DeploymentStatus, lang: Language): string {
  const isEs = lang === 'es';
  switch (status) {
    case 'COMPLETED':
      return isEs ? 'COMPLETADO ✓' : 'COMPLETED ✓';
    case 'ACTIVE':
      return isEs ? 'EN EJECUCIÓN...' : 'EXECUTING...';
    case 'FAILED':
      return isEs ? 'FALLO MECÁNICO ✗' : 'MECHANICAL FAILURE ✗';
    case 'PENDING':
    default:
      return isEs ? 'PENDIENTE' : 'PENDING';
  }
}
