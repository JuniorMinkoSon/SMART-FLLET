package com.smartfleet.smartfleet.exception;

import com.smartfleet.smartfleet.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        ErrorResponse error = new ErrorResponse(
            ex.getCode(), ex.getMessage(), ex.getHttpStatus(), LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.valueOf(ex.getHttpStatus()));
    }

    /**
     * Conflit d'affectation (anti-overbooking) : 409 + detail des missions en
     * conflit et engins alternatifs, pour que le frontend guide l'utilisateur.
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", ex.getCode());
        body.put("message", ex.getMessage());
        body.put("status", 409);
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("conflicts", ex.getConflicts());
        body.put("alternatives", ex.getAlternatives());
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    /**
     * Autorisation refusee -> 403 (et non 500 comme auparavant, ni 401 :
     * le frontend doit pouvoir distinguer "session expiree" de "acces interdit").
     */
    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ErrorResponse> handleAccessDenied(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            "FORBIDDEN",
            "Vous n'avez pas les droits necessaires pour cette action.",
            403, LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        ErrorResponse error = new ErrorResponse(
            "UNAUTHENTICATED", "Authentification requise.", 401, LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().stream()
            .map(e -> {
                String field = e instanceof org.springframework.validation.FieldError fe
                    ? fe.getField() + " : " : "";
                return field + e.getDefaultMessage();
            })
            .findFirst()
            .orElse("Validation echouee");

        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR", message, 400, LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        // Trace cote serveur, message generique cote client (pas de fuite d'info).
        log.error("Erreur non geree", ex);
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR", "Erreur interne du serveur", 500, LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
