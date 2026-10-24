package com.transitpulse.exception;

public class BadRequestException extends TransitPulseException {
    public BadRequestException(String message) {
        super(message, 400, "BAD_REQUEST");
    }

    public BadRequestException(String field, String reason) {
        super("Validation failed for field [" + field + "]: " + reason, 400, "VALIDATION_ERROR");
    }
}
