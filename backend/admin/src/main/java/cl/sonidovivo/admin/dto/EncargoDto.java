package cl.sonidovivo.admin.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EncargoDto(Long id, String numeroOrden, String cliente, String correo, LocalDateTime fecha,
                         String estado, String tipoEntrega, Integer costoEntrega, String direccionEnvio,
                         String comunaEnvio, Long total, List<Item> items) {

    public record Item(String codigo, String nombre, Integer cantidad, Integer precioUnitario, Long subtotal) {
    }
}
