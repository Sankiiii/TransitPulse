package com.transitpulse.model;

public class Vehicle {
    private int vehicleId;
    private String vehicleNumber;
    private String routeNumber;
    private String vehicleType;
    private String model;
    private double currentSpeedKmh;
    private int headingDegrees;
    private String headingDirection;
    private int capacityMax;
    private int capacityCurrent;
    private int occupancyPct;
    private String occupancyTier;
    private String occupancyLabel;
    private double climateCelsius;
    private String accessibilityStatus;
    private String connectivity;
    private double odometerKm;
    private int batteryStatePct;
    private String operatorName;
    private String driverName;
    private double latitude;
    private double longitude;
    private String corridorStatus;

    public Vehicle() {}

    public int getVehicleId() { return vehicleId; }
    public void setVehicleId(int vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getRouteNumber() { return routeNumber; }
    public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public double getCurrentSpeedKmh() { return currentSpeedKmh; }
    public void setCurrentSpeedKmh(double currentSpeedKmh) { this.currentSpeedKmh = currentSpeedKmh; }

    public int getHeadingDegrees() { return headingDegrees; }
    public void setHeadingDegrees(int headingDegrees) { this.headingDegrees = headingDegrees; }

    public String getHeadingDirection() { return headingDirection; }
    public void setHeadingDirection(String headingDirection) { this.headingDirection = headingDirection; }

    public int getCapacityMax() { return capacityMax; }
    public void setCapacityMax(int capacityMax) { this.capacityMax = capacityMax; }

    public int getCapacityCurrent() { return capacityCurrent; }
    public void setCapacityCurrent(int capacityCurrent) { this.capacityCurrent = capacityCurrent; }

    public int getOccupancyPct() { return occupancyPct; }
    public void setOccupancyPct(int occupancyPct) { this.occupancyPct = occupancyPct; }

    public String getOccupancyTier() { return occupancyTier; }
    public void setOccupancyTier(String occupancyTier) { this.occupancyTier = occupancyTier; }

    public String getOccupancyLabel() { return occupancyLabel; }
    public void setOccupancyLabel(String occupancyLabel) { this.occupancyLabel = occupancyLabel; }

    public double getClimateCelsius() { return climateCelsius; }
    public void setClimateCelsius(double climateCelsius) { this.climateCelsius = climateCelsius; }

    public String getAccessibilityStatus() { return accessibilityStatus; }
    public void setAccessibilityStatus(String accessibilityStatus) { this.accessibilityStatus = accessibilityStatus; }

    public String getConnectivity() { return connectivity; }
    public void setConnectivity(String connectivity) { this.connectivity = connectivity; }

    public double getOdometerKm() { return odometerKm; }
    public void setOdometerKm(double odometerKm) { this.odometerKm = odometerKm; }

    public int getBatteryStatePct() { return batteryStatePct; }
    public void setBatteryStatePct(int batteryStatePct) { this.batteryStatePct = batteryStatePct; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getCorridorStatus() { return corridorStatus; }
    public void setCorridorStatus(String corridorStatus) { this.corridorStatus = corridorStatus; }
}
