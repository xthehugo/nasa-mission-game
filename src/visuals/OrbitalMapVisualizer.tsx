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

export default function OrbitalMapVisualizer({ destination, lang = 'en', className = 'max-w-md', progress = null }: Props) {
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
      Array.from({ length: 70 }, (_, i) => ({
        x: (i * 137.5) % 400,
        y: (i * 61.8 + (i % 7) * 23) % 400,
        r: 0.4 + (i % 3) * 0.35,
        o: 0.3 + (i % 5) * 0.12,
      })),
    [],
  );

  const trail = (radius: number, angle: number, step: number, color: string, size: number) =>
    Array.from({ length: 14 }, (_, k) => {
      const a = angle - k * step;
      return (
        <circle
          key={k}
          cx={CX + radius * Math.cos(a)}
          cy={CY + radius * Math.sin(a)}
          r={size * (1 - k * 0.05)}
          fill={color}
          opacity={0.45 - k * 0.03}
        />
      );
    });

  const au = destination?.heliocentricDistanceAU ?? 1;
  const dKm = destination?.distanceFromEarthKm ?? 0;
  const earthMode = !destination || (au < 1.05 && dKm < 1_000_000);
  const name = destination ? destination.name[lang] : '—';

    const rocket = (pos: (p: number) => [number, number], p: number) => {
    const [x, y] = pos(p);
    const [x0, y0] = pos(Math.max(0, p - 0.02));
    const deg = (Math.atan2(y - y0, x - x0) * 180) / Math.PI;
    return (
      <>
        {Array.from({ length: 12 }, (_, k) => {
          const [tx, ty] = pos(Math.max(0, p - (k + 1) * 0.025));
          return <circle key={k} cx={tx} cy={ty} r={2} fill="#fdba74" opacity={0.5 - k * 0.04} />;
        })}
        <g transform={`translate(${x} ${y}) rotate(${deg})`} filter="url(#glow)">
          {p < 1 && <path d="M-6 -2 L-14 0 L-6 2 Z" fill="#f97316" />}
          <path d="M9 0 L-6 -4 L-6 4 Z" fill="#f8fafc" />
          <circle cx="1" cy="0" r="1.6" fill="#38bdf8" />
        </g>
      </>
    );
  };

  let content;
  if (earthMode) {
    const r = Math.min(185, Math.max(80, 60 + 22 * Math.log10(Math.max(dKm, 100))));
    const a = t * 1.5 * (60 / r);
    const isMoon = dKm > 100_000;
    const satColor = isMoon ? '#cbd5e1' : '#ffb703';
    content = (
      <>
        <circle cx={CX} cy={CY} r={58} fill="none" stroke="#60a5fa" strokeWidth={6} opacity={0.2} />
        <circle cx={CX} cy={CY} r={50} fill="url(#earthGrad)" />
        <circle cx={CX} cy={CY} r={r} fill="none" stroke="#64748b" strokeDasharray="4 4" />
        {trail(r, a, 0.07, satColor, isMoon ? 8 : 6)}
        <circle
          cx={CX + r * Math.cos(a)}
          cy={CY + r * Math.sin(a)}
          r={isMoon ? 9 : 6}
          fill={satColor}
          filter="url(#glow)"
        />
                {progress !== null &&
          rocket((p) => {
            const rr = 50 + (r - 50) * p;
            const aa = a - (1 - p) * 1.4;
            return [CX + rr * Math.cos(aa), CY + rr * Math.sin(aa)];
          }, progress)}
        <text x={CX} y={CY + 4} textAnchor="middle" fill="#fff" fontSize="11">
          {lang === 'es' ? 'Tierra' : 'Earth'}
        </text>
        <text x={CX} y={CY - r - 8} textAnchor="middle" fill="#94a3b8" fontSize="10">
          {name}
        </text>
      </>
    );
  } else {
    const earthR = 38;
    const destR = Math.min(180, earthR * Math.pow(au, 0.6));
    const earthA = t * 0.8;
    const destA = t * 0.8 * Math.pow(au, -1.5);
    const dx = CX + destR * Math.cos(destA);
    const dy = CY + destR * Math.sin(destA);
    content = (
      <>
        <circle cx={CX} cy={CY} r={26} fill="#f59e0b" opacity={0.2} />
        <circle cx={CX} cy={CY} r={16} fill="url(#sunGrad)" filter="url(#glow)" />
        <circle cx={CX} cy={CY} r={earthR} fill="none" stroke="#475569" strokeDasharray="3 3" />
        <circle cx={CX} cy={CY} r={destR} fill="none" stroke="#64748b" strokeDasharray="4 4" />
        {trail(earthR, earthA, 0.08, '#3b82f6', 5)}
        {trail(destR, destA, 0.05, '#ef4444', 8)}
        <circle cx={CX + earthR * Math.cos(earthA)} cy={CY + earthR * Math.sin(earthA)} r={5} fill="#3b82f6" />
        <circle cx={dx} cy={dy} r={8} fill="#ef4444" filter="url(#glow)" />
                {progress !== null &&
          rocket((p) => {
            const ex = CX + earthR * Math.cos(earthA);
            const ey = CY + earthR * Math.sin(earthA);
            const len = Math.hypot(dx - ex, dy - ey) || 1;
            const bulge = Math.sin(Math.PI * p) * 40;
            return [
              ex + (dx - ex) * p - ((dy - ey) / len) * bulge,
              ey + (dy - ey) * p + ((dx - ex) / len) * bulge,
            ];
          }, progress)}
        <text x={dx} y={dy - 13} textAnchor="middle" fill="#fca5a5" fontSize="11">
          {name}
        </text>
        <text x={CX} y={CY + 34} textAnchor="middle" fill="#94a3b8" fontSize="10">
          {lang === 'es' ? 'Sol' : 'Sun'}
        </text>
        <text x={CX + earthR + 6} y={CY - 4} fill="#93c5fd" fontSize="9">
          {lang === 'es' ? 'Tierra' : 'Earth'}
        </text>
      </>
    );
  }

  const tile = 'rounded-lg bg-slate-800/70 px-2 py-1';

  return (
    <div className={`w-full ${className}`}>
      <svg viewBox="0 0 400 400" width="100%" style={{ background: '#020617', borderRadius: 12 }}>
        <defs>
          <radialGradient id="earthGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
          <radialGradient id="sunGrad">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#cbd5e1" opacity={s.o} />
        ))}
        {content}
      </svg>
      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-200">
        <span className={tile}>📍 {name}</span>
        <span className={tile}>ΔV: {destination ? destination.requiredDeltaV_ms.toLocaleString() : '—'} m/s</span>
        <span className={tile}>
          {lang === 'es' ? 'Luz (1 vía)' : 'Light time'}: {destination ? fmtLight(destination.oneWayLightTimeSec) : '—'}
        </span>
        <span className={tile}>
          Eclipse: {destination ? `${(destination.eclipseFraction * 100).toFixed(0)}%` : '—'}
        </span>
      </div>
    </div>
  );
}