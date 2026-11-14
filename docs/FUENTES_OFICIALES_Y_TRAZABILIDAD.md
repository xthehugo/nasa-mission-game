# Trazabilidad de Fuentes Oficiales, Estándares NASA/CSA y Datos Externos (`FUENTES_OFICIALES_Y_TRAZABILIDAD.md`)

Documento de trazabilidad científica e ingeniería para **ORBITAL FORGE — Space Mission Design Lab** (*NASA Space Apps Challenge 2026*). Registra cómo se integran los documentos oficiales del reto, los catálogos **NASA Small Spacecraft Technology State of the Art (SSRI SoA)**, los estándares institucionales (**NASA/SP-2016-6105**, **GSFC-STD-1000 GOLD Rules**, **NASA-STD-5001**), los manuales de comunicaciones (**DSN 810-005**, **NSN**) y las simulaciones astrodinámicas (**NASA GMAT**) dentro del motor determinista y catálogo del simulador.

---

## 1. Matriz de Trazabilidad Técnica (Fuente Oficial → Modelo en Simulador)

| Dominio / Regla | Fuente Oficial Verificada | Parámetro / Estándar de Referencia | Cómo se Implementa en el Simulador |
| :--- | :--- | :--- | :--- |
| **Ciclo CML 1–5 & Gate MCR** | NASA JPL Concept Maturity Levels + `NPR 7120.5F` + `NASA/SP-2016-6105 Rev 2` | Evolución progresiva *Cocktail Napkin* (`CML 1`) → *Initial Feasibility* (`CML 2`) → *Trade Space* (`CML 3`) → *Point Design* (`CML 4`) → *MCR Baseline* (`CML 5`, margen verde $\ge 35\%$) | Fases `CML_1` a `CML_5` en `App.tsx`, `uiSlice.ts` y `MCRReviewGate.tsx` con retorno iterativo al *Trade Space*. |
| **Catálogo SWaP-C + TRL & MGA** | NASA SSRI *Small Spacecraft Technology SoA* (Ch. 3, 4, 5, 7, 9, 10) + `NASA/SP-2016-6105` | $\text{MEV} / \text{Predicted} = \text{CBE} + \text{MGA}(\text{TRL})$: TRL 8–9 ($\approx 8\%$), TRL 6–7 ($18\%$), TRL 4–5 ($32\%$), TRL 1–3 ($45\%$). Factores estructurales `NASA-STD-5001` (`1.40` carga última) | `SUBSYSTEM_CATALOG` (24 ítems en 7 categorías) y `getMGAContingencyByTRL(trl)` en `src/types/mission.ts` + `src/engine/catalog.ts`. |
| **Propulsión Química, Verde (HAN) y Eléctrica** | NASA SSRI SoA Ch. 4 (*In-Space Propulsion*) | Gas Frío ($\sim 68\text{–}70\text{ s}$), Monopropelente Verde HAN / AF-M315E ($I_{sp} = 250\text{ s}$, alta densidad y menor toxicidad), Bipropelente MMH/NTO ($315\text{ s}$), Eléctrico Hall ($1,750\text{ s}$) | `prop-cold-gas` (`68 s`), **`prop-han-green` (`250 s`, `MONOPROP`, TRL 8)**, `prop-biprop` (`315 s`), `prop-hall` (`1,750 s`) con ecuación de Tsiolkovsky en `physics.ts`. |
| **Potencia EPS, Degradación Solar $1/R^2$ / LILT y RTG** | NASA SSRI SoA Ch. 3 (*Power*) | Caída de flujo solar $S(R) = 1361 / R^2$, penalización de eficiencia por distancia/eclipses, RTG independiente del Sol y reserva eléctrica (`GSFC-STD-1000` $\ge 30\%$ / puerta MCR $\ge 35\%$) | `evalPowerBalance` en `physics.ts` calculando irradiancia en Marte ($589\text{ W/m}^2$) y Júpiter ($50.3\text{ W/m}^2$), recarga en eclipse y salida constante de `eps-rtg`. |
| **Control Térmico & Supervivencia** | NASA SSRI SoA Ch. 7 (*Thermal Control*) | Mantas MLI/recubrimientos pasivos (`0 W`), calentadores termostáticos activos en lazo cerrado y bucles bombeados/criorefrigeradores | `therm-passive`, `therm-active`, `therm-cryo` más crisis en vuelo `crisis-eclipse-thermal`. |
| **ADCS / GNC & Apuntamiento Fino** | NASA SSRI SoA Ch. 5 (*GNC*) + CSA JWST FGS (`#16972`) | Contraste entre magnetorquers/gradiente LEO ($\pm 5^\circ$), RCS ágil ($0.25^\circ$) y ruedas de reacción + *Star Trackers* ($0.02^\circ$) heredados de exploración L2/espacio profundo | `adcs-gravity`, `adcs-rcs`, `adcs-3axis` acoplados al presupuesto de enlace (`-18.0 dB` de pérdida por desalineación de apuntamiento). |
| **Comunicaciones DSN / NSN & Link Budget** | JPL `810-005` Módulos `101H` (70 m) y `104O` (34 m BWG) + NASA `NSN Services Brochure (2025)` | Escalamiento S/X/Ka-Band y Óptico entre estaciones comerciales (`G/T = 14 dB/K`), Near Space Network (`28 dB/K`), DSN 34 m (`50 dB/K`) y DSN 70 m (`62 dB/K`) | `GROUND_STATIONS` y cálculo FSPL + atenuación atmosférica + `Eb/N0` en `physics.ts` + dilema `crisis-downlink-rain`. |
| **Astrodinámica & Transferencia GEO** | NASA `GMAT R2026a` (`GSC-19468-1`) | Benchmark `Ex_HohmannTransfer` LEO $\rightarrow$ GEO (`35,786 km`): $\Delta V_{TOI} = 2,240\text{ m/s} + \Delta V_{GOI} = 1,433\text{ m/s} = \mathbf{3,673\text{ m/s}}$ | Destino `'dest-geo'` validado en `engine.test.ts` (Test #11) y misión `'obj-geo-goes-weather'` en GEO. |
| **Estándares de Fiabilidad & Reglas GOLD / CSLI** | `GSFC-STD-1000 Rev H` (Regla `1.05` anti-SPF) + NASA CubeSat 101 | Eliminación de fallas de punto único (*Single Point Failure*), pruebas vibración/TVAC/DITL e inhibición RF previa al lanzamiento ($\ge 30\text{ min}$) | Checklist obligatorio `VVTestingCard.tsx` (`vibration`, `thermalVacuum`, `batteryUL`, `dayInTheLife`, `rfInhibitTimerMin >= 30`, `rbfPins`). |

---

## 2. Benchmarks Reales de Misiones Científicas (5 Objetivos · 24 Subsistemas)

| Objetivo / Preset en Simulador | Misión Real de Referencia | Fuente Primaria | Datos Reales / Validación |
| :--- | :--- | :--- | :--- |
| **`obj-earth-bionutrients`** (LEO · `150 m/s`) | **NASA BioNutrients-2 & PACE** | `NTRS 20250009253` + NASA Earth | SmallSat/CubeSat en LEO con carga óptica ligera (`26 kg`, `45 W`, `$18M`) y lanzamiento compartido *rideshare*. |
| **`obj-geo-goes-weather`** (GEO · `3,673 m/s`) | **NOAA/NASA GOES-U & NASA TRACERS** | `TRACERS Press Kit` + `GMAT R2026a` + NOAA | Monitoreo continuo de clima espacial con **Magnetómetro Fluxgate (`pay-magnetometer`)**, transferencia GEO `3,673 m/s` y enlace NSN Banda Ka. |
| **`obj-helio-lunar-trailblazer`** (Luna · `3,950 m/s`) | **NASA Lunar Trailblazer & PUNCH** | `LTB_PressKit_finalR.pdf` + `science.nasa.gov/mission/punch` | Orbitador polar compacto (~`200–210 kg`, `280 W`, ratio científico ~`10%`) con espectrómetro IR HVM3 e inserción lunar de alto $\Delta V$. |
| **`obj-mars-reconnaissance`** (Marte · `4,500 m/s`) | **NASA Mars Reconnaissance Orbiter (MRO)** | `MRO Launch Press Kit` | Misión pesada a `1.52 AU` (`2,180 kg`, `1,500 W`) con radar SAR, control criogénico, ADCS 3-ejes y enlace DSN 34 m. |
| **`obj-jupiter-clipper`** (Júpiter · `6,800 m/s`) | **NASA Europa Clipper & JWST / CSA FGS** | `europa.nasa.gov` + `CSA Image #16972` | Operación a `5.20 AU` (`3.7%` de luz solar terrestre, LILT) exigiendo energía RTG independiente del Sol, alta protección térmica/radiación y DSN 70 m. |

---

## 3. Lista Depurada de 18 URLs Oficiales Verificadas (Lista para NotebookLM)

Copia y pega este bloque en **NotebookLM → Añadir fuente → Sitio web** (una URL por línea):

```text
https://www.nasa.gov/wp-content/uploads/2025/02/7-soa-thermal-2024.pdf
https://www.nasa.gov/wp-content/uploads/2025/02/3-soa-power-2024.pdf
https://www.nasa.gov/wp-content/uploads/2025/02/5-soa-gnc-2024.pdf
https://www.nasa.gov/wp-content/uploads/2025/02/9-soa-communications-2024.pdf
https://www.nasa.gov/wp-content/uploads/2024/02/10.soa-launch-2023.pdf
https://explorers.larc.nasa.gov/2023APPROBE/pdf_files/NASA04.%20SysEng%20Handbook%20(NASA_SP-2016-6105%20Rev%202).pdf
https://standards.nasa.gov/sites/default/files/standards/GSFC/H/0/GSFC-STD-1000RevH_Approved.pdf
https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-2/2/Historical/nasa-std-5001.pdf
https://deepspace.jpl.nasa.gov/dsndocs/810-005/101/101H.pdf
https://deepspace.jpl.nasa.gov/dsndocs/810-005/104/104O.pdf
https://www.nasa.gov/wp-content/uploads/2025/08/nsn-services-brochure.pdf
https://software.nasa.gov/software/GSC-19468-1
https://assets.science.nasa.gov/content/dam/science/missions/lunar-trailblazer/pdfs/LTB_PressKit_finalR.pdf
https://assets.science.nasa.gov/content/dam/science/missions/tracer/TRACERS%20Press%20Kit.pdf
https://www.asc-csa.gc.ca/eng/multimedia/search/image/16972
https://ntrs.nasa.gov/api/citations/20250009253/downloads/2025-09_SpaceMicrobialBiotechnology_Settles.pdf
https://science.nasa.gov/resource/mars-reconnaissance-orbiter-launch-press-kit/
https://science.nasa.gov/mission/punch/
```
