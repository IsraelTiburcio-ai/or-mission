# OR MISSION — Centro de Operaciones y Toma de Decisiones

**Quinta y última actividad de la colección digital del Gimnasio 1 — Introducción a la Teoría de Sistemas** (materia **Optimización I**).

OR Mission es una **experiencia integradora final**: el estudiante deja de "observar una situación problemática" y aprende a *analizarla como un sistema, delimitarla y recorrer las etapas de la Investigación de Operaciones* para estructurar una posible solución.

> No es un quiz ni un examen disfrazado: cada fase tiene una mecánica real y las decisiones de una fase afectan a las siguientes.

---

## Propósito académico

El contenido se basa exclusivamente en la sección **1.6 INVESTIGACIÓN DE OPERACIONES** del Gimnasio 1:

- origen histórico (Inglaterra, Segunda Guerra Mundial, equipos interdisciplinarios, problemas militares);
- definición y promotores (C. W. Churchman, R. L. Ackoff, Richard Bellman);
- áreas de aplicación (programación lineal, no lineal, dinámica, entera, redes de optimización, simulación, inventarios, análisis de decisión, procesos estocásticos, teoría de colas, teoría de juegos, series de tiempo);
- **las ocho etapas** del proceso:

| # | Etapa | Mecánica del juego |
|---|-------|--------------------|
| 01 | **PROBLEMA** | Radar del problema: señales, contexto y ruido |
| 02 | **DEFINICIÓN** | Constructor del problema + define el alcance |
| 03 | **CONSTRUCCIÓN** | Mesa de construcción: nodos y relaciones |
| 04 | **MODELO** | Model builder: objetivo, decisiones, restricciones y datos |
| 05 | **VALIDACIÓN** | Cámara de validación: casos de prueba + escáner |
| 06 | **SOLUCIÓN** | Mesa de decisiones: alternativas y simulación |
| 07 | **RESULTADOS** | Panel antes vs. propuesta + interpretación |
| 08 | **IMPLEMENTACIÓN** | Plan, aplicación y evento post-implementación |

La experiencia integra además conocimientos previos de la colección: sistema, subsistemas, suprasistema, entorno, fronteras, mejoramiento, diseño, complejidad (`C = n + R`) y enfoque de sistemas (guiños a OptiQuest, System Lab, System Scope y Complexity Lab).

---

## Misiones

1. **M-01 Hora Pico** — Cafetería universitaria (colas).
2. **M-02 El Préstamo que se Acumula** — Biblioteca universitaria (colas).
3. **M-03 Entrega sin Pausa** — Sistema de entregas (viajes/capacidad).
4. **M-04 Sesiones de Laboratorio** — Universidad (espacios × bloques).
5. **M-05 Operación Campus** — Misión final: análisis del sistema + las ocho fases.

Los escenarios son ficticios, pequeños, coherentes y suficientes para decidir.

---

## Estructura del proyecto

```
or-mission/
├── index.html            # pantallas de la aplicación
├── README.md
├── css/                  # diseño (variables, base, layout, componentes,
│                         #   misiones, gráficas, animaciones, presentación,
│                         #   impresión, responsive)
├── js/
│   ├── app.js            # arranque y navegación inicial
│   ├── state.js          # estado central (misión continua)
│   ├── storage.js        # localStorage con versión
│   ├── audio.js          # efectos sonoros (Web Audio, sin archivos)
│   ├── ui.js             # íconos SVG, toasts, modales, foco
│   ├── charts.js         # gráficas SVG (barras, medidores, ruta)
│   ├── scoring.js        # puntuación, precisión, rangos
│   ├── achievements.js   # motor de logros
│   ├── simEngine.js      # motor determinista de simulación
│   ├── missionEngine.js  # motor de misiones (8 fases + estado)
│   ├── phaseRenderer.js  # interfaz de las 8 fases
│   └── screens.js        # home, intro, centro, archivos, registro, final
└── data/
    ├── achievements.js   # definición de logros
    ├── methods.js        # archivo de métodos (12 técnicas)
    ├── history.js        # archivo histórico (Gimnasio 1)
    ├── missions.js       # 4 misiones principales (datos)
    └── finalMission.js   # misión final Operación Campus
```

## Cómo funciona el motor

- **Data driven**: cada misión es un objeto de datos (`data/missions.js`); el motor la ejecuta. Para crear una nueva misión basta agregar un objeto con la misma forma y registrarlo en `OR.Missions.LIST`.
- **Estado central**: las decisiones de cada fase se guardan en `state.missions[<id>].state` (observaciones, definición, modelo, validaciones, solución, implementación) y se guardan en `localStorage`.
- **Simulación determinista**: los resultados provienen de reglas internas claras (tres tipos: `queue`, `trips`, `sessions`). **No se usa `Math.random()`** para determinar resultados académicos; cualquier aleatoriedad visual no afecta la respuesta.
- **Error productivo**: si el modelo omite una restricción, la validación muestra un "Resultado imposible" y permite volver a la fase anterior. No se castiga reiniciando.
- **Bucle de mejora**: tras la implementación, los "datos reales del escenario" permiten volver a validar y ajustar.

## Ejecución

Sin dependencias ni build:

```bash
# opción 1: abrir directamente
open index.html

# opción 2: servidor local
python3 -m http.server 8080
# abre http://localhost:8080
```

## Puntuación y rangos

| Acción | Puntos |
|--------|--------|
| Fase completada | +300 |
| Inconsistencia detectada | +150 |
| Validación al primer intento | +250 |
| Solución coherente con el objetivo | +300 |
| Misión completada | +500 |
| Pista usada | −30 |

