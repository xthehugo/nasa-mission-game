import { useEffect, useMemo, useRef, useState } from 'react';
import { findDestinationById, findGroundStationById } from '../engine';
import { useMissionStore } from '../store';

type EccentricityRegime = 0 | 0.25 | 0.55;

const BODY_CONFIG: Record<
  string,
  { muKm3S2: number; radiusKm: number; accent: string; secondary: string; badge: string }
> = {
  'dest-leo': {
    muKm3S2: 398600.44,
    radiusKm: 6371,
    accent: '#5FF3FF',
    secondary: '#38bdf8',
    badge: 'EARTH · LEO',
  },
  'dest-geo': {
    muKm3S2: 398600.44,
    radiusKm: 6371,
    accent: '#5FF3FF',
    secondary: '#38bdf8',
    badge: 'EARTH · GEO',
  },
  'dest-l2': {
    muKm3S2: 398600.44,
    radiusKm: 6371,
    accent: '#5FF3FF',
    secondary: '#FFC15E',
    badge: 'SUN-EARTH L2',
  },
  'dest-moon': {
    muKm3S2: 4902.8,
    radiusKm: 1737.4,
    accent: '#cbd5e1',
    secondary: '#94a3b8',
    badge: 'LUNA · POLAR',
  },
  'dest-mars': {
    muKm3S2: 42828.37,
    radiusKm: 3389.5,
    accent: '#fb923c',
    secondary: '#fdba74',
    badge: 'MARS · AREOCENTRIC',
  },
  'dest-jupiter': {
    muKm3S2: 126686534,
    radiusKm: 69911,
    accent: '#f59e0b',
    secondary: '#fde68a',
    badge: 'JUPITER · 5.2 AU',
  },
};

const CX = 250;
const CY = 150;
const BODY_R = 44;
const CAM_AZ = (16 * Math.PI) / 180;
const CAM_EL = (22 * Math.PI) / 180;
const ARG_PERIGEE = (26 * Math.PI) / 180;

interface OrbitPoint3D {
  sx: number;
  sy: number;
  depth: number;
  xWorld: number;
  yWorld: number;
  zWorld: number;
}

function projectOrbitalPoint(
  rPx: number,
  uAngleRad: number,
  inclinationRad: number,
): OrbitPoint3D {
  const xOrb = rPx * Math.cos(uAngleRad);
  const yOrb = rPx * Math.sin(uAngleRad);

  const xWorld = xOrb;
  const yWorld = yOrb * Math.cos(inclinationRad);
  const zWorld = yOrb * Math.sin(inclinationRad);

  const x1 = xWorld * Math.cos(CAM_AZ) - yWorld * Math.sin(CAM_AZ);
  const y1 = xWorld * Math.sin(CAM_AZ) + yWorld * Math.cos(CAM_AZ);
  const z1 = zWorld;

  const sx = CX + x1;
  const sy = CY + y1 * Math.sin(CAM_EL) - z1 * Math.cos(CAM_EL);
  const depth = y1 * Math.cos(CAM_EL) + z1 * Math.sin(CAM_EL);

  return { sx, sy, depth, xWorld, yWorld, zWorld };
}

function conicRadius(aPx: number, e: number, nu: number): number {
  return (aPx * (1 - e * e)) / Math.max(0.15, 1 + e * Math.cos(nu));
}

