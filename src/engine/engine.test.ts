import {
  getMGAContingencyByTRL,
  NASA_PHYSICS_CONSTANTS,
  type LocalizedText,
  type MissionSelection,
} from '../types/mission';
import {
  GROUND_STATIONS,
  ORBITAL_DESTINATIONS,
  PRESET_MISSION_SELECTIONS,
  SCIENCE_OBJECTIVES,
  SUBSYSTEM_CATALOG,
} from './catalog';
import { evaluateMissionPhysics } from './physics';
import { runMissionSimulation } from './simulation';

export interface EngineTestCaseResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface EngineTestReport {
  total: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: EngineTestCaseResult[];
}

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function hasBothLanguages(text: LocalizedText): boolean {
  return text.en.trim().length > 0 && text.es.trim().length > 0;
}

function assertFiniteNumber(value: number, label: string): void {
  assertCondition(
    Number.isFinite(value),
    `Expected ${label} to be finite, got ${String(value)}`,
  );
}

const TEST_CASES: Array<{ name: string; run: () => string }> = [
  {
    name: '1. Catalog Bilingual Integrity & TRL MGA Contingency',
    run: () => {
      assertCondition(
        SCIENCE_OBJECTIVES.length >= 4,
        'Expected at least 4 science objectives',
      );
      assertCondition(
        ORBITAL_DESTINATIONS.length >= 4,
        'Expected at least 4 orbital destinations',
      );
      assertCondition(
        GROUND_STATIONS.length >= 4,
        'Expected at least 4 ground stations',
      );

      for (const obj of SCIENCE_OBJECTIVES) {
        assertCondition(
          hasBothLanguages(obj.title) &&
            hasBothLanguages(obj.question) &&
            hasBothLanguages(obj.realWorldBenchmark.keyTakeaway),
          `Missing EN/ES text in objective ${obj.id}`,
        );
      }

      for (const dest of ORBITAL_DESTINATIONS) {
        assertCondition(
          hasBothLanguages(dest.name) &&
            hasBothLanguages(dest.description) &&
            hasBothLanguages(dest.environmentHazard),
          `Missing EN/ES text in destination ${dest.id}`,
        );
      }

      for (const sub of SUBSYSTEM_CATALOG) {
        assertCondition(
          hasBothLanguages(sub.name) &&
            hasBothLanguages(sub.description) &&
            hasBothLanguages(sub.tradeOffNote) &&
            hasBothLanguages(sub.analogyTooltip),
          `Missing EN/ES text in subsystem ${sub.id}`,
        );
        const expectedMGA = getMGAContingencyByTRL(sub.trl);
        assertCondition(
          sub.mgaContingencyFactor === expectedMGA,
          `MGA mismatch on ${sub.id}: got ${sub.mgaContingencyFactor}, expected ${expectedMGA}`,
        );
      }

      for (const gs of GROUND_STATIONS) {
        assertCondition(
          hasBothLanguages(gs.name),
          `Missing EN/ES text in ground station ${gs.id}`,
        );
      }

      return `${SCIENCE_OBJECTIVES.length} objectives, ${SUBSYSTEM_CATALOG.length} subsystems validated`;
    },
  },
  {
    name: '2. All 4 Official NASA Presets Pass MCR GREEN (>=35%)',
    run: () => {
      const summaries: string[] = [];
      for (const [objId, sel] of Object.entries(PRESET_MISSION_SELECTIONS)) {
        const m = evaluateMissionPhysics(sel);
        assertFiniteNumber(m.dryMass.marginPercent, `${objId}.dryMass.marginPercent`);
        assertFiniteNumber(m.power.marginPercent, `${objId}.power.marginPercent`);
        assertFiniteNumber(m.telecom.linkMargin_dB, `${objId}.telecom.linkMargin_dB`);

        assertCondition(
          m.overallMCRStatus === 'GREEN',
          `${objId} expected GREEN MCR, got ${m.overallMCRStatus} (${m.flightDirectorAdvice.headline.en})`,
        );
        assertCondition(
          m.dryMass.marginPercent >= NASA_PHYSICS_CONSTANTS.MCR_GREEN_MARGIN_PCT,
          `${objId} dry mass margin ${m.dryMass.marginPercent}% < 35%`,
        );
        assertCondition(
          m.power.marginPercent >= NASA_PHYSICS_CONSTANTS.MCR_GREEN_MARGIN_PCT,
          `${objId} power margin ${m.power.marginPercent}% < 35%`,
        );
        assertCondition(
          m.telecom.linkMargin_dB >= m.telecom.requiredMargin_dB,
          `${objId} link margin ${m.telecom.linkMargin_dB} < ${m.telecom.requiredMargin_dB}`,
        );
        assertCondition(m.volume.isCompliant, `${objId} volume exceeded fairing`);
        assertCondition(m.cost.status === 'GREEN', `${objId} cost not GREEN`);
        summaries.push(`${objId}:OK`);
      }
      return summaries.join(', ');
    },
  },
  {
    name: '3. Tsiolkovsky Equation & Cold-Gas Exponential Overload in Deep Space',
    run: () => {
      const marsColdGas: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-mars-reconnaissance'],
        propulsionId: 'prop-cold-gas',
      };
      const m = evaluateMissionPhysics(marsColdGas);
      assertFiniteNumber(m.wetMass_kg, 'wetMass_kg');
      assertCondition(
        m.wetMass_kg > m.launchCapacity_kg,
        `Expected cold-gas Mars wet mass (${m.wetMass_kg} kg) > capacity (${m.launchCapacity_kg} kg)`,
      );
      assertCondition(
        m.dryMass.status === 'RED',
        `Expected dryMass.status === RED, got ${m.dryMass.status}`,
      );
      return `Mars cold-gas wetMass=${m.wetMass_kg} kg > ${m.launchCapacity_kg} kg (RED)`;
    },
  },
  {
    name: '4. 1/R^2 Solar Irradiance Collapse vs RTG at Jupiter (5.20 AU)',
    run: () => {
      const jupiterSolar: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-jupiter-clipper'],
        epsId: 'eps-deployable',
      };
      const solarMetrics = evaluateMissionPhysics(jupiterSolar);
      assertCondition(
        solarMetrics.power.status === 'RED',
        `Expected 350W solar array at 5.20 AU to be RED, got ${solarMetrics.power.status} (${solarMetrics.power.generatedAtDestination_W} W)`,
      );

      const jupiterRTG = evaluateMissionPhysics(
        PRESET_MISSION_SELECTIONS['obj-jupiter-clipper'],
      );
      assertCondition(
        jupiterRTG.power.status === 'GREEN' &&
          jupiterRTG.power.marginPercent >= 35,
        `Expected RTG at Jupiter to be GREEN >=35%, got ${jupiterRTG.power.marginPercent}%`,
      );
      return `Solar@5.2AU=${solarMetrics.power.generatedAtDestination_W}W (RED) vs RTG=${jupiterRTG.power.generatedAtDestination_W}W (${jupiterRTG.power.marginPercent}% GREEN)`;
    },
  },
  {
    name: '5. ADCS Pointing Loss (-18 dB) Breaks Narrow-Beam Telecom Link',
    run: () => {
      const baseline = evaluateMissionPhysics(
        PRESET_MISSION_SELECTIONS['obj-mars-reconnaissance'],
      );
      const coarseAdcs: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-mars-reconnaissance'],
        adcsId: 'adcs-gravity',
      };
      const degraded = evaluateMissionPhysics(coarseAdcs);
      const deltaDB =
        baseline.telecom.linkMargin_dB - degraded.telecom.linkMargin_dB;
      assertCondition(
        Math.abs(deltaDB - 17.7) < 0.25,
        `Expected ~17.7 dB pointing degradation, got ${deltaDB.toFixed(2)} dB`,
      );
      assertCondition(
        degraded.telecom.status === 'RED',
        `Expected coarse ADCS link status RED, got ${degraded.telecom.status}`,
      );
      return `Pointing drop=${deltaDB.toFixed(1)} dB (${degraded.telecom.linkMargin_dB} dB RED)`;
    },
  },
  {
    name: '6. Ground Station Scaling (Commercial GN Fails vs DSN 70m Passes at Jupiter)',
    run: () => {
      const commercialJovian: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-jupiter-clipper'],
        groundStationId: 'gs-commercial',
      };
      const failLink = evaluateMissionPhysics(commercialJovian);
      assertCondition(
        failLink.telecom.status === 'RED',
        `Expected Commercial GN to fail at Jupiter, got ${failLink.telecom.status}`,
      );

      const dsn70Metrics = evaluateMissionPhysics(
        PRESET_MISSION_SELECTIONS['obj-jupiter-clipper'],
      );
      assertCondition(
        dsn70Metrics.telecom.status === 'GREEN',
        `Expected DSN 70m to pass at Jupiter, got ${dsn70Metrics.telecom.status}`,
      );
      return `CommGN=${failLink.telecom.linkMargin_dB} dB (RED) vs DSN70m=${dsn70Metrics.telecom.linkMargin_dB} dB (GREEN)`;
    },
  },
  {
    name: '7. Fairing Volume Envelope & Budget Cap Enforcement',
    run: () => {
      const oversizedRideshare: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-earth-bionutrients'],
        payloadIds: ['pay-sar-radar', 'pay-multispectral'],
        launchVehicleId: 'lv-rideshare',
      };
      const m = evaluateMissionPhysics(oversizedRideshare);
      assertCondition(
        !m.volume.isCompliant,
        `Expected volume non-compliant (${m.volume.used_U}U / ${m.volume.maxFairing_U}U)`,
      );
      assertCondition(
        m.cost.status === 'RED',
        `Expected cost status RED ($${m.cost.totalMillionsUSD}M > $${m.cost.budgetCapMillionsUSD}M)`,
      );
      assertCondition(
        m.overallMCRStatus === 'RED',
        `Expected overall MCR RED, got ${m.overallMCRStatus}`,
      );
      return `Vol=${m.volume.used_U}U/${m.volume.maxFairing_U}U, Cost=$${m.cost.totalMillionsUSD}M/$${m.cost.budgetCapMillionsUSD}M`;
    },
  },
  {
    name: '8. Science Traceability Matrix (USER Segment) Rejects Missing Required Payload',
    run: () => {
      const missingScience: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-mars-reconnaissance'],
        payloadIds: ['pay-multispectral'],
      };
      const m = evaluateMissionPhysics(missingScience);
      const userChk = m.mcrChecklist.find((c) => c.id === 'chk-user-science');
      assertCondition(
        userChk?.status === 'RED',
        `Expected chk-user-science RED when required SAR payload omitted`,
      );
      assertCondition(
        m.overallMCRStatus === 'RED',
        `Expected overall MCR RED when required payload missing`,
      );
      return `chk-user-science=${userChk?.status} (${userChk?.valueSummary})`;
    },
  },
  {
    name: '9. Interactive Flight Crises: Optimal Choices Outperform Risky Choices',
    run: () => {
      const sel = PRESET_MISSION_SELECTIONS['obj-helio-lunar-trailblazer'];
      const metrics = evaluateMissionPhysics(sel);

      const optimalSim = runMissionSimulation(sel, metrics, {
        'crisis-solar-cme': 'opt-safe-mode',
        'crisis-eclipse-thermal': 'opt-duty-cycle',
        'crisis-downlink-rain': 'opt-adaptive-rate',
      });
      const riskySim = runMissionSimulation(sel, metrics, {
        'crisis-solar-cme': 'opt-push-science',
        'crisis-eclipse-thermal': 'opt-overdrive',
        'crisis-downlink-rain': 'opt-max-bitrate',
      });

      assertCondition(
        optimalSim.dilemmas.length >= 3 && optimalSim.events.length === 5,
        `Expected 3 dilemmas & 5 phase events`,
      );
      assertCondition(
        optimalSim.missionSuccess && optimalSim.overallGrade === 'S',
        `Expected optimal Lunar sim Grade S, got ${optimalSim.overallGrade}`,
      );
      assertCondition(
        optimalSim.scienceScore > riskySim.scienceScore,
        `Expected optimal score (${optimalSim.scienceScore}) > risky score (${riskySim.scienceScore})`,
      );
      return `Optimal=${optimalSim.scienceScore} (${optimalSim.overallGrade}) vs Risky=${riskySim.scienceScore} (${riskySim.overallGrade})`;
    },
  },
  {
    name: '10. Simulation Aborts Mission on Unviable Rocket/Mass Design',
    run: () => {
      const broken: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-jupiter-clipper'],
        propulsionId: 'prop-cold-gas',
        epsId: 'eps-body-mounted',
        launchVehicleId: 'lv-rideshare',
        groundStationId: 'gs-commercial',
      };
      const metrics = evaluateMissionPhysics(broken);
      const sim = runMissionSimulation(broken, metrics);
      assertCondition(
        !sim.missionSuccess && sim.overallGrade === 'FAIL',
        `Expected missionSuccess=false and grade=FAIL, got success=${sim.missionSuccess}, grade=${sim.overallGrade}`,
      );
      assertCondition(
        sim.events.some((e) => e.severity === 'CRITICAL'),
        'Expected at least one CRITICAL simulation event',
      );
      return `Broken design properly aborted (score=${sim.scienceScore}, grade=${sim.overallGrade})`;
    },
  },
  {
    name: '11. GMAT R2026a Hohmann Transfer Benchmark (LEO->GEO 3,673 m/s)',
    run: () => {
      const geo = ORBITAL_DESTINATIONS.find((d) => d.id === 'dest-geo');
      if (!geo) {
        throw new Error('Expected dest-geo in ORBITAL_DESTINATIONS');
      }
      assertCondition(
        geo.requiredDeltaV_ms === 3673,
        `Expected GMAT GEO Delta-V 3673 m/s, got ${geo.requiredDeltaV_ms}`,
      );

      // GMAT R2026a nominal burn Isp = 300 s -> ~71.3% propellant mass fraction
      const gmatIsp = 300;
      const gmatTheoreticalFuelFraction =
        1 -
        Math.exp(
          -geo.requiredDeltaV_ms /
            (gmatIsp * NASA_PHYSICS_CONSTANTS.STANDARD_GRAVITY_MS2),
        );
      assertCondition(
        gmatTheoreticalFuelFraction > 0.71 &&
          gmatTheoreticalFuelFraction < 0.716,
        `Expected GMAT theoretical fuel fraction ~0.713, got ${gmatTheoreticalFuelFraction.toFixed(4)}`,
      );

      const biprop = SUBSYSTEM_CATALOG.find((s) => s.id === 'prop-biprop');
      if (!biprop || typeof biprop.isp_s !== 'number') {
        throw new Error('Expected prop-biprop with numeric isp_s');
      }

      const geoBipropSelection: MissionSelection = {
        ...PRESET_MISSION_SELECTIONS['obj-helio-lunar-trailblazer'],
        destinationId: 'dest-geo',
        propulsionId: 'prop-biprop',
        launchVehicleId: 'lv-falcon9',
        groundStationId: 'gs-near-earth',
      };
      const m = evaluateMissionPhysics(geoBipropSelection);
      assertFiniteNumber(m.wetMass_kg, 'geo.wetMass_kg');
      assertFiniteNumber(m.propellantMass_kg, 'geo.propellantMass_kg');
      assertCondition(
        m.deltaV_required_ms === 3673,
        `Expected deltaV_required_ms=3673, got ${m.deltaV_required_ms}`,
      );

      const engineFuelFraction = m.propellantMass_kg / m.wetMass_kg;
      const expectedBipropFraction =
        1 -
        Math.exp(
          -3673 /
            (biprop.isp_s * NASA_PHYSICS_CONSTANTS.STANDARD_GRAVITY_MS2),
        );
      assertCondition(
        Math.abs(engineFuelFraction - expectedBipropFraction) < 0.005,
        `Expected engine fuel fraction ~${expectedBipropFraction.toFixed(4)}, got ${engineFuelFraction.toFixed(4)}`,
      );

      return `GEO Delta-V=3,673 m/s; GMAT(300s)=${(gmatTheoreticalFuelFraction * 100).toFixed(1)}%, Biprop(${biprop.isp_s}s)=${(engineFuelFraction * 100).toFixed(1)}%`;
    },
  },
];

export function runEngineTestSuite(): EngineTestReport {
  const results: EngineTestCaseResult[] = TEST_CASES.map((tc) => {
    try {
      const detail = tc.run();
      return { name: tc.name, passed: true, detail };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      return { name: tc.name, passed: false, detail };
    }
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}
