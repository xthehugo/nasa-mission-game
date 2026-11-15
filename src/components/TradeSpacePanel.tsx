import { useState } from 'react';
import {
  computeActiveSynergies,
  findObjectiveById,
  getSubsystemsByCategory,
} from '../engine';
import { equippedIdForCategory, useMissionStore } from '../store';
import type { SubsystemCategory, SubsystemOption } from '../types/mission';
import { playHoloTone } from './holoAudio';
import { SubsystemHoverPreview } from './SubsystemHoverPreview';

const TABS: { id: SubsystemCategory; label: { en: string; es: string } }[] = [
  { id: 'PAYLOAD', label: { en: 'PAYLOAD', es: 'CARGA ÚTIL' } },
  { id: 'PROPULSION', label: { en: 'PROPULSION', es: 'PROPULSIÓN' } },
  { id: 'EPS', label: { en: 'POWER / EPS', es: 'ENERGÍA EPS' } },
  { id: 'TELECOM', label: { en: 'TELECOM RF', es: 'TELECOM RF' } },
  { id: 'THERMAL', label: { en: 'THERMAL', es: 'TÉRMICO' } },
  { id: 'ADCS', label: { en: 'ATTITUDE ADCS', es: 'CONTROL ADCS' } },
  { id: 'LAUNCH_VEHICLE', label: { en: 'LAUNCHER', es: 'LANZADOR' } },
];

const DEST_PICKS: Record<string, Set<string>> = {
  'dest-leo': new Set(['prop-cold-gas', 'prop-thrustme-npt30', 'eps-deployable', 'eps-lilt-array', 'telecom-uhf', 'therm-passive', 'therm-silver-fep', 'adcs-gravity', 'adcs-sagitta-star', 'lv-rideshare', 'lv-vadr-rideshare']),
  'dest-geo': new Set(['prop-hall', 'eps-megaflex', 'telecom-xka', 'therm-active', 'adcs-3axis', 'lv-electron', 'lv-falcon9']),
  'dest-moon': new Set(['prop-hall', 'eps-megaflex', 'telecom-xka', 'therm-active', 'adcs-3axis', 'lv-electron']),
  'dest-l2': new Set(['prop-biprop', 'eps-megaflex', 'telecom-cubelct-laser', 'therm-cryo', 'adcs-sagitta-star', 'lv-falcon9']),
  'dest-mars': new Set(['prop-biprop', 'eps-megaflex', 'telecom-xka', 'therm-cryo', 'adcs-3axis', 'lv-falcon9']),
  'dest-jupiter': new Set(['prop-biprop', 'eps-rtg', 'telecom-xka', 'therm-active', 'adcs-3axis', 'lv-falcon9']),
};

