import type {
  LocalizedText,
  MissionSelection,
} from '../types/mission';

export type CampaignGuideSpeaker = 'VEGA' | 'ASTRA';

export interface CampaignLevelStepConfig {
  id: string;
  title: LocalizedText;
  hint: LocalizedText;
  astraZone?: string;
}

export interface CampaignLevelConstraints {
  maxMassKg?: number;
  minDeltaV_ms?: number;
  minPowerMarginPct?: number;
  requireEclipseOk?: boolean;
  radiationShielding?: boolean;
}

export interface CampaignContract {
  id: string;
  levelNumber: 1 | 2 | 3 | 4 | 5 | 6;
  presetKey: string;
  code: string;
  tier: number;
  destinationId: string;
  objectiveId: string;
  orbitLabel: LocalizedText;
  title: LocalizedText;
  briefing: LocalizedText;
  bossThreat: LocalizedText;
  guideSpeaker: CampaignGuideSpeaker;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  mechanics: string[];
  steps: CampaignLevelStepConfig[];
  constraints: CampaignLevelConstraints;
  starObjectives: LocalizedText[];
  learnedTakeaways: LocalizedText[];
  rewardXP: number;
  targetStars: number;
  requiredXPToUnlock: number;
  unlockRequiresContractId?: string;
  dataSource: string;
}

export type CampaignLevelConfig = CampaignContract;

