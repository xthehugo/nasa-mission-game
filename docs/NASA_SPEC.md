# Especificación Científica y Metodológica de la NASA (`NASA_SPEC.md`)

Documento de referencia oficial para el simulador **NASA Space Mission Design Game** (*Space Apps Challenge 2026 — "The Next Frontier"*). Consolida las metodologías, ecuaciones físicas, catálogos de ingeniería y criterios de revisión extraídos de documentación oficial de la NASA y JPL.

---

## 1. Integración del Flujo de 6 Pasos, los 4 Segmentos y los Niveles CML 1 a CML 5

El diseño de misiones científicas de la NASA se estructura en **6 pasos secuenciales**:
1. *Identify Need & Goals* (Identificar Necesidades y Metas)
2. *Define Concept* (Definir Concepto)
3. *Define Requirements* (Definir Requisitos)
4. *Design* (Diseño)
5. *Build & Verify* (Construcción y Verificación)
6. *Implement* (Implementación y Operación)

Toda misión articula simultáneamente **4 segmentos fundamentales**:
* **User Segment:** Investigadores, pregunta científica rectora, parámetros clave (KPP) y productos de datos.
* **Space Segment:** Plataforma espacial, carga útil (*payload*) y subsistemas de vuelo.
* **Launch Segment:** Vehículo lanzador, envolvente de cofia (*fairing*) y dispensadores.
* **Ground Segment:** Estaciones terrestres, Deep Space Network (DSN) y centros de control.

```text
+---------------------------------------------------------------------------------------------------------+
|                                        PROGRESIÓN DEL JUEGO                                             |
|                                                                                                         |
|   Fase 1 (CML 1)        Fase 2 (CML 2)        Fase 3 (CML 3)        Fase 4 (CML 4)        Fase 5 (CML 5)|
|  "Cocktail Napkin"    "Initial Feasibility"    "Trade Space"        "Point Design"      "Baseline Concept"
|  Paso 1: Need&Goals     Paso 2: Concept       Paso 3: Requirements    Paso 4: Design     Puerta: MCR Review |
+---------------------------------------------------------------------------------------------------------+
```

### Fases del Juego (CML 1 – CML 5 + Simulación)
* **Fase 1 (`CML_1` — Cocktail Napkin):** Definición de disciplina científica (*Earth Science, Heliophysics, Planetary Science, Astrophysics*) y pregunta científica rectora.
* **Fase 2 (`CML_2` — Initial Feasibility):** Selección de destino orbital, presupuesto base y red terrestre; estimación física de primer orden ($\pm 50\%$).
* **Fase 3 (`CML_3` — Trade Space):** Exploración iterativa de compromisos SWaP-C entre los **7 subsistemas** (*Payload, Propulsion, EPS, Telecom, Thermal, ADCS, Launch Vehicle*).
* **Fase 4 (`CML_4` — Point Design):** Congelamiento de arquitectura estilo JPL Team X / GSFC MDL ($\pm 25\%$ fidelidad), cálculo completo de $\text{CBE}$, $\text{MGA}$, $\Delta V$, balance energético y Link Budget.
* **Fase 5 (`CML_5` — Baseline Concept / MCR):** Revisión semafórica contra los márgenes institucionales de la NASA ($\ge 35\%$ Verde, $25\text{–}34\%$ Amarillo, $< 25\%$ Rojo). Si reprueba, retorna al bucle de **Trade Space (`CML_3`)**.
* **Fase 6 (`SIMULATION` — Build, Verify & Implement):** Simulación de lanzamiento, inserción orbital, crucero, operaciones científicas y descarga de datos con eventos y anomalías ligadas a los márgenes y TRL elegidos.

---

## 2. Tabla de Subsistemas SWaP-C y Compromisos Reales (*Trade-Offs*)

