import type {
  LocalizedText,
  MissionSelection,
} from '../types/mission';

export interface CampaignContract {
  id: string;
  presetKey: string;
  code: string;
  tier: number;
  destinationId: string;
  objectiveId: string;
  title: LocalizedText;
  briefing: LocalizedText;
  bossThreat: LocalizedText;
  rewardXP: number;
  targetStars: number;
  requiredXPToUnlock: number;
}

export const CAMPAIGN_CONTRACTS: CampaignContract[] = [
  {
    id: 'contract-leo-bionutrients',
    presetKey: 'obj-earth-bionutrients',
    code: 'CONTRACT-01 · LEO',
    tier: 1,
    destinationId: 'dest-leo',
    objectiveId: 'obj-earth-bionutrients',
    title: {
      en: 'BioNutrients-2: Microgravity Life Support',
      es: 'BioNutrients-2: Soporte Vital en Microgravedad',
    },
    briefing: {
      en: 'Launch a 3U CubeSat to LEO to synthesize fresh nutrients for future Artemis astronauts.',
      es: 'Lanza un CubeSat 3U a LEO para sintetizar nutrientes frescos para futuros astronautas de Artemis.',
    },
    bossThreat: {
      en: 'High atmospheric drag & 16 thermal cycles per day.',
      es: 'Arrastre atmosférico y 16 ciclos de eclipse solar al día.',
    },
    rewardXP: 100,
    targetStars: 3,
    requiredXPToUnlock: 0,
  },
  {
    id: 'contract-sso-tracers',
    presetKey: 'obj-sso-tracers',
    code: 'CONTRACT-02 · SSO',
    tier: 2,
    destinationId: 'dest-leo',
    objectiveId: 'obj-sso-tracers',
    title: {
      en: 'TRACERS Tandem: Solar Cusp Recon',
      es: 'TRACERS Tándem: Reconocimiento de Cúspides Solares',
    },
    briefing: {
      en: 'Deploy twin CubeSats in Sun-Synchronous Orbit to measure explosive magnetic reconnection events.',
      es: 'Despliega dos CubeSats gemelos en órbita heliosincrónica para medir reconexiones magnéticas.',
    },
    bossThreat: {
      en: 'Strict CSD dispenser volume envelope & high solar storm sensitivity.',
      es: 'Volumen estricto en dispensador CSD y alta sensibilidad a eyecciones solares.',
    },
    rewardXP: 250,
    targetStars: 3,
    requiredXPToUnlock: 80,
  },
  {
    id: 'contract-geo-gmat',
    presetKey: 'preset-gmat-geo',
    code: 'CONTRACT-03 · GEO',
    tier: 3,
    destinationId: 'dest-geo',
    objectiveId: 'obj-helio-lunar-trailblazer',
    title: {
      en: 'GMAT R2026a GEO: Hohmann 3,673 m/s Transfer',
      es: 'GMAT R2026a GEO: Transferencia Hohmann 3,673 m/s',
    },
    briefing: {
      en: 'Clear the 3,673 m/s Delta-V barrier to circularize in Geostationary orbit without exceeding launch capacity.',
      es: 'Supera la barrera de 3,673 m/s de Delta-V para circularizar en órbita geoestacionaria sin exceder el cohete.',
    },
    bossThreat: {
      en: 'Massive ~71% propellant mass fraction & outer Van Allen electron belt radiation.',
      es: 'Fracción masiva de propelente (~71%) y radiación del cinturón exterior de Van Allen.',
    },
    rewardXP: 400,
    targetStars: 3,
    requiredXPToUnlock: 280,
  },
  {
    id: 'contract-moon-trailblazer',
    presetKey: 'obj-helio-lunar-trailblazer',
    code: 'CONTRACT-04 · LUNA',
    tier: 4,
    destinationId: 'dest-moon',
    objectiveId: 'obj-helio-lunar-trailblazer',
    title: {
      en: 'Lunar Trailblazer: Polar Water-Ice Hunt',
      es: 'Lunar Trailblazer: Cacería de Hielo Polar',
    },
    briefing: {
      en: 'Inject into lunar polar orbit to map surface water-ice reservoirs in permanently shadowed craters.',
      es: 'Insértate en órbita polar lunar para cartografiar agua congelada en cráteres permanentemente en sombra.',
    },
    bossThreat: {
      en: 'Severe thermal drops during long lunar eclipses & precision pointing requirement.',
      es: 'Drásticas caídas térmicas en sombra lunar y exigencia de apuntamiento fino.',
    },
    rewardXP: 600,
    targetStars: 3,
    requiredXPToUnlock: 600,
  },
  {
    id: 'contract-l2-jwst-fgs',
    presetKey: 'obj-l2-jwst-fgs',
    code: 'CONTRACT-05 · SE-L2',
    tier: 5,
    destinationId: 'dest-l2',
    objectiveId: 'obj-l2-jwst-fgs',
    title: {
      en: 'JWST / CSA FGS: Cryo Sub-Arcsecond Observatory',
      es: 'JWST / CSA FGS: Observatorio Criogénico Sub-Arcosegundo',
    },
    briefing: {
      en: 'Operate at Sun-Earth L2 with Canadian Space Agency FGS heritage, 16 Hz tracking, and 0% eclipse stability.',
      es: 'Opera en el punto L2 con herencia del sensor FGS canadiense, seguimiento a 16 Hz y 0% de eclipses.',
    },
    bossThreat: {
      en: 'Sub-arcsecond ADCS pointing requirement & complex 5-layer cryogenic thermal balance.',
      es: 'Apuntamiento ADCS sub-arcosegundo y balance criogénico complejo de 5 capas.',
    },
    rewardXP: 850,
    targetStars: 3,
    requiredXPToUnlock: 1100,
  },
  {
    id: 'contract-jupiter-clipper',
    presetKey: 'obj-jupiter-clipper',
    code: 'CONTRACT-06 · JÚPITER',
    tier: 6,
    destinationId: 'dest-jupiter',
    objectiveId: 'obj-jupiter-clipper',
    title: {
      en: 'Jupiter RTG Clipper: Final Boss of Deep Space',
      es: 'Júpiter RTG Clipper: Jefe Final de Espacio Profundo',
    },
    briefing: {
      en: 'Survive at 5.20 AU where solar flux drops by 96%. Command deep-space RTG power and DSN 70m dish links.',
      es: 'Sobrevive a 5.20 AU donde la luz solar cae 96%. Domina energía RTG y enlaces con antena DSN de 70m.',
    },
    bossThreat: {
      en: '45-minute light delay, massive radiation belts & extreme telecom path loss.',
      es: 'Retardo de luz de 45 min, cinturones de radiación extrema y pérdida colosal de señal.',
    },
    rewardXP: 1200,
    targetStars: 3,
    requiredXPToUnlock: 1800,
  },
];

