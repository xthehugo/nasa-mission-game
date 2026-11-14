import {
  getMGAContingencyByTRL,
  type GroundStationOption,
  type MissionSelection,
  type OrbitalDestination,
  type ScienceObjective,
  type SubsystemCategory,
  type SubsystemOption,
  type TRLLevel,
} from '../types/mission';

function mga(trl: TRLLevel): number {
  return getMGAContingencyByTRL(trl);
}

export const ORBITAL_DESTINATIONS: OrbitalDestination[] = [
  {
    id: 'dest-leo',
    name: {
      en: 'Low Earth Orbit (LEO · 500 km)',
      es: 'Órbita Baja Terrestre (LEO · 500 km)',
    },
    description: {
      en: 'Fast 95-minute orbital period with frequent Earth passes and regular solar eclipses.',
      es: 'Periodo orbital rápido de 95 min con pasos frecuentes sobre estaciones y eclipses solares regulares.',
    },
    heliocentricDistanceAU: 1.0,
    requiredDeltaV_ms: 150,
    solarIrradiance_Wm2: 1361,
    eclipseFraction: 0.37,
    oneWayLightTimeSec: 0.005,
    distanceFromEarthKm: 1200,
    requiredGroundNetwork: 'COMMERCIAL_GN',
    linkMarginThreshold_dB: 6,
    environmentHazard: {
      en: 'Atomic oxygen drag & ~16 thermal eclipse cycles per day.',
      es: 'Arrastre atmosférico residual y ~16 ciclos térmicos de eclipse diarios.',
    },
  },
  {
    id: 'dest-moon',
    name: {
      en: 'Lunar Polar Orbit (100 km)',
      es: 'Órbita Polar Lunar (100 km)',
    },
    description: {
      en: 'Translunar injection plus lunar orbit insertion; ideal for volatiles and solar-wind monitoring.',
      es: 'Inyección translunar e inserción orbital; ideal para búsqueda de hielo polar y clima espacial.',
    },
    heliocentricDistanceAU: 1.0,
    requiredDeltaV_ms: 3950,
    solarIrradiance_Wm2: 1361,
    eclipseFraction: 0.25,
    oneWayLightTimeSec: 1.28,
    distanceFromEarthKm: 384400,
    requiredGroundNetwork: 'NEAR_EARTH_NETWORK',
    linkMarginThreshold_dB: 6,
    environmentHazard: {
      en: 'High Delta-V capture burn & long lunar shadow thermal drops.',
      es: 'Alto consumo de Delta-V en captura y fuertes caídas térmicas en sombra lunar.',
    },
  },
  {
    id: 'dest-mars',
    name: {
      en: 'Mars Science Orbit (1.52 AU)',
      es: 'Órbita de Marte (1.52 AU)',
    },
    description: {
      en: 'Interplanetary transfer with 43% of Earth solar flux and deep-space communications.',
      es: 'Transferencia interplanetaria con solo 43% de luz solar terrestre y comunicaciones de espacio profundo.',
    },
    heliocentricDistanceAU: 1.52,
    requiredDeltaV_ms: 4500,
    solarIrradiance_Wm2: 589,
    eclipseFraction: 0.15,
    oneWayLightTimeSec: 750,
    distanceFromEarthKm: 225000000,
    requiredGroundNetwork: 'DSN_34M',
    linkMarginThreshold_dB: 3,
    environmentHazard: {
      en: 'Reduced solar irradiance (589 W/m²) & up to 21-min communication latency.',
      es: 'Irradiancia solar reducida (589 W/m²) y latencia de señal de hasta 21 min.',
    },
  },
  {
    id: 'dest-jupiter',
    name: {
      en: 'Jupiter / Jovian System (5.20 AU)',
      es: 'Júpiter / Espacio Profundo (5.20 AU)',
    },
    description: {
      en: 'Extreme outer-planet trajectory where sunlight drops to 3.7% and radiation is intense.',
      es: 'Trayectoria al sistema exterior donde la luz solar cae al 3.7% bajo radiación extrema.',
    },
    heliocentricDistanceAU: 5.2,
    requiredDeltaV_ms: 6800,
    solarIrradiance_Wm2: 50.3,
    eclipseFraction: 0.12,
    oneWayLightTimeSec: 2595,
    distanceFromEarthKm: 778000000,
    requiredGroundNetwork: 'DSN_70M',
    linkMarginThreshold_dB: 3,
    environmentHazard: {
      en: 'Severe radiation belts, 3.7% sunlight (RTG critical) & 43-min one-way light delay.',
      es: 'Cinturones de radiación severa, 3.7% de sol (RTG crítico) y 43 min de retardo.',
    },
  },
];