export const CAMPAIGN_CONTRACTS: CampaignLevelConfig[] = [
  {
    id: 'contract-leo-bionutrients',
    levelNumber: 1,
    presetKey: 'obj-earth-bionutrients',
    code: 'CONTRACT-01 · LEO',
    tier: 1,
    destinationId: 'dest-leo',
    objectiveId: 'obj-earth-bionutrients',
    orbitLabel: {
      en: 'LEO · 400 km · 51.6° (ISS Inclination)',
      es: 'LEO · 400 km · 51.6° (Inclinación EEI)',
    },
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
    guideSpeaker: 'VEGA',
    difficulty: 1,
    mechanics: ['tutorial-tour', 'chassis-sizing', 'eps-sizing', 'mission-contract'],
    steps: [
      {
        id: 'step-vital-signs',
        title: { en: 'Vital Signs & Mass/Power Budgets', es: 'Signos Vitales y Presupuestos' },
        hint: {
          en: 'Check Mass, Power, Delta-V, Link, and Budget bars before changing parts.',
          es: 'Revisa las barras de Masa, Energía, Delta-V, Enlace y Presupuesto antes de elegir piezas.',
        },
        astraZone: 'RESOURCES',
      },
      {
        id: 'step-chassis',
        title: { en: 'CubeSat Chassis (CDS 1.5U–3U)', es: 'Chasis CubeSat (CDS 1.5U–3U)' },
        hint: {
          en: 'Pick a form factor that fits your payload volume inside the launcher fairing.',
          es: 'Elige un formato que aloje tu carga útil dentro del volumen de la cofia.',
        },
        astraZone: 'CHASSIS',
      },
      {
        id: 'step-eps',
        title: { en: 'Solar Array & EPS Margin', es: 'Paneles Solares y Margen EPS' },
        hint: {
          en: 'LEO has ~35 min eclipses every 92 min; size solar generation with ≥35% margin.',
          es: 'En LEO hay ~35 min de eclipse cada 92 min; dimensiona energía con ≥35% de margen.',
        },
        astraZone: 'EPS',
      },
      {
        id: 'step-mission',
        title: { en: 'Mission Contract & Objectives', es: 'Contrato de Misión y Objetivos' },
        hint: {
          en: 'Confirm your science contract and mission statement before advancing.',
          es: 'Confirma tu contrato científico y enunciado de misión antes de avanzar.',
        },
        astraZone: 'MISSION',
      },
    ],
    constraints: {
      maxMassKg: 12,
      minPowerMarginPct: 25,
      requireEclipseOk: true,
    },
    starObjectives: [
      { en: 'Keep ≥35% Mass & Power design margin', es: 'Mantener margen ≥35% en Masa y Energía' },
      { en: 'Zero concurrent subsystem conflicts', es: 'Cero conflictos entre subsistemas' },
      { en: 'Stay within mission budget cap', es: 'Mantenerse dentro del presupuesto' },
    ],
    learnedTakeaways: [
      {
        en: 'CubeSat 1U–3U volume standards (CDS Rev. 14.1) and SWaP-C trade-offs.',
        es: 'Estándar CubeSat 1U–3U (CDS Rev. 14.1) y balance SWaP-C (tamaño, peso, potencia y costo).',
      },
      {
        en: 'Why LEO satellites experience ~16 eclipses/day and need battery + solar margin.',
        es: 'Por qué un satélite en LEO sufre ~16 eclipses al día y necesita margen de baterías y paneles.',
      },
    ],
    rewardXP: 100,
    targetStars: 3,
    requiredXPToUnlock: 0,
    dataSource: 'NASA Ames BioNutrients-2 / CubeSat Design Specification Rev. 14.1',
  },
  {
    id: 'contract-sso-tracers',
    levelNumber: 2,
    presetKey: 'obj-sso-tracers',
    code: 'CONTRACT-02 · SSO',
    tier: 2,
    destinationId: 'dest-leo',
    objectiveId: 'obj-sso-tracers',
    orbitLabel: {
      en: 'SSO · ~590–650 km · ~97.8° Sun-Synchronous',
      es: 'SSO · ~590–650 km · ~97.8° Heliosíncrona',
    },
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
    guideSpeaker: 'ASTRA',
    difficulty: 2,
    mechanics: ['tandem-formation', 'sso-inclination', 'ground-pass-windows'],
    steps: [
      {
        id: 'sso-formation',
        title: { en: 'Tandem Separation & Formation', es: 'Separación en Tándem' },
        hint: {
          en: 'Space the twin satellites 10–120 s apart to sample magnetic cusp changes over time.',
          es: 'Separa ambos satélites entre 10 y 120 s para medir cambios temporales en la cúspide polar.',
        },
      },
      {
        id: 'sso-orbit',
        title: { en: 'Sun-Synchronous Orbit (~97.8°)', es: 'Órbita Heliosíncrona (~97.8°)' },
        hint: {
          en: 'Retrograde ~97.8° inclination precesses 1°/day so solar illumination stays consistent.',
          es: 'La inclinación retrógrada (~97.8°) precesa ~1°/día manteniendo iluminación solar constante.',
        },
      },
    ],
    constraints: {
      minPowerMarginPct: 30,
      requireEclipseOk: true,
    },
    starObjectives: [
      { en: 'Match ~97.8° Sun-Synchronous inclination', es: 'Ajustar inclinación heliosíncrona (~97.8°)' },
      { en: 'Maintain twin-craft power & ground pass link', es: 'Garantizar energía y enlace con estación terrena' },
      { en: 'Zero subsystem conflicts', es: 'Cero conflictos entre subsistemas' },
    ],
    learnedTakeaways: [
      {
        en: 'Why Sun-Synchronous Orbits (~97.8°) precess with Earth around the Sun for steady lighting.',
        es: 'Por qué la órbita heliosíncrona (~97.8°) acompaña al Sol y da luz constante.',
      },
      {
        en: 'How twin-spacecraft tandem flights distinguish spatial vs. temporal magnetic reconnection.',
        es: 'Cómo dos satélites en tándem distinguen cambios espaciales de temporales en reconexión magnética.',
      },
    ],
    rewardXP: 250,
    targetStars: 3,
    requiredXPToUnlock: 80,
    unlockRequiresContractId: 'contract-leo-bionutrients',
    dataSource: 'NASA TRACERS Mission (Tandem Reconnection and Cusp Electrodynamics Reconnaissance Satellites)',
  },
  {
    id: 'contract-geo-gmat',
    levelNumber: 3,
    presetKey: 'preset-gmat-geo',
    code: 'CONTRACT-03 · GEO',
    tier: 3,
    destinationId: 'dest-geo',
    objectiveId: 'obj-geo-goes-weather',
    orbitLabel: {
      en: 'GEO · 35,786 km · 0° Equatorial (24 h Period)',
      es: 'GEO · 35,786 km · 0° Ecuatorial (Período 24 h)',
    },
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
    guideSpeaker: 'ASTRA',
    difficulty: 3,
    mechanics: ['hohmann-transfer', 'delta-v-budget', 'station-keeping'],
    steps: [
      {
        id: 'geo-transfer',
        title: { en: 'GTO to GEO Hohmann Burn', es: 'Maniobra Hohmann GTO → GEO' },
        hint: {
          en: 'Circularizing at 35,786 km requires high ΔV propulsion and careful propellant mass.',
          es: 'Circularizar a 35,786 km exige propulsión de alto ΔV y controlar la masa de propelente.',
        },
      },
    ],
    constraints: {
      minDeltaV_ms: 3673,
      radiationShielding: true,
    },
    starObjectives: [
      { en: 'Achieve ≥3,673 m/s ΔV margin', es: 'Alcanzar ΔV ≥ 3,673 m/s' },
      { en: 'Stay within launcher wet-mass limit', es: 'Respetar la capacidad de masa del lanzador' },
      { en: 'Ensure continuous telecom link from 35,786 km', es: 'Garantizar enlace estable a 35,786 km' },
    ],
    learnedTakeaways: [
      {
        en: 'Why 35,786 km altitude yields a 23 h 56 m orbital period that matches Earth’s rotation.',
        es: 'Por qué a 35,786 km el período orbital iguala la rotación terrestre y el satélite “parece quieto”.',
      },
      {
        en: 'How the Tsiolkovsky rocket equation drives propellant mass fraction on Hohmann transfers.',
        es: 'Cómo la ecuación de Tsiolkovsky dispara la masa de propelente en transferencias de Hohmann.',
      },
    ],
    rewardXP: 400,
    targetStars: 3,
    requiredXPToUnlock: 280,
    unlockRequiresContractId: 'contract-sso-tracers',
    dataSource: 'NASA GMAT R2026a GEO Transfer Reference & NOAA/NASA GOES-R Series (35,786 km)',
  },
  {
    id: 'contract-moon-trailblazer',
    levelNumber: 4,
    presetKey: 'obj-helio-lunar-trailblazer',
    code: 'CONTRACT-04 · LUNA',
    tier: 4,
    destinationId: 'dest-moon',
    objectiveId: 'obj-helio-lunar-trailblazer',
    orbitLabel: {
      en: 'Lunar Polar Orbit · ~100 km · ~384,400 km from Earth',
      es: 'Órbita Polar Lunar · ~100 km · ~384,400 km de la Tierra',
    },
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
    guideSpeaker: 'ASTRA',
    difficulty: 4,
    mechanics: ['tli-capture', 'thermal-extremes', 'line-of-sight-comms'],
    steps: [
      {
        id: 'lunar-capture',
        title: { en: 'Trans-Lunar Injection & Capture', es: 'Inyección Translunar y Captura' },
        hint: {
          en: 'Budget ΔV for both lunar orbit insertion and polar crater mapping passes.',
          es: 'Reserva ΔV tanto para la captura lunar como para mantener la órbita polar.',
        },
      },
    ],
    constraints: {
      requireEclipseOk: true,
      minPowerMarginPct: 30,
    },
    starObjectives: [
      { en: 'Survive lunar thermal extremes', es: 'Soportar extremos térmicos lunares' },
      { en: 'Maintain Earth line-of-sight telecom', es: 'Mantener enlace directo con la Tierra' },
      { en: 'Zero subsystem conflicts', es: 'Cero conflictos entre subsistemas' },
    ],
    learnedTakeaways: [
      {
        en: 'Why lunar polar orbits enable global surface coverage and shadowed-crater spectroscopy.',
        es: 'Por qué las órbitas polares lunares permiten mapear cráteres en sombra permanente.',
      },
      {
        en: 'How Earth–Moon ΔV and deep thermal swings shape Artemis-era support spacecraft.',
        es: 'Cómo el ΔV Tierra–Luna y los saltos térmicos condicionan el diseño lunar.',
      },
    ],
    rewardXP: 600,
    targetStars: 3,
    requiredXPToUnlock: 600,
    unlockRequiresContractId: 'contract-geo-gmat',
    dataSource: 'NASA Lunar Trailblazer / Artemis Lunar Reconnaissance Reference (~384,400 km)',
  },
  {
    id: 'contract-l2-jwst-fgs',
    levelNumber: 5,
    presetKey: 'obj-l2-jwst-fgs',
    code: 'CONTRACT-05 · SE-L2',
    tier: 5,
    destinationId: 'dest-l2',
    objectiveId: 'obj-l2-jwst-fgs',
    orbitLabel: {
      en: 'Sun-Earth L2 Halo · ~1,500,000 km',
      es: 'Órbita Halo Sol-Tierra L2 · ~1,500,000 km',
    },
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
    guideSpeaker: 'ASTRA',
    difficulty: 5,
    mechanics: ['halo-orbit-l2', 'sunshield-cryo', 'cascade-deployment'],
    steps: [
      {
        id: 'l2-cryo',
        title: { en: 'Sunshield & Cryogenic Cooling', es: 'Parasol Multicapa y Criogenia' },
        hint: {
          en: 'Block Sun, Earth, and Moon heat on one side so infrared optics stay below 50 K.',
          es: 'Aísla el calor del Sol, la Tierra y la Luna con parasol multicapa para operar bajo 50 K.',
        },
      },
    ],
    constraints: {
      minPowerMarginPct: 35,
    },
    starObjectives: [
      { en: 'Achieve sub-arcsecond ADCS stability', es: 'Lograr estabilidad ADCS sub-arcosegundo' },
      { en: 'Pass cryogenic thermal & power budgets', es: 'Superar balance térmico criogénico y EPS' },
      { en: 'Maintain 1.5M km high-rate telecom', es: 'Mantener enlace de alta tasa a 1.5M km' },
    ],
    learnedTakeaways: [
      {
        en: 'Why Sun-Earth L2 (~1.5M km) keeps Sun, Earth, and Moon behind a single sunshield.',
        es: 'Por qué en L2 (~1.5M km) Sol, Tierra y Luna quedan del mismo lado detrás del parasol.',
      },
      {
        en: 'How passive multi-layer sunshields and active cryocoolers enable infrared astronomy.',
        es: 'Cómo el parasol multicapa y el enfriamiento criogénico permiten observar en infrarrojo.',
      },
    ],
    rewardXP: 850,
    targetStars: 3,
    requiredXPToUnlock: 1100,
    unlockRequiresContractId: 'contract-moon-trailblazer',
    dataSource: 'NASA / ESA / CSA James Webb Space Telescope (JWST) Sun-Earth L2 (~1.5M km)',
  },
  {
    id: 'contract-jupiter-clipper',
    levelNumber: 6,
    presetKey: 'obj-jupiter-clipper',
    code: 'CONTRACT-06 · JÚPITER',
    tier: 6,
    destinationId: 'dest-jupiter',
    objectiveId: 'obj-jupiter-clipper',
    orbitLabel: {
      en: 'Jovian System · 5.20 AU (~778M km) · ~4% Solar Flux',
      es: 'Sistema Joviano · 5.20 AU (~778M km) · ~4% Flujo Solar',
    },
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
    guideSpeaker: 'ASTRA',
    difficulty: 6,
    mechanics: ['rtg-nuclear-power', 'radiation-vault', 'dsn-deep-space-delay'],
    steps: [
      {
        id: 'jup-rtg',
        title: { en: '1/R² Law & Deep-Space Power', es: 'Ley 1/R² y Energía RTG' },
        hint: {
          en: 'At 5.2 AU sunlight is ~1/27th of Earth’s (~3.7%). Choose RTG or massive deep-space arrays.',
          es: 'A 5.2 AU la luz solar cae a ~1/27 (~3.7%). Usa RTG o generación extrema de espacio profundo.',
        },
      },
    ],
    constraints: {
      radiationShielding: true,
      minPowerMarginPct: 30,
    },
    starObjectives: [
      { en: 'Survive 5.2 AU power & thermal cold soak', es: 'Sobrevivir potencia a 5.2 AU y frío extremo' },
      { en: 'Close link budget with DSN 70m dish', es: 'Cerrar enlace con antena DSN de 70m' },
      { en: 'Pass radiation-hardened flight validation', es: 'Aprobar validación contra radiación joviana' },
    ],
    learnedTakeaways: [
      {
        en: 'Inverse-square law (1/R²): at 5.2 AU, solar irradiance drops to ~3.7% of Earth’s.',
        es: 'Ley del cuadrado inverso (1/R²): a 5.2 AU la irradiancia solar cae al ~3.7%.',
      },
      {
        en: 'Why outer-planet missions rely on RTGs, radiation vaults, and autonomous fault protection.',
        es: 'Por qué las misiones al sistema exterior usan RTG, blindaje y autonomía ante retardos de ~45 min.',
      },
    ],
    rewardXP: 1200,
    targetStars: 3,
    requiredXPToUnlock: 1800,
    unlockRequiresContractId: 'contract-l2-jwst-fgs',
    dataSource: 'NASA Europa Clipper / Juno Reference (~5.2 AU, 1/R² solar flux, JPL DSN 70m)',
  },
];

export const CAMPAIGN_LEVELS: CampaignLevelConfig[] = CAMPAIGN_CONTRACTS;

export function getCampaignLevelById(id: string): CampaignLevelConfig {
  return CAMPAIGN_LEVELS.find((lvl) => lvl.id === id) ?? CAMPAIGN_LEVELS[0];
}

export function getNextCampaignLevel(id: string): CampaignLevelConfig | null {
  const idx = CAMPAIGN_LEVELS.findIndex((lvl) => lvl.id === id);
  if (idx < 0 || idx + 1 >= CAMPAIGN_LEVELS.length) return null;
  return CAMPAIGN_LEVELS[idx + 1];
}

export function isCampaignLevelUnlocked(
  level: CampaignLevelConfig,
  campaignProgress: Record<string, { stars: number; completed: boolean }>,
  playerXP: number,
): boolean {
  if (level.levelNumber === 1 || level.requiredXPToUnlock <= 0) return true;
  if (playerXP >= level.requiredXPToUnlock) return true;
  if (level.unlockRequiresContractId && campaignProgress[level.unlockRequiresContractId]?.completed) {
    return true;
  }
  return false;
}

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
