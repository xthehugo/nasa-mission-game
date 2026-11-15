/**
 * Glowing Cyan Neon Robot Icon matching the ASTRA reference artwork
 */
export function RobotSvgIcon({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={{
        filter:
          'drop-shadow(0 0 10px rgba(95, 243, 255, 0.85)) drop-shadow(0 0 22px rgba(95, 243, 255, 0.35))',
      }}
      aria-hidden="true"
    >
      {/* Antenna stem & glowing tip */}
      <line
        x1="32"
        y1="8"
        x2="32"
        y2="16"
        stroke="#5FF3FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="6.5" r="3" fill="#040B14" stroke="#5FF3FF" strokeWidth="2.6" />

      {/* Left & Right Ear Pads */}
      <rect
        x="6"
        y="24"
        width="6"
        height="13"
        rx="2.5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3"
      />
      <rect
        x="52"
        y="24"
        width="6"
        height="13"
        rx="2.5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3"
      />

      {/* Rounded Robot Head */}
      <rect
        x="13"
        y="16"
        width="38"
        height="28"
        rx="9"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3.2"
      />

      {/* Glowing Solid Cyan Eyes */}
      <circle cx="24.5" cy="28.5" r="4.5" fill="#5FF3FF" />
      <circle cx="39.5" cy="28.5" r="4.5" fill="#5FF3FF" />

      {/* Friendly Curved Smile */}
      <path
        d="M25.5 36.5 Q32 41.5 38.5 36.5"
        stroke="#5FF3FF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Neck & Collar Base */}
      <rect
        x="26"
        y="44"
        width="12"
        height="5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="2.8"
      />
      <rect
        x="19"
        y="49"
        width="26"
        height="7"
        rx="1.5"
        fill="#040B14"
        stroke="#5FF3FF"
        strokeWidth="3"
      />
    </svg>
  );
}

/**
 * Obsolete floating companion: ASTRA is now fully unified into CommanderHudBanner
 * to avoid any floating hitbox collisions over sliders, buttons, and telemetry.
 */
export function AstraFloatingCompanion() {
  return null;
}
