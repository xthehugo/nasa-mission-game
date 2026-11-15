import React from 'react';

export type CadBadgeVariant = 'cyan' | 'amber' | 'rose' | 'emerald' | 'slate';

interface CadIconBadgeProps {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  variant?: CadBadgeVariant;
  pulse?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const VARIANT_STYLES: Record<
  CadBadgeVariant,
  {
    border: string;
    bg: string;
    text: string;
    glow: string;
    dot: string;
  }
> = {
  cyan: {
    border: 'border-[#5FF3FF]/40',
    bg: 'bg-[#5FF3FF]/10',
    text: 'text-[#5FF3FF]',
    glow: 'shadow-[0_0_12px_rgba(95,243,255,0.2)]',
    dot: 'bg-[#5FF3FF]',
  },
  amber: {
    border: 'border-[#FFC15E]/40',
    bg: 'bg-[#FFC15E]/10',
    text: 'text-[#FFC15E]',
    glow: 'shadow-[0_0_12px_rgba(255,193,94,0.2)]',
    dot: 'bg-[#FFC15E]',
  },
  rose: {
    border: 'border-[#FF4D6D]/40',
    bg: 'bg-[#FF4D6D]/10',
    text: 'text-[#FF4D6D]',
    glow: 'shadow-[0_0_12px_rgba(255,77,109,0.2)]',
    dot: 'bg-[#FF4D6D]',
  },
  emerald: {
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.2)]',
    dot: 'bg-emerald-400',
  },
  slate: {
    border: 'border-slate-700/60',
    bg: 'bg-slate-800/40',
    text: 'text-slate-300',
    glow: 'shadow-none',
    dot: 'bg-slate-500',
  },
};

/**
 * 21st.dev inspired aerospace HUD status badge with micro-icons and glowing telemetry accents
 */
export function CadIconBadge({
  icon,
  label,
  sublabel,
  variant = 'cyan',
  pulse = false,
  size = 'sm',
  className = '',
}: CadIconBadgeProps) {
  const v = VARIANT_STYLES[variant];
  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[8px]'
      : size === 'md'
        ? 'px-3 py-1.5 text-[11px]'
        : 'px-2 py-0.5 text-[9px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono tracking-[0.14em] uppercase transition backdrop-blur-sm ${v.border} ${v.bg} ${v.text} ${v.glow} ${sizeClasses} ${className}`}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${v.dot}`}
          />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${v.dot}`} />
        </span>
      ) : icon ? (
        <span className="shrink-0 flex items-center justify-center">{icon}</span>
      ) : null}
      <span className="font-semibold">{label}</span>
      {sublabel && <span className="opacity-70 text-[85%]">// {sublabel}</span>}
    </span>
  );
}
