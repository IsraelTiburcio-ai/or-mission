/* ============================================================
   OR MISSION · js/state.js
   Estado central del centro de operaciones.
   Persistencia: localStorage con versión (saveVersion).
   ============================================================ */
(function (OR) {
  "use strict";

  const SAVE_VERSION = 1;

  function emptyMissionState() {
    return {
      observations: [],        // ids de señales seleccionadas
      diagnosis: {},           // slotId -> chipId
      problem: {},             // blockId -> optionId
      scope: {},               // cardId -> "in"|"out"
      construction: { nodes: [], links: [] },  // nodes: [id], links: [[from,to]]
      model: { objective: null, decisions: [], constraints: [], data: [] },
      validation: {
        runs: 0,
        firstTry: null,        // true | false
        pass: false,
        cases: {},             // caseId -> {ran: bool, ok: bool, message: string}
        scanResult: null       // "pass" | "fail"
      },
      solution: {
        simulated: [],         // altIds simuladas
        attempts: 0,
        selected: null,
        coherent: null,        // true | false
        rank: null
      },
      results: {
        conclusions: [],       // ids seleccionados
        attempts: 0
      },
      implementation: {
        order: [],             // ids en orden elegido
        attempts: 0,
        applied: false,
        postChoice: null
      },
      system: { system: null, subsystems: [], environment: null, scope: {} },
      awarded: {},             // phaseId -> true
      bonuses: { inconsistency: false, firstTry: false, solution: false, mission: false },
      done: false,
      completeCount: 0,
      phasesCompleted: 0,
      startedAt: null,
      hintsUsed: 0,
      wrongAnswers: 0,
      revisionLoop: false
    };
  }

  function emptyMissionProgress() {
    return {
      status: "locked",        // locked | open | inprogress | done
      phase: 0,                // 0 = sistema (solo misión final), 1..8
      state: emptyMissionState(),
      bestScore: 0,
      bestPrecision: null,
      attempts: 0,
      completedAt: null
    };
  }

  const DEFAULTS = {
    saveVersion: SAVE_VERSION,
    player: { name: "" },
    tutorialSeen: false,
    introSeen: false,
    finalSeen: false,
    screen: "home",
    currentMission: null,     // id de misión en curso
    currentPhase: null,       // fase actual (0..8)
    mode: "mission",          // mission | free
    missions: {},             // missionId -> emptyMissionProgress
    score: 0,
    achievements: [],
    lastSeenAchievements: [],
    stats: {
      phasesCompleted: 0,
      missionsCompleted: 0,
      cleanDetections: 0,
      perfectDefinitions: 0,
      perfectModels: 0,
      validationsRun: 0,
      inconsistenciesFound: 0,
      coherentDecisions: 0,
      implementationsDone: 0,
      firstTryValidations: 0,
      missionsNoHints: 0,
      hintsUsed: 0,
      wrongAnswers: 0,
      freeRuns: 0
    },
    settings: {
      sound: true,
      presentation: false,
      reducedMotion: null
    },
    freeBackup: {},
    registeredAt: null
  };

  let state = null;

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function create() {
    const s = clone(DEFAULTS);
    OR.Missions.LIST.forEach((m) => {
      s.missions[m.id] = emptyMissionProgress();
    });
    s.missions[OR.Missions.LIST[0].id].status = "open";
    return s;
  }

  function load(raw) {
    const base = create();
    if (!raw || typeof raw !== "object") return base;
    if (raw.saveVersion && raw.saveVersion !== SAVE_VERSION) {
      // save incompatible: se descarta con seguridad, sin romper la app
      return base;
    }
    if (raw.player && typeof raw.player.name === "string") base.player.name = raw.player.name;
    ["tutorialSeen", "introSeen", "finalSeen", "screen", "currentMission", "currentPhase", "mode", "score", "registeredAt"]
      .forEach((k) => {
        if (raw[k] !== undefined) base[k] = raw[k];
      });
    if (raw.missions && typeof raw.missions === "object") {
      Object.keys(raw.missions).forEach((id) => {
        if (base.missions[id] && raw.missions[id]) {
          const rp = raw.missions[id];
          base.missions[id].status = rp.status || base.missions[id].status;
          base.missions[id].phase = rp.phase || 0;
          base.missions[id].bestScore = rp.bestScore || 0;
          base.missions[id].attempts = rp.attempts || 0;
          base.missions[id].completedAt = rp.completedAt || null;
          if (rp.bestPrecision !== undefined && rp.bestPrecision !== null) base.missions[id].bestPrecision = rp.bestPrecision;
          if (rp.state && typeof rp.state === "object") {
            base.missions[id].state = mergeMissionState(base.missions[id].state, rp.state);
          }
        }
      });
    }
    if (raw.stats && typeof raw.stats === "object") {
      base.stats = Object.assign({}, base.stats, raw.stats);
    }
    if (raw.settings && typeof raw.settings === "object") {
      base.settings = Object.assign({}, base.settings, raw.settings);
    }
    if (Array.isArray(raw.achievements)) base.achievements = raw.achievements.slice();
    if (Array.isArray(raw.lastSeenAchievements)) base.lastSeenAchievements = raw.lastSeenAchievements.slice();
    if (raw.freeBackup && typeof raw.freeBackup === "object") {
      base.freeBackup = JSON.parse(JSON.stringify(raw.freeBackup));
    }
    return base;
  }

  function mergeMissionState(base, raw) {
    if (Array.isArray(raw.observations)) base.observations = raw.observations.slice();
    if (raw.diagnosis) base.diagnosis = Object.assign({}, base.diagnosis, raw.diagnosis);
    if (raw.problem) base.problem = Object.assign({}, base.problem, raw.problem);
    if (raw.scope) base.scope = Object.assign({}, base.scope, raw.scope);
    if (raw.construction) {
      base.construction = {
        nodes: Array.isArray(raw.construction.nodes) ? raw.construction.nodes.slice() : [],
        links: Array.isArray(raw.construction.links) ? raw.construction.links.map((l) => [l[0], l[1]]) : []
      };
    }
    if (raw.model) {
      base.model = {
        objective: raw.model.objective || null,
        decisions: Array.isArray(raw.model.decisions) ? raw.model.decisions.slice() : [],
        constraints: Array.isArray(raw.model.constraints) ? raw.model.constraints.slice() : [],
        data: Array.isArray(raw.model.data) ? raw.model.data.slice() : []
      };
    }
    if (raw.validation) {
      base.validation = Object.assign({}, base.validation, raw.validation);
      if (raw.validation.cases) base.validation.cases = Object.assign({}, raw.validation.cases);
    }
    if (raw.solution) base.solution = Object.assign({}, base.solution, raw.solution);
    if (raw.results) base.results = Object.assign({}, base.results, raw.results);
    if (raw.implementation) base.implementation = Object.assign({}, base.implementation, raw.implementation);
    if (raw.system) base.system = Object.assign({}, base.system, raw.system);
    if (raw.awarded) base.awarded = Object.assign({}, base.awarded, raw.awarded);
    if (raw.bonuses) base.bonuses = Object.assign({}, base.bonuses, raw.bonuses);
    ["done", "completeCount", "phasesCompleted", "startedAt", "hintsUsed", "wrongAnswers", "revisionLoop"]
      .forEach((k) => {
        if (raw[k] !== undefined) base[k] = raw[k];
      });
    return base;
  }

  function get() {
    if (!state) state = create();
    return state;
  }

  function set(s) { state = s; }

  function reset() { state = create(); return state; }

  /** Acceso cómodo al progreso de una misión. */
  function mission(id) {
    const s = get();
    if (!s.missions[id]) s.missions[id] = emptyMissionProgress();
    return s.missions[id];
  }

  function missionsCountBy(status) {
    const s = get();
    return OR.Missions.LIST.filter((m) => s.missions[m.id] && s.missions[m.id].status === status).length;
  }

  function finalCompleted() {
    const fm = OR.Missions.final();
    return !!fm && mission(fm.id).status === "done";
  }

  function hasProgress() {
    const s = get();
    return s.score > 0 || s.achievements.length > 0 || OR.Missions.LIST.some((m) => mission(m.id).status !== "locked") && OR.Missions.LIST.some((m) => mission(m.id).phasesCompleted > 0);
  }

  function resetCurrent() {
    const s = get();
    s.currentMission = null;
    s.currentPhase = null;
  }

  function detectReducedMotion() {
    return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function totalPhasesCompleted() {
    const s = get();
    return OR.Missions.LIST.reduce((acc, m) => acc + (mission(m.id).phasesCompleted || 0), 0);
  }

  OR.State = {
    DEFAULTS,
    create,
    load,
    get,
    set,
    reset,
    mission,
    missionsCountBy,
    finalCompleted,
    hasProgress,
    resetCurrent,
    detectReducedMotion,
    totalPhasesCompleted,
    emptyMissionProgress,
    emptyMissionState,
    SAVE_VERSION
  };
})(window.OR = window.OR || {});