Rangos: **OBSERVADOR → ANALISTA → ESTRATEGA → ESPECIALISTA EN OPERACIONES → MAESTRO DE DECISIONES**.

## Almacenamiento

Todo el progreso se guarda en `localStorage` (clave `orMission.save.v1`) con versionado (`saveVersion`): si una versión de guardado es incompatible, se descarta con seguridad sin romper la aplicación. Se guarda: nombre/alias, progreso, misión, fase, decisiones, puntuación, estadísticas, logros, tutorial y configuración.

## Modos

- **Misión**: flujo normal con puntuación y desbloqueo progresivo.
- **Modo analista** (revisión): repite misiones completadas y supera tus marcas (mejor puntuación y precisión).
- **Sala de análisis** (libre): recorre cualquier escenario sin puntuación, ideal para demostraciones.
- **Modo presentación**: desde el centro de operaciones. Oculta la puntuación, aumenta los textos y el panel central, y permite avanzar manualmente por etapas para proyectar en clase.

## Accesibilidad y plataformas

- Semántica HTML, ARIA, foco visible, `aria-live` para retroalimentación.
- `prefers-reduced-motion` respetado (las animaciones se sustituyen por fades).
- Responsive: desktop, tablet y móvil (360px+), interacciones táctiles (selección por toque; las relaciones se crean tocando origen → destino).
- Teclado: Tab, Enter, Espacio, Escape y flechas.
- Sin internet una vez cargado: los únicos recursos externos son las fuentes tipográficas de Google Fonts, con fallbacks locales.

## GitHub Pages

El proyecto es 100% estático: se publica directamente en GitHub Pages sin backend, base de datos ni claves. (Sube el contenido de la carpeta `or-mission` a la rama `gh-pages` o configura Pages desde `main`.)

## Cómo agregar una misión

1. Copia la forma de un objeto de `data/missions.js` (o `data/finalMission.js`).
2. Ajusta: `id`, `code`, `title`, `scenario`, `brief`, `chaos` (señales), `diagnosis` (frase), `problem` (5 bloques), `scope` (tarjetas dentro/fuera), `construction` (paleta y relaciones), `model` (objetivo, decisiones, restricciones —una marcada con `required: true`— y datos), `sim` (tipo y casos), `alternatives` (con `params` y `best`), `results` (conclusiones) e `implementation` (pasos y evento posterior).
3. Si deseas el bucle de mejora, agrega `postEvent.adjustedCase` con los datos reales del día.
4. Registra la misión en `OR.Missions.LIST` (el orden define el desbloqueo).

## Cómo funcionan los resultados

Cada tipo de simulación calcula métricas con aritmética clara y repetible:

- **queue**: capacidad por bloque = ⌊minutos/bloque ÷ minutos por persona⌋ × servidores; cola = llegadas acumuladas − atención; la espera máxima y la demanda atendida salen de ahí.
- **trips**: viajes = ⌈pedidos por zona ÷ capacidad⌉; rondas = ⌈viajes ÷ vehículos⌉; tiempo total = rondas × duración de ruta.
- **sessions**: sesiones necesarias = Σ sesiones por actividad; lugares = espacios × bloques; saturación = necesarias ÷ lugares.

Si el modelo no incluye su restricción clave, la simulación opera sin límite y produce un resultado imposible que contradice el escenario: ahí se aprende que **falta una restricción**.

---

## Nombre

**OR MISSION — Centro de Operaciones y Toma de Decisiones**

## Materia

**Optimización I** · Gimnasio 1 · Introducción a la Teoría de Sistemas

## Descripción

Experiencia integradora final de la colección digital del Gimnasio 1: el estudiante actúa como analista de operaciones, recibe situaciones caóticas y las convierte en problemas estructurados recorriendo las ocho etapas de la Investigación de Operaciones (Problema, Definición, Construcción, Modelo, Validación, Solución, Resultados, Implementación).

## Tecnologías

- HTML5 · CSS3 · JavaScript ES6+ (vanilla, sin frameworks)
- SVG (gráficas, ruta de operaciones e íconos originales)
- Web Audio API (efectos de sonido sin archivos externos)
- `localStorage` (progreso con versionado de guardado)
- GitHub Actions para despliegue automático

## Desarrollo local

```bash
# opción 1: abrir directamente
open index.html

# opción 2: servidor local
python3 -m http.server 8080
# abre http://localhost:8080
```

## Estructura

```
├── index.html          # pantallas de la aplicación
├── css/                # diseño (variables, componentes, misiones, responsive…)
├── js/                 # motor de misiones, fases, simulación, UI, estado
└── data/               # misiones, métodos, logros e histórico (todo data-driven)
```

## Contenido

Todo el contenido es editable en `data/`:

- `data/missions.js` — las 4 misiones principales (señales, definición, modelo, alternativas, implementación).
- `data/finalMission.js` — la misión final Operación Campus.
- `data/methods.js` — las 12 técnicas del archivo de métodos.
- `data/achievements.js` — logros.
- `data/history.js` — archivo histórico (sección 1.6 del Gimnasio 1).

Para agregar una misión: copia la forma de un objeto existente, ajusta sus campos y regístrala en `OR.Missions.LIST`. El motor la ejecuta sin tocar código de interfaz.

## GitHub Pages

Publicado en:

**https://israeltiburcio-ai.github.io/or-mission/**

## Autodeploy

```
push a main → GitHub Actions → GitHub Pages
```

El workflow `.github/workflows/pages.yml` se ejecuta con cada push a `main` (y manualmente con `workflow_dispatch`): el sitio se actualiza automáticamente sin subir archivos a mano.
