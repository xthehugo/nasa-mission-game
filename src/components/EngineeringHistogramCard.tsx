import { BarChart3, Check, DollarSign, Shield, Star, Trophy, X } from 'lucide-react';
import type { Language, PhysicsMetrics, RealWorldMissionBenchmark } from '../types/mission';

interface Props {
  metrics: PhysicsMetrics;
  benchmark: RealWorldMissionBenchmark;
  missionSuccess: boolean;
  scienceScore: number;
  crisesSolvedCount: number;
  totalCrisesCount: number;
  lang?: Language;
  className?: string;
}

export default function EngineeringHistogramCard({
  metrics,
  benchmark,
  missionSuccess,
  scienceScore,
  crisesSolvedCount,
  totalCrisesCount,
  lang = 'es',
  className = '',
}: Props) {
  const isEs = lang === 'es';

  // 1. Budget Metrics
  const spentCost = metrics.cost.totalMillionsUSD;
  const budgetCap = metrics.cost.budgetCapMillionsUSD;
  const budgetRatio = spentCost / Math.max(1, budgetCap);
  const budgetStarEarned = missionSuccess && budgetRatio <= 0.85;

  // 2. Structural & SWaP-C Safety Margin
  const massMargin = metrics.dryMass.marginPercent;
  const powerMargin = metrics.power.marginPercent;
  const minMargin = Math.min(massMargin, powerMargin);
  const marginStarEarned = missionSuccess && minMargin >= 35 && crisesSolvedCount >= totalCrisesCount;

  // 3. Mission Completion Star
  const missionStarEarned = missionSuccess && scienceScore >= 60;

  const totalStars = (missionStarEarned ? 1 : 0) + (budgetStarEarned ? 1 : 0) + (marginStarEarned ? 1 : 0);

  // Simulated fleet histogram distribution bins for Poly Bridge comparison
  // (Shows bell curve of simulated player/NASA designs)
  const budgetBins = [
    { label: '<$10M', height: 28 },
    { label: '$10-15M', height: 65 },
    { label: '$15-20M', height: 95 },
    { label: '$20-25M', height: 78 },
    { label: '>$25M', height: 35 },
  ];

  const marginBins = [
    { label: '<15%', height: 32 },
    { label: '15-25%', height: 58 },
    { label: '25-35%', height: 90 },
    { label: '35-50%', height: 72 },
    { label: '>50%', height: 40 },
  ];

  const getActiveBudgetBinIndex = (cost: number) => {
    if (cost < 10) return 0;
    if (cost < 15) return 1;
    if (cost < 20) return 2;
    if (cost < 25) return 3;
    return 4;
  };

  const getActiveMarginBinIndex = (margin: number) => {
    if (margin < 15) return 0;
    if (margin < 25) return 1;
    if (margin < 35) return 2;
    if (margin < 50) return 3;
    return 4;
  };

  const playerBudgetBin = getActiveBudgetBinIndex(spentCost);
  const benchmarkBudgetBin = getActiveBudgetBinIndex(benchmark.actualCost_MillionsUSD);
  const playerMarginBin = getActiveMarginBinIndex(minMargin);

  return (
    <div
      className={`border border-[#FFC15E]/40 bg-[#071329]/95 p-4 rounded-lg font-mono text-[11px] shadow-[0_0_25px_rgba(255,193,94,0.15)] ${className}`}
    >
      {/* Header with Poly Bridge Star Score */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#FFC15E]" />
          <span className="font-bold tracking-wider text-white uppercase text-xs">
            {isEs ? 'HISTOGRAMA DE EFICIENCIA & 3 ESTRELLAS' : 'ENGINEERING HISTOGRAM & 3-STAR BREAKDOWN'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-base text-[#FFC15E]">
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              className={`h-5 w-5 ${
                starNum <= totalStars
                  ? 'fill-[#FFC15E] text-[#FFC15E] drop-shadow-[0_0_8px_rgba(255,193,94,0.7)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-white ml-1">
            {totalStars}/3 {isEs ? 'ESTRELLAS' : 'STARS'}
          </span>
        </div>
      </div>

      {/* 3-Star Criteria Verification Checklist */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
        {/* Star 1 */}
        <div
          className={`border p-2.5 rounded ${
            missionStarEarned
              ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-white'
              : 'border-slate-800 bg-[#040814]/70 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1 text-[#FFC15E]">
              <Star className={`h-3.5 w-3.5 ${missionStarEarned ? 'fill-[#FFC15E]' : ''}`} />
              <span>{isEs ? '★ 1: MISIÓN CUMPLIDA' : '★ 1: MISSION SUCCESS'}</span>
            </span>
            {missionStarEarned ? (
              <Check className="h-3.5 w-3.5 text-[#5FF3FF]" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-500" />
            )}
          </div>
          <p className="mt-1 text-[9px] text-slate-300">
            {isEs
              ? 'Inserción orbital y objetivos científicos ≥60/100.'
              : 'Target orbit reached & science score ≥60/100.'}
          </p>
          <div className="mt-1 text-[8.5px] font-bold text-[#5FF3FF]">
            {scienceScore}/100 {isEs ? 'Puntos' : 'Points'}
          </div>
        </div>

        {/* Star 2 */}
        <div
          className={`border p-2.5 rounded ${
            budgetStarEarned
              ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-white'
              : 'border-slate-800 bg-[#040814]/70 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1 text-[#FFC15E]">
              <Star className={`h-3.5 w-3.5 ${budgetStarEarned ? 'fill-[#FFC15E]' : ''}`} />
              <span>{isEs ? '★★ 2: CAMPEÓN DE COSTES' : '★★ 2: BUDGET CHAMPION'}</span>
            </span>
            {budgetStarEarned ? (
              <Check className="h-3.5 w-3.5 text-[#5FF3FF]" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-500" />
            )}
          </div>
          <p className="mt-1 text-[9px] text-slate-300">
            {isEs
              ? 'Presupuesto consumido ≤85% del tope NASA.'
              : 'Spent budget ≤85% of NASA budget cap.'}
          </p>
          <div className="mt-1 text-[8.5px] font-bold text-[#FFC15E]">
            ${spentCost.toFixed(1)}M / ${(budgetCap * 0.85).toFixed(1)}M ({(budgetRatio * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Star 3 */}
        <div
          className={`border p-2.5 rounded ${
            marginStarEarned
              ? 'border-[#5FF3FF]/50 bg-[#5FF3FF]/10 text-white'
              : 'border-slate-800 bg-[#040814]/70 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1 text-[#FFC15E]">
              <Star className={`h-3.5 w-3.5 ${marginStarEarned ? 'fill-[#FFC15E]' : ''}`} />
              <span>{isEs ? '★★★ 3: MAESTRÍA NASA' : '★★★ 3: NASA MASTERY'}</span>
            </span>
            {marginStarEarned ? (
              <Check className="h-3.5 w-3.5 text-[#5FF3FF]" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-500" />
            )}
          </div>
          <p className="mt-1 text-[9px] text-slate-300">
            {isEs
              ? 'Margen ≥35% (NASA-STD-5001B) y 3/3 crisis resueltas.'
              : '≥35% margin (NASA-STD-5001B) & all crises solved.'}
          </p>
          <div className="mt-1 text-[8.5px] font-bold text-[#5FF3FF]">
            {minMargin.toFixed(1)}% {isEs ? 'Margen Mín.' : 'Min Margin'} · {crisesSolvedCount}/{totalCrisesCount} {isEs ? 'Crisis' : 'Crises'}
          </div>
        </div>
      </div>

      {/* Dual Comparative Histograms (Poly Bridge Style) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
        {/* Histogram 1: Budget Distribution */}
        <div className="border border-slate-800 bg-[#040813] p-3 rounded">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <DollarSign className="h-3.5 w-3.5 text-[#FFC15E]" />
              <span>{isEs ? 'DISTRIBUCIÓN DE COSTE ($M)' : 'BUDGET DISTRIBUTION ($M)'}</span>
            </div>
            <span className="text-[#5FF3FF] font-bold text-[9.5px]">
              ${spentCost.toFixed(1)}M
            </span>
          </div>

          {/* Histogram Bar Chart */}
          <div className="mt-3 flex items-end justify-between h-20 gap-1.5 px-2 border-b border-slate-700 pb-1">
            {budgetBins.map((bin, i) => {
              const isPlayer = playerBudgetBin === i;
              const isBenchmark = benchmarkBudgetBin === i;

              return (
                <div key={bin.label} className="relative flex-1 flex flex-col items-center h-full justify-end">
                  {/* Player Pin */}
                  {isPlayer && (
                    <div className="absolute -top-3 flex flex-col items-center z-10 animate-bounce">
                      <span className="text-[7.5px] font-black text-[#5FF3FF] bg-[#02050B] border border-[#5FF3FF] px-1 rounded-sm whitespace-nowrap">
                        {isEs ? 'TÚ' : 'YOU'}
                      </span>
                    </div>
                  )}

                  {/* Benchmark Pin */}
                  {isBenchmark && !isPlayer && (
                    <div className="absolute -top-3 flex flex-col items-center z-10">
                      <span className="text-[7px] font-bold text-[#FFC15E] bg-[#02050B] border border-[#FFC15E] px-0.5 rounded-sm whitespace-nowrap">
                        JPL
                      </span>
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      isPlayer
                        ? 'bg-gradient-to-t from-[#5FF3FF]/50 to-[#5FF3FF] border-t-2 border-[#5FF3FF]'
                        : isBenchmark
                          ? 'bg-gradient-to-t from-[#FFC15E]/40 to-[#FFC15E] border-t-2 border-[#FFC15E]'
                          : 'bg-slate-800/80 hover:bg-slate-700/80'
                    }`}
                    style={{ height: `${bin.height}%` }}
                  />
                  <span className="mt-1 text-[7.5px] text-slate-400 font-mono">
                    {bin.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[8.5px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FF3FF]" /> {isEs ? 'Tu nave:' : 'Your craft:'} ${spentCost.toFixed(1)}M
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFC15E]" /> {benchmark.missionName}: ${benchmark.actualCost_MillionsUSD}M
            </span>
          </div>
        </div>

        {/* Histogram 2: Safety Margin Distribution */}
        <div className="border border-slate-800 bg-[#040813] p-3 rounded">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Shield className="h-3.5 w-3.5 text-[#5FF3FF]" />
              <span>{isEs ? 'MARGEN DE SEGURIDAD (%)' : 'SAFETY MARGIN (%)'}</span>
            </div>
            <span className="text-[#FFC15E] font-bold text-[9.5px]">
              {minMargin.toFixed(1)}%
            </span>
          </div>

          {/* Histogram Bar Chart */}
          <div className="mt-3 flex items-end justify-between h-20 gap-1.5 px-2 border-b border-slate-700 pb-1">
            {marginBins.map((bin, i) => {
              const isPlayer = playerMarginBin === i;
              const isStandard = i === 2; // 25-35% standard

              return (
                <div key={bin.label} className="relative flex-1 flex flex-col items-center h-full justify-end">
                  {/* Player Pin */}
                  {isPlayer && (
                    <div className="absolute -top-3 flex flex-col items-center z-10 animate-bounce">
                      <span className="text-[7.5px] font-black text-[#5FF3FF] bg-[#02050B] border border-[#5FF3FF] px-1 rounded-sm whitespace-nowrap">
                        {isEs ? 'TÚ' : 'YOU'}
                      </span>
                    </div>
                  )}

                  {/* NASA-STD-5001B standard marker */}
                  {isStandard && !isPlayer && (
                    <div className="absolute -top-3 flex flex-col items-center z-10">
                      <span className="text-[7px] font-bold text-amber-400 bg-[#02050B] border border-amber-400 px-0.5 rounded-sm whitespace-nowrap">
                        NASA
                      </span>
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      isPlayer
                        ? 'bg-gradient-to-t from-[#5FF3FF]/50 to-[#5FF3FF] border-t-2 border-[#5FF3FF]'
                        : isStandard
                          ? 'bg-gradient-to-t from-amber-500/40 to-amber-400 border-t-2 border-amber-400'
                          : 'bg-slate-800/80 hover:bg-slate-700/80'
                    }`}
                    style={{ height: `${bin.height}%` }}
                  />
                  <span className="mt-1 text-[7.5px] text-slate-400 font-mono">
                    {bin.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[8.5px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FF3FF]" /> {isEs ? 'Tu margen:' : 'Your margin:'} {minMargin.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <BarChart3 className="h-2.5 w-2.5" /> NASA-STD-5001B (≥35%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
