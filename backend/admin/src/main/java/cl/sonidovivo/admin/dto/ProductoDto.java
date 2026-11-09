package cl.sonidovivo.admin.dto;

import cl.sonidovivo.admin.entity.Producto;
import java.time.LocalDate;

public record ProductoDto(String codigo, String nombre, String categoria, String marca, String modelo,
                          String descripcion, Integer precio, Integer stock, Integer stockCritico,
                          LocalDate fechaIngreso, boolean activo) {

    public static ProductoDto de(Producto p) {
        return new ProductoDto(p.getCodigo(), p.getNombre(), p.getCategoria().getNombre(), p.getMarca(),
                p.getModelo(), p.getDescripcion(), p.getPrecio(), p.getStock(), p.getStockCritico(),
                p.getFechaIngreso(), Integer.valueOf(1).equals(p.getActivo()));
    }
}
