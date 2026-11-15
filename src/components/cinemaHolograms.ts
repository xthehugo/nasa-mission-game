import type { CinematicScenePose } from './narrativeConfig';

export type HologramId =
  | 'SOL_Y_FLUJO'
  | 'INV_R2'
  | 'RTG_CORTE'
  | 'CONTROL_TERMICO'
  | 'BIPROPELENTE'
  | 'LANZADOR_PESADO'
  | 'TRANSFERENCIA_ORBITAL';

export interface HologramCue {
  id: string;
  text: string;
  charStart: number;
  charEnd: number;
  startSec: number;
  endSec: number;
  hologramId: HologramId;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Divide un diálogo en frases sincronizadas con su holograma correspondiente.
 * Incluye los 6 cues exactos de la escena del RTG y generación inteligente para cualquier otra escena.
 */
export function buildCuesForDialogue(
  fullText: string,
  pose: CinematicScenePose,
  totalDurationSec = 25,
): HologramCue[] {
  const clean = fullText.trim();
  if (!clean) return [];

  // Detectar si es la escena clásica de RTG / Júpiter (Español o Inglés)
  const isRtgScene =
    pose === 'RTG_PALE_SUN' ||
    (/rtg/i.test(clean) && (/júpiter|jupiter/i.test(clean) || /biprop/i.test(clean)));

  // Dividir respetando frases o cláusulas clave (". ", ", ", "; ")
  let rawSegments: string[];
  if (isRtgScene && /panel/i.test(clean) && /biprop/i.test(clean)) {
    // Separación de alta precisión para las 6 frases de la crisis del RTG
    rawSegments = clean
      .split(/(?<=[.?!])\s+|(?<=RTG,)\s+|(?<=activo)\s+(?=y\s+propulsi)|(?<=bipropelente)\s+(?=sobre\s+un)|(?<=control,)\s+(?=and\s+biprop)/i)
      .map((s) => s.trim())
      .filter(Boolean);
    if (rawSegments.length < 3) {
      rawSegments = clean.split(/(?<=[.,;?!])\s+/).filter(Boolean);
    }
  } else {
    // Dividir por oraciones (y si solo hay 1 oración larga, dividir por comas para dinamismo)
    const sentences = clean.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length <= 1 && clean.length > 70) {
      rawSegments = clean.split(/(?<=[,;])\s+/).map((s) => s.trim()).filter(Boolean);
    } else {
      rawSegments = sentences;
    }
  }

  if (rawSegments.length === 0) rawSegments = [clean];

  const totalChars = Math.max(1, clean.length);
  let cursor = 0;

  return rawSegments.map((seg, idx) => {
    const foundAt = clean.indexOf(seg, cursor);
    const charStart = foundAt >= 0 ? foundAt : cursor;
    const charEnd = charStart + seg.length;
    cursor = charEnd;

    const startSec = (charStart / totalChars) * totalDurationSec;
    const endSec = idx === rawSegments.length - 1
      ? totalDurationSec
      : (charEnd / totalChars) * totalDurationSec;

    const hologramId = inferHologramId(seg, pose, idx);
    return {
      id: `cue-${idx}`,
      text: seg,
      charStart,
      charEnd,
      startSec,
      endSec,
      hologramId,
    };
  });
}

