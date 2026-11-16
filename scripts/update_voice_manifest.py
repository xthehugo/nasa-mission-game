import json
import os

def main():
    dialogues_path = os.path.join(os.path.dirname(__file__), "dialogues.json")
    with open(dialogues_path, "r", encoding="utf-8") as f:
        dialogues = json.load(f)

    manifest_entries = []

    for d in dialogues:
        did = d["id"]
        speaker = d["speaker"]
        filename = f"{did}.mp3"

        # ES Entry
        manifest_entries.append({
            "id": f"{did}_es",
            "speaker": speaker,
            "lang": "es",
            "filename": filename,
            "canonicalText": d["es"]
        })

        # EN Entry
        manifest_entries.append({
            "id": f"{did}_en",
            "speaker": speaker,
            "lang": "en",
            "filename": filename,
            "canonicalText": d["en"]
        })

    ts_content = """// Auto-generated Edge-TTS voice manifest for dual-language (ES & EN) playback
export interface PrebakedVoiceEntry {
  id: string;
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
  lang: 'en' | 'es';
  filename: string;
  canonicalText: string;
}

export const PREBAKED_VOICE_MANIFEST: PrebakedVoiceEntry[] = """ + json.dumps(manifest_entries, ensure_ascii=False, indent=2) + ";\n"

    target_path = os.path.join(os.path.dirname(__file__), "..", "src", "components", "voiceManifest.ts")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"Updated voiceManifest.ts with {len(manifest_entries)} entries.")

if __name__ == "__main__":
    main()
