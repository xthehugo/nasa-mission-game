import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const VOICES = {
  VEGA: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George (warm, narrative veteran commander)
    stability: 0.35,
    similarityBoost: 0.8,
  },
  ROSTOVA: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah (composed, analytical flight director)
    stability: 0.45,
    similarityBoost: 0.8,
  },
  SYSTEM: {
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel (authoritative mission telemetry)
    stability: 0.75,
    similarityBoost: 0.75,
  },
};

// All narrative lines from narrativeConfig.ts using default callsigns (Orion, Vanguard, Ícaro-Pionero)
const VOICE_QUEUE = [
  // 1. PRÓLOGO ACTO I (Se escucha apenas abres el juego)
  {
    id: 'act1_prologue_s1',
    speaker: 'SYSTEM',
    es: 'Hace cuatro años, la misión Ícaro-1 se perdió en silencio camino a Júpiter con cuatro astronautas a bordo debido a un fallo en el balance de energía durante una tormenta solar. El Comandante Frank Vega estaba en la Tierra cuando los monitores se apagaron. Prometió no volver a enviar a nadie sin antes forjar máquinas infalibles.',
    en: 'Four years ago, mission Icarus-1 was lost in silence on its way to Jupiter with four astronauts aboard due to a power balance failure during a solar storm. Commander Frank Vega was at Mission Control when the monitors went dark. He promised never to send anyone again without first forging infallible machines.',
  },
  {
    id: 'act1_prologue_s2',
    speaker: 'VEGA',
    es: '¿Sabes cuál es la diferencia entre un sueño y una tragedia, Orion? Unos pocos kilogramos de empuje. En la escuela te enseñan que el espacio es silencioso y hermoso. Mentira. El espacio es una bestia helada esperando que cometas un error de cálculo para devorarte. Perdí a mis mejores amigos allá arriba porque confiamos en planos que no tenían margen de error.',
    en: 'Do you know what the difference is between a dream and a tragedy, Orion? A few kilograms of thrust. In school they teach you that space is silent and beautiful. A lie. Space is a freezing beast waiting for you to make one calculation error to devour you. I lost my best friends up there because we trusted blueprints that had no margin for error.',
  },
  {
    id: 'act1_prologue_s3',
    speaker: 'VEGA',
    es: 'Tú tienes algo que ellos no tenían: una segunda oportunidad para la humanidad. No te voy a dejar solo. Te enseñaré todo lo que sé, paso a paso, tornillo a tornillo. ¿Estás listo para ensuciarte las manos, Cadete Orion? Bienvenido a bordo.',
    en: 'You have something they did not have: a second chance for humanity. I am not going to leave you alone. I will teach you everything I know, step by step, bolt by bolt. Are you ready to get your hands dirty, Cadet Orion? Welcome aboard.',
  },

  // 2. TOUR INTERACTIVO NIVEL 01 (Se escucha paso a paso al terminar el Prólogo)
  {
    id: 'tour_l1_step0',
    speaker: 'VEGA',
    es: 'Cadete Orion, mira arriba a la izquierda. Esas 5 barras son los signos vitales de tu nave: Masa, Energía, Presupuesto, Datos y Enlace RF. Cada pieza que elijas moverá estas barras en vivo. Pulsa "Entendido" para tocar tu primera pieza.',
    en: 'Cadet Orion, look at the top-left panel. Those 5 bars are your ship’s vital signs: Mass, Power, Budget, Data, and RF Link. Every piece you touch will move them. Click "Understand & Continue" to touch your first part.',
  },
  {
    id: 'tour_l1_step1',
    speaker: 'VEGA',
    es: 'Mira el PASO 1 · CHASIS a la izquierda. Es el cuerpo de aluminio donde caben las cámaras. Haz clic ahora mismo en otro tamaño (1.5U, 2U o CUSTOM): detectaré tu movimiento y verás cómo cambia el holograma central.',
    en: 'Look at STEP 1 · CHASSIS on the left. It is the aluminum body where instruments fit. Click any size (1.5U, 2U, or CUSTOM) right now—I will detect your move and show you how the center hologram changes!',
  },
  {
    id: 'tour_l1_step2',
    speaker: 'VEGA',
    es: '¡Bien hecho! ¿Viste cómo cambió el cubo en el centro? Ahora baja a PANELES SOLARES / EPS a la izquierda. Generan la electricidad para que tu nave no se apague como el Ícaro-1. ¡Haz clic en una opción para desplegar las alas!',
    en: 'Great move! You saw the cube resize in the center. Now look at SOLAR ARRAYS / EPS below on the left. They generate electricity so your ship never dies in the dark like Icarus-1. Click any power system to deploy the wings!',
  },
  {
    id: 'tour_l1_step3',
    speaker: 'VEGA',
    es: '¡Mira cómo se desplegaron las alas en el centro! Ahora mira a la DERECHA en PASO 2 · MISIÓN. Elegir la misión define qué planeta investigaremos, qué cámara llevaremos y nuestro presupuesto. ¡Haz clic en una misión a la derecha!',
    en: 'Look at those solar wings deployed in the hologram! Now look to the RIGHT panel under STEP 2 · MISSION. Picking a mission sets our target planet, science camera, and NASA budget. Click any mission card on the right!',
  },
  {
    id: 'tour_l1_step4',
    speaker: 'VEGA',
    es: '¡Excelente trabajo, Cadete Orion! Ya dominas los controles de la izquierda, las misiones de la derecha y el holograma central. Pulsa el botón brillante "SIGUIENTE NIVEL · 02" debajo del holograma para ir a la Órbita.',
    en: 'Outstanding work, Cadet Orion! You now know how the left controls, right mission cards, and center hologram work together. Click "NEXT LEVEL · 02" below the hologram to launch into Orbit!',
  },

  // 3. CINEMÁTICAS DE TRANSICIÓN ACTO I
  {
    id: 'act1_t_1_2',
    speaker: 'VEGA',
    es: 'Mírala. Parece frágil, ¿verdad? Un cubo de unos cuantos centímetros. Pero dentro de ese chasis van los ojos de millones de personas que miran al cielo esta noche con miedo al futuro. Bien hecho, chico. Pero ahora viene la prueba de fuego: tenemos que sacarla de la cuna y ponerla a bailar alrededor de la Tierra. Si calculas mal la altura, la atmósfera la frenará y arderá como una estrella fugaz antes de transmitir su primer dato. Traza la órbita, no apartes los ojos del horizonte.',
    en: 'Look at her. She looks fragile, right? A cube of just a few centimeters. But inside that chassis go the eyes of millions of people looking at the sky tonight with fear of the future. Well done, kid. Now comes the trial by fire: we have to take her out of the cradle and make her dance around the Earth. If you miscalculate the altitude, the atmosphere will brake her and she will burn like a shooting star before transmitting her first datum. Plot the orbit—do not take your eyes off the horizon.',
  },
  {
    id: 'act1_t_2_3',
    speaker: 'VEGA',
    es: '¡Mira la pantalla! Acaba de entrar en el eclipse. Hace un frío de menos ciento cincuenta grados ahí afuera. Los paneles solares no sirven de nada en la oscuridad; tu nave ahora está viviendo de su propio corazón, de sus baterías. ¿Ves por qué no podemos meterle todos los juguetes que queremos? En el espacio hay que renunciar a cosas si quieres sobrevivir. Más peso significa menos velocidad; más instrumentos significa quedarte sin luz. Elige qué sacrificamos, Orion. Es la decisión más dura de un ingeniero.',
    en: 'Look at the screen! She just entered the eclipse. It is minus one hundred and fifty degrees out there. Solar panels are useless in the dark; your ship is now living off its own heart, its batteries. Do you see why we cannot pack every toy we want? In space you have to give things up if you want to survive. More weight means less speed; more instruments mean running out of light. Choose what we sacrifice, Orion. It is the hardest decision an engineer makes.',
  },
  {
    id: 'act1_t_3_4',
    speaker: 'VEGA',
    es: 'Buen pulso. Supiste renunciar a tiempo. Ahora vamos a la plataforma de combustible. Mira esos tanques de propelente y oxidante. Son como el pecho de un corredor: si le metes demasiado aire o líquido, el cohete se vuelve torpe y pesado. Cada gota de hidracina cuenta. Si nos pasamos de masa, el Falcon 9 ni siquiera despegará del suelo. Ajusta los niveles con precisión de cirujano. Confío en tu mano, Orion.',
    en: 'Steady hand. You knew when to let go in time. Now let us move to the propellant bay. Look at those propellant and oxidizer tanks. They are like a runner’s chest: if you pack too much air or liquid, the rocket becomes clumsy and heavy. Every drop of hydrazine counts. If we exceed the mass cap, the Falcon 9 will not even lift off the ground. Adjust the levels with a surgeon’s precision. I trust your hand, Orion.',
  },
  {
    id: 'act1_t_4_5',
    speaker: 'VEGA',
    es: 'Los directores de misión y los inspectores acaban de entrar a la galería de cristal. Vienen a buscar cualquier fallo para cancelar nuestro proyecto. Quieren ver si este cadete de verdad sabe lo que hace o si fue un golpe de suerte. Escúchame bien, Orion: yo ya revisé tus números y creo en ti. Ahora párate derecho, activa los láseres de verificación y demuéstrales que esta nave no tiene fisuras. Esta es tu graduación.',
    en: 'The mission directors and inspectors just walked into the glass gallery. They are here looking for any flaw to cancel our project. They want to see if this cadet truly knows what they are doing or if it was a stroke of luck. Listen to me closely, Orion: I already checked your numbers and I believe in you. Now stand up straight, activate the verification lasers, and prove to them this spacecraft has no cracks. This is your graduation.',
  },
  {
    id: 'act1_t_5_6',
    speaker: 'VEGA',
    es: 'Lo hiciste... Dios mío, los dejaste sin palabras. Mira la torre de lanzamiento en Florida, los motores están humeando. Treinta segundos para ignición. No importa lo que pase allá arriba hoy: ya no eres un estudiante, Orion. Eres el arquitecto de esta nave. Siéntate en la consola principal... y llévala a casa.',
    en: 'You did it... My God, you left them speechless. Look at the launch tower in Florida, the engines are steaming. Thirty seconds to ignition. No matter what happens up there today: you are no longer a student, Orion. You are the architect of this spacecraft. Sit at the main console... and bring her home.',
  },

  // 4. CLÍMAX ACTO I Y GIRO JPL
  {
    id: 'act1_climax_s1',
    speaker: 'VEGA',
    es: 'No puede ser... Orion, mira esto. DSN Goldstone acaba de captar una señal de socorro intermitente proveniente de la órbita de Europa, en Júpiter. ¡Es la baliza de emergencia del Ícaro-1! Siguen vivos... o la nave sigue intentando comunicarse después de cuatro años. Pero la radiación joviana freirá cualquier sonda comercial en minutos.',
    en: 'It cannot be... Orion, look at this. DSN Goldstone just picked up an intermittent distress signal coming from the orbit of Europa, at Jupiter. It is the emergency beacon of Icarus-1! They are still alive... or the ship is still trying to communicate after four years. But the Jovian radiation will fry any commercial probe in minutes.',
  },
  {
    id: 'act1_climax_s2',
    speaker: 'ROSTOVA',
    es: 'Comandante Vega, apague las celebraciones. Necesitamos al mejor diseñador de sistemas que tenga en esa base. La ventana de transferencia interplanetaria a Júpiter se abre en 90 horas. Si fallamos, la señal del Ícaro se perderá para siempre en la radiación. Orion, quítese los parches de cadete. Le transfiero las credenciales de Ingeniero Jefe de Sistemas. Esta noche trabajamos para salvar vidas.',
    en: 'Commander Vega, turn off the celebrations. We need the best systems designer you have on that base. The interplanetary transfer window to Jupiter opens in 90 hours. If we fail, the Icarus signal will be lost forever in the radiation. Orion, take off your cadet patches. I am transferring Chief Systems Engineer credentials to you. Tonight we work to save lives.',
  },

  // 5. GUÍAS EN VIVO DEL COMANDANTE POR NIVEL (HUD BANNER)
  {
    id: 'hud_cml1_cadet',
    speaker: 'VEGA',
    es: 'Cadete Orion, tras perder al Ícaro-1 prometí enseñarte tornillo por tornillo. Sigue mi guía para armar Ícaro-Pionero.',
    en: 'Cadet Orion, after losing Icarus-1 I promised to teach you bolt by bolt. Follow my guide to build Ícaro-Pionero.',
  },
  {
    id: 'hud_cml2_cadet',
    speaker: 'VEGA',
    es: 'Cadete Orion, si calculas mal la altura, la atmósfera frenará a Ícaro-Pionero y arderá como estrella fugaz. Ajusta la altitud a la izquierda y la antena terrena a la derecha.',
    en: 'Cadet Orion, if we fly too low, atmospheric drag will burn Ícaro-Pionero like a shooting star. Use the left sliders to set altitude and the right panel to pick our Ground Dish.',
  },
  {
    id: 'hud_cml3_cadet',
    speaker: 'VEGA',
    es: 'En el frío de -150°C del eclipse, Orion, hay que saber renunciar. Recorre los 7 módulos a la izquierda y elige las piezas con "PISTA CADETE" a la derecha.',
    en: 'In the -150°C eclipse, Orion, you cannot carry every toy. Click each of the 7 modules on the left and pick the parts marked "CADET PICK" on the right.',
  },
  {
    id: 'hud_cml4_cadet',
    speaker: 'VEGA',
    es: 'Cada gota de hidracina cuenta, Orion. Ajusta los 4 tanques a la izquierda sin que el cohete central pase a rojo, y luego pulsa "SINCRONIZAR BD" a la derecha.',
    en: 'Every drop of hydrazine counts, Orion. Adjust the 4 tank sliders on the left without turning the center rocket red, then click "COMMIT & VALIDATE" on the right.',
  },
  {
    id: 'hud_cml5_cadet',
    speaker: 'VEGA',
    es: 'Los inspectores están en la galería de cristal, Orion. Marca las 5 casillas V&V a la izquierda, pon el timer RF en ≥30 min y mantén presionado el botón de huella a la derecha para despegar.',
    en: 'Inspectors are in the glass gallery, Orion. Check all 5 V&V boxes on the left, set the RF timer ≥30 min, and hold the fingerprint button on the right to sign the MCR!',
  },
  {
    id: 'hud_sim_cadet',
    speaker: 'VEGA',
    es: '¡Motores humeando en Florida, Orion! Resuelve las 3 crisis en el panel derecho y luego pulsa el botón rojo de ALERTA OMEGA para vivir el giro hacia JPL.',
    en: 'Engines smoking in Florida, Orion! Resolve the 3 crises on the right panel, then click the red OMEGA ALERT button to face the next chapter!',
  },

  // 6. ACTO II - PRÓLOGO Y TRANSICIONES JPL
  {
    id: 'act2_prologue_s1',
    speaker: 'ROSTOVA',
    es: 'Aquí no hay metáforas bonitas sobre mochilas de montaña, Ingeniero Vanguard. A 600 millones de kilómetros de la Tierra, un error de 0.1 decibelios en el enlace de radio significa que los datos se perderán en el ruido cósmico. Vega me dijo que tienes talento. Yo solo creo en lo que resiste las leyes de la termodinámica. Diseña una sonda de espacio profundo clase Europa. Sin concesiones. Sin excusas.',
    en: 'There are no pretty metaphors about mountain backpacks here, Engineer Vanguard. At 600 million kilometers from Earth, a 0.1 decibel error in the radio link means data will be lost in cosmic noise. Vega told me you have talent. I only believe in what withstands the laws of thermodynamics. Design a Europa-class deep space probe. No concessions. No excuses.',
  },
  {
    id: 'act2_prologue_s2',
    speaker: 'VEGA',
    es: 'Estoy contigo en la línea, socio. Demuéstrale a Rostova de qué madera estamos hechos, Vanguard.',
    en: 'I am with you on the line, partner. Show Rostova what we are made of, Vanguard.',
  },
  {
    id: 'act2_finale_s1',
    speaker: 'SYSTEM',
    es: 'Inserción orbital en Europa confirmada. ¡La baliza de emergencia del Ícaro-1 ha respondido! El cien por ciento de las grabaciones finales de la tripulación y los datos científicos del océano subterráneo de Europa están llegando a la Tierra.',
    en: 'Orbital insertion around Europa confirmed. The Icarus-1 emergency beacon has responded! One hundred percent of the crew’s final black-box recordings and Europa subsurface ocean spectrograms are now streaming to Earth.',
  },
  {
    id: 'act2_finale_s2',
    speaker: 'VEGA',
    es: 'Los trajiste a casa, Vanguard... Por Dios, les diste un final digno. Le prometí al Cadete Orion que jamás volveríamos a fallar, y hoy el Ingeniero Jefe Vanguard cumplió esa promesa. Jamás olvidaré lo que hiciste hoy.',
    en: 'You brought them home, Vanguard... My God, you gave them a worthy finale. I promised Cadet Orion we would never fail again, and today Chief Engineer Vanguard fulfilled that promise. I will never forget what you did today.',
  },
  {
    id: 'act2_finale_s3',
    speaker: 'ROSTOVA',
    es: 'Excelente trabajo, Ingeniero Jefe Vanguard. Su diseño ha sido bautizado como estándar permanente de la NASA. El sistema solar ya no parece tan grande con gente como usted en los controles.',
    en: 'Excellent work, Chief Engineer Vanguard. Your architecture has been baptized as a permanent NASA standard. The solar system does not seem so vast anymore with people like you at the controls.',
  },
];