function inferHologramId(
  segment: string,
  pose: CinematicScenePose,
  idx: number,
): HologramId {
  const s = segment.toLowerCase();
  if (/1\/r|panel|solar|3\.7%|50\.3|nothing|sirven de nada/.test(s)) {
    return /poco|débil|punto|weak|dim|sol|sun/.test(s) && idx === 0
      ? 'SOL_Y_FLUJO'
      : 'INV_R2';
  }
  if (/sol|sun|5\.2|flujo|flux|luz|light/.test(s)) return 'SOL_Y_FLUJO';
  if (/rtg|nuclear|pu-238|plutoni|generador/.test(s)) return 'RTG_CORTE';
  if (/térmic|thermal|calor|frío|criogén|radiador|heat|cold/.test(s)) return 'CONTROL_TERMICO';
  if (/biprop|propulsi|combustible|oxidante|tanque|fuel|thruster|delta|Δv/.test(s)) return 'BIPROPELENTE';
  if (/lanzador|cohete|pesado|falcon|rocket|launcher|heavy|plataforma|pad/.test(s)) return 'LANZADOR_PESADO';
  if (/órbit|orbit|trayectoria|transfer|júpiter|jupiter|europa|marte|mars|luna|moon|tierra|earth/.test(s)) {
    return 'TRANSFERENCIA_ORBITAL';
  }

  if (pose === 'PAD39A_ENGINES_STEAM' || pose === 'VEGA_WINDOW_COIN') {
    return idx % 2 === 0 ? 'LANZADOR_PESADO' : 'BIPROPELENTE';
  }
  if (pose === 'RTG_PALE_SUN') {
    const seq: HologramId[] = [
      'SOL_Y_FLUJO',
      'INV_R2',
      'RTG_CORTE',
      'CONTROL_TERMICO',
      'BIPROPELENTE',
      'LANZADOR_PESADO',
    ];
    return seq[idx % seq.length];
  }
  if (pose === 'JUPITER_GRAVITY_WELL' || pose === 'JUPITER_RADIATION_BELT') {
    return idx % 2 === 0 ? 'TRANSFERENCIA_ORBITAL' : 'CONTROL_TERMICO';
  }
  return idx % 2 === 0 ? 'TRANSFERENCIA_ORBITAL' : 'SOL_Y_FLUJO';
}

/**
 * Dibuja la consola física sólida con relleno + proyector elíptico + haz de luz relleno.
 */
function drawHologramProjector(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Superficie sólida dibujada con relleno (consola de proyección, nunca líneas de perspectiva)
  const consoleGrad = ctx.createLinearGradient(cx - 170, baseY - 8, cx - 170, baseY + 56);
  consoleGrad.addColorStop(0, '#0D1B2E');
  consoleGrad.addColorStop(0.5, '#07101E');
  consoleGrad.addColorStop(1, '#02060D');
  ctx.fillStyle = consoleGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 155, baseY + 52);
  ctx.lineTo(cx - 125, baseY - 6);
  ctx.lineTo(cx + 125, baseY - 6);
  ctx.lineTo(cx + 155, baseY + 52);
  ctx.closePath();
  ctx.fill();

  // Borde superior iluminado de la consola
  ctx.strokeStyle = 'rgba(95, 243, 255, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 125, baseY - 6);
  ctx.lineTo(cx + 125, baseY - 6);
  ctx.stroke();

  // Haz de luz RELLENO con degradado vertical (cian 25% abajo a 0% arriba)
  const beamTopY = baseY - 340;
  const beamGrad = ctx.createLinearGradient(cx, baseY, cx, beamTopY);
  beamGrad.addColorStop(0, 'rgba(95, 243, 255, 0.25)');
  beamGrad.addColorStop(0.45, 'rgba(95, 243, 255, 0.08)');
  beamGrad.addColorStop(1, 'rgba(95, 243, 255, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 56, baseY + 2);
  ctx.lineTo(cx - 165, beamTopY);
  ctx.lineTo(cx + 165, beamTopY);
  ctx.lineTo(cx + 56, baseY + 2);
  ctx.closePath();
  ctx.fill();

  // Base elíptica oscura del proyector
  ctx.fillStyle = '#030812';
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 2, 68, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Anillo cian brillante del proyector
  ctx.save();
  ctx.shadowColor = '#5FF3FF';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#5FF3FF';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 2, 56, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(cx, baseY + 2, 34, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(95, 243, 255, 0.35)';
  ctx.fill();

  ctx.restore();
}

/**
 * Helper obligatorio de renderizado holográfico:
 * - Borde 1.5px dibujado dos veces (glow shadowBlur 12 + nítido)
 * - Aberración cromática leve (±1px en rojo y azul tenue)
 * - Relleno degradado translúcido cian (0.18 centro -> 0.04 bordes)
 */
