import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useMissionStore } from '../store';
import { playHoloTone } from '../components/holoAudio';
import type { Language, OrbitalDestination, PhysicsMetrics, VolumeMetrics } from '../types/mission';
import OrbitalMapVisualizer from './OrbitalMapVisualizer';
import SpacecraftBlueprint, { type FailureMode } from './SpacecraftBlueprint';
import TelemetryStripCharts, { type TelemetrySample } from './TelemetryStripCharts';
import SubsystemStressHeatmap from '../components/SubsystemStressHeatmap';
import DeploymentTimelineStepper from '../components/DeploymentTimelineStepper';
import BlackBoxFailureAutopsyModal from '../components/BlackBoxFailureAutopsyModal';

interface Props {
  destination: OrbitalDestination | null;
  volume: VolumeMetrics;
  metrics?: PhysicsMetrics;
  lang?: Language;
  controls?: ReactNode;
  embedded?: boolean;
  onQuickFix?: (mode: FailureMode) => void;
}

type Stage = 'IDLE' | 'COUNTDOWN' | 'LAUNCH_ASCENT' | 'FAILURE' | 'CRUISE' | 'ORBIT_INSERTION';
type EmbeddedView = 'SPLIT' | 'MAP' | 'BLUEPRINT' | 'CHARTS' | 'HEATMAP';

const COUNTDOWN_MS = 3000;
const ASCENT_MS = 6000;
const FAIL_POINT = 0.55;

const T = {
  en: {
    launch: '▲ LAUNCH',
    launchAnyway: 'LAUNCH ANYWAY',
    reset: '↺ RESET',
    viewSplit: 'SPLIT VIEW',
    viewMap: 'ORBITAL MAP',
    viewAscent: 'FAIRING & STRESS',
    viewCharts: 'CHARTS',
    viewHeatmap: 'STRESS HEATMAP',
    autoFix: '[FIX] AUTO-FIX & RELAUNCH',
    alt: 'Altitude',
    vel: 'Velocity',
    dv: 'ΔV used / required',
    mass: 'Wet Mass / Rocket',
    link: 'Link Margin / MCR',
    stress: 'Max Joint Stress',
    light: 'Light time',
    clock: 'Mission clock',
    orbitOk: 'ORBIT ACHIEVED ✓',
    nogo: {
      FAIRING_COLLISION: 'NO-GO: FAIRING OVERFLOW (<50 mm)',
      MASS_BUCKLING: 'NO-GO: PAF/ESPA OVERLOAD',
      DELTAV_DEPLETION: 'NO-GO: INSUFFICIENT ΔV',
      POWER_FREEZE: 'NO-GO: POWER / THERMAL DEFICIT',
      TELECOM_TUMBLE: 'NO-GO: LINK / ADCS REDLINE',
    },
    anomalies: {
      FAIRING_COLLISION: {
        head: 'ASCENT ANOMALY: FAIRING WALL COLLISION',
        lesson: 'Lesson: solar wing clearance fell below 50 mm and sheared against the fairing. Select a larger rocket or reduce volume (U).',
      },
      MASS_BUCKLING: {
        head: 'ASCENT ANOMALY: PAF/ESPA ADAPTER BUCKLING (135% > 1.40× ULT)',
        lesson: 'Lesson: wet mass exceeds launcher T/W capacity, buckling the lower adapter truss at Max-Q. Upgrade to Falcon 9.',
      },
      DELTAV_DEPLETION: {
        head: 'CRUISE ANOMALY: COPV PROPELLANT DEPLETION (0%)',
        lesson: 'Lesson: propellant tanks ran dry before transfer insertion. Upgrade propulsion to Bipropellant or reduce dry mass.',
      },
      POWER_FREEZE: {
        head: 'ORBIT INSERTION ANOMALY: ECLIPSE CRYOGENIC BROWNOUT (-15°C)',
        lesson: 'Lesson: solar arrays cannot sustain eclipse heaters at this AU. Upgrade EPS (Mega-Flex / RTG) and active thermal control.',
      },
      TELECOM_TUMBLE: {
        head: 'ORBIT INSERTION ANOMALY: ADCS TUMBLE & CARRIER LOSS (-18 dB)',
        lesson: 'Lesson: pointing/link margin dropped below threshold. Upgrade Telecom to X/Ka-Band, ADCS star tracker, and DSN.',
      },
    },
    phases: {
      IDLE: 'READY ON PAD',
      COUNTDOWN: 'COUNTDOWN',
      LAUNCH_ASCENT: 'LAUNCH ASCENT · MAX-Q',
      FAILURE: 'MISSION ANOMALY DETECTED',
      CRUISE: 'CRUISE TO DESTINATION',
      ORBIT_INSERTION: 'ORBIT INSERTION',
    },
  },
  es: {
    launch: '▲ LANZAR',
    launchAnyway: 'LANZAR DE TODAS FORMAS',
    reset: '↺ REINICIAR',
    viewSplit: 'VISTA DUAL',
    viewMap: 'MAPA ORBITAL',
    viewAscent: 'COFIA Y TENSIÓN',
    viewCharts: 'GRÁFICOS',
    viewHeatmap: 'MAPA ESTRÉS',
    autoFix: '[FIX] AUTO-REPARAR FALLO Y RELANZAR',
    alt: 'Altitud',
    vel: 'Velocidad',
    dv: 'ΔV usado / requerido',
    mass: 'Masa Húmeda / Cohete',
    link: 'Enlace / Estado MCR',
    stress: 'Tensión Máx. Unión',
    light: 'Tiempo de luz',
    clock: 'Reloj de misión',
    orbitOk: 'ÓRBITA ALCANZADA ✓',
    nogo: {
      FAIRING_COLLISION: 'NO-GO: EXCEDE LA COFIA (<50 mm)',
      MASS_BUCKLING: 'NO-GO: SOBREPESO EN ADAPTADOR PAF',
      DELTAV_DEPLETION: 'NO-GO: ΔV INSUFICIENTE EN TANQUE COPV',
      POWER_FREEZE: 'NO-GO: DÉFICIT TÉRMICO / ENERGÍA',
      TELECOM_TUMBLE: 'NO-GO: PÉRDIDA DE ENLACE / ADCS',
    },
    anomalies: {
      FAIRING_COLLISION: {
        head: 'ANOMALÍA EN ASCENSO: IMPACTO CONTRA LA COFIA',
        lesson: 'Lección: la holgura estructural cayó bajo 50 mm cizallando el panel solar. Reduce volumen (U) o elige cohete Falcon 9.',
      },
      MASS_BUCKLING: {
        head: 'ANOMALÍA EN ASCENSO: PANDEO EN ADAPTADOR PAF/ESPA (135% > 1.40× ULT)',
        lesson: 'Lección: la masa húmeda supera al lanzador (T/W < 1) y colapsa la base en Max-Q. Cambia al cohete Falcon 9.',
      },
      DELTAV_DEPLETION: {
        head: 'ANOMALÍA EN CRUCERO: AGOTAMIENTO DE PROPELENTE COPV (0%)',
        lesson: 'Lección: el tanque se vació antes de completar la inserción. Usa propulsión Bipropelente o reduce masa seca.',
      },
      POWER_FREEZE: {
        head: 'ANOMALÍA EN INSERCIÓN: CONGELAMIENTO EN ECLIPSE (-15°C)',
        lesson: 'Lección: potencia insuficiente para calentadores en sombra. Mejora EPS (Mega-Flex o RTG) y control térmico activo.',
      },
      TELECOM_TUMBLE: {
        head: 'ANOMALÍA EN INSERCIÓN: GIRO ADCS Y PÉRDIDA DE SEÑAL (-18 dB)',
        lesson: 'Lección: el enlace cayó bajo el umbral de misión. Mejora Telecom a Banda X/Ka, ADCS Sagitta Star Tracker y red DSN.',
      },
    },
    phases: {
      IDLE: 'LISTO EN PLATAFORMA',
      COUNTDOWN: 'CUENTA REGRESIVA',
      LAUNCH_ASCENT: 'ASCENSO · MAX-Q',
      FAILURE: 'ANOMALÍA CRÍTICA DETECTADA',
      CRUISE: 'CRUCERO AL DESTINO',
      ORBIT_INSERTION: 'INSERCIÓN ORBITAL',
    },
  },
};

