package com.sonidoVivo.ms_carrito.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ItemRequest {

    @NotBlank(message = "El código del producto es obligatorio.")
    private String codigo;

    @Min(value = 1, message = "La cantidad debe ser al menos 1.")
    private Integer cantidad; // opcional: si no viene, se agrega 1

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
