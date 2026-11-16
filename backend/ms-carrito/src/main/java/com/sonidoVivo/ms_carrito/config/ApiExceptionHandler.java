package com.sonidoVivo.ms_carrito.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

// Devuelve los errores como { "mensaje": "...", "errores": { campo: texto } }, el mismo formato
// que usan los otros microservicios, para que el frontend pueda mostrarlos tal cual.
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> estado(ResponseStatusException e) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();

        cuerpo.put("mensaje", e.getReason() != null ? e.getReason() : "No se pudo completar la operación.");
        cuerpo.put("errores", Map.of());
        return ResponseEntity.status(e.getStatusCode()).body(cuerpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException e) {
        Map<String, String> errores = new LinkedHashMap<>();

        e.getBindingResult().getFieldErrors()
                .forEach(f -> errores.putIfAbsent(f.getField(), f.getDefaultMessage()));

        Map<String, Object> cuerpo = new LinkedHashMap<>();

        cuerpo.put("mensaje", errores.values().stream().findFirst().orElse("Hay datos que no son válidos."));
        cuerpo.put("errores", errores);
        return ResponseEntity.badRequest().body(cuerpo);
    }
}
