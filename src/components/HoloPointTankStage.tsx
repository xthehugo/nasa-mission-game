import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { useMissionStore } from '../store';

function WireTank({
  x,
  y,
  w,
  h,
  pct,
  label,
  valText,
  alarm,
  reducedMotion,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  pct: number;
  label: string;
  valText: string;
  alarm: boolean;
  reducedMotion: boolean;
}) {
  const fillH = Math.max(0, Math.min(1, pct / 100)) * h;
  const stroke = alarm ? '#FF4D6D' : pct > 90 ? '#FFC15E' : '#5FF3FF';

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill="#04080F" stroke={stroke} strokeWidth="1" />
      <motion.rect
        x={x + 2}
        width={w - 4}
        rx="2"
        fill={stroke}
        fillOpacity="0.22"
        stroke={stroke}
        strokeWidth="0.8"
        initial={false}
        animate={{ y: y + h - fillH + 2, height: Math.max(0, fillH - 4) }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
      />
      <text x={x + w / 2} y={y - 8} textAnchor="middle" className="font-mono text-[9px]" fill={stroke}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h + 14} textAnchor="middle" className="font-mono text-[9px]" fill="#E2E8F0">
        {valText} · {pct}%
      </text>
    </g>
  );
}

export function HoloPointTankStage() {
  const {
    language,
    selection,
    metrics,
    tankFillPercent,
    oxidizerFillPercent,
    batteryChargePercent,
    dataBufferPercent,
    reducedMotion,
  } = useMissionStore();

  const isEs = language === 'es';
  const lv = findSubsystemById(selection.launchVehicleId);

  const extraTankMassKg = ((tankFillPercent + oxidizerFillPercent - 160) / 100) * Math.max(2, metrics.propellantMass_kg * 0.25);
  const liveWetMass = Math.max(1, metrics.wetMass_kg + extraTankMassKg);
  const overMass = liveWetMass > metrics.launchCapacity_kg;

  const fuelLiters = Math.round((Math.max(4, metrics.propellantMass_kg) * 0.65 * tankFillPercent) / 100);
  const oxLiters = Math.round((Math.max(4, metrics.propellantMass_kg) * 0.55 * oxidizerFillPercent) / 100);
  const battWh = Math.round((Math.max(40, metrics.power.eclipseRequired_W * 2.5) * batteryChargePercent) / 100);
  const dataGb = ((Math.max(1, metrics.telecom.dataRate_kbps) * 0.04 * dataBufferPercent) / 100).toFixed(1);

  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 500 325" className="h-[300px] w-full max-w-[540px] sm:h-[345px]">
        {/* Full Wireframe Rocket Left Side */}
        <motion.g
          animate={overMass && !reducedMotion ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
          transition={{ repeat: overMass ? Infinity : 0, duration: 0.7 }}
          stroke={overMass ? '#FF4D6D' : '#5FF3FF'}
          fill="none"
          strokeWidth="1"
        >
          <path d="M 92,38 Q 108,14 124,38 L 124,95 L 92,95 Z" />
          <rect x="90" y="95" width="36" height="90" />
          <rect x="86" y="185" width="44" height="95" />
          <polygon points="86,260 72,288 86,280" />
          <polygon points="130,260 144,288 130,280" />
          <polygon points="94,280 122,280 128,298 88,298" stroke="#FFC15E" />
          <text x="108" y="314" textAnchor="middle" className="font-mono text-[8.5px]" fill={overMass ? '#FF4D6D' : '#5FF3FF'}>
            {lv?.name[language].slice(0, 22) ?? 'LAUNCHER'}
          </text>
        </motion.g>

        {/* 4 Internal Wireframe Liquid/Energy Tanks */}
        <WireTank
          x={190}
          y={75}
          w={56}
          h={145}
          pct={tankFillPercent}
          label={isEs ? 'COMBUSTIBLE' : 'FUEL'}
          valText={`${fuelLiters} L`}
          alarm={overMass}
          reducedMotion={reducedMotion}
        />
        <WireTank
          x={268}
          y={75}
          w={56}
          h={145}
          pct={oxidizerFillPercent}
          label={isEs ? 'OXIDANTE' : 'OXIDIZER'}
          valText={`${oxLiters} L`}
          alarm={overMass}
          reducedMotion={reducedMotion}
        />
        <WireTank
          x={346}
          y={75}
          w={56}
          h={145}
          pct={batteryChargePercent}
          label={isEs ? 'BATERÍAS' : 'BATTERY'}
          valText={`${battWh} Wh`}
          alarm={metrics.power.status === 'RED'}
          reducedMotion={reducedMotion}
        />
        <WireTank
          x={424}
          y={75}
          w={56}
          h={145}
          pct={dataBufferPercent}
          label={isEs ? 'DATOS' : 'DATA'}
          valText={`${dataGb} GB`}
          alarm={metrics.telecom.status === 'RED'}
          reducedMotion={reducedMotion}
        />

        <text
          x="335"
          y="278"
          textAnchor="middle"
          className="font-mono text-[10px]"
          fill={overMass ? '#FF4D6D' : '#FFC15E'}
        >
          {overMass
            ? isEs
              ? `ALERTA DE MASA: ${liveWetMass.toFixed(1)} KG > ${metrics.launchCapacity_kg} KG`
              : `MASS OVERLOAD: ${liveWetMass.toFixed(1)} KG > ${metrics.launchCapacity_kg} KG`
            : isEs
              ? `MASA HÚMEDA ACTUAL: ${liveWetMass.toFixed(1)} / ${metrics.launchCapacity_kg} KG`
              : `LIVE WET MASS: ${liveWetMass.toFixed(1)} / ${metrics.launchCapacity_kg} KG`}
        </text>
      </svg>
    </div>
  );
}