| Subsistema | Opciones de Diseño Típicas | Masa (*Weight*) | Potencia (*Power*) | Costo (*Cost*) | Volumen (*Size*) | Riesgo (*Risk*) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Instrumentos Científicos (*Payload*)** | Sensores ópticos, espectrómetros IR, radares SAR activos | Mayor resolución/apertura dispara masa estructural | Cargas activas (radar) demandan cientos de W; pasivas poco consumo | Bajo TRL (<6) o sin herencia multiplica costo | Lentes y reflectores dominan el volumen interno | Si falla o tiene bajo TRL, compromete la ciencia primaria |
| **Propulsión** | Gas Frío ($N_2$), Química (Monoprop/Biprop), Eléctrica (Hall/Ion) | Química exige alta masa de propelente; Eléctrica ahorra propelente por alto $I_{sp}$ | Química casi 0 W; Eléctrica exige kW continuos | Motores iónicos/criogénicos son costosos frente a gas frío | Tanques y toberas ocupan gran volumen central | Propelentes tóxicos/hipergólicos o fallas en válvulas |
| **Potencia (EPS)** | Paneles fijos en cuerpo, Desplegables 2-ejes, RTG | Desplegables y baterías añaden masa seca; RTG es pesado | Genera toda la energía; RTG no depende del Sol | Celdas triple-unión y RTG elevan mucho el presupuesto | Mecanismos desplegables y baterías son críticos en cofia | Fallo mecánico de despliegue o degradación por radiación |
| **Comunicaciones (Telecom)** | UHF / Banda S, Banda X / Ka, Enlace Óptico Láser | Antenas parabólicas y mástiles añaden masa | Amplificadores TWTA demandan picos elevados de potencia | Espacio profundo y terminales ópticos tienen costo alto | Reflectores requieren volumen de despliegue | Haces estrechos (Ka/láser) exigen apuntamiento ultrapreciso |
| **Control Térmico (TCS)** | Pasivo (MLI/Pinturas), Activo (Calentadores), Fluido/Criorefrigerador | MLI ligero; criorefrigeradores y bucles pesan mucho | Pasivo 0 W; calentadores y criorefrigeradores penalizan EPS | Pasivo muy barato; criogénico muy costoso | Radiadores requieren gran área expuesta | Sobrecalentamiento electrónico o congelación de propelente |
| **ADCS** | Gradiente gravitatorio/Spin, 3-Ejes (Ruedas + Star Tracker), RCS Gas Frío | Actuadores 3-ejes tienen masa media/alta | Ruedas de reacción y sensores consumen potencia continua | Star Trackers de arco-segundo son costosos | Concentrados cerca del centro de gravedad | Saturación de momento o pérdida de apuntamiento |
| **Vehículo de Lanzamiento (Launch)** | Rideshare CubeSat, Lanzador Dedicado Pequeño, Lanzador Medio/Pesado | Impone el límite absoluto de masa húmeda ($M_{wet}$) | Interfaz umbilical previa al despegue | Principal conductor del costo programático | Cofia (*fairing*) fija volumen máximo | Retrasos de manifiesto, vibraciones e inserción errónea |

---

## 3. Ecuaciones Físicas del Motor (`src/engine/physics.ts`)

### A. Ecuación del Cohete de Tsiolkovsky
$$g_0 = 9.80665 \text{ m/s}^2$$
$$\Delta V = I_{sp} \cdot g_0 \cdot \ln\left(\frac{m_{wet}}{m_{dry}}\right)$$
$$m_{wet} = m_{dry} \cdot \exp\left(\frac{\Delta V}{I_{sp} \cdot g_0}\right), \qquad m_{prop} = m_{wet} - m_{dry}$$

Valores típicos de $I_{sp}$: Gas frío $65\text{–}75\text{ s}$, Monoprop $220\text{–}240\text{ s}$, Biprop $310\text{–}325\text{ s}$, Eléctrica Hall/Ion $1500\text{–}3200\text{ s}$.

