import type { RandomEventType } from '../store';
import { useMissionStore } from '../store';
import type { ExperienceMode, PhysicsMetrics } from '../types/mission';
import { PREBAKED_VOICE_MANIFEST } from './voiceManifest';

export type HoloToneKind =
  | 'STEP'
  | 'ALARM'
  | 'STAR'
  | 'FILL'
  | 'IGNITION'
  | 'SONIC_BOOM'
  | 'STRESS_CREAK'
  | 'SUCCESS'
  | 'ECLIPSE';

const TONE_SPEC: Record<
  HoloToneKind,
  { freq: number; endFreq: number; dur: number; gain: number }
> = {
  STEP: { freq: 620, endFreq: 880, dur: 0.08, gain: 0.035 },
  FILL: { freq: 340, endFreq: 520, dur: 0.11, gain: 0.03 },
  STAR: { freq: 740, endFreq: 1120, dur: 0.15, gain: 0.04 },
  ALARM: { freq: 240, endFreq: 180, dur: 0.18, gain: 0.045 },
  IGNITION: { freq: 75, endFreq: 42, dur: 0.45, gain: 0.06 },
  SONIC_BOOM: { freq: 115, endFreq: 28, dur: 0.38, gain: 0.075 },
  STRESS_CREAK: { freq: 310, endFreq: 230, dur: 0.22, gain: 0.04 },
  SUCCESS: { freq: 523, endFreq: 1046, dur: 0.2, gain: 0.045 },
  ECLIPSE: { freq: 320, endFreq: 160, dur: 0.22, gain: 0.035 },
};

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext;
  if (!AudioCtx) return null;
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function unlockAudioContext(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  } catch {
    // Ignore audio unlock error
  }
}

let globalVoiceEnabled = true;
let globalMusicEnabled = true;
let globalSoundEnabled = true;
let globalVoiceVolume = 80;
let globalMusicVolume = 50;
let globalSfxVolume = 70;

export function syncAudioSettings(settings: {
  soundEnabled?: boolean;
  voiceEnabled?: boolean;
  musicEnabled?: boolean;
  voiceVolume?: number;
  musicVolume?: number;
  sfxVolume?: number;
}): void {
  if (settings.soundEnabled !== undefined) globalSoundEnabled = settings.soundEnabled;
  if (settings.voiceEnabled !== undefined) {
    globalVoiceEnabled = settings.voiceEnabled;
    if (!settings.voiceEnabled) stopCharacterVoice();
  }
  if (settings.musicEnabled !== undefined) {
    globalMusicEnabled = settings.musicEnabled;
    if (!settings.musicEnabled) stopBgmTrack();
  }
  if (settings.voiceVolume !== undefined) {
    globalVoiceVolume = settings.voiceVolume;
    if (activeAudioElement) {
      activeAudioElement.volume = Math.max(0, Math.min(1, globalVoiceVolume / 100));
    }
  }
  if (settings.musicVolume !== undefined) {
    globalMusicVolume = settings.musicVolume;
    if (activeBgmAudio && currentBgmTrack && currentBgmTrack !== 'NONE') {
      const spec = BGM_PATHS[currentBgmTrack as Exclude<BgmTrackKey, 'NONE'>];
      if (spec) {
        activeBgmAudio.volume = Math.max(0, Math.min(1, spec.volume * (globalMusicVolume / 100)));
      }
    }
  }
  if (settings.sfxVolume !== undefined) globalSfxVolume = settings.sfxVolume;
}

