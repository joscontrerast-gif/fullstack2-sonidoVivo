package cl.sonidovivo.admin.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Protege /api/admin/**:
 * - Permite consultas GET públicas al catálogo de productos y categorías.
 * - Exige un JWT válido de auth-service para el resto de operaciones.
 * - ADMINISTRADOR tiene acceso completo: productos, encargos, dashboard y usuarios.
 * - VENDEDOR gestiona productos (crear, editar, eliminar, precio, stock y stock crítico) y consulta
 *   y cambia el estado de los encargos. No accede al dashboard ni a la gestión de usuarios.
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
        String metodo = request.getMethod();
        String uri = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(metodo)) {
            return true; // preflight de CORS
        }

        // Catálogo público para visitantes y clientes sin sesión
        if ("GET".equalsIgnoreCase(metodo) &&
                (uri.startsWith("/api/admin/productos") || uri.equals("/api/admin/categorias"))) {
            return true;
        }
        
        String path = request.getRequestURI();
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.equals("/swagger-ui.html")) {
            return true;
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
        if (uri.startsWith("/api/admin/usuarios") && !"ADMINISTRADOR".equals(rol)) {
            return rechazar(response, 403, "Solo un administrador puede gestionar usuarios");
        }
        if ("VENDEDOR".equals(rol) && uri.startsWith("/api/admin/dashboard")) {
            return rechazar(response, 403, "Solo un administrador puede ver el dashboard");
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