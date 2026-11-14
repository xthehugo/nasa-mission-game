import { useState } from 'react';
import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

const MINI_ARCHS = [
  { key: 'obj-earth-bionutrients', label: { en: 'A · CDS 3U', es: 'A · CDS 3U' }, shape: 'CUBESAT' as const },
  { key: 'obj-sso-tracers', label: { en: 'B · TRACERS Ø1.32m', es: 'B · TRACERS Ø1.32m' }, shape: 'OCTAGON' as const },
  { key: 'obj-l2-jwst-fgs', label: { en: 'C · JWST Ø6.5m', es: 'C · JWST Ø6.5m' }, shape: 'JWST' as const },
  { key: 'obj-jupiter-clipper', label: { en: 'D · Deep RTG', es: 'D · RTG 5.2AU' }, shape: 'RTG' as const },
];

type InspectionPinId = 'pin-1' | 'pin-2' | 'pin-3' | 'pin-4';

interface CadPinMeta {
  id: InspectionPinId;
  shortLabel: { en: string; es: string };
  standard: string;
  title: { en: string; es: string };
  jplDetail: { en: string; es: string };
  cadetDetail: { en: string; es: string };
  x: number;
  y: number;
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
    x: 250,
    y: 238,
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
    x: 204,
    y: 204,
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
    x: 298,
    y: 196,
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
    x: 250,
    y: 102,
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
  const bodyH = 44 + units * 20;
  const topY = 172 - bodyH / 2;
  const botY = 172 + bodyH / 2;
  const dur = reducedMotion ? 0 : 0.6;

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

  const cotaHeader = getPlatformCotaLabel(
    selection.objectiveId,
    selection.destinationId,
    cubesatFormFactor,
  );

  const activePinMeta =
    CAD_PINS.find((p) => p.id === selectedPin) ?? CAD_PINS[0];
  const pinContext = {
    massOk: metrics.dryMass.status === 'GREEN' && metrics.volume.isCompliant,
    powerOk: metrics.power.status === 'GREEN',
    rfOk: metrics.telecom.status === 'GREEN',
  };

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
        className="h-[305px] w-full max-w-[540px] sm:h-[350px]"
      >
        <defs>
          <filter id="holoGlow">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
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

