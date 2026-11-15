import type { StoryCinematicId } from '../store';
import type { CMLPhase, SubsystemCategory } from '../types/mission';

export interface ScrewByScrewStep {
  stepNum: string;
  controlLabel: { en: string; es: string };
  whatIsIt: { en: string; es: string };
  howItConnects: { en: string; es: string };
}

export interface NarrativePhaseBeat {
  phase: CMLPhase;
  beatCode: string;
  speaker: string;
  cadetGoal: { en: string; es: string };
  jplSpec: { en: string; es: string };
  cadetScript: { en: string; es: string };
  jplScript: { en: string; es: string };
  defaultCinematicId: { cadet: StoryCinematicId; jpl: StoryCinematicId };
  screwSteps: ScrewByScrewStep[];
}

export type CinematicScenePose =
  | 'HANGAR_PHOTO'
  | 'VEGA_WINDOW_COIN'
  | 'VEGA_IGNITE_CONSOLE'
  | 'CUBESAT_ORBIT_DANCE'
  | 'ECLIPSE_SHADOW_FREEZE'
  | 'TANKS_RUNNER_HEART'
  | 'MCR_GLASS_GALLERY'
  | 'PAD39A_ENGINES_STEAM'
  | 'OMEGA_SIREN_EUROPA'
  | 'ROSTOVA_TRANSFER_CREDENTIAL'
  | 'JPL_PASADENA_CONTROL'
  | 'VEGA_TRENCH_COMMS'
  | 'JUPITER_GRAVITY_WELL'
  | 'RTG_PALE_SUN'
  | 'COPV_CLEANROOM_LOCK'
  | 'NASA_BOARD_DEFENSE'
  | 'JUPITER_RADIATION_BELT'
  | 'ICARUS_BEACON_RESPONSE'
  | 'VEGA_TEARS_VICTORY'
  | 'ROSTOVA_STANDING_OVATION'
  | 'SANDBOX_INFINITE_FORGE';

export interface CinematicSlide {
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
  speakerTitle: { en: string; es: string };
  pose: CinematicScenePose;
  dialogue: { en: string; es: string };
}

export interface StoryCinematicScene {
  id: StoryCinematicId;
  actLabel: { en: string; es: string };
  title: { en: string; es: string };
  location: { en: string; es: string };
  scienceFact: { en: string; es: string };
  alertBanner?: string;
  requiresCadetNameInput?: boolean;
  requiresEngineerNameInput?: boolean;
  unlocksSandbox?: boolean;
  slides: CinematicSlide[];
}

export const HOLO_ANIMATION_PRESETS = {
  stageFadeSec: 0.35,
  springModal: { type: 'spring' as const, stiffness: 260, damping: 24 },
  voicePulseDurationSec: 0.9,
};

export const LEVEL1_INTERACTIVE_TOUR: {
  step: number;
  targetZone: 'RESOURCES' | 'CHASSIS' | 'EPS' | 'MISSION' | 'NEXT_LEVEL';
  badge: { en: string; es: string };
  title: { en: string; es: string };
  instruction: { en: string; es: string };
}[] = [
  {
    step: 0,
    targetZone: 'RESOURCES',
    badge: { en: 'TOUR 1/5 · VITAL SIGNS', es: 'GUÍA 1/5 · SIGNOS VITALES' },
    title: { en: 'Live Resource Bars (Top Left)', es: 'Barras de Recursos en Vivo (Izquierda Arriba)' },
    instruction: {
      en: 'Cadet {cadet}, look at the top-left panel. Those 5 bars are your ship’s vital signs: Mass, Power, Budget, Data, and RF Link. Every piece you touch will move them. Click "Understand & Continue" to touch your first part.',
      es: 'Cadete {cadet}, mira arriba a la izquierda. Esas 5 barras son los signos vitales de tu nave: Masa, Energía, Presupuesto, Datos y Enlace RF. Cada pieza que elijas moverá estas barras en vivo. Pulsa "Entendido" para tocar tu primera pieza.',
    },
  },
  {
    step: 1,
    targetZone: 'CHASSIS',
    badge: { en: 'TOUR 2/5 · CLICK A CHASSIS', es: 'GUÍA 2/5 · HAZ CLIC EN UN CHASIS' },
    title: { en: 'Step 1: The Spacecraft Skeleton (Chassis)', es: 'Paso 1: El Esqueleto de la Nave (Chasis)' },
    instruction: {
      en: 'Look at STEP 1 · CHASSIS on the left. It is the aluminum body where instruments fit. Click any size (1.5U, 2U, or CUSTOM) right now—I will detect your move and show you how the center hologram changes!',
      es: 'Mira el PASO 1 · CHASIS a la izquierda. Es el cuerpo de aluminio donde caben las cámaras. Haz clic ahora mismo en otro tamaño (1.5U, 2U o CUSTOM): detectaré tu movimiento y verás cómo cambia el holograma central.',
    },
  },
  {
    step: 2,
    targetZone: 'EPS',
    badge: { en: 'TOUR 3/5 · CLICK SOLAR ARRAYS', es: 'GUÍA 3/5 · ELIGE PANELES SOLARES' },
    title: { en: 'Solar Wings & Electrical Power (EPS)', es: 'Paneles Solares y Energía Eléctrica (EPS)' },
    instruction: {
      en: 'Great move! You saw the cube resize in the center. Now look at SOLAR ARRAYS / EPS below on the left. They generate electricity so your ship never dies in the dark like Icarus-1. Click any power system to deploy the wings!',
      es: '¡Bien hecho! ¿Viste cómo cambió el cubo en el centro? Ahora baja a PANELES SOLARES / EPS a la izquierda. Generan la electricidad para que tu nave no se apague como el Ícaro-1. ¡Haz clic en una opción para desplegar las alas!',
    },
  },
  {
    step: 3,
    targetZone: 'MISSION',
    badge: { en: 'TOUR 4/5 · PICK A SCIENCE MISSION', es: 'GUÍA 4/5 · ELIGE UNA MISIÓN A LA DERECHA' },
    title: { en: 'Step 2: Science Mission & Payload (Right Panel)', es: 'Paso 2: Misión Científica y Carga Útil (Derecha)' },
    instruction: {
      en: 'Look at those solar wings deployed in the hologram! Now look to the RIGHT panel under STEP 2 · MISSION. Picking a mission sets our target planet, science camera, and NASA budget. Click any mission card on the right!',
      es: '¡Mira cómo se desplegaron las alas en el centro! Ahora mira a la DERECHA en PASO 2 · MISIÓN. Elegir la misión define qué planeta investigaremos, qué cámara llevaremos y nuestro presupuesto. ¡Haz clic en una misión a la derecha!',
    },
  },
  {
    step: 4,
    targetZone: 'NEXT_LEVEL',
    badge: { en: 'TOUR 5/5 · READY FOR ORBIT!', es: 'GUÍA 5/5 · ¡LISTO PARA LA ÓRBITA!' },
    title: { en: 'First Blueprint Complete!', es: '¡Primer Plano en Servilleta Completado!' },
    instruction: {
      en: 'Outstanding work, Cadet {cadet}! You now know how the left controls, right mission cards, and center hologram work together. Click "NEXT LEVEL · 02" below the hologram to launch into Orbit!',
      es: '¡Excelente trabajo, Cadete {cadet}! Ya dominas los controles de la izquierda, las misiones de la derecha y el holograma central. Pulsa el botón brillante "SIGUIENTE NIVEL · 02" debajo del holograma para ir a la Órbita.',
    },
  },
];

export const SUBSYSTEM_TAB_GUIDE: Record<
  SubsystemCategory,
  {
    roleTitle: { en: string; es: string };
    whatItDoes: { en: string; es: string };
    connectionRule: { en: string; es: string };
  }