export const SCIENCE_OBJECTIVES: ScienceObjective[] = [
  {
    id: 'obj-earth-bionutrients',
    discipline: 'EARTH_SCIENCE',
    title: {
      en: 'Earth Climate & Orbital Bio-Payload Observatory',
      es: 'Observatorio Terrestre de Clima y Bio-Carga Orbital',
    },
    question: {
      en: 'How can multispectral coastal imagery and orbital telemetry track ocean ecosystems and rapid environmental shifts?',
      es: '¿Cómo monitorear ecosistemas costeros y cambios ambientales rápidos mediante sensores multiespectrales en LEO?',
    },
    targetDestinationId: 'dest-leo',
    requiredPayloadIds: ['pay-multispectral'],
    minDataRateKbps: 64,
    baseBudgetMillions: 25,
    targetDurationYears: 2,
    realWorldBenchmark: {
      missionName: 'NASA BioNutrients-2 & PACE (LEO)',
      launchYear: 2024,
      actualMass_kg: 26,
      actualPower_W: 45,
      actualCost_MillionsUSD: 18,
      keyTakeaway: {
        en: 'SmallSat and CubeSat architectures achieve high Earth-science return at low cost using rideshare launch and COTS TRL-9 subsystems.',
        es: 'Las arquitecturas SmallSat/CubeSat logran alto retorno científico a bajo costo usando lanzamientos compartidos (rideshare) y componentes probados TRL 9.',
      },
      nasaReferenceUrl: 'https://www.nasa.gov/general/what-is-bionutrients/',
    },
  },
  {
    id: 'obj-helio-lunar-trailblazer',
    discipline: 'HELIOPHYSICS',
    title: {
      en: 'Lunar Polar Volatiles & Solar Wind Explorer',
      es: 'Explorador Lunar de Volátiles Polares y Viento Solar',
    },
    question: {
      en: 'Where is water ice trapped in permanently shadowed lunar craters, and how does solar wind weather the surface?',
      es: '¿Dónde se concentra el hielo de agua en cráteres lunares y cómo interactúa con el viento solar?',
    },
    targetDestinationId: 'dest-moon',
    requiredPayloadIds: ['pay-ir-spectrometer'],
    minDataRateKbps: 256,
    baseBudgetMillions: 95,
    targetDurationYears: 2,
    realWorldBenchmark: {
      missionName: 'NASA Lunar Trailblazer & PUNCH',
      launchYear: 2025,
      actualMass_kg: 210,
      actualPower_W: 280,
      actualCost_MillionsUSD: 72,
      keyTakeaway: {
        en: 'Reaching Lunar Orbit (~3,950 m/s Delta-V) on a small launcher requires balancing high-Isp propulsion with thermal survival in eclipses.',
        es: 'Llegar a la órbita lunar (~3,950 m/s de Delta-V) en un lanzador pequeño exige equilibrar propulsión eficiente y supervivencia térmica en eclipses.',
      },
      nasaReferenceUrl: 'https://science.nasa.gov/mission/punch/',
    },
  },
  {
    id: 'obj-mars-reconnaissance',
    discipline: 'PLANETARY_SCIENCE',
    title: {
      en: 'Mars Subsurface Radar & Dust Mapper',
      es: 'Mapeador de Subsuelo Marciano por Radar SAR',
    },
    question: {
      en: 'Can active L-band radar map buried Martian water-ice aquifers beneath global dust storms?',
      es: '¿Puede un radar activo en Banda L cartografiar acuíferos de hielo subterráneo bajo tormentas de polvo en Marte?',
    },
    targetDestinationId: 'dest-mars',
    requiredPayloadIds: ['pay-sar-radar'],
    minDataRateKbps: 128,
    baseBudgetMillions: 280,
    targetDurationYears: 3,
    realWorldBenchmark: {
      missionName: 'NASA Mars Reconnaissance Orbiter (MRO)',
      launchYear: 2005,
      actualMass_kg: 2180,
      actualPower_W: 1500,
      actualCost_MillionsUSD: 720,
      keyTakeaway: {
        en: 'Active radar payloads at 1.52 AU demand oversized deployable solar arrays, 3-axis precision ADCS, and a heavy-lift rocket.',
        es: 'Un radar activo a 1.52 AU exige grandes paneles solares desplegables, control preciso en 3 ejes y un lanzador mediano/pesado.',
      },
      nasaReferenceUrl: 'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/',
    },
  },
  {
    id: 'obj-jupiter-clipper',
    discipline: 'ASTROPHYSICS',
    title: {
      en: 'Jovian Icy Moons Deep-Space Observatory',
      es: 'Observatorio de Lunas Heladas en Júpiter',
    },
    question: {
      en: 'Do subsurface oceans on Europa and Ganymede exhibit thermal plumes and mineral signatures detectable from orbit?',
      es: '¿Presentan los océanos subterráneos de Europa y Ganímedes columnas térmicas detectables mediante espectroscopía IR?',
    },
    targetDestinationId: 'dest-jupiter',
    requiredPayloadIds: ['pay-ir-spectrometer', 'pay-multispectral'],
    minDataRateKbps: 32,
    baseBudgetMillions: 320,
    targetDurationYears: 5,
    realWorldBenchmark: {
      missionName: 'NASA Europa Clipper & JWST / CSA FGS',
      launchYear: 2024,
      actualMass_kg: 3240,
      actualPower_W: 700,
      actualCost_MillionsUSD: 1200,
      keyTakeaway: {
        en: 'At 5.2 AU sunlight is 27x weaker; radioisotope power (RTG) and the 70m Deep Space Network become mission-critical.',
        es: 'A 5.2 AU la luz solar es 27 veces más débil; la energía por radioisótopos (RTG) y la red DSN de 70 m son indispensables.',
      },
      nasaReferenceUrl: 'https://europa.nasa.gov/',
    },
  },
];

