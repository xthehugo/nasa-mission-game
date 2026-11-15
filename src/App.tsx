import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import {
  AstraFloatingCompanion,
  CampaignMapModal,
  COMMANDER_PHASE_BEATS,
  CommanderHudBanner,
  CommanderOnboardingModal,
  FlightSimulationPanel,
  GoogleAIStudioModal,
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
  StoryCinematicModal,
  TelemetryModalDrawer,
  TopBar,
  TradeSpacePanel,
} from './components';
import { playHoloTone } from './components/holoAudio';
import { findDestinationById, findObjectiveById } from './engine';
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
    level1TutorialStep,
    robotHoverZone,
    maxUnlockedLevel,
    selection,
    metrics,
    reducedMotion,
    soundEnabled,
    setPhase,
    setSubsystem,
    setGroundStation,
    togglePayload,
    setLevel1TutorialStep,
    launchSimulation,
  } = useMissionStore();

  const handleQuickFixFailure = (mode: FailureMode) => {
    const destId = selection.destinationId;
    const isJupiter = destId === 'dest-jupiter';
    const isDeepSpace =
      destId === 'dest-jupiter' || destId === 'dest-mars' || destId === 'dest-l2';
    const activeObj = findObjectiveById(selection.objectiveId);

    // 1. Target direct failure mode
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
        setSubsystem('EPS', isJupiter ? 'eps-rtg' : 'eps-megaflex');
        setSubsystem('THERMAL', 'therm-active');
        break;
      case 'TELECOM_TUMBLE':
        setSubsystem('TELECOM', destId === 'dest-l2' ? 'telecom-cubelct-laser' : 'telecom-xka');
        setSubsystem('ADCS', 'adcs-sagitta-star');
        setGroundStation(
          isJupiter ? 'gs-dsn-70m' : isDeepSpace ? 'gs-dsn-34m' : 'gs-near-earth',
        );
        break;
      default:
        break;
    }

    // 2. Also proactively resolve any other compounding technical violations
    if (!metrics.volume.isCompliant || metrics.wetMass_kg > metrics.launchCapacity_kg) {
      setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
    }
    if (metrics.deltaV_available_ms < metrics.deltaV_required_ms) {
      setSubsystem('PROPULSION', 'prop-biprop');
      if (destId !== 'dest-leo') setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
    }
    if (metrics.power.status === 'RED') {
      setSubsystem('EPS', isJupiter ? 'eps-rtg' : 'eps-megaflex');
      setSubsystem('THERMAL', 'therm-active');
    }
    if (metrics.telecom.status === 'RED') {
      setSubsystem('TELECOM', destId === 'dest-l2' ? 'telecom-cubelct-laser' : 'telecom-xka');
      setGroundStation(isJupiter ? 'gs-dsn-70m' : isDeepSpace ? 'gs-dsn-34m' : 'gs-near-earth');
    }

    // Ensure required science payload is equipped
    const missingPayloads = activeObj.requiredPayloadIds.filter(
      (id) => !selection.payloadIds.includes(id),
    );
    for (const pid of missingPayloads) {
      togglePayload(pid);
    }

    playHoloTone('STAR', soundEnabled);
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
        <section
          data-astra-zone="LEFT_PANEL"
          className={`order-2 space-y-4 transition-all lg:order-1 lg:col-span-3 ${
            robotHoverZone === 'LEFT_PANEL'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
          }`}
        >
          <div
            data-astra-zone="RESOURCES"
            className={`transition-all ${
              (phase === 'CML_1' && level1TutorialStep === 0) ||
              robotHoverZone === 'RESOURCES'
                ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2.5 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
                : ''
            }`}
          >
            {phase === 'CML_1' && level1TutorialStep === 0 && (
              <div className="mb-2 space-y-1.5 border border-[#FFC15E] bg-[#FFC15E]/15 p-2">
                <div className="font-mono text-[9.5px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5 animate-pulse">
                  <ArrowLeft className="h-3 w-3 text-[#FFC15E]" />
                  <span>
                    {isEs
                      ? 'PASO 1/5: ESTOS SON LOS 5 SIGNOS VITALES DE TU NAVE'
                      : 'STEP 1/5: THESE ARE THE 5 VITAL SIGNS OF YOUR SPACECRAFT'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setLevel1TutorialStep(1);
                  }}
                  className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 py-1 font-mono text-[9px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30"
                >
                  {isEs
                    ? 'ENTENDIDO · CONTINUAR AL CHASIS →'
                    : 'GOT IT · CONTINUE TO CHASSIS →'}
                </button>
              </div>
            )}
            <HudResourceBars />
          </div>
          {phase === 'CML_1' && <PhaseStep1User zone="LEFT" />}
          {phase === 'CML_2' && <OrbitGroundStep zone="LEFT" />}
          {phase === 'CML_3' && <TradeSpacePanel zone="LEFT" />}
          {phase === 'CML_4' && <PointDesignStep zone="LEFT" />}
          {phase === 'CML_5' && <MCRReviewGate zone="LEFT" />}
          {phase === 'SIMULATION' && <FlightSimulationPanel zone="LEFT" />}
        </section>

        {/* CENTER ZONE: Hero Hologram Stage */}
        <section
          data-astra-zone="HOLOGRAM"
          className={`order-1 flex flex-col items-center justify-center py-2 transition-all lg:order-2 lg:col-span-6 ${
            robotHoverZone === 'HOLOGRAM'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2.5 shadow-[0_0_28px_rgba(95,243,255,0.3)]'
              : ''
          }`}
        >
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
                    key={`${selection.objectiveId}-${selection.destinationId}-${selection.launchVehicleId}-${selection.propulsionId}-${selection.epsId}-${selection.telecomId}-${selection.payloadIds.join(',')}`}
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
            <div className="mt-4 flex flex-col items-center gap-1.5">
              {phase === 'CML_1' && level1TutorialStep === 4 && (
                <div className="border border-[#FFC15E] bg-[#FFC15E]/15 px-3 py-1 font-mono text-[9.5px] font-bold tracking-[0.14em] text-[#FFC15E] uppercase flex items-center gap-1.5 animate-pulse">
                  <ArrowDown className="h-3 w-3 text-[#FFC15E]" />
                  <span>
                    {isEs
                      ? 'PASO 5/5: ¡PLANO COMPLETADO! PULSA AQUÍ PARA IR AL NIVEL 02'
                      : 'STEP 5/5: BLUEPRINT COMPLETE! CLICK HERE FOR LEVEL 02'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (phase === 'CML_1' && level1TutorialStep < 5) {
                    setLevel1TutorialStep(5);
                  }
                  goToLevel(nextPhase);
                }}
                className={`border px-6 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition ${
                  phase === 'CML_1' && level1TutorialStep === 4
                    ? 'border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] ring-2 ring-[#FFC15E] shadow-[0_0_28px_rgba(255,193,94,0.35)] animate-pulse'
                    : 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-[#5FF3FF] shadow-[0_0_20px_rgba(95,243,255,0.18)] hover:bg-[#5FF3FF]/20'
                }`}
              >
                {nextPhase === 'SIMULATION'
                  ? isEs
                    ? 'LANZAR MISIÓN · 06 →'
                    : 'LAUNCH MISSION · 06 →'
                  : isEs
                    ? `SIGUIENTE NIVEL · 0${currentIdx + 2} →`
                    : `NEXT LEVEL · 0${currentIdx + 2} →`}
              </button>
            </div>
          )}
        </section>

        {/* RIGHT ZONE: Commander Vega Transmission + Step Decisions */}
        <section
          data-astra-zone="RIGHT_PANEL"
          className={`order-3 space-y-4 transition-all lg:col-span-3 ${
            robotHoverZone === 'RIGHT_PANEL'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
          }`}
        >
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
      <footer
        data-astra-zone="FOOTER_LEVELS"
        className={`border-t border-[#5FF3FF]/20 px-4 py-3 transition-all sm:px-6 ${
          robotHoverZone === 'FOOTER_LEVELS'
            ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
            : ''
        }`}
      >
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

      <AstraFloatingCompanion />
      <CommanderOnboardingModal />
      <CampaignMapModal />
      <GoogleAIStudioModal />
      <StoryCinematicModal />
      <PostMissionCertificateModal />
      <TelemetryModalDrawer />
      <NarrativePitchModal />
    </div>
  );
}

export default App;
