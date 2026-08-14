/* ============================================================
   OR MISSION · js/scoring.js
   Puntuación, precisión y rangos del analista.
   Puntos: fase +300 · inconsistencia +150 · validación 1er
   intento +250 · solución coherente +300 · misión +500.
   Pista: -30.
   ============================================================ */
(function (OR) {
  "use strict";

  const RANKS = [
    { name: "OBSERVADOR", min: 0, icon: "radar" },
    { name: "ANALISTA", min: 1200, icon: "analyst" },
    { name: "ESTRATEGA", min: 3600, icon: "decision" },
    { name: "ESPECIALISTA EN OPERACIONES", min: 7200, icon: "target" },
    { name: "MAESTRO DE DECISIONES", min: 12000, icon: "crown" }
  ];

  const PTS = {
    phase: 300,
    inconsistency: 150,
    firstTry: 250,
    solution: 300,
    mission: 500
  };

  function add(amount, reason) {
    const s = OR.State.get();
    s.score = Math.max(0, s.score + amount);
    OR.Storage.saveSoon();
    return s.score;
  }

  function hintPenalty() {
    return add(-PTS.hint || 30, "pista");
  }

  /** Precisión: aciertos en decisiones sobre intentos totales (0-100). */
  function computePrecision(mission) {
    const st = OR.State.mission(mission.id).state;
    if (st.phasesCompleted === 0 && !st.done) return null;
    // decisiones evaluadas: señales, diagnóstico, definición, alcance, modelo
    const m = mission;
    let total = 0, ok = 0;

    // señales
    const sigIds = m.chaos.items.filter((i) => i.cat === "signal").map((i) => i.id);
    const noiseIds = m.chaos.items.filter((i) => i.cat === "noise").map((i) => i.id);
    total += sigIds.length + noiseIds.length;
    ok += sigIds.filter((id) => st.observations.includes(id)).length;
    ok += noiseIds.filter((id) => !st.observations.includes(id)).length;

    // diagnóstico
    m.diagnosis.slots.forEach((slot) => {
      const chip = slot.chips.find((c) => c.id === st.diagnosis[slot.label]);
      total += 1;
      if (chip && chip.ok) ok += 1;
    });

    // definición
    m.problem.blocks.forEach((b) => {
      const opt = b.options.find((o) => o.id === st.problem[b.id]);
      total += 1;
      if (opt && opt.ok) ok += 1;
    });

    // alcance
    m.scope.cards.forEach((c) => {
      total += 1;
      if (st.scope[c.id] === c.cat) ok += 1;
    });

    // modelo
    const model = st.model;
    const countSel = (options, sel, isMulti) => {
      total += options.length;
      options.forEach((o) => {
        if (!isMulti) {
          if (o.id === sel && o.ok) ok += 1;
          else if (o.id === sel && !o.ok) { /* wrong pick */ }
          else if (o.ok) { /* good option not picked for single choice: neutral */ }
        } else {
          const picked = sel.includes(o.id);
          if (picked && o.ok) ok += 1;
          else if (picked && !o.ok) { /* wrong pick */ }
          else if (!picked && !o.ok) ok += 1;
        }
      });
    };
    countSel(m.model.objective.options, model.objective, false);
    countSel(m.model.decisions.options, model.decisions, true);
    countSel(m.model.constraints.options, model.constraints, true);
    countSel(m.model.data.options, model.data, true);

    if (total === 0) return null;
    return Math.round((ok / total) * 100);
  }

  function recordPrecision(mission) {
    const mp = OR.State.mission(mission.id);
    const p = computePrecision(mission);
    if (p === null) return;
    if (mp.bestPrecision === null || p > mp.bestPrecision) mp.bestPrecision = p;
    OR.Storage.saveSoon();
  }

  function rankIndex(s) {
    s = s || OR.State.get();
    let idx = 0;
    RANKS.forEach((r, i) => { if (s.score >= r.min) idx = i; });
    return idx;
  }

  function rank(s) {
    return RANKS[rankIndex(s)];
  }

  function nextRank(s) {
    s = s || OR.State.get();
    const idx = rankIndex(s);
    return RANKS[idx + 1] || null;
  }

  OR.Scoring = { RANKS, PTS, add, hintPenalty, computePrecision, recordPrecision, rankIndex, rank, nextRank };
})(window.OR = window.OR || {});
