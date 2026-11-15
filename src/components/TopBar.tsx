import { getPlayerRank } from '../engine';
import { useMissionStore, type RandomEventType } from '../store';
import type { CMLPhase } from '../types/mission';
import { computeLevelStars, computeTankExtraMassKg, playHoloTone } from './holoAudio';

const EVENT_LABELS: Record<RandomEventType, { en: string; es: string }> = {
  NONE: { en: 'NONE', es: 'NINGUNO' },
  BUDGET_CUT: { en: 'BUDGET -15%', es: 'RECORTE -15%' },
  SOLAR_STORM: { en: 'SOLAR -10%', es: 'TORMENTA -10%' },
  MASS_PENALTY: { en: 'MASS +8%', es: 'MASA +8%' },
};

const LEVEL_META: Record<
  CMLPhase,
  { num: string; code: string; title: { en: string; es: string } }
> = {
  CML_1: { num: '01', code: 'CML 1', title: { en: 'Napkin', es: 'Servilleta' } },
  CML_2: { num: '02', code: 'CML 2', title: { en: 'Orbit', es: 'Órbita' } },
  CML_3: { num: '03', code: 'CML 3', title: { en: 'Trade Space', es: 'Trade Space' } },
  CML_4: { num: '04', code: 'CML 4', title: { en: 'Point Design', es: 'Punto' } },
  CML_5: { num: '05', code: 'CML 5', title: { en: 'V&V / MCR', es: 'V&V / MCR' } },
  SIMULATION: { num: '06', code: 'PHASE E', title: { en: 'Launch & Sim', es: 'Simulación' } },
};

const PRESET_LIST = [
  { key: 'obj-earth-bionutrients', label: { en: 'BioNutrients-2 (LEO)', es: 'BioNutrients-2 (LEO)' } },
  { key: 'obj-sso-tracers', label: { en: 'TRACERS Tandem (590 km SSO)', es: 'TRACERS Tándem (590 km SSO)' } },
  { key: 'preset-gmat-geo', label: { en: 'GMAT GEO (3,673 m/s)', es: 'GMAT GEO (3,673 m/s)' } },
  { key: 'obj-geo-goes-weather', label: { en: 'GOES-U / TRACERS (GEO)', es: 'GOES-U / TRACERS (GEO)' } },
  { key: 'obj-l2-jwst-fgs', label: { en: 'JWST / CSA FGS (SE-L2)', es: 'JWST / CSA FGS (SE-L2)' } },
  { key: 'obj-helio-lunar-trailblazer', label: { en: 'Lunar Trailblazer', es: 'Lunar Trailblazer' } },
  { key: 'obj-mars-reconnaissance', label: { en: 'Mars MRO (1.52 AU)', es: 'Marte MRO (1.52 AU)' } },
  { key: 'obj-jupiter-clipper', label: { en: 'Jupiter RTG (5.2 AU)', es: 'Júpiter RTG (5.2 AU)' } },
  { key: 'preset-fairing-overflow', label: { en: 'Fairing NO-GO Demo', es: 'Demo Exceso Cofia' } },
];

