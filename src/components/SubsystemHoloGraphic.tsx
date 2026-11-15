import { motion } from 'framer-motion';

export type HoloSize = 'sm' | 'md' | 'lg';

interface SubsystemHoloGraphicProps {
  id: string;
  category?: string;
  size?: HoloSize;
  isSelected?: boolean;
  className?: string;
}

export function SubsystemHoloGraphic({
  id,
  size = 'md',
  isSelected = false,
  className = '',
}: SubsystemHoloGraphicProps) {
  const pixelSize = size === 'sm' ? 56 : size === 'md' ? 84 : 200;
  const strokeColor = isSelected ? '#FFC15E' : '#5FF3FF';
  const fillColor = isSelected ? 'rgba(255, 193, 94, 0.08)' : 'rgba(95, 243, 255, 0.06)';

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative select-none overflow-hidden rounded border transition-colors ${
        isSelected
          ? 'border-[#FFC15E]/60 bg-[#091322]'
          : 'border-[#5FF3FF]/30 bg-[#030914]'
      } ${className}`}
    >
      {/* Background Holographic Coordinate Grid */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id={`holo-grid-${id}-${size}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke={strokeColor} strokeWidth="0.3" strokeOpacity="0.12" />
          </pattern>
          <linearGradient id={`scan-grad-${id}-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="100" height="100" fill={`url(#holo-grid-${id}-${size})`} />

        {/* CAD Corner Brackets */}
        <path d="M 4 10 L 4 4 L 10 4" fill="none" stroke={strokeColor} strokeWidth="0.8" strokeOpacity="0.7" />
        <path d="M 90 4 L 96 4 L 96 10" fill="none" stroke={strokeColor} strokeWidth="0.8" strokeOpacity="0.7" />
        <path d="M 4 90 L 4 96 L 10 96" fill="none" stroke={strokeColor} strokeWidth="0.8" strokeOpacity="0.7" />
        <path d="M 90 96 L 96 96 L 96 90" fill="none" stroke={strokeColor} strokeWidth="0.8" strokeOpacity="0.7" />

        {/* Center Crosshairs */}
        <line x1="48" y1="50" x2="52" y2="50" stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="50" y1="48" x2="50" y2="52" stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Specific CAD Wireframe Geometry */}
        <g stroke={strokeColor} fill={fillColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {renderSubsystemShape(id, strokeColor)}
        </g>
      </svg>

      {/* Holographic Scanline Sweep */}
      <motion.div
        initial={{ top: '-100%' }}
        animate={{ top: '200%' }}
        transition={{
          repeat: Infinity,
          duration: size === 'lg' ? 3.5 : 2.5,
          ease: 'linear',
        }}
        className="pointer-events-none absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#5FF3FF]/10 to-transparent"
      />
    </div>
  );
}

function renderSubsystemShape(id: string, stroke: string) {
  switch (id) {
    // ------------------------------------
    // CHASSIS FORM FACTORS
    // ------------------------------------
    case '1.5U':
      return (
        <g>
          {/* 1.5U Cubesat Isometric Frame */}
          <polygon points="50,22 76,34 50,46 24,34" fill="none" strokeWidth="1.4" />
          <polygon points="50,56 76,68 50,80 24,68" fill="none" strokeWidth="1.4" />
          <line x1="24" y1="34" x2="24" y2="68" strokeWidth="1.4" />
          <line x1="50" y1="46" x2="50" y2="80" strokeWidth="1.4" />
          <line x1="76" y1="34" x2="76" y2="68" strokeWidth="1.4" />
          {/* Spring plunger deployer tabs */}
          <rect x="22" y="30" width="4" height="4" fill={stroke} />
          <rect x="74" y="30" width="4" height="4" fill={stroke} />
          {/* Rail guides */}
          <line x1="37" y1="40" x2="37" y2="74" strokeDasharray="2 2" strokeWidth="0.8" />
          <line x1="63" y1="40" x2="63" y2="74" strokeDasharray="2 2" strokeWidth="0.8" />
        </g>
      );
    case '2U':
      return (
        <g>
          {/* 2U Cubesat Frame */}
          <polygon points="50,16 78,29 50,42 22,29" fill="none" strokeWidth="1.4" />
          <polygon points="50,60 78,73 50,86 22,73" fill="none" strokeWidth="1.4" />
          <line x1="22" y1="29" x2="22" y2="73" strokeWidth="1.4" />
          <line x1="50" y1="42" x2="50" y2="86" strokeWidth="1.4" />
          <line x1="78" y1="29" x2="78" y2="73" strokeWidth="1.4" />
          {/* 1U Internal Midpoint Divider */}
          <polygon points="50,38 78,51 50,64 22,51" strokeDasharray="2 2" strokeWidth="0.8" />
          <circle cx="50" cy="51" r="3" fill="none" strokeWidth="0.8" />
        </g>
      );
    case '3U':
      return (
        <g>
          {/* 3U Cubesat Frame (Longer) */}
          <polygon points="50,12 78,24 50,36 22,24" fill="none" strokeWidth="1.4" />
          <polygon points="50,66 78,78 50,90 22,78" fill="none" strokeWidth="1.4" />
          <line x1="22" y1="24" x2="22" y2="78" strokeWidth="1.4" />
          <line x1="50" y1="36" x2="50" y2="90" strokeWidth="1.4" />
          <line x1="78" y1="24" x2="78" y2="78" strokeWidth="1.4" />
          {/* Intermediate unit dividers */}
          <polygon points="50,28 78,40 50,52 22,40" strokeDasharray="2 2" strokeWidth="0.8" />
          <polygon points="50,47 78,59 50,71 22,59" strokeDasharray="2 2" strokeWidth="0.8" />
        </g>
      );
    case 'CUSTOM':
      return (
        <g>
          {/* 6U/12U Deep Space Wide Envelope */}
          <polygon points="50,14 86,28 50,42 14,28" fill="none" strokeWidth="1.4" />
          <polygon points="50,60 86,74 50,88 14,74" fill="none" strokeWidth="1.4" />
          <line x1="14" y1="28" x2="14" y2="74" strokeWidth="1.4" />
          <line x1="50" y1="42" x2="50" y2="88" strokeWidth="1.4" />
          <line x1="86" y1="28" x2="86" y2="74" strokeWidth="1.4" />
          {/* Internal Bulkhead Truss */}
          <line x1="32" y1="35" x2="32" y2="81" strokeWidth="0.9" strokeDasharray="2 2" />
          <line x1="68" y1="35" x2="68" y2="81" strokeWidth="0.9" strokeDasharray="2 2" />
          <circle cx="50" cy="65" r="5" strokeWidth="0.9" />
        </g>
      );

    // ------------------------------------
    // PROPULSION
    // ------------------------------------
    case 'prop-cold-gas':
      return (
        <g>
          {/* Spherical High-Pressure Titanium Tank */}
          <circle cx="50" cy="42" r="22" strokeWidth="1.5" />
          <ellipse cx="50" cy="42" rx="22" ry="7" strokeDasharray="2 2" strokeWidth="0.8" />
          {/* Valve Neck & Solenoid */}
          <rect x="47" y="64" width="6" height="8" strokeWidth="1.2" />
          {/* Expansion Bell Nozzle */}
          <polygon points="46,72 54,72 61,84 39,84" strokeWidth="1.4" />
          {/* Micro-gas plume lines */}
          <line x1="43" y1="88" x2="40" y2="94" strokeWidth="0.8" strokeDasharray="1 2" />
          <line x1="50" y1="88" x2="50" y2="96" strokeWidth="0.8" strokeDasharray="1 2" />
          <line x1="57" y1="88" x2="60" y2="94" strokeWidth="0.8" strokeDasharray="1 2" />
        </g>
      );
    case 'prop-han-green':
      return (
        <g>
          {/* Monopropellant Cylinder Tank */}
          <rect x="36" y="22" width="28" height="38" rx="6" strokeWidth="1.5" />
          <line x1="36" y1="35" x2="64" y2="35" strokeDasharray="2 2" strokeWidth="0.8" />
          {/* Catalyst Bed Chamber */}
          <rect x="44" y="60" width="12" height="10" strokeWidth="1.2" />
          <line x1="44" y1="65" x2="56" y2="65" strokeWidth="0.8" />
          {/* Small Conical Thruster Nozzle */}
          <polygon points="45,70 55,70 60,82 40,82" strokeWidth="1.3" />
        </g>
      );
    case 'prop-biprop':
      return (
        <g>
          {/* Dual Tanks (Fuel + Oxidizer) */}
          <ellipse cx="38" cy="38" rx="13" ry="18" strokeWidth="1.4" />
          <ellipse cx="62" cy="38" rx="13" ry="18" strokeWidth="1.4" />
          {/* Manifold Junction Tube */}
          <path d="M 38,56 L 38,64 L 50,68 L 62,64 L 62,56" fill="none" strokeWidth="1.2" />
          {/* Combustion Chamber & Rocket Bell Nozzle */}
          <rect x="46" y="66" width="8" height="7" strokeWidth="1.2" />
          <polygon points="46,73 54,73 63,88 37,88" strokeWidth="1.5" />
          {/* Gimbal Ring */}
          <ellipse cx="50" cy="73" rx="7" ry="2" strokeWidth="0.9" />
        </g>
      );
    case 'prop-hall':
      return (
        <g>
          {/* Annular Hall Thruster Outer Ring */}
          <circle cx="50" cy="50" r="26" strokeWidth="1.5" />
          {/* Magnetic Pole Core */}
          <circle cx="50" cy="50" r="14" strokeWidth="1.3" />
          <circle cx="50" cy="50" r="6" fill={stroke} />
          {/* Central Hollow Cathode */}
          <rect x="47" y="20" width="6" height="8" strokeWidth="1" />
          {/* Radial Magnetic Acceleration Spokes */}
          <line x1="50" y1="24" x2="50" y2="36" strokeWidth="0.9" />
          <line x1="50" y1="64" x2="50" y2="76" strokeWidth="0.9" />
          <line x1="24" y1="50" x2="36" y2="50" strokeWidth="0.9" />
          <line x1="64" y1="50" x2="76" y2="50" strokeWidth="0.9" />
          {/* Concentric Plasma Beam Waves */}
          <circle cx="50" cy="50" r="32" strokeDasharray="3 3" strokeWidth="0.7" fill="none" />
        </g>
      );
    case 'prop-fppt-17':
      return (
        <g>
          {/* Pulsed Plasma Thruster Rectangular Housing */}
          <rect x="30" y="28" width="40" height="42" strokeWidth="1.4" />
          {/* Copper Discharge Electrodes */}
          <line x1="38" y1="28" x2="38" y2="70" strokeWidth="2" />
          <line x1="62" y1="28" x2="62" y2="70" strokeWidth="2" />
          {/* Solid Teflon Fuel Bar */}
          <rect x="43" y="36" width="14" height="24" strokeDasharray="2 1" strokeWidth="1" />
          {/* Spark Igniter Plug */}
          <polygon points="50,70 47,78 53,78" strokeWidth="1.2" />
          <circle cx="50" cy="84" r="3" strokeWidth="0.9" strokeDasharray="1 1" />
        </g>
      );
    case 'prop-thrustme-npt30':
      return (
        <g>
          {/* Iodine Gridded Ion Cube Unit */}
          <rect x="28" y="28" width="44" height="42" rx="4" strokeWidth="1.4" />
          {/* Gridded Extraction Grid Screen (Micro-holes pattern) */}
          <circle cx="50" cy="49" r="14" strokeWidth="1.2" />
          <line x1="40" y1="45" x2="60" y2="45" strokeWidth="0.8" />
          <line x1="38" y1="49" x2="62" y2="49" strokeWidth="0.8" />
          <line x1="40" y1="53" x2="60" y2="53" strokeWidth="0.8" />
          {/* Neutralizer Hollow Tube */}
          <rect x="68" y="38" width="5" height="12" strokeWidth="1" />
          {/* Ion Plume Vectors */}
          <line x1="50" y1="70" x2="50" y2="86" strokeDasharray="2 2" strokeWidth="1" />
          <line x1="43" y1="70" x2="40" y2="84" strokeDasharray="2 2" strokeWidth="0.8" />
          <line x1="57" y1="70" x2="60" y2="84" strokeDasharray="2 2" strokeWidth="0.8" />
        </g>
      );

    // ------------------------------------
    // EPS / POWER
    // ------------------------------------
    case 'eps-body-mounted':
      return (
        <g>
          {/* Cubesat Frame with Flush Solar Cells */}
          <rect x="30" y="20" width="40" height="60" strokeWidth="1.4" />
          {/* Solar cells matrix */}
          <rect x="34" y="24" width="14" height="24" strokeWidth="1" />
          <rect x="52" y="24" width="14" height="24" strokeWidth="1" />
          <rect x="34" y="52" width="14" height="24" strokeWidth="1" />
          <rect x="52" y="52" width="14" height="24" strokeWidth="1" />
          {/* Bus connector bar */}
          <line x1="48" y1="20" x2="48" y2="80" strokeDasharray="2 2" strokeWidth="0.8" />
        </g>
      );
    case 'eps-deployable':
      return (
        <g>
          {/* Central Spacecraft Bus */}
          <rect x="42" y="34" width="16" height="32" strokeWidth="1.3" />
          {/* Left Wing (3 hinged panels) */}
          <rect x="8" y="37" width="10" height="26" strokeWidth="1.1" />
          <rect x="19" y="37" width="10" height="26" strokeWidth="1.1" />
          <rect x="30" y="37" width="10" height="26" strokeWidth="1.1" />
          {/* Right Wing (3 hinged panels) */}
          <rect x="60" y="37" width="10" height="26" strokeWidth="1.1" />
          <rect x="71" y="37" width="10" height="26" strokeWidth="1.1" />
          <rect x="82" y="37" width="10" height="26" strokeWidth="1.1" />
          {/* Photovoltaic grid markings */}
          <line x1="8" y1="50" x2="40" y2="50" strokeWidth="0.7" strokeDasharray="2 1" />
          <line x1="60" y1="50" x2="92" y2="50" strokeWidth="0.7" strokeDasharray="2 1" />
        </g>
      );
    case 'eps-megaflex':
      return (
        <g>
          {/* Circular Origami UltraFlex/MegaFlex Array */}
          <circle cx="50" cy="50" r="28" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="8" strokeWidth="1.2" />
          {/* 8 Radial Origami Struts */}
          <line x1="50" y1="22" x2="50" y2="42" strokeWidth="1" />
          <line x1="50" y1="58" x2="50" y2="78" strokeWidth="1" />
          <line x1="22" y1="50" x2="42" y2="50" strokeWidth="1" />
          <line x1="58" y1="50" x2="78" y2="50" strokeWidth="1" />
          <line x1="30" y1="30" x2="44" y2="44" strokeWidth="1" />
          <line x1="70" y1="30" x2="56" y2="44" strokeWidth="1" />
          <line x1="30" y1="70" x2="44" y2="56" strokeWidth="1" />
          <line x1="70" y1="70" x2="56" y2="56" strokeWidth="1" />
        </g>
      );
    case 'eps-lilt-array':
      return (
        <g>
          {/* Deep Space High-Efficiency Concentrator Panels */}
          <rect x="22" y="24" width="56" height="52" strokeWidth="1.4" />
          {/* Concentrator Optical Slits */}
          <line x1="36" y1="24" x2="36" y2="76" strokeWidth="1" />
          <line x1="50" y1="24" x2="50" y2="76" strokeWidth="1" />
          <line x1="64" y1="24" x2="64" y2="76" strokeWidth="1" />
          {/* Solar cell strips */}
          <line x1="22" y1="40" x2="78" y2="40" strokeDasharray="2 2" strokeWidth="0.8" />
          <line x1="22" y1="60" x2="78" y2="60" strokeDasharray="2 2" strokeWidth="0.8" />
          {/* Sun sensor notch */}
          <circle cx="50" cy="18" r="3" strokeWidth="1" />
        </g>
      );
    case 'eps-rtg':
      return (
        <g>
          {/* Cylindrical Radioisotope Generator Body */}
          <rect x="36" y="24" width="28" height="52" rx="4" strokeWidth="1.5" />
          {/* Radiation Trefoil Symbol */}
          <circle cx="50" cy="50" r="5" strokeWidth="1.2" />
          <path d="M 46,42 A 8 8 0 0 1 54,42 L 50,47 Z" fill={stroke} />
          <path d="M 57,53 A 8 8 0 0 1 53,60 L 50,53 Z" fill={stroke} />
          <path d="M 43,60 A 8 8 0 0 1 43,53 L 50,53 Z" fill={stroke} />
          {/* Radiative Cooling Fins on Sides */}
          <line x1="26" y1="32" x2="36" y2="32" strokeWidth="1.2" />
          <line x1="24" y1="44" x2="36" y2="44" strokeWidth="1.2" />
          <line x1="24" y1="56" x2="36" y2="56" strokeWidth="1.2" />
          <line x1="26" y1="68" x2="36" y2="68" strokeWidth="1.2" />
          <line x1="64" y1="32" x2="74" y2="32" strokeWidth="1.2" />
          <line x1="64" y1="44" x2="76" y2="44" strokeWidth="1.2" />
          <line x1="64" y1="56" x2="76" y2="56" strokeWidth="1.2" />
          <line x1="64" y1="68" x2="74" y2="68" strokeWidth="1.2" />
        </g>
      );

    // ------------------------------------
    // TELECOM RF / OPTICAL
    // ------------------------------------
    case 'telecom-uhf':
      return (
        <g>
          {/* Cubesat Top Face Plate */}
          <polygon points="50,60 76,70 50,80 24,70" strokeWidth="1.3" />
          {/* Deployable Ribbon Whip Monopole */}
          <path d="M 50,65 C 44,45 35,30 28,16" fill="none" strokeWidth="1.6" />
          {/* Antenna Tip Bead */}
          <circle cx="28" cy="16" r="2.5" fill={stroke} />
          {/* RF Pulse Arc */}
          <path d="M 22,12 A 10 10 0 0 1 34,22" fill="none" strokeDasharray="2 2" strokeWidth="0.8" />
        </g>
      );
    case 'telecom-xka':
      return (
        <g>
          {/* Parabolic Reflector Dish */}
          <path d="M 20,44 Q 50,72 80,44" fill="none" strokeWidth="1.7" />
          <path d="M 24,44 Q 50,70 76,44" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
          {/* Cassegrain Tripod Feed Struts */}
          <line x1="26" y1="46" x2="50" y2="28" strokeWidth="1" />
          <line x1="74" y1="46" x2="50" y2="28" strokeWidth="1" />
          <line x1="50" y1="62" x2="50" y2="28" strokeWidth="1" />
          {/* Sub-reflector & Feed Horn */}
          <ellipse cx="50" cy="28" rx="6" ry="2.5" strokeWidth="1.2" fill={stroke} />
          {/* RF Waves Emitted */}
          <path d="M 38,20 Q 50,14 62,20" fill="none" strokeWidth="0.9" />
          <path d="M 32,14 Q 50,6 68,14" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      );
    case 'telecom-laser':
    case 'telecom-cubelct-laser':
      return (
        <g>
          {/* Optical Telescope Barrel Aperture */}
          <circle cx="50" cy="50" r="24" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="14" strokeWidth="1.2" />
          {/* Fast Steering Mirror (FSM) Gimbals */}
          <line x1="36" y1="50" x2="64" y2="50" strokeWidth="0.9" />
          <line x1="50" y1="36" x2="50" y2="64" strokeWidth="0.9" />
          <rect x="46" y="46" width="8" height="8" strokeWidth="1" fill={stroke} />
          {/* Laser Coherent Beam Vector */}
          <line x1="50" y1="26" x2="50" y2="10" strokeWidth="2" strokeDasharray="3 1" />
          <circle cx="50" cy="8" r="2" fill={stroke} />
        </g>
      );

    // ------------------------------------
    // THERMAL CONTROL
    // ------------------------------------
    case 'therm-passive':
      return (
        <g>
          {/* Multi-Layer Insulation (MLI) Faceted Blanket */}
          <polygon points="50,18 78,32 78,68 50,82 22,68 22,32" strokeWidth="1.5" />
          {/* Diamond Crinkled Mylar Tiles */}
          <polygon points="50,18 64,40 50,62 36,40" strokeWidth="0.9" />
          <polygon points="50,38 78,50 50,82 22,50" strokeWidth="0.9" strokeDasharray="2 2" />
          {/* Thermal Grounding Straps */}
          <line x1="18" y1="32" x2="26" y2="32" strokeWidth="1.2" />
          <line x1="74" y1="68" x2="82" y2="68" strokeWidth="1.2" />
        </g>
      );
    case 'therm-silver-fep':
      return (
        <g>
          {/* Silver FEP Radiator Mirror Surface */}
          <rect x="22" y="24" width="56" height="52" rx="3" strokeWidth="1.5" />
          {/* Second-surface tape strips */}
          <line x1="22" y1="37" x2="78" y2="37" strokeWidth="0.9" />
          <line x1="22" y1="50" x2="78" y2="50" strokeWidth="0.9" />
          <line x1="22" y1="63" x2="78" y2="63" strokeWidth="0.9" />
          {/* Reflective Sheen diagonals */}
          <line x1="30" y1="26" x2="42" y2="36" strokeWidth="0.8" />
          <line x1="52" y1="26" x2="68" y2="40" strokeWidth="0.8" />
        </g>
      );
    case 'therm-active':
      return (
        <g>
          {/* Motorized Thermal Louvers (Blades open/close) */}
          <rect x="24" y="24" width="52" height="52" strokeWidth="1.5" />
          {/* Louver Blades at 45 degree angle */}
          <line x1="28" y1="34" x2="72" y2="34" strokeWidth="1.8" />
          <line x1="28" y1="45" x2="72" y2="45" strokeWidth="1.8" />
          <line x1="28" y1="56" x2="72" y2="56" strokeWidth="1.8" />
          <line x1="28" y1="67" x2="72" y2="67" strokeWidth="1.8" />
          {/* Bimetallic Actuator Spring */}
          <circle cx="50" cy="50" r="4" strokeWidth="0.9" strokeDasharray="1 1" />
        </g>
      );
    case 'therm-cryo':
      return (
        <g>
          {/* Miniature Pulse Tube / Stirling Cryocooler */}
          <rect x="26" y="38" width="22" height="24" rx="3" strokeWidth="1.4" />
          <line x1="37" y1="38" x2="37" y2="62" strokeWidth="0.8" />
          {/* Cold Finger Extrusion */}
          <rect x="48" y="46" width="26" height="8" strokeWidth="1.3" />
          {/* Cold Head Detector Interface */}
          <rect x="74" y="43" width="6" height="14" strokeWidth="1.3" fill={stroke} />
          {/* Cryogenic Cold Waves */}
          <circle cx="82" cy="50" r="4" strokeWidth="0.8" strokeDasharray="1 2" fill="none" />
        </g>
      );
    case 'therm-redwire-pcm':
      return (
        <g>
          {/* Phase Change Material (PCM) Thermal Heat Sink */}
          <rect x="26" y="26" width="48" height="48" rx="4" strokeWidth="1.5" />
          {/* Hexagonal PCM Honeycomb Chambers */}
          <polygon points="50,34 56,38 56,44 50,48 44,44 44,38" strokeWidth="1" />
          <polygon points="50,52 56,56 56,62 50,66 44,62 44,56" strokeWidth="1" />
          <polygon points="36,43 42,47 42,53 36,57 30,53 30,47" strokeWidth="1" />
          <polygon points="64,43 70,47 70,53 64,57 58,53 58,47" strokeWidth="1" />
        </g>
      );

    // ------------------------------------
    // ADCS (ATTITUDE CONTROL)
    // ------------------------------------
    case 'adcs-gravity':
      return (
        <g>
          {/* Satellite body with deployable boom */}
          <rect x="42" y="62" width="16" height="20" strokeWidth="1.3" />
          {/* Extendable Scissor Boom Truss */}
          <line x1="50" y1="62" x2="50" y2="24" strokeWidth="1.5" />
          <line x1="46" y1="56" x2="54" y2="48" strokeWidth="0.8" />
          <line x1="54" y1="56" x2="46" y2="48" strokeWidth="0.8" />
          <line x1="46" y1="44" x2="54" y2="36" strokeWidth="0.8" />
          <line x1="54" y1="44" x2="46" y2="36" strokeWidth="0.8" />
          {/* Tip Mass Sphere */}
          <circle cx="50" cy="20" r="6" strokeWidth="1.5" fill={stroke} />
        </g>
      );
    case 'adcs-3axis':
      return (
        <g>
          {/* Orthogonal 3-Axis Reaction Wheels */}
          {/* Z-Wheel (Top horizontal ellipse) */}
          <ellipse cx="50" cy="34" rx="20" ry="8" strokeWidth="1.4" />
          <ellipse cx="50" cy="34" rx="10" ry="4" strokeWidth="0.9" />
          {/* X & Y Wheels (Vertical tilted ellipses) */}
          <ellipse cx="38" cy="62" rx="8" ry="18" strokeWidth="1.4" transform="rotate(-18 38 62)" />
          <ellipse cx="62" cy="62" rx="8" ry="18" strokeWidth="1.4" transform="rotate(18 62 62)" />
          {/* Central Avionics Hub */}
          <circle cx="50" cy="52" r="5" fill={stroke} />
          {/* Angular Momentum Rotation Arrow */}
          <path d="M 68,30 A 22 10 0 0 1 72,36" fill="none" strokeWidth="1.2" />
        </g>
      );
    case 'adcs-rcs':
      return (
        <g>
          {/* Cold Gas RCS Manifold Block */}
          <rect x="36" y="36" width="28" height="28" strokeWidth="1.4" />
          {/* 4 Orthogonal Cant Nozzles */}
          <polygon points="36,44 26,40 26,48" strokeWidth="1.2" />
          <polygon points="64,44 74,40 74,48" strokeWidth="1.2" />
          <polygon points="44,36 40,26 48,26" strokeWidth="1.2" />
          <polygon points="44,64 40,74 48,74" strokeWidth="1.2" />
          {/* Thrust Jet Vectors */}
          <line x1="22" y1="44" x2="16" y2="44" strokeDasharray="1 2" strokeWidth="1" />
          <line x1="78" y1="44" x2="84" y2="44" strokeDasharray="1 2" strokeWidth="1" />
        </g>
      );
    case 'adcs-sagitta-star':
      return (
        <g>
          {/* High-Precision Star Tracker Optics */}
          <polygon points="36,70 64,70 58,40 42,40" strokeWidth="1.4" />
          {/* Stray Light Baffle Rings */}
          <ellipse cx="50" cy="40" rx="8" ry="3" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="10" ry="3.5" strokeWidth="1" />
          <ellipse cx="50" cy="60" rx="12" ry="4" strokeWidth="1" />
          {/* Optical Detector Chip */}
          <rect x="44" y="70" width="12" height="6" strokeWidth="1.2" fill={stroke} />
          {/* Star Reticle Target in Sight */}
          <circle cx="50" cy="22" r="6" strokeWidth="0.9" strokeDasharray="2 2" fill="none" />
          <line x1="50" y1="12" x2="50" y2="32" strokeWidth="0.7" />
          <line x1="40" y1="22" x2="60" y2="22" strokeWidth="0.7" />
        </g>
      );

    // ------------------------------------
    // PAYLOAD
    // ------------------------------------
    case 'pay-multispectral':
      return (
        <g>
          {/* Multispectral Imager Camera Telescope */}
          <rect x="36" y="24" width="28" height="48" rx="3" strokeWidth="1.5" />
          {/* Objective Lens Aperture */}
          <ellipse cx="50" cy="24" rx="14" ry="5" strokeWidth="1.3" />
          {/* Multi-Band Spectral Filter Wheel */}
          <circle cx="50" cy="48" r="8" strokeWidth="1" />
          <line x1="50" y1="40" x2="50" y2="56" strokeWidth="0.8" />
          <line x1="42" y1="48" x2="58" y2="48" strokeWidth="0.8" />
          {/* CMOS Sensor Plane */}
          <rect x="42" y="66" width="16" height="4" strokeWidth="1" fill={stroke} />
        </g>
      );
    case 'pay-magnetometer':
      return (
        <g>
          {/* Deployable Carbon Boom Arm */}
          <line x1="20" y1="80" x2="80" y2="20" strokeWidth="2" />
          {/* Primary Fluxgate Sensor Ring */}
          <circle cx="75" cy="25" r="9" strokeWidth="1.4" />
          <circle cx="75" cy="25" r="4" strokeWidth="0.9" fill={stroke} />
          {/* Secondary Inboard Gradient Sensor */}
          <circle cx="52" cy="48" r="6" strokeWidth="1.2" />
          {/* Magnetic Field Sensing Lines */}
          <path d="M 66,16 Q 75,6 84,16" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      );
    case 'pay-ir-spectrometer':
      return (
        <g>
          {/* IR Spectrometer Cryo Bench */}
          <rect x="24" y="28" width="52" height="44" rx="3" strokeWidth="1.5" />
          {/* Optical Slit & Collimator */}
          <line x1="32" y1="40" x2="42" y2="50" strokeWidth="1.2" />
          {/* Diffraction Grating Prism */}
          <polygon points="46,44 54,44 50,56" strokeWidth="1.3" fill={stroke} />
          {/* Separated Spectral Rays */}
          <line x1="52" y1="52" x2="66" y2="44" strokeWidth="0.9" />
          <line x1="52" y1="54" x2="66" y2="52" strokeWidth="0.9" />
          <line x1="52" y1="56" x2="66" y2="60" strokeWidth="0.9" />
          {/* Linear Detector Array */}
          <rect x="66" y="42" width="4" height="20" strokeWidth="1" />
        </g>
      );
    case 'pay-sar-radar':
      return (
        <g>
          {/* Synthetic Aperture Radar (SAR) Flat Array */}
          <rect x="18" y="26" width="64" height="48" rx="2" strokeWidth="1.5" />
          {/* Phased Array Microstrip Patches Grid */}
          <rect x="26" y="34" width="8" height="8" strokeWidth="0.9" />
          <rect x="38" y="34" width="8" height="8" strokeWidth="0.9" />
          <rect x="54" y="34" width="8" height="8" strokeWidth="0.9" />
          <rect x="66" y="34" width="8" height="8" strokeWidth="0.9" />
          <rect x="26" y="46" width="8" height="8" strokeWidth="0.9" />
          <rect x="38" y="46" width="8" height="8" strokeWidth="0.9" />
          <rect x="54" y="46" width="8" height="8" strokeWidth="0.9" />
          <rect x="66" y="46" width="8" height="8" strokeWidth="0.9" />
          <rect x="26" y="58" width="8" height="8" strokeWidth="0.9" />
          <rect x="38" y="58" width="8" height="8" strokeWidth="0.9" />
          <rect x="54" y="58" width="8" height="8" strokeWidth="0.9" />
          <rect x="66" y="58" width="8" height="8" strokeWidth="0.9" />
        </g>
      );

    // ------------------------------------
    // LAUNCH VEHICLE
    // ------------------------------------
    case 'lv-rideshare':
    case 'lv-vadr-rideshare':
      return (
        <g>
          {/* ESPA Secondary Payload Adapter Ring */}
          <ellipse cx="50" cy="50" r="28" strokeWidth="1.5" />
          <ellipse cx="50" cy="50" r="18" strokeWidth="1" strokeDasharray="3 2" />
          {/* 4 Cubesat Deployer Ports */}
          <rect x="44" y="14" width="12" height="12" strokeWidth="1.2" />
          <rect x="44" y="74" width="12" height="12" strokeWidth="1.2" />
          <rect x="14" y="44" width="12" height="12" strokeWidth="1.2" />
          <rect x="74" y="44" width="12" height="12" strokeWidth="1.2" />
        </g>
      );
    case 'lv-electron':
      return (
        <g>
          {/* Slender Rocket Body */}
          <rect x="43" y="28" width="14" height="52" strokeWidth="1.4" />
          {/* Aerodynamic Fairing Nose Cone */}
          <path d="M 43,28 Q 50,12 57,28 Z" strokeWidth="1.4" />
          {/* Stage Separation Line */}
          <line x1="43" y1="46" x2="57" y2="46" strokeWidth="1" />
          {/* Rutherford Engine Cluster Bell */}
          <polygon points="45,80 55,80 58,88 42,88" strokeWidth="1.3" />
        </g>
      );
    case 'lv-falcon9':
      return (
        <g>
          {/* Heavy Booster Body */}
          <rect x="40" y="32" width="20" height="48" strokeWidth="1.5" />
          {/* 5.2m Bulbous Fairing Nose Clamshell */}
          <path d="M 37,32 C 37,16 63,16 63,32 Z" strokeWidth="1.5" />
          <line x1="50" y1="16" x2="50" y2="32" strokeWidth="0.8" strokeDasharray="2 2" />
          {/* Interstage Ring & Grid Fins */}
          <line x1="36" y1="42" x2="40" y2="42" strokeWidth="2" />
          <line x1="60" y1="42" x2="64" y2="42" strokeWidth="2" />
          {/* Merlin Engine Cluster */}
          <polygon points="42,80 47,80 48,88 41,88" strokeWidth="1.2" />
          <polygon points="48,80 52,80 53,89 47,89" strokeWidth="1.3" />
          <polygon points="53,80 58,80 59,88 52,88" strokeWidth="1.2" />
        </g>
      );

    default:
      return (
        <g>
          {/* Generic High-Tech Module Blueprint */}
          <rect x="30" y="30" width="40" height="40" rx="4" strokeWidth="1.4" />
          <circle cx="50" cy="50" r="10" strokeWidth="1.2" />
          <line x1="30" y1="50" x2="70" y2="50" strokeWidth="0.8" />
          <line x1="50" y1="30" x2="50" y2="70" strokeWidth="0.8" />
        </g>
      );
  }
}