        {/* Base Projection Rings */}
        <ellipse
          cx="250"
          cy="292"
          rx="125"
          ry="24"
          fill="none"
          stroke="#5FF3FF"
          strokeOpacity="0.22"
          strokeDasharray="3 4"
          strokeWidth="1"
        />
        <ellipse
          cx="250"
          cy="292"
          rx="76"
          ry="15"
          fill="none"
          stroke="#5FF3FF"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        {/* STAGE 01: COCKTAIL NAPKIN SKETCH WITH CDS RAILS & AXES */}
        {phase === 'CML_1' ? (
          <g filter="url(#holoGlow)">
            {/* Body Axes (+Z up, +X right, +Y diagonal) */}
            <line x1="250" y1="275" x2="250" y2="42" stroke="#5FF3FF" strokeOpacity="0.35" strokeDasharray="3 3" />
            <text x="255" y="48" className="font-mono text-[8.5px]" fill="#5FF3FF">+Z AXIS</text>
            <line x1="125" y1="175" x2="375" y2="175" stroke="#5FF3FF" strokeOpacity="0.28" strokeDasharray="3 3" />
            <text x="360" y="170" className="font-mono text-[8.5px]" fill="#5FF3FF">+X</text>
            <line x1="185" y1="215" x2="315" y2="135" stroke="#5FF3FF" strokeOpacity="0.25" strokeDasharray="3 3" />
            <text x="318" y="138" className="font-mono text-[8.5px]" fill="#5FF3FF">+Y</text>

            {/* Sketch Wireframe Chassis with 4 Corner Guide Rails & >=6.5mm Standoffs */}
            <polygon
              points={`250,${topY - 22} 296,${topY} 250,${topY + 22} 204,${topY}`}
              fill="#5FF3FF08"
              stroke={strokeMain}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <polygon
              points={`204,${topY} 250,${topY + 22} 250,${botY + 22} 204,${botY}`}
              fill="#5FF3FF05"
              stroke={strokeMain}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <polygon
              points={`296,${topY} 250,${topY + 22} 250,${botY + 22} 296,${botY}`}
              fill="#5FF3FF05"
              stroke={strokeMain}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            {/* Highlighted 4 Longitudinal Corner Rails */}
            {[204, 250, 296].map((rxPos, i) => (
              <line
                key={`rail-${i}`}
                x1={rxPos}
                y1={topY + (i === 1 ? 22 : 0) - 6}
                x2={rxPos}
                y2={botY + (i === 1 ? 22 : 0) + 6}
                stroke="#FFC15E"
                strokeWidth="2"
              />
            ))}
            {/* -Z Cylindrical Tuna Can Volume (Ø64 x 36 mm) */}
            <ellipse
              cx="250"
              cy={botY + 22}
              rx="22"
              ry="8"
              fill="none"
              stroke="#FFC15E"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <path
              d={`M 228,${botY + 22} L 228,${botY + 42} A 22 8 0 0 0 272,${botY + 42} L 272,${botY + 22}`}
              fill="#FFC15E0C"
              stroke="#FFC15E"
              strokeWidth="1"
            />
            {/* Payload Sensor FOV Cone */}
            <polygon
              points={`250,${topY} 214,62 286,62`}
              fill="#FFC15E10"
              stroke="#FFC15E"
              strokeOpacity="0.65"
              strokeDasharray="3 2"
              strokeWidth="1"
            />
            <g className="font-mono text-[8.5px]" fill="#FFC15E">
              <text x="250" y="56" textAnchor="middle">
                {isEs ? 'CONO DE VISIÓN (FOV)' : 'PAYLOAD FOV CONE'}
              </text>
              <line x1="308" y1={topY} x2="352" y2={topY} stroke="#FFC15E" strokeOpacity="0.6" />
              <text x="357" y={topY + 3}>±Z STANDOFF ≥6.5 mm</text>
              <line x1="274" y1={botY + 35} x2="345" y2={botY + 35} stroke="#FFC15E" strokeOpacity="0.6" />
              <text x="350" y={botY + 38}>TUNA CAN Ø64×36 mm</text>
              <text x="86" y="170" fill="#5FF3FF">
                1U RAIL: 100×100 mm
              </text>
            </g>
          </g>
        ) : (
          /* STAGES 03 & 05: REAL PLATFORM MORPHOLOGY + SSRI SUBSYSTEMS */
          <g>
            {/* Solar Wings / RTG deployed around bus */}
            {hasWing && (
              <motion.g
                key={selection.epsId}
                initial={reducedMotion ? false : { opacity: 0, scaleX: 0.25 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: dur }}
                style={{ originX: '250px', originY: '172px' }}
                filter="url(#holoGlow)"
              >
                <polygon
                  points={`198,158 ${hasMegaWing ? 62 : hasLiltWing ? 96 : 114},136 ${hasMegaWing ? 62 : hasLiltWing ? 96 : 114},194 198,186`}
                  fill={isPowerAlarm ? '#FF4D6D14' : '#5FF3FF10'}
                  stroke={isPowerAlarm ? '#FF4D6D' : '#5FF3FF'}
                  strokeWidth="1.1"
                />
                <polygon
                  points={`302,158 ${hasMegaWing ? 438 : hasLiltWing ? 404 : 386},136 ${hasMegaWing ? 438 : hasLiltWing ? 404 : 386},194 302,186`}
                  fill={isPowerAlarm ? '#FF4D6D14' : '#5FF3FF10'}
                  stroke={isPowerAlarm ? '#FF4D6D' : '#5FF3FF'}
                  strokeWidth="1.1"
                />
                {[0.25, 0.5, 0.75].map((f) => {
                  const span = hasMegaWing ? 136 : hasLiltWing ? 102 : 84;
                  const xl = 198 - span * f;
                  const xr = 302 + span * f;
                  return (
                    <g key={`wing-cell-${f}`} stroke="#5FF3FF" strokeOpacity="0.35" strokeWidth="0.7">
                      <line x1={xl} y1={152 - f * 12} x2={xl} y2={190 + f * 3} />
                      <line x1={xr} y1={152 - f * 12} x2={xr} y2={190 + f * 3} />
                    </g>
                  );
                })}
              </motion.g>
            )}

            {hasRTG && (
              <motion.g
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: dur }}
                filter="url(#holoGlow)"
              >
                <polygon points="200,185 138,205 138,225 200,209" fill="#FFC15E15" stroke="#FFC15E" strokeWidth="1.1" />
                <polygon points="300,185 362,205 362,225 300,209" fill="#FFC15E15" stroke="#FFC15E" strokeWidth="1.1" />
                <line x1="148" y1="202" x2="188" y2="213" stroke="#FFC15E" strokeWidth="0.8" />
                <line x1="352" y1="202" x2="312" y2="213" stroke="#FFC15E" strokeWidth="0.8" />
              </motion.g>
            )}

