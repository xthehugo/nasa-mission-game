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
}: {
  hoveredOpt: SubsystemOption | null;
  selection: MissionSelection;
  language: Language;
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
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-2 border border-[#5FF3FF]/50 bg-[#04080F]/90 px-2.5 py-1.5 font-mono text-[9.5px] text-[#5FF3FF]"
    >
      <span className="font-bold">
        {isEs ? 'Impacto Previo:' : 'Impact Preview:'} {hoveredOpt.name[language]}
      </span>
      <div className="flex flex-wrap gap-2.5">
        {hoveredOpt.category === 'LAUNCH_VEHICLE' ? (
          <>
            <span>Max {hoveredOpt.maxPayloadMass_kg} kg</span>
            <span>{isEs ? 'Cofia' : 'Fairing'} {hoveredOpt.fairingVolume_U}U</span>
            <span>Δ {fmtDelta(dCost, '$M')}</span>
          </>
        ) : (
          <>
            <span>Δ {fmtDelta(dMass, 'kg')}</span>
            <span>Δ {fmtDelta(dPower, 'W')}</span>
            <span>Δ {fmtDelta(dCost, '$M')}</span>
            <span>Δ {fmtDelta(dVol, 'U')}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