function strokeAndFillHoloPath(
  ctx: CanvasRenderingContext2D,
  buildPath: () => void,
  fillAlphaFactor: number,
  cx: number,
  cy: number,
  radius: number,
  accentColor = '#5FF3FF',
) {
  // Relleno degradado translúcido cian
  if (fillAlphaFactor > 0.02) {
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
    grad.addColorStop(0, `rgba(95, 243, 255, ${(0.18 * fillAlphaFactor).toFixed(3)})`);
    grad.addColorStop(1, `rgba(95, 243, 255, ${(0.04 * fillAlphaFactor).toFixed(3)})`);
    ctx.fillStyle = grad;
    buildPath();
    ctx.fill();
  }

  // Aberración cromática leve: rojo tenue -1px, azul tenue +1px
  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.translate(-1, 0);
  ctx.strokeStyle = 'rgba(255, 80, 100, 0.22)';
  buildPath();
  ctx.stroke();
  ctx.translate(2, 0);
  ctx.strokeStyle = 'rgba(70, 140, 255, 0.22)';
  buildPath();
  ctx.stroke();
  ctx.restore();

  // Trazo principal doble: 1) con shadowBlur 12, 2) nítido encima
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 12;
  buildPath();
  ctx.stroke();
  ctx.shadowBlur = 0;
  buildPath();
  ctx.stroke();
  ctx.restore();
}

function drawHoloLabel(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  text: string,
  progress: number,
) {
  if (progress <= 0.02) return;
  ctx.save();
  ctx.globalAlpha *= progress;

  ctx.fillStyle = '#FFC15E';
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 193, 94, 0.85)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();

  ctx.font = '600 10.5px "JetBrains Mono", monospace';
  ctx.textAlign = p3.x >= p2.x ? 'left' : 'right';
  const tx = p3.x >= p2.x ? p3.x + 6 : p3.x - 6;
  ctx.fillText(text.toUpperCase(), tx, p3.y + 3.5);
  ctx.restore();
}

function drawHoloBigNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#5FF3FF';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#5FF3FF';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════
// BIBLIOTECA DE 7 HOLOGRAMAS EXPLICATIVOS (Funciones separadas reutilizables)
// ═══════════════════════════════════════════════════════════════════════

export function drawHoloSolYFlujo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  tSec: number,
  reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);
  const pulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(tSec * 2.5);

  // Capas de volumen del Sol diminuto a 5.2 UA
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.arc(cx - 85, cy - 10, 18 * pulse, 0, Math.PI * 2);
    },
    fillP,
    cx - 85,
    cy - 10,
    24,
    '#FFC15E',
  );

  // Rayos abriéndose hacia la malla
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 193, 94, 0.45)';
  ctx.lineWidth = 1.1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy - 10 + i * 3);
    ctx.lineTo(cx + 15, cy - 10 + i * 24);
    ctx.stroke();
  }
  ctx.restore();

  // Malla de cuadros casi apagada (solo 1 cuadro débil iluminado)
  const gx = cx + 18;
  const gy = cy - 62;
  const cell = 24;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const lit = r === 1 && c === 1;
      ctx.fillStyle = lit ? 'rgba(255, 193, 94, 0.35)' : 'rgba(95, 243, 255, 0.04)';
      ctx.strokeStyle = lit ? '#FFC15E' : 'rgba(95, 243, 255, 0.35)';
      ctx.lineWidth = lit ? 1.5 : 0.9;
      ctx.fillRect(gx + c * cell, gy + r * cell, cell - 3, cell - 3);
      ctx.strokeRect(gx + c * cell, gy + r * cell, cell - 3, cell - 3);
    }
  }

  const wm2 = lerp(1361, 50.3, smoothstep(0.15, 0.85, progress));
  drawHoloBigNumber(ctx, cx, cy + 78, `${wm2.toFixed(1)} W/m²`, smoothstep(0.2, 0.6, progress));

  drawHoloLabel(
    ctx,
    { x: cx - 85, y: cy - 30 },
    { x: cx - 105, y: cy - 72 },
    { x: cx - 125, y: cy - 72 },
    isEs ? 'SOL · 5.2 UA' : 'SUN · 5.2 AU',
    smoothstep(0.2, 0.55, progress),
  );
  drawHoloLabel(
    ctx,
    { x: cx + 66, y: cy - 42 },
    { x: cx + 92, y: cy - 80 },
    { x: cx + 115, y: cy - 80 },
    isEs ? 'LUZ DÉBIL (3.7%)' : 'WEAK FLUX (3.7%)',
    smoothstep(0.45, 0.85, progress),
  );
}

