import type { LocalizedText } from '../types/mission';

export type SubmoduleGuideId =
  | 'CHASSIS'
  | 'EPS'
  | 'CONTRACT'
  | 'ORBIT'
  | 'GROUND_STATION'
  | 'SWAP_C'
  | 'TANKS'
  | 'CONCURRENT_TEAM'
  | 'MCR_GATE'
  | 'LAUNCH_PHYSICS';

export interface SubmoduleGuideData {
  id: SubmoduleGuideId;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  studentView: {
    analogyTitle: LocalizedText;
    analogyText: LocalizedText;
    causeAndEffect: {
      action: LocalizedText;
      consequence: LocalizedText;
    }[];
    goldenRule: LocalizedText;
  };
  engineerView: {
    theoryTitle: LocalizedText;
    formula?: string;
    formulaExplanation?: LocalizedText;
    nasaStandards: string[];
    technicalParameters: {
      parameter: string;
      value: string;
      requirement: LocalizedText;
    }[];
    flightRule: LocalizedText;
  };
}

export const SUBMODULE_GUIDES: Record<SubmoduleGuideId, SubmoduleGuideData> = {
  CHASSIS: {
    id: 'CHASSIS',
    badge: { en: 'CML 01 · STRUCTURE & VOLUME', es: 'CML 01 · ESTRUCTURA & VOLUMEN' },
    title: { en: 'CubeSat Chassis Form Factors', es: 'Chasis y Factor de Forma CubeSat' },
    subtitle: {
      en: 'Physical dimensions, mass allowances, and launcher fairing envelopes',
      es: 'Dimensiones físicas, límites de masa y envolvente de cofia de lanzamiento',
    },
    studentView: {
      analogyTitle: {
        en: 'The Milk Carton Analogy (1U = 10×10×10 cm)',
        es: 'La Analogía del Cartón de Leche (1U = 10×10×10 cm)',
      },
      analogyText: {
        en: 'Imagine standard 1-liter milk cartons: that is exactly what 1U is in space! For BioNutrients-2 we need 3 cartons joined together (3U) so we can fit scientific cameras, nutrient incubators, radio antennas, and batteries without overflowing.',
        es: 'Imagina un cartón de leche estándar de 1 litro: ¡eso es exactamente 1U en el espacio (10×10×10 cm y ~1.33 kg)! Para BioNutrients-2 necesitamos 3 cajas unidas (3U) para que quepan el bio-laboratorio de nutrientes, las computadoras, antenas y baterías sin desbordar el cohete.',
      },
      causeAndEffect: [
        {
          action: { en: 'Pick 1.5U or 2U', es: 'Elegir 1.5U o 2U' },
          consequence: {
            en: 'Lighter mass, but not enough room for science instruments or large batteries.',
            es: 'Pesa menos, pero no cabe la carga útil de nutrientes ni baterías suficientes.',
          },
        },
        {
          action: { en: 'Pick 3U Standard', es: 'Elegir 3U Estándar' },
          consequence: {
            en: 'Optimal balance: fits BioNutrients lab with full 20% safety margin in fairing.',
            es: 'Balance óptimo: cabe el bio-laboratorio con más del 20% de margen de seguridad.',
          },
        },
        {
          action: { en: 'Pick CUSTOM Deep Space', es: 'Elegir CUSTOM Espacio Profundo' },
          consequence: {
            en: 'Excessive volume and high structural mass. Wastes budget for a simple LEO orbit.',
            es: 'Volumen excesivo y masa pesada. Desperdicia presupuesto en una misión LEO básica.',
          },
        },
      ],
      goldenRule: {
        en: 'Always choose the smallest chassis that cleanly fits all your required science instruments with ≥20% volume margin.',
        es: 'Elige siempre el chasis más compacto que aloje todos los instrumentos con al menos 20% de volumen libre de seguridad.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Structural Mechanics & Cal Poly CubeSat Design Specification (CSDS)',
        es: 'Mecánica Estructural & Especificación CubeSat Cal Poly (CSDS)',
      },
      formula: 'V_{envelope} = N \\times (100 \\times 100 \\times 113.5)\\text{ mm}^3, \\quad m_{allow} \\le N \\times 1.333\\text{ kg}',
      formulaExplanation: {
        en: 'P-POD deployer rails impose strict dynamic envelope and fundamental frequency thresholds (>35 Hz lateral, >50 Hz axial) to prevent acoustic resonance during rocket transonic ascent.',
        es: 'Los rieles del dispensador P-POD exigen tolerancias milimétricas y frecuencia natural fundamental (>35 Hz lateral, >50 Hz axial) para evitar resonancia destructiva con las ondas acústicas del cohete.',
      },
      nasaStandards: [
        'AIAA S-120A-2015: Mass Properties Control for Space Systems',
        'NASA-STD-5001B: Structural Design and Test Factors of Safety (1.40× Yield / 1.25× Ultimate)',
        'Cal Poly SLO CSDS Rev 14: CubeSat Form Factor & Rail Tolerances',
      ],
      technicalParameters: [
        { parameter: '1U Dimension Envelope', value: '100 × 100 × 113.5 mm', requirement: { en: 'P-POD Rail Compliant', es: 'Compatible Rieles P-POD' } },
        { parameter: '3U Max Mass Allocation', value: '4.000 kg CBE', requirement: { en: '≤ 1.333 kg per unit', es: '≤ 1.333 kg por unidad' } },
        { parameter: 'Fundamental Natural Freq.', value: '> 45.0 Hz', requirement: { en: 'No acoustic coupling', es: 'Cero acoplamiento acústico' } },
      ],
      flightRule: {
        en: 'Any CubeSat exceeding 100 mm cross-section or 1.33 kg/U requires secondary waiver authorization from launch vehicle integration lead.',
        es: 'Cualquier CubeSat que supere la sección de 100 mm o 1.33 kg/U requiere dispensa formal de la dirección de integración del lanzador.',
      },
    },
  },

  EPS: {
    id: 'EPS',
    badge: { en: 'CML 01 · ELECTRICAL POWER SYSTEM', es: 'CML 01 · ENERGÍA & ALIMENTACIÓN' },
    title: { en: 'Solar Photovoltaic Generation & Energy Storage', es: 'Generación Solar Fotovoltaica y Baterías EPS' },
    subtitle: {
      en: 'Solar arrays, solar flux, eclipse power draws, and battery depth of discharge',
      es: 'Paneles solares, flujo solar, consumo en eclipse y profundidad de descarga',
    },
    studentView: {
      analogyTitle: {
        en: 'Surviving the 35-Minute Night (-120°C in the Dark)',
        es: 'Sobreviviendo a la Noche Orbital de 35 Minutos (-120°C a Oscuras)',
      },
      analogyText: {
        en: 'In Low Earth Orbit, our satellite travels at 28,000 km/h and orbits Earth every 92 minutes. But for 35 of those minutes, Earth completely blocks the Sun! Deployable solar wings work like giant umbrellas that soak up sunlight during the bright pass to fully charge our batteries before the cold night.',
        es: 'En órbita baja, el satélite viaja a 28,000 km/h y da la vuelta a la Tierra en 92 minutos. ¡Pero durante 35 de esos minutos, la Tierra tapa al Sol por completo! Las alas solares desplegables funcionan como paneles gigantes que captan el doble de sol en el día para llenar las baterías antes de la noche helada.',
      },
      causeAndEffect: [
        {
          action: { en: 'Body-Mounted Panels (12W)', es: 'Paneles Pegados al Cuerpo (12W)' },
          consequence: {
            en: 'Too little power! The batteries drain to 0% during the eclipse and the bio-lab dies frozen.',
            es: '¡Muy poca energía! Las baterías se agotan durante la noche y el bio-laboratorio se congela.',
          },
        },
        {
          action: { en: 'Deployable Solar Array (42W)', es: 'Alas Solares Desplegables (42W)' },
          consequence: {
            en: 'Perfect! Recharges batteries with >30% energy cushion before the next eclipse.',
            es: '¡Perfecto! Recarga las baterías con más de 30% de reserva antes del siguiente eclipse.',
          },
        },
        {
          action: { en: 'Mega-Flex / RTG Nuclear', es: 'Mega-Flex / Generador Nuclear RTG' },
          consequence: {
            en: 'Ideal for deep space missions (Jupiter/Saturn) where sunlight drops by 97%, but overkill in LEO.',
            es: 'Indispensable en Júpiter donde la luz cae al 3.7%, pero innecesariamente costoso en LEO.',
          },
        },
      ],
      goldenRule: {
        en: 'Solar generation during daylight must exceed at least 1.6× the orbital average power load to guarantee 100% battery recharge before entering Earth shadow.',
        es: 'La generación diurna debe superar al menos 1.6 veces el consumo promedio para asegurar la recarga total antes de entrar en la sombra.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Photovoltaic Power Balance & Orbital Eclipse Energy Budget',
        es: 'Balance Fotovoltaico de Potencia & Presupuesto Energético en Eclipse',
      },
      formula: 'P_{gen} = S_0 \\times \\cos(\\theta) \\times A_{pv} \\times \\eta_{cell} \\times X_d, \\quad E_{ecl} = \\int_0^{T_{ecl}} P_{load}(t) dt \\le C_{bat} \\times DoD_{max}',
      formulaExplanation: {
        en: 'Solar irradiance S₀ = 1361 W/m² at 1 AU. Triple-junction InGaP/InGaAs/Ge cells provide ~29.5% efficiency degraded by radiation fluence and thermal coefficient (-0.45%/°C above 28°C).',
        es: 'Constante solar S₀ = 1361 W/m² en 1 UA. Celdas de triple unión con ~29.5% de rendimiento degradadas por fluencia de radiación y coeficiente térmico (-0.45%/°C).',
      },
      nasaStandards: [
        'NASA-HDBK-4001: Electrical Power System Design Standard',
        'GSFC-STD-1000 Rule 1.07: Battery Depth of Discharge ≤ 30% for LEO multi-year missions',
        'AIAA S-122-2020: Electrical Power Systems for Spacecraft',
      ],
      technicalParameters: [
        { parameter: 'Solar Flux (1 AU LEO)', value: '1,361 W/m²', requirement: { en: 'Nominal solar constant', es: 'Constante solar nominal' } },
        { parameter: 'Max Battery DoD (LEO)', value: '≤ 30.0%', requirement: { en: '> 10,000 cycle life', es: '> 10,000 ciclos de vida' } },
        { parameter: 'Day/Night Ratio (400 km)', value: '57 min / 35 min', requirement: { en: 'Eclipse fraction ≈ 38%', es: 'Fracción de eclipse ≈ 38%' } },
      ],
      flightRule: {
        en: 'DoD must never exceed 35% in nominal LEO operations; exceeding 50% triggers emergency survival load-shedding mode.',
        es: 'La profundidad de descarga nunca debe exceder el 35% en LEO; superar el 50% activa el modo de emergencia de desconexión de cargas no esenciales.',
      },
    },
  },

  CONTRACT: {
    id: 'CONTRACT',
    badge: { en: 'CML 01 · MISSION STATEMENT', es: 'CML 01 · REQUISITOS DE MISIÓN' },
    title: { en: 'NASA Contracts, Objectives & Flight Rules', es: 'Contratos NASA, Objetivos y Reglas de Vuelo' },
    subtitle: {
      en: 'Stakeholder requirements, budget caps, required payloads, and target environments',
      es: 'Requisitos del cliente, topes de presupuesto, cargas útiles obligatorias y entorno de vuelo',
    },
    studentView: {
      analogyTitle: {
        en: 'The Flight Contract is Your Mission Rulebook',
        es: 'El Contrato de Vuelo es tu Manual de Reglas',
      },
      analogyText: {
        en: 'Before building anything, NASA agrees on a clear mission contract. For BioNutrients-2, our job is to deliver fresh yeast vitamins to future Moon/Mars astronauts. The contract sets strict limits: maximum \$20M budget, must carry the bio-incubator, and must operate at 400 km in the space station orbit.',
        es: 'Antes de construir una sola pieza, la NASA y los científicos firman un contrato. Para BioNutrients-2, la meta es cultivar vitaminas con levaduras para astronautas de Artemis. El contrato impone reglas estrictas: tope de \$20M de presupuesto, llevar obligatoriamente la bio-incubadora y volar a 400 km.',
      },
      causeAndEffect: [
        {
          action: { en: 'Under Budget', es: 'Por Debajo del Presupuesto' },
          consequence: {
            en: 'Earns 3-Star NASA commendation and unlocks bonus agency funding.',
            es: 'Ganas la máxima calificación de 3 Estrellas y felicitación oficial de la NASA.',
          },
        },
        {
          action: { en: 'Forget Required Payload', es: 'Olvidar la Carga Útil Obligatoria' },
          consequence: {
            en: 'Immediate Mission Concept Review failure: the satellite is useless without science.',
            es: 'Reprobación inmediata en la Revisión MCR: el satélite no sirve si no lleva la ciencia.',
          },
        },
      ],
      goldenRule: {
        en: 'Always verify that every required instrument is equipped before signing the launch authorization.',
        es: 'Comprueba siempre que todos los instrumentos obligatorios del contrato estén montados antes de autorizar el despegue.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Systems Engineering & Requirements Traceability (NASA SP-2016-6105)',
        es: 'Ingeniería de Sistemas & Trazabilidad de Requisitos (NASA SP-2016-6105)',
      },
      formula: 'Cost_{total} = Cost_{bus} + Cost_{payload} + Cost_{launch} + Cost_{groundOps} \\le Cost_{cap}',
      formulaExplanation: {
        en: 'Requirements baseline maps Level 0 stakeholder objectives into Level 1 system requirements, ensuring zero unallocated mass, power, or monetary reserves.',
        es: 'La línea base de ingeniería mapea los objetivos Nivel 0 de la misión hacia especificaciones Nivel 1 verificables, garantizando cero reservas no asignadas.',
      },
      nasaStandards: [
        'NASA Systems Engineering Handbook SP-2016-6105 Rev 2',
        'NPR 7120.5F: NASA Space Flight Program and Project Management Requirements',
        'AIAA S-120A: Preliminary Design Margin Standards',
      ],
      technicalParameters: [
        { parameter: 'Budget Cap', value: '$20.0M LEO', requirement: { en: 'Strict NASA cost envelope', es: 'Tope presupuestal estricto' } },
        { parameter: 'Mandatory Payload', value: 'BioNutrients-2 Lab', requirement: { en: 'Biological incubation core', es: 'Núcleo de cultivo biológico' } },
        { parameter: 'Mission Lifetime', value: '1.0 Year LEO', requirement: { en: '5,500+ thermal orbits', es: '5,500+ órbitas térmicas' } },
      ],
      flightRule: {
        en: 'Any requirement violation grounds the flight vehicle at Gate CML 05 Mission Concept Review.',
        es: 'Cualquier violación de requisitos bloquea el vehículo en la puerta CML 05 de Revisión de Concepto de Misión.',
      },
    },
  },

  ORBIT: {
    id: 'ORBIT',
    badge: { en: 'CML 02 · ORBITAL MECHANICS', es: 'CML 02 · MECÁNICA ORBITAL' },
    title: { en: 'Keplerian Orbits, Altitude & Earth Shadow Umbra', es: 'Órbitas Keplerianas, Altitud y Cono de Sombra (Umbra)' },
    subtitle: {
      en: 'Orbital velocity, period, atmospheric drag decay, and astronomical eclipse geometry',
      es: 'Velocidad orbital, período, frenado atmosférico y geometría astronómica de eclipses',
    },
    studentView: {
      analogyTitle: {
        en: 'Falling Around the Earth Without Ever Touching the Ground',
        es: 'Caer Alrededor de la Tierra Sin Tocar Jamás el Suelo',
      },
      analogyText: {
        en: 'An orbit is not escaping gravity—it is falling so fast sideways (28,000 km/h) that the curve of the Earth drops away beneath you at the same rate you fall! At 400 km you orbit in 92 minutes. Higher orbits take longer, feel less air friction, but need more rocket fuel to reach.',
        es: 'Una órbita no significa flotar sin gravedad: ¡significa caer hacia el suelo tan rápido de lado (28,000 km/h) que la curva de la Tierra se aleja al mismo ritmo que caes! A 400 km das una vuelta cada 92 minutos. A mayor altitud el aire no te frena, pero el cohete necesita más combustible.',
      },
      causeAndEffect: [
        {
          action: { en: 'Lower Altitude (250 km)', es: 'Bajar Altitud (250 km)' },
          consequence: {
            en: 'Atmospheric drag pulls the satellite down into the atmosphere in just a few months.',
            es: 'El aire residual frena la nave y la hace reentrar y quemarse en pocos meses.',
          },
        },
        {
          action: { en: 'Target Altitude (400 km)', es: 'Altitud de Diseño (400 km)' },
          consequence: {
            en: 'Low radiation, stable 92-minute orbit, identical to the International Space Station.',
            es: 'Baja radiación, órbita estable de 92 minutos, idéntica a la Estación Espacial Internacional.',
          },
        },
        {
          action: { en: 'Higher Altitude (800 km)', es: 'Subir Altitud (800 km)' },
          consequence: {
            en: 'Longer lifetime, but enters the hazardous Van Allen radiation belts and weakens radio signals.',
            es: 'Mayor duración, pero entra en los cinturones de radiación Van Allen y debilita la radio.',
          },
        },
      ],
      goldenRule: {
        en: 'In the Umbra shadow, solar generation drops to 0W and temperatures plummet to -120°C. Batteries must carry the entire mission load.',
        es: 'En el cono de Umbra, la luz solar es 0W y la temperatura cae a -120°C. La batería debe sostener la nave.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Vis-Viva Equation, Kepler’s Third Law & Cylindrical Shadow Model',
        es: 'Ecuación Vis-Viva, Tercera Ley de Kepler & Modelo de Sombra Cilíndrica',
      },
      formula: 'v = \\sqrt{\\mu \\left( \\frac{2}{r} - \\frac{1}{a} \\right)}, \\quad T = 2\\pi \\sqrt{\\frac{a^3}{\\mu}}, \\quad \\theta_{ecl} = 2 \\arcsin\\left( \\frac{R_E}{r} \\right)',
      formulaExplanation: {
        en: 'For Earth geocentric orbits, μ = 398,600.4418 km³/s² and R_E = 6378.137 km. At h = 400 km, semi-major axis a = 6778.137 km, circular velocity v = 7.67 km/s, period T = 92.56 min, and eclipse fraction = 37.8%.',
        es: 'Para LEO, μ = 398,600.44 km³/s² y radio terrestre R_E = 6378.14 km. A 400 km, velocidad circular v = 7.67 km/s, período T = 92.56 min y fracción de eclipse en umbra = 37.8%.',
      },
      nasaStandards: [
        'NASA SP-8005: Solar Electromagnetic Radiation Environment',
        'NASA-HDBK-1002: Celestial Mechanics and Orbit Determination Standards',
        'JPL Planetary Ephemerides DE440/441 Standards',
      ],
      technicalParameters: [
        { parameter: 'Orbital Period (400 km)', value: '92.56 min (5,554 s)', requirement: { en: '15.5 orbits per day', es: '15.5 órbitas por día' } },
        { parameter: 'Orbital Velocity', value: '7,668.6 m/s', requirement: { en: 'Circular LEO velocity', es: 'Velocidad circular en LEO' } },
        { parameter: 'Max Eclipse Duration', value: '35.8 min', requirement: { en: 'Maximum Umbra duration', es: 'Duración máxima en Umbra' } },
      ],
      flightRule: {
        en: 'Orbit insertion altitude must remain within ±15 km of nominal target; deviations exceeding 35 km require emergency delta-V trim burn.',
        es: 'La altitud de inserción debe mantenerse en ±15 km del objetivo; desviaciones mayores a 35 km exigen encendido de corrección de emergencia.',
      },
    },
  },

  GROUND_STATION: {
    id: 'GROUND_STATION',
    badge: { en: 'CML 02 · RF TELECOMMUNICATIONS', es: 'CML 02 · TELECOMUNICACIONES RF' },
    title: { en: 'Radio Link Budget, Friis Equation & DSN Networks', es: 'Balance de Enlace RF, Ecuación de Friis y Red DSN' },
    subtitle: {
      en: 'Antenna gain, path loss, atmospheric attenuation, and Deep Space Network ground antennas',
      es: 'Ganancia de antena, pérdidas de trayectoria, atenuación atmosférica y antenas DSN',
    },
    studentView: {
      analogyTitle: {
        en: 'Connecting to the World’s Longest Wi-Fi Router',
        es: 'Conectándote al Router Wi-Fi Más Largo del Mundo',
      },
      analogyText: {
        en: 'Talking to a satellite is like using Wi-Fi across hundreds or thousands of kilometers! If your antenna is too small or you are too far away, the signal drops out. For low Earth orbit (400 km), standard NASA Near-Earth stations work great. For the Moon or Jupiter, we need the giant 70-meter dish antennas of the Deep Space Network!',
        es: 'Hablar con un satélite es como conectarse a un router Wi-Fi a cientos o miles de kilómetros de distancia. Si tu antena es pequeña o estás muy lejos, la señal se corta. En órbita baja (400 km), las estaciones terrestres de NASA bastan. ¡Para la Luna o Júpiter, necesitamos las gigantescas antenas parabólicas de 70 metros de la red DSN!',
      },
      causeAndEffect: [
        {
          action: { en: 'Near-Earth Network (LEO)', es: 'Red Near-Earth (LEO)' },
          consequence: {
            en: 'Low cost (\$0.2M/mo), fast downloads when passing overhead, perfect for BioNutrients-2.',
            es: 'Bajo costo (\$0.2M/mes), descargas rápidas al pasar por encima, ideal para LEO.',
          },
        },
        {
          action: { en: 'Deep Space Network (DSN 34m/70m)', es: 'Red de Espacio Profundo (DSN 34m/70m)' },
          consequence: {
            en: 'Massive parabolic gain to track probes across millions of km, but higher operational cost.',
            es: 'Enorme ganancia parabólica para seguir sondas a millones de km, pero costo operativo mayor.',
          },
        },
      ],
      goldenRule: {
        en: 'Always keep an RF link margin of at least +3 dB so rain, clouds, and antenna pointing errors never cut your communications.',
        es: 'Mantén siempre un margen de radio de al menos +3 dB para que la lluvia o nubes no corten tus datos.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Friis Transmission Equation & Telecom Link Margin Analysis',
        es: 'Ecuación de Transmisión de Friis & Análisis de Margen de Enlace',
      },
      formula: 'P_r = P_t + G_t + G_r - 20\\log_{10}\\left(\\frac{4\\pi d}{\\lambda}\\right) - L_{atm} - L_{point}, \\quad Margin = \\frac{E_b}{N_0}_{rx} - \\frac{E_b}{N_0}_{req} \\ge 3\\text{ dB}',
      formulaExplanation: {
        en: 'Free Space Path Loss (FSPL) scales with distance squared (20 log10 d). At S-band (2.2 GHz, λ = 13.6 cm) and d = 400 km, FSPL ≈ 151.3 dB. Adding transmitter power, antenna gains, and ground G/T yields the net Eb/N0.',
        es: 'La pérdida de espacio libre (FSPL) escala con la distancia al cuadrado. En banda S (2.2 GHz) a 400 km, FSPL ≈ 151.3 dB. Sumando potencia y ganancias de antena se obtiene el Eb/N0 recibido.',
      },
      nasaStandards: [
        'CCSDS 401.0-B: Radio Frequency and Modulation Systems',
        'NASA 810-005: Deep Space Network Telecommunications Link Design Handbook',
        'NASA Near Space Network (NSN) Users’ Guide Rev 4',
      ],
      technicalParameters: [
        { parameter: 'Minimum Link Margin', value: '≥ +3.0 dB', requirement: { en: 'AIAA S-120A safety threshold', es: 'Umbral de seguridad AIAA S-120A' } },
        { parameter: 'Downlink Bit Error Rate', value: '≤ 1 × 10⁻⁶', requirement: { en: 'Science telemetry standard', es: 'Estándar telemetría científica' } },
        { parameter: 'DSN 70m Figure of Merit', value: 'G/T ≥ 52.8 dB/K', requirement: { en: 'X-band deep-space reception', es: 'Recepción espacio profundo banda X' } },
      ],
      flightRule: {
        en: 'Communications blackout during occultation (LOS blockage) requires onboard automated data buffering with zero data packet drops.',
        es: 'Durante la pérdida de línea de vista por ocultación planetaria, la memoria buffer de a bordo debe almacenar los datos sin pérdida de paquetes.',
      },
    },
  },

  SWAP_C: {
    id: 'SWAP_C',
    badge: { en: 'CML 03 · TRADE SPACE ARCHITECTURE', es: 'CML 03 · ESPACIO DE COMERCIO' },
    title: { en: 'The SWaP-C Law & The 7 NASA Disciplines', es: 'La Ley SWaP-C y las 7 Disciplinas Aeroespaciales' },
    subtitle: {
      en: 'Size, Weight, Power, Cost, and cross-subsystem synergistic trade-offs',
      es: 'Tamaño, peso, potencia, costo y balance sinérgico entre subsistemas',
    },
    studentView: {
      analogyTitle: {
        en: 'In Rocket Science, There Is No Free Lunch!',
        es: '¡En la Ciencia Espacial Nada Es Gratis!',
      },
      analogyText: {
        en: 'Everything in space is connected. If you equip a super-powerful camera, it consumes more electricity (watts), which demands bigger solar wings, which adds heavy mass (kg), which requires a bigger rocket launcher and costs more money (\$M). Aerospace engineering is the art of finding the sweet spot where all 7 systems stay green!',
        es: 'En el espacio todo está conectado. Si equipas una cámara científica potente, consume más vatios de electricidad, lo que exige alas solares más grandes, lo que añade peso (kg), lo que obliga a contratar un cohete más grande y más caro (\$M). La ingeniería aeroespacial consiste en balancear estos 7 sistemas.',
      },
      causeAndEffect: [
        {
          action: { en: 'Upgrade Telecom to X/Ka Band', es: 'Mejorar Telecom a Banda X/Ka' },
          consequence: {
            en: '10× faster data download, but draws +15W more power and adds +0.8 kg to the payload.',
            es: 'Descarga 10 veces más datos, pero consume +15W de energía y añade +0.8 kg de peso.',
          },
        },
        {
          action: { en: 'Equip High-Power Thruster', es: 'Equipar Motor de Alta Potencia' },
          consequence: {
            en: 'Provides rapid orbital maneuvers, but eats up dry mass and demands larger battery storage.',
            es: 'Permite maniobras rápidas, pero consume masa seca y exige baterías más pesadas.',
          },
        },
      ],
      goldenRule: {
        en: 'Every time you upgrade one subsystem, check the top resource bars to confirm that Mass and Power margins remain positive.',
        es: 'Cada vez que cambies una pieza, mira las barras de arriba para verificar que la masa y la energía sigan en verde.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Multidisciplinary Design Optimization (MDO) & SWaP-C Pareto Frontiers',
        es: 'Optimización de Diseño Multidisciplinario (MDO) & Fronteras de Pareto SWaP-C',
      },
      formula: '\\min_{x \\in \\mathcal{X}} \\left[ m_{wet}(x), \\; P_{draw}(x), \\; V_{used}(x), \\; C_{total}(x) \\right] \\quad \\text{s.t.} \\quad Margin_i(x) \\ge \\alpha_i',
      formulaExplanation: {
        en: 'The 7 canonical disciplines (Payload, Propulsion, EPS, Telecom, Thermal, ADCS, Launcher) form a coupled non-linear system. Component selections shift the spacecraft operating state across the Pareto frontier.',
        es: 'Las 7 disciplinas canónicas forman un sistema no lineal acoplado. Las selecciones de componentes desplazan el punto de operación a lo largo de la frontera de Pareto.',
      },
      nasaStandards: [
        'NASA SP-2016-6105 Section 6.8: System Trade Studies',
        'INCOSE Systems Engineering Handbook v4: Architecture Trade Spaces',
        'GSFC-STD-1000 Rule 1.01: Margin Requirements at PDR / CDR',
      ],
      technicalParameters: [
        { parameter: 'PDR Mass Contingency', value: '≥ 20.0% CBE', requirement: { en: 'AIAA S-120A standard', es: 'Norma AIAA S-120A' } },
        { parameter: 'PDR Power Contingency', value: '≥ 20.0% CBE', requirement: { en: 'NASA SP-2016-6105 standard', es: 'Norma NASA SP-2016-6105' } },
        { parameter: 'Cross-Subsystem Conflicts', value: '0 Critical', requirement: { en: 'Zero unresolved bus interfaces', es: 'Cero interfaces sin resolver' } },
      ],
      flightRule: {
        en: 'Any negative resource margin at CML 03 forbids progression to CML 04 Point Design.',
        es: 'Cualquier margen de recurso negativo en CML 03 prohíbe el paso a CML 04 de Punto de Diseño.',
      },
    },
  },

  TANKS: {
    id: 'TANKS',
    badge: { en: 'CML 04 · POINT DESIGN & FLUIDS', es: 'CML 04 · TANQUES & FLUIDOS' },
    title: { en: 'COPV Propellant Tanks, Tsiolkovsky Delta-V & Batteries', es: 'Tanques COPV, Delta-V de Tsiolkovsky y Baterías' },
    subtitle: {
      en: 'Composite Overwrapped Pressure Vessels, cold gas propellant, and eclipse battery reserves',
      es: 'Recipientes de presión COPV, propelente de gas frío y reservas de batería para eclipses',
    },
    studentView: {
      analogyTitle: {
        en: 'The Rocket Gives You a Ride, But You Must Steer Yourself',
        es: 'El Cohete Te Da un Paseo, Pero Tú Debes Conducir',
      },
      analogyText: {
        en: 'The big rocket at Cape Canaveral puts your satellite into space, but once released, the rocket is gone! Your satellite needs its own small gas tanks (COPV) to steer, point its cameras at Earth, and adjust its orbit so it does not fall down. And it needs charged batteries to survive the frozen night.',
        es: 'El cohete gigante en Cabo Cañaveral sube tu satélite al espacio, pero una vez que te suelta, ¡el cohete se va! Tu satélite necesita sus propios tanques de gas comprimido (COPV) para girar, apuntar sus antenas a la Tierra y corregir su órbita. Y necesita baterías llenas para no congelarse.',
      },
      causeAndEffect: [
        {
          action: { en: 'Tanks at 100% Full', es: 'Tanques al 100% de Carga' },
          consequence: {
            en: 'Maximum maneuver capability and speed adjustment (ΔV), but adds extra wet weight.',
            es: 'Máxima capacidad de maniobra y corrección (ΔV), pero agrega peso húmedo adicional.',
          },
        },
        {
          action: { en: 'Batteries at Low Charge', es: 'Baterías con Poca Carga' },
          consequence: {
            en: 'Severe risk! In the 35-minute night eclipse, the satellite powers off and freezes at -120°C.',
            es: '¡Riesgo crítico! En la noche orbital de 35 min el satélite se apaga y congela a -120°C.',
          },
        },
      ],
      goldenRule: {
        en: 'Click "Fill Tanks" to top off propellant and batteries before heading to the launch authorization gate.',
        es: 'Pulsa "Llenar Tanques" para asegurar combustible y baterías antes de autorizar el despegue.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Tsiolkovsky Rocket Equation & COPV Fracture Mechanics',
        es: 'Ecuación del Cohete de Tsiolkovsky & Mecánica de Fractura COPV',
      },
      formula: '\\Delta V = I_{sp} \\times g_0 \\times \\ln\\left( \\frac{m_{dry} + m_{prop}}{m_{dry}} \\right), \\quad p_{burst} \\ge 1.5 \\times MEOP',
      formulaExplanation: {
        en: 'Standard gravity g₀ = 9.80665 m/s². Cold gas nitrogen propellant delivers specific impulse Isp ≈ 68 s. COPV tanks carbon fiber overwrap must satisfy 1.5× Maximum Expected Operating Pressure (MEOP) burst ratio.',
        es: 'Gravedad estándar g₀ = 9.80665 m/s². Gas nitrógeno frío con Isp ≈ 68 s. Los tanques COPV de fibra de carbono deben resistir 1.5× la presión máxima esperada de operación (MEOP).',
      },
      nasaStandards: [
        'AIAA S-081B-2018: Space Systems - Composite Overwrapped Pressure Vessels (COPVs)',
        'NASA-STD-5009: Nondestructive Evaluation Requirements for Fracture-Critical Metallic Components',
        'GSFC-STD-1000 Rule 1.12: Propellant Mass Margin ≥ 10% post-mission disposal',
      ],
      technicalParameters: [
        { parameter: 'Cold Gas Isp', value: '68.0 s (GN2)', requirement: { en: 'Nitrogen gas propellant', es: 'Propelente nitrógeno gaseoso' } },
        { parameter: 'COPV Safety Factor', value: '1.50× MEOP', requirement: { en: 'Burst pressure safety ratio', es: 'Factor de seguridad a reventamiento' } },
        { parameter: 'Orbit Trim Delta-V', value: '≥ 45.0 m/s', requirement: { en: 'LEO stationkeeping reserve', es: 'Reserva de mantenimiento LEO' } },
      ],
      flightRule: {
        en: 'Total wet mass including loaded tanks must strictly remain below the launcher fairing limit.',
        es: 'La masa húmeda total incluyendo tanques cargados debe permanecer estrictamente por debajo del límite del cohete.',
      },
    },
  },

  CONCURRENT_TEAM: {
    id: 'CONCURRENT_TEAM',
    badge: { en: 'CML 04 · CONCURRENT ENGINEERING', es: 'CML 04 · INGENIERÍA CONCURRENTE' },
    title: { en: 'JPL Team X Concurrent Engineering Chairs', es: 'Sillas Concurrentes de Ingeniería JPL Team X' },
    subtitle: {
      en: 'Real-time collaborative subsystem validation, conflict detection, and database commits',
      es: 'Validación colaborativa en tiempo real, detección de conflictos y sincronización de base de datos',
    },
    studentView: {
      analogyTitle: {
        en: 'Building a Rocket with a Team of Specialists',
        es: 'Construir un Cohete con un Equipo de Especialistas',
      },
      analogyText: {
        en: 'No single person designs a NASA spacecraft alone! At JPL Team X, engineers sit in 4 specialized chairs: Mission Lead (the team boss), Payload Chair (the science instruments expert), Space Bus Chair (the power and structure specialist), and Launch & Ground Chair (the rocket and radio expert). When all 4 agree, the mission is safe!',
        es: '¡Nadie diseña un satélite de la NASA en solitario! En el JPL Team X, los ingenieros se sientan en 4 sillas: Líder de Misión (el director), Carga Útil (experto en los instrumentos de ciencia), Bus Espacial (experto en energía y baterías), y Lanzamiento & Estaciones (experto en cohetes y antenas). Cuando los 4 firman, la misión es viable.',
      },
      causeAndEffect: [
        {
          action: { en: 'Synchronize Database', es: 'Sincronizar Base de Datos' },
          consequence: {
            en: 'Runs automated cross-subsystem checks to ensure wiring, mass, and voltages match.',
            es: 'Ejecuta chequeos automáticos para asegurar que los voltajes y pesos coincidan.',
          },
        },
        {
          action: { en: 'Conflicting Subsystems', es: 'Conflicto entre Subsistemas' },
          consequence: {
            en: 'Displays yellow warning cards explaining exactly which two pieces clash.',
            es: 'Muestra tarjetas de advertencia explicando qué dos piezas son incompatibles.',
          },
        },
      ],
      goldenRule: {
        en: 'Review all 4 chairs and click "Commit & Validate" to confirm zero cross-subsystem conflicts.',
        es: 'Revisa las 4 sillas y pulsa "Sincronizar BD" para confirmar cero conflictos técnicos.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'NASA Integrated Concurrent Design Facility (ICDF) Methodology',
        es: 'Metodología ICDF de Diseño Concurrente Integrado de la NASA',
      },
      formula: '\\text{Status} = \\bigwedge_{k=1}^4 \\left[ \\text{RoleSignOff}_k \\land \\left( \\mathcal{C}_{conflicts}(k) = \\emptyset \\right) \\right]',
      formulaExplanation: {
        en: 'JPL Team X concurrent sessions model complex multidisciplinary dependencies through linked parameters, achieving in 3 days what traditional sequential engineering required 6 months to resolve.',
        es: 'Las sesiones concurrentes del JPL Team X modelan dependencias acopladas mediante parámetros enlazados, resolviendo en 3 días lo que tradicionalmente tardaba 6 meses.',
      },
      nasaStandards: [
        'NASA SP-2016-6105 Appendix F: Systems Engineering in Concurrent Engineering Environments',
        'JPL D-32210: Team X Engineering Design Session Handbook',
        'ISO/IEC/IEEE 15288: Systems and Software Engineering - System Life Cycle Processes',
      ],
      technicalParameters: [
        { parameter: 'Active Technical Chairs', value: '4 Functional Roles', requirement: { en: 'Lead, Payload, Bus, Ops', es: 'Líder, Carga Útil, Bus, Operaciones' } },
        { parameter: 'Database Revision', value: 'Live Concurrent Sync', requirement: { en: 'ACID parameter commits', es: 'Sincronización ACID de parámetros' } },
        { parameter: 'Interface Discrepancies', value: '0 Unresolved', requirement: { en: 'Clear ICD sign-off', es: 'Firma formal de interfaces' } },
      ],
      flightRule: {
        en: 'All 4 chair disciplines must validate their respective interface control documents (ICD) before MCR sign-off.',
        es: 'Las 4 sillas técnicas deben validar sus documentos de control de interfaz (ICD) antes de firmar el MCR.',
      },
    },
  },

  MCR_GATE: {
    id: 'MCR_GATE',
    badge: { en: 'CML 05 · PRE-FLIGHT VERIFICATION', es: 'CML 05 · VERIFICACIÓN Y VALIDACIÓN' },
    title: { en: 'Mission Concept Review (MCR Gate) & V&V Testing', es: 'Revisión de Concepto de Misión (MCR) y Pruebas V&V' },
    subtitle: {
      en: 'Pre-flight audit, GSFC-STD-1000 Gold Rules, single point failure elimination, and launch sign-off',
      es: 'Auditoría previa, Reglas de Oro GSFC-STD-1000, eliminación de puntos únicos de fallo y firma de despegue',
    },
    studentView: {
      analogyTitle: {
        en: 'There Are No Mechanics in Space!',
        es: '¡En el Espacio No Hay Mecánicos!',
      },
      analogyText: {
        en: 'Once the rocket launches, you cannot pull over to the side of the road with a screwdriver! That is why NASA performs the strict Mission Concept Review (MCR). We test thermal baking, shake tables, and laser scans to be 100% sure nothing breaks. When all cards turn cyan, Commander Vega signs the launch order!',
        es: 'Una vez que el cohete despega, ¡no puedes orillarte a un lado de la carretera con un destornillador! Por eso la NASA hace la Revisión MCR: metemos el satélite en hornos térmicos, mesas de vibración y escaneos láser para comprobar que nada se rompa. Cuando todo está en cian, el Comandante Vega firma la orden de despegue.',
      },
      causeAndEffect: [
        {
          action: { en: 'Yellow or Red Card', es: 'Tarjeta Amarilla o Roja' },
          consequence: {
            en: 'Discrepancy detected! Click "Auto-Resolve" to automatically fix mass or power margins.',
            es: '¡Discrepancia detectada! Pulsa "Auto-Resolver" para calibrar masa o energía.',
          },
        },
        {
          action: { en: 'Hold "Sign MCR"', es: 'Mantener "Firmar MCR"' },
          consequence: {
            en: 'Locks in your engineering blueprint and unlocks the Cape Canaveral rocket launch pad!',
            es: 'Sella tu plano de ingeniería y abre la torre de despegue en Cabo Cañaveral.',
          },
        },
      ],
      goldenRule: {
        en: 'Hold down the fingerprint button until the progress circle reaches 100% to confirm launch authorization.',
        es: 'Mantén presionado el botón de huella hasta el 100% para autorizar el lanzamiento.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Verification & Validation (V&V) Matrix & Goddard Gold Rules',
        es: 'Matriz de Verificación & Validación (V&V) y Reglas de Oro Goddard',
      },
      formula: '\\text{MCR\\_Verdict} = \\prod_{i=1}^N \\mathbb{I}\\left( Margin_i \\ge 0.20 \\right) \\land \\mathbb{I}\\left( SPF = 0 \\right) \\land \\mathbb{I}\\left( V\\&V_{pass} = \\text{true} \\right)',
      formulaExplanation: {
        en: 'GSFC-STD-1000 Rule 1.05 strictly prohibits Single Point Failures (SPF) in mission-critical subsystems. Flight electronics must pass thermal-vacuum baking (-40°C to +85°C) and random vibration qualification.',
        es: 'La Regla GSFC-STD-1000 1.05 prohíbe fallas de punto único (SPF) en sistemas vitales. La electrónica debe superar pruebas térmicas en vacío (-40°C a +85°C) y vibración aleatoria.',
      },
      nasaStandards: [
        'GSFC-STD-1000H: Rules for the Design, Development, Verification, and Operation of Flight Systems',
        'NASA-STD-5001B: Structural Design and Test Factors of Safety for Spaceflight Hardware',
        'MIL-STD-1540D: Product Verification Requirements for Launch, Upper Stage, and Space Vehicles',
      ],
      technicalParameters: [
        { parameter: 'Single Point Failures (SPF)', value: '0 Permitted', requirement: { en: 'GSFC Rule 1.05 compliance', es: 'Cumplimiento Norma GSFC 1.05' } },
        { parameter: 'Thermal-Vacuum Qualification', value: '4 Thermal Cycles', requirement: { en: '-40°C to +85°C vacuum bake', es: 'Horneado al vacío -40°C a +85°C' } },
        { parameter: 'Random Vibration Profile', value: '14.1 Grms Qual', requirement: { en: 'Launcher acoustic spectrum', es: 'Espectro acústico del cohete' } },
      ],
      flightRule: {
        en: 'No spacecraft may be integrated into the launch adapter without a signed MCR green flag and closed verification matrix.',
        es: 'Ninguna nave puede montarse en el adaptador del cohete sin la firma verde del MCR y la matriz de verificación cerrada.',
      },
    },
  },

  LAUNCH_PHYSICS: {
    id: 'LAUNCH_PHYSICS',
    badge: { en: 'CML 06 · LAUNCH & FLIGHT SIMULATION', es: 'CML 06 · LANZAMIENTO & SIMULACIÓN' },
    title: { en: 'Rocket Ascent, Max-Q Shockwave & In-Flight Crisis', es: 'Ascenso del Cohete, Onda Max-Q y Crisis en Vuelo' },
    subtitle: {
      en: 'Sound suppression deluge steam, transonic Prandtl-Glauert shock cones, Mach diamonds, and orbital recovery',
      es: 'Vapor de supresión de sonido, condensación transónica de Prandtl-Glauert y resolución de contingencias',
    },
    studentView: {
      analogyTitle: {
        en: 'Riding the Fire: Sound Waves, Steam, and Max-Q Shaking',
        es: 'Montando el Fuego: Ondas de Sonido, Vapor y Sacudida Max-Q',
      },
      analogyText: {
        en: 'At launch, thousands of liters of water flood the launch pad to absorb the deafening sound waves, creating massive clouds of white steam! As the rocket crosses the speed of sound, a white condensation cone appears around the nose (Prandtl-Glauert effect) and aerodynamic drag reaches maximum (Max-Q). In orbit, your safety margins help you resolve flight crises!',
        es: 'Al despegar, miles de litros de agua inundan la plataforma para amortiguar el sonido ensordecedor de los motores, ¡creando enormes nubes de vapor blanco! Al romper la barrera del sonido, un velo cónico blanco envuelve la punta (cono de Prandtl-Glauert) y el cohete tiembla con la máxima presión (Max-Q). ¡En órbita, tus reservas resuelven las crisis!',
      },
      causeAndEffect: [
        {
          action: { en: 'Survive Max-Q', es: 'Superar la zona Max-Q' },
          consequence: {
            en: 'The rocket sheds the thick atmosphere and fairing separation exposes the satellite to space.',
            es: 'El cohete supera el aire denso y la cofia se abre exponiendo el satélite al espacio.',
          },
        },
        {
          action: { en: 'Solve Flight Crisis', es: 'Resolver la Crisis en Vuelo' },
          consequence: {
            en: 'Select the optimal engineering choice to protect hull integrity and earn the 3-star rating!',
            es: 'Elige la respuesta óptima para proteger el casco y asegurar las 3 estrellas de la NASA.',
          },
        },
      ],
      goldenRule: {
        en: 'When a flight crisis warning appears, read the engineering justification and pick the optimal recovery action.',
        es: 'Cuando surja una crisis en vuelo, lee la justificación de ingeniería y elige la maniobra óptima.',
      },
    },
    engineerView: {
      theoryTitle: {
        en: 'Aerodynamic Pressure Dynamics & Transonic Compressible Flow',
        es: 'Dinámica de Presión Aerodinámica & Flujo Compresible Transónico',
      },
      formula: 'q_{max} = \\frac{1}{2} \\rho(h) v^2, \\quad C_p = \\frac{p - p_\\infty}{\\frac{1}{2} \\rho_\\infty v_\\infty^2}, \\quad Ma = \\frac{v}{a(T)} \\approx 1.2',
      formulaExplanation: {
        en: 'Max-Q occurs typically around 12 to 14 km altitude at Mach 1.2 to 1.8, where the product of atmospheric density ρ(h) and velocity squared v² reaches its global peak (~35 to 40 kPa). Sound suppression deluge reduces pad acoustic energy by up to 15 dB.',
        es: 'El punto Max-Q ocurre entre 12 y 14 km a Mach 1.2 a 1.8, donde el producto de densidad y velocidad al cuadrado alcanza su pico (~35 a 40 kPa). El diluvio de agua amortigua el sonido hasta en 15 dB.',
      },
      nasaStandards: [
        'NASA SP-8001: Pre-launch and Launch Acoustic and Vibration Criteria',
        'NASA-STD-5002: Load Analyses of Spacecraft and Payloads',
        'AIAA S-080A: Aerodynamic Deceleration Systems',
      ],
      technicalParameters: [
        { parameter: 'Max Dynamic Pressure (Max-Q)', value: '38.5 kPa (804 psf)', requirement: { en: 'Structural peak aerodynamic load', es: 'Carga aerodinámica máxima estructural' } },
        { parameter: 'Pad Water Deluge Flow', value: '900,000 gal/min', requirement: { en: 'Sound suppression acoustic mitigation', es: 'Supresión de choque acústico' } },
        { parameter: 'Stage Separation Velocity', value: '2,450 m/s', requirement: { en: 'MECO nominal velocity threshold', es: 'Umbral de velocidad en MECO' } },
      ],
      flightRule: {
        en: 'During the Max-Q transonic corridor, throttle engines down to 70% nominal thrust to limit aerodynamic structural loads to allowable envelope.',
        es: 'Durante el corredor transónico de Max-Q, los motores reducen empuje al 70% para limitar las cargas estructurales al límite admisible.',
      },
    },
  },
};
