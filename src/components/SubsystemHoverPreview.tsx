import { motion } from 'framer-motion';
import { findSubsystemById } from '../engine';
import { equippedIdForCategory } from '../store';
import type { Language, MissionSelection, SubsystemOption } from '../types/mission';

function fmtDelta(val: number, unit: string): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)} ${unit}`;
}

export function SubsystemHoverPreview({
  hoveredOpt,
  selection,
  language,
  isFirst = false,
}: {
  hoveredOpt: SubsystemOption | null;
  selection: MissionSelection;
  language: Language;
  isFirst?: boolean;
}) {
  if (!hoveredOpt) return null;

  const isEs = language === 'es';
  const eqId = equippedIdForCategory(selection, hoveredOpt.category);
  const current = eqId ? findSubsystemById(eqId) : undefined;
  const payloadOn =
    hoveredOpt.category === 'PAYLOAD' && selection.payloadIds.includes(hoveredOpt.id);
  const sign = payloadOn ? -1 : 1;

  const dMass = current
    ? hoveredOpt.massCBE_kg - current.massCBE_kg
    : sign * hoveredOpt.massCBE_kg;
  const dCost = current
    ? hoveredOpt.cost_MillionsUSD - current.cost_MillionsUSD
    : sign * hoveredOpt.cost_MillionsUSD;
  const dVol = current
    ? hoveredOpt.volume_U - current.volume_U
    : sign * hoveredOpt.volume_U;

  const netPower = (opt: SubsystemOption) =>
    opt.powerGenerated1AU_W > 0 ? opt.powerGenerated1AU_W : -opt.powerDrawNominal_W;
  const dPower = current
    ? netPower(hoveredOpt) - netPower(current)
    : sign * netPower(hoveredOpt);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: isFirst ? 4 : -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={`pointer-events-none absolute left-0 right-0 z-50 ${
        isFirst ? 'top-full mt-2' : 'bottom-full mb-2'
      }`}
    >
      <div className="relative border border-[#5FF3FF] bg-[#04080F]/95 backdrop-blur-md px-3 py-2 font-mono text-[9.5px] text-[#5FF3FF] rounded-lg shadow-[0_0_25px_rgba(95,243,255,0.35)]">
        <div className="flex items-center justify-between border-b border-[#5FF3FF]/30 pb-1 mb-1 font-bold">
          <span>
            ◈ {isEs ? 'IMPACTO PREVIO' : 'IMPACT PREVIEW'}: {hoveredOpt.name[language]}
          </span>
          <span className="text-[8.5px] text-[#FFC15E]">TRL {hoveredOpt.trl}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-slate-200">
          {hoveredOpt.category === 'LAUNCH_VEHICLE' ? (
            <>
              <span>
                MAX <strong className="text-white">{hoveredOpt.maxPayloadMass_kg} KG</strong>
              </span>
              <span>
                {isEs ? 'COFIA' : 'FAIRING'}{' '}
                <strong className="text-white">{hoveredOpt.fairingVolume_U}U</strong>
              </span>
              <span className={dCost <= 0 ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
                Δ {fmtDelta(dCost, '$M')}
              </span>
            </>
          ) : (
            <>
              <span className={dMass <= 0 ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
                Δ {fmtDelta(dMass, 'KG')}
              </span>
              <span className={dPower >= 0 ? 'text-[#5FF3FF]' : 'text-[#FF4D6D]'}>
                Δ {fmtDelta(dPower, 'W')}
              </span>
              <span className={dCost <= 0 ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
                Δ {fmtDelta(dCost, '$M')}
              </span>
              <span className={dVol <= 0 ? 'text-[#5FF3FF]' : 'text-[#FFC15E]'}>
                Δ {fmtDelta(dVol, 'U')}
              </span>
            </>
          )}
        </div>

        {/* Balloon tail arrow */}
        <div
          className={`absolute left-8 w-2.5 h-2.5 bg-[#04080F] border-[#5FF3FF] transform rotate-45 ${
            isFirst
              ? '-top-1.5 border-l border-t'
              : '-bottom-1.5 border-r border-b'
          }`}
        />
      </div>
    </motion.div>
  );
}
