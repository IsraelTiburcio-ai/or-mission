/* ============================================================
   OR MISSION · js/achievements.js
   Motor de logros: verificación, desbloqueo y notificación.
   ============================================================ */
(function (OR) {
  "use strict";

  function checkAll() {
    const s = OR.State.get();
    let unlockedAny = false;
    OR.Achievements.DEFS.forEach((def) => {
      if (s.achievements.includes(def.id)) return;
      let ok = false;
      try { ok = def.check(s); } catch (e) { ok = false; }
      if (ok) {
        s.achievements.push(def.id);
        s.lastSeenAchievements.push(def.id);
        unlockedAny = true;
        OR.Audio.play("achieve");
        OR.UI.toast(`${def.name} — ${def.desc}`, { type: "achieve", title: "LOGRO DESBLOQUEADO", duration: 4200 });
      }
    });
    if (unlockedAny) OR.Storage.saveSoon();
    return unlockedAny;
  }

  function count() {
    return OR.State.get().achievements.length;
  }

  function isUnlocked(id) {
    return OR.State.get().achievements.includes(id);
  }

  OR.AchievementsEngine = { checkAll, count, isUnlocked };
})(window.OR = window.OR || {});
