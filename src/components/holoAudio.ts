import type { RandomEventType } from '../store';
import type { ExperienceMode, PhysicsMetrics } from '../types/mission';
import { PREBAKED_VOICE_MANIFEST } from './voiceManifest';

export type HoloToneKind = 'STEP' | 'ALARM' | 'STAR' | 'FILL';

const TONE_SPEC: Record<HoloToneKind, { freq: number; endFreq: number; dur: number; gain: number }> = {
  STEP: { freq: 620, endFreq: 880, dur: 0.09, gain: 0.035 },
  FILL: { freq: 340, endFreq: 520, dur: 0.12, gain: 0.03 },
  STAR: { freq: 740, endFreq: 1120, dur: 0.16, gain: 0.04 },
  ALARM: { freq: 240, endFreq: 180, dur: 0.19, gain: 0.045 },
};

export function playHoloTone(kind: HoloToneKind, enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const spec = TONE_SPEC[kind];

    osc.type = kind === 'ALARM' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(spec.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(spec.endFreq, ctx.currentTime + spec.dur);

    gainNode.gain.setValueAtTime(spec.gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + spec.dur);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + spec.dur + 0.02);
    window.setTimeout(() => {
      ctx.close().catch((err: unknown) => console.warn('AudioContext close:', err));
    }, 260);
  } catch (err) {
    console.warn('Audio feedback skipped:', err);
  }
}

export function computeTankExtraMassKg(
  metrics: PhysicsMetrics,
  tankFillPercent: number,
  oxidizerFillPercent: number,
): number {
  return (
    ((tankFillPercent + oxidizerFillPercent - 160) / 100) *
    Math.max(2, metrics.propellantMass_kg * 0.25)
  );
}

export interface LevelStarsSummary {
  stars: number;
  marginOk: boolean;
  zeroConflicts: boolean;
  budgetOk: boolean;
  effectiveMassKg: number;
}

export function computeLevelStars(
  metrics: PhysicsMetrics,
  conflictsCount: number,
  mode: ExperienceMode,
  activeEvent: RandomEventType,
  tankExtraMassKg = 0,
): LevelStarsSummary {
  const massFactor = activeEvent === 'MASS_PENALTY' ? 1.08 : 1.0;
  const effectiveMassKg = (metrics.wetMass_kg + tankExtraMassKg) * massFactor;
  const minMargin = mode === 'JPL_ENGINEER' ? 40 : 35;
  const stormPenalty = activeEvent === 'SOLAR_STORM' ? 10 : 0;

  const effectivePowerMargin = metrics.power.marginPercent - stormPenalty;
  const marginOk =
    effectiveMassKg <= metrics.launchCapacity_kg &&
    metrics.dryMass.marginPercent >= minMargin &&
    effectivePowerMargin >= minMargin;

  const zeroConflicts = conflictsCount === 0;
  const budgetFloor =
    activeEvent === 'BUDGET_CUT' ? metrics.cost.budgetCapMillionsUSD * 0.15 : 0;
  const budgetOk = metrics.cost.reserveMillionsUSD >= budgetFloor;

  const stars = Number(marginOk) + Number(zeroConflicts) + Number(budgetOk);
  return { stars, marginOk, zeroConflicts, budgetOk, effectiveMassKg };
}

export function playRadioSquelch(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1480, ctx.currentTime);
    osc.frequency.setValueAtTime(980, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.085);
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 150);
  } catch {
    // ignore audio context errors
  }
}

let activeAudioElement: HTMLAudioElement | null = null;
let activeSpeechAbort: AbortController | null = null;
const blobAudioCache = new Map<string, string>();

export function stopCharacterVoice(): void {
  if (typeof window === 'undefined') return;
  try {
    if (activeSpeechAbort) {
      activeSpeechAbort.abort();
      activeSpeechAbort = null;
    }
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore speech errors
  }
}

