# Guía Oficial del Hackathon, Criterios del Jurado y Entregables (Space Apps 2026)

Consolidado de reglas oficiales de **NASA Space Apps Challenge 2026 — Universidad Continental** (*"The Next Frontier"* / reto *Space Mission Design Game*), extraído de la reunión inaugural y las guías oficiales de evaluación y entrega.

---

## 1. Reglas Críticas de Cumplimiento y Descalificación

1. **PROHIBIDO usar el logotipo oficial de la NASA ("Meatball" / "Worm"):**
   - Las guías prohíben estrictamente usar, incluir o modificar marcas, banderas o emblemas oficiales de la NASA dentro de interfaces o gráficos generados con IA.
   - **Implementación obligatoria:** Usar nuestra identidad original **`ORBITAL FORGE // Space Mission Design Lab`** con iconografía SVG propia, citando a la NASA **únicamente en texto** como fuente abierta (*"Grounded in NASA Open Data, JPL CML & NASA GMAT R2026a"*).
2. **Idioma Inglés (`en`) Obligatorio para Evaluación Global:**
   - El idioma predeterminado de la aplicación al abrir debe ser **inglés (`language: 'en'`)** con un botón visible `EN / ES`.
   - La ficha oficial en la plataforma Space Apps, las diapositivas y/o los subtítulos del video deben estar **en inglés**.
3. **Declaración de Uso de IA / Super Intelligence (`SI Disclosure`):**
   - La guía 2026 exige declarar en créditos y metadatos la asistencia de IA: indicar que el diseño de software y UI fue acelerado con asistencia de IA, mientras que **todas las ecuaciones físicas y presupuestos orbitales provienen determinísticamente de documentación oficial de NASA/JPL y GMAT**.
4. **Citación de NASA + Agencia Espacial Canadiense (CSA):**
   - Incluir explícitamente a la **Canadian Space Agency (CSA)** junto con **NASA JPL / GSFC / SmallSat Institute / GMAT** en la sección de recursos de la app y en el formulario final fortalece el criterio de uso de datos de agencias socias.
5. **Plazo y Formato de Entrega:**
   - **Cierre oficial:** Domingo 15 de noviembre de 2026, **23:59 hora local**.
   - **Enlaces 100% públicos:** Sin login ni permisos privados en GitHub, Vercel/Netlify o Google Slides/YouTube.
   - **Pitch / Demo:** **Máximo 7 diapositivas** o **video de hasta 30 segundos** (si supera los 30s puede quedar fuera de evaluación global).

---

## 2. Rúbrica del Jurado (6 Criterios Evaluados) y Cómo los Cubrimos

| Criterio del Jurado | Qué Evalúa el Juez | Cómo lo Resuelve `ORBITAL FORGE` |
| :--- | :--- | :--- |
| **Impacto (*Impact*)** | ¿Resuelve un problema real e inspira o ayuda a muchos? | Democratiza el diseño espacial para colegios y universidades con **Modo Cadete** (analogías) y **Modo Ingeniero JPL** (ecuaciones reales), más tarjeta exportable (*Mission Concept Card*). |
| **Creatividad (*Creativity*)** | ¿Es novedoso o mejora sustancialmente lo existente? | Convierte la aridez de los *trade-offs* SWaP-C en un bucle gamificado CML 1–5 con un **Director de Vuelo** que explica el porqué físico de cada falla y **3 dilemas de crisis interactivos** en vuelo. |
| **Validez (*Validity*)** | ¿Es científicamente válido y funciona en el mundo real? | Motor puro determinista con ecuación de Tsiolkovsky, caída solar $1/R^2$, Link Budget en dB (DSN 34m/70m), contingencia MGA por TRL ($\ge 35\%$ MCR) y **validación cruzada contra NASA GMAT R2026a (`dest-geo`: 3,673 m/s)** con **11/11 tests unitarios pasando**. |
| **Pertinencia (*Relevance*)** | ¿Responde al reto y es fácil de usar? | Responde directamente al reto *Space Mission Design Game* en formato web sin instalación, bilingüe `EN/ES`, con cabina Split-Screen intuitiva y 4 presets jugables en 1 clic. |
| **Presentación (*Presentation*)** | ¿Qué tan claro comunica historia, reto, solución e importancia? | Visualizador orbital animado SVG (incluyendo elipse Hohmann LEO->GEO), blueprint reactivo de la nave con alerta de cofia (*fairing*) y demo limpia en 7 slides / 30s. |
| **Diversidad (*Diversity*)** | ¿Combina integrantes con perfiles distintos aprovechando sus fortalezas? | Equipo multidisciplinario dividido claramente en: Física/Sistemas (`feat/engine`), UX Pedagógica/Dashboard (`feat/ui`) y Visualización Aeroespacial/GMAT/Storytelling (`feat/visuals`). |

