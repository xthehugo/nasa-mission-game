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
  if (status === 'GREEN') return '#10b981';
  if (status === 'YELLOW') return '#f59e0b';
  return '#f43f5e';
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
    <aside className="flex flex-col gap-3 rounded-3xl border border-cyan-500/20 bg-slate-900/65 p-4 shadow-[0_0_32px_rgba(34,211,238,0.08)]">
      {/* Flight Director Advice Banner */}
      <div
        className={`rounded-2xl border bg-slate-950/85 p-3.5 ${
          metrics.flightDirectorAdvice.status === 'GREEN'
            ? 'border-emerald-500/35'
            : metrics.flightDirectorAdvice.status === 'YELLOW'
              ? 'border-amber-500/40'
              : 'border-rose-500/55 shadow-[0_0_20px_rgba(244,63,94,0.18)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-white">
            <Activity
              className={`h-4 w-4 ${
                metrics.flightDirectorAdvice.status === 'RED'
                  ? 'animate-ping text-rose-400'
                  : 'text-cyan-400'
              }`}
            />
            <span>{metrics.flightDirectorAdvice.headline[language]}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {concurrentConflicts.length} {isEs ? 'conflictos' : 'conflicts'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-300">
          {metrics.flightDirectorAdvice.humanExplanation[language]}
        </p>
      </div>

      {/* Right Panel Mode Switcher: Live Visuals (Persona 3) vs Recharts Analytics */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => setRightPanelTab('VISUALS')}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
            rightPanelTab === 'VISUALS'
              ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>{isEs ? 'Simulador Cohete & Órbita' : 'Rocket & Orbit Stage'}</span>
        </button>
        <button
          type="button"
          onClick={() => setRightPanelTab('ANALYTICS')}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
            rightPanelTab === 'ANALYTICS'
              ? 'bg-indigo-500/25 text-indigo-200 ring-1 ring-indigo-400/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>{isEs ? 'Gráficas SWaP-C & Radar' : 'SWaP-C Charts & Radar'}</span>
        </button>
      </div>

      {rightPanelTab === 'VISUALS' ? (
        <div className="min-h-[540px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
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
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
            <div className="mb-1.5 font-mono text-[11px] font-bold uppercase text-cyan-300">
              {isEs ? 'CBE vs MGA vs Propelente y Lanzador (kg)' : 'CBE + MGA + Propellant vs Rocket Cap (kg)'}
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={massStackData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 11 }}
                    formatter={(v, k) => [`${Number(v ?? 0).toFixed(1)} kg`, String(k)]}
                  />
                  <Bar dataKey="CBE" stackId="mass" fill="#22d3ee" />
                  <Bar dataKey="MGA" stackId="mass" fill="#f59e0b" />
                  <Bar dataKey="Propellant" stackId="mass" fill="#818cf8" />
                  <Bar dataKey="Limit" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: MCR Margins vs 35% NASA Threshold */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
            <div className="mb-1.5 font-mono text-[11px] font-bold uppercase text-emerald-300">
              {isEs ? 'Márgenes MCR vs Umbral NASA (≥35%)' : 'MCR Margins vs NASA Threshold (≥35%)'}
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[-40, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 11 }}
                    formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Margin']}
                  />
                  <ReferenceLine y={35} stroke="#10b981" strokeDasharray="4 4" />
                  <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {marginData.map((m) => (
                      <Cell key={m.name} fill={statusColor(m.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Trade Space 6-Axis RadarChart */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
            <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-indigo-300">
              <RadarIcon className="h-3.5 w-3.5" />
              <span>{isEs ? 'Radar Balance Trade Space' : 'Trade Space Balance Radar'}</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="val" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.28} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
