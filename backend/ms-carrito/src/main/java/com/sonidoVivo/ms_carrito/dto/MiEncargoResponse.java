package com.sonidoVivo.ms_carrito.dto;

import com.sonidoVivo.ms_carrito.model.Encargo;

import java.time.LocalDateTime;
import java.util.List;

// Un encargo tal como lo ve el cliente en "Mis encargos".
public record MiEncargoResponse(
        Long id,
        String numeroOrden,
        LocalDateTime fecha,
        String estado,
        String tipoEntrega,
        int costoEntrega,
        String direccionEnvio,
        String comuna,
        long total,
        List<CompraResponse.Linea> productos) {

    public static MiEncargoResponse de(Encargo e, String comuna) {
        CompraResponse base = CompraResponse.de(e);
        return new MiEncargoResponse(e.getId(), e.getNumeroOrden(), e.getFecha(), e.getEstado(),
                e.getTipoEntrega(), e.getCostoEntrega(), e.getDireccionEnvio(), comuna,
                e.getTotal(), base.productos());
    }
}
