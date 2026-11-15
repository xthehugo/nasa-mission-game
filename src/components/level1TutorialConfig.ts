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
    badge: { en: 'STEP 1 OF 10 · WELCOME', es: 'PASO 1 DE 10 · BIENVENIDA' },
    title: {
      en: 'Mission Goal: BioNutrients-2 (LEO 400 km)',
      es: 'Objetivo: BioNutrients-2 en órbita LEO (400 km)',
    },
    why: {
      en: 'Commander Vega: Build a 3U CubeSat that synthesizes nutrients in microgravity with ≥35% mass & power margin.',
      es: 'Comandante Vega: Diseña un CubeSat 3U que sintetice nutrientes en microgravedad con ≥35% de margen en masa y energía.',
    },
    inactivityHint: {
      en: 'Click "Got it · Read Contract" below to inspect your mission rules.',
      es: 'Pulsa "Entendido · Leer contrato" aquí abajo para revisar las reglas de tu misión.',
    },
    targetPhase: 'CML_1',
    activeZone: 'COMMANDER_HUD',
  },
  {
    index: 1,
    badge: { en: 'STEP 2 OF 10 · CONTRACT', es: 'PASO 2 DE 10 · CONTRATO' },
    title: {
      en: 'Read & Confirm the BioNutrients-2 Contract',
      es: 'Toca la tarjeta de BioNutrients-2 para leer restricciones y presupuesto',
    },
    why: {
      en: 'Every NASA mission starts with constraints: orbital altitude, 16 daily eclipses, and budget cap.',
      es: 'Toda misión NASA parte de restricciones reales: altitud orbital, 16 eclipses diarios y tope de presupuesto.',
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
    badge: { en: 'STEP 3 OF 10 · CHASSIS', es: 'PASO 3 DE 10 · CHASIS' },
    title: {
      en: 'Test Chassis Sizes & Select 3U Balanced',
      es: 'Prueba un chasis y elige el 3U correcto para tu carga útil',
    },
    why: {
      en: 'Chassis size defines internal volume (U) and structural mass. Too small breaks fairing rules; 3U fits BioNutrients-2.',
      es: 'El chasis define el volumen interno (U) y la masa estructural. Si es muy pequeño no cabe la carga; 3U es el estándar ideal.',
    },
    inactivityHint: {
      en: 'Click 1.5U or 2U to see the mass/volume effect, then select 3U on the left.',
      es: 'Haz clic en 1.5U o 2U para ver el efecto en masa/volumen y luego elige 3U en el panel izquierdo.',
    },
    targetPhase: 'CML_1',
    activeZone: 'CHASSIS',
  },
  {
    index: 3,
    badge: { en: 'STEP 4 OF 10 · POWER (EPS)', es: 'PASO 4 DE 10 · ENERGÍA EPS' },
    title: {
      en: 'Choose Solar Panels & Check Eclipse Power',
      es: 'Elige paneles solares para sobrevivir los eclipses en LEO',
    },
    why: {
      en: 'In LEO you spend ~35 min in Earth’s shadow every 92 min. Your solar wings must recharge batteries fast.',
      es: 'En LEO pasas ~35 min a oscuras cada 92 min. Tus alas solares deben generar suficiente potencia para recargar baterías.',
    },
    inactivityHint: {
      en: 'Select a deployable solar array in Step 2 (EPS) on the left panel.',
      es: 'Elige un panel solar desplegable en el acordeón Energía EPS del panel izquierdo.',
    },
    targetPhase: 'CML_1',
    activeZone: 'EPS',
  },
  {
    index: 4,
    badge: { en: 'STEP 5 OF 10 · 35% RULE', es: 'PASO 5 DE 10 · REGLA DEL 35%' },
    title: {
      en: 'Check Mass, Power & Budget Telemetry (≥35% Margin)',
      es: 'Revisa tus 5 barras de telemetría y la regla del 35%',
    },
    why: {
      en: 'NASA CML requires ≥35% design margin at early stages so later weight or power growth never cancels the mission.',
      es: 'La regla CML de NASA exige ≥35% de margen al inicio para que aumentos futuros de peso o consumo no cancelen la misión.',
    },
    inactivityHint: {
      en: 'Inspect the 5 telemetry bars on the top-left, then click "Confirm Margins & Continue".',
      es: 'Observa las 5 barras arriba a la izquierda y pulsa "Confirmar márgenes →" para pasar a Carga Útil.',
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
