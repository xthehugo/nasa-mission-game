import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useMissionStore } from '../store';
import {
  buildCuesForDialogue,
  renderExplanatoryHologramLayer,
  type HologramCue,
} from './cinemaHolograms';
import {
  getVoicePlaybackSnapshot,
  playCinemaSfx,
  playHoloTone,
  speakCharacterLine,
  stopCharacterVoice,
} from './holoAudio';
import {
  formatStoryText,
  STORY_CINEMATICS,
  type CinematicScenePose,
} from './narrativeConfig';

/* ==========================================================================
   FUNCIONES MATEMÁTICAS Y DE SUAVIZADO (SMOOTHSTEP)
   ========================================================================== */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/* ==========================================================================
   CAMPO DE 400 ESTRELLAS CON PARPADEO Y PARALAJE
   ========================================================================== */
interface StarPoint {
  x: number;
  y: number;
  size: number;
  depth: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  tint: string;
}

const STARS_400: StarPoint[] = Array.from({ length: 400 }, (_, i) => {
  const s1 = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
  const s2 = Math.abs(Math.cos(i * 45.164 + 19.13) * 29483.123) % 1;
  const s3 = Math.abs(Math.sin(i * 93.71 + 4.19) * 19472.81) % 1;
  const depth = 0.2 + s3 * 0.8;
  return {
    x: s1 * 1280,
    y: s2 * 720,
    size: depth > 0.82 ? 1.8 : depth > 0.5 ? 1.2 : 0.75,
    depth,
    baseAlpha: 0.28 + s1 * 0.65,
    twinkleSpeed: 1.3 + s2 * 2.8,
    phase: i * 0.77,
    tint: i % 11 === 0 ? '#B8E8FF' : i % 15 === 0 ? '#FFE2B8' : '#FFFFFF',
  };
});

/* ==========================================================================
   CACHÉ DE PLANETAS Y LUNAS EN CANVAS OCULTOS (SE DIBUJAN UNA SOLA VEZ)
   ========================================================================== */
interface PlanetBuffers {
  earth: HTMLCanvasElement;
  moon: HTMLCanvasElement;
  mars: HTMLCanvasElement;
  jupiter: HTMLCanvasElement;
}

let cachedPlanets: PlanetBuffers | null = null;