export function playHoloTone(kind: HoloToneKind, enabled: boolean): void {
  const isEnabled = enabled && globalSoundEnabled;
  if (!isEnabled || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const spec = TONE_SPEC[kind];

    osc.type =
      kind === 'ALARM' || kind === 'STRESS_CREAK'
        ? 'sawtooth'
        : kind === 'IGNITION' || kind === 'SONIC_BOOM' || kind === 'SUCCESS'
          ? 'triangle'
          : 'sine';
    osc.frequency.setValueAtTime(spec.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(spec.endFreq, ctx.currentTime + spec.dur);

    const actualGain = spec.gain * (globalSfxVolume / 100);
    gainNode.gain.setValueAtTime(actualGain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + spec.dur);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + spec.dur + 0.01);
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
  missionOk: boolean;
  marginOk: boolean;
  zeroConflicts: boolean;
  budgetOk: boolean;
  effectiveMassKg: number;
  minMarginPercent: number;
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
  // Calibración pedagógica: CADET (estudiantes/niños) requiere 20% de margen (estándar AIAA S-120A)
  // JPL ENGINEER requiere 30% de margen
  const minMargin = mode === 'JPL_ENGINEER' ? 30 : 20;
  const stormPenalty = activeEvent === 'SOLAR_STORM' ? 10 : 0;

  const effectivePowerMargin = metrics.power.marginPercent - stormPenalty;

  // Estrella 1: Misión Viable y Cero Conflictos (Base estructural y de subsistemas)
  const zeroConflicts =
    conflictsCount === 0 &&
    metrics.volume.isCompliant &&
    effectiveMassKg <= metrics.launchCapacity_kg;

  // Estrella 2: Margen de Seguridad Superior (>20% en masa y potencia eléctrica)
  const marginOk =
    metrics.dryMass.marginPercent >= minMargin &&
    effectivePowerMargin >= minMargin &&
    metrics.power.generatedAtDestination_W >= metrics.power.eclipseRequired_W;

  // Estrella 3: Eficiencia Presupuestal (dentro del tope con reserva de contingencia)
  const budgetFloor =
    activeEvent === 'BUDGET_CUT' ? metrics.cost.budgetCapMillionsUSD * 0.15 : 0;
  const budgetOk =
    metrics.cost.reserveMillionsUSD >= budgetFloor &&
    metrics.cost.totalMillionsUSD <= metrics.cost.budgetCapMillionsUSD;

  const missionOk = zeroConflicts && marginOk;
  const stars = Number(zeroConflicts) + Number(marginOk) + Number(budgetOk);
  return {
    stars,
    missionOk,
    marginOk,
    zeroConflicts,
    budgetOk,
    effectiveMassKg,
    minMarginPercent: minMargin,
  };
}

export function playRadioSquelch(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1420, ctx.currentTime);
    osc.frequency.setValueAtTime(920, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch {
    // ignore audio context errors
  }
}

export interface VoicePlaybackSnapshot {
  active: boolean;
  source: 'audio' | 'speech' | 'none';
  currentTimeSec: number;
  durationSec: number;
  progress: number;
  ended: boolean;
  failed: boolean;
  sessionId: number;
}

let activeAudioElement: HTMLAudioElement | null = null;
let currentPlayPromise: Promise<void> | null = null;
let activeSpeechAbort: AbortController | null = null;
let activeCallback: (() => void) | null = null;
let activeSpeechSessionId = 0;
let activePlaybackSource: 'audio' | 'speech' | 'none' = 'none';
let activeSpeechStartMs = 0;
let activeSpeechEstimatedDurationSec = 0;
let activeSpeechEnded = false;
let activeSpeechFailed = false;
let speechWatchdogTimer: number | null = null;

let activeBgmAudio: HTMLAudioElement | null = null;
let currentBgmTrack: string | null = null;
let activeSfxAudio: HTMLAudioElement | null = null;

export type BgmTrackKey =
  | 'HANGAR_AMBIENT'
  | 'TENSION_CRISIS'
  | 'JUPITER_DEEP_SPACE'
  | 'LAUNCH_EPIC'
  | 'VICTORY_FANFARE'
  | 'NONE';

const BGM_PATHS: Record<Exclude<BgmTrackKey, 'NONE'>, { src: string; loop: boolean; volume: number; startSec?: number }> = {
  HANGAR_AMBIENT: { src: '/audio/music/bgm_hangar_ambient.mp3', loop: true, volume: 0.28 },
  TENSION_CRISIS: { src: '/audio/music/bgm_tension_crisis.mp3', loop: true, volume: 0.35 },
  JUPITER_DEEP_SPACE: { src: '/audio/music/bgm_jupiter_deep_space.mp3', loop: true, volume: 0.32 },
  LAUNCH_EPIC: { src: '/audio/music/bgm_launch_epic.mp3', loop: false, volume: 0.42, startSec: 30 },
  VICTORY_FANFARE: { src: '/audio/music/bgm_victory_fanfare.mp3', loop: false, volume: 0.4 },
};

export function playBgmTrack(track: BgmTrackKey, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  const isEnabled = enabled && globalSoundEnabled && globalMusicEnabled;
  if (!isEnabled || track === 'NONE') {
    stopBgmTrack();
    return;
  }

  if (currentBgmTrack === track && activeBgmAudio && !activeBgmAudio.paused) {
    return;
  }

  stopBgmTrack();

  const spec = BGM_PATHS[track];
  if (!spec) return;

  try {
    const audio = new Audio(spec.src);
    audio.loop = spec.loop;
    audio.volume = Math.max(0, Math.min(1, spec.volume * (globalMusicVolume / 100)));
    if (spec.startSec && spec.startSec > 0) {
      audio.currentTime = spec.startSec;
    }
    activeBgmAudio = audio;
    currentBgmTrack = track;
    audio.play().catch(() => {
      // Browsers may block unprompted autoplay until user interaction
    });
  } catch {
    // ignore BGM playback errors
  }
}

export function stopBgmTrack(): void {
  if (typeof window === 'undefined') return;
  try {
    if (activeBgmAudio) {
      activeBgmAudio.pause();
      activeBgmAudio.currentTime = 0;
      activeBgmAudio = null;
    }
    currentBgmTrack = null;
  } catch {
    // ignore errors
  }
}

export function playCinemaSfx(sound: 'RAIN_WIND' | 'MCR_APPLAUSE', enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    if (activeSfxAudio) {
      activeSfxAudio.pause();
      activeSfxAudio = null;
    }
    const src =
      sound === 'RAIN_WIND'
        ? '/audio/sfx/cinema/sfx_hangar_rain_wind.mp3'
        : '/audio/sfx/cinema/sfx_mcr_applause.mp3';
    const audio = new Audio(src);
    audio.volume = sound === 'RAIN_WIND' ? 0.3 : 0.45;
    activeSfxAudio = audio;
    audio.play().catch(() => {});
  } catch {
    // ignore sfx errors
  }
}

