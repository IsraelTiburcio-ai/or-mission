/* ============================================================
   OR MISSION · js/phaseRenderer.js
   Render de las fases de una misión: intro, pasos, mecánicas,
   verificación y acciones. Cada fase lee el estado persistido
   de las fases anteriores (misión continua).
   ============================================================ */
(function (OR) {
  "use strict";

  const { el } = OR.UI;
  const UI = OR.UI;

  // memoria del paso actual por misión+fase (no persistido)
  const stepMemory = {};

  function stepIndex(missionId, phase) {
    const key = missionId + ":" + phase;
    return stepMemory[key] || 0;
  }
  function setStepIndex(missionId, phase, i) {
    stepMemory[missionId + ":" + phase] = i;
  }

  const STEPDEFS = {
    system: [
      { id: "sys", label: "EL SISTEMA" },
      { id: "scp", label: "DEFINE EL ALCANCE" }
    ],
    problem: [
      { id: "radar", label: "RADAR DEL PROBLEMA" },
      { id: "diag", label: "¿QUÉ ESTÁ OCURRIENDO?" }
    ],
    definition: [
      { id: "cons", label: "CONSTRUCTOR DEL PROBLEMA" },
      { id: "scope", label: "DEFINE EL ALCANCE" }
    ],
    construction: [{ id: "build", label: "MESA DE CONSTRUCCIÓN" }],
    model: [{ id: "mb", label: "MODEL BUILDER" }],
    validation: [{ id: "lab", label: "CÁMARA DE VALIDACIÓN" }],
    solution: [{ id: "mesa", label: "MESA DE DECISIONES" }],
    results: [
      { id: "cmp", label: "ANTES vs PROPUESTA" },
      { id: "interp", label: "¿QUÉ SIGNIFICAN?" }
    ],
    implementation: [
      { id: "order", label: "PLAN DE IMPLEMENTACIÓN" },
      { id: "apply", label: "APLICAR CAMBIO" },
      { id: "post", label: "EVENTO POST-IMPLEMENTACIÓN" }
    ]
  };

  /* ================== utilidades ================== */

  function reduced() {
    return OR.State.get().settings.reducedMotion === true;
  }

  function feedbackBox(container, html, type) {
    const old = container.querySelector(".feedback");
    if (old) old.remove();
    const f = UI.feedbackEl(html, type);
    container.appendChild(f);
    return f;
  }

  function feedbackOk(container, html) {
    OR.Audio.play("success");
    feedbackBox(container, html, "ok");
  }

  function feedbackErr(container, html) {
    OR.Audio.play("error");
    feedbackBox(container, html, "err");
  }

  function feedbackWarn(container, html) {
    OR.Audio.play("warn");
    feedbackBox(container, html, "warn");
  }

  function attempt(mission) {
    const state = OR.MissionEngine.st(mission);
    state.wrongAnswers += 1;
    OR.State.get().stats.wrongAnswers += 1;
    OR.Storage.saveSoon();
  }

  /** Casos efectivos: con bucle de mejora se usa el caso de datos reales. */
  function effectiveCases(mission) {
    const state = OR.MissionEngine.st(mission);
    const post = mission.implementation.postEvent;
    if (state.revisionLoop && post.adjustedCase) {
      return mission.sim.cases.map((c) => (c.id === "peak" ? post.adjustedCase : c));
    }
    return mission.sim.cases;
  }

  function caseParams(simDef, caseDef) {
    const base = Object.assign({}, simDef.base);
    return Object.assign({}, base, caseDef);
  }

  function caseMessage(simDef, caseDef, r, capacityLimited) {
    const names = {
      queue: ["personas", "personas"],
      trips: ["pedidos", "paquetes"],
      sessions: ["sesiones", "actividades"]
    };
    const [p1, p2] = names[simDef.type] || ["elementos", "elementos"];
    if (!capacityLimited) {
      return `Tu modelo no limita la capacidad: la simulación atiende todo sin problema (${r.attendedPct}%), lo que contradice lo observado en el escenario real.`;
    }
    if (r.type === "queue") {
      if (r.feasible) return `La fila se despeja dentro del horario: se atienden ${r.attended} de ${r.totalArrivals} ${p1} (${r.attendedPct}%).`;
      return `No se alcanza a atender toda la demanda en el horario: quedan ${r.finalBacklog} ${p1} sin atender al cierre (espera máxima de ${r.maxWait} min).`;
    }
    if (r.type === "trips") {
      if (r.feasible) return `Todos los ${p2} se entregan dentro de la jornada: ${r.totalTrips} viajes en ${r.totalTime} min (margen de ${r.marginMin} min).`;
      return `El reparto excede la jornada: se necesitan ${r.totalTime} min y solo hay ${simDef.horizonMin} min disponibles (${r.attendedPct}% de la demanda).`;
    }
    if (r.type === "sessions") {
      if (r.feasible) return `Todas las ${p1} caben: ${r.needed} sesiones en ${r.slots} lugares (saturación ${r.saturation}%).`;
      return `Las ${p1} no caben: se necesitan ${r.needed} y solo hay ${r.slots} lugares (${r.attendedPct}% cubiertas).`;
    }
    return "";
  }

  function metricMarkup(r) {
    const rows = OR.SimEngine.metricRows(null, r);
    return rows.map((m) => `
      <div class="sim-metric ${m.cls}">
        <div class="sm-label">${m.label}</div>
        <div class="sm-value">${m.value} <span style="font-size:.7rem;color:var(--text-2)">${m.unit}</span></div>
      </div>`).join("");
  }

  /* ================== render principal ================== */

  function render() {
    const host = document.getElementById("mission-host");
    host.innerHTML = "";
    const mission = OR.MissionEngine.currentMission();
    if (!mission) return;
    const phase = OR.MissionEngine.currentPhase();
    const phases = OR.MissionEngine.phasesFor(mission);
    const phaseDef = phases[phase];
    if (!phaseDef) return;
    const stt = OR.MissionEngine.st(mission);
    const free = OR.MissionEngine.isFree();
    const steps = STEPDEFS[phaseDef.id] || [];

    // --- cabecera
    const header = el("header", { class: "phase-header" });
    header.appendChild(el("div", { class: "phase-num", text: phaseDef.num }));
    const titleBlock = el("div", { class: "phase-title-block" });
    titleBlock.appendChild(el("h2", { text: phaseDef.title }));
    const stepLabel = steps[stepIndex(mission.id, phase)] || steps[0];
    const sub = phaseDef.id === "system"
      ? "Análisis del sistema antes de la Investigación de Operaciones"
      : `Fase ${phaseDef.num} · ${stepLabel ? stepLabel.label : ""}`;
    titleBlock.appendChild(el("p", { class: "phase-sub", text: sub }));
    header.appendChild(titleBlock);
    if (free) {
      header.appendChild(el("span", { class: "tag tag-slate", text: "SALA DE ANÁLISIS · sin puntuación" }));
    }
    const tools = el("div", { class: "phase-tools" });
    const hintBtn = el("button", { class: "btn btn-ghost btn-sm", "aria-label": "Ver pista" },
      el("span", { html: UI.icon("help", 15) }), el("span", { text: "PISTA" }));
    hintBtn.addEventListener("click", () => openHint(mission, phase));
    tools.appendChild(hintBtn);
    const whyBtn = el("button", { class: "btn btn-ghost btn-sm", "aria-label": "Explicación de la fase" },
      el("span", { html: UI.icon("info", 15) }), el("span", { text: "¿POR QUÉ?" }));
    whyBtn.addEventListener("click", () => openWhy(mission, phase));
    tools.appendChild(whyBtn);
    header.appendChild(tools);
    host.appendChild(header);

    // --- cuerpo
    const body = el("div", { class: "phase-body" });
    host.appendChild(body);

    const stateStep = stepIndex(mission.id, phase);
    const stepDef = steps[stateStep] || steps[0];

    // intro de fase (primera visita del flujo)
    const visited = phaseVisited(mission, phase);
    if (!visited && !stt.done) {
      renderPhaseIntro(mission, phase, body);
      return;
    }

    renderStep(mission, phase, stepDef, body);
  }

  function phaseVisited(mission, phase) {
    return stepMemory[mission.id + ":" + phase + ":visited"] === true;
  }

  function renderPhaseIntro(mission, phase, body) {
    const phases = OR.MissionEngine.phasesFor(mission);
    const p = phases[phase];
    const free = OR.MissionEngine.isFree();
    const phaseText = {
      system: {
        t: "ANALIZA EL SISTEMA",
        d: "Antes de aplicar la Investigación de Operaciones, identifica el sistema del evento: sus subsistemas, su entorno y su alcance. Es aplicar lo aprendido en System Scope.",
        g: "Identifica el sistema principal, sus subsistemas, el entorno y el alcance."
      },
      problem: {
        t: "DETECTAR EL PROBLEMA",
        d: "La situación llega desordenada: datos, personas, recursos y comentarios pasan al mismo tiempo. Tu trabajo es separar las señales relevantes del ruido.",
        g: "Selecciona las señales que indican qué está ocurriendo y construye una descripción."
      },
      definition: {
        t: "DEFINIR EL PROBLEMA",
        d: "Las observaciones se transforman en una definición clara: situación actual, resultado deseado, elementos afectados, restricciones y alcance.",
        g: "Construye la definición del problema y delimita el alcance del análisis."
      },
      construction: {
        t: "CONSTRUIR LA ESTRUCTURA",
        d: "La definición se convierte en un sistema: elementos, relaciones, recursos y restricciones sobre la mesa de construcción.",
        g: "Coloca los nodos y conéctalos para representar la estructura del problema."
      },
      model: {
        t: "MODELAR EL PROBLEMA",
        d: "Representamos el problema de forma simplificada: qué podemos decidir, qué conocemos, qué nos limita y qué buscamos lograr.",
        g: "Construye el modelo conceptual: objetivo, decisiones, restricciones y datos."
      },
      validation: {
        t: "VALIDAR EL MODELO",
        d: "Antes de confiar en un modelo debemos comprobar que representa de manera suficientemente coherente la situación que queremos analizar.",
        g: "Prueba escenarios y ejecuta el escáner de validación sobre el modelo."
      },
      solution: {
        t: "BUSCAR LA SOLUCIÓN",
        d: "Con el modelo validado se comparan alternativas de acción. Cada una tiene ventajas y costos: la decisión debe ser coherente con tu objetivo.",
        g: "Simula las alternativas y elige la más coherente con el objetivo definido."
      },
      results: {
        t: "INTERPRETAR RESULTADOS",
        d: "No basta con números: hay que comparar la situación antes y después de la propuesta y decidir qué significan realmente los resultados.",
        g: "Compara antes vs propuesta y selecciona las conclusiones respaldadas."
      },
      implementation: {
        t: "IMPLEMENTAR LA PROPUESTA",
        d: "La decisión se lleva a la práctica con un plan ordenado. Después, los datos reales del escenario pueden obligar a revisar el proceso.",
        g: "Ordena el plan, aplícalo y decide qué hacer con los datos reales."
      }
    };
    const txt = phaseText[p.id] || { t: p.title, d: "", g: "" };
    const intro = el("div", { class: "phase-intro" });
    intro.appendChild(el("div", { class: "pi-icon", html: UI.icon(iconForPhase(p.id), 46) }));
    intro.appendChild(el("h2", { html: `<span class="pi-num">FASE ${p.num}</span> · ${txt.t}` }));
    intro.appendChild(el("p", { text: txt.d }));
    intro.appendChild(el("div", { class: "pi-goal" }, el("p", { html: `<b>Objetivo de la fase:</b> ${txt.g}` })));
    if (free) intro.appendChild(el("p", { style: "color:var(--text-2);font-size:.9rem", text: "Modo libre: puedes recorrer la fase sin puntuación y volver cuando quieras." }));
    const startBtn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "INICIAR FASE ▸" }));
    startBtn.addEventListener("click", () => {
      OR.Audio.play("unlock");
      stepMemory[mission.id + ":" + phase + ":visited"] = true;
      render();
    });
    intro.appendChild(startBtn);
    body.appendChild(intro);
  }

  function iconForPhase(id) {
    return {
      system: "network", problem: "radar", definition: "target", construction: "model",
      model: "layers", validation: "scanner", solution: "decision", results: "file",
      implementation: "rocket"
    }[id] || "info";
  }

  /* ================== pasos ================== */

  function renderStep(mission, phase, stepDef, body) {
    const fn = STEP_RENDERERS[stepDef.id];
    if (!fn) return;
    const panel = el("div", { class: "phase-step" });
    body.appendChild(panel);
    fn(mission, phase, panel, stepDef);
  }

  const STEP_RENDERERS = {};

  /* ---------- 0. SISTEMA ---------- */
  STEP_RENDERERS.sys = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.systemStage;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">01</span>EL SISTEMA PRINCIPAL` }),
      el("p", { text: data.intro })));

    // sistema principal
    const sysBlock = el("div", { class: "model-slot obj" });
    sysBlock.appendChild(el("div", { class: "model-slot-head" },
      el("span", { class: "m-ico", html: UI.icon("network", 20) }),
      el("h4", { text: "SISTEMA PRINCIPAL" })));
    const sysOpts = el("div", { class: "model-options" });
    data.system.options.forEach((o) => {
      const b = el("button", { class: "model-option" + (state.system.system === o.id ? " selected" : ""), role: "radio", "aria-checked": state.system.system === o.id },
        el("span", { class: "o-box" }), el("span", { text: o.text }));
      b.addEventListener("click", () => {
        state.system.system = o.id;
        OR.Audio.play("snap");
        render();
      });
      sysOpts.appendChild(b);
    });
    sysBlock.appendChild(sysOpts);
    panel.appendChild(sysBlock);

    // subsistemas
    const subBlock = el("div", { class: "model-slot dec" });
    subBlock.appendChild(el("div", { class: "model-slot-head" },
      el("span", { class: "m-ico", html: UI.icon("layers", 20) }),
      el("h4", { text: "SUBSISTEMAS DEL EVENTO" })));
    const subOpts = el("div", { class: "model-options" });
    data.subsystems.options.forEach((o) => {
      const sel = state.system.subsystems.includes(o.id);
      const b = el("button", { class: "model-option" + (sel ? " selected" : "") },
        el("span", { class: "o-box" }), el("span", { text: o.text }));
      b.addEventListener("click", () => {
        if (sel) state.system.subsystems = state.system.subsystems.filter((x) => x !== o.id);
        else state.system.subsystems.push(o.id);
        OR.Audio.play("toggle");
        render();
      });
      subOpts.appendChild(b);
    });
    subBlock.appendChild(subOpts);
    panel.appendChild(subBlock);

    // entorno
    const envBlock = el("div", { class: "model-slot dat" });
    envBlock.appendChild(el("div", { class: "model-slot-head" },
      el("span", { class: "m-ico", html: UI.icon("map", 20) }),
      el("h4", { text: "ENTORNO" })));
    const envOpts = el("div", { class: "model-options" });
    data.environment.options.forEach((o) => {
      const b = el("button", { class: "model-option" + (state.system.environment === o.id ? " selected" : ""), role: "radio", "aria-checked": state.system.environment === o.id },
        el("span", { class: "o-box" }), el("span", { text: o.text }));
      b.addEventListener("click", () => {
        state.system.environment = o.id;
        OR.Audio.play("snap");
        render();
      });
      envOpts.appendChild(b);
    });
    envBlock.appendChild(envOpts);
    panel.appendChild(envBlock);

    // verificación
    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary" }, el("span", { text: "VERIFICAR IDENTIFICACIÓN" }));
    btn.addEventListener("click", () => {
      const sysOk = state.system.system && data.system.options.find((o) => o.id === state.system.system).ok;
      const subOk = data.subsystems.options.filter((o) => o.ok).every((o) => state.system.subsystems.includes(o.id));
      const subClean = state.system.subsystems.every((id) => data.subsystems.options.find((o) => o.id === id) && data.subsystems.options.find((o) => o.id === id).ok);
      const envOk = state.system.environment && data.environment.options.find((o) => o.id === state.system.environment).ok;
      if (sysOk && subOk && subClean && envOk) {
        feedbackOk(feed, "Correcto. El evento es el sistema principal, sus áreas son subsistemas y el entorno queda fuera del análisis. Ahora define el alcance en el siguiente paso.");
        setStepIndex(mission.id, phase, 1);
        render();
      } else {
        attempt(mission);
        const msgs = [];
        if (!sysOk) msgs.push("El sistema principal no es el correcto: analizamos el evento, no toda la universidad.");
        if (!subOk || !subClean) msgs.push("Los subsistemas deben ser las áreas internas del evento (talleres, exposiciones, registro).");
        if (!envOk) msgs.push("El entorno es lo externo al sistema: visitantes externos, proveedores y clima.");
        feedbackErr(feed, msgs.join(" "));
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  STEP_RENDERERS.scp = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.systemStage.scopeCards;
    renderScopeCards(panel, data, state.system.scope, () => {
      const allOk = data.cards.every((c) => state.system.scope[c.id] === c.cat);
      if (allOk) {
        completePhaseNow(mission, phase);
        render();
      } else {
        attempt(mission);
        const wrong = data.cards.filter((c) => state.system.scope[c.id] !== c.cat);
        feedbackErr(panel, `Aún hay ${wrong.length} tarjeta(s) mal clasificada(s). Revisa: dentro del análisis está lo que pertenece al evento y al periodo; fuera, lo externo.`);
      }
    });
    buildActions(mission, phase, panel, { canContinue: false });
  };

  /* ---------- FASE 1 · PROBLEMA ---------- */
  STEP_RENDERERS.radar = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.chaos;
    const signals = data.items.filter((i) => i.cat === "signal").length;

    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">P1</span>RADAR DEL PROBLEMA` }),
      el("p", { text: data.intro })));

    const console = el("div", { class: "chaos-console" });
    const feed = el("div", { class: "chaos-feed", role: "list", "aria-label": "Eventos del escenario" });
    data.items.forEach((item, i) => {
      const sel = state.observations.includes(item.id);
      const b = el("button", {
        class: "chaos-item" + (sel ? " selected" : ""),
        role: "listitem", "aria-pressed": sel,
        style: `animation-delay:${Math.min(i * 90, 900)}ms`
      },
        el("span", { class: "c-time", text: item.time }),
        el("span", { class: "c-icon", html: UI.icon(item.icon, 20) }),
        el("span", { class: "c-text", text: item.text }));
      b.addEventListener("click", () => {
        if (sel) state.observations = state.observations.filter((x) => x !== item.id);
        else state.observations.push(item.id);
        OR.Audio.play("toggle");
        OR.Storage.saveSoon();
        render();
      });
      feed.appendChild(b);
    });
    console.appendChild(feed);

    const radar = el("div", { class: "radar-panel" });
    radar.appendChild(el("div", { class: "radar-head", text: "SEÑALES SELECCIONADAS" }));
    const count = state.observations.filter((id) => data.items.find((i) => i.id === id) && data.items.find((i) => i.id === id).cat === "signal").length;
    radar.appendChild(el("div", { class: "radar-count" }, el("span", { text: String(count) }), el("small", { text: ` / ${signals} señales` })));
    radar.appendChild(radarSVG());
    const hint = el("div", { class: "complexity-strip" },
      el("span", { class: "cs-item", html: `<b>${state.observations.length}</b> seleccionados` }),
      el("span", { class: "cs-note", text: "Selecciona los eventos que revelan qué está ocurriendo. El contexto son datos de fondo; el ruido no afecta al problema." }));
    radar.appendChild(hint);
    console.appendChild(radar);
    panel.appendChild(console);

    const feed2 = el("div", {});
    panel.appendChild(feed2);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR SEÑALES" }));
    btn.addEventListener("click", () => {
      const sigIds = data.items.filter((i) => i.cat === "signal").map((i) => i.id);
      const missing = sigIds.filter((id) => !state.observations.includes(id));
      const extraNoise = state.observations.filter((id) => {
        const it = data.items.find((i) => i.id === id);
        return it && it.cat === "noise";
      });
      const extraCtx = state.observations.filter((id) => {
        const it = data.items.find((i) => i.id === id);
        return it && it.cat === "context";
      });
      if (missing.length === 0 && extraNoise.length === 0 && extraCtx.length === 0) {
        OR.Audio.play("unlock");
        feedbackOk(feed2, "Correcto. Estas señales revelan el problema: acumulación, capacidad insuficiente y sus consecuencias. Las señales seleccionadas se alinean en el panel.");
        // WOW 1: los elementos seleccionados se alinean
        feed.querySelectorAll(".chaos-item.selected").forEach((it) => {
          it.classList.add("signal");
        });
        setStepIndex(mission.id, phase, 1);
        render();
      } else {
        attempt(mission);
        const msgs = [];
        if (missing.length) msgs.push(`Faltan señales: revisa los eventos de acumulación y capacidad (${missing.map((id) => data.items.find((i) => i.id === id).time).join(", ")}).`);
        if (extraNoise.length) msgs.push("Algunas selecciones son ruido: no afectan al problema de atención.");
        if (extraCtx.length) msgs.push("Algunas selecciones son contexto: información de fondo que no revela el problema.");
        feedbackErr(feed2, msgs.join(" "));
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  STEP_RENDERERS.diag = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.diagnosis;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">P2</span>¿QUÉ ESTÁ OCURRIENDO?` }),
      el("p", { text: data.prompt })));
    const builder = el("div", { class: "diag-builder" });
    const sentence = el("div", { class: "sentence-card", style: "display:none" });
    data.slots.forEach((slot) => {
      const slotBox = el("div", { class: "diag-slot" + (state.diagnosis[slot.label] ? " filled" : "") });
      slotBox.appendChild(el("span", { class: "diag-slot-label", text: slot.label }));
      const chips = el("div", { class: "diag-chips" });
      slot.chips.forEach((chip) => {
        const sel = state.diagnosis[slot.label] === chip.id;
        const b = el("button", { class: "chip clickable" + (sel ? " on" : "") }, el("span", { text: chip.text }));
        b.addEventListener("click", () => {
          state.diagnosis[slot.label] = sel ? null : chip.id;
          OR.Audio.play("snap");
          render();
        });
        chips.appendChild(b);
      });
      slotBox.appendChild(chips);
      builder.appendChild(slotBox);
    });
    panel.appendChild(builder);

    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "CONSTRUIR DESCRIPCIÓN" }));
    btn.addEventListener("click", () => {
      const wrong = data.slots.filter((slot) => {
        const chip = slot.chips.find((c) => c.id === state.diagnosis[slot.label]);
        return !chip || !chip.ok;
      });
      if (wrong.length === 0) {
        OR.Audio.play("unlock");
        const chipsText = data.slots.map((slot) => {
          const chip = slot.chips.find((c) => c.id === state.diagnosis[slot.label]);
          return `<span class="sc-chip">${chip.text}</span>`;
        });
        sentence.style.display = "";
        sentence.innerHTML = `<span class="sc-label">DESCRIPCIÓN ESTRUCTURADA</span><span class="sc-text">${chipsText.join(" ")}</span>`;
        panel.appendChild(sentence);
        feedbackOk(feed, "Tu descripción captura lo esencial: el momento, el hecho y la causa. La situación caótica ahora tiene forma de problema.");
        completePhaseNow(mission, phase);
        render();
      } else {
        attempt(mission);
        const labels = wrong.map((s) => s.label).join(", ");
        feedbackErr(feed, `Revisa la parte de: ${labels}. La causa debe explicar por qué ocurre el hecho en ese momento.`);
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  /* ---------- FASE 2 · DEFINICIÓN ---------- */
  STEP_RENDERERS.cons = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.problem;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">D1</span>CONSTRUCTOR DEL PROBLEMA` }),
      el("p", { text: data.intro })));
    const blocksWrap = el("div", { style: "display:flex;flex-direction:column;gap:12px" });
    data.blocks.forEach((block) => {
      const done = !!state.problem[block.id];
      const box = el("div", { class: "def-block" + (done ? " done" : "") });
      const head = el("div", { class: "def-block-head" });
      head.appendChild(el("h4", { text: block.label }));
      if (done) head.appendChild(el("span", { class: "b-check", html: UI.icon("check", 16), "aria-label": "Completado" }));
      box.appendChild(head);
      box.appendChild(el("p", { class: "def-prompt", text: block.prompt }));
      const opts = el("div", { class: "def-options" });
      block.options.forEach((o) => {
        const sel = state.problem[block.id] === o.id;
        const b = el("button", { class: "def-option" + (sel ? " selected" : ""), role: "radio", "aria-checked": sel },
          el("span", { class: "o-dot" }), el("span", { text: o.text }));
        b.addEventListener("click", () => {
          state.problem[block.id] = o.id;
          OR.Audio.play("snap");
          render();
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
      blocksWrap.appendChild(box);
    });
    panel.appendChild(blocksWrap);

    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR DEFINICIÓN" }));
    btn.addEventListener("click", () => {
      const wrongBlocks = data.blocks.filter((b) => {
        const opt = b.options.find((o) => o.id === state.problem[b.id]);
        return !opt || !opt.ok;
      });
      if (wrongBlocks.length === 0) {
        OR.Audio.play("unlock");
        const correct = data.blocks.map((b) => b.options.find((o) => o.id === state.problem[b.id]).text);
        const sent = el("div", { class: "sentence-card" });
        sent.innerHTML = `<span class="sc-label">FRASE ESTRUCTURADA DEL PROBLEMA</span><span class="sc-text">${correct.map((t) => `<span class="sc-chip">${t}</span>`).join(" ")}</span>`;
        panel.appendChild(sent);
        feedbackOk(feed, "Correcto. La definición está completa: situación actual, resultado deseado, elementos afectados, restricciones y alcance. La información caótica ahora está alineada.");
        setStepIndex(mission.id, phase, 1);
        render();
      } else {
        attempt(mission);
        const msgs = wrongBlocks.map((b) => {
          const opt = b.options.find((o) => o.id === state.problem[b.id]);
          if (!opt) return `${b.label}: sin seleccionar.`;
          const good = b.options.find((o) => o.ok);
          return `${b.label}: la opción correcta es «${good.text}». ${opt.text} pertenece al contexto, pero no describe correctamente esta parte.`;
        });
        feedbackErr(feed, msgs.join(" "));
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  STEP_RENDERERS.scope = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.scope;
    renderScopeCards(panel, data, state.scope, () => {
      const wrong = data.cards.filter((c) => state.scope[c.id] !== c.cat);
      if (wrong.length === 0) {
        OR.Audio.play("unlock");
        feedbackOk(panel, "Alcance definido. Esto responde: ¿qué analizamos?, ¿qué queda fuera?, ¿en qué periodo y con qué recursos? Así se delimita el sistema del problema.");
        completePhaseNow(mission, phase);
        render();
      } else {
        attempt(mission);
        feedbackErr(panel, `Revisa ${wrong.length} tarjeta(s): dentro del análisis va lo que pertenece al sistema y a su periodo; fuera, lo que pertenece al entorno.`);
      }
    });
    buildActions(mission, phase, panel, { canContinue: false });
  };

  function renderScopeCards(panel, data, store, onVerify) {
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">S</span>DEFINE EL ALCANCE` }),
      el("p", { text: data.prompt })));
    const grid = el("div", { class: "scope-grid" });
    const inZone = el("div", { class: "scope-zone in-zone" });
    inZone.appendChild(el("div", { class: "scope-zone-head", text: "DENTRO DEL ANÁLISIS" }));
    const outZone = el("div", { class: "scope-zone out-zone" });
    outZone.appendChild(el("div", { class: "scope-zone-head", text: "FUERA DEL ANÁLISIS" }));
    grid.appendChild(inZone);
    grid.appendChild(outZone);
    panel.appendChild(grid);

    const pile = el("div", { class: "complexity-strip", style: "margin-top:6px" },
      el("span", { class: "cs-note", text: "Pulsa una tarjeta para moverla entre zonas." }));
    panel.appendChild(pile);

    data.cards.forEach((c) => {
      const placed = store[c.id];
      const b = el("button", {
        class: "scope-card" + (placed ? " placed-" + placed : ""),
        "aria-label": `Clasificar: ${c.text} (${placed === "in" ? "dentro" : placed === "out" ? "fuera" : "sin clasificar"})`,
        "aria-pressed": placed ? "true" : "false"
      },
        el("span", { class: "sc-ico", html: UI.icon(c.ico, 15) }), el("span", { text: c.text }));
      b.addEventListener("click", () => {
        // ciclo: sin clasificar → dentro → fuera → sin clasificar
        const next = placed === undefined ? "in" : placed === "in" ? "out" : undefined;
        store[c.id] = next;
        OR.Audio.play("toggle");
        render();
      });
      if (placed === undefined) pile.appendChild(b);
      else if (placed === "in") inZone.appendChild(b);
      else if (placed === "out") outZone.appendChild(b);
    });

    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR ALCANCE" }));
    btn.addEventListener("click", () => { onVerify(); });
    panel.appendChild(btn);
  }

  /* ---------- FASE 3 · CONSTRUCCIÓN ---------- */
  const layoutPos = {}; // missionId -> {nodeId: {x, y}}

  STEP_RENDERERS.build = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.construction;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">C</span>MESA DE CONSTRUCCIÓN` }),
      el("p", { text: data.intro })));

    const table = el("div", { class: "build-table" });
    // paleta
    const palette = el("div", { class: "build-palette" });
    palette.appendChild(el("div", { class: "radar-head", text: "ELEMENTOS DEL SISTEMA" }));
    data.palette.forEach((node) => {
      const placed = state.construction.nodes.includes(node.id);
      const sel = state.construction.selected === node.id;
      const b = el("button", {
        class: "build-node role-" + node.role + (placed ? " placed" : "") + (sel ? " selected-to-connect" : ""),
        disabled: placed ? true : false
      },
        el("span", { class: "n-ico", html: UI.icon(node.ico, 20) }),
        el("span", { text: node.label }));
      b.addEventListener("click", () => {
        if (placed) return;
        // colocar con posición determinista en círculo
        state.construction.nodes.push(node.id);
        ensureLayout(mission, state.construction.nodes);
        OR.Audio.play("place");
        render();
      });
      palette.appendChild(b);
    });
    table.appendChild(palette);

    // lienzo
    const canvas = el("div", { class: "canvas-wrap" });
    const svg = el("svg", { class: "canvas-svg", viewBox: "0 0 660 420" });
    canvas.appendChild(svg);

    const placedNodes = state.construction.nodes.map((id) => data.palette.find((n) => n.id === id)).filter(Boolean);
    if (placedNodes.length === 0) {
      canvas.appendChild(el("div", { class: "canvas-empty" },
        el("span", { html: UI.icon("model", 40) }),
        el("span", { text: "Selecciona los elementos de la paleta para colocarlos aquí.\nDespués pulsa un nodo y luego otro para conectarlos." })));
    } else {
      ensureLayout(mission, state.construction.nodes);
      const pos = layoutPos[mission.id];
      const links = state.construction.links;
      // dibujar relaciones
      links.forEach(([from, to]) => {
        const a = pos[from], b = pos[to];
        if (!a || !b) return;
        const expected = data.links.some((l) => (l.from === from && l.to === to) || (l.from === to && l.to === from));
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
        line.setAttribute("class", "c-link " + (expected ? "ok" : "wrong"));
        line.setAttribute("stroke-width", "2.4");
        line.style.pointerEvents = "stroke";
        line.setAttribute("data-link", from + ">" + to);
        line.addEventListener("click", (e) => {
          e.stopPropagation();
          const key = from + ">" + to;
          const inv = to + ">" + from;
          state.construction.links = state.construction.links.filter((l) => l[0] + ">" + l[1] !== key && l[0] + ">" + l[1] !== inv);
          OR.Audio.play("toggle");
          UI.toast("Relación eliminada", { type: "warn", duration: 1600 });
          render();
        });
        svg.appendChild(line);
      });
      placedNodes.forEach((node) => {
        const p = pos[node.id];
        const isSelected = state.construction.selected === node.id;
        const connected = state.construction.links.some((l) => (l[0] === node.id || l[1] === node.id));
        const nodeEl = el("div", {
          class: "canvas-node role-" + node.role + (isSelected ? " sel" : "") + (connected ? " connected" : ""),
          style: `left:${p.x}px;top:${p.y}px`
        },
          el("span", { class: "n-ico", html: UI.icon(node.ico, 18) }),
          el("span", { text: node.label }));
        // tocar para conectar
        nodeEl.addEventListener("click", (e) => {
          e.stopPropagation();
          const sel = state.construction.selected;
          if (sel && sel !== node.id) {
            const key1 = sel + ">" + node.id, key2 = node.id + ">" + sel;
            if (!state.construction.links.some((l) => l[0] + ">" + l[1] === key1 || l[0] + ">" + l[1] === key2)) {
              state.construction.links.push([sel, node.id]);
              OR.Audio.play("link");
            }
            state.construction.selected = null;
          } else {
            state.construction.selected = sel === node.id ? null : node.id;
          }
          OR.Storage.saveSoon();
          render();
        });
        // arrastrar (ratón + táctil)
        makeDraggable(nodeEl, mission, node.id, p);
        canvas.appendChild(nodeEl);
      });
    }
    table.appendChild(canvas);
    panel.appendChild(table);

    // tira de complejidad
    const nEls = state.construction.nodes.length;
    const nRel = state.construction.links.length;
    const strip = el("div", { class: "complexity-strip" },
      el("span", { class: "cs-item", html: `<b>${nEls}</b> elementos` }),
      el("span", { class: "cs-item", html: `<b>${nRel}</b> relaciones` }),
      el("span", { class: "cs-note", text: "El problema contiene elementos y relaciones consideradas: mientras más consideremos, mayor puede ser la dificultad de análisis (C = n + R)." }));
    panel.appendChild(strip);

    const hintLine = el("div", { class: "build-hint-line" },
      el("span", { html: UI.icon("help", 15) }),
      el("span", { text: "Pulsa un nodo del lienzo y luego otro para crear una relación. Pulsa una relación para eliminarla." }));
    panel.appendChild(hintLine);

    const feed = el("div", {});
    panel.appendChild(feed);
    const btnRow = el("div", { class: "btn-row", style: "justify-content:flex-start" });
    const verify = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR ESTRUCTURA" }));
    verify.addEventListener("click", () => {
      const done = OR.MissionEngine.phaseComplete(mission, phase);
      if (done) {
        OR.Audio.play("unlock");
        feedbackOk(feed, "Estructura correcta: elementos, relaciones, recursos y restricciones representan el sistema del problema.");
        completePhaseNow(mission, phase);
        render();
      } else {
        attempt(mission);
        const placed = state.construction.nodes;
        const required = data.palette.filter((n) => n.role !== "none").map((n) => n.id);
        const missing = required.filter((id) => !placed.includes(id));
        const wrongPlaced = placed.filter((id) => {
          const n = data.palette.find((p) => p.id === id);
          return n && n.role === "none";
        });
        const expected = data.links.map((l) => l.from + ">" + l.to);
        const mine = state.construction.links.map((l) => l[0] + ">" + l[1]);
        const missingLinks = data.links.filter((l) => !mine.includes(l.from + ">" + l.to) && !mine.includes(l.to + ">" + l.from));
        const invalid = mine.filter((l) => !expected.includes(l) && !expected.includes(l.split(">")[1] + ">" + l.split(">")[0]));
        const msgs = [];
        if (missing.length) msgs.push(`Faltan elementos: ${missing.map((id) => data.palette.find((n) => n.id === id).label).join(", ")}.`);
        if (wrongPlaced.length) msgs.push("Hay elementos que no pertenecen a la estructura del problema.");
        if (missingLinks.length) msgs.push(`Faltan relaciones: conecta ${missingLinks.map((l) => `${data.palette.find((n) => n.id === l.from).label} → ${data.palette.find((n) => n.id === l.to).label}`).join("; ")}.`);
        if (invalid.length) msgs.push("Existen relaciones que no representan la estructura real.");
        feedbackErr(feed, msgs.length ? msgs.join(" ") : "Revisa elementos y relaciones con la paleta.");
      }
    });
    btnRow.appendChild(verify);
    const clearLinks = el("button", { class: "btn btn-ghost" }, el("span", { text: "LIMPIAR RELACIONES" }));
    clearLinks.addEventListener("click", () => {
      state.construction.links = [];
      state.construction.selected = null;
      OR.Audio.play("toggle");
      render();
    });
    btnRow.appendChild(clearLinks);
    panel.appendChild(btnRow);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  function ensureLayout(mission, nodeIds) {
    if (!layoutPos[mission.id]) layoutPos[mission.id] = {};
    const pos = layoutPos[mission.id];
    const W = 660, H = 420;
    const cx = W / 2, cy = H / 2 + 8, R = Math.min(W, H) * 0.34;
    nodeIds.forEach((id, i) => {
      if (pos[id]) return;
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(nodeIds.length, 1);
      pos[id] = {
        x: Math.round(cx + R * Math.cos(angle)),
        y: Math.round(cy + R * Math.sin(angle))
      };
    });
  }

  function makeDraggable(nodeEl, mission, nodeId, p) {
    let dragging = false;
    let moved = false;
    const start = (e) => {
      dragging = true;
      moved = false;
      nodeEl.style.zIndex = "10";
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const rect = nodeEl.parentNode.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      const nx = Math.max(30, Math.min(rect.width - 30, cx));
      const ny = Math.max(24, Math.min(rect.height - 24, cy));
      nodeEl.style.left = nx + "px";
      nodeEl.style.top = ny + "px";
      if (Math.abs(nx - p.x) > 4 || Math.abs(ny - p.y) > 4) moved = true;
    };
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      nodeEl.style.zIndex = "";
      if (moved) {
        const rect = nodeEl.parentNode.getBoundingClientRect();
        const nx = parseFloat(nodeEl.style.left);
        const ny = parseFloat(nodeEl.style.top);
        if (!layoutPos[mission.id]) layoutPos[mission.id] = {};
        layoutPos[mission.id][nodeId] = { x: nx, y: ny };
      }
    };
    nodeEl.addEventListener("pointerdown", start);
    nodeEl.addEventListener("pointermove", move);
    nodeEl.addEventListener("pointerup", end);
    nodeEl.addEventListener("pointercancel", end);
  }

  /* ---------- FASE 4 · MODELO ---------- */
  STEP_RENDERERS.mb = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.model;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">M</span>MODEL BUILDER` }),
      el("p", { text: "Transforma la situación en una representación simplificada: objetivo, decisiones controlables, restricciones y datos." })));

    const grid = el("div", { class: "model-builder" });
    const slotDefs = [
      { key: "objective", id: "obj", label: "OBJETIVO", ico: "target", q: "¿Qué queremos lograr?", single: true },
      { key: "decisions", id: "dec", label: "DECISIONES CONTROLABLES", ico: "decision", q: "¿Qué podemos cambiar?", single: false },
      { key: "constraints", id: "res", label: "RESTRICCIONES", ico: "gauge", q: "¿Qué límites tenemos?", single: false },
      { key: "data", id: "dat", label: "DATOS", ico: "file", q: "¿Qué conocemos?", single: false }
    ];
    slotDefs.forEach((sd) => {
      const def = data[sd.key];
      const sel = state.model[sd.key];
      const done = sd.single ? !!sel : (Array.isArray(sel) && sel.length > 0);
      const box = el("div", { class: "model-slot " + sd.id + (done ? " done" : "") });
      const head = el("div", { class: "model-slot-head" },
        el("span", { class: "m-ico", html: UI.icon(sd.ico, 20) }),
        el("h4", { text: sd.label }));
      box.appendChild(head);
      box.appendChild(el("p", { style: "color:var(--text-2);font-size:.88rem;margin-bottom:8px", text: sd.q }));
      const opts = el("div", { class: "model-options" });
      def.options.forEach((o) => {
        const isSel = sd.single ? sel === o.id : (Array.isArray(sel) && sel.includes(o.id));
        const b = el("button", { class: "model-option" + (isSel ? " selected" : ""), role: sd.single ? "radio" : "checkbox", "aria-checked": isSel },
          el("span", { class: "o-box" }), el("span", { text: o.text }));
        b.addEventListener("click", () => {
          if (sd.single) {
            state.model[sd.key] = isSel ? null : o.id;
          } else {
            if (isSel) state.model[sd.key] = state.model[sd.key].filter((x) => x !== o.id);
            else state.model[sd.key].push(o.id);
          }
          OR.Audio.play("toggle");
          OR.Storage.saveSoon();
          render();
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
      grid.appendChild(box);
    });
    panel.appendChild(grid);

    // modelo visual cuando está completo
    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR MODELO" }));
    btn.addEventListener("click", () => {
      const done = OR.MissionEngine.phaseComplete(mission, phase);
      if (done) {
        OR.Audio.play("unlock");
        feedbackOk(feed, "Tu modelo representa el problema: objetivo, decisiones, restricciones y datos. La validación pondrá a prueba si representa también el escenario completo.");
        completePhaseNow(mission, phase);
        render();
      } else {
        attempt(mission);
        const msgs = [];
        const objOk = data.objective.options.find((o) => o.id === state.model.objective);
        if (!objOk || !objOk.ok) msgs.push("El objetivo debe responder a qué queremos lograr (reducir espera, atender más demanda, etc.).");
        ["decisions", "data"].forEach((k) => {
          const def = data[k];
          const sel = state.model[k];
          const missing = def.options.filter((o) => o.ok && !sel.includes(o.id));
          const wrong = def.options.filter((o) => !o.ok && sel.includes(o.id));
          if (missing.length) msgs.push(`Faltan ${k === "decisions" ? "decisiones" : "datos"}: ${missing.map((o) => o.text).join("; ")}.`);
          if (wrong.length) msgs.push(`No corresponde: ${wrong.map((o) => o.text).join("; ")}.`);
        });
        const conDef = data.constraints;
        const conSel = state.model.constraints;
        const conMissing = conDef.options.filter((o) => o.ok && !o.required && !conSel.includes(o.id));
        const conWrong = conDef.options.filter((o) => !o.ok && conSel.includes(o.id));
        if (conMissing.length) msgs.push(`Faltan restricciones: ${conMissing.map((o) => o.text).join("; ")}.`);
        if (conWrong.length) msgs.push(`No es una restricción del problema: ${conWrong.map((o) => o.text).join("; ")}.`);
        if (conSel.filter((id) => conDef.options.find((o) => o.id === id) && conDef.options.find((o) => o.id === id).ok).length === 0) {
          msgs.push("Debes considerar al menos una restricción que limite la situación.");
        }
        feedbackErr(feed, msgs.length ? msgs.join(" ") : "Revisa tu modelo con la ayuda de las pistas.");
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  /* ---------- FASE 5 · VALIDACIÓN ---------- */
  STEP_RENDERERS.lab = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const simDef = mission.sim;
    const capacityLimited = OR.MissionEngine.modelHasRequiredConstraint(mission, state);
    const cases = effectiveCases(mission);
    const ranAll = cases.every((c) => state.validation.cases[c.id] && state.validation.cases[c.id].ran);

    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">V</span>CÁMARA DE VALIDACIÓN` }),
      el("p", { text: "Prueba el modelo con distintos escenarios antes de confiar en sus resultados." })));

    const lab = el("div", { class: "validation-lab" });
    // lista de casos
    const list = el("div", { class: "case-list" });
    list.appendChild(el("div", { class: "radar-head", text: "CASOS DE PRUEBA" }));
    cases.forEach((c) => {
      const rec = state.validation.cases[c.id] || {};
      const card = el("div", { class: "case-card" + (rec.ran ? " active" : "") });
      const top = el("div", { class: "cc-top" });
      top.appendChild(el("span", { class: "cc-name" }, el("span", { html: UI.icon(c.ico, 15) }), el("span", { text: " " + c.name })));
      const sttLabel = !rec.ran ? "sin probar" : (rec.ok ? "✓ coherente" : "⚠ resultado fuerte");
      top.appendChild(el("span", { class: "cc-state" + (rec.ran && !rec.ok ? " bad" : rec.ran && rec.ok ? " ok" : ""), text: sttLabel }));
      card.appendChild(top);
      card.appendChild(el("div", { class: "cc-desc", text: c.desc }));
      const runBtn = el("button", { class: "btn btn-ghost btn-sm", style: "margin-top:8px" },
        el("span", { html: UI.icon("simulate", 14) }), el("span", { text: rec.ran ? "PROBAR OTRA VEZ" : "PROBAR MODELO" }));
      runBtn.addEventListener("click", () => {
        OR.Audio.play("scan");
        const r = OR.SimEngine.run(simDef, caseParams(simDef, c), capacityLimited);
        state.validation.cases[c.id] = { ran: true, ok: r.feasible, message: caseMessage(simDef, c, r, capacityLimited) };
        OR.Storage.saveSoon();
        render();
      });
      card.appendChild(runBtn);
      list.appendChild(card);
    });
    lab.appendChild(list);

    // panel de resultados
    const resultPanel = el("div", { class: "sim-result" });
    const lastCaseId = Object.keys(state.validation.cases).reverse().find((id) => state.validation.cases[id].ran);
    if (lastCaseId) {
      const c = cases.find((x) => x.id === lastCaseId);
      if (c) {
        const rec = state.validation.cases[lastCaseId];
        resultPanel.appendChild(el("div", { class: "radar-head", text: `RESULTADO · ${c.name}` }));
        const r = OR.SimEngine.run(simDef, caseParams(simDef, c), capacityLimited);
        const metrics = el("div", { class: "sim-metrics", html: metricMarkup(r) });
        resultPanel.appendChild(metrics);
        resultPanel.appendChild(el("div", { class: "sim-message " + (rec.ok ? "ok" : "bad"), text: rec.message }));
        if (!capacityLimited) {
          resultPanel.appendChild(el("div", { class: "sim-message warn", html: `<b>FALTA UNA RESTRICCIÓN.</b> Sin ella, la simulación contradice el escenario real. Revisa el modelo: <span style="color:var(--amber)">${simDef.constraint.label}</span>.` }));
        }
      }
    } else {
      resultPanel.appendChild(el("div", { class: "radar-head", text: "RESULTADO" }));
      resultPanel.appendChild(el("div", { class: "sim-message", text: "Selecciona un caso y pulsa PROBAR MODELO para ejecutar la simulación." }));
    }
    lab.appendChild(resultPanel);
    panel.appendChild(lab);

    // escáner
    const scannerStage = el("div", { class: "scanner-stage" });
    const scanHead = el("div", { class: "radar-head", text: "ESCÁNER DEL MODELO" });
    scannerStage.appendChild(scanHead);
    const cellsWrap = el("div", { class: "scanner-track" });
    const cells = [
      { key: "obj", label: "OBJETIVO", ico: "target", cls: "obj" },
      { key: "dat", label: "DATOS", ico: "file", cls: "dat" },
      { key: "res", label: "RESTRICCIONES", ico: "gauge", cls: "res" },
      { key: "dec", label: "DECISIONES", ico: "decision", cls: "dec" }
    ];
    const cellEls = {};
    cells.forEach((c) => {
      const cell = el("div", { class: "scan-cell " + c.cls });
      cell.appendChild(el("div", { class: "sc-icon", html: UI.icon(c.ico, 24) }));
      cell.appendChild(el("span", { class: "sc-label", text: c.label }));
      cellsWrap.appendChild(cell);
      cellEls[c.key] = cell;
    });
    scannerStage.appendChild(cellsWrap);
    const beam = el("div", { class: "scan-beam" });
    scannerStage.appendChild(beam);
    const consoleEl = el("div", { class: "scan-console", "aria-live": "polite" });
    scannerStage.appendChild(consoleEl);
    panel.appendChild(scannerStage);

    const scanBtn = el("button", { class: "btn btn-decision btn-lg", disabled: !ranAll },
      el("span", { html: UI.icon("scanner", 18) }), el("span", { text: "VALIDAR MODELO" }));
    if (!ranAll) scanBtn.title = "Prueba primero los tres casos";
    scanBtn.addEventListener("click", () => runScanner(mission, phase, panel, scannerStage, cells, cellEls, beam, consoleEl, capacityLimited));
    panel.appendChild(scanBtn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  function runScanner(mission, phase, panel, stage, cells, cellEls, beam, consoleEl, capacityLimited) {
    const state = OR.MissionEngine.st(mission);
    state.validation.runs += 1;
    OR.State.get().stats.validationsRun += 1;
    const firstTry = state.validation.runs === 1;
    OR.Audio.play("scan");
    stage.classList.add("scanning");

    // comprobaciones
    const model = state.model;
    const objOk = mission.model.objective.options.find((o) => o.id === model.objective) || {};
    const decOk = mission.model.decisions.options.filter((o) => o.ok).every((o) => model.decisions.includes(o.id));
    const datOk = mission.model.data.options.filter((o) => o.ok).every((o) => model.data.includes(o.id));
    const checks = [
      { key: "obj", label: "OBJETIVO", pass: !!objOk.ok, cls: "ok" },
      { key: "dat", label: "DATOS", pass: datOk, cls: "ok" },
      { key: "res", label: "RESTRICCIONES", pass: capacityLimited, cls: "warn" },
      { key: "dec", label: "DECISIONES", pass: decOk, cls: "ok" }
    ];
    const failIdx = checks.findIndex((c) => !c.pass);
    const nCells = cells.length;

    const line = (html, cls) => {
      const l = el("span", { class: "sc-line " + cls, html });
      consoleEl.appendChild(l);
      consoleEl.scrollTop = consoleEl.scrollHeight;
      OR.Audio.play("scanTick");
    };

    const delay = reduced() ? 120 : 620;
    const steps = [];
    checks.forEach((c, i) => {
      steps.push(() => {
        beam.style.top = `${((i + 0.5) / nCells) * 100}%`;
        cellEls[c.key].classList.add(c.pass ? "checked" : "failed");
        if (i === failIdx) line(`<b>${c.label}</b> — problema detectado ⚠`, "bad");
        else if (c.key === "res" && failIdx === -1) line(`<b>${c.label}</b> — la restricción clave está presente ✓`, "ok");
        else line(`<b>${c.label}</b> — comprobado ✓`, "ok");
      });
    });
    steps.push(() => {
      beam.style.opacity = "0";
      stage.classList.remove("scanning");
      if (failIdx === -1) {
        line("MODELO VALIDADO — representa el escenario de forma coherente", "ok");
        state.validation.pass = true;
        OR.Audio.play("success");
        OR.Storage.saveSoon();
        setTimeout(() => {
          completePhaseNow(mission, phase, { firstTry });
          render();
        }, 900);
      } else {
        const c = checks[failIdx];
        const simDef = mission.sim;
        line(`VALIDACIÓN DETENIDA en ${c.label}`, "bad");
        line(simDef.constraint.impossibleText, "warn");
        const fixBtn = el("button", { class: "btn btn-danger-ghost btn-sm", style: "margin-top:8px;display:block" },
          el("span", { text: "◀ REVISAR MODELO" }));
        fixBtn.addEventListener("click", () => {
          state.validation.pass = false;
          const phases = OR.MissionEngine.phasesFor(mission);
          const modelPhase = phases.findIndex((p) => p.id === "model");
          if (modelPhase >= 0) {
            OR.Audio.play("warn");
            OR.MissionEngine.goToPhase(mission, modelPhase);
            render();
          }
        });
        consoleEl.appendChild(fixBtn);
        // premio por detección de inconsistencia
        if (!state.bonuses.inconsistency && !OR.MissionEngine.isFree()) {
          state.bonuses.inconsistency = true;
          OR.State.get().stats.inconsistenciesFound += 1;
          OR.Scoring.add(OR.Scoring.PTS.inconsistency, "inconsistencia detectada");
          OR.UI.toast("Detección de inconsistencia: +150 pts", { type: "success" });
        }
        OR.Audio.play("warn");
      }
    });

    if (reduced()) {
      steps.forEach((s) => s());
    } else {
      steps.forEach((s, i) => setTimeout(s, i * delay));
    }
  }

  /* ---------- FASE 6 · SOLUCIÓN ---------- */
  STEP_RENDERERS.mesa = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const simDef = mission.sim;
    const peakCase = effectiveCases(mission).find((c) => c.id === "peak") || effectiveCases(mission)[0];
    const altResults = {};
    mission.alternatives.forEach((alt) => {
      const params = OR.SimEngine.altParams(simDef, alt);
      const caseP = caseParams(simDef, peakCase);
      const merged = Object.assign({}, caseP, params);
      altResults[alt.id] = OR.SimEngine.run(simDef, merged, true);
    });

    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">S</span>MESA DE DECISIONES` }),
      el("p", { text: `Compara las alternativas frente al caso «${peakCase.name}». Simula cada una y decide con base en tu objetivo: ${mission.model.objective.options.find((o) => o.ok).text.toLowerCase()}` })));

    const grid = el("div", { class: "alternatives-grid" });
    mission.alternatives.forEach((alt) => {
      const r = altResults[alt.id];
      const simulated = state.solution.simulated.includes(alt.id);
      const chosen = state.solution.selected === alt.id;
      const card = el("div", { class: "alt-card" + (chosen ? " chosen" : "") });
      const top = el("div", { class: "alt-top" });
      top.appendChild(el("span", { class: "alt-id", text: alt.id }));
      top.appendChild(el("span", { class: "alt-name", text: alt.name }));
      card.appendChild(top);
      card.appendChild(el("div", { class: "alt-desc", text: alt.desc }));
      card.appendChild(el("div", { class: "alt-trade", text: alt.trade }));
      const metrics = el("div", { class: "alt-metrics" });
      metrics.appendChild(el("div", { class: "alt-metric" },
        el("span", { text: "Configuración" }),
        el("b", { text: altParamsText(simDef, alt) })));
      if (simulated) {
        OR.SimEngine.metricRows(simDef, r).forEach((m) => {
          metrics.appendChild(el("div", { class: "alt-metric" },
            el("span", { text: m.label }),
            el("b", { text: `${m.value} ${m.unit}` })));
        });
      }
      card.appendChild(metrics);
      const actions = el("div", { class: "alt-actions" });
      const simBtn = el("button", { class: "btn btn-ghost btn-sm" },
        el("span", { html: UI.icon("simulate", 14) }), el("span", { text: simulated ? "RE-SIMULAR" : "SIMULAR ALTERNATIVA" }));
      simBtn.addEventListener("click", () => {
        OR.Audio.play("scan");
        if (!state.solution.simulated.includes(alt.id)) state.solution.simulated.push(alt.id);
        OR.Storage.saveSoon();
        render();
      });
      actions.appendChild(simBtn);
      const decideBtn = el("button", { class: "btn btn-solution btn-sm", disabled: !simulated },
        el("span", { text: chosen ? "ELEGIDA ✓" : "DECIDIR ESTA" }));
      decideBtn.addEventListener("click", () => {
        state.solution.selected = alt.id;
        state.solution.attempts += 1;
        const rank = OR.SimEngine.rankAlternatives(mission, altResults);
        const pos = rank.indexOf(alt.id) + 1;
        state.solution.rank = pos;
        state.solution.coherent = mission.best.includes(alt.id) || pos <= 2;
        if (state.solution.coherent) {
          OR.State.get().stats.coherentDecisions += 1;
        }
        OR.Audio.play("snap");
        OR.Storage.saveSoon();
        render();
      });
      actions.appendChild(decideBtn);
      card.appendChild(actions);
      grid.appendChild(card);
    });
    panel.appendChild(grid);

    // tabla comparativa
    if (state.solution.simulated.length > 0) {
      const cmp = el("div", { class: "alt-compare" });
      const table = el("table");
      const thead = el("thead");
      const hr = el("tr");
      ["Alternativa", ...mission.alternatives.map((a) => a.id), "ANTES"].forEach((h) => hr.appendChild(el("th", { text: h })));
      thead.appendChild(hr);
      table.appendChild(thead);
      const tbody = el("tbody");
      const before = OR.SimEngine.run(simDef, caseParams(simDef, peakCase), true);
      const beforeRows = OR.SimEngine.metricRows(simDef, before);
      beforeRows.forEach((m) => {
        const tr = el("tr");
        tr.appendChild(el("td", { text: m.label }));
        mission.alternatives.forEach((alt) => {
          const r = altResults[alt.id];
          const row = OR.SimEngine.metricRows(simDef, r).find((x) => x.id === m.id);
          const bestVal = bestValue(mission.alternatives.map((a) => altResults[a.id]), m.id, mission.objectiveKey);
          const cls = row && row.value === bestVal ? "best-row" : "";
          tr.appendChild(el("td", { class: cls, text: row ? `${row.value} ${row.unit}` : "—" }));
        });
        tr.appendChild(el("td", { class: "vs-before", text: `${m.value} ${m.unit}` }));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      cmp.appendChild(table);
      panel.appendChild(cmp);
    }

    // feedback de decisión
    const feed = el("div", {});
    panel.appendChild(feed);
    if (state.solution.selected) {
      const alt = mission.alternatives.find((a) => a.id === state.solution.selected);
      const rank = state.solution.rank;
      if (rank === 1) {
        feedbackOk(feed, `<p class="fb-strong">Decisión coherente con tu objetivo</p><p>${mission.bestReason}</p>`);
      } else if (rank === 2) {
        feedbackOk(feed, `<p class="fb-strong">Decisión aceptable</p><p>${alt.name} mejora la situación, aunque la alternativa ${mission.best[0]} logra mejores resultados para tu objetivo.</p>`);
      } else {
        feedbackWarn(feed, `<p class="fb-strong">Revisa tu decisión</p><p>Respecto al objetivo definido, las alternativas ${mission.best.join(" y ")} la superan claramente. ${alt.trade}</p>`);
      }
    }
    buildActions(mission, phase, panel, { canContinue: false });
  };

  function bestValue(results, metricId, objectiveKey) {
    const vals = results.map((r) => {
      const row = OR.SimEngine.metricRows(null, r).find((x) => x.id === metricId);
      return row ? row.value : null;
    }).filter((v) => v !== null && v !== "—");
    if (vals.length === 0) return null;
    const lowerBetter = metricId === "maxWait" || metricId === "time" || metricId === "backlog" || metricId === "saturation";
    return lowerBetter ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
  }

  function altParamsText(simDef, alt) {
    if (simDef.type === "queue") return `${alt.params.servers} caja(s) · ~${alt.params.serviceMin} min/persona · costo ${alt.cost}`;
    if (simDef.type === "trips") return `${alt.params.vehicles} vehículo(s) · cap. ${alt.params.capacity} · ${alt.params.tripMin} min/ruta · costo ${alt.cost}`;
    if (simDef.type === "sessions") return `${alt.params.spaces} espacios · ${alt.params.blocks} bloques · costo ${alt.cost}`;
    return "costo " + alt.cost;
  }

  /* ---------- FASE 7 · RESULTADOS ---------- */
  STEP_RENDERERS.cmp = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const simDef = mission.sim;
    const peakCase = effectiveCases(mission).find((c) => c.id === "peak") || effectiveCases(mission)[0];
    const chosenAlt = mission.alternatives.find((a) => a.id === state.solution.selected) || mission.alternatives[0];
    const before = OR.SimEngine.run(simDef, caseParams(simDef, peakCase), true);
    const afterParams = Object.assign({}, caseParams(simDef, peakCase), OR.SimEngine.altParams(simDef, chosenAlt));
    const after = OR.SimEngine.run(simDef, afterParams, true);

    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">R1</span>PANEL DE RESULTADOS` }),
      el("p", { text: `Comparación entre la situación actual y la propuesta (alternativa ${chosenAlt.id} · ${chosenAlt.name}) en el caso «${peakCase.name}».` })));

    const ba = el("div", { class: "before-after" });
    const beforePanel = el("div", { class: "ba-panel before" });
    beforePanel.appendChild(el("div", { class: "ba-head", text: mission.results.beforeLabel }));
    const bm = el("div", { class: "ba-metrics" });
    OR.SimEngine.metricRows(simDef, before).forEach((m) => {
      bm.appendChild(el("div", { class: "ba-metric" },
        el("div", { class: "bm-label", text: m.label }),
        el("div", { class: "bm-value", text: `${m.value} ${m.unit}` })));
    });
    beforePanel.appendChild(bm);
    ba.appendChild(beforePanel);
    ba.appendChild(el("div", { class: "ba-vs", text: "VS" }));
    const afterPanel = el("div", { class: "ba-panel after" });
    afterPanel.appendChild(el("div", { class: "ba-head", text: mission.results.afterLabel }));
    const am = el("div", { class: "ba-metrics" });
    OR.SimEngine.metricRows(simDef, after).forEach((m) => {
      am.appendChild(el("div", { class: "ba-metric" },
        el("div", { class: "bm-label", text: m.label }),
        el("div", { class: "bm-value", text: `${m.value} ${m.unit}` })));
    });
    afterPanel.appendChild(am);
    ba.appendChild(afterPanel);
    panel.appendChild(ba);

    // barras comparativas
    const bars = OR.Charts.compareBars(compareItems(simDef, before, after));
    panel.appendChild(bars);

    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "INTERPRETAR RESULTADOS ▸" }));
    btn.addEventListener("click", () => {
      setStepIndex(mission.id, phase, 1);
      render();
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  function compareItems(simDef, before, after) {
    if (simDef.type === "queue") {
      return [
        { label: "Espera máxima", before: before.maxWait, after: after.maxWait, unit: "min" },
        { label: "Demanda atendida", before: before.attendedPct, after: after.attendedPct, unit: "%" },
        { label: "Sin atender al cierre", before: before.finalBacklog, after: after.finalBacklog, unit: "pers." },
        { label: "Capacidad por bloque", before: before.capPerBlock || 0, after: after.capPerBlock || 0, unit: "pers." }
      ];
    }
    if (simDef.type === "trips") {
      return [
        { label: "Tiempo total", before: before.totalTime, after: after.totalTime, unit: "min" },
        { label: "Viajes necesarios", before: before.totalTrips, after: after.totalTrips, unit: "viajes" },
        { label: "Demanda atendida", before: before.attendedPct, after: after.attendedPct, unit: "%" },
        { label: "Margen de la jornada", before: before.marginMin, after: after.marginMin, unit: "min" }
      ];
    }
    if (simDef.type === "sessions") {
      return [
        { label: "Sesiones necesarias", before: before.needed, after: after.needed, unit: "ses." },
        { label: "Lugares disponibles", before: before.slots || 0, after: after.slots || 0, unit: "lugares" },
        { label: "Saturación", before: before.saturation || 0, after: after.saturation || 0, unit: "%" },
        { label: "Cobertura", before: before.attendedPct, after: after.attendedPct, unit: "%" }
      ];
    }
    return [];
  }

  STEP_RENDERERS.interp = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.results;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">R2</span>¿QUÉ SIGNIFICAN ESTOS RESULTADOS?` }),
      el("p", { text: "Selecciona las conclusiones que están respaldadas por la comparación que acabas de ver." })));
    const list = el("div", { class: "conclusions" });
    data.conclusions.forEach((c) => {
      const sel = state.results.conclusions.includes(c.id);
      const b = el("button", { class: "conclusion-item" + (sel ? " selected" : ""), "aria-pressed": sel },
        el("span", { class: "c-box" }), el("span", { text: c.text }));
      b.addEventListener("click", () => {
        if (sel) state.results.conclusions = state.results.conclusions.filter((x) => x !== c.id);
        else state.results.conclusions.push(c.id);
        OR.Audio.play("toggle");
        render();
      });
      list.appendChild(b);
    });
    panel.appendChild(list);
    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR CONCLUSIONES" }));
    btn.addEventListener("click", () => {
      const supported = data.conclusions.filter((c) => c.supported);
      const wrongSelected = state.results.conclusions.filter((id) => !data.conclusions.find((c) => c.id === id).supported);
      const missing = supported.filter((c) => !state.results.conclusions.includes(c.id));
      if (wrongSelected.length === 0 && missing.length === 0) {
        OR.Audio.play("unlock");
        feedbackOk(feed, "Correcto. Estas conclusiones son las que respaldan las cifras de la comparación. Los resultados no terminan en números: se interpretan.");
        completePhaseNow(mission, phase);
        render();
      } else {
        attempt(mission);
        const msgs = [];
        if (missing.length) msgs.push(`Falta: ${missing.map((c) => `«${c.text}»`).join("; ")}`);
        if (wrongSelected.length) msgs.push(`No está respaldada por la comparación: ${wrongSelected.map((id) => `«${data.conclusions.find((c) => c.id === id).text}»`).join("; ")}`);
        feedbackErr(feed, msgs.join(" "));
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  /* ---------- FASE 8 · IMPLEMENTACIÓN ---------- */
  STEP_RENDERERS.order = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.implementation;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">I1</span>PLAN DE IMPLEMENTACIÓN` }),
      el("p", { text: "Ordena las acciones del plan: de la preparación a la revisión de resultados." })));
    let order = state.implementation.order.slice();
    if (order.length === 0) {
      order = data.steps.map((s) => s.id);
      // desorden determinista
      const shuffled = shuffleDeterministic(order, mission.id);
      state.implementation.order = shuffled;
    }
    const list = el("div", { class: "impl-steps" });
    state.implementation.order.forEach((id, idx) => {
      const step = data.steps.find((s) => s.id === id);
      const row = el("div", { class: "impl-step" });
      row.appendChild(el("span", { class: "is-num", text: String(idx + 1) }));
      row.appendChild(el("span", { class: "is-text", text: step.text }));
      const moves = el("div", { class: "is-move" });
      const up = el("button", { "aria-label": "Subir paso", disabled: idx === 0, text: "▲" });
      up.addEventListener("click", () => {
        const arr = state.implementation.order;
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        OR.Audio.play("toggle");
        render();
      });
      const down = el("button", { "aria-label": "Bajar paso", disabled: idx === state.implementation.order.length - 1, text: "▼" });
      down.addEventListener("click", () => {
        const arr = state.implementation.order;
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        OR.Audio.play("toggle");
        render();
      });
      moves.appendChild(up);
      moves.appendChild(down);
      row.appendChild(moves);
      list.appendChild(row);
    });
    panel.appendChild(list);
    const feed = el("div", {});
    panel.appendChild(feed);
    const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VERIFICAR PLAN" }));
    btn.addEventListener("click", () => {
      const correct = data.steps.map((s) => s.id).join(",");
      const mine = state.implementation.order.join(",");
      if (mine === correct) {
        OR.Audio.play("unlock");
        feedbackOk(feed, "Plan ordenado correctamente: se preparan los recursos, se asignan responsables, se aplica el cambio, se observa y se revisan los resultados.");
        setStepIndex(mission.id, phase, 1);
        render();
      } else {
        attempt(mission);
        feedbackErr(feed, "El orden no es el adecuado. Piensa: ¿qué debe estar listo antes de aplicar el cambio? ¿Qué se hace después de aplicarlo?");
      }
    });
    panel.appendChild(btn);
    buildActions(mission, phase, panel, { canContinue: false });
  };

  function shuffleDeterministic(arr, salt) {
    const a = arr.slice();
    let seed = 0;
    for (let i = 0; i < salt.length; i++) seed = (seed * 31 + salt.charCodeAt(i)) % 1000;
    for (let i = a.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  STEP_RENDERERS.apply = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.implementation;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">I2</span>APLICAR CAMBIO` }),
      el("p", { text: "Ejecuta el plan. Observa cómo avanza cada acción del plan de implementación." })));
    const timeline = el("div", { class: "impl-timeline" });
    data.steps.forEach((s, i) => {
      if (i > 0) timeline.appendChild(el("div", { class: "it-conn" + (state.implementation.applied ? " done" : "") }));
      const node = el("div", { class: "it-node" + (state.implementation.applied ? " done" : "") });
      node.appendChild(el("div", { class: "it-dot", html: UI.icon("check", 16) }));
      node.appendChild(el("div", { class: "it-label", text: s.text.split(".")[0] }));
      timeline.appendChild(node);
    });
    panel.appendChild(timeline);
    const feed = el("div", {});
    panel.appendChild(feed);
    if (!state.implementation.applied) {
      const btn = el("button", { class: "btn btn-solution btn-lg" }, el("span", { html: UI.icon("rocket", 18) }), el("span", { text: "APLICAR CAMBIO" }));
      btn.addEventListener("click", () => {
        state.implementation.applied = true;
        OR.Audio.play("complete");
        feedbackOk(feed, "El plan se ejecutó. La propuesta está operando en el escenario real: ahora toca observar y medir.");
        setStepIndex(mission.id, phase, 2);
        render();
      });
      panel.appendChild(btn);
    } else {
      const btn = el("button", { class: "btn btn-primary btn-lg" }, el("span", { text: "VER DATOS REALES ▸" }));
      btn.addEventListener("click", () => {
        setStepIndex(mission.id, phase, 2);
        render();
      });
      panel.appendChild(btn);
    }
    buildActions(mission, phase, panel, { canContinue: false });
  };

  STEP_RENDERERS.post = function (mission, phase, panel) {
    const state = OR.MissionEngine.st(mission);
    const data = mission.implementation.postEvent;
    panel.appendChild(el("div", { class: "step-head" },
      el("h3", { html: `<span class="s-num">I3</span>EVENTO POST-IMPLEMENTACIÓN` }),
      el("p", { text: "Después de implementar, el escenario real puede diferir del modelo. ¿Qué hacemos?" })));
    const box = el("div", { class: "post-event" });
    box.appendChild(el("span", { class: "pe-tag", text: data.title }));
    box.appendChild(el("p", { class: "pe-text", text: data.text }));

    // gráfico del bucle
    const loop = el("div", { class: "pe-loop" });
    loop.appendChild(el("span", { text: "Los datos reales alimentan el proceso:" }));
    loop.appendChild(el("span", { class: "lp-node", text: "Implementación" }));
    loop.appendChild(el("span", { text: "→" }));
    loop.appendChild(el("span", { class: "lp-node hl", text: "Validación" }));
    loop.appendChild(el("span", { text: "→" }));
    loop.appendChild(el("span", { class: "lp-node", text: "Modelo / Solución" }));
    box.appendChild(loop);

    const opts = el("div", { class: "pe-options" });
    data.options.forEach((o) => {
      const b = el("button", { class: "def-option" + (state.implementation.postChoice === o.id ? " selected" : "") },
        el("span", { class: "o-dot" }), el("span", { text: o.text }));
      b.addEventListener("click", () => {
        state.implementation.postChoice = o.id;
        OR.Audio.play("snap");
        OR.Storage.saveSoon();
        render();
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    panel.appendChild(box);

    const feed = el("div", {});
    panel.appendChild(feed);
    if (state.implementation.postChoice) {
      const chosen = data.options.find((o) => o.id === state.implementation.postChoice);
      if (chosen.ok) {
        feedbackOk(feed, chosen.feedback);
        const actions = el("div", { class: "btn-row" });
        const loopBtn = el("button", { class: "btn btn-ghost btn-lg" },
          el("span", { html: UI.icon("revision", 18) }), el("span", { text: "VOLVER A VALIDAR" }));
        loopBtn.addEventListener("click", () => {
          const valIdx = OR.MissionEngine.startLoop(mission);
          OR.UI.toast("Bucle de mejora: volviendo a validación con los datos reales", { type: "warn" });
          render();
        });
        const doneBtn = el("button", { class: "btn btn-solution btn-lg" },
          el("span", { html: UI.icon("check", 18) }), el("span", { text: "COMPLETAR MISIÓN" }));
        doneBtn.addEventListener("click", () => {
          completePhaseNow(mission, phase);
          OR.MissionEngine.completeMission(mission);
          OR.Audio.play("complete");
          OR.Screens.missionDone(mission);
        });
        actions.appendChild(loopBtn);
        actions.appendChild(doneBtn);
        panel.appendChild(actions);
      } else {
        feedbackWarn(feed, chosen.feedback);
      }
    }
    buildActions(mission, phase, panel, { canContinue: false });
  };

  /* ================== acciones inferiores ================== */

  function buildActions(mission, phase, panel, opts) {
    const bar = el("div", { class: "phase-actions" });
    const phases = OR.MissionEngine.phasesFor(mission);
    const free = OR.MissionEngine.isFree();

    if (phase > 0) {
      const back = el("button", { class: "btn btn-ghost" },
        el("span", { class: "btn-label", text: "◀ FASE ANTERIOR" }));
      back.addEventListener("click", () => {
        OR.Audio.play("toggle");
        OR.MissionEngine.goToPhase(mission, phase - 1);
        setStepIndex(mission.id, phase - 1, 0);
        render();
      });
      bar.appendChild(back);
    }

    if (free && !done) {
      const next = el("button", { class: "btn btn-ghost" },
        el("span", { class: "btn-label", text: "SIGUIENTE FASE ▸" }));
      next.addEventListener("click", () => {
        if (phase < phases.length - 1) {
          OR.Audio.play("toggle");
          OR.MissionEngine.goToPhase(mission, phase + 1);
          setStepIndex(mission.id, phase + 1, 0);
          render();
        }
      });
      bar.appendChild(next);
    }

    const done = OR.MissionEngine.phaseComplete(mission, phase);
    if (done && phase < phases.length - 1) {
      const next = el("button", { class: "btn btn-primary btn-lg" },
        el("span", { class: "btn-label", text: "SIGUIENTE FASE ▸" }));
      next.addEventListener("click", () => {
        OR.Audio.play("unlock");
        // si la fase no se ha consolidado aún, se completa (premia y avanza)
        if (!OR.MissionEngine.phaseAccessible(mission, phase + 1)) {
          completePhaseNow(mission, phase);
        } else {
          OR.MissionEngine.goToPhase(mission, phase + 1);
        }
        setStepIndex(mission.id, phase + 1, 0);
        render();
      });
      bar.appendChild(next);
    } else if (done && phase === phases.length - 1 && !mission.final) {
      const next = el("button", { class: "btn btn-primary btn-lg" },
        el("span", { class: "btn-label", text: "COMPLETAR MISIÓN ✓" }));
      next.addEventListener("click", () => {
        OR.MissionEngine.completeMission(mission);
        OR.Audio.play("complete");
        OR.Screens.missionDone(mission);
      });
      bar.appendChild(next);
    }

    document.querySelector(".mission-host").appendChild(bar);
    return bar;
  }

  /* ================== completar fase ================== */

  function completePhaseNow(mission, phase, opts) {
    opts = opts || {};
    OR.MissionEngine.completePhase(mission, phase, opts);
    OR.AchievementsEngine.checkAll();
    // al terminar una fase, la siguiente fase vuelve a mostrar su intro
    stepMemory[mission.id + ":" + phase + ":visited"] = true;
  }

  /* ================== pistas y por qué ================== */

  function openHint(mission, phase) {
    const hint = OR.MissionEngine.getHint(mission, phase);
    if (!hint) {
      UI.toast("Ya usaste todas las pistas de esta fase. Confía en tu análisis.", { type: "warn" });
      return;
    }
    OR.Audio.play("select");
    UI.modal({
      title: "PISTA DEL ANALISTA",
      body: el("div", {},
        el("div", { class: "hint-card" }, el("p", { text: hint })),
        el("p", { style: "color:var(--text-2);font-size:.85rem;margin-top:10px", text: OR.MissionEngine.isFree() ? "Modo libre: las pistas no restan puntos." : "Usar una pista resta 30 puntos a tu puntuación." })),
      actions: [
        { label: "USAR PISTA (-30)", class: "btn-ghost", onClick: () => {
            const h = OR.MissionEngine.useHint(mission, phase);
            if (h) {
              OR.UI.toast("Pista activada: -30 pts", { type: "warn" });
              UI.modal({
                title: "PISTA ACTIVADA",
                body: el("p", { text: h }),
                actions: [{ label: "ENTENDIDO", class: "btn-primary" }]
              });
            }
          } },
        { label: "CANCELAR", class: "btn-ghost" }
      ]
    });
  }

  function openWhy(mission, phase) {
    const why = OR.MissionEngine.whyText(mission, phase);
    if (!why) return;
    OR.Audio.play("select");
    UI.modal({
      title: "¿POR QUÉ?",
      body: el("p", { text: why }),
      actions: [{ label: "ENTENDIDO", class: "btn-primary" }]
    });
  }

  /* ================== radar SVG ================== */

  function radarSVG() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("class", "radar-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Radar de señales del problema");
    svg.innerHTML = `
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(51,214,255,0.22)"/>
          <stop offset="100%" stop-color="rgba(51,214,255,0)"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="88" class="radar-ring"/>
      <circle cx="100" cy="100" r="60" class="radar-ring" opacity="0.6"/>
      <circle cx="100" cy="100" r="32" class="radar-ring" opacity="0.4"/>
      <path d="M100 100 L100 12 A88 88 0 0 1 165 55 Z" fill="url(#radarGrad)">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="7s" repeatCount="indefinite"/>
      </path>
      <circle cx="100" cy="100" r="4" fill="#33d6ff"/>
      <circle cx="152" cy="66" r="4" fill="#33d6ff"><animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="60" cy="150" r="4" fill="#33d6ff"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" repeatCount="indefinite"/></circle>
    `;
    return svg;
  }

  /* ================== API ================== */

  OR.PhaseRenderer = { render };
})(window.OR = window.OR || {});
