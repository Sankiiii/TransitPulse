package com.transitpulse.service;

import com.transitpulse.model.Incident;
import com.transitpulse.model.UserReport;
import com.transitpulse.repository.DataRepository;
import com.transitpulse.repository.RepositoryManager;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class IncidentService {
    private final DataRepository repository;

    public IncidentService() {
        this.repository = RepositoryManager.getRepository();
    }

    public List<Incident> getAllIncidents() {
        return repository.getAllIncidents();
    }

    public boolean verifyIncident(int incidentId) {
        return repository.verifyIncident(incidentId);
    }

    public boolean dismissIncident(int incidentId) {
        return repository.dismissIncident(incidentId);
    }

    public UserReport submitReport(UserReport report) {
        return repository.saveUserReport(report);
    }

    public List<UserReport> getAllUserReports() {
        return repository.getAllUserReports();
    }

    public Map<String, Object> getAdminKpis() {
        List<Incident> incidents = repository.getAllIncidents();
        long unverifiedCount = incidents.stream().filter(i -> !i.isVerified() && !"DISMISSED".equals(i.getStatus())).count();
        long verifiedAlerts = incidents.stream().filter(Incident::isVerified).count();

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("activeFleetVehicles", 348);
        kpis.put("fleetOnlineLabel", "348 Fleet Online");
        kpis.put("networkOnTimePct", 88.5);
        kpis.put("unverifiedReportsCount", unverifiedCount);
        kpis.put("activeVerifiedAlerts", verifiedAlerts);
        kpis.put("criticalChokepointsCount", 2);
        kpis.put("systemHealth", "OPTIMAL");
        return kpis;
    }
}
