# Bitácora Técnica y Decisiones de Arquitectura (ADRs)

Registro histórico del desarrollo de **ORBITAL FORGE** y decisiones arquitectónicas compartidas para trazabilidad del equipo y del jurado.

---

## ADR-001: Arquitectura Modular por Contrato Único y Progresión CML 1–5

- **Estado:** Aceptado (2026-11-14)
- **Decisores:** Equipo de 3 (**Persona 1:** Engine & Docs, **Persona 2:** UI & State, **Persona 3:** Visuals & GMAT/Pitch)

### Contexto y Problema
Un equipo de 3 desarrolladores dispone de menos de 48 horas en el **NASA Space Apps Challenge 2026** para construir un juego interactivo de diseño y simulación de misiones espaciales sin conflictos de merge en Git, manteniendo rigor científico verificable (*Validez*) y una interfaz educativa intuitiva (*Pertinencia* e *Impacto*).

### Decisión
1. **Arquitectura Frontend-First modular por carpetas** regida por un único contrato estricto de tipos (`src/types/mission.ts`) en `main` que separa:
   - `src/engine/` — lógica física determinista y catálogo puro (sin UI),
   - `src/components/` y `src/App.tsx` — dashboard interactivo, estado Zustand y gráficas Recharts,
   - `src/visuals/` — representación gráfica SVG orbital y blueprint de nave.
2. **Progresión del juego basada en los Concept Maturity Levels (CML 1–5) de JPL** y el flujo de 6 pasos / 4 segmentos (*User, Space, Launch, Ground*) de NASA SmallSat Institute.
3. **Evaluación semafórica MCR oficial:** $\text{CBE} + \text{MGA (por TRL)} = \text{Predicted}$ frente al límite permitido, aprobando con `GREEN` ($\ge 35\%$ de margen en masa seca y potencia) y exigiendo enlace $\ge 6\text{ dB}$ (LEO/GEO/Lunar) o $\ge 3\text{ dB}$ (Deep Space).
4. **Soporte bilingüe integrado (`LocalizedText`: `en` / `es`)** con `'en'` predeterminado para elegibilidad a Global Judging.

### Consecuencias
- **Positivas:** Trabajo paralelo real en 3 ramas con cero conflictos; demo 100% determinista sin fallos de red ni backend; alta trazabilidad científica respaldada por pruebas unitarias y GMAT.
- **Trade-off aceptado:** No se ejecuta un integrador numérico N-cuerpos en navegador en tiempo real; se usan presupuestos $\Delta V$ analíticos y validados con **NASA GMAT R2026a** (`dest-geo`) junto con las ecuaciones exactas de Tsiolkovsky, irradiancia $1/R^2$ y Link Budget CCSDS.

---

## Bitácora Cronológica de Desarrollo

### Hito 1 — Kick-off, Reglas Oficiales y Contrato Único (`main`, commits iniciales hasta `ad12b7f`)
- Creación del repositorio público `https://github.com/xthehugo/nasa-mission-game` con Vite + React 19 + TypeScript + Tailwind v4 + Zustand + Recharts + Framer Motion + Lucide Icons.
- Análisis completo de documentación oficial (*JPL CML `13-3547_A1b.pdf`*, *NASA SmallSat Institute `250323-design-and-develop-science-mission.pdf`*, *CubeSat 101 `nasa_csli_cubesat_101_508.pdf`*, grabación inaugural de 46m29s y guías oficiales 2026).
- Redacción de [NASA_SPEC.md](./NASA_SPEC.md) y del contrato compartido `src/types/mission.ts` incluyendo `ExperienceMode` (`'CADET' | 'JPL_ENGINEER'`), `RealWorldMissionBenchmark`, `FlightDirectorAdvice` e `InteractiveCrisisDilemma`.

### Hito 2 — Motor Físico Completo y Suite de 10 Tests (`feat/engine` + `main`, `356708e` -> `d1b3322`)
- Implementación de `src/engine/catalog.ts`, `src/engine/physics.ts`, `src/engine/simulation.ts` y `src/engine/index.ts`.
- Creación y ejecución de `src/engine/engine.test.ts` (**10/10 pruebas pasando**) cubriendo integridad bilingüe/TRL, aprobación `GREEN >= 35%` de los 4 presets reales, colapso exponencial por gas frío en Marte, caída solar $1/R^2$ vs. RTG en Júpiter (`5.20 AU`), pérdida de apuntamiento ADCS (`-17.7 dB`), escalado Commercial GN vs. DSN 70m, límites de cofia/presupuesto, trazabilidad científica de carga útil y aborto/calificación en crisis de vuelo.

### Hito 3 — Validación Cruzada con NASA GMAT R2026a (`0329c16`)
- Persona 3 ejecutó el script oficial **`Ex_HohmannTransfer`** en **NASA GMAT R2026a** (solver Differential Corrector `DC`, convergido en `12` iteraciones y `1.289 s`):
  - `TOI.Element1 = 2.24028397735 km/s` (`~2,240 m/s`)
  - `GOI.Element1 = 1.432966302 km/s` (`~1,433 m/s`)
  - $\Delta V_{\text{total}} = 3,673\text{ m/s}$
- Integración del destino **`dest-geo` (GEO · `35,786 km`)** en `src/engine/catalog.ts`.
- Adición del **Test #11** en `src/engine/engine.test.ts` confirmando coincidencia exacta con Tsiolkovsky (`71.3%` de fracción de propelente a $I_{sp}=300\text{ s}$ GMAT y `69.5%` con `prop-biprop` de `315 s`) — **11 / 11 tests pasando**.
- Documentación de la tabla de validación en Sección 4C y Fuente #8 de [NASA_SPEC.md](./NASA_SPEC.md).

### Hito 4 — Publicación Completa de Conocimiento en Git (`README.md` y `docs/`)
- Consolidación de toda la documentación de arquitectura, guía de integración, catálogo exacto de IDs, reglas del jurado y borradores de entrega directamente en `docs/` (Markdown estándar de GitHub) para acceso inmediato de todo el equipo sin depender de herramientas externas como Obsidian.
