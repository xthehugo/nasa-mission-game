import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

const VV_CHECKS: {
  key: 'vibrationPassed' | 'tvacPassed' | 'batteryULCertified' | 'ditlPassed' | 'rbfPinRemoved';
  label: { en: string; es: string };
}[] = [
  { key: 'vibrationPassed', label: { en: 'Vibration Test', es: 'Vibración Mecánica' } },
  { key: 'tvacPassed', label: { en: 'Thermal Vacuum (TVAC)', es: 'Vacío Térmico (TVAC)' } },
  { key: 'batteryULCertified', label: { en: 'UL Battery Cert', es: 'Batería Cert. UL' } },
  { key: 'ditlPassed', label: { en: 'DITL Software', es: 'Software DITL' } },
  { key: 'rbfPinRemoved', label: { en: 'RBF Pins Clear', es: 'Pines RBF Retirados' } },
];

export function VVTestingCard() {
  const {
    language,
    testing,
    soundEnabled,
    setTestingFlag,
    setRfInhibitTimer,
    runFullVVSuite,
  } = useMissionStore();

  const isEs = language === 'es';

  return (
    <div className="space-y-2.5 border border-[#5FF3FF]/25 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
          {isEs ? 'PRUEBAS AMBIENTALES V&V' : 'V&V QUALIFICATION'}
        </span>
        <button
          type="button"
          onClick={() => {
            runFullVVSuite();
            playHoloTone('STAR', soundEnabled);
          }}
          className="border border-[#5FF3FF] px-2 py-0.5 font-mono text-[9px] text-[#5FF3FF] uppercase hover:bg-[#5FF3FF]/15"
        >
          {isEs ? 'APROBAR SUITE' : 'PASS SUITE'}
        </button>
      </div>

      <div className="space-y-1.5">
        {VV_CHECKS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between border border-[#5FF3FF]/15 px-2.5 py-1.5 text-[11px] text-slate-200 hover:border-[#5FF3FF]/45"
          >
            <span className="font-light">{item.label[language]}</span>
            <input
              type="checkbox"
              checked={testing[item.key]}
              onChange={(e) => {
                setTestingFlag(item.key, e.target.checked);
                playHoloTone(e.target.checked ? 'STEP' : 'ALARM', soundEnabled);
              }}
              className="h-3.5 w-3.5 accent-[#5FF3FF]"
            />
          </label>
        ))}
      </div>

      <div className="border-t border-[#5FF3FF]/15 pt-2">
        <div className="flex justify-between font-mono text-[9.5px] uppercase">
          <span className="text-slate-400">{isEs ? 'INHIBICIÓN RF' : 'RF INHIBIT'}</span>
          <span className={testing.rfInhibitTimerMin >= 30 ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
            {testing.rfInhibitTimerMin} MIN (≥30)
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={testing.rfInhibitTimerMin}
          onChange={(e) => setRfInhibitTimer(Number(e.target.value))}
          className="mt-1.5 w-full accent-[#5FF3FF]"
        />
      </div>
    </div>
  );
}
