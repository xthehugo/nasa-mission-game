import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowLeft, Check, Lock } from 'lucide-react';
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
import { playBgmTrack, playHoloTone, stopBgmTrack } from './components/holoAudio';
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
    activeCinematicId,
    activeRandomEvent,
    isCertificateOpen,
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

  // Cohesive Dynamic Soundtrack (BGM) according to current game state & narrative beat
  useEffect(() => {
    if (!soundEnabled) {
      stopBgmTrack();
      return;
    }

    if (isCertificateOpen) {
      playBgmTrack('VICTORY_FANFARE', true);
      return;
    }

    if (activeCinematicId) {
      if (activeCinematicId === 'ACT2_PROLOGUE' || activeCinematicId === 'ACT1_CLIMAX_JPL_TWIST') {
        playBgmTrack('JUPITER_DEEP_SPACE', true);
      } else if (activeCinematicId === 'ACT2_FINALE_SANDBOX') {
        playBgmTrack('VICTORY_FANFARE', true);
      } else {
        playBgmTrack('HANGAR_AMBIENT', true);
      }
      return;
    }

    if (phase === 'SIMULATION') {
      // Epic Launch theme starting at second 30 (the climax!)
      playBgmTrack('LAUNCH_EPIC', true);
      return;
    }

    if (activeRandomEvent !== 'NONE') {
      playBgmTrack('TENSION_CRISIS', true);
      return;
    }

    if (experienceMode === 'JPL_ENGINEER' || selection.destinationId === 'dest-jupiter') {
      playBgmTrack('JUPITER_DEEP_SPACE', true);
      return;
    }

    playBgmTrack('HANGAR_AMBIENT', true);
  }, [
    soundEnabled,
    phase,
    activeRandomEvent,
    activeCinematicId,
    isCertificateOpen,
    experienceMode,
    selection.destinationId,
  ]);

  return (
    <div
      className="flex min-h-[100dvh] flex-col justify-between bg-[#04080F] text-slate-100 antialiased selection:bg-[#5FF3FF]/25 lg:h-[100dvh] lg:overflow-hidden"
      style={{
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        backgroundImage:
          'radial-gradient(circle at 50% 48%, rgba(95,243,255,0.09) 0%, rgba(4,8,15,0) 58%)',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@300;400;500&display=swap'); .font-mono { font-family: 'JetBrains Mono', monospace; }`}</style>

      <TopBar />

      {/* 3-Zone Holographic Stage (Center Hologram first on mobile, 100dvh no-scroll on desktop) */}
      <main className="relative z-10 mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 items-start gap-3 px-3 py-2.5 sm:px-5 lg:min-h-0 lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        {/* LEFT ZONE: Live Fine Telemetry + Primary Level Controls */}
        <section
          data-astra-zone="LEFT_PANEL"
          className={`order-2 space-y-2.5 transition-all lg:order-1 lg:col-span-3 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 ${
            robotHoverZone === 'LEFT_PANEL'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
          }`}
        >
          <div
            data-astra-zone="RESOURCES"
            className={`transition-all ${
              phase === 'CML_1' && level1TutorialStep === 0
                ? 'border border-[#FFC15E] bg-[#FFC15E]/10 p-2 shadow-[0_0_20px_rgba(255,193,94,0.2)]'
                : robotHoverZone === 'RESOURCES'
                  ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
                  : ''
            }`}
          >
            {phase === 'CML_1' && level1TutorialStep === 0 && (
              <div className="mb-1.5 space-y-1 border-b border-[#FFC15E]/30 pb-1.5">
                <div className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5">
                  <ArrowLeft className="h-3 w-3 shrink-0 text-[#FFC15E]" />
                  <span>
                    {isEs
                      ? 'PASO 1/5: TUS 5 SIGNOS VITALES'
                      : 'STEP 1/5: YOUR 5 VITAL SIGNS'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STEP', soundEnabled);
                    setLevel1TutorialStep(1);
                  }}
                  className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 py-1 font-mono text-[8.5px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30"
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
          className={`order-1 flex flex-col items-center justify-between py-1 transition-all lg:order-2 lg:col-span-6 lg:h-full lg:min-h-0 lg:overflow-y-auto ${
            robotHoverZone === 'HOLOGRAM'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_28px_rgba(95,243,255,0.3)]'
              : ''
          }`}
        >
          <div className="mb-1.5 w-full shrink-0 border border-[#5FF3FF]/25 bg-[#04080F]/80 px-3 py-1 text-center font-mono text-[9.5px] tracking-[0.06em] text-[#5FF3FF]">
            <span className="mr-2 font-bold text-[#FFC15E]">{beat.beatCode}</span>
            <span className="text-slate-200">
              {experienceMode === 'CADET' ? beat.cadetGoal[language] : beat.jplSpec[language]}
            </span>
          </div>

          <div className="flex w-full flex-1 min-h-0 items-center justify-center">
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
                  <div className="min-h-[420px] w-full overflow-hidden border border-[#5FF3FF]/40 bg-[#04080F]">
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
          </div>

          {nextPhase && (() => {
            const cml1TourPending = phase === 'CML_1' && level1TutorialStep < 4;
            const cml1PhysicsIssue =
              phase === 'CML_1' &&
              (!metrics.volume.isCompliant ||
                metrics.wetMass_kg > metrics.launchCapacity_kg ||
                metrics.power.generatedAtDestination_W < metrics.power.eclipseRequired_W);
            const nextLocked = cml1TourPending || cml1PhysicsIssue;
            const lockHint = cml1TourPending
              ? isEs
                ? 'Completa Chasis, Energía y Misión (o salta el tour) para avanzar'
                : 'Complete Chassis, Power & Mission (or skip tour) to continue'
              : cml1PhysicsIssue
                ? isEs
                  ? 'Casi listo: revisa el volumen en cofia, la masa o la energía EPS'
                  : 'Almost there: check fairing volume, mass, or EPS power'
                : '';

            return (
              <div className="mt-2 flex shrink-0 flex-col items-center gap-1">
                {phase === 'CML_1' && level1TutorialStep === 4 && !nextLocked && (
                  <div className="border border-[#FFC15E] bg-[#FFC15E]/15 px-3 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5">
                    <ArrowDown className="h-3 w-3 text-[#FFC15E]" />
                    <span>
                      {isEs
                        ? 'PASO 5/5: ¡PLANO COMPLETADO! PULSA PARA IR AL NIVEL 02'
                        : 'STEP 5/5: BLUEPRINT COMPLETE! CLICK FOR LEVEL 02'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  disabled={nextLocked}
                  title={lockHint}
                  onClick={() => {
                    if (nextLocked) return;
                    if (phase === 'CML_1' && level1TutorialStep < 5) {
                      setLevel1TutorialStep(5);
                    }
                    goToLevel(nextPhase);
                  }}
                  className={`border px-6 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition ${
                    nextLocked
                      ? 'cursor-not-allowed border-slate-700 bg-slate-900/40 text-slate-500 opacity-50'
                      : phase === 'CML_1' && level1TutorialStep === 4
                        ? `border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] ring-2 ring-[#FFC15E] shadow-[0_0_24px_rgba(255,193,94,0.3)] ${
                            !reducedMotion ? 'animate-pulse' : ''
                          }`
                        : `border-[#5FF3FF] bg-[#5FF3FF]/10 text-[#5FF3FF] shadow-[0_0_18px_rgba(95,243,255,0.2)] hover:bg-[#5FF3FF]/20 ${
                            !reducedMotion && phase === 'CML_1' ? 'animate-pulse' : ''
                          }`
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
                {nextLocked && (
                  <span className="font-mono text-[10.5px] text-slate-400">
                    {lockHint}
                  </span>
                )}
              </div>
            );
          })()}
        </section>

        {/* RIGHT ZONE: Commander Vega Transmission + Step Decisions */}
        <section
          data-astra-zone="RIGHT_PANEL"
          className={`order-3 space-y-2.5 transition-all lg:col-span-3 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 ${
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

      {/* Bottom 6-Level Progress Indicator */}
      <footer
        data-astra-zone="FOOTER_LEVELS"
        className={`relative z-10 shrink-0 border-t border-[#5FF3FF]/15 bg-[#04080F]/95 px-4 py-2.5 transition-all sm:px-7 ${
          robotHoverZone === 'FOOTER_LEVELS'
            ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
            : ''
        }`}
      >
        <nav aria-label="Mission Levels" className="mx-auto grid max-w-[1600px] grid-cols-3 gap-3 sm:grid-cols-6">
          {LEVELS.map((lvl, idx) => {
            const active = phase === lvl.id;
            const completed = idx < currentIdx;
            const unlocked = idx + 1 <= maxUnlockedLevel || idx === currentIdx + 1;
            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!unlocked}
                onClick={() => goToLevel(lvl.id)}
                className={`flex items-center gap-1.5 border-t-2 pt-2 text-left font-mono text-[11.5px] tracking-[0.12em] uppercase transition ${
                  active
                    ? 'border-[#5FF3FF] font-semibold text-[#5FF3FF] shadow-[0_-6px_14px_rgba(95,243,255,0.25)]'
                    : completed
                      ? 'border-[#5FF3FF]/45 text-[#5FF3FF]/80 hover:text-white'
                      : unlocked
                        ? 'border-transparent text-slate-400 hover:border-[#5FF3FF]/40 hover:text-slate-200'
                        : 'cursor-not-allowed border-transparent text-slate-600 opacity-45'
                }`}
              >
                {completed && <Check className="h-3.5 w-3.5 shrink-0 text-[#5FF3FF]" />}
                {!unlocked && <Lock className="h-3 w-3 shrink-0 text-slate-500" />}
                <span className="truncate">
                  {lvl.num} {lvl.label[language]}
                </span>
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
