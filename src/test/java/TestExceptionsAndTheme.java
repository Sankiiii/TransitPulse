import com.transitpulse.controller.ApiController;
import com.transitpulse.exception.*;
import com.transitpulse.repository.RepositoryManager;
import com.transitpulse.service.*;
import com.transitpulse.model.*;
import java.util.Map;

public class TestExceptionsAndTheme {
    public static void main(String[] args) {
        System.out.println("Starting Exception Handling & Validation Suite...");

        // 1. Test ResourceNotFoundException
        ResourceNotFoundException rnf = new ResourceNotFoundException("Route", 999);
        assert rnf.getStatusCode() == 404;
        assert "NOT_FOUND".equals(rnf.getErrorName());
        System.out.println("✓ ResourceNotFoundException validated: " + rnf.getMessage());

        // 2. Test BadRequestException
        BadRequestException bre = new BadRequestException("delayMinutes", "Must be between -30 and 180");
        assert bre.getStatusCode() == 400;
        assert "VALIDATION_ERROR".equals(bre.getErrorName());
        System.out.println("✓ BadRequestException validated: " + bre.getMessage());

        // 3. Test DatabaseException
        DatabaseException dbe = new DatabaseException("MySQL timeout", new RuntimeException("Socket error"));
        assert dbe.getStatusCode() == 500;
        System.out.println("✓ DatabaseException validated: " + dbe.getMessage());

        // 4. Test ErrorResponse serialization
        ErrorResponse err = new ErrorResponse("NOT_FOUND", "Route with identifier [999] was not found.", 404, "/api/routes/999");
        err.addSuggestion("Try route 101, 202, or 303");
        assert err.getStatus() == 404;
        assert err.getSuggestions().size() == 1;
        System.out.println("✓ ErrorResponse formatted: status=" + err.getStatus() + ", error=" + err.getError());

        // 5. Test Export Dataset
        RouteService routeService = new RouteService();
        TrackingService trackingService = new TrackingService();
        IncidentService incidentService = new IncidentService();
        AnalyticsService analyticsService = new AnalyticsService();

        assert !routeService.getAllRoutes().isEmpty();
        assert !trackingService.getAllVehicles().isEmpty();
        assert !incidentService.getAllIncidents().isEmpty();
        assert !analyticsService.getHistoricalAnalytics().isEmpty();

        System.out.println("✓ Export dataset complete: routes=" + routeService.getAllRoutes().size() +
                           ", vehicles=" + trackingService.getAllVehicles().size() +
                           ", incidents=" + incidentService.getAllIncidents().size());

        // 6. Test Origin and Destination Collision Validation
        boolean collisionCaught = false;
        try {
            routeService.searchRoutes("Dadar Central", "Dadar Central", null, null);
        } catch (BadRequestException ex) {
            collisionCaught = true;
            System.out.println("✓ Origin/Destination Collision caught: " + ex.getMessage());
        }
        assert collisionCaught : "Collision exception should be thrown when origin == destination!";

        // 7. Test Gemini Copilot Service
        GeminiService geminiService = new GeminiService();
        Map<String, Object> copilotRes = geminiService.askCopilot("How to go to Airport T2?", "Dadar", "Airport");
        assert "SUCCESS".equals(copilotRes.get("status"));
        assert copilotRes.get("response") != null && !((String) copilotRes.get("response")).isEmpty();
        System.out.println("✓ PulseAI Gemini Copilot response verified: " + copilotRes.get("model") + " | " + copilotRes.get("provider"));

        System.out.println("\n>>> ALL EXCEPTION AND VALIDATION TESTS PASSED 100%! <<<");
    }
}