export function drawHoloInvR2(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  _tSec: number,
  _reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);

  // Cuadro pequeño 1 UA (totalmente iluminado)
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.rect(cx - 118, cy - 22, 34, 34);
    },
    fillP,
    cx - 101,
    cy - 5,
    30,
    '#FFC15E',
  );
  ctx.fillStyle = 'rgba(255, 193, 94, 0.42)';
  ctx.fillRect(cx - 115, cy - 19, 28, 28);

  // Cono de dispersión de luz relleno con degradado (no borde punteado)
  const coneGrad = ctx.createLinearGradient(cx - 84, cy, cx + 10, cy);
  coneGrad.addColorStop(0, 'rgba(255, 193, 94, 0.25)');
  coneGrad.addColorStop(1, 'rgba(95, 243, 255, 0.04)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 84, cy - 22);
  ctx.lineTo(cx + 12, cy - 68);
  ctx.lineTo(cx + 12, cy + 56);
  ctx.lineTo(cx - 84, cy + 12);
  ctx.closePath();
  ctx.fill();

  // Cuadro grande 5.2 UA (cuadrícula 5×5 con 1 solo cuadrito encendido)
  const bx = cx + 12;
  const by = cy - 68;
  const cell = 24;
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.rect(bx, by, cell * 5, cell * 5);
    },
    fillP * 0.6,
    bx + 60,
    by + 60,
    85,
  );
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const lit = r === 2 && c === 2;
      ctx.strokeStyle = lit ? '#FFC15E' : 'rgba(95, 243, 255, 0.28)';
      ctx.lineWidth = lit ? 1.6 : 0.7;
      ctx.strokeRect(bx + c * cell, by + r * cell, cell, cell);
      if (lit) {
        ctx.fillStyle = 'rgba(255, 193, 94, 0.55)';
        ctx.fillRect(bx + c * cell + 2, by + r * cell + 2, cell - 4, cell - 4);
      }
    }
  }

  const pct = lerp(100, 3.7, smoothstep(0.15, 0.85, progress));
  drawHoloBigNumber(
    ctx,
    cx,
    cy + 80,
    `1361 → 50.3 W/m² (${pct.toFixed(1)}%)`,
    smoothstep(0.2, 0.6, progress),
  );

  drawHoloLabel(
    ctx,
    { x: cx - 101, y: cy - 22 },
    { x: cx - 101, y: cy - 64 },
    { x: cx - 70, y: cy - 64 },
    isEs ? '1 UA · TIERRA' : '1 AU · EARTH',
    smoothstep(0.2, 0.55, progress),
  );
  drawHoloLabel(
    ctx,
    { x: bx + 60, y: by },
    { x: bx + 78, y: by - 22 },
    { x: bx + 98, y: by - 22 },
    isEs ? '5.2 UA · JÚPITER (27× ÁREA)' : '5.2 AU · JUPITER (27× AREA)',
    smoothstep(0.45, 0.85, progress),
  );
}