> = {
  PAYLOAD: {
    roleTitle: { en: 'THE EYES (SCIENCE)', es: 'LOS OJOS (CARGA CIENTÍFICA)' },
    whatItDoes: {
      en: 'Cameras, spectrometers, and radars that capture mission data.',
      es: 'Cámaras, espectrómetros y radares que capturan los datos científicos.',
    },
    connectionRule: {
      en: 'Consumes volume (U), power (W), and demands high-speed Telecom downlink.',
      es: 'Consume volumen (U), energía (W) y exige que Telecom pueda transmitir sus datos.',
    },
  },
  PROPULSION: {
    roleTitle: { en: 'THE MUSCLES (THRUST & ΔV)', es: 'LOS MÚSCULOS (EMPUJE Y ΔV)' },
    whatItDoes: {
      en: 'Engines that accelerate the spacecraft to reach and maintain its orbit.',
      es: 'Motores que aceleran la nave para alcanzar su destino y corregir su órbita.',
    },
    connectionRule: {
      en: 'Higher Isp saves propellant mass (Tsiolkovsky), leaving room for instruments.',
      es: 'Mayor eficiencia (Isp) ahorra peso de combustible y evita sobrecargar el cohete.',
    },
  },
  EPS: {
    roleTitle: { en: 'THE HEART (SOLAR & RTG POWER)', es: 'EL CORAZÓN (ENERGÍA Y BATERÍAS)' },
    whatItDoes: {
      en: 'Solar wings or nuclear RTGs plus batteries that keep systems alive in eclipse.',
      es: 'Paneles solares o núcleo RTG más baterías para sobrevivir en la sombra del eclipse.',
    },
    connectionRule: {
      en: 'In Jupiter (5.2 AU), sunlight drops to 3.7% (1/R²): only RTG or LILT arrays work.',
      es: 'En Júpiter (5.2 UA) el Sol cae al 3.7%: los paneles comunes fallan y necesitas RTG.',
    },
  },
  TELECOM: {
    roleTitle: { en: 'THE VOICE (RF / LASER LINK)', es: 'LA VOZ (RADIO Y ENLACE LÁSER)' },
    whatItDoes: {
      en: 'Transmitters and dishes that send telemetry across millions of kilometers.',
      es: 'Antenas que envían tus descubrimientos a las estaciones DSN en la Tierra.',
    },
    connectionRule: {
      en: 'High-gain X/Ka dishes or lasers require precise ADCS pointing to avoid losing signal.',
      es: 'Las antenas X/Ka o láser exigen giroscopios ADCS precisos o la señal se perderá.',
    },
  },
  THERMAL: {
    roleTitle: { en: 'THE SHIELD (HEAT & COLD)', es: 'EL ESCUDO TÉRMICO (FRÍO Y CALOR)' },
    whatItDoes: {
      en: 'Multi-layer insulation (MLI), heaters, and cryocoolers protecting electronics.',
      es: 'Mantas aislantes, calentadores y criorefrigeradores que evitan que la nave se congele.',
    },
    connectionRule: {
      en: 'Active heaters and cryocoolers draw continuous Watts from your EPS power budget.',
      es: 'Los calentadores y sistemas criogénicos consumen vatios continuos de tu energía EPS.',
    },
  },
  ADCS: {
    roleTitle: { en: 'THE INNER EAR (POINTING)', es: 'EL EQUILIBRIO (GIROSCOPIOS Y ESTRELLAS)' },
    whatItDoes: {
      en: 'Star trackers and reaction wheels that orient cameras and antennas.',
      es: 'Sensores de estrellas y ruedas de reacción que apuntan las cámaras y la antena.',
    },
    connectionRule: {
      en: 'Without fine pointing (0.02°), narrow Ka-band/laser beams miss Earth (-18 dB loss).',
      es: 'Sin apuntamiento fino, el haz de radio no acierta a la Tierra y pierdes -18 dB.',
    },
  },
  LAUNCH_VEHICLE: {
    roleTitle: { en: 'THE TITAN (ROCKET & FAIRING)', es: 'EL TITÁN (COHETE Y COFIA)' },
    whatItDoes: {
      en: 'Lifts your spacecraft from Earth and sets your maximum mass (kg) and fairing size (U).',
      es: 'Saca tu nave de la gravedad terrestre y define el peso (kg) y espacio (U) máximos.',
    },
    connectionRule: {
      en: 'If Wet Mass exceeds rocket capacity, the mission fails on the pad.',
      es: 'Si el peso total con combustible supera al cohete, no despegará de la plataforma.',
    },
  },
};

