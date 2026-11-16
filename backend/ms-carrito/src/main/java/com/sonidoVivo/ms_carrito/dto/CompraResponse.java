package com.sonidoVivo.ms_carrito.dto;

import com.sonidoVivo.ms_carrito.model.DetalleEncargo;
import com.sonidoVivo.ms_carrito.model.Encargo;

import java.util.List;

// Comprobante del encargo registrado.
public record CompraResponse(
        Long id,
        String numeroOrden,
        String estado,
        String tipoEntrega,
        int costoEntrega,
        long total,
        List<Linea> productos) {

    public record Linea(String codigo, String nombre, int precio, int cantidad, long subtotal) {
    }

    public static CompraResponse de(Encargo e) {
        List<Linea> lineas = e.getDetalles().stream().map(CompraResponse::linea).toList();
        return new CompraResponse(e.getId(), e.getNumeroOrden(), e.getEstado(), e.getTipoEntrega(),
                e.getCostoEntrega(), e.getTotal(), lineas);
    }

    private static Linea linea(DetalleEncargo d) {
        return new Linea(d.getProducto().getCodigo(), d.getProducto().getNombre(),
                d.getPrecioUnitario(), d.getCantidad(), (long) d.getPrecioUnitario() * d.getCantidad());
    }
}
