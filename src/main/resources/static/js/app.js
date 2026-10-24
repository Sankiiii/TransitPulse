/**
 * TransitPulse Main Application Controller
 * Clean, minimalist, and high-utility commuter workflow
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentVehicleCountdown = 210; // 3m 30s
let activeCrowdSelection = 'Low';
let activeDelaySelection = 0;
let activeTheme = localStorage.getItem('transitpulse_theme') || 'dark';
let currentLoadedRoutes = [];
let currentActiveRouteIndex = 0;
let currentTripOrigin = 'SNDT University Juhu';
let currentTripDestination = 'Airport International (CSMIA T2)';
let isVoiceAnnouncementsEnabled = true;
let currentTrackingData = null;
let currentTrackingStops = [];
let activeStopIndex = 1;
let liveCurrentSpeed = 38.5;
let liveCurrentCapacity = 45;
const maxCapacity = 80;
let liveBattery = 88;
let liveClimate = 21.0;
let plannerDebounceTimer = null;

async function initApp() {
  setupTheme();
  setupNavigation();
  setupLiveClock();
  setupMap();
  setupPlannerControls();
  setupVoiceToggle();
  setupReportForm();
  setupConnectScreen();
  setupCodeModal();

  // Load initial datasets safely
  try {
    await checkSystemStatus();
    await loadRoutePlanner();
    await initConnectDashboard();
    syncCopilotWithUserSelection();
  } catch (e) {
    console.warn('Initial load notice:', e);
  }

  // Start continuous community simulators
  startCommunityReportSimulator();
}

// ==============================================================================
// THEME SWITCHER
// ==============================================================================
function setupTheme() {
  applyTheme(activeTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(activeTheme);
      localStorage.setItem('transitpulse_theme', activeTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    if (theme === 'light') {
      themeBtn.innerHTML = `<span>☀️</span> Light`;
    } else {
      themeBtn.innerHTML = `<span>🌙</span> Dark`;
    }
  }

  // Refresh map theme (Google Maps Street vs Dark Transit)
  if (window.transitMap && typeof window.transitMap.updateTheme === 'function') {
    window.transitMap.updateTheme(theme);
  } else if (window.MumbaiTransitMap) {
    const mapContainer = document.getElementById('mumbaiTransitMap');
    if (mapContainer) {
      window.transitMap = new window.MumbaiTransitMap('mumbaiTransitMap');
    }
  }
}

// ==============================================================================
// NAVIGATION TABS
// ==============================================================================
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-item button');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetScreen = btn.getAttribute('data-screen');
      switchScreen(targetScreen);
    });
  });

  const backBtn = document.getElementById('backToPlannerBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      switchScreen('planner');
    });
  }

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    switchScreen(hash);
  }
}

function switchScreen(screenId) {
  if (screenId === 'tracking') {
    screenId = 'planner';
  }
  document.querySelectorAll('.nav-item button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-screen') === screenId);
  });

  document.querySelectorAll('.screen-content').forEach(s => {
    s.classList.toggle('active', s.id === `screen-${screenId}`);
  });

  if (screenId === 'steps') {
    renderDetailedStepsTab(currentActiveRouteIndex);
  }

  if (screenId === 'connect') {
    syncCopilotWithUserSelection();
  }

  if (screenId === 'planner' && window.transitMap && typeof window.transitMap.invalidateSize === 'function') {
    window.transitMap.invalidateSize();
  }

  window.location.hash = screenId;
}

// --- Top Bar Live Clock ---
function setupLiveClock() {
  const clockEl = document.getElementById('liveClock');
  function update() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    }
  }
  update();
  setInterval(update, 1000);
}

// --- System Status ---
async function checkSystemStatus() {
  try {
    const status = await API.getStatus();
    const modeBadge = document.getElementById('dataSourceBadge');
    if (modeBadge) {
      const mode = status.configuredMode || 'json';
      if (mode.toLowerCase() === 'mysql') {
        modeBadge.className = 'data-source-badge mysql-mode';
        modeBadge.innerHTML = `<span class="pulse-dot" style="background:#3b82f6;box-shadow:0 0 8px #3b82f6;"></span> MySQL Workbench DB`;
      } else {
        modeBadge.className = 'data-source-badge';
        modeBadge.innerHTML = `<span class="pulse-dot"></span> Local Storage Mode`;
      }
    }
  } catch (e) {
    // Silent fallback
  }
}

// --- Transit Map ---
function setupMap() {
  if (window.MumbaiTransitMap) {
    window.transitMap = new window.MumbaiTransitMap('mumbaiTransitMap');
  }
}

// ==============================================================================
// SCREEN 1: ROUTE PLANNER (DYNAMIC AUTOCOMPLETE & COLLISION-SAFE)
// ==============================================================================
function setupPlannerControls() {
  const originSelect = document.getElementById('plannerOriginSelect') || document.getElementById('plannerOriginInput');
  const destSelect = document.getElementById('plannerDestSelect') || document.getElementById('plannerDestInput');
  const modeSelect = document.getElementById('plannerModeSelect');
  const swapBtn = document.getElementById('swapRouteBtn');

  function onLocationChanged() {
    if (validateRouteInputs()) {
      loadRoutePlanner();
    }
  }

  if (originSelect) {
    originSelect.addEventListener('change', onLocationChanged);
  }

  if (destSelect) {
    destSelect.addEventListener('change', onLocationChanged);
  }

  if (swapBtn && originSelect && destSelect) {
    swapBtn.addEventListener('click', () => {
      const temp = originSelect.value;
      originSelect.value = destSelect.value;
      destSelect.value = temp;

      swapBtn.style.transform = 'rotate(180deg) scale(1.15)';
      setTimeout(() => { swapBtn.style.transform = ''; }, 300);

      if (validateRouteInputs()) {
        loadRoutePlanner();
      }
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      if (validateRouteInputs()) {
        loadRoutePlanner();
      }
    });
  }

  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', async () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const pref = pill.getAttribute('data-pref');
      if (validateRouteInputs()) {
        await loadRoutePlanner(pref);
      }
    });
  });
}

function validateRouteInputs() {
  const originSelect = document.getElementById('plannerOriginSelect') || document.getElementById('plannerOriginInput');
  const destSelect = document.getElementById('plannerDestSelect') || document.getElementById('plannerDestInput');
  const alertEl = document.getElementById('routeValidationAlert');

  const origin = (originSelect ? originSelect.value : '').trim();
  const dest = (destSelect ? destSelect.value : '').trim();

  // 1. Empty Check
  if (!origin || !dest) {
    if (alertEl) {
      alertEl.className = 'route-validation-alert warning';
      alertEl.innerHTML = `<span>⚠️</span> <span>Please choose both departure origin and destination to plan your journey.</span>`;
      alertEl.classList.remove('hidden');
    }
    return false;
  }

  // 2. Exact Collision Check (Same origin and destination)
  if (origin.toLowerCase() === dest.toLowerCase()) {
    if (alertEl) {
      alertEl.className = 'route-validation-alert collision-error';
      alertEl.innerHTML = `<span>🛑</span> <span><strong>Station Collision:</strong> Origin and Destination cannot be the same (<em>${escapeHtml(origin)}</em>). Please choose two different stations.</span>`;
      alertEl.classList.remove('hidden');
    }
    if (originSelect) originSelect.style.borderColor = 'var(--rose-main)';
    if (destSelect) destSelect.style.borderColor = 'var(--rose-main)';

    const container = document.getElementById('routesListContainer');
    if (container) {
      container.innerHTML = `
        <div style="padding:2.5rem 1.5rem;text-align:center;background:var(--bg-card);border:1.5px solid var(--rose-border);border-radius:14px;box-shadow:0 8px 24px rgba(239,68,68,0.12);">
          <span style="font-size:2.5rem;">⚠️</span>
          <h3 style="margin-top:0.75rem;font-size:1.15rem;font-weight:800;color:var(--rose-main);">Station Collision Detected</h3>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-top:0.35rem;max-width:440px;margin-left:auto;margin-right:auto;">
            Departure and destination are both set to <strong>"${escapeHtml(origin)}"</strong>.<br>
            Please select distinct stations from the dropdowns, or click the <strong>⇄ Swap button</strong>.
          </p>
        </div>
      `;
    }
    if (window.transitMap) {
      window.transitMap.renderJourney(origin, dest, null);
    }
    return false;
  }

  // Valid
  if (alertEl) alertEl.classList.add('hidden');
  if (originSelect) originSelect.style.borderColor = '';
  if (destSelect) destSelect.style.borderColor = '';
  return true;
}

async function loadRoutePlanner(preference = '') {
  const originSelect = document.getElementById('plannerOriginSelect') || document.getElementById('plannerOriginInput');
  const destSelect = document.getElementById('plannerDestSelect') || document.getElementById('plannerDestInput');
  const modeSelect = document.getElementById('plannerModeSelect');

  const origin = (originSelect ? originSelect.value : '').trim() || 'SNDT University Juhu';
  const destination = (destSelect ? destSelect.value : '').trim() || 'Airport International (CSMIA T2)';
  const mode = modeSelect ? modeSelect.value : 'ALL';

  if (!validateRouteInputs()) return;

  try {
    const params = { origin, destination };
    if (preference) params.preference = preference;
    if (mode && mode !== 'ALL') params.mode = mode;

    const routes = await API.getRoutes(params);
    currentLoadedRoutes = routes || [];
    currentTripOrigin = origin;
    currentTripDestination = destination;
    currentActiveRouteIndex = 0;

    renderRouteCards(routes, origin, destination);
    renderDetailedStepsTab(0);
    syncCopilotWithUserSelection();
  } catch (e) {
    console.warn('Routes load notice:', e.message);
    const container = document.getElementById('routesListContainer');
    if (container && e.status === 400) {
      container.innerHTML = `
        <div style="padding:2rem;text-align:center;background:var(--bg-card);border:1px solid var(--rose-border);border-radius:12px;">
          <span style="font-size:2rem;">🛑</span>
          <h3 style="margin-top:0.5rem;font-size:1rem;color:var(--rose-main);">Validation Error</h3>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">${escapeHtml(e.message)}</p>
        </div>
      `;
    }
  }
}

function getLiveUpcomingDeparture(departsInMins, backendClock) {
  const wait = Math.max(1, parseInt(departsInMins) || 4);
  const now = new Date();

  // If backend provided a clock format (HH:mm), verify if it is in the future
  if (backendClock && typeof backendClock === 'string' && backendClock.includes(':')) {
    const parts = backendClock.split(':');
    const bH = parseInt(parts[0], 10);
    const bM = parseInt(parts[1], 10);
    if (!isNaN(bH) && !isNaN(bM)) {
      const bDate = new Date();
      bDate.setHours(bH, bM, 0, 0);
      const diffMins = Math.round((bDate.getTime() - now.getTime()) / 60000);
      // If departure is in the future (1 to 180 mins from now), use verified real-time departure
      if (diffMins >= 1 && diffMins <= 180) {
        return {
          clock: backendClock,
          waitMins: diffMins
        };
      }
    }
  }

  // Otherwise calculate strictly upcoming relative to client's current live time
  const depTime = new Date(now.getTime() + wait * 60000);
  const hours = String(depTime.getHours()).padStart(2, '0');
  const minutes = String(depTime.getMinutes()).padStart(2, '0');
  return {
    clock: `${hours}:${minutes}`,
    waitMins: wait
  };
}

function renderRouteCards(routes, origin, destination) {
  const container = document.getElementById('routesListContainer');
  if (!container) return;

  container.innerHTML = '';

  if (origin === destination) {
    container.innerHTML = `
      <div style="padding:2rem;text-align:center;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:12px;">
        <span style="font-size:2rem;">📍</span>
        <h3 style="margin-top:0.5rem;font-size:1rem;color:var(--text-main);">Origin and Destination are the same</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.25rem;">Please select two different Mumbai stations in the dropdowns to plan your commute.</p>
      </div>
    `;
    if (window.transitMap) {
      window.transitMap.renderJourney(origin, destination, null);
    }
    return;
  }

  if (!routes || routes.length === 0) {
    container.innerHTML = `
      <div style="padding:2rem;text-align:center;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:12px;">
        <span style="font-size:2rem;">🔍</span>
        <h3 style="margin-top:0.5rem;font-size:1rem;color:var(--text-main);">No direct routes found</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.25rem;">Try selecting "All Transit Modes" to view multi-modal combos across Mumbai.</p>
      </div>
    `;
    return;
  }

  // Render first route on map automatically
  if (window.transitMap) {
    window.transitMap.renderJourney(origin, destination, routes[0]);
  }

  routes.forEach((r, idx) => {
    const card = document.createElement('div');
    const isFirst = idx === 0;
    card.className = `route-card ${r.isRecommended ? 'recommended' : ''} ${isFirst ? 'selected-route' : ''}`;
    card.setAttribute('data-route-id', r.routeId);

    // Build Chalo-Inspired Multi-Modal Step Flow Pills (Clean Wrapping with No Orphan Arrows)
    let chaloFlowHtml = '';
    const destShort = destination.split(' ')[0];

    function buildLegGroupHtml(items) {
      return items.map((item, i) => {
        const isLast = i === items.length - 1;
        const arrow = isLast ? '' : '<span class="chalo-flow-arrow">➔</span>';
        return `<div class="chalo-leg-group"><div class="chalo-flow-pill ${item.pillClass}">${item.icon} ${escapeHtml(item.text)}</div>${arrow}</div>`;
      }).join('');
    }

    if (r.legs && Array.isArray(r.legs) && r.legs.length > 0) {
      const items = r.legs.map(leg => {
        let icon = '🚶';
        let pillClass = 'walk';
        const mode = (leg.mode || '').toLowerCase();
        if (mode.includes('auto') || mode.includes('cab') || mode.includes('taxi')) {
          icon = '🛺';
          pillClass = 'auto';
        } else if (mode.includes('bus')) {
          icon = '🚌';
          pillClass = 'bus';
        } else if (mode.includes('train') || mode.includes('local')) {
          icon = '🚆';
          pillClass = 'train';
        } else if (mode.includes('metro')) {
          icon = '🚇';
          pillClass = 'metro';
        }
        return {
          icon,
          pillClass,
          text: `${leg.text || ''} ${leg.time ? `(${leg.time})` : ''}`.trim()
        };
      });

      chaloFlowHtml = `<div class="chalo-flow-row">${buildLegGroupHtml(items)}</div>`;
    } else if (r.transportType === 'BUS') {
      const transitTime = Math.max(12, r.durationMins - 6);
      const items = [
        { icon: '🛺', pillClass: 'auto', text: 'Auto (4m)' },
        { icon: '🚌', pillClass: 'bus', text: `Take ${r.routeNumber.split(' ')[0] + ' ' + (r.routeNumber.split(' ')[1] || '')} (${transitTime}m)` },
        { icon: '🚶', pillClass: 'walk', text: `Walk to ${destShort} (2m)` }
      ];
      chaloFlowHtml = `<div class="chalo-flow-row">${buildLegGroupHtml(items)}</div>`;
    } else if (r.transportType === 'METRO') {
      const transitTime = Math.max(14, r.durationMins - 7);
      const items = [
        { icon: '🛺', pillClass: 'auto', text: 'Auto to Metro (5m)' },
        { icon: '🚇', pillClass: 'metro', text: `Metro Line 1 (${transitTime}m)` },
        { icon: '🚶', pillClass: 'walk', text: `Walk to ${destShort} (2m)` }
      ];
      chaloFlowHtml = `<div class="chalo-flow-row">${buildLegGroupHtml(items)}</div>`;
    } else if (r.transportType === 'LOCAL') {
      const transitTime = Math.max(16, r.durationMins - 8);
      const items = [
        { icon: '🚶', pillClass: 'walk', text: 'Walk to Station (3m)' },
        { icon: '🚆', pillClass: 'train', text: `Suburban Fast (${transitTime}m)` },
        { icon: '🛺', pillClass: 'auto', text: `Auto to ${destShort} (5m)` }
      ];
      chaloFlowHtml = `<div class="chalo-flow-row">${buildLegGroupHtml(items)}</div>`;
    }

    // Ensure departure time is strictly real-time upcoming
    const depInfo = getLiveUpcomingDeparture(r.departsInMins, r.departureClock);
    r.departureClock = depInfo.clock;
    r.departsInMins = depInfo.waitMins;

    // Clean, compact route card markup without nested steps clutter
    card.innerHTML = `
      <div class="route-card-header">
        <div>
          <div class="route-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span>${r.routeNumber}</span>
          </div>
          <div class="route-operator">${r.operator} • ${r.transferText || 'Direct'}</div>
        </div>
        <div style="text-align:right;">
          <div class="route-duration" style="font-size:1.4rem;">${r.durationMins} mins</div>
          <div class="route-fare" style="font-size:1.1rem;font-weight:700;color:var(--emerald-main);">${r.fareFormatted}</div>
        </div>
      </div>

      <!-- Step-by-Step Chalo Multi-Modal Flow -->
      ${chaloFlowHtml}

      <!-- Boarding & Scheduled Departure Row (Chalo Style) -->
      <div class="route-boarding-row">
        <span><strong>Boarding:</strong> ${r.boardingStop || r.platform || 'Terminal Bay 1'}</span>
        <span><strong>Scheduled:</strong> For ${depInfo.clock} (${depInfo.waitMins}m away)</span>
      </div>
      ${r.waypointName ? `<div style="font-size:0.75rem;color:var(--text-muted);padding:0.25rem 0.2rem 0.1rem;">📍 <strong>Via:</strong> ${r.waypointName}</div>` : ''}

      <!-- Footer: Timing Details + Actions -->
      <div class="route-footer-details" style="border-top:none;padding-top:0.35rem;">
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <span style="font-size:0.78rem;color:var(--text-muted);font-weight:600;">🌿 ${r.co2SavedKg} kg CO₂ saved • ${r.statusText || 'On Time'}</span>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <button class="btn btn-outline select-map-btn" style="padding:0.35rem 0.75rem;font-size:0.78rem;">
            👁️ Map
          </button>
          <button class="btn btn-primary open-steps-tab-btn" style="padding:0.35rem 0.85rem;font-size:0.78rem;">
            🧭 In-Detail Steps →
          </button>
        </div>
      </div>
    `;

    // Click anywhere on card to select route, update map, and pre-render in Journey Steps tab
    card.addEventListener('click', () => {
      document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected-route'));
      card.classList.add('selected-route');
      currentActiveRouteIndex = idx;
      renderDetailedStepsTab(idx);

      if (window.transitMap) {
        window.transitMap.renderJourney(origin, destination, r);
      }
      syncCopilotWithUserSelection();
    });

    // Map button handler
    const mapBtn = card.querySelector('.select-map-btn');
    if (mapBtn) {
      mapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected-route'));
        card.classList.add('selected-route');
        currentActiveRouteIndex = idx;
        renderDetailedStepsTab(idx);
        if (window.transitMap) {
          window.transitMap.renderJourney(origin, destination, r);
        }
        syncCopilotWithUserSelection();
      });
    }

    // "In-Detail Steps →" button handler: navigate directly to dedicated Journey Steps tab
    const stepsBtn = card.querySelector('.open-steps-tab-btn');
    if (stepsBtn) {
      stepsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected-route'));
        card.classList.add('selected-route');
        currentActiveRouteIndex = idx;
        renderDetailedStepsTab(idx);
        if (window.transitMap) {
          window.transitMap.renderJourney(origin, destination, r);
        }
        syncCopilotWithUserSelection();
        switchScreen('steps');
      });
    }

    container.appendChild(card);
  });
}

/**
 * Dedicated In-Detail Journey Steps Screen Renderer
 * Renders full un-congested turn-by-turn directions with alternative route selector pills
 */
