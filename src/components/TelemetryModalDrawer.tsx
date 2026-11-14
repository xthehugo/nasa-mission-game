import { X } from 'lucide-react';
import { useMissionStore } from '../store';
import { TelemetryRightPanel } from './TelemetryRightPanel';

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
            className="border border-[#5FF3FF]/30 p-1 text-[#5FF3FF] hover:bg-[#5FF3FF]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <TelemetryRightPanel />
      </div>
    </div>
  );
}