export const COMMANDER_PHASE_BEATS: Record<CMLPhase, NarrativePhaseBeat> = {
  CML_1: {
    phase: 'CML_1',
    beatCode: 'CML-01 · SERVILLETA',
    speaker: 'CMDR VEGA',
    defaultCinematicId: { cadet: 'ACT1_PROLOGUE', jpl: 'ACT2_PROLOGUE' },
    cadetGoal: {
      en: 'STEP-BY-STEP: 1) Pick Chassis size → 2) Choose Solar Wings → 3) Select Mission Goal.',
      es: 'TORNILLO A TORNILLO: 1) Elige el Chasis → 2) Ponle Alas Solares → 3) Elige tu Misión.',
    },
    jplSpec: {
      en: 'CML 1 STM: Trace science objective -> min data rate (kbps), 1/R² power & fairing envelope.',
      es: 'CML 1 STM: Trazabilidad ciencia -> tasa mínima (kbps), potencia 1/R² y envolvente de cofia.',
    },
    cadetScript: {
      en: 'Cadet {commander}, after losing Icarus-1 I promised to teach you bolt by bolt. Follow my guide to build {mission}.',
      es: 'Cadete {commander}, tras perder al Ícaro-1 prometí enseñarte tornillo por tornillo. Sigue mi guía para armar {mission}.',
    },
    jplScript: {
      en: 'Dir. Rostova: Chief Engineer {commander}, configure {mission} for deep-space radiation survival. Zero margin errors.',
      es: 'Dir. Rostova: Ingeniero Jefe {commander}, configure {mission} para sobrevivir a la radiación de Júpiter. Cero errores.',
    },
    screwSteps: [
      {
        stepNum: '1/3',
        controlLabel: { en: 'LEFT · CHASSIS (1.5U–CUSTOM)', es: 'IZQUIERDA · CHASIS (1.5U–CUSTOM)' },
        whatIsIt: {
          en: 'The aluminum skeleton measured in CubeSat Units (1U = 10×10×10 cm).',
          es: 'El esqueleto de aluminio medido en unidades CubeSat (1U = cubo de 10×10 cm).',
        },
        howItConnects: {
          en: 'Sets how many instruments fit inside. Watch the center hologram grow when you click!',
          es: 'Define cuántos instrumentos caben dentro. ¡Tócalo y mira cómo crece el holograma central!',
        },
      },
      {
        stepNum: '2/3',
        controlLabel: { en: 'LEFT · SOLAR ARRAYS / EPS', es: 'IZQUIERDA · PANELES SOLARES / EPS' },
        whatIsIt: {
          en: 'The wings or nuclear generator (RTG) that produce electricity in space.',
          es: 'Las alas solares o núcleo nuclear (RTG) que generan electricidad en el vacío.',
        },
        howItConnects: {
          en: 'Feeds Watts to all cameras and radios. In Jupiter, only RTG works!',
          es: 'Alimenta las cámaras y la radio. Al elegirlo verás desplegarse las alas en el centro.',
        },
      },
      {
        stepNum: '3/3',
        controlLabel: { en: 'RIGHT · SCIENCE MISSION', es: 'DERECHA · MISIÓN CIENTÍFICA' },
        whatIsIt: {
          en: 'The scientific goal that defines your budget ($M) and required camera/sensor.',
          es: 'El propósito de tu vuelo: define tu presupuesto ($M) y qué instrumento necesitas.',
        },
        howItConnects: {
          en: 'Links your spacecraft to a real NASA benchmark (LEO, Moon, Mars, or Europa).',
          es: 'Conecta tu nave con un destino real y fija la meta para ganar las 3 estrellas.',
        },
      },
    ],
  },
  CML_2: {
    phase: 'CML_2',
    beatCode: 'CML-02 · ÓRBITA',
    speaker: 'CMDR VEGA',
    defaultCinematicId: { cadet: 'ACT1_T_1_2', jpl: 'ACT2_T_1_2' },
    cadetGoal: {
      en: 'STEP-BY-STEP: 1) Pick Target Planet (Right) → 2) Drag Altitude/Inclination (Left) → 3) Pick Ground Dish (Right).',
      es: 'TORNILLO A TORNILLO: 1) Elige Destino (Derecha) → 2) Mueve Altitud e Inclinación (Izquierda) → 3) Elige Antena (Derecha).',
    },
    jplSpec: {
      en: 'CML 2 ASTRODYNAMICS: v = √(μ/a), T = 2π√(a³/μ) · FSPL ∝ (4πdf/c)² · DSN 810-005.',
      es: 'CML 2 ASTRODINÁMICA: v = √(μ/a), T = 2π√(a³/μ) · FSPL ∝ (4πdf/c)² · DSN 810-005.',
    },
    cadetScript: {
      en: 'Cadet {commander}, if we fly too low, atmospheric drag will burn {mission} like a shooting star. Use the left sliders to set altitude and the right panel to pick our Ground Dish.',
      es: 'Cadete {commander}, si calculas mal la altura, la atmósfera frenará a {mission} y arderá como estrella fugaz. Ajusta la altitud a la izquierda y la antena terrena a la derecha.',
    },
    jplScript: {
      en: 'Dir. Rostova: Engineer {commander}, Jupiter gravity well demands 6,800 m/s ΔV and a 70m DSN Goldstone link.',
      es: 'Dir. Rostova: Ingeniero {commander}, el pozo gravitatorio joviano exige 6,800 m/s de ΔV y antena DSN de 70m.',
    },
    screwSteps: [
      {
        stepNum: '1/3',
        controlLabel: { en: 'RIGHT · TARGET ORBIT', es: 'DERECHA · DESTINO ORBITAL' },
        whatIsIt: {
          en: 'Where your spacecraft flies (Earth LEO/GEO, Moon, L2, Mars, or Jupiter).',
          es: 'El cuerpo celeste u órbita donde operará tu sonda (Tierra, Luna, Marte o Júpiter).',
        },
        howItConnects: {
          en: 'Further destinations demand much more fuel speed (ΔV) and lose sunlight (1/R²).',
          es: 'Cuanto más lejos viajes, más velocidad (ΔV) y potencia de radio exigirá el motor físico.',
        },
      },
      {
        stepNum: '2/3',
        controlLabel: { en: 'LEFT · ALTITUDE & INCLINATION', es: 'IZQUIERDA · ALTITUD E INCLINACIÓN' },
        whatIsIt: {
          en: 'How high (km) and at what tilt angle (°) the satellite circles the planet.',
          es: 'Qué tan alto (km) y con qué ángulo de inclinación (°) gira tu nave alrededor del planeta.',
        },
        howItConnects: {
          en: 'Drag the sliders and watch the orbital ring tilt and change speed in the center!',
          es: 'Mueve las barras y observa cómo se inclina el anillo orbital y cambia el periodo en vivo.',
        },
      },
      {
        stepNum: '3/3',
        controlLabel: { en: 'RIGHT · GROUND NETWORK', es: 'DERECHA · ESTACIÓN TERRENA' },
        whatIsIt: {
          en: 'The giant parabolic antennas on Earth (NSN or DSN 34m/70m) that listen to your ship.',
          es: 'Las antenas gigantes en la Tierra (Comercial, NSN o DSN 70m) que reciben tu señal.',
        },
        howItConnects: {
          en: 'Deep space missions fail without DSN 34m/70m dishes to catch weak radio signals.',
          es: 'Si el haz punteado en el centro está rojo, elige una estación DSN más potente.',
        },
      },
    ],
  },
  CML_3: {
    phase: 'CML_3',
    beatCode: 'CML-03 · TRADE SPACE',
    speaker: 'CMDR VEGA',
    defaultCinematicId: { cadet: 'ACT1_T_2_3', jpl: 'ACT2_T_2_3' },
    cadetGoal: {
      en: 'STEP-BY-STEP: Click tabs 01–07 on the left, equip parts on the right & keep 0 conflicts.',
      es: 'TORNILLO A TORNILLO: Haz clic del 01 al 07 a la izquierda, equipa piezas a la derecha y mantén 0 conflictos.',
    },
    jplSpec: {
      en: 'CML 3 SWaP-C: m_wet = (m_CBE + m_MGA) · e^(ΔV / (Isp·g₀)) · P_gen(1/R²) ≥ 35% margin.',
      es: 'CML 3 SWaP-C: m_wet = (m_CBE + m_MGA) · e^(ΔV / (Isp·g₀)) · P_gen(1/R²) ≥ 35% margen.',
    },
    cadetScript: {
      en: 'In the -150°C eclipse, {commander}, you cannot carry every toy. Click each of the 7 modules on the left and pick the parts marked "CADET PICK" on the right.',
      es: 'En el frío de -150°C del eclipse, {commander}, hay que saber renunciar. Recorre los 7 módulos a la izquierda y elige las piezas con "PISTA CADETE" a la derecha.',
    },
    jplScript: {
      en: 'Vega (Sec. Channel): Partner, remember Icarus-1 failed in a solar storm. Lock RTG power and Rad-Hard margins!',
      es: 'Vega (Canal Sec.): Socio, recuerda que el Ícaro-1 cayó por energía. ¡Asegura el RTG y cero conflictos!',
    },
    screwSteps: [
      {
        stepNum: '1/3',
        controlLabel: { en: 'LEFT · 7 SUBSYSTEM TABS', es: 'IZQUIERDA · LOS 7 MÓDULOS DE LA NAVE' },
        whatIsIt: {
          en: 'The 7 vital organs: Payload, Propulsion, EPS, Telecom, Thermal, ADCS, and Rocket.',
          es: 'Los 7 órganos vitales: Carga Útil, Propulsión, Energía, Radio, Térmico, ADCS y Cohete.',
        },
        howItConnects: {
          en: 'Click each tab (01 to 07) to inspect and equip components on the right.',
          es: 'Haz clic del 01 al 07 a la izquierda; cada pieza que elijas se dibuja en el holograma.',
        },
      },
      {
        stepNum: '2/3',
        controlLabel: { en: 'RIGHT · COMPONENT CARDS', es: 'DERECHA · TARJETAS DE PIEZAS' },
        whatIsIt: {
          en: 'Real NASA hardware showing weight (KG), power (+W/-W), size (U), and cost ($M).',
          es: 'Piezas reales de la NASA con su peso (KG), energía (+W/-W), tamaño (U) y precio ($M).',
        },
        howItConnects: {
          en: 'Hover any part to preview how it changes your margins before clicking.',
          es: 'En Modo Cadete verás la etiqueta "PISTA CADETE" en las piezas ideales para tu órbita.',
        },
      },
      {
        stepNum: '3/3',
        controlLabel: { en: 'LEFT · RESOURCE BARS & CONFLICTS', es: 'IZQUIERDA · BARRAS Y 0 CONFLICTOS' },
        whatIsIt: {
          en: 'Live gauges checking that Mass, Power, Budget, and RF Link stay in the green.',
          es: 'Lecturas vivas que vigilan que Peso, Energía, Presupuesto y Radio no entren en rojo.',
        },
        howItConnects: {
          en: 'Keep CONFLICTS: 0 and margins ≥35% so your ship survives the vacuum.',
          es: 'Mantén CONFLICTOS: 0 y las barras en cian para ganar las 3 estrellas del nivel.',
        },
      },
    ],
  },
  CML_4: {
    phase: 'CML_4',
    beatCode: 'CML-04 · DISEÑO DE PUNTO',
    speaker: 'CMDR VEGA',
    defaultCinematicId: { cadet: 'ACT1_T_3_4', jpl: 'ACT2_T_3_4' },
    cadetGoal: {
      en: 'STEP-BY-STEP: 1) Adjust Tank Sliders (Left) → 2) Watch Rocket Limit (Center) → 3) Click Commit DB (Right).',
      es: 'TORNILLO A TORNILLO: 1) Mueve los Tanques (Izquierda) → 2) Vigila el Cohete (Centro) → 3) Pulsa Sincronizar BD (Derecha).',
    },
    jplSpec: {
      en: 'CML 4 CONCURRENCY: Lock CBE + MGA propellant mass fraction & resolve cross-subsystem conflicts.',
      es: 'CML 4 CONCURRENCIA: Fija fracción de propelente CBE + MGA y cierra conflictos concurrentes.',
    },
    cadetScript: {
      en: 'Every drop of hydrazine counts, {commander}. Adjust the 4 tank sliders on the left without turning the center rocket red, then click "COMMIT & VALIDATE" on the right.',
      es: 'Cada gota de hidracina cuenta, {commander}. Ajusta los 4 tanques a la izquierda sin que el cohete central pase a rojo, y luego pulsa "SINCRONIZAR BD" a la derecha.',
    },
    jplScript: {
      en: 'Dir. Rostova: Engineer {commander}, verify propellant mass fraction and lock Concurrent Engineering baseline.',
      es: 'Dir. Rostova: Ingeniero {commander}, verifique la masa húmeda frente a la cofia y congele la base de datos.',
    },
    screwSteps: [
      {
        stepNum: '1/3',
        controlLabel: { en: 'LEFT · FUEL & OXIDIZER SLIDERS', es: 'IZQUIERDA · TANQUES DE COMBUSTIBLE Y OXIDANTE' },
        whatIsIt: {
          en: 'Liquid propellant and oxidizer levels that feed your thruster in flight.',
          es: 'Los niveles de líquido impulsor y oxidante que alimentan el motor en el espacio.',
        },
        howItConnects: {
          en: 'More fuel gives more safety, but adds heavy kilograms to the launch rocket!',
          es: 'Al moverlos verás subir el líquido en los 4 tanques centrales y cambiar el peso total.',
        },
      },
      {
        stepNum: '2/3',
        controlLabel: { en: 'CENTER · ROCKET ENVELOPE', es: 'CENTRO · SILUETA DEL COHETE Y TANQUES' },
        whatIsIt: {
          en: 'Visual gauge comparing your Wet Mass (ship + fuel) against the rocket’s limit.',
          es: 'Comparación visual entre el peso de tu nave llena y lo que soporta el cohete.',
        },
        howItConnects: {
          en: 'If the rocket flashes red (#FF4D6D), lower tank fill % or upgrade your launcher.',
          es: 'Si el cohete parpadea en rojo, reduce el % de llenado o elige un cohete más grande.',
        },
      },
      {
        stepNum: '3/3',
        controlLabel: { en: 'RIGHT · COMMIT & VALIDATE DB', es: 'DERECHA · BOTÓN SINCRONIZAR BD' },
        whatIsIt: {
          en: 'Saves your engineering revision and checks for any hidden subsystem clashes.',
          es: 'Guarda la revisión oficial de tu plano y verifica que todas las piezas sean compatibles.',
        },
        howItConnects: {
          en: 'Clears the baseline so the NASA review board can inspect your ship in Level 05.',
          es: 'Deja el plano limpio ("CERO CONFLICTOS") listo para el juicio de misión en el Nivel 05.',
        },
      },
    ],
  },
  CML_5: {
    phase: 'CML_5',
    beatCode: 'CML-05 · V&V / MCR',
    speaker: 'CMDR VEGA',
    defaultCinematicId: { cadet: 'ACT1_T_4_5', jpl: 'ACT2_T_4_5' },
    cadetGoal: {
      en: 'STEP-BY-STEP: 1) Check 5 V&V Tests (Left) → 2) Verify ≥35% Margins → 3) Hold Fingerprint Button (Right) to Launch!',
      es: 'TORNILLO A TORNILLO: 1) Marca las 5 Pruebas V&V (Izquierda) → 2) Revisa Margen ≥35% → 3) Mantén pulsada la Huella (Derecha).',
    },
    jplSpec: {
      en: 'CML 5 MCR GATE: Margin ≥ 35% (Dry Mass & EPS) + NASA-STD-5001B (1.40×) + GSFC Rule 1.05/2.13.',
      es: 'CML 5 MCR GATE: Margen ≥ 35% (Masa Seca y EPS) + NASA-STD-5001B (1.40×) + GSFC Regla 1.05/2.13.',
    },
    cadetScript: {
      en: 'Inspectors are in the glass gallery, {commander}. Check all 5 V&V boxes on the left, set the RF timer ≥30 min, and hold the fingerprint button on the right to sign the MCR!',
      es: 'Los inspectores están en la galería de cristal, {commander}. Marca las 5 casillas V&V a la izquierda, pon el timer RF en ≥30 min y mantén presionado el botón de huella a la derecha para despegar.',
    },
    jplScript: {
      en: 'Dir. Rostova: The NASA board is ready to veto if margins dip below 35%. Defend your telemetry, {commander}.',
      es: 'Dir. Rostova: La junta de la NASA vetará el rescate si el margen baja del 35%. Defienda su diseño, {commander}.',
    },
    screwSteps: [
      {
        stepNum: '1/3',
        controlLabel: { en: 'LEFT · 5 ENVIRONMENTAL V&V TESTS', es: 'IZQUIERDA · LAS 5 PRUEBAS AMBIENTALES V&V' },
        whatIsIt: {
          en: 'Shaker vibration, thermal vacuum (TVAC), battery safety, RF timer (≥30m), and RBF pin.',
          es: 'Pruebas en Tierra: Vibración de despegue, Vacío Térmico, Baterías, Timer RF (≥30m) y Pin RBF.',
        },
        howItConnects: {
          en: 'Check all 5 boxes and set the slider ≥30 min so the satellite survives launch shaking.',
          es: 'Marca las 5 casillas y pon el deslizador en ≥30 min para certificar que resistirá el cohete.',
        },
      },
      {
        stepNum: '2/3',
        controlLabel: { en: 'CENTER & LEFT · QUICK MARGIN FIXES', es: 'CENTRO E IZQUIERDA · CORRECCIÓN DE MÁRGENES' },
        whatIsIt: {
          en: 'Inspection pins on the hologram and 1-click fixes if Mass, Power, or RF are low.',
          es: 'Pines sobre el holograma y botones de corrección rápida si falta margen del 35%.',
        },
        howItConnects: {
          en: 'NASA requires ≥35% safety reserve in Mass and Power before clearing a mission.',
          es: 'Si ves alguna tarjeta amarilla o roja, pulsa el botón de corrección rápida para subir a verde.',
        },
      },
      {
        stepNum: '3/3',
        controlLabel: { en: 'RIGHT · HOLD TO SIGN MCR', es: 'DERECHA · MANTENER PULSADO PARA FIRMAR MCR' },
        whatIsIt: {
          en: 'Your biometric Flight Director signature authorizing rocket ignition.',
          es: 'Tu huella y firma oficial como Arquitecto de Misión autorizando el despegue.',
        },
        howItConnects: {
          en: 'Press and hold the fingerprint button until it reaches 100% to launch Level 06!',
          es: 'Mantén presionado el botón de huella hasta llegar al 100% para ir a la torre de lanzamiento.',
        },
      },
    ],
  },
  SIMULATION: {
    phase: 'SIMULATION',
    beatCode: 'FASE E · LANZAMIENTO Y CRISIS',
    speaker: 'CMDR VEGA',
    defaultCinematicId: { cadet: 'ACT1_T_5_6', jpl: 'ACT2_T_5_6' },
    cadetGoal: {
      en: 'STEP-BY-STEP: 1) Watch Ascent (Center) → 2) Solve 3 Crises (Right) → 3) Trigger Story Finale (Bottom Right)!',
      es: 'TORNILLO A TORNILLO: 1) Mira el Ascenso (Centro) → 2) Resuelve las 3 Crisis (Derecha) → 3) ¡Abre el Desenlace (Derecha Abajo)!',
    },
    jplSpec: {
      en: 'PHASE E OPS: Global P = 0.50·S + 0.30·M + 0.20·B · Real-time Jovian radiation & anomaly triage.',
      es: 'FASE E OPS: Score P = 0.50·S + 0.30·M + 0.20·B · Gestión de anomalías y cinturón de radiación.',
    },
    cadetScript: {
      en: 'Engines smoking in Florida, {commander}! Resolve the 3 crises on the right panel, then click the red OMEGA ALERT button to face the next chapter!',
      es: '¡Motores humeando en Florida, {commander}! Resuelve las 3 crisis en el panel derecho y luego pulsa el botón rojo de ALERTA OMEGA para vivir el giro hacia JPL.',
    },
    jplScript: {
      en: 'Vega & Rostova: Entering Europa radiation belt! Resolve all 3 critical anomalies on the right to lock onto the Icarus-1 beacon!',
      es: 'Vega y Rostova: ¡Entrando al cinturón de radiación de Europa! Resuelve las 3 anomalías a la derecha y pulsa BALIZA ÍCARO-1 para el gran final.',
    },
    screwSteps: [
      {
        stepNum: '1/3',
        controlLabel: { en: 'CENTER · LIVE LAUNCH & ORBIT STAGE', es: 'CENTRO · SIMULACIÓN DE ASCENSO Y ÓRBITA' },
        whatIsIt: {
          en: 'Real-time rocket launch, fairing separation, stress heatmap, and telemetry strip charts.',
          es: 'El despegue en vivo del cohete, separación de cofia, mapa de estrés y telemetría.',
        },
        howItConnects: {
          en: 'If a structural or power failure occurs, use the 1-click Quick Fix button in the stage.',
          es: 'Muestra cómo responde tu diseño real al empuje, vibración y vacío espacial.',
        },
      },
      {
        stepNum: '2/3',
        controlLabel: { en: 'RIGHT · 3 ORBITAL CRISES', es: 'DERECHA · LAS 3 CRISIS EN PLENO VUELO' },
        whatIsIt: {
          en: 'Real emergencies (solar storm, eclipse freeze, Ka-band rain fade) requiring your command.',
          es: 'Emergencias reales en el espacio (tormenta solar, frío extremo, lluvia en antena).',
        },
        howItConnects: {
          en: 'Pick the optimal engineering response on all 3 cards to maximize science & survival.',
          es: 'Elige la decisión correcta en cada una de las 3 tarjetas para salvar la nave y subir a Grado S.',
        },
      },
      {
        stepNum: '3/3',
        controlLabel: { en: 'RIGHT · NEXT CHAPTER & CERTIFICATE', es: 'DERECHA · CLÍMAX DE HISTORIA Y CERTIFICADO' },
        whatIsIt: {
          en: 'Unlocks the next Story Act (JPL Emergency or Icarus-1 Finale) and your official medal report.',
          es: 'Desbloquea el desenlace cinematográfico de tu capítulo y tu Certificado de la NASA.',
        },
        howItConnects: {
          en: 'Completing Act I promotes you to JPL Chief Engineer; completing Act II unlocks Infinite Sandbox!',
          es: 'En Acto I te asciende a Ingeniero JPL; en Acto II rescata al Ícaro-1 y abre el Modo Libre.',
        },
      },
    ],
  },
};

