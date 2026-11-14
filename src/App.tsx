import { AnimatePresence, motion } from 'framer-motion';
import {
  COMMANDER_PHASE_BEATS,
  CommanderHudBanner,
  CommanderOnboardingModal,
  FlightSimulationPanel,
  HOLO_ANIMATION_PRESETS,
  HoloOrbitStage,
  HoloPointTankStage,
  HoloSpacecraftWireframe,
  HudResourceBars,
  MCRReviewGate,
  NarrativePitchModal,
  OrbitGroundStep,
  PhaseStep1User,
  PointDesignStep,
  PostMissionCertificateModal,
  TelemetryModalDrawer,
  TopBar,
  TradeSpacePanel,
} from './components';
import { playHoloTone } from './components/holoAudio';
import { findDestinationById } from './engine';
import { useMissionStore } from './store';
import type { CMLPhase } from './types/mission';
import { MissionStage } from './visuals';
import type { FailureMode } from './visuals/SpacecraftBlueprint';

const LEVELS: { id: CMLPhase; num: string; label: { en: string; es: string } }[] = [
  { id: 'CML_1', num: '01', label: { en: 'NAPKIN', es: 'SERVILLETA' } },
  { id: 'CML_2', num: '02', label: { en: 'ORBIT', es: 'ÓRBITA' } },
  { id: 'CML_3', num: '03', label: { en: 'TRADE SPACE', es: 'TRADE SPACE' } },
  { id: 'CML_4', num: '04', label: { en: 'POINT', es: 'PUNTO' } },
  { id: 'CML_5', num: '05', label: { en: 'V&V / MCR', es: 'V&V / MCR' } },
  { id: 'SIMULATION', num: '06', label: { en: 'LAUNCH', es: 'LANZAMIENTO' } },
];

const NEXT_PHASE: Partial<Record<CMLPhase, CMLPhase>> = {
  CML_1: 'CML_2',
  CML_2: 'CML_3',
  CML_3: 'CML_4',
  CML_4: 'CML_5',
  CML_5: 'SIMULATION',
};