            {/* ARCH 1: JWST / CSA FGS — 5-Layer Rhomboid Sunshield (21.2x14.2m) + Hexagonal OTE Ø6.5m */}
            {isJwstArch ? (
              <g filter="url(#holoGlow)">
                {/* 5-Layer Diamond Sunshield */}
                {[0, 1, 2, 3, 4].map((layer) => {
                  const dy = layer * 7;
                  const shrink = layer * 6;
                  return (
                    <polygon
                      key={`jwst-shield-${layer}`}
                      points={`250,${180 + dy} ${375 - shrink},${210 + dy} 250,${242 + dy} ${125 + shrink},${210 + dy}`}
                      fill={layer >= 3 ? '#FFC15E0C' : '#5FF3FF0A'}
                      stroke={layer >= 3 ? '#FFC15E' : '#5FF3FF'}
                      strokeOpacity={0.95 - layer * 0.14}
                      strokeWidth="1.1"
                    />
                  );
                })}
                {/* Segmented Gold Hexagonal Primary Mirror (OTE Ø6.5m) */}
                {[
                  [250, 108],
                  [232, 118],
                  [268, 118],
                  [232, 138],
                  [268, 138],
                  [250, 148],
                  [250, 128],
                ].map(([hx, hy], idx) => (
                  <polygon
                    key={`hex-${idx}`}
                    points={`${hx},${hy - 10} ${hx + 9},${hy - 5} ${hx + 9},${hy + 5} ${hx},${hy + 10} ${hx - 9},${hy + 5} ${hx - 9},${hy - 5}`}
                    fill="#FFC15E18"
                    stroke="#FFC15E"
                    strokeWidth="1.1"
                  />
                ))}
                {/* Aft ISIM + CSA Fine Guidance Sensor Housing */}
                <rect
                  x="234"
                  y="156"
                  width="32"
                  height="20"
                  fill="#5FF3FF14"
                  stroke="#5FF3FF"
                  strokeWidth="1"
                />
                {/* Secondary Mirror Tripod Struts */}
                <line x1="250" y1="98" x2="250" y2="56" stroke="#FFC15E" strokeWidth="1" />
                <line x1="226" y1="140" x2="250" y2="56" stroke="#5FF3FF" strokeWidth="0.9" />
                <line x1="274" y1="140" x2="250" y2="56" stroke="#5FF3FF" strokeWidth="0.9" />
                <circle cx="250" cy="56" r="4.5" fill="none" stroke="#FFC15E" strokeWidth="1.2" />

                <g className="font-mono text-[8px]">
                  <text x="112" y="198" fill="#5FF3FF">CRYO SIDE (&lt;50 K)</text>
                  <text x="112" y="255" fill="#FFC15E">SUNSHIELD 21.2×14.2 m (+85°C)</text>
                  <text x="292" y="124" fill="#FFC15E">OTE Ø6.5 m (18 HEX)</text>
                  <text x="292" y="168" fill="#5FF3FF">CSA FGS / ISIM · 16 Hz</text>
                </g>
              </g>
            ) : isTracersArch ? (
              /* ARCH 2: NASA TRACERS — Symmetric Octagonal Bus (Ø1.32x0.95m) + 4 EFI Wire Booms + MAG Boom */
              <g filter="url(#holoGlow)">
                {/* 4 Radial Electric Field Instrument (EFI) Wire Booms */}
                <line x1="72" y1="172" x2="205" y2="172" stroke="#FFC15E" strokeDasharray="4 2" strokeWidth="1.1" />
                <line x1="295" y1="172" x2="428" y2="172" stroke="#FFC15E" strokeDasharray="4 2" strokeWidth="1.1" />
                <line x1="150" y1="112" x2="215" y2="148" stroke="#FFC15E" strokeDasharray="4 2" strokeWidth="1" />
                <line x1="350" y1="232" x2="285" y2="196" stroke="#FFC15E" strokeDasharray="4 2" strokeWidth="1" />
                {[
                  [72, 172],
                  [428, 172],
                  [150, 112],
                  [350, 232],
                ].map(([bx, by], idx) => (
                  <circle key={`efi-${idx}`} cx={bx} cy={by} r="3.5" fill="#FFC15E" />
                ))}

                {/* Octagonal Prism Body */}
                <polygon
                  points="226,128 274,128 296,150 296,194 274,216 226,216 204,194 204,150"
                  fill={
                    thermal?.id === 'therm-silver-fep'
                      ? 'url(#fepHatch)'
                      : '#5FF3FF10'
                  }
                  stroke={strokeMain}
                  strokeWidth="1.3"
                />
                <line x1="226" y1="128" x2="226" y2="216" stroke={strokeMain} strokeOpacity="0.45" />
                <line x1="274" y1="128" x2="274" y2="216" stroke={strokeMain} strokeOpacity="0.45" />
                <line x1="204" y1="172" x2="296" y2="172" stroke={strokeMain} strokeOpacity="0.4" />

                {/* Axial Magnetometer Boom (MAG Boom) */}
                <line x1="250" y1="128" x2="250" y2="62" stroke="#5FF3FF" strokeWidth="1.5" />
                <rect x="242" y="50" width="16" height="12" fill="#04080F" stroke="#FFC15E" strokeWidth="1.1" />

                <g className="font-mono text-[8px]">
                  <text x="272" y="59" fill="#FFC15E">FLUXGATE MAG BOOM</text>
                  <text x="58" y="160" fill="#FFC15E">EFI WIRE BOOMS (10 RPM)</text>
                  <text x="305" y="138" fill="#5FF3FF">OCTAGONAL Ø1.32×0.95 m</text>
                </g>
              </g>
            ) : isMroArch ? (
              /* ARCH 3: MRO CLASS — Box Bus (3.0x2.1x2.1m) + Ø3.0m Gimbaled HGA + 10m SHARAD Boom */
              <g filter="url(#holoGlow)">
                <polygon
                  points="250,115 302,138 250,161 198,138"
                  fill="#5FF3FF12"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                <polygon
                  points="198,138 250,161 250,224 198,201"
                  fill="#5FF3FF0A"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                <polygon
                  points="302,138 250,161 250,224 302,201"
                  fill="#5FF3FF08"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                {/* Ø3.0m Parabolic High-Gain Dish on Gimbal Mast */}
                <line x1="250" y1="138" x2="250" y2="96" stroke="#5FF3FF" strokeWidth="1.5" />
                <ellipse
                  cx="250"
                  cy="86"
                  rx="42"
                  ry="14"
                  fill="#5FF3FF12"
                  stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'}
                  strokeWidth="1.3"
                />
                <line x1="250" y1="86" x2="250" y2="68" stroke="#FFC15E" strokeWidth="1.2" />
                <circle cx="250" cy="68" r="3" fill="#FFC15E" />
                {/* 10.0m SHARAD Dielectric Dipole Boom */}
                <line x1="120" y1="234" x2="380" y2="234" stroke="#FFC15E" strokeWidth="1.8" />
                <line x1="250" y1="224" x2="250" y2="234" stroke="#FFC15E" strokeWidth="1.2" />
                <g className="font-mono text-[8px]">
                  <text x="300" y="84" fill="#5FF3FF">HGA DISH Ø3.0 m</text>
                  <text x="292" y="248" fill="#FFC15E">SHARAD SAR BOOM 10.0 m</text>
                </g>
              </g>
            ) : (
              /* ARCH 4: STANDARD CUBESAT CDS (1.5U/2U/3U) OR LUNAR TRAILBLAZER BOX BUS */
              <motion.g
                key={cubesatFormFactor}
                initial={reducedMotion ? false : { opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: dur }}
                filter="url(#holoGlow)"
              >
                <polygon
                  points={`250,${topY - 22} 296,${topY} 250,${topY + 22} 204,${topY}`}
                  fill="#5FF3FF0E"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                <polygon
                  points={`204,${topY} 250,${topY + 22} 250,${botY + 22} 204,${botY}`}
                  fill={
                    thermal?.id === 'therm-silver-fep'
                      ? 'url(#fepHatch)'
                      : '#5FF3FF08'
                  }
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                <polygon
                  points={`296,${topY} 250,${topY + 22} 250,${botY + 22} 296,${botY}`}
                  fill="#5FF3FF08"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                <line
                  x1="250"
                  y1={topY + 22}
                  x2="250"
                  y2={botY + 22}
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                {/* Modular 1U stack dividers */}
                {Array.from({ length: units }).map((_, idx) => {
                  const segY = topY + ((idx + 1) * (botY - topY)) / (units + 1);
                  return (
                    <polyline
                      key={`u-div-${idx}`}
                      points={`204,${segY} 250,${segY + 22} 296,${segY}`}
                      fill="none"
                      stroke={strokeMain}
                      strokeOpacity="0.6"
                      strokeWidth="0.9"
                    />
                  );
                })}
                {/* CDS Standoff Rail Highlights */}
                <circle cx="204" cy={topY} r="2.2" fill="#FFC15E" />
                <circle cx="296" cy={topY} r="2.2" fill="#FFC15E" />
                <circle cx="204" cy={botY} r="2.2" fill="#FFC15E" />
                <circle cx="296" cy={botY} r="2.2" fill="#FFC15E" />
              </motion.g>
            )}

