import {
  Activity,
  BarChart3,
  Radar as RadarIcon,
  Rocket,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { findDestinationById } from '../engine';
import { useMissionStore } from '../store';
import type { MCRStatus } from '../types/mission';
import { MissionStage } from '../visuals';

function statusColor(status: MCRStatus): string {
  if (status === 'GREEN') return '#5FF3FF';
  if (status === 'YELLOW') return '#FFC15E';
  return '#FF4D6D';
}

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Number(v.toFixed(1))));
}

export function TelemetryRightPanel() {
  const {
    language,
    rightPanelTab,
    selection,
    metrics,
    scores,
    concurrentConflicts,
    preFlightVerdict,
    setRightPanelTab,
  } = useMissionStore();

  const isEs = language === 'es';
  const destination = findDestinationById(selection.destinationId);

  const marginData = [
    {
      name: isEs ? 'Masa' : 'Mass',
      value: Number(Math.max(-40, Math.min(100, metrics.dryMass.marginPercent)).toFixed(1)),
      status: metrics.dryMass.status,
    },
    {
      name: isEs ? 'Energía' : 'Power',
      value: Number(Math.max(-40, Math.min(100, metrics.power.marginPercent)).toFixed(1)),
      status: metrics.power.status,
    },
    {
      name: isEs ? 'Presup.' : 'Budget',
      value: Number(
        Math.max(
          -40,
          Math.min(
            100,
            (metrics.cost.reserveMillionsUSD / Math.max(1, metrics.cost.budgetCapMillionsUSD)) * 100,
          ),
        ).toFixed(1),
      ),
      status: metrics.cost.status,
    },
  ];

  const massStackData = [
    {
      name: isEs ? 'Nave' : 'Craft',
      CBE: Number(metrics.dryMass.cbe.toFixed(1)),
      MGA: Number(metrics.dryMass.mga.toFixed(1)),
      Propellant: Number(metrics.propellantMass_kg.toFixed(1)),
    },
    {
      name: isEs ? 'Cohete' : 'Rocket',
      Limit: metrics.launchCapacity_kg,
    },
  ];

  const radarData = [
    { axis: isEs ? 'Masa' : 'Mass', val: clampScore(metrics.dryMass.marginPercent + 40) },
    { axis: isEs ? 'Potencia' : 'Power', val: clampScore(metrics.power.marginPercent + 40) },
    { axis: isEs ? 'Enlace' : 'Link dB', val: clampScore(metrics.telecom.linkMargin_dB * 8) },
    { axis: isEs ? 'Presup.' : 'Budget', val: scores.budgetOverrun ? 5 : scores.budgetEfficiencyScore },
    { axis: isEs ? 'Cofia' : 'Fairing', val: metrics.volume.isCompliant ? 92 : 12 },
    { axis: 'V&V', val: preFlightVerdict.passed ? 95 : 25 },
  ];

  return (
    <aside className="flex flex-col gap-3 border border-[#5FF3FF]/25 bg-[#04080F] p-4 shadow-[0_0_28px_rgba(95,243,255,0.08)]">
      {/* Flight Director Advice Banner */}
      <div
        className={`border bg-[#04080F] p-3.5 ${
          metrics.flightDirectorAdvice.status === 'GREEN'
            ? 'border-[#5FF3FF]/40'
            : metrics.flightDirectorAdvice.status === 'YELLOW'
              ? 'border-[#FFC15E]/50'
              : 'border-[#FF4D6D]/60 shadow-[0_0_20px_rgba(255,77,109,0.18)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-white uppercase">
            <Activity
              className={`h-4 w-4 ${
                metrics.flightDirectorAdvice.status === 'RED'
                  ? 'animate-ping text-[#FF4D6D]'
                  : metrics.flightDirectorAdvice.status === 'YELLOW'
                    ? 'text-[#FFC15E]'
                    : 'text-[#5FF3FF]'
              }`}
            />
            <span>{metrics.flightDirectorAdvice.headline[language]}</span>
          </div>
          <span className="border border-[#5FF3FF]/25 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-slate-300 uppercase">
            {concurrentConflicts.length} {isEs ? 'conflictos' : 'conflicts'}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
          {metrics.flightDirectorAdvice.humanExplanation[language]}
        </p>
      </div>

      {/* Mode Switcher: Live Visuals vs Recharts Analytics */}
      <div className="grid grid-cols-2 gap-1.5 border border-[#5FF3FF]/25 bg-[#04080F] p-1">
        <button
          type="button"
          onClick={() => setRightPanelTab('VISUALS')}
          className={`flex items-center justify-center gap-1.5 border py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition ${
            rightPanelTab === 'VISUALS'
              ? 'border-[#5FF3FF] bg-[#5FF3FF]/15 text-[#5FF3FF]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>{isEs ? 'Simulador Cohete & Órbita' : 'Rocket & Orbit Stage'}</span>
        </button>
        <button
          type="button"
          onClick={() => setRightPanelTab('ANALYTICS')}
          className={`flex items-center justify-center gap-1.5 border py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition ${
            rightPanelTab === 'ANALYTICS'
              ? 'border-[#FFC15E] bg-[#FFC15E]/15 text-[#FFC15E]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>{isEs ? 'Gráficas SWaP-C & Radar' : 'SWaP-C Charts & Radar'}</span>
        </button>
      </div>

      {rightPanelTab === 'VISUALS' ? (
        <div className="min-h-[540px] overflow-hidden border border-[#5FF3FF]/25 bg-[#04080F]">
          <MissionStage
            destination={destination}
            volume={metrics.volume}
            metrics={metrics}
            lang={language}
            embedded
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Chart 1: CBE + MGA + Propellant Stacked BarChart */}
          <div className="border border-[#5FF3FF]/25 bg-[#04080F] p-3.5">
            <div className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
              {isEs ? 'CBE vs MGA vs Propelente y Lanzador (kg)' : 'CBE + MGA + Propellant vs Rocket Cap (kg)'}
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={massStackData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132238" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#04080F',
                      borderColor: '#5FF3FF',
                      borderRadius: 0,
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                    formatter={(v, k) => [`${Number(v ?? 0).toFixed(1)} kg`, String(k)]}
                  />
                  <Bar dataKey="CBE" stackId="mass" fill="#5FF3FF" />
                  <Bar dataKey="MGA" stackId="mass" fill="#FFC15E" />
                  <Bar dataKey="Propellant" stackId="mass" fill="#38bdf8" />
                  <Bar dataKey="Limit" fill="#475569" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: MCR Margins vs 35% NASA Threshold */}
          <div className="border border-[#5FF3FF]/25 bg-[#04080F] p-3.5">
            <div className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[#FFC15E] uppercase">
              {isEs ? 'Márgenes MCR vs Umbral NASA (≥35%)' : 'MCR Margins vs NASA Threshold (≥35%)'}
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132238" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[-40, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#04080F',
                      borderColor: '#5FF3FF',
                      borderRadius: 0,
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                    formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Margin']}
                  />
                  <ReferenceLine y={35} stroke="#5FF3FF" strokeDasharray="4 4" />
                  <ReferenceLine y={25} stroke="#FFC15E" strokeDasharray="3 3" />
                  <Bar dataKey="value">
                    {marginData.map((m) => (
                      <Cell key={m.name} fill={statusColor(m.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Trade Space 6-Axis RadarChart */}
          <div className="border border-[#5FF3FF]/25 bg-[#04080F] p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
              <RadarIcon className="h-3.5 w-3.5" />
              <span>{isEs ? 'Radar Balance Trade Space' : 'Trade Space Balance Radar'}</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#132238" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="val" stroke="#5FF3FF" fill="#5FF3FF" fillOpacity={0.22} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
