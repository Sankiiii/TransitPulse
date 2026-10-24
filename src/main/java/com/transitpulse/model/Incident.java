package com.transitpulse.model;

public class Incident {
    private int incidentId;
    private int vehicleId;
    private String routeNumber;
    private String severity;
    private String status;
    private String reportedAgo;
    private String passengerConsensus;
    private String headline;
    private String crowdDensity;
    private String congestionSpikeSpeed;
    private String assignedDriver;
    private String location;
    private boolean verified;

    public Incident() {}

    public int getIncidentId() { return incidentId; }
    public void setIncidentId(int incidentId) { this.incidentId = incidentId; }

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getRouteNumber() { return routeNumber; }
    public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReportedAgo() { return reportedAgo; }
    public void setReportedAgo(String reportedAgo) { this.reportedAgo = reportedAgo; }

    public String getPassengerConsensus() { return passengerConsensus; }
    public void setPassengerConsensus(String passengerConsensus) { this.passengerConsensus = passengerConsensus; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getCrowdDensity() { return crowdDensity; }
    public void setCrowdDensity(String crowdDensity) { this.crowdDensity = crowdDensity; }

    public String getCongestionSpikeSpeed() { return congestionSpikeSpeed; }
    public void setCongestionSpikeSpeed(String congestionSpikeSpeed) { this.congestionSpikeSpeed = congestionSpikeSpeed; }

    public String getAssignedDriver() { return assignedDriver; }
    public void setAssignedDriver(String assignedDriver) { this.assignedDriver = assignedDriver; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
