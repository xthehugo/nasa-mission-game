import React from 'react';
import { X } from 'lucide-react';
import { CAMPAIGN_CONTRACTS, getPlayerRank } from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

export const CampaignMapModal: React.FC = () => {
  const {
    language,
    soundEnabled,
    playerXP,
    campaignProgress,
    isCampaignModalOpen,
    setCampaignModalOpen,
    loadPreset,
    setPhase,
    appendDecisionLog,
  } = useMissionStore();

  if (!isCampaignModalOpen) return null;

  const currentRank = getPlayerRank(playerXP);
  const totalStarsEarned = Object.values(campaignProgress).reduce(
    (acc, c) => acc + (c.stars || 0),
    0,
  );

  const handleLaunchContract = (contract: (typeof CAMPAIGN_CONTRACTS)[number]) => {
    playHoloTone('STAR', soundEnabled);
    loadPreset(contract.presetKey);
    setPhase('CML_1');
    appendDecisionLog({
      phase: 'CML_1',
      label: {
        en: `Campaign Contract accepted: ${contract.title.en} (+${contract.rewardXP} XP max).`,
        es: `Contrato de Campaña aceptado: ${contract.title.es} (+${contract.rewardXP} XP máx).`,
      },
      impact: 'POSITIVE',
    });
    setCampaignModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02050A]/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#04080F]/95 border-2 border-[#5FF3FF]/50 rounded-2xl shadow-[0_0_50px_rgba(95,243,255,0.25)] overflow-hidden font-mono text-[#F4F6F8]">
        {/* Holographic scanning scanline header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#5FF3FF]/30 bg-gradient-to-r from-[#5FF3FF]/10 via-transparent to-[#FFC15E]/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#5FF3FF] animate-pulse shadow-[0_0_8px_#5FF3FF]" />
            <div>
              <h2
                id="campaign-modal-title"
                className="text-lg font-black tracking-widest text-[#5FF3FF] uppercase"
              >
                {language === 'es'
                  ? '◈ MATRIZ DE CAMPAÑA SOLAR · NASA CONTRACTS'
                  : '◈ SOLAR SYSTEM CAMPAIGN · NASA CONTRACTS'}
              </h2>
              <p className="text-xs text-slate-400 tracking-wider">
                {language === 'es'
                  ? '6 NIVELES DE PROGRESIÓN · DESBLOQUEA RANGOS Y CERTIFICACIONES JPL'
                  : '6 TIERED PROGRESSION CONTRACTS · UNLOCK RANKS & JPL ACCREDITATION'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setCampaignModalOpen(false);
            }}
            aria-label="Cerrar modal"
            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-bold border border-[#5FF3FF]/40 rounded hover:bg-[#5FF3FF]/20 text-[#5FF3FF] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>ESC</span>
          </button>
        </div>

        {/* Commander Rank & Stats HUD Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-6 py-3 bg-[#0A1324]/80 border-b border-[#5FF3FF]/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider">
              {language === 'es' ? 'RANGO ACTUAL:' : 'COMMANDER RANK:'}
            </span>
            <span className="font-bold text-[#FFC15E] bg-[#FFC15E]/10 px-2 py-0.5 rounded border border-[#FFC15E]/30">
              {currentRank.badge} · {currentRank.title[language]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider">XP:</span>
            <span className="font-bold text-[#5FF3FF]">{playerXP} XP</span>
            <span className="text-[10px] text-slate-500">
              ({currentRank.maxXP < 99999 ? `${currentRank.maxXP - playerXP} XP to Next Rank` : 'MAX RANK'})
            </span>
          </div>

          <div className="flex items-center gap-2 md:justify-end">
            <span className="text-slate-400 uppercase tracking-wider">
              {language === 'es' ? 'ESTRELLAS GANADAS:' : 'STARS EARNED:'}
            </span>
            <span className="font-bold text-[#FFC15E] text-sm">
              ★ {totalStarsEarned} / 18
            </span>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMPAIGN_CONTRACTS.map((contract) => {
              const isUnlocked = playerXP >= contract.requiredXPToUnlock;
              const progress = campaignProgress[contract.id] || { stars: 0, completed: false };
              const isCompleted = progress.completed;

              return (
                <div
                  key={contract.id}
                  className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 ${
                    !isUnlocked
                      ? 'bg-[#060D1A]/60 border-slate-800 opacity-60'
                      : isCompleted
                        ? 'bg-[#07172C]/90 border-[#5FF3FF]/60 shadow-[0_0_20px_rgba(95,243,255,0.15)]'
                        : 'bg-[#0B1528]/80 border-slate-700 hover:border-[#5FF3FF]/50 hover:shadow-[0_0_25px_rgba(95,243,255,0.2)]'
                  }`}
                >
                  {/* Top Bar: Code & Tier */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] tracking-widest font-bold text-[#5FF3FF] bg-[#5FF3FF]/10 px-2 py-0.5 rounded border border-[#5FF3FF]/20">
                        {contract.code}
                      </span>
                      <div className="flex items-center gap-1 text-[#FFC15E]">
                        {[1, 2, 3].map((starIdx) => (
                          <span
                            key={starIdx}
                            className={`text-xs ${
                              starIdx <= progress.stars
                                ? 'text-[#FFC15E] drop-shadow-[0_0_6px_#FFC15E]'
                                : 'text-slate-600'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-[#F4F6F8] mb-1 line-clamp-1">
                      {contract.title[language]}
                    </h3>

                    {/* Briefing */}
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {contract.briefing[language]}
                    </p>

                    {/* Boss / Mission Threat Hazard */}
                    <div className="p-2 mb-3 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[11px] text-[#FF4D6D]">
                      <span className="font-bold">[!] {language === 'es' ? 'AMENAZA:' : 'HAZARD:'} </span>
                      {contract.bossThreat[language]}
                    </div>
                  </div>

                  {/* Footer: XP & Launch Button */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">REWARD</span>
                      <span className="font-bold text-[#5FF3FF]">+{contract.rewardXP} XP</span>
                    </div>

                    {!isUnlocked ? (
                      <span className="text-[10px] text-slate-400 uppercase bg-slate-900 px-2 py-1.5 rounded border border-slate-800">
                        [LOCK] {contract.requiredXPToUnlock} XP REQ
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLaunchContract(contract)}
                        className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                          isCompleted
                            ? 'bg-[#5FF3FF]/20 text-[#5FF3FF] border border-[#5FF3FF]/50 hover:bg-[#5FF3FF]/30'
                            : 'bg-gradient-to-r from-[#5FF3FF] to-[#38BDF8] text-[#04080F] shadow-[0_0_15px_rgba(95,243,255,0.4)] hover:brightness-110'
                        }`}
                      >
                        {isCompleted
                          ? language === 'es'
                            ? 'RE-JUGAR'
                            : 'RE-PLAY'
                          : language === 'es'
                            ? 'ACEPTAR MISIÓN'
                            : 'LAUNCH CONTRACT'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3 bg-[#02050A] border-t border-[#5FF3FF]/20 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>
            {language === 'es'
              ? '[NOTE] Completa cada misión con Grado A o S en CML 6 (Simulación) para ganar 3 estrellas y máxima XP.'
              : '[NOTE] Complete missions with Grade A or S in CML 6 (Simulation) to earn 3 stars and maximum XP.'}
          </span>
          <span className="text-[#5FF3FF] font-semibold">
            NASA SPACE APPS CHALLENGE 2026 SPECIAL EDITION
          </span>
        </div>
      </div>
    </div>
  );
};
