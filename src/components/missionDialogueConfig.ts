import type { CMLPhase, LocalizedText } from '../types/mission';

export interface MissionPhaseContent {
  headerGoal: LocalizedText;
  commanderBrief: {
    cadet: LocalizedText;
    jpl: LocalizedText;
  };
  astraGuide: {
    oneLiner: LocalizedText;
    hints: LocalizedText[];
  };
}

export type MissionContentMap = Record<string, Record<CMLPhase, MissionPhaseContent>>;

export const CAMPAIGN_MISSION_CONTENT: MissionContentMap = {
  // ---------------------------------------------------------------------------
  // CONTRACT-01 · LEO · BIONUTRIENTS-2 (Tutorial)
  // ---------------------------------------------------------------------------
  'contract-leo-bionutrients': {
    CML_1: {
      headerGoal: {
        en: 'LEO CML 1: 3U CubeSat · Microgravity Nutrient Production',
        es: 'LEO CML 1: CubeSat 3U · Producción de Nutrientes en Microgravedad',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, welcome to Flight Academy. Let’s assemble your 3U BioNutrients-2 CubeSat step by step.',
          es: 'Cadete {commander}, bienvenido a la Academia de Vuelo. Armemos tu CubeSat 3U BioNutrients-2 paso a paso.',
        },
        jpl: {
          en: 'Dir. Rostova: Chief Engineer {commander}, verify CML 1 SWaP-C baseline for BioNutrients-2 LEO payload integration.',
          es: 'Dir. Rostova: Ingeniero {commander}, verifique la base SWaP-C de CML 1 para integrar la carga útil de BioNutrients-2 en LEO.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Pick 3U Chassis, deployable solar wings, and confirm the BioNutrients-2 contract.',
          es: 'Elige Chasis 3U, alas solares desplegables y confirma el contrato de BioNutrients-2.',
        },
        hints: [
          {
            en: '1U is 10×10 cm like a milk carton; 3U gives room for the biology growth chamber.',
            es: '1U mide 10×10 cm (como una caja de leche); 3U da el espacio necesario para la cámara biológica.',
          },
          {
            en: 'Deployable solar wings ensure batteries recharge during daytime in Low Earth Orbit.',
            es: 'Las alas solares desplegables garantizan que las baterías se recarguen durante el día en órbita baja.',
          },
        ],
      },
    },
    CML_2: {
      headerGoal: {
        en: 'LEO CML 2: 400 km Altitude · 51.6° ISS Inclination · Near-Earth Network',
        es: 'LEO CML 2: Altitud 400 km · Inclinación EEI 51.6° · Red Cercana a la Tierra',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, orbit altitude determines drag. At 400 km we match the International Space Station trajectory.',
          es: 'Cadete {commander}, la altura orbital define el arrastre. A 400 km igualamos la trayectoria de la Estación Espacial Internacional.',
        },
        jpl: {
          en: 'Dir. Rostova: Confirm 400 km circular orbit and Near-Earth ground station contact pass windows.',
          es: 'Dir. Rostova: Confirme órbita circular de 400 km y ventanas de contacto con estaciones Near-Earth.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Set altitude to 400 km and link to the Near-Earth ground tracking station.',
          es: 'Ajusta la altitud a 400 km y enlaza con la red de estaciones terrestres Near-Earth.',
        },
        hints: [
          {
            en: 'LEO period is ~92 minutes: ~57 minutes in sunlight and ~35 minutes in Earth eclipse.',
            es: 'El período en LEO es de ~92 minutos: ~57 minutos al sol y ~35 minutos en eclipse terrestre.',
          },
          {
            en: 'Near-Earth ground stations give short ~8–12 min direct line-of-sight passes.',
            es: 'Las estaciones terrestres comerciales dan pases directos de unos 8 a 12 minutos.',
          },
        ],
      },
    },
    CML_3: {
      headerGoal: {
        en: 'LEO CML 3: Science Payload & Subsystem Trade Space',
        es: 'LEO CML 3: Carga Científica y Trade Space de Subsistemas',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, equip the BioNutrients-2 incubator and balance mass against battery power.',
          es: 'Cadete {commander}, equipa la incubadora BioNutrients-2 y equilibra la masa con la batería.',
        },
        jpl: {
          en: 'Dir. Rostova: Lock subsystem margins. UHF or S-band radio must sustain required science telemetry rate.',
          es: 'Dir. Rostova: Cierre márgenes de subsistemas. La radio UHF o Banda S debe sostener la tasa de telemetría científica.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Equip BioNutrients-2 in Payload, check mass margin, and pick a compliant launcher.',
          es: 'Equipa BioNutrients-2 en Carga Útil, verifica el margen de masa y elige un lanzador compatible.',
        },
        hints: [
          {
            en: 'The microgravity incubator draws 18W when active. Check that EPS margin stays above 35%.',
            es: 'La incubadora biológica consume 18W activa. Revisa que el margen de energía se mantenga sobre 35%.',
          },
          {
            en: 'VADR or SmallSat rideshare launchers keep launch integration costs under budget.',
            es: 'Lanzadores rideshare o VADR mantienen el costo de integración dentro del presupuesto.',
          },
        ],
      },
    },
    CML_4: {
      headerGoal: {
        en: 'LEO CML 4: Mass Balance, Cold Gas / Electric Prop & Center of Gravity',
        es: 'LEO CML 4: Balance de Masa, Propulsión Fría / Eléctrica y Centro de Gravedad',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, adjust your propellant tanks so total mass stays comfortably under the launcher limit.',
          es: 'Cadete {commander}, ajusta los tanques de propelente para que la masa total no supere la capacidad del cohete.',
        },
        jpl: {
          en: 'Dir. Rostova: Review wet mass versus dispenser volume. Ensure orbit lifetime drag deorbit requirements are met.',
          es: 'Dir. Rostova: Verifique masa húmeda frente al dispensador. Asegure cumplimiento de vida orbital y reentrada limpia.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Fine-tune tank fill percentage to hold at least 35% mass margin.',
          es: 'Ajusta el llenado del tanque para mantener al menos 35% de margen de masa.',
        },
        hints: [
          {
            en: 'Cold-gas or water-propellant thrusters are non-toxic and qualify for secondary rideshare.',
            es: 'Propulsores de gas frío o agua no son tóxicos y califican directo para rideshares secundarios.',
          },
        ],
      },
    },
    CML_5: {
      headerGoal: {
        en: 'LEO CML 5: Mission Concept Review (MCR / Green Flag)',
        es: 'LEO CML 5: Revisión del Concepto de Misión (MCR / Bandera Verde)',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, run our V&V checks. Once all five vital signs are green, hold the button to sign off!',
          es: 'Cadete {commander}, ejecuta las pruebas V&V. ¡Cuando los 5 signos estén en verde, mantén el botón para autorizar!',
        },
        jpl: {
          en: 'Dir. Rostova: NASA Safety Board is evaluating our technical readiness. Authorize flight only with zero red flags.',
          es: 'Dir. Rostova: La Junta de Seguridad evalúa la madurez técnica. Autorice el vuelo solo con cero banderas rojas.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Verify 35% margins, run V&V tests, and sign MCR authorization.',
          es: 'Verifica márgenes del 35%, ejecuta pruebas V&V y firma la autorización MCR.',
        },
        hints: [
          {
            en: 'Check that RF inhibit timer is set to >= 30 min per NASA safety range protocols.',
            es: 'Verifica que el temporizador de inhibición RF esté en ≥ 30 min según protocolos de seguridad de campo.',
          },
        ],
      },
    },
    SIMULATION: {
      headerGoal: {
        en: 'LEO Phase E: Orbital Flight Simulation & Thermal/Solar Crisis',
        es: 'LEO Fase E: Simulación de Vuelo Orbital y Crisis Térmica / Solar',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, BioNutrients-2 is in orbit! Monitor the biological growth chambers and resolve any flight anomaly.',
          es: '¡Cadete {commander}, BioNutrients-2 está en órbita! Monitorea la cámara biológica y resuelve cualquier anomalía en vuelo.',
        },
        jpl: {
          en: 'Dir. Rostova: Spacecraft telemetry streaming live. Maintain thermal loop and ground contact.',
          es: 'Dir. Rostova: Telemetría de la nave transmitiendo en vivo. Mantenga el lazo térmico y el enlace con tierra.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Handle flight dilemmas optimally to protect the biological samples and earn 3 stars.',
          es: 'Resuelve las crisis de vuelo de forma óptima para proteger las muestras biológicas y ganar 3 estrellas.',
        },
        hints: [
          {
            en: 'Prioritize battery power to nutrient heaters during eclipse to prevent sample crystallization.',
            es: 'Prioriza energía de batería a los calentadores de nutrientes durante el eclipse para evitar cristalización.',
          },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // CONTRACT-02 · SSO · TRACERS TÁNDEM
  // ---------------------------------------------------------------------------
  'contract-sso-tracers': {
    CML_1: {
      headerGoal: {
        en: 'SSO CML 1: TRACERS Twin Spacecraft · Polar Cusp Magnetic Reconnection',
        es: 'SSO CML 1: Satélites Gemelos TRACERS · Reconexión Magnética en la Cúspide Polar',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, TRACERS flies twin satellites in formation through Earth’s polar magnetic funnel!',
          es: 'Cadete {commander}, ¡TRACERS vuela dos satélites gemelos en formación a través de la cúspide polar magnética!',
        },
        jpl: {
          en: 'Dir. Rostova: Engineer {commander}, configure TRACERS twin-bus architecture. Volume envelope in dispenser is strictly capped.',
          es: 'Dir. Rostova: Ingeniero {commander}, configure la arquitectura gemela de TRACERS. El volumen en el dispensador es estricto.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Size twin SmallSat buses with magnetometer booms and electric propulsion.',
          es: 'Dimensiona los buses gemelos con mástiles magnetométricos y propulsión eléctrica.',
        },
        hints: [
          {
            en: 'Two satellites flying in tandem like cyclists drafting in formation: they measure how solar wind penetrates the polar cusp.',
            es: 'Dos satélites volando en fila india como ciclistas: miden cómo el viento solar entra por la cúspide polar antes de afectar a la Tierra.',
          },
          {
            en: 'TRACERS measures magnetic reconnection: explosive energy transfer between solar wind and Earth’s shield.',
            es: 'TRACERS mide reconexión magnética: transferencia explosiva de energía entre el viento solar y el escudo terrestre.',
          },
        ],
      },
    },
    CML_2: {
      headerGoal: {
        en: 'SSO CML 2: ~590–650 km Sun-Synchronous Orbit · ~97.8° Retrograde Inclination',
        es: 'SSO CML 2: Órbita Heliosíncrona ~590–650 km · Inclinación Retrógrada ~97.8°',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, Sun-Synchronous Orbit precesses ~1° per day to follow Earth around the Sun. Constant sunlight!',
          es: 'Cadete {commander}, la órbita heliosíncrona precesa ~1° al día acompañando a la Tierra. ¡Luz solar constante!',
        },
        jpl: {
          en: 'Dir. Rostova: Set nodal precession rate to match mean solar motion. Validate high-latitude ground station contacts.',
          es: 'Dir. Rostova: Ajuste la precesión nodal al movimiento solar medio. Valide contactos en estaciones de alta latitud.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Adjust inclination to 97.8° and altitude ~600 km to lock Sun-Synchronous stability.',
          es: 'Ajusta la inclinación a 97.8° y la altitud a ~600 km para fijar la estabilidad heliosíncrona.',
        },
        hints: [
          {
            en: '97.8° is retrograde (greater than 90°), which uses Earth’s oblateness (J2 effect) to shift the orbit automatically.',
            es: '97.8° es retrógrada (>90°), aprovechando el ensanchamiento ecuatorial de la Tierra (efecto J2) para precesar.',
          },
          {
            en: 'Polar ground stations (like Svalbard or Fairbanks) see the satellites on almost every single pass.',
            es: 'Estaciones polares como Svalbard o Alaska ven a los satélites en prácticamente cada vuelta.',
          },
        ],
      },
    },
    CML_3: {
      headerGoal: {
        en: 'SSO CML 3: Magnetometer, Plasma Analyzers & Tandem Separation Link',
        es: 'SSO CML 3: Magnetómetro, Analizadores de Plasma y Enlace Inter-satélite',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, equip the fluxgate magnetometer and plasma wave instruments to capture cusps.',
          es: 'Cadete {commander}, equipa el magnetómetro de mástil y sensores de plasma para captar las cúspides.',
        },
        jpl: {
          en: 'Dir. Rostova: Verify cross-link telemetry or dual ground downlinks. Inter-satellite time tagging must be sub-millisecond.',
          es: 'Dir. Rostova: Verifique enlace cruzado o doble bajada a tierra. La sincronización temporal debe ser sub-milisegundo.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Equip Magnetometer & Plasma Payload. Balance power to keep RF link margin above 3 dB.',
          es: 'Equipa el Magnetómetro y sensores de Plasma. Cuida la energía para mantener el enlace sobre 3 dB.',
        },
        hints: [
          {
            en: 'Flying two craft 10 to 120 seconds apart allows distinguishing moving magnetic boundaries from fading ones.',
            es: 'Volar con 10 a 120 s de separación permite saber si la cúspide se mueve o si está cambiando de intensidad.',
          },
        ],
      },
    },
    CML_4: {
      headerGoal: {
        en: 'SSO CML 4: Tandem Formation Keeping Propellant & Launch Vehicle Capacity',
        es: 'SSO CML 4: Propelente para Mantener Formación y Capacidad del Cohete',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, electric thrusters (like iodine or cold gas) keep our twin satellites at the exact right spacing.',
          es: 'Cadete {commander}, propulsores eléctricos (o gas frío) mantienen la distancia exacta entre ambos satélites.',
        },
        jpl: {
          en: 'Dir. Rostova: Budget ΔV for initial separation burn and 12-month constellation drift maintenance.',
          es: 'Dir. Rostova: Calcule el presupuesto de ΔV para separación inicial y mantenimiento de deriva por 12 meses.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Size electric or green propellant tanks for long-duration tandem station-keeping.',
          es: 'Ajusta los tanques de propulsión eléctrica o verde para mantener la formación tándem.',
        },
        hints: [
          {
            en: 'High Isp electric thrusters save mass, leaving room for dual satellite structures in the rocket fairing.',
            es: 'El alto Isp de la propulsión eléctrica ahorra peso y permite meter dos satélites en el mismo cohete.',
          },
        ],
      },
    },
    CML_5: {
      headerGoal: {
        en: 'SSO CML 5: Dual-Spacecraft V&V Clearance & Pre-Flight Review',
        es: 'SSO CML 5: Aprobación V&V para Vuelo Doble y Revisión Pre-Lanzamiento',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, verify both spacecraft systems. If our magnetic booms pass deploy tests, we get the Green Flag!',
          es: 'Cadete {commander}, verifica ambos satélites. ¡Si los mástiles pasan la prueba de despliegue, tenemos Bandera Verde!',
        },
        jpl: {
          en: 'Dir. Rostova: Review tandem separation sequence and magnetic cleanliness protocols.',
          es: 'Dir. Rostova: Verifique la secuencia de eyección dual y protocolos de limpieza magnética de la nave.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Validate separation timing, magnetic cleanliness, and authorize TRACERS flight.',
          es: 'Valida los tiempos de eyección, limpieza magnética y autoriza el lanzamiento de TRACERS.',
        },
        hints: [
          {
            en: 'Magnetic cleanliness ensures internal electronics do not fool our sensitive cusp science magnetometers.',
            es: 'La limpieza magnética evita que la propia electrónica de la nave falsee los datos de la cúspide polar.',
          },
        ],
      },
    },
    SIMULATION: {
      headerGoal: {
        en: 'SSO Phase E: Polar Cusp Penetration & Solar Flare Geomagnetic Storm',
        es: 'SSO Fase E: Cruce de la Cúspide Polar y Tormenta Geomagnética',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, the twin satellites entered the northern cusp! A solar flare is buffeting the auroral field!',
          es: '¡Cadete {commander}, los satélites gemelos entraron a la cúspide norte! ¡Una fulguración solar sacude la aurora!',
        },
        jpl: {
          en: 'Dir. Rostova: High-latitude energetic proton flux detected. Reconfigure ADCS pointing and record reconnection events.',
          es: 'Dir. Rostova: Flujo de protones energéticos detectado. Reconfigure ADCS y registre los eventos de reconexión.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Solve in-flight dilemmas to synchronize twin measurements and preserve instruments.',
          es: 'Resuelve las crisis de vuelo para sincronizar las mediciones dobles y salvar los instrumentos.',
        },
        hints: [
          {
            en: 'During auroral particle surges, ground station downlinks may experience ionospheric scintillation. Buffer data locally!',
            es: 'Durante picos de auroras, la señal a tierra sufre centelleo ionosférico. ¡Guarda datos en memoria intermedia!',
          },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // CONTRACT-03 · GEO · GMAT R2026a TRANSFER
  // ---------------------------------------------------------------------------
  'contract-geo-gmat': {
    CML_1: {
      headerGoal: {
        en: 'GEO CML 1: GMAT R2026a · Geostationary 35,786 km Weather Sentinel',
        es: 'GEO CML 1: GMAT R2026a · Centinela Meteorológico Geoestacionario a 35,786 km',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, geostationary orbit sits at 35,786 km! At this exact height, the satellite takes 24 hours to orbit and matches Earth’s spin.',
          es: 'Cadete {commander}, la órbita geoestacionaria está a 35,786 km. A esa altura el satélite tarda 24 horas y rota idéntico a la Tierra.',
        },
        jpl: {
          en: 'Dir. Rostova: Engineer {commander}, design our GEO platform. Circularizing from GTO requires a massive Hohmann ΔV budget.',
          es: 'Dir. Rostova: Ingeniero {commander}, diseñe la plataforma GEO. Circularizar desde GTO requiere un presupuesto masivo de ΔV de Hohmann.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Size chassis and bipropellant propulsion to conquer the 35,786 km climb.',
          es: 'Dimensiona el chasis y la propulsión de bipropelente para conquistar la subida a 35,786 km.',
        },
        hints: [
          {
            en: 'GEO satellites look like they "stand still" in the sky, allowing weather radar to watch full continents continuously.',
            es: 'Los satélites GEO parecen "fijos" en el cielo, vigilando huracanes y clima de continentes enteros sin moverse.',
          },
        ],
      },
    },
    CML_2: {
      headerGoal: {
        en: 'GEO CML 2: 35,786 km Altitude · 0° Equatorial Inclination · 23 h 56 min Period',
        es: 'GEO CML 2: Altitud 35,786 km · Inclinación 0° Ecuatorial · Período 23 h 56 min',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, to stay stationary above the equator, inclination must be strictly 0.0°!',
          es: 'Cadete {commander}, para quedarse quieto sobre el ecuador, ¡la inclinación debe ser estrictamente 0.0°!',
        },
        jpl: {
          en: 'Dir. Rostova: Calculate Hohmann transfer apogee injection. Plane change burns at apogee drastically save fuel.',
          es: 'Dir. Rostova: Calcule la inyección de apogeo Hohmann. El cambio de plano en el apogeo ahorra toneladas de combustible.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Target 35,786 km altitude and 0° inclination. DSN 34m dish links will track telemetry.',
          es: 'Fija 35,786 km de altitud e inclinación 0°. Las antenas DSN de 34m asegurarán el enlace.',
        },
        hints: [
          {
            en: 'The fastest highway to GEO: two timed burns where the second burn at apogee circularizes the orbit at 35,786 km.',
            es: 'La autopista más rápida al ecuador: dos encendidos cronometrados donde el segundo encendido en el punto más alto circulariza la nave.',
          },
          {
            en: 'Hohmann transfer physics: standard GTO transfer requires ~1,500 to ~1,800 m/s for circularization and plane change.',
            es: 'Física de transferencia de Hohmann: circularizar desde GTO y corregir el plano exige entre 1,500 y 1,800 m/s de ΔV.',
          },
        ],
      },
    },
    CML_3: {
      headerGoal: {
        en: 'GEO CML 3: Multi-Spectral Weather Imager & High-DeltaV Bipropellant Engine',
        es: 'GEO CML 3: Cámara Meteorológica Multiespectral y Motor Bipropelente de Alto ΔV',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, pick the heavy bipropellant engine and high-gain antenna to send full-disk Earth images.',
          es: 'Cadete {commander}, elige el motor bipropelente y antena de alta ganancia para enviar fotos completas de la Tierra.',
        },
        jpl: {
          en: 'Dir. Rostova: Verify telecom link margin at 35,786 km slant range. Free Space Path Loss (FSPL) is significant.',
          es: 'Dir. Rostova: Verifique el margen de radio a 35,786 km. La atenuación por distancia (FSPL) es muy alta.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Select Bipropellant propulsion and X/Ka Band dish to ensure data link from 35,786 km.',
          es: 'Selecciona propulsión Bipropelente y antena Banda X/Ka para garantizar datos desde 35,786 km.',
        },
        hints: [
          {
            en: 'At 35,786 km, radio signal takes ~120 ms to reach Earth. High transmit power is essential.',
            es: 'A 35,786 km, la señal de radio tarda ~120 ms en llegar a la Tierra. Se requiere buena potencia de transmisión.',
          },
        ],
      },
    },
    CML_4: {
      headerGoal: {
        en: 'GEO CML 4: Propellant Mass Fraction & Falcon 9 / Heavy Launch Envelope',
        es: 'GEO CML 4: Fracción de Masa de Propelente y Capacidad del Falcon 9 / Cohete Pesado',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, the rocket equation dictates that more than half your satellite mass is liquid fuel!',
          es: 'Cadete {commander}, la ecuación del cohete dicta que ¡más de la mitad del peso del satélite es combustible líquido!',
        },
        jpl: {
          en: 'Dir. Rostova: Solve Tsiolkovsky mass fraction: ΔV = Isp · g₀ · ln(m₀/mf). Heavy booster is mandatory.',
          es: 'Dir. Rostova: Resuelva la fracción de masa de Tsiolkovsky: ΔV = Isp · g₀ · ln(m₀/mf). Se requiere lanzador pesado.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Balance fuel tanks to clear Delta-V requirements without exceeding launcher capacity.',
          es: 'Equilibra los tanques de combustible para cubrir el ΔV sin superar la capacidad del cohete.',
        },
        hints: [
          {
            en: 'If wet mass exceeds the rocket fairing limit, upgrade your launch vehicle or optimize dry mass.',
            es: 'Si la masa húmeda sobrepasa el límite del cohete, escala el lanzador o aligera la estructura.',
          },
        ],
      },
    },
    CML_5: {
      headerGoal: {
        en: 'GEO CML 5: Van Allen Particle Belt Transit V&V & MCR Approval',
        es: 'GEO CML 5: Verificación de Tránsito por Cinturones de Van Allen y Aprobación MCR',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, on the way up to GEO, we cross the outer Van Allen particle belt. Our electronics have shielding!',
          es: 'Cadete {commander}, camino a GEO cruzamos el cinturón exterior de Van Allen. ¡Nuestra electrónica lleva blindaje!',
        },
        jpl: {
          en: 'Dir. Rostova: Verify total ionizing dose (TID) shielding margin before authorizing ignition.',
          es: 'Dir. Rostova: Verifique el margen de blindaje contra dosis ionizante espacial (TID) antes de autorizar encendido.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Review TID environmental tolerance and burn schedule, then authorize the MCR launch.',
          es: 'Revisa la tolerancia ambiental y el plan de encendido, luego autoriza el lanzamiento MCR.',
        },
        hints: [
          {
            en: 'Crossing the electron belts in a few hours minimizes cumulative exposure compared to staying inside them.',
            es: 'Cruzar los cinturones de electrones en pocas horas minimiza la dosis acumulada frente a quedarse dentro.',
          },
        ],
      },
    },
    SIMULATION: {
      headerGoal: {
        en: 'GEO Phase E: GTO-to-GEO Circularization Burn & Weather Sentinel Operations',
        es: 'GEO Fase E: Encendido de Circularización GTO a GEO y Operaciones de Clima',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, main engine firing for GEO circularization! Monitor chamber pressure and battery drain.',
          es: '¡Cadete {commander}, motor principal encendido para circularizar en GEO! Monitorea presión y batería.',
        },
        jpl: {
          en: 'Dir. Rostova: Apogee engine burn active. Trim orbital velocity to 3.07 km/s to lock geostationary synchronization.',
          es: 'Dir. Rostova: Encendido de apogeo activo. Ajuste la velocidad a 3.07 km/s para sincronizar la órbita con la Tierra.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Execute optimal burn and stabilization choices to park safely over the equator.',
          es: 'Ejecuta las decisiones de encendido y estabilización para aparcar la nave sobre el ecuador.',
        },
        hints: [
          {
            en: 'Orbital speed at GEO is ~3.07 km/s (much slower than LEO’s 7.8 km/s because of the 35,786 km distance).',
            es: 'La velocidad orbital en GEO es de ~3.07 km/s (más lenta que los 7.8 km/s de LEO por la gran distancia).',
          },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // CONTRACT-04 · LUNA · LUNAR TRAILBLAZER
  // ---------------------------------------------------------------------------
  'contract-moon-trailblazer': {
    CML_1: {
      headerGoal: {
        en: 'LUNA CML 1: Lunar Trailblazer · Water-Ice Spectroscopy in Polar Craters',
        es: 'LUNA CML 1: Lunar Trailblazer · Espectroscopía de Hielo de Agua en Cráteres Polares',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, our target is the Moon (~384,400 km away)! We will hunt for water-ice in dark craters for Artemis.',
          es: 'Cadete {commander}, ¡nuestro destino es la Luna (~384,400 km)! Buscaremos hielo de agua en cráteres oscuros para Artemis.',
        },
        jpl: {
          en: 'Dir. Rostova: Engineer {commander}, design Lunar Trailblazer SmallSat. Deep thermal swings between lunar day and night are severe.',
          es: 'Dir. Rostova: Ingeniero {commander}, diseñe la sonda Lunar Trailblazer. Los saltos térmicos en la Luna son extremos.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Configure a lunar orbiter with infrared spectrometers and cryocooled detectors.',
          es: 'Configura un orbitador lunar con espectrómetros infrarrojos y detectores refrigerados.',
        },
        hints: [
          {
            en: 'A cosmic detective with an infrared flashlight: flies over -240°C craters where sunlight never enters, finding water for future astronauts.',
            es: 'Un detective con linterna infrarroja: sobrevuela cráteres a -240°C donde jamás ha entrado el Sol, buscando agua para futuros astronautas.',
          },
          {
            en: 'Permanently Shadowed Regions (PSRs) at the lunar south pole haven’t seen sunlight in billions of years and preserve water-ice.',
            es: 'Los cráteres polares en sombra permanente no han visto el Sol en miles de millones de años y guardan hielo intacto.',
          },
        ],
      },
    },
    CML_2: {
      headerGoal: {
        en: 'LUNA CML 2: ~100 km Lunar Polar Orbit · 90° Inclination · DSN 34m Contact',
        es: 'LUNA CML 2: Órbita Polar Lunar a ~100 km · Inclinación 90° · Contacto DSN 34m',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, a 90° polar orbit allows the Moon to rotate underneath, mapping every single crater!',
          es: 'Cadete {commander}, una órbita polar de 90° permite que la Luna gire debajo y cartografiemos cada cráter.',
        },
        jpl: {
          en: 'Dir. Rostova: Establish trans-lunar trajectory and low lunar orbit insertion timeline.',
          es: 'Dir. Rostova: Establezca la trayectoria translunar y el cronograma de inserción en órbita lunar baja.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Set lunar orbit to ~100 km and lock 90° inclination with DSN 34m tracking.',
          es: 'Fija la órbita lunar a ~100 km y 90° de inclinación con seguimiento DSN 34m.',
        },
        hints: [
          {
            en: 'When behind the Moon, radio line-of-sight with Earth is completely blocked for ~45 min every orbit.',
            es: 'Al pasar detrás de la Luna, el enlace con la Tierra se bloquea por completo unos 45 min por vuelta.',
          },
        ],
      },
    },
    CML_3: {
      headerGoal: {
        en: 'LUNA CML 3: Infrared Volatiles Spectrometer & High-Efficiency Solar Arrays',
        es: 'LUNA CML 3: Espectrómetro Infrarrojo de Volátiles y Paneles de Alta Eficiencia',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, equip the HVM3 infrared water spectrometer and ensure our heaters keep sensors warm in shadow.',
          es: 'Cadete {commander}, equipa el espectrómetro infrarrojo de agua HVM3 y calentadores para no congelar los sensores.',
        },
        jpl: {
          en: 'Dir. Rostova: Passive thermal radiator must look out to cold space while keeping optics below 100 Kelvin.',
          es: 'Dir. Rostova: El radiador térmico pasivo debe mirar al espacio frío manteniendo la óptica por debajo de 100 K.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Select IR Spectrometer payload and robust thermal insulation blankets.',
          es: 'Selecciona la carga de Espectrómetro IR y mantas de aislamiento térmico reforzado.',
        },
        hints: [
          {
            en: 'Detecting the 3-micrometer water absorption signature requires cold, low-noise infrared sensors.',
            es: 'Detectar la huella del agua a 3 micrómetros exige sensores infrarrojos fríos y sin ruido térmico.',
          },
        ],
      },
    },
    CML_4: {
      headerGoal: {
        en: 'LUNA CML 4: Trans-Lunar Injection (TLI) ΔV & Bipropellant Capture Budget',
        es: 'LUNA CML 4: ΔV de Inyección Translunar (TLI) y Presupuesto de Captura Bipropelente',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, reaching the Moon requires escaping Earth gravity (~3,100 m/s TLI) plus lunar capture.',
          es: 'Cadete {commander}, llegar a la Luna requiere escapar de la Tierra (~3,100 m/s TLI) más el frenado para entrar en órbita.',
        },
        jpl: {
          en: 'Dir. Rostova: Verify gravity-assist or direct lunar orbit insertion (LOI) delta-V budget.',
          es: 'Dir. Rostova: Verifique el presupuesto de delta-V para inserción en órbita lunar baja (LOI).',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Balance fuel for lunar capture and polar orbit maintenance.',
          es: 'Equilibra el combustible para la captura lunar y mantenimiento de órbita polar.',
        },
        hints: [
          {
            en: 'The Moon’s lumpy gravity field (mascons) perturbs orbits, requiring periodic trim burns.',
            es: 'La gravedad irregular de la Luna (mascons) perturba la órbita y exige pequeños encendidos de corrección.',
          },
        ],
      },
    },
    CML_5: {
      headerGoal: {
        en: 'LUNA CML 5: Lunar Thermal Drop V&V & Mission Safety Review',
        es: 'LUNA CML 5: Verificación de Caída Térmica Lunar y Aprobación de Seguridad',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, run battery survival tests for long lunar night passes. Ready for MCR authorization!',
          es: 'Cadete {commander}, prueba la batería para resistir la sombra lunar. ¡Listos para autorizar el MCR!',
        },
        jpl: {
          en: 'Dir. Rostova: Confirm battery Depth-of-Discharge (DoD) during lunar eclipse passes.',
          es: 'Dir. Rostova: Confirme que la profundidad de descarga de las baterías (DoD) no sobrepase los límites.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Validate thermal survival in shadow and authorize the lunar flight.',
          es: 'Valida la supervivencia térmica en sombra y autoriza el vuelo lunar.',
        },
        hints: [
          {
            en: 'Temperatures in polar craters plummet below -200°C (70 K). Internal survival heaters are vital.',
            es: 'En los cráteres polares la temperatura cae a -200°C (70 K). Los calentadores de supervivencia son vitales.',
          },
        ],
      },
    },
    SIMULATION: {
      headerGoal: {
        en: 'LUNA Phase E: Lunar Orbit Insertion (LOI) & Shackleton Crater Ice Mapping',
        es: 'LUNA Fase E: Inserción en Órbita Lunar y Mapeo de Hielo en el Cráter Shackleton',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, lunar capture complete! We are scanning Shackleton crater at the South Pole right now!',
          es: '¡Cadete {commander}, captura lunar completada! ¡Estamos escaneando el cráter Shackleton en el polo sur!',
        },
        jpl: {
          en: 'Dir. Rostova: Spectrometer spectral lines streaming. Lock attitude to keep optics in shadow while solar arrays face the Sun.',
          es: 'Dir. Rostova: Espectro recibiéndose. Mantenga la orientación para que el sensor esté en sombra y las alas al Sol.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Resolve lunar flight anomalies to map ice deposits and secure the mission grade.',
          es: 'Resuelve las contingencias para cartografiar el hielo y asegurar la calificación de la misión.',
        },
        hints: [
          {
            en: 'Map hydroxyl (OH) and water (H₂O) surface absorption dips to verify lunar ice reserves for Artemis crews.',
            es: 'Mapea las bandas de absorción de agua (H₂O) y oxidrilo (OH) para confirmar reservas para Artemis.',
          },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // CONTRACT-05 · SE-L2 · JWST / CSA FGS
  // ---------------------------------------------------------------------------
  'contract-l2-jwst-fgs': {
    CML_1: {
      headerGoal: {
        en: 'SE-L2 CML 1: JWST / FGS · 1.5 Million km Sun-Earth Lagrange Point 2',
        es: 'SE-L2 CML 1: JWST / FGS · Punto de Lagrange 2 a 1.5 Millones de km de la Tierra',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, Lagrange Point L2 is 1.5 million kilometers from Earth! Gravity from Earth and Sun balances perfectly there.',
          es: 'Cadete {commander}, ¡el punto L2 está a 1.5 millones de kilómetros! La gravedad del Sol y la Tierra se equilibran a la perfección.',
        },
        jpl: {
          en: 'Dir. Rostova: Chief Engineer {commander}, design our deep-space infrared observatory platform with five-layer sunshield isolation.',
          es: 'Dir. Rostova: Ingeniero Jefe {commander}, diseñe la plataforma observatorio con parasol de cinco capas para L2.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Size a large deep-space bus with multi-layer sunshield and fine guidance sensors.',
          es: 'Dimensiona una nave de espacio profundo con parasol multicapa y sensor de guiado fino.',
        },
        hints: [
          {
            en: 'A tennis-court-sized umbrella: blocks the heat of the Sun, Earth, and Moon at 1.5M km to freeze the optics to -233°C.',
            es: 'Una sombrilla del tamaño de una cancha de tenis: bloquea el calor del Sol, la Tierra y la Luna a 1.5M km para enfriar los espejos a -233°C.',
          },
          {
            en: 'At L2, Sun, Earth, and Moon stay on the same side behind the observatory, so the telescope stays in deep freeze.',
            es: 'En L2, el Sol, la Tierra y la Luna quedan siempre detrás del parasol, manteniendo el telescopio ultra frío.',
          },
        ],
      },
    },
    CML_2: {
      headerGoal: {
        en: 'SE-L2 CML 2: Sun-Earth L2 Halo Orbit · Zero Eclipse Environment · DSN 34m/70m',
        es: 'SE-L2 CML 2: Órbita Halo en Sol-Tierra L2 · Cero Eclipses · Antena DSN 34m/70m',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, a halo orbit loops around empty space at L2 and never enters Earth’s shadow: 100% constant power!',
          es: 'Cadete {commander}, una órbita halo rodea el punto vacío L2 y nunca entra a la sombra de la Tierra: ¡100% sol constante!',
        },
        jpl: {
          en: 'Dir. Rostova: Calculate quasi-periodic halo orbit parameters. Weekly station-keeping is required to avoid drift.',
          es: 'Dir. Rostova: Calcule parámetros de la órbita halo cuasi-periódica. Se requiere mantenimiento semanal para no escapar.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Target SE-L2 destination and connect to the Deep Space Network (DSN).',
          es: 'Selecciona el destino Sol-Tierra L2 y conecta con la Red del Espacio Profundo (DSN).',
        },
        hints: [
          {
            en: 'Light delay to L2 is ~5 seconds each way. Real-time manual joystick control is impossible; onboard autonomy is key.',
            es: 'La señal a L2 tarda unos 5 segundos en ir y 5 en volver. El control manual es imposible; se requiere autonomía.',
          },
        ],
      },
    },
    CML_3: {
      headerGoal: {
        en: 'SE-L2 CML 3: Cryogenic IR Spectrometer, Active Cryocooler & Star Trackers',
        es: 'SE-L2 CML 3: Espectrómetro IR Criogénico, Criorefrigerador y Star Trackers',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, infrared telescopes see heat. If our telescope isn’t cooled below 50 Kelvin (-223°C), its own warmth blinds it!',
          es: 'Cadete {commander}, el infrarrojo ve calor. Si el telescopio no se enfría bajo 50 K (-223°C), ¡su propio calor lo ciega!',
        },
        jpl: {
          en: 'Dir. Rostova: Equip Fine Guidance Sensor (FGS) and cryo thermal loop. ADCS jitter must stay sub-arcsecond.',
          es: 'Dir. Rostova: Equipe el Sensor de Guiado Fino (FGS) y criorefrigeración. La vibración de apuntado debe ser sub-arcosegundo.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Pair Cryo IR Spectrometer with active cryocooler and precision ADCS star tracker.',
          es: 'Combina el Espectrómetro Criogénico con refrigeración activa y Star Tracker de alta precisión.',
        },
        hints: [
          {
            en: 'Cryocooler + IR payload creates an active synergy bonus (+12% science return).',
            es: 'El combo de criorefrigerador + espectrómetro IR genera sinergia activa (+12% de retorno científico).',
          },
        ],
      },
    },
    CML_4: {
      headerGoal: {
        en: 'SE-L2 CML 4: Heavy Booster (Falcon 9 / Ariane 5) & Halo Station-Keeping Fuel',
        es: 'SE-L2 CML 4: Lanzador Pesado y Combustible de Mantenimiento de Órbita Halo',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, L2 is an unstable equilibrium like a ball balanced on a hill. We need tiny thruster puffs to stay parked.',
          es: 'Cadete {commander}, L2 es un equilibrio inestable (como una pelota sobre una colina). Requiere empujoncitos periódicos.',
        },
        jpl: {
          en: 'Dir. Rostova: Allocate propellant for 10-year halo station-keeping without contaminating optical mirrors.',
          es: 'Dir. Rostova: Asigne propelente para 10 años de mantenimiento de halo sin contaminar los espejos ópticos.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Equip heavy booster and allocate hydrazine for station-keeping maneuvers.',
          es: 'Elige un cohete pesado y reserva combustible para correcciones de órbita.',
        },
        hints: [
          {
            en: 'Non-contaminating thrusters protect gold-coated beryllium primary mirrors.',
            es: 'Propulsores limpios protegen los espejos primarios de berilio bañados en oro.',
          },
        ],
      },
    },
    CML_5: {
      headerGoal: {
        en: 'SE-L2 CML 5: 5-Layer Sunshield Deployment Cascade V&V & Flight Clearance',
        es: 'SE-L2 CML 5: Verificación del Despliegue en Cascada del Parasol y Autorización',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, the sunshield unfolds in a 50-step mechanical cascade! Every pin and tensioner must test green.',
          es: 'Cadete {commander}, ¡el parasol se despliega en 50 pasos mecánicos! Cada tensor y perno debe dar verde.',
        },
        jpl: {
          en: 'Dir. Rostova: Review single-point failures in sunshield deployment mechanisms before authorizing departure.',
          es: 'Dir. Rostova: Revise fallas de punto único en el mecanismo del parasol antes de autorizar la partida.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Verify sub-arcsecond pointing and deployment cascade, then sign MCR.',
          es: 'Verifica la estabilidad sub-arcosegundo, el despliegue del parasol y firma el MCR.',
        },
        hints: [
          {
            en: 'Sunshield deployment brings the cold side from +85°C down to -233°C (40 K).',
            es: 'El despliegue del parasol baja la temperatura del lado frío de +85°C a -233°C (40 K).',
          },
        ],
      },
    },
    SIMULATION: {
      headerGoal: {
        en: 'SE-L2 Phase E: Deep Space Infrared Imaging & Micrometeoroid Mirror Impact',
        es: 'SE-L2 Fase E: Observaciones Infrarrojas Profundas e Impacto de Micrometeorito',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, we are locked on the first galaxies formed after the Big Bang! A micro-meteoroid just grazed a mirror segment!',
          es: '¡Cadete {commander}, apuntamos a las primeras galaxias tras el Big Bang! ¡Un micrometeorito rozó un segmento del espejo!',
        },
        jpl: {
          en: 'Dir. Rostova: Wavefront sensing anomaly on segment C3. Re-align mirror hex actuators to restore diffraction limit.',
          es: 'Dir. Rostova: Anomalía de frente de onda en segmento C3. Reajuste actuadores para recuperar el límite de difracción.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Resolve alignment and pointing dilemmas to deliver sharp deep-field cosmic images.',
          es: 'Resuelve las decisiones de alineación y guiado para entregar imágenes cosmológicas nítidas.',
        },
        hints: [
          {
            en: 'Fine Guidance Sensor (FGS) measures star positions 16 times per second to hold pointing jitter to 1/1000th of an arcsecond.',
            es: 'El sensor FGS mide posiciones estelares 16 veces por segundo manteniendo la vibración en milésimas de arcosegundo.',
          },
        ],
      },
    },
  },

  // ---------------------------------------------------------------------------
  // CONTRACT-06 · JÚPITER · JÚPITER RTG CLIPPER (Jefe Final)
  // ---------------------------------------------------------------------------
  'contract-jupiter-clipper': {
    CML_1: {
      headerGoal: {
        en: 'JÚPITER CML 1: 5.20 AU Deep Space · Europa Ice Shell Recon · 1/R² Radiation Boss',
        es: 'JÚPITER CML 1: 5.20 AU Espacio Profundo · Reconocimiento de Europa · Ley 1/R² y Radiación',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, welcome to the Final Boss: Jupiter at 5.2 AU (~778 million km)! Sunlight drops by 96%. Ordinary solar panels will not work!',
          es: 'Cadete {commander}, ¡el Jefe Final: Júpiter a 5.2 AU (~778 millones de km)! La luz solar cae 96%. ¡Los paneles comunes no funcionan!',
        },
        jpl: {
          en: 'Dir. Rostova: Chief Engineer {commander}, design Europa Clipper probe. Jovian radiation belts deliver lethal MeV electron fluxes.',
          es: 'Dir. Rostova: Ingeniero Jefe {commander}, diseñe la sonda Europa Clipper. Los cinturones jovianos emiten radiación letal.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Select Deep Space Bus, nuclear RTG power, and heavy titanium radiation vault.',
          es: 'Elige Nave de Espacio Profundo, núcleo nuclear RTG y bóveda de titanio anti-radiación.',
        },
        hints: [
          {
            en: 'The ultimate cosmic bunker: at 778M km, solar light is minimal. An RTG nuclear core and titanium vault protect against radiation to probe Europa’s hidden ocean.',
            es: 'El búnker espacial definitivo: a 778M km la luz solar es mínima. El núcleo RTG y la bóveda de titanio resisten la radiación para sondear el océano oculto de Europa.',
          },
          {
            en: 'Inverse-Square Law (1/R²): at 5.2 AU, solar flux is only (1/5.2)² ≈ 3.7% of Earth’s. RTG nuclear decay is essential.',
            es: 'Ley 1/R²: a 5.2 AU la luz solar es solo (1/5.2)² ≈ 3.7% de la terrestre. La energía nuclear RTG es indispensable.',
          },
        ],
      },
    },
    CML_2: {
      headerGoal: {
        en: 'JÚPITER CML 2: Highly Elliptical Jovian Orbit · Europa Flybys · DSN 70-Meter Dish',
        es: 'JÚPITER CML 2: Órbita Joviana Elíptica · Sobrevuelos a Europa · Antena DSN 70m',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, to survive radiation, we do not orbit Europa directly: we dive in for quick flybys and retreat into safe space!',
          es: 'Cadete {commander}, para sobrevivir no orbitamos Europa fijo: ¡entramos para un sobrevuelo rápido y escapamos de la radiación!',
        },
        jpl: {
          en: 'Dir. Rostova: Jovian gravity well requires heavy delta-V. Connect to JPL DSN 70m antenna for 45-minute light-delay links.',
          es: 'Dir. Rostova: La gravedad de Júpiter exige alto ΔV. Conecte a la antena DSN 70m para enlaces con 45 min de retardo.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Target Jupiter destination and link with the DSN 70-meter Goldstone dish.',
          es: 'Fija destino Júpiter y enlaza con la antena DSN de 70 metros.',
        },
        hints: [
          {
            en: 'At 5.2 AU, radio signals take ~45 minutes to travel each way. The spacecraft must make decisions completely autonomously.',
            es: 'A 5.2 AU la radio tarda ~45 minutos por trayecto. La nave debe tomar decisiones 100% de forma autónoma.',
          },
        ],
      },
    },
    CML_3: {
      headerGoal: {
        en: 'JÚPITER CML 3: Ice-Penetrating Radar (REASON), Magnetometer & RTG Power Core',
        es: 'JÚPITER CML 3: Radar de Penetración de Hielo (SAR/REASON), Magnetómetro y Núcleo RTG',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, equip the Ice-Penetrating Radar to peer through Europa’s 20-km ice shell into the ocean beneath!',
          es: 'Cadete {commander}, ¡equipa el Radar de Hielo para ver a través de los 20 km de hielo hasta el océano oculto de Europa!',
        },
        jpl: {
          en: 'Dir. Rostova: Pair RTG power with bipropellant thrusters and ice radar payload.',
          es: 'Dir. Rostova: Combine el núcleo RTG con propulsión bipropelente y radar de penetración de hielo.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Equip Radar / Magnetometer and lock RTG nuclear core to guarantee 100% duty cycle.',
          es: 'Equipa el Radar / Magnetómetro y asegura el RTG para garantizar energía constante.',
        },
        hints: [
          {
            en: 'Next-Gen RTG provides continuous decay heat, preventing hydrazine propellant lines from freezing at -160°C.',
            es: 'El RTG provee calor continuo por decaimiento, evitando que la hidracina se congele a -160°C.',
          },
        ],
      },
    },
    CML_4: {
      headerGoal: {
        en: 'JÚPITER CML 4: Heavy Falcon Heavy / SLS Booster & Jupiter Orbit Insertion (JOI) ΔV',
        es: 'JÚPITER CML 4: Lanzador Superpesado y ΔV de Inserción en Órbita de Júpiter (JOI)',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, Jupiter has 318 times Earth’s mass! Burning our engine to get captured (JOI) requires massive fuel reserves.',
          es: 'Cadete {commander}, ¡Júpiter tiene 318 veces la masa de la Tierra! Frenar para entrar a su órbita (JOI) exige toneladas de combustible.',
        },
        jpl: {
          en: 'Dir. Rostova: Optimize bipropellant mass for JOI burn (~850 m/s) and gravity-assist trajectory shaping.',
          es: 'Dir. Rostova: Optimice masa bipropelente para encendido JOI (~850 m/s) y asistencias gravitatorias.',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Select super-heavy booster and size propellant tanks to survive deep space insertion.',
          es: 'Elige cohete superpesado y dimensiona tanques para resistir la inserción interplanetaria.',
        },
        hints: [
          {
            en: 'Gravity assists at Mars and Earth provide free velocity boosts to reach 5.2 AU.',
            es: 'Asistencias gravitatorias en Marte y la Tierra dan impulsos de velocidad gratis para llegar a 5.2 AU.',
          },
        ],
      },
    },
    CML_5: {
      headerGoal: {
        en: 'JÚPITER CML 5: Radiation Vault Hardening V&V & Final MCR Clearance',
        es: 'JÚPITER CML 5: Verificación de Bóveda Anti-Radiación y Autorización Final MCR',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, this is the ultimate test. Verify the radiation vault, close our margins, and sign the flight authorization!',
          es: 'Cadete {commander}, este es el examen definitivo. ¡Verifica la bóveda anti-radiación y firma la autorización final!',
        },
        jpl: {
          en: 'Dir. Rostova: All telemetry checks must clear GSFC Gold Rules. Authorize the Jupiter RTG Clipper mission!',
          es: 'Dir. Rostova: Todos los chequeos deben cumplir las reglas GSFC. ¡Autorice la misión Júpiter RTG Clipper!',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Validate radiation hardness, review DSN link margin, and authorize final mission flight.',
          es: 'Valida el blindaje contra radiación, revisa el margen DSN y autoriza el vuelo final.',
        },
        hints: [
          {
            en: 'The aluminum-tantalum vault shields sensitive processors, reducing radiation dose by over 80%.',
            es: 'La bóveda de aluminio y tantalio protege los procesadores reduciendo la radiación más de un 80%.',
          },
        ],
      },
    },
    SIMULATION: {
      headerGoal: {
        en: 'JÚPITER Phase E: Europa Radiation Belt Penetration & Subsurface Ocean Detection',
        es: 'JÚPITER Fase E: Cruce del Cinturón de Radiación de Europa y Detección de Océano Subterráneo',
      },
      commanderBrief: {
        cadet: {
          en: 'Cadet {commander}, we are diving into Europa’s radiation belt right now! Intense electron fluxes are hitting the vault!',
          es: '¡Cadete {commander}, estamos cruzando el cinturón de radiación de Europa! ¡Flujos intensos de electrones golpean la nave!',
        },
        jpl: {
          en: 'Dir. Rostova: High-radiation alarm triggered on sector 4. Execute autonomous fault recovery and capture ice-ocean radar data!',
          es: 'Dir. Rostova: Alarma de alta radiación en sector 4. ¡Ejecute recuperación autónoma y capture datos de radar del océano!',
        },
      },
      astraGuide: {
        oneLiner: {
          en: 'Survive the radiation crises, detect the subsurface ocean, and claim the Solar System Legend rank!',
          es: 'Sobrevive a las crisis de radiación, detecta el océano oculto y alcanza el rango Leyenda del Sistema Solar.',
        },
        hints: [
          {
            en: 'Radar sounder reflections reveal salinity and depth of the liquid water ocean hidden under the ice.',
            es: 'Los ecos del radar revelan la salinidad y profundidad del océano de agua líquida bajo el hielo.',
          },
        ],
      },
    },
  },
};

export function getMissionPhaseContent(
  contractId: string,
  phase: CMLPhase,
): MissionPhaseContent {
  const missionMap = CAMPAIGN_MISSION_CONTENT[contractId];
  if (missionMap && missionMap[phase]) {
    return missionMap[phase];
  }
  // Fallback to default Level 1 content with warning
  console.warn(`[getMissionPhaseContent] Missing content for mission "${contractId}" and phase "${phase}". Using fallback.`);
  return CAMPAIGN_MISSION_CONTENT['contract-leo-bionutrients'][phase];
}
