import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowLeft, Check, Lock } from 'lucide-react';
import {
  LEVEL1_TOTAL_STEPS,
  LEVEL1_TUTORIAL_STEPS,
} from './components/level1TutorialConfig';
import {
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
import { getMissionPhaseContent } from './components/missionDialogueConfig';
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
    activeCampaignLevelId,
    level1TutorialStep,
    robotHoverZone,
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
  const activeMissionContent = getMissionPhaseContent(activeCampaignLevelId, phase);
  const isL1Tut =
    activeCampaignLevelId === 'contract-leo-bionutrients' &&
    level1TutorialStep < LEVEL1_TOTAL_STEPS;
  const tutStep = isL1Tut ? LEVEL1_TUTORIAL_STEPS[level1TutorialStep] : null;
  // Option A Unlocked Flow: Keep educational highlights, but never freeze UI with pointer-events-none
  const tutGating = false;
  const leftZoneAllowed = true;
  const resourcesDimmed = false;
  const leftPhaseDimmed = false;
  const rightStepDimmed = false;

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
      className="flex h-[100dvh] flex-col justify-between overflow-hidden bg-[#04080F] text-slate-100 antialiased selection:bg-[#5FF3FF]/25"
      style={{
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        backgroundImage:
          'radial-gradient(circle at 50% 48%, rgba(95,243,255,0.09) 0%, rgba(4,8,15,0) 58%)',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@300;400;500&display=swap'); .font-mono { font-family: 'JetBrains Mono', monospace; }`}</style>

      <div className="shrink-0 border-b border-[#5FF3FF]/20 bg-[#04080F]/95 backdrop-blur-md">
        <TopBar />
      </div>

      {/* 3-Zone Holographic Stage (Strict 100dvh aerospace cockpit: independent smooth scroll for side panels, centered fixed hologram) */}
      <main className="relative z-10 mx-auto grid w-full max-w-[1600px] flex-1 min-h-0 grid-cols-1 items-start gap-3 px-3 py-2 sm:px-5 md:grid-cols-12 md:items-stretch overflow-hidden">
        {/* LEFT ZONE: Live Fine Telemetry + Primary Level Controls */}
        <section
          data-astra-zone="LEFT_PANEL"
          className={`order-2 space-y-2.5 transition-all md:order-1 md:col-span-3 md:h-full md:min-h-0 md:overflow-y-auto md:pr-1.5 ${
            !leftZoneAllowed
              ? 'opacity-40 pointer-events-none select-none'
              : robotHoverZone === 'LEFT_PANEL'
                ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
                : ''
          }`}
        >
          <div
            data-astra-zone="RESOURCES"
            className={`transition-all ${
              tutGating && tutStep?.activeZone === 'RESOURCES'
                ? 'border border-[#FFC15E] bg-[#FFC15E]/10 p-2 shadow-[0_0_24px_rgba(255,193,94,0.28)]'
                : resourcesDimmed
                  ? 'opacity-40 pointer-events-none select-none'
                  : robotHoverZone === 'RESOURCES'
                    ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
                    : ''
            }`}
          >
            {isL1Tut && phase === 'CML_1' && level1TutorialStep === 4 && (
              <div className="mb-1.5 space-y-1 border-b border-[#FFC15E]/30 pb-1.5">
                <div className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#FFC15E] uppercase flex items-center gap-1.5">
                  <ArrowLeft className="h-3 w-3 shrink-0 text-[#FFC15E]" />
                  <span>
                    {isEs
                      ? 'PASO 5/10: REGLA DE MÁRGENES EN TELEMETRÍA'
                      : 'STEP 5/10: SAFETY MARGINS IN TELEMETRY'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playHoloTone('STAR', soundEnabled);
                    setLevel1TutorialStep(5);
                    setPhase('CML_2');
                  }}
                  className="w-full border border-[#5FF3FF] bg-[#5FF3FF]/20 py-1 font-mono text-[8.5px] font-bold tracking-[0.14em] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/30"
                >
                  {isEs
                    ? 'CONFIRMAR MÁRGENES E IR A ÓRBITA (CML 02) →'
                    : 'CONFIRM MARGINS & GO TO ORBIT (CML 02) →'}
                </button>
              </div>
            )}
            <HudResourceBars />
          </div>
          <div className={leftPhaseDimmed ? 'opacity-40 pointer-events-none select-none transition-opacity' : ''}>
            {phase === 'CML_1' && <PhaseStep1User zone="LEFT" />}
            {phase === 'CML_2' && <OrbitGroundStep zone="LEFT" />}
            {phase === 'CML_3' && <TradeSpacePanel zone="LEFT" />}
            {phase === 'CML_4' && <PointDesignStep zone="LEFT" />}
            {phase === 'CML_5' && <MCRReviewGate zone="LEFT" />}
            {phase === 'SIMULATION' && <FlightSimulationPanel zone="LEFT" />}
          </div>
        </section>

        {/* CENTER ZONE: Hero Hologram Stage */}
        <section
          data-astra-zone="HOLOGRAM"
          className={`order-1 flex flex-col h-full min-h-0 justify-between transition-all z-20 md:order-2 md:col-span-6 overflow-y-auto ${
            robotHoverZone === 'HOLOGRAM'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_28px_rgba(95,243,255,0.3)]'
              : ''
          }`}
        >
          <div className="flex min-h-full w-full flex-col items-center justify-between py-1">
            <div className="mb-1.5 w-full shrink-0 border border-[#5FF3FF]/25 bg-[#04080F]/80 px-3 py-1 text-center font-mono text-[9.5px] tracking-[0.06em] text-[#5FF3FF]">
              <span className="mr-2 font-bold text-[#FFC15E]">{beat.beatCode}</span>
              <span className="text-slate-200">
                {activeMissionContent.headerGoal[language]}
              </span>
            </div>

            <div className="flex w-full flex-1 items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : HOLO_ANIMATION_PRESETS.stageFadeSec }}
                  className="flex min-h-full w-full items-center justify-center"
                >
                  {(phase === 'CML_1' || phase === 'CML_3' || phase === 'CML_5') && (
                    <HoloSpacecraftWireframe />
                  )}
                  {phase === 'CML_2' && <HoloOrbitStage />}
                  {phase === 'CML_4' && <HoloPointTankStage />}
                  {phase === 'SIMULATION' && (
                    <div className="w-full min-h-[460px] overflow-visible border border-[#5FF3FF]/40 bg-[#04080F] rounded">
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
            const isTutPending = false;
            let physicsIssue = false;
            let lockHint = '';

            if (phase === 'CML_1') {
              if (!metrics.volume.isCompliant) {
                physicsIssue = true;
                lockHint = isEs
                  ? 'El volumen excede el chasis o la cofia'
                  : 'Volume exceeds chassis or rocket fairing';
              } else if (metrics.wetMass_kg > metrics.launchCapacity_kg) {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Masa húmeda excede la capacidad del cohete'
                  : 'Wet mass exceeds rocket lift capacity';
              } else if (metrics.power.generatedAtDestination_W < metrics.power.eclipseRequired_W) {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Potencia insuficiente para el eclipse'
                  : 'Insufficient power for eclipse phase';
              }
            } else if (phase === 'CML_2') {
              if (activeCampaignLevelId === 'contract-geo-gmat' && selection.destinationId !== 'dest-geo') {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Contrato GEO: Elige Órbita Geoestacionaria (GEO)'
                  : 'GEO Contract: Select Geostationary Orbit (GEO)';
              } else if (activeCampaignLevelId === 'contract-moon-trailblazer' && selection.destinationId !== 'dest-moon') {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Contrato Lunar: Elige Órbita Polar Lunar'
                  : 'Lunar Contract: Select Lunar Polar Orbit';
              } else if (activeCampaignLevelId === 'contract-jupiter-clipper' && selection.destinationId !== 'dest-jupiter') {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Contrato Clipper: Elige Júpiter / Espacio Profundo'
                  : 'Clipper Contract: Select Jupiter / Deep Space';
              } else if (activeCampaignLevelId === 'contract-l2-jwst-fgs' && selection.destinationId !== 'dest-l2') {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Contrato JWST: Elige Sol-Tierra L2'
                  : 'JWST Contract: Select Sun-Earth L2';
              } else if (activeCampaignLevelId === 'contract-sso-tracers' && selection.destinationId !== 'dest-sso') {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Contrato TRACERS: Elige Órbita Heliosincrónica (SSO)'
                  : 'TRACERS Contract: Select Sun-Synchronous Orbit (SSO)';
              }
            } else if (phase === 'CML_3' || phase === 'CML_4') {
              if (!metrics.volume.isCompliant || metrics.wetMass_kg > metrics.launchCapacity_kg) {
                physicsIssue = true;
                lockHint = isEs
                  ? 'Masa o volumen excedidos: ajusta piezas o lanzador'
                  : 'Mass or volume exceeded: adjust parts or launcher';
              }
            }

            const nextLocked = isTutPending || physicsIssue;
            if (isTutPending && !lockHint) {
              lockHint = isEs
                ? 'Completa Chasis, Energía y Misión (o salta el tour) para avanzar'
                : 'Complete Chassis, Power & Mission (or skip tour) to continue';
            }

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
          </div>
        </section>

        {/* RIGHT ZONE: Commander Vega Transmission + Step Decisions */}
        <section
          data-astra-zone="RIGHT_PANEL"
          className={`order-3 space-y-2.5 transition-all md:col-span-3 md:h-full md:min-h-0 md:overflow-y-auto md:pr-1.5 ${
            robotHoverZone === 'RIGHT_PANEL'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 p-2 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
          }`}
        >
          <CommanderHudBanner />
          <div className={rightStepDimmed ? 'opacity-40 pointer-events-none select-none transition-opacity' : ''}>
            {phase === 'CML_1' && <PhaseStep1User zone="RIGHT" />}
            {phase === 'CML_2' && <OrbitGroundStep zone="RIGHT" />}
            {phase === 'CML_3' && <TradeSpacePanel zone="RIGHT" />}
            {phase === 'CML_4' && <PointDesignStep zone="RIGHT" />}
            {phase === 'CML_5' && <MCRReviewGate zone="RIGHT" />}
            {phase === 'SIMULATION' && <FlightSimulationPanel zone="RIGHT" />}
          </div>
        </section>
      </main>

      {/* Bottom 6-Level Progress Indicator */}
      <footer
        data-astra-zone="FOOTER_LEVELS"
        className={`shrink-0 border-t border-[#5FF3FF]/15 bg-[#04080F]/95 backdrop-blur-md px-4 py-2 transition-all sm:px-7 ${
          tutGating
            ? 'opacity-40 pointer-events-none select-none'
            : robotHoverZone === 'FOOTER_LEVELS'
              ? 'ring-2 ring-[#5FF3FF] bg-[#5FF3FF]/10 shadow-[0_0_26px_rgba(95,243,255,0.28)]'
              : ''
        }`}
      >
        <nav aria-label="Mission Levels" className="mx-auto grid max-w-[1600px] grid-cols-3 gap-3 sm:grid-cols-6">
          {LEVELS.map((lvl, idx) => {
            const active = phase === lvl.id;
            const completed = idx < currentIdx;
            // Opción A: Navegación libre para estudiantes, cadetes y docentes
            const unlocked = true;
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
