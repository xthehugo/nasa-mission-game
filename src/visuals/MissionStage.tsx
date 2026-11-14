import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Language, OrbitalDestination, PhysicsMetrics, VolumeMetrics } from '../types/mission';
import OrbitalMapVisualizer from './OrbitalMapVisualizer';
import SpacecraftBlueprint from './SpacecraftBlueprint';

interface Props {
  destination: OrbitalDestination | null;
  volume: VolumeMetrics;
  metrics?: PhysicsMetrics;
  lang?: Language;
  controls?: ReactNode;
  embedded?: boolean;
}

type Stage = 'IDLE' | 'COUNTDOWN' | 'LAUNCH_ASCENT' | 'FAILURE' | 'CRUISE' | 'ORBIT_INSERTION';
type EmbeddedView = 'SPLIT' | 'MAP' | 'BLUEPRINT';

const COUNTDOWN_MS = 3000;
const ASCENT_MS = 6000;
const FAIL_POINT = 0.55; // la falla ocurre al 55% del ascenso

const T = {
  en: {
    launch: '🚀 LAUNCH',
    launchAnyway: 'LAUNCH ANYWAY',
    reset: '↺ RESET',
    viewSplit: 'SPLIT VIEW',
    viewMap: 'ORBITAL MAP',
    viewAscent: 'ASCENT & FAIRING',
    alt: 'Altitude',
    vel: 'Velocity',
    dv: 'ΔV used / required',
    mass: 'Wet Mass / Rocket',
    link: 'Link Margin / MCR',
    light: 'Light time',
    clock: 'Mission clock',
    orbitOk: 'ORBIT ACHIEVED ✓',
    nogoFairing: 'NO-GO: FAIRING OVERFLOW',
    nogoMass: 'NO-GO: ROCKET PAYLOAD OVERLOAD',
    anomalyFairing: 'ASCENT ANOMALY: FAIRING STRUCTURAL FAILURE',
    anomalyMass: 'ASCENT ANOMALY: INSUFFICIENT THRUST-TO-WEIGHT',
    lessonFairing: 'Lesson: reduce payload/subsystem volume or select a launch vehicle with a larger fairing.',
    lessonMass: 'Lesson: reduce dry mass, switch to higher-Isp propulsion, or pick a heavier rocket.',
    phases: {
      IDLE: 'READY ON PAD',
      COUNTDOWN: 'COUNTDOWN',
      LAUNCH_ASCENT: 'LAUNCH ASCENT',
      FAILURE: 'ASCENT ANOMALY',
      CRUISE: 'CRUISE TO DESTINATION',
      ORBIT_INSERTION: 'ORBIT INSERTION',
    },
  },
  es: {
    launch: '🚀 LANZAR',
    launchAnyway: 'LANZAR DE TODAS FORMAS',
    reset: '↺ REINICIAR',
    viewSplit: 'VISTA DUAL',
    viewMap: 'MAPA ORBITAL',
    viewAscent: 'ASCENSO Y COFIA',
    alt: 'Altitud',
    vel: 'Velocidad',
    dv: 'ΔV usado / requerido',
    mass: 'Masa Húmeda / Cohete',
    link: 'Enlace / Estado MCR',
    light: 'Tiempo de luz',
    clock: 'Reloj de misión',
    orbitOk: 'ÓRBITA ALCANZADA ✓',
    nogoFairing: 'NO-GO: EXCEDE LA COFIA',
    nogoMass: 'NO-GO: SOBREPESO EN LANZADOR',
    anomalyFairing: 'ANOMALÍA EN ASCENSO: FALLO ESTRUCTURAL DE COFIA',
    anomalyMass: 'ANOMALÍA EN ASCENSO: EMPUJE INSUFICIENTE POR SOBREPESO',
    lessonFairing: 'Lección: reduce el volumen usado o elige un lanzador con cofia más grande.',
    lessonMass: 'Lección: reduce masa seca, usa propulsión de mayor Isp o un lanzador más potente.',
    phases: {
      IDLE: 'LISTO EN PLATAFORMA',
      COUNTDOWN: 'CUENTA REGRESIVA',
      LAUNCH_ASCENT: 'ASCENSO DE LANZAMIENTO',
      FAILURE: 'ANOMALÍA EN EL ASCENSO',
      CRUISE: 'CRUCERO AL DESTINO',
      ORBIT_INSERTION: 'INSERCIÓN ORBITAL',
    },
  },
};