### B. Balance de Potencia Solar y Margen EPS
$$S(R) = \frac{1361 \text{ W/m}^2}{R^2}$$
$$P_{gen} = S(R) \cdot A_{panel} \cdot \eta_{cell} \cdot \cos(\theta_{sun}) \cdot \eta_{path} \cdot (1 - \delta_{deg})^{T_{yr}}$$
Con fracción de eclipse $f_{ecl} = T_{ecl} / T_{orb}$ y eficiencias de batería $\eta_{chg} = \eta_{dis} = 0.90$:
$$P_{gen, req} = \frac{P_{sun} \cdot (1 - f_{ecl}) + \frac{P_{ecl} \cdot f_{ecl}}{\eta_{dis}}}{\eta_{chg} \cdot (1 - f_{ecl})}$$
$$\text{Margen EPS (\%)} = \left(\frac{P_{gen} - P_{load, tx}}{P_{gen}}\right) \times 100$$

### C. Presupuesto de Enlace (*Link Budget* en dB)
$$\left[\frac{E_b}{N_0}\right] = \text{EIRP} + L_{fs} + L_{atm} + \left[\frac{G_{rx}}{T_{sys}}\right] - (-228.6) - 10\log_{10}(R_{data})$$
$$L_{fs} = -20\log_{10}(d_{metros}) - 20\log_{10}(f_{Hz}) - 147.55$$
$$\text{Link Margin (dB)} = \left[\frac{E_b}{N_0}\right]_{recibido} - \left[\frac{E_b}{N_0}\right]_{requerido}$$
* **Umbrales JPL CML 4:** $\ge 6\text{ dB}$ (LEO / Proximidad) y $\ge 3\text{ dB}$ (Espacio Profundo / DSN).

### D. Jerarquía de Recursos NASA (CBE, MGA, Predicted, Margin) y Semáforo MCR
1. $M_{CBE} = \sum m_{i, nominal}$
2. $M_{MGA} = \sum (m_{i, nominal} \cdot c_i)$ según TRL:
   * **TRL 8–9:** $c_i \approx 0.08$ (5%–10%)
   * **TRL 6–7:** $c_i \approx 0.18$ (15%–20%)
   * **TRL 4–5:** $c_i \approx 0.32$ (30%–35%)
   * **TRL 1–3:** $c_i \approx 0.45$ (40%–50%)
3. $M_{pred} = M_{CBE} + M_{MGA}$
4. $\text{Margen (\%)} = \left(\frac{M_{allow} - M_{pred}}{M_{pred}}\right) \times 100$

* **Semáforo MCR (CML 4 / CML 5):**
  * 🟢 **GREEN:** Margen $\ge 35\%$
  * 🟡 **YELLOW:** $25\% \le \text{Margen} < 35\%$
  * 🔴 **RED:** $\text{Margen} < 25\%$ o $M_{wet} > \text{Capacidad del Lanzador}$

---

## 4. Catálogo Numérico de Referencia

