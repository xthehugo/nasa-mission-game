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
    id: 'dest-geo',
    name: {
      en: 'Geostationary Orbit (GEO · 35,786 km)',
      es: 'Órbita Geoestacionaria (GEO · 35,786 km)',
    },
    description: {
      en: 'GMAT R2026a Hohmann transfer benchmark from LEO parking orbit: TOI 2,240 m/s + GOI 1,433 m/s = 3,673 m/s total.',
      es: 'Referencia de transferencia Hohmann validada en NASA GMAT R2026a desde LEO: encendido TOI 2,240 m/s + GOI 1,433 m/s = 3,673 m/s totales.',
    },
    heliocentricDistanceAU: 1.0,
    requiredDeltaV_ms: 3673,
    solarIrradiance_Wm2: 1361,
    eclipseFraction: 0.05,
    oneWayLightTimeSec: 0.12,
    distanceFromEarthKm: 35786,
    requiredGroundNetwork: 'NEAR_EARTH_NETWORK',
    linkMarginThreshold_dB: 6,
    environmentHazard: {
      en: 'High Delta-V transfer (~71% fuel mass fraction at Isp 300s) & Van Allen outer electron belt exposure.',
      es: 'Transferencia de alto Delta-V (~71% de fracción de combustible a Isp 300s) y radiación del cinturón exterior de Van Allen.',
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
    id: 'dest-l2',
    name: {
      en: 'Sun-Earth L2 Halo Orbit (1,500,000 km)',
      es: 'Órbita Halo Sol-Tierra L2 (1,500,000 km)',
    },
    description: {
      en: 'Libration halo orbit around Sun-Earth L2 at 1.01 AU with zero Earth-shadow eclipses and cryogenic thermal stability.',
      es: 'Órbita de libración Halo alrededor de L2 Sol-Tierra (1.01 AU) libre de eclipses terrestres, ideal para telescopios criogénicos.',
    },
    heliocentricDistanceAU: 1.01,
    requiredDeltaV_ms: 3400,
    solarIrradiance_Wm2: 1334,
    eclipseFraction: 0.0,
    oneWayLightTimeSec: 5.0,
    distanceFromEarthKm: 1500000,
    requiredGroundNetwork: 'DSN_34M',
    linkMarginThreshold_dB: 3,
    environmentHazard: {
      en: 'Continuously sunlit halo orbit (0% eclipse) requiring ~20–40 m/s/yr station-keeping & strict sunshield stray-light isolation.',
      es: 'Órbita halo sin eclipses (0% sombra) que exige ~20–40 m/s/año de station-keeping y parasol criogénico.',
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
    cadetChallenge: {
      en: 'Imagine packing an entire biology lab inside a shoebox satellite that circles Earth every 95 minutes!',
      es: '¡Imagina meter un laboratorio biológico entero dentro de un satélite del tamaño de una caja de zapatos que rodea la Tierra cada 95 minutos!',
    },
    jplConstraints: {
      en: 'LEO 500 km SSO thermal cycling (~16 eclipses/day, eclipseFraction 0.37), atomic oxygen erosion, and 24U CubeSat rideshare deployer volumetric envelope.',
      es: 'Ciclado térmico en LEO 500 km (~16 eclipses/día, eclipseFraction 0.37), erosión por oxígeno atómico y envolvente de dispensador rideshare 24U.',
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
    id: 'obj-geo-goes-weather',
    discipline: 'HELIOPHYSICS',
    title: {
      en: 'GEO Space Weather & Magnetospheric Sentinel',
      es: 'Centinela de Clima Espacial y Magnetósfera en GEO',
    },
    question: {
      en: 'How do solar storms and magnetospheric reconnection events in geostationary orbit (35,786 km) impact satellite infrastructure and Earth grids?',
      es: '¿Cómo impactan las tormentas solares y la reconexión magnética en órbita GEO (35,786 km) a los satélites y redes eléctricas?',
    },
    cadetChallenge: {
      en: 'Park a storm-watching satellite 35,786 km high so it hovers over the exact same spot on Earth day and night!',
      es: '¡Estaciona un satélite cazador de tormentas a 35,786 km para que flote siempre sobre el mismo punto de la Tierra día y noche!',
    },
    jplConstraints: {
      en: 'GMAT R2026a Hohmann TOI+GOI transfer budget (3,673 m/s), Van Allen outer belt TID/SEE radiation hardening, and continuous NSN Ka-band weather telemetry.',
      es: 'Presupuesto Hohmann GMAT R2026a TOI+GOI (3,673 m/s), endurecimiento contra radiación Van Allen y enlace continuo NSN Banda Ka.',
    },
    targetDestinationId: 'dest-geo',
    requiredPayloadIds: ['pay-magnetometer', 'pay-multispectral'],
    minDataRateKbps: 256,
    baseBudgetMillions: 185,
    targetDurationYears: 3,
    realWorldBenchmark: {
      missionName: 'NOAA/NASA GOES-U & NASA TRACERS (GEO / SSO)',
      launchYear: 2024,
      actualMass_kg: 2900,
      actualPower_W: 4000,
      actualCost_MillionsUSD: 520,
      keyTakeaway: {
        en: 'Continuous geostationary space-weather monitoring requires high-Delta-V insertion (3,673 m/s GMAT Hohmann benchmark), magnetometers, and Near Space Network Ka-band downlinks.',
        es: 'El monitoreo continuo en GEO exige alto Delta-V de inserción (3,673 m/s validado en GMAT), magnetómetros y enlace Near Space Network.',
      },
      nasaReferenceUrl: 'https://assets.science.nasa.gov/content/dam/science/missions/tracer/TRACERS%20Press%20Kit.pdf',
    },
  },
  {
    id: 'obj-sso-tracers',
    discipline: 'HELIOPHYSICS',
    title: {
      en: 'Polar Cusp Magnetic Reconnection (NASA TRACERS)',
      es: 'Reconexión Magnética en Cúspide Polar (NASA TRACERS)',
    },
    question: {
      en: 'How does Earth’s magnetic shield connect with solar wind storms over the magnetic poles?',
      es: '¿Cómo se conecta el escudo magnético de la Tierra con las tormentas solares sobre los polos?',
    },
    cadetChallenge: {
      en: 'Two twin satellites fly one right behind the other like cars on an invisible train just 10 to 120 seconds apart, snapping rapid magnetic pictures before the solar storm shifts!',
      es: 'Los dos satélites vuelan uno detrás del otro como vagones de un tren invisible separados por apenas 10 a 120 segundos, tomando fotos magnéticas rápidas antes de que la tormenta solar cambie.',
    },
    jplConstraints: {
      en: 'Along-track formation flying separation (10–120 s) in 590 km SSO (~150 m/s de-orbit/station-keeping); strict DC/AC magnetic cleanliness with 10 rpm spin-stabilized wire booms; differential atmospheric drag management.',
      es: 'Control de formación en pista (along-track separation de 10 s a 120 s) en SSO 590 km (~150 m/s); limpieza magnética estricta del bus (DC/AC magnetic cleanliness) con booms a 10 rpm y mitigación de arrastre diferencial.',
    },
    targetDestinationId: 'dest-leo',
    requiredPayloadIds: ['pay-magnetometer'],
    minDataRateKbps: 256,
    baseBudgetMillions: 115,
    targetDurationYears: 1,
    realWorldBenchmark: {
      missionName: 'NASA TRACERS T1/T2 Tandem (<200 kg, 590 km SSO, Falcon 9 VADR)',
      launchYear: 2025,
      actualMass_kg: 198,
      actualPower_W: 240,
      actualCost_MillionsUSD: 115,
      keyTakeaway: {
        en: 'Twin octagonal SmallSats (<200 kg each) execute 3,000+ polar cusp passes in 590 km SSO via Falcon 9 VADR rideshare.',
        es: 'Dos satélites gemelos octogonales (<200 kg c/u) realizan +3,000 cruces polares en SSO 590 km lanzados vía rideshare Falcon 9 VADR.',
      },
      nasaReferenceUrl: 'https://assets.science.nasa.gov/content/dam/science/missions/tracer/TRACERS%20Press%20Kit.pdf',
    },
  },
  {
    id: 'obj-l2-jwst-fgs',
    discipline: 'ASTROPHYSICS',
    title: {
      en: 'Early Universe Infrared Observatory (JWST / CSA FGS)',
      es: 'Observatorio Infrarrojo del Universo Temprano (JWST / CSA FGS)',
    },
    question: {
      en: 'How can we capture light from the universe’s first galaxies without taking blurry pictures?',
      es: '¿Cómo podemos captar la luz de las primeras galaxias del universo sin que las imágenes salgan borrosas?',
    },
    cadetChallenge: {
      en: 'The Canadian FGS sensor is so sharp it could spot the thickness of a human hair from 1 km away, or catch someone blinking in Toronto all the way from Montreal!',
      es: 'El sensor canadiense FGS es tan asombrosamente preciso que puede ver el grosor de un cabello humano a 1 kilómetro de distancia, o notar si alguien parpadea en Montreal mirándolo desde Toronto.',
    },
    jplConstraints: {
      en: 'Sub-arcsecond line-of-sight stabilization at 16 Hz against a ~1B star catalog; 1,500,000 km SE-L2 Halo orbit (0% eclipse, >=28 Mbps Ka/Optical to DSN); micro-vibration mitigation, stray light per GSFC Rule 5.15, and NASA-STD-5001B glass/ceramic non-fracture factors.',
      es: 'Estabilidad optomecánica y apuntamiento sub-arcosegundo a 16 Hz contra catálogo de ~1,000 millones de estrellas guía en Halo L2 (1.5M km, 0% eclipse, >=28 Mbps Ka/Óptico a DSN); supresión stray light GSFC Rule 5.15 y factores sin fractura NASA-STD-5001B.',
    },
    targetDestinationId: 'dest-l2',
    requiredPayloadIds: ['pay-ir-spectrometer', 'pay-multispectral'],
    minDataRateKbps: 28000,
    baseBudgetMillions: 380,
    targetDurationYears: 10,
    realWorldBenchmark: {
      missionName: 'NASA/ESA/CSA JWST & Fine Guidance Sensor ($10,000M Flagship)',
      launchYear: 2021,
      actualMass_kg: 6500,
      actualPower_W: 2000,
      actualCost_MillionsUSD: 10000,
      keyTakeaway: {
        en: 'Sun-Earth L2 eliminates Earth eclipses for passive cryogenic cooling while requiring >=28 Mbps Ka/Optical DSN downlinks and sub-arcsecond ADCS.',
        es: 'La órbita Halo Sol-Tierra L2 elimina eclipses terrestres para enfriamiento criogénico y exige enlaces >=28 Mbps hacia DSN con apuntamiento sub-arcosegundo.',
      },
      nasaReferenceUrl: 'https://science.nasa.gov/mission/webb/',
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
    cadetChallenge: {
      en: 'Fly low over icy Moon craters that have not seen sunlight in billions of years without letting your batteries freeze!',
      es: '¡Vuela rasante sobre cráteres lunares helados que llevan miles de millones de años a oscuras sin que se congelen tus baterías!',
    },
    jplConstraints: {
      en: '3,950 m/s TLI+LOI capture Delta-V, 25% lunar shadow eclipse cycling requiring active survival heaters, and 256 kbps NSN Ka/X downlink.',
      es: '3,950 m/s de Delta-V (TLI+LOI), 25% de eclipse lunar que exige calentadores de supervivencia y >=256 kbps hacia NSN.',
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
    cadetChallenge: {
      en: 'Carry a heavy underground X-ray radar all the way to Mars, where sunlight is less than half as strong as on Earth!',
      es: '¡Lleva un pesado radar capaz de ver bajo el suelo hasta Marte, donde la luz solar cae a menos de la mitad que en la Tierra!',
    },
    jplConstraints: {
      en: '1/R² solar flux drop to 589 W/m² at 1.52 AU, 850 W L-band SAR peak duty cycling, 4,500 m/s MOI Delta-V, and DSN 34m link closure across 225M km.',
      es: 'Caída solar 1/R² a 589 W/m² en 1.52 AU, picos de 850 W del radar SAR, 4,500 m/s de inserción MOI y enlace DSN 34 m a 225M km.',
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
    cadetChallenge: {
      en: 'Travel 5x farther from the Sun where solar panels barely whisper—you need a nuclear heat battery and giant Earth dishes to phone home!',
      es: '¡Viaja 5 veces más lejos del Sol donde los paneles solares casi no producen luz: necesitarás una batería nuclear RTG y antenas gigantes de 70 m!',
    },
    jplConstraints: {
      en: '3.7% solar irradiance (50.3 W/m² at 5.20 AU) forcing Pu-238 RTG EPS, 6,800 m/s JOI Delta-V, Jovian radiation belt survival, and 70m DSN link closure.',
      es: 'Irradiancia del 3.7% (50.3 W/m² a 5.20 AU) obligando EPS nuclear RTG, 6,800 m/s Delta-V JOI, cinturón de radiación y red DSN 70 m.',
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
    id: 'pay-magnetometer',
    category: 'PAYLOAD',
    name: {
      en: 'Fluxgate Magnetometer & Plasma Analyzer',
      es: 'Magnetómetro Fluxgate y Analizador de Plasma',
    },
    description: {
      en: 'Dual boom-mounted magnetic field and solar-wind ion spectrometer (NASA TRACERS & GOES-U heritage, SSRI SoA).',
      es: 'Espectrómetro de iones y magnetómetro en mástil desplegable (herencia NASA TRACERS y GOES-U, SSRI SoA).',
    },
    tradeOffNote: {
      en: 'Compact (2.2 kg, 4 W) with TRL 9 heritage; pairs with optical imagers for space-weather diagnostics.',
      es: 'Compacto (2.2 kg, 4 W) con herencia TRL 9; ideal junto a cámaras ópticas para clima espacial.',
    },
    analogyTooltip: {
      en: 'A hypersensitive space compass that feels invisible solar magnetic storms before they hit Earth.',
      es: 'Una brújula espacial hipersensible que detecta tormentas magnéticas solares invisibles.',
    },
    massCBE_kg: 2.2,
    powerDrawNominal_W: 4,
    powerDrawPeak_W: 9,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 5.5,
    volume_U: 2,
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
    id: 'prop-han-green',
    category: 'PROPULSION',
    name: {
      en: 'HAN Green Monopropellant Thruster (AF-M315E)',
      es: 'Propulsor Monopropelente Verde HAN (AF-M315E)',
    },
    description: {
      en: 'High-density hydroxylammonium nitrate (HAN) green monopropellant system (NASA SSRI SoA Ch. 4).',
      es: 'Sistema monopropelente verde de nitrato de hidroxilamonio (HAN) de alta densidad volumétrica (NASA SSRI SoA Cap. 4).',
    },
    tradeOffNote: {
      en: 'Isp = 250 s bridges Cold-Gas (68 s) and Biprop (315 s) with lower toxicity and $4.8M cost.',
      es: 'Isp = 250 s cubre la brecha entre Gas Frío (68 s) y Bipropelente (315 s) sin toxicidad hipergólica ($4.8M).',
    },
    analogyTooltip: {
      en: 'Clean high-octane eco-fuel: much stronger than compressed air without toxic chemical handling.',
      es: 'Combustible ecológico de alta densidad: mucho más potente que el gas frío y sin químicos tóxicos.',
    },
    massCBE_kg: 9.5,
    powerDrawNominal_W: 4,
    powerDrawPeak_W: 15,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 4.8,
    volume_U: 18,
    trl: 8,
    mgaContingencyFactor: mga(8),
    isp_s: 250,
    propulsionType: 'MONOPROP',
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
  {
    id: 'prop-fppt-17',
    category: 'PROPULSION',
    name: {
      en: 'Fiber-Fed Pulsed Plasma Thruster (CU Aerospace FPPT-1.7)',
      es: 'Propulsor de Plasma Pulsado por Fibra PTFE (FPPT-1.7)',
    },
    description: {
      en: 'Solid PTFE Teflon pulsed plasma thruster eliminating pressurized tanks and valves (NASA SSRI SoA Table 4-6).',
      es: 'Propulsor de plasma pulsado de teflón sólido PTFE que elimina tanques presurizados y válvulas (NASA SSRI SoA Table 4-6).',
    },
    tradeOffNote: {
      en: 'Ultra-high Isp (3,200 s) with inert solid propellant (TRL 5, 32% MGA), requires 96 W peak bus bursts and 1.7U.',
      es: 'Isp altísimo (3,200 s) con propelente sólido inerte (TRL 5, 32% MGA), exige ráfagas pico de 96 W y 1.7U.',
    },
    analogyTooltip: {
      en: 'Runs on solid plastic thread that vaporizes into electric sparks—zero liquid leaks and super fuel-efficient!',
      es: 'Usa un hilo de plástico sólido que se evapora en chispas eléctricas: cero fugas líquidas y rendimiento altísimo.',
    },
    massCBE_kg: 3.0,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 96,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 1.45,
    volume_U: 1.7,
    trl: 5,
    mgaContingencyFactor: mga(5),
    isp_s: 3200,
    propulsionType: 'ELECTRIC_HALL',
    sourceCitation: 'NASA/TP-20240001342, Table 4-6 (SSRI SoA 2024)',
  },
  {
    id: 'prop-thrustme-npt30',
    category: 'PROPULSION',
    name: {
      en: 'Solid Iodine Gridded-Ion Thruster (ThrustMe NPT30-I2 1U)',
      es: 'Propulsor Iónico de Yodo Sólido (ThrustMe NPT30-I2 1U)',
    },
    description: {
      en: 'Flight-proven 1U solid iodine gridded ion thruster for high-Delta-V CubeSat & SmallSat maneuvering.',
      es: 'Motor iónico compacto 1U de yodo sólido probado en vuelo para maniobras de alto Delta-V en SmallSats.',
    },
    tradeOffNote: {
      en: 'Isp = 2,400 s, TRL 9 (8% MGA), and compact 1.3 kg / 1.0U envelope; draws 45–65 W electrical power.',
      es: 'Isp = 2,400 s, TRL 9 (8% MGA) y empaque mínimo de 1.3 kg / 1.0U; consume 45–65 W eléctricos.',
    },
    analogyTooltip: {
      en: 'Fits in your palm (1U cube) and shoots violet iodine ions instead of toxic pressurized gas—flight-proven in orbit!',
      es: 'Cabe en la palma de la mano (1U) y dispara iones de yodo sólido sin tanques de alta presión, ¡ya probado en órbita!',
    },
    massCBE_kg: 1.3,
    powerDrawNominal_W: 45,
    powerDrawPeak_W: 65,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 1.85,
    volume_U: 1.0,
    trl: 9,
    mgaContingencyFactor: mga(9),
    isp_s: 2400,
    propulsionType: 'ELECTRIC_HALL',
    sourceCitation: 'NASA/TP-20240001342, Sec. 4.4.4 / Table 4-6',
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
    id: 'eps-lilt-array',
    category: 'EPS',
    name: {
      en: 'Deep Space LILT Triple-Junction Solar Array (420 W @ 1 AU)',
      es: 'Panel Solar Triple Unión LILT Espacio Profundo (420 W @ 1 AU)',
    },
    description: {
      en: 'Low-Intensity Low-Temperature (LILT) solar cells engineered to resist efficiency loss far from the Sun (SSRI SoA Sec. 3.2.1).',
      es: 'Celdas solares LILT de triple unión diseñadas para mantener eficiencia bajo baja luz y temperaturas extremas (SSRI SoA Sec. 3.2.1).',
    },
    tradeOffNote: {
      en: 'Delivers 420 W at 1 AU (TRL 8, 8% MGA) across 1.25 m² while resisting LILT degradation.',
      es: 'Entrega 420 W a 1 AU (TRL 8, 8% MGA) en 1.25 m² resistiendo degradación LILT.',
    },
    analogyTooltip: {
      en: 'Special cold-weather solar wings that stay productive even in chilly dim sunlight far from Earth.',
      es: 'Alas solares especiales para clima helado que siguen rindiendo con luz débil lejos de la Tierra.',
    },
    massCBE_kg: 14.5,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 420,
    cost_MillionsUSD: 4.8,
    volume_U: 8.0,
    trl: 8,
    mgaContingencyFactor: mga(8),
    solarPanelArea_m2: 1.25,
    isRTG: false,
    sourceCitation: 'NASA/TP-20240001342, Sec. 3.2.1 & 3.3.2',
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
  {
    id: 'telecom-cubelct-laser',
    category: 'TELECOM',
    name: {
      en: '1550 nm Free-Space Laser Terminal (Tesat CubeLCT / OSIRIS4CubeSat)',
      es: 'Terminal Óptico Láser 1550 nm (Tesat CubeLCT / OSIRIS4CubeSat)',
    },
    description: {
      en: 'Flight-proven compact 0.4 kg optical laser terminal delivering up to 100 Mbps downlink at only 12 W peak (SSRI SoA Table 9-1).',
      es: 'Terminal láser compacto de 0.4 kg probado en vuelo con descargas de hasta 100 Mbps consumiendo solo 12 W pico (SSRI SoA Table 9-1).',
    },
    tradeOffNote: {
      en: '100,000 kbps throughput in 0.3U / 0.4 kg (TRL 9); requires fine ADCS pointing <= 0.05° and clear sky/cloud backup.',
      es: 'Hasta 100,000 kbps en solo 0.3U y 0.4 kg (TRL 9); exige puntería fina ADCS <= 0.05° y respaldo ante nubes.',
    },
    analogyTooltip: {
      en: 'A pocket-sized laser modem that downloads gigabytes of telescope movies in seconds—just keep it steady and watch out for clouds!',
      es: 'Un módem láser de bolsillo que baja gigabytes de ciencia en segundos: solo cuida que no tiemble ni haya nubes.',
    },
    massCBE_kg: 0.4,
    powerDrawNominal_W: 8,
    powerDrawPeak_W: 12,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 2.2,
    volume_U: 0.3,
    trl: 9,
    mgaContingencyFactor: mga(9),
    freqGHz: 32.0,
    txPower_W: 25,
    antennaGain_dBi: 52,
    maxDataRate_kbps: 100000,
    pointingAccuracy_deg: 0.05,
    sourceCitation: 'NASA/TP-20240001342, Table 9-1',
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
  {
    id: 'therm-redwire-pcm',
    category: 'THERMAL',
    name: {
      en: 'Phase Change Material Thermal Panel (Redwire Q-Store PCM)',
      es: 'Panel Térmico de Cambio de Fase (Redwire Q-Store PCM)',
    },
    description: {
      en: 'Compact thermal capacitor using paraffin-wax phase change to absorb heat spikes and stabilize avionics passively (SSRI SoA Table 7-3).',
      es: 'Capacitor térmico compacto que almacena calor por cambio de fase sin consumir electricidad (SSRI SoA Table 7-3).',
    },
    tradeOffNote: {
      en: 'TRL 7 (18% MGA), zero electrical draw, 0.65 kg / 0.5U thermal buffer for high-burst electronics.',
      es: 'TRL 7 (18% MGA), consumo eléctrico cero y 0.65 kg / 0.5U para amortiguar picos térmicos.',
    },
    analogyTooltip: {
      en: 'A high-tech reusable thermal gel pack inside the satellite that soaks up heat during busy radar passes and releases it when freezing!',
      es: 'Una bolsa de gel térmico espacial: absorbe calor cuando trabajan los instrumentos y lo libera durante la sombra.',
    },
    massCBE_kg: 0.65,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.22,
    volume_U: 0.5,
    trl: 7,
    mgaContingencyFactor: mga(7),
    sourceCitation: 'NASA/TP-20240001342, Table 7-3',
  },
  {
    id: 'therm-silver-fep',
    category: 'THERMAL',
    name: {
      en: 'Second-Surface Silvered FEP Radiator Tape (Sheldahl)',
      es: 'Cinta Radiadora Óptica FEP Plateada (Sheldahl Silvered Teflon)',
    },
    description: {
      en: 'Ultra-thin silvered fluoropolymer optical radiator coating rejecting solar heat while radiating infrared thermal energy (SSRI SoA Sec. 7.3.4).',
      es: 'Recubrimiento radiativo plateado FEP de bajísima absortividad solar y alta emisividad IR (SSRI SoA Sec. 7.3.4).',
    },
    tradeOffNote: {
      en: 'Negligible 0.12 kg mass, 0.01U volume, TRL 9 heritage, and $0.04M cost; passive heat rejection only.',
      es: 'Solo 0.12 kg, 0.01U y $0.04M (TRL 9); rechazo pasivo de calor sin consumo eléctrico.',
    },
    analogyTooltip: {
      en: 'A silvery heat mirror sticker that bounces away scorching sunlight while letting internal heat escape.',
      es: 'Un espejo térmico autoadhesivo que rebota el calor del Sol y expulsa el calor interno al vacío.',
    },
    massCBE_kg: 0.12,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.04,
    volume_U: 0.01,
    trl: 9,
    mgaContingencyFactor: mga(9),
    sourceCitation: 'NASA/TP-20240001342, Sec. 7.3.4',
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
  {
    id: 'adcs-sagitta-star',
    category: 'ADCS',
    name: {
      en: 'Sub-Arcsecond Miniature Star Tracker (Arcsec Sagitta)',
      es: 'Rastreador Estelar Miniatura Sub-Arcosegundo (Arcsec Sagitta)',
    },
    description: {
      en: 'Compact 0.275 kg optical star tracker delivering 0.00167° (6 arcsec) attitude knowledge for laser telecom & astrophysics.',
      es: 'Rastreador estelar compacto de 0.275 kg con precisión de 0.00167° (6 arcosegundos) para enlaces láser y astrofísica.',
    },
    tradeOffNote: {
      en: '12x finer accuracy than legacy 3-axis assemblies at only 275 g and 1.4–2.2 W (TRL 9, 8% MGA).',
      es: 'Precisión 12x superior al ADCS clásico pesando apenas 275 g y consumiendo 1.4–2.2 W (TRL 9).',
    },
    analogyTooltip: {
      en: 'A tiny matchbox telescope that recognizes star constellations like an eagle eye so laser beams never miss Earth!',
      es: 'Una camarita del tamaño de una caja de fósforos que lee las estrellas para que el láser apunte al milímetro.',
    },
    massCBE_kg: 0.275,
    powerDrawNominal_W: 1.4,
    powerDrawPeak_W: 2.2,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.38,
    volume_U: 0.35,
    trl: 9,
    mgaContingencyFactor: mga(9),
    pointingAccuracy_deg: 0.00167,
    sourceCitation: 'NASA/TP-20240001342, Table 5-4',
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
  {
    id: 'lv-vadr-rideshare',
    category: 'LAUNCH_VEHICLE',
    name: {
      en: 'NASA VADR Multi-Payload Rideshare Adapter (SpaceX Falcon 9)',
      es: 'Adaptador Secundario NASA VADR (SpaceX Falcon 9 Rideshare)',
    },
    description: {
      en: 'Venture-Class Acquisition of Dedicated and Rideshare (VADR) port supporting up to 450 kg & 500U for SmallSat science missions (NASA TRACERS heritage).',
      es: 'Puerto secundario NASA VADR (herencia NASA TRACERS) de hasta 450 kg húmedos y 500U a fracción del costo dedicado.',
    },
    tradeOffNote: {
      en: 'Bridges 24U CubeSat rideshare ($0.35M) and Falcon 9 dedicated ($65M) with 450 kg / 500U capacity for only $0.45M.',
      es: 'Cierra la brecha entre rideshare 24U ($0.35M) y Falcon 9 dedicado ($65M) dando 450 kg / 500U por solo $0.45M.',
    },
    analogyTooltip: {
      en: 'Sharing the big cargo bay of a SpaceX Falcon 9 rocket with other NASA satellites to launch medium explorers for pennies on the dollar!',
      es: 'Compartir la enorme bodega de un Falcon 9 con otros satélites NASA para lanzar exploradores medianos pagando una fracción mínima.',
    },
    massCBE_kg: 0,
    powerDrawNominal_W: 0,
    powerDrawPeak_W: 0,
    powerGenerated1AU_W: 0,
    cost_MillionsUSD: 0.45,
    volume_U: 0,
    trl: 9,
    mgaContingencyFactor: mga(9),
    maxPayloadMass_kg: 450,
    fairingVolume_U: 500,
    sourceCitation: 'NASA/TP-20240001342, Sec. 12.3.1 & NASA TRACERS Press Kit',
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
  'obj-geo-goes-weather': {
    objectiveId: 'obj-geo-goes-weather',
    destinationId: 'dest-geo',
    payloadIds: ['pay-magnetometer', 'pay-multispectral'],
    propulsionId: 'prop-biprop',
    epsId: 'eps-megaflex',
    telecomId: 'telecom-xka',
    thermalId: 'therm-active',
    adcsId: 'adcs-3axis',
    launchVehicleId: 'lv-falcon9',
    groundStationId: 'gs-near-earth',
  },
  'obj-sso-tracers': {
    objectiveId: 'obj-sso-tracers',
    destinationId: 'dest-leo',
    payloadIds: ['pay-magnetometer'],
    propulsionId: 'prop-thrustme-npt30',
    epsId: 'eps-lilt-array',
    telecomId: 'telecom-xka',
    thermalId: 'therm-silver-fep',
    adcsId: 'adcs-sagitta-star',
    launchVehicleId: 'lv-vadr-rideshare',
    groundStationId: 'gs-near-earth',
  },
  'obj-l2-jwst-fgs': {
    objectiveId: 'obj-l2-jwst-fgs',
    destinationId: 'dest-l2',
    payloadIds: ['pay-ir-spectrometer', 'pay-multispectral'],
    propulsionId: 'prop-biprop',
    epsId: 'eps-megaflex',
    telecomId: 'telecom-cubelct-laser',
    thermalId: 'therm-cryo',
    adcsId: 'adcs-sagitta-star',
    launchVehicleId: 'lv-falcon9',
    groundStationId: 'gs-dsn-34m',
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
