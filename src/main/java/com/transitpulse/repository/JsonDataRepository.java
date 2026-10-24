package com.transitpulse.repository;

import com.transitpulse.model.*;
import com.transitpulse.util.JsonUtils;

import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class JsonDataRepository implements DataRepository {

    private final List<Stop> stops = new CopyOnWriteArrayList<>();
    private final List<Route> routes = new CopyOnWriteArrayList<>();
    private final List<RouteStop> routeStops = new CopyOnWriteArrayList<>();
    private final List<Vehicle> vehicles = new CopyOnWriteArrayList<>();
    private final List<Incident> incidents = new CopyOnWriteArrayList<>();
    private final List<UserReport> userReports = new CopyOnWriteArrayList<>();
    private final Map<String, Object> analytics = new ConcurrentHashMap<>();

    public JsonDataRepository() {
        loadAllData();
    }

    private String readDataFile(String filename) {
        try {
            File f = new File("src/main/resources/data/" + filename);
            if (f.exists()) {
                return JsonUtils.readFileAsString(f.getAbsolutePath());
            }
            InputStream is = getClass().getClassLoader().getResourceAsStream("data/" + filename);
            if (is != null) {
                Scanner s = new Scanner(is, "UTF-8").useDelimiter("\\A");
                String content = s.hasNext() ? s.next() : "";
                is.close();
                return content;
            }
        } catch (Exception e) {
            System.err.println("Could not load file " + filename + ": " + e.getMessage());
        }
        return "[]";
    }

    @SuppressWarnings("unchecked")
    private void loadAllData() {
        try {
            // 1. Load Stops
            String stopsJson = readDataFile("stops.json");
            List<Map<String, Object>> stopsList = JsonUtils.parseJsonList(stopsJson);
            for (Map<String, Object> map : stopsList) {
                Stop s = new Stop();
                s.setStopId(((Number) map.get("stopId")).intValue());
                s.setStopName((String) map.get("stopName"));
                s.setCity((String) map.get("city"));
                s.setLatitude(((Number) map.get("latitude")).doubleValue());
                s.setLongitude(((Number) map.get("longitude")).doubleValue());
                s.setStopType((String) map.get("stopType"));
                s.setLandmark((String) map.get("landmark"));
                s.setZone((String) map.get("zone"));
                stops.add(s);
            }

            // 2. Load Routes
            String routesJson = readDataFile("routes.json");
            List<Map<String, Object>> routesList = JsonUtils.parseJsonList(routesJson);
            for (Map<String, Object> map : routesList) {
                Route r = new Route();
                r.setRouteId(((Number) map.get("routeId")).intValue());
                r.setRouteNumber((String) map.get("routeNumber"));
                r.setOperator((String) map.get("operator"));
                r.setTransportType((String) map.get("transportType"));
                r.setRecommended(Boolean.TRUE.equals(map.get("isRecommended")));
                r.setDisrupted(Boolean.TRUE.equals(map.get("isDisrupted")));
                r.setDisruptionTag((String) map.get("disruptionTag"));
                r.setFare(((Number) map.get("fare")).doubleValue());
                r.setFareFormatted((String) map.get("fareFormatted"));
                r.setDurationMins(((Number) map.get("durationMins")).intValue());
                r.setDepartsInMins(((Number) map.get("departsInMins")).intValue());
                r.setDepartureClock((String) map.get("departureClock"));
                r.setPlatform((String) map.get("platform"));
                r.setStopCount(((Number) map.get("stopCount")).intValue());
                r.setTransfers(((Number) map.get("transfers")).intValue());
                r.setTransferText((String) map.get("transferText"));
                r.setCrowdLevel((String) map.get("crowdLevel"));
                r.setCrowdText((String) map.get("crowdText"));
                r.setCrowdBadgeClass((String) map.get("crowdBadgeClass"));
                r.setStatus((String) map.get("status"));
                r.setStatusText((String) map.get("statusText"));
                r.setCo2SavedKg(((Number) map.get("co2SavedKg")).doubleValue());
                r.setReliabilityPct(((Number) map.get("reliabilityPct")).doubleValue());
                r.setActiveVehicle((String) map.get("activeVehicle"));
                r.setDescription((String) map.get("description"));
                routes.add(r);
            }

            // 3. Load Route Stops
            String rsJson = readDataFile("route_stops.json");
            List<Map<String, Object>> rsList = JsonUtils.parseJsonList(rsJson);
            for (Map<String, Object> map : rsList) {
                RouteStop rs = new RouteStop();
                rs.setRouteId(((Number) map.get("routeId")).intValue());
                rs.setSequence(((Number) map.get("sequence")).intValue());
                rs.setStopId(((Number) map.get("stopId")).intValue());
                rs.setStopName((String) map.get("stopName"));
                rs.setSubtext((String) map.get("subtext"));
                rs.setScheduledTime((String) map.get("scheduledTime"));
                rs.setActualTime((String) map.get("actualTime"));
                rs.setStatus((String) map.get("status"));
                rs.setStatusTag((String) map.get("statusTag"));
                rs.setNext(Boolean.TRUE.equals(map.get("isNext")));
                rs.setTerminus(Boolean.TRUE.equals(map.get("isTerminus")));
                rs.setDelayDelta((String) map.get("delayDelta"));
                rs.setSubwayConnection((String) map.get("subwayConnection"));
                routeStops.add(rs);
            }

            // 4. Load Vehicles
            String vehJson = readDataFile("vehicles.json");
            List<Map<String, Object>> vehList = JsonUtils.parseJsonList(vehJson);
            for (Map<String, Object> map : vehList) {
                Vehicle v = new Vehicle();
                v.setVehicleId(((Number) map.get("vehicleId")).intValue());
                v.setVehicleNumber((String) map.get("vehicleNumber"));
                v.setRouteNumber((String) map.get("routeNumber"));
                v.setVehicleType((String) map.get("vehicleType"));
                v.setModel((String) map.get("model"));
                v.setCurrentSpeedKmh(((Number) map.get("currentSpeedKmh")).doubleValue());
                v.setHeadingDegrees(((Number) map.get("headingDegrees")).intValue());
                v.setHeadingDirection((String) map.get("headingDirection"));
                v.setCapacityMax(((Number) map.get("capacityMax")).intValue());
                v.setCapacityCurrent(((Number) map.get("capacityCurrent")).intValue());
                v.setOccupancyPct(((Number) map.get("occupancyPct")).intValue());
                v.setOccupancyTier((String) map.get("occupancyTier"));
                v.setOccupancyLabel((String) map.get("occupancyLabel"));
                v.setClimateCelsius(((Number) map.get("climateCelsius")).doubleValue());
                v.setAccessibilityStatus((String) map.get("accessibilityStatus"));
                v.setConnectivity((String) map.get("connectivity"));
                v.setOdometerKm(((Number) map.get("odometerKm")).doubleValue());
                v.setBatteryStatePct(((Number) map.get("batteryStatePct")).intValue());
                v.setOperatorName((String) map.get("operatorName"));
                v.setDriverName((String) map.get("driverName"));
                v.setLatitude(((Number) map.get("latitude")).doubleValue());
                v.setLongitude(((Number) map.get("longitude")).doubleValue());
                v.setCorridorStatus((String) map.get("corridorStatus"));
                vehicles.add(v);
            }

            // 5. Load Incidents
            String incJson = readDataFile("incidents.json");
            List<Map<String, Object>> incList = JsonUtils.parseJsonList(incJson);
            for (Map<String, Object> map : incList) {
                Incident inc = new Incident();
                inc.setIncidentId(((Number) map.get("incidentId")).intValue());
                inc.setVehicleId(((Number) map.get("vehicleId")).intValue());
                inc.setRouteNumber((String) map.get("routeNumber"));
                inc.setSeverity((String) map.get("severity"));
                inc.setStatus((String) map.get("status"));
                inc.setReportedAgo((String) map.get("reportedAgo"));
                inc.setPassengerConsensus((String) map.get("passengerConsensus"));
                inc.setHeadline((String) map.get("headline"));
                inc.setCrowdDensity((String) map.get("crowdDensity"));
                inc.setCongestionSpikeSpeed((String) map.get("congestionSpikeSpeed"));
                inc.setAssignedDriver((String) map.get("assignedDriver"));
                inc.setLocation((String) map.get("location"));
                inc.setVerified(Boolean.TRUE.equals(map.get("verified")));
                incidents.add(inc);
            }

            // 6. Load Analytics
            String anaJson = readDataFile("analytics.json");
            Map<String, Object> anaMap = JsonUtils.parseJsonMap(anaJson);
            analytics.putAll(anaMap);

            // Pre-seed a few citizen reports
            userReports.add(new UserReport(1, "Line C-101 Express", "BKC City Park", "High", 12,
                    List.of("Heavy Traffic", "Flyover bottleneck"), "Buses moving very slowly near BKC connector ramp", "2 mins ago", 5));
            userReports.add(new UserReport(2, "Metro Line 3", "BKC Interchange", "Moderate", 6,
                    List.of("Signal Hold"), "Train held at station platform 2 for signal sync", "5 mins ago", 3));
            userReports.add(new UserReport(3, "Line C-101 Express", "Kalanagar Junction", "Low", 0,
                    List.of("Clear Flow"), "Smooth moving after Bandra lake", "9 mins ago", 8));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<Stop> getAllStops() {
        return new ArrayList<>(stops);
    }

    @Override
    public Stop getStopById(int stopId) {
        for (Stop s : stops) {
            if (s.getStopId() == stopId) return s;
        }
        return null;
    }

    @Override
    public List<Route> getAllRoutes() {
        return new ArrayList<>(routes);
    }

    @Override
    public Route getRouteById(int routeId) {
        for (Route r : routes) {
            if (r.getRouteId() == routeId) return r;
        }
        return null;
    }

    @Override
    public List<RouteStop> getRouteStops(int routeId) {
        List<RouteStop> result = new ArrayList<>();
        for (RouteStop rs : routeStops) {
            if (rs.getRouteId() == routeId) {
                result.add(rs);
            }
        }
        return result;
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        return new ArrayList<>(vehicles);
    }

    @Override
    public Vehicle getVehicleById(int vehicleId) {
        for (Vehicle v : vehicles) {
            if (v.getVehicleId() == vehicleId) return v;
        }
        return null;
    }

    @Override
    public List<Incident> getAllIncidents() {
        return new ArrayList<>(incidents);
    }

    @Override
    public Incident getIncidentById(int incidentId) {
        for (Incident inc : incidents) {
            if (inc.getIncidentId() == incidentId) return inc;
        }
        return null;
    }

    @Override
    public synchronized boolean verifyIncident(int incidentId) {
        for (Incident inc : incidents) {
            if (inc.getIncidentId() == incidentId) {
                inc.setVerified(true);
                inc.setStatus("VERIFIED_ALERT");
                return true;
            }
        }
        return false;
    }

    @Override
    public synchronized boolean dismissIncident(int incidentId) {
        for (Incident inc : incidents) {
            if (inc.getIncidentId() == incidentId) {
                inc.setStatus("DISMISSED");
                return true;
            }
        }
        return false;
    }

    @Override
    public synchronized UserReport saveUserReport(UserReport report) {
        int nextId = userReports.size() + 1;
        report.setReportId(nextId);
        report.setTimestamp("Just now");
        report.setUpvotes(1);
        userReports.add(0, report);

        // If this report indicates severe delay, dynamically spawn an unverified incident for Admin view
        if (report.getDelayMinutes() >= 10 || "High".equalsIgnoreCase(report.getCrowdLevel()) || "Severe".equalsIgnoreCase(report.getCrowdLevel())) {
            Incident inc = new Incident();
            inc.setIncidentId(incidents.size() + 1);
            inc.setVehicleId(4092);
            inc.setRouteNumber(report.getRouteNumber() != null ? report.getRouteNumber() : "Line C-101 Express");
            inc.setSeverity("PASSENGER_ALERT");
            inc.setStatus("UNVERIFIED");
            inc.setReportedAgo("Just now");
            inc.setPassengerConsensus("100% (New Citizen Report)");
            inc.setHeadline("Reported +" + report.getDelayMinutes() + "m delay at " + report.getStopName());
            inc.setCrowdDensity(report.getCrowdLevel() + " Density / " + (report.getComment() != null ? report.getComment() : "Crowd spike"));
            inc.setCongestionSpikeSpeed("Corridor slow down reported");
            inc.setAssignedDriver("Corridor Marshal");
            inc.setLocation(report.getStopName() != null ? report.getStopName() : "BKC Area");
            inc.setVerified(false);
            incidents.add(0, inc);
        }

        return report;
    }

    @Override
    public List<UserReport> getAllUserReports() {
        return new ArrayList<>(userReports);
    }

    @Override
    public Map<String, Object> getAnalytics() {
        return new HashMap<>(analytics);
    }

    @Override
    public Map<String, Object> runSimulation(int standbyBuses, int signalSeconds, boolean offPeakFare) {
        double baseDelay = 4.8;
        double baseOnTime = 88.5;
        int basePaxHours = 14280;

        double delayReduction = (standbyBuses * 0.72) + (signalSeconds * 0.085) + (offPeakFare ? 0.95 : 0.0);
        double newDelay = Math.max(1.8, Math.round((baseDelay - delayReduction) * 10.0) / 10.0);
        double delaySavedPct = Math.round(((baseDelay - newDelay) / baseDelay * 100.0) * 10.0) / 10.0;

        double onTimeBoost = (delayReduction * 1.95);
        double newOnTime = Math.min(99.2, Math.round((baseOnTime + onTimeBoost) * 10.0) / 10.0);

        int paxHoursSaved = (int) (delayReduction * 1150);
        int projectedCost = (standbyBuses * 4200) + (signalSeconds > 0 ? 1200 : 0);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("baseDelayMinutes", baseDelay);
        res.put("projectedDelayMinutes", newDelay);
        res.put("delayReductionPct", delaySavedPct);
        res.put("baseOnTimePct", baseOnTime);
        res.put("projectedOnTimePct", newOnTime);
        res.put("paxHoursSavedDaily", paxHoursSaved);
        res.put("estimatedDailyCostInr", projectedCost);
        res.put("status", "OPTIMAL");
        res.put("summary", String.format(
            "ML Policy Evaluation: Adding %d EV bus(es), extending green signal by +%ds, and %s off-peak tariff reduces network congestion by %.1f%% and recovers %d passenger-hours daily.",
            standbyBuses, signalSeconds, offPeakFare ? "enabling" : "disabling", delaySavedPct, paxHoursSaved
        ));

        return res;
    }

    @Override
    public String getDataSourceMode() {
        return "JSON (Local Storage / Mac In-Memory)";
    }
}
