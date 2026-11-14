package cl.sonidovivo.admin.controller;

import cl.sonidovivo.admin.dto.CambioEstadoRequest;
import cl.sonidovivo.admin.dto.EncargoDto;
import cl.sonidovivo.admin.service.EncargoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/encargos")
public class EncargoController {

    private final EncargoService servicio;

    public EncargoController(EncargoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<EncargoDto> listar(@RequestParam(required = false) String estado) {
        return servicio.listar(estado);
    }

    @GetMapping("/{id}")
    public EncargoDto obtener(@PathVariable Long id) {
        return servicio.obtener(id);
    }

    @PatchMapping("/{id}/estado")
    public EncargoDto cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambioEstadoRequest r) {
        return servicio.cambiarEstado(id, r.estado());
    }
}
