import { useState } from 'react';
import MissionStage from './MissionStage';
import type { OrbitalDestination } from '../types/mission';

const base = {
  description: { en: '', es: '' },
  solarIrradiance_Wm2: 1361,
  environmentHazard: { en: '', es: '' },
};

const DESTS: OrbitalDestination[] = [
  {
    ...base,
    id: 'leo',
    name: { en: 'Low Earth Orbit', es: 'Órbita Terrestre Baja' },
    heliocentricDistanceAU: 1,
    requiredDeltaV_ms: 150,
    eclipseFraction: 0.35,
    oneWayLightTimeSec: 0.002,
    distanceFromEarthKm: 400,
    requiredGroundNetwork: 'NEAR_EARTH_NETWORK',
    linkMarginThreshold_dB: 6,
  },
  {
    ...base,
    id: 'moon',
    name: { en: 'Moon', es: 'Luna' },
    heliocentricDistanceAU: 1,
    requiredDeltaV_ms: 3950,
    eclipseFraction: 0.1,
    oneWayLightTimeSec: 1.28,
    distanceFromEarthKm: 384_400,
    requiredGroundNetwork: 'NEAR_EARTH_NETWORK',
    linkMarginThreshold_dB: 3,
  },
  {
    ...base,
    id: 'mars',
    name: { en: 'Mars', es: 'Marte' },
    heliocentricDistanceAU: 1.52,
    requiredDeltaV_ms: 4500,
    eclipseFraction: 0.4,
    oneWayLightTimeSec: 750,
    distanceFromEarthKm: 225_000_000,
    requiredGroundNetwork: 'DSN_34M',
    linkMarginThreshold_dB: 3,
  },
  {
    ...base,
    id: 'jupiter',
    name: { en: 'Jupiter', es: 'Júpiter' },
    heliocentricDistanceAU: 5.2,
    requiredDeltaV_ms: 6800,
    eclipseFraction: 0.05,
    oneWayLightTimeSec: 2700,
    distanceFromEarthKm: 628_000_000,
    requiredGroundNetwork: 'DSN_70M',
    linkMarginThreshold_dB: 3,
  },
];

export default function VisualsDemo() {
  const [i, setI] = useState(0);
  const [used, setUsed] = useState(4);
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const max = 6;

  return (
    <MissionStage
      destination={DESTS[i]}
      volume={{ used_U: used, maxFairing_U: max, isCompliant: used <= max }}
      lang={lang}
      controls={
        <>
          {DESTS.map((d, k) => (
            <button
              key={d.id}
              onClick={() => setI(k)}
              className={`px-3 py-1 rounded ${k === i ? 'bg-sky-600' : 'bg-slate-700'}`}
            >
              {d.name[lang]}
            </button>
          ))}
          <label className="text-xs text-slate-300 flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={used}
              onChange={(e) => setUsed(Number(e.target.value))}
            />
            {used}U
          </label>
          <button
            className="px-3 py-1 rounded bg-slate-700"
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          >
            {lang.toUpperCase()}
          </button>
        </>
      }
    />
  );
}