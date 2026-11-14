import { motion } from 'framer-motion';
import { findDestinationById, findGroundStationById } from '../engine';
import { useMissionStore } from '../store';

const MU_EARTH_KM3_S2 = 398600.44;
const EARTH_RADIUS_KM = 6371;

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

  const semiMajorKm = EARTH_RADIUS_KM + orbitAltitudeKm;
  const periodMin =
    (2 * Math.PI * Math.sqrt(Math.pow(semiMajorKm, 3) / MU_EARTH_KM3_S2)) / 60;
  const velocityKms = Math.sqrt(MU_EARTH_KM3_S2 / semiMajorKm);

  const normRadius = Math.min(1, Math.log10(Math.max(200, orbitAltitudeKm) / 180) / 2.35);
  const rx = 86 + normRadius * 128;
  const ry = Math.max(26, rx * (0.28 + Math.abs(Math.sin((orbitInclinationDeg * Math.PI) / 180)) * 0.34));
  const rfAlert = metrics.telecom.status === 'RED';

  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 500 320" className="h-[300px] w-full max-w-[540px] sm:h-[345px]">
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
        <g transform={`rotate(${orbitInclinationDeg * 0.45 - 22} 250 155)`}>
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
            {isEs ? 'PERIODO' : 'PERIOD'} {periodMin.toFixed(0)} MIN · {velocityKms.toFixed(2)} KM/S · ΔV {dest.requiredDeltaV_ms} M/S · ECLIPSE {Math.round(dest.eclipseFraction * 100)}%
          </text>
        </g>
      </svg>
    </div>
  );
}