export function drawHoloRtgCorte(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  tSec: number,
  reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);
  const glow = reducedMotion ? 1 : 0.85 + 0.15 * Math.sin(tSec * 4.2);

  // Cilindro exterior en corte + aletas de enfriamiento (capas de profundidad)
  for (let i = -3; i <= 3; i++) {
    const fy = cy - 10 + i * 16;
    strokeAndFillHoloPath(
      ctx,
      () => {
        ctx.beginPath();
        ctx.moveTo(cx - 56, fy);
        ctx.lineTo(cx - 95, fy - 4);
        ctx.lineTo(cx - 95, fy + 4);
        ctx.lineTo(cx - 56, fy + 6);
        ctx.moveTo(cx + 56, fy);
        ctx.lineTo(cx + 95, fy - 4);
        ctx.lineTo(cx + 95, fy + 4);
        ctx.lineTo(cx + 56, fy + 6);
      },
      fillP * 0.7,
      cx,
      cy,
      100,
    );
  }

  // Carcasa cilíndrica cortada a la mitad
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.roundRect(cx - 56, cy - 68, 112, 116, 12);
    },
    fillP,
    cx,
    cy - 10,
    80,
  );

  // Núcleo central de Pu-238 naranja brillante
  ctx.save();
  const puGrad = ctx.createRadialGradient(cx, cy - 10, 2, cx, cy - 10, 28 * glow);
  puGrad.addColorStop(0, 'rgba(255, 210, 120, 0.95)');
  puGrad.addColorStop(0.5, 'rgba(255, 120, 40, 0.75)');
  puGrad.addColorStop(1, 'rgba(255, 70, 30, 0.05)');
  ctx.fillStyle = puGrad;
  ctx.beginPath();
  ctx.roundRect(cx - 18, cy - 42, 36, 64, 6);
  ctx.fill();
  ctx.strokeStyle = '#FFC15E';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();

  // Termocuplas alrededor del núcleo
  for (let row = 0; row < 4; row++) {
    const ty = cy - 34 + row * 16;
    ctx.fillStyle = 'rgba(95, 243, 255, 0.65)';
    ctx.fillRect(cx - 38, ty, 14, 8);
    ctx.fillRect(cx + 24, ty, 14, 8);
  }

  // Línea amarilla de electricidad saliendo hacia arriba
  ctx.save();
  ctx.strokeStyle = '#FACC15';
  ctx.shadowColor = '#FACC15';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx + 38, cy - 30);
  ctx.lineTo(cx + 72, cy - 52);
  ctx.lineTo(cx + 64, cy - 62);
  ctx.lineTo(cx + 96, cy - 82);
  ctx.stroke();
  ctx.restore();

  const watts = Math.round(lerp(0, 110, smoothstep(0.15, 0.85, progress)));
  drawHoloBigNumber(ctx, cx, cy + 80, `~${watts} W`, smoothstep(0.2, 0.6, progress));

  drawHoloLabel(
    ctx,
    { x: cx, y: cy - 10 },
    { x: cx - 72, y: cy - 86 },
    { x: cx - 105, y: cy - 86 },
    'Pu-238',
    smoothstep(0.2, 0.5, progress),
  );
  drawHoloLabel(
    ctx,
    { x: cx - 32, y: cy + 16 },
    { x: cx - 80, y: cy + 44 },
    { x: cx - 108, y: cy + 44 },
    isEs ? 'TERMOCUPLAS' : 'THERMOCOUPLES',
    smoothstep(0.4, 0.75, progress),
  );
  drawHoloLabel(
    ctx,
    { x: cx + 96, y: cy - 82 },
    { x: cx + 114, y: cy - 92 },
    { x: cx + 132, y: cy - 92 },
    isEs ? 'ELECTRICIDAD' : 'ELECTRICITY',
    smoothstep(0.6, 0.95, progress),
  );
}

export function drawHoloControlTermico(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  tSec: number,
  reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);
  const shift = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(tSec * 2.0);

  // Nave seccionada con gradiente térmico azul (frío -150°C) -> naranja (caliente +20°C)
  const thermGrad = ctx.createLinearGradient(cx - 80, cy - 45, cx + 80, cy + 35);
  thermGrad.addColorStop(0, `rgba(56, 189, 248, ${(0.35 * fillP).toFixed(2)})`);
  thermGrad.addColorStop(clamp(shift, 0.25, 0.75), `rgba(95, 243, 255, ${(0.18 * fillP).toFixed(2)})`);
  thermGrad.addColorStop(1, `rgba(251, 146, 60, ${(0.42 * fillP).toFixed(2)})`);

  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.roundRect(cx - 72, cy - 48, 144, 88, 10);
    },
    fillP * 0.4,
    cx,
    cy - 4,
    90,
  );
  ctx.fillStyle = thermGrad;
  ctx.fillRect(cx - 68, cy - 44, 136, 80);

  // Calentadores internos como puntos naranjas brillantes
  for (let i = 0; i < 3; i++) {
    const hx = cx - 36 + i * 36;
    ctx.save();
    ctx.fillStyle = '#FB923C';
    ctx.shadowColor = '#FB923C';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(hx, cy - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Radiadores externos como paneles laterales
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.rect(cx + 76, cy - 34, 42, 60);
      ctx.rect(cx - 118, cy - 34, 42, 60);
    },
    fillP,
    cx,
    cy,
    120,
  );

  const temp = Math.round(lerp(-150, 20, smoothstep(0.15, 0.85, progress)));
  drawHoloBigNumber(ctx, cx, cy + 78, `-150 °C → ${temp} °C`, smoothstep(0.2, 0.6, progress));

  drawHoloLabel(
    ctx,
    { x: cx, y: cy - 4 },
    { x: cx - 35, y: cy - 78 },
    { x: cx - 75, y: cy - 78 },
    isEs ? 'CALENTADORES' : 'HEATERS',
    smoothstep(0.25, 0.65, progress),
  );
  drawHoloLabel(
    ctx,
    { x: cx + 96, y: cy - 34 },
    { x: cx + 115, y: cy - 68 },
    { x: cx + 135, y: cy - 68 },
    isEs ? 'RADIADORES' : 'RADIATORS',
    smoothstep(0.5, 0.9, progress),
  );
}