export const SUBSYSTEM_CATALOG: SubsystemOption[] = [
  // 1. PAYLOAD
  {
    id: 'pay-multispectral',
    category: 'PAYLOAD',
    name: {
      en: 'Optical Multispectral Imager',
      es: 'Cámara Óptica Multiespectral',
    },
    description: {
      en: 'Lightweight 3U visible/NIR telescope for surface mapping and star/cloud imaging.',
      es: 'Telescopio ligero 3U en visible/NIR para mapeo superficial e imagen óptica.',
    },
    tradeOffNote: {
      en: 'Low mass (3.5 kg) and high TRL-9 heritage, but cannot see through clouds or darkness.',
      es: 'Baja masa (3.5 kg) y alta herencia TRL 9, pero depende de iluminación solar y cielos despejados.',
    },
    analogyTooltip: {
      en: 'Like a ultra-sharp satellite smartphone camera: light and frugal, but blind at night or through thick clouds.',
      es: 'Como una cámara fotográfica espacial ultraligera: gasta poca energía y dinero, pero no ve entre nubes ni de noche.',
    },
    massCBE_kg: 3.5,
    powerDrawNominal_W: 6,
    powerDrawPeak_W: 12,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 4.2,
    volume_U: 3,
    trl: 9,
    mgaContingencyFactor: mga(9),
  },
  {
    id: 'pay-ir-spectrometer',
    category: 'PAYLOAD',
    name: {
      en: 'Cryogenic IR Spectrometer',
      es: 'Espectrómetro Infrarrojo Criogénico',
    },
    description: {
      en: 'High-sensitivity infrared spectrometer for detecting water ice, minerals, and thermal plumes.',
      es: 'Espectrómetro infrarrojo de alta sensibilidad para detectar hielo de agua, minerales y plumas térmicas.',
    },
    tradeOffNote: {
      en: 'Reveals chemical composition; TRL 6 raises MGA contingency (18%) and requires steady thermal control.',
      es: 'Revela composición química; TRL 6 sube la contingencia (18%) y exige estabilidad térmica.',
    },
    analogyTooltip: {
      en: 'Like thermal night-vision goggles that read chemical fingerprints from orbit.',
      es: 'Como gafas de visión térmica capaces de leer la huella química de un planeta desde el espacio.',
    },
    massCBE_kg: 18,
    powerDrawNominal_W: 20,
    powerDrawPeak_W: 45,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 22,
    volume_U: 16,
    trl: 6,
    mgaContingencyFactor: mga(6),
  },
  {
    id: 'pay-sar-radar',
    category: 'PAYLOAD',
    name: {
      en: 'Active L-Band SAR Radar',
      es: 'Radar Activo SAR Banda L',
    },
    description: {
      en: 'Synthetic Aperture Radar capable of penetrating dust storms, clouds, and shallow ice.',
      es: 'Radar de Apertura Sintética capaz de penetrar nubes, tormentas de polvo y hielo superficial.',
    },
    tradeOffNote: {
      en: 'Massive science return, but imposes 120 kg mass, 850 W transmit bursts, 650U volume, and TRL 5 risk.',
      es: 'Ciencia sin depender del sol, pero impone 120 kg, picos de 850 W, 650U de volumen y riesgo TRL 5.',
    },
    analogyTooltip: {
      en: 'Like a flying medical MRI scanner: sees underground, but demands huge batteries and a big rocket.',
      es: 'Como una resonancia magnética voladora: ve bajo tierra, pero exige muchísima electricidad y un cohete grande.',
    },
    massCBE_kg: 120,
    powerDrawNominal_W: 95,
    powerDrawPeak_W: 850,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 95,
    volume_U: 650,
    trl: 5,
    mgaContingencyFactor: mga(5),
  },

  // 2. PROPULSION
  {
    id: 'prop-cold-gas',
    category: 'PROPULSION',
    name: {
      en: 'N₂ Cold-Gas Micro-Thrusters',
      es: 'Micro-Propulsores de Gas Frío N₂',
    },
    description: {
      en: 'Simple pressurized nitrogen thrusters for LEO orbit maintenance and de-orbiting.',
      es: 'Propulsores seguros de nitrógeno presurizado para mantenimiento en LEO.',
    },
    tradeOffNote: {
      en: 'Very cheap and TRL 9 safe, but Isp = 68 s makes deep-space Delta-V impossible due to exponential propellant mass.',
      es: 'Muy barato y seguro (TRL 9), pero su Isp = 68 s hace imposible viajar a la Luna o Marte por peso de combustible.',
    },
    analogyTooltip: {
      en: 'Like letting air out of a compressed bottle: ultra-safe for small hops in Earth orbit, useless for interplanetary trips.',
      es: 'Como soltar aire de un tanque presurizado: súper seguro para maniobras cerca de la Tierra, inútil para viajar a otros planetas.',
    },
    massCBE_kg: 2.8,
    powerDrawNominal_W: 2,
    powerDrawPeak_W: 5,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.8,
    volume_U: 1.5,
    trl: 9,
    mgaContingencyFactor: mga(9),
    isp_s: 68,
    propulsionType: 'COLD_GAS',
  },
  {
    id: 'prop-biprop',
    category: 'PROPULSION',
    name: {
      en: 'MMH / NTO Bipropellant Engine',
      es: 'Motor Químico Bipropelente MMH/NTO',
    },
    description: {
      en: 'High-thrust chemical propulsion for fast lunar, Martian, and Jovian orbit insertion burns.',
      es: 'Propulsión química de alto empuje para inserciones rápidas en Luna, Marte y Júpiter.',
    },
    tradeOffNote: {
      en: 'Isp = 315 s with low electrical draw (25 W), allowing RTG missions to reach outer planets.',
      es: 'Isp = 315 s con bajo consumo eléctrico (25 W), clave para viajar al sistema solar exterior con RTG.',
    },
    analogyTooltip: {
      en: 'A classic muscular rocket engine: burns liquid fuel fast for big orbital braking without needing solar power.',
      es: 'El motor muscular clásico: frena fuerte para entrar en órbita de otro planeta sin gastar casi electricidad.',
    },
    massCBE_kg: 24,
    powerDrawNominal_W: 6,
    powerDrawPeak_W: 25,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 12,
    volume_U: 80,
    trl: 8,
    mgaContingencyFactor: mga(8),
    isp_s: 315,
    propulsionType: 'BIPROP',
  },
  {
    id: 'prop-hall',
    category: 'PROPULSION',
    name: {
      en: 'Xenon Hall Electric Thruster (BHT-600)',
      es: 'Propulsor Iónico Hall de Xenón (BHT-600)',
    },
    description: {
      en: 'Ultra-efficient ion propulsion (Isp 1,750 s) dramatically slashing propellant mass.',
      es: 'Propulsión eléctrica de altísima eficiencia (Isp 1,750 s) que reduce drásticamente el propelente.',
    },
    tradeOffNote: {
      en: 'Saves massive fuel weight, but demands 600 W continuous electrical power from large solar arrays.',
      es: 'Ahorra muchísimo combustible, pero exige 600 W continuos de energía eléctrica.',
    },
    analogyTooltip: {
      en: 'Like an electric highway cruiser: tiny fuel tank, huge mileage, but only works if you carry giant solar wings.',
      es: 'Como un auto eléctrico ultraeficiente: casi no gasta gasolina (xenón), pero necesita paneles solares enormes.',
    },
    massCBE_kg: 14.5,
    powerDrawNominal_W: 120,
    powerDrawPeak_W: 600,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 16.5,
    volume_U: 40,
    trl: 6,
    mgaContingencyFactor: mga(6),
    isp_s: 1750,
    propulsionType: 'ELECTRIC_HALL',
  },

  // 3. EPS (POWER)
  {
    id: 'eps-body-mounted',
    category: 'EPS',
    name: {
      en: 'Body-Mounted Solar Panels (28 W)',
      es: 'Paneles Solares Fijos en Cuerpo (28 W)',
    },
    description: {
      en: 'Zero-deployment triple-junction solar cells bonded directly to satellite walls.',
      es: 'Celdas solares de triple unión fijadas al chasis sin mecanismos desplegables.',
    },
    tradeOffNote: {
      en: 'Highest mechanical reliability (TRL 9) and lowest cost, but output is limited to ~28 W at 1 AU.',
      es: 'Máxima confiabilidad mecánica (TRL 9) y mínimo costo, pero genera solo ~28 W a 1 AU.',
    },
    analogyTooltip: {
      en: 'Solar stickers glued to the box: nothing can jam when opening, but energy is tiny.',
      es: 'Paneles pegados a la caja: nada se puede trabar al abrirse, pero dan poca electricidad.',
    },
    massCBE_kg: 1.2,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 28,
    cost_MillionsUSD: 0.4,
    volume_U: 0.5,
    trl: 9,
    mgaContingencyFactor: mga(9),
    solarPanelArea_m2: 0.08,
    isRTG: false,
  },
  {
    id: 'eps-deployable',
    category: 'EPS',
    name: {
      en: '2-Axis Deployable Solar Wings (350 W)',
      es: 'Paneles Desplegables 2-Ejes (350 W)',
    },
    description: {
      en: 'Sun-tracking articulated solar arrays delivering 350 W at 1 AU.',
      es: 'Alas solares articuladas con seguimiento solar continuo de 350 W a 1 AU.',
    },
    tradeOffNote: {
      en: '12x more power than fixed panels, but suffers 1/R² drop at Mars/Jupiter and hinge deployment risk.',
      es: '12x más potencia que paneles fijos, pero cae por 1/R² en Marte/Júpiter y tiene riesgo mecánico de despliegue.',
    },
    analogyTooltip: {
      en: 'Sunflowers that fold inside the rocket and open in space to follow the Sun.',
      es: 'Girasoles plegables: van guardados en el cohete y se abren en el espacio para seguir al Sol.',
    },
    massCBE_kg: 7.5,
    powerDrawNominal_W: 2,
    powerDrawPeak_W: 4,
    powerGenerated1AU_W: 350,
    cost_MillionsUSD: 3.5,
    volume_U: 4,
    trl: 7,
    mgaContingencyFactor: mga(7),
    solarPanelArea_m2: 1.0,
    isRTG: false,
  },
  {
    id: 'eps-megaflex',
    category: 'EPS',
    name: {
      en: 'Mega-Flex High-Power Solar Array (4,200 W)',
      es: 'Alas Solares Mega-Flex de Alta Potencia (4,200 W)',
    },
    description: {
      en: 'Large lightweight deployable arrays engineered to power Hall thrusters and Mars SAR radars.',
      es: 'Grandes alas desplegables ligeras para alimentar motores Hall o radares SAR en Marte.',
    },
    tradeOffNote: {
      en: 'Generates ~1,650 W even at Mars (1.52 AU), though adds 28 kg mass and 16U stowed volume.',
      es: 'Entrega ~1,650 W incluso en Marte (1.52 AU), aunque añade 28 kg y 16U en cofia.',
    },
    analogyTooltip: {
      en: 'Giant origami solar sails that keep big science radars running even far away at Mars.',
      es: 'Velas solares gigantes tipo origami que mantienen encendidos radares pesados incluso lejos, en Marte.',
    },
    massCBE_kg: 28,
    powerDrawNominal_W: 5,
    powerDrawPeak_W: 10,
    powerGenerated1AU_W: 4200,
    cost_MillionsUSD: 18,
    volume_U: 16,
    trl: 8,
    mgaContingencyFactor: mga(8),
    solarPanelArea_m2: 12.0,
    isRTG: false,
  },
  {
    id: 'eps-rtg',
    category: 'EPS',
    name: {
      en: 'Dual Next-Gen RTG (240 W Constant)',
      es: 'Generador Radioisótopo RTG Dual (240 W Constantes)',
    },
    description: {
      en: 'Plutonium-238 radioisotope thermoelectric power immune to distance from the Sun or eclipses.',
      es: 'Batería nuclear de radioisótopos Pu-238 inmune a eclipses y distancia al Sol.',
    },
    tradeOffNote: {
      en: 'Essential for Jupiter (5.2 AU) where solar flux is 3.7%, but costs $85M and weighs 52 kg.',
      es: 'Indispensable para Júpiter (5.2 AU) donde el sol cae al 3.7%, pero cuesta $85M y pesa 52 kg.',
    },
    analogyTooltip: {
      en: 'A nuclear thermos that makes steady electricity in pitch-black deep space—costly, heavy, and unstoppable.',
      es: 'Un termo nuclear que produce electricidad constante en la oscuridad del espacio profundo; caro y pesado, pero imparable.',
    },
    massCBE_kg: 52,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 240,
    cost_MillionsUSD: 85,
    volume_U: 250,
    trl: 6,
    mgaContingencyFactor: mga(6),
    isRTG: true,
  },

  // 4. TELECOM
  {
    id: 'telecom-uhf',
    category: 'TELECOM',
    name: {
      en: 'UHF / S-Band COTS Transponder',
      es: 'Transpondedor UHF / Banda S COTS',
    },
    description: {
      en: 'Compact omnidirectional transceiver for LEO telemetry and CubeSat downlinks.',
      es: 'Transceptor omnidireccional compacto para telemetría en órbita baja.',
    },
    tradeOffNote: {
      en: 'Forgiving pointing and $0.3M cost, but low data rate (128 kbps) fails link budgets beyond Moon.',
      es: 'No exige puntería milimétrica y cuesta $0.3M, pero su señal no alcanza para Marte ni Júpiter.',
    },
    analogyTooltip: {
      en: 'Like a reliable walkie-talkie: easy to point anywhere in Earth orbit, too weak to shout across the solar system.',
      es: 'Como un walkie-talkie robusto: funciona fácil cerca de la Tierra, pero no llega a otros planetas.',
    },
    massCBE_kg: 0.9,
    powerDrawNominal_W: 3,
    powerDrawPeak_W: 12,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.3,
    volume_U: 0.5,
    trl: 9,
    mgaContingencyFactor: mga(9),
    freqGHz: 0.437,
    txPower_W: 2,
    antennaGain_dBi: 3,
    maxDataRate_kbps: 128,
    pointingAccuracy_deg: 15,
  },
  {
    id: 'telecom-xka',
    category: 'TELECOM',
    name: {
      en: 'X/Ka-Band High-Gain Dish (1.8 m)',
      es: 'Transmisor Banda X/Ka + Antena Parabólica (1.8 m)',
    },
    description: {
      en: 'Deep-space TWTA transponder with high-gain parabolic dish compatible with NASA DSN.',
      es: 'Transpondedor de espacio profundo compatible con la Red DSN de la NASA.',
    },
    tradeOffNote: {
      en: 'Closes link budgets to Mars & Jupiter, but requires 3-axis ADCS pointing accuracy <= 0.5°.',
      es: 'Cierra enlaces hasta Marte y Júpiter, pero exige precisión de apuntamiento ADCS <= 0.5°.',
    },
    analogyTooltip: {
      en: 'Like a spotlight megaphone: sends high-res science across millions of km, if you aim straight at Earth.',
      es: 'Como un megáfono láser de foco estrecho: envía ciencia a millones de km si apuntas exacto a la Tierra.',
    },
    massCBE_kg: 12,
    powerDrawNominal_W: 15,
    powerDrawPeak_W: 85,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 9.5,
    volume_U: 12,
    trl: 8,
    mgaContingencyFactor: mga(8),
    freqGHz: 8.4,
    txPower_W: 35,
    antennaGain_dBi: 47,
    maxDataRate_kbps: 512,
    pointingAccuracy_deg: 0.5,
  },
  {
    id: 'telecom-laser',
    category: 'TELECOM',
    name: {
      en: 'Deep-Space Optical Laser Terminal',
      es: 'Terminal Óptica Láser de Espacio Profundo',
    },
    description: {
      en: 'Next-gen infrared laser transceiver delivering ultra-high bandwidth from planetary distances.',
      es: 'Transceptor láser de nueva generación para descargas masivas desde planetas lejanos.',
    },
    tradeOffNote: {
      en: 'Massive data rates (up to 4,096 kbps), but TRL 5 (32% MGA) and demands <= 0.1° ADCS precision.',
      es: 'Altísimas tasas de datos (4,096 kbps), pero TRL 5 (32% MGA) y puntería estricta <= 0.1°.',
    },
    analogyTooltip: {
      en: 'Fiber-optic internet through empty space using a laser pointer—blazingly fast, zero room for wobble.',
      es: 'Internet de fibra óptica por el espacio usando un puntero láser: rapidísimo, pero cualquier temblor corta la señal.',
    },
    massCBE_kg: 14,
    powerDrawNominal_W: 20,
    powerDrawPeak_W: 110,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 28,
    volume_U: 35,
    trl: 5,
    mgaContingencyFactor: mga(5),
    freqGHz: 32.0,
    txPower_W: 50,
    antennaGain_dBi: 54,
    maxDataRate_kbps: 4096,
    pointingAccuracy_deg: 0.1,
  },

  // 5. THERMAL
  {
    id: 'therm-passive',
    category: 'THERMAL',
    name: {
      en: 'Passive MLI Blankets & Radiators',
      es: 'Control Térmico Pasivo (MLI + Pinturas)',
    },
    description: {
      en: 'Multi-layer insulation blankets and optical solar reflectors requiring zero power.',
      es: 'Mantas aislantes multicapa y recubrimientos radiativos con consumo eléctrico cero.',
    },
    tradeOffNote: {
      en: 'Zero watts and $0.2M, ideal for mild LEO orbits, but risks freezing in deep space or long eclipses.',
      es: '0 W y $0.2M, ideal en LEO, pero insuficiente ante frío extremo en Júpiter o eclipses lunares.',
    },
    analogyTooltip: {
      en: 'Like wrapping the probe in a space-grade winter blanket—light and free, no built-in heater.',
      es: 'Como arropar la sonda con una manta térmica espacial: ligera y sin consumo, pero sin calefacción propia.',
    },
    massCBE_kg: 2.1,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.2,
    volume_U: 1,
    trl: 9,
    mgaContingencyFactor: mga(9),
  },
  {
    id: 'therm-active',
    category: 'THERMAL',
    name: {
      en: 'Active Loop Heaters & Thermostats',
      es: 'Calentadores Activos en Lazo Cerrado',
    },
    description: {
      en: 'Survival heaters protecting propellant valves, batteries, and optics during deep eclipses.',
      es: 'Calentadores autónomos que evitan congelamiento de válvulas, baterías y óptica en eclipses.',
    },
    tradeOffNote: {
      en: 'Prevents thermal failure in Lunar/Mars/Jupiter shadows at the cost of 35 W peak heater draw.',
      es: 'Evita fallos por congelación en Luna/Marte/Júpiter consumiendo 35 W en sombra.',
    },
    analogyTooltip: {
      en: 'An automatic electric thermostat keeping the spacecraft fuel lines from freezing like pipes in winter.',
      es: 'Un termostato eléctrico que impide que el combustible y las baterías se congelen en la sombra del espacio.',
    },
    massCBE_kg: 4.5,
    powerDrawNominal_W: 10,
    powerDrawPeak_W: 35,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 1.1,
    volume_U: 2,
    trl: 8,
    mgaContingencyFactor: mga(8),
  },
  {
    id: 'therm-cryo',
    category: 'THERMAL',
    name: {
      en: 'Pumped Fluid Loop & Cryocooler',
      es: 'Bucle de Fluido Bombeado + Criorefrigerador',
    },
    description: {
      en: 'High-capacity heat rejection and sub-60K detector cooling for high-power radars and IR optics.',
      es: 'Disipación térmica de alta potencia y enfriamiento criogénico para radares y detectores IR.',
    },
    tradeOffNote: {
      en: 'Handles SAR radar heat loads safely, adding 22 kg mass, 140 W draw, and $15M cost.',
      es: 'Disipa calor de radares SAR sin sobrecalentarse, añadiendo 22 kg, 140 W y $15M.',
    },
    analogyTooltip: {
      en: 'Like a liquid-cooled gaming PC + mini freezer combined to stop giant radars from overheating.',
      es: 'Como refrigeración líquida de alto rendimiento para disipar el calor extremo de radares potentes.',
    },
    massCBE_kg: 22,
    powerDrawNominal_W: 55,
    powerDrawPeak_W: 140,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 15,
    volume_U: 60,
    trl: 6,
    mgaContingencyFactor: mga(6),
  },

  // 6. ADCS
  {
    id: 'adcs-gravity',
    category: 'ADCS',
    name: {
      en: 'Gravity-Gradient & Magnetorquers',
      es: 'Gradiente Gravitatorio + Magnetorquers',
    },
    description: {
      en: 'Passive-assisted attitude control suited for basic LEO CubeSats with wide-beam UHF.',
      es: 'Estabilización sencilla para CubeSats en LEO con antenas de haz ancho.',
    },
    tradeOffNote: {
      en: 'Ultra-low mass (1.5 kg, 2 W), but coarse ±5° pointing breaks narrow Ka-band/laser beams.',
      es: 'Muy ligero (1.5 kg, 2 W), pero su error de ±5° rompe enlaces estrechos en Banda Ka o láser.',
    },
    analogyTooltip: {
      en: 'A simple compass needle: keeps the craft roughly upright near Earth, not steady enough for laser aim.',
      es: 'Como una brújula sencilla: orienta el satélite sin precisión fina; rompe enlaces de banda estrecha.',
    },
    massCBE_kg: 1.5,
    powerDrawNominal_W: 2,
    powerDrawPeak_W: 3,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.5,
    volume_U: 1,
    trl: 9,
    mgaContingencyFactor: mga(9),
    pointingAccuracy_deg: 5.0,
  },
  {
    id: 'adcs-3axis',
    category: 'ADCS',
    name: {
      en: '3-Axis Reaction Wheels + Star Tracker',
      es: 'Control 3-Ejes: Ruedas de Reacción + Star Tracker',
    },
    description: {
      en: 'Precision attitude stabilization using optical star cameras and momentum wheels.',
      es: 'Estabilización de alta precisión mediante cámaras estelares y ruedas de reacción.',
    },
    tradeOffNote: {
      en: '0.02° pointing accuracy enables deep-space X/Ka/laser links and sharp IR/SAR imaging.',
      es: 'Precisión de 0.02° que habilita enlaces Ka/láser a Marte y Júpiter e imágenes nítidas.',
    },
    analogyTooltip: {
      en: 'Gyroscope stabilizers + star-reading GPS camera that hold a telescope rock-steady at 0.02 degrees.',
      es: 'Giroscopios y cámara de estrellas que mantienen el satélite quieto con precisión quirúrgica de 0.02°.',
    },
    massCBE_kg: 5.8,
    powerDrawNominal_W: 14,
    powerDrawPeak_W: 18,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 3.8,
    volume_U: 2.5,
    trl: 8,
    mgaContingencyFactor: mga(8),
    pointingAccuracy_deg: 0.02,
  },
  {
    id: 'adcs-rcs',
    category: 'ADCS',
    name: {
      en: 'Agile Cold-Gas RCS Attitude Control',
      es: 'Control Rápido por Propulsores RCS',
    },
    description: {
      en: 'Fast slewing attitude thrusters for rapid target re-pointing during short flybys.',
      es: 'Propulsores de actitud para giros rápidos durante sobrevuelos cortos.',
    },
    tradeOffNote: {
      en: '0.25° accuracy with fast slews, supports X/Ka links while keeping power draw low (8 W).',
      es: 'Precisión de 0.25° para giros ágiles, compatible con Banda X/Ka y bajo consumo (8 W).',
    },
    analogyTooltip: {
      en: 'Tiny steering jets on the corners of the ship for quick turns without draining batteries.',
      es: 'Pequeños chorros laterales para girar rápido hacia objetivos científicos sin gastar mucha batería.',
    },
    massCBE_kg: 8,
    powerDrawNominal_W: 5,
    powerDrawPeak_W: 8,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 2.2,
    volume_U: 3,
    trl: 9,
    mgaContingencyFactor: mga(9),
    pointingAccuracy_deg: 0.25,
  },

  // 7. LAUNCH VEHICLES
  {
    id: 'lv-rideshare',
    category: 'LAUNCH_VEHICLE',
    name: {
      en: 'LEO CubeSat Rideshare Dispenser',
      es: 'Dispensador Rideshare CubeSat (LEO)',
    },
    description: {
      en: 'Shared deployer slot aboard a commercial orbital flight (up to 45 kg, 24U volume).',
      es: 'Espacio compartido en lanzador comercial (hasta 45 kg húmedos y 24U de volumen).',
    },
    tradeOffNote: {
      en: 'Ultra-low $0.35M cost, but strictly limited to 45 kg wet mass and 24U fairing volume.',
      es: 'Costo mínimo ($0.35M), pero limitado estrictamente a 45 kg de masa húmeda y 24U de volumen.',
    },
    analogyTooltip: {
      en: 'Taking a shared space-bus seat: dirt cheap for small satellites, zero room for big tanks or radars.',
      es: 'Viajar en asiento compartido: baratísimo para satélites pequeños, pero no cabe nada pesado.',
    },
    massCBE_kg: 0,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.35,
    volume_U: 0,
    trl: 9,
    mgaContingencyFactor: mga(9),
    maxPayloadMass_kg: 45,
    fairingVolume_U: 24,
  },
  {
    id: 'lv-electron',
    category: 'LAUNCH_VEHICLE',
    name: {
      en: 'Dedicated Small Launcher (Electron-class)',
      es: 'Lanzador Dedicado Pequeño (Clase Electron)',
    },
    description: {
      en: 'Dedicated orbital insertion for SmallSats up to 300 kg and 350U fairing envelope.',
      es: 'Inyección orbital dedicada para SmallSats de hasta 300 kg húmedos y cofia de 350U.',
    },
    tradeOffNote: {
      en: 'Custom orbit inclination for $7.5M; pairs smoothly with Xenon Hall propulsion for Lunar missions.',
      es: 'Órbita a medida por $7.5M; ideal con propulsión Hall para misiones lunares ligeras.',
    },
    analogyTooltip: {
      en: 'Renting your own compact delivery van straight to your chosen orbit.',
      es: 'Alquilar tu propia furgoneta espacial directa a la órbita exacta que necesitas.',
    },
    massCBE_kg: 0,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 7.5,
    volume_U: 0,
    trl: 9,
    mgaContingencyFactor: mga(9),
    maxPayloadMass_kg: 300,
    fairingVolume_U: 350,
  },
  {
    id: 'lv-falcon9',
    category: 'LAUNCH_VEHICLE',
    name: {
      en: 'Medium/Heavy Launcher (Falcon 9 / Atlas-class)',
      es: 'Lanzador Mediano/Pesado (Clase Falcon 9 / Atlas)',
    },
    description: {
      en: 'High-energy interplanetary launcher supporting up to 4,500 kg wet mass and 4,000U fairings.',
      es: 'Lanzador interplanetario de alta capacidad hasta 4,500 kg húmedos y cofia de 4,000U.',
    },
    tradeOffNote: {
      en: 'Unlocks Mars radars and Jovian RTG probes, at a programmatic cost of $65M.',
      es: 'Habilita radares a Marte y sondas RTG a Júpiter, con costo base de $65M.',
    },
    analogyTooltip: {
      en: 'A heavy cargo freighter rocket: expensive ticket ($65M), but carries heavy fuel and giant instruments anywhere.',
      es: 'Un carguero pesado interplanetario: cuesta $65M, pero lleva combustible pesado y radares a cualquier planeta.',
    },
    massCBE_kg: 0,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 65,
    volume_U: 0,
    trl: 9,
    mgaContingencyFactor: mga(9),
    maxPayloadMass_kg: 4500,
    fairingVolume_U: 4000,
  },
];

