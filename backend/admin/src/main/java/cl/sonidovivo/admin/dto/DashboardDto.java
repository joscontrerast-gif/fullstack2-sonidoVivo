package cl.sonidovivo.admin.dto;

import java.util.List;
import java.util.Map;

public record DashboardDto(long productosActivos, long totalClientes, long totalEmpleados,
                           long totalEncargos, long ventasCompletadas,
                           Map<String, Long> encargosPorEstado, List<ProductoDto> stockCritico) {
}
