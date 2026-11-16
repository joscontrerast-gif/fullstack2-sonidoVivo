package com.sonidoVivo.ms_carrito.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Datos de entrega del checkout. Los productos salen del carrito guardado del usuario.
public class CompraRequest {

    @NotBlank(message = "La dirección es obligatoria.")
    @Size(min = 5, max = 300, message = "La dirección debe tener entre 5 y 300 caracteres.")
    private String direccion;

    @NotBlank(message = "La comuna es obligatoria.")
    @Size(max = 100, message = "La comuna admite hasta 100 caracteres.")
    private String comuna;

    // estandar | express | retiro (si no viene, se usa estandar)
    private String entrega;

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }
    public String getEntrega() { return entrega; }
    public void setEntrega(String entrega) { this.entrega = entrega; }
}
