# ORBITAL FORGE — NASA Space Mission Design Lab (`Space Apps 2026`)

> **Interactive Space Mission Design & Concurrent Engineering Simulator** grounded in NASA JPL Concept Maturity Levels (**CML 1–5**), NASA SmallSat Institute mission architecture, **NASA GMAT R2026a**, and Canadian Space Agency (**CSA**) open educational data.

**Repository:** `https://github.com/xthehugo/nasa-mission-game`
**Challenge:** NASA Space Apps Challenge 2026 — *Space Mission Design Game ("The Next Frontier")*

---

## Base de Conocimiento del Equipo (`docs/`) — Leer Primero

Toda la documentación, especificaciones científicas, IDs exactos y reglas de entrega están centralizados aquí en GitHub (sin requerir herramientas externas):

1. **[Arquitectura y Contrato Compartido](./docs/ARQUITECTURA_Y_CONTRATO.md)** — División por carpetas/ramas, flujo CML 1–5, ejemplos TypeScript para importar desde `src/engine/`, guía visual para `dest-geo` (elipse Hohmann GMAT) y reglas de código limpio.
2. **[Esquema de Datos y Catálogo Completo](./docs/ESQUEMA_DATOS_Y_CATALOGO.md)** — Diagrama ER y referencia exacta de los **5 destinos orbitales**, **4 objetivos científicos**, **22 subsistemas SWaP-C**, **4 estaciones terrenas**, **4 presets ganadores** y los **3 dilemas de crisis en vuelo**.
3. **[Especificación Científica NASA (`NASA_SPEC.md`)](./docs/NASA_SPEC.md)** — Ecuaciones físicas exactas (Tsiolkovsky, irradiancia solar $1/R^2$, eclipse EPS, Link Budget CCSDS en dB, CBE + MGA por TRL, semáforo MCR $\ge 35\%$), validación cruzada con **NASA GMAT R2026a** y citación de fuentes abiertas.
4. **[Guía Oficial del Hackathon y Entregables](./docs/GUIA_HACKATHON_Y_ENTREGABLES.md)** — Reglas críticas de Space Apps 2026 (prohibición de logos NASA, inglés por defecto, AI disclosure, máx. 7 slides / video 30s), rúbrica de 6 criterios, borradores en inglés para el formulario y guía de mentores.
5. **[Bitácora y Decisiones (`ADR-001`)](./docs/BITACORA_Y_DECISIONES.md)** — Registro de decisiones arquitectónicas y avances verificados del repositorio.

---

## Estructura del Proyecto y Ramas por Rol

| Rol | Rama Git | Carpeta Exclusiva | Estado Actual |
| :--- | :--- | :--- | :--- |
| **Persona 1:** Systems & Orbital Physics Engineer | `feat/engine` | `src/engine/`, `docs/` | Completado y fusionado en `main` (**11/11 tests pasando**, incluye benchmark GMAT `dest-geo`) |
| **Persona 2:** Educational UX & Mission Control Architect | `feat/ui` / `Jhonny---UI-/-Estado` | `src/components/`, `src/store/`, `src/App.tsx` | En desarrollo (sincronizar `git pull origin main` para consumir `src/engine/` y `dest-geo`) |
| **Persona 3:** Aerospace Visualization & Storytelling Lead | `feat/visuals` | `src/visuals/` | En desarrollo + corrida real **NASA GMAT R2026a** ya validada e integrada en `main` |
| **Contrato Compartido** | `main` | `src/types/mission.ts` | Congelado en `main` (cero `any`) |

---

## Guía Rápida para Sincronizar Tu Rama (Persona 2 y Persona 3)

Para bajar todos los documentos de `docs/`, el motor `src/engine/` y el destino `'dest-geo'` validado con GMAT sin pisar tu rama:

```bash
git fetch origin
git checkout main
git pull origin main
git checkout <tu-rama>
git merge main
```

---

## Stack Tecnológico y Comandos

- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4
- **Estado y Gráficas:** Zustand 5 + Recharts 3 + Framer Motion + Lucide Icons
- **Calidad:** `oxlint`, TypeScript estricto (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`), **11 pruebas automatizadas** en `src/engine/engine.test.ts` (`runEngineTestSuite()`).

```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo local (http://localhost:5173)
npm run dev

# Verificar tipos TypeScript y generar build de producción
npm run build

# Linter
npm run lint
```

---

## Aviso de Fuentes Abiertas y Transparencia de IA (Space Apps 2026)

- **Identidad Visual:** *ORBITAL FORGE* no utiliza ni modifica logotipos o emblemas oficiales de la NASA.
- **Fuentes Abiertas Citadas:** NASA JPL Concept Maturity Levels (`13-3547_A1b.pdf`), NASA SmallSat Institute (*Design and Develop Science Missions*), NASA CubeSat 101 (`nasa_csli_cubesat_101_508.pdf`), NASA Goddard Mission Design Lab (MDL), NASA Mission-Viz, **NASA General Mission Analysis Tool (GMAT R2026a)** y recursos educativos de la **Canadian Space Agency (CSA)**.
- **Transparencia de Super Intelligence (SI / AI):** El andamiaje de código y la documentación fueron acelerados con asistencia de IA; todas las fórmulas físicas, balances de masa/potencia/enlace y validación orbital GMAT fueron implementados de forma determinista y auditados manualmente en TypeScript.
