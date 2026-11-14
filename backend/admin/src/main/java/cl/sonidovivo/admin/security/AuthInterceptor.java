package cl.sonidovivo.admin.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Protege /api/admin/**: exige un JWT válido de auth-service.
 * - ADMINISTRADOR y VENDEDOR pueden usar productos, encargos y dashboard.
 * - Solo ADMINISTRADOR puede gestionar usuarios (clientes y empleados).
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATTR_USUARIO_ID = "usuarioId";
    public static final String ATTR_ROL = "usuarioRol";

    private static final Set<String> ROLES_PANEL = Set.of("ADMINISTRADOR", "VENDEDOR");

    private final JwtService jwt;

    public AuthInterceptor(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true; // preflight de CORS
        }
        String cabecera = request.getHeader("Authorization");
        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            return rechazar(response, 401, "Falta el token de acceso");
        }
        Claims claims;
        try {
            claims = jwt.validar(cabecera.substring(7));
        } catch (JwtException | IllegalArgumentException e) {
            return rechazar(response, 401, "Token inválido o expirado");
        }
        String rol = claims.get("rol", String.class);
        if (rol == null || !ROLES_PANEL.contains(rol)) {
            return rechazar(response, 403, "No tienes permisos para el panel de administración");
        }
        if (request.getRequestURI().startsWith("/api/admin/usuarios") && !"ADMINISTRADOR".equals(rol)) {
            return rechazar(response, 403, "Solo un administrador puede gestionar usuarios");
        }
        request.setAttribute(ATTR_USUARIO_ID, Long.valueOf(claims.getSubject()));
        request.setAttribute(ATTR_ROL, rol);
        return true;
    }

    private boolean rechazar(HttpServletResponse response, int estado, String mensaje) throws IOException {
        response.setStatus(estado);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"mensaje\":\"" + mensaje + "\"}");
        return false;
    }
}