export function TradeSpacePanel({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    experienceMode,
    activeSubsystemTab,
    selection,
    concurrentConflicts,
    soundEnabled,
    setActiveSubsystemTab,
    togglePayload,
    setSubsystem,
    appendDecisionLog,
  } = useMissionStore();

  const [hoveredOpt, setHoveredOpt] = useState<SubsystemOption | null>(null);
  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const activeObj = findObjectiveById(selection.objectiveId);

  if (zone === 'LEFT') {
    return (
      <div className="space-y-3">
        <div className="font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
          {isEs ? 'SUBSISTEMAS (7 MÓDULOS)' : 'SUBSYSTEMS (7 MODULES)'}
        </div>
        <div className="space-y-1">
          {TABS.map((tab, i) => {
            const active = activeSubsystemTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setHoveredOpt(null);
                  setActiveSubsystemTab(tab.id);
                  playHoloTone('STEP', soundEnabled);
                }}
                className={`flex w-full items-center justify-between border-l-2 px-3 py-2 text-left font-mono text-[11px] transition ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white'
                    : 'border-[#5FF3FF]/15 text-slate-400 hover:border-[#5FF3FF]/50 hover:text-slate-200'
                }`}
              >
                <span>0{i + 1} · {tab.label[language]}</span>
                <span className="text-[9px] text-[#5FF3FF]">
                  {active ? (isEs ? 'ACTIVO' : 'ACTIVE') : ''}
                </span>
              </button>
            );
          })}
        </div>
        <div className="border border-[#5FF3FF]/20 px-3 py-2 font-mono text-[10px] uppercase">
          <span className="text-slate-400">{isEs ? 'CONFLICTOS: ' : 'CONFLICTS: '}</span>
          <span className={concurrentConflicts.length === 0 ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
            {concurrentConflicts.length}
          </span>
        </div>

        {(() => {
          const activeSynergies = computeActiveSynergies(selection);
          return activeSynergies.length > 0 ? (
            <div className="border border-[#5FF3FF]/40 bg-[#07172C]/90 p-3 rounded space-y-2 font-mono">
              <div className="flex items-center justify-between text-[10px] text-[#5FF3FF] font-bold">
                <span>◈ {isEs ? 'COMBOS DE SINERGIA' : 'ACTIVE SYNERGIES'}</span>
                <span className="bg-[#5FF3FF]/20 px-1.5 py-0.5 rounded text-[9px] text-[#5FF3FF]">
                  {activeSynergies.length} ACTIVE
                </span>
              </div>
              {activeSynergies.map((syn) => (
                <div key={syn.id} className="text-[10px] border-l-2 border-[#FFC15E] pl-2 py-0.5">
                  <div className="text-[#FFC15E] font-bold">{syn.name[language]}</div>
                  <div className="text-[9px] text-slate-300">{syn.bonusText[language]}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-800 bg-[#04080F]/60 p-2.5 rounded text-[10px] font-mono text-slate-400 leading-tight">
              <span>// {isEs ? '0 Sinergias Activas (Combina subsistemas para desbloquear bonos)' : '0 Active Synergies (Pair equipment to unlock bonuses)'}</span>
            </div>
          );
        })()}
      </div>
    );
  }

  const isSelected = (opt: SubsystemOption): boolean =>
    opt.category === 'PAYLOAD'
      ? selection.payloadIds.includes(opt.id)
      : equippedIdForCategory(selection, opt.category) === opt.id;

  const isCadetPick = (opt: SubsystemOption): boolean =>
    opt.category === 'PAYLOAD'
      ? activeObj.requiredPayloadIds.includes(opt.id)
      : Boolean(DEST_PICKS[selection.destinationId]?.has(opt.id));

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {getSubsystemsByCategory(activeSubsystemTab).map((opt, idx) => {
          const selected = isSelected(opt);
          const pick = isCadet && isCadetPick(opt);
          return (
            <button
              key={opt.id}
              type="button"
              onMouseEnter={() => setHoveredOpt(opt)}
              onMouseLeave={() => setHoveredOpt(null)}
              onClick={() => {
                if (opt.category === 'PAYLOAD') togglePayload(opt.id);
                else setSubsystem(opt.category, opt.id);
                playHoloTone('STEP', soundEnabled);
                appendDecisionLog({
                  phase: 'CML_3',
                  label: {
                    en: `${opt.category}: ${opt.name.en} ($${opt.cost_MillionsUSD}M)`,
                    es: `${opt.category}: ${opt.name.es} ($${opt.cost_MillionsUSD}M)`,
                  },
                  impact: 'POSITIVE',
                });
              }}
              className={`relative w-full border p-3 text-left transition ${
                selected
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_16px_rgba(95,243,255,0.16)]'
                  : 'border-[#5FF3FF]/20 hover:border-[#5FF3FF]/55'
              }`}
            >
              {hoveredOpt?.id === opt.id && (
                <SubsystemHoverPreview
                  hoveredOpt={opt}
                  selection={selection}
                  language={language}
                  isFirst={idx === 0}
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-xs font-light text-white">{opt.name[language]}</span>
                {pick && (
                  <span className="font-mono text-[9px] text-[#5FF3FF] uppercase">
                    {isEs ? 'PISTA CADETE' : 'CADET PICK'}
                  </span>
                )}
                {!isCadet && (
                  <span className="font-mono text-[9px] text-[#FFC15E]">
                    TRL {opt.trl} +{Math.round(opt.mgaContingencyFactor * 100)}%MGA
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap gap-2 font-mono text-[9px] text-slate-400">
                {opt.category !== 'LAUNCH_VEHICLE' ? (
                  <>
                    <span>{opt.massCBE_kg} KG</span>
                    <span>
                      {opt.powerGenerated1AU_W > 0
                        ? `+${opt.powerGenerated1AU_W}W`
                        : `-${opt.powerDrawNominal_W}W`}
                    </span>
                    <span>{opt.volume_U}U</span>
                  </>
                ) : (
                  <>
                    <span>MAX {opt.maxPayloadMass_kg} KG</span>
                    <span>{isEs ? 'COFIA' : 'FAIRING'} {opt.fairingVolume_U}U</span>
                  </>
                )}
                <span className="text-[#FFC15E]">${opt.cost_MillionsUSD}M</span>
              </div>

              <p className="mt-1.5 text-[11px] leading-snug text-slate-300">
                {isCadet ? opt.analogyTooltip[language] : opt.tradeOffNote[language]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
