package com.transitpulse.model;

public class Route {
    private int routeId;
    private String routeNumber;
    private String operator;
    private String transportType;
    private boolean isRecommended;
    private boolean isDisrupted;
    private String disruptionTag;
    private double fare;
    private String fareFormatted;
    private int durationMins;
    private int departsInMins;
    private String departureClock;
    private String platform;
    private int stopCount;
    private int transfers;
    private String transferText;
    private String crowdLevel;
    private String crowdText;
    private String crowdBadgeClass;
    private String status;
    private String statusText;
    private double co2SavedKg;
    private double reliabilityPct;
    private String activeVehicle;
    private String description;

    public Route() {}

    public int getRouteId() { return routeId; }
    public void setRouteId(int routeId) { this.routeId = routeId; }

    public String getRouteNumber() { return routeNumber; }
    public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getTransportType() { return transportType; }
    public void setTransportType(String transportType) { this.transportType = transportType; }

    public boolean isRecommended() { return isRecommended; }
    public void setRecommended(boolean recommended) { isRecommended = recommended; }

    public boolean isDisrupted() { return isDisrupted; }
    public void setDisrupted(boolean disrupted) { isDisrupted = disrupted; }

    public String getDisruptionTag() { return disruptionTag; }
    public void setDisruptionTag(String disruptionTag) { this.disruptionTag = disruptionTag; }

    public double getFare() { return fare; }
    public void setFare(double fare) { this.fare = fare; }

    public String getFareFormatted() { return fareFormatted; }
    public void setFareFormatted(String fareFormatted) { this.fareFormatted = fareFormatted; }

    public int getDurationMins() { return durationMins; }
    public void setDurationMins(int durationMins) { this.durationMins = durationMins; }

    public int getDepartsInMins() { return departsInMins; }
    public void setDepartsInMins(int departsInMins) { this.departsInMins = departsInMins; }

    public String getDepartureClock() { return departureClock; }
    public void setDepartureClock(String departureClock) { this.departureClock = departureClock; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public int getStopCount() { return stopCount; }
    public void setStopCount(int stopCount) { this.stopCount = stopCount; }

    public int getTransfers() { return transfers; }
    public void setTransfers(int transfers) { this.transfers = transfers; }

    public String getTransferText() { return transferText; }
    public void setTransferText(String transferText) { this.transferText = transferText; }

    public String getCrowdLevel() { return crowdLevel; }
    public void setCrowdLevel(String crowdLevel) { this.crowdLevel = crowdLevel; }

    public String getCrowdText() { return crowdText; }
    public void setCrowdText(String crowdText) { this.crowdText = crowdText; }

    public String getCrowdBadgeClass() { return crowdBadgeClass; }
    public void setCrowdBadgeClass(String crowdBadgeClass) { this.crowdBadgeClass = crowdBadgeClass; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusText() { return statusText; }
    public void setStatusText(String statusText) { this.statusText = statusText; }

    public double getCo2SavedKg() { return co2SavedKg; }
    public void setCo2SavedKg(double co2SavedKg) { this.co2SavedKg = co2SavedKg; }

    public double getReliabilityPct() { return reliabilityPct; }
    public void setReliabilityPct(double reliabilityPct) { this.reliabilityPct = reliabilityPct; }

    public String getActiveVehicle() { return activeVehicle; }
    public void setActiveVehicle(String activeVehicle) { this.activeVehicle = activeVehicle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    private java.util.List<java.util.Map<String, String>> legs;
    private java.util.List<java.util.Map<String, String>> detailedSteps;
    private String waypointName;
    private String boardingStop;
    private String proTip;

    public java.util.List<java.util.Map<String, String>> getLegs() { return legs; }
    public void setLegs(java.util.List<java.util.Map<String, String>> legs) { this.legs = legs; }

    public java.util.List<java.util.Map<String, String>> getDetailedSteps() { return detailedSteps; }
    public void setDetailedSteps(java.util.List<java.util.Map<String, String>> detailedSteps) { this.detailedSteps = detailedSteps; }

    public String getWaypointName() { return waypointName; }
    public void setWaypointName(String waypointName) { this.waypointName = waypointName; }

    public String getBoardingStop() { return boardingStop; }
    public void setBoardingStop(String boardingStop) { this.boardingStop = boardingStop; }

    public String getProTip() { return proTip; }
    public void setProTip(String proTip) { this.proTip = proTip; }
}
