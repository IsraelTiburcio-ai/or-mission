/* ============================================================
   OR MISSION · js/charts.js
   Gráficas SVG ligeras: barras comparativas y medidores.
   Sin librerías externas.
   ============================================================ */
(function (OR) {
  "use strict";

  const { el } = OR.UI;

  /** Comparativa ANTES vs PROPUESTA por métrica.
      items: [{label, before, after, unit, lowerBetter}] */
  function compareBars(items, opts) {
    opts = opts || {};
    const wrap = el("div", { class: "cmp-bars" });
    items.forEach((it) => {
      const max = Math.max(it.before, it.after, 1);
      const pct = (v) => Math.max(0, Math.min(100, (v / max) * 100));
      const row = el("div", { class: "cmp-row" });
      const label = el("div", { class: "cmp-label" });
      label.appendChild(el("span", { text: it.label }));
      label.appendChild(el("b", { text: `${it.before} → ${it.after} ${it.unit || ""}` }));
      const track = el("div", { class: "cmp-track" });
      const bBar = el("div", { class: "ct-bar" });
      bBar.appendChild(el("div", { class: "ct-fill c-before", style: "width:0%" }));
      const aBar = el("div", { class: "ct-bar" });
      aBar.appendChild(el("div", { class: "ct-fill c-after", style: "width:0%" }));
      track.appendChild(bBar);
      track.appendChild(aBar);
      row.appendChild(label);
      row.appendChild(track);
      wrap.appendChild(row);
      requestAnimationFrame(() => {
        setTimeout(() => {
          bBar.firstChild.style.width = pct(it.before) + "%";
          aBar.firstChild.style.width = pct(it.after) + "%";
        }, 60);
      });
    });
    return wrap;
  }

  /** Barra horizontal simple */
  function barRow(label, value, max, opts) {
    opts = opts || {};
    const row = el("div", { class: "cmp-row" });
    const lab = el("div", { class: "cmp-label" });
    lab.appendChild(el("span", { text: label }));
    lab.appendChild(el("b", { text: value }));
    const track = el("div", { class: "cmp-track", style: "grid-template-columns:1fr" });
    const bar = el("div", { class: "ct-bar" });
    bar.appendChild(el("div", { class: "ct-fill " + (opts.cls || "c-after"), style: "width:0%" }));
    track.appendChild(bar);
    row.appendChild(lab);
    row.appendChild(track);
    requestAnimationFrame(() => {
      setTimeout(() => { bar.firstChild.style.width = Math.max(0, Math.min(100, (value / (max || 1)) * 100)) + "%"; }, 60);
    });
    return row;
  }

  /** Medidor circular (gauge) */
  function gauge(value, max, label, opts) {
    opts = opts || {};
    const pct = Math.max(0, Math.min(1, value / (max || 1)));
    const C = 2 * Math.PI * 44;
    const svgNS = "http://www.w3.org/2000/svg";
    const wrap = el("div", { class: "gauge-wrap" });
    const box = el("div", { class: "gauge" });
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 110 110");
    svg.innerHTML = `
      <defs><linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#33d6ff"/><stop offset="100%" stop-color="#2fe8c0"/>
      </linearGradient></defs>
      <circle class="g-track" cx="55" cy="55" r="44" fill="none"/>
      <circle class="g-fill" cx="55" cy="55" r="44" fill="none"
        stroke-dasharray="${C}" stroke-dashoffset="${C}" data-offset="${C * (1 - pct)}"/>
    `;
    box.appendChild(svg);
    const center = el("div", { class: "g-center", text: String(value) });
    box.appendChild(center);
    const lab = el("div", { class: "gauge-label", text: label });
    wrap.appendChild(box);
    wrap.appendChild(lab);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fill = svg.querySelector(".g-fill");
        fill.style.strokeDashoffset = fill.getAttribute("data-offset");
      }, 60);
    });
    return wrap;
  }

  /** Ruta de operaciones: SVG de estaciones conectadas. */
  function routeSVG(phases, getState) {
    const svgNS = "http://www.w3.org/2000/svg";
    const cols = 4;
    const rows = Math.max(1, Math.ceil(phases.length / cols));
    const W = 940, H = 60 + rows * 118;
    const padX = 130, padY = 62;
    const pts = [];
    const order = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        order.push(r * cols + c);
      }
    }
    order.forEach((idx, i) => {
      if (i >= phases.length) return;
      const r = Math.floor(idx / cols);
      let c = idx % cols;
      if (r % 2 === 1) c = cols - 1 - c;
      pts[idx] = { x: padX + c * ((W - padX * 2) / (cols - 1)), y: padY + r * (H - padY * 2 - 10) };
    });

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Ruta de operaciones con ocho fases");

    // conexiones
    for (let i = 0; i < order.length - 1; i++) {
      const a = pts[order[i]], b = pts[order[i + 1]];
      const link = document.createElementNS(svgNS, "path");
      const midX = (a.x + b.x) / 2;
      const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
      link.setAttribute("d", d);
      link.setAttribute("class", "rb-link");
      svg.appendChild(link);
    }

    phases.forEach((ph, i) => {
      const st = getState(i);
      const p = pts[i];
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "rb-station " + st.cls);
      const node = document.createElementNS(svgNS, "circle");
      node.setAttribute("class", "rb-node");
      node.setAttribute("cx", p.x);
      node.setAttribute("cy", p.y);
      node.setAttribute("r", 24);
      node.setAttribute("fill", "rgba(13,27,51,0.9)");
      node.setAttribute("stroke", "currentColor");
      g.appendChild(node);
      const num = document.createElementNS(svgNS, "text");
      num.setAttribute("class", "rb-num");
      num.setAttribute("x", p.x);
      num.setAttribute("y", p.y);
      num.textContent = ph.num;
      g.appendChild(num);
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("class", "rb-label");
      label.setAttribute("x", p.x);
      label.setAttribute("y", p.y + 40);
      label.textContent = ph.title;
      g.appendChild(label);
      svg.appendChild(g);
    });
    return svg;
  }

  OR.Charts = { compareBars, barRow, gauge, routeSVG };
})(window.OR = window.OR || {});
