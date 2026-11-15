import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';
import { project3D, projectRing3D, toSvgPoly, type Point3D } from './holo3d';

type CadViewMode = 'ISO' | 'FRONT' | 'SIDE' | 'TOP';
type InspectionPinId = 'pin-1' | 'pin-2' | 'pin-3' | 'pin-4';

const MINI_ARCHS = [
  { key: 'obj-earth-bionutrients', label: { en: 'A · CDS 3U', es: 'A · CDS 3U' }, shape: 'CUBESAT' as const },
  { key: 'obj-sso-tracers', label: { en: 'B · TRACERS Ø1.32m', es: 'B · TRACERS Ø1.32m' }, shape: 'OCTAGON' as const },
  { key: 'obj-l2-jwst-fgs', label: { en: 'C · JWST Ø6.5m', es: 'C · JWST Ø6.5m' }, shape: 'JWST' as const },
  { key: 'obj-jupiter-clipper', label: { en: 'D · Deep RTG', es: 'D · RTG 5.2AU' }, shape: 'RTG' as const },
];

interface CadPinMeta {
  id: InspectionPinId;
  shortLabel: { en: string; es: string };
  standard: string;
  title: { en: string; es: string };
  jplDetail: { en: string; es: string };
  cadetDetail: { en: string; es: string };
  pos3D: Point3D;
  ok: (ctx: { massOk: boolean; powerOk: boolean; rfOk: boolean }) => boolean;
}

const CAD_PINS: CadPinMeta[] = [
  {
    id: 'pin-1',
    shortLabel: { en: 'PIN 1 · COPV', es: 'PIN 1 · COPV' },
    standard: 'NASA-STD-5001B Sec. 4.2.1/4.2.5',
    title: {
      en: 'Propellant Pressure Vessel (COPV / Ti Tank)',
      es: 'Recipiente a Presión COPV / Tanque de Titanio',
    },
    jplDetail: {
      en: 'Ultimate FoS >= 1.40x MDP; mandatory proof pressure test 1.05x–1.20x MDP without plastic deformation; bimetallic weld & CFRP liner inspection.',
      es: 'Factor último >= 1.40x MDP; prueba de presión obligatoria 1.05x–1.20x MDP sin deformación plástica; inspección de soldadura bimetálica y liner CFRP.',
    },
    cadetDetail: {
      en: 'Propellant tanks are proof-tested up to 1.20x max pressure and built 1.40x stronger so fuel never leaks under rocket shake.',
      es: 'Los tanques se prueban al 120% de su presión máxima y resisten 1.40x para no sufrir fisuras ni fugas en el despegue.',
    },
    pos3D: { x: 0, y: 48, z: 0 },
    ok: ({ massOk }) => massOk,
  },
  {
    id: 'pin-2',
    shortLabel: { en: 'PIN 2 · FASTENERS', es: 'PIN 2 · PERNOS' },
    standard: 'NASA-STD-5001B Tables 2/3',
    title: {
      en: 'Structural Separation Interface & Bonded Inserts',
      es: 'Interfaz de Separación e Insertos Roscados',
    },
    jplDetail: {
      en: 'Al 6061-T6 / 7075-T73 protoflight FoS 1.40x Ultimate / 1.25x Yield; FS 2.00x at discontinuities and honeycomb bonded inserts.',
      es: 'Aluminio 6061-T6 / 7075-T73 con FS 1.40x Último / 1.25x Fluencia; FS 2.00x en discontinuidades e insertos pegados en panel honeycomb.',
    },
    cadetDetail: {
      en: 'Frame bolts and aluminum rails survive 1.40x peak launch forces, with 2.00x reinforcement around honeycomb joints.',
      es: 'Los pernos de separación y rieles de aluminio soportan 1.40x la fuerza máxima y doble refuerzo (2.00x) en las esquinas.',
    },
    pos3D: { x: -34, y: 18, z: 34 },
    ok: ({ massOk }) => massOk,
  },
  {
    id: 'pin-3',
    shortLabel: { en: 'PIN 3 · MICRO-D', es: 'PIN 3 · CONECTOR' },
    standard: 'GSFC-STD-1000 Rule 2.13',
    title: {
      en: 'Main Avionics Harness & Micro-D Bulkhead Connector',
      es: 'Arnés Principal de Aviónica y Conector Micro-D',
    },
    jplDetail: {
      en: '>=30% spare connector pins at PDR, unique keying against cross-mating, zero blind-mating in I&T, and >=50 mm torque-tool clearance.',
      es: '>=30% pines de repuesto en PDR, chavetero único anti-cruce, cero blind-mating en I&T y >=50 mm libres para llave dinamométrica.',
    },
    cadetDetail: {
      en: 'Harness plugs leave >=30% spare pins, use unique USB-like keys so cables never mix up, and keep 50 mm hand clearance.',
      es: 'Los conectores dejan >=30% clavijas extra libres, tienen formas únicas imposibles de invertir y 50 mm libres para ensamblar.',
    },
    pos3D: { x: 34, y: -4, z: 16 },
    ok: ({ powerOk }) => powerOk,
  },
  {
    id: 'pin-4',
    shortLabel: { en: 'PIN 4 · ADCS SPF', es: 'PIN 4 · ADCS SPF' },
    standard: 'GSFC-STD-1000 Rules 1.05 & 1.17',
    title: {
      en: 'Attitude Sensors & Redundant Safe-Hold Bus',
      es: 'Bahía ADCS y Redundancia Sin Fallo Único (SPF)',
    },
    jplDetail: {
      en: 'Cross-strapped IMU / Star Tracker power & data paths eliminating Single Point Failures (SPF) and guaranteeing Safe Hold Mode.',
      es: 'Rutas independientes de alimentación y datos en IMU / Star Tracker eliminando Fallas de Punto Único (SPF) hacia Safe Hold Mode.',
    },
    cadetDetail: {
      en: 'Critical star cameras and gyro wires run in twin independent paths so one broken wire can never blind the spacecraft.',
      es: 'Las cámaras estelares y giróscopos usan cables gemelos independientes para que un solo fallo nunca deje ciega a la nave.',
    },
    pos3D: { x: 0, y: -56, z: 8 },
    ok: ({ rfOk }) => rfOk,
  },
];