function renderDetailedStepsTab(routeIdx = 0) {
  const stepsContainer = document.getElementById('detailedStepsListContainer');
  const routePillsContainer = document.getElementById('stepsRouteSelectorRow');
  const activeBadge = document.getElementById('stepsActiveRouteBadge');
  const tripTitle = document.getElementById('stepsActiveTripTitle');
  const tripSubtitle = document.getElementById('stepsActiveTripSubtitle');
  const countBadge = document.getElementById('stepsCountBadge');
  const proTipContainer = document.getElementById('stepsProTipContainer');

  if (!stepsContainer) return;

  if (!currentLoadedRoutes || currentLoadedRoutes.length === 0) {
    if (tripTitle) tripTitle.textContent = `${currentTripOrigin} ➔ ${currentTripDestination}`;
    if (tripSubtitle) tripSubtitle.textContent = 'Please plan a route first to view in-detail steps.';
    if (activeBadge) activeBadge.textContent = 'No Active Route';
    if (countBadge) countBadge.textContent = '0 Steps';
    if (routePillsContainer) routePillsContainer.innerHTML = '';
    stepsContainer.innerHTML = `
      <div style="padding:2.5rem;text-align:center;background:var(--bg-primary);border:1px dashed var(--border-subtle);border-radius:12px;">
        <span style="font-size:2.2rem;">🧭</span>
        <h4 style="margin-top:0.75rem;font-size:1.05rem;color:var(--text-main);">No Journey Steps Available</h4>
        <p style="font-size:0.84rem;color:var(--text-muted);margin-top:0.35rem;max-width:440px;margin-left:auto;margin-right:auto;">
          Select your origin and destination in the Route Planner, then click "In-Detail Steps →" to view turn-by-turn commuter directions.
        </p>
      </div>
    `;
    if (proTipContainer) proTipContainer.innerHTML = '';
    return;
  }

  // Validate index
  if (routeIdx < 0 || routeIdx >= currentLoadedRoutes.length) {
    routeIdx = 0;
  }
  currentActiveRouteIndex = routeIdx;
  const route = currentLoadedRoutes[routeIdx];

  // 1. Header Overview
  if (activeBadge) {
    activeBadge.textContent = `${route.routeNumber} (${route.operator})`;
  }
  if (tripTitle) {
    tripTitle.textContent = `${currentTripOrigin} ➔ ${currentTripDestination}`;
  }
  if (tripSubtitle) {
    tripSubtitle.textContent = `${route.operator} • ${route.durationMins} mins • ${route.fareFormatted} Fare • ${route.transferText || 'Direct Route'}`;
  }

  // 2. Route Alternative Selector Pills
  if (routePillsContainer) {
    routePillsContainer.innerHTML = currentLoadedRoutes.map((r, i) => {
      const isActive = i === routeIdx;
      let modeIcon = '🚌';
      if (r.transportType === 'LOCAL') modeIcon = '🚆';
      else if (r.transportType === 'METRO') modeIcon = '🚇';
      return `
        <button class="steps-route-pill ${isActive ? 'active' : ''}" data-route-idx="${i}">
          <span>${modeIcon}</span>
          <span>Route ${i + 1}: ${r.routeNumber}</span>
          <span style="font-size:0.75rem;opacity:0.85;">(${r.durationMins}m, ${r.fareFormatted})</span>
        </button>
      `;
    }).join('');

    routePillsContainer.querySelectorAll('.steps-route-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const idx = parseInt(pill.getAttribute('data-route-idx'), 10);
        renderDetailedStepsTab(idx);
        // Sync Route Planner cards and Map
        document.querySelectorAll('.route-card').forEach((c, ci) => {
          c.classList.toggle('selected-route', ci === idx);
        });
        if (window.transitMap && currentLoadedRoutes[idx]) {
          window.transitMap.renderJourney(currentTripOrigin, currentTripDestination, currentLoadedRoutes[idx]);
        }
        syncCopilotWithUserSelection();
      });
    });
  }

  // 3. Render Detailed Steps Timeline
  const steps = route.detailedSteps || [];
  if (countBadge) {
    countBadge.textContent = `${steps.length} Steps`;
  }

  if (steps.length === 0) {
    stepsContainer.innerHTML = `
      <div style="padding:2rem;text-align:center;background:var(--bg-primary);border-radius:8px;">
        <p style="color:var(--text-muted);font-size:0.88rem;">No step-by-step directions found for this option.</p>
      </div>
    `;
  } else {
    stepsContainer.innerHTML = steps.map((st, i) => {
      let icon = '🚶';
      const m = (st.mode || '').toLowerCase();
      if (m.includes('auto') || m.includes('cab') || m.includes('taxi')) icon = '🛺';
      else if (m.includes('bus')) icon = '🚌';
      else if (m.includes('train')) icon = '🚆';
      else if (m.includes('metro')) icon = '🚇';

      return `
        <div class="detailed-step-card">
          <div class="detailed-step-badge">
            <span>${icon}</span>
          </div>
          <div class="detailed-step-content-card">
            <div class="detailed-step-top-row">
              <div class="detailed-step-title">
                <span style="color:var(--blue-primary);margin-right:0.35rem;">Step ${st.stepNum || (i + 1)}:</span>
                ${st.title}
              </div>
              <div class="detailed-step-meta-pills">
                ${st.time ? `<span class="badge badge-gray" style="font-size:0.75rem;">⏱️ ${st.time}</span>` : ''}
                ${st.cost ? `<span class="badge badge-emerald" style="font-size:0.75rem;">🪙 ${st.cost}</span>` : ''}
                ${st.mode ? `<span class="badge badge-blue" style="font-size:0.75rem;">${st.mode}</span>` : ''}
              </div>
            </div>
            <div class="detailed-step-instruction">
              ${st.instruction}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Trip Conclusion & Commuter Verdict (After all individual steps)
  const conclusionContainer = document.getElementById('stepsConclusionContainer');
  if (conclusionContainer && route) {
    let verdictTag = 'Verified Mumbai Transit';
    let verdictClass = 'badge-emerald';
    let verdictHeadline = `Reliable travel flow taking ${route.durationMins} mins.`;

    if (route.isRecommended) {
      verdictTag = '⭐ Best Recommendation';
      verdictClass = 'badge-blue';
      verdictHeadline = `Optimal balance of speed (${route.durationMins}m), lowest crowd levels, and economical fare (${route.fareFormatted}).`;
    } else if (route.transportType === 'METRO') {
      verdictTag = '⚡ Rapid Guideway';
      verdictClass = 'badge-cyan';
      verdictHeadline = `Fastest connection completely isolated from street road traffic with zero delays.`;
    } else if (route.transportType === 'LOCAL') {
      verdictTag = '💰 Pocket Friendly';
      verdictClass = 'badge-emerald';
      verdictHeadline = `Most economical option at just ${route.fareFormatted}, covering long Mumbai suburban distances swiftly.`;
    } else if (route.transportType === 'BUS') {
      verdictTag = '🚌 Direct AC Ride';
      verdictClass = 'badge-blue';
      verdictHeadline = `Direct air-conditioned bus ride with open seating and easy Chalo Card payment.`;
    }

    const transfersText = (route.transfers === 0 || !route.transfers) ? 'Direct (0 transfers)' : `${route.transfers} transfer at ${route.waypointName || 'Interchange'}`;
    const crowdSummary = route.crowdText || 'Normal Capacity';
    const stepsDepInfo = getLiveUpcomingDeparture(route.departsInMins, route.departureClock);
    route.departureClock = stepsDepInfo.clock;
    route.departsInMins = stepsDepInfo.waitMins;

    conclusionContainer.innerHTML = `
      <div class="conclusion-header">
        <div style="display:flex;align-items:center;gap:0.55rem;">
          <span style="font-size:1.35rem;">📋</span>
          <div>
            <h4 style="margin:0;font-size:0.96rem;font-weight:800;color:var(--text-main);">Trip Conclusion & Commuter Summary</h4>
            <p style="margin:0.15rem 0 0 0;font-size:0.75rem;color:var(--text-muted);">Key takeaways, timing recap & verified advice for Route ${routeIdx + 1}</p>
          </div>
        </div>
        <span class="badge ${verdictClass}">${verdictTag}</span>
      </div>

      <div class="conclusion-metrics-grid">
        <div class="conclusion-metric">
          <span class="metric-label">Total Duration</span>
          <span class="metric-val">⏱️ ${route.durationMins} mins</span>
        </div>
        <div class="conclusion-metric">
          <span class="metric-label">Total Fare</span>
          <span class="metric-val" style="color:var(--emerald-main);">🪙 ${route.fareFormatted}</span>
        </div>
        <div class="conclusion-metric">
          <span class="metric-label">Interchanges</span>
          <span class="metric-val">🔄 ${transfersText}</span>
        </div>
        <div class="conclusion-metric">
          <span class="metric-label">Crowd Status</span>
          <span class="metric-val">👥 ${crowdSummary}</span>
        </div>
      </div>

      <div class="conclusion-takeaway">
        <strong>Commuter Verdict:</strong> ${verdictHeadline} Board at <strong>${escapeHtml(route.boardingStop || 'Terminal Concourse')}</strong> (scheduled for <strong>${stepsDepInfo.clock}</strong> • in ${stepsDepInfo.waitMins}m) towards <strong>${escapeHtml(currentTripDestination)}</strong>.${route.co2SavedKg ? ` Choosing public transit saves <strong>${route.co2SavedKg} kg CO₂</strong> compared to a private taxi.` : ''}
      </div>
    `;
    conclusionContainer.style.display = 'block';
  } else if (conclusionContainer) {
    conclusionContainer.style.display = 'none';
  }

  // 5. Commuter Pro-Tip
  if (proTipContainer) {
    if (route.proTip) {
      proTipContainer.style.display = 'flex';
      proTipContainer.innerHTML = `
        <span style="font-size:1.35rem;line-height:1;">💡</span>
        <div>
          <div style="font-weight:700;font-size:0.85rem;color:var(--text-main);margin-bottom:0.25rem;">Smart Commuter Tip:</div>
          <div style="font-size:0.82rem;color:var(--text-muted);line-height:1.5;">${route.proTip}</div>
        </div>
      `;
    } else {
      proTipContainer.style.display = 'none';
      proTipContainer.innerHTML = '';
    }
  }
}

window.trackSpecificVehicle = function(routeId) {
  switchScreen('planner');
};

// ==============================================================================
// SCREEN 2: LIVE VEHICLE TRACKING
// ==============================================================================
function setupTrackingControls() {
  const vehSelect = document.getElementById('trackingVehicleSelect');
  if (vehSelect) {
    vehSelect.addEventListener('change', () => {
      const vehId = parseInt(vehSelect.value);
      loadLiveTracking(vehId);
    });
  }
}

async function loadLiveTracking(vehicleId = 4092) {
  try {
    const data = await API.getTracking(vehicleId);
    if (!data || !data.vehicle) return;

    const v = data.vehicle;

    // Subtitle
    const subTitle = document.getElementById('trackingRouteSubtitle');
    if (subTitle) {
      subTitle.textContent = `${v.operatorName} • ${v.model} • ${v.corridorStatus}`;
    }

    // Capacity Gauge
    Charts.renderCapacityGauge('capacityRadialSvg', v.capacityCurrent, v.capacityMax);
    const capPctEl = document.getElementById('capacityPctText');
    if (capPctEl) capPctEl.textContent = `${v.occupancyPct}%`;

    const capLabelEl = document.getElementById('capacityDetailLabel');
    if (capLabelEl) capLabelEl.textContent = `${v.capacityCurrent} / ${v.capacityMax} Commuters (${v.occupancyLabel})`;

    // Speed & Battery
    const speedEl = document.getElementById('liveSpeedKmh');
    if (speedEl) speedEl.textContent = `${v.currentSpeedKmh} km/h`;

    const climateEl = document.getElementById('liveClimateCelsius');
    if (climateEl) climateEl.textContent = `${v.climateCelsius}°C AC`;

    const batteryEl = document.getElementById('liveBatteryPct');
    if (batteryEl) batteryEl.textContent = `${v.batteryStatePct}%`;

    // Next Stop
    const nextStopTitle = document.getElementById('nextStationTitle');
    if (nextStopTitle && data.activeStopName) {
      nextStopTitle.textContent = data.activeStopName;
    }

    // Timeline
    renderTimeline(data.stopsTimeline);

  } catch (e) {
    console.warn('Tracking load notice:', e);
  }
}

function renderTimeline(timelineStops) {
  const container = document.getElementById('routeTimelineContainer');
  if (!container || !timelineStops) return;

  container.innerHTML = '';
  timelineStops.forEach((st, idx) => {
    const isDeparted = st.status === 'DEPARTED';
    const isActive = st.isNext;

    const item = document.createElement('div');
    item.className = `timeline-item ${isDeparted ? 'departed' : (isActive ? 'active' : '')}`;

    let badgeClass = 'badge-gray';
    if (isDeparted) badgeClass = 'badge-emerald';
    if (isActive) badgeClass = 'badge-blue';

    item.innerHTML = `
      <div class="timeline-node">
        ${isDeparted ? '✓' : (isActive ? '●' : (idx + 1))}
      </div>
      <div class="timeline-content">
        <div>
          <div class="stop-title">${st.stopName}</div>
          <div class="stop-subtext">${st.subtext || ''}</div>
        </div>
        <div style="text-align:right;">
          <span class="badge ${badgeClass}">${st.statusTag || st.actualTime}</span>
        </div>
      </div>
    `;

    container.appendChild(item);
  });
}

// ==============================================================================
// VOICE AUDIO ANNOUNCEMENT TOGGLE
// ==============================================================================
function setupVoiceToggle() {
  const voiceBtn = document.getElementById('voiceAnnouncementBtn');
  const voiceIcon = document.getElementById('voiceIcon');
  const voiceLabel = document.getElementById('voiceLabel');

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      isVoiceAnnouncementsEnabled = !isVoiceAnnouncementsEnabled;
      if (voiceIcon) voiceIcon.textContent = isVoiceAnnouncementsEnabled ? '🔊' : '🔇';
      if (voiceLabel) voiceLabel.textContent = isVoiceAnnouncementsEnabled ? 'Voice Audio: ON' : 'Voice Audio: OFF';
      showToast(isVoiceAnnouncementsEnabled ? '🔊 Station voice announcements enabled' : '🔇 Station voice announcements muted');
    });
  }
}

function playStationAnnouncement(stopName) {
  if (!isVoiceAnnouncementsEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const announcement = `Now arriving at ${stopName}. Please mind the gap between the platform and the train.`;
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis notice:', e);
  }
}

// ==============================================================================
// LIVE TELEMETRY SIMULATION ENGINE (DYNAMIC COUNTDOWN & DYNAMIC STOPS)
// ==============================================================================
function startLiveTelemetryEngine() {
  const clockEl = document.getElementById('arrivalCountdownClock');
  const speedEl = document.getElementById('liveSpeedKmh');
  const climateEl = document.getElementById('liveClimateCelsius');
  const batteryEl = document.getElementById('liveBatteryPct');
  const capPctEl = document.getElementById('capacityPctText');
  const capLabelEl = document.getElementById('capacityDetailLabel');
  const nextStopTitle = document.getElementById('nextStationTitle');

  let tickCount = 0;

  setInterval(() => {
    tickCount++;

    // 1. Countdown logic
    if (currentVehicleCountdown > 0) {
      currentVehicleCountdown--;
    } else {
      // Station Arrival Event!
      triggerStationArrival();
      currentVehicleCountdown = 210; // reset to 3m 30s
    }

    // Format & display countdown clock
    if (clockEl) {
      const mins = Math.floor(currentVehicleCountdown / 60);
      const secs = currentVehicleCountdown % 60;
      clockEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 2. Realistic Telemetry Jitter (every 2 seconds)
    if (tickCount % 2 === 0) {
      // Speed fluctuations: smooth acceleration and deceleration
      if (currentVehicleCountdown > 15) {
        liveCurrentSpeed = Math.max(28.0, Math.min(48.0, liveCurrentSpeed + (Math.random() * 3.0 - 1.5)));
      } else {
        // Slowing down for approaching station
        liveCurrentSpeed = Math.max(4.0, liveCurrentSpeed * 0.88);
      }
      if (speedEl) speedEl.textContent = `${liveCurrentSpeed.toFixed(1)} km/h`;

      // Climate jitter
      liveClimate = 20.8 + (Math.random() * 0.4);
      if (climateEl) climateEl.textContent = `${liveClimate.toFixed(1)}°C AC`;

      // Battery realistic drainage / regen
      if (tickCount % 30 === 0 && liveBattery > 20) {
        liveBattery = Math.max(15, liveBattery - 1);
        if (batteryEl) batteryEl.textContent = `${liveBattery}%`;
      }
    }
  }, 1000);

  function triggerStationArrival() {
    if (!currentTrackingStops || currentTrackingStops.length === 0) return;

    const arrivedStop = currentTrackingStops[activeStopIndex] || currentTrackingStops[0];
    const stopName = arrivedStop.stopName || 'Station';

    // Announce Station Arrival
    playStationAnnouncement(stopName);
    showToast(`📍 Vehicle Arrived at ${stopName}! Doors open.`);

    // Drop speed to 0 at platform
    liveCurrentSpeed = 0.0;
    if (speedEl) speedEl.textContent = '0.0 km/h (At Stop)';

    // Passenger boarding & alighting simulation
    const paxChange = Math.floor(Math.random() * 9) - 4; // -4 to +4
    liveCurrentCapacity = Math.max(25, Math.min(maxCapacity, liveCurrentCapacity + paxChange));
    const occupancyPct = Math.round((liveCurrentCapacity / maxCapacity) * 100);

    Charts.renderCapacityGauge('capacityRadialSvg', liveCurrentCapacity, maxCapacity);
    if (capPctEl) capPctEl.textContent = `${occupancyPct}%`;
    if (capLabelEl) {
      const label = occupancyPct > 80 ? 'Heavy Load' : (occupancyPct > 50 ? 'Moderate Load' : 'Seats Open');
      capLabelEl.textContent = `${liveCurrentCapacity} / ${maxCapacity} Commuters (${label})`;
    }

    // Advance to next stop on timeline
    activeStopIndex = (activeStopIndex + 1) % currentTrackingStops.length;
    const nextStop = currentTrackingStops[activeStopIndex];
    if (nextStopTitle && nextStop) {
      nextStopTitle.textContent = nextStop.stopName;
    }

    // Update stop statuses
    currentTrackingStops.forEach((st, idx) => {
      if (idx < activeStopIndex) {
        st.status = 'DEPARTED';
        st.isNext = false;
        st.statusTag = 'Departed';
      } else if (idx === activeStopIndex) {
        st.status = 'ACTIVE';
        st.isNext = true;
        st.statusTag = 'Approaching';
      } else {
        st.status = 'SCHEDULED';
        st.isNext = false;
        st.statusTag = 'On Time';
      }
    });

    renderTimeline(currentTrackingStops);

    // Speed accelerates after 4 seconds
    setTimeout(() => {
      liveCurrentSpeed = 36.5;
      if (speedEl) speedEl.textContent = `${liveCurrentSpeed.toFixed(1)} km/h`;
    }, 4000);
  }
}

// ==============================================================================
// LIVE COMMUNITY FEED SIMULATOR
// ==============================================================================
function startCommunityReportSimulator() {
  const simulatedCommunityReports = [
    { routeNumber: 'Line C-101 AC Express', stopName: 'Airport T2 Departures', crowdLevel: 'Low', delayMinutes: 0, comment: 'Sahar Elevated access is totally clear. Tata Starbus AC is cool!' },
    { routeNumber: 'Metro Line 1 + Aqua 3', stopName: 'Ghatkopar Metro Concourse', crowdLevel: 'Moderate', delayMinutes: 2, comment: 'Metro frequency is 3.5 minutes. AFC gates clear.' },
    { routeNumber: 'Harbour Fast Express', stopName: 'Wadala Road Station', crowdLevel: 'High', delayMinutes: 4, comment: 'Platforms 2 & 3 crowded. Take the middle footbridge for platform switch.' },
    { routeNumber: 'Line A-356 AC Express', stopName: 'Vakola SCLR Ramp', crowdLevel: 'Low', delayMinutes: 1, comment: 'Smooth flow on elevated corridor towards Chembur.' },
    { routeNumber: 'Suburban Fast Local', stopName: 'Dadar Central Platform 2', crowdLevel: 'High', delayMinutes: 3, comment: 'Churchgate bound fast train on schedule. Standing room only.' }
  ];

  let simIdx = 0;
  setInterval(() => {
    const feedContainer = document.getElementById('communityFeedContainer');
    if (!feedContainer) return;

    const rep = simulatedCommunityReports[simIdx % simulatedCommunityReports.length];
    simIdx++;

    const card = document.createElement('div');
    card.className = 'feed-card';
    card.style.animation = 'fadeIn 0.5s ease';

    let crowdClass = 'badge-emerald';
    if (rep.crowdLevel === 'Moderate') crowdClass = 'badge-amber';
    if (rep.crowdLevel === 'High') crowdClass = 'badge-rose';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;color:var(--text-main);font-size:0.92rem;">${rep.routeNumber} • ${rep.stopName}</div>
        <span style="font-size:0.75rem;color:var(--blue-primary);font-weight:700;">● Just now</span>
      </div>
      <div style="display:flex;gap:0.4rem;align-items:center;margin-top:0.25rem;">
        <span class="badge ${crowdClass}">${rep.crowdLevel} Density</span>
        <span class="badge badge-gray">+${rep.delayMinutes}m delay</span>
        <span class="badge badge-blue">Verified Citizen</span>
      </div>
      ${rep.comment ? `<div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.25rem;font-style:italic;">"${rep.comment}"</div>` : ''}
    `;

    feedContainer.insertBefore(card, feedContainer.firstChild);

    // Keep max 10 items in feed
    while (feedContainer.children.length > 10) {
      feedContainer.removeChild(feedContainer.lastChild);
    }
  }, 28000);
}

// --- Utilities ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#### (.*$)/gim, '<h4 style="font-size:0.88rem;margin:0.35rem 0 0.15rem 0;color:var(--text-main);">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size:0.95rem;margin:0.4rem 0 0.2rem 0;color:var(--text-main);">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left:1rem;list-style-type:disc;">$1</li>')
    .replace(/<li.*<\/li>/gim, match => `<ul style="margin:0.25rem 0;padding-left:0.5rem;">${match}</ul>`)
    .replace(/\n\n/gim, '<br><br>')
    .replace(/\n/gim, '<br>');
}

// ==============================================================================
// SCREEN 3: PASSENGER REPORT (QUICK & CONFLICT-FREE)
// ==============================================================================
function setupReportForm() {
  const crowdBtns = document.querySelectorAll('.crowd-btn');
  crowdBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      crowdBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCrowdSelection = btn.getAttribute('data-crowd');
    });
  });

  const stepBtns = document.querySelectorAll('.step-btn');
  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stepBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDelaySelection = parseInt(btn.getAttribute('data-delay'));
    });
  });

  const submitBtn = document.getElementById('submitReportBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const routeSelect = document.getElementById('reportRouteSelect');
      const stopSelect = document.getElementById('reportStopSelect');
      const commentInput = document.getElementById('reportCommentInput');

      const payload = {
        routeNumber: routeSelect ? routeSelect.value : 'Line C-101 AC Express',
        stopName: stopSelect ? stopSelect.value : 'SNDT University Juhu',
        crowdLevel: activeCrowdSelection,
        delayMinutes: activeDelaySelection,
        causes: ['Normal Passenger Report'],
        comment: commentInput ? commentInput.value.trim() : ''
      };

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        await API.submitReport(payload);
        showToast('✓ Real-time update shared with commuters!');
        
        if (commentInput) commentInput.value = '';
        await loadCommunityFeed();
      } catch (e) {
        showToast(e.message || 'Error submitting report', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Live Update';
      }
    });
  }

  loadCommunityFeed();
}

async function loadCommunityFeed() {
  try {
    const reports = await API.getReports();
    const feedContainer = document.getElementById('communityFeedContainer');
    if (!feedContainer || !reports) return;

    feedContainer.innerHTML = '';
    reports.forEach(rep => {
      const card = document.createElement('div');
      card.className = 'feed-card';

      let crowdClass = 'badge-emerald';
      if (rep.crowdLevel === 'Moderate') crowdClass = 'badge-amber';
      if (rep.crowdLevel === 'High') crowdClass = 'badge-rose';

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:700;color:var(--text-main);font-size:0.92rem;">${rep.routeNumber} • ${rep.stopName}</div>
          <span style="font-size:0.75rem;color:var(--text-muted);">${rep.timestamp || 'Just now'}</span>
        </div>
        <div style="display:flex;gap:0.4rem;align-items:center;margin-top:0.25rem;">
          <span class="badge ${crowdClass}">${rep.crowdLevel} Density</span>
          <span class="badge badge-gray">+${rep.delayMinutes}m</span>
        </div>
        ${rep.comment ? `<div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.25rem;font-style:italic;">"${rep.comment}"</div>` : ''}
      `;
      feedContainer.appendChild(card);
    });
  } catch (e) {
    // Silent
  }
}

// ==============================================================================
// SCREEN: PULSEAI LIVE CONNECT & TELEMETRY RADAR
// ==============================================================================
let connectLiveInterval = null;
let connectJitterInterval = null;
let activeConnectVehicleId = 4092;

const CONNECT_VEHICLE_PROFILES = {
  4092: {
    id: 4092,
    number: 'MH-01-CV-4092',
    name: 'Tata Starbus EV Ultra-Low Emission (#4092)',
    badge: 'BEST Electric Transit',
    badgeClass: 'badge-blue',
    route: 'Line C-101 AC Express',
    corridor: 'Corridor Flow: Clear (Sahar Elevated Expressway)',
    speedBase: 38.5,
    speed: 38.5,
    capacityCurrent: 45,
    capacityMax: 80,
    occupancyPct: 56,
    occupancyStatus: 'Seats Open',
    occupancyStatusClass: 'badge-emerald',
    climate: '21.0',
    battery: 88,
    nextStopName: 'BKC City Park',
    nextStopSeconds: 202, // 3m 22s
    nextTransitIcon: '🚇',
    connectingRoute: 'Mumbai Metro Aqua Line 3 (Southbound)',
    interchangeHub: 'BKC Underground Concourse • Platform 2',
    departureSeconds: 435, // 7m 15s
    guidance: 'Exit via Bay 2 ➔ Follow Blue Footprint Path directly to Concourse Level. Fast-tap Chalo / NCMC card at Turnstiles 3-6 to bypass ticket queues.',
    origin: 'SNDT University Juhu',
    destination: 'BKC City Park Interchange'
  },
  108: {
    id: 108,
    number: 'M1-METRO-108',
    name: 'Alstom Metropolis 4-Car Consist (#108)',
    badge: 'MMRCL & Metro One',
    badgeClass: 'badge-cyan',
    route: 'Metro Line 1 + Aqua 3 Direct',
    corridor: 'Flow: Normal Schedule (Ghatkopar Concourse Clear)',
    speedBase: 52.0,
    speed: 52.0,
    capacityCurrent: 680,
    capacityMax: 1100,
    occupancyPct: 62,
    occupancyStatus: 'Standing Room',
    occupancyStatusClass: 'badge-amber',
    climate: '20.5',
    battery: 96,
    nextStopName: 'Marol Naka Interchange',
    nextStopSeconds: 114, // 1m 54s
    nextTransitIcon: '🚇',
    connectingRoute: 'Metro Line 3 Aqua (Colaba-SEEPZ Concourse)',
    interchangeHub: 'Marol Naka Lower Platform 1',
    departureSeconds: 310, // 5m 10s
    guidance: 'Transfer via Escalator 4 down to Aqua Line concourse. Automated platform screen doors open on right.',
    origin: 'Andheri Metro Station',
    destination: 'Marol Naka Interchange'
  },
  3210: {
    id: 3210,
    number: 'CR-EMU-3210',
    name: 'Bombardier 12-Car Fast EMU (#3210)',
    badge: 'Central Railway Suburban',
    badgeClass: 'badge-indigo',
    route: 'Harbour Fast Express',
    corridor: 'Corridor: +4m signal hold at Kurla Junction',
    speedBase: 64.0,
    speed: 64.0,
    capacityCurrent: 2150,
    capacityMax: 2400,
    occupancyPct: 89,
    occupancyStatus: 'Packed / Heavy Rush',
    occupancyStatusClass: 'badge-rose',
    climate: '24.0',
    battery: 100,
    nextStopName: 'Kurla Junction Fast Line',
    nextStopSeconds: 280, // 4m 40s
    nextTransitIcon: '🚆',
    connectingRoute: 'Central Main Line Fast towards CSMT',
    interchangeHub: 'Kurla Station • Platform 5 Fast Corridor',
    departureSeconds: 390, // 6m 30s
    guidance: 'Cross Foot-Over-Bridge (FOB) #2 towards Platform 5. Board second class 12-car coach near middle indicator.',
    origin: 'Vashi Railway Station',
    destination: 'Kurla Junction'
  }
};

let currentConnectProfile = null;

function setupConnectScreen() {
  const vehSelect = document.getElementById('connectVehicleSelect');
  if (vehSelect) {
    vehSelect.addEventListener('change', () => {
      const vid = parseInt(vehSelect.value, 10);
      switchConnectVehicle(vid);
    });
  }

  const chatForm = document.getElementById('connectChatForm');
  const chatInput = document.getElementById('connectChatInput');
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = (chatInput.value || '').trim();
      if (!text) return;
      chatInput.value = '';
      await sendCopilotMessage(text);
    });
  }

  // Quick Chips
  document.querySelectorAll('.quick-chip-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const query = btn.getAttribute('data-query');
      if (query) {
        await sendCopilotMessage(query);
      }
    });
  });

  // Reset Chat button
  const clearBtn = document.getElementById('clearCopilotChatBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetCopilotChat();
    });
  }

  // Active Trip & Route Plan Context Navigation Buttons
  const viewStepsBtn = document.getElementById('copilotViewStepsBtn');
  if (viewStepsBtn) {
    viewStepsBtn.addEventListener('click', () => {
      switchScreen('steps');
    });
  }

  const changeRouteBtn = document.getElementById('copilotChangeRouteBtn');
  if (changeRouteBtn) {
    changeRouteBtn.addEventListener('click', () => {
      switchScreen('planner');
    });
  }
}

async function initConnectDashboard() {
  await switchConnectVehicle(4092);
}

async function switchConnectVehicle(vehicleId) {
  activeConnectVehicleId = vehicleId;
  const profile = CONNECT_VEHICLE_PROFILES[vehicleId] || CONNECT_VEHICLE_PROFILES[4092];
  // Deep clone so countdown mutations are per session
  currentConnectProfile = JSON.parse(JSON.stringify(profile));

  renderConnectDashboard(currentConnectProfile);
}

function renderConnectDashboard(v) {
  if (!v) return;

  // Header / Badge
  const badgeEl = document.getElementById('connectVehicleBadge');
  if (badgeEl) {
    badgeEl.textContent = v.badge;
    badgeEl.className = `badge ${v.badgeClass || 'badge-blue'}`;
  }

  const titleEl = document.getElementById('connectVehicleTitle');
  if (titleEl) titleEl.textContent = v.name;

  const subEl = document.getElementById('connectVehicleSubtitle');
  if (subEl) subEl.textContent = `Route: ${v.route} • Telemetry Sensor ID: ${v.number}`;

  const corridorEl = document.getElementById('connectCorridorStatus');
  if (corridorEl) corridorEl.textContent = v.corridor;

  // Radial SVG Gauge
  if (window.Charts && typeof window.Charts.renderCapacityGauge === 'function') {
    window.Charts.renderCapacityGauge('connectRadialSvg', v.capacityCurrent, v.capacityMax);
  }
  const pctEl = document.getElementById('connectGaugePct');
  if (pctEl) pctEl.textContent = `${v.occupancyPct}%`;

  const seatsEl = document.getElementById('connectSeatsRatio');
  if (seatsEl) seatsEl.textContent = `${v.capacityCurrent} / ${v.capacityMax} Commuters`;

  const occStatusEl = document.getElementById('connectOccupancyStatus');
  if (occStatusEl) {
    occStatusEl.textContent = v.occupancyStatus;
    occStatusEl.className = `occupancy-pill ${v.occupancyStatusClass || 'badge-emerald'}`;
  }

  // Telemetry Stat Tiles
  const speedEl = document.getElementById('connectLiveSpeed');
  if (speedEl) speedEl.textContent = Number(v.speed).toFixed(1);

  const climateEl = document.getElementById('connectLiveClimate');
  if (climateEl) climateEl.textContent = v.climate;

  const batteryEl = document.getElementById('connectLiveBattery');
  if (batteryEl) batteryEl.textContent = v.battery;

  const nextStopEl = document.getElementById('connectNextStopName');
  if (nextStopEl) nextStopEl.textContent = v.nextStopName;

  // Radar Section
  const iconEl = document.getElementById('radarTransitIcon');
  if (iconEl) iconEl.textContent = v.nextTransitIcon;

  const radarRouteEl = document.getElementById('radarConnectingRoute');
  if (radarRouteEl) radarRouteEl.textContent = v.connectingRoute;

  const radarHubEl = document.getElementById('radarInterchangeHub');
  if (radarHubEl) radarHubEl.textContent = v.interchangeHub;

  const radarGuidanceEl = document.getElementById('radarNavGuidance');
  if (radarGuidanceEl) radarGuidanceEl.textContent = v.guidance;

  updateRadarTimers(v);
}

function updateRadarTimers(v) {
  if (!v) return;

  // Next stop ETA
  const nextStopETAEl = document.getElementById('connectNextStopETA');
  if (nextStopETAEl) {
    const mins = Math.floor(v.nextStopSeconds / 60);
    const secs = v.nextStopSeconds % 60;
    nextStopETAEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Departure Countdown
  const depEl = document.getElementById('radarDepartureCountdown');
  if (depEl) {
    const mins = Math.floor(v.departureSeconds / 60);
    const secs = v.departureSeconds % 60;
    depEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const arriveEstEl = document.getElementById('radarArriveEst');
  if (arriveEstEl) {
    const mins = Math.floor(v.nextStopSeconds / 60);
    const secs = v.nextStopSeconds % 60;
    arriveEstEl.textContent = `${mins}m ${secs}s`;
  }

  const boardCloseEl = document.getElementById('radarBoardingClose');
  if (boardCloseEl) {
    const mins = Math.floor(v.departureSeconds / 60);
    const secs = v.departureSeconds % 60;
    boardCloseEl.textContent = `${mins}m ${secs}s`;
  }

  // Buffer Window
  const bufferSecs = v.departureSeconds - v.nextStopSeconds;
  const bufferTextEl = document.getElementById('radarBufferText');
  const meterBarEl = document.getElementById('radarMeterBar');
  const badgeEl = document.getElementById('connectFeasibilityBadge');
  const scoreEl = document.getElementById('radarFeasibilityScore');

  if (bufferSecs >= 180) { // 3+ mins
    const bMins = Math.floor(bufferSecs / 60);
    const bSecs = bufferSecs % 60;
    if (bufferTextEl) {
      bufferTextEl.textContent = `+${bMins}m ${bSecs}s Safety Buffer`;
      bufferTextEl.style.color = 'var(--emerald-main)';
    }
    if (meterBarEl) {
      meterBarEl.style.width = '88%';
      meterBarEl.style.background = 'var(--emerald-main)';
    }
    if (badgeEl) {
      badgeEl.textContent = 'Safe Transfer (96%)';
      badgeEl.className = 'badge badge-emerald';
    }
    if (scoreEl) {
      scoreEl.textContent = 'Feasibility: 96%';
      scoreEl.style.color = 'var(--emerald-main)';
    }
  } else if (bufferSecs > 60) { // 1-3 mins
    const bMins = Math.floor(bufferSecs / 60);
    const bSecs = bufferSecs % 60;
    if (bufferTextEl) {
      bufferTextEl.textContent = `+${bMins}m ${bSecs}s Tight Window`;
      bufferTextEl.style.color = 'var(--amber-main)';
    }
    if (meterBarEl) {
      meterBarEl.style.width = '55%';
      meterBarEl.style.background = 'var(--amber-main)';
    }
    if (badgeEl) {
      badgeEl.textContent = 'Moderate Buffer (78%)';
      badgeEl.className = 'badge badge-amber';
    }
    if (scoreEl) {
      scoreEl.textContent = 'Feasibility: 78%';
      scoreEl.style.color = 'var(--amber-main)';
    }
  } else {
    if (bufferTextEl) {
      bufferTextEl.textContent = `High Delay Risk (<1m)`;
      bufferTextEl.style.color = 'var(--rose-main)';
    }
    if (meterBarEl) {
      meterBarEl.style.width = '24%';
      meterBarEl.style.background = 'var(--rose-main)';
    }
    if (badgeEl) {
      badgeEl.textContent = 'Transfer at Risk (42%)';
      badgeEl.className = 'badge badge-rose';
    }
    if (scoreEl) {
      scoreEl.textContent = 'Feasibility: 42%';
      scoreEl.style.color = 'var(--rose-main)';
    }
  }
}

function startConnectLiveLoop() {
  stopConnectLiveLoop();

  // 1-second countdown and clock tick
  connectLiveInterval = setInterval(() => {
    // Live Digital Clock
    const clockEl = document.getElementById('connectClockText');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    }

    if (currentConnectProfile) {
      if (currentConnectProfile.nextStopSeconds > 5) {
        currentConnectProfile.nextStopSeconds--;
      } else {
        // Reset or loop next stop
        currentConnectProfile.nextStopSeconds = 180;
      }

      if (currentConnectProfile.departureSeconds > 8) {
        currentConnectProfile.departureSeconds--;
      } else {
        currentConnectProfile.departureSeconds = 420;
      }

      updateRadarTimers(currentConnectProfile);
    }
  }, 1000);

  // 3-second micro-telemetry jitter (realistic IoT fluctuation)
  connectJitterInterval = setInterval(() => {
    if (currentConnectProfile) {
      const delta = (Math.random() * 1.6 - 0.8);
      const newSpeed = Math.max(15, currentConnectProfile.speedBase + delta);
      currentConnectProfile.speed = newSpeed;

      const speedEl = document.getElementById('connectLiveSpeed');
      if (speedEl) speedEl.textContent = newSpeed.toFixed(1);

      // Fluctuate ping
      const pingEl = document.getElementById('connectPingVal');
      if (pingEl) {
        const ping = Math.floor(30 + Math.random() * 14);
        pingEl.textContent = `${ping}ms`;
      }
    }
  }, 3000);
}

function stopConnectLiveLoop() {
  if (connectLiveInterval) {
    clearInterval(connectLiveInterval);
    connectLiveInterval = null;
  }
  if (connectJitterInterval) {
    clearInterval(connectJitterInterval);
    connectJitterInterval = null;
  }
}

// --- Gemini Copilot Chat Interaction ---
async function sendCopilotMessage(userMessage) {
  const historyContainer = document.getElementById('connectChatHistory');
  if (!historyContainer || !userMessage) return;

  const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // 1. Append User Bubble
  const userRow = document.createElement('div');
  userRow.className = 'chat-message-row user-row';
  userRow.innerHTML = `
    <div class="chat-avatar">👤</div>
    <div class="chat-bubble user-bubble">
      <div class="bubble-header">
        <strong>You</strong>
        <span class="bubble-time">${nowTime}</span>
      </div>
      <div class="bubble-body">
        <p>${escapeHtml(userMessage)}</p>
      </div>
    </div>
  `;
  historyContainer.appendChild(userRow);
  historyContainer.scrollTop = historyContainer.scrollHeight;

  // 2. Append Loading Placeholder Bubble
  const loadingRow = document.createElement('div');
  loadingRow.className = 'chat-message-row ai-row';
  loadingRow.id = 'copilotLoadingPlaceholder';
  loadingRow.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble ai-bubble">
      <div class="bubble-header">
        <strong>PulseAI (Gemini 3.8 Flash)</strong>
        <span class="bubble-time">Analyzing...</span>
      </div>
      <div class="bubble-body">
        <p style="color:var(--text-muted);display:flex;align-items:center;gap:0.45rem;">
          <span class="tiny-pulse"></span> Querying real-time MMR corridor intelligence...
        </p>
      </div>
    </div>
  `;
  historyContainer.appendChild(loadingRow);
  historyContainer.scrollTop = historyContainer.scrollHeight;

  // 3. Fetch from /api/ai/chat with live active trip & route plan context
  try {
    const origin = currentTripOrigin || (currentConnectProfile ? currentConnectProfile.origin : 'SNDT University Juhu');
    const dest = currentTripDestination || (currentConnectProfile ? currentConnectProfile.destination : 'Airport International (CSMIA T2)');
    const selectedRoute = (currentLoadedRoutes && currentLoadedRoutes[currentActiveRouteIndex]) ? currentLoadedRoutes[currentActiveRouteIndex] : null;
    const plan = selectedRoute ? `${selectedRoute.routeNumber} via ${selectedRoute.waypointName || 'direct'} (${selectedRoute.operator}, ${selectedRoute.durationMins}m, ${selectedRoute.fareFormatted || '₹' + selectedRoute.fareInr})` : '';

    const data = await API.sendAiChat(userMessage, origin, dest, plan);

    // Remove loading placeholder
    const placeholder = document.getElementById('copilotLoadingPlaceholder');
    if (placeholder) placeholder.remove();

    const responseText = data.response || data.advisory || 'Commute routes are operating normally across the corridor.';
    const modelBadge = data.model || 'gemini-3.8-flash';

    // Append AI Response
    const aiRow = document.createElement('div');
    aiRow.className = 'chat-message-row ai-row';
    aiRow.innerHTML = `
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble ai-bubble">
        <div class="bubble-header">
          <strong>PulseAI</strong>
          <span class="ai-model-tag" style="margin-left:0.4rem;font-size:0.65rem;">${modelBadge}</span>
          <span class="bubble-time" style="margin-left:auto;">${nowTime}</span>
        </div>
        <div class="bubble-body">
          ${formatMarkdown(responseText)}
        </div>
      </div>
    `;
    historyContainer.appendChild(aiRow);
  } catch (err) {
    const placeholder = document.getElementById('copilotLoadingPlaceholder');
    if (placeholder) placeholder.remove();

    const errRow = document.createElement('div');
    errRow.className = 'chat-message-row ai-row';
    errRow.innerHTML = `
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble ai-bubble">
        <div class="bubble-header">
          <strong>PulseAI</strong>
          <span class="bubble-time">${nowTime}</span>
        </div>
        <div class="bubble-body">
          <p>Suburban fast locals and BEST AC express buses are running normally on Western and Central corridors. Keep a 5-minute buffer during evening peak hours.</p>
        </div>
      </div>
    `;
    historyContainer.appendChild(errRow);
  }

  historyContainer.scrollTop = historyContainer.scrollHeight;
}

/**
 * Synchronizes the PulseAI Copilot Chatbot screen with the user's active origin, destination,
 * and chosen route plan from Tab 1.
 */
function syncCopilotWithUserSelection() {
  const origin = currentTripOrigin || 'SNDT University Juhu';
  const dest = currentTripDestination || 'Airport International (CSMIA T2)';
  const selectedRoute = (currentLoadedRoutes && currentLoadedRoutes[currentActiveRouteIndex]) 
    ? currentLoadedRoutes[currentActiveRouteIndex] 
    : (currentLoadedRoutes && currentLoadedRoutes.length > 0 ? currentLoadedRoutes[0] : null);

  // 1. Update Context Banner Trip & Selected Plan Display
  const tripTextEl = document.getElementById('copilotActiveTripText');
  if (tripTextEl) {
    tripTextEl.textContent = `${origin} ➔ ${dest}`;
  }

  const planTextEl = document.getElementById('copilotActivePlanText');
  const planBadgeEl = document.getElementById('copilotActivePlanBadge');
  if (planTextEl) {
    if (selectedRoute) {
      const fare = selectedRoute.fareFormatted || `₹${selectedRoute.fareInr}`;
      planTextEl.textContent = `${selectedRoute.routeNumber} (${selectedRoute.durationMins}m • ${fare})`;
      if (planBadgeEl) {
        planBadgeEl.textContent = selectedRoute.operator || 'Selected Plan';
      }
    } else {
      planTextEl.textContent = 'None selected';
      if (planBadgeEl) {
        planBadgeEl.textContent = 'No Plan';
      }
    }
  }

  // 2. Dynamically Update Quick Query Chips with Origin, Destination, & Route Plan
  const chipsRow = document.querySelector('.quick-chips-row');
  if (chipsRow && selectedRoute) {
    const origShort = origin.split(' ')[0];
    const destShort = dest.split(' ')[0];

    chipsRow.innerHTML = `
      <button class="quick-chip-btn" data-query="Will I reach ${escapeHtml(destShort)} on time via ${escapeHtml(selectedRoute.routeNumber)}?">
        ⚡ Will I reach ${escapeHtml(destShort)} on time?
      </button>
      <button class="quick-chip-btn" data-query="Any traffic chokepoints or waterlogging between ${escapeHtml(origShort)} and ${escapeHtml(destShort)}?">
        🌧️ Check route chokepoints
      </button>
      <button class="quick-chip-btn" data-query="What is the cheapest fare option for ${escapeHtml(origShort)} to ${escapeHtml(destShort)} using Chalo Card or NCMC?">
        💰 Best fare & Chalo Card tip
      </button>
      <button class="quick-chip-btn" data-query="${escapeHtml(origShort)} ते ${escapeHtml(destShort)} प्रवासासाठी मराठीत माहिती द्या">
        🗣️ मराठीत सांगा (Marathi)
      </button>
    `;

    chipsRow.querySelectorAll('.quick-chip-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const query = btn.getAttribute('data-query');
        if (query) {
          await sendCopilotMessage(query);
        }
      });
    });
  }

  // 3. Update Welcoming Greeting in Chat if User Has Not Yet Started Chatting
  updateCopilotWelcomeIfClean();
}

