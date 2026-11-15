package cl.sonidovivo.admin.dto;

import cl.sonidovivo.admin.entity.Producto;

/** Lo que ve la tienda: no incluye el stock crítico ni datos internos. */
public record ProductoPublicoDto(String codigo, String nombre, String categoria, String marca, String modelo,
                                 String descripcion, Integer precio, Integer stock) {

    public static ProductoPublicoDto de(Producto p) {
        return new ProductoPublicoDto(p.getCodigo(), p.getNombre(), p.getCategoria().getNombre(), p.getMarca(),
                p.getModelo(), p.getDescripcion(), p.getPrecio(), p.getStock());
    }
}
