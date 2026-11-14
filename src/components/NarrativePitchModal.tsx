import { useState } from 'react';
import { Check, CheckCircle2, Copy, ExternalLink, Play, X, XCircle } from 'lucide-react';
import { runEngineTestSuite, type EngineTestReport } from '../engine';
import { useMissionStore } from '../store';

const VERIFIED_SOURCE_GROUPS = [
  {
    id: 'ssri-standards',
    title: {
      en: '1. NASA SSRI SoA 2024 & Systems Standards (NASA/SP-2016-6105, GSFC-STD-1000 GOLD Rules, NASA-STD-5001)',
      es: '1. NASA SSRI SoA 2024 y Estándares de Sistemas (NASA/SP-2016-6105, GSFC-STD-1000 GOLD Rules, NASA-STD-5001)',
    },
    links: [
      { label: 'SSRI SmallSat SoA 2024 — Thermal Control (Ch. 7)', url: 'https://www.nasa.gov/wp-content/uploads/2025/02/7-soa-thermal-2024.pdf' },
      { label: 'SSRI SmallSat SoA 2024 — Power / EPS (Ch. 3)', url: 'https://www.nasa.gov/wp-content/uploads/2025/02/3-soa-power-2024.pdf' },
      { label: 'SSRI SmallSat SoA 2024 — GNC / ADCS (Ch. 5)', url: 'https://www.nasa.gov/wp-content/uploads/2025/02/5-soa-gnc-2024.pdf' },
      { label: 'SSRI SmallSat SoA 2024 — Communications (Ch. 9)', url: 'https://www.nasa.gov/wp-content/uploads/2025/02/9-soa-communications-2024.pdf' },
      { label: 'SSRI SmallSat SoA 2023 — Launch Integration (Ch. 10)', url: 'https://www.nasa.gov/wp-content/uploads/2024/02/10.soa-launch-2023.pdf' },
      { label: 'NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2)', url: 'https://explorers.larc.nasa.gov/2023APPROBE/pdf_files/NASA04.%20SysEng%20Handbook%20(NASA_SP-2016-6105%20Rev%202).pdf' },
      { label: 'GSFC-STD-1000 Rev H — Rules for Design, Development & Flight (GOLD)', url: 'https://standards.nasa.gov/sites/default/files/standards/GSFC/H/0/GSFC-STD-1000RevH_Approved.pdf' },
      { label: 'NASA-STD-5001 — Structural Design & Test Factors of Safety', url: 'https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-2/2/Historical/nasa-std-5001.pdf' },
    ],
  },
  {
    id: 'dsn-gmat',
    title: {
      en: '2. DSN 810-005 (101H/104O), NSN 2025 & GMAT (GSC-19468-1)',
      es: '2. DSN 810-005 (101H/104O), NSN 2025 y GMAT (GSC-19468-1)',
    },
    links: [
      { label: 'JPL DSN 810-005 Module 101H — 70m Deep Space Antenna Performance', url: 'https://deepspace.jpl.nasa.gov/dsndocs/810-005/101/101H.pdf' },
      { label: 'JPL DSN 810-005 Module 104O — 34m Beam Waveguide Antennas', url: 'https://deepspace.jpl.nasa.gov/dsndocs/810-005/104/104O.pdf' },
      { label: 'NASA Near Space Network (NSN) Services Brochure (2025)', url: 'https://www.nasa.gov/wp-content/uploads/2025/08/nsn-services-brochure.pdf' },
      { label: 'NASA General Mission Analysis Tool (GMAT) Software — GSC-19468-1', url: 'https://software.nasa.gov/software/GSC-19468-1' },
    ],
  },
  {
    id: 'mission-kits',
    title: {
      en: '3. Mission Press Kits & NTRS / CSA Benchmarks (BioNutrients-2, Lunar Trailblazer, TRACERS, MRO, PUNCH, CSA JWST FGS)',
      es: '3. Press Kits Oficiales y Benchmarks NTRS / CSA (BioNutrients-2, Lunar Trailblazer, TRACERS, MRO, PUNCH, CSA JWST FGS)',
    },
    links: [
      { label: 'NASA Lunar Trailblazer Launch Press Kit (SIMPLEx)', url: 'https://assets.science.nasa.gov/content/dam/science/missions/lunar-trailblazer/pdfs/LTB_PressKit_finalR.pdf' },
      { label: 'NASA TRACERS Heliophysics Press Kit (Magnetometer / Sun-Sync)', url: 'https://assets.science.nasa.gov/content/dam/science/missions/tracer/TRACERS%20Press%20Kit.pdf' },
      { label: 'Canadian Space Agency (CSA) — JWST Fine Guidance Sensor (FGS #16972)', url: 'https://www.asc-csa.gc.ca/eng/multimedia/search/image/16972' },
      { label: 'NASA NTRS 20250009253 — Space Microbial Biotechnology (BioNutrients-2)', url: 'https://ntrs.nasa.gov/api/citations/20250009253/downloads/2025-09_SpaceMicrobialBiotechnology_Settles.pdf' },
      { label: 'NASA Mars Reconnaissance Orbiter (MRO) Launch Press Kit', url: 'https://science.nasa.gov/resource/mars-reconnaissance-orbiter-launch-press-kit/' },
      { label: 'NASA PUNCH Solar Corona & Heliosphere Mission', url: 'https://science.nasa.gov/mission/punch/' },
    ],
  },
];