/**
 * Updates the welcome greeting bubble in Chatbot tab if the user hasn't sent any messages yet.
 */
function updateCopilotWelcomeIfClean() {
  const historyContainer = document.getElementById('connectChatHistory');
  if (!historyContainer) return;

  // If user has already sent messages, preserve the user's ongoing conversation
  const hasUserMessage = historyContainer.querySelector('.user-row');
  if (hasUserMessage) return;

  const origin = currentTripOrigin || 'SNDT University Juhu';
  const dest = currentTripDestination || 'Airport International (CSMIA T2)';
  const selectedRoute = (currentLoadedRoutes && currentLoadedRoutes[currentActiveRouteIndex]) 
    ? currentLoadedRoutes[currentActiveRouteIndex] 
    : (currentLoadedRoutes && currentLoadedRoutes.length > 0 ? currentLoadedRoutes[0] : null);

  const routeName = selectedRoute ? selectedRoute.routeNumber : 'Line C-101 AC Express';
  const duration = selectedRoute ? `${selectedRoute.durationMins} mins` : '26 mins';
  const fare = selectedRoute ? (selectedRoute.fareFormatted || `₹${selectedRoute.fareInr}`) : '₹20';

  historyContainer.innerHTML = `
    <div class="chat-message-row ai-row">
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble ai-bubble">
        <div class="bubble-header">
          <strong>PulseAI</strong>
          <span class="bubble-time">Live</span>
        </div>
        <div class="bubble-body">
          <p>Namaskar! 🙏 I am your live Mumbai commute assistant powered by <strong>Gemini 3.8 Flash</strong>.</p>
          <p>I am actively tracking your selected commute from <strong>${escapeHtml(origin)}</strong> to <strong>${escapeHtml(dest)}</strong> via <strong>${escapeHtml(routeName)}</strong> (${duration} • ${fare}).</p>
          <p>Ask me anything about this trip: transfer viability, platform numbers, road chokepoints, or cost-saving travel tips!</p>
        </div>
      </div>
    </div>
  `;
}

