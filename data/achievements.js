/* ============================================================
   OR MISSION · data/achievements.js
   Definición de logros. Terminología del Gimnasio 1.
   ============================================================ */
(function (OR) {
  "use strict";

  OR.Achievements = OR.Achievements || {};

  OR.Achievements.DEFS = [
    {
      id: "first-phase",
      name: "PROBLEMA DETECTADO",
      desc: "Completa la primera fase de una misión: detecta las señales del problema.",
      icon: "radar",
      check: (s) => s.stats.phasesCompleted >= 1
    },
    {
      id: "no-noise",
      name: "SIN RUIDO",
      desc: "Identifica todos los datos relevantes de un caso sin confundirte con el ruido.",
      icon: "clean",
      check: (s) => s.stats.cleanDetections >= 1
    },
    {
      id: "well-defined",
      name: "BIEN DEFINIDO",
      desc: "Construye correctamente una definición de problema completa.",
      icon: "target",
      check: (s) => s.stats.perfectDefinitions >= 1
    },
    {
      id: "coherent-model",
      name: "MODELO COHERENTE",
      desc: "Completa un modelo sin omisiones ni distractores.",
      icon: "model",
      check: (s) => s.stats.perfectModels >= 1
    },
    {
      id: "first-test",
      name: "PONLO A PRUEBA",
      desc: "Realiza tu primera validación del modelo.",
      icon: "scanner",
      check: (s) => s.stats.validationsRun >= 1
    },
    {
      id: "model-bug",
      name: "BUG DEL MODELO",
      desc: "Detecta una restricción faltante en un modelo.",
      icon: "bug",
      check: (s) => s.stats.inconsistenciesFound >= 1
    },
    {
      id: "informed-decision",
      name: "DECISIÓN INFORMADA",
      desc: "Selecciona una solución coherente con el objetivo definido.",
      icon: "decision",
      check: (s) => s.stats.coherentDecisions >= 1
    },
    {
      id: "theory-to-action",
      name: "DE LA TEORÍA A LA ACCIÓN",
      desc: "Completa la implementación de una propuesta.",
      icon: "rocket",
      check: (s) => s.stats.implementationsDone >= 1
    },
    {
      id: "first-try",
      name: "VALIDACIÓN PERFECTA",
      desc: "Valida un modelo correcto al primer intento.",
      icon: "perfect",
      check: (s) => s.stats.firstTryValidations >= 1
    },
    {
      id: "no-hints",
      name: "ANÁLISIS AUTÓNOMO",
      desc: "Completa una misión sin usar pistas.",
      icon: "compass",
      check: (s) => s.stats.missionsNoHints >= 1
    },
    {
      id: "operator-analyst",
      name: "ANALISTA DE OPERACIONES",
      desc: "Completa las cuatro misiones principales.",
      icon: "trophy",
      check: (s) => OR.State.missionsCountBy("done") >= 4 && !OR.State.finalCompleted()
    },
    {
      id: "mission-accomplished",
      name: "MISIÓN CUMPLIDA",
      desc: "Completa la misión final: Operación Campus.",
      icon: "star",
      check: (s) => OR.State.finalCompleted()
    },
    {
      id: "gym-complete",
      name: "GIMNASIO 1 — RUTA COMPLETADA",
      desc: "Recorre las ocho fases de la Investigación de Operaciones de principio a fin.",
      icon: "crown",
      check: (s) => OR.State.finalCompleted()
    },
    {
      id: "grandmaster",
      name: "MAESTRO DE DECISIONES",
      desc: "Alcanza el rango más alto del centro de operaciones.",
      icon: "crown",
      check: (s) => OR.Scoring.rankIndex(s) >= OR.Scoring.RANKS.length - 1
    }
  ];

  OR.Achievements.get = function (id) {
    return OR.Achievements.DEFS.find((a) => a.id === id);
  };
})(window.OR = window.OR || {});