const NOTEBOOKLM_URL_BLOCK = VERIFIED_SOURCE_GROUPS.flatMap((g) => g.links.map((l) => l.url)).join('\n');

const SUMMARY_EN =
  "ORBITAL FORGE is an interactive, bilingual (EN/ES) space mission design game turning NASA JPL's Concept Maturity Levels (CML 1-5) and real SWaP-C trade-offs into an accessible engineering sandbox with Dual Mode (Cadet & JPL Engineer), GMAT R2026a cross-validated physics, and live in-flight crises.";

const DETAIL_EN = `ORBITAL FORGE bridges the gap between intimidating aerospace tools (NASA GMAT) and oversimplified space games for high-school and university students. Across a real-time Split-Screen Mission Control cockpit, players progress through CML 1-5, balance 7 subsystems (Payload incl. CSA Fine Guidance heritage, Propulsion, EPS, Telecom, Thermal, ADCS, Launch), validate V&V (Vibration, TVAC, UL battery, DITL, RF >= 30 min inhibit & RBF pins), clear NASA's >= 35% MCR margin gate, and resolve 3 live flight crises while benchmarking against real NASA/CSA missions.

Open Data & AI Disclosure: Grounded in NASA JPL CML, SmallSat Institute, CubeSat 101, NASA GMAT R2026a, and Canadian Space Agency (CSA) open resources. UI scaffolding accelerated with AI assistance; physics equations run deterministically in TypeScript.`;

export function NarrativePitchModal() {
  const { language, isPitchModalOpen, setPitchModalOpen } = useMissionStore();
  const [tab, setTab] = useState<'STORY' | 'MATH' | 'SOURCES' | 'PITCH'>('STORY');
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
              ['SOURCES', isEs ? '18 Fuentes Verificadas' : '18 Verified Sources'],
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

        {tab === 'SOURCES' && (
          <div className="mt-4 space-y-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/25 p-3">
              <div>
                <div className="font-mono text-[11px] font-bold text-cyan-200">
                  {isEs
                    ? 'Trazabilidad Oficial (18 URLs Verificadas: .gov / .gc.ca / JPL / NTRS)'
                    : 'Official Data Provenance (18 Verified .gov / .gc.ca / JPL / NTRS URLs)'}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {isEs
                    ? 'Incluye límites HAN Monoprop (250s), estándares GSFC GOLD Rules / NASA-STD-5001, DSN 810-005, NSN 2025, GMAT R2026a y Press Kits reales.'
                    : 'Covers HAN Green Monoprop (250s), GSFC GOLD Rules / NASA-STD-5001, DSN 810-005, NSN 2025, GMAT R2026a & mission press kits.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyText('urls', NOTEBOOKLM_URL_BLOCK)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/15 px-3 py-1.5 font-mono text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/25"
              >
                {copied === 'urls' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied === 'urls' ? (isEs ? '18 URLs Copiadas' : '18 URLs Copied') : (isEs ? 'Copiar 18 URLs' : 'Copy 18 URLs')}</span>
              </button>
            </div>

            {VERIFIED_SOURCE_GROUPS.map((group) => (
              <div key={group.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <div className="font-mono text-[11px] font-bold text-amber-300">
                  {group.title[language]}
                </div>
                <ul className="mt-2 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 underline decoration-slate-600 hover:text-cyan-300 hover:decoration-cyan-400"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 text-cyan-400" />
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
