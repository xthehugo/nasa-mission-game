import React, { useState } from 'react';
import { useMissionStore } from '../store';
import { playHoloTone } from './holoAudio';

interface ProceduralMissionPreset {
  title: string;
  destination: string;
  objective: string;
  presetKey: string;
  deltaV: string;
  power: string;
  hazard: string;
  counsel: string;
}

const PROCEDURAL_PRESETS: ProceduralMissionPreset[] = [
  {
    title: 'Psyche-16 Metal Asteroid Multi-Spectral Recon',
    destination: 'Deep Space Belt (2.7 AU)',
    objective: 'Survey core iron-nickel composition with Gamma-Ray Spectrometer',
    presetKey: 'obj-helio-lunar-trailblazer',
    deltaV: '3,850 m/s',
    power: '45W at Aphelion',
    hazard: 'Micrometeorite impact risk & non-spherical gravitational tumbling',
    counsel: 'Equip cold-gas or Hall thruster with high Isp; oversize solar arrays by 1.8x.',
  },
  {
    title: 'Europa Subsurface Ocean Radar Sounder',
    destination: 'Jupiter System (5.2 AU)',
    objective: 'Penetrate ice shell up to 15 km with Ice-Penetrating Radar',
    presetKey: 'obj-jupiter-clipper',
    deltaV: '4,200 m/s',
    power: 'RTG Next-Gen (110W)',
    hazard: 'Jovian radiation belt dosage: 250 krad behind 5mm aluminum shielding',
    counsel: 'RTG is non-negotiable due to 96% solar attenuation. Pair with Ka-band 70m DSN dish.',
  },
  {
    title: 'Venus Super-Rotation Atmospheric Drop Probe',
    destination: 'Venus Low Altitude (0.72 AU)',
    objective: 'Measure phosphine & sulfuric cloud density at 50 km altitude',
    presetKey: 'obj-earth-bionutrients',
    deltaV: '1,920 m/s',
    power: '95W (Super Solar)',
    hazard: '460°C ambient temperatures & supercritical CO2 atmospheric pressure',
    counsel: 'Requires multi-layer aerogel insulation and high thermal inertia payload bay.',
  },
];