const DEBRIS = [
  { dx: -120, dy: -90, s: 10 },
  { dx: 110, dy: -100, s: 8 },
  { dx: -150, dy: 20, s: 12 },
  { dx: 140, dy: 40, s: 9 },
  { dx: -70, dy: 120, s: 7 },
  { dx: 80, dy: 130, s: 11 },
  { dx: -30, dy: -140, s: 8 },
  { dx: 40, dy: -150, s: 6 },
  { dx: -170, dy: -30, s: 7 },
  { dx: 170, dy: -20, s: 10 },
];

const makeStars = (n: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i * 379 + seed * 97) % 2000;
    const y = (i * 613 + seed * 53) % 2000;
    pts.push(`${x}px ${y}px #fff`, `${x}px ${y + 2000}px #fff`);
  }
  return pts.join(',');
};

const css = `
@keyframes starScroll { from { transform: translateY(0) } to { transform: translateY(-2000px) } }
@keyframes shake { 0%,100% { transform: translate(0,0) } 25% { transform: translate(-2px,1px) } 50% { transform: translate(2px,-1px) } 75% { transform: translate(-1px,-2px) } }
@keyframes shakeHard { 0%,100% { transform: translate(0,0) } 25% { transform: translate(-5px,3px) } 50% { transform: translate(5px,-3px) } 75% { transform: translate(-3px,-5px) } }
@keyframes flame { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.4) } }
@keyframes pop { from { transform: scale(1.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes slideIn { from { transform: translateX(-20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes flash { 0% { opacity: .8 } 100% { opacity: 0 } }
@keyframes failFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1 } 100% { transform: translateY(170px) rotate(25deg); opacity: .12 } }
@keyframes debris { 0% { transform: translate(0,0) rotate(0deg); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) rotate(360deg); opacity: 0 } }
`;

const fmtLight = (s: number) => (s < 60 ? `${s.toFixed(1)} s` : `${(s / 60).toFixed(1)} min`);

