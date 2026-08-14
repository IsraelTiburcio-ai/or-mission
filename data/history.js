/* ============================================================
   OR MISSION · data/history.js
   Archivo histórico. Contenido académico únicamente del
   Gimnasio 1 (sección 1.6 y complementos).
   ============================================================ */
(function (OR) {
  "use strict";

  OR.History = OR.History || {};

  OR.History.BLOCKS = [
    {
      title: "Origen de la Investigación de Operaciones",
      text: "La Investigación de Operaciones nació en Inglaterra durante la Segunda Guerra Mundial, cuando se conformaron equipos interdisciplinarios cuyo objetivo era encontrar soluciones a los problemas militares. Desde entonces se organizó como una forma estructurada de analizar problemas complejos de operación y tomar decisiones."
    },
    {
      title: "Promotores",
      text: "Dentro de los promotores más importantes de la disciplina se estudian:",
      items: [
        "C. W. Churchman — impulsó la aplicación de la Investigación de Operaciones a problemas organizacionales.",
        "R. L. Ackoff — promotor del enfoque sistémico aplicado a la toma de decisiones.",
        "Richard Bellman — promotor de la programación dinámica."
      ]
    },
    {
      title: "Línea de tiempo del enfoque de sistemas",
      timeline: [
        { year: "1954", text: "Se organiza de forma estructurada el enfoque de sistemas." },
        { year: "1956", text: "Se publica el anuario Sistemas Generales con el artículo principal \u201cSistemas generales\u201d de Ludwig von Bertalanffy, donde se presentan los propósitos de la nueva disciplina." },
        { year: "1957", text: "Avance del movimiento de la teoría general de sistemas." },
        { year: "1968", text: "Se publica el libro Teoría general de sistemas de Ludwig von Bertalanffy." }
      ]
    },
    {
      title: "Propósitos de la Teoría General de Sistemas",
      items: [
        "Adoptar un enfoque holístico hacia los sistemas.",
        "Provocar la generalidad de las leyes particulares mediante similitudes de estructura.",
        "Promover la unidad de las ciencias.",
        "Animar al uso de modelos matemáticos."
      ]
    },
    {
      title: "Contexto histórico: \u201cCódigo Enigma\u201d",
      text: "La película \u201cCódigo Enigma\u201d cuenta la historia de Alan Turing y su equipo en Bletchley Park, quienes descifraron el código Enigma utilizado por los nazis durante la Segunda Guerra Mundial. Este logro no solo acortó la guerra, sino que también marcó el nacimiento de la informática moderna y de métodos avanzados de análisis matemático y lógico."
    },
    {
      title: "Vínculo con la Investigación de Operaciones",
      text: "La Investigación de Operaciones se centra en la optimización de procesos y la toma de decisiones en entornos complejos. De la misma forma, Turing y su equipo optimizaron el proceso de descifrado tomando decisiones cruciales sobre qué mensajes intentar descifrar y cómo ajustar el enfoque para maximizar sus probabilidades de éxito. Un aspecto clave fue el uso del análisis probabilístico para reducir el número de combinaciones posibles de la máquina Enigma, similar a cómo en la Investigación de Operaciones se utilizan la teoría de probabilidades y la estadística para modelar y resolver problemas."
    }
  ];
})(window.OR = window.OR || {});
