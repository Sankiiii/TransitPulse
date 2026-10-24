package com.transitpulse.repository;

import com.transitpulse.model.*;
import com.transitpulse.util.ConfigUtils;

import java.sql.*;
import java.util.*;

public class MySqlDataRepository implements DataRepository {

    private final String url;
    private final String user;
    private final String password;
    private final JsonDataRepository fallbackRepo;

    public MySqlDataRepository() {
        this.url = ConfigUtils.get("spring.datasource.url", "jdbc:mysql://localhost:3306/transitpulse_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        this.user = ConfigUtils.get("spring.datasource.username", "root");
        this.password = ConfigUtils.get("spring.datasource.password", "root123");
        this.fallbackRepo = new JsonDataRepository();

        try {
            Class.forName(ConfigUtils.get("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver"));
            System.out.println("MySQL Driver registered successfully. Connecting to: " + url);
        } catch (ClassNotFoundException e) {
            System.err.println("Warning: MySQL JDBC Driver not found in classpath. Ensure mysql-connector-j is included. Fallback will be active if queries fail.");
        }
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    @Override
    public List<Stop> getAllStops() {
        List<Stop> list = new ArrayList<>();
        String sql = "SELECT stop_id, stop_name, city, latitude, longitude, stop_type, landmark, zone FROM stops ORDER BY stop_id ASC";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Stop s = new Stop();
                s.setStopId(rs.getInt("stop_id"));
                s.setStopName(rs.getString("stop_name"));
                s.setCity(rs.getString("city"));
                s.setLatitude(rs.getDouble("latitude"));
                s.setLongitude(rs.getDouble("longitude"));
                s.setStopType(rs.getString("stop_type"));
                s.setLandmark(rs.getString("landmark"));
                s.setZone(rs.getString("zone"));
                list.add(s);
            }
            if (!list.isEmpty()) return list;
        } catch (Exception e) {
            System.err.println("MySQL getAllStops failed (" + e.getMessage() + "), using fallback.");
        }
        return fallbackRepo.getAllStops();
    }

