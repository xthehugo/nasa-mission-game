import type { Language, VolumeMetrics } from '../types/mission';

interface Props {
  volume: VolumeMetrics;
  lang?: Language;
}

export default function SpacecraftBlueprint({ volume, lang = 'en' }: Props) {
  const { used_U, maxFairing_U, isCompliant } = volume;
  const ratio = maxFairing_U > 0 ? used_U / maxFairing_U : 0;
  const bodyH = Math.max(30, Math.min(ratio, 1.3) * 160);
  const color = isCompliant ? '#22c55e' : '#ef4444';

  return (
    <div className="w-full max-w-sm">
      <style>{`
        @keyframes fairingPulse { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
        .fairing-alert { animation: fairingPulse 0.8s infinite; }
      `}</style>
      <svg viewBox="0 0 300 400" width="100%" style={{ background: '#020617', borderRadius: 12 }}>
        {/* Cofia (fairing) */}
        <path
          d="M80 360 L80 160 Q80 60 150 40 Q220 60 220 160 L220 360 Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          className={isCompliant ? '' : 'fairing-alert'}
        />
        {/* Paneles solares (desplegados, línea punteada) */}
        <rect x="10" y={360 - bodyH / 2 - 10} width="60" height="20" fill="none" stroke="#60a5fa" strokeDasharray="4 3" />
        <rect x="230" y={360 - bodyH / 2 - 10} width="60" height="20" fill="none" stroke="#60a5fa" strokeDasharray="4 3" />
        {/* Cuerpo de la nave (altura = volumen usado) */}
        <rect x="105" y={360 - bodyH} width="90" height={bodyH} fill="#1e293b" stroke={color} strokeWidth="2" />
        {/* Antena */}
        <line x1="150" y1={360 - bodyH} x2="150" y2={360 - bodyH - 18} stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="150" cy={360 - bodyH - 22} r="6" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        {/* Tobera */}
        <path d="M135 360 L150 375 L165 360 Z" fill="#94a3b8" />
        {/* Texto */}
        <text x="150" y="395" textAnchor="middle" fill="#e2e8f0" fontSize="12">
          {used_U.toFixed(1)}U / {maxFairing_U}U
        </text>
        {!isCompliant && (
          <text x="150" y="20" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold" className="fairing-alert">
            {lang === 'es' ? '⚠ EXCEDE LA COFIA' : '⚠ FAIRING OVERFLOW'}
          </text>
        )}
      </svg>
    </div>
  );
}