---

## 3. Textos Listos en Inglés para el Formulario de Entrega (Persona 2)

> Pueden editar detalles finales de equipo/URL, pero respetan el tono técnico y las citas obligatorias exigidas por Space Apps 2026.

### Project Title
`ORBITAL FORGE — Interactive NASA CML Space Mission Design & Simulation Lab`

### High-Level Summary (Corto, ~2-3 líneas)
> **ORBITAL FORGE** is an interactive, bilingual (`EN/ES`) space mission design game that turns NASA JPL's **Concept Maturity Levels (CML 1–5)** and real **SWaP-C trade-offs** into an accessible engineering sandbox. Players assemble spacecraft for LEO, GEO, Lunar, Martian, or Jovian science objectives, validate their architecture against real orbital physics (including a **NASA GMAT R2026a** Hohmann transfer benchmark) and JPL `>= 35%` margins, and survive live in-flight operational crises.

### Detailed Project Description (Para copiar y adaptar)
> **Challenge & Problem:** Space systems engineering trade-offs — Size, Weight, Power, and Cost (**SWaP-C**) — are often locked inside complex aerospace tools or dry spreadsheets. Students and aspiring engineers struggle to see *why* selecting a high-gain SAR radar or traveling to 5.20 AU breaks mass, solar power, and telecom budgets simultaneously.
>
> **Our Solution:** **ORBITAL FORGE** models the official NASA 6-step mission lifecycle across **4 mission segments** (*User, Space, Launch, Ground*) and **CML 1 through CML 5 (Mission Concept Review)**. A unified Split-Screen Mission Control interface offers two switchable learning layers:
> - **Cadet Mode:** Human-friendly engineering analogies and intuitive Flight Director explanations.
> - **JPL Engineer Mode:** Exact analytical telemetry — Tsiolkovsky rocket equation ($\Delta V$ & wet mass fraction), $1/R^2$ solar flux vs. RTG output, dB telecom Link Budget across Commercial GN, Near-Earth Network, and DSN 34m/70m dishes, and TRL-weighted Mass Growth Allowance (MGA) enforcing NASA's $\ge 35\%$ green margin gate.
>
> **Scientific Validation & Interactivity:** After clearing MCR, players pilot their spacecraft through 5 simulated flight phases with **3 live operational crisis dilemmas** (X-class solar CME storm, deep eclipse thermal drop, and ground-station rain fade) and compare their final design side-by-side against real NASA/CSA missions (*BioNutrients-2 & PACE, Lunar Trailblazer & PUNCH, Mars Reconnaissance Orbiter, Europa Clipper & JWST/CSA FGS*). Geostationary orbital transfer budgets (`3,673 m/s` Hohmann transfer, `~71.3%` propellant mass fraction) are directly cross-validated against a team-executed **NASA GMAT R2026a** (`Ex_HohmannTransfer`) simulation and backed by an automated 11-test physics verification suite.
>
> **Open Data & AI Disclosure:** Physics formulas and mission catalogs are grounded in NASA JPL CML documentation, NASA SmallSat Institute webinars, NASA CubeSat 101, NASA GMAT R2026a, and CSA open resources. Software scaffolding and interface styling were accelerated using AI assistance with deterministic human-verified physics equations in TypeScript.

