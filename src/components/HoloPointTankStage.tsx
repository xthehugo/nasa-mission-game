import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { useMissionStore } from '../store';
import { computeTankExtraMassKg } from './holoAudio';
import { project3D, projectRing3D, toSvgPoly } from './holo3d';

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
  const cx = x + w / 2;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill="#04080F" stroke={stroke} strokeWidth="1" />
      <ellipse cx={cx} cy={y + 2} rx={w / 2} ry="5" fill="#04080F" stroke={stroke} strokeOpacity="0.65" strokeWidth="0.9" />
      <ellipse cx={cx} cy={y + h - 2} rx={w / 2} ry="5" fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth="0.9" />
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
      <text x={cx} y={y - 10} textAnchor="middle" className="font-mono text-[9px]" fill={stroke}>
        {label}
      </text>
      <text x={cx} y={y + h + 15} textAnchor="middle" className="font-mono text-[9px]" fill="#E2E8F0">
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

  const [yawDeg, setYawDeg] = useState<number>(26);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [dragState, setDragState] = useState<{ x: number; yaw: number } | null>(null);
  const autoSpinRef = useRef<boolean>(autoSpin);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (autoSpinRef.current) {
        setYawDeg((y) => (y + dt * 16) % 360);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

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

  const CX_LV = 104;
  const CY_LV = 160;
  const PITCH = 20;
  const pLv = (x: number, y: number, z: number) =>
    project3D({ x, y, z }, yawDeg, PITCH, CX_LV, CY_LV);

  const projectLvBox = (w: number, yTop: number, yBot: number, d: number) => {
    const t = [pLv(-w, yTop, -d), pLv(w, yTop, -d), pLv(w, yTop, d), pLv(-w, yTop, d)];
    const b = [pLv(-w, yBot, -d), pLv(w, yBot, -d), pLv(w, yBot, d), pLv(-w, yBot, d)];
    return { top: toSvgPoly(t), bot: toSvgPoly(b), edges: t.map((pt, i) => [pt, b[i]]) };
  };

  const csdOuter = projectLvBox(32, -88, 86, 32);
  const csdInner = projectLvBox(22, -48, 44, 22);
  const fairStow = projectLvBox(22, -32, 54, 22);
  const fairOuterBase = projectRing3D(50, 50, 86, 20, yawDeg, PITCH, CX_LV, CY_LV);
  const fairOuterMid = projectRing3D(48, 48, -32, 20, yawDeg, PITCH, CX_LV, CY_LV);
  const fairInnerMid = projectRing3D(40, 40, -28, 16, yawDeg, PITCH, CX_LV, CY_LV);
  const fairInnerBase = projectRing3D(42, 42, 82, 16, yawDeg, PITCH, CX_LV, CY_LV);
  const fairApex = pLv(0, -124, 0);
  const pafTop = projectRing3D(20, 20, 54, 14, yawDeg, PITCH, CX_LV, CY_LV);
  const pafBot = projectRing3D(28, 28, 86, 14, yawDeg, PITCH, CX_LV, CY_LV);

  const espaTop = projectRing3D(48, 48, -28, 18, yawDeg, PITCH, CX_LV, CY_LV);
  const espaBot = projectRing3D(48, 48, 28, 18, yawDeg, PITCH, CX_LV, CY_LV);
  const cgPt = pLv(0, 0, 0);

  return (
    <div className="flex w-full flex-col items-center">
      <svg
        viewBox="0 0 500 325"
        onPointerDown={(e) => {
          setAutoSpin(false);
          setDragState({ x: e.clientX, yaw: yawDeg });
        }}
        onPointerMove={(e) => {
          if (!dragState) return;
          const dx = e.clientX - dragState.x;
          const next = (((dragState.yaw + dx * 0.7) % 360) + 360) % 360;
          setYawDeg(next);
        }}
        onPointerUp={() => setDragState(null)}
        onPointerLeave={() => setDragState(null)}
        className={`h-[295px] w-full max-w-[540px] select-none sm:h-[340px] ${
          dragState ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* 3D Rotating Launch Adapter / Fairing Envelope Left Side */}
        <motion.g
          animate={overMass && !reducedMotion ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
          transition={{ repeat: overMass ? Infinity : 0, duration: 0.7 }}
          fill="none"
        >
          {isCsd ? (
            /* 3D Rotating CSD / P-POD Canister Dispenser */
            <g stroke={strokeLv} strokeWidth="1">
              <polygon points={csdOuter.top} />
              <polygon points={csdOuter.bot} />
              {csdOuter.edges.map(([a, b], i) => (
                <line key={`csd-e-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFC15E" strokeWidth="1.5" />
              ))}
              <polygon points={csdInner.top} strokeDasharray="3 2" fill="#5FF3FF10" />
              <polygon points={csdInner.bot} strokeDasharray="3 2" fill="#5FF3FF10" />
              {csdInner.edges.map(([a, b], i) => (
                <line key={`csdi-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeDasharray="3 2" />
              ))}
              {/* +Z Spring Coil */}
              <polyline
                points={[
                  pLv(-14, 82, 0),
                  pLv(14, 72, 6),
                  pLv(-14, 62, -6),
                  pLv(14, 52, 6),
                  pLv(-12, 46, 0),
                ]
                  .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
                  .join(' ')}
                stroke="#FFC15E"
                strokeWidth="1.2"
              />
              <text x="106" y="42" textAnchor="middle" className="font-mono text-[8px]" fill="#FFC15E">
                CSD / P-POD CANISTER (+Z SPRING)
              </text>
              <text x="106" y="276" textAnchor="middle" className="font-mono text-[8px]" fill="#5FF3FF">
                3U: 340.5mm · 6U/12U: 366mm
              </text>
              <text x="106" y="290" textAnchor="middle" className="font-mono text-[7.5px]" fill="#FFC15E">
                MAX 45 KG · 24U INHIBIT SW OK
              </text>
            </g>
          ) : isVadrEspa ? (
            /* 3D Rotating NASA VADR / ESPAStar Secondary Ring */
            <g stroke={strokeLv} strokeWidth="1">
              <polygon points={toSvgPoly(espaTop)} strokeWidth="1.3" />
              <polygon points={toSvgPoly(espaBot)} strokeWidth="1.3" />
              {[0, 3, 6, 9, 12, 15].map((idx) => (
                <line
                  key={`espa-rib-${idx}`}
                  x1={espaTop[idx].x}
                  y1={espaTop[idx].y}
                  x2={espaBot[idx].x}
                  y2={espaBot[idx].y}
                  strokeOpacity="0.65"
                />
              ))}
              {/* Radial Clampband & Docked Smallsat on 0 & 180 deg Ports */}
              {[0, 180].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const dBox = [
                  pLv(Math.cos(rad) * 48, -16, Math.sin(rad) * 48),
                  pLv(Math.cos(rad) * 76, -22, Math.sin(rad) * 76),
                  pLv(Math.cos(rad) * 76, 22, Math.sin(rad) * 76),
                  pLv(Math.cos(rad) * 48, 16, Math.sin(rad) * 48),
                ];
                return (
                  <polygon
                    key={`espa-port-${deg}`}
                    points={toSvgPoly(dBox)}
                    fill="#5FF3FF12"
                    stroke="#FFC15E"
                  />
                );
              })}
              <circle cx={cgPt.x} cy={cgPt.y} r="4" fill="#FFC15E" />
              <text x={cgPt.x + 8} y={cgPt.y + 3} className="font-mono text-[7.5px]" fill="#FFC15E">
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
            /* 3D Rotating Commercial Clamshell Fairing (Falcon 9 / Electron) */
            <g stroke={strokeLv} strokeWidth="1">
              <polygon points={toSvgPoly(fairOuterBase)} strokeOpacity="0.65" />
              <polygon points={toSvgPoly(fairOuterMid)} strokeOpacity="0.85" />
              {[0, 5, 10, 15].map((idx) => (
                <g key={`f-rib-${idx}`}>
                  <line
                    x1={fairOuterBase[idx].x}
                    y1={fairOuterBase[idx].y}
                    x2={fairOuterMid[idx].x}
                    y2={fairOuterMid[idx].y}
                  />
                  <path
                    d={`M ${fairOuterMid[idx].x.toFixed(1)},${fairOuterMid[idx].y.toFixed(1)} Q ${(fairOuterMid[idx].x + fairApex.x) / 2},${fairApex.y + 12} ${fairApex.x.toFixed(1)},${fairApex.y.toFixed(1)}`}
                    strokeOpacity="0.9"
                  />
                </g>
              ))}
              {/* Dynamic Clearance Inner Envelope */}
              <polygon points={toSvgPoly(fairInnerMid)} stroke="#FFC15E" strokeDasharray="3 3" strokeWidth="0.9" />
              <polygon points={toSvgPoly(fairInnerBase)} stroke="#FFC15E" strokeDasharray="3 3" strokeWidth="0.9" />

              {/* Stowed Spacecraft 3D Box + CG */}
              <polygon points={fairStow.top} fill="#5FF3FF10" stroke="#5FF3FF" />
              <polygon points={fairStow.bot} fill="#5FF3FF08" stroke="#5FF3FF" />
              {fairStow.edges.map(([a, b], i) => (
                <line key={`fs-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5FF3FF" />
              ))}
              <circle cx={pLv(0, 11, 0).x} cy={pLv(0, 11, 0).y} r="4.5" fill="#FFC15E" />

              {/* PAF Adapter Frustum */}
              <polygon points={toSvgPoly(pafTop)} stroke="#FFC15E" />
              <polygon points={toSvgPoly(pafBot)} stroke="#FFC15E" />
              <line x1={pafTop[0].x} y1={pafTop[0].y} x2={pafBot[0].x} y2={pafBot[0].y} stroke="#FFC15E" />
              <line x1={pafTop[7].x} y1={pafTop[7].y} x2={pafBot[7].x} y2={pafBot[7].y} stroke="#FFC15E" />

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
            {lv?.name[language].slice(0, 26) ?? 'LAUNCHER'} · YAW {Math.round(yawDeg)}°
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

      {/* Lightweight Fairing / Adapter Turntable Bar */}
      <div className="mt-1 flex w-full max-w-[540px] items-center justify-between gap-3 border border-[#5FF3FF]/25 bg-[#04080F]/90 px-2.5 py-1.5 font-mono text-[9px]">
        <button
          type="button"
          onClick={() => setAutoSpin((s) => !s)}
          className={`border px-2 py-0.5 transition ${
            autoSpin
              ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/15 text-[#5FF3FF]'
              : 'border-[#FFC15E]/50 bg-[#FFC15E]/15 text-[#FFC15E]'
          }`}
        >
          {autoSpin
            ? isEs
              ? '⏸ PAUSAR COFIA 360°'
              : '⏸ PAUSE FAIRING 360°'
            : isEs
              ? '▶ GIRAR COFIA 360°'
              : '▶ SPIN FAIRING 360°'}
        </button>

        <div className="flex flex-1 items-center gap-2">
          <span className="text-slate-400">{isEs ? 'ÁNGULO:' : 'YAW:'}</span>
          <input
            id="holo-fairing-yaw-range"
            name="holoFairingYawDeg"
            type="range"
            min={0}
            max={359}
            value={Math.round(yawDeg)}
            onChange={(e) => {
              setAutoSpin(false);
              setYawDeg(Number(e.target.value));
            }}
            aria-label={isEs ? 'Rotación 3D de cofia' : 'Fairing 3D Yaw Rotation'}
            className="w-full accent-[#5FF3FF]"
          />
          <span className="w-8 text-right text-[#5FF3FF]">{Math.round(yawDeg)}°</span>
        </div>
      </div>
    </div>
  );
}