export function drawHoloBipropelente(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  tSec: number,
  reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);
  const lvl = reducedMotion ? 0.65 : 0.55 + 0.12 * Math.sin(tSec * 2.2);

  // Dos tanques: Combustible (izq) y Oxidante (der)
  const drawTank = (tx: number, color: string) => {
    strokeAndFillHoloPath(
      ctx,
      () => {
        ctx.beginPath();
        ctx.roundRect(tx - 24, cy - 64, 48, 86, 14);
      },
      fillP,
      tx,
      cy - 21,
      54,
    );
    const liqH = 74 * lvl * smoothstep(0.15, 0.85, progress);
    ctx.fillStyle = color;
    ctx.fillRect(tx - 20, cy + 18 - liqH, 40, liqH);
  };

  drawTank(cx - 56, 'rgba(95, 243, 255, 0.42)');
  drawTank(cx + 56, 'rgba(255, 193, 94, 0.42)');

  // Tuberías y válvulas hacia cámara de combustión
  ctx.save();
  ctx.strokeStyle = '#5FF3FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 56, cy + 22);
  ctx.lineTo(cx - 56, cy + 38);
  ctx.lineTo(cx - 10, cy + 38);
  ctx.moveTo(cx + 56, cy + 22);
  ctx.lineTo(cx + 56, cy + 38);
  ctx.lineTo(cx + 10, cy + 38);
  ctx.stroke();
  ctx.restore();

  // Cámara de combustión y tobera con llama interna
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy + 34);
      ctx.lineTo(cx + 18, cy + 34);
      ctx.lineTo(cx + 28, cy + 72);
      ctx.lineTo(cx - 28, cy + 72);
      ctx.closePath();
    },
    fillP,
    cx,
    cy + 52,
    40,
  );

  const flameLen = (reducedMotion ? 26 : 24 + 8 * Math.sin(tSec * 14)) * smoothstep(0.4, 0.9, progress);
  if (flameLen > 2) {
    const fGrad = ctx.createLinearGradient(cx, cy + 72, cx, cy + 72 + flameLen);
    fGrad.addColorStop(0, 'rgba(255, 220, 140, 0.92)');
    fGrad.addColorStop(1, 'rgba(95, 243, 255, 0)');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 72);
    ctx.lineTo(cx + 14, cy + 72);
    ctx.lineTo(cx, cy + 72 + flameLen);
    ctx.closePath();
    ctx.fill();
  }

  drawHoloLabel(
    ctx,
    { x: cx - 56, y: cy - 64 },
    { x: cx - 80, y: cy - 88 },
    { x: cx - 108, y: cy - 88 },
    isEs ? 'COMBUSTIBLE' : 'FUEL',
    smoothstep(0.2, 0.55, progress),
  );
  drawHoloLabel(
    ctx,
    { x: cx + 56, y: cy - 64 },
    { x: cx + 80, y: cy - 88 },
    { x: cx + 108, y: cy - 88 },
    isEs ? 'OXIDANTE' : 'OXIDIZER',
    smoothstep(0.45, 0.85, progress),
  );
}