export interface PlayerRank {
  title: LocalizedText;
  badge: string;
  minXP: number;
  maxXP: number;
  level: number;
}

export const PLAYER_RANKS: PlayerRank[] = [
  {
    level: 1,
    title: { en: 'Cadet Navigator', es: 'Cadete Navegante' },
    badge: '★ CADET',
    minXP: 0,
    maxXP: 250,
  },
  {
    level: 2,
    title: { en: 'Systems Specialist', es: 'Especialista de Sistemas' },
    badge: '★★ SPECIALIST',
    minXP: 251,
    maxXP: 600,
  },
  {
    level: 3,
    title: { en: 'Flight Controller', es: 'Controlador de Vuelo' },
    badge: '★★★ FLT CNTRL',
    minXP: 601,
    maxXP: 1200,
  },
  {
    level: 4,
    title: { en: 'JPL Team X Architect', es: 'Arquitecto JPL Team X' },
    badge: '✦ JPL ARCHITECT',
    minXP: 1201,
    maxXP: 2200,
  },
  {
    level: 5,
    title: { en: 'Solar System Legend', es: 'Leyenda del Sistema Solar' },
    badge: '✦✦✦ SOLAR LEGEND',
    minXP: 2201,
    maxXP: 99999,
  },
];

export function getPlayerRank(xp: number): PlayerRank {
  return (
    [...PLAYER_RANKS].reverse().find((rank) => xp >= rank.minXP) ??
    PLAYER_RANKS[0]
  );
}

export interface EquipmentSynergy {
  id: string;
  name: LocalizedText;
  badge: string;
  description: LocalizedText;
  requiredSubsystemIds: string[];
  bonusText: LocalizedText;
}

