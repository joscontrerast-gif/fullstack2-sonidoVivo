package cl.sonidovivo.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import cl.sonidovivo.auth.entity.Rol;
import cl.sonidovivo.auth.entity.Usuario;
import cl.sonidovivo.auth.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRETO = "una-clave-de-prueba-de-al-menos-32-caracteres";

    private Usuario usuario() {
        Rol rol = new Rol();
        rol.setId(1L);
        rol.setNombre("CLIENTE");
        Usuario u = new Usuario();
        u.setId(7L);
        u.setNombre("Ana");
        u.setCorreo("ana@correo.cl");
        u.setRol(rol);
        return u;
    }

    @Test
    void generaYValidaUnToken() {
        JwtService servicio = new JwtService(SECRETO, 5);
        Claims claims = servicio.validar(servicio.generar(usuario()));
        assertEquals("7", claims.getSubject());
        assertEquals("CLIENTE", claims.get("rol", String.class));
        assertEquals("ana@correo.cl", claims.get("correo", String.class));
    }

    @Test
    void rechazaUnTokenAdulterado() {
        JwtService servicio = new JwtService(SECRETO, 5);
        String token = servicio.generar(usuario());
        assertThrows(JwtException.class, () -> servicio.validar(token + "x"));
    }

    @Test
    void rechazaUnTokenFirmadoConOtraClave() {
        String ajeno = new JwtService("otra-clave-distinta-de-al-menos-32-caracteres", 5).generar(usuario());
        assertThrows(JwtException.class, () -> new JwtService(SECRETO, 5).validar(ajeno));
    }

    @Test
    void rechazaUnaClaveCorta() {
        assertThrows(IllegalStateException.class, () -> new JwtService("corta", 5));
    }
}