function resetCopilotChat() {
  const historyContainer = document.getElementById('connectChatHistory');
  if (!historyContainer) return;

  const origin = currentTripOrigin || 'SNDT University Juhu';
  const dest = currentTripDestination || 'Airport International (CSMIA T2)';
  const selectedRoute = (currentLoadedRoutes && currentLoadedRoutes[currentActiveRouteIndex]) 
    ? currentLoadedRoutes[currentActiveRouteIndex] 
    : (currentLoadedRoutes && currentLoadedRoutes.length > 0 ? currentLoadedRoutes[0] : null);

  const routeName = selectedRoute ? selectedRoute.routeNumber : (currentConnectProfile ? currentConnectProfile.route : 'Line C-101 AC Express');
  const duration = selectedRoute ? `${selectedRoute.durationMins} mins` : '26 mins';
  const fare = selectedRoute ? (selectedRoute.fareFormatted || `₹${selectedRoute.fareInr}`) : '₹20';

  historyContainer.innerHTML = `
    <div class="chat-message-row ai-row">
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble ai-bubble">
        <div class="bubble-header">
          <strong>PulseAI</strong>
          <span class="bubble-time">Live</span>
        </div>
        <div class="bubble-body">
          <p>Namaskar! 🙏 I am your live Mumbai commute assistant powered by <strong>Gemini 3.8 Flash</strong>.</p>
          <p>I am actively tracking your selected commute from <strong>${escapeHtml(origin)}</strong> to <strong>${escapeHtml(dest)}</strong> via <strong>${escapeHtml(routeName)}</strong> (${duration} • ${fare}).</p>
          <p>Ask me anything about this route: transfer viability, platform numbers, road chokepoints, or cost-saving travel tips!</p>
        </div>
      </div>
    </div>
  `;
}

