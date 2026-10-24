package com.transitpulse.service;

import com.transitpulse.model.RouteStop;
import com.transitpulse.model.Vehicle;
import com.transitpulse.repository.DataRepository;
import com.transitpulse.repository.RepositoryManager;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TrackingService {
    private final DataRepository repository;

    public TrackingService() {
        this.repository = RepositoryManager.getRepository();
    }

    public List<Vehicle> getAllVehicles() {
        return repository.getAllVehicles();
    }

    public Vehicle getVehicleById(int vehicleId) {
        return repository.getVehicleById(vehicleId);
    }

    public Map<String, Object> getLiveTrackingData(int vehicleId) {
        Vehicle vehicle = repository.getVehicleById(vehicleId);
        if (vehicle == null) {
            // Default to Tata Starbus EV #4092 if not found
            vehicle = repository.getVehicleById(4092);
        }

        int routeId = 101;
        if (vehicle != null && vehicle.getVehicleId() == 108) routeId = 202;
        if (vehicle != null && vehicle.getVehicleId() == 2214) routeId = 303;

        List<RouteStop> stopsTimeline = repository.getRouteStops(routeId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("vehicle", vehicle);
        result.put("stopsTimeline", stopsTimeline);
        result.put("routeId", routeId);
        result.put("activeStopName", "BKC City Park");
        result.put("countdownSeconds", 222); // 3m 42s
        result.put("countdownFormatted", "3m 42s");
        result.put("occupancyPercentage", vehicle != null ? vehicle.getOccupancyPct() : 56);
        result.put("climateCelsius", vehicle != null ? vehicle.getClimateCelsius() : 21.0);
        result.put("accessibilityStatus", vehicle != null ? vehicle.getAccessibilityStatus() : "Bay 1 & 2 Open");

        return result;
    }
}