const DEBRIS = [
  { dx: -120, dy: -90, s: 10 },
  { dx: 110, dy: -100, s: 8 },
  { dx: -150, dy: 20, s: 12 },
  { dx: 140, dy: 40, s: 9 },
  { dx: -70, dy: 120, s: 7 },
  { dx: 80, dy: 130, s: 11 },
  { dx: -30, dy: -140, s: 8 },
  { dx: 40, dy: -150, s: 6 },
  { dx: -170, dy: -30, s: 7 },
  { dx: 170, dy: -20, s: 10 },
];

const makeStars = (n: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i * 379 + seed * 97) % 2000;
    const y = (i * 613 + seed * 53) % 2000;
    pts.push(`${x}px ${y}px #fff`, `${x}px ${y + 2000}px #fff`);
  }
  return pts.join(',');
};

const css = `
@keyframes starScroll { from { transform: translateY(0) } to { transform: translateY(-2000px) } }
@keyframes shake { 0%,100% { transform: translate(0,0) } 25% { transform: translate(-2px,1px) } 50% { transform: translate(2px,-1px) } 75% { transform: translate(-1px,-2px) } }
@keyframes shakeHard { 0%,100% { transform: translate(0,0) } 25% { transform: translate(-5px,3px) } 50% { transform: translate(5px,-3px) } 75% { transform: translate(-3px,-5px) } }
@keyframes flame { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.4) } }
@keyframes pop { from { transform: scale(1.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes slideIn { from { transform: translateX(-20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes flash { 0% { opacity: .8 } 100% { opacity: 0 } }
@keyframes failFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1 } 100% { transform: translateY(155px) rotate(22deg); opacity: .2 } }
@keyframes driftFail { 0% { transform: translate(0,0) rotate(0deg); opacity: 1 } 100% { transform: translate(26px,-18px) rotate(-14deg); opacity: .75 } }
@keyframes debris { 0% { transform: translate(0,0) rotate(0deg); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) rotate(360deg); opacity: 0 } }
@keyframes padSteamLeft {
  0% { transform: translate(0, 0) scale(0.65); opacity: 0.9; }
  50% { transform: translate(-40px, -18px) scale(1.6); opacity: 0.6; }
  100% { transform: translate(-85px, -35px) scale(2.3); opacity: 0; }
}
@keyframes padSteamRight {
  0% { transform: translate(0, 0) scale(0.65); opacity: 0.9; }
  50% { transform: translate(40px, -18px) scale(1.6); opacity: 0.6; }
  100% { transform: translate(85px, -35px) scale(2.3); opacity: 0; }
}
@keyframes machDiamonds {
  0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
  50% { transform: scaleY(1.22) scaleX(0.86); opacity: 0.75; }
}
@keyframes plumeTurbulence {
  0%, 100% { transform: scaleX(1) scaleY(1); }
  25% { transform: scaleX(1.12) scaleY(0.96) skewX(1.2deg); }
  50% { transform: scaleX(0.92) scaleY(1.1) skewX(-1.2deg); }
  75% { transform: scaleX(1.08) scaleY(1.02); }
}
@keyframes shockwavePulse {
  0% { transform: scale(0.92) translateY(0); opacity: 0.45; }
  50% { transform: scale(1.14) translateY(-3px); opacity: 0.9; }
  100% { transform: scale(1.28) translateY(-6px); opacity: 0; }
}
@keyframes sparkShower {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(62px) scale(0.25); opacity: 0; }
}
`;