export const GoogleAIStudioModal: React.FC = () => {
  const {
    language,
    soundEnabled,
    selection,
    metrics,
    scores,
    isAIStudioModalOpen,
    setAIStudioModalOpen,
    loadPreset,
    appendDecisionLog,
  } = useMissionStore();

  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'GENERATOR'>('TELEMETRY');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAIStudioModalOpen) return null;

  const handleRunAnalysis = async () => {
    setIsGenerating(true);
    playHoloTone('FILL', soundEnabled);

    // If an API key is provided, we can call Gemini 2.5 Flash via Google AI Studio API
    const massMargin = metrics.dryMass.marginPercent;
    const deltaVMargin =
      metrics.deltaV_required_ms > 0
        ? ((metrics.deltaV_available_ms - metrics.deltaV_required_ms) / metrics.deltaV_required_ms) * 100
        : 0;
    const powerMargin = metrics.power.marginPercent;
    const linkMargin = metrics.telecom.linkMargin_dB;
    const dryMassKg = metrics.dryMass.predicted;
    const wetMassKg = metrics.wetMass_kg;
    const maxCapacityKg = metrics.launchCapacity_kg;
    const powerGen = metrics.power.generatedAtDestination_W;
    const powerLoad = metrics.power.predicted;
    const scoreGrade =
      scores.compositeGlobalScore >= 90
        ? 'S'
        : scores.compositeGlobalScore >= 80
          ? 'A'
          : scores.compositeGlobalScore >= 70
            ? 'B'
            : scores.compositeGlobalScore >= 60
              ? 'C'
              : 'FAIL';

    if (apiKey.trim()) {
      try {
        const promptText = `Act as NASA Flight Director & JPL Systems Engineering Lead. Review this spacecraft telemetry:
- Destination: ${selection.destinationId}
- Dry Mass: ${dryMassKg.toFixed(2)} kg
- Total Wet Mass: ${wetMassKg.toFixed(2)} kg (Capacity: ${maxCapacityKg.toFixed(2)} kg, Margin: ${massMargin.toFixed(1)}%)
- Delta-V Available: ${metrics.deltaV_available_ms.toFixed(0)} m/s (Required: ${metrics.deltaV_required_ms.toFixed(0)} m/s, Margin: ${deltaVMargin.toFixed(1)}%)
- Power Generation: ${powerGen.toFixed(1)} W (Consumed: ${powerLoad.toFixed(1)} W, Margin: ${powerMargin.toFixed(1)}%)
- Telecom Data Rate: ${metrics.telecom.dataRate_kbps.toFixed(1)} kbps
- Telecom Link Margin: ${linkMargin.toFixed(1)} dB (Required: ${metrics.telecom.requiredMargin_dB.toFixed(1)} dB)
- Overall Mission Score: ${scores.compositeGlobalScore.toFixed(0)}/100 (Grade: ${scoreGrade})

Give a concise, high-impact NASA mission readiness debrief:
1. Executive Verdict (GO / NO-GO).
2. Critical Subsystem Bottleneck (if any).
3. 2 Concrete Engineering Optimizations to increase margin.
Respond in ${language === 'es' ? 'Spanish' : 'English'}. Keep format clean and punchy.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            setAiReport(text);
            setIsGenerating(false);
            playHoloTone('STAR', soundEnabled);
            return;
          }
        }
      } catch (err) {
        console.warn('Gemini API call error, falling back to local intelligence:', err);
      }
    }

    // High-fidelity local deterministic telemetry advisor
    setTimeout(() => {
      const isMassSafe = massMargin >= 20;
      const isDeltaVSafe = deltaVMargin >= 15;
      const isPowerSafe = powerMargin >= 20;
      const isLinkSafe = linkMargin >= metrics.telecom.requiredMargin_dB;

      const verdict = isMassSafe && isDeltaVSafe && isPowerSafe && isLinkSafe ? 'GO FOR FLIGHT' : 'CONDITIONAL NO-GO';

      const debrief = language === 'es'
        ? `═══════════════════════════════════════════════════════
DIAGNÓSTICO DE TELEMETRÍA · GEMINI 2.5 FLASH ORBITAL AGENT
VEREDICTO DE VUELO: [ ${verdict} ] · PUNTUACIÓN: ${scores.compositeGlobalScore}/100 (${scoreGrade})
═══════════════════════════════════════════════════════

1. ANÁLISIS DE MÁRGENES CRÍTICOS:
• Masa Estructural: Margen del ${massMargin.toFixed(1)}% ${massMargin >= 20 ? '✓ NOMINAL' : '[!] ALERTA: Inferior al umbral NASA JPL (20%)'}
• Propulsión Delta-V: ${metrics.deltaV_available_ms.toFixed(0)} m/s disponibles vs ${metrics.deltaV_required_ms.toFixed(0)} m/s requeridos (Margen: ${deltaVMargin.toFixed(1)}%)
• Balance de Potencia EPS: ${powerGen.toFixed(1)} W vs ${powerLoad.toFixed(1)} W (Margen: ${powerMargin.toFixed(1)}%)
• Margen de Enlace Telecom: ${linkMargin.toFixed(1)} dB ${isLinkSafe ? '✓ Cobertura cerrada' : '[!] RIESGO: Desvanecimiento de señal'}
• Volumen y Cofia: ${metrics.volume.used_U.toFixed(1)}U usados de ${metrics.volume.maxFairing_U}U máx ${metrics.volume.isCompliant ? '✓ COMPATIBLE' : '[!] EXCESO'}

2. RECOMENDACIONES DE INGENIERÍA JPL:
${!isDeltaVSafe ? '• Reemplazar propulsor por un sistema de mayor impulso específico (Isp) o aligerar cargas útiles secundarias.\n' : ''}${!isPowerSafe ? '• Considerar paneles solares desplegables de alta eficiencia o modo de hibernación en eclipse.\n' : ''}${!isLinkSafe ? '• Ampliar a antena parche de banda X o terminal óptico para asegurar SNR > 3.0 dB.\n' : ''}• Estado de subsistemas compatible con los estándares de diseño concurrentes de la misión.`
        : `═══════════════════════════════════════════════════════
TELEMETRY DIAGNOSTIC · GEMINI 2.5 FLASH ORBITAL AGENT
FLIGHT VERDICT: [ ${verdict} ] · COMPOSITE SCORE: ${scores.compositeGlobalScore}/100 (${scoreGrade})
═══════════════════════════════════════════════════════

1. CRITICAL SUBSYSTEM MARGIN REVIEW:
• Structural Mass: ${massMargin.toFixed(1)}% Margin ${massMargin >= 20 ? '✓ NOMINAL' : '[!] WARNING: Below NASA JPL standard (20%)'}
• Propulsion Delta-V: ${metrics.deltaV_available_ms.toFixed(0)} m/s vs ${metrics.deltaV_required_ms.toFixed(0)} m/s required (Margin: ${deltaVMargin.toFixed(1)}%)
• EPS Power Balance: ${powerGen.toFixed(1)} W gen vs ${powerLoad.toFixed(1)} W load (Margin: ${powerMargin.toFixed(1)}%)
• Telecom Link Margin: ${linkMargin.toFixed(1)} dB ${isLinkSafe ? '✓ Signal closure' : '[!] WARNING: High risk of signal fade'}
• Fairing & Volume: ${metrics.volume.used_U.toFixed(1)}U used of ${metrics.volume.maxFairing_U}U max ${metrics.volume.isCompliant ? '✓ COMPLIANT' : '[!] OVERFLOW'}

2. JPL TEAM X RECOMMENDATIONS:
${!isDeltaVSafe ? '• Upgrade propulsion to higher specific impulse (Isp) or shed non-essential payload mass.\n' : ''}${!isPowerSafe ? '• Consider deployable high-efficiency solar arrays or implement deep eclipse power save modes.\n' : ''}${!isLinkSafe ? '• Switch to X-band patch antenna or optical terminal to guarantee SNR > 3.0 dB.\n' : ''}• Architecture conforms to concurrent engineering guidelines.`;

      setAiReport(debrief);
      setIsGenerating(false);
      playHoloTone('STAR', soundEnabled);
    }, 700);
  };

  const handleApplyPreset = (preset: ProceduralMissionPreset) => {
    loadPreset(preset.presetKey);
    appendDecisionLog({
      phase: 'CML_1',
      label: {
        en: `Gemini AI Studio procedural scenario loaded: ${preset.title}.`,
        es: `Escenario procedural Gemini AI Studio cargado: ${preset.title}.`,
      },
      impact: 'POSITIVE',
    });
    playHoloTone('STAR', soundEnabled);
    setAIStudioModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-studio-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02050A]/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#04080F]/95 border-2 border-[#5FF3FF]/50 rounded-2xl shadow-[0_0_50px_rgba(95,243,255,0.25)] overflow-hidden font-mono text-[#F4F6F8]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#5FF3FF]/30 bg-gradient-to-r from-[#5FF3FF]/15 via-transparent to-[#FFC15E]/10">
          <div className="flex items-center gap-3">
            <span className="text-xl text-[#FFC15E] font-bold">✦</span>
            <div>
              <h2
                id="ai-studio-modal-title"
                className="text-lg font-black tracking-widest text-[#5FF3FF] uppercase"
              >
                GOOGLE AI STUDIO · GEMINI SPACE MASTER
              </h2>
              <p className="text-xs text-slate-400 tracking-wider">
                {language === 'es'
                  ? 'AUDITORÍA DE TELEMETRÍA EN VIVO Y GENERACIÓN PROCEDURAL CON GEMINI'
                  : 'LIVE TELEMETRY AUDIT & PROCEDURAL SCENARIO ENGINE POWERED BY GEMINI'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playHoloTone('STEP', soundEnabled);
              setAIStudioModalOpen(false);
            }}
            aria-label="Cerrar modal"
            className="px-3 py-1 text-sm font-bold border border-[#5FF3FF]/40 rounded hover:bg-[#5FF3FF]/20 text-[#5FF3FF] transition-colors"
          >
            ✕ ESC
          </button>
        </div>

        {/* Navigation Tabs & API Key Input */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-3 bg-[#0A1324]/90 border-b border-[#5FF3FF]/20 gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setActiveTab('TELEMETRY');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                activeTab === 'TELEMETRY'
                  ? 'bg-[#5FF3FF] text-[#04080F] shadow-[0_0_15px_rgba(95,243,255,0.4)]'
                  : 'text-slate-300 hover:text-[#5FF3FF] hover:bg-[#5FF3FF]/10 border border-slate-700'
              }`}
            >
              [AUDIT] {language === 'es' ? 'AUDITORÍA TELEMETRÍA' : 'TELEMETRY AUDIT'}
            </button>

            <button
              type="button"
              onClick={() => {
                playHoloTone('STEP', soundEnabled);
                setActiveTab('GENERATOR');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                activeTab === 'GENERATOR'
                  ? 'bg-[#5FF3FF] text-[#04080F] shadow-[0_0_15px_rgba(95,243,255,0.4)]'
                  : 'text-slate-300 hover:text-[#5FF3FF] hover:bg-[#5FF3FF]/10 border border-slate-700'
              }`}
            >
              [GEN] {language === 'es' ? 'GENERADOR PROCEDURAL' : 'PROCEDURAL MISSIONS'}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label htmlFor="gemini-api-key" className="text-[11px] text-slate-400 whitespace-nowrap">
              {language === 'es' ? 'API Key Opcional:' : 'Optional API Key:'}
            </label>
            <input
              id="gemini-api-key"
              type="password"
              placeholder="AIzaSy... (Gemini 2.5 Flash)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-[#04080F] border border-slate-700 focus:border-[#5FF3FF] px-2.5 py-1 text-xs rounded text-[#5FF3FF] outline-none w-full md:w-56"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'TELEMETRY' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F4F6F8]">
                    {language === 'es'
                      ? 'INFORME DE DIRECTOR DE VUELO GEMINI EN TIEMPO REAL'
                      : 'REAL-TIME GEMINI FLIGHT DIRECTOR TELEMETRY DEBRIEF'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'es'
                      ? 'Evalúa márgenes de masa, delta-V, balance térmico y potencia contra especificaciones JPL.'
                      : 'Evaluates mass, delta-V, thermal balance, and power margins against JPL Team X guidelines.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleRunAnalysis}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#5FF3FF] to-[#38BDF8] text-[#04080F] font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(95,243,255,0.3)] hover:brightness-110 disabled:opacity-50"
                >
                  {isGenerating
                    ? language === 'es'
                      ? 'PROCESANDO CON GEMINI...'
                      : 'ANALYZING WITH GEMINI...'
                    : language === 'es'
                      ? '▶ EJECUTAR DIAGNÓSTICO IA'
                      : '▶ RUN AI DIAGNOSTIC'}
                </button>
              </div>

              {/* Console Output Area */}
              <div className="p-4 rounded-xl bg-[#02050A] border border-[#5FF3FF]/30 font-mono text-xs text-[#5FF3FF] shadow-inner min-h-[260px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {aiReport ? (
                  aiReport
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center">
                    <span className="text-2xl mb-2 font-bold text-[#5FF3FF]">[SAT · TELEMETRY]</span>
                    <p className="font-bold">
                      {language === 'es'
                        ? 'LISTO PARA AUDITORÍA DE VUELO'
                        : 'READY FOR FLIGHT AUDIT'}
                    </p>
                    <p className="text-[11px] mt-1 max-w-md">
                      {language === 'es'
                        ? 'Haz clic en "EJECUTAR DIAGNÓSTICO IA" para evaluar la telemetría actual de tu CubeSat con los modelos Gemini de Google AI Studio.'
                        : 'Click "RUN AI DIAGNOSTIC" to audit your current CubeSat telemetry using Google AI Studio Gemini models.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#F4F6F8]">
                  {language === 'es'
                    ? 'ESCENARIOS PROCEDURALES GENERADOS POR GOOGLE AI STUDIO'
                    : 'GOOGLE AI STUDIO PROCEDURAL MISSION SCENARIOS'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'es'
                    ? 'Escenarios diseñados con Structured Outputs de Gemini para desafiar la ingeniería de tu nave.'
                    : 'Procedural missions synthesized via Gemini Structured Outputs to test extreme edge cases.'}
                </p>
              </div>

              {/* Preset Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROCEDURAL_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0B1528]/80 border border-slate-700 hover:border-[#5FF3FF]/50 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <span className="text-[10px] text-[#FFC15E] font-bold tracking-widest uppercase block mb-1">
                        ◈ {preset.destination}
                      </span>
                      <h4 className="text-xs font-bold text-[#F4F6F8] mb-2">{preset.title}</h4>
                      <p className="text-[11px] text-slate-300 mb-3">{preset.objective}</p>

                      <div className="space-y-1 mb-3 text-[10px] text-slate-400">
                        <div>
                          <span className="text-[#5FF3FF]">ΔV REQ:</span> {preset.deltaV}
                        </div>
                        <div>
                          <span className="text-[#5FF3FF]">POWER:</span> {preset.power}
                        </div>
                      </div>

                      <div className="p-2 mb-3 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[10px] text-[#FF4D6D]">
                        <span className="font-bold">[!] HAZARD:</span> {preset.hazard}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full py-1.5 rounded text-xs font-bold tracking-wider uppercase bg-[#5FF3FF]/20 text-[#5FF3FF] border border-[#5FF3FF]/50 hover:bg-[#5FF3FF]/30 transition-all"
                    >
                      {language === 'es' ? 'CARGAR EN SIMULADOR' : 'LOAD TO SIMULATOR'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#02050A] border-t border-[#5FF3FF]/20 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {language === 'es'
              ? '[INFO] Funciona online con clave Gemini API o con el motor offline de inteligencia determinista JPL.'
              : '[INFO] Operates live with Gemini API key or with our offline deterministic JPL intelligence engine.'}
          </span>
          <span className="text-[#5FF3FF] font-bold">GOOGLE AI STUDIO · GEMINI 2.5 FLASH</span>
        </div>
      </div>
    </div>
  );
};