function applyPlanetSphericalShading(
  pCtx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  haloColor: string,
) {
  // Sombreado con gradiente radial desplazado hacia el Sol (izquierda-arriba)
  const shade = pCtx.createRadialGradient(
    cx - radius * 0.48,
    cy - radius * 0.22,
    radius * 0.1,
    cx + radius * 0.22,
    cy + radius * 0.12,
    radius * 1.28,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(0.55, 'rgba(0, 0, 0, 0.30)');
  shade.addColorStop(0.85, 'rgba(0, 0, 0, 0.80)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.97)');

  pCtx.fillStyle = shade;
  pCtx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Halo atmosférico: arco fino semitransparente en el borde iluminado
  pCtx.save();
  pCtx.strokeStyle = haloColor;
  pCtx.lineWidth = 4.5;
  pCtx.beginPath();
  pCtx.arc(cx, cy, radius - 1.5, Math.PI * 0.62, Math.PI * 1.42);
  pCtx.stroke();
  pCtx.restore();
}

function getPlanetBuffers(): PlanetBuffers {
  if (cachedPlanets) return cachedPlanets;

  // 1. TIERRA (océanos azul profundo, continentes verdes y marrones, nubes blancas translúcidas, luces en el lado oscuro)
  const earth = document.createElement('canvas');
  earth.width = 560;
  earth.height = 560;
  const eCtx = earth.getContext('2d')!;
  const eCx = 280;
  const eCy = 280;
  const eR = 240;

  // Halo exterior azul
  const eHalo = eCtx.createRadialGradient(eCx - 16, eCy - 10, eR * 0.92, eCx, eCy, eR + 24);
  eHalo.addColorStop(0, 'rgba(70, 175, 255, 0)');
  eHalo.addColorStop(0.75, 'rgba(80, 185, 255, 0.28)');
  eHalo.addColorStop(1, 'rgba(10, 40, 90, 0)');
  eCtx.fillStyle = eHalo;
  eCtx.beginPath();
  eCtx.arc(eCx, eCy, eR + 24, 0, Math.PI * 2);
  eCtx.fill();

  eCtx.save();
  eCtx.beginPath();
  eCtx.arc(eCx, eCy, eR, 0, Math.PI * 2);
  eCtx.clip();

  const oceanGrad = eCtx.createLinearGradient(eCx - eR, eCy - eR, eCx + eR, eCy + eR);
  oceanGrad.addColorStop(0, '#0E3C78');
  oceanGrad.addColorStop(0.5, '#07244F');
  oceanGrad.addColorStop(1, '#030E24');
  eCtx.fillStyle = oceanGrad;
  eCtx.fillRect(0, 0, 560, 560);

  // Continentes con tonos verdes y marrones
  const continents = [
    { x: eCx - 95, y: eCy - 75, rx: 75, ry: 48, rot: -0.3, color: '#2B5B3C' },
    { x: eCx - 65, y: eCy - 60, rx: 45, ry: 28, rot: 0.2, color: '#6E5A3B' },
    { x: eCx - 40, y: eCy + 45, rx: 58, ry: 82, rot: 0.25, color: '#254F34' },
    { x: eCx + 65, y: eCy - 45, rx: 88, ry: 54, rot: -0.15, color: '#335E3E' },
    { x: eCx + 85, y: eCy - 20, rx: 52, ry: 36, rot: 0.1, color: '#7A6240' },
  ];
  continents.forEach((c) => {
    eCtx.fillStyle = c.color;
    eCtx.beginPath();
    eCtx.ellipse(c.x, c.y, c.rx, c.ry, c.rot, 0, Math.PI * 2);
    eCtx.fill();
  });

  // Nubes blancas translúcidas con turbulencia
  for (let i = 0; i < 34; i++) {
    const cx = eCx - eR + ((i * 67) % (eR * 2));
    const cy = eCy - eR + ((i * 43) % (eR * 2));
    eCtx.fillStyle = 'rgba(240, 248, 255, 0.22)';
    eCtx.beginPath();
    eCtx.ellipse(cx, cy, 28 + (i % 5) * 12, 6 + (i % 3) * 4, (i % 4) * 0.15 - 0.2, 0, Math.PI * 2);
    eCtx.fill();
  }

  applyPlanetSphericalShading(eCtx, eCx, eCy, eR, 'rgba(95, 200, 255, 0.55)');

  // Luces de ciudad en el lado oscuro (derecha)
  const cityClusters = [
    [eCx + 75, eCy - 42],
    [eCx + 92, eCy - 35],
    [eCx + 115, eCy - 18],
    [eCx + 64, eCy + 28],
    [eCx + 82, eCy + 40],
    [eCx + 135, eCy + 12],
    [eCx + 108, eCy - 64],
  ];
  cityClusters.forEach(([lx, ly]) => {
    for (let k = 0; k < 7; k++) {
      const ox = lx + ((k * 13) % 22) - 11;
      const oy = ly + ((k * 7) % 16) - 8;
      eCtx.fillStyle = k % 2 === 0 ? 'rgba(255, 205, 115, 0.68)' : 'rgba(255, 165, 80, 0.45)';
      eCtx.fillRect(ox, oy, 1.8, 1.8);
    }
  });
  eCtx.restore();

  // 2. LUNA (gris con cráteres oscuros con borde claro y mares oscuros)
  const moon = document.createElement('canvas');
  moon.width = 240;
  moon.height = 240;
  const mCtx = moon.getContext('2d')!;
  const mCx = 120;
  const mCy = 120;
  const mR = 96;

  mCtx.save();
  mCtx.beginPath();
  mCtx.arc(mCx, mCy, mR, 0, Math.PI * 2);
  mCtx.clip();

  const moonGrad = mCtx.createRadialGradient(mCx - 28, mCy - 24, 12, mCx, mCy, mR);
  moonGrad.addColorStop(0, '#C5CCD6');
  moonGrad.addColorStop(0.65, '#8892A0');
  moonGrad.addColorStop(1, '#4A525E');
  mCtx.fillStyle = moonGrad;
  mCtx.fillRect(0, 0, 240, 240);

  // Mares basálticos oscuros
  [
    [mCx - 24, mCy - 18, 34, 24],
    [mCx + 14, mCy - 8, 28, 22],
    [mCx - 10, mCy + 22, 26, 18],
  ].forEach(([x, y, rx, ry]) => {
    mCtx.fillStyle = 'rgba(48, 54, 66, 0.42)';
    mCtx.beginPath();
    mCtx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
    mCtx.fill();
  });

  // Cráteres (elipses oscuras con borde claro)
  for (let i = 0; i < 16; i++) {
    const cx = mCx - 65 + ((i * 37) % 130);
    const cy = mCy - 60 + ((i * 29) % 120);
    const cr = 4 + (i % 4) * 3.5;
    mCtx.fillStyle = 'rgba(40, 45, 55, 0.55)';
    mCtx.strokeStyle = 'rgba(225, 232, 242, 0.45)';
    mCtx.lineWidth = 1;
    mCtx.beginPath();
    mCtx.ellipse(cx, cy, cr, cr * 0.82, 0.1, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.stroke();
  }

  applyPlanetSphericalShading(mCtx, mCx, mCy, mR, 'rgba(210, 220, 235, 0.25)');
  mCtx.restore();

  // 3. MARTE (ocre rojizo, casquetes polares blancos, manchas oscuras, halo ocre)
  const mars = document.createElement('canvas');
  mars.width = 420;
  mars.height = 420;
  const maCtx = mars.getContext('2d')!;
  const maCx = 210;
  const maCy = 210;
  const maR = 175;

  maCtx.save();
  maCtx.beginPath();
  maCtx.arc(maCx, maCy, maR, 0, Math.PI * 2);
  maCtx.clip();

  const marsGrad = maCtx.createRadialGradient(maCx - 45, maCy - 35, 18, maCx, maCy, maR);
  marsGrad.addColorStop(0, '#E07B52');
  marsGrad.addColorStop(0.55, '#B84B29');
  marsGrad.addColorStop(1, '#5E2210');
  maCtx.fillStyle = marsGrad;
  maCtx.fillRect(0, 0, 420, 420);

  // Manchas oscuras de albedo
  [
    [maCx - 35, maCy + 12, 54, 24],
    [maCx + 38, maCy - 14, 42, 20],
    [maCx + 5, maCy + 48, 48, 18],
  ].forEach(([x, y, rx, ry]) => {
    maCtx.fillStyle = 'rgba(72, 26, 14, 0.45)';
    maCtx.beginPath();
    maCtx.ellipse(x, y, rx, ry, -0.15, 0, Math.PI * 2);
    maCtx.fill();
  });

  // Casquetes polares blancos
  maCtx.fillStyle = 'rgba(245, 248, 255, 0.78)';
  maCtx.beginPath();
  maCtx.ellipse(maCx, maCy - maR + 10, 62, 16, 0, 0, Math.PI * 2);
  maCtx.fill();

  applyPlanetSphericalShading(maCtx, maCx, maCy, maR, 'rgba(245, 165, 110, 0.42)');
  maCtx.restore();

  // 4. JÚPITER (franjas horizontales onduladas de 4 px con paleta beige, crema, marrón y óxido; Gran Mancha Roja con anillo)
  const jupiter = document.createElement('canvas');
  jupiter.width = 680;
  jupiter.height = 680;
  const jCtx = jupiter.getContext('2d')!;
  const jCx = 340;
  const jCy = 340;
  const jR = 290;

  // Halo exterior beige-azulado
  const jHalo = jCtx.createRadialGradient(jCx - 20, jCy - 10, jR * 0.92, jCx, jCy, jR + 22);
  jHalo.addColorStop(0, 'rgba(155, 195, 235, 0)');
  jHalo.addColorStop(0.75, 'rgba(145, 185, 225, 0.22)');
  jHalo.addColorStop(1, 'rgba(20, 40, 70, 0)');
  jCtx.fillStyle = jHalo;
  jCtx.beginPath();
  jCtx.arc(jCx, jCy, jR + 22, 0, Math.PI * 2);
  jCtx.fill();

  jCtx.save();
  jCtx.beginPath();
  jCtx.arc(jCx, jCy, jR, 0, Math.PI * 2);
  jCtx.clip();

  const palette = [
    '#6E5643',
    '#C9AE8C',
    '#9C6B49',
    '#E2CDB0',
    '#A86442',
    '#D8C09E',
    '#8C4E32',
    '#EADAC2',
    '#C28A61',
    '#9E4B31',
    '#DFC7A7',
    '#8A6248',
  ];

  // Franjas horizontales onduladas de 4 px
  for (let py = jCy - jR; py <= jCy + jR; py += 4) {
    const normY = (py - (jCy - jR)) / (jR * 2);
    const bandIdx = Math.floor(normY * palette.length * 2.2) % palette.length;
    jCtx.fillStyle = palette[bandIdx];
    jCtx.beginPath();
    jCtx.moveTo(jCx - jR - 10, py);
    for (let px = jCx - jR - 10; px <= jCx + jR + 10; px += 14) {
      const wave =
        Math.sin(px * 0.025 + py * 0.04) * 2.8 +
        Math.cos(px * 0.06 - py * 0.02) * 1.4;
      jCtx.lineTo(px, py + wave);
    }
    jCtx.lineTo(jCx + jR + 10, py + 6);
    jCtx.lineTo(jCx - jR - 10, py + 6);
    jCtx.closePath();
    jCtx.fill();
  }

  // Turbulencias con elipses translúcidas
  for (let i = 0; i < 32; i++) {
    const tx = jCx - 220 + ((i * 71) % 440);
    const ty = jCy - 210 + ((i * 47) % 420);
    jCtx.fillStyle = i % 2 === 0 ? 'rgba(244, 232, 212, 0.22)' : 'rgba(140, 72, 42, 0.24)';
    jCtx.beginPath();
    jCtx.ellipse(tx, ty, 12 + (i % 5) * 6, 4 + (i % 3) * 2.5, 0.05, 0, Math.PI * 2);
    jCtx.fill();
  }

  // Gran Mancha Roja con anillo
  const grsX = jCx - 75;
  const grsY = jCy + 64;
  const grsGrad = jCtx.createRadialGradient(grsX, grsY, 6, grsX, grsY, 50);
  grsGrad.addColorStop(0, '#DF573B');
  grsGrad.addColorStop(0.55, '#B23A22');
  grsGrad.addColorStop(0.8, '#7A2C1C');
  grsGrad.addColorStop(0.93, '#E5CFAF');
  grsGrad.addColorStop(1, 'rgba(229, 207, 175, 0)');
  jCtx.fillStyle = grsGrad;
  jCtx.beginPath();
  jCtx.ellipse(grsX, grsY, 48, 28, 0.05, 0, Math.PI * 2);
  jCtx.fill();

  applyPlanetSphericalShading(jCtx, jCx, jCy, jR, 'rgba(165, 205, 235, 0.42)');
  jCtx.restore();

  cachedPlanets = { earth, moon, mars, jupiter };
  return cachedPlanets;
}

/* ==========================================================================
   RECETAS DE DIBUJO REALISTAS (SOL, NAVE, COHETE, RTG, DIAGRAMAS, VIDEOLLAMADA)
   ========================================================================== */

function drawSunRealistic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  glowRadius: number,
  flareWidth: number,
) {
  const glow = ctx.createRadialGradient(x, y, 1.5, x, y, glowRadius);
  glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  glow.addColorStop(0.22, 'rgba(255, 235, 185, 0.65)');
  glow.addColorStop(0.55, 'rgba(95, 215, 255, 0.22)');
  glow.addColorStop(1, 'rgba(95, 215, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Destello horizontal tenue
  const flare = ctx.createLinearGradient(x - flareWidth, y, x + flareWidth, y);
  flare.addColorStop(0, 'rgba(255, 255, 255, 0)');
  flare.addColorStop(0.5, 'rgba(220, 245, 255, 0.6)');
  flare.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = flare;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - flareWidth, y);
  ctx.lineTo(x + flareWidth, y);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, 2.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpacecraftRealistic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rotRad: number,
  options: {
    hasSolarPanels: boolean;
    hasRtg: boolean;
    rtgPulseTime: number;
    thrusterFiring?: boolean;
  },
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(rotRad);

  // Paneles solares con degradado azul oscuro y cuadrícula fina (si la misión los usa)
  if (options.hasSolarPanels) {
    [-1, 1].forEach((dir) => {
      const wingY = dir * 36;
      const wingH = 78;
      const topY = dir < 0 ? wingY - wingH : wingY;

      // Brazo de soporte
      ctx.strokeStyle = '#8FA6C4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, dir * 28);
      ctx.lineTo(0, wingY);
      ctx.stroke();

      const panelGrad = ctx.createLinearGradient(-22, topY, 22, topY + wingH);
      panelGrad.addColorStop(0, '#133366');
      panelGrad.addColorStop(0.5, '#0B1F42');
      panelGrad.addColorStop(1, '#061229');
      ctx.fillStyle = panelGrad;
      ctx.strokeStyle = '#7098C8';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-20, topY, 40, wingH);
      ctx.strokeRect(-20, topY, 40, wingH);

      // Cuadrícula fina de celdas fotovoltaicas
      ctx.strokeStyle = 'rgba(95, 210, 255, 0.22)';
      ctx.lineWidth = 0.7;
      for (let py = topY + 13; py < topY + wingH; py += 13) {
        ctx.beginPath();
        ctx.moveTo(-20, py);
        ctx.lineTo(20, py);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(0, topY + wingH);
      ctx.stroke();
    });
  }

  // Brazo superior con instrumento óptico
  ctx.strokeStyle = '#7E93AD';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-8, -28);
  ctx.lineTo(-15, -68);
  ctx.stroke();

  const instGrad = ctx.createLinearGradient(-25, -80, -5, -64);
  instGrad.addColorStop(0, '#D4E4F7');
  instGrad.addColorStop(1, '#3A4B63');
  ctx.fillStyle = instGrad;
  ctx.fillRect(-24, -80, 18, 12);

  // Tobera pequeña inferior
  const nozGrad = ctx.createLinearGradient(-16, 28, 16, 56);
  nozGrad.addColorStop(0, '#6A7B92');
  nozGrad.addColorStop(0.5, '#253042');
  nozGrad.addColorStop(1, '#0D131D');
  ctx.fillStyle = nozGrad;
  ctx.beginPath();
  ctx.moveTo(-9, 28);
  ctx.lineTo(9, 28);
  ctx.lineTo(17, 54);
  ctx.lineTo(-17, 54);
  ctx.closePath();
  ctx.fill();

  // Llama de propulsión orbital si está encendida
  if (options.thrusterFiring) {
    const plume = ctx.createRadialGradient(0, 56, 2, 0, 74, 28);
    plume.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    plume.addColorStop(0.35, 'rgba(95, 225, 255, 0.65)');
    plume.addColorStop(1, 'rgba(95, 225, 255, 0)');
    ctx.fillStyle = plume;
    ctx.beginPath();
    ctx.ellipse(0, 68, 11, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soporte y Antena Parabólica grande a la izquierda con degradado plateado
  ctx.strokeStyle = '#8FA6C4';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-42, -9);
  ctx.lineTo(-74, -3);
  ctx.moveTo(-42, 9);
  ctx.lineTo(-74, 3);
  ctx.stroke();

  const dishGrad = ctx.createLinearGradient(-102, -62, -64, 62);
  dishGrad.addColorStop(0, '#F0F6FF');
  dishGrad.addColorStop(0.4, '#9FB4CC');
  dishGrad.addColorStop(0.78, '#42536B');
  dishGrad.addColorStop(1, '#1B2536');
  ctx.fillStyle = dishGrad;
  ctx.beginPath();
  ctx.ellipse(-82, 0, 19, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feedhorn de la antena
  ctx.strokeStyle = '#B8CDE6';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-88, -24);
  ctx.lineTo(-114, 0);
  ctx.lineTo(-88, 24);
  ctx.stroke();

  // RTG en brazo derecho: cilindro gris con aletas verticales cada 7 px y brillo naranja pulsante (radio 150)
  if (options.hasRtg) {
    ctx.strokeStyle = '#7A8FA8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(42, -5);
    ctx.lineTo(132, -2);
    ctx.moveTo(42, 5);
    ctx.lineTo(132, 2);
    ctx.stroke();

    const rtgX = 160;
    const rtgY = 0;
    const pulse = 0.72 + 0.28 * Math.sin(options.rtgPulseTime * 3);

    const rtgGlow = ctx.createRadialGradient(rtgX, rtgY, 4, rtgX, rtgY, 150);
    rtgGlow.addColorStop(0, `rgba(255, 150, 60, ${0.75 * pulse})`);
    rtgGlow.addColorStop(0.42, `rgba(255, 85, 35, ${0.32 * pulse})`);
    rtgGlow.addColorStop(1, 'rgba(255, 50, 15, 0)');
    ctx.fillStyle = rtgGlow;
    ctx.beginPath();
    ctx.arc(rtgX, rtgY, 150, 0, Math.PI * 2);
    ctx.fill();

    // Aletas verticales cada 7 px
    for (let fx = rtgX - 21; fx <= rtgX + 21; fx += 7) {
      ctx.strokeStyle = '#E09A5C';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(fx, -18);
      ctx.lineTo(fx, 18);
      ctx.stroke();
    }

    const rtgBody = ctx.createLinearGradient(rtgX - 28, -11, rtgX + 28, 11);
    rtgBody.addColorStop(0, '#B5C5D8');
    rtgBody.addColorStop(0.5, '#59697D');
    rtgBody.addColorStop(1, '#253040');
    ctx.fillStyle = rtgBody;
    ctx.fillRect(rtgX - 28, -11, 56, 22);

    ctx.fillStyle = `rgba(255, 130, 45, ${0.7 * pulse})`;
    ctx.fillRect(rtgX - 20, -3.5, 40, 7);
  }

  // Cuerpo central con degradado dorado tipo manta térmica y arrugas finas
  const busGrad = ctx.createLinearGradient(-42, -30, 42, 30);
  busGrad.addColorStop(0, '#FFE08A');
  busGrad.addColorStop(0.3, '#E0A33A');
  busGrad.addColorStop(0.7, '#9C6514');
  busGrad.addColorStop(1, '#3E2405');
  ctx.fillStyle = busGrad;
  ctx.fillRect(-42, -30, 84, 60);

  ctx.strokeStyle = 'rgba(255, 240, 190, 0.35)';
  ctx.lineWidth = 0.9;
  [
    [-34, -22, -10, -14],
    [-10, -14, 26, -24],
    [-36, 4, 4, -4],
    [4, -4, 34, 8],
    [-30, 20, 12, 14],
    [12, 14, 36, 22],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.restore();

  return {
    rtgPoint: {
      x: x + Math.cos(rotRad) * (160 * scale),
      y: y + Math.sin(rotRad) * (160 * scale),
    },
    thermalPoint: { x, y },
    nozzlePoint: {
      x: x - Math.sin(rotRad) * (46 * scale),
      y: y + Math.cos(rotRad) * (46 * scale),
    },
  };
}

function drawRocketRealistic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  tSec: number,
  ignited: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Brillo cálido sobre la plataforma
  if (ignited) {
    const padGlow = ctx.createRadialGradient(0, 165, 10, 0, 165, 220);
    padGlow.addColorStop(0, 'rgba(255, 175, 85, 0.55)');
    padGlow.addColorStop(0.5, 'rgba(255, 95, 30, 0.22)');
    padGlow.addColorStop(1, 'rgba(255, 60, 10, 0)');
    ctx.fillStyle = padGlow;
    ctx.beginPath();
    ctx.arc(0, 165, 220, 0, Math.PI * 2);
    ctx.fill();
  }

  // Torre de lanzamiento umbilical a la izquierda con volumen
  const towerGrad = ctx.createLinearGradient(-115, -180, -82, 160);
  towerGrad.addColorStop(0, '#53647A');
  towerGrad.addColorStop(1, '#1C2636');
  ctx.fillStyle = towerGrad;
  ctx.fillRect(-110, -175, 24, 335);
  ctx.fillRect(-86, -95, 56, 10);
  ctx.fillRect(-86, -15, 56, 10);

  // Cuerpo cilíndrico blanco del cohete (claro al centro, oscuro en los bordes)
  const bodyGrad = ctx.createLinearGradient(-30, 0, 30, 0);
  bodyGrad.addColorStop(0, '#5E6E82');
  bodyGrad.addColorStop(0.22, '#D8E3F0');
  bodyGrad.addColorStop(0.5, '#FFFFFF');
  bodyGrad.addColorStop(0.78, '#B8C7DA');
  bodyGrad.addColorStop(1, '#3D4B5E');

  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-30, -110, 60, 235);

  // Cofia superior aerodinámica con volumen
  ctx.beginPath();
  ctx.moveTo(-30, -110);
  ctx.quadraticCurveTo(-30, -175, 0, -198);
  ctx.quadraticCurveTo(30, -175, 30, -110);
  ctx.closePath();
  ctx.fill();

  // Líneas de separación de etapas e interetapa oscura
  ctx.fillStyle = '#1E2836';
  ctx.fillRect(-30, -38, 60, 14);
  ctx.fillRect(-30, 98, 60, 10);

  // Toberas oscuras
  [-18, 0, 18].forEach((nx) => {
    ctx.fillStyle = '#18202C';
    ctx.beginPath();
    ctx.moveTo(nx - 6, 125);
    ctx.lineTo(nx + 6, 125);
    ctx.lineTo(nx + 10, 144);
    ctx.lineTo(nx - 10, 144);
    ctx.closePath();
    ctx.fill();
  });

  // Llama de motor con degradado radial naranja-blanco que parpadea
  if (ignited) {
    const flicker = 0.88 + 0.18 * Math.sin(tSec * 28);
    const flameGrad = ctx.createRadialGradient(0, 152, 4, 0, 185, 75 * flicker);
    flameGrad.addColorStop(0, '#FFFFFF');
    flameGrad.addColorStop(0.28, '#FFE58F');
    flameGrad.addColorStop(0.62, 'rgba(255, 115, 35, 0.85)');
    flameGrad.addColorStop(1, 'rgba(255, 50, 10, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(0, 178, 28 * flicker, 68 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Penacho de humo y vapor criogénico con círculos translúcidos que crecen y se desvanecen
  for (let i = 0; i < 18; i++) {
    const cycle = (tSec * 0.65 + i * 0.17) % 1;
    const spreadX = ((i % 2 === 0 ? 1 : -1) * (18 + (i * 19) % 95)) * cycle;
    const puffY = 148 + cycle * 42 - Math.pow(cycle, 1.5) * 28;
    const puffR = 14 + cycle * 48;
    const alpha = (1 - cycle) * (ignited ? 0.36 : 0.22);
    ctx.fillStyle = ignited
      ? `rgba(235, 220, 205, ${alpha})`
      : `rgba(205, 225, 245, ${alpha})`;
    ctx.beginPath();
    ctx.arc(spreadX, puffY, puffR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCalloutRealistic(
  ctx: CanvasRenderingContext2D,
  targetPt: { x: number; y: number },
  elbowPt: { x: number; y: number },
  endPt: { x: number; y: number },
  label: string,
  alpha: number,
) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = '#FFC15E';
  ctx.beginPath();
  ctx.arc(targetPt.x, targetPt.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFC15E';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(targetPt.x, targetPt.y);
  ctx.lineTo(elbowPt.x, elbowPt.y);
  ctx.lineTo(endPt.x, endPt.y);
  ctx.stroke();

  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  const tw = ctx.measureText(label).width;
  const alignRight = endPt.x < elbowPt.x;
  const bx = alignRight ? endPt.x - tw - 16 : endPt.x;
  const by = endPt.y - 24;

  ctx.fillStyle = 'rgba(4, 10, 20, 0.9)';
  ctx.fillRect(bx, by, tw + 16, 22);
  ctx.fillStyle = '#FFC15E';
  ctx.textAlign = 'left';
  ctx.fillText(label, bx + 8, by + 15);

  ctx.restore();
}

function drawSpeakerVideocallPip(
  ctx: CanvasRenderingContext2D,
  _W: number,
  H: number,
  tSec: number,
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM',
  isSpeaking: boolean,
  reducedMotion: boolean,
) {
  // Ventana de videollamada abajo a la izquierda (250×200)
  const pipW = 250;
  const pipH = 200;
  const pipX = 28;
  const pipY = H - 52 - pipH - 14;

  const borderColor =
    speaker === 'ROSTOVA' ? '#FF5C6C' : speaker === 'VEGA' ? '#5FF3FF' : '#FFC15E';
  const roomTag =
    speaker === 'ROSTOVA'
      ? 'EN VIVO · JPL PASADENA'
      : speaker === 'VEGA'
        ? 'EN VIVO · HANGAR 4 / MCC'
        : 'EN VIVO · DSN GOLDSTONE';
  const nameTag =
    speaker === 'ROSTOVA'
      ? 'DRA. E. ROSTOVA · JPL'
      : speaker === 'VEGA'
        ? 'CMTE. FRANK VEGA · NASA'
        : 'TELEMETRÍA PROFUNDA DSN';

  ctx.save();

  // Fondo azul oscuro con degradado
  const bgGrad = ctx.createLinearGradient(pipX, pipY, pipX, pipY + pipH);
  bgGrad.addColorStop(0, '#07152B');
  bgGrad.addColorStop(0.6, '#040C1A');
  bgGrad.addColorStop(1, '#02060D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(pipX, pipY, pipW, pipH);

  ctx.beginPath();
  ctx.rect(pipX + 1, pipY + 1, pipW - 2, pipH - 2);
  ctx.clip();

  // Resplandor suave detrás de la silueta
  const rimBack = ctx.createRadialGradient(
    pipX + pipW * 0.5,
    pipY + pipH * 0.46,
    8,
    pipX + pipW * 0.5,
    pipY + pipH * 0.46,
    110,
  );
  rimBack.addColorStop(0, 'rgba(255, 170, 130, 0.22)');
  rimBack.addColorStop(0.55, 'rgba(30, 65, 110, 0.16)');
  rimBack.addColorStop(1, 'rgba(2, 6, 13, 0)');
  ctx.fillStyle = rimBack;
  ctx.fillRect(pipX, pipY, pipW, pipH);

  // Silueta de busto (cabeza circular y hombros curvos) casi negra con luz cálida de borde en el contorno superior
  const cx = pipX + pipW * 0.5;
  const cy = pipY + pipH * 0.54;

  ctx.fillStyle = '#04070E';
  ctx.strokeStyle = 'rgba(255, 170, 130, 0.55)';
  ctx.lineWidth = 1.8;

  // Hombros curvos según el personaje
  ctx.beginPath();
  if (speaker === 'ROSTOVA') {
    // Chaqueta ejecutiva de directora de vuelo
    ctx.moveTo(cx - 68, pipY + pipH);
    ctx.quadraticCurveTo(cx - 58, cy + 20, cx - 18, cy + 14);
    ctx.lineTo(cx - 12, cy + 3);
    ctx.lineTo(cx + 12, cy + 3);
    ctx.lineTo(cx + 18, cy + 14);
    ctx.quadraticCurveTo(cx + 58, cy + 20, cx + 68, pipY + pipH);
  } else {
    // Hombros anchos con cuello de traje de vuelo
    ctx.moveTo(cx - 78, pipY + pipH);
    ctx.quadraticCurveTo(cx - 66, cy + 16, cx - 22, cy + 12);
    ctx.lineTo(cx - 15, cy + 2);
    ctx.lineTo(cx + 15, cy + 2);
    ctx.lineTo(cx + 22, cy + 12);
    ctx.quadraticCurveTo(cx + 66, cy + 16, cx + 78, pipY + pipH);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cabeza y silueta superior sin rasgos faciales
  ctx.beginPath();
  if (speaker === 'ROSTOVA') {
    // Recogido ejecutivo sutil
    ctx.arc(cx, cy - 39, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy - 22, 22, 27, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(cx, cy - 23, 24, 28, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();

  // Líneas de escaneo muy sutiles
  ctx.strokeStyle = 'rgba(95, 243, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let sy = pipY; sy < pipY + pipH; sy += 4) {
    ctx.beginPath();
    ctx.moveTo(pipX, sy);
    ctx.lineTo(pipX + pipW, sy);
    ctx.stroke();
  }

  // Barra superior "EN VIVO · [SALA]" con punto rojo parpadeante
  ctx.fillStyle = 'rgba(2, 6, 11, 0.84)';
  ctx.fillRect(pipX, pipY, pipW, 24);

  const blink = reducedMotion ? true : Math.sin(tSec * 6.0) > -0.2;
  if (blink) {
    ctx.fillStyle = '#FF5C6C';
    ctx.beginPath();
    ctx.arc(pipX + 13, pipY + 12, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = '700 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = borderColor;
  ctx.textAlign = 'left';
  ctx.fillText(roomTag, pipX + 23, pipY + 15.5);

  // Barra inferior con nombre y 10 barritas ámbar de onda de audio
  ctx.fillStyle = 'rgba(2, 6, 11, 0.9)';
  ctx.fillRect(pipX, pipY + pipH - 26, pipW, 26);

  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#E6F1FF';
  ctx.fillText(nameTag, pipX + 10, pipY + pipH - 9);

  // 10 barritas ámbar que se mueven mientras habla
  const barsStartX = pipX + pipW - 60;
  const barsBaseY = pipY + pipH - 7;
  for (let b = 0; b < 10; b++) {
    let bh = 3;
    if (isSpeaking && !reducedMotion) {
      bh = 3 + Math.abs(Math.sin(tSec * 11 + b * 0.85) * Math.cos(tSec * 7.2 - b * 0.5)) * 12;
    } else if (isSpeaking && reducedMotion) {
      bh = 6 + (b % 3) * 2;
    }
    ctx.fillStyle = isSpeaking ? '#FFC15E' : 'rgba(143, 166, 196, 0.32)';
    ctx.fillRect(barsStartX + b * 5.2, barsBaseY - bh, 3.2, bh);
  }

  ctx.restore();

  // Borde fino del color del personaje
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pipX, pipY, pipW, pipH);
}

/* ==========================================================================
   COMPONENTE DE ESCENARIO CINEMATOGRÁFICO REALISTA EN CANVAS 2D (1280×720)
   ========================================================================== */
function RealisticCinemaCanvas({
  pose,
  speaker,
  locationText,
  scienceText,
  isSpeaking,
  reducedMotion,
  isEs,
  cues,
  voiceCharIndexRef,
  forceLastCueRef,
  onActiveCueChange,
}: {
  pose: CinematicScenePose;
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
  locationText: string;
  scienceText: string;
  isSpeaking: boolean;
  reducedMotion: boolean;
  isEs: boolean;
  cues: HologramCue[];
  voiceCharIndexRef: MutableRefObject<number>;
  forceLastCueRef: MutableRefObject<boolean>;
  onActiveCueChange: (cueId: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const grainPatternRef = useRef<CanvasPattern | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LOGICAL_W = 1280;
    const LOGICAL_H = 720;

    if (!grainCanvasRef.current) {
      const gc = document.createElement('canvas');
      gc.width = 128;
      gc.height = 128;
      grainCanvasRef.current = gc;
    }

    const updateGrain = () => {
      const gc = grainCanvasRef.current!;
      const gCtx = gc.getContext('2d')!;
      const img = gCtx.createImageData(128, 128);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      gCtx.putImageData(img, 0, 0);
      grainPatternRef.current = ctx.createPattern(gc, 'repeat');
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const availW = Math.max(320, rect.width);
      const availH = Math.max(200, rect.height);
      const aspect = 16 / 9;
      let cssW = availW;
      let cssH = availW / aspect;
      if (cssH > availH) {
        cssH = availH;
        cssW = availH * aspect;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = `${Math.floor(cssW)}px`;
      canvas.style.height = `${Math.floor(cssH)}px`;
      canvas.width = Math.floor(LOGICAL_W * dpr);
      canvas.height = Math.floor(LOGICAL_H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const planets = getPlanetBuffers();
    let rafId = 0;
    let lastTime = performance.now();
    let elapsedSec = 0;
    let frameCount = 0;
    let lastReportedCueId: string | null = null;
    let currentCueStartElapsed = 0;

    const isJupiterScene =
      pose === 'OMEGA_SIREN_EUROPA' ||
      pose === 'ROSTOVA_TRANSFER_CREDENTIAL' ||
      pose === 'JPL_PASADENA_CONTROL' ||
      pose === 'VEGA_TRENCH_COMMS' ||
      pose === 'JUPITER_GRAVITY_WELL' ||
      pose === 'RTG_PALE_SUN' ||
      pose === 'NASA_BOARD_DEFENSE' ||
      pose === 'JUPITER_RADIATION_BELT' ||
      pose === 'ICARUS_BEACON_RESPONSE' ||
      pose === 'VEGA_TEARS_VICTORY' ||
      pose === 'ROSTOVA_STANDING_OVATION';

    const isRocketScene =
      pose === 'HANGAR_PHOTO' ||
      pose === 'VEGA_WINDOW_COIN' ||
      pose === 'VEGA_IGNITE_CONSOLE' ||
      pose === 'TANKS_RUNNER_HEART' ||
      pose === 'PAD39A_ENGINES_STEAM' ||
      pose === 'COPV_CLEANROOM_LOCK';

    const renderFrame = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      elapsedSec += dt;
      frameCount++;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Fondo con degradado vertical muy oscuro (#01030a a #050a16)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
      skyGrad.addColorStop(0, '#01030A');
      skyGrad.addColorStop(1, '#050A16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Empuje de cámara lento (zoom de 5% en 25s) y temblor mínimo
      const zoom = reducedMotion ? 1 : 1 + 0.05 * clamp(elapsedSec / 25, 0, 1);
      const sx = reducedMotion ? 0 : Math.sin(elapsedSec * 2.1) * 0.85;
      const sy = reducedMotion ? 0 : Math.cos(elapsedSec * 1.7) * 0.65;

      ctx.save();
      ctx.translate(LOGICAL_W * 0.5 + sx, LOGICAL_H * 0.5 + sy);
      ctx.scale(zoom, zoom);
      ctx.translate(-LOGICAL_W * 0.5, -LOGICAL_H * 0.5);

      // 2. 400 estrellas con parpadeo con seno y deriva lenta con paralaje
      STARS_400.forEach((s) => {
        const dx = (s.x - elapsedSec * 3.0 * s.depth + LOGICAL_W * 2) % LOGICAL_W;
        const tw = reducedMotion
          ? 1
          : 0.68 + 0.32 * Math.sin(elapsedSec * s.twinkleSpeed + s.phase);
        ctx.globalAlpha = s.baseAlpha * tw;
        ctx.fillStyle = s.tint;
        ctx.fillRect(dx, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      if (isRocketScene) {
        // Escenario de Cabo Cañaveral / Plataforma 39A de noche con horizonte iluminado y cohete realista
        const horizonGrad = ctx.createLinearGradient(0, LOGICAL_H * 0.45, 0, LOGICAL_H);
        horizonGrad.addColorStop(0, 'rgba(8, 22, 46, 0)');
        horizonGrad.addColorStop(0.7, 'rgba(18, 42, 78, 0.45)');
        horizonGrad.addColorStop(1, '#060E1A');
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, LOGICAL_H * 0.45, LOGICAL_W, LOGICAL_H * 0.55);

        // Luna llena realista al fondo arriba a la derecha
        ctx.drawImage(planets.moon, LOGICAL_W * 0.78, LOGICAL_H * 0.12, 130, 130);

        // Superficie sólida de la plataforma costera
        ctx.fillStyle = '#070D17';
        ctx.fillRect(0, LOGICAL_H * 0.74, LOGICAL_W, LOGICAL_H * 0.26);

        const ignited = pose === 'PAD39A_ENGINES_STEAM' || pose === 'VEGA_IGNITE_CONSOLE';
        drawRocketRealistic(ctx, LOGICAL_W * 0.55, LOGICAL_H * 0.52, 1.15, elapsedSec, ignited);

        // Llamadas de datos con línea ámbar quebrada
        drawCalloutRealistic(
          ctx,
          { x: LOGICAL_W * 0.55 + 32, y: LOGICAL_H * 0.34 },
          { x: LOGICAL_W * 0.55 + 95, y: LOGICAL_H * 0.28 },
          { x: LOGICAL_W * 0.55 + 160, y: LOGICAL_H * 0.28 },
          isEs ? 'COFIA PAYLOAD · 50 MM MARGEN' : 'PAYLOAD FAIRING · 50 MM CLEARANCE',
          smoothstep(1.2, 2.2, elapsedSec),
        );
        drawCalloutRealistic(
          ctx,
          { x: LOGICAL_W * 0.55 + 34, y: LOGICAL_H * 0.56 },
          { x: LOGICAL_W * 0.55 + 95, y: LOGICAL_H * 0.52 },
          { x: LOGICAL_W * 0.55 + 160, y: LOGICAL_H * 0.52 },
          isEs ? 'PROPELENTE BIPROP · TSIOLKOVSKY' : 'BIPROP TANKS · TSIOLKOVSKY',
          smoothstep(3.2, 4.2, elapsedSec),
        );
      } else if (isJupiterScene) {
        // Escenario realista de Júpiter y el Sol pálido a 5.2 UA
        drawSunRealistic(ctx, LOGICAL_W * 0.12, LOGICAL_H * 0.27, 36, 68);

        const rtgZoom = pose === 'RTG_PALE_SUN' ? smoothstep(10.5, 14.5, elapsedSec) : 0;
        const jx = lerp(LOGICAL_W * 0.60, LOGICAL_W * 0.72, rtgZoom);
        const jy = lerp(LOGICAL_H * 0.18, LOGICAL_H * 0.26, rtgZoom);
        const jSize = lerp(620, 520, rtgZoom);
        ctx.drawImage(planets.jupiter, jx, jy, jSize, jSize);

        // Luna Europa / Ío orbitando frente a Júpiter
        const moonX = jx + jSize * 0.18 + elapsedSec * 3.2;
        const moonY = jy + jSize * 0.32 - elapsedSec * 0.65;
        ctx.drawImage(planets.moon, moonX - 22, moonY - 22, 44, 44);

        const bob = reducedMotion ? 0 : Math.sin(elapsedSec * 1.15) * 6;
        const rot = reducedMotion ? -0.04 : -0.04 + Math.sin(elapsedSec * 0.7) * 0.025;
        const shipX = lerp(LOGICAL_W * 0.44, LOGICAL_W * 0.36, rtgZoom);
        const shipY = lerp(LOGICAL_H * 0.49, LOGICAL_H * 0.47, rtgZoom) + bob;
        const shipScale = lerp(1.08, 1.48, rtgZoom);

        const anchors = drawSpacecraftRealistic(ctx, shipX, shipY, shipScale, rot, {
          hasSolarPanels: false,
          hasRtg: true,
          rtgPulseTime: elapsedSec,
          thrusterFiring: pose === 'JUPITER_GRAVITY_WELL' || pose === 'JUPITER_RADIATION_BELT',
        });

        // Llamadas de datos que aparecen una cada 2 s
        const calloutStart = pose === 'RTG_PALE_SUN' ? 11.8 : 1.5;
        drawCalloutRealistic(
          ctx,
          anchors.rtgPoint,
          { x: anchors.rtgPoint.x + 36, y: anchors.rtgPoint.y - 68 },
          { x: anchors.rtgPoint.x + 92, y: anchors.rtgPoint.y - 68 },
          isEs ? 'GENERADOR NUCLEAR RTG · Pu-238' : 'NUCLEAR RTG GENERATOR · Pu-238',
          smoothstep(calloutStart, calloutStart + 0.9, elapsedSec),
        );
        drawCalloutRealistic(
          ctx,
          anchors.thermalPoint,
          { x: anchors.thermalPoint.x - 36, y: anchors.thermalPoint.y - 84 },
          { x: anchors.thermalPoint.x - 90, y: anchors.thermalPoint.y - 84 },
          isEs ? 'CONTROL TÉRMICO ACTIVO' : 'ACTIVE THERMAL CONTROL',
          smoothstep(calloutStart + 2.0, calloutStart + 2.9, elapsedSec),
        );
        drawCalloutRealistic(
          ctx,
          anchors.nozzlePoint,
          { x: anchors.nozzlePoint.x + 36, y: anchors.nozzlePoint.y + 56 },
          { x: anchors.nozzlePoint.x + 90, y: anchors.nozzlePoint.y + 56 },
          isEs ? 'PROPULSIÓN BIPROPELENTE' : 'BIPROPELLANT PROPULSION',
          smoothstep(calloutStart + 4.0, calloutStart + 4.9, elapsedSec),
        );
      } else if (pose === 'SANDBOX_INFINITE_FORGE') {
        // Desenlace / Modo Forja Infinita: Tierra, Luna, Marte y Júpiter renderizados con volumen
        drawSunRealistic(ctx, LOGICAL_W * 0.09, LOGICAL_H * 0.25, 62, 110);
        ctx.drawImage(planets.earth, LOGICAL_W * 0.18, LOGICAL_H * 0.36, 260, 260);
        ctx.drawImage(planets.moon, LOGICAL_W * 0.38, LOGICAL_H * 0.24, 90, 90);
        ctx.drawImage(planets.mars, LOGICAL_W * 0.52, LOGICAL_H * 0.42, 195, 195);
        ctx.drawImage(planets.jupiter, LOGICAL_W * 0.71, LOGICAL_H * 0.20, 390, 390);

        const bob = reducedMotion ? 0 : Math.sin(elapsedSec * 1.2) * 5;
        drawSpacecraftRealistic(ctx, LOGICAL_W * 0.46, LOGICAL_H * 0.46 + bob, 1.05, -0.05, {
          hasSolarPanels: true,
          hasRtg: true,
          rtgPulseTime: elapsedSec,
          thrusterFiring: true,
        });
      } else {
        // Escenario realista de órbita terrestre (LEO / Eclipse / MCR)
        drawSunRealistic(
          ctx,
          LOGICAL_W * 0.14,
          LOGICAL_H * 0.24,
          pose === 'ECLIPSE_SHADOW_FREEZE' ? 28 : 68,
          95,
        );
        ctx.drawImage(planets.earth, LOGICAL_W * 0.56, LOGICAL_H * 0.16, 540, 540);
        ctx.drawImage(planets.moon, LOGICAL_W * 0.24, LOGICAL_H * 0.16, 110, 110);

        const bob = reducedMotion ? 0 : Math.sin(elapsedSec * 1.15) * 6;
        const rot = reducedMotion ? -0.03 : -0.03 + Math.sin(elapsedSec * 0.65) * 0.025;
        const anchors = drawSpacecraftRealistic(
          ctx,
          LOGICAL_W * 0.44,
          LOGICAL_H * 0.48 + bob,
          1.12,
          rot,
          {
            hasSolarPanels: true,
            hasRtg: false,
            rtgPulseTime: elapsedSec,
            thrusterFiring: pose === 'CUBESAT_ORBIT_DANCE',
          },
        );

        drawCalloutRealistic(
          ctx,
          anchors.thermalPoint,
          { x: anchors.thermalPoint.x - 42, y: anchors.thermalPoint.y - 92 },
          { x: anchors.thermalPoint.x - 105, y: anchors.thermalPoint.y - 92 },
          isEs ? 'BUS MANTA TÉRMICA MLI · -150 °C' : 'MLI THERMAL BLANKET · -150 °C',
          smoothstep(1.2, 2.1, elapsedSec),
        );
        drawCalloutRealistic(
          ctx,
          anchors.nozzlePoint,
          { x: anchors.nozzlePoint.x + 42, y: anchors.nozzlePoint.y + 62 },
          { x: anchors.nozzlePoint.x + 102, y: anchors.nozzlePoint.y + 62 },
          isEs ? 'ALTITUD LEO · ARRASTRE ATMOSFÉRICO' : 'LEO ALTITUDE · ATMOSPHERIC DRAG',
          smoothstep(3.2, 4.1, elapsedSec),
        );
      }

      ctx.restore();

      // CAPA DE HOLOGRAMAS EXPLICATIVOS (Sincronizada por onboundary de voz o respaldo por tiempo)
      let activeCue: HologramCue | null = null;
      let cueElapsedSec = 0;
      let cueDurationSec = 999;

      if (cues.length > 0) {
        if (forceLastCueRef.current) {
          activeCue = cues[cues.length - 1];
          cueElapsedSec = 2.0;
          cueDurationSec = 999;
        } else {
          const charIdx = voiceCharIndexRef.current;
          if (charIdx >= 0) {
            activeCue =
              cues.find((c) => charIdx >= c.charStart && charIdx <= c.charEnd) ??
              cues[cues.length - 1];
          } else {
            activeCue =
              cues.find((c) => elapsedSec >= c.startSec && elapsedSec <= c.endSec) ??
              cues[cues.length - 1];
          }
          if (activeCue) {
            if (activeCue.id !== lastReportedCueId) {
              currentCueStartElapsed = elapsedSec;
            }
            cueElapsedSec = Math.max(0, elapsedSec - currentCueStartElapsed);
            const isLast = activeCue.id === cues[cues.length - 1].id;
            cueDurationSec = isLast
              ? 999
              : Math.max(2.2, activeCue.endSec - activeCue.startSec);
          }
        }
      }

      if ((activeCue?.id ?? null) !== lastReportedCueId) {
        lastReportedCueId = activeCue?.id ?? null;
        onActiveCueChange(lastReportedCueId);
      }

      renderExplanatoryHologramLayer(
        ctx,
        LOGICAL_W,
        LOGICAL_H,
        activeCue,
        cueElapsedSec,
        cueDurationSec,
        elapsedSec,
        reducedMotion,
        isEs,
      );

      // 3. Viñeta: gradiente radial de transparente a negro al 65%
      const vignette = ctx.createRadialGradient(
        LOGICAL_W * 0.5,
        LOGICAL_H * 0.5,
        LOGICAL_W * 0.26,
        LOGICAL_W * 0.5,
        LOGICAL_H * 0.5,
        LOGICAL_W * 0.66,
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // 4. Grano de película: 128×128 regenerado cada 3 cuadros, repetido con 7% de opacidad
      if (!grainPatternRef.current || frameCount % 3 === 0) {
        updateGrain();
      }
      if (grainPatternRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = grainPatternRef.current;
        ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
        ctx.restore();
      }

      // 5. Barras negras de cine arriba y abajo (52 px lógicos)
      const BAR_H = 52;
      ctx.fillStyle = '#02060B';
      ctx.fillRect(0, 0, LOGICAL_W, BAR_H);
      ctx.fillRect(0, LOGICAL_H - BAR_H, LOGICAL_W, BAR_H);

      // 6. Ventana de videollamada del personaje abajo a la izquierda (250×200)
      drawSpeakerVideocallPip(
        ctx,
        LOGICAL_W,
        LOGICAL_H,
        elapsedSec,
        speaker,
        isSpeaking,
        reducedMotion,
      );

      // 7. HUD en las barras de cine
      ctx.font = '700 11px "JetBrains Mono", monospace';
      const recBlink = reducedMotion ? true : Math.sin(elapsedSec * 5.2) > -0.25;
      ctx.fillStyle = recBlink ? '#FF5C6C' : 'rgba(255, 92, 108, 0.3)';
      ctx.textAlign = 'left';
      ctx.fillText('●', 24, 31);
      ctx.fillStyle = '#5FF3FF';
      ctx.fillText(`REC ${locationText.slice(0, 44)}`, 40, 31);

      const tInt = Math.floor(elapsedSec);
      const mm = String(Math.floor(tInt / 60)).padStart(2, '0');
      const ss = String(tInt % 60).padStart(2, '0');
      ctx.textAlign = 'right';
      ctx.fillStyle = '#5FF3FF';
      ctx.fillText(`T+${mm}:${ss}`, LOGICAL_W - 24, 31);

      ctx.fillStyle = '#FFC15E';
      ctx.fillText(scienceText.slice(0, 76), LOGICAL_W - 24, LOGICAL_H - 20);

      // 8. Fundido desde negro en el primer 1.2 s
      const fadeIn = 1 - smoothstep(0, 1.2, elapsedSec);
      if (fadeIn > 0.005) {
        ctx.fillStyle = `rgba(2, 6, 11, ${fadeIn})`;
        ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [
    pose,
    speaker,
    locationText,
    scienceText,
    isSpeaking,
    reducedMotion,
    isEs,
    cues,
    voiceCharIndexRef,
    forceLastCueRef,
    onActiveCueChange,
  ]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block border border-[#5FF3FF]/25 shadow-[0_0_45px_rgba(0,0,0,0.9)]"
      />
    </div>
  );
}

/* ==========================================================================
   MODAL PRINCIPAL DE CINEMÁTICAS (CON MÚSICA Y VOCES DE ELEVENLABS INTACTAS)
   ========================================================================== */
export function StoryCinematicModal() {
  const {
    language,
    cadetName,
    engineerName,
    missionCustomName,
    activeCinematicId,
    soundEnabled,
    reducedMotion,
    setLanguage,
    toggleSound,
    closeCinematic,
    advanceToAct2Jpl,
    completeStoryAndUnlockSandbox,
    loadPreset,
  } = useMissionStore();

  const [slideIdx, setSlideIdx] = useState(0);
  const [prevCinematicId, setPrevCinematicId] = useState(activeCinematicId);
  const [typedChars, setTypedChars] = useState(0);
  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

  const voiceCharIndexRef = useRef(-1);
  const forceLastCueRef = useRef(false);

  if (activeCinematicId !== prevCinematicId) {
    setPrevCinematicId(activeCinematicId);
    setSlideIdx(0);
    setTypedChars(0);
    setActiveCueId(null);
    setAudioDurationSec(null);
    setIsVoiceActive(false);
  }

  const scene = activeCinematicId ? STORY_CINEMATICS[activeCinematicId] : null;
  const slides = scene ? scene.slides : [];
  const safeIdx = Math.min(slideIdx, Math.max(0, slides.length - 1));
  const currentSlide = slides[safeIdx];

  const fullDialogue = currentSlide
    ? formatStoryText(
        currentSlide.dialogue[language],
        cadetName,
        engineerName,
        missionCustomName,
      )
    : '';

  const estimatedDurationSec = Math.max(6, Math.min(30, fullDialogue.length / 13));
  const effectiveDurationSec = audioDurationSec ?? estimatedDurationSec;
  const cues = useMemo(
    () =>
      buildCuesForDialogue(
        fullDialogue,
        currentSlide?.pose ?? 'CUBESAT_ORBIT_DANCE',
        effectiveDurationSec,
      ),
    [fullDialogue, currentSlide?.pose, effectiveDurationSec],
  );

  // Controlador único de diálogo: voz (audio real como fuente de verdad) + subtítulos sincronizados
  useEffect(() => {
    if (!activeCinematicId || !currentSlide || !fullDialogue) {
      stopCharacterVoice();
      return;
    }

    let cancelled = false;
    let voiceEnded = false;
    let lastReportedDuration: number | null = null;
    let lastTyped = reducedMotion ? fullDialogue.length : 0;
    let initialized = false;
    let rafId = 0;
    const mutedStartMs = performance.now();

    stopCharacterVoice();
    voiceCharIndexRef.current = -1;
    forceLastCueRef.current = false;

    if (currentSlide.pose === 'HANGAR_PHOTO' || currentSlide.pose === 'VEGA_WINDOW_COIN') {
      playCinemaSfx('RAIN_WIND', soundEnabled);
    } else if (currentSlide.pose === 'ROSTOVA_STANDING_OVATION') {
      playCinemaSfx('MCR_APPLAUSE', soundEnabled);
    }

    const startTimer = window.setTimeout(() => {
      if (cancelled || !soundEnabled) return;
      speakCharacterLine(
        fullDialogue,
        language,
        currentSlide.speaker,
        true,
        () => {
          if (cancelled) return;
          voiceEnded = true;
          voiceCharIndexRef.current = fullDialogue.length;
          if (lastTyped !== fullDialogue.length) {
            lastTyped = fullDialogue.length;
            setTypedChars(fullDialogue.length);
          }
          setIsVoiceActive(false);
        },
        (charIndex) => {
          if (cancelled) return;
          if (charIndex > voiceCharIndexRef.current) {
            voiceCharIndexRef.current = charIndex;
          }
        },
      );
    }, 120);

    const syncSubtitlesFromAudio = () => {
      if (cancelled) return;

      if (!initialized) {
        initialized = true;
        setAudioDurationSec(null);
        setTypedChars(lastTyped);
        setIsVoiceActive(true);
      }

      if (soundEnabled) {
        const snap = getVoicePlaybackSnapshot();

        if (snap.source === 'audio' && snap.durationSec > 0) {
          if (
            lastReportedDuration === null ||
            Math.abs(lastReportedDuration - snap.durationSec) > 0.15
          ) {
            lastReportedDuration = snap.durationSec;
            setAudioDurationSec(snap.durationSec);
          }

          const charIdx = snap.ended
            ? fullDialogue.length
            : Math.min(fullDialogue.length, Math.floor(snap.progress * fullDialogue.length));
          voiceCharIndexRef.current = Math.max(voiceCharIndexRef.current, charIdx);

          if (!reducedMotion && !forceLastCueRef.current && charIdx !== lastTyped) {
            lastTyped = charIdx;
            setTypedChars(charIdx);
          }

          if (snap.ended || voiceEnded) {
            voiceCharIndexRef.current = fullDialogue.length;
            if (lastTyped !== fullDialogue.length) {
              lastTyped = fullDialogue.length;
              setTypedChars(fullDialogue.length);
            }
            setIsVoiceActive(false);
            return;
          }
        } else if (snap.source === 'speech') {
          const charIdx = snap.ended
            ? fullDialogue.length
            : Math.min(
                fullDialogue.length,
                Math.max(
                  voiceCharIndexRef.current,
                  Math.floor(snap.progress * fullDialogue.length),
                ),
              );
          voiceCharIndexRef.current = Math.max(voiceCharIndexRef.current, charIdx);

          if (!reducedMotion && !forceLastCueRef.current && charIdx !== lastTyped) {
            lastTyped = charIdx;
            setTypedChars(charIdx);
          }

          if (snap.ended || voiceEnded) {
            voiceCharIndexRef.current = fullDialogue.length;
            if (lastTyped !== fullDialogue.length) {
              lastTyped = fullDialogue.length;
              setTypedChars(fullDialogue.length);
            }
            setIsVoiceActive(false);
            return;
          }
        } else if (voiceEnded || snap.ended) {
          voiceCharIndexRef.current = fullDialogue.length;
          if (lastTyped !== fullDialogue.length) {
            lastTyped = fullDialogue.length;
            setTypedChars(fullDialogue.length);
          }
          setIsVoiceActive(false);
          return;
        }
      } else {
        const elapsedSec = Math.max(0, (performance.now() - mutedStartMs) / 1000);
        const progress = clamp(elapsedSec / estimatedDurationSec, 0, 1);
        const charIdx = Math.min(
          fullDialogue.length,
          Math.floor(progress * fullDialogue.length),
        );
        voiceCharIndexRef.current = charIdx;

        if (!reducedMotion && !forceLastCueRef.current && charIdx !== lastTyped) {
          lastTyped = charIdx;
          setTypedChars(charIdx);
        }

        if (progress >= 1) {
          voiceCharIndexRef.current = fullDialogue.length;
          if (lastTyped !== fullDialogue.length) {
            lastTyped = fullDialogue.length;
            setTypedChars(fullDialogue.length);
          }
          setIsVoiceActive(false);
          return;
        }
      }

      rafId = requestAnimationFrame(syncSubtitlesFromAudio);
    };

    rafId = requestAnimationFrame(syncSubtitlesFromAudio);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      cancelAnimationFrame(rafId);
      stopCharacterVoice();
    };
  }, [
    activeCinematicId,
    safeIdx,
    language,
    soundEnabled,
    reducedMotion,
    currentSlide,
    fullDialogue,
    estimatedDurationSec,
    replayNonce,
  ]);

  if (!activeCinematicId || !scene || !currentSlide) return null;

  const isEs = language === 'es';
  const isLastSlide = safeIdx >= slides.length - 1;
  const shownText = fullDialogue.slice(0, typedChars);
  const isSpeakingNow = soundEnabled && isVoiceActive;

  const speakerBadgeColor =
    currentSlide.speaker === 'ROSTOVA'
      ? 'border-[#FF5C6C] text-[#FF5C6C] bg-[#FF5C6C]/15'
      : currentSlide.speaker === 'VEGA'
        ? 'border-[#5FF3FF] text-[#5FF3FF] bg-[#5FF3FF]/15'
        : 'border-[#FFC15E] text-[#FFC15E] bg-[#FFC15E]/15';

  const handleNext = () => {
    if (typedChars < fullDialogue.length) {
      stopCharacterVoice();
      setTypedChars(fullDialogue.length);
      setIsVoiceActive(false);
      forceLastCueRef.current = true;
      voiceCharIndexRef.current = fullDialogue.length;
      if (cues.length > 0) {
        setActiveCueId(cues[cues.length - 1].id);
      }
      return;
    }

    stopCharacterVoice();

    if (!isLastSlide) {
      playHoloTone('STEP', soundEnabled);
      setTypedChars(0);
      setActiveCueId(null);
      setAudioDurationSec(null);
      setSlideIdx((i) => i + 1);
      return;
    }

    stopCharacterVoice();

    if (scene.requiresCadetNameInput) {
      playHoloTone('STAR', soundEnabled);
      closeCinematic();
      return;
    }

    if (scene.requiresEngineerNameInput) {
      playHoloTone('ALARM', soundEnabled);
      loadPreset('obj-jupiter-clipper');
      advanceToAct2Jpl();
      return;
    }

    if (scene.unlocksSandbox) {
      playHoloTone('STAR', soundEnabled);
      completeStoryAndUnlockSandbox();
      return;
    }

    playHoloTone('STEP', soundEnabled);
    closeCinematic();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, pointerEvents: 'none' }}
        className="fixed inset-0 z-50 flex h-screen w-screen flex-col justify-between bg-[#02060B] px-4 py-3 sm:px-8 sm:py-4"
      >
        {/* 1. Encabezado */}
        <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#5FF3FF]/25 pb-2.5">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-[#FFC15E] uppercase">
              {scene.actLabel[language]}
            </div>
            <h1 className="mt-0.5 text-xl font-light tracking-tight text-white sm:text-2xl">
              {scene.title[language]}
            </h1>
            <div className="font-mono text-[9.5px] tracking-[0.16em] text-[#5FF3FF] uppercase">
              {scene.location[language]}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setLanguage(isEs ? 'en' : 'es')}
              className="border border-[#5FF3FF]/40 bg-[#06101f] px-3 py-1.5 text-[#5FF3FF] uppercase hover:border-[#5FF3FF]"
            >
              {isEs ? 'IDIOMA: ES' : 'LANG: EN'}
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex items-center gap-1.5 border border-[#5FF3FF]/40 bg-[#06101f] px-3 py-1.5 text-slate-200 uppercase hover:border-[#5FF3FF]"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-[#5FF3FF]" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>
                {soundEnabled
                  ? isEs
                    ? 'VOZ: ON'
                    : 'VOICE: ON'
                  : isEs
                    ? 'VOZ: OFF'
                    : 'VOICE: OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCharacterVoice();
                setIsVoiceActive(false);
                setTypedChars(fullDialogue.length);
                forceLastCueRef.current = true;
                voiceCharIndexRef.current = fullDialogue.length;
                if (cues.length > 0) {
                  setActiveCueId(cues[cues.length - 1].id);
                }
                closeCinematic();
              }}
              className="border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-slate-300 uppercase hover:border-[#FF5C6C] hover:text-[#FF5C6C]"
            >
              {isEs ? 'SALTAR CINEMÁTICA ✕' : 'SKIP CUTSCENE ✕'}
            </button>
          </div>
        </div>

        {scene.alertBanner && (
          <div className="mx-auto w-full max-w-6xl shrink-0 border border-[#FF5C6C] bg-[#FF5C6C]/15 px-4 py-1 text-center font-mono text-[10px] font-bold tracking-[0.18em] text-[#FF5C6C] uppercase">
            {scene.alertBanner}
          </div>
        )}

        {/* 2. Escenario Canvas 2D Realista (16:9 centrado, sin wireframes ni robots hexagonales) */}
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center py-1.5">
          <RealisticCinemaCanvas
            pose={currentSlide.pose}
            speaker={currentSlide.speaker}
            locationText={scene.location[language]}
            scienceText={scene.scienceFact[language]}
            isSpeaking={isSpeakingNow}
            reducedMotion={reducedMotion}
            isEs={isEs}
            cues={cues}
            voiceCharIndexRef={voiceCharIndexRef}
            forceLastCueRef={forceLastCueRef}
            onActiveCueChange={setActiveCueId}
          />
        </div>

        {/* 3. Cuadro de diálogo y 4. Franja inferior */}
        <div className="mx-auto w-full max-w-6xl shrink-0 space-y-2.5 border-t border-[#5FF3FF]/25 pt-2.5">
          <div
            className="border border-[#5FF3FF]/35 bg-[#050c18]/95 p-3.5 shadow-[0_0_35px_rgba(95,243,255,0.12)]"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.16em] uppercase ${speakerBadgeColor}`}
              >
                {currentSlide.speakerTitle[language]}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!soundEnabled) {
                      toggleSound();
                    } else {
                      setReplayNonce((n) => n + 1);
                    }
                  }}
                  className="font-mono text-[9.5px] text-[#5FF3FF] underline hover:text-white"
                >
                  {isEs ? 'Escuchar voz' : 'Replay voice'}
                </button>
                <span className="font-mono text-[10px] text-slate-400">
                  {safeIdx + 1} / {slides.length}
                </span>
              </div>
            </div>

            <p className="mt-2 min-h-[3.1rem] text-sm font-light leading-relaxed sm:text-base">
              {cues.length > 0
                ? cues.map((cue) => {
                    if (typedChars <= cue.charStart) return null;
                    const visibleEnd = Math.min(typedChars, cue.charEnd);
                    const slice = fullDialogue.slice(cue.charStart, visibleEnd);
                    const isCueActive = cue.id === activeCueId;
                    return (
                      <span
                        key={cue.id}
                        className={
                          isCueActive
                            ? 'text-white underline decoration-[#5FF3FF] decoration-1 underline-offset-4 transition-colors'
                            : 'text-slate-400/80 transition-colors'
                        }
                      >
                        {slice}{' '}
                      </span>
                    );
                  })
                : shownText}
              {typedChars < fullDialogue.length && (
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-[#5FF3FF]" />
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[9.5px] text-[#FFC15E]">
              {scene.scienceFact[language]}
            </span>

            <div className="flex items-center gap-2">
              {safeIdx > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTypedChars(0);
                    setSlideIdx((i) => Math.max(0, i - 1));
                  }}
                  className="border border-[#5FF3FF]/35 px-3.5 py-1.5 font-mono text-[10px] text-slate-300 uppercase hover:border-[#5FF3FF]"
                >
                  ← {isEs ? 'ANTERIOR' : 'BACK'}
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="border border-[#5FF3FF] bg-[#5FF3FF]/20 px-5 py-1.5 font-mono text-xs font-bold tracking-[0.16em] text-[#5FF3FF] uppercase shadow-[0_0_24px_rgba(95,243,255,0.28)] hover:bg-[#5FF3FF]/30"
              >
                {typedChars < fullDialogue.length
                  ? isEs
                    ? 'MOSTRAR TEXTO COMPLETO ⏭'
                    : 'SHOW FULL TEXT ⏭'
                  : !isLastSlide
                    ? isEs
                      ? 'SIGUIENTE ESCENA →'
                      : 'NEXT SCENE →'
                    : scene.requiresCadetNameInput
                      ? isEs
                        ? `ENCENDER CONSOLA, CADETE ${cadetName} →`
                        : `IGNITE CONSOLE, CADET ${cadetName} →`
                      : scene.requiresEngineerNameInput
                        ? isEs
                          ? `ASUMIR MANDO EN JPL, ING. ${engineerName} →`
                          : `ASSUME JPL COMMAND, ENG. ${engineerName} →`
                        : scene.unlocksSandbox
                          ? isEs
                            ? 'DESBLOQUEAR MODO FORJA INFINITA (SANDBOX) →'
                            : 'UNLOCK INFINITE FORGE SANDBOX →'
                          : isEs
                            ? 'CONTINUAR A LOS CONTROLES →'
                            : 'CONTINUE TO CONTROLS →'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
