package cl.sonidovivo.admin.service;

import cl.sonidovivo.admin.dto.UsuarioDto;
import cl.sonidovivo.admin.dto.UsuarioRequest;
import cl.sonidovivo.admin.entity.Comuna;
import cl.sonidovivo.admin.entity.Region;
import cl.sonidovivo.admin.entity.Rol;
import cl.sonidovivo.admin.entity.Usuario;
import cl.sonidovivo.admin.repository.ComunaRepository;
import cl.sonidovivo.admin.repository.RegionRepository;
import cl.sonidovivo.admin.repository.RolRepository;
import cl.sonidovivo.admin.repository.UsuarioRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

    private static final Set<String> ROLES = Set.of("CLIENTE", "VENDEDOR", "ADMINISTRADOR");
    private static final Set<String> ESTADOS = Set.of("ACTIVO", "INACTIVO");

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final ComunaRepository comunas;
    private final RegionRepository regiones;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, RolRepository roles, ComunaRepository comunas,
                          RegionRepository regiones, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.comunas = comunas;
        this.regiones = regiones;
        this.encoder = encoder;
    }

    /** grupo: "clientes", "empleados" o vacío para todos. */
    @Transactional(readOnly = true)
    public List<UsuarioDto> listar(String grupo) {
        String g = grupo == null ? "" : grupo.trim().toLowerCase(Locale.ROOT);
        List<Usuario> lista = switch (g) {
            case "clientes" -> usuarios.findByRol_NombreOrderByNombreAsc("CLIENTE");
            case "empleados" -> usuarios.findByRol_NombreNotOrderByNombreAsc("CLIENTE");
            default -> usuarios.findAll(Sort.by("nombre"));
        };
        Map<Long, Comuna> mapaComunas = comunas.findAll().stream().collect(Collectors.toMap(Comuna::getId, Function.identity()));
        Map<Long, Region> mapaRegiones = regiones.findAll().stream().collect(Collectors.toMap(Region::getId, Function.identity()));
        return lista.stream().map(u -> dto(u, mapaComunas, mapaRegiones)).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtener(Long id) {
        return dtoIndividual(buscar(id));
    }

    @Transactional
    public UsuarioDto crear(UsuarioRequest r) {
        if (r.password() == null || r.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria");
        }
        validarPassword(r.password());
        String correo = r.correo().trim().toLowerCase(Locale.ROOT);
        String run = Rut.normalizar(r.run());
        if (usuarios.findByCorreo(correo).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
        }
        if (run != null && usuarios.findByRun(run).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese RUN");
        }
        Usuario u = new Usuario();
        u.setCorreo(correo);
        u.setRun(run);
        u.setPasswordHash(encoder.encode(r.password()));
        aplicar(u, r);
        return dtoIndividual(usuarios.save(u));
    }

    @Transactional
    public UsuarioDto actualizar(Long id, UsuarioRequest r, Long idQuienEdita) {
        Usuario u = buscar(id);
        String correo = r.correo().trim().toLowerCase(Locale.ROOT);
        String run = Rut.normalizar(r.run());
        if (usuarios.findByCorreo(correo).filter(o -> !o.getId().equals(id)).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
        }
        if (run != null && usuarios.findByRun(run).filter(o -> !o.getId().equals(id)).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese RUN");
        }
        String rolNuevo = Traducciones.codigo(r.tipo());
        String estadoNuevo = r.estado() == null || r.estado().isBlank() ? "ACTIVO" : Traducciones.codigo(r.estado());
        if (id.equals(idQuienEdita)
                && (!rolNuevo.equals(u.getRol().getNombre()) || !"ACTIVO".equals(estadoNuevo))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No puedes cambiar tu propio rol ni desactivar tu propia cuenta");
        }
        if (r.password() != null && !r.password().isBlank()) {
            validarPassword(r.password());
            u.setPasswordHash(encoder.encode(r.password()));
        }
        u.setCorreo(correo);
        u.setRun(run);
        aplicar(u, r);
        return dtoIndividual(u);
    }

    private Usuario buscar(Long id) {
        return usuarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private void aplicar(Usuario u, UsuarioRequest r) {
        String rolCodigo = Traducciones.codigo(r.tipo());
        if (!ROLES.contains(rolCodigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tipo de usuario no es válido");
        }
        Rol rol = roles.findByNombre(rolCodigo).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falta el rol " + rolCodigo + " en la base de datos"));
        String estado = r.estado() == null || r.estado().isBlank() ? "ACTIVO" : Traducciones.codigo(r.estado());
        if (!ESTADOS.contains(estado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado no es válido");
        }
        if (r.idComuna() != null && !comunas.existsById(r.idComuna())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La comuna indicada no existe");
        }
        u.setNombre(r.nombre().trim());
        u.setApellidos(r.apellidos() == null || r.apellidos().isBlank() ? null : r.apellidos().trim());
        u.setRol(rol);
        u.setEstado(estado);
        u.setIdComuna(r.idComuna());
        u.setDireccion(r.direccion() == null || r.direccion().isBlank() ? null : r.direccion().trim());
    }

    private void validarPassword(String password) {
        if (password.length() < 6 || password.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener entre 6 y 20 caracteres");
        }
    }

    private UsuarioDto dtoIndividual(Usuario u) {
        Map<Long, Comuna> mapaComunas = u.getIdComuna() == null ? Map.of()
                : comunas.findById(u.getIdComuna()).map(c -> Map.of(c.getId(), c)).orElse(Map.of());
        Map<Long, Region> mapaRegiones = regiones.findAll().stream().collect(Collectors.toMap(Region::getId, Function.identity()));
        return dto(u, mapaComunas, mapaRegiones);
    }

    private UsuarioDto dto(Usuario u, Map<Long, Comuna> mapaComunas, Map<Long, Region> mapaRegiones) {
        Comuna comuna = u.getIdComuna() == null ? null : mapaComunas.get(u.getIdComuna());
        Region region = comuna == null ? null : mapaRegiones.get(comuna.getIdRegion());
        return new UsuarioDto(u.getId(), u.getRun(), u.getNombre(), u.getApellidos(), u.getCorreo(),
                Traducciones.texto(u.getRol().getNombre()),
                region == null ? null : region.getId(), region == null ? null : region.getNombre(),
                comuna == null ? null : comuna.getId(), comuna == null ? null : comuna.getNombre(),
                u.getDireccion(), Traducciones.texto(u.getEstado()), u.getFechaRegistro());
    }
}
