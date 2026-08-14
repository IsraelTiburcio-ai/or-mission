/* ============================================================
   OR MISSION · data/finalMission.js
   MISIÓN FINAL — OPERACIÓN CAMPUS.
   Experiencia integradora: análisis del sistema (guiño al
   Juego 3), detección del problema y las ocho fases de la
   Investigación de Operaciones.
   ============================================================ */
(function (OR) {
  "use strict";

  OR.Missions.LIST.push({
    id: "campus",
    code: "M-05",
    title: "Operación Campus",
    scenario: "Actividad universitaria especial",
    icon: "campus",
    brief: "La Feria del Conocimiento necesita coordinar espacios, personas, tiempos, recursos y capacidad. Usa todo lo aprendido.",
    final: true,
    hasSystemStage: true,

    systemStage: {
      intro: "Antes de aplicar la Investigación de Operaciones, identifica brevemente el sistema con lo aprendido en System Scope.",
      system: {
        prompt: "¿Cuál es el sistema principal que analizaremos?",
        options: [
          { id: "sys1", text: "La Feria del Conocimiento: el evento universitario como sistema.", ok: true },
          { id: "sys2", text: "La universidad completa, con todas sus carreras.", ok: false },
          { id: "sys3", text: "El sistema educativo nacional.", ok: false }
        ]
      },
      subsystems: {
        prompt: "Selecciona los subsistemas que forman parte del evento:",
        options: [
          { id: "sub1", text: "Área de talleres", ok: true },
          { id: "sub2", text: "Área de exposiciones", ok: true },
          { id: "sub3", text: "Área de registro y acreditación", ok: true },
          { id: "sub4", text: "El transporte público de la ciudad", ok: false },
          { id: "sub5", text: "La red eléctrica nacional", ok: false }
        ]
      },
      environment: {
        prompt: "¿Qué forma parte del entorno del sistema?",
        options: [
          { id: "env1", text: "Visitantes externos, proveedores y el clima de la región.", ok: true },
          { id: "env2", text: "La sala de juntas de la coordinación del evento.", ok: false },
          { id: "env3", text: "El presupuesto aprobado del evento.", ok: false }
        ]
      },
      scopeCards: {
        prompt: "Define el alcance: clasifica cada tarjeta dentro o fuera del análisis.",
        cards: [
          { id: "sc1", ico: "lab", text: "Los espacios del evento", cat: "in" },
          { id: "sc2", ico: "clock", text: "Los 2 días de la feria", cat: "in" },
          { id: "sc3", ico: "money", text: "El presupuesto del evento", cat: "in" },
          { id: "sc4", ico: "staff", text: "El personal voluntario", cat: "in" },
          { id: "sc5", ico: "calendar", text: "Las demás ferias del año", cat: "out" },
          { id: "sc6", ico: "school", text: "El sistema educativo nacional", cat: "out" },
          { id: "sc7", ico: "sun", text: "El clima de la región", cat: "out" },
          { id: "sc8", ico: "truck", text: "Los proveedores de otras ciudades", cat: "out" }
        ]
      }
    },

    chaos: {
      title: "MAÑANA DE COORDINACIÓN",
      intro: "Eventos de la coordinación de la feria entre las 8:20 y las 9:10. Selecciona las señales relevantes.",
      items: [
        { id: "f1", time: "8:40", icon: "users", text: "Se registraron 300 visitantes para el primer bloque.", cat: "signal" },
        { id: "f2", time: "8:45", icon: "layers", text: "Los 4 talleres necesitan 2 sesiones y las 4 exposiciones una.", cat: "signal" },
        { id: "f3", time: "8:52", icon: "clock", text: "Solo hay 4 bloques de horario en los 2 días del evento.", cat: "signal" },
        { id: "f4", time: "9:00", icon: "gauge", text: "Los espacios tienen cupo: 3 aulas de 50 y un salón de 120.", cat: "signal" },
        { id: "f5", time: "9:10", icon: "chat", text: "Se reciben solicitudes de 2 talleres adicionales.", cat: "signal" },
        { id: "f6", time: "8:30", icon: "doc", text: "La coordinación aprobó el presupuesto del evento.", cat: "context" },
        { id: "f7", time: "8:35", icon: "staff", text: "Hay 12 voluntarios registrados.", cat: "context" },
        { id: "f8", time: "8:50", icon: "sun", text: "El clima está despejado para los dos días.", cat: "noise" },
        { id: "f9", time: "8:58", icon: "music", text: "El grupo de la universidad tocará el segundo día.", cat: "noise" },
        { id: "f10", time: "8:20", icon: "cafe", text: "El café de bienvenida se pidió a la cafetería.", cat: "noise" }
      ]
    },

    diagnosis: {
      prompt: "Con las señales seleccionadas, construye la descripción de lo que está ocurriendo:",
      slots: [
        {
          label: "MOMENTO",
          chips: [
            { id: "q1", text: "Durante la organización del evento", ok: true },
            { id: "q2", text: "Durante el receso de verano", ok: false },
            { id: "q3", text: "Durante la inscripción del semestre", ok: false }
          ]
        },
        {
          label: "HECHO",
          chips: [
            { id: "q4", text: "las actividades no caben en el horario", ok: true },
            { id: "q5", text: "el café de bienvenida se terminó", ok: false },
            { id: "q6", text: "el clima cambió el programa", ok: false }
          ]
        },
        {
          label: "CAUSA",
          chips: [
            { id: "q7", text: "porque la capacidad de los espacios es insuficiente", ok: true },
            { id: "q8", text: "porque los voluntarios no llegaron", ok: false },
            { id: "q9", text: "porque el presupuesto se agotó", ok: false }
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
            { id: "a1", text: "Las actividades necesitan más sesiones de las que caben con holgura en los espacios disponibles.", ok: true },
            { id: "a2", text: "El evento no tiene presupuesto aprobado.", ok: false },
            { id: "a3", text: "Los visitantes no quieren asistir a la feria.", ok: false }
          ]
        },
        {
          id: "deseado", label: "RESULTADO DESEADO",
          prompt: "¿Qué quieres lograr?",
          options: [
            { id: "b1", text: "Que todas las actividades se realicen dentro de los 2 días del evento.", ok: true },
            { id: "b2", text: "Reducir el número de visitantes de la feria.", ok: false },
            { id: "b3", text: "Cancelar las exposiciones.", ok: false }
          ]
        },
        {
          id: "afectados", label: "ELEMENTOS AFECTADOS",
          prompt: "¿Quiénes o qué se ven afectados?",
          options: [
            { id: "d1", text: "Actividades, espacios, horarios y visitantes del evento.", ok: true },
            { id: "d2", text: "El equipo de fútbol de la universidad.", ok: false },
            { id: "d3", text: "Las editoriales de otra ciudad.", ok: false }
          ]
        },
        {
          id: "restricciones", label: "RESTRICCIONES",
          prompt: "¿Qué límites hay que respetar?",
          options: [
            { id: "e1", text: "4 espacios con cupo definido y 4 bloques de horario.", ok: true },
            { id: "e2", text: "Se pueden construir espacios en una noche.", ok: false },
            { id: "e3", text: "El evento puede durar todo lo que se necesite.", ok: false }
          ]
        },
        {
          id: "alcance", label: "ALCANCE",
          prompt: "¿Hasta dónde llega el análisis?",
          options: [
            { id: "f1", text: "Solo la Feria del Conocimiento durante sus 2 días.", ok: true },
            { id: "f2", text: "Todas las actividades de la universidad del año.", ok: false },
            { id: "f3", text: "Las ferias de otras universidades.", ok: false }
          ]
        }
      ]
    },

    scope: {
      prompt: "Define el alcance del análisis operativo: clasifica cada tarjeta dentro o fuera.",
      cards: [
        { id: "s1", ico: "lab", text: "Los espacios del evento", cat: "in" },
        { id: "s2", ico: "clock", text: "Los 2 días de la feria", cat: "in" },
        { id: "s3", ico: "users", text: "Los visitantes registrados", cat: "in" },
        { id: "s4", ico: "money", text: "El presupuesto del evento", cat: "in" },
        { id: "s5", ico: "calendar", text: "Las demás ferias del año", cat: "out" },
        { id: "s6", ico: "school", text: "El sistema educativo nacional", cat: "out" },
        { id: "s7", ico: "sun", text: "El clima de la región", cat: "out" },
        { id: "s8", ico: "truck", text: "Los proveedores de otras ciudades", cat: "out" }
      ]
    },

    construction: {
      intro: "Coloca los nodos sobre la mesa y conéctalos para representar la estructura del evento como sistema de operación.",
      palette: [
        { id: "vi", label: "VISITANTES", ico: "users", role: "input" },
        { id: "ac", label: "ACTIVIDADES", ico: "layers", role: "input" },
        { id: "re", label: "REGISTRO", ico: "cashier", role: "process" },
        { id: "es", label: "ESPACIOS", ico: "lab", role: "process" },
        { id: "ar", label: "ACTIVIDADES REALIZADAS", ico: "check", role: "output" },
        { id: "vo", label: "VOLUNTARIOS", ico: "staff", role: "resource" },
        { id: "ma", label: "MATERIALES", ico: "box", role: "resource" },
        { id: "cu", label: "CUPO POR ESPACIO", ico: "gauge", role: "constraint" },
        { id: "ho", label: "HORARIO DEL EVENTO", ico: "clock", role: "constraint" },
        { id: "mu", label: "MÚSICA DEL EVENTO", ico: "music", role: "none" },
        { id: "pr", label: "PREMIOS SORTEADOS", ico: "trophy", role: "none" }
      ],
      links: [
        { from: "vi", to: "re" },
        { from: "re", to: "es" },
        { from: "ac", to: "es" },
        { from: "vo", to: "es" },
        { from: "ma", to: "es" },
        { from: "es", to: "ar" },
        { from: "cu", to: "es" },
        { from: "ho", to: "re" }
      ]
    },

    model: {
      objective: {
        prompt: "¿Qué queremos lograr?",
        options: [
          { id: "o1", text: "Que todas las actividades se realicen dentro del horario del evento.", ok: true },
          { id: "o2", text: "Organizar más ferias durante el año.", ok: false },
          { id: "o3", text: "Cambiar el nombre del evento.", ok: false }
        ]
      },
      decisions: {
        prompt: "¿Qué podemos cambiar? (decisiones controlables)",
        options: [
          { id: "d1", text: "Sesiones por actividad", ok: true },
          { id: "d2", text: "Espacios en uso", ok: true },
          { id: "d3", text: "Distribución de visitantes en bloques", ok: true },
          { id: "d4", text: "Decoración de los pasillos", ok: false },
          { id: "d5", text: "Música de la ceremonia de cierre", ok: false }
        ]
      },
      constraints: {
        prompt: "¿Qué límites tenemos?",
        options: [
          { id: "r1", text: "Cupo por espacio (aulas de 50, salón de 120)", ok: true, required: true },
          { id: "r2", text: "4 espacios disponibles", ok: true },
          { id: "r3", text: "4 bloques de horario", ok: true },
          { id: "r4", text: "Presupuesto del evento", ok: true },
          { id: "r5", text: "Horario ilimitado", ok: false },
          { id: "r6", text: "Espacios infinitos", ok: false }
        ]
      },
      data: {
        prompt: "¿Qué conocemos? (datos del escenario)",
        options: [
          { id: "t1", text: "300 visitantes registrados", ok: true },
          { id: "t2", text: "8 actividades: 4 talleres y 4 exposiciones", ok: true },
          { id: "t3", text: "Cada taller requiere 2 sesiones", ok: true },
          { id: "t4", text: "12 voluntarios disponibles", ok: true },
          { id: "t5", text: "La universidad tiene 12 000 estudiantes", ok: false },
          { id: "t6", text: "El clima estará despejado", ok: false }
        ]
      }
    },

    sim: {
      type: "sessions",
      groupLabel: "actividades",
      sessionLabel: "sesiones por actividad",
      slotLabel: "bloques de horario",
      base: { sessions: [2, 2, 2, 2, 1, 1, 1, 1], spaces: 4, blocks: 4 },
      constraint: {
        key: "spaces",
        label: "Cupo por espacio",
        min: 1,
        impossibleText: "Resultado imposible: sin considerar el cupo de los espacios, la simulación acomoda todas las sesiones en un solo bloque, pero el escenario real muestra solicitudes de talleres que ya no caben.",
        fixText: "FALTA UNA RESTRICCIÓN: agrega el cupo por espacio a tu modelo para que represente el escenario real."
      },
      cases: [
        { id: "normal", name: "Programa previsto", ico: "clock", sessions: [2, 2, 2, 2, 1, 1, 1, 1], desc: "Las 8 actividades del programa original." },
        { id: "peak", name: "Talleres extra", ico: "users", sessions: [2, 2, 2, 2, 2, 2, 1, 1, 1, 1], desc: "Se agregan 2 talleres: 10 actividades." },
        { id: "low", name: "Programa reducido", ico: "down", sessions: [1, 1, 1, 1, 1, 1, 1, 1], desc: "Actividades con una sola sesión." }
      ]
    },

    alternatives: [
      {
        id: "A", name: "Espacio adicional", ico: "lab",
        desc: "Se adapta un espacio extra con cupo similar.",
        params: { spaces: 5, blocks: 4 },
        cost: 3,
        trade: "Todos caben con margen, pero hay que acondicionar un espacio.",
        fit: { coverage: 1, cost: 0.3 }
      },
      {
        id: "B", name: "Talleres combinados", ico: "layers",
        desc: "Tres talleres reducen su práctica a una sesión.",
        params: { spaces: 4, blocks: 4, sessions: [2, 2, 2, 1, 1, 1, 1, 1, 1, 1] },
        cost: 1,
        trade: "Cumple el horario pero reduce el tiempo de taller de tres grupos.",
        fit: { coverage: 0.8, cost: 0.9 }
      },
      {
        id: "C", name: "Bloque adicional", ico: "clock",
        desc: "Se aprovecha un bloque extra confirmado en uno de los días.",
        params: { spaces: 4, blocks: 5 },
        cost: 2,
        trade: "Todos caben con costo moderado y sin nuevos espacios.",
        fit: { coverage: 1, cost: 0.6 }
      }
    ],
    objectiveKey: "coverage",
    best: ["A", "C"],
    bestReason: "Tu objetivo es que todas las actividades se realicen dentro del horario: las alternativas que garantizan la cobertura completa son coherentes con el objetivo definido.",

    results: {
      beforeLabel: "ANTES · programa actual",
      afterLabel: "PROPUESTA · alternativa elegida",
      conclusions: [
        { id: "k1", text: "Todas las actividades pueden realizarse dentro del evento.", supported: true },
        { id: "k2", text: "La saturación de los espacios se reduce.", supported: true },
        { id: "k3", text: "La propuesta no requiere recursos adicionales.", supported: false },
        { id: "k4", text: "La capacidad instalada era suficiente desde el inicio.", supported: false }
      ]
    },

    implementation: {
      steps: [
        { id: "i1", text: "Confirmar los espacios y ajustar el plan de bloques." },
        { id: "i2", text: "Asignar voluntarios y materiales a cada actividad." },
        { id: "i3", text: "Comunicar el programa final a los visitantes." },
        { id: "i4", text: "Ejecutar la feria conforme al plan." },
        { id: "i5", text: "Medir la asistencia y registrar la capacidad utilizada." }
      ],
      postEvent: {
        title: "DATOS REALES DEL ESCENARIO",
        text: "Durante el evento, dos talleres tuvieron el doble de participantes esperados y un espacio quedó sin material por un error del proveedor.",
        options: [
          { id: "p1", text: "Volver a validar el modelo y ajustar la propuesta con los nuevos datos.", ok: true, feedback: "Correcto. La Investigación de Operaciones admite revisión: los datos reales se incorporan y el plan se ajusta." },
          { id: "p2", text: "Ignorar el dato, el evento ya terminó.", ok: false, feedback: "En la práctica, los datos nuevos se incorporan al análisis. Ignorarlos haría que la decisión pierda fundamento." },
          { id: "p3", text: "Cambiar el objetivo del problema.", ok: false, feedback: "El objetivo se definió con el análisis previo. Cambiarlo sin nueva evidencia debilitaría la decisión." }
        ],
        loop: ["Validación", "Modelo"],
        adjustedCase: { id: "peak", name: "Datos reales del día", ico: "chart", sessions: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1], desc: "Un taller más se incorporó y dos talleres duplicaron participantes." }
      }
    },

    hints: {
      0: [
        "El sistema principal es el evento: la Feria del Conocimiento.",
        "Los subsistemas son sus áreas internas: talleres, exposiciones y registro.",
        "El entorno incluye lo que está fuera del evento: visitantes externos, proveedores y clima."
      ],
      1: [
        "Observa cuántas sesiones se necesitan y cuántos espacios hay.",
        "Las señales aparecen como eventos; el contexto son datos de fondo.",
        "Descarta lo que no afecta al programa ni a la capacidad."
      ],
      2: [
        "¿Qué resultado quieres modificar?",
        "Distingue entre la situación actual y el resultado deseado.",
        "Revisa los límites y recursos disponibles."
      ],
      3: [
        "Identifica qué entra, qué se procesa y qué sale.",
        "Conecta los recursos y restricciones con los espacios.",
        "Todos los nodos deben relacionarse con las actividades o sus recursos."
      ],
      4: [
        "¿Qué podemos cambiar? Esa es la decisión.",
        "El objetivo responde a: ¿qué queremos lograr?",
        "El cupo por espacio limita cuántas sesiones caben por bloque."
      ],
      5: [
        "Prueba cada caso y compara con lo observado.",
        "Si un resultado contradice el escenario, falta algo en el modelo.",
        "Revisa las restricciones del modelo."
      ],
      6: [
        "Evalúa cada alternativa contra el objetivo definido.",
        "Simula para comparar, no adivines.",
        "La cobertura completa puede requerir recursos extra."
      ],
      7: [
        "Compara antes y después con los mismos indicadores.",
        "Las conclusiones deben estar respaldadas por las cifras.",
        "Revisa la cobertura y la saturación de los espacios."
      ],
      8: [
        "Primero se prepara, después se aplica.",
        "Después de aplicar hay que observar y medir.",
        "Los datos reales pueden obligar a revisar la decisión."
      ]
    },

    completion: {
      title: "OPERACIÓN CAMPUS — MISIÓN COMPLETADA",
      text: "Analizaste el evento como sistema, detectaste el problema, lo definiste, lo modelaste, lo validaste y propusiste una implementación. Es el recorrido completo de la Investigación de Operaciones."
    }
  });
})(window.OR = window.OR || {});