function clearSpeechWatchdog(): void {
  if (speechWatchdogTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(speechWatchdogTimer);
    speechWatchdogTimer = null;
  }
}

function detachAudioElement(el: HTMLAudioElement): void {
  el.onloadedmetadata = null;
  el.ontimeupdate = null;
  el.onended = null;
  el.onerror = null;
}

export function getVoicePlaybackSnapshot(): VoicePlaybackSnapshot {
  if (typeof window === 'undefined') {
    return {
      active: false,
      source: 'none',
      currentTimeSec: 0,
      durationSec: 0,
      progress: 0,
      ended: activeSpeechEnded,
      failed: activeSpeechFailed,
      sessionId: activeSpeechSessionId,
    };
  }

  if (activePlaybackSource === 'audio' && activeAudioElement) {
    const duration =
      Number.isFinite(activeAudioElement.duration) && activeAudioElement.duration > 0
        ? activeAudioElement.duration
        : 0;
    const current = Math.max(0, activeAudioElement.currentTime || 0);
    const ended = activeAudioElement.ended || activeSpeechEnded;
    const progress = ended
      ? 1
      : duration > 0
        ? Math.max(0, Math.min(1, current / duration))
        : 0;
    return {
      active: !activeAudioElement.paused && !ended,
      source: 'audio',
      currentTimeSec: current,
      durationSec: duration,
      progress,
      ended,
      failed: activeSpeechFailed,
      sessionId: activeSpeechSessionId,
    };
  }

  if (activePlaybackSource === 'speech') {
    const est = Math.max(1, activeSpeechEstimatedDurationSec);
    const elapsed = Math.max(0, (performance.now() - activeSpeechStartMs) / 1000);
    const ended = activeSpeechEnded;
    const progress = ended ? 1 : Math.max(0, Math.min(1, elapsed / est));
    return {
      active: !ended,
      source: 'speech',
      currentTimeSec: Math.min(est, elapsed),
      durationSec: est,
      progress,
      ended,
      failed: activeSpeechFailed,
      sessionId: activeSpeechSessionId,
    };
  }

  return {
    active: false,
    source: 'none',
    currentTimeSec: 0,
    durationSec: 0,
    progress: activeSpeechEnded ? 1 : 0,
    ended: activeSpeechEnded,
    failed: activeSpeechFailed,
    sessionId: activeSpeechSessionId,
  };
}

