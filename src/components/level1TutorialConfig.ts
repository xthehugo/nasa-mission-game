import type { CMLPhase, LocalizedText } from '../types/mission';

export type TutorialTargetZone =
  | 'COMMANDER_HUD'
  | 'MISSION'
  | 'CHASSIS'
  | 'EPS'
  | 'RESOURCES'
  | 'LEFT_PANEL'
  | 'RIGHT_PANEL'
  | null;

export interface Level1TutorialStepConfig {
  index: number;
  badge: LocalizedText;
  title: LocalizedText;
  why: LocalizedText;
  inactivityHint: LocalizedText;
  targetPhase: CMLPhase;
  activeZone: TutorialTargetZone;
  isFinalExam?: boolean;
}

export const LEVEL1_TOTAL_STEPS = 11;

export const LEVEL1_TUTORIAL_STEPS: Level1TutorialStepConfig[] = [
  {
    index: 0,
    badge: { en: 'STEP 1 OF 11 · WELCOME 🚀', es: 'PASO 1 DE 11 · BIENVENIDA 🚀' },
    title: {
      en: 'Mission Goal: BioNutrients-2 (LEO 400 km)',
      es: 'Objetivo: BioNutrients-2 en órbita LEO (400 km) 🌍',
    },
    why: {
      en: 'Commander Vega: Design a 3U CubeSat to grow fresh vitamins for Artemis astronauts. In space there are no hardware stores: everything must work with ≥20% safety reserve!',
      es: 'Comandante Vega: Diseñaremos un satélite 3U para producir vitaminas frescas para astronautas de Artemis. En el espacio no hay mecánicos: todo debe funcionar con ≥20% de reserva.',
    },
    inactivityHint: {
      en: 'Click the button below to inspect your mission rules and budget.',
      es: 'Toca el botón abajo para revisar las reglas y el presupuesto de tu contrato.',
    },
    targetPhase: 'CML_1',
    activeZone: 'COMMANDER_HUD',
  },
  {
    index: 1,
    badge: { en: 'STEP 2 OF 11 · CONTRACT 📜', es: 'PASO 2 DE 11 · CONTRATO 📜' },
    title: {
      en: 'Inspect & Confirm BioNutrients-2 Contract',
      es: 'Toca la tarjeta de BioNutrients-2 para ver presupuesto y reglas 💰',
    },
    why: {
      en: 'Every flight has real constraints: 400 km altitude, 16 night eclipses every 24h, and a strict NASA budget. Exceeding mass or dollars grounds the mission.',
      es: 'Toda misión tiene reglas: órbita a 400 km, 16 noches de eclipse al día y presupuesto límite de NASA. Si te pasas de peso o dinero, el cohete no despega.',
    },
    inactivityHint: {
      en: 'Click the highlighted BioNutrients-2 card on the right panel to confirm.',
      es: 'Haz clic en la tarjeta de BioNutrients-2 en el panel derecho para confirmarla.',
    },
    targetPhase: 'CML_1',
    activeZone: 'MISSION',
  },
  {
    index: 2,
    badge: { en: 'STEP 3 OF 11 · CHASSIS 🥛', es: 'PASO 3 DE 11 · CHASIS (TAMAÑO) 🥛' },
    title: {
      en: 'Pick 3U Chassis (1U = 10×10 cm milk carton)',
      es: 'Elige el Chasis 3U (1U = caja de leche de 10×10 cm) 🛰️',
    },
    why: {
      en: 'Why chassis size? 1U is 10×10×10 cm like a milk carton. 1.5U is too cramped for bio-incubators; 3U joins 3 units to fit sensors, cameras, and batteries.',
      es: '¿Por qué importa el chasis? 1U mide 10×10×10 cm como un cartón de leche. En 1U no cabe el bio-laboratorio; 3U une 3 cajas para que quepan sensores y baterías.',
    },
    inactivityHint: {
      en: 'Select the 3U Chassis option in the left panel list.',
      es: 'Selecciona la opción de Chasis 3U en el panel izquierdo.',
    },
    targetPhase: 'CML_1',
    activeZone: 'CHASSIS',
  },
  {
    index: 3,
    badge: { en: 'STEP 4 OF 11 · SOLAR POWER ⚡', es: 'PASO 4 DE 11 · ENERGÍA SOLAR ⚡' },
    title: {
      en: 'Deploy Solar Wings to Recharge Before Eclipse',
      es: 'Despliega alas solares para recargar antes de la sombra ☀️',
    },
    why: {
      en: 'Why solar panels? In orbit, Earth blocks the Sun for 35 min every hour and a half! Deployable wings generate 2× power to fill batteries before the dark.',
      es: '¿Por qué varían los paneles? En órbita baja, la Tierra tapa al Sol durante 35 minutos cada hora y media. Las alas desplegables captan el doble de sol antes de la noche.',
    },
    inactivityHint: {
      en: 'Select Deployable Solar Array in the Power list on the left panel.',
      es: 'Elige "Alas Solares Desplegables" en la lista de energía del panel izquierdo.',
    },
    targetPhase: 'CML_1',
    activeZone: 'EPS',
  },
  {
    index: 4,
    badge: { en: 'STEP 5 OF 11 · SAFETY 20% 🛡️', es: 'PASO 5 DE 11 · REGLA DEL 20% 🛡️' },
    title: {
      en: 'Check 5 Vital Bars & Advance to Orbit (Level 02)',
      es: 'Revisa tus 5 barras vitales e ingresa a Órbita (Nivel 02) 📊',
    },
    why: {
      en: 'NASA golden rule: never design to 100% capacity! Keep at least 20% extra cushion in mass and battery so unexpected solar storms or heat spikes never kill the craft.',
      es: 'Regla de oro de la NASA: nunca diseñes al 100%. Guarda siempre al menos un 20% de reserva en peso y batería para resistir imprevistos y tormentas solares.',
    },
    inactivityHint: {
      en: 'Inspect the top telemetry bars and click "Confirm Margins & Go to Orbit (Level 02)".',
      es: 'Revisa las barras de telemetría y pulsa "Confirmar Márgenes e Ir a Órbita (Nivel 02)".',
    },
    targetPhase: 'CML_1',
    activeZone: 'RESOURCES',
  },
  {
    index: 5,
    badge: { en: 'STEP 6 OF 11 · ORBIT & ECLIPSE 🌍', es: 'PASO 6 DE 11 · ÓRBITA & ECLIPSE 🌍' },
    title: {
      en: '400 km LEO Orbit, Earth Shadow Umbra & Ground Link 📡',
      es: 'Órbita LEO 400 km, Cono de Sombra (Umbra) y Antena Terrena 📡',
    },
    why: {
      en: 'Why orbit altitude? At 400 km you orbit Earth in 92 min. In the Umbra shadow, temperature drops to -120°C and solar power drops to 0W; in daylight, you downlink data to ground stations.',
      es: '¿Por qué importa la órbita? A 400 km tardas 92 min en dar la vuelta a la Tierra. En la Umbra (sombra) cae a -120°C y 0W solares; con sol, enlazas datos con la antena terrena.',
    },
    inactivityHint: {
      en: 'Inspect the shadow cone and radio beam, then click "Confirm Orbit & Go to Payload (Level 03)".',
      es: 'Observa el cono de sombra y el haz de radio, luego pulsa "Confirmar Órbita e Ir a Carga Útil (Nivel 03)".',
    },
    targetPhase: 'CML_2',
    activeZone: 'LEFT_PANEL',
  },
  {
    index: 6,
    badge: { en: 'STEP 7 OF 11 · PAYLOAD & SWaP-C 🔬', es: 'PASO 7 DE 11 · CARGA ÚTIL & SWaP-C 🔬' },
    title: {
      en: 'Equip BioNutrients-2 & Balance Mass vs Power (SWaP-C) ⚖️',
      es: 'Equipa BioNutrients-2 y equilibra Masa vs Potencia (SWaP-C) ⚖️',
    },
    why: {
      en: 'Why trade space? Every scientific instrument consumes mass, watts, volume, and budget (SWaP-C). If you upgrade antennas or cameras, make sure power and mass stay green.',
      es: '¿Por qué varía este espacio? Cada instrumento científico exige su peaje: consume masa (kg), energía (W), volumen y costo (SWaP-C). Balancea tus subsistemas para mantener margen positivo.',
    },
    inactivityHint: {
      en: 'Check BioNutrients-2 payload and click "Confirm Subsystems & Go to Tanks (Level 04)".',
      es: 'Comprueba la Carga Útil BioNutrients-2 y pulsa "Confirmar Subsistemas e Ir a Tanques (Nivel 04)".',
    },
    targetPhase: 'CML_3',
    activeZone: 'LEFT_PANEL',
  },
  {
    index: 7,
    badge: { en: 'STEP 8 OF 11 · TANKS & PROPULSION ⛽', es: 'PASO 8 DE 11 · TANQUES & PROPULSIÓN ⛽' },
    title: {
      en: 'Load Propellant (ΔV) & Batteries to Survive Eclipse 🔋',
      es: 'Carga Combustible (ΔV) y Baterías para Sobrevivir al Eclipse 🔋',
    },
    why: {
      en: 'Why tanks matter? The rocket only drops you in space; your satellite needs cold gas / propellant (ΔV) to maintain orientation and charged batteries to survive the frozen night.',
      es: '¿Por qué varían los tanques? El cohete solo te deja arriba; tu satélite necesita propelente (ΔV) para orientarse y baterías cargadas para no congelarse en la noche.',
    },
    inactivityHint: {
      en: 'Click "Fill All Tanks" on the left, then click "Confirm Tanks & Go to MCR Gate (Level 05)".',
      es: 'Pulsa "Llenar Todos los Tanques" a la izquierda y luego "Confirmar Tanques e Ir a Revisión MCR (Nivel 05)".',
    },
    targetPhase: 'CML_4',
    activeZone: 'LEFT_PANEL',
  },
  {
    index: 8,
    badge: { en: 'STEP 9 OF 11 · MCR GATE (GREEN FLAG) 📋', es: 'PASO 9 DE 11 · REVISIÓN MCR (LUZ VERDE) 📋' },
    title: {
      en: 'Audit 5 Subsystems V&V & Sign Launch Authorization ✍️',
      es: 'Auditoría V&V de 5 Subsistemas y Firma de Despegue ✍️',
    },
    why: {
      en: 'Why MCR gate? There are no mechanics in space! NASA audits all 5 subsystems against strict standards before investing millions to place the rocket on the launch pad.',
      es: '¿Por qué la revisión MCR? ¡En el espacio no hay mecánicos! La NASA audita los 5 subsistemas antes de gastar millones en llevar el cohete a la torre de despegue.',
    },
    inactivityHint: {
      en: 'Check cyan cards (or click Auto-Resolve) and hold "Sign MCR" to authorize launch.',
      es: 'Verifica tarjetas en cian (o pulsa Auto-Resolver) y mantén presionado "Firmar MCR" para autorizar.',
    },
    targetPhase: 'CML_5',
    activeZone: 'RIGHT_PANEL',
  },
  {
    index: 9,
    badge: { en: 'STEP 10 OF 11 · LEO FLIGHT & CRISIS 🚀', es: 'PASO 10 DE 11 · VUELO ORBITAL & CRISIS 🚀' },
    title: {
      en: 'Cape Canaveral Launch, Max-Q & Resolve In-Flight Crisis ⚡',
      es: 'Despegue en Cabo Cañaveral, Max-Q y Crisis en Vuelo ⚡',
    },
    why: {
      en: 'During ascent the rocket shakes through the sound barrier (Max-Q). In orbit, use your safety margins to solve the flight crisis and protect the bio-vitamin cultures!',
      es: 'Durante el ascenso el cohete vibra al romper la barrera del sonido (Max-Q). En órbita, usa tus márgenes de reserva para resolver la crisis y proteger el cultivo de vitaminas.',
    },
    inactivityHint: {
      en: 'Watch the launch sequence and select an optimal recovery action in the Flight Crisis card.',
      es: 'Observa el despegue y elige la maniobra óptima en la tarjeta de Crisis en Vuelo a la derecha.',
    },
    targetPhase: 'SIMULATION',
    activeZone: 'RIGHT_PANEL',
  },
  {
    index: 10,
    badge: { en: 'STEP 11 OF 11 · CERTIFICATE & 3 STARS 🌟', es: 'PASO 11 DE 11 · CERTIFICADO & 3 ESTRELLAS 🌟' },
    title: {
      en: 'Mission Complete! Claim 3 Stars & Unlock TRACERS 🏆',
      es: '¡Misión Cumplida! Reclama tus 3 Estrellas y Desbloquea TRACERS 🏆',
    },
    why: {
      en: 'Superb engineering! You balanced mass, power, orbit, and cost with real scientific rigor. Open your official NASA Certificate to claim your stars and advance to Level 2.',
      es: '¡Excelente trabajo de ingeniería! Has equilibrado masa, potencia, órbita y presupuesto con rigor científico real. Abre tu Certificado Oficial NASA para avanzar al Nivel 2.',
    },
    inactivityHint: {
      en: 'Click "Open Flight Certificate" to review your engineering score and unlock Level 2.',
      es: 'Pulsa "Abrir Certificado de Vuelo" para revisar tu puntuación y desbloquear el Nivel 2.',
    },
    targetPhase: 'SIMULATION',
    activeZone: null,
    isFinalExam: true,
  },
];
