/* ============================================================
   OR MISSION · js/simEngine.js
   Motor determinista de simulación. Sin Math.random() en los
   resultados: reglas internas claras, coherentes con los datos
   del escenario.
   Tipos: queue (colas), trips (entregas), sessions (sesiones).
   ============================================================ */
(function (OR) {
  "use strict";

  /** Modelo de cola determinista por bloques.
      capacityLimited = false simula un modelo sin la restricción
      de capacidad (utilizado para detectar la omisión). */
  function queue({ servers, serviceMin, periodMin, arrivals, capacityLimited }) {
    const capPerBlock = capacityLimited ? Math.max(1, Math.floor(periodMin / Math.max(serviceMin, 1))) * Math.max(servers, 1) : Infinity;
    let backlog = 0;
    let maxBacklog = 0;
    const totalArrivals = arrivals.reduce((a, b) => a + b, 0);
    const servedByBlock = [];
    arrivals.forEach((a) => {
      const served = Math.min(a + backlog, capPerBlock);
      servedByBlock.push(served);
      backlog = a + backlog - served;
      maxBacklog = Math.max(maxBacklog, backlog);
    });
    const attended = totalArrivals - backlog;
    const maxWait = capPerBlock === Infinity ? 0 : Math.ceil(maxBacklog / capPerBlock) * periodMin;
    const capacityUtil = capPerBlock === Infinity ? null : Math.min(100, Math.round((attended / (capPerBlock * arrivals.length)) * 100));
    return {
      type: "queue",
      capPerBlock: capPerBlock === Infinity ? null : capPerBlock,
      servedByBlock,
      totalArrivals,
      attended,
      attendedPct: totalArrivals ? Math.round((attended / totalArrivals) * 100) : 100,
      finalBacklog: backlog,
      maxBacklog,
      maxWait,
      capacityUtil,
      feasible: backlog === 0
    };
  }

  /** Modelo de viajes (entregas) determinista. */
  function trips({ items, capacity, vehicles, tripMin, horizonMin, capacityLimited }) {
    const trips = items.map((n) => (capacityLimited ? Math.ceil(n / Math.max(capacity, 1)) : 1));
    const totalTrips = trips.reduce((a, b) => a + b, 0);
    const rounds = Math.ceil(totalTrips / Math.max(vehicles, 1));
    const totalTime = rounds * tripMin;
    const feasible = totalTime <= horizonMin;
    const attendedPct = feasible ? 100 : Math.max(0, Math.min(99, Math.round((horizonMin / totalTime) * 100)));
    return {
      type: "trips",
      tripsPerZone: trips,
      totalTrips,
      rounds,
      totalTime,
      feasible,
      attendedPct,
      marginMin: horizonMin - totalTime
    };
  }

  /** Modelo de sesiones (espacios × bloques) determinista. */
  function sessions({ sessions, spaces, blocks, capacityLimited }) {
    const needed = sessions.reduce((a, b) => a + b, 0);
    const slots = capacityLimited ? spaces * blocks : Infinity;
    const feasible = needed <= slots;
    const saturation = slots === Infinity ? null : Math.min(100, Math.round((needed / slots) * 100));
    const attendedPct = feasible ? 100 : Math.max(0, Math.min(99, Math.round((slots / needed) * 100)));
    return {
      type: "sessions",
      needed,
      slots: slots === Infinity ? null : slots,
      feasible,
      saturation,
      attendedPct,
      margin: slots === Infinity ? null : slots - needed
    };
  }

  /** Normaliza parámetros de sesiones: grupos×sesiones por grupo → arreglo. */
  function normSessions(p) {
    const out = Object.assign({}, p);
    if (!out.sessions && out.groups != null && out.sessionsPerGroup != null) {
      out.sessions = new Array(out.groups).fill(out.sessionsPerGroup);
    }
    if (!Array.isArray(out.sessions)) out.sessions = [];
    return out;
  }

  /** Simula según la definición de la misión y los parámetros. */
  function run(simDef, params, capacityLimited) {
    if (simDef.type === "queue") {
      return queue({
        servers: params.servers,
        serviceMin: params.serviceMin,
        periodMin: simDef.periodMin,
        arrivals: params.arrivals,
        capacityLimited
      });
    }
    if (simDef.type === "trips") {
      return trips({
        items: params.items,
        capacity: params.capacity,
        vehicles: params.vehicles,
        tripMin: params.tripMin,
        horizonMin: simDef.horizonMin,
        capacityLimited
      });
    }
    if (simDef.type === "sessions") {
      const p = normSessions(params);
      return sessions({
        sessions: p.sessions,
        spaces: p.spaces,
        blocks: p.blocks,
        capacityLimited
      });
    }
    return null;
  }

  /** Parámetros de una alternativa (merge con la base). */
  function altParams(simDef, alt) {
    const base = Object.assign({}, simDef.base);
    return Object.assign({}, base, alt.params || {});
  }

  /** Métricas legibles para mostrar según tipo. */
  function metricRows(simDef, r) {
    if (r.type === "queue") {
      return [
        { id: "maxWait", label: "Espera máxima", value: r.maxWait, unit: "min", cls: r.maxWait >= 60 ? "bad" : r.maxWait > 0 ? "warn" : "ok" },
        { id: "attended", label: "Demanda atendida", value: r.attendedPct, unit: "%", cls: r.attendedPct >= 90 ? "ok" : "warn" },
        { id: "backlog", label: "Sin atender al cierre", value: r.finalBacklog, unit: "pers.", cls: r.finalBacklog > 0 ? "bad" : "ok" },
        { id: "capacity", label: "Capacidad por bloque", value: r.capPerBlock === null ? "—" : r.capPerBlock, unit: "pers./bloque", cls: "warn" }
      ];
    }
    if (r.type === "trips") {
      return [
        { id: "time", label: "Tiempo total de reparto", value: r.totalTime, unit: "min", cls: r.feasible ? "ok" : "bad" },
        { id: "trips", label: "Viajes necesarios", value: r.totalTrips, unit: "viajes", cls: "info" },
        { id: "attended", label: "Demanda atendida", value: r.attendedPct, unit: "%", cls: r.attendedPct === 100 ? "ok" : "warn" },
        { id: "margin", label: "Margen de la jornada", value: r.marginMin, unit: "min", cls: r.marginMin >= 0 ? "ok" : "bad" }
      ];
    }
    if (r.type === "sessions") {
      return [
        { id: "needed", label: "Sesiones necesarias", value: r.needed, unit: "sesiones", cls: "info" },
        { id: "slots", label: "Lugares disponibles", value: r.slots === null ? "—" : r.slots, unit: "lugares", cls: "info" },
        { id: "saturation", label: "Saturación", value: r.saturation === null ? "—" : r.saturation, unit: "%", cls: r.saturation >= 100 ? "bad" : r.saturation >= 85 ? "warn" : "ok" },
        { id: "attended", label: "Actividades cubiertas", value: r.attendedPct, unit: "%", cls: r.attendedPct === 100 ? "ok" : "warn" }
      ];
    }
    return [];
  }

  /** Clasificación de alternativas según el objetivo de la misión. */
  function rankAlternatives(mission, results) {
    // results: {altId: simResult}
    const key = mission.objectiveKey || "time";
    const scored = mission.alternatives.map((alt) => {
      const r = results[alt.id];
      let score = 0;
      if (r) {
        if (r.type === "queue") score = key === "time" ? -r.maxWait : r.attendedPct;
        if (r.type === "trips") score = key === "time" ? -r.totalTime : r.attendedPct;
        if (r.type === "sessions") score = r.attendedPct;
      }
      return { alt, r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.alt.id);
  }

  OR.SimEngine = { queue, trips, sessions, run, altParams, metricRows, rankAlternatives };
})(window.OR = window.OR || {});