function fallbackBrowserSpeech(
  cleanText: string,
  lang: 'en' | 'es',
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = lang === 'es' ? 'es-ES' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang === 'es' ? 'es' : 'en';
    const matchingVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(langPrefix),
    );

    if (matchingVoices.length > 0) {
      if (speaker === 'VEGA') {
        const maleMatch = matchingVoices.find((v) =>
          /pablo|jorge|raul|diego|carlos|miguel|david|mark|daniel|guy|male/i.test(v.name),
        );
        utter.voice = maleMatch ?? matchingVoices[0];
      } else if (speaker === 'ROSTOVA') {
        const femaleMatch = matchingVoices.find((v) =>
          /helena|laura|sabina|paulina|monica|elvira|zira|aria|samantha|victoria|female/i.test(
            v.name,
          ),
        );
        utter.voice = femaleMatch ?? matchingVoices[matchingVoices.length - 1];
      } else {
        utter.voice = matchingVoices[0];
      }
    }

    if (speaker === 'VEGA') {
      utter.pitch = 0.86;
      utter.rate = 0.98;
    } else if (speaker === 'ROSTOVA') {
      utter.pitch = 1.1;
      utter.rate = 1.03;
    } else {
      utter.pitch = 0.95;
      utter.rate = 1.02;
    }

    window.speechSynthesis.speak(utter);
  } catch {
    // ignore speech synthesis errors
  }
}

function findPrebakedVoiceUrl(
  cleanText: string,
  lang: 'en' | 'es',
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
): string | null {
  let canonical = cleanText;
  try {
    const customCadet = window.localStorage.getItem('orbital_forge_cadet_name')?.trim();
    const customEngineer = window.localStorage.getItem('orbital_forge_engineer_name')?.trim();
    if (customCadet && customCadet !== 'Orion') {
      canonical = canonical.replaceAll(customCadet, 'Orion');
    }
    if (customEngineer && customEngineer !== 'Vanguard') {
      canonical = canonical.replaceAll(customEngineer, 'Vanguard');
    }
  } catch {
    // ignore storage errors
  }

  const exactMatch = PREBAKED_VOICE_MANIFEST.find(
    (entry) =>
      entry.lang === lang &&
      entry.speaker === speaker &&
      (entry.canonicalText === cleanText || entry.canonicalText === canonical),
  );
  if (exactMatch) {
    return `/audio/voices/${exactMatch.filename}`;
  }

  // Prefix/structural match if custom mission/callsign was substituted mid-sentence
  const prefix = canonical.slice(0, 28);
  if (prefix.length >= 18) {
    const prefixMatch = PREBAKED_VOICE_MANIFEST.find(
      (entry) =>
        entry.lang === lang &&
        entry.speaker === speaker &&
        entry.canonicalText.slice(0, 28) === prefix,
    );
    if (prefixMatch) {
      return `/audio/voices/${prefixMatch.filename}`;
    }
  }

  return null;
}

export function speakCharacterLine(
  rawText: string,
  lang: 'en' | 'es',
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
  enabled: boolean,
): void {
  if (!enabled || typeof window === 'undefined') return;

  stopCharacterVoice();
  playRadioSquelch(enabled);

  const cleanText = rawText
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/ΔV/g, 'delta V')
    .replace(/1\/R²/g, lang === 'es' ? 'uno sobre R al cuadrado' : 'one over R squared')
    .replace(/CML\s*(\d)/g, lang === 'es' ? 'nivel CML $1' : 'CML level $1')
    .trim();

  if (!cleanText) return;

  // 1. First check static pre-generated ElevenLabs MP3 in /audio/voices/ (works on Git & Vercel with zero API key)
  const staticMp3Url = findPrebakedVoiceUrl(cleanText, lang, speaker);
  if (staticMp3Url) {
    const audio = new Audio(staticMp3Url);
    activeAudioElement = audio;
    audio.play().catch(() => {
      fallbackBrowserSpeech(cleanText, lang, speaker);
    });
    return;
  }

  // 2. Check in-memory session cache
  const cacheKey = `${speaker}|${lang}|${cleanText}`;
  const cachedBlobUrl = blobAudioCache.get(cacheKey);
  if (cachedBlobUrl) {
    const audio = new Audio(cachedBlobUrl);
    activeAudioElement = audio;
    audio.play().catch(() => {
      fallbackBrowserSpeech(cleanText, lang, speaker);
    });
    return;
  }

  // 3. Otherwise request dynamic synthesis from local /api/tts server, with browser speech fallback
  const abortCtrl = new AbortController();
  activeSpeechAbort = abortCtrl;

  void (async () => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, lang, speaker }),
        signal: abortCtrl.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (abortCtrl.signal.aborted) return;

      const blobUrl = URL.createObjectURL(blob);
      blobAudioCache.set(cacheKey, blobUrl);

      const audio = new Audio(blobUrl);
      activeAudioElement = audio;
      await audio.play();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (abortCtrl.signal.aborted) return;
      fallbackBrowserSpeech(cleanText, lang, speaker);
    }
  })();
}
