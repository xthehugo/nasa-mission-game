import { useState } from 'react';
import OrbitalMapVisualizer from './OrbitalMapVisualizer';
import SpacecraftBlueprint from './SpacecraftBlueprint';
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
    linkMargin_dB: 6,
  } as unknown as OrbitalDestination,
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
];

export default function VisualsDemo() {
  const [i, setI] = useState(0);
  const [used, setUsed] = useState(4);
  const max = 6;

  return (
    <div className="p-4 bg-slate-900 min-h-screen text-white flex flex-wrap gap-6">
      <div>
        <button className="mr-2 px-3 py-1 bg-slate-700 rounded" onClick={() => setI(0)}>LEO</button>
        <button className="px-3 py-1 bg-slate-700 rounded" onClick={() => setI(1)}>Mars</button>
        <OrbitalMapVisualizer destination={DESTS[i]} lang="es" />
      </div>
      <div>
        <input type="range" min={1} max={8} step={0.5} value={used} onChange={(e) => setUsed(Number(e.target.value))} />
        <SpacecraftBlueprint
          volume={{ used_U: used, maxFairing_U: max, isCompliant: used <= max }}
          lang="es"
        />
      </div>
    </div>
  );
}