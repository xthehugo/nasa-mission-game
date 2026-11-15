import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export type MissionSpeaker = 'VEGA' | 'ROSTOVA' | 'SYSTEM';

// Pre-made ElevenLabs voices (supported on all plans including Free tier)
export const SPEAKER_VOICES: Record<
  MissionSpeaker,
  {
    voiceId: string;
    name: string;
    stability: number;
    similarityBoost: number;
  }
> = {
  VEGA: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George (warm, narrative veteran commander)
    name: 'George',
    stability: 0.35,
    similarityBoost: 0.8,
  },
  ROSTOVA: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah (composed, analytical flight director)
    name: 'Sarah',
    stability: 0.45,
    similarityBoost: 0.8,
  },
  SYSTEM: {
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel (authoritative mission telemetry)
    name: 'Daniel',
    stability: 0.75,
    similarityBoost: 0.75,
  },
};

export function normalizeSpeechText(rawText: string, lang: 'en' | 'es'): string {
  return rawText
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/ΔV/g, 'delta V')
    .replace(/1\/R²/g, lang === 'es' ? 'uno sobre R al cuadrado' : 'one over R squared')
    .replace(/CML\s*(\d)/g, lang === 'es' ? 'nivel CML $1' : 'CML level $1')
    .trim();
}

export async function requestElevenLabsAudioBytes(
  rawText: string,
  lang: 'en' | 'es',
  speaker: MissionSpeaker,
): Promise<Uint8Array> {
  const text = normalizeSpeechText(rawText, lang);
  const voiceCfg = SPEAKER_VOICES[speaker] ?? SPEAKER_VOICES.VEGA;
  const client = new ElevenLabsClient();

  const audioStream = await client.textToSpeech.convert(voiceCfg.voiceId, {
    text,
    modelId: 'eleven_v4',
    languageCode: lang,
    applyTextNormalization: 'on',
    voiceSettings: {
      stability: voiceCfg.stability,
      similarityBoost: voiceCfg.similarityBoost,
    },
  });

  const reader = audioStream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLength += value.byteLength;
    }
  }

  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return combined;
}
