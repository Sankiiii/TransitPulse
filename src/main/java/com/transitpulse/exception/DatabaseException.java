package com.transitpulse.exception;

public class DatabaseException extends TransitPulseException {
    public DatabaseException(String message, Throwable cause) {
        super(message, cause, 500, "DATABASE_ERROR");
    }

    public DatabaseException(String message) {
        super(message, 500, "DATABASE_ERROR");
    }
}
