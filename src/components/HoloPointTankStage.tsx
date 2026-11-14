import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { useMissionStore } from '../store';
import { computeTankExtraMassKg } from './holoAudio';

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
  const isCsd = selection.launchVehicleId === 'lv-rideshare';
  const isVadrEspa = selection.launchVehicleId === 'lv-vadr-rideshare';

  const extraTankMassKg = computeTankExtraMassKg(
    metrics,
    tankFillPercent,
    oxidizerFillPercent,
  );
  const liveWetMass = Math.max(1, metrics.wetMass_kg + extraTankMassKg);
  const overMass = liveWetMass > metrics.launchCapacity_kg || !metrics.volume.isCompliant;
  const strokeLv = overMass ? '#FF4D6D' : '#5FF3FF';

  const fuelLiters = Math.round((Math.max(4, metrics.propellantMass_kg) * 0.65 * tankFillPercent) / 100);
  const oxLiters = Math.round((Math.max(4, metrics.propellantMass_kg) * 0.55 * oxidizerFillPercent) / 100);
  const battWh = Math.round((Math.max(40, metrics.power.eclipseRequired_W * 2.5) * batteryChargePercent) / 100);
  const dataGb = ((Math.max(1, metrics.telecom.dataRate_kbps) * 0.04 * dataBufferPercent) / 100).toFixed(1);

  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 500 325" className="h-[300px] w-full max-w-[540px] sm:h-[345px]">
        {/* Real Launch Adapter / Fairing Envelope Left Side */}
        <motion.g
          animate={overMass && !reducedMotion ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
          transition={{ repeat: overMass ? Infinity : 0, duration: 0.7 }}
          fill="none"
        >
          {isCsd ? (
            /* CSD / P-POD Canisterized Dispenser with +Z Spring & Inhibitor Switches */
            <g stroke={strokeLv} strokeWidth="1">
              <rect x="64" y="64" width="84" height="196" strokeWidth="1.2" />
              {/* Internal rails */}
              <line x1="72" y1="64" x2="72" y2="260" stroke="#FFC15E" strokeWidth="1.5" />
              <line x1="140" y1="64" x2="140" y2="260" stroke="#FFC15E" strokeWidth="1.5" />
              {/* Spacecraft envelope inside canister */}
              <rect x="76" y="102" width="60" height="122" strokeDasharray="3 2" fill="#5FF3FF10" />
              {/* Bottom +Z Ejection Spring & Plunger */}
              <polyline
                points="90,256 122,248 90,240 122,232 90,224"
                stroke="#FFC15E"
                strokeWidth="1.2"
              />
              {/* Deployment inhibitor switches on door */}
              <line x1="64" y1="64" x2="148" y2="54" stroke="#FFC15E" strokeWidth="1.2" />
              <circle cx="72" cy="160" r="3" fill="#FFC15E" />
              <text x="106" y="42" textAnchor="middle" className="font-mono text-[8px]" fill="#FFC15E">
                CSD / P-POD CANISTER (+Z SPRING)
              </text>
              <text x="106" y="280" textAnchor="middle" className="font-mono text-[8px]" fill="#5FF3FF">
                3U: 340.5mm · 6U/12U: 366mm
              </text>
              <text x="106" y="294" textAnchor="middle" className="font-mono text-[7.5px]" fill="#FFC15E">
                MAX 45 KG · 24U INHIBIT SW OK
              </text>
            </g>
          ) : isVadrEspa ? (
            /* NASA VADR / ESPAStar Secondary Ring (Ø1.575m x 0.61m, 6 Ports) */
            <g stroke={strokeLv} strokeWidth="1">
              {/* ESPA Ring Cross-Section */}
              <ellipse cx="106" cy="145" rx="52" ry="18" strokeWidth="1.3" />
              <ellipse cx="106" cy="205" rx="52" ry="18" strokeWidth="1.3" />
              <line x1="54" y1="145" x2="54" y2="205" strokeWidth="1.3" />
              <line x1="158" y1="145" x2="158" y2="205" strokeWidth="1.3" />
              {/* Radial Clampband & Payload Docked on Port */}
              <rect x="38" y="156" width="16" height="38" stroke="#FFC15E" />
              <polygon points="10,150 38,158 38,192 10,200" fill="#5FF3FF10" stroke="#5FF3FF" />
              <circle cx="106" cy="175" r="4" fill="#FFC15E" />
              <text x="106" y="170" textAnchor="middle" className="font-mono text-[7.5px]" fill="#FFC15E">
                CG
              </text>
              <text x="106" y="64" textAnchor="middle" className="font-mono text-[8px]" fill="#FFC15E">
                ESPA / ESPASTAR RING (VADR)
              </text>
              <text x="106" y="80" textAnchor="middle" className="font-mono text-[7.5px]" fill="#5FF3FF">
                Ø1.575 m (62&quot;) × 0.61 m (24&quot;)
              </text>
              <text x="106" y="246" textAnchor="middle" className="font-mono text-[7.5px]" fill="#FFC15E">
                6 RADIAL PORTS · 0.71m DEPTH
              </text>
              <text x="106" y="260" textAnchor="middle" className="font-mono text-[7.5px]" fill="#5FF3FF">
                ≥320 KG/PORT · LOW-SHOCK CLAMP
              </text>
            </g>
          ) : (
            /* Commercial Clamshell Fairing (Falcon 9 / Electron Ø5.2m -> Ø4.6m Dynamic + >=50mm Clearance) */
            <g stroke={strokeLv} strokeWidth="1">
              {/* Static outer acoustic shell (Ø5.2m) */}
              <path d="M 52,258 L 52,115 Q 52,44 106,24 Q 160,44 160,115 L 160,258 Z" strokeWidth="1.2" />
              {/* Dynamic usable envelope (Ø4.6m x 11.0m, >=50mm clearance dashed) */}
              <path
                d="M 62,254 L 62,120 Q 62,60 106,42 Q 150,60 150,120 L 150,254 Z"
                stroke="#FFC15E"
                strokeDasharray="3 3"
                strokeWidth="0.9"
              />
              {/* Stowed spacecraft silhouette + CG */}
              <rect x="78" y="128" width="56" height="96" fill="#5FF3FF10" stroke="#5FF3FF" strokeWidth="1.1" />
              <circle cx="106" cy="176" r="5" fill="#FFC15E" />
              <line x1="96" y1="176" x2="116" y2="176" stroke="#FFC15E" strokeWidth="0.8" />
              <line x1="106" y1="166" x2="106" y2="186" stroke="#FFC15E" strokeWidth="0.8" />
              <text x="115" y="174" className="font-mono text-[7.5px]" fill="#FFC15E">
                CG
              </text>
              {/* PAF Adapter cone */}
              <polygon points="84,224 128,224 136,258 76,258" stroke="#FFC15E" />
              <text x="106" y="274" textAnchor="middle" className="font-mono text-[8px]" fill="#5FF3FF">
                {selection.launchVehicleId === 'lv-falcon9'
                  ? 'FALCON 9 · OD Ø5.2m / DYN Ø4.6m×11m'
                  : 'DEDICATED FAIRING · 350U / 300 KG'}
              </text>
              <text x="106" y="288" textAnchor="middle" className="font-mono text-[7.5px]" fill="#FFC15E">
                {isEs ? 'HOLGURA DINÁMICA ≥50 mm CLEARANCE' : 'DYNAMIC WALL CLEARANCE ≥50 mm'}
              </text>
            </g>
          )}
          <text
            x="106"
            y="312"
            textAnchor="middle"
            className="font-mono text-[8px]"
            fill={overMass ? '#FF4D6D' : '#5FF3FF'}
          >
            {lv?.name[language].slice(0, 26) ?? 'LAUNCHER'}
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
          y="264"
          textAnchor="middle"
          className="font-mono text-[9.5px]"
          fill={overMass ? '#FF4D6D' : '#FFC15E'}
        >
          {overMass
            ? isEs
              ? `ALERTA: ${liveWetMass.toFixed(1)} KG / ${metrics.volume.used_U.toFixed(0)}U (LÍMITE ${metrics.launchCapacity_kg}KG / ${metrics.volume.maxFairing_U}U)`
              : `OVERLOAD: ${liveWetMass.toFixed(1)} KG / ${metrics.volume.used_U.toFixed(0)}U (LIMIT ${metrics.launchCapacity_kg}KG / ${metrics.volume.maxFairing_U}U)`
            : isEs
              ? `MASA HÚMEDA ACTUAL: ${liveWetMass.toFixed(1)} / ${metrics.launchCapacity_kg} KG`
              : `LIVE WET MASS: ${liveWetMass.toFixed(1)} / ${metrics.launchCapacity_kg} KG`}
        </text>
        <text x="335" y="282" textAnchor="middle" className="font-mono text-[8px]" fill="#5FF3FF">
          NASA-STD-5001B COPV PROOF TEST 1.05×–1.20× MDP · ULT FoS ≥1.40×
        </text>
      </svg>
    </div>
  );
}
