package com.transitpulse.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.transitpulse.exception.*;
import com.transitpulse.model.*;
import com.transitpulse.repository.RepositoryManager;
import com.transitpulse.service.*;
import com.transitpulse.util.ConfigUtils;
import com.transitpulse.util.JsonUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ApiController implements HttpHandler {

    private final RouteService routeService = new RouteService();
    private final TrackingService trackingService = new TrackingService();
    private final IncidentService incidentService = new IncidentService();
    private final AnalyticsService analyticsService = new AnalyticsService();
    private final GeminiService geminiService = new GeminiService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getQuery();
        Map<String, String> params = parseQuery(query);

        // Standard CORS and response headers
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            if (path.equals("/api/system/status") && "GET".equals(method)) {
                handleSystemStatus(exchange);
            } else if (path.equals("/api/stops") && "GET".equals(method)) {
                sendJsonResponse(exchange, 200, routeService.getAllStops());
            } else if (path.equals("/api/routes") && "GET".equals(method)) {
                String pref = params.get("preference");
                String origin = params.get("origin");
                String destination = params.get("destination");
                String mode = params.get("mode");
                if ((pref != null && !pref.trim().isEmpty()) || (origin != null && !origin.trim().isEmpty()) || (destination != null && !destination.trim().isEmpty()) || (mode != null && !mode.trim().isEmpty())) {
                    sendJsonResponse(exchange, 200, routeService.searchRoutes(origin, destination, pref != null ? pref.trim() : "", mode));
                } else {
                    sendJsonResponse(exchange, 200, routeService.getAllRoutes());
                }
            } else if (path.equals("/api/ai/advisor") && "GET".equals(method)) {
                String origin = params.get("origin");
                String destination = params.get("destination");
                String advice = geminiService.getCommuteAdvice(origin, destination);
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("status", "SUCCESS");
                result.put("origin", origin != null ? origin : "SNDT University Juhu");
                result.put("destination", destination != null ? destination : "Vivekanand College (VESIT)");
                result.put("model", "gemini-3.8-flash");
                result.put("advisory", advice);
                sendJsonResponse(exchange, 200, result);
            } else if (path.equals("/api/ai/chat") && ("GET".equals(method) || "POST".equals(method))) {
                handleAiChat(exchange, method, params);
            } else if (path.startsWith("/api/routes/") && path.endsWith("/stops") && "GET".equals(method)) {
                handleRouteStops(exchange, path);
            } else if (path.startsWith("/api/routes/") && "GET".equals(method)) {
                handleRouteDetails(exchange, path);
            } else if (path.equals("/api/tracking") && "GET".equals(method)) {
                handleTracking(exchange, params);
            } else if (path.equals("/api/vehicles") && "GET".equals(method)) {
                sendJsonResponse(exchange, 200, trackingService.getAllVehicles());
            } else if (path.equals("/api/incidents") && "GET".equals(method)) {
                sendJsonResponse(exchange, 200, incidentService.getAllIncidents());
            } else if (path.equals("/api/admin/kpis") && "GET".equals(method)) {
                sendJsonResponse(exchange, 200, incidentService.getAdminKpis());
            } else if (path.equals("/api/incidents/report") && "POST".equals(method)) {
                handleCitizenReport(exchange);
            } else if (path.matches("^/api/incidents/\\d+/verify$") && "POST".equals(method)) {
                handleVerifyIncident(exchange, path);
            } else if (path.matches("^/api/incidents/\\d+/dismiss$") && "POST".equals(method)) {
                handleDismissIncident(exchange, path);
            } else if (path.equals("/api/reports") && "GET".equals(method)) {
                sendJsonResponse(exchange, 200, incidentService.getAllUserReports());
            } else if (path.equals("/api/analytics") && "GET".equals(method)) {
                sendJsonResponse(exchange, 200, analyticsService.getHistoricalAnalytics());
            } else if (path.equals("/api/analytics/simulate") && "POST".equals(method)) {
                handleSimulation(exchange);
            } else if (path.equals("/api/export") && "GET".equals(method)) {
                handleExportData(exchange);
            } else {
                throw new ResourceNotFoundException("The requested API endpoint [" + path + "] does not exist.");
            }
        } catch (TransitPulseException tpe) {
            handleCustomException(exchange, tpe, path);
        } catch (Exception ex) {
            handleGenericException(exchange, ex, path);
        }
    }

    private void handleRouteDetails(HttpExchange exchange, String path) throws IOException {
        String[] parts = path.split("/");
        if (parts.length < 4) {
            throw new BadRequestException("Route ID must be specified in the format /api/routes/{id}");
        }
        int routeId;
        try {
            routeId = Integer.parseInt(parts[3]);
        } catch (NumberFormatException e) {
            throw new BadRequestException("routeId", "Must be a valid integer number (e.g. 101, 202, 303)");
        }
        Route r = routeService.getRouteById(routeId);
        if (r == null) {
            ResourceNotFoundException rnf = new ResourceNotFoundException("Route", routeId);
            sendCustomError(exchange, 404, "NOT_FOUND", rnf.getMessage(), path, List.of("Try Route 101 (Line C-101 Express)", "Try Route 202 (Metro Line 3)", "Try Route 303 (Shuttle A1)"));
            return;
        }
        sendJsonResponse(exchange, 200, r);
    }

    private void handleRouteStops(HttpExchange exchange, String path) throws IOException {
        String[] parts = path.split("/");
        int routeId;
        try {
            routeId = Integer.parseInt(parts[3]);
        } catch (NumberFormatException e) {
            throw new BadRequestException("routeId", "Must be a valid integer number (e.g. 101)");
        }
        List<RouteStop> stops = routeService.getRouteStops(routeId);
        if (stops == null || stops.isEmpty()) {
            ResourceNotFoundException rnf = new ResourceNotFoundException("Stops for Route ID", routeId);
            sendCustomError(exchange, 404, "NOT_FOUND", rnf.getMessage(), path, List.of("Line C-101 (ID 101) has full progression stops configured."));
            return;
        }
        sendJsonResponse(exchange, 200, stops);
    }

    private void handleTracking(HttpExchange exchange, Map<String, String> params) throws IOException {
        int vehicleId = 4092;
        if (params.get("vehicleId") != null) {
            try {
                vehicleId = Integer.parseInt(params.get("vehicleId"));
            } catch (NumberFormatException e) {
                throw new BadRequestException("vehicleId", "Must be an integer vehicle number (e.g. 4092)");
            }
        }
        Map<String, Object> trackingData = trackingService.getLiveTrackingData(vehicleId);
        sendJsonResponse(exchange, 200, trackingData);
    }

    private void handleVerifyIncident(HttpExchange exchange, String path) throws IOException {
        String[] parts = path.split("/");
        int incId;
        try {
            incId = Integer.parseInt(parts[3]);
        } catch (NumberFormatException e) {
            throw new BadRequestException("incidentId", "Must be an integer incident ID");
        }
        boolean ok = incidentService.verifyIncident(incId);
        if (!ok) {
            throw new ResourceNotFoundException("Incident", incId);
        }
        sendJsonResponse(exchange, 200, Map.of(
            "success", true,
            "incidentId", incId,
            "status", "VERIFIED_ALERT",
            "message", "Incident #" + incId + " verified and broadcasted across Mumbai transit channels."
        ));
    }

    private void handleDismissIncident(HttpExchange exchange, String path) throws IOException {
        String[] parts = path.split("/");
        int incId;
        try {
            incId = Integer.parseInt(parts[3]);
        } catch (NumberFormatException e) {
            throw new BadRequestException("incidentId", "Must be an integer incident ID");
        }
        boolean ok = incidentService.dismissIncident(incId);
        if (!ok) {
            throw new ResourceNotFoundException("Incident", incId);
        }
        sendJsonResponse(exchange, 200, Map.of(
            "success", true,
            "incidentId", incId,
            "status", "DISMISSED",
            "message", "Incident #" + incId + " has been dismissed from operations queue."
        ));
    }

    private void handleSystemStatus(HttpExchange exchange) throws IOException {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("systemName", "TransitPulse Smart Transit Server");
        status.put("version", "1.0.0-MCA-MUMBAI");
        status.put("status", "ONLINE_OPERATIONAL");
        status.put("uptime", "Active");
        status.put("dataSourceMode", RepositoryManager.getRepository().getDataSourceMode());
        status.put("configuredMode", ConfigUtils.getMode());
        status.put("mumbaiMetroLine", "Line 3 Aqua (Colaba-Bandra-SEEPZ)");
        status.put("bestCorridor", "Line C-101 Express (Dadar to CSMIA T2)");
        status.put("serverPort", ConfigUtils.getInt("server.port", 8080));
        sendJsonResponse(exchange, 200, status);
    }

    @SuppressWarnings("unchecked")
    private void handleCitizenReport(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        if (body == null || body.trim().isEmpty()) {
            throw new BadRequestException("Request body cannot be empty. JSON object required.");
        }

        Map<String, Object> req;
        try {
            req = JsonUtils.parseJsonMap(body);
        } catch (Exception e) {
            throw new BadRequestException("Malformed JSON format in request body: " + e.getMessage());
        }

        if (req == null || req.isEmpty()) {
            throw new BadRequestException("Payload cannot be empty.");
        }

        // Field Validations
        String routeNumber = (String) req.get("routeNumber");
        if (routeNumber == null || routeNumber.trim().isEmpty()) {
            routeNumber = "Line C-101 Express";
        }

        String stopName = (String) req.get("stopName");
        if (stopName == null || stopName.trim().isEmpty()) {
            stopName = "BKC City Park";
        }

        String crowdLevel = (String) req.get("crowdLevel");
        if (crowdLevel == null || crowdLevel.trim().isEmpty()) {
            crowdLevel = "Moderate";
        }

        int delayMinutes = 5;
        if (req.get("delayMinutes") != null) {
            try {
                delayMinutes = ((Number) req.get("delayMinutes")).intValue();
                if (delayMinutes < -30 || delayMinutes > 180) {
                    throw new BadRequestException("delayMinutes", "Must be between -30 and 180 minutes");
                }
            } catch (ClassCastException e) {
                throw new BadRequestException("delayMinutes", "Must be an integer number");
            }
        }

        List<String> causes;
        if (req.get("causes") instanceof List) {
            causes = (List<String>) req.get("causes");
        } else {
            causes = List.of("Heavy Traffic");
        }

        String comment = (String) req.get("comment");
        if (comment != null && comment.length() > 500) {
            comment = comment.substring(0, 500);
        }

        UserReport report = new UserReport();
        report.setRouteNumber(routeNumber.trim());
        report.setStopName(stopName.trim());
        report.setCrowdLevel(crowdLevel.trim());
        report.setDelayMinutes(delayMinutes);
        report.setCauses(causes);
        report.setComment(comment != null ? comment.trim() : "");

        UserReport saved = incidentService.submitReport(report);

        sendJsonResponse(exchange, 201, Map.of(
            "success", true,
            "message", "Crowdsource report verified and recorded into transit pulse stream",
            "report", saved
        ));
    }

    private void handleSimulation(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        Map<String, Object> req;
        try {
            req = (body != null && !body.trim().isEmpty()) ? JsonUtils.parseJsonMap(body) : new HashMap<>();
        } catch (Exception e) {
            throw new BadRequestException("Invalid simulation parameters JSON: " + e.getMessage());
        }

        int standbyBuses = 2;
        int signalSeconds = 14;
        boolean offPeakFare = true;

        if (req.get("standbyBuses") != null) {
            try {
                standbyBuses = ((Number) req.get("standbyBuses")).intValue();
                if (standbyBuses < 0 || standbyBuses > 10) {
                    throw new BadRequestException("standbyBuses", "Must be between 0 and 10 buses");
                }
            } catch (ClassCastException e) {
                throw new BadRequestException("standbyBuses", "Must be a numeric integer value");
            }
        }

        if (req.get("signalSeconds") != null) {
            try {
                signalSeconds = ((Number) req.get("signalSeconds")).intValue();
                if (signalSeconds < 0 || signalSeconds > 60) {
                    throw new BadRequestException("signalSeconds", "Must be between 0 and 60 seconds");
                }
            } catch (ClassCastException e) {
                throw new BadRequestException("signalSeconds", "Must be a numeric integer value");
            }
        }

        if (req.get("offPeakFare") != null) {
            offPeakFare = Boolean.TRUE.equals(req.get("offPeakFare"));
        }

        Map<String, Object> result = analyticsService.runWhatIfSimulation(standbyBuses, signalSeconds, offPeakFare);
        sendJsonResponse(exchange, 200, result);
    }

    private void handleAiChat(HttpExchange exchange, String method, Map<String, String> params) throws IOException {
        String message = null;
        String origin = null;
        String destination = null;
        String plan = null;

        if ("POST".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            if (body != null && !body.trim().isEmpty()) {
                try {
                    Map<String, Object> req = JsonUtils.parseJsonMap(body);
                    if (req != null) {
                        message = (String) req.get("message");
                        origin = (String) req.get("origin");
                        destination = (String) req.get("destination");
                        plan = (String) req.get("plan");
                    }
                } catch (Exception ignored) {}
            }
        }

        if (message == null || message.trim().isEmpty()) {
            message = params.get("q");
            if (message == null || message.trim().isEmpty()) {
                message = params.get("message");
            }
        }
        if (origin == null) origin = params.get("origin");
        if (destination == null) destination = params.get("destination");
        if (plan == null) plan = params.get("plan");

        Map<String, Object> aiResponse = geminiService.askCopilot(message, origin, destination, plan);
        sendJsonResponse(exchange, 200, aiResponse);
    }

    private void handleExportData(HttpExchange exchange) throws IOException {
        Map<String, Object> fullExport = new LinkedHashMap<>();
        fullExport.put("exportTimestamp", java.time.Instant.now().toString());
        fullExport.put("region", "Mumbai Metropolitan Region (MMR)");
        fullExport.put("dataSource", RepositoryManager.getRepository().getDataSourceMode());
        fullExport.put("stops", routeService.getAllStops());
        fullExport.put("routes", routeService.getAllRoutes());
        fullExport.put("vehicles", trackingService.getAllVehicles());
        fullExport.put("incidents", incidentService.getAllIncidents());
        fullExport.put("userReports", incidentService.getAllUserReports());
        fullExport.put("analytics", analyticsService.getHistoricalAnalytics());

        sendJsonResponse(exchange, 200, fullExport);
    }

    // --- Structured Error Handlers ---

    private void handleCustomException(HttpExchange exchange, TransitPulseException tpe, String path) throws IOException {
        ErrorResponse err = new ErrorResponse(tpe.getErrorName(), tpe.getMessage(), tpe.getStatusCode(), path);
        if (tpe instanceof ResourceNotFoundException) {
            err.addSuggestion("Check spelling of identifiers or query /api/routes and /api/stops for valid resources.");
        }
        sendErrorResponse(exchange, tpe.getStatusCode(), err);
    }

    private void handleGenericException(HttpExchange exchange, Exception ex, String path) throws IOException {
        System.err.println("Unhandled server exception at " + path + ": " + ex.getMessage());
        ex.printStackTrace();
        ErrorResponse err = new ErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred: " + ex.getMessage(), 500, path);
        err.addSuggestion("Please review server console logs or verify the database connection configuration in application.properties.");
        sendErrorResponse(exchange, 500, err);
    }

    private void sendCustomError(HttpExchange exchange, int status, String error, String msg, String path, List<String> suggestions) throws IOException {
        ErrorResponse err = new ErrorResponse(error, msg, status, path);
        if (suggestions != null) {
            for (String s : suggestions) err.addSuggestion(s);
        }
        sendErrorResponse(exchange, status, err);
    }

    private void sendErrorResponse(HttpExchange exchange, int statusCode, ErrorResponse err) throws IOException {
        String json = JsonUtils.toJson(err);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        String json = JsonUtils.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buf = new byte[1024];
        int len;
        while ((len = is.read(buf)) != -1) {
            baos.write(buf, 0, len);
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    private Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                try {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    map.put(key, val);
                } catch (Exception ignored) {}
            }
        }
        return map;
    }
}
