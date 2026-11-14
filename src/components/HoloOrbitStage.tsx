import { motion } from 'framer-motion';
import { findDestinationById, findGroundStationById } from '../engine';
import { useMissionStore } from '../store';

const BODY_GRAVITY: Record<string, { muKm3S2: number; radiusKm: number }> = {
  'dest-leo': { muKm3S2: 398600.44, radiusKm: 6371 },
  'dest-geo': { muKm3S2: 398600.44, radiusKm: 6371 },
  'dest-moon': { muKm3S2: 4902.8, radiusKm: 1737.4 },
  'dest-mars': { muKm3S2: 42828.37, radiusKm: 3389.5 },
  'dest-jupiter': { muKm3S2: 126686534, radiusKm: 69911 },
};

export function HoloOrbitStage() {
  const {
    language,
    selection,
    metrics,
    orbitAltitudeKm,
    orbitInclinationDeg,
    reducedMotion,
  } = useMissionStore();

  const isEs = language === 'es';
  const dest = findDestinationById(selection.destinationId);
  const gs = findGroundStationById(selection.groundStationId);
  const isGeo = selection.destinationId === 'dest-geo';
  const body = BODY_GRAVITY[selection.destinationId] ?? BODY_GRAVITY['dest-leo'];

  const semiMajorKm = body.radiusKm + orbitAltitudeKm;
  const periodMin =
    (2 * Math.PI * Math.sqrt(Math.pow(semiMajorKm, 3) / body.muKm3S2)) / 60;
  const velocityKms = Math.sqrt(body.muKm3S2 / semiMajorKm);

  const normRadius = Math.min(1, Math.log10(Math.max(100, orbitAltitudeKm) / 90) / 2.6);
  const rx = 86 + normRadius * 124;
  const ry = Math.max(
    28,
    rx * (isGeo ? 0.42 : 0.28 + Math.abs(Math.sin((orbitInclinationDeg * Math.PI) / 180)) * 0.34),
  );
  const rfAlert = metrics.telecom.status === 'RED';

  // GMAT R2026a Hohmann transfer ellipse geometry (LEO r=68 -> GEO rx)
  const rLeoPx = 68;
  const hohmannRx = (rLeoPx + rx) / 2;
  const hohmannRy = Math.sqrt(rLeoPx * rx) * 0.56;

  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 500 325" className="h-[300px] w-full max-w-[540px] sm:h-[345px]">
        <defs>
          <filter id="orbitGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wireframe Target Body (Earth/Moon/Mars/Jupiter) */}
        <g stroke="#5FF3FF" strokeWidth="1" fill="none" opacity="0.72" filter="url(#orbitGlow)">
          <circle cx="250" cy="155" r="46" />
          <ellipse cx="250" cy="155" rx="46" ry="15" />
          <ellipse cx="250" cy="155" rx="46" ry="30" strokeOpacity="0.35" />
          <ellipse cx="250" cy="155" rx="18" ry="46" strokeOpacity="0.45" />
          <line x1="250" y1="95" x2="250" y2="215" strokeDasharray="2 3" strokeOpacity="0.4" />
        </g>

        {/* Inclined Dynamic Wireframe Orbit */}
        <g transform={`rotate(${isGeo ? -8 : orbitInclinationDeg * 0.45 - 22} 250 155)`}>
          {isGeo && (
            <>
              <ellipse
                cx="250"
                cy="155"
                rx={rLeoPx}
                ry={rLeoPx * 0.42}
                fill="none"
                stroke="#5FF3FF"
                strokeOpacity="0.35"
                strokeDasharray="3 3"
              />
              <path
                d={`M ${250 + rLeoPx} 155 A ${hohmannRx} ${hohmannRy} 0 0 0 ${250 - rx} 155`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.4"
                strokeDasharray="5 3"
                opacity="0.9"
              />
              <circle cx={250 + rLeoPx} cy="155" r="4" fill="#f97316" filter="url(#orbitGlow)" />
              <text x={250 + rLeoPx + 6} y="168" className="font-mono text-[8px]" fill="#FFC15E">
                TOI +2,240 m/s
              </text>
              <circle cx={250 - rx} cy="155" r="4" fill="#22c55e" filter="url(#orbitGlow)" />
              <text x={250 - rx + 6} y="145" className="font-mono text-[8px]" fill="#86efac">
                GOI +1,433 m/s
              </text>
            </>
          )}

          <ellipse
            cx="250"
            cy="155"
            rx={rx}
            ry={ry}
            fill="none"
            stroke="#5FF3FF"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />
          {!reducedMotion ? (
            <motion.circle
              r="4.5"
              fill="#FFC15E"
              filter="url(#orbitGlow)"
              animate={{
                cx: [250 + rx, 250, 250 - rx, 250, 250 + rx],
                cy: [155, 155 + ry, 155, 155 - ry, 155],
              }}
              transition={{
                repeat: Infinity,
                duration: Math.max(2.4, Math.min(8, periodMin / 35)),
                ease: 'linear',
              }}
            />
          ) : (
            <circle cx={250 + rx} cy="155" r="4.5" fill="#FFC15E" />
          )}
        </g>

        {/* Ground Station RF Link Beam */}
        <line
          x1="286"
          y1="176"
          x2={250 + rx * 0.72}
          y2="132"
          stroke={rfAlert ? '#FF4D6D' : '#FFC15E'}
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <polygon points="282,182 290,182 286,174" fill="none" stroke="#FFC15E" strokeWidth="1" />

        <g className="font-mono text-[9.5px]" fill="#5FF3FF">
          <text x="250" y="294" textAnchor="middle">
            {dest.name[language].toUpperCase()} · {gs.name[language].toUpperCase()}
          </text>
          <text x="250" y="310" textAnchor="middle" fill={rfAlert ? '#FF4D6D' : '#FFC15E'}>
            {isGeo
              ? `GMAT R2026a HOHMANN · ΔV ${dest.requiredDeltaV_ms.toLocaleString()} M/S · PERIOD ${periodMin.toFixed(0)} MIN`
              : `${isEs ? 'PERIODO' : 'PERIOD'} ${periodMin.toFixed(0)} MIN · ${velocityKms.toFixed(2)} KM/S · ΔV ${dest.requiredDeltaV_ms} M/S · ECLIPSE ${Math.round(dest.eclipseFraction * 100)}%`}
          </text>
        </g>
      </svg>
    </div>
  );
}