### A. Subsistemas (Resumen de Valores Base)
* **Payload:** Imager Multiespectral (`3.5 kg`, `8 W`, `$4.2M`, `3U`, `TRL 9`), Espectrómetro IR Criogénico (`18 kg`, `45 W`, `$22M`, `16U`, `TRL 6`), Radar SAR Banda L (`120 kg`, `850 W`, `$95M`, `0.65 m³ / 650U`, `TRL 5`).
* **Propulsión:** Gas Frío $N_2$ (`2.8 kg`, `3 W`, `$0.8M`, `1.5U`, `TRL 9`, `Isp 68 s`), Biprop MMH/NTO (`24 kg`, `25 W`, `$12M`, `80U`, `TRL 8`, `Isp 315 s`), Hall Xenón BHT-600 (`14.5 kg`, `600 W`, `$16.5M`, `40U`, `TRL 6`, `Isp 1750 s`).
* **EPS:** Paneles Fijos (`1.2 kg`, `28 W @ 1 AU`, `$0.4M`, `TRL 9`), Desplegables 2-Ejes (`7.5 kg`, `350 W @ 1 AU`, `$3.5M`, `4U`, `TRL 7`), Next-Gen RTG (`42 kg`, `110 W const.`, `$85M`, `250U`, `TRL 6`).
* **Telecom:** Transpondedor UHF/S (`0.9 kg`, `12 W`, `$0.3M`, `0.5U`, `TRL 9`), Banda X/Ka + Parabólica 1m (`9.8 kg`, `85 W`, `$7.8M`, `6U`, `TRL 8`), Terminal Óptica Láser (`14 kg`, `110 W`, `$28M`, `35U`, `TRL 5`).
* **Thermal:** Pasivo MLI (`2.1 kg`, `0 W`, `$0.2M`, `TRL 9`), Activo Calentadores (`4.5 kg`, `35 W`, `$1.1M`, `TRL 8`), Fluido Bombeado + Criorefrigerador (`22 kg`, `140 W`, `$15M`, `60U`, `TRL 6`).
* **ADCS:** Gradiente Gravitatorio + Torquers (`1.5 kg`, `2 W`, `$0.5M`, `1U`, `TRL 9`), 3-Ejes Ruedas + Star Tracker (`5.8 kg`, `18 W`, `$3.8M`, `2.5U`, `TRL 8`), RCS Gas Frío (`8 kg`, `8 W`, `$2.2M`, `3U`, `TRL 9`).
* **Lanzadores:** Rideshare LEO (`$0.35M`, estándar CubeSat), Dedicado Pequeño Electron (`$7.5M`), Medio/Pesado Falcon 9 / Atlas V (`$65M`).

### B. Destinos Orbitales de Referencia
* **LEO (500 km):** `1.00 AU`, $\Delta V \approx 150\text{ m/s}$, $S = 1361\text{ W/m}^2$, $f_{ecl} \approx 0.37$, retardo `2–8 ms`, Commercial/Near Earth GN.
* **Órbita Lunar:** `1.00 AU`, $\Delta V \approx 3950\text{ m/s}$, $S = 1361\text{ W/m}^2$, eclipses lunares largos, retardo `1.28 s`, GN gran apertura o DSN 34m.
* **Órbita de Marte:** `1.52 AU`, $\Delta V \approx 4500\text{ m/s}$, $S \approx 589\text{ W/m}^2$, retardo `4.3–21 min`, DSN 34m / 70m.
* **Júpiter / Espacio Profundo:** `5.20 AU`, $\Delta V \approx 6800\text{ m/s}$, $S \approx 50.3\text{ W/m}^2$, retardo `33–53 min`, DSN 70m obligatorio.

---

## 5. Fuentes Oficiales de la NASA (Para Citación de Datos Abiertos)
1. **JPL / NASA Concept Maturity Levels (CML):** Wessen, R. R., Borden, C., Ziemer, J., Kwok, J. — *Space Mission Concept Development Using Concept Maturity Levels* (JPL / California Institute of Technology, `13-3547_A1b.pdf`).
2. **NASA SmallSat Institute (2025):** Levri, J. — *Design and Develop Science Missions* (`Access to Space for All Systems Engineering Webinar Series`, `250323-design-and-develop-science-mission.pdf`).
3. **NASA CubeSat Launch Initiative:** *CubeSat 101: Basic Concepts and Processes for First-Time CubeSat Developers* (`nasa_csli_cubesat_101_508.pdf`).
4. **NASA Goddard Integrated Design Center (MDL):** `https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/`
5. **NASA General Mission Analysis Tool (GMAT R2026a):** `https://sourceforge.net/projects/gmat/`
6. **NASA Mission-Viz Trade-Space Explorer:** `https://nasa.github.io/mission-viz/` (`https://github.com/nasa/mission-viz`)
7. **NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev 2).**
