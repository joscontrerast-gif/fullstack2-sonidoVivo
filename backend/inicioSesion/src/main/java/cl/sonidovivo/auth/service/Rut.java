package cl.sonidovivo.auth.service;

import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class Rut {

    private Rut() {
    }

    /** Quita puntos y guion, pasa a mayúscula y valida el formato. Devuelve null si viene vacío. */
    static String normalizar(String run) {
        if (run == null || run.isBlank()) {
            return null;
        }
        String limpio = run.replaceAll("[.\\-\\s]", "").toUpperCase(Locale.ROOT);
        if (!limpio.matches("^[0-9]{6,8}[0-9K]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El RUN no es válido");
        }
        return limpio;
    }
}
