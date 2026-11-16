import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Compass,
  GraduationCap,
  HelpCircle,
  Languages,
  RotateCcw,
  Settings,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { getPlayerRank } from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    language,
    experienceMode,
    cadetName,
    engineerName,
    missionCustomName,
    playerXP,
    campaignProgress,
    soundEnabled,
    voiceEnabled,
    musicEnabled,
    voiceVolume,
    musicVolume,
    sfxVolume,
    reducedMotion,
    setLanguage,
    setExperienceMode,
    setVoiceVolume,
    setMusicVolume,
    setSfxVolume,
    toggleSound,
    toggleVoice,
    toggleMusic,
    toggleReducedMotion,
    setCampaignModalOpen,
    setAIStudioModalOpen,
    setLevel1TutorialStep,
    reopenOnboarding,
    completeOnboarding,
  } = useMissionStore();

  const isEs = language === 'es';
  const isStudent = experienceMode === 'CADET';
  const playerRank = getPlayerRank(playerXP);
  const totalStarsEarned = Object.values(campaignProgress).reduce(
    (acc, c) => acc + (c.stars || 0),
    0,
  );

  const [callsignDraft, setCallsignDraft] = useState(
    isStudent ? cadetName : engineerName,
  );

  useEffect(() => {
    setCallsignDraft(isStudent ? cadetName : engineerName);
  }, [cadetName, engineerName, isStudent, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveCallsign = (newName: string) => {
    const clean = newName.trim();
    if (!clean) return;
    completeOnboarding(
      experienceMode,
      clean,
      missionCustomName || 'Ícaro-Pionero',
      isStudent ? clean : undefined,
      !isStudent ? clean : undefined,
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#02050B]/90 backdrop-blur-md font-mono"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              playHoloTone('STEP', soundEnabled);
              onClose();
            }
          }}
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-[#04080F] border-2 border-[#5FF3FF]/50 rounded-2xl shadow-[0_0_60px_rgba(95,243,255,0.22)] overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#5FF3FF]/25 bg-[#071324]/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/15 text-[#5FF3FF]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="settings-modal-title"
                    className="text-sm sm:text-base font-bold tracking-widest text-[#5FF3FF] uppercase"
                  >
                    {isEs
                      ? 'AJUSTES DEL SISTEMA & TELEMETRÍA DE AUDIO'
                      : 'SYSTEM SETTINGS & AUDIO TELEMETRY'}
                  </h2>
                  <p className="text-[10px] text-slate-400 tracking-wider">
                    {isEs
                      ? 'CONFIGURACIÓN DE AUDIO GRANULAR, PERFIL Y ACCESIBILIDAD'
                      : 'GRANULAR AUDIO CONTROLS, PROFILE & ACCESSIBILITY'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  onClose();
                }}
                className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#071324] px-2.5 py-1 text-xs text-slate-300 hover:border-[#FF4D6D] hover:bg-[#FF4D6D]/15 hover:text-[#FF4D6D] transition cursor-pointer"
                aria-label="Cerrar ajustes"
              >
                <X className="h-4 w-4" />
                <span>ESC</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto telemetry-scrollbar p-5 space-y-5 text-xs">
              {/* Profile Card */}
              <div className="border border-[#5FF3FF]/30 bg-[#07172C]/60 p-4 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#5FF3FF]/15 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {isStudent ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/20 text-[#5FF3FF]">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded border border-[#FFC15E]/40 bg-[#FFC15E]/20 text-[#FFC15E]">
                        <Wrench className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-[#FFC15E] tracking-wider uppercase text-[11px]">
                        {isStudent
                          ? isEs
                            ? 'PERFIL: CADETE / ESTUDIANTE'
                            : 'PROFILE: CADET / STUDENT'
                          : isEs
                            ? 'PERFIL: INGENIERO DE SISTEMAS JPL'
                            : 'PROFILE: JPL SYSTEMS ENGINEER'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {playerRank.badge} · {playerXP} XP (★ {totalStarsEarned}/18 {isEs ? 'estrellas de campaña' : 'campaign stars'})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      reopenOnboarding();
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="flex items-center gap-1 rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 px-2.5 py-1 text-[10px] text-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{isEs ? 'Reabrir Alistamiento' : 'Replay Enlistment'}</span>
                  </button>
                </div>

                {/* Callsign & Role Switcher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      {isEs ? 'INDICATIVO DE MANDO (CALLSIGN):' : 'COMMANDER CALLSIGN:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={callsignDraft}
                        onChange={(e) => setCallsignDraft(e.target.value)}
                        onBlur={() => handleSaveCallsign(callsignDraft)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCallsign(callsignDraft);
                        }}
                        maxLength={18}
                        className="w-full bg-[#02050B] border border-[#5FF3FF]/40 rounded px-2.5 py-1.5 text-xs text-[#5FF3FF] focus:border-[#5FF3FF] focus:outline-none focus:ring-1 focus:ring-[#5FF3FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      {isEs ? 'MODO DE EXPERIENCIA:' : 'EXPERIENCE MODE:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setExperienceMode('CADET');
                          playHoloTone('STEP', soundEnabled);
                        }}
                        className={`py-1.5 px-2 rounded border text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                          isStudent
                            ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF] shadow-[0_0_12px_rgba(95,243,255,0.25)]'
                            : 'border-[#5FF3FF]/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        <GraduationCap className="h-3 w-3" />
                        <span>{isEs ? 'CADETE' : 'CADET'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExperienceMode('JPL_ENGINEER');
                          playHoloTone('STEP', soundEnabled);
                        }}
                        className={`py-1.5 px-2 rounded border text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                          !isStudent
                            ? 'border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] shadow-[0_0_12px_rgba(255,193,94,0.25)]'
                            : 'border-[#FFC15E]/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Wrench className="h-3 w-3" />
                        <span>{isEs ? 'ING. JPL' : 'JPL ENG'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Granular Audio Telemetry Section */}
              <div className="border border-[#5FF3FF]/30 bg-[#07172C]/40 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#5FF3FF]/15 pb-2">
                  <div className="flex items-center gap-2 text-[#5FF3FF] font-bold uppercase tracking-wider text-[11px]">
                    <Sliders className="h-4 w-4" />
                    <span>{isEs ? 'CANALES DE AUDIO & GRADUACIÓN DE VOLUMEN' : 'AUDIO CHANNELS & VOLUME SLIDERS'}</span>
                  </div>
                  {/* Master Mute Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundEnabled;
                      toggleSound();
                      playHoloTone('STEP', next);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold transition cursor-pointer ${
                      soundEnabled
                        ? 'border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]'
                        : 'border-[#FF4D6D]/60 bg-[#FF4D6D]/15 text-[#FF4D6D]'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    <span>{soundEnabled ? (isEs ? 'MASTER: ACTIVO' : 'MASTER: ON') : (isEs ? 'MASTER: MUTE' : 'MASTER: MUTED')}</span>
                  </button>
                </div>

                {/* 1. Voice Channel (Comandante Vega & ASTRA) */}
                <div className="space-y-1.5 border border-[#5FF3FF]/20 bg-[#04080F]/80 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[10.5px]">
                        🎙️ {isEs ? 'VOZ DE PERSONAJES (VEGA & ASTRA)' : 'CHARACTER SPEECH (VEGA & ASTRA)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#5FF3FF] font-bold text-[11px]">{voiceVolume}%</span>
                      <button
                        type="button"
                        onClick={() => {
                          toggleVoice();
                          playHoloTone('STEP', soundEnabled);
                        }}
                        className={`px-2 py-0.5 rounded border text-[9px] font-bold transition cursor-pointer ${
                          voiceEnabled
                            ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/15 text-[#5FF3FF]'
                            : 'border-[#FF4D6D]/60 bg-[#FF4D6D]/15 text-[#FF4D6D]'
                        }`}
                      >
                        {voiceEnabled ? (isEs ? 'ACTIVA' : 'ON') : (isEs ? 'MUTE' : 'MUTED')}
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={2}
                    value={voiceVolume}
                    disabled={!voiceEnabled || !soundEnabled}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVoiceVolume(v);
                    }}
                    className="w-full accent-[#5FF3FF] cursor-pointer disabled:opacity-30"
                  />
                  <div className="text-[9.5px] text-slate-400 flex justify-between">
                    <span>{isEs ? 'Grabaciones de estudio y síntesis de voz' : 'Studio recordings & browser speech'}</span>
                    <span>0% — 100%</span>
                  </div>
                </div>

                {/* 2. Music Channel (BGM Orquestal & Sintetizador) */}
                <div className="space-y-1.5 border border-[#5FF3FF]/20 bg-[#04080F]/80 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[10.5px]">
                        🎵 {isEs ? 'MÚSICA DE FONDO (BGM ESPACIAL)' : 'BACKGROUND MUSIC (SPACE BGM)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#FFC15E] font-bold text-[11px]">{musicVolume}%</span>
                      <button
                        type="button"
                        onClick={() => {
                          toggleMusic();
                          playHoloTone('STEP', soundEnabled);
                        }}
                        className={`px-2 py-0.5 rounded border text-[9px] font-bold transition cursor-pointer ${
                          musicEnabled
                            ? 'border-[#FFC15E]/50 bg-[#FFC15E]/15 text-[#FFC15E]'
                            : 'border-[#FF4D6D]/60 bg-[#FF4D6D]/15 text-[#FF4D6D]'
                        }`}
                      >
                        {musicEnabled ? (isEs ? 'ACTIVA' : 'ON') : (isEs ? 'MUTE' : 'MUTED')}
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={2}
                    value={musicVolume}
                    disabled={!musicEnabled || !soundEnabled}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMusicVolume(v);
                    }}
                    className="w-full accent-[#FFC15E] cursor-pointer disabled:opacity-30"
                  />
                  <div className="text-[9.5px] text-slate-400 flex justify-between">
                    <span>{isEs ? 'Música ambiental de hangar, tensión y lanzamiento' : 'Hangar ambient, crisis & launch tracks'}</span>
                    <span>0% — 100%</span>
                  </div>
                </div>

                {/* 3. SFX Channel (Efectos de Interfaz y Holo-tonos) */}
                <div className="space-y-1.5 border border-[#5FF3FF]/20 bg-[#04080F]/80 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[10.5px]">
                        🎛️ {isEs ? 'EFECTOS DE SONIDO & HOLO-TONOS' : 'SOUND EFFECTS & HOLO TONES'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#5FF3FF] font-bold text-[11px]">{sfxVolume}%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={2}
                    value={sfxVolume}
                    disabled={!soundEnabled}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSfxVolume(v);
                      playHoloTone('STEP', true);
                    }}
                    className="w-full accent-[#5FF3FF] cursor-pointer disabled:opacity-30"
                  />
                  <div className="text-[9.5px] text-slate-400 flex justify-between">
                    <span>{isEs ? 'Sonidos de clics, alarmas, ignición y victoria' : 'Interface clicks, alarms, ignition & stars'}</span>
                    <span>0% — 100%</span>
                  </div>
                </div>
              </div>

              {/* Language & Accessibility Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-[#5FF3FF]/20 bg-[#07172C]/40 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[10.5px] uppercase">
                    <Languages className="h-3.5 w-3.5 text-[#5FF3FF]" />
                    <span>{isEs ? 'IDIOMA DEL SISTEMA' : 'SYSTEM LANGUAGE'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('es');
                        playHoloTone('STEP', soundEnabled);
                      }}
                      className={`py-1.5 px-2 rounded border text-[10.5px] font-bold transition cursor-pointer ${
                        language === 'es'
                          ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF]'
                          : 'border-[#5FF3FF]/20 text-slate-400 hover:text-white'
                      }`}
                    >
                      ESPAÑOL (ES)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        playHoloTone('STEP', soundEnabled);
                      }}
                      className={`py-1.5 px-2 rounded border text-[10.5px] font-bold transition cursor-pointer ${
                        language === 'en'
                          ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF]'
                          : 'border-[#5FF3FF]/20 text-slate-400 hover:text-white'
                      }`}
                    >
                      ENGLISH (EN)
                    </button>
                  </div>
                </div>

                <div className="border border-[#5FF3FF]/20 bg-[#07172C]/40 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[10.5px] uppercase">
                    <Zap className="h-3.5 w-3.5 text-[#FFC15E]" />
                    <span>{isEs ? 'MOVIMIENTO REDUCIDO' : 'REDUCED MOTION'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleReducedMotion();
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className={`w-full py-1.5 px-2 rounded border text-[10.5px] font-bold transition cursor-pointer ${
                      reducedMotion
                        ? 'border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E]'
                        : 'border-[#5FF3FF]/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    {reducedMotion
                      ? isEs
                        ? '✓ ACTIVADO (SIN ANIMACIONES PESADAS)'
                        : '✓ ENABLED (NO HEAVY MOTION)'
                      : isEs
                        ? 'DESACTIVADO (CINEMÁTICAS COMPLETAS)'
                        : 'DISABLED (FULL MOTION FX)'}
                  </button>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="border border-[#5FF3FF]/20 bg-[#04080F]/90 p-3 rounded-xl space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                  {isEs ? 'ACCESOS DIRECTOS DE MISIÓN:' : 'MISSION SHORTCUTS:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setCampaignModalOpen(true);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded border border-[#5FF3FF]/30 bg-[#071324] py-2 text-[10.5px] text-slate-200 hover:border-[#5FF3FF] hover:text-[#5FF3FF] transition cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#5FF3FF]" />
                    <span>{isEs ? 'Carrusel Campañas' : 'Campaign Deck'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setLevel1TutorialStep(0);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded border border-[#5FF3FF]/30 bg-[#071324] py-2 text-[10.5px] text-slate-200 hover:border-[#FFC15E] hover:text-[#FFC15E] transition cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-[#FFC15E]" />
                    <span>{isEs ? 'Reiniciar Guía' : 'Replay Guide'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setAIStudioModalOpen(true);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded border border-[#FFC15E]/40 bg-[#FFC15E]/10 py-2 text-[10.5px] text-[#FFC15E] hover:bg-[#FFC15E]/20 transition cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isEs ? 'Auditoría IA' : 'Gemini AI'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-5 py-3 border-t border-[#5FF3FF]/20 bg-[#071324]/90">
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  onClose();
                }}
                className="rounded border border-[#5FF3FF] bg-[#5FF3FF]/20 px-5 py-1.5 font-mono text-xs font-bold text-[#5FF3FF] hover:bg-[#5FF3FF]/30 transition shadow-[0_0_15px_rgba(95,243,255,0.25)] cursor-pointer"
              >
                {isEs ? 'GUARDAR Y CONTINUAR' : 'SAVE & CLOSE'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
