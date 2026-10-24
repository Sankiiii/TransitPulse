package com.transitpulse.exception;

public class ResourceNotFoundException extends TransitPulseException {
    public ResourceNotFoundException(String resourceType, Object identifier) {
        super(resourceType + " with identifier [" + identifier + "] was not found.", 404, "NOT_FOUND");
    }

    public ResourceNotFoundException(String message) {
        super(message, 404, "NOT_FOUND");
    }
}