export const GROUND_STATIONS: GroundStationOption[] = [
  {
    id: 'gs-commercial',
    type: 'COMMERCIAL_GN',
    name: {
      en: 'Commercial University Ground Dish (3 m)',
      es: 'Estación Terrestre Comercial / Universitaria (3 m)',
    },
    figureOfMerit_G_T_dBK: 14,
    costPerMonth_MillionsUSD: 0.04,
    compatibleBands: ['UHF', 'S-Band'],
  },
  {
    id: 'gs-near-earth',
    type: 'NEAR_EARTH_NETWORK',
    name: {
      en: 'NASA Near-Earth Network (11 m)',
      es: 'Red Near-Earth de la NASA (11 m)',
    },
    figureOfMerit_G_T_dBK: 28,
    costPerMonth_MillionsUSD: 0.15,
    compatibleBands: ['S-Band', 'X-Band', 'Ka-Band'],
  },
  {
    id: 'gs-dsn-34m',
    type: 'DSN_34M',
    name: {
      en: 'Deep Space Network — 34m Beam Waveguide',
      es: 'Deep Space Network (DSN) — Antena 34 m',
    },
    figureOfMerit_G_T_dBK: 50,
    costPerMonth_MillionsUSD: 0.45,
    compatibleBands: ['X-Band', 'Ka-Band', 'Optical'],
  },
  {
    id: 'gs-dsn-70m',
    type: 'DSN_70M',
    name: {
      en: 'Deep Space Network — 70m Goldstone/Madrid/Canberra',
      es: 'Deep Space Network (DSN) — Antena Criogénica 70 m',
    },
    figureOfMerit_G_T_dBK: 62,
    costPerMonth_MillionsUSD: 0.9,
    compatibleBands: ['X-Band', 'Ka-Band', 'Optical'],
  },
];

