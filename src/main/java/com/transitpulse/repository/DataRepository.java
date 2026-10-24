package com.transitpulse.repository;

import com.transitpulse.model.*;
import java.util.List;
import java.util.Map;

public interface DataRepository {
    List<Stop> getAllStops();
    Stop getStopById(int stopId);

    List<Route> getAllRoutes();
    Route getRouteById(int routeId);

    List<RouteStop> getRouteStops(int routeId);

    List<Vehicle> getAllVehicles();
    Vehicle getVehicleById(int vehicleId);

    List<Incident> getAllIncidents();
    Incident getIncidentById(int incidentId);
    boolean verifyIncident(int incidentId);
    boolean dismissIncident(int incidentId);

    UserReport saveUserReport(UserReport report);
    List<UserReport> getAllUserReports();

    Map<String, Object> getAnalytics();
    Map<String, Object> runSimulation(int standbyBuses, int signalSeconds, boolean offPeakFare);

    String getDataSourceMode();
}