// ==============================================================================
// MODAL: CODE EXPORT
// ==============================================================================
let currentExportJson = '';

function setupCodeModal() {
  const modalOverlay = document.getElementById('codeExportModal');
  const openBtn = document.getElementById('openCodeExportBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const copyBtn = document.getElementById('copyCurrentCodeBtn');

  if (openBtn) {
    openBtn.addEventListener('click', async () => {
      if (modalOverlay) modalOverlay.classList.add('active');
      await switchCodeTab('sql');
    });
  }

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener('click', () => { modalOverlay.classList.remove('active'); });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });

  const tabBtns = document.querySelectorAll('.code-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabType = btn.getAttribute('data-tab');
      switchCodeTab(tabType);
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const displayBlock = document.getElementById('codeDisplayBlock');
      if (displayBlock) {
        navigator.clipboard.writeText(displayBlock.textContent).then(() => {
          showToast('✓ Code copied to clipboard!');
        }).catch(() => {
          showToast('Failed to copy', true);
        });
      }
    });
  }
}

async function switchCodeTab(tabType) {
  const displayBlock = document.getElementById('codeDisplayBlock');
  if (!displayBlock) return;

  if (tabType === 'sql') {
    displayBlock.textContent = `-- ==============================================================================
-- TransitPulse MySQL Workbench DDL & Seed Data (12 Mumbai Stations)
-- Run in MySQL Workbench: File -> Open SQL Script -> Execute
-- ==============================================================================

USE transitpulse_db;

-- 12 Stations Seed Data:
INSERT INTO stops (stop_id, stop_name, city, latitude, longitude, stop_type, landmark, zone) VALUES
(1, 'SNDT University Juhu', 'Mumbai', 19.0988, 72.8267, 'CAMPUS_TERMINAL', 'Juhu Tara Road / Santacruz West', 'Western Suburbs'),
(2, 'Andheri Railway Station', 'Mumbai', 19.1197, 72.8464, 'METRO_STATION', 'Platform 1 & Metro Line 1 Interchange', 'Western Corridor'),
(3, 'Airport International (CSMIA T2)', 'Mumbai', 19.0974, 72.8745, 'TERMINUS', 'Departures Level • Sahar Elevated Access', 'Airport Zone'),
(4, 'Ghatkopar Metro Station', 'Mumbai', 19.0864, 72.9081, 'METRO_STATION', 'Metro Line 1 / Central Railway Concourse', 'Eastern Suburbs'),
(5, 'Vivekanand College (VESIT)', 'Mumbai', 19.0463, 72.8889, 'CAMPUS_STOP', 'Sindhi Society / Collector Colony, Chembur', 'Chembur East'),
(6, 'BARC (Trombay Hub)', 'Mumbai', 19.0182, 72.9234, 'TERMINAL', 'Bhabha Atomic Research Centre Gate 1', 'Trombay Corridor'),
(7, 'Siddhivinayak Mandir (Prabhadevi)', 'Mumbai', 19.0169, 72.8303, 'BUS_STOP', 'SK Bole Marg / Prabhadevi Junction', 'South-Central'),
(8, 'Mahalaxmi', 'Mumbai', 18.9827, 72.8239, 'BUS_STOP', 'Mahalaxmi Temple / Racecourse Concourse', 'South Mumbai'),
(9, 'Marine Lines', 'Mumbai', 18.9442, 72.8242, 'BUS_STOP', 'Queens Necklace / Marine Drive Walkway', 'South Mumbai'),
(10, 'CSMT Railway Station', 'Mumbai', 18.9401, 72.8354, 'TERMINUS', 'Chhatrapati Shivaji Maharaj Terminus', 'South Mumbai'),
(11, 'Vashi Railway Station', 'Navi Mumbai', 19.0644, 72.9984, 'TERMINAL', 'Sector 30A / Vashi Plaza Hub', 'Navi Mumbai Hub'),
(12, 'Juinagar Railway Station', 'Navi Mumbai', 19.0494, 73.0186, 'BUS_STOP', 'Sion-Panvel Highway Connector', 'Navi Mumbai Corridor');`;
  } else if (tabType === 'api') {
    displayBlock.textContent = `// 1. Fetch Dynamic Routes between SNDT Juhu and Airport T2
fetch('http://localhost:8080/api/routes?origin=SNDT%20University%20Juhu&destination=Airport%20International%20(CSMIA%20T2)')
  .then(res => res.json())
  .then(routes => console.log('Available Options:', routes));

// 2. Fetch Live EV Bus Telemetry (#4092)
fetch('http://localhost:8080/api/tracking?vehicleId=4092')
  .then(res => res.json())
  .then(data => console.log('Live Bus:', data.vehicle.model, 'Speed:', data.vehicle.currentSpeedKmh));`;
  } else if (tabType === 'json') {
    try {
      if (!currentExportJson) {
        displayBlock.textContent = 'Loading live JSON export dataset from server...';
        const fullData = await API.getExportData();
        currentExportJson = JSON.stringify(fullData, null, 2);
      }
      displayBlock.textContent = currentExportJson;
    } catch (e) {
      displayBlock.textContent = `// Fallback local schema available in src/main/resources/data/`;
    }
  }
}

// --- Toast Utility ---
function showToast(message, isError = false) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.borderColor = isError ? 'var(--rose-main)' : 'var(--emerald-main)';
  toast.style.display = 'flex';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