export function App() {
  const {
    language,
    experienceMode,
    phase,
    maxUnlockedLevel,
    selection,
    metrics,
    reducedMotion,
    soundEnabled,
    setPhase,
    setSubsystem,
    setGroundStation,
    launchSimulation,
  } = useMissionStore();

  const handleQuickFixFailure = (mode: FailureMode) => {
    const destId = selection.destinationId;
    const isDeepSpace =
      destId === 'dest-jupiter' || destId === 'dest-mars' || destId === 'dest-l2';

    switch (mode) {
      case 'FAIRING_COLLISION':
      case 'MASS_BUCKLING':
        setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
        break;
      case 'DELTAV_DEPLETION':
        setSubsystem('PROPULSION', 'prop-biprop');
        if (destId !== 'dest-leo') {
          setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
        }
        break;
      case 'POWER_FREEZE':
        setSubsystem('EPS', destId === 'dest-jupiter' ? 'eps-rtg' : 'eps-megaflex');
        setSubsystem('THERMAL', 'therm-active');
        break;
      case 'TELECOM_TUMBLE':
        setSubsystem('TELECOM', 'telecom-xka');
        setSubsystem('ADCS', 'adcs-sagitta-star');
        setGroundStation(
          isDeepSpace ? 'gs-dsn-70m' : destId === 'dest-leo' ? 'gs-commercial' : 'gs-near-earth',
        );
        break;
      default:
        break;
    }
    launchSimulation();
  };

  const isEs = language === 'es';
  const nextPhase = NEXT_PHASE[phase];
  const currentIdx = LEVELS.findIndex((l) => l.id === phase);
  const beat = COMMANDER_PHASE_BEATS[phase];

  const goToLevel = (target: CMLPhase) => {
    playHoloTone('STEP', soundEnabled);
    if (target === 'SIMULATION') launchSimulation();
    else setPhase(target);
  };

  return (
    <div
      className="flex min-h-screen flex-col justify-between bg-[#04080F] text-slate-100 antialiased selection:bg-[#5FF3FF]/25"
      style={{
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        backgroundImage:
          'radial-gradient(circle at 50% 48%, rgba(95,243,255,0.09) 0%, rgba(4,8,15,0) 58%)',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@300;400;500&display=swap'); .font-mono { font-family: 'JetBrains Mono', monospace; }`}</style>

      <TopBar />

      {/* 3-Zone Holographic Stage (Center Hologram first on mobile) */}
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 items-start gap-6 px-4 py-5 sm:px-6 lg:grid-cols-12">
        {/* LEFT ZONE: Live Fine Telemetry + Primary Level Controls */}
        <section className="order-2 space-y-4 lg:order-1 lg:col-span-3">
          <HudResourceBars />
          {phase === 'CML_1' && <PhaseStep1User zone="LEFT" />}
          {phase === 'CML_2' && <OrbitGroundStep zone="LEFT" />}
          {phase === 'CML_3' && <TradeSpacePanel zone="LEFT" />}
          {phase === 'CML_4' && <PointDesignStep zone="LEFT" />}
          {phase === 'CML_5' && <MCRReviewGate zone="LEFT" />}
          {phase === 'SIMULATION' && <FlightSimulationPanel zone="LEFT" />}
        </section>

        {/* CENTER ZONE: Hero Hologram Stage */}
        <section className="order-1 flex flex-col items-center justify-center py-2 lg:order-2 lg:col-span-6">
          <div className="mb-3 w-full border border-[#5FF3FF]/25 bg-[#04080F]/80 px-3 py-1.5 text-center font-mono text-[10px] tracking-[0.08em] text-[#5FF3FF]">
            <span className="mr-2 font-bold text-[#FFC15E]">{beat.beatCode}</span>
            <span className="text-slate-200">
              {experienceMode === 'CADET' ? beat.cadetGoal[language] : beat.jplSpec[language]}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : HOLO_ANIMATION_PRESETS.stageFadeSec }}
              className="w-full"
            >
              {(phase === 'CML_1' || phase === 'CML_3' || phase === 'CML_5') && (
                <HoloSpacecraftWireframe />
              )}
              {phase === 'CML_2' && <HoloOrbitStage />}
              {phase === 'CML_4' && <HoloPointTankStage />}
              {phase === 'SIMULATION' && (
                <div className="min-h-[460px] w-full overflow-hidden border border-[#5FF3FF]/40 bg-[#04080F]">
                  <MissionStage
                    destination={findDestinationById(selection.destinationId)}
                    volume={metrics.volume}
                    metrics={metrics}
                    lang={language}
                    onQuickFix={handleQuickFixFailure}
                    embedded
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {nextPhase && (
            <button
              type="button"
              onClick={() => goToLevel(nextPhase)}
              className="mt-4 border border-[#5FF3FF] bg-[#5FF3FF]/10 px-6 py-2 font-mono text-[11px] tracking-[0.18em] text-[#5FF3FF] uppercase shadow-[0_0_20px_rgba(95,243,255,0.18)] transition hover:bg-[#5FF3FF]/20"
            >
              {nextPhase === 'SIMULATION'
                ? isEs
                  ? 'LANZAR MISIÓN · 06 →'
                  : 'LAUNCH MISSION · 06 →'
                : isEs
                  ? `SIGUIENTE NIVEL · 0${currentIdx + 2} →`
                  : `NEXT LEVEL · 0${currentIdx + 2} →`}
            </button>
          )}
        </section>

        {/* RIGHT ZONE: Commander Vega Transmission + Step Decisions */}
        <section className="order-3 space-y-4 lg:col-span-3">
          <CommanderHudBanner />
          {phase === 'CML_1' && <PhaseStep1User zone="RIGHT" />}
          {phase === 'CML_2' && <OrbitGroundStep zone="RIGHT" />}
          {phase === 'CML_3' && <TradeSpacePanel zone="RIGHT" />}
          {phase === 'CML_4' && <PointDesignStep zone="RIGHT" />}
          {phase === 'CML_5' && <MCRReviewGate zone="RIGHT" />}
          {phase === 'SIMULATION' && <FlightSimulationPanel zone="RIGHT" />}
        </section>
      </main>

      {/* Bottom 6-Level Progressive Navigation Strip */}
      <footer className="border-t border-[#5FF3FF]/20 px-4 py-3 sm:px-6">
        <nav aria-label="Mission Levels" className="mx-auto grid max-w-[1600px] grid-cols-3 gap-2 sm:grid-cols-6">
          {LEVELS.map((lvl, idx) => {
            const active = phase === lvl.id;
            const unlocked = idx + 1 <= maxUnlockedLevel || idx === currentIdx + 1;
            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!unlocked}
                onClick={() => goToLevel(lvl.id)}
                className={`border-t-2 pt-2 text-left font-mono text-[10px] tracking-[0.16em] uppercase transition ${
                  active
                    ? 'border-[#5FF3FF] text-[#5FF3FF] shadow-[0_-6px_14px_rgba(95,243,255,0.25)]'
                    : unlocked
                      ? 'border-transparent text-slate-400 hover:border-[#5FF3FF]/40 hover:text-slate-200'
                      : 'cursor-not-allowed border-transparent text-slate-700'
                }`}
              >
                {lvl.num} {lvl.label[language]} {!unlocked ? '· LOCK' : ''}
              </button>
            );
          })}
        </nav>
      </footer>

      <CommanderOnboardingModal />
      <PostMissionCertificateModal />
      <TelemetryModalDrawer />
      <NarrativePitchModal />
    </div>
  );
}

export default App;