            {/* SSRI SoA SUBSYSTEM WIREFRAME OVERLAYS */}

            {/* 1. THERMAL HARDWARE: Redwire Q-Store PCM Honeycomb Plate or Silvered FEP Badge */}
            {thermal?.id === 'therm-redwire-pcm' && (
              <g filter="url(#holoGlow)">
                <rect x="206" y="150" width="22" height="32" fill="#FFC15E14" stroke="#FFC15E" strokeWidth="1" />
                <circle cx="217" cy="160" r="3" fill="none" stroke="#FFC15E" strokeWidth="0.8" />
                <circle cx="217" cy="171" r="3" fill="none" stroke="#FFC15E" strokeWidth="0.8" />
                <text x="115" y="132" className="font-mono text-[8px]" fill="#FFC15E">
                  Q-STORE PCM 0.5U (28°C)
                </text>
              </g>
            )}

            {/* 2. ADCS STAR TRACKER: Arcsec Sagitta Stepped Optical Baffle */}
            {(adcs?.id === 'adcs-sagitta-star' || adcs?.id === 'adcs-3axis') && (
              <g filter="url(#holoGlow)">
                <polygon
                  points="296,154 320,142 324,154 296,164"
                  fill="#04080F"
                  stroke="#5FF3FF"
                  strokeWidth="1.1"
                />
                <ellipse cx="322" cy="148" rx="3" ry="6" fill="none" stroke="#FFC15E" strokeWidth="1" />
                <text x="328" y="145" className="font-mono text-[7.5px]" fill="#5FF3FF">
                  {adcs.id === 'adcs-sagitta-star'
                    ? 'SAGITTA Ø25mm (0.0017°)'
                    : 'STAR TRACKER 0.02°'}
                </text>
              </g>
            )}

