import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';
import { SUBMODULE_GUIDES, type SubmoduleGuideId } from './submoduleGuideConfig';

interface SubmoduleInfoModalProps {
  guideId: SubmoduleGuideId | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmoduleInfoModal({
  guideId,
  isOpen,
  onClose,
}: SubmoduleInfoModalProps) {
  const { language, experienceMode, soundEnabled, reducedMotion } = useMissionStore();

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ENGINEER'>(
    experienceMode === 'JPL_ENGINEER' ? 'ENGINEER' : 'STUDENT'
  );

  // Sync default tab when opening modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab(experienceMode === 'JPL_ENGINEER' ? 'ENGINEER' : 'STUDENT');
    }
  }, [isOpen, experienceMode]);

  // Keyboard navigation
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

  if (!guideId || !SUBMODULE_GUIDES[guideId]) return null;

  const guide = SUBMODULE_GUIDES[guideId];
  const isEs = language === 'es';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#02050B]/90 p-3 sm:p-5 backdrop-blur-md font-mono"
        >
          <motion.div
            initial={reducedMotion ? false : { scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { scale: 0.95, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-xl border-2 border-[#5FF3FF]/50 bg-[#04080F] shadow-[0_0_60px_rgba(95,243,255,0.22)] text-slate-100 overflow-hidden"
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-[#5FF3FF]/25 bg-[#061224] px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#5FF3FF]/50 bg-[#5FF3FF]/15 text-[#5FF3FF]">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#FFC15E] uppercase">
                    {guide.badge[language]}
                  </div>
                  <h3 className="text-base sm:text-lg font-light text-white tracking-wide">
                    {guide.title[language]}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  onClose();
                }}
                className="flex items-center gap-1 rounded border border-[#5FF3FF]/30 bg-[#071324] px-2.5 py-1 text-xs text-slate-300 hover:border-[#FF4D6D] hover:bg-[#FF4D6D]/15 hover:text-[#FF4D6D] transition cursor-pointer"
                title={isEs ? 'Cerrar ventana (ESC)' : 'Close modal (ESC)'}
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-[10px]">ESC</span>
              </button>
            </div>

            {/* Mode Switcher Banner: Student vs Engineer */}
            <div className="flex items-center justify-between border-b border-[#5FF3FF]/20 bg-[#030914] px-4 py-2 sm:px-6">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {guide.subtitle[language]}
              </span>

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 bg-[#02050B] p-1 rounded border border-[#5FF3FF]/30 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setActiveTab('STUDENT');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold tracking-wider rounded transition cursor-pointer ${
                    activeTab === 'STUDENT'
                      ? 'border border-[#5FF3FF] bg-[#5FF3FF]/20 text-[#5FF3FF] shadow-[0_0_12px_rgba(95,243,255,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{isEs ? 'VISTA ESTUDIANTE' : 'STUDENT VIEW'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setActiveTab('ENGINEER');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold tracking-wider rounded transition cursor-pointer ${
                    activeTab === 'ENGINEER'
                      ? 'border border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] shadow-[0_0_12px_rgba(255,193,94,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>{isEs ? 'VISTA INGENIERO JPL' : 'JPL ENGINEER VIEW'}</span>
                </button>
              </div>
            </div>

            {/* Modal Body with Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 telemetry-scrollbar">
              {activeTab === 'STUDENT' ? (
                /* ================= VISTA ESTUDIANTE / CADETE ================= */
                <div className="space-y-4">
                  {/* Analogy Card */}
                  <div className="border border-[#5FF3FF]/40 bg-[#061426]/70 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#5FF3FF] uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-[#FFC15E]" />
                      <span>{guide.studentView.analogyTitle[language]}</span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-slate-200 font-sans">
                      {guide.studentView.analogyText[language]}
                    </p>
                  </div>

                  {/* Cause and Effect Grid */}
                  <div className="border border-[#5FF3FF]/25 bg-[#030914] p-4 rounded-lg space-y-2.5">
                    <div className="font-mono text-[11px] font-bold text-[#FFC15E] uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      <span>{isEs ? '¿QUÉ PASA SI CAMBIO ESTE PARÁMETRO? (CAUSA Y EFECTO)' : 'WHAT HAPPENS IF I TWEAK THIS? (CAUSE & EFFECT)'}</span>
                    </div>

                    <div className="space-y-2">
                      {guide.studentView.causeAndEffect.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 border border-[#5FF3FF]/15 bg-[#071322] p-2.5 rounded text-xs"
                        >
                          <div className="sm:col-span-5 font-mono font-bold text-[#5FF3FF] flex items-center gap-1">
                            <span>➔ {item.action[language]}</span>
                          </div>
                          <div className="sm:col-span-7 text-slate-300 font-sans leading-snug">
                            {item.consequence[language]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Golden Rule */}
                  <div className="border border-[#10B981]/50 bg-[#10B981]/10 p-3.5 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                        {isEs ? 'REGLA DE ORO DE LA MISIÓN' : 'MISSION GOLDEN RULE'}
                      </div>
                      <p className="mt-1 text-xs text-slate-200 font-sans leading-relaxed">
                        {guide.studentView.goldenRule[language]}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= VISTA INGENIERO / JPL ================= */
                <div className="space-y-4">
                  {/* Theory & Formula Block */}
                  <div className="border border-[#FFC15E]/40 bg-[#0d1624] p-4 rounded-lg space-y-2.5">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FFC15E] uppercase tracking-wider">
                      <FileText className="h-4 w-4" />
                      <span>{guide.engineerView.theoryTitle[language]}</span>
                    </div>

                    {guide.engineerView.formula && (
                      <div className="rounded border border-[#5FF3FF]/30 bg-[#02050B] p-3 text-center overflow-x-auto font-mono text-xs sm:text-sm text-[#5FF3FF] tracking-wider shadow-inner">
                        <code>{guide.engineerView.formula}</code>
                      </div>
                    )}

                    {guide.engineerView.formulaExplanation && (
                      <p className="text-xs leading-relaxed text-slate-300 font-sans">
                        {guide.engineerView.formulaExplanation[language]}
                      </p>
                    )}
                  </div>

                  {/* NASA Engineering Standards */}
                  <div className="border border-[#5FF3FF]/25 bg-[#030914] p-4 rounded-lg space-y-2.5">
                    <div className="font-mono text-[11px] font-bold text-[#5FF3FF] uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#5FF3FF]" />
                      <span>{isEs ? 'ESTÁNDARES APLICABLES DE LA NASA & AIAA' : 'APPLICABLE NASA & AIAA STANDARDS'}</span>
                    </div>

                    <div className="space-y-1.5">
                      {guide.engineerView.nasaStandards.map((std, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 border border-[#5FF3FF]/15 bg-[#071322] px-3 py-1.5 rounded font-mono text-[11px] text-slate-200"
                        >
                          <span className="text-[#FFC15E]">§</span>
                          <span>{std}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantitative Technical Parameters Table */}
                  <div className="border border-[#5FF3FF]/25 bg-[#030914] p-4 rounded-lg space-y-2.5">
                    <div className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                      {isEs ? 'PARÁMETROS TÉCNICOS CUANTITATIVOS' : 'QUANTITATIVE TECHNICAL PARAMETERS'}
                    </div>

                    <div className="space-y-1.5">
                      {guide.engineerView.technicalParameters.map((param, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5 text-xs font-mono"
                        >
                          <span className="text-slate-400">{param.parameter}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#5FF3FF]">{param.value}</span>
                            <span className="text-[10px] text-slate-500">
                              ({param.requirement[language]})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Flight Rule */}
                  <div className="border border-[#FFC15E]/50 bg-[#FFC15E]/10 p-3.5 rounded-lg flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#FFC15E] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-[#FFC15E] uppercase tracking-wider">
                        {isEs ? 'REGLA DE VUELO MANDATORIA (FLIGHT RULE)' : 'MANDATORY FLIGHT RULE'}
                      </div>
                      <p className="mt-1 text-xs text-slate-200 font-sans leading-relaxed">
                        {guide.engineerView.flightRule[language]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="border-t border-[#5FF3FF]/25 bg-[#061224] px-4 py-3 sm:px-6 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-slate-400 hidden sm:inline">
                {isEs
                  ? 'Usa el conmutador superior para alternar entre explicación didáctica y física rigurosa.'
                  : 'Toggle above to switch between student analogies and rigorous physics.'}
              </span>

              <button
                type="button"
                onClick={() => {
                  playHoloTone('STAR', soundEnabled);
                  onClose();
                }}
                className="w-full sm:w-auto border border-[#5FF3FF] bg-[#5FF3FF]/20 px-5 py-2 font-mono text-xs font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30 transition rounded shadow-[0_0_14px_rgba(95,243,255,0.2)] cursor-pointer"
              >
                {isEs ? 'ENTENDIDO · VOLVER AL DISEÑO →' : 'GOT IT · RETURN TO DESIGN →'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
