package com.dental.patient.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleResourceNotFound_ShouldReturn404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<Object> response = exceptionHandler.handleResourceNotFound(ex, null);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(((Map<?, ?>) response.getBody()).containsKey("timestamp"));
        assertEquals("Not found", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void handleConflict_ShouldReturn409() {
        ConflictException ex = new ConflictException("Conflict");
        ResponseEntity<Object> response = exceptionHandler.handleConflict(ex, null);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Conflict", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void handleBadRequest_ShouldReturn400() {
        BadRequestException ex = new BadRequestException("Bad request");
        ResponseEntity<Object> response = exceptionHandler.handleBadRequest(ex, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Bad request", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void handleValidationExceptions_ShouldReturn400AndFieldErrors() {
        // Arrange
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("objectName", "fieldName", "Invalid field");
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));
        
        MethodParameter methodParameter = mock(MethodParameter.class);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        // Act
        ResponseEntity<Object> response = exceptionHandler.handleValidationExceptions(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertTrue(body.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) body.get("errors");
        assertEquals("Invalid field", errors.get("fieldName"));
    }

    @Test
    void handleIOException_ShouldReturn500() {
        IOException ex = new IOException("IO Error");
        ResponseEntity<Object> response = exceptionHandler.handleIOException(ex, null);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(((Map<?, ?>) response.getBody()).get("message").toString().contains("Erreur lors de la manipulation du fichier"));
    }

    @Test
    void handleGlobalException_ShouldReturn500() {
        Exception ex = new Exception("Global Error");
        ResponseEntity<Object> response = exceptionHandler.handleGlobalException(ex, null);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Une erreur inattendue s'est produite.", ((Map<?, ?>) response.getBody()).get("message"));
        assertEquals("Global Error", ((Map<?, ?>) response.getBody()).get("details"));
    }
}
