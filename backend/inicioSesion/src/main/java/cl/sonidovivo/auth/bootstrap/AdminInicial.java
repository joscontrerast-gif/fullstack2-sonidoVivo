package cl.sonidovivo.auth.bootstrap;

import cl.sonidovivo.auth.entity.Rol;
import cl.sonidovivo.auth.entity.Usuario;
import cl.sonidovivo.auth.repository.RolRepository;
import cl.sonidovivo.auth.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea el primer administrador al arrancar, solo si defines ADMIN_CORREO y ADMIN_PASSWORD
 * y ese correo todavía no existe. Así no hay que calcular el hash BCrypt a mano.
 */
@Component
public class AdminInicial implements CommandLineRunner {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PasswordEncoder encoder;
    private final String correo;
    private final String password;

    public AdminInicial(UsuarioRepository usuarios, RolRepository roles, PasswordEncoder encoder,
                        @Value("${sonidovivo.admin-inicial.correo:}") String correo,
                        @Value("${sonidovivo.admin-inicial.password:}") String password) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.encoder = encoder;
        this.correo = correo;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (correo.isBlank() || password.isBlank()) {
            return;
        }
        String correoNormal = correo.trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByCorreo(correoNormal)) {
            return;
        }
        Rol rol = roles.findByNombre("ADMINISTRADOR").orElse(null);
        if (rol == null) {
            return;
        }
        Usuario u = new Usuario();
        u.setNombre("Administrador");
        u.setCorreo(correoNormal);
        u.setPasswordHash(encoder.encode(password));
        u.setRol(rol);
        u.setEstado("ACTIVO");
        usuarios.save(u);
    }
}
