/* ============================================================
   OR MISSION · js/missionEngine.js
   Motor de misiones: inicio, fases, validación de contenido,
   puntuación, desbloqueo progresivo y bucle de mejora.
   Cada fase lee el estado guardado de fases anteriores:
   la misión es continua, no minijuegos aislados.
   ============================================================ */
(function (OR) {
  "use strict";

  const PHASE_LABELS = {
    problem: "PROBLEMA",
    definition: "DEFINICIÓN",
    construction: "CONSTRUCCIÓN",
    model: "MODELO",
    validation: "VALIDACIÓN",
    solution: "SOLUCIÓN",
    results: "RESULTADOS",
    implementation: "IMPLEMENTACIÓN"
  };

  function phasesFor(mission) {
    const list = [];
    if (mission.hasSystemStage) list.push({ num: "00", id: "system", title: "SISTEMA" });
    OR.Phases.forEach((p) => list.push({ num: p.num, id: p.id, title: p.title }));
    return list;
  }

  function currentMission() {
    const s = OR.State.get();
    if (!s.currentMission) return null;
    return OR.Missions.get(s.currentMission) || null;
  }

  function currentPhase() {
    const s = OR.State.get();
    return s.currentPhase; // 0..8
  }

  function st(mission) {
    return OR.State.mission(mission.id).state;
  }

  function isFree() {
    return OR.State.get().mode === "free";
  }

  /** ¿La sesión actual otorga puntos? No en modo libre ni en repetición (modo analista). */
  function isScored() {
    if (isFree()) return false;
    const m = currentMission();
    if (!m) return true;
    return OR.State.mission(m.id).status !== "done";
  }

  function isRevision(mission) {
    return OR.State.mission(mission.id).status === "done";
  }

  /** Fase más alta alcanzada (mp.phase). */
  function highestPhase(mission) {
    return OR.State.mission(mission.id).phase;
  }

  function phaseComplete(mission, phase) {
    const state = st(mission);
    const phases = phasesFor(mission);
    const p = phases[phase];
    if (!p) return false;
    if (p.id === "system") {
      return state.system.system && state.system.environment && state.system.subsystems.length >= 3 &&
        Object.keys(state.system.scope).length === mission.systemStage.scopeCards.cards.length;
    }
    switch (p.id) {
      case "problem":
        return phaseProblemDone(mission, state);
      case "definition":
        return phaseDefinitionDone(mission, state);
      case "construction":
        return phaseConstructionDone(mission, state);
      case "model":
        return phaseModelDone(mission, state);
      case "validation":
        return state.validation.pass === true;
      case "solution":
        return state.solution.selected !== null;
      case "results":
        return state.results.conclusions.length === mission.results.conclusions.filter((c) => c.supported).length &&
          state.results.conclusions.every((id) => mission.results.conclusions.find((c) => c.id === id).supported);
      case "implementation":
        return state.implementation.postChoice !== null && state.implementation.applied;
      default:
        return false;
    }
  }

  function phaseProblemDone(mission, state) {
    const sigIds = mission.chaos.items.filter((i) => i.cat === "signal").map((i) => i.id);
    const allSignals = sigIds.every((id) => state.observations.includes(id));
    const diagOk = mission.diagnosis.slots.every((slot) => {
      const chip = slot.chips.find((c) => c.id === state.diagnosis[slot.label]);
      return chip && chip.ok;
    });
    return allSignals && diagOk;
  }

  function phaseDefinitionDone(mission, state) {
    const blocksOk = mission.problem.blocks.every((b) => {
      const opt = b.options.find((o) => o.id === state.problem[b.id]);
      return opt && opt.ok;
    });
    const scopeOk = mission.scope.cards.every((c) => state.scope[c.id] === c.cat);
    return blocksOk && scopeOk;
  }

  function phaseConstructionDone(mission, state) {
    const placed = state.construction.nodes;
    const required = mission.construction.palette.filter((n) => n.role !== "none").map((n) => n.id);
    const nonePlaced = state.construction.nodes.filter((id) => {
      const node = mission.construction.palette.find((n) => n.id === id);
      return node && node.role === "none";
    });
    const expectedLinks = mission.construction.links.map((l) => l.from + ">" + l.to);
    const myLinks = state.construction.links.map((l) => l[0] + ">" + l[1]);
    const allExpected = expectedLinks.every((l) => myLinks.includes(l));
    const noInvalid = myLinks.every((l) => expectedLinks.includes(l));
    return required.every((id) => placed.includes(id)) && nonePlaced.length === 0 && allExpected && noInvalid;
  }

  function phaseModelDone(mission, state) {
    const m = mission.model;
    const objOk = m.objective.options.find((o) => o.id === state.model.objective);
    const decOk = m.decisions.options.every((o) => state.model.decisions.includes(o.id) === o.ok);
    const datOk = m.data.options.every((o) => state.model.data.includes(o.id) === o.ok);
    const conNoFalse = m.constraints.options.filter((o) => !o.ok).every((o) => !state.model.constraints.includes(o.id));
    const conSome = state.model.constraints.some((id) => m.constraints.options.find((o) => o.id === id) && m.constraints.options.find((o) => o.id === id).ok);
    return !!objOk && objOk.ok && decOk && datOk && conNoFalse && conSome;
  }

  /** ¿El modelo incluye la restricción requerida? (clave para validación) */
  function modelHasRequiredConstraint(mission, state) {
    const required = mission.model.constraints.options.find((o) => o.required);
    if (!required) return true;
    return state.model.constraints.includes(required.id);
  }

  function phaseAccessible(mission, phase) {
    if (isFree()) return true;
    const max = highestPhase(mission);
    return phase <= max;
  }

  function canStart(missionId) {
    const s = OR.State.get();
    const mp = s.missions[missionId];
    if (!mp) return false;
    if (mp.status === "open" || mp.status === "inprogress" || mp.status === "done") return true;
    return false;
  }

  /** Respaldo del progreso real mientras se usa la Sala de Análisis (persistido). */
  function freeBackupOf(missionId) {
    const s = OR.State.get();
    if (!s.freeBackup) s.freeBackup = {};
    return s.freeBackup[missionId];
  }
  function setFreeBackup(missionId, val) {
    const s = OR.State.get();
    if (!s.freeBackup) s.freeBackup = {};
    if (val === null) delete s.freeBackup[missionId];
    else s.freeBackup[missionId] = val;
  }

  /** Inicia (o reanuda) una misión. mode: mission | free
      Las fases usan índice de arreglo: 0 = sistema (solo final) o PROBLEMA. */
  function start(missionId, mode) {
    const s = OR.State.get();
    const mission = OR.Missions.get(missionId);
    if (!mission) return false;
    const mp = OR.State.mission(missionId);
    if (mode === "free") {
      // respaldar el progreso real antes de abrir la sala de análisis
      if (!freeBackupOf(missionId) && (mp.status === "inprogress" || mp.status === "done")) {
        setFreeBackup(missionId, JSON.parse(JSON.stringify({ state: mp.state, phase: mp.phase, status: mp.status })));
      }
      // estado en blanco para recorrido libre
      mp.state = OR.State.emptyMissionState();
      mp.phase = 0;
      s.mode = "free";
      s.stats.freeRuns += 1;
    } else {
      // al volver al modo misión, restaurar el progreso respaldado
      const backup = freeBackupOf(missionId);
      if (backup) {
        mp.state = backup.state;
        mp.phase = backup.phase;
        mp.status = backup.status;
        setFreeBackup(missionId, null);
      }
      if (mp.status === "locked") return false;
      if (mp.status === "done") {
        // repetición (modo analista): sesión nueva sin puntuación, se conserva el mejor registro
        mp.state = OR.State.emptyMissionState();
        mp.phase = 0;
        mp.attempts += 1;
        s.mode = "mission";
      } else {
        if (mp.status === "open") {
          mp.status = "inprogress";
          mp.attempts += 1;
          mp.state.startedAt = Date.now();
        }
        if (!mp.state.startedAt) mp.state.startedAt = Date.now();
        if (mp.phase < 0) mp.phase = 0;
        s.mode = "mission";
      }
    }
    s.currentMission = missionId;
    s.currentPhase = mp.phase;
    OR.Storage.saveSoon();
    return true;
  }

  function exit() {
    const s = OR.State.get();
    const m = currentMission();
    if (m) {
      const backup = freeBackupOf(m.id);
      if (backup) {
        const mp = OR.State.mission(m.id);
        mp.state = backup.state;
        mp.phase = backup.phase;
        mp.status = backup.status;
        setFreeBackup(m.id, null);
        OR.Storage.saveSoon();
      }
    }
    s.currentMission = null;
    s.currentPhase = null;
    OR.Storage.saveSoon();
  }

  function goToPhase(mission, phase) {
    const phases = phasesFor(mission);
    if (phase < 0 || phase >= phases.length) return false;
    if (!phaseAccessible(mission, phase)) return false;
    const s = OR.State.get();
    s.currentPhase = phase;
    OR.State.mission(mission.id).phase = phase;
    OR.Storage.saveSoon();
    return true;
  }

  /** Completa una fase: premio + desbloqueo de la siguiente. */
  function completePhase(mission, phase, opts) {
    opts = opts || {};
    const s = OR.State.get();
    const mp = OR.State.mission(mission.id);
    const state = st(mission);
    const phases = phasesFor(mission);
    const pid = phases[phase].id;

    if (!state.awarded[pid] && isScored()) {
      state.awarded[pid] = true;
      OR.Scoring.add(OR.Scoring.PTS.phase, "fase " + pid);
      state.phasesCompleted += 1;
      s.stats.phasesCompleted += 1;
      mp.phasesCompleted = state.phasesCompleted;
      if (opts.firstTry && pid === "validation") {
        s.stats.firstTryValidations += 1;
        OR.Scoring.add(OR.Scoring.PTS.firstTry, "validación al primer intento");
      }
      if (opts.inconsistency) {
        state.bonuses.inconsistency = true;
        s.stats.inconsistenciesFound += 1;
        OR.Scoring.add(OR.Scoring.PTS.inconsistency, "inconsistencia detectada");
      }
      if (opts.solution) {
        state.bonuses.solution = true;
        s.stats.coherentDecisions += 1;
        OR.Scoring.add(OR.Scoring.PTS.solution, "solución coherente");
      }
      if (pid === "implementation") {
        s.stats.implementationsDone += 1;
      }
      if (pid === "problem") {
        // SIN RUIDO: todas las señales y cero ruido
        const sigIds = mission.chaos.items.filter((i) => i.cat === "signal").map((i) => i.id);
        const noiseIds = mission.chaos.items.filter((i) => i.cat === "noise").map((i) => i.id);
        if (sigIds.every((id) => state.observations.includes(id)) && noiseIds.every((id) => !state.observations.includes(id))) {
          s.stats.cleanDetections += 1;
        }
      }
      if (pid === "definition") s.stats.perfectDefinitions += 1;
      if (pid === "model" && phaseModelPerfect(mission, state)) s.stats.perfectModels += 1;
      if (pid === "validation") s.stats.validationsRun += 1;
    }

    // avanzar a la siguiente fase (índice de arreglo)
    const next = phase + 1;
    if (next < phases.length) {
      mp.phase = next;
      s.currentPhase = next;
    }
    OR.Scoring.recordPrecision(mission);
    OR.Storage.saveSoon();
    return true;
  }

  function phaseModelPerfect(mission, state) {
    const m = mission.model;
    const objOk = m.objective.options.find((o) => o.id === state.model.objective);
    if (!objOk || !objOk.ok) return false;
    const all = (opts, sel) => opts.every((o) => sel.includes(o.id) === o.ok);
    return all(m.decisions.options, state.model.decisions) &&
      all(m.data.options, state.model.data) &&
      all(m.constraints.options, state.model.constraints);
  }

  /** Valida la fase 5: ¿el modelo pasó la cámara? */
  function validateModel(mission) {
    const state = st(mission);
    const ok = modelHasRequiredConstraint(mission, state);
    state.validation.scanResult = ok ? "pass" : "fail";
    if (!ok && !state.bonuses.inconsistency && isScored()) {
      // bonus de detección se otorga al completar con revisión
    }
    return ok;
  }

  /** Completar misión: +500, estado done, desbloqueos, logros. */
  function completeMission(mission) {
    const s = OR.State.get();
    const mp = OR.State.mission(mission.id);
    const state = st(mission);

    if (mp.status !== "done") {
      if (isScored()) {
        OR.Scoring.add(OR.Scoring.PTS.mission, "misión completada");
        if (state.hintsUsed === 0) s.stats.missionsNoHints += 1;
        if (mp.bestScore === 0) mp.bestScore = s.score;
        else mp.bestScore = Math.max(mp.bestScore, s.score);
      }
      mp.status = "done";
      mp.completedAt = Date.now();
      s.stats.missionsCompleted += 1;
      state.done = true;
      OR.Scoring.recordPrecision(mission);
      unlockNext(mission);
      if (mission.final) s.finalSeen = true;
    }
    OR.Storage.saveSoon();
  }

  /** Desbloqueo progresivo: la siguiente misión y los métodos. */
  function unlockNext(doneMission) {
    const s = OR.State.get();
    const mainDone = OR.Missions.main().filter((m) => s.missions[m.id].status === "done").length;
    const fm = OR.Missions.final();
    if (mainDone >= OR.Missions.main().length && fm) {
      if (s.missions[fm.id].status === "locked") s.missions[fm.id].status = "open";
    }
    // métodos
    OR.Methods.DEFS.forEach((m) => {
      if (m.unlockMission <= mainDone) {
        // desbloqueado implícitamente por misión
      }
    });
  }

  function methodsUnlockedCount() {
    const s = OR.State.get();
    const mainDone = OR.Missions.main().filter((m) => s.missions[m.id].status === "done").length;
    return OR.Methods.DEFS.filter((m) => m.unlockMission <= mainDone).length;
  }

  /* ---------- Pistas y explicaciones ---------- */
  function hintsUsed(mission) {
    return st(mission).hintsUsed;
  }

  function getHint(mission, phase) {
    const state = st(mission);
    const list = mission.hints[phase] || [];
    if (state.hintsUsed >= list.length) return null;
    return list[state.hintsUsed];
  }

  function useHint(mission, phase) {
    const s = OR.State.get();
    const state = st(mission);
    const hint = getHint(mission, phase);
    if (!hint) return null;
    state.hintsUsed += 1;
    s.stats.hintsUsed += 1;
    if (isScored()) OR.Scoring.add(-30, "pista");
    OR.Storage.saveSoon();
    return hint;
  }

  function whyText(mission, phase) {
    const phases = phasesFor(mission);
    const pid = phases[phase] ? phases[phase].id : null;
    const WHYS = {
      system: "Antes de aplicar la Investigación de Operaciones conviene identificar el sistema: sus subsistemas, su entorno y su alcance. Así sabemos qué analizamos y qué queda fuera, tal como se trabajó en System Scope.",
      problem: "En la fase de PROBLEMA se observa la situación tal como llega: con datos, personas, recursos y mucho ruido. Nuestro trabajo es separar las señales relevantes del contexto y del ruido.",
      definition: "DEFINICIÓN convierte las observaciones en una descripción clara: situación actual, resultado deseado, elementos afectados, restricciones y alcance. Un problema bien definido es la mitad del análisis.",
      construction: "CONSTRUCCIÓN organiza la definición en una estructura: elementos, relaciones, recursos y restricciones. Así dejamos de ver datos sueltos y empezamos a ver un sistema.",
      model: "MODELO es una representación simplificada del problema: qué podemos decidir (decisiones), qué conocemos (datos), qué nos limita (restricciones) y qué buscamos (objetivo).",
      validation: "En la etapa de validación se comprueba si el modelo representa de manera suficientemente coherente el problema analizado, probándolo con escenarios antes de confiar en sus resultados.",
      solution: "SOLUCIÓN compara alternativas de acción con ayuda de la simulación y elige la más coherente con el objetivo definido.",
      results: "RESULTADOS compara la situación antes y después de la propuesta, y nos obliga a interpretar qué significan realmente las cifras.",
      implementation: "IMPLEMENTACIÓN lleva la propuesta a la práctica con un plan ordenado y revisa los datos reales para saber si el proceso debe ajustarse."
    };
    return WHYS[pid] || null;
  }

  /** Pistas del bucle de mejora (fase 8, evento posterior). */
  function startLoop(mission) {
    const s = OR.State.get();
    st(mission).revisionLoop = true;
    const phases = phasesFor(mission);
    const valPhase = phases.findIndex((p) => p.id === "validation");
    if (valPhase >= 0) {
      OR.State.mission(mission.id).phase = valPhase;
      s.currentPhase = valPhase;
    }
    OR.Storage.saveSoon();
    return valPhase;
  }

  OR.MissionEngine = {
    PHASE_LABELS,
    phasesFor,
    currentMission,
    currentPhase,
    st,
    isFree,
    isRevision,
    highestPhase,
    phaseComplete,
    phaseAccessible,
    canStart,
    start,
    exit,
    goToPhase,
    completePhase,
    modelHasRequiredConstraint,
    phaseModelPerfect,
    validateModel,
    completeMission,
    unlockNext,
    methodsUnlockedCount,
    hintsUsed,
    getHint,
    useHint,
    whyText,
    startLoop
  };
})(window.OR = window.OR || {});
