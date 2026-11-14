import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

const MINI_ARCHS = [
  { key: 'obj-earth-bionutrients', label: { en: 'A · LEO Light', es: 'A · LEO Ligero' }, u: '3U' },
  { key: 'obj-helio-lunar-trailblazer', label: { en: 'B · Lunar Hall', es: 'B · Lunar Hall' }, u: '12U' },
  { key: 'obj-jupiter-clipper', label: { en: 'C · Deep RTG', es: 'C · Profundo RTG' }, u: 'RTG' },
];

export function HoloSpacecraftWireframe() {
  const {
    language,
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

  const isEs = language === 'es';
  const eps = findSubsystemById(selection.epsId);
  const prop = findSubsystemById(selection.propulsionId);
  const telecom = findSubsystemById(selection.telecomId);

  const units = cubesatFormFactor === '1.5U' ? 1 : cubesatFormFactor === '2U' ? 2 : cubesatFormFactor === '3U' ? 3 : 4;
  const bodyH = 44 + units * 22;
  const topY = 175 - bodyH / 2;
  const botY = 175 + bodyH / 2;
  const dur = reducedMotion ? 0 : 0.65;

  const isMassAlarm = metrics.wetMass_kg > metrics.launchCapacity_kg || !metrics.volume.isCompliant;
  const isPowerAlarm = metrics.power.status === 'RED';
  const isRfAlarm = metrics.telecom.status === 'RED';
  const strokeMain = isMassAlarm ? '#FF4D6D' : '#5FF3FF';
  const hasMegaWing = selection.epsId === 'eps-megaflex';
  const hasWing = selection.epsId === 'eps-deployable' || hasMegaWing;
  const hasRTG = selection.epsId === 'eps-rtg';

  const scanPins = [
    { id: 'mass', x: 250, y: topY + 24, ok: metrics.dryMass.status === 'GREEN', label: isEs ? 'MASA' : 'MASS', fix: () => { setSubsystem('LAUNCH_VEHICLE', 'lv-falcon9'); playHoloTone('STAR', soundEnabled); } },
    { id: 'eps', x: 355, y: 175, ok: metrics.power.status === 'GREEN', label: 'EPS', fix: () => { setSubsystem('EPS', 'eps-megaflex'); playHoloTone('STAR', soundEnabled); } },
    { id: 'rf', x: 250, y: topY - 12, ok: metrics.telecom.status === 'GREEN', label: 'RF', fix: () => { setSubsystem('TELECOM', 'telecom-xka'); playHoloTone('STAR', soundEnabled); } },
  ];

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {phase === 'CML_3' && (
        <div className="mb-3 grid w-full max-w-lg grid-cols-3 gap-2">
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
                className={`border px-2.5 py-2 text-center font-mono text-[10px] tracking-wider uppercase transition ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-[#5FF3FF] shadow-[0_0_16px_rgba(95,243,255,0.22)]'
                    : 'border-[#5FF3FF]/25 bg-[#04080F]/80 text-slate-400 opacity-65 hover:opacity-100'
                }`}
              >
                <svg viewBox="0 0 60 36" className="mx-auto mb-1 h-7 w-12">
                  <polygon points="30,4 44,11 30,18 16,11" fill="none" stroke="currentColor" strokeWidth="1" />
                  <rect x="20" y="13" width="20" height={arch.u === '3U' ? 14 : 18} fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="6" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1" />
                  <line x1="40" y1="18" x2="54" y2="18" stroke="currentColor" strokeWidth="1" />
                </svg>
                {arch.label[language]}
              </button>
            );
          })}
        </div>
      )}

      <svg viewBox="0 0 500 340" className="h-[310px] w-full max-w-[540px] sm:h-[360px]">
        <defs>
          <filter id="holoGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
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
        </defs>

        {/* Projection base rings */}
        <ellipse cx="250" cy="285" rx="115" ry="26" fill="none" stroke="#5FF3FF" strokeOpacity="0.22" strokeDasharray="3 4" strokeWidth="1" />
        <ellipse cx="250" cy="285" rx="74" ry="16" fill="none" stroke="#5FF3FF" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="70" y1="175" x2="430" y2="175" stroke="#5FF3FF" strokeOpacity="0.1" strokeWidth="1" />

        {/* Solar Wings / RTG deployed */}
        {hasWing && (
          <motion.g
            key={selection.epsId}
            initial={reducedMotion ? false : { opacity: 0, scaleX: 0.2 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: dur }}
            style={{ originX: '250px', originY: '175px' }}
            filter="url(#holoGlow)"
          >
            <polygon
              points={`208,162 ${hasMegaWing ? 85 : 122},142 ${hasMegaWing ? 85 : 122},198 208,188`}
              fill={isPowerAlarm ? '#FF4D6D14' : '#5FF3FF0F'}
              stroke={isPowerAlarm ? '#FF4D6D' : '#5FF3FF'}
              strokeWidth="1"
            />
            <polygon
              points={`292,162 ${hasMegaWing ? 415 : 378},142 ${hasMegaWing ? 415 : 378},198 292,188`}
              fill={isPowerAlarm ? '#FF4D6D14' : '#5FF3FF0F'}
              stroke={isPowerAlarm ? '#FF4D6D' : '#5FF3FF'}
              strokeWidth="1"
            />
          </motion.g>
        )}

        {hasRTG && (
          <motion.g initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur }}>
            <polygon points="205,190 150,210 150,228 205,212" fill="#FFC15E15" stroke="#FFC15E" strokeWidth="1" />
            <polygon points="295,190 350,210 350,228 295,212" fill="#FFC15E15" stroke="#FFC15E" strokeWidth="1" />
          </motion.g>
        )}

        {/* Dynamic Isometric Wireframe Bus (1.5U / 2U / 3U / CUSTOM) */}
        <motion.g
          key={cubesatFormFactor}
          initial={reducedMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur }}
          filter="url(#holoGlow)"
        >
          <polygon points={`250,${topY - 22} 292,${topY} 250,${topY + 22} 208,${topY}`} fill="#5FF3FF0C" stroke={strokeMain} strokeWidth="1.2" />
          <polygon points={`208,${topY} 250,${topY + 22} 250,${botY + 22} 208,${botY}`} fill="#5FF3FF08" stroke={strokeMain} strokeWidth="1.2" />
          <polygon points={`292,${topY} 250,${topY + 22} 250,${botY + 22} 292,${botY}`} fill="#5FF3FF08" stroke={strokeMain} strokeWidth="1.2" />
          <line x1="250" y1={topY + 22} x2="250" y2={botY + 22} stroke={strokeMain} strokeWidth="1.2" />
          {Array.from({ length: units }).map((_, idx) => {
            const segY = topY + ((idx + 1) * (botY - topY)) / (units + 1);
            return (
              <polyline
                key={idx}
                points={`208,${segY} 250,${segY + 22} 292,${segY}`}
                fill="none"
                stroke={strokeMain}
                strokeOpacity="0.65"
                strokeWidth="1"
              />
            );
          })}
        </motion.g>

        {/* Payload Wireframe Sensor Module */}
        <motion.g
          key={selection.payloadIds.join('-')}
          initial={reducedMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur }}
        >
          <ellipse cx="250" cy={topY} rx="18" ry="9" fill="none" stroke="#FFC15E" strokeWidth="1" />
          {selection.payloadIds.includes('pay-sar-radar') && (
            <path d={`M 218,${topY - 8} Q 250,${topY - 30} 282,${topY - 8}`} fill="none" stroke="#FFC15E" strokeWidth="1.2" />
          )}
        </motion.g>

        {/* Telecom Dish & Thruster Nozzle (Level 03+) */}
        {(phase === 'CML_3' || phase === 'CML_4' || phase === 'CML_5') && (
          <g>
            <path d={`M 236,${topY - 22} Q 250,${topY - 40} 264,${topY - 22}`} fill="none" stroke={isRfAlarm ? '#FF4D6D' : '#5FF3FF'} strokeWidth="1.1" />
            <line x1="250" y1={topY - 31} x2="250" y2={topY - 44} stroke="#5FF3FF" strokeWidth="1" />
            <polygon points={`240,${botY + 20} 260,${botY + 20} 268,${botY + 38} 232,${botY + 38}`} fill="none" stroke="#5FF3FF" strokeWidth="1" />
          </g>
        )}

        {/* Callout Lines */}
        <g className="font-mono text-[9px]" fill="#FFC15E">
          <polyline points={`274,${topY - 8} 325,${topY - 40} 370,${topY - 40}`} fill="none" stroke="#FFC15E" strokeOpacity="0.7" strokeWidth="1" />
          <text x="375" y={topY - 37}>{isEs ? 'CARGA ÚTIL' : 'PAYLOAD'} · {metrics.volume.used_U}U</text>

          <polyline points={`212,${botY - 18} 152,${botY + 12} 118,${botY + 12}`} fill="none" stroke="#FFC15E" strokeOpacity="0.7" strokeWidth="1" />
          <text x="20" y={botY + 15}>{eps?.isRTG ? 'RTG' : 'EPS'} · {metrics.power.generatedAtDestination_W.toFixed(0)}W</text>

          <text x="250" y="324" textAnchor="middle" fill="#5FF3FF" opacity="0.85">
            {isEs ? 'CHASIS' : 'CHASSIS'} {cubesatFormFactor} · {prop?.isp_s ? `ISP ${prop.isp_s}S · ` : ''}{metrics.wetMass_kg.toFixed(1)} KG · {telecom?.freqGHz ?? 0.4} GHZ
          </text>
        </g>

        {/* Level 05 Laser V&V Scan */}
        {phase === 'CML_5' && laserScanActive && (
          <motion.g
            animate={reducedMotion ? {} : { y: [55, 290, 55] }}
            transition={{ repeat: Infinity, duration: 3.4, ease: 'linear' }}
          >
            <line x1="90" y1="0" x2="410" y2="0" stroke="url(#scanBeam)" strokeWidth="2" />
          </motion.g>
        )}

        {phase === 'CML_5' &&
          scanPins.map((pin) => (
            <g key={pin.id} onClick={pin.fix} className="cursor-pointer">
              <circle cx={pin.x} cy={pin.y} r="7" fill="#04080F" stroke={pin.ok ? '#5FF3FF' : '#FFC15E'} strokeWidth="1.2" />
              <text x={pin.x + 12} y={pin.y + 3} className="font-mono text-[9px]" fill={pin.ok ? '#5FF3FF' : '#FFC15E'}>
                {pin.label}: {pin.ok ? 'OK ≥35%' : 'FIX'}
              </text>
            </g>
          ))}
      </svg>
    </div>
  );
}