            {/* 3. TELECOM HARDWARE: CubeLCT 1550nm Laser FSM Head vs X/Ka Dish vs UHF Dipole */}
            {(telecom?.id === 'telecom-cubelct-laser' ||
              telecom?.id === 'telecom-laser') && (
              <g filter="url(#holoGlow)">
                <rect x="239" y="84" width="22" height="14" fill="#04080F" stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'} strokeWidth="1.1" />
                <circle cx="250" cy="91" r="4" fill="none" stroke="#FFC15E" strokeWidth="1" />
                <line x1="250" y1="84" x2="250" y2="38" stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'} strokeDasharray="4 2" strokeWidth="1.4" />
                <text x="268" y="82" className="font-mono text-[7.5px]" fill="#5FF3FF">
                  1550nm FSM Ø20mm ({telecom.id === 'telecom-cubelct-laser' ? '0.3U' : 'LASER'})
                </text>
              </g>
            )}
            {telecom?.id === 'telecom-xka' && !isMroArch && !isJwstArch && (
              <g filter="url(#holoGlow)">
                <path
                  d={`M 232,${topY - 20} Q 250,${topY - 40} 268,${topY - 20}`}
                  fill="none"
                  stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'}
                  strokeWidth="1.3"
                />
                <line x1="250" y1={topY - 30} x2="250" y2={topY - 44} stroke="#FFC15E" strokeWidth="1" />
              </g>
            )}
            {telecom?.id === 'telecom-uhf' && !isJwstArch && (
              <g>
                <line x1="238" y1={topY - 12} x2="218" y2={topY - 38} stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'} strokeWidth="1.1" />
                <line x1="262" y1={topY - 12} x2="282" y2={topY - 38} stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'} strokeWidth="1.1" />
              </g>
            )}

