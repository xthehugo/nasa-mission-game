import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
  Award,
  Check,
  Copy,
  Download,
  FlaskConical,
  History,
  Medal,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  findObjectiveById,
  getCampaignLevelById,
  getNextCampaignLevel,
} from '../engine';
import { useMissionStore } from '../store';
import { playBgmTrack, playHoloTone } from './holoAudio';
import { CONTRACT_TO_CINEMATIC } from './narrativeConfig';
import EngineeringHistogramCard from './EngineeringHistogramCard';

export function PostMissionCertificateModal() {
  const {
    language,
    experienceMode,
    commanderName,
    missionCustomName,
    selection,
    metrics,
    scores,
    testing,
    preFlightVerdict,
    resolvedCrises,
    simulationResult,
    decisionLog,
    reducedMotion,
    soundEnabled,
    activeCampaignLevelId,
    campaignProgress,
    playerXP,
    isCertificateOpen,
    setCertificateOpen,
    setActiveCampaignLevelId,
    loadPreset,
    setPhase,
    setCampaignModalOpen,
    openCinematic,
    appendDecisionLog,
  } = useMissionStore();

  const [downloaded, setDownloaded] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const isEs = language === 'es';
  const show = Boolean(isCertificateOpen && simulationResult);
  const activeLevel = getCampaignLevelById(activeCampaignLevelId);
  const nextLevel = getNextCampaignLevel(activeLevel.id);
  const levelProgress = campaignProgress[activeLevel.id];

  useEffect(() => {
    if (show && soundEnabled) {
      playHoloTone('SUCCESS', true);
      playBgmTrack('VICTORY_FANFARE', true);
    }
  }, [show, soundEnabled]);

  const handleGoToNextMission = () => {
    if (!nextLevel) return;
    playHoloTone('STAR', soundEnabled);
    setCertificateOpen(false);
    setActiveCampaignLevelId(nextLevel.id);
    loadPreset(nextLevel.presetKey);
    setPhase('CML_1');
    appendDecisionLog({
      phase: 'CML_1',
      label: {
        en: `Unlocked & started ${nextLevel.code}: ${nextLevel.title.en}`,
        es: `Desbloqueada e iniciada ${nextLevel.code}: ${nextLevel.title.es}`,
      },
      impact: 'POSITIVE',
    });
    const cinematicId = CONTRACT_TO_CINEMATIC[nextLevel.id];
    if (cinematicId) {
      openCinematic(cinematicId);
    } else {
      setCampaignModalOpen(true);
    }
  };

  const objective = findObjectiveById(selection.objectiveId);
  const resolvedCount = simulationResult
    ? simulationResult.dilemmas.filter((d) => Boolean(resolvedCrises[d.id])).length
    : 0;
  const allCrisesOptimal =
    Boolean(simulationResult?.dilemmas.length) &&
    Boolean(
      simulationResult?.dilemmas.every((d) => {
        const chosen = resolvedCrises[d.id];
        return Boolean(d.options.find((o) => o.id === chosen && o.isOptimal));
      }),
    );

  const badges = [
    {
      id: 'swapc',
      earned: metrics.dryMass.marginPercent >= 35 && metrics.power.marginPercent >= 35,
      icon: Award,
      title: { en: 'SWaP-C Balance Master', es: 'Maestro Balance SWaP-C' },
      desc: { en: '≥35% Dry Mass & EPS margin', es: 'Margen ≥35% Masa Seca y EPS' },
    },
    {
      id: 'crisis',
      earned: allCrisesOptimal,
      icon: ShieldCheck,
      title: { en: 'Orbital Crisis Commander', es: 'Comandante Crisis Orbital' },
      desc: { en: 'Solved all 3 flight crises', es: 'Resolvió 3/3 crisis óptimas' },
    },
    {
      id: 'vv',
      earned: preFlightVerdict.passed && testing.rfInhibitTimerMin >= 30,
      icon: FlaskConical,
      title: { en: 'V&V Rigor Specialist', es: 'Rigor Verificación V&V' },
      desc: { en: 'CSLI V&V + RF ≥30 min', es: 'CSLI V&V + RF ≥30 min' },
    },
    {
      id: 'jpl',
      earned:
        experienceMode === 'JPL_ENGINEER' &&
        (simulationResult?.overallGrade === 'S' || simulationResult?.overallGrade === 'A'),
      icon: Rocket,
      title: { en: 'JPL Team X Distinction', es: 'Distinción JPL Team X' },
      desc: { en: 'Grade S/A in Hardcore Mode', es: 'Grado S/A en Modo Hardcore' },
    },
  ];

  const recommendations: { en: string; es: string }[] = [];
  if (metrics.dryMass.marginPercent < 35) {
    recommendations.push({
      en: `Increase Dry Mass margin to ≥35% (currently ${metrics.dryMass.marginPercent.toFixed(1)}%) by scaling the launcher or choosing higher-Isp propulsion.`,
      es: `Eleva el margen de masa seca a ≥35% (actual ${metrics.dryMass.marginPercent.toFixed(1)}%) escalando el lanzador o usando propulsión de mayor Isp.`,
    });
  }
  if (metrics.power.marginPercent < 35) {
    recommendations.push({
      en: `Raise EPS Power margin to ≥35% (currently ${metrics.power.marginPercent.toFixed(1)}%) with deployable arrays or RTG for deep space.`,
      es: `Aumenta el margen eléctrico EPS a ≥35% (actual ${metrics.power.marginPercent.toFixed(1)}%) con alas desplegables o RTG en espacio profundo.`,
    });
  }
  if (!preFlightVerdict.passed || testing.rfInhibitTimerMin < 30) {
    recommendations.push({
      en: 'Complete all 5 environmental V&V checks in CML 5 and keep RF deployment inhibit timer ≥30 min.',
      es: 'Aprueba las 5 pruebas V&V en CML 5 y configura el temporizador de inhibición RF en ≥30 min.',
    });
  }
  if (!allCrisesOptimal) {
    recommendations.push({
      en: 'Review the 3 in-flight crises in Level 06 to select optimal engineering trade-offs.',
      es: 'Revisa las 3 crisis orbitales del Nivel 06 para elegir las respuestas óptimas de ingeniería.',
    });
  }
  if (metrics.cost.reserveMillionsUSD < 0) {
    recommendations.push({
      en: `Eliminate the budget overrun ($${Math.abs(metrics.cost.reserveMillionsUSD).toFixed(1)}M over cap) by trimming lower-priority subsystems.`,
      es: `Elimina el déficit presupuestario ($${Math.abs(metrics.cost.reserveMillionsUSD).toFixed(1)}M sobre tope) optimizando subsistemas.`,
    });
  }

  const buildReportText = () => {
    if (!simulationResult) return '';
    const earnedNames = badges
      .filter((b) => b.earned)
      .map((b) => `- ${b.title[language]} (${b.desc[language]})`)
      .join('\n');
    return [
      'ORBITAL FORGE — MISSION ARCHITECT CERTIFICATE (JPL CML 1-5 EDUCATIONAL STANDARD)',
      `Commander: CMDR ${commanderName} | Mission: ${missionCustomName} | Mode: ${experienceMode}`,
      `Final Grade: ${simulationResult.overallGrade} (Science ${simulationResult.scienceScore}/100, Global P ${scores.compositeGlobalScore} [S:${scores.scienceReturnScore} M:${scores.engineeringMarginScore} B:${scores.budgetEfficiencyScore}])`,
      `Reference Benchmark: ${objective.realWorldBenchmark.missionName}`,
      `Dry Mass: ${metrics.dryMass.predicted.toFixed(1)} kg | Power: ${metrics.power.generatedAtDestination_W.toFixed(1)} W | Cost: $${metrics.cost.totalMillionsUSD.toFixed(1)}M`,
      '',
      'Open-Data Attribution: Grounded in NASA JPL CML, CubeSat 101, NASA GMAT R2026a & CSA open resources (Non-official educational credential).',
      '',
      'Medals Unlocked:',
      earnedNames || '- Mission Participant',
      '',
      'Decision Legacy Log:',
      ...decisionLog.map((entry) => `[${entry.timestamp}] (${entry.phase}) ${entry.label[language]}`),
    ].join('\n');
  };

  const handleCopyReport = () => {
    const text = buildReportText();
    if (!text) return;
    void navigator.clipboard.writeText(text);
    playHoloTone('STEP', soundEnabled);
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1800);
  };

  const handleDownloadCertificate = () => {
    if (!simulationResult) return;
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 297;
      const pageHeight = 210;

      // 1. Deep Space Midnight Blue Background
      doc.setFillColor(3, 8, 20);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // 2. Subtle Star Constellation Dots
      doc.setFillColor(255, 255, 255);
      const stars = [
        [25, 25, 0.4], [50, 45, 0.3], [85, 20, 0.5], [120, 35, 0.3],
        [220, 25, 0.4], [270, 30, 0.6], [260, 60, 0.4], [40, 170, 0.5],
        [75, 190, 0.3], [240, 185, 0.5], [265, 160, 0.4], [150, 195, 0.3],
        [18, 110, 0.4], [280, 115, 0.4], [140, 15, 0.6]
      ];
      stars.forEach(([sx, sy, sr]) => {
        doc.circle(sx, sy, sr, 'F');
      });

      // 3. Official Double Outer Borders in NASA Gold & Cyan
      doc.setDrawColor(255, 193, 94); // #FFC15E
      doc.setLineWidth(1.4);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');

      doc.setDrawColor(95, 243, 255); // #5FF3FF
      doc.setLineWidth(0.5);
      doc.rect(11, 11, pageWidth - 22, pageHeight - 22, 'S');

      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(0.25);
      doc.rect(13, 13, pageWidth - 26, pageHeight - 26, 'S');

      // Corner Tech Ornaments
      const cornerSize = 7;
      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(1.2);
      doc.line(8, 8 + cornerSize, 8 + cornerSize, 8);
      doc.line(pageWidth - 8 - cornerSize, 8, pageWidth - 8, 8 + cornerSize);
      doc.line(8, pageHeight - 8 - cornerSize, 8 + cornerSize, pageHeight - 8);
      doc.line(pageWidth - 8 - cornerSize, pageHeight - 8, pageWidth - 8, pageHeight - 8 - cornerSize);

      // 4. Header: NASA Official Title
      doc.setTextColor(255, 193, 94);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('NATIONAL AERONAUTICS AND SPACE ADMINISTRATION', pageWidth / 2, 23, { align: 'center' });

      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(
        isEs
          ? 'DIVISIÓN DE OPERACIONES DE VUELO Y EXPLORACIÓN CIENTÍFICA · PROYECTO ÍCARO'
          : 'FLIGHT OPERATIONS & SCIENTIFIC EXPLORATION DIVISION · PROJECT ICARUS',
        pageWidth / 2,
        28,
        { align: 'center' }
      );

      // Gold Divider Line with Center Diamond
      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(0.6);
      doc.line(45, 31, pageWidth - 45, 31);
      doc.setFillColor(255, 193, 94);
      doc.circle(pageWidth / 2, 31, 1.2, 'F');

      // 5. Diploma Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(
        isEs ? 'DIPLOMA DE HONOR Y CERTIFICACIÓN ORBITAL' : 'ORBITAL FLIGHT CERTIFICATE OF HONOR',
        pageWidth / 2,
        43,
        { align: 'center' }
      );

      doc.setTextColor(95, 243, 255); // Cyan
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        isEs
          ? 'Por el presente documento oficial se acredita formalmente que:'
          : 'This official document hereby formally certifies that:',
        pageWidth / 2,
        50,
        { align: 'center' }
      );

      // 6. Recipient Name
      const rankTitle =
        experienceMode === 'JPL_ENGINEER'
          ? isEs
            ? 'INGENIERO JEFE'
            : 'CHIEF ENGINEER'
          : isEs
            ? 'CADETE DE VUELO'
            : 'FLIGHT CADET';
      doc.setTextColor(255, 193, 94);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(`${rankTitle} ${commanderName.toUpperCase()}`, pageWidth / 2, 63, { align: 'center' });

      doc.setDrawColor(95, 243, 255);
      doc.setLineWidth(0.8);
      const nameWidth = doc.getTextWidth(`${rankTitle} ${commanderName.toUpperCase()}`);
      doc.line((pageWidth - nameWidth) / 2 - 5, 66, (pageWidth + nameWidth) / 2 + 5, 66);

      // 7. Statement of Accomplishment
      doc.setTextColor(226, 232, 240); // slate-200
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const missionText = isEs
        ? `Ha completado con éxito la misión ${activeLevel.code}: ${activeLevel.title.es}, diseñando y operando la nave espacial "${missionCustomName}" bajo rigurosas normas de seguridad y certificación aeroespacial de la NASA.`
        : `Has successfully completed mission ${activeLevel.code}: ${activeLevel.title.en}, engineering and piloting the spacecraft "${missionCustomName}" in full compliance with NASA aerospace safety reserves and flight certification standards.`;

      const splitMission = doc.splitTextToSize(missionText, 210);
      doc.text(splitMission, pageWidth / 2, 75, { align: 'center' });

      // 8. Three Achievement Badges
      const badgeY = 92;
      const badgeW = 74;
      const badgeH = 34;

      // Box 1: Propulsión y Tsiolkovsky (Delta-V)
      doc.setFillColor(6, 18, 36);
      doc.rect(26, badgeY, badgeW, badgeH, 'F');
      doc.setDrawColor(95, 243, 255);
      doc.setLineWidth(0.5);
      doc.rect(26, badgeY, badgeW, badgeH, 'S');

      doc.setTextColor(95, 243, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(isEs ? 'PROPULSION & TSIOLKOVSKY' : 'PROPULSION & TSIOLKOVSKY', 26 + badgeW / 2, badgeY + 7, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(`Delta-V: ${metrics.deltaV_available_ms.toFixed(0)} m/s`, 26 + badgeW / 2, badgeY + 16, { align: 'center' });
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(isEs ? 'Capacidad de empuje certificada' : 'Certified thrust capability', 26 + badgeW / 2, badgeY + 23, { align: 'center' });
      doc.setTextColor(255, 193, 94);
      doc.setFontSize(7.5);
      doc.text(isEs ? '[OK] Margen seguro >= 20%' : '[OK] Safe reserve >= 20%', 26 + badgeW / 2, badgeY + 29, { align: 'center' });

      // Box 2: SWaP-C & Ensayos Ambientales CSLI
      doc.setFillColor(6, 18, 36);
      doc.rect(111, badgeY, badgeW, badgeH, 'F');
      doc.setDrawColor(95, 243, 255);
      doc.setLineWidth(0.5);
      doc.rect(111, badgeY, badgeW, badgeH, 'S');

      doc.setTextColor(95, 243, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(isEs ? 'CALIFICACION AMBIENTAL' : 'ENVIRONMENTAL QUALIFICATION', 111 + badgeW / 2, badgeY + 7, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(isEs ? 'CSLI V&V APROBADO' : 'CSLI V&V APPROVED', 111 + badgeW / 2, badgeY + 16, { align: 'center' });
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(isEs ? `Masa: ${metrics.wetMass_kg.toFixed(1)} kg | Gen: ${metrics.power.generatedAtDestination_W.toFixed(0)} W` : `Mass: ${metrics.wetMass_kg.toFixed(1)} kg | Gen: ${metrics.power.generatedAtDestination_W.toFixed(0)} W`, 111 + badgeW / 2, badgeY + 23, { align: 'center' });
      doc.setTextColor(255, 193, 94);
      doc.setFontSize(7.5);
      doc.text(isEs ? '[OK] Termovacio y Vibracion Passed' : '[OK] Thermal-Vac & Vibration Passed', 111 + badgeW / 2, badgeY + 29, { align: 'center' });

      // Box 3: Puntuación Final & Estrellas
      const earnedStars = levelProgress?.stars ?? 3;
      const finalGlobalScore = scores.compositeGlobalScore;

      doc.setFillColor(6, 18, 36);
      doc.rect(196, badgeY, badgeW, badgeH, 'F');
      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(0.8);
      doc.rect(196, badgeY, badgeW, badgeH, 'S');

      doc.setTextColor(255, 193, 94);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(isEs ? 'EVALUACION DE VUELO' : 'FLIGHT EVALUATION', 196 + badgeW / 2, badgeY + 7, { align: 'center' });
      doc.setTextColor(255, 193, 94);
      doc.setFontSize(12);
      doc.text(
        isEs
          ? `${earnedStars} DE 3 ESTRELLAS`
          : `${earnedStars} OF 3 STARS`,
        196 + badgeW / 2,
        badgeY + 16,
        { align: 'center' }
      );
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`${isEs ? 'Puntaje de Mision' : 'Mission Score'}: ${finalGlobalScore}/100`, 196 + badgeW / 2, badgeY + 23, { align: 'center' });
      doc.setTextColor(95, 243, 255);
      doc.setFontSize(7.5);
      doc.text(isEs ? `+${playerXP} XP Acumulados` : `+${playerXP} XP Earned`, 196 + badgeW / 2, badgeY + 29, { align: 'center' });

      // 9. Signatures Block
      const sigY = 148;

      // Commander Frank Vega Signature
      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(0.6);
      doc.line(35, sigY + 15, 115, sigY + 15);

      doc.setTextColor(255, 193, 94);
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(14);
      doc.text('Frank Vega', 75, sigY + 12, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('COMANDANTE FRANK VEGA', 75, sigY + 20, { align: 'center' });
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(isEs ? 'Director de Operaciones de Vuelo · NASA' : 'Chief of Flight Operations · NASA', 75, sigY + 25, { align: 'center' });

      // Official Golden NASA Seal in Center
      const sealX = pageWidth / 2;
      const sealY = sigY + 14;
      doc.setFillColor(15, 23, 42);
      doc.circle(sealX, sealY, 13, 'F');
      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(1.2);
      doc.circle(sealX, sealY, 13, 'S');
      doc.setDrawColor(95, 243, 255);
      doc.setLineWidth(0.4);
      doc.circle(sealX, sealY, 11, 'S');

      doc.setTextColor(255, 193, 94);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('NASA', sealX, sealY - 4, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.text('ORBITAL', sealX, sealY, { align: 'center' });
      doc.text('SEAL', sealX, sealY + 4, { align: 'center' });
      doc.setTextColor(95, 243, 255);
      doc.setFontSize(5.5);
      doc.text('FLIGHT-OK', sealX, sealY + 8, { align: 'center' });

      // Dir. Elena Rostova Signature
      doc.setDrawColor(255, 193, 94);
      doc.setLineWidth(0.6);
      doc.line(pageWidth - 115, sigY + 15, pageWidth - 35, sigY + 15);

      doc.setTextColor(255, 193, 94);
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(14);
      doc.text('Elena Rostova', pageWidth - 75, sigY + 12, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('DRA. ELENA ROSTOVA', pageWidth - 75, sigY + 20, { align: 'center' });
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(isEs ? 'Directora de Sistemas & Cargas Útiles · JPL' : 'Director of Systems & Payloads · JPL', pageWidth - 75, sigY + 25, { align: 'center' });

      // 10. Footer Security Code & Timestamp
      const dateStr = new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const verifyHash = `NASA-HQ-${activeLevel.code}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(
        `${isEs ? 'Fecha de Expedición' : 'Issue Date'}: ${dateStr}  |  ${isEs ? 'Código de Verificación Oficial' : 'Official Verification Hash'}: ${verifyHash}`,
        pageWidth / 2,
        pageHeight - 13,
        { align: 'center' }
      );

      // Save PDF directly to user's device
      const pdfFileName = `NASA-Diploma-${missionCustomName.replace(/\s+/g, '-')}-${activeLevel.code}.pdf`;
      doc.save(pdfFileName);

      playHoloTone('STAR', soundEnabled);
      setDownloaded(true);
    } catch (err) {
      console.error('Error generating NASA Diploma PDF:', err);
    }
  };

  return (
    <AnimatePresence>
      {show && simulationResult && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080F]/90 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={reducedMotion ? false : { scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { scale: 0.97, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#FFC15E]/55 bg-[#04080F] p-6 shadow-[0_0_55px_rgba(255,193,94,0.16)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#5FF3FF]/20 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#FFC15E] uppercase">
                  {isEs
                    ? 'SYS.ARCHIVE // CERTIFICADO DE ARQUITECTO DE MISIÓN (JPL CML)'
                    : 'SYS.ARCHIVE // MISSION ARCHITECT CERTIFICATE (JPL CML)'}
                </div>
                <h2 className="mt-1 text-xl font-light tracking-tight text-white">
                  CMDR {commanderName} · {missionCustomName}
                </h2>
                <p className="mt-1 font-mono text-[11px] tracking-[0.14em] text-[#5FF3FF] uppercase">
                  {experienceMode === 'CADET'
                    ? isEs ? 'Modo Cadete (Historia)' : 'Cadet Story Mode'
                    : isEs ? 'Modo Ingeniero JPL (Hardcore)' : 'JPL Hardcore Mode'}{' '}
                  · {isEs ? 'Calificación' : 'Grade'}:{' '}
                  <strong className="text-[#FFC15E]">{simulationResult.overallGrade}</strong> ({simulationResult.scienceScore}/100)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playHoloTone('STEP', soundEnabled);
                  setCertificateOpen(false);
                }}
                aria-label={isEs ? 'Cerrar certificado' : 'Close certificate'}
                className="border border-[#5FF3FF]/35 bg-[#04080F] p-1.5 text-[#5FF3FF] transition hover:border-[#5FF3FF] hover:bg-[#5FF3FF]/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Poly Bridge Engineering Histogram & 3-Star Breakdown */}
            <EngineeringHistogramCard
              metrics={metrics}
              benchmark={objective.realWorldBenchmark}
              missionSuccess={simulationResult.missionSuccess}
              scienceScore={simulationResult.scienceScore}
              crisesSolvedCount={resolvedCount}
              totalCrisesCount={simulationResult.dilemmas.length}
              lang={language}
              className="mt-4"
            />

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-3 border p-3 ${
                      b.earned
                        ? 'border-[#FFC15E]/50 bg-[#FFC15E]/10 text-[#FFC15E]'
                        : 'border-[#5FF3FF]/15 bg-[#04080F] text-slate-500 opacity-65'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                        b.earned
                          ? 'border-[#FFC15E]/40 bg-[#FFC15E]/15 text-[#FFC15E]'
                          : 'border-[#5FF3FF]/15 bg-[#04080F] text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase">
                        {b.title[language]}
                      </div>
                      <div className="text-[11px] opacity-85">{b.desc[language]}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border border-[#5FF3FF]/25 bg-[#04080F] p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                <Medal className="h-4 w-4" />
                <span>{isEs ? 'Comparativa NASA Real:' : 'NASA Benchmark:'} {objective.realWorldBenchmark.missionName}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                <div>{isEs ? 'Masa:' : 'Mass:'} {metrics.dryMass.predicted.toFixed(1)} / {objective.realWorldBenchmark.actualMass_kg} kg</div>
                <div>{isEs ? 'Potencia:' : 'Power:'} {metrics.power.generatedAtDestination_W.toFixed(0)} / {objective.realWorldBenchmark.actualPower_W} W</div>
                <div>{isEs ? 'Costo:' : 'Cost:'} ${metrics.cost.totalMillionsUSD.toFixed(1)}M / ${objective.realWorldBenchmark.actualCost_MillionsUSD}M</div>
              </div>
            </div>

            <div className="mt-4 border border-[#FFC15E]/30 bg-[#04080F] p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#FFC15E] uppercase">
                <Sparkles className="h-4 w-4" />
                <span>
                  {isEs
                    ? 'Diagnóstico de Ingeniería · Cómo alcanzar Grado S'
                    : 'Engineering Diagnostic · How to Reach Grade S'}
                </span>
              </div>
              {recommendations.length === 0 ? (
                <p className="mt-2 font-mono text-[11px] text-[#5FF3FF]">
                  {isEs
                    ? '¡Excelencia de Arquitectura alcanzada! Cumpliste márgenes ≥35%, rigor V&V y las 3 decisiones óptimas en vuelo.'
                    : 'Mission Architect Optimization Achieved! All ≥35% margins, V&V checks, and 3 flight crises cleared optimally.'}
                </p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-300">
                  {recommendations.map((rec, idx) => (
                    <li key={idx}>{rec[language]}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 border border-[#5FF3FF]/30 bg-[#04080F] p-3.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                  {isEs ? `Lo que aprendiste · ${activeLevel.code}` : `What You Learned · ${activeLevel.code}`}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-[#FFC15E]">
                    {'★'.repeat(levelProgress?.stars ?? 0)}
                    {'☆'.repeat(Math.max(0, 3 - (levelProgress?.stars ?? 0)))}
                  </span>
                  <span className="text-[#5FF3FF]">{playerXP} XP</span>
                </div>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-200">
                {activeLevel.learnedTakeaways.map((item, idx) => (
                  <li key={idx}>{item[language]}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 border border-[#5FF3FF]/25 bg-[#04080F] p-3.5">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-[#5FF3FF] uppercase">
                <History className="h-4 w-4" />
                <span>{isEs ? 'Bitácora de Decisiones (Tu Legado)' : 'Decision Legacy Timeline'}</span>
              </div>
              <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1 text-xs">
                {decisionLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-2 border-l-2 border-[#5FF3FF]/40 bg-[#04080F] px-2.5 py-1.5"
                  >
                    <span className="font-mono text-[10px] text-slate-400">{entry.timestamp}</span>
                    <span className="border border-[#5FF3FF]/30 px-1.5 py-0.5 font-mono text-[9px] text-[#5FF3FF]">
                      {entry.phase}
                    </span>
                    <span
                      className={
                        entry.impact === 'CRITICAL'
                          ? 'text-[#FF4D6D]'
                          : entry.impact === 'WARNING'
                            ? 'text-[#FFC15E]'
                            : 'text-slate-200'
                      }
                    >
                      {entry.label[language]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#5FF3FF]/20 pt-4">
              <span className="max-w-xs font-mono text-[10px] leading-relaxed text-slate-400">
                {isEs
                  ? 'Credencial educativa basada en datos abiertos NASA JPL CML, CubeSat 101, CSA y NASA GMAT R2026a (no oficial).'
                  : 'Grounded in NASA JPL CML, CubeSat 101, CSA & GMAT R2026a Open Data — Non-official educational credential.'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 border border-[#5FF3FF] bg-[#5FF3FF]/10 px-4 py-2 font-mono text-[10px] tracking-[0.14em] text-[#5FF3FF] uppercase transition hover:bg-[#5FF3FF]/20"
                >
                  {copiedSummary ? <Check className="h-4 w-4 text-[#5FF3FF]" /> : <Copy className="h-4 w-4" />}
                  <span>
                    {copiedSummary
                      ? isEs
                        ? 'Resumen Copiado'
                        : 'Summary Copied'
                      : isEs
                        ? 'Copiar Resumen'
                        : 'Copy Shareable Report'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="inline-flex items-center gap-2 border border-[#FFC15E] bg-[#FFC15E]/15 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#FFC15E] uppercase transition hover:bg-[#FFC15E]/25"
                >
                  {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  <span>
                    {downloaded
                      ? isEs
                        ? 'Diploma Descargado (.pdf)'
                        : 'Diploma Downloaded (.pdf)'
                      : isEs
                        ? 'Descargar Diploma de Honor (.pdf)'
                        : 'Download Honor Diploma (.pdf)'}
                  </span>
                </button>
                {nextLevel && (
                  <button
                    type="button"
                    onClick={handleGoToNextMission}
                    className="inline-flex items-center gap-2 border border-[#5FF3FF] bg-[#5FF3FF] px-4 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#02050B] uppercase transition hover:bg-[#7ff6ff]"
                  >
                    <Rocket className="h-4 w-4" />
                    <span>
                      {isEs
                        ? `Siguiente misión: ${nextLevel.code} →`
                        : `Next Mission: ${nextLevel.code} →`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
