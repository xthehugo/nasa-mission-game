import { lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { useMissionStore } from '../store';

const LazyTelemetryRightPanel = lazy(() =>
  import('./TelemetryRightPanel').then((m) => ({
    default: m.TelemetryRightPanel,
  })),
);

export function TelemetryModalDrawer() {
  const { language, isTelemetryOpen, setTelemetryOpen } = useMissionStore();
  if (!isTelemetryOpen) return null;

  const isEs = language === 'es';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080F]/90 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#5FF3FF]/50 bg-[#04080F] p-5 shadow-[0_0_40px_rgba(95,243,255,0.16)]">
        <div className="mb-3 flex items-center justify-between border-b border-[#5FF3FF]/20 pb-2">
          <span className="font-mono text-xs tracking-[0.18em] text-[#5FF3FF] uppercase">
            {isEs ? 'TELEMETRÍA ANALÍTICA SWaP-C' : 'SWaP-C ANALYTICS & MARGINS'}
          </span>
          <button
            type="button"
            onClick={() => setTelemetryOpen(false)}
            aria-label={isEs ? 'Cerrar panel de telemetría' : 'Close telemetry panel'}
            className="border border-[#5FF3FF]/30 p-1 text-[#5FF3FF] hover:bg-[#5FF3FF]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Suspense
          fallback={
            <div className="py-10 text-center font-mono text-[11px] tracking-[0.16em] text-[#5FF3FF] uppercase">
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
