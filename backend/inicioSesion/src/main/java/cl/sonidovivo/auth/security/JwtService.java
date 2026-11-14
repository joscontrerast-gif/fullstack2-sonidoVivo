package cl.sonidovivo.auth.security;

import cl.sonidovivo.auth.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Crea y valida los tokens JWT (firma HS256 con una clave compartida con admin-service). */
@Component
public class JwtService {

    private final SecretKey clave;
    private final long expiracionMinutos;

    public JwtService(@Value("${sonidovivo.jwt.secret}") String secreto,
                      @Value("${sonidovivo.jwt.expiracion-minutos:120}") long expiracionMinutos) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.expiracionMinutos = expiracionMinutos;
    }

    public String generar(Usuario u) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(u.getId()))
                .claim("correo", u.getCorreo())
                .claim("nombre", u.getNombre())
                .claim("rol", u.getRol().getNombre())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusSeconds(expiracionMinutos * 60)))
                .signWith(clave)
                .compact();
    }

    /** Lanza JwtException si el token es inválido, está adulterado o expiró. */
    public Claims validar(String token) {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }

    public long getExpiracionSegundos() {
        return expiracionMinutos * 60;
    }
}
