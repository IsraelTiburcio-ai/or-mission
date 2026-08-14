/* ============================================================
   OR MISSION · data/methods.js
   Archivo de Métodos: técnicas de la Investigación de
   Operaciones mencionadas en el Gimnasio 1. Descripciones
   breves, dentro de lo que soporta el material.
   ============================================================ */
(function (OR) {
  "use strict";

  OR.Methods = OR.Methods || {};

  OR.Methods.DEFS = [
    {
      id: "lineal",
      name: "Programación lineal",
      icon: "lineal",
      unlockMission: 0,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Se ocupa de optimizar decisiones cuando las relaciones pueden representarse de forma lineal."
    },
    {
      id: "no-lineal",
      name: "Programación no lineal",
      icon: "curve",
      unlockMission: 0,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1."
    },
    {
      id: "dinamica",
      name: "Programación dinámica",
      icon: "layers",
      unlockMission: 1,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Enfocada en problemas que pueden dividirse en etapas sucesivas."
    },
    {
      id: "entera",
      name: "Programación entera",
      icon: "integer",
      unlockMission: 1,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Trabaja con decisiones que solo pueden tomar valores completos (por ejemplo, número de personas)."
    },
    {
      id: "redes",
      name: "Redes de optimización",
      icon: "network",
      unlockMission: 2,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Analiza flujos, rutas y conexiones entre puntos."
    },
    {
      id: "simulacion",
      name: "Simulación",
      icon: "simulate",
      unlockMission: 2,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Consiste en reproducir el comportamiento de un sistema para estudiarlo antes de actuar."
    },
    {
      id: "inventarios",
      name: "Inventarios",
      icon: "inventory",
      unlockMission: 3,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Busca decidir cuánto y cuándo tener disponible un recurso."
    },
    {
      id: "decision",
      name: "Análisis de decisión",
      icon: "decision",
      unlockMission: 3,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Apoya la elección entre alternativas cuando existe incertidumbre."
    },
    {
      id: "estocasticos",
      name: "Procesos estocásticos",
      icon: "stochastic",
      unlockMission: 3,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Involucra sistemas cuyo comportamiento evoluciona con el azar."
    },
    {
      id: "colas",
      name: "Teoría de colas",
      icon: "queue",
      unlockMission: 0,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Estudia las líneas de espera y cómo se forman cuando la demanda supera la capacidad de atención."
    },
    {
      id: "juegos",
      name: "Teoría de juegos",
      icon: "games",
      unlockMission: 4,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Analiza decisiones donde intervienen varios participantes con intereses distintos."
    },
    {
      id: "series",
      name: "Series de tiempo",
      icon: "series",
      unlockMission: 4,
      desc: "Área mencionada dentro de las aplicaciones de Investigación de Operaciones en el Gimnasio 1. Trabaja con observaciones ordenadas en el tiempo para identificar patrones."
    }
  ];

  OR.Methods.byIndex = function (i) {
    return OR.Methods.DEFS[i] || null;
  };
})(window.OR = window.OR || {});
