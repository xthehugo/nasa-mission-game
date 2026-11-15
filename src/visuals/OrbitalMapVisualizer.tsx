import { useEffect, useMemo, useState } from 'react';
import type { Language, OrbitalDestination } from '../types/mission';

interface Props {
  destination: OrbitalDestination | null;
  lang?: Language;
  className?: string;
  progress?: number | null;
}

const CX = 200;
const CY = 200;

const fmtLight = (s: number) =>
  s < 60 ? `${s.toFixed(1)} s` : `${(s / 60).toFixed(1)} min`;

export default function OrbitalMapVisualizer({
  destination,
  lang = 'en',
  className = 'max-w-md',
}: Props) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      setT((p) => p + (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: (i * 137.5) % 400,
        y: (i * 61.8 + (i % 7) * 23) % 400,
        r: 0.35 + (i % 3) * 0.4,
        o: 0.25 + (i % 5) * 0.15,
      })),
    [],
  );

  const destId = destination?.id ?? 'dest-leo';
  const name = destination ? destination.name[lang] : 'LEO';
  const isEs = lang === 'es';

  // Specific campaign modes
  const isLeo = destId === 'dest-leo';
  const isGeo = destId === 'dest-geo';
  const isMoon = destId === 'dest-moon';
  const isL2 = destId === 'dest-l2';
  const isJupiter = destId === 'dest-jupiter';

  // Dynamic particle trail
  const trail = (
    radius: number,
    angle: number,
    step: number,
    color: string,
    size: number,
    center: [number, number] = [CX, CY],
  ) =>
    Array.from({ length: 14 }, (_, k) => {
      const a = angle - k * step;
      return (
        <circle
          key={k}
          cx={center[0] + radius * Math.cos(a)}
          cy={center[1] + radius * Math.sin(a)}
          r={Math.max(0.6, size * (1 - k * 0.06))}
          fill={color}
          opacity={0.45 - k * 0.03}
        />
      );
    });

  // Animated ship renderer along trajectory
  const renderShipMarker = (x: number, y: number, angleDeg: number) => (
    <g transform={`translate(${x} ${y}) rotate(${angleDeg})`} filter="url(#holoGlow)">
      <path d="M-6 -2 L-14 0 L-6 2 Z" fill="#f97316" />
      <path d="M9 0 L-6 -4 L-6 4 Z" fill="#5FF3FF" />
      <circle cx="1" cy="0" r="1.8" fill="#fff" />
    </g>
  );

  // Content generation based on destination / campaign
  let orbitalGraphics;
  let hudVelocity = '7.67 km/s';
  let hudPeriod = '92.6 min';
  let hudRadiation = 'NOMINAL (LEO)';
  let hudAnomaly = isEs ? 'Arrastre LEO' : 'LEO Drag';

  if (isLeo) {
    const rOrbit = 82;
    const a = t * 0.9;
    const sx = CX + rOrbit * Math.cos(a);
    const sy = CY + rOrbit * Math.sin(a);
    const shipAngle = (a * 180) / Math.PI + 90;
    hudVelocity = '7.67 km/s';
    hudPeriod = '92.6 min';
    hudRadiation = 'NOMINAL (LEO)';
    hudAnomaly = isEs ? '16 Eclipses/Día' : '16 Eclipses/Day';

    orbitalGraphics = (
      <>
        {/* Atmospheric halo */}
        <circle cx={CX} cy={CY} r={62} fill="none" stroke="#5FF3FF" strokeWidth={5} opacity={0.16} />
        <circle cx={CX} cy={CY} r={52} fill="url(#earthGrad)" />
        {/* LEO Orbit circle */}
        <circle cx={CX} cy={CY} r={rOrbit} fill="none" stroke="#5FF3FF" strokeWidth="1.2" strokeDasharray="4 3" opacity={0.65} />
        {/* Inclination plane line */}
        <line x1={CX - 110} y1={CY + 35} x2={CX + 110} y2={CY - 35} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3" opacity={0.4} />
        <text x={CX + 95} y={CY - 40} fill="#38bdf8" fontSize="8" fontFamily="monospace">i = 97.6° SSO</text>
        {trail(rOrbit, a, 0.06, '#5FF3FF', 5)}
        {renderShipMarker(sx, sy, shipAngle)}
        <text x={CX} y={CY + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
          {isEs ? 'Tierra' : 'Earth'}
        </text>
      </>
    );
  } else if (isGeo) {
    const rLeo = 52;
    const rGeo = 145;
    const hohmannRx = (rLeo + rGeo) / 2;
    const hohmannRy = Math.sqrt(rLeo * rGeo);
    const aGeo = t * 0.28;
    const sx = CX + rGeo * Math.cos(aGeo);
    const sy = CY + rGeo * Math.sin(aGeo);
    hudVelocity = '3.07 km/s';
    hudPeriod = '23.93 h (GEO)';
    hudRadiation = 'HIGH · Van Allen Belts';
    hudAnomaly = 'GMAT 3,673 m/s';

    orbitalGraphics = (
      <>
        {/* Earth center */}
        <circle cx={CX} cy={CY} r={32} fill="url(#earthGrad)" />

        {/* Van Allen Inner Belt (1,000 - 6,000 km) */}
        <circle cx={CX} cy={CY} r={72} fill="none" stroke="#FFC15E" strokeWidth="14" opacity={0.14} strokeDasharray="3 2" />
        <text x={CX} y={CY - 74} textAnchor="middle" fill="#FFC15E" fontSize="7.5" fontFamily="monospace" opacity={0.85}>
          {isEs ? '▲ CINTURÓN VAN ALLEN (PROTONES)' : '▲ VAN ALLEN INNER BELT'}
        </text>

        {/* Van Allen Outer Belt (13,000 - 25,000 km) */}
        <circle cx={CX} cy={CY} r={112} fill="none" stroke="#FF4D6D" strokeWidth="16" opacity={0.12} strokeDasharray="4 3" />
        <text x={CX} y={CY + 116} textAnchor="middle" fill="#FF4D6D" fontSize="7.5" fontFamily="monospace" opacity={0.85}>
          {isEs ? '▼ RADIACIÓN ELECTRONES ENERGÉTICOS' : '▼ ENERGETIC ELECTRON FLUX'}
        </text>

        {/* LEO Parking Orbit */}
        <circle cx={CX} cy={CY} r={rLeo} fill="none" stroke="#64748b" strokeDasharray="3 3" opacity={0.6} />

        {/* GMAT Hohmann Transfer Ellipse */}
        <path
          d={`M ${CX + rLeo} ${CY} A ${hohmannRx} ${hohmannRy} 0 0 0 ${CX - rGeo} ${CY}`}
          fill="none"
          stroke="#5FF3FF"
          strokeWidth="1.8"
          strokeDasharray="5 3"
          filter="url(#holoGlow)"
        />

        {/* TOI (Trans-Orbit Injection) +2,240 m/s */}
        <circle cx={CX + rLeo} cy={CY} r={4.5} fill="#f97316" filter="url(#holoGlow)" />
        <text x={CX + rLeo + 6} y={CY + 12} fill="#fdba74" fontSize="8" fontWeight="bold" fontFamily="monospace">
          TOI +2,240 m/s
        </text>

        {/* GOI (Geostationary Orbit Insertion) +1,433 m/s */}
        <circle cx={CX - rGeo} cy={CY} r={4.5} fill="#22c55e" filter="url(#holoGlow)" />
        <text x={CX - rGeo + 6} y={CY - 8} fill="#86efac" fontSize="8" fontWeight="bold" fontFamily="monospace">
          GOI +1,433 m/s
        </text>

        {/* Geostationary Equatorial Ring (35,786 km) */}
        <circle cx={CX} cy={CY} r={rGeo} fill="none" stroke="#38bdf8" strokeWidth="1.4" opacity={0.7} />
        {trail(rGeo, aGeo, 0.05, '#38bdf8', 5)}
        {renderShipMarker(sx, sy, (aGeo * 180) / Math.PI + 90)}
        <text x={CX} y={CY + rGeo + 14} textAnchor="middle" fill="#5FF3FF" fontSize="8.5" fontFamily="monospace">
          GEO 35,786 km · GMAT R2026a ΔV: 3,673 m/s
        </text>
      </>
    );
  } else if (isMoon) {
    const earthCenter = [105, CY] as [number, number];
    const moonCenter = [305, CY] as [number, number];
    const moonOrbitR = 26;
    const aMoon = t * 1.2;
    const sx = moonCenter[0] + moonOrbitR * Math.cos(aMoon);
    const sy = moonCenter[1] + moonOrbitR * Math.sin(aMoon);
    hudVelocity = '1.63 km/s';
    hudPeriod = '118 min (Lunar)';
    hudRadiation = 'COSMIC RAYS (GCR)';
    hudAnomaly = isEs ? 'Hielo Cráter Shackleton' : 'Shackleton Ice Hunt';

    orbitalGraphics = (
      <>
        {/* Earth */}
        <circle cx={earthCenter[0]} cy={earthCenter[1]} r={36} fill="url(#earthGrad)" />
        <text x={earthCenter[0]} y={earthCenter[1] + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
          {isEs ? 'Tierra' : 'Earth'}
        </text>

        {/* Translunar Injection Arc */}
        <path
          d={`M ${earthCenter[0] + 45} ${CY - 15} Q 200 120, ${moonCenter[0] - 28} ${CY - 12}`}
          fill="none"
          stroke="#5FF3FF"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          filter="url(#holoGlow)"
        />
        <text x={200} y={112} textAnchor="middle" fill="#5FF3FF" fontSize="8" fontFamily="monospace">
          TLI · 384,400 km
        </text>

        {/* Moon */}
        <circle cx={moonCenter[0]} cy={moonCenter[1]} r={20} fill="#cbd5e1" />
        <circle cx={moonCenter[0] - 5} cy={moonCenter[1] - 4} r={3.5} fill="#94a3b8" opacity={0.6} />
        <circle cx={moonCenter[0] + 6} cy={moonCenter[1] + 5} r={2.5} fill="#94a3b8" opacity={0.6} />
        {/* South Pole Shackleton target */}
        <circle cx={moonCenter[0]} cy={moonCenter[1] + 18} r={3} fill="#38bdf8" filter="url(#holoGlow)" />
        <text x={moonCenter[0]} y={moonCenter[1] + 30} textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">
          PSR South Pole
        </text>

        {/* Lunar Polar Orbit 100 km */}
        <ellipse cx={moonCenter[0]} cy={moonCenter[1]} rx={12} ry={moonOrbitR} fill="none" stroke="#5FF3FF" strokeWidth="1.2" opacity={0.8} />
        {renderShipMarker(sx, sy, (aMoon * 180) / Math.PI + 90)}
        <text x={moonCenter[0]} y={moonCenter[1] - 26} textAnchor="middle" fill="#cbd5e1" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
          {isEs ? 'Órbita Polar 100 km' : '100 km Polar Orbit'}
        </text>
      </>
    );
  } else if (isL2) {
    const sunX = 55;
    const earthX = 180;
    const l2X = 295;
    const aHalo = t * 0.8;
    const haloRx = 16;
    const haloRy = 32;
    const sx = l2X + haloRx * Math.cos(aHalo);
    const sy = CY + haloRy * Math.sin(aHalo);
    hudVelocity = '0.22 km/s (Halo)';
    hudPeriod = '6 Months (L2)';
    hudRadiation = 'SOLAR WIND (1.5M km)';
    hudAnomaly = isEs ? 'Criogenia <85K' : 'Cryo <85K JWST';

    orbitalGraphics = (
      <>
        {/* Sun at left */}
        <circle cx={sunX} cy={CY} r={26} fill="url(#sunGrad)" filter="url(#holoGlow)" />
        <text x={sunX} y={CY + 36} textAnchor="middle" fill="#FFC15E" fontSize="9" fontWeight="bold">
          {isEs ? 'Sol' : 'Sun'}
        </text>

        {/* Solar Radiation Pressure Vector */}
        <line x1={sunX + 30} y1={CY} x2={earthX - 22} y2={CY} stroke="#FFC15E" strokeWidth="1.2" strokeDasharray="3 3" opacity={0.6} />

        {/* Earth */}
        <circle cx={earthX} cy={CY} r={18} fill="url(#earthGrad)" />
        <text x={earthX} y={CY + 26} textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="bold">
          1.0 AU
        </text>

        {/* Lagrange L2 saddle point */}
        <line x1={earthX + 20} y1={CY} x2={l2X - haloRx} y2={CY} stroke="#5FF3FF" strokeWidth="1.4" strokeDasharray="4 3" opacity={0.7} />
        <circle cx={l2X} cy={CY} r={3} fill="#5FF3FF" filter="url(#holoGlow)" />
        <text x={l2X} y={CY - 38} textAnchor="middle" fill="#5FF3FF" fontSize="9" fontWeight="bold" fontFamily="monospace">
          SE-L2 (1.5M km)
        </text>

        {/* Lissajous / Halo Orbit around L2 */}
        <ellipse cx={l2X} cy={CY} rx={haloRx} ry={haloRy} fill="none" stroke="#5FF3FF" strokeWidth="1.5" strokeDasharray="4 2" opacity={0.85} />
        {renderShipMarker(sx, sy, (aHalo * 180) / Math.PI + 90)}

        {/* Cryo Sunshield orientation indicator */}
        <line x1={sx} y1={sy - 12} x2={sx} y2={sy + 12} stroke="#38bdf8" strokeWidth="2.4" />
        <text x={l2X} y={CY + 46} textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
          {isEs ? 'Escudo Térmico 5 Capas' : '5-Layer Sunshield'}
        </text>
      </>
    );
  } else if (isJupiter) {
    const sunX = 60;
    const jupX = 265;
    const jupR = 34;
    const aIo = t * 2.8;
    const aEur = t * 1.4;
    const aGan = t * 0.7;
    const aCal = t * 0.35;
    hudVelocity = '13.1 km/s (Clipper)';
    hudPeriod = '14.2 Days (Orbit)';
    hudRadiation = 'EXTREME · 540 krad/y';
    hudAnomaly = 'RTG 5.2 AU · -96% Flux';

    orbitalGraphics = (
      <>
        {/* Sun */}
        <circle cx={sunX} cy={CY} r={20} fill="url(#sunGrad)" filter="url(#holoGlow)" />
        <text x={sunX} y={CY + 30} textAnchor="middle" fill="#FFC15E" fontSize="8" fontWeight="bold">
          1 AU
        </text>

        {/* 5.2 AU Distance vector */}
        <line x1={sunX + 22} y1={CY} x2={jupX - jupR - 35} y2={CY} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4 3" opacity={0.65} />
        <text x={(sunX + jupX) / 2} y={CY - 10} textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">
          778,000,000 km (5.20 AU)
        </text>

        {/* Jupiter with cloud bands */}
        <circle cx={jupX} cy={CY} r={jupR} fill="#d97706" />
        {/* Atmospheric belts */}
        <line x1={jupX - 32} y1={CY - 10} x2={jupX + 32} y2={CY - 10} stroke="#78350f" strokeWidth="5" opacity={0.8} />
        <line x1={jupX - 33} y1={CY + 8} x2={jupX + 33} y2={CY + 8} stroke="#92400e" strokeWidth="6" opacity={0.8} />
        {/* Great Red Spot */}
        <ellipse cx={jupX + 12} cy={CY + 8} rx={6} ry={3.5} fill="#ef4444" filter="url(#holoGlow)" />

        {/* 4 Galilean Moons in Laplace 1:2:4 resonance */}
        {/* Io: 421k km */}
        <circle cx={jupX} cy={CY} r={46} fill="none" stroke="#fde047" strokeWidth="0.8" opacity={0.4} />
        <circle cx={jupX + 46 * Math.cos(aIo)} cy={CY + 46 * Math.sin(aIo)} r={2.5} fill="#fde047" />

        {/* Europa: 670k km (Science Target) */}
        <circle cx={jupX} cy={CY} r={60} fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" opacity={0.8} />
        <circle cx={jupX + 60 * Math.cos(aEur)} cy={CY + 60 * Math.sin(aEur)} r={3.2} fill="#38bdf8" filter="url(#holoGlow)" />
        <text x={jupX + 60 * Math.cos(aEur) + 6} y={CY + 60 * Math.sin(aEur) + 3} fill="#38bdf8" fontSize="7" fontWeight="bold">
          Europa
        </text>

        {/* Ganymede: 1,070k km */}
        <circle cx={jupX} cy={CY} r={76} fill="none" stroke="#cbd5e1" strokeWidth="0.8" opacity={0.35} />
        <circle cx={jupX + 76 * Math.cos(aGan)} cy={CY + 76 * Math.sin(aGan)} r={3.8} fill="#cbd5e1" />

        {/* Callisto: 1,882k km */}
        <circle cx={jupX} cy={CY} r={92} fill="none" stroke="#94a3b8" strokeWidth="0.8" opacity={0.3} />
        <circle cx={jupX + 92 * Math.cos(aCal)} cy={CY + 92 * Math.sin(aCal)} r={3.5} fill="#64748b" />

        <text x={jupX} y={CY + jupR + 14} textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold" fontFamily="monospace">
          Júpiter & 4 Lunas Galileanas
        </text>
      </>
    );
  } else {
    // Mars interplanetary
    const rMars = 115;
    const aMars = t * 0.5;
    const sx = CX + rMars * Math.cos(aMars);
    const sy = CY + rMars * Math.sin(aMars);
    hudVelocity = '5.41 km/s (Mars Orbit)';
    hudPeriod = '7.0 h';
    hudRadiation = 'MODERATE';
    hudAnomaly = isEs ? 'Tormentas de Polvo' : 'Dust Storms';

    orbitalGraphics = (
      <>
        <circle cx={CX} cy={CY} r={28} fill="url(#sunGrad)" filter="url(#holoGlow)" />
        <circle cx={CX} cy={CY} r={65} fill="none" stroke="#3b82f6" strokeDasharray="3 3" opacity={0.5} />
        <circle cx={CX} cy={CY} r={rMars} fill="none" stroke="#ef4444" strokeDasharray="4 3" opacity={0.7} />
        <circle cx={CX + rMars * Math.cos(aMars)} cy={CY + rMars * Math.sin(aMars)} r={10} fill="#ef4444" filter="url(#holoGlow)" />
        {renderShipMarker(sx, sy, (aMars * 180) / Math.PI + 90)}
        <text x={CX} y={CY + rMars + 16} textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontFamily="monospace">
          {name} · 1.52 AU
        </text>
      </>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox="0 0 400 400"
        width="100%"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #071322 0%, #020617 100%)',
          borderRadius: 12,
          border: '1px solid rgba(95,243,255,0.3)',
          boxShadow: '0 0 30px rgba(95,243,255,0.12)',
        }}
      >
        <defs>
          <radialGradient id="earthGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <radialGradient id="sunGrad">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <filter id="holoGlow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Polar coordinate HUD grid */}
        <circle cx={CX} cy={CY} r={175} fill="none" stroke="#5FF3FF" strokeWidth="0.8" opacity={0.15} />
        <circle cx={CX} cy={CY} r={120} fill="none" stroke="#5FF3FF" strokeWidth="0.8" opacity={0.12} strokeDasharray="3 3" />
        <circle cx={CX} cy={CY} r={70} fill="none" stroke="#5FF3FF" strokeWidth="0.8" opacity={0.15} />
        <line x1={CX} y1={25} x2={CX} y2={375} stroke="#5FF3FF" strokeWidth="0.6" opacity={0.15} />
        <line x1={25} y1={CY} x2={375} y2={CY} stroke="#5FF3FF" strokeWidth="0.6" opacity={0.15} />

        {/* Polar degree ticks */}
        <text x={CX} y={20} textAnchor="middle" fill="#5FF3FF" fontSize="7" opacity={0.4} fontFamily="monospace">000° N</text>
        <text x={388} y={CY + 3} textAnchor="start" fill="#5FF3FF" fontSize="7" opacity={0.4} fontFamily="monospace">090° E</text>
        <text x={CX} y={392} textAnchor="middle" fill="#5FF3FF" fontSize="7" opacity={0.4} fontFamily="monospace">180° S</text>
        <text x={8} y={CY + 3} textAnchor="start" fill="#5FF3FF" fontSize="7" opacity={0.4} fontFamily="monospace">270° W</text>

        {/* Starfield */}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#cbd5e1" opacity={s.o} />
        ))}

        {/* Destination-specific dynamic graphics */}
        {orbitalGraphics}

        {/* Holographic Header Bar */}
        <rect x="12" y="12" width="130" height="18" fill="#04080F" stroke="#5FF3FF" strokeWidth="0.8" opacity={0.85} rx="2" />
        <text x="18" y="24" fill="#5FF3FF" fontSize="8" fontWeight="bold" fontFamily="monospace">
          ◈ {name.toUpperCase()}
        </text>

        {/* Top-Right Telemetry Card */}
        <rect x="258" y="12" width="130" height="34" fill="#04080F" stroke="#5FF3FF" strokeWidth="0.8" opacity={0.85} rx="2" />
        <text x="264" y="24" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
          VEL: <tspan fill="#5FF3FF" fontWeight="bold">{hudVelocity}</tspan>
        </text>
        <text x="264" y="38" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
          PER: <tspan fill="#FFC15E" fontWeight="bold">{hudPeriod}</tspan>
        </text>
      </svg>

      {/* 4 Bottom Holographic Real-Data Tiles */}
      <div className="grid grid-cols-2 gap-1.5 mt-2 font-mono text-[10px]">
        <div className="border border-[#5FF3FF]/25 bg-[#04080F]/90 px-2 py-1.5 rounded flex justify-between">
          <span className="text-slate-400">{isEs ? 'ΔV REQUERIDO:' : 'REQ ΔV:'}</span>
          <span className="text-[#5FF3FF] font-bold">
            {destination ? destination.requiredDeltaV_ms.toLocaleString() : '—'} m/s
          </span>
        </div>
        <div className="border border-[#5FF3FF]/25 bg-[#04080F]/90 px-2 py-1.5 rounded flex justify-between">
          <span className="text-slate-400">{isEs ? 'TIEMPO LUZ:' : 'LIGHT TIME:'}</span>
          <span className="text-[#FFC15E] font-bold">
            {destination ? fmtLight(destination.oneWayLightTimeSec) : '—'}
          </span>
        </div>
        <div className="border border-[#5FF3FF]/25 bg-[#04080F]/90 px-2 py-1.5 rounded flex justify-between">
          <span className="text-slate-400">{isEs ? 'RADIACIÓN:' : 'RADIATION:'}</span>
          <span className="text-slate-200 font-bold truncate max-w-[130px] text-right">{hudRadiation}</span>
        </div>
        <div className="border border-[#5FF3FF]/25 bg-[#04080F]/90 px-2 py-1.5 rounded flex justify-between">
          <span className="text-slate-400">{isEs ? 'RETO CLAVE:' : 'KEY THREAT:'}</span>
          <span className="text-[#FF4D6D] font-bold truncate max-w-[130px] text-right">{hudAnomaly}</span>
        </div>
      </div>
    </div>
  );
}
