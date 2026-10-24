/**
 * TransitPulse API Client
 * Clean async wrappers around backend REST endpoints with robust error handling
 */

const API = {
  baseUrl: window.location.origin,

  async handleResponse(res) {
    if (!res.ok) {
      let errPayload;
      try {
        errPayload = await res.json();
      } catch (e) {
        errPayload = { message: res.statusText || 'Server error occurred' };
      }
      const errorMsg = errPayload.message || errPayload.error || `HTTP ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.payload = errPayload;
      throw err;
    }
    return await res.json();
  },

  async getStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/api/system/status`);
      return await this.handleResponse(res);
    } catch (e) {
      console.warn('Network issue fetching status:', e.message);
      return { status: 'OFFLINE', configuredMode: 'json', dataSourceMode: 'Offline Cache' };
    }
  },

  async getStops() {
    const res = await fetch(`${this.baseUrl}/api/stops`);
    return await this.handleResponse(res);
  },

  async getRoutes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/api/routes${query ? '?' + query : ''}`;
    const res = await fetch(url);
    return await this.handleResponse(res);
  },

  async getRouteDetails(routeId) {
    const res = await fetch(`${this.baseUrl}/api/routes/${routeId}`);
    return await this.handleResponse(res);
  },

  async getRouteStops(routeId) {
    const res = await fetch(`${this.baseUrl}/api/routes/${routeId}/stops`);
    return await this.handleResponse(res);
  },

  async getAiAdvisor(origin, destination) {
    const params = new URLSearchParams({ origin, destination });
    const res = await fetch(`${this.baseUrl}/api/ai/advisor?${params.toString()}`);
    return await this.handleResponse(res);
  },

  async sendAiChat(message, origin, destination, plan) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, origin, destination, plan })
      });
      return await this.handleResponse(res);
    } catch (e) {
      console.warn('AiChat network fallback:', e.message);
      return {
        status: 'FALLBACK',
        provider: 'PulseAI Offline Assistant',
        response: `### 🚆 PulseAI Commute Advisory\n\nFor traveling between **${origin || 'origin'}** and **${destination || 'destination'}**${plan ? ` via **${plan}**` : ''}, suburban fast local trains and direct BEST AC Express buses provide the fastest cross-town connection. Avoid surface bottlenecks during peak commuting hours (8:30-10:30 AM & 5:30-8:00 PM).`
      };
    }
  },

  async getTracking(vehicleId = 4092) {
    const res = await fetch(`${this.baseUrl}/api/tracking?vehicleId=${vehicleId}`);
    return await this.handleResponse(res);
  },

  async getVehicles() {
    const res = await fetch(`${this.baseUrl}/api/vehicles`);
    return await this.handleResponse(res);
  },

  async getIncidents() {
    const res = await fetch(`${this.baseUrl}/api/incidents`);
    return await this.handleResponse(res);
  },

  async getAdminKpis() {
    const res = await fetch(`${this.baseUrl}/api/admin/kpis`);
    return await this.handleResponse(res);
  },

  async submitReport(reportData) {
    const res = await fetch(`${this.baseUrl}/api/incidents/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return await this.handleResponse(res);
  },

  async verifyIncident(incidentId) {
    const res = await fetch(`${this.baseUrl}/api/incidents/${incidentId}/verify`, {
      method: 'POST'
    });
    return await this.handleResponse(res);
  },

  async dismissIncident(incidentId) {
    const res = await fetch(`${this.baseUrl}/api/incidents/${incidentId}/dismiss`, {
      method: 'POST'
    });
    return await this.handleResponse(res);
  },

  async getReports() {
    const res = await fetch(`${this.baseUrl}/api/reports`);
    return await this.handleResponse(res);
  },

  async getAnalytics() {
    const res = await fetch(`${this.baseUrl}/api/analytics`);
    return await this.handleResponse(res);
  },

  async runSimulation(payload) {
    const res = await fetch(`${this.baseUrl}/api/analytics/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await this.handleResponse(res);
  },

  async getExportData() {
    const res = await fetch(`${this.baseUrl}/api/export`);
    return await this.handleResponse(res);
  }
};