export function TopBar() {
  const {
    language,
    experienceMode,
    phase,
    commanderName,
    missionCustomName,
    metrics,
    concurrentConflicts,
    activeRandomEvent,
    tankFillPercent,
    oxidizerFillPercent,
    reducedMotion,
    soundEnabled,
    playerXP,
    setLanguage,
    setExperienceMode,
    reopenOnboarding,
    setTelemetryOpen,
    setPitchModalOpen,
    setCampaignModalOpen,
    setAIStudioModalOpen,
    loadPreset,
    unlockAllLevels,
    triggerRandomEvent,
    toggleReducedMotion,
    toggleSound,
    resetAllMission,
  } = useMissionStore();

  const isEs = language === 'es';
  const meta = LEVEL_META[phase];
  const extraKg =
    phase === 'CML_4'
      ? computeTankExtraMassKg(metrics, tankFillPercent, oxidizerFillPercent)
      : 0;
  const starInfo = computeLevelStars(
    metrics,
    concurrentConflicts.length,
    experienceMode,
    activeRandomEvent,
    extraKg,
  );
  const playerRank = getPlayerRank(playerXP);

  return (
    <header className="border-b border-[#5FF3FF]/20 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-[#5FF3FF] uppercase flex flex-wrap items-center gap-2">
            <span>
              {isEs ? `NIVEL ${meta.num} DE 06 · ${meta.code}` : `LEVEL ${meta.num} OF 06 · ${meta.code}`} · CMDR {commanderName} // {missionCustomName}
            </span>
            <span className="text-[#FFC15E] bg-[#FFC15E]/10 px-1.5 py-0.5 rounded border border-[#FFC15E]/30 font-bold">
              {playerRank.badge} ({playerXP} XP)
            </span>
          </div>
          <h1 className="mt-0.5 text-2xl font-light tracking-tight text-white sm:text-3xl">
            {meta.title[language]}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase">
          <button
            type="button"
            onClick={() => {
              setCampaignModalOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#5FF3FF] bg-[#5FF3FF]/15 px-2.5 py-1 font-bold text-[#5FF3FF] hover:bg-[#5FF3FF]/30 shadow-[0_0_12px_rgba(95,243,255,0.25)] transition rounded"
          >
            🗺️ {isEs ? 'CAMPAÑA' : 'CAMPAIGN'}
          </button>

          <button
            type="button"
            onClick={() => {
              setAIStudioModalOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#FFC15E] bg-[#FFC15E]/15 px-2.5 py-1 font-bold text-[#FFC15E] hover:bg-[#FFC15E]/30 shadow-[0_0_12px_rgba(255,193,94,0.25)] transition rounded"
          >
            ✨ GEMINI AI
          </button>

          <div className="border border-[#FFC15E]/40 px-2.5 py-1 text-[#FFC15E]">
            {isEs ? 'ESTRELLAS' : 'STARS'} {'★'.repeat(starInfo.stars)}{'☆'.repeat(3 - starInfo.stars)}
          </div>

          <button
            type="button"
            onClick={() => {
              triggerRandomEvent();
              playHoloTone('ALARM', soundEnabled);
            }}
            className={`border px-2.5 py-1 transition ${
              activeRandomEvent === 'NONE'
                ? 'border-[#5FF3FF]/25 text-slate-400 hover:border-[#FFC15E] hover:text-[#FFC15E]'
                : 'border-[#FFC15E] bg-[#FFC15E]/15 text-[#FFC15E]'
            }`}
          >
            {isEs ? 'EVENTO SIM' : 'SIM EVENT'}: {EVENT_LABELS[activeRandomEvent][language]}
          </button>

          <div className="inline-flex border border-[#5FF3FF]/30 bg-[#04080F]" role="group" aria-label="Experience Mode">
            <button
              type="button"
              onClick={() => {
                setExperienceMode('CADET');
                playHoloTone('STEP', soundEnabled);
              }}
              className={`px-2 py-1 transition ${
                experienceMode === 'CADET'
                  ? 'bg-[#5FF3FF]/20 text-[#5FF3FF] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isEs ? '🎓 CADETE' : '🎓 CADET'}
            </button>
            <button
              type="button"
              onClick={() => {
                setExperienceMode('JPL_ENGINEER');
                playHoloTone('STEP', soundEnabled);
              }}
              className={`border-l border-[#5FF3FF]/25 px-2 py-1 transition ${
                experienceMode === 'JPL_ENGINEER'
                  ? 'bg-[#FFC15E]/20 text-[#FFC15E] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isEs ? '🛰️ ING. JPL' : '🛰️ JPL ENG'}
            </button>
          </div>

          <select
            id="nasa-preset-select"
            name="nasaPreset"
            aria-label={isEs ? 'Presets NASA' : 'NASA Presets'}
            defaultValue=""
            onChange={(e) => {
              const key = e.target.value;
              if (!key) return;
              loadPreset(key);
              unlockAllLevels();
              playHoloTone('STEP', soundEnabled);
              e.target.value = '';
            }}
            className="border border-[#5FF3FF]/25 bg-[#04080F] px-2 py-1 text-slate-300 outline-none"
          >
            <option value="">{isEs ? 'PRESETS NASA' : 'NASA PRESETS'}</option>
            {PRESET_LIST.map((p) => (
              <option key={p.key} value={p.key}>{p.label[language]}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setTelemetryOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#5FF3FF]/25 px-2.5 py-1 text-slate-300 hover:border-[#5FF3FF] hover:text-[#5FF3FF]"
          >
            {isEs ? 'GRÁFICAS SWaP-C' : 'SWaP-C CHARTS'}
          </button>

          <button
            type="button"
            onClick={() => {
              toggleReducedMotion();
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#5FF3FF]/25 px-2 py-1 text-slate-400 hover:text-white"
          >
            FX:{reducedMotion ? 'OFF' : 'ON'}
          </button>

          <button
            type="button"
            onClick={() => {
              const nextEnabled = !soundEnabled;
              toggleSound();
              playHoloTone('STEP', nextEnabled);
            }}
            className="border border-[#5FF3FF]/25 px-2 py-1 text-slate-400 hover:text-white"
          >
            SFX:{soundEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => {
              setLanguage(isEs ? 'en' : 'es');
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#5FF3FF]/25 px-2 py-1 text-[#5FF3FF]"
          >
            {language.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => {
              reopenOnboarding();
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#5FF3FF]/25 px-2 py-1 text-slate-300 hover:border-[#5FF3FF]"
          >
            {isEs ? 'PERFIL' : 'PROFILE'}
          </button>

          <button
            type="button"
            onClick={() => {
              setPitchModalOpen(true);
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#5FF3FF]/25 px-2 py-1 text-slate-300 hover:border-[#5FF3FF]"
          >
            PITCH
          </button>

          <button
            type="button"
            onClick={() => {
              resetAllMission();
              playHoloTone('STEP', soundEnabled);
            }}
            className="border border-[#FF4D6D]/40 px-2 py-1 text-[#FF4D6D] hover:bg-[#FF4D6D]/10"
          >
            RESET
          </button>
        </div>
      </div>
    </header>
  );
}
