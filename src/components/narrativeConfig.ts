import type { RobotSpotlightZone, StoryCinematicId } from '../store';
import type { CMLPhase, SubsystemCategory } from '../types/mission';

export interface ScrewByScrewStep {
  stepNum: string;
  controlLabel: { en: string; es: string };
  whatIsIt: { en: string; es: string };
  howItConnects: { en: string; es: string };
}

export interface PhaseTourStep {
  step: number;
  targetZone: RobotSpotlightZone;
  badge: { en: string; es: string };
  title: { en: string; es: string };
  instruction: { en: string; es: string };
  astraTip?: { en: string; es: string };
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

export const PHASE_INTERACTIVE_TOURS: Record<CMLPhase, PhaseTourStep[]> = {
  CML_1: [
    {
      step: 0,
      targetZone: 'RESOURCES',
      badge: { en: 'TOUR 1/5 · VITAL SIGNS', es: 'GUÍA 1/5 · SIGNOS VITALES' },
      title: { en: 'Live Resource Bars (Top Left)', es: 'Barras de Recursos en Vivo (Arriba Izquierda)' },
      instruction: {
        en: 'Cadet {cadet}, look at the top-left panel. Those 5 bars are your ship’s vital signs: Mass, Power, Budget, Data, and RF Link. Every piece you touch will move them in real time. Click "Next" or touch your first part.',
        es: 'Cadete {cadet}, mira arriba a la izquierda. Esas 5 barras son los signos vitales de tu nave: Masa, Energía, Presupuesto, Datos y Enlace RF. Cada pieza que elijas moverá estas barras en vivo. Pulsa "Siguiente" o toca tu primera pieza.',
      },
      astraTip: {
        en: 'Keep all bars in Cyan. If any turns Red, your spacecraft fails review!',
        es: 'Mantén todas las barras en color Cian. ¡Si una se pone roja, el satélite no despegará!',
      },
    },
    {
      step: 1,
      targetZone: 'CHASSIS',
      badge: { en: 'TOUR 2/5 · CLICK A CHASSIS', es: 'GUÍA 2/5 · ELIGE UN CHASIS' },
      title: { en: 'Step 1: The Spacecraft Skeleton (Chassis)', es: 'Paso 1: El Esqueleto de la Nave (Chasis)' },
      instruction: {
        en: 'Look at STEP 1 · CHASSIS on the left. It is the aluminum body where instruments fit. Click any size (1.5U, 2U, 3U or CUSTOM) right now—I will detect your move and show you how the center hologram changes!',
        es: 'Mira el PASO 1 · CHASIS a la izquierda. Es el cuerpo de aluminio donde caben los equipos. Haz clic en otro tamaño (1.5U, 2U, 3U o CUSTOM): detectaré tu movimiento y verás cómo cambia el holograma central.',
      },
      astraTip: {
        en: 'Each 1U is a 10x10 cm cube. Larger boxes fit more scientific cameras.',
        es: 'Cada 1U es un cubo de 10x10 cm. Los chasis más grandes permiten llevar más cámaras.',
      },
    },
    {
      step: 2,
      targetZone: 'EPS',
      badge: { en: 'TOUR 3/5 · SOLAR ARRAYS', es: 'GUÍA 3/5 · PANELES SOLARES' },
      title: { en: 'Solar Wings & Electrical Power (EPS)', es: 'Paneles Solares y Energía Eléctrica (EPS)' },
      instruction: {
        en: 'Great move! You saw the cube resize in the center. Now look at SOLAR ARRAYS / EPS below on the left. They generate electricity so your ship never dies in the dark like Icarus-1. Click any power option to deploy the wings!',
        es: '¡Bien hecho! ¿Viste cómo cambió el cubo en el centro? Ahora baja a PANELES SOLARES / EPS a la izquierda. Generan la electricidad para que tu nave no se apague como el Ícaro-1. ¡Haz clic en una opción para desplegar las alas!',
      },
      astraTip: {
        en: 'Deployable arrays give higher wattage during orbital sunlight passes.',
        es: 'Las alas desplegables generan más vatios (+W) para sobrevivir los eclipses.',
      },
    },
    {
      step: 3,
      targetZone: 'MISSION',
      badge: { en: 'TOUR 4/5 · SCIENCE MISSION', es: 'GUÍA 4/5 · ELIGE LA MISIÓN' },
      title: { en: 'Step 2: Science Mission & Payload (Right Panel)', es: 'Paso 2: Misión Científica y Carga Útil (Derecha)' },
      instruction: {
        en: 'Look at those solar wings deployed in the hologram! Now look to the RIGHT panel under STEP 2 · MISSION. Picking a mission sets our target planet, science camera, and NASA budget. Click any mission card on the right!',
        es: '¡Mira cómo se desplegaron las alas en el centro! Ahora mira a la DERECHA en PASO 2 · MISIÓN. Elegir la misión define qué planeta investigaremos, qué cámara llevaremos y nuestro presupuesto. ¡Haz clic en una misión a la derecha!',
      },
      astraTip: {
        en: 'Each mission requires specific scientific payloads you will equip in Level 03.',
        es: 'Cada misión exige instrumentos específicos que equiparás en el Nivel 03.',
      },
    },
    {
      step: 4,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 5/5 · ADVANCE TO ORBIT', es: 'GUÍA 5/5 · ¡LISTO PARA LA ÓRBITA!' },
      title: { en: 'First Blueprint Complete!', es: '¡Primer Plano en Servilleta Completado!' },
      instruction: {
        en: 'Outstanding work, {callsign}! You now know how the left controls, right mission cards, and center hologram work together. Click "NEXT LEVEL · 02" below the hologram to launch into Orbit!',
        es: '¡Excelente trabajo, {callsign}! Ya dominas los controles de la izquierda, las misiones de la derecha y el holograma central. Pulsa el botón brillante "SIGUIENTE NIVEL · 02" debajo del holograma para ir a la Órbita.',
      },
      astraTip: {
        en: 'Click NEXT LEVEL 02 right below the center rotating hologram.',
        es: 'Pulsa SIGUIENTE NIVEL 02 justo debajo del holograma giratorio en el centro.',
      },
    },
  ],

  CML_2: [
    {
      step: 0,
      targetZone: 'LEFT_PANEL',
      badge: { en: 'TOUR 1/4 · ORBIT PARAMS', es: 'GUÍA 1/4 · PARÁMETROS ORBITALES' },
      title: { en: 'Altitude, Inclination & Tsiolkovsky Delta-V', es: 'Altitud, Inclinación y Delta-V de Tsiolkovsky' },
      instruction: {
        en: 'Welcome to Level 02: Orbit & Ground Stations, {callsign}. On the left you configure your orbital altitude and inclination. The physics engine solves Tsiolkovsky’s rocket equation in real time. Try adjusting the altitude slider!',
        es: 'Bienvenido al Módulo 02 de Órbita y Estaciones, {callsign}. A la izquierda configuras la altitud e inclinación de vuelo. El motor físico calcula el Delta-V requerido con la ecuación de Tsiolkovsky. ¡Prueba a mover la altitud!',
      },
      astraTip: {
        en: 'Higher altitudes escape atmospheric drag but require more Delta-V.',
        es: 'A mayor altitud hay menos fricción con el aire, pero necesitas más combustible.',
      },
    },
    {
      step: 1,
      targetZone: 'RIGHT_PANEL',
      badge: { en: 'TOUR 2/4 · SOLAR DESTINATIONS', es: 'GUÍA 2/4 · DESTINOS DE LA NASA' },
      title: { en: 'Select Solar System Destination', es: 'Selecciona tu Destino en el Sistema Solar' },
      instruction: {
        en: 'Look to the right panel. NASA operates across 6 planetary regimes: LEO, SSO, GEO, Moon, SE-L2, and Jupiter. Click a destination card to calculate the required orbital insertion burn!',
        es: 'Mira al panel derecho. La NASA opera en 6 regímenes: LEO, SSO, GEO, Luna, SE-L2 y Júpiter. Haz clic en una tarjeta de destino para ver la trayectoria y el encendido en el mapa central.',
      },
      astraTip: {
        en: 'Missions to Jupiter face weak solar power and extreme radiation belts.',
        es: 'Las misiones a Júpiter exigen energía nuclear RTG y blindaje contra radiación.',
      },
    },
    {
      step: 2,
      targetZone: 'RIGHT_PANEL',
      badge: { en: 'TOUR 3/4 · DEEP SPACE NETWORK', es: 'GUÍA 3/4 · RED DE ESPACIO PROFUNDO' },
      title: { en: 'Ground Stations & DSN Antennas', es: 'Estaciones Terrenas y Antenas DSN' },
      instruction: {
        en: 'Scroll down on the right to select your ground station: Near-Earth for LEO, DSN 34m for the Moon and L2, and the 70-meter dish for Jupiter. Ensure your RF link margin stays above 3 dB!',
        es: 'Baja a la derecha para seleccionar tu estación terrena: Near-Earth para LEO, DSN 34m para la Luna y L2, o la antena de 70m para Júpiter. ¡Asegúrate de que el enlace de radio esté en verde!',
      },
      astraTip: {
        en: 'A weak link means mission telemetry drops out when passing behind bodies.',
        es: 'Una antena pequeña provocará pérdida de datos cuando la nave esté lejos.',
      },
    },
    {
      step: 3,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 4/4 · ORBITAL MAP & NEXT', es: 'GUÍA 4/4 · MAPA ORBITAL Y AVANCE' },
      title: { en: 'Holographic CAD Orbit Ready', es: 'Mapa Orbital Listo: Pasa al Nivel 03' },
      instruction: {
        en: 'Look at the center holographic polar grid: it projects true orbital velocity, Van Allen belts, and ground station line-of-sight. When ready, click "NEXT LEVEL · 03" below the orbit map to enter the Trade Space!',
        es: 'Observa en el centro la retícula polar CAD: proyecta la velocidad real, los cinturones Van Allen y el enlace con Tierra. Cuando estés listo, pulsa "SIGUIENTE NIVEL · 03" para diseñar los subsistemas.',
      },
      astraTip: {
        en: 'Click NEXT LEVEL 03 below the orbit canvas to proceed.',
        es: 'Pulsa el botón SIGUIENTE NIVEL 03 debajo del mapa orbital.',
      },
    },
  ],

  CML_3: [
    {
      step: 0,
      targetZone: 'LEFT_PANEL',
      badge: { en: 'TOUR 1/4 · 7 SUBSYSTEMS', es: 'GUÍA 1/4 · LOS 7 SUBSISTEMAS' },
      title: { en: 'The 7 NASA Engineering Disciplines', es: 'Las 7 Disciplinas Aeroespaciales de la NASA' },
      instruction: {
        en: 'Welcome to Level 03 Trade Space, {callsign}. On the left you have the 7 subsystems: Payload, Propulsion, EPS, Telecom, Thermal, ADCS, and Launcher. Each tab displays what you currently have equipped. Click any tab to explore!',
        es: 'Bienvenido al Trade Space del Módulo 03, {callsign}. A la izquierda tienes los 7 subsistemas canónicos: Carga Útil, Propulsión, EPS, Telecom, Térmico, ADCS y Lanzador. Cada pestaña muestra tu pieza montada. ¡Haz clic en una pestaña!',
      },
      astraTip: {
        en: 'Navigate between the 7 tabs on the left to equip each discipline.',
        es: 'Usa las 7 pestañas de la izquierda para cambiar entre motores, antenas y baterías.',
      },
    },
    {
      step: 1,
      targetZone: 'RIGHT_PANEL',
      badge: { en: 'TOUR 2/4 · EQUIP HARDWARE', es: 'GUÍA 2/4 · EQUIPA COMPONENTES' },
      title: { en: 'Inspect CAD & Click [+ EQUIP]', es: 'Inspecciona en 3D y Pulsa [+ EQUIPAR]' },
      instruction: {
        en: 'The right panel shows NASA-rated hardware options. Click [CAD / SPECS] to inspect the component in 3D wireframe, and click the bright green [+ EQUIP] button to mount it onto your spacecraft blueprint in real time!',
        es: 'A la derecha tienes el catálogo con piezas reales. Pulsa el botón azul [CAD / SPECS] para examinar la pieza en 3D, y pulsa el botón verde [+ EQUIPAR] para montarla en el satélite al instante.',
      },
      astraTip: {
        en: 'Notice how the center blueprint updates immediately as you click [+ EQUIP].',
        es: 'Observa cómo el plano en el centro se actualiza al instante al pulsar [+ EQUIPAR].',
      },
    },
    {
      step: 2,
      targetZone: 'RESOURCES',
      badge: { en: 'TOUR 3/4 · SYNERGY COMBOS', es: 'GUÍA 3/4 · COMBOS DE SINERGIA' },
      title: { en: 'Active Synergies & SWaP-C Budgets', es: 'Combos de Sinergia y Margen SWaP-C' },
      instruction: {
        en: 'Pairing compatible systems (like laser comms with high-capacity batteries) unlocks active synergy bonuses in the left panel. Watch your vital bars to ensure mass and power stay well within launcher limits!',
        es: 'Combinar piezas que trabajan bien juntas (como telecomunicaciones láser con baterías potentes) desbloquea combos de sinergia a la izquierda. ¡Vigila que ninguna barra se ponga roja!',
      },
      astraTip: {
        en: 'Synergy combos give you bonus scientific score and power efficiency.',
        es: 'Los combos de sinergia otorgan puntos extras de ciencia y ahorro de energía.',
      },
    },
    {
      step: 3,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 4/4 · FAIRING & ADVANCE', es: 'GUÍA 4/4 · PLANO CON COFIA' },
      title: { en: '50mm Clearance (NASA-STD-5001B) & Next Level', es: 'Holgura de 50mm NASA-STD-5001B y Nivel 04' },
      instruction: {
        en: 'Look at the center blueprint: the green border is the rocket fairing envelope with NASA-STD-5001B dynamic clearance. If nothing clashes and margins are solid, click "NEXT LEVEL · 04" to enter Point Design!',
        es: 'Mira el plano central: la línea verde es la cofia del cohete con holgura dinámica de 50 mm según NASA-STD-5001B. Si nada choca y los márgenes son seguros, pulsa "SIGUIENTE NIVEL · 04" para ir al Punto de Diseño.',
      },
      astraTip: {
        en: 'Click NEXT LEVEL 04 below the blueprint to lock your baseline design.',
        es: 'Pulsa SIGUIENTE NIVEL 04 debajo del plano para pasar al siguiente paso.',
      },
    },
  ],

  CML_4: [
    {
      step: 0,
      targetZone: 'LEFT_PANEL',
      badge: { en: 'TOUR 1/4 · CONCURRENT SEATS', es: 'GUÍA 1/4 · SILLAS CONCURRENTES' },
      title: { en: 'JPL Team X Concurrent Engineering Chairs', es: 'Metodología JPL Team X (4 Sillas Especialistas)' },
      instruction: {
        en: 'Welcome to Level 04 Point Design, {callsign}. On the left you have the 4 specialized concurrent seats: Mission Lead, Payload, Bus, and Launch Operations. Click through each chair to audit their subsystem telemetry!',
        es: 'Bienvenido al Módulo 04 de Punto de Diseño, {callsign}. A la izquierda tienes las 4 Sillas de JPL Team X: Líder de Misión, Carga Útil, Bus y Lanzamiento. Alterna entre ellas para auditar cada disciplina.',
      },
      astraTip: {
        en: 'Concurrent engineering prevents costly redesigns by aligning all disciplines early.',
        es: 'El diseño concurrente evita rediseños costosos resolviendo discrepancias a tiempo.',
      },
    },
    {
      step: 1,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 2/4 · PROPELLANT TANKS', es: 'GUÍA 2/4 · LLENADO DE TANQUES' },
      title: { en: 'Tank Fill Sliders & Wet Mass Trade-off', es: 'Deslizadores de Tanques y Masa Húmeda' },
      instruction: {
        en: 'In the center you have the propellant and oxidizer tanks. Move the fill sliders to inject fuel: watch your Delta-V climb, but beware of total wet mass approaching the rocket’s lift limit!',
        es: 'En el centro tienes los tanques de combustible y oxidante. Mueve los deslizadores de llenado: verás aumentar tu Delta-V disponible, pero vigila no exceder la capacidad del cohete.',
      },
      astraTip: {
        en: 'Bipropellant requires balancing both fuel and oxidizer for complete combustion.',
        es: 'En sistemas bipropelente debes llenar ambos tanques para una combustión balanceada.',
      },
    },
    {
      step: 2,
      targetZone: 'RIGHT_PANEL',
      badge: { en: 'TOUR 3/4 · MARGIN TRADEOFFS', es: 'GUÍA 3/4 · AJUSTE DE MÁRGENES' },
      title: { en: 'Sensitivity Curves & Safety Margins', es: 'Curvas de Sensibilidad y Margen > 35%' },
      instruction: {
        en: 'On the right panel, fine-tune your mass growth allowances (MGA) and power eclipse buffers. Achieve a safety margin above 35% to qualify for the 3-Star NASA Engineering Excellence Award!',
        es: 'En el panel derecho ajustas las reservas de masa de crecimiento y potencia. ¡Consigue un margen de seguridad superior al 35% para calificar para las 3 Estrellas de la NASA!',
      },
      astraTip: {
        en: 'A 35% margin protects your spacecraft against unexpected in-flight crises.',
        es: 'Un margen del 35% garantiza que la nave sobreviva tormentas solares o fallos.',
      },
    },
    {
      step: 3,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 4/4 · POINT DESIGN LOCKED', es: 'GUÍA 4/4 · PUNTO DE DISEÑO LISTO' },
      title: { en: 'Proceed to MCR Gate Review', es: 'Avanzar a la Puerta de Revisión MCR' },
      instruction: {
        en: 'Superb point design calibration! Your concurrent chairs report zero critical conflicts. Click "NEXT LEVEL · 05" below the tank stage to submit your design to the Mission Concept Review (MCR)!',
        es: '¡Excelente calibración del punto de diseño! Todas las sillas reportan cero conflictos. Pulsa "SIGUIENTE NIVEL · 05" debajo de los tanques para someter la nave a la revisión MCR.',
      },
      astraTip: {
        en: 'Click NEXT LEVEL 05 to begin environmental verification.',
        es: 'Pulsa SIGUIENTE NIVEL 05 para someter el satélite a pruebas ambientales.',
      },
    },
  ],

  CML_5: [
    {
      step: 0,
      targetZone: 'LEFT_PANEL',
      badge: { en: 'TOUR 1/4 · CSLI TESTING', es: 'GUÍA 1/4 · PRUEBAS AMBIENTALES' },
      title: { en: 'NASA CSLI Environmental Test Matrix', es: 'Matriz de Ensayos Ambientales CSLI' },
      instruction: {
        en: 'Welcome to Level 05: Verification & Validation (V&V), {callsign}. On the left you execute NASA’s environmental qualification suite: acoustic vibe, 40K thermal vacuum, solar deployment, and RF silence. Click to run each test!',
        es: 'Bienvenido al Módulo 05 de Verificación y Validación (V&V), {callsign}. A la izquierda ejecutas las pruebas ambientales de la NASA: vibración acústica, termovacío, despliegue solar y silencio RF. ¡Ejecuta las pruebas!',
      },
      astraTip: {
        en: 'CSLI compliance is legally required before any rocket launch provider integrates your satellite.',
        es: 'Aprobar CSLI es obligatorio para que el lanzador permita montar tu satélite en la cofia.',
      },
    },
    {
      step: 1,
      targetZone: 'RIGHT_PANEL',
      badge: { en: 'TOUR 2/4 · AUTO-RESOLVER MCR', es: 'GUÍA 2/4 · AUTO-RESOLVER MCR' },
      title: { en: 'Resolve Discrepancies with One Click', es: 'Discrepancias Técnicas y Auto-Resolución' },
      instruction: {
        en: 'Look to the right panel. Any remaining mass, delta-V, or power deficits appear here. You can manually adjust them or click the golden [⚡ AUTO-RESOLVE ALL MCR DISCREPANCIES] button to fix all issues in one second!',
        es: 'Mira al panel derecho. Si hay discrepancias de masa, potencia o radio, puedes resolverlas pieza por pieza o pulsar el botón dorado [⚡ AUTO-RESOLVER TODAS LAS DISCREPANCIAS MCR] para solucionarlas en un clic.',
      },
      astraTip: {
        en: 'Auto-resolve smartly selects mission-compatible subsystems based on your destination.',
        es: 'El botón auto-resolver equipa de inmediato las piezas oficiales según tu planeta destino.',
      },
    },
    {
      step: 2,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 3/4 · CAD INSPECTION', es: 'GUÍA 3/4 · PINES DE INSPECCIÓN CAD' },
      title: { en: 'NASA-STD-5001B Quality Pins', es: 'Pines de Control de Calidad NASA-STD-5001B' },
      instruction: {
        en: 'In the center, rotate the spacecraft and inspect the 4 CAD quality pins: COPV pressure vessels, structural fasteners, EPS wings, and telecom dish. Verify that all four inspection points show green nominal status!',
        es: 'En el centro puedes rotar el satélite e inspeccionar los 4 pines de control de calidad: pernos estructurales, tanques COPV, alas solares y antena. ¡Verifica que los 4 pines marquen estado nominal!',
      },
      astraTip: {
        en: 'Click each pin to view the NASA standard requirements and stress factors.',
        es: 'Haz clic en cada pin para leer el factor de seguridad y la norma aeroespacial.',
      },
    },
    {
      step: 3,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 4/4 · FLIGHT CLEARANCE', es: 'GUÍA 4/4 · ¡LANZAR MISIÓN!' },
      title: { en: 'Flight Authorization Approved!', es: '¡Firma MCR Concedida: Lanzar Misión 06!' },
      instruction: {
        en: 'Flight clearance signed by the Mission Director! Your spacecraft meets 100% of NASA aerospace flight criteria. Click the bright pulsing button "LAUNCH MISSION · 06" below the hologram to proceed to the Launch Pad!',
        es: '¡Autorización de vuelo firmada por el Director de Misión! Tu nave cumple al 100% las normas de la NASA. Pulsa el botón brillante "LANZAR MISIÓN · 06" debajo del holograma para ir a la plataforma de lanzamiento.',
      },
      astraTip: {
        en: 'Click LAUNCH MISSION 06 to initiate the orbital simulation.',
        es: 'Pulsa LANZAR MISIÓN 06 para entrar a la simulación física de vuelo.',
      },
    },
  ],

  SIMULATION: [
    {
      step: 0,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 1/4 · FLIGHT CONTROLS', es: 'GUÍA 1/4 · CONTROLES DE VUELO' },
      title: { en: 'Poly Bridge Time Controls: Play, Pause & Warp', es: 'Controles Poly Bridge: Play, Pausa y Velocidades' },
      instruction: {
        en: 'We are on the launch pad, {callsign}! In the center you have the Poly Bridge transport bar: click Play to ignite engines, Pause to freeze telemetry at any exact second, or switch between 0.5x, 1x, 2x, and 4x WARP speed!',
        es: '¡Estamos en plataforma de lanzamiento, {callsign}! En el centro tienes los controles de tiempo estilo Poly Bridge: pulsa Play para iniciar el despegue, Pausa para congelar la telemetría, o cambia la velocidad entre 0.5x y 4x WARP.',
      },
      astraTip: {
        en: 'You can pause time at any moment to study sudden telemetry drops.',
        es: 'Puedes pausar la simulación en cualquier segundo para analizar la telemetría.',
      },
    },
    {
      step: 1,
      targetZone: 'LEFT_PANEL',
      badge: { en: 'TOUR 2/4 · STRESS HEATMAP', es: 'GUÍA 2/4 · MAPA DE ESTRÉS EN VIVO' },
      title: { en: 'Real-time Subsystem Stress & Telemetry', es: 'Mapa de Calor de Estrés y Telemetría en Vivo' },
      instruction: {
        en: 'On the left, track your live altitude, speed, and the Poly Bridge subsystem stress heatmap: 0–60% safe cyan, 85% amber warning, and over 100% neon red overload. If a joint snaps, sparks will fly!',
        es: 'A la izquierda monitoreas la altitud, velocidad orbital y el mapa de estrés por subsistema: cian seguro, ámbar advertencia, y más de 100% rojo sobrecarga con chispas de rotura estructural.',
      },
      astraTip: {
        en: 'Thermal and aerodynamic Max-Q loads peak during early orbital insertion.',
        es: 'Las cargas máximas de fricción aerodinámica ocurren durante la inserción orbital.',
      },
    },
    {
      step: 2,
      targetZone: 'RIGHT_PANEL',
      badge: { en: 'TOUR 3/4 · DEPLOYMENT & CRISES', es: 'GUÍA 3/4 · DESPLIEGUE Y CRISIS' },
      title: { en: '5-Stage Deployment Timeline & Crisis Management', es: 'Cronograma de Despliegue y Resolución de Crisis' },
      instruction: {
        en: 'On the right, watch the 5 mechanical deployment stages: P-POD separation, 30-min RF silence, solar deployment, and B-Dot detumble. If an orbital crisis strikes, select the optimal crew intervention to save the mission!',
        es: 'A la derecha sigues las 5 etapas de despliegue SmallSat y la bitácora de vuelo. Si surge una crisis en órbita, selecciona la respuesta de emergencia adecuada para salvar la misión.',
      },
      astraTip: {
        en: 'Resolving all 3 random crisis events qualifies you for the 3rd NASA Master Star.',
        es: 'Resolver las crisis de vuelo con éxito te otorgará la tercera Estrella de Maestría.',
      },
    },
    {
      step: 3,
      targetZone: 'HOLOGRAM',
      badge: { en: 'TOUR 4/4 · AUTO-REPAIR & STARS', es: 'GUÍA 4/4 · AUTO-REPARAR Y CERTIFICADO' },
      title: { en: 'Auto-Repair and 3-Star Mission Certificate', es: 'Auto-Reparar y Certificado Oficial de 3 Estrellas' },
      instruction: {
        en: 'If an anomaly causes mission failure, click [AUTO-REPAIR & RELAUNCH] in the top header or return to blueprints from the Black Box autopsy. Once insertion succeeds, claim your Official NASA Mission Certificate!',
        es: 'Si ocurre una anomalía crítica, pulsa el botón [AUTO-REPARAR Y RELANZAR] en la barra superior o reajusta el plano desde la Caja Negra. ¡Al completar la órbita recibirás tu Certificado Oficial de la NASA con tus 3 Estrellas!',
      },
      astraTip: {
        en: 'The Black Box allows a 0.5x slow-mo replay of the exact second of failure.',
        es: 'La Caja Negra te permite ver una repetición a 0.5x en cámara lenta del fallo.',
      },
    },
  ],
};

export const LEVEL1_INTERACTIVE_TOUR = PHASE_INTERACTIVE_TOURS.CML_1;

export function getPhaseInteractiveTour(phase: CMLPhase): PhaseTourStep[] {
  return PHASE_INTERACTIVE_TOURS[phase] || PHASE_INTERACTIVE_TOURS.CML_1;
}

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
      en: 'Solar flux drops with 1/R²: ensure adequate solar wing area and battery capacity for orbital eclipses.',
      es: 'La energía solar decae con 1/R²: asegura área de paneles y baterías suficientes para soportar los eclipses.',
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
      en: 'Dir. Rostova: Chief Engineer {commander}, configure {mission} baseline SWaP-C requirements. Zero margin errors.',
      es: 'Dir. Rostova: Ingeniero Jefe {commander}, configure {mission} según los requerimientos SWaP-C de la misión. Cero errores.',
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
          en: 'The solar wings or power generator that produce electricity in space.',
          es: 'Las alas solares o generador de potencia que producen electricidad en el espacio.',
        },
        howItConnects: {
          en: 'Feeds Watts to all cameras and radios. Deploy wings to match payload consumption.',
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
      en: 'Dir. Rostova: Engineer {commander}, calculate orbital insertion ΔV and ground station link margin for {mission}.',
      es: 'Dir. Rostova: Ingeniero {commander}, calcule el ΔV de inserción orbital y el margen de enlace terreno para {mission}.',
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
      en: 'Vega (Sec. Channel): Partner, remember Icarus-1 failed in a power crisis. Balance SWaP-C and maintain positive margins!',
      es: 'Vega (Canal Sec.): Socio, recuerda que el Ícaro-1 cayó por balance de energía. ¡Equilibra SWaP-C y mantén márgenes positivos!',
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

  MISSION_CINEMATIC_LEO: {
    id: 'MISSION_CINEMATIC_LEO',
    actLabel: {
      en: 'MISSION BRIEFING 01 · LEO FLIGHT ACADEMY',
      es: 'BRIEFING DE MISIÓN 01 · ACADEMIA DE VUELO LEO',
    },
    title: {
      en: 'BioNutrients-2: Seeds of Survival in Low Orbit',
      es: 'BioNutrients-2: Semillas de Supervivencia en Órbita Baja',
    },
    location: {
      en: 'LOW EARTH ORBIT · 550 KM ALTITUDE · VELOCITY 27,600 KM/H',
      es: 'ÓRBITA BAJA TERRESTRE · ALTITUD 550 KM · VELOCIDAD 27,600 KM/H',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Thermospheric drag decelerates satellites below 350 km. 16 orbital eclipses per day demand battery thermal management during 35-minute solar umbra.',
      es: 'CIENCIA REAL: El arrastre atmosférico desacelera satélites bajo 350 km. 16 eclipses al día exigen gestión térmica en baterías durante 35 min de umbra solar.',
    },
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: {
          en: 'NASA AMES / BIO-CULTURE FLIGHT CONTRACT',
          es: 'NASA AMES / CONTRATO DE VUELO DE BIOCULTIVO',
        },
        pose: 'CUBESAT_ORBIT_DANCE',
        dialogue: {
          en: 'MISSION CONTRACT 01 DEPLOYED // BioNutrients-2. Target: Low Earth Orbit (550 km). Produce fresh carotenoid nutrients in microgravity to protect long-duration astronauts from space radiation.',
          es: 'CONTRATO DE MISIÓN 01 DESPLEGADO // BioNutrients-2. Destino: Órbita Baja Terrestre (550 km). Sintetizar nutrientes carotenoides en microgravedad para proteger a tripulaciones espaciales contra la radiación.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT INSTRUCTOR',
          es: 'COMANDANTE FRANK VEGA · INSTRUCTOR DE VUELO',
        },
        pose: 'VEGA_WINDOW_COIN',
        dialogue: {
          en: 'Look down at the blue curve of Earth, {commander}. Beautiful, but deceiving. In LEO, the residual upper atmosphere acts like sandpaper on your solar wings. If your orbit decays below 300 km, your satellite becomes a shooting star. And in every 90-minute lap, you will spend 35 minutes in freezing pitch blackness. Choose robust solar wings and check your battery reserves. I am with you bolt by bolt!',
          es: 'Mira hacia abajo a la curva azul de la Tierra, {commander}. Hermosa, pero engañosa. En LEO, la atmósfera residual actúa como lija sobre tus paneles solares. Si tu órbita decae bajo 300 km, tu satélite se volverá una estrella fugaz. Y en cada vuelta de 90 minutos, pasarás 35 minutos en la oscuridad más gélida. Elige paneles firmes y vigila las baterías. ¡Estoy a tu lado tornillo a tornillo!',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT INSTRUCTOR',
          es: 'COMANDANTE FRANK VEGA · INSTRUCTOR DE VUELO',
        },
        pose: 'VEGA_IGNITE_CONSOLE',
        dialogue: {
          en: 'Recruit {commander}, your telemetry must maintain a ≥ 35% margin under NASA-STD-5001B. Balance payload heating and RF links with ground stations. Ignite the holographic design terminal and build your spacecraft!',
          es: 'Recluta {commander}, tu telemetría debe mantener un margen ≥ 35% bajo el estándar NASA-STD-5001B. Equilibra los calentadores biológicos y el enlace de radio con la Tierra. ¡Enciende la mesa holográfica y construye tu nave!',
        },
      },
    ],
  },

  MISSION_CINEMATIC_SSO: {
    id: 'MISSION_CINEMATIC_SSO',
    actLabel: {
      en: 'MISSION BRIEFING 02 · SUN-SYNCHRONOUS TANDEM',
      es: 'BRIEFING DE MISIÓN 02 · TÁNDEM HELIOSINCRÓNICO',
    },
    title: {
      en: 'TRACERS: Chasing Explosive Solar Cusps',
      es: 'TRACERS: Cazando Cúspides Magnéticas Solares',
    },
    location: {
      en: 'SUN-SYNCHRONOUS ORBIT · 600 KM · 97.8° POLAR INCLINATION',
      es: 'ÓRBITA HELIOSINCRÓNICA · 600 KM · INCLINACIÓN POLAR 97.8°',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Sun-Synchronous precession locks orbital plane to daylight. Crossing polar cusps exposes electronics to coronal mass ejection (CME) proton bombardments.',
      es: 'CIENCIA REAL: La precesión heliosincrónica bloquea la órbita con la luz solar. Cruzar las cúspides polares expone los microchips a bombardeos de protones por eyecciones solares (CME).',
    },
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: {
          en: 'NASA HELIOPHYSICS // TWIN CONSTELLATION',
          es: 'NASA HELIOFÍSICA // CONSTELACIÓN GEMELA',
        },
        pose: 'HANGAR_PHOTO',
        dialogue: {
          en: 'MISSION CONTRACT 02 DEPLOYED // TRACERS Tandem. Twin CubeSats flying through Earth’s polar magnetic cusps to track violent space weather reconnections triggered by the Sun.',
          es: 'CONTRATO DE MISIÓN 02 DESPLEGADO // TRACERS Tándem. Dos CubeSats gemelos que atraviesan las cúspides magnéticas polares para rastrear reconexiones violentas provocadas por el Sol.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · MISSION CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE MISIÓN',
        },
        pose: 'VEGA_WINDOW_COIN',
        dialogue: {
          en: 'Listen closely, {commander}. The polar cusps look like dancing auroras from the ground, but to our sensors they are electromagnetic furnace funnels. When the Sun spits a coronal mass ejection, relativistic protons will rain on your microchips. You need radiation-hardened electronics and fine reaction wheels so your magnetometers never lose track.',
          es: 'Escucha con atención, {commander}. Las cúspides polares parecen auroras danzantes desde la Tierra, pero para nuestros sensores son embudos electromagnéticos furiosos. Cuando el Sol escupe una eyección coronal, lloverán protones relativistas sobre los chips. Necesitas electrónica Rad-Hard y ruedas de reacción precisas para que los magnetómetros no pierdan el rumbo.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · MISSION CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE MISIÓN',
        },
        pose: 'VEGA_IGNITE_CONSOLE',
        dialogue: {
          en: 'Both spacecraft must fit into the strict CSD canister dispenser envelope without exceeding our budget ceiling. Lock in your triple-junction solar wings, verify the S-band link, and lead the tandem into polar glory!',
          es: 'Ambas naves deben caber en el contenedor de despliegue CSD sin exceder el presupuesto límite. ¡Fija paneles solares de triple unión, verifica la banda S y guía al tándem hacia la gloria polar!',
        },
      },
    ],
  },

  MISSION_CINEMATIC_GEO: {
    id: 'MISSION_CINEMATIC_GEO',
    actLabel: {
      en: 'MISSION BRIEFING 03 · GEOSTATIONARY EXPEDITION',
      es: 'BRIEFING DE MISIÓN 03 · EXPEDICIÓN GEOESTACIONARIA',
    },
    title: {
      en: 'GMAT R2026a: The 3,673 m/s Hohmann Injection',
      es: 'GMAT R2026a: Inyección Hohmann de 3,673 m/s',
    },
    location: {
      en: 'GEOSTATIONARY EQUATORIAL ORBIT · 35,786 KM ALTITUDE · 0° INCLINATION',
      es: 'ÓRBITA GEOESTACIONARIA · 35,786 KM ALTITUD · INCLINACIÓN 0°',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Transfer from LEO to GEO demands ΔV = 3,673 m/s (GMAT benchmark). Tsiolkovsky equation mandates ~71% of total wet mass must be bipropellant or ion fuel.',
      es: 'CIENCIA REAL: La transferencia LEO a GEO exige ΔV = 3,673 m/s (banco GMAT). La ecuación de Tsiolkovsky dicta que el ~71% del peso total de la nave debe ser combustible.',
    },
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: {
          en: 'NOAA / NASA GOES FLIGHT DIRECTIVE',
          es: 'DIRECTIVA DE VUELO NOAA / NASA GOES',
        },
        pose: 'PAD39A_ENGINES_STEAM',
        dialogue: {
          en: 'MISSION CONTRACT 03 DEPLOYED // GEO Weather Sentinel. Inject into geostationary orbit to provide continuous early-warning monitoring against solar proton storms threatening global power grids.',
          es: 'CONTRATO DE MISIÓN 03 DESPLEGADO // Centinela Meteorológico GEO. Inyección en órbita geoestacionaria para vigilar tormentas de protones solares que amenazan la red eléctrica de la Tierra.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'TANKS_RUNNER_HEART',
        dialogue: {
          en: 'Here is where aerospace engineering shows no mercy, {commander}. To climb 36,000 km, Tsiolkovsky’s rocket equation demands a punishing 3,673 m/s of Delta-V. If you pick weak cold-gas thrusters, your ship would need 200,000 kg of gas and crush the rocket on the pad! You need high-Isp bipropellant or ion propulsion, and large pressurized tanks filled to the rim.',
          es: 'Aquí es donde la ingeniería aeroespacial no perdona, {commander}. Para subir 36,000 km, la ecuación de cohetes de Tsiolkovsky exige un castigo de 3,673 m/s de Delta-V. Si eliges propulsores de gas frío, ¡tu nave necesitaría 200 toneladas de gas y aplastaría el cohete en la rampa! Necesitas propulsión bipropelente o iónica de alto Isp y tanques presurizados al máximo.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'VEGA_IGNITE_CONSOLE',
        dialogue: {
          en: 'Cross the Van Allen radiation belt, lock your station at 35,786 km, and protect humanity from space storms. Synchronize the concurrent database and prepare for launch!',
          es: 'Cruza el cinturón de radiación de Van Allen, estaciona la nave a 35,786 km y protege a la humanidad de las tormentas espaciales. ¡Sincroniza la base de datos y prepárate para el despegue!',
        },
      },
    ],
  },

  MISSION_CINEMATIC_MOON: {
    id: 'MISSION_CINEMATIC_MOON',
    actLabel: {
      en: 'MISSION BRIEFING 04 · LUNAR TRAILBLAZER',
      es: 'BRIEFING DE MISIÓN 04 · LUNAR TRAILBLAZER',
    },
    title: {
      en: 'Hunting Water Ice in Shackleton Crater',
      es: 'Cazando Hielo de Agua en el Cráter Shackleton',
    },
    location: {
      en: 'LUNAR SOUTH POLE · 100 KM POLAR ORBIT · CRATER SHACKLETON',
      es: 'POLO SUR LUNAR · ÓRBITA POLAR 100 KM · CRÁTER SHACKLETON',
    },
    scienceFact: {
      en: 'REAL SCIENCE: Permanently Shadowed Regions (PSRs) remain at -230°C (43 K) for 2 billion years. Passing behind lunar farside induces 48-minute complete radio silence with Earth.',
      es: 'CIENCIA REAL: Los Cráteres en Sombra Permanente (PSR) están a -230°C (43 K) desde hace 2,000 millones de años. Pasar tras la Luna genera 48 min de silencio de radio total con la Tierra.',
    },
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: {
          en: 'NASA ARTEMIS // LUNAR TRAILBLAZER DIRECTIVE',
          es: 'NASA ARTEMISA // DIRECTIVA LUNAR TRAILBLAZER',
        },
        pose: 'HANGAR_PHOTO',
        dialogue: {
          en: 'MISSION CONTRACT 04 DEPLOYED // Lunar Trailblazer. Map surface volatile water-ice and hydroxyl reserves inside deep polar craters to establish life-support supplies for Artemis astronaut bases.',
          es: 'CONTRATO DE MISIÓN 04 DESPLEGADO // Lunar Trailblazer. Cartografiar reservas de hielo de agua y oxidrilos en cráteres polares para sostener las futuras bases humanas de Artemisa.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'VEGA_WINDOW_COIN',
        dialogue: {
          en: 'We have broken Earth orbit, {commander}. The south pole of the Moon holds the key to the solar system. In Shackleton crater, sunlight hasn’t reached the floor in two billion years. It is -230°C down there. If your thermal heaters or MLI blankets fail, your optics crack into pieces. And when you swing behind the Moon, you will hear nothing from Earth. You must trust your machine.',
          es: 'Hemos roto la órbita terrestre, {commander}. El polo sur de la Luna guarda la llave del sistema solar. En el cráter Shackleton, la luz solar no ha tocado el fondo en dos mil millones de años; hace -230°C. Si tus mantas aislantes o calentadores fallan, la óptica se partirá en pedazos. Y cuando gires tras la Luna, no oirás nada de la Tierra. Deberás confiar en tu máquina.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'VEGA_IGNITE_CONSOLE',
        dialogue: {
          en: 'The water you find will be turned into rocket fuel for the journey to Mars. Equip active cryocoolers, lock fine pointing to 0.02°, and guide Lunar Trailblazer into polar insertion!',
          es: 'El agua que encuentres se convertirá en combustible de cohetes para el viaje a Marte. Equipa criorefrigeradores activos, fija el apuntamiento en 0.02° y ¡guía a Lunar Trailblazer a su inserción polar!',
        },
      },
    ],
  },

  MISSION_CINEMATIC_L2: {
    id: 'MISSION_CINEMATIC_L2',
    actLabel: {
      en: 'MISSION BRIEFING 05 · JWST L2 DEEP SPACE',
      es: 'BRIEFING DE MISIÓN 05 · ESPACIO PROFUNDO JWST L2',
    },
    title: {
      en: 'JWST / CSA FGS: Gazing into the Primordial Dawn',
      es: 'JWST / CSA FGS: Mirando al Amanecer Primordial',
    },
    location: {
      en: 'SUN-EARTH LAGRANGE POINT 2 · 1.5 MILLION KM IN THE VOID',
      es: 'PUNTO DE LAGRANGE SOL-TIERRA L2 · 1.5 MILLONES DE KM EN EL VACÍO',
    },
    scienceFact: {
      en: 'REAL SCIENCE: At SE-L2, gravitational balance creates 0% eclipse conditions. 5-layer Kapton sunshield maintains 300 K gradient: +85°C sunward to 40 K (-233°C) instrument side.',
      es: 'CIENCIA REAL: En SE-L2, el balance gravitatorio crea 0% de eclipses. El escudo de 5 capas mantiene un gradiente de 300 K: +85°C al Sol y 40 K (-233°C) en los sensores criogénicos.',
    },
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: {
          en: 'NASA / CSA / ESA INFRARED OBSERVATORY',
          es: 'OBSERVATORIO INFRARROJO NASA / CSA / ESA',
        },
        pose: 'HANGAR_PHOTO',
        dialogue: {
          en: 'MISSION CONTRACT 05 DEPLOYED // Fine Guidance Sensor Observatory. Station at Lagrange Point 2 to lock sub-arcsecond guidance on the first galaxies formed after the Big Bang.',
          es: 'CONTRATO DE MISIÓN 05 DESPLEGADO // Observatorio Fine Guidance Sensor. Estacionarse en el Punto L2 para lograr seguimiento sub-arcosegundo de las primeras galaxias formadas tras el Big Bang.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'VEGA_WINDOW_COIN',
        dialogue: {
          en: 'One and a half million kilometers from home, {commander}... There is no magnetic field to steer magnetic torque rods. No GPS satellites. Nothing but deep velvet space. To capture photons emitted 13.5 billion years ago, your infrared detectors must freeze at 40 Kelvin. A single microwatt of heat leak will blind the telescope. Shield it with perfection.',
          es: 'A un millón y medio de kilómetros de casa, {commander}... No hay campo magnético para usar torquetorquers. No hay satélites GPS. Solo espacio profundo. Para captar fotones emitidos hace 13,500 millones de años, tus sensores infrarrojos deben enfriarse a 40 Kelvin. Una fuga de un microvatio de calor cegará el telescopio. Protégelo con absoluta perfección.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'VEGA_IGNITE_CONSOLE',
        dialogue: {
          en: 'Engineer {commander}, your Canadian Space Agency FGS star guidance sensor requires sub-arcsecond ADCS stability and DSN Ka-band links. Reveal the birth of the universe to mankind!',
          es: 'Ingeniero {commander}, el sensor de guiado estelar FGS exige estabilidad ADCS sub-arcosegundo y enlace Ka con la DSN. ¡Revélale a la humanidad el nacimiento del universo!',
        },
      },
    ],
  },

  MISSION_CINEMATIC_JUPITER: {
    id: 'MISSION_CINEMATIC_JUPITER',
    actLabel: {
      en: 'MISSION BRIEFING 06 · JUPITER CLIPPER FINAL BOSS',
      es: 'BRIEFING DE MISIÓN 06 · JEFE FINAL: JÚPITER CLIPPER',
    },
    title: {
      en: 'Europa Subsurface Ocean: The Last Frontier',
      es: 'El Océano Subterráneo de Europa: La Última Frontera',
    },
    location: {
      en: 'JOVIAN SYSTEM · 5.20 AU (778 MILLION KM) · EUROPA RADIATION BELT',
      es: 'SISTEMA JOVIANO · 5.20 UA (778 MILLONES DE KM) · CINTURÓN DE EUROPA',
    },
    scienceFact: {
      en: 'REAL SCIENCE: 1/R² solar collapse drops sunlight to 3.7% (50 W/m²). Standard solar arrays fail completely: Next-Gen RTG nuclear power is mandatory. Megarad ionizing radiation dose.',
      es: 'CIENCIA REAL: La ley 1/R² reduce la luz solar al 3.7% (50 W/m²). Los paneles solares comunes fallan: energía nuclear RTG es obligatoria. Dosis ionizante de megarads.',
    },
    slides: [
      {
        speaker: 'SYSTEM',
        speakerTitle: {
          en: 'NASA JPL // DEEP SPACE EXPLORATION COMMAND',
          es: 'NASA JPL // COMANDO DE EXPLORACIÓN DE ESPACIO PROFUNDO',
        },
        pose: 'JUPITER_RADIATION_BELT',
        dialogue: {
          en: 'FINAL CONTRACT ACTIVATED // Jupiter Clipper. Flyby Europa at 5.20 AU to penetrate its 20-km ice shell with ice-penetrating radar. Confirm the salinity and habitability of its hidden 100-km-deep ocean.',
          es: 'CONTRATO FINAL ACTIVADO // Júpiter Clipper. Sobrevuelo de Europa a 5.20 UA para penetrar su corteza de hielo de 20 km con radar. Confirmar la salinidad y habitabilidad de su océano oculto de 100 km de profundidad.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'OMEGA_SIREN_EUROPA',
        dialogue: {
          en: 'This is the trial of your life, {commander}. Four years ago, Icarus-1 vanished in this very darkness. At 5.2 AU, the Sun is just a faint spark. Solar panels freeze into useless glass—you MUST equip Next-Gen RTG nuclear power. And Jupiter’s radiation belts will shoot megarads of relativistic particles into your bus. Only thick tantalum armor and 70-meter DSN dishes will keep you alive.',
          es: 'Esta es la prueba de tu vida, {commander}. Hace cuatro años, el Ícaro-1 desapareció en esta misma oscuridad. A 5.2 UA, el Sol es apenas una chispa tenue. Los paneles solares se congelan en vidrio inservible: DEBES equipar un reactor nuclear RTG. Y la radiación joviana disparará megarads de partículas relativistas contra tu nave. Solo blindaje de tantalio y antenas DSN de 70 metros te mantendrán con vida.',
        },
      },
      {
        speaker: 'VEGA',
        speakerTitle: {
          en: 'COMMANDER FRANK VEGA · FLIGHT CONTROLLER',
          es: 'COMANDANTE FRANK VEGA · CONTROL DE VUELO',
        },
        pose: 'VEGA_TEARS_VICTORY',
        dialogue: {
          en: 'Under that icy crust, Europa holds more liquid water than all Earth oceans combined. If life exists beyond our world, it is swimming in that dark sea right now. We built you bolt by bolt, {commander}. You are ready. Launch the Clipper, defend your margins, and bring honor to humanity!',
          es: 'Bajo esa corteza de hielo, Europa guarda más agua líquida que todos los océanos de la Tierra juntos. Si existe vida más allá de nuestro mundo, está nadando en ese mar oscuro ahora mismo. Te forjamos tornillo a tornillo, {commander}. Estás listo. ¡Lanza el Clipper, defiende tus márgenes y haz historia para la humanidad!',
        },
      },
    ],
  },
};

export const CONTRACT_TO_CINEMATIC: Record<string, StoryCinematicId> = {
  'contract-leo-bionutrients': 'MISSION_CINEMATIC_LEO',
  'contract-sso-tracers': 'MISSION_CINEMATIC_SSO',
  'contract-geo-gmat': 'MISSION_CINEMATIC_GEO',
  'contract-moon-trailblazer': 'MISSION_CINEMATIC_MOON',
  'contract-l2-jwst-fgs': 'MISSION_CINEMATIC_L2',
  'contract-jupiter-clipper': 'MISSION_CINEMATIC_JUPITER',
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
  experienceMode?: string,
): string {
  const activeCommander =
    experienceMode === 'JPL_ENGINEER' ? engineerName : cadetName;
  return template
    .replaceAll('{cadet}', cadetName)
    .replaceAll('{engineer}', engineerName)
    .replaceAll('{commander}', activeCommander)
    .replaceAll('{mission}', missionCustomName);
}