function normalizeSpeechText(rawText, lang) {
  return rawText
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/ΔV/g, 'delta V')
    .replace(/1\/R²/g, lang === 'es' ? 'uno sobre R al cuadrado' : 'one over R squared')
    .replace(/CML\s*(\d)/g, lang === 'es' ? 'nivel CML $1' : 'CML level $1')
    .trim();
}

function getVoiceCacheFilename(text, lang, speaker) {
  const normalized = normalizeSpeechText(text, lang);
  const voiceCfg = VOICES[speaker] ?? VOICES.VEGA;
  const digest = createHash('sha256')
    .update(`${voiceCfg.voiceId}|${lang}|${normalized}`)
    .digest('hex')
    .slice(0, 20);
  return `${speaker.toLowerCase()}_${lang}_${digest}.mp3`;
}

export async function generatePrebakedVoices(outputDir, manifestTsPath) {
  const client = new ElevenLabsClient();
  mkdirSync(outputDir, { recursive: true });

  const manifestEntries = [];

  // Generate Spanish first (highest priority), then English
  for (const lang of ['es', 'en']) {
    for (const item of VOICE_QUEUE) {
      const rawText = item[lang];
      const text = normalizeSpeechText(rawText, lang);
      const filename = getVoiceCacheFilename(text, lang, item.speaker);
      const outPath = join(outputDir, filename);

      if (existsSync(outPath)) {
        console.log(`[CACHED] ${item.id} (${lang}) -> ${filename}`);
        manifestEntries.push({
          id: `${item.id}_${lang}`,
          speaker: item.speaker,
          lang,
          filename,
          canonicalText: text,
        });
        continue;
      }

      try {
        const voiceCfg = VOICES[item.speaker];
        const audio = await client.textToSpeech.convert(voiceCfg.voiceId, {
          text,
          modelId: 'eleven_v4',
          languageCode: lang,
          applyTextNormalization: 'on',
          voiceSettings: {
            stability: voiceCfg.stability,
            similarityBoost: voiceCfg.similarityBoost,
          },
        });

        const chunks = [];
        for await (const chunk of Readable.fromWeb(audio)) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        writeFileSync(outPath, Buffer.concat(chunks));
        console.log(`[GENERATED] ${item.id} (${lang}) -> ${filename}`);
        manifestEntries.push({
          id: `${item.id}_${lang}`,
          speaker: item.speaker,
          lang,
          filename,
          canonicalText: text,
        });
      } catch (err) {
        console.warn(`[STOPPED/QUOTA] Could not generate ${item.id} (${lang}):`, err?.message || err);
        break;
      }
    }
  }

  // Write TypeScript manifest so the browser can resolve static /audio/voices/*.mp3 on Vercel & Git!
  const existingFiles = new Set(readdirSync(outputDir).filter((f) => f.endsWith('.mp3')));
  const validEntries = manifestEntries.filter((e) => existingFiles.has(e.filename));

  const tsContent = `// Auto-generated static ElevenLabs voice manifest for Git & Vercel deployment
export interface PrebakedVoiceEntry {
  id: string;
  speaker: 'VEGA' | 'ROSTOVA' | 'SYSTEM';
  lang: 'en' | 'es';
  filename: string;
  canonicalText: string;
}

export const PREBAKED_VOICE_MANIFEST: PrebakedVoiceEntry[] = ${JSON.stringify(validEntries, null, 2)};
`;
  writeFileSync(manifestTsPath, tsContent, 'utf8');
  console.log(`[MANIFEST] Wrote ${validEntries.length} static voice entries to ${manifestTsPath}`);
}

const outDir = join(process.cwd(), 'public', 'audio', 'voices');
const manifestTsPath = join(process.cwd(), 'src', 'components', 'voiceManifest.ts');
generatePrebakedVoices(outDir, manifestTsPath).catch((err) => {
  console.error('Voice generation error:', err);
  process.exitCode = 1;
});
