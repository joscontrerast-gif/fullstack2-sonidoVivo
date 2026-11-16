package com.sonidoVivo.ms_carrito.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;

// Exige "Authorization: Bearer <jwt>". El "sub" del token debe ser el id_usuario (numérico).
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO = "usuarioId";
    public static final String ATRIBUTO_ROL = "rol";

    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true; // preflight de CORS
        }
        
        String path = request.getRequestURI();
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.equals("/swagger-ui.html")) {
            return true;
        }

        String cabecera = request.getHeader("Authorization");

        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            return rechazar(response, "Falta el token de autenticación.");
        }

        try {
            Claims claims = jwtService.validar(cabecera.substring(7).trim());
            Long usuarioId = Long.valueOf(claims.getSubject());

            request.setAttribute(ATRIBUTO_USUARIO, usuarioId);
            request.setAttribute(ATRIBUTO_ROL, claims.get("rol", String.class));
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // NumberFormatException (sub no numérico) también es IllegalArgumentException
            return rechazar(response, "Token inválido o expirado.");
        }
    }

    private boolean rechazar(HttpServletResponse response, String mensaje) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"status\":401,\"message\":\"" + mensaje + "\"}");
        return false;
    }
}