export function isCharacterVoicePlaying(): boolean {
  if (typeof window === 'undefined') return false;
  if (activeAudioElement && !activeAudioElement.paused && !activeAudioElement.ended) {
    return true;
  }
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    return true;
  }
  return false;
}

export function stopCharacterVoice(): void {
  if (typeof window === 'undefined') return;
  try {
    activeSpeechSessionId += 1;
    clearSpeechWatchdog();
    activePlaybackSource = 'none';
    activeSpeechEnded = false;
    activeSpeechFailed = false;

    if (activeSpeechAbort) {
      activeSpeechAbort.abort();
      activeSpeechAbort = null;
    }
    activeCallback = null;

    if (activeAudioElement) {
      const el = activeAudioElement;
      const pendingPlay = currentPlayPromise;
      activeAudioElement = null;
      currentPlayPromise = null;
      detachAudioElement(el);

      if (pendingPlay) {
        pendingPlay
          .then(() => {
            el.pause();
            el.currentTime = 0;
          })
          .catch(() => {});
      } else {
        el.pause();
        el.currentTime = 0;
      }
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore speech errors
  }
}

export function isLevel1TutorialActive(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const state = useMissionStore.getState();
    const cinematicId = state.activeCinematicId;
    if (cinematicId) {
      return cinematicId === 'ACT1_PROLOGUE' || cinematicId === 'MISSION_CINEMATIC_LEO';
    }
    const levelId = state.activeCampaignLevelId;
    return !levelId || levelId === 'contract-leo-bionutrients';
  } catch {
    return true;
  }
}

