package cl.sonidovivo.admin.controller;

import cl.sonidovivo.admin.dto.UsuarioDto;
import cl.sonidovivo.admin.dto.UsuarioRequest;
import cl.sonidovivo.admin.security.AuthInterceptor;
import cl.sonidovivo.admin.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Clientes y empleados (solo ADMINISTRADOR; lo exige el interceptor). */
@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuarioController {

    private final UsuarioService servicio;

    public UsuarioController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<UsuarioDto> listar(@RequestParam(required = false) String grupo) {
        return servicio.listar(grupo);
    }

    @GetMapping("/{id}")
    public UsuarioDto obtener(@PathVariable Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto crear(@Valid @RequestBody UsuarioRequest r) {
        return servicio.crear(r);
    }

    @PutMapping("/{id}")
    public UsuarioDto actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest r,
                                 @RequestAttribute(AuthInterceptor.ATTR_USUARIO_ID) Long idQuienEdita) {
        return servicio.actualizar(id, r, idQuienEdita);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id,
                         @RequestAttribute(AuthInterceptor.ATTR_USUARIO_ID) Long idQuienElimina) {
        servicio.eliminar(id, idQuienElimina);
    }
}
