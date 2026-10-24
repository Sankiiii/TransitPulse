package com.transitpulse.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.file.Files;

public class StaticFileController implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.isEmpty() || path.equals("/")) {
                path = "/index.html";
            }

            // Security check against directory traversal and null bytes
            if (path.contains("..") || path.contains("\0")) {
                sendError(exchange, 403, "Access Denied: Invalid path pattern.");
                return;
            }

            byte[] content = null;
            File file = new File("src/main/resources/static" + path);
            if (file.exists() && file.isFile()) {
                content = Files.readAllBytes(file.toPath());
            } else {
                // Fallback to classpath
                String resourcePath = "static" + path;
                try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
                    if (is != null) {
                        content = is.readAllBytes();
                    }
                }
            }

            // SPA Fallback: if not found and does not look like an asset file (css/js/png), serve index.html
            if (content == null && !path.contains(".")) {
                File indexFile = new File("src/main/resources/static/index.html");
                if (indexFile.exists()) {
                    content = Files.readAllBytes(indexFile.toPath());
                    path = "/index.html";
                }
            }

            if (content == null) {
                sendError(exchange, 404, "404 Not Found: Static resource [" + path + "] does not exist.");
                return;
            }

            String mimeType = getMimeType(path);
            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache, no-store, must-revalidate");
            exchange.sendResponseHeaders(200, content.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(content);
            }
        } catch (Exception e) {
            System.err.println("StaticFileController error: " + e.getMessage());
            sendError(exchange, 500, "Internal Server Error serving static file: " + e.getMessage());
        }
    }

    private String getMimeType(String path) {
        if (path.endsWith(".html")) return "text/html; charset=UTF-8";
        if (path.endsWith(".css")) return "text/css; charset=UTF-8";
        if (path.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (path.endsWith(".json")) return "application/json; charset=UTF-8";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }

    private void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] bytes = message.getBytes();
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
