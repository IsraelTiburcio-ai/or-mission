/* ============================================================
   OR EXPRESS · js/data.js
   Las ocho fases de la Investigación de Operaciones según el
   Gimnasio 1 (sección 1.6). Orden y terminología del material.
   ============================================================ */
const PHASES = [
  { id: "problem", num: "01", name: "PROBLEMA", tag: "Detectar la situación" },
  { id: "definition", num: "02", name: "DEFINICIÓN", tag: "Definir el problema" },
  { id: "construction", num: "03", name: "CONSTRUCCIÓN", tag: "Construir la estructura" },
  { id: "model", num: "04", name: "MODELO", tag: "Representar de forma simplificada" },
  { id: "validation", num: "05", name: "VALIDACIÓN", tag: "Comprobar el modelo" },
  { id: "solution", num: "06", name: "SOLUCIÓN", tag: "Elegir la alternativa" },
  { id: "results", num: "07", name: "RESULTADOS", tag: "Interpretar resultados" },
  { id: "implementation", num: "08", name: "IMPLEMENTACIÓN", tag: "Llevar a la práctica" }
];

/* Términos falsos: suenan a fases pero NO forman parte de las ocho
   etapas de la Investigación de Operaciones del material. */
const DECOYS = ["ANÁLISIS", "DIAGNÓSTICO", "EVALUACIÓN", "PLANEACIÓN", "EJECUCIÓN", "CONTROL"];

/* Segundos por fase en MODO RETO. */
const RETO_SECONDS = 8;
