package cl.sonidovivo.admin.controller;

import cl.sonidovivo.admin.dto.ProductoDto;
import cl.sonidovivo.admin.dto.ProductoRequest;
import cl.sonidovivo.admin.service.ProductoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class ProductoController {

    private final ProductoService servicio;

    public ProductoController(ProductoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/productos")
    public List<ProductoDto> listar(@RequestParam(defaultValue = "false") boolean todos,
                                    @RequestParam(required = false) String q,
                                    @RequestParam(required = false) String categoria) {
        return servicio.listar(todos, q, categoria);
    }

    @GetMapping("/productos/{codigo}")
    public ProductoDto obtener(@PathVariable String codigo) {
        return servicio.obtener(codigo);
    }

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoDto crear(@Valid @RequestBody ProductoRequest r) {
        return servicio.crear(r);
    }

    @PutMapping("/productos/{codigo}")
    public ProductoDto actualizar(@PathVariable String codigo, @Valid @RequestBody ProductoRequest r) {
        return servicio.actualizar(codigo, r);
    }

    @DeleteMapping("/productos/{codigo}")
    public Map<String, Object> eliminar(@PathVariable String codigo) {
        boolean eliminado = servicio.eliminar(codigo);
        return Map.of("eliminado", eliminado,
                "mensaje", eliminado ? "Producto eliminado"
                        : "El producto tiene ventas, se desactivó para conservar el historial");
    }

    @GetMapping("/categorias")
    public List<String> categorias() {
        return servicio.nombresCategorias();
    }
}