function getPlatformCotaLabel(
  objectiveId: string,
  destinationId: string,
  formFactor: string,
): string {
  if (objectiveId === 'obj-l2-jwst-fgs' || destinationId === 'dest-l2') {
    return 'JWST / FGS · SUNSHIELD 21.2×14.2 m · OTE Ø6.5 m (25.4 m²)';
  }
  if (objectiveId === 'obj-sso-tracers') {
    return 'TRACERS T1/T2 · OCTAGONAL Ø1.32×0.95 m (<200 kg) · EFI + MAG BOOM';
  }
  if (objectiveId === 'obj-mars-reconnaissance') {
    return 'MRO CLASS · BUS 3.0×2.1×2.1 m · SPAN 13.6 m · HGA Ø3.0 m · SHARAD 10 m';
  }
  if (objectiveId === 'obj-helio-lunar-trailblazer') {
    return 'LUNAR TRAILBLAZER · BOX BUS 1.0×1.0×1.2 m · ARRAY SPAN 3.5 m';
  }
  if (formFactor === '1.5U') {
    return 'CDS 1.5U · 100.0×100.0×170.2 mm (±0.1) · STANDOFF ≥6.5 mm · TUNA CAN Ø64×36 mm';
  }
  if (formFactor === '2U') {
    return 'CDS 2U · 100.0×100.0×227.0 mm (±0.2) · STANDOFF ≥6.5 mm · TUNA CAN Ø64×36 mm';
  }
  if (formFactor === '3U') {
    return 'CDS 3U · 100.0×100.0×340.5 mm (±0.3) · STANDOFF ≥6.5 mm · TUNA CAN Ø64×36 mm';
  }
  return 'DEEP SPACE BUS · 6U/12U (226.3×366.0 mm) · STANDOFF ≥6.5 mm · TUNA CAN Ø64×36 mm';
}

