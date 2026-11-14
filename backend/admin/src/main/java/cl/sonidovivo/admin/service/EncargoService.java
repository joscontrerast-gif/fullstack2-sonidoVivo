package cl.sonidovivo.admin.service;

import cl.sonidovivo.admin.dto.EncargoDto;
import cl.sonidovivo.admin.entity.Comuna;
import cl.sonidovivo.admin.entity.DetalleEncargo;
import cl.sonidovivo.admin.entity.Encargo;
import cl.sonidovivo.admin.entity.Producto;
import cl.sonidovivo.admin.repository.ComunaRepository;
import cl.sonidovivo.admin.repository.EncargoRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EncargoService {

    private static final Set<String> ESTADOS = Set.of("PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO");

    private final EncargoRepository encargos;
    private final ComunaRepository comunas;

    public EncargoService(EncargoRepository encargos, ComunaRepository comunas) {
        this.encargos = encargos;
        this.comunas = comunas;
    }

    @Transactional(readOnly = true)
    public List<EncargoDto> listar(String estado) {
        String codigo = estado == null || estado.isBlank() ? null : Traducciones.codigo(estado);
        Map<Long, String> nombres = nombresComunas();
        return encargos.listarConDetalles().stream()
                .filter(e -> codigo == null || e.getEstado().equals(codigo))
                .map(e -> dto(e, nombres))
                .toList();
    }

    @Transactional(readOnly = true)
    public EncargoDto obtener(Long id) {
        return dto(buscar(id), nombresComunas());
    }

    /**
     * Cambia el estado. Un encargo Completado o Cancelado ya no cambia.
     * Al cancelar se devuelve el stock de cada producto del pedido.
     */
    @Transactional
    public EncargoDto cambiarEstado(Long id, String estadoTexto) {
        Encargo e = buscar(id);
        String nuevo = Traducciones.codigo(estadoTexto);
        if (!ESTADOS.contains(nuevo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado no es válido");
        }
        String actual = e.getEstado();
        if (actual.equals(nuevo)) {
            return dto(e, nombresComunas());
        }
        if ("CANCELADO".equals(actual) || "COMPLETADO".equals(actual)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un encargo " + Traducciones.texto(actual).toLowerCase() + " ya no puede cambiar de estado");
        }
        if ("CANCELADO".equals(nuevo)) {
            for (DetalleEncargo d : e.getDetalles()) {
                Producto p = d.getProducto();
                p.setStock(p.getStock() + d.getCantidad());
            }
        }
        e.setEstado(nuevo);
        return dto(e, nombresComunas());
    }

    private Encargo buscar(Long id) {
        return encargos.buscarConDetalles(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Encargo no encontrado"));
    }

    private Map<Long, String> nombresComunas() {
        return comunas.findAll().stream().collect(Collectors.toMap(Comuna::getId, Comuna::getNombre, (a, b) -> a));
    }

    private EncargoDto dto(Encargo e, Map<Long, String> nombresComunas) {
        List<EncargoDto.Item> items = e.getDetalles().stream()
                .map(d -> new EncargoDto.Item(d.getProducto().getCodigo(), d.getProducto().getNombre(),
                        d.getCantidad(), d.getPrecioUnitario(),
                        d.getSubtotal() != null ? d.getSubtotal() : (long) d.getCantidad() * d.getPrecioUnitario()))
                .toList();
        return new EncargoDto(e.getId(), e.getNumeroOrden(), e.getClienteNombre(), e.getClienteCorreo(),
                e.getFecha(), Traducciones.texto(e.getEstado()), Traducciones.entrega(e.getTipoEntrega()),
                e.getCostoEntrega(), e.getDireccionEnvio(),
                e.getIdComunaEnvio() == null ? null : nombresComunas.get(e.getIdComunaEnvio()),
                e.getTotal(), items);
    }
}