            {/* 4. PROPULSION HARDWARE: ThrustMe NPT30-I2 vs FPPT-1.7 vs Hall vs Chemical Bell */}
            {prop?.id === 'prop-thrustme-npt30' ? (
              <g filter="url(#holoGlow)">
                <rect x="234" y="232" width="32" height="22" fill="#04080F" stroke="#5FF3FF" strokeWidth="1.1" />
                <circle cx="250" cy="243" r="7" fill="none" stroke="#FFC15E" strokeWidth="1" />
                <circle cx="250" cy="243" r="3.5" fill="none" stroke="#5FF3FF" strokeWidth="0.9" />
                <line x1="246" y1="254" x2="244" y2="274" stroke="#5FF3FF" strokeDasharray="2 2" />
                <line x1="254" y1="254" x2="256" y2="274" stroke="#5FF3FF" strokeDasharray="2 2" />
                <text x="272" y="246" className="font-mono text-[7.5px]" fill="#FFC15E">
                  NPT30-I2 1U · GRID Ø60mm
                </text>
              </g>
            ) : prop?.id === 'prop-fppt-17' ? (
              <g filter="url(#holoGlow)">
                <rect x="233" y="230" width="34" height="26" fill="#04080F" stroke="#5FF3FF" strokeWidth="1.1" />
                <ellipse cx="250" cy="242" rx="9" ry="5" fill="none" stroke="#FFC15E" strokeDasharray="2 1" strokeWidth="1" />
                <polygon points="244,256 256,256 260,268 240,268" fill="none" stroke="#FFC15E" strokeWidth="1" />
                <text x="272" y="248" className="font-mono text-[7.5px]" fill="#FFC15E">
                  FPPT 1.7U · PTFE SPOOL (3200s)
                </text>
              </g>
            ) : (
              <g>
                <polygon
                  points={`240,${botY + 20} 260,${botY + 20} 268,${botY + 38} 232,${botY + 38}`}
                  fill="none"
                  stroke="#5FF3FF"
                  strokeWidth="1.1"
                />
                {prop?.propulsionType === 'ELECTRIC_HALL' && (
                  <ellipse cx="250" cy={botY + 38} rx="14" ry="4" fill="none" stroke="#FFC15E" strokeWidth="1" />
                )}
              </g>
            )}

            {/* Telemetry Summary Callouts */}
            <g className="font-mono text-[8.5px]" fill="#FFC15E">
              <text x="22" y="274">
                {eps?.isRTG ? 'RTG' : 'EPS'}: {metrics.power.generatedAtDestination_W.toFixed(0)}W ({metrics.power.marginPercent.toFixed(0)}%)
              </text>
              <text x="478" y="274" textAnchor="end" fill="#5FF3FF">
                {isEs ? 'VOLUMEN:' : 'VOL:'} {metrics.volume.used_U.toFixed(1)}U / {metrics.volume.maxFairing_U}U
              </text>
              <text x="250" y="330" textAnchor="middle" fill="#5FF3FF" opacity="0.9">
                {isEs ? 'MASA HÚMEDA' : 'WET MASS'} {metrics.wetMass_kg.toFixed(1)} KG · ISP {prop?.isp_s ?? 68} S · {telecom?.freqGHz ?? 0.4} GHZ
              </text>
            </g>
          </g>
        )}

        {/* LEVEL 05: LASER SCAN & 4 CAD INSPECTION PINS (NASA-STD-5001B / GSFC-STD-1000) */}
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
            const isOk = pin.ok(pinContext);
            const active = selectedPin === pin.id;
            const color = isOk ? '#5FF3FF' : '#FFC15E';
            return (
              <g
                key={pin.id}
                onClick={() => {
                  setSelectedPin(pin.id);
                  playHoloTone('STEP', soundEnabled);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={active ? 10 : 7.5}
                  fill="#04080F"
                  stroke={color}
                  strokeWidth={active ? 2 : 1.2}
                />
                <circle cx={pin.x} cy={pin.y} r="2.8" fill={color} />
                <text
                  x={pin.x + 12}
                  y={pin.y + 3}
                  className="font-mono text-[8.5px]"
                  fill={color}
                  fontWeight={active ? 'bold' : 'normal'}
                >
                  {pin.shortLabel[language]} {isOk ? '✓' : '!'}
                </text>
              </g>
            );
          })}
      </svg>

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