export const EQUIPMENT_SYNERGIES: EquipmentSynergy[] = [
  {
    id: 'syn-optical-quantum',
    name: { en: 'Quantum Optical Link', es: 'Enlace Óptico Cuántico' },
    badge: '[OPT] OPTICAL + GNC',
    description: {
      en: 'Precision Arcsec Sagitta Star Tracker aims the CubeLCT Laser Terminal directly at Earth.',
      es: 'El Star Tracker Arcsec Sagitta apunta con precisión de arco-segundo el terminal Láser CubeLCT.',
    },
    requiredSubsystemIds: ['telecom-cubelct-laser', 'adcs-sagitta-star'],
    bonusText: {
      en: '+15% Telecom Margin & Ultra-low pointing jitter',
      es: '+15% Margen Telecom y cero vibración de haz',
    },
  },
  {
    id: 'syn-cryo-science',
    name: { en: 'Cryo-Optic Baseline', es: 'Criogénesis Óptica' },
    badge: '[CRYO] CRYO + IR',
    description: {
      en: 'Active cryocooler stabilizes the infrared spectrometer below 50 Kelvin.',
      es: 'El criorefrigerador activo estabiliza el espectrómetro IR por debajo de 50 Kelvin.',
    },
    requiredSubsystemIds: ['pay-ir-spectrometer', 'therm-cryo'],
    bonusText: {
      en: '+12% Science Return & stray light suppression',
      es: '+12% Retorno Científico y supresión de ruido térmico',
    },
  },
  {
    id: 'syn-deep-space-power',
    name: { en: 'Deep Space RTG Core', es: 'Núcleo RTG de Espacio Profundo' },
    badge: '[NUC] RTG + BIPROP',
    description: {
      en: 'Next-Gen RTG provides constant decay heat to prevent bipropellant hydrazine freezing at >1.5 AU.',
      es: 'El RTG provee calor continuo que evita congelamiento de hidracina en espacio profundo.',
    },
    requiredSubsystemIds: ['eps-rtg', 'prop-biprop'],
    bonusText: {
      en: '+10% Thermal Resilience & Zero eclipse solar dependency',
      es: '+10% Resiliencia Térmica y cero dependencia del Sol',
    },
  },
  {
    id: 'syn-high-power-radar',
    name: { en: 'Heavy Radar Pulse Array', es: 'Matriz Radar de Alta Potencia' },
    badge: '[RF] SAR + MEGAFLEX',
    description: {
      en: 'Massive MegaFlex arrays provide peak kW bursts needed for synthetic aperture radar sweeps.',
      es: 'Alas MegaFlex entregan los picos de kW necesarios para barridos de radar SAR activo.',
    },
    requiredSubsystemIds: ['pay-sar-radar', 'eps-megaflex'],
    bonusText: {
      en: '+100% SAR Duty Cycle without battery depletion',
      es: '+100% Ciclo de trabajo SAR sin agotar baterías',
    },
  },
  {
    id: 'syn-green-prop-vadr',
    name: { en: 'Green Rideshare Synergy', es: 'Rideshare Limpio No-Tóxico' },
    badge: '[ECO] HAN + VADR',
    description: {
      en: 'Non-toxic HAN Green Monopropellant qualifies for low-cost NASA VADR rideshare launch.',
      es: 'Propelente verde HAN no tóxico califica para rideshare económico NASA VADR.',
    },
    requiredSubsystemIds: ['prop-thrustme-npt30', 'lv-vadr-rideshare'],
    bonusText: {
      en: '-$1.2M Launch Integration Cost & Zero toxicity hold',
      es: '-$1.2M en integración de cohete y cero riesgo tóxico',
    },
  },
];

export function computeActiveSynergies(selection: MissionSelection): EquipmentSynergy[] {
  const equippedIds = new Set<string>([
    ...selection.payloadIds,
    selection.propulsionId,
    selection.epsId,
    selection.telecomId,
    selection.thermalId,
    selection.adcsId,
    selection.launchVehicleId,
  ]);

  return EQUIPMENT_SYNERGIES.filter((syn) =>
    syn.requiredSubsystemIds.every((id) => equippedIds.has(id)),
  );
}
