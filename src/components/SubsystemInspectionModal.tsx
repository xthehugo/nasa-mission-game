import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { equippedIdForCategory } from '../store';
import type {
  ExperienceMode,
  Language,
  MissionSelection,
  SubsystemOption,
} from '../types/mission';
import { playHoloTone } from './holoAudio';
import { SubsystemHoloGraphic } from './SubsystemHoloGraphic';

interface SubsystemInspectionModalProps {
  initialOption: SubsystemOption | null;
  options: SubsystemOption[];
  selection: MissionSelection;
  language: Language;
  experienceMode: ExperienceMode;
  soundEnabled: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEquip: (option: SubsystemOption) => void;
}

export function SubsystemInspectionModal({
  initialOption,
  options,
  selection,
  language,
  experienceMode,
  soundEnabled,
  isOpen,
  onClose,
  onEquip,
}: SubsystemInspectionModalProps) {
  const [overrideId, setOverrideId] = useState<string | null>(null);

  const isEs = language === 'es';
  const isCadet = experienceMode === 'CADET';
  const currentOption =
    (overrideId ? options.find((o) => o.id === overrideId) : null) ??
    initialOption ??
    options[0];
  const currentIndex = options.findIndex((o) => o.id === currentOption?.id);

  const handleClose = useCallback(() => {
    setOverrideId(null);
    onClose();
  }, [onClose]);

  const isCurrentlyEquipped = (opt: SubsystemOption): boolean => {
    if (opt.category === 'PAYLOAD') {
      return selection.payloadIds.includes(opt.id);
    }
    return equippedIdForCategory(selection, opt.category) === opt.id;
  };

  const currentlyEquippedId = currentOption
    ? currentOption.category === 'PAYLOAD'
      ? selection.payloadIds[0] ?? ''
      : equippedIdForCategory(selection, currentOption.category)
    : '';

  const equippedOpt = options.find((o) => o.id === currentlyEquippedId);

  const handlePrev = useCallback(() => {
    if (options.length === 0) return;
    const prevIdx = (currentIndex - 1 + options.length) % options.length;
    setOverrideId(options[prevIdx].id);
    playHoloTone('STEP', soundEnabled);
  }, [currentIndex, options, soundEnabled]);

  const handleNext = useCallback(() => {
    if (options.length === 0) return;
    const nextIdx = (currentIndex + 1) % options.length;
    setOverrideId(options[nextIdx].id);
    playHoloTone('STEP', soundEnabled);
  }, [currentIndex, options, soundEnabled]);

  const handleEquipCurrent = useCallback(() => {
    if (!currentOption) return;
    onEquip(currentOption);
    playHoloTone('STAR', soundEnabled);
  }, [currentOption, onEquip, soundEnabled]);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEquipCurrent();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, handleEquipCurrent, handleClose]);

  if (!isOpen || !currentOption) return null;

  const equipped = isCurrentlyEquipped(currentOption);

  // Delta calculations against currently equipped in same category
  const deltaMass = equippedOpt ? currentOption.massCBE_kg - equippedOpt.massCBE_kg : 0;
  const currNetPower = currentOption.powerGenerated1AU_W > 0 ? currentOption.powerGenerated1AU_W : -currentOption.powerDrawNominal_W;
  const eqNetPower = equippedOpt ? (equippedOpt.powerGenerated1AU_W > 0 ? equippedOpt.powerGenerated1AU_W : -equippedOpt.powerDrawNominal_W) : 0;
  const deltaPower = currNetPower - eqNetPower;
  const deltaCost = equippedOpt ? currentOption.cost_MillionsUSD - equippedOpt.cost_MillionsUSD : 0;
  const deltaVol = equippedOpt ? currentOption.volume_U - equippedOpt.volume_U : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-[#02050B]/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[#5FF3FF]/40 bg-[#040915] shadow-[0_0_50px_rgba(95,243,255,0.22)] font-mono"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#5FF3FF]/25 bg-[#071324] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-[#5FF3FF]/40 bg-[#5FF3FF]/10 text-xs text-[#5FF3FF]">
                ◈
              </span>
              <div>
                <div className="text-[10px] tracking-[0.2em] text-[#5FF3FF] uppercase">
                  {isEs ? 'DOSSIER TÉCNICO CAD · INSPECTOR HOLOGRÁFICO' : 'TECHNICAL CAD DOSSIER · HOLO INSPECTOR'}
                </div>
                <div className="text-sm sm:text-base font-light text-white tracking-wide">
                  {currentOption.category} · {currentOption.name[language]}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {currentIndex + 1} / {options.length}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 px-2.5 py-1 text-xs text-slate-300 hover:border-[#FF4D6D] hover:bg-[#FF4D6D]/10 hover:text-[#FF4D6D] transition"
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-[10px]">ESC</span>
              </button>
            </div>
          </div>

          {/* Carousel Thumbnail Navigation Ribbon */}
          <div className="flex items-center justify-between border-b border-[#5FF3FF]/15 bg-[#02060E] px-3 py-2 sm:px-6">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#071324] px-2 py-1 text-[10px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
              title={isEs ? 'Opción anterior (Flecha Izquierda)' : 'Previous option (Left arrow)'}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isEs ? 'ANTERIOR' : 'PREV'}</span>
            </button>

            {/* Thumbnail Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
              {options.map((opt) => {
                const isActive = opt.id === currentOption.id;
                const isEq = isCurrentlyEquipped(opt);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setOverrideId(opt.id);
                      playHoloTone('STEP', soundEnabled);
                    }}
                    className={`group relative flex items-center gap-2 rounded border px-2 py-1 text-left transition ${
                      isActive
                        ? 'border-[#5FF3FF] bg-[#5FF3FF]/20 text-white shadow-[0_0_12px_rgba(95,243,255,0.25)]'
                        : isEq
                          ? 'border-[#10B981]/50 bg-[#10B981]/10 text-slate-300 hover:border-[#10B981]'
                          : 'border-slate-800 bg-[#040915] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <SubsystemHoloGraphic id={opt.id} size="sm" isSelected={isActive} className="h-7 w-7 shrink-0" />
                    <div className="hidden md:block text-left">
                      <div className="text-[9.5px] font-medium leading-none truncate max-w-[110px]">
                        {opt.name[language]}
                      </div>
                      <div className="mt-0.5 text-[8px] text-slate-400">
                        {isEq ? (isEs ? 'EQUIPADO' : 'EQUIPPED') : `TRL ${opt.trl}`}
                      </div>
                    </div>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5FF3FF] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5FF3FF]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#071324] px-2 py-1 text-[10px] text-[#5FF3FF] hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/20 transition"
              title={isEs ? 'Siguiente opción (Flecha Derecha)' : 'Next option (Right arrow)'}
            >
              <span className="hidden sm:inline">{isEs ? 'SIGUIENTE' : 'NEXT'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Modal Main Body (2 Columns) */}
          <div className="grid flex-1 overflow-y-auto p-4 sm:p-6 sm:grid-cols-12 gap-6">
            {/* Left Column: Big Holographic Visualizer */}
            <div className="sm:col-span-5 flex flex-col items-center justify-between rounded-lg border border-[#5FF3FF]/25 bg-[#02050B] p-4 text-center">
              <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span>CAD SCHEMATIC ISO-3D</span>
                <span className="text-[#5FF3FF]">SCALE: 1:1 CUBESAT</span>
              </div>

              {/* Hologram Box */}
              <div className="relative my-auto flex items-center justify-center p-3">
                <SubsystemHoloGraphic
                  id={currentOption.id}
                  size="lg"
                  isSelected={equipped}
                  className="shadow-[0_0_30px_rgba(95,243,255,0.25)]"
                />
              </div>

              {/* Status and Specs Chips */}
              <div className="mt-4 w-full space-y-2">
                <div
                  className={`flex items-center justify-center gap-1.5 rounded border py-1.5 text-xs font-medium tracking-wide ${
                    equipped
                      ? 'border-[#10B981] bg-[#10B981]/15 text-[#10B981]'
                      : 'border-[#5FF3FF]/30 bg-[#5FF3FF]/5 text-slate-300'
                  }`}
                >
                  {equipped ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                      <span>{isEs ? 'EQUIPADO ACTUALMENTE' : 'CURRENTLY EQUIPPED'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-[#5FF3FF]" />
                      <span>{isEs ? 'DISPONIBLE EN CATÁLOGO' : 'AVAILABLE IN CATALOG'}</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded border border-slate-800 bg-[#07111F] p-2 text-left">
                    <span className="text-slate-400">{isEs ? 'MADUREZ TRL' : 'TRL MATURITY'}</span>
                    <div className="text-white text-xs font-bold mt-0.5">TRL {currentOption.trl} / 9</div>
                    <div className="text-[9px] text-[#FFC15E]">
                      +{Math.round(currentOption.mgaContingencyFactor * 100)}% {isEs ? 'Margen MGA' : 'MGA Margin'}
                    </div>
                  </div>

                  <div className="rounded border border-slate-800 bg-[#07111F] p-2 text-left">
                    <span className="text-slate-400">{isEs ? 'PRESUPUESTO' : 'BUDGET COST'}</span>
                    <div className="text-[#FFC15E] text-xs font-bold mt-0.5">${currentOption.cost_MillionsUSD}M USD</div>
                    <div className="text-[9px] text-slate-400">
                      {currentOption.volume_U}U {isEs ? 'Volumen' : 'Volume'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative Explanations & Delta Impact */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Cadet Analogy Card */}
                <div
                  className={`rounded border p-3.5 transition ${
                    isCadet
                      ? 'border-[#5FF3FF] bg-[#061122]/90 ring-1 ring-[#5FF3FF]/40 shadow-[0_0_15px_rgba(95,243,255,0.15)]'
                      : 'border-[#5FF3FF]/30 bg-[#061122]/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#5FF3FF] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" />
                      <span>{isEs ? 'QUÉ HACE ESTE COMPONENTE (CONCEPTO)' : 'HOW IT WORKS (CONCEPT)'}</span>
                    </div>
                    {isCadet && (
                      <span className="font-mono text-[8.5px] uppercase bg-[#5FF3FF]/20 px-1.5 py-0.2 rounded text-[#5FF3FF]">
                        {isEs ? 'MODO CADETE' : 'CADET MODE'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200 font-sans">
                    {currentOption.analogyTooltip[language]}
                  </p>
                </div>

                {/* JPL Team X Trade-Off & Engineering Analysis */}
                <div
                  className={`rounded border p-3.5 transition ${
                    !isCadet
                      ? 'border-[#FFC15E] bg-[#120F06]/90 ring-1 ring-[#FFC15E]/40 shadow-[0_0_15px_rgba(255,193,94,0.15)]'
                      : 'border-[#FFC15E]/30 bg-[#120F06]/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#FFC15E] mb-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{isEs ? 'ANÁLISIS DE INGENIERÍA JPL TEAM X (TRADE-OFF)' : 'JPL TEAM X ENGINEERING TRADE-OFF'}</span>
                    </div>
                    {!isCadet && (
                      <span className="font-mono text-[8.5px] uppercase bg-[#FFC15E]/20 px-1.5 py-0.2 rounded text-[#FFC15E]">
                        {isEs ? 'MODO INGENIERO JPL' : 'JPL ENGINEER MODE'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300 font-sans">
                    {currentOption.tradeOffNote[language]}
                  </p>
                  {currentOption.sourceCitation && (
                    <div className="mt-2 text-[9.5px] text-slate-400 border-t border-slate-800 pt-1.5">
                      <span className="text-[#FFC15E]">// REF: </span>
                      {currentOption.sourceCitation}
                    </div>
                  )}
                </div>

                {/* Delta Impact Matrix (If not already equipped) */}
                {equippedOpt && equippedOpt.id !== currentOption.id && (
                  <div className="rounded border border-slate-700 bg-[#030712] p-3">
                    <div className="text-[10px] text-slate-400 tracking-wider uppercase mb-2">
                      {isEs ? 'IMPACTO RELATIVO VS SUBSISTEMA ACTUAL (' : 'RELATIVE DELTA VS CURRENT ('}
                      <span className="text-white">{equippedOpt.name[language]}</span>)
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                      <div className="border border-slate-800 p-1.5 rounded bg-[#08101E]">
                        <div className="text-slate-400">{isEs ? 'MASA' : 'MASS'}</div>
                        <div className={`font-bold mt-0.5 ${deltaMass <= 0 ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                          {deltaMass > 0 ? `+${deltaMass.toFixed(1)}` : deltaMass.toFixed(1)} kg
                        </div>
                      </div>

                      <div className="border border-slate-800 p-1.5 rounded bg-[#08101E]">
                        <div className="text-slate-400">{isEs ? 'POTENCIA' : 'POWER'}</div>
                        <div className={`font-bold mt-0.5 ${deltaPower >= 0 ? 'text-[#10B981]' : 'text-[#FF4D6D]'}`}>
                          {deltaPower > 0 ? `+${deltaPower.toFixed(0)}` : deltaPower.toFixed(0)} W
                        </div>
                      </div>

                      <div className="border border-slate-800 p-1.5 rounded bg-[#08101E]">
                        <div className="text-slate-400">{isEs ? 'COSTO' : 'COST'}</div>
                        <div className={`font-bold mt-0.5 ${deltaCost <= 0 ? 'text-[#10B981]' : 'text-[#FFC15E]'}`}>
                          {deltaCost > 0 ? `+$${deltaCost.toFixed(1)}M` : `$${deltaCost.toFixed(1)}M`}
                        </div>
                      </div>

                      <div className="border border-slate-800 p-1.5 rounded bg-[#08101E]">
                        <div className="text-slate-400">{isEs ? 'VOLUMEN' : 'VOLUME'}</div>
                        <div className={`font-bold mt-0.5 ${deltaVol <= 0 ? 'text-[#10B981]' : 'text-slate-200'}`}>
                          {deltaVol > 0 ? `+${deltaVol.toFixed(1)}` : deltaVol.toFixed(1)} U
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Equip Action Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-500 hidden sm:block">
                  {isEs ? 'Usa las flechas ← → para explorar todas las opciones' : 'Use arrow keys ← → to browse all options'}
                </div>

                <button
                  type="button"
                  onClick={handleEquipCurrent}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition shadow-lg ${
                    equipped
                      ? 'border border-[#10B981] bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 cursor-default'
                      : 'border border-[#5FF3FF] bg-[#5FF3FF] text-[#02050B] hover:bg-[#7ff6ff] shadow-[0_0_20px_rgba(95,243,255,0.35)]'
                  }`}
                >
                  {equipped ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                      <span>{isEs ? 'SUBSISTEMA EQUIPADO' : 'ALREADY EQUIPPED'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-[#02050B]" />
                      <span>{isEs ? 'EQUIPAR EN MI NAVE' : 'EQUIP ON SPACECRAFT'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
