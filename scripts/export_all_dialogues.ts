import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  STORY_CINEMATICS,
  PHASE_INTERACTIVE_TOURS,
  COMMANDER_PHASE_BEATS,
} from '../src/components/narrativeConfig';
import { CAMPAIGN_MISSION_CONTENT } from '../src/components/missionDialogueConfig';
import { LEVEL1_TUTORIAL_STEPS } from '../src/components/level1TutorialConfig';

interface DialogueItem {
  id: string;
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
  es: string;
  en: string;
  category: string;
}

const dialogues: DialogueItem[] = [];
const seenIds = new Set<string>();

function addDialogue(
  rawId: string,
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
  es: string,
  en: string,
  category: string
) {
  if (!es || !en) return;

  const cleanEs = es
    .replaceAll('{commander}', 'Orion')
    .replaceAll('{callsign}', 'Orion')
    .replaceAll('{cadet}', 'Orion')
    .replaceAll('{engineer}', 'Vanguard')
    .replaceAll('{mission}', 'Ícaro-Pionero')
    .trim();

  const cleanEn = en
    .replaceAll('{commander}', 'Orion')
    .replaceAll('{callsign}', 'Orion')
    .replaceAll('{cadet}', 'Orion')
    .replaceAll('{engineer}', 'Vanguard')
    .replaceAll('{mission}', 'Icarus-Pioneer')
    .trim();

  let id = rawId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  if (seenIds.has(id)) {
    let count = 2;
    while (seenIds.has(`${id}_${count}`)) count++;
    id = `${id}_${count}`;
  }
  seenIds.add(id);

  dialogues.push({
    id,
    speaker,
    es: cleanEs,
    en: cleanEn,
    category,
  });
}

// 1. Onboarding Welcome Speech
addDialogue(
  'onboarding_vega_welcome',
  'VEGA',
  '¡Atención recluta! La NASA te da la bienvenida al Proyecto Ícaro. En la escuela te enseñan que el espacio es silencioso y hermoso, pero allá arriba es una bestia helada: un error de cálculo y se acaba la misión. No enviamos astronautas con esperanzas; los enviamos con máquinas infalibles forjadas tornillo a tornillo. Elige tu alistamiento y preséntate para tu primera asignación en la Academia.',
  'Attention recruit! NASA welcomes you to Project Icarus. Space forgives zero miscalculations: we forge every spacecraft bolt by bolt. Choose your enlistment and prepare for your first Academy mission.',
  'ONBOARDING'
);

// 2. All 20 STORY_CINEMATICS (Every single slide!)
for (const [sceneKey, scene] of Object.entries(STORY_CINEMATICS)) {
  const sceneId = sceneKey.toLowerCase();
  scene.slides.forEach((slide, sIdx) => {
    addDialogue(
      `cinema_${sceneId}_slide_${sIdx + 1}`,
      slide.speaker as any,
      slide.dialogue.es,
      slide.dialogue.en,
      `CINEMA_${sceneId.toUpperCase()}`
    );
  });
}

// 3. Level 1 Tutorial 11 Steps
LEVEL1_TUTORIAL_STEPS.forEach((step, idx) => {
  if (step.title && step.why) {
    addDialogue(
      `tut_step_${idx + 1}_why_vega`,
      'VEGA',
      step.why.es,
      step.why.en,
      'TUTORIAL_L1'
    );
    // Also include composite line spoken when clicking "VOZ VEGA"
    addDialogue(
      `tut_step_${idx + 1}_composite_vega`,
      'VEGA',
      `${step.title.es}. ${step.why.es}`,
      `${step.title.en}. ${step.why.en}`,
      'TUTORIAL_L1'
    );
  }
  if (step.inactivityHint) {
    addDialogue(
      `tut_step_${idx + 1}_hint_astra`,
      'ROSTOVA',
      step.inactivityHint.es,
      step.inactivityHint.en,
      'TUTORIAL_L1'
    );
  }
});

// 4. Mission Dialogues across ALL 6 contracts & ALL 6 phases
for (const [contractId, phases] of Object.entries(CAMPAIGN_MISSION_CONTENT)) {
  const shortContract = contractId.replace('contract-', '').replace(/-/g, '_');
  for (const [phaseKey, content] of Object.entries(phases)) {
    const p = phaseKey.toLowerCase();

    // Vega (Cadet) brief
    if (content.commanderBrief?.cadet) {
      addDialogue(
        `mission_${shortContract}_${p}_vega_cadet`,
        'VEGA',
        content.commanderBrief.cadet.es,
        content.commanderBrief.cadet.en,
        'MISSION_BRIEF'
      );
    }

    // Rostova (JPL) brief
    if (content.commanderBrief?.jpl) {
      addDialogue(
        `mission_${shortContract}_${p}_rostova_jpl`,
        'ROSTOVA',
        content.commanderBrief.jpl.es,
        content.commanderBrief.jpl.en,
        'MISSION_BRIEF'
      );
    }

    // ASTRA one-liner guide
    if (content.astraGuide?.oneLiner) {
      addDialogue(
        `mission_${shortContract}_${p}_astra_guide`,
        'ROSTOVA',
        content.astraGuide.oneLiner.es,
        content.astraGuide.oneLiner.en,
        'ASTRA_GUIDE'
      );
    }

    // ASTRA hints
    if (content.astraGuide?.hints) {
      content.astraGuide.hints.forEach((hint, hIdx) => {
        addDialogue(
          `mission_${shortContract}_${p}_astra_hint_${hIdx + 1}`,
          'ROSTOVA',
          hint.es,
          hint.en,
          'ASTRA_GUIDE'
        );
      });
    }
  }
}

// 5. PHASE_INTERACTIVE_TOURS across all modules CML 01-06
for (const [phaseKey, steps] of Object.entries(PHASE_INTERACTIVE_TOURS)) {
  const p = phaseKey.toLowerCase();
  steps.forEach((step, sIdx) => {
    if (step.instruction) {
      addDialogue(
        `tour_${p}_step_${sIdx + 1}_vega`,
        'VEGA',
        step.instruction.es,
        step.instruction.en,
        'PHASE_TOUR'
      );
    }
    if (step.astraTip) {
      addDialogue(
        `tour_${p}_step_${sIdx + 1}_astra`,
        'ROSTOVA',
        step.astraTip.es,
        step.astraTip.en,
        'PHASE_TOUR'
      );
    }
  });
}

// 6. COMMANDER_PHASE_BEATS across all 6 phases
for (const [phaseKey, beat] of Object.entries(COMMANDER_PHASE_BEATS)) {
  const p = phaseKey.toLowerCase();
  if (beat.cadetDialogue) {
    addDialogue(
      `beat_${p}_cadet_vega`,
      'VEGA',
      beat.cadetDialogue.es,
      beat.cadetDialogue.en,
      'COMMANDER_BEAT'
    );
  }
  if (beat.jplDialogue) {
    addDialogue(
      `beat_${p}_jpl_rostova`,
      'ROSTOVA',
      beat.jplDialogue.es,
      beat.jplDialogue.en,
      'COMMANDER_BEAT'
    );
  }
}

const outPath = resolve('scripts/dialogues.json');
writeFileSync(outPath, JSON.stringify(dialogues, null, 2), 'utf-8');
console.log(`[SUCCESS] Fully exported ${dialogues.length} total dialogues to ${outPath}`);