function fallbackBrowserSpeech(
  cleanText: string,
  lang: 'en' | 'es',
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
  sessionId: number,
  onEnded?: () => void,
  onBoundaryCharIndex?: (charIndex: number) => void,
): void {
  if (sessionId !== activeSpeechSessionId) return;
  clearSpeechWatchdog();
  activePlaybackSource = 'speech';
  activeSpeechStartMs = performance.now();
  activeSpeechEstimatedDurationSec = Math.max(2, cleanText.length / 13);
  activeSpeechEnded = false;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    activeSpeechFailed = true;
    activeSpeechEnded = true;
    onEnded?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = lang === 'es' ? 'es-ES' : 'en-US';
    utter.volume = 0.9;

    let voices: SpeechSynthesisVoice[] = [];
    try {
      voices = window.speechSynthesis.getVoices();
    } catch {
      voices = [];
    }
    const langPrefix = lang === 'es' ? 'es' : 'en';
    const matchingVoices = voices.filter((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix),
    );

    if (matchingVoices.length > 0) {
      if (speaker === 'VEGA') {
        const maleVoices = matchingVoices.filter(
          (v) =>
            /pablo|jorge|raul|diego|carlos|miguel|david|mark|daniel|guy|male|hombre|enrique|mateo|geraldo|alvaro|manuel|julio|rodrigo|alberto/i.test(
              v.name,
            ) &&
            !/helena|sabina|laura|paulina|monica|elvira|zira|aria|samantha|victoria|female|mujer|paloma|carmen|marta|conchita/i.test(
              v.name,
            ),
        );
        utter.voice = maleVoices[0] ?? matchingVoices[0];
      } else if (speaker === 'ROSTOVA' || speaker === 'SYSTEM') {
        const femaleVoices = matchingVoices.filter((v) =>
          /helena|laura|sabina|paulina|monica|elvira|zira|aria|samantha|victoria|female|mujer|paloma|carmen|marta|conchita/i.test(
            v.name,
          ),
        );
        utter.voice = femaleVoices[0] ?? matchingVoices[matchingVoices.length - 1];
      } else {
        utter.voice = matchingVoices[0];
      }
    } else if (voices.length > 0) {
      utter.voice = voices.find((v) => v.default) ?? voices[0];
    }

    // Rate strictly between 0.95 and 1.0 with natural punctuation pauses
    utter.volume = Math.max(0, Math.min(1, globalVoiceVolume / 100));
    if (speaker === 'VEGA') {
      utter.pitch = 0.88;
      utter.rate = 0.96;
    } else if (speaker === 'ROSTOVA') {
      utter.pitch = 1.04;
      utter.rate = 0.98;
    } else {
      utter.pitch = 0.98;
      utter.rate = 0.98;
    }

    const finishSpeech = (failed: boolean) => {
      if (sessionId !== activeSpeechSessionId) return;
      clearSpeechWatchdog();
      utter.onboundary = null;
      utter.onend = null;
      utter.onerror = null;
      activeSpeechEnded = true;
      if (failed) activeSpeechFailed = true;
      onEnded?.();
    };

    utter.onboundary = (ev) => {
      if (sessionId !== activeSpeechSessionId) return;
      if (typeof ev.charIndex === 'number') {
        onBoundaryCharIndex?.(ev.charIndex);
      }
    };
    utter.onend = () => finishSpeech(false);
    utter.onerror = () => finishSpeech(true);

    // Watchdog so speechSynthesis browser hangs never freeze the dialogue state
    speechWatchdogTimer = window.setTimeout(
      () => finishSpeech(false),
      Math.round((activeSpeechEstimatedDurationSec + 4) * 1000),
    );

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utter);
  } catch {
    if (sessionId === activeSpeechSessionId) {
      clearSpeechWatchdog();
      activeSpeechFailed = true;
      activeSpeechEnded = true;
      onEnded?.();
    }
  }
}

