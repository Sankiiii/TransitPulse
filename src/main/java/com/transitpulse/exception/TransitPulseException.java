package com.transitpulse.exception;

public class TransitPulseException extends RuntimeException {
    private final int statusCode;
    private final String errorName;

    public TransitPulseException(String message, int statusCode, String errorName) {
        super(message);
        this.statusCode = statusCode;
        this.errorName = errorName;
    }

    public TransitPulseException(String message, Throwable cause, int statusCode, String errorName) {
        super(message, cause);
        this.statusCode = statusCode;
        this.errorName = errorName;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getErrorName() {
        return errorName;
    }
}