export function drawHoloLanzadorPesado(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  _tSec: number,
  _reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);

  // Cohete grande (lanzador pesado ~62 m)
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 92);
      ctx.quadraticCurveTo(cx - 4, cy - 118, cx - 4, cy - 118);
      ctx.quadraticCurveTo(cx + 10, cy - 92, cx + 10, cy - 92);
      ctx.lineTo(cx + 10, cy + 56);
      ctx.lineTo(cx - 18, cy + 56);
      ctx.closePath();
      // Boosters laterales
      ctx.rect(cx - 32, cy - 28, 12, 84);
      ctx.rect(cx + 12, cy - 28, 12, 84);
    },
    fillP,
    cx - 4,
    cy - 30,
    110,
  );

  // Nave pequeña al lado para dar escala
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.rect(cx + 62, cy + 28, 22, 26);
    },
    fillP,
    cx + 73,
    cy + 41,
    24,
    '#FFC15E',
  );

  // Regla de altura en metros
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 193, 94, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 56, cy - 118);
  ctx.lineTo(cx - 56, cy + 56);
  ctx.moveTo(cx - 62, cy - 118);
  ctx.lineTo(cx - 50, cy - 118);
  ctx.moveTo(cx - 62, cy + 56);
  ctx.lineTo(cx - 50, cy + 56);
  ctx.stroke();
  ctx.restore();

  const meters = Math.round(lerp(0, 62, smoothstep(0.15, 0.85, progress)));
  drawHoloBigNumber(ctx, cx, cy + 84, `${meters} m`, smoothstep(0.2, 0.6, progress));

  drawHoloLabel(
    ctx,
    { x: cx + 10, y: cy - 68 },
    { x: cx + 44, y: cy - 92 },
    { x: cx + 76, y: cy - 92 },
    isEs ? 'LANZADOR PESADO' : 'HEAVY LAUNCHER',
    smoothstep(0.25, 0.65, progress),
  );
  drawHoloLabel(
    ctx,
    { x: cx + 73, y: cy + 28 },
    { x: cx + 96, y: cy + 4 },
    { x: cx + 114, y: cy + 4 },
    isEs ? 'NAVE (ESCALA)' : 'PROBE (SCALE)',
    smoothstep(0.55, 0.9, progress),
  );
}

export function drawHoloTransferenciaOrbital(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  tSec: number,
  reducedMotion: boolean,
  isEs: boolean,
) {
  const fillP = smoothstep(0.35, 1, progress);

  // Planeta relleno con degradado (no wireframe)
  strokeAndFillHoloPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 36, 0, Math.PI * 2);
    },
    fillP * 1.4,
    cx,
    cy - 8,
    40,
  );

  // Estela luminosa continua con degradado (prohibido elipse punteada)
  const trailGrad = ctx.createLinearGradient(cx - 110, cy, cx + 110, cy);
  trailGrad.addColorStop(0, 'rgba(95, 243, 255, 0.05)');
  trailGrad.addColorStop(0.6, 'rgba(95, 243, 255, 0.85)');
  trailGrad.addColorStop(1, '#FFC15E');
  ctx.save();
  ctx.strokeStyle = trailGrad;
  ctx.lineWidth = 2.2;
  ctx.shadowColor = '#5FF3FF';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8, 108, 46, -0.18, 0, Math.PI * 1.65);
  ctx.stroke();
  ctx.restore();

  // Sonda avanzando sobre la trayectoria
  const ang = reducedMotion ? 0.5 : (tSec * 1.1) % (Math.PI * 2);
  const px = cx + Math.cos(ang) * 108 * Math.cos(-0.18) - Math.sin(ang) * 46 * Math.sin(-0.18);
  const py = cy - 8 + Math.cos(ang) * 108 * Math.sin(-0.18) + Math.sin(ang) * 46 * Math.cos(-0.18);
  ctx.fillStyle = '#FFC15E';
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();

  const dv = Math.round(lerp(0, 6250, smoothstep(0.15, 0.85, progress)));
  drawHoloBigNumber(ctx, cx, cy + 80, `ΔV ${dv} m/s`, smoothstep(0.2, 0.6, progress));

  drawHoloLabel(
    ctx,
    { x: cx + 52, y: cy - 42 },
    { x: cx + 82, y: cy - 76 },
    { x: cx + 108, y: cy - 76 },
    isEs ? 'ÓRBITA DE TRANSFERENCIA' : 'TRANSFER ORBIT',
    smoothstep(0.3, 0.75, progress),
  );
}

/**
 * Renderizador principal de la CAPA DE HOLOGRAMAS EXPLICATIVOS.
 * Se dibuja delante de la nave/planeta en el centro-derecha (cx=920, cy=330)
 * sin tapar la ventana del personaje ni el HUD.
 */