---

## 4. Presentación Oficial y Estructura de las 7 Diapositivas (Persona 3)

🔗 **Presentación en Google Slides (7 Diapositivas):** [Ver Diapositivas Oficiales](https://docs.google.com/presentation/d/1ejXNJ8t49zhaHaehOjhdB-dRM18XtCkie2YK6UbFXkQ/edit?slide=id.p7#slide=id.p7)

| Slide | Título Sugerido (EN) | Contenido Clave Visual |
| :---: | :--- | :--- |
| **1** | **ORBITAL FORGE — The Space Mission Design Lab** | Nombre propio (sin logo NASA), lema del equipo, reto *Space Mission Design Game* y captura principal del Split-Screen. |
| **2** | **The Educational Problem** | Por qué los estudiantes no visualizan cómo una decisión (e.g. radar SAR o ir a Marte/Júpiter) dispara masa de propelente, potencia y costo. |
| **3** | **How the Game Works (CML 1–5 + Live Crises)** | Diagrama visual de las 5 fases CML + Modo Cadete / Ingeniero JPL + 3 crisis interactivas de vuelo. |
| **4** | **Scientific Validity & NASA GMAT Cross-Check** | Ecuaciones reales (Tsiolkovsky, $1/R^2$, dB Link Budget), semáforo MCR `>= 35%` y **capturas de NASA GMAT R2026a (`Ex_HohmannTransfer`: `TOI + GOI = 3,673 m/s`, 12 iteraciones DC, 11/11 tests)**. |
| **5** | **Live Demo Showcase** | Captura / GIF / demo rápida armando una misión fallida vs. corrigiéndola hasta `GREEN` y comparándola con la misión real de NASA/CSA. |
| **6** | **Team Diversity & Parallel Architecture** | Explicación visual de los 3 perfiles del equipo (Física/Sistemas, UX Educativa/Estado, Visualización/GMAT/Storytelling) y arquitectura modular. |
| **7** | **Impact, Future Roadmap & Open Data Citations** | Uso inmediato en aulas STEM + citas abiertas oficiales (NASA JPL CML, SmallSat Institute, CubeSat 101, GMAT R2026a, Mission-Viz, CSA). |

---

## 5. Pitch de 45s y Preguntas Estratégicas para Mentores

**Pitch corto ante mentores:**
> *"Somos **ORBITAL FORGE** en el reto **Space Mission Design Game**. Transformamos la metodología real de la NASA (**CML 1 a 5 de JPL**, **4 segmentos del SmallSat Institute** y márgenes semafóricos MCR $\ge 35\%$) en un simulador bilingüe (`EN/ES`) con **Modo Cadete** para escolares y **Modo Ingeniero JPL** para universitarios. Nuestro motor físico ya calcula Tsiolkovsky, caída solar $1/R^2$, Link Budget dB y fue validado contra una simulación real de **NASA GMAT R2026a** (11/11 tests pasando), rematando con 3 crisis de vuelo interactivas y comparativa contra misiones reales."*

**Preguntas útiles si pasa otro mentor:**
1. *¿Qué pesa más ante el jurado local: priorizar la explicación lúdica (Modo Cadete) o mostrar el rigor matemático/GMAT en la demo?*
2. *Para la evaluación local, ¿prefieren el video de 30 segundos corriendo el prototipo o la presentación de 7 diapositivas?*
3. *¿Qué detalle adicional en la comparativa final (*Mission Concept Card*) haría el proyecto inmediatamente adoptable en aulas STEM?*
4. *¿Cuál considera hoy el punto más vulnerable de nuestra propuesta frente a los 6 criterios de la rúbrica?*
