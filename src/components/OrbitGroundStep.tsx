import {
  findObjectiveById,
  GROUND_STATIONS,
  ORBITAL_DESTINATIONS,
} from '../engine';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

const PRESET_INCLINATIONS: { deg: number; label: { en: string; es: string } }[] = [
  { deg: 0, label: { en: '0° EQU', es: '0° ECU' } },
  { deg: 51.6, label: { en: '51.6° ISS', es: '51.6° ISS' } },
  { deg: 98, label: { en: '98° SSO', es: '98° SSO' } },
];

export function OrbitGroundStep({ zone = 'LEFT' }: { zone?: 'LEFT' | 'RIGHT' }) {
  const {
    language,
    selection,
    orbitAltitudeKm,
    orbitInclinationDeg,
    soundEnabled,
    setOrbitParams,
    setDestination,
    setGroundStation,
  } = useMissionStore();

  const isEs = language === 'es';
  const objective = findObjectiveById(selection.objectiveId);
  const isGeocentric =
    selection.destinationId === 'dest-leo' || selection.destinationId === 'dest-geo';
  const minAlt = isGeocentric ? 250 : 100;
  const maxAlt = isGeocentric ? 35786 : 2000;
  const stepAlt = isGeocentric ? 50 : 25;
  const clampedAlt = Math.max(minAlt, Math.min(maxAlt, orbitAltitudeKm));

  if (zone === 'LEFT') {
    return (
      <div className="space-y-4">
        <div className="font-mono text-[10px] tracking-[0.18em] text-[#5FF3FF] uppercase">
          {isEs ? 'PARÁMETROS ORBITALES' : 'ORBITAL PARAMETERS'}
        </div>

        <div className="border border-[#5FF3FF]/25 p-3">
          <div className="flex justify-between font-mono text-[10px] uppercase">
            <span className="text-slate-400">
              {isGeocentric
                ? isEs
                  ? 'ALTITUD'
                  : 'ALTITUDE'
                : isEs
                  ? 'PERIAPSIS DESTINO'
                  : 'TARGET ALTITUDE'}
            </span>
            <span className="text-[#5FF3FF]">{clampedAlt.toLocaleString()} KM</span>
          </div>
          <input
            id="orbit-altitude-range"
            name="orbitAltitudeKm"
            type="range"
            min={minAlt}
            max={maxAlt}
            step={stepAlt}
            value={clampedAlt}
            onChange={(e) => setOrbitParams(Number(e.target.value), orbitInclinationDeg)}
            className="mt-2 w-full accent-[#5FF3FF]"
          />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-500">
            <span>{isGeocentric ? 'LEO 250 KM' : 'ORBIT 100 KM'}</span>
            <span>{isGeocentric ? 'GEO 35,786 KM' : 'APO 2,000 KM'}</span>
          </div>
        </div>

        <div className="border border-[#5FF3FF]/25 p-3">
          <div className="flex justify-between font-mono text-[10px] uppercase">
            <span className="text-slate-400">{isEs ? 'INCLINACIÓN' : 'INCLINATION'}</span>
            <span className="text-[#FFC15E]">{orbitInclinationDeg.toFixed(1)}°</span>
          </div>
          <input
            id="orbit-inclination-range"
            name="orbitInclinationDeg"
            type="range"
            min={0}
            max={98}
            step={0.5}
            value={orbitInclinationDeg}
            onChange={(e) => setOrbitParams(clampedAlt, Number(e.target.value))}
            className="mt-2 w-full accent-[#FFC15E]"
          />
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {PRESET_INCLINATIONS.map((p) => (
              <button
                key={p.deg}
                type="button"
                onClick={() => {
                  setOrbitParams(clampedAlt, p.deg);
                  playHoloTone('STEP', soundEnabled);
                }}
                className="border border-[#5FF3FF]/25 py-1 font-mono text-[9px] text-slate-300 hover:border-[#5FF3FF] hover:text-white"
              >
                {p.label[language]}
              </button>
            ))}
          </div>
        </div>

        {selection.destinationId === 'dest-geo' && (
          <div className="border border-[#5FF3FF]/45 bg-[#5FF3FF]/8 p-3 font-mono text-[9.5px] leading-relaxed">
            <div className="font-bold tracking-[0.14em] text-[#5FF3FF] uppercase">
              NASA GMAT R2026a VERIFIED
            </div>
            <div className="mt-1 text-slate-200">
              TOI +2,240 m/s · GOI +1,433 m/s · ΔV 3,673 m/s (12 iter DC)
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
          {isEs ? 'DESTINO ORBITAL' : 'TARGET ORBIT'}
        </div>
        <div className="space-y-1.5">
          {ORBITAL_DESTINATIONS.map((dest) => {
            const active = selection.destinationId === dest.id;
            const isTarget = objective.targetDestinationId === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  setDestination(dest.id);
                  playHoloTone('STEP', soundEnabled);
                }}
                className={`w-full border p-2.5 text-left transition ${
                  active
                    ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white'
                    : 'border-[#5FF3FF]/20 text-slate-300 hover:border-[#5FF3FF]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-light">{dest.name[language]}</span>
                  {isTarget && (
                    <span className="font-mono text-[9px] text-[#FFC15E]">TARGET</span>
                  )}
                </div>
                <div className="mt-1 font-mono text-[9px] text-[#5FF3FF]">
                  ΔV {dest.requiredDeltaV_ms} M/S · {dest.solarIrradiance_Wm2} W/M²
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
          {isEs ? 'ESTACIÓN TERRENA' : 'GROUND NETWORK'}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {GROUND_STATIONS.map((gs) => (
            <button
              key={gs.id}
              type="button"
              onClick={() => {
                setGroundStation(gs.id);
                playHoloTone('STEP', soundEnabled);
              }}
              className={`border p-2 text-left transition ${
                selection.groundStationId === gs.id
                  ? 'border-[#5FF3FF] bg-[#5FF3FF]/10 text-white'
                  : 'border-[#5FF3FF]/20 text-slate-400 hover:border-[#5FF3FF]/50'
              }`}
            >
              <div className="text-[11px] font-light leading-tight">{gs.name[language]}</div>
              <div className="mt-1 font-mono text-[9px] text-[#FFC15E]">${gs.costPerMonth_MillionsUSD}M/M</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
