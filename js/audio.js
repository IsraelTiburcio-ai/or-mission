/* ============================================================
   OR MISSION · js/audio.js
   Sonidos discretos generados con Web Audio API.
   Sin archivos externos y sin música automática.
   ============================================================ */
(function (OR) {
  "use strict";

  let ctx = null;
  let enabled = true;

  function ensureCtx() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) { ctx = null; }
    }
    return ctx;
  }

  function tone(freq, dur, type, gainVal, when) {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainVal || 0.12, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function setEnabled(v) { enabled = !!v; }

  const sfx = {
    select() { tone(660, 0.09, "sine", 0.09); },
    toggle() { tone(440, 0.07, "triangle", 0.08); },
    snap() { tone(880, 0.08, "sine", 0.1); tone(1320, 0.09, "sine", 0.07, 0.03); },
    unlock() { tone(520, 0.14, "triangle", 0.1); tone(780, 0.16, "triangle", 0.1, 0.09); },
    scan() { tone(300, 0.5, "sine", 0.05); },
    scanTick() { tone(1200, 0.04, "square", 0.05); },
    warn() { tone(320, 0.22, "sawtooth", 0.09); tone(240, 0.28, "sawtooth", 0.08, 0.12); },
    error() { tone(220, 0.24, "square", 0.08); tone(160, 0.3, "square", 0.07, 0.16); },
    success() { tone(660, 0.12, "sine", 0.1); tone(990, 0.18, "sine", 0.1, 0.08); },
    achieve() { tone(784, 0.14, "triangle", 0.1); tone(988, 0.14, "triangle", 0.1, 0.11); tone(1319, 0.24, "triangle", 0.11, 0.22); },
    complete() { tone(523, 0.16, "triangle", 0.11); tone(659, 0.16, "triangle", 0.11, 0.14); tone(784, 0.16, "triangle", 0.11, 0.28); tone(1047, 0.34, "triangle", 0.12, 0.42); },
    place() { tone(500, 0.1, "sine", 0.09); tone(750, 0.08, "sine", 0.07, 0.05); },
    link() { tone(620, 0.12, "triangle", 0.09); tone(930, 0.12, "triangle", 0.07, 0.06); }
  };

  OR.Audio = {
    play: (name) => { try { (sfx[name] || sfx.select)(); } catch (e) { /* noop */ } },
    setEnabled,
    get enabled() { return enabled; }
  };
})(window.OR = window.OR || {});
