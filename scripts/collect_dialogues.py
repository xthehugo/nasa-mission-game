import re
import json
import os

dialogues = []
seen_ids = set()

def add_dialogue(did, speaker, es_text, en_text):
    if not es_text or not en_text:
        return
    # Clean up callsign placeholders to default 'Orion'
    clean_es = es_text.replace('{commander}', 'Orion').replace('{callsign}', 'Orion').replace('{mission}', 'Ícaro-Pionero').strip()
    clean_en = en_text.replace('{commander}', 'Orion').replace('{callsign}', 'Orion').replace('{mission}', 'Icarus-Pioneer').strip()
    
    clean_id = re.sub(r'[^a-zA-Z0-9_-]', '_', did).lower()
    if clean_id in seen_ids:
        # Avoid duplicate IDs
        idx = 2
        while f"{clean_id}_{idx}" in seen_ids:
            idx += 1
        clean_id = f"{clean_id}_{idx}"
    seen_ids.add(clean_id)
    dialogues.append({
        "id": clean_id,
        "speaker": speaker,
        "es": clean_es,
        "en": clean_en
    })

# 1. Parse generateVoices.mjs for existing cinematic lines
try:
    with open('scripts/generateVoices.mjs', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract entries from VOICE_QUEUE
    items = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*speaker:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"],\s*en:\s*['\"]([^'\"]+)['\"]", content)
    for did, spk, es, en in items:
        add_dialogue(did, spk, es, en)
except Exception as e:
    print(f"Error reading generateVoices.mjs: {e}")

# 2. Parse level1TutorialConfig.ts
try:
    with open('src/components/level1TutorialConfig.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # Steps have why (Vega) and inactivityHint (ASTRA)
    steps = re.findall(r"why:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    hints = re.findall(r"inactivityHint:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    
    for i, (en, es) in enumerate(steps):
        add_dialogue(f"tut_l1_step_{i}_vega", "VEGA", es, en)
    for i, (en, es) in enumerate(hints):
        add_dialogue(f"tut_l1_step_{i}_astra", "ROSTOVA", es, en)
except Exception as e:
    print(f"Error reading level1TutorialConfig.ts: {e}")

# 3. Parse missionDialogueConfig.ts
try:
    with open('src/components/missionDialogueConfig.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # Commander briefs (cadet & jpl)
    # cadet: { en: '...', es: '...' }
    cadets = re.findall(r"cadet:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    for i, (en, es) in enumerate(cadets):
        add_dialogue(f"mission_cadet_{i}", "VEGA", es, en)
    
    jpls = re.findall(r"jpl:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    for i, (en, es) in enumerate(jpls):
        add_dialogue(f"mission_jpl_{i}", "ROSTOVA", es, en)

    # astraGuide: oneLiner
    oneliners = re.findall(r"oneLiner:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    for i, (en, es) in enumerate(oneliners):
        add_dialogue(f"mission_astra_oneliner_{i}", "ROSTOVA", es, en)
except Exception as e:
    print(f"Error reading missionDialogueConfig.ts: {e}")

# 4. Parse narrativeConfig.ts for interactive tours
try:
    with open('src/components/narrativeConfig.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    instructions = re.findall(r"instruction:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    for i, (en, es) in enumerate(instructions):
        add_dialogue(f"tour_instruction_{i}", "VEGA", es, en)

    astratips = re.findall(r"astraTip:\s*\{\s*en:\s*['\"]([^'\"]+)['\"],\s*es:\s*['\"]([^'\"]+)['\"]\s*\}", content)
    for i, (en, es) in enumerate(astratips):
        add_dialogue(f"tour_astratip_{i}", "ROSTOVA", es, en)
except Exception as e:
    print(f"Error reading narrativeConfig.ts: {e}")

output_path = 'scripts/dialogues.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(dialogues, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(dialogues)} dialogues to {output_path}")
