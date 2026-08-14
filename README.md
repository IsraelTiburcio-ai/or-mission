# OR EXPRESS — Construye la ruta de Investigación de Operaciones

**Microjuego educativo de ~90 segundos.** Quinta actividad de la colección digital del Gimnasio 1 — Introducción a la Teoría de Sistemas (materia **Optimización I**).

Engancha los vagones de un tren en el orden correcto: las **ocho fases de la Investigación de Operaciones** del material (sección 1.6):

`PROBLEMA → DEFINICIÓN → CONSTRUCCIÓN → MODELO → VALIDACIÓN → SOLUCIÓN → RESULTADOS → IMPLEMENTACIÓN`

## Cómo se juega

- En pantalla aparecen **3 vagones**; toca el que corresponde a la siguiente fase.
- Acierto: el vagón se engancha, el tren acelera y ganas puntos (+100, el combo suma).
- Fallo: el vagón rebota y se aparta; sigues jugando (no se reinicia).
- Conecta los **8 vagones** y el tren cruza la estación final.

Flujo: `Portada → JUGAR → Gameplay → Resultado → NUEVO VIAJE`. Sin tutorial, sin módulos, sin campaña.

## Duración

Una partida completa dura **60–120 segundos** (medida en pruebas automatizadas con navegador real).

## Concepto académico

Las ocho fases de la Investigación de Operaciones, en el orden y con la terminología exactos del Gimnasio 1 (sección 1.6). Cada acierto muestra una frase brevísima del significado de la fase.

## Tecnologías

- HTML5 · CSS3 · JavaScript ES6+ (vanilla, sin frameworks ni build)
- SVG (tren, vagones y estación originales, dibujados en código)
- Web Audio API (silbato, enganche, combo, error y fanfarria; sin archivos)
- `localStorage` (mejor puntuación, mejor tiempo y sonido)
- GitHub Actions para despliegue automático

## Desarrollo local

```bash
open index.html
# o
python3 -m http.server 8080   # http://localhost:8080
```

## Estructura

```
├── index.html       # portada, gameplay y resultado
├── css/game.css     # todo el diseño (tema de tren)
├── js/data.js       # las 8 fases y sus frases breves
├── js/game.js       # lógica del microjuego, animaciones y sonido
└── .github/workflows/pages.yml
```

## Contenido

Las fases, su orden y las frases de cada una se editan en `js/data.js` (arreglo `PHASES`). La duración se ajusta en `js/game.js` (retrasos de animación y cantidad de fases).

## GitHub Pages

Publicado en:

**https://israeltiburcio-ai.github.io/or-mission/**

## Autodeploy

```
push a main → GitHub Actions → GitHub Pages
```

El workflow `.github/workflows/pages.yml` se ejecuta con cada push a `main` (y manualmente con `workflow_dispatch`).

## Versión anterior

La versión original completa (OR Mission V1, con las 8 fases profundas, misiones y centro de operaciones) está preservada bajo el tag **`legacy-v1`** y la rama **`archive/legacy-v1`**:

```bash
git checkout legacy-v1
```
