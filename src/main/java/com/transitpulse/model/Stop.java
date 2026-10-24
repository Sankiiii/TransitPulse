package com.transitpulse.model;

public class Stop {
    private int stopId;
    private String stopName;
    private String city;
    private double latitude;
    private double longitude;
    private String stopType;
    private String landmark;
    private String zone;

    public Stop() {}

    public Stop(int stopId, String stopName, String city, double latitude, double longitude, String stopType, String landmark, String zone) {
        this.stopId = stopId;
        this.stopName = stopName;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.stopType = stopType;
        this.landmark = landmark;
        this.zone = zone;
    }

    public int getStopId() { return stopId; }
    public void setStopId(int stopId) { this.stopId = stopId; }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
}