export function renderExplanatoryHologramLayer(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cue: HologramCue | null,
  cueElapsedSec: number,
  cueDurationSec: number,
  tSec: number,
  reducedMotion: boolean,
  isEs: boolean,
) {
  if (!cue) return;

  // Ciclo de vida: entrada 0.8s, permanencia, salida 0.6s
  const enterAlpha = reducedMotion ? smoothstep(0, 0.5, cueElapsedSec) : smoothstep(0, 0.8, cueElapsedSec);
  const exitRemaining = cueDurationSec - cueElapsedSec;
  const exitAlpha = exitRemaining < 0.6 ? smoothstep(0, 0.6, exitRemaining) : 1;
  const masterAlpha = clamp(Math.min(enterAlpha, exitAlpha), 0, 1);

  if (masterAlpha <= 0.01) return;

  // 1) Oscurecer el escenario de fondo un 30% con fundido suave al aparecer el holograma
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${(0.30 * masterAlpha).toFixed(3)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const cx = 925;
  const baseY = 532;
  const bob = reducedMotion ? 0 : Math.sin(tSec * 2.1) * 4;
  const cy = 338 + bob;
  const flicker = reducedMotion ? 1 : 0.94 + 0.06 * Math.sin(tSec * 19.3);

  // 2) Proyector físico apoyado en consola sólida con relleno + haz relleno
  drawHologramProjector(ctx, cx, baseY, masterAlpha);

  // 3) Recorte de escaneo de entrada (sube de abajo hacia arriba en 0.8s) y salida (se desintegra de abajo hacia arriba en 0.6s)
  const enterReveal = reducedMotion ? 1 : smoothstep(0, 0.8, cueElapsedSec);
  const exitDisintegrate = exitRemaining < 0.6 ? smoothstep(0, 0.6, exitRemaining) : 1;
  const boxTop = cy - 135;
  const boxBottom = cy + 110;
  const clipBottom = lerp(boxTop, boxBottom, enterReveal);
  const clipTop = lerp(boxBottom, boxTop, exitDisintegrate);

  ctx.save();
  ctx.globalAlpha = masterAlpha * flicker;

  // Ruido digital cada ~3.8s durante 80ms con desplazamiento horizontal de franjas
  const glitchCycle = tSec % 3.8;
  const isGlitch = !reducedMotion && glitchCycle < 0.08;
  if (isGlitch) {
    ctx.translate(Math.sin(tSec * 120) * 4, 0);
  }

  ctx.beginPath();
  ctx.rect(cx - 210, clipTop, 420, Math.max(0, clipBottom - clipTop));
  ctx.clip();

  const revealProgress = clamp(cueElapsedSec / 0.8, 0, 1);

  switch (cue.hologramId) {
    case 'SOL_Y_FLUJO':
      drawHoloSolYFlujo(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
    case 'INV_R2':
      drawHoloInvR2(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
    case 'RTG_CORTE':
      drawHoloRtgCorte(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
    case 'CONTROL_TERMICO':
      drawHoloControlTermico(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
    case 'BIPROPELENTE':
      drawHoloBipropelente(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
    case 'LANZADOR_PESADO':
      drawHoloLanzadorPesado(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
    case 'TRANSFERENCIA_ORBITAL':
    default:
      drawHoloTransferenciaOrbital(ctx, cx, cy, revealProgress, tSec, reducedMotion, isEs);
      break;
  }

  // Líneas de escaneo horizontales translúcidas desplazándose lento hacia arriba dentro del holograma
  const scanOffset = reducedMotion ? 0 : (tSec * 28) % 8;
  ctx.fillStyle = 'rgba(95, 243, 255, 0.05)';
  for (let sy = boxTop - scanOffset; sy < boxBottom; sy += 8) {
    ctx.fillRect(cx - 170, sy, 340, 1.5);
  }

  ctx.restore();

  // Anillo de escaneo horizontal brillante durante entrada (0..0.8s)
  if (!reducedMotion && enterReveal < 0.99) {
    ctx.save();
    ctx.strokeStyle = '#5FF3FF';
    ctx.shadowColor = '#5FF3FF';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, clipBottom, 130, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
