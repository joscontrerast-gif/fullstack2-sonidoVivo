package cl.sonidovivo.admin.controller;

import cl.sonidovivo.admin.dto.ProductoPublicoDto;
import cl.sonidovivo.admin.service.ProductoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Catálogo público de la tienda (sin token): solo productos activos. */
@RestController
@RequestMapping("/api/productos")
public class CatalogoController {

    private final ProductoService servicio;

    public CatalogoController(ProductoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<ProductoPublicoDto> listar() {
        return servicio.listarPublico();
    }

    @GetMapping("/{codigo}")
    public ProductoPublicoDto obtener(@PathVariable String codigo) {
        return servicio.obtenerPublico(codigo);
    }
}
