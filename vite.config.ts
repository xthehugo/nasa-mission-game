import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

type MissionSpeaker = 'VEGA' | 'ROSTOVA' | 'SYSTEM';

const SPEAKER_VOICES: Record<
  MissionSpeaker,
  { voiceId: string; stability: number; similarityBoost: number }
> = {
  VEGA: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George (warm, narrative veteran commander)
    stability: 0.35,
    similarityBoost: 0.8,
  },
  ROSTOVA: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah (composed, analytical flight director)
    stability: 0.45,
    similarityBoost: 0.8,
  },
  SYSTEM: {
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel (authoritative mission telemetry)
    stability: 0.75,
    similarityBoost: 0.75,
  },
};

function normalizeSpeechText(rawText: string, lang: 'en' | 'es'): string {
  return rawText
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/ΔV/g, 'delta V')
    .replace(/1\/R²/g, lang === 'es' ? 'uno sobre R al cuadrado' : 'one over R squared')
    .replace(/CML\s*(\d)/g, lang === 'es' ? 'nivel CML $1' : 'CML level $1')
    .trim();
}

async function synthesizeAndCacheVoice(
  rawText: string,
  lang: 'en' | 'es',
  speaker: MissionSpeaker,
  cacheDir: string,
): Promise<{ buffer: Buffer; fromCache: boolean }> {
  const text = normalizeSpeechText(rawText, lang);
  const voiceCfg = SPEAKER_VOICES[speaker] ?? SPEAKER_VOICES.VEGA;
  const digest = createHash('sha256')
    .update(`${voiceCfg.voiceId}|${lang}|${text}`)
    .digest('hex')
    .slice(0, 20);
  const filename = `${speaker.toLowerCase()}_${lang}_${digest}.mp3`;

  mkdirSync(cacheDir, { recursive: true });
  const filePath = join(cacheDir, filename);

  if (existsSync(filePath)) {
    return { buffer: readFileSync(filePath), fromCache: true };
  }

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

  const chunks: Buffer[] = [];
  const nodeStream = Readable.fromWeb(
    audioStream as unknown as import('node:stream/web').ReadableStream,
  );
  for await (const chunk of nodeStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  writeFileSync(filePath, buffer);
  return { buffer, fromCache: false };
}

function elevenlabsVoiceServerPlugin(): Plugin {
  const attachMiddleware = (middlewares: {
    use: (
      route: string,
      fn: (
        req: import('node:http').IncomingMessage,
        res: import('node:http').ServerResponse,
        next: () => void,
      ) => void,
    ) => void;
  }) => {
    middlewares.use('/api/tts', (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }

      const bodyChunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      req.on('end', () => {
        void (async () => {
          try {
            const payload = JSON.parse(Buffer.concat(bodyChunks).toString('utf8')) as {
              text?: string;
              lang?: 'en' | 'es';
              speaker?: MissionSpeaker;
            };
            const text = (payload.text ?? '').trim();
            const lang = payload.lang === 'en' ? 'en' : 'es';
            const speaker: MissionSpeaker =
              payload.speaker === 'ROSTOVA' || payload.speaker === 'SYSTEM'
                ? payload.speaker
                : 'VEGA';

            if (!text) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing text' }));
              return;
            }

            const cacheDir = join(process.cwd(), 'public', 'audio', 'voices');
            const result = await synthesizeAndCacheVoice(text, lang, speaker, cacheDir);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('X-Voice-Cache', result.fromCache ? 'HIT' : 'MISS');
            res.end(result.buffer);
          } catch (err) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'TTS generation failed',
              }),
            );
          }
        })();
      });
    });
  };

  return {
    name: 'elevenlabs-voice-server',
    config(_, { mode }) {
      const envHere = loadEnv(mode, process.cwd(), '');
      const envParent = loadEnv(mode, join(process.cwd(), '..'), '');
      if (!process.env.ELEVENLABS_API_KEY) {
        process.env.ELEVENLABS_API_KEY =
          envHere.ELEVENLABS_API_KEY || envParent.ELEVENLABS_API_KEY || '';
      }
    },
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), elevenlabsVoiceServerPlugin()],
});
