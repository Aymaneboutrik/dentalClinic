package com.javaguides.auth_service.exception;

import com.javaguides.auth_service.dtos.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        // Logique spécifique pour certains messages d'erreur si besoin
        if (e.getMessage().contains("Non authentifié")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (e.getMessage().contains("Accès refusé") || e.getMessage().contains("Compte verrouillé")) {
            status = HttpStatus.FORBIDDEN;
        } else if (e.getMessage().contains("en envoyée")) {
            status = HttpStatus.ACCEPTED;
        }

        ErrorResponse error = new ErrorResponse(status.value(), e.getMessage());
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            org.springframework.web.bind.MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(java.util.stream.Collectors.joining(", "));

        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), message);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
