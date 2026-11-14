package cl.sonidovivo.admin.dto;

import java.time.LocalDate;

import cl.sonidovivo.admin.entity.Producto;

public record ProductoDto(String codigo, String nombre, String categoria, String marca, String modelo,
                          String descripcion, String imagen, Integer precio, Integer stock, Integer stockCritico,
                          LocalDate fechaIngreso, boolean activo) {

    public static ProductoDto de(Producto p) {
        return new ProductoDto(p.getCodigo(), p.getNombre(), p.getCategoria().getNombre(), p.getMarca(),
                p.getModelo(), p.getDescripcion(), p.getImagen(), p.getPrecio(), p.getStock(), p.getStockCritico(),
                p.getFechaIngreso(), Integer.valueOf(1).equals(p.getActivo()));
    }
}