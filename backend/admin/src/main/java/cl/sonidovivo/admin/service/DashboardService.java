package cl.sonidovivo.admin.service;

import cl.sonidovivo.admin.dto.DashboardDto;
import cl.sonidovivo.admin.dto.ProductoDto;
import cl.sonidovivo.admin.repository.EncargoRepository;
import cl.sonidovivo.admin.repository.ProductoRepository;
import cl.sonidovivo.admin.repository.UsuarioRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;
    private final EncargoRepository encargos;

    public DashboardService(ProductoRepository productos, UsuarioRepository usuarios, EncargoRepository encargos) {
        this.productos = productos;
        this.usuarios = usuarios;
        this.encargos = encargos;
    }

    @Transactional(readOnly = true)
    public DashboardDto resumen() {
        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (String codigo : List.of("PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO")) {
            porEstado.put(Traducciones.texto(codigo), 0L);
        }
        for (Object[] fila : encargos.contarPorEstado()) {
            porEstado.put(Traducciones.texto((String) fila[0]), ((Number) fila[1]).longValue());
        }
        List<ProductoDto> critico = productos.findConStockCritico().stream().map(ProductoDto::de).toList();
        long totalEncargos = porEstado.values().stream().mapToLong(Long::longValue).sum();
        Long vendido = encargos.totalVendido();
        return new DashboardDto(
                productos.countByActivo(1),
                usuarios.countByRol_Nombre("CLIENTE"),
                usuarios.countByRol_NombreNot("CLIENTE"),
                totalEncargos,
                vendido == null ? 0L : vendido,
                porEstado,
                critico);
    }
}
