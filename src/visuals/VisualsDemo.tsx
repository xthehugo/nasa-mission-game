import { useState } from 'react';
import {
  DEFAULT_MISSION_SELECTION,
  evaluateMissionPhysics,
  findDestinationById,
  ORBITAL_DESTINATIONS,
  PRESET_MISSION_SELECTIONS,
} from '../engine';
import type { Language, MissionSelection } from '../types/mission';
import MissionStage from './MissionStage';

const GEO_GMAT_BENCHMARK_SELECTION: MissionSelection = {
  ...PRESET_MISSION_SELECTIONS['obj-helio-lunar-trailblazer'],
  destinationId: 'dest-geo',
};

const FAIRING_OVERFLOW_TEST_SELECTION: MissionSelection = {
  ...PRESET_MISSION_SELECTIONS['obj-earth-bionutrients'],
  payloadIds: ['pay-sar-radar', 'pay-multispectral'],
  launchVehicleId: 'lv-rideshare',
};

export default function VisualsDemo() {
  const [selection, setSelection] = useState<MissionSelection>(
    DEFAULT_MISSION_SELECTION,
  );
  const [lang, setLang] = useState<Language>('en');

  const destination = findDestinationById(selection.destinationId);
  const metrics = evaluateMissionPhysics(selection);

  return (
    <MissionStage
      destination={destination}
      volume={metrics.volume}
      metrics={metrics}
      lang={lang}
      controls={
        <>
          {ORBITAL_DESTINATIONS.map((dest) => {
            const isSelected = dest.id === destination.id;
            return (
              <button
                key={dest.id}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, destinationId: dest.id }))
                }
                className={`px-3 py-1 rounded text-xs font-medium ${
                  isSelected ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {dest.name[lang]}
              </button>
            );
          })}

          <button
            onClick={() => setSelection(GEO_GMAT_BENCHMARK_SELECTION)}
            className="px-3 py-1 rounded text-xs font-semibold bg-cyan-800 hover:bg-cyan-700 text-cyan-100"
          >
            {lang === 'es' ? 'Preset GMAT GEO' : 'GMAT GEO Preset'}
          </button>

          <button
            onClick={() =>
              setSelection(PRESET_MISSION_SELECTIONS['obj-jupiter-clipper'])
            }
            className="px-3 py-1 rounded text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-100"
          >
            {lang === 'es' ? 'Preset Júpiter RTG' : 'Jupiter RTG Preset'}
          </button>

          <button
            onClick={() => setSelection(FAIRING_OVERFLOW_TEST_SELECTION)}
            className="px-3 py-1 rounded text-xs font-semibold bg-rose-900 hover:bg-rose-800 text-rose-100"
          >
            {lang === 'es' ? '⚠ Test Exceso Cofia' : '⚠ Fairing NO-GO Test'}
          </button>

          <button
            className="px-3 py-1 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600"
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          >
            {lang.toUpperCase()}
          </button>
        </>
      }
    />
  );
}
