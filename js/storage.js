/* ============================================================
   OR MISSION · js/storage.js
   Persistencia en localStorage con debounce.
   ============================================================ */
(function (OR) {
  "use strict";

  const KEY = "orMission.save.v1";
  let saveTimer = null;

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(OR.State.get()));
    } catch (e) { /* almacenamiento no disponible */ }
  }

  function saveSoon() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      save();
    }, 150);
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return OR.State.load(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) { /* noop */ }
  }

  function hasSave() {
    try {
      return !!localStorage.getItem(KEY);
    } catch (e) {
      return false;
    }
  }

  OR.Storage = { save, saveSoon, load, clear, hasSave, KEY };
})(window.OR = window.OR || {});
