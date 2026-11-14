import { useEffect, useState } from 'react';
import type { Language, OrbitalDestination } from '../types/mission';

interface Props {
  destination: OrbitalDestination | null;
  lang?: Language;
}

const CX = 200;
const CY = 200;

const fmtLight = (s: number) =>
  s < 60 ? `${s.toFixed(1)} s` : `${(s / 60).toFixed(1)} min`;

export default function OrbitalMapVisualizer({ destination, lang = 'en' }: Props) {
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

  const au = destination?.heliocentricDistanceAU ?? 1;
  const dKm = destination?.distanceFromEarthKm ?? 0;
  // Cerca de la Tierra (LEO/Luna) = vista centrada en la Tierra. Lejos = vista del Sol.
  const earthMode = !destination || (au < 1.05 && dKm < 1_000_000);

  const name = destination ? destination.name[lang] : '—';

  let content;
  if (earthMode) {
    const r = Math.min(185, Math.max(75, 60 + 22 * Math.log10(Math.max(dKm, 100))));
    const a = t * 1.5 * (60 / r);
    content = (
      <>
        <circle cx={CX} cy={CY} r={50} fill="#1e5aa8" />
        <circle cx={CX} cy={CY} r={r} fill="none" stroke="#64748b" strokeDasharray="4 4" />
        <circle cx={CX + r * Math.cos(a)} cy={CY + r * Math.sin(a)} r={7} fill="#ffb703" />
        <text x={CX} y={CY + 4} textAnchor="middle" fill="#fff" fontSize="11">
          {lang === 'es' ? 'Tierra' : 'Earth'}
        </text>
      </>
    );
  } else {
    const earthR = 38;
    const destR = Math.min(185, earthR * Math.pow(au, 0.6));
    const earthA = t * 0.8;
    const destA = t * 0.8 * Math.pow(au, -1.5);
    content = (
      <>
        <circle cx={CX} cy={CY} r={16} fill="#fbbf24" />
        <circle cx={CX} cy={CY} r={earthR} fill="none" stroke="#475569" strokeDasharray="3 3" />
        <circle cx={CX} cy={CY} r={destR} fill="none" stroke="#64748b" strokeDasharray="4 4" />
        <circle cx={CX + earthR * Math.cos(earthA)} cy={CY + earthR * Math.sin(earthA)} r={5} fill="#3b82f6" />
        <circle cx={CX + destR * Math.cos(destA)} cy={CY + destR * Math.sin(destA)} r={8} fill="#ef4444" />
        <text x={CX} y={CY + 30} textAnchor="middle" fill="#94a3b8" fontSize="10">
          {lang === 'es' ? 'Sol' : 'Sun'}
        </text>
      </>
    );
  }

  return (
    <div className="w-full max-w-md">
      <svg viewBox="0 0 400 400" width="100%" style={{ background: '#020617', borderRadius: 12 }}>
        {content}
      </svg>
      <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-slate-300">
        <span>📍 {name}</span>
        <span>ΔV: {destination ? destination.requiredDeltaV_ms.toLocaleString() : '—'} m/s</span>
        <span>
          {lang === 'es' ? 'Luz (1 vía)' : 'Light time'}:{' '}
          {destination ? fmtLight(destination.oneWayLightTimeSec) : '—'}
        </span>
        <span>
          {lang === 'es' ? 'Eclipse' : 'Eclipse'}:{' '}
          {destination ? `${(destination.eclipseFraction * 100).toFixed(0)}%` : '—'}
        </span>
      </div>
    </div>
  );
}