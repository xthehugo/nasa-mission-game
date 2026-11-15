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

export const LEVEL1_TOTAL_STEPS = 10;

export const LEVEL1_TUTORIAL_STEPS: Level1TutorialStepConfig[] = [
  {
    index: 0,
    badge: { en: 'STEP 1 OF 10 · WELCOME 🚀', es: 'PASO 1 DE 10 · BIENVENIDA 🚀' },
    title: {
      en: 'Mission Goal: BioNutrients-2 (LEO 400 km)',
      es: 'Objetivo: BioNutrients-2 en órbita LEO (400 km) 🌍',
    },
    why: {
      en: 'Commander Vega: Build a 3U CubeSat to grow fresh vitamins in space for future Artemis astronauts. Keep ≥35% safety margin!',
      es: 'Comandante Vega: Fabrica un satélite 3U para producir vitaminas frescas para astronautas de Artemis. ¡Mantén ≥35% de margen de seguridad!',
    },
    inactivityHint: {
      en: 'Click "Got it · Read Contract" below to inspect your mission rules.',
      es: 'Toca el botón grande abajo para revisar las reglas y el presupuesto de tu misión.',
    },
    targetPhase: 'CML_1',
    activeZone: 'COMMANDER_HUD',
  },
  {
    index: 1,
    badge: { en: 'STEP 2 OF 10 · CONTRACT 📜', es: 'PASO 2 DE 10 · CONTRATO 📜' },
    title: {
      en: 'Read & Confirm BioNutrients-2 Contract',
      es: 'Toca la tarjeta de BioNutrients-2 para ver presupuesto y reglas 💰',
    },
    why: {
      en: 'Every space flight has real rules: launch altitude (400 km), 16 night eclipses every day, and a strict money cap.',
      es: 'Todo vuelo espacial tiene reglas reales: altura de 400 km, 16 noches de eclipse al día y un presupuesto que no puedes pasar.',
    },
    inactivityHint: {
      en: 'Click the highlighted BioNutrients-2 card on the right panel to confirm.',
      es: 'Haz clic en la tarjeta iluminada de BioNutrients-2 en el panel derecho para confirmarla.',
    },
    targetPhase: 'CML_1',
    activeZone: 'MISSION',
  },
  {
    index: 2,
    badge: { en: 'STEP 3 OF 10 · CHASSIS 🥛', es: 'PASO 3 DE 10 · CHASIS (TAMAÑO) 🥛' },
    title: {
      en: 'Test Chassis Sizes & Pick 3U Balanced',
      es: 'Prueba tamaños (1U es como una caja de leche) y elige 3U 🛰️',
    },
    why: {
      en: '1U is 10×10 cm like a milk carton! 1.5U is too small for our farm lab; 3U joins three cartons to fit powerful cameras and science.',
      es: '¡1U mide 10×10 cm, igual que una caja de leche! Junta 3 cajas (3U) para que quepan los nutrientes, las cámaras y las baterías.',
    },
    inactivityHint: {
      en: 'Click 1.5U or 2U to see how the rocket balances, then pick 3U on the left.',
      es: 'Toca 1.5U o 2U para ver cómo cambia la nave y el peso, y luego elige 3U en el panel izquierdo.',
    },
    targetPhase: 'CML_1',
    activeZone: 'CHASSIS',
  },
  {
    index: 3,
    badge: { en: 'STEP 4 OF 10 · SOLAR POWER ⚡', es: 'PASO 4 DE 10 · ENERGÍA SOLAR ⚡' },
    title: {
      en: 'Deploy Solar Wings to Survive LEO Eclipses',
      es: 'Abre las alas solares para no quedarte sin batería en la sombra ☀️',
    },
    why: {
      en: 'In orbit, Earth blocks the Sun for ~35 minutes every hour and a half! Deployable solar wings recharge batteries super fast.',
      es: 'En el espacio, la Tierra tapa al Sol durante 35 minutos cada hora y media. Las alas solares recargan las baterías para no congelarte.',
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
    badge: { en: 'STEP 5 OF 10 · SAFETY 35% 🛡️', es: 'PASO 5 DE 10 · REGLA DEL 35% 🛡️' },
    title: {
      en: 'Check 5 Vital Signs (Keep ≥35% Green Margin)',
      es: 'Revisa tus 5 signos vitales y la regla del 35% de reserva 📊',
    },
    why: {
      en: 'NASA golden rule: never design to 100% capacity! Keep at least 35% extra battery and weight cushion so nothing breaks.',
      es: 'Regla de oro de la NASA: nunca gastes el 100%. Guarda siempre al menos un 35% de batería y peso de sobra por si hay emergencias.',
    },
    inactivityHint: {
      en: 'Inspect the 5 bars on the top-left, then click "Confirm Margins & Continue".',
      es: 'Observa las 5 barras de arriba a la izquierda y pulsa el botón para avanzar a Carga Útil.',
    },
    targetPhase: 'CML_1',
    activeZone: 'RESOURCES',
  },
  {
    index: 5,
    badge: { en: 'STEP 6 OF 10 · PAYLOAD', es: 'PASO 6 DE 10 · CARGA ÚTIL' },
    title: {
      en: 'Verify & Toggle Science Payload (SWaP-C Impact)',
      es: 'Activa/verifica la carga útil de nutrientes y mira su impacto SWaP-C',
    },
    why: {
      en: 'Science instruments drive Mass, Power, Volume, and Cost (SWaP-C). Watch telemetry react as you equip it.',
      es: 'Cada instrumento consume masa, energía, volumen y presupuesto (SWaP-C). Observa cómo reaccionan las barras al activarlo.',
    },
    inactivityHint: {
      en: 'Click BioNutrients-2 Microgravity Lab in the Payload list to test its SWaP-C effect.',
      es: 'Haz clic en BioNutrients-2 en la lista de Carga Útil para ver su efecto en masa y energía.',
    },
    targetPhase: 'CML_3',
    activeZone: 'LEFT_PANEL',
  },
  {
    index: 6,
    badge: { en: 'STEP 7 OF 10 · TRADE-OFF', es: 'PASO 7 DE 10 · TRADE-OFF REAL' },
    title: {
      en: 'Make a Real Engineering Trade-Off (Telecom / Thermal / Prop)',
      es: 'Haz un trade-off real: mejora Telecom, Térmico o Propulsión',
    },
    why: {
      en: 'In aerospace there is no free lunch: upgrading link or propulsion improves performance but increases mass & cost.',
      es: 'En ingeniería espacial nada es gratis: mejorar enlace o propulsión da más margen técnico, pero sube masa y costo.',
    },
    inactivityHint: {
      en: 'Pick a module tab (e.g. TELECOM RF or THERMAL) and test a different option.',
      es: 'Elige una pestaña (ej. TELECOM RF o TÉRMICO) y prueba otra opción para ver el intercambio.',
    },
    targetPhase: 'CML_3',
    activeZone: 'LEFT_PANEL',
  },
  {
    index: 7,
    badge: { en: 'STEP 8 OF 10 · MCR GATE', es: 'PASO 8 DE 10 · REVISIÓN MCR' },
    title: {
      en: 'Pass Mission Concept Review (MCR / Green Flag)',
      es: 'Aprueba la Revisión MCR (Green Flag) antes del lanzamiento',
    },
    why: {
      en: 'Before launch, NASA reviews V&V tests, 35% margins, and zero critical conflicts to sign the Green Flag.',
      es: 'Antes de lanzar, NASA verifica pruebas V&V, márgenes del 35% y cero conflictos críticos para firmar la luz verde.',
    },
    inactivityHint: {
      en: 'Run V&V checks if needed and hold/click the Authorize MCR Launch button.',
      es: 'Ejecuta las pruebas V&V si hace falta y mantén/pulsa el botón Autorizar Lanzamiento MCR.',
    },
    targetPhase: 'CML_5',
    activeZone: 'RIGHT_PANEL',
  },
  {
    index: 8,
    badge: { en: 'STEP 9 OF 10 · LEO FLIGHT', es: 'PASO 9 DE 10 · VUELO LEO' },
    title: {
      en: 'Handle LEO Eclipses & Solve an In-Flight Crisis',
      es: 'Supera los eclipses en LEO y resuelve una crisis en vuelo',
    },
    why: {
      en: 'Real missions face solar storms, eclipses, and rain fade. Apply your margins to choose the optimal recovery.',
      es: 'En órbita surgen tormentas solares, eclipses y atenuación por lluvia. Usa tus márgenes para elegir la mejor respuesta.',
    },
    inactivityHint: {
      en: 'Select an optimal decision in the Flight Crisis panel on the right.',
      es: 'Elige la respuesta óptima en la tarjeta de Crisis en Vuelo en el panel derecho.',
    },
    targetPhase: 'SIMULATION',
    activeZone: 'RIGHT_PANEL',
  },
  {
    index: 9,
    badge: { en: 'STEP 10 OF 10 · FINAL EXAM', es: 'PASO 10 DE 10 · EXAMEN FINAL' },
    title: {
      en: 'Final Check (No Halo): Complete Mission & Unlock Level 2',
      es: 'Examen final (sin halo): completa la misión y desbloquea Nivel 2',
    },
    why: {
      en: 'Apply what you learned without highlighted halos: finish the flight and claim your BioNutrients-2 stars.',
      es: 'Aplica lo aprendido sin ayuda del halo: completa el vuelo, revisa tu resultado y desbloquea TRACERS (Nivel 2).',
    },
    inactivityHint: {
      en: 'Resolve remaining crises or open the Post-Mission Certificate to finish.',
      es: 'Resuelve las crisis restantes y abre el Certificado Final para desbloquear el Nivel 2.',
    },
    targetPhase: 'SIMULATION',
    activeZone: null,
    isFinalExam: true,
  },
];
