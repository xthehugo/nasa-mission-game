import type { Language, VolumeMetrics } from '../types/mission';
import { getStressColor } from './subsystemStress';

export type FailureMode =
  | 'NONE'
  | 'FAIRING_COLLISION'
  | 'MASS_BUCKLING'
  | 'DELTAV_DEPLETION'
  | 'POWER_FREEZE'
  | 'TELECOM_TUMBLE';

interface Props {
  volume: VolumeMetrics;
  lang?: Language;
  className?: string;
  stressPct?: number;
  failureMode?: FailureMode;
  failedActive?: boolean;
  fuelRemainingPct?: number;
  tRatio?: number;
}

export default function SpacecraftBlueprint({
  volume,
  lang = 'en',
  className = 'max-w-sm',
  stressPct,
  failureMode = 'NONE',
  failedActive = false,
  fuelRemainingPct = 100,
  tRatio,
}: Props) {
  const { used_U, maxFairing_U, isCompliant } = volume;
  const ratio = maxFairing_U > 0 ? used_U / maxFairing_U : 0;
  const bodyH = Math.max(36, Math.min(ratio, 1.3) * 155);
  const baseBottom = 356;
  const bodyTop = baseBottom - bodyH;
  const bandH = bodyH / 3;
  const wingY = baseBottom - bodyH / 2;
  const es = lang === 'es';

  const effectiveStress = Math.max(
    0,
    stressPct ?? (!isCompliant ? 114 : failedActive && failureMode !== 'NONE' ? 120 : 24)
  );
  const clampedFuel = Math.max(0, Math.min(100, fuelRemainingPct));
  const stressHex = getStressColor(effectiveStress);
  const bodyStrokeColor =
    failedActive && failureMode !== 'NONE' ? '#FF4D6D' : isCompliant ? '#22c55e' : '#ef4444';

  const isFairingSnap = failedActive && failureMode === 'FAIRING_COLLISION';
  const isMassBuckle = failedActive && failureMode === 'MASS_BUCKLING';
  const isDeltaVOut = failedActive && failureMode === 'DELTAV_DEPLETION';
  const isPowerFreeze = failedActive && failureMode === 'POWER_FREEZE';
  const isTumble = failedActive && failureMode === 'TELECOM_TUMBLE';

  // Multi-Phase Mechanical Deployment State
  const isStowed = tRatio !== undefined && tRatio < 0.38 && !isFairingSnap;
  const isRfSilence = tRatio !== undefined && tRatio >= 0.18 && tRatio < 0.38;
  const isAdcsLocked = tRatio !== undefined && tRatio >= 0.58 && !isTumble;
  const isMainBurn = tRatio !== undefined && tRatio >= 0.80 && clampedFuel > 0 && !isDeltaVOut;

  const wingStress = isFairingSnap ? Math.max(effectiveStress, 128) : effectiveStress * 0.62;
  const pafStress = isMassBuckle ? Math.max(effectiveStress, 135) : effectiveStress * 0.96;
  const copvStress = isDeltaVOut ? 104 : effectiveStress * 0.54;
  const adcsStress = isTumble ? 112 : effectiveStress * 0.48;

  const bands = [
    { label: es ? 'CARGA' : 'PAYLOAD', fill: isPowerFreeze ? '#0f2942' : '#1e3a8a' },
    { label: 'EPS / ADCS', fill: isPowerFreeze ? '#1e293b' : '#854d0e' },
    { label: es ? 'PROPULSIÓN' : 'PROPULSION', fill: isDeltaVOut ? '#450a0a' : '#14532d' },
  ];

  const barWidth = Math.min(100, (effectiveStress / 135) * 100);

  return (
    <div className={`w-full ${className}`}>
      <style>{`
        @keyframes fairingPulse { 0%,100% { opacity: 1 } 50% { opacity: .28 } }
        @keyframes craftTumble {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes jointSnap { 0%,100% { r: 5.5; opacity: 1 } 50% { r: 8; opacity: 0.45 } }
        @keyframes sparkFlicker { 0%,100% { opacity: 1 } 50% { opacity: 0.2 } }
        .fairing-alert { animation: fairingPulse 0.8s infinite; }
        .craft-tumble { animation: craftTumble 3.4s linear infinite; transform-origin: 150px 260px; }
        .joint-snap { animation: jointSnap 0.65s ease-in-out infinite; }
        .spark-flicker { animation: sparkFlicker 0.35s linear infinite; }
      `}</style>
      <svg viewBox="0 0 300 420" width="100%" style={{ background: '#020617', borderRadius: 12 }}>
        <defs>
          <pattern id="solarCells" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill={isPowerFreeze ? '#0f3a60' : '#1d4ed8'} />
            <path d="M10 0H0V10" fill="none" stroke={isPowerFreeze ? '#7dd3fc' : '#93c5fd'} strokeWidth="0.6" />
          </pattern>
          <linearGradient id="mainBurnPlume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5FF3FF" />
            <stop offset="45%" stopColor="#FFC15E" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Poly Bridge Top Structural Stress Bar */}
        <rect x="14" y="8" width="272" height="24" rx="4" fill="#0b1224" stroke={stressHex} strokeOpacity="0.55" />
        <text x="22" y="23" fill="#94a3b8" fontSize="8.5" fontWeight="bold">
          {es ? 'TENSIÓN MÁX. UNIÓN:' : 'MAX JOINT STRESS:'}
        </text>
        <text x="155" y="23" fill={stressHex} fontSize="9.5" fontWeight="bold">
          {Math.round(effectiveStress)}%{effectiveStress >= 100 ? ' · SNAP!' : ''}
        </text>
        <rect x="218" y="15" width="60" height="9" rx="2" fill="#1e293b" />
        <rect x="218" y="15" width={Math.max(2, (60 * barWidth) / 100)} height="9" rx="2" fill={stressHex} />

        {/* Cofia (fairing) con grieta en colision */}
        <path
          d="M78 364 L78 168 Q78 68 150 48 Q222 68 222 168 L222 364 Z"
          fill={isCompliant && !isFairingSnap ? 'rgba(34,197,94,0.05)' : 'rgba(255,77,109,0.12)'}
          stroke={isFairingSnap ? '#FF4D6D' : bodyStrokeColor}
          strokeWidth="2.6"
          className={!isCompliant || isFairingSnap ? 'fairing-alert' : ''}
        />
        {isFairingSnap && (
          <g>
            <path
              d={`M78 ${wingY - 28} L92 ${wingY - 14} L74 ${wingY} L90 ${wingY + 15} L76 ${wingY + 28}`}
              fill="none"
              stroke="#FF4D6D"
              strokeWidth="2.8"
            />
            <text x="42" y={wingY - 34} fill="#FF4D6D" fontSize="8" fontWeight="bold">
              {'<50 mm CRUSH'}
            </text>
          </g>
        )}

        {/* Linea limite de la cofia */}
        <line x1="78" y1="204" x2="222" y2="204" stroke="#f59e0b" strokeDasharray="5 4" strokeWidth="1" />
        <text x="83" y="199" fill="#f59e0b" fontSize="8.5">
          MAX {maxFairing_U}U
        </text>

        {/* Armadura PAF / ESPA inferior estilo Poly Bridge */}
        <g>
          <path
            d={
              isMassBuckle
                ? 'M116 356 L132 368 L112 376 M184 356 L168 368 L188 376 M124 366 L176 366'
                : 'M116 356 L112 374 L188 374 L184 356 M116 356 L150 374 L184 356 M112 374 L150 356 L188 374'
            }
            fill="none"
            stroke={getStressColor(pafStress)}
            strokeWidth={isMassBuckle ? 2.6 : 1.8}
          />
          <text x="150" y="387" textAnchor="middle" fill={getStressColor(pafStress)} fontSize="7.5" fontWeight="bold">
            PAF/ESPA · {Math.round(pafStress)}%{isMassBuckle ? ' (>1.40x ULT)' : ''}
          </text>
        </g>

        {/* Cuerpo de nave con transformacion por modo de fallo */}
        <g
          className={isTumble ? 'craft-tumble' : ''}
          transform={isMassBuckle ? 'translate(0, 11) rotate(7, 150, 350)' : undefined}
        >
          {/* Ala solar izquierda (cizallada, plegada o desplegada) */}
          <g
            transform={
              isFairingSnap
                ? `translate(82, ${wingY + 16}) rotate(-32)`
                : isPowerFreeze
                  ? `rotate(-22, 105, ${wingY})`
                  : undefined
            }
          >
            {isStowed ? (
              <g>
                <rect
                  x="82"
                  y={wingY - 20}
                  width="20"
                  height="40"
                  fill="url(#solarCells)"
                  stroke="#FFC15E"
                  strokeWidth="1.2"
                  strokeDasharray="2 1"
                />
                <line x1="82" y1={wingY} x2="105" y2={wingY} stroke="#FFC15E" strokeWidth="1.8" />
                <text x="78" y={wingY - 24} fill="#FFC15E" fontSize="6.5" fontWeight="bold">
                  {es ? 'PLEGADO' : 'STOWED'}
                </text>
              </g>
            ) : (
              <g>
                <line
                  x1={isFairingSnap ? -18 : 70}
                  y1={isFairingSnap ? 0 : wingY}
                  x2={isFairingSnap ? 14 : 105}
                  y2={isFairingSnap ? 0 : wingY}
                  stroke={getStressColor(wingStress)}
                  strokeWidth="2.4"
                />
                <rect
                  x={isFairingSnap ? -72 : 10}
                  y={isFairingSnap ? -14 : wingY - 14}
                  width="60"
                  height="28"
                  fill="url(#solarCells)"
                  stroke={isFairingSnap ? '#FF4D6D' : isPowerFreeze ? '#38bdf8' : '#60a5fa'}
                  strokeWidth={isFairingSnap ? 2 : 1.2}
                />
              </g>
            )}
          </g>

          {/* Ala solar derecha (plegada o desplegada) */}
          <g transform={isPowerFreeze ? `rotate(22, 195, ${wingY})` : undefined}>
            {isStowed ? (
              <g>
                <rect
                  x="198"
                  y={wingY - 20}
                  width="20"
                  height="40"
                  fill="url(#solarCells)"
                  stroke="#FFC15E"
                  strokeWidth="1.2"
                  strokeDasharray="2 1"
                />
                <line x1="195" y1={wingY} x2="218" y2={wingY} stroke="#FFC15E" strokeWidth="1.8" />
                <text x="222" y={wingY - 24} fill="#FFC15E" fontSize="6.5" fontWeight="bold">
                  {es ? 'PLEGADO' : 'STOWED'}
                </text>
              </g>
            ) : (
              <g>
                <line x1="195" y1={wingY} x2="230" y2={wingY} stroke={getStressColor(wingStress)} strokeWidth="2.4" />
                <rect
                  x="230"
                  y={wingY - 14}
                  width="60"
                  height="28"
                  fill="url(#solarCells)"
                  stroke={isPowerFreeze ? '#38bdf8' : '#60a5fa'}
                  strokeWidth="1.2"
                />
              </g>
            )}
          </g>

          {/* Bandas del chasis */}
          {bands.map((b, i) => (
            <g key={b.label}>
              <rect x="105" y={bodyTop + i * bandH} width="90" height={bandH} fill={b.fill} />
              {bodyH >= 72 && (
                <text
                  x="150"
                  y={bodyTop + i * bandH + bandH / 2 + (i === 2 ? -2 : 3)}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="7.5"
                >
                  {b.label}
                </text>
              )}
            </g>
          ))}

          {/* Barra viva de combustible COPV dentro de banda de propulsion */}
          <rect x="115" y={baseBottom - 10} width="70" height="5" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
          <rect
            x="115"
            y={baseBottom - 10}
            width={(70 * clampedFuel) / 100}
            height="5"
            rx="2"
            fill={clampedFuel <= 5 ? '#FF4D6D' : clampedFuel < 25 ? '#FFC15E' : '#5FF3FF'}
          />

          <rect x="105" y={bodyTop} width="90" height={bodyH} fill="none" stroke={bodyStrokeColor} strokeWidth="2.2" />

          {/* Antena + haz desalineado en TELECOM_TUMBLE / RF SILENCE / CARRIER LOCK */}
          <line x1="150" y1={bodyTop} x2="150" y2={bodyTop - 18} stroke={getStressColor(adcsStress)} strokeWidth="2" />
          <circle
            cx="150"
            cy={bodyTop - 22}
            r="6"
            fill="none"
            stroke={isTumble ? '#FF4D6D' : isAdcsLocked ? '#5FF3FF' : '#cbd5e1'}
            strokeWidth="2"
          />
          {isRfSilence && (
            <g>
              <rect x="106" y={bodyTop - 36} width="88" height="11" rx="2" fill="#0b1329" stroke="#FFC15E" strokeWidth="0.8" />
              <text x="150" y={bodyTop - 28} textAnchor="middle" fill="#FFC15E" fontSize="6.5" fontWeight="bold">
                {es ? 'SILENCIO RF 30-MIN' : 'NASA 30M RF SILENCE'}
              </text>
            </g>
          )}
          {isAdcsLocked && !isTumble && (
            <g>
              <path d={`M 140 ${bodyTop - 28} A 12 12 0 0 1 160 ${bodyTop - 28}`} fill="none" stroke="#5FF3FF" strokeWidth="1.4" opacity="0.85" />
              <path d={`M 134 ${bodyTop - 34} A 18 18 0 0 1 166 ${bodyTop - 34}`} fill="none" stroke="#5FF3FF" strokeWidth="1.1" opacity="0.5" />
              <text x="150" y={bodyTop - 40} textAnchor="middle" fill="#5FF3FF" fontSize="6.8" fontWeight="bold">
                DSN CARRIER LOCK
              </text>
            </g>
          )}
          {isTumble && (
            <g>
              <line
                x1="150"
                y1={bodyTop - 26}
                x2="236"
                y2={bodyTop - 52}
                stroke="#FF4D6D"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              <text x="236" y={bodyTop - 56} textAnchor="end" fill="#FF4D6D" fontSize="8" fontWeight="bold">
                -18 dB LOST
              </text>
            </g>
          )}

          {/* Tobera + pluma de encendido Hohmann o chispas de flameout */}
          <path d="M135 356 L150 372 L165 356 Z" fill={isDeltaVOut ? '#7f1d1d' : isMainBurn ? '#5FF3FF' : '#94a3b8'} />
          {isMainBurn && (
            <g className="spark-flicker">
              <polygon points="140,372 160,372 150,404" fill="url(#mainBurnPlume)" />
              <text x="150" y="416" textAnchor="middle" fill="#5FF3FF" fontSize="7.5" fontWeight="bold">
                {es ? 'INYECCIÓN HOHMANN ΔV' : 'HOHMANN ΔV BURN'}
              </text>
            </g>
          )}
          {isDeltaVOut && (
            <g className="spark-flicker">
              <circle cx="144" cy="378" r="2.5" fill="#FFC15E" />
              <circle cx="155" cy="382" r="2" fill="#FF4D6D" />
              <circle cx="148" cy="386" r="1.8" fill="#f97316" />
              <text x="150" y="398" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontWeight="bold">
                COPV 0% · FLAMEOUT
              </text>
            </g>
          )}
          {isDeltaVOut && (
            <g className="spark-flicker">
              <circle cx="144" cy="378" r="2.5" fill="#FFC15E" />
              <circle cx="155" cy="382" r="2" fill="#FF4D6D" />
              <circle cx="148" cy="386" r="1.8" fill="#f97316" />
              <text x="150" y="398" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontWeight="bold">
                COPV 0% · FLAMEOUT
              </text>
            </g>
          )}

          {/* Nodos de tension Poly Bridge (4 juntas clave) */}
          <circle
            cx="105"
            cy={wingY}
            r={wingStress >= 100 ? 6 : 4}
            fill={getStressColor(wingStress)}
            stroke="#020617"
            strokeWidth="1.4"
            className={wingStress >= 100 ? 'joint-snap' : ''}
          />
          <circle
            cx="150"
            cy={baseBottom - 16}
            r={copvStress >= 100 ? 6 : 4}
            fill={getStressColor(copvStress)}
            stroke="#020617"
            strokeWidth="1.4"
            className={copvStress >= 100 ? 'joint-snap' : ''}
          />
          <circle
            cx="150"
            cy={bodyTop}
            r={adcsStress >= 100 ? 6 : 4}
            fill={getStressColor(adcsStress)}
            stroke="#020617"
            strokeWidth="1.4"
            className={adcsStress >= 100 ? 'joint-snap' : ''}
          />
        </g>

        {/* Nodos base PAF/ESPA fijos + etiquetas criticas */}
        <circle
          cx="116"
          cy="356"
          r={pafStress >= 100 ? 6 : 4.2}
          fill={getStressColor(pafStress)}
          stroke="#020617"
          strokeWidth="1.5"
          className={pafStress >= 100 ? 'joint-snap' : ''}
        />
        <circle
          cx="184"
          cy="356"
          r={pafStress >= 100 ? 6 : 4.2}
          fill={getStressColor(pafStress)}
          stroke="#020617"
          strokeWidth="1.5"
          className={pafStress >= 100 ? 'joint-snap' : ''}
        />

        {/* Flecha de sobrecarga T/W < 1.0 en MASS_BUCKLING */}
        {isMassBuckle && (
          <g>
            <line x1="252" y1="250" x2="252" y2="338" stroke="#FF4D6D" strokeWidth="3" />
            <polygon points="245,332 259,332 252,346" fill="#FF4D6D" />
            <text x="252" y="242" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontWeight="bold">
              T/W {'<'} 1.0
            </text>
          </g>
        )}

        {/* Capa criogenica en POWER_FREEZE */}
        {isPowerFreeze && (
          <g>
            <rect x="78" y="48" width="144" height="316" rx="14" fill="rgba(56,189,248,0.12)" pointerEvents="none" />
            <text x="150" y="96" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold">
              * -15°C · BROWNOUT *
            </text>
          </g>
        )}

        {/* Lectura inferior volumen y estado */}
        <text x="150" y="408" textAnchor="middle" fill="#e2e8f0" fontSize="10.5">
          {used_U.toFixed(1)}U / {maxFairing_U}U ({Math.round(ratio * 100)}%) · COPV {Math.round(clampedFuel)}%
        </text>
        {!isCompliant && !failedActive && (
          <text x="150" y="68" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold" className="fairing-alert">
            {es ? '! EXCEDE LA COFIA' : '! FAIRING OVERFLOW'}
          </text>
        )}
      </svg>
    </div>
  );
}
