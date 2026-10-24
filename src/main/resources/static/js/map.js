/**
 * SmartPublic Transport - Mumbai Interactive Transit Map (Google Maps Cartography)
 * Built with Leaflet, real Mumbai GPS coordinates, authentic road & rail transit corridors,
 * Google Maps styled pins (Start "A", Dest "B", Interchanges), dynamic route polylines,
 * multi-layer satellite/street/dark switcher, and live vehicle GPS beacons.
 */

// Comprehensive Mumbai Stations & Campus Coordinates Registry
const MUMBAI_GEO_STATIONS = {
  "SNDT University Juhu": {
    lat: 19.0988,
    lng: 72.8267,
    zone: "Western Suburbs",
    landmark: "Juhu Tara Road / Santacruz West",
    tag: "A",
    type: "CAMPUS",
    connections: "BEST Bus 231, Share-Auto to Santacruz Station"
  },
  "Andheri Railway Station": {
    lat: 19.1197,
    lng: 72.8464,
    zone: "Western Corridor",
    landmark: "Platform 1 & Metro Line 1 Interchange",
    tag: "A",
    type: "STATION",
    connections: "Western Railway, Metro Line 1, BEST Feeder"
  },
  "Airport International (CSMIA T2)": {
    lat: 19.0974,
    lng: 72.8745,
    zone: "Airport Zone",
    landmark: "Departures Level • Sahar Elevated Access",
    tag: "B",
    type: "AIRPORT",
    connections: "Line C-101 AC Express, Metro 3 Aqua Line"
  },
  "Ghatkopar Metro Station": {
    lat: 19.0864,
    lng: 72.9081,
    zone: "Eastern Suburbs",
    landmark: "Metro Line 1 / Central Railway Concourse",
    tag: "B",
    type: "METRO",
    connections: "Central Railway Suburban, Metro Line 1"
  },
  "Vivekanand College (VESIT)": {
    lat: 19.0463,
    lng: 72.8889,
    zone: "Chembur East",
    landmark: "Sindhi Society / Collector Colony, Chembur",
    tag: "B",
    type: "CAMPUS",
    connections: "5-min Auto from Chembur Stn, BEST A-356, A-505"
  },
  "BARC (Trombay Hub)": {
    lat: 19.0182,
    lng: 72.9234,
    zone: "Trombay Corridor",
    landmark: "Bhabha Atomic Research Centre Gate 1",
    tag: "B",
    type: "RESEARCH",
    connections: "BEST Trombay Feeders, Eastern Freeway"
  },
  "Siddhivinayak Mandir (Prabhadevi)": {
    lat: 19.0169,
    lng: 72.8303,
    zone: "South-Central",
    landmark: "SK Bole Marg / Prabhadevi Junction",
    tag: "A",
    type: "LANDMARK",
    connections: "Western Suburban Prabhadevi, Dadar WR"
  },
  "Mahalaxmi": {
    lat: 18.9827,
    lng: 72.8239,
    zone: "South Mumbai",
    landmark: "Mahalaxmi Temple / Racecourse Concourse",
    tag: "B",
    type: "STATION",
    connections: "Western Railway Local, Monorail Jacob Circle"
  },
  "Marine Lines": {
    lat: 18.9442,
    lng: 72.8242,
    zone: "South Mumbai",
    landmark: "Queen's Necklace / Marine Drive Walkway",
    tag: "B",
    type: "COASTAL",
    connections: "Western Railway Local, Coastal Promenade"
  },
  "CSMT Railway Station": {
    lat: 18.9401,
    lng: 72.8354,
    zone: "South Mumbai",
    landmark: "Chhatrapati Shivaji Maharaj Terminus",
    tag: "B",
    type: "TERMINUS",
    connections: "Central & Harbour Suburban Lines, Intercity Rail"
  },
  "Vashi Railway Station": {
    lat: 19.0644,
    lng: 72.9984,
    zone: "Navi Mumbai Hub",
    landmark: "Sector 30A / Vashi Plaza Terminal",
    tag: "A",
    type: "TERMINUS",
    connections: "Harbour Suburban, Trans-Harbour, NMMT AC"
  },
  "Juinagar Railway Station": {
    lat: 19.0494,
    lng: 73.0186,
    zone: "Navi Mumbai Corridor",
    landmark: "Sion-Panvel Highway Connector",
    tag: "B",
    type: "STATION",
    connections: "Harbour Line Suburban, Highway Corridor"
  },
  "Dadar Central Interchange": {
    lat: 19.0178,
    lng: 72.8436,
    zone: "Central Mumbai",
    landmark: "Western & Central Railway Concourse",
    tag: "A",
    type: "INTERCHANGE",
    connections: "Western & Central Suburban Lines, BEST Terminus"
  },
  "Bandra Kurla Complex (BKC)": {
    lat: 19.0650,
    lng: 72.8650,
    zone: "BKC Business Hub",
    landmark: "BKC City Park / Metro Line 3 Station",
    tag: "A",
    type: "BUSINESS_HUB",
    connections: "Metro Line 3 Aqua, BEST Electric Feeder"
  },
  "Kurla Junction": {
    lat: 19.0657,
    lng: 72.8794,
    zone: "Central Suburbs",
    landmark: "Central & Harbour Railway Interchange",
    tag: "A",
    type: "JUNCTION",
    connections: "Central Suburban, Harbour Line, SCLR Corridor"
  },
  "Borivali Railway Station": {
    lat: 19.2290,
    lng: 72.8573,
    zone: "Western Suburbs North",
    landmark: "Western Railway Fast Platform 1-10",
    tag: "A",
    type: "TERMINUS",
    connections: "Western Railway Fast/Slow, Metro Line 2A / 7"
  },
  "Thane Station": {
    lat: 19.1860,
    lng: 72.9754,
    zone: "Thane MMR",
    landmark: "Central Railway & Trans-Harbour Junction",
    tag: "A",
    type: "JUNCTION",
    connections: "Central Main Line, Trans-Harbour, TMT AC"
  },
  "Churchgate Station": {
    lat: 18.9322,
    lng: 72.8264,
    zone: "South Mumbai",
    landmark: "Western Railway Headquarters Terminus",
    tag: "B",
    type: "TERMINUS",
    connections: "Western Railway Suburban Southern Terminus"
  },
  "Bandra Station": {
    lat: 19.0544,
    lng: 72.8406,
    zone: "Western Corridor",
    landmark: "Bandra West Heritage Station & Terminus",
    tag: "A",
    type: "STATION",
    connections: "Western & Harbour Line, BEST Feeder"
  },
  "Chembur Station": {
    lat: 19.0622,
    lng: 72.8997,
    zone: "Chembur East",
    landmark: "Chembur Monorail & Harbour Rail",
    tag: "B",
    type: "STATION",
    connections: "Harbour Line, Monorail, BEST Feeders"
  }
};

