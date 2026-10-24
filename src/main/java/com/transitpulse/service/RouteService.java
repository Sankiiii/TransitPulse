package com.transitpulse.service;

import com.transitpulse.model.Route;
import com.transitpulse.model.RouteStop;
import com.transitpulse.model.Stop;
import com.transitpulse.repository.DataRepository;
import com.transitpulse.repository.RepositoryManager;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class RouteService {
    private final DataRepository repository;
    private final GeminiService geminiService = new GeminiService();

    public RouteService() {
        this.repository = RepositoryManager.getRepository();
    }

    public List<Stop> getAllStops() {
        return repository.getAllStops();
    }

    public List<Route> getAllRoutes() {
        List<Route> all = repository.getAllRoutes();
        List<Route> results = new ArrayList<>();
        java.time.LocalTime now = java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"));
        java.time.format.DateTimeFormatter timeFmt = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
        int offsetIdx = 0;
        for (Route r : all) {
            Route clone = cloneRoute(r);
            int waitMins = Math.max(2, r.getDepartsInMins() > 0 ? r.getDepartsInMins() : (3 + offsetIdx * 2));
            clone.setDepartsInMins(waitMins);
            clone.setDepartureClock(now.plusMinutes(waitMins).format(timeFmt));
            results.add(clone);
            offsetIdx++;
        }
        return results;
    }

    public Route getRouteById(int routeId) {
        Route r = repository.getRouteById(routeId);
        if (r == null) return null;
        Route clone = cloneRoute(r);
        java.time.LocalTime now = java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"));
        java.time.format.DateTimeFormatter timeFmt = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
        int waitMins = Math.max(2, clone.getDepartsInMins() > 0 ? clone.getDepartsInMins() : 5);
        clone.setDepartsInMins(waitMins);
        clone.setDepartureClock(now.plusMinutes(waitMins).format(timeFmt));
        return clone;
    }

    public List<RouteStop> getRouteStops(int routeId) {
        return repository.getRouteStops(routeId);
    }

    public List<Route> searchRoutes(String origin, String destination, String preference) {
        return searchRoutes(origin, destination, preference, null);
    }

    public List<Route> searchRoutes(String origin, String destination, String preference, String mode) {
        if (origin != null && !origin.trim().isEmpty() && destination != null && !destination.trim().isEmpty()) {
            String cleanOrigin = origin.trim();
            String cleanDest = destination.trim();
            if (cleanOrigin.equalsIgnoreCase(cleanDest)) {
                throw new com.transitpulse.exception.BadRequestException("Origin and Destination cannot be the same (" + cleanOrigin + "). Please select two distinct transit points.");
            }
            return geminiService.getMultiModalRoutes(cleanOrigin, cleanDest, mode, preference);
        }

        List<Route> results = new ArrayList<>(getAllRoutes());

        if (mode != null && !mode.trim().isEmpty() && !mode.equalsIgnoreCase("ALL")) {
            String m = mode.trim().toUpperCase();
            results.removeIf(r -> !r.getTransportType().equalsIgnoreCase(m));
        }

        return results;
    }

    private int getStationIndex(String stationName) {
        List<Stop> stops = getAllStops();
        for (int i = 0; i < stops.size(); i++) {
            if (stops.get(i).getStopName().equalsIgnoreCase(stationName)) {
                return i + 1;
            }
        }
        return 1;
    }

    private Route cloneRoute(Route r) {
        Route c = new Route();
        c.setRouteId(r.getRouteId());
        c.setRouteNumber(r.getRouteNumber());
        c.setOperator(r.getOperator());
        c.setTransportType(r.getTransportType());
        c.setRecommended(r.isRecommended());
        c.setDisrupted(r.isDisrupted());
        c.setDisruptionTag(r.getDisruptionTag());
        c.setFare(r.getFare());
        c.setFareFormatted(r.getFareFormatted());
        c.setDurationMins(r.getDurationMins());
        c.setDepartsInMins(r.getDepartsInMins());
        c.setDepartureClock(r.getDepartureClock());
        c.setPlatform(r.getPlatform());
        c.setStopCount(r.getStopCount());
        c.setTransfers(r.getTransfers());
        c.setTransferText(r.getTransferText());
        c.setCrowdLevel(r.getCrowdLevel());
        c.setCrowdText(r.getCrowdText());
        c.setCrowdBadgeClass(r.getCrowdBadgeClass());
        c.setStatus(r.getStatus());
        c.setStatusText(r.getStatusText());
        c.setCo2SavedKg(r.getCo2SavedKg());
        c.setReliabilityPct(r.getReliabilityPct());
        c.setActiveVehicle(r.getActiveVehicle());
        c.setDescription(r.getDescription());
        c.setLegs(r.getLegs());
        c.setWaypointName(r.getWaypointName());
        c.setBoardingStop(r.getBoardingStop());
        return c;
    }
}