export const PRESET_MISSION_SELECTIONS: Record<string, MissionSelection> = {
  'obj-earth-bionutrients': {
    objectiveId: 'obj-earth-bionutrients',
    destinationId: 'dest-leo',
    payloadIds: ['pay-multispectral'],
    propulsionId: 'prop-cold-gas',
    epsId: 'eps-deployable',
    telecomId: 'telecom-uhf',
    thermalId: 'therm-passive',
    adcsId: 'adcs-gravity',
    launchVehicleId: 'lv-rideshare',
    groundStationId: 'gs-commercial',
  },
  'obj-helio-lunar-trailblazer': {
    objectiveId: 'obj-helio-lunar-trailblazer',
    destinationId: 'dest-moon',
    payloadIds: ['pay-ir-spectrometer'],
    propulsionId: 'prop-hall',
    epsId: 'eps-megaflex',
    telecomId: 'telecom-xka',
    thermalId: 'therm-active',
    adcsId: 'adcs-3axis',
    launchVehicleId: 'lv-electron',
    groundStationId: 'gs-near-earth',
  },
  'obj-mars-reconnaissance': {
    objectiveId: 'obj-mars-reconnaissance',
    destinationId: 'dest-mars',
    payloadIds: ['pay-sar-radar'],
    propulsionId: 'prop-biprop',
    epsId: 'eps-megaflex',
    telecomId: 'telecom-xka',
    thermalId: 'therm-cryo',
    adcsId: 'adcs-3axis',
    launchVehicleId: 'lv-falcon9',
    groundStationId: 'gs-dsn-34m',
  },
  'obj-jupiter-clipper': {
    objectiveId: 'obj-jupiter-clipper',
    destinationId: 'dest-jupiter',
    payloadIds: ['pay-ir-spectrometer', 'pay-multispectral'],
    propulsionId: 'prop-biprop',
    epsId: 'eps-rtg',
    telecomId: 'telecom-xka',
    thermalId: 'therm-active',
    adcsId: 'adcs-3axis',
    launchVehicleId: 'lv-falcon9',
    groundStationId: 'gs-dsn-70m',
  },
};

export const DEFAULT_MISSION_SELECTION: MissionSelection =
  PRESET_MISSION_SELECTIONS['obj-earth-bionutrients'];

export function getSubsystemsByCategory(
  category: SubsystemCategory,
): SubsystemOption[] {
  return SUBSYSTEM_CATALOG.filter((item) => item.category === category);
}

export function findSubsystemById(id: string): SubsystemOption | undefined {
  return SUBSYSTEM_CATALOG.find((item) => item.id === id);
}

export function findObjectiveById(id: string): ScienceObjective {
  return (
    SCIENCE_OBJECTIVES.find((obj) => obj.id === id) ?? SCIENCE_OBJECTIVES[0]
  );
}

export function findDestinationById(id: string): OrbitalDestination {
  return (
    ORBITAL_DESTINATIONS.find((dest) => dest.id === id) ??
    ORBITAL_DESTINATIONS[0]
  );
}

export function findGroundStationById(id: string): GroundStationOption {
  return GROUND_STATIONS.find((gs) => gs.id === id) ?? GROUND_STATIONS[0];
}
