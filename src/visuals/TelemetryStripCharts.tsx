import type { Language } from '../types/mission';
import type { FailureMode } from './SpacecraftBlueprint';

export interface TelemetrySample {
  tRatio: number; // 0..1 of timeline
  altKm: number;
  velKmS: number;
  stressPct: number;
  fuelPct: number;
  powerW: number;
}

interface Props {
  samples: TelemetrySample[];
  currentRatio: number;
  destKm: number;
  failureMode: FailureMode;
  failed: boolean;
  failRatio: number;
  lang: Language;
  expanded?: boolean;
}

function buildPolyline(points: Array<{ x: number; y: number }>): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export default function TelemetryStripCharts({
  samples,
  currentRatio,
  destKm,
  failureMode,
  failed,
  failRatio,
  lang,
  expanded = false,
}: Props) {
  const es = lang === 'es';
  const W = 280;
  const H = expanded ? 118 : 82;
  const padL = 28;
  const padR = 10;
  const padT = 14;
  const padB = 14;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const activeEnd = failed ? Math.min(currentRatio, failRatio) : currentRatio;
  const visible = samples.filter((s) => s.tRatio <= activeEnd + 0.001);
  const lastSample = visible[visible.length - 1] ?? samples[0];

  const toX = (r: number) => padL + Math.max(0, Math.min(1, r)) * plotW;
  const toY = (val: number, min: number, max: number) => {
    const norm = (val - min) / Math.max(0.0001, max - min);
    return padT + (1 - Math.max(0, Math.min(1, norm))) * plotH;
  };

  const maxAlt = Math.max(400, destKm);
  const maxPower = Math.max(
    120,
    ...samples.map((s) => Math.abs(s.powerW) * 1.15),
  );

  // Chart 1: Altitude & Velocity
  const altPts = visible.map((s) => ({
    x: toX(s.tRatio),
    y: toY(s.altKm, 0, maxAlt),
  }));
  const velPts = visible.map((s) => ({
    x: toX(s.tRatio),
    y: toY(s.velKmS, 0, 8.5),
  }));

  // Chart 2: Structural Stress (%)
  const stressLimitY = toY(100, 0, 145);
  const stressPts = visible.map((s) => ({
    x: toX(s.tRatio),
    y: toY(s.stressPct, 0, 145),
  }));
  const stressPeak = Math.max(0, ...visible.map((s) => s.stressPct));
  const stressStroke =
    stressPeak >= 100 ? '#FF4D6D' : stressPeak >= 65 ? '#FFC15E' : '#22c55e';

  // Chart 3: COPV Propellant % & Power Balance W
  const fuelPts = visible.map((s) => ({
    x: toX(s.tRatio),
    y: toY(s.fuelPct, 0, 100),
  }));
  const powerPts = visible.map((s) => ({
    x: toX(s.tRatio),
    y: toY(Math.max(0, s.powerW), 0, maxPower),
  }));

  const isFailedNow = failed && currentRatio >= failRatio;
  const cursorX = toX(activeEnd);

  return (
    <div
      className={`grid gap-2 ${
        expanded ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'
      }`}
    >
      {/* Chart 1: Altitude & Velocity */}
      <div className="border border-[#5FF3FF]/25 bg-[#020617]/90 p-2">
        <div className="mb-1 flex items-center justify-between font-mono text-[9px] tracking-wider uppercase">
          <span className="text-slate-300">
            {es ? '1 · ALTITUD / VELOCIDAD' : '1 · ALTITUDE / VELOCITY'}
          </span>
          <span className="text-[#5FF3FF]">
            {Math.round(lastSample.altKm).toLocaleString()} km · {lastSample.velKmS.toFixed(1)} km/s
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <rect x={padL} y={padT} width={plotW} height={plotH} fill="#060d1f" stroke="#1e293b" />
          <line x1={padL} y1={padT + plotH / 2} x2={W - padR} y2={padT + plotH / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <text x={padL - 3} y={padT + 6} textAnchor="end" fill="#64748b" fontSize="6.5">
            {maxAlt >= 10000 ? `${Math.round(maxAlt / 1000)}k` : maxAlt}
          </text>
          <text x={padL - 3} y={padT + plotH} textAnchor="end" fill="#64748b" fontSize="6.5">
            0
          </text>
          {velPts.length > 1 && (
            <polyline fill="none" stroke="#FFC15E" strokeWidth="1.4" strokeDasharray="3 2" points={buildPolyline(velPts)} />
          )}
          {altPts.length > 1 && (
            <polyline fill="none" stroke="#5FF3FF" strokeWidth="2" points={buildPolyline(altPts)} />
          )}
          {altPts.length > 0 && (
            <circle
              cx={cursorX}
              cy={altPts[altPts.length - 1].y}
              r="3.2"
              fill={isFailedNow ? '#FF4D6D' : '#5FF3FF'}
            />
          )}
          <text x={padL + 4} y={H - 3} fill="#5FF3FF" fontSize="6.5">
            ALT
          </text>
          <text x={padL + 32} y={H - 3} fill="#FFC15E" fontSize="6.5">
            VEL
          </text>
        </svg>
      </div>

      {/* Chart 2: Poly Bridge Structural Stress vs 100% NASA-STD-5001B */}
      <div className="border border-[#5FF3FF]/25 bg-[#020617]/90 p-2">
        <div className="mb-1 flex items-center justify-between font-mono text-[9px] tracking-wider uppercase">
          <span className="text-slate-300">
            {es ? '2 · TENSIÓN MAX-Q (%)' : '2 · MAX-Q STRESS (%)'}
          </span>
          <span style={{ color: stressStroke }}>
            {Math.round(lastSample.stressPct)}%{lastSample.stressPct >= 100 ? ' SNAP!' : ''}
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <rect x={padL} y={padT} width={plotW} height={plotH} fill="#060d1f" stroke="#1e293b" />
          {/* 100% NASA-STD-5001B Red Threshold */}
          <line
            x1={padL}
            y1={stressLimitY}
            x2={W - padR}
            y2={stressLimitY}
            stroke="#FF4D6D"
            strokeDasharray="4 3"
            strokeWidth="1.1"
          />
          <text x={W - padR - 2} y={stressLimitY - 2.5} textAnchor="end" fill="#FF4D6D" fontSize="6.2" fontWeight="bold">
            100% NASA-STD-5001B
          </text>
          <text x={padL - 3} y={padT + 6} textAnchor="end" fill="#64748b" fontSize="6.5">
            145
          </text>
          <text x={padL - 3} y={padT + plotH} textAnchor="end" fill="#64748b" fontSize="6.5">
            0
          </text>
          {stressPts.length > 1 && (
            <polyline fill="none" stroke={stressStroke} strokeWidth="2.1" points={buildPolyline(stressPts)} />
          )}
          {stressPts.length > 0 && (
            <circle
              cx={cursorX}
              cy={stressPts[stressPts.length - 1].y}
              r={lastSample.stressPct >= 100 ? '4' : '3.2'}
              fill={lastSample.stressPct >= 100 ? '#FF4D6D' : stressStroke}
            />
          )}
          {isFailedNow && (failureMode === 'FAIRING_COLLISION' || failureMode === 'MASS_BUCKLING') && (
            <text x={Math.min(W - 42, cursorX + 5)} y={padT + 10} fill="#FF4D6D" fontSize="7" fontWeight="bold">
              SNAP!
            </text>
          )}
          <text x={padL + 4} y={H - 3} fill="#94a3b8" fontSize="6.5">
            PAF/COFIA
          </text>
        </svg>
      </div>

      {/* Chart 3: COPV Fuel % & Power Balance W */}
      <div className="border border-[#5FF3FF]/25 bg-[#020617]/90 p-2">
        <div className="mb-1 flex items-center justify-between font-mono text-[9px] tracking-wider uppercase">
          <span className="text-slate-300">
            {es ? '3 · PROPELENTE COPV / EPS' : '3 · COPV FUEL / POWER'}
          </span>
          <span className={lastSample.fuelPct <= 5 || lastSample.powerW <= 0 ? 'text-[#FF4D6D]' : 'text-[#22c55e]'}>
            {Math.round(lastSample.fuelPct)}% · {Math.round(lastSample.powerW)} W
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <rect x={padL} y={padT} width={plotW} height={plotH} fill="#060d1f" stroke="#1e293b" />
          <line x1={padL} y1={padT + plotH / 2} x2={W - padR} y2={padT + plotH / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <text x={padL - 3} y={padT + 6} textAnchor="end" fill="#64748b" fontSize="6.5">
            100%
          </text>
          <text x={padL - 3} y={padT + plotH} textAnchor="end" fill="#64748b" fontSize="6.5">
            0%
          </text>
          {powerPts.length > 1 && (
            <polyline
              fill="none"
              stroke={failureMode === 'POWER_FREEZE' && isFailedNow ? '#38bdf8' : '#a78bfa'}
              strokeWidth="1.5"
              strokeDasharray="3 2"
              points={buildPolyline(powerPts)}
            />
          )}
          {fuelPts.length > 1 && (
            <polyline
              fill="none"
              stroke={lastSample.fuelPct <= 10 ? '#FF4D6D' : '#22c55e'}
              strokeWidth="2"
              points={buildPolyline(fuelPts)}
            />
          )}
          {fuelPts.length > 0 && (
            <circle
              cx={cursorX}
              cy={fuelPts[fuelPts.length - 1].y}
              r="3.2"
              fill={lastSample.fuelPct <= 10 ? '#FF4D6D' : '#22c55e'}
            />
          )}
          <text x={padL + 4} y={H - 3} fill="#22c55e" fontSize="6.5">
            COPV %
          </text>
          <text x={padL + 44} y={H - 3} fill="#a78bfa" fontSize="6.5">
            EPS W
          </text>
        </svg>
      </div>
    </div>
  );
}