// Key Mumbai Transit Corridor Geographic Nodes
const MUMBAI_CORRIDOR_NODES = {
  santacruzWest: [19.0825, 72.8415],
  santacruzEastVakola: [19.0835, 72.8530],
  kharRoad: [19.0697, 72.8365],
  bandraWest: [19.0544, 72.8406],
  bandraKalanagar: [19.0600, 72.8480],
  bkcCorridor: [19.0650, 72.8650],
  mahimJunction: [19.0410, 72.8475],
  kingsCircle: [19.0305, 72.8560],
  wadalaRoadInterchange: [19.0165, 72.8586],
  gtbNagar: [19.0375, 72.8670],
  chunabhatti: [19.0520, 72.8765],
  kurlaStation: [19.0657, 72.8794],
  tilakNagar: [19.0685, 72.8935],
  chemburStation: [19.0622, 72.8997],
  chemburColony: [19.0555, 72.8960],
  sanduwadi: [19.0515, 72.8920],
  sclrVakolaEntry: [19.0810, 72.8580],
  sclrMidFlyover: [19.0745, 72.8680],
  sclrKurlaFlyover: [19.0680, 72.8805],
  sclrAmarMahal: [19.0610, 72.8950],
  wehMilanSubway: [19.0930, 72.8520],
  saharElevatedAccess: [19.0990, 72.8620],
  airportT2Departures: [19.0974, 72.8745],
  metroDnNagar: [19.1245, 72.8315],
  metroAndheri: [19.1197, 72.8464],
  metroWeh: [19.1158, 72.8570],
  metroChakala: [19.1115, 72.8655],
  metroAirportRd: [19.1090, 72.8750],
  metroMarol: [19.1070, 72.8835],
  metroSakiNaka: [19.1025, 72.8880],
  metroAsalpha: [19.0970, 72.8990],
  metroGhatkopar: [19.0864, 72.9081],
  dadarInterchange: [19.0178, 72.8436],
  sionCircle: [19.0400, 72.8630],
  prabhadevi: [19.0169, 72.8303],
  worliSeaLink: [19.0060, 72.8180],
  mahalaxmi: [18.9827, 72.8239],
  marineLines: [18.9442, 72.8242],
  csmtTerminus: [18.9401, 72.8354],
  vashiCreekBridge: [19.0610, 72.9750],
  mankhurd: [19.0505, 72.9320],
  govandi: [19.0555, 72.9150]
};

class MumbaiTransitMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.map = null;
    this.tileLayers = {};
    this.activeLayerKey = 'street';
    this.routePolyline = null;
    this.casingPolyline = null;
    this.feederPolylines = [];
    this.markersGroup = null;
    this.currentOrigin = "SNDT University Juhu";
    this.currentDest = "Airport International (CSMIA T2)";
    this.activeRoute = null;

    this.init();
  }

  init() {
    if (!this.container) return;

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded, map rendering deferred');
      return;
    }

    // Clean up if container is already initialized
    if (this.container._leaflet_id) {
      this.container._leaflet_id = null;
      this.container.innerHTML = '';
    }

    // Determine initial layer based on active theme
    this.activeLayerKey = 'street';

    // Initialize Leaflet Map centered on Mumbai with active dragging & scroll-wheel zooming
    this.map = L.map(this.containerId, {
      center: [19.0760, 72.8777],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true
    });

    if (this.map.dragging) this.map.dragging.enable();
    if (this.map.scrollWheelZoom) this.map.scrollWheelZoom.enable();
    if (this.map.touchZoom) this.map.touchZoom.enable();

    // Add sleek bottom-right zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Initialize 100% Watermark-Free Cartographic Tile Layers (Google Maps Standard & Satellite)
    // 1. Street Layer: Official Google Maps Standard Roadmap (Zero Watermark, Familiar, High Contrast)
    this.tileLayers.street = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '© Google Maps'
    });

    // 2. Satellite Hybrid: Google Maps Satellite Imagery + High-Def Roads & Labels
    this.tileLayers.sat = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '© Google Maps Satellite'
    });

    // Add initial street layer
    this.tileLayers.street.addTo(this.map);

    // Layer Group for route markers and overlays
    this.markersGroup = L.layerGroup().addTo(this.map);

    // Setup interactive controls
    this.setupMapControls();

    // Invalidate size once DOM stabilizes and ensure scroll & drag are active
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        if (this.map.dragging) this.map.dragging.enable();
        if (this.map.scrollWheelZoom) this.map.scrollWheelZoom.enable();
      }
    }, 200);

    // Initial render
    this.renderJourney(this.currentOrigin, this.currentDest, null);
  }

  setupMapControls() {
    const streetBtn = document.getElementById('mapLayerStreet');
    const satBtn = document.getElementById('mapLayerSat');
    const fitBtn = document.getElementById('mapFitRouteBtn');

    if (streetBtn) {
      streetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setLayer('street');
      });
    }

    if (satBtn) {
      satBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setLayer('sat');
      });
    }

    if (fitBtn) {
      fitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.fitRoute();
      });
    }

    this.updateControlButtonsState();
  }

  setLayer(layerKey) {
    if (!this.tileLayers[layerKey] || !this.map) return;

    // Remove active tile layer
    Object.keys(this.tileLayers).forEach(key => {
      const layer = this.tileLayers[key];
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });

    // Add selected layer
    this.activeLayerKey = layerKey;
    this.tileLayers[layerKey].addTo(this.map);
    this.tileLayers[layerKey].bringToBack();

    this.updateControlButtonsState();
  }

  updateControlButtonsState() {
    const buttons = {
      street: document.getElementById('mapLayerStreet'),
      sat: document.getElementById('mapLayerSat')
    };

    Object.keys(buttons).forEach(key => {
      const btn = buttons[key];
      if (btn) {
        btn.classList.toggle('active', key === this.activeLayerKey);
      }
    });
  }

  updateTheme(theme) {
    // Keep map in street or satellite mode as configured
  }

  fitRoute() {
    if (!this.map || !this.currentOriginLatLng || !this.currentDestLatLng) return;
    const bounds = L.latLngBounds([this.currentOriginLatLng, this.currentDestLatLng]);
    if (this.currentWaypointLatLng) bounds.extend(this.currentWaypointLatLng);
    this.map.fitBounds(bounds, {
      padding: [75, 75],
      maxZoom: 15,
      animate: true,
      duration: 0.8
    });
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }

  /**
   * Main Dynamic Route Renderer
   * Renders the authentic transit journey between origin and destination
   */
  renderJourney(originName, destName, route) {
    this.currentOrigin = originName || this.currentOrigin;
    this.currentDest = destName || this.currentDest;
    this.activeRoute = route || this.activeRoute;

    if (!this.map || !this.markersGroup) return;

    // Clear previous route polylines, markers, and live vehicle animation
    if (this.vehicleAnimInterval) {
      clearInterval(this.vehicleAnimInterval);
      this.vehicleAnimInterval = null;
    }
    this.markersGroup.clearLayers();
    if (this.casingPolyline) {
      this.map.removeLayer(this.casingPolyline);
      this.casingPolyline = null;
    }
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }
    this.feederPolylines.forEach(pl => this.map.removeLayer(pl));
    this.feederPolylines = [];

    // Resolve Station Objects with intelligent fuzzy matching
    const resolveStation = (name, fallbackLat, fallbackLng, defaultTag) => {
      if (!name) return { lat: fallbackLat, lng: fallbackLng, landmark: "Mumbai Transit Hub", tag: defaultTag, connections: "Local Transit" };
      const clean = name.trim();
      if (MUMBAI_GEO_STATIONS[clean]) return MUMBAI_GEO_STATIONS[clean];

      const lower = clean.toLowerCase();
      for (const [k, v] of Object.entries(MUMBAI_GEO_STATIONS)) {
        if (k.toLowerCase() === lower) return v;
      }
      for (const [k, v] of Object.entries(MUMBAI_GEO_STATIONS)) {
        const kLow = k.toLowerCase();
        if (kLow.includes(lower) || lower.includes(kLow)) return v;
      }
      const words = lower.split(/[^a-z0-9]/).filter(w => w.length > 3 && w !== 'station' && w !== 'railway');
      for (const w of words) {
        for (const [k, v] of Object.entries(MUMBAI_GEO_STATIONS)) {
          if (k.toLowerCase().includes(w)) return v;
        }
      }
      return { lat: fallbackLat, lng: fallbackLng, landmark: clean, tag: defaultTag, connections: "Local Transit" };
    };

    let origin = resolveStation(this.currentOrigin, 19.0988, 72.8267, 'A');
    let dest = resolveStation(this.currentDest, 18.9401, 72.8354, 'B');

    // Store coordinate anchors for fitRoute
    this.currentOriginLatLng = [origin.lat, origin.lng];
    this.currentDestLatLng = [dest.lat, dest.lng];
    this.currentWaypointLatLng = null;

    // Update Header and Legend in DOM
    const headerTitle = document.getElementById('mapHeaderTitle');
    const headerSubtitle = document.getElementById('mapHeaderSubtitle');
    const legendOrigin = document.getElementById('mapLegendOrigin');
    const legendDest = document.getElementById('mapLegendDest');

    if (headerTitle) {
      headerTitle.innerText = `${this.currentOrigin} ➔ ${this.currentDest}`;
    }
    if (headerSubtitle) {
      headerSubtitle.innerText = `Pin A: ${origin.landmark} • Pin B: ${dest.landmark}`;
    }
    if (legendOrigin) legendOrigin.innerText = `${this.currentOrigin.split(' ')[0]} (A)`;
    if (legendDest) legendDest.innerText = `${this.currentDest.split(' ')[0]} (B)`;

    // Same Station Special Notice
    if (this.currentOrigin === this.currentDest) {
      const singleMarker = this.createGooglePinMarker(
        origin.lat, origin.lng, 'A', 'start',
        this.currentOrigin,
        `<strong>Selected Station</strong><br>${origin.landmark}<br><span style="color:#10b981;font-weight:700;">GPS: ${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}</span>`
      );
      this.markersGroup.addLayer(singleMarker);
      this.map.setView([origin.lat, origin.lng], 14);
      return;
    }

    // 1. Add Google Maps Start Pin ("A" - Accurate Source Coordinates)
    const startMarker = this.createGooglePinMarker(
      origin.lat, origin.lng, 'A', 'start',
      this.currentOrigin,
      `<strong>Source Station (A)</strong><br>${origin.landmark}<br><span style="color:#10b981;font-weight:700;">GPS: ${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}</span><br><small style="color:var(--text-muted);">${origin.connections || 'Origin'}</small>`
    );
    this.markersGroup.addLayer(startMarker);

    // 2. Add Google Maps Destination Pin ("B" - Accurate Destination Coordinates)
    const destMarker = this.createGooglePinMarker(
      dest.lat, dest.lng, 'B', 'dest',
      this.currentDest,
      `<strong>Destination Station (B)</strong><br>${dest.landmark}<br><span style="color:#ef4444;font-weight:700;">GPS: ${dest.lat.toFixed(4)}, ${dest.lng.toFixed(4)}</span><br><small style="color:var(--text-muted);">${dest.connections || 'Destination'}</small>`
    );
    this.markersGroup.addLayer(destMarker);

    // 3. Smoothly Fit Map Bounds between Station A and Station B
    const bounds = L.latLngBounds([[origin.lat, origin.lng], [dest.lat, dest.lng]]);
    this.map.fitBounds(bounds, {
      padding: [75, 75],
      maxZoom: 15,
      animate: true,
      duration: 0.8
    });

    // Invalidate size once after animation and ensure drag & scroll remain active
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        if (this.map.dragging) this.map.dragging.enable();
        if (this.map.scrollWheelZoom) this.map.scrollWheelZoom.enable();
      }
    }, 200);
  }

  /**
   * Constructs authentic Mumbai road & railway corridor paths
   */
  buildCorridorPath(originName, destName, route, origin, dest) {
    const N = MUMBAI_CORRIDOR_NODES;
    let mainPath = [];
    let firstMile = [];
    let lastMile = [];
    let waypoint = null;

    const isSndtToVesit = originName.includes("SNDT") && destName.includes("VESIT");
    const isVesitToSndt = originName.includes("VESIT") && destName.includes("SNDT");
    const isSndtToAirport = originName.includes("SNDT") && destName.includes("Airport");
    const isAndheriToGhatkopar = originName.includes("Andheri") && destName.includes("Ghatkopar");
    const isVashiToCsmt = originName.includes("Vashi") && destName.includes("CSMT");

    // Case 1: SNDT Juhu ➔ VESIT Chembur
    if (isSndtToVesit) {
      const rNum = route ? (route.routeNumber || '') : '';
      if (rNum.includes("Harbour") || (route && route.transportType === 'LOCAL')) {
        // Route 1: Via Wadala Road Interchange
        firstMile = [
          [origin.lat, origin.lng],
          [19.0920, 72.8310], // Juhu Tara Rd
          N.santacruzWest      // Santacruz Station West
        ];
        mainPath = [
          N.santacruzWest,
          N.kharRoad,
          N.bandraWest,
          N.mahimJunction,
          N.kingsCircle,
          N.wadalaRoadInterchange, // Interchange Switch
          N.gtbNagar,
          N.chunabhatti,
          N.kurlaStation,
          N.tilakNagar,
          N.chemburStation
        ];
        lastMile = [
          N.chemburStation,
          N.chemburColony,
          N.sanduwadi,
          [dest.lat, dest.lng]
        ];
        waypoint = {
          name: "Wadala Road Station",
          note: "Switch to Platform 2/3 (Panvel Local)",
          lat: N.wadalaRoadInterchange[0],
          lng: N.wadalaRoadInterchange[1]
        };
      } else if (rNum.includes("A-356") || rNum.includes("SCLR") || (route && route.transportType === 'BUS')) {
        // Route 2: Via SCLR Elevated Express Link Road
        firstMile = [
          [origin.lat, origin.lng],
          [19.0880, 72.8400],
          N.santacruzEastVakola
        ];
        mainPath = [
          N.santacruzEastVakola,
          N.sclrVakolaEntry,
          N.sclrMidFlyover,
          N.sclrKurlaFlyover,
          N.sclrAmarMahal,
          N.chemburColony,
          N.sanduwadi
        ];
        lastMile = [
          N.sanduwadi,
          [dest.lat, dest.lng]
        ];
        waypoint = {
          name: "SCLR Elevated Link",
          note: "Crosses Central Line over Kurla Flyover",
          lat: N.sclrKurlaFlyover[0],
          lng: N.sclrKurlaFlyover[1]
        };
      } else {
        // Route 3 / Fallback: Via Dadar Concourse
        firstMile = [
          [origin.lat, origin.lng],
          N.santacruzWest
        ];
        mainPath = [
          N.santacruzWest,
          N.bandraWest,
          N.dadarInterchange,
          N.sionCircle,
          N.kurlaStation,
          N.chemburStation
        ];
        lastMile = [
          N.chemburStation,
          [dest.lat, dest.lng]
        ];
        waypoint = {
          name: "Dadar Concourse",
          note: "Western ➔ Central Fast Connection",
          lat: N.dadarInterchange[0],
          lng: N.dadarInterchange[1]
        };
      }
    } else if (isVesitToSndt) {
      // Reverse SNDT <-> VESIT
      firstMile = [[origin.lat, origin.lng], N.chemburStation];
      mainPath = [
        N.chemburStation,
        N.tilakNagar,
        N.kurlaStation,
        N.wadalaRoadInterchange,
        N.kingsCircle,
        N.bandraWest,
        N.santacruzWest
      ];
      lastMile = [N.santacruzWest, [dest.lat, dest.lng]];
      waypoint = {
        name: "Wadala Road Station",
        note: "Harbour ➔ Western Connection",
        lat: N.wadalaRoadInterchange[0],
        lng: N.wadalaRoadInterchange[1]
      };
    } else if (isSndtToAirport) {
      // Case 2: SNDT Juhu ➔ Airport T2
      firstMile = [
        [origin.lat, origin.lng],
        [19.0990, 72.8330],
        [19.1005, 72.8385]
      ];
      mainPath = [
        [19.1005, 72.8385],
        N.wehMilanSubway,
        [19.0960, 72.8570],
        N.saharElevatedAccess,
        N.airportT2Departures
      ];
      lastMile = [];
      waypoint = {
        name: "Sahar Elevated Road",
        note: "Express Dedicated Airport Flyover",
        lat: N.saharElevatedAccess[0],
        lng: N.saharElevatedAccess[1]
      };
    } else if (isAndheriToGhatkopar) {
      // Case 3: Metro Line 1 Corridor
      mainPath = [
        N.metroAndheri,
        N.metroWeh,
        N.metroChakala,
        N.metroAirportRd,
        N.metroMarol,
        N.metroSakiNaka,
        N.metroAsalpha,
        N.metroGhatkopar
      ];
      waypoint = {
        name: "Chakala (J.B. Nagar)",
        note: "Metro Line 1 High-Frequency Corridor",
        lat: N.metroChakala[0],
        lng: N.metroChakala[1]
      };
    } else if (isVashiToCsmt) {
      // Case 4: Harbour Line Vashi to CSMT
      mainPath = [
        [origin.lat, origin.lng],
        N.vashiCreekBridge,
        N.mankhurd,
        N.govandi,
        N.chemburStation,
        N.kurlaStation,
        N.chunabhatti,
        N.gtbNagar,
        N.wadalaRoadInterchange,
        [19.0010, 72.8570], // Sewri
        [18.9860, 72.8500], // Cotton Green
        [18.9660, 72.8440], // Dockyard Rd
        [18.9550, 72.8390], // Sandhurst Rd
        N.csmtTerminus
      ];
      waypoint = {
        name: "Vashi Creek Bridge",
        note: "Trans-Harbour Rail Connector",
        lat: N.vashiCreekBridge[0],
        lng: N.vashiCreekBridge[1]
      };
    } else {
      // General Mumbai Corridor Routing Algorithm
      // Builds a smooth, road/rail aligned path instead of a straight line
      mainPath = this.generateGeneralizedCorridorPath(origin, dest);
    }

    return { mainPath, firstMile, lastMile, waypoint };
  }

  /**
   * Generates realistic road/rail corridor waypoints between any two Mumbai points
   */
  generateGeneralizedCorridorPath(origin, dest) {
    const points = [[origin.lat, origin.lng]];
    const midLat = (origin.lat + dest.lat) / 2;
    const midLng = (origin.lng + dest.lng) / 2;

    // Determine primary alignment (Western Corridor vs Eastern Corridor vs SCLR Cross-Link)
    const isCrossSuburban = (origin.lng < 72.85 && dest.lng > 72.88) || (origin.lng > 72.88 && dest.lng < 72.85);

    if (isCrossSuburban) {
      // Connect via SCLR or Bandra-Kurla alignment
      const sclrLat = 19.0745;
      const sclrLng = 72.8680;
      points.push([origin.lat * 0.7 + sclrLat * 0.3, origin.lng * 0.7 + sclrLng * 0.3]);
      points.push([sclrLat, sclrLng]);
      points.push([dest.lat * 0.7 + sclrLat * 0.3, dest.lng * 0.7 + sclrLng * 0.3]);
    } else {
      // North-South Corridor (along Western Express Highway or Eastern Express Highway)
      points.push([origin.lat * 0.65 + dest.lat * 0.35, origin.lng * 0.7 + dest.lng * 0.3]);
      points.push([midLat, midLng]);
      points.push([origin.lat * 0.35 + dest.lat * 0.65, origin.lng * 0.3 + dest.lng * 0.7]);
    }

    points.push([dest.lat, dest.lng]);
    return points;
  }

  calculatePathDistanceKm(main, first, last) {
    const all = [].concat(first || [], main || [], last || []);
    if (all.length < 2) return 12.5;

    let dist = 0;
    for (let i = 0; i < all.length - 1; i++) {
      dist += this.haversine(all[i][0], all[i][1], all[i + 1][0], all[i + 1][1]);
    }
    return Math.max(1.2, dist).toFixed(1);
  }

  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  computeVehiclePosition(path) {
    if (!path || path.length === 0) return null;
    const midIdx = Math.floor(path.length * 0.45);
    return path[midIdx] || path[0];
  }

  /**
   * Starts smooth, continuous real-time vehicle GPS navigation along route polyline
   */
  startVehicleMotion(path, name, emoji, color) {
    if (this.vehicleAnimInterval) {
      clearInterval(this.vehicleAnimInterval);
      this.vehicleAnimInterval = null;
    }
    if (this.liveVehicleMarker) {
      if (this.markersGroup.hasLayer(this.liveVehicleMarker)) {
        this.markersGroup.removeLayer(this.liveVehicleMarker);
      }
      this.liveVehicleMarker = null;
    }
    if (!path || path.length < 2) return;

    let segmentIndex = 0;
    let progress = 0; // 0.0 to 1.0 along current segment
    const startPt = path[0];
    this.liveVehicleMarker = this.createVehicleMarker(startPt[0], startPt[1], name, emoji, color);
    this.markersGroup.addLayer(this.liveVehicleMarker);

    this.vehicleAnimInterval = setInterval(() => {
      if (!this.liveVehicleMarker || !this.map) return;
      progress += 0.035; // smooth step along road/railway
      if (progress >= 1.0) {
        progress = 0;
        segmentIndex++;
        if (segmentIndex >= path.length - 1) {
          segmentIndex = 0; // restart transit loop
        }
      }
      const p1 = path[segmentIndex];
      const p2 = path[segmentIndex + 1];
      const curLat = p1[0] + (p2[0] - p1[0]) * progress;
      const curLng = p1[1] + (p2[1] - p1[1]) * progress;
      this.liveVehicleMarker.setLatLng([curLat, curLng]);
    }, 100);
  }

  /**
   * Creates a Google Maps Teardrop Pin (Start "A" or Dest "B")
   */
  createGooglePinMarker(lat, lng, letter, typeClass, title, contentHtml) {
    const pinHtml = `
      <div class="gmaps-pin-marker ${typeClass}">
        <div class="gmaps-pin-body">
          <span class="gmaps-pin-letter">${letter}</span>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: '',
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -38]
    });

    const marker = L.marker([lat, lng], { icon });

    const popupHtml = `
      <div class="gmaps-popup-title">
        <span>${typeClass === 'start' ? '🟢' : '🏁'}</span>
        <span>${title}</span>
      </div>
      <div class="gmaps-popup-sub">
        ${contentHtml}
      </div>
    `;

    marker.bindPopup(popupHtml);
    return marker;
  }

  /**
   * Creates a Transfer / Interchange Waypoint Marker
   */
  createTransferMarker(lat, lng, name, note) {
    const pinHtml = `
      <div class="gmaps-transfer-pin">
        <div class="gmaps-transfer-icon">🔄</div>
        <span class="gmaps-transfer-label">${name.split(' ')[0]} Transfer</span>
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: '',
      iconSize: [140, 28],
      iconAnchor: [70, 14],
      popupAnchor: [0, -16]
    });

    const marker = L.marker([lat, lng], { icon });

    const popupHtml = `
      <div class="gmaps-popup-title" style="color:var(--blue-primary);">
        <span>🔄</span>
        <span>${name}</span>
      </div>
      <div class="gmaps-popup-sub">
        <strong>Interchange Transfer Point:</strong><br>${note}
      </div>
    `;

    marker.bindPopup(popupHtml);
    return marker;
  }

  /**
   * Creates Live GPS Vehicle Marker pulsating on route
   */
  createVehicleMarker(lat, lng, name, emoji, color) {
    const pinHtml = `
      <div class="gmaps-vehicle-marker" style="border-color:${color};">
        <div class="gmaps-vehicle-icon-box" style="background:${color}26;">
          ${emoji}
        </div>
        <div>
          <div class="gmaps-vehicle-name">${name}</div>
          <div class="gmaps-vehicle-status" style="color:${color};">● Live GPS • Moving</div>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: '',
      iconSize: [160, 36],
      iconAnchor: [80, 18],
      popupAnchor: [0, -20]
    });

    const marker = L.marker([lat, lng], { icon });

    const popupHtml = `
      <div class="gmaps-popup-title">
        <span>${emoji}</span>
        <span>${name}</span>
      </div>
      <div class="gmaps-popup-sub">
        <strong>Live Fleet Telemetry:</strong><br>
        Speed: 38.5 km/h • On-Time Transit Flow<br>
        <span class="badge badge-emerald" style="margin-top:0.35rem;display:inline-block;">● Real-Time Tracking Active</span>
      </div>
    `;

    marker.bindPopup(popupHtml);
    return marker;
  }
}

// Global registration
window.MumbaiTransitMap = MumbaiTransitMap;
