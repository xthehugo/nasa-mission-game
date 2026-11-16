import asyncio
import json
import os
import re
import sys
import edge_tts

VOICE_MAP = {
    "VEGA": {
        "es": "es-MX-JorgeNeural",
        "en": "en-US-GuyNeural",
    },
    "ROSTOVA": {
        "es": "es-MX-DaliaNeural",
        "en": "en-US-AriaNeural",
    },
    "SYSTEM": {
        "es": "es-MX-JorgeNeural",
        "en": "en-US-ChristopherNeural",
    },
}

def normalize_key(text: str) -> str:
    """Normalize text to use as lookup key in manifest"""
    if not text:
        return ""
    t = text.lower()
    t = re.sub(r'["“”\'`]', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

async def synthesize_one(sem, text, voice, out_path, item_id, lang):
    async with sem:
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1024:
            return True, f"[CACHED] {item_id} ({lang})"
        
        # Text adjustments for better pronunciation
        speak_text = text
        speak_text = speak_text.replace("ΔV", "delta V" if lang == "en" else "delta V")
        speak_text = speak_text.replace("1/R²", "one over R squared" if lang == "en" else "uno sobre R al cuadrado")
        speak_text = speak_text.replace("CSLI", "C-S-L-I")
        speak_text = speak_text.replace("ADCS", "A-D-C-S")
        speak_text = speak_text.replace("MCR", "M-C-R")
        speak_text = speak_text.replace("SWaP-C", "Swap C")
        speak_text = re.sub(r'\b(\d+)U\b', r'\1 U', speak_text)

        try:
            communicate = edge_tts.Communicate(speak_text, voice)
            await communicate.save(out_path)
            return True, f"[DONE] {item_id} ({lang}) -> {os.path.basename(out_path)}"
        except Exception as e:
            return False, f"[ERROR] {item_id} ({lang}): {e}"

async def main():
    json_path = os.path.join(os.path.dirname(__file__), "dialogues.json")
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        dialogues = json.load(f)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out_dir_es = os.path.join(project_root, "public", "audio", "es")
    out_dir_en = os.path.join(project_root, "public", "audio", "en")
    os.makedirs(out_dir_es, exist_ok=True)
    os.makedirs(out_dir_en, exist_ok=True)

    print(f"Starting edge-tts generation for {len(dialogues)} dialogues in ES and EN...")
    sem = asyncio.Semaphore(5)

    tasks = []
    manifest_map = {}

    for item in dialogues:
        did = item["id"]
        speaker = item.get("speaker", "VEGA")
        es_text = item["es"]
        en_text = item["en"]

        es_voice = VOICE_MAP.get(speaker, VOICE_MAP["VEGA"])["es"]
        en_voice = VOICE_MAP.get(speaker, VOICE_MAP["VEGA"])["en"]

        filename = f"{did}.mp3"
        es_out = os.path.join(out_dir_es, filename)
        en_out = os.path.join(out_dir_en, filename)

        # Store in manifest lookup
        manifest_map[normalize_key(es_text)] = filename
        manifest_map[normalize_key(en_text)] = filename

        tasks.append(synthesize_one(sem, es_text, es_voice, es_out, did, "es"))
        tasks.append(synthesize_one(sem, en_text, en_voice, en_out, did, "en"))

    results = await asyncio.gather(*tasks)

    success_count = sum(1 for ok, _ in results if ok)
    fail_count = sum(1 for ok, _ in results if not ok)

    print(f"\nFinished! Total tasks: {len(tasks)} | Succeeded: {success_count} | Failed: {fail_count}")

    # Write runtime manifest for frontend
    manifest_path = os.path.join(project_root, "public", "audio", "voice_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "totalDialogues": len(dialogues),
            "manifestMap": manifest_map
        }, f, ensure_ascii=False, indent=2)

    print(f"Manifest written to: {manifest_path}")

if __name__ == "__main__":
    asyncio.run(main())
