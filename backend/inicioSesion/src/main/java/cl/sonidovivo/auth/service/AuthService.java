package cl.sonidovivo.auth.service;

import cl.sonidovivo.auth.dto.LoginRequest;
import cl.sonidovivo.auth.dto.LoginResponse;
import cl.sonidovivo.auth.dto.RegistroRequest;
import cl.sonidovivo.auth.dto.UsuarioDto;
import cl.sonidovivo.auth.entity.Rol;
import cl.sonidovivo.auth.entity.Usuario;
import cl.sonidovivo.auth.repository.ComunaRepository;
import cl.sonidovivo.auth.repository.RolRepository;
import cl.sonidovivo.auth.repository.UsuarioRepository;
import cl.sonidovivo.auth.security.JwtService;
import io.jsonwebtoken.JwtException;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final ComunaRepository comunas;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, RolRepository roles, ComunaRepository comunas,
                       PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.comunas = comunas;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /** Registro público: siempre crea un cliente. Los empleados los crea un administrador. */
    @Transactional
    public UsuarioDto registrar(RegistroRequest r) {
        String correo = r.correo().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByCorreo(correo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }
        String run = Rut.normalizar(r.run());
        if (run != null && usuarios.existsByRun(run)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese RUN");
        }
        if (r.idComuna() != null && !comunas.existsById(r.idComuna())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La comuna indicada no existe");
        }
        Rol rol = roles.findByNombre("CLIENTE").orElseThrow(() ->
                new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falta el rol CLIENTE en la base de datos"));

        Usuario u = new Usuario();
        u.setRun(run);
        u.setNombre(r.nombre().trim());
        u.setApellidos(r.apellidos() == null ? null : r.apellidos().trim());
        u.setCorreo(correo);
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRol(rol);
        u.setIdComuna(r.idComuna());
        u.setDireccion(r.direccion() == null || r.direccion().isBlank() ? null : r.direccion().trim());
        u.setEstado("ACTIVO");
        return UsuarioDto.de(usuarios.save(u));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest r) {
        Usuario u = usuarios.findByCorreo(r.correo().trim().toLowerCase(Locale.ROOT))
                .filter(x -> encoder.matches(r.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        if (!"ACTIVO".equals(u.getEstado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta está inactiva");
        }
        return new LoginResponse(jwt.generar(u), "Bearer", jwt.getExpiracionSegundos(), UsuarioDto.de(u));
    }

    /** Devuelve el usuario dueño del token (cabecera "Authorization: Bearer ..."). */
    @Transactional(readOnly = true)
    public UsuarioDto actual(String cabecera) {
        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Falta el token de acceso");
        }
        try {
            Long id = Long.valueOf(jwt.validar(cabecera.substring(7)).getSubject());
            Usuario u = usuarios.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "El usuario ya no existe"));
            if (!"ACTIVO".equals(u.getEstado())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta está inactiva");
            }
            return UsuarioDto.de(u);
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido o expirado");
        }
    }
}