export function HoloSpacecraftWireframe() {
  const {
    language,
    experienceMode,
    phase,
    cubesatFormFactor,
    selection,
    metrics,
    laserScanActive,
    reducedMotion,
    soundEnabled,
    loadPreset,
    setSubsystem,
  } = useMissionStore();

  const [selectedPin, setSelectedPin] = useState<InspectionPinId>('pin-1');
  const [yawDeg, setYawDeg] = useState<number>(28);
  const [cadView, setCadView] = useState<CadViewMode>('ISO');
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [dragState, setDragState] = useState<{ x: number; yaw: number } | null>(null);

  const autoSpinRef = useRef<boolean>(autoSpin);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (autoSpinRef.current) {
        setYawDeg((y) => (y + dt * 18) % 360);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const isEs = language === 'es';
  const isJpl = experienceMode === 'JPL_ENGINEER';
  const eps = findSubsystemById(selection.epsId);
  const prop = findSubsystemById(selection.propulsionId);
  const telecom = findSubsystemById(selection.telecomId);
  const adcs = findSubsystemById(selection.adcsId);
  const thermal = findSubsystemById(selection.thermalId);

  const isJwstArch =
    selection.objectiveId === 'obj-l2-jwst-fgs' ||
    selection.destinationId === 'dest-l2';
  const isTracersArch =
    selection.objectiveId === 'obj-sso-tracers' ||
    (!isJwstArch &&
      selection.payloadIds.includes('pay-magnetometer') &&
      selection.destinationId !== 'dest-mars' &&
      selection.destinationId !== 'dest-jupiter');
  const isMroArch =
    !isJwstArch &&
    (selection.objectiveId === 'obj-mars-reconnaissance' ||
      selection.payloadIds.includes('pay-sar-radar'));

  const units =
    cubesatFormFactor === '1.5U'
      ? 1
      : cubesatFormFactor === '2U'
        ? 2
        : cubesatFormFactor === '3U'
          ? 3
          : 4;
  const halfH = 22 + units * 10;
  const boxW = 34;

  const isMassAlarm =
    metrics.wetMass_kg > metrics.launchCapacity_kg || !metrics.volume.isCompliant;
  const isPowerAlarm = metrics.power.status === 'RED';
  const isRfAlarm = metrics.telecom.status === 'RED';
  const strokeMain = isMassAlarm ? '#FF4D6D' : '#5FF3FF';
  const hasMegaWing = selection.epsId === 'eps-megaflex';
  const hasLiltWing = selection.epsId === 'eps-lilt-array';
  const hasWing =
    selection.epsId === 'eps-deployable' || hasMegaWing || hasLiltWing;
  const hasRTG = selection.epsId === 'eps-rtg';

  const pitchDeg =
    cadView === 'TOP' ? 78 : cadView === 'FRONT' || cadView === 'SIDE' ? 6 : 22;

  const CX = 250;
  const CY = 166;
  const p = (x: number, y: number, z: number) =>
    project3D({ x, y, z }, yawDeg, pitchDeg, CX, CY);

  // Project 3D rectangular prism helper
  const projectBox = (w: number, yTop: number, yBot: number, d: number) => {
    const t0 = p(-w, yTop, -d);
    const t1 = p(w, yTop, -d);
    const t2 = p(w, yTop, d);
    const t3 = p(-w, yTop, d);
    const b0 = p(-w, yBot, -d);
    const b1 = p(w, yBot, -d);
    const b2 = p(w, yBot, d);
    const b3 = p(-w, yBot, d);
    return {
      topFace: toSvgPoly([t0, t1, t2, t3]),
      botFace: toSvgPoly([b0, b1, b2, b3]),
      edges: [
        [t0, b0],
        [t1, b1],
        [t2, b2],
        [t3, b3],
      ],
      corners: [t0, t1, t2, t3, b0, b1, b2, b3],
    };
  };

  // Turntable Projection Rings
  const ringOuter = projectRing3D(125, 125, 118, 48, yawDeg, pitchDeg, CX, CY);
  const ringInner = projectRing3D(76, 76, 118, 36, yawDeg, pitchDeg, CX, CY);
  const tickN = p(0, 118, -125);
  const tickE = p(125, 118, 0);
  const tickS = p(0, 118, 125);
  const tickW = p(-125, 118, 0);

  // Body axes triad
  const axOrigin = p(0, 0, 0);
  const axX = p(105, 0, 0);
  const axY = p(0, 0, 105);
  const axZ = p(0, -110, 0);

  const cotaHeader = getPlatformCotaLabel(
    selection.objectiveId,
    selection.destinationId,
    cubesatFormFactor,
  );

  const activePinMeta =
    CAD_PINS.find((pin) => pin.id === selectedPin) ?? CAD_PINS[0];
  const pinContext = {
    massOk: metrics.dryMass.status === 'GREEN' && metrics.volume.isCompliant,
    powerOk: metrics.power.status === 'GREEN',
    rfOk: metrics.telecom.status === 'GREEN',
  };

  const handleSelectView = (view: CadViewMode) => {
    setCadView(view);
    if (view === 'FRONT') {
      setAutoSpin(false);
      setYawDeg(0);
    } else if (view === 'SIDE') {
      setAutoSpin(false);
      setYawDeg(90);
    } else if (view === 'TOP') {
      setAutoSpin(false);
    } else {
      setAutoSpin(true);
    }
    playHoloTone('STEP', soundEnabled);
  };

  // Shared projected boxes for CubeSat / MRO
  const cubeBox = projectBox(boxW, -halfH, halfH, boxW);
  const mroBox = projectBox(42, -36, 38, 30);

  // Wing projection in 3D space (slightly canted z=+14/-14 for thickness illusion)
  const wingSpan = hasMegaWing ? 142 : hasLiltWing ? 108 : 88;
  const wingInnerX = isTracersArch ? 46 : isMroArch ? 42 : boxW + 2;
  const wingColor = isPowerAlarm ? '#FF4D6D' : '#5FF3FF';
  const leftWing = [
    p(-wingInnerX, -14, 10),
    p(-(wingInnerX + wingSpan), -20, 14),
    p(-(wingInnerX + wingSpan), 20, -14),
    p(-wingInnerX, 14, -10),
  ];
  const rightWing = [
    p(wingInnerX, -14, 10),
    p(wingInnerX + wingSpan, -20, 14),
    p(wingInnerX + wingSpan, 20, -14),
    p(wingInnerX, 14, -10),
  ];

  // Subsystem 3D positions
  const subTopY = isMroArch ? -36 : isTracersArch ? -36 : -halfH;
  const subBotY = isMroArch ? 38 : isTracersArch ? 36 : halfH;
  const starRoot = p(boxW, -halfH * 0.45, 8);
  const starTipTop = p(boxW + 26, -halfH * 0.45 - 14, 14);
  const starTipBot = p(boxW + 26, -halfH * 0.45 - 2, 6);
  const laserBox = projectBox(10, subTopY - 22, subTopY - 6, 8);
  const laserOrigin = p(0, subTopY - 22, 0);
  const laserBeamTip = p(0, subTopY - 76, 0);
  const nozzleTop = projectRing3D(11, 11, subBotY + 2, 12, yawDeg, pitchDeg, CX, CY);
  const nozzleBot = projectRing3D(18, 18, subBotY + 24, 12, yawDeg, pitchDeg, CX, CY);

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {phase === 'CML_3' && (
        <div className="mb-2.5 grid w-full max-w-xl grid-cols-2 gap-1.5 sm:grid-cols-4">
          {MINI_ARCHS.map((arch) => {
            const active = selection.objectiveId === arch.key;
            return (
              <button
                key={arch.key}
                type="button"
                onClick={() => {
                  loadPreset(arch.key);
                  playHoloTone('STEP', soundEnabled);
                }}
                className={`border px-2 py-1.5 text-center font-mono text-[9.5px] tracking-wider uppercase transition ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-[#5FF3FF] shadow-[0_0_16px_rgba(95,243,255,0.22)]'
                    : 'border-[#5FF3FF]/25 bg-[#04080F]/80 text-slate-400 opacity-75 hover:opacity-100'
                }`}
              >
                <svg viewBox="0 0 60 32" className="mx-auto mb-1 h-6 w-11">
                  {arch.shape === 'CUBESAT' && (
                    <>
                      <rect x="22" y="7" width="16" height="18" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="8" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1" />
                      <line x1="38" y1="16" x2="52" y2="16" stroke="currentColor" strokeWidth="1" />
                    </>
                  )}
                  {arch.shape === 'OCTAGON' && (
                    <>
                      <polygon points="24,6 36,6 42,12 42,20 36,26 24,26 18,20 18,12" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="4" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="0.9" />
                      <line x1="42" y1="16" x2="56" y2="16" stroke="currentColor" strokeWidth="0.9" />
                      <line x1="30" y1="2" x2="30" y2="30" stroke="currentColor" strokeWidth="0.8" />
                    </>
                  )}
                  {arch.shape === 'JWST' && (
                    <>
                      <polygon points="30,4 37,8 37,15 30,19 23,15 23,8" fill="none" stroke="#FFC15E" strokeWidth="1" />
                      <polygon points="10,24 30,19 50,24 30,29" fill="none" stroke="currentColor" strokeWidth="1" />
                      <polygon points="13,26 30,22 47,26 30,30" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.8" />
                    </>
                  )}
                  {arch.shape === 'RTG' && (
                    <>
                      <rect x="21" y="9" width="18" height="16" fill="none" stroke="currentColor" strokeWidth="1" />
                      <polygon points="11,19 21,15 21,23 11,25" fill="none" stroke="#FFC15E" strokeWidth="1" />
                      <polygon points="49,19 39,15 39,23 49,25" fill="none" stroke="#FFC15E" strokeWidth="1" />
                      <path d="M23,8 Q30,2 37,8" fill="none" stroke="currentColor" strokeWidth="1" />
                    </>
                  )}
                </svg>
                {arch.label[language]}
              </button>
            );
          })}
        </div>
      )}

      {/* Dimension Banner from Official CAD Specs */}
      <div className="mb-1.5 w-full max-w-[540px] border border-[#5FF3FF]/25 bg-[#04080F]/85 px-2.5 py-1 text-center font-mono text-[8.5px] tracking-[0.1em] text-[#5FF3FF] uppercase">
        {phase === 'CML_1'
          ? `${isEs ? 'BOCETO CONCEPTUAL ·' : 'NAPKIN BLUEPRINT ·'} ${cotaHeader}`
          : cotaHeader}
      </div>

      <svg
        viewBox="0 0 500 345"
        onPointerDown={(e) => {
          setAutoSpin(false);
          setDragState({ x: e.clientX, yaw: yawDeg });
        }}
        onPointerMove={(e) => {
          if (!dragState) return;
          const dx = e.clientX - dragState.x;
          const next = (((dragState.yaw + dx * 0.7) % 360) + 360) % 360;
          setYawDeg(next);
        }}
        onPointerUp={() => setDragState(null)}
        onPointerLeave={() => setDragState(null)}
        className={`h-[300px] w-full max-w-[540px] select-none sm:h-[345px] ${
          dragState ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <defs>
          <filter id="holoGlow">
            <feGaussianBlur stdDeviation="2.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="scanBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#5FF3FF" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <pattern
            id="fepHatch"
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#E2E8F0"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* CAD Blueprint Grid in CML_1 & CML_5 */}
        {(phase === 'CML_1' || phase === 'CML_5') && (
          <g stroke="#5FF3FF" strokeOpacity="0.09" strokeWidth="0.7">
            {[70, 120, 170, 220, 270].map((yPos) => (
              <line key={`gh-${yPos}`} x1="40" y1={yPos} x2="460" y2={yPos} />
            ))}
            {[100, 150, 200, 250, 300, 350, 400].map((xPos) => (
              <line key={`gv-${xPos}`} x1={xPos} y1="35" x2={xPos} y2="305" />
            ))}
          </g>
        )}

        {/* Rotating 3D Turntable Rings & Compass */}
        <g stroke="#5FF3FF" fill="none">
          <polygon points={toSvgPoly(ringOuter)} strokeOpacity="0.22" strokeDasharray="3 4" strokeWidth="1" />
          <polygon points={toSvgPoly(ringInner)} strokeOpacity="0.36" strokeWidth="1" />
          <circle cx={tickN.x} cy={tickN.y} r="2" fill="#5FF3FF" fillOpacity="0.6" />
          <circle cx={tickE.x} cy={tickE.y} r="2" fill="#FFC15E" fillOpacity="0.7" />
          <circle cx={tickS.x} cy={tickS.y} r="2" fill="#5FF3FF" fillOpacity="0.6" />
          <circle cx={tickW.x} cy={tickW.y} r="2" fill="#5FF3FF" fillOpacity="0.6" />
        </g>

        {/* Rotating 3D Body Axis Triad */}
        <g stroke="#5FF3FF" strokeOpacity="0.26" strokeDasharray="3 3" className="font-mono text-[7.5px]">
          <line x1={axOrigin.x} y1={axOrigin.y} x2={axX.x} y2={axX.y} />
          <text x={axX.x + 3} y={axX.y} fill="#5FF3FF" fillOpacity="0.7">
            +X
          </text>
          <line x1={axOrigin.x} y1={axOrigin.y} x2={axY.x} y2={axY.y} />
          <text x={axY.x + 3} y={axY.y} fill="#5FF3FF" fillOpacity="0.7">
            +Y
          </text>
          <line x1={axOrigin.x} y1={axOrigin.y} x2={axZ.x} y2={axZ.y} />
          <text x={axZ.x + 4} y={axZ.y + 4} fill="#FFC15E" fillOpacity="0.8">
            +Z
          </text>
        </g>

        {/* STAGE 01: 3D ROTATING NAPKIN SKETCH WITH CDS RAILS & TUNA CAN */}
        {phase === 'CML_1' ? (
          <g filter="url(#holoGlow)">
            <polygon
              points={cubeBox.topFace}
              fill="#5FF3FF0A"
              stroke={strokeMain}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <polygon
              points={cubeBox.botFace}
              fill="#5FF3FF06"
              stroke={strokeMain}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            {/* 4 Corner Guide Rails */}
            {cubeBox.edges.map(([tPt, bPt], idx) => (
              <line
                key={`nap-rail-${idx}`}
                x1={tPt.x}
                y1={tPt.y}
                x2={bPt.x}
                y2={bPt.y}
                stroke="#FFC15E"
                strokeWidth="2"
              />
            ))}

            {/* -Z Cylindrical Tuna Can Volume (Ø64 x 36 mm) */}
            {(() => {
              const tcTop = projectRing3D(18, 18, halfH, 16, yawDeg, pitchDeg, CX, CY);
              const tcBot = projectRing3D(18, 18, halfH + 22, 16, yawDeg, pitchDeg, CX, CY);
              return (
                <g stroke="#FFC15E" fill="#FFC15E0C" strokeWidth="1">
                  <polygon points={toSvgPoly(tcTop)} />
                  <polygon points={toSvgPoly(tcBot)} />
                  <line x1={tcTop[0].x} y1={tcTop[0].y} x2={tcBot[0].x} y2={tcBot[0].y} />
                  <line x1={tcTop[8].x} y1={tcTop[8].y} x2={tcBot[8].x} y2={tcBot[8].y} />
                </g>
              );
            })()}

            {/* +Z Payload FOV Cone */}
            {(() => {
              const apex = p(0, -halfH, 0);
              const fovRing = projectRing3D(38, 38, -halfH - 58, 16, yawDeg, pitchDeg, CX, CY);
              return (
                <g stroke="#FFC15E" strokeOpacity="0.68" strokeDasharray="3 2" fill="none">
                  <polygon points={toSvgPoly(fovRing)} fill="#FFC15E0D" />
                  <line x1={apex.x} y1={apex.y} x2={fovRing[0].x} y2={fovRing[0].y} />
                  <line x1={apex.x} y1={apex.y} x2={fovRing[4].x} y2={fovRing[4].y} />
                  <line x1={apex.x} y1={apex.y} x2={fovRing[8].x} y2={fovRing[8].y} />
                  <line x1={apex.x} y1={apex.y} x2={fovRing[12].x} y2={fovRing[12].y} />
                </g>
              );
            })()}

            {/* Billboard Cota Callouts */}
            <g className="font-mono text-[8px]" fill="#FFC15E">
              <text x="250" y="42" textAnchor="middle">
                {isEs ? 'CONO DE VISIÓN (FOV) · ±Z STANDOFF ≥6.5 mm' : 'PAYLOAD FOV CONE · ±Z STANDOFF ≥6.5 mm'}
              </text>
              <text x="250" y="314" textAnchor="middle" fill="#5FF3FF">
                1U RAIL: 100×100 mm · TUNA CAN Ø64×36 mm
              </text>
            </g>
          </g>
        ) : (
          /* STAGES 03 & 05: 3D ROTATING PLATFORM MORPHOLOGY + SUBSYSTEMS */
          <g>
            {/* Solar Wings in 3D */}
            {hasWing && (
              <g filter="url(#holoGlow)">
                <polygon
                  points={toSvgPoly(leftWing)}
                  fill={isPowerAlarm ? '#FF4D6D16' : '#5FF3FF10'}
                  stroke={wingColor}
                  strokeWidth="1.1"
                />
                <polygon
                  points={toSvgPoly(rightWing)}
                  fill={isPowerAlarm ? '#FF4D6D16' : '#5FF3FF10'}
                  stroke={wingColor}
                  strokeWidth="1.1"
                />
                {[0.25, 0.5, 0.75].map((f) => {
                  const xl = -(wingInnerX + wingSpan * f);
                  const xr = wingInnerX + wingSpan * f;
                  const lTop = p(xl, -14 - f * 6, 10 + f * 4);
                  const lBot = p(xl, 14 + f * 6, -10 - f * 4);
                  const rTop = p(xr, -14 - f * 6, 10 + f * 4);
                  const rBot = p(xr, 14 + f * 6, -10 - f * 4);
                  return (
                    <g key={`wing-rib-${f}`} stroke={wingColor} strokeOpacity="0.38" strokeWidth="0.75">
                      <line x1={lTop.x} y1={lTop.y} x2={lBot.x} y2={lBot.y} />
                      <line x1={rTop.x} y1={rTop.y} x2={rBot.x} y2={rBot.y} />
                    </g>
                  );
                })}
              </g>
            )}

            {/* RTG Nuclear Radiator Fins in 3D */}
            {hasRTG && (
              <g filter="url(#holoGlow)">
                {([-1, 1] as const).map((side) => {
                  const rFin = [
                    p(side * 36, 12, 8),
                    p(side * 96, 22, 12),
                    p(side * 96, 36, -12),
                    p(side * 36, 28, -8),
                  ];
                  return (
                    <polygon
                      key={`rtg-${side}`}
                      points={toSvgPoly(rFin)}
                      fill="#FFC15E15"
                      stroke="#FFC15E"
                      strokeWidth="1.1"
                    />
                  );
                })}
              </g>
            )}

            {/* ARCH 1: 3D JWST / CSA FGS */}
            {isJwstArch ? (
              <g filter="url(#holoGlow)">
                {/* 5-Layer Rhomboid Sunshield (21.2 x 14.2m proportions) */}
                {[0, 1, 2, 3, 4].map((layer) => {
                  const yL = 32 + layer * 8;
                  const shrink = layer * 6;
                  const pts = [
                    p(0, yL, -(112 - shrink)),
                    p(68 - shrink * 0.6, yL, 0),
                    p(0, yL, 112 - shrink),
                    p(-(68 - shrink * 0.6), yL, 0),
                  ];
                  return (
                    <polygon
                      key={`jwst-s-${layer}`}
                      points={toSvgPoly(pts)}
                      fill={layer >= 3 ? '#FFC15E0C' : '#5FF3FF0A'}
                      stroke={layer >= 3 ? '#FFC15E' : '#5FF3FF'}
                      strokeOpacity={0.95 - layer * 0.14}
                      strokeWidth="1.1"
                    />
                  );
                })}

                {/* Segmented Hexagonal Primary Mirror (OTE Ø6.5m) facing +Z */}
                {[
                  [0, -48],
                  [-19, -37],
                  [19, -37],
                  [-19, -15],
                  [19, -15],
                  [0, -4],
                  [0, -26],
                ].map(([hx, hy], idx) => {
                  const hex3D = [
                    p(hx, hy - 10, 6),
                    p(hx + 9, hy - 5, 6),
                    p(hx + 9, hy + 5, 6),
                    p(hx, hy + 10, 6),
                    p(hx - 9, hy + 5, 6),
                    p(hx - 9, hy - 5, 6),
                  ];
                  return (
                    <polygon
                      key={`jwst-hex-${idx}`}
                      points={toSvgPoly(hex3D)}
                      fill="#FFC15E18"
                      stroke="#FFC15E"
                      strokeWidth="1.1"
                    />
                  );
                })}

                {/* Aft ISIM / CSA FGS Box at z = -12..-28 */}
                {(() => {
                  const isim = projectBox(15, -36, -6, 10);
                  const sec = p(0, -34, 62);
                  const topM = p(0, -56, 8);
                  const botL = p(-20, -6, 8);
                  const botR = p(20, -6, 8);
                  return (
                    <>
                      <polygon points={isim.topFace} fill="#5FF3FF14" stroke="#5FF3FF" strokeWidth="1" />
                      {isim.edges.map(([a, b], i) => (
                        <line key={`is-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5FF3FF" strokeWidth="1" />
                      ))}
                      <line x1={topM.x} y1={topM.y} x2={sec.x} y2={sec.y} stroke="#FFC15E" strokeWidth="1.1" />
                      <line x1={botL.x} y1={botL.y} x2={sec.x} y2={sec.y} stroke="#5FF3FF" strokeWidth="1" />
                      <line x1={botR.x} y1={botR.y} x2={sec.x} y2={sec.y} stroke="#5FF3FF" strokeWidth="1" />
                      <circle cx={sec.x} cy={sec.y} r="4.5" fill="none" stroke="#FFC15E" strokeWidth="1.3" />
                    </>
                  );
                })()}

                <text x="115" y="256" className="font-mono text-[8px]" fill="#FFC15E">
                  SUNSHIELD 21.2×14.2m · OTE Ø6.5m · CSA FGS 16Hz
                </text>
              </g>
            ) : isTracersArch ? (
              /* ARCH 2: 3D NASA TRACERS OCTAGONAL BUS + 4 RADIAL EFI BOOMS */
              <g filter="url(#holoGlow)">
                {(() => {
                  const octTop = projectRing3D(44, 44, -36, 8, yawDeg, pitchDeg, CX, CY);
                  const octBot = projectRing3D(44, 44, 36, 8, yawDeg, pitchDeg, CX, CY);
                  const magTop = p(0, -106, 0);
                  const magBase = p(0, -36, 0);
                  return (
                    <>
                      <polygon
                        points={toSvgPoly(octTop)}
                        fill={thermal?.id === 'therm-silver-fep' ? 'url(#fepHatch)' : '#5FF3FF12'}
                        stroke={strokeMain}
                        strokeWidth="1.2"
                      />
                      <polygon points={toSvgPoly(octBot)} fill="#5FF3FF08" stroke={strokeMain} strokeWidth="1.2" />
                      {octTop.map((tPt, i) => (
                        <line
                          key={`oct-edge-${i}`}
                          x1={tPt.x}
                          y1={tPt.y}
                          x2={octBot[i].x}
                          y2={octBot[i].y}
                          stroke={strokeMain}
                          strokeOpacity="0.7"
                          strokeWidth="1.1"
                        />
                      ))}

                      {/* 4 Radial EFI Wire Booms */}
                      {[0, 90, 180, 270].map((ang) => {
                        const rad = (ang * Math.PI) / 180;
                        const inner = p(Math.cos(rad) * 44, 0, Math.sin(rad) * 44);
                        const outer = p(Math.cos(rad) * 134, 0, Math.sin(rad) * 134);
                        return (
                          <g key={`efi3d-${ang}`}>
                            <line
                              x1={inner.x}
                              y1={inner.y}
                              x2={outer.x}
                              y2={outer.y}
                              stroke="#FFC15E"
                              strokeDasharray="4 2"
                              strokeWidth="1.1"
                            />
                            <circle cx={outer.x} cy={outer.y} r="3.4" fill="#FFC15E" />
                          </g>
                        );
                      })}

                      {/* Axial Fluxgate MAG Boom */}
                      <line x1={magBase.x} y1={magBase.y} x2={magTop.x} y2={magTop.y} stroke="#5FF3FF" strokeWidth="1.5" />
                      <circle cx={magTop.x} cy={magTop.y} r="4" fill="#04080F" stroke="#FFC15E" strokeWidth="1.2" />
                    </>
                  );
                })()}
              </g>
            ) : isMroArch ? (
              /* ARCH 3: 3D MRO BUS + Ø3.0m HGA PARABOLIC DISH + 10m SHARAD BOOM */
              <g filter="url(#holoGlow)">
                <polygon points={mroBox.topFace} fill="#5FF3FF14" stroke={strokeMain} strokeWidth="1.2" />
                <polygon points={mroBox.botFace} fill="#5FF3FF08" stroke={strokeMain} strokeWidth="1.2" />
                {mroBox.edges.map(([a, b], i) => (
                  <line key={`mro-e-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={strokeMain} strokeWidth="1.2" />
                ))}
                {(() => {
                  const dishRing = projectRing3D(42, 34, -76, 20, yawDeg, pitchDeg, CX, CY);
                  const mastBase = p(0, -36, 0);
                  const mastMid = p(0, -76, 0);
                  const feed = p(0, -96, 0);
                  const shL = p(-132, 46, 0);
                  const shR = p(132, 46, 0);
                  const shCenter = p(0, 38, 0);
                  const shMid = p(0, 46, 0);
                  return (
                    <>
                      <line x1={mastBase.x} y1={mastBase.y} x2={mastMid.x} y2={mastMid.y} stroke="#5FF3FF" strokeWidth="1.5" />
                      <polygon
                        points={toSvgPoly(dishRing)}
                        fill="#5FF3FF12"
                        stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'}
                        strokeWidth="1.3"
                      />
                      <line x1={mastMid.x} y1={mastMid.y} x2={feed.x} y2={feed.y} stroke="#FFC15E" strokeWidth="1.2" />
                      <circle cx={feed.x} cy={feed.y} r="3" fill="#FFC15E" />
                      <line x1={shL.x} y1={shL.y} x2={shR.x} y2={shR.y} stroke="#FFC15E" strokeWidth="1.8" />
                      <line x1={shCenter.x} y1={shCenter.y} x2={shMid.x} y2={shMid.y} stroke="#FFC15E" strokeWidth="1.1" />
                    </>
                  );
                })()}
              </g>
            ) : (
              /* ARCH 4: 3D CUBESAT CDS PRISM + 1U RINGS */
              <g filter="url(#holoGlow)">
                <polygon points={cubeBox.topFace} fill="#5FF3FF10" stroke={strokeMain} strokeWidth="1.2" />
                <polygon
                  points={cubeBox.botFace}
                  fill={thermal?.id === 'therm-silver-fep' ? 'url(#fepHatch)' : '#5FF3FF08'}
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                {cubeBox.edges.map(([tPt, bPt], i) => (
                  <g key={`cube-edge-${i}`}>
                    <line x1={tPt.x} y1={tPt.y} x2={bPt.x} y2={bPt.y} stroke={strokeMain} strokeWidth="1.2" />
                    <circle cx={tPt.x} cy={tPt.y} r="2.2" fill="#FFC15E" />
                    <circle cx={bPt.x} cy={bPt.y} r="2.2" fill="#FFC15E" />
                  </g>
                ))}
                {/* Modular 1U stack divider rings in 3D */}
                {Array.from({ length: units }).map((_, idx) => {
                  const ySeg = -halfH + ((idx + 1) * (halfH * 2)) / (units + 1);
                  const segRing = [
                    p(-boxW, ySeg, -boxW),
                    p(boxW, ySeg, -boxW),
                    p(boxW, ySeg, boxW),
                    p(-boxW, ySeg, boxW),
                  ];
                  return (
                    <polygon
                      key={`cube-seg-${idx}`}
                      points={toSvgPoly(segRing)}
                      fill="none"
                      stroke={strokeMain}
                      strokeOpacity="0.52"
                      strokeWidth="0.9"
                    />
                  );
                })}
              </g>
            )}

            {/* 3D SUBSYSTEM WIREFRAME OVERLAYS */}
            {(adcs?.id === 'adcs-sagitta-star' || adcs?.id === 'adcs-3axis') && !isJwstArch && (
              <g filter="url(#holoGlow)">
                <polygon
                  points={`${starRoot.x},${starRoot.y} ${starTipTop.x},${starTipTop.y} ${starTipBot.x},${starTipBot.y}`}
                  fill="#04080F"
                  stroke="#5FF3FF"
                  strokeWidth="1.1"
                />
                <circle cx={starTipTop.x} cy={(starTipTop.y + starTipBot.y) / 2} r="2.8" fill="none" stroke="#FFC15E" strokeWidth="1" />
              </g>
            )}

            {(telecom?.id === 'telecom-cubelct-laser' || telecom?.id === 'telecom-laser') && !isJwstArch && (
              <g filter="url(#holoGlow)">
                <polygon points={laserBox.topFace} fill="#04080F" stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'} strokeWidth="1.1" />
                {laserBox.edges.map(([a, b], i) => (
                  <line key={`ls-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5FF3FF" strokeWidth="0.9" />
                ))}
                <line
                  x1={laserOrigin.x}
                  y1={laserOrigin.y}
                  x2={laserBeamTip.x}
                  y2={laserBeamTip.y}
                  stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'}
                  strokeDasharray="4 2"
                  strokeWidth="1.4"
                />
              </g>
            )}

            {telecom?.id === 'telecom-xka' && !isMroArch && !isJwstArch && (
              <g filter="url(#holoGlow)">
                <polygon
                  points={toSvgPoly(projectRing3D(18, 18, subTopY - 22, 14, yawDeg, pitchDeg, CX, CY))}
                  fill="none"
                  stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'}
                  strokeWidth="1.2"
                />
                <line
                  x1={p(0, subTopY, 0).x}
                  y1={p(0, subTopY, 0).y}
                  x2={p(0, subTopY - 34, 0).x}
                  y2={p(0, subTopY - 34, 0).y}
                  stroke="#FFC15E"
                  strokeWidth="1.1"
                />
              </g>
            )}

            {!isJwstArch && (
              <g>
                <polygon points={toSvgPoly(nozzleTop)} fill="none" stroke="#5FF3FF" strokeWidth="1" />
                <polygon points={toSvgPoly(nozzleBot)} fill="none" stroke="#FFC15E" strokeWidth="1" />
                <line x1={nozzleTop[0].x} y1={nozzleTop[0].y} x2={nozzleBot[0].x} y2={nozzleBot[0].y} stroke="#5FF3FF" strokeWidth="1" />
                <line x1={nozzleTop[6].x} y1={nozzleTop[6].y} x2={nozzleBot[6].x} y2={nozzleBot[6].y} stroke="#5FF3FF" strokeWidth="1" />
              </g>
            )}

            {/* Telemetry Summary Callouts */}
            <g className="font-mono text-[8.5px]" fill="#FFC15E">
              <text x="18" y="274">
                {eps?.isRTG ? 'RTG' : 'EPS'}: {metrics.power.generatedAtDestination_W.toFixed(0)}W ({metrics.power.marginPercent.toFixed(0)}%)
              </text>
              <text x="482" y="274" textAnchor="end" fill="#5FF3FF">
                {isEs ? 'VOLUMEN:' : 'VOL:'} {metrics.volume.used_U.toFixed(1)}U / {metrics.volume.maxFairing_U}U
              </text>
              <text x="250" y="332" textAnchor="middle" fill="#5FF3FF" opacity="0.9">
                {isEs ? 'MASA HÚMEDA' : 'WET MASS'} {metrics.wetMass_kg.toFixed(1)} KG · ISP {prop?.isp_s ?? 68} S · {telecom?.freqGHz ?? 0.4} GHZ · YAW {Math.round(yawDeg)}°
              </text>
            </g>
          </g>
        )}

        {/* LEVEL 05: LASER SCAN & 3D BILLBOARD CAD INSPECTION PINS */}
        {phase === 'CML_5' && laserScanActive && (
          <motion.g
            animate={reducedMotion ? {} : { y: [48, 288, 48] }}
            transition={{ repeat: Infinity, duration: 3.4, ease: 'linear' }}
          >
            <line x1="75" y1="0" x2="425" y2="0" stroke="url(#scanBeam)" strokeWidth="2" />
          </motion.g>
        )}

        {phase === 'CML_5' &&
          CAD_PINS.map((pin) => {
            const pt = p(pin.pos3D.x, pin.pos3D.y, pin.pos3D.z);
            const isOk = pin.ok(pinContext);
            const active = selectedPin === pin.id;
            const color = isOk ? '#5FF3FF' : '#FFC15E';
            const behind = pt.depth < -10;
            return (
              <g
                key={pin.id}
                opacity={behind && !active ? 0.58 : 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(pin.id);
                  playHoloTone('STEP', soundEnabled);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={active ? 9.5 : 7}
                  fill="#04080F"
                  stroke={color}
                  strokeWidth={active ? 2 : 1.2}
                />
                <circle cx={pt.x} cy={pt.y} r="2.6" fill={color} />
                <text
                  x={pt.x + 11}
                  y={pt.y + 3}
                  className="font-mono text-[8px]"
                  fill={color}
                  fontWeight={active ? 'bold' : 'normal'}
                >
                  {pin.shortLabel[language]} {isOk ? '✓' : '!'}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Lightweight 3D CAD Turntable Controls */}
      <div className="mt-1.5 flex w-full max-w-[540px] flex-wrap items-center justify-between gap-2 border border-[#5FF3FF]/25 bg-[#04080F]/90 px-2.5 py-1.5 font-mono text-[9px]">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setAutoSpin((s) => !s)}
            className={`border px-2 py-0.5 transition ${
              autoSpin
                ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/15 text-[#5FF3FF]'
                : 'border-[#FFC15E]/50 bg-[#FFC15E]/15 text-[#FFC15E]'
            }`}
          >
            {autoSpin
              ? isEs
                ? '⏸ PAUSAR 360°'
                : '⏸ PAUSE 360°'
              : isEs
                ? '▶ GIRO 360°'
                : '▶ SPIN 360°'}
          </button>

          {(
            [
              ['ISO', 'ISO 3D'],
              ['FRONT', 'FRONT +X'],
              ['SIDE', 'SIDE +Y'],
              ['TOP', 'TOP +Z'],
            ] as const
          ).map(([viewKey, label]) => (
            <button
              key={viewKey}
              type="button"
              onClick={() => handleSelectView(viewKey)}
              className={`border px-1.5 py-0.5 transition ${
                cadView === viewKey
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-[#5FF3FF]'
                  : 'border-[#5FF3FF]/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="holo-spacecraft-yaw-range"
            name="holoSpacecraftYawDeg"
            type="range"
            min={0}
            max={359}
            value={Math.round(yawDeg)}
            onChange={(e) => {
              setAutoSpin(false);
              setYawDeg(Number(e.target.value));
            }}
            aria-label={isEs ? 'Rotación 3D del holograma' : 'Hologram 3D Yaw Rotation'}
            className="w-24 accent-[#5FF3FF]"
          />
          <span className="w-8 text-right text-[#5FF3FF]">{Math.round(yawDeg)}°</span>
        </div>
      </div>

      {/* Interactive CAD Inspection Readout Card in CML_5 */}
      {phase === 'CML_5' && (
        <div className="mt-1.5 w-full max-w-[540px] border border-[#5FF3FF]/35 bg-[#04080F]/90 p-2.5 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9.5px] uppercase">
            <span className="text-[#FFC15E]">{activePinMeta.standard}</span>
            <span className="text-[#5FF3FF]">{activePinMeta.title[language]}</span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-slate-200">
            {isJpl
              ? activePinMeta.jplDetail[language]
              : activePinMeta.cadetDetail[language]}
          </p>
          {(!pinContext.massOk || !pinContext.powerOk || !pinContext.rfOk) && (
            <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[9px] uppercase">
              {!pinContext.massOk && (
                <button
                  type="button"
                  onClick={() => {
                    setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9');
                    playHoloTone('STAR', soundEnabled);
                  }}
                  className="border border-[#FFC15E]/50 px-2 py-0.5 text-[#FFC15E] hover:bg-[#FFC15E]/15"
                >
                  + {isEs ? 'ESCALAR FALCON 9' : 'FIX MASS · FALCON 9'}
                </button>
              )}
              {!pinContext.powerOk && (
                <button
                  type="button"
                  onClick={() => {
                    setSubsystem('EPS', 'eps-megaflex');
                    playHoloTone('STAR', soundEnabled);
                  }}
                  className="border border-[#FFC15E]/50 px-2 py-0.5 text-[#FFC15E] hover:bg-[#FFC15E]/15"
                >
                  + {isEs ? 'ESCALAR EPS MEGA-FLEX' : 'FIX EPS · MEGA-FLEX'}
                </button>
              )}
              {!pinContext.rfOk && (
                <button
                  type="button"
                  onClick={() => {
                    setSubsystem('TELECOM', 'telecom-xka');
                    playHoloTone('STAR', soundEnabled);
                  }}
                  className="border border-[#FFC15E]/50 px-2 py-0.5 text-[#FFC15E] hover:bg-[#FFC15E]/15"
                >
                  + {isEs ? 'EQUIPAR X/KA' : 'FIX RF · X/KA'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