const fmtLight = (s: number) => (s < 60 ? `${s.toFixed(1)} s` : `${(s / 60).toFixed(1)} min`);

function computeTelemetrySnapshot(
  effMs: number,
  ascentEnd: number,
  cruiseMs: number,
  destKm: number,
  failureMode: FailureMode,
  metrics?: PhysicsMetrics,
) {
  const totalMs = ascentEnd + cruiseMs;
  const ascent = Math.min(1, Math.max(0, (effMs - COUNTDOWN_MS) / ASCENT_MS));
  const eased = 1 - Math.pow(1 - ascent, 3);
  const cruise = Math.min(1, Math.max(0, (effMs - ascentEnd) / cruiseMs));
  const cruiseEased = cruise * cruise * (3 - 2 * cruise);

  const altKm = 400 * eased + Math.max(0, destKm - 400) * cruiseEased;
  const velKmS = 7.67 * eased;

  // Poly Bridge structural load bell curve peaking at Max-Q (ascent = 0.55)
  const loadRatio = metrics ? metrics.wetMass_kg / Math.max(1, metrics.launchCapacity_kg) : 0.62;
  const maxQBell = Math.exp(-Math.pow((ascent - 0.55) / 0.24, 2));
  let stressPct = 18;
  if (effMs > 0 && effMs < COUNTDOWN_MS) {
    stressPct = 18 + (effMs / COUNTDOWN_MS) * 14;
  } else if (effMs >= COUNTDOWN_MS && effMs < ascentEnd) {
    const nominalPeak = Math.min(92, 34 + loadRatio * 48);
    if (failureMode === 'FAIRING_COLLISION') {
      stressPct = 28 + maxQBell * 96;
    } else if (failureMode === 'MASS_BUCKLING') {
      stressPct = 35 + maxQBell * Math.max(102, loadRatio * 90);
    } else {
      stressPct = 24 + maxQBell * nominalPeak;
    }
  } else if (effMs >= ascentEnd) {
    const insertBump = Math.exp(-Math.pow((cruise - 0.92) / 0.14, 2)) * 28;
    stressPct = 18 + insertBump;
  }

  // COPV Fuel Remaining (%)
  const reqDv = Math.max(1, metrics?.deltaV_required_ms ?? 150);
  const availDv = Math.max(1, metrics?.deltaV_available_ms ?? reqDv * 1.25);
  let fuelPct = 100;
  if (failureMode === 'DELTAV_DEPLETION') {
    const burnFrac = Math.min(1, cruise / FAIL_POINT);
    fuelPct = Math.max(0, 100 * (1 - burnFrac));
  } else {
    const usedRatio = Math.min(0.95, reqDv / Math.max(reqDv, availDv));
    fuelPct = Math.max(5, 100 - usedRatio * 100 * cruiseEased);
  }

  // Power balance (W)
  const generatedW = metrics?.power.generatedAtDestination_W ?? 180;
  const eclipseReqW = metrics?.power.eclipseRequired_W ?? 60;
  let powerW = Math.max(20, generatedW - eclipseReqW * 0.45);
  if (failureMode === 'POWER_FREEZE' && cruise > 0.72) {
    const dropFrac = Math.min(1, (cruise - 0.72) / 0.28);
    powerW = Math.max(0, powerW * (1 - dropFrac));
  }

  return {
    tRatio: Math.min(1, Math.max(0, effMs / Math.max(1, totalMs))),
    altKm,
    velKmS,
    stressPct,
    fuelPct,
    powerW,
    ascent,
    eased,
    cruise,
    cruiseEased,
  };
}

