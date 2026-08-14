/* ============================================================
   OR MISSION · data/missions.js
   Definición de las 4 misiones principales. Cada misión es
   puramente datos: el motor de misiones la ejecuta.
   Terminología del Gimnasio 1 (sección 1.6 Investigación de
   Operaciones): Problema, Definición, Construcción, Modelo,
   Validación, Solución, Resultados, Implementación.
   ============================================================ */
(function (OR) {
  "use strict";

  OR.Phases = [
    { num: "01", id: "problem", title: "PROBLEMA" },
    { num: "02", id: "definition", title: "DEFINICIÓN" },
    { num: "03", id: "construction", title: "CONSTRUCCIÓN" },
    { num: "04", id: "model", title: "MODELO" },
    { num: "05", id: "validation", title: "VALIDACIÓN" },
    { num: "06", id: "solution", title: "SOLUCIÓN" },
    { num: "07", id: "results", title: "RESULTADOS" },
    { num: "08", id: "implementation", title: "IMPLEMENTACIÓN" }
  ];

  OR.Missions = OR.Missions || {};
  OR.Missions.LIST = [];

  /* ------------------------------------------------------------
     M1 · CAFETERÍA UNIVERSITARIA
  ------------------------------------------------------------ */
  OR.Missions.LIST.push({
    id: "cafeteria",
    code: "M-01",
    title: "Hora Pico",
    scenario: "Cafetería universitaria",
    icon: "cafe",
    brief: "En ciertos horarios se acumulan demasiados estudiantes. Los recursos son limitados y algo no está funcionando.",
    final: false,

    chaos: {
      title: "CAOS OPERATIVO",
      intro: "Flujo de eventos de la cafetería entre las 12:00 y las 12:35. Inspecciona la información y selecciona lo que consideres una señal relevante.",
      items: [
        { id: "c1", time: "12:15", icon: "users", text: "Se acumulan 18 estudiantes en la fila de la caja.", cat: "signal" },
        { id: "c2", time: "12:20", icon: "cashier", text: "Solo una caja está operando, aunque hay tres empleados disponibles.", cat: "signal" },
        { id: "c3", time: "12:27", icon: "bowl", text: "Se terminan los platillos del día: la cocina no da abasto.", cat: "signal" },
        { id: "c4", time: "12:30", icon: "chat", text: "Aumentan las quejas por el tiempo de espera.", cat: "signal" },
        { id: "c5", time: "12:05", icon: "megaphone", text: "El menú del día se publicó en las redes de la universidad.", cat: "context" },
        { id: "c6", time: "11:50", icon: "box", text: "Llegó el abastecimiento semanal de alimentos.", cat: "context" },
        { id: "c7", time: "12:10", icon: "timer", text: "Cada persona tarda en promedio 4 minutos en la caja.", cat: "context" },
        { id: "c8", time: "11:40", icon: "sun", text: "Un gato duerme cerca de las mesas del comedor.", cat: "noise" },
        { id: "c9", time: "12:33", icon: "chair", text: "Quedan sillas disponibles en el comedor.", cat: "noise" },
        { id: "c10", time: "11:30", icon: "music", text: "Se instaló un equipo de sonido para el fin de semana.", cat: "noise" }
      ]
    },

    diagnosis: {
      prompt: "Con las señales seleccionadas, construye la descripción de lo que está ocurriendo:",
      slots: [
        {
          label: "MOMENTO",
          chips: [
            { id: "d1", text: "Durante la hora de mayor demanda", ok: true },
            { id: "d2", text: "Durante la mañana", ok: false },
            { id: "d3", text: "Los fines de semana", ok: false }
          ]
        },
        {
          label: "HECHO",
          chips: [
            { id: "d4", text: "los estudiantes esperan demasiado", ok: true },
            { id: "d5", text: "el menú tiene pocas opciones", ok: false },
            { id: "d6", text: "aumenta el precio de los platillos", ok: false }
          ]
        },
        {
          label: "CAUSA",
          chips: [
            { id: "d7", text: "porque la capacidad de atención actual es insuficiente", ok: true },
            { id: "d8", text: "porque la música distrae al personal", ok: false },
            { id: "d9", text: "porque la cocina cerrará en vacaciones", ok: false }
          ]
        }
      ]
    },

    problem: {
      intro: "Transforma tus observaciones en una definición clara. Selecciona la opción correcta de cada bloque:",
      blocks: [
        {
          id: "actual", label: "SITUACIÓN ACTUAL",
          prompt: "¿Qué está ocurriendo realmente?",
          options: [
            { id: "a1", text: "En la hora pico se forman filas largas y solo una caja está operando.", ok: true },
            { id: "a2", text: "La cafetería estará cerrada durante el receso escolar.", ok: false },
            { id: "a3", text: "El menú no incluye opciones vegetarianas.", ok: false }
          ]
        },
        {
          id: "deseado", label: "RESULTADO DESEADO",
          prompt: "¿Qué quieres lograr?",
          options: [
            { id: "b1", text: "Reducir el tiempo de espera durante la hora de mayor demanda.", ok: true },
            { id: "b2", text: "Aumentar el precio de los platillos del menú.", ok: false },
            { id: "b3", text: "Cambiar el horario de apertura de la cafetería.", ok: false }
          ]
        },
        {
          id: "afectados", label: "ELEMENTOS AFECTADOS",
          prompt: "¿Quiénes o qué se ven afectados?",
          options: [
            { id: "d1", text: "Estudiantes, caja y personal de la cafetería.", ok: true },
            { id: "d2", text: "El equipo representativo de fútbol de la universidad.", ok: false },
            { id: "d3", text: "Los proveedores de alimentos de otra ciudad.", ok: false }
          ]
        },
        {
          id: "restricciones", label: "RESTRICCIONES",
          prompt: "¿Qué límites hay que respetar?",
          options: [
            { id: "e1", text: "Solo hay tres empleados y el presupuesto del mes está fijado.", ok: true },
            { id: "e2", text: "Se puede contratar personal sin límite.", ok: false },
            { id: "e3", text: "El horario de atención puede extenderse indefinidamente.", ok: false }
          ]
        },
        {
          id: "alcance", label: "ALCANCE",
          prompt: "¿Hasta dónde llega el análisis?",
          options: [
            { id: "f1", text: "Solo el turno de 12:00 a 13:00 dentro de la cafetería.", ok: true },
            { id: "f2", text: "Toda la universidad durante todo el semestre.", ok: false },
            { id: "f3", text: "El campus universitario de la ciudad vecina.", ok: false }
          ]
        }
      ]
    },

    scope: {
      prompt: "Define el alcance: clasifica cada tarjeta dentro o fuera del análisis.",
      cards: [
        { id: "s1", ico: "users", text: "La fila de la caja (estudiantes en espera)", cat: "in" },
        { id: "s2", ico: "clock", text: "El turno de 12:00 a 13:00", cat: "in" },
        { id: "s3", ico: "staff", text: "El personal de la cafetería", cat: "in" },
        { id: "s4", ico: "money", text: "El presupuesto de la cafetería", cat: "in" },
        { id: "s5", ico: "bus", text: "El transporte público del campus", cat: "out" },
        { id: "s6", ico: "building", text: "Los competidores de la cafetería", cat: "out" },
        { id: "s7", ico: "sun", text: "El clima de la ciudad", cat: "out" },
        { id: "s8", ico: "calendar", text: "El ciclo escolar completo", cat: "out" }
      ]
    },

    construction: {
      intro: "Coloca los nodos sobre la mesa y conéctalos para representar la estructura del problema. Selecciona un nodo y luego el nodo de destino para crear la relación.",
      palette: [
        { id: "cl", label: "CLIENTES", ico: "users", role: "input" },
        { id: "pe", label: "PEDIDOS", ico: "tray", role: "input" },
        { id: "at", label: "ATENCIÓN EN CAJA", ico: "cashier", role: "process" },
        { id: "sv", label: "PEDIDOS SERVIDOS", ico: "check", role: "output" },
        { id: "ps", label: "PERSONAL", ico: "staff", role: "resource" },
        { id: "pr", label: "PRESUPUESTO", ico: "money", role: "constraint" },
        { id: "ti", label: "TIEMPO DISPONIBLE", ico: "timer", role: "constraint" },
        { id: "mu", label: "MÚSICA DE FONDO", ico: "music", role: "none" },
        { id: "de", label: "DECORACIÓN", ico: "sun", role: "none" }
      ],
      links: [
        { from: "cl", to: "at" },
        { from: "pe", to: "at" },
        { from: "ps", to: "at" },
        { from: "at", to: "sv" },
        { from: "pr", to: "ps" },
        { from: "ti", to: "at" }
      ]
    },

    model: {
      objective: {
        prompt: "¿Qué queremos lograr?",
        options: [
          { id: "o1", text: "Reducir el tiempo de espera en la hora pico.", ok: true },
          { id: "o2", text: "Pintar el comedor de otro color.", ok: false },
          { id: "o3", text: "Aumentar la temperatura del comedor.", ok: false }
        ]
      },
      decisions: {
        prompt: "¿Qué podemos cambiar? (decisiones controlables)",
        options: [
          { id: "d1", text: "Cajas en operación", ok: true },
          { id: "d2", text: "Personas asignadas a la caja", ok: true },
          { id: "d3", text: "Tiempo por persona en la caja", ok: true },
          { id: "d4", text: "Color de los uniformes", ok: false },
          { id: "d5", text: "Música de fondo en el comedor", ok: false }
        ]
      },
      constraints: {
        prompt: "¿Qué límites tenemos?",
        options: [
          { id: "r1", text: "Personal disponible (3 empleados)", ok: true },
          { id: "r2", text: "Presupuesto limitado", ok: true },
          { id: "r3", text: "Capacidad de la caja: una persona a la vez", ok: true, required: true },
          { id: "r4", text: "Horario de atención ilimitado", ok: false },
          { id: "r5", text: "Demanda fija que nunca cambia", ok: false }
        ]
      },
      data: {
        prompt: "¿Qué conocemos? (datos del escenario)",
        options: [
          { id: "t1", text: "Cada persona tarda ~4 minutos en la caja", ok: true },
          { id: "t2", text: "En la hora pico llegan ~30 estudiantes", ok: true },
          { id: "t3", text: "La cafetería cuenta con 1 caja", ok: true },
          { id: "t4", text: "El rector visita la cafetería los viernes", ok: false },
          { id: "t5", text: "La universidad tiene 12 000 estudiantes", ok: false }
        ]
      }
    },

    sim: {
      type: "queue",
      periodMin: 15,
      blockLabel: "bloques de 15 min",
      serviceLabel: "min por persona",
      base: { servers: 1, serviceMin: 4 },
      constraint: {
        key: "servers",
        label: "Capacidad de la caja",
        min: 1,
        impossibleText: "Resultado imposible: sin considerar la capacidad de la caja, la simulación atiende toda la demanda sin espera, pero el escenario real muestra filas acumuladas.",
        fixText: "FALTA UNA RESTRICCIÓN: agrega la capacidad de atención a tu modelo para que represente el escenario real."
      },
      cases: [
        { id: "normal", name: "Día normal", ico: "clock", arrivals: [8, 10, 6], desc: "Afluencia habitual en la hora pico." },
        { id: "peak", name: "Alta demanda", ico: "users", arrivals: [18, 24, 14], desc: "Mayor afluencia: la fila crece con rapidez." },
        { id: "low", name: "Baja demanda", ico: "down", arrivals: [3, 4, 2], desc: "Poca afluencia en el bloque." }
      ]
    },

    alternatives: [
      {
        id: "A", name: "Refuerzo total", ico: "staff",
        desc: "Se abren dos cajas más y se agiliza el cobro.",
        params: { servers: 3, serviceMin: 3 },
        cost: 3,
        trade: "Reduce más el tiempo, pero utiliza más personal y equipos.",
        fit: { time: 0.9, cost: 0.3 }
      },
      {
        id: "B", name: "Ajuste mínimo", ico: "cashier",
        desc: "Se reabre una caja con el personal actual.",
        params: { servers: 2, serviceMin: 4 },
        cost: 1,
        trade: "Utiliza pocos recursos, pero no mejora suficiente el tiempo.",
        fit: { time: 0.3, cost: 0.9 }
      },
      {
        id: "C", name: "Balance", ico: "scale",
        desc: "Una caja extra y un cobro más ágil.",
        params: { servers: 2, serviceMin: 3 },
        cost: 2,
        trade: "Equilibra la mejora del tiempo con los recursos utilizados.",
        fit: { time: 0.6, cost: 0.6 }
      }
    ],
    objectiveKey: "time",
    best: ["A", "C"],
    bestReason: "Tu objetivo es reducir el tiempo de espera: las alternativas que más lo reducen son coherentes con el objetivo definido.",

    results: {
      beforeLabel: "ANTES · situación actual",
      afterLabel: "PROPUESTA · alternativa elegida",
      conclusions: [
        { id: "k1", text: "La propuesta reduce el tiempo de espera máximo.", supported: true },
        { id: "k2", text: "Con la propuesta se atiende una mayor proporción de la demanda.", supported: true },
        { id: "k3", text: "La propuesta no requiere recursos adicionales.", supported: false },
        { id: "k4", text: "El problema desaparece por completo en hora pico.", supported: false }
      ]
    },

    implementation: {
      steps: [
        { id: "i1", text: "Preparar la caja adicional y revisar los equipos de cobro." },
        { id: "i2", text: "Asignar al personal en turnos a la caja según el plan." },
        { id: "i3", text: "Aplicar el cambio el siguiente día de mayor demanda." },
        { id: "i4", text: "Observar el comportamiento de la fila durante la hora pico." },
        { id: "i5", text: "Revisar los resultados y compararlos con el escenario anterior." }
      ],
      postEvent: {
        title: "DATOS REALES DEL ESCENARIO",
        text: "El día de la implementación, la demanda fue 20% mayor a la esperada: llegaron más estudiantes de los previstos y la fila volvió a crecer en el último bloque.",
        options: [
          { id: "p1", text: "Volver a validar el modelo y ajustar la propuesta con los nuevos datos.", ok: true, feedback: "Correcto. La Investigación de Operaciones es un proceso que puede requerir revisión: los datos reales se incorporan y se ajusta lo necesario." },
          { id: "p2", text: "Ignorar el dato, la misión ya terminó.", ok: false, feedback: "En la práctica, los datos nuevos se incorporan al análisis. Ignorarlos haría que la decisión pierda fundamento." },
          { id: "p3", text: "Cambiar el objetivo del problema.", ok: false, feedback: "El objetivo se definió con el análisis previo. Cambiarlo sin nueva evidencia debilitaría la decisión." }
        ],
                loop: ["Validación", "Modelo"],
        adjustedCase: { id: "peak", name: "Datos reales del día", ico: "chart", arrivals: [20, 30, 16], desc: "Demanda real del día: 20% mayor a la esperada." }
      }
    },

    hints: {
      1: [
        "Observa qué elementos se acumulan y qué recursos están operando.",
        "Las señales aparecen como eventos en el tiempo; el contexto son datos de fondo.",
        "Descarta lo que no afecta a la fila ni a la atención."
      ],
      2: [
        "¿Qué resultado quieres modificar?",
        "Distingue entre la situación actual y el resultado deseado.",
        "Revisa los límites y recursos disponibles."
      ],
      3: [
        "Identifica qué entra, qué se procesa y qué sale.",
        "Conecta los recursos y restricciones con el proceso.",
        "Todos los nodos deben relacionarse con la atención o con los recursos."
      ],
      4: [
        "¿Qué podemos cambiar? Esa es la decisión.",
        "El objetivo responde a: ¿qué queremos lograr?",
        "La capacidad de la caja limita cuánto se puede atender."
      ],
      5: [
        "Prueba cada caso y compara con lo observado.",
        "Si un resultado contradice el escenario, falta algo en el modelo.",
        "Revisa las restricciones del modelo."
      ],
      6: [
        "Evalúa cada alternativa contra el objetivo definido.",
        "Simula para comparar, no adivines.",
        "Más recursos suelen reducir el tiempo, pero cuestan más."
      ],
      7: [
        "Compara antes y después con los mismos indicadores.",
        "Las conclusiones deben estar respaldadas por las cifras.",
        "Revisa la demanda atendida y el tiempo de espera."
      ],
      8: [
        "Primero se prepara, después se aplica.",
        "Después de aplicar hay que observar y medir.",
        "Los datos reales pueden obligar a revisar la decisión."
      ]
    },

    completion: {
      title: "HORA PICO — MISIÓN COMPLETADA",
      text: "Detectaste el problema, lo definiste, lo modelaste, lo validaste y propusiste una implementación fundamentada. Así se recorre un problema con el proceso de Investigación de Operaciones."
    }
  });

  /* ------------------------------------------------------------
     M2 · BIBLIOTECA UNIVERSITARIA
  ------------------------------------------------------------ */
  OR.Missions.LIST.push({
    id: "library",
    code: "M-02",
    title: "El Préstamo que se Acumula",
    scenario: "Biblioteca universitaria",
    icon: "library",
    brief: "La biblioteca tiene recursos limitados y necesidades diferentes. Algo pasa con el préstamo en ciertos horarios.",
    final: false,

    chaos: {
      title: "FLUJO EN EL MOSTRADOR",
      intro: "Eventos del mostrador de préstamo entre las 10:55 y las 11:30. Selecciona las señales relevantes.",
      items: [
        { id: "l1", time: "11:10", icon: "users", text: "Se forma una fila de 12 estudiantes en el mostrador de préstamo.", cat: "signal" },
        { id: "l2", time: "11:15", icon: "cashier", text: "Una de las dos ventanillas está cerrada por falta de personal.", cat: "signal" },
        { id: "l3", time: "11:20", icon: "exit", text: "Varios estudiantes abandonan la fila sin prestar sus libros.", cat: "signal" },
        { id: "l4", time: "11:30", icon: "chat", text: "Se reciben quejas por la demora en la devolución de libros.", cat: "signal" },
        { id: "l5", time: "11:26", icon: "timer", text: "Cada préstamo tarda unos 6 minutos en tramitarse.", cat: "context" },
        { id: "l6", time: "11:05", icon: "book", text: "El catálogo digital fue actualizado esta mañana.", cat: "context" },
        { id: "l7", time: "10:55", icon: "clock", text: "La biblioteca abre de 8:00 a 20:00.", cat: "context" },
        { id: "l8", time: "11:22", icon: "lamp", text: "Se cambiaron las lámparas del área de lectura.", cat: "noise" },
        { id: "l9", time: "11:12", icon: "music", text: "Un grupo musical ensaya en el auditorio cercano.", cat: "noise" },
        { id: "l10", time: "10:45", icon: "plant", text: "Se regaron las plantas de la entrada.", cat: "noise" }
      ]
    },

    diagnosis: {
      prompt: "Con las señales seleccionadas, construye la descripción de lo que está ocurriendo:",
      slots: [
        {
          label: "MOMENTO",
          chips: [
            { id: "g1", text: "Durante la hora de mayor préstamo", ok: true },
            { id: "g2", text: "Durante el receso escolar", ok: false },
            { id: "g3", text: "Los domingos por la mañana", ok: false }
          ]
        },
        {
          label: "HECHO",
          chips: [
            { id: "g4", text: "la fila del mostrador crece", ok: true },
            { id: "g5", text: "el catálogo está desactualizado", ok: false },
            { id: "g6", text: "las lámparas se apagan", ok: false }
          ]
        },
        {
          label: "CAUSA",
          chips: [
            { id: "g7", text: "porque falta capacidad de atención en las ventanillas", ok: true },
            { id: "g8", text: "porque los libros no están en los estantes", ok: false },
            { id: "g9", text: "porque el auditorio está ocupado", ok: false }
          ]
        }
      ]
    },

    problem: {
      intro: "Transforma tus observaciones en una definición clara. Selecciona la opción correcta de cada bloque:",
      blocks: [
        {
          id: "actual", label: "SITUACIÓN ACTUAL",
          prompt: "¿Qué está ocurriendo realmente?",
          options: [
            { id: "a1", text: "En la hora pico se acumula una fila larga y solo una ventanilla opera.", ok: true },
            { id: "a2", text: "La biblioteca no tiene libros nuevos en el catálogo.", ok: false },
            { id: "a3", text: "Los estudiantes no devuelven los libros prestados.", ok: false }
          ]
        },
        {
          id: "deseado", label: "RESULTADO DESEADO",
          prompt: "¿Qué quieres lograr?",
          options: [
            { id: "b1", text: "Reducir la espera en el préstamo durante la hora de mayor demanda.", ok: true },
            { id: "b2", text: "Cobrar multas más altas por retraso.", ok: false },
            { id: "b3", text: "Reducir el horario de atención de la biblioteca.", ok: false }
          ]
        },
        {
          id: "afectados", label: "ELEMENTOS AFECTADOS",
          prompt: "¿Quiénes o qué se ven afectados?",
          options: [
            { id: "d1", text: "Estudiantes, ventanillas de préstamo y personal de biblioteca.", ok: true },
            { id: "d2", text: "El club de lectura del edificio de humanidades.", ok: false },
            { id: "d3", text: "Las editoriales de otra ciudad.", ok: false }
          ]
        },
        {
          id: "restricciones", label: "RESTRICCIONES",
          prompt: "¿Qué límites hay que respetar?",
          options: [
            { id: "e1", text: "El personal es limitado y el presupuesto del semestre está definido.", ok: true },
            { id: "e2", text: "Se pueden contratar bibliotecarios sin límite.", ok: false },
            { id: "e3", text: "Las ventanillas pueden operar sin personal.", ok: false }
          ]
        },
        {
          id: "alcance", label: "ALCANCE",
          prompt: "¿Hasta dónde llega el análisis?",
          options: [
            { id: "f1", text: "Solo el servicio de préstamo de 11:00 a 12:00.", ok: true },
            { id: "f2", text: "Toda la biblioteca durante todo el año.", ok: false },
            { id: "f3", text: "Las bibliotecas de otras universidades.", ok: false }
          ]
        }
      ]
    },

    scope: {
      prompt: "Define el alcance: clasifica cada tarjeta dentro o fuera del análisis.",
      cards: [
        { id: "s1", ico: "users", text: "La fila del mostrador de préstamo", cat: "in" },
        { id: "s2", ico: "clock", text: "El turno de 11:00 a 12:00", cat: "in" },
        { id: "s3", ico: "staff", text: "El personal de la biblioteca", cat: "in" },
        { id: "s4", ico: "money", text: "El presupuesto de la biblioteca", cat: "in" },
        { id: "s5", ico: "cafe", text: "La cafetería del campus", cat: "out" },
        { id: "s6", ico: "music", text: "Los eventos del auditorio", cat: "out" },
        { id: "s7", ico: "sun", text: "El clima de la ciudad", cat: "out" },
        { id: "s8", ico: "calendar", text: "El semestre completo", cat: "out" }
      ]
    },

    construction: {
      intro: "Coloca los nodos sobre la mesa y conéctalos para representar la estructura del servicio de préstamo.",
      palette: [
        { id: "es", label: "ESTUDIANTES", ico: "users", role: "input" },
        { id: "li", label: "LIBROS EN PRÉSTAMO", ico: "book", role: "input" },
        { id: "tr", label: "TRÁMITE DE PRÉSTAMO", ico: "cashier", role: "process" },
        { id: "at", label: "PRÉSTAMOS ATENDIDOS", ico: "check", role: "output" },
        { id: "pe", label: "PERSONAL", ico: "staff", role: "resource" },
        { id: "ve", label: "VENTANILLAS", ico: "window", role: "constraint" },
        { id: "pr", label: "PRESUPUESTO", ico: "money", role: "constraint" },
        { id: "mu", label: "MÚSICA AMBIENTAL", ico: "music", role: "none" },
        { id: "pl", label: "PLANTAS DE LA ENTRADA", ico: "plant", role: "none" }
      ],
      links: [
        { from: "es", to: "tr" },
        { from: "li", to: "tr" },
        { from: "pe", to: "tr" },
        { from: "tr", to: "at" },
        { from: "ve", to: "tr" },
        { from: "pr", to: "pe" }
      ]
    },

    model: {
      objective: {
        prompt: "¿Qué queremos lograr?",
        options: [
          { id: "o1", text: "Reducir la espera en el préstamo en la hora pico.", ok: true },
          { id: "o2", text: "Aumentar el número de estanterías.", ok: false },
          { id: "o3", text: "Pintar el mostrador de otro color.", ok: false }
        ]
      },
      decisions: {
        prompt: "¿Qué podemos cambiar? (decisiones controlables)",
        options: [
          { id: "d1", text: "Ventanillas en operación", ok: true },
          { id: "d2", text: "Personal asignado al préstamo", ok: true },
          { id: "d3", text: "Tiempo de trámite por estudiante", ok: true },
          { id: "d4", text: "Color de los separadores", ok: false },
          { id: "d5", text: "Música ambiental de la sala", ok: false }
        ]
      },
      constraints: {
        prompt: "¿Qué límites tenemos?",
        options: [
          { id: "r1", text: "Personal disponible", ok: true },
          { id: "r2", text: "Solo 2 ventanillas en el mostrador", ok: true, required: true },
          { id: "r3", text: "Presupuesto del semestre definido", ok: true },
          { id: "r4", text: "Horario de atención ilimitado", ok: false },
          { id: "r5", text: "Demanda constante todo el año", ok: false }
        ]
      },
      data: {
        prompt: "¿Qué conocemos? (datos del escenario)",
        options: [
          { id: "t1", text: "Cada préstamo tarda ~6 minutos", ok: true },
          { id: "t2", text: "En la hora pico llegan ~30 estudiantes", ok: true },
          { id: "t3", text: "La biblioteca tiene 2 ventanillas", ok: true },
          { id: "t4", text: "El auditorio tiene 200 asientos", ok: false },
          { id: "t5", text: "La cafetería vende 40 menús al día", ok: false }
        ]
      }
    },

    sim: {
      type: "queue",
      periodMin: 20,
      blockLabel: "bloques de 20 min",
      serviceLabel: "min por préstamo",
      base: { servers: 1, serviceMin: 6 },
      constraint: {
        key: "servers",
        label: "Ventanillas en operación",
        min: 1,
        impossibleText: "Resultado imposible: sin considerar las ventanillas disponibles, la simulación atiende toda la demanda sin espera, pero el escenario real muestra fila acumulada.",
        fixText: "FALTA UNA RESTRICCIÓN: agrega las ventanillas en operación a tu modelo para que represente el escenario real."
      },
      cases: [
        { id: "normal", name: "Día normal", ico: "clock", arrivals: [6, 8, 6], desc: "Afluencia habitual en la hora de préstamo." },
        { id: "peak", name: "Alta demanda", ico: "users", arrivals: [10, 14, 10], desc: "Varios grupos terminan clases al mismo tiempo." },
        { id: "low", name: "Baja demanda", ico: "down", arrivals: [2, 3, 2], desc: "Poca afluencia en el bloque." }
      ]
    },

    alternatives: [
      {
        id: "A", name: "Reabrir ventanilla", ico: "window",
        desc: "Se reabre la segunda ventanilla con el personal actual.",
        params: { servers: 2, serviceMin: 6 },
        cost: 1,
        trade: "Usa pocos recursos, pero la mejora del tiempo es moderada.",
        fit: { time: 0.4, cost: 0.9 }
      },
      {
        id: "B", name: "Préstamo exprés", ico: "rocket",
        desc: "Dos ventanillas con un trámite más ágil para devoluciones.",
        params: { servers: 2, serviceMin: 4 },
        cost: 2,
        trade: "Mejora más el tiempo, pero requiere reorganizar al personal.",
        fit: { time: 0.9, cost: 0.5 }
      },
      {
        id: "C", name: "Personal de apoyo", ico: "staff",
        desc: "Una ventanilla más y una persona de apoyo en horas pico.",
        params: { servers: 2, serviceMin: 5 },
        cost: 3,
        trade: "Buen equilibrio entre tiempo y recursos, con costo mayor.",
        fit: { time: 0.7, cost: 0.4 }
      }
    ],
    objectiveKey: "time",
    best: ["B", "C"],
    bestReason: "Tu objetivo es reducir la espera en el préstamo: las alternativas que más la reducen son coherentes con el objetivo definido.",

    results: {
      beforeLabel: "ANTES · una ventanilla",
      afterLabel: "PROPUESTA · alternativa elegida",
      conclusions: [
        { id: "k1", text: "La propuesta reduce la espera máxima en el préstamo.", supported: true },
        { id: "k2", text: "Con la propuesta se atiende una mayor proporción de estudiantes.", supported: true },
        { id: "k3", text: "La propuesta no requiere recursos adicionales.", supported: false },
        { id: "k4", text: "La espera desaparece por completo en la hora pico.", supported: false }
      ]
    },

    implementation: {
      steps: [
        { id: "i1", text: "Preparar la segunda ventanilla y el equipo de registro." },
        { id: "i2", text: "Asignar al personal según el plan elegido." },
        { id: "i3", text: "Poner en marcha el cambio el siguiente día hábil." },
        { id: "i4", text: "Observar la fila durante la hora de mayor préstamo." },
        { id: "i5", text: "Comparar los tiempos reales con los del escenario anterior." }
      ],
      postEvent: {
        title: "DATOS REALES DEL ESCENARIO",
        text: "El primer día de operación, el registro de préstamos creció: muchos estudiantes esperaron para devolver libros que tenían pendientes.",
        options: [
          { id: "p1", text: "Volver a validar el modelo y ajustar la propuesta con los nuevos datos.", ok: true, feedback: "Correcto. El proceso de Investigación de Operaciones admite revisión: se incorporan los datos reales y se ajusta la propuesta." },
          { id: "p2", text: "Ignorar el dato, la misión ya terminó.", ok: false, feedback: "En la práctica, los datos nuevos se incorporan al análisis. Ignorarlos haría que la decisión pierda fundamento." },
          { id: "p3", text: "Cambiar el objetivo del problema.", ok: false, feedback: "El objetivo se definió con el análisis previo. Cambiarlo sin nueva evidencia debilitaría la decisión." }
        ],
                loop: ["Validación", "Modelo"],
        adjustedCase: { id: "peak", name: "Datos reales del día", ico: "chart", arrivals: [12, 16, 12], desc: "El registro real superó lo previsto: había muchos préstamos pendientes." }
      }
    },

    hints: {
      1: [
        "Observa qué se acumula en el mostrador y qué recursos están operando.",
        "Las señales aparecen como eventos; el contexto son datos de fondo.",
        "Descarta lo que no afecta al préstamo ni a la espera."
      ],
      2: [
        "¿Qué resultado quieres modificar?",
        "Distingue entre la situación actual y el resultado deseado.",
        "Revisa los límites y recursos disponibles."
      ],
      3: [
        "Identifica qué entra, qué se procesa y qué sale.",
        "Conecta los recursos y restricciones con el trámite.",
        "Todos los nodos deben relacionarse con el préstamo o sus recursos."
      ],
      4: [
        "¿Qué podemos cambiar? Esa es la decisión.",
        "El objetivo responde a: ¿qué queremos lograr?",
        "Las ventanillas en operación limitan cuántos estudiantes se atienden."
      ],
      5: [
        "Prueba cada caso y compara con lo observado.",
        "Si un resultado contradice el escenario, falta algo en el modelo.",
        "Revisa las restricciones del modelo."
      ],
      6: [
        "Evalúa cada alternativa contra el objetivo definido.",
        "Simula para comparar, no adivines.",
        "Más recursos suelen reducir la espera, pero cuestan más."
      ],
      7: [
        "Compara antes y después con los mismos indicadores.",
        "Las conclusiones deben estar respaldadas por las cifras.",
        "Revisa la demanda atendida y la espera."
      ],
      8: [
        "Primero se prepara, después se aplica.",
        "Después de aplicar hay que observar y medir.",
        "Los datos reales pueden obligar a revisar la decisión."
      ]
    },

    completion: {
      title: "EL PRÉSTAMO QUE SE ACUMULA — MISIÓN COMPLETADA",
      text: "Recorriste el problema del mostrador de préstamo con las ocho fases: desde la detección hasta una propuesta de implementación fundamentada."
    }
  });

  /* ------------------------------------------------------------
     M3 · SISTEMA DE ENTREGAS
  ------------------------------------------------------------ */
  OR.Missions.LIST.push({
    id: "deliveries",
    code: "M-03",
    title: "Entrega sin Pausa",
    scenario: "Sistema de entregas",
    icon: "truck",
    brief: "Una organización debe atender entregas con recursos limitados: pedidos, capacidad, tiempos y zonas.",
    final: false,

    chaos: {
      title: "MAÑANA EN EL ALMACÉN",
      intro: "Eventos del almacén entre las 8:00 y las 9:05. Selecciona las señales relevantes.",
      items: [
        { id: "e1", time: "8:30", icon: "box", text: "Se acumulan 35 paquetes sin asignar en el almacén.", cat: "signal" },
        { id: "e2", time: "8:40", icon: "truck", text: "Solo hay una camioneta disponible y el chofer está de vacaciones.", cat: "signal" },
        { id: "e3", time: "8:50", icon: "map", text: "La zona norte supera la capacidad de una sola ruta.", cat: "signal" },
        { id: "e4", time: "9:05", icon: "clock", text: "Los pedidos llegan hasta las 10:00, pero la salida prevista es a las 9:00.", cat: "signal" },
        { id: "e5", time: "8:55", icon: "phone", text: "Tres clientes preguntan por el estado de sus paquetes.", cat: "signal" },
        { id: "e6", time: "8:20", icon: "clipboard", text: "Se recibieron 120 pedidos para las cuatro zonas.", cat: "context" },
        { id: "e7", time: "8:10", icon: "clock", text: "La papelería abre a las 8:00.", cat: "context" },
        { id: "e8", time: "8:15", icon: "sun", text: "Amanece despejado en la ciudad.", cat: "noise" },
        { id: "e9", time: "8:33", icon: "lamp", text: "Se cambió el foco del almacén.", cat: "noise" },
        { id: "e10", time: "8:00", icon: "cafe", text: "El equipo toma su café de la mañana.", cat: "noise" }
      ]
    },

    diagnosis: {
      prompt: "Con las señales seleccionadas, construye la descripción de lo que está ocurriendo:",
      slots: [
        {
          label: "MOMENTO",
          chips: [
            { id: "j1", text: "Durante la jornada de entregas", ok: true },
            { id: "j2", text: "Durante las vacaciones de verano", ok: false },
            { id: "j3", text: "Los fines de semana", ok: false }
          ]
        },
        {
          label: "HECHO",
          chips: [
            { id: "j4", text: "los pedidos se acumulan sin asignar", ok: true },
            { id: "j5", text: "los clientes no pagan sus facturas", ok: false },
            { id: "j6", text: "el almacén cambió de iluminación", ok: false }
          ]
        },
        {
          label: "CAUSA",
          chips: [
            { id: "j7", text: "porque la capacidad de reparto es insuficiente", ok: true },
            { id: "j8", text: "porque el café se terminó", ok: false },
            { id: "j9", text: "porque llueve en la ciudad", ok: false }
          ]
        }
      ]
    },

    problem: {
      intro: "Transforma tus observaciones en una definición clara. Selecciona la opción correcta de cada bloque:",
      blocks: [
        {
          id: "actual", label: "SITUACIÓN ACTUAL",
          prompt: "¿Qué está ocurriendo realmente?",
          options: [
            { id: "a1", text: "En la jornada se acumulan pedidos sin asignar y solo hay una camioneta.", ok: true },
            { id: "a2", text: "La papelería no vende cuadernos.", ok: false },
            { id: "a3", text: "Los clientes no pagan sus facturas.", ok: false }
          ]
        },
        {
          id: "deseado", label: "RESULTADO DESEADO",
          prompt: "¿Qué quieres lograr?",
          options: [
            { id: "b1", text: "Entregar todos los pedidos dentro de la jornada laboral.", ok: true },
            { id: "b2", text: "Subir el precio de los envíos.", ok: false },
            { id: "b3", text: "Dejar de atender la zona norte.", ok: false }
          ]
        },
        {
          id: "afectados", label: "ELEMENTOS AFECTADOS",
          prompt: "¿Quiénes o qué se ven afectados?",
          options: [
            { id: "d1", text: "Pedidos, camioneta y personal de reparto.", ok: true },
            { id: "d2", text: "El proveedor de hojas de papel.", ok: false },
            { id: "d3", text: "El banco de la papelería.", ok: false }
          ]
        },
        {
          id: "restricciones", label: "RESTRICCIONES",
          prompt: "¿Qué límites hay que respetar?",
          options: [
            { id: "e1", text: "Una camioneta con capacidad de 40 paquetes y jornada de 8 horas.", ok: true },
            { id: "e2", text: "Se pueden comprar camionetas ilimitadas.", ok: false },
            { id: "e3", text: "La jornada puede durar todo lo que se necesite.", ok: false }
          ]
        },
        {
          id: "alcance", label: "ALCANCE",
          prompt: "¿Hasta dónde llega el análisis?",
          options: [
            { id: "f1", text: "Solo las entregas del día en las cuatro zonas.", ok: true },
            { id: "f2", text: "Todas las ventas de la empresa durante el año.", ok: false },
            { id: "f3", text: "Las entregas de otras empresas de la ciudad.", ok: false }
          ]
        }
      ]
    },

    scope: {
      prompt: "Define el alcance: clasifica cada tarjeta dentro o fuera del análisis.",
      cards: [
        { id: "s1", ico: "box", text: "Los pedidos del día", cat: "in" },
        { id: "s2", ico: "truck", text: "La camioneta y su capacidad", cat: "in" },
        { id: "s3", ico: "map", text: "Las cuatro zonas de reparto", cat: "in" },
        { id: "s4", ico: "clock", text: "La jornada laboral de 8 horas", cat: "in" },
        { id: "s5", ico: "building", text: "Los competidores de la ciudad", cat: "out" },
        { id: "s6", ico: "sun", text: "El clima de la ciudad", cat: "out" },
        { id: "s7", ico: "calendar", text: "Los pedidos de la semana pasada", cat: "out" },
        { id: "s8", ico: "paper", text: "El sistema de facturación del año", cat: "out" }
      ]
    },

    construction: {
      intro: "Coloca los nodos sobre la mesa y conéctalos para representar la estructura del sistema de entregas.",
      palette: [
        { id: "pd", label: "PEDIDOS", ico: "box", role: "input" },
        { id: "al", label: "ALMACÉN", ico: "warehouse", role: "process" },
        { id: "en", label: "ENTREGAS REALIZADAS", ico: "check", role: "output" },
        { id: "cm", label: "CAMIONETA", ico: "truck", role: "resource" },
        { id: "ch", label: "CHOFERES", ico: "staff", role: "resource" },
        { id: "cp", label: "CAPACIDAD DEL VEHÍCULO", ico: "gauge", role: "constraint" },
        { id: "jo", label: "JORNADA LABORAL", ico: "timer", role: "constraint" },
        { id: "mu", label: "MÚSICA DE LA OFICINA", ico: "music", role: "none" },
        { id: "ll", label: "LLAVES DEL ALMACÉN", ico: "key", role: "none" }
      ],
      links: [
        { from: "pd", to: "al" },
        { from: "al", to: "en" },
        { from: "cm", to: "al" },
        { from: "ch", to: "al" },
        { from: "cp", to: "cm" },
        { from: "jo", to: "en" }
      ]
    },

    model: {
      objective: {
        prompt: "¿Qué queremos lograr?",
        options: [
          { id: "o1", text: "Entregar todos los pedidos dentro de la jornada.", ok: true },
          { id: "o2", text: "Aumentar el catálogo de productos.", ok: false },
          { id: "o3", text: "Cambiar el nombre de la empresa.", ok: false }
        ]
      },
      decisions: {
        prompt: "¿Qué podemos cambiar? (decisiones controlables)",
        options: [
          { id: "d1", text: "Número de camionetas", ok: true },
          { id: "d2", text: "Capacidad del vehículo", ok: true },
          { id: "d3", text: "Organización de rutas por zona", ok: true },
          { id: "d4", text: "Color de las cajas", ok: false },
          { id: "d5", text: "Música de la oficina", ok: false }
        ]
      },
      constraints: {
        prompt: "¿Qué límites tenemos?",
        options: [
          { id: "r1", text: "Capacidad de cada camioneta (40 paquetes)", ok: true, required: true },
          { id: "r2", text: "Una camioneta disponible", ok: true },
          { id: "r3", text: "Jornada de 8 horas", ok: true },
          { id: "r4", text: "Almacén con espacio infinito", ok: false },
          { id: "r5", text: "Sin límite de combustible", ok: false }
        ]
      },
      data: {
        prompt: "¿Qué conocemos? (datos del escenario)",
        options: [
          { id: "t1", text: "120 pedidos en el día", ok: true },
          { id: "t2", text: "4 zonas de reparto", ok: true },
          { id: "t3", text: "Cada ruta tarda ~100 minutos", ok: true },
          { id: "t4", text: "La papelería tiene 10 sucursales", ok: false },
          { id: "t5", text: "El clima favorece el reparto", ok: false }
        ]
      }
    },

    sim: {
      type: "trips",
      zoneLabel: "pedidos por zona",
      capacityLabel: "paquetes por viaje",
      tripLabel: "min por ruta",
      horizonMin: 480,
      base: { items: [40, 50, 30], capacity: 40, vehicles: 1, tripMin: 100 },
      constraint: {
        key: "capacity",
        label: "Capacidad de cada camioneta",
        min: 1,
        impossibleText: "Resultado imposible: sin considerar la capacidad del vehículo, la simulación reparte todos los pedidos en una sola ruta por zona, pero el escenario real muestra paquetes sin asignar.",
        fixText: "FALTA UNA RESTRICCIÓN: agrega la capacidad de cada camioneta a tu modelo para que represente el escenario real."
      },
      cases: [
        { id: "normal", name: "Día normal", ico: "clock", items: [40, 50, 30], desc: "Los 120 pedidos habituales del día." },
        { id: "peak", name: "Alta demanda", ico: "box", items: [40, 70, 50], desc: "La zona norte recibe más pedidos de lo previsto." },
        { id: "low", name: "Baja demanda", ico: "down", items: [20, 30, 15], desc: "Pocos pedidos en el día." }
      ]
    },

    alternatives: [
      {
        id: "A", name: "Segunda camioneta", ico: "truck",
        desc: "Se renta una camioneta adicional con la misma capacidad.",
        params: { vehicles: 2, capacity: 40, tripMin: 100 },
        cost: 3,
        trade: "Reduce más el tiempo total, pero aumenta el costo del día.",
        fit: { time: 0.9, cost: 0.3 }
      },
      {
        id: "B", name: "Camioneta más grande", ico: "gauge",
        desc: "Se sustituye la camioneta por una de mayor capacidad.",
        params: { vehicles: 1, capacity: 60, tripMin: 100 },
        cost: 2,
        trade: "Menor mejora en el tiempo, con costo medio y un solo vehículo.",
        fit: { time: 0.5, cost: 0.6 }
      },
      {
        id: "C", name: "Salidas anticipadas", ico: "map",
        desc: "Mejor planeación de rutas para aprovechar la jornada.",
        params: { vehicles: 1, capacity: 40, tripMin: 90 },
        cost: 2,
        trade: "Equilibra el tiempo y el costo, sin vehículos nuevos.",
        fit: { time: 0.6, cost: 0.6 }
      }
    ],
    objectiveKey: "time",
    best: ["A", "B"],
    bestReason: "Tu objetivo es entregar todos los pedidos dentro de la jornada: las alternativas que lo cumplen con el menor tiempo son coherentes con el objetivo definido.",

    results: {
      beforeLabel: "ANTES · una camioneta",
      afterLabel: "PROPUESTA · alternativa elegida",
      conclusions: [
        { id: "k1", text: "La propuesta permite terminar las entregas dentro de la jornada.", supported: true },
        { id: "k2", text: "La propuesta reduce el tiempo total de reparto.", supported: true },
        { id: "k3", text: "La propuesta no requiere recursos adicionales.", supported: false },
        { id: "k4", text: "La demanda del día no afecta al reparto.", supported: false }
      ]
    },

    implementation: {
      steps: [
        { id: "i1", text: "Preparar los vehículos y revisar su capacidad." },
        { id: "i2", text: "Asignar choferes y definir las rutas por zona." },
        { id: "i3", text: "Iniciar el reparto desde la salida planificada." },
        { id: "i4", text: "Dar seguimiento a las entregas durante la jornada." },
        { id: "i5", text: "Registrar los tiempos reales y compararlos con lo previsto." }
      ],
      postEvent: {
        title: "DATOS REALES DEL ESCENARIO",
        text: "El día de la implementación llegaron 30 pedidos extra después de las 10:00: la demanda real superó la prevista.",
        options: [
          { id: "p1", text: "Volver a validar el modelo y ajustar la propuesta con los nuevos datos.", ok: true, feedback: "Correcto. El proceso de Investigación de Operaciones admite revisión: se incorporan los datos reales y se ajusta la propuesta." },
          { id: "p2", text: "Ignorar el dato, la misión ya terminó.", ok: false, feedback: "En la práctica, los datos nuevos se incorporan al análisis. Ignorarlos haría que la decisión pierda fundamento." },
          { id: "p3", text: "Cambiar el objetivo del problema.", ok: false, feedback: "El objetivo se definió con el análisis previo. Cambiarlo sin nueva evidencia debilitaría la decisión." }
        ],
                loop: ["Validación", "Modelo"],
        adjustedCase: { id: "peak", name: "Datos reales del día", ico: "chart", items: [40, 85, 65], desc: "Llegaron 30 pedidos extra al final de la mañana." }
      }
    },

    hints: {
      1: [
        "Observa qué se acumula y qué recursos de reparto están disponibles.",
        "Las señales aparecen como eventos; el contexto son datos de fondo.",
        "Descarta lo que no afecta a los pedidos ni a las entregas."
      ],
      2: [
        "¿Qué resultado quieres modificar?",
        "Distingue entre la situación actual y el resultado deseado.",
        "Revisa los límites y recursos disponibles."
      ],
      3: [
        "Identifica qué entra, qué se procesa y qué sale.",
        "Conecta los recursos y restricciones con el almacén.",
        "Todos los nodos deben relacionarse con las entregas o sus recursos."
      ],
      4: [
        "¿Qué podemos cambiar? Esa es la decisión.",
        "El objetivo responde a: ¿qué queremos lograr?",
        "La capacidad del vehículo limita cuántos pedidos salen por viaje."
      ],
      5: [
        "Prueba cada caso y compara con lo observado.",
        "Si un resultado contradice el escenario, falta algo en el modelo.",
        "Revisa las restricciones del modelo."
      ],
      6: [
        "Evalúa cada alternativa contra el objetivo definido.",
        "Simula para comparar, no adivines.",
        "Más vehículos reducen el tiempo, pero cuestan más."
      ],
      7: [
        "Compara antes y después con los mismos indicadores.",
        "Las conclusiones deben estar respaldadas por las cifras.",
        "Revisa el tiempo total y los pedidos atendidos."
      ],
      8: [
        "Primero se prepara, después se aplica.",
        "Después de aplicar hay que observar y medir.",
        "Los datos reales pueden obligar a revisar la decisión."
      ]
    },

    completion: {
      title: "ENTREGA SIN PAUSA — MISIÓN COMPLETADA",
      text: "Convertiste una mañana caótica de pedidos en un problema estructurado y propusiste una solución fundamentada en el proceso de Investigación de Operaciones."
    }
  });

  /* ------------------------------------------------------------
     M4 · UNIVERSIDAD (sesiones de laboratorio)
  ------------------------------------------------------------ */
  OR.Missions.LIST.push({
    id: "university",
    code: "M-04",
    title: "Sesiones de Laboratorio",
    scenario: "Universidad",
    icon: "school",
    brief: "La universidad debe organizar grupos, horarios, espacios y profesores para una necesidad académica.",
    final: false,

    chaos: {
      title: "COORDINACIÓN ACADÉMICA",
      intro: "Eventos de la coordinación entre las 8:55 y las 9:28. Selecciona las señales relevantes.",
      items: [
        { id: "u1", time: "9:05", icon: "users", text: "Los 6 grupos de 40 estudiantes necesitan 2 sesiones de laboratorio cada uno.", cat: "signal" },
        { id: "u2", time: "9:12", icon: "lab", text: "Solo hay 3 laboratorios disponibles, con cupo para 40 personas.", cat: "signal" },
        { id: "u3", time: "9:20", icon: "clock", text: "Quedan 4 bloques de horario para todas las sesiones.", cat: "signal" },
        { id: "u4", time: "9:28", icon: "chat", text: "Varios grupos piden cambiar su horario de laboratorio.", cat: "signal" },
        { id: "u5", time: "9:02", icon: "doc", text: "El curso tiene 240 estudiantes inscritos.", cat: "context" },
        { id: "u6", time: "8:55", icon: "staff", text: "El profesor del curso entregó la lista de grupos.", cat: "context" },
        { id: "u7", time: "9:22", icon: "lamp", text: "Se actualizó el sistema de reserva de aulas.", cat: "context" },
        { id: "u8", time: "9:15", icon: "sun", text: "El día está soleado.", cat: "noise" },
        { id: "u9", time: "9:10", icon: "cafe", text: "El equipo de apoyo prepara café.", cat: "noise" },
        { id: "u10", time: "9:08", icon: "music", text: "Hay un festival musical en el campus.", cat: "noise" }
      ]
    },

    diagnosis: {
      prompt: "Con las señales seleccionadas, construye la descripción de lo que está ocurriendo:",
      slots: [
        {
          label: "MOMENTO",
          chips: [
            { id: "n1", text: "Durante la asignación de horarios", ok: true },
            { id: "n2", text: "Durante el festival del campus", ok: false },
            { id: "n3", text: "Durante el receso escolar", ok: false }
          ]
        },
        {
          label: "HECHO",
          chips: [
            { id: "n4", text: "las sesiones de laboratorio no caben", ok: true },
            { id: "n5", text: "el sistema de reservas falla", ok: false },
            { id: "n6", text: "los grupos no quieren el curso", ok: false }
          ]
        },
        {
          label: "CAUSA",
          chips: [
            { id: "n7", text: "porque la capacidad de los laboratorios es insuficiente", ok: true },
            { id: "n8", text: "porque el festival ocupa el campus", ok: false },
            { id: "n9", text: "porque los profesores no asistieron", ok: false }
          ]
        }
      ]
    },

    problem: {
      intro: "Transforma tus observaciones en una definición clara. Selecciona la opción correcta de cada bloque:",
      blocks: [
        {
          id: "actual", label: "SITUACIÓN ACTUAL",
          prompt: "¿Qué está ocurriendo realmente?",
          options: [
            { id: "a1", text: "Los grupos necesitan más sesiones de las que caben en los bloques disponibles.", ok: true },
            { id: "a2", text: "El curso no tiene profesor asignado.", ok: false },
            { id: "a3", text: "Los estudiantes no quieren cursar la materia.", ok: false }
          ]
        },
        {
          id: "deseado", label: "RESULTADO DESEADO",
          prompt: "¿Qué quieres lograr?",
          options: [
            { id: "b1", text: "Que todos los grupos realicen sus sesiones dentro del horario disponible.", ok: true },
            { id: "b2", text: "Reducir la matrícula del curso.", ok: false },
            { id: "b3", text: "Cancelar las sesiones de laboratorio.", ok: false }
          ]
        },
        {
          id: "afectados", label: "ELEMENTOS AFECTADOS",
          prompt: "¿Quiénes o qué se ven afectados?",
          options: [
            { id: "d1", text: "Grupos, laboratorios y horarios del curso.", ok: true },
            { id: "d2", text: "El equipo de fútbol de la universidad.", ok: false },
            { id: "d3", text: "Las cafeterías del campus.", ok: false }
          ]
        },
        {
          id: "restricciones", label: "RESTRICCIONES",
          prompt: "¿Qué límites hay que respetar?",
          options: [
            { id: "e1", text: "3 laboratorios con cupo de 40 y 4 bloques de horario.", ok: true },
            { id: "e2", text: "Se pueden construir laboratorios en una semana.", ok: false },
            { id: "e3", text: "El horario puede extenderse sin límite.", ok: false }
          ]
        },
        {
          id: "alcance", label: "ALCANCE",
          prompt: "¿Hasta dónde llega el análisis?",
          options: [
            { id: "f1", text: "Solo las sesiones de laboratorio de este curso en el periodo actual.", ok: true },
            { id: "f2", text: "Toda la oferta académica de la universidad.", ok: false },
            { id: "f3", text: "Los laboratorios de otras facultades.", ok: false }
          ]
        }
      ]
    },

    scope: {
      prompt: "Define el alcance: clasifica cada tarjeta dentro o fuera del análisis.",
      cards: [
        { id: "s1", ico: "users", text: "Los 6 grupos del curso", cat: "in" },
        { id: "s2", ico: "lab", text: "Los 3 laboratorios", cat: "in" },
        { id: "s3", ico: "clock", text: "Los 4 bloques de horario", cat: "in" },
        { id: "s4", ico: "gauge", text: "El cupo de 40 por laboratorio", cat: "in" },
        { id: "s5", ico: "book", text: "Las demás asignaturas", cat: "out" },
        { id: "s6", ico: "music", text: "El festival del campus", cat: "out" },
        { id: "s7", ico: "lab", text: "Los laboratorios de otras facultades", cat: "out" },
        { id: "s8", ico: "calendar", text: "El semestre anterior", cat: "out" }
      ]
    },

    construction: {
      intro: "Coloca los nodos sobre la mesa y conéctalos para representar la estructura de la organización de sesiones.",
      palette: [
        { id: "gr", label: "GRUPOS", ico: "users", role: "input" },
        { id: "se", label: "SESIONES REQUERIDAS", ico: "layers", role: "input" },
        { id: "lb", label: "LABORATORIOS", ico: "lab", role: "process" },
        { id: "as", label: "SESIONES ASIGNADAS", ico: "check", role: "output" },
        { id: "mt", label: "MATERIAL", ico: "box", role: "resource" },
        { id: "cu", label: "CUPO POR LABORATORIO", ico: "gauge", role: "constraint" },
        { id: "ho", label: "HORARIO DISPONIBLE", ico: "clock", role: "constraint" },
        { id: "mu", label: "MÚSICA DEL FESTIVAL", ico: "music", role: "none" },
        { id: "pr", label: "PREMIO DEL CURSO", ico: "trophy", role: "none" }
      ],
      links: [
        { from: "gr", to: "se" },
        { from: "se", to: "lb" },
        { from: "mt", to: "lb" },
        { from: "lb", to: "as" },
        { from: "cu", to: "lb" },
        { from: "ho", to: "as" }
      ]
    },

    model: {
      objective: {
        prompt: "¿Qué queremos lograr?",
        options: [
          { id: "o1", text: "Que todos los grupos realicen sus sesiones en el horario disponible.", ok: true },
          { id: "o2", text: "Organizar un festival en el campus.", ok: false },
          { id: "o3", text: "Cambiar la plataforma del curso.", ok: false }
        ]
      },
      decisions: {
        prompt: "¿Qué podemos cambiar? (decisiones controlables)",
        options: [
          { id: "d1", text: "Bloques asignados a cada grupo", ok: true },
          { id: "d2", text: "Laboratorios en uso", ok: true },
          { id: "d3", text: "Distribución de grupos en laboratorios", ok: true },
          { id: "d4", text: "Decoración de los laboratorios", ok: false },
          { id: "d5", text: "Música de fondo en las sesiones", ok: false }
        ]
      },
      constraints: {
        prompt: "¿Qué límites tenemos?",
        options: [
          { id: "r1", text: "Cupo de cada laboratorio (40 personas)", ok: true, required: true },
          { id: "r2", text: "3 laboratorios disponibles", ok: true },
          { id: "r3", text: "4 bloques de horario", ok: true },
          { id: "r4", text: "Horario ilimitado", ok: false },
          { id: "r5", text: "Laboratorios infinitos", ok: false }
        ]
      },
      data: {
        prompt: "¿Qué conocemos? (datos del escenario)",
        options: [
          { id: "t1", text: "240 estudiantes en 6 grupos", ok: true },
          { id: "t2", text: "Cada grupo requiere 2 sesiones", ok: true },
          { id: "t3", text: "Cada laboratorio admite 40 personas", ok: true },
          { id: "t4", text: "La universidad tiene 12 000 estudiantes", ok: false },
          { id: "t5", text: "El festival dura 3 días", ok: false }
        ]
      }
    },

    sim: {
      type: "sessions",
      groupLabel: "grupos",
      sessionLabel: "sesiones por grupo",
      slotLabel: "bloques de horario",
      base: { groups: 6, sessionsPerGroup: 2, labs: 3, blocks: 4 },
      constraint: {
        key: "labs",
        label: "Cupo y laboratorios disponibles",
        min: 1,
        impossibleText: "Resultado imposible: sin considerar el cupo de los laboratorios, la simulación asigna todas las sesiones sin problema, pero el escenario real muestra grupos que ya no caben.",
        fixText: "FALTA UNA RESTRICCIÓN: agrega el cupo de cada laboratorio a tu modelo para que represente el escenario real."
      },
      cases: [
        { id: "normal", name: "Curso normal", ico: "clock", groups: 6, sessionsPerGroup: 2, desc: "Los 240 estudiantes en 6 grupos." },
        { id: "peak", name: "Alta demanda", ico: "users", groups: 7, sessionsPerGroup: 2, desc: "Un grupo más se incorpora al curso." },
        { id: "low", name: "Baja demanda", ico: "down", groups: 5, sessionsPerGroup: 2, desc: "Un grupo de menos en el curso." }
      ]
    },

    alternatives: [
      {
        id: "A", name: "Cuarto laboratorio", ico: "lab",
        desc: "Se renta un laboratorio adicional con el mismo cupo.",
        params: { labs: 4, blocks: 4 },
        cost: 3,
        trade: "Todos los grupos caben, pero requiere rentar un espacio.",
        fit: { coverage: 1, cost: 0.3 }
      },
      {
        id: "B", name: "Sesiones condensadas", ico: "layers",
        desc: "Cada grupo realiza una sola sesión combinada.",
        params: { labs: 3, blocks: 4, sessionsPerGroup: 1 },
        cost: 1,
        trade: "Cumple el horario pero reduce el tiempo de práctica por grupo.",
        fit: { coverage: 0.6, cost: 0.9 }
      },
      {
        id: "C", name: "Un bloque extra", ico: "clock",
        desc: "Se aprovecha un bloque adicional con disponibilidad confirmada.",
        params: { labs: 3, blocks: 5 },
        cost: 2,
        trade: "Todos los grupos caben con un costo moderado.",
        fit: { coverage: 1, cost: 0.6 }
      }
    ],
    objectiveKey: "coverage",
    best: ["A", "C"],
    bestReason: "Tu objetivo es que todos los grupos realicen sus sesiones dentro del horario: las alternativas que garantizan la cobertura completa son coherentes con el objetivo definido.",

    results: {
      beforeLabel: "ANTES · horario actual",
      afterLabel: "PROPUESTA · alternativa elegida",
      conclusions: [
        { id: "k1", text: "Todos los grupos pueden realizar sus sesiones de laboratorio.", supported: true },
        { id: "k2", text: "La saturación de los laboratorios se reduce.", supported: true },
        { id: "k3", text: "La propuesta no requiere recursos adicionales.", supported: false },
        { id: "k4", text: "La capacidad instalada era suficiente desde el inicio.", supported: false }
      ]
    },

    implementation: {
      steps: [
        { id: "i1", text: "Confirmar la disponibilidad de los espacios adicionales." },
        { id: "i2", text: "Asignar los bloques a cada grupo en el nuevo plan." },
        { id: "i3", text: "Avisar a los grupos del cambio de horario." },
        { id: "i4", text: "Ejecutar las sesiones conforme al plan." },
        { id: "i5", text: "Registrar la asistencia y evaluar la capacidad real." }
      ],
      postEvent: {
        title: "DATOS REALES DEL ESCENARIO",
        text: "El día de inicio, tres grupos pidieron mover sus sesiones y dos laboratorios quedaron sin equipo temporalmente.",
        options: [
          { id: "p1", text: "Volver a validar el modelo y ajustar la propuesta con los nuevos datos.", ok: true, feedback: "Correcto. El proceso de Investigación de Operaciones admite revisión: se incorporan los datos reales y se ajusta la propuesta." },
          { id: "p2", text: "Ignorar el dato, la misión ya terminó.", ok: false, feedback: "En la práctica, los datos nuevos se incorporan al análisis. Ignorarlos haría que la decisión pierda fundamento." },
          { id: "p3", text: "Cambiar el objetivo del problema.", ok: false, feedback: "El objetivo se definió con el análisis previo. Cambiarlo sin nueva evidencia debilitaría la decisión." }
        ],
                loop: ["Validación", "Modelo"],
        adjustedCase: { id: "peak", name: "Datos reales del día", ico: "chart", groups: 8, sessionsPerGroup: 2, desc: "Se incorporó un grupo más y tres pidieron mover sus sesiones." }
      }
    },

    hints: {
      1: [
        "Observa cuántas sesiones se necesitan y cuánto espacio hay disponible.",
        "Las señales aparecen como eventos; el contexto son datos de fondo.",
        "Descarta lo que no afecta a las sesiones ni a los horarios."
      ],
      2: [
        "¿Qué resultado quieres modificar?",
        "Distingue entre la situación actual y el resultado deseado.",
        "Revisa los límites y recursos disponibles."
      ],
      3: [
        "Identifica qué entra, qué se procesa y qué sale.",
        "Conecta los recursos y restricciones con los laboratorios.",
        "Todos los nodos deben relacionarse con las sesiones o sus recursos."
      ],
      4: [
        "¿Qué podemos cambiar? Esa es la decisión.",
        "El objetivo responde a: ¿qué queremos lograr?",
        "El cupo del laboratorio limita cuántas personas caben por sesión."
      ],
      5: [
        "Prueba cada caso y compara con lo observado.",
        "Si un resultado contradice el escenario, falta algo en el modelo.",
        "Revisa las restricciones del modelo."
      ],
      6: [
        "Evalúa cada alternativa contra el objetivo definido.",
        "Simula para comparar, no adivines.",
        "La cobertura completa de los grupos puede requerir recursos extra."
      ],
      7: [
        "Compara antes y después con los mismos indicadores.",
        "Las conclusiones deben estar respaldadas por las cifras.",
        "Revisa la cobertura y la saturación de los laboratorios."
      ],
      8: [
        "Primero se prepara, después se aplica.",
        "Después de aplicar hay que observar y medir.",
        "Los datos reales pueden obligar a revisar la decisión."
      ]
    },

    completion: {
      title: "SESIONES DE LABORATORIO — MISIÓN COMPLETADA",
      text: "Organizaste los grupos, horarios y espacios con el proceso de Investigación de Operaciones: de un problema detectado a una decisión fundamentada."
    }
  });

  OR.Missions.get = function (id) {
    return OR.Missions.LIST.find((m) => m.id === id);
  };

  OR.Missions.main = function () {
    return OR.Missions.LIST.filter((m) => !m.final);
  };

  OR.Missions.final = function () {
    return OR.Missions.LIST.filter((m) => m.final)[0] || null;
  };
})(window.OR = window.OR || {});
