<div align="center">

# 🚀 ORBITAL FORGE
### Interactive NASA CML Space Mission Design & Simulation Lab
**NASA Space Apps Challenge 2026 — *The Next Frontier / Science Mission Design***

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-00E5FF?style=for-the-badge&logo=vercel)](https://nasa-mission-game.vercel.app)
[![Pitch Deck](https://img.shields.io/badge/Pitch%20Deck-Google%20Slides-EA4335?style=for-the-badge&logo=googleslides&logoColor=white)](https://docs.google.com/presentation/d/1ejXNJ8t49zhaHaehOjhdB-dRM18XtCkie2YK6UbFXkQ/edit?slide=id.p7#slide=id.p7)
[![Tests Passing](https://img.shields.io/badge/Tests-12%2F12%20Passing-00E676?style=for-the-badge&logo=vitest)](https://github.com/xthehugo/nasa-mission-game)
[![NASA GMAT](https://img.shields.io/badge/NASA%20GMAT-R2026a%20Validated-FFC107?style=for-the-badge&logo=nasa)](https://software.nasa.gov/software/GSC-19468-1)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Zero%20Any-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](./LICENSE)

**🌐 Live Application:** [https://nasa-mission-game.vercel.app](https://nasa-mission-game.vercel.app) *(Zero login required · Instant access)*  
**📊 Official Pitch Deck:** [Google Slides (7 Slides)](https://docs.google.com/presentation/d/1ejXNJ8t49zhaHaehOjhdB-dRM18XtCkie2YK6UbFXkQ/edit?slide=id.p7#slide=id.p7)  
**📁 Official Repository:** [https://github.com/xthehugo/nasa-mission-game](https://github.com/xthehugo/nasa-mission-game)  
**🗣️ Supported Languages:** English (`en`, Default) & Spanish (`es`)

---

</div>

## 📑 Table of Contents / Índice
1. [English Overview](#-english-overview)
   - [What is ORBITAL FORGE?](#what-is-orbital-forge)
   - [Alignment with Official NASA Frameworks](#alignment-with-official-nasa-frameworks)
   - [Core Systems & Innovations](#core-systems--innovations)
   - [Scientific & Mathematical Validation](#scientific--mathematical-validation)
   - [Architecture & Tech Stack](#architecture--tech-stack)
   - [NASA Space Apps Challenge Compliance](#nasa-space-apps-challenge-compliance)
   - [Local Development & Testing](#local-development--testing)
2. [Resumen en Español](#-resumen-en-español)
   - [¿Qué es ORBITAL FORGE?](#qué-es-orbital-forge)
   - [Alineación con la Metodología NASA](#alineación-con-la-metodología-nasa)
   - [Características y Modo Dual](#características-y-modo-dual)
   - [Validación Científica GMAT](#validación-científica-gmat)
   - [Puesta en Marcha Local](#puesta-en-marcha-local)
3. [Documentation Deep Dives (`docs/`)](#-documentation-deep-dives-docs)
4. [Team & Acknowledgments](#-team--acknowledgments)

---

# 🇺🇸 English Overview

## What is ORBITAL FORGE?

**ORBITAL FORGE** is a deterministic, bilingual (`EN/ES`) web-based space mission design game and concurrent engineering sandbox. It transforms the often dry, spreadsheet-heavy reality of aerospace systems engineering — Size, Weight, Power, Cost, and Thermal (**SWaP-C**) — into an engaging, interactive flight control cockpit.

Built for both aspiring students and aerospace professionals, players design, optimize, verify, and fly realistic scientific spacecraft across low Earth orbit, geostationary transfer, lunar polar trajectories, Sun-Earth $L_2$ halo orbits, and deep space exploration at Jupiter.

```
       CML 1               CML 2               CML 3               CML 4               CML 5             SIMULATION
 ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
 │ Science Goals │──>│ ConOps & Dest │──>│  Trade Space  │──>│ Point Design  │──>│   MCR Gate    │──>│ In-Flight Ops │
 │ Need & KPP    │   │ Orbits & GMAT │   │ 7 Subsystems  │   │ Team X Freeze │   │ Margins ≥ 35% │   │ 5 Live Crises │
 └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

---

## Alignment with Official NASA Frameworks

ORBITAL FORGE faithfully models the methodologies published by NASA Flight Systems Engineers and the Jet Propulsion Laboratory (JPL):

### 1. The 4 NASA Science Mission Segments
As formulated in the NASA SmallSat Institute curriculum (*Julie Levri, NASA Flight Systems Engineer*):
* **User Segment:** Principal investigators, scientific questions, data resolution thresholds, and peer-reviewed deliverables.
* **Space Segment:** Spacecraft bus, form factors (CubeSat 1U–24U and SmallSat), payload instruments, and active subsystems.
* **Launch Segment:** Launch vehicles (VADR rideshares, commercial dedicated rockets), fairing dynamic envelopes, and mass-to-orbit limits.
* **Ground Segment:** Telecommunications networks, figure of merit ($G/T$), Near Space Network (NSN), and the Deep Space Network (DSN 34m & 70m).

### 2. The 6-Step NASA Systems Engineering Lifecycle
1. **Identify Need & Goals:** Select core scientific objectives (Earth Science, Heliophysics, Planetary Science, Astrophysics).
2. **Define Concept (ConOps):** Determine operational lifetime, orbital geometry, radiation hazards, and eclipse profiles.
3. **Define Requirements:** Establish rigid mission constraints (maximum payload volume, budget cap, required data rates).
4. **Design (Trade Space):** Balance cross-subsystem trade-offs in real time across 7 disciplines.
5. **Build & Verify (MCR Gate):** Pass the institutional Mission Concept Review gate with $\ge 35\%$ contingency reserves.
6. **Implement (Flight Operations):** Pilot the spacecraft through dynamic orbital stages, resolving real-time operational crises.

### 3. NASA JPL Concept Maturity Levels (CML 1 through CML 5)
Adopted directly from *Randii Wessen et al. (NASA JPL / Caltech)*:
* **CML 1 (Cocktail Napkin):** Pure scientific intent and basic physics feasibility.
* **CML 2 (Initial Feasibility):** Destination selection, first-order $\Delta V$ calculation, and cost class classification.
* **CML 3 (Trade Space):** Multi-dimensional matrix exploring 24+ flight-proven subsystem components.
* **CML 4 (Point Design):** Baseline spacecraft configuration locked to NASA JPL Team X fidelity standards.
* **CML 5 (Concept Baseline / MCR Gate):** Formal review gate evaluating Mass Growth Allowance (MGA) and power margins.

---

## Core Systems & Innovations

### 🎓 Dual-Layer Learning Engine
* **Cadet Mode (Students & STEM Classrooms):** Intuitive real-world analogies, color-coded safety indicators, interactive guided tours, and humanized mentorship from Commander Frank Vega.
* **JPL Engineer Mode (Undergraduate & Systems Engineers):** Exact mathematical formulas formatted in KaTeX, analytical telemetry panels ($E_b/N_0$ link budgets, solar flux equations, TRL contingency breakdowns), and compliance checklists adhering to **GSFC-STD-1000 Rev H (GOLD Rules)** and **NASA-STD-5001B**.

### 🛰️ 6 Grounded Scientific Campaigns
Every campaign mirrors real empirical data from historical and active missions:
1. **BioNutrients-2 (LEO · 400 km):** NASA Ames biological yeast production on the ISS; 3U CubeSat form factor, cold-gas propulsion, rideshare envelope.
2. **TRACERS Tandem (SSO · 590 km):** Twin SmallSat constellation studying magnetic reconnection with fluxgate magnetometers and high-inclination polar passes.
3. **GOES Weather & Space Environment (GEO · 35,786 km):** Geostationary transfer requiring a $3,673\text{ m/s}$ Hohmann burn and high-power Ka-band communications.
4. **Lunar Trailblazer & PUNCH (Moon · 100 km):** Lunar polar water-ice mapping using cryogenic infrared spectrometers and high-efficiency Hall effect electric propulsion.
5. **JWST & CSA Fine Guidance Sensor (Sun-Earth $L_2$ Halo · 1.5M km):** Deep-space observatory with sub-arcsecond star tracking, optical downlink, and five-layer sunshield thermal protection.
6. **Europa Clipper & Jovian System (Jupiter · 5.20 AU):** Extreme environment where solar flux plummets to $3.7\%$, demanding next-gen Radioisotope Thermoelectric Generators (RTG), tantalum radiation vaults, and 70-meter DSN apertures.

### ⚡ Live In-Flight Operational Crisis Dilemmas
During orbital flight, players must navigate critical emergency scenarios requiring real-time systems trade-offs:
* **Solar CME Radiation Storm:** Trade off science data collection against safe-mode orientation and electronics survival.
* **Deep Eclipse Thermal Plunge:** Balance battery reserves between essential computer survival heaters and active attitude control.
* **Ground Station Atmospheric Rain Fade:** Select between onboard data buffering with occultation or modulation frequency downshifting.
* **Deployable Antenna Mechanism Jam:** Execute thermal cycling maneuvers or switch to low-gain omnidirectional backup links.
* **RCS Desaturation Anomaly:** Manage momentum wheel saturation limits during high-disturbance orbital passes.

### ✦ Google AI Studio · Gemini Space Master
An in-cockpit AI co-pilot powered by **Gemini 2.5 Flash**:
* **Live Telemetry Audit:** Automatically extracts active mass margins, $\Delta V$ balances, and link budgets to generate a NASA Flight Director readiness debrief (`GO / CONDITIONAL NO-GO`).
* **Procedural Mission Generator:** Generates high-stakes exploratory missions (e.g., Psyche-16 metal asteroid survey, Venus atmospheric probe) with one-click injection into the physics engine.
* **Deterministic Fallback:** Functions 100% offline using a deterministic JPL Team X rule-based expert engine if no API key is provided.

### 🎙️ Dual-Voice Edge-TTS & PDF Honor Diplomas
* **High-Fidelity Neural Audio:** Bilingual spoken dialogues for Commander Frank Vega and Flight Director Rostova synthesized with Microsoft Edge-TTS neural models and synchronized subtitle highlighting.
* **Vector NASA Honor Diploma:** Generates and downloads a print-ready vector PDF certificate (via `jspdf`) stamped with mission telemetry, star commendations, and flight signatures.

---

## Scientific & Mathematical Validation

All physics evaluations in `src/engine/physics.ts` are 100% deterministic and free of arbitrary numbers:

1. **Tsiolkovsky Rocket Equation:**
   $$\Delta V = I_{sp} \cdot g_0 \cdot \ln\left(\frac{m_{\text{wet}}}{m_{\text{dry}}}\right)$$
2. **Inverse-Square Solar Irradiance Law:**
   $$S(R) = \frac{1361\text{ W/m}^2}{R^2}$$
   Accurately models solar panel degradation from Mars ($1.52\text{ AU} \rightarrow 589\text{ W/m}^2$) to Jupiter ($5.20\text{ AU} \rightarrow 50.3\text{ W/m}^2$).
3. **Telecommunications Link Budget (Positive Free Space Path Loss - Friis Equation):**
   $$FSPL_{\text{dB}} = 20 \log_{10}\left(\frac{4\pi d}{\lambda}\right) > 0$$
   $$\left(\frac{E_b}{N_0}\right)_{\text{rx}} = \text{EIRP} - FSPL_{\text{dB}} - L_{\text{atm}} - L_{\text{point}} + \left(\frac{G}{T}\right)_{\text{ground}} - k_{\text{dB}} - 10\log_{10}(R_{\text{bps}})$$
4. **Mass Growth Allowance (MGA) by TRL (AIAA S-120A):**
   Contingency margins scaled from $45\%$ (TRL 1–3) down to $8\%$ (TRL 8–9).
5. **Cross-Validation with NASA GMAT R2026a:**
   The geostationary transfer insertion (`dest-geo`) matches the official NASA General Mission Analysis Tool benchmark (`Ex_HohmannTransfer`):
   $$\Delta V_{\text{TOI}} = 2,240\text{ m/s} + \Delta V_{\text{GOI}} = 1,433\text{ m/s} = \mathbf{3,673\text{ m/s}}$$
   Verified by an automated test suite with **12/12 passing test cases** (`npm test`).

---

## Architecture & Tech Stack

```
src/
├── engine/              # Pure deterministic aerospace calculations & catalogs
│   ├── catalog.ts       # Subsystems, destinations, objectives, and ground stations
│   ├── physics.ts       # Tsiolkovsky, solar flux, Friis telecom, and MCR gate logic
│   ├── simulation.ts    # 5-phase orbital flight simulation & crisis event resolution
│   └── engine.test.ts   # 12 automated unit tests verifying NASA physics
├── store/               # Unified reactive state management (Zustand 5)
│   ├── uiSlice.ts       # CML phases, active language, modals, and tutorial steps
│   ├── missionSlice.ts  # Spacecraft architecture, selections, and flight parameters
│   └── useMissionStore.ts # Persistent storage with cross-session synchronization
├── components/          # Cockpit UI, modal dialogs, and HUD banners
│   ├── CommanderHudBanner.tsx        # Dynamic flight mentor guidance
│   ├── CommanderOnboardingModal.tsx  # Recruitment station with audio directive
│   ├── GoogleAIStudioModal.tsx       # Gemini 2.5 Flash telemetry debrief & scenarios
│   ├── MCRReviewGate.tsx             # NASA Phase Gate (≥ 35% margin threshold)
│   ├── PostMissionCertificateModal.tsx # Vector PDF diploma generator (jsPDF)
│   ├── StoryCinematicModal.tsx       # Story cutscenes with Edge-TTS sync
│   └── TradeSpaceMatrix.tsx          # 7-subsystem SWaP-C concurrent design board
└── visuals/             # Responsive SVG visualizations & telemetry charts
    ├── HoloSpacecraftWireframe.tsx   # Real-time reactive 3D wireframe blueprint
    ├── OrbitalMapVisualizer.tsx      # Hohmann ellipse and Keplerian orbital tracks
    └── MissionStage.tsx              # Transonic ascent and stage separation visualizer
```

* **Core Framework:** React 19 + TypeScript + Vite 8
* **Styling & Motion:** Tailwind CSS v4 + Framer Motion
* **Audio Engineering:** Microsoft Edge-TTS Neural Audio + Web Audio API Synthesis
* **Document Export:** jsPDF Vector Certificate Generation
* **Code Quality:** oxlint (0 errors, 0 warnings) + TypeScript strict mode

---

## NASA Space Apps Challenge Compliance

* [x] **Zero NASA Trademark Infringement:** Uses original custom SVG vector branding (`ORBITAL FORGE`) with zero protected NASA Meatball/Worm logos or seals.
* [x] **Global Evaluation Ready:** Defaults to **English (`en`)** upon first load, with instant one-click toggle to Spanish (`es`).
* [x] **7-Slide Pitch Deck Included:** Official presentation formatted for judges: [Google Slides Presentation](https://docs.google.com/presentation/d/1ejXNJ8t49zhaHaehOjhdB-dRM18XtCkie2YK6UbFXkQ/edit?slide=id.p7#slide=id.p7).
* [x] **Super Intelligence (AI) Disclosure:** Formally discloses generative AI assistance for software scaffolding and asset styling, while all scientific equations and orbital mechanics are deterministic human-verified aerospace standards.
* [x] **Open Data Citations:** Integrates 18 verified datasets and standards from NASA JPL, NASA Ames, NASA GSFC, and the Canadian Space Agency (CSA).
* [x] **100% Public Access:** Live production deployment on Vercel with zero passwords, login gates, or paywalls.

---

## Local Development & Testing

```bash
# 1. Clone the repository
git clone https://github.com/xthehugo/nasa-mission-game.git
cd nasa-mission-game

# 2. Install dependencies
npm install

# 3. Run the automated NASA physics test suite (12 test cases)
npm test

# 4. Start the local development server (http://localhost:5173)
npm run dev

# 5. Execute production build and linting verification
npm run lint
npm run build
```

---

# 🇪🇸 Resumen en Español

## ¿Qué es ORBITAL FORGE?

**ORBITAL FORGE** es un simulador web interactivo y bilingüe (`EN/ES`) de diseño y concurrent engineering de misiones espaciales para el **NASA Space Apps Challenge 2026**. Permite a estudiantes, universitarios e ingenieros experimentar de forma directa los compromisos de diseño (**SWaP-C**: Tamaño, Peso, Potencia, Costo y Térmica) gobernados por las metodologías oficiales de la NASA.

El jugador formula misiones científicas en LEO, GEO, Luna, Marte, el Punto $L_2$ Sol-Tierra y Júpiter, balanceando 7 subsistemas espaciales, superando la estricta compuerta de revisión **MCR (márgenes $\ge 35\%$)** y piloteando la nave a través de fases de vuelo con **dilemas de crisis operacionales en tiempo real**.

---

## Alineación con la Metodología NASA

1. **Los 4 Segmentos de Misión (Julie Levri, SmallSat Institute):**
   * *Segmento de Lanzamiento:* Envolvente de cofia y masa máxima a órbita.
   * *Segmento Espacial:* Bus satelital, cargas útiles científicas y subsistemas.
   * *Segmento Terreno:* Estaciones terrestres, red NSN y antenas DSN de 34m/70m.
   * *Segmento de Usuario:* Investigadores, objetivos científicos y retorno de datos.
2. **Ciclo de 6 Pasos de Ingeniería de Sistemas:**
   * 1. Metas $\rightarrow$ 2. ConOps $\rightarrow$ 3. Requisitos $\rightarrow$ 4. Diseño (Trade Space) $\rightarrow$ 5. Construcción y Verificación (MCR) $\rightarrow$ 6. Operaciones de Vuelo.
3. **Niveles de Madurez de Concepto de JPL (CML 1 a CML 5):**
   * Progresión rigurosa desde la idea inicial (*Cocktail Napkin*) hasta la congelación del diseño (*Point Design*) y la compuerta institucional MCR.

---

## Características y Modo Dual

* **Modo Cadete (Escolares y Principiantes):** Analogías sencillas, guía paso a paso del Comandante Frank Vega y tarjetas cian de seguridad.
* **Modo Ingeniero JPL (Universitarios y Especialistas):** Fórmulas físicas en KaTeX, telemetría completa en dB/W/kg, verificación de normas **GSFC-STD-1000** y **NASA-STD-5001B**.
* **6 Misiones Científicas Reales:** BioNutrients-2 (ISS/LEO), TRACERS Tandem (SSO), GOES Weather (GEO), Lunar Trailblazer & PUNCH (Luna), JWST & CSA FGS ($L_2$) y Europa Clipper (Júpiter).
* **5 Dilemas de Crisis en Vuelo:** Tormentas solares CME, eclipses térmicos profundos, atenuación por lluvia en DSN, atascamiento de antenas y desaturación RCS.
* **Gemini Space Master (Google AI Studio):** Auditoría de telemetría en tiempo real y generación procedural con Gemini 2.5 Flash.
* **Audio Neural Dual & Diplomas en PDF:** Voces Edge-TTS sincronizadas y generación de Diplomas de Honor NASA vectoriales en PDF listos para imprimir.
* **Presentación Oficial (7 Diapositivas para el Jurado):** [Ver en Google Slides](https://docs.google.com/presentation/d/1ejXNJ8t49zhaHaehOjhdB-dRM18XtCkie2YK6UbFXkQ/edit?slide=id.p7#slide=id.p7)

---

## Validación Científica GMAT

El motor físico de ORBITAL FORGE es completamente determinista y ha sido verificado cruzadamente contra la herramienta oficial **NASA General Mission Analysis Tool (GMAT R2026a)**:
* La transferencia geostacionaria (`dest-geo`) replica con exactitud los $\mathbf{3,673\text{ m/s}}$ del benchmark `Ex_HohmannTransfer` de la NASA.
* La suite de 12 pruebas unitarias automatizadas (`npm test`) garantiza el cumplimiento de la ecuación de Tsiolkovsky, ley solar $1/R^2$, presupuesto de enlace de Friis con pérdida positiva ($FSPL > 0$) y contingencias MGA por TRL.

---

## Puesta en Marcha Local

```bash
# Instalar dependencias
npm install

# Correr las 12 pruebas del motor físico
npm test

# Iniciar servidor local (http://localhost:5173)
npm run dev

# Compilar para producción y verificar linter
npm run lint
npm run build
```

---

# 📚 Documentation Deep Dives (`docs/`)

Para un análisis detallado de cada componente técnico, consulta los documentos de ingeniería en la carpeta `docs/`:

1. [ARQUITECTURA_Y_CONTRATO.md](./docs/ARQUITECTURA_Y_CONTRATO.md) — Contrato de tipos TypeScript, estructura de componentes y flujo de datos reactivo.
2. [ESQUEMA_DATOS_Y_CATALOGO.md](./docs/ESQUEMA_DATOS_Y_CATALOGO.md) — Especificación exhaustiva de los 24 subsistemas, destinos orbitales y estaciones terrenas.
3. [NASA_SPEC.md](./docs/NASA_SPEC.md) — Formulación matemática de las ecuaciones físicas, estándares GSFC-STD-1000 y reglas GOLD.
4. [FUENTES_OFICIALES_Y_TRAZABILIDAD.md](./docs/FUENTES_OFICIALES_Y_TRAZABILIDAD.md) — Trazabilidad de las 18 fuentes oficiales de NASA y CSA.
5. [GUIA_HACKATHON_Y_ENTREGABLES.md](./docs/GUIA_HACKATHON_Y_ENTREGABLES.md) — Resumen de rúbrica, estructura de pitch de 7 diapositivas y textos para el formulario de entrega.
6. [BITACORA_Y_DECISIONES.md](./docs/BITACORA_Y_DECISIONES.md) — Registro cronológico de Decisiones de Arquitectura (ADRs).

---

# 👥 Team & Acknowledgments

* **Systems Architecture & Physics Engine:** Hugo (`feat/engine`)
* **Educational UX, Audio & Frontend Engineering:** Jhonny (`Jhonny---UI-/-Estado`)
* **Aerospace Visualization, Storytelling & GMAT Verification:** Marcos (`feat/visuals`)

**Open Data Sources:**  
* NASA Science Mission Directorate (SMD) & SmallSat Institute  
* NASA Jet Propulsion Laboratory (JPL) Concept Maturity Levels  
* NASA Goddard Space Flight Center (GSFC) Mission Design Lab  
* NASA General Mission Analysis Tool (GMAT R2026a, GSC-19468-1)  
* Canadian Space Agency (CSA) Open Educational Resources  

---

<div align="center">
<b>ORBITAL FORGE // NASA Space Apps Challenge 2026</b><br>
<i>"Per Aspera Ad Astra — Forging Infallible Spacecraft, Bolt by Bolt."</i>
</div>
