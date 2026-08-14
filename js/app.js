/* ============================================================
   OR MISSION · js/app.js
   Arranque de la aplicación: carga del estado, ajustes y
   navegación inicial.
   ============================================================ */
(function (OR) {
  "use strict";

  function boot() {
    // estado: restaurar o crear
    const saved = OR.Storage.load();
    OR.State.set(saved || OR.State.create());
    const s = OR.State.get();

    // preferencias
    if (s.settings.reducedMotion === null) {
      s.settings.reducedMotion = OR.State.detectReducedMotion();
      OR.Storage.saveSoon();
    }
    if (s.settings.reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    }
    OR.Audio.setEnabled(s.settings.sound);
    OR.Screens.applyPresentation();

    // íconos y HUD
    OR.UI.mountIcons(document);
    OR.Screens.bindHud();

    // pantalla inicial
    let initial = s.screen || "home";
    // pantallas transitorias de celebración: se regresa al inicio
    if (initial === "missiondone" || initial === "final") initial = "home";
    if (initial === "mission" && !s.currentMission) initial = "command";
    if (initial === "mission" && !OR.MissionEngine.currentMission()) initial = "command";
    OR.Screens.show(initial);

    // logro por sesión (eventual)
    OR.AchievementsEngine.checkAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("beforeunload", () => {
    OR.Storage.save();
  });

  OR.App = { boot };
})(window.OR = window.OR || {});
