/**
 * TransitPulse Charts & Visualizations
 * Diurnal Heatmap, Radial Capacity Gauge, Simulation Comparison Bars
 */

const Charts = {
  renderDiurnalChart(containerId, heatmapData) {
    const container = document.getElementById(containerId);
    if (!container || !heatmapData || !heatmapData.length) return;

    let html = `<div class="diurnal-bars-container">`;
    const maxLoad = Math.max(...heatmapData.map(d => d.loadK));

    heatmapData.forEach(item => {
      const heightPct = Math.round((item.loadK / maxLoad) * 100);
      const isRush = item.tier === 'RUSH_CRITICAL';
      const isMod = item.tier === 'MODERATE';
      const barClass = isRush ? 'diurnal-bar rush' : (isMod ? 'diurnal-bar mod' : 'diurnal-bar');

      html += `
        <div class="diurnal-bar-col" title="${item.hour}:00 hrs — ${item.loadK}k Passengers, ${item.delayMin}m Delay (${item.tier})">
          <div class="${barClass}" style="height: ${heightPct}%;" data-hour="${item.hour}" data-load="${item.loadK}"></div>
          <span class="diurnal-hour-label">${item.hour}</span>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  renderCapacityGauge(svgId, current, max) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const pct = Math.min(100, Math.round((current / max) * 100));
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    let strokeColor = '#10b981'; // Green
    if (pct > 70) strokeColor = '#f59e0b'; // Amber
    if (pct > 90) strokeColor = '#ef4444'; // Red

    svg.innerHTML = `
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="#374151" stroke-width="12" />
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="12"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
              stroke-linecap="round" transform="rotate(-90 70 70)" style="transition: stroke-dashoffset 0.8s ease;" />
    `;
  }
};

window.Charts = Charts;