export default function MissionStage({
  destination,
  volume,
  metrics,
  lang = 'en',
  controls,
  embedded = false,
  onQuickFix,
}: Props) {
  const t = T[lang];
  const fairingOverflow = !volume.isCompliant;
  const massOverload = Boolean(metrics && metrics.wetMass_kg > metrics.launchCapacity_kg);
  const deltaVShortfall = Boolean(metrics && metrics.deltaV_available_ms < metrics.deltaV_required_ms);
  const powerFailure = Boolean(metrics && metrics.power.status === 'RED');
  const telecomFailure = Boolean(metrics && metrics.telecom.status === 'RED');

  const failureMode: FailureMode = fairingOverflow
    ? 'FAIRING_COLLISION'
    : massOverload
      ? 'MASS_BUCKLING'
      : deltaVShortfall
        ? 'DELTAV_DEPLETION'
        : powerFailure
          ? 'POWER_FREEZE'
          : telecomFailure
            ? 'TELECOM_TUMBLE'
            : 'NONE';

  const failed = failureMode !== 'NONE';
  const {
    simIsPlaying,
    simSpeed,
    phaseTutorialStep,
    setSimPlaying,
    toggleSimPlaying,
    setSimSpeed,
    setPhaseTutorialStep,
    soundEnabled,
  } = useMissionStore();

  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [embeddedView, setEmbeddedView] = useState<EmbeddedView>('SPLIT');
  const speedRef = useRef<number>(simSpeed);

  useEffect(() => {
    speedRef.current = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    if (!simIsPlaying) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(65, Math.max(0, now - last));
      last = now;
      setElapsedMs((prev) => prev + dt * speedRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [simIsPlaying]);

  const layers = useMemo(
    () => [
      { shadow: makeStars(90, 1), size: 1, dur: 160, op: 0.5 },
      { shadow: makeStars(60, 2), size: 2, dur: 100, op: 0.7 },
      { shadow: makeStars(30, 3), size: 3, dur: 60, op: 0.9 },
    ],
    [],
  );

  const lightSec = destination?.oneWayLightTimeSec ?? 0;
  const cruiseMs = 4000 + 1500 * Math.log10(1 + lightSec);
  const ascentEnd = COUNTDOWN_MS + ASCENT_MS;
  const totalNominalMs = ascentEnd + cruiseMs;

  const failAt =
    failureMode === 'FAIRING_COLLISION' || failureMode === 'MASS_BUCKLING'
      ? COUNTDOWN_MS + ASCENT_MS * FAIL_POINT
      : failureMode === 'DELTAV_DEPLETION'
        ? ascentEnd + cruiseMs * FAIL_POINT
        : totalNominalMs;

  const stage: Stage = elapsedMs === 0 && !simIsPlaying
    ? 'IDLE'
    : elapsedMs < COUNTDOWN_MS
      ? 'COUNTDOWN'
      : failed && elapsedMs >= failAt
        ? 'FAILURE'
        : elapsedMs < ascentEnd
          ? 'LAUNCH_ASCENT'
          : elapsedMs < totalNominalMs
            ? 'CRUISE'
            : 'ORBIT_INSERTION';

  const eff = failed ? Math.min(elapsedMs, failAt) : elapsedMs;
  const destKm = destination?.distanceFromEarthKm ?? 400;

  const snap = computeTelemetrySnapshot(eff, ascentEnd, cruiseMs, destKm, failureMode, metrics);

  const playedSoundsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (elapsedMs === 0) {
      playedSoundsRef.current.clear();
      return;
    }
    if (!soundEnabled) return;

    // T-0 Ignition deep bass rumble
    if (eff >= COUNTDOWN_MS && !playedSoundsRef.current.has('IGNITION')) {
      playedSoundsRef.current.add('IGNITION');
      playHoloTone('IGNITION', true);
    }

    // Max-Q Transonic sonic boom shock thump
    if (snap.ascent >= 0.50 && snap.ascent <= 0.62 && !playedSoundsRef.current.has('SONIC_BOOM')) {
      playedSoundsRef.current.add('SONIC_BOOM');
      playHoloTone('SONIC_BOOM', true);
    }

    // High structural stress creak
    if (snap.stressPct >= 85 && !playedSoundsRef.current.has('STRESS_CREAK')) {
      playedSoundsRef.current.add('STRESS_CREAK');
      playHoloTone('STRESS_CREAK', true);
    }
  }, [eff, snap.ascent, snap.stressPct, soundEnabled, elapsedMs]);

  const samples: TelemetrySample[] = useMemo(() => {
    const out: TelemetrySample[] = [];
    const N = 36;
    for (let i = 0; i <= N; i++) {
      const ms = (i / N) * totalNominalMs;
      const point = computeTelemetrySnapshot(ms, ascentEnd, cruiseMs, destKm, failureMode, metrics);
      out.push({
        tRatio: i / N,
        altKm: point.altKm,
        velKmS: point.velKmS,
        stressPct: point.stressPct,
        fuelPct: point.fuelPct,
        powerW: point.powerW,
      });
    }
    return out;
  }, [totalNominalMs, ascentEnd, cruiseMs, destKm, failureMode, metrics]);

  const count = Math.max(1, Math.ceil((COUNTDOWN_MS - elapsedMs) / 1000));
  const targetDeltaV = metrics?.deltaV_required_ms ?? destination?.requiredDeltaV_ms ?? 0;
  const dvUsed = Math.round(
    (failureMode === 'DELTAV_DEPLETION'
      ? metrics?.deltaV_available_ms ?? targetDeltaV * 0.55
      : targetDeltaV) * snap.cruiseEased,
  );
  const dim = stage === 'COUNTDOWN' || stage === 'LAUNCH_ASCENT' || stage === 'FAILURE';

  const clock =
    stage === 'IDLE'
      ? '—'
      : stage === 'COUNTDOWN'
        ? `T-${count}`
        : `T+${(Math.max(0, eff - COUNTDOWN_MS) / 1000).toFixed(1)} s`;

  const nogoMessage =
    failureMode === 'NONE'
      ? ''
      : failureMode === 'FAIRING_COLLISION'
        ? `${t.nogo.FAIRING_COLLISION} (${volume.used_U.toFixed(1)}U / ${volume.maxFairing_U}U)`
        : failureMode === 'MASS_BUCKLING'
          ? `${t.nogo.MASS_BUCKLING} (${metrics?.wetMass_kg} / ${metrics?.launchCapacity_kg} kg)`
          : failureMode === 'DELTAV_DEPLETION'
            ? `${t.nogo.DELTAV_DEPLETION} (${metrics?.deltaV_available_ms} / ${metrics?.deltaV_required_ms} m/s)`
            : t.nogo[failureMode];

  const cards: [string, string][] = [
    [t.alt, `${Math.round(snap.altKm).toLocaleString()} km`],
    [t.vel, `${snap.velKmS.toFixed(2)} km/s`],
    [t.stress, `${Math.round(snap.stressPct)}%`],
    [t.dv, destination ? `${dvUsed.toLocaleString()} / ${targetDeltaV.toLocaleString()} m/s` : '—'],
    ...(metrics
      ? ([
          [t.mass, `${metrics.wetMass_kg.toLocaleString()} / ${metrics.launchCapacity_kg.toLocaleString()} kg`],
          [t.link, `${metrics.telecom.linkMargin_dB} dB (${metrics.overallMCRStatus})`],
        ] as [string, string][])
      : []),
    [t.light, destination ? fmtLight(destination.oneWayLightTimeSec) : '—'],
    [t.clock, clock],
  ];

  const toggle = () => {
    playHoloTone('STEP', soundEnabled);
    if (phaseTutorialStep <= 0) setPhaseTutorialStep(1);
    toggleSimPlaying();
  };

  const handleRewind = () => {
    playHoloTone('STEP', soundEnabled);
    setElapsedMs(0);
    setSimPlaying(true);
  };

  const handleAutoFix = () => {
    if (!onQuickFix) return;
    const modeToFix = failureMode !== 'NONE' ? failureMode : 'FAIRING_COLLISION';
    onQuickFix(modeToFix);
    setElapsedMs(0);
    setSimPlaying(true);
    setSimSpeed(1);
  };

  const titleColor =
    stage === 'ORBIT_INSERTION' ? '#5FF3FF' : stage === 'FAILURE' ? '#FF4D6D' : '#e2e8f0';

  const isMaxQZone = stage === 'LAUNCH_ASCENT' && snap.ascent >= 0.42 && snap.ascent <= 0.68;

  const shipAnimation =
    stage === 'LAUNCH_ASCENT'
      ? failureMode === 'FAIRING_COLLISION' || failureMode === 'MASS_BUCKLING'
        ? 'shakeHard .06s infinite'
        : isMaxQZone
          ? 'shakeHard .075s infinite'
          : 'shake .12s infinite'
      : stage === 'FAILURE'
        ? failureMode === 'FAIRING_COLLISION' || failureMode === 'MASS_BUCKLING'
          ? 'failFall 2.5s ease-in forwards'
          : failureMode === 'DELTAV_DEPLETION'
            ? 'driftFail 3.2s ease-out forwards'
            : 'none'
        : 'none';

  const showChartsOnly = embedded && embeddedView === 'CHARTS';
  const showHeatmapOnly = embedded && embeddedView === 'HEATMAP';
  const showMap = !showChartsOnly && !showHeatmapOnly && (!embedded || embeddedView !== 'BLUEPRINT');
  const showBlueprint = !showChartsOnly && !showHeatmapOnly && (!embedded || embeddedView !== 'MAP');
  const showDebris =
    stage === 'FAILURE' && (failureMode === 'FAIRING_COLLISION' || failureMode === 'MASS_BUCKLING');

  return (
    <div
      style={{
        position: 'relative',
        minHeight: embedded ? 'auto' : '100vh',
        overflow: 'visible',
        background: embedded
          ? 'radial-gradient(ellipse at 50% 45%, rgba(95,243,255,0.08) 0%, #04080F 72%)'
          : 'radial-gradient(ellipse at 50% 0%, #0b1a3a 0%, #020617 70%)',
        color: '#fff',
      }}
    >
      <style>{css}</style>

      {layers.map((l, k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: l.size,
            height: l.size,
            borderRadius: '50%',
            boxShadow: l.shadow,
            opacity: embedded ? l.op * 0.65 : l.op,
            animation: `starScroll ${l.dur}s linear infinite`,
          }}
        />
      ))}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: embedded ? 'auto' : '100vh',
          padding: embedded ? 12 : 16,
          gap: embedded ? 10 : 14,
        }}
      >
        {/* Barra superior */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            {!embedded && (
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#64748b' }}>ORBITAL FORGE</div>
            )}
            <div
              className={embedded ? 'font-mono tracking-[0.12em] uppercase' : undefined}
              style={{ fontSize: embedded ? 14 : 21, fontWeight: 700, color: titleColor }}
            >
              {t.phases[stage]}
            </div>
            {stage === 'ORBIT_INSERTION' && (
              <div className={embedded ? 'font-mono text-[11px]' : undefined} style={{ fontSize: embedded ? 11 : 12, color: '#5FF3FF' }}>
                {t.orbitOk}
              </div>
            )}
            {stage === 'IDLE' && failed && (
              <div style={{ fontSize: embedded ? 11 : 13, fontWeight: 700, color: '#FF4D6D' }}>
                {nogoMessage}
              </div>
            )}
            {(stage === 'FAILURE' || (stage === 'IDLE' && failed)) && onQuickFix && (
              <button
                type="button"
                onClick={handleAutoFix}
                className="mt-1 flex items-center gap-1.5 border-2 border-[#10B981] bg-[#10B981]/25 px-3 py-1 font-mono text-[10.5px] font-bold text-[#10B981] uppercase hover:bg-[#10B981]/35 shadow-[0_0_16px_rgba(16,185,129,0.35)] rounded transition cursor-pointer"
                title={lang === 'es' ? 'Auto-corregir subsistemas en fallo y relanzar' : 'Auto-fix failing subsystems and relaunch'}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.autoFix}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            {controls}

            {/* Poly Bridge Time Control Transport Bar */}
            <div className="flex items-center gap-1 border border-[#5FF3FF]/30 bg-[#04080F]/90 p-1 font-mono text-[9.5px] rounded">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={toggle}
                className={`flex items-center gap-1 px-2.5 py-1 font-bold rounded transition cursor-pointer ${
                  simIsPlaying
                    ? 'border border-[#5FF3FF]/50 bg-[#5FF3FF]/20 text-[#5FF3FF] shadow-[0_0_12px_rgba(95,243,255,0.25)]'
                    : 'border border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] animate-pulse'
                }`}
                title={simIsPlaying ? 'Pausar simulación física' : 'Reanudar simulación física'}
              >
                {simIsPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{simIsPlaying ? (lang === 'es' ? 'PAUSA' : 'PAUSE') : (lang === 'es' ? 'PLAY' : 'PLAY')}</span>
              </button>

              {/* Rewind to T-00 */}
              <button
                type="button"
                onClick={handleRewind}
                className="flex items-center gap-1 border border-slate-700 bg-slate-900/60 px-2 py-1 text-slate-300 hover:text-white hover:border-slate-500 rounded transition cursor-pointer"
                title={lang === 'es' ? 'Reiniciar simulación desde T-0' : 'Restart simulation from T-0'}
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">{lang === 'es' ? 'REINICIAR' : 'RESTART'}</span>
              </button>

              {/* Poly Bridge Speed Selector (0.5x, 1x, 2x, 4x Warp) */}
              <div className="flex items-center border-l border-slate-700 pl-1 ml-0.5 gap-0.5">
                {([0.5, 1, 2, 4] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      playHoloTone('STEP', soundEnabled);
                      setSimSpeed(spd);
                    }}
                    className={`px-1.5 py-1 rounded transition cursor-pointer ${
                      simSpeed === spd
                        ? 'border border-[#FFC15E] bg-[#FFC15E]/20 text-[#FFC15E] font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd === 0.5 ? '0.5×' : spd === 4 ? '4× WARP' : `${spd}×`}
                  </button>
                ))}
              </div>
            </div>

            {embedded && (
              <div className="flex border border-[#5FF3FF]/25 bg-[#04080F]/90 p-0.5 font-mono text-[9.5px]">
                {(
                  [
                    ['SPLIT', t.viewSplit],
                    ['MAP', t.viewMap],
                    ['BLUEPRINT', t.viewAscent],
                    ['CHARTS', t.viewCharts],
                    ['HEATMAP', t.viewHeatmap],
                  ] as const
                ).map(([viewKey, label]) => (
                  <button
                    key={viewKey}
                    type="button"
                    onClick={() => setEmbeddedView(viewKey)}
                    className={`px-2 py-1 transition ${
                      embeddedView === viewKey
                        ? 'bg-[#5FF3FF]/15 text-[#5FF3FF]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Poly Bridge Multi-Phase Staging & Mechanical Deployment Timeline */}
        <DeploymentTimelineStepper
          tRatio={snap.tRatio}
          isFailed={stage === 'FAILURE'}
          failRatio={failAt / Math.max(1, totalNominalMs)}
          lang={lang}
        />

        {/* Poly Bridge Real-Time Mission Progress Scrubber */}
        <div className="flex items-center gap-3 border border-[#5FF3FF]/20 bg-[#04080F]/80 px-3 py-1.5 rounded font-mono text-[10px]">
          <span className="text-[#5FF3FF] font-bold shrink-0">{clock}</span>
          <div className="relative flex-1 h-2 bg-[#02050B] rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-100 ${
                stage === 'FAILURE'
                  ? 'bg-gradient-to-r from-[#FF4D6D] to-red-600'
                  : stage === 'ORBIT_INSERTION'
                    ? 'bg-gradient-to-r from-[#5FF3FF] to-[#10B981]'
                    : 'bg-gradient-to-r from-[#5FF3FF]/60 to-[#5FF3FF]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, snap.tRatio * 100))}%` }}
            />
          </div>
          <span className="text-slate-400 text-[9px] shrink-0">
            {Math.round(snap.tRatio * 100)}%
          </span>
        </div>

        {/* Vista principal: mapa + nave con mapa de tensiones OR graficos expandidos OR mapa de calor */}
        {showChartsOnly ? (
          <div className="flex flex-1 flex-col justify-center">
            <TelemetryStripCharts
              samples={samples}
              currentRatio={snap.tRatio}
              destKm={destKm}
              failureMode={failureMode}
              failed={failed}
              failRatio={failAt / Math.max(1, totalNominalMs)}
              lang={lang}
              expanded
            />
          </div>
        ) : showHeatmapOnly ? (
          <div className="flex flex-1 flex-col justify-center max-w-xl mx-auto w-full">
            <SubsystemStressHeatmap
              metrics={metrics}
              volume={volume}
              failureMode={failureMode}
              tRatio={snap.tRatio}
              failedActive={stage === 'FAILURE'}
              lang={lang}
            />
          </div>
        ) : (
          <div
            className={
              embedded
                ? `grid flex-1 items-center gap-3 ${
                    embeddedView === 'SPLIT' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
                  }`
                : undefined
            }
            style={
              embedded
                ? undefined
                : {
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 32,
                  }
            }
          >
            {showMap && (
              <div
                className={embedded ? 'mx-auto w-full max-w-[440px]' : undefined}
                style={{
                  width: embedded ? '100%' : 'min(92vw, 560px)',
                  borderRadius: embedded ? 6 : 12,
                  transition: 'opacity 1s, filter 1s, box-shadow 1s',
                  opacity: dim ? 0.3 : 1,
                  filter: dim ? 'blur(1px)' : 'none',
                  boxShadow: stage === 'ORBIT_INSERTION' ? '0 0 36px rgba(95,243,255,0.28)' : 'none',
                }}
              >
                <OrbitalMapVisualizer
                  destination={destination}
                  lang={lang}
                  className="max-w-none"
                  progress={
                    stage === 'CRUISE' ||
                    (stage === 'FAILURE' &&
                      (failureMode === 'DELTAV_DEPLETION' ||
                        failureMode === 'POWER_FREEZE' ||
                        failureMode === 'TELECOM_TUMBLE'))
                      ? snap.cruiseEased
                      : stage === 'ORBIT_INSERTION'
                        ? 1
                        : null
                  }
                />
              </div>
            )}

            {showBlueprint && (
              <div
                className={embedded ? 'mx-auto w-full max-w-[300px]' : undefined}
                style={{
                  position: 'relative',
                  width: embedded ? '100%' : 'min(92vw, 420px)',
                  transform: `translateY(${-snap.ascent * (embedded ? 14 : 26)}px)`,
                }}
              >
                <div style={{ animation: shipAnimation }}>
                  <SpacecraftBlueprint
                    volume={volume}
                    lang={lang}
                    className="max-w-none"
                    stressPct={snap.stressPct}
                    failureMode={failureMode}
                    failedActive={stage === 'FAILURE'}
                    fuelRemainingPct={snap.fuelPct}
                    tRatio={snap.tRatio}
                  />
                </div>

                {!embedded && stage !== 'IDLE' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12%',
                      left: '100%',
                      marginLeft: 12,
                      width: 170,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      animation: 'slideIn .6s ease-out',
                    }}
                  >
                    {cards.map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          background: 'rgba(30,41,59,0.8)',
                          borderLeft: `3px solid ${stage === 'FAILURE' ? '#ef4444' : '#38bdf8'}`,
                          borderRadius: 8,
                          padding: '6px 10px',
                        }}
                      >
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Velo de condensación y onda de choque transónica Max-Q (Prandtl-Glauert) */}
                {stage === 'LAUNCH_ASCENT' && snap.ascent >= 0.38 && snap.ascent <= 0.72 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 240,
                      height: 120,
                      pointerEvents: 'none',
                      zIndex: 3,
                      animation: 'shockwavePulse 0.12s ease-in-out infinite',
                      opacity: Math.max(0, Math.min(1, Math.exp(-Math.pow((snap.ascent - 0.55) / 0.14, 2)))),
                    }}
                  >
                    <svg viewBox="0 0 240 120" width="100%" height="100%">
                      <defs>
                        <radialGradient id="shockConeGrad" cx="50%" cy="30%" r="50%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                          <stop offset="35%" stopColor="#5FF3FF" stopOpacity="0.6" />
                          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <path
                        d="M120 10 L30 105 Q120 120 210 105 Z"
                        fill="url(#shockConeGrad)"
                        filter="blur(1.5px)"
                      />
                      <path
                        d="M120 16 L44 98 M120 16 L196 98"
                        stroke="#5FF3FF"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        opacity={0.8}
                      />
                    </svg>
                  </div>
                )}

                {/* Pluma de Escape Multi-capa y Diamantes Mach */}
                {stage === 'LAUNCH_ASCENT' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '91%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  >
                    {/* Pluma exterior turbulenta de queroseno */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: 32,
                        height: 98,
                        borderRadius: '0 0 50% 50%',
                        background:
                          'radial-gradient(ellipse at 50% 20%, #fef08a 0%, #f97316 45%, #ef4444 80%, transparent 100%)',
                        transformOrigin: 'top center',
                        animation: 'plumeTurbulence 0.14s ease-in-out infinite alternate',
                        filter: 'blur(2px)',
                        boxShadow: '0 0 24px rgba(249, 115, 22, 0.7)',
                      }}
                    />

                    {/* Núcleo hipersónico con Diamantes Mach */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: 14,
                        height: 72,
                        borderRadius: '0 0 45% 45%',
                        background:
                          'linear-gradient(180deg, #ffffff 0%, #67e8f9 35%, #0284c7 75%, transparent 100%)',
                        transformOrigin: 'top center',
                        animation: 'machDiamonds 0.09s ease-in-out infinite alternate',
                        filter: 'blur(0.8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        padding: '6px 0',
                      }}
                    >
                      {/* Diamantes de choque Mach */}
                      {[0, 1, 2].map((idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 6 - idx * 1.2,
                            height: 6 - idx * 1.2,
                            background: '#ffffff',
                            transform: 'rotate(45deg)',
                            boxShadow: '0 0 8px #5FF3FF',
                            opacity: 0.9 - idx * 0.15,
                          }}
                        />
                      ))}
                    </div>

                    {/* Lluvia de Chispas y Brasas Poly Bridge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 40,
                        width: 30,
                        height: 60,
                        pointerEvents: 'none',
                      }}
                    >
                      {[
                        { left: 6, delay: '0s', dur: '0.35s', bg: '#fbbf24', size: 3 },
                        { left: 14, delay: '0.12s', dur: '0.4s', bg: '#f97316', size: 2.5 },
                        { left: 22, delay: '0.07s', dur: '0.32s', bg: '#ef4444', size: 3 },
                        { left: 10, delay: '0.18s', dur: '0.38s', bg: '#fde047', size: 2 },
                        { left: 18, delay: '0.24s', dur: '0.42s', bg: '#fb923c', size: 2.8 },
                      ].map((sp, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: sp.left,
                            top: 0,
                            width: sp.size,
                            height: sp.size,
                            borderRadius: '50%',
                            background: sp.bg,
                            boxShadow: `0 0 6px ${sp.bg}`,
                            animation: `sparkShower ${sp.dur} linear infinite`,
                            animationDelay: sp.delay,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Humo y Vapor de Diluvio de Agua en Plataforma (T-0 a T+2.5s) */}
                {stage === 'LAUNCH_ASCENT' && snap.ascent <= 0.40 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '90%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 260,
                      height: 80,
                      pointerEvents: 'none',
                      zIndex: 1,
                      opacity: 1 - snap.ascent / 0.40,
                    }}
                  >
                    {/* Nube de vapor izquierda */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '18%',
                        top: '10%',
                        width: 80,
                        height: 50,
                        borderRadius: '50%',
                        background:
                          'radial-gradient(circle, rgba(226, 232, 240, 0.85) 0%, rgba(148, 163, 184, 0.4) 60%, transparent 80%)',
                        filter: 'blur(8px)',
                        animation: 'padSteamLeft 0.8s ease-out infinite',
                      }}
                    />
                    {/* Nube de vapor derecha */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '18%',
                        top: '10%',
                        width: 80,
                        height: 50,
                        borderRadius: '50%',
                        background:
                          'radial-gradient(circle, rgba(226, 232, 240, 0.85) 0%, rgba(148, 163, 184, 0.4) 60%, transparent 80%)',
                        filter: 'blur(8px)',
                        animation: 'padSteamRight 0.8s ease-out infinite',
                      }}
                    />
                  </div>
                )}

                {showDebris &&
                  DEBRIS.map((d, i) => (
                    <div
                      key={i}
                      style={
                        {
                          position: 'absolute',
                          top: '45%',
                          left: '50%',
                          width: d.s,
                          height: d.s,
                          background: i % 2 ? '#f97316' : '#ef4444',
                          '--dx': `${d.dx}px`,
                          '--dy': `${d.dy}px`,
                          animation: 'debris 1.6s ease-out forwards',
                        } as CSSProperties
                      }
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 3 Gráficos Vivos de Telemetría (modo dual y completo) */}
        {(embeddedView === 'SPLIT' || !embedded) && (
          <TelemetryStripCharts
            samples={samples}
            currentRatio={snap.tRatio}
            destKm={destKm}
            failureMode={failureMode}
            failed={failed}
            failRatio={failAt / Math.max(1, totalNominalMs)}
            lang={lang}
          />
        )}

        {/* Barra inferior de tarjetas numéricas */}
        {embedded && stage !== 'IDLE' && (
          <div className="grid grid-cols-2 gap-1.5 border-t border-[#5FF3FF]/20 pt-2 sm:grid-cols-4">
            {cards.map(([label, value]) => (
              <div
                key={label}
                className={`border px-2.5 py-1.5 ${
                  stage === 'FAILURE'
                    ? 'border-[#FF4D6D]/50 bg-[#04080F]/90'
                    : 'border-[#5FF3FF]/25 bg-[#04080F]/90'
                }`}
              >
                <div className="font-mono text-[8.5px] tracking-wider text-slate-400 uppercase">
                  {label}
                </div>
                <div className="font-mono text-[11px] font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destello rojo solo para fractura física en ascenso */}
      {showDebris && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            background: '#ef4444',
            pointerEvents: 'none',
            animation: 'flash 1.2s ease-out forwards',
          }}
        />
      )}

      {/* Poly Bridge Black Box Slow-Mo Failure Autopsy Modal */}
      {stage === 'FAILURE' && failureMode !== 'NONE' && (
        <BlackBoxFailureAutopsyModal
          failureMode={failureMode}
          metrics={metrics}
          volume={volume}
          missionClock={clock}
          stressPct={snap.stressPct}
          altKm={snap.altKm}
          velKmS={snap.velKmS}
          fuelPct={snap.fuelPct}
          lang={lang}
          onQuickFix={onQuickFix ? handleAutoFix : undefined}
          onRewindSlowMo={() => {
            setElapsedMs(Math.max(0, failAt - 2500));
            setSimSpeed(0.5);
            setSimPlaying(true);
          }}
        />
      )}

      {/* Cuenta regresiva */}
      {stage === 'COUNTDOWN' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            key={count}
            style={{
              fontSize: embedded ? 'min(22vw, 150px)' : 'min(40vw, 260px)',
              fontWeight: 800,
              color: '#f8fafc',
              textShadow: '0 0 40px #5FF3FF',
              animation: 'pop .9s ease-out',
            }}
          >
            {count}
          </div>
        </div>
      )}
    </div>
  );
}
