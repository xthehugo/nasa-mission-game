import { useState } from 'react';
import { Check, Info, Maximize2, Plus } from 'lucide-react';
import {
  computeActiveSynergies,
  findObjectiveById,
  findSubsystemById,
  getSubsystemsByCategory,
} from '../engine';
import { equippedIdForCategory, useMissionStore } from '../store';
import type { SubsystemCategory, SubsystemOption } from '../types/mission';
import { playHoloTone } from './holoAudio';
import { SUBSYSTEM_TAB_GUIDE } from './narrativeConfig';
import { SubsystemHoloGraphic } from './SubsystemHoloGraphic';
import { SubsystemHoverPreview } from './SubsystemHoverPreview';
import { SubsystemInspectionModal } from './SubsystemInspectionModal';

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
    phaseTutorialStep,
    setActiveSubsystemTab,
    togglePayload,
    setSubsystem,
    setPhaseTutorialStep,
    appendDecisionLog,
  } = useMissionStore();

  const [hoveredOpt, setHoveredOpt] = useState<SubsystemOption | null>(null);
  const [inspectingOpt, setInspectingOpt] = useState<SubsystemOption | null>(null);
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
            let equippedSummary = '';
            if (tab.id === 'PAYLOAD') {
              const names = selection.payloadIds
                .map((id) => findSubsystemById(id)?.name[language])
                .filter(Boolean);
              equippedSummary =
                names.length > 0
                  ? names.join(', ')
                  : isEs
                    ? 'Sin instrumentos'
                    : 'No payloads';
            } else {
              const eqId = equippedIdForCategory(selection, tab.id);
              const eqOpt = eqId ? findSubsystemById(eqId) : null;
              equippedSummary =
                eqOpt?.name[language] ?? (isEs ? 'No equipado' : 'Not equipped');
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setHoveredOpt(null);
                  setActiveSubsystemTab(tab.id);
                  if (phaseTutorialStep <= 0) setPhaseTutorialStep(1);
                  playHoloTone('STEP', soundEnabled);
                }}
                className={`group flex w-full flex-col border-l-2 px-3 py-2 text-left font-mono text-[11px] transition ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white'
                    : 'border-[#5FF3FF]/15 text-slate-400 hover:border-[#5FF3FF]/50 hover:text-slate-200'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span>0{i + 1} · {tab.label[language]}</span>
                  <span className="text-[9px] text-[#5FF3FF]">
                    {active ? (isEs ? 'ACTIVO' : 'ACTIVE') : ''}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[9.5px] font-sans">
                  <span className="text-[#5FF3FF] font-mono mr-1">▸</span>
                  <span className={active ? 'text-[#5FF3FF] font-medium' : 'text-slate-400'}>
                    {equippedSummary}
                  </span>
                </div>
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

  const tabGuide = SUBSYSTEM_TAB_GUIDE[activeSubsystemTab];

  return (
    <div className="space-y-3">
      {tabGuide && (
        <div className="border-l-2 border-[#5FF3FF] bg-[#060d1a] px-2.5 py-2 text-[10.5px] leading-snug">
          <div className="font-mono text-[9px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase">
            {tabGuide.roleTitle[language]}
          </div>
          <div className="mt-0.5 text-slate-200">{tabGuide.whatItDoes[language]}</div>
          <div className="mt-0.5 text-[#FFC15E]">{tabGuide.connectionRule[language]}</div>
        </div>
      )}
      <div className="space-y-2">
        {getSubsystemsByCategory(activeSubsystemTab).map((opt, idx) => {
          const selected = isSelected(opt);
          const pick = isCadet && isCadetPick(opt);
          return (
            <div
              key={opt.id}
              className={`group relative flex items-stretch border transition ${
                selected
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_16px_rgba(95,243,255,0.16)]'
                  : 'border-[#5FF3FF]/20 bg-[#04080F]/90 hover:border-[#5FF3FF]/60 hover:bg-[#5FF3FF]/5'
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

              {/* Holographic CAD Thumbnail on the side */}
              <button
                type="button"
                onClick={() => {
                  setInspectingOpt(opt);
                  playHoloTone('STEP', soundEnabled);
                }}
                title={isEs ? 'Explorar diseño holográfico en 3D' : 'Inspect 3D holographic design'}
                className="relative flex w-16 sm:w-20 shrink-0 flex-col items-center justify-center border-r border-[#5FF3FF]/20 bg-[#02050B]/90 p-1.5 transition hover:bg-[#5FF3FF]/15 group/thumb cursor-pointer"
              >
                <SubsystemHoloGraphic
                  id={opt.id}
                  size="sm"
                  isSelected={selected}
                  className="h-12 w-12"
                />
                <span className="mt-1 font-mono text-[8px] tracking-wider text-[#5FF3FF] opacity-75 group-hover/thumb:opacity-100 flex items-center gap-0.5">
                  <Maximize2 className="h-2 w-2" /> CAD
                </span>
              </button>

              {/* Main Equippable Body */}
              <div
                onMouseEnter={() => setHoveredOpt(opt)}
                onMouseLeave={() => setHoveredOpt(null)}
                onClick={() => {
                  if (opt.category === 'PAYLOAD') togglePayload(opt.id);
                  else setSubsystem(opt.category, opt.id);
                  if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
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
                className="flex-1 p-2.5 text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-white">{opt.name[language]}</span>
                      {selected && (
                        <span className="font-mono text-[8.5px] bg-[#10B981]/25 text-[#10B981] px-1.5 py-0.2 rounded border border-[#10B981]/40 font-bold">
                          {isEs ? '✓ EQUIPADO' : '✓ EQUIPPED'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explicit Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (opt.category === 'PAYLOAD') togglePayload(opt.id);
                        else setSubsystem(opt.category, opt.id);
                        if (phaseTutorialStep <= 1) setPhaseTutorialStep(2);
                        playHoloTone('STAR', soundEnabled);
                        appendDecisionLog({
                          phase: 'CML_3',
                          label: {
                            en: `${opt.category}: ${opt.name.en} ($${opt.cost_MillionsUSD}M)`,
                            es: `${opt.category}: ${opt.name.es} ($${opt.cost_MillionsUSD}M)`,
                          },
                          impact: 'POSITIVE',
                        });
                      }}
                      className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded border transition uppercase flex items-center gap-1 cursor-pointer ${
                        selected
                          ? 'border-[#10B981] bg-[#10B981]/25 text-[#10B981] hover:bg-[#10B981]/35'
                          : 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF] hover:bg-[#5FF3FF]/40 shadow-[0_0_12px_rgba(95,243,255,0.22)]'
                      }`}
                    >
                      {selected ? (
                        <>
                          <Check className="h-3 w-3 text-[#10B981]" />
                          <span>{isEs ? 'EQUIPADO' : 'EQUIPPED'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 text-[#5FF3FF]" />
                          <span>{isEs ? 'EQUIPAR' : 'EQUIP'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingOpt(opt);
                        playHoloTone('STEP', soundEnabled);
                      }}
                      className="shrink-0 flex items-center gap-1 border border-[#5FF3FF]/30 bg-[#04080F] px-1.5 py-0.5 font-mono text-[9px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition cursor-pointer"
                      title={isEs ? 'Abrir ficha técnica y carrusel' : 'Open specs & carousel'}
                    >
                      <Info className="h-2.5 w-2.5" />
                      <span>{isEs ? 'DETALLES' : 'SPECS'}</span>
                    </button>
                  </div>
                </div>

                {/* Metric Chips Row */}
                <div className="mt-2 flex flex-wrap gap-1 font-mono text-[9px] text-slate-300">
                  {opt.category !== 'LAUNCH_VEHICLE' ? (
                    <>
                      <span className="border border-[#5FF3FF]/15 bg-[#5FF3FF]/8 px-1.5 py-0.5 rounded">
                        {opt.massCBE_kg} KG
                      </span>
                      <span className="border border-[#5FF3FF]/15 bg-[#5FF3FF]/8 px-1.5 py-0.5 rounded">
                        {opt.powerGenerated1AU_W > 0
                          ? `+${opt.powerGenerated1AU_W}W`
                          : `-${opt.powerDrawNominal_W}W`}
                      </span>
                      <span className="border border-[#5FF3FF]/15 bg-[#5FF3FF]/8 px-1.5 py-0.5 rounded">
                        {opt.volume_U}U
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="border border-[#5FF3FF]/15 bg-[#5FF3FF]/8 px-1.5 py-0.5 rounded">
                        MAX {opt.maxPayloadMass_kg} KG
                      </span>
                      <span className="border border-[#5FF3FF]/15 bg-[#5FF3FF]/8 px-1.5 py-0.5 rounded">
                        {isEs ? 'COFIA' : 'FAIRING'} {opt.fairingVolume_U}U
                      </span>
                    </>
                  )}
                  <span className="border border-[#FFC15E]/20 bg-[#FFC15E]/10 text-[#FFC15E] px-1.5 py-0.5 rounded font-bold">
                    ${opt.cost_MillionsUSD}M
                  </span>
                  {pick && (
                    <span className="font-mono text-[8.5px] text-[#5FF3FF] uppercase border border-[#5FF3FF]/30 bg-[#5FF3FF]/15 px-1 py-0.5 rounded">
                      {isEs ? 'PISTA CADETE' : 'CADET PICK'}
                    </span>
                  )}
                  {!isCadet && (
                    <span className="font-mono text-[8.5px] text-[#FFC15E] border border-[#FFC15E]/25 bg-[#FFC15E]/10 px-1 py-0.5 rounded">
                      TRL {opt.trl}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subsystem Inspection Modal / Carousel */}
      <SubsystemInspectionModal
        isOpen={inspectingOpt !== null}
        initialOption={inspectingOpt}
        options={getSubsystemsByCategory(activeSubsystemTab)}
        selection={selection}
        language={language}
        experienceMode={experienceMode}
        soundEnabled={soundEnabled}
        onClose={() => setInspectingOpt(null)}
        onEquip={(opt) => {
          if (opt.category === 'PAYLOAD') togglePayload(opt.id);
          else setSubsystem(opt.category, opt.id);
          setInspectingOpt(null);
          appendDecisionLog({
            phase: 'CML_3',
            label: {
              en: `${opt.category}: ${opt.name.en} ($${opt.cost_MillionsUSD}M)`,
              es: `${opt.category}: ${opt.name.es} ($${opt.cost_MillionsUSD}M)`,
            },
            impact: 'POSITIVE',
          });
        }}
      />
    </div>
  );
}
