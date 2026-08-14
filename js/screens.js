/* ============================================================
   OR MISSION · js/screens.js
   Pantallas del centro: home, intro cinemática, centro de
   operaciones, archivos, expediente, logros, registro final y
   secuencia de cierre de la colección.
   ============================================================ */
(function (OR) {
  "use strict";

  const { el, icon } = OR.UI;
  const UI = OR.UI;

  let introTimers = [];

  /* ================== navegación básica ================== */

  function show(screenName) {
    const s = OR.State.get();
    s.screen = screenName;
    OR.Storage.saveSoon();
    document.querySelectorAll(".screen").forEach((sc) => {
      sc.hidden = sc.getAttribute("data-screen") !== screenName;
    });
    const hud = document.getElementById("hud");
    const hudScreens = ["command", "mission", "archives", "history", "dashboard", "achievements", "revision", "free", "missiondone", "final"];
    hud.hidden = !hudScreens.includes(screenName);
    document.body.classList.toggle("hud-shown", hudScreens.includes(screenName));
    const main = document.getElementById("main");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
    updateHud();
    rendererFor(screenName) && rendererFor(screenName)();
    if (main) UI.focusFirst(main);
  }

  function rendererFor(name) {
    return {
      home: renderHome,
      intro: renderIntro,
      name: renderName,
      command: renderCommand,
      mission: renderMission,
      archives: renderArchives,
      history: renderHistory,
      dashboard: renderDashboard,
      achievements: renderAchievements,
      revision: renderRevision,
      free: renderFree,
      missiondone: () => {},
      final: renderFinal
    }[name] || null;
  }

  /** Asigna el manejador con onclick (reemplaza, evita duplicados). */
  function bind(id, fn) {
    const b = document.getElementById(id);
    if (b) b.onclick = fn;
  }

  /* ================== HUD ================== */

  function updateHud() {
    const s = OR.State.get();
    const scoreEl = document.getElementById("hud-score");
    if (scoreEl) scoreEl.textContent = String(s.score);
    const rankEl = document.getElementById("hud-rank");
    if (rankEl) {
      const r = OR.Scoring.rank(s);
      rankEl.textContent = r.name;
      rankEl.title = "Rango: " + r.name + " · " + s.score + " pts";
    }
    const soundBtn = document.getElementById("hud-sound");
    if (soundBtn) {
      soundBtn.innerHTML = `<span class="icon" data-icon="${s.settings.sound ? "sound-on" : "sound-off"}"></span>`;
      UI.mountIcons(soundBtn);
    }
    const presBtn = document.getElementById("hud-presentation");
    if (presBtn) presBtn.setAttribute("aria-pressed", s.settings.presentation ? "true" : "false");
    // banner de modo presentación
    let banner = document.getElementById("presentation-banner");
    if (s.settings.presentation) {
      if (!banner) {
        banner = el("div", { id: "presentation-banner", class: "presentation-banner", text: "MODO PRESENTACIÓN" });
        document.body.appendChild(banner);
      }
    } else if (banner) {
      banner.remove();
    }
    renderRouteChips();
  }

  function renderRouteChips() {
    const host = document.getElementById("hud-route");
    const mission = OR.MissionEngine.currentMission();
    if (!mission || !host) {
      if (host) host.innerHTML = "";
      return;
    }
    host.innerHTML = "";
    const phases = OR.MissionEngine.phasesFor(mission);
    const cur = OR.MissionEngine.currentPhase();
    phases.forEach((p, i) => {
      const done = OR.MissionEngine.phaseComplete(mission, i);
      const chip = el("span", { class: "rchip" + (done ? " done" : i === cur ? " active" : ""), title: p.title });
      chip.appendChild(el("span", { text: p.num + " " + p.title }));
      host.appendChild(chip);
    });
  }

  function bindHud() {
    bind("hud-logo", () => show("command"));
    bind("hud-home", () => show("command"));
    bind("hud-sound", () => {
      const s = OR.State.get();
      s.settings.sound = !s.settings.sound;
      OR.Audio.setEnabled(s.settings.sound);
      OR.Storage.saveSoon();
      if (s.settings.sound) OR.Audio.play("select");
      updateHud();
    });
    bind("hud-presentation", () => togglePresentation());
  }

  function togglePresentation() {
    const s = OR.State.get();
    s.settings.presentation = !s.settings.presentation;
    OR.Storage.saveSoon();
    document.body.classList.toggle("mode-presentation", s.settings.presentation);
    updateHud();
    UI.toast(s.settings.presentation ? "Modo presentación activado" : "Modo presentación desactivado", { type: "success", duration: 1800 });
    // refrescar pantalla actual para tamaños de texto
    rendererFor(s.screen) && rendererFor(s.screen)();
    if (s.screen === "mission") OR.PhaseRenderer.render();
  }

  function applyPresentation() {
    document.body.classList.toggle("mode-presentation", OR.State.get().settings.presentation);
  }

  /* ================== HOME ================== */

  function renderHome() {
    const s = OR.State.get();
    const btnEnter = document.getElementById("btn-enter");
    const btnContinue = document.getElementById("btn-continue");
    const soundHome = document.getElementById("btn-sound-home");

    const hasName = !!s.player.name;
    btnEnter.textContent = hasName ? "ENTRAR AL CENTRO DE OPERACIONES" : "COMENZAR MISIÓN";

    const canContinue = s.currentMission && s.missions[s.currentMission] && s.missions[s.currentMission].status === "inprogress";
    btnContinue.hidden = !canContinue;
    btnContinue.onclick = () => {
      const m = OR.Missions.get(s.currentMission);
      if (m && OR.MissionEngine.canStart(m.id)) {
        OR.MissionEngine.start(m.id, "mission");
        show("mission");
      } else {
        show("command");
      }
    };

    btnEnter.onclick = () => {
      if (!s.player.name) { show("name"); return; }
      if (!s.tutorialSeen) { openTutorial(() => { if (!s.introSeen) show("intro"); else show("command"); }); return; }
      if (!s.introSeen) { show("intro"); return; }
      show("command");
    };

    soundHome.textContent = s.settings.sound ? "🔊 Sonido: activado" : "🔇 Sonido: desactivado";
    soundHome.onclick = () => {
      s.settings.sound = !s.settings.sound;
      OR.Audio.setEnabled(s.settings.sound);
      OR.Storage.saveSoon();
      if (s.settings.sound) OR.Audio.play("select");
      soundHome.textContent = s.settings.sound ? "🔊 Sonido: activado" : "🔇 Sonido: desactivado";
    };

    bind("btn-tutorial", () => openTutorial());
    bind("btn-info", openInfo);
    bind("btn-reset", openReset);
  }

  function openTutorial(cb) {
    const slides = [
      { t: "BIENVENIDO AL CENTRO DE OPERACIONES", d: "OR Mission es la experiencia integradora final del Gimnasio 1. Aplicarás todo lo aprendido en los cuatro juegos anteriores para estructurar problemas reales con la Investigación de Operaciones." },
      { t: "LAS OCHO FASES", d: "Problema → Definición → Construcción → Modelo → Validación → Solución → Resultados → Implementación. No son texto para memorizar: las recorrerás realizando acciones en cada misión." },
      { t: "SEÑALES Y RUIDO", d: "Los problemas reales llegan desordenados. En cada misión separarás las señales relevantes del contexto y del ruido, y construirás una definición clara." },
      { t: "EL MODELO PUEDE FALLAR", d: "En la validación, tu modelo se pone a prueba. Si omitiste una restricción, la simulación mostrará un resultado imposible: eso es una oportunidad para revisar y mejorar, no un error definitivo." },
      { t: "MODO PRESENTACIÓN", d: "La profesora puede activar el modo presentación desde el centro de operaciones: textos más grandes, sin puntuación y avance manual entre etapas para proyectar en el salón." }
    ];
    let idx = 0;
    const body = el("div", {});
    const title = el("h3", { style: "margin-bottom:8px;color:var(--cyan)", text: slides[0].t });
    const text = el("p", { text: slides[0].d });
    const dots = el("div", { style: "display:flex;gap:6px;justify-content:center;margin-top:14px" });
    slides.forEach(() => dots.appendChild(el("span", { style: "width:8px;height:8px;border-radius:50%;background:var(--line-strong)", class: "dot" })));
    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(dots);
    const m = UI.modal({
      title: "TUTORIAL",
      body,
      actions: [
        { label: "ANTERIOR", class: "btn-ghost", onClick: () => {
            if (idx > 0) { idx -= 1; refresh(); }
            return false;
          } },
        { label: "SIGUIENTE ▸", class: "btn-primary", onClick: () => {
            if (idx < slides.length - 1) { idx += 1; refresh(); return false; }
            const s = OR.State.get();
            s.tutorialSeen = true;
            OR.Storage.saveSoon();
            if (cb) cb();
            return true;
          } }
      ]
    });
    const refresh = () => {
      title.textContent = slides[idx].t;
      text.textContent = slides[idx].d;
      dots.querySelectorAll(".dot").forEach((d, i) => {
        d.style.background = i === idx ? "var(--cyan)" : "var(--line-strong)";
      });
    };
    refresh();
  }

  function openInfo() {
    UI.modal({
      title: "INFORMACIÓN DEL JUEGO",
      body: el("div", {},
        el("p", { text: "OR MISSION — Centro de Operaciones y Toma de Decisiones es la quinta y última actividad de la colección digital del Gimnasio 1: Introducción a la Teoría de Sistemas, de la materia Optimización I." }),
        el("p", { text: "El estudiante actúa como analista de operaciones: recibe situaciones caóticas y las convierte en problemas estructurados recorriendo las ocho etapas de la Investigación de Operaciones: Problema, Definición, Construcción, Modelo, Validación, Solución, Resultados e Implementación." }),
        el("p", { text: "Contenido académico según el Gimnasio 1 (sección 1.6 Investigación de Operaciones). No requiere internet, cuentas ni datos personales: el progreso se guarda únicamente en este dispositivo." })),
      actions: [{ label: "ENTENDIDO", class: "btn-primary" }]
    });
  }

  function openReset() {
    UI.modal({
      title: "REINICIAR PROGRESO",
      body: el("p", { text: "Se perderán las misiones, puntuación y logros guardados en este dispositivo. Esta acción no se puede deshacer." }),
      actions: [
        { label: "CANCELAR", class: "btn-ghost" },
        { label: "REINICIAR TODO", class: "btn-danger-ghost", onClick: () => {
            OR.Storage.clear();
            OR.State.reset();
            OR.Storage.save();
            OR.Audio.play("warn");
            UI.toast("Progreso reiniciado", { type: "warn" });
            show("home");
            renderHome();
          } }
      ]
    });
  }

  /* ================== NOMBRE ================== */

  function renderName() {
    const form = document.getElementById("name-form");
    const input = document.getElementById("input-name");
    input.value = OR.State.get().player.name || "";
    bind("name-back", () => show("home"));
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = input.value.trim();
      if (!name) {
        UI.toast("Escribe tu nombre o alias para continuar", { type: "warn" });
        input.focus();
        return;
      }
      const s = OR.State.get();
      s.player.name = name;
      s.tutorialSeen = true;
      OR.Storage.saveSoon();
      OR.Audio.play("unlock");
      if (!s.introSeen) show("intro");
      else show("command");
    };
  }

  /* ================== INTRO CINEMÁTICA ================== */

  const INTRO_WORDS = ["PEDIDOS", "PERSONAL", "TIEMPO", "RECURSOS", "COSTOS", "CLIENTES", "INVENTARIO", "CAPACIDAD"];

  function clearIntroTimers() {
    introTimers.forEach(clearTimeout);
    introTimers = [];
  }

  function renderIntro() {
    const viewport = document.getElementById("intro-viewport");
    clearIntroTimers();
    viewport.innerHTML = "";
    const s = OR.State.get();
    const reduced = s.settings.reducedMotion === true;
    const skip = document.getElementById("intro-skip");
    skip.onclick = () => finishIntro(true);

    // palabras del caos
    const wordsBox = el("div", { class: "intro-words" });
    const wordEls = INTRO_WORDS.map((w, i) => {
      const b = el("span", { class: "intro-word chaos-word", text: w });
      b.style.setProperty("--rot", `${(i % 3 - 1) * 4 + (i % 5)}deg`);
      wordsBox.appendChild(b);
      return b;
    });
    viewport.appendChild(wordsBox);

    const headline = el("h1", { class: "intro-headline", text: "CAOS OPERATIVO" });
    viewport.appendChild(headline);

    const phasesBox = el("div", { class: "intro-phases" });
    OR.Phases.forEach((p) => {
      const chip = el("span", { class: "intro-phase" });
      chip.appendChild(el("span", { class: "ip-num", text: p.num }));
      chip.appendChild(el("span", { text: p.title }));
      phasesBox.appendChild(chip);
    });
    viewport.appendChild(phasesBox);

    const cta = el("div", { class: "intro-cta" });
    const startBtn = el("button", { class: "btn btn-primary btn-lg", text: "INICIAR ANÁLISIS ▸" });
    startBtn.addEventListener("click", () => finishIntro(false));
    cta.appendChild(startBtn);
    viewport.appendChild(cta);
    startBtn.style.display = "none";
    cta.style.display = "none";

    const delay = reduced ? 80 : 700;
    const step = (fn, i) => introTimers.push(setTimeout(fn, delay * i));

    // 1. palabras del caos aparecen
    wordEls.forEach((w, i) => step(() => { w.style.animationDelay = "0s"; w.classList.add("shown"); }, i * (reduced ? 1 : 1) + 1));
    // 2. alineación en cuadrícula + cambio de titular
    step(() => {
      wordEls.forEach((w, i) => {
        w.classList.remove("chaos-word");
        w.classList.add("aligned");
      });
      headline.classList.add("ok");
      headline.textContent = "INVESTIGACIÓN DE OPERACIONES";
      OR.Audio.play("unlock");
    }, INTRO_WORDS.length + 2);
    // 3. fases se encienden
    const chips = phasesBox.querySelectorAll(".intro-phase");
    chips.forEach((c, i) => step(() => {
      c.classList.add("lit");
      OR.Audio.play("scanTick");
    }, INTRO_WORDS.length + 4 + i));
    // 4. botón
    step(() => {
      cta.style.display = "";
      startBtn.style.display = "";
      OR.Audio.play("success");
      UI.focusFirst(cta);
    }, INTRO_WORDS.length + 4 + chips.length + 2);

    function finishIntro(skipped) {
      clearIntroTimers();
      const st = OR.State.get();
      st.introSeen = true;
      OR.Storage.saveSoon();
      show("command");
    }
  }

  /* ================== CENTRO DE OPERACIONES ================== */

  function renderCommand() {
    const s = OR.State.get();
    const routeHost = document.getElementById("route-board");
    const grid = document.getElementById("missions-grid");

    // ruta de operaciones de la misión en curso (o la primera disponible)
    const mission = currentMissionForRoute();
    if (mission) {
      routeHost.innerHTML = "";
      const svg = OR.Charts.routeSVG(OR.MissionEngine.phasesFor(mission), (i) => {
        const phases = OR.MissionEngine.phasesFor(mission);
        const cur = OR.State.mission(mission.id).phase;
        if (OR.MissionEngine.phaseComplete(mission, i)) return { cls: "done" };
        if (i <= Math.max(cur, 0)) return { cls: "active" };
        return { cls: "locked" };
      });
      // clic en estación
      svg.querySelectorAll(".rb-station").forEach((g, i) => {
        g.addEventListener("click", () => {
          const phases = OR.MissionEngine.phasesFor(mission);
          if (i >= phases.length) return;
          const cls = g.getAttribute("class");
          if (cls.includes("locked")) {
            OR.Audio.play("warn");
            UI.toast("Completa las fases anteriores para desbloquear esta estación", { type: "warn" });
            return;
          }
          if (OR.MissionEngine.currentMission() !== mission.id) {
            OR.MissionEngine.start(mission.id, "mission");
          }
          OR.MissionEngine.goToPhase(mission, i);
          OR.Audio.play("select");
          show("mission");
        });
      });
      routeHost.appendChild(svg);
    } else {
      routeHost.innerHTML = "";
      routeHost.appendChild(el("div", { class: "radar-head", text: "Completa la primera misión para iluminar la ruta." }));
    }

    // tarjetas de misiones
    grid.innerHTML = "";
    OR.Missions.LIST.forEach((m) => {
      const mp = s.missions[m.id];
      const status = mp.status;
      const done = status === "done";
      const inProgress = status === "inprogress";
      const open = status === "open";
      const locked = status === "locked";

      const card = el("button", {
        class: "mission-card" + (m.final ? " final" : "") + (done ? " done" : ""),
        disabled: locked
      });

      const top = el("div", { class: "m-top" });
      top.appendChild(el("span", { class: "m-code", text: m.code }));
      const stTag = el("span", { class: "m-status" + (done ? " st-done" : inProgress ? " st-inprogress" : open ? " st-open" : m.final ? " st-final" : "") });
      stTag.textContent = locked ? "Bloqueada" : done ? "Completada" : inProgress ? "En curso" : m.final ? "Misión final" : "Disponible";
      top.appendChild(stTag);
      card.appendChild(top);

      card.appendChild(el("div", { class: "m-icon", html: UI.icon(m.icon, 30) }));
      card.appendChild(el("div", { class: "m-name", text: m.title }));
      card.appendChild(el("div", { class: "m-scenario", text: m.scenario }));
      card.appendChild(el("div", { class: "m-brief", text: m.brief }));

      const foot = el("div", { class: "m-foot" });
      if (done) {
        foot.appendChild(el("span", { class: "m-score", text: `Mejor: ${mp.bestScore} pts` }));
        foot.appendChild(el("span", { class: "m-cta", text: "REPETIR ▸" }));
      } else if (locked) {
        foot.appendChild(el("span", { class: "m-score", text: m.final ? "Requiere 4 misiones" : "Completa la anterior" }));
        foot.appendChild(el("span", { class: "m-cta", html: UI.icon("lock", 14) }));
      } else {
        foot.appendChild(el("span", { class: "m-score", text: inProgress ? `Fase ${mp.phase}` : "Lista para iniciar" }));
        foot.appendChild(el("span", { class: "m-cta", text: inProgress ? "CONTINUAR ▸" : "INICIAR ▸" }));
      }
      card.appendChild(foot);

      card.addEventListener("click", () => {
        if (locked) {
          OR.Audio.play("warn");
          UI.toast(m.final ? "Completa las 4 misiones principales para desbloquear la misión final" : "Completa la misión anterior para desbloquear esta", { type: "warn" });
          return;
        }
        OR.Audio.play("unlock");
        OR.MissionEngine.start(m.id, "mission");
        show("mission");
      });
      grid.appendChild(card);
    });

    // botones del centro
    bind("cmd-archives", () => show("archives"));
    bind("cmd-history", () => show("history"));
    bind("cmd-dashboard", () => show("dashboard"));
    bind("cmd-achievements", () => show("achievements"));
    bind("cmd-free", () => show("free"));
    const revisionBtn = document.getElementById("cmd-revision");
    const hasDone = OR.Missions.LIST.some((m) => s.missions[m.id].status === "done");
    revisionBtn.hidden = !hasDone;
    bind("cmd-revision", () => show("revision"));
    const presBtn = document.getElementById("cmd-presentation");
    presBtn.setAttribute("aria-pressed", s.settings.presentation ? "true" : "false");
    bind("cmd-presentation", () => togglePresentation());
  }

  function currentMissionForRoute() {
    const s = OR.State.get();
    if (s.currentMission && s.missions[s.currentMission]) return OR.Missions.get(s.currentMission);
    const open = OR.Missions.LIST.find((m) => s.missions[m.id] && s.missions[m.id].status !== "locked");
    return open || null;
  }

  /* ================== MISIÓN ================== */

  function renderMission() {
    const host = document.getElementById("mission-host");
    host.innerHTML = "";
    const mission = OR.MissionEngine.currentMission();
    if (!mission) { show("command"); return; }
    OR.PhaseRenderer.render();
  }

  /* ================== ARCHIVO DE MÉTODOS ================== */

  function renderArchives() {
    const grid = document.getElementById("methods-grid");
    grid.innerHTML = "";
    const s = OR.State.get();
    const mainDone = OR.Missions.main().filter((m) => s.missions[m.id].status === "done").length;
    OR.Methods.DEFS.forEach((m) => {
      const unlocked = m.unlockMission <= mainDone;
      const card = el("div", { class: "method-card" + (unlocked ? " unlocked" : "") });
      card.appendChild(el("div", { class: "m-icon", html: UI.icon(m.icon, 26) }));
      card.appendChild(el("div", { class: "m-name", text: m.name }));
      card.appendChild(el("div", { class: "m-desc", text: m.desc }));
      if (!unlocked) {
        card.appendChild(el("div", { class: "m-lock" },
          el("span", { html: UI.icon("lock", 16) }),
          el("span", { text: "Completa " + m.unlockMission + (m.unlockMission === 1 ? " misión" : " misiones") })));
      }
      grid.appendChild(card);
    });
    bind("archives-back", () => show("command"));
  }

  /* ================== HISTÓRICO ================== */

  function renderHistory() {
    const host = document.getElementById("history-host");
    host.innerHTML = "";
    OR.History.BLOCKS.forEach((b) => {
      const block = el("div", { class: "history-block" });
      block.appendChild(el("h3", { text: b.title }));
      if (b.text) block.appendChild(el("p", { text: b.text }));
      if (b.items) {
        const ul = el("ul");
        b.items.forEach((it) => ul.appendChild(el("li", { text: it })));
        block.appendChild(ul);
      }
      if (b.timeline) {
        const tl = el("div", { class: "timeline-h" });
        b.timeline.forEach((t) => {
          const item = el("div", { class: "tl-item" });
          item.appendChild(el("span", { class: "tl-year", text: t.year }));
          item.appendChild(el("span", { class: "tl-text", text: t.text }));
          tl.appendChild(item);
        });
        block.appendChild(tl);
      }
      host.appendChild(block);
    });
    bind("history-back", () => show("command"));
  }

  /* ================== EXPEDIENTE ================== */

  function renderDashboard() {
    const host = document.getElementById("dashboard-host");
    host.innerHTML = "";
    const s = OR.State.get();
    const missionsDone = OR.Missions.LIST.filter((m) => s.missions[m.id].status === "done").length;
    const precisions = OR.Missions.LIST.map((m) => s.missions[m.id].bestPrecision).filter((p) => p !== null && p !== undefined);
    const avgPrecision = precisions.length ? Math.round(precisions.reduce((a, b) => a + b, 0) / precisions.length) : 0;
    const rank = OR.Scoring.rank(s);
    const next = OR.Scoring.nextRank(s);

    const banner = el("div", { class: "rank-banner" });
    banner.appendChild(el("div", { class: "rank-orb", html: UI.icon(rank.icon, 26) }));
    const btext = el("div", { style: "flex:1" });
    btext.appendChild(el("div", { class: "rank-name", text: rank.name }));
    btext.appendChild(el("div", { class: "rank-progress" },
      el("div", { class: "progress-track" },
        el("div", { class: "progress-fill", style: "width:" + rankProgress(s) + "%" }))));
    if (next) btext.appendChild(el("div", { style: "font-size:.82rem;color:var(--text-2);margin-top:6px", text: `Faltan ${next.min - s.score} pts para ${next.name}` }));
    else btext.appendChild(el("div", { style: "font-size:.82rem;color:var(--teal);margin-top:6px", text: "Rango máximo alcanzado" }));
    banner.appendChild(btext);
    host.appendChild(banner);

    const stats = [
      { ico: "target", value: `${missionsDone}/${OR.Missions.LIST.length}`, label: "Misiones" },
      { ico: "file", value: String(OR.State.totalPhasesCompleted()), label: "Fases completadas" },
      { ico: "perfect", value: avgPrecision + "%", label: "Precisión media" },
      { ico: "scanner", value: String(s.stats.validationsRun), label: "Modelos validados" },
      { ico: "bug", value: String(s.stats.inconsistenciesFound), label: "Errores detectados" },
      { ico: "trophy", value: `${OR.AchievementsEngine.count()}/${OR.Achievements.DEFS.length}`, label: "Logros" },
      { ico: "star", value: String(s.score), label: "Puntuación" },
      { ico: "history", value: String(s.stats.hintsUsed), label: "Pistas usadas" }
    ];
    stats.forEach((st) => {
      const card = el("div", { class: "stat-card" });
      card.appendChild(el("div", { class: "icon", html: UI.icon(st.ico, 22) }));
      card.appendChild(el("div", { class: "stat-value", text: st.value }));
      card.appendChild(el("div", { class: "stat-label", text: st.label }));
      host.appendChild(card);
    });
    bind("dashboard-back", () => show("command"));
  }

  function rankProgress(s) {
    const idx = OR.Scoring.rankIndex(s);
    const cur = OR.Scoring.RANKS[idx];
    const next = OR.Scoring.RANKS[idx + 1];
    if (!next) return 100;
    const span = next.min - cur.min;
    return Math.round(((s.score - cur.min) / span) * 100);
  }

  /* ================== LOGROS ================== */

  function renderAchievements() {
    const grid = document.getElementById("ach-grid");
    grid.innerHTML = "";
    OR.Achievements.DEFS.forEach((def) => {
      const unlocked = OR.AchievementsEngine.isUnlocked(def.id);
      const card = el("div", { class: "ach-card" + (unlocked ? " unlocked" : "") });
      card.appendChild(el("div", { class: "ach-icon", html: UI.icon(def.icon, 26) }));
      card.appendChild(el("div", { class: "ach-name", text: def.name }));
      card.appendChild(el("div", { class: "ach-desc", text: unlocked ? def.desc : "Logro bloqueado" }));
      grid.appendChild(card);
    });
    bind("ach-back", () => show("command"));
  }

  /* ================== MODO ANALISTA ================== */

  function renderRevision() {
    const host = document.getElementById("revision-host");
    host.innerHTML = "";
    const s = OR.State.get();
    const done = OR.Missions.LIST.filter((m) => s.missions[m.id].status === "done");
    if (done.length === 0) {
      host.appendChild(el("div", { class: "panel-card" }, el("p", { text: "Aún no completas ninguna misión. Completa al menos una para usar el modo analista." })));
    }
    done.forEach((m) => {
      const mp = s.missions[m.id];
      const card = el("div", { class: "rev-card" });
      card.appendChild(el("h3", { text: `${m.code} · ${m.title}` }));
      const stats = el("div", { class: "rev-stats" });
      stats.appendChild(el("span", { html: `Mejor puntuación: <b>${mp.bestScore} pts</b>` }));
      stats.appendChild(el("span", { html: `Mejor precisión: <b>${mp.bestPrecision === null || mp.bestPrecision === undefined ? "—" : mp.bestPrecision + "%"}</b>` }));
      stats.appendChild(el("span", { html: `Intentos: <b>${mp.attempts}</b>` }));
      card.appendChild(stats);
      const rep = el("button", { class: "btn btn-ghost btn-sm", text: "REPETIR MISIÓN ▸" });
      rep.addEventListener("click", () => {
        OR.Audio.play("unlock");
        OR.MissionEngine.start(m.id, "mission");
        show("mission");
      });
      card.appendChild(rep);
      host.appendChild(card);
    });
    bind("revision-back", () => show("command"));
  }

  /* ================== SALA DE ANÁLISIS ================== */

  function renderFree() {
    const host = document.getElementById("free-host");
    host.innerHTML = "";
    OR.Missions.LIST.forEach((m) => {
      const card = el("div", { class: "free-card" });
      card.appendChild(el("h3", { text: `${m.code} · ${m.title}` }));
      card.appendChild(el("p", { style: "color:var(--text-2);font-size:.9rem;margin-bottom:10px", text: m.brief }));
      const go = el("button", { class: "btn btn-ghost btn-sm", text: "RECORRER LIBREMENTE ▸" });
      go.addEventListener("click", () => {
        OR.Audio.play("select");
        OR.MissionEngine.start(m.id, "free");
        show("mission");
      });
      card.appendChild(go);
      host.appendChild(card);
    });
    bind("free-back", () => show("command"));
  }

  /* ================== MISIÓN COMPLETADA ================== */

  function missionDone(mission) {
    show("missiondone");
    const host = document.getElementById("missiondone-host");
    host.innerHTML = "";
    const s = OR.State.get();
    const mp = s.missions[mission.id];
    const wrap = el("div", { class: "mission-summary panel-card" });

    const stations = el("div", { class: "summary-stations" });
    OR.MissionEngine.phasesFor(mission).forEach((p, i) => {
      stations.appendChild(el("div", { class: "ss-node", title: p.title }, el("i", { text: "✓" })));
    });
    wrap.appendChild(stations);

    wrap.appendChild(el("h2", { style: "font-size:clamp(1.2rem,3.4vw,1.8rem)", text: "MISIÓN COMPLETADA" }));
    wrap.appendChild(el("div", { class: "summary-points", text: "+" + OR.Scoring.PTS.mission + " pts" }));
    wrap.appendChild(el("p", { style: "max-width:620px", text: mission.completion.text }));

    if (mp.bestPrecision !== null && mp.bestPrecision !== undefined) {
      wrap.appendChild(el("div", { class: "complexity-strip", style: "justify-content:center" },
        el("span", { class: "cs-item", html: `Precisión: <b>${mp.bestPrecision}%</b>` }),
        el("span", { class: "cs-item", html: `Puntuación: <b>${s.score} pts</b>` })));
    }

    const actions = el("div", { class: "btn-row" });
    if (!mission.final) {
      const next = OR.Missions.LIST[OR.Missions.LIST.indexOf(mission) + 1];
      if (next) {
        const nb = el("button", { class: "btn btn-primary btn-lg" });
        if (s.missions[next.id].status === "open" || s.missions[next.id].status === "inprogress") {
          nb.textContent = "SIGUIENTE MISIÓN ▸";
          nb.addEventListener("click", () => {
            OR.MissionEngine.start(next.id, "mission");
            show("mission");
          });
        } else {
          nb.textContent = next.final ? "MISIÓN FINAL BLOQUEADA" : "SIGUIENTE MISIÓN BLOQUEADA";
          nb.disabled = true;
        }
        actions.appendChild(nb);
      }
    } else {
      const finalBtn = el("button", { class: "btn btn-primary btn-lg", text: "VER TU RUTA POR EL GIMNASIO ▸" });
      finalBtn.addEventListener("click", () => show("final"));
      actions.appendChild(finalBtn);
    }
    const centerBtn = el("button", { class: "btn btn-ghost btn-lg", text: "VOLVER AL CENTRO" });
    centerBtn.addEventListener("click", () => show("command"));
    actions.appendChild(centerBtn);
    wrap.appendChild(actions);
    host.appendChild(wrap);
    OR.AchievementsEngine.checkAll();
  }

  /* ================== SECUENCIA FINAL ================== */

  function renderFinal() {
    const host = document.getElementById("final-host");
    host.innerHTML = "";
    const s = OR.State.get();

    const stage = el("div", { class: "final-stage" });
    const canvas = el("div", { class: "final-canvas" });
    const title = el("h2");
    const sub = el("p", { class: "fs-sub" });
    const actionsBox = el("div", { class: "final-actions" });
    stage.appendChild(title);
    stage.appendChild(canvas);
    stage.appendChild(sub);
    stage.appendChild(actionsBox);
    host.appendChild(stage);

    // --- ETAPA A: la ruta completa se enciende
    title.textContent = "RUTA OR COMPLETADA";
    sub.textContent = "Las ocho estaciones de la Investigación de Operaciones quedan conectadas.";
    const route = el("div", { class: "orbit-route" });
    canvas.innerHTML = "";
    canvas.appendChild(route);
    const phases = OR.Phases;
    phases.forEach((p, i) => {
      const a = (i / phases.length) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + 42 * Math.cos(a);
      const y = 50 + 42 * Math.sin(a);
      const node = el("div", { class: "or-node", style: `left:${x}%;top:${y}%` });
      node.textContent = p.num;
      route.appendChild(node);
      setTimeout(() => {
        node.classList.add("lit");
        OR.Audio.play("scanTick");
      }, 200 + i * 350);
    });
    actionsBox.innerHTML = "";
    const nextA = el("button", { class: "btn btn-primary btn-lg", text: "VER LA RUTA DEL GIMNASIO ▸" });
    nextA.addEventListener("click", () => stageB());
    actionsBox.appendChild(nextA);

    // --- ETAPA B: tu ruta por el gimnasio
    function stageB() {
      title.textContent = "TU RUTA POR EL GIMNASIO";
      sub.textContent = "Los cinco juegos de la colección forman un camino académico continuo.";
      canvas.innerHTML = "";
      const path = el("div", { class: "gym-path" });
      const stops = [
        { name: "OPTIQUEST", desc: "Comprendiste los sistemas." },
        { name: "SYSTEM LAB", desc: "Aprendiste a construirlos y clasificarlos." },
        { name: "SYSTEM SCOPE", desc: "Aprendiste a delimitar su alcance." },
        { name: "COMPLEXITY LAB", desc: "Exploraste sus relaciones y complejidad." },
        { name: "OR MISSION", desc: "Utilizaste el enfoque para estructurar problemas y tomar decisiones." }
      ];
      stops.forEach((st, i) => {
        const node = el("div", { class: "gym-node" + (i === stops.length - 1 ? " hl" : "") });
        node.appendChild(el("div", { class: "gn-name", text: st.name }));
        node.appendChild(el("div", { class: "gn-desc", text: st.desc }));
        path.appendChild(node);
        if (i < stops.length - 1) {
          const link = el("div", { class: "gym-link", text: "↓" });
          path.appendChild(link);
        }
        setTimeout(() => {
          node.classList.add("shown");
          if (i < stops.length - 1) path.children[i * 2 + 1].classList.add("shown");
          OR.Audio.play("scanTick");
        }, 250 + i * 650);
      });
      canvas.appendChild(path);
      actionsBox.innerHTML = "";
      const nextB = el("button", { class: "btn btn-primary btn-lg", text: "EL MODELO DE DECISIÓN ▸" });
      nextB.addEventListener("click", () => stageC());
      actionsBox.appendChild(nextB);
    }

    // --- ETAPA C: nodo → sistema → modelo
    function stageC() {
      title.textContent = "DE LA OBSERVACIÓN A LA DECISIÓN";
      sub.textContent = "Un nodo se integra a un sistema, y el sistema se organiza en un modelo de decisión.";
      canvas.innerHTML = "";
      const svg = el("svg", { viewBox: "0 0 600 600", style: "width:100%;height:100%" });
      canvas.appendChild(svg);
      const NS = "http://www.w3.org/2000/svg";
      const drawNode = (x, y, r, color, label) => {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", `translate(${x},${y})`);
        g.setAttribute("opacity", "0");
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("r", r);
        c.setAttribute("fill", "none");
        c.setAttribute("stroke", color);
        c.setAttribute("stroke-width", "2");
        g.appendChild(c);
        if (label) {
          const t = document.createElementNS(NS, "text");
          t.textContent = label;
          t.setAttribute("fill", color);
          t.setAttribute("font-family", "Rajdhani, sans-serif");
          t.setAttribute("font-size", "14");
          t.setAttribute("font-weight", "600");
          t.setAttribute("text-anchor", "middle");
          t.setAttribute("y", "4");
          g.appendChild(t);
        }
        svg.appendChild(g);
        return g;
      };
      const drawLink = (x1, y1, x2, y2, color) => {
        const l = document.createElementNS(NS, "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        l.setAttribute("stroke", color);
        l.setAttribute("stroke-width", "1.5");
        l.setAttribute("opacity", "0");
        svg.appendChild(l);
        return l;
      };

      // 1. un nodo
      const n0 = drawNode(300, 300, 26, "#33d6ff", "SISTEMA");
      n0.setAttribute("opacity", "1");

      // 2. se agregan componentes (subsistemas y entorno)
      const subs = [
        { x: 150, y: 200, l: "SUBSISTEMA" }, { x: 450, y: 200, l: "SUBSISTEMA" },
        { x: 150, y: 420, l: "SUBSISTEMA" }, { x: 450, y: 420, l: "SUBSISTEMA" }
      ];
      const envs = [
        { x: 60, y: 300, l: "ENTORNO" }, { x: 540, y: 300, l: "ENTORNO" }
      ];
      const links0 = subs.map((s) => drawLink(300, 300, s.x, s.y, "rgba(51,214,255,.45)"));
      subs.forEach((s, i) => setTimeout(() => { links0[i].setAttribute("opacity", "1"); }, 200 + i * 150));
      subs.forEach((s, i) => setTimeout(() => { drawNode(s.x, s.y, 16, "#2fe8c0", s.l).setAttribute("opacity", "1"); OR.Audio.play("scanTick"); }, 350 + i * 150));
      envs.forEach((e, i) => setTimeout(() => {
        const g = drawNode(e.x, e.y, 13, "#6c7ea6", e.l);
        g.setAttribute("opacity", "1");
        const l = drawLink(300, 300, e.x, e.y, "rgba(108,126,166,.4)");
        l.setAttribute("opacity", "1");
        OR.Audio.play("scanTick");
      }, 1050 + i * 200));

      // 3. muchas relaciones
      setTimeout(() => {
        for (let i = 0; i < subs.length; i++) {
          for (let j = i + 1; j < subs.length; j++) {
            const l = drawLink(subs[i].x, subs[i].y, subs[j].x, subs[j].y, "rgba(145,123,255,.5)");
            l.setAttribute("opacity", "1");
          }
        }
        OR.Audio.play("link");
      }, 1700);

      // 4. reorganización en modelo de decisión
      setTimeout(() => {
        title.textContent = "UN MODELO DE DECISIÓN";
        sub.textContent = "El sistema analizado se organiza en objetivo, decisiones, restricciones y datos.";
        svg.querySelectorAll("line").forEach((l) => { l.setAttribute("opacity", "0"); });
        svg.querySelectorAll("circle").forEach((c) => {
          c.parentNode.setAttribute("opacity", "0");
        });
        const nodes = [
          { x: 300, y: 90, l: "OBJETIVO", c: "#2fe8c0" },
          { x: 150, y: 300, l: "DECISIONES", c: "#917bff" },
          { x: 450, y: 300, l: "RESTRICCIONES", c: "#ff6b5e" },
          { x: 300, y: 500, l: "DATOS", c: "#33d6ff" }
        ];
        const linksM = [
          [0, 1], [0, 2], [1, 3], [2, 3]
        ];
        nodes.forEach((nd, i) => setTimeout(() => {
          const g = drawNode(nd.x, nd.y, 26, nd.c, nd.l);
          g.setAttribute("opacity", "1");
          OR.Audio.play("scanTick");
        }, 300 + i * 260));
        linksM.forEach(([a, b], i) => setTimeout(() => {
          const l = drawLink(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, "rgba(51,214,255,.55)");
          l.setAttribute("opacity", "1");
          l.setAttribute("stroke-dasharray", "5 5");
        }, 1400 + i * 200));
        setTimeout(() => {
          OR.Audio.play("complete");
          title.textContent = "OPTIMIZACIÓN I";
          sub.innerHTML = "<b>GIMNASIO 1 COMPLETADO</b><br><br>Comprender un sistema es el primer paso.<br>Analizarlo permite tomar mejores decisiones.";
          actionsBox.innerHTML = "";
          const reg = el("button", { class: "btn btn-primary btn-lg", text: "VER REGISTRO DE MISIÓN ▸" });
          reg.addEventListener("click", () => stageD());
          actionsBox.appendChild(reg);
          const home = el("button", { class: "btn btn-ghost btn-lg", text: "VOLVER AL CENTRO" });
          home.addEventListener("click", () => show("command"));
          actionsBox.appendChild(home);
        }, 2000);
      }, 2200);
    }

    // --- ETAPA D: registro
    function stageD() {
      title.textContent = "REGISTRO DE MISIÓN";
      sub.textContent = "Gimnasio 1 — Ruta completada";
      canvas.innerHTML = "";
      const s2 = OR.State.get();
      const precisions = OR.Missions.LIST.map((m) => s2.missions[m.id].bestPrecision).filter((p) => p !== null && p !== undefined);
      const avgPrecision = precisions.length ? Math.round(precisions.reduce((a, b) => a + b, 0) / precisions.length) : 0;
      const date = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
      const printArea = el("div", { id: "print-area" });
      printArea.innerHTML = `
        <h1>OR MISSION — Centro de Operaciones y Toma de Decisiones</h1>
        <h2>GIMNASIO 1 — RUTA COMPLETADA · Optimización I · Introducción a la Teoría de Sistemas</h2>
        <div class="pr-badge">Investigación de Operaciones · 8 etapas</div>
        <div class="pr-row"><span>Analista</span><b>${escapeHtml(s2.player.name)}</b></div>
        <div class="pr-row"><span>Rango</span><b>${OR.Scoring.rank(s2).name}</b></div>
        <div class="pr-row"><span>Puntuación</span><b>${s2.score} pts</b></div>
        <div class="pr-row"><span>Precisión media</span><b>${avgPrecision}%</b></div>
        <div class="pr-row"><span>Misiones</span><b>${OR.Missions.LIST.filter((m) => s2.missions[m.id].status === "done").length}/${OR.Missions.LIST.length}</b></div>
        <div class="pr-row"><span>Fecha</span><b>${date}</b></div>
        <div class="pr-note">Registro interno de la colección digital del Gimnasio 1. Emitido desde este dispositivo.</div>
      `;
      canvas.appendChild(printArea);
      actionsBox.innerHTML = "";
      const printBtn = el("button", { class: "btn btn-primary btn-lg", text: "IMPRIMIR REGISTRO" });
      printBtn.addEventListener("click", () => { window.print(); });
      actionsBox.appendChild(printBtn);
      const home = el("button", { class: "btn btn-ghost btn-lg", text: "VOLVER AL CENTRO" });
      home.addEventListener("click", () => show("command"));
      actionsBox.appendChild(home);
    }

    stageA();
    function stageA() { /* ruta inicial ya dibujada */ }
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  /* ================== export ================== */

  OR.Screens = {
    show,
    updateHud,
    bindHud,
    applyPresentation,
    missionDone,
    renderHome
  };
})(window.OR = window.OR || {});
