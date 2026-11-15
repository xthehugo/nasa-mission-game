import { lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

const LazyTelemetryRightPanel = lazy(() =>
  import('./TelemetryRightPanel').then((m) => ({
    default: m.TelemetryRightPanel,
  })),
);

export function TelemetryModalDrawer() {
  const { language, soundEnabled, isTelemetryOpen, setTelemetryOpen } = useMissionStore();
  if (!isTelemetryOpen) return null;

  const isEs = language === 'es';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080F]/90 p-4 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#5FF3FF]/50 bg-[#04080F] p-5 shadow-[0_0_50px_rgba(95,243,255,0.16)] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#5FF3FF]/20 pb-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#5FF3FF] uppercase">
              SYS.TELEMETRY // SWaP-C & GMAT ANALYTICS
            </div>
            <h2 className="mt-0.5 text-xl font-light tracking-tight text-white">
              {isEs ? 'Telemetría Analítica SWaP-C' : 'SWaP-C Analytics & Margins'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setTelemetryOpen(false);
            }}
            aria-label={isEs ? 'Cerrar panel de telemetría' : 'Close telemetry panel'}
            className="border border-[#5FF3FF]/35 bg-[#04080F] p-1.5 text-[#5FF3FF] transition hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Suspense
          fallback={
            <div className="border border-[#5FF3FF]/20 py-12 text-center font-mono text-[11px] tracking-[0.18em] text-[#5FF3FF] uppercase">
              {isEs ? 'CARGANDO TELEMETRÍA SWaP-C...' : 'LOADING SWaP-C ANALYTICS...'}
            </div>
          }
        >
          <LazyTelemetryRightPanel />
        </Suspense>
      </div>
    </div>
  );
}