export const STORY_CINEMATICS: Record<StoryCinematicId, StoryCinematicScene> = {
  ACT1_PROLOGUE: {
    id: 'ACT1_PROLOGUE',
    actLabel: {
      en: 'ACT I · THE CADET — LEARNING TO LOOK AT THE STARS',
      es: 'ACTO I · EL CADETE — APRENDIENDO A MIRAR LAS ESTRELLAS',
    },
    title: {
      en: 'The Ghost of Cape Canaveral',
      es: 'El Fantasma de Cabo Cañaveral',
    },
    location: {
      en: 'HANGAR 4 · CAPE CANAVERAL, FLORIDA · T+4 YEARS AFTER ICARUS-1',
      es: 'HANGAR 4 · CABO CAÑAVERAL, FLORIDA · 4 AÑOS DESPUÉS DEL ÍCARO-1',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Tsiolkovsky Rocket Equation (ΔV = Isp·g₀·ln(m₀/mf)) & Solar Storm EPS Balance.',
      es: 'CIENCIA REAL: Ecuación de Tsiolkovsky (ΔV = Isp·g₀·ln(m₀/mf)) y Balance de Energía en Tormenta Solar.',
    },
    requiresCadetNameInput: true,
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: { en: 'MISSION ARCHIVE // PROJECT ICARUS-26', es: 'ARCHIVO DE MISIÓN // PROYECTO ÍCARO-26' },
        pose: 'HANGAR_PHOTO',
        dialogue: {
          en: 'Four years ago, mission Icarus-1 was lost in silence on its way to Jupiter with four astronauts aboard due to a power balance failure during a solar storm. Commander Frank Vega was at Mission Control when the monitors went dark. He promised never to send anyone again without first forging infallible machines.',
          es: 'Hace cuatro años, la misión Ícaro-1 se perdió en silencio camino a Júpiter con cuatro astronautas a bordo debido a un fallo en el balance de energía durante una tormenta solar. El Comandante Frank Vega estaba en la Tierra cuando los monitores se apagaron. Prometió no volver a enviar a nadie sin antes forjar máquinas infalibles.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · FLIGHT MENTOR', es: 'COMANDANTE FRANK VEGA · MENTOR DE VUELO' },
        pose: 'VEGA_WINDOW_COIN',
        dialogue: {
          en: 'Do you know what the difference is between a dream and a tragedy, {cadet}? A few kilograms of thrust. In school they teach you that space is silent and beautiful. A lie. Space is a freezing beast waiting for you to make one calculation error to devour you. I lost my best friends up there because we trusted blueprints that had no margin for error.',
          es: '¿Sabes cuál es la diferencia entre un sueño y una tragedia, {cadet}? Unos pocos kilogramos de empuje. En la escuela te enseñan que el espacio es silencioso y hermoso. Mentira. El espacio es una bestia helada esperando que cometas un error de cálculo para devorarte. Perdí a mis mejores amigos allá arriba porque confiamos en planos que no tenían margen de error.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · FLIGHT MENTOR', es: 'COMANDANTE FRANK VEGA · MENTOR DE VUELO' },
        pose: 'VEGA_IGNITE_CONSOLE',
        dialogue: {
          en: 'You have something they did not have: a second chance for humanity. I am not going to leave you alone. I will teach you everything I know, step by step, bolt by bolt. Are you ready to get your hands dirty, Cadet {cadet}? Welcome aboard.',
          es: 'Tú tienes algo que ellos no tenían: una segunda oportunidad para la humanidad. No te voy a dejar solo. Te enseñaré todo lo que sé, paso a paso, tornillo a tornillo. ¿Estás listo para ensuciarte las manos, Cadete {cadet}? Bienvenido a bordo.',
        },
      },
    ],
  },

  ACT1_T_1_2: {
    id: 'ACT1_T_1_2',
    actLabel: {
      en: 'ACT I · LEVEL 01 ➔ LEVEL 02',
      es: 'ACTO I · NIVEL 01 ➔ NIVEL 02',
    },
    title: {
      en: 'From the Napkin to Orbit',
      es: 'De la Servilleta a la Órbita',
    },
    location: {
      en: 'HOLOGRAPHIC DESIGN TABLE · ORBITAL INJECTION PREP',
      es: 'MESA HOLOGRÁFICA · PREPARACIÓN DE INYECCIÓN ORBITAL',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Atmospheric Drag & Orbital Decay below 250 km in Low Earth Orbit (LEO).',
      es: 'CIENCIA REAL: Arrastre Atmosférico y Decaimiento Orbital por debajo de 250 km en LEO.',
    },
    slides: [
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA', es: 'COMANDANTE FRANK VEGA' },
        pose: 'CUBESAT_ORBIT_DANCE',
        dialogue: {
          en: 'Look at her. She looks fragile, right? A cube of just a few centimeters. But inside that chassis go the eyes of millions of people looking at the sky tonight with fear of the future. Well done, kid. Now comes the trial by fire: we have to take her out of the cradle and make her dance around the Earth. If you miscalculate the altitude, the atmosphere will brake her and she will burn like a shooting star before transmitting her first datum. Plot the orbit—do not take your eyes off the horizon.',
          es: 'Mírala. Parece frágil, ¿verdad? Un cubo de unos cuantos centímetros. Pero dentro de ese chasis van los ojos de millones de personas que miran al cielo esta noche con miedo al futuro. Bien hecho, chico. Pero ahora viene la prueba de fuego: tenemos que sacarla de la cuna y ponerla a bailar alrededor de la Tierra. Si calculas mal la altura, la atmósfera la frenará y arderá como una estrella fugaz antes de transmitir su primer dato. Traza la órbita, no apartes los ojos del horizonte.',
        },
      },
    ],
  },

  ACT1_T_2_3: {
    id: 'ACT1_T_2_3',
    actLabel: {
      en: 'ACT I · LEVEL 02 ➔ LEVEL 03',
      es: 'ACTO I · NIVEL 02 ➔ NIVEL 03',
    },
    title: {
      en: 'Into the Shadow: Orbit to Trade Space',
      es: 'De la Órbita al Trade Space',
    },
    location: {
      en: 'EARTH UMBRA CONE · -150°C THERMAL SHADOW',
      es: 'CONO DE SOMBRA TERRESTRE · ECLIPSE A -150 °C',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Orbital Eclipse Fraction & SWaP-C Trade-offs (0 W solar generation in shadow).',
      es: 'CIENCIA REAL: Fracción de Eclipse Orbital y Compromisos SWaP-C (0 W solares en oscuridad).',
    },
    slides: [
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · COMMS CHANNEL', es: 'COMANDANTE FRANK VEGA · RADIO DE COMBATE' },
        pose: 'ECLIPSE_SHADOW_FREEZE',
        dialogue: {
          en: 'Look at the screen! She just entered the eclipse. It is minus one hundred and fifty degrees out there. Solar panels are useless in the dark; your ship is now living off its own heart, its batteries. Do you see why we cannot pack every toy we want? In space you have to give things up if you want to survive. More weight means less speed; more instruments mean running out of light. Choose what we sacrifice, {cadet}. It is the hardest decision an engineer makes.',
          es: '¡Mira la pantalla! Acaba de entrar en el eclipse. Hace un frío de menos ciento cincuenta grados ahí afuera. Los paneles solares no sirven de nada en la oscuridad; tu nave ahora está viviendo de su propio corazón, de sus baterías. ¿Ves por qué no podemos meterle todos los juguetes que queremos? En el espacio hay que renunciar a cosas si quieres sobrevivir. Más peso significa menos velocidad; más instrumentos significa quedarte sin luz. Elige qué sacrificamos, {cadet}. Es la decisión más dura de un ingeniero.',
        },
      },
    ],
  },

  ACT1_T_3_4: {
    id: 'ACT1_T_3_4',
    actLabel: {
      en: 'ACT I · LEVEL 03 ➔ LEVEL 04',
      es: 'ACTO I · NIVEL 03 ➔ NIVEL 04',
    },
    title: {
      en: 'From Trade Space to the Propellant Tanks',
      es: 'Del Trade Space a los Tanques',
    },
    location: {
      en: 'PROPELLANT LOADING BAY · HYDRAZINE & OXIDIZER MANIFOLD',
      es: 'PLATAFORMA DE COMBUSTIBLE · TANQUES DE PROPELENTE Y OXIDANTE',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Bipropellant / Hydrazine Mass Fraction & Launch Vehicle Fairing Capacity.',
      es: 'CIENCIA REAL: Fracción de Masa de Hidracina/Oxidante y Límite de Carga del Cohete.',
    },
    slides: [
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA', es: 'COMANDANTE FRANK VEGA' },
        pose: 'TANKS_RUNNER_HEART',
        dialogue: {
          en: 'Steady hand. You knew when to let go in time. Now let us move to the propellant bay. Look at those propellant and oxidizer tanks. They are like a runner’s chest: if you pack too much air or liquid, the rocket becomes clumsy and heavy. Every drop of hydrazine counts. If we exceed the mass cap, the Falcon 9 will not even lift off the ground. Adjust the levels with a surgeon’s precision. I trust your hand, {cadet}.',
          es: 'Buen pulso. Supiste renunciar a tiempo. Ahora vamos a la plataforma de combustible. Mira esos tanques de propelente y oxidante. Son como el pecho de un corredor: si le metes demasiado aire o líquido, el cohete se vuelve torpe y pesado. Cada gota de hidracina cuenta. Si nos pasamos de masa, el Falcon 9 ni siquiera despegará del suelo. Ajusta los niveles con precisión de cirujano. Confío en tu mano, {cadet}.',
        },
      },
    ],
  },

  ACT1_T_4_5: {
    id: 'ACT1_T_4_5',
    actLabel: {
      en: 'ACT I · LEVEL 04 ➔ LEVEL 05',
      es: 'ACTO I · NIVEL 04 ➔ NIVEL 05',
    },
    title: {
      en: 'Mission Judgment: V&V and MCR Gate',
      es: 'De los Tanques al V&V / Juicio de Misión',
    },
    location: {
      en: 'MCR AUDITORIUM · GLASS OBSERVATION GALLERY',
      es: 'SALA DE SIMULACIÓN MCR · GALERÍA DE CRISTAL',
    },
    scienceFact: {
      en: 'REAL SCIENCE: NASA SP-2016-6105 MCR Gate (≥35% Mass/Power Margin) & Environmental V&V.',
      es: 'CIENCIA REAL: Estándar NASA SP-2016-6105 MCR (Margen ≥35%) y Verificación Ambiental V&V.',
    },
    slides: [
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA', es: 'COMANDANTE FRANK VEGA' },
        pose: 'MCR_GLASS_GALLERY',
        dialogue: {
          en: 'The mission directors and inspectors just walked into the glass gallery. They are here looking for any flaw to cancel our project. They want to see if this cadet truly knows what they are doing or if it was a stroke of luck. Listen to me closely, {cadet}: I already checked your numbers and I believe in you. Now stand up straight, activate the verification lasers, and prove to them this spacecraft has no cracks. This is your graduation.',
          es: 'Los directores de misión y los inspectores acaban de entrar a la galería de cristal. Vienen a buscar cualquier fallo para cancelar nuestro proyecto. Quieren ver si este cadete de verdad sabe lo que hace o si fue un golpe de suerte. Escúchame bien, {cadet}: yo ya revisé tus números y creo en ti. Ahora párate derecho, activa los láseres de verificación y demuéstrales que esta nave no tiene fisuras. Esta es tu graduación.',
        },
      },
    ],
  },

  ACT1_T_5_6: {
    id: 'ACT1_T_5_6',
    actLabel: {
      en: 'ACT I · LEVEL 05 ➔ LEVEL 06',
      es: 'ACTO I · NIVEL 05 ➔ NIVEL 06',
    },
    title: {
      en: 'Go For Launch: The Architect’s Flight',
      es: 'Hacia el Lanzamiento del Cadete: GO FOR LAUNCH',
    },
    location: {
      en: 'LAUNCH COMPLEX 39A · FLORIDA · T-00:30 SECONDS',
      es: 'COMPLEJO DE LANZAMIENTO 39A · FLORIDA · T-00:30 SEGUNDOS',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Max-Q Aerodynamic Stress, Fairing Separation & Real-Time Anomaly Triage.',
      es: 'CIENCIA REAL: Estrés Aerodinámico Max-Q, Separación de Cofia y Gestión de Crisis en Vivo.',
    },
    slides: [
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · LAUNCH CONTROL', es: 'COMANDANTE FRANK VEGA · CONTROL DE LANZAMIENTO' },
        pose: 'PAD39A_ENGINES_STEAM',
        dialogue: {
          en: 'You did it... My God, you left them speechless. Look at the launch tower in Florida, the engines are steaming. Thirty seconds to ignition. No matter what happens up there today: you are no longer a student, {cadet}. You are the architect of this spacecraft. Sit at the main console... and bring her home.',
          es: 'Lo hiciste... Dios mío, los dejaste sin palabras. Mira la torre de lanzamiento en Florida, los motores están humeando. Treinta segundos para ignición. No importa lo que pase allá arriba hoy: ya no eres un estudiante, {cadet}. Eres el arquitecto de esta nave. Siéntate en la consola principal... y llévala a casa.',
        },
      },
    ],
  },

  ACT1_CLIMAX_JPL_TWIST: {
    id: 'ACT1_CLIMAX_JPL_TWIST',
    actLabel: {
      en: 'CLIMAX OF ACT I & THE TURN TOWARD JPL',
      es: 'CLÍMAX DEL ACTO I & EL GIRO HACIA JPL',
    },
    title: {
      en: 'Signal from Europa: The Icarus-1 Beacon',
      es: 'Señal desde Europa: La Baliza del Ícaro-1',
    },
    location: {
      en: 'DSN GOLDSTONE DEEP SPACE LINK // EUROPA ORBIT (5.2 AU)',
      es: 'ENLACE PROFUNDO DSN GOLDSTONE // ÓRBITA DE EUROPA, JÚPITER (5.2 UA)',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Jovian Ionizing Radiation Belt & 70m DSN Goldstone Deep Space Telemetry.',
      es: 'CIENCIA REAL: Cinturón de Radiación Ionizante de Júpiter y Antena DSN Goldstone de 70m.',
    },
    alertBanner: 'INCOMING ENCRYPTED TRANSMISSION // LEVEL-OMEGA // JET PROPULSION LABORATORY',
    requiresEngineerNameInput: true,
    slides: [
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · EMERGENCY CHANNEL', es: 'COMANDANTE FRANK VEGA · CANAL DE EMERGENCIA' },
        pose: 'OMEGA_SIREN_EUROPA',
        dialogue: {
          en: 'It cannot be... {cadet}, look at this. DSN Goldstone just picked up an intermittent distress signal coming from the orbit of Europa, at Jupiter. It is the emergency beacon of Icarus-1! They are still alive... or the ship is still trying to communicate after four years. But the Jovian radiation will fry any commercial probe in minutes.',
          es: 'No puede ser... {cadet}, mira esto. DSN Goldstone acaba de captar una señal de socorro intermitente proveniente de la órbita de Europa, en Júpiter. ¡Es la baliza de emergencia del Ícaro-1! Siguen vivos... o la nave sigue intentando comunicarse después de cuatro años. Pero la radiación joviana freirá cualquier sonda comercial en minutos.',
        },
      },
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · NASA JPL PASADENA', es: 'DIRECTORA ELENA ROSTOVA · NASA JPL PASADENA' },
        pose: 'ROSTOVA_TRANSFER_CREDENTIAL',
        dialogue: {
          en: 'Commander Vega, turn off the celebrations. We need the best systems designer you have on that base. The interplanetary transfer window to Jupiter opens in 90 hours. If we fail, the Icarus signal will be lost forever in the radiation. {cadet}, take off your cadet patches. I am transferring Chief Systems Engineer credentials to you. Tonight we work to save lives.',
          es: 'Comandante Vega, apague las celebraciones. Necesitamos al mejor diseñador de sistemas que tenga en esa base. La ventana de transferencia interplanetaria a Júpiter se abre en 90 horas. Si fallamos, la señal del Ícaro se perderá para siempre en la radiación. {cadet}, quítese los parches de cadete. Le transfiero las credenciales de Ingeniero Jefe de Sistemas. Esta noche trabajamos para salvar vidas.',
        },
      },
    ],
  },

  ACT2_PROLOGUE: {
    id: 'ACT2_PROLOGUE',
    actLabel: {
      en: 'ACT II · THE JPL ENGINEER — THE PRICE OF THE VOID',
      es: 'ACTO II · EL INGENIERO JPL — EL PRECIO DEL VACÍO',
    },
    title: {
      en: 'Pasadena Mission Control',
      es: 'Control de Misiones JPL en Pasadena',
    },
    location: {
      en: 'JET PROPULSION LABORATORY · PASADENA, CA · T-90 HOURS TO WINDOW',
      es: 'JET PROPULSION LABORATORY · PASADENA, CALIFORNIA · T-90 HORAS PARA VENTANA',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Free-Space Path Loss (-280 dB at 5.2 AU) & Shannon Eb/N0 Threshold.',
      es: 'CIENCIA REAL: Pérdida en Espacio Libre (-280 dB a 5.2 UA) y Umbral Eb/N0 de Shannon.',
    },
    slides: [
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · JPL FLIGHT DIRECTOR', es: 'DIRECTORA ELENA ROSTOVA · DIRECTORA DE VUELO JPL' },
        pose: 'JPL_PASADENA_CONTROL',
        dialogue: {
          en: 'There are no pretty metaphors about mountain backpacks here, Engineer {engineer}. At 600 million kilometers from Earth, a 0.1 decibel error in the radio link means data will be lost in cosmic noise. Vega told me you have talent. I only believe in what withstands the laws of thermodynamics. Design a Europa-class deep space probe. No concessions. No excuses.',
          es: 'Aquí no hay metáforas bonitas sobre mochilas de montaña, Ingeniero {engineer}. A 600 millones de kilómetros de la Tierra, un error de 0.1 decibelios en el enlace de radio significa que los datos se perderán en el ruido cósmico. Vega me dijo que tienes talento. Yo solo creo en lo que resiste las leyes de la termodinámica. Diseña una sonda de espacio profundo clase Europa. Sin concesiones. Sin excusas.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · SECONDARY CHANNEL', es: 'COMANDANTE FRANK VEGA · CANAL SECUNDARIO' },
        pose: 'VEGA_TRENCH_COMMS',
        dialogue: {
          en: 'I am with you on the line, partner. Show Rostova what we are made of, {engineer}.',
          es: 'Estoy contigo en la línea, socio. Demuéstrale a Rostova de qué madera estamos hechos, {engineer}.',
        },
      },
    ],
  },

  ACT2_T_1_2: {
    id: 'ACT2_T_1_2',
    actLabel: {
      en: 'ACT II · LEVEL 01 ➔ LEVEL 02 (THE JOVIAN BEAST)',
      es: 'ACTO II · NIVEL 01 ➔ NIVEL 02 (LA BESTIA JOVIANA)',
    },
    title: {
      en: 'The Gravity Well of Jupiter',
      es: 'La Bestia Joviana: El Pozo Gravitatorio',
    },
    location: {
      en: 'JPL ASTRODYNAMICS LAB · JUPITER / EUROPA TRANSFER TRAJECTORY',
      es: 'LABORATORIO DE ASTRODINÁMICA JPL · TRAYECTORIA DE TRANSFERENCIA A EUROPA',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Jovian Orbit Insertion requires ~6,800 m/s ΔV and 43 min One-Way Light Time.',
      es: 'CIENCIA REAL: Inserción Orbital Joviana exige ~6,800 m/s de ΔV y 43 min de retardo de luz.',
    },
    slides: [
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · JPL', es: 'DIRECTORA ELENA ROSTOVA · JPL' },
        pose: 'JUPITER_GRAVITY_WELL',
        dialogue: {
          en: 'Our target is no longer gentle Earth orbit, Engineer {engineer}. Jupiter’s gravity well demands 6,800 meters per second of ΔV and a 70-meter DSN Goldstone dish just to hear a whisper. Lock the interplanetary trajectory.',
          es: 'El objetivo ya no es la órbita terrestre, Ingeniero {engineer}. El pozo gravitatorio de Júpiter exige 6,800 metros por segundo de ΔV y una antena DSN de 70 metros solo para captar un susurro. Fije la trayectoria interplanetaria.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · SECONDARY CHANNEL', es: 'COMANDANTE FRANK VEGA · CANAL SECUNDARIO' },
        pose: 'VEGA_TRENCH_COMMS',
        dialogue: {
          en: 'That same trajectory is where Icarus-1 went silent four years ago, {engineer}. Those four astronauts braved the dark first. Keep our DSN link green—we are going to find them.',
          es: 'Por esa misma ruta se perdió el Ícaro-1 hace cuatro años, {engineer}. Ellos abrieron el camino con valentía. Asegura la antena DSN de 70 metros; esta vez no perderemos el enlace.',
        },
      },
    ],
  },

  ACT2_T_2_3: {
    id: 'ACT2_T_2_3',
    actLabel: {
      en: 'ACT II · LEVEL 02 ➔ LEVEL 03 (THE RTG CRISIS)',
      es: 'ACTO II · NIVEL 02 ➔ NIVEL 03 (LA CRISIS DEL RTG)',
    },
    title: {
      en: 'Where the Sun Dies: Nuclear RTG Power',
      es: 'La Crisis del RTG: Donde el Sol es un Punto Débil',
    },
    location: {
      en: 'JPL TEAM X CONCURRENT BAY · 50.3 W/M² SOLAR FLUX ZONE',
      es: 'SALA CONCURRENTE JPL TEAM X · ZONA DE FLUJO SOLAR 50.3 W/M²',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Inverse-Square Law (1/R²) leaves only 3.7% sunlight at 5.2 AU — Pu-238 RTG required.',
      es: 'CIENCIA REAL: Ley 1/R² deja solo 3.7% de luz solar a 5.2 UA — Generador Nuclear RTG obligatorio.',
    },
    slides: [
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · JPL', es: 'DIRECTORA ELENA ROSTOVA · JPL' },
        pose: 'RTG_PALE_SUN',
        dialogue: {
          en: 'At Jupiter, the Sun is nothing more than a pale dot in the sky, Engineer {engineer}. Conventional solar panels will freeze dead. You must equip a Radioisotope Thermoelectric Generator, active thermal loops, and bipropellant propulsion on a heavy launcher.',
          es: 'En Júpiter el Sol es apenas un punto débil en el cielo, Ingeniero {engineer}. Los paneles solares comunes no sirven de nada. Debe integrar un generador nuclear RTG, control térmico activo y propulsión bipropelente sobre un lanzador pesado.',
        },
      },
    ],
  },

  ACT2_T_3_4: {
    id: 'ACT2_T_3_4',
    actLabel: {
      en: 'ACT II · LEVEL 03 ➔ LEVEL 04',
      es: 'ACTO II · NIVEL 03 ➔ NIVEL 04',
    },
    title: {
      en: 'Tsiolkovsky at the Limit: Deep-Space Tanks',
      es: 'Ecuación de Tsiolkovsky al Límite',
    },
    location: {
      en: 'JPL HIGH BAY 1 · PROPELLANT MASS FRACTION LOCK',
      es: 'JPL HIGH BAY 1 · BLOQUEO DE FRACCIÓN DE PROPELENTE',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Exponential mass growth m_wet = m_dry · e^(ΔV / (Isp·g₀)) & MGA by TRL.',
      es: 'CIENCIA REAL: Crecimiento exponencial m_wet = m_dry · e^(ΔV / (Isp·g₀)) y reserva MGA por TRL.',
    },
    slides: [
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · JPL', es: 'DIRECTORA ELENA ROSTOVA · JPL' },
        pose: 'COPV_CLEANROOM_LOCK',
        dialogue: {
          en: 'Every kilogram of dry mass multiplies propellant demand exponentially, {engineer}. Synchronize the concurrent database with zero subsystem conflicts and keep wet mass strictly inside the launch vehicle envelope.',
          es: 'Cada kilogramo de masa seca multiplica exponencialmente el combustible requerido, {engineer}. Sincronice la base de datos concurrente con cero conflictos y mantenga la masa húmeda dentro de la capacidad del lanzador.',
        },
      },
    ],
  },

  ACT2_T_4_5: {
    id: 'ACT2_T_4_5',
    actLabel: {
      en: 'ACT II · LEVEL 04 ➔ LEVEL 05 (EXTREME MCR)',
      es: 'ACTO II · NIVEL 04 ➔ NIVEL 05 (MCR EXTREMO)',
    },
    title: {
      en: 'Before the NASA Review Board',
      es: 'MCR Extremo: Defensa ante la Junta de la NASA',
    },
    location: {
      en: 'NASA HEADQUARTERS REVIEW LINK · PASADENA',
      es: 'ENLACE CON LA JUNTA DIRECTIVA DE LA NASA · PASADENA',
    },
    scienceFact: {
      en: 'REAL SCIENCE: GSFC-STD-1000 Rule 1.05 (Zero Single Point Failure) & NASA-STD-5001B 1.40× Ultimate FoS.',
      es: 'CIENCIA REAL: GSFC-STD-1000 Regla 1.05 (Cero Fallo de Punto Único) y NASA-STD-5001B Factor 1.40×.',
    },
    slides: [
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · JPL', es: 'DIRECTORA ELENA ROSTOVA · JPL' },
        pose: 'NASA_BOARD_DEFENSE',
        dialogue: {
          en: 'The NASA board is ready to veto this rescue if a single environmental V&V test or margin fails, {engineer}. Certify all five tests, verify structural safety factors, and sign the MCR.',
          es: 'La junta de la NASA está a punto de vetar la misión si falla una sola prueba V&V o el margen cae del umbral, {engineer}. Certifique las cinco pruebas ambientales y firme la autorización MCR.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA · SECONDARY CHANNEL', es: 'COMANDANTE FRANK VEGA · CANAL SECUNDARIO' },
        pose: 'VEGA_TRENCH_COMMS',
        dialogue: {
          en: 'Everything we learned from day one in that hangar comes down to this signature, {engineer}. Sign it—let us go get Icarus-1.',
          es: 'Todo lo que aprendimos desde aquel primer día en el hangar se resume en esta firma, {engineer}. Fírmalo... vamos por el Ícaro-1.',
        },
      },
    ],
  },

  ACT2_T_5_6: {
    id: 'ACT2_T_5_6',
    actLabel: {
      en: 'ACT II · LEVEL 05 ➔ LEVEL 06 (INTO THE VOID)',
      es: 'ACTO II · NIVEL 05 ➔ NIVEL 06 (EL ENCUENTRO EN EL VACÍO)',
    },
    title: {
      en: 'Crossing Jupiter’s Radiation Belt',
      es: 'El Encuentro en el Vacío: Cinturón de Radiación de Júpiter',
    },
    location: {
      en: 'JOVIAN MAGNETOSPHERE · EUROPA ORBIT INSERTION',
      es: 'MAGNETOSFERA DE JÚPITER · INSERCIÓN EN ÓRBITA DE EUROPA',
    },
    scienceFact: {
      en: 'REAL SCIENCE: High-Energy Electron Radiation Triage & Autonomous Deep-Space Fault Protection.',
      es: 'CIENCIA REAL: Radiación de Electrones de Alta Energía y Protección Autónoma de Fallos.',
    },
    slides: [
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · JPL', es: 'DIRECTORA ELENA ROSTOVA · JPL' },
        pose: 'JUPITER_RADIATION_BELT',
        dialogue: {
          en: 'We are entering Europa’s radiation belt, Chief Engineer {engineer}! Resolve all three in-flight anomalies on the right console immediately to lock onto the Icarus-1 beacon!',
          es: '¡Estamos atravesando el cinturón de radiación de Júpiter, Ingeniero Jefe {engineer}! Resuelva las tres crisis en vuelo en el panel derecho para enganchar la señal de la baliza del Ícaro-1.',
        },
      },
    ],
  },

  ACT2_FINALE_SANDBOX: {
    id: 'ACT2_FINALE_SANDBOX',
    actLabel: {
      en: 'GRAND FINALE & EPILOGUE — PROJECT ICARUS-26',
      es: 'EL GRAN DESENLACE Y EPÍLOGO — PROYECTO ÍCARO-26',
    },
    title: {
      en: 'Echoes of Icarus: You Brought Them Home',
      es: 'Ecos de Ícaro: Los Trajiste a Casa',
    },
    location: {
      en: 'EUROPA ORBIT LINK LOCKED // DSN GOLDSTONE -> JPL PASADENA',
      es: 'ENLACE BLOQUEADO EN ÓRBITA DE EUROPA // DSN GOLDSTONE -> JPL PASADENA',
    },
    scienceFact: {
      en: 'INFINITE FORGE UNLOCKED: Full access to all NASA/CSA presets, orbits, and subsystems.',
      es: 'MODO FORJA INFINITA DESBLOQUEADO: Acceso total a todos los planetas, chasis y subsistemas.',
    },
    unlocksSandbox: true,
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: { en: 'DSN GOLDSTONE // BEACON TELEMETRY RECEIVED', es: 'DSN GOLDSTONE // TELEMETRÍA DEL ÍCARO-1 RECIBIDA' },
        pose: 'ICARUS_BEACON_RESPONSE',
        dialogue: {
          en: 'Orbital insertion around Europa confirmed. The Icarus-1 emergency beacon has responded! One hundred percent of the crew’s final black-box recordings and Europa subsurface ocean spectrograms are now streaming to Earth.',
          es: 'Inserción orbital en Europa confirmada. ¡La baliza de emergencia del Ícaro-1 ha respondido! El cien por ciento de las grabaciones finales de la tripulación y los datos científicos del océano subterráneo de Europa están llegando a la Tierra.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: { en: 'COMMANDER FRANK VEGA', es: 'COMANDANTE FRANK VEGA' },
        pose: 'VEGA_TEARS_VICTORY',
        dialogue: {
          en: 'You brought them home, {engineer}... My God, you gave them a worthy finale. I promised Cadet {cadet} we would never fail again, and today Chief Engineer {engineer} fulfilled that promise. I will never forget what you did today.',
          es: 'Los trajiste a casa, {engineer}... Por Dios, les diste un final digno. Le prometí al Cadete {cadet} que jamás volveríamos a fallar, y hoy el Ingeniero Jefe {engineer} cumplió esa promesa. Jamás olvidaré lo que hiciste hoy.',
        },
      },
      {
        speaker: 'ROSTOVA',
        speakerTitle: { en: 'DIRECTOR ELENA ROSTOVA · NASA JPL', es: 'DIRECTORA ELENA ROSTOVA · NASA JPL' },
        pose: 'ROSTOVA_STANDING_OVATION',
        dialogue: {
          en: 'Excellent work, Chief Engineer {engineer}. Your architecture has been baptized as a permanent NASA standard. The solar system does not seem so vast anymore with people like you at the controls.',
          es: 'Excelente trabajo, Ingeniero Jefe {engineer}. Su diseño ha sido bautizado como estándar permanente de la NASA. El sistema solar ya no parece tan grande con gente como usted en los controles.',
        },
      },
      {
        speaker: 'SYSTEM',
        speakerTitle: { en: 'EPILOGUE // INFINITE FORGE SANDBOX UNLOCKED', es: 'EPÍLOGO // MODO LIBRE / FORJA INFINITA DESBLOQUEADO' },
        pose: 'SANDBOX_INFINITE_FORGE',
        dialogue: {
          en: 'YOU HAVE COMPLETED THE SPACE CHRONICLE. Academy limits and mission restrictions have been removed. INFINITE FORGE MODE UNLOCKED: You now have unlimited access to every destination, experimental chassis, and all subsystem combinations. The cosmos is yours to explore.',
          es: 'HAS COMPLETADO LA CRÓNICA ESPACIAL. Los límites de la Academia y las restricciones de misión han sido eliminados. MODO FORJA INFINITA DESBLOQUEADO: Ahora tienes acceso ilimitado a cualquier planeta, chasis experimentales y combinaciones de subsistemas sin restricciones. El cosmos es tuyo para explorar.',
        },
      },
    ],
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

export function formatStoryText(
  template: string,
  cadetName: string,
  engineerName: string,
  missionCustomName: string,
): string {
  return template
    .replaceAll('{cadet}', cadetName)
    .replaceAll('{engineer}', engineerName)
    .replaceAll('{commander}', cadetName)
    .replaceAll('{mission}', missionCustomName);
}
