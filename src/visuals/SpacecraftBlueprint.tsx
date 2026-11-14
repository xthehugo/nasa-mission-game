import type { Language, VolumeMetrics } from '../types/mission';

interface Props {
  volume: VolumeMetrics;
  lang?: Language;
}

export default function SpacecraftBlueprint({ volume, lang = 'en' }: Props) {
  const { used_U, maxFairing_U, isCompliant } = volume;
  const ratio = maxFairing_U > 0 ? used_U / maxFairing_U : 0;
  const bodyH = Math.max(30, Math.min(ratio, 1.3) * 160);
  const bodyTop = 360 - bodyH;
  const bandH = bodyH / 3;
  const color = isCompliant ? '#22c55e' : '#ef4444';
  const es = lang === 'es';

  const bands = [
    { label: es ? 'CARGA' : 'PAYLOAD', fill: '#1e3a8a' },
    { label: 'EPS / ADCS', fill: '#854d0e' },
    { label: es ? 'PROPULSIÓN' : 'PROPULSION', fill: '#14532d' },
  ];

  return (
    <div className="w-full max-w-sm">
      <style>{`
        @keyframes fairingPulse { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
        .fairing-alert { animation: fairingPulse 0.8s infinite; }
      `}</style>
      <svg viewBox="0 0 300 400" width="100%" style={{ background: '#020617', borderRadius: 12 }}>
        <defs>
          <pattern id="solarCells" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#1d4ed8" />
            <path d="M10 0H0V10" fill="none" stroke="#93c5fd" strokeWidth="0.6" />
          </pattern>
        </defs>

        {/* Cofia (fairing) */}
        <path
          d="M80 360 L80 160 Q80 60 150 40 Q220 60 220 160 L220 360 Z"
          fill={isCompliant ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.10)'}
          stroke={color}
          strokeWidth="3"
          className={isCompliant ? '' : 'fairing-alert'}
        />

        {/* Línea límite de la cofia */}
        <line x1="80" y1="200" x2="220" y2="200" stroke="#f59e0b" strokeDasharray="5 4" strokeWidth="1" />
        <text x="84" y="195" fill="#f59e0b" fontSize="9">
          MAX {maxFairing_U}U
        </text>

        {/* Paneles solares con conectores */}
        <line x1="70" y1={360 - bodyH / 2} x2="105" y2={360 - bodyH / 2} stroke="#94a3b8" strokeWidth="2" />
        <line x1="195" y1={360 - bodyH / 2} x2="230" y2={360 - bodyH / 2} stroke="#94a3b8" strokeWidth="2" />
        <rect x="10" y={360 - bodyH / 2 - 14} width="60" height="28" fill="url(#solarCells)" stroke="#60a5fa" />
        <rect x="230" y={360 - bodyH / 2 - 14} width="60" height="28" fill="url(#solarCells)" stroke="#60a5fa" />

        {/* Cuerpo por bandas */}
        {bands.map((b, i) => (
          <g key={b.label}>
            <rect x="105" y={bodyTop + i * bandH} width="90" height={bandH} fill={b.fill} />
            {bodyH >= 70 && (
              <text x="150" y={bodyTop + i * bandH + bandH / 2 + 3} textAnchor="middle" fill="#e2e8f0" fontSize="8">
                {b.label}
              </text>
            )}
          </g>
        ))}
        <rect x="105" y={bodyTop} width="90" height={bodyH} fill="none" stroke={color} strokeWidth="2" />

        {/* Antena */}
        <line x1="150" y1={bodyTop} x2="150" y2={bodyTop - 18} stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="150" cy={bodyTop - 22} r="6" fill="none" stroke="#cbd5e1" strokeWidth="2" />

        {/* Tobera */}
        <path d="M135 360 L150 376 L165 360 Z" fill="#94a3b8" />

        {/* Texto */}
        <text x="150" y="395" textAnchor="middle" fill="#e2e8f0" fontSize="12">
          {used_U.toFixed(1)}U / {maxFairing_U}U ({Math.round(ratio * 100)}%)
        </text>
        {!isCompliant && (
          <text x="150" y="20" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold" className="fairing-alert">
            {es ? '⚠ EXCEDE LA COFIA' : '⚠ FAIRING OVERFLOW'}
          </text>
        )}
      </svg>
    </div>
  );
}