function splitDepthSegments(
  pts: OrbitPoint3D[],
  wantFront: boolean,
): string[] {
  const segments: string[] = [];
  let current: string[] = [];

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const inFront = p.depth >= 0 || Math.hypot(p.sx - CX, p.sy - CY) > BODY_R + 2;
    const keep = wantFront ? inFront : !inFront;
    if (keep) {
      current.push(`${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
    } else if (current.length > 0) {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
    }
  }
  if (current.length > 1) segments.push(current.join(' '));
  return segments;
}

export function HoloOrbitStage() {
  const {
    language,
    selection,
    metrics,
    orbitAltitudeKm,
    orbitInclinationDeg,
    reducedMotion,
  } = useMissionStore();

  const [thetaRad, setThetaRad] = useState<number>(0.55);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [eccentricity, setEccentricity] = useState<EccentricityRegime>(0);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showSwath, setShowSwath] = useState<boolean>(true);
  const [showNodes, setShowNodes] = useState<boolean>(true);

  const isEs = language === 'es';
  const dest = findDestinationById(selection.destinationId);
  const gs = findGroundStationById(selection.groundStationId);
  const isGeo = selection.destinationId === 'dest-geo';
  const isL2 = selection.destinationId === 'dest-l2';
  const isMoon = selection.destinationId === 'dest-moon';
  const isMars = selection.destinationId === 'dest-mars';
  const isJupiter = selection.destinationId === 'dest-jupiter';
  const body = BODY_CONFIG[selection.destinationId] ?? BODY_CONFIG['dest-leo'];

  // Real Keplerian Orbital Elements
  const rPeriKm = body.radiusKm + orbitAltitudeKm;
  const semiMajorKm = rPeriKm / Math.max(0.2, 1 - eccentricity);
  const periodMin =
    (2 * Math.PI * Math.sqrt(Math.pow(semiMajorKm, 3) / body.muKm3S2)) / 60;
  const rInstKm = conicRadius(semiMajorKm, eccentricity, thetaRad);
  const altInstKm = Math.max(40, rInstKm - body.radiusKm);
  const instVelocityKms = Math.sqrt(
    Math.max(0, body.muKm3S2 * (2 / rInstKm - 1 / semiMajorKm)),
  );
  const visualPeriodSec = isL2 ? 7.5 : Math.max(5.5, Math.min(13, periodMin / 28));

  const pausedRef = useRef<boolean>(isPaused);
  const eccRef = useRef<number>(eccentricity);
  const periodSecRef = useRef<number>(visualPeriodSec);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    eccRef.current = eccentricity;
  }, [eccentricity]);

  useEffect(() => {
    periodSecRef.current = visualPeriodSec;
  }, [visualPeriodSec]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!pausedRef.current) {
        setThetaRad((prev) => {
          const e = eccRef.current;
          const meanOmega = (2 * Math.PI) / periodSecRef.current;
          // Kepler 2nd Law: equal areas in equal times -> faster at periapsis
          const keplerFactor =
            Math.pow(1 + e * Math.cos(prev), 2) / Math.pow(Math.max(0.25, 1 - e * e), 1.5);
          const next = prev + meanOmega * Math.min(3.2, Math.max(0.35, keplerFactor)) * dt;
          return next >= Math.PI * 2 ? next - Math.PI * 2 : next;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const normRadius = Math.min(1, Math.log10(Math.max(100, orbitAltitudeKm) / 90) / 2.6);
  const rawRx = 88 + normRadius * 108;
  const maxApogeePx = 210;
  const minPerigeePx = BODY_R + 22;
  const semiMajorPx = Math.min(
    maxApogeePx / (1 + eccentricity),
    Math.max(minPerigeePx / Math.max(0.35, 1 - eccentricity), rawRx),
  );
  const incRad = ((isGeo ? 2.5 : orbitInclinationDeg) * Math.PI) / 180;
  const rfAlert = metrics.telecom.status === 'RED';

  // Sample 96 points around the orbit for crisp 3D front/back occlusion
  const { frontArcs, backArcs, equaPoints, satPoint, trailPoints, headingDeg, pePoint, apPoint, anPoint, dnPoint, hohmannArcPoints, toiPoint, goiPoint } =
    useMemo(() => {
      const steps = 96;
      const orbPts: OrbitPoint3D[] = [];
      const eqPts: OrbitPoint3D[] = [];

      for (let i = 0; i <= steps; i++) {
        const nu = (i / steps) * Math.PI * 2;
        const r = conicRadius(semiMajorPx, eccentricity, nu);
        orbPts.push(projectOrbitalPoint(r, nu + ARG_PERIGEE, incRad));
        eqPts.push(projectOrbitalPoint(BODY_R + 46, nu, 0));
      }

      const satR = conicRadius(semiMajorPx, eccentricity, thetaRad);
      const sat = projectOrbitalPoint(satR, thetaRad + ARG_PERIGEE, incRad);
      const satNextR = conicRadius(semiMajorPx, eccentricity, thetaRad + 0.04);
      const satNext = projectOrbitalPoint(satNextR, thetaRad + 0.04 + ARG_PERIGEE, incRad);
      const hdDeg = (Math.atan2(satNext.sy - sat.sy, satNext.sx - sat.sx) * 180) / Math.PI;

      const trail: OrbitPoint3D[] = [];
      for (let k = 1; k <= 18; k++) {
        const nuT = thetaRad - k * 0.055;
        const rT = conicRadius(semiMajorPx, eccentricity, nuT);
        trail.push(projectOrbitalPoint(rT, nuT + ARG_PERIGEE, incRad));
      }

      // Apsides & Nodes
      const pe = projectOrbitalPoint(semiMajorPx * (1 - eccentricity), ARG_PERIGEE, incRad);
      const ap = projectOrbitalPoint(semiMajorPx * (1 + eccentricity), Math.PI + ARG_PERIGEE, incRad);
      // Ascending & Descending nodes where argument of latitude u = 0 and PI (u = nu + ARG_PERIGEE)
      const nuAN = -ARG_PERIGEE;
      const nuDN = Math.PI - ARG_PERIGEE;
      const an = projectOrbitalPoint(conicRadius(semiMajorPx, eccentricity, nuAN), 0, incRad);
      const dn = projectOrbitalPoint(conicRadius(semiMajorPx, eccentricity, nuDN), Math.PI, incRad);

      // GMAT R2026a Hohmann transfer arc (LEO -> GEO)
      const rLeoPx = 70;
      const hPts: string[] = [];
      for (let j = 0; j <= 32; j++) {
        const th = (j / 32) * Math.PI;
        const aH = (rLeoPx + semiMajorPx) / 2;
        const eH = (semiMajorPx - rLeoPx) / (semiMajorPx + rLeoPx);
        const rH = conicRadius(aH, eH, th);
        const ptH = projectOrbitalPoint(rH, th + ARG_PERIGEE, incRad);
        hPts.push(`${ptH.sx.toFixed(1)},${ptH.sy.toFixed(1)}`);
      }
      const toi = projectOrbitalPoint(rLeoPx, ARG_PERIGEE, incRad);
      const goi = projectOrbitalPoint(semiMajorPx, Math.PI + ARG_PERIGEE, incRad);

      return {
        frontArcs: splitDepthSegments(orbPts, true),
        backArcs: splitDepthSegments(orbPts, false),
        equaPoints: eqPts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' '),
        satPoint: sat,
        trailPoints: trail,
        headingDeg: hdDeg,
        pePoint: pe,
        apPoint: ap,
        anPoint: an,
        dnPoint: dn,
        hohmannArcPoints: hPts.join(' '),
        toiPoint: toi,
        goiPoint: goi,
      };
    }, [semiMajorPx, eccentricity, incRad, thetaRad]);

  // L2 Halo Spacecraft Kinematics (Lissajous ellipse centered at (365, 150))
  const l2X = 365 + 44 * Math.cos(thetaRad);
  const l2Y = 150 + 74 * Math.sin(thetaRad);
  const l2NextX = 365 + 44 * Math.cos(thetaRad + 0.04);
  const l2NextY = 150 + 74 * Math.sin(thetaRad + 0.04);
  const l2Heading = (Math.atan2(l2NextY - l2Y, l2NextX - l2X) * 180) / Math.PI;

  // Eclipse & Occlusion status (Sunlight from -X; Shadow cone along +X when eclipseFraction > 0)
  const inEclipse =
    !isL2 &&
    dest.eclipseFraction > 0 &&
    satPoint.xWorld > 0 &&
    Math.hypot(satPoint.yWorld, satPoint.zWorld) < BODY_R * 0.92;
  const satOcculted =
    !isL2 && satPoint.depth < 0 && Math.hypot(satPoint.sx - CX, satPoint.sy - CY) < BODY_R;

  // Ground Station dish anchored on sunlit front hemisphere
  const gsX = CX + 22;
  const gsY = CY + 24;
  const losBlocked = satOcculted;

  // Nadir & Velocity unit vectors in screen space
  const hdRad = (headingDeg * Math.PI) / 180;
  const vVecX = Math.cos(hdRad) * 32;
  const vVecY = Math.sin(hdRad) * 32;
  const radDx = CX - satPoint.sx;
  const radDy = CY - satPoint.sy;
  const radLen = Math.max(1, Math.hypot(radDx, radDy));
  const gVecX = (radDx / radLen) * 24;
  const gVecY = (radDy / radLen) * 24;
  const rimX = CX - (radDx / radLen) * BODY_R;
  const rimY = CY - (radDy / radLen) * BODY_R;

  // Swath left/right footprint rays near planet rim
  const perpX = -radDy / radLen;
  const perpY = radDx / radLen;
  const swathHalfW = Math.min(18, 6 + normRadius * 11);

  const trueAnomalyDeg = Math.round((thetaRad * 180) / Math.PI) % 360;

  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 500 320" className="h-[295px] w-full max-w-[560px] sm:h-[345px]">
        <defs>
          <filter id="orbitGlow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="eclipseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="swathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5FF3FF" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#5FF3FF" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {isL2 ? (
          /* SUN -> EARTH -> L2 LISSAJOUS HALO WITH ARTICULATED OBSERVATORY */
          <g filter="url(#orbitGlow)">
            <circle cx="58" cy="150" r="24" fill="#FFC15E1F" stroke="#FFC15E" strokeWidth="1.2" />
            <text x="58" y="190" textAnchor="middle" className="font-mono text-[8px]" fill="#FFC15E">
              SOL (1.01 AU)
            </text>
            <line x1="88" y1="150" x2="365" y2="150" stroke="#FFC15E" strokeOpacity="0.28" strokeDasharray="4 4" />

            {/* Earth + Umbra */}
            <polygon points="182,122 302,144 302,156 182,178" fill="#0f172a" opacity="0.72" />
            <circle cx="182" cy="150" r="25" fill="#04080F" stroke="#5FF3FF" strokeWidth="1.3" />
            <ellipse cx="182" cy="150" rx="25" ry="9" fill="none" stroke="#5FF3FF" strokeOpacity="0.45" />
            <text x="182" y="191" textAnchor="middle" className="font-mono text-[8px]" fill="#5FF3FF">
              {isEs ? 'TIERRA' : 'EARTH'}
            </text>

            <line x1="182" y1="112" x2="365" y2="112" stroke="#5FF3FF" strokeOpacity="0.35" />
            <text x="274" y="106" textAnchor="middle" className="font-mono text-[8px]" fill="#5FF3FF">
              1,500,000 KM (ANTI-SUN)
            </text>

            {/* Back & Front Halo Loop */}
            <ellipse
              cx="365"
              cy="150"
              rx="44"
              ry="74"
              fill="none"
              stroke="#5FF3FF"
              strokeWidth="1.4"
              strokeDasharray="5 3"
            />
            <circle cx="365" cy="150" r="3" fill="#FFC15E" />
            <text x="365" y="242" textAnchor="middle" className="font-mono text-[8px]" fill="#FFC15E">
              SE-L2 HALO · 0% ECLIPSE
            </text>

            {/* L2 Orbital Trail */}
            {Array.from({ length: 16 }, (_, k) => {
              const tL2 = thetaRad - k * 0.06;
              return (
                <circle
                  key={k}
                  cx={365 + 44 * Math.cos(tL2)}
                  cy={150 + 74 * Math.sin(tL2)}
                  r={Math.max(0.8, 2.5 - k * 0.12)}
                  fill="#5FF3FF"
                  opacity={Math.max(0.08, 0.72 - k * 0.042)}
                />
              );
            })}

            {/* Live RF/Optical Beam Earth DSN -> L2 Observatory */}
            <line
              x1="196"
              y1="142"
              x2={l2X}
              y2={l2Y}
              stroke={rfAlert ? '#FF4D6D' : '#FFC15E'}
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* JWST-Style Articulated Observatory on L2 Halo */}
            <g transform={`translate(${l2X}, ${l2Y}) rotate(${l2Heading * 0.15})`}>
              {/* 5-Layer Sunshield always shielding Sun-side (-X) */}
              <polygon points="-7,-11 -2,0 -7,11 -11,8 -11,-8" fill="#5FF3FF" fillOpacity="0.24" stroke="#5FF3FF" strokeWidth="1" />
              <line x1="-9" y1="-8" x2="-9" y2="8" stroke="#FFC15E" strokeWidth="1.1" />
              {/* Cryogenic Primary Mirror Hexagon & Boom */}
              <polygon points="1,-5 6,-3 6,3 1,5 -1,0" fill="#FFC15E" fillOpacity="0.85" stroke="#fff" strokeWidth="0.7" />
              <line x1="4" y1="0" x2="10" y2="0" stroke="#5FF3FF" strokeWidth="1" />
              <circle cx="10" cy="0" r="1.4" fill="#5FF3FF" />
            </g>
          </g>
        ) : (
          /* FULL 3D KEPLERIAN ORBIT + BODY MORPHOLOGY + ARTICULATED SPACECRAFT */
          <g>
            {/* Reference Sunlight Direction & Planetary Umbra / Eclipse Cone */}
            <line x1="16" y1={CY} x2={CX - BODY_R - 8} y2={CY} stroke="#FFC15E" strokeOpacity="0.22" strokeDasharray="3 4" />
            <text x="36" y={CY - 8} className="font-mono text-[7px]" fill="#FFC15E" fillOpacity="0.7">
              [SOL] SOLAR FLUX
            </text>
            {dest.eclipseFraction > 0 && (
              <g>
                <polygon
                  points={`${CX},${CY - BODY_R * 0.92} ${CX + 215},${CY - BODY_R * 0.85} ${CX + 215},${CY + BODY_R * 0.85} ${CX},${CY + BODY_R * 0.92}`}
                  fill="url(#eclipseGrad)"
                />
                <text x={CX + 128} y={CY + 3} textAnchor="middle" className="font-mono text-[7px]" fill="#64748b">
                  {isEs ? 'CONO DE ECLIPSE' : 'UMBRA / ECLIPSE'}
                </text>
              </g>
            )}

            {/* Back Arc (Behind Planet Limb) */}
            {backArcs.map((pts, idx) => (
              <polyline
                key={`b-${idx}`}
                points={pts}
                fill="none"
                stroke={body.accent}
                strokeWidth="1.1"
                strokeOpacity="0.32"
                strokeDasharray="4 4"
              />
            ))}

            {/* Equatorial Reference Plane (0 deg) */}
            {showNodes && (
              <polyline
                points={equaPoints}
                fill="none"
                stroke="#64748b"
                strokeWidth="0.9"
                strokeOpacity="0.48"
                strokeDasharray="2 3"
              />
            )}

            {/* Spacecraft Behind Planet if Occulted */}
            {satOcculted && (
              <g opacity="0.32">
                <g transform={`translate(${satPoint.sx}, ${satPoint.sy}) rotate(${headingDeg})`}>
                  <rect x="-4" y="-3" width="8" height="6" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.8" />
                  <rect x="-2" y="-12" width="4" height="8" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="0.6" />
                  <rect x="-2" y="4" width="4" height="8" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="0.6" />
                </g>
              </g>
            )}

            {/* Destination-Specific Wireframe Planetary Sphere */}
            <g filter="url(#orbitGlow)">
              {/* Halo / Radiation Environment Ring */}
              {(isGeo || isJupiter) && (
                <ellipse
                  cx={CX}
                  cy={CY}
                  rx={BODY_R + (isJupiter ? 28 : 18)}
                  ry={(BODY_R + (isJupiter ? 28 : 18)) * 0.32}
                  fill="none"
                  stroke={isJupiter ? '#f59e0b' : '#FFC15E'}
                  strokeOpacity="0.35"
                  strokeWidth={isJupiter ? '4' : '2'}
                  strokeDasharray="3 4"
                />
              )}
              {isMars && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={BODY_R + 5}
                  fill="none"
                  stroke="#fb923c"
                  strokeOpacity="0.3"
                  strokeDasharray="2 2"
                />
              )}
              {!isMoon && !isMars && !isJupiter && (
                <circle cx={CX} cy={CY} r={BODY_R + 6} fill="none" stroke="#38bdf8" strokeOpacity="0.22" strokeWidth="4" />
              )}

              {/* Solid Occluding Core */}
              <circle cx={CX} cy={CY} r={BODY_R} fill="#040914" stroke={body.accent} strokeWidth="1.5" />

              {/* Body Surface Features */}
              {isJupiter ? (
                <>
                  <ellipse cx={CX} cy={CY - 14} rx={BODY_R - 3} ry="5" fill="#f59e0b" fillOpacity="0.22" stroke="#f59e0b" strokeOpacity="0.55" strokeWidth="0.8" />
                  <ellipse cx={CX} cy={CY} rx={BODY_R} ry="9" fill="none" stroke="#fde68a" strokeOpacity="0.65" strokeWidth="1" />
                  <ellipse cx={CX} cy={CY + 14} rx={BODY_R - 4} ry="6" fill="#fb923c" fillOpacity="0.2" stroke="#fb923c" strokeOpacity="0.5" strokeWidth="0.8" />
                  <circle cx={CX - 14} cy={CY + 11} r="4.5" fill="#ef4444" fillOpacity="0.65" stroke="#fca5a5" strokeWidth="0.7" />
                </>
              ) : isMoon ? (
                <>
                  <ellipse cx={CX} cy={CY} rx={BODY_R} ry="13" fill="none" stroke="#cbd5e1" strokeOpacity="0.35" />
                  <circle cx={CX - 13} cy={CY - 10} r="7" fill="#0f172a" stroke="#94a3b8" strokeOpacity="0.6" strokeWidth="0.9" />
                  <circle cx={CX + 11} cy={CY - 15} r="5" fill="#0f172a" stroke="#94a3b8" strokeOpacity="0.5" strokeWidth="0.8" />
                  <circle cx={CX} cy={CY + BODY_R - 4} r="5" fill="#38bdf8" fillOpacity="0.45" stroke="#5FF3FF" strokeWidth="0.9" />
                </>
              ) : (
                <>
                  <ellipse cx={CX} cy={CY} rx={BODY_R} ry="14" fill="none" stroke={body.accent} strokeOpacity="0.5" />
                  <ellipse cx={CX} cy={CY} rx={BODY_R} ry="28" fill="none" stroke={body.accent} strokeOpacity="0.28" />
                  <ellipse cx={CX} cy={CY} rx="17" ry={BODY_R} fill="none" stroke={body.accent} strokeOpacity="0.42" />
                  {isMars && (
                    <ellipse cx={CX} cy={CY - BODY_R + 4} rx="13" ry="3.5" fill="#f8fafc" fillOpacity="0.75" />
                  )}
                </>
              )}

              {/* Polar Spin Axis */}
              <line x1={CX} y1={CY - BODY_R - 12} x2={CX} y2={CY + BODY_R + 12} stroke={body.accent} strokeOpacity="0.38" strokeDasharray="2 3" />

              {/* Surface Ground Station / DSN Antenna */}
              <polygon
                points={`${gsX - 4},${gsY + 4} ${gsX + 4},${gsY + 4} ${gsX},${gsY - 3}`}
                fill="#04080F"
                stroke="#FFC15E"
                strokeWidth="1.1"
              />
            </g>

            {/* GMAT Hohmann Transfer Ellipse when GEO is selected */}
            {isGeo && (
              <g>
                <polyline
                  points={hohmannArcPoints}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                  opacity="0.9"
                />
                <circle cx={toiPoint.sx} cy={toiPoint.sy} r="3.8" fill="#f97316" />
                <text x={toiPoint.sx + 7} y={toiPoint.sy + 4} className="font-mono text-[7.5px]" fill="#FFC15E">
                  TOI +2,240 m/s
                </text>
                <circle cx={goiPoint.sx} cy={goiPoint.sy} r="3.8" fill="#22c55e" />
                <text x={goiPoint.sx - 6} y={goiPoint.sy - 7} textAnchor="end" className="font-mono text-[7.5px]" fill="#86efac">
                  GOI +1,433 m/s
                </text>
              </g>
            )}

            {/* Front Arc (In Front of Planet) */}
            {frontArcs.map((pts, idx) => (
              <polyline
                key={`f-${idx}`}
                points={pts}
                fill="none"
                stroke={body.accent}
                strokeWidth="1.5"
                strokeOpacity="0.92"
                filter="url(#orbitGlow)"
              />
            ))}

            {/* Keplerian Nodes & Apsides Markers (AN, DN, PE, AP) */}
            {showNodes && (
              <g className="font-mono text-[7.5px]">
                {/* Line of Nodes */}
                <line
                  x1={anPoint.sx}
                  y1={anPoint.sy}
                  x2={dnPoint.sx}
                  y2={dnPoint.sy}
                  stroke="#94a3b8"
                  strokeOpacity="0.32"
                  strokeDasharray="2 3"
                />
                <circle cx={anPoint.sx} cy={anPoint.sy} r="2.8" fill="#5FF3FF" />
                <text x={anPoint.sx + 6} y={anPoint.sy - 4} fill="#5FF3FF">
                  AN
                </text>
                <circle cx={dnPoint.sx} cy={dnPoint.sy} r="2.8" fill="#64748b" stroke="#94a3b8" />
                <text x={dnPoint.sx - 6} y={dnPoint.sy + 9} textAnchor="end" fill="#94a3b8">
                  DN
                </text>

                {/* Periapsis & Apoapsis */}
                <circle cx={pePoint.sx} cy={pePoint.sy} r="3.2" fill="#f97316" />
                <text x={pePoint.sx + 6} y={pePoint.sy + 9} fill="#fdba74">
                  PE
                </text>
                {eccentricity > 0 && (
                  <>
                    <circle cx={apPoint.sx} cy={apPoint.sy} r="3.2" fill="#a78bfa" />
                    <text x={apPoint.sx - 6} y={apPoint.sy - 5} textAnchor="end" fill="#c4b5fd">
                      AP
                    </text>
                  </>
                )}
              </g>
            )}

            {/* Dynamic RF / Optical Link Beam Tracking Live Spacecraft Position */}
            <line
              x1={gsX}
              y1={gsY - 3}
              x2={satPoint.sx}
              y2={satPoint.sy}
              stroke={losBlocked ? '#475569' : rfAlert ? '#FF4D6D' : '#FFC15E'}
              strokeWidth={losBlocked ? '0.9' : '1.2'}
              strokeOpacity={losBlocked ? '0.45' : '0.82'}
              strokeDasharray="3 3"
            />

            {/* Nadir Science Swath Cone */}
            {showSwath && !satOcculted && (
              <polygon
                points={`${satPoint.sx},${satPoint.sy} ${rimX + perpX * swathHalfW},${rimY + perpY * swathHalfW} ${rimX - perpX * swathHalfW},${rimY - perpY * swathHalfW}`}
                fill="url(#swathGrad)"
                stroke="#5FF3FF"
                strokeOpacity="0.28"
                strokeWidth="0.7"
              />
            )}

            {/* 18-Segment Orbital Ion/State Trail */}
            {trailPoints.map((pt, k) => {
              const hiddenTrail =
                pt.depth < 0 && Math.hypot(pt.sx - CX, pt.sy - CY) < BODY_R;
              return (
                <circle
                  key={k}
                  cx={pt.sx}
                  cy={pt.sy}
                  r={Math.max(0.7, 2.6 - k * 0.1)}
                  fill={inEclipse ? '#38bdf8' : eccentricity > 0 && k < 5 ? '#FFC15E' : body.accent}
                  opacity={Math.max(0.06, (hiddenTrail ? 0.25 : 0.78) - k * 0.04)}
                />
              );
            })}

            {/* Articulated Orbital Spacecraft (Front Render) */}
            {!satOcculted && (
              <g filter="url(#orbitGlow)">
                {/* Velocity Tangent & Gravity Nadir Vectors */}
                {showVectors && (
                  <g className="font-mono text-[7px]">
                    <line
                      x1={satPoint.sx}
                      y1={satPoint.sy}
                      x2={satPoint.sx + vVecX}
                      y2={satPoint.sy + vVecY}
                      stroke="#22c55e"
                      strokeWidth="1.4"
                    />
                    <circle cx={satPoint.sx + vVecX} cy={satPoint.sy + vVecY} r="2" fill="#22c55e" />
                    <text
                      x={satPoint.sx + vVecX + 4}
                      y={satPoint.sy + vVecY - 2}
                      fill="#86efac"
                    >
                      v {instVelocityKms.toFixed(1)}km/s
                    </text>

                    <line
                      x1={satPoint.sx}
                      y1={satPoint.sy}
                      x2={satPoint.sx + gVecX}
                      y2={satPoint.sy + gVecY}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </g>
                )}

                {/* Articulated Satellite Bus Oriented Tangent to Trajectory */}
                <g transform={`translate(${satPoint.sx}, ${satPoint.sy}) rotate(${headingDeg})`}>
                  {/* Exhaust thruster flare when near periapsis or high speed */}
                  {(eccentricity > 0 || Math.cos(thetaRad) > 0.72) && (
                    <polygon points="-6,-1.6 -13,0 -6,1.6" fill="#FFC15E" opacity="0.85" />
                  )}
                  {/* Left & Right Solar Wings */}
                  <rect
                    x="-2.5"
                    y="-15"
                    width="5"
                    height="10.5"
                    fill={inEclipse ? '#0f2942' : '#1d4ed8'}
                    stroke={inEclipse ? '#38bdf8' : '#93c5fd'}
                    strokeWidth="0.8"
                  />
                  <line x1="-2.5" y1="-10" x2="2.5" y2="-10" stroke="#93c5fd" strokeOpacity="0.6" strokeWidth="0.5" />
                  <rect
                    x="-2.5"
                    y="4.5"
                    width="5"
                    height="10.5"
                    fill={inEclipse ? '#0f2942' : '#1d4ed8'}
                    stroke={inEclipse ? '#38bdf8' : '#93c5fd'}
                    strokeWidth="0.8"
                  />
                  <line x1="-2.5" y1="10" x2="2.5" y2="10" stroke="#93c5fd" strokeOpacity="0.6" strokeWidth="0.5" />

                  {/* Spacecraft Core Chassis & HGA Dish */}
                  <polygon
                    points="6,0 3,-4 -5,-4 -5,4 3,4"
                    fill="#04080F"
                    stroke={inEclipse ? '#38bdf8' : '#FFC15E'}
                    strokeWidth="1.2"
                  />
                  <circle cx="0" cy="0" r="1.8" fill={inEclipse ? '#38bdf8' : '#FFC15E'} />
                  <circle cx="3.5" cy="0" r="1.2" fill="#5FF3FF" />
                </g>
              </g>
            )}

            {/* Inclination Readout Tag */}
            <text x="16" y="24" className="font-mono text-[8px]" fill="#5FF3FF">
              {body.badge} · i = {orbitInclinationDeg.toFixed(1)}° · e = {eccentricity.toFixed(2)}
            </text>
            <text
              x="484"
              y="24"
              textAnchor="end"
              className="font-mono text-[8px]"
              fill={inEclipse ? '#38bdf8' : losBlocked ? '#f87171' : '#86efac'}
            >
              {inEclipse
                ? '● ECLIPSE'
                : losBlocked
                  ? isEs
                    ? '[RF] OCULTACIÓN LIMBO'
                    : '[RF] LIMB OCCULTED'
                  : isEs
                    ? '☼ SOL · LOS ACTIVO'
                    : '☼ SUNLIT · LOS LOCKED'}
            </text>
          </g>
        )}

        {/* Bottom Telemetry Summary */}
        <g className="font-mono text-[9px]" fill="#5FF3FF">
          <text x="250" y="294" textAnchor="middle">
            {dest.name[language].toUpperCase()} · {gs.name[language].toUpperCase()}
          </text>
          <text x="250" y="310" textAnchor="middle" fill={rfAlert ? '#FF4D6D' : '#FFC15E'}>
            {isL2
              ? `SE-L2 HALO · SUNSHIELD +85°C/<50K · τ 5.0S · ΔV ${dest.requiredDeltaV_ms} M/S · ν ${trueAnomalyDeg}°`
              : isGeo
                ? `GMAT R2026a HOHMANN · r=${Math.round(altInstKm).toLocaleString()} KM · v=${instVelocityKms.toFixed(2)} KM/S · ν=${trueAnomalyDeg}°`
                : `ALT ${Math.round(altInstKm).toLocaleString()} KM · v ${instVelocityKms.toFixed(2)} KM/S · P ${periodMin.toFixed(0)} MIN · ΔV ${dest.requiredDeltaV_ms} M/S`}
          </text>
        </g>
      </svg>

      {/* Interactive Astrodynamics Bar */}
      <div className="mt-2 w-full max-w-[560px] space-y-2 border border-[#5FF3FF]/25 bg-[#04080F]/90 p-2.5 font-mono text-[9.5px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className={`border px-2.5 py-1 transition ${
                isPaused
                  ? 'border-[#FFC15E] bg-[#FFC15E]/15 text-[#FFC15E]'
                  : 'border-[#5FF3FF]/40 bg-[#5FF3FF]/10 text-[#5FF3FF]'
              }`}
            >
              {isPaused
                ? isEs
                  ? '▶ REANUDAR'
                  : '▶ RESUME'
                : isEs
                  ? '|| PAUSAR ÓRBITA'
                  : '|| PAUSE ORBIT'}
            </button>

            {!isL2 && (
              <div className="flex border border-[#5FF3FF]/25 p-0.5">
                {([0, 0.25, 0.55] as const).map((eVal) => (
                  <button
                    key={eVal}
                    type="button"
                    onClick={() => setEccentricity(eVal)}
                    className={`px-2 py-0.5 transition ${
                      eccentricity === eVal
                        ? 'bg-[#FFC15E]/20 text-[#FFC15E]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {eVal === 0 ? 'e=0 CIRC' : eVal === 0.25 ? 'e=.25 ELIP' : 'e=.55 MOLNIYA'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isL2 && (
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setShowVectors((v) => !v)}
                className={`border px-2 py-0.5 transition ${
                  showVectors
                    ? 'border-[#22c55e]/60 bg-[#22c55e]/15 text-[#86efac]'
                    : 'border-slate-700 text-slate-500'
                }`}
              >
                {isEs ? 'VECTORES' : 'VECTORS'}
              </button>
              <button
                type="button"
                onClick={() => setShowNodes((v) => !v)}
                className={`border px-2 py-0.5 transition ${
                  showNodes
                    ? 'border-[#5FF3FF]/60 bg-[#5FF3FF]/15 text-[#5FF3FF]'
                    : 'border-slate-700 text-slate-500'
                }`}
              >
                {isEs ? 'NODOS' : 'NODES'}
              </button>
              <button
                type="button"
                onClick={() => setShowSwath((v) => !v)}
                className={`border px-2 py-0.5 transition ${
                  showSwath
                    ? 'border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#7dd3fc]'
                    : 'border-slate-700 text-slate-500'
                }`}
              >
                {isEs ? 'BARRIDO' : 'SWATH'}
              </button>
            </div>
          )}
        </div>

        {/* True Anomaly Slider */}
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-slate-400">
            {isEs ? 'ANOMALÍA ν:' : 'TRUE ANOMALY ν:'}
          </span>
          <input
            id="orbit-true-anomaly-range"
            name="orbitTrueAnomalyDeg"
            type="range"
            min={0}
            max={359}
            value={trueAnomalyDeg}
            onChange={(e) => {
              setIsPaused(true);
              setThetaRad((Number(e.target.value) * Math.PI) / 180);
            }}
            aria-label={isEs ? 'Anomalía Verdadera Orbital' : 'Orbital True Anomaly'}
            className="w-full accent-[#5FF3FF]"
          />
          <span className="w-10 shrink-0 text-right font-semibold text-[#5FF3FF]">
            {trueAnomalyDeg}°
          </span>
        </div>
      </div>
    </div>
  );
}