    @Override
    public Stop getStopById(int stopId) {
        String sql = "SELECT stop_id, stop_name, city, latitude, longitude, stop_type, landmark, zone FROM stops WHERE stop_id = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, stopId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Stop s = new Stop();
                    s.setStopId(rs.getInt("stop_id"));
                    s.setStopName(rs.getString("stop_name"));
                    s.setCity(rs.getString("city"));
                    s.setLatitude(rs.getDouble("latitude"));
                    s.setLongitude(rs.getDouble("longitude"));
                    s.setStopType(rs.getString("stop_type"));
                    s.setLandmark(rs.getString("landmark"));
                    s.setZone(rs.getString("zone"));
                    return s;
                }
            }
        } catch (Exception e) {
            System.err.println("MySQL getStopById failed, using fallback.");
        }
        return fallbackRepo.getStopById(stopId);
    }

    @Override
    public List<Route> getAllRoutes() {
        List<Route> list = new ArrayList<>();
        String sql = "SELECT route_id, route_number, operator, transport_type, is_recommended, is_disrupted, disruption_tag, fare, fare_formatted, duration_mins, departs_in_mins, departure_clock, platform, stop_count, transfers, transfer_text, crowd_level, crowd_text, crowd_badge_class, status, status_text, co2_saved_kg, reliability_pct, active_vehicle, description FROM routes ORDER BY route_id ASC";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Route r = new Route();
                r.setRouteId(rs.getInt("route_id"));
                r.setRouteNumber(rs.getString("route_number"));
                r.setOperator(rs.getString("operator"));
                r.setTransportType(rs.getString("transport_type"));
                r.setRecommended(rs.getBoolean("is_recommended"));
                r.setDisrupted(rs.getBoolean("is_disrupted"));
                r.setDisruptionTag(rs.getString("disruption_tag"));
                r.setFare(rs.getDouble("fare"));
                r.setFareFormatted(rs.getString("fare_formatted"));
                r.setDurationMins(rs.getInt("duration_mins"));
                r.setDepartsInMins(rs.getInt("departs_in_mins"));
                r.setDepartureClock(rs.getString("departure_clock"));
                r.setPlatform(rs.getString("platform"));
                r.setStopCount(rs.getInt("stop_count"));
                r.setTransfers(rs.getInt("transfers"));
                r.setTransferText(rs.getString("transfer_text"));
                r.setCrowdLevel(rs.getString("crowd_level"));
                r.setCrowdText(rs.getString("crowd_text"));
                r.setCrowdBadgeClass(rs.getString("crowd_badge_class"));
                r.setStatus(rs.getString("status"));
                r.setStatusText(rs.getString("status_text"));
                r.setCo2SavedKg(rs.getDouble("co2_saved_kg"));
                r.setReliabilityPct(rs.getDouble("reliability_pct"));
                r.setActiveVehicle(rs.getString("active_vehicle"));
                r.setDescription(rs.getString("description"));
                list.add(r);
            }
            if (!list.isEmpty()) return list;
        } catch (Exception e) {
            System.err.println("MySQL getAllRoutes failed (" + e.getMessage() + "), using fallback.");
        }
        return fallbackRepo.getAllRoutes();
    }

    @Override
    public Route getRouteById(int routeId) {
        for (Route r : getAllRoutes()) {
            if (r.getRouteId() == routeId) return r;
        }
        return null;
    }

    @Override
    public List<RouteStop> getRouteStops(int routeId) {
        List<RouteStop> list = new ArrayList<>();
        String sql = "SELECT route_id, sequence, stop_id, stop_name, subtext, scheduled_time, actual_time, status, status_tag, is_next, is_terminus, delay_delta, subway_connection FROM route_stops WHERE route_id = ? ORDER BY sequence ASC";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, routeId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    RouteStop rsItem = new RouteStop();
                    rsItem.setRouteId(rs.getInt("route_id"));
                    rsItem.setSequence(rs.getInt("sequence"));
                    rsItem.setStopId(rs.getInt("stop_id"));
                    rsItem.setStopName(rs.getString("stop_name"));
                    rsItem.setSubtext(rs.getString("subtext"));
                    rsItem.setScheduledTime(rs.getString("scheduled_time"));
                    rsItem.setActualTime(rs.getString("actual_time"));
                    rsItem.setStatus(rs.getString("status"));
                    rsItem.setStatusTag(rs.getString("status_tag"));
                    rsItem.setNext(rs.getBoolean("is_next"));
                    rsItem.setTerminus(rs.getBoolean("is_terminus"));
                    rsItem.setDelayDelta(rs.getString("delay_delta"));
                    rsItem.setSubwayConnection(rs.getString("subway_connection"));
                    list.add(rsItem);
                }
            }
            if (!list.isEmpty()) return list;
        } catch (Exception e) {
            System.err.println("MySQL getRouteStops failed, using fallback.");
        }
        return fallbackRepo.getRouteStops(routeId);
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        List<Vehicle> list = new ArrayList<>();
        String sql = "SELECT vehicle_id, vehicle_number, route_number, vehicle_type, model, current_speed_kmh, heading_degrees, heading_direction, capacity_max, capacity_current, occupancy_pct, occupancy_tier, occupancy_label, climate_celsius, accessibility_status, connectivity, odometer_km, battery_state_pct, operator_name, driver_name, latitude, longitude, corridor_status FROM vehicles ORDER BY vehicle_id ASC";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Vehicle v = new Vehicle();
                v.setVehicleId(rs.getInt("vehicle_id"));
                v.setVehicleNumber(rs.getString("vehicle_number"));
                v.setRouteNumber(rs.getString("route_number"));
                v.setVehicleType(rs.getString("vehicle_type"));
                v.setModel(rs.getString("model"));
                v.setCurrentSpeedKmh(rs.getDouble("current_speed_kmh"));
                v.setHeadingDegrees(rs.getInt("heading_degrees"));
                v.setHeadingDirection(rs.getString("heading_direction"));
                v.setCapacityMax(rs.getInt("capacity_max"));
                v.setCapacityCurrent(rs.getInt("capacity_current"));
                v.setOccupancyPct(rs.getInt("occupancy_pct"));
                v.setOccupancyTier(rs.getString("occupancy_tier"));
                v.setOccupancyLabel(rs.getString("occupancy_label"));
                v.setClimateCelsius(rs.getDouble("climate_celsius"));
                v.setAccessibilityStatus(rs.getString("accessibility_status"));
                v.setConnectivity(rs.getString("connectivity"));
                v.setOdometerKm(rs.getDouble("odometer_km"));
                v.setBatteryStatePct(rs.getInt("battery_state_pct"));
                v.setOperatorName(rs.getString("operator_name"));
                v.setDriverName(rs.getString("driver_name"));
                v.setLatitude(rs.getDouble("latitude"));
                v.setLongitude(rs.getDouble("longitude"));
                v.setCorridorStatus(rs.getString("corridor_status"));
                list.add(v);
            }
            if (!list.isEmpty()) return list;
        } catch (Exception e) {
            System.err.println("MySQL getAllVehicles failed, using fallback.");
        }
        return fallbackRepo.getAllVehicles();
    }

    @Override
    public Vehicle getVehicleById(int vehicleId) {
        for (Vehicle v : getAllVehicles()) {
            if (v.getVehicleId() == vehicleId) return v;
        }
        return null;
    }

    @Override
    public List<Incident> getAllIncidents() {
        List<Incident> list = new ArrayList<>();
        String sql = "SELECT incident_id, vehicle_id, route_number, severity, status, reported_ago, passenger_consensus, headline, crowd_density, congestion_spike_speed, assigned_driver, location, verified FROM incidents ORDER BY incident_id DESC";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Incident inc = new Incident();
                inc.setIncidentId(rs.getInt("incident_id"));
                inc.setVehicleId(rs.getInt("vehicle_id"));
                inc.setRouteNumber(rs.getString("route_number"));
                inc.setSeverity(rs.getString("severity"));
                inc.setStatus(rs.getString("status"));
                inc.setReportedAgo(rs.getString("reported_ago"));
                inc.setPassengerConsensus(rs.getString("passenger_consensus"));
                inc.setHeadline(rs.getString("headline"));
                inc.setCrowdDensity(rs.getString("crowd_density"));
                inc.setCongestionSpikeSpeed(rs.getString("congestion_spike_speed"));
                inc.setAssignedDriver(rs.getString("assigned_driver"));
                inc.setLocation(rs.getString("location"));
                inc.setVerified(rs.getBoolean("verified"));
                list.add(inc);
            }
            if (!list.isEmpty()) return list;
        } catch (Exception e) {
            System.err.println("MySQL getAllIncidents failed, using fallback.");
        }
        return fallbackRepo.getAllIncidents();
    }

    @Override
    public Incident getIncidentById(int incidentId) {
        for (Incident inc : getAllIncidents()) {
            if (inc.getIncidentId() == incidentId) return inc;
        }
        return null;
    }

    @Override
    public boolean verifyIncident(int incidentId) {
        String sql = "UPDATE incidents SET verified = TRUE, status = 'VERIFIED_ALERT' WHERE incident_id = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, incidentId);
            int rows = ps.executeUpdate();
            if (rows > 0) return true;
        } catch (Exception e) {
            System.err.println("MySQL verifyIncident failed, using fallback.");
        }
        return fallbackRepo.verifyIncident(incidentId);
    }

    @Override
    public boolean dismissIncident(int incidentId) {
        String sql = "UPDATE incidents SET status = 'DISMISSED' WHERE incident_id = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, incidentId);
            int rows = ps.executeUpdate();
            if (rows > 0) return true;
        } catch (Exception e) {
            System.err.println("MySQL dismissIncident failed, using fallback.");
        }
        return fallbackRepo.dismissIncident(incidentId);
    }

    @Override
    public UserReport saveUserReport(UserReport report) {
        String sql = "INSERT INTO user_reports (route_number, stop_name, crowd_level, delay_minutes, causes, comment, reported_timestamp, upvotes) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, report.getRouteNumber());
            ps.setString(2, report.getStopName());
            ps.setString(3, report.getCrowdLevel());
            ps.setInt(4, report.getDelayMinutes());
            ps.setString(5, report.getCauses() != null ? String.join(",", report.getCauses()) : "");
            ps.setString(6, report.getComment());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    report.setReportId(rs.getInt(1));
                }
            }
            report.setTimestamp("Just now");
            return report;
        } catch (Exception e) {
            System.err.println("MySQL saveUserReport failed, using fallback.");
        }
        return fallbackRepo.saveUserReport(report);
    }

    @Override
    public List<UserReport> getAllUserReports() {
        return fallbackRepo.getAllUserReports();
    }

    @Override
    public Map<String, Object> getAnalytics() {
        return fallbackRepo.getAnalytics();
    }

    @Override
    public Map<String, Object> runSimulation(int standbyBuses, int signalSeconds, boolean offPeakFare) {
        return fallbackRepo.runSimulation(standbyBuses, signalSeconds, offPeakFare);
    }

    @Override
    public String getDataSourceMode() {
        return "MySQL (Workbench Connection: " + url + ")";
    }
}
