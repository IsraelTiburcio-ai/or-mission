/* ============================================================
   OR EXPRESS · js/game.js
   Microjuego: engancha los 8 vagones de la Investigación de
   Operaciones en orden. Partida de 60–120 segundos.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- utilidades ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const isReduced = () => document.documentElement.classList.contains("reduced-motion");
  {
    const mq = typeof matchMedia !== "undefined" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mq && mq.matches) document.documentElement.classList.add("reduced-motion");
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", (e) => document.documentElement.classList.toggle("reduced-motion", e.matches));
    }
  }

  const fmt = (n) => n.toLocaleString("es-MX");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- estado ---------- */
  const state = {
    screen: "cover",
    idx: 0,          // fase actual 0..7
    score: 0,
    combo: 1,
    maxCombo: 1,
    correct: 0,      // aciertos a la primera
    rounds: 0,       // rondas completadas (avance del tren)
    wrong: 0,
    t0: 0,
    timer: null,
    options: [],
    busy: false,
    sound: true,
    wrongMap: {},       // idx de fase -> true si se falló en esa ronda
    best: { score: 0, time: 0 }
  };

  const STORE_KEY = "orExpress.v1";
  function loadBest() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      state.sound = raw.sound !== false;
      state.best = { score: raw.bestScore || 0, time: raw.bestTime || 0 };
    } catch (e) { /* sin almacenamiento */ }
  }
  function saveBest() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        sound: state.sound,
        bestScore: state.best.score,
        bestTime: state.best.time
      }));
    } catch (e) { /* noop */ }
  }

  /* ---------- sonido (Web Audio, sin archivos) ---------- */
  let AC = null;
  function tone(freq, dur, type, gain, when) {
    if (!state.sound) return;
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      const t0 = AC.currentTime + (when || 0);
      const o = AC.createOscillator();
      const g = AC.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(AC.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    } catch (e) { /* noop */ }
  }
  const sfx = {
    click() { tone(700, 0.07, "sine", 0.08); },
    whistle() { tone(880, 0.16, "triangle", 0.1); tone(1100, 0.22, "triangle", 0.08, 0.1); },
    couple() { tone(220, 0.08, "square", 0.1); tone(340, 0.1, "square", 0.09, 0.06); },
    correct() { sfx.couple(); sfx.whistle(); },
    combo(n) { tone(600 + n * 90, 0.12, "triangle", 0.11); tone(800 + n * 120, 0.14, "triangle", 0.09, 0.09); },
    error() { tone(190, 0.2, "sawtooth", 0.07); tone(150, 0.26, "sawtooth", 0.06, 0.1); },
    finish() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "triangle", 0.11, i * 0.13)); }
  };

  /* ---------- SVG original: tren ---------- */
  const NS = "http://www.w3.org/2000/svg";

  function wagonSVG(label, opts) {
    opts = opts || {};
    const w = 150, h = 64;
    const body = `<path d="M8 26 Q8 12 24 12 L106 12 Q108 12 110 13 L132 20 Q142 22 142 32 L142 48 Q142 52 138 52 L12 52 Q8 52 8 48 Z" fill="#0d1b33" stroke="${opts.stroke || "#33d6ff"}" stroke-width="2"/>`;
    const wheels = `<circle cx="38" cy="56" r="6" fill="#081226" stroke="#33d6ff" stroke-width="2"/><circle cx="112" cy="56" r="6" fill="#081226" stroke="#33d6ff" stroke-width="2"/>`;
    const text = `<text x="75" y="33" text-anchor="middle" dominant-baseline="middle" font-family="Orbitron, sans-serif" font-size="${opts.size || 11}" font-weight="700" fill="#eaf1ff" letter-spacing="0.06em">${label}</text>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Vagón ${label}">${body}${wheels}${text}</svg>`;
  }

  function locoSVG() {
    const w = 190, h = 64;
    const body = `<path d="M10 30 Q10 10 34 10 L110 10 Q118 10 122 14 L128 20 L152 26 Q168 30 168 44 L168 48 Q168 52 164 52 L14 52 Q10 52 10 48 Z" fill="#0d1b33" stroke="#ffc531" stroke-width="2.4"/>`;
    const cab = `<path d="M122 14 L128 26 L148 32 L152 26 Z" fill="#0b1328" stroke="#ffc531" stroke-width="1.6"/>`;
    const chimney = `<rect x="22" y="2" width="12" height="10" rx="2" fill="#0b1328" stroke="#ffc531" stroke-width="1.8"/>`;
    const wheels = `<circle cx="48" cy="56" r="6" fill="#081226" stroke="#ffc531" stroke-width="2"/><circle cx="86" cy="56" r="6" fill="#081226" stroke="#ffc531" stroke-width="2"/><circle cx="138" cy="56" r="6" fill="#081226" stroke="#ffc531" stroke-width="2"/>`;
    const text = `<text x="34" y="34" text-anchor="start" dominant-baseline="middle" font-family="Orbitron, sans-serif" font-size="8" font-weight="700" fill="#ffc531" letter-spacing="0.04em">I.O.</text>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Locomotora Investigación de Operaciones">${body}${cab}${chimney}${wheels}${text}</svg>`;
  }

  function buildTrain() {
    $("#locomotive").innerHTML = locoSVG();
  }

  /* ---------- opciones ---------- */
  function makeOptions() {
    const correct = PHASES[state.idx];
    const unused = PHASES.slice(state.idx + 1);
    // barajar distractores (aleatorio no afecta lo académico: solo orden de presentación)
    for (let i = unused.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unused[i], unused[j]] = [unused[j], unused[i]];
    }
    const distractors = unused.slice(0, 2);
    const options = [correct, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    state.options = options;
  }

  function renderOptions() {
    const host = $("#options");
    host.innerHTML = "";
    state.options.forEach((ph, i) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.innerHTML = `<span class="opt-wagon">${wagonSVG(ph.name, { stroke: "#33d6ff" })}</span><span class="opt-num">${ph.num}</span>`;
      btn.setAttribute("aria-label", `Vagón ${ph.num}: ${ph.name}`);
      btn.addEventListener("click", () => pick(i, btn));
      host.appendChild(btn);
    });
    // atajo de teclado 1-3
  }

  function pick(i, btn) {
    if (state.busy) return;
    const ph = state.options[i];
    if (ph.id === PHASES[state.idx].id) {
      correct(ph, btn, i);
    } else {
      wrong(ph, btn, i);
    }
  }

  /* ---------- acierto ---------- */
  function correct(ph, btn, i) {
    state.busy = true;
    const comboPts = 100 + 50 * (state.combo - 1);
    state.score += comboPts;
    // solo cuenta como acierto si se atinó a la primera
    if (!state.wrongMap[state.idx]) state.correct += 1;
    state.rounds += 1;
    const combo = state.combo;
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo - 1);

    // marcado visual del botón correcto
    btn.classList.add("opt-correct");
    $$("#options .option").forEach((o, j) => {
      if (j !== i) o.classList.add("opt-dim");
    });

    // enganchar vagón al tren (detrás de la locomotora, que va al frente)
    const train = $("#train");
    const loco = $("#locomotive");
    const car = document.createElement("div");
    car.className = "train-car coupling";
    car.innerHTML = wagonSVG(ph.name);
    car.setAttribute("aria-hidden", "true");
    train.insertBefore(car, loco);
    // vapor junto a la chimenea de la locomotora
    const steam = document.createElement("span");
    steam.className = "steam";
    loco.appendChild(steam);

    // avanzar tren
    const pct = state.rounds / PHASES.length;
    train.style.transition = "left .7s cubic-bezier(.22,1,.36,1)";
    train.style.left = (2 + pct * 62) + "%";

    // frase breve
    $("#pb-num").textContent = ph.num;
    $("#pb-text").textContent = ph.name;
    showPhrase(`<b>${ph.name}</b> — ${ph.tag}`);

    updateHud(comboPts, combo);
    sfx.combo && state.combo > 2 ? sfx.combo(combo) : sfx.correct();

    const delay = isReduced() ? 120 : 750;
    setTimeout(() => {
      car.classList.remove("coupling");
      if (state.rounds >= PHASES.length) {
        finish();
      } else {
        state.idx += 1;
        state.busy = false;
        startTurn();
      }
    }, delay);
  }

  /* ---------- fallo ---------- */
  function wrong(ph, btn, i) {
    state.wrong += 1;
    state.combo = 1;
    state.wrongMap[state.idx] = true;
    btn.classList.add("opt-wrong");
    sfx.error();
    updateHud(0, 1);
    $("#phrase").textContent = "";
    showToast(`«${ph.name}» no es la siguiente fase. Sigue intentando.`);
    setTimeout(() => {
      btn.classList.remove("opt-wrong");
      btn.classList.add("opt-gone");
      setTimeout(() => {
        // re-render opciones con un distractor nuevo (el fallo se aparta)
        makeOptions();
        renderOptions();
      }, isReduced() ? 50 : 260);
    }, isReduced() ? 60 : 420);
  }

  /* ---------- turnos ---------- */
  function startTurn() {
    makeOptions();
    renderOptions();
    $("#phrase").textContent = "";
    $("#pb-num").textContent = PHASES[state.idx].num;
    $("#pb-text").textContent = "¿Qué fase sigue?";
    const first = $("#options .option");
    if (first) first.focus();
  }

  /* ---------- fin de partida ---------- */
  function finish() {
    clearInterval(state.timer);
    const elapsed = Math.round((performance.now() - state.t0) / 1000);
    sfx.finish();

    // el tren acelera hacia la estación
    const train = $("#train");
    train.style.transition = "left 1s cubic-bezier(.2,.8,.2,1)";
    train.style.left = "80%";
    const glow = $("#station");
    glow.classList.add("station-hit");

    // mejor puntuación
    if (state.score > state.best.score || (state.score === state.best.score && (state.best.time === 0 || elapsed < state.best.time))) {
      state.best.score = state.score;
      state.best.time = elapsed;
      saveBest();
    }

    const delay = isReduced() ? 200 : 1500;
    setTimeout(() => showResult(elapsed), delay);
  }

  function showResult(elapsed) {
    state.screen = "result";
    $("#screen-game").hidden = true;
    $("#screen-result").hidden = false;
    $("#res-correct").textContent = `${state.correct}/${PHASES.length}`;
    $("#res-score").textContent = fmt(state.score);
    $("#res-time").textContent = elapsed + "s";
    $("#res-combo").textContent = "x" + state.maxCombo;
    const pct = state.correct / PHASES.length;
    let msg = "¡Trazo perfecto!";
    if (pct === 1) msg = "¡Ruta completa!";
    else if (pct >= 0.75) msg = "¡Casi perfecto!";
    else if (pct >= 0.5) msg = "Buen viaje";
    else msg = "Sigue practicando";
    $("#res-msg").textContent = msg;
    // tren del resultado: vagones en orden + locomotora al frente
    const rt = $("#screen-result .result-train");
    rt.innerHTML = PHASES.map((p) => wagonSVG(p.name, { size: 9 })).join("") + locoSVG();
    $("#btn-again").focus();
  }

  /* ---------- HUD ---------- */
  function updateHud(points, combo) {
    $("#hud-score").textContent = fmt(state.score);
    $("#hud-combo").textContent = "x" + combo;
    $("#hud-combo").classList.toggle("combo-hot", combo > 1);
    const pct = (state.rounds / PHASES.length) * 100;
    $("#progress-fill").style.width = pct + "%";
  }

  function showPhrase(html) {
    const el = $("#phrase");
    el.innerHTML = html;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  function showToast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------- revisión de respuestas ---------- */
  function openReview() {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.setAttribute("role", "presentation");
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Respuestas correctas");

    const head = document.createElement("div");
    head.className = "modal-head";
    const title = document.createElement("h3");
    title.textContent = "RESPUESTAS CORRECTAS";
    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "✕";
    closeBtn.setAttribute("aria-label", "Cerrar");
    head.appendChild(title);
    head.appendChild(closeBtn);
    modal.appendChild(head);

    const list = document.createElement("ol");
    list.className = "review-list";
    PHASES.forEach((ph, i) => {
      const item = document.createElement("li");
      const missed = state.wrongMap[i];
      item.className = "review-item" + (missed ? " missed" : " hit");
      item.innerHTML = `
        <span class="ri-status" aria-hidden="true">${missed ? "✕" : "✓"}</span>
        <span class="ri-num">${ph.num}</span>
        <span class="ri-name">${ph.name}</span>
        <span class="ri-tag">${ph.tag}</span>`;
      list.appendChild(item);
    });
    modal.appendChild(list);

    const note = document.createElement("p");
    note.className = "review-note";
    const failed = Object.keys(state.wrongMap).length;
    note.textContent = failed
      ? `Fallaste ${failed} ${failed === 1 ? "fase" : "fases"}: las marcadas en rojo. Recuerda el orden del proceso.`
      : "Perfecto: enganchaste las 8 fases en el orden correcto del proceso.";
    modal.appendChild(note);

    const actions = document.createElement("div");
    actions.className = "modal-actions";
    const okBtn = document.createElement("button");
    okBtn.className = "btn btn-play btn-sm";
    okBtn.textContent = "ENTENDIDO";
    actions.appendChild(okBtn);
    modal.appendChild(actions);

    function close() {
      backdrop.remove();
      document.removeEventListener("keydown", onKey, true);
      $("#btn-review").focus();
    }
    function onKey(e) {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    }
    closeBtn.addEventListener("click", close);
    okBtn.addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", onKey, true);

    document.body.appendChild(backdrop);
    backdrop.appendChild(modal);
    okBtn.focus();
  }

  /* ---------- partida ---------- */
  function start() {
    state.idx = 0;
    state.score = 0;
    state.combo = 1;
    state.maxCombo = 1;
    state.correct = 0;
    state.rounds = 0;
    state.wrong = 0;
    state.busy = false;
    state.wrongMap = {};

    // limpiar tren
    $("#train").innerHTML = `<div class="locomotive" id="locomotive"></div>`;
    buildTrain();
    const train = $("#train");
    train.style.transition = "none";
    train.style.left = "2%";
    void train.offsetWidth;
    train.style.transition = "";
    $("#station").classList.remove("station-hit");
    $("#progress-fill").style.width = "0%";
    $("#hud-combo").classList.remove("combo-hot");

    state.screen = "game";
    $("#screen-cover").hidden = true;
    $("#screen-result").hidden = true;
    $("#screen-game").hidden = false;

    startTurn();
    state.t0 = performance.now();
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      const s = Math.round((performance.now() - state.t0) / 1000);
      $("#hud-time").textContent = s + "s";
    }, 250);
    sfx.whistle();
  }

  /* ---------- portada ---------- */
  function renderCover() {
    const cover = $("#screen-cover .cover-train");
    // vagones en orden, la locomotora al frente (a la derecha)
    cover.innerHTML = PHASES.map((p) => wagonSVG(p.name, { size: 9 })).join("") + locoSVG();
    $("#cover-best").textContent = state.best.score ? `Mejor: ${fmt(state.best.score)} pts · ${state.best.time}s` : "";
    $("#btn-sound").textContent = state.sound ? "🔊" : "🔇";
    $("#hud-sound").textContent = state.sound ? "🔊" : "🔇";
    $("#btn-play").focus();
  }

  /* ---------- bindings ---------- */
  function bind() {
    $("#btn-play").addEventListener("click", start);
    $("#btn-again").addEventListener("click", start);
    $("#btn-review").addEventListener("click", openReview);
    $("#btn-cover").addEventListener("click", () => {
      state.screen = "cover";
      $("#screen-result").hidden = true;
      $("#screen-game").hidden = true;
      $("#screen-cover").hidden = false;
      renderCover();
    });
    const toggleSound = (btn) => () => {
      state.sound = !state.sound;
      saveBest();
      $("#btn-sound").textContent = state.sound ? "🔊" : "🔇";
      $("#hud-sound").textContent = state.sound ? "🔊" : "🔇";
      if (state.sound) sfx.click();
    };
    $("#btn-sound").addEventListener("click", toggleSound("#btn-sound"));
    $("#hud-sound").addEventListener("click", toggleSound("#hud-sound"));
    // teclado 1-3
    document.addEventListener("keydown", (e) => {
      if (state.screen !== "game" || state.busy) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 3) {
        const btns = $$("#options .option");
        if (btns[n - 1]) { e.preventDefault(); pick(n - 1, btns[n - 1]); }
      }
    });
  }

  /* ---------- arranque ---------- */
  loadBest();
  bind();
  renderCover();
})();
