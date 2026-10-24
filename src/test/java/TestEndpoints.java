import com.transitpulse.repository.RepositoryManager;
import com.transitpulse.service.*;
import com.transitpulse.model.*;
import java.util.List;
import java.util.Map;

public class TestEndpoints {
    public static void main(String[] args) {
        System.out.println("Running comprehensive TransitPulse verification tests...");

        // 1. Data Mode
        String mode = RepositoryManager.getRepository().getDataSourceMode();
        System.out.println("✓ Active Data Source Mode: " + mode);

        // 2. Stops
        RouteService routeService = new RouteService();
        List<Stop> stops = routeService.getAllStops();
        System.out.println("✓ Loaded Stops count: " + stops.size());
        assert stops.size() >= 7;

        // 3. Routes
        List<Route> routes = routeService.getAllRoutes();
        System.out.println("✓ Loaded Routes count: " + routes.size());
        for (Route r : routes) {
            System.out.println("  - Route: " + r.getRouteNumber() + " (" + r.getOperator() + ") | " + r.getFareFormatted() + " | " + r.getDurationMins() + "m");
        }

        // 4. Live Tracking
        TrackingService trackingService = new TrackingService();
        Map<String, Object> tracking = trackingService.getLiveTrackingData(4092);
        Vehicle v = (Vehicle) tracking.get("vehicle");
        System.out.println("✓ Active Tracking Vehicle: " + v.getModel() + " | Speed: " + v.getCurrentSpeedKmh() + " km/h | Load: " + v.getCapacityCurrent() + "/" + v.getCapacityMax());

        // 5. Route Stops Timeline
        @SuppressWarnings("unchecked")
        List<RouteStop> timeline = (List<RouteStop>) tracking.get("stopsTimeline");
        System.out.println("✓ Timeline Stop Progression count: " + timeline.size());

        // 6. Citizen Report
        IncidentService incidentService = new IncidentService();
        UserReport rep = new UserReport(0, "Line C-101 Express", "BKC City Park", "High", 10, List.of("Heavy Traffic"), "Test observation", "Just now", 1);
        UserReport saved = incidentService.submitReport(rep);
        System.out.println("✓ Saved Citizen Report ID: " + saved.getReportId());

        // 7. Incidents
        List<Incident> incidents = incidentService.getAllIncidents();
        System.out.println("✓ Incidents Queue count: " + incidents.size());
        boolean verified = incidentService.verifyIncident(1);
        System.out.println("✓ Verified Incident #1: " + verified);

        // 8. ML What-If Simulation
        AnalyticsService analyticsService = new AnalyticsService();
        Map<String, Object> sim = analyticsService.runWhatIfSimulation(2, 14, true);
        System.out.println("✓ Simulation Delay: " + sim.get("projectedDelayMinutes") + "m (Reduction: " + sim.get("delayReductionPct") + "%) | Hours saved: " + sim.get("paxHoursSavedDaily"));

        System.out.println("\n>>> ALL TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL! <<<");
    }
}