export default function MissionStage({
  destination,
  volume,
  metrics,
  lang = 'en',
  controls,
  embedded = false,
}: Props) {
  const t = T[lang];
  const fairingOverflow = !volume.isCompliant;
  const massOverload = Boolean(
    metrics && metrics.wetMass_kg > metrics.launchCapacity_kg,
  );
  const failed = fairingOverflow || massOverload;
  const nogoMessage = fairingOverflow
    ? `${t.nogoFairing} (${volume.used_U.toFixed(1)}U / ${volume.maxFairing_U}U)`
    : `${t.nogoMass} (${metrics?.wetMass_kg} kg / ${metrics?.launchCapacity_kg} kg)`;
  const anomalyHeadline = fairingOverflow ? t.anomalyFairing : t.anomalyMass;
  const anomalyLesson = fairingOverflow ? t.lessonFairing : t.lessonMass;
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [embeddedView, setEmbeddedView] = useState<EmbeddedView>('SPLIT');

  useEffect(() => {
    if (startedAt === null) return;
    let raf = 0;
    const loop = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [startedAt]);

  const layers = useMemo(
    () => [
      { shadow: makeStars(90, 1), size: 1, dur: 160, op: 0.5 },
      { shadow: makeStars(60, 2), size: 2, dur: 100, op: 0.7 },
      { shadow: makeStars(30, 3), size: 3, dur: 60, op: 0.9 },
    ],
    [],
  );

  const elapsed = startedAt === null ? 0 : Math.max(0, now - startedAt);
  const lightSec = destination?.oneWayLightTimeSec ?? 0;
  const cruiseMs = 4000 + 1500 * Math.log10(1 + lightSec); // más lejos = viaje más largo (escala comprimida)
  const ascentEnd = COUNTDOWN_MS + ASCENT_MS;
  const failAt = COUNTDOWN_MS + ASCENT_MS * FAIL_POINT;

  const stage: Stage =
    startedAt === null
      ? 'IDLE'
      : elapsed < COUNTDOWN_MS
        ? 'COUNTDOWN'
        : failed && elapsed >= failAt
          ? 'FAILURE'
          : elapsed < ascentEnd
            ? 'LAUNCH_ASCENT'
            : elapsed < ascentEnd + cruiseMs
              ? 'CRUISE'
              : 'ORBIT_INSERTION';

  // si falla, todo se congela en el momento de la falla
  const eff = failed ? Math.min(elapsed, failAt) : elapsed;

  const count = Math.max(1, Math.ceil((COUNTDOWN_MS - elapsed) / 1000));
  const ascent = Math.min(1, Math.max(0, (eff - COUNTDOWN_MS) / ASCENT_MS));
  const eased = 1 - Math.pow(1 - ascent, 3);
  const cruise = failed ? 0 : Math.min(1, Math.max(0, (elapsed - ascentEnd) / cruiseMs));
  const cruiseEased = cruise * cruise * (3 - 2 * cruise);
  const destKm = destination?.distanceFromEarthKm ?? 400;
  const altitudeKm = Math.round(400 * eased + Math.max(0, destKm - 400) * cruiseEased);
  const targetDeltaV = metrics?.deltaV_required_ms ?? destination?.requiredDeltaV_ms ?? 0;
  const dvUsed = Math.round(targetDeltaV * cruiseEased);
  const velocity = (7.67 * eased).toFixed(2);
  const dim = stage === 'COUNTDOWN' || stage === 'LAUNCH_ASCENT' || stage === 'FAILURE';

  const clock =
    stage === 'IDLE'
      ? '—'
      : stage === 'COUNTDOWN'
        ? `T-${count}`
        : `T+${((eff - COUNTDOWN_MS) / 1000).toFixed(1)} s`;

  const cards: [string, string][] = [
    [t.alt, `${altitudeKm.toLocaleString()} km`],
    [t.vel, `${velocity} km/s`],
    [
      t.dv,
      destination
        ? `${dvUsed.toLocaleString()} / ${targetDeltaV.toLocaleString()} m/s`
        : '—',
    ],
    ...(metrics
      ? ([
          [t.mass, `${metrics.wetMass_kg.toLocaleString()} / ${metrics.launchCapacity_kg.toLocaleString()} kg`],
          [t.link, `${metrics.telecom.linkMargin_dB} dB (${metrics.overallMCRStatus})`],
        ] as [string, string][])
      : []),
    [t.light, destination ? fmtLight(destination.oneWayLightTimeSec) : '—'],
    [t.clock, clock],
  ];

  const toggle = () => {
    if (startedAt === null) {
      const n = performance.now();
      setNow(n);
      setStartedAt(n);
    } else {
      setStartedAt(null);
    }
  };

  const titleColor =
    stage === 'ORBIT_INSERTION' ? '#5FF3FF' : stage === 'FAILURE' ? '#FF4D6D' : '#e2e8f0';

  const shipAnimation =
    stage === 'LAUNCH_ASCENT'
      ? failed
        ? 'shakeHard .06s infinite'
        : 'shake .12s infinite'
      : stage === 'FAILURE'
        ? 'failFall 2.5s ease-in forwards'
        : 'none';

  const showMap = !embedded || embeddedView !== 'BLUEPRINT';
  const showBlueprint = !embedded || embeddedView !== 'MAP';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: embedded ? 440 : '100vh',
        overflow: 'hidden',
        background: embedded
          ? 'radial-gradient(ellipse at 50% 45%, rgba(95,243,255,0.08) 0%, #04080F 72%)'
          : 'radial-gradient(ellipse at 50% 0%, #0b1a3a 0%, #020617 70%)',
        color: '#fff',
      }}
    >
      <style>{css}</style>

      {layers.map((l, k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: l.size,
            height: l.size,
            borderRadius: '50%',
            boxShadow: l.shadow,
            opacity: embedded ? l.op * 0.65 : l.op,
            animation: `starScroll ${l.dur}s linear infinite`,
          }}
        />
      ))}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: embedded ? 440 : '100vh',
          padding: embedded ? 12 : 16,
          gap: embedded ? 12 : 16,
        }}
      >
        {/* Barra superior */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            {!embedded && (
              <div style={{ fontSize: 12, letterSpacing: 4, color: '#64748b' }}>ORBITAL FORGE</div>
            )}
            <div
              className={embedded ? 'font-mono tracking-[0.12em] uppercase' : undefined}
              style={{ fontSize: embedded ? 14 : 22, fontWeight: 700, color: titleColor }}
            >
              {t.phases[stage]}
            </div>
            {stage === 'ORBIT_INSERTION' && (
              <div className={embedded ? 'font-mono text-[11px]' : undefined} style={{ fontSize: embedded ? 11 : 12, color: '#5FF3FF' }}>
                {t.orbitOk}
              </div>
            )}
            {stage === 'IDLE' && failed && (
              <div style={{ fontSize: embedded ? 11 : 13, fontWeight: 700, color: '#FF4D6D' }}>
                {nogoMessage}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            {controls}
            {embedded && (
              <div className="flex border border-[#5FF3FF]/25 bg-[#04080F]/90 p-0.5 font-mono text-[9.5px]">
                {(
                  [
                    ['SPLIT', t.viewSplit],
                    ['MAP', t.viewMap],
                    ['BLUEPRINT', t.viewAscent],
                  ] as const
                ).map(([viewKey, label]) => (
                  <button
                    key={viewKey}
                    type="button"
                    onClick={() => setEmbeddedView(viewKey)}
                    className={`px-2 py-1 transition ${
                      embeddedView === viewKey
                        ? 'bg-[#5FF3FF]/15 text-[#5FF3FF]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={toggle}
              className={embedded ? 'font-mono text-[10px] tracking-[0.14em] uppercase' : undefined}
              style={{
                padding: embedded ? '6px 12px' : '8px 18px',
                borderRadius: embedded ? 2 : 8,
                fontWeight: 700,
                background:
                  startedAt !== null
                    ? '#1e293b'
                    : failed
                      ? 'rgba(255,77,109,0.2)'
                      : embedded
                        ? 'rgba(95,243,255,0.16)'
                        : '#ef4444',
                border:
                  startedAt === null && failed
                    ? '1px solid #FF4D6D'
                    : embedded
                      ? '1px solid #5FF3FF'
                      : '1px solid transparent',
                color: startedAt === null && failed ? '#FF4D6D' : embedded ? '#5FF3FF' : '#fff',
                cursor: 'pointer',
              }}
            >
              {startedAt !== null ? t.reset : failed ? t.launchAnyway : t.launch}
            </button>
          </div>
        </div>

        {/* Centro: mapa + nave */}
        <div
          className={
            embedded
              ? `grid flex-1 items-center gap-3 ${
                  embeddedView === 'SPLIT' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
                }`
              : undefined
          }
          style={
            embedded
              ? undefined
              : {
                  flex: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 32,
                }
          }
        >
          {showMap && (
            <div
              className={embedded ? 'mx-auto w-full max-w-[440px]' : undefined}
              style={{
                width: embedded ? '100%' : 'min(92vw, 560px)',
                borderRadius: embedded ? 6 : 12,
                transition: 'opacity 1s, filter 1s, box-shadow 1s',
                opacity: dim ? 0.3 : 1,
                filter: dim ? 'blur(1px)' : 'none',
                boxShadow: stage === 'ORBIT_INSERTION' ? '0 0 36px rgba(95,243,255,0.28)' : 'none',
              }}
            >
              <OrbitalMapVisualizer
                destination={destination}
                lang={lang}
                className="max-w-none"
                progress={stage === 'CRUISE' ? cruiseEased : stage === 'ORBIT_INSERTION' ? 1 : null}
              />
            </div>
          )}

          {showBlueprint && (
            <div
              className={embedded ? 'mx-auto w-full max-w-[300px]' : undefined}
              style={{
                position: 'relative',
                width: embedded ? '100%' : 'min(92vw, 420px)',
                transform: `translateY(${-ascent * (embedded ? 16 : 30)}px)`,
              }}
            >
              <div style={{ animation: shipAnimation }}>
                <SpacecraftBlueprint volume={volume} lang={lang} className="max-w-none" />
              </div>

              {!embedded && stage !== 'IDLE' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12%',
                    left: '100%',
                    marginLeft: 12,
                    width: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    animation: 'slideIn .6s ease-out',
                  }}
                >
                  {cards.map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: 'rgba(30,41,59,0.8)',
                        borderLeft: `3px solid ${stage === 'FAILURE' ? '#ef4444' : '#38bdf8'}`,
                        borderRadius: 8,
                        padding: '6px 10px',
                      }}
                    >
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {stage === 'LAUNCH_ASCENT' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '93%',
                    left: '50%',
                    marginLeft: -9,
                    width: 18,
                    height: 90,
                    borderRadius: '0 0 50% 50%',
                    background: 'linear-gradient(#fde68a, #f97316, transparent)',
                    transformOrigin: 'top',
                    animation: 'flame .1s infinite',
                    filter: 'blur(1px)',
                  }}
                />
              )}

              {/* Pedazos de la cofia al explotar */}
              {stage === 'FAILURE' &&
                DEBRIS.map((d, i) => (
                  <div
                    key={i}
                    style={
                      {
                        position: 'absolute',
                        top: '45%',
                        left: '50%',
                        width: d.s,
                        height: d.s,
                        background: i % 2 ? '#f97316' : '#ef4444',
                        '--dx': `${d.dx}px`,
                        '--dy': `${d.dy}px`,
                        animation: 'debris 1.6s ease-out forwards',
                      } as CSSProperties
                    }
                  />
                ))}
            </div>
          )}
        </div>

        {/* Barra inferior de telemetría en modo embebido (evita recorte en columnas laterales) */}
        {embedded && stage !== 'IDLE' && (
          <div className="grid grid-cols-2 gap-1.5 border-t border-[#5FF3FF]/20 pt-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map(([label, value]) => (
              <div
                key={label}
                className={`border px-2.5 py-1.5 ${
                  stage === 'FAILURE'
                    ? 'border-[#FF4D6D]/50 bg-[#04080F]/90'
                    : 'border-[#5FF3FF]/25 bg-[#04080F]/90'
                }`}
              >
                <div className="font-mono text-[8.5px] tracking-wider text-slate-400 uppercase">
                  {label}
                </div>
                <div className="font-mono text-[11px] font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destello rojo de la falla */}
      {stage === 'FAILURE' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            background: '#ef4444',
            pointerEvents: 'none',
            animation: 'flash 1.2s ease-out forwards',
          }}
        />
      )}

      {/* Mensaje de falla */}
      {stage === 'FAILURE' && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            zIndex: 6,
            width: 'min(92%, 560px)',
            textAlign: 'center',
            background: 'rgba(127,29,29,0.9)',
            border: '1px solid #FF4D6D',
            borderRadius: embedded ? 4 : 12,
            padding: '10px 14px',
            animation: 'pop .6s ease-out',
          }}
        >
          <div style={{ fontSize: embedded ? 14 : 18, fontWeight: 800 }}>{anomalyHeadline}</div>
          <div style={{ fontSize: embedded ? 11 : 13, marginTop: 4, color: '#fecaca' }}>
            {anomalyLesson}
          </div>
        </div>
      )}

      {/* Cuenta regresiva */}
      {stage === 'COUNTDOWN' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            key={count}
            style={{
              fontSize: embedded ? 'min(22vw, 150px)' : 'min(40vw, 260px)',
              fontWeight: 800,
              color: '#f8fafc',
              textShadow: '0 0 40px #5FF3FF',
              animation: 'pop .9s ease-out',
            }}
          >
            {count}
          </div>
        </div>
      )}
    </div>
  );
}