package com.transitpulse.exception;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String path;
    private String timestamp;
    private List<String> suggestions = new ArrayList<>();

    public ErrorResponse() {
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(String error, String message, int status, String path) {
        this.error = error;
        this.message = message;
        this.status = status;
        this.path = path;
        this.timestamp = Instant.now().toString();
    }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public void addSuggestion(String suggestion) {
        if (this.suggestions == null) this.suggestions = new ArrayList<>();
        this.suggestions.add(suggestion);
    }
}
