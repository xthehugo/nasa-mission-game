import { useState } from 'react';
import { Check, CheckCircle2, Copy, Play, X, XCircle } from 'lucide-react';
import { runEngineTestSuite, type EngineTestReport } from '../engine';
import { useMissionStore } from '../store';

const SUMMARY_EN =
  "ORBITAL FORGE is an interactive, bilingual (EN/ES) space mission design game turning NASA JPL's Concept Maturity Levels (CML 1-5) and real SWaP-C trade-offs into an accessible engineering sandbox with Dual Mode (Cadet & JPL Engineer), GMAT R2026a cross-validated physics, and live in-flight crises.";

const DETAIL_EN = `ORBITAL FORGE bridges the gap between intimidating aerospace tools (NASA GMAT) and oversimplified space games for high-school and university students. Across a real-time Split-Screen Mission Control cockpit, players progress through CML 1-5, balance 7 subsystems (Payload incl. CSA Fine Guidance heritage, Propulsion, EPS, Telecom, Thermal, ADCS, Launch), validate V&V (Vibration, TVAC, UL battery, DITL, RF >= 30 min inhibit & RBF pins), clear NASA's >= 35% MCR margin gate, and resolve 3 live flight crises while benchmarking against real NASA/CSA missions.

Open Data & AI Disclosure: Grounded in NASA JPL CML, SmallSat Institute, CubeSat 101, NASA GMAT R2026a, and Canadian Space Agency (CSA) open resources. UI scaffolding accelerated with AI assistance; physics equations run deterministically in TypeScript.`;

export function NarrativePitchModal() {
  const { language, isPitchModalOpen, setPitchModalOpen } = useMissionStore();
  const [tab, setTab] = useState<'STORY' | 'MATH' | 'PITCH'>('STORY');
  const [copied, setCopied] = useState<string | null>(null);
  const [testReport, setTestReport] = useState<EngineTestReport | null>(null);

  if (!isPitchModalOpen) return null;

  const isEs = language === 'es';

  const copyText = (key: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">
              ORBITAL FORGE — {isEs ? 'Narrativa, Modelo Matemático y Pitch Space Apps 2026' : 'Story, Math & Space Apps 2026 Pitch'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEs
                ? 'Público: Estudiantes de secundaria/universidad, educadores STEM y entusiastas espaciales'
                : 'Audience: High-school & university students, STEM educators & space enthusiasts'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPitchModalOpen(false)}
            className="rounded-lg border border-slate-700 p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ['STORY', isEs ? 'Narrativa y Datos Abiertos' : 'Story & Open Data'],
              ['MATH', isEs ? 'Fórmulas & Tests Motor (11/11)' : 'Scoring Math & Engine Tests'],
              ['PITCH', isEs ? 'Pitch Oficial (EN)' : 'Official Pitch (EN)'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                tab === id
                  ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'STORY' && (
          <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5">
              <strong className="text-cyan-300">
                {isEs ? 'De la Servilleta a las Estrellas:' : 'From Cocktail Napkin to the Stars:'}
              </strong>{' '}
              {isEs
                ? 'ORBITAL FORGE transforma al estudiante en Arquitecto de Misiones (JPL Team X / Goddard MDL). Con Modo Cadete (analogías CSA) e Ingeniero JPL (fórmulas exactas), enseña por qué cada gramo, vatio y dólar en SWaP-C determina si una nave aprueba la revisión MCR (≥35%) y sobrevive en órbita.'
                : 'ORBITAL FORGE puts learners in the Mission Architect chair (JPL Team X / Goddard MDL), pairing Cadet analogies with JPL equations so students feel real SWaP-C ripple effects.'}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5">
              <strong className="text-amber-300">
                {isEs ? 'Fuentes Abiertas & Declaración de IA:' : 'Open Data & AI Disclosure:'}
              </strong>{' '}
              NASA JPL CML (1–5), NASA SmallSat Institute, NASA CubeSat 101 (CSLI), NASA GMAT R2026a (`dest-geo` 3,673 m/s), NASA Mission-Viz y Canadian Space Agency (CSA FGS & Digital Space Education). UI asistida por IA con motor físico determinista verificado.
            </div>
          </div>
        )}

        {tab === 'MATH' && (
          <div className="mt-4 space-y-3 text-xs text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 font-mono text-[11px]">
              <div>S_score = (Σ V_i · η_orbit) × (D_downlinked / D_generated)</div>
              <div>M_score = 0.5·((M_limit - M_pred)/M_pred) + 0.5·((P_gen - P_req)/P_req)</div>
              <div>B_score = 100 · (Cap - TotalCost) / Cap  (Overrun → FAIL)</div>
              <div className="mt-1 text-cyan-300">Global P = 0.50·S_score + 0.30·M_score + 0.20·B_score</div>
            </div>

            <button
              type="button"
              onClick={() => setTestReport(runEngineTestSuite())}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isEs ? 'Ejecutar Suite de Verificación Física' : 'Run Physics Test Suite'}</span>
            </button>

            {testReport && (
              <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <div className="font-mono text-xs font-bold text-emerald-300">
                  {testReport.passedCount}/{testReport.total} PASSED
                </div>
                {testReport.results.map((r) => (
                  <div key={r.name} className="flex items-start gap-2 text-[11px]">
                    {r.passed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                    )}
                    <div>
                      <span className="font-semibold text-white">{r.name}:</span>{' '}
                      <span className="text-slate-400">{r.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'PITCH' && (
          <div className="mt-4 space-y-3">
            {[
              ['summary', 'High-Level Summary (EN)', SUMMARY_EN],
              ['detail', 'Detailed Project Description (EN)', DETAIL_EN],
            ].map(([k, title, body]) => (
              <div key={k} className="rounded-xl border border-slate-800 bg-slate-950/85 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-300">{title}</span>
                  <button
                    type="button"
                    onClick={() => copyText(k, body)}
                    className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-300"
                  >
                    {copied === k ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === k ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
                  {body}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
