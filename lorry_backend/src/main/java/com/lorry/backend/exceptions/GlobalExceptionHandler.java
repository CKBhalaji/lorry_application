package com.lorry.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        // Log the error message and request details if needed
        // logger.error("Resource not found: {} on request: {}", ex.getMessage(), request.getDescription(false));
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // You can add more exception handlers here for other custom or general exceptions
    // For example, a generic handler for all other exceptions:
    /*
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> globalExceptionHandler(Exception ex, WebRequest request) {
        // logger.error("An unexpected error occurred: {} on request: {}", ex.getMessage(), request.getDescription(false));
        return new ResponseEntity<>("An unexpected internal server error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    */
}
