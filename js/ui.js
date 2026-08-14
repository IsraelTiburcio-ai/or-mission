/* ============================================================
   OR MISSION · js/ui.js
   Utilidades de interfaz: íconos SVG originales, creación de
   nodos, toasts, modales, feedback accesible y focus.
   ============================================================ */
(function (OR) {
  "use strict";

  /* ---------- Registro de íconos (SVG originales) ---------- */
  const S = 24;
  const ICONS = {
    ormission: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><path d="M12 9.4C12 5.2 14.4 2.6 18.2 1.6M12 9.4C12 5.2 9.6 2.6 5.8 1.6M12 14.6v6.8"/><circle cx="18.2" cy="1.6" r="1.5" fill="currentColor" stroke="none"/><circle cx="5.8" cy="1.6" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="21.4" r="1.5" fill="currentColor" stroke="none"/></g>`,
    home: `<path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5V15h-5v6.5H4.5A1.5 1.5 0 0 1 3 20z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    soundOn: `<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    soundOff: `<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="m17 9 5 6M22 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    presentation: `<rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 16v4m-4 0h8M8 8h8M8 11h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    radar: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.6"/><circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/><path d="M12 12 20 6M12 12l1.5-8.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.5" cy="7.5" r="1.4" fill="currentColor"/>`,
    users: `<circle cx="9" cy="8.5" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19.5c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16.4 14.6c2.1.4 3.5 1.9 4 4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    cashier: `<rect x="4" y="9" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 13h16M9 20v-5h6v5M8 9V6a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    tray: `<path d="M3 13h18l-1.6 6.4a2 2 0 0 1-2 1.6H6.6a2 2 0 0 1-2-1.6L3 13z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 13c0-2 1.8-3 4.5-3h9c2.7 0 4.5 1 4.5 3M9 10V7.5M15 10V7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    check: `<path d="m4.5 12.5 5 5 10-11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    staff: `<circle cx="12" cy="7" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 20.5c.7-3.8 3.4-6 7-6s6.3 2.2 7 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 10.2V16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    money: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v2.2M12 14.8V17M14.4 8.2c-.6-.9-1.5-1.2-2.4-1.2-1.5 0-2.7.9-2.7 2.2 0 2.9 5.4 1.6 5.4 4.5 0 1.3-1.2 2.2-2.7 2.2-1 0-1.9-.4-2.5-1.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    timer: `<circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9.5V13l3 2M9 2.5h6M12 2.5v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    clock: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    music: `<path d="M9 17.5V5.5l11-2v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="15.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
    sun: `<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    chair: `<path d="M7 21v-5h10v5M7 16H5.5A1.5 1.5 0 0 1 4 14.5v-2A1.5 1.5 0 0 1 5.5 11H7M17 16h1.5a1.5 1.5 0 0 0 1.5-1.5v-2a1.5 1.5 0 0 0-1.5-1.5H17M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    bowl: `<path d="M3.5 12.5h17c-.4 4.6-3.6 8-8.5 8s-8.1-3.4-8.5-8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4.5 12.5c0-2.6 1.8-4 7.5-4s7.5 1.4 7.5 4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5c.8 1 .8 2 0 3M12.5 3.5c.8 1 .8 2 0 3M17 4.5c.8 1 .8 2 0 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    chat: `<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    megaphone: `<path d="M3.5 10.5v4a1 1 0 0 0 1 1h2l2 5h2.2l-1.8-6.5M6.5 9l11-5v16l-11-5v-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M19 9.5a2.5 2.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    box: `<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
    book: `<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 16.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    lamp: `<path d="M9 3h6l-1.5 6h-3L9 3zM12 9v5M9.5 14h5v4h-5zM8 20.5h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,
    plant: `<path d="M12 21v-6M12 15c-3.5 0-6-2-6-5 3.5 0 6 2 6 5zM12 13.5c2.5-2.5 2.5-6 0-8.5-2.5 2.5-2.5 6 0 8.5zM12 13.5c-1.8-1.5-4-1.8-6-1 1.5 3 4 3.5 6 1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    exit: `<path d="M3 12h10M10 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 4.5h6A1.5 1.5 0 0 1 21 6v12a1.5 1.5 0 0 1-1.5 1.5h-6" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    truck: `<path d="M2.5 6h11v10h-11zM13.5 9h4l3 3.5V16h-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="17.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.3 17.5h6.9" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    map: `<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    warehouse: `<path d="M3 20V9.5L12 4l9 5.5V20M7 20v-9h10v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    gauge: `<path d="M4 15a8 8 0 1 1 16 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 15l4.5-5.5M12 15a2.2 2.2 0 1 0 2.2 2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    key: `<circle cx="8" cy="13" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11.5 10.5 20 2m-3 3 3 3m-6-1 2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    lab: `<path d="M8 3h8M9.5 3v6.5L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3l-5-9.5V3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.5 15h9" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    layers: `<path d="m12 3.5 9 5-9 5-9-5 9-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m4 13 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    school: `<path d="M3 21h18M4 9l8-4.5L20 9v12M5 9v9h14V9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 21v-6h6v6" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    library: `<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3A2 2 0 0 1 9 7v13a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 16.5zM21 6.5A1.5 1.5 0 0 0 19.5 5h-3A2 2 0 0 0 15 7v13a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 0 1.5-1.5zM12 5.5V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    cafe: `<path d="M4 7.5h13V13a5.5 5.5 0 0 1-11 0zM4 7.5V6M17 7.5h2.5a1.5 1.5 0 0 1 0 3H17M7 21h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    campus: `<path d="M3.5 20h17M6.5 20v-8.5L12 7l5.5 4.5V20M2.5 20L12 2.5 21.5 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 20v-4h5v4" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    bus: `<rect x="4" y="3.5" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 11h16M8 17.5v3M16 17.5v3M8 7.5h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    building: `<path d="M4 21V5a2 2 0 0 1 2-2h9v18M15 9h4a1 1 0 0 1 1 1v11M8 7h1.5M8 11h1.5M8 15h1.5M12 7h1.5M12 11h1.5M12 15h1.5M3 21h18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    calendar: `<rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    down: `<path d="M12 4v14m0 0 5.5-5.5M12 18 6.5 12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    up: `<path d="M12 20V6m0 0 5.5 5.5M12 6 6.5 11.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    scale: `<path d="M12 3v18M8 21h8M12 3l-4.5 7m4.5-7 4.5 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 14a3.5 3.5 0 0 0 7 0L7.5 10 4 14zM13 14a3.5 3.5 0 0 0 7 0L16.5 10 13 14z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,
    rocket: `<path d="M12 15c-3 0-5-1.5-6.5-4.5 2.5-.8 4.5-.5 6.5 1.5 2-2 4-2.3 6.5-1.5C17 13.5 15 15 12 15zM12 15v5M9 19.5 12 17l3 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10.5" r="1.6" fill="currentColor"/>`,
    window: `<rect x="3" y="3.5" width="18" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 8h18M9.5 8v12.5M6 11h1M14.5 8v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    phone: `<path d="M6 3.5h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.7 2 2 0 0 1 6 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    clipboard: `<rect x="5" y="4.5" width="14" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    paper: `<path d="M6 2.5h9l4 4v15H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.5 2.5v4.5H19M9 12h7M9 15.5h7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    doc: `<path d="M6 2.5h8l4 4V21H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 2.5v4.5h4M9 12h6M9 15.5h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    trophy: `<path d="M7 3.5h10v5a5 5 0 0 1-10 0zM7 5.5H4a1.5 1.5 0 0 0 0 3h3M17 5.5h3a1.5 1.5 0 0 1 0 3h-3M12 13.5v3M8 20.5h8M9.5 16.5h5l.7 4H8.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    star: `<path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    crown: `<path d="M3.5 7.5 7.5 11 12 4.5 16.5 11l4-3.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18zM7 18.5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    target: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>`,
    model: `<rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 7h3M7 10.5v3M17 10.5v3M13.5 17h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    scanner: `<path d="M3.5 12a8.5 8.5 0 1 0 17 0 8.5 8.5 0 0 0-17 0z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l2.5 2M12 3.5v2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    bug: `<circle cx="12" cy="13" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7V3.5M12 3.5h-2M12 3.5h2M6 10 3.5 8M18 10l2.5-2M6 16 3.5 18M18 16l2.5 2M8.5 7.5 7 5.5M15.5 7.5 17 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="12.5" r="0.9" fill="currentColor"/><circle cx="14" cy="12.5" r="0.9" fill="currentColor"/><path d="M12 14.5v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    decision: `<circle cx="5.5" cy="6" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18.5" cy="6" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="18.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 7.5 10.5 16.5M16.5 7.5 13.5 16.5" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
    perfect: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    compass: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 8.5-2 5-5 2 2-5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,
    clean: `<path d="M12 21a8 8 0 1 1 8-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m7 12 3 3 7-7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18.5" cy="16" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M18.5 13.6v-2M18.5 18.4v2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    folder: `<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h9A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
    history: `<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5M3.5 4v4.5H8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    file: `<path d="M6 2.5h8l4 4V21H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 2.5v4.5h4M9.5 11.5h5M9.5 15h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    sandbox: `<path d="M4 20.5h16M5.5 20.5 7.5 5a2 2 0 0 1 2-1.8h5A2 2 0 0 1 16.5 5l2 15.5M12 6.5v3M9 11.5h6M8.5 15.5h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    revision: `<path d="M4.5 5.5v4h4M19.5 18.5v-4h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.7 9A7 7 0 0 1 18.5 10M18.3 15A7 7 0 0 1 5.5 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    help: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.2 9.2a2.8 2.8 0 1 1 3.9 2.6c-.9.4-1.1 1-1.1 2M12 17h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    lineal: `<path d="M3 18.5 9 8l4.5 6 7.5-10.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="8" r="1.4" fill="currentColor"/><circle cx="13.5" cy="14" r="1.4" fill="currentColor"/>`,
    curve: `<path d="M3 17c4-12 14-12 18-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="21" cy="15" r="1.4" fill="currentColor"/>`,
    integer: `<path d="M7 3.5v17M4.5 6h5M14.5 3.5 17 20.5M20.5 8.5h-3M13 15.5h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    network: `<circle cx="12" cy="4.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="5.5" cy="18" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18.5" cy="18" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.6 5.9 7 15.8M13.4 5.9 17 15.8M7.7 18h8.6" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
    simulate: `<rect x="3.5" y="4" width="17" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 6.5v3M12.5 6.5v3M17 6.5v3M8 16v2.5M12.5 16v2.5M17 16v2.5M6 20.5h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    inventory: `<rect x="4" y="7.5" width="16" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 11.5h16M9 15h6M9.5 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    stochastic: `<path d="M3 18c2-8 4 4 6-4s3 3 5-3 4-6 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="21" cy="4" r="1.5" fill="currentColor"/>`,
    queue: `<path d="M3.5 17h17M8 17v-4a4 4 0 0 1 8 0v4M5.5 21h13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 13H5a1.5 1.5 0 0 1 0-3h3M16 13h3a1.5 1.5 0 0 0 0-3h-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    games: `<rect x="3" y="8" width="13" height="8.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 11h5v5.5a2 2 0 0 1-2 2h-3M5.5 12.5h2M6.5 11.5v2M13 12.5h.01M16 16.5h.01" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    series: `<path d="M3.5 20.5h17M5 17l4-5 3 2.5L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 4v3h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    chart: `<path d="M4 19.5h17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6.5 15.5v-6M11 15.5V6M15.5 15.5v-3.5M20 15.5V8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6.5" cy="9.5" r="1.5" fill="currentColor"/><circle cx="11" cy="6" r="1.5" fill="currentColor"/><circle cx="15.5" cy="12" r="1.5" fill="currentColor"/><circle cx="20" cy="8.5" r="1.5" fill="currentColor"/>`,
    analyst: `<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 20c.7-3.9 3.4-6 7-6s6.3 2.1 7 6M18.5 3.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    arrow: `<path d="M4 12h16m0 0-5.5-5.5M20 12l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    lock: `<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    info: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 7.5h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
  };

  function icon(name, size) {
    const path = ICONS[name] || ICONS.info;
    return `<svg viewBox="0 0 ${S} ${S}" width="${size || 20}" height="${size || 20}" aria-hidden="true" focusable="false">${path}</svg>`;
  }

  function mountIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      const size = el.getAttribute("data-size") || undefined;
      el.innerHTML = icon(name, size);
    });
  }

  /* ---------- Creación de nodos ---------- */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (k === "dataset") Object.assign(node.dataset, v);
        else if (v === false) {
          // atributos booleanos falsos no se escriben (solo aria-* se escribe como "false")
          if (k.startsWith("aria-")) node.setAttribute(k, "false");
        } else if (v === true) {
          node.setAttribute(k, k.startsWith("aria-") ? "true" : "");
        } else node.setAttribute(k, v);
      });
    }
    children.forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ---------- Toast ---------- */
  let toastCount = 0;

  function toast(msg, opts) {
    opts = opts || {};
    const region = document.getElementById("toast-region");
    if (!region) return;
    const t = el("div", { class: "toast" + (opts.type ? " t-" + opts.type : ""), role: "status" });
    if (opts.title) t.appendChild(el("span", { class: "toast-title", text: opts.title }));
    t.appendChild(el("span", { text: msg }));
    region.appendChild(t);
    const id = ++toastCount;
    setTimeout(() => {
      if (t.parentNode) {
        t.style.transition = "opacity 0.4s, transform 0.4s";
        t.style.opacity = "0";
        t.style.transform = "translateY(10px)";
        setTimeout(() => t.remove(), 400);
      }
    }, opts.duration || 3200);
  }

  /* ---------- Modal ---------- */
  let modalOpen = false;
  let lastFocus = null;

  function modal({ title, body, actions, onClose, className, maxWidth }) {
    const root = document.getElementById("modal-root");
    const backdrop = el("div", { class: "modal-backdrop" });
    const box = el("div", { class: "modal" + (className ? " " + className : ""), role: "dialog", "aria-modal": "true", "aria-label": title || "Diálogo" });
    if (maxWidth) box.style.maxWidth = maxWidth;

    const head = el("div", { class: "modal-head" });
    head.appendChild(el("h3", { text: title || "" }));
    const closeBtn = el("button", { class: "modal-close", "aria-label": "Cerrar", title: "Cerrar (Esc)" });
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => close());
    head.appendChild(closeBtn);
    box.appendChild(head);

    const bodyNode = el("div", { class: "modal-body" });
    if (typeof body === "string") bodyNode.innerHTML = body;
    else if (body) bodyNode.appendChild(body);
    box.appendChild(bodyNode);

    if (actions && actions.length) {
      const actRow = el("div", { class: "modal-actions" });
      actions.forEach((a) => {
        const b = el("button", { class: "btn " + (a.class || ""), text: a.label });
        b.addEventListener("click", () => {
          const r = a.onClick ? a.onClick() : undefined;
          if (r !== false) close();
        });
        actRow.appendChild(b);
      });
      box.appendChild(actRow);
    }

    function close() {
      if (!backdrop.parentNode) return;
      backdrop.remove();
      modalOpen = false;
      if (onClose) onClose();
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    }

    backdrop.appendChild(box);
    root.appendChild(backdrop);
    modalOpen = true;
    lastFocus = document.activeElement;
    const firstBtn = box.querySelector("button");
    if (firstBtn) firstBtn.focus();

    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    };
    document.addEventListener("keydown", onKey, true);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    return { close, backdrop, box };
  }

  function isModalOpen() { return modalOpen; }

  /* ---------- Feedback accesible ---------- */
  function feedbackEl(html, type) {
    const f = el("div", { class: "feedback fb-" + (type || "info"), role: "status", html });
    return f;
  }

  function announce(msg) {
    let live = document.getElementById("sr-live");
    if (!live) {
      live = el("div", { id: "sr-live", class: "sr-only", "aria-live": "polite" });
      document.body.appendChild(live);
    }
    live.textContent = "";
    requestAnimationFrame(() => { live.textContent = msg; });
  }

  /* ---------- Focus ---------- */
  function focusFirst(root) {
    const focusables = root.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
    if (focusables.length) focusables[0].focus();
  }

  OR.UI = {
    icon,
    mountIcons,
    el,
    toast,
    modal,
    isModalOpen,
    feedbackEl,
    announce,
    focusFirst
  };
})(window.OR = window.OR || {});