function normalizeCompare(str: string): string {
  return str
    .toLowerCase()
    .replace(/["“”'’`]/g, '')
    .replace(/[¡!¿?.,;:—–\-()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
    const customMission = window.localStorage.getItem('orbital_forge_mission_name')?.trim();
    if (customMission && customMission !== 'Ícaro-Pionero' && customMission !== 'Icarus-Pioneer') {
      canonical = canonical.replaceAll(
        customMission,
        lang === 'es' ? 'Ícaro-Pionero' : 'Icarus-Pioneer',
      );
    }
  } catch {
    // ignore storage errors
  }

  const normClean = normalizeCompare(cleanText);
  const normCanonical = normalizeCompare(canonical);

  // 1. Exact canonical or cleaned text match in PREBAKED_VOICE_MANIFEST
  const exactMatch = PREBAKED_VOICE_MANIFEST.find((entry) => {
    if (entry.lang !== lang) return false;
    if (entry.canonicalText === cleanText || entry.canonicalText === canonical) return true;
    const normEntry = normalizeCompare(entry.canonicalText);
    return normEntry === normClean || normEntry === normCanonical;
  });

  if (exactMatch) {
    return `/audio/${lang}/${exactMatch.filename}`;
  }

  // 2. Prefix match (first 32 normalized characters)
  const prefix = normCanonical.slice(0, 32);
  if (prefix.length >= 20) {
    const prefixMatch = PREBAKED_VOICE_MANIFEST.find(
      (entry) =>
        entry.lang === lang &&
        entry.speaker === speaker &&
        normalizeCompare(entry.canonicalText).startsWith(prefix),
    );
    if (prefixMatch) {
      return `/audio/${lang}/${prefixMatch.filename}`;
    }
  }

  return null;
}

/**
 * Play character voice with smooth continuation, radio squelch feedback,
 * interruption safety, and onEnded trigger.
 */
export function speakCharacterLine(
  rawText: string,
  lang: 'en' | 'es',
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
  enabled: boolean,
  onEnded?: () => void,
  onBoundaryCharIndex?: (charIndex: number) => void,
  forceBrowserSpeech?: boolean,
): void {
  const isVoiceActive = enabled && globalSoundEnabled && globalVoiceEnabled;
  if (!isVoiceActive || typeof window === 'undefined') {
    onEnded?.();
    return;
  }

  stopCharacterVoice();
  const sessionId = activeSpeechSessionId;
  activeCallback = onEnded ?? null;
  playRadioSquelch(enabled);

  const cleanText = rawText
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/ΔV/g, 'delta V')
    .replace(/1\/R²/g, lang === 'es' ? 'uno sobre R al cuadrado' : 'one over R squared')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    activeSpeechEnded = true;
    onEnded?.();
    return;
  }

  const triggerEnded = () => {
    if (sessionId !== activeSpeechSessionId) return;
    activeSpeechEnded = true;
    if (activeCallback) {
      const cb = activeCallback;
      activeCallback = null;
      cb();
    }
  };

  const attachAndPlayAudio = (src: string) => {
    if (sessionId !== activeSpeechSessionId) return;
    const audio = new Audio(src);
    audio.volume = Math.max(0, Math.min(1, globalVoiceVolume / 100));
    activeAudioElement = audio;
    activePlaybackSource = 'audio';
    activeSpeechEnded = false;
    activeSpeechFailed = false;

    let endedHandled = false;

    const handleAudioFailure = () => {
      if (sessionId !== activeSpeechSessionId || endedHandled) return;
      endedHandled = true;
      detachAudioElement(audio);
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      currentPlayPromise = null;
      activeSpeechFailed = true;
      fallbackBrowserSpeech(
        cleanText,
        lang,
        speaker,
        sessionId,
        triggerEnded,
        onBoundaryCharIndex,
      );
    };

    audio.ontimeupdate = () => {
      if (sessionId !== activeSpeechSessionId) return;
      if (audio.duration > 0 && Number.isFinite(audio.duration)) {
        const approxChar = Math.floor((audio.currentTime / audio.duration) * cleanText.length);
        onBoundaryCharIndex?.(approxChar);
      }
    };

    audio.onended = () => {
      if (sessionId !== activeSpeechSessionId || endedHandled) return;
      endedHandled = true;
      detachAudioElement(audio);
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      currentPlayPromise = null;
      onBoundaryCharIndex?.(cleanText.length);
      triggerEnded();
    };

    audio.onerror = handleAudioFailure;

    const playPromise = audio.play();
    currentPlayPromise = playPromise;
    playPromise
      .then(() => {
        if (currentPlayPromise === playPromise) {
          currentPlayPromise = null;
        }
        if (sessionId !== activeSpeechSessionId) {
          audio.pause();
          audio.currentTime = 0;
        }
      })
      .catch(() => {
        handleAudioFailure();
      });
  };

  // 1. Try pre-generated Edge-TTS neural voice in /audio/{lang}/ first (covers all missions 1-6)
  if (!forceBrowserSpeech) {
    const staticMp3Url = findPrebakedVoiceUrl(cleanText, lang, speaker);
    if (staticMp3Url) {
      attachAndPlayAudio(staticMp3Url);
      return;
    }
  }

  // 2. Seamless fallback to browser speech synthesis if un-cached
  fallbackBrowserSpeech(
    cleanText,
    lang,
    speaker,
    sessionId,
    triggerEnded,
    onBoundaryCharIndex,
  );
}
